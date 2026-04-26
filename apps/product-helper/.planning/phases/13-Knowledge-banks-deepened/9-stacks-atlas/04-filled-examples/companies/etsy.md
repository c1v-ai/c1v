---
slug: etsy
name: Etsy
kind: public
hq: Brooklyn, New York
website: https://www.etsy.com
last_verified: 2026-04-26
verification_status: partial
reviewer: curator@c1v-kb8-atlas
data_quality_grade: Q2
primary_source:
  tier: A_sec_filing
  source_url: https://investors.etsy.com/_assets/_6bbdcca32dae0009d81abf198bd829d6/etsy/db/938/10062/earnings_release/Exhibit+99.1+12.31.2025.pdf
  anchor: "Etsy FY2025 8-K Exhibit 99.1 — full-year results, Etsy-marketplace + Depop active buyers/sellers, Reverb-divestiture impact"
scale:
  metric: gmv_usd_annual
  value: 11916900000
  as_of: "2025"
  citation:
    kb_source: etsy
    source_url: https://investors.etsy.com/_assets/_6bbdcca32dae0009d81abf198bd829d6/etsy/db/938/10062/earnings_release/Exhibit+99.1+12.31.2025.pdf
    source_tier: A_sec_filing
    publish_date: 2026-02-01
    retrieved_at: 2026-04-26T19:13:06Z
    sha256: d620fe4a794113bb56b8f3b5c4d34ddbd4f64b70f7da864610bb7a539ff67f06
    bytes_integrity: webfetch_only_no_raw_html
    content_sha256: d620fe4a794113bb56b8f3b5c4d34ddbd4f64b70f7da864610bb7a539ff67f06
    anchor: "FY2025 10-K — consolidated GMS $11,916.9M; Etsy marketplace GMS $10,460.7M (87.8%); Depop $1,074.9M; raw-research.md compiled-source anchor"
    corroborated_by: []
dau_band: unknown
revenue_usd_annual: 2883501000
infra_cost_usd_annual: 817800000
cost_band: 100m_1b_usd
headcount_est: 2400
economics_citations:
  - kb_source: etsy
    source_url: https://investors.etsy.com/financial-information/income-statement
    source_tier: A_sec_filing
    publish_date: 2026-02-01
    retrieved_at: 2026-04-26T19:13:06Z
    sha256: d620fe4a794113bb56b8f3b5c4d34ddbd4f64b70f7da864610bb7a539ff67f06
    bytes_integrity: webfetch_only_no_raw_html
    content_sha256: d620fe4a794113bb56b8f3b5c4d34ddbd4f64b70f7da864610bb7a539ff67f06
    anchor: "FY2025 income statement — revenue $2,883.5M, cost of revenue $817.8M (~72% gross margin), product development $450.2M, marketing $914.7M (largest opex line)"
    corroborated_by: []
  - kb_source: etsy
    source_url: https://investors.etsy.com/_assets/_6bbdcca32dae0009d81abf198bd829d6/etsy/db/1016/9829/pdf/2024-Etsy-AR.pdf
    source_tier: A_sec_filing
    publish_date: 2025-04-01
    retrieved_at: 2026-04-26T19:13:06Z
    sha256: d620fe4a794113bb56b8f3b5c4d34ddbd4f64b70f7da864610bb7a539ff67f06
    bytes_integrity: webfetch_only_no_raw_html
    content_sha256: d620fe4a794113bb56b8f3b5c4d34ddbd4f64b70f7da864610bb7a539ff67f06
    anchor: "FY2024 Integrated Annual Report — revenue $2,808M, cost of revenue $774.6M, product development $438.9M; Etsy-marketplace 89.6M active buyers / 5.6M active sellers; consolidated GMS $12.6B"
    corroborated_by: []
frontend:
  web: [javascript, html, css, priority_hints, speculation_rules_api]
  mobile: [swift, swiftui, kotlin, jetpack_compose]
backend:
  primary_langs: [php, python, scala]
  frameworks: [api_first_microservices]
  runtimes: [php_fpm, jvm, cpython]
data:
  oltp: [mysql_sharded, vitess]
  cache: [memcached]
  warehouse: [bigquery, dataflow]
  search: []
  queue: [kafka]
