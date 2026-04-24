---
slug: shopify
name: Shopify
kind: public
hq: Ottawa, Canada
website: https://www.shopify.com
last_verified: 2026-04-23
verification_status: verified
reviewer: curator@c1v-kb8-atlas
data_quality_grade: Q1
primary_source:
  tier: A_sec_filing
  source_url: https://www.sec.gov/Archives/edgar/data/1594805/000159480526000007/shop-20251231.htm
scale:
  metric: gmv_usd_annual
  value: 378400000000
  as_of: "2025"
  citation:
    kb_source: shopify
    source_url: https://www.sec.gov/Archives/edgar/data/1594805/000159480526000007/shop-20251231.htm
    source_tier: A_sec_filing
    publish_date: 2026-02-11
    retrieved_at: 2026-04-22
    sha256: 57f18fb1f3e3eda7342861d765a61a01d262c4e8ba6593fe1c7d51d6ebc6e983
    corroborated_by: []
dau_band: over_100m
revenue_usd_annual: 11556000000
infra_cost_usd_annual: null
cost_band: 100m_1b_usd
headcount_est: 7600
economics_citations:
  - kb_source: shopify
    source_url: https://www.sec.gov/Archives/edgar/data/1594805/000159480526000007/shop-20251231.htm
    source_tier: A_sec_filing
    publish_date: 2026-02-11
    retrieved_at: 2026-04-22
    sha256: 57f18fb1f3e3eda7342861d765a61a01d262c4e8ba6593fe1c7d51d6ebc6e983
    corroborated_by: []
frontend:
  web: [react, typescript, hydrogen, remix]
  mobile: [swift, kotlin, react_native]
backend:
  primary_langs: [ruby, go, rust, cpp]
  frameworks: [rails, grpc]
  runtimes: [mri_ruby, go_runtime]
data:
  oltp: [mysql, vitess]
  cache: [memcached, redis]
  warehouse: [bigquery]
  search: [custom_cpp_rankflow, turbodsl]
  queue: [kafka]
infra:
  cloud: [gcp]
  compute: [kubernetes, gke]
  cdn: [cloudflare, fastly]
  observability: [datadog]
gpu_exposure: rents_long_term
inference_pattern: batch
latency_priors: []
availability_priors: []
cost_curves: []
throughput_priors:
  - anchor: bfcm_2024_peak_edge_rpm
    description: "Peak edge-layer request rate at Black Friday 2024, published in Shopify's 2025-11-20 BFCM readiness post as the 2024 ceiling and the basis for 2025 capacity targets."
    citation:
      kb_source: shopify
      source_url: https://shopify.engineering/bfcm-readiness-2025
      source_tier: B_official_blog
      publish_date: 2025-11-20
      retrieved_at: 2026-04-22T00:08:00Z
      sha256: f218cd69eae9a800e502fa29ce6ad56f115d38d9a9ee0655aecf55127161f2c4
      anchor: "§Breaking records — 284M RPM edge peak during BFCM 2024"
      is_ic: true
      corroborated_by: []
    confidence: 0.95
    verification_status: verified
    result_kind: scalar
    value: 284000000
    units: rpm
    measurement: peak_burst
    window: "BFCM 2024 peak minute"
  - anchor: bfcm_2024_peak_app_rpm
    description: "Peak app-server request rate (post-edge, on application tier) during BFCM 2024, same source as the edge anchor above."
    citation:
      kb_source: shopify
      source_url: https://shopify.engineering/bfcm-readiness-2025
      source_tier: B_official_blog
      publish_date: 2025-11-20
      retrieved_at: 2026-04-22T00:08:00Z
      sha256: f218cd69eae9a800e502fa29ce6ad56f115d38d9a9ee0655aecf55127161f2c4
      anchor: "§Breaking records — 80M RPM app-server peak during BFCM 2024"
      is_ic: true
      corroborated_by: []
    confidence: 0.95
    verification_status: verified
    result_kind: scalar
    value: 80000000
    units: rpm
    measurement: peak_burst
    window: "BFCM 2024 peak minute"
  - anchor: scale_test_2025_p99_rpm
    description: "October 2025 fifth-and-final pre-BFCM scale test target rate at the p99 of forecasted traffic assumptions (Shopify load-testing framework Genghis, three-region distributed load)."
    citation:
      kb_source: shopify
      source_url: https://shopify.engineering/bfcm-readiness-2025
      source_tier: B_official_blog
      publish_date: 2025-11-20
      retrieved_at: 2026-04-22T00:08:00Z
      sha256: f218cd69eae9a800e502fa29ce6ad56f115d38d9a9ee0655aecf55127161f2c4
      anchor: "§Scale tests — 200M RPM p99 achieved on last test of year"
      is_ic: true
      corroborated_by: []
    confidence: 0.9
    verification_status: verified
    result_kind: scalar
    value: 200000000
    units: rpm
    measurement: p99_window
    window: "5-minute scale-test window, October 2025"
