/**
 * Quality Function Deployment (QFD) Agent
 *
 * Purpose: Build House of Quality matrix from customer needs and engineering characteristics
 * Pattern: Structured output with Zod schema validation
 * Team: AI/Agent Engineering (Agent 3.1: LangChain Integration Engineer)
 *
 * Uses Claude Sonnet via central config for deterministic extraction.
 * Analyzes conversation history and project context to produce:
 * - Customer needs with relative importance weights
 * - Engineering characteristics with units, direction, and design targets
 * - Relationship matrix (strong=9, moderate=3, weak=1)
 * - Correlation roof (characteristic-to-characteristic correlations)
 * - Competitive analysis with perception scores
 * - Technical difficulty and estimated cost per characteristic
 */

import { createClaudeAgent } from '../config';
import { qfdSchema, type Qfd } from '../schemas';
import { PromptTemplate } from '@langchain/core/prompts';
import {
  escapeBraces as sharedEscapeBraces,
  buildProjectContextPreamble,
  summarizeUpstream,
  QFD_RULES,
} from '../prompts';
import { renderAtlasPriors } from '../atlas-loader';
import { intakePromptV2 } from '@/lib/config/feature-flags';
import type { IntakeState } from '../graphs/types';

/**
 * Structured QFD extraction LLM with Zod schema validation
 * Uses Claude Sonnet with temperature 0.2 for deterministic results
 */
const structuredQfdLLM = createClaudeAgent(qfdSchema, 'extract_qfd', {
  temperature: 0.2,
  maxTokens: 20000,
});

/** Flag-on V2 LLM with tighter cap (6K). */
const structuredQfdLLMV2 = createClaudeAgent(qfdSchema, 'extract_qfd_v2', {
  temperature: 0.2,
  maxTokens: 6000,
});

/**
 * Prompt template for QFD extraction
 *
 * All curly braces in the template body are escaped as {{ } to prevent
 * PromptTemplate from interpreting them as variables.
 */
const qfdPrompt = new PromptTemplate({
  template: `You are a systems engineering expert specializing in Quality Function Deployment (QFD) and the House of Quality methodology.
Your task is to build a complete QFD House of Quality matrix following systems engineering best practices.

## Project Context
- **Project Name:** {projectName}

## Customer Needs / Voice of the Customer
{customerNeeds}

## Performance Criteria / Engineering Context
{performanceCriteria}

## Conversation History
{conversationHistory}

## Instructions

### 1. Customer Needs (Left Wall)
Identify and map customer needs with relative importance weights.

Rules:
- Assign each need an ID: "CN-01", "CN-02", etc.
- Provide a clear, concise need statement (the "Voice of the Customer").
- Assign relative importance weights that SUM TO 1.0 across all needs.
- You MUST produce at least 5 customer needs.
- Prioritize needs based on conversation context and domain knowledge.
- Include both explicit needs (stated by stakeholders) and implicit needs (industry expectations).

### 2. Engineering Characteristics (Ceiling / Top)
Identify measurable engineering characteristics that address the customer needs.

Rules:
- Assign each characteristic an ID: "EC-01", "EC-02", etc.
- Provide the measurement unit (e.g., "ms", "%", "count", "sec", "MB").
- Specify direction of improvement: "higher" (more is better), "lower" (less is better), or "target" (specific value).
- Set a concrete design target (e.g., "\\u2264 500ms", "\\u2265 99.9%", "\\u2264 3").
- Assign technical difficulty (1-5, where 5 is hardest to achieve).
- Assign estimated cost (1-5, where 5 is most expensive to implement).
- You MUST produce at least 8 engineering characteristics.
- Characteristics must be measurable, not vague (e.g., "Response Time (p95)" not "Fast").

### 3. Relationship Matrix (Center)
Build the relationship matrix mapping customer needs to engineering characteristics.

Rules:
- Use strength levels: strong (9), moderate (3), weak (1).
- Only include relationships that genuinely exist — do not force connections.
- Every customer need should relate to at least one engineering characteristic.
- Every engineering characteristic should relate to at least one customer need.
- Aim for a well-connected but not overly dense matrix.

### 4. Correlation Roof (Triangle)
Identify correlations between engineering characteristics.

Rules:
- Use correlation types: "strong-positive", "positive", "negative", "strong-negative".
- Strong-positive: improving one strongly improves the other.
- Positive: improving one somewhat improves the other.
- Negative: improving one somewhat degrades the other (trade-off).
- Strong-negative: improving one strongly degrades the other (major trade-off).
- Only include meaningful correlations — not every pair needs one.
- Identify at least the critical trade-offs that drive design decisions.

### 5. Competitive Analysis (Right Wall / Back Porch)
Identify at least 2 competitors and score them against each customer need.

Rules:
- Use perception scores from 1 (poor) to 5 (excellent) for each customer need.
- Scores should reflect realistic competitive positioning.
- Include direct competitors or alternative approaches the customer might choose.
- Score keys must match customer need IDs (e.g., "CN-01": 4).

### Quality Requirements
- At least 5 customer needs, each with a clear, actionable statement.
- At least 8 engineering characteristics, each measurable with units.
- Importance weights must sum to approximately 1.0 (within 0.01 tolerance).
- Relationship matrix must connect every need to at least one characteristic.
- At least 2 competitors with complete perception scores.
- Technical difficulty and estimated cost filled for every characteristic.`,
  inputVariables: ['projectName', 'customerNeeds', 'performanceCriteria', 'conversationHistory'],
  templateFormat: 'f-string',
});

