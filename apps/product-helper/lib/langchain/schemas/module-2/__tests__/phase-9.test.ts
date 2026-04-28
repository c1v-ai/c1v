import { describe, it, expect } from '@jest/globals';
import { phase9Schema } from '..';

function envelope() {
  return {
    _schema: 'module-2.phase-9-delve-and-fix.v1',
    _output_path: 'F14/2/Phase9.json',
    _phase_status: 'complete' as const,
    metadata: {
      phase_number: 9,
      phase_slug: 'delve-and-fix',
      phase_name: 'Phase 9 — Delve and Fix',
      schema_version: '1.0.0',
      project_id: 30,
      project_name: 'Heat Guard',
      author: 'extraction_agent',
      generated_at: '2026-04-21T12:00:00Z',
      generator: 'product-helper@0.1.0',
    },
  };
}

describe('phase9Schema', () => {
  it('parses a full envelope with coverage + fixes', () => {
    const parsed = phase9Schema.parse({
      ...envelope(),
      rows: [
        {
          req_id: 'UC01.R01',
          text: 'x',
          requirement_class: 'functional',
          fix_applied: 'Split into 2 testable clauses.',
          delve_notes: ['Original ambiguous'],
        },
      ],
      coverage_score: 0.83,
      coverage_math: {
        formula: 'covered_uc / total_uc',
        kb_source: 'inline',
        inputs: { covered_uc: 5, total_uc: 6 },
      },
      uncovered_ucs: ['UC06'],
    });
    expect(parsed.coverage_score).toBe(0.83);
    expect(parsed.uncovered_ucs).toHaveLength(1);
  });

  it('clamps coverage_score into [0, 1]', () => {
    expect(() =>
      phase9Schema.parse({
        ...envelope(),
        rows: [{ req_id: 'UC01.R01', text: 'x', requirement_class: 'functional' }],
        coverage_score: 1.5,
        coverage_math: { formula: 'x', kb_source: 'inline' },
      }),
    ).toThrow();
  });

  it('rejects missing coverage_math (envelope-level math is required here)', () => {
    expect(() =>
      phase9Schema.parse({
        ...envelope(),
        rows: [{ req_id: 'UC01.R01', text: 'x', requirement_class: 'functional' }],
        coverage_score: 1,
      }),
    ).toThrow();
  });
});
