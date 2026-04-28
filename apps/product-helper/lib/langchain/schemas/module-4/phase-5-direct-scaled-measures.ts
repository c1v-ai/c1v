/**
 * Phase 5 — Using Direct and Scaled Measures (MASTER §4.5.4 Step-5 HOTSPOT)
 *
 * Every rubric anchor carries:
 *   - numeric `value` (per the measure's unit)
 *   - `kb_source` citing where the anchor came from (§10 Typical Constants
 *     or a domain-specific KB file — `api-design-sys-design-kb.md` for
 *     latency anchors, `caching-system-design-kb.md` for cache-hit-rate
 *     anchors, `resilliency-patterns-kb.md` for availability anchors, etc.)
 *   - `description` text for reviewer legibility
 *
 * Direct measures (formula-based) use `direct_measure.formula` + KB source.
 * Scaled measures use `scaled_measure.anchors[]` with exactly 5 levels.
 *
 * Discriminated by `measure_type` (sourced from M4 Phase 3 for the same
 * criterion_id). Every PC in Phase 3 must have a matching Phase 5 entry.
 *
 * @module lib/langchain/schemas/module-4/phase-5-direct-scaled-measures
 */

import { z } from 'zod';
import { module4PhaseEnvelopeSchema } from './_shared';
import {
  mathDerivationSchema,
  softwareArchRefSchema,
} from '../module-2/_shared';

// ─────────────────────────────────────────────────────────────────────────
// Rubric anchor (5 per scaled criterion — level 1 worst .. level 5 best,
// direction-aware)
// ─────────────────────────────────────────────────────────────────────────

export const rubricAnchorLevelSchema = z
  .number()
  .int()
  .min(1)
  .max(5)
  .describe(
    'x-ui-surface=section:Direct/Scaled Measures > Anchors — rubric level (1 = worst, 5 = best; direction-aware).',
  );

export const rubricAnchorSchema = z
  .object({
    level: rubricAnchorLevelSchema,
    value: z
      .union([z.number(), z.string()])
      .describe(
        'x-ui-surface=section:Direct/Scaled Measures > Anchors — **REQUIRED numeric anchor per master §4.5.4 Step 5.** The measured value the scoring team uses to decide "this option scores 3". Must come from §10 Typical Constants or a domain KB.',
      ),
    unit: z
      .string()
      .describe(
        'x-ui-surface=section:Direct/Scaled Measures > Anchors — unit for the anchor value (must match the PC unit).',
      ),
    description: z
      .string()
      .describe(
        'x-ui-surface=section:Direct/Scaled Measures > Anchors — one-sentence reviewer description (e.g., "Level 3: p95 latency between 100-250ms under expected load").',
      ),
    kb_source: z
      .string()
      .min(3)
      .describe(
        'x-ui-surface=section:Direct/Scaled Measures > Anchors > Rationale — **REQUIRED citation per master §4.5.4 Step 5.** KB filename (e.g., "api-design-sys-design-kb.md") or "§10-typical-constants" for the industry benchmark that anchored this level.',
      ),
    kb_section: z
      .string()
      .optional()
      .describe(
        'x-ui-surface=section:Direct/Scaled Measures > Anchors > Rationale — optional anchor heading within the KB file (e.g., "§p95-internal-latency-targets").',
      ),
    kb_reference: softwareArchRefSchema
      .optional()
      .describe(
        'x-ui-surface=section:Direct/Scaled Measures > Anchors > Rationale — optional enum match for the KB file (reuses M2 12-ref set when anchor cites a canonical KB).',
      ),
  })
  .describe(
    'x-ui-surface=section:Direct/Scaled Measures > Anchors — one of 5 rubric levels for a scaled criterion (master §4.5.4 Step 5: numeric + KB-sourced).',
  );
export type RubricAnchor = z.infer<typeof rubricAnchorSchema>;

// ─────────────────────────────────────────────────────────────────────────
// Scaled measure (5-anchor rubric)
// ─────────────────────────────────────────────────────────────────────────

