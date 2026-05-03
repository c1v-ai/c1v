/**
 * QFD Agent Unit Tests — INTAKE_PROMPT_V2 migration coverage
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const mockInvoke = jest.fn();

jest.mock('../../config', () => ({
  createClaudeAgent: jest.fn().mockReturnValue({
    invoke: (...args: unknown[]) => mockInvoke(...args),
  }),
}));

import { extractQFD, buildQFDPromptV2 } from '../qfd-agent';
import { QFD_RULES } from '../../prompts';

const FIXTURE = {
  customerNeeds: [
    { id: 'CN-01', need: 'Fast response', importanceWeight: 0.5 },
    { id: 'CN-02', need: 'Easy to use', importanceWeight: 0.5 },
  ],
  engineeringCharacteristics: [
    {
      id: 'EC-01',
      name: 'Latency',
      unit: 'ms',
      direction: 'lower',
      target: '<500',
      technicalDifficulty: 3,
      estimatedCost: 3,
    },
  ],
  relationshipMatrix: [],
  correlationRoof: [],
  competitors: [],
};

describe('qfd-agent INTAKE_PROMPT_V2 migration', () => {
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

    it('uses the legacy QFD prompt body', async () => {
      await extractQFD('user: hi', 'P', 'needs', 'criteria');
      const promptText = mockInvoke.mock.calls[0][0] as string;
      expect(promptText).toMatch(/Quality Function Deployment/i);
      expect(promptText).toMatch(/MUST produce at least 5 customer needs/);
    });
  });

  describe('flag-on (V2)', () => {
    beforeEach(() => {
      process.env.INTAKE_PROMPT_V2 = 'true';
    });

    it('uses QFD_RULES from shared prompts module', async () => {
      await extractQFD('user: hi', 'P', '', '', {
        extractedData: {},
        projectType: 'saas',
        projectVision: 'V',
      });
      const promptText = mockInvoke.mock.calls[0][0] as string;
      expect(promptText).toContain(QFD_RULES.split('\n')[0]);
      expect(promptText).toContain('Project Type: saas');
    });

    it('renders (none yet) when extractedData empty', () => {
      const prompt = buildQFDPromptV2('user: hi', 'P', {
        extractedData: {},
        projectType: 'saas',
      });
      expect(prompt).toContain('_(none yet)_');
    });

    it('renders NFR + ffbd upstream sections when populated', () => {
      const prompt = buildQFDPromptV2('user: hi', 'P', {
        extractedData: {
          nonFunctionalRequirements: [
            {
              category: 'performance',
              requirement: 'p95 < 500ms',
              priority: 'high',
            },
          ],
          ffbd: {
            topLevelBlocks: [{ id: 'F.1', name: 'Authenticate', isCoreValue: false }],
          } as never,
        },
        projectType: 'saas',
      });
      expect(prompt).toContain('### Non-Functional Requirements');
      expect(prompt).toContain('p95 < 500ms');
      expect(prompt).toContain('### FFBD');
      expect(prompt).toContain('Authenticate');
    });

    it('cascade-removal regression', () => {
      const prompt = buildQFDPromptV2('user: hi', 'P', {
        extractedData: {},
        projectType: 'saas',
      });
      expect(prompt).not.toMatch(/MUST.*infer/i);
      expect(prompt).not.toMatch(/Do NOT return empty/i);
      expect(prompt).not.toMatch(/REQUIRED.*minimum/i);
      expect(prompt).not.toContain('industry-standard');
    });

    it('replays 10 qfd-intake fixture samples without crash', async () => {
      const datasetPath = path.resolve(
        __dirname,
        '../../../eval/datasets/qfd-intake.jsonl',
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
        const result = await extractQFD(
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
