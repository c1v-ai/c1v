/**
 * Module 5 Phase 7 — Form-Function Handoff (top-level `form_function_map.v1`).
 *
 * Composes phases 1-6 into the canonical artifact. Enforces:
 *   - Surjectivity: every function in phase 2 is covered by ≥1 form in phase 1
 *     whose `realizes_functions` includes it.
 *   - Cell referential integrity: every phase-3 cell's (F.NN, FR.NN) pair
 *     resolves in phases 1 & 2.
 *   - Scored-cell coverage: every phase-3 cell has exactly one matching
 *     phase-4 scored_cell.
 *   - Alternative coverage: every phase-6 decomposition's function exists
 *     in phase 2.
 *
 * FMEA redundancy soft-dep: if phase 1 has any form with `redundancy_source_fm`,
 * at least one of its `realizes_functions` MUST appear at least twice in
 * phase-1 forms (primary + redundant). Verifier checks this cross-artifact
 * against fmea_early.v1 candidate_mitigation strings.
 *
 * @module lib/langchain/schemas/module-5/phase-7-form-function-handoff
 */

import { z } from 'zod';
import { decisionAuditRowSchema } from './_shared';
import { phase1FormInventorySchema } from './phase-1-form-inventory';
import { phase2FunctionInventorySchema } from './phase-2-function-inventory';
import { phase3ConceptMappingMatrixSchema } from './phase-3-concept-mapping-matrix';
import { phase4ConceptQualityScoringSchema } from './phase-4-concept-quality-scoring';
import { phase5OperandProcessCatalogSchema } from './phase-5-operand-process-catalog';
import { phase6ConceptAlternativesSchema } from './phase-6-concept-alternatives';

const baseFormFunctionMapSchema = z.object({
  _schema: z.literal('module-5.form-function-map.v1'),
  _output_path: z.string(),
  _upstream_refs: z.object({
    ffbd: z.string(),
    fmea_early: z.string(),
    nfrs: z.string(),
    constants: z.string().optional(),
  }),
  produced_at: z.string(),
  produced_by: z.string(),
  system_name: z.string(),
  phase_1_form_inventory: phase1FormInventorySchema,
  phase_2_function_inventory: phase2FunctionInventorySchema,
  phase_3_concept_mapping_matrix: phase3ConceptMappingMatrixSchema,
  phase_4_concept_quality_scoring: phase4ConceptQualityScoringSchema,
  phase_5_operand_process_catalog: phase5OperandProcessCatalogSchema,
  phase_6_concept_alternatives: phase6ConceptAlternativesSchema,
  decision_audit: z.array(decisionAuditRowSchema).default([]),
});

export const formFunctionMapV1Schema = baseFormFunctionMapSchema.superRefine((val, ctx) => {
  const formIds = new Set(val.phase_1_form_inventory.forms.map((f) => f.id));
  const functionIds = new Set(val.phase_2_function_inventory.functions.map((f) => f.id));

  // Surjectivity: every function must be realized by ≥1 form.
  const realized = new Set<string>();
  for (const form of val.phase_1_form_inventory.forms) {
    for (const fnId of form.realizes_functions) {
      realized.add(fnId);
    }
  }
  for (const fnId of functionIds) {
    if (!realized.has(fnId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Surjectivity violation: function ${fnId} has no realizing form.`,
        path: ['phase_1_form_inventory', 'forms'],
      });
    }
  }
  // realizes_functions referential integrity.
  for (const form of val.phase_1_form_inventory.forms) {
    for (const fnId of form.realizes_functions) {
      if (!functionIds.has(fnId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Form ${form.id} realizes unknown function ${fnId}.`,
          path: ['phase_1_form_inventory', 'forms'],
        });
      }
    }
  }
  // Cell referential integrity + scored-cell coverage.
  const cellKey = (fn: string, fr: string) => `${fn}::${fr}`;
  const phase3Keys = new Set<string>();
  for (const cell of val.phase_3_concept_mapping_matrix.cells) {
    if (!functionIds.has(cell.function_id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Cell references unknown function ${cell.function_id}.`,
        path: ['phase_3_concept_mapping_matrix', 'cells'],
      });
    }
    if (!formIds.has(cell.form_id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Cell references unknown form ${cell.form_id}.`,
        path: ['phase_3_concept_mapping_matrix', 'cells'],
      });
    }
    phase3Keys.add(cellKey(cell.function_id, cell.form_id));
  }
  const phase4Keys = new Set<string>();
  for (const sc of val.phase_4_concept_quality_scoring.scored_cells) {
    phase4Keys.add(cellKey(sc.function_id, sc.form_id));
  }
  for (const k of phase3Keys) {
    if (!phase4Keys.has(k)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Phase-3 cell ${k} has no matching phase-4 scored_cell.`,
        path: ['phase_4_concept_quality_scoring', 'scored_cells'],
      });
    }
  }
  for (const k of phase4Keys) {
    if (!phase3Keys.has(k)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Phase-4 scored_cell ${k} has no matching phase-3 cell.`,
        path: ['phase_4_concept_quality_scoring', 'scored_cells'],
      });
    }
  }
  // Phase 5: operand entries function_id resolves.
  for (const op of val.phase_5_operand_process_catalog.entries) {
    if (!functionIds.has(op.function_id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Operand entry references unknown function ${op.function_id}.`,
        path: ['phase_5_operand_process_catalog', 'entries'],
      });
    }
  }
  // Phase 6: decompositions + alternative forms resolve.
  for (const d of val.phase_6_concept_alternatives.decompositions) {
    if (!functionIds.has(d.function_id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Decomposition references unknown function ${d.function_id}.`,
        path: ['phase_6_concept_alternatives', 'decompositions'],
      });
    }
    for (const a of d.alternatives) {
      if (!formIds.has(a.form_id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Alternative references unknown form ${a.form_id}.`,
          path: ['phase_6_concept_alternatives', 'decompositions'],
        });
      }
    }
  }
  // Redundancy soft-dep: forms carrying redundancy_source_fm must have
  // a sibling primary form covering at least one shared function.
  const functionCoverage = new Map<string, number>();
  for (const form of val.phase_1_form_inventory.forms) {
    for (const fnId of form.realizes_functions) {
      functionCoverage.set(fnId, (functionCoverage.get(fnId) ?? 0) + 1);
    }
  }
  for (const form of val.phase_1_form_inventory.forms) {
    if (!form.redundancy_source_fm) continue;
    const ok = form.realizes_functions.some((fn) => (functionCoverage.get(fn) ?? 0) >= 2);
    if (!ok) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Redundant form ${form.id} (from ${form.redundancy_source_fm}) has no primary sibling covering any of its functions.`,
        path: ['phase_1_form_inventory', 'forms'],
      });
    }
  }
});
export type FormFunctionMapV1 = z.infer<typeof formFunctionMapV1Schema>;

/** Thin marker for registry indexing. */
export const phase7FormFunctionHandoffSchema = formFunctionMapV1Schema;
export type Phase7FormFunctionHandoff = FormFunctionMapV1;
