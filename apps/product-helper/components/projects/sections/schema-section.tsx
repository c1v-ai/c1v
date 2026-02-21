'use client';

/**
 * Schema Section Component
 *
 * Displays database schema with tables, columns, constraints, and
 * relationships. Renders class diagram artifact if available.
 * Used in the Project Explorer sidebar under Backend > Schema.
 *
 * Team: Frontend (Agent 2.1: UI Engineer)
 */

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Database,
  MessageSquare,
  ArrowRight,
  Table2,
  Key,
  GitBranch,
  Link2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SchemaColumn {
  name: string;
  type: string;
  constraints?: string | string[];
  nullable?: boolean;
  primaryKey?: boolean;
  foreignKey?: string;
  default?: string;
}

interface SchemaRelationship {
  from?: string;
  to?: string;
  source?: string;
  target?: string;
  type?: string;
  description?: string;
  foreignKey?: string;
}

interface SchemaTable {
  name: string;
  columns?: SchemaColumn[];
  fields?: SchemaColumn[];
  relationships?: SchemaRelationship[];
  description?: string;
}

interface DatabaseSchemaData {
  tables?: SchemaTable[];
  entities?: SchemaTable[];
  relationships?: SchemaRelationship[];
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
    databaseSchema: DatabaseSchemaData | null;
  } | null;
  artifacts: Artifact[];
}

interface SchemaSectionProps {
  project: ProjectForSection;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeConstraints(
  constraints: string | string[] | undefined
): string[] {
  if (!constraints) return [];
  if (typeof constraints === 'string') return [constraints];
  return constraints;
}

function getConstraintBadgeColor(constraint: string): string {
  const lower = constraint.toLowerCase();
  if (lower.includes('primary') || lower.includes('pk'))
    return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
  if (lower.includes('unique'))
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
  if (lower.includes('not null') || lower.includes('required'))
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
  if (lower.includes('foreign') || lower.includes('fk'))
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
  return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SchemaTableCard({ table }: { table: SchemaTable }) {
  const columns = table.columns ?? table.fields ?? [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Table2 className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-mono">
            {table.name}
          </CardTitle>
        </div>
        {table.description && (
          <CardDescription>{table.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Columns */}
        {columns.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 font-semibold text-foreground">
                    Column
                  </th>
                  <th className="text-left py-2 px-3 font-semibold text-foreground">
                    Type
                  </th>
                  <th className="text-left py-2 px-3 font-semibold hidden sm:table-cell text-foreground">
                    Constraints
                  </th>
                </tr>
              </thead>
              <tbody>
                {columns.map((col, i) => {
                  const constraints = normalizeConstraints(col.constraints);
                  if (col.primaryKey && !constraints.some((c) => c.toLowerCase().includes('primary'))) {
                    constraints.unshift('PRIMARY KEY');
                  }
                  if (col.foreignKey) {
                    constraints.push(`FK -> ${col.foreignKey}`);
                  }

                  return (
                    <tr
                      key={col.name + i}
                      className="border-b border-border last:border-b-0"
                    >
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1.5">
                          {col.primaryKey && (
                            <Key className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
                          )}
                          <span className="font-mono text-sm text-foreground">
                            {col.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <Badge variant="secondary" className="font-mono text-xs">
                          {col.type}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 hidden sm:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {constraints.map((c, ci) => (
                            <Badge
                              key={ci}
                              className={cn('text-xs', getConstraintBadgeColor(c))}
                            >
                              {c}
                            </Badge>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table-level relationships */}
        {table.relationships && table.relationships.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2 text-foreground">
              Relationships
            </h4>
            <div className="space-y-1.5">
              {table.relationships.map((rel, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2 rounded-md text-sm bg-muted"
                >
                  <Link2 className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
                  <span className="text-foreground">
                    {rel.to || rel.target || 'Unknown'}
                  </span>
                  {rel.type && (
                    <Badge variant="outline" className="text-xs">
                      {rel.type}
                    </Badge>
                  )}
                  {rel.description && (
                    <span className="text-muted-foreground">
                      -- {rel.description}
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

function ClassDiagramCard({ mermaid }: { mermaid: string }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">
            Class Diagram
          </CardTitle>
        </div>
        <CardDescription>Entity relationships visualized as a class diagram</CardDescription>
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

function GlobalRelationshipsCard({ relationships }: { relationships: SchemaRelationship[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Link2 className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">
            Table Relationships
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {relationships.map((rel, i) => {
            const from = rel.from || rel.source || 'Unknown';
            const to = rel.to || rel.target || 'Unknown';

            return (
              <div
                key={i}
                className="flex items-center gap-2 p-3 rounded-md text-sm bg-muted"
              >
                <span className="font-mono font-medium text-foreground">
                  {from}
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-mono font-medium text-foreground">
                  {to}
                </span>
                {rel.type && (
                  <Badge variant="outline" className="text-xs ml-auto">
                    {rel.type}
                  </Badge>
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
      ? 'Complete the intake chat to generate a database schema from your requirements.'
      : 'No database schema generated yet. Data will appear here after extraction.';

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-16">
          <Database className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-40" />
          <h3 className="text-lg font-semibold mb-2 text-foreground">
            No Database Schema
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

export function SchemaSection({ project }: SchemaSectionProps) {
  const schemaData = project.projectData?.databaseSchema as DatabaseSchemaData | null;
  const tables = schemaData?.tables ?? schemaData?.entities ?? [];
  const globalRelationships = schemaData?.relationships ?? [];

  // Find class diagram artifact
  const classDiagramArtifact = project.artifacts?.find(
    (a) => a.type === 'class_diagram'
  );
  const classMermaid =
    classDiagramArtifact?.content &&
    typeof classDiagramArtifact.content === 'object' &&
    'mermaid' in classDiagramArtifact.content
      ? (classDiagramArtifact.content as { mermaid?: string }).mermaid
      : undefined;

  const hasData = tables.length > 0 || !!classMermaid;

  if (!hasData) {
    return <EmptyState projectId={project.id} status={project.status} />;
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-2xl font-bold mb-1 text-foreground">
          Database Schema
        </h2>
        <p className="text-sm text-muted-foreground">
          Tables, columns, constraints, and relationships for your database model.
        </p>
      </div>

      {classMermaid && <ClassDiagramCard mermaid={classMermaid} />}

      {tables.map((table, index) => (
        <SchemaTableCard key={table.name + index} table={table} />
      ))}

      {globalRelationships.length > 0 && (
        <GlobalRelationshipsCard relationships={globalRelationships} />
      )}
    </div>
  );
}
