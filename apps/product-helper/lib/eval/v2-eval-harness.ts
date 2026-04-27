/**
 * v2 eval harness — LangSmith dataset client + per-agent evaluator runners.
 *
 * Powers EC-V21-C.4 (per-rule confidence-drift quality gate, Wave E) and
 * EC-V21-C.6 (quarterly schema-drift check). Designed to run locally
 * without `LANGCHAIN_API_KEY` — when the key is absent the harness falls
 * back to fixture-replay-only mode and never hits the network.
 *
 * Dataset shape (one JSONL line per example):
 *   {
 *     id: string,                  // stable hash of input
 *     agent: AgentName,
 *     input: { projectIntake, upstreamArtifacts },
 *     expected_output: <agent emission>,
 *     grade: 'correct' | 'partial' | 'wrong',
 *     graded_at: ISO-timestamp,
 *     grader: 'human' | 'fixture-replay' | 'self-application',
 *     metadata?: { judge_model?, judge_prompt?, source? }
 *   }
 *
 * @module lib/eval/v2-eval-harness
 */

import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

export const V2_AGENTS = [
  'decision-net',
  'form-function',
  'hoq',
  'fmea-early',
  'fmea-residual',
  'interface-specs',
  'n2',
  'data-flows',
  'nfr-resynth',
  'architecture-recommendation',
] as const;

export type AgentName = (typeof V2_AGENTS)[number];

export type Grade = 'correct' | 'partial' | 'wrong';

export type GraderKind = 'human' | 'fixture-replay' | 'self-application';

export interface EvalExample {
  id: string;
  agent: AgentName;
  input: {
    projectIntake: Record<string, unknown>;
    upstreamArtifacts: Record<string, unknown>;
  };
  expected_output: Record<string, unknown>;
  grade: Grade;
  graded_at: string;
  grader: GraderKind;
  metadata?: {
    judge_model?: string;
    judge_prompt?: string;
    source?: string;
    notes?: string;
  };
}

export interface EvalResult {
  example_id: string;
  agent: AgentName;
  passed: boolean;
  grade_actual: Grade;
  grade_expected: Grade;
  reason: string;
  inputs_hash: string;
  ran_at: string;
}

const DATASETS_DIR = join(__dirname, 'datasets');

