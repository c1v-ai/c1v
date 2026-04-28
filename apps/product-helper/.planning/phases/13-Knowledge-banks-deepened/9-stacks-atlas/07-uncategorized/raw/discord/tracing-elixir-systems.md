---
source_url: "https://discord.com/blog/tracing-discords-elixir-systems-without-melting-everything"
retrieved_at: "2026-04-23T23:42:00Z"
publish_date: "2026-03-04"
source_tier: "B_official_blog"
sha256: "68dc9fabbc440ab2660470e11c60aecb6ef52b6e6f1bdae7ddd76b8034f17aee"
bytes: 251815
filing_type: "blog"
author: "Nick Krichevsky (Senior Software Engineer)"
is_ic: true
---

# Tracing Discord's Elixir Systems (Without Melting Everything)

Raw bytes at `_sources/tracing-elixir-systems.html`. Content extracted via WebFetch 2026-04-23. Senior SWE byline — **is_ic=true**. Fresh (published 2026-03-04, 50 days before retrieval).

## Architectural claims (backend anchor — Discord runs on Elixir/Erlang)

- Each Discord **guild** (server) runs as an independent Elixir process using message passing
- **Sessions** are separate Elixir processes that forward user actions to clients
- The system distributes programs across multiple nodes via message passing (distributed Erlang)
- Confirms the canonical Discord backend architecture: BEAM VM, Elixir, process-per-entity

## Latency anchors (tier B + is_ic, 2026 fresh)

| Metric | Value |
|---|---|
| **Message dispatch latency (API service)** | **1.69 ms** |
| **Guild fanout latency** | **357 microseconds** |
| Session connection delays (degraded scenario) | up to 16 minutes observed |
| CPU reduction post-optimization (sessions) | 55% → 45% |
| Initial CPU impact from span capture in fanout | +10 percentage points |

## Tracing stack

- OpenTelemetry's Erlang/Elixir library for instrumentation
- Custom "Transport" library for propagating trace context between Elixir services
- Head sampling with dynamic adjustment based on fanout size
- Sampling preservation: **100% (single recipient) → 10% (100 sessions) → 0.1% (10k+ sessions)**
- gRPC headers for API-to-Elixir context propagation

## Interpretation for priors

- **latency_prior (golden)**: 1.69ms message dispatch + 357μs guild fanout are canonical sub-ms tier-B+is_ic anchors for "chat backend message routing." Rare resolution — the kind of numbers no other company publishes this precisely.
- **Stack anchor (strong)**: Elixir/Erlang/BEAM is Discord's defining runtime choice. Pair with the trillions-of-messages post for the full backend story (Elixir message routing → Elasticsearch for search indexing).
- **Throughput prior (schema gap #31)**: Sampling rates indicate 10k+ sessions/guild handled; implies very high fanout throughput. Not expressible in current schema — flag for throughputPriorSchema work (task #36).
- **Archetype hint**: `scala-jvm-platform` is WRONG (that's JVM); Discord's Elixir/BEAM runtime has no direct archetype enum fit. Closest: `go-microservices-at-scale` as a "concurrency-primitives-first backend" archetype. Flag NEEDS_ARCHETYPE_ADD for `elixir-beam-actor-platform` or similar.

## Staleness

Published 2026-03-04 — extremely fresh (50 days). Canonical anchor for Discord backend in this corpus.