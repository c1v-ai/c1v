---
slug: discord
name: Discord
kind: private_consumer
hq: San Francisco, California
website: https://discord.com
last_verified: 2026-04-23
verification_status: partial
reviewer: curator@c1v-kb8-atlas
data_quality_grade: Q1
primary_source:
  tier: B_official_blog
  source_url: https://discord.com/blog/tracing-discords-elixir-systems-without-melting-everything
  anchor: "Tracing Elixir Systems — Senior SWE IC byline, sub-ms latency anchors"
scale:
  metric: daily_active_users
  value: 90000000
  as_of: "2025-Q4"
  citation:
    kb_source: discord
    source_url: https://discord.com/company
    source_tier: B_official_blog
    publish_date: "2025-12-31"
    retrieved_at: 2026-04-23T23:40:00Z
    sha256: 32ad3dc1ece0c6a926d289867ac3b022cd202eaaad1959ce8a6f0dc117e80513
    anchor: "§Hero section — 90M+ people use Discord every day"
    corroborated_by: []
dau_band: 10m_100m
revenue_usd_annual: null
infra_cost_usd_annual: null
cost_band: undisclosed
headcount_est: null
economics_citations: []
frontend:
  web: [react, typescript, electron]
  mobile: [swift, swiftui, kotlin, jetpack_compose]
  desktop: [electron, native_desktop_arch]
backend:
  primary_langs: [elixir, rust, python, go]
  frameworks: [otp, genserver, phoenix]
  runtimes: [beam_vm, cpython]
data:
  oltp: [scylladb, cassandra]
  cache: [redis]
  warehouse: [bigquery]
  search: [elasticsearch_eck_40_clusters]
  queue: [gcp_pubsub]
infra:
  cloud: [gcp]
  compute: [kubernetes, self_operated_gpu_fleet]
  cdn: [cloudflare]
  observability: [opentelemetry_erlang, custom_xray_ml_observability]
ai_stack:
  training_framework: [ray, kuberay, dagster, pytorch]
  serving: [internal_inference_on_k8s]
  evals: [xray_observability_for_ml_pipelines]
  fine_tune: [sharded_neural_networks_training_pattern]
  rag: []
gpu_exposure: owns_cluster
inference_pattern: batch
latency_priors:
  - anchor: elixir_message_dispatch_mean_ms
    description: "Discord's Elixir/BEAM API-service message dispatch latency (mean). Canonical sub-ms backend routing anchor from OpenTelemetry-instrumented production traces."
    citation:
      kb_source: discord
      source_url: https://discord.com/blog/tracing-discords-elixir-systems-without-melting-everything
      source_tier: B_official_blog
      publish_date: 2026-03-04
      retrieved_at: 2026-04-23T23:45:00Z
      sha256: 68dc9fabbc440ab2660470e11c60aecb6ef52b6e6f1bdae7ddd76b8034f17aee
      anchor: "§Latency measurements — 1.69 ms message dispatch"
      is_ic: true
      corroborated_by: []
    confidence: 0.9
    verification_status: verified
    result_kind: scalar
    value: 1.69
    units: ms
    percentile: mean
  - anchor: elixir_guild_fanout_mean_us
    description: "Discord's Elixir/BEAM per-guild fanout latency (mean). Sub-millisecond processes-per-guild routing."
    citation:
      kb_source: discord
      source_url: https://discord.com/blog/tracing-discords-elixir-systems-without-melting-everything
      source_tier: B_official_blog
      publish_date: 2026-03-04
      retrieved_at: 2026-04-23T23:45:00Z
      sha256: 68dc9fabbc440ab2660470e11c60aecb6ef52b6e6f1bdae7ddd76b8034f17aee
      anchor: "§Latency measurements — 357 microseconds guild fanout"
      is_ic: true
      corroborated_by: []
    confidence: 0.9
    verification_status: verified
    result_kind: scalar
    value: 357
    units: us
    percentile: mean
  - anchor: message_index_search_p50_ms
    description: "Message-search query latency at p50 on Discord's Elasticsearch 40-cluster deployment post the 2024-2025 migration. Pre-migration p50 was ~500ms; current p50 is sub-100ms."
    citation:
      kb_source: discord
      source_url: https://discord.com/blog/how-discord-indexes-trillions-of-messages
      source_tier: B_official_blog
      publish_date: 2025-04-24
      retrieved_at: 2026-04-23T23:42:00Z
      sha256: 3c8b85acab1b5dcbfd0236a2df2e26d690536999e84cf5f6e795ebb96421160c
      anchor: "§Results — p50 latency from 500ms to sub-100ms on trillions of messages"
      is_ic: true
      corroborated_by: []
    confidence: 0.8
    verification_status: partial
    result_kind: scalar
    value: 100
    units: ms
    percentile: p50
  - anchor: message_index_search_p99_ms
    description: "Message-search query latency at p99 on Discord's Elasticsearch 40-cluster deployment. Pre-migration p99 was ~1s; current p99 is sub-500ms. Treated as upper-bound floor (post states 'sub-500ms' without exact value)."
    citation:
      kb_source: discord
      source_url: https://discord.com/blog/how-discord-indexes-trillions-of-messages
      source_tier: B_official_blog
      publish_date: 2025-04-24
      retrieved_at: 2026-04-23T23:42:00Z
      sha256: 3c8b85acab1b5dcbfd0236a2df2e26d690536999e84cf5f6e795ebb96421160c
      anchor: "§Results — p99 latency from 1s to sub-500ms"
      is_ic: true
      corroborated_by: []
    confidence: 0.8
    verification_status: partial
    result_kind: scalar
    value: 500
    units: ms
    percentile: p99
