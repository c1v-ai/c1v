import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProjectById } from '@/app/actions/projects';
import { getProjectArtifacts } from '@/lib/db/queries';
import { getSignedUrl } from '@/lib/storage/supabase-storage';
import { FMEAViewer } from '@/components/system-design/fmea-viewer';
import { DownloadDropdown } from '@/components/synthesis/download-dropdown';
import type { DownloadDropdownArtifact } from '@/components/synthesis/download-dropdown';

const FMEA_ARTIFACT_KINDS = ['fmea_early_xlsx', 'fmea_residual_xlsx'];
type ArtifactRow = Awaited<ReturnType<typeof getProjectArtifacts>>[number];

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

async function buildFmeaDownloadArtifactsFromRows(
  rows: ArtifactRow[],
): Promise<DownloadDropdownArtifact[]> {
  const cache = new Map<string, string>();
  const entries: DownloadDropdownArtifact[] = [];
  for (const row of rows) {
    if (!FMEA_ARTIFACT_KINDS.includes(row.artifactKind)) continue;
    let signedUrl: string | null = null;
    if (row.synthesisStatus === 'ready' && row.storagePath) {
      try {
        signedUrl = await getSignedUrl(row.storagePath, undefined, cache);
      } catch {
        signedUrl = null;
      }
    }
    entries.push({
      kind: row.artifactKind,
      status: row.synthesisStatus,
      format: row.format,
      signed_url: signedUrl,
      sha256: row.sha256,
      synthesized_at:
        row.synthesizedAt instanceof Date
          ? row.synthesizedAt.toISOString()
          : (row.synthesizedAt as string | null),
    });
  }
  return entries;
}

async function FMEAContent({
  projectId,
  artifacts,
}: {
  projectId: number;
  artifacts: ArtifactRow[];
}) {
  const project = await getProjectById(projectId);
  if (!project) notFound();

  const earlyReady = artifacts.some(
    (a) => a.artifactKind === 'fmea_early_xlsx' && a.synthesisStatus === 'ready',
  );
  const residualReady = artifacts.some(
    (a) => a.artifactKind === 'fmea_residual_xlsx' && a.synthesisStatus === 'ready',
  );

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

  const artifacts = await getProjectArtifacts(projectId);
  const downloadArtifacts = await buildFmeaDownloadArtifactsFromRows(artifacts);

  return (
    <section className="flex-1 p-4 pb-20 md:pb-8 lg:p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold text-foreground">
            Failure Mode &amp; Effects Analysis
          </h1>
          {downloadArtifacts.length > 0 && (
            <DownloadDropdown
              artifacts={downloadArtifacts}
              manifestContractVersion="v1"
              projectId={projectId}
            />
          )}
        </div>
        <Suspense fallback={<SectionSkeleton />}>
          <FMEAContent projectId={projectId} artifacts={artifacts} />
        </Suspense>
      </div>
    </section>
  );
}
