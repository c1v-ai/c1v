/**
 * Generate Decision Matrix Node
 *
 * Purpose: Generate Decision Matrix / Performance Assessment (Step 4) from
 * conversation history, non-functional requirements, and FFBD data.
 *
 * Team: AI/Agent Engineering (Agent 3.1: LangChain Integration Engineer)
 *
 * @module graphs/nodes/generate-decision-matrix
 */

import {
  IntakeState,
  computeArtifactReadiness,
  calculateCompleteness,
} from '../types';
import { extractDecisionMatrix } from '../../agents/decision-matrix-agent';
import { formatMessagesAsText } from '../utils';

// ============================================================
// Main Node Function
// ============================================================

/**
 * Generate Decision Matrix artifact from conversation and extracted data
 *
 * This node:
 * 1. Formats non-functional requirements from extractedData
 * 2. Formats FFBD summary from extractedData.ffbd
 * 3. Calls extractDecisionMatrix with project context
 * 4. Merges decision matrix result into extractedData
 * 5. Adds decision_matrix to generatedArtifacts
 * 6. Recomputes completeness and artifactReadiness
 *
 * @param state - Current intake state with messages and extractedData
 * @returns Partial state with updated extractedData, completeness, artifactReadiness, generatedArtifacts
 */
export async function generateDecisionMatrix(
  state: IntakeState
): Promise<Partial<IntakeState>> {
  console.log(`[GENERATE_DECISION_MATRIX] Node entered`);
  console.log(
    `[GENERATE_DECISION_MATRIX] Messages: ${state.messages?.length ?? 0}, ` +
    `NFRs: ${state.extractedData?.nonFunctionalRequirements?.length ?? 0}, ` +
    `FFBD present: ${!!state.extractedData?.ffbd}`
  );

  try {
    // Format conversation for extraction
    const conversationText = formatMessagesAsText(state.messages);

    if (!conversationText.trim()) {
      console.warn(`[GENERATE_DECISION_MATRIX] No conversation text available — skipping`);
      return {
        completeness: calculateCompleteness(state.extractedData),
        artifactReadiness: computeArtifactReadiness(state.extractedData),
      };
    }

    // Format non-functional requirements from extractedData
    const requirementsStr = (state.extractedData?.nonFunctionalRequirements ?? [])
      .map(nfr => `${nfr.category}: ${nfr.requirement} (priority: ${nfr.priority ?? 'unset'})${nfr.metric ? ` [metric: ${nfr.metric}]` : ''}${nfr.target ? ` [target: ${nfr.target}]` : ''}`)
      .join('\n') || 'No non-functional requirements extracted yet.';

    // Format FFBD summary from extractedData
    const ffbd = state.extractedData?.ffbd;
    let ffbdStr = 'No FFBD data available yet.';
    if (ffbd) {
      const topLevelFns = ffbd.topLevelBlocks
        ?.map(blk => `${blk.id}: ${blk.name}${blk.description ? ` — ${blk.description}` : ''}`)
        .join('\n') ?? '';
      const decomposed = ffbd.decomposedBlocks
        ?.map(blk => `${blk.id}: ${blk.name} (parent: ${blk.parentId ?? 'root'})${blk.description ? ` — ${blk.description}` : ''}`)
        .join('\n') ?? '';
      ffbdStr = `Top-level functions:\n${topLevelFns || 'none'}\n\nDecomposed functions:\n${decomposed || 'none'}`;
    }

    console.log(`[GENERATE_DECISION_MATRIX] Calling extractDecisionMatrix for project: ${state.projectName}`);

    // Call the decision matrix extraction agent
    const result = await extractDecisionMatrix(
      conversationText,
      state.projectName,
      requirementsStr,
      ffbdStr
    );

    // Handle null result gracefully
    if (!result) {
      console.warn(`[GENERATE_DECISION_MATRIX] extractDecisionMatrix returned null — preserving existing state`);
      return {
        extractedData: state.extractedData,
        completeness: calculateCompleteness(state.extractedData),
        artifactReadiness: computeArtifactReadiness(state.extractedData),
      };
    }

    console.log(`[GENERATE_DECISION_MATRIX] Decision matrix extraction succeeded`);

    // Merge decision matrix result into extractedData
    const updatedExtractedData = {
      ...state.extractedData,
      decisionMatrix: result,
    };

    // Recompute completeness and artifact readiness
    const completeness = calculateCompleteness(updatedExtractedData);
    const artifactReadiness = computeArtifactReadiness(updatedExtractedData);

    // Add new artifact phase to generated list
    const generatedArtifacts = [
      ...(state.generatedArtifacts ?? []),
      ...(['decision_matrix'] as const).filter(
        phase => !(state.generatedArtifacts ?? []).includes(phase)
      ),
    ];

    console.log(`[GENERATE_DECISION_MATRIX] Returning state update — completeness: ${completeness}, generatedArtifacts: ${generatedArtifacts.length}`);

    return {
      extractedData: updatedExtractedData,
      completeness,
      artifactReadiness,
      generatedArtifacts,
    };
  } catch (error) {
    console.error(
      `[GENERATE_DECISION_MATRIX] Decision matrix generation FAILED:`,
      error instanceof Error ? error.message : error
    );

    return {
      error: `Decision matrix generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
