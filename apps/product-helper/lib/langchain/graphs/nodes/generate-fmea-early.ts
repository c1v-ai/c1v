/**
 * GENERATE_fmea_early node — P10 greenfield refactor (M8.a).
 *
 * Substrate-read pattern (D-V22.01 + HANDOFF-2026-04-27 Correction 1):
 * reads state.messages + state.extractedData (substrate) + upstream artifacts
 * via ContextResolver (G4), evaluates the `m8-fmea-early` engine.json story
 * tree, persists non-empty `fmea_early.runtime-envelope.v1` to
 * project_artifacts(kind='fmea_early_v1') with status='ready'.
 *
 * @module lib/langchain/graphs/nodes/generate-fmea-early
 */

import { IntakeState } from '../types';
import { persistArtifact } from './_persist-artifact';
import { computeInputsHash, sha256Of } from '../contracts/inputs-hash';
import { evaluateEngineStory, type RuntimeEnvelope } from './_engine-substrate';

const ARTIFACT_KIND = 'fmea_early_v1';
const STORY_ID = 'm8-fmea-early';

export async function generateFmeaEarly(
  state: IntakeState,
): Promise<Partial<IntakeState>> {
  console.log('[GENERATE_fmea_early] entered');

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

    const envelope: RuntimeEnvelope<'fmea_early'> = {
      _schema: 'fmea_early.runtime-envelope.v1',
      _output_path: `runtime://project/${state.projectId}/fmea_early.v1.json`,
      nfr_engine_contract_version: 'v1',
      project_id: state.projectId,
      project_name: state.projectName,
      synthesized_at: new Date().toISOString(),
      inputs_hash: inputsHash,
      engine_evaluation: evaluation,
      payload: {
        failure_mode_classifications: Object.fromEntries(
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
    console.error('[GENERATE_fmea_early] failed:', reason);
    await persistArtifact({
      projectId: state.projectId,
      kind: ARTIFACT_KIND,
      status: 'failed',
      failureReason: reason,
      inputsHash,
    });
    return { error: `generate_fmea_early: ${reason}` };
  }
}
