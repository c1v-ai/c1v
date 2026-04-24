/**
 * Phase 16 — Pareto Frontier (T4b Wave 3).
 *
 * Given the utility vectors across decision nodes, an architecture vector
 * is a choice of one alternative per decision node. The Pareto frontier is
 * the set of non-dominated architecture vectors over (criterion_id →
 * weighted_score) space.
 *
 * An architecture vector A dominates B iff A is >= B on every criterion
 * and > on at least one.
 *
 * @module lib/langchain/schemas/module-4/phase-16-pareto-frontier
 */

import { z } from 'zod';
import { module4PhaseEnvelopeSchema, mathDerivationV2Schema } from './_shared';
import {
  alternativeIdSchema,
  decisionNodeIdSchema,
} from './phase-14-decision-nodes';

export const architectureVectorSchema = z
  .object({
    id: z.string().regex(/^AV\.[0-9]{2}$/),
    choices: z
      .array(
        z.object({
          decision_node_id: decisionNodeIdSchema,
          alternative_id: alternativeIdSchema,
        }),
      )
      .min(1),
    criterion_scores: z
      .array(
        z.object({
          criterion_id: z.string().regex(/^PC-[0-9]{2}$/),
          value: z.number(),
        }),
      )
      .min(1),
    utility_total: z.number(),
    on_frontier: z
      .boolean()
      .describe(
        'x-ui-surface=section:Pareto Frontier > Row — true if vector is non-dominated.',
      ),
  })
  .describe(
    'x-ui-surface=section:Pareto Frontier > Row — one candidate architecture vector.',
  );
export type ArchitectureVector = z.infer<typeof architectureVectorSchema>;

export const dominanceEdgeSchema = z
  .object({
    dominator: z.string().regex(/^AV\.[0-9]{2}$/),
    dominated: z.string().regex(/^AV\.[0-9]{2}$/),
  })
  .describe(
    'x-ui-surface=section:Pareto Frontier > Dominance — directed edge A → B means A dominates B.',
  );
export type DominanceEdge = z.infer<typeof dominanceEdgeSchema>;

export const phase16Schema = module4PhaseEnvelopeSchema
  .extend({
    architecture_vectors: z.array(architectureVectorSchema).min(1),
    dominance_edges: z.array(dominanceEdgeSchema),
    frontier_ids: z.array(z.string().regex(/^AV\.[0-9]{2}$/)).min(1),
    dominance_math: mathDerivationV2Schema.describe(
      'x-ui-surface=section:Pareto Frontier > Math — formula: A dominates B iff ∀c score_c(A)≥score_c(B) ∧ ∃c score_c(A)>score_c(B).',
    ),
  })
  .refine(
    (f: { architecture_vectors: Array<{ id: string; on_frontier: boolean }>; frontier_ids: string[] }) => {
      const onFrontier = new Set(
        f.architecture_vectors.filter((v) => v.on_frontier).map((v) => v.id),
      );
      return (
        onFrontier.size === f.frontier_ids.length &&
        f.frontier_ids.every((id) => onFrontier.has(id))
      );
    },
    { message: 'frontier_ids must match architecture_vectors where on_frontier=true' },
  )
  .refine((f: { frontier_ids: string[] }) => f.frontier_ids.length >= 1, {
    message: 'Pareto frontier must be non-empty',
  });
export type Phase16Artifact = z.infer<typeof phase16Schema>;
