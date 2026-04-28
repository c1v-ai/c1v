/**
 * Module 6 — HoQ Phase 3: Relationship Matrix (Main Floor).
 *
 * The PC times EC body of the House of Quality. Every cell is an integer in
 * {-2, -1, 0, +1, +2} indicating how strongly a given EC affects a given
 * PC, sign-aware (positive = improves the PC, negative = degrades it).
 *
 * Sparsity gate (per legacy methodology): nonzero_cells / total_cells must
 * meet sparsity_floor_pct (default 25 percent).
 *
 * Coverage gates:
 *   - every PC row MUST have one or more nonzero cells
 *   - every EC column MUST have one or more nonzero cells OR appear in flagged_ec_no_pc
 *
 * @module lib/langchain/schemas/module-6-hoq/phase-3-relationship-matrix
 */

import { z } from 'zod';

export const relationshipValueSchema = z
  .number()
  .int()
  .refine((v) => [-2, -1, 0, 1, 2].includes(v), {
    message: 'relationship value must be one of {-2,-1,0,1,2}',
  })
  .describe(
    'x-ui-surface=section:HoQ > Main Floor — single PC times EC cell value in {-2..+2}.',
  );

export const relationshipRowSchema = z
  .object({
    pc_id: z.string().regex(/^PC\.\d{1,2}$/),
    cells: z
      .record(z.string().regex(/^EC\d{1,2}$/), relationshipValueSchema)
      .describe(
        'x-ui-surface=section:HoQ > Main Floor — { "EC1": v, "EC2": v, ... } mapping for this PC row.',
      ),
  })
  .describe(
    'x-ui-surface=section:HoQ > Main Floor — single PC row across all EC columns.',
  );
export type RelationshipRow = z.infer<typeof relationshipRowSchema>;

export const relationshipMatrixArtifactSchema = z
  .object({
    _phase: z.literal('module-6.phase-3.relationship-matrix.v1'),
    pc_order: z
      .array(z.string().regex(/^PC\.\d{1,2}$/))
      .min(1)
      .describe(
        'x-ui-surface=internal:hoq-validator — canonical PC ordering for the matrix rows.',
      ),
    ec_order: z
      .array(z.number().int().min(1).max(99))
      .min(1)
      .describe(
        'x-ui-surface=internal:hoq-validator — canonical EC integer ordering for the matrix columns.',
      ),
    rows: z.array(relationshipRowSchema).min(1),
    sparsity_floor_pct: z.number().min(0).max(100).default(25),
    flagged_ec_no_pc: z
      .array(
        z.object({
          ec_id: z.number().int().min(1).max(99),
          rationale: z.string().min(10),
        }),
      )
      .default([])
      .describe(
        'x-ui-surface=section:HoQ > Validation — ECs intentionally not driven by any PC (compliance / hygiene only).',
      ),
    stats: z
      .object({
        total_cells: z.number().int().nonnegative(),
        nonzero_cells: z.number().int().nonnegative(),
        sparsity_pct: z.number(),
        meets_sparsity_threshold: z.boolean(),
        rows_without_nonzero: z.array(z.string()),
        cols_without_nonzero: z.array(z.number().int()),
      })
      .describe(
        'x-ui-surface=section:HoQ > Validation — coverage and sparsity statistics.',
      ),
  })
  .superRefine((v, ctx) => {
    const ecSet = new Set(v.ec_order);
    const pcSet = new Set(v.pc_order);
    let total = 0;
    let nonzero = 0;
    const rowsWithoutNonzero: string[] = [];
    const colsHit = new Set<number>();

    if (v.rows.length !== v.pc_order.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['rows'],
        message: `rows.length=${v.rows.length} != pc_order.length=${v.pc_order.length}`,
      });
    }

    for (const row of v.rows) {
      if (!pcSet.has(row.pc_id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['rows'],
          message: `row pc_id ${row.pc_id} not in pc_order`,
        });
      }
      let rowHasNonzero = false;
      for (const ec of v.ec_order) {
        const key = `EC${ec}`;
        const val = row.cells[key] ?? 0;
        total += 1;
        if (val !== 0) {
          nonzero += 1;
          rowHasNonzero = true;
          colsHit.add(ec);
        }
      }
      for (const k of Object.keys(row.cells)) {
        const m = /^EC(\d{1,2})$/.exec(k);
        if (!m || !ecSet.has(Number(m[1]))) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['rows'],
            message: `row ${row.pc_id} has cell ${k} not in ec_order`,
          });
        }
      }
      if (!rowHasNonzero) rowsWithoutNonzero.push(row.pc_id);
    }

    const colsWithoutNonzero = v.ec_order.filter((e) => !colsHit.has(e));
    const flaggedSet = new Set(v.flagged_ec_no_pc.map((f) => f.ec_id));
    for (const ec of colsWithoutNonzero) {
      if (!flaggedSet.has(ec)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['stats', 'cols_without_nonzero'],
          message: `EC${ec} has no nonzero cell and is not in flagged_ec_no_pc`,
        });
      }
    }
    if (rowsWithoutNonzero.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['stats', 'rows_without_nonzero'],
        message: `PCs missing any EC relationship: ${rowsWithoutNonzero.join(',')}`,
      });
    }

    const sparsity = total === 0 ? 0 : (1 - nonzero / total) * 100;
    const meets = nonzero / Math.max(1, total) >= v.sparsity_floor_pct / 100;

    if (v.stats.total_cells !== total) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['stats', 'total_cells'],
        message: `declared total_cells=${v.stats.total_cells} != computed=${total}`,
      });
    }
    if (v.stats.nonzero_cells !== nonzero) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['stats', 'nonzero_cells'],
        message: `declared nonzero_cells=${v.stats.nonzero_cells} != computed=${nonzero}`,
      });
    }
    if (Math.abs(v.stats.sparsity_pct - sparsity) > 0.5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['stats', 'sparsity_pct'],
        message: `declared sparsity_pct=${v.stats.sparsity_pct} != computed=${sparsity.toFixed(2)}`,
      });
    }
    if (v.stats.meets_sparsity_threshold !== meets) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['stats', 'meets_sparsity_threshold'],
        message: `meets_sparsity_threshold mismatch (declared=${v.stats.meets_sparsity_threshold} computed=${meets})`,
      });
    }
  })
  .describe(
    'x-ui-surface=page:/system-design/qfd — Phase-3 PC times EC relationship matrix artifact.',
  );
export type RelationshipMatrixArtifact = z.infer<
  typeof relationshipMatrixArtifactSchema
>;