/**
 * Extract a QFD House of Quality matrix from conversation history
 *
 * @param conversationHistory - Full conversation text (format: "role: content\n...")
 * @param projectName - Project name for context
 * @param customerNeeds - Formatted customer needs text
 * @param performanceCriteria - Formatted performance criteria text
 * @returns Validated QFD result matching Qfd schema, or null on failure
 */
export async function extractQFD(
  conversationHistory: string,
  projectName: string,
  customerNeeds: string,
  performanceCriteria: string,
  /**
   * Optional V2 context. Only consulted when `INTAKE_PROMPT_V2=true`.
   */
  opts?: {
    extractedData?: Partial<IntakeState['extractedData']>;
    projectType?: string | null;
    projectVision?: string;
  },
): Promise<Qfd | null> {
  try {
    if (intakePromptV2()) {
      return await extractQFDV2(
        conversationHistory,
        projectName,
        opts ?? {},
      );
    }

    // Escape curly braces in inputs to prevent PromptTemplate from interpreting them as variables
    // This is needed because conversation history may contain JSON-like content with { and }
    // NOTE: legacy bug at this line — `}` replace is a no-op (single→single) instead of double.
    // Preserved verbatim because the flag-off path must remain byte-identical. The flag-on
    // path uses the shared (correct) escapeBraces from prompts.ts.
    const escapeBraces = (str: string) => str.replace(/\{/g, '{{').replace(/\}/g, '}');

    // Format prompt with project context
    const promptText = await qfdPrompt.format({
      projectName: escapeBraces(projectName),
      customerNeeds: escapeBraces(customerNeeds),
      performanceCriteria: escapeBraces(performanceCriteria),
      conversationHistory: escapeBraces(conversationHistory),
    });

    // Invoke structured LLM for extraction
    const result = await structuredQfdLLM.invoke(promptText);

    // Validate and log quality issues
    validateQFDQuality(result);

    return result;
  } catch (error) {
    console.error('QFD extraction error:', error);

    // Return null on failure — callers should preserve existing state
    return null;
  }
}

/**
 * Build the V2 QFD prompt body from shared utilities.
 */
