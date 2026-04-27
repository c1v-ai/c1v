/**
 * Module 5 — Matrix-valued math derivation primitive.
 *
 * @module lib/langchain/schemas/module-5/_matrix
 * @source REQUIREMENTS-crawley §5 (matrix-valued derivations + locality rule)
 * @kbSource plans/crawley-sys-arch-strat-prod-dev/REQUIREMENTS-crawley.md §5
 * @since 2026-04-26
 * @evidenceTier curated
 * @consumers `module-5/phase-2-function-taxonomy.ts` (`po_array_derivation`, 1 site) + `module-5/phase-3-form-function-concept.ts` (`full_dsm_block_derivations`, 9 sites). Sentinel keystone — exported separately as `CRAWLEY_MATRIX_KEYSTONE` (NOT in the `CRAWLEY_SCHEMAS` phase-artifact registry).
 * @driftPolicy quarterly (Jan 1 / Apr 1 / Jul 1 / Oct 1 @ 00:00 UTC) via `apps/product-helper/scripts/quarterly-drift-check.ts`; LangSmith project `c1v-v2-eval`. See `.github/workflows/quarterly-drift-check.yml` for the cron expression. Promotion to `_shared.ts` triggered when a 3rd non-M5 site emerges (locality rule, REQUIREMENTS-crawley §5).
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
