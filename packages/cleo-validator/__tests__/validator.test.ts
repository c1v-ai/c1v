/**
 * Tests for the CLEO Schema Validator
 */

import { describe, it, expect, beforeAll } from 'vitest';
import {
  loadSchemas,
  getSchema,
  validate,
  validateState,
  validatePlan,
  validateTaskRegistry,
  validateWithExitCode,
  ExitCode,
} from '../src';

describe('CLEO Schema Validator', () => {
  beforeAll(async () => {
    await loadSchemas();
  });

  describe('loadSchemas', () => {
    it('should load all schemas without error', async () => {
      // Already loaded in beforeAll, just verify no error
      await expect(loadSchemas()).resolves.not.toThrow();
    });
  });

  describe('getSchema', () => {
    it('should return state schema', () => {
      const schema = getSchema('state');
      expect(schema).toBeDefined();
      expect((schema as { $id?: string }).$id).toBe('https://c1v.dev/schemas/state.schema.json');
    });

    it('should return plan schema', () => {
      const schema = getSchema('plan');
      expect(schema).toBeDefined();
      expect((schema as { $id?: string }).$id).toBe('https://c1v.dev/schemas/plan.schema.json');
    });

    it('should return task-registry schema', () => {
      const schema = getSchema('task-registry');
      expect(schema).toBeDefined();
      expect((schema as { $id?: string }).$id).toBe('https://c1v.dev/schemas/task-registry.schema.json');
    });
  });

  describe('validateState', () => {
    it('should validate a valid state object', async () => {
      const validState = {
        currentPosition: {
          phase: 1,
          status: 'executing',
        },
        nextSteps: ['Complete T001', 'Start T002'],
      };

      const result = await validateState(validState);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should reject state without required fields', async () => {
      const invalidState = {
        // missing currentPosition and nextSteps
      };

      const result = await validateState(invalidState);
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });

    it('should reject state with invalid status', async () => {
      const invalidState = {
        currentPosition: {
          phase: 1,
          status: 'invalid_status', // not in enum
        },
        nextSteps: [],
      };

      const result = await validateState(invalidState);
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.some((e) => e.keyword === 'enum')).toBe(true);
    });

    it('should validate state with active task', async () => {
      const validState = {
        currentPosition: {
          phase: 1,
          status: 'executing',
        },
        activeTask: {
          id: 'T001',
          description: 'Implement validation library',
          assignedTo: 'backend-architect',
        },
        nextSteps: ['Complete implementation'],
      };

      const result = await validateState(validState);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid task ID format', async () => {
      const invalidState = {
        currentPosition: {
          phase: 1,
          status: 'executing',
        },
        activeTask: {
          id: 'TASK-1', // Invalid format, should be T###
          description: 'Test',
        },
        nextSteps: [],
      };

      const result = await validateState(invalidState);
      expect(result.valid).toBe(false);
      expect(result.errors!.some((e) => e.keyword === 'pattern')).toBe(true);
    });
  });

  describe('validatePlan', () => {
    it('should validate a valid plan object', async () => {
      const validPlan = {
        phase: '01-test-stabilization',
        plan: 1,
        wave: 1,
        autonomous: true,
      };

      const result = await validatePlan(validPlan);
      expect(result.valid).toBe(true);
    });

    it('should reject plan without required fields', async () => {
      const invalidPlan = {
        phase: '01-test-stabilization',
        // missing plan and wave
      };

      const result = await validatePlan(invalidPlan);
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should validate plan with must_haves', async () => {
      const validPlan = {
        phase: '02-critical-security-fixes',
        plan: 1,
        wave: 1,
        agent: 'devops-engineer',
        must_haves: {
          truths: ['All tests pass'],
          artifacts: [
            {
              path: 'lib/config/env.ts',
              provides: 'Environment validation schema',
            },
          ],
        },
      };

      const result = await validatePlan(validPlan);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid agent type', async () => {
      const invalidPlan = {
        phase: '01-test',
        plan: 1,
        wave: 1,
        agent: 'invalid-agent-type',
      };

      const result = await validatePlan(invalidPlan);
      expect(result.valid).toBe(false);
      expect(result.errors!.some((e) => e.keyword === 'enum')).toBe(true);
    });
  });

  describe('validateTaskRegistry', () => {
    it('should validate a valid task registry', async () => {
      const validRegistry = {
        version: '1.0.0',
        project: 'cleo-validator',
        lastTaskId: 3,
        tasks: [
          {
            id: 'T001',
            title: 'Create state schema',
            phase: 1,
            status: 'completed',
            assignee: 'backend-architect',
            dependencies: [],
            created: '2026-01-23T10:00:00Z',
            completed: '2026-01-23T12:00:00Z',
          },
          {
            id: 'T002',
            title: 'Create plan schema',
            phase: 1,
            status: 'completed',
            assignee: 'backend-architect',
            dependencies: ['T001'],
            created: '2026-01-23T10:00:00Z',
            completed: '2026-01-23T14:00:00Z',
          },
          {
            id: 'T003',
            title: 'Create task registry schema',
            phase: 1,
            status: 'in_progress',
            assignee: 'backend-architect',
            dependencies: ['T001', 'T002'],
            created: '2026-01-23T15:00:00Z',
          },
        ],
      };

      const result = await validateTaskRegistry(validRegistry);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid task ID format', async () => {
      const invalidRegistry = {
        version: '1.0.0',
        project: 'test',
        lastTaskId: 1,
        tasks: [
          {
            id: 'TASK-001', // Invalid format
            title: 'Test task',
            phase: 1,
            status: 'pending',
            assignee: 'backend-architect',
            dependencies: [],
            created: '2026-01-23T10:00:00Z',
          },
        ],
      };

      const result = await validateTaskRegistry(invalidRegistry);
      expect(result.valid).toBe(false);
      expect(result.errors!.some((e) => e.keyword === 'pattern')).toBe(true);
    });

    it('should require completed field for completed tasks', async () => {
      const invalidRegistry = {
        version: '1.0.0',
        project: 'test',
        lastTaskId: 1,
        tasks: [
          {
            id: 'T001',
            title: 'Test task',
            phase: 1,
            status: 'completed', // completed but missing 'completed' timestamp
            assignee: 'backend-architect',
            dependencies: [],
            created: '2026-01-23T10:00:00Z',
          },
        ],
      };

      const result = await validateTaskRegistry(invalidRegistry);
      expect(result.valid).toBe(false);
    });

    it('should require blockedBy for blocked tasks', async () => {
      const invalidRegistry = {
        version: '1.0.0',
        project: 'test',
        lastTaskId: 1,
        tasks: [
          {
            id: 'T001',
            title: 'Test task',
            phase: 1,
            status: 'blocked', // blocked but missing 'blockedBy'
            assignee: 'backend-architect',
            dependencies: [],
            created: '2026-01-23T10:00:00Z',
          },
        ],
      };

      const result = await validateTaskRegistry(invalidRegistry);
      expect(result.valid).toBe(false);
    });
  });

  describe('validate (generic)', () => {
    it('should validate against any supported schema', async () => {
      const result = await validate('state', {
        currentPosition: { phase: 1, status: 'planning' },
        nextSteps: [],
      });
      expect(result.valid).toBe(true);
    });
  });

  describe('validateWithExitCode', () => {
    it('should return SUCCESS for valid data', async () => {
      const result = await validateWithExitCode('state', {
        currentPosition: { phase: 1, status: 'executing' },
        nextSteps: ['Next step'],
      });

      expect(result.code).toBe(ExitCode.SUCCESS);
      expect(result.message).toContain('passed');
    });

    it('should return VALIDATION_SCHEMA for invalid data', async () => {
      const result = await validateWithExitCode('state', {});

      expect(result.code).toBe(ExitCode.VALIDATION_SCHEMA);
      expect(result.message).toContain('failed');
      expect(result.details).toBeDefined();
    });
  });
});
