import { describe, it, expect } from '@jest/globals';
import {
  tradespaceParetoSensitivitySchema,
  fuzzyParetoSchema,
  type TradespaceParetoSensitivity,
} from '../tradespace-pareto-sensitivity';
import { envelope, roundTrip } from '../../__tests__/crawley-fixtures';
import { zodToStrictJsonSchema } from '../../zod-to-json';

function fixture(): unknown {
  return {
    ...envelope(
      'module-4.tradespace-pareto-sensitivity.v1',
      'M4/02-Tradespace-Pareto-Sensitivity.json',
      2,
    ),
    architectures: [
      {
        architecture_id: 'AV.01',
        decision_selections: { 'D.01': 'alt-a' },
        metric_values: { latency: 200, cost: 320 },
        feasible: true,
        pareto_rank: 1,
        dominance: 'non_dominated' as const,
      },
      {
        architecture_id: 'AV.02',
        decision_selections: { 'D.01': 'alt-b' },
        metric_values: { latency: 220, cost: 340 },
        feasible: true,
        pareto_rank: 2,
        dominance: 'dominated' as const,
      },
    ],
    pareto_analysis: {
      visible_metric_ids: ['latency', 'cost'],
      non_dominated_architecture_ids: ['AV.01'],
      dominated_count: 1,
      feasible_count: 2,
    },
    frontier_mining: [
      {
        decision_id: 'D.01',
        classification: 'driver' as const,
        rationale: 'high latency main effect',
      },
    ],
    tradespace_structure: {
      clusters: [],
      strata: [],
      holes: [],
    },
    sensitivity_analysis: {
      scenarios: [
        {
          scenario_id: 'S1',
          label: 'baseline',
          sampling: 'lhs' as const,
          sample_count: 100,
          description: 'Latin hypercube baseline',
        },
        {
          scenario_id: 'S2',
          label: 'high cost',
          sampling: 'monte_carlo' as const,
          sample_count: 200,
          description: 'Monte Carlo cost stress',
        },
        {
          scenario_id: 'S3',
          label: 'fractional',
          sampling: 'fractional_factorial' as const,
          sample_count: 32,
          description: 'fractional factorial',
        },
      ],
      per_decision_sensitivity: [
        {
          decision_id: 'D.01',
          metric_id: 'latency',
          main_effect: 0.42,
          region: 'high' as const,
          derivation: {
            formula: 'main_effect = ΔY/ΔX',
            inputs: { delta_x: 1 },
            kb_source: 'crawley-ch15',
          },
        },
      ],
      robustness_score: 0.85,
    },
    decision_organization: [
      {
        decision_id: 'D.01',
        impact_score: 0.9,
        sensitivity_score: 0.8,
        quadrant: 'q1_high_impact_high_sensitivity' as const,
      },
    ],
    refactor_suggestions: [],
    crawley_refs: [],
  };
}

describe('tradespaceParetoSensitivitySchema', () => {
  it('parses a valid fixture', () => {
    const parsed = tradespaceParetoSensitivitySchema.parse(fixture());
    expect(parsed._schema).toBe('module-4.tradespace-pareto-sensitivity.v1');
    expect(parsed.pareto_analysis.visible_metric_ids).toHaveLength(2);
    expect(parsed.sensitivity_analysis.robustness_score).toBe(0.85);
  });

  it('round-trips through JSON', () => {
    const parsed = tradespaceParetoSensitivitySchema.parse(fixture());
    const restored = tradespaceParetoSensitivitySchema.parse(roundTrip(parsed));
    expect(restored).toEqual(parsed);
  });

  it('rejects fewer than 3 sensitivity scenarios', () => {
    const bad = fixture() as { sensitivity_analysis: { scenarios: unknown[] } };
    bad.sensitivity_analysis.scenarios = bad.sensitivity_analysis.scenarios.slice(0, 2);
    expect(() => tradespaceParetoSensitivitySchema.parse(bad)).toThrow();
  });

  it('rejects robustness < 0.8 without fuzzy alternative on complete', () => {
    const bad = fixture() as { sensitivity_analysis: { robustness_score: number } };
    bad.sensitivity_analysis.robustness_score = 0.6;
    expect(() => tradespaceParetoSensitivitySchema.parse(bad)).toThrow();
  });

  it('rejects fewer than 2 visible metrics on Pareto', () => {
    const bad = fixture() as { pareto_analysis: { visible_metric_ids: string[] } };
    bad.pareto_analysis.visible_metric_ids = ['latency'];
    expect(() => tradespaceParetoSensitivitySchema.parse(bad)).toThrow();
  });

  it('rejects fuzzy_pareto with strategy=rank_cutoff but missing rank_cutoff', () => {
    expect(() =>
      fuzzyParetoSchema.parse({
        strategy: 'rank_cutoff',
        additional_architecture_ids: [],
      }),
    ).toThrow();
  });

  it('describe() metadata uses x-ui-surface= prefix', () => {
    const json = zodToStrictJsonSchema(
      tradespaceParetoSensitivitySchema,
      'TradespaceParetoSensitivity',
    ) as { description?: string };
    expect(json.description).toMatch(/^x-ui-surface=/);
  });

  it('type narrowing works through the inferred type', () => {
    const parsed: TradespaceParetoSensitivity = tradespaceParetoSensitivitySchema.parse(fixture());
    expect(parsed._schema).toBe('module-4.tradespace-pareto-sensitivity.v1');
  });
});
