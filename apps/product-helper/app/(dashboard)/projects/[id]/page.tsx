import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProjectById } from '@/app/actions/projects';
import { QuickInstructions } from '@/components/project/overview/quick-instructions';
import { ArtifactPipeline } from '@/components/project/overview/artifact-pipeline';

function ProjectDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
      <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
    </div>
  );
}

async function ProjectDetail({ projectId }: { projectId: number }) {
  const project = await getProjectById(projectId);

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <QuickInstructions projectId={project.id} />
      <ArtifactPipeline projectId={project.id} />
    </div>
  );
}

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const projectId = parseInt(id, 10);

  if (isNaN(projectId)) {
    notFound();
  }

  return (
    <div className="p-4 pb-20 md:pb-8 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <Suspense fallback={<ProjectDetailSkeleton />}>
          <ProjectDetail projectId={projectId} />
        </Suspense>
      </div>
    </div>
  );
}
