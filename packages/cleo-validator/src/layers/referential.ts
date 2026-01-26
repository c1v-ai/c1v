/**
 * Referential Integrity Validation Layer
 *
 * Third layer of the 4-layer CLEO validation system.
 * Validates cross-file and internal references including:
 * - Task dependencies exist within the registry
 * - Circular dependency detection
 * - Cross-file reference validation (STATE -> TASKS, plan dependencies)
 * - Open question ID uniqueness
 * - lastTaskId consistency
 *
 * Exit Code: 7 (VALIDATION_REFERENTIAL) on failure
 *
 * @module layers/referential
 */

import { promises as fs } from 'node:fs';
import { join } from 'node:path';
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
 * Error code prefix for referential validation errors.
 */
const ERROR_CODE_PREFIX = 'REFERENTIAL';

/**
 * Known agent types that are valid for plan assignment.
 */
const KNOWN_AGENTS = new Set([
  'backend-architect',
  'database-engineer',
  'devops-engineer',
  'ui-ux-engineer',
  'chat-engineer',
  'data-viz-engineer',
  'langchain-engineer',
  'llm-workflow-engineer',
  'prd-spec-validator',
  'vector-store-engineer',
  'cache-engineer',
  'observability-engineer',
  'product-manager',
  'product-strategy',
  'technical-program-manager',
  'qa-engineer',
  'documentation-engineer',
]);

/**
 * Represents a task from the task registry.
 */
interface Task {
  id: string;
  title: string;
  phase: number;
  status: string;
  assignee: string;
  dependencies: string[];
  created: string;
  completed?: string;
  blockedBy?: string;
}

/**
 * Represents the task registry structure.
 */
interface TaskRegistry {
  version: string;
  project: string;
  lastTaskId: number;
  tasks: Task[];
}

/**
 * Represents an active task in state.
 */
interface ActiveTask {
  id: string;
  description?: string;
  assignedTo?: string;
}

/**
 * Represents an open question in state.
 */
interface OpenQuestion {
  id: string;
  question: string;
  status: string;
}

/**
 * Represents the state file structure.
 */
interface StateData {
  activeTask?: ActiveTask | string | null;
  openQuestions?: OpenQuestion[];
  sessionLog?: Array<{ taskId?: string }>;
}

/**
 * Represents plan file structure.
 */
interface PlanData {
  phase: string | number;
  plan: number;
  wave: number;
  depends_on?: string[];
  agent?: string;
}

/**
 * Builds a dependency graph from tasks.
 *
 * @param tasks - Array of tasks
 * @returns Map from task ID to array of dependency IDs
 */
function buildDependencyGraph(tasks: Task[]): Map<string, string[]> {
  const graph = new Map<string, string[]>();
  for (const task of tasks) {
    graph.set(task.id, task.dependencies || []);
  }
  return graph;
}

/**
 * Detects circular dependencies using DFS.
 * Returns all cycles found as arrays of task IDs.
 *
 * @param tasks - Array of tasks to check
 * @returns Array of cycles, where each cycle is an array of task IDs
 *
 * @example
 * // T001 -> T002 -> T003 -> T001 (circular)
 * detectCircularDependencies(tasks);
 * // Returns: [['T001', 'T002', 'T003', 'T001']]
 */
function detectCircularDependencies(tasks: Task[]): string[][] {
  const graph = buildDependencyGraph(tasks);
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const path: string[] = [];

  function dfs(taskId: string): void {
    if (recursionStack.has(taskId)) {
      // Found a cycle - extract it from the path
      const cycleStart = path.indexOf(taskId);
      if (cycleStart !== -1) {
        const cycle = path.slice(cycleStart);
        cycle.push(taskId); // Complete the cycle
        cycles.push(cycle);
      }
      return;
    }

    if (visited.has(taskId)) {
      return;
    }

    visited.add(taskId);
    recursionStack.add(taskId);
    path.push(taskId);

    const dependencies = graph.get(taskId) || [];
    for (const dep of dependencies) {
      dfs(dep);
    }

    path.pop();
    recursionStack.delete(taskId);
  }

  // Start DFS from each task
  for (const task of tasks) {
    if (!visited.has(task.id)) {
      dfs(task.id);
    }
  }

  return cycles;
}

/**
 * Validates that all dependencies reference existing tasks.
 *
 * @param tasks - Array of tasks to validate
 * @param errors - Array to push errors to
 */
