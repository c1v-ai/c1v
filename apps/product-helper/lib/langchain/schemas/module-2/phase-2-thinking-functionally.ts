/**
 * Phase 2 — Thinking Functionally (envelope-only ack per C2)
 *
 * Phase 2 emits no payload beyond acknowledging that the intake agent has
 * moved from "prioritize use cases" (Phase 1) into "decompose functionally".
 * The artifact is a lightweight ack so downstream phases can key on it in
 * `_phase_status` without needing a full JSON body.
 *
 * Includes two optional extensions documented in plan §6.0:
 *   - `decomposition_depth` — cognitive-load heuristic output
 *   - `carried_constants[]` — any constants from Phase 0 that persist
 *
 * @module lib/langchain/schemas/module-2/phase-2-thinking-functionally
 */

import { z } from 'zod';
import { phaseEnvelopeSchema } from './_shared';

export const decompositionDepthSchema = z
  .object({
    max: z
      .number()
      .int()
      .min(1)
      .max(5)
      .describe(
        'x-ui-surface=section:Methodology Lineage — max decomposition depth sanctioned by the cognitive-load heuristic (1-5 levels).',
      ),
    rationale: z
      .string()
      .describe(
        'x-ui-surface=section:Methodology Lineage — why this depth was chosen.',
      ),
  })
  .describe(
    'x-ui-surface=section:Methodology Lineage — depth cap output by Phase 2 heuristic.',
  );

export const phase2Schema = phaseEnvelopeSchema.extend({
  decomposition_depth: decompositionDepthSchema
    .optional()
    .describe(
      'x-ui-surface=section:Methodology Lineage — optional depth cap carried forward to Phase 3 UCBD setup.',
    ),
  carried_constants: z
    .array(z.string())
    .default([])
    .describe(
      'x-ui-surface=internal:phase-3-ucbd-setup — constant names from Phase 0 scope that must re-surface downstream.',
    ),
});
export type Phase2Artifact = z.infer<typeof phase2Schema>;
