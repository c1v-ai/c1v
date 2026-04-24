import { describe, it, expect } from '@jest/globals';
import { z } from 'zod';
import {
  requirementIdSchema,
  requirementClassSchema,
  requirementRowSchema,
  requirementRowBaseObject,
  applyNumericMathGate,
  NUMERIC_REQUIREMENT_CLASSES,
} from '..';

describe('requirementIdSchema (C12)', () => {
  it('accepts UC01.R01 .. UC99.R99 and CC variants', () => {
    expect(requirementIdSchema.parse('UC01.R01')).toBe('UC01.R01');
    expect(requirementIdSchema.parse('UC99.R99')).toBe('UC99.R99');
    expect(requirementIdSchema.parse('CC.R05')).toBe('CC.R05');
  });

  it('rejects UC100.R01 or UC01.R100 (regex cap)', () => {
    expect(() => requirementIdSchema.parse('UC100.R01')).toThrow();
    expect(() => requirementIdSchema.parse('UC01.R100')).toThrow();
  });
});

describe('requirementClassSchema', () => {
  it('accepts all 9 canonical classes', () => {
    for (const c of [
      'functional', 'performance', 'reliability', 'scalability', 'capacity',
      'security', 'usability', 'compliance', 'maintainability',
    ] as const) {
      expect(requirementClassSchema.parse(c)).toBe(c);
    }
  });
});

describe('requirementRowSchema — NUMERIC_ONLY math gating (flag B)', () => {
  it('parses a functional row without math_derivation', () => {
    const parsed = requirementRowSchema.parse({
      req_id: 'UC01.R01',
      text: 'User can reset password.',
      requirement_class: 'functional',
    });
    expect(parsed.math_derivation).toBeUndefined();
  });

  it('rejects a performance row missing math_derivation', () => {
    expect(() =>
      requirementRowSchema.parse({
        req_id: 'UC01.R02',
        text: 'System responds within 200ms.',
        requirement_class: 'performance',
      }),
    ).toThrow(/math_derivation is required/);
  });

  it('accepts a performance row with math_derivation', () => {
    const parsed = requirementRowSchema.parse({
      req_id: 'UC01.R02',
      text: 'System responds within 200ms.',
      requirement_class: 'performance',
      math_derivation: {
        formula: 'p95 = base + queueing_delay',
        kb_source: 'api-design-sys-design-kb.md',
      },
    });
    expect(parsed.math_derivation?.formula).toMatch(/queueing/);
  });

  it.each(['reliability', 'scalability', 'capacity'] as const)(
    'requires math on requirement_class=%s',
    (cls) => {
      expect(() =>
        requirementRowSchema.parse({
          req_id: 'UC02.R01',
          text: 'x',
          requirement_class: cls,
        }),
      ).toThrow(/math_derivation is required/);
    },
  );

  it('accepts source_ucbd + also_appears_in provenance (C11)', () => {
    const parsed = requirementRowSchema.parse({
      req_id: 'UC01.R01',
      text: 'x',
      requirement_class: 'functional',
      source_ucbd: { phase: 'phase-5-ucbd-step-flow', artifact: 'UC01.step-2', relationship: 'sourced_from' },
      also_appears_in: [
        { phase: 'phase-8-constants-table', artifact: 'C-01', relationship: 'also_appears_in' },
      ],
    });
    expect(parsed.also_appears_in).toHaveLength(1);
    expect(parsed.source_ucbd?.relationship).toBe('sourced_from');
  });
});

describe('NUMERIC_REQUIREMENT_CLASSES', () => {
  it('contains exactly the 4 numeric classes', () => {
    expect(NUMERIC_REQUIREMENT_CLASSES.size).toBe(4);
    for (const c of ['performance', 'reliability', 'scalability', 'capacity'] as const) {
      expect(NUMERIC_REQUIREMENT_CLASSES.has(c)).toBe(true);
    }
    expect(NUMERIC_REQUIREMENT_CLASSES.has('functional')).toBe(false);
  });
});

describe('applyNumericMathGate — re-attached gate on extended schemas', () => {
  const extended = applyNumericMathGate(
    requirementRowBaseObject.extend({
      audit_pass: z.boolean(),
    }),
  );

  it('enforces math gate on a performance row even after .extend()', () => {
    expect(() =>
      extended.parse({
        req_id: 'UC01.R02',
        text: 'x',
        requirement_class: 'performance',
        audit_pass: true,
      }),
    ).toThrow(/math_derivation is required/);
  });

  it('accepts functional row without math on extended schema', () => {
    const parsed = extended.parse({
      req_id: 'UC01.R01',
      text: 'x',
      requirement_class: 'functional',
      audit_pass: true,
    });
    expect(parsed.audit_pass).toBe(true);
  });
});
