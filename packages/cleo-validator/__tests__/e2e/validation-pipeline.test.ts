/**
 * E2E Validation Pipeline Tests
 *
 * Comprehensive end-to-end test suite for the 4-layer CLEO validation system.
 * Tests real-world scenarios with realistic project structures and validates
 * all layers work correctly together.
 *
 * @module __tests__/e2e/validation-pipeline
 */

import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { ExitCode } from '../../src/exit-codes';
import { loadSchemas } from '../../src/validator';
import {
  runValidation,
  runValidationOnFile,
  runProjectValidation,
  type RunnerOptions,
} from '../../src/layers/runner';
import type { ValidationContext } from '../../src/layers/types';

// ============================================================================
// Test Fixtures and Helpers
// ============================================================================

/**
 * Creates a realistic project structure in a temporary directory.
 */
async function setupTestProject(dir: string): Promise<void> {
  const planningDir = join(dir, '.planning');
  const plansDir = join(planningDir, 'plans');

  await fs.mkdir(planningDir, { recursive: true });
  await fs.mkdir(plansDir, { recursive: true });
}

/**
 * Writes a STATE.json file with the given data.
 */
async function writeStateFile(dir: string, data: object): Promise<string> {
  const filePath = join(dir, '.planning', 'STATE.json');
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  return filePath;
}

/**
 * Writes a TASKS.json file with the given data.
 */
async function writeTasksFile(dir: string, data: object): Promise<string> {
  const filePath = join(dir, '.planning', 'TASKS.json');
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  return filePath;
}

/**
 * Writes a plan file with the given data.
 */
