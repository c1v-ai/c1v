/**
 * Fan-out regression test for Steps 3-6 in the intake graph.
 *
 * Verifies that after the parallel fan-out introduced in Phase A:
 *   FFBD -> { Decision Matrix -> QFD, Interfaces }
 * no parallel branch's output is silently dropped by a last-write-wins reducer.
 *
 * This is a regression guard for the 504-timeout bug where the old
 * `(a, b) => b ?? a` replaceReducer on extractedData caused either the
 * DecisionMatrix chain or the Interfaces branch to overwrite the other.
 *
 * @module graphs/__tests__/intake-graph-fanout.test.ts
 */

import { describe, it, expect } from '@jest/globals';
import { StateGraph, START, END } from '@langchain/langgraph';
import { routeAfterFFBD, routeAfterDecisionMatrix } from '../edges';
import { IntakeStateAnnotation } from '../intake-graph';
import { createInitialState, type IntakeState } from '../types';

// Small helpers to build partial state updates that only set one field.
// Each mock returns a *minimal* update (not spreading state.extractedData)
// to isolate the reducer's merge behavior from any per-node spread logic.
function partialED(update: Record<string, unknown>) {
  return async (): Promise<Partial<IntakeState>> =>
    ({ extractedData: update as unknown as IntakeState['extractedData'] });
}

describe('Steps 3-6 parallel fan-out preserves all branch outputs', () => {
  it('merges ffbd + decisionMatrix + qfd + dataFlowDiagram without dropping keys', async () => {
    const mockFFBD = partialED({ ffbd: { topLevelBlocks: [{ id: 'F1', name: 'Authenticate' }] } });
    const mockDM = partialED({ decisionMatrix: { criteria: [{ id: 'C1', name: 'Latency', weight: 0.5 }] } });
    const mockQFD = partialED({ qfd: { needs: [{ id: 'N1', description: 'Fast' }] } });
    const mockInterfaces = partialED({
      dataFlowDiagram: { nodes: [{ id: 'DF1', name: 'API' }], edges: [] },
      n2Chart: { subsystems: ['A', 'B'] },
    });

    const graph = new StateGraph(IntakeStateAnnotation)
      .addNode('generate_ffbd', mockFFBD)
      .addNode('generate_decision_matrix', mockDM)
      .addNode('generate_qfd', mockQFD)
      .addNode('generate_interfaces', mockInterfaces)
      .addEdge(START, 'generate_ffbd')
      .addConditionalEdges('generate_ffbd', routeAfterFFBD, [
        'generate_decision_matrix',
        'generate_interfaces',
        END,
      ])
      .addConditionalEdges('generate_decision_matrix', routeAfterDecisionMatrix, [
        'generate_qfd',
        END,
      ])
      .addEdge('generate_qfd', END)
      .addEdge('generate_interfaces', END)
      .compile();

    const initial = createInitialState(1, 'Fan-out Test', 'Verify parallel merge', 1);
    const result = await graph.invoke(initial);

    const ed = result.extractedData as Record<string, unknown>;
    expect(ed.ffbd).toBeDefined();
    expect(ed.decisionMatrix).toBeDefined();
    expect(ed.qfd).toBeDefined();
    expect(ed.dataFlowDiagram).toBeDefined();
    expect(ed.n2Chart).toBeDefined();
  });

  it('on FFBD error, fan-out bails out to END with error propagated', async () => {
    const mockFFBDError = async (): Promise<Partial<IntakeState>> => ({
      error: 'FFBD failed intentionally',
    });
    const mockDM = partialED({ decisionMatrix: { criteria: [] } });
    const mockInterfaces = partialED({ dataFlowDiagram: { nodes: [] } });

    const graph = new StateGraph(IntakeStateAnnotation)
      .addNode('generate_ffbd', mockFFBDError)
      .addNode('generate_decision_matrix', mockDM)
      .addNode('generate_interfaces', mockInterfaces)
      .addEdge(START, 'generate_ffbd')
      .addConditionalEdges('generate_ffbd', routeAfterFFBD, [
        'generate_decision_matrix',
        'generate_interfaces',
        END,
      ])
      .addEdge('generate_decision_matrix', END)
      .addEdge('generate_interfaces', END)
      .compile();

    const initial = createInitialState(1, 'Fan-out Error', 'Verify bailout', 1);
    const result = await graph.invoke(initial);

    expect(result.error).toBe('FFBD failed intentionally');
    const ed = result.extractedData as Record<string, unknown>;
    expect(ed.decisionMatrix).toBeUndefined();
    expect(ed.dataFlowDiagram).toBeUndefined();
  });
});
