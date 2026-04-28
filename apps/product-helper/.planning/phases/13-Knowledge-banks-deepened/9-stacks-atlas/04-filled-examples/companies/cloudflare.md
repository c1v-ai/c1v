---
slug: cloudflare
name: Cloudflare
kind: public
hq: San Francisco, California
website: https://www.cloudflare.com
last_verified: 2026-04-23
verification_status: verified
reviewer: curator@c1v-kb8-atlas
data_quality_grade: Q1
primary_source:
  tier: A_sec_filing
  source_url: https://www.sec.gov/Archives/edgar/data/1477333/000147733326000016/cloud-20251231.htm
  anchor: "FY2025 10-K — revenue, paying customers, capex, employees"
scale:
  metric: paying_subscribers
  value: 254961
  as_of: "2025-Q4"
  citation:
    kb_source: cloudflare
    source_url: https://www.sec.gov/Archives/edgar/data/1477333/000147733326000016/cloud-20251231.htm
    source_tier: A_sec_filing
    publish_date: 2026-02-26
    retrieved_at: 2026-04-23T04:00:00Z
    sha256: b2e19963a1e3df97eb84d21d1c65b49a660a9e7ebab3f3a052e101a46fae18a0
    bytes_integrity: clean
    anchor: "FY2025 10-K — 254,961 paying customers at YE2025"
    corroborated_by: []
dau_band: over_100m
revenue_usd_annual: 2168000000
infra_cost_usd_annual: null
cost_band: 100m_1b_usd
headcount_est: 5156
economics_citations:
  - kb_source: cloudflare
    source_url: https://www.sec.gov/Archives/edgar/data/1477333/000147733326000016/cloud-20251231.htm
    source_tier: A_sec_filing
    publish_date: 2026-02-26
    retrieved_at: 2026-04-23T04:00:00Z
    sha256: b2e19963a1e3df97eb84d21d1c65b49a660a9e7ebab3f3a052e101a46fae18a0
    bytes_integrity: clean
    anchor: "FY2025 10-K — revenue $2.168B, COGS $552.5M, gross margin 74.5%, capex $315.6M, 5,156 FTEs (47.6% intl)"
    corroborated_by: []
frontend:
  web: [react, typescript, nextjs]
  mobile: []
backend:
  primary_langs: [rust, go, javascript, typescript]
  frameworks: [workers_runtime, v8_isolates]
  runtimes: [v8, workerd]
data:
  oltp: [postgres_managed]
  cache: [kv_workers]
  warehouse: []
  vector: [vectorize]
  queue: [queues_workers]
infra:
  cloud: [self_operated]
  compute: [custom_edge_pop_network]
  cdn: [cloudflare_proprietary]
  observability: [workers_trace_events]
  security: [zero_trust_proprietary]
ai_stack:
  training_framework: []
  serving: [workers_ai, neurons_billing]
  evals: []
  fine_tune: []
  rag: []
