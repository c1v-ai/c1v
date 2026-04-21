/**
 * Phase 10 — Assigning Weights to Criteria
 *
 * Every criterion weight carries REQUIRED `math_derivation` per master
 * §4.5.4: weights come from math (FMEA severity × frequency × detection
 * difficulty, AHP pairwise comparison, or budget-allocation math) — not
 * vibes. Weights MUST sum to 1.0 ± a small epsilon.
 *
 * FMEA linkage is reserved for M7 (FMEA sweep — future). M4 ships with
 * `fmea_severity_linkage` as .optional() placeholder; M7 will populate
 * `failure_mode_id` + `severity_score` + `frequency` + `detection`. The
 * contract shape is documented here to make M7 a pure fill-in.
 *
 * @module lib/langchain/schemas/module-4/phase-10-criterion-weights
 */

import { z } from 'zod';
import { module4PhaseEnvelopeSchema } from './_shared';
import { mathDerivationSchema } from '../module-2/_shared';

export const consensusMethodSchema = z.enum([
  'ahp_pairwise',
  'direct_assignment',
  'budget_allocation',
  'delphi',
  'fmea_derived',
  'expert_override',
]);
export type ConsensusMethod = z.infer<typeof consensusMethodSchema>;

/**
 * FMEA linkage — M7 future sweep populates this. M4 ships with all fields
 * optional; M7 will tighten to required on failure_mode_id + severity_score.
 */
export const fmeaSeverityLinkageSchema = z
  .object({
    failure_mode_id: z
      .string()
      .optional()
      .describe(
        'x-ui-surface=section:Criterion Weights > FMEA — M7 fills this with the FMEA failure-mode id. Placeholder in M4.',
      ),
    severity_score: z
      .number()
      .int()
      .min(1)
      .max(10)
      .optional()
      .describe(
        'x-ui-surface=section:Criterion Weights > FMEA — 1-10 severity (M7 will populate).',
      ),
    frequency: z
      .number()
      .int()
      .min(1)
      .max(10)
      .optional()
      .describe(
        'x-ui-surface=section:Criterion Weights > FMEA — 1-10 frequency (M7 will populate).',
      ),
    detection_difficulty: z
      .number()
      .int()
      .min(1)
      .max(10)
      .optional()
      .describe(
        'x-ui-surface=section:Criterion Weights > FMEA — 1-10 detection difficulty (M7 will populate).',
      ),
    rpn: z
      .number()
      .optional()
      .describe(
        'x-ui-surface=section:Criterion Weights > FMEA — Risk Priority Number = severity × frequency × detection_difficulty (M7 will populate).',
      ),
  })
  .describe(
    'x-ui-surface=section:Criterion Weights > FMEA — placeholder for M7 FMEA linkage; all fields .optional() until M7 sweep lands.',
  );
export type FmeaSeverityLinkage = z.infer<typeof fmeaSeverityLinkageSchema>;

export const criterionWeightSchema = z
  .object({
    criterion_id: z
      .string()
      .regex(/^PC-[0-9]{2}$/),
    weight: z
      .number()
      .min(0)
      .max(1)
      .describe(
        'x-ui-surface=section:Criterion Weights > Row — normalized weight (0-1; all weights sum to 1.0 ± epsilon).',
      ),
    math_derivation: mathDerivationSchema.describe(
      'x-ui-surface=section:Criterion Weights > Row > Math — **REQUIRED per master §4.5.4.** Formula + KB source must cite how the weight was derived (FMEA severity, AHP pairwise, budget allocation, etc.).',
    ),
    consensus_method: consensusMethodSchema.describe(
      'x-ui-surface=section:Criterion Weights > Row — how team agreement on this weight was reached (drives M4 Phase 11 consensus math).',
    ),
    fmea_severity_linkage: fmeaSeverityLinkageSchema
      .optional()
      .describe(
        'x-ui-surface=section:Criterion Weights > Row > FMEA — M7 populates; .optional() in M4 per plan decision #3.',
      ),
  })
  .describe(
    'x-ui-surface=section:Criterion Weights > Row — per-PC weight with required math_derivation.',
  );
export type CriterionWeight = z.infer<typeof criterionWeightSchema>;

export const phase10Schema = module4PhaseEnvelopeSchema
  .extend({
    weights: z
      .array(criterionWeightSchema)
      .min(6)
      .max(10)
      .describe(
        'x-ui-surface=page:/projects/[id]/system-design/decision-matrix/weights — per-PC weights (6-10 matching Phase 3 count).',
      ),
    sum_check: z
      .number()
      .describe(
        'x-ui-surface=section:Criterion Weights > Validation — sum of all weights (must be 1.0 ± 0.01).',
      ),
    sum_tolerance: z
      .number()
      .positive()
      .default(0.01)
      .describe(
        'x-ui-surface=internal:weight-sum-validator — epsilon for sum_check = 1.0 validation.',
      ),
  })
  .refine(
    (p) => Math.abs(p.sum_check - 1.0) <= p.sum_tolerance,
    {
      message:
        'sum_check must equal 1.0 within sum_tolerance (weights must be normalized).',
      path: ['sum_check'],
    },
  );
export type Phase10Artifact = z.infer<typeof phase10Schema>;
