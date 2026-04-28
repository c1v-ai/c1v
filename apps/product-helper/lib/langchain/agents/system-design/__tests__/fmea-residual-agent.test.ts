/**
 * fmea-residual-agent — stub-path referential + arithmetic coverage.
 *
 * No LLM. Covers:
 *   - Happy path: residual round-trips through Zod + cross-artifact resolvers
 *     and produces a normalized summary roll-up.
 *   - predecessor_ref='new' rows MUST carry a decision_anchor.
 *   - predecessor_ref must resolve in fmea_early when not 'new'.
 *   - target_ref/form_refs/decision_anchor resolve in upstream artifacts.
 *   - normalizeResidualRow recomputes rpn/weighted_rpn/flagged_high_rpn.
 *   - selected_architecture_id MUST mirror decision_network.
 */

import { describe, it, expect } from '@jest/globals';
import {
  runFmeaResidualAgent,
  normalizeResidualRow,
  summarizeResidual,
  type FmeaResidualAgentInput,
  type DecisionNetworkSlice,
  type FormFunctionMapSlice,
  type InterfaceSpecsSlice,
} from '../fmea-residual-agent';
import type { FmeaResidual, ResidualFailureMode } from '@/lib/langchain/schemas/module-8-risk/fmea-residual';
import type { FmeaEarly } from '@/lib/langchain/schemas/module-8-risk/fmea-early';
import type { FfbdV1 } from '@/lib/langchain/schemas/module-3/ffbd-v1';
import type { N2Matrix } from '@/lib/langchain/schemas/module-7-interfaces/n2-matrix';
import type { DataFlows } from '@/lib/langchain/schemas/module-1/phase-2-5-data-flows';

function makeFfbd(): FfbdV1 {
  return {
    _schema: 'module-3.ffbd.v1',
    _output_path: 'x',
    _upstream_refs: { scope_tree: 'x', context_diagram: 'x', data_flows: 'x', ffbd_top_level: 'x' },
    produced_at: '2026-04-24T00:00:00Z',
    produced_by: 'test',
    system_name: 'c1v',
    top_level_diagram_id: 'F.0',
    functions: [
      { id: 'F.2', name: 'Generate Spec', uncertainty: 'yellow' as const, source_uc: 'UC01' },
    ],
  } as unknown as FfbdV1;
}

function makeN2(): N2Matrix {
  return {
    rows: [{ id: 'IF.06', producer: 'F.5', consumer: 'F.6', payload_name: 'X' }],
  } as unknown as N2Matrix;
}

function makeDataFlows(): DataFlows {
  return { entries: [{ id: 'DE.09' }] } as unknown as DataFlows;
}

function makeFmeaEarly(): FmeaEarly {
  return {
    _schema: 'module-8.fmea-early.v1',
    _output_path: 'x',
    _upstream_refs: { ffbd: 'x', n2_matrix: 'x', data_flows: 'x', rating_scales: 'x' },
    produced_at: 't',
    produced_by: 'test',
    system_name: 'c1v',
    rating_scales_version: 'v1',
    failure_modes: [
      {
        id: 'FM.01',
        target_ref: { kind: 'function', ref: 'F.2' },
        failure_mode: 'm',
        potential_cause: 'c',
        potential_effect: 'e',
        severity: 4,
        likelihood: 3,
        detectability: 4,
        rpn: 12,
        criticality_category: 'MEDIUM HIGH',
        candidate_mitigation: [],
      },
    ],
  } as FmeaEarly;
}

function makeDecisionNet(): DecisionNetworkSlice {
  return {
    selected_architecture_id: 'AV.01',
    phases: {
      phase_14_decision_nodes: {
        decision_nodes: [{ id: 'DN.01', alternatives: [{ id: 'A' }] }],
      },
      phase_16_pareto_frontier: {
        architecture_vectors: [
          { id: 'AV.01', choices: [{ decision_node_id: 'DN.01', alternative_id: 'A' }], on_frontier: true },
        ],
      },
    },
  };
}

function makeFormMap(): FormFunctionMapSlice {
  return {
    phase_1_form_inventory: {
      forms: [
        { id: 'FR.02', kind: 'adapter', realizes_functions: ['F.2'] },
        { id: 'FR.09', kind: 'service', realizes_functions: ['F.7'] },
      ],
    },
  };
}

function makeIfSpecs(): InterfaceSpecsSlice {
  return { interfaces: [{ interface_id: 'IF.06', producer: 'F.5', consumer: 'F.6', protocol: 'event-bus', sync_style: 'streaming' }] };
}

function makeRow(overrides: Partial<ResidualFailureMode> = {}): ResidualFailureMode {
  const base: ResidualFailureMode = {
    id: 'FM.01',
    predecessor_ref: 'FM.01',
    target_ref: { kind: 'function', ref: 'F.2' },
    form_refs: [{ form_id: 'FR.02', role: 'primary' }],
    failure_mode: 'm',
    potential_cause: 'c',
    potential_effect: 'e',
    severity: 4,
    likelihood: 2,
    detectability: 3,
    recoverability: 2,
    rpn: 8,
    weighted_rpn: 266.6666666666667,
    criticality_category: 'MEDIUM',
    flagged_high_rpn: true,
    mitigation_status: 'committed',
    landed_controls: [],
  };
  return { ...base, ...overrides };
}

