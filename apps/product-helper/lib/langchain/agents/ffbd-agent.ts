/**
 * Functional Flow Block Diagram (FFBD) Agent
 *
 * Purpose: Decompose use cases into functional flow block diagrams
 * Pattern: Structured output with Zod schema validation
 * Team: AI/Agent Engineering (Agent 3.1: LangChain Integration Engineer)
 *
 * Uses Claude Sonnet via central config for deterministic extraction.
 * Analyzes conversation history and project context to produce:
 * - Top-level functional blocks (F.1-F.N)
 * - Decomposed sub-function blocks (F.1.1-F.N.M)
 * - Flow connections with logic gates (AND, OR, IT)
 */

import { createClaudeAgent } from '../config';
import { ffbdSchema, type Ffbd } from '../schemas';
import { PromptTemplate } from '@langchain/core/prompts';

/**
 * Structured FFBD extraction LLM with Zod schema validation
 * Uses Claude Sonnet with temperature 0.2 for deterministic results
 */
const structuredFfbdLLM = createClaudeAgent(ffbdSchema, 'extract_ffbd', {
  temperature: 0.2,
  maxTokens: 20000,
});

/**
 * Prompt template for FFBD extraction
 *
 * Uses PromptTemplate.fromTemplate with {{varName}} syntax.
 * Literal curly braces in inputs are escaped by the caller before formatting.
 */
const ffbdPrompt = PromptTemplate.fromTemplate(`You are a systems engineering expert specializing in Functional Flow Block Diagrams (FFBDs).
Your task is to decompose the project's use cases into a complete FFBD following systems engineering best practices.

## Project Context
- **Project Name:** {projectName}
- **Project Vision:** {projectVision}

## Use Cases
{useCases}

## System Boundaries
{systemBoundaries}

## Conversation History
{conversationHistory}

## Instructions

### 1. Top-Level FFBD
Create the top-level functional flow by decomposing the system into numbered functional blocks (F.1 through F.N).

Rules:
- Use **verb phrases** for block names (functional, not structural). Example: "Onboard Organization" not "Organization Module".
- Number sequentially: F.1, F.2, F.3, etc.
- You MUST produce at least 5 top-level blocks.
- Mark the core value function(s) with isCoreValue: true. Every system has at least one core value function — the primary reason the system exists.
- Include a brief description for each block explaining what the function does.

### 2. Decomposed Sub-Functions
For EACH top-level block, decompose it into sub-functions (F.1.1, F.1.2, etc.).

Rules:
- Each top-level block MUST have at least 3 sub-functions.
- Set parentId to the parent block ID (e.g., parentId="F.1" for F.1.1).
- Continue using verb phrases for names.
- Add descriptions explaining the sub-function's purpose.

### 3. Logic Gates
Identify and annotate logic gates on connections:
- **AND gate**: Parallel paths that ALL must execute (e.g., "Process payment AND send confirmation email").
- **OR gate**: Alternative paths where ONE is chosen based on a condition (e.g., "Indoor monitoring OR Outdoor monitoring").
- **IT gate**: Iteration/loop paths that repeat until a condition is met (e.g., "Retry until data fresh < 15 min").

For each gate, provide a gateCondition explaining the branching logic.

### 4. Connections
Define the flow connections between blocks:
- Sequential connections: from one block to the next in order.
- Parallel (AND): from a block to multiple blocks that execute simultaneously.
- Alternative (OR): from a block to alternative paths with conditions.
- Iteration (IT): loop-back connections with termination conditions.

### Quality Requirements
- Every top-level block must have sub-functions (no orphan top-level blocks without decomposition).
- The flow must cover the complete system lifecycle from initialization to completion.
- Core value functions should have the richest decomposition.
- Gate conditions must be specific and testable, not vague.
- The FFBD should trace back to the use cases provided.`);

/**
 * Extract a Functional Flow Block Diagram from conversation history
 *
 * @param conversationHistory - Full conversation text (format: "role: content\n...")
 * @param projectName - Project name for context
 * @param projectVision - Project vision statement
 * @param useCases - Formatted use cases text
 * @param systemBoundaries - Formatted system boundaries text
 * @returns Validated FFBD result matching Ffbd schema, or null on failure
 */
