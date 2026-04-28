/**
 * form-function-agent — stub-path referential + attribution coverage.
 *
 * No LLM. Covers:
 *   - Happy path: minimal valid form_function_map.v1 round-trips through
 *     Zod + cross-artifact refs.
 *   - Q=s*(1-k) refine enforcement (breaks on mismatch).
 *   - Surjectivity refine (every function has a realizing form).
 *   - Citation gate (Stevens1974 + Bass2021 required; Crawley not in enum).
 *   - FMEA redundancy soft-dep: when a function is flagged, phase-1 must
 *     carry a redundant form citing the FM id.
 *   - ffbd cross-artifact: phase-2 F.NN must resolve in ffbd.v1.
 */

import { describe, it, expect } from '@jest/globals';
import {
  runFormFunctionAgent,
  deriveRedundancyRequiredFunctions,
  type FormFunctionAgentInput,
} from '../form-function-agent';
import type { FormFunctionMapV1 } from '@/lib/langchain/schemas/module-5';
import type { FfbdV1 } from '@/lib/langchain/schemas/module-3/ffbd-v1';
import type { FmeaEarly } from '@/lib/langchain/schemas/module-8-risk/fmea-early';

function makeFfbd(): FfbdV1 {
  return {
    _schema: 'module-3.ffbd.v1',
    _output_path: 'tests/ffbd.json',
    _upstream_refs: {
      scope_tree: 'x',
      context_diagram: 'x',
      data_flows: 'x',
      ffbd_top_level: 'x',
    },
    produced_at: '2026-04-24T00:00:00Z',
    produced_by: 'test',
    system_name: 'test-sys',
    top_level_diagram_id: 'F.0',
    functions: [
      {
        id: 'F.1',
        name: 'Authenticate',
        type: 'functional',
        uncertainty: 'green',
        delves_to: null,
        inputs: [],
        outputs: [],
        source_cc: [],
      },
      {
        id: 'F.2',
        name: 'Generate',
        type: 'functional',
        uncertainty: 'yellow',
        delves_to: 'F.2',
        inputs: [],
        outputs: [],
        source_uc: 'UC01',
      },
    ],
    arrows: [],
    logic_gates: [],
    data_blocks: [],
    cross_cutting_pervasive: [],
    mermaid_paths: [],
  } as unknown as FfbdV1;
}

function makeFmea(overrides: Partial<FmeaEarly['failure_modes'][0]>[] = []): FmeaEarly {
  const baseFMs: FmeaEarly['failure_modes'] = [
    {
      id: 'FM.01',
      target_ref: { kind: 'function', ref: 'F.2' },
      failure_mode: 'LLM outage',
      potential_cause: 'single provider',
      potential_effect: 'availability breach',
      severity: 2,
      likelihood: 3,
      detectability: 1,
      rpn: 6,
      criticality_category: 'MEDIUM',
      candidate_mitigation: [
        { id: 'M1', summary: 'Multi-provider LLM adapter with circuit breaker', kb_refs: [] },
      ],
    },
    ...overrides.map((o, i) => ({
      id: `FM.9${i}`,
      target_ref: { kind: 'function' as const, ref: 'F.1' },
      failure_mode: 'x',
      potential_cause: 'x',
      potential_effect: 'x',
      severity: 1,
      likelihood: 1,
      detectability: 1,
      rpn: 1,
      criticality_category: 'LOW' as const,
      candidate_mitigation: [],
      ...o,
    })) as FmeaEarly['failure_modes'],
  ];
  return {
    _schema: 'module-8.fmea-early.v1',
    _output_path: 'tests/fmea.json',
    _upstream_refs: { ffbd: 'x', n2_matrix: 'x', data_flows: 'x', rating_scales: 'x' },
    produced_at: '2026-04-24T00:00:00Z',
    produced_by: 'test',
    system_name: 'test-sys',
    rating_scales_version: 'v1',
    failure_modes: baseFMs,
  };
}

