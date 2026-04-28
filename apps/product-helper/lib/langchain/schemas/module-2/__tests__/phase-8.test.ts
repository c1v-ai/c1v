import { describe, it, expect } from '@jest/globals';
import { phase8Schema, phase8RowSchema } from '..';

function envelope() {
  return {
    _schema: 'module-2.phase-8-constants-table.v1',
    _output_path: 'F14/2/Phase8.json',
    _phase_status: 'complete' as const,
    metadata: {
      phase_number: 8,
      phase_slug: 'constants-table',
      phase_name: 'Phase 8 — Constants Table',
      schema_version: '1.0.0',
      project_id: 30,
      project_name: 'Heat Guard',
      author: 'extraction_agent',
      generated_at: '2026-04-21T12:00:00Z',
      generator: 'product-helper@0.1.0',
    },
  };
}

describe('phase8RowSchema', () => {
  it('parses a numeric constant with math + arch decision', () => {
    const parsed = phase8RowSchema.parse({
      req_id: 'UC01.R03',
      text: 'Availability target.',
      requirement_class: 'reliability',
      constant_name: 'AVAILABILITY_TARGET',
      value: 99.9,
      unit: '%',
      math_derivation: { formula: '1 - failure_rate', kb_source: 'cap_theorem' },
      software_arch_decision: { ref: 'cap_theorem', rationale: 'Favor A over C under partition.' },
    });
    expect(parsed.software_arch_decision?.ref).toBe('cap_theorem');
  });

  it('accepts expanded flag-A refs (deployment_cicd)', () => {
    const parsed = phase8RowSchema.parse({
      req_id: 'UC01.R04',
      text: 'Deploy pipeline count.',
      requirement_class: 'maintainability',
      constant_name: 'DEPLOY_PIPELINES',
      value: 3,
      software_arch_decision: {
        ref: 'deployment_cicd',
        rationale: 'One per subsystem — matches topology.',
      },
    });
    expect(parsed.software_arch_decision?.ref).toBe('deployment_cicd');
  });

  it('rejects lowercase constant_name', () => {
    expect(() =>
      phase8RowSchema.parse({
        req_id: 'UC01.R03',
        text: 'x',
        requirement_class: 'functional',
        constant_name: 'availability_target',
        value: 1,
      }),
    ).toThrow();
  });

  it('still enforces numeric-math gate on constants table', () => {
    expect(() =>
      phase8RowSchema.parse({
        req_id: 'UC01.R03',
        text: 'x',
        requirement_class: 'performance',
        constant_name: 'LATENCY_P95',
        value: 200,
      }),
    ).toThrow(/math_derivation is required/);
  });

  it('allows text-valued constants', () => {
    const parsed = phase8RowSchema.parse({
      req_id: 'UC01.R05',
      text: 'Consistency model.',
      requirement_class: 'functional',
      constant_name: 'CONSISTENCY_MODEL',
      value: 'eventually consistent',
    });
    expect(parsed.value).toBe('eventually consistent');
  });
});

describe('phase8Schema', () => {
  it('parses a full envelope with namespace + rows', () => {
    const parsed = phase8Schema.parse({
      ...envelope(),
      constants_namespace: 'M2.NFR',
      rows: [
        {
          req_id: 'UC01.R03',
          text: 'x',
          requirement_class: 'functional',
          constant_name: 'X',
          value: 1,
        },
      ],
    });
    expect(parsed.constants_namespace).toBe('M2.NFR');
  });
});
