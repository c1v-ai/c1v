/**
 * Module 2 shared-schema tests (Gate B foundation).
 *
 * Proves the shape contract for every reusable primitive before any phase
 * file extends them. Covers compile-time drift guards (Pick-style selection)
 * AND runtime parse coherence against minimal fixtures.
 *
 * @module lib/langchain/schemas/module-2/__tests__/_shared.test.ts
 */

import { describe, it, expect } from '@jest/globals';
import {
  phaseStatusSchema,
  softwareArchRefSchema,
  softwareArchDecisionSchema,
  mathDerivationSchema,
  sourceRefSchema,
  sourceLensSchema,
  metadataHeaderSchema,
  columnPlanSchema,
  insertionSchema,
  phaseEnvelopeSchema,
} from '..';

// ─────────────────────────────────────────────────────────────────────────
// phaseStatusSchema (C4 discriminator)
// ─────────────────────────────────────────────────────────────────────────

describe('phaseStatusSchema', () => {
  it('accepts the 4 workflow states', () => {
    for (const s of ['planned', 'in_progress', 'complete', 'needs_revision'] as const) {
      expect(phaseStatusSchema.parse(s)).toBe(s);
    }
  });

  it('rejects unknown states', () => {
    expect(() => phaseStatusSchema.parse('draft')).toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────
// softwareArchRefSchema (flag A: expanded to 12)
// ─────────────────────────────────────────────────────────────────────────

describe('softwareArchRefSchema — 12 KB-grounded refs', () => {
  const pilot = ['cap_theorem', 'resiliency', 'caching', 'load_balancing', 'api_design', 'none'];
  const expansion = [
    'observability',
    'maintainability',
    'cdn_networking',
    'message_queues',
    'data_model',
    'deployment_cicd',
  ];

  it.each([...pilot, ...expansion])('accepts ref=%s', (ref) => {
    expect(softwareArchRefSchema.parse(ref)).toBe(ref);
  });

  it('exposes exactly 12 values', () => {
    expect(softwareArchRefSchema.options).toHaveLength(12);
  });

  it('rejects refs that lack a backing KB file', () => {
    expect(() => softwareArchRefSchema.parse('microservices')).toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────
// softwareArchDecisionSchema
// ─────────────────────────────────────────────────────────────────────────

describe('softwareArchDecisionSchema', () => {
  it('requires ref + rationale; defaults trade-off arrays to empty', () => {
    const parsed = softwareArchDecisionSchema.parse({
      ref: 'cap_theorem',
      rationale: 'Prioritize availability in partition scenarios.',
    });
    expect(parsed.ref).toBe('cap_theorem');
    expect(parsed.tradeoffs).toEqual([]);
    expect(parsed.alternatives_rejected).toEqual([]);
  });

  it('carries trade-offs and alternatives when provided', () => {
    const parsed = softwareArchDecisionSchema.parse({
      ref: 'caching',
      rationale: 'Read-heavy workload favors cache-aside.',
      tradeoffs: ['stale reads accepted up to 5s'],
      alternatives_rejected: ['write-through: too chatty'],
    });
    expect(parsed.tradeoffs).toHaveLength(1);
    expect(parsed.alternatives_rejected).toHaveLength(1);
  });

  it('rejects when ref is missing', () => {
    expect(() =>
      softwareArchDecisionSchema.parse({ rationale: 'no ref' }),
    ).toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────
// mathDerivationSchema (numeric-gated per flag B)
// ─────────────────────────────────────────────────────────────────────────

describe('mathDerivationSchema', () => {
  it('requires formula + kb_source; defaults inputs to {}', () => {
    const parsed = mathDerivationSchema.parse({
      formula: 'p95 = base + queueing_delay(λ, μ)',
      kb_source: 'api-design-sys-design-kb.md',
    });
    expect(parsed.inputs).toEqual({});
  });

  it('carries numeric and string inputs side-by-side', () => {
    const parsed = mathDerivationSchema.parse({
      formula: 'x = 2 * y',
      kb_source: 'inline',
      inputs: { y: 5, unit: 'ms' },
    });
    expect(parsed.inputs.y).toBe(5);
    expect(parsed.inputs.unit).toBe('ms');
  });

  it('accepts text-valued constants via string result', () => {
    const parsed = mathDerivationSchema.parse({
      formula: 'constant',
      kb_source: 'inline',
      result: 'eventually consistent',
    });
    expect(parsed.result).toBe('eventually consistent');
  });

  it('rejects when formula is missing', () => {
    expect(() =>
      mathDerivationSchema.parse({ kb_source: 'inline' }),
    ).toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────
// sourceRefSchema (C11 unified provenance)
// ─────────────────────────────────────────────────────────────────────────

describe('sourceRefSchema (C11)', () => {
  it('round-trips a sourced_from reference', () => {
    const parsed = sourceRefSchema.parse({
      phase: 'phase-5-ucbd-step-flow',
      artifact: 'UC03.step-2',
      relationship: 'sourced_from',
    });
    expect(parsed.relationship).toBe('sourced_from');
  });

  it('round-trips an also_appears_in reference with a note', () => {
    const parsed = sourceRefSchema.parse({
      phase: 'phase-6-requirements-table',
      artifact: 'UC03.R02',
      relationship: 'also_appears_in',
      note: 'Duplicated intentionally for emphasis.',
    });
    expect(parsed.note).toBe('Duplicated intentionally for emphasis.');
  });

  it('rejects unknown relationship values', () => {
    expect(() =>
      sourceRefSchema.parse({
        phase: 'x',
        artifact: 'y',
        relationship: 'inspired_by',
      }),
    ).toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────
// sourceLensSchema (C9: 3 discriminated enums)
// ─────────────────────────────────────────────────────────────────────────

describe('sourceLensSchema (C9)', () => {
  it('parses lens kind', () => {
    const parsed = sourceLensSchema.parse({ kind: 'lens', value: 'functional_decomposition' });
    expect(parsed.kind).toBe('lens');
  });

  it('parses category kind', () => {
    const parsed = sourceLensSchema.parse({ kind: 'category', value: 'performance' });
    expect(parsed.kind).toBe('category');
  });

  it('parses contractor kind', () => {
    const parsed = sourceLensSchema.parse({ kind: 'contractor', value: 'ffbd_agent' });
    expect(parsed.kind).toBe('contractor');
  });

  it('rejects cross-kind value mix (lens kind, category value)', () => {
    expect(() =>
      sourceLensSchema.parse({ kind: 'lens', value: 'performance' }),
    ).toThrow();
  });

  it('rejects unknown kind', () => {
    expect(() =>
      sourceLensSchema.parse({ kind: 'pillar', value: 'anything' }),
    ).toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────
// metadataHeaderSchema (C1 dual-surface)
// ─────────────────────────────────────────────────────────────────────────

describe('metadataHeaderSchema (C1)', () => {
  function fixture() {
    return {
      phase_number: 6,
      phase_slug: 'requirements-table',
      phase_name: 'Phase 6 — Extract Requirements Table',
      schema_version: '1.0.0',
      project_id: 30,
      project_name: 'Heat Guard',
      author: 'extraction_agent',
      generated_at: '2026-04-21T12:00:00Z',
      generator: 'product-helper@0.1.0',
    };
  }

  it('parses a complete header', () => {
    const parsed = metadataHeaderSchema.parse(fixture());
    expect(parsed.phase_number).toBe(6);
    expect(parsed.revision).toBe(0);
  });

  it('clamps phase_number into [0, 12]', () => {
    expect(() =>
      metadataHeaderSchema.parse({ ...fixture(), phase_number: -1 }),
    ).toThrow();
    expect(() =>
      metadataHeaderSchema.parse({ ...fixture(), phase_number: 13 }),
    ).toThrow();
  });

  it('requires both identity and project-context blocks', () => {
    const f = fixture() as Record<string, unknown>;
    delete f.project_id;
    expect(() => metadataHeaderSchema.parse(f)).toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────
// columnPlanSchema + insertionSchema (C5 first-class)
// ─────────────────────────────────────────────────────────────────────────

describe('columnPlanSchema (C5)', () => {
  it('accepts a 1..3-letter column_letter', () => {
    expect(columnPlanSchema.parse({ column_letter: 'A', field_name: 'id', header_text: 'ID' })).toBeDefined();
    expect(columnPlanSchema.parse({ column_letter: 'AA', field_name: 'id', header_text: 'ID' })).toBeDefined();
    expect(columnPlanSchema.parse({ column_letter: 'BAZ', field_name: 'id', header_text: 'ID' })).toBeDefined();
  });

  it('rejects lowercase or 4+ letter column_letter', () => {
    expect(() =>
      columnPlanSchema.parse({ column_letter: 'a', field_name: 'id', header_text: 'ID' }),
    ).toThrow();
    expect(() =>
      columnPlanSchema.parse({ column_letter: 'ABCD', field_name: 'id', header_text: 'ID' }),
    ).toThrow();
  });

  it('defaults required to false', () => {
    const parsed = columnPlanSchema.parse({
      column_letter: 'A',
      field_name: 'id',
      header_text: 'ID',
    });
    expect(parsed.required).toBe(false);
  });
});

describe('insertionSchema (C5)', () => {
  it('requires phase_slug + field_path + introduced_in + rationale', () => {
    const parsed = insertionSchema.parse({
      phase_slug: 'phase-8-constants-table',
      field_path: 'rows[].math_derivation',
      introduced_in: '1.1.0',
      rationale: 'Math grounding pilot — per plan §4.5.4',
    });
    expect(parsed.phase_slug).toBe('phase-8-constants-table');
  });
});

// ─────────────────────────────────────────────────────────────────────────
// phaseEnvelopeSchema (plan §5 bullet 2; C2 direct consumer for Phase 2)
// ─────────────────────────────────────────────────────────────────────────

describe('phaseEnvelopeSchema (base for all Module 2 phases)', () => {
  function minimalEnvelope() {
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

  it('parses a minimal envelope (no _columns_plan, no _insertions)', () => {
    const parsed = phaseEnvelopeSchema.parse(minimalEnvelope());
    expect(parsed._schema).toMatch(/^module-2\./);
    expect(parsed._phase_status).toBe('complete');
    expect(parsed._columns_plan).toBeUndefined();
    expect(parsed._insertions).toBeUndefined();
  });

  it('parses an envelope with populated first-class methodology fields', () => {
    const parsed = phaseEnvelopeSchema.parse({
      ...minimalEnvelope(),
      _columns_plan: [
        { column_letter: 'A', field_name: 'id', header_text: 'ID', required: true },
      ],
      _insertions: [
        {
          phase_slug: 'phase-8-constants-table',
          field_path: 'rows[].math_derivation',
          introduced_in: '1.1.0',
          rationale: 'Math grounding pilot.',
        },
      ],
    });
    expect(parsed._columns_plan).toHaveLength(1);
    expect(parsed._insertions).toHaveLength(1);
  });

  it('rejects an envelope missing any of the 4 reserved fields', () => {
    const env = minimalEnvelope() as Record<string, unknown>;
    delete env._schema;
    expect(() => phaseEnvelopeSchema.parse(env)).toThrow();
  });

  it('propagates phaseStatus strictness into the envelope', () => {
    expect(() =>
      phaseEnvelopeSchema.parse({ ...minimalEnvelope(), _phase_status: 'draft' }),
    ).toThrow();
  });
});
