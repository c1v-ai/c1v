/**
 * Knowledge-Bank-Driven Question Generator
 *
 * Replaces the flat question bank approach with a collaborative flow where
 * the LLM makes educated guesses based on project context, presents them
 * for user validation, and probes gaps using knowledge bank patterns.
 *
 * Flow per KB step:
 * 1. Read current KB step from state
 * 2. Make educated guesses from project context (inference rules)
 * 3. Format guesses as confident (check) / uncertain (?) for user validation
 * 4. Track confirmed vs uncertain items
 * 5. Probe gaps based on KB-specific gap questions
 * 6. Calculate confidence — when >80%, propose artifact generation
 *
 * @module intake/kb-question-generator
 */

import { z } from 'zod';
import { createClaudeAgent } from '../../config';
import type { IntakeState } from '../../graphs/types';
import type { KnowledgeBankStep } from '@/lib/education/knowledge-bank';
import { knowledgeBank } from '@/lib/education/knowledge-bank';
import { buildPromptEducationBlock } from '@/lib/education/phase-mapping';
import type { ExtractionResult } from '../../schemas';

// ============================================================
// Types
// ============================================================

/** A single educated guess the LLM makes about the project */
export interface Guess {
  /** The item name (e.g., "USDA FoodData API", "Admin User") */
  item: string;
  /** Whether the LLM is confident about this guess */
  confident: boolean;
  /** Brief reasoning for the guess */
  reasoning: string;
  /** What category this belongs to (actor, external_system, use_case, scope_item, etc.) */
  category: GuessCategory;
}

export type GuessCategory =
  | 'actor'
  | 'external_system'
  | 'use_case'
  | 'scope_item'
  | 'data_entity'
  | 'constraint'
  | 'requirement';

/** A targeted gap question derived from the KB step */
export interface GapQuestion {
  /** The question text */
  question: string;
  /** What data gap this addresses */
  target: string;
  /** Why this matters (from KB educational content) */
  educationalContext: string;
}

/** Result of the KB-driven analysis for the current step */
export interface KBAnalysisResult {
  /** Educated guesses based on project context */
  guesses: Guess[];
  /** Targeted gap questions from the KB */
  gaps: GapQuestion[];
  /** Confidence score 0-100 for the current KB step */
  confidence: number;
  /** Whether to propose artifact generation */
  shouldProposeGeneration: boolean;
  /** Formatted response text for the user */
  formattedResponse: string;
}

// ============================================================
// Schemas for LLM Structured Output
// ============================================================

const guessSchema = z.object({
  item: z.string().describe('Name of the guessed element'),
  confident: z.boolean().describe('Whether this is a confident guess or uncertain'),
  reasoning: z.string().describe('Brief reasoning for the guess'),
  category: z.enum([
    'actor',
    'external_system',
    'use_case',
    'scope_item',
    'data_entity',
    'constraint',
    'requirement',
  ]).describe('Category of the guess'),
});

const kbAnalysisSchema = z.object({
  guesses: z.array(guessSchema).describe('Educated guesses about the project'),
  gapQuestions: z.array(z.object({
    question: z.string().describe('Targeted gap question'),
    target: z.string().describe('What data this targets'),
  })).describe('Follow-up questions for remaining gaps'),
  confidence: z.number().min(0).max(100).describe('Confidence score 0-100 for this KB step'),
  summary: z.string().describe('Brief summary of analysis for the user'),
});

type KBAnalysis = z.infer<typeof kbAnalysisSchema>;

// ============================================================
// LLM Configuration
// ============================================================

const kbAnalysisLLM = createClaudeAgent(kbAnalysisSchema, 'kb_analysis', {
  temperature: 0.4,
  maxTokens: 2000,
});

// ============================================================
// KB Step Inference Rules
// ============================================================

/**
 * Domain-specific inference patterns per KB step.
 * These help the LLM make educated guesses based on project keywords.
 */
