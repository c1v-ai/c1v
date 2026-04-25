/**
 * Module 6 — HoQ Phase 5: Target Values (Basement targets + difficulty/cost).
 *
 * For each EC, fixes the engineering target value (with unit), the
 * external-threshold (regulatory or platform-imposed ceiling/floor), the
 * estimated technical difficulty (1-5) and estimated cost (1-5).
 *
 * Target values MUST trace to a `constants.v2.json::constant_name` if the
 * EC was derived from a constant (Phase 2 derivation kind = "constant").
 *
 * @module lib/langchain/schemas/module-6-hoq/phase-5-target-values
 */

import { z } from 'zod';

export const targetValueRowSchema = z
  .object({
    ec_id: z.number().int().min(1).max(99),
    unit: z.string().min(1),
    target: z
      .union([z.number(), z.string()])
      .describe(
        'x-ui-surface=section:HoQ > Basement — engineering target (number when measurable; string when ordinal/qualitative).',
      ),
    external_threshold: z
      .string()
      .min(1)
      .describe(
        'x-ui-surface=section:HoQ > Basement — regulatory/platform-imposed ceiling or floor; "—" when none.',
      ),
    technical_difficulty: z
      .number()
      .int()
      .min(1)
      .max(5)
      .describe(
        'x-ui-surface=section:HoQ > Basement — estimated technical difficulty 1 (trivial) to 5 (research-grade).',
      ),
    estimated_cost: z
      .number()
      .int()
      .min(1)
      .max(5)
      .describe(
        'x-ui-surface=section:HoQ > Basement — estimated cost 1 (cheap) to 5 (very expensive).',
      ),
    constant_ref: z
      .string()
      .regex(/^[A-Z][A-Z0-9_]+$/)
      .nullable()
      .describe(
        'x-ui-surface=internal:hoq-trace — constants.v2 constant_name when target is constant-anchored, else null.',
      ),
    derivation_note: z.string().min(5),
  })
  .describe('x-ui-surface=section:HoQ > Basement — single EC target row.');
export type TargetValueRow = z.infer<typeof targetValueRowSchema>;

export const targetValuesArtifactSchema = z
  .object({
    _phase: z.literal('module-6.phase-5.target-values.v1'),
    rows: z.array(targetValueRowSchema).min(1),
  })
  .superRefine((v, ctx) => {
    const seen = new Set<number>();
    for (const r of v.rows) {
      if (seen.has(r.ec_id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['rows'],
          message: `duplicate ec_id ${r.ec_id}`,
        });
      }
      seen.add(r.ec_id);
    }
  })
  .describe(
    'x-ui-surface=page:/system-design/qfd — Phase-5 target values artifact.',
  );
export type TargetValuesArtifact = z.infer<typeof targetValuesArtifactSchema>;
