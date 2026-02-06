/**
 * Analyze Response Node
 *
 * Purpose: Analyze user's message to detect intent and extract key signals.
 * This node is the entry point for each user turn in the intake graph.
 *
 * Team: AI/Agent Engineering (Agent 3.1: LangChain Integration Engineer)
 *
 * @module graphs/nodes/analyze-response
 */

import { createClaudeAgent } from '../../config';
import { z } from 'zod';
import {
  IntakeState,
  UserIntent,
  STOP_TRIGGER_KEYWORDS,
  containsStopTrigger,
} from '../types';
import { getLastMessage, getMessageContent } from '../utils';
import { isHumanMessage } from '../../message-utils';

// ============================================================
// Schema Definition
// ============================================================

/**
 * Schema for intent analysis output
 * Used with structured output to ensure consistent classification
 */
const intentAnalysisSchema = z.object({
  intent: z.enum([
    'PROVIDE_INFO',
    'ASK_QUESTION',
    'STOP_TRIGGER',
    'CONFIRM',
    'DENY',
    'REQUEST_ARTIFACT',
    'EDIT_DATA',
    'UNKNOWN',
  ]).describe('Primary intent of the user message'),

  confidence: z.number().min(0).max(1).describe('Confidence score 0-1'),

  extractedEntities: z.object({
    actors: z.array(z.string()).nullable().default(null),
    useCases: z.array(z.string()).nullable().default(null),
    externalSystems: z.array(z.string()).nullable().default(null),
    scopeItems: z.array(z.string()).nullable().default(null),
  }).nullable().default(null).describe('Quick entity extraction from message'),

  stopTriggerDetected: z.boolean().describe('Whether stop words detected'),

  reasoning: z.string().describe('Brief explanation of intent classification'),
});

type IntentAnalysis = z.infer<typeof intentAnalysisSchema>;

// ============================================================
// LLM Configuration
// ============================================================

/**
 * LLM for intent analysis
 * Uses Claude Sonnet via central config for consistent classification
 */
const intentLLM = createClaudeAgent(intentAnalysisSchema, 'analyze_intent', {
  temperature: 0.2,
  maxTokens: 500,
});

// ============================================================
// Main Node Function
// ============================================================

/**
 * Analyze user response to determine intent and extract quick signals
 *
 * This node:
 * 1. Checks for stop triggers (fast path)
 * 2. Uses LLM to classify intent if not obvious
 * 3. Extracts quick entity mentions for early data capture
 * 4. Returns intent and updated turn count
 *
 * @param state - Current intake state
 * @returns Partial state update with lastIntent and any quick extractions
 *
 * @example
 * Input: "There are admins and regular users. Nope, no external systems."
 * Output: { lastIntent: 'STOP_TRIGGER', turnCount: 6 }
 *
 * @example
 * Input: "The app should allow users to create tasks and assign them to team members"
 * Output: { lastIntent: 'PROVIDE_INFO', turnCount: 6, extractedData: { ... } }
 */
