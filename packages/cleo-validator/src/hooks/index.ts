/**
 * Validation Hooks for GSD Commands
 *
 * Provides hook utilities that can be integrated into GSD command workflows
 * to ensure validation before and after mutations, and at phase boundaries.
 *
 * These hooks integrate with the 4-layer validation system and the audit trail,
 * providing a consistent way to validate data during GSD workflow execution.
 *
 * @module hooks
 */

import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { ExitCode, type ExitCodeValue, getExitCodeName } from '../exit-codes';
import { auditValidation, auditStateChange } from '../audit';
import {
  runValidation,
  runValidationOnFile,
  runProjectValidation,
  detectFileType,
  type RunnerOptions,
  type ExtendedPipelineResult,
  type FileValidationResult,
  type ProjectValidationResult,
} from '../layers/runner';
import {
  validateTaskTransition,
  isValidTransition,
  TASK_TRANSITIONS,
} from '../layers/state-machine';
import type { ValidationContext, FileType, LayerName } from '../layers/types';

/**
 * Options for configuring validation hooks.
 */
export interface ValidationHookOptions {
  /** Project path for validation */
  projectPath: string;
  /** Whether to audit validation results (default: true) */
  audit?: boolean;
  /** Agent name for audit trail (default: 'cleo-validator') */
  agent?: string;
  /** Throw error on validation failure (default: false) */
  throwOnError?: boolean;
  /** Layers to run (default: all) */
  layers?: LayerName[];
}

/**
 * Result from a validation hook operation.
 */
export interface HookValidationResult {
  /** Whether validation passed */
  valid: boolean;
  /** Exit code from validation */
  exitCode: ExitCodeValue;
  /** Error messages (if any) */
  errors: string[];
  /** Warning messages (if any) */
  warnings: string[];
  /** Detailed validation result (for programmatic access) */
  details?: ExtendedPipelineResult | FileValidationResult;
}

/**
 * Result from project-wide validation.
 */
export interface HookProjectValidationResult {
  /** Whether all validations passed */
  valid: boolean;
  /** Exit code (first failure or SUCCESS) */
  exitCode: ExitCodeValue;
  /** Total error count */
  errorCount: number;
  /** Total warning count */
  warningCount: number;
  /** Number of files validated */
  filesValidated: number;
  /** Detailed project validation result */
  details: ProjectValidationResult;
}

/**
 * Result from a task state change validation.
 */
export interface TaskStateChangeResult {
  /** Whether the transition is valid */
  valid: boolean;
  /** Error message if invalid */
  error?: string;
  /** Allowed transitions from the current state */
  allowedTransitions?: string[];
}

/**
 * Error thrown when validation fails and throwOnError is true.
 */
export class ValidationError extends Error {
  /** Exit code from the validation */
  readonly exitCode: ExitCodeValue;
  /** Detailed errors from validation */
  readonly validationErrors: string[];

  constructor(message: string, exitCode: ExitCodeValue, errors: string[]) {
    super(message);
    this.name = 'ValidationError';
    this.exitCode = exitCode;
    this.validationErrors = errors;
  }
}

/**
 * Creates RunnerOptions from HookOptions.
 */
function createRunnerOptions(options: ValidationHookOptions): RunnerOptions {
  return {
    stopOnFirstError: true,
    layers: options.layers,
  };
}

/**
 * Extracts error messages from a validation result.
 */
function extractErrors(result: ExtendedPipelineResult | FileValidationResult): string[] {
  return result.allErrors.map(
    (e) => `[${e.code}] ${e.message}${e.path ? ` at ${e.path}` : ''}`
  );
}

/**
 * Extracts warning messages from a validation result.
 */
function extractWarnings(result: ExtendedPipelineResult | FileValidationResult): string[] {
  return result.allWarnings.map(
    (w) => `[${w.code}] ${w.message}${w.path ? ` at ${w.path}` : ''}`
  );
}

/**
 * Handles audit logging for validation results.
 */
async function auditResult(
  options: ValidationHookOptions,
  valid: boolean,
  layer: string,
  details?: unknown
): Promise<void> {
  if (options.audit !== false) {
    await auditValidation(
      options.projectPath,
      valid,
      layer,
      details,
      options.agent ?? 'cleo-validator'
    );
  }
}

/**
 * Handles throwing errors if throwOnError is enabled.
 */
function maybeThrow(
  options: ValidationHookOptions,
  result: HookValidationResult
): void {
  if (options.throwOnError && !result.valid) {
    throw new ValidationError(
      `Validation failed with exit code ${result.exitCode} (${getExitCodeName(result.exitCode)})`,
      result.exitCode,
      result.errors
    );
  }
}

