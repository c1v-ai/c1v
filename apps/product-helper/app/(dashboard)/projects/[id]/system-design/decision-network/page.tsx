import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProjectById } from '@/app/actions/projects';
import { getProjectArtifacts } from '@/lib/db/queries';
import { getSignedUrl } from '@/lib/storage/supabase-storage';
import { DownloadDropdown } from '@/components/synthesis/download-dropdown';
import { DataExportMenu } from '@/components/system-design/data-export-menu';
import { buildDownloadArtifacts } from '@/lib/synthesis/build-download-artifacts';
import {
  DecisionNetworkViewer,
  type DecisionNetworkData,
} from '@/components/system-design/decision-network-viewer';

const DECISION_NETWORK_KINDS = [
  'decision_network_v1',
  'decision_network_xlsx',
  'decision_network_svg',
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
          Decision Network
        </h2>
        <p className="text-sm text-muted-foreground">
          The decision network hasn&apos;t been generated yet. Run Deep
          Synthesis to populate the M4 decision graph and Pareto alternatives.
        </p>
      </div>
    </div>
  );
}

async function DecisionNetworkContent({ projectId }: { projectId: number }) {
  const project = await getProjectById(projectId);
  if (!project) notFound();

  const artifacts = await getProjectArtifacts(projectId);
  const row = artifacts.find(
    (a) =>
      a.artifactKind === 'decision_network_v1' && a.synthesisStatus === 'ready',
  );

  if (!row?.storagePath) return <EmptyState />;

  let data: DecisionNetworkData | null = null;
  try {
    const cache = new Map<string, string>();
    const url = await getSignedUrl(row.storagePath, undefined, cache);
    const res = await fetch(url, { cache: 'no-store' });
    if (res.ok) data = (await res.json()) as DecisionNetworkData;
  } catch {
    /* fall through to empty state */
  }

  if (!data) return <EmptyState />;

  return <DecisionNetworkViewer data={data} />;
}

function projectDnRows(
  data: DecisionNetworkData,
): Array<Record<string, unknown>> {
  const rows: Array<Record<string, unknown>> = [];
  for (const node of data.decision_nodes ?? []) {
    rows.push({
      decision_id: node.id,
      decision: node.label,
      winning_alternative: node.winning_alternative?.label ?? '',
      winning_rationale: node.winning_alternative?.rationale ?? '',
      alternatives_count: node.alternatives?.length ?? 0,
    });
  }
  return rows;
}

async function DecisionNetworkHeaderActions({ projectId }: { projectId: number }) {
  const sidecarArtifacts = await buildDownloadArtifacts(
    projectId,
    DECISION_NETWORK_KINDS,
  );

  // Try to also surface a quick-export from the rendered JSON if available.
  let jsonPayload: DecisionNetworkData | null = null;
  const jsonRow = sidecarArtifacts.find(
    (a) => a.kind === 'decision_network_v1' && a.status === 'ready' && a.signed_url,
  );
  if (jsonRow?.signed_url) {
    try {
      const res = await fetch(jsonRow.signed_url, { cache: 'no-store' });
      if (res.ok) jsonPayload = (await res.json()) as DecisionNetworkData;
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
          rows={projectDnRows(jsonPayload)}
          filename="decision-network"
          title="Decision Network"
          hint="Quick export from canonical JSON. For canonical XLSX/SVG use Downloads."
          label="Quick export"
        />
      )}
    </div>
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DecisionNetworkPage({ params }: PageProps) {
  const { id } = await params;
  const projectId = parseInt(id, 10);
  if (isNaN(projectId)) notFound();

  return (
    <section className="flex-1 p-4 pb-20 md:pb-8 lg:p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold text-foreground">
            Decision Network
          </h1>
          <Suspense fallback={null}>
            <DecisionNetworkHeaderActions projectId={projectId} />
          </Suspense>
        </div>
        <Suspense fallback={<SectionSkeleton />}>
          <DecisionNetworkContent projectId={projectId} />
        </Suspense>
      </div>
    </section>
  );
}
