# Cost Telemetry Runbook — TB1 / Wave B (EC-V21-B.6)

**Posture (locked 2026-04-25 by David):** "we are moving forward
regardless of cost."

Cost is **instrumented for visibility, NOT a ship-blocker**. There are
**NO alert thresholds in v2.1**. Operators read the dashboard;
nobody gets paged on $/mo.

This runbook tells an operator how to (a) find the cost data, (b) drill
into a per-agent overrun, and (c) reproduce the math against the
synthetic load test. It does **not** define escalation thresholds — by
design.

---

## 1. Where the data lives

| Layer | Source | Path |
| --- | --- | --- |
| In-process counters | `getCounters()` reads | `apps/product-helper/lib/observability/synthesis-metrics.ts` |
| Sentry events | `agent_invocation:<agent-name>` | `extra.cost_usd`, `extra.prompt_tokens`, `extra.completion_tokens` |
| Sentry dashboards | YAML config-as-code | `plans/v21-outputs/tb1/sentry-dashboards/` |
| Synthetic load test | reproducibility script | `apps/product-helper/scripts/load-test-tb1.ts` (TB1 verifier owns) |

The top-line cost panel (`00-top-line-cost.yaml`) is the operator's
default landing page. It rolls daily burn across all 7 instrumented
agents.

## 2. Drilling into a per-agent cost spike

1. Open the top-line cost panel. Identify which day stepped up.
2. Open `agent-<offender>.yaml`'s `daily_cost` panel for the same day.
3. Cross-reference latency_p99 + failure_rate panels on the same dashboard:
   - High failure rate + spike → retry loop. Check
     `agent_invocation:<agent>` events with `tag.success=='false'` and
     read the `error_kind` extra.
   - Steady success + spike → traffic-driven (unit cost is unchanged but
     volume rose) — confirm by dividing daily cost by daily invocations
     against the per-model rate table in
     `MODEL_RATES` (`synthesis-metrics.ts`).
   - Unit cost rose → model swap. Inspect `tag.model` distribution.
4. If an unfamiliar `tag.model` appears, that is a deploy-side change —
   diff `lib/langchain/agents/system-design/*` against the last release
   tag.

## 3. Reproducing the math against synthetic load

The verifier ships a synthetic-load script
(`apps/product-helper/scripts/load-test-tb1.ts`, owned by TB1's verifier
agent) that simulates 100 DAU × 30 days. To reproduce a per-day cost
projection:

```bash
cd apps/product-helper
POSTGRES_URL=stub AUTH_SECRET=stubstubstubstubstubstubstubstubstub \
  ANTHROPIC_API_KEY=sk-ant-stub STRIPE_SECRET_KEY=sk_test_stub \
  STRIPE_WEBHOOK_SECRET=whsec_stub OPENROUTER_API_KEY=stub \
  BASE_URL=http://localhost:3000 \
  pnpm tsx scripts/load-test-tb1.ts
```

The script reads `MODEL_RATES` directly from `synthesis-metrics.ts` so
the projection is byte-equivalent to whatever production charges
against. If a new model is added to the agents, update the rate table
**and** re-run the load test. The two MUST stay in sync.

## 4. Reading the in-process counters

For a quick local read (e.g., during a smoke test or in CI), import
`getCounters()`:

```ts
import { getCounters, percentile } from '@/lib/observability/synthesis-metrics';

const c = getCounters();
console.log({
  hoq_p95_ms: percentile(c.agents.hoq.latency_ms_samples, 95),
  hoq_cost_usd_total: c.agents.hoq.cost_usd_total,
  cache_hit_rate_pct: c.system.cache_hits / (c.system.cache_hits + c.system.cache_misses) * 100,
});
```

Counters are a fast-read local view bounded to 1000 latency samples per
agent / route. For multi-instance prod, Sentry is the source of truth.

## 5. What this runbook does NOT cover

- **Alert thresholds.** Per David's 2026-04-25 directive, none exist in
  v2.1. If/when we re-introduce them in v2.2+, this runbook gets a
  §6 "Escalation" section. Until then, escalation is operator
  discretion.
- **Sentry quota management.** Sampling discipline (100% on errors, 10%
  on success) is encoded in `synthesis-metrics.ts`; operators don't
  tune it from the dashboard. If Sentry quota runs hot, drop the
  success-sample rate in code.
- **Cost forecasting.** Out of scope for v2.1. Read the trailing 30-day
  burn panel for a manual extrapolation.

## 6. Reference

- Source: `apps/product-helper/lib/observability/synthesis-metrics.ts`
- Tests: `apps/product-helper/__tests__/observability/synthesis-metrics.test.ts`
- Dashboards: `plans/v21-outputs/tb1/sentry-dashboards/`
- v2.1 spec: `.claude/plans/team-spawn-prompts-v2.1.md` §TB1
- Master plan: `plans/c1v-MIT-Crawley-Cornell.v2.1.md` Wave B / EC-V21-B.6