/**
 * Pre-mutation hook - validate before making changes.
 *
 * Use this hook before writing to STATE.md, TASKS.json, or plan files
 * to ensure the new data is valid before persisting it.
 *
 * @param filePath - Path to the file being modified
 * @param newData - The proposed new data to validate
 * @param options - Validation hook options
 * @returns Validation result
 *
 * @example
 * ```ts
 * const result = await beforeMutation(
 *   '/path/to/project/.planning/TASKS.json',
 *   updatedTasksData,
 *   { projectPath: '/path/to/project', throwOnError: true }
 * );
 *
 * if (result.valid) {
 *   await fs.writeFile(filePath, JSON.stringify(newData, null, 2));
 * }
 * ```
 */
export async function beforeMutation(
  filePath: string,
  newData: unknown,
  options: ValidationHookOptions
): Promise<HookValidationResult> {
  // Detect file type
  const fileType = detectFileType(filePath);
  if (!fileType) {
    const result: HookValidationResult = {
      valid: false,
      exitCode: ExitCode.INVALID_ARGUMENTS,
      errors: [`Cannot determine file type for: ${filePath}`],
      warnings: [],
    };

    await auditResult(options, false, 'pre-mutation', {
      filePath,
      error: 'Unknown file type',
    });

    maybeThrow(options, result);
    return result;
  }

  // Create validation context
  const context: ValidationContext = {
    projectPath: options.projectPath,
    fileType,
    filePath,
    data: newData,
  };

  // Run validation on the proposed data
  const validationResult = await runValidation(context, createRunnerOptions(options));

  const result: HookValidationResult = {
    valid: validationResult.valid,
    exitCode: validationResult.exitCode,
    errors: extractErrors(validationResult),
    warnings: extractWarnings(validationResult),
    details: validationResult,
  };

  // Audit the validation attempt
  await auditResult(options, result.valid, 'pre-mutation', {
    filePath,
    fileType,
    layersRun: validationResult.metadata.layersRun,
    stoppedAtLayer: validationResult.metadata.stoppedAtLayer,
    errorCount: result.errors.length,
    warningCount: result.warnings.length,
  });

  maybeThrow(options, result);
  return result;
}

/**
 * Post-mutation hook - validate after making changes.
 *
 * Use this hook after writing files to confirm the persisted data
 * is valid and the file was written correctly.
 *
 * @param filePath - Path to the file that was modified
 * @param options - Validation hook options
 * @returns Validation result
 *
 * @example
 * ```ts
 * // After writing the file
 * await fs.writeFile(filePath, JSON.stringify(newData, null, 2));
 *
 * // Verify it was written correctly
 * const result = await afterMutation(
 *   '/path/to/project/.planning/TASKS.json',
 *   { projectPath: '/path/to/project' }
 * );
 *
 * if (!result.valid) {
 *   console.error('File mutation resulted in invalid state:', result.errors);
 * }
 * ```
 */
export async function afterMutation(
  filePath: string,
  options: ValidationHookOptions
): Promise<HookValidationResult> {
  // Run validation on the file from disk
  const validationResult = await runValidationOnFile(
    options.projectPath,
    filePath,
    undefined, // Auto-detect file type
    createRunnerOptions(options)
  );

  const result: HookValidationResult = {
    valid: validationResult.valid,
    exitCode: validationResult.exitCode,
    errors: extractErrors(validationResult),
    warnings: extractWarnings(validationResult),
    details: validationResult,
  };

  // Audit the validation result
  await auditResult(options, result.valid, 'post-mutation', {
    filePath,
    fileType: validationResult.fileType,
    layersRun: validationResult.metadata.layersRun,
    stoppedAtLayer: validationResult.metadata.stoppedAtLayer,
    errorCount: result.errors.length,
    warningCount: result.warnings.length,
  });

  maybeThrow(options, result);
  return result;
}

/**
 * Project validation hook - validate entire project.
 *
 * Use this hook at phase boundaries, before commits, or for periodic
 * integrity checks to ensure the entire project state is consistent.
 *
 * @param options - Validation hook options
 * @returns Combined validation results for all project files
 *
 * @example
 * ```ts
 * // Before committing changes
 * const result = await validateProjectHook({
 *   projectPath: '/path/to/project',
 *   throwOnError: true
 * });
 *
 * console.log(`Validated ${result.filesValidated} files`);
 * console.log(`Errors: ${result.errorCount}, Warnings: ${result.warningCount}`);
 * ```
 */
