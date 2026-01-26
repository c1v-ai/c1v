/**
 * Validation Runner
 *
 * Orchestrates all 4 validation layers in sequence, collecting results
 * and producing a combined validation report.
 *
 * Layers are executed in order:
 * 1. Schema - JSON structure validation
 * 2. Semantic - Value correctness validation
 * 3. Referential - Reference existence validation
 * 4. State Machine - State transition validation
 *
 * @module layers/runner
 */

import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { ExitCode, type ExitCodeValue } from '../exit-codes';
import { schemaLayer } from './schema';
import { semanticLayer } from './semantic';
import { referentialLayer } from './referential';
import { stateMachineLayer } from './state-machine';
import {
  type ValidationContext,
  type LayerResult,
  type ValidationPipelineResult,
  type ValidationError,
  type ValidationWarning,
  type FileType,
  type LayerName,
} from './types';

/**
 * The 4 validation layers in execution order.
 */
const LAYERS = [
  { name: 'schema' as const, fn: schemaLayer },
  { name: 'semantic' as const, fn: semanticLayer },
  { name: 'referential' as const, fn: referentialLayer },
  { name: 'state-machine' as const, fn: stateMachineLayer },
] as const;

/**
 * Layer name to layer configuration mapping.
 */
const LAYER_MAP = new Map(LAYERS.map((l) => [l.name, l]));

/**
 * Options for configuring the validation runner.
 */
export interface RunnerOptions {
  /**
   * Stop validation on first layer failure.
   * When true (default), subsequent layers are skipped after a failure.
   * When false, all layers run and all errors are collected.
   */
  stopOnFirstError?: boolean;

  /**
   * Specific layers to run. If not provided, all 4 layers run.
   * Layers always run in the defined order regardless of array order.
   */
  layers?: LayerName[];

  /**
   * Previous validation results for transition validation.
   * Used by the state-machine layer to validate status transitions.
   */
  previousResults?: LayerResult[];
}

/**
 * Metadata about the validation pipeline execution.
 */
export interface PipelineMetadata {
  /** Total execution time in milliseconds */
  durationMs: number;
  /** Number of layers that were run */
  layersRun: number;
  /** Total layers requested (may differ from layersRun if stopOnFirstError) */
  layersRequested: number;
  /** File type that was validated */
  fileType: FileType;
  /** Whether validation stopped early due to error */
  stoppedEarly: boolean;
  /** Layer where validation stopped (if stoppedEarly) */
  stoppedAtLayer?: LayerName;
}

/**
 * Extended pipeline result with detailed metadata.
 */
export interface ExtendedPipelineResult extends ValidationPipelineResult {
  /** Detailed metadata about the pipeline execution */
  metadata: PipelineMetadata;
}

/**
 * Result from validating a single file from disk.
 */
export interface FileValidationResult extends ExtendedPipelineResult {
  /** Path to the file that was validated */
  filePath: string;
  /** File type that was detected/used */
  fileType: FileType;
}

/**
 * Result from validating an entire project.
 */
export interface ProjectValidationResult {
  /** Validation result for STATE.md/STATE.json */
  state?: FileValidationResult;
  /** Validation result for TASKS.json */
  tasks?: FileValidationResult;
  /** Validation results for plan files */
  plans: FileValidationResult[];
  /** Overall summary */
  overall: {
    valid: boolean;
    errorCount: number;
    warningCount: number;
    filesValidated: number;
    exitCode: ExitCodeValue;
  };
}

/**
 * Runs all 4 validation layers in sequence.
 *
 * Executes layers in order: schema -> semantic -> referential -> state-machine.
 * By default, stops at the first failing layer to avoid cascading errors.
 *
 * @param context - The validation context with data to validate
 * @param options - Optional configuration for the runner
 * @returns Combined results from all executed layers
 *
 * @example
 * ```ts
 * const result = await runValidation({
 *   projectPath: '/path/to/project',
 *   fileType: 'task-registry',
 *   filePath: '/path/to/project/.planning/TASKS.json',
 *   data: parsedTasksJson,
 * });
 *
 * if (!result.valid) {
 *   console.log(`Validation failed at ${result.metadata.stoppedAtLayer}`);
 *   console.log('Errors:', result.allErrors);
 * }
 * ```
 */