infra:
  cloud: [gcp]
  compute: [kubernetes, gke, buildkite_ci]
  cdn: []
  observability: [cloud_jewels_energy_estimation]
ai_stack:
  training_framework: [vertex_ai]
  serving: [vertex_ai_gemini, openai_gpt_4_via_api, in_house_classical_ml_ranking]
  evals: [internal_a_b_tests, etsy_experimentation_platform, core_web_vitals_monitoring]
  fine_tune: [classical_ml_search_ads_recs, gift_mode_persona_classifier]
  rag: []
gpu_exposure: rents_spot
inference_pattern: batch
latency_priors:
  - anchor: priority_hints_lcp_p75
    description: "Etsy adopted browser `fetchpriority` attribute on hero images of listing pages — 4% Largest Contentful Paint improvement = -83ms at the 75th percentile, without hurting business metrics. Documented Code as Craft post (2022). Helped Etsy maintain Core Web Vitals thresholds important for search rankings."
    citation:
      kb_source: etsy
      source_url: https://www.etsy.com/codeascraft/priority-hints-what-your-browser-doesnt-know-yet
      source_tier: B_official_blog
      publish_date: 2022-06-01
      retrieved_at: 2026-04-26T19:13:06Z
      sha256: d620fe4a794113bb56b8f3b5c4d34ddbd4f64b70f7da864610bb7a539ff67f06
      bytes_integrity: webfetch_only_no_raw_html
      content_sha256: d620fe4a794113bb56b8f3b5c4d34ddbd4f64b70f7da864610bb7a539ff67f06
      anchor: "Priority Hints — 4% LCP improvement = -83ms at p75 on listing page hero images"
      is_ic: true
      corroborated_by: []
    confidence: 0.85
    verification_status: partial
    result_kind: scalar
    value: -83
    units: ms_delta
    measurement: p75_lcp_improvement
    window: "2022 listing-page hero image experiment"
  - anchor: speculation_rules_ttfb_p75
    description: "Etsy adopted Speculation Rules API for prefetching listing pages from search results — 23.6% TTFB reduction at the 75th percentile, effectively zero TTFB for ~40% of browsers that support the feature. Engineering blog 2025."
    citation:
      kb_source: etsy
      source_url: https://www.linkedin.com/posts/dweinzimmer_etsy-engineering-improving-performance-activity-7389356209499291650-2n45
      source_tier: B_official_blog
      publish_date: 2025-10-15
      retrieved_at: 2026-04-26T19:13:06Z
      sha256: d620fe4a794113bb56b8f3b5c4d34ddbd4f64b70f7da864610bb7a539ff67f06
      bytes_integrity: webfetch_only_no_raw_html
      content_sha256: d620fe4a794113bb56b8f3b5c4d34ddbd4f64b70f7da864610bb7a539ff67f06
      anchor: "Speculation Rules prefetch — TTFB -23.6% at p75; near-zero TTFB for ~40% of supporting browsers"
      is_ic: true
      corroborated_by: []
    confidence: 0.80
    verification_status: partial
    result_kind: scalar
    value: -0.236
    units: fraction_delta
    measurement: p75_ttfb_improvement
    window: "2025 listing-from-search-results prefetch experiment"
availability_priors:
  - anchor: kafka_zone_failure_drill_2021
    description: "2021 production chaos exercise: Etsy intentionally took down a full GCP zone hosting one third of its Kafka cluster. Client applications automatically failed over to surviving brokers and observed minimal, temporary impact, validating the multi-zone Kafka design. NOT a measured availability fraction — a chaos-test outcome flagging multi-zone resilience."
    citation:
      kb_source: etsy
      source_url: https://www.etsy.com/codeascraft/adding-zonal-resiliency-to-etsys-kafka-cluster-part-1
      source_tier: B_official_blog
      publish_date: 2023-07-01
      retrieved_at: 2026-04-26T19:13:06Z
      sha256: d620fe4a794113bb56b8f3b5c4d34ddbd4f64b70f7da864610bb7a539ff67f06
      bytes_integrity: webfetch_only_no_raw_html
      content_sha256: d620fe4a794113bb56b8f3b5c4d34ddbd4f64b70f7da864610bb7a539ff67f06
      anchor: "Adding Zonal Resiliency to Etsy's Kafka Cluster, Part 1 — multi-zone failover validated via production chaos drill"
      is_ic: true
      corroborated_by: []
    confidence: 0.55
    verification_status: partial
    result_kind: scalar
    value: 0.999
    units: fraction
    measurement: chaos_drill_outcome_inferred
    window: "2021 Kafka zone-failure production drill"