availability_priors: []
throughput_priors: []
cost_curves: []
utility_weight_hints:
  latency: 0.30
  cost: 0.10
  quality_bench: 0.10
  availability: 0.25
  safety: 0.10
  developer_velocity: 0.10
  security_compliance: 0.05
archetype_tags: [elixir-beam-actor-platform]
related_refs: []
nda_clean: true
ingest_script_version: "2.1.0"
---

# Discord

Private (not publicly traded) consumer/chat platform. Founded 2015, ~90M+ DAU as of Q4 2025, gaming-heavy user base (90%+ of activity per company.md). CEO transition spring 2025 (Sakhnini). Pre-IPO — no 10-K, no S-1 yet. **Revenue, operating margin, capex, and headcount are not publicly disclosed** at any tier-A/B source in the fetched corpus.

## 1. Scale & economics

- DAU: **90M+** (Q4 2025, tier-B corporate page citation). `daily_active_users` enum fit is clean; `dau_band: 10m_100m` chosen conservatively since Discord's own framing is "90M+" (lower bound). If the real figure is ≥100M, `over_100m` would be the right band; the corpus doesn't force the call.
- Gaming usage share: 90%+ of user activity (corporate page).
- Revenue / gross margin / operating margin / capex / headcount: **NOT DISCLOSED** at tier A/B. `revenue_usd_annual: null`, `infra_cost_usd_annual: null`, `headcount_est: null`, `cost_band: undisclosed`.

Discord has not filed an S-1. Economics unknowable from the current source set.

## 2. Frontend stack

- **Web**: React + TypeScript.
- **Desktop**: Electron + native desktop architecture layer. The 2024-12-13 "64-bit upgrade" post (Christopher Harris, Senior SWE on Desktop Arch, is_ic=true) documents a migration of millions of users from 32-bit to 64-bit desktop builds with zero downtime via staged rollouts.
- **Mobile**: native Swift + SwiftUI (iOS), Kotlin + Jetpack Compose (Android).

## 3. Backend stack

Discord's defining architectural choice is **Elixir on the BEAM VM** for the realtime message-routing core.

- **Each guild (server) runs as an independent Elixir process** with message-passing.
- **Sessions** are separate Elixir processes forwarding user actions to clients.
- **Distributed Erlang** for cross-node communication via message passing.
- The 2026-03-04 "Tracing Elixir Systems" post (Nick Krichevsky, Senior SWE, is_ic=true) instruments the production BEAM cluster with OpenTelemetry and a custom "Transport" library for trace context propagation. Head sampling with dynamic adjustment based on fanout size.

Beyond Elixir: Rust services for performance-critical non-BEAM paths (notably inside the message-search stack per the Elasticsearch post), Python for ML tooling (Ray/Dagster), Go for some internal infrastructure.

## 4. AI stack (ads + quests ML)

Discord runs internal ML pipelines, not frontier model training. From the 2025-10-09 "From Single Node to Multi-GPU Clusters" post (Aguirregaray/Jenkins, is_ic=true):

