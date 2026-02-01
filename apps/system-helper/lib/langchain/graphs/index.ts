/**
 * LangGraph State Machine Module for Product-Helper Intake System
 *
 * This module provides the foundation for the LangGraph-based intake workflow
 * that powers the conversational PRD data collection system.
 *
 * @module graphs
 *
 * @example
 * ```typescript
 * import {
 *   createInitialState,
 *   computeArtifactReadiness,
 *   intakeStateChannels,
 *   formatMessagesAsText,
 *   truncateHistory,
 * } from '@/lib/langchain/graphs';
 *
 * // Create initial state for a new project
 * const state = createInitialState(
 *   projectId,
 *   'My Project',
 *   'A collaborative task management app',
 *   teamId
 * );
 *
 * // Format messages for extraction
 * const text = formatMessagesAsText(state.messages);
 * ```
 */

// ============================================================
// Types
// ============================================================

export type {
  ArtifactPhase,
  UserIntent,
  ArtifactReadiness,
  ValidationResult,
  PendingArtifact,
  IntakeState,
} from './types';

export {
  ARTIFACT_PHASE_SEQUENCE,
  STOP_TRIGGER_KEYWORDS,
  ARTIFACT_THRESHOLDS,
  createInitialState,
  computeArtifactReadiness,
  determineCurrentPhase,
  containsStopTrigger,
  calculateCompleteness,
  getNextPhase,
  getPhaseDisplayName,
} from './types';

// ============================================================
// Channels
// ============================================================

export {
  messagesReducer,
  replaceReducer,
  nullableReplaceReducer,
  artifactsReducer,
  createDefaultExtractionResult,
  createDefaultArtifactReadiness,
  intakeStateChannels,
  getChannelConfig,
  applyStateUpdate,
  validateState,
  ensureCompleteState,
} from './channels';

export type {
  StateGraphChannels,
} from './channels';

// ============================================================
// Utilities
// ============================================================

export {
  // Constants
  DEFAULT_MAX_TOKENS,
  CHARS_PER_TOKEN,
  MAX_CONVERSATION_TURNS,

  // Message formatting
  formatMessagesAsText,
  formatMessagesAsMarkdown,
  getMessageRole,
  getMessageContent,

  // Message selection
  getRecentMessages,
  getMessagesByRole,
  getLastMessage,
  getLastUserMessage,
  getLastAssistantMessage,

  // Token estimation
  estimateTokens,
  estimateMessageTokens,
  estimateTotalTokens,

  // History truncation
  truncateHistory,
  truncateHistoryKeepSystem,
  truncateHistoryPreservePairs,

  // Message creation
  createHumanMessage,
  createAIMessage,
  createSystemMessage,

  // Conversation analysis
  countConversationTurns,
  hasReachedMaxTurns,
  extractMentionedEntities,

  // Serialization
  serializeMessages,
  deserializeMessages,

  // Debug
  createMessagesSummary,
} from './utils';

// ============================================================
// Edges (Routing Functions)
// ============================================================

export type {
  AnalyzeRouteTarget,
  ExtractRouteTarget,
  ValidationRouteTarget,
  ArtifactRouteTarget,
} from './edges';

export {
  routeAfterAnalysis,
  routeAfterExtraction,
  routeAfterValidation,
  routeAfterArtifact,
  needsErrorRecovery,
  getErrorRecoveryRoute,
  shouldForceEnd,
  describeRoute,
} from './edges';

// ============================================================
// Checkpointer (State Persistence)
// ============================================================

export {
  serializeState,
  deserializeState,
  loadCheckpoint,
  saveCheckpoint,
  deleteCheckpoint,
  hasCheckpoint,
  getCheckpointMetadata,
  isValidSerializedState,
  migrateCheckpointData,
  createCheckpointSummary,
} from './checkpointer';

// ============================================================
// Intake Graph (Main Graph Assembly)
// ============================================================

export {
  buildIntakeGraph,
  getIntakeGraph,
  resetIntakeGraph,
  invokeIntakeGraph,
  streamIntakeGraph,
  IntakeStateAnnotation,
} from './intake-graph';
