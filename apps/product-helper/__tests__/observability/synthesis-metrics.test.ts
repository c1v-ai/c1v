/**
 * synthesis-metrics tests — TB1 EC-V21-B.5/B.6 fixture.
 *
 * Covers:
 *   - counters increment on agent + route + node + system events
 *   - mocked Sentry transport receives the right messages with the right
 *     tags + extras
 *   - cost calculation matches the per-model rate table
 *   - withAgentMetrics records success and failure paths (re-throws on
 *     error)
 *   - 100% sampling on errors / 10% on success (verified by stubbing
 *     Math.random)
 *   - resetCounters wipes state cleanly between tests
 */

import {
  V2_SYSTEM_DESIGN_AGENTS,
  SYNTHESIS_ROUTES,
  computeCostUsd,
  MODEL_RATES,
  setSentryTransport,
  recordAgentInvocation,
  recordRouteHit,
  recordColdStart,
  recordDeferredArtifactGeneration,
  recordNodeStart,
  recordNodeEnd,
  withAgentMetrics,
  withAgentMetricsSync,
  normalizeUsage,
  percentile,
  getCounters,
  resetCounters,
  type SentryTransport,
} from '@/lib/observability/synthesis-metrics';

function createMockTransport(): SentryTransport & {
  messages: Array<{ message: string; level: string; tags: Record<string, string>; extra: Record<string, unknown> }>;
  exceptions: Array<{ err: unknown; tags: Record<string, string>; extra: Record<string, unknown> }>;
} {
  const messages: Array<{ message: string; level: string; tags: Record<string, string>; extra: Record<string, unknown> }> = [];
  const exceptions: Array<{ err: unknown; tags: Record<string, string>; extra: Record<string, unknown> }> = [];
  return {
    messages,
    exceptions,
    captureMessage(message, ctx) {
      messages.push({ message, level: ctx.level, tags: ctx.tags, extra: ctx.extra });
    },
    captureException(err, ctx) {
      exceptions.push({ err, tags: ctx.tags, extra: ctx.extra });
    },
  };
}

