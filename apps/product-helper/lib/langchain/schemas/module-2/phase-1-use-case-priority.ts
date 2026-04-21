/**
 * Phase 1 — Use-Case Priority (MoSCoW)
 *
 * Prioritizes the UC set. Each row carries a MoSCoW label plus a numeric
 * `priority_score` with a required `math_derivation` (flag B gating — the
 * score is by definition numeric-reliability-class).
 *
 * @module lib/langchain/schemas/module-2/phase-1-use-case-priority
 */

import { z } from 'zod';
import { phaseEnvelopeSchema, mathDerivationSchema } from './_shared';
import { ucIdSchema, ucPrioritySchema } from './phase-3-ucbd-setup';

export const ucPriorityRowSchema = z
  .object({
    uc_id: ucIdSchema,
    uc_name: z
      .string()
      .describe(
        'x-ui-surface=section:UC Overview > Header — UC title, carried from Module 1.',
      ),
    priority: ucPrioritySchema.describe(
      'x-ui-surface=section:UC Overview > Header — MoSCoW label.',
    ),
    priority_score: z
      .number()
      .min(0)
      .describe(
        'x-ui-surface=section:UC Overview > Header — numeric ranking within priority band (higher = first).',
      ),
    priority_math: mathDerivationSchema.describe(
      'x-ui-surface=section:Requirement Detail > Design Rationale — derivation (e.g., impact × feasibility) per plan §6.0.',
    ),
  })
  .describe(
    'x-ui-surface=section:UC Overview > Header — one prioritized UC row.',
  );

export const phase1Schema = phaseEnvelopeSchema.extend({
  rows: z
    .array(ucPriorityRowSchema)
    .describe(
      'x-ui-surface=page:/projects/[id]/requirements/use-cases — prioritized UC set.',
    ),
});
export type Phase1Artifact = z.infer<typeof phase1Schema>;
