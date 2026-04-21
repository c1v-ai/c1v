/**
 * Phase 11 — FFBD → Decision Matrix Bridge
 *
 * Master §4.5.4 hotspot #2. Emits the `decision_matrix_handoff.v1` contract
 * (shape documented in F13/3 `11_FROM-FFBD-TO-DECISION-MATRIX.md`) consumed
 * by Module 4. **Every `candidate_performance_criteria[]` entry has a
 * REQUIRED `math_derivation`** per plan §4.5.4 — not optional. The
 * `peak_RPS` field carries Little's Law math explicitly per plan §6.0:
 * `peak_RPS = DAU × sessions × actions × peak_factor / 86,400`, with
 * `math_derivation.kb_source = "system-design-math-logic.md"` §2 (chain)
 * and §9 (formula reference card).
 *
 * Candidate-criterion KBs (suggested_kb_reference) cover the 12-member
 * `softwareArchRefSchema` enum from M2 `_shared.ts` flag A.
 *
 * @module lib/langchain/schemas/module-3/phase-11-ffbd-to-decision-matrix
 */

import { z } from 'zod';
import {
  phaseEnvelopeSchema,
  mathDerivationSchema,
  softwareArchRefSchema,
} from '../module-2/_shared';

// ─────────────────────────────────────────────────────────────────────────
// Flat function list (every functional block from every diagram)
// ─────────────────────────────────────────────────────────────────────────

export const flatFunctionSchema = z
  .object({
    block_id: z
      .string()
      .regex(/^F\.[0-9]+(\.[0-9]+)*$/)
      .describe(
        'x-ui-surface=section:DM Handoff Dashboard > Functions — hierarchical block id (e.g., F.3.2.1).',
      ),
    name: z
      .string()
      .describe(
        'x-ui-surface=section:DM Handoff Dashboard > Functions — human-facing Title Case block name.',
      ),
    abstract_name: z
      .string()
      .regex(/^[a-z][a-z0-9_]*$/)
      .describe(
        'x-ui-surface=section:DM Handoff Dashboard > Functions — snake_case abstract name (matches M2 functions[].name).',
      ),
    level: z
      .enum(['top', 'sub', 'leaf'])
      .describe(
        'x-ui-surface=section:DM Handoff Dashboard > Functions — hierarchy level for weighting.',
      ),
    parent_diagram: z
      .string()
      .describe(
        'x-ui-surface=section:DM Handoff Dashboard > Functions — diagram title this block belongs to.',
      ),
    uncertainty: z
      .enum(['green', 'yellow', 'red'])
      .describe(
        'x-ui-surface=section:DM Handoff Dashboard > Functions — Phase 9 uncertainty marking.',
      ),
    driving_requirements: z
      .array(
        z
          .string()
          .regex(/^(UC[0-9]{2}|CC)\.R[0-9]{2}$/)
          .describe(
            'x-ui-surface=section:DM Handoff Dashboard > Functions > Provenance — UC.R requirement id.',
          ),
      )
      .min(1)
      .describe(
        'x-ui-surface=section:DM Handoff Dashboard > Functions > Provenance — requirements driving this function.',
      ),
    notes: z
      .string()
      .optional()
      .describe(
        'x-ui-surface=section:DM Handoff Dashboard > Functions — optional reviewer notes.',
      ),
  })
  .describe(
    'x-ui-surface=section:DM Handoff Dashboard > Functions — one flat entry in the functions_flat_list.',
  );
export type FlatFunction = z.infer<typeof flatFunctionSchema>;

// ─────────────────────────────────────────────────────────────────────────
// Candidate performance criterion (math REQUIRED per §4.5.4)
// ─────────────────────────────────────────────────────────────────────────

export const candidateDimensionSchema = z.enum([
  'speed',
  'reliability',
  'accuracy',
  'cost',
  'capacity',
  'security',
  'observability',
]);
export type CandidateDimension = z.infer<typeof candidateDimensionSchema>;

