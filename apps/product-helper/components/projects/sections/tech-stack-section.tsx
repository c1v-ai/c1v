'use client';

/**
 * Tech Stack Section Component
 *
 * Displays technology stack recommendations organized by category.
 * Used in the Project Explorer sidebar under Requirements > Tech Stack.
 *
 * Team: Frontend (Agent 2.1: UI Engineer)
 */

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Layers,
  MessageSquare,
  ArrowRight,
  Monitor,
  Server,
  Database,
  Cloud,
  Lock,
  Wrench,
  Smartphone,
  TestTube,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TechChoice {
  name?: string;
  technology?: string;
  rationale?: string;
  reason?: string;
  alternatives?: string[];
}

interface TechStackData {
  [category: string]: TechChoice | TechChoice[] | string | unknown;
}

interface ProjectForSection {
  id: number;
  name: string;
  status: string;
  projectData: {
    techStack: TechStackData | null;
  } | null;
}

interface TechStackSectionProps {
  project: ProjectForSection;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const categoryIcons: Record<string, LucideIcon> = {
  frontend: Monitor,
  backend: Server,
  database: Database,
  devops: Cloud,
  security: Lock,
  infrastructure: Cloud,
  hosting: Cloud,
  testing: TestTube,
  mobile: Smartphone,
  tools: Wrench,
};

function getCategoryIcon(category: string): LucideIcon {
  const key = category.toLowerCase().replace(/[^a-z]/g, '');
  for (const [pattern, icon] of Object.entries(categoryIcons)) {
    if (key.includes(pattern)) return icon;
  }
  return Layers;
}

function formatCategoryName(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}

function normalizeTechChoices(value: unknown): TechChoice[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map((item) => {
      if (typeof item === 'string') return { name: item };
      if (typeof item === 'object' && item !== null) return item as TechChoice;
      return { name: String(item) };
    });
  }

  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>;
    // If it looks like a single choice object
    if ('name' in obj || 'technology' in obj || 'rationale' in obj) {
      return [obj as TechChoice];
    }
    return [];
  }

  if (typeof value === 'string') {
    return [{ name: value }];
  }

  return [];
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TechCategoryCard({
  category,
  choices,
}: {
  category: string;
  choices: TechChoice[];
}) {
  const Icon = getCategoryIcon(category);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5" style={{ color: 'var(--accent)' }} />
          <CardTitle
            className="text-lg"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {formatCategoryName(category)}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {choices.map((choice, index) => {
            const techName = choice.name || choice.technology || 'Unknown';
            const reason = choice.rationale || choice.reason;

            return (
              <div
                key={techName + index}
                className="rounded-lg border p-4"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h5
                    className="font-semibold"
                    style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}
                  >
                    {techName}
                  </h5>
                </div>
                {reason && (
                  <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
                    {reason}
                  </p>
                )}
                {choice.alternatives && choice.alternatives.length > 0 && (
                  <div>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Alternatives:
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {choice.alternatives.map((alt, i) => (
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

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------

function EmptyState({ projectId, status }: { projectId: number; status: string }) {
  const message =
    status === 'intake'
      ? 'Complete the intake chat to generate tech stack recommendations.'
      : 'No tech stack recommendations yet. Data will appear here after extraction.';

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
            No Tech Stack Recommendations
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

export function TechStackSection({ project }: TechStackSectionProps) {
  const techStack = project.projectData?.techStack;

  if (!techStack || typeof techStack !== 'object') {
    return <EmptyState projectId={project.id} status={project.status} />;
  }

  // Parse the tech stack into category -> choices pairs
  const categories: Array<{ key: string; choices: TechChoice[] }> = [];
  const skipKeys = new Set(['metadata', 'generatedAt', 'projectId']);

  for (const [key, value] of Object.entries(techStack)) {
    if (skipKeys.has(key)) continue;
    const choices = normalizeTechChoices(value);
    if (choices.length > 0) {
      categories.push({ key, choices });
    }
  }

  if (categories.length === 0) {
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
          Tech Stack
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Technology recommendations organized by category with rationale and alternatives.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {categories.map(({ key, choices }) => (
          <TechCategoryCard key={key} category={key} choices={choices} />
        ))}
      </div>
    </div>
  );
}
