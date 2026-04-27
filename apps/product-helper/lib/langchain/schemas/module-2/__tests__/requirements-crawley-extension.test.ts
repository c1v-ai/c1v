import { describe, it, expect } from '@jest/globals';
import {
  requirementsCrawleyExtensionSchema,
  type RequirementsCrawleyExtension,
} from '../requirements-crawley-extension';
import { envelope, roundTrip } from '../../__tests__/crawley-fixtures';
import { zodToStrictJsonSchema } from '../../zod-to-json';

function valid() {
  return {
    ...envelope('module-2.requirements-crawley-extension.v1', 'F14/2/Crawley.json', 11),
    beneficiaries: [
      { beneficiary_id: 'B1', label: 'PM', value_proposition: 'Faster PRDs', is_charitable: false },
    ],
    stakeholders: [
      {
        stakeholder_id: 'S1',
        label: 'Product Manager',
        category: 'beneficiary' as const,
        rationale: 'Direct user',
        beneficiary_id: 'B1',
      },
    ],
    needs: [
      {
        need_id: 'N1',
        label: 'Generate PRD',
        stakeholder_ids: ['S1'],
        kano: 'must_have' as const,
        sn_triad: { operand: 'idea', attribute: 'completeness', process: 'document' },
        expressed: true,
        latent: false,
        interpreted: true,
        prioritized: true,
        dimensions_count: 3,
      },
    ],
    value_flows: [
      {
        flow_id: 'F1',
        from_stakeholder_id: 'S1',
        to_stakeholder_id: 'S1',
        kind: 'information' as const,
        description: 'self-loop',
        weight: 1.0,
      },
      {
        flow_id: 'F2',
        from_stakeholder_id: 'S1',
        to_stakeholder_id: 'S1',
        kind: 'value' as const,
        description: 'value',
        weight: 0.8,
      },
    ],
    value_loops: [
      {
        loop_id: 'L1',
        flow_ids: ['F1', 'F2'],
        cameron_metric: 0.8,
        closed: true,
        rationale: 'closes back',
      },
    ],
    goals: [
      {
        goal_id: 'G1',
        label: 'Goal 1',
        statement: 'Ship feature on time within budget',
        criteria: [
          { key: 'addresses_need' as const, satisfied: true, evidence: 'maps to N1' },
          { key: 'achievable_with_budget' as const, satisfied: true, evidence: 'in budget' },
          { key: 'measurable' as const, satisfied: true, evidence: 'has KPI' },
          { key: 'tradable_under_constraint' as const, satisfied: true, evidence: 'flexible' },
          { key: 'agreed_among_stakeholders' as const, satisfied: true, evidence: 'reviewed' },
        ],
        tradable: true,
        overspecification_check: true,
        inconsistent_with: [],
      },
    ],
    problem_statement: {
      statement: 'PRDs are slow to author because authors lack systems-engineering scaffolding.',
      f16_numeric_grounding: true,
      numeric_anchors: ['avg PRD time = 14 days'],
      rationale: 'numeric anchor cited',
    },
  };
}

describe('module-2.requirements-crawley-extension.v1', () => {
  it('parses a valid fixture', () => {
    const parsed = requirementsCrawleyExtensionSchema.parse(valid());
    expect(parsed.beneficiaries).toHaveLength(1);
    expect(parsed.goals[0].criteria).toHaveLength(5);
  });

  it('rejects when a goal criterion is unsatisfied on complete (Box 11.4)', () => {
    const bad = valid();
    bad.goals[0].criteria[0].satisfied = false;
    expect(() => requirementsCrawleyExtensionSchema.parse(bad)).toThrow(/Box 11.4/);
  });

  it('rejects f16_numeric_grounding=true without numeric_anchors', () => {
    const bad = valid();
    bad.problem_statement.numeric_anchors = [];
    expect(() => requirementsCrawleyExtensionSchema.parse(bad)).toThrow(/F-16/);
  });

  it('rejects value-loop referencing unknown flow_id', () => {
    const bad = valid();
    bad.value_loops[0].flow_ids = ['F1', 'NOPE'];
    expect(() => requirementsCrawleyExtensionSchema.parse(bad)).toThrow(/unknown flow_id/);
  });

  it('round-trips through JSON.stringify → JSON.parse', () => {
    const parsed = requirementsCrawleyExtensionSchema.parse(valid());
    const round = requirementsCrawleyExtensionSchema.parse(roundTrip(parsed));
    expect(round).toEqual(parsed);
  });

  it('describe() metadata uses x-ui-surface= prefix', () => {
    const json = zodToStrictJsonSchema(
      requirementsCrawleyExtensionSchema,
      'RequirementsCrawleyExtension',
    ) as { description?: string };
    expect(json.description).toMatch(/^x-ui-surface=/);
  });

  it('type narrowing works through the inferred type', () => {
    const parsed: RequirementsCrawleyExtension = requirementsCrawleyExtensionSchema.parse(valid());
    expect(parsed._schema).toBe('module-2.requirements-crawley-extension.v1');
  });
});