export async function validateProjectHook(
  options: ValidationHookOptions
): Promise<HookProjectValidationResult> {
  // Run project-wide validation
  const projectResult = await runProjectValidation(
    options.projectPath,
    createRunnerOptions(options)
  );

  const result: HookProjectValidationResult = {
    valid: projectResult.overall.valid,
    exitCode: projectResult.overall.exitCode,
    errorCount: projectResult.overall.errorCount,
    warningCount: projectResult.overall.warningCount,
    filesValidated: projectResult.overall.filesValidated,
    details: projectResult,
  };

  // Audit the project validation
  await auditResult(options, result.valid, 'project-validation', {
    filesValidated: result.filesValidated,
    errorCount: result.errorCount,
    warningCount: result.warningCount,
    stateValid: projectResult.state?.valid,
    tasksValid: projectResult.tasks?.valid,
    plansValid: projectResult.plans.every((p) => p.valid),
  });

  // Handle throw on error
  if (options.throwOnError && !result.valid) {
    const allErrors: string[] = [];

    if (projectResult.state && !projectResult.state.valid) {
      allErrors.push(...extractErrors(projectResult.state).map((e) => `[STATE] ${e}`));
    }
    if (projectResult.tasks && !projectResult.tasks.valid) {
      allErrors.push(...extractErrors(projectResult.tasks).map((e) => `[TASKS] ${e}`));
    }
    for (const plan of projectResult.plans) {
      if (!plan.valid) {
        allErrors.push(...extractErrors(plan).map((e) => `[PLAN:${plan.filePath}] ${e}`));
      }
    }

    throw new ValidationError(
      `Project validation failed with ${result.errorCount} errors`,
      result.exitCode,
      allErrors
    );
  }

  return result;
}

/**
 * Task state validation hook - validate task state changes.
 *
 * Use this hook when updating task status in TASKS.json to ensure
 * the state transition follows the allowed state machine paths.
 *
 * @param taskId - The task ID (e.g., 'T001')
 * @param fromStatus - The current status of the task
 * @param toStatus - The proposed new status
 * @param options - Validation hook options
 * @returns Validation result for the state transition
 *
 * @example
 * ```ts
 * // Before updating task status
 * const result = await validateTaskStateChange(
 *   'T001',
 *   'pending',
 *   'in_progress',
 *   { projectPath: '/path/to/project' }
 * );
 *
 * if (!result.valid) {
 *   console.error(`Invalid transition: ${result.error}`);
 *   console.log('Allowed transitions:', result.allowedTransitions);
 * }
 * ```
 */
export async function validateTaskStateChange(
  taskId: string,
  fromStatus: string,
  toStatus: string,
  options: ValidationHookOptions
): Promise<TaskStateChangeResult> {
  // Use the state machine layer's validateTaskTransition
  const error = validateTaskTransition(fromStatus, toStatus);

  const result: TaskStateChangeResult = {
    valid: error === undefined,
    error: error?.message,
    allowedTransitions: TASK_TRANSITIONS[fromStatus] ?? [],
  };

  // Audit the transition attempt
  if (options.audit !== false) {
    await auditStateChange(
      options.projectPath,
      options.agent ?? 'cleo-validator',
      { taskId, status: fromStatus },
      { taskId, status: toStatus },
      result.valid
        ? `Task ${taskId} transition: ${fromStatus} -> ${toStatus} (valid)`
        : `Task ${taskId} transition: ${fromStatus} -> ${toStatus} (invalid: ${result.error})`,
      taskId
    );
  }

  // Handle throw on error
  if (options.throwOnError && !result.valid) {
    throw new ValidationError(
      `Invalid task state transition for ${taskId}: ${fromStatus} -> ${toStatus}`,
      ExitCode.VALIDATION_STATE_MACHINE,
      [result.error!]
    );
  }

  return result;
}

/**
 * GSD command wrapper - wraps a command function with validation.
 *
 * This higher-order function wraps any async command function to automatically
 * run project validation before and/or after the command executes.
 *
 * @param command - The command function to wrap
 * @param options - Validation hook options
 * @returns A wrapped function that includes validation
 *
 * @example
 * ```ts
 * async function createTask(taskData: TaskData): Promise<void> {
 *   // ... create task logic
 * }
 *
 * const validatedCreateTask = withValidation(
 *   createTask,
 *   { projectPath: '/path/to/project', throwOnError: true }
 * );
 *
 * // Now createTask will validate the project after execution
 * await validatedCreateTask(newTaskData);
 * ```
 */
export function withValidation<T extends (...args: unknown[]) => Promise<unknown>>(
  command: T,
  options: ValidationHookOptions
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    // Execute the command
    const result = await command(...args);

    // Run post-validation on the project
    await validateProjectHook({
      ...options,
      // Don't throw during post-validation by default; let the command result through
      throwOnError: options.throwOnError,
    });

    return result as ReturnType<T>;
  }) as T;
}

