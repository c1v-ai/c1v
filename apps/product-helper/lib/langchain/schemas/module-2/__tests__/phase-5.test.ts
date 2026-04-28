import { describe, it, expect } from '@jest/globals';
import {
  phase5Schema,
  ucbdPhase5Schema,
  ucbdStepSchema,
  ucbdPhase4Schema,
  ucbdHeaderSchema,
} from '..';

function baseUcbd() {
  return {
    uc_id: 'UC01',
    uc_name: 'Submit heat reading',
    actor: 'Worker',
    trigger: 'Sensor emit',
    priority: 'must' as const,
    actor_goal: 'Get real-time safety status.',
    preconditions: [{ clause: 'Worker on shift' }],
    postconditions: [{ clause: 'Reading visible' }],
    exit_criteria: ['Reading displayed ≤ 1s'],
  };
}

function envelope() {
  return {
    _schema: 'module-2.phase-5-ucbd-step-flow.v1',
    _output_path: 'F14/2/Phase5.json',
    _phase_status: 'complete' as const,
    metadata: {
      phase_number: 5,
      phase_slug: 'ucbd-step-flow',
      phase_name: 'Phase 5 — UCBD Step Flow',
      schema_version: '1.0.0',
      project_id: 30,
      project_name: 'Heat Guard',
      author: 'extraction_agent',
      generated_at: '2026-04-21T12:00:00Z',
      generator: 'product-helper@0.1.0',
    },
  };
}

describe('ucbdStepSchema — NUMERIC_ONLY math gating (flag B)', () => {
  it('parses a step without a budget (math not required)', () => {
    const parsed = ucbdStepSchema.parse({
      step_number: 1,
      actor: 'actor',
      action: 'Worker taps submit',
    });
    expect(parsed.step_budget_ms).toBeUndefined();
    expect(parsed.step_budget_math).toBeUndefined();
  });

  it('parses a step with budget + math together', () => {
    const parsed = ucbdStepSchema.parse({
      step_number: 2,
      actor: 'system',
      action: 'Persist reading',
      system_response: 'HTTP 201',
      step_budget_ms: 200,
      step_budget_math: {
        formula: 'p95 = base + queueing_delay',
        kb_source: 'api-design-sys-design-kb.md',
        kb_section: '§P95 envelope',
        inputs: { base: 50, lambda: 100 },
      },
    });
    expect(parsed.step_budget_ms).toBe(200);
    expect(parsed.step_budget_math?.formula).toMatch(/queueing_delay/);
  });

  it('rejects a step that asserts a budget without math (gating guard)', () => {
    expect(() =>
      ucbdStepSchema.parse({
        step_number: 3,
        actor: 'system',
        action: 'Ack',
        step_budget_ms: 150,
      }),
    ).toThrow(/step_budget_math is required/);
  });

  it('rejects step_number ≤ 0', () => {
    expect(() =>
      ucbdStepSchema.parse({ step_number: 0, actor: 'actor', action: 'noop' }),
    ).toThrow();
  });
});

describe('ucbdPhase5Schema — C3 .extend() superset of Phase 4 + 3', () => {
  it('carries steps alongside preconditions/postconditions/exit_criteria', () => {
    const parsed = ucbdPhase5Schema.parse({
      ...baseUcbd(),
      steps: [{ step_number: 1, actor: 'actor', action: 'tap' }],
    });
    expect(parsed.steps).toHaveLength(1);
    expect(parsed.preconditions).toHaveLength(1);
  });

  it('any Phase-5 UCBD parses under Phase 4 and Phase 3 (superset contract)', () => {
    const p5 = ucbdPhase5Schema.parse({
      ...baseUcbd(),
      steps: [{ step_number: 1, actor: 'actor', action: 'tap' }],
    });
    expect(() => ucbdPhase4Schema.parse(p5)).not.toThrow();
    expect(() => ucbdHeaderSchema.parse(p5)).not.toThrow();
  });
});

describe('phase5Schema', () => {
  it('parses a complete envelope with stepful UCBDs', () => {
    const parsed = phase5Schema.parse({
      ...envelope(),
      ucbds: [
        {
          ...baseUcbd(),
          steps: [
            { step_number: 1, actor: 'actor', action: 'tap submit' },
            { step_number: 2, actor: 'system', action: 'persist', step_budget_ms: 100, step_budget_math: { formula: 'x=1', kb_source: 'inline' } },
          ],
        },
      ],
    });
    expect(parsed.ucbds[0].steps).toHaveLength(2);
  });
});
