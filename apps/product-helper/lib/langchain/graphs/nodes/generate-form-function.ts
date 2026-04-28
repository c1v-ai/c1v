/**
 * GENERATE_form_function node — P10 greenfield refactor (M5).
 *
 * Substrate-read pattern (D-V22.01 + HANDOFF-2026-04-27 Correction 1):
 * reads state.messages + state.extractedData (substrate) + upstream artifacts
 * via ContextResolver (G4), evaluates the `m5-form-function` engine.json
 * story tree, persists non-empty `form_function_map.runtime-envelope.v1` to
 * project_artifacts(kind='form_function_map_v1') with status='ready'.
 *
 * @module lib/langchain/graphs/nodes/generate-form-function
 */

import { IntakeState } from '../types';
import { persistArtifact } from './_persist-artifact';
import { computeInputsHash, sha256Of } from '../contracts/inputs-hash';
import { evaluateEngineStory, type RuntimeEnvelope } from './_engine-substrate';

const ARTIFACT_KIND = 'form_function_map_v1';
const STORY_ID = 'm5-form-function';

export async function generateFormFunction(
  state: IntakeState,
): Promise<Partial<IntakeState>> {
  console.log('[GENERATE_form_function] entered');

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

    const envelope: RuntimeEnvelope<'form_function_map'> = {
      _schema: 'form_function_map.runtime-envelope.v1',
      _output_path: `runtime://project/${state.projectId}/form_function_map.v1.json`,
      nfr_engine_contract_version: 'v1',
      project_id: state.projectId,
      project_name: state.projectName,
      synthesized_at: new Date().toISOString(),
      inputs_hash: inputsHash,
      engine_evaluation: evaluation,
      payload: {
        form_assignments: Object.fromEntries(
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
    console.error('[GENERATE_form_function] failed:', reason);
    await persistArtifact({
      projectId: state.projectId,
      kind: ARTIFACT_KIND,
      status: 'failed',
      failureReason: reason,
      inputsHash,
    });
    return { error: `generate_form_function: ${reason}` };
  }
}
