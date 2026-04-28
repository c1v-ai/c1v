---
kind: synthesis_aid
not_a_provenance_artifact: true
company: stripe
compiled_at: "2026-04-24T00:10:44Z"
format: dropbox_compass
---

# Stripe — synthesis aid for curator (NOT provenance)

> This file is a synthesis aid in Dropbox-compass format to help the curator draft the stripe entry. It is NOT a provenance artifact — every numeric or architectural claim the curator writes into the atlas entry must still cite one of the per-URL staged files in this folder (see `README.md` manifest).

## Executive summary

Stripe is a financial-infrastructure platform (private, cofounder-led) operating at roughly $1.9T TPV and $159B tender-valuation as of CY2025. Public engineering disclosures in 2024–2026 center on (1) 99.999% document-database availability via an internal Data Movement Platform, (2) a real-time analytics layer for Billing, (3) a rewritten tax-jurisdiction-resolution service, and (4) a 2026 agent-integration benchmark validating Claude Opus 4.5 at 92% on 4 full-stack Stripe-integration tasks. Most engineering-blog bodies are not recoverable via WebFetch due to stripe.dev's client-side rendering — only metadata, byline, and dek are captured for those. The annual letter (tier G) is the dense numeric source for scale bands; blog posts provide qualitative pattern evidence and IC-attested availability targets.

## 1. Scale bands (from tier G, 2026-02-24)

- **TPV:** $1.9T (2025), +34% YoY. ≈ $5.2B/day.
- **Stablecoin TPV:** ~$400B, doubled YoY, 60% B2B.
- **Revenue Suite:** $1B ARR run-rate.
- **Businesses served:** 5M+ direct+via-platforms.
- **Tender valuation:** $159B USD / €135B.
- **Product velocity:** 350+ product updates in 2025.

## 2. Availability prior

- **Published target:** 99.999% on document databases (title-level, IC-attested, 2024-06-06). At 5-nines, budget ≈5.26 min/year downtime.
- **Operational posture:** public status page at status.stripe.com (component list not captured — SPA shell only).
- **Confidence:** medium-high for the class-level prior "payments-grade DB tier at 5-nines is achievable and targeted"; low for any specific number beyond the title.

## 3. Throughput prior

- **Derivable (weak):** $1.9T TPV / 365d / 86400s ≈ $60k/second average; at ~$50 avg payment size this implies ~1.2k payments/second sustained baseline with known peaks (Black Friday, Cyber Monday) multiples higher. NOT a Stripe-disclosed number; derived from the annual letter.
- **Disclosed:** none. Real-time Billing analytics latency, docdb QPS, jurisdiction-resolution RPS all NOT recovered from blog bodies.

## 4. Stack composition (qualitative)

- **Storage tier:** document databases with a zero-downtime migration abstraction named Data Movement Platform.
- **Analytics tier:** real-time analytics layer specifically for Billing ("Revenue Intelligence" team owns it).
- **Geospatial/rules tier:** dedicated Tax Engineering team owns jurisdiction resolution.
- **AI/agent tier:** Goose-based agent harness with MCP servers (terminal, browser, Stripe search) for internal benchmarking; deterministic API+UI graders.
- **Named internal systems surfaced:** Data Movement Platform.
- **Not surfaced in this corpus:** payment-routing stack, shard counts, message-bus, language mix. (Known externally to be Ruby-heavy but not corroborated in the retrieved content.)

## 5. Archetype / tags (for curator)

- `financial-infrastructure`
- `private-company` (no 10-K; tender-valuation instead)
- `global-regulatory-compliance-heavy`
- `agent-tooling-producer` (ships MCP-based agent harness internally)
- `high-availability-5-nines-target`

## 6. Open gaps / unknowns

- No Stripe-disclosed per-endpoint latency (p50/p95/p99) in this corpus.
- No TPS, no shard/cluster count, no region count, no RTO/RPO.
- Blog bodies for docdb, billing analytics, and tax jurisdiction are NOT recovered — re-fetching via a browser-capable path (if pipeline adds one later) could lift this significantly.
- Press-tier scale bands (Bloomberg/The Information) not used — primary source annual letter was sufficient.

## Sources

See `README.md` manifest. All 6 per-URL files are tier B or tier G, all from stripe-owned or operated domains (stripe.com, stripe.dev, status.stripe.com). No dual-C press used.

## Unknowns

- Exact DB engine behind "document databases" — likely MongoDB-family per community reports but NOT corroborated in the retrieved content.
- Whether 99.999% is per-cluster, per-service, or globally aggregated — title-level claim only.
- Billing real-time analytics freshness target, ingest rate, store technology.
- Tax jurisdiction resolution latency improvement magnitude.
