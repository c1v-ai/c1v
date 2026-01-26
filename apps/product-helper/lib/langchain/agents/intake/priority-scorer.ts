/**
 * Priority Scorer
 *
 * Calculates priority scores for intake questions based on multiple factors:
 * - Base priority
 * - PRD-SPEC hard gate status
 * - Current phase alignment
 * - Artifact completion proximity
 * - Clarification history
 *
 * @module intake/priority-scorer
 * @team AI/Agent Engineering (Agent 3.1: LangChain Integration Engineer)
 */

import { type IntakeState } from './state';
import { type Question, type QuestionPhase } from './question-bank';
import { INTAKE_QUESTIONS, PHASE_ORDER, ARTIFACT_QUESTION_MAP } from './questions';
import { IntakeStateManager } from './state-manager';

/**
 * Scored question with priority and reasoning
 */
export interface ScoredQuestion {
  /** The question being scored */
  question: Question;

  /** Calculated priority score */
  score: number;

  /** Explanations for score adjustments */
  reasons: string[];
}

/**
 * PriorityScorer
 *
 * Scores and ranks available questions to determine the optimal
 * next question to ask in the intake conversation.
 */
export class PriorityScorer {
  private stateManager: IntakeStateManager;

  /**
   * Create a new PriorityScorer
   * @param stateManager - IntakeStateManager to score questions against
   */
  constructor(stateManager: IntakeStateManager) {
    this.stateManager = stateManager;
  }

  /**
   * Score all available questions and return sorted list
   * @returns Array of ScoredQuestion sorted by score descending
   */
  scoreQuestions(): ScoredQuestion[] {
    const state = this.stateManager.getState();

    // Get questions that haven't been asked and meet requirements
    const available = this.stateManager
      .getUnansweredQuestions()
      .filter(q => this.stateManager.areRequirementsMet(q));

    const scored: ScoredQuestion[] = available.map(q => ({
      question: q,
      score: this.calculateScore(q, state),
      reasons: this.getScoreReasons(q, state),
    }));

    // Sort by score descending
    return scored.sort((a, b) => b.score - a.score);
  }

  /**
   * Get the single best next question to ask
   * @returns Best ScoredQuestion or null if none available
   */
  getNextQuestion(): ScoredQuestion | null {
    const scored = this.scoreQuestions();
    return scored.length > 0 ? scored[0] : null;
  }

  /**
   * Calculate priority score for a question
   * @param question - Question to score
   * @param state - Current intake state
   * @returns Calculated score
   */
  private calculateScore(question: Question, state: IntakeState): number {
    let score = question.basePriority;

    // Boost 1: PRD-SPEC hard gate not yet passed (+3)
    if (question.prdSpecGate) {
      const gatePassed = state.validationStatus.hardGates[question.prdSpecGate];
      if (!gatePassed) {
        score += 3;
      }
    }

    // Boost 2: Current phase alignment (+2)
    if (question.phase === state.currentPhase) {
      score += 2;
    }

    // Boost 3: Artifact near completion (+2)
    const artifactBoost = this.getArtifactCompletionBoost(question, state);
    score += artifactBoost;

    // Boost 4: Can infer from existing data (+1)
    if (question.canInferFrom.length > 0) {
      const hasInferenceSource = question.canInferFrom.some(field => {
        const value = this.getNestedValue(state.extractedData, field);
        return value && (typeof value === 'string' ? value.length > 0 : true);
      });
      if (hasInferenceSource) {
        score += 1;
      }
    }

    // Penalty 1: Many clarifications already asked (-2 per)
    const asked = state.questionsAsked.find(q => q.questionId === question.id);
    if (asked && asked.clarificationCount > 0) {
      score -= asked.clarificationCount * 2;
    }

    // Penalty 2: Late-stage question when early data missing (-1)
    const phaseIndex = PHASE_ORDER.indexOf(question.phase);
    const currentPhaseIndex = PHASE_ORDER.indexOf(state.currentPhase);
    if (phaseIndex > currentPhaseIndex + 1) {
      score -= 1;
    }

    // Ensure score is non-negative
    return Math.max(score, 0);
  }

