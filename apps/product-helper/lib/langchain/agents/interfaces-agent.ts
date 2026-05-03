/**
 * Interfaces Agent (Step 6: DFD, N2 Chart, Interface Matrix)
 *
 * Purpose: Decompose system into subsystems and define all interfaces between them
 * Pattern: Structured output with Zod schema validation
 * Team: AI/Agent Engineering (Agent 3.1: LangChain Integration Engineer)
 *
 * Uses Claude Sonnet via central config for deterministic extraction.
 * Analyzes FFBD output and use cases to produce:
 * - Subsystem decomposition with allocated FFBD functions
 * - Interface specifications with IF-IDs, payloads, protocols, and categories
 * - N2 chart mapping subsystem-to-subsystem data flows
 */

import { createClaudeAgent } from '../config';
import { interfacesSchema, type Interfaces } from '../schemas';
import { PromptTemplate } from '@langchain/core/prompts';
import {
  escapeBraces as sharedEscapeBraces,
  buildProjectContextPreamble,
  summarizeUpstream,
  INTERFACES_RULES,
} from '../prompts';
import { renderAtlasPriors } from '../atlas-loader';
import { intakePromptV2 } from '@/lib/config/feature-flags';
import type { IntakeState } from '../graphs/types';

/**
 * Structured Interfaces extraction LLM with Zod schema validation
 * Uses Claude Sonnet with temperature 0.2 for deterministic results
 */
const structuredInterfacesLLM = createClaudeAgent(interfacesSchema, 'extract_interfaces', {
  temperature: 0.2,
  maxTokens: 20000,
});

/** Flag-on V2 LLM with tighter cap (6K). */
const structuredInterfacesLLMV2 = createClaudeAgent(
  interfacesSchema,
  'extract_interfaces_v2',
  { temperature: 0.2, maxTokens: 6000 },
);

/**
 * Prompt template for Interfaces extraction
 *
 * All curly braces in the template body are escaped as {{ } to prevent
 * PromptTemplate from interpreting them as variables.
 */
const interfacesPrompt = new PromptTemplate({
  template: `You are a systems engineering expert specializing in interface analysis, N2 charts, and system decomposition.
Your task is to decompose the system into subsystems and define all interfaces following systems engineering best practices.

## Project Context
- **Project Name:** {projectName}

## FFBD Summary (Functional Flow Block Diagram)
{ffbdSummary}

## Use Cases
{useCases}

## Conversation History
{conversationHistory}

## Instructions

### 1. Subsystem Decomposition
Decompose the system into subsystems by grouping related FFBD functions.

Rules:
- Assign each subsystem an ID: "SS1", "SS2", "SS3", etc.
- Provide a clear, descriptive name for each subsystem (e.g., "Prediction Engine", "User Management", "Data Pipeline").
- Write a concise description of what each subsystem does.
- Allocate FFBD block IDs to each subsystem in the \`allocatedFunctions\` array.
- Every FFBD function should be allocated to exactly one subsystem.
- You MUST produce at least 3 subsystems.
- Group by cohesion: functions that share data, users, or domain should be in the same subsystem.
- Subsystems should have clear boundaries and minimal coupling.

### 2. Interface Specifications
Identify all interfaces between subsystems.

Rules:
- Assign each interface an ID: "IF-01", "IF-02", through "IF-N".
- Provide a descriptive name (e.g., "Worker Prediction Request", "Auth Token Validation").
- Specify source and destination subsystem IDs.
- Describe the data payload exchanged (e.g., "activity type, clothing ensemble, worker profile ID").
- Specify the communication protocol (e.g., "REST API", "WebSocket", "Event Bus", "gRPC", "Message Queue").
- Specify the frequency of use (e.g., "Per prediction", "On login", "Real-time stream", "Batch daily").
- Categorize each interface:
  - **system-flow**: Normal operational data exchange between subsystems.
  - **critical**: Performance-sensitive or reliability-critical interfaces.
  - **auth**: Authentication and authorization interfaces.
  - **audit**: Logging, monitoring, and audit trail interfaces.
- You MUST produce at least 5 interfaces.
- Consider both synchronous and asynchronous interfaces.
- Include external system interfaces where applicable.

### 3. N2 Chart
Build the N2 chart as a nested record mapping data flows between subsystems.

Rules:
- Structure: fromSubsystem -> toSubsystem -> payload description.
- The outer key is the source subsystem ID, the inner key is the destination subsystem ID.
- The value is a brief description of the data exchanged.
- Only include entries where data actually flows (do not fill the diagonal).
- The N2 chart should be consistent with the interface specifications.
- Every interface should have a corresponding N2 chart entry.

### Quality Requirements
- At least 3 subsystems with clear, non-overlapping responsibilities.
- At least 5 interfaces with complete specifications (payload, protocol, frequency, category).
- N2 chart entries consistent with interface specifications.
- Every subsystem must have at least one interface (no isolated subsystems).
- Interface categories should include at least one "critical" and one "auth" interface.
- Subsystem allocatedFunctions should cover all major FFBD blocks.`,
  inputVariables: ['projectName', 'ffbdSummary', 'useCases', 'conversationHistory'],
  templateFormat: 'f-string',
});