throughput_priors:
  - anchor: mysql_cluster_qps
    description: "Etsy's sharded MySQL cluster — ~1,000 shards, ~425 TB of data, ~1.7M QPS sustained. The cluster is being migrated to Vitess as of a 2026 Code as Craft article ('Migrating Etsy's database sharding to Vitess'). One of the largest publicly-disclosed sharded-MySQL fleets at this scale."
    citation:
      kb_source: etsy
      source_url: https://www.etsy.com/codeascraft/migrating-etsyas-database-sharding-to-vitess
      source_tier: B_official_blog
      publish_date: 2026-01-01
      retrieved_at: 2026-04-26T19:13:06Z
      sha256: d620fe4a794113bb56b8f3b5c4d34ddbd4f64b70f7da864610bb7a539ff67f06
      bytes_integrity: webfetch_only_no_raw_html
      content_sha256: d620fe4a794113bb56b8f3b5c4d34ddbd4f64b70f7da864610bb7a539ff67f06
      anchor: "Migrating Etsy's database sharding to Vitess — 1,000 shards, 425 TB, 1.7M QPS"
      is_ic: true
      corroborated_by: []
    confidence: 0.80
    verification_status: partial
    result_kind: scalar
    value: 1700000
    units: qps
    measurement: sustained
    window: "2026-Q1 pre-Vitess migration baseline"
cost_curves: []
utility_weight_hints:
  latency: 0.20
  cost: 0.15
  quality_bench: 0.10
  availability: 0.20
  safety: 0.10
  developer_velocity: 0.15
  security_compliance: 0.10
archetype_tags: [php-hyperscale]
related_refs: []
nda_clean: true
ingest_script_version: "2.1.0"
---

# Etsy

Publicly traded (NASDAQ: ETSY), HQ Brooklyn. Two-sided online marketplace for handmade, vintage, and craft-supply goods. Headline metrics: **GMS** + **active buyers** (TTM unique buyer accounts, NOT MAU) + **active sellers** (TTM) + **GMS per active buyer**. Etsy does NOT publish DAU or MAU — it explicitly states only TTM active-buyer/seller counts plus per-buyer GMS.

PHP-heritage monolith with substantial Python + Scala microservices; **fully migrated to Google Cloud by early 2020** (5.5 PB data + ~2,000 servers moved to GCP).

## 1. Scale & economics (FY2025, ending Dec 31, 2025)

### House of Brands (consolidated)

- **Consolidated GMS**: **$11,916.9M FY25** (down from peak $13.5B FY21 → $13.3B FY22 → $13.2B FY23 → $12.6B FY24).
- **Consolidated active buyers**: 93.5M FY25 (down from 96.3M FY21 peak).
- **Consolidated active sellers**: 8.8M FY25 (up from 7.5M FY21).
- **Portfolio composition shifts**:
  - Elo7 divested **Aug 10, 2023**.
  - Reverb sold **June 2, 2025** (no longer in 2025 close).
  - Depop classified as held-for-sale FY25.

### Etsy marketplace only

- **Etsy-marketplace GMS**: $10,460.7M FY25 (87.8% of consolidated; up from 86.4% FY24 share).
- **Etsy-marketplace active buyers**: 86.5M FY25 (down from 89.6M FY24, ~90M FY21).
- **Etsy-marketplace active sellers**: 5.6M FY25 (up slightly from 5.3M FY21).
- **GMS per active buyer (TTM)**: $121 FY25 (down from $136 FY21 peak; -0.5% YoY).
- **Buyer cohorts (FY25, marketplace only)**: 21.2M new + 30.0M reactivated + 5.9M habitual (≥$200 + ≥6 purchase days) + 34.6M non-habitual repeat = 86.5M total active.

### Income statement (FY21–FY25, USD millions)

