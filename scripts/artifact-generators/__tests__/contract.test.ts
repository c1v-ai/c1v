/**
 * Contract tests for all 13 artifact generators (T10 EC-15.3).
 *
 * For each generator:
 *  1. Feed a malformed JSON file → assert non-zero exit, ArtifactGeneratorOutput
 *     has ok:false, error.phase === 'validate'.
 *  2. Feed a JSON missing schemaRef → assert ok:false, error.phase === 'validate'.
 *  3. Assert generator file is syntactically valid Python (ast.parse).
 *
 * Rationale: these assertions verify the runner harness contract (spec §15.3)
 * without exercising each generator's render-phase, which is covered by
 * round-trip tests separately. We do NOT shim the schemas dir here — a missing
 * schemaRef reliably exercises the validate-phase error path.
 *
 * Runs from repo root (cwd is apps/product-helper under jest, but we spawn
 * python3 with an absolute path to the generator script).
 */

import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const REPO_ROOT = resolve(__dirname, '..', '..', '..');
const GENERATORS_DIR = join(REPO_ROOT, 'scripts', 'artifact-generators');

const GENERATORS = [
  'gen-ffbd',
  'gen-qfd',
  'gen-n2',
  'gen-sequence',
  'gen-dfd',
  'gen-interfaces',
  'gen-fmea',
  'gen-ucbd',
  'gen-decision-net',
  'gen-form-function',
  'gen-cost-curves',
  'gen-latency-chain',
  'gen-arch-recommendation',
] as const;

function runGenerator(name: string, inputPath: string) {
  const scriptPath = join(GENERATORS_DIR, `${name}.py`);
  return spawnSync('python3', [scriptPath, inputPath], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    timeout: 30_000,
  });
}

function parseStdoutAsJson(stdout: string): unknown {
  // Runner emits exactly one JSON line on stdout; be tolerant of trailing nl.
  const line = stdout.trim().split('\n').filter(Boolean).pop() ?? '';
  return JSON.parse(line);
}

describe('artifact-generators contract (T10 EC-15.3)', () => {
  let tmpDir: string;

  beforeAll(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 't10-contract-'));
  });

  afterAll(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  test.each(GENERATORS)('%s rejects malformed JSON with validate-phase error', (gen) => {
    const badInput = join(tmpDir, `${gen}-malformed.json`);
    writeFileSync(badInput, '{"broken json');

    const result = runGenerator(gen, badInput);

    expect(result.status).toBe(1);
    expect(result.stdout).toBeTruthy();

    const out = parseStdoutAsJson(result.stdout) as {
      ok: boolean;
      error?: { phase: string; code: string };
    };
    expect(out.ok).toBe(false);
    expect(out.error?.phase).toBe('validate');
  });

  test.each(GENERATORS)('%s rejects missing schemaRef with validate-phase error', (gen) => {
    const outDir = join(tmpDir, `${gen}-no-schema`);
    const inputPath = join(tmpDir, `${gen}-no-schema.json`);
    // Valid JSON but structurally invalid ArtifactGeneratorInput.
    writeFileSync(
      inputPath,
      JSON.stringify({ generator: gen, instanceJson: {}, outputDir: outDir, targets: [] })
    );

    const result = runGenerator(gen, inputPath);

    expect(result.status).toBe(1);
    const out = parseStdoutAsJson(result.stdout) as {
      ok: boolean;
      error?: { phase: string };
    };
    expect(out.ok).toBe(false);
    expect(out.error?.phase).toBe('validate');
  });

  test.each(GENERATORS)('%s appends a manifest entry on failure', (gen) => {
    const outDir = join(tmpDir, `${gen}-manifest`);
    const inputPath = join(outDir, `${gen}-input.json`);
    // Must mkdir first so runner's default output_dir_for_manifest (input.parent)
    // exists and the validate-phase manifest write can land.
    require('node:fs').mkdirSync(outDir, { recursive: true });
    writeFileSync(
      inputPath,
      JSON.stringify({ generator: gen, instanceJson: {}, outputDir: outDir, targets: [] })
    );

    const result = runGenerator(gen, inputPath);
    expect(result.status).toBe(1);

    const manifestPath = join(outDir, 'artifacts.manifest.jsonl');
    expect(existsSync(manifestPath)).toBe(true);

    const lines = readFileSync(manifestPath, 'utf8').trim().split('\n').filter(Boolean);
    expect(lines.length).toBeGreaterThan(0);
    const entry = JSON.parse(lines[lines.length - 1]) as {
      ok: boolean;
      generator: string;
      error?: { phase: string };
    };
    expect(entry.ok).toBe(false);
    expect(entry.generator).toBe(gen);
    expect(entry.error?.phase).toBe('validate');
  });

  test.each(GENERATORS)('%s is syntactically valid Python', (gen) => {
    const scriptPath = join(GENERATORS_DIR, `${gen}.py`);
    const result = spawnSync(
      'python3',
      ['-c', `import ast; ast.parse(open(${JSON.stringify(scriptPath)}).read())`],
      { encoding: 'utf8' }
    );
    expect(result.status).toBe(0);
  });
});
