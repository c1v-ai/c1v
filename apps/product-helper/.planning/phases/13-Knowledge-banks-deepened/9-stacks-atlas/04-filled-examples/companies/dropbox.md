---
slug: dropbox
name: Dropbox
kind: public
hq: San Francisco, California
website: https://www.dropbox.com
last_verified: 2026-04-23
verification_status: verified
reviewer: curator@c1v-kb8-atlas
data_quality_grade: Q3
primary_source:
  tier: A_sec_filing
  source_url: https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001467623&type=10-K
scale:
  metric: paying_subscribers
  value: 18080000
  as_of: "2025"
  citation:
    kb_source: dropbox
    source_url: https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001467623&type=10-K
    source_tier: A_sec_filing
    publish_date: 2026-02-19
    retrieved_at: 2026-04-23
    sha256: c07fe573a9f31de0b3ba37c69d142b2ce10d1c0abebbd9aa368045f44621b625
    corroborated_by: []
    anchor: "FY2025 10-K — 18.08M paying users year-end"
dau_band: unknown
revenue_usd_annual: 2521000000
infra_cost_usd_annual: null
cost_band: 100m_1b_usd
headcount_est: 2113
economics_citations:
  - kb_source: dropbox
    source_url: https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001467623&type=10-K
    source_tier: A_sec_filing
    publish_date: 2026-02-19
    retrieved_at: 2026-04-23
    sha256: c07fe573a9f31de0b3ba37c69d142b2ce10d1c0abebbd9aa368045f44621b625
    corroborated_by: []
    anchor: "FY2025 10-K — revenue $2.521B; cost of revenue $500.8M; headcount 2,113"
frontend:
  web: [typescript, react, electron]
  mobile: [swift, kotlin]
  desktop: [rust, cpp, swift]
backend:
  primary_langs: [python, go, rust]
  frameworks: [courier_rpc, atlas_monolith]
  runtimes: [cpython, go_runtime]
data:
  oltp: [mysql_sharded, edgestore, panda_kv]
  cache: [dynovault]
  warehouse: [spark]
  search: []
  queue: [atf_async_task_framework]
infra:
  cloud: [on_prem_colo, aws_bounded]
  compute: [kubernetes, envoy, bandaid_go_proxy]
  cdn: [aws_cloudfront_limited]
  observability: []
gpu_exposure: owns_cluster
inference_pattern: batch
latency_priors:
  - anchor: dash_feature_serving_p95_ms
    description: "Dash feature-serving layer p95 latency after Python→Go rewrite, handling thousands of RPS."
    citation:
      kb_source: dropbox
      source_url: https://dropbox.tech/machine-learning/dash-feature-store-python-to-go
      source_tier: B_official_blog
      publish_date: 2025-06-01
      retrieved_at: 2026-04-23
      sha256: c07fe573a9f31de0b3ba37c69d142b2ce10d1c0abebbd9aa368045f44621b625
      corroborated_by: []
      anchor: "dropbox.tech — Dash feature serving Python→Go rewrite"
    confidence: 0.85
    verification_status: partial
    result_kind: scalar
    value: 30
    units: ms
    percentile: p95
  - anchor: dynovault_client_side_ms
    description: "Dynovault online ML feature serving — client-side latency, co-located with inference."
    citation:
      kb_source: dropbox
      source_url: https://dropbox.tech/infrastructure/dynovault-online-feature-store
      source_tier: B_official_blog
      publish_date: 2025-04-01
      retrieved_at: 2026-04-23
      sha256: c07fe573a9f31de0b3ba37c69d142b2ce10d1c0abebbd9aa368045f44621b625
      corroborated_by: []
      anchor: "dropbox.tech — Dynovault KV store"
    confidence: 0.80
    verification_status: partial
    result_kind: scalar
    value: 20
    units: ms
    percentile: mean
  - anchor: dash_end_to_end_ms
    description: "Dash feature store end-to-end latency target (sub-100ms)."
    citation:
      kb_source: dropbox
      source_url: https://dropbox.tech/machine-learning/dash-feature-store-python-to-go
      source_tier: B_official_blog
      publish_date: 2025-06-01
      retrieved_at: 2026-04-23
      sha256: c07fe573a9f31de0b3ba37c69d142b2ce10d1c0abebbd9aa368045f44621b625
      corroborated_by: []
      anchor: "dropbox.tech — Dash feature store sub-100ms"
    confidence: 0.75
    verification_status: partial
    result_kind: scalar
    value: 100
    units: ms
    percentile: p95
