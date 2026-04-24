---
slug: netflix
name: Netflix
kind: public
hq: Los Gatos, California
website: https://www.netflix.com
last_verified: 2026-04-23
verification_status: verified
reviewer: curator@c1v-kb8-atlas
data_quality_grade: Q1
primary_source:
  tier: A_sec_filing
  source_url: https://www.sec.gov/Archives/edgar/data/1065280/000106528025000033/ex991_q424.htm
  anchor: "Q4 2024 8-K Exhibit 99.1 — shareholder letter"
scale:
  metric: paying_subscribers
  value: 301630000
  as_of: "2024-Q4"
  citation:
    kb_source: netflix
    source_url: https://www.sec.gov/Archives/edgar/data/1065280/000106528025000033/ex991_q424.htm
    source_tier: A_sec_filing
    publish_date: 2025-01-21
    retrieved_at: 2026-04-23T03:15:30Z
    sha256: a54c8152622c02a33dd74b104cf0b3db305b2f962721144e44a462630d125158
    anchor: "Global Streaming Paid Memberships — 2024-Q4 = 301.63M"
    corroborated_by: []
dau_band: over_100m
revenue_usd_annual: 45183000000
infra_cost_usd_annual: null
cost_band: over_1b_usd
headcount_est: 16000
economics_citations:
  - kb_source: netflix
    source_url: https://www.sec.gov/Archives/edgar/data/1065280/000106528026000034/nflx-20251231.htm
    source_tier: A_sec_filing
    publish_date: 2026-01-23
    retrieved_at: 2026-04-22T00:00:30Z
    sha256: 47f992a70276ea6a071fe82960de58bab9d1bb74b0ca8e0fbd09f03a25187603
    anchor: "FY2025 10-K — revenues $45.183B, operating income $13.327B, capex $688M, ~16k FTEs"
    corroborated_by: []
frontend:
  web: [react, typescript]
  mobile: [native_ios, android_native]
backend:
  primary_langs: [java, python]
  frameworks: [spring_boot, zuul2, netty]
data:
  oltp: [cassandra]
  cache: [evcache, memcached]
  warehouse: [s3_iceberg]
infra:
  cloud: [aws]
  compute: [ec2, titus]
  cdn: [openconnect]
  observability: [atlas, mantis]
gpu_exposure: none
inference_pattern: none
latency_priors:
  - anchor: druid_pipeline_end_to_end_p90_s
    description: "End-to-end data pipeline latency at P90 for Druid-backed realtime queries — observability pipeline from event ingest to queryable segment."
    citation:
      kb_source: netflix
      source_url: https://netflixtechblog.com/stop-answering-the-same-question-twice-interval-aware-caching-for-druid-at-netflix-scale-22fadc9b840e
      source_tier: B_official_blog
      publish_date: 2026-04-06
      retrieved_at: 2026-04-22T00:02:20Z
      sha256: c622cb05d9420590d9bac9b168ced55356058ac8da6da953642471245a164063
      anchor: "§Freshness — typically under 5s at P90"
      is_ic: true
      corroborated_by: []
    confidence: 0.85
    verification_status: partial
    result_kind: scalar
    value: 5
    units: s
    percentile: p90
availability_priors: []
cost_curves: []
archetype_tags: [scala-jvm-platform]
related_refs: []
nda_clean: true
ingest_script_version: "1.0.0"
---

# Netflix

Global SVOD streaming platform (NASDAQ: NFLX). Scala/JVM backend at extreme scale;
AWS-primary with Open Connect CDN at the edge. FY2025 revenue $45.183B (+16% YoY),
operating income $13.327B (29.5% margin), capex $688M, ~16,000 FTEs. Paying
memberships 301.63M as of Q4 2024 (last disclosure before Netflix discontinued
membership reporting in FY2025 — see §8 below).

## 1. Scale

