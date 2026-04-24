---
company: cloudflare
kind_hint: public
has_10k: true
fetched_at: "2026-04-23T04:00:00Z"
updated_at: "2026-04-23T04:30:00Z"
scraper_version: "v2.1-per-url"
files:
  - path: "10k-FY2025.md"
    original: "_sources/10k-FY2025.htm"
    source_url: "https://www.sec.gov/Archives/edgar/data/1477333/000147733326000016/cloud-20251231.htm"
    tier: A_sec_filing
    sha256: "b2e19963a1e3df97eb84d21d1c65b49a660a9e7ebab3f3a052e101a46fae18a0"
    bytes: 2600690
    publish_date: "2026-02-26"
    author: "Cloudflare, Inc. / SEC filing"
    is_ic: false
    filing_type: "10-K"
    extracted_claims: [revenue_fy25, revenue_growth_fy25, gross_margin_fy25, operating_margin_fy25, capex_fy25, rd_expense_fy25, employee_count_fy25, international_employee_share_fy25, paying_customers_fy25_end]
  - path: "birthday-week-2025-wrap-up.md"
    original: "_sources/birthday-week-2025-wrap-up.html"
    source_url: "https://blog.cloudflare.com/birthday-week-2025-wrap-up/"
    tier: B_official_blog
    sha256: "f164fa55e51f3fd17815fbc3f610a3d6f1ebb0528a4a8aa80e7a6ae02c8a3ec5"
    bytes: 444881
    publish_date: "2025-09-29"
    author: "Nikita Cano, Korinne Alpers"
    is_ic: false
    filing_type: "blog"
    extracted_claims: [fl2_rust_rewrite_10ms_median_improvement, workers_cold_start_10x_reduction, tls_auto_upgrade_6M_domains, encryption_traffic_share_95pct, quic_speed_10pct_improvement]
  - path: "workers-for-platforms.md"
    original: "_sources/workers-for-platforms.html"
    source_url: "https://blog.cloudflare.com/workers-for-platforms/"
    tier: B_official_blog
    sha256: "4e611d0cc02fe94efab57a7647ed06e772feb024c5581fa529b25d7c18e4f73a"
    bytes: 390876
    publish_date: "2022-05-10"
    author: "Rita Kozlov"
    is_ic: false
    filing_type: "blog"
    extracted_claims: [v8_isolate_architecture, cold_start_narrative_justification, scale_target_hundreds_thousands_millions_workers]
    staleness_warning: "published 2022-05-10; architecture invariant still in production per 2025 birthday-week references. Narrative-only anchor, not quant."
  - path: "r2-ga.md"
    original: "_sources/r2-ga.html"
    source_url: "https://blog.cloudflare.com/r2-ga/"
    tier: B_official_blog
    sha256: "5c6ecf4a0ae3bbd2116bc0e2a0a0f828539216e35b9b96d90d52518541fda57d"
    bytes: 383718
    publish_date: "2022-09-21"
    author: "Aly Cabral"
    is_ic: false
    filing_type: "blog"
    extracted_claims: [r2_storage_pricing_0_015_per_GB, r2_class_a_pricing_4_50_per_M, r2_class_b_pricing_0_36_per_M, r2_zero_egress_differentiator, r2_free_tier_sizing]
    staleness_warning: "published 2022-09-21; pricing schedule unchanged per Cloudflare live pricing page. Curator may supplementary-fetch live pricing for freshness anchor if strict."
  - path: "workers-ai.md"
    original: "_sources/workers-ai.html"
    source_url: "https://blog.cloudflare.com/workers-ai/"
    tier: B_official_blog
    sha256: "8281b032cbd2e04462f535b956ad424dc14383752e5e02b540fb321c5cc8de93"
    bytes: 414697
    publish_date: "2023-09-27"
    author: "Phil Wittig, Rita Kozlov, Rebecca Weekly, Celso Martinho, Meaghan Choi"
    is_ic: false
    filing_type: "blog"
    extracted_claims: [workers_ai_ga_launch_date, gpu_rollout_7_to_100_to_nearly_everywhere, neurons_pricing_0_01_regular_0_125_fast, models_hosted_list, neurons_to_llm_response_conversion_130_per_1k, gpu_exposure_owns_cluster, inference_pattern_edge_serverless]
    staleness_warning: "published 2023-09-27; model list and pricing reflect 2023 GA. Curator may supplementary-fetch current Workers AI catalog for fresher ai_stack anchor."
synthesis_aid: "research.md"
notes: |
  PER-URL STAGING PER TEAM-LEAD CORRECTION 2026-04-23. Initial v2 single-research.md attempt was
  re-staged as 5 per-URL files (10k-FY2025.md, birthday-week-2025-wrap-up.md, workers-for-platforms.md,
  r2-ga.md, workers-ai.md). Each has YAML provenance header with pre-synthesis SHA256 on raw HTML bytes
  in _sources/. research.md retained as non-authoritative synthesis aid — curator MUST cite per-URL
  files, never research.md.

  5 sources total: 1 tier-A (FY2025 10-K) + 4 tier-B (blog.cloudflare.com posts). No tier-E, no tier-G,
  no dual-C, no is_ic=true (all Cloudflare blog bylines are VP / Director / PM / marketing).

  Audit log scraper-audit.log: 5 cloudflare entries status:ok + 2 entries status:rejected_404 for
  URLs that 404'd during discovery (how-we-built-ai-gateway, cf-1). Those URLs flagged as
  NEEDS_RESEARCH in research.md §Unknowns.

  Scale metric challenge: Cloudflare reports "paying customers" (contracts), not any of the 7 enum
  values in scaleMetricSchema. Closest synthetic match would be `api_calls_per_day_est` from narrative
  traffic, but that narrative isn't in this source set. Flagged for curator consideration.

  Archetype challenge: Cloudflare doesn't cleanly fit any of the 10 archetype_tags enum values.
  `ai-native-inference-edge` for the Workers AI slice; core CDN + Workers + DDoS business has no
  clean archetype match. Flagged as NEEDS_ARCHETYPE_ADD in research.md §4.

  Staleness: 3 of 4 blog posts are past the 18mo window but retained because the architectural or
  pricing content remains canonical. Curator may choose to replace with fresher posts if available.
