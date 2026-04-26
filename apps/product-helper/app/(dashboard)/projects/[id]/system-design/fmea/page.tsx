import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProjectById } from '@/app/actions/projects';
import { getProjectArtifacts } from '@/lib/db/queries';
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

function EmptyState() {
  return (
    <div className="rounded-lg border bg-card p-12 text-center">
      <div className="mx-auto max-w-md space-y-3">
        <h2 className="text-lg font-semibold text-foreground">
          Failure Mode &amp; Effects Analysis
        </h2>
        <p className="text-sm text-muted-foreground">
          FMEA hasn&apos;t been generated yet. Run Deep Synthesis to populate
          the early and residual risk passes.
        </p>
      </div>
    </div>
  );
}

async function FMEAContent({ projectId }: { projectId: number }) {
  const project = await getProjectById(projectId);
  if (!project) notFound();

  // v2.1 (D-V21.17): prefer per-tenant artifacts from project_artifacts.
  // No fallback to a canned exemplar.
  const artifacts = await getProjectArtifacts(projectId);
  const earlyReady = artifacts.some(
    (a) => a.artifactKind === 'fmea_early_xlsx' && a.synthesisStatus === 'ready',
  );
  const residualReady = artifacts.some(
    (a) => a.artifactKind === 'fmea_residual_xlsx' && a.synthesisStatus === 'ready',
  );

  // Back-compat: legacy intake captured FMEA on `extractedData` before
  // synthesis-stage artifacts moved to project_artifacts. NOT canned data —
  // it's the tenant's own pre-v2.1 capture.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const extracted = (project as any).projectData?.intakeState?.extractedData;
  const legacyEarly = extracted?.fmeaEarly ?? null;
  const legacyResidual = extracted?.fmeaResidual ?? null;

  const hasArtifact = earlyReady || residualReady;
  const hasLegacy = !!(legacyEarly || legacyResidual);

  if (!hasArtifact && !hasLegacy) {
    return <EmptyState />;
  }

  const artifactUrlFor = (relPath: string) =>
    `/api/projects/${projectId}/artifacts/download?path=${encodeURIComponent(relPath)}`;

  return (
    <FMEAViewer
      early={legacyEarly}
      residual={legacyResidual}
      artifactUrlFor={artifactUrlFor}
    />
  );
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
