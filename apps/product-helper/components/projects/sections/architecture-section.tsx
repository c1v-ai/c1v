'use client';

/**
 * Architecture Section Component
 *
 * Displays detailed data entities with attributes/relationships and context diagrams.
 * Used in the Project Explorer sidebar under Requirements > Architecture.
 *
 * Team: Frontend (Agent 2.1: UI Engineer)
 */

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Boxes,
  MessageSquare,
  ArrowRight,
  GitBranch,
  Link2,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DataEntityAttribute {
  name: string;
  type: string;
  constraints?: string;
}

interface DataEntityRelationship {
  target: string;
  type: string;
  description?: string;
}

interface DataEntity {
  name: string;
  attributes: string[] | DataEntityAttribute[];
  relationships: string[] | DataEntityRelationship[];
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
    dataEntities: DataEntity[] | null;
  } | null;
  artifacts: Artifact[];
}

interface ArchitectureSectionProps {
  project: ProjectForSection;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isStructuredAttribute(
  attr: string | DataEntityAttribute
): attr is DataEntityAttribute {
  return typeof attr === 'object' && 'name' in attr;
}

function isStructuredRelationship(
  rel: string | DataEntityRelationship
): rel is DataEntityRelationship {
  return typeof rel === 'object' && 'target' in rel;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function EntityDetailCard({ entity }: { entity: DataEntity }) {
  const attributes = entity.attributes ?? [];
  const relationships = entity.relationships ?? [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Boxes className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">
            {entity.name}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Attributes */}
        {attributes.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3 text-foreground">
              Attributes
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 font-semibold text-foreground">
                      Name
                    </th>
                    {isStructuredAttribute(attributes[0]) && (
                      <>
                        <th className="text-left py-2 px-3 font-semibold text-foreground">
                          Type
                        </th>
                        <th className="text-left py-2 px-3 font-semibold hidden sm:table-cell text-foreground">
                          Constraints
                        </th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {attributes.map((attr, i) => (
                    <tr
                      key={i}
                      className="border-b border-border last:border-b-0"
                    >
                      {isStructuredAttribute(attr) ? (
                        <>
                          <td className="py-2 px-3 font-mono text-sm text-foreground">
                            {attr.name}
                          </td>
                          <td className="py-2 px-3">
                            <Badge variant="secondary" className="font-mono text-xs">
                              {attr.type}
                            </Badge>
                          </td>
                          <td className="py-2 px-3 hidden sm:table-cell text-muted-foreground">
                            {attr.constraints || '-'}
                          </td>
                        </>
                      ) : (
                        <td className="py-2 px-3 text-foreground">
                          {attr}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Relationships */}
        {relationships.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3 text-foreground">
              Relationships
            </h4>
            <div className="space-y-2">
              {relationships.map((rel, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 p-2 rounded-md bg-muted"
                >
                  <Link2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                  {isStructuredRelationship(rel) ? (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm text-foreground">
                          {rel.target}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {rel.type}
                        </Badge>
                      </div>
                      {rel.description && (
                        <p className="text-xs mt-1 text-muted-foreground">
                          {rel.description}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-foreground">
                      {rel}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ContextDiagramCard({ mermaid }: { mermaid: string }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">
            Context Diagram
          </CardTitle>
        </div>
        <CardDescription>System boundary with actors and external entities</CardDescription>
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
      ? 'Complete the intake chat to generate architecture data.'
      : 'No architecture data extracted yet. Continue chatting to build your data model.';

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-16">
          <Boxes className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-40" />
          <h3 className="text-lg font-semibold mb-2 text-foreground">
            No Architecture Data
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

export function ArchitectureSection({ project }: ArchitectureSectionProps) {
  const entities = (project.projectData?.dataEntities ?? []) as DataEntity[];
  const contextDiagramArtifact = project.artifacts?.find(
    (a) => a.type === 'context_diagram'
  );
  const contextMermaid =
    contextDiagramArtifact?.content &&
    typeof contextDiagramArtifact.content === 'object' &&
    'mermaid' in contextDiagramArtifact.content
      ? (contextDiagramArtifact.content as { mermaid?: string }).mermaid
      : undefined;

  const hasData = entities.length > 0 || !!contextMermaid;

  if (!hasData) {
    return <EmptyState projectId={project.id} status={project.status} />;
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-2xl font-bold mb-1 text-foreground">
          Architecture
        </h2>
        <p className="text-sm text-muted-foreground">
          Detailed data model and system context diagram for your project.
        </p>
      </div>

      {contextMermaid && <ContextDiagramCard mermaid={contextMermaid} />}

      {entities.map((entity, index) => (
        <EntityDetailCard key={entity.name + index} entity={entity} />
      ))}
    </div>
  );
}
