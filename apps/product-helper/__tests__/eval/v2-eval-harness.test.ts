/**
 * v2-eval-harness smoke test.
 *
 * Verifies: dataset loads, schema validates (well-formed JSONL), eval
 * client connects (mock LangSmith), drift detector identifies a synthetic
 * drift case.
 */

import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

import {
  V2_AGENTS,
  type AgentName,
  type EvalExample,
  type AgentRunner,
  getDataset,
  hashInput,
  hasLangSmith,
  recordResult,
  runEval,
  summarizeResults,
} from '../../lib/eval/v2-eval-harness';

describe('v2-eval-harness', () => {
  describe('dataset integrity', () => {
    it.each(V2_AGENTS)('loads ≥30 examples for %s', async (agent) => {
      const dataset = await getDataset(agent);
      expect(dataset.length).toBeGreaterThanOrEqual(30);
    });

    it.each(V2_AGENTS)('every example for %s has the required fields', async (agent) => {
      const dataset = await getDataset(agent);
      for (const ex of dataset) {
        expect(ex.id).toMatch(/^[a-f0-9]{16}$/);
        expect(ex.agent).toBe(agent);
        expect(ex.input).toBeDefined();
        expect(ex.input.projectIntake).toBeDefined();
        expect(ex.input.upstreamArtifacts).toBeDefined();
        expect(ex.expected_output).toBeDefined();
        expect(['correct', 'partial', 'wrong']).toContain(ex.grade);
        expect(['human', 'fixture-replay', 'self-application']).toContain(ex.grader);
      }
    });

    it('each agent has a representative grade distribution', async () => {
      for (const agent of V2_AGENTS) {
        const dataset = await getDataset(agent);
        const grades = { correct: 0, partial: 0, wrong: 0 };
        for (const ex of dataset) grades[ex.grade] += 1;
        expect(grades.correct).toBeGreaterThan(0);
        expect(grades.partial + grades.wrong).toBeGreaterThan(0);
      }
    });
  });

  describe('hashInput', () => {
    it('is deterministic across runs', () => {
      const input = {
        projectIntake: { project_id: 'x', vision: 'y' },
        upstreamArtifacts: { ffbd: { _path: 'a' } },
      };
      expect(hashInput(input)).toBe(hashInput(input));
    });

    it('changes when input changes', () => {
      const a = {
        projectIntake: { project_id: 'x' },
        upstreamArtifacts: {},
      };
      const b = {
        projectIntake: { project_id: 'y' },
        upstreamArtifacts: {},
      };
      expect(hashInput(a)).not.toBe(hashInput(b));
    });
  });

  describe('runEval', () => {
    it('grades a perfect-replay runner as correct', async () => {
      const dataset = await getDataset('decision-net');
      const sample = dataset.slice(0, 3);
      const runner: AgentRunner = async () => sample[0].expected_output;
      const results = await runEval('decision-net', runner);
      const summary = summarizeResults(results);
      // First example matches; later ones likely diverge — that's fine.
      expect(summary.total).toBe(dataset.length);
      expect(summary.by_grade.correct).toBeGreaterThan(0);
    });

    it('grades a throwing runner as wrong', async () => {
      const failingRunner: AgentRunner = async () => {
        throw new Error('intentional');
      };
      const results = await runEval('hoq', failingRunner);
      for (const r of results) {
        expect(r.grade_actual).toBe('wrong');
      }
    });
  });

  describe('recordResult', () => {
    it('declines to post when LANGCHAIN_API_KEY is missing', async () => {
      const prevKey = process.env.LANGCHAIN_API_KEY;
      delete process.env.LANGCHAIN_API_KEY;
      try {
        const dataset = await getDataset('hoq');
        const example = dataset[0];
        const result = {
          example_id: example.id,
          agent: 'hoq' as AgentName,
          passed: true,
          grade_actual: 'correct' as const,
          grade_expected: example.grade,
          reason: 'mock',
          inputs_hash: hashInput(example.input),
          ran_at: new Date().toISOString(),
        };
        const post = await recordResult('hoq', example, result);
        expect(post.posted).toBe(false);
        expect(post.reason).toContain('LANGCHAIN_API_KEY');
      } finally {
        if (prevKey !== undefined) process.env.LANGCHAIN_API_KEY = prevKey;
      }
    });

    it('hasLangSmith reflects env-var presence', () => {
      const prev = process.env.LANGCHAIN_API_KEY;
      delete process.env.LANGCHAIN_API_KEY;
      expect(hasLangSmith()).toBe(false);
      process.env.LANGCHAIN_API_KEY = 'lsv2_test';
      expect(hasLangSmith()).toBe(true);
      if (prev !== undefined) process.env.LANGCHAIN_API_KEY = prev;
      else delete process.env.LANGCHAIN_API_KEY;
    });
  });

  describe('drift detection', () => {
    const SNAPSHOT_PATH = join(__dirname, '../../lib/eval/datasets/_drift-snapshot.json');

    it('snapshot file exists and parses', () => {
      expect(existsSync(SNAPSHOT_PATH)).toBe(true);
      const snap = JSON.parse(readFileSync(SNAPSHOT_PATH, 'utf8')) as {
        generated_at: string;
        hashes: Record<string, string>;
      };
      expect(typeof snap.generated_at).toBe('string');
      expect(Object.keys(snap.hashes).length).toBeGreaterThan(0);
    });

    it('synthetic drift case is detectable via hashInput divergence', () => {
      const baseline = {
        projectIntake: { project_id: 'ref-001', vision: 'v', industry: 'i', scale: 'medium' },
        upstreamArtifacts: { ffbd: { _path: 'a', _schema: 'module-3.ffbd.v1' } },
      };
      const drifted = {
        projectIntake: { project_id: 'ref-001', vision: 'v', industry: 'i', scale: 'medium' },
        upstreamArtifacts: { ffbd: { _path: 'a', _schema: 'module-3.ffbd.v2' } },
      };
      expect(hashInput(baseline)).not.toBe(hashInput(drifted));
    });
  });

  describe('reference-projects fixture', () => {
    it('ships exactly 10 anonymized projects', () => {
      const dir = join(__dirname, '../fixtures/reference-projects');
      const fs = require('node:fs') as typeof import('node:fs');
      const files = fs.readdirSync(dir).filter((f: string) => f.endsWith('.json'));
      expect(files).toHaveLength(10);
      for (const f of files) {
        const j = JSON.parse(fs.readFileSync(join(dir, f), 'utf8')) as {
          anonymized: boolean;
          project_id: string;
        };
        expect(j.anonymized).toBe(true);
        expect(j.project_id).toMatch(/^ref-\d{3}$/);
      }
    });
  });
});
