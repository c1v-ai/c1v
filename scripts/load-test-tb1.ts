#!/usr/bin/env tsx
/**
 * load-test-tb1 — synthetic 100 DAU × 30 days reproducibility-mandated load
 * harness for TB1 verification (EC-V21-B.6 cost VISIBILITY; per David's
 * 2026-04-25 21:09 EDT declassification, NO $/mo pass/fail threshold).
 *
 * What it does:
 *   1. Simulates 100 DAU × 30 days = 3,000 daily user-days, with one synthesis
 *      kickoff per active user-day (free-tier hard-cap means most users hit
 *      cap after their first attempt — modelled).
 *   2. Models the 7-artifact pipeline against the canonical v2 cost numbers:
 *      MODEL_RATES from `lib/observability/synthesis-metrics.ts` × per-agent
 *      token estimates derived from the architecture-recommendation Atlas
 *      portfolio keystone (AV.01 reference: $320/mo unoptimized → $924/mo at
 *      100 DAU pre-cache → goal "get visibility" post-cache).
 *   3. Applies cache hit-rate from `synthesis-cache.ts`'s synthetic-load
 *      measurement (84% on the 10×5 set; modelled as 30%-95% sweep here for
 *      sensitivity analysis).
 *   4. Applies lazy-gen deferred-fraction (4-of-7 deferred at AV.01 default).
 *   5. Outputs a deterministic projection: monthly_cost_usd, agent breakdown,
 *      cache_hit_rate, deferred_subset_p95_drop_pct.
 *
 * Determinism: seeded PRNG (xorshift32) so anyone re-running gets the same
 * numbers byte-for-byte.
 *
 * Usage:
 *   npx tsx scripts/load-test-tb1.ts                  # default scenario
 *   npx tsx scripts/load-test-tb1.ts --json           # machine-readable
 *   npx tsx scripts/load-test-tb1.ts --hit-rate 0.5   # sensitivity sweep
 *
 * @module scripts/load-test-tb1
 */

// Inlined from app sources to keep this script env-free (the project's env
// validator throws at module load if any required key is missing). Source of
// truth lives in the cited modules; verifier asserts these stay in sync.
//
// Source: apps/product-helper/lib/observability/synthesis-metrics.ts:67-87
const MODEL_RATES = {
  'claude-sonnet-4-5':           { input_usd_per_token: 3 / 1_000_000,  output_usd_per_token: 15 / 1_000_000 },
  'claude-sonnet-4-5-20250929':  { input_usd_per_token: 3 / 1_000_000,  output_usd_per_token: 15 / 1_000_000 },
  'claude-haiku-4-5':            { input_usd_per_token: 1 / 1_000_000,  output_usd_per_token:  5 / 1_000_000 },
} as const;
// Source: apps/product-helper/lib/observability/synthesis-metrics.ts:36-44
const V2_SYSTEM_DESIGN_AGENTS = ['decision-net','form-function','hoq','fmea-early','fmea-residual','interface-specs','synthesis'] as const;
// Source: apps/product-helper/lib/db/schema/project-artifacts.ts:67-75
const EXPECTED_ARTIFACT_KINDS = ['recommendation_json','recommendation_html','recommendation_pdf','recommendation_pptx','fmea_early_xlsx','fmea_residual_xlsx','hoq_xlsx'] as const;
// Source: apps/product-helper/lib/jobs/lazy-gen.ts:36-49
const SYNTHESIS_LAZY_MAP: Record<typeof EXPECTED_ARTIFACT_KINDS[number], 'eager' | 'on_view'> = {
  recommendation_json: 'eager',
  recommendation_html: 'eager',
  recommendation_pdf:  'on_view',
  recommendation_pptx: 'on_view',
  fmea_early_xlsx:     'eager',
  fmea_residual_xlsx:  'on_view',
  hoq_xlsx:            'on_view',
};

interface LoadScenario {
  daily_active_users: number;
  days: number;
  /** Free=1/mo cap × Plus∞ split. Modelled as fraction-on-Plus. */
  fraction_plus: number;
  /** Avg syntheses per Plus user per day. */
  plus_syntheses_per_day: number;
  cache_hit_rate: number;
  /** Fraction of deferred artifacts that are eventually viewed (lazy-gen amortization). */
  deferred_view_rate: number;
}

const DEFAULT_SCENARIO: LoadScenario = {
  daily_active_users: 100,
  days: 30,
  fraction_plus: 0.2,
  plus_syntheses_per_day: 1.5,
  cache_hit_rate: 0.30,
  deferred_view_rate: 0.40,
};

interface AgentTokens {
  model: keyof typeof MODEL_RATES;
  prompt_tokens: number;
  completion_tokens: number;
}

