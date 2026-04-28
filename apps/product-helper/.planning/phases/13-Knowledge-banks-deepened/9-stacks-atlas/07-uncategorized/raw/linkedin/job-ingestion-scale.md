---
source_url: "https://www.linkedin.com/blog/engineering/infrastructure/engineering-linkedins-job-ingestion-system-at-scale"
retrieved_at: "2026-04-23T05:11:00Z"
publish_date: "2026-01-29"
source_tier: "B_official_blog"
sha256: "eb3bc004c77683400dfcf6e4801e5edba283d810a06cb9678345341a4c8c5325"
bytes: 102644
filing_type: "blog"
author: "Anvesh Uppoora, Rishav Kumar, Avinash Permude"
is_ic: true
---

# Engineering LinkedIn's job ingestion system at scale

Raw bytes at `_sources/job-ingestion-scale.html`. Content extracted via WebFetch 2026-04-23.

## Scale metrics (headline numbers for Little's-Law / throughput priors)

| Metric | Value |
|---|---|
| Daily job postings processed | **"millions" from "thousands of global sources"** |
| Raw data per day | **>20 terabytes** |
| Annual job updates | **"billions"** |
| Average RawJob processing time | **~100ms through 50 static + 350 dynamic JFPs** |

## Architectural components

**Intake methods**:
- Job push via LinkedIn's JobPostings API (partner-driven)
- Job pull from heterogeneous sources (structured XML/JSON feeds, unstructured career sites)

**Core pipeline stages**:
1. **Orchestrator** — load balancer routing to specialized mining nodes
2. **Mining nodes** — purpose-built for structured feeds, career sites, APIs, legacy protocols
3. **Priority queue system** — rank-based routing for high-value partners
4. **Job field processors (JFPs)** — static (50) + dynamic (350) transformation tiers (pre, mid, post)
5. **Kafka** — publishes normalized `RawJobs` downstream

**Key innovation**: Configuration-driven extraction (Sitemaps YAML) with AI-powered onboarding replaces code deployments, reducing partner-onboarding time.

## Interpretation for priors

- **Throughput prior (if curator can express)**: 20 TB/day ÷ 86,400s ≈ 232 MB/s sustained raw ingest rate. Millions of job postings/day / 86,400 ≈ >11 jobs/s peak (low for LinkedIn scale — this is ingest of new-or-updated postings, not query load). Flag: schema gap #31 (throughput not expressible) is directly relevant here — absent a throughput prior shape, this must live in body narrative.
- **Latency prior**: 100ms average through 400 transformations (50 static + 350 dynamic). Per-JFP amortized latency ≈ 100ms/400 = 0.25ms per processor. Strong tier-B+is_ic anchor for pipeline-hop latency in decision-matrix priors.
- **Stack hint**: Kafka is canonical anchor for LinkedIn's messaging substrate (LinkedIn invented Kafka — still the reference customer).
- **AI integration**: "AI-powered onboarding" for sitemap generation confirms LinkedIn is an LLM-consumer for internal tooling, not just public features.

## is_ic assessment

3 named authors, LinkedIn Engineering blog byline convention (IC-authored). Treated as **is_ic=true**.

- **Anvesh Uppoora**: appears engineering IC (primary author on ingestion infra)
- **Rishav Kumar**: co-author
- **Avinash Permude**: co-author

## Freshness

Published 2026-01-29 — well inside 18-month staleness window at retrieval (2026-04-23). Strong freshness for scale + latency priors.