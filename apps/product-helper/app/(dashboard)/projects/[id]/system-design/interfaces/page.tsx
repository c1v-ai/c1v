import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProjectById } from '@/app/actions/projects';
import { InterfacesViewer } from '@/components/system-design/interfaces-viewer';
import { N2MatrixTab } from '@/components/system-design/n2-matrix-tab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DownloadDropdown } from '@/components/synthesis/download-dropdown';
import { DataExportMenu } from '@/components/system-design/data-export-menu';
import { buildDownloadArtifacts } from '@/lib/synthesis/build-download-artifacts';
import type { N2Matrix } from '@/lib/langchain/schemas/module-7-interfaces/n2-matrix';

const N2_KINDS = ['n2_matrix_xlsx'] as const;

interface LegacyInterfaces {
  subsystems?: Array<{ id: string; name?: string }>;
  interfaces?: Array<{
    id?: string;
    source?: string;
    destination?: string;
    payload?: string;
    payloadName?: string;
    payload_name?: string;
    protocol?: string;
    syncStyle?: string;
    sync_style?: string;
    category?: string;
    frequency?: string;
  }>;
  n2Chart?: Record<string, Record<string, string>>;
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

/**
 * Resolve canonical N² matrix from project state.
 *
 * Priority:
 *   1) `extractedData.n2Matrix` / `n2_matrix` — already v1 shape.
 *   2) `extractedData.interfaces.n2Matrix` — already v1 shape, nested.
 *   3) Legacy intake `extractedData.interfaces.{subsystems,n2Chart}` —
 *      adapt to a synthetic v1-shape N2Matrix labeled `inferred:legacy-n2`.
 *
 * Returns `{ matrix, inferred }`. `inferred=true` triggers a banner in the
 * tab to warn the user the data is legacy-derived, not the canonical
 * `module-7.n2-matrix.v1` artifact.
 */
function resolveN2Matrix(project: unknown): {
  matrix: N2Matrix | null;
  inferred: boolean;
} {
  const extracted = (
    project as {
      projectData?: {
        intakeState?: { extractedData?: Record<string, unknown> };
      };
    }
  )?.projectData?.intakeState?.extractedData;
  if (!extracted) return { matrix: null, inferred: false };

  const candidate =
    (extracted.n2Matrix as N2Matrix | undefined) ??
    (extracted.n2_matrix as N2Matrix | undefined) ??
    ((extracted.interfaces as { n2Matrix?: N2Matrix } | undefined)?.n2Matrix);

  if (
    candidate &&
    typeof candidate === 'object' &&
    Array.isArray((candidate as N2Matrix).rows) &&
    Array.isArray((candidate as N2Matrix).functions_axis)
  ) {
    return { matrix: candidate as N2Matrix, inferred: false };
  }

  // Adapt legacy interfaces -> synthetic v1 N2Matrix.
  const legacy = extracted.interfaces as LegacyInterfaces | undefined;
  if (!legacy) return { matrix: null, inferred: false };

  const subsystems = legacy.subsystems ?? [];
  const ifaces = legacy.interfaces ?? [];
  const n2Chart = legacy.n2Chart ?? {};

  if (subsystems.length < 2) return { matrix: null, inferred: false };

  const axis = subsystems.map((s) => s.id);

  // Build IF.NN rows from interfaces[] (preferred) and n2Chart cells.
  const rows: N2Matrix['rows'] = [];
  let counter = 1;
  const seen = new Set<string>();

  for (const iface of ifaces) {
    if (!iface.source || !iface.destination) continue;
    const id = `IF.${String(counter).padStart(2, '0')}`;
    counter += 1;
    const key = `${iface.source}::${iface.destination}::${iface.payload ?? iface.payloadName ?? iface.payload_name ?? ''}`;
    seen.add(key);
    const sync = (iface.syncStyle ?? iface.sync_style ?? 'sync') as
      | 'sync'
      | 'async'
      | 'streaming'
      | 'batch';
    rows.push({
      id,
      producer: iface.source,
      consumer: iface.destination,
      payload_name:
        iface.payloadName ?? iface.payload_name ?? iface.payload ?? 'payload',
      data_flow_ref: null,
      protocol: iface.protocol ?? 'unspecified',
      sync_style: ['sync', 'async', 'streaming', 'batch'].includes(sync)
        ? sync
        : 'sync',
      criticality: 'medium',
      notes: iface.category ?? iface.frequency,
    });
  }

  // Fill from n2Chart for any cells not already represented in interfaces[].
  for (const [from, toMap] of Object.entries(n2Chart)) {
    for (const [to, payload] of Object.entries(toMap)) {
      if (!payload || from === to) continue;
      const key = `${from}::${to}::${payload}`;
      if (seen.has(key)) continue;
      const id = `IF.${String(counter).padStart(2, '0')}`;
      counter += 1;
      rows.push({
        id,
        producer: from,
        consumer: to,
        payload_name: payload,
        data_flow_ref: null,
        protocol: 'unspecified',
        sync_style: 'sync',
        criticality: 'medium',
      });
    }
  }

  if (rows.length === 0) return { matrix: null, inferred: false };

  const synthetic: N2Matrix = {
    _schema: 'module-7.n2-matrix.v1',
    _output_path: 'inferred:legacy-n2',
    _upstream_refs: {
      ffbd: 'inferred:legacy',
      data_flows: 'inferred:legacy',
    },
    produced_at: new Date().toISOString(),
    produced_by: 'legacy-n2-adapter',
    system_name: 'Inferred from intake interfaces',
    functions_axis: axis,
    rows,
  };
  return { matrix: synthetic, inferred: true };
}

function projectN2Rows(matrix: N2Matrix): Array<Record<string, unknown>> {
  return matrix.rows.map((r) => ({
    id: r.id,
    producer: r.producer,
    consumer: r.consumer,
    payload: r.payload_name,
    protocol: r.protocol,
    sync_style: r.sync_style,
    criticality: r.criticality,
    data_flow_ref: r.data_flow_ref ?? '',
    notes: r.notes ?? '',
  }));
}

async function InterfacesContent({ projectId }: { projectId: number }) {
  const project = await getProjectById(projectId);
  if (!project) notFound();

  const interfaces = (
    project as {
      projectData?: {
        intakeState?: { extractedData?: { interfaces?: unknown } };
      };
    }
  ).projectData?.intakeState?.extractedData?.interfaces;

  const { matrix: n2Matrix, inferred } = resolveN2Matrix(project);

  if (!interfaces && !n2Matrix) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center">
        <div className="mx-auto max-w-md space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            Interface Definitions
          </h2>
          <p className="text-sm text-muted-foreground">
            Interface definitions not yet generated. Complete the intake chat
            to generate your N² Matrix, Sequence Diagrams, and Interface Specs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="n2" className="space-y-4">
      <TabsList>
        <TabsTrigger value="n2">N² Matrix</TabsTrigger>
        <TabsTrigger value="diagrams" disabled={!interfaces}>
          Sequence Diagrams &amp; Specs
        </TabsTrigger>
      </TabsList>

      <TabsContent value="n2">
        {n2Matrix ? (
          <div className="space-y-3">
            {inferred && (
              <div className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
                <Badge variant="outline" className="mr-2 text-[10px]">
                  Inferred
                </Badge>
                Showing N² matrix derived from intake interface data. Run Deep
                Synthesis to produce the canonical{' '}
                <code className="font-mono">module-7.n2-matrix.v1</code>{' '}
                artifact.
              </div>
            )}
            <N2MatrixTab n2Matrix={n2Matrix} />
          </div>
        ) : (
          <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
            No N² matrix artifact available yet for this project.
          </div>
        )}
      </TabsContent>

      <TabsContent value="diagrams">
        {interfaces ? (
          <InterfacesViewer interfaces={interfaces as never} />
        ) : null}
      </TabsContent>
    </Tabs>
  );
}

