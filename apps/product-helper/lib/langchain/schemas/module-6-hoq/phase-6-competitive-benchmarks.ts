/**
 * Module 6 — HoQ Phase 6: Competitive Benchmarks (Back Porch + Basement).
 *
 * Two layers of competitive comparison:
 *   - back_porch: per-PC customer-perception 1-5 ratings for our system A
 *     (with low/high/target spread) plus rating for each competitor.
 *   - basement_competitors: per-EC measured/estimated values for competitors.
 *
 * Per spec: at least 2 competitors must be present when an analogous
 * archetype exists in KB-8 (apps/product-helper/lib/langchain/schemas/
 * generated/atlas/). Each competitor entry MAY cite an atlas entry path
 * for traceability.
 *
 * @module lib/langchain/schemas/module-6-hoq/phase-6-competitive-benchmarks
 */

import { z } from 'zod';

export const competitorSchema = z
  .object({
    competitor_id: z
      .string()
      .regex(/^C\.\d{1,2}$/)
      .describe(
        'x-ui-surface=section:HoQ > Back Porch — stable C.N id (e.g., "C.1" = first competitor column).',
      ),
    name: z
      .string()
      .min(1)
      .describe(
        'x-ui-surface=section:HoQ > Back Porch — competitor display name (e.g., "Devin (Cognition)").',
      ),
    atlas_entry_ref: z
      .string()
      .nullable()
      .describe(
        'x-ui-surface=internal:hoq-trace — KB-8 atlas entry path when an analogous archetype exists; null when estimate-only.',
      ),
  })
  .describe('x-ui-surface=section:HoQ > Back Porch — single competitor identity.');
export type Competitor = z.infer<typeof competitorSchema>;

export const backPorchRowSchema = z
  .object({
    pc_id: z.string().regex(/^PC\.\d{1,2}$/),
    a_low: z.number().int().min(1).max(5),
    a_high: z.number().int().min(1).max(5),
    a_target: z.number().int().min(1).max(5),
    competitor_ratings: z
      .record(
        z.string().regex(/^C\.\d{1,2}$/),
        z.number().int().min(1).max(5),
      )
      .describe(
        'x-ui-surface=section:HoQ > Back Porch — { "C.1": rating, "C.2": rating, ... } 1-5 customer-perception scale.',
      ),
    rationale: z.string().min(10),
  })
  .superRefine((v, ctx) => {
    if (v.a_low > v.a_high) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['a_low'],
        message: `a_low (${v.a_low}) must be <= a_high (${v.a_high})`,
      });
    }
    if (v.a_target < v.a_low || v.a_target > v.a_high) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['a_target'],
        message: `a_target (${v.a_target}) must lie in [a_low,a_high]=[${v.a_low},${v.a_high}]`,
      });
    }
  })
  .describe('x-ui-surface=section:HoQ > Back Porch — single PC back-porch row.');
export type BackPorchRow = z.infer<typeof backPorchRowSchema>;

export const basementCompetitorRowSchema = z
  .object({
    ec_id: z.number().int().min(1).max(99),
    competitor_values: z
      .record(z.string().regex(/^C\.\d{1,2}$/), z.string().min(1))
      .describe(
        'x-ui-surface=section:HoQ > Basement — { "C.1": "value Est.", ... } as strings (allows units, "N/A", "Est." flags).',
      ),
  })
  .describe(
    'x-ui-surface=section:HoQ > Basement — single EC competitor-values row.',
  );
export type BasementCompetitorRow = z.infer<typeof basementCompetitorRowSchema>;

export const competitiveBenchmarksArtifactSchema = z
  .object({
    _phase: z.literal('module-6.phase-6.competitive-benchmarks.v1'),
    competitors: z.array(competitorSchema).min(2),
    back_porch: z.array(backPorchRowSchema).min(1),
    basement_competitors: z.array(basementCompetitorRowSchema).min(1),
  })
  .superRefine((v, ctx) => {
    const compIds = new Set(v.competitors.map((c) => c.competitor_id));
    if (compIds.size !== v.competitors.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['competitors'],
        message: 'duplicate competitor_id',
      });
    }
    for (const row of v.back_porch) {
      for (const cid of Object.keys(row.competitor_ratings)) {
        if (!compIds.has(cid)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['back_porch'],
            message: `back_porch row ${row.pc_id} rates unknown competitor ${cid}`,
          });
        }
      }
    }
    for (const row of v.basement_competitors) {
      for (const cid of Object.keys(row.competitor_values)) {
        if (!compIds.has(cid)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['basement_competitors'],
            message: `basement row EC${row.ec_id} cites unknown competitor ${cid}`,
          });
        }
      }
    }
  })
  .describe(
    'x-ui-surface=page:/system-design/qfd — Phase-6 competitive benchmarks artifact.',
  );
export type CompetitiveBenchmarksArtifact = z.infer<
  typeof competitiveBenchmarksArtifactSchema
>;
