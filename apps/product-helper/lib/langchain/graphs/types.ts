import { BaseMessage } from '@langchain/core/messages';
import { ExtractionResult } from '../schemas';
import type { KnowledgeBankStep } from '@/lib/education/knowledge-bank';
import { isHumanMessage } from '../message-utils';

/**
 * LangGraph State Machine Types for Product-Helper Intake System
 *
 * This module defines the core types for the LangGraph-based intake workflow
 * that replaces the single-prompt approach with a structured state machine.
 *
 * @module graphs/types
 */

// ============================================================
// Artifact Phase Types
// ============================================================

/**
 * Artifact types in PRD-SPEC pipeline order
 * Each artifact must be generated before proceeding to the next
 */
export type ArtifactPhase =
  | 'context_diagram'
  | 'use_case_diagram'
  | 'scope_tree'
  | 'ucbd'
  | 'requirements_table'
  | 'constants_table'
  | 'sysml_activity_diagram';

/**
 * Array of artifact phases in order for iteration
 */
export const ARTIFACT_PHASE_SEQUENCE: ArtifactPhase[] = [
  'context_diagram',
  'use_case_diagram',
  'scope_tree',
  'ucbd',
  'requirements_table',
  'constants_table',
  'sysml_activity_diagram',
];

// ============================================================
// User Intent Types
// ============================================================

/**
 * User intent detected from message analysis
 * Used for routing decisions in the state graph
 */
export type UserIntent =
  | 'PROVIDE_INFO'      // User answered a question
  | 'ASK_QUESTION'      // User has a question
  | 'STOP_TRIGGER'      // User wants to stop and generate
  | 'CONFIRM'           // User confirmed an assumption
  | 'DENY'              // User denied an assumption
  | 'REQUEST_ARTIFACT'  // User explicitly requests artifact
  | 'EDIT_DATA'         // User wants to modify extracted data
  | 'UNKNOWN';          // Could not determine intent

/**
 * Stop trigger keywords that indicate user wants to generate artifact
 * When detected, the system should stop asking questions and proceed to generation
 */
export const STOP_TRIGGER_KEYWORDS: string[] = [
  'nope',
  'no',
  'none',
  'nothing',
  "that's enough",
  "that's it",
  'done',
  'move on',
  "let's see",
  "let's see it",
  'generate',
  'show me',
  "that's all",
  'no more',
  'enough',
  'looks good',
  'perfect',
  'good enough',
];

// ============================================================
// Artifact Readiness Types
// ============================================================

/**
 * Artifact readiness status for each PRD-SPEC artifact
 * Indicates whether sufficient data has been collected to generate each artifact
 */
export interface ArtifactReadiness {
  context_diagram: boolean;
  use_case_diagram: boolean;
  scope_tree: boolean;
  ucbd: boolean;
  requirements_table: boolean;
  constants_table: boolean;
  sysml_activity_diagram: boolean;
}

// ============================================================
// Step Completion State Machine Types
// ============================================================

/**
 * Per-step tracking of what's been covered in the intake conversation.
 * This is the core state machine that prevents circular questioning.
 */
export interface StepStatus {
  /** How many conversational turns have been spent on this step */
  roundsAsked: number;
  /** Specific topic strings that have been covered (granular dedup) */
  coveredTopics: string[];
  /** Whether the user has confirmed the guesses for this step */
  confirmed: boolean;
  /** Whether the user has approved artifact generation for this step */
  generationApproved: boolean;
}

/**
 * A single entry in the guess history log.
 * Accumulated across turns so the LLM can see its own previous output.
 */
export interface GuessHistoryEntry {
  /** Which KB step this entry belongs to */
  step: KnowledgeBankStep;
  /** Turn number when this was generated */
  turn: number;
  /** Summary of guesses made (item names + confident/uncertain) */
  guessSummaries: string[];
  /** Gap targets that were asked about */
  gapTargets: string[];
  /** Confidence at this point */
  confidence: number;
}

/**
 * Create default step completion status for all KB steps
 */
export function createDefaultStepCompletionStatus(): Record<KnowledgeBankStep, StepStatus> {
  const steps: KnowledgeBankStep[] = [
    'context-diagram',
    'use-case-diagram',
    'scope-tree',
    'ucbd',
    'functional-requirements',
    'sysml-activity-diagram',
  ];
  const status: Partial<Record<KnowledgeBankStep, StepStatus>> = {};
  for (const step of steps) {
    status[step] = {
      roundsAsked: 0,
      coveredTopics: [],
      confirmed: false,
      generationApproved: false,
    };
  }
  return status as Record<KnowledgeBankStep, StepStatus>;
}

/**
 * Minimum thresholds for artifact generation (from PRD-SPEC spec)
 */