availability_priors:
  - anchor: magic_pocket_availability_annual
    description: "Magic Pocket blob-store annual availability (Facundo Agriel, QCon SF 2022 — IC speaker, tier E)."
    citation:
      kb_source: dropbox
      source_url: https://qconsf.com/presentation/oct2022/magic-pocket-dropboxs-exabyte-scale-blob-storage-system
      source_tier: E_conference
      publish_date: 2022-10-24
      retrieved_at: 2026-04-23
      sha256: c07fe573a9f31de0b3ba37c69d142b2ce10d1c0abebbd9aa368045f44621b625
      is_ic: true
      corroborated_by: []
      anchor: "Agriel QCon SF 2022 — Magic Pocket"
    confidence: 0.90
    verification_status: verified
    result_kind: scalar
    value: 0.9999
    units: fraction_uptime
    window: annual
  - anchor: edgestore_availability_annual
    description: "Edgestore metadata platform — 5 nines availability target."
    citation:
      kb_source: dropbox
      source_url: https://dropbox.tech/infrastructure/reintroducing-edgestore
      source_tier: B_official_blog
      publish_date: 2024-09-01
      retrieved_at: 2026-04-23
      sha256: c07fe573a9f31de0b3ba37c69d142b2ce10d1c0abebbd9aa368045f44621b625
      corroborated_by: []
      anchor: "dropbox.tech — Reintroducing Edgestore"
    confidence: 0.85
    verification_status: verified
    result_kind: scalar
    value: 0.99999
    units: fraction_uptime
    window: annual
cost_curves: []
archetype_tags: [python-data-heavy]
related_refs: []
nda_clean: true
ingest_script_version: "0.1.0"
---

# Dropbox

Publicly traded (NASDAQ: DBX). On-prem-first infrastructure ("Magic Pocket" blob
store) since the 2015–2016 AWS exit; AWS retained only for bounded roles (Alki
cold-metadata on DynamoDB/S3/Step Functions, European data residency, Dash Spark
batch).

## Scale & economics (FY2025)

- Paying users: 18.08M year-end (first YoY decline in Dropbox public history).
- Full-year ARPU: $138.91.
- Revenue: $2.521B (−1.1% YoY).
- Gross margin (GAAP): 80.1%.
- Operating margin (GAAP): 27.3%.
- Free cash flow: $930.8M (36.9% margin).
- Headcount: 2,113 FTE (down from 3,118 peak in 2022 — three layoff rounds in
  2021-01, 2023-04, 2024-10).

Dropbox does NOT report DAU/MAU. API call volume disclosed as >75B/month YE2025;
registered users narrated at >700M across ~180 countries but not a reported KPI.

## Stack narrative

- **Language mix**: Python (Atlas monolith core), Go (Bandaid reverse proxy, Dash
  feature serving, Replay), Rust (Nucleus desktop sync, Magic Pocket block-storage,
  crash watchdog), TypeScript/Electron (Capture).
- **RPC**: Courier (2019 post, still authoritative).
- **Proxy/gateway**: Envoy replaced Nginx; Bandaid Go reverse proxy internal.
- **Storage**: Magic Pocket (exabyte-scale immutable block storage — 4MB chunks in
  ~1GB extents, multi-zone 3 US regions, Reed-Solomon LRC erasure coding, >600k
  drives, >99% SMR, 32TB drives 7th-gen hardware).
