/**
 * GENERATE_data_flows node — P10 greenfield refactor.
 *
 * Substrate-read pattern (D-V22.01 + HANDOFF-2026-04-27 Correction 1):
 * reads `state.messages` + `state.extractedData` (substrate) + upstream
 * artifacts via ContextResolver (G4), then evaluates the `m1-data-flows`
 * engine.json story tree via `evaluateWaveE()` and persists a non-empty
 * `data_flows.runtime-envelope.v1` to project_artifacts(kind='data_flows_v1').
 *
 * The earlier (re-validator) pattern bailed with status='pending' when the
 * caller hadn't pre-populated `extractedData.dataFlows`. P10 closure inverts
 * that: the node generates output FROM the substrate using the deterministic
 * rule-tree-first narrative.
 *
 * @module lib/langchain/graphs/nodes/generate-data-flows
 */

import { IntakeState } from '../types';
import { persistArtifact } from './_persist-artifact';
import { computeInputsHash, sha256Of } from '../contracts/inputs-hash';
import { evaluateEngineStory, type RuntimeEnvelope } from './_engine-substrate';

const ARTIFACT_KIND = 'data_flows_v1';
const STORY_ID = 'm1-data-flows';

export async function generateDataFlows(
  state: IntakeState,
): Promise<Partial<IntakeState>> {
  console.log('[GENERATE_data_flows] entered');

  const ed = state.extractedData as Record<string, unknown> | undefined;
  const inputsHash = computeInputsHash({
    intake: {
      projectId: state.projectId,
      projectName: state.projectName,
      projectVision: state.projectVision,
    },
    upstreamShas: { extractedData: sha256Of(ed ?? {}) },
  });

  try {
    const evaluation = await evaluateEngineStory(STORY_ID, {
      projectId: state.projectId,
      messages: state.messages,
      extractedData: ed,
      projectName: state.projectName,
      projectVision: state.projectVision,
    });

    const envelope: RuntimeEnvelope<'data_flows'> = {
      _schema: 'data_flows.runtime-envelope.v1',
      _output_path: `runtime://project/${state.projectId}/data_flows.v1.json`,
      nfr_engine_contract_version: 'v1',
      project_id: state.projectId,
      project_name: state.projectName,
      synthesized_at: new Date().toISOString(),
      inputs_hash: inputsHash,
      engine_evaluation: evaluation,
      payload: {
        // Engine outputs project to a per-flow classification dict; downstream
        // FFBD / N2 / FMEA-early consumers read `target_field` strings.
        flow_classifications: Object.fromEntries(
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
    console.error('[GENERATE_data_flows] failed:', reason);
    await persistArtifact({
      projectId: state.projectId,
      kind: ARTIFACT_KIND,
      status: 'failed',
      failureReason: reason,
      inputsHash,
    });
    return { error: `generate_data_flows: ${reason}` };
  }
}