export const candidateCriterionSchema = z
  .object({
    criterion: z
      .string()
      .describe(
        'x-ui-surface=section:DM Handoff Dashboard > Criteria — criterion name (e.g., "Page Load Speed").',
      ),
    dimension: candidateDimensionSchema.describe(
      'x-ui-surface=section:DM Handoff Dashboard > Criteria — performance dimension.',
    ),
    driving_functions: z
      .array(
        z
          .string()
          .regex(/^F\.[0-9]+(\.[0-9]+)*$/)
          .describe(
            'x-ui-surface=section:DM Handoff Dashboard > Criteria — block id this criterion traces to.',
          ),
      )
      .min(1)
      .describe(
        'x-ui-surface=section:DM Handoff Dashboard > Criteria — FFBD functions that drive this criterion.',
      ),
    solution_independent: z
      .boolean()
      .describe(
        'x-ui-surface=section:DM Handoff Dashboard > Criteria — whether the criterion is solution-independent (required for M4 matrix rows).',
      ),
    suggested_kb_reference: softwareArchRefSchema.describe(
      'x-ui-surface=section:DM Handoff Dashboard > Criteria — KB file the criterion cites (matches softwareArchRefSchema 12-enum).',
    ),
    why_this_matters: z
      .string()
      .describe(
        'x-ui-surface=section:DM Handoff Dashboard > Criteria — one-sentence justification for criterion selection.',
      ),
    math_derivation: mathDerivationSchema.describe(
      'x-ui-surface=section:DM Handoff Dashboard > Criteria > Math — REQUIRED per plan §4.5.4 hotspot #2. Every criterion carries its own formula + KB citation.',
    ),
  })
  .describe(
    'x-ui-surface=section:DM Handoff Dashboard > Criteria — one candidate performance criterion with required math derivation.',
  );
export type CandidateCriterion = z.infer<typeof candidateCriterionSchema>;

// ─────────────────────────────────────────────────────────────────────────
// Alternative to compare (M4 matrix column header)
// ─────────────────────────────────────────────────────────────────────────

export const alternativeSchema = z
  .object({
    option_id: z
      .string()
      .regex(/^[A-Z]$/)
      .describe(
        'x-ui-surface=section:DM Handoff Dashboard > Alternatives — single-letter option identifier (A, B, C).',
      ),
    name: z
      .string()
      .describe(
        'x-ui-surface=section:DM Handoff Dashboard > Alternatives — alternative name (e.g., "Shopify Plus (managed SaaS)").',
      ),
    summary: z
      .string()
      .describe(
        'x-ui-surface=section:DM Handoff Dashboard > Alternatives — one-line summary.',
      ),
  })
  .describe(
    'x-ui-surface=section:DM Handoff Dashboard > Alternatives — one alternative the Decision Matrix compares.',
  );
export type Alternative = z.infer<typeof alternativeSchema>;

// ─────────────────────────────────────────────────────────────────────────
// Uncertainty-flagged function (red only per methodology — yellow handled inline)
// ─────────────────────────────────────────────────────────────────────────

export const uncertaintyFlaggedFunctionSchema = z
  .object({
    block_id: z
      .string()
      .regex(/^F\.[0-9]+(\.[0-9]+)*$/)
      .describe(
        'x-ui-surface=section:DM Handoff Dashboard > Uncertainty — block id of the red-flagged function.',
      ),
    name: z
      .string()
      .describe(
        'x-ui-surface=section:DM Handoff Dashboard > Uncertainty — block name.',
      ),
    color: z
      .literal('red')
      .describe(
        'x-ui-surface=section:DM Handoff Dashboard > Uncertainty — red (highest risk — open questions).',
      ),
    open_questions: z
      .array(z.string())
      .min(1)
      .describe(
        'x-ui-surface=section:DM Handoff Dashboard > Uncertainty — ≥1 specific question M4 sensitivity analysis must address.',
      ),
  })
  .describe(
    'x-ui-surface=section:DM Handoff Dashboard > Uncertainty — red-flagged function with follow-up questions.',
  );

// ─────────────────────────────────────────────────────────────────────────
// Key interface preview (Module 6 input)
// ─────────────────────────────────────────────────────────────────────────

