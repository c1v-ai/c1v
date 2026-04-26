'use client';

/**
 * DatabaseSchemaPane — read-only schema render + DBML approval gate.
 *
 * Reuses table-card markup verbatim from the legacy schema-section.tsx —
 * once that file is removed, this pane becomes the canonical schema render
 * surface.
 */

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Database,
  Key,
  Table2,
  Link2,
  GitBranch,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { transpileSchemaToDbml } from '@/lib/dbml/sql-to-dbml';
import { SchemaApprovalGate } from './schema-approval-gate';
import type { SchemaApprovalState } from './types';

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
}
interface SchemaTable {
  name: string;
  columns?: SchemaColumn[];
  fields?: SchemaColumn[];
  relationships?: SchemaRelationship[];
  description?: string;
}
export interface DatabaseSchemaData {
  tables?: SchemaTable[];
  entities?: SchemaTable[];
  relationships?: SchemaRelationship[];
  enums?: Array<{ name: string; values: string[] }>;
  [key: string]: unknown;
}

interface Props {
  projectId: number;
  schema: DatabaseSchemaData | null;
  classMermaid?: string;
  approval: SchemaApprovalState | null;
}

/**
 * Stable digest of the schema content. Used as `approvedSha` so re-extraction
 * invalidates approval. Insensitive to key order via JSON.stringify of a
 * normalized projection.
 */
function digestSchema(schema: DatabaseSchemaData | null): string {
  if (!schema) return '';
  const tables = (schema.tables ?? schema.entities ?? []).map((t) => ({
    name: t.name,
    cols: (t.columns ?? t.fields ?? []).map((c) => ({
      n: c.name,
      t: c.type,
      pk: !!c.primaryKey,
      fk: c.foreignKey ?? null,
    })),
  }));
  const json = JSON.stringify({ tables, enums: schema.enums ?? [] });
  // FNV-1a 32-bit — cheap, deterministic, non-cryptographic.
  let h = 0x811c9dc5;
  for (let i = 0; i < json.length; i++) {
    h ^= json.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

function normalizeConstraints(c: string | string[] | undefined): string[] {
  if (!c) return [];
  return typeof c === 'string' ? [c] : c;
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

function SchemaTableCard({ table }: { table: SchemaTable }) {
  const columns = table.columns ?? table.fields ?? [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Table2 className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-mono">{table.name}</CardTitle>
        </div>
        {table.description && <CardDescription>{table.description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        {columns.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 font-semibold text-foreground">Column</th>
                  <th className="text-left py-2 px-3 font-semibold text-foreground">Type</th>
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
                    <tr key={col.name + i} className="border-b border-border last:border-b-0">
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1.5">
                          {col.primaryKey && <Key className="h-3.5 w-3.5 flex-shrink-0 text-primary" />}
                          <span className="font-mono text-sm text-foreground">{col.name}</span>
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
                            <Badge key={ci} className={cn('text-xs', getConstraintBadgeColor(c))}>
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

        {table.relationships && table.relationships.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2 text-foreground">Relationships</h4>
            <div className="space-y-1.5">
              {table.relationships.map((rel, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-md text-sm bg-muted">
                  <Link2 className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
                  <span className="text-foreground">{rel.to || rel.target || 'Unknown'}</span>
                  {rel.type && (
                    <Badge variant="outline" className="text-xs">
                      {rel.type}
                    </Badge>
                  )}
                  {rel.description && <span className="text-muted-foreground">-- {rel.description}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
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
          <CardTitle className="text-lg">Table Relationships</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {relationships.map((rel, i) => {
            const from = rel.from || rel.source || 'Unknown';
            const to = rel.to || rel.target || 'Unknown';
            return (
              <div key={i} className="flex items-center gap-2 p-3 rounded-md text-sm bg-muted">
                <span className="font-mono font-medium text-foreground">{from}</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-mono font-medium text-foreground">{to}</span>
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

function ClassDiagramCard({ mermaid }: { mermaid: string }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Class Diagram</CardTitle>
        </div>
        <CardDescription>Entity relationships visualized as a class diagram</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border p-4 overflow-x-auto bg-muted">
          <pre className="text-sm font-mono whitespace-pre-wrap text-foreground">{mermaid}</pre>
        </div>
      </CardContent>
    </Card>
  );
}

export function DatabaseSchemaPane({ projectId, schema, classMermaid, approval }: Props) {
  const tables = schema?.tables ?? schema?.entities ?? [];
  const globalRelationships = schema?.relationships ?? [];

  const { dbml, warnings, sha } = useMemo(() => {
    const sha = digestSchema(schema);
    if (!schema || tables.length === 0) {
      return { dbml: '', warnings: [], sha };
    }
    const r = transpileSchemaToDbml(schema);
    return { dbml: r.dbml, warnings: r.warnings, sha };
  }, [schema, tables.length]);

  if (tables.length === 0 && !classMermaid) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Database className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="text-sm text-muted-foreground">
              No database schema generated yet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <SchemaApprovalGate
        projectId={projectId}
        currentSha={sha}
        approval={approval}
        dbml={dbml}
        warnings={warnings}
      />

      {classMermaid && <ClassDiagramCard mermaid={classMermaid} />}

      {tables.map((t, i) => (
        <SchemaTableCard key={t.name + i} table={t} />
      ))}

      {globalRelationships.length > 0 && (
        <GlobalRelationshipsCard relationships={globalRelationships} />
      )}
    </div>
  );
}
