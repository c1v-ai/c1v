import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProjectById } from '@/app/actions/projects';
import { TechStackSection } from '@/components/projects/sections/tech-stack-section';

function SectionSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 rounded animate-pulse" style={{ backgroundColor: 'var(--bg-secondary)' }} />
      <div className="h-64 rounded animate-pulse" style={{ backgroundColor: 'var(--bg-secondary)' }} />
    </div>
  );
}

async function SectionLoader({ projectId }: { projectId: number }) {
  const project = await getProjectById(projectId);
  if (!project) notFound();
  return <TechStackSection project={project as any} />;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TechStackPage({ params }: PageProps) {
  const { id } = await params;
  const projectId = parseInt(id, 10);
  if (isNaN(projectId)) notFound();

  return (
    <section className="flex-1 p-4 pb-20 md:pb-8 lg:p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <Suspense fallback={<SectionSkeleton />}>
          <SectionLoader projectId={projectId} />
        </Suspense>
      </div>
    </section>
  );
}
