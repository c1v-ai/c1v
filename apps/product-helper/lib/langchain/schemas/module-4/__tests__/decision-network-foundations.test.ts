import { describe, it, expect } from '@jest/globals';
import {
  decisionNetworkFoundationsSchema,
  type DecisionNetworkFoundations,
} from '../decision-network-foundations';
import { envelope, roundTrip } from '../../__tests__/crawley-fixtures';
import { zodToStrictJsonSchema } from '../../zod-to-json';

function valid() {
  return {
    ...envelope('module-4.decision-network-foundations.v1', 'F14/4/Foundations.json', 1),
    decisions: [
      {
        decision_id: 'D1',
        short_id: 'D1',
        name: 'Choose LLM provider',
        variable_type: 'categorical' as const,
        alternatives: [
          { alternative_id: 'A1', label: 'Anthropic', description: 'Claude' },
          { alternative_id: 'A2', label: 'OpenAI', description: 'GPT' },
        ],
        simon_phase: 'design' as const,
        programmed: false,
      },
    ],
    constraints: [],
    metrics: [
      {
        metric_id: 'M1',
        name: 'Cost',
        unit: 'USD/month',
        computation_kind: 'additive' as const,
        higher_is_better: false,
      },
    ],
    decision_dsm: {
      rows: ['D1'],
      cells: { D1: { D1: { connection_kind: 'none' as const, constraint_ids: [] } } },
      partitioned_blocks: [],
    },
    decision_network: {
      nodes: [{ node_id: 'N1', node_kind: 'decision' as const, decision_id: 'D1' }],
      edges: [],
      topology_kind: 'tree' as const,
    },
    dss_task_coverage: {
      representing: { covered: true, artifact_refs: ['D1'] },
      structuring: { covered: true, artifact_refs: ['decision_dsm'] },
      simulating: { covered: true, artifact_refs: ['M1'] },
      viewing: { covered: false, artifact_refs: [] },
    },
    crawley_refs: [],
  };
}

describe('module-4.decision-network-foundations.v1', () => {
  it('parses a valid fixture', () => {
    const parsed = decisionNetworkFoundationsSchema.parse(valid());
    expect(parsed.decisions).toHaveLength(1);
  });

  it('warns on > 20% continuous decisions (Box 14.1)', () => {
    const bad = valid();
    bad.decisions = [
      { ...bad.decisions[0], decision_id: 'D1', variable_type: 'continuous' as const },
    ];
    expect(() => decisionNetworkFoundationsSchema.parse(bad)).toThrow(/Box 14.1/);
  });

  it('rejects metric_coupling constraint with tree topology', () => {
    const bad = valid();
    bad.constraints = [
      {
        kind: 'metric_coupling' as const,
        constraint_id: 'CC1',
        scope: ['D1'],
        coupled_metric: 'M1',
        equation_ref: 'M1.equation',
      },
    ];
    expect(() => decisionNetworkFoundationsSchema.parse(bad)).toThrow(/tree.*metric_coupling/);
  });

  it('rejects when DSS tasks 1-3 missing on complete', () => {
    const bad = valid();
    bad.dss_task_coverage.representing.covered = false;
    expect(() => decisionNetworkFoundationsSchema.parse(bad)).toThrow(/representing/);
  });

  it('round-trips through JSON.stringify → JSON.parse', () => {
    const parsed = decisionNetworkFoundationsSchema.parse(valid());
    const round = decisionNetworkFoundationsSchema.parse(roundTrip(parsed));
    expect(round).toEqual(parsed);
  });

  it('describe() metadata uses x-ui-surface= prefix', () => {
    const json = zodToStrictJsonSchema(
      decisionNetworkFoundationsSchema,
      'DecisionNetworkFoundations',
    ) as { description?: string };
    expect(json.description).toMatch(/^x-ui-surface=/);
  });

  it('type narrowing works through the inferred type', () => {
    const parsed: DecisionNetworkFoundations = decisionNetworkFoundationsSchema.parse(valid());
    expect(parsed._schema).toBe('module-4.decision-network-foundations.v1');
  });
});
