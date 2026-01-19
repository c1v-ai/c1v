/**
 * Generate Response Node
 *
 * Purpose: Generate the streaming response to send back to user.
 * Creates contextual, conversational AI messages based on current state.
 *
 * Team: AI/Agent Engineering (Agent 3.1: LangChain Integration Engineer)
 *
 * @module graphs/nodes/generate-response
 */

import { ChatOpenAI } from '@langchain/openai';
import { AIMessage } from '@langchain/core/messages';
import { IntakeState, getPhaseDisplayName } from '../types';

// ============================================================
// LLM Configuration
// ============================================================

/**
 * LLM for conversational responses
 * Uses GPT-4o with temperature 0.7 for natural conversation
 * Streaming enabled for real-time feedback
 */
const responseLLM = new ChatOpenAI({
  modelName: 'gpt-4o',
  temperature: 0.7, // Natural conversation
  maxTokens: 500,
  streaming: true,
});

// ============================================================
// Main Node Function
// ============================================================

/**
 * Generate conversational response based on current state
 *
 * Response types:
 * 1. Ask pending question (if set by compute_next_question)
 * 2. Confirm assumption
 * 3. Acknowledge info and ask follow-up
 * 4. Announce artifact generation
 * 5. Provide status update
 *
 * @param state - Current intake state
 * @returns Partial state with AI message added
 *
 * @example
 * // When pendingQuestion is set:
 * { messages: [AIMessage: "Who are the main users of Task Manager?"] }
 *
 * @example
 * // When artifact was generated:
 * { } // No additional message needed, artifact node added it
 */
export async function generateResponse(
  state: IntakeState
): Promise<Partial<IntakeState>> {
  const { pendingQuestion, pendingArtifact, lastIntent, completeness, currentPhase } = state;

  // If artifact was generated, it already has a message
  if (pendingArtifact) {
    return {};
  }

  // If we have a pending question, ask it
  if (pendingQuestion) {
    const aiMessage = new AIMessage(pendingQuestion);
    return {
      messages: [aiMessage],
      pendingQuestion: null, // Clear after asking
    };
  }

  // Generate contextual response based on state
  try {
    const prompt = buildResponsePrompt(state);
    const response = await responseLLM.invoke(prompt);
    const content = response.content as string;

    const aiMessage = new AIMessage(content);
    return {
      messages: [aiMessage],
    };
  } catch (error) {
    console.error('Response generation error:', error);

    // Fallback message
    const fallback = new AIMessage(
      `Got it! We're at ${completeness}% completeness for ${getPhaseDisplayName(currentPhase)}. Let me know if you have more details to add.`
    );
    return {
      messages: [fallback],
    };
  }
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Build prompt for response generation
 * Creates context-aware instructions for the LLM
 *
 * @param state - Current intake state
 * @returns Formatted prompt string
 */
function buildResponsePrompt(state: IntakeState): string {
  const { projectName, completeness, currentPhase, lastIntent, extractedData, validationResult } = state;
  const displayPhase = getPhaseDisplayName(currentPhase);

  // Build data summary
  const dataSummary = [
    `Actors: ${extractedData.actors.length} (${extractedData.actors.map(a => a.name).join(', ') || 'none'})`,
    `Use Cases: ${extractedData.useCases.length}`,
    `External Systems: ${extractedData.systemBoundaries.external.length}`,
    `In-Scope Items: ${extractedData.systemBoundaries.internal.length}`,
  ].join('\n');

  // Build validation context if available
  let validationContext = '';
  if (validationResult) {
    validationContext = `
## Validation Status
- Score: ${validationResult.score}%
- Passed: ${validationResult.passed} checks
- Failed: ${validationResult.failed} checks
${validationResult.errors.length > 0 ? `- Errors: ${validationResult.errors.join(', ')}` : ''}`;
  }

  return `You are a PRD assistant for "${projectName}".

## Current Status
- Completeness: ${completeness}%
- Current Phase: ${displayPhase}
- Last User Intent: ${lastIntent}

## Data Collected
${dataSummary}
${validationContext}

## Response Guidelines
1. Be brief (1-3 sentences max)
2. Acknowledge what user provided if they gave info
3. If close to artifact generation (completeness > 80%), mention it
4. Don't ask multiple questions - the question node handles that
5. Be encouraging but not overly positive
6. Focus on progress and next steps

## Response Tone
- Conversational but professional
- Action-oriented
- Respectful of user's time

## What to Include Based on Intent
- PROVIDE_INFO: Acknowledge, summarize key points, show progress
- CONFIRM: Thank them, note what was confirmed
- DENY: Accept correction, ask clarifying question
- ASK_QUESTION: Answer directly if you can, otherwise redirect
- EDIT_DATA: Confirm the edit was understood
- UNKNOWN: Ask for clarification gently

Generate a natural, brief response that moves the conversation forward:`;
}

/**
 * Generate a progress update message
 * Used when user asks about status or completeness
 *
 * @param state - Current intake state
 * @returns Progress update string
 */
export function generateProgressUpdate(state: IntakeState): string {
  const { completeness, currentPhase, extractedData, generatedArtifacts } = state;
  const displayPhase = getPhaseDisplayName(currentPhase);

  const lines: string[] = [];

  // Overall progress
  lines.push(`**Progress: ${completeness}%**`);

  // Current phase
  lines.push(`Working on: ${displayPhase}`);

  // Data summary
  if (extractedData.actors.length > 0) {
    lines.push(`Actors identified: ${extractedData.actors.map(a => a.name).join(', ')}`);
  }
  if (extractedData.useCases.length > 0) {
    lines.push(`Use cases: ${extractedData.useCases.length} defined`);
  }
  if (extractedData.systemBoundaries.external.length > 0) {
    lines.push(`External systems: ${extractedData.systemBoundaries.external.join(', ')}`);
  }

  // Generated artifacts
  if (generatedArtifacts.length > 0) {
    lines.push(`Artifacts generated: ${generatedArtifacts.map(a => getPhaseDisplayName(a)).join(', ')}`);
  }

  return lines.join('\n');
}

/**
 * Generate an acknowledgment message
 * Used when user provides information
 *
 * @param extractedInfo - Brief description of what was extracted
 * @param completeness - Current completeness percentage
 * @returns Acknowledgment string
 */
export function generateAcknowledgment(extractedInfo: string, completeness: number): string {
  const messages = [
    `Got it! I've noted ${extractedInfo}.`,
    `Perfect, I've captured ${extractedInfo}.`,
    `Thanks! ${extractedInfo} is now recorded.`,
    `Understood. ${extractedInfo} added to the requirements.`,
  ];

  // Pick a random message for variety
  const message = messages[Math.floor(Math.random() * messages.length)];

  // Add progress if notable
  if (completeness >= 80) {
    return `${message} We're at ${completeness}% - almost ready to generate your next artifact!`;
  } else if (completeness >= 50) {
    return `${message} Good progress at ${completeness}%.`;
  }

  return message;
}

/**
 * Generate a clarification request
 * Used when user input is unclear
 *
 * @param topic - What needs clarification
 * @returns Clarification request string
 */
export function generateClarificationRequest(topic: string): string {
  return `I want to make sure I understand correctly about ${topic}. Could you clarify?`;
}
