/**
 * Module 8 — FMEA (residual) v1 canonical
 *
 * Wave 4 FMEA-residual: re-scores failure modes against the CHOSEN
 * architecture (decision_network selected_architecture_id +
 * form_function_map + interface_specs). Every residual FM.NN MUST carry a
 * `predecessor_ref` linking it to either an `fmea_early` FM that survived
 * mitigation, or `'new'` for failure modes that ONLY emerge in the chosen
 * topology (e.g., cascade failures in chosen queue/event-bus). Detectability
 * + recoverability are RE-SCORED on the chosen forms — they are no longer
 * abstract, they live on concrete services in form_function_map.
 *
 * `flagged_high_rpn` is set when severity * likelihood * (1 / detectability)
 * exceeds residual.HIGH_RPN_FLAG_THRESHOLD — synthesizer (T6) embeds these
 * flags into HoQ + ADR escalation paths.
 *
 * @module lib/langchain/schemas/module-8-risk/fmea-residual
 */

import { z } from 'zod';
import { targetRefSchema } from './fmea-early';

/** Residual scoring is per the same rating_scales.json (severity 1-4, likelihood 1-5, detectability 1-5). */
export const HIGH_RPN_FLAG_THRESHOLD = 100;

/**
 * Predecessor link — either an fmea_early FM.NN id (mode survived
 * mitigation, possibly with new ratings) or the literal `'new'` (failure
 * mode only emerges from the chosen architecture).
 */
export const predecessorRefSchema = z
  .union([
    z.literal('new'),
    z.string().regex(/^FM\.\d{2,}$/, 'predecessor_ref must be "new" or fmea_early FM.NN id'),
  ])
  .describe('Either "new" (chosen-arch-only failure) or fmea_early FM.NN id.');
export type PredecessorRef = z.infer<typeof predecessorRefSchema>;

/**
 * Form ref — points into form_function_map.v1 phase_1_form_inventory.
 * Residual failure modes are scored against the CHOSEN form, so we anchor
 * each row to one or more FR.NN ids in addition to the function/interface.
 */
export const formRefSchema = z
  .object({
    form_id: z
      .string()
      .regex(/^FR\.\d{2,}$/)
      .describe('FR.NN id; MUST resolve in form_function_map.v1.'),
    role: z
      .enum(['primary', 'secondary', 'fallback', 'audit-cross-cut'])
      .describe('Role of this form for the residual failure mode.'),
  })
  .describe('Anchor to a chosen-architecture form (FR.NN).');
export type FormRef = z.infer<typeof formRefSchema>;

/**
 * Decision-network anchor — points to the architecture choice (DN.NN +
 * alternative_id) that introduced or transformed this residual mode. For
 * `predecessor_ref='new'` rows this is REQUIRED; for surviving early modes
 * it MAY be present when re-scoring is driven by a specific choice.
 */
export const decisionAnchorSchema = z
  .object({
    decision_node_id: z.string().regex(/^DN\.\d{2,}$/),
    alternative_id: z.string().min(1),
    architecture_vector_id: z
      .string()
      .regex(/^AV\.\d{2,}$/)
      .describe('Selected AV.NN from phase_16_pareto_frontier.'),
  })
  .describe('Anchor to chosen architecture vector + decision node.');
export type DecisionAnchor = z.infer<typeof decisionAnchorSchema>;

/**
 * Recoverability — new dimension only available once forms are concrete.
 * Higher = harder to recover after the failure fires.
 */
export const recoverabilitySchema = z
  .number()
  .int()
  .min(1)
  .max(5)
  .describe('1=auto-recover, 5=manual irreversible. Per rating_scales (residual extension).');

/**
 * Mitigation status — fmea_early `candidate_mitigation` rows were OPTIONS;
 * by Wave 4 some are committed (NFR-promoted, form-baked, or contract-
 * enforced) and others remain residual. This rolls that state up per FM.
 */
export const mitigationStatusSchema = z
  .enum(['none', 'committed', 'partial', 'deferred'])
  .describe(
    'none=no mitigation taken; committed=fully landed in form/contract/NFR; partial=some controls landed; deferred=accepted residual risk.',
  );