/**
 * Extract interface definitions from FFBD and use case context
 *
 * @param conversationHistory - Full conversation text (format: "role: content\n...")
 * @param projectName - Project name for context
 * @param ffbdSummary - Formatted FFBD summary text
 * @param useCases - Formatted use cases text
 * @returns Validated Interfaces result matching Interfaces schema, or null on failure
 */
export async function extractInterfaces(
  conversationHistory: string,
  projectName: string,
  ffbdSummary: string,
  useCases: string,
  /** Optional V2 context. Only consulted when `INTAKE_PROMPT_V2=true`. */
  opts?: {
    extractedData?: Partial<IntakeState['extractedData']>;
    projectType?: string | null;
    projectVision?: string;
  },
): Promise<Interfaces | null> {
  try {
    if (intakePromptV2()) {
      return await extractInterfacesV2(
        conversationHistory,
        projectName,
        opts ?? {},
      );
    }

    // Escape curly braces in inputs to prevent PromptTemplate from interpreting them as variables
    // This is needed because conversation history may contain JSON-like content with { and }
    // NOTE: legacy bug at line 124 — `}` replace is a no-op. Preserved verbatim
    // because the flag-off path must remain byte-identical. Flag-on uses the
    // shared (correct) escapeBraces from prompts.ts.
    const escapeBraces = (str: string) => str.replace(/\{/g, '{{').replace(/\}/g, '}');

    // Format prompt with project context
    const promptText = await interfacesPrompt.format({
      projectName: escapeBraces(projectName),
      ffbdSummary: escapeBraces(ffbdSummary),
      useCases: escapeBraces(useCases),
      conversationHistory: escapeBraces(conversationHistory),
    });

    // Invoke structured LLM for extraction
    const result = await structuredInterfacesLLM.invoke(promptText);

    // Validate and log quality issues
    validateInterfacesQuality(result);

    return result;
  } catch (error) {
    console.error('Interfaces extraction error:', error);

    // Return null on failure — callers should preserve existing state
    return null;
  }
}

/**
 * Build the V2 Interfaces prompt body from shared utilities.
 */
export function buildInterfacesPromptV2(
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
    ['ffbd', 'decisionMatrix'],
  );
  const priors = renderAtlasPriors(opts.projectType ?? 'unknown', [
    'latency',
    'availability',
  ]);
  const conversationBlock =
    `## Conversation\n${sharedEscapeBraces(conversationHistory)}`;
  return [preamble, upstream, priors.text, conversationBlock, INTERFACES_RULES].join(
    '\n\n',
  );
}

async function extractInterfacesV2(
  conversationHistory: string,
  projectName: string,
  opts: {
    extractedData?: Partial<IntakeState['extractedData']>;
    projectType?: string | null;
    projectVision?: string;
  },
): Promise<Interfaces | null> {
  try {
    const promptText = buildInterfacesPromptV2(
      conversationHistory,
      projectName,
      opts,
    );
    const result = await structuredInterfacesLLMV2.invoke(promptText);
    validateInterfacesQuality(result);
    return result;
  } catch (error) {
    console.error('Interfaces extraction error (v2):', error);
    return null;
  }
}

/**
 * Validate Interfaces quality and log issues for monitoring
 * Does not fail extraction - just logs for observability
 *
 * @param result - Interfaces result to validate
 */