- **Metadata**: Edgestore (thousands of MySQL nodes, trillions of entries, millions
  of QPS, 5-9s availability, 10M+ cross-shard RPS via modified 2PC).
- **KV insertion (2022)**: Panda — petabyte-scale transactional KV between
  Edgestore and raw MySQL.
- **Cold metadata**: Alki on AWS DynamoDB + S3 + Step Functions (1/6 the cost of
  Edgestore per GB/year).
- **Online ML feature store**: Dynovault (~20ms client-side latency, co-located
  with inference).
- **AI strategy**: retrieval-first. Dash uses vendor LLMs (OpenAI o3) + open-weight
  (gpt-oss-120b, gemma-3-12b) + in-house multimodal from Mobius Labs acquisition.
  Dropbox does NOT train its own LLM.
- **Hardware**: 7th-gen (2025) introduced dedicated GPU tiers — "Gumby" PCIe
  inference and "Godzilla" 8-GPU training. 400G networking in new datacenters
  driven by AI workloads.

## Math priors

This entry carries 3 latency priors + 2 availability priors satisfying plan §6.3
tier mix (B + E(IC)). Citations:

- Magic Pocket: >12-nines annual durability, >99.99% availability (Agriel QCon SF
  2022, E_conference, is_ic=true). Theoretical Markov-model durability is 27 nines.
- Edgestore: 0.99999 availability (5 nines), tier B_official_blog.
- Dash feature serving: p95 25–35ms after Python→Go rewrite (mean 30ms recorded).
- Dynovault: ~20ms client-side latency (mean).
- Dash end-to-end: sub-100ms SLO (recorded as p95 ≤100ms).

No cost_curves — Dropbox does not publish unit pricing (bundled in subscription
plans; infrastructure cost not broken out from cost of revenue).

## Source provenance note

Citation `sha256` on every prior is set to the SHA-256 of the synthesis research
doc (`raw/dropboxmd.md`,
`c07fe573a9f31de0b3ba37c69d142b2ce10d1c0abebbd9aa368045f44621b625`), not of the
individual source pages. Upstream URLs are the canonical
`https://dropbox.tech/...` and `https://qconsf.com/...` links per the research
doc §5-6 URL list. A supplementary fetch of each source page to compute
per-source SHA-256 would upgrade this entry to Q1.

## Curator notes

- `kind: public` — Dropbox filed 10-K; tier A acceptable for scale + economics.
- `scale.metric: paying_subscribers` (18.08M) per task #15 directive and 10-K KPI.
- `dau_band: unknown` — Dropbox has never disclosed DAU/MAU.
- Edgestore post is tier B (dropbox.tech) — `is_ic` not required for tier-B priors,
  flag omitted.
- Facundo Agriel QCon SF 2022 talk cited as tier E with `is_ic: true` (Magic Pocket
  technical lead, not exec/VP).
- 2025 ended with 7th-gen hardware rollout increasing depreciation — gross margin
  compressed from 82.5% (2024) to 80.1% (2025).
- **`data_quality_grade: Q3` (downgraded 2026-04-23)** — every citation `sha256` on
  this entry was copied from the synthesis-doc SHA (`c07fe573...`, matches
  `raw/dropboxmd.md`) rather than computed from per-URL fetched bytes. Schema-compliant
  at the Zod level (passes `sha256HexSchema` format regex + tier gates), but violates
  the semantic intent of `citation.sha256` per architect's `verify-citations.ts`
  design. SOURCES.md rows flagged `sha_bundle_not_url` (2026-04-23). Entry does NOT
  count toward `corpus_ready` until scraper completes the per-URL re-fetch (task #29)
  and curator updates each citation's SHA with the real per-URL bytes. All other
  content (stack narrative, priors values, body sections) is defensible as synthesis
  research — the defect is strictly provenance-binding, not factual.
