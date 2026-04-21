/**
 * Phase 5 — UCBD Step Flow (extends Phase 4 UCBD per C3)
 *
 * Adds the step-by-step actor/system exchange to each UCBD. Each step
 * carries an optional latency budget with a `math_derivation` sourced from
 * `api-design-sys-design-kb.md §P95` per plan §6.0.
 *
 * `step_budget_ms` remains optional at the step level — only interactive
 * UC steps get a budget; background/audit steps don't. This honors the
 * flag-B NUMERIC_ONLY gating: math is required only on numeric fields,
 * and the math here fires only when a budget is asserted.
 *
 * @module lib/langchain/schemas/module-2/phase-5-ucbd-step-flow
 */

import { z } from 'zod';
import { phaseEnvelopeSchema, mathDerivationSchema } from './_shared';
import { ucbdPhase4Schema } from './phase-4-start-end-conditions';

export const stepActorSchema = z.enum(['actor', 'system', 'external']);

export const ucbdStepSchema = z
  .object({
    step_number: z
      .number()
      .int()
      .positive()
      .describe(
        'x-ui-surface=section:UC Overview > Step Flow — 1-indexed step ordinal.',
      ),
    actor: stepActorSchema.describe(
      'x-ui-surface=section:UC Overview > Step Flow — who performs this step.',
    ),
    action: z
      .string()
      .describe(
        'x-ui-surface=section:UC Overview > Step Flow — what the actor does.',
      ),
    system_response: z
      .string()
      .optional()
      .describe(
        'x-ui-surface=section:UC Overview > Step Flow — immediate system reply, if any.',
      ),
    alternate_branch: z
      .string()
      .optional()
      .describe(
        'x-ui-surface=section:UC Overview > Step Flow — branch label (e.g., "error path A").',
      ),
    step_budget_ms: z
      .number()
      .positive()
      .optional()
      .describe(
        'x-ui-surface=section:Requirement Detail > Design Rationale — interactive-UC latency budget for this step.',
      ),
    step_budget_math: mathDerivationSchema
      .optional()
      .describe(
        'x-ui-surface=section:Requirement Detail > Design Rationale — required whenever `step_budget_ms` is set (plan §6.0, flag B NUMERIC_ONLY gating).',
      ),
    notes: z
      .array(z.string())
      .default([])
      .describe(
        'x-ui-surface=section:UC Overview > Step Flow — reviewer-facing annotations.',
      ),
  })
  .refine((s) => !(s.step_budget_ms !== undefined && s.step_budget_math === undefined), {
    message:
      'step_budget_math is required whenever step_budget_ms is set (NUMERIC_ONLY math gating per flag B).',
    path: ['step_budget_math'],
  });
export type UcbdStep = z.infer<typeof ucbdStepSchema>;

export const ucbdPhase5Schema = ucbdPhase4Schema.extend({
  steps: z
    .array(ucbdStepSchema)
    .describe(
      'x-ui-surface=section:UC Overview > Step Flow — ordered step sequence realizing the UC.',
    ),
});
export type UcbdPhase5 = z.infer<typeof ucbdPhase5Schema>;

export const phase5Schema = phaseEnvelopeSchema.extend({
  ucbds: z
    .array(ucbdPhase5Schema)
    .describe(
      'x-ui-surface=page:/projects/[id]/requirements/use-cases — full UCBD set with step flow layered on.',
    ),
});
export type Phase5Artifact = z.infer<typeof phase5Schema>;
