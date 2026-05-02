/**
 * Phase 1 Wave-3 smoke replay — verify Plan 02 + Plan 03 fixes end-to-end.
 *
 * Fallback approach: Jest test (per plan 05 Task 1 note — tsx module-mutation
 * is unreliable with esbuild ESM; Jest mocking is the authoritative mechanism).
 *
 * Covers:
 *   smoke_1_intk04_positive — NFRs present → nfrs_v2 status:'ready', no m2_nfr open question
 *   smoke_2_intk04_negative — NFRs absent  → nfrs_v2 status:'pending', m2_nfr question surfaced
 *   smoke_3_intk03          — outOfScope data flows through transformToValidationData
 *   db_probe                — informational; always skipped when POSTGRES_URL is stub
 */

// env stubs (FIRST, before any import)
process.env.POSTGRES_URL ??= 'postgres://stub';
process.env.AUTH_SECRET ??= 'stub-auth-secret-at-least-32-chars-0000';
process.env.STRIPE_SECRET_KEY ??= 'sk_test_stub';
process.env.STRIPE_WEBHOOK_SECRET ??= 'whsec_stub';
process.env.OPENROUTER_API_KEY ??= 'sk-or-stub';
process.env.BASE_URL ??= 'http://localhost:3000';

jest.mock('@/lib/langchain/agents/extraction-agent', () => ({
  extractProjectData: jest.fn(),
  mergeExtractionData: jest.fn(),
}));
jest.mock('../../lib/langchain/graphs/nodes/_persist-artifact', () => ({
  persistArtifact: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('@/lib/chat/system-question-bridge', () => ({
  surfaceOpenQuestion: jest.fn().mockResolvedValue(undefined),
  onOpenQuestionReply: jest.fn(),
  clearOpenQuestionReplyHandlers: jest.fn(),
  pollReplies: jest.fn(),
  SOURCE_TO_BUCKET: {},
}));

import { describe, it, expect, beforeEach } from '@jest/globals';
import { extractData } from '../../lib/langchain/graphs/nodes/extract-data';
import { transformToValidationData } from '../../lib/langchain/graphs/nodes/check-prd-spec';
import { extractProjectData, mergeExtractionData } from '@/lib/langchain/agents/extraction-agent';
import { persistArtifact } from '../../lib/langchain/graphs/nodes/_persist-artifact';
import { surfaceOpenQuestion } from '@/lib/chat/system-question-bridge';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const extractionWithNfrs = {
  actors: [{ name: 'Admin', role: 'admin', description: '' }],
  useCases: [],
  systemBoundaries: { internal: ['Token gen'], external: [], inScope: undefined as string[] | undefined, outOfScope: undefined as string[] | undefined },
  dataEntities: [],
  nonFunctionalRequirements: [{ id: 'N1', description: 'Response time under 200ms', priority: 'high', category: 'performance' }],
};

const extractionWithoutNfrs = {
  actors: [],
  useCases: [],
  systemBoundaries: { internal: [], external: [], inScope: undefined as string[] | undefined, outOfScope: undefined as string[] | undefined },
  dataEntities: [],
  nonFunctionalRequirements: [],
};

const baseState = {
  projectId: 1,
  projectName: 'Test',
  projectVision: 'A test project',
  messages: [{ role: 'user' as const, content: 'I need a user auth system with SSO' }],
  extractedData: null as any,
  completeness: 0,
};

beforeEach(() => {
  jest.clearAllMocks();
  (mergeExtractionData as jest.Mock).mockImplementation((_e: unknown, n: unknown) => n);
});

// ─── smoke_1_intk04_positive ──────────────────────────────────────────────────

describe('smoke_1_intk04_positive — NFRs present → status:ready, no m2_nfr open question', () => {
  it('nfrs_v2 artifact persisted with status ready when nonFunctionalRequirements is non-empty', async () => {
    (extractProjectData as jest.Mock).mockResolvedValueOnce(extractionWithNfrs);
    (mergeExtractionData as jest.Mock).mockReturnValueOnce(extractionWithNfrs);

    await extractData(baseState as any);

    const nfrsCall = (persistArtifact as jest.Mock).mock.calls.find(
      (call: unknown[]) => (call[0] as any)?.kind === 'nfrs_v2'
    );
    expect(nfrsCall).toBeDefined();
    expect((nfrsCall![0] as any).status).toBe('ready');
  });

  it('m2_nfr open question NOT surfaced when nonFunctionalRequirements is non-empty', async () => {
    (extractProjectData as jest.Mock).mockResolvedValueOnce(extractionWithNfrs);
    (mergeExtractionData as jest.Mock).mockReturnValueOnce(extractionWithNfrs);

    await extractData(baseState as any);

    const nfrQuestions = (surfaceOpenQuestion as jest.Mock).mock.calls.filter(
      (call: unknown[]) => (call[0] as any)?.source === 'm2_nfr'
    );
    expect(nfrQuestions).toHaveLength(0);
  });
});

// ─── smoke_2_intk04_negative ──────────────────────────────────────────────────

describe('smoke_2_intk04_negative — NFRs absent → status:pending, m2_nfr question surfaced', () => {
  it('nfrs_v2 artifact persisted with status pending when nonFunctionalRequirements is empty', async () => {
    (extractProjectData as jest.Mock).mockResolvedValueOnce(extractionWithoutNfrs);
    (mergeExtractionData as jest.Mock).mockReturnValueOnce(extractionWithoutNfrs);

    await extractData(baseState as any);

    const nfrsCall = (persistArtifact as jest.Mock).mock.calls.find(
      (call: unknown[]) => (call[0] as any)?.kind === 'nfrs_v2'
    );
    expect(nfrsCall).toBeDefined();
    expect((nfrsCall![0] as any).status).toBe('pending');
  });

  it('m2_nfr open question IS surfaced when nonFunctionalRequirements is empty', async () => {
    (extractProjectData as jest.Mock).mockResolvedValueOnce(extractionWithoutNfrs);
    (mergeExtractionData as jest.Mock).mockReturnValueOnce(extractionWithoutNfrs);

    await extractData(baseState as any);

    const nfrQuestions = (surfaceOpenQuestion as jest.Mock).mock.calls.filter(
      (call: unknown[]) => (call[0] as any)?.source === 'm2_nfr'
    );
    expect(nfrQuestions.length).toBeGreaterThanOrEqual(1);
  });
});

// ─── smoke_3_intk03 ───────────────────────────────────────────────────────────

describe('smoke_3_intk03 — outOfScope + inScope flow through transformToValidationData', () => {
  it('real outOfScope data preserved — not discarded as hardcoded []', () => {
    const state = {
      ...baseState,
      extractedData: {
        actors: [],
        useCases: [],
        dataEntities: [],
        systemBoundaries: {
          internal: ['Token gen'],
          external: [],
          inScope: undefined,
          outOfScope: ['Mobile clients', 'Billing integration'],
        },
        nonFunctionalRequirements: [],
        problemStatement: '',
        goalsMetrics: [],
        projectType: 'saas',
      },
    };

    const result = transformToValidationData(state as any);
    expect(result.systemBoundaries.outOfScope).toEqual(['Mobile clients', 'Billing integration']);
  });

  it('inScope falls back to internal when extractedData.systemBoundaries.inScope is absent', () => {
    const state = {
      ...baseState,
      extractedData: {
        actors: [],
        useCases: [],
        dataEntities: [],
        systemBoundaries: {
          internal: ['Token gen', 'Auth registry'],
          external: [],
          inScope: undefined,
          outOfScope: undefined,
        },
        nonFunctionalRequirements: [],
        problemStatement: '',
        goalsMetrics: [],
        projectType: 'saas',
      },
    };

    const result = transformToValidationData(state as any);
    expect(result.systemBoundaries.inScope).toEqual(['Token gen', 'Auth registry']);
  });
});

// ─── db_probe (informational only — always skipped in stub env) ───────────────

describe('db_probe — informational, non-blocking', () => {
  it('skips gracefully when POSTGRES_URL is stub', () => {
    const isStub = !process.env.POSTGRES_URL || /stub/i.test(process.env.POSTGRES_URL);
    // When running with stub env (the default in CI and local test runs), probe is skipped.
    // This test just documents that the probe is best-effort and never fails the suite.
    expect(isStub).toBe(true); // running against stub: db_probe = skipped
  });
});
