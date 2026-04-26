/**
 * Tests for the POST→poll lifecycle of /api/projects/[id]/synthesize +
 * /api/projects/[id]/synthesize/status. Covers per-artifact status
 * transitions and signed-URL surfacing.
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';

const mockGetProjectArtifacts = jest.fn();
const mockUpsertArtifactStatus = jest.fn();
const mockGetSignedUrl = jest.fn();
const mockCheckAndDeductCredits = jest.fn();
const mockCheckSynthesisAllowance = jest.fn();
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

jest.mock('@/lib/storage/supabase-storage', () => ({
  __esModule: true,
  getSignedUrl: (...args: unknown[]) => mockGetSignedUrl(...args),
  SIGNED_URL_DEFAULT_TTL_SECONDS: 60 * 60 * 24 * 30,
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

const buildPostReq = () =>
  new NextRequest('http://localhost/api/projects/42/synthesize', { method: 'POST' });
const buildGetReq = () =>
  new NextRequest('http://localhost/api/projects/42/synthesize/status', { method: 'GET' });
const buildCtx = () => ({ params: Promise.resolve({ id: '42' }) });

// Indirect specifiers — tsc bundler resolution chokes on App-Router `[id]`
// segments in static import literals. Jest resolves at runtime via the `@/*`
// moduleNameMapper.
const ROUTE_POST = '@/app/api/projects/[id]/synthesize/route';
const ROUTE_STATUS = '@/app/api/projects/[id]/synthesize/status/route';

describe('synthesize lifecycle (POST → status poll)', () => {
  beforeEach(() => {
    afterCalls.length = 0;
    mockGetProjectArtifacts.mockReset();
    mockUpsertArtifactStatus.mockReset();
    mockGetSignedUrl.mockReset();
    mockCheckAndDeductCredits.mockReset();
    mockCheckSynthesisAllowance.mockReset();
    mockKickoff.mockReset();
    mockCheckSynthesisAllowance.mockResolvedValue({ allowed: true });
    mockCheckAndDeductCredits.mockResolvedValue({
      allowed: true,
      creditsUsed: 1000,
      creditLimit: 2500,
    });
    mockUpsertArtifactStatus.mockResolvedValue(null);
  });

  it('POST → 202 with pending rows; status GET returns pending statuses', async () => {
    mockGetProjectArtifacts.mockResolvedValueOnce([]); // POST idempotency-check (no recent rows)

    const { POST } = (await import(ROUTE_POST)) as typeof import('../../app/api/projects/[id]/synthesize/route');
    const postRes = await POST(buildPostReq(), buildCtx() as any);
    expect(postRes.status).toBe(202);

    // Now status GET — return rows in 'pending' state.
    mockGetProjectArtifacts.mockResolvedValueOnce(
      ['recommendation_json', 'recommendation_pdf', 'hoq_xlsx'].map((k) => ({
        id: `row-${k}`,
        projectId: 42,
        artifactKind: k,
        storagePath: null,
        format: null,
        sha256: null,
        synthesisStatus: 'pending',
        inputsHash: 'h',
        synthesizedAt: null,
        failureReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );

    const { GET } = (await import(ROUTE_STATUS)) as typeof import('../../app/api/projects/[id]/synthesize/status/route');
    const statusRes = await GET(buildGetReq(), buildCtx() as any);
    expect(statusRes.status).toBe(200);
    const body = await statusRes.json();
    expect(body.overall_status).toBe('pending');
    expect(body.artifacts).toHaveLength(3);
    body.artifacts.forEach((a: any) => {
      expect(a.status).toBe('pending');
      expect(a.signed_url).toBeNull();
    });
    expect(mockGetSignedUrl).not.toHaveBeenCalled();
  });

  it('after sidecar callback, status GET returns ready statuses with signed URLs', async () => {
    mockGetSignedUrl.mockImplementation(async (path: string) =>
      `https://signed.example.com/${path}?token=abc`
    );
    mockGetProjectArtifacts.mockResolvedValueOnce([
      {
        id: 'row-pdf',
        projectId: 42,
        artifactKind: 'recommendation_pdf',
        storagePath: 'artifacts/42/recommendation.pdf',
        format: 'pdf',
        sha256: 'deadbeef',
        synthesisStatus: 'ready',
        inputsHash: 'h',
        synthesizedAt: new Date('2026-04-25T20:00:00Z'),
        failureReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'row-pptx',
        projectId: 42,
        artifactKind: 'recommendation_pptx',
        storagePath: 'artifacts/42/recommendation.pptx',
        format: 'pptx',
        sha256: 'cafebabe',
        synthesisStatus: 'ready',
        inputsHash: 'h',
        synthesizedAt: new Date('2026-04-25T20:00:30Z'),
        failureReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const { GET } = (await import(ROUTE_STATUS)) as typeof import('../../app/api/projects/[id]/synthesize/status/route');
    const res = await GET(buildGetReq(), buildCtx() as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.overall_status).toBe('ready');
    expect(body.artifacts[0].signed_url).toContain('https://signed.example.com/');
    expect(body.artifacts[1].signed_url).toContain('https://signed.example.com/');
    expect(body.artifacts[0].sha256).toBe('deadbeef');
    expect(body.artifacts[0].synthesized_at).toBe('2026-04-25T20:00:00.000Z');
  });

  it('mixed states surface as overall_status=pending while any artifact is pending', async () => {
    mockGetSignedUrl.mockResolvedValue('https://signed.example.com/x');
    mockGetProjectArtifacts.mockResolvedValueOnce([
      {
        id: 'r1', projectId: 42, artifactKind: 'recommendation_json',
        storagePath: 'a/b.json', format: 'json', sha256: 'x',
        synthesisStatus: 'ready', inputsHash: 'h',
        synthesizedAt: new Date(), failureReason: null,
        createdAt: new Date(), updatedAt: new Date(),
      },
      {
        id: 'r2', projectId: 42, artifactKind: 'recommendation_pdf',
        storagePath: null, format: null, sha256: null,
        synthesisStatus: 'pending', inputsHash: 'h',
        synthesizedAt: null, failureReason: null,
        createdAt: new Date(), updatedAt: new Date(),
      },
      {
        id: 'r3', projectId: 42, artifactKind: 'hoq_xlsx',
        storagePath: null, format: null, sha256: null,
        synthesisStatus: 'failed', inputsHash: 'h',
        synthesizedAt: null, failureReason: 'generator timeout',
        createdAt: new Date(), updatedAt: new Date(),
      },
    ]);
    const { GET } = (await import(ROUTE_STATUS)) as typeof import('../../app/api/projects/[id]/synthesize/status/route');
    const res = await GET(buildGetReq(), buildCtx() as any);
    const body = await res.json();
    expect(body.overall_status).toBe('pending');
    const failed = body.artifacts.find((a: any) => a.kind === 'hoq_xlsx');
    expect(failed.failure_reason).toBe('generator timeout');
  });

  it('all-failed → overall_status=failed; ready+failed (no pending) → partial', async () => {
    mockGetProjectArtifacts.mockResolvedValueOnce([
      {
        id: 'r1', projectId: 42, artifactKind: 'recommendation_json',
        storagePath: null, format: null, sha256: null,
        synthesisStatus: 'failed', inputsHash: 'h',
        synthesizedAt: null, failureReason: 'boom',
        createdAt: new Date(), updatedAt: new Date(),
      },
    ]);
    const { GET } = (await import(ROUTE_STATUS)) as typeof import('../../app/api/projects/[id]/synthesize/status/route');
    const res1 = await GET(buildGetReq(), buildCtx() as any);
    expect((await res1.json()).overall_status).toBe('failed');

    mockGetSignedUrl.mockResolvedValue('https://signed.example.com/x');
    mockGetProjectArtifacts.mockResolvedValueOnce([
      {
        id: 'r1', projectId: 42, artifactKind: 'recommendation_json',
        storagePath: 'a/b.json', format: 'json', sha256: 'x',
        synthesisStatus: 'ready', inputsHash: 'h',
        synthesizedAt: new Date(), failureReason: null,
        createdAt: new Date(), updatedAt: new Date(),
      },
      {
        id: 'r2', projectId: 42, artifactKind: 'hoq_xlsx',
        storagePath: null, format: null, sha256: null,
        synthesisStatus: 'failed', inputsHash: 'h',
        synthesizedAt: null, failureReason: 'fail',
        createdAt: new Date(), updatedAt: new Date(),
      },
    ]);
    const res2 = await GET(buildGetReq(), buildCtx() as any);
    expect((await res2.json()).overall_status).toBe('partial');
  });
});
