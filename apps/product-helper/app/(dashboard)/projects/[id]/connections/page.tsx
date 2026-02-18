import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProjectById } from '@/app/actions/projects';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plug } from 'lucide-react';
import {
  IntegrationCards,
  ApiKeyManagement,
  ConnectionStatus,
  ExportSection,
} from '@/components/connections';

interface ConnectionsPageProps {
  params: Promise<{ id: string }>;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-20 bg-muted rounded-lg animate-pulse" />
      <div className="h-64 bg-muted rounded-lg animate-pulse" />
      <div className="h-48 bg-muted rounded-lg animate-pulse" />
      <div className="h-48 bg-muted rounded-lg animate-pulse" />
    </div>
  );
}

async function ConnectionsContent({ projectId }: { projectId: number }) {
  const project = await getProjectById(projectId);

  if (!project) {
    notFound();
  }

  // Get the base URL for MCP server
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const mcpUrl = `${baseUrl}/api/mcp/${projectId}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/projects/${projectId}`}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Project
              </Link>
            </Button>
          </div>
          <h1
            className="text-2xl font-bold flex items-center gap-2"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            <Plug className="h-6 w-6" />
            Connections
          </h1>
          <p className="text-muted-foreground mt-1">
            Connect your IDE to {project.name} via MCP
          </p>
        </div>
      </div>

      {/* Connection Status */}
      <ConnectionStatus projectId={projectId} />

      {/* Integration Cards */}
      <div>
        <h2
          className="text-lg font-semibold mb-4"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          IDE Integrations
        </h2>
        <IntegrationCards
          projectId={projectId}
          projectName={project.name}
          mcpUrl={mcpUrl}
        />
      </div>

      {/* API Key Management */}
      <ApiKeyManagement projectId={projectId} />

      {/* Export Section */}
      <ExportSection projectId={projectId} projectName={project.name} />

      {/* Help Section */}
      <div className="border rounded-lg p-6 bg-muted/50">
        <h3 className="font-semibold mb-2">How MCP Integration Works</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
          <li>Create an API key above to authenticate your IDE</li>
          <li>Copy the setup command for your IDE (Claude Code, Cursor, etc.)</li>
          <li>Paste into your IDE&apos;s MCP configuration</li>
          <li>Your IDE can now access project context via 17 specialized tools</li>
        </ol>
        <div className="mt-4 pt-4 border-t">
          <h4 className="font-medium mb-2 text-sm">Available Tools Include:</h4>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-1 bg-background rounded">get_prd</span>
            <span className="px-2 py-1 bg-background rounded">get_database_schema</span>
            <span className="px-2 py-1 bg-background rounded">get_tech_stack</span>
            <span className="px-2 py-1 bg-background rounded">get_user_stories</span>
            <span className="px-2 py-1 bg-background rounded">get_coding_context</span>
            <span className="px-2 py-1 bg-background rounded">get_diagrams</span>
            <span className="px-2 py-1 bg-background rounded">invoke_agent</span>
            <span className="px-2 py-1 bg-background rounded">+10 more</span>
          </div>
        </div>
      </div>
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
