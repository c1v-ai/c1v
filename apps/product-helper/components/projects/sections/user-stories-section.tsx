'use client';

/**
 * User Stories Section Component
 *
 * Displays user stories in a table grouped by epic with expandable
 * acceptance criteria rows.
 * Used in the Project Explorer sidebar under Requirements > User Stories.
 *
 * Team: Frontend (Agent 2.1: UI Engineer)
 */

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  MessageSquare,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UserStoryData {
  id: number;
  title: string;
  description: string;
  actor: string;
  epic?: string | null;
  acceptanceCriteria: string[];
  status: string;
  priority: string;
  estimatedEffort: string;
}

interface ProjectForSection {
  id: number;
  name: string;
  status: string;
  userStories?: UserStoryData[];
}

interface UserStoriesSectionProps {
  project: ProjectForSection;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const priorityConfig: Record<string, { color: string; label: string }> = {
  high: {
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    label: 'High',
  },
  critical: {
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    label: 'Critical',
  },
  medium: {
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    label: 'Medium',
  },
  low: {
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    label: 'Low',
  },
};

const statusConfig: Record<string, { color: string; label: string }> = {
  backlog: {
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    label: 'Backlog',
  },
  todo: {
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    label: 'To Do',
  },
  in_progress: {
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    label: 'In Progress',
  },
  done: {
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    label: 'Done',
  },
  completed: {
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    label: 'Completed',
  },
};

function getPriorityBadge(priority: string) {
  const config = priorityConfig[priority.toLowerCase()] ?? {
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    label: priority,
  };
  return <Badge className={config.color}>{config.label}</Badge>;
}

function getStatusBadge(status: string) {
  const config = statusConfig[status.toLowerCase()] ?? {
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    label: status,
  };
  return <Badge className={config.color}>{config.label}</Badge>;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function formatStoryId(id: number): string {
  return `US-${String(id).padStart(3, '0')}`;
}

function StoryRow({ story }: { story: UserStoryData }) {
  const [expanded, setExpanded] = useState(false);
  const criteria = Array.isArray(story.acceptanceCriteria)
    ? story.acceptanceCriteria
    : [];
  const hasCriteria = criteria.length > 0;

  const toggleExpand = useCallback(() => {
    if (hasCriteria) setExpanded((prev) => !prev);
  }, [hasCriteria]);

  return (
    <>
      <tr
        className={cn(
          'border-b border-border transition-colors',
          hasCriteria && 'cursor-pointer hover:bg-muted/50'
        )}
        onClick={toggleExpand}
        role={hasCriteria ? 'button' : undefined}
        tabIndex={hasCriteria ? 0 : undefined}
        onKeyDown={(e) => {
          if (hasCriteria && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            toggleExpand();
          }
        }}
        aria-expanded={hasCriteria ? expanded : undefined}
      >
        <td className="py-3 px-4 text-xs font-mono hidden sm:table-cell text-muted-foreground">
          {formatStoryId(story.id)}
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            {hasCriteria ? (
              expanded ? (
                <ChevronDown className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              )
            ) : (
              <span className="w-4" />
            )}
            <span className="font-medium text-sm text-foreground">
              {story.title}
            </span>
          </div>
        </td>
        <td className="py-3 px-4 text-sm hidden sm:table-cell text-muted-foreground">
          {story.actor}
        </td>
        <td className="py-3 px-4 hidden md:table-cell">
          {getPriorityBadge(story.priority)}
        </td>
        <td className="py-3 px-4 text-sm hidden lg:table-cell text-muted-foreground">
          {story.estimatedEffort}
        </td>
        <td className="py-3 px-4">
          {getStatusBadge(story.status)}
        </td>
      </tr>

      {/* Expandable acceptance criteria */}
      {expanded && hasCriteria && (
        <tr>
          <td
            colSpan={6}
            className="px-4 pb-4 pt-1 bg-muted"
          >
            <div className="pl-10">
              <p className="text-xs font-semibold mb-2 text-muted-foreground">
                Acceptance Criteria
              </p>
              <ul className="space-y-1.5">
                {criteria.map((criterion, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-primary" />
                    <span className="text-sm text-foreground">
                      {typeof criterion === 'string' ? criterion : JSON.stringify(criterion)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function StoryGroup({
  epicName,
  stories,
}: {
  epicName: string;
  stories: UserStoryData[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {epicName}
        </CardTitle>
        <CardDescription>{stories.length} {stories.length === 1 ? 'story' : 'stories'}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-4 font-semibold hidden sm:table-cell text-foreground">
                  ID
                </th>
                <th className="text-left py-2 px-4 font-semibold text-foreground">
                  Title
                </th>
                <th className="text-left py-2 px-4 font-semibold hidden sm:table-cell text-foreground">
                  Actor
                </th>
                <th className="text-left py-2 px-4 font-semibold hidden md:table-cell text-foreground">
                  Priority
                </th>
                <th className="text-left py-2 px-4 font-semibold hidden lg:table-cell text-foreground">
                  Effort
                </th>
                <th className="text-left py-2 px-4 font-semibold text-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {stories.map((story) => (
                <StoryRow key={story.id} story={story} />
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------

function EmptyState({ projectId, status }: { projectId: number; status: string }) {
  const message =
    status === 'intake'
      ? 'Complete the intake chat to generate user stories from your requirements.'
      : 'No user stories generated yet. Continue chatting to extract use cases and generate stories.';

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-16">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-40" />
          <h3 className="text-lg font-semibold mb-2 text-foreground">
            No User Stories
          </h3>
          <p className="text-sm mb-6 max-w-md mx-auto text-muted-foreground">
            {message}
          </p>
          <Button asChild>
            <Link href={`/projects/${projectId}/chat`}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Start Chat
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function UserStoriesSection({ project }: UserStoriesSectionProps) {
  const stories = (project.userStories ?? []) as UserStoryData[];

  if (stories.length === 0) {
    return <EmptyState projectId={project.id} status={project.status} />;
  }

  // Group by epic
  const grouped = useMemo(() => {
    const groups = new Map<string, UserStoryData[]>();
    for (const story of stories) {
      const epicKey = story.epic || 'Ungrouped';
      const existing = groups.get(epicKey) ?? [];
      existing.push(story);
      groups.set(epicKey, existing);
    }
    return groups;
  }, [stories]);

  const hasEpics = grouped.size > 1 || !grouped.has('Ungrouped');

  const doneCount = useMemo(
    () => stories.filter((s) => s.status === 'done' || s.status === 'completed').length,
    [stories]
  );

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-foreground">
            User Stories
          </h2>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {doneCount}/{stories.length}
            </span>
            {' '}completed &middot;{' '}
            {stories.length} {stories.length === 1 ? 'story' : 'stories'} generated from your requirements.
          </p>
        </div>
        <Button
          asChild
          variant="outline"
          size="sm"
        >
          <Link href={`/projects/${project.id}/chat`}>
            <Plus className="h-4 w-4 mr-1" />
            Add Story
          </Link>
        </Button>
      </div>

      {hasEpics ? (
        Array.from(grouped.entries()).map(([epicName, epicStories]) => (
          <StoryGroup key={epicName} epicName={epicName} stories={epicStories} />
        ))
      ) : (
        <StoryGroup epicName="All Stories" stories={stories} />
      )}
    </div>
  );
}
