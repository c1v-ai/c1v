import { db } from '../../db/drizzle';
import { graphCheckpoints } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import { HumanMessage, AIMessage, SystemMessage, BaseMessage } from '@langchain/core/messages';
import type { IntakeState, ArtifactPhase, ArtifactReadiness, ValidationResult } from './types';
import { ensureCompleteState } from './channels';
import type { ExtractionResult } from '../schemas';

/**
 * LangGraph State Checkpointer for Product-Helper Intake System
 *
 * This module provides state persistence for the LangGraph workflow,
 * allowing conversations to be paused and resumed across requests.
 *
 * Database Table: graph_checkpoints
 * - projectId: Unique identifier for the project
 * - threadId: Conversation thread identifier
 * - channelValues: Serialized state values
 * - channelVersions: State version tracking
 * - metadata: Additional metadata (timestamps, etc.)
 *
 * @module graphs/checkpointer
 */

// ============================================================
// Types
// ============================================================

/**
 * Serialized message format for database storage
 */
interface SerializedMessage {
  type: 'human' | 'ai' | 'system';
  content: string;
}

/**
 * Serialized state format for database storage
 * Contains all state fields in a JSON-serializable format
 * Uses the same types as IntakeState for consistency
 */
interface SerializedState {
  // Message history
  messages: SerializedMessage[];

  // Project context
  projectId: number;
  projectName: string;
  projectVision: string;
  teamId: number;

  // Extracted data - use the same ExtractionResult type
  extractedData: ExtractionResult;
  completeness: number;
  artifactReadiness: ArtifactReadiness;

  // Phase tracking
  currentPhase: ArtifactPhase;
  generatedArtifacts: ArtifactPhase[];

  // Per-turn analysis
  lastIntent: string;
  validationResult: ValidationResult | null;
  pendingQuestion: string | null;
  pendingArtifact: {
    type: ArtifactPhase;
    content: string;
  } | null;

  // Control flags
  isComplete: boolean;
  error: string | null;
  turnCount: number;
}

/**
 * Checkpoint metadata stored alongside the state
 */
interface CheckpointMetadata {
  createdAt: string;
  updatedAt: string;
  version: number;
  lastNodeExecuted?: string;
}

// ============================================================
// Serialization Functions
// ============================================================

/**
 * Serialize IntakeState for database storage
 *
 * Converts LangChain messages and other non-JSON-serializable objects
 * to a format that can be stored in JSONB.
 *
 * @param state - The IntakeState to serialize
 * @returns JSON-serializable state object
 *
 * @example
 * ```typescript
 * const serialized = serializeState(state);
 * await db.insert(graphCheckpoints).values({ channelValues: serialized });
 * ```
 */
export function serializeState(state: IntakeState): SerializedState {
  return {
    // Serialize messages
    messages: state.messages.map(m => ({
      type: m._getType() as 'human' | 'ai' | 'system',
      content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
    })),

    // Project context (already serializable)
    projectId: state.projectId,
    projectName: state.projectName,
    projectVision: state.projectVision,
    teamId: state.teamId,

    // Extracted data (already serializable)
    extractedData: state.extractedData,
    completeness: state.completeness,
    artifactReadiness: state.artifactReadiness,

    // Phase tracking (already serializable)
    currentPhase: state.currentPhase,
    generatedArtifacts: [...state.generatedArtifacts],

    // Per-turn analysis
    lastIntent: state.lastIntent,
    validationResult: state.validationResult,
    pendingQuestion: state.pendingQuestion,
    pendingArtifact: state.pendingArtifact,

    // Control flags
    isComplete: state.isComplete,
    error: state.error,
    turnCount: state.turnCount,
  };
}

/**
 * Deserialize state from database storage
 *
 * Reconstructs LangChain messages and other objects from JSON.
 *
 * @param serialized - The serialized state from database
 * @returns Reconstructed IntakeState
 *
 * @example
 * ```typescript
 * const checkpoint = await loadCheckpoint(projectId);
 * const state = deserializeState(checkpoint.channelValues);
 * ```
 */
export function deserializeState(serialized: SerializedState): IntakeState {
  // Reconstruct message objects
  const messages: BaseMessage[] = serialized.messages.map(m => {
    switch (m.type) {
      case 'human':
        return new HumanMessage(m.content);
      case 'ai':
        return new AIMessage(m.content);
      case 'system':
        return new SystemMessage(m.content);
      default:
        return new HumanMessage(m.content);
    }
  });

  // Reconstruct state
  const state: IntakeState = {
    messages,
    projectId: serialized.projectId,
    projectName: serialized.projectName,
    projectVision: serialized.projectVision,
    teamId: serialized.teamId,
    extractedData: serialized.extractedData,
    completeness: serialized.completeness,
    artifactReadiness: serialized.artifactReadiness,
    currentPhase: serialized.currentPhase,
    generatedArtifacts: serialized.generatedArtifacts,
    lastIntent: serialized.lastIntent as IntakeState['lastIntent'],
    validationResult: serialized.validationResult,
    pendingQuestion: serialized.pendingQuestion,
    pendingArtifact: serialized.pendingArtifact,
    isComplete: serialized.isComplete,
    error: serialized.error,
    turnCount: serialized.turnCount,
  };

  // Ensure all fields have valid values
  return ensureCompleteState(state);
}