export async function extractFFBD(
  conversationHistory: string,
  projectName: string,
  projectVision: string,
  useCases: string,
  systemBoundaries: string
): Promise<Ffbd | null> {
  try {
    // Escape curly braces in inputs to prevent PromptTemplate from interpreting them as variables
    // This is needed because conversation history may contain JSON-like content with { and }
    const escapeBraces = (str: string) => str.replace(/\{/g, '{{').replace(/\}/g, '}}');

    // Format prompt with project context
    const promptText = await ffbdPrompt.format({
      projectName: escapeBraces(projectName),
      projectVision: escapeBraces(projectVision),
      useCases: escapeBraces(useCases),
      systemBoundaries: escapeBraces(systemBoundaries),
      conversationHistory: escapeBraces(conversationHistory),
    });

    // Invoke structured LLM for extraction
    const result = await structuredFfbdLLM.invoke(promptText);

    // Validate and log quality issues
    validateFFBDQuality(result);

    return result;
  } catch (error) {
    console.error('FFBD extraction error:', error);

    // Return null on failure — callers should preserve existing state
    return null;
  }
}

/**
 * Validate FFBD quality and log issues for monitoring
 * Does not fail extraction - just logs for observability
 *
 * @param result - FFBD result to validate
 */
export function validateFFBDQuality(result: Ffbd): void {
  const issues: string[] = [];

  // Check minimum top-level blocks
  if (result.topLevelBlocks.length < 5) {
    issues.push(`Only ${result.topLevelBlocks.length} top-level blocks (need 5+)`);
  }

  // Check that at least one core value function exists
  const coreValueBlocks = result.topLevelBlocks.filter(b => b.isCoreValue);
  if (coreValueBlocks.length === 0) {
    issues.push('No core value function marked (need at least 1)');
  }

  // Check decomposition coverage
  const decomposedParentIds = new Set(result.decomposedBlocks.map(b => b.parentId).filter(Boolean));
  const undecomposed = result.topLevelBlocks.filter(b => !decomposedParentIds.has(b.id));
  if (undecomposed.length > 0) {
    issues.push(`${undecomposed.length} top-level blocks have no sub-functions: ${undecomposed.map(b => b.id).join(', ')}`);
  }

  // Check minimum sub-functions per decomposed parent
  Array.from(decomposedParentIds).forEach(parentId => {
    const children = result.decomposedBlocks.filter(b => b.parentId === parentId);
    if (children.length < 3) {
      issues.push(`Block ${parentId} has only ${children.length} sub-functions (need 3+)`);
    }
  });

  // Check verb phrase naming (simple heuristic: first word should not be a noun-like pattern)
  const allBlocks = [...result.topLevelBlocks, ...result.decomposedBlocks];
  for (const block of allBlocks) {
    if (block.name && /^(The |A |An |[A-Z][a-z]+\s(Module|Service|System|Component|Manager))/.test(block.name)) {
      issues.push(`Block ${block.id} name "${block.name}" may not be a verb phrase`);
    }
  }

  // Check connections exist
  if (result.connections.length === 0) {
    issues.push('No connections defined between blocks');
  }

  // Check that connections reference valid block IDs
  const allBlockIds = new Set(allBlocks.map(b => b.id));
  for (const conn of result.connections) {
    if (!allBlockIds.has(conn.from)) {
      issues.push(`Connection references unknown source block: ${conn.from}`);
    }
    if (!allBlockIds.has(conn.to)) {
      issues.push(`Connection references unknown target block: ${conn.to}`);
    }
  }

  // Log issues if any
  if (issues.length > 0) {
    console.warn(`[FFBD Quality] ${issues.length} issues:`, issues);
  } else {
    console.log('[FFBD Quality] Passed all quality checks');
  }
}

/**
 * Calculate FFBD completeness score (0-100) based on extracted data
 *
 * Scoring criteria (total 100 points):
 * - Top-level blocks: 20% (5+ = 20, 3+ = 12, 1+ = 5)
 * - Core value marked: 10% (at least 1 = 10)
 * - Decomposition coverage: 25% (100% = 25, 75%+ = 18, 50%+ = 12, any = 5)
 * - Sub-function depth: 15% (all parents have 3+ children = 15, most = 10, some = 5)
 * - Connections: 15% (connections exist and reference valid blocks = 15, some = 8)
 * - Logic gates: 15% (AND/OR/IT gates used = 15, some = 8, none = 0)
 *
 * @param result - FFBD result from extractFFBD
 * @returns Completeness score 0-100
 */
