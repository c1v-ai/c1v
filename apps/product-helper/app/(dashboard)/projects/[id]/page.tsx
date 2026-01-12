import { Suspense } from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getProjectById } from '@/app/actions/projects';
import { ArrowLeft, MessageSquare, Trash2, Edit, TrendingUp, Calendar, User } from 'lucide-react';
import { DeleteProjectButton } from './delete-button';
import { ValidationReport } from '@/components/validation/validation-report';
import { ExtractedDataDisplay } from '@/components/extracted-data/data-display';
import { DiagramGrid } from '@/components/diagrams/diagram-viewer';
import { generateDiagram } from '@/lib/diagrams/generators';

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    Continue requirements gathering (Phase 8)
                  </span>
                </div>
              </Link>
            </Button>

            <Button
              variant="outline"
              disabled
              className="h-auto py-4 cursor-not-allowed opacity-50"
            >
              <div className="flex flex-col items-start w-full">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-semibold">View Data</span>
                </div>
                <span className="text-xs">
                  Extracted data and artifacts (Phase 10)
                </span>
              </div>
            </Button>
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

      {/* Extracted PRD Data */}
      <ExtractedDataDisplay
        actors={project.projectData?.actors as any}
        useCases={project.projectData?.useCases as any}
        systemBoundaries={project.projectData?.systemBoundaries as any}
        dataEntities={project.projectData?.dataEntities as any}
        completeness={project.projectData?.completeness ?? undefined}
        lastExtractedAt={project.projectData?.lastExtractedAt ?? undefined}
      />

      {/* PRD Diagrams (Phase 11) */}
      {project.projectData && (
        <DiagramGrid
          diagrams={[
            {
              type: 'context' as const,
              syntax: generateDiagram('context', {
                projectName: project.name,
                systemBoundaries: project.projectData.systemBoundaries as any,
              }),
              title: 'Context Diagram',
              description: 'System boundaries showing internal components and external dependencies',
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
              description: 'Data model showing entities, attributes, and relationships',
            },
          ]}
        />
      )}

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
    <section className="flex-1 p-4 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Link>
        </Button>

        <Suspense fallback={<ProjectDetailSkeleton />}>
          <ProjectDetail projectId={projectId} />
        </Suspense>
      </div>
    </section>
  );
}