// ============================================================
// Database Operations
// ============================================================

/**
 * Default thread ID for single-thread projects
 */
const DEFAULT_THREAD_ID = 'main';

/**
 * Load checkpoint from database for a project
 *
 * Retrieves the most recent checkpoint for a project and deserializes it.
 * Returns null if no checkpoint exists.
 *
 * @param projectId - The project ID to load checkpoint for
 * @param threadId - Optional thread ID (defaults to 'main')
 * @returns Deserialized IntakeState or null if not found
 *
 * @example
 * ```typescript
 * const state = await loadCheckpoint(projectId);
 * if (state) {
 *   // Resume from checkpoint
 *   state.messages.push(new HumanMessage(userInput));
 *   const result = await graph.invoke(state);
 * } else {
 *   // Create new state
 *   const state = createInitialState(projectId, name, vision, teamId);
 * }
 * ```
 */
export async function loadCheckpoint(
  projectId: number,
  threadId: string = DEFAULT_THREAD_ID
): Promise<IntakeState | null> {
  try {
    const result = await db.query.graphCheckpoints.findFirst({
      where: and(
        eq(graphCheckpoints.projectId, projectId),
        eq(graphCheckpoints.threadId, threadId)
      ),
      orderBy: (checkpoints, { desc }) => [desc(checkpoints.createdAt)],
    });

    if (!result) {
      return null;
    }

    // Parse the channelValues JSONB field
    const channelValues = result.channelValues as SerializedState;

    if (!channelValues || typeof channelValues !== 'object') {
      console.warn(`Invalid checkpoint data for project ${projectId}`);
      return null;
    }

    // Deserialize and return
    return deserializeState(channelValues);
  } catch (error) {
    console.error(`Failed to load checkpoint for project ${projectId}:`, error);
    return null;
  }
}

/**
 * Save checkpoint to database for a project
 *
 * Serializes the state and saves it to the database. Uses upsert
 * to handle both new checkpoints and updates.
 *
 * @param projectId - The project ID to save checkpoint for
 * @param state - The IntakeState to save
 * @param threadId - Optional thread ID (defaults to 'main')
 * @param metadata - Optional additional metadata
 *
 * @example
 * ```typescript
 * const result = await graph.invoke(state);
 * await saveCheckpoint(projectId, result);
 * ```
 */
export async function saveCheckpoint(
  projectId: number,
  state: IntakeState,
  threadId: string = DEFAULT_THREAD_ID,
  metadata?: Partial<CheckpointMetadata>
): Promise<void> {
  try {
    const serializedState = serializeState(state);
    const now = new Date();
    const checkpointId = generateCheckpointId();

    const checkpointData = {
      projectId,
      threadId,
      checkpointNs: '',
      checkpointId,
      parentCheckpointId: null,
      channelValues: serializedState,
      channelVersions: { version: 1 },
      metadata: {
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        version: 1,
        ...metadata,
      },
      createdAt: now,
    };

    // Upsert - insert or update on conflict
    await db
      .insert(graphCheckpoints)
      .values(checkpointData)
      .onConflictDoUpdate({
        target: graphCheckpoints.projectId,
        set: {
          channelValues: serializedState,
          channelVersions: { version: 1 },
          checkpointId,
          metadata: {
            updatedAt: now.toISOString(),
            version: 1,
            ...metadata,
          },
          createdAt: now,
        },
      });
  } catch (error) {
    console.error(`Failed to save checkpoint for project ${projectId}:`, error);
    throw error;
  }
}

/**
 * Delete checkpoint from database
 *
 * Removes all checkpoints for a project. Use with caution.
 *
 * @param projectId - The project ID to delete checkpoints for
 * @param threadId - Optional thread ID to delete specific thread
 *
 * @example
 * ```typescript
 * // Delete all checkpoints for a project
 * await deleteCheckpoint(projectId);
 *
 * // Delete specific thread
 * await deleteCheckpoint(projectId, 'thread-123');
 * ```
 */
export async function deleteCheckpoint(
  projectId: number,
  threadId?: string
): Promise<void> {
  try {
    if (threadId) {
      await db
        .delete(graphCheckpoints)
        .where(
          and(
            eq(graphCheckpoints.projectId, projectId),
            eq(graphCheckpoints.threadId, threadId)
          )
        );
    } else {
      await db
        .delete(graphCheckpoints)
        .where(eq(graphCheckpoints.projectId, projectId));
    }
  } catch (error) {
    console.error(`Failed to delete checkpoint for project ${projectId}:`, error);
    throw error;
  }
}

