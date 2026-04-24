---
source_url: "https://stripe.com/blog/how-stripes-document-databases-supported-99.999-uptime-with-zero-downtime-data-migrations"
canonical_url: "https://stripe.dev/blog/how-stripes-document-databases-supported-99.999-uptime-with-zero-downtime-data-migrations"
retrieved_at: "2026-04-24T00:10:44Z"
publish_date: "2024-06-06"
source_tier: "B_official_blog"
filing_type: "blog"
author: "Jimmy Morzaria, Suraj Narkhede (Stripe Database Infrastructure)"
is_ic: true
bytes_integrity: "stripe_blog_csr_wall_content_via_webfetch — body not in static HTML; only metadata/title/byline/dek rendered server-side. Treat as title-level claim + author IC attestation. Similar profile to airbnb medium CAPTCHA_WALL finding (#38)."
extracted_claims:
  - availability_target_99_999_pct
  - zero_downtime_data_migrations
  - internal_system_named_data_movement_platform
  - domain_document_databases
---

# Stripe document-database 99.999% uptime with zero-downtime migrations

## Content captured (Tier B + is_ic, 2024-06-06)

- **Availability claim (title-level):** 99.999% uptime on document databases. (At 5-nines, budget ≈5.26 minutes/year of downtime.)
- **Method claim (title + dek):** zero-downtime data migrations enabled by an internal system named the **Data Movement Platform**.
- **Authors:** Jimmy Morzaria, Suraj Narkhede — both Stripe Database Infrastructure engineers (IC attestation).
- **Specifics NOT recovered via WebFetch:** database engine, shard counts, document counts, QPS, cutover mechanics. Full body is client-side rendered; WebFetch sees only the landing shell.

## Interpretation for priors

- **Availability prior (financial-infrastructure archetype):** 99.999% is a credible target for a single-tier DB platform at Stripe; it is a title-level published claim from an IC author, so can be cited as **IC attestation at tier B**. Do NOT cite internal numbers (QPS/shard counts) from this article — they were not retrieved.
- **Pattern prior:** existence of an internal "Data Movement Platform" abstraction is a strong signal for online-migration tooling as a standard pattern at payments-grade scale.

## Provenance notes

- Stripe blog pages are CSR React; only metadata is server-rendered. This parallels the Medium CAPTCHA_WALL issue already in-flight as task #38 (bytes_integrity schema gap). Recommend the same `bytes_integrity` tag landing for stripe.dev / stripe.com blog.
- SHA256 at rest not recorded (rendered text only, no stable byte-exact capture).
