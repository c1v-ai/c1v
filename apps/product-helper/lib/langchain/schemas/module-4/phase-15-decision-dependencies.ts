/**
 * Phase 15 — Decision Dependencies (DAG, T4b Wave 3).
 *
 * Represents the full inter-node dependency graph across decision nodes.
 * Node-local dependency_edges (phase-14) are aggregated here and validated
 * to be acyclic at parse time via `.refine()`.
 *
 * Acyclicity is a hard requirement: Pareto frontier (phase-16) and
 * sensitivity (phase-17b) assume a topologically orderable net.
 *
 * @module lib/langchain/schemas/module-4/phase-15-decision-dependencies
 */

import { z } from 'zod';
import { module4PhaseEnvelopeSchema } from './_shared';
import { decisionNodeIdSchema } from './phase-14-decision-nodes';

export const dependencyEdgeSchema = z
  .object({
    from: decisionNodeIdSchema,
    to: decisionNodeIdSchema,
    relation: z
      .enum(['precedes', 'constrains', 'informs'])
      .default('precedes'),
    rationale: z.string().optional(),
  })
  .refine((e) => e.from !== e.to, {
    message: 'self-loops forbidden in decision dependency graph',
  })
  .describe(
    'x-ui-surface=section:Decision Dependencies > Edge — directed edge between decision nodes.',
  );
export type DependencyEdge = z.infer<typeof dependencyEdgeSchema>;

/** DAG-check helper: true if no cycle reachable from any node. */
function isAcyclic(edges: ReadonlyArray<{ from: string; to: string }>): boolean {
  const adj = new Map<string, string[]>();
  for (const e of edges) {
    if (!adj.has(e.from)) adj.set(e.from, []);
    adj.get(e.from)!.push(e.to);
  }
  const WHITE = 0,
    GRAY = 1,
    BLACK = 2;
  const color = new Map<string, number>();
  const nodes = new Set<string>();
  for (const e of edges) {
    nodes.add(e.from);
    nodes.add(e.to);
  }
  for (const n of nodes) color.set(n, WHITE);

  function dfs(u: string): boolean {
    color.set(u, GRAY);
    for (const v of adj.get(u) ?? []) {
      const c = color.get(v) ?? WHITE;
      if (c === GRAY) return false;
      if (c === WHITE && !dfs(v)) return false;
    }
    color.set(u, BLACK);
    return true;
  }
  for (const n of nodes) {
    if (color.get(n) === WHITE && !dfs(n)) return false;
  }
  return true;
}

export const phase15Schema = module4PhaseEnvelopeSchema
  .extend({
    nodes: z
      .array(decisionNodeIdSchema)
      .min(1)
      .describe(
        'x-ui-surface=section:Decision Dependencies > Nodes — enumerated decision-node IDs present in the net.',
      ),
    edges: z.array(dependencyEdgeSchema),
  })
  .refine(
    (g) =>
      isAcyclic(
        g.edges.map((e) => ({ from: e.from, to: e.to })),
      ),
    { message: 'decision dependency graph must be acyclic (DAG)' },
  )
  .refine(
    (g) => {
      const known = new Set(g.nodes);
      return g.edges.every((e) => known.has(e.from) && known.has(e.to));
    },
    { message: 'every edge.from/edge.to must appear in nodes[]' },
  );
export type Phase15Artifact = z.infer<typeof phase15Schema>;