const INFERENCE_RULES: Record<KnowledgeBankStep, {
  /** What to look for in the project vision/data */
  signals: string[];
  /** Minimum elements for confidence >80% */
  minElements: number;
  /** Categories relevant to this step */
  categories: GuessCategory[];
}> = {
  'context-diagram': {
    signals: [
      'Look for: user types, admin roles, external APIs, payment processors, auth providers',
      'Meal/nutrition/food → USDA API, nutrition databases, barcode scanners, image recognition',
      'E-commerce/shopping → Payment gateways (Stripe/PayPal), shipping APIs, inventory systems',
      'Social/messaging → Push notification services, email services, CDN, moderation tools',
      'Education/learning → LMS integrations, video streaming, assessment engines',
      'Healthcare/medical → EHR systems, HIPAA compliance, lab systems',
    ],
    minElements: 8,
    categories: ['actor', 'external_system'],
  },
  'use-case-diagram': {
    signals: [
      'Generate use cases from each actor: what can they DO?',
      'Consider actor variants (new user vs power user, student vs instructor)',
      'Include undesired use cases: malicious use, system failures, edge cases',
      'Use verb phrases: "Place Order", "View Dashboard", "Generate Report"',
    ],
    minElements: 20,
    categories: ['use_case', 'actor'],
  },
  'scope-tree': {
    signals: [
      'In-scope: core features for MVP/Phase 1',
      'Out-of-scope: explicitly deferred features for Phase 2+',
      'Questions (?): unknowns requiring decisions before proceeding',
      'Deliverables: what you physically hand over to the stakeholder',
    ],
    minElements: 10,
    categories: ['scope_item'],
  },
  ucbd: {
    signals: [
      'For each use case: preconditions, step-by-step flow, postconditions',
      'Apply the Delving Technique: "If it has to do THIS, what else must it do?"',
      'Every system action becomes a SHALL statement',
      'Swimlanes: who does what (actor column vs system column)',
    ],
    minElements: 5,
    categories: ['use_case', 'requirement'],
  },
  'functional-requirements': {
    signals: [
      'Convert every SHALL from UCBDs into formal requirements',
      'Apply the AND test: split compound requirements',
      'Use requirement constants for undecided values (MAX_RESPONSE_TIME)',
      'Ensure each requirement is independently testable',
    ],
    minElements: 15,
    categories: ['requirement', 'constraint'],
  },
  'sysml-activity-diagram': {
    signals: [
      'Convert UCBD rows into SysML actions',
      'Identify decision points (diamonds) and parallel flows (fork/join)',
      'Link every system action to a requirement ID [OR.X]',
      'Ensure every path reaches an end node',
    ],
    minElements: 5,
    categories: ['use_case', 'requirement'],
  },
};

// ============================================================
// Confidence Thresholds
// ============================================================

const CONFIDENCE_THRESHOLDS: Record<KnowledgeBankStep, {
  /** Minimum confidence to propose generation */
  proposeGeneration: number;
  /** Weight factors for confidence calculation */
  weights: Record<string, number>;
}> = {
  'context-diagram': {
    proposeGeneration: 80,
    weights: { actors: 30, externalSystems: 40, interactions: 30 },
  },
  'use-case-diagram': {
    proposeGeneration: 80,
    weights: { useCases: 40, actorVariants: 20, undesiredCases: 20, relationships: 20 },
  },
  'scope-tree': {
    proposeGeneration: 80,
    weights: { inScope: 40, outScope: 30, unknowns: 30 },
  },
  ucbd: {
    proposeGeneration: 80,
    weights: { preconditions: 25, steps: 35, postconditions: 25, shallStatements: 15 },
  },
  'functional-requirements': {
    proposeGeneration: 80,
    weights: { requirements: 40, testability: 30, traceability: 30 },
  },
  'sysml-activity-diagram': {
    proposeGeneration: 80,
    weights: { actions: 30, decisions: 25, links: 25, completeness: 20 },
  },
};

// ============================================================
// KB Step Sequence
// ============================================================

const KB_STEP_SEQUENCE: KnowledgeBankStep[] = [
  'context-diagram',
  'use-case-diagram',
  'scope-tree',
  'ucbd',
  'functional-requirements',
  'sysml-activity-diagram',
];

// ============================================================
// Main Function
// ============================================================

