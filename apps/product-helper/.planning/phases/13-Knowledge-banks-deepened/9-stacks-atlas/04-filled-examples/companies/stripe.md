---
slug: stripe
name: Stripe
kind: private_consumer
hq: San Francisco & Dublin
website: https://stripe.com
last_verified: 2026-04-24
verification_status: partial
reviewer: curator@c1v-kb8-atlas
data_quality_grade: Q2
primary_source:
  tier: B_official_blog
  source_url: https://stripe.com/newsroom/news/stripe-2025-update
  anchor: "Collison 2025 Annual Letter — TPV, revenue suite, stablecoin, business count"
scale:
  metric: gmv_usd_annual
  value: 1900000000000
  as_of: "2025"
  citation:
    kb_source: stripe
    source_url: https://stripe.com/newsroom/news/stripe-2025-update
    source_tier: B_official_blog
    publish_date: 2026-02-24
    retrieved_at: 2026-04-24T00:11:00Z
    sha256: a6075acf1935fa93194a1abd65b9cc9d2c0a5abab193b2e405042526c0b0f84b
    bytes_integrity: captcha_wall_content_via_webfetch
    content_sha256: a6075acf1935fa93194a1abd65b9cc9d2c0a5abab193b2e405042526c0b0f84b
    anchor: "Collison 2025 Annual Letter — TPV $1.9T CY2025, +34% YoY"
    corroborated_by: []
dau_band: over_100m
revenue_usd_annual: null
infra_cost_usd_annual: null
cost_band: undisclosed
headcount_est: null
economics_citations:
  - kb_source: stripe
    source_url: https://stripe.com/newsroom/news/stripe-2025-update
    source_tier: B_official_blog
    publish_date: 2026-02-24
    retrieved_at: 2026-04-24T00:11:00Z
    sha256: a6075acf1935fa93194a1abd65b9cc9d2c0a5abab193b2e405042526c0b0f84b
    bytes_integrity: captcha_wall_content_via_webfetch
    content_sha256: a6075acf1935fa93194a1abd65b9cc9d2c0a5abab193b2e405042526c0b0f84b
    anchor: "Collison 2025 Annual Letter — Revenue Suite $1B ARR run-rate, Stablecoin $400B volume (+doubled YoY), tender valuation $159B, 5M+ businesses"
    corroborated_by: []
frontend:
  web: [react, typescript]
  mobile: [swift, kotlin, react_native]
backend:
  primary_langs: [ruby, java, scala, go]
  frameworks: [rails, spring_boot]
  runtimes: [mri_ruby, jvm]
data:
  oltp: [mongodb_custom_fork, internal_document_databases]
  cache: [redis]
  warehouse: [hadoop, presto]
  queue: [kafka]
  search: [elasticsearch]
infra:
  cloud: [aws]
  compute: [kubernetes, ec2]
  cdn: [cloudfront]
  observability: [internal_stack]
  security: [pci_dss_compliant_isolation]
ai_stack:
  training_framework: []
  serving: [internal_benchmarking_harness_goose_mcp]
  evals: [goose_mcp_11_environment_benchmark]
  fine_tune: []
  rag: []
gpu_exposure: none
inference_pattern: none
latency_priors: []
availability_priors:
  - anchor: docdb_target_annual_2024
    description: "Stripe's internal document-database platform targets 99.999% annual uptime, enabled by a custom 'Data Movement Platform' for zero-downtime data migrations. Title-level claim from IC-authored post — body content not recoverable via WebFetch due to stripe.dev CSR wall; availability number is cited at tier-B+is_ic via the published post title and dek."
    citation:
      kb_source: stripe
      source_url: https://stripe.com/blog/how-stripes-document-databases-supported-99.999-uptime-with-zero-downtime-data-migrations
      source_tier: B_official_blog
      publish_date: 2024-06-06
      retrieved_at: 2026-04-24T00:11:05Z
      sha256: a8e2c595a3f1fe5ba0fe88b86bc68c896b5e27659f702c957320dbe5040c50c8
      bytes_integrity: captcha_wall_content_via_webfetch
      content_sha256: a8e2c595a3f1fe5ba0fe88b86bc68c896b5e27659f702c957320dbe5040c50c8
      anchor: "§Title — 99.999% uptime with zero-downtime migrations (post-header dek + byline)"
      is_ic: true
      corroborated_by: []
    confidence: 0.7
    verification_status: partial
    result_kind: scalar
    value: 0.99999
    units: fraction_uptime
    window: annual
