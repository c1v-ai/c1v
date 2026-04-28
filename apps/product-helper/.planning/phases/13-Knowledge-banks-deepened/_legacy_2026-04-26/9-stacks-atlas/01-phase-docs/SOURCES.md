# SOURCES — Citation ledger for KB-8 Stacks & Priors Atlas

> **Ownership**: `SOURCES.md` is **architect's** deliverable (team-lead ruling, 2026-04-21). The content below is a curator placeholder pending architect's authoritative version. Curator appends citation rows as companies are extracted; tier taxonomy is fixed per plan §6.3 and should survive architect's rewrite.

Curator appends one row per citation used in `companies/{slug}.md` frontmatter priors.
Rows are never deleted; citations that are later invalidated get `status: superseded` with a pointer to the replacement row.

## Source tier — one scale (plan §6.3), applied at every granularity

One source-tier enum, A–H, used identically at every level:

- **Per-citation**: each row in the Citation table below has `tier` ∈ {A, B, C, D, E, F, G, H}
- **Per-prior** (inside each entry's frontmatter): `cost_curves[i].source_tier`, `latency_priors[i].source_tier`, `availability_priors[i].source_tier` — same A–H enum, Zod rejects C/D
- **Per-entry** (entry frontmatter summary): `primary_source.tier` = the **strongest tier** among the entry's citations, same A–H enum

`data_quality_grade` ∈ {Q1, Q2, Q3} is a separate, orthogonal axis — entry completeness/corroboration. Not in Zod; see `README.md`. It is **not** a second tier scale.

## Tier taxonomy (plan §6.3, binding)

| Code | Source | Use |
|---|---|---|
| `A_sec_filing` | 10-K, 10-Q, S-1, proxy, IR deck | Quant only, highest trust |
| `B_official_blog` | Company eng blog or official research | Top-tier for AI-private |
| `C_press_analyst` | FT, The Information, Bloomberg, Pragmatic Engineer, Gartner, SemiAnalysis | Quant when A/B silent; AI-private quant requires dual-C |
| `D_stackshare` | Community-reported | Never sole; corroborate with B/E/F |
| `E_conference` | QCon / Strange Loop / KubeCon / NeurIPS | B-equivalent only when `is_ic=true` |
| `F_github` | Public repo configs | Proves stack usage; silent on scale |
| `G_model_card` | Model card, system card, safety report | B-equivalent for AI-private quant (context window, latency, pricing) |
| `H_social_flagged` | Verified-employee X post or ≥50-corroboration Reddit | Never sole; always flagged |

**Prior restriction**: `cost_curves`, `latency_priors`, `availability_priors` accept only A/B/E(IC)/G. Tier C or D on a math prior is a Zod-refinement rejection.

## Citation table

| slug | anchor | tier | url | publish_date | retrieved_at | sha256 | status |
|---|---|---|---|---|---|---|---|
| shopify | 2025_10k_gmv_and_economics | A_sec_filing | https://www.sec.gov/Archives/edgar/data/1594805/000159480526000007/shop-20251231.htm | 2026-02-11 | 2026-04-22T00:07:00Z | 57f18fb1f3e3eda7342861d765a61a01d262c4e8ba6593fe1c7d51d6ebc6e983 | active |
| shopify | bfcm_readiness_2025 | B_official_blog | https://shopify.engineering/bfcm-readiness-2025 | 2025-11-20 | 2026-04-22T00:08:00Z | f218cd69eae9a800e502fa29ce6ad56f115d38d9a9ee0655aecf55127161f2c4 | active |
| shopify | ml_at_shopify | B_official_blog | https://shopify.engineering/machine-learning-at-shopify | 2025-07-04 | 2026-04-22T00:10:00Z | 5d349d6e53ca845fde482863bb5b5d5dfc2a89193c5f0583694c16777ec89d7f | active |
| shopify | product_search_rankflow | B_official_blog | https://shopify.engineering/world-class-product-search | 2025-11-12 | 2026-04-22 | ecdb9b82f08e941ac875292bd03263b383eab67b00db1d70ee8a55bb2774c206 | active |
| anthropic | revenue_run_rate_30b_2026 | B_official_blog | https://www.anthropic.com/news/expanding-compute-with-google-and-broadcom | 2026-04-06 | 2026-04-22 | 632942ffb094fb5458020d128cd9bdf26f263d46a6474d84e4559c44066de43a | active |
| anthropic | api_usd_per_1m_tokens_opus_4_7 | B_official_blog | https://www.anthropic.com/news/claude-opus-4-7 | 2026-04-16 | 2026-04-22 | bde8ac0e48096153eb28bb8d5f542f4fb020f2fdb3e2ee6d87d9fba96318405e | active |
| anthropic | claude_opus_4_7_system_card | G_model_card | https://www-cdn.anthropic.com/claude-opus-4-7-system-card.pdf | 2026-04-16 | 2026-04-22 | a7729a0e5eb61dc6818f553ae3c27ab774411cd5ab4ed7f414456d74a05c26d2 | active |
| etsy | 2025_10k_gms_and_economics | A_sec_filing | https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001370637&type=10-K&dateb=&owner=include&count=40 | 2026-02-01 | 2026-04-23 | d620fe4a794113bb56b8f3b5c4d34ddbd4f64b70f7da864610bb7a539ff67f06 | sha_bundle_not_url |
| dropbox | 2025_10k_paying_users_revenue | A_sec_filing | https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001467623&type=10-K | 2026-02-19 | 2026-04-23 | c07fe573a9f31de0b3ba37c69d142b2ce10d1c0abebbd9aa368045f44621b625 | sha_bundle_not_url |
| dropbox | dash_feature_serving_p95_ms | B_official_blog | https://dropbox.tech/machine-learning/dash-feature-store-python-to-go | 2025-06-01 | 2026-04-23 | c07fe573a9f31de0b3ba37c69d142b2ce10d1c0abebbd9aa368045f44621b625 | sha_bundle_not_url |
| dropbox | dynovault_client_side_ms | B_official_blog | https://dropbox.tech/infrastructure/dynovault-online-feature-store | 2025-04-01 | 2026-04-23 | c07fe573a9f31de0b3ba37c69d142b2ce10d1c0abebbd9aa368045f44621b625 | sha_bundle_not_url |
| dropbox | magic_pocket_availability_annual | E_conference | https://qconsf.com/presentation/oct2022/magic-pocket-dropboxs-exabyte-scale-blob-storage-system | 2022-10-24 | 2026-04-23 | c07fe573a9f31de0b3ba37c69d142b2ce10d1c0abebbd9aa368045f44621b625 | sha_bundle_not_url |
| dropbox | edgestore_availability_annual | B_official_blog | https://dropbox.tech/infrastructure/reintroducing-edgestore | 2024-09-01 | 2026-04-23 | c07fe573a9f31de0b3ba37c69d142b2ce10d1c0abebbd9aa368045f44621b625 | sha_bundle_not_url |
| uber | 2025_10k_mapcs_revenue | A_sec_filing | https://www.sec.gov/Archives/edgar/data/0001543151/000154315126000015/uber-20251231.htm | 2026-02-18 | 2026-04-23 | df7fecd54001eb38753b058e399bd6dd3501662bad3a37543d67e7170bca23a4 | sha_bundle_not_url |
| uber | fy2023_10k_cloud_commitment_2_7b | A_sec_filing | https://www.sec.gov/Archives/edgar/data/1543151/000154315124000012/uber-20231231.htm | 2024-02-15 | 2026-04-23 | df7fecd54001eb38753b058e399bd6dd3501662bad3a37543d67e7170bca23a4 | sha_bundle_not_url |
| uber | pinot_write_latency_ms | B_official_blog | https://www.uber.com/blog/pinot-for-low-latency/ | 2023-06-01 | 2026-04-23 | df7fecd54001eb38753b058e399bd6dd3501662bad3a37543d67e7170bca23a4 | sha_bundle_not_url |
| uber | cachefront_docstore_availability | B_official_blog | https://www.uber.com/blog/how-uber-serves-over-40-million-reads-per-second-using-an-integrated-cache/ | 2023-09-01 | 2026-04-23 | df7fecd54001eb38753b058e399bd6dd3501662bad3a37543d67e7170bca23a4 | sha_bundle_not_url |
| netflix | 2025_10k_economics | A_sec_filing | https://www.sec.gov/Archives/edgar/data/1065280/000106528026000034/nflx-20251231.htm | 2026-01-23 | 2026-04-22T00:00:30Z | 47f992a70276ea6a071fe82960de58bab9d1bb74b0ca8e0fbd09f03a25187603 | active |
| netflix | q4_2024_paying_subscribers | A_sec_filing | https://www.sec.gov/Archives/edgar/data/1065280/000106528025000033/ex991_q424.htm | 2025-01-21 | 2026-04-23T03:15:30Z | a54c8152622c02a33dd74b104cf0b3db305b2f962721144e44a462630d125158 | active |
| netflix | druid_caching_p95 | B_official_blog | https://netflixtechblog.com/stop-answering-the-same-question-twice-interval-aware-caching-for-druid-at-netflix-scale-22fadc9b840e | 2026-04-06 | 2026-04-22T00:02:20Z | c622cb05d9420590d9bac9b168ced55356058ac8da6da953642471245a164063 | active |
| netflix | mount_mayhem_container_scaling | B_official_blog | https://netflixtechblog.com/mount-mayhem-at-netflix-scaling-containers-on-modern-cpus-f3b09b68beac | 2025-11-07 | 2026-04-22T00:02:10Z | c88648ed68c2e1c1bfaac7cd9f2db26df2dcca60dd9acee62b77a9d9d6a551e5 | active |
| netflix | zuul_2_edge_gateway_architecture | B_official_blog | https://netflixtechblog.com/open-sourcing-zuul-2-82ea476cb2b3 | 2018-05-21 | 2026-04-22T00:02:00Z | 8ab49dbed981a2542c7090dcfce1322d0483705b05aa5c1d2f7789a425ec74e0 | stale_gt_18mo_architecture_anchor_only |
| cloudflare | 2025_10k_economics | A_sec_filing | https://www.sec.gov/Archives/edgar/data/1477333/000147733326000016/cloud-20251231.htm | 2026-02-26 | 2026-04-23T04:00:00Z | b2e19963a1e3df97eb84d21d1c65b49a660a9e7ebab3f3a052e101a46fae18a0 | active |
| cloudflare | birthday_week_2025_fl2_rust | B_official_blog | https://blog.cloudflare.com/birthday-week-2025-wrap-up/ | 2025-09-29 | 2026-04-23T04:05:00Z | f164fa55e51f3fd17815fbc3f610a3d6f1ebb0528a4a8aa80e7a6ae02c8a3ec5 | active |
| cloudflare | workers_for_platforms_v8_isolates | B_official_blog | https://blog.cloudflare.com/workers-for-platforms/ | 2022-05-10 | 2026-04-23T04:05:10Z | 4e611d0cc02fe94efab57a7647ed06e772feb024c5581fa529b25d7c18e4f73a | active |
| cloudflare | r2_ga_pricing | B_official_blog | https://blog.cloudflare.com/r2-ga/ | 2022-09-21 | 2026-04-23T04:05:20Z | 5c6ecf4a0ae3bbd2116bc0e2a0a0f828539216e35b9b96d90d52518541fda57d | active |
| cloudflare | workers_ai_ga_neurons_pricing | B_official_blog | https://blog.cloudflare.com/workers-ai/ | 2023-09-27 | 2026-04-23T04:05:30Z | 8281b032cbd2e04462f535b956ad424dc14383752e5e02b540fb321c5cc8de93 | active |
| linkedin | msft_10k_fy25_linkedin_revenue | A_sec_filing | https://www.sec.gov/Archives/edgar/data/789019/000095017025100235/msft-20250630.htm | 2025-07-30 | 2026-04-23T05:00:00Z | 99d693f6c1544144ebeee92954f151a85bc62111837530a42855953bc01d0bbe | active |
| linkedin | azure_linux_os_migration_member_count | B_official_blog | https://www.linkedin.com/blog/engineering/architecture/navigating-the-transition-adopting-azure-linux-as-linkedins-operatingsystem | 2024-08-19 | 2026-04-23T05:10:00Z | 3b7b2d2ec26edccbbf5c0101c13b411f2fc6d5a66821f5579debe4db5a8b4b8b | active_gt_18mo_warning |
| linkedin | job_ingestion_scale_2026 | B_official_blog | https://www.linkedin.com/blog/engineering/infrastructure/engineering-linkedins-job-ingestion-system-at-scale | 2026-01-29 | 2026-04-23T05:11:00Z | eb3bc004c77683400dfcf6e4801e5edba283d810a06cb9678345341a4c8c5325 | active |
| linkedin | identity_latency_cost_2020 | B_official_blog | https://www.linkedin.com/blog/engineering/optimization/reducing-latency-and-cost-for-identity-services | 2020-04-22 | 2026-04-23T05:12:00Z | 8f76ef4a5b4192142a2fbe53ae57527e8634de0c04a57c01df6a2fdfa3118a48 | stale_gt_18mo_canonical_identity_anchor_only |
| linkedin | genai_cognitive_memory_2026 | B_official_blog | https://www.linkedin.com/blog/engineering/ai/the-linkedin-generative-ai-application-tech-stack-personalization-with-cognitive-memory-agent | 2026-03-26 | 2026-04-23T05:13:00Z | 70765f47cb98efd592e623bebcfe7e1db55dc70ae5af29a3d3d6cbcb55c90227 | active |
| discord | company_page_dau | B_official_blog | https://discord.com/company | 2025-12-31 | 2026-04-23T23:40:00Z | 32ad3dc1ece0c6a926d289867ac3b022cd202eaaad1959ce8a6f0dc117e80513 | active_publish_date_inferred_from_dau_q4_2025_claim |
| discord | trillions_messages_indexed_p50_p99 | B_official_blog | https://discord.com/blog/how-discord-indexes-trillions-of-messages | 2025-04-24 | 2026-04-23T23:42:00Z | 3c8b85acab1b5dcbfd0236a2df2e26d690536999e84cf5f6e795ebb96421160c | active |
| discord | elixir_tracing_dispatch_fanout_latency | B_official_blog | https://discord.com/blog/tracing-discords-elixir-systems-without-melting-everything | 2026-03-04 | 2026-04-23T23:45:00Z | 68dc9fabbc440ab2660470e11c60aecb6ef52b6e6f1bdae7ddd76b8034f17aee | active |
| discord | multi_gpu_clusters_ml_engineers | B_official_blog | https://discord.com/blog/from-single-node-to-multi-gpu-clusters-how-discord-made-distributed-compute-easy-for-ml-engineers | 2025-10-09 | 2026-04-23T23:43:00Z | 36754cbee2196ebed6ab77c24e996327cbc2d60f33e9f2b7463c461c35936b80 | active |
| discord | 64_bit_desktop_upgrade | B_official_blog | https://discord.com/blog/how-discord-seamlessly-upgraded-millions-of-users-to-64-bit-architecture | 2024-12-13 | 2026-04-23T23:44:00Z | 686b3364cbc0f64105375912e7b7d34598ddd9f619bd48078b86ad58c01d18b1 | active |
| airbnb | 2025_10k_economics | A_sec_filing | https://www.sec.gov/Archives/edgar/data/1559720/000155972026000004/abnb-20251231.htm | 2026-02-12 | 2026-04-23T23:50:00Z | 61bac47250511a2263631ebd99e92b1d42caf305d27ba9d9fbfa7b11aa199c02 | active |
| airbnb | metrics_pipeline_100M_samples_per_sec | B_official_blog | https://medium.com/airbnb-engineering/building-a-high-volume-metrics-pipeline-with-opentelemetry-and-vmagent-c714d6910b45 | 2026-04-07 | 2026-04-23T23:52:00Z | 3f8e908f0ae01d16f573c80900269537d53d1f2529873fcfaae0426d773e85f2 | sha_captcha_wall_content_via_webfetch |
| airbnb | observability_ownership_migration | B_official_blog | https://medium.com/airbnb-engineering/from-vendors-to-vanguard-airbnbs-hard-won-lessons-in-observability-ownership-3811bf6c1ac3 | 2026-03-17 | 2026-04-23T23:51:00Z | 34f3075ef091be276752d4c15a606e3c25dd13fc9a2cbcd293dd27182a078b1c | sha_captcha_wall_content_via_webfetch |
| airbnb | destination_recommender_transformer | B_official_blog | https://medium.com/airbnb-engineering/recommending-travel-destinations-to-help-users-explore-5fa7a81654fb | 2026-03-12 | 2026-04-23T23:53:00Z | 35f4c47e26f6a75170f1b4d454f20b759c2c44b61d298e685056597158bde748 | sha_captcha_wall_content_via_webfetch |
| airbnb | himeji_authorization_privacy | B_official_blog | https://medium.com/airbnb-engineering/privacy-first-connections-himeji | 2026-03-01 | 2026-04-23T23:54:00Z | 73fba4e2af41a3c681a9fde1c991a9f60c6817ec707fe761b7d8a2a8ff79f2a8 | sha_captcha_wall_content_via_webfetch |
| stripe | annual_letter_2025_tpv_scale | B_official_blog | https://stripe.com/newsroom/news/stripe-2025-update | 2026-02-24 | 2026-04-24T00:11:00Z | a6075acf1935fa93194a1abd65b9cc9d2c0a5abab193b2e405042526c0b0f84b | sha_captcha_wall_content_via_webfetch |
| stripe | docdb_99_999_uptime_2024 | B_official_blog | https://stripe.com/blog/how-stripes-document-databases-supported-99.999-uptime-with-zero-downtime-data-migrations | 2024-06-06 | 2026-04-24T00:11:05Z | a8e2c595a3f1fe5ba0fe88b86bc68c896b5e27659f702c957320dbe5040c50c8 | sha_captcha_wall_content_via_webfetch_22mo_stale_title_level_only |
| stripe | real_time_analytics_billing | B_official_blog | https://stripe.com/blog/how-we-built-it-real-time-analytics-for-stripe-billing | 2025-09-16 | 2026-04-24T00:11:10Z | 21d4393776c311fe86ed5d2c64d34e6bc1e1c3a6b7f4b1373306bff0fb9d3a1a | sha_captcha_wall_content_via_webfetch_title_level_only |
| stripe | tax_jurisdiction_resolution | B_official_blog | https://stripe.com/blog/how-we-built-it-jurisdiction-resolution-for-stripe-tax | 2025-07-10 | 2026-04-24T00:11:15Z | 96b0accab61c2e418d54ba12a2bdee5f874b4e4670ba925bc39d23045597199e | sha_captcha_wall_content_via_webfetch_title_level_only |
| stripe | ai_agents_integration_benchmark | B_official_blog | https://stripe.com/blog/can-ai-agents-build-real-stripe-integrations | 2026-03-02 | 2026-04-24T00:11:20Z | a8d9765be3147449bee81026bfa49d7af65d4887d11c15e64dd6ee2cc4a8dba9 | sha_captcha_wall_content_via_webfetch |
| stripe | status_page | B_official_blog | https://status.stripe.com | 2026-04-24 | 2026-04-24T00:11:25Z | 30c222e029d4dbae81d21a235761ce999c4c621f2b32b958ef8807db95b95f6d | sha_webfetch_spa_shell_only_no_content_narrative_only |

## Column semantics

- **slug**: company entry slug (matches `companies/{slug}.md`)
- **anchor**: the prior anchor this citation supports (e.g., `api_usd_per_1m_tokens_sonnet_input`, `revenue_fy25`, `p95_chat_first_token_ms`)
- **tier**: one of the 8 codes above
- **url**: source URL as fetched
- **publish_date**: when the source was published; drives `last_verified` staleness (>18mo → warning per §6.3)
- **retrieved_at**: ISO-8601 UTC timestamp when scraper fetched
- **sha256**: hash of raw bytes pre-docling (stable across docling updates)
- **status** (enum):
  - `active` — SHA matches bytes fetched at `source_url`; row is canonical.
  - `superseded` — replaced by a newer row; include replacement row reference.
  - `invalidated` — URL no longer resolves, or content tampering detected.
  - `sha_bundle_not_url` — the stamped SHA matches a synthesis-document bundle (e.g., `raw/{slug}.md` loose research file) rather than the bytes at `source_url`. Row preserved for audit; re-fetch + re-hash required before citing in a prior. Diagnosed 2026-04-23 on dropbox/uber/etsy rows; see team-lead message on workflow drift from the loose-research.md handoff.
  - `stale_gt_18mo_architecture_anchor_only` — publish_date is >18mo but the source is retained as narrative/architecture context (not as a prior-backing citation per §6.3). Entries citing such a row must NOT include it in `latency_priors` / `availability_priors` / `cost_curves`.
  - `active_gt_18mo_warning` — publish_date is past 18mo but still used as a live citation; triggers consumer-agent staleness warning per §6.3. Looser than `stale_gt_18mo_architecture_anchor_only` in that the row can still back priors if no fresher source exists. First used on linkedin azure-linux-os row 2026-04-23.
  - `stale_gt_18mo_canonical_identity_anchor_only` — publish_date >18mo, retained because the row is the canonical identity anchor for the entry with no superseding public source available. Priors citing this row carry `verification_status: partial` + reduced `confidence`. First used on linkedin identity-latency-cost row 2026-04-23.
  - `active_publish_date_inferred_from_dau_q4_2025_claim` — live corporate page without explicit on-page publish_date; `publish_date` inferred from content (e.g., Q4 2025 DAU claim). Row remains active but lacks a scraper-computable publish_date. First used on discord company page 2026-04-23.
  - `sha_captcha_wall_content_via_webfetch` — SHA matches CAPTCHA/bot-wall bytes served at `source_url` to non-browser clients (e.g., Cloudflare Turnstile 5–6KB wall), NOT the article content. Article content was extracted via WebFetch (browser-emulating path) and is semantically valid. `verify-citations.ts` re-fetch via curl will hash the wall, not the content — content-integrity gate cannot pass without a v2.2 contract (per task #38: optional `content_sha256` alongside `sha256`, or browser-automation fallback). Priors citing such rows carry `verification_status: partial`. First used on 4 airbnb Medium blog rows 2026-04-23.
