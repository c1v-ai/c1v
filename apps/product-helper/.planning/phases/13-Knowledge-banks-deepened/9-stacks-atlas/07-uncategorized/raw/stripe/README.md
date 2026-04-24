---
company: stripe
kind_hint: private_nonpublic
has_10k: false
fetched_at: "2026-04-24T00:10:44Z"
scraper_version: "v2.1-per-url"
files:
  - path: "annual-letter-2025.md"
    source_url: "https://stripe.com/newsroom/news/stripe-2025-update"
    tier: G_company_official
    publish_date: "2026-02-24"
    author: "Patrick Collison, John Collison"
    is_ic: false
    filing_type: "annual_letter"
    bytes_integrity: "webfetch_text_only_no_sha_at_rest"
    extracted_claims: [tpv_2025_1_9T_usd, tpv_yoy_growth_34pct, revenue_suite_1B_arr, stablecoin_400B_volume, businesses_served_5M_plus, tender_offer_valuation_159B_usd, product_updates_350_plus]
  - path: "docdb-zero-downtime-migrations.md"
    source_url: "https://stripe.com/blog/how-stripes-document-databases-supported-99.999-uptime-with-zero-downtime-data-migrations"
    canonical_url: "https://stripe.dev/blog/how-stripes-document-databases-supported-99.999-uptime-with-zero-downtime-data-migrations"
    tier: B_official_blog
    publish_date: "2024-06-06"
    author: "Jimmy Morzaria, Suraj Narkhede"
    is_ic: true
    filing_type: "blog"
    bytes_integrity: "stripe_blog_csr_wall_content_via_webfetch"
    extracted_claims: [availability_target_99_999_pct, internal_system_data_movement_platform]
  - path: "real-time-analytics-billing.md"
    source_url: "https://stripe.com/blog/how-we-built-it-real-time-analytics-for-stripe-billing"
    canonical_url: "https://stripe.dev/blog/how-we-built-it-real-time-analytics-for-stripe-billing"
    tier: B_official_blog
    publish_date: "2025-09-16"
    author: "Reed Trevelyan"
    is_ic: true
    filing_type: "blog"
    bytes_integrity: "stripe_blog_csr_wall_content_via_webfetch"
    extracted_claims: [domain_real_time_analytics_billing]
  - path: "tax-jurisdiction-resolution.md"
    source_url: "https://stripe.com/blog/how-we-built-it-jurisdiction-resolution-for-stripe-tax"
    canonical_url: "https://stripe.dev/blog/how-we-built-it-jurisdiction-resolution-for-stripe-tax"
    tier: B_official_blog
    publish_date: "2025-07-10"
    author: "Erich Rentz, Danko Komlen"
    is_ic: true
    filing_type: "blog"
    bytes_integrity: "stripe_blog_csr_wall_content_via_webfetch"
    extracted_claims: [domain_tax_jurisdiction_resolution, claim_faster_less_resource_intensive_rewrite]
  - path: "ai-agents-integration-benchmark.md"
    source_url: "https://stripe.com/blog/can-ai-agents-build-real-stripe-integrations"
    tier: B_official_blog
    publish_date: "2026-03-02"
    author: "Carol Liang, Kevin Ho"
    is_ic: true
    filing_type: "blog"
    bytes_integrity: "webfetch_rendered_text"
    extracted_claims: [benchmark_11_environments, claude_opus_4_5_92pct, gpt_5_2_73pct, harness_goose_mcp]
  - path: "status-page.md"
    source_url: "https://status.stripe.com"
    tier: B_official_blog
    publish_date: null
    author: "Stripe (operational telemetry)"
    is_ic: false
    filing_type: "status_page"
    bytes_integrity: "webfetch_spa_shell_only_loading_message"
    extracted_claims: [status_page_exists_at_status_stripe_com]
security_gate:
  domain_allowlist_passed: true
  domains_fetched: [stripe.com, stripe.dev, status.stripe.com]
  ssrf_guard: "n/a — all resolved to stripe public CDN"
  rejected_urls: []
  press_dual_c_used: false
captcha_paywall_hits:
  - "stripe.com/blog/* redirects 301 to stripe.dev/blog/* which is CSR React — bodies not recoverable via WebFetch (4 posts affected)"
  - "status.stripe.com is a Statuspage-style SPA; only pre-hydration shell returned"
notes: |
  stripe is private — no 10-K. Primary scale source is the Collison 2025 annual letter
  (tier G, rich numbers). Four engineering blog URLs were fetched but only title-level
  + byline + dek content was recovered due to the stripe.dev CSR wall; one post
  (can-ai-agents) returned more complete body. Dual-C press (Bloomberg/The Information)
  was NOT invoked — the annual letter provides primary-source scale bands directly.
  All CSR-wall entries carry bytes_integrity tags forward-compatible with architect's
  in-flight #38 schema gap. Curator should treat CSR-wall posts as IC attestation at
  tier B for the title-level claim only, and NOT mine them for numeric priors that
  aren't visible in the captured shell.
---

# raw/stripe manifest

Six URLs staged. See frontmatter above for per-file provenance. Synthesis aid at `research.md` (NOT a provenance artifact).
