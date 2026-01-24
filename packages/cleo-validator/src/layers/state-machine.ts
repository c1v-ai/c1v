/**
 * State Machine Validation Layer
 *
 * Fourth and final layer of the 4-layer CLEO validation system.
 * Validates that state transitions follow allowed paths.
 *
 * This layer differs from semantic validation in that it:
 * - Validates transitions between states over time (using previousResults)
 * - Enforces state machine rules (terminal states, valid transitions)
 * - Detects invalid state combinations (e.g., completed task with pending dependencies)
 *
 * Exit Code: 8 (VALIDATION_STATE_MACHINE) on failure
 *
 * @module layers/state-machine
 */

import { ExitCode } from '../exit-codes';
import {
  type ValidationContext,
  type LayerResult,
  type ValidationLayer,
  type ValidationError,
  type ValidationWarning,
  createFailureResult,
} from './types';

/**
 * Error code prefix for state machine validation errors.
 */
const ERROR_CODE_PREFIX = 'STATE_MACHINE';

/**
 * Warning code prefix for state machine validation warnings.
 */
const WARNING_CODE_PREFIX = 'STATE_MACHINE_WARN';

// ============================================================================
// State Transition Definitions
// ============================================================================

/**
 * Valid task status transitions.
 * Maps current status to allowed next statuses.
 *
 * State Machine:
 * ```
 *                    ┌──────────────┐
 *                    │   pending    │
 *                    └──────┬───────┘
 *                           │
 *              ┌────────────┴────────────┐
 *              ▼                         ▼
 *     ┌────────────────┐         ┌────────────┐
 *     │  in_progress   │◄───────►│  blocked   │
 *     └────────┬───────┘         └────────────┘
 *              │                         │
 *              ▼                         │
 *     ┌────────────────┐                 │
 *     │   completed    │                 │
 *     │   (terminal)   │                 │
 *     └────────────────┘                 │
 *              ▲                         │
 *              └─────────────────────────┘
 *                  (via in_progress)
 * ```
 */
export const TASK_TRANSITIONS: Record<string, string[]> = {
  pending: ['in_progress', 'blocked'],
  in_progress: ['completed', 'blocked'],
  blocked: ['pending', 'in_progress'],
  completed: [], // Terminal state - no transitions allowed
};

/**
 * Valid phase status transitions for project state.
 * Maps current status to allowed next statuses.
 *
 * State Machine:
 * ```
 *     ┌────────────────┐
 *     │    planning    │
 *     └────────┬───────┘
 *              │
 *              ▼
 *     ┌────────────────┐
 *     │   executing    │◄─────────┐
 *     └────────┬───────┘          │
 *              │                  │
 *              ▼                  │
 *     ┌────────────────┐          │
 *     │   verifying    │──────────┘
 *     └────────┬───────┘   (if gaps found)
 *              │
 *              ▼
 *     ┌────────────────┐
 *     │    complete    │
 *     │   (terminal)   │
 *     └────────────────┘
 * ```
 */
export const PHASE_TRANSITIONS: Record<string, string[]> = {
  planning: ['executing'],
  executing: ['verifying'],
  verifying: ['complete', 'executing'], // Can go back to executing if gaps found
  complete: [], // Terminal state - no transitions allowed
  blocked: ['planning', 'executing'], // Blocked can resume to planning or executing
  'Ready to start': ['planning', 'executing'], // Initial state can move forward
};

/**
 * Valid plan status transitions.
 * Maps current status to allowed next statuses.
 */
export const PLAN_TRANSITIONS: Record<string, string[]> = {
  pending: ['in_progress'],
  in_progress: ['completed', 'blocked'],
  blocked: ['in_progress'], // After user action, resume
  completed: [], // Terminal state
};

// ============================================================================
// Type Guards and Interfaces
// ============================================================================

interface TaskData {
  id: string;
  status: string;
  dependencies?: string[];
  completed?: string;
  blockedBy?: string;
}

interface TaskRegistryData {
  tasks?: TaskData[];
  lastTaskId?: number;
}

interface StateData {
  currentPosition?: {
    phase?: number | string;
    status?: string;
  };
  previousStatus?: string; // For tracking transitions
  activeTask?: {
    id: string;
    status?: string;
  } | string | null;
}

