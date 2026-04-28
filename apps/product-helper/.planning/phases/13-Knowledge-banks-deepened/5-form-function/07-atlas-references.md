# KB-5 → Atlas Reference Index

Per v1 §6.3 of `plans/c1v-MIT-Crawley-Cornell.md`, the KB-9 Public Stacks Atlas grounds form-function concept generation with empirical priors on **real-world instrument choices** — which concrete forms (components, services, patterns) real companies picked for each internal function at each scale band.

KB-5 uses atlas entries to populate the **morphological matrix** (Ch 7 §7.4) with empirically-grounded instrument options rather than LLM-generated ones.

## Canonical atlas paths

All entries are at `apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/9-stacks-atlas/04-filled-examples/companies/<company>.md`.

## Retrieval list (11 companies)

- `9-stacks-atlas/04-filled-examples/companies/airbnb.md` — two-sided marketplace instruments: ElasticSearch for search, Kafka for events, MySQL+Vitess for OLTP, Druid for analytics.
- `9-stacks-atlas/04-filled-examples/companies/anthropic.md` — LLM-inference instruments: GPU clusters, KV-cache tiers, vector stores.
- `9-stacks-atlas/04-filled-examples/companies/cloudflare.md` — edge instruments: Workers (V8 isolates), Durable Objects, R2 object storage, KV store.
- `9-stacks-atlas/04-filled-examples/companies/discord.md` — real-time instruments: Elixir (GenServer), Rust (hot path), ScyllaDB (message storage), Redis.
- `9-stacks-atlas/04-filled-examples/companies/dropbox.md` — storage instruments: Magic Pocket (custom block storage), MySQL metadata, edge caching.
- `9-stacks-atlas/04-filled-examples/companies/etsy.md` — e-commerce instruments: PHP, MySQL (sharded), Memcached, Hadoop for analytics.
- `9-stacks-atlas/04-filled-examples/companies/linkedin.md` — social-graph instruments: Espresso (NoSQL), Kafka (origin), Pinot (OLAP), Samza (stream).
- `9-stacks-atlas/04-filled-examples/companies/netflix.md` — streaming instruments: Cassandra, EVCache, Open Connect (CDN), Eureka+Ribbon (service mesh), Chaos Monkey.
- `9-stacks-atlas/04-filled-examples/companies/shopify.md` — multi-tenant instruments: Ruby/Rails, MySQL (Pods), Redis, Memcached, Kafka.
- `9-stacks-atlas/04-filled-examples/companies/stripe.md` — payments instruments: Ruby/Rails, Mongo→Postgres migration, idempotency keys, ledger schema.
- `9-stacks-atlas/04-filled-examples/companies/uber.md` — dispatch instruments: Go, Schemaless (custom KV over MySQL), Cassandra, H3 (geospatial), Cadence (workflow).

## Usage pattern (KB-5 morphological matrix)

For an internal function like "store user events at 10M DAU":
1. Filter atlas entries with DAU ≥ 10M.
2. For each, extract the instrument slot matching the function (queue, event-store, OLAP).
3. Populate the morphological matrix column with real instruments + citation.
4. Cluster instruments by pattern (stream + warehouse, CDC + OLAP, etc.) to derive integrated concepts.

## Per-entry schema

Per v1 §6.3 (same as KB-4 consumption):
- DAU/MAU banded, stack slots, infra + region, cost band, scaling inflections, citations.

The concept-template output (Figure 7.4 — intent / function / form) is emitted with `form_sources[]` pointing to atlas entries, giving each form choice an empirical provenance trail.
