/**
 * Module 5 — Form-Function shared primitives.
 *
 * Math attribution policy (CRITICAL): `Q(f, g) = specificity · (1 - coupling)`
 * is cited to Stevens/Myers/Constantine (1974) and Bass/Clements/Kazman (2021).
 * It is NOT cited to Crawley directly — Crawley supplies the form→function
 * mapping framing (specificity of phi), but the product form is the
 * c1v-internal operationalization documented in
 * `plans/research/math-sources.md` §F11.
 *
 * Any schema field that attaches a `source` tag to a Q-scoring path MUST NOT
 * carry `Crawley` as its source (verifier T5 enforces via grep).
 *
 * @module lib/langchain/schemas/module-5/_shared
 */

import { z } from 'zod';

/** F.NN — must resolve in ffbd.v1 functions. */
export const functionIdRegex = /^F\.\d+(\.\d+)*$/;
/** FR.NN — form-element id, module-5 local. */
export const formIdRegex = /^FR\.\d{2,}$/;
/** FM.NN — FMEA-early failure-mode id. */
export const fmeaIdRegex = /^FM\.\d{2,}$/;
/** NFR.NN — requirements table id. */
export const nfrIdRegex = /^NFR\.\d{2,}$/;

/**
 * Citation for `Q(f,g)` math. Restricted to Stevens/Myers/Constantine 1974
 * OR Bass/Clements/Kazman 2021. Crawley MUST NOT appear here.
 */
export const mathCitationSchema = z
  .object({
    source: z.enum(['Stevens1974', 'Bass2021']),
    locator: z
      .string()
      .describe('Chapter/section/page pointer within the cited work.'),
    formula_ref: z
      .string()
      .describe("math-sources.md anchor, e.g. 'F11'."),
  })
  .describe('Citation for an architectural-quality primitive (specificity or coupling).');
export type MathCitation = z.infer<typeof mathCitationSchema>;

/**
 * Concept-quality triplet. `Q` MUST equal `s * (1 - k)` (refine enforces).
 * citations[] MUST contain at least one Stevens1974 AND one Bass2021 entry.
 */
export const conceptQualitySchema = z
  .object({
    specificity: z
      .number()
      .min(0)
      .max(1)
      .describe('s ∈ [0,1] — how tightly this form realizes this function.'),
    coupling: z
      .number()
      .min(0)
      .max(1)
      .describe('k ∈ [0,1] — how much this form drags other forms with it.'),
    Q: z.number().min(0).max(1).describe('Q = s · (1 - k).'),
    math_derivation_v2: z.object({
      formula: z.literal('Q = specificity * (1 - coupling)'),
      citations: z
        .array(mathCitationSchema)
        .min(2)
        .describe('≥1 Stevens1974 + ≥1 Bass2021; NOT Crawley.'),
      engine: z
        .literal('NFREngineInterpreter')
        .describe('Math routes through kb-runtime G1 NFREngineInterpreter.'),
    }),
  })
  .superRefine((val, ctx) => {
    const expected = val.specificity * (1 - val.coupling);
    if (Math.abs(val.Q - expected) > 1e-6) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Q(${val.Q}) != specificity(${val.specificity}) * (1 - coupling(${val.coupling})) = ${expected}`,
        path: ['Q'],
      });
    }
    const sources = val.math_derivation_v2.citations.map((c) => c.source);
    if (!sources.includes('Stevens1974')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Q citations must include Stevens1974',
        path: ['math_derivation_v2', 'citations'],
      });
    }
    if (!sources.includes('Bass2021')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Q citations must include Bass2021',
        path: ['math_derivation_v2', 'citations'],
      });
    }
  });
export type ConceptQuality = z.infer<typeof conceptQualitySchema>;

/** Decision-audit row — emitted into `decision_audit[]` on form_function_map. */
export const decisionAuditRowSchema = z
  .object({
    decision_id: z.string().describe('Stable id local to this artifact.'),
    phase: z.number().int().min(1).max(7),
    subject: z.string().describe('What the decision is about (e.g., "FR.03 adoption for F.2").'),
    rationale: z.string(),
    kb_chunk_ids: z
      .array(z.string())
      .default([])
      .describe('kb-runtime chunk ids citing Stevens/Bass; empty allowed for non-math rows.'),
  })
  .describe('Decision-audit row.');
export type DecisionAuditRow = z.infer<typeof decisionAuditRowSchema>;
