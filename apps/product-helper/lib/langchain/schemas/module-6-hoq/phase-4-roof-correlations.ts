/**
 * Module 6 — HoQ Phase 4: Roof Correlations.
 *
 * Symmetric EC times EC correlation matrix. Per spec:
 *   - Stored as lower-triangle pairs only (legacy gen-qfd contract: key
 *     "EC{i}_EC{j}" with i<j; row j+2, col i+4 in xlsx).
 *   - Diagonal is null (an EC does not correlate with itself).
 *   - Cell values use the symbol space {++, +, 0, -, --} which maps
 *     1:1 to integers {2, 1, 0, -1, -2} for the legacy marshaller.
 *
 * Each non-zero pair MUST carry a rationale (audit-grade transparency for
 * downstream interface designers reading the roof for tradeoffs).
 *
 * @module lib/langchain/schemas/module-6-hoq/phase-4-roof-correlations
 */

import { z } from 'zod';

export const correlationSymbolSchema = z
  .enum(['++', '+', '0', '-', '--'])
  .describe(
    'x-ui-surface=section:HoQ > Roof — symbolic correlation strength {++,+,0,-,--}.',
  );
export type CorrelationSymbol = z.infer<typeof correlationSymbolSchema>;

export const SYMBOL_TO_INT: Record<CorrelationSymbol, number> = {
  '++': 2,
  '+': 1,
  '0': 0,
  '-': -1,
  '--': -2,
};

export const roofPairSchema = z
  .object({
    pair_key: z
      .string()
      .regex(/^EC(\d{1,2})_EC(\d{1,2})$/)
      .describe(
        'x-ui-surface=internal:hoq-roof — lower-triangle key "EC{i}_EC{j}" with i<j (legacy contract).',
      ),
    i: z.number().int().min(1).max(99),
    j: z.number().int().min(1).max(99),
    symbol: correlationSymbolSchema,
    integer_value: z.number().int().min(-2).max(2),
    rationale: z
      .string()
      .min(10)
      .describe(
        'x-ui-surface=section:HoQ > Roof — required justification for any nonzero correlation.',
      ),
  })
  .superRefine((v, ctx) => {
    if (v.i >= v.j) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['i'],
        message: `lower-triangle requires i<j (got i=${v.i}, j=${v.j})`,
      });
    }
    const expected = `EC${v.i}_EC${v.j}`;
    if (v.pair_key !== expected) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['pair_key'],
        message: `pair_key ${v.pair_key} does not match (i,j)=(${v.i},${v.j}); expected ${expected}`,
      });
    }
    if (SYMBOL_TO_INT[v.symbol] !== v.integer_value) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['integer_value'],
        message: `integer_value ${v.integer_value} does not map to symbol ${v.symbol}`,
      });
    }
  })
  .describe(
    'x-ui-surface=section:HoQ > Roof — single lower-triangle EC times EC pair.',
  );
export type RoofPair = z.infer<typeof roofPairSchema>;

export const roofCorrelationsArtifactSchema = z
  .object({
    _phase: z.literal('module-6.phase-4.roof-correlations.v1'),
    ec_axis: z
      .array(z.number().int().min(1).max(99))
      .min(2)
      .describe(
        'x-ui-surface=internal:hoq-validator — ordered EC integer axis (must be a permutation of phase-2 ec_order).',
      ),
    pairs: z.array(roofPairSchema).default([]),
    stats: z.object({
      total_lower_triangle_pairs: z.number().int().nonnegative(),
      nonzero_pairs: z.number().int().nonnegative(),
      nonzero_pct: z.number(),
      tradeoffs_flagged_for_design_targets: z
        .array(z.string().regex(/^EC\d{1,2}_EC\d{1,2}$/))
        .default([]),
    }),
  })
  .superRefine((v, ctx) => {
    const axisSet = new Set(v.ec_axis);
    const seen = new Set<string>();
    let nonzero = 0;
    for (const p of v.pairs) {
      if (!axisSet.has(p.i) || !axisSet.has(p.j)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['pairs'],
          message: `pair ${p.pair_key} references EC outside ec_axis`,
        });
      }
      if (seen.has(p.pair_key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['pairs'],
          message: `duplicate pair_key ${p.pair_key}`,
        });
      }
      seen.add(p.pair_key);
      if (p.integer_value !== 0) nonzero += 1;
    }
    const n = v.ec_axis.length;
    const expectedTotal = (n * (n - 1)) / 2;
    if (v.stats.total_lower_triangle_pairs !== expectedTotal) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['stats', 'total_lower_triangle_pairs'],
        message: `expected ${expectedTotal} lower-triangle slots, got declared ${v.stats.total_lower_triangle_pairs}`,
      });
    }
    if (v.stats.nonzero_pairs !== nonzero) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['stats', 'nonzero_pairs'],
        message: `declared nonzero_pairs=${v.stats.nonzero_pairs} != computed=${nonzero}`,
      });
    }
    const computedPct = expectedTotal === 0 ? 0 : (nonzero / expectedTotal) * 100;
    if (Math.abs(v.stats.nonzero_pct - computedPct) > 0.5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['stats', 'nonzero_pct'],
        message: `declared nonzero_pct=${v.stats.nonzero_pct} != computed=${computedPct.toFixed(2)}`,
      });
    }
  })
  .describe(
    'x-ui-surface=page:/system-design/qfd — Phase-4 roof correlations artifact.',
  );
export type RoofCorrelationsArtifact = z.infer<
  typeof roofCorrelationsArtifactSchema
>;
