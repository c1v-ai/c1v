import { describe, it, expect } from '@jest/globals';
import {
  phase4SolutionNeutralConceptSchema,
  type Phase4SolutionNeutralConcept,
} from '../phase-4-solution-neutral-concept';
import { envelope, roundTrip } from '../../__tests__/crawley-fixtures';
import { zodToStrictJsonSchema } from '../../zod-to-json';

function fixture(): unknown {
  return {
    ...envelope('module-5.phase-4-solution-neutral-concept.v1', 'M5/04-Phase-4.json', 4),
    solution_neutral_function: {
      beneficiary: 'PRD author',
      need: 'reduce time-to-PRD',
      solution_neutral_operand: 'product idea',
      benefit_related_attribute: 'completeness',
      other_operand_attributes: [],
      solution_neutral_process: 'transforming idea into PRD',
      process_attributes: [],
      intent_statement: 'transform product idea into a complete PRD for the PRD author',
    },
    concepts: [
      {
        concept_id: 'C1',
        specific_operand: 'startup idea',
        specific_process: 'AI-guided authoring',
        specific_instrument: 'LLM agent',
        operand_specialization_kind: 'type_of' as const,
        process_specialization_kind: 'type_of_process' as const,
        concept_naming_convention: 'operand_process_instrument' as const,
        concept_name: 'AI-Guided PRD Author',
        source_process_id: 'authoring',
      },
    ],
    morphological_matrix: {
      internal_processes: ['parsing', 'authoring'],
      instruments_per_process: {
        parsing: ['regex', 'LLM'],
        authoring: ['template', 'LLM'],
      },
      integrated_concepts: [
        {
          concept_name: 'A1',
          selections: { parsing: 'LLM', authoring: 'LLM' },
          aggregate_rationale: 'all-LLM',
        },
        {
          concept_name: 'A2',
          selections: { parsing: 'regex', authoring: 'template' },
          aggregate_rationale: 'deterministic',
        },
      ],
    },
    concept_of_operations: {
      sequence: ['kickoff', 'authoring', 'review'],
      operator_actions: [
        { actor: 'PM', action: 'submit idea', step_index: 0 },
        { actor: 'system', action: 'draft PRD', step_index: 1 },
      ],
      coordinated_systems: [],
      good_or_service: 'good' as const,
    },
    crawley_glossary_refs: [],
  };
}

describe('phase4SolutionNeutralConceptSchema (Crawley Ch 7)', () => {
  it('parses a valid fixture', () => {
    const parsed = phase4SolutionNeutralConceptSchema.parse(fixture());
    expect(parsed.morphological_matrix.integrated_concepts).toHaveLength(2);
  });

  it('round-trips through JSON', () => {
    const parsed = phase4SolutionNeutralConceptSchema.parse(fixture());
    expect(phase4SolutionNeutralConceptSchema.parse(roundTrip(parsed))).toEqual(parsed);
  });

  it('rejects when SN process literally equals a specific_process', () => {
    const bad = fixture() as {
      solution_neutral_function: { solution_neutral_process: string };
      concepts: Array<{ specific_process: string }>;
    };
    bad.solution_neutral_function.solution_neutral_process = 'identical process';
    bad.concepts[0].specific_process = 'identical process';
    expect(() => phase4SolutionNeutralConceptSchema.parse(bad)).toThrow();
  });

  it('rejects fewer than 2 integrated_concepts', () => {
    const bad = fixture() as {
      morphological_matrix: { integrated_concepts: unknown[] };
    };
    bad.morphological_matrix.integrated_concepts = [
      bad.morphological_matrix.integrated_concepts[0],
    ];
    expect(() => phase4SolutionNeutralConceptSchema.parse(bad)).toThrow();
  });

  it('rejects service conops without ownership_inversion_note', () => {
    const bad = fixture() as {
      concept_of_operations: { good_or_service: string; ownership_inversion_note?: string };
    };
    bad.concept_of_operations.good_or_service = 'service';
    expect(() => phase4SolutionNeutralConceptSchema.parse(bad)).toThrow();
  });

  it('describe() metadata uses x-ui-surface= prefix', () => {
    const json = zodToStrictJsonSchema(
      phase4SolutionNeutralConceptSchema,
      'Phase4SolutionNeutralConcept',
    ) as { description?: string };
    expect(json.description).toMatch(/^x-ui-surface=/);
  });

  it('type narrowing works through the inferred type', () => {
    const parsed: Phase4SolutionNeutralConcept = phase4SolutionNeutralConceptSchema.parse(fixture());
    expect(parsed._schema).toBe('module-5.phase-4-solution-neutral-concept.v1');
  });
});
