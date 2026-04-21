/**
 * Phase 3 — UCBD Setup (base of the C3 .extend() stack)
 *
 * Emits one UCBD header per prioritized use case from Phase 1. Phase 4 layers
 * start/end conditions on top via `.extend()`; Phase 5 layers step flow on
 * top of Phase 4. Compile-time guarantee: any artifact parseable as a later
 * phase also satisfies the earlier phase's shape.
 *
 * @module lib/langchain/schemas/module-2/phase-3-ucbd-setup
 */

import { z } from 'zod';
import { phaseEnvelopeSchema, sourceRefSchema } from './_shared';

/** UC priority label carried from Phase 1 (MoSCoW). */
export const ucPrioritySchema = z.enum(['must', 'should', 'could', 'wont']);

/** UC id pattern — caps at UC99 per C12; revisit if count approaches 80. */
export const ucIdSchema = z
  .string()
  .regex(/^(UC[0-9]{2}|CC)$/)
  .describe(
    'x-ui-surface=section:UC Overview > Header — stable UC identifier ("UC01".."UC99" or "CC" for cross-cutting).',
  );

export const ucbdHeaderSchema = z
  .object({
    uc_id: ucIdSchema,
    uc_name: z
      .string()
      .describe(
        'x-ui-surface=section:UC Overview > Header — concise, verb-first UC title.',
      ),
    actor: z
      .string()
      .describe(
        'x-ui-surface=section:UC Overview > Header — primary actor performing the UC.',
      ),
    trigger: z
      .string()
      .describe(
        'x-ui-surface=section:UC Overview > Context — event that starts the UC.',
      ),
    priority: ucPrioritySchema.describe(
      'x-ui-surface=section:UC Overview > Header — MoSCoW priority carried from Phase 1.',
    ),
    actor_goal: z
      .string()
      .describe(
        'x-ui-surface=section:UC Overview > Context — value the actor expects from completing the UC.',
      ),
    also_appears_in: z
      .array(sourceRefSchema)
      .default([])
      .describe(
        'x-ui-surface=section:Requirement Detail > Provenance — other phases that reference this UCBD (C11).',
      ),
  })
  .describe(
    'x-ui-surface=section:UC Overview > Header — one UCBD header per prioritized UC.',
  );
export type UcbdHeader = z.infer<typeof ucbdHeaderSchema>;

export const phase3Schema = phaseEnvelopeSchema.extend({
  ucbds: z
    .array(ucbdHeaderSchema)
    .describe(
      'x-ui-surface=page:/projects/[id]/requirements/use-cases — full UCBD header set after Phase 3 setup.',
    ),
});
export type Phase3Artifact = z.infer<typeof phase3Schema>;
