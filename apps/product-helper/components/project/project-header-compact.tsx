'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useProjectChat } from './project-chat-provider';

const statusStyles: Record<string, string> = {
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  intake: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  validation: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
};

export function ProjectHeaderCompact() {
  const { projectId, projectName, projectStatus } = useProjectChat();
  const pathname = usePathname();

  // Smart back: artifact sub-pages go to project overview; project overview goes to projects list
  const isProjectRoot = pathname === `/projects/${projectId}`;
  const backHref = isProjectRoot ? '/projects' : `/projects/${projectId}`;
  const backLabel = isProjectRoot ? 'Back to projects' : 'Back to project overview';

  return (
    <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-background flex-shrink-0">
      <Link
        href={backHref}
        className="flex items-center justify-center h-9 w-9 rounded-md hover:bg-muted transition-colors"
        aria-label={backLabel}
      >
        <ArrowLeft className="h-5 w-5 text-foreground" />
      </Link>

      <h1 className="text-sm font-semibold truncate text-foreground">
        {projectName}
      </h1>
      {projectStatus && (
        <Badge
          variant="secondary"
          className={cn('text-xs', statusStyles[projectStatus])}
        >
          {projectStatus.replace('_', ' ')}
        </Badge>
      )}
    </div>
  );
}
