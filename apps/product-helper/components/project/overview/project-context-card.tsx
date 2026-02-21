import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Settings } from 'lucide-react';
import { DeleteProjectButton } from '@/app/(dashboard)/projects/[id]/delete-button';

const statusColors: Record<string, string> = {
  intake: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  validation: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
};

const statusLabels: Record<string, string> = {
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

const metadataLabels: Record<string, string> = {
  projectType: 'Type',
  projectStage: 'Stage',
  userRole: 'Role',
  budget: 'Budget',
};

interface ProjectContextProps {
  project: {
    id: number;
    name: string;
    status: string;
    vision: string;
    projectType: string | null;
    projectStage: string | null;
    userRole: string | null;
    budget: string | null;
    createdAt: Date;
    createdByUser: { name: string | null; email: string } | null;
  };
}

export function ProjectContextCard({ project }: ProjectContextProps) {
  const statusColor = statusColors[project.status] || statusColors.intake;
  const statusLabel = statusLabels[project.status] || 'Unknown';

  const metadata = (['projectType', 'projectStage', 'userRole', 'budget'] as const).filter(
    (key) => project[key]
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CardTitle className="text-2xl">
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
                  <span>{project.createdByUser.name || project.createdByUser.email}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/projects/${project.id}/settings`}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border transition-colors hover:bg-muted"
              title="Settings"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
            </Link>
            <DeleteProjectButton projectId={project.id} projectName={project.name} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {project.vision && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold mb-1 text-foreground">
              Vision
            </h4>
            <p className="text-sm whitespace-pre-wrap text-muted-foreground">
              {project.vision}
            </p>
          </div>
        )}

        {metadata.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {metadata.map((key) => (
              <span
                key={key}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
              >
                <span className="font-semibold text-foreground">
                  {metadataLabels[key]}:
                </span>
                {project[key]}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
