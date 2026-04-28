/**
 * synthesis-metrics — TB1 Wave-B observability for the v2 system-design
 * pipeline.
 *
 * Captures per-agent + per-route + system metrics for the 6 v2
 * system-design agents (decision-net, form-function, hoq, fmea-early,
 * fmea-residual, interface-specs) plus the synthesizer
 * (architecture-recommendation, implemented in `synthesis-agent.ts`).
 *
 * Cost telemetry posture (locked 2026-04-25 by David):
 *   "we are moving forward regardless of cost."
 * Cost is INSTRUMENTED for visibility. There are NO alert thresholds in
 * v2.1. Operators read the dashboard; they do not get paged on $/mo.
 *
 * Sentry transport is pluggable. In production, wire `setSentryTransport`
 * once at process boot (e.g. in `instrumentation.ts`) with `@sentry/nextjs`
 * imports. In tests, a mock transport is installed automatically by
 * `__tests__/observability/synthesis-metrics.test.ts`. With no transport
 * installed (default), all emit calls are no-ops — instrumentation never
 * crashes the LangGraph hot path.
 *
 * Sentry sampling discipline:
 *   - 100% on errors (success === false)
 *   - 10% on success (success === true) — cost mgmt for Sentry itself
 *
 * Sentry sampling is enforced inside `emit()`; all counter increments
 * happen unconditionally so dashboards never lose visibility.
 *
 * @module lib/observability/synthesis-metrics
 */

// ─────────────────────────────────────────────────────────────────────────
// Agent / route enumerations
// ─────────────────────────────────────────────────────────────────────────

export const V2_SYSTEM_DESIGN_AGENTS = [
  'decision-net',
  'form-function',
  'hoq',
  'fmea-early',
  'fmea-residual',
  'interface-specs',
  'synthesis',
] as const;

export type AgentName = (typeof V2_SYSTEM_DESIGN_AGENTS)[number];

export const SYNTHESIS_ROUTES = [
  'synthesize_post',
  'synthesize_status_get',
  'artifacts_manifest_get',
] as const;

export type RouteName = (typeof SYNTHESIS_ROUTES)[number];

// ─────────────────────────────────────────────────────────────────────────
// Per-model USD rate table (Anthropic pricing as of 2026-04 — Sonnet 4.5)
// Rates are per-token, computed from per-MTok prices: $3 in / $15 out for
// claude-sonnet-4-5. Multipliers below are dollars-per-token.
// ─────────────────────────────────────────────────────────────────────────

export interface ModelRate {
  input_usd_per_token: number;
  output_usd_per_token: number;
}

export const MODEL_RATES: Record<string, ModelRate> = {
  'claude-sonnet-4-5': {
    input_usd_per_token: 3 / 1_000_000,
    output_usd_per_token: 15 / 1_000_000,
  },
  'claude-sonnet-4-5-20250929': {
    input_usd_per_token: 3 / 1_000_000,
    output_usd_per_token: 15 / 1_000_000,
  },
  'claude-haiku-4-5': {
    input_usd_per_token: 1 / 1_000_000,
    output_usd_per_token: 5 / 1_000_000,
  },
  'claude-opus-4-7': {
    input_usd_per_token: 15 / 1_000_000,
    output_usd_per_token: 75 / 1_000_000,
  },
};

const DEFAULT_RATE: ModelRate = MODEL_RATES['claude-sonnet-4-5'];

