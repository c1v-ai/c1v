'use client';

/**
 * Actors Section Component (Target Users)
 *
 * Displays actors/personas with their goals and pain points.
 * Part of the PRD Overview accordion sections.
 */

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  MessageSquare,
  ArrowRight,
  Target,
  AlertTriangle,
  User,
} from 'lucide-react';

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

function EmptyState({ projectId, status }: { projectId: number; status: string }) {
  const message =
    status === 'intake'
      ? 'Continue the intake chat to identify target users and personas.'
      : 'No target users identified yet. Describe who will use your product in the chat.';

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-16">
          <Users
            className="h-16 w-16 mx-auto mb-4"
            style={{ color: 'var(--text-muted)', opacity: 0.4 }}
          />
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}
          >
            No Target Users
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
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--accent)', opacity: 0.1 }}
            >
              <User className="h-5 w-5" style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <CardTitle className="text-base" style={{ fontFamily: 'var(--font-heading)' }}>
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
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {actor.description}
        </p>

        {/* Demographics */}
        {actor.demographics && (
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Demographics: </span>
            {actor.demographics}
          </div>
        )}

        {/* Usage Context */}
        {actor.usageContext && (
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Usage: </span>
            {actor.usageContext}
          </div>
        )}

        {/* Goals */}
        {actor.goals && actor.goals.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
              <Target className="h-3.5 w-3.5" style={{ color: 'var(--accent)' }} />
              Goals
            </h4>
            <ul className="space-y-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              {actor.goals.map((goal, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--accent)' }} />
                  {goal}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Pain Points */}
        {actor.painPoints && actor.painPoints.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              Pain Points
            </h4>
            <ul className="space-y-1 text-sm" style={{ color: 'var(--text-muted)' }}>
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
          <h2
            className="text-2xl font-bold mb-1"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}
          >
            Target Users
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
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
