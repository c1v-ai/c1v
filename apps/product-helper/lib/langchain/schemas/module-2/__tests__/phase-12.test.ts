import { describe, it, expect } from '@jest/globals';
import {
  phase12HandoffSchema,
  operationalPrimitivesSchema,
  sessionShapeSchema,
} from '../phase-12-ffbd-handoff';
import { phase12FinalReviewSchema } from '../phase-12-final-review';

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

function numericPrim(v: number, unit: string) {
  return {
    value: v,
    unit,
    math_derivation: { formula: 'const', kb_source: 'inline', inputs: {} },
  };
}

describe('sessionShapeSchema (C8 structural subshape — no math gate)', () => {
  it('parses the minimal required trio', () => {
    const parsed = sessionShapeSchema.parse({
      duration_s: 60,
      actions_count: 3,
      burstiness: 'steady',
    });
    expect(parsed.duration_s).toBe(60);
    expect(parsed.think_time_s).toBeUndefined();
  });

  it('rejects unknown burstiness', () => {
    expect(() =>
      sessionShapeSchema.parse({ duration_s: 1, actions_count: 0, burstiness: 'chaotic' }),
    ).toThrow();
  });
});

describe('operationalPrimitivesSchema (C8 — 4/6 math density)', () => {
  it('requires math_derivation on each of the 4 numeric primitives', () => {
    const parsed = operationalPrimitivesSchema.parse({
      actions_per_uc: numericPrim(3, 'actions'),
      bytes_in_per_action: numericPrim(512, 'bytes'),
      bytes_out_per_action: numericPrim(1024, 'bytes'),
      freq_per_dau: numericPrim(5, 'events/day'),
      session_shape: { duration_s: 60, actions_count: 3, burstiness: 'steady' },
    });
    expect(parsed.actions_per_uc.math_derivation.formula).toBe('const');
    expect(parsed.data_objects).toEqual([]);
  });

  it('rejects a numeric primitive missing math_derivation', () => {
    expect(() =>
      operationalPrimitivesSchema.parse({
        actions_per_uc: { value: 3, unit: 'actions' },
        bytes_in_per_action: numericPrim(512, 'bytes'),
        bytes_out_per_action: numericPrim(1024, 'bytes'),
        freq_per_dau: numericPrim(5, 'events/day'),
        session_shape: { duration_s: 60, actions_count: 3, burstiness: 'steady' },
      }),
    ).toThrow();
  });

  it('allows data_objects[] without math (structural)', () => {
    const parsed = operationalPrimitivesSchema.parse({
      actions_per_uc: numericPrim(1, 'actions'),
      bytes_in_per_action: numericPrim(1, 'bytes'),
      bytes_out_per_action: numericPrim(1, 'bytes'),
      freq_per_dau: numericPrim(1, 'events/day'),
      session_shape: { duration_s: 1, actions_count: 1, burstiness: 'steady' },
      data_objects: [{ name: 'Reading', avg_size_bytes: 256, persistence: 'durable' }],
    });
    expect(parsed.data_objects).toHaveLength(1);
  });
});

describe('phase12HandoffSchema', () => {
  it('requires uc_id matching C12 regex', () => {
    expect(() =>
      phase12HandoffSchema.parse({
        ...envelope(12, 'ffbd-handoff', 'Phase 12a — FFBD Handoff'),
        uc_id: 'UC100',
        operational_primitives: {
          actions_per_uc: numericPrim(1, 'actions'),
          bytes_in_per_action: numericPrim(1, 'bytes'),
          bytes_out_per_action: numericPrim(1, 'bytes'),
          freq_per_dau: numericPrim(1, 'events/day'),
          session_shape: { duration_s: 1, actions_count: 1, burstiness: 'steady' },
        },
      }),
    ).toThrow();
  });

  it('parses a complete FFBD handoff packet', () => {
    const parsed = phase12HandoffSchema.parse({
      ...envelope(12, 'ffbd-handoff', 'Phase 12a — FFBD Handoff'),
      uc_id: 'UC01',
      operational_primitives: {
        actions_per_uc: numericPrim(3, 'actions'),
        bytes_in_per_action: numericPrim(512, 'bytes'),
        bytes_out_per_action: numericPrim(1024, 'bytes'),
        freq_per_dau: numericPrim(5, 'events/day'),
        session_shape: { duration_s: 60, actions_count: 3, burstiness: 'bursty' },
      },
    });
    expect(parsed.uc_id).toBe('UC01');
  });
});

describe('phase12FinalReviewSchema (C7 split)', () => {
  it('parses an approved review with zero flags', () => {
    const parsed = phase12FinalReviewSchema.parse({
      ...envelope(12, 'final-review', 'Phase 12b — Final Review'),
      verdict: 'approved',
      verdict_rationale: 'All phases complete; audit clean.',
      reviewer: 'human_reviewer',
      reviewed_at: '2026-04-21T13:00:00Z',
    });
    expect(parsed.review_flags).toEqual([]);
  });

  it('carries review flags with target provenance', () => {
    const parsed = phase12FinalReviewSchema.parse({
      ...envelope(12, 'final-review', 'Phase 12b — Final Review'),
      verdict: 'revisions_requested',
      verdict_rationale: 'One flag pending.',
      reviewer: 'human_reviewer',
      reviewed_at: '2026-04-21T13:00:00Z',
      review_flags: [
        {
          flag_id: 'RF-01',
          severity: 'error',
          message: 'Math derivation missing citation.',
          target: {
            phase: 'phase-6-requirements-table',
            artifact: 'UC01.R02',
            relationship: 'refines',
          },
        },
      ],
    });
    expect(parsed.review_flags[0].target?.phase).toBe('phase-6-requirements-table');
  });
});