export const keyInterfacePreviewSchema = z
  .object({
    id: z
      .string()
      .regex(/^I-[0-9]{2,}$/)
      .describe(
        'x-ui-surface=section:DM Handoff Dashboard > Interfaces — interface id (I-01..).',
      ),
    from_block: z
      .string()
      .describe(
        'x-ui-surface=section:DM Handoff Dashboard > Interfaces — source block.',
      ),
    to_block: z
      .string()
      .describe(
        'x-ui-surface=section:DM Handoff Dashboard > Interfaces — destination block.',
      ),
    nature: z
      .string()
      .describe(
        'x-ui-surface=section:DM Handoff Dashboard > Interfaces — synchronous REST API / async queue / webhook / etc.',
      ),
    payload_hint: z
      .string()
      .optional()
      .describe(
        'x-ui-surface=section:DM Handoff Dashboard > Interfaces — payload summary.',
      ),
  })
  .describe(
    'x-ui-surface=section:DM Handoff Dashboard > Interfaces — cross-subsystem arrow preview for Module 6.',
  );

// ─────────────────────────────────────────────────────────────────────────
// Performance budget inherited from Module 2
// ─────────────────────────────────────────────────────────────────────────

export const inheritedBudgetSchema = z
  .object({
    constant_name: z
      .string()
      .regex(/^[A-Z][A-Z0-9_]*$/)
      .describe(
        'x-ui-surface=section:DM Handoff Dashboard > Budgets — SCREAMING_SNAKE constant.',
      ),
    value: z
      .union([z.number(), z.string()])
      .describe(
        'x-ui-surface=section:DM Handoff Dashboard > Budgets — constant value.',
      ),
    units: z
      .string()
      .optional()
      .describe(
        'x-ui-surface=section:DM Handoff Dashboard > Budgets — unit.',
      ),
    affects_blocks: z
      .array(z.string().regex(/^F\.[0-9]+(\.[0-9]+)*$/))
      .min(1)
      .describe(
        'x-ui-surface=section:DM Handoff Dashboard > Budgets — ≥1 block the budget constrains.',
      ),
    estimate_final: z
      .enum(['Estimate', 'Final'])
      .optional()
      .describe(
        'x-ui-surface=section:DM Handoff Dashboard > Budgets — estimation status.',
      ),
  })
  .describe(
    'x-ui-surface=section:DM Handoff Dashboard > Budgets — constant carried from Module 2 as a budget on downstream blocks.',
  );

// ─────────────────────────────────────────────────────────────────────────
// peak_RPS (Little's Law — master §4.5.4 hotspot)
// ─────────────────────────────────────────────────────────────────────────

export const peakRpsSchema = z
  .object({
    value: z
      .number()
      .nonnegative()
      .describe(
        'x-ui-surface=section:DM Handoff Dashboard > Sizing — computed peak requests per second.',
      ),
    unit: z
      .literal('req/s')
      .describe(
        'x-ui-surface=section:DM Handoff Dashboard > Sizing — unit fixed to req/s.',
      ),
    math_derivation: mathDerivationSchema.describe(
      'x-ui-surface=section:DM Handoff Dashboard > Sizing > Math — Little\'s Law: peak_RPS = DAU × sessions × actions × peak_factor / 86,400. kb_source: "system-design-math-logic.md" §2 (chain) + §9 (formula card).',
    ),
  })
  .describe(
    'x-ui-surface=section:DM Handoff Dashboard > Sizing — peak RPS with required Little\'s Law math derivation.',
  );

// ─────────────────────────────────────────────────────────────────────────
// Summary (aggregate counts + color breakdown)
// ─────────────────────────────────────────────────────────────────────────

