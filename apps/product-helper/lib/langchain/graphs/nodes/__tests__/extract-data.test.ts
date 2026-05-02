// env stubs MUST be the very first lines before any import.
// lib/config/env.ts validates shape at import time.
process.env.POSTGRES_URL ??= 'postgres://stub';
process.env.AUTH_SECRET ??= 'stub-auth-secret-at-least-32-chars-0000';
process.env.STRIPE_SECRET_KEY ??= 'sk_test_stub';
process.env.STRIPE_WEBHOOK_SECRET ??= 'whsec_stub';
process.env.OPENROUTER_API_KEY ??= 'sk-or-stub';
process.env.BASE_URL ??= 'http://localhost:3000';

// Module mocks — declared before imports so Jest hoists them.

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
import { extractData } from '../extract-data';
import {
  extractProjectData,
  mergeExtractionData,
} from '@/lib/langchain/agents/extraction-agent';
import { persistArtifact } from '../_persist-artifact';
import { surfaceOpenQuestion } from '@/lib/chat/system-question-bridge';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const baseState = {
  projectId: 1,
  projectName: 'Test',
  projectVision: 'A test project',
  messages: [{ role: 'user' as const, content: 'I need a user auth system with SSO' }],
  extractedData: null as any,
  completeness: 0,
};

// Extraction result WITH populated NFRs — emitOne should take the success-path.
const extractionWithNfrs = {
  actors: [{ name: 'Admin', role: 'admin', description: '' }],
  useCases: [],
  systemBoundaries: { internal: [], external: [] },
  dataEntities: [],
  nonFunctionalRequirements: [{ id: 'N1', description: 'Response time under 200ms' }],
};

// Extraction result WITHOUT NFRs — emitOne should take the null-path.
const extractionWithoutNfrs = {
  actors: [],
  useCases: [],
  systemBoundaries: { internal: [], external: [] },
  dataEntities: [],
  nonFunctionalRequirements: [],
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('emitNfrContractEnvelope via extractData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (mergeExtractionData as jest.Mock).mockImplementation((_e: unknown, n: unknown) => n);
  });

  // TEST 1 — RED (INTK-04): surfaceOpenQuestion must NOT be called for nfr
  // kind when nonFunctionalRequirements is non-empty.
  // FAILS before fix: emitNfrContractEnvelope reads ed['nfrs'] which is always
  // undefined, so it always takes the null-path and calls surfaceOpenQuestion.
  it('does NOT surface m2_nfr open question when nonFunctionalRequirements is non-empty', async () => {
    (extractProjectData as jest.Mock).mockResolvedValueOnce(extractionWithNfrs);
    (mergeExtractionData as jest.Mock).mockReturnValueOnce(extractionWithNfrs);

    await extractData(baseState as any);

    const nfrQuestionCalls = (surfaceOpenQuestion as jest.Mock).mock.calls.filter(
      (call: unknown[]) => (call[0] as any)?.source === 'm2_nfr',
    );
    expect(nfrQuestionCalls).toHaveLength(0);
  });

  // TEST 2 — RED (INTK-01): persistArtifact must be called with status 'ready'
  // for nfrs_v2 when NFRs are present.
  // FAILS before fix: null-path always sets status: 'pending'.
  it('persists nfrs_v2 with status ready when nonFunctionalRequirements is non-empty', async () => {
    (extractProjectData as jest.Mock).mockResolvedValueOnce(extractionWithNfrs);
    (mergeExtractionData as jest.Mock).mockReturnValueOnce(extractionWithNfrs);

    await extractData(baseState as any);

    const nfrsCall = (persistArtifact as jest.Mock).mock.calls.find(
      (call: unknown[]) => (call[0] as any)?.kind === 'nfrs_v2',
    );
    expect(nfrsCall).toBeDefined();
    expect((nfrsCall![0] as any).status).toBe('ready');
  });

  // TEST 3 — GREEN (baseline): surfaceOpenQuestion IS called when NFRs are absent.
  // Passes before and after fix — this is the correct null-path behavior.
  it('surfaces m2_nfr open question when nonFunctionalRequirements is empty', async () => {
    (extractProjectData as jest.Mock).mockResolvedValueOnce(extractionWithoutNfrs);
    (mergeExtractionData as jest.Mock).mockReturnValueOnce(extractionWithoutNfrs);

    await extractData(baseState as any);

    const nfrQuestionCalls = (surfaceOpenQuestion as jest.Mock).mock.calls.filter(
      (call: unknown[]) => (call[0] as any)?.source === 'm2_nfr',
    );
    expect(nfrQuestionCalls.length).toBeGreaterThanOrEqual(1);
  });

  // TEST 4 — GREEN (bridge failure non-fatal): persistArtifact still called
  // when surfaceOpenQuestion throws.
  // Passes because the null-path wraps surfaceOpenQuestion in try/catch.
  it('still persists nfrs_v2 artifact even when surfaceOpenQuestion throws', async () => {
    (surfaceOpenQuestion as jest.Mock).mockRejectedValueOnce(new Error('bridge failure'));
    (extractProjectData as jest.Mock).mockResolvedValueOnce(extractionWithoutNfrs);
    (mergeExtractionData as jest.Mock).mockReturnValueOnce(extractionWithoutNfrs);

    await extractData(baseState as any);

    const nfrsCall = (persistArtifact as jest.Mock).mock.calls.find(
      (call: unknown[]) => (call[0] as any)?.kind === 'nfrs_v2',
    );
    expect(nfrsCall).toBeDefined();
  });
});
