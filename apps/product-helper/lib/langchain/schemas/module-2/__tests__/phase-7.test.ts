import { describe, it, expect } from '@jest/globals';
import { phase7Schema, phase7RowSchema } from '../phase-7-rules-audit';

function envelope() {
  return {
    _schema: 'module-2.phase-7-rules-audit.v1',
    _output_path: 'F14/2/Phase7.json',
    _phase_status: 'complete' as const,
    metadata: {
      phase_number: 7,
      phase_slug: 'rules-audit',
      phase_name: 'Phase 7 — Rules Audit',
      schema_version: '1.0.0',
      project_id: 30,
      project_name: 'Heat Guard',
      author: 'extraction_agent',
      generated_at: '2026-04-21T12:00:00Z',
      generator: 'product-helper@0.1.0',
    },
  };
}

describe('phase7RowSchema — row-level audit + gate preserved', () => {
  it('accepts a functional row with audit_pass=true', () => {
    const parsed = phase7RowSchema.parse({
      req_id: 'UC01.R01',
      text: 'x',
      requirement_class: 'functional',
      audit_pass: true,
    });
    expect(parsed.violations).toEqual([]);
  });

  it('rejects a performance row missing math_derivation (gate survives .extend)', () => {
    expect(() =>
      phase7RowSchema.parse({
        req_id: 'UC01.R02',
        text: 'slow',
        requirement_class: 'performance',
        audit_pass: false,
      }),
    ).toThrow(/math_derivation is required/);
  });

  it('carries audit violations with severity', () => {
    const parsed = phase7RowSchema.parse({
      req_id: 'UC01.R01',
      text: 'x',
      requirement_class: 'functional',
      audit_pass: false,
      violations: [
        { rule_id: 'R-TESTABLE-001', severity: 'error', message: 'No measurable pass/fail.' },
      ],
    });
    expect(parsed.violations[0].severity).toBe('error');
  });
});

describe('phase7Schema', () => {
  it('parses an envelope with audit metadata + rows', () => {
    const parsed = phase7Schema.parse({
      ...envelope(),
      audit_rule_set_version: '2026.04',
      rows: [
        { req_id: 'UC01.R01', text: 'x', requirement_class: 'functional', audit_pass: true },
      ],
    });
    expect(parsed.audit_rule_set_version).toBe('2026.04');
  });

  it('rejects missing audit_rule_set_version', () => {
    expect(() =>
      phase7Schema.parse({
        ...envelope(),
        rows: [
          { req_id: 'UC01.R01', text: 'x', requirement_class: 'functional', audit_pass: true },
        ],
      }),
    ).toThrow();
  });
});