gpu_exposure: owns_cluster
inference_pattern: edge
latency_priors: []
availability_priors: []
throughput_priors: []
cost_curves:
  - anchor: r2_storage_usd_per_gb_month
    description: "R2 object storage — per-GB-month storage cost. Zero-egress pricing is R2's signature differentiator vs AWS S3."
    citation:
      kb_source: cloudflare
      source_url: https://blog.cloudflare.com/r2-ga/
      source_tier: B_official_blog
      publish_date: 2022-09-21
      retrieved_at: 2026-04-23T04:05:20Z
      sha256: 5c6ecf4a0ae3bbd2116bc0e2a0a0f828539216e35b9b96d90d52518541fda57d
      anchor: "§Pricing — storage $0.015/GB-month, free tier 10GB"
      corroborated_by: []
    confidence: 0.95
    verification_status: verified
    result_kind: piecewise
    x_label: "gb_stored"
    y_label: "usd_per_month"
    units: "usd_per_gb_month"
    breakpoints:
      - {x: 0, y: 0, regime_label: "free_tier_0_10gb"}
      - {x: 10, y: 0, regime_label: "free_tier_boundary"}
      - {x: 11, y: 0.015, regime_label: "paid_linear_0_015_per_gb"}
      - {x: 1000000, y: 14985.015, regime_label: "paid_linear_0_015_per_gb"}
  - anchor: r2_class_a_ops_usd_per_million
    description: "R2 Class A operations (writes, list, multipart) — per-million-ops cost."
    citation:
      kb_source: cloudflare
      source_url: https://blog.cloudflare.com/r2-ga/
      source_tier: B_official_blog
      publish_date: 2022-09-21
      retrieved_at: 2026-04-23T04:05:20Z
      sha256: 5c6ecf4a0ae3bbd2116bc0e2a0a0f828539216e35b9b96d90d52518541fda57d
      anchor: "§Pricing — $4.50 per million Class A operations, free 1M/month"
      corroborated_by: []
    confidence: 0.95
    verification_status: verified
    result_kind: piecewise
    x_label: "class_a_operations_per_month"
    y_label: "usd_per_month"
    units: "usd_per_million_class_a_ops"
    breakpoints:
      - {x: 0, y: 0, regime_label: "free_tier_0_1m"}
      - {x: 1000000, y: 0, regime_label: "free_tier_boundary"}
      - {x: 1000001, y: 4.50, regime_label: "paid_linear_4_50_per_million"}
      - {x: 1000000000, y: 4500, regime_label: "paid_linear_4_50_per_million"}
  - anchor: r2_class_b_ops_usd_per_million
    description: "R2 Class B operations (reads, head) — per-million-ops cost."
    citation:
      kb_source: cloudflare
      source_url: https://blog.cloudflare.com/r2-ga/
      source_tier: B_official_blog
      publish_date: 2022-09-21
      retrieved_at: 2026-04-23T04:05:20Z
      sha256: 5c6ecf4a0ae3bbd2116bc0e2a0a0f828539216e35b9b96d90d52518541fda57d
      anchor: "§Pricing — $0.36 per million Class B operations, free 10M/month"
      corroborated_by: []
    confidence: 0.95
    verification_status: verified
    result_kind: piecewise
    x_label: "class_b_operations_per_month"
    y_label: "usd_per_month"
    units: "usd_per_million_class_b_ops"
    breakpoints:
      - {x: 0, y: 0, regime_label: "free_tier_0_10m"}
      - {x: 10000000, y: 0, regime_label: "free_tier_boundary"}
      - {x: 10000001, y: 0.36, regime_label: "paid_linear_0_36_per_million"}
      - {x: 1000000000, y: 360, regime_label: "paid_linear_0_36_per_million"}
  - anchor: workers_ai_neurons_regular_usd_per_1k
    description: "Workers AI — regular Neurons pricing. Neuron = proprietary output-scaled inference unit."
    citation:
      kb_source: cloudflare
      source_url: https://blog.cloudflare.com/workers-ai/
      source_tier: B_official_blog
      publish_date: 2023-09-27
      retrieved_at: 2026-04-23T04:05:30Z
      sha256: 8281b032cbd2e04462f535b956ad424dc14383752e5e02b540fb321c5cc8de93
      anchor: "§Pricing — $0.01 per 1K regular Neurons"
      corroborated_by: []
    confidence: 0.9
    verification_status: verified
    result_kind: piecewise
    x_label: "neurons_per_month"
    y_label: "usd_per_month"
    units: "usd_per_1k_regular_neurons"
    breakpoints:
      - {x: 0, y: 0, regime_label: "zero"}
      - {x: 1000, y: 0.01, regime_label: "flat_0_01_per_1k_regular"}
      - {x: 1000000, y: 10, regime_label: "flat_0_01_per_1k_regular"}
  - anchor: workers_ai_neurons_fast_usd_per_1k
    description: "Workers AI — fast Neurons pricing (priority tier with lower latency commitment)."
    citation:
      kb_source: cloudflare
      source_url: https://blog.cloudflare.com/workers-ai/
      source_tier: B_official_blog
      publish_date: 2023-09-27
      retrieved_at: 2026-04-23T04:05:30Z
      sha256: 8281b032cbd2e04462f535b956ad424dc14383752e5e02b540fb321c5cc8de93
      anchor: "§Pricing — $0.125 per 1K fast Neurons"
      corroborated_by: []
    confidence: 0.9
    verification_status: verified
    result_kind: piecewise
    x_label: "fast_neurons_per_month"
    y_label: "usd_per_month"
    units: "usd_per_1k_fast_neurons"
    breakpoints:
      - {x: 0, y: 0, regime_label: "zero"}
      - {x: 1000, y: 0.125, regime_label: "flat_0_125_per_1k_fast"}
      - {x: 1000000, y: 125, regime_label: "flat_0_125_per_1k_fast"}
