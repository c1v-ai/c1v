import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProjectById } from '@/app/actions/projects';
import { DiagramGrid } from '@/components/diagrams/diagram-viewer';
import { generateDiagram } from '@/lib/diagrams/generators';

function DiagramsSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-96 rounded-lg animate-pulse"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        />
      ))}
    </div>
  );
}

async function DiagramsContent({ projectId }: { projectId: number }) {
  const project = await getProjectById(projectId);

  if (!project) {
    notFound();
  }

  // Generate diagrams from project data
  const diagrams = project.projectData
    ? [
        {
          type: 'context' as const,
          syntax: generateDiagram('context', {
            projectName: project.name,
            systemBoundaries: project.projectData.systemBoundaries as any,
          }),
          title: 'Context Diagram',
          description:
            'System boundaries showing internal components and external dependencies',
        },
        {
          type: 'useCase' as const,
          syntax: generateDiagram('useCase', {
            actors: project.projectData.actors as any,
            useCases: project.projectData.useCases as any,
          }),
          title: 'Use Case Diagram',
          description: 'Actors and their associated use cases',
        },
        {
          type: 'class' as const,
          syntax: generateDiagram('class', {
            dataEntities: project.projectData.dataEntities as any,
          }),
          title: 'Class Diagram',
          description:
            'Data model showing entities, attributes, and relationships',
        },
      ]
    : [];

  return <DiagramGrid diagrams={diagrams} />;
}

interface DiagramsPageProps {
  params: Promise<{ id: string }>;
}

export default async function DiagramsPage({ params }: DiagramsPageProps) {
  const { id } = await params;
  const projectId = parseInt(id, 10);

  if (isNaN(projectId)) {
    notFound();
  }

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <Suspense fallback={<DiagramsSkeleton />}>
          <DiagramsContent projectId={projectId} />
        </Suspense>
      </div>
    </section>
  );
}
