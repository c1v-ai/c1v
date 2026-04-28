/**
 * Predicate DSL — deterministic boolean evaluator for NFR engine rule trees.
 *
 * Two coexisting authoring styles are accepted so `engine.json` authors can
 * pick whichever reads cleanest for a given rule:
 *
 *   1. **Flat equality map** (the `engine.json` sample in
 *      `plans/schema-first-kb-rewrite-and-nfr-engine.md:131`):
 *      `{ user_type: 'consumer_app', flow_class: 'user_facing_sync' }`
 *      plus suffix-operators on the key:
 *      `{ regulatory_refs_contains: 'PCI-DSS' }`,
 *      `{ latency_budget_ms_lt: 500 }`,
 *      `{ user_type_in: ['consumer_app','enterprise_app'] }`,
 *      `{ qps_range: [100, 1000] }`.
 *
 *   2. **Operator objects** (for composition):
 *      `{ _and: [pred1, pred2] }`,
 *      `{ _or:  [pred1, pred2] }`,
 *      `{ _not: pred }`.
 *
 * Both styles can be mixed freely. An equality map with multiple keys is
 * treated as implicit `_and`.
 *
 * The evaluator is pure — no I/O, no LLM, no side effects. It is safe to
 * call from any layer.
 *
 * @module lib/langchain/engines/predicate-dsl
 */

/** Opaque context passed to every predicate evaluation. */
export type PredicateContext = Record<string, unknown>;

/** Allowed leaf values inside a predicate. */
export type PredicateLeaf = string | number | boolean | null | ReadonlyArray<string | number | boolean>;

/** Recursive predicate shape. Kept permissive (Record<string,unknown>) because JSON rule trees are authored by hand. */
export type Predicate = Record<string, unknown>;

// ──────────────────────────────────────────────────────────────────────────
// Suffix operators recognised on flat equality keys.
// ──────────────────────────────────────────────────────────────────────────

const SUFFIX_OPERATORS = [
  '_contains',
  '_not_contains',
  '_in',
  '_not_in',
  '_eq',
  '_neq',
  '_lt',
  '_lte',
  '_gt',
  '_gte',
  '_range',
  '_exists',
] as const;

type SuffixOperator = (typeof SUFFIX_OPERATORS)[number];

function splitSuffixOperator(
  key: string,
): { field: string; op: SuffixOperator } | null {
  for (const op of SUFFIX_OPERATORS) {
    if (key.endsWith(op) && key.length > op.length) {
      return { field: key.slice(0, -op.length), op };
    }
  }
  return null;
}

// ──────────────────────────────────────────────────────────────────────────
// Helpers.
// ──────────────────────────────────────────────────────────────────────────

function readField(ctx: PredicateContext, path: string): unknown {
  if (!path.includes('.')) return ctx[path];
  let cursor: unknown = ctx;
  for (const segment of path.split('.')) {
    if (cursor === null || cursor === undefined) return undefined;
    if (typeof cursor !== 'object') return undefined;
    cursor = (cursor as Record<string, unknown>)[segment];
  }
  return cursor;
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  return null;
}

function equalLoose(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a === 'number' && typeof b === 'number') return a === b;
  return false;
}

// ──────────────────────────────────────────────────────────────────────────
// Leaf operator evaluators.
// ──────────────────────────────────────────────────────────────────────────

function evalContains(fieldValue: unknown, expected: unknown): boolean {
  if (Array.isArray(fieldValue)) {
    return fieldValue.some((item) => equalLoose(item, expected));
  }
  if (typeof fieldValue === 'string' && typeof expected === 'string') {
    return fieldValue.includes(expected);
  }
  return false;
}

function evalIn(fieldValue: unknown, expected: unknown): boolean {
  if (!Array.isArray(expected)) return false;
  return expected.some((item) => equalLoose(item, fieldValue));
}

function evalRange(fieldValue: unknown, expected: unknown): boolean {
  if (!Array.isArray(expected) || expected.length !== 2) return false;
  const n = asNumber(fieldValue);
  const lo = asNumber(expected[0]);
  const hi = asNumber(expected[1]);
  if (n === null || lo === null || hi === null) return false;
  return n >= lo && n <= hi;
}

