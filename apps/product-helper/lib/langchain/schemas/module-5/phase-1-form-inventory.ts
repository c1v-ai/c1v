/**
 * Module 5 Phase 1 — Form Inventory.
 *
 * Enumerates candidate FORMS (physical/logical components that realize
 * functions). Surjectivity over the function inventory is enforced at the
 * top-level `form_function_map.v1` refine (phase 7 handoff), not here —
 * this phase is the raw catalog.
 *
 * FMEA soft-signal: failure modes whose `candidate_mitigation` text
 * contains "multi-provider" / "fallback" / "redundant" imply that the
 * affected function needs redundant forms. Phase 1 surfaces this via the
 * optional `redundancy_source_fm` back-link on each form.
 *
 * @module lib/langchain/schemas/module-5/phase-1-form-inventory
 */

import { z } from 'zod';
import { fmeaIdRegex, formIdRegex } from './_shared';

export const formElementSchema = z
  .object({
    id: z.string().regex(formIdRegex).describe('FR.NN — stable form id.'),
    name: z.string(),
    kind: z.enum(['service', 'library', 'adapter', 'store', 'ui', 'job', 'external']),
    description: z.string(),
    realizes_functions: z
      .array(z.string())
      .min(1)
      .describe('F.NN ids this form realizes (validated referentially at top-level).'),
    redundancy_source_fm: z
      .string()
      .regex(fmeaIdRegex)
      .optional()
      .describe('FMEA id that requires this form as redundancy; absent on primary forms.'),
    notes: z.string().optional(),
  })
  .describe('A single candidate form element.');
export type FormElement = z.infer<typeof formElementSchema>;

export const phase1FormInventorySchema = z
  .object({
    phase: z.literal(1),
    forms: z.array(formElementSchema).min(1),
  })
  .describe('Phase 1 — form inventory (raw catalog).');
export type Phase1FormInventory = z.infer<typeof phase1FormInventorySchema>;
