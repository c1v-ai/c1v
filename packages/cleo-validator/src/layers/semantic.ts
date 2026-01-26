/**
 * Semantic Validation Layer
 *
 * Second layer of the 4-layer CLEO validation system.
 * Validates that values are logically correct beyond just structure.
 *
 * Checks include:
 * - Status transitions are valid
 * - Dates are in chronological order
 * - Scores are within valid ranges
 * - Required companion fields are present based on status
 *
 * Exit Code: 6 (VALIDATION_SEMANTIC) on failure
 *
 * @module layers/semantic
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
 * Error code prefix for semantic validation errors.
 */
const ERROR_CODE_PREFIX = 'SEMANTIC';

/**
 * Warning code prefix for semantic validation warnings.
 */
const WARNING_CODE_PREFIX = 'SEMANTIC_WARN';

/**
 * Valid task status values.
 */
const VALID_TASK_STATUSES = ['pending', 'in_progress', 'completed', 'blocked'] as const;

/**
 * Valid state status values.
 */
const VALID_STATE_STATUSES = ['planning', 'executing', 'verifying', 'complete', 'blocked', 'Ready to start'] as const;

/**
 * Valid priority values for plans.
 */
const VALID_PRIORITIES = ['critical', 'high', 'medium', 'low'] as const;

/**
 * Valid status transitions for tasks.
 * Maps current status to allowed next statuses.
 */
const VALID_STATUS_TRANSITIONS: Record<string, readonly string[]> = {
  pending: ['in_progress', 'blocked'],
  in_progress: ['completed', 'blocked'],
  blocked: ['pending', 'in_progress'],
  completed: [], // Terminal state - no transitions allowed
} as const;

/**
 * ISO 8601 datetime regex pattern.
 */
const ISO_DATETIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;

/**
 * ISO date pattern (YYYY-MM-DD).
 */
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Plan ID pattern (XX-YY format).
 */
const PLAN_ID_PATTERN = /^\d{2}-\d{2}$/;

// ============================================================================
// Type Guards
// ============================================================================

interface StateData {
  currentPosition?: {
    phase?: unknown;
    status?: string;
  };
  decisions?: Array<{
    date?: string;
    decision?: string;
    rationale?: string;
  }>;
  sessionLog?: Array<{
    timestamp?: string;
    action?: string;
  }>;
}

interface PlanData {
  wave?: number;
  plan?: number;
  autonomous?: boolean;
  priority?: string;
  depends_on?: string[];
}

interface TaskData {
  id?: string;
  status?: string;
  leverage?: number;
  phase?: number;
  created?: string;
  completed?: string;
  blockedBy?: string;
}

