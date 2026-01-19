/**
 * Intake State Manager
 *
 * Manages conversation state across messages, tracking questions asked,
 * data collected, validation status, and artifact readiness.
 *
 * @module intake/state-manager
 * @team AI/Agent Engineering (Agent 3.1: LangChain Integration Engineer)
 */

import {
  IntakeStateSchema,
  type IntakeState,
  type ExtractedData,
  type PhaseProgress,
  type ArtifactReadiness,
  createEmptyExtractedData,
  createEmptyValidationStatus,
  ARTIFACT_TYPES,
} from './state';
import { INTAKE_QUESTIONS, PHASE_ORDER, type Question } from './questions';
import { type QuestionPhase } from './question-bank';
import { validateProject } from '../../../validation/validator';
import { type ProjectValidationData } from '../../../validation/types';
import { type ExtractionResult } from '../../schemas';

/**
 * IntakeStateManager
 *
 * Stateful manager for tracking and updating intake conversation state.
 * Provides methods for:
 * - Marking questions as asked/answered
 * - Updating extracted data with merge logic
 * - Evaluating skip conditions
 * - Running validation
 * - Tracking artifact readiness
 */
export class IntakeStateManager {
  private state: IntakeState;

  /**
   * Create a new IntakeStateManager
   * @param initialState - Partial state to initialize with
   */
  constructor(initialState: Partial<IntakeState>) {
    this.state = IntakeStateSchema.parse({
      projectId: initialState.projectId!,
      projectName: initialState.projectName || '',
      projectVision: initialState.projectVision || '',
      questionsAsked: initialState.questionsAsked || [],
      currentPhase: initialState.currentPhase || 'actors',
      phaseProgress: initialState.phaseProgress || this.initializePhaseProgress(),
      extractedData: initialState.extractedData || createEmptyExtractedData(),
      validationStatus: initialState.validationStatus || createEmptyValidationStatus(),
      artifactReadiness: initialState.artifactReadiness || this.initializeArtifactReadiness(),
      userRequestedStop: initialState.userRequestedStop || false,
      stopReason: initialState.stopReason,
      messageCount: initialState.messageCount || 0,
      lastUpdatedAt: initialState.lastUpdatedAt || new Date().toISOString(),
    });
  }

  /**
   * Initialize phase progress tracking for all phases
   */
  private initializePhaseProgress(): Record<QuestionPhase, PhaseProgress> {
    const progress: Record<string, PhaseProgress> = {};

    for (const phase of PHASE_ORDER) {
      const phaseQuestions = INTAKE_QUESTIONS.filter(q => q.phase === phase);
      progress[phase] = {
        started: false,
        completed: false,
        questionsAsked: 0,
        questionsRemaining: phaseQuestions.length,
      };
    }

    return progress as Record<QuestionPhase, PhaseProgress>;
  }

  /**
   * Initialize artifact readiness tracking
   */
  private initializeArtifactReadiness(): Record<string, ArtifactReadiness> {
    const readiness: Record<string, ArtifactReadiness> = {};

    for (const artifact of ARTIFACT_TYPES) {
      readiness[artifact] = {
        ready: false,
        generated: false,
        blockedBy: [],
      };
    }

    return readiness;
  }

  /**
   * Mark a question as asked
   * @param questionId - ID of the question being asked
   */
  markQuestionAsked(questionId: string): void {
    const question = INTAKE_QUESTIONS.find(q => q.id === questionId);
    if (!question) return;

    // Check if already asked
    const alreadyAsked = this.state.questionsAsked.some(q => q.questionId === questionId);
    if (alreadyAsked) {
      // Increment clarification count instead
      const existing = this.state.questionsAsked.find(q => q.questionId === questionId);
      if (existing) {
        existing.clarificationCount++;
      }
      return;
    }

    this.state.questionsAsked.push({
      questionId,
      askedAt: new Date().toISOString(),
      answerReceived: false,
      clarificationCount: 0,
    });

    // Update phase progress
    const phase = question.phase;
    if (this.state.phaseProgress[phase]) {
      this.state.phaseProgress[phase].started = true;
      this.state.phaseProgress[phase].questionsAsked++;
      this.state.phaseProgress[phase].questionsRemaining--;
    }

    // Update current phase if entering a new phase
    const currentPhaseIndex = PHASE_ORDER.indexOf(this.state.currentPhase);
    const questionPhaseIndex = PHASE_ORDER.indexOf(phase);
    if (questionPhaseIndex > currentPhaseIndex) {
      this.state.currentPhase = phase;
    }

    this.state.lastUpdatedAt = new Date().toISOString();
  }