export function computeCostUsd(
  model: string,
  promptTokens: number,
  completionTokens: number,
): number {
  const rate = MODEL_RATES[model] ?? DEFAULT_RATE;
  return (
    promptTokens * rate.input_usd_per_token +
    completionTokens * rate.output_usd_per_token
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Pluggable Sentry transport
// ─────────────────────────────────────────────────────────────────────────

export interface SentryTransport {
  captureMessage: (
    message: string,
    ctx: { level: 'info' | 'error'; tags: Record<string, string>; extra: Record<string, unknown> },
  ) => void;
  captureException: (err: unknown, ctx: { tags: Record<string, string>; extra: Record<string, unknown> }) => void;
}

let _transport: SentryTransport | null = null;

/**
 * Install a Sentry transport. Production wiring lives in
 * `instrumentation.ts` and binds `@sentry/nextjs`. Tests install a mock.
 */
export function setSentryTransport(t: SentryTransport | null): void {
  _transport = t;
}

export function getSentryTransport(): SentryTransport | null {
  return _transport;
}

const SUCCESS_SAMPLE_RATE = 0.1;

function shouldSampleSuccess(): boolean {
  return Math.random() < SUCCESS_SAMPLE_RATE;
}

// ─────────────────────────────────────────────────────────────────────────
// In-process counters (read by /api/admin/metrics + verifier)
// ─────────────────────────────────────────────────────────────────────────

export interface AgentCounters {
  invocations: number;
  successes: number;
  failures: number;
  prompt_tokens_total: number;
  completion_tokens_total: number;
  cost_usd_total: number;
  latency_ms_samples: number[];
}

export interface RouteCounters {
  hits: number;
  errors: number;
  latency_ms_samples: number[];
}

export interface SystemCounters {
  cold_starts: number;
  cache_hits: number;
  cache_misses: number;
  deferred_artifacts_generated_on_view: number;
}

interface CounterStore {
  agents: Record<AgentName, AgentCounters>;
  routes: Record<RouteName, RouteCounters>;
  system: SystemCounters;
}

function freshAgentCounters(): AgentCounters {
  return {
    invocations: 0,
    successes: 0,
    failures: 0,
    prompt_tokens_total: 0,
    completion_tokens_total: 0,
    cost_usd_total: 0,
    latency_ms_samples: [],
  };
}

function freshRouteCounters(): RouteCounters {
  return { hits: 0, errors: 0, latency_ms_samples: [] };
}

function freshStore(): CounterStore {
  const agents = {} as Record<AgentName, AgentCounters>;
  for (const a of V2_SYSTEM_DESIGN_AGENTS) agents[a] = freshAgentCounters();
  const routes = {} as Record<RouteName, RouteCounters>;
  for (const r of SYNTHESIS_ROUTES) routes[r] = freshRouteCounters();
  return {
    agents,
    routes,
    system: { cold_starts: 0, cache_hits: 0, cache_misses: 0, deferred_artifacts_generated_on_view: 0 },
  };
}

// Module-scoped — single process. For multi-instance prod, the Sentry
// transport is the source of truth; counters are a fast-read local view.
let _store: CounterStore = freshStore();

export function getCounters(): CounterStore {
  return _store;
}

export function resetCounters(): void {
  _store = freshStore();
}

// Bound the in-memory latency-sample buffer to keep `/api/admin/metrics`
// O(1)-bounded under load. Older samples drop; aggregates remain in Sentry.
const LATENCY_SAMPLE_CAP = 1000;

function pushSample(buf: number[], v: number): void {
  buf.push(v);
  if (buf.length > LATENCY_SAMPLE_CAP) buf.splice(0, buf.length - LATENCY_SAMPLE_CAP);
}

// ─────────────────────────────────────────────────────────────────────────
// Percentile helper (used by verifier + /api/admin/metrics)
// ─────────────────────────────────────────────────────────────────────────

export function percentile(samples: number[], p: number): number {
  if (samples.length === 0) return 0;
  const sorted = [...samples].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[idx];
}

// ─────────────────────────────────────────────────────────────────────────
// Public emitters — agents
// ─────────────────────────────────────────────────────────────────────────

export interface AgentInvocationEvent {
  agent: AgentName;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  latency_ms: number;
  success: boolean;
  cache_hit?: boolean;
  project_id?: number;
  error_kind?: string;
}

export function recordAgentInvocation(ev: AgentInvocationEvent): void {
  const c = _store.agents[ev.agent];
  c.invocations += 1;
  if (ev.success) c.successes += 1;
  else c.failures += 1;
  c.prompt_tokens_total += ev.prompt_tokens;
  c.completion_tokens_total += ev.completion_tokens;
  const cost = computeCostUsd(ev.model, ev.prompt_tokens, ev.completion_tokens);
  c.cost_usd_total += cost;
  pushSample(c.latency_ms_samples, ev.latency_ms);

  if (ev.cache_hit === true) _store.system.cache_hits += 1;
  else if (ev.cache_hit === false) _store.system.cache_misses += 1;

  if (!_transport) return;
  const sample = ev.success ? shouldSampleSuccess() : true;
  if (!sample) return;

  _transport.captureMessage(`agent_invocation:${ev.agent}`, {
    level: ev.success ? 'info' : 'error',
    tags: {
      agent: ev.agent,
      model: ev.model,
      success: String(ev.success),
      ...(ev.cache_hit !== undefined ? { cache_hit: String(ev.cache_hit) } : {}),
    },
    extra: {
      prompt_tokens: ev.prompt_tokens,
      completion_tokens: ev.completion_tokens,
      cost_usd: cost,
      latency_ms: ev.latency_ms,
      project_id: ev.project_id,
      error_kind: ev.error_kind,
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────
// Public emitters — routes
// ─────────────────────────────────────────────────────────────────────────

export interface RouteHitEvent {
  route: RouteName;
  latency_ms: number;
  status_code: number;
  project_id?: number;
}

export function recordRouteHit(ev: RouteHitEvent): void {
  const c = _store.routes[ev.route];
  c.hits += 1;
  if (ev.status_code >= 500) c.errors += 1;
  pushSample(c.latency_ms_samples, ev.latency_ms);

  if (!_transport) return;
  const isError = ev.status_code >= 500;
  const sample = isError ? true : shouldSampleSuccess();
  if (!sample) return;

  _transport.captureMessage(`route_hit:${ev.route}`, {
    level: isError ? 'error' : 'info',
    tags: { route: ev.route, status_code: String(ev.status_code) },
    extra: { latency_ms: ev.latency_ms, project_id: ev.project_id },
  });
}

// ─────────────────────────────────────────────────────────────────────────
// Public emitters — system
// ─────────────────────────────────────────────────────────────────────────

export function recordColdStart(component: string): void {
  _store.system.cold_starts += 1;
  if (!_transport) return;
  _transport.captureMessage('cold_start', {
    level: 'info',
    tags: { component },
    extra: {},
  });
}

export function recordDeferredArtifactGeneration(args: {
  project_id: number;
  artifact_kind: string;
  latency_ms: number;
}): void {
  _store.system.deferred_artifacts_generated_on_view += 1;
  if (!_transport) return;
  if (!shouldSampleSuccess()) return;
  _transport.captureMessage('deferred_artifact_gen_on_view', {
    level: 'info',
    tags: { artifact_kind: args.artifact_kind },
    extra: { project_id: args.project_id, latency_ms: args.latency_ms },
  });
}

// ─────────────────────────────────────────────────────────────────────────
// Per-LangGraph-node events
// ─────────────────────────────────────────────────────────────────────────

export interface GraphNodeEvent {
  node: string;
  project_id?: number;
  cache_hit?: boolean;
}

export function recordNodeStart(ev: GraphNodeEvent): void {
  if (!_transport) return;
  _transport.captureMessage(`node_start:${ev.node}`, {
    level: 'info',
    tags: { node: ev.node },
    extra: { project_id: ev.project_id },
  });
}

export function recordNodeEnd(ev: GraphNodeEvent & { latency_ms: number; success: boolean }): void {
  if (ev.cache_hit === true) _store.system.cache_hits += 1;
  else if (ev.cache_hit === false) _store.system.cache_misses += 1;

  if (!_transport) return;
  const sample = ev.success ? shouldSampleSuccess() : true;
  if (!sample) return;

  _transport.captureMessage(`node_end:${ev.node}`, {
    level: ev.success ? 'info' : 'error',
    tags: {
      node: ev.node,
      success: String(ev.success),
      ...(ev.cache_hit !== undefined ? { cache_hit: String(ev.cache_hit) } : {}),
    },
    extra: { project_id: ev.project_id, latency_ms: ev.latency_ms },
  });
}

// ─────────────────────────────────────────────────────────────────────────
// synthesis_metrics_total — Wave-E LLM-call-rate counter
//
// Per the EC-V21-E.13 baseline-capture contract, GENERATE_nfr +
// GENERATE_constants emit one increment per call labeled by impl:
//   - `impl="llm-only"`     → v2.1 path (LLM agent invokes the model)
//   - `impl="engine-first"` → v2.2 path (deterministic engine; only routes
//                              to LLM on the 0.60–0.90 refine band when
//                              `decision.llm_assist === true`)
//
// post-deploy 7-day measurement window: aggregate the labelled counts and
// compare engine-first vs llm-only baseline; ≥60% drop is the gate.
// ─────────────────────────────────────────────────────────────────────────

export type SynthesisMetricsImpl = 'llm-only' | 'engine-first';
export type SynthesisMetricsModule = 'm2' | 'm3' | 'm4' | 'm5' | 'm6' | 'm7' | 'm8';

export interface SynthesisMetricsTotalEvent {
  module: SynthesisMetricsModule;
  impl: SynthesisMetricsImpl;
  /** True when this call actually hit the LLM (llm-only always true; engine-first true only on refine-band). */
  llm_invoked: boolean;
  project_id?: number;
}

interface SynthesisMetricsCounter {
  total: number;
  llm_invoked: number;
}

const _synthesisMetricsTotal = new Map<string, SynthesisMetricsCounter>();

function synthesisMetricsKey(module: SynthesisMetricsModule, impl: SynthesisMetricsImpl): string {
  return `${module}::${impl}`;
}

export function recordSynthesisMetricsTotal(ev: SynthesisMetricsTotalEvent): void {
  const key = synthesisMetricsKey(ev.module, ev.impl);
  const cur = _synthesisMetricsTotal.get(key) ?? { total: 0, llm_invoked: 0 };
  cur.total += 1;
  if (ev.llm_invoked) cur.llm_invoked += 1;
  _synthesisMetricsTotal.set(key, cur);

  if (!_transport) return;
  _transport.captureMessage('synthesis_metrics_total', {
    level: 'info',
    tags: {
      module: ev.module,
      impl: ev.impl,
      llm_invoked: String(ev.llm_invoked),
    },
    extra: { project_id: ev.project_id },
  });
}

export function getSynthesisMetricsTotal(): Record<string, SynthesisMetricsCounter> {
  return Object.fromEntries(_synthesisMetricsTotal);
}

export function resetSynthesisMetricsTotal(): void {
  _synthesisMetricsTotal.clear();
}

// ─────────────────────────────────────────────────────────────────────────
// withAgentMetrics — wrap an agent entry-point with timing + cost capture
// ─────────────────────────────────────────────────────────────────────────

export interface UsageBlock {
  /** Anthropic SDK reports as `input_tokens`. */
  input_tokens?: number;
  /** Anthropic SDK reports as `output_tokens`. */
  output_tokens?: number;
  prompt_tokens?: number;
  completion_tokens?: number;
}

/** Normalize Anthropic / OpenAI-shaped usage blocks into a flat pair. */
export function normalizeUsage(u: UsageBlock | undefined | null): {
  prompt_tokens: number;
  completion_tokens: number;
} {
  if (!u) return { prompt_tokens: 0, completion_tokens: 0 };
  return {
    prompt_tokens: u.prompt_tokens ?? u.input_tokens ?? 0,
    completion_tokens: u.completion_tokens ?? u.output_tokens ?? 0,
  };
}

export interface WrapMetricsOptions<R> {
  agent: AgentName;
  /** Default model assumed for stub-path runs that never call the LLM. */
  model?: string;
  /** Extract usage from the agent's return value (LLM path). */
  extractUsage?: (result: R) => UsageBlock | undefined;
  project_id?: number;
  cache_hit?: boolean;
}

/**
 * Wrap an agent call so its latency + token usage land in synthesis-metrics.
 *
 * Stub-path agents (the v2 default per portfolio-demo stance) never make
 * LLM calls; they record latency-only with 0 tokens / 0 cost. Live-path
 * agents pass `extractUsage` to forward the Anthropic SDK usage block.
 *
 * Failures are still recorded (success=false). The error rethrows so the
 * caller's existing throw-on-error contract is preserved.
 */
export async function withAgentMetrics<R>(
  opts: WrapMetricsOptions<R>,
  fn: () => Promise<R>,
): Promise<R> {
  const start = performance.now();
  try {
    const result = await fn();
    const latency_ms = performance.now() - start;
    const usage = opts.extractUsage?.(result);
    const { prompt_tokens, completion_tokens } = normalizeUsage(usage);
    recordAgentInvocation({
      agent: opts.agent,
      model: opts.model ?? 'stub',
      prompt_tokens,
      completion_tokens,
      latency_ms,
      success: true,
      cache_hit: opts.cache_hit,
      project_id: opts.project_id,
    });
    return result;
  } catch (err) {
    const latency_ms = performance.now() - start;
    recordAgentInvocation({
      agent: opts.agent,
      model: opts.model ?? 'stub',
      prompt_tokens: 0,
      completion_tokens: 0,
      latency_ms,
      success: false,
      project_id: opts.project_id,
      error_kind: err instanceof Error ? err.name : 'UnknownError',
    });
    if (_transport) {
      _transport.captureException(err, {
        tags: { agent: opts.agent },
        extra: { project_id: opts.project_id, latency_ms },
      });
    }
    throw err;
  }
}

/**
 * Sync variant of `withAgentMetrics` for agents whose entry-point is
 * synchronous (e.g. `runInterfaceSpecsAgent`).
 */
export function withAgentMetricsSync<R>(
  opts: WrapMetricsOptions<R>,
  fn: () => R,
): R {
  const start = performance.now();
  try {
    const result = fn();
    const latency_ms = performance.now() - start;
    const usage = opts.extractUsage?.(result);
    const { prompt_tokens, completion_tokens } = normalizeUsage(usage);
    recordAgentInvocation({
      agent: opts.agent,
      model: opts.model ?? 'stub',
      prompt_tokens,
      completion_tokens,
      latency_ms,
      success: true,
      cache_hit: opts.cache_hit,
      project_id: opts.project_id,
    });
    return result;
  } catch (err) {
    const latency_ms = performance.now() - start;
    recordAgentInvocation({
      agent: opts.agent,
      model: opts.model ?? 'stub',
      prompt_tokens: 0,
      completion_tokens: 0,
      latency_ms,
      success: false,
      project_id: opts.project_id,
      error_kind: err instanceof Error ? err.name : 'UnknownError',
    });
    if (_transport) {
      _transport.captureException(err, {
        tags: { agent: opts.agent },
        extra: { project_id: opts.project_id, latency_ms },
      });
    }
    throw err;
  }
}
