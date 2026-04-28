---
slug: airbnb
name: Airbnb
kind: public
hq: San Francisco, California
website: https://www.airbnb.com
last_verified: 2026-04-23
verification_status: partial
reviewer: curator@c1v-kb8-atlas
data_quality_grade: Q2
primary_source:
  tier: A_sec_filing
  source_url: https://www.sec.gov/Archives/edgar/data/1559720/000155972026000004/abnb-20251231.htm
  anchor: "FY2025 10-K — revenue, economics, scale KPIs"
scale:
  metric: gmv_usd_annual
  value: 95000000000
  as_of: "2025"
  citation:
    kb_source: airbnb
    source_url: https://www.sec.gov/Archives/edgar/data/1559720/000155972026000004/abnb-20251231.htm
    source_tier: A_sec_filing
    publish_date: 2026-02-12
    retrieved_at: 2026-04-23T23:50:00Z
    sha256: 61bac47250511a2263631ebd99e92b1d42caf305d27ba9d9fbfa7b11aa199c02
    anchor: "FY2025 10-K — Gross Booking Value (GBV) FY25, proxy for marketplace scale; Nights and Seats Booked is Airbnb's canonical scale KPI"
    corroborated_by: []
dau_band: over_100m
revenue_usd_annual: 12200000000
infra_cost_usd_annual: null
cost_band: 100m_1b_usd
headcount_est: null
economics_citations:
  - kb_source: airbnb
    source_url: https://www.sec.gov/Archives/edgar/data/1559720/000155972026000004/abnb-20251231.htm
    source_tier: A_sec_filing
    publish_date: 2026-02-12
    retrieved_at: 2026-04-23T23:50:00Z
    sha256: 61bac47250511a2263631ebd99e92b1d42caf305d27ba9d9fbfa7b11aa199c02
    anchor: "FY2025 10-K — revenue $12.2B (+10%), cost of revenue $2,086M, R&D $2,354M, operating income $2,544M, net income $2,511M"
    corroborated_by: []
frontend:
  web: [react, typescript]
  mobile: [swift, swiftui, kotlin, jetpack_compose]
backend:
  primary_langs: [ruby, java, kotlin, python, go]
  frameworks: [rails, spring_boot, dropwizard]
  runtimes: [mri_ruby, jvm, cpython]
data:
  oltp: [mysql_sharded, vitess]
  cache: [memcached, redis]
  warehouse: [s3, airflow, presto, druid]
  search: [elasticsearch, lucene_custom]
  queue: [kafka]
infra:
  cloud: [aws]
  compute: [kubernetes, ec2]
  cdn: [cloudfront, fastly]
  observability: [otel, vmagent, prometheus, victoriametrics]
  security: [himeji_authorization]
ai_stack:
  training_framework: [pytorch, transformers]
  serving: [in_house_inference_on_ec2, seq_transformer_geo_recommender]
  evals: [internal_ranking_ab_tests]
  fine_tune: [multi_task_region_plus_city_heads, sequential_booking_view_search_signals]
  rag: []
gpu_exposure: rents_long_term
inference_pattern: streaming
latency_priors: []
availability_priors: []
throughput_priors:
  - anchor: metrics_pipeline_samples_qps_2026
    description: "Airbnb's OTLP + vmagent metrics pipeline sustained throughput — 100M+ metric samples per second across the observability backend. Treated as `qps` since each sample is a write-event to vmagent's streaming aggregator."
    citation:
      kb_source: airbnb
      source_url: https://medium.com/airbnb-engineering/building-a-high-volume-metrics-pipeline-with-opentelemetry-and-vmagent-c714d6910b45
      source_tier: B_official_blog
      publish_date: 2026-04-07
      retrieved_at: 2026-04-23T23:52:00Z
      sha256: 3f8e908f0ae01d16f573c80900269537d53d1f2529873fcfaae0426d773e85f2
      bytes_integrity: captcha_wall_content_via_webfetch
      content_sha256: 8edcf53e4b2bfc5a37d8c0fe71249f42baf0356cde3efd3ebf3e7b8d86914e7e
      anchor: "§Throughput — 100M+ samples/sec sustained"
      is_ic: true
      corroborated_by: []
    confidence: 0.75
    verification_status: partial
    result_kind: scalar
    value: 100000000
    units: qps
    measurement: sustained
    window: "2026 steady-state observability pipeline"
cost_curves: []
utility_weight_hints:
  latency: 0.15
  cost: 0.15
  quality_bench: 0.15
  availability: 0.25
  safety: 0.10
  developer_velocity: 0.15
  security_compliance: 0.05
archetype_tags: [rails-majestic-monolith]
related_refs: []
nda_clean: true
ingest_script_version: "2.1.0"
---

# Airbnb

Publicly traded (NASDAQ: ABNB, IPO Dec 2020). Global travel marketplace: short-term rentals (homes), long-term rentals, and Experiences 2.0 (new "Seats" category at FY25). Core revenue metric is **Gross Booking Value (GBV)** × **take rate**, reported as "Nights and Seats Booked" KPI.

## 1. Scale & economics (FY2025)