async function InterfacesHeaderActions({ projectId }: { projectId: number }) {
  const project = await getProjectById(projectId);
  if (!project) return null;

  const { matrix: n2Matrix, inferred } = resolveN2Matrix(project);
  const sidecarArtifacts = await buildDownloadArtifacts(projectId, N2_KINDS);
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
      {n2Matrix && (
        <DataExportMenu
          data={n2Matrix}
          rows={projectN2Rows(n2Matrix)}
          filename="n2-matrix"
          title="N² Matrix"
          hint={
            inferred
              ? 'Inferred from intake interfaces. Run synthesis for canonical XLSX.'
              : hasSidecar
                ? 'Quick export. For canonical XLSX use Downloads.'
                : 'Exporting from intake-stage data.'
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

export default async function InterfacesPage({ params }: PageProps) {
  const { id } = await params;
  const projectId = parseInt(id, 10);
  if (isNaN(projectId)) notFound();

  return (
    <section className="flex-1 p-4 pb-20 md:pb-8 lg:p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold text-foreground">
            Interface Definitions
          </h1>
          <Suspense fallback={null}>
            <InterfacesHeaderActions projectId={projectId} />
          </Suspense>
        </div>
        <Suspense fallback={<SectionSkeleton />}>
          <InterfacesContent projectId={projectId} />
        </Suspense>
      </div>
    </section>
  );
}