- **Ray + KubeRay** for distributed training on Kubernetes.
- **Dagster** for ML pipeline orchestration.
- **Custom X-Ray observability** for ML pipeline introspection (not AWS X-Ray; Discord's internal tool).
- **Training patterns**: sharded neural networks; migration off XGBoost to neural networks for ads ranking.
- **Business metrics cited**: ads ranking daily retraining drove +200% business-metric gain; Quests coverage went from 40% → "nearly 100%" post-infrastructure-upgrade.
- **GPU fleet**: self-hosted on Kubernetes. `gpu_exposure: owns_cluster`.
- **Serving path**: NEEDS_RESEARCH — training is well-documented but inference serving architecture isn't explicit in the fetched corpus.

`inference_pattern: batch` (daily retraining cadence; serving not cited).

## 5. Data & storage

- **OLTP**: ScyllaDB (the now-canonical Discord move away from Cassandra, documented in multiple earlier posts). Cassandra remains for some workloads during migration.
- **Cache**: Redis.
- **Search**: **40 Elasticsearch clusters** with thousands of indices, ECK (Elastic Cloud on Kubernetes) operator. Sharding by guild_id and user_id; shard target ~200M messages / ~50GB. Runs alongside Rust-based indexer services.
- **Queue**: GCP Pub/Sub for the indexing ingestion pipeline.
- **Warehouse**: BigQuery (GCP-native).

## 6. Infrastructure

- **Cloud**: Google Cloud Platform. Heavy GCP primitives (Pub/Sub, BigQuery, GKE).
- **Compute**: Kubernetes everywhere; GKE for general workloads, self-operated GPU fleet nodes for ML.
- **CDN**: Cloudflare.
- **Observability**: OpenTelemetry (Erlang/Elixir distribution) + X-Ray ML-pipeline observability.

## 7. Math priors commentary

Four §6.3-compliant latency priors emitted, all tier B + is_ic=true:

1. `elixir_message_dispatch_mean_ms = 1.69` — canonical sub-ms backend-routing latency for a chat platform. Rare precision.
2. `elixir_guild_fanout_mean_us = 357` (microseconds) — per-guild process fanout latency. Pairs with #1 for composable chat-backend hop cost.
3. `message_index_search_p50_ms = 100` — search query p50 post-Elasticsearch-migration. Treated as "sub-100ms" upper bound since the post didn't give an exact number (partial verification).
4. `message_index_search_p99_ms = 500` — search query p99 upper bound (sub-500ms). Partial verification same reason.

**Not emitted**:
- Throughput: "trillions of messages indexed," "10k+ sessions per guild," "2× indexing throughput improvement" — all throughput-shape numbers. `throughputPriorSchema.units` is currently rate-only (rps/rpm/rph/qps); task #36 is in_progress to add data-rate units (e.g., messages/day, MB/s). When #36 lands, these promote to throughput_priors.
- Availability: not disclosed. Discord has a status page (status.discord.com) but no numeric SLA in fetched sources.
- Cost curves: none disclosed. Discord Nitro pricing exists publicly but wasn't in the fetched corpus.

## 8. Migrations & turning points

- **Elixir-first from day one** — Discord built on Elixir/Erlang from launch (2015), one of the largest production Elixir deployments in the world. Defining architectural decision.
- **Scylla migration (early 2020s)** — moved primary OLTP from Cassandra to ScyllaDB for latency + operational reasons. Documented in earlier Discord blog posts (not in this fetched corpus).
- **Elasticsearch migration (2024-2025)** — full index rebuild onto ECK (Elastic Cloud on Kubernetes), 40 clusters, Rust-based indexer, shard target 200M msgs / 50GB. Took message-search p50 from ~500ms to sub-100ms and p99 from ~1s to sub-500ms.
- **64-bit desktop upgrade (2024)** — migrated millions of Electron-desktop users from 32-bit to 64-bit with zero forced reinstalls.
- **Multi-GPU ML infrastructure (2025)** — from single-node Ray to multi-GPU KubeRay on K8s; ads ranking moved off XGBoost onto sharded neural networks.
- **CEO transition (Spring 2025)** — Sakhnini (from Activision) replaced Citron as CEO; company positioning shifting toward IPO-readiness.

## 9. Sources

1. **company.md / corporate page** — tier `B_official_blog` — https://discord.com/company — `publish_date: 2025-12-31` (corporate page is a living doc; treated as current-year end-dated for the 90M+ DAU claim per scraper-note; no exact publish date is on-page) — sha256 `32ad3dc1ece0c6a926d289867ac3b022cd202eaaad1959ce8a6f0dc117e80513`. Source for DAU 90M+, gaming-usage-90pct, founding date, CEO transition.
2. **"How Discord Indexes Trillions of Messages"** — tier `B_official_blog`, IC-authored (Vicki Niu, Senior SWE) — https://discord.com/blog/how-discord-indexes-trillions-of-messages — published 2025-04-24 — sha256 `3c8b85acab1b5dcbfd0236a2df2e26d690536999e84cf5f6e795ebb96421160c`. Source for 40 Elasticsearch clusters, p50 sub-100ms, p99 sub-500ms, trillions of messages indexed.
3. **"Tracing Discord's Elixir Systems (Without Melting Everything)"** — tier `B_official_blog`, IC-authored (Nick Krichevsky, Senior SWE) — https://discord.com/blog/tracing-discords-elixir-systems-without-melting-everything — published 2026-03-04 — sha256 `68dc9fabbc440ab2660470e11c60aecb6ef52b6e6f1bdae7ddd76b8034f17aee`. Source for 1.69ms dispatch + 357μs guild fanout latency priors.
4. **"From Single Node to Multi-GPU Clusters"** — tier `B_official_blog`, IC-authored (Aguirregaray/Jenkins) — https://discord.com/blog/from-single-node-to-multi-gpu-clusters-how-discord-made-distributed-compute-easy-for-ml-engineers — published 2025-10-09 — sha256 `36754cbee2196ebed6ab77c24e996327cbc2d60f33e9f2b7463c461c35936b80`. Source for AI stack (Ray/KubeRay/Dagster/X-Ray) + `gpu_exposure: owns_cluster`.
5. **"Discord's 64-bit Upgrade"** — tier `B_official_blog`, IC-authored (Christopher Harris, Senior SWE Desktop Arch) — https://discord.com/blog/how-discord-seamlessly-upgraded-millions-of-users-to-64-bit-architecture — published 2024-12-13 — sha256 `686b3364cbc0f64105375912e7b7d34598ddd9f619bd48078b86ad58c01d18b1`. Frontend/desktop narrative source; no prior anchors extracted.

## Curator notes

- **`data_quality_grade: Q1`** — promoted from Q2 on 2026-04-23 after schema_v 1.1.0 landed (#37 `private_consumer` kind + #34 `elixir-beam-actor-platform` archetype). Both flagged Q2-blockers are resolved. 4 latency priors all tier B + is_ic, 2 verified / 2 partial (p50/p99 are "sub-X" upper bounds, honest not Zod-rejected). Scale cites tier-B company page — the REQUIRED tier for `private_consumer` per schema 1.1.0 refinement. Zod-clean, zero NEEDS_RESEARCH on mandatory fields, within 18mo staleness gate. The remaining partial-verification on 2 of the 4 priors is from the indexing post's phrasing ("sub-100ms", "sub-500ms") rather than staleness — not a Q-grade blocker.
- **`kind: private_consumer`** — updated 2026-04-23 post schema_v 1.1.0 (task #37 landed). The original extraction used `frontier_ai_private` as the least-wrong fit; `private_consumer` is the correct semantic kind for Discord (private consumer/chat platform with internal ML infra, not an AI frontier lab). Per schema 1.1.0 refinement: `scale.citation.source_tier = B_official_blog` ✓ (discord.com/company), `economics_citations` forbids `A_sec_filing` ✓ (empty array), `ai_stack` + `utility_weight_hints` are optional-but-provided.
- **`scale.metric: daily_active_users = 90_000_000`** — "90M+" from corporate page. `dau_band: 10m_100m` chosen conservatively since the claim is a lower bound; `over_100m` would be defensible if we had a more specific number.
- **`archetype_tags: [elixir-beam-actor-platform]`** — updated 2026-04-23 post schema_v 1.1.0 (task #34 landed). Discord's Elixir/BEAM process-per-entity architecture (each guild = independent Elixir process via message passing, distributed Erlang across nodes) is the reference case for the new archetype value.
- **`ai_stack` populated genuinely** — Ray/KubeRay/Dagster/X-Ray is Discord's real ML infrastructure, not an aspiration. `training_framework` includes pytorch (inferred from Ray+neural-nets stack; not explicit in fetched sources).
- **`utility_weight_hints` sum to 1.00** — platform-reliability weighting (latency 0.30, availability 0.25 dominate), reflecting Discord's realtime-chat UX imperative.
- **`inference_pattern: batch`** — ML retraining cadence is daily (per Aguirregaray post); serving architecture not disclosed. Could be `streaming` if real-time inference runs, but the corpus doesn't confirm.
- **No throughput priors** pending task #36 data-rate units. 2× indexing throughput improvement + "trillions of messages" + "10k+ sessions/guild" all encode once `messages_per_day` or similar units land.
- **No availability priors** — Discord runs a status page but doesn't publish a uniform SLA in fetched sources. Could revisit when scraper's supplementary fetch catches the right post.
- **No cost_curves** — Discord Nitro pricing is public (discord.com/nitro) but wasn't in the fetched corpus. If scraper re-visits, this is a promotable anchor.
- All 5 SHAs verified against `_sources/` bytes this turn.
