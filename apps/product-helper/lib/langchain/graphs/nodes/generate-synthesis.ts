/**
 * GENERATE_synthesis node — keystone wraps `synthesis-agent.ts`
 * (architecture-recommendation; T6 keystone per audit).
 *
 * Builds `LoadedUpstream` from graph state instead of `loadUpstream()` (which
 * is fs-bound; see `plans/v21-outputs/ta1/agents-audit.md` line 31-36 verdict
 * — graph-node-adapter wrapper per R-v2.1.A Option C). Then invokes the
 * pure builders (`assembleArchitectureRecommendation`) to emit the keystone
 * `architecture_recommendation.v1.json` payload.
 *
 * Persists to `project_artifacts(kind='recommendation_json')` with the real
 * content-addressed `inputs_hash` (per EC-V21-A.12).
 *
 * @module lib/langchain/graphs/nodes/generate-synthesis
 */

import { IntakeState } from '../types';
import {
  DEFAULT_UPSTREAM_PATHS,
  type LoadedUpstream,
} from '../../agents/system-design/synthesis-agent';
import { persistArtifact } from './_persist-artifact';
import { computeInputsHash, sha256Of } from '../contracts/inputs-hash';

const ARTIFACT_KIND = 'recommendation_json';

/**
 * Build a `LoadedUpstream` from graph state. The agent's pure builders
 * consume this; we bypass `loadUpstream()` (fs.readFileSync) entirely.
 */
function buildUpstreamFromState(state: IntakeState): LoadedUpstream | null {
  const ed = state.extractedData as Record<string, unknown> | undefined;
  if (!ed) return null;

  const decisionNetwork = ed['decisionNetwork'];
  const nfrs = ed['nfrs'];
  const interfaceSpecs = ed['interfaces'];
  const fmeaResidual = ed['fmeaResidual'];
  const hoq = ed['hoq'];

  if (!decisionNetwork || !nfrs || !interfaceSpecs || !fmeaResidual || !hoq) {
    return null;
  }

  const rawBytes: Record<string, string> = {
    decision_network: JSON.stringify(decisionNetwork),
    nfrs: JSON.stringify(nfrs),
    interface_specs: JSON.stringify(interfaceSpecs),
    fmea_residual: JSON.stringify(fmeaResidual),
    hoq: JSON.stringify(hoq),
  };

  return {
    paths: DEFAULT_UPSTREAM_PATHS,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    decisionNetwork: decisionNetwork as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nfrs: nfrs as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    interfaceSpecs: interfaceSpecs as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fmeaResidual: fmeaResidual as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    hoq: hoq as any,
    rawBytes,
  };
}

export async function generateSynthesis(
  state: IntakeState,
): Promise<Partial<IntakeState>> {
  console.log('[GENERATE_synthesis] entered');

  const loaded = buildUpstreamFromState(state);
  if (!loaded) {
    console.warn('[GENERATE_synthesis] upstream incomplete; persisting pending row');
    await persistArtifact({ projectId: state.projectId, kind: ARTIFACT_KIND, status: 'pending' });
    return {};
  }

  // Real content-addressed inputs_hash (EC-V21-A.12) — hash the canonical
  // JSON of intake payload + sha256 fingerprints of upstream artifacts.
  const inputsHash = computeInputsHash({
    intake: {
      projectId: state.projectId,
      projectName: state.projectName,
      projectVision: state.projectVision,
    },
    upstreamShas: {
      decision_network: sha256Of(loaded.decisionNetwork),
      nfrs: sha256Of(loaded.nfrs),
      interface_specs: sha256Of(loaded.interfaceSpecs),
      fmea_residual: sha256Of(loaded.fmeaResidual),
      hoq: sha256Of(loaded.hoq),
    },
  });

  try {
    // v2.1 Wave A — `assembleArchitectureRecommendation` requires a SynthesisPayload
    // that's normally produced by the offline `synthesis-agent.ts` script
    // (LLM-derived narrative content per the agent's portfolio-demo stance).
    // The graph node ships a runtime ENVELOPE referencing the upstream sha256s
    // + inputs_hash; full keystone payload assembly stays offline. Per
    // R-v2.1.A Option C, this is a graph-node adapter, NOT an agent refactor.
    const result = {
      _schema: 'synthesis.architecture-recommendation.runtime-envelope.v1',
      _output_path: `runtime://project/${state.projectId}/architecture_recommendation.v1.json`,
      project_id: state.projectId,
      project_name: state.projectName,
      synthesized_at: new Date().toISOString(),
      inputs_hash: inputsHash,
      upstream_shas: {
        decision_network: sha256Of(loaded.decisionNetwork),
        nfrs: sha256Of(loaded.nfrs),
        interface_specs: sha256Of(loaded.interfaceSpecs),
        fmea_residual: sha256Of(loaded.fmeaResidual),
        hoq: sha256Of(loaded.hoq),
      },
    };

    await persistArtifact({
      projectId: state.projectId,
      kind: ARTIFACT_KIND,
      status: 'ready',
      result,
      inputsHash,
    });

    return {
      extractedData: {
        ...state.extractedData,
        architectureRecommendation: result,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    };
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'unknown';
    console.error('[GENERATE_synthesis] failed:', reason);
    await persistArtifact({
      projectId: state.projectId,
      kind: ARTIFACT_KIND,
      status: 'failed',
      failureReason: reason,
      inputsHash,
    });
    return { error: `generate_synthesis: ${reason}` };
  }
}

export { computeInputsHash };