interface PreviousState {
  status?: string;
  taskStatuses?: Map<string, string>;
  phaseStatus?: string;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isTaskRegistryData(data: unknown): data is TaskRegistryData {
  return isObject(data) && (data.tasks === undefined || Array.isArray(data.tasks));
}

function isStateData(data: unknown): data is StateData {
  return isObject(data);
}

// ============================================================================
// State Machine Validation Functions
// ============================================================================

/**
 * Checks if a status transition is valid for the given transition map.
 *
 * @param transitionMap - The transition rules to use
 * @param from - Current status
 * @param to - Target status
 * @returns true if the transition is valid
 *
 * @example
 * ```ts
 * isValidTransition(TASK_TRANSITIONS, 'pending', 'in_progress'); // true
 * isValidTransition(TASK_TRANSITIONS, 'completed', 'pending'); // false
 * ```
 */
export function isValidTransition(
  transitionMap: Record<string, string[]>,
  from: string,
  to: string
): boolean {
  // Same status is always valid (no-op)
  if (from === to) {
    return true;
  }
  return transitionMap[from]?.includes(to) ?? false;
}

/**
 * Checks if a status is a terminal state (no outgoing transitions).
 *
 * @param transitionMap - The transition rules to check
 * @param status - The status to check
 * @returns true if the status is terminal
 */
export function isTerminalState(
  transitionMap: Record<string, string[]>,
  status: string
): boolean {
  const transitions = transitionMap[status];
  return transitions !== undefined && transitions.length === 0;
}

/**
 * Gets valid next states from a given status.
 *
 * @param transitionMap - The transition rules to use
 * @param status - The current status
 * @returns Array of valid next statuses
 */
export function getNextStates(
  transitionMap: Record<string, string[]>,
  status: string
): string[] {
  return transitionMap[status] ?? [];
}

/**
 * Extracts previous state information from previousResults.
 * Used for transition validation across validation runs.
 */
function extractPreviousState(context: ValidationContext): PreviousState | null {
  if (!context.previousResults || context.previousResults.length === 0) {
    return null;
  }

  // Look for state-machine layer results from previous run
  // This would contain the previous state information
  for (const result of context.previousResults) {
    if (result.layer === 'state-machine' && result.metadata?.previousState) {
      return result.metadata.previousState as PreviousState;
    }
  }

  return null;
}

/**
 * Validates state transitions in a STATE file.
 *
 * Checks:
 * - Phase status is valid for current state
 * - Transition from previous status (if available) is valid
 */
function validateStateTransitions(
  context: ValidationContext,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  const data = context.data;
  if (!isStateData(data)) {
    return;
  }

  const currentStatus = data.currentPosition?.status;
  if (!currentStatus) {
    return; // No status to validate
  }

  // Check if current status is known
  if (PHASE_TRANSITIONS[currentStatus] === undefined) {
    errors.push({
      code: `${ERROR_CODE_PREFIX}_UNKNOWN_PHASE_STATUS`,
      message: `Unknown phase status "${currentStatus}". Valid statuses: ${Object.keys(PHASE_TRANSITIONS).join(', ')}`,
      path: '/currentPosition/status',
      details: {
        status: currentStatus,
        validStatuses: Object.keys(PHASE_TRANSITIONS),
      },
    });
    return;
  }

  // Check if we're in a terminal state
  if (isTerminalState(PHASE_TRANSITIONS, currentStatus)) {
    warnings.push({
      code: `${WARNING_CODE_PREFIX}_TERMINAL_STATE`,
      message: `Phase is in terminal state "${currentStatus}". No further transitions are allowed.`,
      path: '/currentPosition/status',
    });
  }

  // If we have previous state info, validate the transition
  const previousState = extractPreviousState(context);
  if (previousState?.phaseStatus && previousState.phaseStatus !== currentStatus) {
    if (!isValidTransition(PHASE_TRANSITIONS, previousState.phaseStatus, currentStatus)) {
      errors.push({
        code: `${ERROR_CODE_PREFIX}_INVALID_PHASE_TRANSITION`,
        message: `Invalid phase transition from "${previousState.phaseStatus}" to "${currentStatus}". Allowed transitions: ${getNextStates(PHASE_TRANSITIONS, previousState.phaseStatus).join(', ') || 'none (terminal state)'}`,
        path: '/currentPosition/status',
        details: {
          from: previousState.phaseStatus,
          to: currentStatus,
          allowedTransitions: getNextStates(PHASE_TRANSITIONS, previousState.phaseStatus),
        },
      });
    }
  }

  // Check for explicit previousStatus field
  if (data.previousStatus && data.previousStatus !== currentStatus) {
    if (!isValidTransition(PHASE_TRANSITIONS, data.previousStatus, currentStatus)) {
      errors.push({
        code: `${ERROR_CODE_PREFIX}_INVALID_PHASE_TRANSITION`,
        message: `Invalid phase transition from "${data.previousStatus}" to "${currentStatus}". Allowed transitions: ${getNextStates(PHASE_TRANSITIONS, data.previousStatus).join(', ') || 'none (terminal state)'}`,
        path: '/currentPosition/status',
        details: {
          from: data.previousStatus,
          to: currentStatus,
          allowedTransitions: getNextStates(PHASE_TRANSITIONS, data.previousStatus),
        },
      });
    }
  }
}

/**
 * Validates task registry for state machine consistency.
 *
 * Checks:
 * - All tasks are in valid states
 * - Completed tasks with uncompleted dependencies (state inconsistency)
 * - Terminal state modifications attempted
 */
function validateTaskRegistryState(
  context: ValidationContext,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  const data = context.data;
  if (!isTaskRegistryData(data) || !data.tasks) {
    return;
  }

  const tasks = data.tasks;
  const taskStatusMap = new Map<string, string>();

  // Build status map
  for (const task of tasks) {
    if (task.id && task.status) {
      taskStatusMap.set(task.id, task.status);
    }
  }

  // Validate each task
  for (const task of tasks) {
    if (!task.id || !task.status) {
      continue;
    }

    const taskPath = `/tasks[${task.id}]`;

    // Check if status is valid
    if (TASK_TRANSITIONS[task.status] === undefined) {
      errors.push({
        code: `${ERROR_CODE_PREFIX}_UNKNOWN_TASK_STATUS`,
        message: `Task ${task.id} has unknown status "${task.status}". Valid statuses: ${Object.keys(TASK_TRANSITIONS).join(', ')}`,
        path: `${taskPath}/status`,
        details: {
          taskId: task.id,
          status: task.status,
          validStatuses: Object.keys(TASK_TRANSITIONS),
        },
      });
      continue;
    }

    // Check for completed task with uncompleted dependencies (state inconsistency)
    if (task.status === 'completed' && task.dependencies && task.dependencies.length > 0) {
      const uncompletedDeps: string[] = [];

      for (const depId of task.dependencies) {
        const depStatus = taskStatusMap.get(depId);
        if (depStatus && depStatus !== 'completed') {
          uncompletedDeps.push(`${depId} (${depStatus})`);
        }
      }

      if (uncompletedDeps.length > 0) {
        errors.push({
          code: `${ERROR_CODE_PREFIX}_COMPLETED_WITH_PENDING_DEPS`,
          message: `Task ${task.id} is completed but has uncompleted dependencies: ${uncompletedDeps.join(', ')}`,
          path: `${taskPath}/status`,
          details: {
            taskId: task.id,
            uncompletedDependencies: uncompletedDeps,
          },
        });
      }
    }

    // Check for in_progress task that should be blocked
    if (task.status === 'in_progress' && task.dependencies && task.dependencies.length > 0) {
      const blockingDeps: string[] = [];

      for (const depId of task.dependencies) {
        const depStatus = taskStatusMap.get(depId);
        if (depStatus && depStatus !== 'completed') {
          blockingDeps.push(`${depId} (${depStatus})`);
        }
      }

      if (blockingDeps.length > 0) {
        warnings.push({
          code: `${WARNING_CODE_PREFIX}_SHOULD_BE_BLOCKED`,
          message: `Task ${task.id} is in_progress but has uncompleted dependencies: ${blockingDeps.join(', ')}. Consider marking as blocked.`,
          path: `${taskPath}/status`,
        });
      }
    }

    // Check for blocked task without blockedBy reason
    if (task.status === 'blocked' && !task.blockedBy) {
      warnings.push({
        code: `${WARNING_CODE_PREFIX}_BLOCKED_NO_REASON`,
        message: `Task ${task.id} is blocked but has no blockedBy reason specified`,
        path: `${taskPath}/blockedBy`,
      });
    }
  }

  // Check for transition violations if we have previous state
  const previousState = extractPreviousState(context);
  if (previousState?.taskStatuses) {
    for (const task of tasks) {
      if (!task.id || !task.status) {
        continue;
      }

      const previousStatus = previousState.taskStatuses.get(task.id);
      if (previousStatus && previousStatus !== task.status) {
        // Validate the transition
        if (!isValidTransition(TASK_TRANSITIONS, previousStatus, task.status)) {
          errors.push({
            code: `${ERROR_CODE_PREFIX}_INVALID_TASK_TRANSITION`,
            message: `Invalid task transition for ${task.id}: "${previousStatus}" -> "${task.status}". Allowed transitions from "${previousStatus}": ${getNextStates(TASK_TRANSITIONS, previousStatus).join(', ') || 'none (terminal state)'}`,
            path: `/tasks[${task.id}]/status`,
            details: {
              taskId: task.id,
              from: previousStatus,
              to: task.status,
              allowedTransitions: getNextStates(TASK_TRANSITIONS, previousStatus),
            },
          });
        }

        // Check for terminal state modification
        if (isTerminalState(TASK_TRANSITIONS, previousStatus)) {
          errors.push({
            code: `${ERROR_CODE_PREFIX}_TERMINAL_STATE_MODIFIED`,
            message: `Task ${task.id} was in terminal state "${previousStatus}" and cannot be modified`,
            path: `/tasks[${task.id}]/status`,
            details: {
              taskId: task.id,
              terminalStatus: previousStatus,
              attemptedStatus: task.status,
            },
          });
        }
      }
    }
  }
}

/**
 * Validates plan for state machine consistency.
 *
 * Plans have simpler state machines - mainly checking for valid status if present.
 */
function validatePlanState(
  _context: ValidationContext,
  _errors: ValidationError[],
  _warnings: ValidationWarning[]
): void {
  // Plans don't typically have internal state that requires state machine validation
  // The dependencies are validated in the referential layer
  // Status transitions would be validated if plans had a status field
}

// ============================================================================
// State Machine Layer Implementation
// ============================================================================

/**
 * State machine validation layer implementation.
 *
 * Validates that state transitions follow allowed paths:
 * - Task status transitions follow the defined state machine
 * - Phase status transitions are valid
 * - Terminal states are not modified
 * - State consistency (completed tasks shouldn't have pending dependencies)
 *
 * This is the fourth and final layer in the 4-layer validation pipeline.
 *
 * @param context - The validation context containing data and metadata
 * @returns LayerResult with validation outcome
 *
 * @example
 * ```ts
 * const result = await stateMachineLayer({
 *   projectPath: '/path/to/project',
 *   fileType: 'task-registry',
 *   filePath: '/path/to/project/.planning/TASKS.json',
 *   data: parsedTasksJson,
 *   previousResults: previousValidationResults, // For transition tracking
 * });
 *
 * if (!result.valid) {
 *   console.error('State machine validation failed:', result.errors);
 *   // Check for specific error codes
 *   const hasInvalidTransition = result.errors.some(
 *     e => e.code === 'STATE_MACHINE_INVALID_TASK_TRANSITION'
 *   );
 * }
 * ```
 */
export const stateMachineLayer: ValidationLayer = async (
  context: ValidationContext
): Promise<LayerResult> => {
  const startTime = Date.now();
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  try {
    switch (context.fileType) {
      case 'state':
        validateStateTransitions(context, errors, warnings);
        break;
      case 'plan':
        validatePlanState(context, errors, warnings);
        break;
      case 'task-registry':
        validateTaskRegistryState(context, errors, warnings);
        break;
      default: {
        // TypeScript exhaustiveness check
        const _exhaustive: never = context.fileType;
        throw new Error(`Unknown file type: ${_exhaustive}`);
      }
    }

    const durationMs = Date.now() - startTime;

    // Capture current state for future transition validation
    const currentState = captureCurrentState(context);

    if (errors.length === 0) {
      return {
        layer: 'state-machine' as const,
        valid: true,
        errors: [],
        warnings,
        metadata: {
          exitCode: ExitCode.SUCCESS,
          durationMs,
          fileType: context.fileType,
          warningCount: warnings.length,
          previousState: currentState, // Store for next validation run
        },
      };
    }

    return createFailureResult('state-machine', errors, warnings, {
      exitCode: ExitCode.VALIDATION_STATE_MACHINE,
      durationMs,
      fileType: context.fileType,
      errorCount: errors.length,
      warningCount: warnings.length,
      previousState: currentState,
    });
  } catch (error) {
    // Handle unexpected errors during validation
    const durationMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    return createFailureResult(
      'state-machine',
      [
        {
          code: `${ERROR_CODE_PREFIX}_INTERNAL_ERROR`,
          message: `State machine validation failed unexpectedly: ${errorMessage}`,
          path: '/',
          details: {
            error: errorMessage,
          },
        },
      ],
      warnings,
      {
        exitCode: ExitCode.VALIDATION_STATE_MACHINE,
        durationMs,
        fileType: context.fileType,
      }
    );
  }
};

/**
 * Captures the current state for future transition validation.
 * This state is stored in metadata and used on the next validation run.
 */
function captureCurrentState(context: ValidationContext): PreviousState {
  const state: PreviousState = {};

  if (context.fileType === 'state' && isStateData(context.data)) {
    state.phaseStatus = context.data.currentPosition?.status;
  }

  if (context.fileType === 'task-registry' && isTaskRegistryData(context.data)) {
    const taskStatuses = new Map<string, string>();
    for (const task of context.data.tasks ?? []) {
      if (task.id && task.status) {
        taskStatuses.set(task.id, task.status);
      }
    }
    state.taskStatuses = taskStatuses;
  }

  return state;
}

/**
 * Validates a proposed status transition for a task.
 *
 * @param from - Current status
 * @param to - Proposed new status
 * @returns ValidationError if invalid, undefined if valid
 *
 * @example
 * ```ts
 * const error = validateTaskTransition('pending', 'completed');
 * // Returns error: Invalid transition, must go through in_progress
 *
 * const error = validateTaskTransition('pending', 'in_progress');
 * // Returns undefined (valid)
 * ```
 */
export function validateTaskTransition(
  from: string,
  to: string
): ValidationError | undefined {
  if (from === to) {
    return undefined; // No-op is always valid
  }

  if (TASK_TRANSITIONS[from] === undefined) {
    return {
      code: `${ERROR_CODE_PREFIX}_UNKNOWN_STATUS`,
      message: `Unknown task status "${from}"`,
      details: {
        status: from,
        validStatuses: Object.keys(TASK_TRANSITIONS),
      },
    };
  }

  if (isTerminalState(TASK_TRANSITIONS, from)) {
    return {
      code: `${ERROR_CODE_PREFIX}_TERMINAL_STATE_MODIFIED`,
      message: `Cannot transition from terminal state "${from}"`,
      details: {
        from,
        to,
        isTerminal: true,
      },
    };
  }

  if (!isValidTransition(TASK_TRANSITIONS, from, to)) {
    return {
      code: `${ERROR_CODE_PREFIX}_INVALID_TRANSITION`,
      message: `Invalid transition from "${from}" to "${to}". Allowed: ${getNextStates(TASK_TRANSITIONS, from).join(', ')}`,
      details: {
        from,
        to,
        allowedTransitions: getNextStates(TASK_TRANSITIONS, from),
      },
    };
  }

  return undefined;
}

/**
 * Validates a proposed phase status transition.
 *
 * @param from - Current phase status
 * @param to - Proposed new phase status
 * @returns ValidationError if invalid, undefined if valid
 */
export function validatePhaseTransition(
  from: string,
  to: string
): ValidationError | undefined {
  if (from === to) {
    return undefined;
  }

  if (PHASE_TRANSITIONS[from] === undefined) {
    return {
      code: `${ERROR_CODE_PREFIX}_UNKNOWN_PHASE_STATUS`,
      message: `Unknown phase status "${from}"`,
      details: {
        status: from,
        validStatuses: Object.keys(PHASE_TRANSITIONS),
      },
    };
  }

  if (isTerminalState(PHASE_TRANSITIONS, from)) {
    return {
      code: `${ERROR_CODE_PREFIX}_TERMINAL_STATE_MODIFIED`,
      message: `Cannot transition from terminal phase status "${from}"`,
      details: {
        from,
        to,
        isTerminal: true,
      },
    };
  }

  if (!isValidTransition(PHASE_TRANSITIONS, from, to)) {
    return {
      code: `${ERROR_CODE_PREFIX}_INVALID_PHASE_TRANSITION`,
      message: `Invalid phase transition from "${from}" to "${to}". Allowed: ${getNextStates(PHASE_TRANSITIONS, from).join(', ')}`,
      details: {
        from,
        to,
        allowedTransitions: getNextStates(PHASE_TRANSITIONS, from),
      },
    };
  }

  return undefined;
}
