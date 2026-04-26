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
          Form-Function Map
        </h2>
        <p className="text-sm text-muted-foreground">
          The form-function map hasn&apos;t been generated yet. Run Deep
          Synthesis to populate the M5 mapping between FFBD functions and
          architectural forms.
        </p>
      </div>
    </div>
  );
}

async function FormFunctionMapContent({ projectId }: { projectId: number }) {
  const project = await getProjectById(projectId);
  if (!project) notFound();

  const artifacts = await getProjectArtifacts(projectId);
  const ready = artifacts.some(
    (a) =>
      a.artifactKind === 'form_function_map_v1' &&
      a.synthesisStatus === 'ready',
  );

  if (!ready) {
    return <EmptyState />;
  }

  return (
    <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
      Form-function map is ready. The interactive viewer is being prepared.
    </div>
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function FormFunctionMapPage({ params }: PageProps) {
  const { id } = await params;
  const projectId = parseInt(id, 10);
  if (isNaN(projectId)) notFound();

  return (
    <section className="flex-1 p-4 pb-20 md:pb-8 lg:p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">
          Form-Function Map
        </h1>
        <Suspense fallback={<SectionSkeleton />}>
          <FormFunctionMapContent projectId={projectId} />
        </Suspense>
      </div>
    </section>
  );
}
