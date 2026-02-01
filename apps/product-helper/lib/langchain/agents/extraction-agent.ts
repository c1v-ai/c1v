/**
 * Data Extraction Agent (Phase 10)
 *
 * Purpose: Automatically extract structured PRD data from conversation history
 * Pattern: Structured output with Zod schema validation
 * Team: AI/Agent Engineering (Agent 3.1: LangChain Integration Engineer)
 *
 * Uses Claude Sonnet via central config for deterministic extraction.
 * Analyzes conversation history and extracts:
 * - Actors (users, systems, external entities)
 * - Use cases (what users can do)
 * - System boundaries (internal vs external)
 * - Data entities (objects, attributes, relationships)
 */

import { createClaudeAgent } from '../config';
import { extractionSchema, type ExtractionResult } from '../schemas';
import { extractionPrompt } from '../prompts';

/**
 * Structured extraction LLM with Zod schema validation
 * Uses Claude Sonnet with temperature 0.2 for deterministic results
 */
const structuredExtractionLLM = createClaudeAgent(extractionSchema, 'extract_prd_data', {
  temperature: 0.2,
  maxTokens: 3000,
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
      educationBlock: '',
    });

    // Invoke structured LLM for extraction
    const result = await structuredExtractionLLM.invoke(promptText);

    // Validate and log quality issues
    validateExtractionQuality(result, projectName);

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
 * Validate extraction quality and log issues for monitoring
 * Does not fail extraction - just logs for observability
 *
 * @param result - Extraction result to validate
 * @param projectName - Project name for log context
 */
function validateExtractionQuality(
  result: ExtractionResult,
  projectName: string
): void {
  const issues: string[] = [];

  // Check problem statement
  if (!result.problemStatement?.summary || result.problemStatement.summary.length < 20) {
    issues.push('problemStatement.summary missing or too short');
  }
  if (!result.problemStatement?.goals || result.problemStatement.goals.length < 2) {
    issues.push('problemStatement.goals missing or insufficient (need 2+)');
  }

  // Check actor goals/painPoints
  const actorsWithGoals = result.actors.filter(a => a.goals && a.goals.length > 0);
  if (result.actors.length > 0 && actorsWithGoals.length === 0) {
    issues.push('No actors have goals populated');
  }
  const actorsWithPainPoints = result.actors.filter(a => a.painPoints && a.painPoints.length > 0);
  if (result.actors.length > 0 && actorsWithPainPoints.length === 0) {
    issues.push('No actors have painPoints populated');
  }

  // Check goals/metrics
  if (!result.goalsMetrics || result.goalsMetrics.length < 3) {
    issues.push(`goalsMetrics has ${result.goalsMetrics?.length ?? 0} items (need 3+)`);
  }

  // Check NFRs
  if (!result.nonFunctionalRequirements || result.nonFunctionalRequirements.length < 3) {
    issues.push(`nonFunctionalRequirements has ${result.nonFunctionalRequirements?.length ?? 0} items (need 3+)`);
  } else {
    // Check category diversity
    const categories = new Set(result.nonFunctionalRequirements.map(n => n.category));
    if (categories.size < 3) {
      issues.push(`NFRs only cover ${categories.size} categories (need 3+)`);
    }
  }

  // Log issues if any
  if (issues.length > 0) {
    console.warn(`[Extraction Quality] Project "${projectName}" has ${issues.length} issues:`, issues);
  } else {
    console.log(`[Extraction Quality] Project "${projectName}" passed all quality checks`);
  }
}

/**
 * Calculate project completeness score (0-100) based on extracted data
 *
 * Scoring criteria:
 * - Actors: 20% (2+ = 20, 1 = 10)
 * - Use cases: 30% (5+ = 30, 3+ = 20, 1+ = 8)
 * - System boundaries: 20% (both = 20, one = 10)
 * - Data entities: 15% (3+ = 15, 2+ = 10, 1+ = 5)
 * - Goals/Metrics: 15% (3+ = 15, 2+ = 10, 1+ = 5)
 *
 * @param extraction - Extraction result from extractProjectData
 * @returns Completeness score 0-100
 */
export function calculateCompleteness(extraction: ExtractionResult): number {
  let score = 0;

  // Actors: 20 points (max 2 needed)
  const actorCount = extraction.actors.length;
  if (actorCount >= 2) {
    score += 20;
  } else if (actorCount === 1) {
    score += 10;
  }

  // Use cases: 30 points (max 5 needed)
  const useCaseCount = extraction.useCases.length;
  if (useCaseCount >= 5) {
    score += 30;
  } else if (useCaseCount >= 3) {
    score += 20;
  } else if (useCaseCount >= 1) {
    score += 8;
  }

  // System boundaries: 20 points
  const hasInternal = extraction.systemBoundaries.internal.length > 0;
  const hasExternal = extraction.systemBoundaries.external.length > 0;
  if (hasInternal && hasExternal) {
    score += 20;
  } else if (hasInternal || hasExternal) {
    score += 10;
  }

  // Data entities: 15 points (max 3 needed)
  const entityCount = extraction.dataEntities.length;
  if (entityCount >= 3) {
    score += 15;
  } else if (entityCount >= 2) {
    score += 10;
  } else if (entityCount >= 1) {
    score += 5;
  }

  // Goals/Metrics: 15 points (max 3 needed)
  const goalsCount = extraction.goalsMetrics?.length ?? 0;
  if (goalsCount >= 3) {
    score += 15;
  } else if (goalsCount >= 2) {
    score += 10;
  } else if (goalsCount >= 1) {
    score += 5;
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

  // Merge problem statement (newer data takes priority)
  const problemStatement = newData.problemStatement ?? existing.problemStatement;

  // Merge goals/metrics (newer data takes priority)
  const goalsMetrics = newData.goalsMetrics ?? existing.goalsMetrics;

  // Merge non-functional requirements (newer data takes priority)
  const nonFunctionalRequirements = newData.nonFunctionalRequirements ?? existing.nonFunctionalRequirements;

  // Merge system boundaries scope fields
  const inScopeSet = new Set([
    ...(existing.systemBoundaries.inScope ?? []),
    ...(newData.systemBoundaries.inScope ?? []),
  ]);
  const outOfScopeSet = new Set([
    ...(existing.systemBoundaries.outOfScope ?? []),
    ...(newData.systemBoundaries.outOfScope ?? []),
  ]);

  return {
    actors: Array.from(actorMap.values()),
    useCases: Array.from(useCaseMap.values()),
    systemBoundaries: {
      internal: Array.from(internalSet),
      external: Array.from(externalSet),
      inScope: Array.from(inScopeSet),
      outOfScope: Array.from(outOfScopeSet),
    },
    dataEntities: Array.from(entityMap.values()),
    problemStatement,
    goalsMetrics,
    nonFunctionalRequirements,
  };
}