  /**
   * Mark the last asked question as answered
   */
  markLastQuestionAnswered(): void {
    const lastQuestion = this.state.questionsAsked[this.state.questionsAsked.length - 1];
    if (lastQuestion && !lastQuestion.answerReceived) {
      lastQuestion.answerReceived = true;
    }
    this.state.messageCount++;
    this.state.lastUpdatedAt = new Date().toISOString();
  }

  /**
   * Update extracted data with merge logic
   * Merges new data with existing data, deduplicating by name/id
   * @param newData - New extraction data to merge
   */
  updateExtractedData(newData: Partial<ExtractionResult>): void {
    const existing = this.state.extractedData;

    // Merge actors (deduplicate by name)
    if (newData.actors && newData.actors.length > 0) {
      const actorMap = new Map<string, unknown>();
      for (const a of existing.actors) {
        const actor = a as { name: string };
        if (actor.name) {
          actorMap.set(actor.name, a);
        }
      }
      for (const a of newData.actors) {
        actorMap.set(a.name, a);
      }
      existing.actors = Array.from(actorMap.values());
    }

    // Merge use cases (deduplicate by id)
    if (newData.useCases && newData.useCases.length > 0) {
      const ucMap = new Map<string, unknown>();
      for (const uc of existing.useCases) {
        const useCase = uc as { id: string };
        if (useCase.id) {
          ucMap.set(useCase.id, uc);
        }
      }
      for (const uc of newData.useCases) {
        ucMap.set(uc.id, uc);
      }
      existing.useCases = Array.from(ucMap.values());
    }

    // Merge system boundaries
    if (newData.systemBoundaries) {
      if (newData.systemBoundaries.internal) {
        const internalSet = new Set<string>(existing.systemBoundaries.internal);
        for (const item of newData.systemBoundaries.internal) {
          internalSet.add(item);
        }
        existing.systemBoundaries.internal = Array.from(internalSet);
      }
      if (newData.systemBoundaries.external) {
        const externalSet = new Set<string>(existing.systemBoundaries.external);
        for (const item of newData.systemBoundaries.external) {
          externalSet.add(item);
        }
        existing.systemBoundaries.external = Array.from(externalSet);
      }
    }

    // Merge data entities (deduplicate by name)
    if (newData.dataEntities && newData.dataEntities.length > 0) {
      const entityMap = new Map<string, unknown>();
      for (const e of existing.dataEntities) {
        const entity = e as { name: string };
        if (entity.name) {
          entityMap.set(entity.name, e);
        }
      }
      for (const e of newData.dataEntities) {
        entityMap.set(e.name, e);
      }
      existing.dataEntities = Array.from(entityMap.values());
    }

    this.state.lastUpdatedAt = new Date().toISOString();
  }

