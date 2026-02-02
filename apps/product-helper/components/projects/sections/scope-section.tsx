'use client';

/**
 * Scope Section Component
 *
 * Displays project scope based on use cases and system boundaries.
 * Part of the PRD Overview accordion sections.
 */

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Layers,
  MessageSquare,
  ArrowRight,
  CheckCircle,
  XCircle,
  Users,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UseCase {
  id?: string;
  name: string;
  actor?: string;
  description?: string;
  priority?: 'must' | 'should' | 'could' | 'wont';
}

interface SystemBoundaries {
  internal?: string[];
  external?: string[];
  inScope?: string[];
  outOfScope?: string[];
}

interface ProjectForSection {
  id: number;
  name: string;
  status: string;
  projectData?: {
    useCases?: UseCase[] | null;
    systemBoundaries?: SystemBoundaries | null;
  } | null;
}

interface ScopeSectionProps {
  project: ProjectForSection;
  compact?: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PRIORITY_CONFIG: Record<string, { label: string; bgColor: string; textColor: string }> = {
  must: {
    label: 'Must Have',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    textColor: 'text-red-700 dark:text-red-300',
  },
  should: {
    label: 'Should Have',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    textColor: 'text-orange-700 dark:text-orange-300',
  },
  could: {
    label: 'Could Have',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    textColor: 'text-blue-700 dark:text-blue-300',
  },
  wont: {
    label: "Won't Have",
    bgColor: 'bg-gray-100 dark:bg-gray-900/30',
    textColor: 'text-gray-700 dark:text-gray-300',
  },
};

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------

function EmptyState({ projectId, status }: { projectId: number; status: string }) {
  const message =
    status === 'intake'
      ? 'Continue the intake chat to define project scope and use cases.'
      : 'No scope defined yet. Describe what features should be included in the chat.';

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-16">
          <Layers
            className="h-16 w-16 mx-auto mb-4"
            style={{ color: 'var(--text-muted)', opacity: 0.4 }}
          />
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}
          >
            No Scope Defined
          </h3>
          <p
            className="text-sm mb-6 max-w-md mx-auto"
            style={{ color: 'var(--text-muted)' }}
          >
            {message}
          </p>
          <Button asChild style={{ backgroundColor: 'var(--accent)', color: '#FFFFFF' }}>
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
// Sub-components
// ---------------------------------------------------------------------------

function PriorityBadge({ priority }: { priority: string }) {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.could;
  return (
    <Badge
      variant="secondary"
      className={`${config.bgColor} ${config.textColor} border-0`}
    >
      {config.label}
    </Badge>
  );
}

function groupUseCasesByPriority(useCases: UseCase[]): Map<string, UseCase[]> {
  const priorityOrder = ['must', 'should', 'could', 'wont'];
  const grouped = new Map<string, UseCase[]>();

  // Initialize with empty arrays to maintain order
  for (const priority of priorityOrder) {
    grouped.set(priority, []);
  }

  // Group use cases
  for (const uc of useCases) {
    const priority = uc.priority || 'could';
    const existing = grouped.get(priority);
    if (existing) {
      existing.push(uc);
    }
  }

  // Remove empty groups
  for (const priority of priorityOrder) {
    if (grouped.get(priority)?.length === 0) {
      grouped.delete(priority);
    }
  }

  return grouped;
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function ScopeSection({ project, compact = false }: ScopeSectionProps) {
  const useCases = (project.projectData?.useCases ?? []) as UseCase[];
  const boundaries = project.projectData?.systemBoundaries as SystemBoundaries | null | undefined;

  const hasUseCases = useCases.length > 0;
  const hasBoundaries = boundaries && (
    (boundaries.inScope && boundaries.inScope.length > 0) ||
    (boundaries.outOfScope && boundaries.outOfScope.length > 0)
  );

  if (!hasUseCases && !hasBoundaries) {
    return <EmptyState projectId={project.id} status={project.status} />;
  }

  const groupedUseCases = hasUseCases ? groupUseCasesByPriority(useCases) : null;

  return (
    <div className="space-y-6">
      {/* Section Header - only show if not compact */}
      {!compact && (
        <div>
          <h2
            className="text-2xl font-bold mb-1"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}
          >
            Scope
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {useCases.length} {useCases.length === 1 ? 'use case' : 'use cases'} defining the project scope.
          </p>
        </div>
      )}

      {/* System Boundaries (In Scope / Out of Scope) */}
      {hasBoundaries && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* In Scope */}
          {boundaries.inScope && boundaries.inScope.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-base" style={{ fontFamily: 'var(--font-heading)' }}>
                    In Scope
                  </CardTitle>
                </div>
                <CardDescription>Features and deliverables included</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                  {boundaries.inScope.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 bg-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Out of Scope */}
          {boundaries.outOfScope && boundaries.outOfScope.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-gray-500" />
                  <CardTitle className="text-base" style={{ fontFamily: 'var(--font-heading)' }}>
                    Out of Scope
                  </CardTitle>
                </div>
                <CardDescription>Explicitly excluded from this release</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                  {boundaries.outOfScope.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 bg-gray-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Use Cases by Priority */}
      {groupedUseCases && groupedUseCases.size > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              <CardTitle className="text-lg" style={{ fontFamily: 'var(--font-heading)' }}>
                Use Cases
              </CardTitle>
            </div>
            <CardDescription>
              Prioritized features using MoSCoW method
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                    <th
                      className="text-left py-3 px-4 font-semibold"
                      style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}
                    >
                      Priority
                    </th>
                    <th
                      className="text-left py-3 px-4 font-semibold"
                      style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}
                    >
                      Use Case
                    </th>
                    <th
                      className="text-left py-3 px-4 font-semibold hidden md:table-cell"
                      style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}
                    >
                      Actor
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from(groupedUseCases.entries()).flatMap(([priority, cases]) =>
                    cases.map((uc, index) => (
                      <tr
                        key={`${priority}-${index}`}
                        className="border-b last:border-b-0 hover:bg-muted/50 transition-colors"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <td className="py-3 px-4">
                          <PriorityBadge priority={priority} />
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <span
                              className="font-medium"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {uc.name}
                            </span>
                            {uc.description && (
                              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                {uc.description}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 hidden md:table-cell">
                          {uc.actor && (
                            <div className="flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                              <Users className="h-3.5 w-3.5" />
                              {uc.actor}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