archetype_tags: [rails-majestic-monolith]
related_refs: []
nda_clean: true
ingest_script_version: "0.1.0"
---

# Shopify

Canadian commerce platform (NYSE: SHOP; TSX: SHOP); majestic-Rails monolith operated
across a global multi-region Google Cloud footprint. FY2025 facilitated GMV of $378.4B
(+29% YoY), total revenue $11.556B, merchant solutions revenue $8.8B (76% of total).
Approximately 7,600 employees as of 2025-12-31. Merchants in 175+ countries (44% US,
31% EMEA, 16% APAC, 5% Canada, 5% LATAM).

## Scale anchor (BFCM 2024)

From the 2025-11-20 BFCM readiness post (tier B, IC-authored by Kyle Petroski and
Matthew Frail):

- Edge peak: 284M req/min; app-server peak: 80M req/min; 12 TB/min throughput
- 57.3 PB of data during the weekend
- 10.5T database queries, 1.17T database writes
- 1.19T edge requests
- Scale-test target capacity p99: 200M RPM (October 2025)

Three of these are now recorded as `throughput_priors` entries in frontmatter (architect
landed the `ThroughputPrior` schema extension 2026-04-23 per task #31): the 284M RPM
edge peak and 80M RPM app-server peak from BFCM 2024 (both `measurement: peak_burst`),
plus the 200M RPM p99 scale-test result from October 2025 (`measurement: p99_window`).
The remaining numbers (12 TB/min throughput, 57.3 PB weekend data volume, 10.5T DB
queries, 1.17T DB writes, 1.19T edge requests) are aggregates, not rates, and don't fit
the scalar-rate shape — kept in prose.

BFCM does not disclose numeric percentile **latencies** nor availability fractions, so
`latency_priors` and `availability_priors` remain empty.

## Stack narrative

- **Monolith + Vitess-sharded MySQL**: Rails "majestic monolith" is the canonical
  runtime; MySQL via Vitess underlies OLTP.
- **Search**: custom C++ engine (RankFlow DSL + TurboDSL execution engine). March 2025
  Vantage Discovery acquisition brought consumer-discovery expertise. TurboDSL achieves
  48% speedup vs prior engine (SimScorerDSL). Serves "billions of queries during BFCM."
- **ML platform**: GCP primary, with neo-cloud partners (Nebius) for training clusters
  and CentML for accelerated GPU inference. Direct deployments of frontier-lab models
  for Sidekick (internal copilot) and evaluations; unconstrained early access to frontier
  models per ML blog.
- **Streaming/queue**: Kafka (partition-constrained during 2025 analytics migration per
  BFCM post; expanded before BFCM 2025).
- **CDN**: Cloudflare + Fastly edge (multi-provider for redundancy).

## Resilience posture

Game Days (chaos), five scale tests Apr-Oct 2025 at 146M RPM → 200M RPM p99; regional
failover drills across us-central, us-east, europe-west4. Toxiproxy (OSS, Shopify-built)
for network fault injection.

## Sources

See SOURCES.md — 4 citations staged (10-K, BFCM, ML-at-Shopify, product-search).

## Curator notes

- `gmv_usd_annual` chosen over `daily_active_users` per scaleMetricSchema — Shopify
  reports GMV + merchants, not DAU. Merchant count is "millions" (imprecise).
- `dau_band: over_100m` inferred from 284M edge-req/min peak (order-of-magnitude
  proxy; buyer DAU not directly disclosed).
- `cost_band: 100m_1b_usd` inferred from gross-profit margin envelope; actual infra
  cost undisclosed → `infra_cost_usd_annual: null`.
- **Upgraded to Q1 (2026-04-23)** — architect landed `throughput_priors` schema extension
  (task #31). 3 throughput priors now populated from the BFCM readiness post (tier B +
  `is_ic: true`, SHA-verified). §6.3-compliant, counts toward `current_valid`.
- The BFCM post's product-search section mentions "millisecond latency at scale" but
  no concrete p95/p99 value — no `latency_prior` emitted from it. Similarly the resilience
  narrative describes game days but no availability SLA number is disclosed.