export const ARTIFACT_THRESHOLDS: Record<ArtifactPhase, {
  minimumScore: number;
  description: string;
}> = {
  context_diagram: {
    minimumScore: 20,
    description: 'System boundary with actors and external entities',
  },
  use_case_diagram: {
    minimumScore: 35,
    description: 'Actors linked to use cases',
  },
  scope_tree: {
    minimumScore: 45,
    description: 'In-scope and out-of-scope items defined',
  },
  ucbd: {
    minimumScore: 60,
    description: 'Use case behavior with preconditions, steps, postconditions',
  },
  requirements_table: {
    minimumScore: 75,
    description: 'Testable requirements derived from use cases',
  },
  constants_table: {
    minimumScore: 85,
    description: 'System constants with values and units',
  },
  sysml_activity_diagram: {
    minimumScore: 90,
    description: 'Activity flow with decision points',
  },
};

// ============================================================
// Validation Result Types
// ============================================================

/**
 * Validation result from PRD-SPEC check
 * Returned by the validation node
 */
export interface ValidationResult {
  score: number;
  passed: number;
  failed: number;
  hardGatesResult: Record<string, boolean>;
  errors: string[];
  warnings: string[];
}

// ============================================================
// Pending Artifact Types
// ============================================================

/**
 * Pending artifact content to generate
 */
export interface PendingArtifact {
  type: ArtifactPhase;
  content: string;
}

// ============================================================
// Main Intake State Interface
// ============================================================

/**
 * Main state interface for the intake graph
 * All fields are persisted between invocations via checkpointing
 *
 * @example
 * ```typescript
 * const state = createInitialState(
 *   1,
 *   'Task Manager',
 *   'A collaborative task management app',
 *   1
 * );
 * const result = await intakeGraph.invoke(state);
 * ```
 */
export interface IntakeState {
  // ============================================================
  // Message History (Accumulated)
  // ============================================================

  /**
   * Full conversation history as LangChain messages
   * Reducer: Append new messages to existing array
   */
  messages: BaseMessage[];

  // ============================================================
  // Project Context (Static per session)
  // ============================================================

  /**
   * Database project ID
   */
  projectId: number;

  /**
   * Project name from database
   */
  projectName: string;

  /**
   * Project vision statement from database
   */
  projectVision: string;

  /**
   * Team ID for authorization
   */
  teamId: number;

  // ============================================================
  // Extracted Data (Incremental)
  // ============================================================

  /**
   * Structured PRD data extracted from conversation
   * Updated incrementally after each extraction
   */
  extractedData: ExtractionResult;

  /**
   * Completeness score 0-100
   * Calculated based on extracted data quality
   */
  completeness: number;

  /**
   * Which artifacts are ready to generate
   * Computed from extractedData
   */
  artifactReadiness: ArtifactReadiness;

  // ============================================================
  // Current Phase Tracking
  // ============================================================

  /**
   * Current artifact being gathered data for
   * Follows PRD-SPEC sequence
   */
  currentPhase: ArtifactPhase;

  /**
   * Artifacts that have been generated successfully
   */
  generatedArtifacts: ArtifactPhase[];

  // ============================================================
  // Analysis Results (Per-Turn)
  // ============================================================

  /**
   * Detected intent from last user message
   */
  lastIntent: UserIntent;

  /**
   * Latest validation result from PRD-SPEC check
   */
  validationResult: ValidationResult | null;

  /**
   * Pending question to ask user (if any)
   */
  pendingQuestion: string | null;

  /**
   * Pending artifact content to generate
   */
  pendingArtifact: PendingArtifact | null;

  // ============================================================
  // Knowledge Bank Tracking
  // ============================================================

  /**
   * Which knowledge bank step is currently active
   * Follows sequence: context-diagram → use-case-diagram → scope-tree → ucbd → functional-requirements → sysml-activity-diagram
   */
  currentKBStep: KnowledgeBankStep;

  /**
   * Confidence score (0-100) for current KB step
   * When >80%, LLM proposes artifact generation
   */
  kbStepConfidence: number;

  /**
   * Accumulated data for the current KB step
   * Stores educated guesses, confirmed items, and gap analysis
   */
  kbStepData: Record<string, unknown>;

  /**
   * Whether we're waiting for user to approve a generation
   * Set when confidence >80% and artifact not yet generated
   */
  approvalPending: boolean;

  /**
   * History of gap targets already asked about.
   * Accumulated across turns to prevent re-asking the same topics.
   * Each entry is a short gap descriptor like "actors", "external_systems", etc.
   */
  askedQuestions: string[];

  /**
   * Per-step completion tracking. Tracks rounds asked, covered topics,
   * confirmation status, and generation approval for each KB step.
   */
  stepCompletionStatus: Record<KnowledgeBankStep, StepStatus>;

