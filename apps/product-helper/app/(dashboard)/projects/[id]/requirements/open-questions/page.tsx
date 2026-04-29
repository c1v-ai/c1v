import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProjectById } from '@/app/actions/projects';
import {
  OpenQuestionsViewer,
  type OpenQuestionsLedger,
} from '@/components/requirements/open-questions-viewer';

function SectionSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 rounded animate-pulse bg-muted" />
      <div className="h-64 rounded animate-pulse bg-muted" />
    </div>
  );
}

async function OpenQuestionsContent({ projectId }: { projectId: number }) {
  const project = await getProjectById(projectId);
  if (!project) notFound();

  // Ledger keys per system-question-bridge contract (TA1):
  // extractedData.openQuestions.{requirements | qfdResolved | riskResolved}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ledger: OpenQuestionsLedger | undefined | null = (project as any)
    .projectData?.intakeState?.extractedData?.openQuestions;

  return <OpenQuestionsViewer projectId={projectId} ledger={ledger} />;
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
