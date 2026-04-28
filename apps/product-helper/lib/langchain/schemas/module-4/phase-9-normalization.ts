/**
 * Phase 9 — Normalizing Criteria Scores
 *
 * Declares the normalization method applied to each PC's raw score before
 * weighting. `math_derivation.formula` carries the actual formula
 * (min-max, z-score, rank, percentile). Direction-aware: less_is_better
 * criteria flip the sign so higher normalized value always = better.
 *
 * @module lib/langchain/schemas/module-4/phase-9-normalization
 */

import { z } from 'zod';
import { module4PhaseEnvelopeSchema } from './_shared';
import { mathDerivationSchema } from '../module-2/_shared';

export const normalizationMethodSchema = z.enum([
  'min_max',
  'z_score',
  'rank',
  'percentile',
  'target_hit',
  'custom',
]);
export type NormalizationMethod = z.infer<typeof normalizationMethodSchema>;

export const normalizationEntrySchema = z
  .object({
    criterion_id: z
      .string()
      .regex(/^PC-[0-9]{2}$/),
    method: normalizationMethodSchema.describe(
      'x-ui-surface=section:Normalization > Row — normalization method for this PC.',
    ),
    math_derivation: mathDerivationSchema.describe(
      'x-ui-surface=section:Normalization > Row > Math — formula + inputs (e.g., min_max: (x - min) / (max - min)). REQUIRED so normalization isn\'t opaque.',
    ),
    output_range: z
      .tuple([z.number(), z.number()])
      .default([0, 1])
      .describe(
        'x-ui-surface=section:Normalization > Row — normalized output range (default [0,1]).',
      ),
    direction_flip_applied: z
      .boolean()
      .describe(
        'x-ui-surface=section:Normalization > Row — true when PC direction = less_is_better (sign flipped so higher = better).',
      ),
  })
  .describe(
    'x-ui-surface=section:Normalization > Row — per-PC normalization config with formula.',
  );
export type NormalizationEntry = z.infer<typeof normalizationEntrySchema>;

export const phase9Schema = module4PhaseEnvelopeSchema.extend({
  entries: z
    .array(normalizationEntrySchema)
    .min(6)
    .max(10)
    .describe(
      'x-ui-surface=page:/projects/[id]/system-design/decision-matrix/normalization — per-PC normalization entries (matches Phase 3 criteria count).',
    ),
  global_method_default: normalizationMethodSchema.default('min_max').describe(
    'x-ui-surface=section:Normalization > Default — method applied when a PC entry omits a method override (default: min_max).',
  ),
});
export type Phase9Artifact = z.infer<typeof phase9Schema>;
