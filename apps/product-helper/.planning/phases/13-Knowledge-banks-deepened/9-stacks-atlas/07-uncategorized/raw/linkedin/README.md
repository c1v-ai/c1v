---
company: linkedin
kind_hint: public
has_10k: true
parent_company: microsoft
ownership_note: "LinkedIn is a wholly-owned subsidiary of Microsoft (acquired Dec 2016, ~$26B). Financials are reported as a revenue line within MSFT's 10-K product/service revenue table, not as a standalone reportable segment. Operating margin / capex / employee count specific to LinkedIn are NOT disclosed at the subsidiary level."
fetched_at: "2026-04-23T05:00:00Z"
scraper_version: "v2.1-per-url"
files:
  - path: "msft-10k-FY2025.md"
    original: "_sources/msft-10k-FY2025.htm"
    source_url: "https://www.sec.gov/Archives/edgar/data/789019/000095017025100235/msft-20250630.htm"
    tier: A_sec_filing
    sha256: "99d693f6c1544144ebeee92954f151a85bc62111837530a42855953bc01d0bbe"
    bytes: 8158067
    publish_date: "2025-07-30"
    author: "Microsoft Corporation / SEC filing"
    is_ic: false
    filing_type: "10-K"
    extracted_claims: [linkedin_revenue_fy25_17812M, linkedin_revenue_fy24_16372M, linkedin_revenue_fy23_14989M, linkedin_revenue_yoy_growth_fy25, linkedin_product_family_structure]
  - path: "azure-linux-os.md"
    original: "_sources/azure-linux-os.html"
    source_url: "https://www.linkedin.com/blog/engineering/architecture/navigating-the-transition-adopting-azure-linux-as-linkedins-operatingsystem"
    tier: B_official_blog
    sha256: "3b7b2d2ec26edccbbf5c0101c13b411f2fc6d5a66821f5579debe4db5a8b4b8b"
    bytes: 112845
    publish_date: "2024-08-19"
    author: "Ievgen Priadka, Sweekar Pinto, Bubby Rayber"
    is_ic: true
    filing_type: "blog"
    extracted_claims: [member_count_over_1B, os_migration_centos_to_azure_linux, azure_linux_dev_vms_1500, fleet_migration_95pct_by_april_2024, bootstrap_time_improvement_3x_to_6x]
  - path: "job-ingestion-scale.md"
    original: "_sources/job-ingestion-scale.html"
    source_url: "https://www.linkedin.com/blog/engineering/infrastructure/engineering-linkedins-job-ingestion-system-at-scale"
    tier: B_official_blog
    sha256: "eb3bc004c77683400dfcf6e4801e5edba283d810a06cb9678345341a4c8c5325"
    bytes: 102644
    publish_date: "2026-01-29"
    author: "Anvesh Uppoora, Rishav Kumar, Avinash Permude"
    is_ic: true
    filing_type: "blog"
    extracted_claims: [daily_job_postings_millions, daily_raw_data_20TB, annual_job_updates_billions, rawjob_processing_100ms_average, jfp_count_50_static_350_dynamic, kafka_downstream_publishing, ai_powered_partner_onboarding]
  - path: "identity-latency-cost.md"
    original: "_sources/identity-latency-cost.html"
    source_url: "https://www.linkedin.com/blog/engineering/optimization/reducing-latency-and-cost-for-identity-services"
    tier: B_official_blog
    sha256: "8f76ef4a5b4192142a2fbe53ae57527e8634de0c04a57c01df6a2fdfa3118a48"
    bytes: 93148
    publish_date: "2020-04-22"
    author: "Xiang Zhang, Estella Pham, Ke Wu"
    is_ic: true
    filing_type: "blog"
    extracted_claims: [identity_service_qps_500k_plus, p50_latency_improvement_14pct, p90_latency_24_84ms, p99_latency_improvement_9_6pct, decommissioned_cores_12k, decommissioned_memory_13k_GB, memory_allocation_rate_reduction_28_6pct]
    staleness_warning: "published 2020-04-22; 6 years old at retrieval. Architectural pattern (service consolidation) is evergreen and the 500K+ QPS figure is a conservative floor for current scale. Treat per-quantile latency numbers as circa-2020 anchor; LinkedIn identity throughput has almost certainly grown since."
  - path: "genai-stack-cognitive-memory.md"
    original: "_sources/genai-stack-cognitive-memory.html"
    source_url: "https://www.linkedin.com/blog/engineering/ai/the-linkedin-generative-ai-application-tech-stack-personalization-with-cognitive-memory-agent"
    tier: B_official_blog
    sha256: "70765f47cb98efd592e623bebcfe7e1db55dc70ae5af29a3d3d6cbcb55c90227"
    bytes: 112967
    publish_date: "2026-03-26"
    author: "Praveen Kumar Bodigutla, Karthik Ramgopal, Xiaofeng Wang, Shangjin Zhang, Zhentao Xu"
    is_ic: true
    filing_type: "blog"
    extracted_claims: [ai_stack_open_source_llm_self_hosted, gpu_exposure_owns_cluster_via_azure, cognitive_memory_agent_4_layer_design, vector_store_for_retrieval, couchbase_plus_espresso_kv_layer, custom_embeddings_domain_specific, hiring_assistant_primary_app]
