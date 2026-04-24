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
  mathDerivationSchema,
} from '../module-2/_shared';

/**
 * M4 decision-net rework (T4b, Wave 3) — `mathDerivationV2`.
 *
 * The legacy `mathDerivationSchema` returns a scalar `result` (number or
 * string). The decision-net rework needs to carry vector-valued utility
 * scores and graph-valued Pareto frontiers. `mathDerivationV2` adds
 * `result_shape: 'scalar' | 'vector' | 'graph'` and a tagged-union `result`
 * so downstream validators can route per-shape.
 *
 * Backwards compatible: existing `mathDerivationSchema` callers unaffected.
 * New decision-net schemas (phase-14..19, phases-11-13-vector-scores) use V2.
 */
export const mathDerivationV2Schema = mathDerivationSchema.extend({
    result_shape: z
      .enum(['scalar', 'vector', 'graph'])
      .default('scalar')
      .describe(
        'x-ui-surface=internal:decision-net — result shape discriminator. scalar=legacy, vector=utility scores, graph=Pareto frontier edges.',
      ),
    result_vector: z
      .array(z.number())
      .optional()
      .describe(
        'x-ui-surface=internal:decision-net — populated when result_shape=vector.',
      ),
    result_graph: z
      .object({
        nodes: z.array(z.string()),
        edges: z.array(
          z.object({
            from: z.string(),
            to: z.string(),
            kind: z.enum(['dominates', 'depends_on', 'inferred']),
          }),
        ),
      })
      .optional()
      .describe(
        'x-ui-surface=internal:decision-net — populated when result_shape=graph (Pareto dominance edges).',
      ),
  })
  .describe(
    'x-ui-surface=section:Decision Node > Math — math derivation V2 (scalar/vector/graph result shapes for decision-net rework).',
  );
export type MathDerivationV2 = z.infer<typeof mathDerivationV2Schema>;

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
