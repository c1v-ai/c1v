/**
 * Phase 7 — Establishing Metric Conditions for Subjective Criteria
 *
 * For PCs that can't be directly measured (e.g., "developer experience",
 * "brand alignment"), this phase defines text-based anchors that reviewers
 * score against. Every subjective rubric MUST cite a `source_doc` (design
 * spec, brand guide, team charter) so scoring isn't vibes.
 *
 * @module lib/langchain/schemas/module-4/phase-7-subjective-rubric
 */

import { z } from 'zod';
import { module4PhaseEnvelopeSchema } from './_shared';

export const subjectiveRubricLevelSchema = z
  .object({
    level: z.number().int().min(1).max(5),
    description: z
      .string()
      .min(10)
      .describe(
        'x-ui-surface=section:Subjective Rubric > Row — text anchor for this level (e.g., "Level 4: Docs + runnable examples; onboarding <1hr for mid-level engineer").',
      ),
  });

export const subjectiveRubricSchema = z
  .object({
    criterion_id: z
      .string()
      .regex(/^PC-[0-9]{2}$/)
      .describe(
        'x-ui-surface=section:Subjective Rubric > Row — PC this rubric applies to (must be measure_type = "scaled" with a subjective category).',
      ),
    levels: z
      .array(subjectiveRubricLevelSchema)
      .length(5)
      .describe(
        'x-ui-surface=section:Subjective Rubric > Row — exactly 5 text anchors (level 1..5).',
      ),
    source_doc: z
      .string()
      .min(5)
      .describe(
        'x-ui-surface=section:Subjective Rubric > Row > Provenance — REQUIRED citation: design spec, brand guide, team charter, or other authority grounding the anchor text.',
      ),
    review_panel_size_target: z
      .number()
      .int()
      .min(3)
      .optional()
      .describe(
        'x-ui-surface=section:Subjective Rubric > Row — target number of reviewers scoring each option (≥3 to dilute individual bias).',
      ),
  })
  .describe(
    'x-ui-surface=section:Subjective Rubric > Row — one subjective PC rubric (text anchors with source_doc citation).',
  );
export type SubjectiveRubric = z.infer<typeof subjectiveRubricSchema>;

export const phase7Schema = module4PhaseEnvelopeSchema.extend({
  subjective_rubrics: z
    .array(subjectiveRubricSchema)
    .describe(
      'x-ui-surface=page:/projects/[id]/system-design/decision-matrix/subjective-rubric — rubrics for subjective PCs (may be empty when all criteria are objective).',
    ),
});
export type Phase7Artifact = z.infer<typeof phase7Schema>;