export const residualFailureModeSchema = z
  .object({
    id: z
      .string()
      .regex(/^FM\.\d{2,}$/)
      .describe('Stable failure-mode id FM.NN (residual numbering, may overlap early ids).'),
    predecessor_ref: predecessorRefSchema,
    target_ref: targetRefSchema,
    form_refs: z
      .array(formRefSchema)
      .min(1)
      .describe('At least one chosen-architecture form anchor (FR.NN).'),
    decision_anchor: decisionAnchorSchema.optional(),
    failure_mode: z.string(),
    potential_cause: z.string(),
    potential_effect: z.string(),
    severity: z.number().int().min(1).max(4),
    likelihood: z.number().int().min(1).max(5),
    detectability: z
      .number()
      .int()
      .min(1)
      .max(5)
      .describe('Re-scored on chosen forms (higher = harder to detect).'),
    recoverability: recoverabilitySchema,
    rpn: z
      .number()
      .int()
      .min(1)
      .max(20)
      .describe('severity * likelihood per rating_scales.rpn_matrix.'),
    weighted_rpn: z
      .number()
      .min(0)
      .describe('severity * likelihood * (1/detectability) — synthesizer flag input.'),
    criticality_category: z.enum([
      'LOW',
      'MEDIUM LOW',
      'MEDIUM',
      'MEDIUM HIGH',
      'HIGH',
    ]),
    flagged_high_rpn: z
      .boolean()
      .describe(
        'TRUE when severity*likelihood*recoverability*100/detectability > HIGH_RPN_FLAG_THRESHOLD; synthesizer escalates.',
      ),
    mitigation_status: mitigationStatusSchema,
    landed_controls: z
      .array(
        z.object({
          kind: z.enum(['nfr', 'form', 'interface_contract', 'audit_cross_cut']),
          ref: z
            .string()
            .describe('NFR.NN | FR.NN | IF.NN | CC.RNN — MUST resolve in upstream artifact for kind.'),
          summary: z.string().optional(),
        }),
      )
      .default([]),
    open_residual_risk: z
      .string()
      .optional()
      .describe('Plain-text description of what risk remains after landed controls.'),
    notes: z.string().optional(),
  })
  .describe('Single residual FMEA row scored on chosen architecture.');
export type ResidualFailureMode = z.infer<typeof residualFailureModeSchema>;

export const fmeaResidualSchema = z
  .object({
    _schema: z.literal('module-8.fmea-residual.v1'),
    _output_path: z.string(),
    _upstream_refs: z.object({
      fmea_early: z.string(),
      decision_network: z.string(),
      form_function_map: z.string(),
      interface_specs: z.string(),
      rating_scales: z.string(),
    }),
    produced_at: z.string(),
    produced_by: z.string(),
    system_name: z.string(),
    rating_scales_version: z.string(),
    selected_architecture_id: z
      .string()
      .regex(/^AV\.\d{2,}$/)
      .describe('Mirror of decision_network.selected_architecture_id.'),
    high_rpn_flag_threshold: z
      .number()
      .int()
      .min(1)
      .describe('Threshold for flagged_high_rpn (default 100, scaled by 100x).'),
    failure_modes: z.array(residualFailureModeSchema).min(1),
    summary: z
      .object({
        total: z.number().int().min(0),
        new_modes: z.number().int().min(0),
        surviving_modes: z.number().int().min(0),
        flagged_high_rpn: z.number().int().min(0),
        by_criticality: z
          .object({
            LOW: z.number().int().min(0),
            'MEDIUM LOW': z.number().int().min(0),
            MEDIUM: z.number().int().min(0),
            'MEDIUM HIGH': z.number().int().min(0),
            HIGH: z.number().int().min(0),
          })
          .describe('Histogram of residual rows by criticality_category.'),
      })
      .describe('Roll-up counts; synthesizer reads to populate HoQ rooms.'),
    xlsx_path: z
      .string()
      .optional()
      .describe(
        "Optional relative path to xlsx render via scripts/artifact-generators/gen-fmea.py with options.variant='residual'.",
      ),
  })
  .describe('Canonical FMEA-residual (v1) artifact.');
export type FmeaResidual = z.infer<typeof fmeaResidualSchema>;

/**
 * Compute weighted_rpn = severity * likelihood * (100 / detectability) so the
 * threshold is integer-comparable to HIGH_RPN_FLAG_THRESHOLD without losing
 * precision on detectability ∈ [1..5].
 */
export function computeWeightedRpn(
  severity: number,
  likelihood: number,
  detectability: number,
): number {
  if (detectability < 1) throw new Error('detectability must be >= 1');
  return (severity * likelihood * 100) / detectability;
}

export function shouldFlagHighRpn(
  severity: number,
  likelihood: number,
  detectability: number,
  threshold: number = HIGH_RPN_FLAG_THRESHOLD,
): boolean {
  return computeWeightedRpn(severity, likelihood, detectability) > threshold;
}
