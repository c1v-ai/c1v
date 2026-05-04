// env stubs MUST be the very first lines before any import.
// lib/config/env.ts validates shape at import time.
process.env.POSTGRES_URL ??= 'postgres://stub';
process.env.AUTH_SECRET ??= 'stub-auth-secret-at-least-32-chars-0000';
process.env.STRIPE_SECRET_KEY ??= 'sk_test_stub';
process.env.STRIPE_WEBHOOK_SECRET ??= 'whsec_stub';
process.env.OPENROUTER_API_KEY ??= 'sk-or-stub';
process.env.BASE_URL ??= 'http://localhost:3000';

// Module mocks — declared before imports so Jest hoists them.
// Avoids pulling postgres-js / drizzle into the import graph.
jest.mock('@/lib/langchain/agents/extraction-agent', () => ({
  extractProjectData: jest.fn(),
  mergeExtractionData: jest.fn(),
}));
jest.mock('@/lib/langchain/graphs/nodes/_persist-artifact', () => ({
  persistArtifact: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('@/lib/chat/system-question-bridge', () => ({
  surfaceOpenQuestion: jest.fn().mockResolvedValue(undefined),
}));

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { detectExtractionGuards, extractData } from '../extract-data';
import type { IntakeState } from '../../types';
import type { ExtractionResult } from '../../../schemas';

const { surfaceOpenQuestion } = jest.requireMock('@/lib/chat/system-question-bridge') as { surfaceOpenQuestion: jest.Mock };
const { persistArtifact } = jest.requireMock('@/lib/langchain/graphs/nodes/_persist-artifact') as { persistArtifact: jest.Mock };

// Minimal helpers ----------------------------------------------------------

function makeState(over: Partial<IntakeState> = {}): IntakeState {
  return {
    messages: [],
    extractedData: {
      actors: [],
      useCases: [],
      systemBoundaries: { internal: [], external: [] },
      dataEntities: [],
      goalsMetrics: [],
      nonFunctionalRequirements: [],
    } as unknown as IntakeState['extractedData'],
    completeness: 0,
    artifactReadiness: {} as IntakeState['artifactReadiness'],
    currentKBStep: 'context-diagram',
    projectName: 'Test',
    projectVision: '',
    generatedArtifacts: [],
    ...over,
  } as IntakeState;
}

function makeData(over: Partial<ExtractionResult> = {}): ExtractionResult {
  return {
    actors: [],
    useCases: [],
    systemBoundaries: { internal: [], external: [] },
    dataEntities: [],
    goalsMetrics: [],
    nonFunctionalRequirements: [],
    ...over,
  } as unknown as ExtractionResult;
}

// Tests --------------------------------------------------------------------

describe('detectExtractionGuards', () => {
  it('flags phase_leak when NFRs are extracted at context-diagram step', () => {
    const state = makeState({ currentKBStep: 'context-diagram' });
    const data = makeData({
      nonFunctionalRequirements: [
        { id: 'NFR1', category: 'performance', requirement: 'p95 < 1s' },
      ] as unknown as ExtractionResult['nonFunctionalRequirements'],
    });
    const guards = detectExtractionGuards(state, data);
    const kinds = guards.map(g => g.kind);
    expect(kinds).toContain('phase_leak');
    expect(guards.find(g => g.kind === 'phase_leak')?.detail).toMatch(/NFRs/);
  });

  it('flags phase_leak when goals are extracted at context-diagram step', () => {
    const state = makeState({ currentKBStep: 'context-diagram' });
    const data = makeData({
      goalsMetrics: [
        { id: 'G1', description: 'reduce churn' },
      ] as unknown as ExtractionResult['goalsMetrics'],
    });
    const guards = detectExtractionGuards(state, data);
    expect(guards.find(g => g.kind === 'phase_leak')?.detail).toMatch(/goals/);
  });

  it('flags fabrication when actor count >> user word count on short input', () => {
    const state = makeState({
      messages: [new HumanMessage('an AI meal planner')], // 4 words
    });
    const data = makeData({
      actors: Array.from({ length: 12 }, (_, i) => ({
        name: `Actor${i}`,
        role: 'Primary',
        description: 'x',
      })) as unknown as ExtractionResult['actors'],
    });
    const guards = detectExtractionGuards(state, data);
    const fab = guards.find(g => g.kind === 'fabrication');
    expect(fab).toBeDefined();
    expect(fab?.detail).toMatch(/12 actors from 4 user-words/);
  });

  it('returns [] when state is clean (matching phase, sane actor count)', () => {
    const state = makeState({
      currentKBStep: 'use-case-diagram', // not context-diagram
      messages: [
        new HumanMessage(
          'I want to build a system where admins manage users and reviewers approve content. ' +
          'There is also an API consumer.',
        ),
        new AIMessage('Got it.'),
      ],
    });
    const data = makeData({
      actors: [
        { name: 'Admin', role: 'Primary', description: 'x' },
        { name: 'Reviewer', role: 'Primary', description: 'x' },
      ] as unknown as ExtractionResult['actors'],
      // NFRs/goals are fine post-context-diagram
      nonFunctionalRequirements: [
        { id: 'NFR1', category: 'performance', requirement: 'p95 < 1s' },
      ] as unknown as ExtractionResult['nonFunctionalRequirements'],
    });
    const guards = detectExtractionGuards(state, data);
    expect(guards).toEqual([]);
  });

  it('does not flag fabrication when user input is long enough', () => {
    const longInput = Array.from({ length: 40 }, (_, i) => `word${i}`).join(' ');
    const state = makeState({
      currentKBStep: 'use-case-diagram',
      messages: [new HumanMessage(longInput)],
    });
    const data = makeData({
      actors: Array.from({ length: 12 }, (_, i) => ({
        name: `Actor${i}`,
        role: 'Primary',
        description: 'x',
      })) as unknown as ExtractionResult['actors'],
    });
    const guards = detectExtractionGuards(state, data);
    expect(guards.find(g => g.kind === 'fabrication')).toBeUndefined();
  });
});

// ============================================================
// T0 — NFR/constants contract-pin phase gate
// ============================================================

describe('emitNfrContractEnvelope phase-gate (T0)', () => {
  const { extractProjectData, mergeExtractionData } = jest.requireMock(
    '@/lib/langchain/agents/extraction-agent',
  ) as { extractProjectData: jest.Mock; mergeExtractionData: jest.Mock };

  beforeEach(() => {
    surfaceOpenQuestion.mockClear();
    persistArtifact.mockClear();
    extractProjectData.mockClear();
    mergeExtractionData.mockClear();
  });

  function makeContextDiagramState(over: Partial<IntakeState> = {}): IntakeState {
    return makeState({
      currentKBStep: 'context-diagram',
      projectId: 'proj-test',
      messages: [new HumanMessage('I want to build a meal planner app.')],
      ...over,
    });
  }

  it('Test A — context-diagram + incomplete data: no surfaceOpenQuestion or persistArtifact', async () => {
    // hasCompleteData = false → extraction path; mock returns null so we preserve state
    extractProjectData.mockResolvedValueOnce(null);

    const state = makeContextDiagramState();
    await extractData(state);

    expect(surfaceOpenQuestion).not.toHaveBeenCalled();
    expect(persistArtifact).not.toHaveBeenCalled();
  });

  it('Test B — context-diagram + complete data: no surfaceOpenQuestion or persistArtifact', async () => {
    // hasCompleteData = true → short-circuit path skips extraction, calls emitNfrContractEnvelope
    const state = makeContextDiagramState({
      extractedData: {
        actors: [{ name: 'User', role: 'Primary', description: 'x' }],
        useCases: [
          { id: 'UC1', name: 'Browse recipes', description: 'x', actors: [] },
          { id: 'UC2', name: 'Save meal plan', description: 'x', actors: [] },
        ],
        systemBoundaries: { internal: [], external: [] },
        dataEntities: [{ name: 'Recipe', description: 'x', attributes: [] }],
        goalsMetrics: [],
        nonFunctionalRequirements: [],
      } as unknown as IntakeState['extractedData'],
    });

    await extractData(state);

    expect(surfaceOpenQuestion).not.toHaveBeenCalled();
    expect(persistArtifact).not.toHaveBeenCalled();
  });
});
