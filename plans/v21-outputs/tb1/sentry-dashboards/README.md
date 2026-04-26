# Sentry Dashboards — TB1 / Wave B (EC-V21-B.5)

YAML config-as-code definitions for the Sentry panels backing TB1's
observability slice. One dashboard per v2 agent + a top-line cost panel +
a system-overview panel — 9 dashboards total.

| File | Title | Scope |
| --- | --- | --- |
| `00-top-line-cost.yaml` | Top-line synthesis cost (USD/day, USD/month) | EC-V21-B.6 |
| `agent-decision-net.yaml` | Latency p50/p95/p99, cost, failure rate, cache hit | decision-net |
| `agent-form-function.yaml` | " | form-function |
| `agent-hoq.yaml` | " | hoq |
| `agent-fmea-early.yaml` | " | fmea-early |
| `agent-fmea-residual.yaml` | " | fmea-residual |
| `agent-interface-specs.yaml` | " | interface-specs |
| `agent-synthesis.yaml` | " | synthesis (architecture-recommendation) |
| `system-overview.yaml` | Route p95 + cold starts + cache hit rate + deferred-gen | cross-cutting |

## Cost-as-blocker posture

**Declassified 2026-04-25 by David:** "we are moving forward regardless
of cost." Cost is INSTRUMENTED for visibility. **There are NO alert
thresholds in v2.1.** Operators read the dashboard; they do not get
paged on $/mo.

## Wiring

The YAML is a portable description. Sentry's UI does not auto-import
YAML, so an operator (or a future provisioner script) translates each
panel definition into a Sentry Dashboard widget by hand or via the
Sentry API. The schema mirrors widely-used dashboard-as-code conventions
(Grafana / Datadog) intentionally so the same definitions can be reused
if we move providers later.

## Source events

All panels query the `agent_invocation:*`, `route_hit:*`, `node_*`,
`cold_start`, and `deferred_artifact_gen_on_view` message names emitted
by `apps/product-helper/lib/observability/synthesis-metrics.ts`.

The transport is pluggable. Production wires `@sentry/nextjs` via
`setSentryTransport()` at process boot; tests inject a mock; absence
of any transport makes all emitters no-ops.
