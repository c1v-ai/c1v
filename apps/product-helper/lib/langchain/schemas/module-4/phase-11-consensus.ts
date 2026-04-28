/**
 * Phase 11 — Building Consensus Using Criteria Weights
 *
 * Quantifies team agreement on the weights from M4 Phase 10. Low consensus
 * (high variance, low Kendall-τ) triggers re-weighting discussion before
 * Phase 13 scoring. Every consensus measure carries the formula so
 * reviewers can reproduce the calculation.
 *
 * @module lib/langchain/schemas/module-4/phase-11-consensus
 */

import { z } from 'zod';
import { module4PhaseEnvelopeSchema } from './_shared';
import { mathDerivationSchema } from '../module-2/_shared';

export const consensusMetricTypeSchema = z.enum([
  'variance',
  'standard_deviation',
  'kendall_tau',
  'spearman_rho',
  'gini_coefficient',
]);
export type ConsensusMetricType = z.infer<typeof consensusMetricTypeSchema>;

export const perCriterionConsensusSchema = z
  .object({
    criterion_id: z
      .string()
      .regex(/^PC-[0-9]{2}$/),
    metric_type: consensusMetricTypeSchema,
    metric_value: z.number(),
    threshold_max: z
      .number()
      .optional()
      .describe(
        'x-ui-surface=section:Consensus > Row — upper bound above which consensus is flagged weak (metric-type specific).',
      ),
    passes_threshold: z.boolean().describe(
      'x-ui-surface=section:Consensus > Row — true when metric_value ≤ threshold_max.',
    ),
    math_derivation: mathDerivationSchema.describe(
      'x-ui-surface=section:Consensus > Row > Math — formula used to compute the metric (e.g., variance = Σ(w_i - w̄)² / N).',
    ),
  })
  .describe(
    'x-ui-surface=section:Consensus > Row — per-criterion consensus measure.',
  );

export const phase11Schema = module4PhaseEnvelopeSchema.extend({
  reviewer_count: z
    .number()
    .int()
    .min(2)
    .describe(
      'x-ui-surface=section:Consensus > Header — number of reviewers who submitted weight assignments (≥2 required for consensus to be meaningful).',
    ),
  per_criterion_consensus: z
    .array(perCriterionConsensusSchema)
    .min(6)
    .max(10)
    .describe(
      'x-ui-surface=page:/projects/[id]/system-design/decision-matrix/consensus — consensus measures per PC.',
    ),
  global_method: consensusMetricTypeSchema.describe(
    'x-ui-surface=section:Consensus > Header — metric type applied across all criteria.',
  ),
  weak_consensus_criterion_ids: z
    .array(z.string().regex(/^PC-[0-9]{2}$/))
    .default([])
    .describe(
      'x-ui-surface=section:Consensus > Summary — IDs of PCs that failed consensus threshold (empty = all pass).',
    ),
});
export type Phase11Artifact = z.infer<typeof phase11Schema>;
