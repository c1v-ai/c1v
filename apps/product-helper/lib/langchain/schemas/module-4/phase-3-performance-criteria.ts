/**
 * Phase 3 — Identifying Performance Criteria (MASTER §4.5.4 Step-3 HOTSPOT)
 *
 * Every performance criterion carries a REQUIRED `math_derivation` field.
 * The master plan is explicit: "Criterion targets derived from the math,
 * not invented." `inputs: {}` is permitted for text-valued heuristics
 * (consistent with M2 Peer-3 decision B — NUMERIC_ONLY gating applies to
 * the formula's anchor values, not the semantic field types themselves).
 *
 * `source_function_block_ids[]` traces each PC back to ≥1 FFBD function
 * block from the ingested M3 Phase 11 `functions_flat_list`. This keeps
 * the DM rooted in the functional decomposition.
 *
 * `direction` controls the normalization sign in M4 Phase 9.
 *
 * @module lib/langchain/schemas/module-4/phase-3-performance-criteria
 */

import { z } from 'zod';
import { module4PhaseEnvelopeSchema } from './_shared';
import {
  mathDerivationSchema,
  sourceRefSchema,
  softwareArchRefSchema,
} from '../module-2/_shared';

// ─────────────────────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────────────────────

/** Master category — aligns with M3 Phase 11 `candidate_dimension` enum plus M4-specific additions. */
export const pcCategorySchema = z.enum([
  'performance',
  'reliability',
  'scalability',
  'capacity',
  'security',
  'usability',
  'maintainability',
  'observability',
  'cost',
  'compliance',
  'portability',
]);
export type PcCategory = z.infer<typeof pcCategorySchema>;

/** Scoring direction — drives normalization in M4 Phase 9. */
export const pcDirectionSchema = z.enum([
  'more_is_better',
  'less_is_better',
  'target_value',
]);
export type PcDirection = z.infer<typeof pcDirectionSchema>;

/** Measure type — drives M4 Phase 5 rubric-anchor vs direct-formula branching. */
export const pcMeasureTypeSchema = z.enum(['direct', 'scaled']);
export type PcMeasureType = z.infer<typeof pcMeasureTypeSchema>;

// ─────────────────────────────────────────────────────────────────────────
// Performance criterion (master §4.5.4 hotspot)
// ─────────────────────────────────────────────────────────────────────────

export const performanceCriterionSchema = z
  .object({
    criterion_id: z
      .string()
      .regex(/^PC-[0-9]{2}$/)
      .describe(
        'x-ui-surface=section:Performance Criteria > Row — stable PC-NN identifier.',
      ),
    name: z
      .string()
      .min(3)
      .describe(
        'x-ui-surface=section:Performance Criteria > Row — human-facing PC name (e.g., "p95 API latency", "write throughput").',
      ),
    category: pcCategorySchema.describe(
      'x-ui-surface=section:Performance Criteria > Row — grouping for DM normalization + QFD EC mapping (M4 Phase 17).',
    ),
    direction: pcDirectionSchema.describe(
      'x-ui-surface=section:Performance Criteria > Row — scoring direction; controls M4 Phase 9 normalization sign.',
    ),
    measure_type: pcMeasureTypeSchema.describe(
      'x-ui-surface=section:Performance Criteria > Row — direct measure (numeric formula) or scaled measure (1-5 rubric anchors in M4 Phase 5).',
    ),
    unit: z
      .string()
      .describe(
        'x-ui-surface=section:Performance Criteria > Row — unit for the target (e.g., "ms", "%", "req/s", "score").',
      ),
    target_value: z
      .union([z.number(), z.string()])
      .describe(
        'x-ui-surface=section:Performance Criteria > Row — numeric target (direct measure) or rubric level (scaled measure).',
      ),
    min_acceptable: z
      .union([z.number(), z.string()])
      .optional()
      .describe(
        'x-ui-surface=section:Performance Criteria > Row — absolute minimum; below this the option is rejected regardless of weighted score.',
      ),
    measurement_method: z
      .string()
      .describe(
        'x-ui-surface=section:Performance Criteria > Row — how the value is actually measured (e.g., "k6 load test, 30min steady-state, p95").',
      ),
    math_derivation: mathDerivationSchema.describe(
      'x-ui-surface=section:Performance Criteria > Row > Math — **REQUIRED per master §4.5.4 Step 3.** Formula + KB source must cite how the target was derived (Little\'s Law, queueing math, error-budget math, etc.).',
    ),
    source_function_block_ids: z
      .array(z.string().regex(/^F\.[0-9]+(\.[0-9]+)*$/))
      .min(1)
      .describe(
        'x-ui-surface=section:Performance Criteria > Row > Provenance — FFBD block IDs from M3 Phase 11 `functions_flat_list` that drive this criterion (≥1 required — PCs are always traceable to functions).',
      ),
    suggested_kb_reference: softwareArchRefSchema
      .optional()
      .describe(
        'x-ui-surface=section:Performance Criteria > Row > Rationale — optional KB file grounding this criterion (reuses M2 12-ref enum).',
      ),
    also_appears_in: z
      .array(sourceRefSchema)
      .default([])
      .describe(
        'x-ui-surface=section:Performance Criteria > Row > Provenance — cross-phase references (e.g., originating M2 Phase 8 constant that anchors the target).',
      ),
  })
  .describe(
    'x-ui-surface=section:Performance Criteria > Row — one PC with required math_derivation, direction, and function-block provenance (master §4.5.4 Step 3).',
  );
export type PerformanceCriterion = z.infer<typeof performanceCriterionSchema>;

// ─────────────────────────────────────────────────────────────────────────
// Phase 3 envelope
// ─────────────────────────────────────────────────────────────────────────

export const phase3Schema = module4PhaseEnvelopeSchema.extend({
  criteria: z
    .array(performanceCriterionSchema)
    .min(6)
    .max(10)
    .describe(
      'x-ui-surface=page:/projects/[id]/system-design/decision-matrix/criteria — 6-10 performance criteria with required math derivation (methodology §11 range).',
    ),
  coverage_note: z
    .string()
    .describe(
      'x-ui-surface=section:Performance Criteria > Coverage — one paragraph explaining how these criteria cover the decision space (avoids pitfall "too few criteria").',
    ),
});
export type Phase3Artifact = z.infer<typeof phase3Schema>;
