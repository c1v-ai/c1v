/**
 * CLEO Schema Validator
 *
 * TypeScript validation library for CLEO workflow documents.
 * Uses AJV for JSON Schema validation with support for exit code integration.
 *
 * @module validator
 */

import Ajv, { ValidateFunction, ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';

import {
  ExitCode,
  type ExitCodeResult,
  success,
  failure,
} from './exit-codes';

// Schema imports - loaded at module init
import stateSchema from '../schemas/state.schema.json';
import planSchema from '../schemas/plan.schema.json';
import taskRegistrySchema from '../schemas/task-registry.schema.json';

/**
 * Schema names supported by the validator.
 */
export type SchemaName = 'state' | 'plan' | 'task-registry';

/**
 * Result of a validation operation.
 */
export interface ValidationResult {
  /** Whether the data is valid against the schema */
  valid: boolean;
  /** Array of validation errors, if any */
  errors?: ValidationError[];
}

/**
 * A single validation error with path and message.
 */
export interface ValidationError {
  /** JSON Pointer path to the invalid property */
  path: string;
  /** Human-readable error message */
  message: string;
  /** AJV keyword that failed (e.g., 'required', 'type', 'pattern') */
  keyword: string;
}

/**
 * Internal storage for compiled validators.
 */
const validators: Map<SchemaName, ValidateFunction> = new Map();

/**
 * Internal storage for raw schemas.
 */
const schemas: Map<SchemaName, object> = new Map();

/**
 * Whether schemas have been loaded.
 */
let schemasLoaded = false;

/**
 * The AJV instance used for validation.
 */
let ajv: Ajv;

/**
 * Initializes the AJV instance and compiles all schemas.
 * This is called automatically on first validation, but can be called
 * explicitly for eager initialization.
 *
 * @returns Promise that resolves when schemas are loaded
 *
 * @example
 * ```ts
 * // Eager initialization
 * await loadSchemas();
 *
 * // Or let it happen automatically on first validate call
 * const result = validateState(data);
 * ```
 */
export async function loadSchemas(): Promise<void> {
  if (schemasLoaded) {
    return;
  }

  // Initialize AJV with appropriate settings
  ajv = new Ajv({
    allErrors: true, // Report all errors, not just the first
    strict: false, // Disable strict mode to allow if/then/else patterns
    validateFormats: true, // Validate format keywords
  });

  // Add format validators (date-time, uri, email, etc.)
  addFormats(ajv);

  // Store raw schemas
  schemas.set('state', stateSchema);
  schemas.set('plan', planSchema);
  schemas.set('task-registry', taskRegistrySchema);

  // Compile and store validators
  validators.set('state', ajv.compile(stateSchema));
  validators.set('plan', ajv.compile(planSchema));
  validators.set('task-registry', ajv.compile(taskRegistrySchema));

  schemasLoaded = true;
}

/**
 * Ensures schemas are loaded before validation.
 * Called internally by validation functions.
 */
async function ensureLoaded(): Promise<void> {
  if (!schemasLoaded) {
    await loadSchemas();
  }
}

/**
 * Gets a specific schema by name.
 *
 * @param name - The schema name to retrieve
 * @returns The raw JSON schema object
 * @throws Error if schemas haven't been loaded
 *
 * @example
 * ```ts
 * await loadSchemas();
 * const stateSchema = getSchema('state');
 * console.log(stateSchema.$id);
 * ```
 */
export function getSchema(name: SchemaName): object {
  if (!schemasLoaded) {
    throw new Error('Schemas not loaded. Call loadSchemas() first.');
  }

  const schema = schemas.get(name);
  if (!schema) {
    throw new Error(`Unknown schema: ${name}`);
  }

  return schema;
}

/**
 * Transforms AJV errors into a more user-friendly format.
 *
 * @param errors - AJV error objects
 * @returns Array of simplified validation errors
 */
function transformErrors(errors: ErrorObject[] | null | undefined): ValidationError[] {
  if (!errors || errors.length === 0) {
    return [];
  }

  return errors.map((error) => ({
    path: error.instancePath || '/',
    message: formatErrorMessage(error),
    keyword: error.keyword,
  }));
}

/**
 * Formats an AJV error into a human-readable message.
 *
 * @param error - AJV error object
 * @returns Formatted error message
 */
function formatErrorMessage(error: ErrorObject): string {
  const { keyword, params, message } = error;

  switch (keyword) {
    case 'required':
      return `Missing required property: ${params.missingProperty}`;
    case 'type':
      return `Expected ${params.type}, got ${typeof params.type}`;
    case 'enum':
      return `Must be one of: ${params.allowedValues?.join(', ')}`;
    case 'pattern':
      return `Does not match pattern: ${params.pattern}`;
    case 'minLength':
      return `String is too short (minimum ${params.limit} characters)`;
    case 'maxLength':
      return `String is too long (maximum ${params.limit} characters)`;
    case 'minimum':
      return `Value is too small (minimum ${params.limit})`;
    case 'maximum':
      return `Value is too large (maximum ${params.limit})`;
    case 'additionalProperties':
      return `Unexpected property: ${params.additionalProperty}`;
    default:
      return message || `Validation failed: ${keyword}`;
  }
}

/**
 * Validates data against the STATE.md schema.
 * Used for validating parsed STATE.md content.
 *
 * @param data - The data to validate (parsed from STATE.md)
 * @returns ValidationResult indicating if the data is valid
 *
 * @example
 * ```ts
 * const stateData = {
 *   currentPosition: { phase: 1, status: 'executing' },
 *   nextSteps: ['Complete T001', 'Start T002']
 * };
 * const result = await validateState(stateData);
 * if (!result.valid) {
 *   console.error('State validation errors:', result.errors);
 * }
 * ```
 */
export async function validateState(data: unknown): Promise<ValidationResult> {
  await ensureLoaded();
  return validate('state', data);
}

/**
 * Validates data against the plan schema.
 * Used for validating plan file frontmatter.
 *
 * @param data - The data to validate (parsed from plan frontmatter)
 * @returns ValidationResult indicating if the data is valid
 *
 * @example
 * ```ts
 * const planData = {
 *   phase: '01-test-stabilization',
 *   plan: 1,
 *   wave: 1,
 *   autonomous: true
 * };
 * const result = await validatePlan(planData);
 * if (!result.valid) {
 *   console.error('Plan validation errors:', result.errors);
 * }
 * ```
 */
export async function validatePlan(data: unknown): Promise<ValidationResult> {
  await ensureLoaded();
  return validate('plan', data);
}

/**
 * Validates data against the task registry schema.
 * Used for validating TASKS.json content.
 *
 * @param data - The data to validate (parsed from TASKS.json)
 * @returns ValidationResult indicating if the data is valid
 *
 * @example
 * ```ts
 * const tasksData = {
 *   version: '1.0.0',
 *   project: 'my-project',
 *   lastTaskId: 3,
 *   tasks: [
 *     { id: 'T001', title: 'Setup', phase: 1, status: 'completed', assignee: 'backend-architect', dependencies: [], created: '2026-01-23T10:00:00Z', completed: '2026-01-23T12:00:00Z' }
 *   ]
 * };
 * const result = await validateTaskRegistry(tasksData);
 * if (!result.valid) {
 *   console.error('Task registry validation errors:', result.errors);
 * }
 * ```
 */
export async function validateTaskRegistry(data: unknown): Promise<ValidationResult> {
  await ensureLoaded();
  return validate('task-registry', data);
}

/**
 * Generic validation function that validates data against any supported schema.
 *
 * @param schemaName - The name of the schema to validate against
 * @param data - The data to validate
 * @returns ValidationResult indicating if the data is valid
 *
 * @example
 * ```ts
 * const result = await validate('state', stateData);
 * ```
 */
export async function validate(schemaName: SchemaName, data: unknown): Promise<ValidationResult> {
  await ensureLoaded();

  const validator = validators.get(schemaName);
  if (!validator) {
    return {
      valid: false,
      errors: [{
        path: '/',
        message: `Unknown schema: ${schemaName}`,
        keyword: 'schema',
      }],
    };
  }

  const valid = validator(data);

  if (valid) {
    return { valid: true };
  }

  return {
    valid: false,
    errors: transformErrors(validator.errors),
  };
}

/**
 * Validates data and returns an ExitCodeResult for CLEO integration.
 * Uses appropriate exit codes based on validation outcome.
 *
 * @param schemaName - The schema to validate against
 * @param data - The data to validate
 * @returns ExitCodeResult with SUCCESS (0) or VALIDATION_SCHEMA (5)
 *
 * @example
 * ```ts
 * const result = await validateWithExitCode('state', stateData);
 * if (result.code !== ExitCode.SUCCESS) {
 *   console.error(`Validation failed with exit code ${result.code}`);
 *   console.error(result.details);
 * }
 * ```
 */
export async function validateWithExitCode(
  schemaName: SchemaName,
  data: unknown
): Promise<ExitCodeResult> {
  const result = await validate(schemaName, data);

  if (result.valid) {
    return success(`${schemaName} schema validation passed`);
  }

  return failure(
    ExitCode.VALIDATION_SCHEMA,
    `${schemaName} schema validation failed with ${result.errors?.length || 0} error(s)`,
    result.errors
  );
}

/**
 * Validates a file by reading it from disk and parsing as JSON.
 *
 * @param filePath - Absolute path to the file to validate
 * @param schemaName - The schema to validate against
 * @returns ValidationResult indicating if the file content is valid
 *
 * @example
 * ```ts
 * const result = await validateFile('/path/to/project/.planning/TASKS.json', 'task-registry');
 * if (!result.valid) {
 *   console.error('TASKS.json validation failed:', result.errors);
 * }
 * ```
 */
export async function validateFile(
  filePath: string,
  schemaName: SchemaName
): Promise<ValidationResult> {
  try {
    const content = await fs.readFile(filePath, { encoding: 'utf-8' });
    const data = JSON.parse(content);
    return validate(schemaName, data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Handle parse errors
    if (error instanceof SyntaxError) {
      return {
        valid: false,
        errors: [{
          path: '/',
          message: `JSON parse error: ${errorMessage}`,
          keyword: 'parse',
        }],
      };
    }

    // Handle file not found
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return {
        valid: false,
        errors: [{
          path: '/',
          message: `File not found: ${filePath}`,
          keyword: 'file',
        }],
      };
    }

    // Handle other errors
    return {
      valid: false,
      errors: [{
        path: '/',
        message: `Failed to read file: ${errorMessage}`,
        keyword: 'file',
      }],
    };
  }
}

/**
 * Validates a file and returns an ExitCodeResult.
 *
 * @param filePath - Absolute path to the file to validate
 * @param schemaName - The schema to validate against
 * @returns ExitCodeResult with appropriate exit code
 *
 * @example
 * ```ts
 * const result = await validateFileWithExitCode('/path/to/TASKS.json', 'task-registry');
 * process.exit(result.code);
 * ```
 */
export async function validateFileWithExitCode(
  filePath: string,
  schemaName: SchemaName
): Promise<ExitCodeResult> {
  try {
    const content = await fs.readFile(filePath, { encoding: 'utf-8' });
    const data = JSON.parse(content);
    return validateWithExitCode(schemaName, data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Handle file not found
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return failure(
        ExitCode.RESOURCE_NOT_FOUND,
        `File not found: ${filePath}`,
        { filePath }
      );
    }

    // Handle parse errors as schema validation failure
    if (error instanceof SyntaxError) {
      return failure(
        ExitCode.VALIDATION_SCHEMA,
        `JSON parse error: ${errorMessage}`,
        { filePath, parseError: errorMessage }
      );
    }

    // Handle other errors
    return failure(
      ExitCode.GENERAL_ERROR,
      `Failed to validate file: ${errorMessage}`,
      { filePath, error: errorMessage }
    );
  }
}

/**
 * Validates the STATE.md file from a project's .planning directory.
 * Note: This expects the STATE.md content to already be parsed to JSON.
 * For full markdown parsing, integrate with a markdown-to-JSON parser.
 *
 * @param projectPath - The root path of the project
 * @param parsedContent - Optional pre-parsed STATE.md content
 * @returns ValidationResult for the project state
 *
 * @example
 * ```ts
 * // With pre-parsed content
 * const stateJson = parseMarkdownToJson(stateMarkdown);
 * const result = await validateProjectState('/path/to/project', stateJson);
 *
 * // Direct JSON file (if STATE.json exists)
 * const result = await validateProjectState('/path/to/project');
 * ```
 */
export async function validateProjectState(
  projectPath: string,
  parsedContent?: unknown
): Promise<ValidationResult> {
  if (parsedContent !== undefined) {
    return validateState(parsedContent);
  }

  // Try to read STATE.json if it exists (some projects use JSON format)
  const stateJsonPath = join(projectPath, '.planning', 'STATE.json');
  try {
    const content = await fs.readFile(stateJsonPath, { encoding: 'utf-8' });
    const data = JSON.parse(content);
    return validateState(data);
  } catch {
    return {
      valid: false,
      errors: [{
        path: '/',
        message: 'STATE.json not found and no parsed content provided. Parse STATE.md to JSON first.',
        keyword: 'file',
      }],
    };
  }
}

/**
 * Validates the TASKS.json file from a project's .planning directory.
 *
 * @param projectPath - The root path of the project
 * @returns ValidationResult for the project tasks
 *
 * @example
 * ```ts
 * const result = await validateProjectTasks('/path/to/project');
 * if (result.valid) {
 *   console.log('TASKS.json is valid');
 * } else {
 *   console.error('Validation errors:', result.errors);
 * }
 * ```
 */
export async function validateProjectTasks(
  projectPath: string
): Promise<ValidationResult> {
  const tasksPath = join(projectPath, '.planning', 'TASKS.json');
  return validateFile(tasksPath, 'task-registry');
}

/**
 * Validates all GSD planning files in a project.
 * Returns a combined result with errors from all files.
 *
 * @param projectPath - The root path of the project
 * @param options - Options for which files to validate
 * @returns Combined ValidationResult for all files
 *
 * @example
 * ```ts
 * const result = await validateProject('/path/to/project', {
 *   validateTasks: true,
 *   stateContent: parsedStateData
 * });
 * ```
 */
export async function validateProject(
  projectPath: string,
  options: {
    validateTasks?: boolean;
    stateContent?: unknown;
  } = {}
): Promise<ValidationResult> {
  const { validateTasks = true, stateContent } = options;
  const allErrors: ValidationError[] = [];
  let allValid = true;

  // Validate state if content provided
  if (stateContent !== undefined) {
    const stateResult = await validateState(stateContent);
    if (!stateResult.valid) {
      allValid = false;
      if (stateResult.errors) {
        allErrors.push(
          ...stateResult.errors.map((e) => ({
            ...e,
            path: `STATE:${e.path}`,
          }))
        );
      }
    }
  }

  // Validate tasks
  if (validateTasks) {
    const tasksResult = await validateProjectTasks(projectPath);
    if (!tasksResult.valid) {
      allValid = false;
      if (tasksResult.errors) {
        allErrors.push(
          ...tasksResult.errors.map((e) => ({
            ...e,
            path: `TASKS:${e.path}`,
          }))
        );
      }
    }
  }

  return {
    valid: allValid,
    errors: allErrors.length > 0 ? allErrors : undefined,
  };
}

/**
 * Validates all GSD planning files and returns an ExitCodeResult.
 *
 * @param projectPath - The root path of the project
 * @param options - Options for which files to validate
 * @returns ExitCodeResult with appropriate exit code
 *
 * @example
 * ```ts
 * const result = await validateProjectWithExitCode('/path/to/project');
 * if (result.code === ExitCode.SUCCESS) {
 *   console.log('All planning files are valid');
 * }
 * ```
 */
export async function validateProjectWithExitCode(
  projectPath: string,
  options: {
    validateTasks?: boolean;
    stateContent?: unknown;
  } = {}
): Promise<ExitCodeResult> {
  const result = await validateProject(projectPath, options);

  if (result.valid) {
    return success('All project planning files are valid');
  }

  return failure(
    ExitCode.VALIDATION_SCHEMA,
    `Project validation failed with ${result.errors?.length || 0} error(s)`,
    result.errors
  );
}
