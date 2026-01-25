/**
 * CLEO Exit Codes
 *
 * Standardized exit codes for programmatic error handling across all agents.
 * These codes enable consistent error classification and automated recovery strategies.
 *
 * @module exit-codes
 */

/**
 * CLEO Exit Code enumeration.
 * Each code represents a specific outcome or error condition.
 */
export const ExitCode = {
  /**
   * Operation completed successfully.
   * Use when the task finishes without any errors.
   */
  SUCCESS: 0,

  /**
   * General/unspecified error.
   * Use as a fallback when no specific error code applies.
   */
  GENERAL_ERROR: 1,

  /**
   * Invalid arguments provided.
   * Use when function/command arguments fail validation.
   */
  INVALID_ARGUMENTS: 2,

  /**
   * Task not found.
   * Use when a referenced task ID does not exist.
   */
  TASK_NOT_FOUND: 3,

  /**
   * Dependency cycle detected.
   * Use when task dependencies form a circular reference.
   */
  DEPENDENCY_CYCLE: 4,

  /**
   * Schema validation failed.
   * Use when JSON/data structure does not match expected schema.
   */
  VALIDATION_SCHEMA: 5,

  /**
   * Semantic validation failed.
   * Use when values are structurally valid but semantically incorrect
   * (e.g., invalid status transitions, out-of-range values).
   */
  VALIDATION_SEMANTIC: 6,

  /**
   * Referential validation failed.
   * Use when referenced IDs or entities do not exist.
   */
  VALIDATION_REFERENTIAL: 7,

  /**
   * State machine validation failed.
   * Use when a state transition violates allowed paths.
   */
  VALIDATION_STATE_MACHINE: 8,

  /**
   * Lock timeout.
   * Use when unable to acquire a lock within the allowed time.
   */
  LOCK_TIMEOUT: 9,

  /**
   * Permission denied.
   * Use when the operation is not allowed for the current user/agent.
   */
  PERMISSION_DENIED: 10,

  /**
   * Resource not found.
   * Use when a required resource (file, record, etc.) does not exist.
   */
  RESOURCE_NOT_FOUND: 11,

  /**
   * Conflict due to concurrent modification.
   * Use when optimistic locking fails or version mismatch occurs.
   */
  CONFLICT: 12,

  /**
   * Operation timeout.
   * Use when an operation exceeds its allowed execution time.
   */
  TIMEOUT: 13,

  /**
   * Rate limited.
   * Use when too many requests have been made in a time window.
   */
  RATE_LIMITED: 14,

  /**
   * External service error.
   * Use when a third-party service (API, database, etc.) fails.
   */
  EXTERNAL_SERVICE_ERROR: 15,

  /**
   * Hallucination detected.
   * Use when AI output fails factual verification or references non-existent entities.
   */
  HALLUCINATION_DETECTED: 16,

  /**
   * Manual intervention required.
   * Use when automated processing cannot continue without human input.
   */
  MANUAL_INTERVENTION_REQUIRED: 17,
} as const;

/**
 * Type representing valid exit code values (0-17).
 */
export type ExitCodeValue = (typeof ExitCode)[keyof typeof ExitCode];

/**
 * Type representing exit code names.
 */
export type ExitCodeName = keyof typeof ExitCode;

/**
 * Structured result type for operations that return exit codes.
 */
export interface ExitCodeResult {
  /** The exit code indicating the operation outcome */
  code: ExitCodeValue;
  /** Optional human-readable message describing the outcome */
  message?: string;
  /** Optional additional details (error stack, validation errors, etc.) */
  details?: unknown;
}

/**
 * Mapping of exit codes to their human-readable descriptions.
 */
const EXIT_CODE_DESCRIPTIONS: Record<ExitCodeValue, string> = {
  [ExitCode.SUCCESS]: 'Operation completed successfully',
  [ExitCode.GENERAL_ERROR]: 'An unspecified error occurred',
  [ExitCode.INVALID_ARGUMENTS]: 'Invalid arguments were provided',
  [ExitCode.TASK_NOT_FOUND]: 'The specified task was not found',
  [ExitCode.DEPENDENCY_CYCLE]: 'A circular dependency was detected',
  [ExitCode.VALIDATION_SCHEMA]: 'Schema validation failed',
  [ExitCode.VALIDATION_SEMANTIC]: 'Semantic validation failed',
  [ExitCode.VALIDATION_REFERENTIAL]: 'Referential integrity validation failed',
  [ExitCode.VALIDATION_STATE_MACHINE]: 'State machine transition validation failed',
  [ExitCode.LOCK_TIMEOUT]: 'Failed to acquire lock within timeout period',
  [ExitCode.PERMISSION_DENIED]: 'Permission denied for this operation',
  [ExitCode.RESOURCE_NOT_FOUND]: 'Required resource was not found',
  [ExitCode.CONFLICT]: 'Conflict due to concurrent modification',
  [ExitCode.TIMEOUT]: 'Operation timed out',
  [ExitCode.RATE_LIMITED]: 'Rate limit exceeded',
  [ExitCode.EXTERNAL_SERVICE_ERROR]: 'External service returned an error',
  [ExitCode.HALLUCINATION_DETECTED]: 'AI hallucination was detected',
  [ExitCode.MANUAL_INTERVENTION_REQUIRED]: 'Manual intervention is required to proceed',
};

