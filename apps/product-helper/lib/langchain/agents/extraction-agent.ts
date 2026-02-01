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
 * Scoring criteria (total 100 points):
 * - Actors: 15% (2+ = 15, 1 = 8)
 * - Actor depth (goals/painPoints): 5% (50%+ actors have both = 5, some = 3)
 * - Use cases: 20% (5+ = 20, 3+ = 14, 1+ = 6)
 * - System boundaries: 15% (both = 15, one = 8)
 * - Data entities: 10% (3+ = 10, 2+ = 7, 1+ = 4)
 * - Problem statement: 10% (all fields = 10, summary only = 5)
 * - Goals/Metrics: 15% (3+ = 15, 2+ = 10, 1+ = 5)
 * - Non-functional requirements: 10% (3+ categories = 10, 2+ = 6, 1+ = 3)
 *
 * @param extraction - Extraction result from extractProjectData
 * @returns Completeness score 0-100
 */
export function calculateCompleteness(extraction: ExtractionResult): number {
  let score = 0;

  // Actors: 15 points
  const actorCount = extraction.actors.length;
  if (actorCount >= 2) {
    score += 15;
  } else if (actorCount === 1) {
    score += 8;
  }

  // Actor depth (goals/painPoints): 5 points
  if (actorCount > 0) {
    const actorsWithDepth = extraction.actors.filter(
      a => (a.goals && a.goals.length > 0) && (a.painPoints && a.painPoints.length > 0)
    );
    const depthRatio = actorsWithDepth.length / actorCount;
    if (depthRatio >= 0.5) {
      score += 5;
    } else if (depthRatio > 0) {
      score += 3;
    }
  }

  // Use cases: 20 points
  const useCaseCount = extraction.useCases.length;
  if (useCaseCount >= 5) {
    score += 20;
  } else if (useCaseCount >= 3) {
    score += 14;
  } else if (useCaseCount >= 1) {
    score += 6;
  }

  // System boundaries: 15 points
  const hasInternal = extraction.systemBoundaries.internal.length > 0;
  const hasExternal = extraction.systemBoundaries.external.length > 0;
  if (hasInternal && hasExternal) {
    score += 15;
  } else if (hasInternal || hasExternal) {
    score += 8;
  }

  // Data entities: 10 points
  const entityCount = extraction.dataEntities.length;
  if (entityCount >= 3) {
    score += 10;
  } else if (entityCount >= 2) {
    score += 7;
  } else if (entityCount >= 1) {
    score += 4;
  }

  // Problem statement: 10 points
  const ps = extraction.problemStatement;
  if (ps) {
    const hasFullStatement = ps.summary && ps.context && ps.impact && (ps.goals?.length ?? 0) >= 2;
    if (hasFullStatement) {
      score += 10;
    } else if (ps.summary) {
      score += 5;
    }
  }

  // Goals/Metrics: 15 points
  const goalsCount = extraction.goalsMetrics?.length ?? 0;
  if (goalsCount >= 3) {
    score += 15;
  } else if (goalsCount >= 2) {
    score += 10;
  } else if (goalsCount >= 1) {
    score += 5;
  }

  // Non-functional requirements: 10 points (by category diversity)
  const nfrCount = extraction.nonFunctionalRequirements?.length ?? 0;
  if (nfrCount > 0) {
    const categories = new Set(extraction.nonFunctionalRequirements!.map(n => n.category));
    if (categories.size >= 3) {
      score += 10;
    } else if (categories.size >= 2) {
      score += 6;
    } else {
      score += 3;
    }
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
