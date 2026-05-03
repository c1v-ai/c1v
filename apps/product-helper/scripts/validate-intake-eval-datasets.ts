/**
 * Validates the 6 intake-agent eval datasets at `lib/eval/datasets/<name>.jsonl`.
 *
 * For each dataset:
 *   1. Parses every line as JSON (single-line shape per harness contract).
 *   2. Verifies the `id` field is the first 16 hex chars of sha256(stableStringify(input)).
 *   3. Validates `expected_output` against the corresponding agent's Zod schema
 *      (extraction / ffbd / qfd / decision-matrix / interfaces / nfr-runllmonly).
 *      For "wrong"-graded samples, parse failure is EXPECTED and counted as pass.
 *
 * Usage:
 *   pnpm tsx scripts/validate-intake-eval-datasets.ts
 *
 * Exit codes:
 *   0 — all datasets clean
 *   1 — one or more validation failures
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { z } from 'zod';

import {
  extractionSchema,
  ffbdSchema,
  qfdSchema,
  decisionMatrixSchema,
  interfacesSchema,
  nonFunctionalRequirementSchema,
} from '../lib/langchain/schemas';
import { INTAKE_AGENTS, type IntakeAgentName } from '../lib/eval/v2-eval-harness';

const DATASETS_DIR = join(__dirname, '..', 'lib', 'eval', 'datasets');

// `nfr-runllmonly` shape per generate-nfr.ts:52 — `{ nfrs: unknown[]; constants?: unknown[] }`,
// where nfrs are non-functional-requirement rows.
const nfrRunLlmOnlySchema = z.object({
  nfrs: z.array(nonFunctionalRequirementSchema),
  constants: z.array(z.unknown()).optional(),
});

const SCHEMA_BY_AGENT: Record<IntakeAgentName, z.ZodTypeAny> = {
  extraction: extractionSchema,
  'ffbd-intake': ffbdSchema,
  'qfd-intake': qfdSchema,
  'decision-matrix-intake': decisionMatrixSchema,
  'interfaces-intake': interfacesSchema,
  'nfr-runllmonly': nfrRunLlmOnlySchema,
};

const FILE_BY_AGENT: Record<IntakeAgentName, string> = {
  extraction: 'extraction.jsonl',
  'ffbd-intake': 'ffbd-intake.jsonl',
  'qfd-intake': 'qfd-intake.jsonl',
  'decision-matrix-intake': 'decision-matrix-intake.jsonl',
  'interfaces-intake': 'interfaces-intake.jsonl',
  'nfr-runllmonly': 'nfr-runllmonly.jsonl',
};

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(',')}}`;
}

function hashInput(input: unknown): string {
  return createHash('sha256').update(stableStringify(input)).digest('hex').slice(0, 16);
}

interface ValidationFailure {
  agent: IntakeAgentName;
  line: number;
  reason: string;
}

function validateDataset(agent: IntakeAgentName): {
  count: number;
  failures: ValidationFailure[];
} {
  const path = join(DATASETS_DIR, FILE_BY_AGENT[agent]);
  if (!existsSync(path)) {
    return { count: 0, failures: [{ agent, line: 0, reason: `file missing: ${path}` }] };
  }
  const raw = readFileSync(path, 'utf8');
  const lines = raw.split('\n').filter((l) => l.trim().length > 0);
  const failures: ValidationFailure[] = [];
  const schema = SCHEMA_BY_AGENT[agent];

  for (let i = 0; i < lines.length; i += 1) {
    const lineNo = i + 1;
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(lines[i]) as Record<string, unknown>;
    } catch (err) {
      failures.push({ agent, line: lineNo, reason: `invalid JSON: ${(err as Error).message}` });
      continue;
    }
    const id = parsed.id as string | undefined;
    const input = parsed.input as unknown;
    const grade = parsed.grade as string | undefined;
    const expected = parsed.expected_output as unknown;

    if (!id || typeof id !== 'string') {
      failures.push({ agent, line: lineNo, reason: 'missing id field' });
      continue;
    }
    const expectedId = hashInput(input);
    if (id !== expectedId) {
      failures.push({
        agent,
        line: lineNo,
        reason: `id mismatch: declared ${id}, expected ${expectedId}`,
      });
    }
    if (parsed.agent !== agent) {
      failures.push({
        agent,
        line: lineNo,
        reason: `agent mismatch: declared ${String(parsed.agent)}, expected ${agent}`,
      });
    }

    const parseResult = schema.safeParse(expected);
    if (grade === 'wrong') {
      // For "wrong" rows, expected_output is a deliberately broken shape;
      // schema MUST reject it. If it parses, that's the bug.
      if (parseResult.success) {
        failures.push({
          agent,
          line: lineNo,
          reason: 'wrong-grade row parses against schema (should be deliberately broken)',
        });
      }
    } else {
      if (!parseResult.success) {
        failures.push({
          agent,
          line: lineNo,
          reason: `${grade}-grade row fails schema: ${parseResult.error.message.slice(0, 200)}`,
        });
      }
    }
  }
  return { count: lines.length, failures };
}

function main(): void {
  const allFailures: ValidationFailure[] = [];
  console.log('Validating 6 intake-agent eval datasets...\n');
  for (const agent of INTAKE_AGENTS) {
    const { count, failures } = validateDataset(agent);
    const ok = failures.length === 0;
    console.log(
      `  ${ok ? '✓' : '✗'} ${agent.padEnd(28)} ${count} samples${failures.length ? ` (${failures.length} failures)` : ''}`,
    );
    for (const f of failures) {
      console.log(`      L${f.line}: ${f.reason}`);
    }
    allFailures.push(...failures);
  }
  console.log();
  if (allFailures.length > 0) {
    console.error(`FAIL: ${allFailures.length} validation failure(s)`);
    process.exit(1);
  }
  console.log('OK: all 60 fixtures parse + validate cleanly');
}

main();
