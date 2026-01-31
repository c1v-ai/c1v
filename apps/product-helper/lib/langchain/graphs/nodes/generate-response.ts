/**
 * Generate Response Node
 *
 * Purpose: Generate the streaming response to send back to user.
 * Creates contextual, conversational AI messages based on current state.
 * Enhanced with knowledge bank education blocks for collaborative flow.
 *
 * Team: AI/Agent Engineering (Agent 3.1: LangChain Integration Engineer)
 *
 * @module graphs/nodes/generate-response
 */

import { streamingLLM } from '../../config';
import { AIMessage } from '@langchain/core/messages';
import { IntakeState, getPhaseDisplayName } from '../types';
import { buildPromptEducationBlock } from '@/lib/education/phase-mapping';
import { knowledgeBank, getTooltipTermsForStep } from '@/lib/education/knowledge-bank';

// ============================================================
// LLM Configuration
// ============================================================

/**
 * LLM for conversational responses
 * Uses Claude Sonnet via central config with streaming enabled
 */
const responseLLM = streamingLLM;

// ============================================================
// Main Node Function
// ============================================================

/**
 * Generate conversational response based on current state.
 *
 * Response types:
 * 1. KB-driven educated guesses (if pendingQuestion contains KB response)
 * 2. Approval proposal (if approvalPending is true)
 * 3. Acknowledge info and ask follow-up
 * 4. Announce artifact generation
 * 5. Provide status update
 *
 * @param state - Current intake state
 * @returns Partial state with AI message added
 */
export async function generateResponse(
  state: IntakeState
): Promise<Partial<IntakeState>> {
  const { pendingQuestion, pendingArtifact, lastIntent, completeness, currentPhase } = state;

  // If artifact was generated, it already has a message
  if (pendingArtifact) {
    return {};
  }

  // If we have a pending question/response (from KB generator), use it directly
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
 * Build prompt for response generation with KB education context.
 */
function buildResponsePrompt(state: IntakeState): string {
  const {
    projectName,
    completeness,
    currentPhase,
    lastIntent,
    extractedData,
    validationResult,
    currentKBStep,
    kbStepConfidence,
    approvalPending,
  } = state;
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

  // Build KB education context
  const educationBlock = buildPromptEducationBlock(currentPhase);
  const kbEntry = knowledgeBank[currentKBStep];

  // Build tooltip terms block for current step
  const tooltipTerms = getTooltipTermsForStep(currentKBStep);
  const tooltipBlock = tooltipTerms.length > 0
    ? `
## Key Terms
When mentioning these terms, you may explain them briefly:
${tooltipTerms.map(t => `- **${t.term}**: ${t.definition}`).join('\n')}`
    : '';

  // Build approval context
  let approvalContext = '';
  if (approvalPending) {
    approvalContext = `
## IMPORTANT: Approval Pending
You should propose generating the ${kbEntry.label} artifact.
The confidence is at ${kbStepConfidence}%.
Ask: "I have enough information to generate your ${kbEntry.label}. This will use AI tokens. Should I proceed?"
`;
  }

  return `You are a PRD assistant for "${projectName}", following the Knowledge Bank methodology.
You are currently on the "${kbEntry.label}" step.

## Current Status
- Completeness: ${completeness}%
- Current Phase: ${displayPhase}
- KB Step: ${kbEntry.label}
- KB Confidence: ${kbStepConfidence}%
- Last User Intent: ${lastIntent}

## Data Collected
${dataSummary}
${validationContext}

${educationBlock}
${tooltipBlock}
${approvalContext}

## Response Guidelines
1. Be brief (1-3 sentences max)
2. Acknowledge what user provided if they gave info
3. Use the educated guess format: checkmark for confident, ? for uncertain
4. If confidence > 80%, propose artifact generation
5. Don't ask multiple questions - focus on the most critical gap
6. Incorporate educational tips naturally (don't lecture)
7. Be encouraging but not overly positive
8. Focus on progress and next steps

## Response Tone
- Collaborative: "Here's what I'm seeing..." not "Tell me about..."
- Educational: Naturally weave in key terms and tips
- Action-oriented: Move the conversation forward

## What to Include Based on Intent
- PROVIDE_INFO: Acknowledge, update guesses, show progress
- CONFIRM: Thank them, note confirmed items, move to next gap or propose generation
- DENY: Accept correction, adjust guesses, re-probe
- ASK_QUESTION: Answer using educational context, then redirect to current step
- EDIT_DATA: Confirm the edit, update relevant guesses
- UNKNOWN: Gently guide back to the current KB step

Generate a natural, brief response that moves the conversation forward:`;
}

/**
 * Generate a progress update message
 */
export function generateProgressUpdate(state: IntakeState): string {
  const { completeness, currentPhase, extractedData, generatedArtifacts, currentKBStep, kbStepConfidence } = state;
  const displayPhase = getPhaseDisplayName(currentPhase);
  const kbEntry = knowledgeBank[currentKBStep];

  const lines: string[] = [];

  lines.push(`**Progress: ${completeness}%**`);
  lines.push(`Working on: ${displayPhase} (${kbEntry.label})`);
  lines.push(`Step confidence: ${kbStepConfidence}%`);

  if (extractedData.actors.length > 0) {
    lines.push(`Actors identified: ${extractedData.actors.map(a => a.name).join(', ')}`);
  }
  if (extractedData.useCases.length > 0) {
    lines.push(`Use cases: ${extractedData.useCases.length} defined`);
  }
  if (extractedData.systemBoundaries.external.length > 0) {
    lines.push(`External systems: ${extractedData.systemBoundaries.external.join(', ')}`);
  }
  if (generatedArtifacts.length > 0) {
    lines.push(`Artifacts generated: ${generatedArtifacts.map(a => getPhaseDisplayName(a)).join(', ')}`);
  }

  return lines.join('\n');
}

/**
 * Generate an acknowledgment message
 */
export function generateAcknowledgment(extractedInfo: string, completeness: number): string {
  const messages = [
    `Got it! I've noted ${extractedInfo}.`,
    `Perfect, I've captured ${extractedInfo}.`,
    `Thanks! ${extractedInfo} is now recorded.`,
    `Understood. ${extractedInfo} added to the requirements.`,
  ];

  const message = messages[Math.floor(Math.random() * messages.length)];

  if (completeness >= 80) {
    return `${message} We're at ${completeness}% - almost ready to generate your next artifact!`;
  } else if (completeness >= 50) {
    return `${message} Good progress at ${completeness}%.`;
  }

  return message;
}

/**
 * Generate a clarification request
 */
export function generateClarificationRequest(topic: string): string {
  return `I want to make sure I understand correctly about ${topic}. Could you clarify?`;
}
