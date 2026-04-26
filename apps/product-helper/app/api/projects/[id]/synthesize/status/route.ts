/**
 * GET /api/projects/[id]/synthesize/status
 *
 * Returns per-artifact synthesis state from project_artifacts. The UI
 * polls this every 3s while any artifact is `pending`; transitions to
 * `ready` (with signed URL) or `failed` (with failure_reason) are
 * terminal per artifact.
 *
 * Response shape:
 *   {
 *     project_id: number,
 *     overall_status: 'pending' | 'ready' | 'failed' | 'partial',
 *     artifacts: Array<{
 *       kind: string,
 *       status: 'pending' | 'ready' | 'failed',
 *       format: string | null,
 *       signed_url: string | null,   // present only when status === 'ready'
 *       sha256: string | null,
 *       synthesized_at: string | null,
 *       failure_reason: string | null,
 *     }>
 *   }
 *
 * Latency target: < 100ms p95 (pure DB read + per-row signed-URL signing
 * for ready artifacts only). Signed URLs are TTL'd 30 days per D-V21.08.
 *
 * RLS: relies on TA1's project_artifacts policies — cross-tenant projectId
 * returns an empty list (project lookup in withProjectAuth 404s first).
 */

import { NextResponse } from 'next/server';

import { withProjectAuth } from '@/lib/api/with-project-auth';
import { getProjectArtifacts, type SynthesisStatus } from '@/lib/synthesis/artifacts-bridge';
import { getSignedUrl, type SignedUrlCache } from '@/lib/storage/supabase-storage';

interface ArtifactStatusEntry {
  kind: string;
  status: SynthesisStatus;
  format: string | null;
  signed_url: string | null;
  sha256: string | null;
  synthesized_at: string | null;
  failure_reason: string | null;
}

function deriveOverall(
  artifacts: ArtifactStatusEntry[]
): 'pending' | 'ready' | 'failed' | 'partial' {
  if (artifacts.length === 0) return 'pending';
  const allReady = artifacts.every((a) => a.status === 'ready');
  if (allReady) return 'ready';
  const allFailed = artifacts.every((a) => a.status === 'failed');
  if (allFailed) return 'failed';
  const anyPending = artifacts.some((a) => a.status === 'pending');
  if (!anyPending) return 'partial'; // mix of ready + failed
  return 'pending';
}

export const GET = withProjectAuth(async (_req, { projectId }) => {
  const rows = await getProjectArtifacts(projectId);
  const cache: SignedUrlCache = new Map();

  const artifacts: ArtifactStatusEntry[] = await Promise.all(
    rows.map(async (row) => {
      let signedUrl: string | null = null;
      if (row.synthesisStatus === 'ready' && row.storagePath) {
        try {
          signedUrl = await getSignedUrl(row.storagePath, undefined, cache);
        } catch (err) {
          // Signing failure shouldn't crash the poll; surface as null URL.
          console.error(
            `[synthesize/status] signed-URL failed for project=${projectId} kind=${row.artifactKind}:`,
            err instanceof Error ? err.message : err
          );
        }
      }
      return {
        kind: row.artifactKind,
        status: row.synthesisStatus,
        format: row.format,
        signed_url: signedUrl,
        sha256: row.sha256,
        synthesized_at: row.synthesizedAt
          ? new Date(row.synthesizedAt).toISOString()
          : null,
        failure_reason: row.failureReason,
      };
    })
  );

  return NextResponse.json({
    project_id: projectId,
    overall_status: deriveOverall(artifacts),
    artifacts,
  });
});
