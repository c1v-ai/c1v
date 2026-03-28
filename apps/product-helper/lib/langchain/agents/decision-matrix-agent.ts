/**
 * Decision Matrix (Performance Assessment) Agent
 *
 * Purpose: Generate a weighted decision matrix for evaluating design alternatives
 * Pattern: Structured output with Zod schema validation
 * Team: AI/Agent Engineering (Agent 3.1: LangChain Integration Engineer)
 *
 * Uses Claude Sonnet via central config for deterministic extraction.
 * Analyzes requirements and FFBD to produce:
 * - Performance criteria with weights and measurement units
 * - Design alternatives with normalized scores
 * - Weighted recommendation with rationale
 */

import { createClaudeAgent } from '../config';
import { decisionMatrixSchema, type DecisionMatrix } from '../schemas';
import { PromptTemplate } from '@langchain/core/prompts';

/**
 * Structured decision matrix extraction LLM with Zod schema validation
 * Uses Claude Sonnet with temperature 0.2 for deterministic results
 */
const structuredDecisionMatrixLLM = createClaudeAgent(decisionMatrixSchema, 'extract_decision_matrix', {
  temperature: 0.2,
  maxTokens: 20000,
});

/**
 * Prompt template for decision matrix extraction
 *
 * Uses PromptTemplate.fromTemplate with {{varName}} syntax.
 * Literal curly braces in inputs are escaped by the caller before formatting.
 */
const decisionMatrixPrompt = PromptTemplate.fromTemplate(`You are a systems engineering expert specializing in trade study analysis and decision matrices.
Your task is to create a comprehensive Decision Matrix (Performance Assessment) following systems engineering best practices.

## Project Context
- **Project Name:** {projectName}

## Requirements
{requirements}

## FFBD Summary
{ffbdSummary}

## Conversation History
{conversationHistory}

## Instructions

### 1. Performance Criteria
Extract measurable performance criteria from the requirements and FFBD. For each criterion:

Rules:
- Assign a unique ID: PC-01, PC-02, etc.
- Use clear, specific names (e.g., "API Response Latency" not "Speed").
- Define the **measurement unit** (e.g., "ms", "%", "requests/sec", "dollars/month").
- Assign a **weight** representing relative importance. All weights MUST sum to 1.0.
- Set minAcceptable — the threshold below which the system fails.
- Set targetValue — the ideal performance target.
- Describe measurementMethod — how this criterion will be objectively measured.
- You MUST define at least 5 performance criteria.
- Criteria should span different quality attributes: performance, reliability, scalability, cost, usability, security, maintainability.

### 2. Design Alternatives
Identify distinct architectural or design approaches that could satisfy the requirements:

Rules:
- Assign a unique ID: ALT-01, ALT-02, etc.
- Use descriptive names (e.g., "Cloud-native Microservices", "Monolithic with Edge Caching").
- You MUST define at least 2 alternatives (ideally 3-4).
- Alternatives should be meaningfully different, not minor variations.

### 3. Scoring
For each alternative, score it against every criterion:

Rules:
- Scores are **normalized** from 0.0 to 1.0 where:
  - 1.0 = best possible / exceeds target
  - 0.5 = meets minimum acceptable threshold
  - 0.0 = completely fails the criterion
- The scores object maps criterion IDs to scores: e.g., "PC-01": 0.8, "PC-02": 0.6.
- Every alternative MUST have a score for every criterion.
- Calculate weightedTotal as the sum of (score * weight) across all criteria.
- Scores must be objective and defensible, not arbitrary.

### 4. Recommendation
Provide a recommendation:
- State which alternative scores highest overall.
- Explain the rationale, including where the winner excels and any trade-offs.
- Note any criteria where the recommended alternative is weak and suggest mitigations.
- If alternatives are very close in score, acknowledge the uncertainty.

### Quality Requirements
- Weights must sum to exactly 1.0 (within floating point tolerance).
- Every alternative must score every criterion (no missing scores).
- Weighted totals must be mathematically correct.
- Criteria should be traceable to the requirements or FFBD functions.
- Scores should reflect realistic engineering trade-offs, not biased toward one solution.`);

/**
 * Extract a Decision Matrix from conversation history and project context
 *
 * @param conversationHistory - Full conversation text (format: "role: content\n...")
 * @param projectName - Project name for context
 * @param requirements - Formatted requirements text (functional + non-functional)
 * @param ffbdSummary - Summary of FFBD top-level functions and core value functions
 * @returns Validated DecisionMatrix result, or null on failure
 */
