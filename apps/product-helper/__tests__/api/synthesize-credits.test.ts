/**
 * Tests for POST /api/projects/[id]/synthesize — credit + idempotency surface.
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';

const mockCheckAndDeductCredits = jest.fn();
const mockCheckSynthesisAllowance = jest.fn();
const mockGetProjectArtifacts = jest.fn();
const mockUpsertArtifactStatus = jest.fn();
const mockKickoff = jest.fn();
const afterCalls: Array<() => void | Promise<void>> = [];

jest.mock('next/server', () => {
  const actual = jest.requireActual('next/server');
  return {
    ...actual,
    after: (fn: () => void | Promise<void>) => {
      afterCalls.push(fn);
    },
  };
});

jest.mock('@/lib/db/queries', () => ({
  __esModule: true,
  checkAndDeductCredits: (...args: unknown[]) => mockCheckAndDeductCredits(...args),
}));

jest.mock('@/lib/billing/synthesis-tier', () => ({
  __esModule: true,
  checkSynthesisAllowance: (...args: unknown[]) => mockCheckSynthesisAllowance(...args),
}));

jest.mock('@/lib/synthesis/artifacts-bridge', () => ({
  __esModule: true,
  EXPECTED_ARTIFACT_KINDS: [
    'recommendation_json',
    'recommendation_html',
    'recommendation_pdf',
    'recommendation_pptx',
    'fmea_early_xlsx',
    'fmea_residual_xlsx',
    'hoq_xlsx',
  ],
  getProjectArtifacts: (...args: unknown[]) => mockGetProjectArtifacts(...args),
  upsertArtifactStatus: (...args: unknown[]) => mockUpsertArtifactStatus(...args),
}));

jest.mock('@/lib/synthesis/kickoff', () => ({
  __esModule: true,
  kickoffSynthesisGraph: (...args: unknown[]) => mockKickoff(...args),
}));

jest.mock('@/lib/api/with-project-auth', () => ({
  __esModule: true,
  withProjectAuth: (handler: any) => async (req: NextRequest, ctx: { params: any }) => {
    const params = await ctx.params;
    const projectId = Number(params.id ?? params.projectId);
    return handler(req, {
      user: { id: 7 },
      team: { id: 11 },
      projectId,
    });
  },
}));

const buildReq = () =>
  new NextRequest('http://localhost/api/projects/42/synthesize', { method: 'POST' });
const buildCtx = () => ({ params: Promise.resolve({ id: '42' }) });

// Indirect specifier — tsc's bundler resolver chokes on the literal `[id]`
// segment in App-Router-style paths. Jest resolves these at runtime via the
// `@/*` moduleNameMapper, so the indirection is type-erased only.
const ROUTE_POST = '@/app/api/projects/[id]/synthesize/route';

describe('POST /api/projects/[id]/synthesize — credits + idempotency', () => {
  beforeEach(() => {
    afterCalls.length = 0;
    mockCheckAndDeductCredits.mockReset();
    mockCheckSynthesisAllowance.mockReset();
    mockGetProjectArtifacts.mockReset();
    mockUpsertArtifactStatus.mockReset();
    mockKickoff.mockReset();
    mockCheckSynthesisAllowance.mockResolvedValue({ allowed: true });
    mockGetProjectArtifacts.mockResolvedValue([]);
    mockUpsertArtifactStatus.mockResolvedValue(null);
  });

  it('returns 402 when credits insufficient', async () => {
    mockCheckAndDeductCredits.mockResolvedValue({
      allowed: false,
      creditsUsed: 2400,
      creditLimit: 2500,
    });

    const { POST } = (await import(ROUTE_POST)) as typeof import('../../app/api/projects/[id]/synthesize/route');
    const res = await POST(buildReq(), buildCtx() as any);
    expect(res.status).toBe(402);
    const body = await res.json();
    expect(body.error).toBe('insufficient_credits');
    expect(body.upgrade_url).toBe('/pricing');
    expect(mockKickoff).not.toHaveBeenCalled();
  });

  it('deducts 1000 credits, pre-creates 7 pending rows, schedules kickoff, returns 202', async () => {
    mockCheckAndDeductCredits.mockResolvedValue({
      allowed: true,
      creditsUsed: 1000,
      creditLimit: 2500,
    });

    const { POST } = (await import(ROUTE_POST)) as typeof import('../../app/api/projects/[id]/synthesize/route');
    const res = await POST(buildReq(), buildCtx() as any);
    expect(res.status).toBe(202);
    const body = await res.json();
    expect(body.synthesis_id).toMatch(/^[0-9a-f-]{36}$/i);
    expect(body.expected_artifacts).toHaveLength(7);
    expect(body.status_url).toBe('/api/projects/42/synthesize/status');

    expect(mockCheckAndDeductCredits).toHaveBeenCalledWith(11, 1000);
    expect(mockUpsertArtifactStatus).toHaveBeenCalledTimes(7);
    expect(mockUpsertArtifactStatus.mock.calls[0][0]).toMatchObject({
      projectId: 42,
      status: 'pending',
    });

    expect(afterCalls).toHaveLength(1);
    await afterCalls[0]();
    expect(mockKickoff).toHaveBeenCalledTimes(1);
    expect(mockKickoff.mock.calls[0][0]).toMatchObject({
      projectId: 42,
      teamId: 11,
      userId: 7,
    });
  });

  it('returns 402 when synthesis allowance is denied (free-tier exhausted)', async () => {
    mockCheckSynthesisAllowance.mockResolvedValue({
      allowed: false,
      reason: 'free_tier_exhausted',
      remaining_this_month: 0,
      plan_name: 'Free',
    });

    const { POST } = (await import(ROUTE_POST)) as typeof import('../../app/api/projects/[id]/synthesize/route');
    const res = await POST(buildReq(), buildCtx() as any);
    expect(res.status).toBe(402);
    const body = await res.json();
    expect(body.error).toBe('synthesis_not_allowed');
    expect(body.reason).toBe('free_tier_exhausted');
    expect(mockCheckAndDeductCredits).not.toHaveBeenCalled();
  });

  it('idempotent on duplicate POST within window (returns existing synthesis_id, no credit deduction)', async () => {
    mockGetProjectArtifacts.mockResolvedValue([
      {
        id: 'row-1',
        projectId: 42,
        artifactKind: 'recommendation_json',
        storagePath: null,
        format: null,
        sha256: null,
        synthesisStatus: 'pending',
        inputsHash: 'cached-inputs-hash',
        synthesizedAt: null,
        failureReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const { POST } = (await import(ROUTE_POST)) as typeof import('../../app/api/projects/[id]/synthesize/route');
    const res = await POST(buildReq(), buildCtx() as any);
    expect(res.status).toBe(202);
    const body = await res.json();
    expect(body.idempotent_replay).toBe(true);
    expect(body.synthesis_id).toBe('cached-inputs-hash');
    expect(mockCheckAndDeductCredits).not.toHaveBeenCalled();
    expect(mockKickoff).not.toHaveBeenCalled();
  });
});