export function validateInterfacesQuality(result: Interfaces): void {
  const issues: string[] = [];

  // Check minimum subsystems
  if (result.subsystems.length < 3) {
    issues.push(`Only ${result.subsystems.length} subsystems (need 3+)`);
  }

  // Check minimum interfaces
  if (result.interfaces.length < 5) {
    issues.push(`Only ${result.interfaces.length} interfaces (need 5+)`);
  }

  // Check that every subsystem has at least one interface
  const subsystemIds = new Set(result.subsystems.map(s => s.id));
  const connectedSubsystems = new Set<string>();
  for (const iface of result.interfaces) {
    connectedSubsystems.add(iface.source);
    connectedSubsystems.add(iface.destination);
  }
  const isolatedSubsystems = result.subsystems.filter(s => !connectedSubsystems.has(s.id));
  if (isolatedSubsystems.length > 0) {
    issues.push(`${isolatedSubsystems.length} isolated subsystems (no interfaces): ${isolatedSubsystems.map(s => s.id).join(', ')}`);
  }

  // Check that interfaces reference valid subsystem IDs
  for (const iface of result.interfaces) {
    if (!subsystemIds.has(iface.source)) {
      issues.push(`Interface ${iface.id} references unknown source subsystem: ${iface.source}`);
    }
    if (!subsystemIds.has(iface.destination)) {
      issues.push(`Interface ${iface.id} references unknown destination subsystem: ${iface.destination}`);
    }
  }

  // Check IF-ID format
  for (const iface of result.interfaces) {
    if (!/^IF-\d+$/.test(iface.id)) {
      issues.push(`Interface "${iface.id}" does not follow IF-NN format`);
    }
  }

  // Check interface categories include at least critical and auth
  const categories = new Set(result.interfaces.map(i => i.category).filter(Boolean));
  if (!categories.has('critical')) {
    issues.push('No interface categorized as "critical"');
  }
  if (!categories.has('auth')) {
    issues.push('No interface categorized as "auth"');
  }

  // Check N2 chart consistency with interfaces
  const n2Pairs = new Set<string>();
  for (const [fromId, targets] of Object.entries(result.n2Chart)) {
    for (const toId of Object.keys(targets)) {
      n2Pairs.add(`${fromId}:${toId}`);
    }
  }
  for (const iface of result.interfaces) {
    const pairKey = `${iface.source}:${iface.destination}`;
    if (!n2Pairs.has(pairKey)) {
      issues.push(`Interface ${iface.id} (${iface.source} -> ${iface.destination}) has no N2 chart entry`);
    }
  }

  // Check that subsystems have allocated functions
  const subsystemsWithoutFunctions = result.subsystems.filter(
    s => !s.allocatedFunctions || s.allocatedFunctions.length === 0
  );
  if (subsystemsWithoutFunctions.length > 0) {
    issues.push(`${subsystemsWithoutFunctions.length} subsystems have no allocated FFBD functions: ${subsystemsWithoutFunctions.map(s => s.id).join(', ')}`);
  }

  // Log issues if any
  if (issues.length > 0) {
    console.warn(`[Interfaces Quality] ${issues.length} issues:`, issues);
  } else {
    console.log('[Interfaces Quality] Passed all quality checks');
  }
}

/**
 * Calculate Interfaces completeness score (0-100) based on extracted data
 *
 * Scoring criteria (total 100 points):
 * - Subsystems: 15% (3+ = 15, 2 = 10, 1 = 5)
 * - Allocated functions: 10% (all subsystems have functions = 10, most = 6, some = 3)
 * - Interfaces: 20% (5+ = 20, 3+ = 12, 1+ = 5)
 * - Interface completeness: 15% (all have payload+protocol+frequency+category = 15, most = 10, some = 5)
 * - No isolated subsystems: 10% (all connected = 10, most = 5)
 * - Category diversity: 10% (4 categories = 10, 3 = 7, 2 = 4, 1 = 2)
 * - N2 chart: 20% (consistent with interfaces = 20, partial = 10, empty = 0)
 *
 * @param result - Interfaces result from extractInterfaces
 * @returns Completeness score 0-100
 */
