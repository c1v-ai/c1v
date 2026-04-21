import { describe, it, expect } from '@jest/globals';
import { phase11Schema, ucOverlapCellSchema } from '../phase-11-multi-uc-expansion';

function envelope() {
  return {
    _schema: 'module-2.phase-11-multi-uc-expansion.v1',
    _output_path: 'F14/2/Phase11.json',
    _phase_status: 'complete' as const,
    metadata: {
      phase_number: 11,
      phase_slug: 'multi-uc-expansion',
      phase_name: 'Phase 11 — Multi-UC Expansion',
      schema_version: '1.0.0',
      project_id: 30,
      project_name: 'Heat Guard',
      author: 'extraction_agent',
      generated_at: '2026-04-21T12:00:00Z',
      generator: 'product-helper@0.1.0',
    },
  };
}

describe('ucOverlapCellSchema', () => {
  it('accepts a well-formed Jaccard cell', () => {
    const parsed = ucOverlapCellSchema.parse({ uc_a: 'UC01', uc_b: 'UC02', jaccard: 0.42 });
    expect(parsed.jaccard).toBe(0.42);
  });

  it('clamps jaccard into [0, 1]', () => {
    expect(() => ucOverlapCellSchema.parse({ uc_a: 'UC01', uc_b: 'UC02', jaccard: 1.5 })).toThrow();
    expect(() => ucOverlapCellSchema.parse({ uc_a: 'UC01', uc_b: 'UC02', jaccard: -0.1 })).toThrow();
  });
});

describe('phase11Schema', () => {
  it('parses rows with merged_from provenance', () => {
    const parsed = phase11Schema.parse({
      ...envelope(),
      rows: [
        {
          req_id: 'UC01.R01',
          text: 'Unified clause',
          requirement_class: 'functional',
          merged_from: ['UC01.R03', 'UC02.R01'],
          dedup_rationale: 'Same testable predicate.',
        },
      ],
      uc_overlap_matrix: [{ uc_a: 'UC01', uc_b: 'UC02', jaccard: 0.5 }],
      overlap_math: { formula: '|A∩B| / |A∪B|', kb_source: 'inline' },
    });
    expect(parsed.rows[0].merged_from).toHaveLength(2);
    expect(parsed.uc_overlap_matrix).toHaveLength(1);
  });

  it('requires overlap_math even if uc_overlap_matrix is empty', () => {
    expect(() =>
      phase11Schema.parse({
        ...envelope(),
        rows: [{ req_id: 'UC01.R01', text: 'x', requirement_class: 'functional' }],
        uc_overlap_matrix: [],
      }),
    ).toThrow();
  });
});
