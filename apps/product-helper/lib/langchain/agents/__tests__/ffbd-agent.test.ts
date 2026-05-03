/**
 * FFBD Agent Unit Tests — INTAKE_PROMPT_V2 migration coverage
 *
 * Validates that:
 *   - Flag-off (default) preserves the legacy prompt body byte-for-byte.
 *   - Flag-on uses the V2 phase-staged prompt with FFBD_RULES.
 *   - Cascade-removal regression (no MUST/Do-NOT/industry-standard).
 *   - Empty upstream renders the `(none yet)` fallback.
 *   - Eval fixture replay (10 ffbd-intake samples) does not throw.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const mockInvoke = jest.fn();

jest.mock('../../config', () => ({
  createClaudeAgent: jest.fn().mockReturnValue({
    invoke: (...args: unknown[]) => mockInvoke(...args),
  }),
}));

import { extractFFBD, buildFFBDPromptV2 } from '../ffbd-agent';
import { FFBD_RULES } from '../../prompts';

const FIXTURE = {
  topLevelBlocks: [
    { id: 'F.1', name: 'Authenticate User', isCoreValue: false },
    { id: 'F.2', name: 'Capture Input', isCoreValue: true },
    { id: 'F.3', name: 'Process Request', isCoreValue: false },
    { id: 'F.4', name: 'Persist Result', isCoreValue: false },
    { id: 'F.5', name: 'Notify User', isCoreValue: false },
  ],
  decomposedBlocks: [],
  connections: [],
};

describe('ffbd-agent INTAKE_PROMPT_V2 migration', () => {
  const originalFlag = process.env.INTAKE_PROMPT_V2;

  beforeEach(() => {
    mockInvoke.mockReset();
    mockInvoke.mockResolvedValue(FIXTURE);
  });

  afterEach(() => {
    if (originalFlag === undefined) {
      delete process.env.INTAKE_PROMPT_V2;
    } else {
      process.env.INTAKE_PROMPT_V2 = originalFlag;
    }
  });

  describe('flag-off (legacy)', () => {
    beforeEach(() => {
      delete process.env.INTAKE_PROMPT_V2;
    });

    it('uses the legacy prompt body containing the cascade-style instructions', async () => {
      await extractFFBD('user: hi', 'P', 'V', 'No use cases.', 'No boundaries.');
      expect(mockInvoke).toHaveBeenCalledTimes(1);
      const promptText = mockInvoke.mock.calls[0][0] as string;
      // Legacy template signature
      expect(promptText).toMatch(/Functional Flow Block Diagrams/i);
      expect(promptText).toMatch(/MUST produce at least 5 top-level blocks/);
    });
  });

  describe('flag-on (V2)', () => {
    beforeEach(() => {
      process.env.INTAKE_PROMPT_V2 = 'true';
    });

    it('uses FFBD_RULES from shared prompts module', async () => {
      await extractFFBD('user: hi', 'P', 'V', '', '', {
        extractedData: {},
        projectType: 'saas',
      });
      const promptText = mockInvoke.mock.calls[0][0] as string;
      // The first 80 chars of FFBD_RULES is a stable signature
      const ruleSignature = FFBD_RULES.split('\n')[0];
      expect(promptText).toContain(ruleSignature);
      expect(promptText).toContain('## Project Context');
      expect(promptText).toContain('Project Type: saas');
    });

    it('renders (none yet) when extractedData is empty', () => {
      const prompt = buildFFBDPromptV2('user: hi', 'P', 'V', {
        extractedData: {},
        projectType: 'saas',
      });
      expect(prompt).toContain('_(none yet)_');
    });

    it('renders upstream sections when useCases + systemBoundaries are populated', () => {
      const prompt = buildFFBDPromptV2('user: hi', 'P', 'V', {
        extractedData: {
          useCases: [
            { id: 'UC1', name: 'Sign Up', actor: 'User', description: '' },
          ],
          systemBoundaries: {
            internal: ['api', 'web'],
            external: ['stripe'],
          },
        },
        projectType: 'saas',
      });
      expect(prompt).toContain('### Use Cases');
      expect(prompt).toContain('Sign Up');
      expect(prompt).toContain('[actor: User]');
      expect(prompt).toContain('### System Boundaries');
      expect(prompt).toContain('Internal: api, web');
    });

    it('cascade-removal regression: no MUST/Do-NOT/industry-standard mandates', () => {
      const prompt = buildFFBDPromptV2('user: hi', 'P', 'V', {
        extractedData: {
          useCases: [{ id: 'UC1', name: 'Sign Up', actor: 'User', description: '' }],
          systemBoundaries: { internal: ['api'], external: [] },
          nonFunctionalRequirements: [],
        },
        projectType: 'saas',
      });
      // Note: shared rules use lowercase "must" prose; we forbid the bossy pattern
      expect(prompt).not.toMatch(/MUST.*infer/i);
      expect(prompt).not.toMatch(/Do NOT return empty/i);
      expect(prompt).not.toMatch(/REQUIRED.*minimum/i);
      expect(prompt).not.toContain('industry-standard');
    });

    it('replays 10 ffbd-intake fixture samples without crash', async () => {
      const datasetPath = path.resolve(
        __dirname,
        '../../../eval/datasets/ffbd-intake.jsonl',
      );
      const lines = fs
        .readFileSync(datasetPath, 'utf8')
        .split('\n')
        .filter((l) => l.trim().length > 0);
      expect(lines.length).toBeGreaterThanOrEqual(10);

      for (const line of lines.slice(0, 10)) {
        const sample = JSON.parse(line) as {
          input: {
            projectIntake?: {
              project_id?: string;
              vision?: string;
              projectType?: string;
            };
            upstreamArtifacts?: Record<string, unknown>;
          };
          expected_output: unknown;
        };
        mockInvoke.mockResolvedValueOnce(sample.expected_output);
        const result = await extractFFBD(
          'user: stub',
          sample.input.projectIntake?.project_id ?? 'P',
          sample.input.projectIntake?.vision ?? 'V',
          '',
          '',
          {
            extractedData: sample.input.upstreamArtifacts ?? {},
            projectType: sample.input.projectIntake?.projectType ?? null,
          },
        );
        expect(result).toBeDefined();
      }
    });
  });
});