export async function runValidation(
  context: ValidationContext,
  options?: RunnerOptions
): Promise<ExtendedPipelineResult> {
  const results: LayerResult[] = [];
  const allErrors: ValidationError[] = [];
  const allWarnings: ValidationWarning[] = [];
  const startTime = Date.now();

  const stopOnFirstError = options?.stopOnFirstError ?? true;

  // Determine which layers to run (always in defined order)
  const layersToRun = options?.layers
    ? LAYERS.filter((l) => options.layers!.includes(l.name))
    : LAYERS;

  let stoppedEarly = false;
  let stoppedAtLayer: LayerName | undefined;

  for (const layer of layersToRun) {
    // Create context with previous results for transition validation
    const layerContext: ValidationContext = {
      ...context,
      previousResults: [
        ...(context.previousResults ?? []),
        ...(options?.previousResults ?? []),
        ...results,
      ],
    };

    const result = await layer.fn(layerContext);
    results.push(result);
    allErrors.push(...result.errors);
    allWarnings.push(...result.warnings);

    // Stop on first error if configured
    if (!result.valid && stopOnFirstError) {
      stoppedEarly = true;
      stoppedAtLayer = layer.name;
      break;
    }
  }

  const durationMs = Date.now() - startTime;
  const valid = allErrors.length === 0;

  // Determine exit code from first failure or success
  const firstFailure = results.find((r) => !r.valid);
  const exitCode = firstFailure?.metadata?.exitCode ?? ExitCode.SUCCESS;

  return {
    valid,
    layerResults: results,
    allErrors,
    allWarnings,
    exitCode,
    metadata: {
      durationMs,
      layersRun: results.length,
      layersRequested: layersToRun.length,
      fileType: context.fileType,
      stoppedEarly,
      stoppedAtLayer,
    },
  };
}

/**
 * Detects the file type based on file path.
 *
 * @param filePath - Path to the file
 * @returns The detected file type or undefined if unknown
 */
export function detectFileType(filePath: string): FileType | undefined {
  const lowerPath = filePath.toLowerCase();

  if (lowerPath.endsWith('state.json') || lowerPath.endsWith('state.md')) {
    return 'state';
  }

  if (lowerPath.endsWith('tasks.json')) {
    return 'task-registry';
  }

  if (lowerPath.includes('.plan.') || lowerPath.endsWith('.plan.md')) {
    return 'plan';
  }

  return undefined;
}

/**
 * Reads and parses a JSON file.
 *
 * @param filePath - Path to the JSON file
 * @returns Parsed JSON data
 * @throws Error if file cannot be read or parsed
 */
async function readJsonFile(filePath: string): Promise<unknown> {
  const content = await fs.readFile(filePath, { encoding: 'utf-8' });
  return JSON.parse(content);
}

/**
 * Validates a file from disk.
 *
 * Reads the file, parses it as JSON, and runs all validation layers.
 * Automatically detects file type from the file path if not provided.
 *
 * @param projectPath - Root path of the project
 * @param filePath - Absolute path to the file to validate
 * @param fileType - Optional file type (auto-detected if not provided)
 * @param options - Optional runner configuration
 * @returns Validation results with file information
 *
 * @example
 * ```ts
 * const result = await runValidationOnFile(
 *   '/path/to/project',
 *   '/path/to/project/.planning/TASKS.json'
 * );
 *
 * if (!result.valid) {
 *   console.log('Validation errors:', result.allErrors);
 * }
 * ```
 */
