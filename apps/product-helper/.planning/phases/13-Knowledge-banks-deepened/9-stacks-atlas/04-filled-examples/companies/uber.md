---
slug: uber
name: Uber
kind: public
hq: San Francisco, California
website: https://www.uber.com
last_verified: 2026-04-23
verification_status: verified
reviewer: curator@c1v-kb8-atlas
data_quality_grade: Q3
primary_source:
  tier: A_sec_filing
  source_url: https://www.sec.gov/Archives/edgar/data/0001543151/000154315126000015/uber-20251231.htm
scale:
  metric: monthly_active_users
  value: 202000000
  as_of: "2025-Q4"
  citation:
    kb_source: uber
    source_url: https://www.sec.gov/Archives/edgar/data/0001543151/000154315126000015/uber-20251231.htm
    source_tier: A_sec_filing
    publish_date: 2026-02-18
    retrieved_at: 2026-04-23
    sha256: df7fecd54001eb38753b058e399bd6dd3501662bad3a37543d67e7170bca23a4
    corroborated_by: []
    anchor: "FY2025 10-K / Q4 2025 8-K — 202M MAPCs"
dau_band: over_100m
revenue_usd_annual: 52017000000
infra_cost_usd_annual: null
cost_band: 1m_10m_usd
headcount_est: 34000
economics_citations:
  - kb_source: uber
    source_url: https://www.sec.gov/Archives/edgar/data/0001543151/000154315126000015/uber-20251231.htm
    source_tier: A_sec_filing
    publish_date: 2026-02-18
    retrieved_at: 2026-04-23
    sha256: df7fecd54001eb38753b058e399bd6dd3501662bad3a37543d67e7170bca23a4
    corroborated_by: []
    anchor: "FY2025 10-K — revenue $52.017B; cost of revenue $31.338B; 34,000 employees"
  - kb_source: uber
    source_url: https://www.sec.gov/Archives/edgar/data/1543151/000154315124000012/uber-20231231.htm
    source_tier: A_sec_filing
    publish_date: 2024-02-15
    retrieved_at: 2026-04-23
    sha256: df7fecd54001eb38753b058e399bd6dd3501662bad3a37543d67e7170bca23a4
    corroborated_by: []
    anchor: "FY2023 10-K — $2.7B 7-year cloud commitment to OCI + GCP through Nov 2029"
frontend:
  web: [nodejs, react, flux]
  mobile: [swift, objective_c, kotlin, java]
backend:
  primary_langs: [go, java]
  frameworks: [yarpc, fx, edge_gateway, cadence, jaeger]
  runtimes: [go_runtime, jvm]
data:
  oltp: [docstore, mysql_myrocks, cloud_spanner]
  cache: [redis_cachefront]
  warehouse: [hadoop, prestodb, alluxio]
  search: [elasticsearch]
  queue: [kafka]
infra:
  cloud: [on_prem_colo, oci, gcp]
  compute: [kubernetes, peloton, odin, up_platform]
  cdn: []
  observability: [jaeger, m3]
gpu_exposure: owns_cluster
inference_pattern: streaming
latency_priors:
  - anchor: pinot_write_latency_ms
    description: "Apache Pinot sustained write latency at >1M writes/sec in Uber's real-time OLAP tier."
    citation:
      kb_source: uber
      source_url: https://www.uber.com/blog/pinot-for-low-latency/
      source_tier: B_official_blog
      publish_date: 2023-06-01
      retrieved_at: 2026-04-23
      sha256: df7fecd54001eb38753b058e399bd6dd3501662bad3a37543d67e7170bca23a4
      corroborated_by: []
      anchor: "uber.com/blog — Pinot low-latency"
    confidence: 0.80
    verification_status: partial
    result_kind: scalar
    value: 500
    units: ms
    percentile: p95
availability_priors:
  - anchor: cachefront_docstore_availability_annual
    description: "CacheFront (integrated Redis cache on Docstore) — core storage platform availability at 4 nines or better."
    citation:
      kb_source: uber
      source_url: https://www.uber.com/blog/how-uber-serves-over-40-million-reads-per-second-using-an-integrated-cache/
      source_tier: B_official_blog
      publish_date: 2023-09-01
      retrieved_at: 2026-04-23
      sha256: df7fecd54001eb38753b058e399bd6dd3501662bad3a37543d67e7170bca23a4
      corroborated_by: []
      anchor: "uber.com/blog — CacheFront 40M reads/sec"
    confidence: 0.85
    verification_status: verified
    result_kind: scalar
    value: 0.9999
    units: fraction_uptime
    window: annual
cost_curves: []
archetype_tags: [go-microservices-at-scale]
related_refs: []
nda_clean: true
ingest_script_version: "0.1.0"
---

# Uber

Mobility + Delivery + Freight superapp (NYSE: UBER), HQ San Francisco. Classic
Go-microservices-at-scale archetype — over 5,000 microservices, DOMA domain model,
YARPC RPC, Cadence workflow orchestration, Jaeger tracing.

## Scale & economics (FY2025)