Netflix **discontinued quarterly membership reporting starting FY2025**, per the
FY2025 10-K (note 1 to segment tables): "we discontinued the reporting of membership
numbers… focusing instead on revenue and operating margin as the primary financial
metrics." The `scale.metric: paying_subscribers` anchor in this entry's frontmatter
therefore cites the Q4 2024 shareholder letter (8-K Exhibit 99.1, tier A), which is
the last official tier-A disclosure of the metric at 301.63M.

Q4 2024 trajectory per the letter: 260.28M (Q4'23) → 269.60M (Q1'24) → 277.65M (Q2'24)
→ 282.72M (Q3'24) → 301.63M (Q4'24). 19M paid net adds in Q4 2024 alone.

## 2. Frontend stack

React + TypeScript on web; native iOS and native Android on mobile. TV-device
clients are custom. Substantial work on low-latency video playback on varied
network conditions.

## 3. Backend stack

Scala/Java monolith-plus-microservices on the JVM, with **Spring Boot** as the
primary framework. **Zuul 2** (Netflix-authored, open-sourced 2018) is the edge
gateway: async Netty-based NIO, runs in front of all public-facing APIs. Python is
used for tooling and DS/ML paths.

**Titus** is Netflix's container-orchestration layer on top of EC2 (pre-EKS); it
provides the compute substrate for stateless services and batch jobs. The 2025-11-07
"Mount Mayhem" post (IC-authored by Harshad Sane + Andrew Halaney) details container
scaling on modern CPUs and mount-namespace kernel-level bottlenecks Netflix
surfaced at scale.

## 4. Data & storage

- **OLTP**: Cassandra (Netflix was one of the largest early Cassandra users; contributed Priam and other tooling).
- **Cache**: EVCache (Netflix-authored Memcached layer with replication + consistent hashing across AZs); Memcached underlies it.
- **Warehouse**: S3 + Apache Iceberg for the analytics lake; Druid for low-latency realtime observability.
- **Search / analytics**: Druid at scale; the 2026-04-06 "Interval-aware caching for Druid" post (IC-authored by Ben Sykes) introduces a cache layer that pushes 82% of user queries to at-least-partial cache hits.

## 5. Infrastructure

AWS-primary. Netflix has been on AWS since the mid-2000s migration away from
datacenter. Compute: EC2 + Titus. Observability: Atlas (time-series DB) + Mantis
(stream processing) — both Netflix-authored. Edge delivery: **Open Connect**,
Netflix's custom CDN (peering + cache appliances co-located with ISPs).

## 6. Math priors commentary

One §6.3-compliant latency prior is emitted:

- `druid_pipeline_end_to_end_p90_s = 5` (tier B, is_ic=true, published 2026-04-06).
  This is the end-to-end time from event ingest to a query being answerable on
  fresh data at P90. It feeds Little's-Law type analyses on observability pipelines
  and cache-TTL design (the post specifically uses this number to argue that a 5s
  cache TTL introduces "negligible additional staleness").

**Not emitted as priors** but material for later extraction:
- Druid cache hit rates (82% of user queries partial-hit, 84% of data served from
  cache). These are ratios, not scalar latency/availability/cost values, and don't
  slot cleanly into the current schema. Candidate for a future `ratio_priors`
  category.
- Open Connect CDN traffic share and hit-rate characteristics (widely reported in
  2018 Zuul 2 post, but that post is now outside the 18-month staleness window —
  flagged in SOURCES.md as `stale_gt_18mo_architecture_anchor_only`).

No `availability_priors`: Netflix does not publish an SLA number for the consumer
streaming service in any staged source.

No `cost_curves`: Netflix is B2C — no per-request pricing curve applies.

## 7. Migrations & turning points

- **AWS migration (2008-2016)**: canonical reference for "cloud-native at scale" — Netflix ran a public, multi-year datacenter exit.
- **Zuul 2 (NIO async, 2018)**: moved from Zuul 1 blocking-IO to Netty/NIO. Origin of the "async-at-the-edge" pattern many companies later adopted.
- **Open Connect CDN**: Netflix's own CDN built on peering + cache appliances co-located with ISPs.
- **Druid as observability backend**: Netflix has pushed Druid to scales that drove upstream Druid-project improvements.
- **FY2025 metric shift (effective Q1 2025)**: Netflix stopped reporting member counts quarterly, citing preference for revenue + operating margin as the primary KPIs. The letter announced this change: "Starting with our Q2'25 results, we'll… [announce memberships only at milestones, not quarterly]". This is the reason `scale.citation` points to Q4 2024 rather than FY2025.

## 8. Sources

1. **Netflix FY2025 Form 10-K** — tier `A_sec_filing` — https://www.sec.gov/Archives/edgar/data/1065280/000106528026000034/nflx-20251231.htm — published 2026-01-23 — sha256 `47f992a70276ea6a071fe82960de58bab9d1bb74b0ca8e0fbd09f03a25187603`. Source for revenue, operating income, capex, employees. Discontinues `paying_subscribers` reporting.
2. **Netflix Q4 2024 8-K Exhibit 99.1 (shareholder letter)** — tier `A_sec_filing` — https://www.sec.gov/Archives/edgar/data/1065280/000106528025000033/ex991_q424.htm — published 2025-01-21 — sha256 `a54c8152622c02a33dd74b104cf0b3db305b2f962721144e44a462630d125158`. Source for `paying_subscribers = 301.63M` at 2024-Q4.
3. **"Stop answering the same question twice — interval-aware caching for Druid at Netflix scale"** — tier `B_official_blog`, IC-authored (Ben Sykes) — https://netflixtechblog.com/stop-answering-the-same-question-twice-interval-aware-caching-for-druid-at-netflix-scale-22fadc9b840e — published 2026-04-06 — sha256 `c622cb05d9420590d9bac9b168ced55356058ac8da6da953642471245a164063`. Source for `druid_pipeline_end_to_end_p90_s = 5`.
4. **"Mount Mayhem at Netflix: scaling containers on modern CPUs"** — tier `B_official_blog`, IC-authored (Harshad Sane, Andrew Halaney) — https://netflixtechblog.com/mount-mayhem-at-netflix-scaling-containers-on-modern-cpus-f3b09b68beac — published 2025-11-07 — sha256 `c88648ed68c2e1c1bfaac7cd9f2db26df2dcca60dd9acee62b77a9d9d6a551e5`. Narrative stack source; no numeric prior extracted in v1.
5. **"Open Sourcing Zuul 2"** — tier `B_official_blog` — https://netflixtechblog.com/open-sourcing-zuul-2-82ea476cb2b3 — published 2018-05-21 — sha256 `8ab49dbed981a2542c7090dcfce1322d0483705b05aa5c1d2f7789a425ec74e0`. **STALE (>18mo)** — retained for edge-gateway architecture narrative only, not cited as a prior.

## Curator notes

- `data_quality_grade: Q1` — zero NEEDS_RESEARCH on mandatory fields; `paying_subscribers` cites tier-A SEC filing; `druid_pipeline_end_to_end_p90_s` latency prior cites tier-B+is_ic; `last_verified` 2026-04-23 within 18mo.
- `scale.as_of: "2024-Q4"` is 15 months stale but within the 18-month window. Will trip the staleness warning by mid-2026 — flagging for a re-fetch pass once Netflix announces the next membership-milestone update.
- `cost_band: over_1b_usd` inferred from AWS + Open Connect scale; 10-K doesn't directly disclose infra spend but cost-of-revenue line item is $25B+ and content-amortization dominates it. Infra sub-line is undisclosed, hence `infra_cost_usd_annual: null`.
- Stack `backend.frameworks` includes `zuul2` + `netty` since Zuul 2 is a stack component, not just a piece of architecture history — but the Zuul 2 citation (2018) is stale and only used narratively in §3/§7.
