'use client';

/**
 * Infrastructure Section Component
 *
 * Displays infrastructure recommendations organized by category
 * (hosting, CI/CD, monitoring, security) and activity diagrams.
 * Used in the Project Explorer sidebar under Backend > Infrastructure.
 *
 * Team: Frontend (Agent 2.1: UI Engineer)
 */

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Cloud,
  MessageSquare,
  ArrowRight,
  Server,
  Shield,
  Activity,
  GitBranch,
  Monitor,
  HardDrive,
  Workflow,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface InfraRecommendation {
  name?: string;
  provider?: string;
  service?: string;
  description?: string;
  rationale?: string;
  tier?: string;
  alternatives?: string[];
}

interface InfraSpecData {
  hosting?: InfraRecommendation | InfraRecommendation[];
  cicd?: InfraRecommendation | InfraRecommendation[];
  ci_cd?: InfraRecommendation | InfraRecommendation[];
  monitoring?: InfraRecommendation | InfraRecommendation[];
  security?: InfraRecommendation | InfraRecommendation[];
  storage?: InfraRecommendation | InfraRecommendation[];
  networking?: InfraRecommendation | InfraRecommendation[];
  compute?: InfraRecommendation | InfraRecommendation[];
  [key: string]: unknown;
}

interface Artifact {
  id: number;
  type: string;
  content: { mermaid?: string } | null;
  status: string;
  createdAt: Date;
}

interface ProjectForSection {
  id: number;
  name: string;
  status: string;
  projectData: {
    infrastructureSpec: InfraSpecData | null;
  } | null;
  artifacts: Artifact[];
}

interface InfrastructureSectionProps {
  project: ProjectForSection;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const categoryIcons: Record<string, LucideIcon> = {
  hosting: Server,
  compute: Server,
  cicd: Workflow,
  ci_cd: Workflow,
  monitoring: Monitor,
  observability: Activity,
  security: Shield,
  storage: HardDrive,
  networking: Cloud,
};

function getCategoryIcon(category: string): LucideIcon {
  const lower = category.toLowerCase().replace(/[^a-z_]/g, '');
  return categoryIcons[lower] ?? Cloud;
}

function formatCategoryName(key: string): string {
  if (key === 'cicd' || key === 'ci_cd') return 'CI/CD';
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}

function normalizeRecommendations(
  value: unknown
): InfraRecommendation[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (typeof item === 'string') return { name: item };
      if (typeof item === 'object' && item !== null) return item as InfraRecommendation;
      return { name: String(item) };
    });
  }
  if (typeof value === 'object' && value !== null) {
    return [value as InfraRecommendation];
  }
  if (typeof value === 'string') return [{ name: value }];
  return [];
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function InfraCategoryCard({
  category,
  recommendations,
}: {
  category: string;
  recommendations: InfraRecommendation[];
}) {
  const Icon = getCategoryIcon(category);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">
            {formatCategoryName(category)}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((rec, index) => {
            const name = rec.name || rec.provider || rec.service || 'Unnamed';

            return (
              <div
                key={name + index}
                className="rounded-lg border border-border p-4"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h5 className="font-semibold text-foreground">
                    {name}
                  </h5>
                  {rec.tier && (
                    <Badge variant="outline" className="text-xs">
                      {rec.tier}
                    </Badge>
                  )}
                </div>
                {(rec.description || rec.rationale) && (
                  <p className="text-sm mb-3 text-muted-foreground">
                    {rec.description || rec.rationale}
                  </p>
                )}
                {rec.alternatives && rec.alternatives.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground">
                      Alternatives:
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {rec.alternatives.map((alt, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {alt}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityDiagramCard({ mermaid }: { mermaid: string }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">
            Activity Diagram
          </CardTitle>
        </div>
        <CardDescription>Workflow and infrastructure activity flow</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border p-4 overflow-x-auto bg-muted">
          <pre className="text-sm font-mono whitespace-pre-wrap text-foreground">
            {mermaid}
          </pre>
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
      ? 'Complete the intake chat to generate infrastructure recommendations.'
      : 'No infrastructure recommendations yet. Data will appear here after extraction.';

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-16">
          <Cloud className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-40" />
          <h3 className="text-lg font-semibold mb-2 text-foreground">
            No Infrastructure Recommendations
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

export function InfrastructureSection({ project }: InfrastructureSectionProps) {
  const infraSpec = project.projectData?.infrastructureSpec as InfraSpecData | null;

  // Find activity diagram artifact
  const activityDiagramArtifact = project.artifacts?.find(
    (a) => a.type === 'activity_diagram'
  );
  const activityMermaid =
    activityDiagramArtifact?.content &&
    typeof activityDiagramArtifact.content === 'object' &&
    'mermaid' in activityDiagramArtifact.content
      ? (activityDiagramArtifact.content as { mermaid?: string }).mermaid
      : undefined;

  // Parse categories
  const categories: Array<{ key: string; recommendations: InfraRecommendation[] }> = [];
  const skipKeys = new Set(['metadata', 'generatedAt', 'projectId']);

  if (infraSpec && typeof infraSpec === 'object') {
    for (const [key, value] of Object.entries(infraSpec)) {
      if (skipKeys.has(key)) continue;
      const recs = normalizeRecommendations(value);
      if (recs.length > 0) {
        categories.push({ key, recommendations: recs });
      }
    }
  }

  const hasData = categories.length > 0 || !!activityMermaid;

  if (!hasData) {
    return <EmptyState projectId={project.id} status={project.status} />;
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-2xl font-bold mb-1 text-foreground">
          Infrastructure
        </h2>
        <p className="text-sm text-muted-foreground">
          Hosting, CI/CD, monitoring, and security recommendations for your project.
        </p>
      </div>

      {activityMermaid && <ActivityDiagramCard mermaid={activityMermaid} />}

      <div className="grid grid-cols-1 gap-6">
        {categories.map(({ key, recommendations }) => (
          <InfraCategoryCard
            key={key}
            category={key}
            recommendations={recommendations}
          />
        ))}
      </div>
    </div>
  );
}
