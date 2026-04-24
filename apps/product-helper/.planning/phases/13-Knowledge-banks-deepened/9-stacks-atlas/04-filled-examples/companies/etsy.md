---
slug: etsy
name: Etsy
kind: public
hq: Brooklyn, New York
website: https://www.etsy.com
last_verified: 2026-04-23
verification_status: partial
reviewer: curator@c1v-kb8-atlas
data_quality_grade: Q3
primary_source:
  tier: A_sec_filing
  source_url: https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001370637&type=10-K&dateb=&owner=include&count=40
scale:
  metric: gmv_usd_annual
  value: 11916900000
  as_of: "2025"
  citation:
    kb_source: etsy
    source_url: https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001370637&type=10-K&dateb=&owner=include&count=40
    source_tier: A_sec_filing
    publish_date: 2026-02-01
    retrieved_at: 2026-04-23
    sha256: d620fe4a794113bb56b8f3b5c4d34ddbd4f64b70f7da864610bb7a539ff67f06
    corroborated_by: []
    anchor: "2025 10-K — consolidated GMS $11,916.9M"
dau_band: unknown
revenue_usd_annual: 2800000000
infra_cost_usd_annual: null
cost_band: 100m_1b_usd
headcount_est: 2600
economics_citations:
  - kb_source: etsy
    source_url: https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001370637&type=10-K&dateb=&owner=include&count=40
    source_tier: A_sec_filing
    publish_date: 2026-02-01
    retrieved_at: 2026-04-23
    sha256: d620fe4a794113bb56b8f3b5c4d34ddbd4f64b70f7da864610bb7a539ff67f06
    corroborated_by: []
    anchor: "2025 10-K — cost of revenue ~$818M, product development ~$450M, CapEx $15.4M"
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
  warehouse: [bigquery]
  search: []
  queue: [kafka]
infra:
  cloud: [gcp]
  compute: [kubernetes, gke]
  cdn: []
  observability: []
gpu_exposure: rents_spot
inference_pattern: batch
latency_priors: []
availability_priors: []
cost_curves: []
archetype_tags: [php-hyperscale]
related_refs: []
nda_clean: true
ingest_script_version: "0.1.0"
---

# Etsy

US-listed marketplace (NASDAQ: ETSY), HQ Brooklyn. PHP-heritage monolith with
substantial Python + Scala services; fully migrated to Google Cloud by early 2020.

## Scale anchors (2021–2025)

- **Consolidated GMS**: peaked $13.5B (2021), $13.3B (2022), $13.2B (2023), $12.6B
  (2024), $11.9B (2025) — modest decline.
- **Consolidated active buyers (TTM)**: 96.3M (2021) → 93.5M (2025).
- **Etsy-marketplace-only buyers**: ~90M (2021) → 86.5M (2025); sellers 5.3M → 5.6M.
- **GMS per active buyer (TTM)**: $136 (2021) → $121 (2025).
- Etsy does NOT disclose DAU/MAU. `dau_band: unknown` accordingly. `gmv_usd_annual`
  chosen as scale metric per scaleMetricSchema — closest match to Etsy's reported KPIs.

## Stack narrative

- **Backend**: PHP legacy monolith + Python/Scala microservices, deployed to GKE.
- **Datastore**: very large sharded MySQL cluster (~1,000 shards, ~425 TB, ~1.7M QPS).
  Vitess migration underway as of 2026 (Code as Craft).
- **Streaming**: Kafka on GKE. 2023 re-architecture for multi-zone resilience (3
  zones, Pod Topology Spread Constraints, rack-aware replication). 2021 production
  zone-outage test validated failover.
- **ML stack**: Vertex AI + BigQuery + Dataflow. Gemini models via Vertex AI
  (curation). GPT-4 via OpenAI API (Gift Mode, Jan 2024). No in-house foundation
  model training.
- **Migration economics** (Google Cloud case study): ≥50% compute energy savings,
  42% compute cost reduction vs on-prem; ~15% engineering headcount shift away from
  infrastructure management.

## Headcount + CapEx

- ~2,400–2,800 total employees (2021–2024). Engineering/R&D headcount not disclosed.
- CapEx: $11.2M (2021) → $15.4M (2025); asset-light (~0.4–0.6% of revenue).

## Missing math priors

Etsy "does not publish formal numeric SLAs or uptime targets for the marketplace,
nor does it disclose detailed cloud-provider cost breakdowns, SLOs per service, or
engineering headcount by function" (research doc §1 overview). As a result:

- `latency_priors: []` — no disclosed p50/p95/p99 figures for marketplace endpoints.
- `availability_priors: []` — no disclosed uptime fraction.
- `cost_curves: []` — no per-request cost disclosure; cloud spend bundled in cost of
  revenue.

Per archetype convention (`marketplace-rails-monolith` / `php-hyperscale`), Etsy
contributes stack + scale priors but NOT math priors satisfying §6.3.

## Source provenance

This entry is extracted from a pre-synthesized research doc
(`raw/Etsy 2021–2026  Scale, Infrastructure, and Stack.md`, SHA-256
`d620fe4a794113bb56b8f3b5c4d34ddbd4f64b70f7da864610bb7a539ff67f06`) that
consolidates citations from Etsy 10-K filings (2021, 2022, 2023, 2024, 2025),
Integrated Annual Reports, Code as Craft engineering posts, and Google Cloud case
studies. The citation SHA-256 above points to this research-doc bytes (not the raw
10-K HTM), so curator has flagged `verification_status: partial`. A supplementary
fetch of the Etsy 10-K HTM from EDGAR would upgrade this entry to Q1.

## Curator notes

- `cost_band: 100m_1b_usd`: inferred from cost-of-revenue $818M (2025) — cloud spend
  bundled, not separated.
- `revenue_usd_annual: 2800000000`: approximate FY2025 revenue per research doc
  §1.1 (2.3–2.9B range); precise figure requires 10-K line-item fetch.
- `archetype_tags: [php-hyperscale]`: reflects the PHP legacy monolith origin even
  though the stack is now polyglot.
- NEEDS_RESEARCH: exact 2025 total revenue + cost-of-revenue + operating margin,
  retrieved from 2025 10-K HTM with its own SHA256.
- **`data_quality_grade: Q3` (downgraded 2026-04-23)** — citation `sha256` is the
  synthesis-doc bundle hash (`d620fe4a...`, matches `raw/Etsy 2021-2026  Scale,
  Infrastructure, and Stack.md`), not the bytes at the cited SEC URL. Passes Zod
  `sha256HexSchema` format regex but violates `verify-citations.ts` semantic
  intent. SOURCES.md row flagged `sha_bundle_not_url` (2026-04-23). Entry does
  NOT count toward `corpus_ready` until scraper's per-URL re-fetch (task #28)
  lands and curator updates the citation with real per-URL bytes. This entry
  carries no §6.3-compliant math priors regardless (latency/availability/cost
  curves all empty per Etsy's disclosure practice), so the Q3 grade reflects
  provenance defect only — the research content itself is well-footnoted
  synthesis from multiple 10-Ks (2021-2025), Integrated Annual Reports, and
  Code as Craft posts.
