/**
 * Phases 11-13 Reworked — Vector Scores (T4b Wave 3).
 *
 * Wraps the legacy phase-11 (consensus) + phase-12 (bounds) + phase-13
 * (interpretation) artifacts with a vector-valued view. Legacy scalar
 * phases are retained (dual-emit per v1 §11 R4); this rework adds a
 * vector-score overlay that drives decision-net utility.
 *
 * Per-criterion vector: one entry per alternative.
 *
 * @module lib/langchain/schemas/module-4/phases-11-13-vector-scores
 */

import { z } from 'zod';
import { module4PhaseEnvelopeSchema, mathDerivationV2Schema } from './_shared';
import { alternativeIdSchema } from './phase-14-decision-nodes';

export const vectorScoreRowSchema = z
  .object({
    criterion_id: z.string().regex(/^PC-[0-9]{2}$/),
    values: z
      .array(
        z.object({
          alternative_id: alternativeIdSchema,
          normalized: z.number().min(0).max(1),
        }),
      )
      .min(2),
    weight: z.number().min(0).max(1),
    weighted_values: z.array(
      z.object({
        alternative_id: alternativeIdSchema,
        weighted: z.number(),
      }),
    ),
    math_derivation: mathDerivationV2Schema,
  })
  .describe(
    'x-ui-surface=section:Vector Scores > Row — per-criterion vector across alternatives.',
  );
export type VectorScoreRow = z.infer<typeof vectorScoreRowSchema>;

export const phases11to13VectorScoresSchema = module4PhaseEnvelopeSchema.extend(
  {
    rows: z.array(vectorScoreRowSchema).min(1),
    total_utility: z
      .array(
        z.object({
          alternative_id: alternativeIdSchema,
          utility: z.number(),
        }),
      )
      .min(2),
  },
);
export type Phases11to13VectorScoresArtifact = z.infer<
  typeof phases11to13VectorScoresSchema
>;
