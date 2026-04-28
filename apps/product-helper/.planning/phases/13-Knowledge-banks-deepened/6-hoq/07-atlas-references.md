# KB-6 HoQ → Atlas Reference Index

Per v1 §6.3 of `plans/c1v-MIT-Crawley-Cornell.md`, KB-9 Public Stacks Atlas grounds HoQ **quantitative cells** with empirical priors. Where a naive HoQ rates correlations on a Likert scale, c1v's HoQ cites atlas entries for the numeric justification of each cell — cost bands, latency numbers, availability SLOs, throughput ceilings.

## Canonical atlas paths

All entries are at `apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/9-stacks-atlas/04-filled-examples/companies/<company>.md`.

## Retrieval list (11 companies)

- `9-stacks-atlas/04-filled-examples/companies/airbnb.md` — HoQ axes: search relevance × catalog scale, booking consistency × global rollout.
- `9-stacks-atlas/04-filled-examples/companies/anthropic.md` — HoQ axes: inference latency × model size, cost per token × GPU utilization.
- `9-stacks-atlas/04-filled-examples/companies/cloudflare.md` — HoQ axes: edge latency × PoP density, cost per request × plan tier.
- `9-stacks-atlas/04-filled-examples/companies/discord.md` — HoQ axes: message throughput × shard count, tail latency × hot-partition rate.
- `9-stacks-atlas/04-filled-examples/companies/dropbox.md` — HoQ axes: sync latency × file size distribution, storage cost × compression ratio.
- `9-stacks-atlas/04-filled-examples/companies/etsy.md` — HoQ axes: long-tail search recall × catalog size, page latency × monolith vs. service boundary.
- `9-stacks-atlas/04-filled-examples/companies/linkedin.md` — HoQ axes: graph query latency × degree distribution, stream-processing lag × topic partition count.
- `9-stacks-atlas/04-filled-examples/companies/netflix.md` — HoQ axes: stream-start latency × CDN PoP, regional failover RTO × replication strategy.
- `9-stacks-atlas/04-filled-examples/companies/shopify.md` — HoQ axes: BFCM peak RPS × tenant-isolation model, checkout latency × payment-gateway fan-out.
- `9-stacks-atlas/04-filled-examples/companies/stripe.md` — HoQ axes: idempotency correctness × retry depth, API-version compat × breaking-change cadence.
- `9-stacks-atlas/04-filled-examples/companies/uber.md` — HoQ axes: dispatch latency × geographic density, multi-active-DC RPO × cross-region WAN cost.

## Usage pattern (KB-6 HoQ cell population)

For a HoQ row (functional requirement) × column (technical solution):
1. Identify the Selva pattern (per `05-crawley/ch16-selva-patterns.md`).
2. Filter atlas entries matching the FR's scale band + pattern.
3. Extract the numeric column (latency, throughput, cost, availability) for the solution.
4. Populate the HoQ cell with numeric value + band + citation.
5. For roof correlations (solution × solution), use atlas entries that ship BOTH solutions to justify synergy/interference ratings.

## Per-entry schema

Per v1 §6.3:
- DAU/MAU banded, stack slots, infra + region, cost band, scaling inflections, citations.

## Gate R2 alignment

The same ≥7-entry threshold and `provisional: true` metadata (per §11 R2) applies to HoQ quantitative cells. At N=11, HoQ emits non-provisional numerics for well-represented slots (data layer, cache, compute) and provisional numerics for sparse slots (vector store, observability).
