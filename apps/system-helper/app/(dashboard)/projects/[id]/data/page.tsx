import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProjectById } from '@/app/actions/projects';
import { ExtractedDataDisplay } from '@/components/extracted-data/data-display';

function DataSkeleton() {
  return (
    <div className="space-y-6">
      <div
        className="h-32 rounded-lg animate-pulse"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      />
      <div
        className="h-64 rounded-lg animate-pulse"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      />
    </div>
  );
}

async function DataContent({ projectId }: { projectId: number }) {
  const project = await getProjectById(projectId);

  if (!project) {
    notFound();
  }

  return (
    <ExtractedDataDisplay
      actors={project.projectData?.actors as any}
      useCases={project.projectData?.useCases as any}
      systemBoundaries={project.projectData?.systemBoundaries as any}
      dataEntities={project.projectData?.dataEntities as any}
      completeness={project.projectData?.completeness ?? undefined}
      lastExtractedAt={project.projectData?.lastExtractedAt ?? undefined}
    />
  );
}

interface DataPageProps {
  params: Promise<{ id: string }>;
}

export default async function DataPage({ params }: DataPageProps) {
  const { id } = await params;
  const projectId = parseInt(id, 10);

  if (isNaN(projectId)) {
    notFound();
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <Suspense fallback={<DataSkeleton />}>
          <DataContent projectId={projectId} />
        </Suspense>
      </div>
    </div>
  );
}
