/**
 * Phase 14 — Decision Nodes (decision-net rework, T4b Wave 3).
 *
 * Per v1 §5.1 and v2 §0.3.4, the flat M4 Decision Matrix becomes a directed
 * graph of decision nodes. Each decision node owns:
 *   - alternatives[]   — options under consideration at this node
 *   - criteria[]       — local evaluation axes (subset of global PCs)
 *   - scores[]         — per-(alternative, criterion) score with empirical
 *                         prior citation
 *   - dependency_edges[] — outbound edges to other decision-net nodes
 *                         (validated acyclic at the network level in
 *                         phase-15; individual node just lists IDs)
 *   - utility          — U(a) = Σ w_c · score(a,c) per alternative, in
 *                         vector form (one entry per alternative)
 *
 * Utility scoring uses `mathDerivationV2` with result_shape='vector' so the
 * whole utility vector is preserved for Pareto + sensitivity.
 *
 * @module lib/langchain/schemas/module-4/phase-14-decision-nodes
 */

import { z } from 'zod';
import { module4PhaseEnvelopeSchema, mathDerivationV2Schema } from './_shared';

/** Decision-node ID: `DN.NN` (two-digit numeric). */
export const decisionNodeIdSchema = z
  .string()
  .regex(/^DN\.[0-9]{2}$/)
  .describe(
    'x-ui-surface=section:Decision Node > Header — ID pattern DN.NN (e.g., DN.01 = choose orchestration runtime).',
  );
export type DecisionNodeId = z.infer<typeof decisionNodeIdSchema>;

/** Alternative ID: uppercase single letter (A..Z). */
export const alternativeIdSchema = z
  .string()
  .regex(/^[A-Z]$/)
  .describe(
    'x-ui-surface=section:Decision Node > Alternatives — single uppercase letter ID.',
  );
export type AlternativeId = z.infer<typeof alternativeIdSchema>;

/** Empirical prior binding — REQUIRED on every score. */
export const empiricalPriorCitationSchema = z
  .object({
    source: z.enum(['kb-8-atlas', 'kb-shared', 'nfr', 'fmea', 'inferred']),
    ref: z
      .string()
      .describe(
        'x-ui-surface=section:Score > Citation — atlas entry filename or NFR id or inferred-rationale.',
      ),
    sample_size: z
      .number()
      .int()
      .min(0)
      .optional()
      .describe(
        'x-ui-surface=section:Score > Citation — n supporting the prior (drives provisional flag).',
      ),
    provisional: z
      .boolean()
      .default(false)
      .describe(
        'x-ui-surface=section:Score > Citation — true when sample_size < 10 (per v1 R2 ruling).',
      ),
    rationale: z
      .string()
      .optional()
      .describe(
        'x-ui-surface=section:Score > Citation — required when source="inferred"; describes why no empirical prior exists.',
      ),
  })
  .refine(
    (c) => c.source !== 'inferred' || (c.rationale && c.rationale.length > 0),
    {
      message: 'inferred source requires non-empty rationale',
      path: ['rationale'],
    },
  )
  .describe(
    'x-ui-surface=section:Score > Citation — empirical prior binding. Every score MUST cite KB-8 atlas, shared KB, NFR, FMEA, or mark inferred with rationale.',
  );
export type EmpiricalPriorCitation = z.infer<
  typeof empiricalPriorCitationSchema
>;

export const decisionCriterionSchema = z
  .object({
    criterion_id: z.string().regex(/^PC-[0-9]{2}$/),
    weight: z.number().min(0).max(1),
    direction: z.enum(['maximize', 'minimize']),
  })
  .describe(
    'x-ui-surface=section:Decision Node > Criteria — local criterion binding with weight and optimization direction.',
  );
export type DecisionCriterion = z.infer<typeof decisionCriterionSchema>;

export const decisionScoreSchema = z
  .object({
    alternative_id: alternativeIdSchema,
    criterion_id: z.string().regex(/^PC-[0-9]{2}$/),
    raw_value: z.number(),
    normalized_value: z.number().min(0).max(1),
    empirical_priors: empiricalPriorCitationSchema,
    math_derivation: mathDerivationV2Schema,
  })
  .describe(
    'x-ui-surface=section:Decision Node > Scores Row — one score per (alternative, criterion) cell.',
  );
export type DecisionScore = z.infer<typeof decisionScoreSchema>;

export const decisionNodeSchema = z
  .object({
    id: decisionNodeIdSchema,
    title: z.string().min(3),
    question: z.string().min(3),
    alternatives: z
      .array(
        z.object({
          id: alternativeIdSchema,
          name: z.string().min(1),
          description: z.string().optional(),
        }),
      )
      .min(2),
    criteria: z.array(decisionCriterionSchema).min(1),
    scores: z.array(decisionScoreSchema).min(1),
    dependency_edges: z
      .array(decisionNodeIdSchema)
      .default([])
      .describe(
        'x-ui-surface=section:Decision Node > Dependencies — outbound DN.NN refs; acyclicity enforced in phase-15.',
      ),
    utility_vector: z
      .object({
        formula: z.literal('U(a) = Σ w_c · score(a,c)'),
        values: z.array(
          z.object({
            alternative_id: alternativeIdSchema,
            utility: z.number(),
          }),
        ),
        math_derivation: mathDerivationV2Schema,
      })
      .describe(
        'x-ui-surface=section:Decision Node > Utility — weighted-sum utility per alternative.',
      ),
  })
  .refine((n: { criteria: Array<{ criterion_id: string }>; scores: Array<{ criterion_id: string; alternative_id: string }>; alternatives: Array<{ id: string }> }) => {
    const critIds = new Set(n.criteria.map((c) => c.criterion_id));
    return n.scores.every((s) => critIds.has(s.criterion_id));
  }, { message: 'every score.criterion_id must appear in criteria[]' })
  .refine((n: { alternatives: Array<{ id: string }>; scores: Array<{ alternative_id: string }> }) => {
    const altIds = new Set(n.alternatives.map((a) => a.id));
    return n.scores.every((s) => altIds.has(s.alternative_id));
  }, { message: 'every score.alternative_id must appear in alternatives[]' })
  .describe(
    'x-ui-surface=section:Decision Node — full decision node (alternatives + criteria + scores + deps + utility).',
  );
export type DecisionNode = z.infer<typeof decisionNodeSchema>;

export const phase14Schema = module4PhaseEnvelopeSchema.extend({
  decision_nodes: z.array(decisionNodeSchema).min(1),
});
export type Phase14Artifact = z.infer<typeof phase14Schema>;