function validateDependenciesExist(tasks: Task[], errors: ValidationError[]): void {
  const taskIds = new Set(tasks.map((t) => t.id));

  for (const task of tasks) {
    for (const dep of task.dependencies || []) {
      if (!taskIds.has(dep)) {
        errors.push({
          code: `${ERROR_CODE_PREFIX}_MISSING_DEPENDENCY`,
          message: `Task ${task.id} depends on ${dep} which does not exist`,
          path: `tasks[${task.id}].dependencies`,
          details: {
            taskId: task.id,
            missingDependency: dep,
          },
        });
      }
    }
  }
}

/**
 * Validates that no task depends on itself.
 *
 * @param tasks - Array of tasks to validate
 * @param errors - Array to push errors to
 */
function validateNoSelfReferences(tasks: Task[], errors: ValidationError[]): void {
  for (const task of tasks) {
    if ((task.dependencies || []).includes(task.id)) {
      errors.push({
        code: `${ERROR_CODE_PREFIX}_SELF_REFERENCE`,
        message: `Task ${task.id} cannot depend on itself`,
        path: `tasks[${task.id}].dependencies`,
        details: {
          taskId: task.id,
        },
      });
    }
  }
}

/**
 * Validates that lastTaskId matches the highest task number.
 *
 * @param registry - The task registry
 * @param errors - Array to push errors to
 */
function validateLastTaskId(registry: TaskRegistry, errors: ValidationError[]): void {
  if (!registry.tasks || registry.tasks.length === 0) {
    // No tasks, lastTaskId should be 0
    if (registry.lastTaskId !== 0) {
      errors.push({
        code: `${ERROR_CODE_PREFIX}_LAST_TASK_ID_MISMATCH`,
        message: `lastTaskId is ${registry.lastTaskId} but there are no tasks (should be 0)`,
        path: 'lastTaskId',
        details: {
          expected: 0,
          actual: registry.lastTaskId,
        },
      });
    }
    return;
  }

  // Extract the highest task number from task IDs
  let maxTaskNum = 0;
  for (const task of registry.tasks) {
    const match = task.id.match(/^T(\d{3})$/);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (num > maxTaskNum) {
        maxTaskNum = num;
      }
    }
  }

  if (registry.lastTaskId !== maxTaskNum) {
    errors.push({
      code: `${ERROR_CODE_PREFIX}_LAST_TASK_ID_MISMATCH`,
      message: `lastTaskId is ${registry.lastTaskId} but highest task number is ${maxTaskNum}`,
      path: 'lastTaskId',
      details: {
        expected: maxTaskNum,
        actual: registry.lastTaskId,
      },
    });
  }
}

/**
 * Validates task registry references.
 *
 * @param data - The task registry data
 * @param errors - Array to push errors to
 * @param warnings - Array to push warnings to
 */
function validateTaskRegistryReferences(
  data: unknown,
  errors: ValidationError[],
  _warnings: ValidationWarning[]
): void {
  const registry = data as TaskRegistry;

  if (!registry.tasks || !Array.isArray(registry.tasks)) {
    return; // Schema validation will catch this
  }

  // Validate all dependencies exist
  validateDependenciesExist(registry.tasks, errors);

  // Validate no self-references
  validateNoSelfReferences(registry.tasks, errors);

  // Detect circular dependencies
  const cycles = detectCircularDependencies(registry.tasks);
  for (const cycle of cycles) {
    errors.push({
      code: `${ERROR_CODE_PREFIX}_CIRCULAR_DEPENDENCY`,
      message: `Circular dependency detected: ${cycle.join(' -> ')}`,
      path: 'tasks',
      details: {
        cycle,
      },
    });
  }

  // Validate lastTaskId consistency
  validateLastTaskId(registry, errors);
}

/**
 * Validates that open question IDs are unique.
 *
 * @param questions - Array of open questions
 * @param errors - Array to push errors to
 */
function validateOpenQuestionUniqueness(
  questions: OpenQuestion[],
  errors: ValidationError[]
): void {
  const seenIds = new Set<string>();
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    if (!question) continue;
    if (seenIds.has(question.id)) {
      errors.push({
        code: `${ERROR_CODE_PREFIX}_DUPLICATE_QUESTION_ID`,
        message: `Duplicate open question ID: ${question.id}`,
        path: `openQuestions[${i}].id`,
        details: {
          duplicateId: question.id,
        },
      });
    } else {
      seenIds.add(question.id);
    }
  }
}

/**
 * Validates state file references.
 *
 * @param context - The validation context
 * @param errors - Array to push errors to
 * @param warnings - Array to push warnings to
 */
