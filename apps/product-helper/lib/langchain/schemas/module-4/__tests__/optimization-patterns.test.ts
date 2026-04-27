import { describe, it, expect } from '@jest/globals';
import {
  optimizationPatternsSchema,
  subProblemSchema,
  valueFunctionSchema,
} from '../optimization-patterns';
import { envelope, roundTrip } from '../../__tests__/crawley-fixtures';

function fixture(): unknown {
  return {
    ...envelope('module-4.optimization-patterns.v1', 'M4/03-Optimization-Patterns.json', 3),
    architect_task_assignments: [
      { task: 'frame_problem' as const, assignee: 'architect-1', completed: true },
      { task: 'select_pattern' as const, assignee: 'architect-1', completed: true },
    ],
    sub_problems: [
      {
        sub_problem_id: 'SP.01',
        pattern: 'down_selecting' as const,
        decision_ids: ['D.01'],
        element_interactions: [
          { from_element_id: 'E1', to_element_id: 'E2', kind: 'compatibility' as const, weight: 0.5 },
        ],
        description: 'down-select tech stack',
      },
      {
        sub_problem_id: 'SP.02',
        pattern: 'assigning' as const,
        decision_ids: ['D.02'],
        element_interactions: [],
        architecture_style: 'modular' as const,
        description: 'assign workload to nodes',
      },
    ],
    composition: {
      operator: 'sequential' as const,
      sub_problem_ids: ['SP.01', 'SP.02'],
      rationale: 'tech-stack must precede workload assignment',
    },
    value_function: {
      kind: 'weighted_sum' as const,
      weights: { latency: 0.5, cost: 0.5 },
      description: 'V(A) = 0.5*latency + 0.5*cost',
    },
    constraint_hardness: {
      hard_constraint_ids: ['C.hard.1'],
      soft_constraint_ids: ['C.soft.1'],
      penalty_scalar: 100,
    },
    solver: {
      kind: 'genetic_algorithm' as const,
      parameters: { population: 200, mutation_rate: 0.05 },
      justification: 'large combinatorial space',
    },
    non_dominated_architecture_ids: ['AV.01'],
    crawley_refs: [],
  };
}

describe('optimizationPatternsSchema', () => {
  it('parses a valid fixture', () => {
    const parsed = optimizationPatternsSchema.parse(fixture());
    expect(parsed.sub_problems).toHaveLength(2);
    expect(parsed.composition?.operator).toBe('sequential');
  });

  it('round-trips through JSON', () => {
    const parsed = optimizationPatternsSchema.parse(fixture());
    const restored = optimizationPatternsSchema.parse(roundTrip(parsed));
    expect(restored).toEqual(parsed);
  });

  it('rejects multi-subproblem without composition', () => {
    const bad = fixture() as { composition?: unknown };
    delete bad.composition;
    expect(() => optimizationPatternsSchema.parse(bad)).toThrow();
  });

  it('rejects pattern=down_selecting with empty element_interactions', () => {
    expect(() =>
      subProblemSchema.parse({
        sub_problem_id: 'X',
        pattern: 'down_selecting',
        decision_ids: ['D.99'],
        element_interactions: [],
        description: 'missing interactions',
      }),
    ).toThrow();
  });

  it('rejects weighted_sum value function without weights', () => {
    expect(() =>
      valueFunctionSchema.parse({
        kind: 'weighted_sum',
        description: 'no weights provided',
      }),
    ).toThrow();
  });

  it('rejects pattern=assigning without architecture_style', () => {
    expect(() =>
      subProblemSchema.parse({
        sub_problem_id: 'X',
        pattern: 'assigning',
        decision_ids: ['D.99'],
        element_interactions: [],
        description: 'no style',
      }),
    ).toThrow();
  });

  it('rejects composition referencing unknown sub_problem_id', () => {
    const bad = fixture() as {
      composition: { sub_problem_ids: string[] };
    };
    bad.composition.sub_problem_ids = ['SP.01', 'SP.99'];
    expect(() => optimizationPatternsSchema.parse(bad)).toThrow();
  });
});
