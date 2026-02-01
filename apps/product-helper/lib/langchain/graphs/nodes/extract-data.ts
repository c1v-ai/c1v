/**
 * Extract Data Node
 *
 * Purpose: Deep extraction of structured PRD data from conversation history.
 * Uses the existing extraction agent with schema validation.
 *
 * Team: AI/Agent Engineering (Agent 3.1: LangChain Integration Engineer)
 *
 * @module graphs/nodes/extract-data
 */

import {
  IntakeState,
  ArtifactReadiness,
  computeArtifactReadiness,
  calculateCompleteness,
} from '../types';
import {
  extractProjectData,
  mergeExtractionData,
} from '../../agents/extraction-agent';
import { ExtractionResult } from '../../schemas';
import { formatMessagesAsText } from '../utils';

// ============================================================
// Main Node Function
// ============================================================

/**
 * Extract structured PRD data from conversation
 *
 * This node:
 * 1. Formats the conversation history for the extraction LLM
 * 2. Runs extraction using the existing extraction agent
 * 3. Merges new data with existing data (incremental updates)
 * 4. Computes completeness score
 * 5. Computes artifact readiness for each PRD-SPEC artifact
 *
 * @param state - Current intake state with messages
 * @returns Partial state with updated extractedData, completeness, artifactReadiness
 *
 * @example
 * After extraction:
 * {
 *   extractedData: {
 *     actors: [{ name: 'Admin', role: 'Primary User', ... }],
 *     useCases: [{ id: 'UC1', name: 'Manage Users', ... }],
 *     systemBoundaries: { internal: [...], external: [...] },
 *     dataEntities: [...]
 *   },
 *   completeness: 45,
 *   artifactReadiness: { context_diagram: true, use_case_diagram: false, ... }
 * }
 */
export async function extractData(
  state: IntakeState
): Promise<Partial<IntakeState>> {
  // [EXTRACT_DEBUG] Entry point logging
  console.log(`[EXTRACT_DEBUG] extractData node called`);
  console.log(`[EXTRACT_DEBUG] Messages: ${state.messages?.length ?? 0}, Current data - actors: ${state.extractedData?.actors?.length ?? 0}, useCases: ${state.extractedData?.useCases?.length ?? 0}`);

  try {
    // Format conversation for extraction
    const conversationText = formatMessagesAsText(state.messages);

    // [EXTRACT_DEBUG] Conversation text length
    console.log(`[EXTRACT_DEBUG] Conversation text length: ${conversationText.length} chars`);

    // Skip extraction if no messages
    if (!conversationText.trim()) {
      // [EXTRACT_DEBUG] Skipping extraction
      console.log(`[EXTRACT_DEBUG] Skipping extraction - no conversation text`);
      return {
        completeness: calculateCompleteness(state.extractedData),
        artifactReadiness: computeArtifactReadiness(state.extractedData),
      };
    }

    // [EXTRACT_DEBUG] Before extraction call
    console.log(`[EXTRACT_DEBUG] Calling extractProjectData for project: ${state.projectName}`);

    // Run extraction using the existing extraction agent
    const newExtraction = await extractProjectData(
      conversationText,
      state.projectName,
      state.projectVision
    );

    // [EXTRACT_DEBUG] After extraction
    console.log(`[EXTRACT_DEBUG] Extraction returned - actors: ${newExtraction.actors?.length ?? 0}, useCases: ${newExtraction.useCases?.length ?? 0}`);

    // Merge with existing data (incremental)
    const mergedData = mergeExtractionData(state.extractedData, newExtraction);

    // Calculate completeness using the types module function
    const completeness = calculateCompleteness(mergedData);

    // [EXTRACT_DEBUG] After merge
    console.log(`[EXTRACT_DEBUG] After merge - actors: ${mergedData.actors?.length ?? 0}, useCases: ${mergedData.useCases?.length ?? 0}, completeness: ${completeness}`);

    // Compute artifact readiness using the types module function
    const artifactReadiness = computeArtifactReadiness(mergedData);

    // [EXTRACT_DEBUG] Function exit
    console.log(`[EXTRACT_DEBUG] Returning state update with completeness: ${completeness}`);

    return {
      extractedData: mergedData,
      completeness,
      artifactReadiness,
    };
  } catch (error) {
    // [EXTRACT_DEBUG] Error logging
    console.error(`[EXTRACT_DEBUG] Extraction FAILED:`, error instanceof Error ? error.message : error);
    console.error('Data extraction error:', error);

    // Return error state without crashing the graph
    return {
      error: `Extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Check if extraction produced meaningful new data
 * Useful for determining if we should proceed with validation
 *
 * @param before - Extraction result before update
 * @param after - Extraction result after update
 * @returns True if new data was extracted
 */
export function hasNewData(
  before: ExtractionResult,
  after: ExtractionResult
): boolean {
  // Compare counts
  const actorsDelta = after.actors.length - before.actors.length;
  const useCasesDelta = after.useCases.length - before.useCases.length;
  const internalDelta =
    after.systemBoundaries.internal.length -
    before.systemBoundaries.internal.length;
  const externalDelta =
    after.systemBoundaries.external.length -
    before.systemBoundaries.external.length;
  const entitiesDelta = after.dataEntities.length - before.dataEntities.length;

  return (
    actorsDelta > 0 ||
    useCasesDelta > 0 ||
    internalDelta > 0 ||
    externalDelta > 0 ||
    entitiesDelta > 0
  );
}

/**
 * Get a summary of extracted data for logging/debugging
 *
 * @param data - Extraction result
 * @returns Human-readable summary
 */
export function getExtractionSummary(data: ExtractionResult): string {
  return [
    `Actors: ${data.actors.length} (${data.actors.map(a => a.name).join(', ') || 'none'})`,
    `Use Cases: ${data.useCases.length} (${data.useCases.map(uc => uc.name).join(', ') || 'none'})`,
    `Internal Systems: ${data.systemBoundaries.internal.length}`,
    `External Systems: ${data.systemBoundaries.external.length}`,
    `Data Entities: ${data.dataEntities.length}`,
  ].join('\n');
}
