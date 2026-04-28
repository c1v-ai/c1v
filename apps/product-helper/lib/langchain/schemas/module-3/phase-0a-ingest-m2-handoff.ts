/**
 * Phase 0A — Ingest M2 FFBD Handoff (Hybrid composite)
 *
 * M3's entry point. Mirrors the composite `ffbd_handoff.v1` bundle documented
 * in F13/3 `00A_INGEST-MODULE-2-HANDOFF.md`, sourced from 6+ M2 phase Zods
 * (phase-0-ingest, phase-3-ucbd-setup, phase-5-ucbd-step-flow,
 * phase-6-requirements-table, phase-8-constants-table, phase-11-multi-uc-
 * expansion) plus a per-UC cross-check against phase-12-ffbd-handoff's
 * `operational_primitives`. Read-only consume from M2 — never edits module-2/.
 *
 * Composition decision (Gate A §7.1): **Hybrid — composite shape + Phase 12
 * per-UC checkpoint**. Phase 0A Zod mirrors the composite, ingests from
 * multiple M2 artifacts, and validates that every `uc_id` present in Phase 12
 * `operational_primitives` also appears in the composite `use_case_flows[]`.
 *
 * GAPS policy (Gate A §7.3): 5 fields have no M2 source — `system_description`,
 * `constants[].estimate_final`, `constants[].owned_by`,
 * `cross_cutting_concerns[].index`, `boundary.external_actors[].type`. All
 * marked `.optional()`; ingest-time LLM agent infers/prompts the fill-in.
 * Not a blocker for Gate B.
 *
 * @module lib/langchain/schemas/module-3/phase-0a-ingest-m2-handoff
 */

import { z } from 'zod';
import { phaseEnvelopeSchema } from '../module-2/_shared';

// ─────────────────────────────────────────────────────────────────────────
// Boundary (the_system + external_actors)
// ─────────────────────────────────────────────────────────────────────────

export const externalActorSchema = z
  .object({
    name: z
      .string()
      .describe(
        'x-ui-surface=section:FFBD > Boundary — external actor name (sourced from M2 Phase 3 ucbdHeaderSchema.actor).',
      ),
    type: z
      .enum(['human', 'external_system'])
      .optional()
      .describe(
        'x-ui-surface=section:FFBD > Boundary — actor classification. GAP: M2 Phase 3 actor field is freeform; ingest-time inference fills this.',
      ),
  })
  .describe(
    'x-ui-surface=section:FFBD > Boundary — external actor crossing the system boundary (EFFBD data-block candidate).',
  );
export type ExternalActor = z.infer<typeof externalActorSchema>;

export const boundarySchema = z
  .object({
    the_system: z
      .string()
      .describe(
        'x-ui-surface=section:FFBD > Boundary — the system name as the boundary label (derived from M2 Phase 0/3 context).',
      ),
    external_actors: z
      .array(externalActorSchema)
      .default([])
      .describe(
        'x-ui-surface=section:FFBD > Boundary — deduplicated actors across all UCs.',
      ),
  })
  .describe(
    'x-ui-surface=section:FFBD > Boundary — system boundary definition (the_system + external_actors[]).',
  );

// ─────────────────────────────────────────────────────────────────────────
// Function candidate (FFBD functional-block seeds from M2 Phase 5/6/11)
// ─────────────────────────────────────────────────────────────────────────

export const functionCandidateSchema = z
  .object({
    name: z
      .string()
      .regex(/^[a-z][a-z0-9_]*$/)
      .describe(
        'x-ui-surface=section:FFBD > Functions — snake_case_verb_object name (from M2 Phase 5 steps[].action, deduped via Phase 11 merged_from[]).',
      ),
    description_hint: z
      .string()
      .optional()
      .describe(
        'x-ui-surface=section:FFBD > Functions — one-line intent (optional; derived from M2 Phase 5 notes or agent-generated).',
      ),
    source_requirements: z
      .array(
        z
          .string()
          .regex(/^(UC[0-9]{2}|CC)\.R[0-9]{2}$/)
          .describe(
            'x-ui-surface=section:FFBD > Functions > Provenance — UC.R-qualified requirement id (from M2 Phase 6 req_id).',
          ),
      )
      .min(1)
      .describe(
        'x-ui-surface=section:FFBD > Functions > Provenance — requirements that drive this function (from M2 Phase 6 rows[] where source_ucbd matches).',
      ),
    appears_in_use_cases: z
      .array(
        z
          .string()
          .regex(/^(UC[0-9]{2}|CC)$/)
          .describe(
            'x-ui-surface=section:FFBD > Functions — UC id where this function appears.',
          ),
      )
      .min(1)
      .describe(
        'x-ui-surface=section:FFBD > Functions — UCs where this function appears (from M2 Phase 11 merged_from[] dedup).',
      ),
  })
  .describe(
    'x-ui-surface=section:FFBD > Functions — candidate functional-block seed for M3 FFBD.',
  );
export type FunctionCandidate = z.infer<typeof functionCandidateSchema>;

