/**
 * Tests for the Validation Runner
 */

import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  loadSchemas,
  ExitCode,
  type ValidationContext,
  type FileType,
} from '../../src';
import {
  runValidation,
  runValidationOnFile,
  runProjectValidation,
  runValidationOnFiles,
  runSingleLayer,
  detectFileType,
  getLayerNames,
  isValidLayerName,
  type RunnerOptions,
} from '../../src/layers/runner';

describe('Validation Runner', () => {
  beforeAll(async () => {
    await loadSchemas();
  });

  describe('runValidation', () => {
    describe('successful validation', () => {
      it('should pass all layers for valid task registry data', async () => {
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

        const result = await runValidation(context);

        expect(result.valid).toBe(true);
        expect(result.allErrors).toHaveLength(0);
        expect(result.exitCode).toBe(ExitCode.SUCCESS);
        expect(result.layerResults).toHaveLength(4);
        expect(result.metadata.layersRun).toBe(4);
        expect(result.metadata.stoppedEarly).toBe(false);
        expect(result.metadata.fileType).toBe('task-registry');
        expect(result.metadata.durationMs).toBeGreaterThanOrEqual(0);
      });

      it('should pass all layers for valid state data', async () => {
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

        const result = await runValidation(context);

        expect(result.valid).toBe(true);
        expect(result.allErrors).toHaveLength(0);
        expect(result.exitCode).toBe(ExitCode.SUCCESS);
        expect(result.layerResults).toHaveLength(4);
      });

      it('should pass all layers for valid plan data', async () => {
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

        const result = await runValidation(context);

        expect(result.valid).toBe(true);
        expect(result.allErrors).toHaveLength(0);
        expect(result.exitCode).toBe(ExitCode.SUCCESS);
      });
    });

    describe('failure scenarios', () => {
      it('should stop on schema error by default', async () => {
        const context: ValidationContext = {
          projectPath: '/test/project',
          fileType: 'task-registry',
          filePath: '/test/project/.planning/TASKS.json',
          data: {
            // Missing required fields
          },
        };

        const result = await runValidation(context);

        expect(result.valid).toBe(false);
        expect(result.exitCode).toBe(ExitCode.VALIDATION_SCHEMA);
        expect(result.layerResults).toHaveLength(1);
        expect(result.layerResults[0].layer).toBe('schema');
        expect(result.metadata.stoppedEarly).toBe(true);
        expect(result.metadata.stoppedAtLayer).toBe('schema');
        expect(result.metadata.layersRun).toBe(1);
      });

      it('should continue after error when stopOnFirstError is false', async () => {
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
                title: 'Test task',
                phase: 1,
                status: 'invalid_status', // Semantic error
                assignee: 'backend-architect',
                dependencies: [],
                created: '2026-01-23T10:00:00Z',
              },
            ],
          },
        };

        const options: RunnerOptions = { stopOnFirstError: false };
        const result = await runValidation(context, options);

        expect(result.valid).toBe(false);
        expect(result.layerResults.length).toBeGreaterThan(1);
        expect(result.metadata.stoppedEarly).toBe(false);
      });

      it('should collect errors from all layers when continuing', async () => {
        const context: ValidationContext = {
          projectPath: '/test/project',
          fileType: 'task-registry',
          filePath: '/test/project/.planning/TASKS.json',
          data: {
            version: '1.0.0',
            project: 'test',
            lastTaskId: 5, // Wrong - should be 1
            tasks: [
              {
                id: 'T001',
                title: 'Test task',
                phase: 1,
                status: 'completed',
                assignee: 'backend-architect',
                dependencies: ['T002'], // Doesn't exist - referential error
                created: '2026-01-23T10:00:00Z',
                completed: '2026-01-23T12:00:00Z',
              },
            ],
          },
        };

        const options: RunnerOptions = { stopOnFirstError: false };
        const result = await runValidation(context, options);

        expect(result.valid).toBe(false);
        expect(result.allErrors.length).toBeGreaterThan(0);
        // Should have referential errors
        expect(result.allErrors.some((e) => e.code.startsWith('REFERENTIAL'))).toBe(true);
      });
    });

    describe('layer filtering', () => {
      it('should run only specified layers', async () => {
        const context: ValidationContext = {
          projectPath: '/test/project',
          fileType: 'task-registry',
          filePath: '/test/project/.planning/TASKS.json',
          data: {
            version: '1.0.0',
            project: 'test-project',
            lastTaskId: 1,
            tasks: [
              {
                id: 'T001',
                title: 'First task',
                phase: 1,
                status: 'pending',
                assignee: 'backend-architect',
                dependencies: [],
                created: '2026-01-23T10:00:00Z',
              },
            ],
          },
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
      });

      it('should run layers in correct order regardless of option order', async () => {
        const context: ValidationContext = {
          projectPath: '/test/project',
          fileType: 'task-registry',
          filePath: '/test/project/.planning/TASKS.json',
          data: {
            version: '1.0.0',
            project: 'test-project',
            lastTaskId: 1,
            tasks: [
              {
                id: 'T001',
                title: 'First task',
                phase: 1,
                status: 'pending',
                assignee: 'backend-architect',
                dependencies: [],
                created: '2026-01-23T10:00:00Z',
              },
            ],
          },
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
    });

    describe('warnings', () => {
      it('should collect warnings even when valid', async () => {
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
              // Skip phase 2 - creates a warning about phase gaps
              {
                id: 'T002',
                title: 'Second task',
                phase: 3,
                status: 'pending',
                assignee: 'backend-architect',
                dependencies: [],
                created: '2026-01-23T13:00:00Z',
              },
            ],
          },
        };

        const result = await runValidation(context);

        expect(result.valid).toBe(true);
        expect(result.allWarnings.length).toBeGreaterThan(0);
      });
    });
  });

  describe('runSingleLayer', () => {
    it('should run only the specified layer', async () => {
      const context: ValidationContext = {
        projectPath: '/test/project',
        fileType: 'task-registry',
        filePath: '/test/project/.planning/TASKS.json',
        data: {
          version: '1.0.0',
          project: 'test-project',
          lastTaskId: 1,
          tasks: [
            {
              id: 'T001',
              title: 'First task',
              phase: 1,
              status: 'pending',
              assignee: 'backend-architect',
              dependencies: [],
              created: '2026-01-23T10:00:00Z',
            },
          ],
        },
      };

      const result = await runSingleLayer('schema', context);

      expect(result.layer).toBe('schema');
      expect(result.valid).toBe(true);
    });

    it('should throw for unknown layer name', async () => {
      const context: ValidationContext = {
        projectPath: '/test/project',
        fileType: 'state',
        filePath: '/test/project/.planning/STATE.json',
        data: {},
      };

      await expect(runSingleLayer('unknown' as any, context)).rejects.toThrow('Unknown layer');
    });
  });

  describe('detectFileType', () => {
    it('should detect state files', () => {
      expect(detectFileType('/path/to/STATE.json')).toBe('state');
      expect(detectFileType('/path/to/STATE.md')).toBe('state');
      expect(detectFileType('/path/to/.planning/state.json')).toBe('state');
    });

    it('should detect task registry files', () => {
      expect(detectFileType('/path/to/TASKS.json')).toBe('task-registry');
      expect(detectFileType('/path/to/.planning/tasks.json')).toBe('task-registry');
    });

    it('should detect plan files', () => {
      expect(detectFileType('/path/to/01-test.plan.md')).toBe('plan');
      expect(detectFileType('/path/to/plans/03-01.plan.json')).toBe('plan');
    });

    it('should return undefined for unknown files', () => {
      expect(detectFileType('/path/to/unknown.json')).toBeUndefined();
      expect(detectFileType('/path/to/README.md')).toBeUndefined();
    });
  });

  describe('getLayerNames', () => {
    it('should return all layer names in order', () => {
      const names = getLayerNames();

      expect(names).toEqual(['schema', 'semantic', 'referential', 'state-machine']);
    });
  });

  describe('isValidLayerName', () => {
    it('should return true for valid layer names', () => {
      expect(isValidLayerName('schema')).toBe(true);
      expect(isValidLayerName('semantic')).toBe(true);
      expect(isValidLayerName('referential')).toBe(true);
      expect(isValidLayerName('state-machine')).toBe(true);
    });

    it('should return false for invalid layer names', () => {
      expect(isValidLayerName('unknown')).toBe(false);
      expect(isValidLayerName('')).toBe(false);
      expect(isValidLayerName('Schema')).toBe(false);
    });
  });

  describe('file operations', () => {
    let tempDir: string;

    beforeEach(async () => {
      tempDir = await fs.mkdtemp(join(tmpdir(), 'cleo-test-'));
      await fs.mkdir(join(tempDir, '.planning'), { recursive: true });
      await fs.mkdir(join(tempDir, '.planning', 'plans'), { recursive: true });
    });

    afterEach(async () => {
      await fs.rm(tempDir, { recursive: true, force: true });
    });

    describe('runValidationOnFile', () => {
      it('should validate a file from disk', async () => {
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
              created: '2026-01-23T10:00:00Z',
            },
          ],
        };

        const tasksPath = join(tempDir, '.planning', 'TASKS.json');
        await fs.writeFile(tasksPath, JSON.stringify(tasksData, null, 2));

        const result = await runValidationOnFile(tempDir, tasksPath);

        expect(result.valid).toBe(true);
        expect(result.filePath).toBe(tasksPath);
        expect(result.fileType).toBe('task-registry');
      });

      it('should return error for non-existent file', async () => {
        const fakePath = join(tempDir, '.planning', 'NONEXISTENT.json');

        const result = await runValidationOnFile(tempDir, fakePath, 'task-registry');

        expect(result.valid).toBe(false);
        expect(result.allErrors[0].code).toBe('RUNNER_FILE_READ_ERROR');
      });

      it('should return error for invalid JSON', async () => {
        const badJsonPath = join(tempDir, '.planning', 'TASKS.json');
        await fs.writeFile(badJsonPath, '{ invalid json }');

        const result = await runValidationOnFile(tempDir, badJsonPath, 'task-registry');

        expect(result.valid).toBe(false);
        expect(result.allErrors[0].code).toBe('RUNNER_PARSE_ERROR');
      });

      it('should return error for unknown file type', async () => {
        const unknownPath = join(tempDir, 'unknown.txt');
        await fs.writeFile(unknownPath, '{}');

        const result = await runValidationOnFile(tempDir, unknownPath);

        expect(result.valid).toBe(false);
        expect(result.allErrors[0].code).toBe('RUNNER_UNKNOWN_FILE_TYPE');
        expect(result.exitCode).toBe(ExitCode.INVALID_ARGUMENTS);
      });
    });

    describe('runProjectValidation', () => {
      it('should validate all project files', async () => {
        // Create STATE.json
        const stateData = {
          currentPosition: { phase: 1, status: 'executing' },
          nextSteps: ['Complete T001'],
        };
        await fs.writeFile(
          join(tempDir, '.planning', 'STATE.json'),
          JSON.stringify(stateData, null, 2)
        );

        // Create TASKS.json
        const tasksData = {
          version: '1.0.0',
          project: 'test-project',
          lastTaskId: 1,
          tasks: [
            {
              id: 'T001',
              title: 'Test task',
              phase: 1,
              status: 'in_progress',
              assignee: 'backend-architect',
              dependencies: [],
              created: '2026-01-23T10:00:00Z',
            },
          ],
        };
        await fs.writeFile(
          join(tempDir, '.planning', 'TASKS.json'),
          JSON.stringify(tasksData, null, 2)
        );

        const result = await runProjectValidation(tempDir);

        expect(result.overall.valid).toBe(true);
        expect(result.overall.filesValidated).toBe(2);
        expect(result.state).toBeDefined();
        expect(result.tasks).toBeDefined();
        expect(result.state?.valid).toBe(true);
        expect(result.tasks?.valid).toBe(true);
      });

      it('should handle missing planning directory gracefully', async () => {
        const emptyDir = await fs.mkdtemp(join(tmpdir(), 'cleo-empty-'));

        try {
          const result = await runProjectValidation(emptyDir);

          expect(result.overall.valid).toBe(true); // No errors if no files exist
          expect(result.overall.filesValidated).toBe(0);
        } finally {
          await fs.rm(emptyDir, { recursive: true, force: true });
        }
      });

      it('should track errors across files', async () => {
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

        const result = await runProjectValidation(tempDir);

        expect(result.overall.valid).toBe(false);
        expect(result.overall.errorCount).toBeGreaterThan(0);
        expect(result.tasks?.valid).toBe(false);
      });
    });

    describe('runValidationOnFiles', () => {
      it('should validate multiple files in parallel', async () => {
        // Create STATE.json
        const stateData = {
          currentPosition: { phase: 1, status: 'executing' },
          nextSteps: ['Test'],
        };
        const statePath = join(tempDir, '.planning', 'STATE.json');
        await fs.writeFile(statePath, JSON.stringify(stateData, null, 2));

        // Create TASKS.json
        const tasksData = {
          version: '1.0.0',
          project: 'test',
          lastTaskId: 1,
          tasks: [
            {
              id: 'T001',
              title: 'Task',
              phase: 1,
              status: 'pending',
              assignee: 'backend-architect',
              dependencies: [],
              created: '2026-01-23T10:00:00Z',
            },
          ],
        };
        const tasksPath = join(tempDir, '.planning', 'TASKS.json');
        await fs.writeFile(tasksPath, JSON.stringify(tasksData, null, 2));

        const results = await runValidationOnFiles([statePath, tasksPath], tempDir);

        expect(results).toHaveLength(2);
        expect(results[0].valid).toBe(true);
        expect(results[0].filePath).toBe(statePath);
        expect(results[1].valid).toBe(true);
        expect(results[1].filePath).toBe(tasksPath);
      });
    });
  });

  describe('exit code handling', () => {
    it('should return first failing exit code', async () => {
      const context: ValidationContext = {
        projectPath: '/test/project',
        fileType: 'task-registry',
        filePath: '/test/project/.planning/TASKS.json',
        data: {
          // Empty - schema error
        },
      };

      const result = await runValidation(context);

      expect(result.exitCode).toBe(ExitCode.VALIDATION_SCHEMA);
    });

    it('should return SUCCESS when all layers pass', async () => {
      const context: ValidationContext = {
        projectPath: '/test/project',
        fileType: 'state',
        filePath: '/test/project/.planning/STATE.json',
        data: {
          currentPosition: { phase: 1, status: 'executing' },
          nextSteps: ['Test'],
        },
      };

      const result = await runValidation(context);

      expect(result.exitCode).toBe(ExitCode.SUCCESS);
    });
  });
});