export async function analyzeResponse(
  state: IntakeState
): Promise<Partial<IntakeState>> {
  const lastMessage = getLastMessage(state.messages);

  // Guard: No message or not a human message (defensive check for Turbopack)
  if (!lastMessage || !isHumanMessage(lastMessage)) {
    return { lastIntent: 'UNKNOWN' };
  }

  const userText = getMessageContent(lastMessage);

  // Fast path: If approval was pending and user confirms, route to artifact generation
  if (state.approvalPending) {
    const isConfirmation = /^(yes|yeah|sure|ok|okay|proceed|go ahead|do it|generate|let's go|yep|yup)\b/i.test(userText.trim());
    if (isConfirmation) {
      return {
        lastIntent: 'REQUEST_ARTIFACT',
        approvalPending: false,
        turnCount: state.turnCount + 1,
      };
    }
    // User declined or provided more info — clear approval and continue
    return {
      lastIntent: 'PROVIDE_INFO',
      approvalPending: false,
      turnCount: state.turnCount + 1,
    };
  }

  // Fast path: Check for stop triggers before LLM call
  const hasStopTrigger = containsStopTrigger(userText);

  // If clear stop trigger with short/medium message, skip LLM analysis
  if (hasStopTrigger && userText.length < 120) {
    return {
      lastIntent: 'STOP_TRIGGER',
      turnCount: state.turnCount + 1,
    };
  }

  try {
    // Use LLM for more nuanced intent analysis
    const analysis = await intentLLM.invoke(`
Analyze this user message in the context of a PRD intake conversation.

## Project Vision:
${state.projectVision}

## Current Phase: ${state.currentPhase}
## Completeness: ${state.completeness}%
## Last Question Asked: ${state.pendingQuestion || 'N/A'}

## User Message:
"${userText}"

## Stop Trigger Words:
${STOP_TRIGGER_KEYWORDS.join(', ')}

## CRITICAL: Handle Confirmations
If user says "yes", "sure", "yeah", "correct", "ok" (short confirmatory responses):
1. Mark intent as CONFIRM
2. INFER entities based on what the last question was about AND the project vision:
   - If question was about external systems for meal/nutrition app → infer ["USDA FoodData API", "Google Cloud Vision API", "Nutritionix API"]
   - If question was about actors → infer common actors like ["User", "Admin"] based on domain
   - If question was about integrations/payments → infer ["Stripe", "PayPal"]
3. Put inferred entities in extractedEntities field

DO NOT leave extractedEntities empty when user confirms a topic. INFER reasonable defaults.

Determine the user's intent and extract any mentioned entities (or INFER if confirming).
If the message contains stop triggers along with other info, prioritize STOP_TRIGGER intent.
`);

    // Merge quick extractions into state if present
    let updatedData = state.extractedData;
    if (analysis.extractedEntities) {
      const { actors, useCases, externalSystems, scopeItems } = analysis.extractedEntities;

      // Quick-add actors if detected
      if (actors?.length) {
        const existingActorNames = new Set(updatedData.actors.map(a => a.name.toLowerCase()));
        const newActors = actors
          .filter((name: string) => !existingActorNames.has(name.toLowerCase()))
          .map((name: string) => ({
            name,
            role: 'To be determined',
            description: `Actor mentioned: ${name}`,
          }));

        if (newActors.length > 0) {
          updatedData = {
            ...updatedData,
            actors: [...updatedData.actors, ...newActors],
          };
        }
      }

      // Quick-add external systems if detected
      if (externalSystems?.length) {
        const existingExternal = new Set(
          updatedData.systemBoundaries.external.map(s => s.toLowerCase())
        );
        const newExternal = externalSystems.filter(
          (s: string) => !existingExternal.has(s.toLowerCase())
        );

        if (newExternal.length > 0) {
          updatedData = {
            ...updatedData,
            systemBoundaries: {
              ...updatedData.systemBoundaries,
              external: [...updatedData.systemBoundaries.external, ...newExternal],
            },
          };
        }
      }

      // Quick-add scope items if detected
      if (scopeItems?.length) {
        const existingInternal = new Set(
          updatedData.systemBoundaries.internal.map(s => s.toLowerCase())
        );
        const newInternal = scopeItems.filter(
          (s: string) => !existingInternal.has(s.toLowerCase())
        );

        if (newInternal.length > 0) {
          updatedData = {
            ...updatedData,
            systemBoundaries: {
              ...updatedData.systemBoundaries,
              internal: [...updatedData.systemBoundaries.internal, ...newInternal],
            },
          };
        }
      }
    }

    // Determine final intent (prioritize stop trigger if detected)
    const finalIntent: UserIntent = analysis.stopTriggerDetected
      ? 'STOP_TRIGGER'
      : analysis.intent;

    return {
      lastIntent: finalIntent,
      extractedData: updatedData,
      turnCount: state.turnCount + 1,
    };
  } catch (error) {
    console.error('Intent analysis error:', error);

    // Fallback: Use simple heuristics
    return {
      lastIntent: hasStopTrigger ? 'STOP_TRIGGER' : 'PROVIDE_INFO',
      turnCount: state.turnCount + 1,
    };
  }
}
