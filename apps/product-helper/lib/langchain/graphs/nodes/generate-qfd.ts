/**
 * Generate QFD Node
 *
 * v2.1 Wave A RE-WIRE (langgraph-wirer / handoff Issue 21): node now invokes
 * `hoq-agent` to emit `hoq.v1` whenever a stub is present at
 * `state.extractedData.hoq`, persisting to `project_artifacts(kind='hoq_v1')`.
 * The legacy `extractQFD` path is preserved for back-compat with the FROZEN
 * `components/system-design/qfd-viewer.tsx` (`extractedData.qfd` data path);
 * both paths run on every turn.
 *
 * Team: AI/Agent Engineering (Agent 3.1: LangChain Integration Engineer)
 *
 * @module graphs/nodes/generate-qfd
 */

import {
  IntakeState,
  computeArtifactReadiness,
  calculateCompleteness,
} from '../types';
import { extractQFD } from '../../agents/qfd-agent';
import { validateHoqArtifact } from '../../agents/system-design/hoq-agent';
import { formatMessagesAsText } from '../utils';
import { persistArtifact } from './_persist-artifact';

// ============================================================
// Main Node Function
// ============================================================

/**
 * Generate QFD House of Quality artifact from conversation and extracted data
 *
 * This node:
 * 1. Formats customer needs from actors' goals and pain points
 * 2. Formats performance criteria from decisionMatrix criteria
 * 3. Calls extractQFD with project context
 * 4. Merges QFD result into extractedData
 * 5. Adds qfd_house_of_quality to generatedArtifacts
 * 6. Recomputes completeness and artifactReadiness
 *
 * @param state - Current intake state with messages and extractedData
 * @returns Partial state with updated extractedData, completeness, artifactReadiness, generatedArtifacts
 */
export async function generateQFD(
  state: IntakeState
): Promise<Partial<IntakeState>> {
  if (state.error) {
    console.warn(`[GENERATE_QFD] Skipping: ${state.error}`);
    return {};
  }
  console.log(`[GENERATE_QFD] Node entered`);
  console.log(
    `[GENERATE_QFD] Messages: ${state.messages?.length ?? 0}, ` +
    `Actors: ${state.extractedData?.actors?.length ?? 0}, ` +
    `Decision matrix present: ${!!state.extractedData?.decisionMatrix}`
  );

  try {
    // Format conversation for extraction
    const conversationText = formatMessagesAsText(state.messages);

    if (!conversationText.trim()) {
      console.warn(`[GENERATE_QFD] No conversation text available — skipping`);
      return {
        completeness: calculateCompleteness(state.extractedData),
        artifactReadiness: computeArtifactReadiness(state.extractedData),
      };
    }

    // Format customer needs from actors' goals and pain points
    const actors = state.extractedData?.actors ?? [];
    const needsParts: string[] = [];
    for (const actor of actors) {
      const goals = actor.goals?.length
        ? actor.goals.map(g => `  Goal: ${g}`).join('\n')
        : '';
      const pains = actor.painPoints?.length
        ? actor.painPoints.map(p => `  Pain point: ${p}`).join('\n')
        : '';
      if (goals || pains) {
        needsParts.push(`${actor.name} (${actor.role}):\n${goals}${goals && pains ? '\n' : ''}${pains}`);
      }
    }
    const needsStr = needsParts.length > 0
      ? needsParts.join('\n\n')
      : 'No customer needs extracted yet.';

    // Format performance criteria from decision matrix
    const decisionMatrix = state.extractedData?.decisionMatrix;
    let criteriaStr = 'No performance criteria available yet.';
    if (decisionMatrix?.criteria?.length) {
      criteriaStr = decisionMatrix.criteria
        .map(c => `${c.id}: ${c.name} (weight: ${c.weight}) [${c.unit}]${c.targetValue ? ` target: ${c.targetValue}` : ''}${c.measurementMethod ? ` — ${c.measurementMethod}` : ''}`)
        .join('\n');
    }

    console.log(`[GENERATE_QFD] Calling extractQFD for project: ${state.projectName}`);

    // Call the QFD extraction agent
    const result = await extractQFD(
      conversationText,
      state.projectName,
      needsStr,
      criteriaStr,
      {
        extractedData: state.extractedData,
        projectType: state.projectType,
        projectVision: state.projectVision,
      }
    );

    // Handle null result gracefully
    if (!result) {
      console.warn(`[GENERATE_QFD] extractQFD returned null — preserving existing state`);
      return {
        extractedData: state.extractedData,
        completeness: calculateCompleteness(state.extractedData),
        artifactReadiness: computeArtifactReadiness(state.extractedData),
      };
    }

    console.log(`[GENERATE_QFD] QFD extraction succeeded`);

    // v2.1 Wave A RE-WIRE — additionally invoke hoq-agent (M6 HoQ.v1) if a
    // stub is provided on state. Persists to project_artifacts(kind='hoq_v1').
    let hoqResult: unknown = (state.extractedData as Record<string, unknown> | undefined)?.['hoq'];
    const hoqStub = hoqResult;
    if (hoqStub) {
      try {
        hoqResult = validateHoqArtifact(hoqStub);
        await persistArtifact({
          projectId: state.projectId,
          kind: 'hoq_v1',
          status: 'ready',
          result: hoqResult,
        });
        console.log('[GENERATE_QFD] hoq-agent re-wire emit OK');
      } catch (e) {
        const reason = e instanceof Error ? e.message : 'unknown';
        console.warn('[GENERATE_QFD] hoq-agent re-wire emit FAILED (non-fatal for legacy QFD):', reason);
        await persistArtifact({
          projectId: state.projectId,
          kind: 'hoq_v1',
          status: 'failed',
          failureReason: reason,
        });
        hoqResult = (state.extractedData as Record<string, unknown> | undefined)?.['hoq'];
      }
    } else {
      // No hoq stub on state — pending row keeps the manifest sane.
      await persistArtifact({ projectId: state.projectId, kind: 'hoq_v1', status: 'pending' });
    }

    // Legacy QFD result lands in extractedData (FROZEN qfd-viewer.tsx data path).
    // hoq.v1 (synthesis artifact) persists to project_artifacts above —
    // do NOT add to extractedData per Bond architectural correction.
    const updatedExtractedData = {
      ...state.extractedData,
      qfd: result,
    };

    // Recompute completeness and artifact readiness
    const completeness = calculateCompleteness(updatedExtractedData);
    const artifactReadiness = computeArtifactReadiness(updatedExtractedData);

    // Add new artifact phase to generated list
    const generatedArtifacts = [
      ...(state.generatedArtifacts ?? []),
      ...(['qfd_house_of_quality'] as const).filter(
        phase => !(state.generatedArtifacts ?? []).includes(phase)
      ),
    ];

    console.log(`[GENERATE_QFD] Returning state update — completeness: ${completeness}, generatedArtifacts: ${generatedArtifacts.length}`);

    return {
      extractedData: updatedExtractedData,
      completeness,
      artifactReadiness,
      generatedArtifacts,
    };
  } catch (error) {
    console.error(
      `[GENERATE_QFD] QFD generation FAILED:`,
      error instanceof Error ? error.message : error
    );

    return {
      error: `QFD generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