/**
 * Generate a KB-driven response for the current step.
 *
 * This replaces the flat question bank approach. Instead of picking
 * a question from a list, it:
 * 1. Analyzes the project context using inference rules
 * 2. Makes educated guesses (confident vs uncertain)
 * 3. Identifies remaining gaps from the KB
 * 4. Calculates confidence for the current step
 * 5. Formats everything for the user
 *
 * @param state - Current intake state
 * @returns KB analysis result with guesses, gaps, and confidence
 */
export async function generateKBDrivenResponse(
  state: IntakeState
): Promise<KBAnalysisResult> {
  const kbStep = state.currentKBStep;
  const kbEntry = knowledgeBank[kbStep];
  const rules = INFERENCE_RULES[kbStep];
  const thresholds = CONFIDENCE_THRESHOLDS[kbStep];

  // Build the education block for this phase
  const educationBlock = buildPromptEducationBlock(state.currentPhase);

  // Build a summary of existing data
  const dataSummary = buildDataSummary(state.extractedData, kbStep);

  // Build KB step-specific context
  const kbContext = buildKBStepContext(kbStep, state);

  // Build question history block from both askedQuestions and stepCompletionStatus
  const askedQuestions = state.askedQuestions ?? [];
  const stepStatus = state.stepCompletionStatus?.[kbStep];
  const coveredTopics = stepStatus?.coveredTopics ?? [];
  const allCoveredTopics = Array.from(new Set([...askedQuestions, ...coveredTopics]));
  const questionHistoryBlock = allCoveredTopics.length > 0
    ? `## Previously Covered Topics (DO NOT re-ask these)
${allCoveredTopics.map(q => `- ${q}`).join('\n')}
`
    : '';

  // Build guess history block so LLM sees its own previous output
  const guessHistory = state.guessHistory ?? [];
  const recentHistory = guessHistory
    .filter(h => h.step === kbStep)
    .slice(-3); // Last 3 turns for this step
  const guessHistoryBlock = recentHistory.length > 0
    ? `## Your Previous Guesses and Gaps (for context — do NOT repeat these)
${recentHistory.map(h => `Turn ${h.turn} (confidence: ${h.confidence}%):
  Guesses: ${h.guessSummaries.join(', ') || 'none'}
  Gaps asked: ${h.gapTargets.join(', ') || 'none'}`).join('\n')}
`
    : '';

  // Step progress info
  const roundsAsked = stepStatus?.roundsAsked ?? 0;
  const stepProgressBlock = roundsAsked > 0
    ? `## Step Progress
- Rounds on this step: ${roundsAsked}
- ${roundsAsked >= 3 ? 'IMPORTANT: We have asked 3+ rounds. If no critical gaps remain, set confidence >= 80 to propose generation.' : `Rounds remaining before auto-advance: ${3 - roundsAsked}`}
`
    : '';

  try {
    const analysis = await kbAnalysisLLM.invoke(`
You are a systems engineering expert guiding a user through PRD creation.
You are currently on the "${kbEntry.label}" step of the knowledge bank.

## Project Context
- **Name:** ${state.projectName}
- **Vision:** ${state.projectVision}
- **Completeness:** ${state.completeness}%
- **Current KB Step:** ${kbEntry.label}

## Existing Data
${dataSummary}

## Previous KB Step Data
${JSON.stringify(state.kbStepData, null, 2)}

${questionHistoryBlock}
${guessHistoryBlock}
${stepProgressBlock}
${educationBlock}

## Inference Rules for ${kbEntry.label}
${rules.signals.map(s => `- ${s}`).join('\n')}

## Your Task
1. Make EDUCATED GUESSES about what elements belong in the ${kbEntry.label}.
   - Mark each guess as confident (true) or uncertain (false).
   - Use the project vision and existing data to infer elements.
   - For each guess, provide a brief reasoning.
   - Categorize each guess: ${rules.categories.join(', ')}

2. Identify GAPS that need user input.
   - Generate 1-3 targeted questions about missing information.
   - Focus on what you CANNOT infer from context.
   - NEVER ask about topics listed in "Previously Asked Topics" above.
   - If all gaps have been asked about, return an empty gapQuestions array.

3. Calculate CONFIDENCE (0-100).
   - Consider: how many of the minimum ${rules.minElements} elements do we have?
   - Are the existing elements well-defined?
   - Are there critical gaps remaining?
   - If the user has already addressed a topic (it appears in existing data OR was previously asked), count it as covered even if the data isn't perfect.

${kbContext}

## Critical Rules
- Be SPECIFIC, not generic. "USDA FoodData API" not "food database".
- INFER aggressively from the vision statement. Don't ask for what you can deduce.
- If the user already provided information, BUILD ON IT, don't repeat questions.
- NEVER re-ask topics from the "Previously Asked Topics" list.
- Focus gaps on what truly needs human input (business decisions, preferences).
- The confidence score should reflect readiness to generate the ${kbEntry.label}.
- If you have enough data to generate the artifact, set confidence >= 80 even if some data is imperfect.
`);

    // Build gap questions with educational context
    const gaps: GapQuestion[] = analysis.gapQuestions.map(
      (gq: { question: string; target: string }) => ({
        question: gq.question,
        target: gq.target,
        educationalContext: getGapEducationalContext(kbStep, gq.target),
      })
    );

    // Auto-propose when: (a) LLM confidence is high enough, OR
    // (b) we've spent 3+ rounds on this step with no remaining gaps
    const roundsOnStep = state.stepCompletionStatus?.[kbStep]?.roundsAsked ?? 0;
    const noGapsRemaining = analysis.gapQuestions.length === 0;
    const shouldProposeGeneration =
      analysis.confidence >= thresholds.proposeGeneration ||
      (roundsOnStep >= 3 && noGapsRemaining);

    // Map guesses with proper typing
    const typedGuesses: Guess[] = analysis.guesses.map(
      (g: z.infer<typeof guessSchema>) => ({
        ...g,
        category: g.category as GuessCategory,
      })
    );

    // Format the response for the user
    const formattedResponse = formatKBResponse(
      typedGuesses,
      gaps,
      analysis.confidence,
      shouldProposeGeneration,
      kbEntry.label,
      analysis.summary
    );

    return {
      guesses: typedGuesses,
      gaps,
      confidence: analysis.confidence,
      shouldProposeGeneration,
      formattedResponse,
    };
  } catch (error) {
    console.error(`KB analysis error for step ${kbStep}:`, error);

    // Fallback: return a basic gap-focused result
    return buildFallbackResult(kbStep, kbEntry.label, state);
  }
}

