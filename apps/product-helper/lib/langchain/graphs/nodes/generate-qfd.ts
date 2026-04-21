/**
 * Generate QFD Node
 *
 * Purpose: Generate QFD House of Quality (Step 5) from conversation history,
 * customer needs (actor goals + pain points), and performance criteria from
 * the decision matrix.
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
import { formatMessagesAsText } from '../utils';

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
      criteriaStr
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

    // Merge QFD result into extractedData
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