// ─────────────────────────────────────────────────────────────────────────
// Use-case flow (function_sequence + branching from M2 Phase 3+5)
// ─────────────────────────────────────────────────────────────────────────

export const branchSchema = z
  .object({
    guard: z
      .string()
      .describe(
        'x-ui-surface=section:FFBD > Use Case Flows — guard condition label (from M2 Phase 5 alternate_branch).',
      ),
    next_function: z
      .string()
      .regex(/^[a-z][a-z0-9_]*$/)
      .describe(
        'x-ui-surface=section:FFBD > Use Case Flows — snake_case function name the guard routes to.',
      ),
  })
  .describe(
    'x-ui-surface=section:FFBD > Use Case Flows — one branch in a branching point.',
  );

export const branchingPointSchema = z
  .object({
    after_function: z
      .string()
      .regex(/^[a-z][a-z0-9_]*$/)
      .describe(
        'x-ui-surface=section:FFBD > Use Case Flows — function after which the branch fires.',
      ),
    branches: z
      .array(branchSchema)
      .min(2)
      .describe(
        'x-ui-surface=section:FFBD > Use Case Flows — ≥2 branches (guards + destinations).',
      ),
  })
  .describe(
    'x-ui-surface=section:FFBD > Use Case Flows — branching decision in the function sequence.',
  );

export const useCaseFlowSchema = z
  .object({
    use_case_id: z
      .string()
      .regex(/^(UC[0-9]{2}|CC)$/)
      .describe(
        'x-ui-surface=section:FFBD > Use Case Flows — UC identifier (from M2 Phase 3 uc_id).',
      ),
    use_case_name: z
      .string()
      .describe(
        'x-ui-surface=section:FFBD > Use Case Flows — UC human-facing name (from M2 Phase 3 uc_name).',
      ),
    function_sequence: z
      .array(z.string().regex(/^[a-z][a-z0-9_]*$/))
      .min(1)
      .describe(
        'x-ui-surface=section:FFBD > Use Case Flows — ordered sequence of function names (from M2 Phase 5 steps[].action).',
      ),
    branching: z
      .array(branchingPointSchema)
      .default([])
      .describe(
        'x-ui-surface=section:FFBD > Use Case Flows — branching points along the sequence.',
      ),
  })
  .describe(
    'x-ui-surface=section:FFBD > Use Case Flows — one UC flow (function_sequence + branching).',
  );
export type UseCaseFlow = z.infer<typeof useCaseFlowSchema>;

// ─────────────────────────────────────────────────────────────────────────
// Carried constant (from M2 Phase 8; GAP fields marked optional)
// ─────────────────────────────────────────────────────────────────────────

export const carriedConstantSchema = z
  .object({
    name: z
      .string()
      .regex(/^[A-Z][A-Z0-9_]*$/)
      .describe(
        'x-ui-surface=section:FFBD > Constants — SCREAMING_SNAKE constant name (from M2 Phase 8 constant_name).',
      ),
    value: z
      .union([z.number(), z.string()])
      .describe(
        'x-ui-surface=section:FFBD > Constants — constant value (from M2 Phase 8 value).',
      ),
    units: z
      .string()
      .optional()
      .describe(
        'x-ui-surface=section:FFBD > Constants — unit (from M2 Phase 8 unit).',
      ),
    estimate_final: z
      .enum(['Estimate', 'Final'])
      .optional()
      .describe(
        'x-ui-surface=section:FFBD > Constants — estimation status. GAP: not tracked in M2 Phase 8; ingest-time inference fills.',
      ),
    owned_by: z
      .string()
      .optional()
      .describe(
        'x-ui-surface=section:FFBD > Constants — role responsible for the constant. GAP: not tracked in M2 Phase 8.',
      ),
    affects_blocks: z
      .array(z.string())
      .default([])
      .describe(
        'x-ui-surface=section:FFBD > Constants — functional-block ids this constant labels (derived at ingest).',
      ),
  })
  .describe(
    'x-ui-surface=section:FFBD > Constants — carried Module-2 constant (labels, budgets, targets).',
  );
export type CarriedConstant = z.infer<typeof carriedConstantSchema>;

// ─────────────────────────────────────────────────────────────────────────
// Cross-cutting concern (from M2 Phase 3 CC rows; GAP: index not tracked)
// ─────────────────────────────────────────────────────────────────────────

export const crossCuttingConcernSchema = z
  .object({
    index: z
      .string()
      .regex(/^CC\.R[0-9]{2}$/)
      .optional()
      .describe(
        'x-ui-surface=section:FFBD > Cross-Cutting Concerns — CC.R index. GAP: not assigned in M2 Phase 3 CC rows; ingest-time assignment.',
      ),
    name: z
      .string()
      .regex(/^[a-z][a-z0-9_]*$/)
      .describe(
        'x-ui-surface=section:FFBD > Cross-Cutting Concerns — snake_case concern name (from M2 Phase 3 uc_name where uc_id=CC).',
      ),
    description: z
      .string()
      .describe(
        'x-ui-surface=section:FFBD > Cross-Cutting Concerns — one-line description.',
      ),
  })
  .describe(
    'x-ui-surface=section:FFBD > Cross-Cutting Concerns — system-wide concern (policy, audit, auth, rate-limit, etc.).',
  );