- Revenue: **$12.2B** (+10% YoY).
- Cost of revenue: **$2,086M**.
- R&D: **$2,354M**.
- Operating income: **$2,544M** (~21% operating margin).
- Net income: **$2,511M**.
- GBV (scale.value): ~$95B (approximated; exact figure in 10-K MD&A table not extracted this pass — NEEDS_RESEARCH for precise FY25 GBV).
- Headcount: not extracted in this pass (10-K body has it; flagged NEEDS_RESEARCH for precise YE25 total).

## 2. Frontend stack

- **Web**: React + TypeScript.
- **Mobile**: Swift + SwiftUI (iOS), Kotlin + Jetpack Compose (Android).

## 3. Backend stack

- **Language mix**: Ruby (historical Rails core), Java + Kotlin + Dropwizard/Spring Boot (post-2017 service migration from monolith), Python (ML + data), Go (some infra tooling).
- **Monolith → services**: Airbnb ran a Rails "monorail" monolith through 2017, then executed a multi-year migration to a service-oriented architecture on the JVM. Rails remains for some legacy surfaces.

## 4. AI stack

From 2026-03-12 "Recommending travel destinations" post (Weiwei Guo + 11 co-authors, is_ic=true):

- **Transformer-based sequential model** for destination recommendation, language-modeling-inspired framework.
- **Multi-task architecture**: region-level + city-level prediction heads (geo hierarchy).
- **Embeddings**: city/region + temporal features (days-to-today).
- **Training signal**: 14 examples per booking (7 active + 7 dormant user labels), sourced from booking + view + search history + seasonality context.
- **Deployed surfaces**: autosuggest + abandoned-search email. "Significant booking gains in regions where English is not the primary language."

`gpu_exposure: rents_long_term` (AWS-backed GPU EC2; Airbnb has not disclosed owned-cluster).
`inference_pattern: streaming` (real-time autosuggest).

## 5. Data & storage

- **OLTP**: MySQL sharded (plus Vitess for some workloads).
- **Cache**: Memcached + Redis.
- **Warehouse**: S3 (data lake) + Airflow (orchestration, originally Airbnb-authored) + Presto (query) + Druid (realtime).
- **Search**: Elasticsearch + custom Lucene work.
- **Queue**: Kafka.

## 6. Infrastructure

- **Cloud**: AWS primary, since ~2011.
- **Compute**: Kubernetes on EC2, with EKS for managed layers.
- **CDN**: CloudFront + Fastly.
- **Observability (2026 rewrite)**: full migration off third-party vendor(s) to in-house OTLP + vmagent + Prometheus + VictoriaMetrics stack. Documented in two IC-authored posts (2026-03-17 and 2026-04-07).
- **Security**: Himeji (Airbnb-authored authorization system, per the 2026 privacy-first-connections post).

## 7. Math priors commentary

**Emitted**:
- `throughput_priors`: `metrics_pipeline_samples_qps_2026 = 100_000_000 qps sustained` — Airbnb's OTLP+vmagent observability pipeline. Rare publicly-disclosed samples/sec figure. `verification_status: partial` + `confidence: 0.75` because the source URL is behind Cloudflare Turnstile (see §8 Staleness & provenance).

**Not emitted**:
- 300M timeseries migrated (observability-ownership post) — that's a migration volume count, not a rate. Kept narrative.
- CPU overhead 10% → <1% post-OTLP — a delta, not an absolute prior anchor.
- Destination recommender throughput + latency: specific numbers NOT disclosed in the post.
- Availability: no SLA disclosed.
- Cost curves: Airbnb doesn't publish per-query or per-booking infra unit pricing.

## 8. Staleness & provenance — CAPTCHA wall caveat

All 4 Medium engineering blog posts staged by scraper are fresh (2026-03-12 to 2026-04-07, all well within 18mo) **BUT** their `sha256` values are computed against **Cloudflare Turnstile wall bytes** (5,744–5,831 bytes each), NOT the article content. Scraper's audit log + per-URL .md frontmatter flag `bytes_integrity: "CAPTCHA_WALL — content via WebFetch extraction"`.

Consequences:
- Content cited in this entry (throughput prior, ai_stack shape, stack slots) was extracted via WebFetch, which traverses the wall and returns article text.
- A future `verify-citations.ts` re-fetch via curl would re-hash the same wall and the SHA would either match (wall is deterministic) or drift (wall has timestamps). Neither scenario verifies content integrity.
- This is a **different defect** from the sha_bundle_not_url class: there the SHA was one hash reused across many URLs; here each SHA is its own URL's wall. Scraper correctly did NOT stamp article-content hashes.
- 10-K (tier-A, 2,131,290 bytes) has a clean SHA match on its `_sources/` file. Scale + economics anchors are provenance-solid.

**Proposed ledger status**: `sha_captcha_wall_content_via_webfetch` on the 4 Medium rows.

## 9. Sources

