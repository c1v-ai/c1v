/**
 * Module 5 Phase 4 — Concept Quality Scoring.
 *
 * Attaches `Q(f, g) = s · (1 - k)` to every phase-3 cell. The
 * `conceptQualitySchema` refine enforces:
 *   - `Q === specificity * (1 - coupling)` (numeric exactness to 1e-6)
 *   - citations[] includes Stevens1974 AND Bass2021
 *   - engine is NFREngineInterpreter (kb-runtime G1)
 *
 * Crawley is NEVER a valid source on this path — enforced by the
 * `source` enum in _shared.mathCitationSchema. Attribution grep test
 * in verify-t5 also scans for "Crawley" on this file to double-gate.
 *
 * @module lib/langchain/schemas/module-5/phase-4-concept-quality-scoring
 */

import { z } from 'zod';
import { conceptQualitySchema, formIdRegex, functionIdRegex } from './_shared';

export const scoredCellSchema = z
  .object({
    function_id: z.string().regex(functionIdRegex),
    form_id: z.string().regex(formIdRegex),
    concept_quality: conceptQualitySchema,
  })
  .describe('Phase-3 cell enriched with concept_quality triplet.');
export type ScoredCell = z.infer<typeof scoredCellSchema>;

export const phase4ConceptQualityScoringSchema = z
  .object({
    phase: z.literal(4),
    scored_cells: z.array(scoredCellSchema).min(1),
  })
  .describe('Phase 4 — concept quality scoring (Stevens/Bass, NOT Crawley).');
export type Phase4ConceptQualityScoring = z.infer<typeof phase4ConceptQualityScoringSchema>;
