import { BaseMessage } from '@langchain/core/messages';
import type { IntakeState, ArtifactPhase, ArtifactReadiness, ValidationResult, PendingArtifact } from './types';
import type { ExtractionResult } from '../schemas';

/**
 * LangGraph Channel Configuration for Product-Helper Intake System
 *
 * This module defines the channel reducers and configuration for the LangGraph
 * state machine. Channels determine how state updates are merged.
 *
 * @module graphs/channels
 */

// ============================================================
// Channel Reducer Types
// ============================================================

/**
 * Generic reducer function type
 * Takes existing value and incoming update, returns merged value
 */
type Reducer<T> = (existing: T, incoming: T) => T;

/**
 * Channel configuration for a single state field
 */
interface ChannelConfig<T> {
  reducer: Reducer<T>;
  default: () => T;
}

// ============================================================
// Message Reducers
// ============================================================

/**
 * Message accumulator reducer
 * Appends new messages to existing array, ensuring no duplicates
 *
 * @param existing - Current message array
 * @param incoming - New messages to add (single or array)
 * @returns Combined message array
 *
 * @example
 * ```typescript
 * const messages = messagesReducer(
 *   [humanMessage1],
 *   [aiMessage1]
 * );
 * // Result: [humanMessage1, aiMessage1]
 * ```
 */
export function messagesReducer(
  existing: BaseMessage[],
  incoming: BaseMessage[] | BaseMessage | undefined
): BaseMessage[] {
  if (!incoming) {
    return existing;
  }

  const newMessages = Array.isArray(incoming) ? incoming : [incoming];

  // Deduplicate by checking message content
  const existingContents = new Set(
    existing.map(m => `${m._getType()}:${m.content}`)
  );

  const uniqueNewMessages = newMessages.filter(m => {
    const key = `${m._getType()}:${m.content}`;
    if (existingContents.has(key)) {
      return false;
    }
    existingContents.add(key);
    return true;
  });

  return [...existing, ...uniqueNewMessages];
}

// ============================================================
// Scalar Reducers
// ============================================================

/**
 * Replace reducer - simply replaces existing value with new value
 * Used for scalar fields that don't need accumulation
 *
 * @param existing - Current value
 * @param incoming - New value
 * @returns The incoming value (or existing if incoming is undefined)
 *
 * @example
 * ```typescript
 * const result = replaceReducer('old', 'new');
 * // Result: 'new'
 * ```
 */
export function replaceReducer<T>(existing: T, incoming: T | undefined): T {
  return incoming !== undefined ? incoming : existing;
}

/**
 * Nullable replace reducer - allows explicit null values
 * Used for fields that can be explicitly set to null
 *
 * @param existing - Current value
 * @param incoming - New value (can be null)
 * @returns The incoming value
 */
export function nullableReplaceReducer<T>(
  existing: T | null,
  incoming: T | null | undefined
): T | null {
  return incoming !== undefined ? incoming : existing;
}

// ============================================================
// Array Reducers
// ============================================================

/**
 * Artifacts accumulator reducer
 * Appends new artifact phases, ensuring uniqueness
 *
 * @param existing - Current artifact phases
 * @param incoming - New phases to add
 * @returns Combined unique artifact phases
 *
 * @example
 * ```typescript
 * const artifacts = artifactsReducer(
 *   ['context_diagram'],
 *   ['use_case_diagram', 'context_diagram']
 * );
 * // Result: ['context_diagram', 'use_case_diagram']
 * ```
 */
export function artifactsReducer(
  existing: ArtifactPhase[],
  incoming: ArtifactPhase | ArtifactPhase[] | undefined
): ArtifactPhase[] {
  if (!incoming) {
    return existing;
  }

  const newItems = Array.isArray(incoming) ? incoming : [incoming];
  // Use Array.from to avoid downlevelIteration issues
  return Array.from(new Set([...existing, ...newItems]));
}

// ============================================================
// Default Value Factories
// ============================================================

/**
 * Create default empty extraction result
 */
export function createDefaultExtractionResult(): ExtractionResult {
  return {
    actors: [],
    useCases: [],
    systemBoundaries: { internal: [], external: [] },
    dataEntities: [],
  };
}

/**
 * Create default artifact readiness (all false)
 */
export function createDefaultArtifactReadiness(): ArtifactReadiness {
  return {
    context_diagram: false,
    use_case_diagram: false,
    scope_tree: false,
    ucbd: false,
    requirements_table: false,
    constants_table: false,
    sysml_activity_diagram: false,
  };
}

// ============================================================
// Channel Configuration
// ============================================================

/**
 * StateGraphArgs compatible channel definition
 * Matches LangGraph's expected channel configuration format
 */
export interface StateGraphChannels {
  [key: string]: {
    reducer: (existing: unknown, incoming: unknown) => unknown;
    default: () => unknown;
  };
}

/**
 * Channel configuration for IntakeState
 * Defines how each state field is updated between graph invocations
 *
 * Channel types:
 * - Accumulated: Values are appended (messages, generatedArtifacts)
 * - Replaced: Values are overwritten (most scalar fields)
 * - Nullable: Values can be explicitly set to null (validationResult, pendingQuestion, etc.)
 *
 * @example
 * ```typescript
 * import { StateGraph } from '@langchain/langgraph';
 * import { intakeStateChannels } from './channels';
 *
 * const graph = new StateGraph<IntakeState>({
 *   channels: intakeStateChannels,
 * });
 * ```
 */