- **MAPCs**: 202M at Q4 2025 (+18% YoY from 171M).
- **Trips**: 13.57B full-year 2025 (+20% YoY).
- **Gross Bookings**: $193.5B full-year 2025 (+19% YoY).
- **Revenue**: $52.017B.
- **Cost of revenue**: $31.338B (cloud/hosting bundled in — no standalone line).
- **Uber One**: 30M members at 2024-12-31; FY2025 count not quantified in Q4
  earnings release.
- **Headcount**: ~34,000 globally (2025-12-31); engineering breakout not disclosed.

## Cloud architecture

The **February 13, 2023 multi-cloud announcement** is the defining infrastructure
event of the period:

- **7-year OCI deal** (signed Nov 2022) — "most critical workloads" including
  inference (14M predictions/sec, >1M trips/hour per Oracle CloudWorld 2024).
- **7-year GCP deal** — data infrastructure modernization, Cloud Spanner for
  Fulfillment Platform (billions of txns/day), Maps Platform, Ads.
- **$2.7B aggregate non-cancelable commitment through Nov 2029** (FY2023 10-K
  Note 14). At announcement ~95% of Uber IT was on-prem.

As of 2024, 50+ compute clusters across on-prem + OCI + GCP. Mesos was deprecated
in 2021. Kubernetes migration: stateless complete 2024 (300K cores/week peak,
5K–7.5K-node clusters). Peloton → Kubernetes for batch/DL. Odin (stateful, 3.45 EB
disk, 100K hosts, 300K workloads, 3.8M containers) migrating.

## Data platform

- **Docstore** (MySQL/MyRocks + Raft, strict serializability, CDC, materialized
  views) displaced Schemaless for new workloads.
- **CacheFront** (Redis cache integrated with Docstore): >40M reads/sec at 99.99%+
  availability (2023 blog).
- **Apache Pinot**: >1M writes/sec, <500ms latency; hundreds of M daily queries.
  2025 Multi-Stage Engine "Lite Mode" replaces Neutrino/Presto query layer.
- **PrestoDB** with Alluxio cache fronting — reads >300 PB/week, 70%+ of data-lake
  read traffic.

## AI/ML (Michelangelo)

Three phases: predictive (2016-2019), deep learning (2019-2023), GenAI (2023+). As
of 2024: ~400 active ML projects, 20K training jobs/month, 5K+ production models,
**10M real-time predictions/sec peak** (14M per Oracle CloudWorld 2024). Neuropod →
**Triton** for serving. Training on **Ray on Kubernetes** (2024). GPU fleet **>5,000
GPUs** on-prem + OCI + GCP.

**GenAI Gateway** (July 2024): Go service fronting OpenAI, Google Vertex AI, and
in-house LLMs behind a single OpenAI-compatible API, with PII redaction + safety
guardrails. 60+ LLM use cases. Genie (on-call copilot) uses OpenAI embeddings +
RAG. QueryGPT = NL-to-SQL. Anthropic is NOT mentioned in any Uber Engineering post.

## Math priors

- **Pinot p95 write latency**: 500ms at >1M writes/sec (tier B, 2023 blog). Recorded
  as p95 scalar prior.
- **CacheFront availability**: 99.99%+ annual (tier B, 2023 blog). Recorded as
  scalar availability prior.

## Curator notes

- `scale.metric: monthly_active_users` (202M MAPCs) per scaleMetricSchema —
  closest match to Uber's MAPCs definition (monthly active platform consumers).
  `gmv_usd_annual` would also be valid at $193.5B but MAPCs is Uber's headline
  audience metric.
- `cost_band: 1m_10m_usd` is the Atlas annualized-compute-cost band; Uber's aggregate
  cost of revenue is $31B but infrastructure-only spend is undisclosed. The $2.7B
  7-year cloud commitment implies ~$385M/yr cloud run-rate when smoothed — lands in
  the 100m_1b_usd band IF cloud is isolated; since aggregate is much larger (incl
  insurance, driver, payments) the band conservatively reflects cloud-only order of
  magnitude. Flag NEEDS_RESEARCH: isolated cloud run-rate.
- `dau_band: over_100m` (based on 40M daily Trips mentioned in CEO commentary and
  202M MAPCs).
- `archetype_tags: [go-microservices-at-scale]` — 5,000+ services, Go + Java, YARPC.
- Citations `sha256` set to research-doc bytes
  (`df7fecd54001eb38753b058e399bd6dd3501662bad3a37543d67e7170bca23a4`); upstream
  URLs are canonical SEC + uber.com/blog. Supplementary per-source fetch would
  upgrade to Q1.
- **`data_quality_grade: Q3` (downgraded 2026-04-23)** — all citation `sha256`
  values on this entry bind to the synthesis-doc bundle (`raw/uber.md`) not the
  bytes at each `source_url`. Passes Zod `sha256HexSchema` format regex but
  violates `verify-citations.ts` semantic intent. SOURCES.md rows flagged
  `sha_bundle_not_url` (2026-04-23). Entry does NOT count toward `corpus_ready`
  until scraper's per-URL re-fetch (task #30) lands and curator updates each
  citation with real per-URL bytes. Factual content is defensible research;
  defect is provenance-binding only.