// ============================================================
// Confidence Calculation
// ============================================================

/**
 * Calculate confidence for a KB step based on extracted data.
 * This provides a deterministic baseline that the LLM's assessment
 * is validated against.
 */
export function calculateStepConfidence(
  kbStep: KnowledgeBankStep,
  data: ExtractionResult
): number {
  const rules = INFERENCE_RULES[kbStep];

  switch (kbStep) {
    case 'context-diagram': {
      const actorCount = data.actors.length;
      const externalCount = data.systemBoundaries.external.length;
      const total = actorCount + externalCount;
      if (total >= rules.minElements) return 90;
      if (total >= rules.minElements * 0.7) return 75;
      if (total >= rules.minElements * 0.4) return 50;
      if (total > 0) return 25;
      return 0;
    }
    case 'use-case-diagram': {
      const ucCount = data.useCases.length;
      if (ucCount >= rules.minElements) return 90;
      if (ucCount >= 10) return 70;
      if (ucCount >= 5) return 50;
      if (ucCount > 0) return 25;
      return 0;
    }
    case 'scope-tree': {
      const inScope = data.systemBoundaries.internal.length;
      if (inScope >= rules.minElements) return 85;
      if (inScope >= 5) return 60;
      if (inScope > 0) return 30;
      return 0;
    }
    case 'ucbd': {
      const withPrePost = data.useCases.filter(
        uc =>
          (uc.preconditions?.length ?? 0) > 0 &&
          (uc.postconditions?.length ?? 0) > 0
      ).length;
      if (withPrePost >= rules.minElements) return 85;
      if (withPrePost >= 3) return 60;
      if (withPrePost > 0) return 30;
      return 0;
    }
    case 'functional-requirements': {
      // Requirements are derived from use cases
      const ucCount = data.useCases.length;
      if (ucCount >= 10) return 85;
      if (ucCount >= 5) return 60;
      if (ucCount >= 3) return 40;
      return 10;
    }
    case 'sysml-activity-diagram': {
      // Activity diagrams require sufficient use cases with detailed flows
      const withFlows = data.useCases.filter(
        uc => (uc.mainFlow?.length ?? 0) > 0
      ).length;
      if (withFlows >= rules.minElements) return 85;
      if (withFlows >= 3) return 60;
      if (data.useCases.length >= 3) return 40;
      return 10;
    }
    default:
      return 0;
  }
}

