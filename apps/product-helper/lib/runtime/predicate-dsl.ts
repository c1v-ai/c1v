/**
 * G3 Predicate DSL evaluator.
 *
 * Pure recursive interpreter over plain JSON rule objects. Rule source is
 * treated as data — no dynamic code execution (no eval, Function,
 * vm.runInNewContext). The operator whitelist below is the only dispatch
 * surface.
 *
 * Contract: {@link evaluatePredicate}(predicate, context) → PredicateResult.
 * A predicate is an object keyed by exactly one operator, with operator-
 * specific arguments. Logical operators (`_and`, `_or`, `_not`) nest
 * predicates; scalar/vector/graph/probabilistic operators are leaves.
 *
 * @module lib/runtime/predicate-dsl
 */

import type { PredicateResult } from './types';

/**
 * Evaluation context for the DSL — a shallow resolver over typed inputs.
 * The predicate references input fields with string paths (e.g.
 * `"inputs.user_type"` or `"inputs.utility_vector"`). The DSL never touches
 * KB chunks directly; content-level predicates receive resolved strings
 * from the caller.
 */
export interface DSLContext {
  inputs: Record<string, unknown>;
}

const SCALAR_OPS = ['_lt', '_gt', '_eq', '_lte', '_gte', '_neq', '_in', '_contains'] as const;
const VECTOR_OPS = ['_dot', '_norm', '_cosine'] as const;
const GRAPH_OPS = ['_dominates', '_frontier_check'] as const;
const PROB_OPS = ['_expected_value', '_variance'] as const;
const LOGIC_OPS = ['_and', '_or', '_not'] as const;

type ScalarOp = typeof SCALAR_OPS[number];
type VectorOp = typeof VECTOR_OPS[number];
type GraphOp = typeof GRAPH_OPS[number];
type ProbOp = typeof PROB_OPS[number];
type LogicOp = typeof LOGIC_OPS[number];
type Operator = ScalarOp | VectorOp | GraphOp | ProbOp | LogicOp;

const ALL_OPS: ReadonlySet<string> = new Set<string>([
  ...SCALAR_OPS,
  ...VECTOR_OPS,
  ...GRAPH_OPS,
  ...PROB_OPS,
  ...LOGIC_OPS,
]);

/**
 * Resolve a dotted path (e.g. `"inputs.user_type"`) against the DSL context.
 * Literal values (numbers, string literals prefixed with `$`, arrays) pass
 * through unchanged.
 */
export function resolveRef(ref: unknown, context: DSLContext): unknown {
  if (typeof ref !== 'string') return ref;
  if (!ref.startsWith('inputs.')) return ref;
  const parts = ref.split('.');
  let cur: unknown = { inputs: context.inputs };
  for (const p of parts) {
    if (cur === null || cur === undefined || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

function asNumber(v: unknown): number {
  if (typeof v !== 'number' || Number.isNaN(v)) {
    throw new Error(`DSL expected number, got ${typeof v}`);
  }
  return v;
}

function asVector(v: unknown): number[] {
  if (!Array.isArray(v) || !v.every((n) => typeof n === 'number')) {
    throw new Error('DSL expected number[]');
  }
  return v as number[];
}

function dot(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`DSL _dot length mismatch: ${a.length} vs ${b.length}`);
  }
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

function l2norm(a: number[]): number {
  return Math.sqrt(a.reduce((s, x) => s + x * x, 0));
}

function cosine(a: number[], b: number[]): number {
  const na = l2norm(a);
  const nb = l2norm(b);
  if (na === 0 || nb === 0) return 0;
  return dot(a, b) / (na * nb);
}

/**
 * Pareto dominance: `a` dominates `b` iff a_i ≥ b_i ∀i AND ∃ j with a_j > b_j.
 * Assumes higher-is-better on every dimension (utility vectors).
 */
function dominates(a: number[], b: number[]): boolean {
  if (a.length !== b.length) {
    throw new Error(`DSL _dominates length mismatch: ${a.length} vs ${b.length}`);
  }
  let strictlyBetter = false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] < b[i]) return false;
    if (a[i] > b[i]) strictlyBetter = true;
  }
  return strictlyBetter;
}

/**
 * Sum-product expected value: inputs `{ values: number[], probs: number[] }`.
 */
function expectedValue(spec: unknown): number {
  if (!spec || typeof spec !== 'object') throw new Error('DSL _expected_value expects object');
  const s = spec as { values?: unknown; probs?: unknown };
  const values = asVector(s.values);
  const probs = asVector(s.probs);
  if (values.length !== probs.length) throw new Error('DSL _expected_value length mismatch');
  let ev = 0;
  for (let i = 0; i < values.length; i++) ev += values[i] * probs[i];
  return ev;
}

