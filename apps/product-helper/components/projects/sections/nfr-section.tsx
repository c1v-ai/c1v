'use client';

/**
 * Non-Functional Requirements Section Component
 *
 * Displays NFRs grouped by category with priority badges.
 * Part of the PRD content depth (Product Requirements).
 */

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Shield,
  Zap,
  TrendingUp,
  RefreshCw,
  Eye,
  Wrench,
  Scale,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NonFunctionalRequirement {
  category: 'performance' | 'security' | 'scalability' | 'reliability' | 'usability' | 'maintainability' | 'compliance';
  requirement: string;
  metric?: string;
  target?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

interface ProjectForSection {
  id: number;
  name: string;
  status: string;
  projectData?: {
    nonFunctionalRequirements?: NonFunctionalRequirement[] | null;
  } | null;
}

interface NfrSectionProps {
  project: ProjectForSection;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORY_CONFIG: Record<
  NonFunctionalRequirement['category'],
  { label: string; icon: typeof Shield; bgColor: string; textColor: string }
> = {
  performance: {
    label: 'Performance',
    icon: Zap,
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    textColor: 'text-blue-700 dark:text-blue-300',
  },
  security: {
    label: 'Security',
    icon: Shield,
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    textColor: 'text-red-700 dark:text-red-300',
  },
  scalability: {
    label: 'Scalability',
    icon: TrendingUp,
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    textColor: 'text-purple-700 dark:text-purple-300',
  },
  reliability: {
    label: 'Reliability',
    icon: RefreshCw,
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    textColor: 'text-green-700 dark:text-green-300',
  },
  usability: {
    label: 'Usability',
    icon: Eye,
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    textColor: 'text-amber-700 dark:text-amber-300',
  },
  maintainability: {
    label: 'Maintainability',
    icon: Wrench,
    bgColor: 'bg-slate-100 dark:bg-slate-900/30',
    textColor: 'text-slate-700 dark:text-slate-300',
  },
  compliance: {
    label: 'Compliance',
    icon: Scale,
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    textColor: 'text-orange-700 dark:text-orange-300',
  },
};

const PRIORITY_CONFIG: Record<
  NonFunctionalRequirement['priority'],
  { bgColor: string; textColor: string }
> = {
  critical: {
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    textColor: 'text-red-700 dark:text-red-300',
  },
  high: {
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    textColor: 'text-orange-700 dark:text-orange-300',
  },
  medium: {
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    textColor: 'text-yellow-700 dark:text-yellow-300',
  },
  low: {
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
      ? 'Continue the intake chat to extract non-functional requirements.'
      : 'No non-functional requirements extracted yet. Continue your chat to add performance, security, and scalability requirements.';

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-16">
          <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-40" />
          <h3 className="text-lg font-semibold mb-2 text-foreground">
            No Non-Functional Requirements
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
// Helpers
// ---------------------------------------------------------------------------

function groupByCategory(
  nfrs: NonFunctionalRequirement[]
): Map<NonFunctionalRequirement['category'], NonFunctionalRequirement[]> {
  const grouped = new Map<NonFunctionalRequirement['category'], NonFunctionalRequirement[]>();
  for (const nfr of nfrs) {
    const existing = grouped.get(nfr.category);
    if (existing) {
      existing.push(nfr);
    } else {
      grouped.set(nfr.category, [nfr]);
    }
  }
  return grouped;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function CategoryBadge({ category }: { category: NonFunctionalRequirement['category'] }) {
  const config = CATEGORY_CONFIG[category];
  const Icon = config.icon;
  return (
    <Badge
      variant="secondary"
      className={`${config.bgColor} ${config.textColor} border-0 gap-1`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

function PriorityBadge({ priority }: { priority: NonFunctionalRequirement['priority'] }) {
  const config = PRIORITY_CONFIG[priority];
  return (
    <Badge
      variant="secondary"
      className={`${config.bgColor} ${config.textColor} border-0 capitalize`}
    >
      {priority}
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function NfrSection({ project }: NfrSectionProps) {
  const nfrs = (project.projectData?.nonFunctionalRequirements ?? []) as NonFunctionalRequirement[];

  if (nfrs.length === 0) {
    return <EmptyState projectId={project.id} status={project.status} />;
  }

  const grouped = groupByCategory(nfrs);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-2xl font-bold mb-1 text-foreground">
          Non-Functional Requirements
        </h2>
        <p className="text-sm text-muted-foreground">
          {nfrs.length} {nfrs.length === 1 ? 'requirement' : 'requirements'} across{' '}
          {grouped.size} {grouped.size === 1 ? 'category' : 'categories'}.
        </p>
      </div>

      {/* NFR Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">
              Quality Attributes
            </CardTitle>
          </div>
          <CardDescription>
            Performance, security, scalability, and other non-functional constraints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Category
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Requirement
                  </th>
                  <th className="text-left py-3 px-4 font-semibold hidden md:table-cell text-foreground">
                    Metric
                  </th>
                  <th className="text-left py-3 px-4 font-semibold hidden lg:table-cell text-foreground">
                    Target
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Priority
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.from(grouped.entries()).map(([category, items]) =>
                  items.map((nfr, index) => (
                    <tr
                      key={`${category}-${index}`}
                      className="border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <CategoryBadge category={nfr.category} />
                      </td>
                      <td className="py-3 px-4 font-medium text-foreground">
                        {nfr.requirement}
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell text-muted-foreground">
                        {nfr.metric || '\u2014'}
                      </td>
                      <td className="py-3 px-4 hidden lg:table-cell text-muted-foreground">
                        {nfr.target || '\u2014'}
                      </td>
                      <td className="py-3 px-4">
                        <PriorityBadge priority={nfr.priority} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