utility_weight_hints:
  latency: 0.25
  cost: 0.20
  quality_bench: 0.10
  availability: 0.25
  safety: 0.05
  developer_velocity: 0.10
  security_compliance: 0.05
archetype_tags: [globally-distributed-edge-network, ai-native-inference-edge, developer-platform-saas]
related_refs: []
nda_clean: true
ingest_script_version: "2.0.0"
---

# Cloudflare

Publicly traded (NYSE: NET). Connectivity-cloud platform: CDN, DDoS protection, Workers (serverless V8-isolate compute), R2 (S3-compatible object storage, zero egress), Workers AI (serverless GPU inference). Owns and operates its own global edge network — **not** a tenant on AWS/GCP/Azure.

## 1. Scale & economics (FY2025)

- Revenue: **$2.168B** (+29.8% YoY).
- Paying customers: **254,961** at YE2025 (+21% YoY from ~211k YE2024). Large-customer cohort (>$100K ARR) is the real revenue driver but the cohort count was not extracted in this pass (flagged in research §Unknowns).
- Gross margin (GAAP): **74.5%** (−280bps YoY — margin compression from infra buildout).
- Operating margin: 9.6% (up from 9.3% FY2024; first year of meaningful GAAP profitability).
- Cost of revenue: **$552.5M** (+46% YoY, outpacing revenue).
- **Capex: $315.6M** (+70.6% YoY from $185M FY2024). Signals aggressive network + GPU buildout.
- R&D expense: $512.5M (+21.6% YoY).
- Employees: **5,156** (+20.9% YoY), **2,452 international (47.6%)**. Globally-distributed workforce matching the ~330-PoP network.

## 2. Frontend stack

Web console and customer-facing dashboard: React + TypeScript + Next.js. No native mobile apps are primary products; mobile interactions are via browser or API.

## 3. Backend stack

- **Edge runtime: V8 isolates**. Workers runs Chrome's V8 engine directly on servers, not containers or VMs. This is the architectural invariant — it's why cold-start latency is in single-digit ms range instead of container-per-request hundreds-of-ms. Workers for Platforms (2022) scaled this design to "hundreds of thousands to millions of Workers per tenant."
- **Core proxy: FL-2 / oxy (Rust)**. 2025 Birthday Week wrap-up (publish 2025-09-29) cites 10ms median latency improvement and 10× cold-start reduction vs prior (Nginx-based) core proxy. Workers routing via "worker sharding" (requests routed to preloaded workers on specific machines).
- **Language mix**: Rust (FL-2, DNS, oxy), Go (some control-plane + internal tooling), JavaScript/TypeScript (Workers runtime, customer workloads).
- **Network transport**: QUIC (+10% speed improvement per 2025 tuning), TCP, TLS 1.3.

## 4. AI stack

`kind: public` but `ai_stack` populated because Cloudflare operates Workers AI as a core product surface (not as an internal tool).