  /**
   * Check if a question should be skipped based on its skip condition
   * @param question - Question to check
   * @returns True if question should be skipped
   */
  shouldSkipQuestion(question: Question): boolean {
    if (!question.skipCondition) return false;

    const data = this.state.extractedData;
    const condition = question.skipCondition;

    try {
      // Evaluate common skip conditions
      if (condition.includes('actors.length')) {
        const match = condition.match(/actors\.length\s*>=\s*(\d+)/);
        if (match) return data.actors.length >= parseInt(match[1]);
      }

      if (condition.includes('useCases.length')) {
        const match = condition.match(/useCases\.length\s*>=\s*(\d+)/);
        if (match) return data.useCases.length >= parseInt(match[1]);
      }

      if (condition.includes('dataEntities.length')) {
        const match = condition.match(/dataEntities\.length\s*>=\s*(\d+)/);
        if (match) return data.dataEntities.length >= parseInt(match[1]);
      }

      // Handle .every() conditions
      if (condition.includes('.every(')) {
        if (condition.includes('useCases.every(uc => uc.trigger)')) {
          return data.useCases.every((uc: { trigger?: string }) => uc.trigger && uc.trigger.length > 0);
        }
        if (condition.includes('useCases.every(uc => uc.outcome)')) {
          return data.useCases.every((uc: { outcome?: string }) => uc.outcome && uc.outcome.length > 0);
        }
        if (condition.includes('dataEntities.every(e => e.relationships')) {
          return data.dataEntities.every(
            (e: { relationships?: string[] }) => e.relationships && e.relationships.length > 0
          );
        }
      }

      return false;
    } catch {
      return false;
    }
  }

  /**
   * Get questions that have not been asked yet and should not be skipped
   * @returns Array of unanswered, unskipped questions
   */
  getUnansweredQuestions(): Question[] {
    const askedIds = new Set(this.state.questionsAsked.map(q => q.questionId));

    return INTAKE_QUESTIONS.filter(q => {
      // Not already asked
      if (askedIds.has(q.id)) return false;

      // Should not be skipped
      if (this.shouldSkipQuestion(q)) return false;

      return true;
    });
  }

  /**
   * Get unanswered questions for a specific phase
   * @param phase - Question phase to filter by
   * @returns Array of questions in that phase
   */
  getPhaseQuestions(phase: QuestionPhase): Question[] {
    return this.getUnansweredQuestions().filter(q => q.phase === phase);
  }

