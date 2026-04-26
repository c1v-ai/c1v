/**
 * Module 5 Phase 3 — Concept Mapping Matrix.
 *
 * The bipartite form↔function mapping φ. Each cell is a pair (F.NN, FR.NN)
 * with no quality score yet (scores land in Phase 4). Phase 3 only
 * establishes the topology; Phase 7 handoff refines surjectivity.
 *
 * @module lib/langchain/schemas/module-5-form-function/phase-3-concept-mapping-matrix
 */

import { z } from 'zod';
import { formIdRegex, functionIdRegex } from './_shared';

export const conceptCellSchema = z
  .object({
    function_id: z.string().regex(functionIdRegex),
    form_id: z.string().regex(formIdRegex),
    relation: z
      .enum(['primary', 'secondary', 'fallback'])
      .describe('primary=single fulfilling form, secondary=assisting, fallback=redundancy.'),
  })
  .describe('One bipartite-graph edge in the φ mapping.');
export type ConceptCell = z.infer<typeof conceptCellSchema>;

export const phase3ConceptMappingMatrixSchema = z
  .object({
    phase: z.literal(3),
    cells: z.array(conceptCellSchema).min(1),
  })
  .describe('Phase 3 — concept mapping matrix (topology only).');
export type Phase3ConceptMappingMatrix = z.infer<typeof phase3ConceptMappingMatrixSchema>;
