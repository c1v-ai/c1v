/**
 * GENERATE_synthesis node — P10 greenfield refactor (T6 keystone).
 *
 * Substrate-read pattern (D-V22.01 + HANDOFF-2026-04-27 Correction 1):
 * reads state.messages + state.extractedData (substrate) + upstream artifacts
 * via ContextResolver (G4), evaluates the `m4-synthesis-keystone` engine.json
 * story tree, persists non-empty
 * `synthesis.architecture-recommendation.runtime-envelope.v1` to
 * project_artifacts(kind='recommendation_json') with status='ready'.
 *
 * Pre-P10 the node bailed with status='pending' when upstream
 * (decisionNetwork + nfrs + interfaces + fmea_residual + hoq) wasn't all
 * present. P10 closure (D-V22.01 Path B) drops that early-exit and reads
 * directly from substrate. Upstream artifact shas remain captured when
 * available — when they're missing, sha256Of({}) seeds the inputs_hash
 * deterministically and the engine evaluation drives the keystone payload.
 *
 * Per R-v2.1.A Option C, this is a graph-node adapter, NOT an agent
 * refactor — `assembleArchitectureRecommendation` (offline) still owns the
 * full LLM-derived keystone narrative for self-application runs. The
 * runtime envelope carries the deterministic engine layer.
 *
 * @module lib/langchain/graphs/nodes/generate-synthesis
 */

import { IntakeState } from '../types';
import { persistArtifact } from './_persist-artifact';
import { computeInputsHash, sha256Of } from '../contracts/inputs-hash';
import { evaluateEngineStory, type RuntimeEnvelope } from './_engine-substrate';

const ARTIFACT_KIND = 'recommendation_json';
const STORY_ID = 'm4-synthesis-keystone';

export async function generateSynthesis(
  state: IntakeState,
): Promise<Partial<IntakeState>> {
  console.log('[GENERATE_synthesis] entered');

  const ed = state.extractedData as Record<string, unknown> | undefined;

  // Capture upstream shas opportunistically; missing keys seed sha256Of({}).
  const upstreamShas = {
    decision_network: sha256Of(ed?.['decisionNetwork'] ?? {}),
    nfrs: sha256Of(ed?.['nfrs'] ?? {}),
    interface_specs: sha256Of(ed?.['interfaces'] ?? {}),
    fmea_residual: sha256Of(ed?.['fmeaResidual'] ?? {}),
    hoq: sha256Of(ed?.['hoq'] ?? {}),
  };

  const inputsHash = computeInputsHash({
    intake: {
      projectId: state.projectId,
      projectName: state.projectName,
      projectVision: state.projectVision,
    },
    upstreamShas,
  });

  try {
    const evaluation = await evaluateEngineStory(STORY_ID, {
      projectId: state.projectId,
      messages: state.messages,
      extractedData: ed,
      projectName: state.projectName,
      projectVision: state.projectVision,
    });

    const envelope: RuntimeEnvelope<'synthesis.architecture-recommendation'> = {
      _schema: 'synthesis.architecture-recommendation.runtime-envelope.v1',
      _output_path: `runtime://project/${state.projectId}/architecture_recommendation.v1.json`,
      nfr_engine_contract_version: 'v1',
      project_id: state.projectId,
      project_name: state.projectName,
      synthesized_at: new Date().toISOString(),
      inputs_hash: inputsHash,
      engine_evaluation: evaluation,
      payload: {
        upstream_shas: upstreamShas,
        keystone_decisions: Object.fromEntries(
          evaluation.decisions.map((d) => [d.target_field, {
            value: d.value,
            confidence: d.final_confidence,
            status: d.status,
            matched_rule_id: d.matched_rule_id,
          }]),
        ),
      },
    };

    await persistArtifact({
      projectId: state.projectId,
      kind: ARTIFACT_KIND,
      status: 'ready',
      result: envelope,
      inputsHash,
    });
    return {};
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
