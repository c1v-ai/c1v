import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProjectById } from '@/app/actions/projects';
import { getProjectArtifacts } from '@/lib/db/queries';
import { getSignedUrl } from '@/lib/storage/supabase-storage';
import { FMEAViewer } from '@/components/system-design/fmea-viewer';
import { DownloadDropdown } from '@/components/synthesis/download-dropdown';
import { DataExportMenu } from '@/components/system-design/data-export-menu';
import type { DownloadDropdownArtifact } from '@/components/synthesis/download-dropdown';
import type { FMEARow, FMEAInstance } from '@/components/system-design/fmea-viewer';

const FMEA_ARTIFACT_KINDS = ['fmea_early_xlsx', 'fmea_residual_xlsx'];
type ArtifactRow = Awaited<ReturnType<typeof getProjectArtifacts>>[number];

function rowsFromInstance(
  instance: FMEAInstance | null | undefined,
  variant: 'early' | 'residual',
): Array<Record<string, unknown>> {
  if (!instance) return [];
  const t = instance.fmea_table;
  let rows: FMEARow[] = [];
  if (Array.isArray(t)) rows = t;
  else if (t && Array.isArray(t.rows)) rows = t.rows;

  // Some intake captures land under `failure_modes` instead of `fmea_table`.
  if (rows.length === 0 && Array.isArray((instance as { failure_modes?: unknown }).failure_modes)) {
    rows = (instance as { failure_modes: FMEARow[] }).failure_modes;
  }

  return rows.map((r) => ({
    variant,
    id: r.id ?? '',
    function: r.function ?? '',
    failure_mode: r.failure_mode ?? r.failureMode ?? '',
    cause: r.cause ?? '',
    effect: r.effect ?? '',
    severity: r.severity ?? '',
    occurrence: r.occurrence ?? '',
    detection: r.detection ?? '',
    rpn: r.rpn ?? '',
    mitigation: r.mitigation ?? '',
  }));
}

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
  const project = await getProjectById(projectId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const extracted = (project as any)?.projectData?.intakeState?.extractedData;
  const legacyEarly = (extracted?.fmeaEarly ?? null) as FMEAInstance | null;
  const legacyResidual = (extracted?.fmeaResidual ?? null) as FMEAInstance | null;
  const legacyRows = [
    ...rowsFromInstance(legacyEarly, 'early'),
    ...rowsFromInstance(legacyResidual, 'residual'),
  ];
  const hasSidecarReady = downloadArtifacts.some((a) => a.status === 'ready');

  return (
    <section className="flex-1 p-4 pb-20 md:pb-8 lg:p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold text-foreground">
            Failure Mode &amp; Effects Analysis
          </h1>
          <div className="flex items-center gap-2">
            {downloadArtifacts.length > 0 && (
              <DownloadDropdown
                artifacts={downloadArtifacts}
                manifestContractVersion="v1"
                projectId={projectId}
              />
            )}
            {legacyRows.length > 0 && (
              <DataExportMenu
                data={{ early: legacyEarly, residual: legacyResidual }}
                rows={legacyRows}
                filename="fmea"
                title="FMEA — Failure Modes"
                hint={
                  hasSidecarReady
                    ? 'Quick export from intake data. For canonical XLSX use Downloads.'
                    : 'Exporting from intake-stage data. Run synthesis for canonical XLSX.'
                }
                label={hasSidecarReady ? 'Quick export' : 'Export'}
              />
            )}
          </div>
        </div>
        <Suspense fallback={<SectionSkeleton />}>
          <FMEAContent projectId={projectId} artifacts={artifacts} />
        </Suspense>
      </div>
    </section>
  );
}
