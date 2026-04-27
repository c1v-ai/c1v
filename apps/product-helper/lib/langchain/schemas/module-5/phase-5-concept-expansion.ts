/**
 * Module 5 Phase 5 — Concept Expansion (Crawley Ch 8).
 *
 * @module lib/langchain/schemas/module-5/phase-5-concept-expansion
 * @kbSource apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/5-form-function/01-phase-docs/05-Phase-5-Concept-Expansion.md
 * @since 2026-04-26
 * @evidenceTier curated
 *
 * Level-1 + Level-2 expansions, Thebeau-style clustering analysis output, and
 * modularization-review state machine (phase-local; does not modify shared
 * phaseStatusSchema).
 */

import { z } from 'zod';
import { phaseEnvelopeSchema, sourceRefSchema } from '../module-2/_shared';

export const decompositionLevelSchema = z
  .number()
  .int()
  .min(1)
  .max(2)
  .describe(
    'x-ui-surface=section:Concept Expansion > Level — Crawley §8.3 line 3676 hard cap at 2.',
  );

export const clusteringBasisSchema = z
  .enum(['process_centric', 'form_centric_interactions', 'form_centric_structure'])
  .describe(
    'x-ui-surface=section:Concept Expansion > Clustering — Crawley Box 8.1 three-way choice.',
  );
export type ClusteringBasis = z.infer<typeof clusteringBasisSchema>;

export const modularizationReviewStateSchema = z
  .enum(['not_started', 'first_pass_complete', 'clustering_compared', 'revised', 'approved'])
  .describe(
    'x-ui-surface=section:Concept Expansion > Modularization Review — Crawley §8.5 phase-local review state.',
  );
export type ModularizationReviewState = z.infer<typeof modularizationReviewStateSchema>;

export const synthesisQuestionCoverageRowSchema = z
  .object({
    question_id: z.string(),
    phase_source: z.string(),
    field_reference: z.string(),
    awaiting_input: z.boolean(),
    note: z.string().optional(),
  })
  .describe(
    'x-ui-surface=internal:table-8-1-coverage — one row of Crawley Table 8.1 synthesis checklist.',
  );

export const level1ExpansionSchema = z
  .object({
    expansion_id: z.string(),
    source_concept_id: z.string(),
    inherited_intent: z.string(),
    decomposition_level: z.literal(1),
    level_1_internal_processes: z.array(z.string()).min(1),
    level_1_internal_operands: z.array(z.string()).default([]),
    level_1_form_decomposition: z.array(z.string()).default([]),
    non_idealities: z.array(z.string()).default([]),
    supporting_processes: z.array(z.string()).default([]),
    supporting_form: z.array(z.string()).default([]),
    interfaces: z.array(z.string()).default([]),
  })
  .describe(
    'x-ui-surface=section:Concept Expansion > Level 1 — Crawley §8.2 Level-0→Level-1 expansion record.',
  );

export const level2ExpansionSchema = z
  .object({
    expansion_id: z.string(),
    source_process_id: z.string(),
    inherited_intent: z.string(),
    decomposition_level: z.literal(2),
    level_2_internal_processes: z.array(z.string()).min(1),
    level_2_internal_operands: z.array(z.string()).default([]),
    level_2_form_decomposition: z.array(z.string()).default([]),
  })
  .describe(
    'x-ui-surface=section:Concept Expansion > Level 2 — Crawley §8.3 Level-2 expansion record.',
  );

export const clusterRecordSchema = z
  .object({
    cluster_name: z.string(),
    entity_ids: z.array(z.string()).min(1),
  })
  .describe(
    'x-ui-surface=section:Concept Expansion > Clusters — one cluster from the clustering algorithm.',
  );

export const clusteringAnalysisSchema = z
  .object({
    basis: clusteringBasisSchema,
    representation: z.object({
      matrix_source: z.enum(['po', 'pf', 'ff']),
      cell_suppression_applied: z.boolean(),
    }),
    algorithm: z.enum(['thebeau', 'other']),
    algorithm_reference: z.string(),
    clusters: z.array(clusterRecordSchema).min(1),
    time_based_vs_coupling_comparison: z
      .object({
        first_attempt_clusters: z.array(clusterRecordSchema),
        coupling_attempt_clusters: z.array(clusterRecordSchema),
        chosen: z.enum(['time_based', 'coupling_based']),
        chosen_rationale: z.string().min(1),
      })
      .describe(
        'x-ui-surface=section:Concept Expansion > Clustering — Crawley line 3776 two-way comparison.',
      ),
  })
  .describe(
    'x-ui-surface=section:Concept Expansion > Clustering — Crawley Box 8.1 output.',
  );

export const phase5ConceptExpansionSchema = phaseEnvelopeSchema
  .extend({
    _schema: z.literal('module-5.phase-5-concept-expansion.v1'),
    synthesis_question_coverage: z
      .array(synthesisQuestionCoverageRowSchema)
      .min(20)
      .describe(
        'x-ui-surface=section:Concept Expansion > Synthesis Checklist — Crawley Table 8.1 20 questions.',
      ),
    level_1_expansions: z.array(level1ExpansionSchema).min(1),
    level_2_expansions: z.array(level2ExpansionSchema).min(1),
    clustering_analysis: clusteringAnalysisSchema,
    modularization_review_state: modularizationReviewStateSchema,
    crawley_glossary_refs: z.array(sourceRefSchema).default([]),
  })
  .describe(
    'x-ui-surface=page-header — M5 Phase 5: concept expansion + modularization per Crawley Ch 8.',
  )
  .superRefine((val, ctx) => {
    // Review gate on complete.
    if (val._phase_status === 'complete' && val.modularization_review_state !== 'approved') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['modularization_review_state'],
        message:
          'Crawley §8.5: cannot mark _phase_status "complete" without modularization_review_state === "approved".',
      });
    }
    // Table 8.1 coverage on complete.
    if (val._phase_status === 'complete') {
      const awaiting = val.synthesis_question_coverage.filter((r) => r.awaiting_input);
      if (awaiting.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['synthesis_question_coverage'],
          message: `Crawley Table 8.1: ${awaiting.length} question(s) still awaiting input.`,
        });
      }
    }
    // Level-2 entity soft-warning (line 3676).
    const totalLevel2Entities = val.level_2_expansions.reduce(
      (acc, e) =>
        acc +
        e.level_2_internal_processes.length +
        e.level_2_internal_operands.length +
        e.level_2_form_decomposition.length,
      0,
    );
    if (totalLevel2Entities > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['level_2_expansions'],
        message: `Crawley §8.3 line 3676: Level-2 total entities = ${totalLevel2Entities}, above ~100 soft cap.`,
      });
    }
  });
export type Phase5ConceptExpansion = z.infer<typeof phase5ConceptExpansionSchema>;
