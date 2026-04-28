import {
  evalPredicate,
  PredicateError,
  resolveArg,
} from '@/lib/langchain/engine/predicate-dsl';
import type { EvalContext, Predicate } from '@/lib/langchain/engine/types';

const ctx = (overrides: Partial<EvalContext> = {}): EvalContext => ({
  project_id: 1,
  intake: {},
  upstream: {},
  kb_chunks: [],
  rag_attempted: false,
  derived: {},
  ...overrides,
});

describe('predicate-dsl: resolveArg', () => {
  it('resolves $.path.segments against context', () => {
    const c = ctx({ derived: { foo: { bar: 42 } } });
    expect(resolveArg('$.derived.foo.bar', c)).toBe(42);
  });
  it('returns raw value for non-$. strings', () => {
    expect(resolveArg('hello', ctx())).toBe('hello');
    expect(resolveArg(42, ctx())).toBe(42);
  });
  it('calls onMissing for unresolvable paths', () => {
    const missed: string[] = [];
    resolveArg('$.derived.absent.nested', ctx(), (p) => missed.push(p));
    expect(missed).toContain('derived.absent.nested');
  });
});

describe('predicate-dsl: _eq', () => {
  it('compares scalars', () => {
    expect(evalPredicate({ op: '_eq', args: [1, 1] }, ctx())).toBe(true);
    expect(evalPredicate({ op: '_eq', args: [1, 2] }, ctx())).toBe(false);
  });
  it('deep-equals arrays', () => {
    expect(
      evalPredicate(
        { op: '_eq', args: [[1, 2, 3], [1, 2, 3]] },
        ctx()
      )
    ).toBe(true);
    expect(
      evalPredicate(
        { op: '_eq', args: [[1, 2, 3], [1, 2]] },
        ctx()
      )
    ).toBe(false);
  });
  it('resolves paths', () => {
    const c = ctx({ derived: { x: 'foo' } });
    expect(evalPredicate({ op: '_eq', args: ['$.derived.x', 'foo'] }, c)).toBe(true);
  });
  it('throws on wrong arity', () => {
    expect(() => evalPredicate({ op: '_eq', args: [1] }, ctx())).toThrow(PredicateError);
  });
});

describe('predicate-dsl: _gt / _lt', () => {
  it('numeric comparison', () => {
    expect(evalPredicate({ op: '_gt', args: [3, 2] }, ctx())).toBe(true);
    expect(evalPredicate({ op: '_gt', args: [2, 3] }, ctx())).toBe(false);
    expect(evalPredicate({ op: '_lt', args: [2, 3] }, ctx())).toBe(true);
  });
  it('returns false on non-numeric (no throw)', () => {
    expect(evalPredicate({ op: '_gt', args: ['a', 'b'] }, ctx())).toBe(false);
    expect(evalPredicate({ op: '_lt', args: [null, 5] }, ctx())).toBe(false);
  });
});

describe('predicate-dsl: _range', () => {
  it('inclusive bounds', () => {
    expect(evalPredicate({ op: '_range', args: [5, 1, 10] }, ctx())).toBe(true);
    expect(evalPredicate({ op: '_range', args: [1, 1, 10] }, ctx())).toBe(true);
    expect(evalPredicate({ op: '_range', args: [10, 1, 10] }, ctx())).toBe(true);
    expect(evalPredicate({ op: '_range', args: [11, 1, 10] }, ctx())).toBe(false);
  });
});

describe('predicate-dsl: _in', () => {
  it('membership in literal array', () => {
    expect(evalPredicate({ op: '_in', args: ['a', ['a', 'b', 'c']] }, ctx())).toBe(true);
    expect(evalPredicate({ op: '_in', args: ['z', ['a', 'b', 'c']] }, ctx())).toBe(false);
  });
  it('returns false when haystack is not an array', () => {
    expect(evalPredicate({ op: '_in', args: ['a', 'abc'] }, ctx())).toBe(false);
  });
});

describe('predicate-dsl: _contains', () => {
  it('substring match on strings (case-insensitive)', () => {
    expect(evalPredicate({ op: '_contains', args: ['ai', 'I love AI tools'] }, ctx())).toBe(true);
    expect(evalPredicate({ op: '_contains', args: ['xyz', 'abc'] }, ctx())).toBe(false);
  });
  it('membership in arrays', () => {
    expect(evalPredicate({ op: '_contains', args: ['ai', ['ml', 'ai', 'data']] }, ctx())).toBe(true);
  });
});

describe('predicate-dsl: _and / _or / _not', () => {
  const t: Predicate = { op: '_eq', args: [1, 1] };
  const f: Predicate = { op: '_eq', args: [1, 2] };
  it('_and: all must be true', () => {
    expect(evalPredicate({ op: '_and', args: [t, t] }, ctx())).toBe(true);
    expect(evalPredicate({ op: '_and', args: [t, f] }, ctx())).toBe(false);
  });
  it('_or: any can be true', () => {
    expect(evalPredicate({ op: '_or', args: [f, t] }, ctx())).toBe(true);
    expect(evalPredicate({ op: '_or', args: [f, f] }, ctx())).toBe(false);
  });
  it('_not: inverts', () => {
    expect(evalPredicate({ op: '_not', args: [f] }, ctx())).toBe(true);
    expect(evalPredicate({ op: '_not', args: [t] }, ctx())).toBe(false);
  });
  it('nested _and/_or evaluate correctly', () => {
    const nested: Predicate = {
      op: '_and',
      args: [t, { op: '_or', args: [f, { op: '_not', args: [f] }] }],
    };
    expect(evalPredicate(nested, ctx())).toBe(true);
  });
});

describe('predicate-dsl: error cases', () => {
  it('throws on unknown op', () => {
    expect(() =>
      evalPredicate({ op: '_unknown' as 'unknown' as never, args: [] } as unknown as Predicate, ctx())
    ).toThrow(PredicateError);
  });
  it('throws when _and child is not a predicate', () => {
    expect(() =>
      evalPredicate({ op: '_and', args: ['not-a-predicate'] } as Predicate, ctx())
    ).toThrow(PredicateError);
  });
  it('throws when _not has wrong arity', () => {
    expect(() =>
      evalPredicate(
        { op: '_not', args: [{ op: '_eq', args: [1, 1] }, { op: '_eq', args: [1, 1] }] } as Predicate,
        ctx()
      )
    ).toThrow(PredicateError);
  });
});

describe('predicate-dsl: missing-path tracking', () => {
  it('flows missing paths through onMissing without throwing', () => {
    const missed: string[] = [];
    const result = evalPredicate(
      { op: '_eq', args: ['$.derived.absent', 42] },
      ctx(),
      (p) => missed.push(p)
    );
    expect(result).toBe(false);
    expect(missed).toContain('derived.absent');
  });
});
