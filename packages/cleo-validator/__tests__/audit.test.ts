/**
 * Tests for the CLEO Audit Trail Logger module
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  AUDIT_LOG_FILENAME,
  initAuditLog,
  appendAuditEntry,
  readAuditLog,
  auditTaskStart,
  auditTaskComplete,
  auditValidation,
  auditAgentStart,
  auditAgentEnd,
  auditStateChange,
  auditError,
  auditCheckpoint,
  auditDecision,
  auditTaskCreate,
  type AuditEntry,
} from '../src/audit';
import { ExitCode } from '../src/exit-codes';

describe('CLEO Audit Trail Logger', () => {
  let testProjectPath: string;
  let planningDir: string;
  let auditLogPath: string;

  beforeEach(async () => {
    // Create a unique temporary directory for each test
    testProjectPath = join(tmpdir(), `cleo-audit-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    planningDir = join(testProjectPath, '.planning');
    auditLogPath = join(planningDir, AUDIT_LOG_FILENAME);
    await fs.mkdir(testProjectPath, { recursive: true });
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testProjectPath, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('AUDIT_LOG_FILENAME constant', () => {
    it('should be AUDIT.jsonl', () => {
      expect(AUDIT_LOG_FILENAME).toBe('AUDIT.jsonl');
    });
  });

  describe('initAuditLog', () => {
    it('should create .planning directory if it does not exist', async () => {
      await initAuditLog(testProjectPath);

      const stat = await fs.stat(planningDir);
      expect(stat.isDirectory()).toBe(true);
    });

    it('should create AUDIT.jsonl file if it does not exist', async () => {
      await initAuditLog(testProjectPath);

      const stat = await fs.stat(auditLogPath);
      expect(stat.isFile()).toBe(true);
    });

    it('should create an empty AUDIT.jsonl file', async () => {
      await initAuditLog(testProjectPath);

      const content = await fs.readFile(auditLogPath, { encoding: 'utf-8' });
      expect(content).toBe('');
    });

    it('should not overwrite existing AUDIT.jsonl file', async () => {
      // Create planning dir and file with content
      await fs.mkdir(planningDir, { recursive: true });
      await fs.writeFile(auditLogPath, '{"existing":"content"}\n', { encoding: 'utf-8' });

      // Init should not overwrite
      await initAuditLog(testProjectPath);

      const content = await fs.readFile(auditLogPath, { encoding: 'utf-8' });
      expect(content).toBe('{"existing":"content"}\n');
    });

    it('should be idempotent', async () => {
      await initAuditLog(testProjectPath);
      await initAuditLog(testProjectPath);
      await initAuditLog(testProjectPath);

      const stat = await fs.stat(auditLogPath);
      expect(stat.isFile()).toBe(true);
    });
  });

  describe('appendAuditEntry', () => {
    beforeEach(async () => {
      await initAuditLog(testProjectPath);
    });

    it('should append an entry to the audit log', async () => {
      await appendAuditEntry(testProjectPath, {
        agent: 'test-agent',
        action: 'task_started',
        taskId: 'T001',
        message: 'Test entry',
      });

      const entries = await readAuditLog(testProjectPath);
      expect(entries).toHaveLength(1);
      expect(entries[0]?.agent).toBe('test-agent');
      expect(entries[0]?.action).toBe('task_started');
      expect(entries[0]?.taskId).toBe('T001');
      expect(entries[0]?.message).toBe('Test entry');
    });

    it('should auto-generate ISO 8601 timestamp', async () => {
      const before = new Date().toISOString();
      await appendAuditEntry(testProjectPath, {
        agent: 'test-agent',
        action: 'task_started',
      });
      const after = new Date().toISOString();

      const entries = await readAuditLog(testProjectPath);
      const timestamp = entries[0]?.timestamp;
      expect(timestamp).toBeDefined();
      expect(timestamp! >= before).toBe(true);
      expect(timestamp! <= after).toBe(true);
    });

    it('should append without modifying existing entries', async () => {
      await appendAuditEntry(testProjectPath, {
        agent: 'agent1',
        action: 'task_started',
        message: 'First entry',
      });

      await appendAuditEntry(testProjectPath, {
        agent: 'agent2',
        action: 'task_completed',
        message: 'Second entry',
      });

      const entries = await readAuditLog(testProjectPath);
      expect(entries).toHaveLength(2);
      expect(entries[0]?.message).toBe('First entry');
      expect(entries[1]?.message).toBe('Second entry');
    });

    it('should preserve entry order', async () => {
      for (let i = 1; i <= 5; i++) {
        await appendAuditEntry(testProjectPath, {
          agent: 'test-agent',
          action: 'checkpoint_reached',
          message: `Entry ${i}`,
        });
      }

      const entries = await readAuditLog(testProjectPath);
      expect(entries).toHaveLength(5);
      for (let i = 0; i < 5; i++) {
        expect(entries[i]?.message).toBe(`Entry ${i + 1}`);
      }
    });

    it('should handle entries with all optional fields', async () => {
      await appendAuditEntry(testProjectPath, {
        agent: 'full-agent',
        action: 'state_changed',
        taskId: 'T042',
        exitCode: 0,
        before: { status: 'pending' },
        after: { status: 'in_progress' },
        message: 'Status updated',
        metadata: { duration: 1500, retry: false },
      });

      const entries = await readAuditLog(testProjectPath);
      expect(entries).toHaveLength(1);

      const entry = entries[0]!;
      expect(entry.taskId).toBe('T042');
      expect(entry.exitCode).toBe(0);
      expect(entry.before).toEqual({ status: 'pending' });
      expect(entry.after).toEqual({ status: 'in_progress' });
      expect(entry.metadata).toEqual({ duration: 1500, retry: false });
    });
  });

  describe('readAuditLog', () => {
    it('should return empty array for non-existent file', async () => {
      const entries = await readAuditLog(testProjectPath);
      expect(entries).toEqual([]);
    });

    it('should return empty array for empty file', async () => {
      await initAuditLog(testProjectPath);

      const entries = await readAuditLog(testProjectPath);
      expect(entries).toEqual([]);
    });

    it('should read all entries in chronological order', async () => {
      await initAuditLog(testProjectPath);

      await appendAuditEntry(testProjectPath, {
        agent: 'agent1',
        action: 'agent_started',
      });

      await appendAuditEntry(testProjectPath, {
        agent: 'agent1',
        action: 'task_started',
        taskId: 'T001',
      });

      await appendAuditEntry(testProjectPath, {
        agent: 'agent1',
        action: 'task_completed',
        taskId: 'T001',
        exitCode: 0,
      });

      const entries = await readAuditLog(testProjectPath);
      expect(entries).toHaveLength(3);
      expect(entries[0]?.action).toBe('agent_started');
      expect(entries[1]?.action).toBe('task_started');
      expect(entries[2]?.action).toBe('task_completed');
    });

    it('should parse JSON correctly for complex metadata', async () => {
      await initAuditLog(testProjectPath);

      const complexMetadata = {
        nested: { deep: { value: 123 } },
        array: [1, 2, 3],
        special: 'chars: "quotes" and \\backslash',
      };

      await appendAuditEntry(testProjectPath, {
        agent: 'test-agent',
        action: 'checkpoint_reached',
        metadata: complexMetadata,
      });

      const entries = await readAuditLog(testProjectPath);
      expect(entries[0]?.metadata).toEqual(complexMetadata);
    });
  });

  describe('Concurrent writes', () => {
    it('should handle concurrent writes without data corruption', async () => {
      await initAuditLog(testProjectPath);

      // Write 10 entries concurrently
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          appendAuditEntry(testProjectPath, {
            agent: `agent-${i}`,
            action: 'checkpoint_reached',
            message: `Entry ${i}`,
          })
        );
      }

      await Promise.all(promises);

      const entries = await readAuditLog(testProjectPath);
      expect(entries).toHaveLength(10);

      // All entries should be valid JSON with required fields
      for (const entry of entries) {
        expect(entry.agent).toBeDefined();
        expect(entry.action).toBe('checkpoint_reached');
        expect(entry.timestamp).toBeDefined();
      }
    });
  });

  describe('auditTaskStart', () => {
    beforeEach(async () => {
      await initAuditLog(testProjectPath);
    });

    it('should record task start with correct action', async () => {
      await auditTaskStart(testProjectPath, 'backend-architect', 'T001');

      const entries = await readAuditLog(testProjectPath);
      expect(entries).toHaveLength(1);
      expect(entries[0]?.action).toBe('task_started');
      expect(entries[0]?.agent).toBe('backend-architect');
      expect(entries[0]?.taskId).toBe('T001');
    });

    it('should generate default message', async () => {
      await auditTaskStart(testProjectPath, 'qa-engineer', 'T042');

      const entries = await readAuditLog(testProjectPath);
      expect(entries[0]?.message).toBe('Task T042 started by qa-engineer');
    });

    it('should use custom message when provided', async () => {
      await auditTaskStart(testProjectPath, 'backend-architect', 'T001', 'Starting critical task');

      const entries = await readAuditLog(testProjectPath);
      expect(entries[0]?.message).toBe('Starting critical task');
    });
  });

  describe('auditTaskComplete', () => {
    beforeEach(async () => {
      await initAuditLog(testProjectPath);
    });

    it('should record successful completion with task_completed action', async () => {
      await auditTaskComplete(testProjectPath, 'backend-architect', 'T001', ExitCode.SUCCESS);

      const entries = await readAuditLog(testProjectPath);
      expect(entries[0]?.action).toBe('task_completed');
      expect(entries[0]?.exitCode).toBe(0);
    });

    it('should record failure with task_blocked action', async () => {
      await auditTaskComplete(testProjectPath, 'qa-engineer', 'T001', ExitCode.VALIDATION_SCHEMA);

      const entries = await readAuditLog(testProjectPath);
      expect(entries[0]?.action).toBe('task_blocked');
      expect(entries[0]?.exitCode).toBe(5);
    });

    it('should generate message with exit code name', async () => {
      await auditTaskComplete(testProjectPath, 'backend-architect', 'T001', ExitCode.TIMEOUT);

      const entries = await readAuditLog(testProjectPath);
      expect(entries[0]?.message).toContain('TIMEOUT');
      expect(entries[0]?.message).toContain('13');
    });
  });

  describe('auditValidation', () => {
    beforeEach(async () => {
      await initAuditLog(testProjectPath);
    });

    it('should record validation passed', async () => {
      await auditValidation(testProjectPath, true, 'schema');

      const entries = await readAuditLog(testProjectPath);
      expect(entries[0]?.action).toBe('validation_passed');
      expect(entries[0]?.exitCode).toBe(ExitCode.SUCCESS);
      expect(entries[0]?.message).toBe('schema validation passed');
    });

    it('should record validation failed with correct exit code for schema', async () => {
      await auditValidation(testProjectPath, false, 'schema');

      const entries = await readAuditLog(testProjectPath);
      expect(entries[0]?.action).toBe('validation_failed');
      expect(entries[0]?.exitCode).toBe(ExitCode.VALIDATION_SCHEMA);
    });

    it('should record validation failed with correct exit code for semantic', async () => {
      await auditValidation(testProjectPath, false, 'semantic');

      const entries = await readAuditLog(testProjectPath);
      expect(entries[0]?.exitCode).toBe(ExitCode.VALIDATION_SEMANTIC);
    });

    it('should record validation failed with correct exit code for referential', async () => {
      await auditValidation(testProjectPath, false, 'referential');

      const entries = await readAuditLog(testProjectPath);
      expect(entries[0]?.exitCode).toBe(ExitCode.VALIDATION_REFERENTIAL);
    });

    it('should record validation failed with correct exit code for state_machine', async () => {
      await auditValidation(testProjectPath, false, 'state_machine');

      const entries = await readAuditLog(testProjectPath);
      expect(entries[0]?.exitCode).toBe(ExitCode.VALIDATION_STATE_MACHINE);
    });

    it('should include validation details in metadata', async () => {
      const details = { errors: ['Missing field: name'] };
      await auditValidation(testProjectPath, false, 'schema', details);

      const entries = await readAuditLog(testProjectPath);
      expect(entries[0]?.metadata).toEqual({ layer: 'schema', details });
    });

    it('should use default agent cleo-validator', async () => {
      await auditValidation(testProjectPath, true, 'schema');

      const entries = await readAuditLog(testProjectPath);
      expect(entries[0]?.agent).toBe('cleo-validator');
    });

    it('should allow custom agent', async () => {
      await auditValidation(testProjectPath, true, 'schema', undefined, 'custom-validator');

      const entries = await readAuditLog(testProjectPath);
      expect(entries[0]?.agent).toBe('custom-validator');
    });
  });

  describe('auditAgentStart', () => {
    beforeEach(async () => {
      await initAuditLog(testProjectPath);
    });

    it('should record agent start without task', async () => {
      await auditAgentStart(testProjectPath, 'qa-engineer');

      const entries = await readAuditLog(testProjectPath);
      expect(entries[0]?.action).toBe('agent_started');
      expect(entries[0]?.agent).toBe('qa-engineer');
      expect(entries[0]?.taskId).toBeUndefined();
      expect(entries[0]?.message).toBe('Agent qa-engineer started');
    });

    it('should record agent start with task', async () => {
      await auditAgentStart(testProjectPath, 'backend-architect', 'T001');

      const entries = await readAuditLog(testProjectPath);
      expect(entries[0]?.taskId).toBe('T001');
      expect(entries[0]?.message).toBe('Agent backend-architect started for task T001');
    });
  });

  describe('auditAgentEnd', () => {
    beforeEach(async () => {
      await initAuditLog(testProjectPath);
    });

    it('should record agent completion with exit code', async () => {
      await auditAgentEnd(testProjectPath, 'qa-engineer', ExitCode.SUCCESS);

      const entries = await readAuditLog(testProjectPath);
      expect(entries[0]?.action).toBe('agent_completed');
      expect(entries[0]?.exitCode).toBe(0);
      expect(entries[0]?.message).toContain('SUCCESS');
    });

    it('should include task ID when provided', async () => {
      await auditAgentEnd(testProjectPath, 'backend-architect', ExitCode.SUCCESS, 'T001');

      const entries = await readAuditLog(testProjectPath);
      expect(entries[0]?.taskId).toBe('T001');
      expect(entries[0]?.message).toContain('T001');
    });
  });

  describe('auditStateChange', () => {
    beforeEach(async () => {
      await initAuditLog(testProjectPath);
    });

    it('should record state change with before and after', async () => {
      await auditStateChange(
        testProjectPath,
        'backend-architect',
        { status: 'pending' },
        { status: 'in_progress' }
      );

      const entries = await readAuditLog(testProjectPath);
      expect(entries[0]?.action).toBe('state_changed');
      expect(entries[0]?.before).toEqual({ status: 'pending' });
      expect(entries[0]?.after).toEqual({ status: 'in_progress' });
    });

    it('should include task ID when provided', async () => {
      await auditStateChange(
        testProjectPath,
        'backend-architect',
        { status: 'pending' },
        { status: 'in_progress' },
        'Status updated',
        'T001'
      );

      const entries = await readAuditLog(testProjectPath);
      expect(entries[0]?.taskId).toBe('T001');
    });
  });

  describe('auditError', () => {
    beforeEach(async () => {
      await initAuditLog(testProjectPath);
    });

    it('should record error with exit code and details', async () => {
      const error = { message: 'Connection refused', code: 'ECONNREFUSED' };
      await auditError(testProjectPath, 'backend-architect', ExitCode.EXTERNAL_SERVICE_ERROR, error);

      const entries = await readAuditLog(testProjectPath);
      expect(entries[0]?.action).toBe('error_occurred');
      expect(entries[0]?.exitCode).toBe(ExitCode.EXTERNAL_SERVICE_ERROR);
      expect(entries[0]?.metadata).toEqual({ error });
    });

    it('should include task ID when provided', async () => {
      await auditError(testProjectPath, 'qa-engineer', ExitCode.TIMEOUT, 'Test timeout', 'T042');

      const entries = await readAuditLog(testProjectPath);
      expect(entries[0]?.taskId).toBe('T042');
    });
  });

  describe('auditCheckpoint', () => {
    beforeEach(async () => {
      await initAuditLog(testProjectPath);
    });

    it('should record checkpoint with name', async () => {
      await auditCheckpoint(testProjectPath, 'backend-architect', 'database_migrated');

      const entries = await readAuditLog(testProjectPath);
      expect(entries[0]?.action).toBe('checkpoint_reached');
      expect(entries[0]?.message).toBe('Checkpoint: database_migrated');
      expect(entries[0]?.metadata?.checkpoint).toBe('database_migrated');
    });

    it('should include additional metadata', async () => {
      await auditCheckpoint(testProjectPath, 'backend-architect', 'tables_created', { count: 5 });

      const entries = await readAuditLog(testProjectPath);
      expect(entries[0]?.metadata).toEqual({ checkpoint: 'tables_created', count: 5 });
    });
  });

  describe('auditDecision', () => {
    beforeEach(async () => {
      await initAuditLog(testProjectPath);
    });

    it('should record decision with message', async () => {
      await auditDecision(testProjectPath, 'backend-architect', 'Use PostgreSQL for primary database');

      const entries = await readAuditLog(testProjectPath);
      expect(entries[0]?.action).toBe('decision_made');
      expect(entries[0]?.message).toBe('Use PostgreSQL for primary database');
    });

    it('should include rationale and alternatives', async () => {
      await auditDecision(
        testProjectPath,
        'backend-architect',
        'Use PostgreSQL',
        'Better JSONB support',
        ['MySQL', 'MongoDB']
      );

      const entries = await readAuditLog(testProjectPath);
      expect(entries[0]?.metadata).toEqual({
        decision: 'Use PostgreSQL',
        rationale: 'Better JSONB support',
        alternatives: ['MySQL', 'MongoDB'],
      });
    });
  });

  describe('auditTaskCreate', () => {
    beforeEach(async () => {
      await initAuditLog(testProjectPath);
    });

    it('should record task creation', async () => {
      await auditTaskCreate(testProjectPath, 'product-manager', 'T001');

      const entries = await readAuditLog(testProjectPath);
      expect(entries[0]?.action).toBe('task_created');
      expect(entries[0]?.taskId).toBe('T001');
      expect(entries[0]?.message).toBe('Task T001 created');
    });

    it('should include task details in metadata', async () => {
      await auditTaskCreate(testProjectPath, 'product-manager', 'T001', {
        title: 'Implement authentication',
        priority: 'high',
      });

      const entries = await readAuditLog(testProjectPath);
      expect(entries[0]?.metadata).toEqual({
        title: 'Implement authentication',
        priority: 'high',
      });
    });
  });
});
