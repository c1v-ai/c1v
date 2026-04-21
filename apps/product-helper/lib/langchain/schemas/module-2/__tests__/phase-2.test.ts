import { describe, it, expect } from '@jest/globals';
import { phase2Schema } from '../phase-2-thinking-functionally';

function envelope() {
  return {
    _schema: 'module-2.phase-2-thinking-functionally.v1',
    _output_path: 'F14/2/Phase2.json',
    _phase_status: 'complete' as const,
    metadata: {
      phase_number: 2,
      phase_slug: 'thinking-functionally',
      phase_name: 'Phase 2 — Thinking Functionally',
      schema_version: '1.0.0',
      project_id: 30,
      project_name: 'Heat Guard',
      author: 'extraction_agent',
      generated_at: '2026-04-21T12:00:00Z',
      generator: 'product-helper@0.1.0',
    },
  };
}

describe('phase2Schema — envelope-only ack (C2)', () => {
  it('parses with nothing beyond the envelope', () => {
    const parsed = phase2Schema.parse(envelope());
    expect(parsed._phase_status).toBe('complete');
    expect(parsed.carried_constants).toEqual([]);
  });

  it('accepts decomposition_depth when supplied', () => {
    const parsed = phase2Schema.parse({
      ...envelope(),
      decomposition_depth: { max: 3, rationale: 'Three levels keep the UC set visible on one screen.' },
    });
    expect(parsed.decomposition_depth?.max).toBe(3);
  });

  it('clamps decomposition_depth.max into [1, 5]', () => {
    expect(() =>
      phase2Schema.parse({
        ...envelope(),
        decomposition_depth: { max: 6, rationale: 'too deep' },
      }),
    ).toThrow();
  });

  it('carries constants forward as strings', () => {
    const parsed = phase2Schema.parse({
      ...envelope(),
      carried_constants: ['AVAILABILITY_TARGET', 'P95_LATENCY_MS'],
    });
    expect(parsed.carried_constants).toHaveLength(2);
  });
});
