import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProjectById } from '@/app/actions/projects';
import { getProjectArtifacts } from '@/lib/db/queries';

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
  const ready = artifacts.some(
    (a) =>
      a.artifactKind === 'decision_network_v1' && a.synthesisStatus === 'ready',
  );

  if (!ready) {
    return <EmptyState />;
  }

  // The DecisionNetworkViewer is owned by the `architecture-and-database`
  // agent (merged Architecture & Database section).
  return (
    <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
      Decision network is ready. The interactive viewer is being prepared.
    </div>
  );
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
