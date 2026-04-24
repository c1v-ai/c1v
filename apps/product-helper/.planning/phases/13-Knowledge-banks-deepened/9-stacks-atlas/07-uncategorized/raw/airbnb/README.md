---
company: airbnb
kind_hint: public
has_10k: true
fetched_at: "2026-04-23T23:50:00Z"
scraper_version: "v2.1-per-url"
files:
  - path: "10k-FY2025.md"
    original: "_sources/10k-FY2025.htm"
    source_url: "https://www.sec.gov/Archives/edgar/data/1559720/000155972026000004/abnb-20251231.htm"
    tier: A_sec_filing
    sha256: "61bac47250511a2263631ebd99e92b1d42caf305d27ba9d9fbfa7b11aa199c02"
    bytes: 2131290
    publish_date: "2026-02-12"
    author: "Airbnb, Inc. / SEC filing"
    is_ic: false
    filing_type: "10-K"
    extracted_claims: [revenue_fy25_12_2B_plus_10pct, cost_of_revenue_fy25_2086M, rd_expense_fy25_2354M, operating_income_fy25_2544M, net_income_fy25_2511M, scale_metric_nights_and_seats_booked, gbv_adr_kpis, experiences_2_0_launch_new_seats_category]
  - path: "metrics-pipeline-otel-vmagent.md"
    original: "_sources/metrics-pipeline-otel-vmagent.html"
    source_url: "https://medium.com/airbnb-engineering/building-a-high-volume-metrics-pipeline-with-opentelemetry-and-vmagent-c714d6910b45"
    tier: B_official_blog
    sha256: "3f8e908f0ae01d16f573c80900269537d53d1f2529873fcfaae0426d773e85f2"
    bytes: 5813
    publish_date: "2026-04-07"
    author: "Eugene Ma, Natasha Aleksandrova"
    is_ic: true
    filing_type: "blog"
    bytes_integrity: "CAPTCHA_WALL"
    extracted_claims: [metrics_pipeline_100M_samples_per_sec, vmagent_aggregator_hundreds_scale, cpu_overhead_10pct_to_sub_1pct, stack_otel_vmagent_prometheus, zero_injection_pattern, delta_temporality_10k_samples_per_instance]
  - path: "observability-ownership-vendor-migration.md"
    original: "_sources/observability-ownership-vendor-migration.html"
    source_url: "https://medium.com/airbnb-engineering/from-vendors-to-vanguard-airbnbs-hard-won-lessons-in-observability-ownership-3811bf6c1ac3"
    tier: B_official_blog
    sha256: "34f3075ef091be276752d4c15a606e3c25dd13fc9a2cbcd293dd27182a078b1c"
    bytes: 5831
    publish_date: "2026-03-17"
    author: "Callum Jones, Rong Hu"
    is_ic: true
    filing_type: "blog"
    bytes_integrity: "CAPTCHA_WALL"
    extracted_claims: [timeseries_300M_migrated, dashboards_3100_migrated, alerts_300k_migrated, services_1000_transitioned, migration_timeline_5_years, vendor_cost_driver_ingestion_volume, stack_prometheus_promql_otel_metadata]
  - path: "destination-recommendation-ml.md"
    original: "_sources/destination-recommendation-ml.html"
    source_url: "https://medium.com/airbnb-engineering/recommending-travel-destinations-to-help-users-explore-5fa7a81654fb"
    tier: B_official_blog
    sha256: "35f4c47e26f6a75170f1b4d454f20b759c2c44b61d298e685056597158bde748"
    bytes: 5744
    publish_date: "2026-03-12"
    author: "Weiwei Guo et al (12 authors)"
    is_ic: true
    filing_type: "blog"
    bytes_integrity: "CAPTCHA_WALL"
    extracted_claims: [ai_stack_transformer_sequential_model, embeddings_city_region_temporal, multi_task_region_plus_city_heads, training_data_14_per_booking, deployment_autosuggest_abandoned_search_email, non_english_region_booking_gain]
  - path: "privacy-first-connections-himeji.md"
    original: "_sources/privacy-first-connections-himeji.html"
    source_url: "https://medium.com/airbnb-engineering/privacy-first-connections-empowering-social-experiences-at-airbnb-d7dec59ef960"
    tier: B_official_blog
    sha256: "73fba4e2af41a3c681a9fde1c991a9f60c6817ec707fe761b7d8a2a8ff79f2a8"
    bytes: 5777
    publish_date: "2026-04-14"
    author: "Joy Jing"
    is_ic: true
    filing_type: "blog"
    bytes_integrity: "CAPTCHA_WALL"
    extracted_claims: [user_vs_profile_separation, distinct_user_id_profile_id, himeji_authorization_system, himeji_write_time_relation_denormalization, python_audit_tooling]
synthesis_aid: null
notes: |
  All 4 Medium/airbnb-engineering posts returned **Cloudflare Turnstile captcha walls** to curl
  (5,744-5,831 bytes each — see bytes_integrity flag). SHA256s in provenance are of the wall bytes,
  not the article content. Content extracted via WebFetch (different code path that bypasses the
  wall). Curator: do NOT re-verify SHAs against source_url — you will get fresh captcha walls with
  different hashes. Content authority is the WebFetch extraction captured in each per-URL .md body.

  This is a documented limitation of the v2.1 per-URL pattern for Cloudflare-protected publishers
  (medium.com, some tech blogs). Flag for curator consideration: either (a) accept bytes_integrity=
  CAPTCHA_WALL markers with narrative-only content, (b) architect future SHA contract to include
  content-hash-of-extracted-md in addition to bytes-hash-of-source, or (c) scraper uses a browser-
  automation fallback (puppeteer/chromium) for captcha-protected sources.

  All 4 blog posts FRESH (within 6 weeks of retrieval). All is_ic=true, IC engineer bylines.

  Headline numbers:
  - Revenue FY25 = $12.2B (+10% YoY), tier A, clean
  - Scale metric "Nights and Seats Booked" — marketplace metric, NO clean scaleMetricSchema enum fit.
    Closest: `gmv_usd_annual` (GBV proxy). Flag same class of enum gap as LinkedIn/Discord.
  - Observability migration: 300M timeseries, 3,100 dashboards, 300k+ alerts, 1,000 services (tier B, is_ic)
  - Metrics pipeline: 100M+ samples/sec, OTel+vmagent stack (tier B, is_ic, FRESH 2026-04-07)
  - AI stack: Transformer-based destination recommender (tier B, is_ic, FRESH 2026-03-12)
  - Auth architecture: Himeji in-house authorization (tier B, is_ic, FRESH 2026-04-14)

  Archetype: `rails-majestic-monolith` is canonical Airbnb, with `python-data-heavy` for ML side.
  Multi-tag recommended when #34 lands.
