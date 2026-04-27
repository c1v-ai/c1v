import { describe, it, expect } from '@jest/globals';
import { phase2FunctionTaxonomySchema } from '../phase-2-function-taxonomy';
import { envelope, roundTrip } from '../../__tests__/crawley-fixtures';

function fixture(): unknown {
  return {
    ...envelope('module-5.phase-2-function-taxonomy.v1', 'M5/02-Phase-2-Function-Taxonomy.json', 2),
    primary_external_function: {
      operand: 'PRD',
      value_related_attribute: 'completeness',
      value_related_state: 'complete',
      process: 'authoring',
      instrument_form_ref: 'L0',
      boundary_interface_ref: 'IF.1',
      replacement_test_answer: 'cannot replace authoring without losing PRD',
    },
    secondary_external_functions: [],
    internal_functions: [
      {
        function_id: 'F1',
        process: 'parsing',
        operand: 'idea',
        instrument_form_ref: 'L1.api',
        blueprint_ref: 'transferring_information' as const,
      },
    ],
    functional_interactions: [],
    po_array: [
      { process_id: 'authoring', cells: { PRD: "c'" } },
      { process_id: 'review', cells: { PRD: 'a' } },
    ],
    po_array_derivation: {
      formula: 'PO = F · O',
      inputs: { f_count: 2, o_count: 1 },
      kb_source: 'crawley-ch5',
      result_kind: 'matrix' as const,
      result_matrix: [["c'"], ['a']],
      result_shape: [2, 1] as [number, number],
      result_is_square: false,
    },
    value_pathway: [
      { step_index: 0, process_id: 'authoring', operand_id: 'idea', relationship: 'create' as const },
      { step_index: 1, process_id: 'review', operand_id: 'PRD', relationship: 'affect' as const },
    ],
    crawley_glossary_refs: [],
  };
}

describe('phase2FunctionTaxonomySchema (Crawley Ch 5)', () => {
  it('parses a valid fixture', () => {
    const parsed = phase2FunctionTaxonomySchema.parse(fixture());
    expect(parsed.po_array_derivation.result_kind).toBe('matrix');
  });

  it('round-trips through JSON', () => {
    const parsed = phase2FunctionTaxonomySchema.parse(fixture());
    expect(phase2FunctionTaxonomySchema.parse(roundTrip(parsed))).toEqual(parsed);
  });

  it('rejects value_pathway that does not terminate at primary operand', () => {
    const bad = fixture() as {
      value_pathway: Array<{ operand_id: string }>;
    };
    bad.value_pathway[1].operand_id = 'unrelated';
    expect(() => phase2FunctionTaxonomySchema.parse(bad)).toThrow();
  });

  it("rejects orphan c' (no downstream a/d/I)", () => {
    const bad = fixture() as {
      po_array: Array<{ process_id: string; cells: Record<string, string> }>;
    };
    bad.po_array[1].cells.PRD = 'none';
    expect(() => phase2FunctionTaxonomySchema.parse(bad)).toThrow();
  });
});