/**
 * Check if a checkpoint exists for a project
 *
 * @param projectId - The project ID to check
 * @param threadId - Optional thread ID
 * @returns True if checkpoint exists
 */
export async function hasCheckpoint(
  projectId: number,
  threadId: string = DEFAULT_THREAD_ID
): Promise<boolean> {
  try {
    const result = await db.query.graphCheckpoints.findFirst({
      where: and(
        eq(graphCheckpoints.projectId, projectId),
        eq(graphCheckpoints.threadId, threadId)
      ),
      columns: { id: true },
    });

    return result !== undefined;
  } catch (error) {
    console.error(`Failed to check checkpoint for project ${projectId}:`, error);
    return false;
  }
}

/**
 * Get checkpoint metadata without loading full state
 *
 * Useful for displaying checkpoint info without deserializing everything.
 *
 * @param projectId - The project ID
 * @param threadId - Optional thread ID
 * @returns Checkpoint metadata or null
 */
export async function getCheckpointMetadata(
  projectId: number,
  threadId: string = DEFAULT_THREAD_ID
): Promise<CheckpointMetadata | null> {
  try {
    const result = await db.query.graphCheckpoints.findFirst({
      where: and(
        eq(graphCheckpoints.projectId, projectId),
        eq(graphCheckpoints.threadId, threadId)
      ),
      columns: { metadata: true, createdAt: true },
    });

    if (!result) {
      return null;
    }

    return result.metadata as CheckpointMetadata;
  } catch (error) {
    console.error(`Failed to get checkpoint metadata for project ${projectId}:`, error);
    return null;
  }
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * Generate a unique checkpoint ID
 *
 * @returns Unique checkpoint identifier
 */
function generateCheckpointId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `ckpt_${timestamp}_${random}`;
}

/**
 * Validate that serialized state has required fields
 *
 * @param data - The data to validate
 * @returns True if valid
 */
export function isValidSerializedState(data: unknown): data is SerializedState {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const state = data as Record<string, unknown>;

  // Check required fields
  const requiredFields = [
    'messages',
    'projectId',
    'projectName',
    'extractedData',
    'currentPhase',
  ];

  for (const field of requiredFields) {
    if (!(field in state)) {
      return false;
    }
  }

  // Check messages array
  if (!Array.isArray(state.messages)) {
    return false;
  }

  return true;
}

/**
 * Migrate old checkpoint format to current format
 *
 * Handles backward compatibility when checkpoint schema changes.
 *
 * @param data - Old format checkpoint data
 * @returns Migrated data in current format
 */
export function migrateCheckpointData(data: unknown): SerializedState | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const oldData = data as Record<string, unknown>;

  // Handle v1 format (direct state storage)
  if ('messages' in oldData && 'projectId' in oldData) {
    // Already in expected format, just ensure all fields
    return {
      messages: (oldData.messages as SerializedMessage[]) ?? [],
      projectId: (oldData.projectId as number) ?? 0,
      projectName: (oldData.projectName as string) ?? '',
      projectVision: (oldData.projectVision as string) ?? '',
      teamId: (oldData.teamId as number) ?? 0,
      extractedData: (oldData.extractedData as SerializedState['extractedData']) ?? {
        actors: [],
        useCases: [],
        systemBoundaries: { internal: [], external: [] },
        dataEntities: [],
      },
      completeness: (oldData.completeness as number) ?? 0,
      artifactReadiness: (oldData.artifactReadiness as SerializedState['artifactReadiness']) ?? {
        context_diagram: false,
        use_case_diagram: false,
        scope_tree: false,
        ucbd: false,
        requirements_table: false,
        constants_table: false,
        sysml_activity_diagram: false,
      },
      currentPhase: (oldData.currentPhase as ArtifactPhase) ?? 'context_diagram',
      generatedArtifacts: (oldData.generatedArtifacts as ArtifactPhase[]) ?? [],
      lastIntent: (oldData.lastIntent as string) ?? 'UNKNOWN',
      validationResult: (oldData.validationResult as SerializedState['validationResult']) ?? null,
      pendingQuestion: (oldData.pendingQuestion as string) ?? null,
      pendingArtifact: (oldData.pendingArtifact as SerializedState['pendingArtifact']) ?? null,
      isComplete: (oldData.isComplete as boolean) ?? false,
      error: (oldData.error as string) ?? null,
      turnCount: (oldData.turnCount as number) ?? 0,
    };
  }

  return null;
}

/**
 * Create a summary of checkpoint state for logging
 *
 * @param state - The state to summarize
 * @returns Human-readable summary string
 */
export function createCheckpointSummary(state: IntakeState): string {
  return [
    `Project: ${state.projectId} (${state.projectName})`,
    `Phase: ${state.currentPhase}`,
    `Completeness: ${state.completeness}%`,
    `Messages: ${state.messages.length}`,
    `Artifacts: ${state.generatedArtifacts.length}/7`,
    `Complete: ${state.isComplete}`,
    `Turns: ${state.turnCount}`,
  ].join(' | ');
}
