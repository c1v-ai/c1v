# KB-4 → Atlas Reference Index

Per v1 §6.3 of `plans/c1v-MIT-Crawley-Cornell.md`, the KB-9 Public Stacks Atlas grounds decision-network scoring with empirical priors — "decision-network scoring stops being LLM guesswork." Every decision node that cites cost, latency, throughput, availability, or scaling inflections MUST cite at least one atlas entry.

## Canonical atlas paths

All entries are at `apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/9-stacks-atlas/04-filled-examples/companies/<company>.md`.

## Retrieval list (11 companies, as of T9 patcher pass)

- `9-stacks-atlas/04-filled-examples/companies/airbnb.md` — large two-sided marketplace, Postgres + Kafka + Elasticsearch stack; cites cost bands for global rollouts. Use for decisions involving search, geospatial, multi-region consistency.
- `9-stacks-atlas/04-filled-examples/companies/anthropic.md` — LLM serving / GPU infrastructure; use for decisions involving model inference costs, vector stores, GPU-bound compute.
- `9-stacks-atlas/04-filled-examples/companies/cloudflare.md` — edge/CDN/DNS; use for decisions involving edge-compute, global distribution, DDoS resilience.
- `9-stacks-atlas/04-filled-examples/companies/discord.md` — real-time messaging at scale (trillions of messages indexed, Elixir+Rust+ScyllaDB); use for decisions involving chat, pub/sub, hot-partition mitigation.
- `9-stacks-atlas/04-filled-examples/companies/dropbox.md` — file storage + sync; use for decisions involving block storage, CDN cutover (Magic Pocket), bandwidth costs at PB scale.
- `9-stacks-atlas/04-filled-examples/companies/etsy.md` — mid-scale e-commerce marketplace; use for decisions involving long-tail catalog search, payments, mid-scale Postgres+MySQL tradeoffs.
- `9-stacks-atlas/04-filled-examples/companies/linkedin.md` — social graph + enterprise SaaS; use for decisions involving graph queries, stream processing (Kafka origin), REST→GraphQL tradeoffs.
- `9-stacks-atlas/04-filled-examples/companies/netflix.md` — global streaming + chaos engineering; use for decisions involving CDN (Open Connect), microservices resilience, regional failover.
- `9-stacks-atlas/04-filled-examples/companies/shopify.md` — multi-tenant e-commerce platform; use for decisions involving tenant-isolation (Pods), Ruby/Rails scalability, burst-load handling (BFCM).
- `9-stacks-atlas/04-filled-examples/companies/stripe.md` — payments API + ledger correctness; use for decisions involving strong consistency, idempotency, API versioning.
- `9-stacks-atlas/04-filled-examples/companies/uber.md` — dispatch + geospatial + high-throughput write; use for decisions involving real-time matching, H3 geospatial indexing, multi-active-datacenter.

## Per-entry schema (what the decision node should cite)

Per v1 §6.3, each atlas entry supplies:
- Company, product, approximate DAU/MAU (banded: 1K / 10K / 100K / 1M / 10M / 100M).
- Stack slots: data layer, cache, compute, queue, CDN, auth, vector store, observability.
- Infra providers + region strategy.
- Monthly cost band ($/$$/$$$) or documented number.
- Scaling inflection events.
- Citation links.

## Usage pattern (KB-4 decision-net)

A decision node citing "Postgres vs. DynamoDB at 1M DAU":
1. Filter atlas entries with DAU ≥ 1M in matching pattern (two-sided marketplace, transactional system).
2. Pull stack-slot `data layer` from each.
3. Produce empirical prior with `provisional: true` + `sample_size: N` metadata (per R2 gate, threshold 7).
4. Emit `decision_audit` entry with `kb_chunk_ids` = atlas paths.

## Gate R2 — provisioning threshold

Per `plans/c1v-MIT-Crawley-Cornell.md` §11 R2 (resolved 2026-04-23):
- Threshold lowered **20 → 10 → 7** entries.
- Priors emitted with `provisional: true` + `sample_size: N` metadata.
- Corpus currently passes at N=11 (this list).
