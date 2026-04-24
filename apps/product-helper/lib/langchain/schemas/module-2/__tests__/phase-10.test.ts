import { describe, it, expect } from '@jest/globals';
import { phase10Schema, sysmlNodeKindSchema } from '..';

function envelope() {
  return {
    _schema: 'module-2.phase-10-sysml-activity.v1',
    _output_path: 'F14/2/Phase10.json',
    _phase_status: 'complete' as const,
    metadata: {
      phase_number: 10,
      phase_slug: 'sysml-activity',
      phase_name: 'Phase 10 — SysML Activity',
      schema_version: '1.0.0',
      project_id: 30,
      project_name: 'Heat Guard',
      author: 'extraction_agent',
      generated_at: '2026-04-21T12:00:00Z',
      generator: 'product-helper@0.1.0',
    },
  };
}

describe('sysmlNodeKindSchema', () => {
  it('accepts all 7 SysML node kinds', () => {
    for (const k of ['initial', 'action', 'decision', 'merge', 'fork', 'join', 'final'] as const) {
      expect(sysmlNodeKindSchema.parse(k)).toBe(k);
    }
  });

  it('rejects unknown kinds', () => {
    expect(() => sysmlNodeKindSchema.parse('branch')).toThrow();
  });
});

describe('phase10Schema', () => {
  it('parses a minimal activity graph with fork/join', () => {
    const parsed = phase10Schema.parse({
      ...envelope(),
      nodes: [
        { id: 'I1', kind: 'initial', label: 'start' },
        { id: 'F1', kind: 'fork', label: 'parallel' },
        { id: 'A1', kind: 'action', label: 'predict' },
        { id: 'A2', kind: 'action', label: 'log' },
        { id: 'J1', kind: 'join', label: 'rejoin' },
        { id: 'Fi', kind: 'final', label: 'end' },
      ],
      edges: [
        { from: 'I1', to: 'F1' },
        { from: 'F1', to: 'A1' },
        { from: 'F1', to: 'A2' },
        { from: 'A1', to: 'J1' },
        { from: 'A2', to: 'J1' },
        { from: 'J1', to: 'Fi' },
      ],
      fork_join_count: 1,
      concurrency_math: {
        formula: 'token_flow = max(path_durations)',
        kb_source: 'message-queues-kb.md',
      },
    });
    expect(parsed.fork_join_count).toBe(1);
    expect(parsed.nodes).toHaveLength(6);
  });

  it('rejects negative fork_join_count', () => {
    expect(() =>
      phase10Schema.parse({
        ...envelope(),
        nodes: [],
        edges: [],
        fork_join_count: -1,
        concurrency_math: { formula: 'x', kb_source: 'inline' },
      }),
    ).toThrow();
  });
});
