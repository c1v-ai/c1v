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

/**
 * Map artifact type to display info
 */
function getArtifactDisplayInfo(type: string): { title: string; description: string; displayType: 'context' | 'useCase' | 'class' } {
  switch (type) {
    case 'use_case_diagram':
      return { title: 'Use Case Diagram', description: 'Actors and their associated use cases', displayType: 'useCase' };
    case 'class_diagram':
      return { title: 'Class Diagram', description: 'Data model showing entities and relationships', displayType: 'class' };
    case 'sequence_diagram':
      return { title: 'Sequence Diagram', description: 'Interaction flow between components', displayType: 'useCase' };
    case 'activity_diagram':
      return { title: 'Activity Diagram', description: 'Workflow and activity flow', displayType: 'context' };
    case 'context_diagram':
    default:
      return { title: 'Context Diagram', description: 'System boundary with actors and external entities', displayType: 'context' };
  }
}

async function DiagramsContent({ projectId }: { projectId: number }) {
  const project = await getProjectById(projectId);

  if (!project) {
    notFound();
  }

  // First, get diagrams from artifacts table (AI-generated)
  const artifactDiagrams = (project.artifacts || []).map((artifact, index) => {
    const content = artifact.content as { mermaid?: string } | null;
    const displayInfo = getArtifactDisplayInfo(artifact.type);
    return {
      type: displayInfo.displayType,
      syntax: content?.mermaid || '',
      title: `${displayInfo.title} #${index + 1}`,
      description: displayInfo.description,
    };
  }).filter(d => d.syntax); // Only include diagrams with actual syntax

  // If we have AI-generated diagrams, show those
  if (artifactDiagrams.length > 0) {
    return <DiagramGrid diagrams={artifactDiagrams} />;
  }

  // Fallback: Generate diagrams from project data (if no AI diagrams yet)
  const generatedDiagrams = project.projectData
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

  return <DiagramGrid diagrams={generatedDiagrams} />;
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
