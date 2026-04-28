/**
 * Per-artifact circuit-breaker for sidecar invocations (EC-V21-B.4).
 *
 * Wraps each Cloud Run sidecar `POST /run-render` call with a 30-second
 * timeout. On timeout or error, the wrapper marks the artifact row in
 * `project_artifacts` as `synthesis_status='failed'` with a structured
 * `failure_reason`, surfacing a per-artifact retry CTA in the UI (no canned
 * fall-back per D-V21.17).
 *
 * Per-artifact failure isolation: the breaker tripping for one artifact
 * MUST NOT cascade — other artifacts in the same synthesis run continue
 * independently. Callers should `runWithCircuitBreaker(...)` each invocation
 * inside a `Promise.allSettled` (NOT `Promise.all`).
 *
 * @module lib/jobs/circuit-breaker
 */

import { upsertArtifactStatus } from '@/lib/synthesis/artifacts-bridge';

export const DEFAULT_SIDECAR_TIMEOUT_MS = 30_000;

export type CircuitBreakerFailureKind =
  | 'timeout'
  | 'sidecar_error'
  | 'invocation_error';

export interface CircuitBreakerInput<T> {
  projectId: number;
  artifactKind: string;
  /** Detached invocation that returns the sidecar response. */
  invoke: (signal: AbortSignal) => Promise<T>;
  /** Override the 30s default — used by tests. */
  timeoutMs?: number;
}

export interface CircuitBreakerResult<T> {
  ok: boolean;
  artifactKind: string;
  result?: T;
  failure?: {
    kind: CircuitBreakerFailureKind;
    reason: string;
    elapsedMs: number;
  };
}

function buildFailureReason(
  kind: CircuitBreakerFailureKind,
  err: unknown,
  timeoutMs: number,
): string {
  if (kind === 'timeout') return `sidecar timeout after ${timeoutMs}ms`;
  if (err instanceof Error) return `${kind}: ${err.message}`;
  return `${kind}: ${String(err)}`;
}

/**
 * Run a single sidecar invocation under a circuit-breaker.
 *
 * On success: returns `{ ok: true, result }`. The caller is responsible for
 * marking the artifact `ready` after persisting the rendered bytes — we do
 * not write `ready` from here because success requires a `storagePath` +
 * `sha256` the caller computes.
 *
 * On failure: marks the artifact row `failed` with a structured reason
 * before resolving with `{ ok: false, failure }`. The breaker NEVER throws
 * — failure is always structured so `Promise.allSettled` is unnecessary.
 */
export async function runWithCircuitBreaker<T>(
  input: CircuitBreakerInput<T>,
): Promise<CircuitBreakerResult<T>> {
  const timeoutMs = input.timeoutMs ?? DEFAULT_SIDECAR_TIMEOUT_MS;
  const controller = new AbortController();
  const startedAt = Date.now();

  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      controller.abort();
      reject(Object.assign(new Error('CIRCUIT_BREAKER_TIMEOUT'), {
        __cbTimeout: true as const,
      }));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([
      input.invoke(controller.signal),
      timeoutPromise,
    ]);
    return { ok: true, artifactKind: input.artifactKind, result: result as T };
  } catch (err) {
    const elapsedMs = Date.now() - startedAt;
    const isTimeout = Boolean(
      err && typeof err === 'object' && (err as { __cbTimeout?: boolean }).__cbTimeout,
    );
    const kind: CircuitBreakerFailureKind = isTimeout
      ? 'timeout'
      : err instanceof Error
        ? 'sidecar_error'
        : 'invocation_error';
    const reason = buildFailureReason(kind, err, timeoutMs);

    try {
      await upsertArtifactStatus({
        projectId: input.projectId,
        kind: input.artifactKind,
        status: 'failed',
        failureReason: reason,
      });
    } catch (writeErr) {
      console.error(
        `[circuit-breaker] failed to mark artifact failed (project=${input.projectId} kind=${input.artifactKind}):`,
        writeErr instanceof Error ? writeErr.message : writeErr,
      );
    }

    return {
      ok: false,
      artifactKind: input.artifactKind,
      failure: { kind, reason, elapsedMs },
    };
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle);
  }
}
