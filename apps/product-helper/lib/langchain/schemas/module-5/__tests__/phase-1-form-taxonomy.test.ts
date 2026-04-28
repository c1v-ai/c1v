import { describe, it, expect } from '@jest/globals';
import {
  phase1FormTaxonomySchema,
  type Phase1FormTaxonomy,
} from '../phase-1-form-taxonomy';
import { envelope, roundTrip } from '../../__tests__/crawley-fixtures';
import { zodToStrictJsonSchema } from '../../zod-to-json';

function fixture(): unknown {
  return {
    ...envelope('module-5.phase-1-form-taxonomy.v1', 'M5/01-Phase-1-Form-Taxonomy.json', 1),
    form_entities: [
      {
        object_id: 'L0',
        name: 'PRD Helper System',
        decomposition_level: 0,
        parent_entity_id: null,
        attributes: {},
        formal_relationships: [],
        is_physical: true,
        decomposability: 'modular' as const,
      },
      {
        object_id: 'L1.api',
        name: 'API Server',
        decomposition_level: 1,
        parent_entity_id: 'L0',
        attributes: {},
        formal_relationships: [],
        is_physical: true,
        decomposability: 'modular' as const,
      },
    ],
    interfaces: [],
    accompanying_systems: [],
    use_context_entities: [],
    crawley_glossary_refs: [],
  };
}

describe('phase1FormTaxonomySchema (Crawley Ch 4)', () => {
  it('parses a valid fixture', () => {
    const parsed = phase1FormTaxonomySchema.parse(fixture());
    expect(parsed.form_entities).toHaveLength(2);
  });

  it('round-trips through JSON', () => {
    const parsed = phase1FormTaxonomySchema.parse(fixture());
    expect(phase1FormTaxonomySchema.parse(roundTrip(parsed))).toEqual(parsed);
  });

  it('rejects when no entity is physical (Box 4.7 Dualism)', () => {
    const bad = fixture() as { form_entities: Array<{ is_physical: boolean }> };
    bad.form_entities.forEach((e) => {
      e.is_physical = false;
    });
    expect(() => phase1FormTaxonomySchema.parse(bad)).toThrow();
  });

  it('rejects multiple Level-0 entities', () => {
    const bad = fixture() as {
      form_entities: Array<{ object_id: string; decomposition_level: number; parent_entity_id: string | null }>;
    };
    bad.form_entities[1].decomposition_level = 0;
    bad.form_entities[1].parent_entity_id = null;
    expect(() => phase1FormTaxonomySchema.parse(bad)).toThrow();
  });

  it('rejects entity name not starting with capital letter', () => {
    const bad = fixture() as { form_entities: Array<{ name: string }> };
    bad.form_entities[1].name = 'lowercase api';
    expect(() => phase1FormTaxonomySchema.parse(bad)).toThrow();
  });

  it('describe() metadata uses x-ui-surface= prefix', () => {
    const json = zodToStrictJsonSchema(phase1FormTaxonomySchema, 'Phase1FormTaxonomy') as {
      description?: string;
    };
    expect(json.description).toMatch(/^x-ui-surface=/);
  });

  it('type narrowing works through the inferred type', () => {
    const parsed: Phase1FormTaxonomy = phase1FormTaxonomySchema.parse(fixture());
    expect(parsed._schema).toBe('module-5.phase-1-form-taxonomy.v1');
  });
});
