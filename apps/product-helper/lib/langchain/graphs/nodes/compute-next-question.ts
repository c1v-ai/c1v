/**
 * Compute Next Question Node
 *
 * Purpose: Generate the next question to ask the user based on data gaps.
 * Uses the Knowledge Bank-driven collaborative flow where the LLM makes
 * educated guesses and probes gaps, replacing the flat question bank approach.
 *
 * Team: AI/Agent Engineering (Agent 3.1: LangChain Integration Engineer)
 *
 * @module graphs/nodes/compute-next-question
 */

import { createClaudeAgent } from '../../config';
import { z } from 'zod';
import { IntakeState, ArtifactPhase } from '../types';
import {
  generateKBDrivenResponse,
  calculateStepConfidence,
} from '../../agents/intake/kb-question-generator';

// ============================================================
// Schema Definition (fallback question generation)
// ============================================================

const questionSchema = z.object({
  question: z.string().describe('Single focused question to ask'),
  targetData: z.enum([
    'actors',
    'use_cases',
    'external_systems',
    'scope',
    'data_entities',
    'ucbd_details',
  ]).describe('What data this question targets'),
  assumption: z.string().nullable().default(null).describe('Optional assumption to confirm'),
  priority: z.enum(['high', 'medium', 'low']).describe('How critical this data is'),
});

const questionLLM = createClaudeAgent(questionSchema, 'generate_question', {
  temperature: 0.7,
  maxTokens: 300,
});

// ============================================================
// Phase Requirements (kept for gap identification)
// ============================================================

const PHASE_REQUIREMENTS: Record<ArtifactPhase, {
  required: string[];
  questions: string[];
}> = {
  context_diagram: {
    required: ['actors:1+', 'external_systems:1+ or none'],
    questions: [
      'Who are the main users of {projectName}?',
      'Will {projectName} integrate with any external systems or APIs?',
    ],
  },
  use_case_diagram: {
    required: ['actors:2+', 'use_cases:3+'],
    questions: [
      'What are the 3-5 main things a {actor} can do in {projectName}?',
      'Are there different user roles with different permissions?',
    ],
  },
  scope_tree: {
    required: ['in_scope:1+', 'out_scope:1+'],
    questions: [
      'What features are definitely IN scope for the first version?',
      'What is explicitly OUT of scope for now?',
    ],
  },
  ucbd: {
    required: ['preconditions', 'steps:3+', 'postconditions'],
    questions: [
      'For {useCase}, what must be true before a user can start?',
      'What are the main steps in {useCase}?',
    ],
  },
  requirements_table: {
    required: ['requirements:5+'],
    questions: [
      'What performance requirements does {projectName} have?',
      'Are there specific security requirements to consider?',
    ],
  },
  constants_table: {
    required: ['constants:1+'],
    questions: [
      'Are there any specific limits or thresholds (e.g., max users, timeout)?',
    ],
  },
  sysml_activity_diagram: {
    required: ['workflow_steps:3+', 'decision_points:1+'],
    questions: [
      'In {useCase}, are there any decision points or branches?',
    ],
  },
};

// ============================================================
// Main Node Function
// ============================================================

/**
 * Compute the next question using KB-driven collaborative flow.
 *
 * Strategy:
 * 1. Use KB-driven generator for educated guesses and gap probing
 * 2. Update KB step confidence and data tracking
 * 3. If confidence >80%, set approvalPending for generation proposal
 * 4. Falls back to legacy question generation on error
 *
 * @param state - Current intake state
 * @returns Partial state with pendingQuestion, kbStepConfidence, etc.
 */
export async function computeNextQuestion(
  state: IntakeState
): Promise<Partial<IntakeState>> {
  const gaps = identifyDataGaps(state);

  // No gaps - ready to generate artifact
  if (gaps.length === 0) {
    return {
      pendingQuestion: null,
      kbStepConfidence: 100,
    };
  }

  try {
    // Use the KB-driven generator
    const kbResult = await generateKBDrivenResponse(state);

    // Calculate deterministic confidence as a cross-check
    const deterministicConfidence = calculateStepConfidence(
      state.currentKBStep,
      state.extractedData
    );

    // Use the higher of LLM confidence and deterministic confidence
    const confidence = Math.max(kbResult.confidence, deterministicConfidence);

    // Build KB step data accumulator
    const updatedKBStepData: Record<string, unknown> = {
      ...state.kbStepData,
      lastGuesses: kbResult.guesses,
      lastGaps: kbResult.gaps,
      confidence,
    };

    return {
      pendingQuestion: kbResult.formattedResponse,
      kbStepConfidence: confidence,
      kbStepData: updatedKBStepData,
      approvalPending: kbResult.shouldProposeGeneration,
    };
  } catch (error) {
    console.error('KB question generation error, falling back to legacy:', error);
    return legacyComputeNextQuestion(state, gaps);
  }
}

