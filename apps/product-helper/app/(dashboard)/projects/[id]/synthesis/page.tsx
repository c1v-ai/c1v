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
import { SynthesisPendingState } from '@/components/synthesis/pending-state';
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

async function SynthesisContent({
  projectId,
  justStarted,
}: {
  projectId: number;
  justStarted: boolean;
}) {
  const project = await getProjectById(projectId);
  if (!project) notFound();

  const latest = await getLatestSynthesis(projectId);

  // P7 — pending-mode UI. Shown when:
  //   (a) user just clicked Run Deep Synthesis (?just_started=1), OR
  //   (b) any project_artifacts row is currently `pending`.
  // Polls /synthesize/status every 3s; flips to ready/failed when the
  // langgraph nodes finish writing terminal rows.
  const allArtifactsRaw = await getProjectArtifacts(projectId);
  const dedupRows = new Map<string, (typeof allArtifactsRaw)[number]>();
  for (const row of allArtifactsRaw) {
    if (!dedupRows.has(row.artifactKind)) dedupRows.set(row.artifactKind, row);
  }
  const dedupArtifacts = Array.from(dedupRows.values());
  const anyPending = dedupArtifacts.some(
    (r) => r.synthesisStatus === 'pending',
  );

  if (justStarted || anyPending) {
    const initialArtifacts = dedupArtifacts.map((r) => ({
      kind: r.artifactKind,
      status: r.synthesisStatus,
      format: r.format,
      signed_url: null,
      sha256: r.sha256,
      synthesized_at:
        r.synthesizedAt instanceof Date
          ? r.synthesizedAt.toISOString()
          : (r.synthesizedAt as string | null),
      failure_reason: r.failureReason,
    }));
    return (
      <SynthesisPendingState
        projectId={projectId}
        initialArtifacts={initialArtifacts}
      />
    );
  }

  if (!latest || latest.synthesisStatus !== 'ready' || !latest.storagePath) {
    return <SynthesisEmptyState projectId={projectId} />;
  }

  const cache = new Map<string, string>();
  let raw: Record<string, unknown> | null = null;
  try {
    const signedUrl = await getSignedUrl(latest.storagePath, undefined, cache);
    const res = await fetch(signedUrl, { cache: 'no-store' });
    if (res.ok) raw = (await res.json()) as Record<string, unknown>;
  } catch {
    raw = null;
  }

  if (!raw) {
    return <SynthesisEmptyState projectId={projectId} />;
  }

  // generate-synthesis.ts writes a runtime-envelope (no metadata/pareto_frontier).
  // RecommendationViewer needs the full ArchitectureRecommendation shape.
  // Until the generator is wired to produce the full shape, render a summary card.
  if (raw._schema === 'synthesis.architecture-recommendation.runtime-envelope.v1') {
    const artifacts = await buildDownloadArtifacts(projectId);
    return (
      <div className="space-y-6">
        <div className="rounded-lg border bg-card p-6 space-y-3">
          <h1 className="text-2xl font-bold text-foreground">Architecture Recommendation</h1>
          <p className="text-sm text-muted-foreground">
            Synthesis completed for <strong>{String(raw.project_name ?? 'this project')}</strong>
            {raw.synthesized_at ? ` on ${new Date(raw.synthesized_at as string).toLocaleString()}` : ''}.
            Download the full recommendation below.
          </p>
          <p className="text-xs text-muted-foreground rounded bg-muted/50 px-3 py-2">
            The interactive recommendation viewer requires the canonical artifact. Re-run
            Deep Synthesis to generate it, or download the PDF/PPTX/HTML exports.
          </p>
        </div>
        {artifacts.length > 0 && (
          <div className="flex items-center gap-3">
            {artifacts
              .filter((a) => a.status === 'ready' && a.signed_url)
              .map((a) => (
                <a
                  key={a.kind}
                  href={a.signed_url!}
                  download
                  className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
                >
                  {a.kind.replace('recommendation_', '').toUpperCase()}
                </a>
              ))}
          </div>
        )}
      </div>
    );
  }

  const payload = raw as unknown as ArchitectureRecommendation;
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
  searchParams?: Promise<{ just_started?: string }>;
}

export default async function SynthesisPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const projectId = parseInt(id, 10);
  if (isNaN(projectId)) notFound();

  const sp = (await searchParams) ?? {};
  const justStarted = sp.just_started === '1';

  return (
    <section className="flex-1 overflow-y-auto p-4 pb-20 md:pb-8 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <Suspense fallback={<SectionSkeleton />}>
          <SynthesisContent
            projectId={projectId}
            justStarted={justStarted}
          />
        </Suspense>
      </div>
    </section>
  );
}
