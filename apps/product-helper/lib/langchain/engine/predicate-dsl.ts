/**
 * Predicate DSL evaluator (G3)
 *
 * JSON-shaped predicates evaluated against an EvalContext. Engine.json
 * story trees consume the DSL as data — JS-closure predicates would
 * defeat the authoring story.
 *
 * Operators: `_contains`, `_in`, `_range`, `_gt`, `_lt`, `_eq`,
 *            `_and`, `_or`, `_not`.
 *
 * Path resolution: any string `arg` of the form `"$.foo.bar"` resolves
 * against `context` via dot-path lookup; missing paths return `undefined`
 * and are recorded in `missing_inputs` by the interpreter (this module
 * only signals via the resolver hook).
 *
 * @module langchain/engine/predicate-dsl
 */

import type { EvalContext, Predicate, PredicateOp } from './types';

const PATH_PREFIX = '$.';

/**
 * Read a dot-path against an EvalContext.
 * Paths starting with `$.` are resolved; bare values pass through.
 *
 * Recorded missing paths flow back via `onMissing` so the interpreter
 * can populate EngineOutput.missing_inputs.
 */
export function resolveArg(
  raw: unknown,
  context: EvalContext,
  onMissing?: (path: string) => void
): unknown {
  if (typeof raw !== 'string' || !raw.startsWith(PATH_PREFIX)) return raw;
  const path = raw.slice(PATH_PREFIX.length);
  const segments = path.split('.');
  let cursor: unknown = context;
  for (const seg of segments) {
    if (cursor == null || typeof cursor !== 'object') {
      onMissing?.(path);
      return undefined;
    }
    cursor = (cursor as Record<string, unknown>)[seg];
  }
  if (cursor === undefined) onMissing?.(path);
  return cursor;
}

const isNumber = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v);

const deepEqual = (a: unknown, b: unknown): boolean => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((x, i) => deepEqual(x, b[i]));
  }
  if (typeof a === 'object' && typeof b === 'object') {
    const ak = Object.keys(a as object);
    const bk = Object.keys(b as object);
    if (ak.length !== bk.length) return false;
    return ak.every((k) =>
      deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])
    );
  }
  return false;
};

/**
 * Evaluate a predicate against an EvalContext.
 *
 * Throws on malformed predicates (wrong arity, unknown op, type mismatch
 * inside a numeric op). Missing paths are NOT errors — they evaluate to
 * `false` and surface via `onMissing`.
 */
export function evalPredicate(
  predicate: Predicate,
  context: EvalContext,
  onMissing?: (path: string) => void
): boolean {
  const { op, args } = predicate;
  const resolve = (raw: unknown) => resolveArg(raw, context, onMissing);

  switch (op as PredicateOp) {
    case '_eq': {
      assertArity(op, args, 2);
      return deepEqual(resolve(args[0]), resolve(args[1]));
    }

    case '_gt': {
      assertArity(op, args, 2);
      const [a, b] = [resolve(args[0]), resolve(args[1])];
      if (!isNumber(a) || !isNumber(b)) return false;
      return a > b;
    }

    case '_lt': {
      assertArity(op, args, 2);
      const [a, b] = [resolve(args[0]), resolve(args[1])];
      if (!isNumber(a) || !isNumber(b)) return false;
      return a < b;
    }

    case '_range': {
      assertArity(op, args, 3);
      const [v, lo, hi] = [resolve(args[0]), resolve(args[1]), resolve(args[2])];
      if (!isNumber(v) || !isNumber(lo) || !isNumber(hi)) return false;
      return v >= lo && v <= hi;
    }

    case '_in': {
      assertArity(op, args, 2);
      const needle = resolve(args[0]);
      const haystack = resolve(args[1]);
      if (!Array.isArray(haystack)) return false;
      return haystack.some((item) => deepEqual(needle, item));
    }

    case '_contains': {
      assertArity(op, args, 2);
      const needle = resolve(args[0]);
      const haystack = resolve(args[1]);
      if (typeof haystack === 'string') {
        if (typeof needle !== 'string') return false;
        return haystack.toLowerCase().includes(needle.toLowerCase());
      }
      if (Array.isArray(haystack)) {
        return haystack.some((item) => deepEqual(needle, item));
      }
      return false;
    }

    case '_and': {
      if (args.length < 1) {
        throw new PredicateError(`_and requires ≥1 child predicate`);
      }
      return args.every((child) =>
        evalPredicate(asPredicate(child, '_and'), context, onMissing)
      );
    }

    case '_or': {
      if (args.length < 1) {
        throw new PredicateError(`_or requires ≥1 child predicate`);
      }
      return args.some((child) =>
        evalPredicate(asPredicate(child, '_or'), context, onMissing)
      );
    }

    case '_not': {
      assertArity(op, args, 1);
      return !evalPredicate(asPredicate(args[0], '_not'), context, onMissing);
    }

    default: {
      throw new PredicateError(`unknown predicate op: ${String(op)}`);
    }
  }
}

export class PredicateError extends Error {
  constructor(message: string) {
    super(`[predicate-dsl] ${message}`);
    this.name = 'PredicateError';
  }
}

function assertArity(op: string, args: unknown[], expected: number): void {
  if (args.length !== expected) {
    throw new PredicateError(
      `${op} expects ${expected} arg(s), got ${args.length}`
    );
  }
}

function asPredicate(raw: unknown, parentOp: string): Predicate {
  if (
    typeof raw !== 'object' ||
    raw === null ||
    typeof (raw as { op?: unknown }).op !== 'string' ||
    !Array.isArray((raw as { args?: unknown }).args)
  ) {
    throw new PredicateError(
      `${parentOp} child must be a Predicate {op, args}, got ${JSON.stringify(raw)}`
    );
  }
  return raw as Predicate;
}