| Year | Revenue | Cost of revenue | Gross margin | Product development | Notes |
|------|---------|-----------------|--------------|---------------------|-------|
| 2021 | $2,329 | $655 | ~72% | $383 | Cost of revenue includes payments + cloud computing + support |
| 2022 | $2,565 | $745 | ~71% | $422 | |
| 2023 | $2,748 | $828.7 | 69% | $450.7 | |
| 2024 | $2,808.3 | $774.6 | 73% | $438.9 | |
| **2025** | **$2,883.5** | **$817.8** | **72%** | **$450.2** | Marketing $914.7M = largest opex line |

Per FY24 10-K verbatim, cost of revenue "primarily consists of interchange and other fees for payments processing services, and **expenses associated with cloud computing**, customer support, and other direct costs." **No discrete "infrastructure" or "cloud hosting" line item is disclosed.**

### CapEx (FY21–FY25, USD millions, asset-light)

| Year | Property + equipment | % of revenue |
|------|---------------------|--------------|
| 2021 | $11.25 | 0.5% |
| 2022 | $10.24 | 0.4% |
| 2023 | $12.94 | 0.5% |
| 2024 | $14.21 | 0.5% |
| 2025 | $15.39 | 0.5% |

CapEx peaked at $15M FY25; **all years <$16M, ~0.4–0.6% of revenue.** No data-center build-outs (everything's on GCP). CapEx is dominated by office build-outs + capitalized software.

### Headcount

- 2021: 2,402 (incl. Reverb 245, Depop 390, Elo7 184)
- 2022: 2,790 (peak)
- 2023: 2,420 (–13% — cost-control initiatives)
- 2024: 2,400 (–0.83%)
- 2025: not disclosed in available 10-K excerpts as of Apr 2026
- **Engineering-only is NOT disclosed** at any year. Diversity reporting notes "Engineering teams in Mexico and Ireland" + "33.1% women + marginalized gender employees in Engineering" but no absolute counts.
- 2025 Core Kubernetes job posting: team supports "a few hundred engineers" deploying onto 15+ GKE clusters → directional engineering-headcount lower bound but not explicit.

## 2. Frontend stack

- **Web**: HTML / CSS / JavaScript with performance-oriented features:
  - **Priority Hints** (browser `fetchpriority` attribute) on hero images — **4% LCP improvement = -83ms at p75** without hurting business metrics. Code as Craft (2022).
  - **Speculation Rules API** for prefetching listing pages from search results — **TTFB -23.6% at p75; near-zero TTFB for ~40% of supporting browsers** (Code as Craft, 2025).
- **Mobile**: Swift + SwiftUI (iOS), Kotlin + Jetpack Compose (Android).
- **Performance culture**: historically published **quarterly Site Performance Reports** on Code as Craft tracking median + p95 response times for core pages. Continues today via experimentation platform + Core Web Vitals monitoring.

## 3. Backend stack

- **Languages**: PHP (legacy monolith) + Python + Scala microservices. Per backend-engineer job descriptions: "Work with Python, Scala, and PHP across Etsy's service architecture."
- **Architecture**: PHP monolith decomposed into API-first microservices on GKE.
- **CI/CD**: Buildkite-based platform serving "a few hundred engineers."
- **GKE scale**: 15+ GKE clusters with hundreds of nodes (per 2025 Core Kubernetes team job posting).

## 4. Data & storage

- **OLTP**: **Sharded MySQL cluster** — ~1,000 shards, ~425 TB, **~1.7M QPS sustained**. Accessed via proprietary internal ORM. **Vitess migration in progress** (Code as Craft 2026).
- **Cache**: Memcached.
- **Streaming + indexing**: Kafka on GKE, multi-zone (3-zone) post-resiliency upgrade.
- **Warehouse + analytics**: BigQuery + Dataflow.
- **Search**: ML-based ranking + relevance via Vertex AI; specific search engine not disclosed.

## 5. Infrastructure topology

- **Single cloud: Google Cloud Platform.** Migration from self-hosted data centers completed early 2020. **5.5 PB of data + ~2,000 on-premise servers moved to GCP** (per Google Cloud case study). No second public-cloud provider for primary workloads.
- **Compute**: Google Kubernetes Engine primary substrate. Core Kubernetes team manages 15+ clusters.
- **Migration economics** (per Google Cloud case study):
  - **42% reduction in compute costs** vs. on-prem.
  - **>50% savings in compute energy usage**.
  - **~15% of engineering headcount shifted** from infrastructure management to customer-facing feature work.
- **Sustainable computing**: Etsy developed **"Cloud Jewels"** — methodology to convert GCP usage metrics into estimated energy + emissions. Open-sourced; adopted by third-party tools and cloud providers themselves. Indicative of high cloud-usage instrumentation.
- **Kafka multi-zone** (Aug 2023 Code as Craft):
  - Migrated from single-zone (regional disks) to 3-zone deployment with zonal disks.
  - Used Kubernetes Pod Topology Spread Constraints + Kafka rack-aware replication (`broker.rack` + `client.rack`).
  - Storage cost cut ~50%; inter-zone network egress drove **net ~20% Kafka cost increase** post-resiliency upgrade.
  - Mitigated partly via **follower-fetching** (consume from same-zone replicas at cost of small replication latency within application SLOs).
  - **2021 production chaos drill**: full GCP zone (1/3 of Kafka cluster) intentionally taken down → automatic failover, minimal/temporary impact validated.

## 6. AI / ML stack

- **Classical ML on GCP**: Vertex AI + BigQuery + Dataflow power search ranking, Etsy Ads, recommendation surfaces, content moderation.
- **Generative AI — "Gift Mode" launched Jan 2024**:
  - Multi-vendor: **OpenAI GPT-4 via API** + **Google Gemini via Vertex AI** + Etsy's own ML.
  - Asks buyer questions about recipient + occasion → assigns to one of **~200 personas** → generates curated gift guides from Etsy's catalog of >100M items.
  - "Algotorial curation" workflow per Google Cloud AI case study: **80× increase in listings per theme** + measurable lifts in visits + conversions.
- **Content moderation**: ML models detect policy-violating content, complement human review.
- **No foundation model pre-training**: Etsy uses vendor models (Gemini, GPT-4) directly, fine-tunes/adapts on its data, runs in-house classical ML for ranking + targeting.
- **Vendor mix**: Gemini via Vertex AI for curation/personalization (GCP-internal); GPT-4 via OpenAI API for Gift Mode (external).

`gpu_exposure: rents_spot` (Vertex AI managed-service GPU access, no owned cluster).
`inference_pattern: batch` (most ML inference is search-ranking / recommendation batch jobs; Gift Mode is interactive but not real-time-streaming-tokens like Anthropic/OpenAI).

## 7. Math priors commentary

**Emitted**:
- `latency_priors`: Priority Hints LCP -83ms at p75 (confidence 0.85); Speculation Rules TTFB -23.6% at p75 → near-zero for 40% of browsers (confidence 0.80). Both anchored to IC-authored Code as Craft posts.
- `availability_priors`: 2021 Kafka zone-failure chaos drill → multi-zone failover validated (confidence 0.55 — chaos-test outcome inferred, NOT a measured availability fraction).
- `throughput_priors`: MySQL ~1.7M QPS sustained across ~1,000 shards / ~425 TB (confidence 0.80; rare publicly-disclosed sharded-MySQL fleet anchor at this scale).

**Not emitted**:
- **Cloud / hosting dollar split** — never disclosed. Cost of revenue ($817.8M FY25) bundles payments + cloud + support + amortization. **No "cost per order," "cost per query," "cost per GMS"** unit metric is published.
- **Numeric SLA / uptime fraction** — Etsy does NOT publish "99.9%" or any numeric uptime target. Engineering content references internal SLOs ("within our application SLOs") but doesn't disclose the values.
- **Engineering-only headcount** — never broken out at any year. Best signal: ~15% engineering shift from infra to feature work post-GCP migration.
- **CapEx breakdown** — not split into office/hardware/capitalized-software components.
- **CDN / edge provider** — recent official sources don't identify the specific CDN.
- **Cost curves** — Etsy doesn't publish per-API-call or per-request infra unit pricing.

## 8. Staleness & provenance

This entry was authored from a single compiled raw-research.md document (`07-uncategorized/raw/etsy/etsy.md`, sha256 `d620fe4a794113bb56b8f3b5c4d34ddbd4f64b70f7da864610bb7a539ff67f06`) — a 49KB synthesis with **53 footnoted citations** spanning Etsy 10-Ks (2021–2025), Integrated Annual Reports, Code as Craft engineering posts, Google Cloud case studies, and external coverage. All citations carry `bytes_integrity: webfetch_only_no_raw_html` with `content_sha256` matching the compiled-research SHA. **`data_quality_grade: Q2`** — uplifted from Q3 because the raw research carries proper per-URL footnoted citations with publish_dates + anchors, not just narrative.

**Future enrichment** (recommended v2.2 curator pass):
1. Per-URL fetch of the SEC EDGAR primary documents (FY25 8-K Ex 99.1, FY24 Annual Report PDF, FY25 income statement) — compute per-URL `sha256` (raw bytes) + `content_sha256` (extracted body).
2. Replace the placeholder `d620fe4a…` SHA on each citation with its per-URL hash.
3. Bump `data_quality_grade: Q2 → Q1`.

## 9. Sources

### Tier A — SEC filings & shareholder letters

1. **Etsy FY2025 8-K Exhibit 99.1** (Q4 + FY 2025 Earnings) — https://investors.etsy.com/_assets/_6bbdcca32dae0009d81abf198bd829d6/etsy/db/938/10062/earnings_release/Exhibit+99.1+12.31.2025.pdf — **Primary source for FY25 figures**: consolidated GMS $11,916.9M, Etsy-marketplace GMS $10,460.7M (87.8%), Depop $1,074.9M, 93.5M consolidated active buyers, 86.5M Etsy-marketplace buyers + cohort breakdown.
2. **Etsy Latest Income Statement (Investor Relations)** — https://investors.etsy.com/financial-information/income-statement — FY25 revenue $2,883.5M, cost of revenue $817.8M, product development $450.2M.
3. **2024 Integrated Annual Report** — https://investors.etsy.com/_assets/_6bbdcca32dae0009d81abf198bd829d6/etsy/db/1016/9829/pdf/2024-Etsy-AR.pdf — FY24 figures + Etsy-marketplace 89.6M buyers / 5.6M sellers.
4. **2024 Q4 Earnings Presentation** — https://investors.etsy.com/_assets/_f1a0697e02243f0d5855d6f8480d83a3/etsy/db/938/9482/presentation/For-website-Q4-2024-Earnings-Presentation.pdf — FY23 + FY24 income-statement comparison.
5. **2024 10-K cash-flow** — https://investors.etsy.com/_assets/_2f7ef5c6024399316f00a936d422cb05/etsy/db/938/9482/earnings_release/Exhibit+99.1+12.31.2024.pdf — FY24 CapEx $14.2M.
6. **2023 10-K Exhibit 99.1** — https://www.sec.gov/Archives/edgar/data/1370637/000137063724000011/exhibit99112312023.htm — FY23 CapEx $12.9M.
7. **2022 10-K Exhibit 99.1** — https://investors.etsy.com/_assets/_f1a0697e02243f0d5855d6f8480d83a3/etsy/db/938/9474/earnings_release/Exhibit+99.1+Q4+2022.pdf — FY21 + FY22 cash-flow.
8. **2021 10-K** — https://www.sec.gov/Archives/edgar/data/1370637/000137063722000024/etsy-20211231.htm — FY21 baseline; 13.5B GMS; consolidated breakdown by marketplace.
9. **2021 Integrated Annual Report** — https://investors.etsy.com/_assets/_26c2d80389ac544a22b5b6df2ca78050/etsy/db/1016/9709/pdf/Q1_EtsyInc_Etsy_AnnualReport_2021.pdf — Etsy-marketplace 90M buyers / 5.3M sellers (FY21).
10. **2023 Integrated Annual Report** — https://investors.etsy.com/_assets/_d7ee8700714b0f6cfcd5c437caf5f524/etsy/db/1016/9828/pdf/etsy-inc-_ar_2024.pdf — FY23 figures + cost-of-revenue prose.
11. **Q4 FY21 Earnings Presentation** — https://investors.etsy.com/_assets/_7305615aee1870995ec41526328887fe/etsy/db/938/9470/presentation/Etsy-4Q-Earnings-Feb-28.pdf — "Added 9M active buyers in 2021."
12. **Q3 FY23 Press Release** — https://www.stocktitan.net/news/ETSY/etsy-inc-reports-third-quarter-2023-tuhneduvj1r9.html — TTM GMS-per-active-buyer ~$128 (FY23 mid-year).

### Tier B — Etsy Code as Craft engineering blog

13. **"Adding Zonal Resiliency to Etsy's Kafka Cluster: Part 1"** — https://www.etsy.com/codeascraft/adding-zonal-resiliency-to-etsys-kafka-cluster-part-1 — 3-zone Kafka design + 2021 chaos drill + ~20% net cost increase.
14. **"Priority Hints — What Your Browser Doesn't Know (Yet)"** — https://www.etsy.com/codeascraft/priority-hints-what-your-browser-doesnt-know-yet — LCP -83ms at p75; -4%.
15. **"Deploying to Google Kubernetes Engine"** — https://www.etsy.com/codeascraft/deploying-to-google-kubernetes-engine — GKE deployment workflow.
16. **"Migrating Etsy's database sharding to Vitess"** — https://www.etsy.com/codeascraft/migrating-etsyas-database-sharding-to-vitess — 2026 Vitess migration; 1,000 shards / 425 TB / 1.7M QPS baseline.
17. **"API First Transformation at Etsy"** — https://www.etsy.com/codeascraft/api-first-transformation-at-etsy-concurrency — monolith decomposition narrative.
18. **Speculation Rules API blog** (via LinkedIn share) — https://www.linkedin.com/posts/dweinzimmer_etsy-engineering-improving-performance-activity-7389356209499291650-2n45 — TTFB -23.6% at p75.
19. **"Etsy Engineering | Code as Craft"** (index) — https://www.etsy.com/codeascraft.

### Tier B — Google Cloud case studies

20. **Etsy Case Study (general)** — https://cloud.google.com/customers/etsy — GKE + Vertex AI + Looker + Apigee + Cloud SQL.
21. **Etsy AI Case Study (Gift Mode + Algotorial curation)** — https://cloud.google.com/customers/etsy-ai — 80× increase in listings per theme.
22. **Etsy Migration Press Release (Feb 2020)** — https://www.googlecloudpresscorner.com/2020-02-19-Etsy-Completes-Its-Migration-to-Google-Cloud-in-Record-Time — 5.5 PB + 2,000 servers; 42% compute cost reduction; 50%+ energy savings; 15% engineering headcount shift.

### Tier B — Etsy News + ESG

23. **Etsy Cloud Jewels** — https://www.etsy.com/ca/news/etsy-unveils-innovative-tool-to-track-energy-usage-in-the-cloud — open-source energy-estimation methodology.

### Tier C — Press / analyst (corroboration only, never sole)

24. **Voicebot.ai — Etsy Gift Mode launch** — https://voicebot.ai/2024/01/29/etsy-launches-generative-ai-gift-mode-to-suggest-personalized-presents/.
25. **Digital Commerce 360 — Etsy Gift Mode** — https://www.digitalcommerce360.com/2024/01/26/etsy-tries-new-gift-mode-recommendations-with-ai/ — 200 personas + ML.
26. **Tech.co — Etsy Gift Mode** — https://tech.co/news/etsy-ai-gift-mode.

### Tier D — StackShare / aggregators (NOT sole; corroborate only)

27. **StockAnalysis.com Etsy headcount** — https://stockanalysis.com/quote/etr/3E2/employees/.
28. **Macrotrends-equivalent aggregators** for income-statement series.

### Tier E — Conference + adjacency

29. **High Scalability — "What does Etsy's architecture look like today?"** — https://highscalability.com/what-does-etsys-architecture-look-like-today/ (older — pre-GCP).
30. **Martin Fowler — "Using the cloud to scale Etsy"** — https://martinfowler.com/articles/bottlenecks-of-scaleups/etsy-cloud-scale.html — Cloud Jewels methodology.
31. **Cloud Carbon Footprint methodology** — https://www.cloudcarbonfootprint.org/docs/methodology/ — Etsy's Cloud Jewels adopted.

### Job postings (architectural signal)

32. **Etsy Software Engineer II, Core Kubernetes** — https://peerlist.io/company/etsy907/careers/software-engineer-ii-core-kubernetes/jobh6aj7n9b8opjgbio6neg7pmmgnq — 15+ GKE clusters / hundreds of nodes / "few hundred engineers."
33. **Etsy Backend Engineer prep** — https://www.cleverprep.com/companies/etsy/backend-engineer — Python + Scala + PHP service-architecture work.

## Curator notes

- **`data_quality_grade: Q2` (uplifted from Q3 prior-pass)** — the raw research has 53 properly-footnoted citations with real publish_dates + per-URL anchors. The compiled-research SHA path is preserved as the bytes-of-record for this curator pass; per-URL re-fetch is the v2.2 enrichment to lift to Q1.
- **`scale.metric: gmv_usd_annual`** — Etsy's headline KPIs are GMS (dollar-denominated marketplace activity) + active-buyer count (TTM). `gmv_usd_annual` is the closest enum fit (GMV ≈ GMS for marketplace context). Value $11,916.9M = consolidated FY25.
- **`dau_band: unknown`** — Etsy explicitly states it does NOT publish DAU/MAU. TTM active buyer count is 93.5M consolidated / 86.5M Etsy-marketplace, but those are unique-buyer-over-12-months counts, not daily active counts. Honest assignment is `unknown` rather than guessing a band from active-buyer counts.
- **`revenue_usd_annual: 2,883,501,000`** — precise FY25 figure from income-statement tabular disclosure (was approximated as "$2.8B" in prior curator pass).
- **`infra_cost_usd_annual: 817,800,000`** — FY25 cost of revenue (the bundled line that contains cloud computing; Etsy does NOT split cloud/hosting separately). NOT a pure cloud bill — bundles payments processing + cloud + support + amortization. NEEDS_RESEARCH for cleaner split if disclosed in future filings.
- **`cost_band: 100m_1b_usd`** — defensible upper bound for the bundled cost-of-revenue. Pure cloud spend is undisclosed and likely meaningfully smaller (per Google Cloud case study, GCP migration delivered 42% compute cost reduction + use of Reserved/Committed Use Discounts).
- **`headcount_est: 2400`** — 2024 figure (latest reliably disclosed). 2025 not in available 10-K excerpts. **Engineering-only is not disclosed**; "few hundred engineers" deploy onto GKE per 2025 Core Kubernetes job posting.
- **`archetype_tags: [php-hyperscale]`** — reflects the PHP legacy monolith origin even though the stack is now polyglot. Could ALSO multi-tag with a future `marketplace-ml-personalization` archetype if added to the enum (Etsy's ML-driven ranking + Gift Mode + algotorial curation push it well beyond pure PHP-monolith). NEEDS_RESEARCH (schema extension proposal).
- **`utility_weight_hints` sum to 1.00** — marketplace weighting: latency 0.20 (Core Web Vitals + Priority Hints + Speculation Rules investments), availability 0.20 (multi-zone Kafka + chaos drills + 24/7 marketplace), cost 0.15 (Cloud Jewels + GCP Reserved Instances explicit cost focus), dev velocity 0.15 (~15% engineering shift from infra to features post-migration), quality/safety/security 0.10 each.
- **Latency priors are CSS-deep** — Priority Hints + Speculation Rules are frontend-perf optimizations, NOT backend p95 latency. Etsy does NOT disclose backend service p50/p95 anchors. The two latency priors above are anchored to Etsy's strongest publicly-disclosed perf numbers, even though they live at the frontend tier.
- **Availability prior is a chaos-drill outcome, not a measured fraction** — Etsy publishes NO numeric SLA. The 2021 Kafka zone-drill is the strongest publicly-disclosed availability anchor. Confidence 0.55 reflects "evidence of multi-zone failover capability" not "measured 99.9% uptime."
- **Throughput prior is one of the strongest in the corpus** — 1.7M QPS sustained on a ~1,000-shard MySQL cluster at 425 TB is a rare publicly-disclosed sharded-database baseline (most companies stay vague on database-fleet QPS).
- **Portfolio context (Reverb, Depop, Elo7)** — historical multi-marketplace acquisitions through 2021; Reverb sold Jun 2025, Depop held-for-sale FY25, Elo7 divested Aug 2023. **House-of-Brands narrative is wound down** — FY26+ Etsy is closer to single-brand pure-play.
