/**
 * Requirements Table — shared base (C4)
 *
 * One `requirementsTableSchema` re-used by Phase 6/7/8/9/11. Each phase
 * imports the base row shape and layers phase-specific fields via
 * `.extend()` or composition. The phase envelope's `_phase_status` doubles
 * as the discriminator when downstream consumers need to branch on which
 * phase emitted the table.
 *
 * NUMERIC_ONLY math gating (flag B): `math_derivation` is required when
 * `requirement_class ∈ {performance, reliability, scalability, capacity}`
 * and optional otherwise. Enforced with a `.refine()` guard so the LLM
 * can't skip the math on numeric requirements.
 *
 * @module lib/langchain/schemas/module-2/requirements-table-base
 */

import { z } from 'zod';
import { mathDerivationSchema, sourceRefSchema } from './_shared';

/** UC.R-qualified requirement identifier — caps at 99 per UC / 99 per R (C12). */
export const requirementIdSchema = z
  .string()
  .regex(/^(UC[0-9]{2}|CC)\.R[0-9]{2}$/)
  .describe(
    'x-ui-surface=section:Requirement Detail > Header — requirement id ("UC01.R01".."CC.R99") per C12 pattern.',
  );

/**
 * NFR provenance discriminated union — traces every NFR / constant back to
 * the upstream artifact that DEMANDED it (T-new c1v-m2-nfr-resynth / Wave-2-mid).
 *
 * Per plans/c1v-MIT-Crawley-Cornell.v2.md §0.3.6, NFRs in v2.1 must derive
 * from FRs + FMEA-early + data_flows rather than being synthesized linearly
 * in M2. The three allowed upstream kinds:
 *
 *   - 'fmea'                   → refs `FM.NN` in module-8-risk/fmea_early.v1.json
 *   - 'data_flow'              → refs `DE.NN` in module-1-defining-scope/data_flows.v1.json
 *   - 'functional_requirement' → refs `UC##.R##` or `CC.R##` in requirements_table.json
 *
 * Optional so v2 baseline requirements (pure FRs, no derivation metadata)
 * remain schema-valid for backward-compat.
 */
export const derivedFromSchema = z
  .discriminatedUnion('type', [
    z
      .object({
        type: z.literal('fmea'),
        ref: z
          .string()
          .regex(/^FM\.[0-9]{2}$/)
          .describe(
            'x-ui-surface=section:Requirement Detail > Provenance — FMEA-early failure-mode id (e.g., "FM.04").',
          ),
      })
      .describe(
        'x-ui-surface=section:Requirement Detail > Provenance — NFR derived from an FMEA-early failure mode.',
      ),
    z
      .object({
        type: z.literal('data_flow'),
        ref: z
          .string()
          .regex(/^DE\.[0-9]{2}$/)
          .describe(
            'x-ui-surface=section:Requirement Detail > Provenance — data-flow entry id (e.g., "DE.08").',
          ),
      })
      .describe(
        'x-ui-surface=section:Requirement Detail > Provenance — NFR derived from a data-flow pii/criticality attribute.',
      ),
    z
      .object({
        type: z.literal('functional_requirement'),
        ref: requirementIdSchema,
      })
      .describe(
        'x-ui-surface=section:Requirement Detail > Provenance — NFR derived from a functional requirement (budget/latency implication).',
      ),
  ])
  .describe(
    'x-ui-surface=section:Requirement Detail > Provenance — upstream artifact that demanded this NFR (Wave-2-mid resynth).',
  );
export type DerivedFrom = z.infer<typeof derivedFromSchema>;

/** Requirement class drives the NUMERIC_ONLY math-derivation gate (flag B). */
export const requirementClassSchema = z.enum([
  'functional',
  'performance',
  'reliability',
  'scalability',
  'capacity',
  'security',
  'usability',
  'compliance',
  'maintainability',
]);
export type RequirementClass = z.infer<typeof requirementClassSchema>;

/** Requirement classes that REQUIRE a math_derivation (flag B NUMERIC_ONLY gate). */
export const NUMERIC_REQUIREMENT_CLASSES: ReadonlySet<RequirementClass> = new Set([
  'performance',
  'reliability',
  'scalability',
  'capacity',
]);

/**
 * Base row shape common to Phases 6/7/8/9/11. Every phase that adds
 * additional row-level fields (audit results, arch decision, coverage)
 * extends this base via `.extend()` to preserve the discriminator + gate.
 */
export const requirementRowSchema = z
  .object({
    req_id: requirementIdSchema,
    text: z
      .string()
      .describe(
        'x-ui-surface=section:Requirement Detail > Header — natural-language requirement statement.',
      ),
    requirement_class: requirementClassSchema.describe(
      'x-ui-surface=section:Requirement Detail > Header — class carries the math-gating rule (flag B).',
    ),
    source_ucbd: sourceRefSchema
      .optional()
      .describe(
        'x-ui-surface=section:Requirement Detail > Provenance — originating UCBD artifact (C11).',
      ),
    also_appears_in: z
      .array(sourceRefSchema)
      .default([])
      .describe(
        'x-ui-surface=section:Requirement Detail > Provenance — downstream phases that reference this requirement (C11).',
      ),
    math_derivation: mathDerivationSchema
      .optional()
      .describe(
        'x-ui-surface=section:Requirement Detail > Design Rationale — required when requirement_class is numeric (flag B NUMERIC_ONLY).',
      ),
    derived_from: derivedFromSchema
      .optional()
      .describe(
        'x-ui-surface=section:Requirement Detail > Provenance — upstream FMEA / data-flow / FR that demanded this (N)FR (T-new Wave-2-mid).',
      ),
  })
  .refine(
    (row) =>
      !NUMERIC_REQUIREMENT_CLASSES.has(row.requirement_class as RequirementClass) ||
      row.math_derivation !== undefined,
    {
      message:
        'math_derivation is required when requirement_class ∈ {performance, reliability, scalability, capacity} (flag B NUMERIC_ONLY gate).',
      path: ['math_derivation'],
    },
  );
export type RequirementRow = z.infer<typeof requirementRowSchema>;

/**
 * Strip the `.refine()` layer so downstream phases can `.extend()` the base
 * object, then re-apply the same refinement on their extended shape.
 * Without this, `.extend()` on a `.refine()`-wrapped schema silently drops
 * the refinement. Exported for Phases 7/8/9/11 consumers.
 */
export const requirementRowBaseObject = requirementRowSchema.innerType();

/**
 * Re-attach the NUMERIC_ONLY math gate to a phase-specific row object that
 * has extended `requirementRowBaseObject`. Usage:
 *
 *   const phase7Row = applyNumericMathGate(
 *     requirementRowBaseObject.extend({ audit_results: ... })
 *   );
 *
 * Keeps the gate enforcement consistent across all 5 consumers.
 */
export function applyNumericMathGate<T extends z.ZodTypeAny>(schema: T) {
  return schema.superRefine((row, ctx) => {
    const r = row as { requirement_class?: string; math_derivation?: unknown };
    if (
      r.requirement_class &&
      NUMERIC_REQUIREMENT_CLASSES.has(r.requirement_class as RequirementClass) &&
      r.math_derivation === undefined
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'math_derivation is required when requirement_class ∈ {performance, reliability, scalability, capacity} (flag B NUMERIC_ONLY gate).',
        path: ['math_derivation'],
      });
    }
  });
}
