/**
 * CLEO Audit Trail Logger
 *
 * Provides an immutable, append-only audit trail for recording all state changes
 * during GSD workflow execution. All entries are written to AUDIT.jsonl in JSONL format.
 *
 * @module audit
 */

import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { ExitCode, ExitCodeValue, getExitCodeName } from './exit-codes';

/**
 * The filename for the audit log.
 */
export const AUDIT_LOG_FILENAME = 'AUDIT.jsonl';

/**
 * Types of actions that can be recorded in the audit trail.
 */
export type AuditAction =
  | 'task_created'
  | 'task_started'
  | 'task_completed'
  | 'task_blocked'
  | 'state_changed'
  | 'validation_passed'
  | 'validation_failed'
  | 'agent_started'
  | 'agent_completed'
  | 'error_occurred'
  | 'checkpoint_reached'
  | 'decision_made';

/**
 * Structure of an audit log entry.
 * Each entry represents a single, immutable record of an action or state change.
 */
export interface AuditEntry {
  /** ISO 8601 timestamp of when the action occurred */
  timestamp: string;
  /** The agent type that performed the action (e.g., 'backend-architect', 'qa-engineer') */
  agent: string;
  /** The type of action being recorded */
  action: AuditAction;
  /** The task ID (T###) if this action relates to a specific task */
  taskId?: string;
  /** The exit code if this action resulted in a specific outcome */
  exitCode?: number;
  /** The state before the change (for state_changed actions) */
  before?: unknown;
  /** The state after the change (for state_changed actions) */
  after?: unknown;
  /** Human-readable description of the action */
  message?: string;
  /** Additional metadata relevant to the action */
  metadata?: Record<string, unknown>;
}

/**
 * Input type for creating an audit entry (timestamp is auto-generated).
 */
export type AuditEntryInput = Omit<AuditEntry, 'timestamp'>;

/**
 * Gets the full path to the audit log file for a project.
 *
 * @param projectPath - The root path of the project
 * @returns The full path to AUDIT.jsonl
 */
function getAuditLogPath(projectPath: string): string {
  return join(projectPath, '.planning', AUDIT_LOG_FILENAME);
}

/**
 * Initializes the audit log for a project.
 * Creates the .planning directory and AUDIT.jsonl file if they don't exist.
 *
 * @param projectPath - The root path of the project
 * @throws If the directory cannot be created
 *
 * @example
 * ```ts
 * await initAuditLog('/path/to/project');
 * // Creates /path/to/project/.planning/AUDIT.jsonl if it doesn't exist
 * ```
 */
export async function initAuditLog(projectPath: string): Promise<void> {
  const planningDir = join(projectPath, '.planning');
  const auditLogPath = getAuditLogPath(projectPath);

  // Create .planning directory if it doesn't exist
  await fs.mkdir(planningDir, { recursive: true });

  // Create empty AUDIT.jsonl if it doesn't exist
  try {
    await fs.access(auditLogPath);
  } catch {
    await fs.writeFile(auditLogPath, '', { encoding: 'utf-8', flag: 'wx' });
  }
}

/**
 * Appends a single entry to the audit log.
 * This function is append-only and never modifies existing entries.
 *
 * @param projectPath - The root path of the project
 * @param entry - The audit entry to append (timestamp will be auto-generated)
 * @throws If the file cannot be written
 *
 * @example
 * ```ts
 * await appendAuditEntry('/path/to/project', {
 *   agent: 'backend-architect',
 *   action: 'task_started',
 *   taskId: 'T001',
 *   message: 'Starting implementation of user authentication'
 * });
 * ```
 */
export async function appendAuditEntry(
  projectPath: string,
  entry: AuditEntryInput
): Promise<void> {
  const auditLogPath = getAuditLogPath(projectPath);

  // Create full entry with timestamp
  const fullEntry: AuditEntry = {
    timestamp: new Date().toISOString(),
    ...entry,
  };

  // Serialize to JSON line (no pretty printing, single line)
  const jsonLine = JSON.stringify(fullEntry) + '\n';

  // Append to file (flag 'a' opens for appending, creates if doesn't exist)
  await fs.appendFile(auditLogPath, jsonLine, { encoding: 'utf-8' });
}

/**
 * Reads the entire audit log for a project.
 * Useful for debugging, reporting, and audit review.
 *
 * @param projectPath - The root path of the project
 * @returns Array of all audit entries in chronological order
 * @throws If the file cannot be read
 *
 * @example
 * ```ts
 * const entries = await readAuditLog('/path/to/project');
 * entries.forEach(entry => {
 *   console.log(`[${entry.timestamp}] ${entry.agent}: ${entry.action}`);
 * });
 * ```
 */