function variance(spec: unknown): number {
  if (!spec || typeof spec !== 'object') throw new Error('DSL _variance expects object');
  const s = spec as { values?: unknown; probs?: unknown };
  const values = asVector(s.values);
  const probs = asVector(s.probs);
  if (values.length !== probs.length) throw new Error('DSL _variance length mismatch');
  const mu = expectedValue({ values, probs });
  let v = 0;
  for (let i = 0; i < values.length; i++) {
    v += probs[i] * (values[i] - mu) * (values[i] - mu);
  }
  return v;
}

/**
 * Evaluate a predicate object. The predicate MUST contain exactly one
 * whitelisted operator key. Unknown keys throw — the DSL refuses to
 * silently pass unknown data.
 */
export function evaluatePredicate(predicate: unknown, context: DSLContext): PredicateResult {
  if (predicate === null || typeof predicate !== 'object' || Array.isArray(predicate)) {
    throw new Error('DSL predicate must be a non-null object');
  }
  const obj = predicate as Record<string, unknown>;
  const keys = Object.keys(obj);
  if (keys.length !== 1) {
    throw new Error(`DSL predicate must have exactly one operator key, got ${keys.length}`);
  }
  const op = keys[0];
  if (!ALL_OPS.has(op)) {
    throw new Error(`DSL unknown operator: ${op}`);
  }
  const args = obj[op];
  return dispatch(op as Operator, args, context);
}

function dispatch(op: Operator, args: unknown, context: DSLContext): PredicateResult {
  switch (op) {
    case '_and':
      return logicAnd(args, context);
    case '_or':
      return logicOr(args, context);
    case '_not':
      return logicNot(args, context);
    case '_lt':
    case '_gt':
    case '_eq':
    case '_lte':
    case '_gte':
    case '_neq':
      return scalarCompare(op, args, context);
    case '_in':
      return scalarIn(args, context);
    case '_contains':
      return scalarContains(args, context);
    case '_dot':
    case '_norm':
    case '_cosine':
      return vectorOp(op, args, context);
    case '_dominates':
    case '_frontier_check':
      return graphOp(op, args, context);
    case '_expected_value':
    case '_variance':
      return probOp(op, args, context);
  }
}

function asPair(args: unknown): [unknown, unknown] {
  if (!Array.isArray(args) || args.length !== 2) {
    throw new Error('DSL operator expects [lhs, rhs]');
  }
  return [args[0], args[1]];
}

function scalarCompare(op: ScalarOp, args: unknown, context: DSLContext): PredicateResult {
  const [lhsRef, rhsRef] = asPair(args);
  const lhs = resolveRef(lhsRef, context);
  const rhs = resolveRef(rhsRef, context);
  let matched = false;
  if (op === '_eq') matched = lhs === rhs;
  else if (op === '_neq') matched = lhs !== rhs;
  else {
    const a = asNumber(lhs);
    const b = asNumber(rhs);
    if (op === '_lt') matched = a < b;
    else if (op === '_gt') matched = a > b;
    else if (op === '_lte') matched = a <= b;
    else if (op === '_gte') matched = a >= b;
  }
  return {
    matched,
    confidence: matched ? 1 : 0,
    trace: `${op}(${JSON.stringify(lhs)}, ${JSON.stringify(rhs)}) → ${matched}`,
  };
}

function scalarIn(args: unknown, context: DSLContext): PredicateResult {
  const [valueRef, listRef] = asPair(args);
  const value = resolveRef(valueRef, context);
  const list = resolveRef(listRef, context);
  if (!Array.isArray(list)) throw new Error('DSL _in expects array on rhs');
  const matched = list.includes(value);
  return {
    matched,
    confidence: matched ? 1 : 0,
    trace: `_in(${JSON.stringify(value)}, [${list.length} items]) → ${matched}`,
  };
}

function scalarContains(args: unknown, context: DSLContext): PredicateResult {
  const [haystackRef, needleRef] = asPair(args);
  const haystack = resolveRef(haystackRef, context);
  const needle = resolveRef(needleRef, context);
  let matched = false;
  if (Array.isArray(haystack)) {
    matched = haystack.includes(needle);
  } else if (typeof haystack === 'string' && typeof needle === 'string') {
    matched = haystack.includes(needle);
  } else {
    throw new Error('DSL _contains expects string/array haystack');
  }
  return {
    matched,
    confidence: matched ? 1 : 0,
    trace: `_contains(..., ${JSON.stringify(needle)}) → ${matched}`,
  };
}

interface ThresholdSpec {
  a?: unknown;
  b?: unknown;
  gte?: unknown;
  lte?: unknown;
  eq?: unknown;
}

function vectorOp(op: VectorOp, args: unknown, context: DSLContext): PredicateResult {
  if (!args || typeof args !== 'object' || Array.isArray(args)) {
    throw new Error(`DSL ${op} expects object args`);
  }
  const spec = args as ThresholdSpec;
  const aVec = asVector(resolveRef(spec.a, context));
  let value: number;
  let label: string;
  if (op === '_dot') {
    const bVec = asVector(resolveRef(spec.b, context));
    value = dot(aVec, bVec);
    label = '_dot';
  } else if (op === '_norm') {
    value = l2norm(aVec);
    label = '_norm';
  } else {
    const bVec = asVector(resolveRef(spec.b, context));
    value = cosine(aVec, bVec);
    label = '_cosine';
  }
  return thresholdCheck(label, value, spec, context);
}

