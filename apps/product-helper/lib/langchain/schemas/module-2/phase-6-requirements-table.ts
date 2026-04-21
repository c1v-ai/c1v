/**
 * Phase 6 — Requirements Table (first C4 consumer)
 *
 * Emits the initial extracted requirements set. Uses `requirementRowSchema`
 * directly with no additional row-level fields. Phase 7/8/9/11 layer on
 * per-row augmentations via `requirementRowBaseObject.extend(...)` +
 * `applyNumericMathGate(...)` to preserve the flag-B gate.
 *
 * @module lib/langchain/schemas/module-2/phase-6-requirements-table
 */

import { z } from 'zod';
import { phaseEnvelopeSchema } from './_shared';
import { requirementRowSchema } from './requirements-table-base';

export const phase6Schema = phaseEnvelopeSchema.extend({
  rows: z
    .array(requirementRowSchema)
    .describe(
      'x-ui-surface=page:/projects/[id]/requirements — initial extracted requirements set.',
    ),
});
export type Phase6Artifact = z.infer<typeof phase6Schema>;