- **Serving**: Workers AI — serverless GPU inference at the edge. Billed in "Neurons" (proprietary output-scaled metric; 1,000 Neurons ≈ 130 LLM responses / 830 image classifications / 1,250 embeddings).
- **Training**: None — Cloudflare serves pretrained models only. Hosted catalog includes Llama-2-7b-chat-int8, Whisper, m2m100-1.2, distilbert-sst-2-int8, resnet-50, bge-base-en-v1.5.
- **GPU footprint**: 7 cities at Workers AI GA (September 2023) → 100 by YE2023 → "nearly everywhere" by YE2024. GPU fleet is owned, not rented.
- **Evals / fine-tune / RAG**: not public first-party offerings as of the fetched corpus.

## 5. Data & storage

- **R2**: S3-compatible object storage, Cloudflare-proprietary. **Zero egress fees** is the category-defining differentiator — see cost_curves in frontmatter.
- **KV / Durable Objects / Queues**: Workers-platform primitives for state. KV is the default per-Worker cache layer.
- **Vectorize**: vector database primitive for RAG / semantic search.
- No managed RDBMS or warehouse; customers bring their own (or use D1 for SQLite-class workloads, which is elsewhere in the Workers platform doc tree, not in our fetched sources).

## 6. Math priors commentary

5 cost curves staged, all tier-B with SHA-verified per-URL citations:

- **R2 storage $/GB-month** — piecewise with 10GB free tier boundary. Canonical for "cheapest per-GB object storage" decision nodes.
- **R2 Class A ops $/M** (writes, list, multipart) — piecewise with 1M-ops free tier.
- **R2 Class B ops $/M** (reads, head) — piecewise with 10M-ops free tier.
- **Workers AI regular Neurons $/1K** — flat-rate inference pricing.
- **Workers AI fast Neurons $/1K** — flat-rate priority-tier inference pricing.

**Not emitted** as priors:
- FL-2 "10ms median response improvement" from Birthday Week 2025 is a **delta**, not an absolute p50 value. Without a baseline it can't anchor a latency_prior. Narratively useful; skipped in frontmatter.
- Workers cold-start "10×" reduction — similarly a delta, no baseline published.
- TLS auto-upgrade 6M domains, encryption traffic 10%→95% — policy-driven metrics, not rate/throughput/latency/cost.

**Gaps (scraper flagged NEEDS_RESEARCH, supplementary fetch recommended)**:
1. Edge throughput (requests/sec globally). Historical narrative ~45M req/s circa 2023 but not in fetched corpus. Would be a `throughput_priors` entry once sourced.
2. Availability SLA anchor — not disclosed in 10-K or the 4 fetched blog posts. Status page (status.cloudflare.com) is tier-irregular.
3. AI Gateway GA date + pricing — canonical URL 404'd during scraper's fetch; re-fetch recommended.
4. R2 total stored bytes / total objects — never publicly disclosed.
5. Workers AI p95 inference latency per Neuron — not in GA post; may exist in a follow-on performance blog.

## 7. Migrations & turning points

- **Own-the-network posture from day one** — Cloudflare built its edge PoP network rather than renting from AWS/GCP/Azure. Directly analogous to Netflix's Open Connect strategic move but broader in scope (full-stack edge vs video-CDN).
- **Workers launch (2017) + V8 isolate architecture** — framed as "Chrome on servers." Pre-dates the serverless-at-the-edge category by several years.
- **R2 GA (September 2022)** — zero-egress pricing pressured AWS S3's egress-fee moat.
- **Workers AI GA (September 2023)** — serverless GPU inference at the edge; expanded from 7 PoPs to "nearly everywhere" in 15 months.
- **FL-2 Rust rewrite (2025)** — core proxy moved from Nginx-era stack to modular Rust (oxy). Delivered measurable latency + cold-start improvements.
- **Capex step-up (FY2025)** — $185M → $315.6M (+71% YoY) signals a network/GPU expansion cycle ahead of the revenue it will serve.

## 8. Sources

