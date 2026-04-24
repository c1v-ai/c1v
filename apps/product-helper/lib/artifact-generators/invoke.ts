/**
 * Spawn wrapper for Python artifact generators.
 *
 * Contract: plans/c1v-MIT-Crawley-Cornell.v2.md §15.6.
 *
 *   1. Write ArtifactGeneratorInput to a temp JSON file.
 *   2. spawn('python3', ['scripts/artifact-generators/<name>.py', <tmp>]).
 *   3. Collect stdout, take the LAST non-empty line as JSON, parse as
 *      ArtifactGeneratorOutput.
 *   4. NON-FATAL: a spawn/parse/generator failure never throws to callers.
 *      Returns an `ok: false` ArtifactGeneratorOutput so the pipeline edge
 *      can degrade gracefully (the UI still renders from extractedData).
 *
 * Routing: inline for runtimeClass='inline' and maxElapsedMs <=
 * INLINE_ELAPSED_THRESHOLD_MS (5s). Otherwise hand off to queue.ts. The queue
 * module dynamically imports BullMQ so environments without Redis still compile
 * and run (inline-only).
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import { randomUUID } from 'crypto';

import type {
  ArtifactGeneratorInput,
  ArtifactGeneratorOutput,
  GeneratorName,
} from '../../../../scripts/artifact-generators/types';
import { getGeneratorConfig, shouldRunInline } from './config';

const REPO_ROOT = path.resolve(__dirname, '../../../..');
const GENERATORS_DIR = path.join(REPO_ROOT, 'scripts', 'artifact-generators');

export interface InvokeOptions {
  /** Force inline even when config says 'queue' (tests, CLI). */
  forceInline?: boolean;
  /** Absolute timeout in ms. Defaults to 2 * maxElapsedMs. */
  timeoutMs?: number;
  /** Override python binary. Defaults to $PYTHON or 'python3'. */
  pythonBin?: string;
}

function buildErrorOutput(
  code: string,
  message: string,
  phase: 'validate' | 'render' | 'write',
  stack?: string
): ArtifactGeneratorOutput {
  return {
    ok: false,
    error: { code, message, phase, ...(stack ? { stack } : {}) },
    partial: [],
  };
}

async function writeTempInput(input: ArtifactGeneratorInput): Promise<string> {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'artifact-gen-'));
  const tmpFile = path.join(tmpDir, `input-${randomUUID()}.json`);
  await fs.writeFile(tmpFile, JSON.stringify(input), 'utf8');
  return tmpFile;
}

function parseLastJsonLine(stdout: string): ArtifactGeneratorOutput | null {
  const lines = stdout.split('\n').map((l) => l.trim()).filter(Boolean);
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (!line.startsWith('{')) continue;
    try {
      return JSON.parse(line) as ArtifactGeneratorOutput;
    } catch {
      continue;
    }
  }
  return null;
}

/**
 * Low-level spawn. Public consumers should call invokeGenerator().
 * Always resolves; never rejects. Failure = ok:false output.
 */
export async function spawnGenerator(
  generator: GeneratorName,
  inputPath: string,
  opts: InvokeOptions = {}
): Promise<ArtifactGeneratorOutput> {
  const cfg = getGeneratorConfig(generator);
  const pythonBin = opts.pythonBin ?? process.env.PYTHON ?? 'python3';
  const scriptPath = path.join(GENERATORS_DIR, `${generator}.py`);
  const timeoutMs = opts.timeoutMs ?? cfg.maxElapsedMs * 2;

  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let settled = false;

    const child = spawn(pythonBin, [scriptPath, inputPath], {
      cwd: REPO_ROOT,
      env: { ...process.env },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const timer = setTimeout(() => {
      if (!settled) {
        child.kill('SIGKILL');
        settled = true;
        resolve(
          buildErrorOutput(
            'E_TIMEOUT',
            `generator ${generator} exceeded ${timeoutMs}ms`,
            'render'
          )
        );
      }
    }, timeoutMs);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(
        buildErrorOutput('E_SPAWN', `failed to spawn ${pythonBin}: ${err.message}`, 'validate', err.stack)
      );
    });

    child.on('close', (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);

      const parsed = parseLastJsonLine(stdout);
      if (parsed) {
        resolve(parsed);
        return;
      }

      resolve(
        buildErrorOutput(
          code === 0 ? 'E_NO_OUTPUT' : 'E_NONZERO_EXIT',
          `generator ${generator} exit=${code}; stderr(tail)=${stderr.slice(-512)}`,
          'render'
        )
      );
    });
  });
}

/**
 * Public entry point. Decides inline vs queue, writes the temp input, invokes.
 *
 * Never throws. Callers should treat `ok: false` as a recoverable warning and
 * continue the pipeline — downstream consumers read extractedData from DB, the
 * artifact files are just downloadable xlsx/pptx/mmd produced alongside.
 */
export async function invokeGenerator(
  input: ArtifactGeneratorInput,
  opts: InvokeOptions = {}
): Promise<ArtifactGeneratorOutput> {
  let tmpPath: string | null = null;
  try {
    tmpPath = await writeTempInput(input);

    const runInline = opts.forceInline || shouldRunInline(input.generator);
    if (runInline) {
      return await spawnGenerator(input.generator, tmpPath, opts);
    }

    // Queue path — dynamic import so BullMQ/Redis stays optional.
    try {
      const { enqueueGenerator } = await import('./queue');
      return await enqueueGenerator(input, tmpPath, opts);
    } catch (err) {
      // Fallback: if queue infra is unavailable, log and run inline anyway.
      console.warn(
        `[artifact-generators] queue unavailable for ${input.generator}, falling back to inline: ${(err as Error).message}`
      );
      return await spawnGenerator(input.generator, tmpPath, opts);
    }
  } catch (err) {
    const e = err as Error;
    return buildErrorOutput('E_INVOKE', e.message, 'validate', e.stack);
  } finally {
    if (tmpPath) {
      // Best-effort cleanup; leaking a <1KB tmp file is never pipeline-fatal.
      fs.unlink(tmpPath).catch(() => undefined);
    }
  }
}
