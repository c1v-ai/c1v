/**
 * Phase 13 — Appropriately Interpreting Matrix Scores
 *
 * Final weighted-sum scoring per option plus interpretation thresholds:
 *   recommend  — selected option's weighted_total ≥ recommend_threshold
 *   conditional — weighted_total ∈ [conditional_threshold, recommend_threshold)
 *   reject     — weighted_total < conditional_threshold
 *
 * Every threshold carries `math_derivation` so the "why" of the cutoff
 * traces back to M4 Phase 12 bounds and project-specific risk tolerance.
 *
 * @module lib/langchain/schemas/module-4/phase-13-score-interpretation
 */

import { z } from 'zod';
import { module4PhaseEnvelopeSchema } from './_shared';
import { mathDerivationSchema } from '../module-2/_shared';

export const optionWeightedScoreSchema = z
  .object({
    option_id: z
      .string()
      .regex(/^[A-Z]$/),
    weighted_total: z.number(),
    rank: z
      .number()
      .int()
      .positive()
      .describe(
        'x-ui-surface=section:Score Interpretation > Row — 1-based rank across options (1 = highest weighted_total).',
      ),
    interpretation: z.enum(['recommend', 'conditional', 'reject']).describe(
      'x-ui-surface=section:Score Interpretation > Row — threshold bucket this option falls into.',
    ),
    math_derivation: mathDerivationSchema.describe(
      'x-ui-surface=section:Score Interpretation > Row > Math — weighted_total = Σ(weight_i × normalized_score_i) expansion for this option.',
    ),
  })
  .describe(
    'x-ui-surface=section:Score Interpretation > Row — one option\'s final score with interpretation.',
  );
export type OptionWeightedScore = z.infer<typeof optionWeightedScoreSchema>;

export const interpretationThresholdSchema = z
  .object({
    threshold_name: z.enum(['recommend', 'conditional']),
    value: z.number().describe(
      'x-ui-surface=section:Score Interpretation > Thresholds — threshold value on the same scale as weighted_total.',
    ),
    math_derivation: mathDerivationSchema.describe(
      'x-ui-surface=section:Score Interpretation > Thresholds > Math — derivation citing Phase 12 bounds + project risk tolerance (e.g., recommend = min + 0.75 × achievable_range).',
    ),
  })
  .describe(
    'x-ui-surface=section:Score Interpretation > Thresholds — one threshold cut-point.',
  );
export type InterpretationThreshold = z.infer<typeof interpretationThresholdSchema>;

export const phase13Schema = module4PhaseEnvelopeSchema
  .extend({
    option_scores: z
      .array(optionWeightedScoreSchema)
      .min(2)
      .describe(
        'x-ui-surface=page:/projects/[id]/system-design/decision-matrix/interpretation — per-option weighted totals + interpretation (≥2 matching alternatives count).',
      ),
    thresholds: z
      .array(interpretationThresholdSchema)
      .length(2)
      .describe(
        'x-ui-surface=section:Score Interpretation > Thresholds — exactly 2 thresholds (recommend, conditional) with math.',
      ),
    sensitivity_note: z
      .string()
      .describe(
        'x-ui-surface=section:Score Interpretation > Sensitivity — one paragraph on what would flip the ranking (e.g., "changing availability weight from 0.25 to 0.30 would promote option B").',
      ),
  })
  .refine(
    (p) => {
      const recommend = p.thresholds.find((t) => t.threshold_name === 'recommend');
      const conditional = p.thresholds.find(
        (t) => t.threshold_name === 'conditional',
      );
      return (
        recommend !== undefined &&
        conditional !== undefined &&
        recommend.value > conditional.value
      );
    },
    {
      message:
        'thresholds must contain recommend and conditional, with recommend > conditional.',
      path: ['thresholds'],
    },
  );
export type Phase13Artifact = z.infer<typeof phase13Schema>;
