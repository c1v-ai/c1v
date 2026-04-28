/**
 * Phase 6 — Defining Appropriate Ranges for Conditions
 *
 * Per-criterion range specification: min, max, step_size. When the range
 * boundary is derived from an upstream M2 Phase 8 constant (e.g.,
 * AVAILABILITY_TARGET), `math_derivation` carries the linkage. Ranges feed
 * M4 Phase 9 normalization (min-max) and M4 Phase 5 anchor spacing.
 *
 * @module lib/langchain/schemas/module-4/phase-6-ranges
 */

import { z } from 'zod';
import { module4PhaseEnvelopeSchema } from './_shared';
import { mathDerivationSchema } from '../module-2/_shared';

export const rangeEntrySchema = z
  .object({
    criterion_id: z
      .string()
      .regex(/^PC-[0-9]{2}$/)
      .describe(
        'x-ui-surface=section:Ranges > Row — PC this range binds to.',
      ),
    min: z
      .number()
      .describe(
        'x-ui-surface=section:Ranges > Row — minimum acceptable value (direction-aware).',
      ),
    max: z
      .number()
      .describe(
        'x-ui-surface=section:Ranges > Row — maximum meaningful value (direction-aware).',
      ),
    step_size: z
      .number()
      .positive()
      .optional()
      .describe(
        'x-ui-surface=section:Ranges > Row — discretization step for scaled measures (anchor spacing).',
      ),
    unit: z
      .string()
      .describe(
        'x-ui-surface=section:Ranges > Row — unit (must match Phase 3 criterion unit).',
      ),
    math_derivation: mathDerivationSchema
      .optional()
      .describe(
        'x-ui-surface=section:Ranges > Row > Math — optional; required when min/max derives from an upstream M2 Phase 8 constant.',
      ),
    derived_from_constant: z
      .string()
      .regex(/^[A-Z][A-Z0-9_]*$/)
      .optional()
      .describe(
        'x-ui-surface=section:Ranges > Row > Provenance — SCREAMING_SNAKE constant name from M2 Phase 8 (if range is constant-bound).',
      ),
  })
  .refine((r) => r.min <= r.max, {
    message: 'min must be ≤ max (direction-aware comparison).',
    path: ['min'],
  })
  .describe(
    'x-ui-surface=section:Ranges > Row — one range spec for a PC.',
  );
export type RangeEntry = z.infer<typeof rangeEntrySchema>;

export const phase6Schema = module4PhaseEnvelopeSchema.extend({
  ranges: z
    .array(rangeEntrySchema)
    .min(6)
    .max(10)
    .describe(
      'x-ui-surface=page:/projects/[id]/system-design/decision-matrix/ranges — range specs (6-10 matching Phase 3 criteria count).',
    ),
});
export type Phase6Artifact = z.infer<typeof phase6Schema>;
