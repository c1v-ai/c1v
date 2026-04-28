/**
 * Phase 18 — Applying the Decision Matrix to Software System Decisions
 *
 * For software-architecture decisions, attaches a `software_arch_decision`
 * per criterion linking to the 12-member KB enum from M2 `_shared.ts`
 * (cap_theorem, caching, load_balancing, resiliency, api_design,
 * observability, maintainability, cdn_networking, message_queues,
 * data_model, deployment_cicd, none). Reuses the M2 decision primitive so
 * rationale + tradeoffs + alternatives_rejected stay consistent across the
 * codebase.
 *
 * @module lib/langchain/schemas/module-4/phase-18-software-specific-dm
 */

import { z } from 'zod';
import { module4PhaseEnvelopeSchema } from './_shared';
import { softwareArchDecisionSchema } from '../module-2/_shared';

export const softwareCriterionLinkageSchema = z
  .object({
    criterion_id: z
      .string()
      .regex(/^PC-[0-9]{2}$/),
    software_arch_decision: softwareArchDecisionSchema.describe(
      'x-ui-surface=section:Software-Specific DM > Row > Design Rationale — KB-grounded design decision (12-ref enum from M2 flag A).',
    ),
    applies_to_option_ids: z
      .array(z.string().regex(/^[A-Z]$/))
      .min(1)
      .describe(
        'x-ui-surface=section:Software-Specific DM > Row — option(s) this decision binds to (all options when the decision is common; subset when only some options implement the pattern).',
      ),
  })
  .describe(
    'x-ui-surface=section:Software-Specific DM > Row — links a PC to a software-arch KB decision.',
  );
export type SoftwareCriterionLinkage = z.infer<typeof softwareCriterionLinkageSchema>;

export const phase18Schema = module4PhaseEnvelopeSchema.extend({
  software_criterion_linkages: z
    .array(softwareCriterionLinkageSchema)
    .describe(
      'x-ui-surface=page:/projects/[id]/system-design/decision-matrix/software-arch — criterion→KB linkages (may be empty for non-software decisions).',
    ),
  is_software_decision: z
    .boolean()
    .describe(
      'x-ui-surface=section:Software-Specific DM > Header — true when this DM is a software architecture decision; false for non-software (e.g., hardware, org).',
    ),
});
export type Phase18Artifact = z.infer<typeof phase18Schema>;
