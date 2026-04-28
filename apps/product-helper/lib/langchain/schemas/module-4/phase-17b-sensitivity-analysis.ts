/**
 * Phase 17b — Sensitivity Analysis (T4b Wave 3).
 *
 * Note: numbered 17b to avoid collision with the existing phase-17
 * `dm-to-qfd-bridge` (legacy Cornell handoff, kept for dual-emit per v1
 * §11 R4). The decision-net sensitivity output ranks decision nodes by
 * variance σ² of the utility vector when criterion weights are perturbed
 * within a ±10% band.
 *
 * Deterministic re-run: given fixed weight-perturbation seed, the σ² ranks
 * must reproduce exactly. Verifier re-runs and diffs.
 *
 * @module lib/langchain/schemas/module-4/phase-17b-sensitivity-analysis
 */

import { z } from 'zod';
import { module4PhaseEnvelopeSchema, mathDerivationV2Schema } from './_shared';
import { decisionNodeIdSchema } from './phase-14-decision-nodes';

export const sensitivityEntrySchema = z
  .object({
    decision_node_id: decisionNodeIdSchema,
    variance: z
      .number()
      .min(0)
      .describe(
        'x-ui-surface=section:Sensitivity > Row — σ² of utility vector under weight perturbation.',
      ),
    rank: z.number().int().min(1),
    perturbation_band_pct: z.number().min(0).max(100).default(10),
    seed: z.number().int().describe(
      'x-ui-surface=internal:sensitivity — PRNG seed for reproducibility.',
    ),
    math_derivation: mathDerivationV2Schema,
  })
  .describe(
    'x-ui-surface=section:Sensitivity > Row — one σ² entry per decision node, sorted by rank.',
  );
export type SensitivityEntry = z.infer<typeof sensitivityEntrySchema>;

export const phase17bSchema = module4PhaseEnvelopeSchema
  .extend({
    entries: z.array(sensitivityEntrySchema).min(1),
    method: z.literal('weight_perturbation_variance'),
    reproducibility_hash: z
      .string()
      .regex(/^[a-f0-9]{8,64}$/)
      .describe(
        'x-ui-surface=internal:sensitivity — deterministic hash of (inputs + seed + results) for verifier re-run check.',
      ),
  })
  .refine((s: { entries: Array<{ rank: number }> }) => {
    const ranks = s.entries.map((e) => e.rank).sort((a: number, b: number) => a - b);
    return ranks.every((r: number, i: number) => r === i + 1);
  }, { message: 'ranks must be 1..N contiguous' });
export type Phase17bArtifact = z.infer<typeof phase17bSchema>;
