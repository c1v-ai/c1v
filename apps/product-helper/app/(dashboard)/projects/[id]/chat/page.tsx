import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { getProjectById } from '@/app/actions/projects';
import { getConversations } from '@/app/actions/conversations';
import { ProjectChatClient } from './chat-client';

function ChatLoadingSkeleton() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" style={{ color: 'var(--accent)' }} />
        <p className="text-muted-foreground">Loading chat...</p>
      </div>
    </div>
  );
}

async function ProjectChatContent({ projectId }: { projectId: number }) {
  const project = await getProjectById(projectId);

  if (!project) {
    notFound();
  }

  // Load conversation history
  const conversations = await getConversations(projectId);

  // Convert to Vercel AI SDK format
  const initialMessages = conversations.map((conv, index) => ({
    id: `${conv.id}`,
    role: conv.role as 'user' | 'assistant',
    content: conv.content,
    createdAt: conv.createdAt,
  }));

  return (
    <ProjectChatClient
      projectId={projectId}
      projectName={project.name}
      projectVision={project.vision}
      initialMessages={initialMessages}
    />
  );
}

interface ProjectChatPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectChatPage({ params }: ProjectChatPageProps) {
  const { id } = await params;
  const projectId = parseInt(id, 10);

  if (isNaN(projectId)) {
    notFound();
  }

  return (
    <section className="flex-1 flex flex-col h-[calc(100vh-12rem)]">
      {/* Chat Interface */}
      <div className="flex-1 relative">
        <Suspense fallback={<ChatLoadingSkeleton />}>
          <ProjectChatContent projectId={projectId} />
        </Suspense>
      </div>
    </section>
  );
}
