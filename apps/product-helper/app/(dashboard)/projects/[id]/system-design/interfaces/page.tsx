import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProjectById } from '@/app/actions/projects';
import { InterfacesViewer } from '@/components/system-design/interfaces-viewer';
import { N2MatrixTab } from '@/components/system-design/n2-matrix-tab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { N2Matrix } from '@/lib/langchain/schemas/module-7-interfaces/n2-matrix';

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
 * Resolve the canonical N² matrix for the project. For v2.1 Wave A this
 * reads from the legacy extractedData blob if present; once TA1 surfaces
 * the v1 artifact via project_artifacts (kind 'n2_matrix_v1' / 'n2_matrix_xlsx')
 * the resolver swaps to that source.
 */
function resolveN2Matrix(project: unknown): N2Matrix | null {
  const extracted = (project as {
    projectData?: { intakeState?: { extractedData?: Record<string, unknown> } };
  })?.projectData?.intakeState?.extractedData;
  if (!extracted) return null;

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
    return candidate as N2Matrix;
  }
  return null;
}

async function InterfacesContent({ projectId }: { projectId: number }) {
  const project = await getProjectById(projectId);
  if (!project) notFound();

  const interfaces = (project as {
    projectData?: { intakeState?: { extractedData?: { interfaces?: unknown } } };
  }).projectData?.intakeState?.extractedData?.interfaces;

  const n2Matrix = resolveN2Matrix(project);

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

  // EC-V21-A.5: N² Matrix promoted to first sub-tab. Default tab = "n2".
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
          <N2MatrixTab n2Matrix={n2Matrix} />
        ) : (
          <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
            No N² matrix artifact available yet for this project.
          </div>
        )}
      </TabsContent>

      <TabsContent value="diagrams">
        {/* Frozen InterfacesViewer renders DFD / N²-legacy / Sequence sub-tabs. */}
        {interfaces ? (
          <InterfacesViewer interfaces={interfaces as never} />
        ) : null}
      </TabsContent>
    </Tabs>
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
        <h1 className="text-2xl font-bold text-foreground mb-6">
          Interface Definitions
        </h1>
        <Suspense fallback={<SectionSkeleton />}>
          <InterfacesContent projectId={projectId} />
        </Suspense>
      </div>
    </section>
  );
}