async function writePlanFile(
  dir: string,
  filename: string,
  data: object
): Promise<string> {
  const filePath = join(dir, '.planning', 'plans', filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  return filePath;
}

// ============================================================================
// Valid Test Data Fixtures
// ============================================================================

const validStateData = {
  currentPosition: {
    phase: 1,
    status: 'executing',
  },
  nextSteps: ['Complete T001', 'Start T002'],
  decisions: [
    {
      date: '2026-01-23',
      decision: 'Use CLEO validation framework',
      rationale: 'Provides 4-layer validation with stable task IDs',
    },
  ],
  sessionLog: [
    {
      timestamp: '2026-01-23T10:00:00Z',
      action: 'Started validation pipeline implementation',
      agent: 'qa-engineer',
    },
  ],
};

const validTasksData = {
  version: '1.0.0',
  project: 'test-project',
  lastTaskId: 3,
  tasks: [
    {
      id: 'T001',
      title: 'Implement schema layer',
      phase: 1,
      status: 'completed',
      assignee: 'backend-architect',
      dependencies: [],
      created: '2026-01-23T10:00:00Z',
      completed: '2026-01-23T11:00:00Z',
    },
    {
      id: 'T002',
      title: 'Implement semantic layer',
      phase: 1,
      status: 'completed',
      assignee: 'backend-architect',
      dependencies: ['T001'],
      created: '2026-01-23T11:00:00Z',
      completed: '2026-01-23T12:00:00Z',
    },
    {
      id: 'T003',
      title: 'Implement referential layer',
      phase: 1,
      status: 'in_progress',
      assignee: 'backend-architect',
      dependencies: ['T002'],
      created: '2026-01-23T12:00:00Z',
    },
  ],
};

const validPlanData = {
  phase: '01-test-stabilization',
  plan: 1,
  wave: 1,
  autonomous: true,
  agent: 'qa-engineer',
};

// ============================================================================
// Test Suite
// ============================================================================

describe('Validation Pipeline E2E', () => {
  let testDir: string;

  beforeAll(async () => {
    await loadSchemas();
  });

  beforeEach(async () => {
    testDir = await fs.mkdtemp(join(tmpdir(), 'cleo-e2e-'));
    await setupTestProject(testDir);
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  // ==========================================================================
  // Full Pipeline Validation
  // ==========================================================================

  describe('Full pipeline validation', () => {
    it('should pass validation for well-formed project', async () => {
      // Set up valid project files
      await writeStateFile(testDir, validStateData);
      await writeTasksFile(testDir, validTasksData);
      await writePlanFile(testDir, '01-01.plan.json', validPlanData);

      const result = await runProjectValidation(testDir);

      expect(result.overall.valid).toBe(true);
      expect(result.overall.errorCount).toBe(0);
      // Validates STATE, TASKS, and the plan file
      expect(result.overall.filesValidated).toBeGreaterThanOrEqual(2);
      expect(result.state?.valid).toBe(true);
      expect(result.tasks?.valid).toBe(true);
      expect(result.overall.exitCode).toBe(ExitCode.SUCCESS);
    });

    it('should pass all 4 layers for valid task registry data', async () => {
      const context: ValidationContext = {
        projectPath: testDir,
        fileType: 'task-registry',
        filePath: join(testDir, '.planning', 'TASKS.json'),
        data: validTasksData,
      };

      const result = await runValidation(context);

      expect(result.valid).toBe(true);
      expect(result.allErrors).toHaveLength(0);
      expect(result.exitCode).toBe(ExitCode.SUCCESS);
      expect(result.layerResults).toHaveLength(4);
      expect(result.layerResults.map((r) => r.layer)).toEqual([
        'schema',
        'semantic',
        'referential',
        'state-machine',
      ]);
      expect(result.metadata.layersRun).toBe(4);
      expect(result.metadata.stoppedEarly).toBe(false);
    });

    it('should fail schema validation for malformed JSON', async () => {
      const tasksPath = join(testDir, '.planning', 'TASKS.json');
      await fs.writeFile(tasksPath, '{ invalid json content }');

      const result = await runValidationOnFile(testDir, tasksPath, 'task-registry');

      expect(result.valid).toBe(false);
      expect(result.allErrors[0].code).toBe('RUNNER_PARSE_ERROR');
      expect(result.exitCode).toBe(ExitCode.VALIDATION_SCHEMA);
    });

    it('should fail schema validation for missing required fields', async () => {
      const context: ValidationContext = {
        projectPath: testDir,
        fileType: 'task-registry',
        filePath: join(testDir, '.planning', 'TASKS.json'),
        data: {
          // Missing: version, project, lastTaskId, tasks
        },
      };

      const result = await runValidation(context);

      expect(result.valid).toBe(false);
      expect(result.exitCode).toBe(ExitCode.VALIDATION_SCHEMA);
      expect(result.layerResults).toHaveLength(1);
      expect(result.layerResults[0].layer).toBe('schema');
      expect(result.metadata.stoppedEarly).toBe(true);
      expect(result.metadata.stoppedAtLayer).toBe('schema');

      // Verify specific schema errors
      const schemaErrors = result.allErrors.filter((e) =>
        e.code.startsWith('SCHEMA')
      );
      expect(schemaErrors.length).toBeGreaterThan(0);
    });

    it('should fail schema validation for invalid status enum', async () => {
      const context: ValidationContext = {
        projectPath: testDir,
        fileType: 'task-registry',
        filePath: join(testDir, '.planning', 'TASKS.json'),
        data: {
          version: '1.0.0',
          project: 'test',
          lastTaskId: 1,
          tasks: [
            {
              id: 'T001',
              title: 'Test task',
              phase: 1,
              status: 'invalid_status', // Invalid status - schema enforces enum
              assignee: 'backend-architect',
              dependencies: [],
              created: '2026-01-23T10:00:00Z',
            },
          ],
        },
      };

      const result = await runValidation(context);

      expect(result.valid).toBe(false);
      // Schema layer fails because status has an enum constraint
      expect(result.exitCode).toBe(ExitCode.VALIDATION_SCHEMA);
      expect(result.allErrors.some((e) => e.code === 'SCHEMA_INVALID_ENUM')).toBe(true);
    });

    it('should fail referential validation for missing dependency', async () => {
      const context: ValidationContext = {
        projectPath: testDir,
        fileType: 'task-registry',
        filePath: join(testDir, '.planning', 'TASKS.json'),
        data: {
          version: '1.0.0',
          project: 'test',
          lastTaskId: 1,
          tasks: [
            {
              id: 'T001',
              title: 'Test task',
              phase: 1,
              status: 'pending',
              assignee: 'backend-architect',
              dependencies: ['T999'], // Non-existent dependency
              created: '2026-01-23T10:00:00Z',
            },
          ],
        },
      };

      const result = await runValidation(context, { stopOnFirstError: false });

      expect(result.valid).toBe(false);
      expect(
        result.allErrors.some((e) => e.code === 'REFERENTIAL_MISSING_DEPENDENCY')
      ).toBe(true);
      expect(result.exitCode).toBe(ExitCode.VALIDATION_REFERENTIAL);
    });

    it('should fail state machine validation for completed task with pending dependencies', async () => {
      const context: ValidationContext = {
        projectPath: testDir,
        fileType: 'task-registry',
        filePath: join(testDir, '.planning', 'TASKS.json'),
        data: {
          version: '1.0.0',
          project: 'test',
          lastTaskId: 2,
          tasks: [
            {
              id: 'T001',
              title: 'First task',
              phase: 1,
              status: 'pending', // Still pending
              assignee: 'backend-architect',
              dependencies: [],
              created: '2026-01-23T10:00:00Z',
            },
            {
              id: 'T002',
              title: 'Second task',
              phase: 1,
              status: 'completed', // Completed but depends on pending T001
              assignee: 'backend-architect',
              dependencies: ['T001'],
              created: '2026-01-23T10:00:00Z',
              completed: '2026-01-23T12:00:00Z',
            },
          ],
        },
      };

      const result = await runValidation(context, { stopOnFirstError: false });

      expect(result.valid).toBe(false);
      expect(
        result.allErrors.some(
          (e) => e.code === 'STATE_MACHINE_COMPLETED_WITH_PENDING_DEPS'
        )
      ).toBe(true);
      expect(result.exitCode).toBe(ExitCode.VALIDATION_STATE_MACHINE);
    });
  });

  // ==========================================================================
  // Layer Interaction Tests
  // ==========================================================================

  describe('Layer interaction', () => {
    it('should stop on first error by default', async () => {
      // Create data with both schema and semantic errors
      const context: ValidationContext = {
        projectPath: testDir,
        fileType: 'task-registry',
        filePath: join(testDir, '.planning', 'TASKS.json'),
        data: {
          // Missing required fields - schema error
        },
      };

      const result = await runValidation(context);

      expect(result.valid).toBe(false);
      expect(result.layerResults).toHaveLength(1);
      expect(result.layerResults[0].layer).toBe('schema');
      expect(result.metadata.stoppedEarly).toBe(true);
      expect(result.metadata.stoppedAtLayer).toBe('schema');
    });

    it('should collect all errors when stopOnFirstError is false', async () => {
      // Create data with errors at multiple layers
      const context: ValidationContext = {
        projectPath: testDir,
        fileType: 'task-registry',
        filePath: join(testDir, '.planning', 'TASKS.json'),
        data: {
          version: '1.0.0',
          project: 'test',
          lastTaskId: 99, // Wrong - referential error
          tasks: [
            {
              id: 'T001',
              title: 'Test task',
              phase: 1,
              status: 'completed',
              assignee: 'backend-architect',
              dependencies: ['T002'], // Missing dependency - referential error
              created: '2026-01-23T10:00:00Z',
              completed: '2026-01-23T12:00:00Z',
            },
          ],
        },
      };

      const options: RunnerOptions = { stopOnFirstError: false };
      const result = await runValidation(context, options);

      expect(result.valid).toBe(false);
      expect(result.layerResults.length).toBeGreaterThan(1);
      expect(result.metadata.stoppedEarly).toBe(false);
      // Should have errors from multiple layers
      expect(result.allErrors.length).toBeGreaterThan(1);
    });

    it('should run layers in correct order regardless of option order', async () => {
      const context: ValidationContext = {
        projectPath: testDir,
        fileType: 'task-registry',
        filePath: join(testDir, '.planning', 'TASKS.json'),
        data: validTasksData,
      };

      // Provide layers in reverse order
      const options: RunnerOptions = {
        layers: ['state-machine', 'referential', 'semantic', 'schema'],
      };

      const result = await runValidation(context, options);

      // Should still run in correct order
      expect(result.layerResults[0].layer).toBe('schema');
      expect(result.layerResults[1].layer).toBe('semantic');
      expect(result.layerResults[2].layer).toBe('referential');
      expect(result.layerResults[3].layer).toBe('state-machine');
    });

    it('should allow running specific layers only', async () => {
      const context: ValidationContext = {
        projectPath: testDir,
        fileType: 'task-registry',
        filePath: join(testDir, '.planning', 'TASKS.json'),
        data: validTasksData,
      };

      const options: RunnerOptions = {
        layers: ['schema', 'semantic'],
      };

      const result = await runValidation(context, options);

      expect(result.valid).toBe(true);
      expect(result.layerResults).toHaveLength(2);
      expect(result.layerResults[0].layer).toBe('schema');
      expect(result.layerResults[1].layer).toBe('semantic');
      expect(result.metadata.layersRequested).toBe(2);
      expect(result.metadata.layersRun).toBe(2);
    });

    it('should pass warnings through even when validation passes', async () => {
      const context: ValidationContext = {
        projectPath: testDir,
        fileType: 'task-registry',
        filePath: join(testDir, '.planning', 'TASKS.json'),
        data: {
          version: '1.0.0',
          project: 'test',
          lastTaskId: 2,
          tasks: [
            {
              id: 'T001',
              title: 'First task',
              phase: 1, // Phase 1
              status: 'completed',
              assignee: 'backend-architect',
              dependencies: [],
              created: '2026-01-23T10:00:00Z',
              completed: '2026-01-23T11:00:00Z',
            },
            {
              id: 'T002',
              title: 'Second task',
              phase: 3, // Phase 3 - skip phase 2 creates warning
              status: 'pending',
              assignee: 'backend-architect',
              dependencies: [],
              created: '2026-01-23T12:00:00Z',
            },
          ],
        },
      };

      const result = await runValidation(context);

      expect(result.valid).toBe(true);
      expect(result.allWarnings.length).toBeGreaterThan(0);
      expect(
        result.allWarnings.some((w) => w.code === 'SEMANTIC_WARN_PHASE_GAP')
      ).toBe(true);
    });
  });

  // ==========================================================================
  // Cross-File Validation Tests
  // ==========================================================================

  describe('Cross-file validation', () => {
    it('should validate activeTask references existing task in TASKS.json', async () => {
      // Write TASKS.json with T001
      await writeTasksFile(testDir, validTasksData);

      // STATE references T001 which exists
      const stateData = {
        currentPosition: {
          phase: 1,
          status: 'executing',
        },
        activeTask: {
          id: 'T001',
          description: 'Implement schema layer',
        },
        nextSteps: ['Complete T001'],
      };
      const statePath = await writeStateFile(testDir, stateData);

      const result = await runValidationOnFile(testDir, statePath, 'state');

      expect(result.valid).toBe(true);
      expect(result.allErrors).toHaveLength(0);
    });

    it('should warn when TASKS.json is missing for cross-reference', async () => {
      // Don't write TASKS.json
      const stateData = {
        currentPosition: {
          phase: 1,
          status: 'executing',
        },
        activeTask: {
          id: 'T001',
          description: 'Some task',
        },
        nextSteps: ['Complete T001'],
      };
      const statePath = await writeStateFile(testDir, stateData);

      const result = await runValidationOnFile(testDir, statePath, 'state');

      // Should pass but with warning about unreadable registry
      expect(result.valid).toBe(true);
      expect(
        result.allWarnings.some((w) =>
          w.code.includes('REGISTRY_UNREADABLE')
        )
      ).toBe(true);
    });

    it('should error when activeTask references non-existent task', async () => {
      // Write TASKS.json without T999
      await writeTasksFile(testDir, validTasksData);

      // STATE references T999 which doesn't exist
      const stateData = {
        currentPosition: {
          phase: 1,
          status: 'executing',
        },
        activeTask: {
          id: 'T999', // Doesn't exist
          description: 'Non-existent task',
        },
        nextSteps: ['Complete task'],
      };
      const statePath = await writeStateFile(testDir, stateData);

      const result = await runValidationOnFile(testDir, statePath, 'state');

      expect(result.valid).toBe(false);
      expect(
        result.allErrors.some((e) => e.code === 'REFERENTIAL_ORPHAN_REFERENCE')
      ).toBe(true);
    });
  });

  // ==========================================================================
  // Circular Dependency Detection Tests
  // ==========================================================================

  describe('Circular dependency detection', () => {
    it('should detect simple circular dependency (A -> B -> A)', async () => {
      const context: ValidationContext = {
        projectPath: testDir,
        fileType: 'task-registry',
        filePath: join(testDir, '.planning', 'TASKS.json'),
        data: {
          version: '1.0.0',
          project: 'test',
          lastTaskId: 2,
          tasks: [
            {
              id: 'T001',
              title: 'Task A',
              phase: 1,
              status: 'pending',
              assignee: 'backend-architect',
              dependencies: ['T002'], // Depends on T002
              created: '2026-01-23T10:00:00Z',
            },
            {
              id: 'T002',
              title: 'Task B',
              phase: 1,
              status: 'pending',
              assignee: 'backend-architect',
              dependencies: ['T001'], // Depends on T001 -> circular!
              created: '2026-01-23T10:00:00Z',
            },
          ],
        },
      };

      const result = await runValidation(context, { stopOnFirstError: false });

      expect(result.valid).toBe(false);
      expect(
        result.allErrors.some((e) => e.code === 'REFERENTIAL_CIRCULAR_DEPENDENCY')
      ).toBe(true);

      const circularError = result.allErrors.find(
        (e) => e.code === 'REFERENTIAL_CIRCULAR_DEPENDENCY'
      );
      expect(circularError?.details).toBeDefined();
      expect((circularError?.details as { cycle: string[] }).cycle).toContain('T001');
      expect((circularError?.details as { cycle: string[] }).cycle).toContain('T002');
    });

    it('should detect complex circular dependency chain (A -> B -> C -> A)', async () => {
      const context: ValidationContext = {
        projectPath: testDir,
        fileType: 'task-registry',
        filePath: join(testDir, '.planning', 'TASKS.json'),
        data: {
          version: '1.0.0',
          project: 'test',
          lastTaskId: 3,
          tasks: [
            {
              id: 'T001',
              title: 'Task A',
              phase: 1,
              status: 'pending',
              assignee: 'backend-architect',
              dependencies: ['T003'], // A depends on C
              created: '2026-01-23T10:00:00Z',
            },
            {
              id: 'T002',
              title: 'Task B',
              phase: 1,
              status: 'pending',
              assignee: 'backend-architect',
              dependencies: ['T001'], // B depends on A
              created: '2026-01-23T10:00:00Z',
            },
            {
              id: 'T003',
              title: 'Task C',
              phase: 1,
              status: 'pending',
              assignee: 'backend-architect',
              dependencies: ['T002'], // C depends on B -> circular!
              created: '2026-01-23T10:00:00Z',
            },
          ],
        },
      };

      const result = await runValidation(context, { stopOnFirstError: false });

      expect(result.valid).toBe(false);
      expect(
        result.allErrors.some((e) => e.code === 'REFERENTIAL_CIRCULAR_DEPENDENCY')
      ).toBe(true);
    });

    it('should detect self-referencing task', async () => {
      const context: ValidationContext = {
        projectPath: testDir,
        fileType: 'task-registry',
        filePath: join(testDir, '.planning', 'TASKS.json'),
        data: {
          version: '1.0.0',
          project: 'test',
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

      const result = await runValidation(context, { stopOnFirstError: false });

      expect(result.valid).toBe(false);
      expect(
        result.allErrors.some((e) => e.code === 'REFERENTIAL_SELF_REFERENCE')
      ).toBe(true);
    });
  });

  // ==========================================================================
  // Real-World Scenarios
  // ==========================================================================

  describe('Real-world scenarios', () => {
    it('should validate a typical phase execution state', async () => {
      await writeTasksFile(testDir, validTasksData);

      const realisticState = {
        project: {
          name: 'product-helper',
          version: '1.0.0',
          updated: '2026-01-23',
        },
        currentPosition: {
          phase: 1,
          status: 'executing',
          milestone: 'v1.0 - Initial Release',
          lastActivity: 'Completed T001, starting T002',
        },
        activeTask: {
          id: 'T003',
          description: 'Implement referential layer',
          assignedTo: 'backend-architect',
        },
        decisions: [
          {
            date: '2026-01-22',
            decision: 'Use 4-layer validation',
            rationale: 'Provides comprehensive validation with clear exit codes',
            decidedBy: 'backend-architect',
          },
          {
            date: '2026-01-23',
            decision: 'Add circular dependency detection',
            rationale: 'Prevent infinite loops in task execution',
            decidedBy: 'qa-engineer',
          },
        ],
        blockers: 'None',
        openQuestions: [
          {
            id: 'Q1',
            question: 'Should we add caching to validation?',
            status: 'Open',
            owner: 'backend-architect',
          },
        ],
        sessionLog: [
          {
            timestamp: '2026-01-23T09:00:00Z',
            agent: 'backend-architect',
            action: 'Started phase 1 execution',
            taskId: 'T001',
          },
          {
            timestamp: '2026-01-23T10:00:00Z',
            agent: 'backend-architect',
            action: 'Completed schema layer implementation',
            taskId: 'T001',
          },
        ],
        nextSteps: [
          'Complete T003 - Implement referential layer',
          'Start T004 - Implement state machine layer',
          'Write E2E tests',
        ],
        quickStats: {
          tests: '45/50 passing (90%)',
          criticalIssues: 0,
          documentation: '70/100',
        },
      };

      const statePath = await writeStateFile(testDir, realisticState);
      const result = await runValidationOnFile(testDir, statePath, 'state');

      expect(result.valid).toBe(true);
      expect(result.allErrors).toHaveLength(0);
    });

    it('should validate a task registry with multiple phases', async () => {
      const multiPhaseRegistry = {
        version: '1.0.0',
        project: 'cleo-validator',
        lastTaskId: 8,
        tasks: [
          // Phase 1: Schema Layer
          {
            id: 'T001',
            title: 'Implement schema layer',
            phase: 1,
            status: 'completed',
            assignee: 'backend-architect',
            dependencies: [],
            created: '2026-01-20T10:00:00Z',
            completed: '2026-01-20T12:00:00Z',
          },
          {
            id: 'T002',
            title: 'Write schema layer tests',
            phase: 1,
            status: 'completed',
            assignee: 'qa-engineer',
            dependencies: ['T001'],
            created: '2026-01-20T12:00:00Z',
            completed: '2026-01-20T14:00:00Z',
          },
          // Phase 2: Semantic Layer
          {
            id: 'T003',
            title: 'Implement semantic layer',
            phase: 2,
            status: 'completed',
            assignee: 'backend-architect',
            dependencies: ['T001'],
            created: '2026-01-21T10:00:00Z',
            completed: '2026-01-21T12:00:00Z',
          },
          {
            id: 'T004',
            title: 'Write semantic layer tests',
            phase: 2,
            status: 'completed',
            assignee: 'qa-engineer',
            dependencies: ['T003'],
            created: '2026-01-21T12:00:00Z',
            completed: '2026-01-21T14:00:00Z',
          },
          // Phase 3: Referential Layer
          {
            id: 'T005',
            title: 'Implement referential layer',
            phase: 3,
            status: 'completed',
            assignee: 'backend-architect',
            dependencies: ['T003'],
            created: '2026-01-22T10:00:00Z',
            completed: '2026-01-22T12:00:00Z',
          },
          {
            id: 'T006',
            title: 'Write referential layer tests',
            phase: 3,
            status: 'completed',
            assignee: 'qa-engineer',
            dependencies: ['T005'],
            created: '2026-01-22T12:00:00Z',
            completed: '2026-01-22T14:00:00Z',
          },
          // Phase 4: State Machine Layer
          {
            id: 'T007',
            title: 'Implement state machine layer',
            phase: 4,
            status: 'in_progress',
            assignee: 'backend-architect',
            dependencies: ['T005'],
            created: '2026-01-23T10:00:00Z',
          },
          {
            id: 'T008',
            title: 'Write E2E validation tests',
            phase: 4,
            status: 'pending',
            assignee: 'qa-engineer',
            dependencies: ['T007'],
            created: '2026-01-23T11:00:00Z',
          },
        ],
      };

      const context: ValidationContext = {
        projectPath: testDir,
        fileType: 'task-registry',
        filePath: join(testDir, '.planning', 'TASKS.json'),
        data: multiPhaseRegistry,
      };

      const result = await runValidation(context);

      expect(result.valid).toBe(true);
      expect(result.allErrors).toHaveLength(0);
      expect(result.exitCode).toBe(ExitCode.SUCCESS);
    });

    it('should validate plan with dependencies between phases', async () => {
      // Create dependent plan files
      await writePlanFile(testDir, '01-01.plan.json', {
        phase: '01-schema-layer',
        plan: 1,
        wave: 1,
        autonomous: true,
        agent: 'backend-architect',
      });

      await writePlanFile(testDir, '01-02.plan.json', {
        phase: '01-schema-layer',
        plan: 2,
        wave: 2,
        depends_on: ['01-01'], // Depends on first plan
        autonomous: true,
        agent: 'qa-engineer',
      });

      const planPath = join(testDir, '.planning', 'plans', '01-02.plan.json');
      const result = await runValidationOnFile(testDir, planPath, 'plan');

      expect(result.valid).toBe(true);
      expect(result.allErrors).toHaveLength(0);
    });

    it('should handle blocked task correctly', async () => {
      const registryWithBlockedTask = {
        version: '1.0.0',
        project: 'test',
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
            completed: '2026-01-23T11:00:00Z',
          },
          {
            id: 'T002',
            title: 'Blocked task',
            phase: 1,
            status: 'blocked',
            assignee: 'backend-architect',
            dependencies: ['T001'],
            created: '2026-01-23T11:00:00Z',
            blockedBy: 'Waiting for external API access', // Required for blocked status
          },
        ],
      };

      const context: ValidationContext = {
        projectPath: testDir,
        fileType: 'task-registry',
        filePath: join(testDir, '.planning', 'TASKS.json'),
        data: registryWithBlockedTask,
      };

      const result = await runValidation(context);

      expect(result.valid).toBe(true);
      expect(result.allErrors).toHaveLength(0);
    });
  });

  // ==========================================================================
  // Exit Code Tests
  // ==========================================================================

  describe('Exit code handling', () => {
    it('should return VALIDATION_SCHEMA (5) for schema errors', async () => {
      const context: ValidationContext = {
        projectPath: testDir,
        fileType: 'task-registry',
        filePath: join(testDir, '.planning', 'TASKS.json'),
        data: {}, // Missing all required fields
      };

      const result = await runValidation(context);

      expect(result.exitCode).toBe(ExitCode.VALIDATION_SCHEMA);
      expect(result.exitCode).toBe(5);
    });

    it('should return VALIDATION_SEMANTIC (6) for semantic errors', async () => {
      const context: ValidationContext = {
        projectPath: testDir,
        fileType: 'task-registry',
        filePath: join(testDir, '.planning', 'TASKS.json'),
        data: {
          version: '1.0.0',
          project: 'test',
          lastTaskId: 1,
          tasks: [
            {
              id: 'T001',
              title: 'Test',
              phase: -1, // Invalid phase - must be >= 1
              status: 'pending',
              assignee: 'backend-architect',
              dependencies: [],
              created: '2026-01-23T10:00:00Z',
            },
          ],
        },
      };

      const result = await runValidation(context, { stopOnFirstError: false });

      // Schema validates, but semantic layer catches invalid phase
      expect(result.allErrors.some((e) => e.code.startsWith('SEMANTIC'))).toBe(true);
    });

    it('should return VALIDATION_REFERENTIAL (7) for referential errors', async () => {
      const context: ValidationContext = {
        projectPath: testDir,
        fileType: 'task-registry',
        filePath: join(testDir, '.planning', 'TASKS.json'),
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
              assignee: 'backend-architect',
              dependencies: ['T999'], // Non-existent
              created: '2026-01-23T10:00:00Z',
            },
          ],
        },
      };

      const result = await runValidation(context, { stopOnFirstError: false });

      expect(result.exitCode).toBe(ExitCode.VALIDATION_REFERENTIAL);
      expect(result.exitCode).toBe(7);
    });

    it('should return VALIDATION_STATE_MACHINE (8) for state machine errors', async () => {
      const context: ValidationContext = {
        projectPath: testDir,
        fileType: 'task-registry',
        filePath: join(testDir, '.planning', 'TASKS.json'),
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
              assignee: 'backend-architect',
              dependencies: [],
              created: '2026-01-23T10:00:00Z',
            },
            {
              id: 'T002',
              title: 'Completed with pending dependency',
              phase: 1,
              status: 'completed',
              assignee: 'backend-architect',
              dependencies: ['T001'],
              created: '2026-01-23T10:00:00Z',
              completed: '2026-01-23T11:00:00Z',
            },
          ],
        },
      };

      const result = await runValidation(context, { stopOnFirstError: false });

      expect(result.exitCode).toBe(ExitCode.VALIDATION_STATE_MACHINE);
      expect(result.exitCode).toBe(8);
    });

    it('should return SUCCESS (0) when all validations pass', async () => {
      const context: ValidationContext = {
        projectPath: testDir,
        fileType: 'task-registry',
        filePath: join(testDir, '.planning', 'TASKS.json'),
        data: validTasksData,
      };

      const result = await runValidation(context);

      expect(result.exitCode).toBe(ExitCode.SUCCESS);
      expect(result.exitCode).toBe(0);
    });

    it('should return first failing exit code when multiple layers fail', async () => {
      // When stopOnFirstError is false, should still return the first layer's exit code
      const context: ValidationContext = {
        projectPath: testDir,
        fileType: 'task-registry',
        filePath: join(testDir, '.planning', 'TASKS.json'),
        data: {
          version: '1.0.0',
          project: 'test',
          lastTaskId: 99, // Referential error
          tasks: [
            {
              id: 'T001',
              title: 'Test',
              phase: 1,
              status: 'completed',
              assignee: 'backend-architect',
              dependencies: ['T002'], // Missing dependency
              created: '2026-01-23T10:00:00Z',
              completed: '2026-01-23T11:00:00Z',
            },
          ],
        },
      };

      const result = await runValidation(context, { stopOnFirstError: false });

      expect(result.valid).toBe(false);
      // First failing layer determines exit code
      expect([
        ExitCode.VALIDATION_REFERENTIAL,
        ExitCode.VALIDATION_STATE_MACHINE,
      ]).toContain(result.exitCode);
    });
  });

  // ==========================================================================
  // Edge Cases
  // ==========================================================================

  describe('Edge cases', () => {
    it('should handle empty task array', async () => {
      const context: ValidationContext = {
        projectPath: testDir,
        fileType: 'task-registry',
        filePath: join(testDir, '.planning', 'TASKS.json'),
        data: {
          version: '1.0.0',
          project: 'empty-project',
          lastTaskId: 0,
          tasks: [],
        },
      };

      const result = await runValidation(context);

      expect(result.valid).toBe(true);
    });

    it('should handle state with "None" as activeTask', async () => {
      const stateData = {
        currentPosition: {
          phase: 0,
          status: 'planning',
        },
        activeTask: 'None',
        nextSteps: ['Create initial tasks'],
      };

      const context: ValidationContext = {
        projectPath: testDir,
        fileType: 'state',
        filePath: join(testDir, '.planning', 'STATE.json'),
        data: stateData,
      };

      const result = await runValidation(context);

      expect(result.valid).toBe(true);
    });

    it('should handle state with null activeTask', async () => {
      const stateData = {
        currentPosition: {
          phase: 0,
          status: 'planning',
        },
        activeTask: null,
        nextSteps: ['Create initial tasks'],
      };

      const context: ValidationContext = {
        projectPath: testDir,
        fileType: 'state',
        filePath: join(testDir, '.planning', 'STATE.json'),
        data: stateData,
      };

      const result = await runValidation(context);

      expect(result.valid).toBe(true);
    });

    it('should handle plan with no dependencies', async () => {
      const context: ValidationContext = {
        projectPath: testDir,
        fileType: 'plan',
        filePath: join(testDir, '.planning', 'plans', '01-01.plan.json'),
        data: {
          phase: '01-foundation',
          plan: 1,
          wave: 1,
          autonomous: true,
        },
      };

      const result = await runValidation(context);

      expect(result.valid).toBe(true);
    });

    it('should handle very long task titles', async () => {
      const longTitle = 'A'.repeat(200); // Exactly at max length

      const context: ValidationContext = {
        projectPath: testDir,
        fileType: 'task-registry',
        filePath: join(testDir, '.planning', 'TASKS.json'),
        data: {
          version: '1.0.0',
          project: 'test',
          lastTaskId: 1,
          tasks: [
            {
              id: 'T001',
              title: longTitle,
              phase: 1,
              status: 'pending',
              assignee: 'backend-architect',
              dependencies: [],
              created: '2026-01-23T10:00:00Z',
            },
          ],
        },
      };

      const result = await runValidation(context);

      expect(result.valid).toBe(true);
    });

    it('should fail for task title exceeding max length', async () => {
      const tooLongTitle = 'A'.repeat(201); // Exceeds max length of 200

      const context: ValidationContext = {
        projectPath: testDir,
        fileType: 'task-registry',
        filePath: join(testDir, '.planning', 'TASKS.json'),
        data: {
          version: '1.0.0',
          project: 'test',
          lastTaskId: 1,
          tasks: [
            {
              id: 'T001',
              title: tooLongTitle,
              phase: 1,
              status: 'pending',
              assignee: 'backend-architect',
              dependencies: [],
              created: '2026-01-23T10:00:00Z',
            },
          ],
        },
      };

      const result = await runValidation(context);

      expect(result.valid).toBe(false);
      expect(result.exitCode).toBe(ExitCode.VALIDATION_SCHEMA);
    });

    it('should validate completed timestamp is after created timestamp', async () => {
      const context: ValidationContext = {
        projectPath: testDir,
        fileType: 'task-registry',
        filePath: join(testDir, '.planning', 'TASKS.json'),
        data: {
          version: '1.0.0',
          project: 'test',
          lastTaskId: 1,
          tasks: [
            {
              id: 'T001',
              title: 'Test task',
              phase: 1,
              status: 'completed',
              assignee: 'backend-architect',
              dependencies: [],
              created: '2026-01-23T12:00:00Z',
              completed: '2026-01-23T10:00:00Z', // Before created - invalid!
            },
          ],
        },
      };

      const result = await runValidation(context, { stopOnFirstError: false });

      expect(result.valid).toBe(false);
      expect(
        result.allErrors.some((e) => e.code === 'SEMANTIC_INVALID_DATE_ORDER')
      ).toBe(true);
    });
  });

  // ==========================================================================
  // Performance and Timing
  // ==========================================================================

  describe('Performance and timing', () => {
    it('should include duration metadata', async () => {
      const context: ValidationContext = {
        projectPath: testDir,
        fileType: 'task-registry',
        filePath: join(testDir, '.planning', 'TASKS.json'),
        data: validTasksData,
      };

      const result = await runValidation(context);

      expect(result.metadata.durationMs).toBeDefined();
      expect(result.metadata.durationMs).toBeGreaterThanOrEqual(0);
    });

    it('should include duration in each layer result', async () => {
      const context: ValidationContext = {
        projectPath: testDir,
        fileType: 'task-registry',
        filePath: join(testDir, '.planning', 'TASKS.json'),
        data: validTasksData,
      };

      const result = await runValidation(context);

      for (const layerResult of result.layerResults) {
        expect(layerResult.metadata?.durationMs).toBeDefined();
        expect(layerResult.metadata?.durationMs).toBeGreaterThanOrEqual(0);
      }
    });

    it('should complete validation in reasonable time', async () => {
      const context: ValidationContext = {
        projectPath: testDir,
        fileType: 'task-registry',
        filePath: join(testDir, '.planning', 'TASKS.json'),
        data: validTasksData,
      };

      const startTime = Date.now();
      await runValidation(context);
      const elapsed = Date.now() - startTime;

      // Validation should complete in under 1 second
      expect(elapsed).toBeLessThan(1000);
    });
  });
});
