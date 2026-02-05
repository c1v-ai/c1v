import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getProjectById } from '@/app/actions/projects';
import { Edit, TrendingUp, Calendar, User } from 'lucide-react';
import { DeleteProjectButton } from './delete-button';
import { ValidationReport } from '@/components/validation/validation-report';

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
    <div className="p-4 pb-20 md:pb-8 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <Suspense fallback={<ProjectDetailSkeleton />}>
          <ProjectDetail projectId={projectId} />
        </Suspense>
      </div>
    </div>
  );
}
