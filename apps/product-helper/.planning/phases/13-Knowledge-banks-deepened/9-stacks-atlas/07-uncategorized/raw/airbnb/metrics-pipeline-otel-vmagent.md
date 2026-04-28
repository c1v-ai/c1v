---
source_url: "https://medium.com/airbnb-engineering/building-a-high-volume-metrics-pipeline-with-opentelemetry-and-vmagent-c714d6910b45"
retrieved_at: "2026-04-23T23:52:00Z"
publish_date: "2026-04-07"
source_tier: "B_official_blog"
sha256: "3f8e908f0ae01d16f573c80900269537d53d1f2529873fcfaae0426d773e85f2"
bytes: 5813
filing_type: "blog"
author: "Eugene Ma, Natasha Aleksandrova"
is_ic: true
bytes_integrity: "CAPTCHA_WALL — raw HTML fetched via curl from medium.com returns Cloudflare Turnstile bot-check (5,813 bytes, not the real article). SHA256 is of the wall bytes. Content below was extracted via WebFetch (different code path that renders the article). Curator: do NOT re-verify SHA against source_url — you will get a fresh captcha wall with different hash. Content authority is from WebFetch extraction; captcha bytes preserved for the audit-log integrity chain, not re-fetchable at stable hash."
---

# Building a high-volume metrics pipeline with OpenTelemetry and vmagent (Airbnb)

Raw captcha-wall bytes at `_sources/metrics-pipeline-otel-vmagent.html`. Content below extracted via WebFetch 2026-04-23. Senior engineer bylines — **is_ic=true**.

## Scale metrics (tier B + is_ic, FRESH 2026-04-07)

| Metric | Value |
|---|---|
| **Samples per second processed** | **>100 million** |
| Production aggregator count | Hundreds |
| CPU overhead reduction (post-OTLP) | 10% → **<1%** |
| Per-instance delta temporality threshold | 10K+ samples/sec |

## Stack

- **Collection**: OpenTelemetry Protocol (OTLP) + OTel Collector
- **Aggregation**: vmagent (VictoriaMetrics) with streaming aggregation
- **Storage**: Prometheus-based backend
- **Legacy fallback**: StatsD / DogStatsD during dual-write migration
- **Sharding**: consistent hashing
- **Tiering**: two-tier vmagent (stateless routers + aggregator nodes)

## Architectural claims

- **"Zero injection"** approach solves sparse counter undercounting in Prometheus
- Delta temporality adopted for high-volume services
- Dual-write pattern (StatsD + OTLP) during migration preserved existing dashboards
- Streaming aggregation achieves "order of magnitude" cost reduction vs stored-cardinality approach
- OTLP enables exponential histograms (vs classic histograms)

## Interpretation for priors

- **Throughput prior (blocked by schema gap #31/#36)**: 100M+ samples/sec sustained is a dense tier-B throughput anchor. Can't express as a current-schema prior; narrative-only.
- **Cost_curve hint**: "order of magnitude cost reduction" vs vendor — supports Airbnb's observability-ownership migration (see companion post `observability-ownership-vendor-migration.md`).
- **Stack narrative**: OTLP + vmagent + Prometheus is 2026 best-practice mid-scale observability. Pair with observability-ownership for the full migration story.

## Staleness

2026-04-07 — very fresh (16 days).