1. **Cloudflare FY2025 Form 10-K** — tier `A_sec_filing` — https://www.sec.gov/Archives/edgar/data/1477333/000147733326000016/cloud-20251231.htm — published 2026-02-26 — sha256 `b2e19963a1e3df97eb84d21d1c65b49a660a9e7ebab3f3a052e101a46fae18a0`. Source for revenue, paying customers, employees, capex, COGS, margins.
2. **Birthday Week 2025 Wrap-Up** — tier `B_official_blog` — https://blog.cloudflare.com/birthday-week-2025-wrap-up/ — published 2025-09-29 — sha256 `f164fa55e51f3fd17815fbc3f610a3d6f1ebb0528a4a8aa80e7a6ae02c8a3ec5`. Narrative source for FL-2 latency improvement, TLS auto-upgrade stats, encryption traffic ratios. **Not cited as a prior anchor** — delta-only numbers.
3. **R2 General Availability** — tier `B_official_blog` — https://blog.cloudflare.com/r2-ga/ — published 2022-09-21 — sha256 `5c6ecf4a0ae3bbd2116bc0e2a0a0f828539216e35b9b96d90d52518541fda57d`. Source for R2 pricing (3 cost_curves).
4. **Workers AI: serverless GPU-powered inference** — tier `B_official_blog` — https://blog.cloudflare.com/workers-ai/ — published 2023-09-27 — sha256 `8281b032cbd2e04462f535b956ad424dc14383752e5e02b540fb321c5cc8de93`. Source for Neurons pricing (2 cost_curves), AI stack narrative, hosted model list.
5. **Workers for Platforms** — tier `B_official_blog` — https://blog.cloudflare.com/workers-for-platforms/ — published 2022-05-10 — sha256 `4e611d0cc02fe94efab57a7647ed06e772feb024c5581fa529b25d7c18e4f73a`. V8 isolate architecture narrative; not cited as a prior anchor.

## Curator notes

- `data_quality_grade: Q1` — 5 cost_curves all tier-B with SHA-verified per-URL citations; zero NEEDS_RESEARCH on mandatory fields; scale and economics cite tier-A 10-K; `last_verified` 2026-04-23 within 18mo.
- `scale.metric: paying_subscribers` — Cloudflare's primary reported KPI is "paying customers" (contracts, not user seats). 254,961 at YE2025 per 10-K.
- `dau_band: over_100m` — inferred from >6M domains auto-upgraded during FY2025 Birthday Week alone; Cloudflare touches a far larger install base via anonymous DNS (1.1.1.1) and transit traffic that isn't billed as customers. Honest lower bound given `over_100m` is the top bucket.
- `cost_band: 100m_1b_usd` — FY2025 COGS of $552.5M lands cleanly in this band. Cost of revenue here is the right proxy for atlas infra-cost since Cloudflare operates its own network (no rented cloud spend to separate out).
- `ai_stack` populated despite `kind: public` — Cloudflare's Workers AI is a core product, not internal tooling. Zod allows `ai_stack` as optional on public entries.
- `archetype_tags: [globally-distributed-edge-network, ai-native-inference-edge, developer-platform-saas]` — **updated 2026-04-23 post schema_v 1.1.0 (task #34 landed)**. Multi-tag captures Cloudflare's three core identities: (1) edge CDN / DDoS / network = `globally-distributed-edge-network`, (2) Workers AI serverless inference at edge = `ai-native-inference-edge`, (3) Workers / Pages / R2 / D1 developer platform = `developer-platform-saas`. Schema 1.1.0 JSDoc on `archetypeTagSchema` explicitly anticipates multi-tag for hybrid companies; cloudflare was the reference case.
- `throughput_priors: []` — 45M req/s historical narrative isn't in the fetched corpus. Would be a clean throughput anchor when sourced.
- `availability_priors: []` — no numeric SLA in fetched sources.
- `latency_priors: []` — FL-2 and Workers cold-start numbers are deltas not absolutes; need a baseline-anchored follow-on post to emit as priors.
- `utility_weight_hints`: weighted toward latency + availability (platform-reliability play) with moderate cost and dev velocity. Sums to 1.00 exact.
- All 5 fetched sources' SHAs verified against `_sources/` bytes this turn.
