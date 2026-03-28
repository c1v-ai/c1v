import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProjectById } from '@/app/actions/projects';
import { QFDViewer } from '@/components/system-design/qfd-viewer';

function SectionSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-56 rounded animate-pulse bg-muted" />
      <div className="h-[500px] rounded-lg animate-pulse bg-muted" />
    </div>
  );
}

async function QFDContent({ projectId }: { projectId: number }) {
  const project = await getProjectById(projectId);
  if (!project) notFound();

  const qfd = (project as any).projectData?.intakeState?.extractedData?.qfd;

  if (!qfd) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center">
        <div className="mx-auto max-w-md space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            House of Quality (QFD)
          </h2>
          <p className="text-sm text-muted-foreground">
            QFD not yet generated. Complete the intake chat to generate your
            House of Quality matrix mapping customer needs to engineering
            characteristics.
          </p>
        </div>
      </div>
    );
  }

  return <QFDViewer qfd={qfd} />;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function QFDPage({ params }: PageProps) {
  const { id } = await params;
  const projectId = parseInt(id, 10);
  if (isNaN(projectId)) notFound();

  return (
    <section className="flex-1 p-4 pb-20 md:pb-8 lg:p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">
          House of Quality (QFD)
        </h1>
        <Suspense fallback={<SectionSkeleton />}>
          <QFDContent projectId={projectId} />
        </Suspense>
      </div>
    </section>
  );
}
