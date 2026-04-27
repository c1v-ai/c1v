import { describe, it, expect } from '@jest/globals';
import { phase5ConceptExpansionSchema } from '../phase-5-concept-expansion';
import { envelope, roundTrip } from '../../__tests__/crawley-fixtures';

function fixture(): unknown {
  const synthesis_question_coverage = Array.from({ length: 20 }, (_, i) => ({
    question_id: `Q${i + 1}`,
    phase_source: 'phase-5',
    field_reference: `field_${i + 1}`,
    awaiting_input: false,
  }));
  return {
    ...envelope('module-5.phase-5-concept-expansion.v1', 'M5/05-Phase-5.json', 5),
    synthesis_question_coverage,
    level_1_expansions: [
      {
        expansion_id: 'L1.1',
        source_concept_id: 'C1',
        inherited_intent: 'transform idea into PRD',
        decomposition_level: 1 as const,
        level_1_internal_processes: ['parsing', 'authoring'],
        level_1_internal_operands: [],
        level_1_form_decomposition: [],
        non_idealities: [],
        supporting_processes: [],
        supporting_form: [],
        interfaces: [],
      },
    ],
    level_2_expansions: [
      {
        expansion_id: 'L2.1',
        source_process_id: 'authoring',
        inherited_intent: 'authoring',
        decomposition_level: 2 as const,
        level_2_internal_processes: ['drafting'],
        level_2_internal_operands: [],
        level_2_form_decomposition: [],
      },
    ],
    clustering_analysis: {
      basis: 'process_centric' as const,
      representation: { matrix_source: 'pf' as const, cell_suppression_applied: false },
      algorithm: 'thebeau' as const,
      algorithm_reference: 'Thebeau MIT thesis',
      clusters: [{ cluster_name: 'C1', entity_ids: ['parsing', 'authoring'] }],
      time_based_vs_coupling_comparison: {
        first_attempt_clusters: [{ cluster_name: 'A1', entity_ids: ['parsing'] }],
        coupling_attempt_clusters: [{ cluster_name: 'B1', entity_ids: ['parsing', 'authoring'] }],
        chosen: 'coupling_based' as const,
        chosen_rationale: 'lower coupling',
      },
    },
    modularization_review_state: 'approved' as const,
    crawley_glossary_refs: [],
  };
}

describe('phase5ConceptExpansionSchema (Crawley Ch 8)', () => {
  it('parses a valid fixture', () => {
    const parsed = phase5ConceptExpansionSchema.parse(fixture());
    expect(parsed.synthesis_question_coverage).toHaveLength(20);
    expect(parsed.modularization_review_state).toBe('approved');
  });

  it('round-trips through JSON', () => {
    const parsed = phase5ConceptExpansionSchema.parse(fixture());
    expect(phase5ConceptExpansionSchema.parse(roundTrip(parsed))).toEqual(parsed);
  });

  it('rejects fewer than 20 synthesis questions', () => {
    const bad = fixture() as { synthesis_question_coverage: unknown[] };
    bad.synthesis_question_coverage = bad.synthesis_question_coverage.slice(0, 19);
    expect(() => phase5ConceptExpansionSchema.parse(bad)).toThrow();
  });

  it('rejects modularization_review_state != approved on complete', () => {
    const bad = fixture() as { modularization_review_state: string };
    bad.modularization_review_state = 'first_pass_complete';
    expect(() => phase5ConceptExpansionSchema.parse(bad)).toThrow();
  });

  it('rejects awaiting_input questions on complete', () => {
    const bad = fixture() as {
      synthesis_question_coverage: Array<{ awaiting_input: boolean }>;
    };
    bad.synthesis_question_coverage[5].awaiting_input = true;
    expect(() => phase5ConceptExpansionSchema.parse(bad)).toThrow();
  });
});
