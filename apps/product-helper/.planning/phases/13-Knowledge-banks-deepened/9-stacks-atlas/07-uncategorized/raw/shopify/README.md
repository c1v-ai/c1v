---
company: shopify
kind_hint: public
has_10k: true
fetched_at: "2026-04-22T00:12:30Z"
scraper_version: "v0.1"
files:
  - path: "10k-FY2025.md"
    original: "_cache/10k-FY2025.htm"
    docling_output: "10k-FY2025.md"
    tier: A_sec_filing
    sha256: "57f18fb1f3e3eda7342861d765a61a01d262c4e8ba6593fe1c7d51d6ebc6e983"
    publish_date: "2026-02-11"
    author: "Shopify Inc. / SEC filing"
    is_ic: false
    extracted_claims: [revenue_fy25, gmv_fy25, gross_margin_fy25, operating_margin_fy25, merchant_count_fy25, take_rate_fy25, capex_fy25, cash_fy25, employee_count_fy25]
  - path: "techblog-bfcm-readiness-2025.md"
    original: "_cache/techblog-bfcm-readiness-2025.html"
    docling_output: "techblog-bfcm-readiness-2025.md"
    tier: B_official_blog
    sha256: "f218cd69eae9a800e502fa29ce6ad56f115d38d9a9ee0655aecf55127161f2c4"
    publish_date: "2025-11-20"
    author: "Kyle Petroski and Matthew Frail"
    is_ic: true
    extracted_claims: [bfcm_peak_rps_284M_per_min, edge_requests_1_19T, db_queries_10_5T, db_writes_1_17T, data_volume_57_3PB, peak_throughput_12TB_per_min, kafka_bottleneck, chaos_engineering_cadence]
  - path: "techblog-ml-at-shopify.md"
    original: "_cache/techblog-ml-at-shopify.html"
    docling_output: "techblog-ml-at-shopify.md"
    tier: B_official_blog
    sha256: "5d349d6e53ca845fde482863bb5b5d5dfc2a89193c5f0583694c16777ec89d7f"
    publish_date: "2025-07-04"
    author: "Javier Moreno"
    is_ic: true
    extracted_claims: [ml_stack_overview, ai_stack_training_framework, ai_stack_serving, ai_stack_evals]
  - path: "techblog-product-search.md"
    original: "_cache/techblog-product-search.html"
    docling_output: "techblog-product-search.md"
    tier: B_official_blog
    sha256: "ecdb9b82f08e941ac875292bd03263b383eab67b00db1d70ee8a55bb2774c206"
    publish_date: "2025-11-12"
    author: "Mikhail Shakhray"
    is_ic: true
    extracted_claims: [search_stack_c_plus_plus, search_ml_transformers_neural_rankers, search_p99_latency_ms_anchor, rankflow_dsl_turbodsl_engine, billions_queries_bfcm_scale]
notes: |
  Latest 10-K is FY2025 (filed 2026-02-11, period ending 2025-12-31). Note: Shopify was a 40-F filer
  through FY2023, switched to 10-K starting FY2024 when they became a U.S. domestic filer.
  All 4 sources fresh — within 18mo staleness window (newest: Nov 20, 2025 BFCM post).
  3 IC-authored blog posts, all named bylines verified via Shopify's itemProp="name" markup.
  No tier-E conference or tier-G model card. No dual-C citations.

  BFCM readiness post is the high-value scale anchor: 284M req/min peak, 1.19T edge requests, 57.3 PB data,
  12TB/min peak throughput, 10.5T DB queries — concrete numbers for Little's-Law + availability priors.

  ML post provides ai_stack narrative for §4.3 (public kind, ai_stack not required but beneficial for M4
  decision-matrix priors on LLM-integration archetype).

  All SHAs on pre-docling raw bytes in _cache/. Replaced earlier stale picks (sharded-monolith-CDC from 2021,
  shop-app-vitess from 2024-01 on the edge of staleness) with the fresher ML + product-search posts.