export async function readAuditLog(projectPath: string): Promise<AuditEntry[]> {
  const auditLogPath = getAuditLogPath(projectPath);

  try {
    const content = await fs.readFile(auditLogPath, { encoding: 'utf-8' });

    // Parse each line as JSON
    return content
      .split('\n')
      .filter((line) => line.trim() !== '')
      .map((line) => JSON.parse(line) as AuditEntry);
  } catch (error) {
    // If file doesn't exist, return empty array
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

/**
 * Records the start of a task.
 *
 * @param projectPath - The root path of the project
 * @param agent - The agent type starting the task
 * @param taskId - The task ID (T###)
 * @param message - Optional additional message
 *
 * @example
 * ```ts
 * await auditTaskStart('/path/to/project', 'backend-architect', 'T001');
 * ```
 */
export async function auditTaskStart(
  projectPath: string,
  agent: string,
  taskId: string,
  message?: string
): Promise<void> {
  await appendAuditEntry(projectPath, {
    agent,
    action: 'task_started',
    taskId,
    message: message ?? `Task ${taskId} started by ${agent}`,
  });
}

/**
 * Records the completion of a task with an exit code.
 *
 * @param projectPath - The root path of the project
 * @param agent - The agent type completing the task
 * @param taskId - The task ID (T###)
 * @param exitCode - The exit code indicating the outcome
 * @param message - Optional additional message
 *
 * @example
 * ```ts
 * await auditTaskComplete('/path/to/project', 'backend-architect', 'T001', ExitCode.SUCCESS);
 * ```
 */
export async function auditTaskComplete(
  projectPath: string,
  agent: string,
  taskId: string,
  exitCode: number,
  message?: string
): Promise<void> {
  const action: AuditAction =
    exitCode === ExitCode.SUCCESS ? 'task_completed' : 'task_blocked';

  await appendAuditEntry(projectPath, {
    agent,
    action,
    taskId,
    exitCode,
    message:
      message ??
      `Task ${taskId} ${action === 'task_completed' ? 'completed' : 'blocked'} with exit code ${exitCode} (${getExitCodeName(exitCode)})`,
  });
}

/**
 * Records a validation result.
 *
 * @param projectPath - The root path of the project
 * @param passed - Whether the validation passed
 * @param layer - The validation layer (schema, semantic, referential, state_machine)
 * @param details - Optional validation details (errors, warnings, etc.)
 * @param agent - Optional agent that triggered validation (defaults to 'cleo-validator')
 *
 * @example
 * ```ts
 * await auditValidation('/path/to/project', true, 'schema');
 * await auditValidation('/path/to/project', false, 'semantic', { errors: ['Invalid status'] });
 * ```
 */
export async function auditValidation(
  projectPath: string,
  passed: boolean,
  layer: string,
  details?: unknown,
  agent: string = 'cleo-validator'
): Promise<void> {
  await appendAuditEntry(projectPath, {
    agent,
    action: passed ? 'validation_passed' : 'validation_failed',
    exitCode: passed
      ? ExitCode.SUCCESS
      : getValidationExitCode(layer),
    message: `${layer} validation ${passed ? 'passed' : 'failed'}`,
    metadata: details ? { layer, details } : { layer },
  });
}

/**
 * Gets the appropriate exit code for a validation layer.
 */
function getValidationExitCode(layer: string): ExitCodeValue {
  switch (layer.toLowerCase()) {
    case 'schema':
      return ExitCode.VALIDATION_SCHEMA;
    case 'semantic':
      return ExitCode.VALIDATION_SEMANTIC;
    case 'referential':
      return ExitCode.VALIDATION_REFERENTIAL;
    case 'state_machine':
    case 'state-machine':
    case 'statemachine':
      return ExitCode.VALIDATION_STATE_MACHINE;
    default:
      return ExitCode.VALIDATION_SCHEMA;
  }
}

/**
 * Records the start of an agent's work.
 *
 * @param projectPath - The root path of the project
 * @param agent - The agent type starting work
 * @param taskId - Optional task ID if the agent is working on a specific task
 * @param message - Optional additional message
 *
 * @example
 * ```ts
 * await auditAgentStart('/path/to/project', 'backend-architect', 'T001');
 * await auditAgentStart('/path/to/project', 'qa-engineer'); // No specific task
 * ```
 */
export async function auditAgentStart(
  projectPath: string,
  agent: string,
  taskId?: string,
  message?: string
): Promise<void> {
  await appendAuditEntry(projectPath, {
    agent,
    action: 'agent_started',
    taskId,
    message: message ?? `Agent ${agent} started${taskId ? ` for task ${taskId}` : ''}`,
  });
}

/**
 * Records the completion of an agent's work.
 *
 * @param projectPath - The root path of the project
 * @param agent - The agent type completing work
 * @param exitCode - The exit code indicating the outcome
 * @param taskId - Optional task ID if the agent was working on a specific task
 * @param message - Optional additional message
 *
 * @example
 * ```ts
 * await auditAgentEnd('/path/to/project', 'backend-architect', ExitCode.SUCCESS, 'T001');
 * ```
 */
export async function auditAgentEnd(
  projectPath: string,
  agent: string,
  exitCode: number,
  taskId?: string,
  message?: string
): Promise<void> {
  await appendAuditEntry(projectPath, {
    agent,
    action: 'agent_completed',
    taskId,
    exitCode,
    message:
      message ??
      `Agent ${agent} completed with exit code ${exitCode} (${getExitCodeName(exitCode)})${taskId ? ` for task ${taskId}` : ''}`,
  });
}

/**
 * Records a state change.
 *
 * @param projectPath - The root path of the project
 * @param agent - The agent that made the change
 * @param before - The state before the change
 * @param after - The state after the change
 * @param message - Optional description of the change
 * @param taskId - Optional task ID if related to a specific task
 *
 * @example
 * ```ts
 * await auditStateChange('/path/to/project', 'backend-architect',
 *   { status: 'pending' },
 *   { status: 'in_progress' },
 *   'Task status updated',
 *   'T001'
 * );
 * ```
 */
export async function auditStateChange(
  projectPath: string,
  agent: string,
  before: unknown,
  after: unknown,
  message?: string,
  taskId?: string
): Promise<void> {
  await appendAuditEntry(projectPath, {
    agent,
    action: 'state_changed',
    taskId,
    before,
    after,
    message: message ?? 'State changed',
  });
}

/**
 * Records an error occurrence.
 *
 * @param projectPath - The root path of the project
 * @param agent - The agent where the error occurred
 * @param exitCode - The exit code representing the error type
 * @param error - Error details (message, stack, etc.)
 * @param taskId - Optional task ID if related to a specific task
 *
 * @example
 * ```ts
 * await auditError('/path/to/project', 'backend-architect',
 *   ExitCode.EXTERNAL_SERVICE_ERROR,
 *   { message: 'Database connection failed', code: 'ECONNREFUSED' },
 *   'T001'
 * );
 * ```
 */
export async function auditError(
  projectPath: string,
  agent: string,
  exitCode: number,
  error: unknown,
  taskId?: string
): Promise<void> {
  await appendAuditEntry(projectPath, {
    agent,
    action: 'error_occurred',
    taskId,
    exitCode,
    message: `Error occurred: ${getExitCodeName(exitCode)}`,
    metadata: { error },
  });
}

/**
 * Records a checkpoint (useful for long-running operations).
 *
 * @param projectPath - The root path of the project
 * @param agent - The agent recording the checkpoint
 * @param checkpointName - Name/identifier for the checkpoint
 * @param metadata - Optional additional metadata
 * @param taskId - Optional task ID if related to a specific task
 *
 * @example
 * ```ts
 * await auditCheckpoint('/path/to/project', 'backend-architect',
 *   'database_migration_complete',
 *   { tablesCreated: 5 },
 *   'T001'
 * );
 * ```
 */
export async function auditCheckpoint(
  projectPath: string,
  agent: string,
  checkpointName: string,
  metadata?: Record<string, unknown>,
  taskId?: string
): Promise<void> {
  await appendAuditEntry(projectPath, {
    agent,
    action: 'checkpoint_reached',
    taskId,
    message: `Checkpoint: ${checkpointName}`,
    metadata: { checkpoint: checkpointName, ...metadata },
  });
}

/**
 * Records a decision made during workflow execution.
 *
 * @param projectPath - The root path of the project
 * @param agent - The agent that made the decision
 * @param decision - Description of the decision
 * @param rationale - Optional rationale for the decision
 * @param alternatives - Optional list of alternatives that were considered
 * @param taskId - Optional task ID if related to a specific task
 *
 * @example
 * ```ts
 * await auditDecision('/path/to/project', 'backend-architect',
 *   'Use PostgreSQL for primary database',
 *   'Better support for JSONB and full-text search',
 *   ['MySQL', 'MongoDB'],
 *   'T001'
 * );
 * ```
 */
export async function auditDecision(
  projectPath: string,
  agent: string,
  decision: string,
  rationale?: string,
  alternatives?: string[],
  taskId?: string
): Promise<void> {
  await appendAuditEntry(projectPath, {
    agent,
    action: 'decision_made',
    taskId,
    message: decision,
    metadata: {
      decision,
      rationale,
      alternatives,
    },
  });
}

/**
 * Records task creation.
 *
 * @param projectPath - The root path of the project
 * @param agent - The agent that created the task
 * @param taskId - The task ID (T###)
 * @param taskDetails - Optional details about the created task
 *
 * @example
 * ```ts
 * await auditTaskCreate('/path/to/project', 'product-manager', 'T001', {
 *   title: 'Implement user authentication',
 *   priority: 'high'
 * });
 * ```
 */
export async function auditTaskCreate(
  projectPath: string,
  agent: string,
  taskId: string,
  taskDetails?: Record<string, unknown>
): Promise<void> {
  await appendAuditEntry(projectPath, {
    agent,
    action: 'task_created',
    taskId,
    message: `Task ${taskId} created`,
    metadata: taskDetails,
  });
}