1. **Airbnb FY2025 Form 10-K** — tier `A_sec_filing` — https://www.sec.gov/Archives/edgar/data/1559720/000155972026000004/abnb-20251231.htm — published 2026-02-12 — sha256 `61bac47250511a2263631ebd99e92b1d42caf305d27ba9d9fbfa7b11aa199c02`. Source for revenue, operating income, cost of revenue, R&D. Clean per-URL hash.
2. **"Building a high-volume metrics pipeline with OpenTelemetry and vmagent"** — tier `B_official_blog`, IC-authored (Eugene Ma, Natasha Aleksandrova) — https://medium.com/airbnb-engineering/building-a-high-volume-metrics-pipeline-with-opentelemetry-and-vmagent-c714d6910b45 — published 2026-04-07 — sha256 `3f8e908f0ae01d16f573c80900269537d53d1f2529873fcfaae0426d773e85f2` (captcha wall). Content via WebFetch. Source for 100M+ samples/sec throughput prior.
3. **"From vendors to vanguard: Airbnb's hard-won lessons in observability ownership"** — tier `B_official_blog`, IC-authored (Callum Jones, Rong Hu) — https://medium.com/airbnb-engineering/from-vendors-to-vanguard-airbnbs-hard-won-lessons-in-observability-ownership-3811bf6c1ac3 — published 2026-03-17 — sha256 `34f3075ef091be276752d4c15a606e3c25dd13fc9a2cbcd293dd27182a078b1c` (captcha wall). Content via WebFetch. Source for 300M timeseries migration, vendor→in-house narrative.
4. **"Recommending travel destinations"** — tier `B_official_blog`, IC-authored (Weiwei Guo et al., 12-author list) — https://medium.com/airbnb-engineering/recommending-travel-destinations-to-help-users-explore-5fa7a81654fb — published 2026-03-12 — sha256 `35f4c47e26f6a75170f1b4d454f20b759c2c44b61d298e685056597158bde748` (captcha wall). Content via WebFetch. Source for `ai_stack` shape (transformer geo recommender).
5. **"Privacy-first connections: how Himeji powers Airbnb's authorization"** — tier `B_official_blog`, IC-authored — https://medium.com/airbnb-engineering/... (Himeji post) — sha256 `73fba4e2af41a3c681a9fde1c991a9f60c6817ec707fe761b7d8a2a8ff79f2a8` (captcha wall). Content via WebFetch. Narrative source for `infra.security: himeji_authorization`; no prior anchors extracted.

## Curator notes

- **`data_quality_grade: Q2`** — Q1 would require all citations with clean SHA-bytes-at-URL verification. 4 of 5 citations have `bytes_integrity: CAPTCHA_WALL` per scraper's flag. Content integrity is intact (WebFetch retrieved article text) but re-verify-ability via curl is broken. Q2 is the honest grade; Q1 requires a v2.2 SHA-contract that supports content-hash alongside bytes-hash.
- **`scale.metric: gmv_usd_annual`** — best approximation. Airbnb's canonical KPI is "Nights and Seats Booked" (a count KPI) but there's no `bookings_count` or `nights_booked` enum value. GBV is the dollar-denominated scale surrogate; `gmv_usd_annual` is the closest enum fit (marketplace GBV ≈ GMV semantically). Same enum-gap pattern as LinkedIn (members) and Discord (DAU). Flag for potential future enum extension like `nights_or_seats_booked`. Value $95B is approximate; precise FY25 GBV NEEDS_RESEARCH from 10-K MD&A table.
- **`dau_band: over_100m`** — Airbnb has 500M+ guests cumulatively per company history, hosts in 220+ countries. Platform scale is clearly `over_100m`. Not precisely measured from staged sources.
- **`cost_band: 100m_1b_usd`** — FY25 cost of revenue $2,086M includes all payment-processing, hosting, and customer-support costs, not pure infra. Atlas-relevant infra-only cost-band is undisclosed; `100m_1b_usd` is a defensible lower bound.
- **`headcount_est: null`** — 10-K has the figure but wasn't pulled this pass. Supplementary re-read of 10-K Item 1 would fill it.
- **`archetype_tags: [rails-majestic-monolith]`** — partial fit. Airbnb ran a Rails monorail through 2017 and then migrated to JVM services; current state is polyglot. Closest enum fit is still rails-majestic-monolith for the historical + remaining-Rails-surfaces reality. Could also fit `go-microservices-at-scale` as a multi-tag once task #34 lands multi-archetype guidance.
- **`utility_weight_hints` sum to 1.00** — marketplace-platform weighting (availability 0.25 dominant, latency + cost + quality + dev-velocity evenly distributed at 0.15 each).
- **`ai_stack` populated genuinely** — transformer-based destination recommender is a first-party customer-facing feature, not internal tooling.
- **No `latency_priors`** because no concrete numeric p50/p95/p99 anchors in fetched corpus. "Millisecond" framing appears in the observability post narrative but without distributional values.
- **SHA verification posture**: 10-K SHA verified against `_sources/10k-FY2025.htm` (2.1MB). 4 Medium blog SHAs verified to their captcha-wall bytes in `_sources/` (5.7–5.8KB each). Content extracted via WebFetch, not sourced from the `_sources/` bytes.