export function buildQFDPromptV2(
  conversationHistory: string,
  projectName: string,
  opts: {
    extractedData?: Partial<IntakeState['extractedData']>;
    projectType?: string | null;
    projectVision?: string;
  },
): string {
  const preamble = buildProjectContextPreamble({
    projectName,
    projectVision: opts.projectVision ?? '',
    projectType: opts.projectType ?? null,
  });
  const upstream = summarizeUpstream(
    { extractedData: opts.extractedData },
    ['NFRs', 'ffbd'],
  );
  const priors = renderAtlasPriors(opts.projectType ?? 'unknown', [
    'latency',
    'availability',
    'throughput',
  ]);
  const conversationBlock =
    `## Conversation\n${sharedEscapeBraces(conversationHistory)}`;
  return [preamble, upstream, priors.text, conversationBlock, QFD_RULES].join(
    '\n\n',
  );
}

async function extractQFDV2(
  conversationHistory: string,
  projectName: string,
  opts: {
    extractedData?: Partial<IntakeState['extractedData']>;
    projectType?: string | null;
    projectVision?: string;
  },
): Promise<Qfd | null> {
  try {
    const promptText = buildQFDPromptV2(conversationHistory, projectName, opts);
    const result = await structuredQfdLLMV2.invoke(promptText);
    validateQFDQuality(result);
    return result;
  } catch (error) {
    console.error('QFD extraction error (v2):', error);
    return null;
  }
}

/**
 * Validate QFD quality and log issues for monitoring
 * Does not fail extraction - just logs for observability
 *
 * @param result - QFD result to validate
 */
export function validateQFDQuality(result: Qfd): void {
  const issues: string[] = [];

  // Check minimum customer needs
  if (result.customerNeeds.length < 5) {
    issues.push(`Only ${result.customerNeeds.length} customer needs (need 5+)`);
  }

  // Check minimum engineering characteristics
  if (result.engineeringCharacteristics.length < 8) {
    issues.push(`Only ${result.engineeringCharacteristics.length} engineering characteristics (need 8+)`);
  }

  // Check importance weights sum to ~1.0
  const weightSum = result.customerNeeds.reduce((sum, n) => sum + n.relativeImportance, 0);
  if (Math.abs(weightSum - 1.0) > 0.05) {
    issues.push(`Customer need importance weights sum to ${weightSum.toFixed(3)} (should be ~1.0)`);
  }

  // Check that every need has at least one relationship
  const needIdsWithRelationship = new Set(result.relationships.map(r => r.needId));
  const orphanNeeds = result.customerNeeds.filter(n => !needIdsWithRelationship.has(n.id));
  if (orphanNeeds.length > 0) {
    issues.push(`${orphanNeeds.length} customer needs have no relationships: ${orphanNeeds.map(n => n.id).join(', ')}`);
  }

  // Check that every characteristic has at least one relationship
  const charIdsWithRelationship = new Set(result.relationships.map(r => r.charId));
  const orphanChars = result.engineeringCharacteristics.filter(c => !charIdsWithRelationship.has(c.id));
  if (orphanChars.length > 0) {
    issues.push(`${orphanChars.length} engineering characteristics have no relationships: ${orphanChars.map(c => c.id).join(', ')}`);
  }

  // Check minimum competitors
  if (result.competitors.length < 2) {
    issues.push(`Only ${result.competitors.length} competitors (need 2+)`);
  }

  // Check that competitors have scores for all customer needs
  const needIds = new Set(result.customerNeeds.map(n => n.id));
  for (const competitor of result.competitors) {
    const scoredNeedIds = new Set(Object.keys(competitor.scores));
    const missingNeeds = result.customerNeeds.filter(n => !scoredNeedIds.has(n.id));
    if (missingNeeds.length > 0) {
      issues.push(`Competitor "${competitor.name}" missing scores for: ${missingNeeds.map(n => n.id).join(', ')}`);
    }
  }

  // Check technical difficulty and estimated cost filled
  const charsWithoutDifficulty = result.engineeringCharacteristics.filter(c => c.technicalDifficulty == null);
  if (charsWithoutDifficulty.length > 0) {
    issues.push(`${charsWithoutDifficulty.length} characteristics missing technicalDifficulty`);
  }
  const charsWithoutCost = result.engineeringCharacteristics.filter(c => c.estimatedCost == null);
  if (charsWithoutCost.length > 0) {
    issues.push(`${charsWithoutCost.length} characteristics missing estimatedCost`);
  }

  // Check that relationships reference valid IDs
  for (const rel of result.relationships) {
    if (!needIds.has(rel.needId)) {
      issues.push(`Relationship references unknown customer need: ${rel.needId}`);
    }
    const charIds = new Set(result.engineeringCharacteristics.map(c => c.id));
    if (!charIds.has(rel.charId)) {
      issues.push(`Relationship references unknown engineering characteristic: ${rel.charId}`);
    }
  }

  // Check that roof entries reference valid characteristic IDs
  const allCharIds = new Set(result.engineeringCharacteristics.map(c => c.id));
  for (const entry of result.roof) {
    if (!allCharIds.has(entry.charId1)) {
      issues.push(`Roof entry references unknown characteristic: ${entry.charId1}`);
    }
    if (!allCharIds.has(entry.charId2)) {
      issues.push(`Roof entry references unknown characteristic: ${entry.charId2}`);
    }
  }

  // Log issues if any
  if (issues.length > 0) {
    console.warn(`[QFD Quality] ${issues.length} issues:`, issues);
  } else {
    console.log('[QFD Quality] Passed all quality checks');
  }
}