function evalExists(fieldValue: unknown, expected: unknown): boolean {
  const present = fieldValue !== undefined && fieldValue !== null;
  return Boolean(expected) ? present : !present;
}

function applySuffixOp(
  op: SuffixOperator,
  fieldValue: unknown,
  expected: unknown,
): boolean {
  switch (op) {
    case '_eq':
      return equalLoose(fieldValue, expected);
    case '_neq':
      return !equalLoose(fieldValue, expected);
    case '_contains':
      return evalContains(fieldValue, expected);
    case '_not_contains':
      return !evalContains(fieldValue, expected);
    case '_in':
      return evalIn(fieldValue, expected);
    case '_not_in':
      return !evalIn(fieldValue, expected);
    case '_lt': {
      const n = asNumber(fieldValue);
      const e = asNumber(expected);
      return n !== null && e !== null && n < e;
    }
    case '_lte': {
      const n = asNumber(fieldValue);
      const e = asNumber(expected);
      return n !== null && e !== null && n <= e;
    }
    case '_gt': {
      const n = asNumber(fieldValue);
      const e = asNumber(expected);
      return n !== null && e !== null && n > e;
    }
    case '_gte': {
      const n = asNumber(fieldValue);
      const e = asNumber(expected);
      return n !== null && e !== null && n >= e;
    }
    case '_range':
      return evalRange(fieldValue, expected);
    case '_exists':
      return evalExists(fieldValue, expected);
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Top-level evaluator.
// ──────────────────────────────────────────────────────────────────────────

/**
 * Evaluate a predicate against a context.
 *
 * Returns `true` iff every key in the predicate is satisfied (implicit AND).
 * Predicates with zero keys return `true` (matches the `{default: ...}`
 * semantics — you typically don't call this on a default, but the empty case
 * is defined for safety).
 */
export function evaluatePredicate(
  predicate: Predicate | null | undefined,
  context: PredicateContext,
): boolean {
  if (predicate === null || predicate === undefined) return true;
  if (typeof predicate !== 'object' || Array.isArray(predicate)) return false;

  for (const [key, rhs] of Object.entries(predicate)) {
    if (!evaluateClause(key, rhs, context)) return false;
  }
  return true;
}

function evaluateClause(
  key: string,
  rhs: unknown,
  context: PredicateContext,
): boolean {
  // Composition operators.
  if (key === '_and') {
    if (!Array.isArray(rhs)) return false;
    return rhs.every((p) =>
      evaluatePredicate(p as Predicate, context),
    );
  }
  if (key === '_or') {
    if (!Array.isArray(rhs)) return false;
    return rhs.some((p) =>
      evaluatePredicate(p as Predicate, context),
    );
  }
  if (key === '_not') {
    return !evaluatePredicate(rhs as Predicate, context);
  }

  // Suffix operator (e.g., "regulatory_refs_contains").
  const suffix = splitSuffixOperator(key);
  if (suffix) {
    const fieldValue = readField(context, suffix.field);
    return applySuffixOp(suffix.op, fieldValue, rhs);
  }

  // Flat equality key.
  const fieldValue = readField(context, key);

  // RHS as inline operator object: { field: { _gt: 5 } }.
  if (
    rhs !== null &&
    typeof rhs === 'object' &&
    !Array.isArray(rhs) &&
    Object.keys(rhs as object).every((k) => k.startsWith('_'))
  ) {
    for (const [inlineOp, inlineRhs] of Object.entries(
      rhs as Record<string, unknown>,
    )) {
      // The inline operator keys reuse the suffix-operator vocabulary
      // minus the "_" prefix split; accept them as-is.
      if (!SUFFIX_OPERATORS.includes(inlineOp as SuffixOperator)) return false;
      if (!applySuffixOp(inlineOp as SuffixOperator, fieldValue, inlineRhs)) {
        return false;
      }
    }
    return true;
  }

  return equalLoose(fieldValue, rhs);
}