export async function runValidationOnFile(
  projectPath: string,
  filePath: string,
  fileType?: FileType,
  options?: RunnerOptions
): Promise<FileValidationResult> {
  const startTime = Date.now();

  // Detect file type if not provided
  const detectedType = fileType ?? detectFileType(filePath);
  if (!detectedType) {
    const durationMs = Date.now() - startTime;
    return {
      valid: false,
      filePath,
      fileType: 'state', // Default for error reporting
      layerResults: [],
      allErrors: [
        {
          code: 'RUNNER_UNKNOWN_FILE_TYPE',
          message: `Cannot determine file type for: ${filePath}`,
          path: '/',
          details: { filePath },
        },
      ],
      allWarnings: [],
      exitCode: ExitCode.INVALID_ARGUMENTS,
      metadata: {
        durationMs,
        layersRun: 0,
        layersRequested: options?.layers?.length ?? LAYERS.length,
        fileType: 'state',
        stoppedEarly: true,
        stoppedAtLayer: undefined,
      },
    };
  }

  // Read and parse the file
  let data: unknown;
  try {
    data = await readJsonFile(filePath);
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isParseError = errorMessage.includes('JSON') || errorMessage.includes('Unexpected');

    return {
      valid: false,
      filePath,
      fileType: detectedType,
      layerResults: [],
      allErrors: [
        {
          code: isParseError ? 'RUNNER_PARSE_ERROR' : 'RUNNER_FILE_READ_ERROR',
          message: isParseError
            ? `Failed to parse JSON: ${errorMessage}`
            : `Failed to read file: ${errorMessage}`,
          path: '/',
          details: { filePath, error: errorMessage },
        },
      ],
      allWarnings: [],
      exitCode: ExitCode.VALIDATION_SCHEMA,
      metadata: {
        durationMs,
        layersRun: 0,
        layersRequested: options?.layers?.length ?? LAYERS.length,
        fileType: detectedType,
        stoppedEarly: true,
        stoppedAtLayer: undefined,
      },
    };
  }

  // Create validation context
  const context: ValidationContext = {
    projectPath,
    fileType: detectedType,
    filePath,
    data,
  };

  // Run validation
  const result = await runValidation(context, options);

  return {
    ...result,
    filePath,
    fileType: detectedType,
  };
}

/**
 * Validates all planning files in a project.
 *
 * Validates the project's STATE.md/STATE.json, TASKS.json, and all plan files
 * in the .planning/plans directory.
 *
 * @param projectPath - Root path of the project
 * @param options - Optional runner configuration
 * @returns Combined results for all validated files
 *
 * @example
 * ```ts
 * const result = await runProjectValidation('/path/to/project');
 *
 * console.log(`Valid: ${result.overall.valid}`);
 * console.log(`Errors: ${result.overall.errorCount}`);
 * console.log(`Files validated: ${result.overall.filesValidated}`);
 *
 * if (result.tasks && !result.tasks.valid) {
 *   console.log('Task registry errors:', result.tasks.allErrors);
 * }
 * ```
 */
