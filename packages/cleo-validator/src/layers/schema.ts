/**
 * Schema Validation Layer
 *
 * First layer of the 4-layer CLEO validation system.
 * Wraps the existing ajv validation in a composable layer abstraction.
 *
 * Exit Code: 5 (VALIDATION_SCHEMA) on failure
 *
 * @module layers/schema
 */

import {
  validateState,
  validatePlan,
  validateTaskRegistry,
  type ValidationResult as AjvValidationResult,
  type ValidationError as AjvValidationError,
} from '../validator';
import { ExitCode } from '../exit-codes';
import {
  type ValidationContext,
  type LayerResult,
  type ValidationLayer,
  type ValidationError,
  type ValidationWarning,
  createSuccessResult,
  createFailureResult,
} from './types';

/**
 * Error code prefix for schema validation errors.
 */
const ERROR_CODE_PREFIX = 'SCHEMA';

/**
 * Mapping of ajv keywords to specific error codes.
 */
const KEYWORD_TO_CODE: Record<string, string> = {
  required: 'MISSING_REQUIRED',
  type: 'INVALID_TYPE',
  enum: 'INVALID_ENUM',
  pattern: 'INVALID_PATTERN',
  minLength: 'STRING_TOO_SHORT',
  maxLength: 'STRING_TOO_LONG',
  minimum: 'VALUE_TOO_SMALL',
  maximum: 'VALUE_TOO_LARGE',
  additionalProperties: 'UNEXPECTED_PROPERTY',
  parse: 'PARSE_ERROR',
  file: 'FILE_ERROR',
  schema: 'UNKNOWN_SCHEMA',
};

/**
 * Transforms ajv validation errors to the common ValidationError format.
 *
 * @param ajvErrors - Errors from ajv validation
 * @returns Array of ValidationError objects
 */
function transformAjvErrors(ajvErrors: AjvValidationError[] | undefined): ValidationError[] {
  if (!ajvErrors || ajvErrors.length === 0) {
    return [];
  }

  return ajvErrors.map((error) => {
    const keywordCode = KEYWORD_TO_CODE[error.keyword] || error.keyword.toUpperCase();
    return {
      code: `${ERROR_CODE_PREFIX}_${keywordCode}`,
      message: error.message,
      path: error.path || '/',
      details: {
        keyword: error.keyword,
      },
    };
  });
}

/**
 * Selects the appropriate validator function based on file type.
 *
 * @param fileType - The type of file to validate
 * @returns The validator function for that file type
 */
function getValidatorForFileType(
  fileType: ValidationContext['fileType']
): (data: unknown) => Promise<AjvValidationResult> {
  switch (fileType) {
    case 'state':
      return validateState;
    case 'plan':
      return validatePlan;
    case 'task-registry':
      return validateTaskRegistry;
    default:
      // TypeScript exhaustiveness check
      const _exhaustive: never = fileType;
      throw new Error(`Unknown file type: ${_exhaustive}`);
  }
}

/**
 * Schema validation layer implementation.
 *
 * Validates data structure against JSON schemas using ajv.
 * This is the first layer in the 4-layer validation pipeline.
 *
 * @param context - The validation context containing data and metadata
 * @returns LayerResult with validation outcome
 *
 * @example
 * ```ts
 * const result = await schemaLayer({
 *   projectPath: '/path/to/project',
 *   fileType: 'task-registry',
 *   filePath: '/path/to/project/.planning/TASKS.json',
 *   data: parsedTasksJson,
 * });
 *
 * if (!result.valid) {
 *   console.error('Schema validation failed:', result.errors);
 * }
 * ```
 */
export const schemaLayer: ValidationLayer = async (
  context: ValidationContext
): Promise<LayerResult> => {
  const startTime = Date.now();
  const { fileType, data } = context;

  try {
    // Select and run the appropriate validator
    const validator = getValidatorForFileType(fileType);
    const result = await validator(data);

    const durationMs = Date.now() - startTime;

    if (result.valid) {
      return createSuccessResult('schema', {
        exitCode: ExitCode.SUCCESS,
        durationMs,
        fileType,
      });
    }

    // Transform errors to common format
    const errors = transformAjvErrors(result.errors);
    const warnings: ValidationWarning[] = [];

    return createFailureResult('schema', errors, warnings, {
      exitCode: ExitCode.VALIDATION_SCHEMA,
      durationMs,
      fileType,
      errorCount: errors.length,
    });
  } catch (error) {
    // Handle unexpected errors during validation
    const durationMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    return createFailureResult(
      'schema',
      [
        {
          code: `${ERROR_CODE_PREFIX}_INTERNAL_ERROR`,
          message: `Schema validation failed unexpectedly: ${errorMessage}`,
          path: '/',
          details: {
            error: errorMessage,
          },
        },
      ],
      [],
      {
        exitCode: ExitCode.VALIDATION_SCHEMA,
        durationMs,
        fileType,
      }
    );
  }
};

/**
 * Validates that data is not null or undefined before schema validation.
 * Can be used as a pre-check before running the schema layer.
 *
 * @param data - The data to check
 * @returns An error if data is invalid, undefined otherwise
 */
export function validateDataPresence(data: unknown): ValidationError | undefined {
  if (data === null) {
    return {
      code: `${ERROR_CODE_PREFIX}_NULL_DATA`,
      message: 'Data cannot be null',
      path: '/',
    };
  }

  if (data === undefined) {
    return {
      code: `${ERROR_CODE_PREFIX}_UNDEFINED_DATA`,
      message: 'Data cannot be undefined',
      path: '/',
    };
  }

  return undefined;
}

/**
 * Creates a schema layer result for when the file cannot be read.
 * Useful for wrapping file read errors in a layer-compatible format.
 *
 * @param filePath - Path to the file that failed to read
 * @param errorMessage - The error message from the read failure
 * @returns A failed LayerResult
 */
export function createFileReadErrorResult(
  filePath: string,
  errorMessage: string
): LayerResult {
  return createFailureResult(
    'schema',
    [
      {
        code: `${ERROR_CODE_PREFIX}_FILE_READ_ERROR`,
        message: `Failed to read file: ${errorMessage}`,
        path: '/',
        details: {
          filePath,
        },
      },
    ],
    [],
    {
      exitCode: ExitCode.VALIDATION_SCHEMA,
      filePath,
    }
  );
}

/**
 * Creates a schema layer result for JSON parse errors.
 * Useful for wrapping parse errors in a layer-compatible format.
 *
 * @param filePath - Path to the file that failed to parse
 * @param parseError - The parse error message
 * @returns A failed LayerResult
 */
export function createParseErrorResult(
  filePath: string,
  parseError: string
): LayerResult {
  return createFailureResult(
    'schema',
    [
      {
        code: `${ERROR_CODE_PREFIX}_PARSE_ERROR`,
        message: `JSON parse error: ${parseError}`,
        path: '/',
        details: {
          filePath,
        },
      },
    ],
    [],
    {
      exitCode: ExitCode.VALIDATION_SCHEMA,
      filePath,
    }
  );
}
