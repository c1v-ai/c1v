/**
 * Generate FFBD Node
 *
 * Purpose: Generate Functional Flow Block Diagram (Step 3) from conversation
 * history, use cases, and system boundaries.
 *
 * Team: AI/Agent Engineering (Agent 3.1: LangChain Integration Engineer)
 *
 * @module graphs/nodes/generate-ffbd
 */

import {
  IntakeState,
  computeArtifactReadiness,
  calculateCompleteness,
} from '../types';
import { extractFFBD } from '../../agents/ffbd-agent';
import { formatMessagesAsText } from '../utils';

// ============================================================
// Main Node Function
// ============================================================

/**
 * Generate FFBD artifacts from conversation and extracted data
 *
 * This node:
 * 1. Formats the conversation history for the FFBD extraction LLM
 * 2. Stringifies use cases and system boundaries from extractedData
 * 3. Calls extractFFBD with project context
 * 4. Merges FFBD result into extractedData
 * 5. Adds ffbd_top_level and ffbd_decomposed to generatedArtifacts
 * 6. Recomputes completeness and artifactReadiness
 *
 * @param state - Current intake state with messages and extractedData
 * @returns Partial state with updated extractedData, completeness, artifactReadiness, generatedArtifacts
 */
export async function generateFFBD(
  state: IntakeState
): Promise<Partial<IntakeState>> {
  console.log(`[GENERATE_FFBD] Node entered`);
  console.log(
    `[GENERATE_FFBD] Messages: ${state.messages?.length ?? 0}, ` +
    `Use cases: ${state.extractedData?.useCases?.length ?? 0}, ` +
    `Internal boundaries: ${state.extractedData?.systemBoundaries?.internal?.length ?? 0}, ` +
    `External boundaries: ${state.extractedData?.systemBoundaries?.external?.length ?? 0}`
  );

  try {
    // Format conversation for extraction
    const conversationText = formatMessagesAsText(state.messages);

    if (!conversationText.trim()) {
      console.warn(`[GENERATE_FFBD] No conversation text available — skipping`);
      return {
        completeness: calculateCompleteness(state.extractedData),
        artifactReadiness: computeArtifactReadiness(state.extractedData),
      };
    }

    // Stringify use cases from extracted data
    const useCasesStr = (state.extractedData?.useCases ?? [])
      .map(uc =>
        `${uc.id}: ${uc.name} — ${uc.description}` +
        (uc.preconditions?.length ? ` [Pre: ${uc.preconditions.join('; ')}]` : '') +
        (uc.postconditions?.length ? ` [Post: ${uc.postconditions.join('; ')}]` : '')
      )
      .join('\n') || 'No use cases extracted yet.';

    // Stringify system boundaries from extracted data
    const boundaries = state.extractedData?.systemBoundaries;
    const boundariesStr = boundaries
      ? `Internal: ${boundaries.internal.join(', ') || 'none'}\nExternal: ${boundaries.external.join(', ') || 'none'}${boundaries.inScope?.length ? `\nIn-scope: ${boundaries.inScope.join(', ')}` : ''}${boundaries.outOfScope?.length ? `\nOut-of-scope: ${boundaries.outOfScope.join(', ')}` : ''}`
      : 'No system boundaries extracted yet.';

    console.log(`[GENERATE_FFBD] Calling extractFFBD for project: ${state.projectName}`);

    // Call the FFBD extraction agent
    const result = await extractFFBD(
      conversationText,
      state.projectName,
      state.projectVision,
      useCasesStr,
      boundariesStr
    );

    // Handle null result gracefully
    if (!result) {
      console.warn(`[GENERATE_FFBD] extractFFBD returned null — preserving existing state`);
      return {
        extractedData: state.extractedData,
        completeness: calculateCompleteness(state.extractedData),
        artifactReadiness: computeArtifactReadiness(state.extractedData),
      };
    }

    console.log(`[GENERATE_FFBD] FFBD extraction succeeded`);

    // Merge FFBD result into extractedData
    const updatedExtractedData = {
      ...state.extractedData,
      ffbd: result,
    };

    // Recompute completeness and artifact readiness
    const completeness = calculateCompleteness(updatedExtractedData);
    const artifactReadiness = computeArtifactReadiness(updatedExtractedData);

    // Add new artifact phases to generated list
    const generatedArtifacts = [
      ...(state.generatedArtifacts ?? []),
      ...(['ffbd_top_level', 'ffbd_decomposed'] as const).filter(
        phase => !(state.generatedArtifacts ?? []).includes(phase)
      ),
    ];

    console.log(`[GENERATE_FFBD] Returning state update — completeness: ${completeness}, generatedArtifacts: ${generatedArtifacts.length}`);

    return {
      extractedData: updatedExtractedData,
      completeness,
      artifactReadiness,
      generatedArtifacts,
    };
  } catch (error) {
    console.error(
      `[GENERATE_FFBD] FFBD generation FAILED:`,
      error instanceof Error ? error.message : error
    );

    return {
      error: `FFBD generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
