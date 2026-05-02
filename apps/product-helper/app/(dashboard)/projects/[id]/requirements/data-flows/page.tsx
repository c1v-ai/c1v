import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProjectById } from '@/app/actions/projects';
import { getProjectArtifacts } from '@/lib/db/queries';
import { DataFlowsViewer } from '@/components/requirements/data-flows-viewer';
import { DataExportMenu } from '@/components/system-design/data-export-menu';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import type { DataFlows } from '@/lib/langchain/schemas/module-1/phase-2-5-data-flows';

interface LegacyInterface {
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
}

interface InferredFlow {
  id: string;
  source: string;
  destination: string;
  payload: string;
  protocol: string;
  category: string;
  frequency: string;
}

function SectionSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 rounded animate-pulse bg-muted" />
      <div className="h-64 rounded animate-pulse bg-muted" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border bg-card p-12 text-center">
      <div className="mx-auto max-w-md space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Data Flows</h2>
        <p className="text-sm text-muted-foreground">
          Data flows haven&apos;t been generated yet. Run Deep Synthesis to
          populate the M1 phase-2.5 data flow inventory, or complete the
          intake chat to capture interface definitions we can derive flows
          from.
        </p>
      </div>
    </div>
  );
}

function inferFlowsFromInterfaces(
  ifaces: LegacyInterface[] | undefined,
): InferredFlow[] {
  if (!ifaces || ifaces.length === 0) return [];
  return ifaces
    .filter((i) => i.source && i.destination)
    .map((i, idx) => ({
      id: i.id ?? `DE.${String(idx + 1).padStart(2, '0')}`,
      source: i.source!,
      destination: i.destination!,
      payload: i.payloadName ?? i.payload_name ?? i.payload ?? 'payload',
      protocol: i.protocol ?? 'unspecified',
      category: i.category ?? '',
      frequency: i.frequency ?? '',
    }));
}

function InferredFlowRow({ flow }: { flow: InferredFlow }) {
  return (
    <li className="rounded-lg border bg-card p-4">
      <div className="flex items-start gap-3 flex-wrap">
        <span className="font-mono text-xs font-semibold text-foreground rounded bg-muted px-2 py-0.5">
          {flow.id}
        </span>
        <span className="font-semibold text-foreground">{flow.payload}</span>
        {flow.protocol && (
          <Badge variant="outline" className="text-[10px]">
            {flow.protocol}
          </Badge>
        )}
        {flow.category && (
          <Badge variant="outline" className="text-[10px]">
            {flow.category}
          </Badge>
        )}
        {flow.frequency && (
          <span className="text-[10px] text-muted-foreground">
            {flow.frequency}
          </span>
        )}
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs">
        <span className="rounded-md border bg-background px-2 py-1 font-mono text-foreground">
          {flow.source}
        </span>
        <ArrowRight
          className="h-3 w-3 text-muted-foreground"
          aria-hidden="true"
        />
        <span className="rounded-md border bg-background px-2 py-1 font-mono text-foreground">
          {flow.destination}
        </span>
      </div>
    </li>
  );
}

function InferredDataFlowsCard({ flows }: { flows: InferredFlow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Data Flows
          <Badge variant="outline" className="text-[10px]">
            Inferred
          </Badge>
        </CardTitle>
        <CardDescription>
          {flows.length} flow{flows.length === 1 ? '' : 's'} derived from
          intake-stage Interface definitions. This is{' '}
          <strong>not</strong> the canonical{' '}
          <code className="font-mono">data_flows.v1</code> artifact — run Deep
          Synthesis to produce M1 phase-2.5 output.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {flows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No flows recorded.</p>
        ) : (
          <ul className="space-y-3">
            {flows.map((f) => (
              <InferredFlowRow key={f.id} flow={f} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

async function DataFlowsContent({ projectId }: { projectId: number }) {
  const project = await getProjectById(projectId);
  if (!project) notFound();

  const artifacts = await getProjectArtifacts(projectId);
  const artifactReady = artifacts.some(
    (a) => a.artifactKind === 'data_flows_v1' && a.synthesisStatus === 'ready',
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const extracted = (project as any).projectData?.intakeState?.extractedData;
  const legacy = extracted?.dataFlows as DataFlows | null | undefined;
  const legacyIfaces = (
    extracted?.interfaces as { interfaces?: LegacyInterface[] } | undefined
  )?.interfaces;
  const inferred = inferFlowsFromInterfaces(legacyIfaces);

  if (legacy) {
    return <DataFlowsViewer dataFlows={legacy} />;
  }

  if (artifactReady) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
          Canonical data-flows artifact is ready. Use the export menu in the
          page header to download.
        </div>
        {inferred.length > 0 && <InferredDataFlowsCard flows={inferred} />}
      </div>
    );
  }

  if (inferred.length > 0) {
    return <InferredDataFlowsCard flows={inferred} />;
  }

  return <EmptyState />;
}

async function DataFlowsHeaderActions({ projectId }: { projectId: number }) {
  const project = await getProjectById(projectId);
  if (!project) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const extracted = (project as any).projectData?.intakeState?.extractedData;
  const legacy = extracted?.dataFlows as DataFlows | null | undefined;
  const legacyIfaces = (
    extracted?.interfaces as { interfaces?: LegacyInterface[] } | undefined
  )?.interfaces;
  const inferred = inferFlowsFromInterfaces(legacyIfaces);

  if (legacy) {
    const rows = (legacy.entries ?? []).map((e) => ({
      id: e.id,
      name: e.name,
      source: e.source,
      sink: e.sink,
      payload: e.payload_shape?.name ?? '',
      criticality: e.criticality,
      pii_class: e.pii_class,
      description: e.description,
    }));
    return (
      <DataExportMenu
        data={legacy}
        rows={rows}
        filename="data-flows"
        title="Data Flows"
        hint="Canonical data_flows.v1 export."
      />
    );
  }

  if (inferred.length > 0) {
    return (
      <DataExportMenu
        data={{ inferred_from: 'extractedData.interfaces.interfaces', flows: inferred }}
        rows={inferred as unknown as Array<Record<string, unknown>>}
        filename="data-flows-inferred"
        title="Data Flows (inferred)"
        hint="Inferred from interface definitions. Run synthesis for canonical data_flows.v1."
      />
    );
  }

  return null;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DataFlowsPage({ params }: PageProps) {
  const { id } = await params;
  const projectId = parseInt(id, 10);
  if (isNaN(projectId)) notFound();

  return (
    <section className="flex-1 p-4 pb-20 md:pb-8 lg:p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold text-foreground">Data Flows</h1>
          <Suspense fallback={null}>
            <DataFlowsHeaderActions projectId={projectId} />
          </Suspense>
        </div>
        <Suspense fallback={<SectionSkeleton />}>
          <DataFlowsContent projectId={projectId} />
        </Suspense>
      </div>
    </section>
  );
}
