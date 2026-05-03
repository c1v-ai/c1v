/**
 * Decision Matrix Agent Unit Tests — INTAKE_PROMPT_V2 migration coverage
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const mockInvoke = jest.fn();

jest.mock('../../config', () => ({
  createClaudeAgent: jest.fn().mockReturnValue({
    invoke: (...args: unknown[]) => mockInvoke(...args),
  }),
}));

import {
  extractDecisionMatrix,
  buildDecisionMatrixPromptV2,
} from '../decision-matrix-agent';
import { DECISION_MATRIX_RULES } from '../../prompts';

const FIXTURE = {
  performanceCriteria: [],
  alternatives: [],
  recommendation: 'A',
  rationale: '',
};

describe('decision-matrix-agent INTAKE_PROMPT_V2 migration', () => {
  const originalFlag = process.env.INTAKE_PROMPT_V2;

  beforeEach(() => {
    mockInvoke.mockReset();
    mockInvoke.mockResolvedValue(FIXTURE);
  });

  afterEach(() => {
    if (originalFlag === undefined) delete process.env.INTAKE_PROMPT_V2;
    else process.env.INTAKE_PROMPT_V2 = originalFlag;
  });

  describe('flag-off (legacy)', () => {
    beforeEach(() => {
      delete process.env.INTAKE_PROMPT_V2;
    });

    it('uses the legacy decision-matrix prompt body', async () => {
      await extractDecisionMatrix('user: hi', 'P', 'reqs', 'ffbd');
      const promptText = mockInvoke.mock.calls[0][0] as string;
      expect(promptText).toMatch(/trade study/i);
      expect(promptText).toMatch(/MUST define at least 5 performance criteria/);
    });
  });

  describe('flag-on (V2)', () => {
    beforeEach(() => {
      process.env.INTAKE_PROMPT_V2 = 'true';
    });

    it('uses DECISION_MATRIX_RULES from shared prompts module', async () => {
      await extractDecisionMatrix('user: hi', 'P', '', '', {
        extractedData: {},
        projectType: 'saas',
        projectVision: 'V',
      });
      const promptText = mockInvoke.mock.calls[0][0] as string;
      expect(promptText).toContain(DECISION_MATRIX_RULES.split('\n')[0]);
      expect(promptText).toContain('Project Type: saas');
    });

    it('renders (none yet) when extractedData empty', () => {
      const prompt = buildDecisionMatrixPromptV2('user: hi', 'P', {
        extractedData: {},
        projectType: 'saas',
      });
      expect(prompt).toContain('_(none yet)_');
    });

    it('renders NFR + ffbd upstream when populated', () => {
      const prompt = buildDecisionMatrixPromptV2('user: hi', 'P', {
        extractedData: {
          nonFunctionalRequirements: [
            { category: 'performance', requirement: 'p95 < 500ms', priority: 'high' },
          ],
          ffbd: {
            topLevelBlocks: [{ id: 'F.1', name: 'Authenticate', isCoreValue: false }],
          } as never,
        },
        projectType: 'saas',
      });
      expect(prompt).toContain('### Non-Functional Requirements');
      expect(prompt).toContain('### FFBD');
    });

    it('cascade-removal regression', () => {
      const prompt = buildDecisionMatrixPromptV2('user: hi', 'P', {
        extractedData: {},
        projectType: 'saas',
      });
      expect(prompt).not.toMatch(/MUST.*infer/i);
      expect(prompt).not.toMatch(/Do NOT return empty/i);
      expect(prompt).not.toMatch(/REQUIRED.*minimum/i);
      expect(prompt).not.toContain('industry-standard');
    });

    it('replays 10 decision-matrix-intake fixture samples without crash', async () => {
      const datasetPath = path.resolve(
        __dirname,
        '../../../eval/datasets/decision-matrix-intake.jsonl',
      );
      const lines = fs
        .readFileSync(datasetPath, 'utf8')
        .split('\n')
        .filter((l) => l.trim().length > 0);
      expect(lines.length).toBeGreaterThanOrEqual(10);
      for (const line of lines.slice(0, 10)) {
        const sample = JSON.parse(line) as {
          input: { projectIntake?: { project_id?: string; projectType?: string; vision?: string }; upstreamArtifacts?: Record<string, unknown> };
          expected_output: unknown;
        };
        mockInvoke.mockResolvedValueOnce(sample.expected_output);
        const result = await extractDecisionMatrix(
          'user: stub',
          sample.input.projectIntake?.project_id ?? 'P',
          '',
          '',
          {
            extractedData: sample.input.upstreamArtifacts ?? {},
            projectType: sample.input.projectIntake?.projectType ?? null,
            projectVision: sample.input.projectIntake?.vision ?? '',
          },
        );
        expect(result).toBeDefined();
      }
    });
  });
});
