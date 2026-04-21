/**
 * Phase 12a — FFBD Handoff (C7 split: handoff half)
 *
 * Emits the compact operational primitives downstream FFBD / decision-
 * matrix / QFD consumers need to ground sizing math (Little's Law inputs
 * per plan §4.5.4). Per C8, 6 primitives are required on the envelope;
 * per my locked 4/6 subfield-math density decision, the 4 numeric
 * primitives (`actions_per_uc`, `bytes_in_per_action`,
 * `bytes_out_per_action`, `freq_per_dau`) each require a
 * `math_derivation`. `session_shape` (structural subshape) and
 * `data_objects[]` (non-numeric) are exempt.
 *
 * @module lib/langchain/schemas/module-2/phase-12-ffbd-handoff
 */

import { z } from 'zod';
import { phaseEnvelopeSchema, mathDerivationSchema } from './_shared';

/** Per-session structural shape (non-numeric — exempt from math gate). */
export const sessionShapeSchema = z
  .object({
    duration_s: z
      .number()
      .positive()
      .describe(
        'x-ui-surface=section:Sizing > Operational Primitives — typical session length in seconds.',
      ),
    actions_count: z
      .number()
      .int()
      .nonnegative()
      .describe(
        'x-ui-surface=section:Sizing > Operational Primitives — distinct actions per session.',
      ),
    burstiness: z
      .enum(['steady', 'bursty', 'spiky'])
      .describe(
        'x-ui-surface=section:Sizing > Operational Primitives — qualitative inter-arrival pattern.',
      ),
    think_time_s: z
      .number()
      .nonnegative()
      .optional()
      .describe(
        'x-ui-surface=section:Sizing > Operational Primitives — average inter-action think time.',
      ),
  })
  .describe(
    'x-ui-surface=section:Sizing > Operational Primitives — session-shape subshape (structural — no math gate per 4/6 density).',
  );
export type SessionShape = z.infer<typeof sessionShapeSchema>;

/** Data-object descriptor carried into the FFBD handoff. */
export const dataObjectSchema = z
  .object({
    name: z
      .string()
      .describe(
        'x-ui-surface=section:Sizing > Operational Primitives — data object name (e.g., "Reading", "Alert").',
      ),
    avg_size_bytes: z
      .number()
      .positive()
      .optional()
      .describe(
        'x-ui-surface=section:Sizing > Operational Primitives — avg serialized size in bytes.',
      ),
    persistence: z
      .enum(['ephemeral', 'cached', 'durable', 'archived'])
      .optional()
      .describe(
        'x-ui-surface=section:Sizing > Operational Primitives — where this object lives in the storage hierarchy.',
      ),
  })
  .describe(
    'x-ui-surface=section:Sizing > Operational Primitives — one data object (structural — no math gate per 4/6 density).',
  );

/**
 * Numeric primitive with attached math. Re-usable across the 4 numeric
 * primitives (actions_per_uc, bytes_in/out_per_action, freq_per_dau).
 */
function numericPrimitive(description: string) {
  return z
    .object({
      value: z
        .number()
        .nonnegative()
        .describe(`x-ui-surface=section:Sizing > Operational Primitives — ${description}`),
      unit: z
        .string()
        .describe(
          'x-ui-surface=section:Sizing > Operational Primitives — unit for the value (e.g., "actions", "bytes", "events/day").',
        ),
      math_derivation: mathDerivationSchema.describe(
        'x-ui-surface=section:Requirement Detail > Design Rationale — required math derivation (4/6 density).',
      ),
    })
    .describe(`x-ui-surface=section:Sizing > Operational Primitives — ${description}`);
}

export const operationalPrimitivesSchema = z
  .object({
    actions_per_uc: numericPrimitive(
      'avg number of actor actions required to complete one UC instance',
    ),
    bytes_in_per_action: numericPrimitive(
      'avg request payload size (actor → system) per action',
    ),
    bytes_out_per_action: numericPrimitive(
      'avg response payload size (system → actor) per action',
    ),
    freq_per_dau: numericPrimitive(
      'avg frequency an active daily user performs this UC',
    ),
    session_shape: sessionShapeSchema,
    data_objects: z
      .array(dataObjectSchema)
      .default([])
      .describe(
        'x-ui-surface=section:Sizing > Operational Primitives — data objects this UC touches.',
      ),
  })
  .describe(
    'x-ui-surface=section:Sizing > Operational Primitives — Little\'s Law inputs + session/data shape (C8; 4/6 subfield math density).',
  );
export type OperationalPrimitives = z.infer<typeof operationalPrimitivesSchema>;

export const phase12HandoffSchema = phaseEnvelopeSchema.extend({
  uc_id: z
    .string()
    .regex(/^(UC[0-9]{2}|CC)$/)
    .describe(
      'x-ui-surface=section:UC Overview > Header — UC this handoff packet describes (per C12).',
    ),
  operational_primitives: operationalPrimitivesSchema,
});
export type Phase12HandoffArtifact = z.infer<typeof phase12HandoffSchema>;
