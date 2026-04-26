/**
 * Module 5 Phase 2 — Function Taxonomy (Crawley Ch 5).
 *
 * @module lib/langchain/schemas/module-5/phase-2-function-taxonomy
 * @kbSource apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/5-form-function/01-phase-docs/02-Phase-2-Function-Taxonomy.md
 * @since 2026-04-26
 * @evidenceTier curated
 *
 * Consumes Phase-1 form_entities + interfaces. Emits primary external function,
 * internal functions, functional interactions, PO array (matrix derivation via
 * mathDerivationMatrixSchema), value pathway.
 */

import { z } from 'zod';
import { phaseEnvelopeSchema, sourceRefSchema } from '../module-2/_shared';
import { mathDerivationMatrixSchema } from './_matrix';

// Crawley OPM arrow conventions; "consume" in prose maps to "destroy" here to keep
// functionalInteractionKindSchema ↔ poArrayCellSchema mapping 1:1.
export const functionalInteractionKindSchema = z
  .enum(['create', 'destroy', 'affect', 'instrument'])
  .describe(
    'x-ui-surface=section:Function Taxonomy > Interactions — Crawley Ch 5 OPM arrow convention.',
  );
export type FunctionalInteractionKind = z.infer<typeof functionalInteractionKindSchema>;

export const poArrayCellSchema = z
  .enum(['c', "c'", 'a', 'd', "d'", 'I', 'none'])
  .describe(
    'x-ui-surface=section:Function Taxonomy > PO Array — Crawley Box 5.7 cell notation.',
  );
export type PoArrayCell = z.infer<typeof poArrayCellSchema>;

export const interactionKindSchema = z
  .enum(['data', 'control'])
  .describe(
    'x-ui-surface=section:Function Taxonomy > Software Duality — data vs control-token operand.',
  );
export type InteractionKind = z.infer<typeof interactionKindSchema>;

export const primaryExternalFunctionSchema = z
  .object({
    operand: z.string().describe(
      'x-ui-surface=section:Function Taxonomy > Primary External Function — value-related operand (Table 5.2).',
    ),
    value_related_attribute: z.string().describe(
      'x-ui-surface=section:Function Taxonomy > Primary External Function — Table 5.2 col 2.',
    ),
    value_related_state: z.string().describe(
      'x-ui-surface=section:Function Taxonomy > Primary External Function — state value.',
    ),
    process: z.string().describe(
      'x-ui-surface=section:Function Taxonomy > Primary External Function — verb phrase (Table 5.2 col 3).',
    ),
    instrument_form_ref: z.string().describe(
      'x-ui-surface=internal:cross-phase-ref — object_id of a Phase-1 form_entity at Level 0 or 1.',
    ),
    boundary_interface_ref: z.string().describe(
      'x-ui-surface=internal:cross-phase-ref — interface_id of a Phase-1 interface record (Box 5.5).',
    ),
    replacement_test_answer: z.string().describe(
      'x-ui-surface=section:Function Taxonomy > Primary External Function — answer to line 2146 replacement test.',
    ),
  })
  .describe(
    'x-ui-surface=section:Function Taxonomy > Primary External Function — the one benefit-delivering function (Box 5.5).',
  );
export type PrimaryExternalFunction = z.infer<typeof primaryExternalFunctionSchema>;

export const internalFunctionSchema = z
  .object({
    function_id: z.string(),
    process: z.string().describe(
      'x-ui-surface=section:Function Taxonomy > Internal Functions — verb (Box 5.3).',
    ),
    operand: z.string().describe(
      'x-ui-surface=section:Function Taxonomy > Internal Functions — operand (Box 5.2).',
    ),
    instrument_form_ref: z.string().describe(
      'x-ui-surface=internal:cross-phase-ref — Phase-1 form_entity object_id.',
    ),
    blueprint_ref: z
      .enum([
        'transporting_mass',
        'transferring_information',
        'engaging_employee',
        'making_decision',
        'assembling_parts',
        'none',
      ])
      .default('none')
      .describe(
        'x-ui-surface=section:Function Taxonomy > Internal Functions — Box 5.6 Standard Blueprint reference.',
      ),
  })
  .describe(
    'x-ui-surface=section:Function Taxonomy > Internal Functions — one (process, operand, form) tuple.',
  );
export type InternalFunction = z.infer<typeof internalFunctionSchema>;