export const intakeStateChannels: StateGraphChannels = {
  // ============================================================
  // Accumulated Channels
  // ============================================================

  messages: {
    reducer: messagesReducer as (existing: unknown, incoming: unknown) => unknown,
    default: () => [] as BaseMessage[],
  },

  generatedArtifacts: {
    reducer: artifactsReducer as (existing: unknown, incoming: unknown) => unknown,
    default: () => [] as ArtifactPhase[],
  },

  // ============================================================
  // Project Context (Replace)
  // ============================================================

  projectId: {
    reducer: replaceReducer as (existing: unknown, incoming: unknown) => unknown,
    default: () => 0,
  },

  projectName: {
    reducer: replaceReducer as (existing: unknown, incoming: unknown) => unknown,
    default: () => '',
  },

  projectVision: {
    reducer: replaceReducer as (existing: unknown, incoming: unknown) => unknown,
    default: () => '',
  },

  teamId: {
    reducer: replaceReducer as (existing: unknown, incoming: unknown) => unknown,
    default: () => 0,
  },

  // ============================================================
  // Extracted Data (Replace)
  // ============================================================

  extractedData: {
    reducer: replaceReducer as (existing: unknown, incoming: unknown) => unknown,
    default: createDefaultExtractionResult,
  },

  completeness: {
    reducer: replaceReducer as (existing: unknown, incoming: unknown) => unknown,
    default: () => 0,
  },

  artifactReadiness: {
    reducer: replaceReducer as (existing: unknown, incoming: unknown) => unknown,
    default: createDefaultArtifactReadiness,
  },

  // ============================================================
  // Phase Tracking (Replace)
  // ============================================================

  currentPhase: {
    reducer: replaceReducer as (existing: unknown, incoming: unknown) => unknown,
    default: () => 'context_diagram' as ArtifactPhase,
  },

  // ============================================================
  // Per-Turn Analysis (Replace/Nullable)
  // ============================================================

  lastIntent: {
    reducer: replaceReducer as (existing: unknown, incoming: unknown) => unknown,
    default: () => 'UNKNOWN',
  },

  validationResult: {
    reducer: nullableReplaceReducer as (existing: unknown, incoming: unknown) => unknown,
    default: () => null as ValidationResult | null,
  },

  pendingQuestion: {
    reducer: nullableReplaceReducer as (existing: unknown, incoming: unknown) => unknown,
    default: () => null as string | null,
  },

  pendingArtifact: {
    reducer: nullableReplaceReducer as (existing: unknown, incoming: unknown) => unknown,
    default: () => null as PendingArtifact | null,
  },

  // ============================================================
  // Control Flags (Replace)
  // ============================================================

  isComplete: {
    reducer: replaceReducer as (existing: unknown, incoming: unknown) => unknown,
    default: () => false,
  },

  error: {
    reducer: nullableReplaceReducer as (existing: unknown, incoming: unknown) => unknown,
    default: () => null as string | null,
  },

  turnCount: {
    reducer: replaceReducer as (existing: unknown, incoming: unknown) => unknown,
    default: () => 0,
  },
};

// ============================================================
// Type-Safe Channel Accessor
// ============================================================

/**
 * Get channel configuration for a specific state field
 * Provides type safety when accessing channel config
 *
 * @param field - The state field name
 * @returns The channel configuration for that field
 */
export function getChannelConfig<K extends keyof IntakeState>(
  field: K
): ChannelConfig<IntakeState[K]> {
  const channel = intakeStateChannels[field];
  if (!channel) {
    throw new Error(`No channel configuration for field: ${field}`);
  }
  return channel as ChannelConfig<IntakeState[K]>;
}

// ============================================================
// State Update Helper
// ============================================================

/**
 * Apply a partial state update using channel reducers
 * Useful for manually merging state updates outside the graph
 *
 * @param currentState - The current state
 * @param updates - Partial updates to apply
 * @returns The merged state
 *
 * @example
 * ```typescript
 * const newState = applyStateUpdate(currentState, {
 *   messages: [newMessage],
 *   completeness: 45,
 * });
 * ```
 */
export function applyStateUpdate(
  currentState: IntakeState,
  updates: Partial<IntakeState>
): IntakeState {
  const result = { ...currentState };

  for (const [key, value] of Object.entries(updates)) {
    const channel = intakeStateChannels[key];
    if (channel && value !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (result as any)[key] = channel.reducer(
        currentState[key as keyof IntakeState],
        value
      );
    }
  }

  return result;
}

// ============================================================
// State Validation
// ============================================================

/**
 * Validate that a state object has all required fields
 * Useful for debugging and ensuring state integrity
 *
 * @param state - The state to validate
 * @returns Object with validation result and any missing fields
 */
export function validateState(state: unknown): {
  isValid: boolean;
  missingFields: string[];
} {
  const requiredFields = Object.keys(intakeStateChannels);
  const missingFields: string[] = [];

  if (!state || typeof state !== 'object') {
    return { isValid: false, missingFields: requiredFields };
  }

  for (const field of requiredFields) {
    if (!(field in state)) {
      missingFields.push(field);
    }
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Initialize missing fields with defaults
 * Ensures state has all required fields before graph execution
 *
 * @param partialState - A possibly incomplete state
 * @returns A complete state with defaults applied
 */
export function ensureCompleteState(
  partialState: Partial<IntakeState>
): IntakeState {
  const result: Partial<IntakeState> = { ...partialState };

  for (const [key, channel] of Object.entries(intakeStateChannels)) {
    if (!(key in result) || result[key as keyof IntakeState] === undefined) {
      (result as Record<string, unknown>)[key] = channel.default();
    }
  }

  // At this point all fields are populated
  return result as IntakeState;
}
