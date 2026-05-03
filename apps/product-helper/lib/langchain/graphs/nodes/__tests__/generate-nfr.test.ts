/**
 * generate-nfr runLlmOnly path — INTAKE_PROMPT_V2 migration coverage
 *
 * Tests the LLM-only impl + the V2 prompt-context injection. The engine-first
 * impl is decoupled (Wave-B substrate swap) and not covered here.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

jest.mock('@/lib/observability/synthesis-metrics', () => ({
  recordSynthesisMetricsTotal: jest.fn(),
}));

// Mock the engine substrate to avoid pulling in audit-writer → drizzle → postgres-js
// at module load time (the test recipe uses POSTGRES_URL=stub which fails parseUrl).
jest.mock('../_engine-substrate', () => ({
  evaluateEngineStory: jest.fn(),
}));

import {
  createGenerateNfrNode,
  buildNfrPromptContextV2,
  type GenerateNfrLlmAgent,
} from '../generate-nfr';
import { NFR_RULES } from '../../../prompts';
import type { IntakeState } from '../../types';

function makeState(overrides: Partial<IntakeState> = {}): IntakeState {
  return {
    projectId: 1,
    projectName: 'P',
    projectVision: 'V',
    projectType: 'saas',
    messages: [],
    extractedData: {
      actors: [],
      useCases: [],
      systemBoundaries: { internal: [], external: [] },
      dataEntities: [],
      problemStatement: { summary: '', context: '', impact: '', goals: [] },
      goalsMetrics: [],
      nonFunctionalRequirements: [],
    },
    ...overrides,
  } as IntakeState;
}

describe('generate-nfr runLlmOnly INTAKE_PROMPT_V2 migration', () => {
  const originalFlag = process.env.INTAKE_PROMPT_V2;

  afterEach(() => {
    if (originalFlag === undefined) delete process.env.INTAKE_PROMPT_V2;
    else process.env.INTAKE_PROMPT_V2 = originalFlag;
  });

  describe('flag-off (legacy)', () => {
    beforeEach(() => {
      delete process.env.INTAKE_PROMPT_V2;
    });

    it('does not pass a promptContext to the injected agent', async () => {
      const seen: Array<string | undefined> = [];
      const agent: GenerateNfrLlmAgent = {
        generate: async (_s, ctx) => {
          seen.push(ctx);
          return { nfrs: [] };
        },
      };
      const node = createGenerateNfrNode({ nfrImpl: 'llm', llmAgent: agent });
      await node(makeState());
      expect(seen).toEqual([undefined]);
    });
  });

  describe('flag-on (V2)', () => {
    beforeEach(() => {
      process.env.INTAKE_PROMPT_V2 = 'true';
    });

    it('passes a promptContext containing NFR_RULES to the injected agent', async () => {
      const seen: Array<string | undefined> = [];
      const agent: GenerateNfrLlmAgent = {
        generate: async (_s, ctx) => {
          seen.push(ctx);
          return { nfrs: [] };
        },
      };
      const node = createGenerateNfrNode({ nfrImpl: 'llm', llmAgent: agent });
      await node(makeState());
      expect(seen).toHaveLength(1);
      expect(seen[0]).toBeDefined();
      expect(seen[0]).toContain(NFR_RULES.split('\n')[0]);
    });

    it('renders (none yet) when extractedData is empty', () => {
      const ctx = buildNfrPromptContextV2(
        makeState({
          extractedData: {
            actors: [],
            useCases: [],
            systemBoundaries: { internal: [], external: [] },
            dataEntities: [],
            problemStatement: { summary: '', context: '', impact: '', goals: [] },
            goalsMetrics: [],
            nonFunctionalRequirements: [],
          },
        }),
      );
      expect(ctx).toContain('_(none yet)_');
      expect(ctx).toContain('Project Type: saas');
    });

    it('renders actors + useCases + systemBoundaries + ffbd upstream when populated', () => {
      const ctx = buildNfrPromptContextV2(
        makeState({
          extractedData: {
            actors: [{ name: 'User', role: 'Primary', description: '' }],
            useCases: [
              { id: 'UC1', name: 'Sign Up', actor: 'User', description: '' },
            ],
            systemBoundaries: { internal: ['api'], external: ['stripe'] },
            dataEntities: [],
            problemStatement: { summary: '', context: '', impact: '', goals: [] },
            goalsMetrics: [],
            nonFunctionalRequirements: [],
            ffbd: {
              topLevelBlocks: [{ id: 'F.1', name: 'Authenticate', isCoreValue: false }],
            } as never,
          },
        }),
      );
      expect(ctx).toContain('### Actors');
      expect(ctx).toContain('### Use Cases');
      expect(ctx).toContain('### System Boundaries');
      expect(ctx).toContain('### FFBD');
    });

    it('cascade-removal regression', () => {
      const ctx = buildNfrPromptContextV2(makeState());
      expect(ctx).not.toMatch(/MUST.*infer/i);
      expect(ctx).not.toMatch(/Do NOT return empty/i);
      expect(ctx).not.toMatch(/REQUIRED.*minimum/i);
      expect(ctx).not.toContain('industry-standard');
    });

    it('replays 10 nfr-runllmonly fixture samples without crash', async () => {
      const datasetPath = path.resolve(
        __dirname,
        '../../../../eval/datasets/nfr-runllmonly.jsonl',
      );
      const lines = fs
        .readFileSync(datasetPath, 'utf8')
        .split('\n')
        .filter((l) => l.trim().length > 0);
      expect(lines.length).toBeGreaterThanOrEqual(10);
      for (const line of lines.slice(0, 10)) {
        const sample = JSON.parse(line) as {
          input: {
            projectIntake?: { project_id?: string; projectType?: string; vision?: string };
            upstreamArtifacts?: Record<string, unknown>;
          };
          expected_output: { nfrs?: unknown[]; constants?: unknown[] };
        };
        const agent: GenerateNfrLlmAgent = {
          generate: async () => ({
            nfrs: sample.expected_output?.nfrs ?? [],
            constants: sample.expected_output?.constants,
          }),
        };
        const node = createGenerateNfrNode({ nfrImpl: 'llm', llmAgent: agent });
        const result = await node(
          makeState({
            projectName: sample.input.projectIntake?.project_id ?? 'P',
            projectVision: sample.input.projectIntake?.vision ?? 'V',
            projectType: sample.input.projectIntake?.projectType ?? 'saas',
            extractedData: {
              ...(sample.input.upstreamArtifacts ?? {}),
              actors: [],
              useCases: [],
              systemBoundaries: { internal: [], external: [] },
              dataEntities: [],
              problemStatement: { summary: '', context: '', impact: '', goals: [] },
              goalsMetrics: [],
              nonFunctionalRequirements: [],
            } as never,
          }),
        );
        expect(result.nfrEnvelope).toBeDefined();
      }
    });
  });
});
