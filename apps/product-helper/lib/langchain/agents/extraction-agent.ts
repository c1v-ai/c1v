/**
 * Data Extraction Agent (Phase 10)
 *
 * Purpose: Automatically extract structured PRD data from conversation history
 * Pattern: Structured output with Zod schema validation
 * Team: AI/Agent Engineering (Agent 3.1: LangChain Integration Engineer)
 *
 * This agent uses GPT-4 with temperature=0 for deterministic extraction.
 * It analyzes conversation history and extracts:
 * - Actors (users, systems, external entities)
 * - Use cases (what users can do)
 * - System boundaries (internal vs external)
 * - Data entities (objects, attributes, relationships)
 */

import { ChatOpenAI } from '@langchain/openai';
import { extractionSchema, type ExtractionResult } from '../schemas';
import { extractionPrompt } from '../prompts';

/**
 * Extraction LLM Configuration
 * - Model: GPT-4 Turbo for high-quality extraction
 * - Temperature: 0 for deterministic results
 * - Max tokens: 3000 to handle large conversations
 */
const extractionLLM = new ChatOpenAI({
  modelName: 'gpt-4o',
  temperature: 0,
  maxTokens: 3000,
});

/**
 * Structured extraction LLM with Zod schema validation
 * Ensures output matches ExtractionResult type
 */
const structuredExtractionLLM = extractionLLM.withStructuredOutput(extractionSchema, {
  name: 'extract_prd_data',
});

/**
 * Extract structured PRD data from conversation history
 *
 * @param conversationHistory - Full conversation text (format: "role: content\n...")
 * @param projectName - Project name for context
 * @param projectVision - Project vision statement for context
 * @returns Validated extraction result matching ExtractionResult schema
 *
 * @example
 * ```typescript
 * const history = "user: We need a login system\nassistant: What types of users will there be?\n...";
 * const result = await extractProjectData(history, "My App", "A modern SaaS platform");
 * // result.actors = [{ name: "User", role: "Primary User", ... }]
 * ```
 */
export async function extractProjectData(
  conversationHistory: string,
  projectName: string,
  projectVision: string
): Promise<ExtractionResult> {
  try {
    // Format prompt with conversation context
    const promptText = await extractionPrompt.format({
      projectName,
      projectVision,
      conversationHistory,
    });

    // Invoke structured LLM for extraction
    const result = await structuredExtractionLLM.invoke(promptText);

    return result;
  } catch (error) {
    console.error('Extraction error:', error);

    // Return empty structure on failure
    return {
      actors: [],
      useCases: [],
      systemBoundaries: {
        internal: [],
        external: [],
      },
      dataEntities: [],
    };
  }
}

/**
 * Calculate project completeness score (0-100) based on extracted data
 *
 * Scoring criteria:
 * - Actors: 25% (need at least 2)
 * - Use cases: 35% (need at least 3)
 * - System boundaries: 20% (both internal and external defined)
 * - Data entities: 20% (need at least 1)
 *
 * @param extraction - Extraction result from extractProjectData
 * @returns Completeness score 0-100
 */
export function calculateCompleteness(extraction: ExtractionResult): number {
  let score = 0;

  // Actors: 25 points (max 2 needed)
  const actorCount = extraction.actors.length;
  if (actorCount >= 2) {
    score += 25;
  } else if (actorCount === 1) {
    score += 12;
  }

  // Use cases: 35 points (max 5 needed)
  const useCaseCount = extraction.useCases.length;
  if (useCaseCount >= 5) {
    score += 35;
  } else if (useCaseCount >= 3) {
    score += 25;
  } else if (useCaseCount >= 1) {
    score += 10;
  }

  // System boundaries: 20 points
  const hasInternal = extraction.systemBoundaries.internal.length > 0;
  const hasExternal = extraction.systemBoundaries.external.length > 0;
  if (hasInternal && hasExternal) {
    score += 20;
  } else if (hasInternal || hasExternal) {
    score += 10;
  }

  // Data entities: 20 points (max 3 needed)
  const entityCount = extraction.dataEntities.length;
  if (entityCount >= 3) {
    score += 20;
  } else if (entityCount >= 2) {
    score += 13;
  } else if (entityCount >= 1) {
    score += 7;
  }

  return Math.min(score, 100);
}

/**
 * Merge new extraction with existing data (incremental update)
 *
 * Strategy:
 * - Actors: Merge by name (deduplicate, prefer newer descriptions)
 * - Use cases: Merge by id (deduplicate)
 * - System boundaries: Union of arrays (deduplicate)
 * - Data entities: Merge by name (deduplicate)
 *
 * @param existing - Previously extracted data
 * @param newData - Newly extracted data
 * @returns Merged extraction result
 */
export function mergeExtractionData(
  existing: ExtractionResult,
  newData: ExtractionResult
): ExtractionResult {
  // Merge actors (deduplicate by name)
  const actorMap = new Map(existing.actors.map(a => [a.name, a]));
  newData.actors.forEach(actor => {
    actorMap.set(actor.name, actor); // Newer data overwrites
  });

  // Merge use cases (deduplicate by id)
  const useCaseMap = new Map(existing.useCases.map(uc => [uc.id, uc]));
  newData.useCases.forEach(useCase => {
    useCaseMap.set(useCase.id, useCase);
  });

  // Merge system boundaries (deduplicate arrays)
  const internalSet = new Set([
    ...existing.systemBoundaries.internal,
    ...newData.systemBoundaries.internal,
  ]);
  const externalSet = new Set([
    ...existing.systemBoundaries.external,
    ...newData.systemBoundaries.external,
  ]);

  // Merge data entities (deduplicate by name)
  const entityMap = new Map(existing.dataEntities.map(e => [e.name, e]));
  newData.dataEntities.forEach(entity => {
    entityMap.set(entity.name, entity);
  });

  return {
    actors: Array.from(actorMap.values()),
    useCases: Array.from(useCaseMap.values()),
    systemBoundaries: {
      internal: Array.from(internalSet),
      external: Array.from(externalSet),
    },
    dataEntities: Array.from(entityMap.values()),
  };
}
