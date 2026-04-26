/**
 * Tests for GET /api/projects/[id]/artifacts/manifest — verifies the v2.1
 * extension surfaces dbArtifacts (PDF/PPTX/Bundle ZIP signed URLs) merged
 * with legacy `entries` + `latest`. Cross-tenant access is blocked at the
 * withProjectAuth seam (404), reproduced here via the mock.
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';

const mockGetProjectArtifacts = jest.fn();
const mockGetSignedUrl = jest.fn();
const mockListArtifacts = jest.fn();
const mockLatestPerGenerator = jest.fn();
const mockResolveAuth = jest.fn();

jest.mock('@/lib/synthesis/artifacts-bridge', () => ({
  __esModule: true,
  getProjectArtifacts: (...args: unknown[]) => mockGetProjectArtifacts(...args),
}));

jest.mock('@/lib/storage/supabase-storage', () => ({
  __esModule: true,
  getSignedUrl: (...args: unknown[]) => mockGetSignedUrl(...args),
  SIGNED_URL_DEFAULT_TTL_SECONDS: 60 * 60 * 24 * 30,
}));

jest.mock('@/lib/artifact-generators/manifest', () => ({
  __esModule: true,
  listArtifacts: (...args: unknown[]) => mockListArtifacts(...args),
  latestPerGenerator: (...args: unknown[]) => mockLatestPerGenerator(...args),
}));

jest.mock('@/lib/api/with-project-auth', () => ({
  __esModule: true,
  withProjectAuth: (handler: any) => async (req: NextRequest, ctx: { params: any }) =>
    mockResolveAuth(handler, req, ctx),
}));

const buildReq = () =>
  new NextRequest('http://localhost/api/projects/42/artifacts/manifest', { method: 'GET' });
const buildCtx = (id = '42') => ({ params: Promise.resolve({ id }) });

// Indirect specifier — tsc bundler resolution chokes on App-Router `[id]`
// segments in static import literals. Jest resolves at runtime via `@/*`.
const ROUTE_MANIFEST = '@/app/api/projects/[id]/artifacts/manifest/route';

describe('GET /api/projects/[id]/artifacts/manifest — v2.1 extension', () => {
  beforeEach(() => {
    mockGetProjectArtifacts.mockReset();
    mockGetSignedUrl.mockReset();
    mockListArtifacts.mockReset();
    mockLatestPerGenerator.mockReset();
    mockResolveAuth.mockReset();
    // Default auth resolves successfully — bind handler to {projectId: 42}.
    mockResolveAuth.mockImplementation(async (handler: any, req: NextRequest, ctx: any) => {
      const params = await ctx.params;
      const projectId = Number(params.id ?? params.projectId);
      return handler(req, { user: { id: 7 }, team: { id: 11 }, projectId });
    });
    // No filesystem run dir present by default — keeps tests hermetic.
    mockListArtifacts.mockResolvedValue([]);
    mockLatestPerGenerator.mockReturnValue([]);
  });

  it('returns manifest_contract_version v1 + dbArtifacts with signed URLs for ready artifacts', async () => {
    mockGetSignedUrl.mockImplementation(
      async (storagePath: string) => `https://signed.example.com/${storagePath}?token=abc`
    );
    mockGetProjectArtifacts.mockResolvedValue([
      {
        id: 'a1', projectId: 42, artifactKind: 'recommendation_pdf',
        storagePath: 'artifacts/42/r.pdf', format: 'pdf', sha256: 'abc',
        synthesisStatus: 'ready', inputsHash: 'h',
        synthesizedAt: new Date('2026-04-25T20:00:00Z'),
        failureReason: null, createdAt: new Date(), updatedAt: new Date(),
      },
      {
        id: 'a2', projectId: 42, artifactKind: 'recommendation_pptx',
        storagePath: 'artifacts/42/r.pptx', format: 'pptx', sha256: 'def',
        synthesisStatus: 'ready', inputsHash: 'h',
        synthesizedAt: new Date('2026-04-25T20:00:30Z'),
        failureReason: null, createdAt: new Date(), updatedAt: new Date(),
      },
      {
        id: 'a3', projectId: 42, artifactKind: 'bundle_zip',
        storagePath: 'artifacts/42/bundle.zip', format: 'zip', sha256: 'ghi',
        synthesisStatus: 'ready', inputsHash: 'h',
        synthesizedAt: new Date('2026-04-25T20:01:00Z'),
        failureReason: null, createdAt: new Date(), updatedAt: new Date(),
      },
    ]);

    const { GET } = (await import(ROUTE_MANIFEST)) as typeof import('../../app/api/projects/[id]/artifacts/manifest/route');
    const res = await GET(buildReq(), buildCtx() as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.manifest_contract_version).toBe('v1');
    expect(body.dbArtifacts).toHaveLength(3);
    const kinds = body.dbArtifacts.map((d: any) => d.kind);
    expect(kinds).toEqual(
      expect.arrayContaining(['recommendation_pdf', 'recommendation_pptx', 'bundle_zip'])
    );
    body.dbArtifacts.forEach((d: any) => {
      expect(d.signed_url).toMatch(/^https:\/\/signed\.example\.com\//);
    });
  });

  it('does not sign URLs for pending or failed artifacts', async () => {
    mockGetProjectArtifacts.mockResolvedValue([
      {
        id: 'p1', projectId: 42, artifactKind: 'recommendation_pdf',
        storagePath: null, format: null, sha256: null,
        synthesisStatus: 'pending', inputsHash: 'h',
        synthesizedAt: null, failureReason: null,
        createdAt: new Date(), updatedAt: new Date(),
      },
      {
        id: 'p2', projectId: 42, artifactKind: 'hoq_xlsx',
        storagePath: 'artifacts/42/hoq.xlsx', format: 'xlsx', sha256: null,
        synthesisStatus: 'failed', inputsHash: 'h',
        synthesizedAt: null, failureReason: 'generator timeout',
        createdAt: new Date(), updatedAt: new Date(),
      },
    ]);

    const { GET } = (await import(ROUTE_MANIFEST)) as typeof import('../../app/api/projects/[id]/artifacts/manifest/route');
    const res = await GET(buildReq(), buildCtx() as any);
    const body = await res.json();
    expect(mockGetSignedUrl).not.toHaveBeenCalled();
    body.dbArtifacts.forEach((d: any) => expect(d.signed_url).toBeNull());
  });

  it('cross-tenant call returns 403/404 at the auth seam (no DB read happens)', async () => {
    // Reproduce withProjectAuth's cross-tenant behavior: returns 404 before handler runs.
    mockResolveAuth.mockImplementation(async () => {
      const { NextResponse } = await import('next/server');
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    });

    const { GET } = (await import(ROUTE_MANIFEST)) as typeof import('../../app/api/projects/[id]/artifacts/manifest/route');
    const res = await GET(buildReq(), buildCtx('999') as any);
    expect(res.status).toBe(404);
    expect(mockGetProjectArtifacts).not.toHaveBeenCalled();
    expect(mockGetSignedUrl).not.toHaveBeenCalled();
  });

  it('empty project (no DB artifacts, no run dir) returns empty arrays + version pin', async () => {
    mockGetProjectArtifacts.mockResolvedValue([]);
    const { GET } = (await import(ROUTE_MANIFEST)) as typeof import('../../app/api/projects/[id]/artifacts/manifest/route');
    const res = await GET(buildReq(), buildCtx() as any);
    const body = await res.json();
    expect(body.manifest_contract_version).toBe('v1');
    expect(body.entries).toEqual([]);
    expect(body.dbArtifacts).toEqual([]);
  });
});
