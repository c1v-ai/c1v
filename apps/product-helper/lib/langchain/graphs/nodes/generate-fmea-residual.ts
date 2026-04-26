/**
 * GENERATE_fmea_residual node — wraps `fmea-residual-agent` (M8.b).
 *
 * Reads `fmeaEarly` + `decisionNetwork` + `formFunction` + `interfaces` from
 * state.extractedData and invokes `runFmeaResidualAgent` via stub path.
 * Result persists to `project_artifacts(kind='fmea_residual_v1')`.
 *
 * Failure-path open-question surfacing (per master plan v2.1 §Wave A ↔ Wave E
 * contract pin) is owned by `maybeSurfaceResidualOpenQuestion` inside the
 * agent — graph node propagates state, not the surface decision.
 *
 * @module lib/langchain/graphs/nodes/generate-fmea-residual
 */

import { IntakeState } from '../types';
import { runFmeaResidualAgent } from '../../agents/system-design/fmea-residual-agent';
import { persistArtifact } from './_persist-artifact';

const ARTIFACT_KIND = 'fmea_residual_v1';

export async function generateFmeaResidual(
  state: IntakeState,
): Promise<Partial<IntakeState>> {
  console.log('[GENERATE_fmea_residual] entered');
  const ed = state.extractedData as Record<string, unknown> | undefined;
  const stub = ed?.['fmeaResidual'];

  if (!stub) {
    console.warn('[GENERATE_fmea_residual] missing stub; persisting pending row');
    await persistArtifact({ projectId: state.projectId, kind: ARTIFACT_KIND, status: 'pending' });
    return {};
  }

  try {
    const fmeaEarly = ed?.['fmeaEarly'];
    const decisionNetwork = ed?.['decisionNetwork'];
    const formFunction = ed?.['formFunction'];
    const interfaces = ed?.['interfaces'];
    const ffbd = ed?.['ffbd'];
    const n2 = ed?.['n2Matrix'];
    const dataFlows = ed?.['dataFlows'];

    const result = await runFmeaResidualAgent(
      {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fmeaEarly: fmeaEarly as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        decisionNetwork: decisionNetwork as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        formFunctionMap: formFunction as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        interfaceSpecs: interfaces as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ffbd: ffbd as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        n2: n2 as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dataFlows: dataFlows as any,
        ratingScalesVersion: '1.0.0',
        systemName: state.projectName,
        producedBy: 'langgraph:generate_fmea_residual',
        outputPath: `runtime://project/${state.projectId}/fmea_residual.v1.json`,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        upstreamRefs: {} as any,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { stub: stub as any },
    );

    await persistArtifact({ projectId: state.projectId, kind: ARTIFACT_KIND, status: 'ready', result });
    return {
      extractedData: {
        ...state.extractedData,
        fmeaResidual: result,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    };
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'unknown';
    console.error('[GENERATE_fmea_residual] failed:', reason);
    await persistArtifact({ projectId: state.projectId, kind: ARTIFACT_KIND, status: 'failed', failureReason: reason });
    return { error: `generate_fmea_residual: ${reason}` };
  }
}