function makeStub(partial: Partial<FormFunctionMapV1> = {}): FormFunctionMapV1 {
  const base: FormFunctionMapV1 = {
    _schema: 'module-5.form-function-map.v1',
    _output_path: 'tests/ffmap.json',
    _upstream_refs: { ffbd: 'x', fmea_early: 'x', nfrs: 'x' },
    produced_at: '2026-04-24T00:00:00Z',
    produced_by: 'test',
    system_name: 'test-sys',
    phase_1_form_inventory: {
      phase: 1,
      forms: [
        {
          id: 'FR.01',
          name: 'Auth Service',
          kind: 'service',
          description: 'handles authN',
          realizes_functions: ['F.1'],
        },
        {
          id: 'FR.02',
          name: 'Primary LLM',
          kind: 'adapter',
          description: 'primary LLM provider',
          realizes_functions: ['F.2'],
        },
        {
          id: 'FR.03',
          name: 'Fallback LLM',
          kind: 'adapter',
          description: 'fallback LLM provider',
          realizes_functions: ['F.2'],
          redundancy_source_fm: 'FM.01',
        },
      ],
    },
    phase_2_function_inventory: {
      phase: 2,
      functions: [
        { id: 'F.1', name: 'Authenticate', uncertainty: 'green' },
        { id: 'F.2', name: 'Generate', uncertainty: 'yellow', source_uc: 'UC01' },
      ],
    },
    phase_3_concept_mapping_matrix: {
      phase: 3,
      cells: [
        { function_id: 'F.1', form_id: 'FR.01', relation: 'primary' },
        { function_id: 'F.2', form_id: 'FR.02', relation: 'primary' },
        { function_id: 'F.2', form_id: 'FR.03', relation: 'fallback' },
      ],
    },
    phase_4_concept_quality_scoring: {
      phase: 4,
      scored_cells: [
        {
          function_id: 'F.1',
          form_id: 'FR.01',
          concept_quality: {
            specificity: 0.9,
            coupling: 0.1,
            Q: 0.9 * (1 - 0.1),
            math_derivation_v2: {
              formula: 'Q = specificity * (1 - coupling)',
              citations: [
                { source: 'Stevens1974', locator: 'pp.115-139', formula_ref: 'F11' },
                { source: 'Bass2021', locator: 'Ch.8', formula_ref: 'F11' },
              ],
              engine: 'NFREngineInterpreter',
            },
          },
        },
        {
          function_id: 'F.2',
          form_id: 'FR.02',
          concept_quality: {
            specificity: 0.8,
            coupling: 0.2,
            Q: 0.8 * (1 - 0.2),
            math_derivation_v2: {
              formula: 'Q = specificity * (1 - coupling)',
              citations: [
                { source: 'Stevens1974', locator: 'pp.115-139', formula_ref: 'F11' },
                { source: 'Bass2021', locator: 'Ch.8', formula_ref: 'F11' },
              ],
              engine: 'NFREngineInterpreter',
            },
          },
        },
        {
          function_id: 'F.2',
          form_id: 'FR.03',
          concept_quality: {
            specificity: 0.7,
            coupling: 0.3,
            Q: 0.7 * (1 - 0.3),
            math_derivation_v2: {
              formula: 'Q = specificity * (1 - coupling)',
              citations: [
                { source: 'Stevens1974', locator: 'pp.115-139', formula_ref: 'F11' },
                { source: 'Bass2021', locator: 'Ch.8', formula_ref: 'F11' },
              ],
              engine: 'NFREngineInterpreter',
            },
          },
        },
      ],
    },
    phase_5_operand_process_catalog: {
      phase: 5,
      entries: [
        { function_id: 'F.1', operand: 'Session Token', process: 'verify' },
        { function_id: 'F.2', operand: 'Draft Spec', process: 'generate' },
      ],
    },
    phase_6_concept_alternatives: {
      phase: 6,
      decompositions: [
        {
          function_id: 'F.2',
          alternatives: [
            { form_id: 'FR.02', dominance_rationale: 'lowest latency tier' },
            { form_id: 'FR.03', dominance_rationale: 'highest availability tier' },
          ],
        },
      ],
    },
    decision_audit: [],
  };
  return { ...base, ...partial };
}

function makeInput(stub: FormFunctionMapV1): FormFunctionAgentInput {
  return {
    ffbd: makeFfbd(),
    fmea: makeFmea(),
    nfrsPath: 'x',
    systemName: 'test-sys',
    producedBy: 'test',
    outputPath: 'tests/ffmap.json',
    upstreamRefs: stub._upstream_refs,
  };
}

describe('deriveRedundancyRequiredFunctions', () => {
  it('picks up FMs whose mitigation text mentions "multi-provider"', () => {
    const out = deriveRedundancyRequiredFunctions(makeFmea());
    expect(out.get('F.2')).toBe('FM.01');
  });
  it('ignores FMs without redundancy keywords', () => {
    const noKeyword: FmeaEarly = makeFmea();
    noKeyword.failure_modes[0].candidate_mitigation = [
      { id: 'M1', summary: 'Add retry logic with exponential backoff', kb_refs: [] },
    ];
    expect(deriveRedundancyRequiredFunctions(noKeyword).size).toBe(0);
  });
});

