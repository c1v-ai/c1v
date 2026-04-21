/**
 * Phase 0 — Ingest Module-1 Scope
 *
 * First phase of Module 2 — consumes Module 1's scope output and emits an
 * `intake_summary` plus the `carried_constants[]` set that downstream
 * phases (2/3/4/5/8) import. Envelope-only except for the two payload
 * fields.
 *
 * @module lib/langchain/schemas/module-2/phase-0-ingest
 */

import { z } from 'zod';
import { phaseEnvelopeSchema } from './_shared';

export const phase0Schema = phaseEnvelopeSchema.extend({
  intake_summary: z
    .string()
    .describe(
      'x-ui-surface=section:Methodology Lineage — prose summary of the ingested Module 1 scope.',
    ),
  carried_constants: z
    .array(
      z.object({
        name: z
          .string()
          .regex(/^[A-Z][A-Z0-9_]*$/)
          .describe(
            'x-ui-surface=section:Methodology Lineage — SCREAMING_SNAKE constant name (e.g., COMPLIANCE_REGIME).',
          ),
        value: z
          .union([z.number(), z.string()])
          .describe(
            'x-ui-surface=section:Methodology Lineage — initial value carried from Module 1 scope.',
          ),
        unit: z
          .string()
          .optional()
          .describe('x-ui-surface=section:Methodology Lineage — unit, if numeric.'),
      }),
    )
    .default([])
    .describe(
      'x-ui-surface=internal:phase-2-thinking-functionally — constants piped forward from Module 1.',
    ),
});
export type Phase0Artifact = z.infer<typeof phase0Schema>;