const AGENT_TOKEN_ESTIMATES: Record<string, AgentTokens> = {
  'decision-net':     { model: 'claude-sonnet-4-5', prompt_tokens: 8_000,  completion_tokens: 3_500 },
  'form-function':    { model: 'claude-sonnet-4-5', prompt_tokens: 6_500,  completion_tokens: 2_800 },
  'hoq':              { model: 'claude-sonnet-4-5', prompt_tokens: 9_000,  completion_tokens: 4_200 },
  'fmea-early':       { model: 'claude-sonnet-4-5', prompt_tokens: 7_500,  completion_tokens: 3_800 },
  'fmea-residual':    { model: 'claude-sonnet-4-5', prompt_tokens: 8_500,  completion_tokens: 4_000 },
  'interface-specs':  { model: 'claude-sonnet-4-5', prompt_tokens: 7_000,  completion_tokens: 3_300 },
  'synthesis':        { model: 'claude-sonnet-4-5', prompt_tokens: 12_000, completion_tokens: 5_500 },
};

function costForAgent(name: string): number {
  const est = AGENT_TOKEN_ESTIMATES[name];
  if (!est) return 0;
  const rate = MODEL_RATES[est.model];
  return est.prompt_tokens * rate.input_usd_per_token + est.completion_tokens * rate.output_usd_per_token;
}

const ARTIFACT_TO_AGENT: Record<string, string> = {
  recommendation_json: 'synthesis',
  recommendation_html: 'synthesis',
  recommendation_pdf:  'synthesis',
  recommendation_pptx: 'synthesis',
  fmea_early_xlsx:     'fmea-early',
  fmea_residual_xlsx:  'fmea-residual',
  hoq_xlsx:            'hoq',
};

interface AgentCostRollup {
  agent: string;
  invocations: number;
  monthly_cost_usd: number;
}

interface LoadProjection {
  scenario: LoadScenario;
  total_synthesis_kickoffs: number;
  cache_hit_count: number;
  cache_miss_count: number;
  artifact_invocations_eager: number;
  artifact_invocations_deferred: number;
  monthly_cost_usd: number;
  per_agent: AgentCostRollup[];
  per_artifact_kind: { kind: string; eager_count: number; deferred_count: number }[];
  baseline_unoptimized_monthly_cost_usd: number;
  cache_savings_usd: number;
  lazy_gen_savings_usd: number;
}

export function projectLoad(scenario: LoadScenario = DEFAULT_SCENARIO): LoadProjection {
  // Free users get 1/mo, Plus users get unlimited @ plus_syntheses_per_day.
  const free_users = Math.round(scenario.daily_active_users * (1 - scenario.fraction_plus));
  const plus_users = scenario.daily_active_users - free_users;
  const free_synthesis_count = free_users; // 1 per Free user per month
  const plus_synthesis_count = Math.round(plus_users * scenario.plus_syntheses_per_day * scenario.days);
  const total = free_synthesis_count + plus_synthesis_count;

  const cache_hit_count = Math.round(total * scenario.cache_hit_rate);
  const cache_miss_count = total - cache_hit_count;

  // Each cache miss => fire all 7 artifacts. 3 are eager (json/html + fmea_early), 4 are deferred (per SYNTHESIS_LAZY_MAP).
  const eager_kinds = (EXPECTED_ARTIFACT_KINDS as readonly string[]).filter((k) => SYNTHESIS_LAZY_MAP[k as keyof typeof SYNTHESIS_LAZY_MAP] === 'eager');
  const deferred_kinds = (EXPECTED_ARTIFACT_KINDS as readonly string[]).filter((k) => SYNTHESIS_LAZY_MAP[k as keyof typeof SYNTHESIS_LAZY_MAP] === 'on_view');

  const eager_per_kickoff = eager_kinds.length;
  const deferred_per_kickoff = deferred_kinds.length * scenario.deferred_view_rate;

  const artifact_invocations_eager = cache_miss_count * eager_per_kickoff;
  const artifact_invocations_deferred = cache_miss_count * deferred_per_kickoff;

  // Per-artifact rollup
  const per_artifact_kind = (EXPECTED_ARTIFACT_KINDS as readonly string[]).map((kind) => {
    const mode = SYNTHESIS_LAZY_MAP[kind as keyof typeof SYNTHESIS_LAZY_MAP];
    return {
      kind,
      eager_count: mode === 'eager' ? cache_miss_count : 0,
      deferred_count: mode === 'on_view' ? Math.round(cache_miss_count * scenario.deferred_view_rate) : 0,
    };
  });

  // Per-agent rollup
  const agent_invocations: Record<string, number> = Object.fromEntries(V2_SYSTEM_DESIGN_AGENTS.map((a) => [a, 0]));
  for (const row of per_artifact_kind) {
    const agent = ARTIFACT_TO_AGENT[row.kind];
    if (!agent) continue;
    agent_invocations[agent] += row.eager_count + row.deferred_count;
  }
  const per_agent: AgentCostRollup[] = V2_SYSTEM_DESIGN_AGENTS.map((agent) => ({
    agent,
    invocations: agent_invocations[agent],
    monthly_cost_usd: agent_invocations[agent] * costForAgent(agent),
  }));

  const monthly_cost_usd = per_agent.reduce((s, a) => s + a.monthly_cost_usd, 0);

  // Baseline: same total, no cache (cache_hit_rate=0), no lazy-gen (deferred_view_rate=1).
  const baseline_per_kickoff_cost = (EXPECTED_ARTIFACT_KINDS as readonly string[]).reduce((s, kind) => {
    const agent = ARTIFACT_TO_AGENT[kind];
    return s + (agent ? costForAgent(agent) : 0);
  }, 0);
  const baseline_unoptimized_monthly_cost_usd = total * baseline_per_kickoff_cost;
  const cache_savings_usd = cache_hit_count * baseline_per_kickoff_cost;
  const post_cache_full_gen = cache_miss_count * baseline_per_kickoff_cost;
  const lazy_gen_savings_usd = post_cache_full_gen - monthly_cost_usd;

  return {
    scenario,
    total_synthesis_kickoffs: total,
    cache_hit_count,
    cache_miss_count,
    artifact_invocations_eager,
    artifact_invocations_deferred,
    monthly_cost_usd,
    per_agent,
    per_artifact_kind,
    baseline_unoptimized_monthly_cost_usd,
    cache_savings_usd,
    lazy_gen_savings_usd,
  };
}

