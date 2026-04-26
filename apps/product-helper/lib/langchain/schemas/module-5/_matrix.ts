/**
 * Module 5 — Matrix-valued math derivation primitive.
 *
 * @module lib/langchain/schemas/module-5/_matrix
 * @kbSource plans/crawley-sys-arch-strat-prod-dev/REQUIREMENTS-crawley.md §5
 * @since 2026-04-26
 * @evidenceTier curated
 *
 * Sibling type to scalar `mathDerivationSchema`. Locality rule (REQUIREMENTS §5):
 * stays M5-local until a 3rd non-M5 site emerges. Consumers: M5 phase-2
 * (PO array, 1 derivation) + M5 phase-3 (full_dsm 9 block derivations).
 *
 * Shape-drift invariant: shape[0] = matrix.length AND shape[1] = matrix[0].length.
 */

import { z } from 'zod';
import { mathDerivationSchema } from '../module-2/_shared';

export const mathDerivationMatrixSchema = mathDerivationSchema
  .extend({
    result_kind: z.literal('matrix'),
    result_matrix: z.array(z.array(z.union([z.number(), z.string()]))),
    result_shape: z.tuple([z.number().int(), z.number().int()]),
    result_is_square: z.boolean(),
  })
  .superRefine((val, ctx) => {
    if (val.result_shape[0] !== val.result_matrix.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['result_shape'],
        message: `shape[0]=${val.result_shape[0]} != matrix rows=${val.result_matrix.length}`,
      });
    }
    const firstRowLen = val.result_matrix[0]?.length ?? 0;
    if (val.result_shape[1] !== firstRowLen) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['result_shape'],
        message: `shape[1]=${val.result_shape[1]} != matrix cols=${firstRowLen}`,
      });
    }
  });

export type MathDerivationMatrix = z.infer<typeof mathDerivationMatrixSchema>;
