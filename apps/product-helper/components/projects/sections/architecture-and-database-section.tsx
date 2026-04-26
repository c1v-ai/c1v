'use client';

/**
 * Architecture & Database Section (TA2 Wave A — EC-V21-A.6).
 *
 * Merges the legacy architecture-section.tsx + schema-section.tsx into a
 * single host with two sub-panes:
 *   - Architecture Diagram pane: alternative-picker (Pareto-frontier
 *     architectures from `decisionNetwork.alternatives` or
 *     `architecture_recommendation.pareto_frontier`) + Mermaid render via
 *     the FROZEN diagram-viewer.
 *   - Database Schema pane: read-only tables/relationships render +
 *     SchemaApprovalGate (Approve CTA + DBML export). Approval persists to
 *     `extractedData.schema.{approvedAt, approvedBy, approvedSha}`. Re-
 *     extraction (a new schema digest) drops the approval automatically.
 *
 * @see EC-V21-A.6 in plans/c1v-MIT-Crawley-Cornell.v2.1.md
 * @see DBML transpiler at lib/dbml/sql-to-dbml.ts (locked: @dbml/core, MIT)
 */

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Boxes, Database } from 'lucide-react';
import { ArchitectureDiagramPane } from './architecture-and-database/architecture-diagram-pane';
import { DatabaseSchemaPane, type DatabaseSchemaData } from './architecture-and-database/database-schema-pane';
import type {
  ArchitectureAlternative,
  DecisionNetworkLike,
  SchemaApprovalState,
} from './architecture-and-database/types';

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
    intakeState?: unknown;
  } | null;
  artifacts: Artifact[];
}

interface Props {
  project: ProjectForSection;
  /** Optional override — for tests + future synthesis-pipeline integration. */
  decisionNetwork?: DecisionNetworkLike | null;
}

function readApproval(project: ProjectForSection): SchemaApprovalState | null {
  const intake = project.projectData?.intakeState as
    | { extractedData?: { schema?: SchemaApprovalState } }
    | null
    | undefined;
  return intake?.extractedData?.schema ?? null;
}

function readDecisionNetwork(project: ProjectForSection): DecisionNetworkLike | null {
  const intake = project.projectData?.intakeState as
    | {
        extractedData?: {
          decisionNetwork?: DecisionNetworkLike;
          architectureRecommendation?: {
            pareto_frontier?: ArchitectureAlternative[];
            mermaid_diagrams?: { decision_network?: string };
          };
        };
      }
    | null
    | undefined;

  const dn = intake?.extractedData?.decisionNetwork;
  if (dn) return dn;

  const arch = intake?.extractedData?.architectureRecommendation;
  if (arch?.pareto_frontier) {
    return {
      alternatives: arch.pareto_frontier,
      mermaid_diagrams: arch.mermaid_diagrams,
    };
  }
  return null;
}

export function ArchitectureAndDatabaseSection({ project, decisionNetwork }: Props) {
  const [tab, setTab] = useState<'architecture' | 'schema'>('architecture');

  const dn = decisionNetwork ?? readDecisionNetwork(project);
  const schema = project.projectData?.databaseSchema ?? null;
  const approval = readApproval(project);

  const contextDiagramArtifact = project.artifacts?.find((a) => a.type === 'context_diagram');
  const fallbackArchMermaid =
    contextDiagramArtifact?.content && typeof contextDiagramArtifact.content === 'object'
      ? contextDiagramArtifact.content.mermaid
      : undefined;

  const classDiagramArtifact = project.artifacts?.find((a) => a.type === 'class_diagram');
  const classMermaid =
    classDiagramArtifact?.content && typeof classDiagramArtifact.content === 'object'
      ? classDiagramArtifact.content.mermaid
      : undefined;

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold mb-1 text-foreground">Architecture & Database</h2>
        <p className="text-sm text-muted-foreground">
          Pick an architecture alternative, then approve the database schema for downstream code
          generation.
        </p>
      </header>

      <Tabs value={tab} onValueChange={(v) => setTab(v as 'architecture' | 'schema')}>
        <TabsList>
          <TabsTrigger value="architecture" className="gap-1.5">
            <Boxes className="h-4 w-4" />
            Architecture Diagram
          </TabsTrigger>
          <TabsTrigger value="schema" className="gap-1.5">
            <Database className="h-4 w-4" />
            Database Schema
          </TabsTrigger>
        </TabsList>

        <TabsContent value="architecture" className="mt-6">
          <ArchitectureDiagramPane
            decisionNetwork={dn}
            fallbackMermaid={fallbackArchMermaid}
          />
        </TabsContent>

        <TabsContent value="schema" className="mt-6">
          <DatabaseSchemaPane
            projectId={project.id}
            schema={schema}
            classMermaid={classMermaid}
            approval={approval}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