export async function extractDecisionMatrix(
  conversationHistory: string,
  projectName: string,
  requirements: string,
  ffbdSummary: string
): Promise<DecisionMatrix | null> {
  try {
    // Escape curly braces in inputs to prevent PromptTemplate from interpreting them as variables
    // This is needed because conversation history may contain JSON-like content with { and }
    const escapeBraces = (str: string) => str.replace(/\{/g, '{{').replace(/\}/g, '}}');

    // Format prompt with project context
    const promptText = await decisionMatrixPrompt.format({
      projectName: escapeBraces(projectName),
      requirements: escapeBraces(requirements),
      ffbdSummary: escapeBraces(ffbdSummary),
      conversationHistory: escapeBraces(conversationHistory),
    });

    // Invoke structured LLM for extraction
    const result = await structuredDecisionMatrixLLM.invoke(promptText);

    // Validate and log quality issues
    validateDecisionMatrixQuality(result);

    return result;
  } catch (error) {
    console.error('Decision matrix extraction error:', error);

    // Return null on failure — callers should preserve existing state
    return null;
  }
}

/**
 * Validate decision matrix quality and log issues for monitoring
 * Does not fail extraction - just logs for observability
 *
 * @param result - Decision matrix result to validate
 */
export function validateDecisionMatrixQuality(result: DecisionMatrix): void {
  const issues: string[] = [];

  // Check minimum criteria
  if (result.criteria.length < 5) {
    issues.push(`Only ${result.criteria.length} criteria (need 5+)`);
  }

  // Check minimum alternatives
  if (result.alternatives.length < 2) {
    issues.push(`Only ${result.alternatives.length} alternatives (need 2+)`);
  }

  // Check weights sum to 1.0
  const weightSum = result.criteria.reduce((sum, c) => sum + c.weight, 0);
  if (Math.abs(weightSum - 1.0) > 0.01) {
    issues.push(`Criterion weights sum to ${weightSum.toFixed(3)} (should be 1.0)`);
  }

  // Check all weights are in valid range
  for (const criterion of result.criteria) {
    if (criterion.weight < 0 || criterion.weight > 1) {
      issues.push(`Criterion ${criterion.id} has invalid weight: ${criterion.weight}`);
    }
  }

  // Check score completeness — every alternative must score every criterion
  const criterionIds = result.criteria.map(c => c.id);
  for (const alt of result.alternatives) {
    const missingScores = criterionIds.filter(id => !(id in alt.scores));
    if (missingScores.length > 0) {
      issues.push(`Alternative ${alt.id} missing scores for: ${missingScores.join(', ')}`);
    }

    // Check score range
    for (const [criterionId, score] of Object.entries(alt.scores)) {
      if (score < 0 || score > 1) {
        issues.push(`Alternative ${alt.id} has out-of-range score for ${criterionId}: ${score}`);
      }
    }

    // Verify weighted total if present
    if (alt.weightedTotal !== undefined) {
      const expectedTotal = result.criteria.reduce((sum, c) => {
        const score = alt.scores[c.id] ?? 0;
        return sum + score * c.weight;
      }, 0);
      if (Math.abs(alt.weightedTotal - expectedTotal) > 0.01) {
        issues.push(
          `Alternative ${alt.id} weightedTotal ${alt.weightedTotal.toFixed(3)} != calculated ${expectedTotal.toFixed(3)}`
        );
      }
    }
  }

  // Check recommendation exists
  if (!result.recommendation || result.recommendation.length < 20) {
    issues.push('Recommendation missing or too short');
  }

  // Check unique criterion IDs
  const criterionIdSet = new Set(criterionIds);
  if (criterionIdSet.size !== criterionIds.length) {
    issues.push('Duplicate criterion IDs found');
  }

  // Check unique alternative IDs
  const altIds = result.alternatives.map(a => a.id);
  const altIdSet = new Set(altIds);
  if (altIdSet.size !== altIds.length) {
    issues.push('Duplicate alternative IDs found');
  }

  // Log issues if any
  if (issues.length > 0) {
    console.warn(`[Decision Matrix Quality] ${issues.length} issues:`, issues);
  } else {
    console.log('[Decision Matrix Quality] Passed all quality checks');
  }
}