export async function runProjectValidation(
  projectPath: string,
  options?: RunnerOptions
): Promise<ProjectValidationResult> {
  const planningPath = join(projectPath, '.planning');
  const plansPath = join(planningPath, 'plans');

  let stateResult: FileValidationResult | undefined;
  let tasksResult: FileValidationResult | undefined;
  const planResults: FileValidationResult[] = [];

  let totalErrors = 0;
  let totalWarnings = 0;
  let filesValidated = 0;
  let firstExitCode = ExitCode.SUCCESS as number;

  // Validate STATE.json (or STATE.md if JSON doesn't exist)
  const stateJsonPath = join(planningPath, 'STATE.json');
  try {
    await fs.access(stateJsonPath);
    stateResult = await runValidationOnFile(projectPath, stateJsonPath, 'state', options);
    totalErrors += stateResult.allErrors.length;
    totalWarnings += stateResult.allWarnings.length;
    filesValidated++;
    if (!stateResult.valid && firstExitCode === ExitCode.SUCCESS) {
      firstExitCode = stateResult.exitCode;
    }
  } catch {
    // STATE.json doesn't exist, that's okay - it might be STATE.md
    // We don't validate markdown files directly
  }

  // Validate TASKS.json
  const tasksPath = join(planningPath, 'TASKS.json');
  try {
    await fs.access(tasksPath);
    tasksResult = await runValidationOnFile(projectPath, tasksPath, 'task-registry', options);
    totalErrors += tasksResult.allErrors.length;
    totalWarnings += tasksResult.allWarnings.length;
    filesValidated++;
    if (!tasksResult.valid && firstExitCode === ExitCode.SUCCESS) {
      firstExitCode = tasksResult.exitCode;
    }
  } catch {
    // TASKS.json doesn't exist
  }

  // Validate all plan files
  try {
    const planFiles = await fs.readdir(plansPath);
    const planJsonFiles = planFiles.filter(
      (f) => f.endsWith('.plan.json') || (f.endsWith('.json') && f.includes('.plan'))
    );

    for (const planFile of planJsonFiles) {
      const planFilePath = join(plansPath, planFile);
      const planResult = await runValidationOnFile(projectPath, planFilePath, 'plan', options);
      planResults.push(planResult);
      totalErrors += planResult.allErrors.length;
      totalWarnings += planResult.allWarnings.length;
      filesValidated++;
      if (!planResult.valid && firstExitCode === ExitCode.SUCCESS) {
        firstExitCode = planResult.exitCode;
      }
    }
  } catch {
    // Plans directory doesn't exist or can't be read
  }

  return {
    state: stateResult,
    tasks: tasksResult,
    plans: planResults,
    overall: {
      valid: totalErrors === 0,
      errorCount: totalErrors,
      warningCount: totalWarnings,
      filesValidated,
      exitCode: firstExitCode as ExitCodeValue,
    },
  };
}

/**
 * Validates multiple files in parallel.
 *
 * Useful for batch validation of files when order doesn't matter.
 *
 * @param files - Array of file paths to validate
 * @param projectPath - Root path of the project
 * @param options - Optional runner configuration
 * @returns Array of validation results in the same order as input files
 *
 * @example
 * ```ts
 * const results = await runValidationOnFiles(
 *   ['/path/to/TASKS.json', '/path/to/STATE.json'],
 *   '/path/to/project'
 * );
 *
 * results.forEach((result, i) => {
 *   console.log(`${files[i]}: ${result.valid ? 'PASS' : 'FAIL'}`);
 * });
 * ```
 */
export async function runValidationOnFiles(
  files: string[],
  projectPath: string,
  options?: RunnerOptions
): Promise<FileValidationResult[]> {
  const results = await Promise.all(
    files.map((filePath) => runValidationOnFile(projectPath, filePath, undefined, options))
  );
  return results;
}

/**
 * Runs a single validation layer.
 *
 * Useful when you only need to run a specific layer.
 *
 * @param layerName - Name of the layer to run
 * @param context - The validation context
 * @returns The layer result
 *
 * @example
 * ```ts
 * const result = await runSingleLayer('semantic', {
 *   projectPath: '/path/to/project',
 *   fileType: 'task-registry',
 *   filePath: '/path/to/TASKS.json',
 *   data: taskData,
 * });
 * ```
 */
export async function runSingleLayer(
  layerName: LayerName,
  context: ValidationContext
): Promise<LayerResult> {
  const layer = LAYER_MAP.get(layerName);
  if (!layer) {
    throw new Error(`Unknown layer: ${layerName}`);
  }
  return layer.fn(context);
}

/**
 * Gets the names of all available validation layers.
 *
 * @returns Array of layer names in execution order
 */
export function getLayerNames(): LayerName[] {
  return LAYERS.map((l) => l.name);
}

/**
 * Checks if a layer name is valid.
 *
 * @param name - The name to check
 * @returns true if the name is a valid layer name
 */
export function isValidLayerName(name: string): name is LayerName {
  return LAYER_MAP.has(name as LayerName);
}
