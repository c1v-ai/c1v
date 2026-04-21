/**
 * Phase 11 — Multi-UC Expansion (C4 consumer)
 *
 * Reconciles requirements when the same clause appears across multiple
 * UCs. Each row gains a `merged_from[]` trace showing which source UC
 * rows it collapses. The envelope carries a `uc_overlap_matrix` whose
 * cells are Jaccard similarities (per plan §6.0) plus the derivation.
 *
 * @module lib/langchain/schemas/module-2/phase-11-multi-uc-expansion
 */

import { z } from 'zod';
import { phaseEnvelopeSchema, mathDerivationSchema } from './_shared';
import {
  requirementRowBaseObject,
  applyNumericMathGate,
  requirementIdSchema,
} from './requirements-table-base';

export const phase11RowSchema = applyNumericMathGate(
  requirementRowBaseObject.extend({
    merged_from: z
      .array(requirementIdSchema)
      .default([])
      .describe(
        'x-ui-surface=section:Requirement Detail > Provenance — source requirement ids collapsed into this row.',
      ),
    dedup_rationale: z
      .string()
      .optional()
      .describe(
        'x-ui-surface=section:Requirement Detail > Provenance — why these rows were collapsed (semantic equivalence, same threshold, etc.).',
      ),
  }),
);
export type Phase11Row = z.infer<typeof phase11RowSchema>;

export const ucOverlapCellSchema = z
  .object({
    uc_a: z
      .string()
      .describe(
        'x-ui-surface=section:Audit > Overlap — first UC id (e.g., "UC01").',
      ),
    uc_b: z
      .string()
      .describe(
        'x-ui-surface=section:Audit > Overlap — second UC id (e.g., "UC02").',
      ),
    jaccard: z
      .number()
      .min(0)
      .max(1)
      .describe(
        'x-ui-surface=section:Audit > Overlap — Jaccard similarity |A∩B|/|A∪B| of requirement sets (0-1).',
      ),
  })
  .describe(
    'x-ui-surface=section:Audit > Overlap — one UC-pair similarity cell.',
  );

export const phase11Schema = phaseEnvelopeSchema.extend({
  rows: z
    .array(phase11RowSchema)
    .describe(
      'x-ui-surface=page:/projects/[id]/requirements — deduplicated requirements after multi-UC expansion.',
    ),
  uc_overlap_matrix: z
    .array(ucOverlapCellSchema)
    .default([])
    .describe(
      'x-ui-surface=section:Audit > Overlap — pairwise Jaccard similarity across UCs.',
    ),
  overlap_math: mathDerivationSchema.describe(
    'x-ui-surface=section:Audit > Overlap — derivation of the Jaccard formula and input set definitions (plan §6.0).',
  ),
});
export type Phase11Artifact = z.infer<typeof phase11Schema>;
