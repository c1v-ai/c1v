/**
 * Tests for Validation Hooks
 */

import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  loadSchemas,
  ExitCode,
} from '../../src';
import {
  beforeMutation,
  afterMutation,
  validateProjectHook,
  validateTaskStateChange,
  withValidation,
  withMutationValidation,
  validateFileExists,
  createValidationCheckpoint,
  ValidationError,
  type ValidationHookOptions,
} from '../../src/hooks';
import { readAuditLog, initAuditLog } from '../../src/audit';

describe('Validation Hooks', () => {
  let tempDir: string;
  let defaultOptions: ValidationHookOptions;

  beforeAll(async () => {
    await loadSchemas();
  });

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(join(tmpdir(), 'cleo-hooks-test-'));
    await fs.mkdir(join(tempDir, '.planning'), { recursive: true });
    await fs.mkdir(join(tempDir, '.planning', 'plans'), { recursive: true });
    await initAuditLog(tempDir);

    defaultOptions = {
      projectPath: tempDir,
      audit: true,
      agent: 'test-agent',
      throwOnError: false,
    };
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe('beforeMutation', () => {
    it('should validate valid task registry data before mutation', async () => {
      const tasksData = {
        version: '1.0.0',
        project: 'test-project',
        lastTaskId: 1,
        tasks: [
          {
            id: 'T001',
            title: 'Test task',
            phase: 1,
            status: 'pending',
            assignee: 'backend-architect',
            dependencies: [],
            created: '2026-01-24T10:00:00Z',
          },
        ],
      };

      const result = await beforeMutation(
        join(tempDir, '.planning', 'TASKS.json'),
        tasksData,
        defaultOptions
      );

      expect(result.valid).toBe(true);
      expect(result.exitCode).toBe(ExitCode.SUCCESS);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid task registry data', async () => {
      const invalidData = {
        version: '1.0.0',
        project: 'test',
        lastTaskId: 5, // Wrong - no tasks
        tasks: [],
      };

      const result = await beforeMutation(
        join(tempDir, '.planning', 'TASKS.json'),
        invalidData,
        defaultOptions
      );

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should return error for unknown file type', async () => {
      const result = await beforeMutation(
        join(tempDir, 'unknown.txt'),
        { data: 'test' },
        defaultOptions
      );

      expect(result.valid).toBe(false);
      expect(result.exitCode).toBe(ExitCode.INVALID_ARGUMENTS);
      expect(result.errors[0]).toContain('Cannot determine file type');
    });

    it('should throw when throwOnError is true', async () => {
      const invalidData = { invalid: true };

      await expect(
        beforeMutation(join(tempDir, '.planning', 'TASKS.json'), invalidData, {
          ...defaultOptions,
          throwOnError: true,
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should record audit entry on validation', async () => {
      const tasksData = {
        version: '1.0.0',
        project: 'test',
        lastTaskId: 1,
        tasks: [
          {
            id: 'T001',
            title: 'Test',
            phase: 1,
            status: 'pending',
            assignee: 'backend-architect',
            dependencies: [],
            created: '2026-01-24T10:00:00Z',
          },
        ],
      };

      await beforeMutation(
        join(tempDir, '.planning', 'TASKS.json'),
        tasksData,
        defaultOptions
      );

      const auditEntries = await readAuditLog(tempDir);
      expect(auditEntries.length).toBeGreaterThan(0);
      expect(auditEntries.some((e) => e.action === 'validation_passed')).toBe(true);
    });

    it('should skip audit when audit option is false', async () => {
      const tasksData = {
        version: '1.0.0',
        project: 'test',
        lastTaskId: 1,
        tasks: [
          {
            id: 'T001',
            title: 'Test',
            phase: 1,
            status: 'pending',
            assignee: 'backend-architect',
            dependencies: [],
            created: '2026-01-24T10:00:00Z',
          },
        ],
      };

      // Clear the audit log first
      await fs.writeFile(join(tempDir, '.planning', 'AUDIT.jsonl'), '');

      await beforeMutation(join(tempDir, '.planning', 'TASKS.json'), tasksData, {
        ...defaultOptions,
        audit: false,
      });

      const auditEntries = await readAuditLog(tempDir);
      expect(auditEntries).toHaveLength(0);
    });
  });

  describe('afterMutation', () => {
    it('should validate file from disk after mutation', async () => {
      const tasksData = {
        version: '1.0.0',
        project: 'test-project',
        lastTaskId: 1,
        tasks: [
          {
            id: 'T001',
            title: 'Test task',
            phase: 1,
            status: 'pending',
            assignee: 'backend-architect',
            dependencies: [],
            created: '2026-01-24T10:00:00Z',
          },
        ],
      };

      const filePath = join(tempDir, '.planning', 'TASKS.json');
      await fs.writeFile(filePath, JSON.stringify(tasksData, null, 2));

      const result = await afterMutation(filePath, defaultOptions);

      expect(result.valid).toBe(true);
      expect(result.exitCode).toBe(ExitCode.SUCCESS);
    });

    it('should detect invalid file after mutation', async () => {
      const invalidData = { invalid: true };

      const filePath = join(tempDir, '.planning', 'TASKS.json');
      await fs.writeFile(filePath, JSON.stringify(invalidData, null, 2));

      const result = await afterMutation(filePath, defaultOptions);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle non-existent file', async () => {
      const result = await afterMutation(
        join(tempDir, '.planning', 'NONEXISTENT.json'),
        { ...defaultOptions, layers: ['schema'] }
      );

      expect(result.valid).toBe(false);
    });
  });

  describe('validateProject', () => {
    it('should validate entire project when all files are valid', async () => {
      // Create valid STATE.json
      const stateData = {
        currentPosition: { phase: 1, status: 'executing' },
        nextSteps: ['Complete T001'],
      };
      await fs.writeFile(
        join(tempDir, '.planning', 'STATE.json'),
        JSON.stringify(stateData, null, 2)
      );

      // Create valid TASKS.json
      const tasksData = {
        version: '1.0.0',
        project: 'test',
        lastTaskId: 1,
        tasks: [
          {
            id: 'T001',
            title: 'Test',
            phase: 1,
            status: 'in_progress',
            assignee: 'backend-architect',
            dependencies: [],
            created: '2026-01-24T10:00:00Z',
          },
        ],
      };
      await fs.writeFile(
        join(tempDir, '.planning', 'TASKS.json'),
        JSON.stringify(tasksData, null, 2)
      );

      const result = await validateProjectHook(defaultOptions);

      expect(result.valid).toBe(true);
      expect(result.filesValidated).toBe(2);
      expect(result.errorCount).toBe(0);
    });

    it('should detect errors across multiple files', async () => {
      // Create invalid TASKS.json
      const invalidTasks = {
        version: '1.0.0',
        project: 'test',
        lastTaskId: 99, // Wrong
        tasks: [],
      };
      await fs.writeFile(
        join(tempDir, '.planning', 'TASKS.json'),
        JSON.stringify(invalidTasks, null, 2)
      );

      const result = await validateProjectHook(defaultOptions);

      expect(result.valid).toBe(false);
      expect(result.errorCount).toBeGreaterThan(0);
    });

    it('should throw when throwOnError is true and validation fails', async () => {
      // Create invalid file
      await fs.writeFile(
        join(tempDir, '.planning', 'TASKS.json'),
        JSON.stringify({ invalid: true }, null, 2)
      );

      await expect(
        validateProjectHook({ ...defaultOptions, throwOnError: true })
      ).rejects.toThrow(ValidationError);
    });

    it('should handle empty project gracefully', async () => {
      // Remove all files
      await fs.rm(join(tempDir, '.planning', 'AUDIT.jsonl'));

      const result = await validateProjectHook({ ...defaultOptions, audit: false });

      expect(result.valid).toBe(true);
      expect(result.filesValidated).toBe(0);
    });
  });

  describe('validateTaskStateChange', () => {
    it('should accept valid task state transitions', async () => {
      // pending -> in_progress
      const result1 = await validateTaskStateChange(
        'T001',
        'pending',
        'in_progress',
        defaultOptions
      );
      expect(result1.valid).toBe(true);

      // in_progress -> completed
      const result2 = await validateTaskStateChange(
        'T001',
        'in_progress',
        'completed',
        defaultOptions
      );
      expect(result2.valid).toBe(true);

      // blocked -> pending
      const result3 = await validateTaskStateChange('T001', 'blocked', 'pending', defaultOptions);
      expect(result3.valid).toBe(true);
    });

    it('should reject invalid task state transitions', async () => {
      // pending -> completed (must go through in_progress)
      const result1 = await validateTaskStateChange(
        'T001',
        'pending',
        'completed',
        defaultOptions
      );
      expect(result1.valid).toBe(false);
      expect(result1.error).toBeDefined();
      expect(result1.allowedTransitions).toContain('in_progress');

      // completed -> pending (terminal state)
      const result2 = await validateTaskStateChange(
        'T001',
        'completed',
        'pending',
        defaultOptions
      );
      expect(result2.valid).toBe(false);
    });

    it('should accept same status transition (no-op)', async () => {
      const result = await validateTaskStateChange(
        'T001',
        'pending',
        'pending',
        defaultOptions
      );
      expect(result.valid).toBe(true);
    });

    it('should throw when throwOnError is true for invalid transition', async () => {
      await expect(
        validateTaskStateChange('T001', 'completed', 'pending', {
          ...defaultOptions,
          throwOnError: true,
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should record state change in audit log', async () => {
      await validateTaskStateChange('T001', 'pending', 'in_progress', defaultOptions);

      const auditEntries = await readAuditLog(tempDir);
      expect(auditEntries.some((e) => e.action === 'state_changed')).toBe(true);
      expect(auditEntries.some((e) => e.taskId === 'T001')).toBe(true);
    });
  });

  describe('withValidation', () => {
    it('should wrap command and validate after execution', async () => {
      // Create valid files first
      const tasksData = {
        version: '1.0.0',
        project: 'test',
        lastTaskId: 1,
        tasks: [
          {
            id: 'T001',
            title: 'Test',
            phase: 1,
            status: 'pending',
            assignee: 'backend-architect',
            dependencies: [],
            created: '2026-01-24T10:00:00Z',
          },
        ],
      };
      await fs.writeFile(
        join(tempDir, '.planning', 'TASKS.json'),
        JSON.stringify(tasksData, null, 2)
      );

      let commandExecuted = false;
      const mockCommand = async () => {
        commandExecuted = true;
        return 'success';
      };

      const wrappedCommand = withValidation(mockCommand, defaultOptions);
      const result = await wrappedCommand();

      expect(commandExecuted).toBe(true);
      expect(result).toBe('success');
    });

    it('should throw when validation fails after command and throwOnError is true', async () => {
      // Create invalid file
      await fs.writeFile(
        join(tempDir, '.planning', 'TASKS.json'),
        JSON.stringify({ invalid: true }, null, 2)
      );

      const mockCommand = async () => 'done';
      const wrappedCommand = withValidation(mockCommand, {
        ...defaultOptions,
        throwOnError: true,
      });

      await expect(wrappedCommand()).rejects.toThrow(ValidationError);
    });
  });

  describe('withMutationValidation', () => {
    it('should validate before and after mutation', async () => {
      const filePath = join(tempDir, '.planning', 'TASKS.json');

      const tasksData = {
        version: '1.0.0',
        project: 'test',
        lastTaskId: 1,
        tasks: [
          {
            id: 'T001',
            title: 'Test',
            phase: 1,
            status: 'pending',
            assignee: 'backend-architect',
            dependencies: [],
            created: '2026-01-24T10:00:00Z',
          },
        ],
      };

      const result = await withMutationValidation(
        async () => tasksData,
        filePath,
        defaultOptions
      );

      expect(result.preValidation.valid).toBe(true);
      expect(result.postValidation.valid).toBe(true);
      expect(result.data).toEqual(tasksData);

      // Verify file was written
      const writtenData = JSON.parse(await fs.readFile(filePath, 'utf-8'));
      expect(writtenData).toEqual(tasksData);
    });

    it('should fail on pre-validation error', async () => {
      const filePath = join(tempDir, '.planning', 'TASKS.json');

      const result = await withMutationValidation(
        async () => ({ invalid: true }),
        filePath,
        defaultOptions
      );

      expect(result.preValidation.valid).toBe(false);
      expect(result.postValidation.valid).toBe(false);
      expect(result.postValidation.errors[0]).toContain('pre-mutation validation failed');
    });

    it('should throw on pre-validation error when throwOnError is true', async () => {
      const filePath = join(tempDir, '.planning', 'TASKS.json');

      await expect(
        withMutationValidation(async () => ({ invalid: true }), filePath, {
          ...defaultOptions,
          throwOnError: true,
        })
      ).rejects.toThrow('Pre-mutation validation failed');
    });
  });

  describe('validateFileExists', () => {
    it('should return valid for existing valid file', async () => {
      const tasksData = {
        version: '1.0.0',
        project: 'test',
        lastTaskId: 1,
        tasks: [
          {
            id: 'T001',
            title: 'Test',
            phase: 1,
            status: 'pending',
            assignee: 'backend-architect',
            dependencies: [],
            created: '2026-01-24T10:00:00Z',
          },
        ],
      };

      const filePath = join(tempDir, '.planning', 'TASKS.json');
      await fs.writeFile(filePath, JSON.stringify(tasksData, null, 2));

      const result = await validateFileExists(filePath, defaultOptions);

      expect(result.valid).toBe(true);
    });

    it('should return RESOURCE_NOT_FOUND for non-existent file', async () => {
      const result = await validateFileExists(
        join(tempDir, '.planning', 'NONEXISTENT.json'),
        defaultOptions
      );

      expect(result.valid).toBe(false);
      expect(result.exitCode).toBe(ExitCode.RESOURCE_NOT_FOUND);
      expect(result.errors[0]).toContain('does not exist');
    });

    it('should validate file contents for existing file', async () => {
      const filePath = join(tempDir, '.planning', 'TASKS.json');
      await fs.writeFile(filePath, JSON.stringify({ invalid: true }, null, 2));

      const result = await validateFileExists(filePath, defaultOptions);

      expect(result.valid).toBe(false);
      expect(result.exitCode).not.toBe(ExitCode.RESOURCE_NOT_FOUND);
    });
  });

  describe('createValidationCheckpoint', () => {
    it('should capture initial state and verify no changes', async () => {
      // Create valid files
      const tasksData = {
        version: '1.0.0',
        project: 'test',
        lastTaskId: 1,
        tasks: [
          {
            id: 'T001',
            title: 'Test',
            phase: 1,
            status: 'pending',
            assignee: 'backend-architect',
            dependencies: [],
            created: '2026-01-24T10:00:00Z',
          },
        ],
      };
      await fs.writeFile(
        join(tempDir, '.planning', 'TASKS.json'),
        JSON.stringify(tasksData, null, 2)
      );

      const checkpoint = await createValidationCheckpoint(defaultOptions);

      expect(checkpoint.initialResult.valid).toBe(true);
      expect(checkpoint.timestamp).toBeInstanceOf(Date);

      // Verify with no changes
      const verification = await checkpoint.verify();
      expect(verification.valid).toBe(true);
      expect(verification.changed).toBe(false);
    });

    it('should detect state changes between checkpoint and verify', async () => {
      // Create valid file
      const tasksData = {
        version: '1.0.0',
        project: 'test',
        lastTaskId: 1,
        tasks: [
          {
            id: 'T001',
            title: 'Test',
            phase: 1,
            status: 'pending',
            assignee: 'backend-architect',
            dependencies: [],
            created: '2026-01-24T10:00:00Z',
          },
        ],
      };
      const filePath = join(tempDir, '.planning', 'TASKS.json');
      await fs.writeFile(filePath, JSON.stringify(tasksData, null, 2));

      const checkpoint = await createValidationCheckpoint(defaultOptions);

      // Make changes that break validation
      await fs.writeFile(filePath, JSON.stringify({ invalid: true }, null, 2));

      const verification = await checkpoint.verify();
      expect(verification.changed).toBe(true);
      expect(verification.valid).toBe(false);
    });
  });

  describe('ValidationError', () => {
    it('should contain exit code and validation errors', () => {
      const error = new ValidationError(
        'Test error',
        ExitCode.VALIDATION_SCHEMA,
        ['Error 1', 'Error 2']
      );

      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Test error');
      expect(error.exitCode).toBe(ExitCode.VALIDATION_SCHEMA);
      expect(error.validationErrors).toEqual(['Error 1', 'Error 2']);
    });

    it('should be catchable as Error', () => {
      const error = new ValidationError('Test', ExitCode.GENERAL_ERROR, []);

      expect(error instanceof Error).toBe(true);
      expect(error instanceof ValidationError).toBe(true);
    });
  });

  describe('layer filtering', () => {
    it('should only run specified layers', async () => {
      const tasksData = {
        version: '1.0.0',
        project: 'test',
        lastTaskId: 1,
        tasks: [
          {
            id: 'T001',
            title: 'Test',
            phase: 1,
            status: 'pending',
            assignee: 'backend-architect',
            dependencies: [],
            created: '2026-01-24T10:00:00Z',
          },
        ],
      };

      const result = await beforeMutation(
        join(tempDir, '.planning', 'TASKS.json'),
        tasksData,
        {
          ...defaultOptions,
          layers: ['schema', 'semantic'],
        }
      );

      expect(result.valid).toBe(true);
      expect(result.details?.metadata.layersRun).toBe(2);
    });
  });
});
