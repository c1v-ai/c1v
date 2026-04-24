import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProjectById } from '@/app/actions/projects';
import { FMEAViewer } from '@/components/system-design/fmea-viewer';

function SectionSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-52 rounded animate-pulse bg-muted" />
      <div className="h-10 w-72 rounded animate-pulse bg-muted" />
      <div className="h-96 rounded-lg animate-pulse bg-muted" />
    </div>
  );
}

async function FMEAContent({ projectId }: { projectId: number }) {
  const project = await getProjectById(projectId);
  if (!project) notFound();

  // See apps/product-helper/CLAUDE.md → "System-Design Data Path" — single
  // extractedData blob, accessed via `any` cast until upstream types land.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const extracted = (project as any).projectData?.intakeState?.extractedData;
  const early = extracted?.fmeaEarly ?? null;
  const residual = extracted?.fmeaResidual ?? null;

  if (!early && !residual) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center">
        <div className="mx-auto max-w-md space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            Failure Mode & Effects Analysis
          </h2>
          <p className="text-sm text-muted-foreground">
            FMEA not yet generated. Complete the Wave-2 early pass or Wave-4
            residual pass to populate this view.
          </p>
        </div>
      </div>
    );
  }

  // Resolve manifest-relative artifact paths via the download API.
  const artifactUrlFor = (relPath: string) =>
    `/api/projects/${projectId}/artifacts/download?path=${encodeURIComponent(relPath)}`;

  return <FMEAViewer early={early} residual={residual} artifactUrlFor={artifactUrlFor} />;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function FMEAPage({ params }: PageProps) {
  const { id } = await params;
  const projectId = parseInt(id, 10);
  if (isNaN(projectId)) notFound();

  return (
    <section className="flex-1 p-4 pb-20 md:pb-8 lg:p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">
          Failure Mode &amp; Effects Analysis
        </h1>
        <Suspense fallback={<SectionSkeleton />}>
          <FMEAContent projectId={projectId} />
        </Suspense>
      </div>
    </section>
  );
}
