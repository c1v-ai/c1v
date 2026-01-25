import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getProjectById } from '@/app/actions/projects';
import { MessageSquare, Edit, TrendingUp, Calendar, User, Database, GitBranch, FileDown, Plug } from 'lucide-react';
import { DeleteProjectButton } from './delete-button';
import { ValidationReport } from '@/components/validation/validation-report';
import { ExportButton } from '@/components/export/export-button';

const statusColors = {
  intake: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  validation: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
};

const statusLabels = {
  intake: 'Intake',
  in_progress: 'In Progress',
  validation: 'Validation',
  completed: 'Completed',
  archived: 'Archived',
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

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

  const statusKey = project.status as keyof typeof statusColors;
  const statusColor = statusColors[statusKey] || statusColors.intake;
  const statusLabel = statusLabels[statusKey] || 'Unknown';

  return (
    <div className="space-y-6">
      {/* Project Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle
                  className="text-2xl"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {project.name}
                </CardTitle>
                <Badge className={statusColor}>{statusLabel}</Badge>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Created {formatDate(project.createdAt)}</span>
                </div>
                {project.createdByUser && (
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>
                      {project.createdByUser.name || project.createdByUser.email}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>Validation: {project.validationScore || 0}%</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/projects/${project.id}/edit`}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Link>
              </Button>
              <DeleteProjectButton projectId={project.id} projectName={project.name} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3
                className="text-sm font-semibold mb-2"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Vision Statement
              </h3>
              <p
                className="text-muted-foreground whitespace-pre-wrap"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {project.vision}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle style={{ fontFamily: 'var(--font-heading)' }}>
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Button
              asChild
              style={{ backgroundColor: 'var(--accent)', color: '#FFFFFF' }}
              className="hover:opacity-90 h-auto py-4"
            >
              <Link href={`/projects/${project.id}/chat`}>
                <div className="flex flex-col items-start w-full">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="h-5 w-5" />
                    <span className="font-semibold">Start Chat</span>
                  </div>
                  <span className="text-xs opacity-90">
                    Continue requirements gathering
                  </span>
                </div>
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-auto py-4"
            >
              <Link href={`/projects/${project.id}/data`}>
                <div className="flex flex-col items-start w-full">
                  <div className="flex items-center gap-2 mb-1">
                    <Database className="h-5 w-5" />
                    <span className="font-semibold">View Data</span>
                  </div>
                  <span className="text-xs">
                    Extracted actors, use cases, entities
                  </span>
                </div>
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-auto py-4"
            >
              <Link href={`/projects/${project.id}/diagrams`}>
                <div className="flex flex-col items-start w-full">
                  <div className="flex items-center gap-2 mb-1">
                    <GitBranch className="h-5 w-5" />
                    <span className="font-semibold">View Diagrams</span>
                  </div>
                  <span className="text-xs">
                    Context, use case, and class diagrams
                  </span>
                </div>
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-auto py-4"
            >
              <Link href={`/projects/${project.id}/connections`}>
                <div className="flex flex-col items-start w-full">
                  <div className="flex items-center gap-2 mb-1">
                    <Plug className="h-5 w-5" />
                    <span className="font-semibold">Connections</span>
                  </div>
                  <span className="text-xs">
                    MCP server for Claude Code
                  </span>
                </div>
              </Link>
            </Button>

            <div className="h-auto py-4 flex items-center justify-center">
              <div className="flex flex-col items-center w-full">
                <div className="flex items-center gap-2 mb-1">
                  <FileDown className="h-5 w-5" />
                  <span className="font-semibold">Export PRD</span>
                </div>
                <ExportButton
                  projectId={project.id}
                  projectName={project.name}
                  variant="outline"
                  size="sm"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Statistics Card */}
      <Card>
        <CardHeader>
          <CardTitle style={{ fontFamily: 'var(--font-heading)' }}>
            Project Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                {project.conversations?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Messages</div>
            </div>
            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                {project.artifacts?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Artifacts</div>
            </div>
            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                {project.validationPassed || 0}
              </div>
              <div className="text-sm text-muted-foreground">Checks Passed</div>
            </div>
            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                {project.projectData?.completeness || 0}%
              </div>
              <div className="text-sm text-muted-foreground">Completeness</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Report */}
      <ValidationReport
        projectId={project.id}
        projectName={project.name}
        initialValidationScore={project.validationScore || 0}
      />
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
    <section className="flex-1 p-4 pb-20 md:pb-8 lg:p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <Suspense fallback={<ProjectDetailSkeleton />}>
          <ProjectDetail projectId={projectId} />
        </Suspense>
      </div>
    </section>
  );
}
