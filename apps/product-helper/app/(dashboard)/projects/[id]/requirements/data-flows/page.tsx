import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProjectById } from '@/app/actions/projects';
import { getProjectArtifacts } from '@/lib/db/queries';
import { DataFlowsViewer } from '@/components/requirements/data-flows-viewer';
import type { DataFlows } from '@/lib/langchain/schemas/module-1/phase-2-5-data-flows';

function SectionSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 rounded animate-pulse bg-muted" />
      <div className="h-64 rounded animate-pulse bg-muted" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border bg-card p-12 text-center">
      <div className="mx-auto max-w-md space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Data Flows</h2>
        <p className="text-sm text-muted-foreground">
          Data flows haven&apos;t been generated yet. Run Deep Synthesis to
          populate the M1 phase-2.5 data flow inventory.
        </p>
      </div>
    </div>
  );
}

async function DataFlowsContent({ projectId }: { projectId: number }) {
  const project = await getProjectById(projectId);
  if (!project) notFound();

  const artifacts = await getProjectArtifacts(projectId);
  const artifactReady = artifacts.some(
    (a) => a.artifactKind === 'data_flows_v1' && a.synthesisStatus === 'ready',
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const legacy = (project as any).projectData?.intakeState?.extractedData
    ?.dataFlows as DataFlows | null | undefined;

  if (!artifactReady && !legacy) {
    return <EmptyState />;
  }

  if (!legacy) {
    return (
      <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
        Data flow inventory is ready. Download the artifact from the synthesis
        page or open Artifact Pipeline to view the JSON output.
      </div>
    );
  }

  return <DataFlowsViewer dataFlows={legacy} />;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DataFlowsPage({ params }: PageProps) {
  const { id } = await params;
  const projectId = parseInt(id, 10);
  if (isNaN(projectId)) notFound();

  return (
    <section className="flex-1 p-4 pb-20 md:pb-8 lg:p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">Data Flows</h1>
        <Suspense fallback={<SectionSkeleton />}>
          <DataFlowsContent projectId={projectId} />
        </Suspense>
      </div>
    </section>
  );
}