/**
 * Calculate QFD completeness score (0-100) based on extracted data
 *
 * Scoring criteria (total 100 points):
 * - Customer needs: 15% (5+ = 15, 3+ = 10, 1+ = 5)
 * - Engineering characteristics: 15% (8+ = 15, 5+ = 10, 1+ = 5)
 * - Importance weights valid: 10% (sum ~1.0 = 10)
 * - Relationship matrix: 20% (all needs/chars connected = 20, most = 12, some = 5)
 * - Correlation roof: 10% (entries exist = 10, none = 0)
 * - Competitive analysis: 15% (2+ competitors with full scores = 15, partial = 8, none = 0)
 * - Technical metadata: 15% (difficulty + cost on all = 15, most = 10, some = 5)
 *
 * @param result - QFD result from extractQFD
 * @returns Completeness score 0-100
 */
export function calculateQFDCompleteness(result: Qfd): number {
  let score = 0;

  // Customer needs: 15 points
  const needCount = result.customerNeeds.length;
  if (needCount >= 5) {
    score += 15;
  } else if (needCount >= 3) {
    score += 10;
  } else if (needCount >= 1) {
    score += 5;
  }

  // Engineering characteristics: 15 points
  const charCount = result.engineeringCharacteristics.length;
  if (charCount >= 8) {
    score += 15;
  } else if (charCount >= 5) {
    score += 10;
  } else if (charCount >= 1) {
    score += 5;
  }

  // Importance weights valid: 10 points
  if (needCount > 0) {
    const weightSum = result.customerNeeds.reduce((sum, n) => sum + n.relativeImportance, 0);
    if (Math.abs(weightSum - 1.0) <= 0.05) {
      score += 10;
    } else if (Math.abs(weightSum - 1.0) <= 0.15) {
      score += 5;
    }
  }

  // Relationship matrix: 20 points
  if (result.relationships.length > 0) {
    const needIdsWithRel = new Set(result.relationships.map(r => r.needId));
    const charIdsWithRel = new Set(result.relationships.map(r => r.charId));
    const needCoverage = needCount > 0 ? needIdsWithRel.size / needCount : 0;
    const charCoverage = charCount > 0 ? charIdsWithRel.size / charCount : 0;
    const avgCoverage = (needCoverage + charCoverage) / 2;
    if (avgCoverage >= 1.0) {
      score += 20;
    } else if (avgCoverage >= 0.7) {
      score += 12;
    } else if (avgCoverage > 0) {
      score += 5;
    }
  }

  // Correlation roof: 10 points
  if (result.roof.length >= 3) {
    score += 10;
  } else if (result.roof.length >= 1) {
    score += 5;
  }

  // Competitive analysis: 15 points
  if (result.competitors.length >= 2) {
    const needIds = result.customerNeeds.map(n => n.id);
    const allComplete = result.competitors.every(comp => {
      const scoredIds = new Set(Object.keys(comp.scores));
      return needIds.every(id => scoredIds.has(id));
    });
    if (allComplete) {
      score += 15;
    } else {
      score += 8;
    }
  } else if (result.competitors.length === 1) {
    score += 5;
  }

  // Technical metadata: 15 points
  if (charCount > 0) {
    const withDifficulty = result.engineeringCharacteristics.filter(c => c.technicalDifficulty != null).length;
    const withCost = result.engineeringCharacteristics.filter(c => c.estimatedCost != null).length;
    const metadataRatio = (withDifficulty + withCost) / (charCount * 2);
    if (metadataRatio >= 1.0) {
      score += 15;
    } else if (metadataRatio >= 0.5) {
      score += 10;
    } else if (metadataRatio > 0) {
      score += 5;
    }
  }

  return Math.min(score, 100);
}

