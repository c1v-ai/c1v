import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProjectById } from '@/app/actions/projects';
import { getLatestSynthesis } from '@/lib/db/queries';

function SectionSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-64 rounded animate-pulse bg-muted" />
      <div className="h-96 rounded-lg animate-pulse bg-muted" />
    </div>
  );
}

function EmptyState({ projectId }: { projectId: number }) {
  // D-V21.17: zero canned-c1v data. No "AV.01" / "Sonnet 4.5" / "pgvector"
  // strings render here. Reviewer-recruiter teaching surface lives in the
  // synthesis-viewer agent's empty-state.tsx (5 blurred methodology pillars).
  return (
    <div className="rounded-lg border bg-card p-12 text-center">
      <div className="mx-auto max-w-md space-y-4">
        <h2 className="text-xl font-semibold text-foreground">
          Architecture Recommendation
        </h2>
        <p className="text-sm text-muted-foreground">
          Your project hasn&apos;t been synthesized yet. Run Deep Synthesis to
          populate the recommendation, decision derivation, alternatives, and
          provenance trail.
        </p>
        <a
          href={`/projects/${projectId}/generate`}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Run Deep Synthesis
        </a>
      </div>
    </div>
  );
}

async function SynthesisContent({ projectId }: { projectId: number }) {
  const project = await getProjectById(projectId);
  if (!project) notFound();

  const latest = await getLatestSynthesis(projectId);

  if (!latest || latest.synthesisStatus !== 'ready') {
    return <EmptyState projectId={projectId} />;
  }

  // RecommendationViewer ships from the `synthesis-viewer` agent. Until that
  // commit lands, surface a minimal "ready" stub that links to the artifact.
  const downloadUrl = latest.storagePath
    ? `/api/projects/${projectId}/artifacts/download?path=${encodeURIComponent(latest.storagePath)}`
    : null;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Recommendation Ready
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          The architecture recommendation has been synthesized. The full
          interactive viewer is being prepared.
        </p>
        {downloadUrl && (
          <a
            href={downloadUrl}
            className="inline-flex items-center justify-center rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Download recommendation.json
          </a>
        )}
      </div>
    </div>
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SynthesisPage({ params }: PageProps) {
  const { id } = await params;
  const projectId = parseInt(id, 10);
  if (isNaN(projectId)) notFound();

  return (
    <section className="flex-1 p-4 pb-20 md:pb-8 lg:p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">
          Architecture Recommendation
        </h1>
        <Suspense fallback={<SectionSkeleton />}>
          <SynthesisContent projectId={projectId} />
        </Suspense>
      </div>
    </section>
  );
}
