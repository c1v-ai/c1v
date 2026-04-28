import { describe, it, expect } from '@jest/globals';
import { phase0Schema, phase1Schema, ucPriorityRowSchema } from '..';

function envelope(n: number, slug: string, name: string) {
  return {
    _schema: `module-2.phase-${n}-${slug}.v1`,
    _output_path: `F14/2/Phase${n}.json`,
    _phase_status: 'complete' as const,
    metadata: {
      phase_number: n,
      phase_slug: slug,
      phase_name: name,
      schema_version: '1.0.0',
      project_id: 30,
      project_name: 'Heat Guard',
      author: 'extraction_agent',
      generated_at: '2026-04-21T12:00:00Z',
      generator: 'product-helper@0.1.0',
    },
  };
}

describe('phase0Schema', () => {
  it('parses an envelope with intake_summary + carried_constants', () => {
    const parsed = phase0Schema.parse({
      ...envelope(0, 'ingest', 'Phase 0 — Ingest'),
      intake_summary: 'Small US-based pilot; SOC2 planned Q3.',
      carried_constants: [
        { name: 'COMPLIANCE_REGIME', value: 'SOC2' },
        { name: 'EXPECTED_USERS', value: 500, unit: 'users' },
      ],
    });
    expect(parsed.carried_constants).toHaveLength(2);
  });

  it('rejects lowercase constant name', () => {
    expect(() =>
      phase0Schema.parse({
        ...envelope(0, 'ingest', 'Phase 0'),
        intake_summary: 'x',
        carried_constants: [{ name: 'compliance_regime', value: 'SOC2' }],
      }),
    ).toThrow();
  });

  it('defaults carried_constants to []', () => {
    const parsed = phase0Schema.parse({
      ...envelope(0, 'ingest', 'Phase 0'),
      intake_summary: 'No constants carried.',
    });
    expect(parsed.carried_constants).toEqual([]);
  });
});

describe('ucPriorityRowSchema (flag B gate applied in-row)', () => {
  it('parses a priority row with required math', () => {
    const parsed = ucPriorityRowSchema.parse({
      uc_id: 'UC01',
      uc_name: 'Submit reading',
      priority: 'must',
      priority_score: 0.92,
      priority_math: {
        formula: 'impact * feasibility',
        kb_source: 'software_architecture_system.md',
        inputs: { impact: 0.95, feasibility: 0.97 },
      },
    });
    expect(parsed.priority_score).toBe(0.92);
  });

  it('rejects missing priority_math', () => {
    expect(() =>
      ucPriorityRowSchema.parse({
        uc_id: 'UC01',
        uc_name: 'x',
        priority: 'must',
        priority_score: 0.5,
      }),
    ).toThrow();
  });
});

describe('phase1Schema', () => {
  it('parses a full envelope with priority rows', () => {
    const parsed = phase1Schema.parse({
      ...envelope(1, 'use-case-priority', 'Phase 1 — UC Priority'),
      rows: [
        {
          uc_id: 'UC01',
          uc_name: 'x',
          priority: 'must',
          priority_score: 0.9,
          priority_math: { formula: 'x', kb_source: 'inline' },
        },
      ],
    });
    expect(parsed.rows).toHaveLength(1);
  });
});
