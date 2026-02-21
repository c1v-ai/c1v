import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { getProjectById } from '@/app/actions/projects';
import { getConversations } from '@/app/actions/conversations';
import { ProjectLayoutClient } from './project-layout-client';
import { stripVisionMetadata } from '@/lib/utils/vision';

function LayoutLoadingSkeleton() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-accent" />
        <p className="text-muted-foreground">Loading project...</p>
      </div>
    </div>
  );
}

async function ProjectLayoutContent({
  projectId,
  children,
}: {
  projectId: number;
  children: React.ReactNode;
}) {
  const project = await getProjectById(projectId);

  if (!project) {
    notFound();
  }

  // Load conversation history
  const conversations = await getConversations(projectId);

  // Convert to Vercel AI SDK format, stripping metadata from first user message
  let firstUserSeen = false;
  const initialMessages = conversations.map((conv) => {
    let content = conv.content;
    if (conv.role === 'user' && !firstUserSeen) {
      firstUserSeen = true;
      content = stripVisionMetadata(content);
    }
    return {
      id: `${conv.id}`,
      role: conv.role as 'user' | 'assistant',
      content,
      createdAt: conv.createdAt,
    };
  });

  const projectData = project.projectData;
  const artifacts = project.artifacts || [];

  return (
    <ProjectLayoutClient
      projectId={projectId}
      projectName={project.name}
      projectStatus={project.status}
      projectVision={project.vision}
      initialMessages={initialMessages}
      initialProjectData={projectData}
      initialArtifacts={artifacts}
    >
      {children}
    </ProjectLayoutClient>
  );
}

interface ProjectLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function ProjectLayout({ children, params }: ProjectLayoutProps) {
  const { id } = await params;
  const projectId = parseInt(id, 10);

  if (isNaN(projectId)) {
    notFound();
  }

  return (
    <Suspense fallback={<LayoutLoadingSkeleton />}>
      <ProjectLayoutContent projectId={projectId}>
        {children}
      </ProjectLayoutContent>
    </Suspense>
  );
}
