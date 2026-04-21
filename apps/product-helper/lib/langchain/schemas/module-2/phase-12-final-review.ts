/**
 * Phase 12b — Final Review (C7 split: review half)
 *
 * Separate from the FFBD handoff because the consumers differ: final
 * review is human-facing; the handoff feeds downstream agents. Captures
 * a coarse project-level verdict plus a list of open `review_flags[]`
 * the reviewer wants addressed before Module 2 is declared done.
 *
 * @module lib/langchain/schemas/module-2/phase-12-final-review
 */

import { z } from 'zod';
import { phaseEnvelopeSchema, sourceRefSchema } from './_shared';

export const reviewVerdictSchema = z.enum([
  'approved',
  'approved_with_notes',
  'revisions_requested',
  'blocked',
]);

export const reviewFlagSchema = z
  .object({
    flag_id: z
      .string()
      .describe(
        'x-ui-surface=section:Review > Flags — reviewer-assigned flag id (e.g., "RF-01").',
      ),
    severity: z
      .enum(['info', 'warn', 'error', 'critical'])
      .describe(
        'x-ui-surface=section:Review > Flags — triage severity.',
      ),
    message: z
      .string()
      .describe(
        'x-ui-surface=section:Review > Flags — reviewer-facing summary of the flag.',
      ),
    target: sourceRefSchema
      .optional()
      .describe(
        'x-ui-surface=section:Review > Flags — artifact this flag points at (C11 provenance primitive).',
      ),
    suggested_fix: z
      .string()
      .optional()
      .describe(
        'x-ui-surface=section:Review > Flags — one-line fix proposal.',
      ),
  })
  .describe(
    'x-ui-surface=section:Review > Flags — one reviewer-raised flag on the Module 2 output.',
  );

export const phase12FinalReviewSchema = phaseEnvelopeSchema.extend({
  verdict: reviewVerdictSchema.describe(
    'x-ui-surface=section:Review > Verdict — coarse project-level verdict.',
  ),
  verdict_rationale: z
    .string()
    .describe(
      'x-ui-surface=section:Review > Verdict — one-paragraph justification.',
    ),
  review_flags: z
    .array(reviewFlagSchema)
    .default([])
    .describe(
      'x-ui-surface=section:Review > Flags — open flags the reviewer wants addressed.',
    ),
  reviewer: z
    .string()
    .describe(
      'x-ui-surface=section:Review > Verdict — reviewer identifier (human or agent).',
    ),
  reviewed_at: z
    .string()
    .describe(
      'x-ui-surface=section:Review > Verdict — ISO-8601 timestamp of the review.',
    ),
});
export type Phase12FinalReviewArtifact = z.infer<typeof phase12FinalReviewSchema>;
