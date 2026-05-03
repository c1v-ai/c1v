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
import { extractionPromptLegacy, EXTRACTION_PROMPTS } from '../prompts';
import type { KnowledgeBankStep } from '@/lib/education/knowledge-bank';
import { intakePromptV2 } from '@/lib/config/feature-flags';

/**
 * Structured extraction LLM with Zod schema validation
 * Uses Claude Sonnet with temperature 0.2 for deterministic results
 */
const structuredExtractionLLM = createClaudeAgent(extractionSchema, 'extract_prd_data', {
  temperature: 0.2,
  maxTokens: 8000,
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
  projectVision: string,
  /**
   * Knowledge-bank step driving prompt selection when `INTAKE_PROMPT_V2` is on.
   * Defaults to 'context-diagram' for cold-start safety. Unmapped steps fall
   * back to the 'context-diagram' slice rather than crashing.
   */
  kbStep: KnowledgeBankStep = 'context-diagram',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _projectType?: string | null,
): Promise<ExtractionResult | null> {
  try {
    // Escape curly braces in inputs to prevent PromptTemplate from interpreting them as variables
    // This is needed because conversation history may contain JSON-like content with { and }
    const escapeBraces = (str: string) => str.replace(/\{/g, '{{').replace(/\}/g, '}}');

    // Select prompt: phase-staged when flag on (with fallback), legacy otherwise.
    const useV2 = intakePromptV2();
    const prompt = useV2
      ? (EXTRACTION_PROMPTS[kbStep] ?? EXTRACTION_PROMPTS['context-diagram']!)
      : extractionPromptLegacy;

    // Format prompt with conversation context.
    // Both legacy + v2 slices share the same 4 placeholder names
    // (projectName, projectVision, conversationHistory, educationBlock).
    const promptText = await prompt.format({
      projectName: escapeBraces(projectName),
      projectVision: escapeBraces(projectVision),
      conversationHistory: escapeBraces(conversationHistory),
      educationBlock: '',
    });

    // Invoke structured LLM for extraction
    const result = await structuredExtractionLLM.invoke(promptText);

    // Validate and log quality issues
    validateExtractionQuality(result, projectName);

    return result;
  } catch (error) {
    console.error('Extraction error:', error);

    // Return null on failure — callers should preserve existing state
    return null;
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
  if (result.goalsMetrics.length < 3) {
    issues.push(`goalsMetrics has ${result.goalsMetrics.length} items (need 3+)`);
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
  const hasFullStatement = ps.summary && ps.context && ps.impact && ps.goals.length >= 2;
  if (hasFullStatement) {
    score += 10;
  } else if (ps.summary) {
    score += 5;
  }

  // Goals/Metrics: 15 points
  const goalsCount = extraction.goalsMetrics.length;
  if (goalsCount >= 3) {
    score += 15;
  } else if (goalsCount >= 2) {
    score += 10;
  } else if (goalsCount >= 1) {
    score += 5;
  }

  // Non-functional requirements: 10 points (by category diversity)
  const nfrCount = extraction.nonFunctionalRequirements.length;
  if (nfrCount > 0) {
    const categories = new Set(extraction.nonFunctionalRequirements.map(n => n.category));
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

  // Merge problem statement (newer takes priority if it has meaningful content)
  const problemStatement = newData.problemStatement.summary
    ? newData.problemStatement
    : existing.problemStatement;

  // Merge goals/metrics (newer takes priority if non-empty)
  const goalsMetrics = newData.goalsMetrics.length > 0
    ? newData.goalsMetrics
    : existing.goalsMetrics;

  // Merge non-functional requirements (newer takes priority if non-empty)
  const nonFunctionalRequirements = newData.nonFunctionalRequirements.length > 0
    ? newData.nonFunctionalRequirements
    : existing.nonFunctionalRequirements;

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