function graphOp(op: GraphOp, args: unknown, context: DSLContext): PredicateResult {
  if (!args || typeof args !== 'object' || Array.isArray(args)) {
    throw new Error(`DSL ${op} expects object args`);
  }
  const spec = args as { a?: unknown; b?: unknown; frontier?: unknown };
  if (op === '_dominates') {
    const aVec = asVector(resolveRef(spec.a, context));
    const bVec = asVector(resolveRef(spec.b, context));
    const matched = dominates(aVec, bVec);
    return {
      matched,
      confidence: matched ? 1 : 0,
      trace: `_dominates([${aVec.join(',')}], [${bVec.join(',')}]) → ${matched}`,
    };
  }
  // _frontier_check: is `a` on the Pareto frontier of `frontier` (array of vectors)?
  const aVec = asVector(resolveRef(spec.a, context));
  const frontierRaw = resolveRef(spec.frontier, context);
  if (!Array.isArray(frontierRaw)) throw new Error('DSL _frontier_check expects frontier array');
  let onFrontier = true;
  for (const candidate of frontierRaw) {
    const cVec = asVector(candidate);
    if (dominates(cVec, aVec)) {
      onFrontier = false;
      break;
    }
  }
  return {
    matched: onFrontier,
    confidence: onFrontier ? 1 : 0,
    trace: `_frontier_check([${aVec.join(',')}], frontier=${frontierRaw.length}) → ${onFrontier}`,
  };
}

function probOp(op: ProbOp, args: unknown, context: DSLContext): PredicateResult {
  const resolved = resolveObject(args, context);
  const value = op === '_expected_value' ? expectedValue(resolved) : variance(resolved);
  const spec = (resolved ?? {}) as ThresholdSpec;
  return thresholdCheck(op, value, spec, context);
}

function resolveObject(args: unknown, context: DSLContext): unknown {
  if (!args || typeof args !== 'object' || Array.isArray(args)) return args;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(args as Record<string, unknown>)) {
    out[k] = resolveRef(v, context);
  }
  return out;
}

/**
 * Vector/prob operators always produce a number. Compare it against a
 * threshold clause (`gte` | `lte` | `eq`) and emit a PredicateResult.
 * If no threshold clause is present, treat nonzero numeric output as match.
 */
function thresholdCheck(
  label: string,
  value: number,
  spec: ThresholdSpec,
  context: DSLContext
): PredicateResult {
  if (spec.gte !== undefined) {
    const t = asNumber(resolveRef(spec.gte, context));
    const matched = value >= t;
    return { matched, confidence: matched ? 1 : 0, trace: `${label}=${value} gte ${t} → ${matched}` };
  }
  if (spec.lte !== undefined) {
    const t = asNumber(resolveRef(spec.lte, context));
    const matched = value <= t;
    return { matched, confidence: matched ? 1 : 0, trace: `${label}=${value} lte ${t} → ${matched}` };
  }
  if (spec.eq !== undefined) {
    const t = asNumber(resolveRef(spec.eq, context));
    const matched = value === t;
    return { matched, confidence: matched ? 1 : 0, trace: `${label}=${value} eq ${t} → ${matched}` };
  }
  const matched = value !== 0;
  return { matched, confidence: matched ? 1 : 0, trace: `${label}=${value} (no threshold) → ${matched}` };
}

function logicAnd(args: unknown, context: DSLContext): PredicateResult {
  if (!Array.isArray(args)) throw new Error('DSL _and expects array');
  const traces: string[] = [];
  for (const child of args) {
    const r = evaluatePredicate(child, context);
    traces.push(r.trace);
    if (!r.matched) {
      return { matched: false, confidence: 0, trace: `_and(${traces.join(' ∧ ')})` };
    }
  }
  return { matched: true, confidence: 1, trace: `_and(${traces.join(' ∧ ')})` };
}

function logicOr(args: unknown, context: DSLContext): PredicateResult {
  if (!Array.isArray(args)) throw new Error('DSL _or expects array');
  const traces: string[] = [];
  for (const child of args) {
    const r = evaluatePredicate(child, context);
    traces.push(r.trace);
    if (r.matched) {
      return { matched: true, confidence: 1, trace: `_or(${traces.join(' ∨ ')})` };
    }
  }
  return { matched: false, confidence: 0, trace: `_or(${traces.join(' ∨ ')})` };
}

function logicNot(args: unknown, context: DSLContext): PredicateResult {
  const inner = evaluatePredicate(args, context);
  return {
    matched: !inner.matched,
    confidence: inner.matched ? 0 : 1,
    trace: `_not(${inner.trace})`,
  };
}
