import { describe, it, expect } from '@jest/globals';
import { phase6Schema } from '..';

function envelope() {
  return {
    _schema: 'module-2.phase-6-requirements-table.v1',
    _output_path: 'F14/2/Phase6.json',
    _phase_status: 'complete' as const,
    metadata: {
      phase_number: 6,
      phase_slug: 'requirements-table',
      phase_name: 'Phase 6 — Requirements Table',
      schema_version: '1.0.0',
      project_id: 30,
      project_name: 'Heat Guard',
      author: 'extraction_agent',
      generated_at: '2026-04-21T12:00:00Z',
      generator: 'product-helper@0.1.0',
    },
  };
}

describe('phase6Schema', () => {
  it('parses a mixed-class requirements set', () => {
    const parsed = phase6Schema.parse({
      ...envelope(),
      rows: [
        { req_id: 'UC01.R01', text: 'Reset password', requirement_class: 'functional' },
        {
          req_id: 'UC01.R02',
          text: 'Respond < 200ms',
          requirement_class: 'performance',
          math_derivation: { formula: 'p95 = base + q', kb_source: 'api-design-sys-design-kb.md' },
        },
      ],
    });
    expect(parsed.rows).toHaveLength(2);
  });

  it('propagates the NUMERIC_ONLY math gate through the envelope', () => {
    expect(() =>
      phase6Schema.parse({
        ...envelope(),
        rows: [{ req_id: 'UC01.R01', text: 'slow', requirement_class: 'performance' }],
      }),
    ).toThrow(/math_derivation is required/);
  });
});