  /**
   * Check if requirements are met for asking a specific question
   * @param question - Question to check requirements for
   * @returns True if all requirements are met
   */
  areRequirementsMet(question: Question): boolean {
    // Get answered question IDs
    const answeredIds = new Set(
      this.state.questionsAsked.filter(q => q.answerReceived).map(q => q.questionId)
    );

    // Check required questions
    for (const reqId of question.requires) {
      if (!answeredIds.has(reqId)) return false;
    }

    // Check required data
    for (const reqData of question.requiresData) {
      const value = this.getNestedValue(this.state.extractedData, reqData);
      if (!value || (Array.isArray(value) && value.length === 0)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get a nested value from an object using dot notation
   * @param obj - Object to get value from
   * @param path - Dot-separated path (e.g., 'systemBoundaries.inScope')
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
   * Run SR-CORNELL validation and update status
   */
  async runValidation(): Promise<void> {
    const validationData: ProjectValidationData = {
      id: this.state.projectId,
      name: this.state.projectName,
      vision: this.state.projectVision,
      status: 'intake',
      actors: this.state.extractedData.actors,
      useCases: this.state.extractedData.useCases,
      systemBoundaries: {
        internal: this.state.extractedData.systemBoundaries.internal,
        external: this.state.extractedData.systemBoundaries.external,
        inScope: this.state.extractedData.systemBoundaries.inScope,
        outOfScope: this.state.extractedData.systemBoundaries.outOfScope,
      },
      dataEntities: this.state.extractedData.dataEntities,
    };

    const result = await validateProject(validationData);

    this.state.validationStatus.overallScore = result.overallScore;
    this.state.validationStatus.lastValidatedAt = new Date().toISOString();

    // Update hard gate results
    for (const gate of result.hardGates) {
      this.state.validationStatus.hardGates[gate.gate] = gate.passed;
    }

    // Update artifact readiness based on validation
    this.updateArtifactReadiness();

    this.state.lastUpdatedAt = new Date().toISOString();
  }

  /**
   * Update artifact readiness based on current extracted data
   */
  updateArtifactReadiness(): void {
    const data = this.state.extractedData;

    // Context diagram: system name + 1 actor + 1 external
    const contextBlockers: string[] = [];
    if (data.actors.length < 1) contextBlockers.push('actors');
    if (data.systemBoundaries.external.length < 1) contextBlockers.push('systemBoundaries.external');
    this.state.artifactReadiness.context_diagram = {
      ...this.state.artifactReadiness.context_diagram,
      ready: contextBlockers.length === 0,
      blockedBy: contextBlockers,
    };

    // Use case diagram: 2+ actors + 3+ use cases
    const useCaseBlockers: string[] = [];
    if (data.actors.length < 2) useCaseBlockers.push('actors');
    if (data.useCases.length < 3) useCaseBlockers.push('useCases');
    this.state.artifactReadiness.use_case_diagram = {
      ...this.state.artifactReadiness.use_case_diagram,
      ready: useCaseBlockers.length === 0,
      blockedBy: useCaseBlockers,
    };

    // Scope tree: in-scope + out-of-scope
    const scopeBlockers: string[] = [];
    if (data.systemBoundaries.inScope.length < 1) scopeBlockers.push('systemBoundaries.inScope');
    if (data.systemBoundaries.outOfScope.length < 1) scopeBlockers.push('systemBoundaries.outOfScope');
    this.state.artifactReadiness.scope_tree = {
      ...this.state.artifactReadiness.scope_tree,
      ready: scopeBlockers.length === 0,
      blockedBy: scopeBlockers,
    };

    // UCBD: use cases with steps
    const hasUseCaseSteps = data.useCases.some(
      (uc: { preconditions?: string[]; postconditions?: string[] }) =>
        (uc.preconditions && uc.preconditions.length > 0) ||
        (uc.postconditions && uc.postconditions.length > 0)
    );
    this.state.artifactReadiness.ucbd = {
      ...this.state.artifactReadiness.ucbd,
      ready: hasUseCaseSteps,
      blockedBy: hasUseCaseSteps ? [] : ['useCases.preconditions'],
    };

    // Requirements table: 5+ use cases
    this.state.artifactReadiness.requirements_table = {
      ...this.state.artifactReadiness.requirements_table,
      ready: data.useCases.length >= 5,
      blockedBy: data.useCases.length >= 5 ? [] : ['useCases'],
    };

    // Constants table: constraints present
    const hasConstraints =
      (data.constraints?.technical?.length || 0) > 0 ||
      (data.constraints?.business?.length || 0) > 0;
    this.state.artifactReadiness.constants_table = {
      ...this.state.artifactReadiness.constants_table,
      ready: hasConstraints,
      blockedBy: hasConstraints ? [] : ['constraints'],
    };

    // Activity diagram: use cases with workflow steps
    this.state.artifactReadiness.sysml_activity_diagram = {
      ...this.state.artifactReadiness.sysml_activity_diagram,
      ready: data.useCases.length >= 3,
      blockedBy: data.useCases.length >= 3 ? [] : ['useCases'],
    };
  }

  /**
   * Mark that the user has requested to stop
   * @param reason - Reason for the stop request
   */
  setUserStop(reason: string): void {
    this.state.userRequestedStop = true;
    this.state.stopReason = reason;
    this.state.lastUpdatedAt = new Date().toISOString();
  }

  /**
   * Get the current state
   * @returns Current IntakeState
   */
  getState(): IntakeState {
    return this.state;
  }

  /**
   * Serialize state to JSON string for database storage
   * @returns JSON string of state
   */
  serialize(): string {
    return JSON.stringify(this.state);
  }

  /**
   * Create an IntakeStateManager from serialized JSON
   * @param json - JSON string from serialize()
   * @returns New IntakeStateManager with restored state
   */
  static deserialize(json: string): IntakeStateManager {
    const state = JSON.parse(json) as IntakeState;
    const manager = new IntakeStateManager(state);
    return manager;
  }
}
