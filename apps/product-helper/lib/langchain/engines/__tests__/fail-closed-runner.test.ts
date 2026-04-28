import { describe, it, expect } from '@jest/globals';
import {
  buildFailClosedRegistry,
  checkFailClosedRules,
} from '../fail-closed-runner';

describe('buildFailClosedRegistry', () => {
  it('parses and registers a rule set', () => {
    const reg = buildFailClosedRegistry([
      {
        artifact_key: 'module_2/phase_6',
        rules: [
          {
            id: 'NAME_REQUIRED',
            description: 'name is required',
            check: { kind: 'field_non_empty', field: 'name' },
            severity: 'error',
          },
        ],
      },
    ]);
    expect(reg.size).toBe(1);
    expect(reg.has('module_2/phase_6')).toBe(true);
  });

  it('rejects duplicate artifact_keys', () => {
    expect(() =>
      buildFailClosedRegistry([
        { artifact_key: 'x', rules: [] },
        { artifact_key: 'x', rules: [] },
      ]),
    ).toThrow(/Duplicate fail-closed rule set/);
  });

  it('rejects malformed rule id (lowercase)', () => {
    expect(() =>
      buildFailClosedRegistry([
        {
          artifact_key: 'x',
          rules: [
            {
              id: 'bad_id',
              description: 'x',
              check: { kind: 'field_non_empty', field: 'a' },
              severity: 'error',
            },
          ],
        },
      ]),
    ).toThrow();
  });

  it('rejects unknown check kind', () => {
    expect(() =>
      buildFailClosedRegistry([
        {
          artifact_key: 'x',
          rules: [
            {
              id: 'R',
              description: 'd',
              check: { kind: 'bogus', field: 'a' },
              severity: 'error',
            },
          ],
        },
      ]),
    ).toThrow();
  });
});

describe('checkFailClosedRules — default FAIL on missing registration', () => {
  it('throws when artifact_key is not registered', () => {
    const reg = buildFailClosedRegistry([]);
    expect(() => checkFailClosedRules('unregistered', {}, reg)).toThrow(
      /No fail-closed rule set registered/,
    );
  });

  it('passes when rule list is explicitly empty', () => {
    const reg = buildFailClosedRegistry([
      { artifact_key: 'empty', rules: [] },
    ]);
    const result = checkFailClosedRules('empty', {}, reg);
    expect(result.passed).toBe(true);
    expect(result.violations).toEqual([]);
  });
});

