'use client';

/**
 * System Overview Section Component
 *
 * Displays actors table, system boundaries, and data entities summary.
 * Used in the Project Explorer sidebar under Requirements > System Overview.
 *
 * Team: Frontend (Agent 2.1: UI Engineer)
 */

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  Shield,
  Database,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';


// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Actor {
  name: string;
  role: string;
  description: string;
  goals?: string[];
  painPoints?: string[];
}

interface SystemBoundaries {
  internal: string[];
  external: string[];
  inScope?: string[];
  outOfScope?: string[];
}

interface DataEntity {
  name: string;
  attributes: string[] | Array<{ name: string; type: string; constraints?: string }>;
  relationships: string[] | Array<{ target: string; type: string; description?: string }>;
}

interface ProjectForSection {
  id: number;
  name: string;
  status: string;
  projectData: {
    actors: Actor[] | null;
    systemBoundaries: SystemBoundaries | null;
    dataEntities: DataEntity[] | null;
  } | null;
}

interface SystemOverviewSectionProps {
  project: ProjectForSection;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ActorsTable({ actors }: { actors: Actor[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">
            Actors
          </CardTitle>
        </div>
        <CardDescription>Users and systems that interact with the product</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-foreground">
                  Name
                </th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">
                  Role
                </th>
                <th className="text-left py-3 px-4 font-semibold hidden md:table-cell text-foreground">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {actors.map((actor, index) => (
                <tr
                  key={actor.name + index}
                  className="border-b border-border last:border-b-0"
                >
                  <td className="py-3 px-4 font-medium text-foreground">
                    {actor.name}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="outline">{actor.role}</Badge>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell text-muted-foreground">
                    <div>{actor.description}</div>
                    {actor.goals && actor.goals.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {actor.goals.map((g, gi) => (
                          <Badge key={gi} variant="secondary" className="text-xs">
                            {g}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {actor.painPoints && actor.painPoints.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {actor.painPoints.map((p, pi) => (
                          <Badge
                            key={pi}
                            className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                          >
                            {p}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function SystemBoundariesDisplay({ boundaries }: { boundaries: SystemBoundaries }) {
  const hasInternal = boundaries.internal.length > 0;
  const hasExternal = boundaries.external.length > 0;
  const hasInScope = (boundaries.inScope?.length ?? 0) > 0;
  const hasOutOfScope = (boundaries.outOfScope?.length ?? 0) > 0;

  if (!hasInternal && !hasExternal && !hasInScope && !hasOutOfScope) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">
            System Boundaries
          </CardTitle>
        </div>
        <CardDescription>What is inside and outside the system scope</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Internal Systems */}
          <div>
            <h4 className="text-sm font-semibold mb-3 text-foreground">
              Internal Systems
            </h4>
            {hasInternal ? (
              <div className="flex flex-wrap gap-2">
                {boundaries.internal.map((item, i) => (
                  <Badge
                    key={i}
                    className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                  >
                    {item}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No internal systems defined yet.
              </p>
            )}
          </div>

          {/* External Systems */}
          <div>
            <h4 className="text-sm font-semibold mb-3 text-foreground">
              External Systems
            </h4>
            {hasExternal ? (
              <div className="flex flex-wrap gap-2">
                {boundaries.external.map((item, i) => (
                  <Badge
                    key={i}
                    className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
                  >
                    {item}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No external systems defined yet.
              </p>
            )}
          </div>
        </div>

        {/* In-Scope / Out-of-Scope (B04) */}
        {(hasInScope || hasOutOfScope) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-border">
            <div>
              <h4 className="text-sm font-semibold mb-3 text-foreground">
                In Scope
              </h4>
              {hasInScope ? (
                <div className="flex flex-wrap gap-2">
                  {boundaries.inScope!.map((item, i) => (
                    <Badge
                      key={i}
                      className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    >
                      {item}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Not yet defined.
                </p>
              )}
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3 text-foreground">
                Out of Scope
              </h4>
              {hasOutOfScope ? (
                <div className="flex flex-wrap gap-2">
                  {boundaries.outOfScope!.map((item, i) => (
                    <Badge
                      key={i}
                      className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                    >
                      {item}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Not yet defined.
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DataEntitiesSummary({ entities }: { entities: DataEntity[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">
            Data Entities
          </CardTitle>
        </div>
        <CardDescription>Core data objects in the system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {entities.map((entity, index) => {
            const attrCount = entity.attributes?.length ?? 0;
            const relCount = entity.relationships?.length ?? 0;

            return (
              <div
                key={entity.name + index}
                className="rounded-lg border border-border p-4"
              >
                <h5 className="font-semibold mb-2 text-foreground">
                  {entity.name}
                </h5>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {attrCount} {attrCount === 1 ? 'attribute' : 'attributes'}
                  </Badge>
                  {relCount > 0 && (
                    <Badge variant="outline">
                      {relCount} {relCount === 1 ? 'relationship' : 'relationships'}
                    </Badge>
                  )}
                </div>
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
      ? 'Complete the intake chat to generate system overview data.'
      : 'No system data extracted yet. Start a chat to begin gathering requirements.';

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-16">
          <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-40" />
          <h3 className="text-lg font-semibold mb-2 text-foreground">
            No System Overview Data
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

export function SystemOverviewSection({ project }: SystemOverviewSectionProps) {
  const actors = (project.projectData?.actors ?? []) as Actor[];
  const boundaries = (project.projectData?.systemBoundaries ?? { internal: [], external: [] }) as SystemBoundaries;
  const entities = (project.projectData?.dataEntities ?? []) as DataEntity[];

  const hasData =
    actors.length > 0 ||
    boundaries.internal.length > 0 ||
    boundaries.external.length > 0 ||
    entities.length > 0;

  if (!hasData) {
    return <EmptyState projectId={project.id} status={project.status} />;
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-2xl font-bold mb-1 text-foreground">
          System Overview
        </h2>
        <p className="text-sm text-muted-foreground">
          Actors, system boundaries, and core data entities extracted from your requirements.
        </p>
      </div>

      {actors.length > 0 && <ActorsTable actors={actors} />}
      {(boundaries.internal.length > 0 || boundaries.external.length > 0) && (
        <SystemBoundariesDisplay boundaries={boundaries} />
      )}
      {entities.length > 0 && <DataEntitiesSummary entities={entities} />}
    </div>
  );
}
