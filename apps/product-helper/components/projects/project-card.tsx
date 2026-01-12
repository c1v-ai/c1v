'use client';

import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type Project } from '@/lib/db/schema';
import { FileText, Calendar, TrendingUp } from 'lucide-react';

interface ProjectCardProps {
  project: Project & {
    createdByUser?: {
      id: number;
      name: string | null;
      email: string;
    };
  };
}

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
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const visionPreview = project.vision.length > 150
    ? project.vision.substring(0, 150) + '...'
    : project.vision;

  const statusKey = project.status as keyof typeof statusColors;
  const statusColor = statusColors[statusKey] || statusColors.intake;
  const statusLabel = statusLabels[statusKey] || 'Unknown';

  return (
    <Link href={`/projects/${project.id}`} className="block">
      <Card className="h-full transition-all hover:shadow-lg hover:border-accent cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <FileText className="h-5 w-5 text-accent flex-shrink-0" />
              <h3
                className="font-bold text-lg truncate"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {project.name}
              </h3>
            </div>
            <Badge className={`ml-2 ${statusColor} flex-shrink-0`}>
              {statusLabel}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p
            className="text-sm text-muted-foreground line-clamp-3"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {visionPreview}
          </p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span>{project.validationScore || 0}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(project.createdAt)}</span>
            </div>
          </div>
        </CardContent>

        {project.createdByUser && (
          <CardFooter className="text-xs text-muted-foreground">
            Created by {project.createdByUser.name || project.createdByUser.email}
          </CardFooter>
        )}
      </Card>
    </Link>
  );
}
