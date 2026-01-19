/**
 * Completion Detector
 *
 * Determines when the intake conversation should stop and what action
 * to take next (generate artifact, ask more questions, or complete).
 *
 * @module intake/completion-detector
 * @team AI/Agent Engineering (Agent 3.1: LangChain Integration Engineer)
 */

import { type IntakeState } from './state';
import { IntakeStateManager } from './state-manager';

/**
 * Result of completion analysis
 */
export interface CompletionResult {
  /** Whether intake should stop */
  shouldStop: boolean;

  /** Reason for the decision */
  reason: string;

  /** What to do next */
  nextAction: 'generate_artifact' | 'ask_question' | 'complete_intake';

  /** If generating, which artifact to generate */
  artifactToGenerate?: string;
}

/**
 * Phrases that indicate the user wants to stop answering questions
 */
const STOP_PHRASES = [
  /^no(pe)?\.?$/i,
  /^that'?s (enough|it|all)\.?$/i,
  /^done\.?$/i,
  /^move on\.?$/i,
  /^let'?s (see|proceed|continue|generate)\.?$/i,
  /^nothing (else|more)\.?$/i,
  /^skip\.?$/i,
  /^next\.?$/i,
  /i('m| am) (done|finished|good)\.?$/i,
  /^stop( asking)?\.?$/i,
  /^enough( questions)?\.?$/i,
  /that'?s (everything|all i (have|know|can think of))\.?$/i,
];

/**
 * Phrases that indicate the user wants to see/generate an artifact
 */
const GENERATE_PHRASES = [
  /show (me|it)\.?$/i,
  /generate (it|the|a)?\s*(diagram|artifact)?\.?$/i,
  /create (it|the|a)?\s*(diagram|artifact)?\.?$/i,
  /let'?s see (it|the|what we have)\.?$/i,
  /what does (it|the diagram) look like/i,
  /can (i|you) see (the|a)?\s*(diagram|preview|artifact)/i,
  /show (me )?(the )?(current )?(diagram|context|use case)/i,
];

/**
 * Artifact generation order (priority order)
 */
const ARTIFACT_PRIORITY = [
  'context_diagram',
  'use_case_diagram',
  'scope_tree',
  'ucbd',
  'requirements_table',
  'constants_table',
  'sysml_activity_diagram',
];

/**
 * Validation score threshold for completion (95%)
 */
const VALIDATION_THRESHOLD = 95;

/**
 * Maximum messages before forcing progress check
 */
const MAX_MESSAGES_WITHOUT_PROGRESS = 30;

/**
 * CompletionDetector
 *
 * Analyzes user messages and intake state to determine when
 * to stop asking questions and what to do next.
 */
export class CompletionDetector {
  private stateManager: IntakeStateManager;

  /**
   * Create a new CompletionDetector
   * @param stateManager - IntakeStateManager to analyze
   */
  constructor(stateManager: IntakeStateManager) {
    this.stateManager = stateManager;
  }

  /**
   * Analyze if intake should stop based on user message and state
   * @param userMessage - Latest message from the user
   * @returns Completion analysis result
   */
  analyze(userMessage: string): CompletionResult {
    const state = this.stateManager.getState();
    const trimmedMessage = userMessage.trim();

    // Check 1: Explicit stop phrase
    const isStopPhrase = STOP_PHRASES.some(p => p.test(trimmedMessage));
    if (isStopPhrase) {
      return this.handleStopRequest(state, 'User requested stop');
    }

    // Check 2: Generate request
    const isGenerateRequest = GENERATE_PHRASES.some(p => p.test(trimmedMessage));
    if (isGenerateRequest) {
      const nextArtifact = this.getNextGenerableArtifact(state);
      if (nextArtifact) {
        return {
          shouldStop: true,
          reason: 'User requested artifact generation',
          nextAction: 'generate_artifact',
          artifactToGenerate: nextArtifact,
        };
      }
      // No artifact ready - inform user and continue
      return {
        shouldStop: false,
        reason: 'User requested generation but no artifact is ready yet',
        nextAction: 'ask_question',
      };
    }

    // Check 3: Validation score threshold reached
    if (state.validationStatus.overallScore >= VALIDATION_THRESHOLD) {
      return {
        shouldStop: true,
        reason: `Validation threshold (${VALIDATION_THRESHOLD}%) reached`,
        nextAction: 'complete_intake',
      };
    }

    // Check 4: All questions have been asked
    const remainingQuestions = this.stateManager.getUnansweredQuestions();
    if (remainingQuestions.length === 0) {
      return {
        shouldStop: true,
        reason: 'All questions have been asked',
        nextAction: 'complete_intake',
      };
    }

    // Check 5: Too many messages without progress
    if (
      state.messageCount > MAX_MESSAGES_WITHOUT_PROGRESS &&
      state.validationStatus.overallScore < 50
    ) {
      return {
        shouldStop: true,
        reason: 'Extended conversation without sufficient progress',
        nextAction: 'generate_artifact',
        artifactToGenerate: this.getNextGenerableArtifact(state) || 'context_diagram',
      };
    }

    // Check 6: User has explicitly requested stop previously
    if (state.userRequestedStop) {
      return {
        shouldStop: true,
        reason: state.stopReason || 'User previously requested stop',
        nextAction: 'generate_artifact',
        artifactToGenerate: this.getNextGenerableArtifact(state) || 'context_diagram',
      };
    }

    // Continue asking questions
    return {
      shouldStop: false,
      reason: 'More questions available',
      nextAction: 'ask_question',
    };
  }

  /**
   * Handle a stop request from the user
   * @param state - Current intake state
   * @param reason - Reason for stop
   * @returns Completion result
   */
  handleStopRequest(state: IntakeState, reason: string): CompletionResult {
    // Mark the stop in state manager
    this.stateManager.setUserStop(reason);

    // Find the best artifact to generate
    const nextArtifact = this.getNextGenerableArtifact(state);

    if (nextArtifact) {
      return {
        shouldStop: true,
        reason,
        nextAction: 'generate_artifact',
        artifactToGenerate: nextArtifact,
      };
    }

    // Check if we have any data at all
    const hasAnyData =
      state.extractedData.actors.length > 0 ||
      state.extractedData.useCases.length > 0 ||
      state.extractedData.systemBoundaries.external.length > 0;

    if (hasAnyData) {
      // Have some data but no artifact fully ready
      // Generate context diagram anyway (most basic)
      return {
        shouldStop: true,
        reason: `${reason} - generating partial diagram`,
        nextAction: 'generate_artifact',
        artifactToGenerate: 'context_diagram',
      };
    }

    // No data at all - need to continue
    return {
      shouldStop: false,
      reason: 'Stop requested but insufficient data for any artifact',
      nextAction: 'ask_question',
    };
  }

  /**
   * Get the next artifact that is ready to generate
   * @param state - Current intake state
   * @returns Artifact type or null if none ready
   */
  getNextGenerableArtifact(state: IntakeState): string | null {
    // First, find artifacts that are ready but not generated
    for (const artifact of ARTIFACT_PRIORITY) {
      const status = state.artifactReadiness[artifact];
      if (status && status.ready && !status.generated) {
        return artifact;
      }
    }

    // If nothing fully ready, find first incomplete artifact
    for (const artifact of ARTIFACT_PRIORITY) {
      const status = state.artifactReadiness[artifact];
      if (status && !status.generated) {
        return artifact;
      }
    }

    return null;
  }

  /**
   * Get all artifacts that are ready to generate
   * @param state - Current intake state (optional, uses manager state if not provided)
   * @returns Array of artifact types
   */
  getReadyArtifacts(state?: IntakeState): string[] {
    const s = state || this.stateManager.getState();
    const ready: string[] = [];

    for (const artifact of ARTIFACT_PRIORITY) {
      const status = s.artifactReadiness[artifact];
      if (status && status.ready && !status.generated) {
        ready.push(artifact);
      }
    }

    return ready;
  }

  /**
   * Check if the intake is considered complete
   * @returns True if intake is complete
   */
  isIntakeComplete(): boolean {
    const state = this.stateManager.getState();

    // Complete if validation threshold reached
    if (state.validationStatus.overallScore >= VALIDATION_THRESHOLD) {
      return true;
    }

    // Complete if all questions asked and answered
    const remaining = this.stateManager.getUnansweredQuestions();
    if (remaining.length === 0) {
      return true;
    }

    return false;
  }

  /**
   * Get completion progress summary
   * @returns Progress summary object
   */
  getProgressSummary(): {
    validationScore: number;
    questionsAsked: number;
    questionsRemaining: number;
    artifactsReady: number;
    artifactsGenerated: number;
    isComplete: boolean;
  } {
    const state = this.stateManager.getState();
    const remaining = this.stateManager.getUnansweredQuestions();

    let artifactsReady = 0;
    let artifactsGenerated = 0;

    for (const artifact of ARTIFACT_PRIORITY) {
      const status = state.artifactReadiness[artifact];
      if (status) {
        if (status.ready) artifactsReady++;
        if (status.generated) artifactsGenerated++;
      }
    }

    return {
      validationScore: state.validationStatus.overallScore,
      questionsAsked: state.questionsAsked.length,
      questionsRemaining: remaining.length,
      artifactsReady,
      artifactsGenerated,
      isComplete: this.isIntakeComplete(),
    };
  }
}
