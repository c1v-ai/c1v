/**
 * GENERATE_n2 node — P10 greenfield refactor (M7.a).
 *
 * Substrate-read pattern (D-V22.01 + HANDOFF-2026-04-27 Correction 1):
 * reads state.messages + state.extractedData (substrate) + upstream artifacts
 * via ContextResolver (G4), evaluates the `m7-n2` engine.json story tree,
 * persists non-empty `n2_matrix.runtime-envelope.v1` to project_artifacts
 * (kind='n2_matrix_v1') with status='ready'.
 *
 * @module lib/langchain/graphs/nodes/generate-n2
 */

import { IntakeState } from '../types';
import { persistArtifact } from './_persist-artifact';
import { computeInputsHash, sha256Of } from '../contracts/inputs-hash';
import { evaluateEngineStory, type RuntimeEnvelope } from './_engine-substrate';

const ARTIFACT_KIND = 'n2_matrix_v1';
const STORY_ID = 'm7-n2';

export async function generateN2(state: IntakeState): Promise<Partial<IntakeState>> {
  console.log('[GENERATE_n2] entered');

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
    const evaluation = await evaluateEngineStory(
      STORY_ID,
      {
        projectId: state.projectId,
        messages: state.messages,
        extractedData: ed,
        projectName: state.projectName,
        projectVision: state.projectVision,
      },
      {
        auditContext: {
          projectId: state.projectId,
          agentId: 'generate_n2',
          targetArtifact: ARTIFACT_KIND,
          storyId: STORY_ID,
          engineVersion: 'v1',
          modelVersion: 'deterministic-rule-tree',
        },
      },
    );

    const envelope: RuntimeEnvelope<'n2_matrix'> = {
      _schema: 'n2_matrix.runtime-envelope.v1',
      _output_path: `runtime://project/${state.projectId}/n2_matrix.v1.json`,
      nfr_engine_contract_version: 'v1',
      project_id: state.projectId,
      project_name: state.projectName,
      synthesized_at: new Date().toISOString(),
      inputs_hash: inputsHash,
      engine_evaluation: evaluation,
      payload: {
        interface_classifications: Object.fromEntries(
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
    console.error('[GENERATE_n2] failed:', reason);
    await persistArtifact({
      projectId: state.projectId,
      kind: ARTIFACT_KIND,
      status: 'failed',
      failureReason: reason,
      inputsHash,
    });
    return { error: `generate_n2: ${reason}` };
  }
}
