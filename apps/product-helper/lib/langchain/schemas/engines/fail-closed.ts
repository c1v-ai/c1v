/**
 * Fail-closed rule schema.
 *
 * Rules are parsed from a phase markdown's §5 block (per
 * `plans/kb-runtime-architecture.md` §2.3) and fed to
 * `engines/fail-closed-runner.ts` as a typed rule set.
 *
 * A rule is a named constraint over an artifact output. Each rule declares:
 *   - `id`                  stable identifier (UPPER_SNAKE_CASE)
 *   - `description`         human-readable intent (surfaced in violation messages)
 *   - `check`               the constraint (discriminated union)
 *   - `severity`            'error' (gates the write) | 'warn' (logs, does not gate)
 *
 * The runner defaults to FAIL on missing rules — callers must pass an empty
 * array explicitly to opt out of validation.
 *
 * @module lib/langchain/schemas/engines/fail-closed
 */

import { z } from 'zod';

const severitySchema = z.enum(['error', 'warn']);

const fieldNonEmptyCheck = z.object({
  kind: z.literal('field_non_empty'),
  field: z.string().min(1),
});

const fieldMatchesCheck = z.object({
  kind: z.literal('field_matches'),
  field: z.string().min(1),
  pattern: z.string().min(1),
});

const fieldEqualsCheck = z.object({
  kind: z.literal('field_equals'),
  field: z.string().min(1),
  value: z.union([z.string(), z.number(), z.boolean(), z.null()]),
});

const fieldInCheck = z.object({
  kind: z.literal('field_in'),
  field: z.string().min(1),
  values: z.array(z.union([z.string(), z.number()])).min(1),
});

const fieldRangeCheck = z.object({
  kind: z.literal('field_range'),
  field: z.string().min(1),
  min: z.number().optional(),
  max: z.number().optional(),
});

const arrayMinLengthCheck = z.object({
  kind: z.literal('array_min_length'),
  field: z.string().min(1),
  min: z.number().int().nonnegative(),
});

const fieldsRequiredTogetherCheck = z.object({
  kind: z.literal('fields_required_together'),
  fields: z.array(z.string().min(1)).min(2),
});

export const failClosedCheckSchema = z.discriminatedUnion('kind', [
  fieldNonEmptyCheck,
  fieldMatchesCheck,
  fieldEqualsCheck,
  fieldInCheck,
  fieldRangeCheck,
  arrayMinLengthCheck,
  fieldsRequiredTogetherCheck,
]);

export type FailClosedCheck = z.infer<typeof failClosedCheckSchema>;

export const failClosedRuleSchema = z.object({
  id: z.string().min(1).regex(/^[A-Z][A-Z0-9_]*$/u, 'id must be UPPER_SNAKE_CASE'),
  description: z.string().min(1),
  check: failClosedCheckSchema,
  severity: severitySchema.default('error'),
});

export type FailClosedRule = z.infer<typeof failClosedRuleSchema>;

export const failClosedRuleSetSchema = z.object({
  artifact_key: z.string().min(1),
  rules: z.array(failClosedRuleSchema),
});

export type FailClosedRuleSet = z.infer<typeof failClosedRuleSetSchema>;

export const failClosedViolationSchema = z.object({
  rule_id: z.string().min(1),
  description: z.string(),
  severity: severitySchema,
  field: z.string().optional(),
  observed: z.unknown().optional(),
  reason: z.string(),
});

export type FailClosedViolation = z.infer<typeof failClosedViolationSchema>;

export const failClosedResultSchema = z.object({
  passed: z.boolean(),
  violations: z.array(failClosedViolationSchema),
});

export type FailClosedResult = z.infer<typeof failClosedResultSchema>;
