/**
 * Tests for the Referential Integrity Validation Layer
 */

import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  loadSchemas,
  referentialLayer,
  detectCircularDependencies,
  buildDependencyGraph,
  validateDependenciesExist,
  validateNoSelfReferences,
  validateLastTaskId,
  validateOpenQuestionUniqueness,
  KNOWN_AGENTS,
  ExitCode,
  type ValidationContext,
} from '../../src';

describe('Referential Integrity Validation Layer', () => {
  let testDir: string;

  beforeAll(async () => {
    await loadSchemas();
  });

  beforeEach(async () => {
    // Create a temporary test directory
    testDir = await fs.mkdtemp(join(tmpdir(), 'cleo-ref-test-'));
    await fs.mkdir(join(testDir, '.planning'), { recursive: true });
    await fs.mkdir(join(testDir, '.planning', 'plans'), { recursive: true });
  });

  afterEach(async () => {
    // Cleanup test directory
    if (testDir) {
      await fs.rm(testDir, { recursive: true, force: true });
    }
  });

  describe('referentialLayer', () => {
    describe('task-registry validation', () => {
      it('should return success for valid task registry with dependencies', async () => {
        const context: ValidationContext = {
          projectPath: testDir,
          fileType: 'task-registry',
          filePath: join(testDir, '.planning', 'TASKS.json'),
          data: {
            version: '1.0.0',
            project: 'test-project',
            lastTaskId: 3,
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
                status: 'completed',
                assignee: 'backend-architect',
                dependencies: ['T001'],
                created: '2026-01-23T13:00:00Z',
                completed: '2026-01-23T14:00:00Z',
              },
              {
                id: 'T003',
                title: 'Third task',
                phase: 1,
                status: 'in_progress',
                assignee: 'backend-architect',
                dependencies: ['T001', 'T002'],
                created: '2026-01-23T15:00:00Z',
              },
            ],
          },
        };

        const result = await referentialLayer(context);

        expect(result.layer).toBe('referential');
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.metadata?.exitCode).toBe(ExitCode.SUCCESS);
        expect(result.metadata?.durationMs).toBeGreaterThanOrEqual(0);
      });

      it('should detect missing dependency', async () => {
        const context: ValidationContext = {
          projectPath: testDir,
          fileType: 'task-registry',
          filePath: join(testDir, '.planning', 'TASKS.json'),
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
                status: 'pending',
                assignee: 'backend-architect',
                dependencies: ['T001', 'T999'], // T999 doesn't exist
                created: '2026-01-23T13:00:00Z',
              },
            ],
          },
        };

        const result = await referentialLayer(context);

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'REFERENTIAL_MISSING_DEPENDENCY')).toBe(true);
        expect(result.errors[0].message).toContain('T999');
        expect(result.errors[0].message).toContain('does not exist');
        expect(result.metadata?.exitCode).toBe(ExitCode.VALIDATION_REFERENTIAL);
      });

      it('should detect circular dependency (simple A -> B -> A)', async () => {
        const context: ValidationContext = {
          projectPath: testDir,
          fileType: 'task-registry',
          filePath: join(testDir, '.planning', 'TASKS.json'),
          data: {
            version: '1.0.0',
            project: 'test-project',
            lastTaskId: 2,
            tasks: [
              {
                id: 'T001',
                title: 'First task',
                phase: 1,
                status: 'pending',
                assignee: 'backend-architect',
                dependencies: ['T002'],
                created: '2026-01-23T10:00:00Z',
              },
              {
                id: 'T002',
                title: 'Second task',
                phase: 1,
                status: 'pending',
                assignee: 'backend-architect',
                dependencies: ['T001'],
                created: '2026-01-23T13:00:00Z',
              },
            ],
          },
        };

        const result = await referentialLayer(context);

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'REFERENTIAL_CIRCULAR_DEPENDENCY')).toBe(true);
        expect(result.metadata?.exitCode).toBe(ExitCode.VALIDATION_REFERENTIAL);
      });

      it('should detect circular dependency (A -> B -> C -> A)', async () => {
        const context: ValidationContext = {
          projectPath: testDir,
          fileType: 'task-registry',
          filePath: join(testDir, '.planning', 'TASKS.json'),
          data: {
            version: '1.0.0',
            project: 'test-project',
            lastTaskId: 3,
            tasks: [
              {
                id: 'T001',
                title: 'First task',
                phase: 1,
                status: 'pending',
                assignee: 'backend-architect',
                dependencies: ['T003'],
                created: '2026-01-23T10:00:00Z',
              },
              {
                id: 'T002',
                title: 'Second task',
                phase: 1,
                status: 'pending',
                assignee: 'backend-architect',
                dependencies: ['T001'],
                created: '2026-01-23T11:00:00Z',
              },
              {
                id: 'T003',
                title: 'Third task',
                phase: 1,
                status: 'pending',
                assignee: 'backend-architect',
                dependencies: ['T002'],
                created: '2026-01-23T12:00:00Z',
              },
            ],
          },
        };

        const result = await referentialLayer(context);

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'REFERENTIAL_CIRCULAR_DEPENDENCY')).toBe(true);
      });

      it('should detect self-reference', async () => {
        const context: ValidationContext = {
          projectPath: testDir,
          fileType: 'task-registry',
          filePath: join(testDir, '.planning', 'TASKS.json'),
          data: {
            version: '1.0.0',
            project: 'test-project',
            lastTaskId: 1,
            tasks: [
              {
                id: 'T001',
                title: 'Self-referencing task',
                phase: 1,
                status: 'pending',
                assignee: 'backend-architect',
                dependencies: ['T001'], // Self-reference!
                created: '2026-01-23T10:00:00Z',
              },
            ],
          },
        };

        const result = await referentialLayer(context);

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'REFERENTIAL_SELF_REFERENCE')).toBe(true);
        expect(result.errors[0].message).toContain('cannot depend on itself');
      });

      it('should detect lastTaskId mismatch', async () => {
        const context: ValidationContext = {
          projectPath: testDir,
          fileType: 'task-registry',
          filePath: join(testDir, '.planning', 'TASKS.json'),
          data: {
            version: '1.0.0',
            project: 'test-project',
            lastTaskId: 10, // Wrong! Should be 2
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
                status: 'pending',
                assignee: 'backend-architect',
                dependencies: [],
                created: '2026-01-23T13:00:00Z',
              },
            ],
          },
        };

        const result = await referentialLayer(context);

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'REFERENTIAL_LAST_TASK_ID_MISMATCH')).toBe(
          true
        );
        expect(result.errors[0].details).toEqual({
          expected: 2,
          actual: 10,
        });
      });

      it('should handle empty task array with lastTaskId = 0', async () => {
        const context: ValidationContext = {
          projectPath: testDir,
          fileType: 'task-registry',
          filePath: join(testDir, '.planning', 'TASKS.json'),
          data: {
            version: '1.0.0',
            project: 'test-project',
            lastTaskId: 0,
            tasks: [],
          },
        };

        const result = await referentialLayer(context);

        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should fail for empty task array with lastTaskId > 0', async () => {
        const context: ValidationContext = {
          projectPath: testDir,
          fileType: 'task-registry',
          filePath: join(testDir, '.planning', 'TASKS.json'),
          data: {
            version: '1.0.0',
            project: 'test-project',
            lastTaskId: 5,
            tasks: [],
          },
        };

        const result = await referentialLayer(context);

        expect(result.valid).toBe(false);
        expect(result.errors[0].code).toBe('REFERENTIAL_LAST_TASK_ID_MISMATCH');
      });
    });

    describe('state validation', () => {
      it('should return success for valid state with no cross-references', async () => {
        const context: ValidationContext = {
          projectPath: testDir,
          fileType: 'state',
          filePath: join(testDir, '.planning', 'STATE.json'),
          data: {
            currentPosition: {
              phase: 1,
              status: 'executing',
            },
            nextSteps: ['Complete T001'],
          },
        };

        const result = await referentialLayer(context);

        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should validate activeTask references existing task', async () => {
        // Create TASKS.json with T001
        await fs.writeFile(
          join(testDir, '.planning', 'TASKS.json'),
          JSON.stringify({
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
                created: '2026-01-23T10:00:00Z',
              },
            ],
          })
        );

        const context: ValidationContext = {
          projectPath: testDir,
          fileType: 'state',
          filePath: join(testDir, '.planning', 'STATE.json'),
          data: {
            currentPosition: {
              phase: 1,
              status: 'executing',
            },
            activeTask: {
              id: 'T001',
              description: 'Test task',
            },
            nextSteps: [],
          },
        };

        const result = await referentialLayer(context);

        expect(result.valid).toBe(true);
      });

      it('should detect orphan activeTask reference', async () => {
        // Create TASKS.json with only T001
        await fs.writeFile(
          join(testDir, '.planning', 'TASKS.json'),
          JSON.stringify({
            version: '1.0.0',
            project: 'test',
            lastTaskId: 1,
            tasks: [
              {
                id: 'T001',
                title: 'Test',
                phase: 1,
                status: 'completed',
                assignee: 'backend-architect',
                dependencies: [],
                created: '2026-01-23T10:00:00Z',
                completed: '2026-01-23T12:00:00Z',
              },
            ],
          })
        );

        const context: ValidationContext = {
          projectPath: testDir,
          fileType: 'state',
          filePath: join(testDir, '.planning', 'STATE.json'),
          data: {
            currentPosition: {
              phase: 1,
              status: 'executing',
            },
            activeTask: {
              id: 'T999', // Doesn't exist!
              description: 'Non-existent task',
            },
            nextSteps: [],
          },
        };

        const result = await referentialLayer(context);

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'REFERENTIAL_ORPHAN_REFERENCE')).toBe(true);
        expect(result.errors[0].message).toContain('T999');
      });

      it('should detect duplicate open question IDs', async () => {
        const context: ValidationContext = {
          projectPath: testDir,
          fileType: 'state',
          filePath: join(testDir, '.planning', 'STATE.json'),
          data: {
            currentPosition: {
              phase: 1,
              status: 'executing',
            },
            openQuestions: [
              { id: 'Q1', question: 'First question?', status: 'Open' },
              { id: 'Q2', question: 'Second question?', status: 'Open' },
              { id: 'Q1', question: 'Duplicate ID!', status: 'Open' }, // Duplicate!
            ],
            nextSteps: [],
          },
        };

        const result = await referentialLayer(context);

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'REFERENTIAL_DUPLICATE_QUESTION_ID')).toBe(
          true
        );
        expect(result.errors[0].message).toContain('Q1');
      });

      it('should warn when TASKS.json is unreadable', async () => {
        // Don't create TASKS.json

        const context: ValidationContext = {
          projectPath: testDir,
          fileType: 'state',
          filePath: join(testDir, '.planning', 'STATE.json'),
          data: {
            currentPosition: {
              phase: 1,
              status: 'executing',
            },
            activeTask: {
              id: 'T001',
            },
            nextSteps: [],
          },
        };

        const result = await referentialLayer(context);

        // Should still be valid but with warnings
        expect(result.valid).toBe(true);
        expect(result.warnings.length).toBeGreaterThan(0);
        expect(result.warnings.some((w) => w.code === 'REFERENTIAL_REGISTRY_UNREADABLE')).toBe(
          true
        );
      });

      it('should handle activeTask as string "None"', async () => {
        const context: ValidationContext = {
          projectPath: testDir,
          fileType: 'state',
          filePath: join(testDir, '.planning', 'STATE.json'),
          data: {
            currentPosition: {
              phase: 1,
              status: 'executing',
            },
            activeTask: 'None',
            nextSteps: [],
          },
        };

        const result = await referentialLayer(context);

        expect(result.valid).toBe(true);
      });
    });

    describe('plan validation', () => {
      it('should return success for valid plan with known agent', async () => {
        const context: ValidationContext = {
          projectPath: testDir,
          fileType: 'plan',
          filePath: join(testDir, '.planning', 'plans', '01-01.plan.md'),
          data: {
            phase: '01-test-stabilization',
            plan: 1,
            wave: 1,
            autonomous: true,
            agent: 'backend-architect',
          },
        };

        const result = await referentialLayer(context);

        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should detect unknown agent type', async () => {
        const context: ValidationContext = {
          projectPath: testDir,
          fileType: 'plan',
          filePath: join(testDir, '.planning', 'plans', '01-01.plan.md'),
          data: {
            phase: '01-test-stabilization',
            plan: 1,
            wave: 1,
            agent: 'unknown-agent-type', // Not a known agent
          },
        };

        const result = await referentialLayer(context);

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'REFERENTIAL_UNKNOWN_AGENT')).toBe(true);
        expect(result.errors[0].details?.knownAgents).toContain('backend-architect');
      });

      it('should validate depends_on references existing plans', async () => {
        // Create a dependency plan file
        await fs.writeFile(
          join(testDir, '.planning', 'plans', '01-01.plan.md'),
          '---\nphase: 01\nplan: 1\nwave: 1\n---'
        );

        const context: ValidationContext = {
          projectPath: testDir,
          fileType: 'plan',
          filePath: join(testDir, '.planning', 'plans', '01-02.plan.md'),
          data: {
            phase: '01-test-stabilization',
            plan: 2,
            wave: 2,
            depends_on: ['01-01'],
          },
        };

        const result = await referentialLayer(context);

        expect(result.valid).toBe(true);
      });

      it('should detect missing plan dependency', async () => {
        const context: ValidationContext = {
          projectPath: testDir,
          fileType: 'plan',
          filePath: join(testDir, '.planning', 'plans', '01-02.plan.md'),
          data: {
            phase: '01-test-stabilization',
            plan: 2,
            wave: 2,
            depends_on: ['99-99'], // Doesn't exist
          },
        };

        const result = await referentialLayer(context);

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'REFERENTIAL_MISSING_PLAN')).toBe(true);
        expect(result.errors[0].message).toContain('99-99');
      });

      it('should allow all known agent types', async () => {
        for (const agent of KNOWN_AGENTS) {
          const context: ValidationContext = {
            projectPath: testDir,
            fileType: 'plan',
            filePath: join(testDir, '.planning', 'plans', '01-01.plan.md'),
            data: {
              phase: '01-test',
              plan: 1,
              wave: 1,
              agent,
            },
          };

          const result = await referentialLayer(context);
          expect(result.valid).toBe(true);
        }
      });
    });
  });

  describe('detectCircularDependencies', () => {
    it('should return empty array for no cycles', () => {
      const tasks = [
        { id: 'T001', dependencies: [] },
        { id: 'T002', dependencies: ['T001'] },
        { id: 'T003', dependencies: ['T001', 'T002'] },
      ] as any[];

      const cycles = detectCircularDependencies(tasks);
      expect(cycles).toHaveLength(0);
    });

    it('should detect simple A -> B -> A cycle', () => {
      const tasks = [
        { id: 'T001', dependencies: ['T002'] },
        { id: 'T002', dependencies: ['T001'] },
      ] as any[];

      const cycles = detectCircularDependencies(tasks);
      expect(cycles.length).toBeGreaterThan(0);
    });

    it('should detect longer cycle A -> B -> C -> A', () => {
      const tasks = [
        { id: 'T001', dependencies: ['T003'] },
        { id: 'T002', dependencies: ['T001'] },
        { id: 'T003', dependencies: ['T002'] },
      ] as any[];

      const cycles = detectCircularDependencies(tasks);
      expect(cycles.length).toBeGreaterThan(0);
    });

    it('should handle tasks with no dependencies', () => {
      const tasks = [
        { id: 'T001', dependencies: [] },
        { id: 'T002', dependencies: [] },
      ] as any[];

      const cycles = detectCircularDependencies(tasks);
      expect(cycles).toHaveLength(0);
    });
  });

  describe('buildDependencyGraph', () => {
    it('should build correct graph', () => {
      const tasks = [
        { id: 'T001', dependencies: [] },
        { id: 'T002', dependencies: ['T001'] },
        { id: 'T003', dependencies: ['T001', 'T002'] },
      ] as any[];

      const graph = buildDependencyGraph(tasks);

      expect(graph.get('T001')).toEqual([]);
      expect(graph.get('T002')).toEqual(['T001']);
      expect(graph.get('T003')).toEqual(['T001', 'T002']);
    });
  });

  describe('validateDependenciesExist', () => {
    it('should not report errors for valid dependencies', () => {
      const tasks = [
        { id: 'T001', dependencies: [] },
        { id: 'T002', dependencies: ['T001'] },
      ] as any[];
      const errors: any[] = [];

      validateDependenciesExist(tasks, errors);

      expect(errors).toHaveLength(0);
    });

    it('should report error for missing dependency', () => {
      const tasks = [
        { id: 'T001', dependencies: ['T999'] }, // T999 doesn't exist
      ] as any[];
      const errors: any[] = [];

      validateDependenciesExist(tasks, errors);

      expect(errors).toHaveLength(1);
      expect(errors[0].code).toBe('REFERENTIAL_MISSING_DEPENDENCY');
    });
  });

  describe('validateNoSelfReferences', () => {
    it('should not report errors for valid tasks', () => {
      const tasks = [
        { id: 'T001', dependencies: [] },
        { id: 'T002', dependencies: ['T001'] },
      ] as any[];
      const errors: any[] = [];

      validateNoSelfReferences(tasks, errors);

      expect(errors).toHaveLength(0);
    });

    it('should report error for self-reference', () => {
      const tasks = [{ id: 'T001', dependencies: ['T001'] }] as any[];
      const errors: any[] = [];

      validateNoSelfReferences(tasks, errors);

      expect(errors).toHaveLength(1);
      expect(errors[0].code).toBe('REFERENTIAL_SELF_REFERENCE');
    });
  });

  describe('validateLastTaskId', () => {
    it('should not report error when lastTaskId matches', () => {
      const registry = {
        lastTaskId: 3,
        tasks: [{ id: 'T001' }, { id: 'T002' }, { id: 'T003' }],
      } as any;
      const errors: any[] = [];

      validateLastTaskId(registry, errors);

      expect(errors).toHaveLength(0);
    });

    it('should report error when lastTaskId is too high', () => {
      const registry = {
        lastTaskId: 10,
        tasks: [{ id: 'T001' }, { id: 'T002' }],
      } as any;
      const errors: any[] = [];

      validateLastTaskId(registry, errors);

      expect(errors).toHaveLength(1);
      expect(errors[0].code).toBe('REFERENTIAL_LAST_TASK_ID_MISMATCH');
    });

    it('should report error when lastTaskId is too low', () => {
      const registry = {
        lastTaskId: 1,
        tasks: [{ id: 'T001' }, { id: 'T005' }],
      } as any;
      const errors: any[] = [];

      validateLastTaskId(registry, errors);

      expect(errors).toHaveLength(1);
      expect(errors[0].details?.expected).toBe(5);
    });
  });

  describe('validateOpenQuestionUniqueness', () => {
    it('should not report errors for unique IDs', () => {
      const questions = [
        { id: 'Q1', question: 'Q1?', status: 'Open' },
        { id: 'Q2', question: 'Q2?', status: 'Open' },
        { id: 'Q3', question: 'Q3?', status: 'Resolved' },
      ];
      const errors: any[] = [];

      validateOpenQuestionUniqueness(questions, errors);

      expect(errors).toHaveLength(0);
    });

    it('should report error for duplicate IDs', () => {
      const questions = [
        { id: 'Q1', question: 'Q1?', status: 'Open' },
        { id: 'Q1', question: 'Duplicate!', status: 'Open' },
      ];
      const errors: any[] = [];

      validateOpenQuestionUniqueness(questions, errors);

      expect(errors).toHaveLength(1);
      expect(errors[0].code).toBe('REFERENTIAL_DUPLICATE_QUESTION_ID');
    });
  });

  describe('KNOWN_AGENTS', () => {
    it('should contain all 17 agent types', () => {
      expect(KNOWN_AGENTS.size).toBe(17);
    });

    it('should contain expected agent types', () => {
      expect(KNOWN_AGENTS.has('backend-architect')).toBe(true);
      expect(KNOWN_AGENTS.has('database-engineer')).toBe(true);
      expect(KNOWN_AGENTS.has('qa-engineer')).toBe(true);
      expect(KNOWN_AGENTS.has('product-manager')).toBe(true);
    });
  });
});