const LANGSMITH_API = 'https://api.smith.langchain.com';
const PROJECT_NAME = process.env.LANGCHAIN_PROJECT ?? 'c1v-v2-eval';

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(',')}}`;
}

export function hashInput(input: EvalExample['input']): string {
  return createHash('sha256')
    .update(stableStringify(input))
    .digest('hex')
    .slice(0, 16);
}

export function hasLangSmith(): boolean {
  return Boolean(process.env.LANGCHAIN_API_KEY);
}

export async function getDataset(agent: AgentName): Promise<EvalExample[]> {
  const path = join(DATASETS_DIR, `${agent}.jsonl`);
  if (!existsSync(path)) return [];
  const raw = await readFile(path, 'utf8');
  const lines = raw.split('\n').filter((l) => l.trim().length > 0);
  return lines.map((line, idx) => {
    try {
      return JSON.parse(line) as EvalExample;
    } catch (err) {
      throw new Error(
        `Failed to parse ${agent}.jsonl line ${idx + 1}: ${(err as Error).message}`,
      );
    }
  });
}

export async function appendToDataset(
  agent: AgentName,
  example: EvalExample,
): Promise<void> {
  const path = join(DATASETS_DIR, `${agent}.jsonl`);
  const existing = existsSync(path) ? await readFile(path, 'utf8') : '';
  const sep = existing.length > 0 && !existing.endsWith('\n') ? '\n' : '';
  await writeFile(path, `${existing}${sep}${JSON.stringify(example)}\n`, 'utf8');
}

export interface AgentRunner {
  (input: EvalExample['input']): Promise<Record<string, unknown>>;
}

export async function runEval(
  agent: AgentName,
  runner: AgentRunner,
): Promise<EvalResult[]> {
  const dataset = await getDataset(agent);
  const results: EvalResult[] = [];
  for (const ex of dataset) {
    const ranAt = new Date().toISOString();
    let actual: Record<string, unknown> | null = null;
    let runError: Error | null = null;
    try {
      actual = await runner(ex.input);
    } catch (err) {
      runError = err as Error;
    }

    const grade = scoreOutput(ex.expected_output, actual, runError);
    const passed = grade === ex.grade;
    results.push({
      example_id: ex.id,
      agent,
      passed,
      grade_actual: grade,
      grade_expected: ex.grade,
      reason: runError
        ? `runner threw: ${runError.message}`
        : describeGrade(grade, ex.expected_output, actual),
      inputs_hash: hashInput(ex.input),
      ran_at: ranAt,
    });
  }
  return results;
}

function scoreOutput(
  expected: Record<string, unknown>,
  actual: Record<string, unknown> | null,
  err: Error | null,
): Grade {
  if (err || actual === null) return 'wrong';
  const expectedSchema = (expected as { _schema?: string })._schema;
  const actualSchema = (actual as { _schema?: string })._schema;
  if (expectedSchema && actualSchema && expectedSchema !== actualSchema) {
    return 'wrong';
  }
  const expectedJson = JSON.stringify(expected);
  const actualJson = JSON.stringify(actual);
  if (expectedJson === actualJson) return 'correct';
  if (sharesTopLevelShape(expected, actual)) return 'partial';
  return 'wrong';
}

function sharesTopLevelShape(
  a: Record<string, unknown>,
  b: Record<string, unknown>,
): boolean {
  const aKeys = Object.keys(a).sort();
  const bKeys = Object.keys(b).sort();
  const overlap = aKeys.filter((k) => bKeys.includes(k));
  return overlap.length / aKeys.length >= 0.7;
}

function describeGrade(
  grade: Grade,
  expected: Record<string, unknown>,
  actual: Record<string, unknown> | null,
): string {
  if (grade === 'correct') return 'exact JSON match';
  if (grade === 'wrong') {
    if (!actual) return 'runner returned null';
    const expSchema = (expected as { _schema?: string })._schema;
    const actSchema = (actual as { _schema?: string })._schema;
    if (expSchema !== actSchema) return `schema mismatch: ${expSchema} vs ${actSchema}`;
    return 'top-level shape diverges (<70% key overlap)';
  }
  return 'partial: shape matches but content drifts';
}

export async function recordResult(
  agent: AgentName,
  example: EvalExample,
  result: EvalResult,
): Promise<{ posted: boolean; reason?: string }> {
  if (!hasLangSmith()) {
    return { posted: false, reason: 'LANGCHAIN_API_KEY not set; fixture-replay only' };
  }
  try {
    const res = await fetch(`${LANGSMITH_API}/runs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.LANGCHAIN_API_KEY!,
      },
      body: JSON.stringify({
        name: `${agent}-eval`,
        run_type: 'chain',
        inputs: example.input,
        outputs: { grade: result.grade_actual, passed: result.passed },
        extra: {
          metadata: {
            example_id: example.id,
            inputs_hash: result.inputs_hash,
            grader: example.grader,
            project: PROJECT_NAME,
          },
        },
        session_name: PROJECT_NAME,
      }),
    });
    if (!res.ok) {
      return { posted: false, reason: `langsmith ${res.status}` };
    }
    return { posted: true };
  } catch (err) {
    return { posted: false, reason: (err as Error).message };
  }
}

export function summarizeResults(results: EvalResult[]): {
  total: number;
  passed: number;
  by_grade: Record<Grade, number>;
} {
  const by_grade: Record<Grade, number> = { correct: 0, partial: 0, wrong: 0 };
  let passed = 0;
  for (const r of results) {
    by_grade[r.grade_actual] += 1;
    if (r.passed) passed += 1;
  }
  return { total: results.length, passed, by_grade };
}