throughput_priors: []
cost_curves: []
utility_weight_hints:
  latency: 0.15
  cost: 0.10
  quality_bench: 0.10
  availability: 0.35
  safety: 0.10
  developer_velocity: 0.10
  security_compliance: 0.10
archetype_tags: [fintech-secure-core]
related_refs: []
nda_clean: true
ingest_script_version: "2.1.0"
---

# Stripe

Private B2B payments/financial-infrastructure platform, co-founded 2010 by Patrick and John Collison. HQ San Francisco + Dublin. Not publicly traded; no 10-K. Primary scale source is the cofounders' 2025 Annual Letter published 2026-02-24 on Stripe's newsroom page (tier B, official).

## 1. Scale & economics (CY2025 — annual letter)

From the 2025 Collison Annual Letter:

- **Total Payment Volume (TPV): $1.9T** (+34% YoY from 2024). Approximately **1.6% of global GDP** flows through Stripe.
- **Revenue Suite ARR** (Billing + Invoicing + Tax + related products): $1B ARR run-rate by end of 2025.
- **Stablecoin volume: ~$400B** (doubled YoY). ~60% B2B. Bridge acquisition volume 4×.
- **Businesses served**: 5M+ directly or via platforms.
- **Coverage**: 90% of Dow Jones Industrial Average, 80% of Nasdaq 100.
- **Atlas**: 25% of all Delaware corporations were incorporated via Stripe Atlas.
- **Product shipments 2025**: 350+.
- **Tender offer valuation**: $159B USD (€135B).

**NOT disclosed** (private company): audited revenue, gross margin, operating margin, capex, employee count. Stripe discloses business-volume aggregates but not GAAP financials.

## 2. Scale metric encoding

`scale.metric: gmv_usd_annual` with `value: 1.9e12` captures TPV as the marketplace-GBV analog. Stripe's TPV is literally total payment volume facilitated through the platform — structurally equivalent to GMV/GBV for a payments-infrastructure company.

**Derived throughput (NOT a disclosed prior)**: $1.9T / year ≈ $5.2B/day ≈ $60k/sec average, implying sustained transaction throughput in the low-to-mid thousands TPS with known BFCM/holiday peaks multiple times higher. Exact TPS is not disclosed. Flag: derivable-not-disclosed; not emitted as a `throughput_prior`.

## 3. Frontend stack

- **Web**: React + TypeScript for dashboard and checkout UI; Stripe Elements are a first-party embedded SDK used by customers.
- **Mobile**: native Swift + Kotlin; React_Native for cross-platform SDK paths.

## 4. Backend stack

- **Primary languages**: Ruby (historical Rails core for API), Java (service migration target), Scala (data + analytics), Go (newer infra).
- **Frameworks**: Rails (canonical API surface), Spring Boot (JVM services).
- **Runtimes**: MRI Ruby, JVM.

Body-level stack claims from the 4 CSR-wall engineering blog posts were NOT recovered via WebFetch (scraper flagged all 4 `stripe_blog_csr_wall_content_via_webfetch`). Stack composition above is from widely-published Stripe hiring pages + conference talks (not in fetched corpus) — treated as narrative only, not as tier-B-citable priors.

## 5. Data & storage

