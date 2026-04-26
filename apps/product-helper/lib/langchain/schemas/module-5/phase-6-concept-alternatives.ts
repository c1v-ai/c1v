/**
 * Module 5 Phase 6 — Concept Alternatives.
 *
 * For each function decomposition, ≥2 alternative forms are enumerated
 * with dominance rationale. This preserves Crawley's "tournament of
 * concepts" — no winner is declared here (T4b decision_network owns
 * winner-selection).
 *
 * @module lib/langchain/schemas/module-5/phase-6-concept-alternatives
 */

import { z } from 'zod';
import { formIdRegex, functionIdRegex } from './_shared';

export const alternativeSchema = z
  .object({
    form_id: z.string().regex(formIdRegex),
    dominance_rationale: z
      .string()
      .min(10)
      .describe('Why this form is a contender (≥10 chars).'),
  })
  .describe('One alternative form with dominance rationale.');
export type Alternative = z.infer<typeof alternativeSchema>;

export const decompositionSchema = z
  .object({
    function_id: z.string().regex(functionIdRegex),
    alternatives: z.array(alternativeSchema).min(2),
  })
  .describe('Decomposition of one function into ≥2 alternative forms.');
export type Decomposition = z.infer<typeof decompositionSchema>;

export const phase6ConceptAlternativesSchema = z
  .object({
    phase: z.literal(6),
    decompositions: z.array(decompositionSchema).min(1),
  })
  .describe('Phase 6 — concept alternatives (≥2 per decomposition).');
export type Phase6ConceptAlternatives = z.infer<typeof phase6ConceptAlternativesSchema>;