// ============================================================
// KB Step Transition
// ============================================================

/**
 * Get the next KB step in the sequence.
 * Returns null if at the end.
 */
export function getNextKBStep(
  currentStep: KnowledgeBankStep
): KnowledgeBankStep | null {
  const idx = KB_STEP_SEQUENCE.indexOf(currentStep);
  if (idx < 0 || idx >= KB_STEP_SEQUENCE.length - 1) return null;
  return KB_STEP_SEQUENCE[idx + 1];
}

/**
 * Check if all KB steps are complete.
 */
export function areAllKBStepsComplete(
  generatedArtifacts: string[]
): boolean {
  // Map KB steps to their artifact phase names
  const requiredArtifacts = [
    'context_diagram',
    'use_case_diagram',
    'scope_tree',
    'ucbd',
    'requirements_table',
    'sysml_activity_diagram',
  ];
  return requiredArtifacts.every(a => generatedArtifacts.includes(a));
}

// ============================================================
// Helper Functions
// ============================================================

function buildDataSummary(
  data: ExtractionResult,
  kbStep: KnowledgeBankStep
): string {
  const lines: string[] = [];

  lines.push(`### Actors (${data.actors.length})`);
  if (data.actors.length > 0) {
    data.actors.forEach(a => lines.push(`- **${a.name}**: ${a.description}`));
  } else {
    lines.push('- None identified yet');
  }

  lines.push(`\n### External Systems (${data.systemBoundaries.external.length})`);
  if (data.systemBoundaries.external.length > 0) {
    data.systemBoundaries.external.forEach(s => lines.push(`- ${s}`));
  } else {
    lines.push('- None identified yet');
  }

  lines.push(`\n### Use Cases (${data.useCases.length})`);
  if (data.useCases.length > 0) {
    data.useCases.forEach(uc =>
      lines.push(`- **${uc.name}** (${uc.actor}): ${uc.description}`)
    );
  } else {
    lines.push('- None identified yet');
  }

  lines.push(`\n### In-Scope Items (${data.systemBoundaries.internal.length})`);
  if (data.systemBoundaries.internal.length > 0) {
    data.systemBoundaries.internal.forEach(i => lines.push(`- ${i}`));
  } else {
    lines.push('- None identified yet');
  }

  if (
    kbStep === 'ucbd' ||
    kbStep === 'functional-requirements' ||
    kbStep === 'sysml-activity-diagram'
  ) {
    lines.push(`\n### Data Entities (${data.dataEntities.length})`);
    if (data.dataEntities.length > 0) {
      data.dataEntities.forEach(e =>
        lines.push(
          `- **${e.name}**: ${e.attributes.slice(0, 5).join(', ')}`
        )
      );
    } else {
      lines.push('- None identified yet');
    }
  }

  return lines.join('\n');
}

