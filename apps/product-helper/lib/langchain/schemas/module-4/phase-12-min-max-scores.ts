/**
 * Phase 12 — Establishing Min and Max Criteria Scores
 *
 * Computes the theoretical floor and ceiling of the weighted sum:
 *   min_possible_total = Σ(weight_i × normalized_min_i)
 *   max_possible_total = Σ(weight_i × normalized_max_i)
 *
 * These bounds calibrate M4 Phase 13 interpretation thresholds — the
 * "recommend" threshold must sit meaningfully between min and max.
 *
 * @module lib/langchain/schemas/module-4/phase-12-min-max-scores
 */

import { z } from 'zod';
import { module4PhaseEnvelopeSchema } from './_shared';
import { mathDerivationSchema } from '../module-2/_shared';

export const boundEntrySchema = z
  .object({
    bound_type: z.enum(['min_possible_total', 'max_possible_total']),
    value: z.number(),
    math_derivation: mathDerivationSchema.describe(
      'x-ui-surface=section:Bounds > Row > Math — formula: Σ(weight_i × normalized_{min|max}_i).',
    ),
  })
  .describe(
    'x-ui-surface=section:Bounds > Row — one of the two theoretical bounds.',
  );

export const phase12Schema = module4PhaseEnvelopeSchema
  .extend({
    bounds: z
      .array(boundEntrySchema)
      .length(2)
      .describe(
        'x-ui-surface=page:/projects/[id]/system-design/decision-matrix/bounds — exactly 2 entries: min_possible_total and max_possible_total.',
      ),
    achievable_range: z
      .number()
      .describe(
        'x-ui-surface=section:Bounds > Summary — max_possible_total − min_possible_total (meaningful when selecting thresholds).',
      ),
  })
  .refine(
    (p) => {
      const min = p.bounds.find((b) => b.bound_type === 'min_possible_total');
      const max = p.bounds.find((b) => b.bound_type === 'max_possible_total');
      return min !== undefined && max !== undefined && min.value < max.value;
    },
    {
      message:
        'bounds must contain exactly one min_possible_total and one max_possible_total, with min < max.',
      path: ['bounds'],
    },
  );
export type Phase12Artifact = z.infer<typeof phase12Schema>;
