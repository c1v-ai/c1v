---
source_url: "https://medium.com/airbnb-engineering/from-vendors-to-vanguard-airbnbs-hard-won-lessons-in-observability-ownership-3811bf6c1ac3"
retrieved_at: "2026-04-23T23:52:30Z"
publish_date: "2026-03-17"
source_tier: "B_official_blog"
sha256: "34f3075ef091be276752d4c15a606e3c25dd13fc9a2cbcd293dd27182a078b1c"
bytes: 5831
filing_type: "blog"
author: "Callum Jones, Rong Hu"
is_ic: true
bytes_integrity: "CAPTCHA_WALL — curl returns Cloudflare Turnstile wall (5,831 bytes). SHA256 is of the wall bytes. Content via WebFetch extraction. Do NOT re-verify SHA against source_url."
---

# From vendors to vanguard: Airbnb's hard-won lessons in observability ownership

## Scale (tier B + is_ic, FRESH 2026-03-17)

| Metric | Value |
|---|---|
| Timeseries migrated | **300M** |
| Dashboards translated | **3,100** |
| Alerts migrated | **300,000+** |
| Services transitioned | **1,000** |
| Migration timeline | **5 years** |

## Why the migration

Third-party vendor priced on ingestion volume → misaligned incentives. Lacked "feedback loop of how observability data is consumed" → couldn't optimize cost.

## Stack

- Prometheus-based metrics foundation + PromQL
- Custom metadata engine (`_otel_metric_type_` labels for reliable type mapping)
- Code-based alert authoring with backtesting + diffing
- AI tooling for semantic-metadata-driven PromQL generation

## Interpretation for priors

- **cost_curve narrative**: 5-year build-vs-buy case study; concrete substitute-cost delta not quantified but pairs tightly with `metrics-pipeline-otel-vmagent.md` ("order of magnitude cost reduction").
- **stack narrative**: Prometheus + PromQL + OTel metadata is canonical Airbnb observability. Tier B + is_ic.