/**
 * Merge new QFD data with existing data (incremental update)
 *
 * Strategy:
 * - Customer needs: Merge by id (deduplicate, prefer newer)
 * - Engineering characteristics: Merge by id (deduplicate, prefer newer)
 * - Relationships: Merge by needId+charId key (deduplicate, prefer newer)
 * - Roof: Merge by charId1+charId2 key (deduplicate, prefer newer)
 * - Competitors: Merge by name (deduplicate, prefer newer)
 *
 * @param existing - Previously extracted QFD data
 * @param newData - Newly extracted QFD data
 * @returns Merged QFD result
 */
export function mergeQFDData(existing: Qfd, newData: Qfd): Qfd {
  // Merge customer needs (deduplicate by id)
  const needMap = new Map(existing.customerNeeds.map(n => [n.id, n]));
  newData.customerNeeds.forEach(need => {
    needMap.set(need.id, need); // Newer data overwrites
  });

  // Merge engineering characteristics (deduplicate by id)
  const charMap = new Map(existing.engineeringCharacteristics.map(c => [c.id, c]));
  newData.engineeringCharacteristics.forEach(char => {
    charMap.set(char.id, char);
  });

  // Merge relationships (deduplicate by needId+charId composite key)
  const relKey = (r: { needId: string; charId: string }) => `${r.needId}:${r.charId}`;
  const relMap = new Map(existing.relationships.map(r => [relKey(r), r]));
  newData.relationships.forEach(rel => {
    relMap.set(relKey(rel), rel);
  });

  // Merge roof entries (deduplicate by sorted charId pair)
  const roofKey = (r: { charId1: string; charId2: string }) => {
    const sorted = [r.charId1, r.charId2].sort();
    return `${sorted[0]}:${sorted[1]}`;
  };
  const roofMap = new Map(existing.roof.map(r => [roofKey(r), r]));
  newData.roof.forEach(entry => {
    roofMap.set(roofKey(entry), entry);
  });

  // Merge competitors (deduplicate by name)
  const compMap = new Map(existing.competitors.map(c => [c.name, c]));
  newData.competitors.forEach(comp => {
    compMap.set(comp.name, comp);
  });

  return {
    customerNeeds: Array.from(needMap.values()),
    engineeringCharacteristics: Array.from(charMap.values()),
    relationships: Array.from(relMap.values()),
    roof: Array.from(roofMap.values()),
    competitors: Array.from(compMap.values()),
  };
}