// ============================================================
// Legacy Fallback
// ============================================================

/**
 * Legacy question generation as fallback.
 * Uses the original flat question bank approach.
 */
async function legacyComputeNextQuestion(
  state: IntakeState,
  gaps: string[]
): Promise<Partial<IntakeState>> {
  const phase = state.currentPhase;
  const data = state.extractedData;

  try {
    const result = await questionLLM.invoke(`
You are gathering PRD requirements for "${state.projectName}".

## Vision Statement:
${state.projectVision}

## Current Phase: ${phase}
## Completeness: ${state.completeness}%

## Data We Have:
- Actors (${data.actors.length}): ${data.actors.map(a => a.name).join(', ') || 'None'}
- Use Cases (${data.useCases.length}): ${data.useCases.map(uc => uc.name).join(', ') || 'None'}
- External Systems: ${data.systemBoundaries.external.join(', ') || 'None identified'}
- In Scope: ${data.systemBoundaries.internal.join(', ') || 'Not defined'}

## Data Gaps:
${gaps.map(g => `- ${g}`).join('\n')}

## CRITICAL RULES - INFER AGGRESSIVELY:
1. NEVER ask the same topic twice.
2. ALWAYS suggest specific placeholders based on the domain.
3. When suggesting, phrase it as CONFIRMATION not question.
4. If a gap could be inferred from vision, INFER IT and move to the NEXT topic.
5. Keep it brief (1-2 sentences max).

Generate a single response that SUGGESTS AND CONFIRMS, not asks open-ended.
`);

    let question = result.question;
    if (result.assumption) {
      question = `${result.assumption} ${question}`;
    }

    return { pendingQuestion: question };
  } catch (fallbackError) {
    console.error('Legacy question generation also failed:', fallbackError);

    const templates = PHASE_REQUIREMENTS[phase]?.questions || [];
    const fallbackQuestion = templates[0]
      ?.replace('{projectName}', state.projectName)
      ?.replace('{actor}', data.actors[0]?.name || 'user')
      ?.replace('{useCase}', data.useCases[0]?.name || 'the main workflow');

    return {
      pendingQuestion: fallbackQuestion || 'Can you tell me more about your project requirements?',
    };
  }
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Identify data gaps for current phase
 * Returns a list of human-readable gap descriptions
 */
export function identifyDataGaps(state: IntakeState): string[] {
  const gaps: string[] = [];
  const data = state.extractedData;
  const phase = state.currentPhase;

  switch (phase) {
    case 'context_diagram':
      if (data.actors.length < 1) {
        gaps.push('Need at least 1 actor (user, system, or external entity)');
      }
      if (data.systemBoundaries.external.length === 0) {
        gaps.push('Need to identify external systems (or confirm none exist)');
      }
      break;

    case 'use_case_diagram':
      if (data.actors.length < 2) {
        gaps.push(`Need at least 2 actors (have ${data.actors.length})`);
      }
      if (data.useCases.length < 3) {
        gaps.push(`Need at least 3 use cases (have ${data.useCases.length})`);
      }
      break;

    case 'scope_tree':
      if (data.systemBoundaries.internal.length === 0) {
        gaps.push('Need in-scope items defined');
      }
      break;

    case 'ucbd': {
      const hasPrePost = data.useCases.some(uc =>
        (uc.preconditions?.length ?? 0) > 0 && (uc.postconditions?.length ?? 0) > 0
      );
      if (!hasPrePost) {
        gaps.push('Need preconditions and postconditions for at least one use case');
      }
      const hasSteps = data.useCases.some(uc =>
        uc.description && uc.description.length > 50
      );
      if (!hasSteps) {
        gaps.push('Need detailed workflow steps for at least one use case');
      }
      break;
    }

    case 'requirements_table':
      if (data.useCases.length < 5) {
        gaps.push(`Need at least 5 use cases for requirements derivation (have ${data.useCases.length})`);
      }
      break;

    case 'constants_table':
      break;

    case 'sysml_activity_diagram':
      if (data.useCases.length < 3) {
        gaps.push(`Need at least 3 use cases for activity diagram (have ${data.useCases.length})`);
      }
      break;

    default:
      break;
  }

  return gaps;
}

/**
 * Get the most critical gap for prioritization
 */
export function getMostCriticalGap(gaps: string[]): string | null {
  if (gaps.length === 0) return null;

  const priorityOrder = ['actor', 'use case', 'external', 'scope'];
  for (const priority of priorityOrder) {
    const match = gaps.find(g => g.toLowerCase().includes(priority));
    if (match) return match;
  }

  return gaps[0];
}
