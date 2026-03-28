import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProjectById } from '@/app/actions/projects';
import { InterfacesViewer } from '@/components/system-design/interfaces-viewer';

function SectionSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-52 rounded animate-pulse bg-muted" />
      <div className="h-10 w-72 rounded animate-pulse bg-muted" />
      <div className="h-96 rounded-lg animate-pulse bg-muted" />
    </div>
  );
}

async function InterfacesContent({ projectId }: { projectId: number }) {
  const project = await getProjectById(projectId);
  if (!project) notFound();

  const interfaces = (project as any).projectData?.intakeState?.extractedData?.interfaces;

  if (!interfaces) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center">
        <div className="mx-auto max-w-md space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            Interface Definitions
          </h2>
          <p className="text-sm text-muted-foreground">
            Interface definitions not yet generated. Complete the intake chat to
            generate your Data Flow Diagrams, N2 Charts, and Sequence Diagrams.
          </p>
        </div>
      </div>
    );
  }

  return <InterfacesViewer interfaces={interfaces} />;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InterfacesPage({ params }: PageProps) {
  const { id } = await params;
  const projectId = parseInt(id, 10);
  if (isNaN(projectId)) notFound();

  return (
    <section className="flex-1 p-4 pb-20 md:pb-8 lg:p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">
          Interface Definitions
        </h1>
        <Suspense fallback={<SectionSkeleton />}>
          <InterfacesContent projectId={projectId} />
        </Suspense>
      </div>
    </section>
  );
}