describe('runFormFunctionAgent — happy path', () => {
  it('round-trips a valid stub through Zod + refs', async () => {
    const stub = makeStub();
    const out = await runFormFunctionAgent(makeInput(stub), { stub });
    expect(out._schema).toBe('module-5.form-function-map.v1');
    expect(out.phase_2_function_inventory.functions).toHaveLength(2);
    expect(out.phase_1_form_inventory.forms).toHaveLength(3);
  });
});

describe('runFormFunctionAgent — validation gates', () => {
  it('rejects Q != s*(1-k)', async () => {
    const stub = makeStub();
    stub.phase_4_concept_quality_scoring.scored_cells[0].concept_quality.Q = 0.5;
    await expect(runFormFunctionAgent(makeInput(stub), { stub })).rejects.toThrow();
  });

  it('rejects missing surjectivity (function has no realizing form)', async () => {
    const stub = makeStub();
    stub.phase_1_form_inventory.forms = stub.phase_1_form_inventory.forms.filter(
      (f) => !f.realizes_functions.includes('F.1'),
    );
    await expect(runFormFunctionAgent(makeInput(stub), { stub })).rejects.toThrow(
      /Surjectivity|unknown function/,
    );
  });

  it('rejects citations missing Stevens1974 or Bass2021', async () => {
    const stub = makeStub();
    stub.phase_4_concept_quality_scoring.scored_cells[0].concept_quality.math_derivation_v2.citations =
      [{ source: 'Stevens1974', locator: 'x', formula_ref: 'F11' }];
    await expect(runFormFunctionAgent(makeInput(stub), { stub })).rejects.toThrow();
  });

  it('rejects phase-2 function not in ffbd.v1', async () => {
    const stub = makeStub();
    stub.phase_2_function_inventory.functions.push({
      id: 'F.99',
      name: 'Orphan',
      uncertainty: 'red',
    });
    // Also need a form realizing F.99 for surjectivity to pass that check first,
    // so we test via a fresh stub where only the ffbd cross-check is the failure point.
    stub.phase_1_form_inventory.forms.push({
      id: 'FR.99',
      name: 'orphan form',
      kind: 'service',
      description: 'x',
      realizes_functions: ['F.99'],
    });
    stub.phase_3_concept_mapping_matrix.cells.push({
      function_id: 'F.99',
      form_id: 'FR.99',
      relation: 'primary',
    });
    stub.phase_4_concept_quality_scoring.scored_cells.push({
      function_id: 'F.99',
      form_id: 'FR.99',
      concept_quality: {
        specificity: 0.5,
        coupling: 0.5,
        Q: 0.25,
        math_derivation_v2: {
          formula: 'Q = specificity * (1 - coupling)',
          citations: [
            { source: 'Stevens1974', locator: 'x', formula_ref: 'F11' },
            { source: 'Bass2021', locator: 'x', formula_ref: 'F11' },
          ],
          engine: 'NFREngineInterpreter',
        },
      },
    });
    await expect(runFormFunctionAgent(makeInput(stub), { stub })).rejects.toThrow(
      /does not resolve in ffbd/,
    );
  });

  it('rejects missing redundant form when FMEA flags function', async () => {
    const stub = makeStub();
    // Remove the redundant form FR.03.
    stub.phase_1_form_inventory.forms = stub.phase_1_form_inventory.forms.filter(
      (f) => f.id !== 'FR.03',
    );
    stub.phase_3_concept_mapping_matrix.cells = stub.phase_3_concept_mapping_matrix.cells.filter(
      (c) => c.form_id !== 'FR.03',
    );
    stub.phase_4_concept_quality_scoring.scored_cells =
      stub.phase_4_concept_quality_scoring.scored_cells.filter((s) => s.form_id !== 'FR.03');
    stub.phase_6_concept_alternatives.decompositions[0].alternatives = [
      { form_id: 'FR.02', dominance_rationale: 'only remaining option for coverage' },
      { form_id: 'FR.01', dominance_rationale: 'placeholder second alternative' },
    ];
    await expect(runFormFunctionAgent(makeInput(stub), { stub })).rejects.toThrow(
      /redundancy-required/,
    );
  });
});
