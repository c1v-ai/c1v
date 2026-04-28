import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProjectById } from '@/app/actions/projects';

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
        <h2 className="text-lg font-semibold text-foreground">Open Questions</h2>
        <p className="text-sm text-muted-foreground">
          The system hasn&apos;t emitted any open questions yet. As Deep
          Synthesis runs, M2 NFR clarifications, QFD disambiguations, and FMEA
          risk follow-ups will appear here.
        </p>
      </div>
    </div>
  );
}

interface OpenQuestionEntry {
  id?: string;
  question?: string;
  source?: string;
  status?: 'open' | 'resolved' | 'deferred';
}

interface OpenQuestionsLedger {
  requirements?: OpenQuestionEntry[];
  qfdResolved?: OpenQuestionEntry[];
  riskResolved?: OpenQuestionEntry[];
}

async function OpenQuestionsContent({ projectId }: { projectId: number }) {
  const project = await getProjectById(projectId);
  if (!project) notFound();

  // Ledger keys per system-question-bridge contract (TA1):
  // extractedData.openQuestions.{requirements | qfdResolved | riskResolved}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ledger: OpenQuestionsLedger | undefined = (project as any).projectData
    ?.intakeState?.extractedData?.openQuestions;

  const total =
    (ledger?.requirements?.length ?? 0) +
    (ledger?.qfdResolved?.length ?? 0) +
    (ledger?.riskResolved?.length ?? 0);

  if (total === 0) {
    return <EmptyState />;
  }

  // Real OpenQuestionsViewer is owned by the `interfaces-and-archive-pages`
  // agent (collapsible accordion, deep-links to chat thread).
  return (
    <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
      <p>
        {total} open question{total === 1 ? '' : 's'} have been emitted across
        requirements, QFD, and risk sources. The interactive viewer is being
        prepared.
      </p>
    </div>
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OpenQuestionsPage({ params }: PageProps) {
  const { id } = await params;
  const projectId = parseInt(id, 10);
  if (isNaN(projectId)) notFound();

  return (
    <section className="flex-1 p-4 pb-20 md:pb-8 lg:p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">
          Open Questions
        </h1>
        <Suspense fallback={<SectionSkeleton />}>
          <OpenQuestionsContent projectId={projectId} />
        </Suspense>
      </div>
    </section>
  );
}