export const functionalInteractionSchema = z
  .object({
    interaction_id: z.string(),
    from_process_id: z.string(),
    to_process_id: z.string(),
    shared_operand: z.string(),
    relationship: functionalInteractionKindSchema,
    interaction_kind: interactionKindSchema.optional().describe(
      'x-ui-surface=section:Function Taxonomy > Software Duality — required for software-containing systems.',
    ),
  })
  .describe(
    'x-ui-surface=section:Function Taxonomy > Functional Interactions — shared/exchanged operand between two processes.',
  );
export type FunctionalInteraction = z.infer<typeof functionalInteractionSchema>;

export const poArrayRowSchema = z
  .object({
    process_id: z.string(),
    cells: z
      .record(z.string(), poArrayCellSchema)
      .describe(
        'x-ui-surface=internal:po-array — key = operand_id, value = cell notation.',
      ),
  })
  .describe(
    'x-ui-surface=section:Function Taxonomy > PO Array — one row of the Box 5.7 PO array.',
  );
export type PoArrayRow = z.infer<typeof poArrayRowSchema>;

export const valuePathwayStepSchema = z
  .object({
    step_index: z.number().int().min(0),
    process_id: z.string(),
    operand_id: z.string(),
    relationship: functionalInteractionKindSchema,
  })
  .describe(
    'x-ui-surface=section:Function Taxonomy > Value Pathway — one step from input to value-related output.',
  );
export type ValuePathwayStep = z.infer<typeof valuePathwayStepSchema>;

export const phase2FunctionTaxonomySchema = phaseEnvelopeSchema
  .extend({
    _schema: z.literal('module-5.phase-2-function-taxonomy.v1'),
    primary_external_function: primaryExternalFunctionSchema,
    secondary_external_functions: z
      .array(primaryExternalFunctionSchema)
      .default([])
      .describe(
        'x-ui-surface=section:Function Taxonomy > Secondary Functions — additive external functions (Q 5d).',
      ),
    internal_functions: z.array(internalFunctionSchema).min(1).describe(
      'x-ui-surface=section:Function Taxonomy > Internal Functions — first-level internal tuples.',
    ),
    functional_interactions: z.array(functionalInteractionSchema).default([]).describe(
      'x-ui-surface=section:Function Taxonomy > Functional Interactions — shared operands between processes.',
    ),
    po_array: z.array(poArrayRowSchema).default([]).describe(
      'x-ui-surface=section:Function Taxonomy > PO Array — Box 5.7 derived representation.',
    ),
    po_array_derivation: mathDerivationMatrixSchema.describe(
      'x-ui-surface=internal:math-derivation-resolver — PO array matrix derivation; Option Y (M5-local).',
    ),
    value_pathway: z.array(valuePathwayStepSchema).min(1).describe(
      'x-ui-surface=section:Function Taxonomy > Value Pathway — ordered steps from input to primary operand.',
    ),
    crawley_glossary_refs: z.array(sourceRefSchema).default([]).describe(
      'x-ui-surface=internal:provenance — cross-references into GLOSSARY-crawley.',
    ),
  })
  .describe('x-ui-surface=page-header — M5 Phase 2: function taxonomy per Crawley Ch 5.')
  .superRefine((val, ctx) => {
    // Value-pathway closure: must reach primary_external_function.operand.
    const endsAtPrimary = val.value_pathway.some(
      (step) => step.operand_id === val.primary_external_function.operand,
    );
    if (!endsAtPrimary) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['value_pathway'],
        message:
          'Value pathway must terminate at primary_external_function.operand (Crawley Ch 5 §5.3).',
      });
    }
    // PO-array causality: every c' must have a downstream a/d/I somewhere.
    for (const row of val.po_array) {
      for (const [operandId, cell] of Object.entries(row.cells)) {
        if (cell === "c'") {
          const hasDownstream = val.po_array.some(
            (other) =>
              other.process_id !== row.process_id &&
              (other.cells[operandId] === 'a' ||
                other.cells[operandId] === 'd' ||
                other.cells[operandId] === 'I'),
          );
          if (!hasDownstream) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['po_array'],
              message: `Orphan create at process "${row.process_id}" for operand "${operandId}" — every c' must have a downstream affect/destroy/instrument (Crawley Box 5.7).`,
            });
          }
        }
      }
    }
  });
export type Phase2FunctionTaxonomy = z.infer<typeof phase2FunctionTaxonomySchema>;
