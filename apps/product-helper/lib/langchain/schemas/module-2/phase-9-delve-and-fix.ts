/**
 * Phase 9 — Delve and Fix (C4 consumer)
 *
 * Sweeps the requirements set for coverage gaps: each row carries an
 * optional `fix_applied` note; the envelope tracks aggregate
 * `coverage_score` and an explicit `uncovered_ucs[]` list for whatever
 * UCBDs the audit couldn't reach.
 *
 * `coverage_score` is derived math: `covered_uc / total_uc` per plan §6.0.
 * We carry a `coverage_math` derivation alongside the number so the
 * grounding contract holds at the envelope level too.
 *
 * @module lib/langchain/schemas/module-2/phase-9-delve-and-fix
 */

import { z } from 'zod';
import { phaseEnvelopeSchema, mathDerivationSchema } from './_shared';
import {
  requirementRowBaseObject,
  applyNumericMathGate,
  requirementIdSchema,
} from './requirements-table-base';

export const phase9RowSchema = applyNumericMathGate(
  requirementRowBaseObject.extend({
    fix_applied: z
      .string()
      .optional()
      .describe(
        'x-ui-surface=section:Requirement Detail > Delve — what (if anything) was rewritten in this pass.',
      ),
    delve_notes: z
      .array(z.string())
      .default([])
      .describe(
        'x-ui-surface=section:Requirement Detail > Delve — reviewer-facing annotations on the fix.',
      ),
  }),
);
export type Phase9Row = z.infer<typeof phase9RowSchema>;

export const phase9Schema = phaseEnvelopeSchema.extend({
  rows: z
    .array(phase9RowSchema)
    .describe(
      'x-ui-surface=page:/projects/[id]/requirements — requirements after delve-and-fix pass.',
    ),
  coverage_score: z
    .number()
    .min(0)
    .max(1)
    .describe(
      'x-ui-surface=section:Audit > Coverage — covered_uc / total_uc ratio (0-1).',
    ),
  coverage_math: mathDerivationSchema.describe(
    'x-ui-surface=section:Audit > Coverage — derivation for coverage_score (plan §6.0).',
  ),
  uncovered_ucs: z
    .array(requirementIdSchema.or(z.string()))
    .default([])
    .describe(
      'x-ui-surface=section:Audit > Coverage — UC ids whose requirements remain uncovered after this pass.',
    ),
});
export type Phase9Artifact = z.infer<typeof phase9Schema>;
