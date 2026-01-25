/**
 * CLEO Validation Layer Types
 *
 * Common interface definitions for the 4-layer validation system:
 * 1. Schema - JSON structure validation (ajv)
 * 2. Semantic - Value correctness validation
 * 3. Referential - ID and reference existence validation
 * 4. State Machine - State transition validation
 *
 * @module layers/types
 */

import type { ExitCodeValue } from '../exit-codes';

/**
 * File types supported by the validation system.
 */
export type FileType = 'state' | 'plan' | 'task-registry';

/**
 * Names of the validation layers.
 */
export type LayerName = 'schema' | 'semantic' | 'referential' | 'state-machine';

/**
 * Context passed to each validation layer.
 * Contains all information needed for validation.
 */
export interface ValidationContext {
  /** Root path of the project being validated */
  projectPath: string;
  /** Type of file being validated */
  fileType: FileType;
  /** Absolute path to the file being validated */
  filePath: string;
  /** Parsed data to validate */
  data: unknown;
  /** Results from previous validation layers (for chained validation) */
  previousResults?: LayerResult[];
}

/**
 * A single validation error from a layer.
 */
export interface ValidationError {
  /** Error code for programmatic handling */
  code: string;
  /** Human-readable error message */
  message: string;
  /** JSON Pointer path to the invalid property */
  path?: string;
  /** Additional error details */
  details?: unknown;
}

/**
 * A validation warning (non-fatal issue).
 */
export interface ValidationWarning {
  /** Warning code for programmatic handling */
  code: string;
  /** Human-readable warning message */
  message: string;
  /** JSON Pointer path to the problematic property */
  path?: string;
}

/**
 * Result from a single validation layer.
 */
export interface LayerResult {
  /** Which layer produced this result */
  layer: LayerName;
  /** Whether validation passed */
  valid: boolean;
  /** Array of validation errors */
  errors: ValidationError[];
  /** Array of validation warnings */
  warnings: ValidationWarning[];
  /** Optional metadata (exit codes, timing, etc.) */
  metadata?: LayerMetadata;
}

/**
 * Metadata that can be attached to layer results.
 */
export interface LayerMetadata {
  /** CLEO exit code for this layer's outcome */
  exitCode?: ExitCodeValue;
  /** Execution time in milliseconds */
  durationMs?: number;
  /** Schema version validated against (for schema layer) */
  schemaVersion?: string;
  /** Additional layer-specific metadata */
  [key: string]: unknown;
}

/**
 * Function signature for a validation layer.
 * Each layer receives context and returns a result.
 */
export type ValidationLayer = (context: ValidationContext) => Promise<LayerResult>;

/**
 * Combined result from running multiple validation layers.
 */
export interface ValidationPipelineResult {
  /** Whether all layers passed */
  valid: boolean;
  /** Results from each layer */
  layerResults: LayerResult[];
  /** Aggregated errors from all layers */
  allErrors: ValidationError[];
  /** Aggregated warnings from all layers */
  allWarnings: ValidationWarning[];
  /** First failing exit code, or SUCCESS if all passed */
  exitCode: ExitCodeValue;
}

/**
 * Creates an empty successful layer result.
 *
 * @param layer - The layer name
 * @param metadata - Optional metadata to include
 * @returns A valid LayerResult with no errors or warnings
 */
export function createSuccessResult(
  layer: LayerName,
  metadata?: LayerMetadata
): LayerResult {
  return {
    layer,
    valid: true,
    errors: [],
    warnings: [],
    metadata,
  };
}

/**
 * Creates a failed layer result.
 *
 * @param layer - The layer name
 * @param errors - Array of validation errors
 * @param warnings - Optional array of warnings
 * @param metadata - Optional metadata to include
 * @returns A LayerResult indicating validation failure
 */
export function createFailureResult(
  layer: LayerName,
  errors: ValidationError[],
  warnings: ValidationWarning[] = [],
  metadata?: LayerMetadata
): LayerResult {
  return {
    layer,
    valid: false,
    errors,
    warnings,
    metadata,
  };
}