describe('synthesis-metrics', () => {
  let mock: ReturnType<typeof createMockTransport>;
  let mathRandomSpy: jest.SpyInstance;

  beforeEach(() => {
    resetCounters();
    mock = createMockTransport();
    setSentryTransport(mock);
    // Force "always sample success" for deterministic message capture.
    mathRandomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    setSentryTransport(null);
    mathRandomSpy.mockRestore();
  });

  describe('agent / route enumerations', () => {
    test('contains the 6 v2 agents + synthesizer', () => {
      expect(V2_SYSTEM_DESIGN_AGENTS).toEqual([
        'decision-net',
        'form-function',
        'hoq',
        'fmea-early',
        'fmea-residual',
        'interface-specs',
        'synthesis',
      ]);
    });

    test('routes cover synthesize POST, status GET, manifest GET', () => {
      expect(SYNTHESIS_ROUTES).toEqual([
        'synthesize_post',
        'synthesize_status_get',
        'artifacts_manifest_get',
      ]);
    });
  });

  describe('cost calculation', () => {
    test('Sonnet 4.5 rate table $3/MTok in, $15/MTok out', () => {
      expect(MODEL_RATES['claude-sonnet-4-5'].input_usd_per_token).toBeCloseTo(3 / 1_000_000);
      expect(MODEL_RATES['claude-sonnet-4-5'].output_usd_per_token).toBeCloseTo(15 / 1_000_000);
    });

    test('computeCostUsd(sonnet, 1M, 1M) = $3 + $15 = $18', () => {
      const cost = computeCostUsd('claude-sonnet-4-5', 1_000_000, 1_000_000);
      expect(cost).toBeCloseTo(18, 6);
    });

    test('unknown model falls back to Sonnet 4.5 default', () => {
      const known = computeCostUsd('claude-sonnet-4-5', 1000, 500);
      const unknown = computeCostUsd('not-a-model', 1000, 500);
      expect(unknown).toBeCloseTo(known);
    });
  });

  describe('normalizeUsage', () => {
    test('Anthropic input_tokens / output_tokens shape', () => {
      expect(normalizeUsage({ input_tokens: 100, output_tokens: 50 })).toEqual({
        prompt_tokens: 100,
        completion_tokens: 50,
      });
    });

    test('OpenAI prompt_tokens / completion_tokens shape', () => {
      expect(normalizeUsage({ prompt_tokens: 100, completion_tokens: 50 })).toEqual({
        prompt_tokens: 100,
        completion_tokens: 50,
      });
    });

    test('undefined → zeros', () => {
      expect(normalizeUsage(undefined)).toEqual({ prompt_tokens: 0, completion_tokens: 0 });
    });
  });

  describe('agent invocation', () => {
    test('records success counters + cost + latency sample', () => {
      recordAgentInvocation({
        agent: 'hoq',
        model: 'claude-sonnet-4-5',
        prompt_tokens: 1000,
        completion_tokens: 500,
        latency_ms: 1234,
        success: true,
      });
      const c = getCounters().agents.hoq;
      expect(c.invocations).toBe(1);
      expect(c.successes).toBe(1);
      expect(c.failures).toBe(0);
      expect(c.prompt_tokens_total).toBe(1000);
      expect(c.completion_tokens_total).toBe(500);
      expect(c.cost_usd_total).toBeCloseTo(0.0105, 6);
      expect(c.latency_ms_samples).toEqual([1234]);
    });

    test('records failure counters + emits to Sentry at level=error', () => {
      recordAgentInvocation({
        agent: 'fmea-residual',
        model: 'claude-sonnet-4-5',
        prompt_tokens: 0,
        completion_tokens: 0,
        latency_ms: 50,
        success: false,
        error_kind: 'ValidationError',
      });
      expect(getCounters().agents['fmea-residual'].failures).toBe(1);
      const last = mock.messages.at(-1)!;
      expect(last.message).toBe('agent_invocation:fmea-residual');
      expect(last.level).toBe('error');
      expect(last.tags.success).toBe('false');
      expect(last.extra.error_kind).toBe('ValidationError');
    });

    test('cache_hit=true increments system.cache_hits', () => {
      recordAgentInvocation({
        agent: 'decision-net',
        model: 'stub',
        prompt_tokens: 0,
        completion_tokens: 0,
        latency_ms: 5,
        success: true,
        cache_hit: true,
      });
      expect(getCounters().system.cache_hits).toBe(1);
      expect(getCounters().system.cache_misses).toBe(0);
    });

    test('cache_hit=false increments system.cache_misses', () => {
      recordAgentInvocation({
        agent: 'decision-net',
        model: 'stub',
        prompt_tokens: 0,
        completion_tokens: 0,
        latency_ms: 5,
        success: true,
        cache_hit: false,
      });
      expect(getCounters().system.cache_misses).toBe(1);
    });
  });

  describe('Sentry sampling', () => {
    test('errors always go to Sentry regardless of sample rate', () => {
      mathRandomSpy.mockReturnValue(0.99); // would skip success
      recordAgentInvocation({
        agent: 'hoq',
        model: 'stub',
        prompt_tokens: 0,
        completion_tokens: 0,
        latency_ms: 1,
        success: false,
      });
      expect(mock.messages).toHaveLength(1);
    });

    test('successes drop above the 10% threshold', () => {
      mathRandomSpy.mockReturnValue(0.5);
      recordAgentInvocation({
        agent: 'hoq',
        model: 'stub',
        prompt_tokens: 0,
        completion_tokens: 0,
        latency_ms: 1,
        success: true,
      });
      // counter still increments (always-on), but Sentry message dropped
      expect(getCounters().agents.hoq.invocations).toBe(1);
      expect(mock.messages).toHaveLength(0);
    });

    test('successes sampled below the 10% threshold', () => {
      mathRandomSpy.mockReturnValue(0.05);
      recordAgentInvocation({
        agent: 'hoq',
        model: 'stub',
        prompt_tokens: 0,
        completion_tokens: 0,
        latency_ms: 1,
        success: true,
      });
      expect(mock.messages).toHaveLength(1);
    });
  });

  describe('route hits', () => {
    test('counters increment on POST + 5xx → errors', () => {
      recordRouteHit({ route: 'synthesize_post', latency_ms: 80, status_code: 202 });
      recordRouteHit({ route: 'synthesize_post', latency_ms: 5000, status_code: 500 });
      const c = getCounters().routes.synthesize_post;
      expect(c.hits).toBe(2);
      expect(c.errors).toBe(1);
    });
  });

  describe('system events', () => {
    test('cold start counter', () => {
      recordColdStart('cloud_run_sidecar');
      expect(getCounters().system.cold_starts).toBe(1);
    });

    test('deferred-artifact gen-on-view counter', () => {
      recordDeferredArtifactGeneration({
        project_id: 42,
        artifact_kind: 'fmea_residual',
        latency_ms: 9000,
      });
      expect(getCounters().system.deferred_artifacts_generated_on_view).toBe(1);
    });
  });

  describe('node events', () => {
    test('start + end emit Sentry messages with node tag', () => {
      recordNodeStart({ node: 'generate_synthesis', project_id: 1 });
      recordNodeEnd({
        node: 'generate_synthesis',
        project_id: 1,
        latency_ms: 1500,
        success: true,
      });
      expect(mock.messages.map((m) => m.message)).toEqual([
        'node_start:generate_synthesis',
        'node_end:generate_synthesis',
      ]);
    });

    test('node_end with cache_hit=true bumps cache_hits', () => {
      recordNodeEnd({
        node: 'generate_hoq',
        latency_ms: 100,
        success: true,
        cache_hit: true,
      });
      expect(getCounters().system.cache_hits).toBe(1);
    });
  });

  describe('withAgentMetrics async', () => {
    test('records success + returns result', async () => {
      const result = await withAgentMetrics(
        { agent: 'fmea-early' },
        async () => ({ ok: true, value: 42 }),
      );
      expect(result).toEqual({ ok: true, value: 42 });
      expect(getCounters().agents['fmea-early'].invocations).toBe(1);
      expect(getCounters().agents['fmea-early'].successes).toBe(1);
    });

    test('records failure + re-throws + sends captureException', async () => {
      await expect(
        withAgentMetrics({ agent: 'fmea-early' }, async () => {
          throw new Error('boom');
        }),
      ).rejects.toThrow('boom');
      expect(getCounters().agents['fmea-early'].failures).toBe(1);
      expect(mock.exceptions).toHaveLength(1);
      expect(mock.exceptions[0].tags.agent).toBe('fmea-early');
    });

    test('extractUsage forwards Anthropic usage block', async () => {
      const result = await withAgentMetrics(
        {
          agent: 'hoq',
          model: 'claude-sonnet-4-5',
          extractUsage: (r: { usage: { input_tokens: number; output_tokens: number } }) => r.usage,
        },
        async () => ({ usage: { input_tokens: 200, output_tokens: 100 } }),
      );
      expect(result.usage.input_tokens).toBe(200);
      expect(getCounters().agents.hoq.prompt_tokens_total).toBe(200);
      expect(getCounters().agents.hoq.completion_tokens_total).toBe(100);
      expect(getCounters().agents.hoq.cost_usd_total).toBeCloseTo(
        200 * (3 / 1_000_000) + 100 * (15 / 1_000_000),
        6,
      );
    });
  });

  describe('withAgentMetricsSync', () => {
    test('records success', () => {
      const result = withAgentMetricsSync({ agent: 'interface-specs' }, () => 'ok');
      expect(result).toBe('ok');
      expect(getCounters().agents['interface-specs'].invocations).toBe(1);
    });

    test('re-throws + records failure', () => {
      expect(() =>
        withAgentMetricsSync({ agent: 'interface-specs' }, () => {
          throw new TypeError('bad shape');
        }),
      ).toThrow('bad shape');
      expect(getCounters().agents['interface-specs'].failures).toBe(1);
      expect(mock.exceptions[0].err).toBeInstanceOf(TypeError);
    });
  });

  describe('percentile helper', () => {
    test('p95 of 100 evenly-spaced samples', () => {
      const samples = Array.from({ length: 100 }, (_, i) => i + 1);
      expect(percentile(samples, 95)).toBeGreaterThanOrEqual(95);
      expect(percentile(samples, 95)).toBeLessThanOrEqual(96);
    });

    test('empty samples returns 0', () => {
      expect(percentile([], 95)).toBe(0);
    });
  });

  describe('no-transport mode', () => {
    test('all emitters are no-ops without a transport (no throws)', () => {
      setSentryTransport(null);
      expect(() => {
        recordAgentInvocation({
          agent: 'hoq',
          model: 'stub',
          prompt_tokens: 0,
          completion_tokens: 0,
          latency_ms: 1,
          success: true,
        });
        recordRouteHit({ route: 'synthesize_post', latency_ms: 1, status_code: 200 });
        recordColdStart('test');
        recordDeferredArtifactGeneration({ project_id: 1, artifact_kind: 'x', latency_ms: 1 });
        recordNodeStart({ node: 'n' });
        recordNodeEnd({ node: 'n', latency_ms: 1, success: true });
      }).not.toThrow();
      // counters STILL increment so the verifier can read local state
      expect(getCounters().agents.hoq.invocations).toBe(1);
    });
  });
});