notes: |
  LinkedIn is an MSFT subsidiary; scope of this entry's economics is LinkedIn-line in MSFT's revenue-by-product table
  ($17,812M FY25, +8.8% YoY). Operating margin / capex / cloud-spend specific to LinkedIn alone are NOT publicly
  disclosed — they roll up into MSFT segment totals. Flag as NEEDS_RESEARCH for any subsidiary-specific economics
  beyond revenue.

  5 sources: 1 tier-A (MSFT 10-K) + 4 tier-B (linkedin.com/blog/engineering). All 4 blog posts is_ic=true per
  LinkedIn Engineering byline conventions (engineering IC/staff named authors; distinct from LinkedIn's main
  corporate press blog which is marketing).

  Freshness: 2 posts fresh (2026-01 ingest, 2026-03 genai), 1 mid-2024 (Azure Linux migration), 1 very stale
  (2020 identity-latency). Staleness flagged on the identity post; retained for architectural pattern + QPS floor.

  Key anchors by prior type:
  - Scale (members): >1B (narrative from Azure Linux post, tier B is_ic)
  - Scale (revenue): $17.812B FY25 (tier A, MSFT 10-K)
  - Latency (identity p90): 24.84 ms (tier B is_ic, circa 2020; stale)
  - Latency (pipeline-hop per-JFP): ~0.25 ms amortized (derived from job-ingestion post, tier B is_ic, 2026)
  - Throughput (identity): >500K QPS (tier B is_ic, circa 2020; stale)
  - Throughput (job ingestion): 20 TB/day raw (tier B is_ic, 2026)
  - ai_stack: open-source LLM self-hosted on Azure + custom embeddings + Couchbase/Espresso + CMA 4-layer memory (tier B is_ic, 2026)
  - Stack narrative: Kafka + Azure Linux + Espresso KV + Couchbase (tier B is_ic across posts)

  Schema-fit warnings:
  - scaleMetricSchema has no `members` value; closest fit `monthly_active_users` as weak proxy OR leave scale.metric
    at a synthetic fallback. Coordinate with curator on gap-handling.
  - throughput prior shape doesn't exist (schema gap #31, curator's prior discovery) — 500K QPS + 20 TB/day must
    live in body narrative rather than a structured throughput_priors[] field.
  - Employee count specific to LinkedIn not disclosed (MSFT total ~228K at YE2025 rolls LinkedIn in).

  archetype_tags: closest enum fits are `scala-jvm-platform` (LinkedIn invented Kafka on JVM; big Scala/Java
  codebase historically) and `ai-native-inference-edge` for the genai slice. Core social-graph archetype
  (facebook-scale social engagement) doesn't cleanly exist in the 10-archetype list — another flavor of the
  archetype_tags gap flagged under task #34 for cloudflare.
synthesis_aid: "research.md (to be written if corpus warrants; for now the 5 per-URL files are authoritative)"
