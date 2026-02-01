'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; className: string }> = {
  intake: {
    label: 'Intake',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  },
  in_progress: {
    label: 'In Progress',
    className:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  },
  validation: {
    label: 'Validation',
    className:
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  },
  completed: {
    label: 'Completed',
    className:
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  },
  archived: {
    label: 'Archived',
    className:
      'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  },
};

interface ExplorerHeaderProps {
  projectName: string;
  status: string;
}

export function ExplorerHeader({ projectName, status }: ExplorerHeaderProps) {
  const config = statusConfig[status] ?? statusConfig.intake;

  return (
    <div
      className="px-3 py-3 border-b shrink-0"
      style={{ borderColor: 'var(--border)' }}
    >
      {/* Back to projects */}
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-xs font-medium mb-2 transition-colors no-underline"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--text-primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-muted)';
        }}
      >
        <ArrowLeft className="h-3 w-3" />
        All Projects
      </Link>

      {/* Project name and status */}
      <div className="flex items-center gap-2">
        <h2
          className="text-sm font-semibold truncate flex-1"
          style={{
            fontFamily: 'var(--font-heading)',
            color: 'var(--text-primary)',
          }}
          title={projectName}
        >
          {projectName}
        </h2>
        <Badge
          variant="secondary"
          className={cn('text-[10px] px-1.5 py-0 shrink-0', config.className)}
        >
          {config.label}
        </Badge>
      </div>
    </div>
  );
}
