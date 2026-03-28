import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProjectById } from '@/app/actions/projects';
import { FFBDViewer } from '@/components/system-design/ffbd-viewer';

function SectionSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-64 rounded animate-pulse bg-muted" />
      <div className="h-96 rounded-lg animate-pulse bg-muted" />
    </div>
  );
}

async function FFBDContent({ projectId }: { projectId: number }) {
  const project = await getProjectById(projectId);
  if (!project) notFound();

  const ffbd = (project as any).projectData?.intakeState?.extractedData?.ffbd;

  if (!ffbd) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center">
        <div className="mx-auto max-w-md space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            Functional Flow Block Diagram (FFBD)
          </h2>
          <p className="text-sm text-muted-foreground">
            FFBD not yet generated. Complete the intake chat to generate your
            Functional Flow Block Diagram.
          </p>
        </div>
      </div>
    );
  }

  return <FFBDViewer ffbd={ffbd} />;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function FFBDPage({ params }: PageProps) {
  const { id } = await params;
  const projectId = parseInt(id, 10);
  if (isNaN(projectId)) notFound();

  return (
    <section className="flex-1 p-4 pb-20 md:pb-8 lg:p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">
          Functional Flow Block Diagram (FFBD)
        </h1>
        <Suspense fallback={<SectionSkeleton />}>
          <FFBDContent projectId={projectId} />
        </Suspense>
      </div>
    </section>
  );
}
