/**
 * Module 4 — Shared envelope (M4-specific; reuses M2 primitives)
 *
 * M4 has 19 methodology phases (0-18) vs M2's 13 (0-12). The shared
 * `metadataHeaderSchema.phase_number` in `module-2/_shared.ts` caps at 12,
 * which blocks M4 Phase 18 validation. This file extends the envelope
 * metadata to accept 0-18 without duplicating any other primitive.
 *
 * Every M4 phase schema extends `module4PhaseEnvelopeSchema` (not M2's
 * envelope directly). All other primitives — `mathDerivationSchema`,
 * `softwareArchDecisionSchema`, `softwareArchRefSchema`, `sourceRefSchema`,
 * `sourceLensSchema`, `columnPlanSchema`, `insertionSchema`,
 * `phaseStatusSchema` — are imported from `module-2/_shared` unchanged.
 *
 * @module lib/langchain/schemas/module-4/_shared
 */

import { z } from 'zod';
import {
  phaseEnvelopeSchema,
  metadataHeaderSchema,
} from '../module-2/_shared';

/**
 * M4 metadata — same as M2's except `phase_number` is widened to 0-18 to
 * cover F13/4's Phases 0 through 18. All other fields unchanged.
 */
export const module4MetadataHeaderSchema = metadataHeaderSchema.extend({
  phase_number: z
    .number()
    .int()
    .min(0)
    .max(18)
    .describe(
      'x-ui-surface=page-header — methodology phase number (0-18) per F13/4 Decision Matrix module.',
    ),
});
export type Module4MetadataHeader = z.infer<typeof module4MetadataHeaderSchema>;

/**
 * M4 phase envelope — inherits M2's envelope but swaps metadata for the
 * module-4 variant with widened phase_number. Every M4 phase schema
 * extends this via `.extend({...})`.
 */
export const module4PhaseEnvelopeSchema = phaseEnvelopeSchema.extend({
  metadata: module4MetadataHeaderSchema.describe(
    'x-ui-surface=page-header — dual-surface header (M4-widened phase_number range 0-18).',
  ),
});
export type Module4PhaseEnvelope = z.infer<typeof module4PhaseEnvelopeSchema>;
