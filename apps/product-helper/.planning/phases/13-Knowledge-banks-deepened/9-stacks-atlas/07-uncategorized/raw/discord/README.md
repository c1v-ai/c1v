---
company: discord
kind_hint: frontier_ai_private
has_10k: false
private_company: true
ownership_note: "Discord Inc. is a private company (not publicly traded). No 10-K, no S-1 yet. Revenue / capex / operating margin NOT sourceable at tier A. Scale bands from the company.md corporate page are tier-B narrative; priors strict tier B/E-IC/G per architect's rev-2 rule."
fetched_at: "2026-04-23T23:40:00Z"
scraper_version: "v2.1-per-url"
files:
  - path: "company.md"
    original: "_sources/company.html"
    source_url: "https://discord.com/company"
    tier: B_official_blog
    sha256: "32ad3dc1ece0c6a926d289867ac3b022cd202eaaad1959ce8a6f0dc117e80513"
    bytes: 106075
    publish_date: null
    author: "Discord Inc. (corporate page)"
    is_ic: false
    filing_type: "corporate_page"
    extracted_claims: [dau_90M_plus_q4_2025, gaming_usage_90pct_plus, founding_date_2015, founders_citron_vishnevskiy, ceo_transition_spring_2025_sakhnini]
  - path: "how-discord-indexes-trillions-of-messages.md"
    original: "_sources/how-discord-indexes-trillions-of-messages.html"
    source_url: "https://discord.com/blog/how-discord-indexes-trillions-of-messages"
    tier: B_official_blog
    sha256: "3c8b85acab1b5dcbfd0236a2df2e26d690536999e84cf5f6e795ebb96421160c"
    bytes: 240328
    publish_date: "2025-04-24"
    author: "Vicki Niu (Senior Software Engineer, Persistence Infrastructure)"
    is_ic: true
    filing_type: "blog"
    extracted_claims: [trillions_messages_indexed, elasticsearch_40_clusters_thousands_indices, p50_latency_sub_100ms_from_500ms, p99_latency_sub_500ms_from_1s, indexing_throughput_2x_improvement, shard_target_200M_msgs_50GB, stack_elasticsearch_eck_gcp_pubsub_rust_k8s, sharding_by_guild_id_and_user_id]
  - path: "multi-gpu-clusters-ml-engineers.md"
    original: "_sources/multi-gpu-clusters-ml-engineers.html"
    source_url: "https://discord.com/blog/from-single-node-to-multi-gpu-clusters-how-discord-made-distributed-compute-easy-for-ml-engineers"
    tier: B_official_blog
    sha256: "36754cbee2196ebed6ab77c24e996327cbc2d60f33e9f2b7463c461c35936b80"
    bytes: 227408
    publish_date: "2025-10-09"
    author: "Serrana Aguirregaray, Nathaniel Jenkins"
    is_ic: true
    filing_type: "blog"
    extracted_claims: [ai_stack_ray_kuberay_dagster_xray, gpu_exposure_owns_cluster_on_k8s, ads_ranking_daily_retraining_200pct_business_metric_gain, quests_coverage_40_to_nearly_100pct, training_pattern_sharded_neural_networks, migration_off_xgboost_to_neural_networks]
  - path: "64-bit-upgrade.md"
    original: "_sources/64-bit-upgrade.html"
    source_url: "https://discord.com/blog/how-discord-seamlessly-upgraded-millions-of-users-to-64-bit-architecture"
    tier: B_official_blog
    sha256: "686b3364cbc0f64105375912e7b7d34598ddd9f619bd48078b86ad58c01d18b1"
    bytes: 228752
    publish_date: "2024-12-13"
    author: "Christopher Harris (Senior Software Engineer on Desktop Arch)"
    is_ic: true
    filing_type: "blog"
    extracted_claims: [migration_64bit_100pct_coverage_windows, desktop_client_cpp_rust_stack, updater_infrastructure_millions_updates, abi_alignment_challenge]
  - path: "tracing-elixir-systems.md"
    original: "_sources/tracing-elixir-systems.html"
    source_url: "https://discord.com/blog/tracing-discords-elixir-systems-without-melting-everything"
    tier: B_official_blog
    sha256: "68dc9fabbc440ab2660470e11c60aecb6ef52b6e6f1bdae7ddd76b8034f17aee"
    bytes: 251815
    publish_date: "2026-03-04"
    author: "Nick Krichevsky (Senior Software Engineer)"
    is_ic: true
    filing_type: "blog"
    extracted_claims: [backend_elixir_erlang_beam_vm, guild_process_per_entity_model, message_dispatch_latency_1_69ms_api, guild_fanout_357us, cpu_reduction_55_to_45pct_sessions, sampling_rates_100pct_to_0_1pct_fanout, opentelemetry_erlang_elixir_tracing, custom_transport_library_grpc_headers]
notes: |
  Private company (Discord Inc., not publicly traded). No 10-K; no S-1 exists yet.

  **Economics gap**: Revenue, capex, opex, operating margin NOT sourceable at tier A. Dual-C press
  (Bloomberg/The Information) is acceptable for scale_bands ONLY, per team-lead instruction. For priors
  per architect rev-2 rule: strict B/E-IC/G only, no dual-C. This corpus has 0 press cites; all 5 sources
  are tier B, 4 of 5 are IC-authored Senior SWE posts. Clean priors eligibility.

  **Scale anchor**: DAU **"90M+"** (company.md, Q4 2025, tier B, no byline → is_ic=false).
  scaleMetricSchema has `daily_active_users` — clean enum fit. dau_band = `over_100m` (generous) or
  `10m_100m` (conservative, if 90M literally under 100M threshold). Curator call.

  **Archetype challenge (flag for #34 multi-archetype work)**:
  Discord is genuinely hybrid:
  - Backend: Elixir/BEAM actor model (no enum match — closest `go-microservices-at-scale` semantically)
  - Search: Elasticsearch/Kubernetes/Rust (close to `go-microservices-at-scale`)
  - ML/AI: Ray/KubeRay/Dagster for internal ads ranking (partial `ai-training-gpu-fleet` + `python-data-heavy`)
  - Desktop: C++/Rust client (no archetype needed — client-side)

  Recommend when #34 multi-tag archetype lands: ["go-microservices-at-scale", "python-data-heavy"]
  as primary, with a NEEDS_ARCHETYPE_ADD note for "elixir-beam-actor-platform" as a future enum value
  (same case cloudflare made for globally-distributed-edge-network).

  **Freshness profile**:
  - tracing-elixir-systems: 2026-03-04 (FRESH — 50 days at retrieval)
  - multi-gpu-clusters: 2025-10-09 (fresh)
  - how-discord-indexes-trillions: 2025-04-24 (just inside 18mo)
  - 64-bit-upgrade: 2024-12-13 (16mo, just inside window)
  - company: null (living corporate page — not dated, noted in §3.2 convention)

  **is_ic profile**: 4 of 5 is_ic=true (all blog posts have Senior SWE bylines). company.html is the only
  is_ic=false source. Strong IC coverage.

  **Priors coverage summary**:
  - latency_prior: STRONG — p50 <100ms + p99 <500ms (indexing), 1.69ms message dispatch, 357μs fanout
  - Backend stack (Elixir/BEAM): STRONG, tier B + is_ic, fresh 2026
  - AI stack (Ray/KubeRay): MODERATE, tier B + is_ic, fresh 2025-10
  - cost_curve / availability / economics: MISSING (private company, no tier-A)
  - scale.metric: DAU 90M+ usable via `daily_active_users` enum value

  Audit log: 5 discord entries, all status:ok.
