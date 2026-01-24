/**
 * Tests for the Schema Validation Layer
 */

import { describe, it, expect, beforeAll } from 'vitest';
import {
  loadSchemas,
  schemaLayer,
  validateDataPresence,
  createFileReadErrorResult,
  createParseErrorResult,
  ExitCode,
  type ValidationContext,
} from '../../src';

describe('Schema Validation Layer', () => {
  beforeAll(async () => {
    await loadSchemas();
  });

  describe('schemaLayer', () => {
    describe('state validation', () => {
      it('should return success for valid state data', async () => {
        const context: ValidationContext = {
          projectPath: '/test/project',
          fileType: 'state',
          filePath: '/test/project/.planning/STATE.json',
          data: {
            currentPosition: {
              phase: 1,
              status: 'executing',
            },
            nextSteps: ['Complete T001', 'Start T002'],
          },
        };

        const result = await schemaLayer(context);

        expect(result.layer).toBe('schema');
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
        expect(result.metadata?.exitCode).toBe(ExitCode.SUCCESS);
        expect(result.metadata?.durationMs).toBeGreaterThanOrEqual(0);
      });

      it('should return failure for invalid state data', async () => {
        const context: ValidationContext = {
          projectPath: '/test/project',
          fileType: 'state',
          filePath: '/test/project/.planning/STATE.json',
          data: {
            // missing required fields
          },
        };

        const result = await schemaLayer(context);

        expect(result.layer).toBe('schema');
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.metadata?.exitCode).toBe(ExitCode.VALIDATION_SCHEMA);
      });

      it('should transform error codes correctly', async () => {
        const context: ValidationContext = {
          projectPath: '/test/project',
          fileType: 'state',
          filePath: '/test/project/.planning/STATE.json',
          data: {
            currentPosition: {
              phase: 1,
              status: 'invalid_status', // enum violation
            },
            nextSteps: [],
          },
        };

        const result = await schemaLayer(context);

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'SCHEMA_INVALID_ENUM')).toBe(true);
      });

      it('should include path in error', async () => {
        const context: ValidationContext = {
          projectPath: '/test/project',
          fileType: 'state',
          filePath: '/test/project/.planning/STATE.json',
          data: {
            currentPosition: {
              phase: 1,
              status: 'invalid_status',
            },
            nextSteps: [],
          },
        };

        const result = await schemaLayer(context);

        expect(result.errors.some((e) => e.path?.includes('status'))).toBe(true);
      });
    });

    describe('plan validation', () => {
      it('should return success for valid plan data', async () => {
        const context: ValidationContext = {
          projectPath: '/test/project',
          fileType: 'plan',
          filePath: '/test/project/.planning/plans/01-test.plan.md',
          data: {
            phase: '01-test-stabilization',
            plan: 1,
            wave: 1,
            autonomous: true,
          },
        };

        const result = await schemaLayer(context);

        expect(result.layer).toBe('schema');
        expect(result.valid).toBe(true);
        expect(result.metadata?.exitCode).toBe(ExitCode.SUCCESS);
      });

      it('should return failure for invalid plan data', async () => {
        const context: ValidationContext = {
          projectPath: '/test/project',
          fileType: 'plan',
          filePath: '/test/project/.planning/plans/01-test.plan.md',
          data: {
            phase: '01-test',
            // missing required plan and wave
          },
        };

        const result = await schemaLayer(context);

        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.metadata?.exitCode).toBe(ExitCode.VALIDATION_SCHEMA);
      });
    });

    describe('task-registry validation', () => {
      it('should return success for valid task registry', async () => {
        const context: ValidationContext = {
          projectPath: '/test/project',
          fileType: 'task-registry',
          filePath: '/test/project/.planning/TASKS.json',
          data: {
            version: '1.0.0',
            project: 'test-project',
            lastTaskId: 2,
            tasks: [
              {
                id: 'T001',
                title: 'First task',
                phase: 1,
                status: 'completed',
                assignee: 'backend-architect',
                dependencies: [],
                created: '2026-01-23T10:00:00Z',
                completed: '2026-01-23T12:00:00Z',
              },
              {
                id: 'T002',
                title: 'Second task',
                phase: 1,
                status: 'in_progress',
                assignee: 'backend-architect',
                dependencies: ['T001'],
                created: '2026-01-23T13:00:00Z',
              },
            ],
          },
        };

        const result = await schemaLayer(context);

        expect(result.layer).toBe('schema');
        expect(result.valid).toBe(true);
        expect(result.metadata?.exitCode).toBe(ExitCode.SUCCESS);
      });

      it('should return failure for invalid task ID format', async () => {
        const context: ValidationContext = {
          projectPath: '/test/project',
          fileType: 'task-registry',
          filePath: '/test/project/.planning/TASKS.json',
          data: {
            version: '1.0.0',
            project: 'test',
            lastTaskId: 1,
            tasks: [
              {
                id: 'INVALID-001', // Wrong format
                title: 'Test task',
                phase: 1,
                status: 'pending',
                assignee: 'backend-architect',
                dependencies: [],
                created: '2026-01-23T10:00:00Z',
              },
            ],
          },
        };

        const result = await schemaLayer(context);

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'SCHEMA_INVALID_PATTERN')).toBe(true);
      });
    });

    describe('previousResults', () => {
      it('should accept context with previous results', async () => {
        const context: ValidationContext = {
          projectPath: '/test/project',
          fileType: 'state',
          filePath: '/test/project/.planning/STATE.json',
          data: {
            currentPosition: { phase: 1, status: 'executing' },
            nextSteps: ['Test'],
          },
          previousResults: [],
        };

        const result = await schemaLayer(context);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('validateDataPresence', () => {
    it('should return undefined for valid data', () => {
      expect(validateDataPresence({})).toBeUndefined();
      expect(validateDataPresence([])).toBeUndefined();
      expect(validateDataPresence('string')).toBeUndefined();
      expect(validateDataPresence(123)).toBeUndefined();
    });

    it('should return error for null data', () => {
      const error = validateDataPresence(null);
      expect(error).toBeDefined();
      expect(error?.code).toBe('SCHEMA_NULL_DATA');
    });

    it('should return error for undefined data', () => {
      const error = validateDataPresence(undefined);
      expect(error).toBeDefined();
      expect(error?.code).toBe('SCHEMA_UNDEFINED_DATA');
    });
  });

  describe('createFileReadErrorResult', () => {
    it('should create a failed result with file read error', () => {
      const result = createFileReadErrorResult('/path/to/file.json', 'ENOENT: no such file');

      expect(result.layer).toBe('schema');
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('SCHEMA_FILE_READ_ERROR');
      expect(result.errors[0].message).toContain('Failed to read file');
      expect(result.errors[0].details).toEqual({ filePath: '/path/to/file.json' });
      expect(result.metadata?.exitCode).toBe(ExitCode.VALIDATION_SCHEMA);
    });
  });

  describe('createParseErrorResult', () => {
    it('should create a failed result with parse error', () => {
      const result = createParseErrorResult('/path/to/file.json', 'Unexpected token');

      expect(result.layer).toBe('schema');
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('SCHEMA_PARSE_ERROR');
      expect(result.errors[0].message).toContain('JSON parse error');
      expect(result.metadata?.exitCode).toBe(ExitCode.VALIDATION_SCHEMA);
    });
  });
});