export const scaledMeasureSchema = z
  .object({
    anchors: z
      .array(rubricAnchorSchema)
      .length(5)
      .describe(
        'x-ui-surface=section:Direct/Scaled Measures > Scaled — exactly 5 anchors (one per level 1-5).',
      ),
    anchor_monotonicity_check: z
      .boolean()
      .default(true)
      .describe(
        'x-ui-surface=internal:rubric-validation — assert anchor values are monotonic in the PC direction. Validator sets this true at emission time; false indicates a pitfall flag for M4 Phase 4.',
      ),
  })
  .describe(
    'x-ui-surface=section:Direct/Scaled Measures > Scaled — 5-level rubric with numeric anchors + KB provenance per master §4.5.4 Step 5.',
  );
export type ScaledMeasure = z.infer<typeof scaledMeasureSchema>;

// ─────────────────────────────────────────────────────────────────────────
// Direct measure (formula-based, no rubric)
// ─────────────────────────────────────────────────────────────────────────

export const directMeasureSchema = z
  .object({
    formula: z
      .string()
      .describe(
        'x-ui-surface=section:Direct/Scaled Measures > Direct — measurement formula (e.g., "p95 = sort(samples)[0.95 * n]").',
      ),
    measurement_tool: z
      .string()
      .describe(
        'x-ui-surface=section:Direct/Scaled Measures > Direct — tool used to measure (e.g., "k6", "Datadog APM", "custom load-gen").',
      ),
    sample_size_min: z
      .number()
      .int()
      .positive()
      .optional()
      .describe(
        'x-ui-surface=section:Direct/Scaled Measures > Direct — minimum sample size for a valid measurement.',
      ),
    math_derivation: mathDerivationSchema.describe(
      'x-ui-surface=section:Direct/Scaled Measures > Direct > Math — derivation of the target from upstream constants (required so direct measures stay KB-grounded).',
    ),
  })
  .describe(
    'x-ui-surface=section:Direct/Scaled Measures > Direct — formula-based measurement (no rubric; used for objective numeric PCs).',
  );
export type DirectMeasure = z.infer<typeof directMeasureSchema>;

// ─────────────────────────────────────────────────────────────────────────
// Measure entry (one per PC, discriminated on measure_type)
// ─────────────────────────────────────────────────────────────────────────

export const measureEntrySchema = z
  .object({
    criterion_id: z
      .string()
      .regex(/^PC-[0-9]{2}$/)
      .describe(
        'x-ui-surface=section:Direct/Scaled Measures > Row — PC this measure binds to (must match a PC-NN in M4 Phase 3 `criteria[]`).',
      ),
    measure_type: z
      .enum(['direct', 'scaled'])
      .describe(
        'x-ui-surface=section:Direct/Scaled Measures > Row — must match M4 Phase 3 `measure_type` for the same criterion_id.',
      ),
    direct_measure: directMeasureSchema
      .optional()
      .describe(
        'x-ui-surface=section:Direct/Scaled Measures > Row — populated when measure_type = "direct".',
      ),
    scaled_measure: scaledMeasureSchema
      .optional()
      .describe(
        'x-ui-surface=section:Direct/Scaled Measures > Row — populated when measure_type = "scaled".',
      ),
  })
  .refine(
    (entry) =>
      (entry.measure_type === 'direct' && entry.direct_measure !== undefined) ||
      (entry.measure_type === 'scaled' && entry.scaled_measure !== undefined),
    {
      message:
        'measure_type must match exactly one populated payload: direct → direct_measure, scaled → scaled_measure.',
      path: ['measure_type'],
    },
  )
  .describe(
    'x-ui-surface=section:Direct/Scaled Measures > Row — per-PC measure entry (direct formula OR scaled rubric).',
  );
export type MeasureEntry = z.infer<typeof measureEntrySchema>;

// ─────────────────────────────────────────────────────────────────────────
// Phase 5 envelope
// ─────────────────────────────────────────────────────────────────────────

export const phase5Schema = module4PhaseEnvelopeSchema.extend({
  measures: z
    .array(measureEntrySchema)
    .min(6)
    .max(10)
    .describe(
      'x-ui-surface=page:/projects/[id]/system-design/decision-matrix/measures — one measure entry per PC (6-10 matching Phase 3 count).',
    ),
  kb_sources_cited: z
    .array(z.string())
    .describe(
      'x-ui-surface=section:Direct/Scaled Measures > Provenance — deduplicated list of KB files cited across all anchors (enables quick review of methodology grounding).',
    ),
});
export type Phase5Artifact = z.infer<typeof phase5Schema>;