export type CrossCuttingConcern = z.infer<typeof crossCuttingConcernSchema>;

// ─────────────────────────────────────────────────────────────────────────
// Per-UC checkpoint cross-reference (validates Phase 12 handoff alignment)
// ─────────────────────────────────────────────────────────────────────────

export const perUcCheckpointSchema = z
  .object({
    uc_id: z
      .string()
      .regex(/^(UC[0-9]{2}|CC)$/)
      .describe(
        'x-ui-surface=internal:m2-handoff-ingester — UC id present in M2 Phase 12 operational_primitives.',
      ),
    operational_primitives_present: z
      .boolean()
      .describe(
        'x-ui-surface=internal:m2-handoff-ingester — whether M2 phase-12-ffbd-handoff.ts emitted operational_primitives for this uc_id.',
      ),
    cross_ref_pass: z
      .boolean()
      .describe(
        'x-ui-surface=internal:m2-handoff-ingester — whether this uc_id also appears in the composite use_case_flows[] (true = integrity check passes).',
      ),
  })
  .describe(
    'x-ui-surface=internal:m2-handoff-ingester — per-UC cross-check between composite handoff and Phase 12 per-UC primitives.',
  );

// ─────────────────────────────────────────────────────────────────────────
// Summary (aggregate counts computed at ingest)
// ─────────────────────────────────────────────────────────────────────────

export const handoffSummarySchema = z
  .object({
    total_functions: z
      .number()
      .int()
      .nonnegative()
      .describe(
        'x-ui-surface=section:Project Overview > Handoff Summary — deduped function count.',
      ),
    total_use_cases: z
      .number()
      .int()
      .nonnegative()
      .describe(
        'x-ui-surface=section:Project Overview > Handoff Summary — UC count (excluding CC).',
      ),
    total_constants: z
      .number()
      .int()
      .nonnegative()
      .describe(
        'x-ui-surface=section:Project Overview > Handoff Summary — carried-constant count.',
      ),
    total_cross_cutting: z
      .number()
      .int()
      .nonnegative()
      .describe(
        'x-ui-surface=section:Project Overview > Handoff Summary — cross-cutting concern count.',
      ),
  })
  .describe(
    'x-ui-surface=section:Project Overview > Handoff Summary — aggregate counts for the ingested handoff.',
  );

// ─────────────────────────────────────────────────────────────────────────
// Phase 0A emission (extends phaseEnvelopeSchema per plan §4 DoD bullet 2)
// ─────────────────────────────────────────────────────────────────────────

export const phase0aSchema = phaseEnvelopeSchema.extend({
  system_name: z
    .string()
    .describe(
      'x-ui-surface=page-header — system name (from M2 Phase 0 intake_summary).',
    ),
  system_description: z
    .string()
    .optional()
    .describe(
      'x-ui-surface=page-header — one-sentence system description. GAP: no M2 source; ingest-time inference from Module 1 metadata or agent prompt.',
    ),
  boundary: boundarySchema,
  functions: z
    .array(functionCandidateSchema)
    .default([])
    .describe(
      'x-ui-surface=section:FFBD > Functions — full function-candidate set (from M2 Phase 5+6+11 composite).',
    ),
  use_case_flows: z
    .array(useCaseFlowSchema)
    .default([])
    .describe(
      'x-ui-surface=section:FFBD > Use Case Flows — per-UC ordered function sequences + branching (from M2 Phase 3+5 composite).',
    ),
  constants: z
    .array(carriedConstantSchema)
    .default([])
    .describe(
      'x-ui-surface=section:FFBD > Constants — carried performance-budget + capacity constants (from M2 Phase 8).',
    ),
  cross_cutting_concerns: z
    .array(crossCuttingConcernSchema)
    .default([])
    .describe(
      'x-ui-surface=section:FFBD > Cross-Cutting Concerns — CC rows from M2 Phase 3.',
    ),
  module_1_constraints_carried_forward: z
    .array(z.string())
    .default([])
    .describe(
      'x-ui-surface=section:FFBD > Constraints — Module 1 design-space constraints (from M2 Phase 0 intake_summary extraction).',
    ),
  per_uc_checkpoints: z
    .array(perUcCheckpointSchema)
    .default([])
    .describe(
      'x-ui-surface=internal:m2-handoff-ingester — Phase 12 per-UC operational_primitives cross-check results.',
    ),
  summary: handoffSummarySchema,
  ready_for_m3_phase_1: z
    .boolean()
    .describe(
      'x-ui-surface=section:Project Overview > Handoff Summary — integrity gate: all cross-refs pass, no missing required fields, ready to begin M3 Phase 1.',
    ),
});
export type Phase0aArtifact = z.infer<typeof phase0aSchema>;
