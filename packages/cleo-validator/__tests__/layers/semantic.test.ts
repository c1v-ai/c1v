/**
 * Tests for the Semantic Validation Layer
 */

import { describe, it, expect, beforeAll } from 'vitest';
import {
  loadSchemas,
  semanticLayer,
  validateStatusTransition,
  getValidTransitions,
  VALID_TASK_STATUSES,
  VALID_STATE_STATUSES,
  VALID_PRIORITIES,
  VALID_STATUS_TRANSITIONS,
  ExitCode,
  type ValidationContext,
} from '../../src';

describe('Semantic Validation Layer', () => {
  beforeAll(async () => {
    await loadSchemas();
  });

  describe('semanticLayer', () => {
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
            decisions: [
              { date: '2026-01-20', decision: 'Use TypeScript', rationale: 'Type safety' },
              { date: '2026-01-21', decision: 'Use Vitest', rationale: 'Fast tests' },
            ],
          },
        };

        const result = await semanticLayer(context);

        expect(result.layer).toBe('semantic');
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.metadata?.exitCode).toBe(ExitCode.SUCCESS);
        expect(result.metadata?.durationMs).toBeGreaterThanOrEqual(0);
      });

      it('should fail for negative phase number', async () => {
        const context: ValidationContext = {
          projectPath: '/test/project',
          fileType: 'state',
          filePath: '/test/project/.planning/STATE.json',
          data: {
            currentPosition: {
              phase: -1,
              status: 'executing',
            },
            nextSteps: [],
          },
        };

        const result = await semanticLayer(context);

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'SEMANTIC_NEGATIVE_PHASE')).toBe(true);
        expect(result.metadata?.exitCode).toBe(ExitCode.VALIDATION_SEMANTIC);
      });

      it('should fail for non-integer phase', async () => {
        const context: ValidationContext = {
          projectPath: '/test/project',
          fileType: 'state',
          filePath: '/test/project/.planning/STATE.json',
          data: {
            currentPosition: {
              phase: 1.5,
              status: 'executing',
            },
            nextSteps: [],
          },
        };

        const result = await semanticLayer(context);

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'SEMANTIC_INVALID_PHASE')).toBe(true);
      });

      it('should fail for invalid decision date format', async () => {
        const context: ValidationContext = {
          projectPath: '/test/project',
          fileType: 'state',
          filePath: '/test/project/.planning/STATE.json',
          data: {
            currentPosition: { phase: 1, status: 'executing' },
            nextSteps: [],
            decisions: [
              { date: 'Jan 20, 2026', decision: 'Test', rationale: 'Reason' },
            ],
          },
        };

        const result = await semanticLayer(context);

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'SEMANTIC_INVALID_DATE_FORMAT')).toBe(true);
      });

      it('should warn for non-chronological decisions', async () => {
        const context: ValidationContext = {
          projectPath: '/test/project',
          fileType: 'state',
          filePath: '/test/project/.planning/STATE.json',
          data: {
            currentPosition: { phase: 1, status: 'executing' },
            nextSteps: [],
            decisions: [
              { date: '2026-01-25', decision: 'Later', rationale: 'Reason' },
              { date: '2026-01-20', decision: 'Earlier', rationale: 'Reason' },
            ],
          },
        };

        const result = await semanticLayer(context);

        expect(result.valid).toBe(true); // Warnings don't fail validation
        expect(result.warnings.some((w) => w.code === 'SEMANTIC_WARN_DECISIONS_NOT_CHRONOLOGICAL')).toBe(true);
      });

      it('should warn for non-chronological session log', async () => {
        const context: ValidationContext = {
          projectPath: '/test/project',
          fileType: 'state',
          filePath: '/test/project/.planning/STATE.json',
          data: {
            currentPosition: { phase: 1, status: 'executing' },
            nextSteps: [],
            sessionLog: [
              { timestamp: '2026-01-25T10:00:00Z', action: 'Later action' },
              { timestamp: '2026-01-20T10:00:00Z', action: 'Earlier action' },
            ],
          },
        };

        const result = await semanticLayer(context);

        expect(result.valid).toBe(true);
        expect(result.warnings.some((w) => w.code === 'SEMANTIC_WARN_SESSION_LOG_NOT_CHRONOLOGICAL')).toBe(true);
      });

      it('should warn when complete status has no session log', async () => {
        const context: ValidationContext = {
          projectPath: '/test/project',
          fileType: 'state',
          filePath: '/test/project/.planning/STATE.json',
          data: {
            currentPosition: { phase: 1, status: 'complete' },
            nextSteps: [],
          },
        };

        const result = await semanticLayer(context);

        expect(result.valid).toBe(true);
        expect(result.warnings.some((w) => w.code === 'SEMANTIC_WARN_COMPLETE_NO_SESSION_LOG')).toBe(true);
      });

      it('should allow phase 0 (planning)', async () => {
        const context: ValidationContext = {
          projectPath: '/test/project',
          fileType: 'state',
          filePath: '/test/project/.planning/STATE.json',
          data: {
            currentPosition: { phase: 0, status: 'planning' },
            nextSteps: [],
          },
        };

        const result = await semanticLayer(context);

        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
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
            priority: 'high',
            depends_on: ['01-01', '02-03'],
          },
        };

        const result = await semanticLayer(context);

        expect(result.layer).toBe('semantic');
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.metadata?.exitCode).toBe(ExitCode.SUCCESS);
      });

      it('should fail for non-integer wave', async () => {
        const context: ValidationContext = {
          projectPath: '/test/project',
          fileType: 'plan',
          filePath: '/test/project/.planning/plans/01-test.plan.md',
          data: {
            phase: '01-test',
            plan: 1,
            wave: 1.5,
          },
        };

        const result = await semanticLayer(context);

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'SEMANTIC_INVALID_WAVE')).toBe(true);
      });

      it('should fail for wave less than 1', async () => {
        const context: ValidationContext = {
          projectPath: '/test/project',
          fileType: 'plan',
          filePath: '/test/project/.planning/plans/01-test.plan.md',
          data: {
            phase: '01-test',
            plan: 1,
            wave: 0,
          },
        };

        const result = await semanticLayer(context);

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'SEMANTIC_INVALID_WAVE_VALUE')).toBe(true);
      });

      it('should fail for non-integer plan number', async () => {
        const context: ValidationContext = {
          projectPath: '/test/project',
          fileType: 'plan',
          filePath: '/test/project/.planning/plans/01-test.plan.md',
          data: {
            phase: '01-test',
            plan: 1.5,
            wave: 1,
          },
        };

        const result = await semanticLayer(context);

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'SEMANTIC_INVALID_PLAN_NUMBER')).toBe(true);
      });

      it('should fail for invalid priority value', async () => {
        const context: ValidationContext = {
          projectPath: '/test/project',
          fileType: 'plan',
          filePath: '/test/project/.planning/plans/01-test.plan.md',
          data: {
            phase: '01-test',
            plan: 1,
            wave: 1,
            priority: 'urgent', // not valid
          },
        };

        const result = await semanticLayer(context);

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'SEMANTIC_INVALID_PRIORITY')).toBe(true);
      });

      it('should fail for invalid dependency format', async () => {
        const context: ValidationContext = {
          projectPath: '/test/project',
          fileType: 'plan',
          filePath: '/test/project/.planning/plans/01-test.plan.md',
          data: {
            phase: '01-test',
            plan: 1,
            wave: 1,
            depends_on: ['01-01', 'invalid-format', '3-4'],
          },
        };

        const result = await semanticLayer(context);

        expect(result.valid).toBe(false);
        expect(result.errors.filter((e) => e.code === 'SEMANTIC_INVALID_DEPENDENCY_FORMAT')).toHaveLength(2);
      });

      it('should warn for non-autonomous plan', async () => {
        const context: ValidationContext = {
          projectPath: '/test/project',
          fileType: 'plan',
          filePath: '/test/project/.planning/plans/01-test.plan.md',
          data: {
            phase: '01-test',
            plan: 1,
            wave: 1,
            autonomous: false,
          },
        };

        const result = await semanticLayer(context);

        expect(result.valid).toBe(true);
        expect(result.warnings.some((w) => w.code === 'SEMANTIC_WARN_NON_AUTONOMOUS_PLAN')).toBe(true);
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
                leverage: 8,
              },
              {
                id: 'T002',
                title: 'Second task',
                phase: 1,
                status: 'in_progress',
                assignee: 'backend-architect',
                dependencies: ['T001'],
                created: '2026-01-23T13:00:00Z',
                leverage: 5,
              },
            ],
          },
        };

        const result = await semanticLayer(context);

        expect(result.layer).toBe('semantic');
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.metadata?.exitCode).toBe(ExitCode.SUCCESS);
      });

      it('should fail for leverage score out of range', async () => {
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
                status: 'pending',
                assignee: 'test',
                dependencies: [],
                created: '2026-01-23T10:00:00Z',
                leverage: 15, // out of range
              },
            ],
          },
        };

        const result = await semanticLayer(context);

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'SEMANTIC_INVALID_LEVERAGE')).toBe(true);
      });

      it('should fail for negative leverage score', async () => {
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
                status: 'pending',
                assignee: 'test',
                dependencies: [],
                created: '2026-01-23T10:00:00Z',
                leverage: -1,
              },
            ],
          },
        };

        const result = await semanticLayer(context);

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'SEMANTIC_INVALID_LEVERAGE')).toBe(true);
      });

      it('should fail for completed task without completed timestamp', async () => {
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
                status: 'completed', // completed but no timestamp
                assignee: 'test',
                dependencies: [],
                created: '2026-01-23T10:00:00Z',
              },
            ],
          },
        };

        const result = await semanticLayer(context);

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'SEMANTIC_MISSING_COMPLETED_DATE')).toBe(true);
      });

      it('should fail for blocked task without blockedBy reason', async () => {
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
                status: 'blocked', // blocked but no reason
                assignee: 'test',
                dependencies: [],
                created: '2026-01-23T10:00:00Z',
              },
            ],
          },
        };

        const result = await semanticLayer(context);

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'SEMANTIC_MISSING_BLOCKED_REASON')).toBe(true);
      });

      it('should fail when completed timestamp is before created timestamp', async () => {
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
                status: 'completed',
                assignee: 'test',
                dependencies: [],
                created: '2026-01-23T15:00:00Z',
                completed: '2026-01-23T10:00:00Z', // before created
              },
            ],
          },
        };

        const result = await semanticLayer(context);

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'SEMANTIC_INVALID_DATE_ORDER')).toBe(true);
      });

      it('should fail for non-integer task phase', async () => {
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
                phase: 1.5,
                status: 'pending',
                assignee: 'test',
                dependencies: [],
                created: '2026-01-23T10:00:00Z',
              },
            ],
          },
        };

        const result = await semanticLayer(context);

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'SEMANTIC_INVALID_TASK_PHASE')).toBe(true);
      });

      it('should fail for task phase less than 1', async () => {
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
                phase: 0,
                status: 'pending',
                assignee: 'test',
                dependencies: [],
                created: '2026-01-23T10:00:00Z',
              },
            ],
          },
        };

        const result = await semanticLayer(context);

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'SEMANTIC_NEGATIVE_TASK_PHASE')).toBe(true);
      });

      it('should fail for invalid created timestamp format', async () => {
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
                status: 'pending',
                assignee: 'test',
                dependencies: [],
                created: 'Jan 23, 2026', // invalid format
              },
            ],
          },
        };

        const result = await semanticLayer(context);

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'SEMANTIC_INVALID_CREATED_FORMAT')).toBe(true);
      });

      it('should warn for phase gaps', async () => {
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
                title: 'Test',
                phase: 1,
                status: 'pending',
                assignee: 'test',
                dependencies: [],
                created: '2026-01-23T10:00:00Z',
              },
              {
                id: 'T002',
                title: 'Test 2',
                phase: 3, // Gap - phase 2 is missing
                status: 'pending',
                assignee: 'test',
                dependencies: [],
                created: '2026-01-23T11:00:00Z',
              },
            ],
          },
        };

        const result = await semanticLayer(context);

        expect(result.valid).toBe(true);
        expect(result.warnings.some((w) => w.code === 'SEMANTIC_WARN_PHASE_GAP')).toBe(true);
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

        const result = await semanticLayer(context);

        // Should pass since null doesn't have any semantic issues to check
        expect(result.valid).toBe(true);
      });

      it('should handle non-object data gracefully', async () => {
        const context: ValidationContext = {
          projectPath: '/test/project',
          fileType: 'task-registry',
          filePath: '/test/project/.planning/TASKS.json',
          data: 'not an object',
        };

        const result = await semanticLayer(context);

        // Should pass since there's nothing to validate semantically
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('validateStatusTransition', () => {
    it('should allow valid transitions', () => {
      expect(validateStatusTransition('pending', 'in_progress')).toBeUndefined();
      expect(validateStatusTransition('pending', 'blocked')).toBeUndefined();
      expect(validateStatusTransition('in_progress', 'completed')).toBeUndefined();
      expect(validateStatusTransition('in_progress', 'blocked')).toBeUndefined();
      expect(validateStatusTransition('blocked', 'pending')).toBeUndefined();
      expect(validateStatusTransition('blocked', 'in_progress')).toBeUndefined();
    });

    it('should allow no-op transitions (same status)', () => {
      expect(validateStatusTransition('pending', 'pending')).toBeUndefined();
      expect(validateStatusTransition('completed', 'completed')).toBeUndefined();
    });

    it('should reject invalid transitions', () => {
      // Can't skip in_progress
      const skipProgress = validateStatusTransition('pending', 'completed');
      expect(skipProgress).toBeDefined();
      expect(skipProgress?.code).toBe('SEMANTIC_INVALID_STATUS_TRANSITION');

      // Can't go back from completed
      const fromCompleted = validateStatusTransition('completed', 'pending');
      expect(fromCompleted).toBeDefined();
      expect(fromCompleted?.code).toBe('SEMANTIC_INVALID_STATUS_TRANSITION');

      // Can't go directly to completed from blocked
      const blockedToComplete = validateStatusTransition('blocked', 'completed');
      expect(blockedToComplete).toBeDefined();
      expect(blockedToComplete?.code).toBe('SEMANTIC_INVALID_STATUS_TRANSITION');
    });

    it('should reject unknown current status', () => {
      const error = validateStatusTransition('unknown_status', 'pending');
      expect(error).toBeDefined();
      expect(error?.code).toBe('SEMANTIC_UNKNOWN_CURRENT_STATUS');
    });
  });

  describe('getValidTransitions', () => {
    it('should return valid transitions for each status', () => {
      expect(getValidTransitions('pending')).toEqual(['in_progress', 'blocked']);
      expect(getValidTransitions('in_progress')).toEqual(['completed', 'blocked']);
      expect(getValidTransitions('blocked')).toEqual(['pending', 'in_progress']);
      expect(getValidTransitions('completed')).toEqual([]);
    });

    it('should return empty array for unknown status', () => {
      expect(getValidTransitions('unknown')).toEqual([]);
    });
  });

  describe('exported constants', () => {
    it('should export valid task statuses', () => {
      expect(VALID_TASK_STATUSES).toContain('pending');
      expect(VALID_TASK_STATUSES).toContain('in_progress');
      expect(VALID_TASK_STATUSES).toContain('completed');
      expect(VALID_TASK_STATUSES).toContain('blocked');
    });

    it('should export valid state statuses', () => {
      expect(VALID_STATE_STATUSES).toContain('planning');
      expect(VALID_STATE_STATUSES).toContain('executing');
      expect(VALID_STATE_STATUSES).toContain('verifying');
      expect(VALID_STATE_STATUSES).toContain('complete');
    });

    it('should export valid priorities', () => {
      expect(VALID_PRIORITIES).toContain('critical');
      expect(VALID_PRIORITIES).toContain('high');
      expect(VALID_PRIORITIES).toContain('medium');
      expect(VALID_PRIORITIES).toContain('low');
    });

    it('should export status transitions map', () => {
      expect(VALID_STATUS_TRANSITIONS).toHaveProperty('pending');
      expect(VALID_STATUS_TRANSITIONS).toHaveProperty('in_progress');
      expect(VALID_STATUS_TRANSITIONS).toHaveProperty('blocked');
      expect(VALID_STATUS_TRANSITIONS).toHaveProperty('completed');
    });
  });
});
