/**
 * Module 5 Phase 4 — Solution-Neutral Concept (Crawley Ch 7).
 *
 * @module lib/langchain/schemas/module-5/phase-4-solution-neutral-concept
 * @kbSource apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/5-form-function/01-phase-docs/04-Phase-4-Solution-Neutral-Concept.md
 * @since 2026-04-26
 * @evidenceTier curated
 *
 * 7-field solution-neutral function + concept triads + morphological matrix
 * (≥ 2 integrated_concepts) + concept of operations + optional intent hierarchy.
 */

import { z } from 'zod';
import { phaseEnvelopeSchema, sourceRefSchema } from '../module-2/_shared';

export const conceptNamingConventionSchema = z
  .enum([
    'operand_process_instrument',
    'operand_process',
    'operand_instrument',
    'process_instrument',
    'process',
    'instrument',
  ])
  .describe(
    'x-ui-surface=section:Solution-Neutral Concept > Naming — Crawley Table 7.5 six conventions.',
  );
export type ConceptNamingConvention = z.infer<typeof conceptNamingConventionSchema>;

export const operandSpecializationKindSchema = z
  .enum([
    'different_operand_different_process',
    'different_operand_same_process',
    'part_of',
    'type_of',
    'attribute_of',
    'informational_object_of_attribute',
  ])
  .describe(
    'x-ui-surface=section:Solution-Neutral Concept > Specialization — Crawley Box 7.3 operand patterns.',
  );
export type OperandSpecializationKind = z.infer<typeof operandSpecializationKindSchema>;

export const processSpecializationKindSchema = z
  .enum(['different_process', 'type_of_process', 'added_attribute'])
  .describe(
    'x-ui-surface=section:Solution-Neutral Concept > Specialization — Crawley Box 7.3 process patterns.',
  );
export type ProcessSpecializationKind = z.infer<typeof processSpecializationKindSchema>;

export const solutionNeutralFunctionSchema = z
  .object({
    beneficiary: z.string().describe(
      'x-ui-surface=section:Solution-Neutral Concept > Intent — Q7a.1 beneficiary.',
    ),
    need: z.string().describe(
      'x-ui-surface=section:Solution-Neutral Concept > Intent — Q7a.2 need of beneficiary.',
    ),
    solution_neutral_operand: z.string(),
    benefit_related_attribute: z.string(),
    other_operand_attributes: z.array(z.string()).default([]),
    solution_neutral_process: z.string(),
    process_attributes: z.array(z.string()).default([]),
    intent_statement: z.string().describe(
      'x-ui-surface=section:Solution-Neutral Concept > Intent — composed single-sentence statement.',
    ),
  })
  .describe(
    'x-ui-surface=section:Solution-Neutral Concept > Intent — 7-field solution-neutral functional intent (Q 7a).',
  );
export type SolutionNeutralFunction = z.infer<typeof solutionNeutralFunctionSchema>;

export const conceptSchema = z
  .object({
    concept_id: z.string(),
    specific_operand: z.string(),
    specific_process: z.string(),
    specific_instrument: z.string(),
    operand_specialization_kind: operandSpecializationKindSchema,
    process_specialization_kind: processSpecializationKindSchema,
    concept_naming_convention: conceptNamingConventionSchema,
    concept_name: z.string(),
    source_process_id: z.string().describe(
      'x-ui-surface=internal:cross-phase-ref — Phase-2 internal_function this concept specializes.',
    ),
  })
  .describe(
    'x-ui-surface=section:Solution-Neutral Concept > Concept — one specific-operand/process/instrument triad (Box 7.2).',
  );
export type Concept = z.infer<typeof conceptSchema>;

export const integratedConceptSchema = z
  .object({
    concept_name: z.string(),
    selections: z
      .record(z.string(), z.string())
      .describe(
        'x-ui-surface=section:Solution-Neutral Concept > Morphological Matrix — processId → instrumentId selection.',
      ),
    aggregate_rationale: z.string(),
  })
  .describe(
    'x-ui-surface=section:Solution-Neutral Concept > Integrated Concepts — one column/merged-set of the morphological matrix.',
  );
