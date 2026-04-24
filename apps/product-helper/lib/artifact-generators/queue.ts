/**
 * BullMQ queue integration for long-running artifact generators.
 *
 * Optional dependency: this module dynamically imports 'bullmq' and 'ioredis'
 * so the package doesn't need to ship in environments that only use inline
 * generators. If import fails, enqueueGenerator() throws and invoke.ts catches
 * it, falling back to an inline spawn.
 *
 * Env:
 *   REDIS_URL — preferred single connection string (rediss:// or redis://).
 *   UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN — NOT supported here
 *     (BullMQ needs a TCP connection, not the REST API). If only Upstash REST
 *     is available, invoke.ts falls back to inline.
 *
 * Job shape: { input: ArtifactGeneratorInput, inputPath: string }.
 * Processor: spawns via invoke.ts::spawnGenerator. Retries 2× with exponential
 * backoff (2s, 4s). Jobs are kept for 1h on completion / 24h on failure.
 */

import type {
  ArtifactGeneratorInput,
  ArtifactGeneratorOutput,
} from '../../../../scripts/artifact-generators/types';
import { spawnGenerator } from './invoke';
import type { InvokeOptions } from './invoke';

const QUEUE_NAME = 'artifact-generate';
const JOB_NAME = 'artifact-generate';

type UnknownQueue = {
  add: (name: string, data: unknown, opts: unknown) => Promise<{ id: string }>;
  close: () => Promise<void>;
};

let _queue: UnknownQueue | null = null;
let _queueInitPromise: Promise<UnknownQueue> | null = null;

async function getQueue(): Promise<UnknownQueue> {
  if (_queue) return _queue;
  if (_queueInitPromise) return _queueInitPromise;

  _queueInitPromise = (async () => {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      throw new Error('REDIS_URL not set; BullMQ queue unavailable');
    }

    const { Queue } = (await import('bullmq')) as typeof import('bullmq');
    const queue = new Queue(QUEUE_NAME, {
      connection: { url: redisUrl } as unknown as object,
      defaultJobOptions: {
        attempts: 2,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: { age: 3600 },
        removeOnFail: { age: 86400 },
      },
    });
    _queue = queue as unknown as UnknownQueue;
    return _queue;
  })();

  return _queueInitPromise;
}

export interface QueuedJobResult {
  jobId: string;
  status: 'queued';
}

/**
 * Enqueue a generator job. Returns a synthetic "queued" ArtifactGeneratorOutput
 * so the calling pipeline can continue. The job's real result lands in the
 * manifest file once the worker (see startWorker) completes it.
 *
 * NOTE: invoke.ts currently awaits this and treats a queued job as a
 * non-failure. Downstream consumers must poll the manifest API.
 */
export async function enqueueGenerator(
  input: ArtifactGeneratorInput,
  inputPath: string,
  _opts: InvokeOptions = {}
): Promise<ArtifactGeneratorOutput> {
  const queue = await getQueue();
  const job = await queue.add(
    JOB_NAME,
    { input, inputPath },
    { jobId: `${input.generator}:${Date.now()}` }
  );

  return {
    ok: true,
    generated: [],
    warnings: [`job queued (id=${job.id}); poll artifacts.manifest.jsonl for results`],
    elapsedMs: 0,
  };
}

/**
 * Start a BullMQ worker. Intended for a long-running process (a separate
 * Node.js entrypoint, NOT the Next.js app). Exported so a deploy script can
 * import and run it.
 */
export async function startWorker(): Promise<() => Promise<void>> {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) throw new Error('REDIS_URL not set');

  const { Worker } = (await import('bullmq')) as typeof import('bullmq');

  const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      const { input, inputPath } = job.data as {
        input: ArtifactGeneratorInput;
        inputPath: string;
      };
      // Let spawnGenerator enforce timeout + write to manifest via runner.py.
      return spawnGenerator(input.generator, inputPath);
    },
    { connection: { url: redisUrl } as unknown as object }
  );

  worker.on('failed', (job, err) => {
    console.error(`[artifact-queue] job ${job?.id} failed: ${err.message}`);
  });

  return async () => {
    await worker.close();
  };
}

/** Test helper: close the shared queue (no-op if never initialized). */
export async function closeQueue(): Promise<void> {
  if (_queue) {
    await _queue.close();
    _queue = null;
    _queueInitPromise = null;
  }
}