function makeStub(rows: ResidualFailureMode[]): FmeaResidual {
  return {
    _schema: 'module-8.fmea-residual.v1',
    _output_path: 'x',
    _upstream_refs: {
      fmea_early: 'x',
      decision_network: 'x',
      form_function_map: 'x',
      interface_specs: 'x',
      rating_scales: 'x',
    },
    produced_at: 't',
    produced_by: 'test',
    system_name: 'c1v',
    rating_scales_version: 'v1',
    selected_architecture_id: 'AV.01',
    high_rpn_flag_threshold: 100,
    failure_modes: rows,
    summary: summarizeResidual(rows),
  };
}

function makeInput(stub: FmeaResidual): FmeaResidualAgentInput {
  return {
    fmeaEarly: makeFmeaEarly(),
    decisionNetwork: makeDecisionNet(),
    formFunctionMap: makeFormMap(),
    interfaceSpecs: makeIfSpecs(),
    ffbd: makeFfbd(),
    n2: makeN2(),
    dataFlows: makeDataFlows(),
    ratingScalesVersion: 'v1',
    systemName: 'c1v',
    producedBy: 'test',
    outputPath: 'x',
    upstreamRefs: stub._upstream_refs,
  };
}

describe('fmea-residual-agent', () => {
  it('happy path: surviving + new rows round-trip and summary rolls up', async () => {
    const surviving = makeRow();
    const newRow = makeRow({
      id: 'FM.13',
      predecessor_ref: 'new',
      decision_anchor: { decision_node_id: 'DN.01', alternative_id: 'A', architecture_vector_id: 'AV.01' },
      severity: 3,
      likelihood: 2,
      detectability: 4,
      recoverability: 3,
      rpn: 6,
      weighted_rpn: 150,
      criticality_category: 'MEDIUM',
      flagged_high_rpn: true,
      mitigation_status: 'deferred',
    });
    const stub = makeStub([surviving, newRow]);
    const out = await runFmeaResidualAgent(makeInput(stub), { stub });
    expect(out.summary.total).toBe(2);
    expect(out.summary.new_modes).toBe(1);
    expect(out.summary.surviving_modes).toBe(1);
    expect(out.summary.flagged_high_rpn).toBe(2);
    expect(out.selected_architecture_id).toBe('AV.01');
  });

  it("rejects predecessor_ref='new' without decision_anchor", async () => {
    const row = makeRow({ id: 'FM.13', predecessor_ref: 'new' });
    const stub = makeStub([row]);
    await expect(runFmeaResidualAgent(makeInput(stub), { stub })).rejects.toThrow(/requires decision_anchor/);
  });

  it('rejects unresolved predecessor_ref', async () => {
    const row = makeRow({ id: 'FM.99', predecessor_ref: 'FM.99' });
    const stub = makeStub([row]);
    await expect(runFmeaResidualAgent(makeInput(stub), { stub })).rejects.toThrow(/predecessor_ref FM.99 not in fmea_early/);
  });

  it('rejects unresolved form_ref', async () => {
    const row = makeRow({ form_refs: [{ form_id: 'FR.99', role: 'primary' }] });
    const stub = makeStub([row]);
    await expect(runFmeaResidualAgent(makeInput(stub), { stub })).rejects.toThrow(/form_ref FR.99/);
  });

  it('rejects selected_architecture_id mismatch with decision_network', async () => {
    const row = makeRow();
    const stub = { ...makeStub([row]), selected_architecture_id: 'AV.02' };
    // Add AV.02 to decision-net so the avIds check passes; mismatch triggers different guard.
    const input = makeInput(stub);
    input.decisionNetwork = {
      ...input.decisionNetwork,
      phases: {
        ...input.decisionNetwork.phases,
        phase_16_pareto_frontier: {
          architecture_vectors: [
            ...input.decisionNetwork.phases.phase_16_pareto_frontier.architecture_vectors,
            { id: 'AV.02', choices: [{ decision_node_id: 'DN.01', alternative_id: 'A' }] },
          ],
        },
      },
    };
    await expect(runFmeaResidualAgent(input, { stub })).rejects.toThrow(/selected_architecture_id AV.02 != decision_network AV.01/);
  });

  it('normalizeResidualRow recomputes weighted_rpn and flag', () => {
    const row = makeRow({ severity: 4, likelihood: 2, detectability: 3, weighted_rpn: 0, flagged_high_rpn: false, rpn: 0 });
    const norm = normalizeResidualRow(row, 100);
    expect(norm.rpn).toBe(8);
    expect(norm.weighted_rpn).toBeCloseTo(266.667, 2);
    expect(norm.flagged_high_rpn).toBe(true);
  });
});