export const decisionMatrixSummarySchema = z
  .object({
    total_functions: z
      .number()
      .int()
      .nonnegative()
      .describe(
        'x-ui-surface=section:DM Handoff Dashboard > Summary — total functions across all diagrams.',
      ),
    total_candidate_criteria: z
      .number()
      .int()
      .min(6)
      .max(10)
      .describe(
        'x-ui-surface=section:DM Handoff Dashboard > Summary — methodology requires 6-10 consolidated criteria.',
      ),
    total_alternatives: z
      .number()
      .int()
      .min(2)
      .describe(
        'x-ui-surface=section:DM Handoff Dashboard > Summary — ≥2 alternatives required per methodology §11 Step 4.',
      ),
    red_functions: z
      .number()
      .int()
      .nonnegative()
      .describe(
        'x-ui-surface=section:DM Handoff Dashboard > Summary — count of red-flagged functions.',
      ),
    yellow_functions: z
      .number()
      .int()
      .nonnegative()
      .describe(
        'x-ui-surface=section:DM Handoff Dashboard > Summary — count of yellow-flagged functions.',
      ),
    green_functions: z
      .number()
      .int()
      .nonnegative()
      .describe(
        'x-ui-surface=section:DM Handoff Dashboard > Summary — count of green functions.',
      ),
  })
  .describe(
    'x-ui-surface=section:DM Handoff Dashboard > Summary — aggregate counts for the handoff package.',
  );

// ─────────────────────────────────────────────────────────────────────────
// Phase 11 emission (the decision_matrix_handoff.v1 contract)
// ─────────────────────────────────────────────────────────────────────────

export const phase11Schema = phaseEnvelopeSchema.extend({
  system_name: z
    .string()
    .describe(
      'x-ui-surface=page-header — system name (carried from Phase 0A).',
    ),
  system_description: z
    .string()
    .describe(
      'x-ui-surface=page-header — system description (required at handoff; Phase 0A GAP must be filled before Phase 11 emits).',
    ),
  upstream_artifacts: z
    .object({
      module_2_handoff: z
        .string()
        .describe(
          'x-ui-surface=section:DM Handoff Dashboard > Upstream — path to M2 ffbd-handoff.json.',
        ),
      ffbd_pptx: z
        .string()
        .optional()
        .describe(
          'x-ui-surface=section:DM Handoff Dashboard > Upstream — optional path to FFBD PPTX.',
        ),
      ingestion_report: z
        .string()
        .optional()
        .describe(
          'x-ui-surface=section:DM Handoff Dashboard > Upstream — optional path to Phase 0A ingestion report.',
        ),
    })
    .describe(
      'x-ui-surface=section:DM Handoff Dashboard > Upstream — upstream artifacts this handoff cites.',
    ),
  functions_flat_list: z
    .array(flatFunctionSchema)
    .min(1)
    .describe(
      'x-ui-surface=section:DM Handoff Dashboard > Functions — every function from every diagram, flat.',
    ),
  candidate_performance_criteria: z
    .array(candidateCriterionSchema)
    .min(6)
    .max(10)
    .describe(
      'x-ui-surface=section:DM Handoff Dashboard > Criteria — 6-10 consolidated criteria, each with required math derivation.',
    ),
  alternatives_to_compare: z
    .array(alternativeSchema)
    .min(2)
    .describe(
      'x-ui-surface=section:DM Handoff Dashboard > Alternatives — ≥2 alternatives for M4 comparison.',
    ),
  uncertainty_flagged_functions: z
    .array(uncertaintyFlaggedFunctionSchema)
    .default([])
    .describe(
      'x-ui-surface=section:DM Handoff Dashboard > Uncertainty — red-flagged functions (empty if none).',
    ),
  key_interfaces_preview: z
    .array(keyInterfacePreviewSchema)
    .default([])
    .describe(
      'x-ui-surface=section:DM Handoff Dashboard > Interfaces — preview for Module 6.',
    ),
  performance_budgets_inherited_from_module_2: z
    .array(inheritedBudgetSchema)
    .default([])
    .describe(
      'x-ui-surface=section:DM Handoff Dashboard > Budgets — budgets carried from M2 constants.',
    ),
  peak_RPS: peakRpsSchema,
  summary: decisionMatrixSummarySchema,
  ready_for_module_4: z
    .boolean()
    .describe(
      'x-ui-surface=section:DM Handoff Dashboard > Summary — integrity gate: ≥6 criteria, ≥2 alternatives, all required math present, ready for M4.',
    ),
});
export type Phase11Artifact = z.infer<typeof phase11Schema>;
