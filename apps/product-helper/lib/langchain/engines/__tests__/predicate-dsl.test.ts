import { describe, it, expect } from '@jest/globals';
import { evaluatePredicate } from '../predicate-dsl';

describe('predicate-dsl', () => {
  describe('flat equality', () => {
    it('returns true on exact string match', () => {
      expect(
        evaluatePredicate({ user_type: 'consumer_app' }, { user_type: 'consumer_app' }),
      ).toBe(true);
    });

    it('returns false on string mismatch', () => {
      expect(
        evaluatePredicate({ user_type: 'consumer_app' }, { user_type: 'internal_tool' }),
      ).toBe(false);
    });

    it('returns true when all keys match (implicit AND)', () => {
      expect(
        evaluatePredicate(
          { user_type: 'consumer_app', flow_class: 'user_facing_sync' },
          { user_type: 'consumer_app', flow_class: 'user_facing_sync' },
        ),
      ).toBe(true);
    });

    it('returns false when any key in an implicit AND fails', () => {
      expect(
        evaluatePredicate(
          { user_type: 'consumer_app', flow_class: 'user_facing_sync' },
          { user_type: 'consumer_app', flow_class: 'batch' },
        ),
      ).toBe(false);
    });

    it('returns true for an empty predicate (trivially satisfied)', () => {
      expect(evaluatePredicate({}, { anything: true })).toBe(true);
    });

    it('returns false when the field is missing from context', () => {
      expect(evaluatePredicate({ user_type: 'consumer_app' }, {})).toBe(false);
    });
  });

  describe('_contains (suffix)', () => {
    it('matches when array contains the expected value', () => {
      expect(
        evaluatePredicate(
          { regulatory_refs_contains: 'PCI-DSS' },
          { regulatory_refs: ['PCI-DSS', 'SOC2'] },
        ),
      ).toBe(true);
    });

    it('returns false when array does not contain expected value', () => {
      expect(
        evaluatePredicate(
          { regulatory_refs_contains: 'HIPAA' },
          { regulatory_refs: ['PCI-DSS', 'SOC2'] },
        ),
      ).toBe(false);
    });

    it('matches substring inside a string field', () => {
      expect(
        evaluatePredicate({ note_contains: 'urgent' }, { note: 'this is urgent' }),
      ).toBe(true);
    });

    it('returns false when field is neither array nor string', () => {
      expect(
        evaluatePredicate({ count_contains: 'x' }, { count: 42 }),
      ).toBe(false);
    });
  });

  describe('_in (suffix)', () => {
    it('matches when field value is in the allowed list', () => {
      expect(
        evaluatePredicate(
          { user_type_in: ['consumer_app', 'enterprise_app'] },
          { user_type: 'enterprise_app' },
        ),
      ).toBe(true);
    });

    it('returns false when field value is not in the list', () => {
      expect(
        evaluatePredicate(
          { user_type_in: ['consumer_app', 'enterprise_app'] },
          { user_type: 'internal_tool' },
        ),
      ).toBe(false);
    });
  });

  describe('numeric comparisons', () => {
    it('_lt returns true when field is strictly less than expected', () => {
      expect(evaluatePredicate({ latency_ms_lt: 500 }, { latency_ms: 300 })).toBe(true);
    });

    it('_lt returns false when equal', () => {
      expect(evaluatePredicate({ latency_ms_lt: 500 }, { latency_ms: 500 })).toBe(false);
    });

    it('_lte returns true when equal', () => {
      expect(evaluatePredicate({ latency_ms_lte: 500 }, { latency_ms: 500 })).toBe(true);
    });

    it('_gt returns true when field is strictly greater', () => {
      expect(evaluatePredicate({ qps_gt: 100 }, { qps: 150 })).toBe(true);
    });

    it('_gte returns true when equal', () => {
      expect(evaluatePredicate({ qps_gte: 100 }, { qps: 100 })).toBe(true);
    });

    it('_range returns true when value is inside inclusive range', () => {
      expect(evaluatePredicate({ qps_range: [100, 1000] }, { qps: 500 })).toBe(true);
    });

    it('_range returns false when outside range', () => {
      expect(evaluatePredicate({ qps_range: [100, 1000] }, { qps: 50 })).toBe(false);
    });

    it('numeric ops return false when field is non-numeric', () => {
      expect(evaluatePredicate({ qps_gt: 100 }, { qps: 'lots' })).toBe(false);
    });
  });

  describe('_eq / _neq', () => {
    it('_eq matches like equality', () => {
      expect(evaluatePredicate({ user_type_eq: 'consumer_app' }, { user_type: 'consumer_app' })).toBe(true);
    });

    it('_neq returns true when values differ', () => {
      expect(evaluatePredicate({ user_type_neq: 'internal' }, { user_type: 'consumer_app' })).toBe(true);
    });
  });

  describe('_exists', () => {
    it('_exists:true passes when field is present', () => {
      expect(evaluatePredicate({ nda_exists: true }, { nda: 'signed' })).toBe(true);
    });

    it('_exists:true fails when field is missing', () => {
      expect(evaluatePredicate({ nda_exists: true }, {})).toBe(false);
    });

    it('_exists:false passes when field is absent', () => {
      expect(evaluatePredicate({ nda_exists: false }, {})).toBe(true);
    });
  });

  describe('composition operators', () => {
    it('_and requires every clause to match', () => {
      expect(
        evaluatePredicate(
          {
            _and: [
              { user_type: 'consumer_app' },
              { regulatory_refs_contains: 'PCI-DSS' },
            ],
          },
          { user_type: 'consumer_app', regulatory_refs: ['PCI-DSS'] },
        ),
      ).toBe(true);
    });

    it('_and returns false if any clause fails', () => {
      expect(
        evaluatePredicate(
          { _and: [{ user_type: 'consumer_app' }, { qps_gt: 1000 }] },
          { user_type: 'consumer_app', qps: 100 },
        ),
      ).toBe(false);
    });

    it('_or passes when any clause matches', () => {
      expect(
        evaluatePredicate(
          { _or: [{ user_type: 'consumer_app' }, { user_type: 'enterprise_app' }] },
          { user_type: 'enterprise_app' },
        ),
      ).toBe(true);
    });

    it('_or fails when no clause matches', () => {
      expect(
        evaluatePredicate(
          { _or: [{ user_type: 'consumer_app' }, { user_type: 'enterprise_app' }] },
          { user_type: 'internal_tool' },
        ),
      ).toBe(false);
    });

    it('_not inverts a clause', () => {
      expect(
        evaluatePredicate({ _not: { user_type: 'consumer_app' } }, { user_type: 'internal_tool' }),
      ).toBe(true);
    });

    it('nests _and / _or / _not', () => {
      expect(
        evaluatePredicate(
          {
            _and: [
              { _or: [{ user_type: 'consumer_app' }, { user_type: 'enterprise_app' }] },
              { _not: { flow_class: 'batch' } },
            ],
          },
          { user_type: 'enterprise_app', flow_class: 'user_facing_sync' },
        ),
      ).toBe(true);
    });
  });

  describe('inline operator objects', () => {
    it('accepts { field: { _gt: N } } as an inline operator', () => {
      expect(
        evaluatePredicate({ qps: { _gt: 100 } }, { qps: 150 }),
      ).toBe(true);
    });

    it('combines multiple inline operators as AND', () => {
      expect(
        evaluatePredicate(
          { qps: { _gte: 100, _lte: 1000 } },
          { qps: 500 },
        ),
      ).toBe(true);
    });
  });

  describe('dotted-path field reads', () => {
    it('resolves nested fields with dotted path', () => {
      expect(
        evaluatePredicate(
          { 'intake.user_class': 'consumer_app' },
          { intake: { user_class: 'consumer_app' } },
        ),
      ).toBe(true);
    });
  });
});
