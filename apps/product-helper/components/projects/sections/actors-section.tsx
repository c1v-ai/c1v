'use client';

/**
 * Actors Section Component (Target Users)
 *
 * Displays actors/personas with their goals and pain points.
 * Part of the PRD Overview accordion sections.
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Target,
  AlertTriangle,
  User,
} from 'lucide-react';
import { EmptySectionState } from './empty-section-state';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Actor {
  name: string;
  role: string;
  description: string;
  demographics?: string;
  goals?: string[];
  painPoints?: string[];
  technicalProficiency?: 'low' | 'medium' | 'high';
  usageContext?: string;
}

interface ProjectForSection {
  id: number;
  name: string;
  status: string;
  projectData?: {
    actors?: Actor[] | null;
  } | null;
}

interface ActorsSectionProps {
  project: ProjectForSection;
  compact?: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PROFICIENCY_CONFIG: Record<string, { label: string; bgColor: string; textColor: string }> = {
  low: {
    label: 'Beginner',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    textColor: 'text-green-700 dark:text-green-300',
  },
  medium: {
    label: 'Intermediate',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    textColor: 'text-blue-700 dark:text-blue-300',
  },
  high: {
    label: 'Advanced',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    textColor: 'text-purple-700 dark:text-purple-300',
  },
};

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------

function EmptyState({ projectId }: { projectId: number; status: string }) {
  return (
    <EmptySectionState
      icon={Users}
      sectionName="Target Users"
      methodologyCopy="Run Deep Synthesis to identify target users, their goals, demographics, and pain points from the intake conversation."
      projectId={projectId}
    />
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ProficiencyBadge({ level }: { level: string }) {
  const config = PROFICIENCY_CONFIG[level] || PROFICIENCY_CONFIG.medium;
  return (
    <Badge
      variant="secondary"
      className={`${config.bgColor} ${config.textColor} border-0`}
    >
      {config.label}
    </Badge>
  );
}

function ActorCard({ actor }: { actor: Actor }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">
                {actor.name}
              </CardTitle>
              <CardDescription className="text-sm">{actor.role}</CardDescription>
            </div>
          </div>
          {actor.technicalProficiency && (
            <ProficiencyBadge level={actor.technicalProficiency} />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm text-muted-foreground">
          {actor.description}
        </p>

        {/* Demographics */}
        {actor.demographics && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Demographics: </span>
            {actor.demographics}
          </div>
        )}

        {/* Usage Context */}
        {actor.usageContext && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Usage: </span>
            {actor.usageContext}
          </div>
        )}

        {/* Goals */}
        {actor.goals && actor.goals.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5 text-foreground">
              <Target className="h-3.5 w-3.5 text-primary" />
              Goals
            </h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {actor.goals.map((goal, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 bg-primary" />
                  {goal}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Pain Points */}
        {actor.painPoints && actor.painPoints.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5 text-foreground">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              Pain Points
            </h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {actor.painPoints.map((pain, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 bg-amber-500" />
                  {pain}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function ActorsSection({ project, compact = false }: ActorsSectionProps) {
  const actors = (project.projectData?.actors ?? []) as Actor[];

  if (actors.length === 0) {
    return <EmptyState projectId={project.id} status={project.status} />;
  }

  return (
    <div className="space-y-6">
      {/* Section Header - only show if not compact */}
      {!compact && (
        <div>
          <h2 className="text-2xl font-bold mb-1 text-foreground">
            Target Users
          </h2>
          <p className="text-sm text-muted-foreground">
            {actors.length} {actors.length === 1 ? 'persona' : 'personas'} identified for this product.
          </p>
        </div>
      )}

      {/* Actor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actors.map((actor, index) => (
          <ActorCard key={index} actor={actor} />
        ))}
      </div>
    </div>
  );
}
