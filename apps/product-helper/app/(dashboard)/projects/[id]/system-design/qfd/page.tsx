import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProjectById } from '@/app/actions/projects';
import { QFDViewer } from '@/components/system-design/qfd-viewer';
import { DownloadDropdown } from '@/components/synthesis/download-dropdown';
import { DataExportMenu } from '@/components/system-design/data-export-menu';
import { buildDownloadArtifacts } from '@/lib/synthesis/build-download-artifacts';
import type { Qfd } from '@/lib/langchain/schemas';

const HOQ_KINDS = ['hoq_xlsx'] as const;

function SectionSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-56 rounded animate-pulse bg-muted" />
      <div className="h-[500px] rounded-lg animate-pulse bg-muted" />
    </div>
  );
}

/**
 * Project a Qfd into flat row-records for CSV/PPTX export. One row per
 * customer need; columns: weight, then one column per engineering
 * characteristic (cell value = relationship strength or blank).
 */
function projectRows(qfd: Qfd): Array<Record<string, unknown>> {
  const strengthSym = (s: string) =>
    s === 'strong' ? '●' : s === 'moderate' ? '○' : s === 'weak' ? '△' : '';

  const relMap = new Map<string, string>();
  for (const r of qfd.relationships ?? []) {
    relMap.set(`${r.needId}::${r.charId}`, strengthSym(r.strength));
  }

  return (qfd.customerNeeds ?? []).map((need) => {
    const row: Record<string, unknown> = {
      need_id: need.id,
      need: need.name,
      weight: need.relativeImportance,
    };
    for (const ec of qfd.engineeringCharacteristics ?? []) {
      row[`${ec.id} — ${ec.name}`] = relMap.get(`${need.id}::${ec.id}`) ?? '';
    }
    return row;
  });
}

async function QFDContent({ projectId }: { projectId: number }) {
  const project = await getProjectById(projectId);
  if (!project) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const qfd = (project as any).projectData?.intakeState?.extractedData?.qfd as
    | Qfd
    | undefined;

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

async function QFDHeaderActions({ projectId }: { projectId: number }) {
  const project = await getProjectById(projectId);
  if (!project) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const qfd = (project as any).projectData?.intakeState?.extractedData?.qfd as
    | Qfd
    | undefined;
  const sidecarArtifacts = await buildDownloadArtifacts(projectId, HOQ_KINDS);
  const hasSidecar = sidecarArtifacts.some((a) => a.status === 'ready');

  return (
    <div className="flex items-center gap-2">
      {sidecarArtifacts.length > 0 && (
        <DownloadDropdown
          artifacts={sidecarArtifacts}
          manifestContractVersion="v1"
          projectId={projectId}
        />
      )}
      {qfd && (
        <DataExportMenu
          data={qfd}
          rows={projectRows(qfd)}
          filename="house-of-quality"
          title="House of Quality"
          hint={
            hasSidecar
              ? 'Quick export from intake data. For canonical XLSX use Downloads.'
              : 'Exporting from intake-stage data. Run synthesis for canonical XLSX.'
          }
          label={hasSidecar ? 'Quick export' : 'Export'}
        />
      )}
    </div>
  );
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
        <div className="flex items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold text-foreground">
            House of Quality (QFD)
          </h1>
          <Suspense fallback={null}>
            <QFDHeaderActions projectId={projectId} />
          </Suspense>
        </div>
        <Suspense fallback={<SectionSkeleton />}>
          <QFDContent projectId={projectId} />
        </Suspense>
      </div>
    </section>
  );
}
