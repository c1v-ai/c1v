/**
 * CLEO Validator
 *
 * Validation framework for the GSD workflow, implementing the CLEO methodology
 * for reliable task management and error handling.
 *
 * @packageDocumentation
 */

// Export all exit code utilities
export {
  ExitCode,
  type ExitCodeValue,
  type ExitCodeName,
  type ExitCodeResult,
  isSuccess,
  isValidationError,
  isRetryable,
  requiresIntervention,
  getExitCodeName,
  getExitCodeDescription,
  success,
  failure,
  isValidExitCode,
} from './exit-codes';

// Export all audit trail utilities
export {
  AUDIT_LOG_FILENAME,
  type AuditAction,
  type AuditEntry,
  type AuditEntryInput,
  initAuditLog,
  appendAuditEntry,
  readAuditLog,
  auditTaskStart,
  auditTaskComplete,
  auditValidation,
  auditAgentStart,
  auditAgentEnd,
  auditStateChange,
  auditError,
  auditCheckpoint,
  auditDecision,
  auditTaskCreate,
} from './audit';

// Export all validation utilities
export {
  type SchemaName,
  type ValidationResult,
  type ValidationError,
  loadSchemas,
  getSchema,
  validate,
  validateState,
  validatePlan,
  validateTaskRegistry,
  validateWithExitCode,
  validateFile,
  validateFileWithExitCode,
  validateProjectState,
  validateProjectTasks,
  validateProject,
  validateProjectWithExitCode,
} from './validator';

// Export validation layer types
export {
  type FileType,
  type LayerName,
  type ValidationContext,
  type ValidationError as LayerValidationError,
  type ValidationWarning,
  type LayerResult,
  type LayerMetadata,
  type ValidationLayer,
  type ValidationPipelineResult,
  createSuccessResult,
  createFailureResult,
} from './layers/types';

// Export schema validation layer
export {
  schemaLayer,
  validateDataPresence,
  createFileReadErrorResult,
  createParseErrorResult,
} from './layers/schema';

// Export semantic validation layer
export {
  semanticLayer,
  validateStatusTransition,
  getValidTransitions,
  VALID_TASK_STATUSES,
  VALID_STATE_STATUSES,
  VALID_PRIORITIES,
  VALID_STATUS_TRANSITIONS,
} from './layers/semantic';

// Export referential integrity validation layer
export {
  referentialLayer,
  detectCircularDependencies,
  buildDependencyGraph,
  validateDependenciesExist,
  validateNoSelfReferences,
  validateLastTaskId,
  validateOpenQuestionUniqueness,
  KNOWN_AGENTS,
} from './layers/referential';

// Export state machine validation layer
export {
  stateMachineLayer,
  isValidTransition,
  isTerminalState,
  getNextStates,
  validateTaskTransition,
  validatePhaseTransition,
  TASK_TRANSITIONS,
  PHASE_TRANSITIONS,
  PLAN_TRANSITIONS,
} from './layers/state-machine';

// Export validation runner
export {
  runValidation,
  runValidationOnFile,
  runProjectValidation,
  runValidationOnFiles,
  runSingleLayer,
  detectFileType,
  getLayerNames,
  isValidLayerName,
  type RunnerOptions,
  type PipelineMetadata,
  type ExtendedPipelineResult,
  type FileValidationResult,
  type ProjectValidationResult,
} from './layers/runner';

// Export validation hooks for GSD commands
export {
  beforeMutation,
  afterMutation,
  validateProjectHook,
  validateTaskStateChange,
  withValidation,
  withMutationValidation,
  validateFileExists,
  createValidationCheckpoint,
  ValidationError,
  type ValidationHookOptions,
  type HookValidationResult,
  type HookProjectValidationResult,
  type TaskStateChangeResult,
} from './hooks';
