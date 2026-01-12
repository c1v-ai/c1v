import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
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
    <section className="flex-1 flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div
        className="border-b px-6 py-4"
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <Button variant="ghost" asChild size="sm">
            <Link href={`/projects/${projectId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Project
            </Link>
          </Button>
        </div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Project Chat
        </h1>
        <p
          className="mt-1 text-sm text-muted-foreground"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          AI-assisted requirements gathering for your PRD
        </p>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 relative">
        <Suspense fallback={<ChatLoadingSkeleton />}>
          <ProjectChatContent projectId={projectId} />
        </Suspense>
      </div>
    </section>
  );
}
