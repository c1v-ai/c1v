/**
 * Fail-closed rule runner.
 *
 * Per `plans/kb-runtime-architecture.md` §2.3 (Output guardrails / safety),
 * every KB-phase artifact carries a set of fail-closed rules declared in
 * its markdown §5 block. The runner evaluates each rule against the
 * candidate output and returns a structured pass/fail + violation list.
 *
 * Design contracts:
 *   - Default FAIL on missing rules — callers registering an artifact with
 *     no rules must pass an empty array explicitly. An unregistered
 *     artifact_key throws (conservative; missing rules are a config error).
 *   - Error-severity violations flip `passed` to false. Warn-severity
 *     violations are surfaced but do not gate the write.
 *   - Pure function. No I/O. Safe to call from any layer.
 *
 * @module lib/langchain/engines/fail-closed-runner
 */

import {
  type FailClosedRule,
  type FailClosedRuleSet,
  type FailClosedResult,
  type FailClosedViolation,
  failClosedRuleSetSchema,
} from '../schemas/engines/fail-closed';

export type FailClosedRuleRegistry = ReadonlyMap<string, FailClosedRuleSet>;

/**
 * Builds a rule registry from an array of rule sets. Validates shape via
 * Zod so authoring errors (unknown check kinds, malformed ids) surface at
 * load time rather than runtime.
 */
export function buildFailClosedRegistry(
  ruleSets: ReadonlyArray<unknown>,
): FailClosedRuleRegistry {
  const registry = new Map<string, FailClosedRuleSet>();
  for (const raw of ruleSets) {
    const parsed = failClosedRuleSetSchema.parse(raw);
    if (registry.has(parsed.artifact_key)) {
      throw new Error(
        `Duplicate fail-closed rule set for artifact_key=${parsed.artifact_key}`,
      );
    }
    registry.set(parsed.artifact_key, parsed);
  }
  return registry;
}

/**
 * Checks `output` against the fail-closed rule set registered for
 * `artifactKey`.
 *
 * Throws if `artifactKey` has no entry in the registry — fail-closed means
 * an unregistered artifact is treated as a config error, not an implicit
 * pass.
 */
export function checkFailClosedRules(
  artifactKey: string,
  output: unknown,
  registry: FailClosedRuleRegistry,
): FailClosedResult {
  const ruleSet = registry.get(artifactKey);
  if (!ruleSet) {
    throw new Error(
      `No fail-closed rule set registered for artifact_key=${artifactKey}. ` +
        `Register an explicit empty rule list to opt out.`,
    );
  }

  const violations: FailClosedViolation[] = [];
  for (const rule of ruleSet.rules) {
    const violation = evaluateRule(rule, output);
    if (violation) violations.push(violation);
  }

  const hasError = violations.some((v) => v.severity === 'error');
  return { passed: !hasError, violations };
}

// ──────────────────────────────────────────────────────────────────────────
// Per-rule evaluation
// ──────────────────────────────────────────────────────────────────────────

function evaluateRule(
  rule: FailClosedRule,
  output: unknown,
): FailClosedViolation | null {
  const { check } = rule;
  switch (check.kind) {
    case 'field_non_empty': {
      const value = getPath(output, check.field);
      if (isEmpty(value)) {
        return makeViolation(rule, check.field, value, 'field is empty or missing');
      }
      return null;
    }
    case 'field_matches': {
      const value = getPath(output, check.field);
      if (typeof value !== 'string') {
        return makeViolation(
          rule,
          check.field,
          value,
          `expected string, got ${typeOf(value)}`,
        );
      }
      let re: RegExp;
      try {
        re = new RegExp(check.pattern, 'u');
      } catch (err) {
        return makeViolation(
          rule,
          check.field,
          check.pattern,
          `invalid regex pattern: ${(err as Error).message}`,
        );
      }
      if (!re.test(value)) {
        return makeViolation(
          rule,
          check.field,
          value,
          `value does not match /${check.pattern}/`,
        );
      }
      return null;
    }
    case 'field_equals': {
      const value = getPath(output, check.field);
      if (value !== check.value) {
        return makeViolation(
          rule,
          check.field,
          value,
          `expected ${JSON.stringify(check.value)}, got ${JSON.stringify(value)}`,
        );
      }
      return null;
    }
    case 'field_in': {
      const value = getPath(output, check.field);
      if (
        !(typeof value === 'string' || typeof value === 'number') ||
        !check.values.includes(value as string | number)
      ) {
        return makeViolation(
          rule,
          check.field,
          value,
          `value not in allowed set [${check.values.join(', ')}]`,
        );
      }
      return null;
    }
    case 'field_range': {
      const value = getPath(output, check.field);
      if (typeof value !== 'number' || Number.isNaN(value)) {
        return makeViolation(
          rule,
          check.field,
          value,
          `expected number, got ${typeOf(value)}`,
        );
      }
      if (check.min !== undefined && value < check.min) {
        return makeViolation(rule, check.field, value, `${value} < min ${check.min}`);
      }
      if (check.max !== undefined && value > check.max) {
        return makeViolation(rule, check.field, value, `${value} > max ${check.max}`);
      }
      return null;
    }
    case 'array_min_length': {
      const value = getPath(output, check.field);
      if (!Array.isArray(value)) {
        return makeViolation(
          rule,
          check.field,
          value,
          `expected array, got ${typeOf(value)}`,
        );
      }
      if (value.length < check.min) {
        return makeViolation(
          rule,
          check.field,
          value.length,
          `array length ${value.length} < min ${check.min}`,
        );
      }
      return null;
    }
    case 'fields_required_together': {
      const present = check.fields.filter((f) => !isEmpty(getPath(output, f)));
      if (present.length > 0 && present.length < check.fields.length) {
        const missing = check.fields.filter((f) => !present.includes(f));
        return makeViolation(
          rule,
          check.fields.join(','),
          present,
          `when any of [${check.fields.join(', ')}] is present, all must be present; missing: [${missing.join(', ')}]`,
        );
      }
      return null;
    }
    default: {
      const _exhaustive: never = check;
      void _exhaustive;
      return null;
    }
  }
}

function makeViolation(
  rule: FailClosedRule,
  field: string | undefined,
  observed: unknown,
  reason: string,
): FailClosedViolation {
  return {
    rule_id: rule.id,
    description: rule.description,
    severity: rule.severity,
    field,
    observed,
    reason,
  };
}

// ──────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────

function getPath(obj: unknown, path: string): unknown {
  if (obj === null || obj === undefined) return undefined;
  const segments = path.split('.');
  let cursor: unknown = obj;
  for (const seg of segments) {
    if (cursor === null || cursor === undefined) return undefined;
    if (typeof cursor !== 'object') return undefined;
    cursor = (cursor as Record<string, unknown>)[seg];
  }
  return cursor;
}

function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value as object).length === 0;
  return false;
}

function typeOf(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}
