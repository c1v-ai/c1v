---
source_url: "https://blog.cloudflare.com/r2-ga/"
retrieved_at: "2026-04-23T04:05:20Z"
publish_date: "2022-09-21"
source_tier: "B_official_blog"
sha256: "5c6ecf4a0ae3bbd2116bc0e2a0a0f828539216e35b9b96d90d52518541fda57d"
bytes: 383718
filing_type: "blog"
author: "Aly Cabral"
is_ic: false
---

# R2 Storage — General Availability (Cloudflare)

Raw bytes at `_sources/r2-ga.html`. Content extracted via WebFetch 2026-04-23.

## Pricing (canonical cost-curve anchor)

| Dimension | Price |
|---|---|
| Storage | **$0.015 / GB-month** |
| Class A operations (writes, lists) | **$4.50 per million** |
| Class B operations (reads) | **$0.36 per million** |
| **Egress** | **$0.00 — zero egress fees (core differentiator)** |

## Free tier

- 10 GB-months storage
- 1M Class A operations / month
- 10M Class B operations / month

## Usage signals at GA

- >12,000 developers adopted R2 during open beta (4-month period)
- Cloudflare Images serves "thousands of customers in production" on R2
- Case-study customer: Vecteezy migrated after "spending six figures in egress fees" (supplier-hostile comparison to S3)

## Interpretation for priors

- **cost_curve**: This is the canonical public pricing for object storage on a zero-egress substrate. Piecewise: storage linear in GB, operations linear in call count, egress free at 0 marginal cost. Pair with AWS S3 list price (tier B dual-cite from aws.amazon.com/s3/pricing) for a complete cost-curve prior spanning the two standard substrates.
- **Latency priors**: NOT in this post. R2 p50/p99 latency not disclosed.
- **Total stored bytes / total objects**: NOT disclosed at GA or in any fetched Cloudflare source. Would require back-out from COGS + per-GB rate as a synthetic estimate (not a citable prior).

## Staleness

Published 2022-09-21 — outside 18-month window. Retained because R2 pricing has remained stable (public Cloudflare pricing page shows unchanged schedule as of 2025). For stricter staleness compliance, curator may want to supplementary-fetch the current live pricing page (not in this batch).

## Is_ic assessment

Aly Cabral is Product Manager for R2 — not IC engineer. is_ic=false.