async function validateStateReferences(
  context: ValidationContext,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): Promise<void> {
  const state = context.data as StateData;

  // Validate open question ID uniqueness
  if (state.openQuestions && Array.isArray(state.openQuestions)) {
    validateOpenQuestionUniqueness(state.openQuestions, errors);
  }

  // Cross-file validation: check activeTask exists in TASKS.json
  if (context.projectPath && state.activeTask) {
    const taskId =
      typeof state.activeTask === 'string'
        ? state.activeTask === 'None'
          ? null
          : state.activeTask.match(/^T\d{3}$/)?.[0]
        : state.activeTask?.id;

    if (taskId) {
      await validateTaskExistsInRegistry(
        context.projectPath,
        taskId,
        'activeTask.id',
        errors,
        warnings
      );
    }
  }

  // Validate sessionLog taskIds reference existing tasks
  if (context.projectPath && state.sessionLog && Array.isArray(state.sessionLog)) {
    for (const [i, entry] of state.sessionLog.entries()) {
      if (entry?.taskId) {
        await validateTaskExistsInRegistry(
          context.projectPath,
          entry.taskId,
          `sessionLog[${i}].taskId`,
          errors,
          warnings
        );
      }
    }
  }
}

/**
 * Validates that a task ID exists in the task registry.
 *
 * @param projectPath - Path to the project
 * @param taskId - The task ID to validate
 * @param path - The JSON path for error reporting
 * @param errors - Array to push errors to
 * @param warnings - Array to push warnings to
 */
async function validateTaskExistsInRegistry(
  projectPath: string,
  taskId: string,
  path: string,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): Promise<void> {
  const tasksPath = join(projectPath, '.planning', 'TASKS.json');

  try {
    const content = await fs.readFile(tasksPath, { encoding: 'utf-8' });
    const registry = JSON.parse(content) as TaskRegistry;

    if (!registry.tasks || !Array.isArray(registry.tasks)) {
      warnings.push({
        code: `${ERROR_CODE_PREFIX}_INVALID_REGISTRY`,
        message: 'TASKS.json has invalid structure, cannot validate task reference',
        path,
      });
      return;
    }

    const taskExists = registry.tasks.some((t) => t.id === taskId);
    if (!taskExists) {
      errors.push({
        code: `${ERROR_CODE_PREFIX}_ORPHAN_REFERENCE`,
        message: `Referenced task ${taskId} does not exist in TASKS.json`,
        path,
        details: {
          taskId,
          registryPath: tasksPath,
        },
      });
    }
  } catch (error) {
    // File might not exist or be readable - this is a warning, not an error
    const errorMessage = error instanceof Error ? error.message : String(error);
    warnings.push({
      code: `${ERROR_CODE_PREFIX}_REGISTRY_UNREADABLE`,
      message: `Cannot read TASKS.json for cross-reference validation: ${errorMessage}`,
      path,
    });
  }
}

/**
 * Validates plan file references.
 *
 * @param context - The validation context
 * @param errors - Array to push errors to
 * @param warnings - Array to push warnings to
 */
async function validatePlanReferences(
  context: ValidationContext,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): Promise<void> {
  const plan = context.data as PlanData;

  // Validate agent is a known type
  if (plan.agent && !KNOWN_AGENTS.has(plan.agent)) {
    errors.push({
      code: `${ERROR_CODE_PREFIX}_UNKNOWN_AGENT`,
      message: `Unknown agent type: ${plan.agent}`,
      path: 'agent',
      details: {
        agent: plan.agent,
        knownAgents: Array.from(KNOWN_AGENTS),
      },
    });
  }

  // Validate depends_on references exist as plan files
  if (plan.depends_on && Array.isArray(plan.depends_on) && context.projectPath) {
    for (const [i, depPlanId] of plan.depends_on.entries()) {
      if (depPlanId) {
        await validatePlanExists(
          context.projectPath,
          depPlanId,
          `depends_on[${i}]`,
          errors,
          warnings
        );
      }
    }
  }
}

/**
 * Validates that a plan ID references an existing plan.
 * Checks for plan files in the .planning/plans directory.
 *
 * @param projectPath - Path to the project
 * @param planId - The plan ID to validate (e.g., '03-01')
 * @param path - The JSON path for error reporting
 * @param errors - Array to push errors to
 * @param warnings - Array to push warnings to
 */
