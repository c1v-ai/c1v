/**
 * Phase 7 — Requirements Rules Audit (C4 consumer)
 *
 * Extends `requirementRowBaseObject` with an audit verdict per row and
 * aggregated audit metadata at the envelope level. Re-applies the flag-B
 * NUMERIC_ONLY math gate via `applyNumericMathGate` so the extension
 * doesn't silently drop the refinement.
 *
 * @module lib/langchain/schemas/module-2/phase-7-rules-audit
 */

import { z } from 'zod';
import { phaseEnvelopeSchema } from './_shared';
import { requirementRowBaseObject, applyNumericMathGate } from './requirements-table-base';

export const violationSeveritySchema = z.enum(['info', 'warn', 'error', 'critical']);

export const auditViolationSchema = z
  .object({
    rule_id: z
      .string()
      .describe(
        'x-ui-surface=section:Audit > Violations — rule identifier (e.g., "R-TESTABLE-001").',
      ),
    severity: violationSeveritySchema.describe(
      'x-ui-surface=section:Audit > Violations — severity class for this violation.',
    ),
    message: z
      .string()
      .describe(
        'x-ui-surface=section:Audit > Violations — human-facing explanation.',
      ),
  })
  .describe(
    'x-ui-surface=section:Audit > Violations — one audit violation found on a requirement row.',
  );

export const phase7RowSchema = applyNumericMathGate(
  requirementRowBaseObject.extend({
    audit_pass: z
      .boolean()
      .describe(
        'x-ui-surface=section:Audit > Verdict — true iff no error/critical violations on this row.',
      ),
    violations: z
      .array(auditViolationSchema)
      .default([])
      .describe(
        'x-ui-surface=section:Audit > Violations — violations found on this row during the audit pass.',
      ),
  }),
);
export type Phase7Row = z.infer<typeof phase7RowSchema>;

export const phase7Schema = phaseEnvelopeSchema.extend({
  rows: z
    .array(phase7RowSchema)
    .describe(
      'x-ui-surface=page:/projects/[id]/requirements — requirements annotated with audit results.',
    ),
  audit_rule_set_version: z
    .string()
    .describe(
      'x-ui-surface=section:Audit > Metadata — version of the rule set the audit ran against.',
    ),
});
export type Phase7Artifact = z.infer<typeof phase7Schema>;