export function calculateFFBDCompleteness(result: Ffbd): number {
  let score = 0;

  // Top-level blocks: 20 points
  const topCount = result.topLevelBlocks.length;
  if (topCount >= 5) {
    score += 20;
  } else if (topCount >= 3) {
    score += 12;
  } else if (topCount >= 1) {
    score += 5;
  }

  // Core value marked: 10 points
  const coreValueCount = result.topLevelBlocks.filter(b => b.isCoreValue).length;
  if (coreValueCount >= 1) {
    score += 10;
  }

  // Decomposition coverage: 25 points
  const decomposedParentIds = new Set(result.decomposedBlocks.map(b => b.parentId).filter(Boolean));
  const coverageRatio = topCount > 0 ? decomposedParentIds.size / topCount : 0;
  if (coverageRatio >= 1.0) {
    score += 25;
  } else if (coverageRatio >= 0.75) {
    score += 18;
  } else if (coverageRatio >= 0.5) {
    score += 12;
  } else if (coverageRatio > 0) {
    score += 5;
  }

  // Sub-function depth: 15 points
  if (decomposedParentIds.size > 0) {
    let parentsWithEnoughChildren = 0;
    Array.from(decomposedParentIds).forEach(parentId => {
      const children = result.decomposedBlocks.filter(b => b.parentId === parentId);
      if (children.length >= 3) {
        parentsWithEnoughChildren++;
      }
    });
    const depthRatio = parentsWithEnoughChildren / decomposedParentIds.size;
    if (depthRatio >= 1.0) {
      score += 15;
    } else if (depthRatio >= 0.5) {
      score += 10;
    } else {
      score += 5;
    }
  }

  // Connections: 15 points
  if (result.connections.length > 0) {
    const allBlockIds = new Set([
      ...result.topLevelBlocks.map(b => b.id),
      ...result.decomposedBlocks.map(b => b.id),
    ]);
    const validConnections = result.connections.filter(
      c => allBlockIds.has(c.from) && allBlockIds.has(c.to)
    );
    if (validConnections.length === result.connections.length && result.connections.length >= topCount) {
      score += 15;
    } else if (validConnections.length > 0) {
      score += 8;
    }
  }

  // Logic gates: 15 points
  const gatedConnections = result.connections.filter(c => c.gateType && c.gateType !== 'sequence');
  const gatedBlocks = [...result.topLevelBlocks, ...result.decomposedBlocks].filter(
    b => b.gateType && b.gateType !== 'none'
  );
  const gateCount = gatedConnections.length + gatedBlocks.length;
  if (gateCount >= 3) {
    score += 15;
  } else if (gateCount >= 1) {
    score += 8;
  }

  return Math.min(score, 100);
}

/**
 * Merge new FFBD data with existing data (incremental update)
 *
 * Strategy:
 * - Top-level blocks: Merge by id (deduplicate, prefer newer)
 * - Decomposed blocks: Merge by id (deduplicate, prefer newer)
 * - Connections: Merge by from+to key (deduplicate, prefer newer)
 *
 * @param existing - Previously extracted FFBD data
 * @param newData - Newly extracted FFBD data
 * @returns Merged FFBD result
 */
export function mergeFFBDData(existing: Ffbd, newData: Ffbd): Ffbd {
  // Merge top-level blocks (deduplicate by id)
  const topLevelMap = new Map(existing.topLevelBlocks.map(b => [b.id, b]));
  newData.topLevelBlocks.forEach(block => {
    topLevelMap.set(block.id, block); // Newer data overwrites
  });

  // Merge decomposed blocks (deduplicate by id)
  const decomposedMap = new Map(existing.decomposedBlocks.map(b => [b.id, b]));
  newData.decomposedBlocks.forEach(block => {
    decomposedMap.set(block.id, block);
  });

  // Merge connections (deduplicate by from+to composite key)
  const connectionKey = (c: { from?: string; to?: string }) => `${c.from ?? ''}→${c.to ?? ''}`;
  const connectionMap = new Map(existing.connections.map(c => [connectionKey(c), c]));
  newData.connections.forEach(conn => {
    connectionMap.set(connectionKey(conn), conn);
  });

  return {
    topLevelBlocks: Array.from(topLevelMap.values()),
    decomposedBlocks: Array.from(decomposedMap.values()),
    connections: Array.from(connectionMap.values()),
  };
}