async function validatePlanExists(
  projectPath: string,
  planId: string,
  path: string,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): Promise<void> {
  // Plan files are typically named like XX-YY.plan.md
  // where XX is phase number and YY is plan number
  const plansDir = join(projectPath, '.planning', 'plans');

  try {
    const files = await fs.readdir(plansDir);

    // Look for a file that matches the plan ID pattern
    const planPattern = new RegExp(`^${planId}[.-].*\\.plan\\.md$`, 'i');
    const alternatePattern = new RegExp(`^.*${planId}\\.plan\\.md$`, 'i');

    const planExists = files.some(
      (file) => planPattern.test(file) || alternatePattern.test(file) || file.startsWith(planId)
    );

    if (!planExists) {
      errors.push({
        code: `${ERROR_CODE_PREFIX}_MISSING_PLAN`,
        message: `Referenced plan ${planId} not found in plans directory`,
        path,
        details: {
          planId,
          plansDir,
          availablePlans: files.filter((f) => f.endsWith('.plan.md')),
        },
      });
    }
  } catch (error) {
    // Plans directory might not exist - this is a warning
    const errorMessage = error instanceof Error ? error.message : String(error);
    warnings.push({
      code: `${ERROR_CODE_PREFIX}_PLANS_DIR_UNREADABLE`,
      message: `Cannot read plans directory for cross-reference validation: ${errorMessage}`,
      path,
    });
  }
}

/**
 * Referential integrity validation layer implementation.
 *
 * Validates cross-file and internal references for CLEO documents.
 * This is the third layer in the 4-layer validation pipeline.
 *
 * Validations performed:
 * - **Task Registry:**
 *   - All dependencies reference existing task IDs
 *   - No circular dependencies (A -> B -> A)
 *   - No self-references (task depending on itself)
 *   - lastTaskId matches highest task number
 *
 * - **State:**
 *   - activeTask references an existing task in TASKS.json (if projectPath provided)
 *   - openQuestions IDs are unique (Q1, Q2, etc.)
 *   - sessionLog taskIds reference existing tasks
 *
 * - **Plan:**
 *   - depends_on plan IDs reference existing plan files
 *   - agent values match known agent types
 *
 * @param context - The validation context containing data and metadata
 * @returns LayerResult with validation outcome
 *
 * @example
 * ```ts
 * const result = await referentialLayer({
 *   projectPath: '/path/to/project',
 *   fileType: 'task-registry',
 *   filePath: '/path/to/project/.planning/TASKS.json',
 *   data: parsedTasksJson,
 * });
 *
 * if (!result.valid) {
 *   console.error('Referential validation failed:', result.errors);
 *   // Check for specific error codes
 *   const hasCycle = result.errors.some(e => e.code === 'REFERENTIAL_CIRCULAR_DEPENDENCY');
 * }
 * ```
 */
export const referentialLayer: ValidationLayer = async (
  context: ValidationContext
): Promise<LayerResult> => {
  const startTime = Date.now();
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  try {
    switch (context.fileType) {
      case 'state':
        await validateStateReferences(context, errors, warnings);
        break;
      case 'plan':
        await validatePlanReferences(context, errors, warnings);
        break;
      case 'task-registry':
        validateTaskRegistryReferences(context.data, errors, warnings);
        break;
      default: {
        // TypeScript exhaustiveness check
        const _exhaustive: never = context.fileType;
        throw new Error(`Unknown file type: ${_exhaustive}`);
      }
    }

    const durationMs = Date.now() - startTime;

    if (errors.length === 0) {
      // Return success with any warnings collected
      return {
        layer: 'referential' as const,
        valid: true,
        errors: [],
        warnings,
        metadata: {
          exitCode: ExitCode.SUCCESS,
          durationMs,
          fileType: context.fileType,
          warningCount: warnings.length,
        },
      };
    }

    return createFailureResult('referential', errors, warnings, {
      exitCode: ExitCode.VALIDATION_REFERENTIAL,
      durationMs,
      fileType: context.fileType,
      errorCount: errors.length,
      warningCount: warnings.length,
    });
  } catch (error) {
    // Handle unexpected errors during validation
    const durationMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    return createFailureResult(
      'referential',
      [
        {
          code: `${ERROR_CODE_PREFIX}_INTERNAL_ERROR`,
          message: `Referential validation failed unexpectedly: ${errorMessage}`,
          path: '/',
          details: {
            error: errorMessage,
          },
        },
      ],
      warnings,
      {
        exitCode: ExitCode.VALIDATION_REFERENTIAL,
        durationMs,
        fileType: context.fileType,
      }
    );
  }
};

/**
 * Exported for testing purposes.
 */
export {
  detectCircularDependencies,
  buildDependencyGraph,
  validateDependenciesExist,
  validateNoSelfReferences,
  validateLastTaskId,
  validateOpenQuestionUniqueness,
  KNOWN_AGENTS,
};
