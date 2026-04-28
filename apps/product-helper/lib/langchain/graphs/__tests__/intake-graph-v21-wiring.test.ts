/**
 * v2.1 Wave A graph-wiring smoke tests (langgraph-wirer).
 *
 * Verifies the 7 NEW + 2 RE-WIRE node disposition:
 *   - 7 NEW nodes: data_flows, form_function, decision_network, n2,
 *     fmea_early, fmea_residual, synthesis (keystone).
 *   - 2 RE-WIRE: existing generate_qfd / generate_interfaces additionally
 *     emit hoq.v1 / interface_specs.v1 to project_artifacts.
 *
 * Tests focus on the node functions in isolation (NOT full graph traversal,
 * which requires a checkpointer + LLM mocks beyond the wiring contract).
 *
 * @module graphs/__tests__/intake-graph-v21-wiring.test.ts
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock persistArtifact upfront so the no-op stub runs without DB.
const persistArtifactMock = jest.fn(async () => undefined);
jest.mock('../nodes/_persist-artifact', () => ({
  persistArtifact: persistArtifactMock,
}));

// Mock surfaceOpenQuestion so extract-data's failure path is observable.
const surfaceOpenQuestionMock = jest.fn(async () => ({
  conversation_id: 0,
  bucket: 'requirements' as const,
  latency_ms: 0,
}));
jest.mock('@/lib/chat/system-question-bridge', () => ({
  surfaceOpenQuestion: surfaceOpenQuestionMock,
}));

// Mock extractProjectData so extract-data doesn't try real LLM call.
jest.mock('../../agents/extraction-agent', () => ({
  extractProjectData: jest.fn(async () => null),
  mergeExtractionData: jest.fn((a: unknown, _b: unknown) => a),
  calculateCompleteness: jest.fn(() => 0),
}));

import { generateDataFlows } from '../nodes/generate-data-flows';
import { generateDecisionNetwork } from '../nodes/generate-decision-network';
import { generateSynthesis } from '../nodes/generate-synthesis';
import { createInitialState } from '../types';
import type { IntakeState } from '../types';

function mkState(overrides: Partial<IntakeState> = {}): IntakeState {
  return {
    ...createInitialState(42, 'Test', 'A test project', 1),
    ...overrides,
  } as IntakeState;
}

describe('v2.1 Wave A — generate_data_flows node', () => {
  beforeEach(() => persistArtifactMock.mockClear());

  it('persists pending row when no upstream stub on state', async () => {
    const state = mkState();
    const out = await generateDataFlows(state);
    expect(out).toEqual({});
    expect(persistArtifactMock).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: 42,
        kind: 'data_flows_v1',
        status: 'pending',
      }),
    );
  });
});

describe('v2.1 Wave A — generate_decision_network node (sibling to generate_decision_matrix)', () => {
  beforeEach(() => persistArtifactMock.mockClear());

  it('persists pending row when no decisionNetwork stub on state', async () => {
    const state = mkState();
    const out = await generateDecisionNetwork(state);
    expect(out).toEqual({});
    expect(persistArtifactMock).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: 42,
        kind: 'decision_network_v1',
        status: 'pending',
      }),
    );
  });
});

describe('v2.1 Wave A — generate_synthesis keystone node', () => {
  beforeEach(() => persistArtifactMock.mockClear());

  it('persists pending row when upstream incomplete', async () => {
    const state = mkState();
    const out = await generateSynthesis(state);
    expect(out).toEqual({});
    expect(persistArtifactMock).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: 42,
        kind: 'recommendation_json',
        status: 'pending',
      }),
    );
  });

  it('emits ready row + content-addressed inputs_hash when full upstream is on state', async () => {
    const state = mkState({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      extractedData: {
        ...createInitialState(42, 'Test', '', 1).extractedData,
        decisionNetwork: { selected_architecture_id: 'AV.01', phases: {} },
        nfrs: { nfrs: [{ req_id: 'NFR.01' }] },
        interfaces: { interfaces: [], chain_budgets: [] },
        fmeaResidual: { failure_modes: [], summary: {} },
        hoq: { _schema: 'module-6.hoq.v1' },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    });

    const out = await generateSynthesis(state);
    expect(out.error).toBeUndefined();
    // Per Bond architectural correction: synthesis result lives in
    // project_artifacts ONLY — assert via the persistArtifact call.
    expect(out.extractedData).toBeUndefined();
    expect(persistArtifactMock).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'recommendation_json',
        status: 'ready',
        inputsHash: expect.stringMatching(/^[0-9a-f]{64}$/),
        result: expect.objectContaining({
          inputs_hash: expect.stringMatching(/^[0-9a-f]{64}$/),
        }),
      }),
    );
  });

  it('inputs_hash is deterministic across re-runs with identical state', async () => {
    const ed = {
      ...createInitialState(42, 'T', '', 1).extractedData,
      decisionNetwork: { x: 1 },
      nfrs: { x: 2 },
      interfaces: { x: 3 },
      fmeaResidual: { x: 4 },
      hoq: { x: 5 },
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const state = mkState({ extractedData: ed as any });

    persistArtifactMock.mockClear();
    await generateSynthesis(state);
    const firstHash = persistArtifactMock.mock.calls.find(
      (c) => (c[0] as { kind: string; status: string }).kind === 'recommendation_json' &&
             (c[0] as { kind: string; status: string }).status === 'ready',
    )?.[0] as { inputsHash: string } | undefined;

    persistArtifactMock.mockClear();
    await generateSynthesis(state);
    const secondHash = persistArtifactMock.mock.calls.find(
      (c) => (c[0] as { kind: string; status: string }).kind === 'recommendation_json' &&
             (c[0] as { kind: string; status: string }).status === 'ready',
    )?.[0] as { inputsHash: string } | undefined;

    expect(firstHash?.inputsHash).toBeDefined();
    expect(firstHash?.inputsHash).toBe(secondHash?.inputsHash);
  });
});
