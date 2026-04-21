import { describe, it, expect } from '@jest/globals';
import { phase4Schema, ucbdPhase4Schema } from '../phase-4-start-end-conditions';
import { ucbdHeaderSchema } from '../phase-3-ucbd-setup';

function phase3Ucbd() {
  return {
    uc_id: 'UC01',
    uc_name: 'Submit heat reading',
    actor: 'Worker',
    trigger: 'Periodic sensor emit',
    priority: 'must' as const,
    actor_goal: 'Get safety status in real time.',
  };
}

function envelope() {
  return {
    _schema: 'module-2.phase-4-start-end-conditions.v1',
    _output_path: 'F14/2/Phase4.json',
    _phase_status: 'complete' as const,
    metadata: {
      phase_number: 4,
      phase_slug: 'start-end-conditions',
      phase_name: 'Phase 4 — Start/End Conditions',
      schema_version: '1.0.0',
      project_id: 30,
      project_name: 'Heat Guard',
      author: 'extraction_agent',
      generated_at: '2026-04-21T12:00:00Z',
      generator: 'product-helper@0.1.0',
    },
  };
}

describe('ucbdPhase4Schema — C3 .extend() superset of Phase 3', () => {
  it('parses a Phase-3-shaped UCBD with zero conditions', () => {
    const parsed = ucbdPhase4Schema.parse(phase3Ucbd());
    expect(parsed.preconditions).toEqual([]);
    expect(parsed.postconditions).toEqual([]);
    expect(parsed.exit_criteria).toEqual([]);
  });

  it('carries preconditions, postconditions, and exit_criteria', () => {
    const parsed = ucbdPhase4Schema.parse({
      ...phase3Ucbd(),
      preconditions: [{ clause: 'User is authenticated' }],
      postconditions: [{ clause: 'Reading persisted', source: 'interview' }],
      exit_criteria: ['Reading visible in dashboard within 1s'],
    });
    expect(parsed.preconditions).toHaveLength(1);
    expect(parsed.postconditions[0].source).toBe('interview');
    expect(parsed.exit_criteria).toHaveLength(1);
  });

  it('any Phase-4 UCBD also parses under Phase 3 (superset contract)', () => {
    const phase4Ucbd = ucbdPhase4Schema.parse({
      ...phase3Ucbd(),
      preconditions: [{ clause: 'Authed' }],
    });
    expect(() => ucbdHeaderSchema.parse(phase4Ucbd)).not.toThrow();
  });
});

describe('phase4Schema', () => {
  it('parses a full envelope with UCBDs that include conditions', () => {
    const parsed = phase4Schema.parse({
      ...envelope(),
      ucbds: [
        {
          ...phase3Ucbd(),
          preconditions: [{ clause: 'A' }, { clause: 'B' }],
          exit_criteria: ['C'],
        },
      ],
    });
    expect(parsed.ucbds[0].preconditions).toHaveLength(2);
  });

  it('rejects envelope missing ucbds', () => {
    expect(() => phase4Schema.parse(envelope())).toThrow();
  });
});