/**
 * Calculate decision matrix completeness score (0-100) based on extracted data
 *
 * Scoring criteria (total 100 points):
 * - Criteria count: 20% (5+ = 20, 3+ = 12, 1+ = 5)
 * - Criteria detail: 15% (all have unit+weight+measurement = 15, most = 10, some = 5)
 * - Alternatives count: 15% (3+ = 15, 2 = 10, 1 = 5)
 * - Score completeness: 20% (all alts score all criteria = 20, most = 12, some = 5)
 * - Weight validity: 15% (sum to 1.0 = 15, close = 8, not close = 0)
 * - Recommendation: 15% (detailed = 15, brief = 8, missing = 0)
 *
 * @param result - Decision matrix from extractDecisionMatrix
 * @returns Completeness score 0-100
 */
export function calculateDecisionMatrixCompleteness(result: DecisionMatrix): number {
  let score = 0;

  // Criteria count: 20 points
  const criteriaCount = result.criteria.length;
  if (criteriaCount >= 5) {
    score += 20;
  } else if (criteriaCount >= 3) {
    score += 12;
  } else if (criteriaCount >= 1) {
    score += 5;
  }

  // Criteria detail: 15 points
  if (criteriaCount > 0) {
    const detailedCriteria = result.criteria.filter(
      c => c.unit && c.weight > 0 && c.measurementMethod
    );
    const detailRatio = detailedCriteria.length / criteriaCount;
    if (detailRatio >= 1.0) {
      score += 15;
    } else if (detailRatio >= 0.5) {
      score += 10;
    } else if (detailRatio > 0) {
      score += 5;
    }
  }

  // Alternatives count: 15 points
  const altCount = result.alternatives.length;
  if (altCount >= 3) {
    score += 15;
  } else if (altCount >= 2) {
    score += 10;
  } else if (altCount >= 1) {
    score += 5;
  }

  // Score completeness: 20 points
  if (altCount > 0 && criteriaCount > 0) {
    const criterionIds = result.criteria.map(c => c.id);
    let totalExpected = altCount * criteriaCount;
    let totalPresent = 0;
    for (const alt of result.alternatives) {
      for (const cId of criterionIds) {
        if (cId in alt.scores && alt.scores[cId] >= 0 && alt.scores[cId] <= 1) {
          totalPresent++;
        }
      }
    }
    const completionRatio = totalPresent / totalExpected;
    if (completionRatio >= 1.0) {
      score += 20;
    } else if (completionRatio >= 0.75) {
      score += 12;
    } else if (completionRatio > 0) {
      score += 5;
    }
  }

  // Weight validity: 15 points
  if (criteriaCount > 0) {
    const weightSum = result.criteria.reduce((sum, c) => sum + c.weight, 0);
    if (Math.abs(weightSum - 1.0) <= 0.01) {
      score += 15;
    } else if (Math.abs(weightSum - 1.0) <= 0.1) {
      score += 8;
    }
  }

  // Recommendation: 15 points
  if (result.recommendation) {
    if (result.recommendation.length >= 100) {
      score += 15;
    } else if (result.recommendation.length >= 20) {
      score += 8;
    }
  }

  return Math.min(score, 100);
}

/**
 * Merge new decision matrix data with existing data (incremental update)
 *
 * Strategy:
 * - Criteria: Merge by id (deduplicate, prefer newer)
 * - Alternatives: Merge by id (deduplicate, prefer newer)
 * - Recommendation: Newer takes priority if non-empty
 *
 * @param existing - Previously extracted decision matrix
 * @param newData - Newly extracted decision matrix
 * @returns Merged decision matrix
 */
export function mergeDecisionMatrixData(
  existing: DecisionMatrix,
  newData: DecisionMatrix
): DecisionMatrix {
  // Merge criteria (deduplicate by id)
  const criteriaMap = new Map(existing.criteria.map(c => [c.id, c]));
  newData.criteria.forEach(criterion => {
    criteriaMap.set(criterion.id, criterion); // Newer data overwrites
  });

  // Merge alternatives (deduplicate by id)
  const altMap = new Map(existing.alternatives.map(a => [a.id, a]));
  newData.alternatives.forEach(alt => {
    altMap.set(alt.id, alt);
  });

  // Recommendation: newer takes priority if non-empty
  const recommendation = newData.recommendation || existing.recommendation;

  return {
    criteria: Array.from(criteriaMap.values()),
    alternatives: Array.from(altMap.values()),
    recommendation,
  };
}
