import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProjectById } from '@/app/actions/projects';
import { getProjectArtifacts } from '@/lib/db/queries';
import { getSignedUrl } from '@/lib/storage/supabase-storage';
import {
  DecisionNetworkViewer,
  type DecisionNetworkData,
} from '@/components/system-design/decision-network-viewer';

function SectionSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-56 rounded animate-pulse bg-muted" />
      <div className="h-96 rounded animate-pulse bg-muted" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border bg-card p-12 text-center">
      <div className="mx-auto max-w-md space-y-3">
        <h2 className="text-lg font-semibold text-foreground">
          Decision Network
        </h2>
        <p className="text-sm text-muted-foreground">
          The decision network hasn&apos;t been generated yet. Run Deep
          Synthesis to populate the M4 decision graph and Pareto alternatives.
        </p>
      </div>
    </div>
  );
}

async function DecisionNetworkContent({ projectId }: { projectId: number }) {
  const project = await getProjectById(projectId);
  if (!project) notFound();

  const artifacts = await getProjectArtifacts(projectId);
  const row = artifacts.find(
    (a) =>
      a.artifactKind === 'decision_network_v1' && a.synthesisStatus === 'ready',
  );

  if (!row?.storagePath) return <EmptyState />;

  let data: DecisionNetworkData | null = null;
  try {
    const cache = new Map<string, string>();
    const url = await getSignedUrl(row.storagePath, undefined, cache);
    const res = await fetch(url, { cache: 'no-store' });
    if (res.ok) data = (await res.json()) as DecisionNetworkData;
  } catch {
    /* fall through to empty state */
  }

  if (!data) return <EmptyState />;

  return <DecisionNetworkViewer data={data} />;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DecisionNetworkPage({ params }: PageProps) {
  const { id } = await params;
  const projectId = parseInt(id, 10);
  if (isNaN(projectId)) notFound();

  return (
    <section className="flex-1 p-4 pb-20 md:pb-8 lg:p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">
          Decision Network
        </h1>
        <Suspense fallback={<SectionSkeleton />}>
          <DecisionNetworkContent projectId={projectId} />
        </Suspense>
      </div>
    </section>
  );
}