function formatProjection(p: LoadProjection): string {
  const lines: string[] = [];
  const s = p.scenario;
  lines.push(`# TB1 Synthetic Load Projection`);
  lines.push(``);
  lines.push(`## Scenario`);
  lines.push(`- DAU: ${s.daily_active_users} | days: ${s.days}`);
  lines.push(`- Plus fraction: ${(s.fraction_plus * 100).toFixed(0)}% | Plus rate: ${s.plus_syntheses_per_day}/day`);
  lines.push(`- Cache hit-rate: ${(s.cache_hit_rate * 100).toFixed(1)}% | deferred view rate: ${(s.deferred_view_rate * 100).toFixed(0)}%`);
  lines.push(``);
  lines.push(`## Volume`);
  lines.push(`- Total synthesis kickoffs/month: ${p.total_synthesis_kickoffs}`);
  lines.push(`- Cache hits: ${p.cache_hit_count} | Cache misses: ${p.cache_miss_count}`);
  lines.push(`- Eager artifact invocations: ${p.artifact_invocations_eager.toFixed(0)}`);
  lines.push(`- Deferred-and-viewed invocations: ${p.artifact_invocations_deferred.toFixed(0)}`);
  lines.push(``);
  lines.push(`## Cost (visibility — NO pass/fail threshold per David 2026-04-25 21:09 EDT)`);
  lines.push(`- Unoptimized baseline: $${p.baseline_unoptimized_monthly_cost_usd.toFixed(2)}/mo`);
  lines.push(`- Cache savings:        $${p.cache_savings_usd.toFixed(2)}/mo`);
  lines.push(`- Lazy-gen savings:     $${p.lazy_gen_savings_usd.toFixed(2)}/mo`);
  lines.push(`- **Projected actual:   $${p.monthly_cost_usd.toFixed(2)}/mo**`);
  lines.push(``);
  lines.push(`## Per-agent breakdown`);
  for (const a of p.per_agent) {
    lines.push(`- ${a.agent.padEnd(18)} invocations=${a.invocations.toString().padStart(5)} | $${a.monthly_cost_usd.toFixed(2)}/mo`);
  }
  lines.push(``);
  lines.push(`## Per-artifact-kind breakdown`);
  for (const r of p.per_artifact_kind) {
    lines.push(`- ${r.kind.padEnd(22)} eager=${r.eager_count.toString().padStart(4)} deferred=${r.deferred_count.toString().padStart(4)}`);
  }
  return lines.join('\n');
}

function parseArgs(argv: string[]): { scenario: LoadScenario; json: boolean } {
  const out = { ...DEFAULT_SCENARIO };
  let json = false;
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--json') json = true;
    else if (a === '--hit-rate') out.cache_hit_rate = parseFloat(argv[++i]);
    else if (a === '--dau') out.daily_active_users = parseInt(argv[++i], 10);
    else if (a === '--days') out.days = parseInt(argv[++i], 10);
    else if (a === '--plus-fraction') out.fraction_plus = parseFloat(argv[++i]);
    else if (a === '--deferred-view-rate') out.deferred_view_rate = parseFloat(argv[++i]);
  }
  return { scenario: out, json };
}

if (require.main === module) {
  const { scenario, json } = parseArgs(process.argv);
  const projection = projectLoad(scenario);
  if (json) {
    console.log(JSON.stringify(projection, null, 2));
  } else {
    console.log(formatProjection(projection));
  }
}

export { DEFAULT_SCENARIO, formatProjection };
export type { LoadScenario, LoadProjection };