/**
 * Mutation wrapper - wraps a file mutation with before/after validation.
 *
 * This higher-order function wraps a mutation function to automatically
 * validate data before writing and verify the file after writing.
 *
 * @param mutationFn - The mutation function that returns the new data
 * @param filePath - Path to the file being mutated
 * @param options - Validation hook options
 * @returns A wrapped function that includes validation
 *
 * @example
 * ```ts
 * const result = await withMutationValidation(
 *   async () => {
 *     const tasks = await readTasks();
 *     tasks.tasks[0].status = 'completed';
 *     return tasks;
 *   },
 *   '/path/to/project/.planning/TASKS.json',
 *   { projectPath: '/path/to/project' }
 * );
 * ```
 */
export async function withMutationValidation<T>(
  mutationFn: () => Promise<T>,
  filePath: string,
  options: ValidationHookOptions
): Promise<{ data: T; preValidation: HookValidationResult; postValidation: HookValidationResult }> {
  // Execute the mutation function to get the new data
  const newData = await mutationFn();

  // Pre-validation
  const preValidation = await beforeMutation(filePath, newData, {
    ...options,
    throwOnError: false, // We'll handle throw after both validations
  });

  if (!preValidation.valid) {
    if (options.throwOnError) {
      throw new ValidationError(
        'Pre-mutation validation failed',
        preValidation.exitCode,
        preValidation.errors
      );
    }
    return {
      data: newData,
      preValidation,
      postValidation: {
        valid: false,
        exitCode: ExitCode.GENERAL_ERROR,
        errors: ['Skipped: pre-mutation validation failed'],
        warnings: [],
      },
    };
  }

  // Write the file
  await fs.writeFile(filePath, JSON.stringify(newData, null, 2), 'utf-8');

  // Post-validation
  const postValidation = await afterMutation(filePath, {
    ...options,
    throwOnError: false,
  });

  if (options.throwOnError && !postValidation.valid) {
    throw new ValidationError(
      'Post-mutation validation failed',
      postValidation.exitCode,
      postValidation.errors
    );
  }

  return { data: newData, preValidation, postValidation };
}

/**
 * Validates that a file exists and is valid.
 *
 * Combines file existence check with validation in a single call.
 *
 * @param filePath - Path to the file to validate
 * @param options - Validation hook options
 * @returns Validation result
 *
 * @example
 * ```ts
 * const result = await validateFileExists(
 *   '/path/to/project/.planning/TASKS.json',
 *   { projectPath: '/path/to/project' }
 * );
 *
 * if (!result.valid) {
 *   if (result.exitCode === ExitCode.RESOURCE_NOT_FOUND) {
 *     console.log('File does not exist');
 *   } else {
 *     console.log('File exists but is invalid:', result.errors);
 *   }
 * }
 * ```
 */
export async function validateFileExists(
  filePath: string,
  options: ValidationHookOptions
): Promise<HookValidationResult> {
  // Check if file exists
  try {
    await fs.access(filePath);
  } catch {
    const result: HookValidationResult = {
      valid: false,
      exitCode: ExitCode.RESOURCE_NOT_FOUND,
      errors: [`File does not exist: ${filePath}`],
      warnings: [],
    };

    await auditResult(options, false, 'file-exists', {
      filePath,
      error: 'File not found',
    });

    maybeThrow(options, result);
    return result;
  }

  // File exists, validate it
  return afterMutation(filePath, options);
}

/**
 * Creates a validation checkpoint that can be used to verify
 * project state hasn't diverged during long-running operations.
 *
 * @param options - Validation hook options
 * @returns A checkpoint function that validates and compares state
 *
 * @example
 * ```ts
 * const checkpoint = await createValidationCheckpoint({
 *   projectPath: '/path/to/project'
 * });
 *
 * // ... perform operations ...
 *
 * const isValid = await checkpoint.verify();
 * if (!isValid.valid) {
 *   console.log('Project state diverged during operation');
 * }
 * ```
 */
export async function createValidationCheckpoint(
  options: ValidationHookOptions
): Promise<{
  timestamp: Date;
  initialResult: HookProjectValidationResult;
  verify: () => Promise<{
    valid: boolean;
    changed: boolean;
    currentResult: HookProjectValidationResult;
  }>;
}> {
  const timestamp = new Date();
  const initialResult = await validateProjectHook({ ...options, throwOnError: false });

  return {
    timestamp,
    initialResult,
    verify: async () => {
      const currentResult = await validateProjectHook({ ...options, throwOnError: false });

      // Check if the validation state changed
      const changed =
        initialResult.valid !== currentResult.valid ||
        initialResult.errorCount !== currentResult.errorCount ||
        initialResult.warningCount !== currentResult.warningCount ||
        initialResult.filesValidated !== currentResult.filesValidated;

      return {
        valid: currentResult.valid,
        changed,
        currentResult,
      };
    },
  };
}
