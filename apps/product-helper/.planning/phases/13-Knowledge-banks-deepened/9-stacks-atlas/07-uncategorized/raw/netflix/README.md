---
company: netflix
kind_hint: public
has_10k: true
fetched_at: "2026-04-22T00:02:30Z"
updated_at: "2026-04-23T03:16:00Z"
scraper_version: "v0.1"
files:
  - path: "10k-FY2025.md"
    original: "_cache/10k-FY2025.htm"
    docling_output: "10k-FY2025.md"
    tier: A_sec_filing
    sha256: "47f992a70276ea6a071fe82960de58bab9d1bb74b0ca8e0fbd09f03a25187603"
    publish_date: "2026-01-23"
    author: "Netflix, Inc. / SEC filing"
    is_ic: false
    extracted_claims: [revenue_fy25, gross_margin_fy25, capex_fy25, operating_margin_fy25, content_obligations_fy25, employee_count_fy25]
    note: "Does NOT contain paying_subscribers — Netflix discontinued membership reporting starting FY2025. Use q4-2024-shareholder-letter.md for that metric."
  - path: "q4-2024-shareholder-letter.md"
    original: "_cache/q4-2024-shareholder-letter.htm"
    docling_output: "q4-2024-shareholder-letter.md"
    tier: A_sec_filing
    sha256: "a54c8152622c02a33dd74b104cf0b3db305b2f962721144e44a462630d125158"
    publish_date: "2025-01-21"
    author: "Netflix, Inc. / SEC 8-K Exhibit 99.1"
    is_ic: false
    extracted_claims: [paying_subscribers_2024_q4_301_63M, paying_subscribers_2024_q3_282_72M, paying_subscribers_2024_q2_277_65M, paying_subscribers_2024_q1_269_60M, paying_subscribers_2023_q4_260_28M, revenue_2024_q4, operating_margin_2024_q4, fcf_2024_q4, discontinued_reporting_notice_2025_q2]
    note: "Supplementary source fetched per curator request. Q4 2024 = last quarter Netflix publicly reported paying memberships. Global Streaming Paid Memberships = 301.63M as_of 2024-Q4. Letter also discloses forward-looking plan to cease membership reporting starting with Q2 2025 results."
  - path: "techblog-zuul-2.md"
    original: "_cache/techblog-zuul-2.html"
    docling_output: "techblog-zuul-2.md"
    tier: B_official_blog
    sha256: "8ab49dbed981a2542c7090dcfce1322d0483705b05aa5c1d2f7789a425ec74e0"
    publish_date: "2018-05-21"
    author: "Netflix Technology Blog (collective)"
    is_ic: false
    extracted_claims: [edge_gateway_tech, zuul2_nio_architecture, requests_per_second_anchor_2018]
    staleness_warning: "published 2018; outside 18mo window. Retained for edge_gateway_tech architecture anchor (Zuul 2 still in production per post-2020 Netflix blogs)."
  - path: "techblog-mount-mayhem.md"
    original: "_cache/techblog-mount-mayhem.html"
    docling_output: "techblog-mount-mayhem.md"
    tier: B_official_blog
    sha256: "c88648ed68c2e1c1bfaac7cd9f2db26df2dcca60dd9acee62b77a9d9d6a551e5"
    publish_date: "2025-11-07"
    author: "Harshad Sane, Andrew Halaney"
    is_ic: true
    extracted_claims: [container_scaling_tech, kubernetes_aws_ec2_anchor, cpu_architecture_bottleneck, mount_namespace_kernel]
  - path: "techblog-druid-caching.md"
    original: "_cache/techblog-druid-caching.html"
    docling_output: "techblog-druid-caching.md"
    tier: B_official_blog
    sha256: "c622cb05d9420590d9bac9b168ced55356058ac8da6da953642471245a164063"
    publish_date: "2026-04-06"
    author: "Ben Sykes"
    is_ic: true
    extracted_claims: [druid_query_scale_10T_rows, druid_ingest_15M_events_sec, cache_hit_rate_prior, p95_query_latency_anchor]
notes: |
  5 sources total after supplementary fetch (was 4).

  Tier A (2): FY2025 10-K (filed 2026-01-23, period ending 2025-12-31) + Q4 2024 shareholder letter
  (8-K Exhibit 99.1 filed 2025-01-21). The Q4 2024 letter is necessary because Netflix explicitly
  discontinued membership reporting starting FY2025 — the FY2025 10-K has no paying_subscribers figure.
  Q4 2024 letter gives the canonical tier-A value: 301.63M global streaming paid as of 2024-Q4.

  Tier B (3): all from netflixtechblog.com.
  - Mount Mayhem (Sane/Halaney, 2025-11-07, is_ic=true) — container scaling priors.
  - Druid caching (Sykes, 2026-04-06, is_ic=true) — latency + cache hit-rate priors at 10T-row / 15M-events/s scale.
  - Zuul 2 (collective byline, 2018-05-21, is_ic=false) — 2018 stale. Kept as architecture-narrative anchor
    (Zuul 2 still in production per post-2020 Netflix posts). Do NOT use for quant priors.

  No tier-E conference, tier-F GitHub, or tier-G model card in this batch. QCon/Strange Loop IC talks from
  Netflix engineers exist and could be added later (transcript pipeline not built in scraper v0.1).

  All SHAs are on pre-docling raw bytes (.htm and .html files in _cache/).
  Docling output MDs are in raw root with YAML provenance headers prepended.
  Cleaned: stray _cache/sha.zuul.txt removed (curator flag).