interface TaskRegistryData {
  tasks?: TaskData[];
  lastTaskId?: number;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStateData(data: unknown): data is StateData {
  return isObject(data);
}

function isPlanData(data: unknown): data is PlanData {
  return isObject(data);
}

function isTaskRegistryData(data: unknown): data is TaskRegistryData {
  return isObject(data);
}

// ============================================================================
// Date Validation Helpers
// ============================================================================

/**
 * Checks if a string is a valid ISO date (YYYY-MM-DD).
 */
function isValidISODate(dateStr: string): boolean {
  if (!ISO_DATE_PATTERN.test(dateStr)) {
    return false;
  }
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

/**
 * Checks if a string is a valid ISO datetime.
 */
function isValidISODateTime(dateStr: string): boolean {
  if (!ISO_DATETIME_PATTERN.test(dateStr)) {
    return false;
  }
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

/**
 * Parses a date string (flexible format) and returns a Date object or null.
 */
function parseDate(dateStr: string): Date | null {
  // Try ISO datetime first
  if (ISO_DATETIME_PATTERN.test(dateStr)) {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  }
  // Try ISO date
  if (ISO_DATE_PATTERN.test(dateStr)) {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  }
  // Try flexible formats (e.g., "2026-01-23 14:30")
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Checks if dates in an array are in chronological order.
 */
function areDatesChronological(dates: (Date | null)[]): { valid: boolean; firstInvalidIndex?: number } {
  const validDates = dates.filter((d): d is Date => d !== null);
  for (let i = 1; i < validDates.length; i++) {
    const current = validDates[i];
    const previous = validDates[i - 1];
    if (current && previous && current.getTime() < previous.getTime()) {
      return { valid: false, firstInvalidIndex: i };
    }
  }
  return { valid: true };
}

// ============================================================================
// State Semantic Validation
// ============================================================================

/**
 * Validates semantic correctness of STATE file data.
 */
function validateStateSemantics(
  data: unknown,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  if (!isStateData(data)) {
    return;
  }

  // Validate phase is a positive integer (if numeric)
  if (data.currentPosition?.phase !== undefined) {
    const phase = data.currentPosition.phase;
    if (typeof phase === 'number') {
      if (!Number.isInteger(phase)) {
        errors.push({
          code: `${ERROR_CODE_PREFIX}_INVALID_PHASE`,
          message: 'Phase must be an integer',
          path: '/currentPosition/phase',
          details: { value: phase },
        });
      } else if (phase < 0) {
        errors.push({
          code: `${ERROR_CODE_PREFIX}_NEGATIVE_PHASE`,
          message: 'Phase must be a non-negative integer (0 = Planning)',
          path: '/currentPosition/phase',
          details: { value: phase },
        });
      }
    }
  }

  // Validate status is valid
  if (data.currentPosition?.status !== undefined) {
    const status = data.currentPosition.status;
    if (!VALID_STATE_STATUSES.includes(status as typeof VALID_STATE_STATUSES[number])) {
      errors.push({
        code: `${ERROR_CODE_PREFIX}_INVALID_STATUS`,
        message: `Invalid status "${status}". Valid values: ${VALID_STATE_STATUSES.join(', ')}`,
        path: '/currentPosition/status',
        details: { value: status, validValues: VALID_STATE_STATUSES },
      });
    }
  }

  // Validate decisions dates are in ISO format and chronological order
  if (Array.isArray(data.decisions) && data.decisions.length > 0) {
    const dates: (Date | null)[] = [];

    data.decisions.forEach((decision, index) => {
      if (decision.date !== undefined) {
        if (!isValidISODate(decision.date)) {
          errors.push({
            code: `${ERROR_CODE_PREFIX}_INVALID_DATE_FORMAT`,
            message: `Decision date must be in YYYY-MM-DD format, got "${decision.date}"`,
            path: `/decisions/${index}/date`,
            details: { value: decision.date, expectedFormat: 'YYYY-MM-DD' },
          });
        }
        dates.push(parseDate(decision.date));
      }
    });

    // Check chronological order
    const chronoCheck = areDatesChronological(dates);
    if (!chronoCheck.valid && chronoCheck.firstInvalidIndex !== undefined) {
      warnings.push({
        code: `${WARNING_CODE_PREFIX}_DECISIONS_NOT_CHRONOLOGICAL`,
        message: `Decisions are not in chronological order starting at index ${chronoCheck.firstInvalidIndex}`,
        path: `/decisions/${chronoCheck.firstInvalidIndex}/date`,
      });
    }
  }

  // Validate session log timestamps are chronological
  if (Array.isArray(data.sessionLog) && data.sessionLog.length > 0) {
    const dates: (Date | null)[] = [];

    data.sessionLog.forEach((entry, index) => {
      if (entry.timestamp !== undefined) {
        const parsed = parseDate(entry.timestamp);
        if (parsed === null) {
          warnings.push({
            code: `${WARNING_CODE_PREFIX}_INVALID_TIMESTAMP`,
            message: `Session log timestamp at index ${index} may not be a valid date format`,
            path: `/sessionLog/${index}/timestamp`,
          });
        }
        dates.push(parsed);
      }
    });

    // Check chronological order
    const chronoCheck = areDatesChronological(dates);
    if (!chronoCheck.valid && chronoCheck.firstInvalidIndex !== undefined) {
      warnings.push({
        code: `${WARNING_CODE_PREFIX}_SESSION_LOG_NOT_CHRONOLOGICAL`,
        message: `Session log entries are not in chronological order starting at index ${chronoCheck.firstInvalidIndex}`,
        path: `/sessionLog/${chronoCheck.firstInvalidIndex}/timestamp`,
      });
    }
  }

  // If status is "complete", warn if there's no clear completion indicator
  if (data.currentPosition?.status === 'complete') {
    // This is a soft check - just a warning since completion can be implicit
    if (!data.sessionLog || data.sessionLog.length === 0) {
      warnings.push({
        code: `${WARNING_CODE_PREFIX}_COMPLETE_NO_SESSION_LOG`,
        message: 'Status is "complete" but no session log entries exist to document the work',
        path: '/currentPosition/status',
      });
    }
  }
}

// ============================================================================
// Plan Semantic Validation
// ============================================================================

/**
 * Validates semantic correctness of PLAN file data.
 */
function validatePlanSemantics(
  data: unknown,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  if (!isPlanData(data)) {
    return;
  }

  // Validate wave is a positive integer
  if (data.wave !== undefined) {
    if (!Number.isInteger(data.wave)) {
      errors.push({
        code: `${ERROR_CODE_PREFIX}_INVALID_WAVE`,
        message: 'Wave must be a positive integer',
        path: '/wave',
        details: { value: data.wave },
      });
    } else if (data.wave < 1) {
      errors.push({
        code: `${ERROR_CODE_PREFIX}_INVALID_WAVE_VALUE`,
        message: 'Wave must be at least 1',
        path: '/wave',
        details: { value: data.wave },
      });
    }
  }

  // Validate plan number is a positive integer
  if (data.plan !== undefined) {
    if (!Number.isInteger(data.plan)) {
      errors.push({
        code: `${ERROR_CODE_PREFIX}_INVALID_PLAN_NUMBER`,
        message: 'Plan number must be a positive integer',
        path: '/plan',
        details: { value: data.plan },
      });
    } else if (data.plan < 1) {
      errors.push({
        code: `${ERROR_CODE_PREFIX}_INVALID_PLAN_VALUE`,
        message: 'Plan number must be at least 1',
        path: '/plan',
        details: { value: data.plan },
      });
    }
  }

  // If autonomous is false, warn that checkpoints should be present
  // (This is informational - we can't verify checkpoints at this level)
  if (data.autonomous === false) {
    warnings.push({
      code: `${WARNING_CODE_PREFIX}_NON_AUTONOMOUS_PLAN`,
      message: 'Plan is marked as non-autonomous. Ensure checkpoint markers are defined in the plan content.',
      path: '/autonomous',
    });
  }

  // Validate priority is valid
  if (data.priority !== undefined) {
    if (!VALID_PRIORITIES.includes(data.priority as typeof VALID_PRIORITIES[number])) {
      errors.push({
        code: `${ERROR_CODE_PREFIX}_INVALID_PRIORITY`,
        message: `Invalid priority "${data.priority}". Valid values: ${VALID_PRIORITIES.join(', ')}`,
        path: '/priority',
        details: { value: data.priority, validValues: VALID_PRIORITIES },
      });
    }
  }

  // Validate depends_on references use valid plan ID format
  if (Array.isArray(data.depends_on)) {
    data.depends_on.forEach((dep, index) => {
      if (typeof dep === 'string' && !PLAN_ID_PATTERN.test(dep)) {
        errors.push({
          code: `${ERROR_CODE_PREFIX}_INVALID_DEPENDENCY_FORMAT`,
          message: `Dependency "${dep}" does not match required format XX-YY (e.g., "03-01")`,
          path: `/depends_on/${index}`,
          details: { value: dep, expectedPattern: 'XX-YY' },
        });
      }
    });
  }
}

// ============================================================================
// Task Registry Semantic Validation
// ============================================================================

/**
 * Checks if a status transition is valid.
 */
function isValidStatusTransition(from: string, to: string): boolean {
  const allowedTransitions = VALID_STATUS_TRANSITIONS[from];
  return allowedTransitions?.includes(to) ?? false;
}

/**
 * Validates semantic correctness of TASK REGISTRY file data.
 */
function validateTaskRegistrySemantics(
  data: unknown,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  if (!isTaskRegistryData(data)) {
    return;
  }

  const tasks = data.tasks;
  if (!Array.isArray(tasks)) {
    return;
  }

  // Track phases for sequential validation
  const phases = new Set<number>();

  tasks.forEach((task, index) => {
    const taskPath = `/tasks/${index}`;

    // Validate leverage score is between 0-10
    if (task.leverage !== undefined) {
      if (typeof task.leverage !== 'number' || task.leverage < 0 || task.leverage > 10) {
        errors.push({
          code: `${ERROR_CODE_PREFIX}_INVALID_LEVERAGE`,
          message: `Leverage score must be between 0 and 10, got ${task.leverage}`,
          path: `${taskPath}/leverage`,
          details: { value: task.leverage, min: 0, max: 10 },
        });
      }
    }

    // Validate phase is a positive integer
    if (task.phase !== undefined) {
      if (!Number.isInteger(task.phase)) {
        errors.push({
          code: `${ERROR_CODE_PREFIX}_INVALID_TASK_PHASE`,
          message: `Task phase must be a positive integer, got ${task.phase}`,
          path: `${taskPath}/phase`,
          details: { value: task.phase },
        });
      } else if (task.phase < 1) {
        errors.push({
          code: `${ERROR_CODE_PREFIX}_NEGATIVE_TASK_PHASE`,
          message: 'Task phase must be at least 1',
          path: `${taskPath}/phase`,
          details: { value: task.phase },
        });
      } else {
        phases.add(task.phase);
      }
    }

    // Validate status is valid
    if (task.status !== undefined) {
      if (!VALID_TASK_STATUSES.includes(task.status as typeof VALID_TASK_STATUSES[number])) {
        errors.push({
          code: `${ERROR_CODE_PREFIX}_INVALID_TASK_STATUS`,
          message: `Invalid task status "${task.status}". Valid values: ${VALID_TASK_STATUSES.join(', ')}`,
          path: `${taskPath}/status`,
          details: { value: task.status, validValues: VALID_TASK_STATUSES },
        });
      }
    }

    // If status is "completed", completed timestamp must exist
    if (task.status === 'completed') {
      if (!task.completed) {
        errors.push({
          code: `${ERROR_CODE_PREFIX}_MISSING_COMPLETED_DATE`,
          message: 'Task with status "completed" must have a "completed" timestamp',
          path: `${taskPath}/completed`,
          details: { taskId: task.id, status: task.status },
        });
      }
    }

    // If status is "blocked", blockedBy reason must exist
    if (task.status === 'blocked') {
      if (!task.blockedBy) {
        errors.push({
          code: `${ERROR_CODE_PREFIX}_MISSING_BLOCKED_REASON`,
          message: 'Task with status "blocked" must have a "blockedBy" reason',
          path: `${taskPath}/blockedBy`,
          details: { taskId: task.id, status: task.status },
        });
      }
    }

    // Validate created timestamp format
    if (task.created !== undefined) {
      if (!isValidISODateTime(task.created)) {
        errors.push({
          code: `${ERROR_CODE_PREFIX}_INVALID_CREATED_FORMAT`,
          message: `Created timestamp must be in ISO 8601 format, got "${task.created}"`,
          path: `${taskPath}/created`,
          details: { value: task.created, expectedFormat: 'YYYY-MM-DDTHH:mm:ssZ' },
        });
      }
    }

    // Validate completed timestamp format
    if (task.completed !== undefined) {
      if (!isValidISODateTime(task.completed)) {
        errors.push({
          code: `${ERROR_CODE_PREFIX}_INVALID_COMPLETED_FORMAT`,
          message: `Completed timestamp must be in ISO 8601 format, got "${task.completed}"`,
          path: `${taskPath}/completed`,
          details: { value: task.completed, expectedFormat: 'YYYY-MM-DDTHH:mm:ssZ' },
        });
      }
    }

    // Validate created timestamp is before completed timestamp
    if (task.created && task.completed) {
      const createdDate = parseDate(task.created);
      const completedDate = parseDate(task.completed);

      if (createdDate && completedDate && completedDate.getTime() < createdDate.getTime()) {
        errors.push({
          code: `${ERROR_CODE_PREFIX}_INVALID_DATE_ORDER`,
          message: 'Completed timestamp must be after created timestamp',
          path: `${taskPath}/completed`,
          details: {
            taskId: task.id,
            created: task.created,
            completed: task.completed,
          },
        });
      }
    }
  });

  // Check for phase sequentiality (informational warning)
  if (phases.size > 0) {
    const sortedPhases = Array.from(phases).sort((a, b) => a - b);
    if (sortedPhases.length > 0) {
      const minPhase = sortedPhases[0] as number;
      const maxPhase = sortedPhases[sortedPhases.length - 1] as number;

      // Check if there are gaps in phase numbers
      for (let phaseNum = minPhase; phaseNum <= maxPhase; phaseNum++) {
        if (!phases.has(phaseNum)) {
          warnings.push({
            code: `${WARNING_CODE_PREFIX}_PHASE_GAP`,
            message: `Phase ${phaseNum} is missing from the task registry. Phases ${minPhase}-${maxPhase} have gaps.`,
            path: '/tasks',
          });
          break; // Only report once
        }
      }
    }
  }
}

// ============================================================================
// Status Transition Validation (for external use)
// ============================================================================

/**
 * Validates a proposed status transition.
 *
 * @param currentStatus - The current status of the task
 * @param newStatus - The proposed new status
 * @returns An error if the transition is invalid, undefined if valid
 *
 * @example
 * ```ts
 * const error = validateStatusTransition('pending', 'completed');
 * // Returns error: "Invalid status transition from 'pending' to 'completed'"
 *
 * const error = validateStatusTransition('pending', 'in_progress');
 * // Returns undefined (valid transition)
 * ```
 */
export function validateStatusTransition(
  currentStatus: string,
  newStatus: string
): ValidationError | undefined {
  if (currentStatus === newStatus) {
    return undefined; // No change is always valid
  }

  if (!VALID_STATUS_TRANSITIONS[currentStatus]) {
    return {
      code: `${ERROR_CODE_PREFIX}_UNKNOWN_CURRENT_STATUS`,
      message: `Unknown current status "${currentStatus}"`,
      details: { currentStatus, validStatuses: Object.keys(VALID_STATUS_TRANSITIONS) },
    };
  }

  if (!isValidStatusTransition(currentStatus, newStatus)) {
    return {
      code: `${ERROR_CODE_PREFIX}_INVALID_STATUS_TRANSITION`,
      message: `Invalid status transition from "${currentStatus}" to "${newStatus}". Allowed transitions from "${currentStatus}": ${VALID_STATUS_TRANSITIONS[currentStatus].join(', ') || 'none (terminal state)'}`,
      details: {
        from: currentStatus,
        to: newStatus,
        allowedTransitions: VALID_STATUS_TRANSITIONS[currentStatus],
      },
    };
  }

  return undefined;
}

/**
 * Gets the valid transitions from a given status.
 *
 * @param status - The current status
 * @returns Array of valid next statuses, or empty array if unknown/terminal
 */
export function getValidTransitions(status: string): readonly string[] {
  return VALID_STATUS_TRANSITIONS[status] ?? [];
}

// ============================================================================
// Semantic Layer Implementation
// ============================================================================

/**
 * Semantic validation layer implementation.
 *
 * Validates that values are logically correct beyond just structure:
 * - Status values are valid and transitions are allowed
 * - Dates are valid ISO format and in chronological order
 * - Scores are within valid ranges
 * - Required companion fields exist based on status
 *
 * This is the second layer in the 4-layer validation pipeline.
 *
 * @param context - The validation context containing data and metadata
 * @returns LayerResult with validation outcome
 *
 * @example
 * ```ts
 * const result = await semanticLayer({
 *   projectPath: '/path/to/project',
 *   fileType: 'task-registry',
 *   filePath: '/path/to/project/.planning/TASKS.json',
 *   data: parsedTasksJson,
 * });
 *
 * if (!result.valid) {
 *   console.error('Semantic validation failed:', result.errors);
 * }
 * ```
 */
export const semanticLayer: ValidationLayer = async (
  context: ValidationContext
): Promise<LayerResult> => {
  const startTime = Date.now();
  const { fileType, data } = context;
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  try {
    switch (fileType) {
      case 'state':
        validateStateSemantics(data, errors, warnings);
        break;
      case 'plan':
        validatePlanSemantics(data, errors, warnings);
        break;
      case 'task-registry':
        validateTaskRegistrySemantics(data, errors, warnings);
        break;
      default: {
        // TypeScript exhaustiveness check
        const _exhaustive: never = fileType;
        throw new Error(`Unknown file type: ${_exhaustive}`);
      }
    }

    const durationMs = Date.now() - startTime;

    if (errors.length === 0) {
      // Return success with any warnings collected
      return {
        layer: 'semantic' as const,
        valid: true,
        errors: [],
        warnings,
        metadata: {
          exitCode: ExitCode.SUCCESS,
          durationMs,
          fileType,
          warningCount: warnings.length,
        },
      };
    }

    return createFailureResult('semantic', errors, warnings, {
      exitCode: ExitCode.VALIDATION_SEMANTIC,
      durationMs,
      fileType,
      errorCount: errors.length,
      warningCount: warnings.length,
    });
  } catch (error) {
    // Handle unexpected errors during validation
    const durationMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    return createFailureResult(
      'semantic',
      [
        {
          code: `${ERROR_CODE_PREFIX}_INTERNAL_ERROR`,
          message: `Semantic validation failed unexpectedly: ${errorMessage}`,
          path: '/',
          details: {
            error: errorMessage,
          },
        },
      ],
      [],
      {
        exitCode: ExitCode.VALIDATION_SEMANTIC,
        durationMs,
        fileType,
      }
    );
  }
};

/**
 * Exported constants for external validation.
 */
export {
  VALID_TASK_STATUSES,
  VALID_STATE_STATUSES,
  VALID_PRIORITIES,
  VALID_STATUS_TRANSITIONS,
};
