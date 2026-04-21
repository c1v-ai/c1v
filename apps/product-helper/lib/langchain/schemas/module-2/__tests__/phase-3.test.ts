import { describe, it, expect } from '@jest/globals';
import { phase3Schema, ucbdHeaderSchema, ucIdSchema } from '../phase-3-ucbd-setup';

function envelope() {
  return {
    _schema: 'module-2.phase-3-ucbd-setup.v1',
    _output_path: 'F14/2/Phase3.json',
    _phase_status: 'complete' as const,
    metadata: {
      phase_number: 3,
      phase_slug: 'ucbd-setup',
      phase_name: 'Phase 3 — UCBD Setup',
      schema_version: '1.0.0',
      project_id: 30,
      project_name: 'Heat Guard',
      author: 'extraction_agent',
      generated_at: '2026-04-21T12:00:00Z',
      generator: 'product-helper@0.1.0',
    },
  };
}

function minimalUcbd() {
  return {
    uc_id: 'UC01',
    uc_name: 'Submit heat reading',
    actor: 'Worker',
    trigger: 'Periodic sensor emit',
    priority: 'must' as const,
    actor_goal: 'Get safety status in real time.',
  };
}

describe('ucIdSchema (C12)', () => {
  it('accepts UC01..UC99 and CC', () => {
    expect(ucIdSchema.parse('UC01')).toBe('UC01');
    expect(ucIdSchema.parse('UC99')).toBe('UC99');
    expect(ucIdSchema.parse('CC')).toBe('CC');
  });

  it('rejects UC100 (cap surfaces before silent overflow)', () => {
    expect(() => ucIdSchema.parse('UC100')).toThrow();
  });

  it('rejects lowercase / wrong prefix', () => {
    expect(() => ucIdSchema.parse('uc01')).toThrow();
    expect(() => ucIdSchema.parse('U01')).toThrow();
  });
});

describe('ucbdHeaderSchema', () => {
  it('parses a minimal UCBD header (defaults also_appears_in to [])', () => {
    const parsed = ucbdHeaderSchema.parse(minimalUcbd());
    expect(parsed.also_appears_in).toEqual([]);
  });

  it('carries also_appears_in references (C11)', () => {
    const parsed = ucbdHeaderSchema.parse({
      ...minimalUcbd(),
      also_appears_in: [
        { phase: 'phase-6-requirements-table', artifact: 'UC01.R03', relationship: 'also_appears_in' },
      ],
    });
    expect(parsed.also_appears_in).toHaveLength(1);
  });

  it('rejects when uc_id violates the regex', () => {
    expect(() => ucbdHeaderSchema.parse({ ...minimalUcbd(), uc_id: 'UC123' })).toThrow();
  });
});

describe('phase3Schema', () => {
  it('parses a full envelope with two UCBDs', () => {
    const parsed = phase3Schema.parse({
      ...envelope(),
      ucbds: [minimalUcbd(), { ...minimalUcbd(), uc_id: 'UC02' }],
    });
    expect(parsed.ucbds).toHaveLength(2);
  });

  it('rejects when ucbds is missing', () => {
    expect(() => phase3Schema.parse(envelope())).toThrow();
  });

  it('inherits envelope reserved fields', () => {
    const parsed = phase3Schema.parse({
      ...envelope(),
      ucbds: [minimalUcbd()],
    });
    expect(parsed._schema).toMatch(/phase-3-ucbd-setup/);
    expect(parsed._phase_status).toBe('complete');
  });
});
