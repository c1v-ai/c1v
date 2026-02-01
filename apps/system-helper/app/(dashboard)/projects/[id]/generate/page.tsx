import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProjectById } from '@/app/actions/projects';
import { PipelinePage } from '@/components/generate/pipeline-page';

function GenerateSkeleton() {
  return (
    <div className="space-y-6">
      <div
        className="h-16 rounded-lg animate-pulse"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      />
      <div
        className="h-2 rounded-full animate-pulse"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      />
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-24 rounded-lg animate-pulse"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        />
      ))}
    </div>
  );
}

async function GenerateContent({ projectId }: { projectId: number }) {
  const project = await getProjectById(projectId);

  if (!project) {
    notFound();
  }

  // Determine which artifacts have been generated
  const generatedArtifacts: string[] = [];
  if (project.artifacts) {
    for (const artifact of project.artifacts) {
      if (artifact.type) {
        generatedArtifacts.push(artifact.type);
      }
    }
  }

  // Check which tech generation outputs exist
  const existingGenerations = {
    techStack: project.projectData?.techStack != null,
    guidelines: project.projectData?.codingGuidelines != null,
    infrastructure: project.projectData?.infrastructureSpec != null,
    stories: false, // User stories are in a separate table, check count
    apiSpec: project.projectData?.apiSpecification != null,
  };

  const completeness = project.projectData?.completeness ?? 0;
  const initialReviewStatus = (project.projectData?.reviewStatus as Record<string, string>) ?? {};

  return (
    <PipelinePage
      projectId={projectId}
      generatedArtifacts={generatedArtifacts}
      completeness={completeness as number}
      existingGenerations={existingGenerations}
      initialReviewStatus={initialReviewStatus as Record<string, 'draft' | 'awaiting-review' | 'approved'>}
    />
  );
}

interface GeneratePageProps {
  params: Promise<{ id: string }>;
}

export default async function GeneratePage({ params }: GeneratePageProps) {
  const { id } = await params;
  const projectId = parseInt(id, 10);

  if (isNaN(projectId)) {
    notFound();
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <Suspense fallback={<GenerateSkeleton />}>
          <GenerateContent projectId={projectId} />
        </Suspense>
      </div>
    </div>
  );
}
