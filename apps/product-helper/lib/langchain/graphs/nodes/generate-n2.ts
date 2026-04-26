/**
 * GENERATE_n2 node — wraps `n2-agent` (M7.a).
 *
 * Reads `ffbd` + `dataFlows` from `state.extractedData` and invokes
 * `runN2Agent` via stub path (portfolio-demo stance). Result persists to
 * `project_artifacts(kind='n2_matrix_v1')`.
 *
 * @module lib/langchain/graphs/nodes/generate-n2
 */

import { IntakeState } from '../types';
import { runN2Agent } from '../../agents/system-design/n2-agent';
import { persistArtifact } from './_persist-artifact';

const ARTIFACT_KIND = 'n2_matrix_v1';

export async function generateN2(state: IntakeState): Promise<Partial<IntakeState>> {
  console.log('[GENERATE_n2] entered');
  const ed = state.extractedData as Record<string, unknown> | undefined;
  const stub = ed?.['n2Matrix'];
  const ffbd = ed?.['ffbd'];
  const dataFlows = ed?.['dataFlows'];

  if (!stub || !ffbd || !dataFlows) {
    console.warn('[GENERATE_n2] missing stub or upstream; persisting pending row');
    await persistArtifact({ projectId: state.projectId, kind: ARTIFACT_KIND, status: 'pending' });
    return {};
  }

  try {
    const result = await runN2Agent(
      {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ffbd: ffbd as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dataFlows: dataFlows as any,
        systemName: state.projectName,
        producedBy: 'langgraph:generate_n2',
        outputPath: `runtime://project/${state.projectId}/n2_matrix.v1.json`,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        upstreamRefs: { ffbd: 'runtime', data_flows: 'runtime' } as any,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { stub: stub as any },
    );

    await persistArtifact({ projectId: state.projectId, kind: ARTIFACT_KIND, status: 'ready', result });
    // Synthesis artifacts persist to project_artifacts (above), NOT extractedData.
    return {};
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'unknown';
    console.error('[GENERATE_n2] failed:', reason);
    await persistArtifact({ projectId: state.projectId, kind: ARTIFACT_KIND, status: 'failed', failureReason: reason });
    return { error: `generate_n2: ${reason}` };
  }
}
