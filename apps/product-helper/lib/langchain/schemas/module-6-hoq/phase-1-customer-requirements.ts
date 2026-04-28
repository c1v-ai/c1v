/**
 * Module 6 — HoQ Phase 1: Customer Requirements (Front Porch).
 *
 * Each PC.NN row is the "what" axis of the House of Quality. Customer
 * requirements MUST trace to a prioritized NFR (NFR.NN) from the M2
 * `nfrs.v2.json` artifact (T11 Wave-2-mid output). Per v2 §0.3.4 the
 * relative_importance MUST normalize to sum=1.0 across the front porch.
 *
 * Direction-of-change semantics (matches legacy gen-qfd.py marshaller):
 *   ↑ = bigger-is-better, ↓ = smaller-is-better, target = nominal-best.
 *
 * @module lib/langchain/schemas/module-6-hoq/phase-1-customer-requirements
 */

import { z } from 'zod';

export const directionOfChangeSchema = z
  .enum(['↑', '↓', 'target'])
  .describe(
    'x-ui-surface=section:HoQ > Front Porch — direction-of-change marker (↑/↓/target).',
  );
export type DirectionOfChange = z.infer<typeof directionOfChangeSchema>;

export const customerRequirementSchema = z
  .object({
    pc_id: z
      .string()
      .regex(/^PC\.\d{1,2}$/)
      .describe(
        'x-ui-surface=section:HoQ > Front Porch — stable PC.NN id (zero-padded ≥ 10).',
      ),
    full_attribute: z
      .string()
      .min(10)
      .describe(
        'x-ui-surface=section:HoQ > Front Porch — "The system shall ..." statement of the customer-perceived attribute.',
      ),
    short_name: z
      .string()
      .min(2)
      .max(40)
      .describe(
        'x-ui-surface=section:HoQ > Front Porch — short label rendered in the Excel front-porch column.',
      ),
    relative_importance: z
      .number()
      .min(0)
      .max(1)
      .describe(
        'x-ui-surface=section:HoQ > Front Porch — normalized [0,1]; sum across all rows MUST equal 1.0 (±1e-3 tolerance).',
      ),
    direction_of_change: directionOfChangeSchema,
    nfr_refs: z
      .array(z.string().regex(/^NFR\.\d{2,}$/))
      .min(1)
      .describe(
        'x-ui-surface=section:HoQ > Front Porch — REQUIRED traceback to ≥1 NFR.NN from m2 nfrs.v2.json.',
      ),
    derivation_note: z
      .string()
      .min(10)
      .describe(
        'x-ui-surface=section:HoQ > Front Porch — one-line rationale: which NFR(s) anchor this PC and why importance was set.',
      ),
  })
  .describe(
    'x-ui-surface=section:HoQ > Front Porch — single PC.NN row (the "what" axis).',
  );
export type CustomerRequirement = z.infer<typeof customerRequirementSchema>;

export const customerRequirementsArtifactSchema = z
  .object({
    _phase: z.literal('module-6.phase-1.customer-requirements.v1'),
    rows: z.array(customerRequirementSchema).min(1),
    weights_check: z
      .object({
        sum: z.number(),
        passes: z.boolean(),
        tolerance: z.number().default(1e-3),
        note: z.string().optional(),
      })
      .describe(
        'x-ui-surface=internal:hoq-validator — sum-to-one gate on relative_importance.',
      ),
  })
  .superRefine((v, ctx) => {
    const sum = v.rows.reduce((acc, r) => acc + r.relative_importance, 0);
    if (Math.abs(sum - 1.0) > (v.weights_check.tolerance ?? 1e-3)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['weights_check', 'sum'],
        message: `relative_importance sum=${sum.toFixed(4)} ≠ 1.0 (tolerance ${v.weights_check.tolerance})`,
      });
    }
    if (Math.abs(v.weights_check.sum - sum) > 1e-9) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['weights_check', 'sum'],
        message: `weights_check.sum mismatch: declared=${v.weights_check.sum} computed=${sum}`,
      });
    }
    const ids = new Set<string>();
    for (const r of v.rows) {
      if (ids.has(r.pc_id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['rows'],
          message: `duplicate pc_id ${r.pc_id}`,
        });
      }
      ids.add(r.pc_id);
    }
  })
  .describe(
    'x-ui-surface=page:/system-design/qfd — Phase-1 customer requirements artifact.',
  );
export type CustomerRequirementsArtifact = z.infer<
  typeof customerRequirementsArtifactSchema
>;
