/**
 * Intake Agent Module
 *
 * Exports all components for the conversational intake agent:
 * - Question bank schema and pre-defined questions
 * - State management for tracking conversation progress
 * - Priority scoring for optimal question selection
 * - Completion detection for knowing when to stop
 *
 * @module intake
 * @team AI/Agent Engineering (Agent 3.1: LangChain Integration Engineer)
 */

// Question Bank
export {
  QuestionPhase,
  QuestionSchema,
  type Question,
  isValidQuestion,
  parseQuestion,
} from './question-bank';

// Pre-defined Questions
export {
  INTAKE_QUESTIONS,
  PHASE_ORDER,
  ARTIFACT_QUESTION_MAP,
  getQuestionsByPhase,
  getQuestionById,
  getQuestionsByGate,
} from './questions';

// State Types and Utilities
export {
  IntakeStateSchema,
  QuestionTrackingSchema,
  PhaseProgressSchema,
  ExtractedDataSchema,
  ValidationStatusSchema,
  ArtifactReadinessSchema,
  type IntakeState,
  type QuestionTracking,
  type PhaseProgress,
  type ExtractedData,
  type ValidationStatus,
  type ArtifactReadiness,
  type ArtifactType,
  ARTIFACT_TYPES,
  createEmptyExtractedData,
  createEmptyValidationStatus,
} from './state';

// State Manager
export { IntakeStateManager } from './state-manager';

// Priority Scorer
export {
  PriorityScorer,
  type ScoredQuestion,
} from './priority-scorer';

// Completion Detector
export {
  CompletionDetector,
  type CompletionResult,
} from './completion-detector';
