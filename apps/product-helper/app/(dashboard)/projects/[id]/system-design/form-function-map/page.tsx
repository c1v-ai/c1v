import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProjectById } from '@/app/actions/projects';
import { getProjectArtifacts } from '@/lib/db/queries';
import { getSignedUrl } from '@/lib/storage/supabase-storage';
import { DownloadDropdown } from '@/components/synthesis/download-dropdown';
import { DataExportMenu } from '@/components/system-design/data-export-menu';
import { buildDownloadArtifacts } from '@/lib/synthesis/build-download-artifacts';
import {
  FormFunctionMapViewer,
  type FormFunctionMapData,
} from '@/components/system-design/form-function-map-viewer';

const FFM_KINDS = [
  'form_function_map_v1',
  'form_function_map_xlsx',
  'form_function_map_svg',
  'form_function_map_mmd',
] as const;

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

function StorageUnavailableState() {
  return (
    <div className="rounded-lg border bg-card p-12 text-center">
      <div className="mx-auto max-w-md space-y-3">
        <h2 className="text-lg font-semibold text-foreground">
          Form-Function Map
        </h2>
        <p className="text-sm text-muted-foreground">
          Synthesis completed but the artifact file was not saved. Re-run
          synthesis to regenerate.
        </p>
      </div>
    </div>
  );
}

async function FormFunctionMapContent({ projectId }: { projectId: number }) {
  const project = await getProjectById(projectId);
  if (!project) notFound();

  const artifacts = await getProjectArtifacts(projectId);
  const row = artifacts.find(
    (a) =>
      a.artifactKind === 'form_function_map_v1' &&
      a.synthesisStatus === 'ready',
  );

  if (!row) return <EmptyState />;
  if (!row.storagePath) return <StorageUnavailableState />;

  let data: FormFunctionMapData | null = null;
  try {
    const cache = new Map<string, string>();
    const url = await getSignedUrl(row.storagePath, undefined, cache);
    const res = await fetch(url, { cache: 'no-store' });
    if (res.ok) data = (await res.json()) as FormFunctionMapData;
  } catch {
    /* fall through to empty state */
  }

  if (!data) return <EmptyState />;

  return <FormFunctionMapViewer data={data} />;
}

function projectFfmRows(
  data: FormFunctionMapData,
): Array<Record<string, unknown>> {
  const cells = data.phase_3_concept_mapping_matrix?.cells ?? [];
  return cells.map((c) => ({
    function_id: c.function_id,
    form_id: c.form_id,
    score: c.score ?? '',
    interaction_type: c.interaction_type ?? '',
  }));
}

async function FormFunctionMapHeaderActions({ projectId }: { projectId: number }) {
  const sidecarArtifacts = await buildDownloadArtifacts(projectId, FFM_KINDS);

  let jsonPayload: FormFunctionMapData | null = null;
  const jsonRow = sidecarArtifacts.find(
    (a) => a.kind === 'form_function_map_v1' && a.status === 'ready' && a.signed_url,
  );
  if (jsonRow?.signed_url) {
    try {
      const res = await fetch(jsonRow.signed_url, { cache: 'no-store' });
      if (res.ok) jsonPayload = (await res.json()) as FormFunctionMapData;
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="flex items-center gap-2">
      {sidecarArtifacts.length > 0 && (
        <DownloadDropdown
          artifacts={sidecarArtifacts}
          manifestContractVersion="v1"
          projectId={projectId}
        />
      )}
      {jsonPayload && (
        <DataExportMenu
          data={jsonPayload}
          rows={projectFfmRows(jsonPayload)}
          filename="form-function-map"
          title="Form-Function Map"
          hint="Quick export from canonical JSON. For canonical XLSX/SVG/MMD use Downloads."
          label="Quick export"
        />
      )}
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
        <div className="flex items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold text-foreground">
            Form-Function Map
          </h1>
          <Suspense fallback={null}>
            <FormFunctionMapHeaderActions projectId={projectId} />
          </Suspense>
        </div>
        <Suspense fallback={<SectionSkeleton />}>
          <FormFunctionMapContent projectId={projectId} />
        </Suspense>
      </div>
    </section>
  );
}
