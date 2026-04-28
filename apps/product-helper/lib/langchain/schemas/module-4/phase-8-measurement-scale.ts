/**
 * Phase 8 — Crafting an Effective Measurement Scale
 *
 * Declares the shared measurement scale type used across M4 Phase 5 (direct
 * + scaled) and M4 Phase 7 (subjective). Also declares any custom
 * per-criterion scale overrides (non-standard level count, half-steps).
 *
 * @module lib/langchain/schemas/module-4/phase-8-measurement-scale
 */

import { z } from 'zod';
import { module4PhaseEnvelopeSchema } from './_shared';

export const scaleTypeSchema = z.enum([
  'five_level',
  'three_level',
  'ten_level',
  'binary',
  'custom',
]);
export type ScaleType = z.infer<typeof scaleTypeSchema>;

export const scaleLevelDescriptorSchema = z
  .object({
    level: z.number().describe('x-ui-surface=section:Scale > Levels — level value (1, 2, ..., N).'),
    label: z
      .string()
      .describe(
        'x-ui-surface=section:Scale > Levels — short label (e.g., "Poor", "Excellent").',
      ),
    numeric_anchor_hint: z
      .union([z.number(), z.string()])
      .optional()
      .describe(
        'x-ui-surface=section:Scale > Levels — optional hint anchor; full numeric anchors live in Phase 5.',
      ),
  })
  .describe(
    'x-ui-surface=section:Scale > Levels — one level in the measurement scale.',
  );

export const customScaleOverrideSchema = z
  .object({
    criterion_id: z
      .string()
      .regex(/^PC-[0-9]{2}$/),
    scale_type: scaleTypeSchema,
    levels: z
      .array(scaleLevelDescriptorSchema)
      .min(2)
      .describe(
        'x-ui-surface=section:Scale > Overrides — level descriptors when this criterion deviates from the default scale.',
      ),
    rationale: z
      .string()
      .describe(
        'x-ui-surface=section:Scale > Overrides — why this PC needs a non-default scale.',
      ),
  })
  .describe(
    'x-ui-surface=section:Scale > Overrides — per-criterion scale override.',
  );

export const phase8Schema = module4PhaseEnvelopeSchema.extend({
  default_scale_type: scaleTypeSchema.default('five_level').describe(
    'x-ui-surface=section:Scale > Default — scale applied to all PCs unless overridden (default: five_level).',
  ),
  default_levels: z
    .array(scaleLevelDescriptorSchema)
    .length(5)
    .describe(
      'x-ui-surface=section:Scale > Default — the 5 default labels (e.g., Poor/Fair/Good/Very Good/Excellent).',
    ),
  overrides: z
    .array(customScaleOverrideSchema)
    .default([])
    .describe(
      'x-ui-surface=section:Scale > Overrides — criteria that use a custom scale (empty when all PCs use the default).',
    ),
});
export type Phase8Artifact = z.infer<typeof phase8Schema>;