export type IntegratedConcept = z.infer<typeof integratedConceptSchema>;

export const morphologicalMatrixSchema = z
  .object({
    internal_processes: z.array(z.string()).min(1),
    instruments_per_process: z.record(z.string(), z.array(z.string())),
    integrated_concepts: z.array(integratedConceptSchema).min(2).describe(
      'x-ui-surface=section:Solution-Neutral Concept > Morphological Matrix — at least 2 alternatives required.',
    ),
  })
  .describe(
    'x-ui-surface=section:Solution-Neutral Concept > Morphological Matrix — Crawley §7.4.',
  );
export type MorphologicalMatrix = z.infer<typeof morphologicalMatrixSchema>;

export const conceptOfOperationsSchema = z
  .object({
    sequence: z
      .array(z.string())
      .min(2)
      .describe(
        'x-ui-surface=section:Solution-Neutral Concept > Conops — time-ordered phase labels.',
      ),
    operator_actions: z.array(
      z.object({
        actor: z.string(),
        action: z.string(),
        step_index: z.number().int().nonnegative(),
      }),
    ),
    coordinated_systems: z.array(z.string()).default([]),
    good_or_service: z.enum(['good', 'service']),
    ownership_inversion_note: z.string().optional(),
  })
  .describe(
    'x-ui-surface=section:Solution-Neutral Concept > Conops — Crawley §7.5.',
  );
export type ConceptOfOperations = z.infer<typeof conceptOfOperationsSchema>;

export const intentHierarchyLevelSchema = z
  .object({
    level_name: z.string(),
    functional_intent: z.string(),
  })
  .describe(
    'x-ui-surface=section:Solution-Neutral Concept > Intent Hierarchy — one level in Crawley §7.3 up/down hierarchy.',
  );
export type IntentHierarchyLevel = z.infer<typeof intentHierarchyLevelSchema>;

export const phase4SolutionNeutralConceptSchema = phaseEnvelopeSchema
  .extend({
    _schema: z.literal('module-5.phase-4-solution-neutral-concept.v1'),
    solution_neutral_function: solutionNeutralFunctionSchema,
    concepts: z.array(conceptSchema).min(1),
    morphological_matrix: morphologicalMatrixSchema,
    hierarchy_up: intentHierarchyLevelSchema.optional(),
    hierarchy_down: intentHierarchyLevelSchema.optional(),
    concept_of_operations: conceptOfOperationsSchema,
    crawley_glossary_refs: z.array(sourceRefSchema).default([]),
  })
  .describe(
    'x-ui-surface=page-header — M5 Phase 4: solution-neutral function + concept triad per Crawley Ch 7.',
  )
  .superRefine((val, ctx) => {
    // Solution-neutral process must NOT equal any specific_process (Box 7.1).
    const snProc = val.solution_neutral_function.solution_neutral_process.toLowerCase().trim();
    for (const concept of val.concepts) {
      const sp = concept.specific_process.toLowerCase().trim();
      if (snProc === sp) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['concepts'],
          message: `Crawley Box 7.1: solution-neutral process "${val.solution_neutral_function.solution_neutral_process}" literally equals specific_process of concept "${concept.concept_name}".`,
        });
      }
    }
    // Conops sequence cannot equal the concept name verbatim.
    const primaryConceptName = val.concepts[0]?.concept_name.toLowerCase().trim();
    const joined = val.concept_of_operations.sequence.join(' ').toLowerCase().trim();
    if (primaryConceptName && joined === primaryConceptName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['concept_of_operations', 'sequence'],
        message:
          'Crawley §7.5: conops must add time-sequence information beyond the concept itself.',
      });
    }
    // Service conops requires ownership_inversion_note.
    if (
      val.concept_of_operations.good_or_service === 'service' &&
      !val.concept_of_operations.ownership_inversion_note
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['concept_of_operations', 'ownership_inversion_note'],
        message:
          'Crawley §7.5: a service transfers function — must document ownership inversion.',
      });
    }
  });
export type Phase4SolutionNeutralConcept = z.infer<typeof phase4SolutionNeutralConceptSchema>;
