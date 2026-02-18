import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProjectById } from '@/app/actions/projects';
import { Plug } from 'lucide-react';
import { ConnectionsFlow } from '@/components/connections/connections-flow';

interface ConnectionsPageProps {
  params: Promise<{ id: string }>;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-16 bg-muted rounded-lg animate-pulse" />
      <div className="h-48 bg-muted rounded-lg animate-pulse" />
      <div className="h-64 bg-muted rounded-lg animate-pulse" />
    </div>
  );
}

async function ConnectionsContent({ projectId }: { projectId: number }) {
  const project = await getProjectById(projectId);

  if (!project) {
    notFound();
  }

  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const mcpUrl = `${baseUrl}/api/mcp/${projectId}`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold flex items-center gap-2"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          <Plug className="h-6 w-6" />
          Connections
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Build your project in Claude Code, Cursor, or your favorite IDE with MCP skills built specifically based on your product requirements
        </p>
      </div>

      {/* 2-Step Flow */}
      <ConnectionsFlow
        projectId={projectId}
        projectName={project.name}
        mcpUrl={mcpUrl}
      />
    </div>
  );
}

export default async function ConnectionsPage({ params }: ConnectionsPageProps) {
  const { id } = await params;
  const projectId = parseInt(id, 10);

  if (isNaN(projectId)) {
    notFound();
  }

  return (
    <section className="flex-1 p-4 pb-20 md:pb-8 lg:p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <Suspense fallback={<LoadingSkeleton />}>
          <ConnectionsContent projectId={projectId} />
        </Suspense>
      </div>
    </section>
  );
}
