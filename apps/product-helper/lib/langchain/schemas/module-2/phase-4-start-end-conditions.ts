/**
 * Phase 4 — Start / End Conditions (extends Phase 3 UCBD per C3)
 *
 * Each UCBD in Phase 4 is a superset of the Phase 3 header: adds
 * preconditions (must-hold-at-trigger), postconditions (must-hold-at-exit),
 * and explicit exit-criteria the Phase 5 step flow must satisfy.
 *
 * The `.extend()` chain at the UCBD level guarantees a Phase 5 artifact
 * still parses as Phase 4, and a Phase 4 artifact still parses as Phase 3.
 *
 * @module lib/langchain/schemas/module-2/phase-4-start-end-conditions
 */

import { z } from 'zod';
import { phaseEnvelopeSchema } from './_shared';
import { ucbdHeaderSchema } from './phase-3-ucbd-setup';

/** A pre/postcondition clause — free-text predicate + optional citation. */
export const conditionClauseSchema = z
  .object({
    clause: z
      .string()
      .describe(
        'x-ui-surface=section:UC Overview > Start/End Conditions — natural-language predicate (e.g., "User is authenticated").',
      ),
    source: z
      .string()
      .optional()
      .describe(
        'x-ui-surface=section:Requirement Detail > Provenance — source of this clause (vision / interview / kb section).',
      ),
  })
  .describe(
    'x-ui-surface=section:UC Overview > Start/End Conditions — one pre- or post-condition clause.',
  );

export const ucbdPhase4Schema = ucbdHeaderSchema.extend({
  preconditions: z
    .array(conditionClauseSchema)
    .default([])
    .describe(
      'x-ui-surface=section:UC Overview > Start/End Conditions — clauses that must hold when `trigger` fires.',
    ),
  postconditions: z
    .array(conditionClauseSchema)
    .default([])
    .describe(
      'x-ui-surface=section:UC Overview > Start/End Conditions — clauses that must hold at successful exit.',
    ),
  exit_criteria: z
    .array(z.string())
    .default([])
    .describe(
      'x-ui-surface=section:UC Overview > Start/End Conditions — testable criteria Phase 5 step flow must prove.',
    ),
});
export type UcbdPhase4 = z.infer<typeof ucbdPhase4Schema>;

export const phase4Schema = phaseEnvelopeSchema.extend({
  ucbds: z
    .array(ucbdPhase4Schema)
    .describe(
      'x-ui-surface=page:/projects/[id]/requirements/use-cases — full UCBD set with start/end conditions layered on.',
    ),
});
export type Phase4Artifact = z.infer<typeof phase4Schema>;
