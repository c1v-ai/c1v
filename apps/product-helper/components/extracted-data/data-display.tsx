'use client';

/**
 * Extracted Data Display Component (Phase 10)
 *
 * Purpose: Display structured PRD data extracted from conversations
 * Pattern: Frontend - React Client Component with shadcn/ui
 * Team: Frontend (Agent 2.1: UI Engineer)
 *
 * Shows:
 * - Actors with roles and descriptions
 * - Use cases linked to actors
 * - System boundaries (internal vs external)
 * - Data entities with attributes
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, GitBranch, Box, Database, CheckCircle2 } from 'lucide-react';
import type { Actor, UseCase, DataEntity } from '@/lib/langchain/schemas';

interface SystemBoundaries {
  internal: string[];
  external: string[];
}

interface ExtractedDataDisplayProps {
  actors?: Actor[];
  useCases?: UseCase[];
  systemBoundaries?: SystemBoundaries;
  dataEntities?: DataEntity[];
  completeness?: number;
  lastExtractedAt?: Date;
}

export function ExtractedDataDisplay({
  actors = [],
  useCases = [],
  systemBoundaries = { internal: [], external: [] },
  dataEntities = [],
  completeness = 0,
  lastExtractedAt,
}: ExtractedDataDisplayProps) {
  // Check if any data exists
  const hasData =
    actors.length > 0 ||
    useCases.length > 0 ||
    systemBoundaries.internal.length > 0 ||
    systemBoundaries.external.length > 0 ||
    dataEntities.length > 0;

  if (!hasData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-lg mb-2" >
              No data extracted yet
            </p>
            <p className="text-sm text-muted-foreground">
              Chat with the AI to gather requirements. Data will be automatically extracted every 5 messages.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Completeness Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle >
                Extracted PRD Data
              </CardTitle>
              <CardDescription >
                {lastExtractedAt && (
                  <>Last updated: {new Date(lastExtractedAt).toLocaleString()}</>
                )}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold" >
                {completeness}%
              </div>
              <div className="text-sm text-muted-foreground">Complete</div>
            </div>
          </div>
          <div className="mt-4 h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${completeness}%`,
                backgroundColor: completeness >= 75 ? '#10b981' : completeness >= 50 ? '#f59e0b' : '#3b82f6',
              }}
            />
          </div>
        </CardHeader>
      </Card>

      {/* Tabbed Data Display */}
      <Tabs defaultValue="actors" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="actors">
            <Users className="h-4 w-4 mr-2" />
            Actors ({actors.length})
          </TabsTrigger>
          <TabsTrigger value="useCases">
            <GitBranch className="h-4 w-4 mr-2" />
            Use Cases ({useCases.length})
          </TabsTrigger>
          <TabsTrigger value="boundaries">
            <Box className="h-4 w-4 mr-2" />
            Boundaries
          </TabsTrigger>
          <TabsTrigger value="entities">
            <Database className="h-4 w-4 mr-2" />
            Entities ({dataEntities.length})
          </TabsTrigger>
        </TabsList>

        {/* Actors Tab */}
        <TabsContent value="actors" className="space-y-4 mt-4">
          {actors.length === 0 ? (
            <EmptyState message="No actors identified yet. Discuss who will use the system." />
          ) : (
            actors.map((actor, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg" >
                      {actor.name}
                    </CardTitle>
                    <Badge variant="outline">{actor.role}</Badge>
                  </div>
                  <CardDescription >
                    {actor.description}
                  </CardDescription>
                </CardHeader>
                {actor.goals && actor.goals.length > 0 && (
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold">Goals:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {actor.goals.map((goal, i) => (
                          <li key={i} className="text-sm text-muted-foreground">
                            {goal}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </TabsContent>

        {/* Use Cases Tab */}
        <TabsContent value="useCases" className="space-y-4 mt-4">
          {useCases.length === 0 ? (
            <EmptyState message="No use cases identified yet. Discuss what users can do in the system." />
          ) : (
            useCases.map((useCase) => (
              <Card key={useCase.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary">{useCase.id}</Badge>
                        <CardTitle className="text-lg" >
                          {useCase.name}
                        </CardTitle>
                      </div>
                      <CardDescription >
                        <span className="font-semibold">Actor:</span> {useCase.actor}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm">{useCase.description}</p>

                  {useCase.trigger && (
                    <div>
                      <p className="text-sm font-semibold mb-1">Trigger:</p>
                      <p className="text-sm text-muted-foreground">{useCase.trigger}</p>
                    </div>
                  )}

                  {useCase.outcome && (
                    <div>
                      <p className="text-sm font-semibold mb-1">Outcome:</p>
                      <p className="text-sm text-muted-foreground">{useCase.outcome}</p>
                    </div>
                  )}

                  {useCase.preconditions && useCase.preconditions.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold mb-1">Preconditions:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {useCase.preconditions.map((condition, i) => (
                          <li key={i} className="text-sm text-muted-foreground">
                            {condition}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {useCase.postconditions && useCase.postconditions.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold mb-1">Postconditions:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {useCase.postconditions.map((condition, i) => (
                          <li key={i} className="text-sm text-muted-foreground">
                            {condition}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* System Boundaries Tab */}
        <TabsContent value="boundaries" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle >
                Internal Components
              </CardTitle>
              <CardDescription>Components within the system boundary</CardDescription>
            </CardHeader>
            <CardContent>
              {systemBoundaries.internal.length === 0 ? (
                <p className="text-sm text-muted-foreground">No internal components defined yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {systemBoundaries.internal.map((component, i) => (
                    <Badge key={i} className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                      {component}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle >
                External Systems
              </CardTitle>
              <CardDescription>External services and integrations</CardDescription>
            </CardHeader>
            <CardContent>
              {systemBoundaries.external.length === 0 ? (
                <p className="text-sm text-muted-foreground">No external systems defined yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {systemBoundaries.external.map((system, i) => (
                    <Badge key={i} className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                      {system}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Entities Tab */}
        <TabsContent value="entities" className="space-y-4 mt-4">
          {dataEntities.length === 0 ? (
            <EmptyState message="No data entities identified yet. Discuss what information the system needs to store." />
          ) : (
            dataEntities.map((entity, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle >
                    {entity.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {entity.attributes && entity.attributes.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold mb-2">Attributes:</p>
                      <div className="flex flex-wrap gap-2">
                        {entity.attributes.map((attr, i) => (
                          <Badge key={i} variant="secondary">
                            {attr}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {entity.relationships && entity.relationships.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold mb-2">Relationships:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {entity.relationships.map((rel, i) => (
                          <li key={i} className="text-sm text-muted-foreground">
                            {rel}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
}
