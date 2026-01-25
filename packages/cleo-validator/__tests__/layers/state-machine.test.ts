/**
 * Tests for the State Machine Validation Layer
 */

import { describe, it, expect, beforeAll } from 'vitest';
import {
  loadSchemas,
  stateMachineLayer,
  isValidTransition,
  isTerminalState,
  getNextStates,
  validateTaskTransition,
  validatePhaseTransition,
  TASK_TRANSITIONS,
  PHASE_TRANSITIONS,
  PLAN_TRANSITIONS,
  ExitCode,
  type ValidationContext,
  type LayerResult,
} from '../../src';

describe('State Machine Validation Layer', () => {
  beforeAll(async () => {
    await loadSchemas();
  });

  describe('stateMachineLayer', () => {
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
            nextSteps: ['Complete T001'],
          },
        };

        const result = await stateMachineLayer(context);

        expect(result.layer).toBe('state-machine');
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.metadata?.exitCode).toBe(ExitCode.SUCCESS);
        expect(result.metadata?.durationMs).toBeGreaterThanOrEqual(0);
      });

      it('should fail for unknown phase status', async () => {
        const context: ValidationContext = {
          projectPath: '/test/project',
          fileType: 'state',
          filePath: '/test/project/.planning/STATE.json',
          data: {
            currentPosition: {
              phase: 1,
              status: 'invalid_status',
            },
          },
        };

        const result = await stateMachineLayer(context);

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'STATE_MACHINE_UNKNOWN_PHASE_STATUS')).toBe(true);
        expect(result.metadata?.exitCode).toBe(ExitCode.VALIDATION_STATE_MACHINE);
      });

      it('should warn when in terminal state', async () => {
        const context: ValidationContext = {
          projectPath: '/test/project',
          fileType: 'state',
          filePath: '/test/project/.planning/STATE.json',
          data: {
            currentPosition: {
              phase: 1,
              status: 'complete',
            },
          },
        };

        const result = await stateMachineLayer(context);

        expect(result.valid).toBe(true);
        expect(result.warnings.some((w) => w.code === 'STATE_MACHINE_WARN_TERMINAL_STATE')).toBe(true);
      });

      it('should fail for invalid phase transition when previousStatus is set', async () => {
        const context: ValidationContext = {
          projectPath: '/test/project',
          fileType: 'state',
          filePath: '/test/project/.planning/STATE.json',
          data: {
            currentPosition: {
              phase: 1,
              status: 'complete', // Invalid: can't go from planning to complete directly
            },
            previousStatus: 'planning',
          },
        };

        const result = await stateMachineLayer(context);

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'STATE_MACHINE_INVALID_PHASE_TRANSITION')).toBe(true);
      });

      it('should allow valid phase transition', async () => {
        const context: ValidationContext = {
          projectPath: '/test/project',
          fileType: 'state',
          filePath: '/test/project/.planning/STATE.json',
          data: {
            currentPosition: {
              phase: 1,
              status: 'executing',
            },
            previousStatus: 'planning',
          },
        };

        const result = await stateMachineLayer(context);

        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should handle state without currentPosition', async () => {
        const context: ValidationContext = {
          projectPath: '/test/project',
          fileType: 'state',
          filePath: '/test/project/.planning/STATE.json',
          data: {
            nextSteps: ['Start project'],
          },
        };

        const result = await stateMachineLayer(context);

        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
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

        const result = await stateMachineLayer(context);

        expect(result.layer).toBe('state-machine');
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.metadata?.exitCode).toBe(ExitCode.SUCCESS);
      });

      it('should fail for unknown task status', async () => {
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
                id: 'T001',
                title: 'Test',
                phase: 1,
                status: 'unknown_status',
                assignee: 'test',
                dependencies: [],
                created: '2026-01-23T10:00:00Z',
              },
            ],
          },
        };

        const result = await stateMachineLayer(context);

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'STATE_MACHINE_UNKNOWN_TASK_STATUS')).toBe(true);
      });

      it('should fail for completed task with uncompleted dependencies', async () => {
        const context: ValidationContext = {
          projectPath: '/test/project',
          fileType: 'task-registry',
          filePath: '/test/project/.planning/TASKS.json',
          data: {
            version: '1.0.0',
            project: 'test',
            lastTaskId: 2,
            tasks: [
              {
                id: 'T001',
                title: 'Dependency task',
                phase: 1,
                status: 'pending', // Not completed
                assignee: 'test',
                dependencies: [],
                created: '2026-01-23T10:00:00Z',
              },
              {
                id: 'T002',
                title: 'Dependent task',
                phase: 1,
                status: 'completed', // But depends on uncompleted T001
                assignee: 'test',
                dependencies: ['T001'],
                created: '2026-01-23T11:00:00Z',
                completed: '2026-01-23T12:00:00Z',
              },
            ],
          },
        };

        const result = await stateMachineLayer(context);

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'STATE_MACHINE_COMPLETED_WITH_PENDING_DEPS')).toBe(true);
      });

      it('should warn for in_progress task with uncompleted dependencies', async () => {
        const context: ValidationContext = {
          projectPath: '/test/project',
          fileType: 'task-registry',
          filePath: '/test/project/.planning/TASKS.json',
          data: {
            version: '1.0.0',
            project: 'test',
            lastTaskId: 2,
            tasks: [
              {
                id: 'T001',
                title: 'Dependency task',
                phase: 1,
                status: 'pending',
                assignee: 'test',
                dependencies: [],
                created: '2026-01-23T10:00:00Z',
              },
              {
                id: 'T002',
                title: 'Dependent task',
                phase: 1,
                status: 'in_progress', // Working on it despite pending dependency
                assignee: 'test',
                dependencies: ['T001'],
                created: '2026-01-23T11:00:00Z',
              },
            ],
          },
        };

        const result = await stateMachineLayer(context);

        expect(result.valid).toBe(true); // Warnings don't fail validation
        expect(result.warnings.some((w) => w.code === 'STATE_MACHINE_WARN_SHOULD_BE_BLOCKED')).toBe(true);
      });

      it('should warn for blocked task without blockedBy reason', async () => {
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
                id: 'T001',
                title: 'Test',
                phase: 1,
                status: 'blocked',
                assignee: 'test',
                dependencies: [],
                created: '2026-01-23T10:00:00Z',
                // No blockedBy field
              },
            ],
          },
        };

        const result = await stateMachineLayer(context);

        expect(result.valid).toBe(true);
        expect(result.warnings.some((w) => w.code === 'STATE_MACHINE_WARN_BLOCKED_NO_REASON')).toBe(true);
      });

      it('should detect invalid task transition with previousResults', async () => {
        // First validation run - task is pending
        const previousResult: LayerResult = {
          layer: 'state-machine',
          valid: true,
          errors: [],
          warnings: [],
          metadata: {
            previousState: {
              taskStatuses: new Map([['T001', 'pending']]),
            },
          },
        };

        // Second validation run - task jumped to completed (invalid)
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
                id: 'T001',
                title: 'Test',
                phase: 1,
                status: 'completed', // Invalid: skipped in_progress
                assignee: 'test',
                dependencies: [],
                created: '2026-01-23T10:00:00Z',
                completed: '2026-01-23T12:00:00Z',
              },
            ],
          },
          previousResults: [previousResult],
        };

        const result = await stateMachineLayer(context);

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'STATE_MACHINE_INVALID_TASK_TRANSITION')).toBe(true);
      });

      it('should fail for terminal state modification with previousResults', async () => {
        // First validation run - task is completed (terminal)
        const previousResult: LayerResult = {
          layer: 'state-machine',
          valid: true,
          errors: [],
          warnings: [],
          metadata: {
            previousState: {
              taskStatuses: new Map([['T001', 'completed']]),
            },
          },
        };

        // Second validation run - attempting to modify completed task
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
                id: 'T001',
                title: 'Test',
                phase: 1,
                status: 'in_progress', // Invalid: completed is terminal
                assignee: 'test',
                dependencies: [],
                created: '2026-01-23T10:00:00Z',
              },
            ],
          },
          previousResults: [previousResult],
        };

        const result = await stateMachineLayer(context);

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'STATE_MACHINE_TERMINAL_STATE_MODIFIED')).toBe(true);
      });

      it('should handle empty task list', async () => {
        const context: ValidationContext = {
          projectPath: '/test/project',
          fileType: 'task-registry',
          filePath: '/test/project/.planning/TASKS.json',
          data: {
            version: '1.0.0',
            project: 'test',
            lastTaskId: 0,
            tasks: [],
          },
        };

        const result = await stateMachineLayer(context);

        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    describe('plan validation', () => {
      it('should return success for plan (no state machine validation needed)', async () => {
        const context: ValidationContext = {
          projectPath: '/test/project',
          fileType: 'plan',
          filePath: '/test/project/.planning/plans/01-test.plan.md',
          data: {
            phase: '01-test',
            plan: 1,
            wave: 1,
          },
        };

        const result = await stateMachineLayer(context);

        expect(result.layer).toBe('state-machine');
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    describe('error handling', () => {
      it('should handle null data gracefully', async () => {
        const context: ValidationContext = {
          projectPath: '/test/project',
          fileType: 'state',
          filePath: '/test/project/.planning/STATE.json',
          data: null,
        };

        const result = await stateMachineLayer(context);

        expect(result.valid).toBe(true);
      });

      it('should handle non-object data gracefully', async () => {
        const context: ValidationContext = {
          projectPath: '/test/project',
          fileType: 'task-registry',
          filePath: '/test/project/.planning/TASKS.json',
          data: 'not an object',
        };

        const result = await stateMachineLayer(context);

        expect(result.valid).toBe(true);
      });
    });
  });

  describe('isValidTransition', () => {
    it('should return true for valid task transitions', () => {
      expect(isValidTransition(TASK_TRANSITIONS, 'pending', 'in_progress')).toBe(true);
      expect(isValidTransition(TASK_TRANSITIONS, 'pending', 'blocked')).toBe(true);
      expect(isValidTransition(TASK_TRANSITIONS, 'in_progress', 'completed')).toBe(true);
      expect(isValidTransition(TASK_TRANSITIONS, 'in_progress', 'blocked')).toBe(true);
      expect(isValidTransition(TASK_TRANSITIONS, 'blocked', 'pending')).toBe(true);
      expect(isValidTransition(TASK_TRANSITIONS, 'blocked', 'in_progress')).toBe(true);
    });

    it('should return true for no-op transitions (same status)', () => {
      expect(isValidTransition(TASK_TRANSITIONS, 'pending', 'pending')).toBe(true);
      expect(isValidTransition(TASK_TRANSITIONS, 'completed', 'completed')).toBe(true);
    });

    it('should return false for invalid task transitions', () => {
      expect(isValidTransition(TASK_TRANSITIONS, 'pending', 'completed')).toBe(false);
      expect(isValidTransition(TASK_TRANSITIONS, 'completed', 'pending')).toBe(false);
      expect(isValidTransition(TASK_TRANSITIONS, 'completed', 'in_progress')).toBe(false);
      expect(isValidTransition(TASK_TRANSITIONS, 'blocked', 'completed')).toBe(false);
    });

    it('should return true for valid phase transitions', () => {
      expect(isValidTransition(PHASE_TRANSITIONS, 'planning', 'executing')).toBe(true);
      expect(isValidTransition(PHASE_TRANSITIONS, 'executing', 'verifying')).toBe(true);
      expect(isValidTransition(PHASE_TRANSITIONS, 'verifying', 'complete')).toBe(true);
      expect(isValidTransition(PHASE_TRANSITIONS, 'verifying', 'executing')).toBe(true);
    });

    it('should return false for invalid phase transitions', () => {
      expect(isValidTransition(PHASE_TRANSITIONS, 'planning', 'complete')).toBe(false);
      expect(isValidTransition(PHASE_TRANSITIONS, 'complete', 'planning')).toBe(false);
      expect(isValidTransition(PHASE_TRANSITIONS, 'executing', 'planning')).toBe(false);
    });

    it('should return false for unknown status', () => {
      expect(isValidTransition(TASK_TRANSITIONS, 'unknown', 'pending')).toBe(false);
    });
  });

  describe('isTerminalState', () => {
    it('should identify terminal task states', () => {
      expect(isTerminalState(TASK_TRANSITIONS, 'completed')).toBe(true);
      expect(isTerminalState(TASK_TRANSITIONS, 'pending')).toBe(false);
      expect(isTerminalState(TASK_TRANSITIONS, 'in_progress')).toBe(false);
      expect(isTerminalState(TASK_TRANSITIONS, 'blocked')).toBe(false);
    });

    it('should identify terminal phase states', () => {
      expect(isTerminalState(PHASE_TRANSITIONS, 'complete')).toBe(true);
      expect(isTerminalState(PHASE_TRANSITIONS, 'planning')).toBe(false);
      expect(isTerminalState(PHASE_TRANSITIONS, 'executing')).toBe(false);
      expect(isTerminalState(PHASE_TRANSITIONS, 'verifying')).toBe(false);
    });

    it('should return false for unknown status', () => {
      expect(isTerminalState(TASK_TRANSITIONS, 'unknown')).toBe(false);
    });
  });

  describe('getNextStates', () => {
    it('should return valid next states for tasks', () => {
      expect(getNextStates(TASK_TRANSITIONS, 'pending')).toEqual(['in_progress', 'blocked']);
      expect(getNextStates(TASK_TRANSITIONS, 'in_progress')).toEqual(['completed', 'blocked']);
      expect(getNextStates(TASK_TRANSITIONS, 'blocked')).toEqual(['pending', 'in_progress']);
      expect(getNextStates(TASK_TRANSITIONS, 'completed')).toEqual([]);
    });

    it('should return valid next states for phases', () => {
      expect(getNextStates(PHASE_TRANSITIONS, 'planning')).toEqual(['executing']);
      expect(getNextStates(PHASE_TRANSITIONS, 'executing')).toEqual(['verifying']);
      expect(getNextStates(PHASE_TRANSITIONS, 'verifying')).toEqual(['complete', 'executing']);
      expect(getNextStates(PHASE_TRANSITIONS, 'complete')).toEqual([]);
    });

    it('should return empty array for unknown status', () => {
      expect(getNextStates(TASK_TRANSITIONS, 'unknown')).toEqual([]);
    });
  });

  describe('validateTaskTransition', () => {
    it('should return undefined for valid transitions', () => {
      expect(validateTaskTransition('pending', 'in_progress')).toBeUndefined();
      expect(validateTaskTransition('in_progress', 'completed')).toBeUndefined();
      expect(validateTaskTransition('blocked', 'in_progress')).toBeUndefined();
    });

    it('should return undefined for no-op transitions', () => {
      expect(validateTaskTransition('pending', 'pending')).toBeUndefined();
      expect(validateTaskTransition('completed', 'completed')).toBeUndefined();
    });

    it('should return error for unknown status', () => {
      const error = validateTaskTransition('unknown', 'pending');
      expect(error).toBeDefined();
      expect(error?.code).toBe('STATE_MACHINE_UNKNOWN_STATUS');
    });

    it('should return error for terminal state modification', () => {
      const error = validateTaskTransition('completed', 'pending');
      expect(error).toBeDefined();
      expect(error?.code).toBe('STATE_MACHINE_TERMINAL_STATE_MODIFIED');
    });

    it('should return error for invalid transition', () => {
      const error = validateTaskTransition('pending', 'completed');
      expect(error).toBeDefined();
      expect(error?.code).toBe('STATE_MACHINE_INVALID_TRANSITION');
    });
  });

  describe('validatePhaseTransition', () => {
    it('should return undefined for valid transitions', () => {
      expect(validatePhaseTransition('planning', 'executing')).toBeUndefined();
      expect(validatePhaseTransition('executing', 'verifying')).toBeUndefined();
      expect(validatePhaseTransition('verifying', 'complete')).toBeUndefined();
    });

    it('should return undefined for no-op transitions', () => {
      expect(validatePhaseTransition('planning', 'planning')).toBeUndefined();
      expect(validatePhaseTransition('complete', 'complete')).toBeUndefined();
    });

    it('should return error for unknown status', () => {
      const error = validatePhaseTransition('unknown', 'executing');
      expect(error).toBeDefined();
      expect(error?.code).toBe('STATE_MACHINE_UNKNOWN_PHASE_STATUS');
    });

    it('should return error for terminal state modification', () => {
      const error = validatePhaseTransition('complete', 'planning');
      expect(error).toBeDefined();
      expect(error?.code).toBe('STATE_MACHINE_TERMINAL_STATE_MODIFIED');
    });

    it('should return error for invalid transition', () => {
      const error = validatePhaseTransition('planning', 'complete');
      expect(error).toBeDefined();
      expect(error?.code).toBe('STATE_MACHINE_INVALID_PHASE_TRANSITION');
    });
  });

  describe('exported constants', () => {
    it('should export task transitions', () => {
      expect(TASK_TRANSITIONS).toHaveProperty('pending');
      expect(TASK_TRANSITIONS).toHaveProperty('in_progress');
      expect(TASK_TRANSITIONS).toHaveProperty('blocked');
      expect(TASK_TRANSITIONS).toHaveProperty('completed');
    });

    it('should export phase transitions', () => {
      expect(PHASE_TRANSITIONS).toHaveProperty('planning');
      expect(PHASE_TRANSITIONS).toHaveProperty('executing');
      expect(PHASE_TRANSITIONS).toHaveProperty('verifying');
      expect(PHASE_TRANSITIONS).toHaveProperty('complete');
    });

    it('should export plan transitions', () => {
      expect(PLAN_TRANSITIONS).toHaveProperty('pending');
      expect(PLAN_TRANSITIONS).toHaveProperty('in_progress');
      expect(PLAN_TRANSITIONS).toHaveProperty('blocked');
      expect(PLAN_TRANSITIONS).toHaveProperty('completed');
    });
  });
});
