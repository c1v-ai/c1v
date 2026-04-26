/**
 * GENERATE_data_flows node — wraps `data-flows-agent` (M1 phase-2.5).
 *
 * Reads scope_tree + context_diagram from `state.extractedData` (M1 upstream
 * slots populated by earlier intake turns) and invokes `runDataFlowsAgent`.
 * Result lands at `state.extractedData.dataFlows` and persists to
 * `project_artifacts(kind='data_flows_v1')`.
 *
 * Per `plans/v21-outputs/ta1/agents-audit.md`, data-flows-agent is fs-clean —
 * direct invocation, no adapter wrapper required.
 *
 * @module lib/langchain/graphs/nodes/generate-data-flows
 */

import { IntakeState } from '../types';
import { runDataFlowsAgent } from '../../agents/system-design/data-flows-agent';
import { persistArtifact } from './_persist-artifact';

const ARTIFACT_KIND = 'data_flows_v1';

export async function generateDataFlows(
  state: IntakeState,
): Promise<Partial<IntakeState>> {
  console.log('[GENERATE_data_flows] entered');

  const ed = state.extractedData as Record<string, unknown> | undefined;
  const stub = ed?.['dataFlows'];

  if (!stub) {
    console.warn('[GENERATE_data_flows] no upstream stub; persisting pending row');
    await persistArtifact({ projectId: state.projectId, kind: ARTIFACT_KIND, status: 'pending' });
    return {};
  }

  try {
    const result = await runDataFlowsAgent(
      {
        scopeTree: ed?.['scopeTree'],
        contextDiagram: ed?.['contextDiagram'],
        systemName: state.projectName,
        producedBy: 'langgraph:generate_data_flows',
        outputPath: `runtime://project/${state.projectId}/data_flows.v1.json`,
        upstreamRefs: { scope_tree: 'runtime', context_diagram: 'runtime' },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { stub: stub as any },
    );

    await persistArtifact({
      projectId: state.projectId,
      kind: ARTIFACT_KIND,
      status: 'ready',
      result,
    });

    return {
      extractedData: {
        ...state.extractedData,
        dataFlows: result,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    };
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'unknown';
    console.error('[GENERATE_data_flows] failed:', reason);
    await persistArtifact({
      projectId: state.projectId,
      kind: ARTIFACT_KIND,
      status: 'failed',
      failureReason: reason,
    });
    return { error: `generate_data_flows: ${reason}` };
  }
}
