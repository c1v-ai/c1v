'use client';

/**
 * Goals & Metrics Section Component
 *
 * Displays project goals with measurable success criteria.
 * Part of the PRD content depth (Wave 2, B03).
 */

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Target,
  MessageSquare,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GoalMetric {
  goal: string;
  metric: string;
  target?: string;
}

interface ProjectForSection {
  id: number;
  name: string;
  status: string;
  projectData?: {
    goalsMetrics?: GoalMetric[] | null;
  } | null;
}

interface GoalsMetricsSectionProps {
  project: ProjectForSection;
}

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------

function EmptyState({ projectId, status }: { projectId: number; status: string }) {
  const message =
    status === 'intake'
      ? 'Continue the intake chat to extract goals and success metrics.'
      : 'No goals extracted yet. Describe what success looks like in the chat.';

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-16">
          <Target
            className="h-16 w-16 mx-auto mb-4"
            style={{ color: 'var(--text-muted)', opacity: 0.4 }}
          />
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}
          >
            No Goals & Metrics
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
// Main Component
// ---------------------------------------------------------------------------

export function GoalsMetricsSection({ project }: GoalsMetricsSectionProps) {
  const goals = (project.projectData?.goalsMetrics ?? []) as GoalMetric[];

  if (goals.length === 0) {
    return <EmptyState projectId={project.id} status={project.status} />;
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2
          className="text-2xl font-bold mb-1"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}
        >
          Goals & Success Metrics
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {goals.length} {goals.length === 1 ? 'goal' : 'goals'} with measurable success criteria.
        </p>
      </div>

      {/* Goals Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" style={{ color: 'var(--accent)' }} />
            <CardTitle className="text-lg" style={{ fontFamily: 'var(--font-heading)' }}>
              Success Criteria
            </CardTitle>
          </div>
          <CardDescription>How each goal will be measured</CardDescription>
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
                    Goal
                  </th>
                  <th
                    className="text-left py-3 px-4 font-semibold"
                    style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}
                  >
                    Metric
                  </th>
                  <th
                    className="text-left py-3 px-4 font-semibold hidden md:table-cell"
                    style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}
                  >
                    Target
                  </th>
                </tr>
              </thead>
              <tbody>
                {goals.map((gm, index) => (
                  <tr
                    key={index}
                    className="border-b last:border-b-0 hover:bg-muted/50 transition-colors"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <td
                      className="py-3 px-4 font-medium"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      <div className="flex items-start gap-2">
                        <Target className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                        {gm.goal}
                      </div>
                    </td>
                    <td className="py-3 px-4" style={{ color: 'var(--text-muted)' }}>
                      {gm.metric}
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell" style={{ color: 'var(--text-muted)' }}>
                      {gm.target || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