describe('checkFailClosedRules — check kinds', () => {
  it('field_non_empty: flags empty string', () => {
    const reg = buildFailClosedRegistry([
      {
        artifact_key: 'a',
        rules: [
          {
            id: 'NAME',
            description: 'name must exist',
            check: { kind: 'field_non_empty', field: 'name' },
            severity: 'error',
          },
        ],
      },
    ]);
    const r = checkFailClosedRules('a', { name: '  ' }, reg);
    expect(r.passed).toBe(false);
    expect(r.violations[0]?.rule_id).toBe('NAME');
  });

  it('field_non_empty: passes with non-empty array', () => {
    const reg = buildFailClosedRegistry([
      {
        artifact_key: 'a',
        rules: [
          {
            id: 'REFS',
            description: 'needs refs',
            check: { kind: 'field_non_empty', field: 'refs' },
            severity: 'error',
          },
        ],
      },
    ]);
    const r = checkFailClosedRules('a', { refs: ['x'] }, reg);
    expect(r.passed).toBe(true);
  });

  it('field_matches: enforces UPPER_SNAKE_CASE', () => {
    const reg = buildFailClosedRegistry([
      {
        artifact_key: 'a',
        rules: [
          {
            id: 'SNAKE',
            description: 'UPPER_SNAKE_CASE',
            check: {
              kind: 'field_matches',
              field: 'name',
              pattern: '^[A-Z][A-Z0-9_]*$',
            },
            severity: 'error',
          },
        ],
      },
    ]);
    expect(checkFailClosedRules('a', { name: 'RESPONSE_BUDGET_MS' }, reg).passed).toBe(
      true,
    );
    expect(checkFailClosedRules('a', { name: 'responseBudgetMs' }, reg).passed).toBe(
      false,
    );
  });

  it('field_equals: checks units', () => {
    const reg = buildFailClosedRegistry([
      {
        artifact_key: 'a',
        rules: [
          {
            id: 'UNITS',
            description: 'latency units=ms',
            check: { kind: 'field_equals', field: 'units', value: 'ms' },
            severity: 'error',
          },
        ],
      },
    ]);
    expect(checkFailClosedRules('a', { units: 'ms' }, reg).passed).toBe(true);
    expect(checkFailClosedRules('a', { units: 'seconds' }, reg).passed).toBe(false);
  });

  it('field_in: enum enforcement', () => {
    const reg = buildFailClosedRegistry([
      {
        artifact_key: 'a',
        rules: [
          {
            id: 'CATEGORY',
            description: 'category',
            check: {
              kind: 'field_in',
              field: 'category',
              values: ['latency', 'throughput', 'availability'],
            },
            severity: 'error',
          },
        ],
      },
    ]);
    expect(checkFailClosedRules('a', { category: 'latency' }, reg).passed).toBe(true);
    expect(checkFailClosedRules('a', { category: 'bogus' }, reg).passed).toBe(false);
  });

  it('field_range: bounds check', () => {
    const reg = buildFailClosedRegistry([
      {
        artifact_key: 'a',
        rules: [
          {
            id: 'CONF',
            description: 'confidence in [0,1]',
            check: { kind: 'field_range', field: 'conf', min: 0, max: 1 },
            severity: 'error',
          },
        ],
      },
    ]);
    expect(checkFailClosedRules('a', { conf: 0.5 }, reg).passed).toBe(true);
    expect(checkFailClosedRules('a', { conf: 1.2 }, reg).passed).toBe(false);
    expect(checkFailClosedRules('a', { conf: -0.1 }, reg).passed).toBe(false);
    expect(checkFailClosedRules('a', { conf: 'x' }, reg).passed).toBe(false);
  });

  it('array_min_length', () => {
    const reg = buildFailClosedRegistry([
      {
        artifact_key: 'a',
        rules: [
          {
            id: 'REFS_MIN',
            description: 'need >=1 ref',
            check: { kind: 'array_min_length', field: 'refs', min: 1 },
            severity: 'error',
          },
        ],
      },
    ]);
    expect(checkFailClosedRules('a', { refs: ['r'] }, reg).passed).toBe(true);
    expect(checkFailClosedRules('a', { refs: [] }, reg).passed).toBe(false);
  });

  it('fields_required_together', () => {
    const reg = buildFailClosedRegistry([
      {
        artifact_key: 'a',
        rules: [
          {
            id: 'VALUE_UNITS',
            description: 'value+units together',
            check: {
              kind: 'fields_required_together',
              fields: ['value', 'units'],
            },
            severity: 'error',
          },
        ],
      },
    ]);
    expect(checkFailClosedRules('a', { value: 500, units: 'ms' }, reg).passed).toBe(
      true,
    );
    expect(checkFailClosedRules('a', {}, reg).passed).toBe(true);
    expect(checkFailClosedRules('a', { value: 500 }, reg).passed).toBe(false);
  });

  it('handles nested field paths via dot syntax', () => {
    const reg = buildFailClosedRegistry([
      {
        artifact_key: 'a',
        rules: [
          {
            id: 'NESTED',
            description: 'nested.value exists',
            check: { kind: 'field_non_empty', field: 'nested.value' },
            severity: 'error',
          },
        ],
      },
    ]);
    expect(
      checkFailClosedRules('a', { nested: { value: 'x' } }, reg).passed,
    ).toBe(true);
    expect(checkFailClosedRules('a', { nested: {} }, reg).passed).toBe(false);
  });
});

describe('checkFailClosedRules — severity', () => {
  it('warn-severity violations do not flip passed=false', () => {
    const reg = buildFailClosedRegistry([
      {
        artifact_key: 'a',
        rules: [
          {
            id: 'SOFT',
            description: 'soft check',
            check: { kind: 'field_non_empty', field: 'hint' },
            severity: 'warn',
          },
        ],
      },
    ]);
    const r = checkFailClosedRules('a', {}, reg);
    expect(r.passed).toBe(true);
    expect(r.violations).toHaveLength(1);
    expect(r.violations[0]?.severity).toBe('warn');
  });

  it('mixed warn+error: passed=false when any error violated', () => {
    const reg = buildFailClosedRegistry([
      {
        artifact_key: 'a',
        rules: [
          {
            id: 'SOFT',
            description: 'soft check',
            check: { kind: 'field_non_empty', field: 'hint' },
            severity: 'warn',
          },
          {
            id: 'HARD',
            description: 'hard check',
            check: { kind: 'field_non_empty', field: 'name' },
            severity: 'error',
          },
        ],
      },
    ]);
    const r = checkFailClosedRules('a', {}, reg);
    expect(r.passed).toBe(false);
    expect(r.violations).toHaveLength(2);
  });
});
