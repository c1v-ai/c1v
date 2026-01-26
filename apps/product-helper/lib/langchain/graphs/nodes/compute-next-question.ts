/**
 * Compute Next Question Node
 *
 * Purpose: Generate the next question to ask the user based on data gaps.
 * Uses structured requirements methodology for targeted questioning.
 *
 * Team: AI/Agent Engineering (Agent 3.1: LangChain Integration Engineer)
 *
 * @module graphs/nodes/compute-next-question
 */

import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { IntakeState, ArtifactPhase } from '../types';

// ============================================================
// Schema Definition
// ============================================================

/**
 * Schema for question generation output
 * Ensures structured, actionable questions
 */
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

type QuestionOutput = z.infer<typeof questionSchema>;

// ============================================================
// LLM Configuration
// ============================================================

/**
 * LLM for question generation
 * Uses GPT-4o with temperature 0.7 for natural, varied questions
 */
const questionLLM = new ChatOpenAI({
  modelName: 'gpt-4o',
  temperature: 0.7, // Some creativity for natural questions
  maxTokens: 300,
}).withStructuredOutput(questionSchema, {
  name: 'generate_question',
});

// ============================================================
// Phase Requirements
// ============================================================

/**
 * Data gaps and template questions by artifact phase
 * Based on structured requirements methodology
 */
const PHASE_REQUIREMENTS: Record<ArtifactPhase, {
  required: string[];
  questions: string[];
}> = {
  context_diagram: {
    required: ['actors:1+', 'external_systems:1+ or none'],
    questions: [
      'Who are the main users of {projectName}?',
      'Will {projectName} integrate with any external systems or APIs?',
      'What external systems or people interact with {projectName}?',
    ],
  },
  use_case_diagram: {
    required: ['actors:2+', 'use_cases:3+'],
    questions: [
      'What are the 3-5 main things a {actor} can do in {projectName}?',
      'Are there different user roles with different permissions?',
      'What does {actor} expect to be able to do with the system?',
    ],
  },
  scope_tree: {
    required: ['in_scope:1+', 'out_scope:1+'],
    questions: [
      'What features are definitely IN scope for the first version?',
      'What is explicitly OUT of scope for now?',
      'Are there any features to exclude from the initial release?',
    ],
  },
  ucbd: {
    required: ['preconditions', 'steps:3+', 'postconditions'],
    questions: [
      'For {useCase}, what must be true before a user can start?',
      'What are the main steps in {useCase}?',
      'What conditions must be true after {useCase} completes successfully?',
    ],
  },
  requirements_table: {
    required: ['requirements:5+'],
    questions: [
      'What performance requirements does {projectName} have?',
      'Are there specific security requirements to consider?',
      'What are the key business rules that must be enforced?',
    ],
  },
  constants_table: {
    required: ['constants:1+'],
    questions: [
      'Are there any specific limits or thresholds (e.g., max users, timeout)?',
      'What configuration values should be adjustable in {projectName}?',
    ],
  },
  sysml_activity_diagram: {
    required: ['workflow_steps:3+', 'decision_points:1+'],
    questions: [
      'In {useCase}, are there any decision points or branches?',
      'What happens if something goes wrong during {useCase}?',
    ],
  },
};

// ============================================================
// Main Node Function
// ============================================================

/**
 * Compute the next question to ask based on current data gaps
 *
 * Strategy:
 * 1. Identify what data is missing for current phase
 * 2. Generate a single, focused question using LLM
 * 3. Prefer inference + confirmation over open-ended questions
 *
 * @param state - Current intake state
 * @returns Partial state with pendingQuestion set
 *
 * @example
 * // When actors are missing:
 * { pendingQuestion: "Who are the main users of Task Manager?" }
 *
 * @example
 * // When all data is present:
 * { pendingQuestion: null }
 */
export async function computeNextQuestion(
  state: IntakeState
): Promise<Partial<IntakeState>> {
  const phase = state.currentPhase;
  const data = state.extractedData;

  // Build context about what's missing
  const gaps = identifyDataGaps(state);

  // No gaps - ready to generate artifact
  if (gaps.length === 0) {
    return { pendingQuestion: null };
  }

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
1. NEVER ask the same topic twice. If we already discussed external systems, MOVE ON.
2. ALWAYS suggest specific placeholders based on the domain:
   - For meal/nutrition apps: "USDA FoodData Central API", "Google Vision API", "Nutritionix API"
   - For e-commerce: "Stripe", "PayPal", "Shipping API"
   - For auth: "OAuth provider", "Email service"
3. When suggesting, phrase it as CONFIRMATION not question:
   - GOOD: "I'll use [Nutritionix API] for nutrition data and [Cloud Vision] for image recognition as placeholders. Sound good?"
   - BAD: "What external systems will you use?"
4. If a gap could be inferred from vision, INFER IT and move to the NEXT topic.
5. Keep it brief (1-2 sentences max).
6. Move to the NEXT data gap if current topic was already addressed.

## What to do:
- If external_systems gap: Suggest 2-3 relevant APIs based on the vision, don't ask open-ended
- If actors gap: Suggest likely user types, don't ask open-ended
- If use_cases gap: Suggest 3-5 features based on vision, ask user to confirm

Generate a single response that SUGGESTS AND CONFIRMS, not asks open-ended.
`);

    let question = result.question;

    // Add assumption if provided (structured methodology: infer then confirm)
    if (result.assumption) {
      question = `${result.assumption} ${question}`;
    }

    return {
      pendingQuestion: question,
    };
  } catch (error) {
    console.error('Question generation error:', error);

    // Fallback to template question
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
 *
 * @param state - Current intake state
 * @returns Array of gap descriptions
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
      // Check for actor-use case links
      const linkedUseCases = data.useCases.filter(uc => uc.actor && uc.actor.trim().length > 0);
      if (linkedUseCases.length < data.useCases.length) {
        gaps.push('Some use cases need to be linked to actors');
      }
      break;

    case 'scope_tree':
      if (data.systemBoundaries.internal.length === 0) {
        gaps.push('Need in-scope items defined');
      }
      // Note: out-of-scope is often not explicitly tracked in ExtractionResult
      break;

    case 'ucbd':
      const hasPrePost = data.useCases.some(uc =>
        (uc.preconditions?.length ?? 0) > 0 && (uc.postconditions?.length ?? 0) > 0
      );
      if (!hasPrePost) {
        gaps.push('Need preconditions and postconditions for at least one use case');
      }
      // Check for step-like data in descriptions
      const hasSteps = data.useCases.some(uc =>
        uc.description && uc.description.length > 50
      );
      if (!hasSteps) {
        gaps.push('Need detailed workflow steps for at least one use case');
      }
      break;

    case 'requirements_table':
      if (data.useCases.length < 5) {
        gaps.push(`Need at least 5 use cases for requirements derivation (have ${data.useCases.length})`);
      }
      break;

    case 'constants_table':
      // Constants can always be inferred - minimal gaps
      break;

    case 'sysml_activity_diagram':
      // Activity diagrams can be generated from use cases - minimal gaps
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
 *
 * @param gaps - Array of gap descriptions
 * @returns The most critical gap or null if none
 */
export function getMostCriticalGap(gaps: string[]): string | null {
  if (gaps.length === 0) {
    return null;
  }

  // Prioritize: actors > use cases > external systems > scope > other
  const priorityOrder = ['actor', 'use case', 'external', 'scope'];

  for (const priority of priorityOrder) {
    const match = gaps.find(g => g.toLowerCase().includes(priority));
    if (match) {
      return match;
    }
  }

  return gaps[0];
}