/**
 * Reverse mapping from code value to name.
 */
const CODE_TO_NAME: Record<number, ExitCodeName> = Object.entries(ExitCode).reduce(
  (acc, [name, code]) => {
    acc[code] = name as ExitCodeName;
    return acc;
  },
  {} as Record<number, ExitCodeName>
);

/**
 * Checks if the exit code indicates success.
 *
 * @param code - The exit code to check
 * @returns true if the code is SUCCESS (0)
 *
 * @example
 * ```ts
 * if (isSuccess(result.code)) {
 *   console.log('Operation succeeded');
 * }
 * ```
 */
export function isSuccess(code: number): code is typeof ExitCode.SUCCESS {
  return code === ExitCode.SUCCESS;
}

/**
 * Checks if the exit code indicates a validation error (codes 5-8).
 * Validation errors include schema, semantic, referential, and state machine failures.
 *
 * @param code - The exit code to check
 * @returns true if the code is a validation error (5-8)
 *
 * @example
 * ```ts
 * if (isValidationError(result.code)) {
 *   console.log('Fix validation issues before retrying');
 * }
 * ```
 */
export function isValidationError(code: number): boolean {
  return (
    code >= ExitCode.VALIDATION_SCHEMA && code <= ExitCode.VALIDATION_STATE_MACHINE
  );
}

/**
 * Checks if the exit code indicates a retryable error.
 * Retryable errors include: lock timeout, timeout, rate limited, external service error.
 *
 * @param code - The exit code to check
 * @returns true if the error is potentially recoverable through retry
 *
 * @example
 * ```ts
 * if (isRetryable(result.code)) {
 *   await sleep(backoffMs);
 *   return retry(operation);
 * }
 * ```
 */
export function isRetryable(code: number): boolean {
  return (
    code === ExitCode.LOCK_TIMEOUT ||
    code === ExitCode.TIMEOUT ||
    code === ExitCode.RATE_LIMITED ||
    code === ExitCode.EXTERNAL_SERVICE_ERROR
  );
}

/**
 * Checks if the exit code indicates an error that requires human intervention.
 *
 * @param code - The exit code to check
 * @returns true if manual intervention is needed
 *
 * @example
 * ```ts
 * if (requiresIntervention(result.code)) {
 *   notifyOperations(result);
 * }
 * ```
 */
export function requiresIntervention(code: number): boolean {
  return (
    code === ExitCode.MANUAL_INTERVENTION_REQUIRED ||
    code === ExitCode.HALLUCINATION_DETECTED ||
    code === ExitCode.PERMISSION_DENIED
  );
}

/**
 * Gets the name of an exit code.
 *
 * @param code - The exit code value
 * @returns The name of the exit code, or 'UNKNOWN' if not recognized
 *
 * @example
 * ```ts
 * getExitCodeName(0) // => 'SUCCESS'
 * getExitCodeName(5) // => 'VALIDATION_SCHEMA'
 * getExitCodeName(99) // => 'UNKNOWN'
 * ```
 */
export function getExitCodeName(code: number): string {
  return CODE_TO_NAME[code] ?? 'UNKNOWN';
}

/**
 * Gets a human-readable description of an exit code.
 *
 * @param code - The exit code value
 * @returns A description of what the exit code means
 *
 * @example
 * ```ts
 * getExitCodeDescription(0) // => 'Operation completed successfully'
 * getExitCodeDescription(16) // => 'AI hallucination was detected'
 * ```
 */
export function getExitCodeDescription(code: number): string {
  return (
    EXIT_CODE_DESCRIPTIONS[code as ExitCodeValue] ?? `Unknown exit code: ${code}`
  );
}

/**
 * Creates a successful result.
 *
 * @param message - Optional success message
 * @param details - Optional additional details
 * @returns An ExitCodeResult with SUCCESS code
 *
 * @example
 * ```ts
 * return success('Task T001 completed');
 * ```
 */
export function success(message?: string, details?: unknown): ExitCodeResult {
  return {
    code: ExitCode.SUCCESS,
    message,
    details,
  };
}

/**
 * Creates a failure result.
 *
 * @param code - The exit code (must not be SUCCESS)
 * @param message - Optional error message
 * @param details - Optional additional details (e.g., validation errors, stack trace)
 * @returns An ExitCodeResult with the specified error code
 *
 * @example
 * ```ts
 * return failure(ExitCode.VALIDATION_SCHEMA, 'Invalid JSON structure', { errors });
 * ```
 */
export function failure(
  code: Exclude<ExitCodeValue, typeof ExitCode.SUCCESS>,
  message?: string,
  details?: unknown
): ExitCodeResult {
  return {
    code,
    message: message ?? getExitCodeDescription(code),
    details,
  };
}

/**
 * Type guard to check if a value is a valid exit code.
 *
 * @param value - The value to check
 * @returns true if the value is a valid CLEO exit code (0-17)
 */
export function isValidExitCode(value: unknown): value is ExitCodeValue {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= 17
  );
}
