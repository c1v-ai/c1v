---
source_url: "https://www.linkedin.com/blog/engineering/optimization/reducing-latency-and-cost-for-identity-services"
retrieved_at: "2026-04-23T05:12:00Z"
publish_date: "2020-04-22"
source_tier: "B_official_blog"
sha256: "8f76ef4a5b4192142a2fbe53ae57527e8634de0c04a57c01df6a2fdfa3118a48"
bytes: 93148
filing_type: "blog"
author: "Xiang Zhang, Estella Pham, Ke Wu"
is_ic: true
---

# How we reduced latency and cost-to-serve by merging two systems (LinkedIn Identity)

Raw bytes at `_sources/identity-latency-cost.html`. Content extracted via WebFetch 2026-04-23.

## Headline numbers (canonical latency + cost anchors)

| Metric | Value |
|---|---|
| **QPS served by identity service** | **>500,000 queries/second** |
| p50 latency improvement | **14%** |
| p90 latency | **26.67ms → 24.84ms (6.9% improvement)** |
| p99 latency improvement | **9.6%** |
| Cores decommissioned | **>12,000** |
| Memory decommissioned | **>13,000 GB** |
| Memory allocation rate per host | **350 MB/s → 100 MB/s (−28.6%)** |

## Architecture

- **Before**: Identity midtier + identity data service (separate services connected over network)
- **After**: Consolidated into single service (API-as-library), eliminating the midtier-to-data-service network hop
- **APIs**: Unchanged for clients (backward-compatible consolidation)
- **Rollout**: Four-step — temporary API-as-library → gradual ramping via T-REX A/B testing → host decommissioning → code cleanup

## Interpretation for priors

- **Latency priors (golden)**: p90 = 24.84ms is a tier-B+is_ic-authored anchor for "identity service" request-path latency at >500K QPS. Paired p50/p99 deltas make this a multi-quantile prior — rare and valuable for Little's-Law-based M/M/c sizing calculations.
- **Cost curve (golden)**: 12K cores + 13K GB memory decommissioned = substantial absolute cost-savings anchor. Per-request cost reduction implied by throughput/cores ratio.
- **Architectural pattern**: "Merge two services into one to eliminate network hop" is the canonical microservices-consolidation prior for M4 decision-matrix "break-up vs consolidate" choice node.
- **Throughput prior**: 500K+ QPS sustained is a strong scale anchor for LinkedIn identity surface. Again hits schema gap #31 — not expressible as a throughput-shaped prior, but usable narratively.

## is_ic assessment

3 named engineers, LinkedIn Engineering blog IC-byline convention. Treated as **is_ic=true**.

## Staleness

Published 2020-04-22 — **6 years old, well past 18-month staleness window**. Retained because:
- The architectural pattern (service consolidation) is evergreen
- LinkedIn identity service QPS has almost certainly grown since 2020, so 500K+ is a conservative floor
- Per-quantile latency numbers are a canonical LinkedIn scale anchor; no superseding post in the corpus

**Curator should flag `staleness_warning` if using for fresh priors.** Treat as architecture-narrative anchor rather than quantitatively-current prior.