function buildKBStepContext(
  kbStep: KnowledgeBankStep,
  state: IntakeState
): string {
  const lines: string[] = [];
  const entry = knowledgeBank[kbStep];

  lines.push(`## ${entry.label} — Step-Specific Guidance`);
  lines.push('');

  // Add validation error patterns as guidance for what NOT to do
  const errors = entry.validationErrors;
  const errorKeys = Object.keys(errors);
  if (errorKeys.length > 0) {
    lines.push('### Avoid These Common Mistakes:');
    for (const key of errorKeys.slice(0, 3)) {
      const err = errors[key];
      lines.push(`- ${err.error} — ${err.fix}`);
    }
    lines.push('');
  }

  // Step-specific prompting
  switch (kbStep) {
    case 'context-diagram':
      lines.push('### Focus Areas:');
      lines.push('- Who uses the system directly?');
      lines.push('- What external services does it connect to?');
      lines.push('- What regulatory or compliance bodies are relevant?');
      lines.push('- What failure modes or bad actors should be considered?');
      lines.push(
        '- Target: 8+ external elements (users, systems, regulators, threat actors)'
      );
      break;
    case 'use-case-diagram':
      lines.push('### Focus Areas:');
      lines.push(
        '- Generate use cases per actor: what can each actor DO?'
      );
      lines.push(
        '- Actor variants: "student driver" vs "experienced driver" create different use cases'
      );
      lines.push('- Undesired use cases: what can go wrong? Malicious use?');
      lines.push('- Target: 20-30 use cases total');
      break;
    case 'scope-tree':
      lines.push('### Focus Areas:');
      lines.push('- What deliverables are in Phase 1?');
      lines.push('- What is explicitly deferred to Phase 2?');
      lines.push('- What unknowns (?) need decisions?');
      lines.push(
        '- Apply contractor test: would they know exactly what to deliver?'
      );
      break;
    case 'ucbd':
      lines.push('### Focus Areas:');
      lines.push(
        '- For top use cases: define preconditions, steps, postconditions'
      );
      lines.push(
        '- Apply Delving Technique: "If it has to do THIS, what else must it do?"'
      );
      lines.push('- Each system action → SHALL statement');
      break;
    case 'functional-requirements':
      lines.push('### Focus Areas:');
      lines.push(
        '- Convert UCBD SHALL statements into formal requirements'
      );
      lines.push('- Apply AND test: split compound requirements');
      lines.push(
        '- Use constants for undecided values (MAX_RESPONSE_TIME)'
      );
      break;
    case 'sysml-activity-diagram':
      lines.push('### Focus Areas:');
      lines.push('- Convert UCBD rows into activity diagram actions');
      lines.push(
        '- Identify decision points and parallel flows'
      );
      lines.push('- Link actions to requirement IDs [OR.X]');
      break;
  }

  return lines.join('\n');
}

function getGapEducationalContext(
  kbStep: KnowledgeBankStep,
  target: string
): string {
  const entry = knowledgeBank[kbStep];
  // Find a relevant thinking message for educational context
  const thinkingMsg = entry.thinkingMessages.find(tm =>
    tm.tip.toLowerCase().includes(target.toLowerCase())
  );
  return thinkingMsg?.tip ?? entry.thinkingMessages[0]?.tip ?? '';
}

function formatKBResponse(
  guesses: Guess[],
  gaps: GapQuestion[],
  confidence: number,
  shouldProposeGeneration: boolean,
  stepLabel: string,
  summary: string
): string {
  const lines: string[] = [];

  // Summary
  lines.push(summary);
  lines.push('');

  // Educated guesses
  if (guesses.length > 0) {
    lines.push(`Here's what I've identified for the **${stepLabel}**:`);
    lines.push('');
    for (const guess of guesses) {
      const marker = guess.confident ? '\u2713' : '?';
      lines.push(`${marker} **${guess.item}** — ${guess.reasoning}`);
    }
    lines.push('');
  }

  // Gap questions
  if (gaps.length > 0 && !shouldProposeGeneration) {
    lines.push('A few things I need your input on:');
    lines.push('');
    for (const gap of gaps) {
      lines.push(`- ${gap.question}`);
    }
    lines.push('');
  }

  // Generation proposal
  if (shouldProposeGeneration) {
    lines.push(
      `I have enough information to generate your **${stepLabel}** (confidence: ${confidence}%). ` +
        'This will use AI tokens. Should I proceed?'
    );
  }

  return lines.join('\n');
}

function buildFallbackResult(
  kbStep: KnowledgeBankStep,
  stepLabel: string,
  state: IntakeState
): KBAnalysisResult {
  const entry = knowledgeBank[kbStep];
  const confidence = calculateStepConfidence(kbStep, state.extractedData);

  const fallbackQuestion: GapQuestion = {
    question: `Can you tell me more about what elements should be in the ${stepLabel}?`,
    target: kbStep,
    educationalContext: entry.thinkingMessages[0]?.tip ?? '',
  };

  return {
    guesses: [],
    gaps: [fallbackQuestion],
    confidence,
    shouldProposeGeneration: false,
    formattedResponse: `I'm working on the **${stepLabel}** step. ${fallbackQuestion.question}`,
  };
}