  /**
   * Get additional boost if this question would complete an artifact
   * @param question - Question being scored
   * @param state - Current intake state
   * @returns Boost amount (0 or 2)
   */
  private getArtifactCompletionBoost(question: Question, state: IntakeState): number {
    const artifactPhases = Object.entries(ARTIFACT_QUESTION_MAP);

    for (const [artifact, phases] of artifactPhases) {
      if (phases.includes(question.phase as QuestionPhase)) {
        const readiness = state.artifactReadiness[artifact];

        // If artifact is not ready and not generated
        if (readiness && !readiness.ready && !readiness.generated) {
          // Check if this question would complete the artifact
          const blockers = readiness.blockedBy || [];

          // If only one blocker and this question targets it
          if (blockers.length === 1) {
            const blocker = blockers[0];
            if (question.extractsTo.some(e => e.includes(blocker) || blocker.includes(e.split('.')[0]))) {
              return 2;
            }
          }
        }
      }
    }

    return 0;
  }

  /**
   * Get human-readable reasons for a question's score
   * @param question - Question to explain
   * @param state - Current intake state
   * @returns Array of reason strings
   */
  private getScoreReasons(question: Question, state: IntakeState): string[] {
    const reasons: string[] = [];

    reasons.push(`Base priority: ${question.basePriority}`);

    if (question.prdSpecGate) {
      const gatePassed = state.validationStatus.hardGates[question.prdSpecGate];
      if (!gatePassed) {
        reasons.push(`+3: Required for ${question.prdSpecGate} hard gate`);
      }
    }

    if (question.phase === state.currentPhase) {
      reasons.push('+2: Aligned with current phase');
    }

    const artifactBoost = this.getArtifactCompletionBoost(question, state);
    if (artifactBoost > 0) {
      reasons.push('+2: Would complete an artifact');
    }

    if (question.canInferFrom.length > 0) {
      const hasInference = question.canInferFrom.some(field => {
        const value = this.getNestedValue(state.extractedData, field);
        return value && (typeof value === 'string' ? value.length > 0 : true);
      });
      if (hasInference) {
        reasons.push('+1: Can infer from existing data');
      }
    }

    const asked = state.questionsAsked.find(q => q.questionId === question.id);
    if (asked && asked.clarificationCount > 0) {
      reasons.push(`-${asked.clarificationCount * 2}: ${asked.clarificationCount} clarification(s) already asked`);
    }

    const phaseIndex = PHASE_ORDER.indexOf(question.phase);
    const currentPhaseIndex = PHASE_ORDER.indexOf(state.currentPhase);
    if (phaseIndex > currentPhaseIndex + 1) {
      reasons.push('-1: Late-stage question');
    }

    return reasons;
  }

  /**
   * Get a nested value from an object using dot notation
   * @param obj - Object to get value from
   * @param path - Dot-separated path
   * @returns Value at path or undefined
   */
  private getNestedValue(obj: unknown, path: string): unknown {
    return path.split('.').reduce((curr: unknown, key: string) => {
      if (curr && typeof curr === 'object' && key in curr) {
        return (curr as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj);
  }

  /**
   * Get questions sorted by phase order, then by priority within phase
   * Useful for understanding the overall question flow
   * @returns Array of ScoredQuestion organized by phase
   */
  getQuestionsByPhaseOrder(): ScoredQuestion[] {
    const scored = this.scoreQuestions();

    return scored.sort((a, b) => {
      const phaseA = PHASE_ORDER.indexOf(a.question.phase);
      const phaseB = PHASE_ORDER.indexOf(b.question.phase);

      if (phaseA !== phaseB) {
        return phaseA - phaseB;
      }

      return b.score - a.score;
    });
  }

  /**
   * Get questions that would help complete a specific artifact
   * @param artifactType - Artifact type to target
   * @returns Array of questions that contribute to that artifact
   */
  getQuestionsForArtifact(artifactType: string): ScoredQuestion[] {
    const phases = ARTIFACT_QUESTION_MAP[artifactType];
    if (!phases) return [];

    const scored = this.scoreQuestions();
    return scored.filter(sq => phases.includes(sq.question.phase as QuestionPhase));
  }
}
