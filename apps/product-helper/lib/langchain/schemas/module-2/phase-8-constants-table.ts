/**
 * Phase 8 — Constants Table (C4 consumer, flag A pilot)
 *
 * Every row in Phase 8 is a named numeric constant (e.g., AVAILABILITY_TARGET
 * = 99.9%). Extends the shared base with two optional enrichments:
 *
 *   - `software_arch_decision` — optional per-row KB-grounded rationale
 *     (12 canonical refs per flag A expansion).
 *   - `constant_name` — stable identifier used by downstream constants
 *     resolvers (xlsx/pdf marshallers).
 *
 * Retains the NUMERIC_ONLY math gate via `applyNumericMathGate`. Since
 * constants are overwhelmingly numeric (performance/reliability targets),
 * most Phase 8 rows will carry `math_derivation`.
 *
 * @module lib/langchain/schemas/module-2/phase-8-constants-table
 */

import { z } from 'zod';
import { phaseEnvelopeSchema, softwareArchDecisionSchema } from './_shared';
import { requirementRowBaseObject, applyNumericMathGate } from './requirements-table-base';

export const phase8RowSchema = applyNumericMathGate(
  requirementRowBaseObject.extend({
    constant_name: z
      .string()
      .regex(/^[A-Z][A-Z0-9_]*$/)
      .describe(
        'x-ui-surface=section:Requirement Detail > Header — SCREAMING_SNAKE constant identifier (e.g., AVAILABILITY_TARGET).',
      ),
    value: z
      .union([z.number(), z.string()])
      .describe(
        'x-ui-surface=section:Requirement Detail > Header — numeric or text-valued constant (see plan §4.5.4 text-constants rule).',
      ),
    unit: z
      .string()
      .optional()
      .describe(
        'x-ui-surface=section:Requirement Detail > Header — unit for numeric constants (e.g., "%", "ms", "req/s").',
      ),
    software_arch_decision: softwareArchDecisionSchema
      .optional()
      .describe(
        'x-ui-surface=section:Requirement Detail > Design Rationale — optional KB-grounded design decision (flag A — 12-ref enum).',
      ),
  }),
);
export type Phase8Row = z.infer<typeof phase8RowSchema>;

export const phase8Schema = phaseEnvelopeSchema.extend({
  constants_namespace: z
    .string()
    .describe(
      'x-ui-surface=section:Requirement Detail > Header — logical grouping namespace for these constants (e.g., "M2.NFR", "M2.COMPLIANCE").',
    ),
  rows: z
    .array(phase8RowSchema)
    .describe(
      'x-ui-surface=page:/projects/[id]/requirements/constants — constants table rows.',
    ),
});
export type Phase8Artifact = z.infer<typeof phase8Schema>;
