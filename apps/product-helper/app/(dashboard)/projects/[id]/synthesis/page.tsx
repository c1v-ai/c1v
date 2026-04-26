/**
 * Synthesis page — RecommendationViewer host (TA2 v2.1 Wave A).
 *
 * Server component:
 *   1. Loads the project (RLS-gated).
 *   2. Calls `getLatestSynthesis` for the keystone `recommendation_json` row.
 *   3. Pre-synthesis OR `synthesis_status !== 'ready'` → renders the
 *      EC-V21-A.16 empty state (5 `<EmptySectionState>` instances).
 *   4. Ready → fetches the JSON from Supabase Storage via signed URL,
 *      builds the manifest dbArtifacts[] array via `getProjectArtifacts`,
 *      and hands both to `<RecommendationViewer>`.
 *
 * Per D-V21.17 the empty branch ships ZERO canned-c1v exemplar values
 * (verifier sweeps for 'AV.01' / 'Sonnet 4.5' / 'pgvector' / 'Vercel' /
 * 'Anthropic'). Per the manifest contract v1, `signed_url` is null for
 * non-ready artifacts.
 */

import { Suspense } from 'react';
import { notFound } from 'next/navigation';

import { getProjectById } from '@/app/actions/projects';
import {
  getLatestSynthesis,
  getProjectArtifacts,
} from '@/lib/db/queries';
import { getSignedUrl } from '@/lib/storage/supabase-storage';

import { RecommendationViewer } from '@/components/synthesis/recommendation-viewer';
import { SynthesisEmptyState } from '@/components/synthesis/empty-state';
import type { ArchitectureRecommendation } from '@/components/synthesis/types';
import type { DownloadDropdownArtifact } from '@/components/synthesis/download-dropdown';

const MANIFEST_CONTRACT_VERSION = 'v1';

function SectionSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-64 animate-pulse rounded bg-muted" />
      <div className="h-96 animate-pulse rounded-lg bg-muted" />
    </div>
  );
}

async function buildDownloadArtifacts(
  projectId: number,
): Promise<DownloadDropdownArtifact[]> {
  const rows = await getProjectArtifacts(projectId);
  const cache = new Map<string, string>();

  const dedup = new Map<string, (typeof rows)[number]>();
  for (const row of rows) {
    if (!dedup.has(row.artifactKind)) dedup.set(row.artifactKind, row);
  }

  const entries: DownloadDropdownArtifact[] = [];
  for (const row of dedup.values()) {
    let signedUrl: string | null = null;
    if (row.synthesisStatus === 'ready' && row.storagePath) {
      try {
        signedUrl = await getSignedUrl(row.storagePath, undefined, cache);
      } catch {
        signedUrl = null;
      }
    }
    entries.push({
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
  return entries;
}

async function SynthesisContent({ projectId }: { projectId: number }) {
  const project = await getProjectById(projectId);
  if (!project) notFound();

  const latest = await getLatestSynthesis(projectId);

  if (!latest || latest.synthesisStatus !== 'ready' || !latest.storagePath) {
    return <SynthesisEmptyState projectId={projectId} />;
  }

  const cache = new Map<string, string>();
  let payload: ArchitectureRecommendation | null = null;
  try {
    const signedUrl = await getSignedUrl(latest.storagePath, undefined, cache);
    const res = await fetch(signedUrl, { cache: 'no-store' });
    if (res.ok) {
      payload = (await res.json()) as ArchitectureRecommendation;
    }
  } catch {
    payload = null;
  }

  if (!payload) {
    return <SynthesisEmptyState projectId={projectId} />;
  }

  const artifacts = await buildDownloadArtifacts(projectId);

  return (
    <RecommendationViewer
      payload={payload}
      projectId={projectId}
      artifacts={artifacts}
      manifestContractVersion={MANIFEST_CONTRACT_VERSION}
    />
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SynthesisPage({ params }: PageProps) {
  const { id } = await params;
  const projectId = parseInt(id, 10);
  if (isNaN(projectId)) notFound();

  return (
    <section className="flex-1 overflow-y-auto p-4 pb-20 md:pb-8 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <Suspense fallback={<SectionSkeleton />}>
          <SynthesisContent projectId={projectId} />
        </Suspense>
      </div>
    </section>
  );
}
