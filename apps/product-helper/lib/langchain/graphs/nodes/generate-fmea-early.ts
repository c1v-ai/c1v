/**
 * GENERATE_fmea_early node — wraps `fmea-early-agent` (M8.a).
 *
 * Reads `ffbd` + `n2Matrix` + `dataFlows` from `state.extractedData` and
 * invokes `runFmeaEarlyAgent` via stub path. Result persists to
 * `project_artifacts(kind='fmea_early_v1')`.
 *
 * @module lib/langchain/graphs/nodes/generate-fmea-early
 */

import { IntakeState } from '../types';
import { runFmeaEarlyAgent } from '../../agents/system-design/fmea-early-agent';
import { persistArtifact } from './_persist-artifact';

const ARTIFACT_KIND = 'fmea_early_v1';

export async function generateFmeaEarly(
  state: IntakeState,
): Promise<Partial<IntakeState>> {
  console.log('[GENERATE_fmea_early] entered');
  const ed = state.extractedData as Record<string, unknown> | undefined;
  const stub = ed?.['fmeaEarly'];
  const ffbd = ed?.['ffbd'];
  const n2 = ed?.['n2Matrix'];
  const dataFlows = ed?.['dataFlows'];

  if (!stub || !ffbd || !n2 || !dataFlows) {
    console.warn('[GENERATE_fmea_early] missing stub or upstream; persisting pending row');
    await persistArtifact({ projectId: state.projectId, kind: ARTIFACT_KIND, status: 'pending' });
    return {};
  }

  try {
    const result = await runFmeaEarlyAgent(
      {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ffbd: ffbd as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        n2: n2 as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dataFlows: dataFlows as any,
        ratingScalesVersion: '1.0.0',
        systemName: state.projectName,
        producedBy: 'langgraph:generate_fmea_early',
        outputPath: `runtime://project/${state.projectId}/fmea_early.v1.json`,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        upstreamRefs: { ffbd: 'runtime', n2_matrix: 'runtime', data_flows: 'runtime' } as any,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { stub: stub as any },
    );

    await persistArtifact({ projectId: state.projectId, kind: ARTIFACT_KIND, status: 'ready', result });
    // Synthesis artifacts persist to project_artifacts (above), NOT extractedData.
    return {};
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'unknown';
    console.error('[GENERATE_fmea_early] failed:', reason);
    await persistArtifact({ projectId: state.projectId, kind: ARTIFACT_KIND, status: 'failed', failureReason: reason });
    return { error: `generate_fmea_early: ${reason}` };
  }
}
