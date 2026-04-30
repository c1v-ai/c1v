import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProjectById } from '@/app/actions/projects';
import { DecisionMatrixViewer } from '@/components/system-design/decision-matrix-viewer';
import { DataExportMenu } from '@/components/system-design/data-export-menu';
import type {
  DecisionMatrix,
  PerformanceCriterion,
  DesignAlternative,
} from '@/lib/langchain/schemas';

function SectionSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 rounded animate-pulse bg-muted" />
      <div className="h-96 rounded-lg animate-pulse bg-muted" />
    </div>
  );
}

/**
 * Project a DecisionMatrix into flat row-records for CSV/PPTX export.
 * One row per criterion; one column per alternative score, plus weight
 * and unit. This matches the in-app table's mental model so the export
 * lines up with what the user sees.
 */
function projectRows(
  matrix: DecisionMatrix,
): Array<Record<string, unknown>> {
  const { criteria, alternatives } = matrix;
  return criteria.map((c: PerformanceCriterion) => {
    const row: Record<string, unknown> = {
      criterion_id: c.id,
      criterion: c.name,
      weight: c.weight,
      unit: c.unit,
    };
    if (c.minAcceptable !== undefined) row.min_acceptable = c.minAcceptable;
    if (c.targetValue !== undefined) row.target = c.targetValue;
    alternatives.forEach((alt: DesignAlternative) => {
      row[`${alt.id} — ${alt.name}`] = alt.scores[c.id] ?? null;
    });
    return row;
  });
}

async function DecisionMatrixContent({ projectId }: { projectId: number }) {
  const project = await getProjectById(projectId);
  if (!project) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const decisionMatrix = (project as any).projectData?.intakeState
    ?.extractedData?.decisionMatrix as DecisionMatrix | undefined;

  if (!decisionMatrix) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center">
        <div className="mx-auto max-w-md space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            Decision Matrix
          </h2>
          <p className="text-sm text-muted-foreground">
            Decision Matrix not yet generated. Complete the intake chat to
            generate your performance assessment and design alternative
            comparison.
          </p>
        </div>
      </div>
    );
  }

  return <DecisionMatrixViewer decisionMatrix={decisionMatrix} />;
}

async function DecisionMatrixHeader({ projectId }: { projectId: number }) {
  const project = await getProjectById(projectId);
  if (!project) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const decisionMatrix = (project as any).projectData?.intakeState
    ?.extractedData?.decisionMatrix as DecisionMatrix | undefined;

  if (!decisionMatrix) return null;

  const rows = projectRows(decisionMatrix);

  return (
    <DataExportMenu
      data={decisionMatrix}
      rows={rows}
      filename="decision-matrix"
      title="Decision Matrix"
      hint="Exporting from intake-stage data. Run synthesis for canonical XLSX."
    />
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DecisionMatrixPage({ params }: PageProps) {
  const { id } = await params;
  const projectId = parseInt(id, 10);
  if (isNaN(projectId)) notFound();

  return (
    <section className="flex-1 p-4 pb-20 md:pb-8 lg:p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold text-foreground">
            Decision Matrix
          </h1>
          <Suspense fallback={null}>
            <DecisionMatrixHeader projectId={projectId} />
          </Suspense>
        </div>
        <Suspense fallback={<SectionSkeleton />}>
          <DecisionMatrixContent projectId={projectId} />
        </Suspense>
      </div>
    </section>
  );
}
