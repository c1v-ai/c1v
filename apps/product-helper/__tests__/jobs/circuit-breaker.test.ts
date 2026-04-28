/**
 * Tests for lib/jobs/circuit-breaker — TB1 sidecar timeout wrapper.
 *
 * Validates EC-V21-B.4: 30s timeout fires; per-artifact failure does NOT
 * cascade across artifacts; failed rows persist with structured reason.
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockUpsert = jest.fn(async () => ({}) as never);

jest.mock('@/lib/synthesis/artifacts-bridge', () => ({
  __esModule: true,
  upsertArtifactStatus: (input: unknown) => mockUpsert(input),
}));

import { runWithCircuitBreaker } from '@/lib/jobs/circuit-breaker';

describe('runWithCircuitBreaker', () => {
  beforeEach(() => {
    mockUpsert.mockClear();
  });

  it('returns ok=true on a fast success', async () => {
    const out = await runWithCircuitBreaker({
      projectId: 42,
      artifactKind: 'recommendation_pdf',
      timeoutMs: 1_000,
      invoke: async () => ({ storage_path: 'p/r.pdf' }),
    });
    expect(out.ok).toBe(true);
    expect(out.artifactKind).toBe('recommendation_pdf');
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it('marks failed on timeout and returns structured failure', async () => {
    const out = await runWithCircuitBreaker({
      projectId: 42,
      artifactKind: 'recommendation_pdf',
      timeoutMs: 25,
      invoke: () => new Promise(() => {}),
    });
    expect(out.ok).toBe(false);
    expect(out.failure?.kind).toBe('timeout');
    expect(out.failure?.reason).toMatch(/timeout/);
    expect(mockUpsert).toHaveBeenCalledTimes(1);
    const arg = mockUpsert.mock.calls[0]![0] as Record<string, unknown>;
    expect(arg.status).toBe('failed');
    expect(arg.kind).toBe('recommendation_pdf');
    expect(String(arg.failureReason)).toMatch(/timeout/);
  });

  it('marks failed on sidecar error', async () => {
    const out = await runWithCircuitBreaker({
      projectId: 42,
      artifactKind: 'hoq_xlsx',
      timeoutMs: 1_000,
      invoke: async () => {
        throw new Error('boom');
      },
    });
    expect(out.ok).toBe(false);
    expect(out.failure?.kind).toBe('sidecar_error');
    expect(out.failure?.reason).toMatch(/boom/);
    expect(mockUpsert).toHaveBeenCalledTimes(1);
  });

  it('isolates failures per artifact (sequential calls)', async () => {
    const a = await runWithCircuitBreaker({
      projectId: 42,
      artifactKind: 'recommendation_pdf',
      timeoutMs: 25,
      invoke: () => new Promise(() => {}),
    });
    const b = await runWithCircuitBreaker({
      projectId: 42,
      artifactKind: 'recommendation_html',
      timeoutMs: 1_000,
      invoke: async () => ({ ok: true }),
    });
    expect(a.ok).toBe(false);
    expect(b.ok).toBe(true);
  });

  it('aborts the in-flight invocation on timeout via AbortSignal', async () => {
    let aborted = false;
    const out = await runWithCircuitBreaker({
      projectId: 42,
      artifactKind: 'fmea_residual_xlsx',
      timeoutMs: 25,
      invoke: (signal) =>
        new Promise((_, reject) => {
          signal.addEventListener('abort', () => {
            aborted = true;
            reject(new Error('aborted'));
          });
        }),
    });
    expect(out.ok).toBe(false);
    expect(aborted).toBe(true);
  });

  it('swallows upsert write failures (no throw to caller)', async () => {
    mockUpsert.mockRejectedValueOnce(new Error('db down'));
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const out = await runWithCircuitBreaker({
      projectId: 42,
      artifactKind: 'recommendation_pptx',
      timeoutMs: 25,
      invoke: () => new Promise(() => {}),
    });
    expect(out.ok).toBe(false);
    expect(errSpy).toHaveBeenCalled();
    errSpy.mockRestore();
  });
});
