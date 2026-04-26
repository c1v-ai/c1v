/**
 * GENERATE_form_function node — wraps `form-function-agent` (M5).
 *
 * Reads `ffbd` + `fmeaEarly` from `state.extractedData` and invokes
 * `runFormFunctionAgent` (stub path, portfolio-demo stance per agent JSDoc).
 * Result persists to `project_artifacts(kind='form_function_map_v1')`.
 *
 * @module lib/langchain/graphs/nodes/generate-form-function
 */

import { IntakeState } from '../types';
import { runFormFunctionAgent } from '../../agents/system-design/form-function-agent';
import { persistArtifact } from './_persist-artifact';

const ARTIFACT_KIND = 'form_function_map_v1';

export async function generateFormFunction(
  state: IntakeState,
): Promise<Partial<IntakeState>> {
  console.log('[GENERATE_form_function] entered');
  const ed = state.extractedData as Record<string, unknown> | undefined;
  const stub = ed?.['formFunction'];
  const ffbd = ed?.['ffbd'];
  const fmea = ed?.['fmeaEarly'];

  if (!stub || !ffbd || !fmea) {
    console.warn('[GENERATE_form_function] missing stub or upstream; persisting pending row');
    await persistArtifact({ projectId: state.projectId, kind: ARTIFACT_KIND, status: 'pending' });
    return {};
  }

  try {
    const result = await runFormFunctionAgent(
      {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ffbd: ffbd as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fmea: fmea as any,
        nfrsPath: 'runtime',
        systemName: state.projectName,
        producedBy: 'langgraph:generate_form_function',
        outputPath: `runtime://project/${state.projectId}/form_function_map.v1.json`,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        upstreamRefs: { ffbd: 'runtime', fmea_early: 'runtime', nfrs: 'runtime' } as any,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { stub: stub as any },
    );

    await persistArtifact({ projectId: state.projectId, kind: ARTIFACT_KIND, status: 'ready', result });

    return {
      extractedData: {
        ...state.extractedData,
        formFunction: result,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    };
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'unknown';
    console.error('[GENERATE_form_function] failed:', reason);
    await persistArtifact({ projectId: state.projectId, kind: ARTIFACT_KIND, status: 'failed', failureReason: reason });
    return { error: `generate_form_function: ${reason}` };
  }
}
