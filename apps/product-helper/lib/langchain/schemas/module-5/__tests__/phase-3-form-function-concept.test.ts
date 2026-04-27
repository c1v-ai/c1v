import { describe, it, expect } from '@jest/globals';
import { phase3FormFunctionConceptSchema } from '../phase-3-form-function-concept';
import { envelope, roundTrip } from '../../__tests__/crawley-fixtures';

const blockKinds = ['pp', 'po', 'pf', 'op', 'oo', 'of', 'fp', 'fo', 'ff'] as const;

function blockDerivation(kind: (typeof blockKinds)[number]) {
  return {
    block_kind: kind,
    derivation: {
      formula: `${kind} block`,
      inputs: {},
      kb_source: 'crawley-ch6',
      result_kind: 'matrix' as const,
      result_matrix: [[0]],
      result_shape: [1, 1] as [number, number],
      result_is_square: true,
    },
  };
}

function fixture(): unknown {
  return {
    ...envelope('module-5.phase-3-form-function-concept.v1', 'M5/03-Phase-3.json', 3),
    form_function_maps: [
      {
        map_id: 'M1',
        process_id: 'authoring',
        instrument_form_ids: ['L1.api'],
        operand_id: 'PRD',
        mapping_cardinality: 'one_to_one_same_operand' as const,
        figure_6_5_pattern_quote: 'one form to one process',
        structure_exception: 'none' as const,
      },
    ],
    architecture_layers: {
      value_operands: ['PRD'],
      value_processes: ['authoring'],
      value_instruments: ['L1.api'],
      supporting_processes: [['parsing']],
      supporting_instruments: [['L1.parser']],
    },
    non_idealities: [],
    interfaces: [],
    operational_behavior: {
      operator: { kind: 'active' as const, role_description: 'PM authors' },
      sequence: ['authoring', 'review'],
      parallel_threads: [],
      clock_time_critical: false,
      timing_constraints: [],
    },
    full_dsm: {
      pp: {}, po: {}, pf: {}, op: {}, oo: {}, of: {}, fp: {}, fo: {}, ff: {},
    },
    full_dsm_block_derivations: blockKinds.map(blockDerivation),
    dsm_projection_chain_derivation: {
      formula: 'FP × PP × PF + FP × PP × PO × OO × OP × PP × PF',
      inputs: {},
      kb_source: 'crawley-ch6',
    },
    operand_interactions: [
      {
        category: 'information' as const,
        sub_category: 'signal' as const,
        interaction: 'data' as const,
      },
    ],
    form_count_ratio: 1.5,
    crawley_glossary_refs: [],
  };
}

describe('phase3FormFunctionConceptSchema (Crawley Ch 6)', () => {
  it('parses a valid fixture', () => {
    const parsed = phase3FormFunctionConceptSchema.parse(fixture());
    expect(parsed.full_dsm_block_derivations).toHaveLength(9);
  });

  it('round-trips through JSON', () => {
    const parsed = phase3FormFunctionConceptSchema.parse(fixture());
    expect(phase3FormFunctionConceptSchema.parse(roundTrip(parsed))).toEqual(parsed);
  });

  it('rejects no_instrument mapping when phase=complete', () => {
    const bad = fixture() as {
      form_function_maps: Array<{ mapping_cardinality: string }>;
    };
    bad.form_function_maps[0].mapping_cardinality = 'no_instrument';
    expect(() => phase3FormFunctionConceptSchema.parse(bad)).toThrow();
  });

  it('rejects supporting_processes ↔ supporting_instruments layer mismatch', () => {
    const bad = fixture() as {
      architecture_layers: { supporting_instruments: string[][] };
    };
    bad.architecture_layers.supporting_instruments = [];
    expect(() => phase3FormFunctionConceptSchema.parse(bad)).toThrow();
  });

  it('rejects form_count_ratio > 3.0', () => {
    const bad = fixture() as { form_count_ratio: number };
    bad.form_count_ratio = 4.0;
    expect(() => phase3FormFunctionConceptSchema.parse(bad)).toThrow();
  });

  it('rejects fewer than 9 distinct block kinds', () => {
    const bad = fixture() as {
      full_dsm_block_derivations: Array<{ block_kind: string }>;
    };
    bad.full_dsm_block_derivations[0].block_kind = 'pp';
    bad.full_dsm_block_derivations[1].block_kind = 'pp';
    expect(() => phase3FormFunctionConceptSchema.parse(bad)).toThrow();
  });
});
