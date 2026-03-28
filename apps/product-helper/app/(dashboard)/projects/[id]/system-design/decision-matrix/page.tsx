import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProjectById } from '@/app/actions/projects';
import { DecisionMatrixViewer } from '@/components/system-design/decision-matrix-viewer';

function SectionSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 rounded animate-pulse bg-muted" />
      <div className="h-96 rounded-lg animate-pulse bg-muted" />
    </div>
  );
}

async function DecisionMatrixContent({ projectId }: { projectId: number }) {
  const project = await getProjectById(projectId);
  if (!project) notFound();

  const decisionMatrix = (project as any).projectData?.intakeState?.extractedData?.decisionMatrix;

  if (!decisionMatrix) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center">
        <div className="mx-auto max-w-md space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            Decision Matrix
          </h2>
          <p className="text-sm text-muted-foreground">
            Decision Matrix not yet generated. Complete the intake chat to
            generate your performance assessment and design alternative
            comparison.
          </p>
        </div>
      </div>
    );
  }

  return <DecisionMatrixViewer decisionMatrix={decisionMatrix} />;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DecisionMatrixPage({ params }: PageProps) {
  const { id } = await params;
  const projectId = parseInt(id, 10);
  if (isNaN(projectId)) notFound();

  return (
    <section className="flex-1 p-4 pb-20 md:pb-8 lg:p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">
          Decision Matrix
        </h1>
        <Suspense fallback={<SectionSkeleton />}>
          <DecisionMatrixContent projectId={projectId} />
        </Suspense>
      </div>
    </section>
  );
}
