'use client';

/**
 * Goals & Metrics Section Component
 *
 * Displays project goals with measurable success criteria.
 * Part of the PRD content depth (Wave 2, B03).
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Target,
  TrendingUp,
} from 'lucide-react';
import { EmptySectionState } from './empty-section-state';

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

function EmptyState({ projectId }: { projectId: number; status: string }) {
  return (
    <EmptySectionState
      icon={Target}
      sectionName="Goals & Metrics"
      methodologyCopy="Run Deep Synthesis to extract project goals and pair each with measurable success criteria."
      projectId={projectId}
    />
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
        <h2 className="text-2xl font-bold mb-1 text-foreground">
          Goals & Success Metrics
        </h2>
        <p className="text-sm text-muted-foreground">
          {goals.length} {goals.length === 1 ? 'goal' : 'goals'} with measurable success criteria.
        </p>
      </div>

      {/* Goals Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">
              Success Criteria
            </CardTitle>
          </div>
          <CardDescription>How each goal will be measured</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Goal
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Metric
                  </th>
                  <th className="text-left py-3 px-4 font-semibold hidden md:table-cell text-foreground">
                    Target
                  </th>
                </tr>
              </thead>
              <tbody>
                {goals.map((gm, index) => (
                  <tr
                    key={index}
                    className="border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-foreground">
                      <div className="flex items-start gap-2">
                        <Target className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                        {gm.goal}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {gm.metric}
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell text-muted-foreground">
                      {gm.target || '\u2014'}
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