- **OLTP**: Stripe runs a custom document-database platform (MongoDB-derived heritage per public talks; proprietary fork at current scale). The 2024-06-06 blog ("Stripe's document databases supported 99.999% uptime") documents zero-downtime migrations via an internal "Data Movement Platform" abstraction.
- **Cache**: Redis.
- **Warehouse**: Hadoop + Presto (analytics stack, inferred from Stripe's data-engineering public talks, not directly in fetched corpus).
- **Queue**: Kafka (same caveat).
- **Search**: Elasticsearch.

## 6. AI stack — novel benchmark

The 2026-03-02 "Can AI agents build real Stripe integrations?" post (Liang/Ho, is_ic=true) is the only fully-body-recovered blog in the corpus. It documents:

- Stripe's **internal benchmarking harness for LLM-driven integration tasks**: Goose + MCP (Model Context Protocol) over 11 test environments.
- **Results**: Claude Opus 4.5 scored 92% on 4 full-stack integration tasks; GPT-5.2 scored 73% on 2 gym tasks.

This is not a training pipeline — Stripe is an LLM *consumer* evaluating model capability for integration tooling. `ai_stack.training_framework: []`, `ai_stack.serving` reflects only the benchmarking harness; `ai_stack.evals` captures the 11-environment Goose+MCP test suite. `gpu_exposure: none` (no GPU-heavy internal training inferred).

## 7. Infrastructure

- **Cloud**: AWS primary (widely-known from Stripe public conference talks; not directly in fetched corpus).
- **Compute**: Kubernetes on EC2.
- **Security posture**: PCI DSS Level 1 + SOC 2 + various financial regulator compliances.

## 8. Math priors commentary

**Emitted**:
- `availability_priors`: `docdb_target_annual_2024 = 0.99999 annual` (Stripe's document-database uptime target per 2024-06-06 IC-authored post). Cited at tier B + is_ic. `verification_status: partial` + `confidence: 0.7` because the body of the post wasn't recoverable via WebFetch — the 99.999% number is title-level + dek-level only, and the post is ~22 months old (past the 18mo staleness threshold).

**Not emitted**:
- `throughput_priors`: TPS is derivable from TPV ($60k/sec average) but not directly disclosed. Omitting to avoid encoding inferred numbers as primary-source priors.
- `latency_priors`: no p50/p95/p99 anchors in fetched corpus. The 3 CSR-wall engineering posts (docdb, billing real-time analytics, tax jurisdiction) likely contain them but body extraction failed.
- `cost_curves`: Stripe publishes per-transaction pricing (2.9% + $0.30 standard, volume discounts for large merchants) on stripe.com/pricing, but the pricing page wasn't in the fetched corpus. Supplementary fetch of /pricing would emit clean cost curves.

## 9. Staleness & provenance posture

All 5 cited sources have CSR-wall or WebFetch-only bytes integrity (no raw HTML bytes staged in `_sources/` for stripe — scraper noted pipeline limitation). Per schema 1.1.0 `bytes_integrity` contract, all citations carry `captcha_wall_content_via_webfetch` + `content_sha256` = `sha256` (since the scraper's `sha256` IS the hash of the WebFetch-extracted MD body, not a pre-extraction HTML hash that would be different).

A future task #39 (flagged this turn) would add a more precise `webfetch_only_no_raw_html` enum value to `bytes_integrity`, distinguishing Stripe's no-raw-HTML pipeline case from the airbnb-style "HTML exists but is a CAPTCHA wall" case. Using `captcha_wall_content_via_webfetch` as the closest existing enum match for now.

The docdb post at 22mo age triggers a staleness warning (past 18mo). Kept as canonical availability anchor because no fresher public Stripe infrastructure post with a comparable number was in the corpus.

## 10. Sources

1. **Stripe 2025 Annual Letter (Collison)** — tier `B_official_blog` — https://stripe.com/newsroom/news/stripe-2025-update — published 2026-02-24 — sha256 `a6075acf...` (= content_sha256, WebFetch-only) — `bytes_integrity: captcha_wall_content_via_webfetch`. Source for scale + economics (TPV, ARR, stablecoin volume, business count, tender valuation).
2. **"How Stripe's document databases supported 99.999% uptime with zero-downtime data migrations"** — tier `B_official_blog`, IC-authored (Morzaria/Narkhede, Stripe Database Infrastructure) — https://stripe.com/blog/how-stripes-document-databases-supported-99.999-uptime-with-zero-downtime-data-migrations — published 2024-06-06 — sha256 `a8e2c595...` — `bytes_integrity: captcha_wall_content_via_webfetch`. Source for 99.999% availability prior. Body not fully recovered (CSR wall); title + dek only.
3. **"How we built it: real-time analytics for Stripe Billing"** — tier `B_official_blog`, IC-authored (Reed Trevelyan) — https://stripe.com/blog/how-we-built-it-real-time-analytics-for-stripe-billing — published 2025-09-16 — sha256 `21d43937...`. Title-level only (CSR wall). Narrative stack hint for billing real-time pipeline; no prior extracted.
4. **"How we built it: jurisdiction resolution for Stripe Tax"** — tier `B_official_blog`, IC-authored (Rentz/Komlen) — https://stripe.com/blog/how-we-built-it-jurisdiction-resolution-for-stripe-tax — published 2025-07-10 — sha256 `96b0acca...`. Title-level only (CSR wall). No prior extracted.
5. **"Can AI agents build real Stripe integrations?"** — tier `B_official_blog`, IC-authored (Liang/Ho) — https://stripe.com/blog/can-ai-agents-build-real-stripe-integrations — published 2026-03-02 — sha256 `a8d9765b...` — body recovered. Source for `ai_stack` shape (Goose + MCP benchmark harness, 11 environments, Claude Opus 4.5 at 92%, GPT-5.2 at 73%).
6. **Stripe status page** — https://status.stripe.com — WebFetch returned SPA shell only (Statuspage.io-style component hydration). Narrative reference only; no priors.

## Curator notes

- **`kind: private_consumer`** — per architect's schema_v 1.1.0 CHANGELOG, `private_consumer` explicitly covers stripe. Semantically debatable (Stripe is B2B not consumer) but matches the enum's intent (private-but-not-frontier-AI). Schema refinement: `scale.citation.source_tier` MUST be `B_official_blog` ✓ (annual letter on stripe.com/newsroom). `economics_citations[*]` MUST NOT cite `A_sec_filing` ✓ (no 10-K exists; only the annual letter cited).
- **`data_quality_grade: Q2`** — reasons:
  1. All 6 citations have CSR-wall / WebFetch-only bytes integrity; only 2 of 6 have fully-recovered body content (annual letter + ai-agents-benchmark).
  2. The single availability prior cites a 22-month-old source (past 18mo staleness threshold) and represents a title-level claim only (body not recovered).
  3. No latency priors, throughput priors, or cost curves could be extracted from the corpus.
  Q1 would require (a) fresher availability anchor OR a second verified prior, AND (b) body content recovered for at least half the cited posts.
- **`scale.metric: gmv_usd_annual`** — TPV $1.9T encoded as GMV-analog. Payments companies map cleanly to `gmv_usd_annual` (dollar volume facilitated through platform).
- **`dau_band: over_100m`** — Stripe processes transactions for 5M+ businesses with millions of daily end-consumer checkout events. Bucket is `over_100m` conservatively; exact DAU not disclosed.
- **`cost_band: undisclosed`** — private company, no infra cost disclosure in any tier.
- **`archetype_tags: [fintech-secure-core]`** — clean fit for payments/fintech companies. Matches the enum value Stripe inspired (Stripe, Coinbase, Robinhood per plan §4.1).
- **`utility_weight_hints` sum to 1.00** — heavy availability weighting (0.35) reflects the payments-infrastructure mandate: regulatory + financial requirements push availability to the top criterion.
- **`ai_stack` populated** — Stripe runs a real internal LLM benchmarking harness (Goose + MCP). Not training-heavy, but the eval infrastructure is first-party.
- **Task #39 filed** — bytes_integrity enum is missing a proper `webfetch_only_no_raw_html` value for pipelines (like stripe's) that don't stage pre-extraction HTML bytes. Using `captcha_wall_content_via_webfetch` as closest existing fit; relabel when #39 lands.
