/**
 * Phase 17 — From Decision Matrix to QFD (OUTPUT CONTRACT to M5)
 *
 * Emits `dm_to_qfd_bridge.v1`: the typed handoff M5 (QFD / House of Quality)
 * consumes to set engineering-characteristic targets. M5 will be a future
 * sweep; this phase owns the contract shape.
 *
 * Contents:
 *   - `selected_option`  — winning alternative with weighted total
 *   - `criteria_weights[]` — every PC with weight + math_derivation
 *   - `performance_criteria[]` — full PC specs (with direct/scaled measures)
 *     so M5 can derive EC targets
 *   - `scoring_snapshot` — final matrix (criterion × option weighted scores)
 *     for traceability + sensitivity
 *
 * Read-only for M5: any shape change must happen in a new M4 sweep.
 *
 * @module lib/langchain/schemas/module-4/phase-17-dm-to-qfd-bridge
 */

import { z } from 'zod';
import { module4PhaseEnvelopeSchema } from './_shared';
import { mathDerivationSchema } from '../module-2/_shared';
import { performanceCriterionSchema } from './phase-3-performance-criteria';
import { measureEntrySchema } from './phase-5-direct-scaled-measures';

// ─────────────────────────────────────────────────────────────────────────
// Selected option
// ─────────────────────────────────────────────────────────────────────────

export const selectedOptionSchema = z
  .object({
    option_id: z
      .string()
      .regex(/^[A-Z]$/)
      .describe(
        'x-ui-surface=section:Selected Option > Header — single-letter option id from M3 Phase 11 `alternatives_to_compare[]` (A, B, ...).',
      ),
    name: z
      .string()
      .describe(
        'x-ui-surface=section:Selected Option > Header — option name (e.g., "Postgres with read replicas").',
      ),
    weighted_total: z
      .number()
      .describe(
        'x-ui-surface=section:Selected Option > Scoring — final Σ(weight_i × normalized_score_i) for this option.',
      ),
    margin_over_runner_up: z
      .number()
      .nonnegative()
      .describe(
        'x-ui-surface=section:Selected Option > Scoring — absolute gap to the second-place option (sensitivity signal).',
      ),
    selection_rationale: z
      .string()
      .min(40)
      .describe(
        'x-ui-surface=section:Selected Option > Rationale — one paragraph explaining why this option won and what trade-offs were accepted.',
      ),
  })
  .describe(
    'x-ui-surface=section:Selected Option — winning alternative with weighted total + margin.',
  );
export type SelectedOption = z.infer<typeof selectedOptionSchema>;

// ─────────────────────────────────────────────────────────────────────────
// Criterion weight (output projection for M5)
// ─────────────────────────────────────────────────────────────────────────

export const criterionWeightOutputSchema = z
  .object({
    criterion_id: z
      .string()
      .regex(/^PC-[0-9]{2}$/)
      .describe(
        'x-ui-surface=section:Criterion Weights > Row — PC id.',
      ),
    name: z
      .string()
      .describe(
        'x-ui-surface=section:Criterion Weights > Row — PC name (convenience for M5 renderers).',
      ),
    weight: z
      .number()
      .min(0)
      .max(1)
      .describe(
        'x-ui-surface=section:Criterion Weights > Row — normalized weight (Σ all weights = 1.0).',
      ),
    math_derivation: mathDerivationSchema.describe(
      'x-ui-surface=section:Criterion Weights > Row > Math — REQUIRED derivation of the weight value (M5 consumes this for EC-importance transfer).',
    ),
  })
  .describe(
    'x-ui-surface=section:Criterion Weights — per-PC weight with math, projected for M5 HoQ importance-rating.',
  );
export type CriterionWeightOutput = z.infer<typeof criterionWeightOutputSchema>;

// ─────────────────────────────────────────────────────────────────────────
// Scoring snapshot cell (one per criterion × option pair)
// ─────────────────────────────────────────────────────────────────────────

export const scoringSnapshotCellSchema = z
  .object({
    criterion_id: z.string().regex(/^PC-[0-9]{2}$/),
    option_id: z.string().regex(/^[A-Z]$/),
    raw_score: z
      .union([z.number(), z.string()])
      .describe(
        'x-ui-surface=section:Scoring Snapshot > Cell — raw measured value before normalization.',
      ),
    normalized_score: z
      .number()
      .min(0)
      .max(1)
      .describe(
        'x-ui-surface=section:Scoring Snapshot > Cell — normalized to [0,1] per M4 Phase 9 method.',
      ),
    weighted_contribution: z
      .number()
      .describe(
        'x-ui-surface=section:Scoring Snapshot > Cell — weight × normalized_score.',
      ),
  })
  .describe(
    'x-ui-surface=section:Scoring Snapshot > Cell — one matrix cell.',
  );
export type ScoringSnapshotCell = z.infer<typeof scoringSnapshotCellSchema>;

export const scoringSnapshotSchema = z
  .object({
    cells: z
      .array(scoringSnapshotCellSchema)
      .min(12)
      .describe(
        'x-ui-surface=section:Scoring Snapshot > Matrix — every (criterion, option) cell (≥12 = min 6 criteria × 2 options per methodology §11).',
      ),
    weighted_totals_per_option: z
      .record(
        z.string().regex(/^[A-Z]$/),
        z.number(),
      )
      .describe(
        'x-ui-surface=section:Scoring Snapshot > Totals — per-option weighted total (option_id → Σ weighted_contribution).',
      ),
  })
  .describe(
    'x-ui-surface=section:Scoring Snapshot — full DM matrix snapshot for traceability + sensitivity analysis.',
  );
export type ScoringSnapshot = z.infer<typeof scoringSnapshotSchema>;

// ─────────────────────────────────────────────────────────────────────────
// Phase 17 envelope
// ─────────────────────────────────────────────────────────────────────────

export const phase17Schema = module4PhaseEnvelopeSchema.extend({
  bridge_version: z
    .literal('dm_to_qfd_bridge.v1')
    .describe(
      'x-ui-surface=internal:bridge-version — stable contract tag M5 (future HoQ sweep) validates against.',
    ),
  selected_option: selectedOptionSchema,
  criteria_weights: z
    .array(criterionWeightOutputSchema)
    .min(6)
    .max(10)
    .describe(
      'x-ui-surface=page:/projects/[id]/system-design/decision-matrix/bridge — per-PC weights feeding M5 EC importance rating.',
    ),
  performance_criteria: z
    .array(performanceCriterionSchema)
    .min(6)
    .max(10)
    .describe(
      'x-ui-surface=section:DM→QFD Bridge > PCs — full PC specs carried forward so M5 can derive EC targets.',
    ),
  measures: z
    .array(measureEntrySchema)
    .min(6)
    .max(10)
    .describe(
      'x-ui-surface=section:DM→QFD Bridge > Measures — direct/scaled measure entries (M5 HoQ EC target-setting needs rubric anchors).',
    ),
  scoring_snapshot: scoringSnapshotSchema,
});
export type Phase17Artifact = z.infer<typeof phase17Schema>;
