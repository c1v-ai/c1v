/**
 * Phase 4 — Avoiding Performance Criteria Pitfalls
 *
 * Methodology-level validation guards applied to M4 Phase 3's `criteria[]`.
 * Catches common PC errors: solution-baked criteria, duplicate coverage,
 * unmeasurable targets, missing direction, weight-biased naming. Each
 * pitfall flag points at the `criterion_id` and suggests a resolution
 * action.
 *
 * @module lib/langchain/schemas/module-4/phase-4-pc-pitfalls
 */

import { z } from 'zod';
import { module4PhaseEnvelopeSchema } from './_shared';

export const pitfallTypeSchema = z.enum([
  'solution_baked_in',
  'duplicate_coverage',
  'unmeasurable',
  'missing_direction',
  'weight_biased_naming',
  'non_traceable_to_function',
  'non_comparable_units',
  'too_narrow',
  'too_broad',
  'missing_min_acceptable',
]);
export type PitfallType = z.infer<typeof pitfallTypeSchema>;

export const pitfallSeveritySchema = z.enum(['info', 'warning', 'blocker']);

export const pitfallCheckSchema = z
  .object({
    criterion_id: z
      .string()
      .regex(/^PC-[0-9]{2}$/)
      .describe(
        'x-ui-surface=section:PC Pitfalls > Row — PC this flag applies to.',
      ),
    pitfall_type: pitfallTypeSchema.describe(
      'x-ui-surface=section:PC Pitfalls > Row — which pitfall triggered the flag.',
    ),
    severity: pitfallSeveritySchema.describe(
      'x-ui-surface=section:PC Pitfalls > Row — blocker stops Gate B; warning surfaces in review; info is advisory.',
    ),
    evidence: z
      .string()
      .describe(
        'x-ui-surface=section:PC Pitfalls > Row — specific text or condition that triggered the flag.',
      ),
    suggested_resolution: z
      .string()
      .describe(
        'x-ui-surface=section:PC Pitfalls > Row — suggested edit to the PC (return to Phase 3 with this text).',
      ),
  })
  .describe(
    'x-ui-surface=section:PC Pitfalls > Row — one pitfall flag against a Phase 3 criterion.',
  );
export type PitfallCheck = z.infer<typeof pitfallCheckSchema>;

export const phase4Schema = module4PhaseEnvelopeSchema.extend({
  pitfall_checks: z
    .array(pitfallCheckSchema)
    .describe(
      'x-ui-surface=page:/projects/[id]/system-design/decision-matrix/pitfalls — all pitfall flags raised against Phase 3 criteria (empty array = clean).',
    ),
  blocker_count: z
    .number()
    .int()
    .nonnegative()
    .describe(
      'x-ui-surface=section:PC Pitfalls > Summary — count of blocker-severity flags (must be 0 to pass Gate B).',
    ),
});
export type Phase4Artifact = z.infer<typeof phase4Schema>;
