'use client';

/**
 * Problem Statement Section Component
 *
 * Displays the extracted problem statement as a PRD section.
 * Follows the system-overview-section pattern.
 */

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  MessageSquare,
  ArrowRight,
  Target,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProblemStatementData {
  summary: string;
  context: string;
  impact: string;
  goals: string[];
}

interface ProjectForSection {
  id: number;
  name: string;
  status: string;
  projectData?: {
    problemStatement?: ProblemStatementData | null;
  } | null;
}

interface ProblemStatementSectionProps {
  project: ProjectForSection;
}

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------

function EmptyState({ projectId, status }: { projectId: number; status: string }) {
  const message =
    status === 'intake'
      ? 'Continue the intake chat to extract the problem statement from your conversation.'
      : 'No problem statement extracted yet. Describe the problem you\'re solving in the chat.';

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-16">
          <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-40" />
          <h3 className="text-lg font-semibold mb-2 text-foreground">
            No Problem Statement
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

export function ProblemStatementSection({ project }: ProblemStatementSectionProps) {
  const data = project.projectData?.problemStatement as ProblemStatementData | null | undefined;

  if (!data) {
    return <EmptyState projectId={project.id} status={project.status} />;
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-2xl font-bold mb-1 text-foreground">
          Problem Statement
        </h2>
        <p className="text-sm text-muted-foreground">
          The core problem this project aims to solve.
        </p>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-foreground">
            {data.summary}
          </p>
        </CardContent>
      </Card>

      {/* Context */}
      {data.context && (
        <Card>
          <CardHeader>
            <CardTitle>Context</CardTitle>
            <CardDescription>Background and context of the problem</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-foreground">
              {data.context}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Business Impact */}
      {data.impact && (
        <Card>
          <CardHeader>
            <CardTitle>Business Impact</CardTitle>
            <CardDescription>What happens if this problem is not solved</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-foreground">
              {data.impact}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Goals */}
      {data.goals && data.goals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Solution Goals</CardTitle>
            <CardDescription>What the solution should achieve</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.goals.map((goal, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="flex items-center gap-1.5 px-3 py-1.5"
                >
                  <Target className="h-3 w-3 text-primary" />
                  <span className="text-sm">{goal}</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