export function calculateInterfacesCompleteness(result: Interfaces): number {
  let score = 0;

  // Subsystems: 15 points
  const subsystemCount = result.subsystems.length;
  if (subsystemCount >= 3) {
    score += 15;
  } else if (subsystemCount === 2) {
    score += 10;
  } else if (subsystemCount === 1) {
    score += 5;
  }

  // Allocated functions: 10 points
  if (subsystemCount > 0) {
    const withFunctions = result.subsystems.filter(
      s => s.allocatedFunctions && s.allocatedFunctions.length > 0
    ).length;
    const functionRatio = withFunctions / subsystemCount;
    if (functionRatio >= 1.0) {
      score += 10;
    } else if (functionRatio >= 0.5) {
      score += 6;
    } else if (functionRatio > 0) {
      score += 3;
    }
  }

  // Interfaces: 20 points
  const ifaceCount = result.interfaces.length;
  if (ifaceCount >= 5) {
    score += 20;
  } else if (ifaceCount >= 3) {
    score += 12;
  } else if (ifaceCount >= 1) {
    score += 5;
  }

  // Interface completeness: 15 points
  if (ifaceCount > 0) {
    const completeInterfaces = result.interfaces.filter(
      i => i.dataPayload && i.protocol && i.frequency && i.category
    ).length;
    const completenessRatio = completeInterfaces / ifaceCount;
    if (completenessRatio >= 1.0) {
      score += 15;
    } else if (completenessRatio >= 0.5) {
      score += 10;
    } else if (completenessRatio > 0) {
      score += 5;
    }
  }

  // No isolated subsystems: 10 points
  if (subsystemCount > 0) {
    const connectedSubsystems = new Set<string>();
    for (const iface of result.interfaces) {
      connectedSubsystems.add(iface.source);
      connectedSubsystems.add(iface.destination);
    }
    const connectedRatio = connectedSubsystems.size / subsystemCount;
    if (connectedRatio >= 1.0) {
      score += 10;
    } else if (connectedRatio >= 0.5) {
      score += 5;
    }
  }

  // Category diversity: 10 points
  const categories = new Set(result.interfaces.map(i => i.category).filter(Boolean));
  if (categories.size >= 4) {
    score += 10;
  } else if (categories.size >= 3) {
    score += 7;
  } else if (categories.size >= 2) {
    score += 4;
  } else if (categories.size >= 1) {
    score += 2;
  }

  // N2 chart: 20 points
  const n2Entries = Object.values(result.n2Chart).reduce(
    (count, targets) => count + Object.keys(targets).length,
    0
  );
  if (n2Entries > 0) {
    // Check consistency: what fraction of interfaces have N2 chart entries
    const n2Pairs = new Set<string>();
    for (const [fromId, targets] of Object.entries(result.n2Chart)) {
      for (const toId of Object.keys(targets)) {
        n2Pairs.add(`${fromId}:${toId}`);
      }
    }
    const interfacesWithN2 = result.interfaces.filter(
      i => n2Pairs.has(`${i.source}:${i.destination}`)
    ).length;
    const consistencyRatio = ifaceCount > 0 ? interfacesWithN2 / ifaceCount : 0;
    if (consistencyRatio >= 1.0) {
      score += 20;
    } else if (consistencyRatio >= 0.5) {
      score += 10;
    } else {
      score += 5;
    }
  }

  return Math.min(score, 100);
}

/**
 * Merge new Interfaces data with existing data (incremental update)
 *
 * Strategy:
 * - Subsystems: Merge by id (deduplicate, prefer newer)
 * - Interfaces: Merge by id (deduplicate, prefer newer)
 * - N2 chart: Deep merge (newer entries overwrite per from->to pair)
 *
 * @param existing - Previously extracted Interfaces data
 * @param newData - Newly extracted Interfaces data
 * @returns Merged Interfaces result
 */
export function mergeInterfacesData(existing: Interfaces, newData: Interfaces): Interfaces {
  // Merge subsystems (deduplicate by id)
  const subsystemMap = new Map(existing.subsystems.map(s => [s.id, s]));
  newData.subsystems.forEach(subsystem => {
    subsystemMap.set(subsystem.id, subsystem); // Newer data overwrites
  });

  // Merge interfaces (deduplicate by id)
  const ifaceMap = new Map(existing.interfaces.map(i => [i.id, i]));
  newData.interfaces.forEach(iface => {
    ifaceMap.set(iface.id, iface);
  });

  // Deep merge N2 chart (newer entries overwrite per from->to pair)
  const mergedN2: Record<string, Record<string, string>> = {};

  // Start with existing entries
  for (const [fromId, targets] of Object.entries(existing.n2Chart)) {
    mergedN2[fromId] = { ...targets };
  }

  // Overlay new entries
  for (const [fromId, targets] of Object.entries(newData.n2Chart)) {
    if (!mergedN2[fromId]) {
      mergedN2[fromId] = {};
    }
    for (const [toId, payload] of Object.entries(targets)) {
      mergedN2[fromId][toId] = payload; // Newer data overwrites
    }
  }

  return {
    subsystems: Array.from(subsystemMap.values()),
    interfaces: Array.from(ifaceMap.values()),
    n2Chart: mergedN2,
  };
}
