/**
 * Interfaces Agent Unit Tests — INTAKE_PROMPT_V2 migration coverage
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const mockInvoke = jest.fn();

jest.mock('../../config', () => ({
  createClaudeAgent: jest.fn().mockReturnValue({
    invoke: (...args: unknown[]) => mockInvoke(...args),
  }),
}));

import { extractInterfaces, buildInterfacesPromptV2 } from '../interfaces-agent';
import { INTERFACES_RULES } from '../../prompts';

const FIXTURE = {
  subsystems: [
    { id: 'SS1', name: 'Auth', description: 'auth', allocatedFunctions: ['F.1'] },
    { id: 'SS2', name: 'Core', description: 'core', allocatedFunctions: ['F.2'] },
    { id: 'SS3', name: 'Data', description: 'data', allocatedFunctions: ['F.3'] },
  ],
  interfaces: [],
  n2Chart: {},
};

describe('interfaces-agent INTAKE_PROMPT_V2 migration', () => {
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

    it('uses the legacy interfaces prompt body', async () => {
      await extractInterfaces('user: hi', 'P', 'ffbd', 'ucs');
      const promptText = mockInvoke.mock.calls[0][0] as string;
      expect(promptText).toMatch(/N2 charts/i);
      expect(promptText).toMatch(/MUST produce at least 5 interfaces/);
    });
  });

  describe('flag-on (V2)', () => {
    beforeEach(() => {
      process.env.INTAKE_PROMPT_V2 = 'true';
    });

    it('uses INTERFACES_RULES from shared prompts module', async () => {
      await extractInterfaces('user: hi', 'P', '', '', {
        extractedData: {},
        projectType: 'saas',
        projectVision: 'V',
      });
      const promptText = mockInvoke.mock.calls[0][0] as string;
      expect(promptText).toContain(INTERFACES_RULES.split('\n')[0]);
      expect(promptText).toContain('Project Type: saas');
    });

    it('renders (none yet) when extractedData empty', () => {
      const prompt = buildInterfacesPromptV2('user: hi', 'P', {
        extractedData: {},
        projectType: 'saas',
      });
      expect(prompt).toContain('_(none yet)_');
    });

    it('renders ffbd + decisionMatrix upstream when populated', () => {
      const prompt = buildInterfacesPromptV2('user: hi', 'P', {
        extractedData: {
          ffbd: {
            topLevelBlocks: [{ id: 'F.1', name: 'Authenticate', isCoreValue: false }],
          } as never,
          decisionMatrix: {
            recommendation: 'Postgres',
            alternatives: [{ name: 'MySQL' }, { name: 'Mongo' }],
          } as never,
        },
        projectType: 'saas',
      });
      expect(prompt).toContain('### FFBD');
      expect(prompt).toContain('Authenticate');
      expect(prompt).toContain('### Decision Matrix');
      expect(prompt).toContain('Recommended: Postgres');
    });

    it('cascade-removal regression', () => {
      const prompt = buildInterfacesPromptV2('user: hi', 'P', {
        extractedData: {},
        projectType: 'saas',
      });
      expect(prompt).not.toMatch(/MUST.*infer/i);
      expect(prompt).not.toMatch(/Do NOT return empty/i);
      expect(prompt).not.toMatch(/REQUIRED.*minimum/i);
      expect(prompt).not.toContain('industry-standard');
    });

    it('replays 10 interfaces-intake fixture samples without crash', async () => {
      const datasetPath = path.resolve(
        __dirname,
        '../../../eval/datasets/interfaces-intake.jsonl',
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
        const result = await extractInterfaces(
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
