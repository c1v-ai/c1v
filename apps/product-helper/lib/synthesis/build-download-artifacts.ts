/**
 * Helper for page-level DownloadDropdown wiring.
 *
 * Filters `getProjectArtifacts(projectId)` rows to the artifact kinds a
 * given page cares about, resolves Supabase Storage signed URLs for the
 * `ready` ones, and returns the canonical
 * `DownloadDropdownArtifact[]` shape.
 *
 * Used by pages whose canonical export is a sidecar-rendered Python
 * artifact (XLSX/SVG/PPTX/PDF). Frontend fallback exporters
 * (`<DataExportMenu />`) sit alongside this for legacy/intake-stage data.
 *
 * @module lib/synthesis/build-download-artifacts
 */

import { getProjectArtifacts } from '@/lib/db/queries';
import { getSignedUrl } from '@/lib/storage/supabase-storage';
import type { DownloadDropdownArtifact } from '@/components/synthesis/download-dropdown';

type ArtifactRow = Awaited<ReturnType<typeof getProjectArtifacts>>[number];

export async function buildDownloadArtifacts(
  projectId: number,
  kinds: readonly string[],
  options?: { rows?: ArtifactRow[] },
): Promise<DownloadDropdownArtifact[]> {
  const rows = options?.rows ?? (await getProjectArtifacts(projectId));
  const cache = new Map<string, string>();
  const filtered = rows.filter((r) => kinds.includes(r.artifactKind));
  // De-dup: latest per (project, kind) by createdAt order (already DESC).
  const dedup = new Map<string, ArtifactRow>();
  for (const row of filtered) {
    if (!dedup.has(row.artifactKind)) dedup.set(row.artifactKind, row);
  }

  const out: DownloadDropdownArtifact[] = [];
  for (const row of dedup.values()) {
    let signedUrl: string | null = null;
    if (row.synthesisStatus === 'ready' && row.storagePath) {
      try {
        signedUrl = await getSignedUrl(row.storagePath, undefined, cache);
      } catch {
        signedUrl = null;
      }
    }
    out.push({
      kind: row.artifactKind,
      status: row.synthesisStatus,
      format: row.format,
      signed_url: signedUrl,
      sha256: row.sha256,
      synthesized_at:
        row.synthesizedAt instanceof Date
          ? row.synthesizedAt.toISOString()
          : (row.synthesizedAt as string | null),
    });
  }
  return out;
}