  /**
   * Accumulated log of guesses and gaps across all turns.
   * Gives the LLM memory of its own previous output.
   */
  guessHistory: GuessHistoryEntry[];

  // ============================================================
  // Control Flags
  // ============================================================

  /**
   * Whether the conversation is complete (95%+ validation)
   */
  isComplete: boolean;

  /**
   * Error state for recovery
   */
  error: string | null;

  /**
   * Turn counter for conversation limits
   * Used to prevent infinite loops
   */
  turnCount: number;
}

// ============================================================
// State Initialization Function
// ============================================================

/**
 * Create initial state for a new project intake session
 *
 * @param projectId - Database project ID
 * @param projectName - Project name
 * @param projectVision - Project vision statement
 * @param teamId - Team ID for authorization
 * @param existingData - Optional existing extracted data to resume from
 * @returns Initialized IntakeState
 *
 * @example
 * ```typescript
 * // New session
 * const state = createInitialState(1, 'My Project', 'A web app', 1);
 *
 * // Resume from existing data
 * const state = createInitialState(1, 'My Project', 'A web app', 1, {
 *   extractedData: previousData,
 *   messages: previousMessages,
 *   completeness: 45,
 * });
 * ```
 */
export function createInitialState(
  projectId: number,
  projectName: string,
  projectVision: string,
  teamId: number,
  existingData?: Partial<{
    extractedData: ExtractionResult;
    messages: BaseMessage[];
    generatedArtifacts: ArtifactPhase[];
    completeness: number;
  }>
): IntakeState {
  const extractedData: ExtractionResult = existingData?.extractedData ?? {
    actors: [],
    useCases: [],
    systemBoundaries: { internal: [], external: [] },
    dataEntities: [],
  };

  const generatedArtifacts = existingData?.generatedArtifacts ?? [];

  const currentPhase = determineCurrentPhase(generatedArtifacts);

  return {
    // Messages
    messages: existingData?.messages ?? [],

    // Project context
    projectId,
    projectName,
    projectVision,
    teamId,

    // Extracted data
    extractedData,
    completeness: existingData?.completeness ?? 0,
    artifactReadiness: computeArtifactReadiness(extractedData),

    // Phase tracking
    currentPhase,
    generatedArtifacts,

    // Per-turn analysis
    lastIntent: 'UNKNOWN',
    validationResult: null,
    pendingQuestion: null,
    pendingArtifact: null,

    // Knowledge bank tracking
    currentKBStep: phaseToKBStep(currentPhase),
    kbStepConfidence: 0,
    kbStepData: {},
    approvalPending: false,
    askedQuestions: [],
    stepCompletionStatus: createDefaultStepCompletionStatus(),
    guessHistory: [],

    // Control flags
    isComplete: false,
    error: null,
    turnCount: countHumanMessages(existingData?.messages ?? []),
  };
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Compute artifact readiness from extracted data
 * Determines which artifacts have sufficient data for generation
 *
 * @param data - The extracted PRD data
 * @returns Object indicating readiness for each artifact type
 *
 * @example
 * ```typescript
 * const readiness = computeArtifactReadiness(extractedData);
 * if (readiness.context_diagram) {
 *   // Ready to generate context diagram
 * }
 * ```
 */
export function computeArtifactReadiness(data: ExtractionResult): ArtifactReadiness {
  // Actor counts
  const actorCount = data.actors.length;
  const hasMinActors = actorCount >= 1;
  const hasTwoActors = actorCount >= 2;

  // Use case counts
  const useCaseCount = data.useCases.length;
  const hasMinUseCases = useCaseCount >= 3;
  const hasFiveUseCases = useCaseCount >= 5;

  // Boundary checks
  const hasExternal = data.systemBoundaries.external.length > 0 ||
    data.systemBoundaries.external.includes('none_confirmed');
  const hasInternal = data.systemBoundaries.internal.length > 0;

  // UCBD requirements (at least one use case with pre/post conditions)
  const hasUCBDData = data.useCases.some(uc =>
    (uc.preconditions?.length ?? 0) > 0 || (uc.postconditions?.length ?? 0) > 0
  );

  // Data entities
  const hasEntities = data.dataEntities.length >= 1;

  return {
    // Context Diagram: system name (always have) + 1 actor + external defined
    context_diagram: hasMinActors && hasExternal,

    // Use Case Diagram: 2+ actors + 3+ use cases linked
    use_case_diagram: hasTwoActors && hasMinUseCases,

    // Scope Tree: in-scope items defined
    scope_tree: hasInternal,

    // UCBD: preconditions + steps + postconditions for 1+ use case
    ucbd: hasMinUseCases && hasUCBDData,

    // Requirements: 5+ use cases traced
    requirements_table: hasFiveUseCases,

    // Constants: Can always infer from use cases and requirements
    constants_table: hasMinUseCases,

    // Activity Diagram: 3+ workflow steps from use cases
    sysml_activity_diagram: hasMinUseCases,
  };
}

/**
 * Determine current phase based on generated artifacts
 * Returns the next artifact in the PRD-SPEC sequence that hasn't been generated
 *
 * @param generated - Array of already generated artifact phases
 * @returns The next artifact phase to work on
 *
 * @example
 * ```typescript
 * const phase = determineCurrentPhase(['context_diagram']);
 * // Returns 'use_case_diagram'
 * ```
 */
export function determineCurrentPhase(generated: ArtifactPhase[]): ArtifactPhase {
  for (const phase of ARTIFACT_PHASE_SEQUENCE) {
    if (!generated.includes(phase)) {
      return phase;
    }
  }

  // All complete - return last phase
  return 'sysml_activity_diagram';
}

/**
 * Count human messages in the message array
 * Used to initialize the turn counter
 * Uses defensive type checking for Turbopack compatibility
 *
 * @param messages - Array of LangChain messages
 * @returns Number of human messages
 */
function countHumanMessages(messages: BaseMessage[]): number {
  return messages.filter(m => isHumanMessage(m)).length;
}

/**
 * Check if a message contains a stop trigger
 *
 * @param text - The message text to check
 * @returns True if a stop trigger is detected
 *
 * @example
 * ```typescript
 * if (containsStopTrigger("nope, that's all")) {
 *   // User wants to stop and generate
 * }
 * ```
 */
export function containsStopTrigger(text: string): boolean {
  const lowerText = text.toLowerCase();
  return STOP_TRIGGER_KEYWORDS.some(trigger =>
    lowerText.includes(trigger.toLowerCase())
  );
}

/**
 * Calculate overall completeness score from extracted data
 *
 * @param data - The extracted PRD data
 * @returns Completeness score from 0 to 100
 *
 * @example
 * ```typescript
 * const score = calculateCompleteness(extractedData);
 * console.log(`Project is ${score}% complete`);
 * ```
 */
export function calculateCompleteness(data: ExtractionResult): number {
  let score = 0;

  // Actors: up to 25 points
  if (data.actors.length >= 2) {
    score += 25;
  } else if (data.actors.length === 1) {
    score += 12;
  }

  // Use Cases: up to 35 points
  if (data.useCases.length >= 5) {
    score += 35;
  } else if (data.useCases.length >= 3) {
    score += 25;
  } else if (data.useCases.length >= 1) {
    score += 10;
  }

  // System Boundaries: up to 20 points
  const hasBothBoundaries =
    data.systemBoundaries.internal.length > 0 &&
    data.systemBoundaries.external.length > 0;
  const hasOneBoundary =
    data.systemBoundaries.internal.length > 0 ||
    data.systemBoundaries.external.length > 0;

  if (hasBothBoundaries) {
    score += 20;
  } else if (hasOneBoundary) {
    score += 10;
  }

  // Data Entities: up to 20 points
  if (data.dataEntities.length >= 3) {
    score += 20;
  } else if (data.dataEntities.length >= 1) {
    score += 7;
  }

  return Math.min(score, 100);
}

/**
 * Map an ArtifactPhase to its corresponding KnowledgeBankStep
 */
export function phaseToKBStep(phase: ArtifactPhase): KnowledgeBankStep {
  const mapping: Record<ArtifactPhase, KnowledgeBankStep> = {
    context_diagram: 'context-diagram',
    use_case_diagram: 'use-case-diagram',
    scope_tree: 'scope-tree',
    ucbd: 'ucbd',
    requirements_table: 'functional-requirements',
    constants_table: 'functional-requirements',
    sysml_activity_diagram: 'sysml-activity-diagram',
  };
  return mapping[phase];
}

/**
 * Get the next phase after the current one
 *
 * @param currentPhase - The current artifact phase
 * @returns The next phase, or null if at the end
 */
export function getNextPhase(currentPhase: ArtifactPhase): ArtifactPhase | null {
  const currentIndex = ARTIFACT_PHASE_SEQUENCE.indexOf(currentPhase);
  if (currentIndex < 0 || currentIndex >= ARTIFACT_PHASE_SEQUENCE.length - 1) {
    return null;
  }
  return ARTIFACT_PHASE_SEQUENCE[currentIndex + 1];
}

/**
 * Get human-readable phase name
 *
 * @param phase - The artifact phase
 * @returns Human-readable name with spaces
 */
export function getPhaseDisplayName(phase: ArtifactPhase): string {
  return phase.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
