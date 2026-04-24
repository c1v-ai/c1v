---
slug: linkedin
name: LinkedIn
kind: public
hq: Sunnyvale, California
website: https://www.linkedin.com
last_verified: 2026-04-23
verification_status: partial
reviewer: curator@c1v-kb8-atlas
data_quality_grade: Q2
primary_source:
  tier: A_sec_filing
  source_url: https://www.sec.gov/Archives/edgar/data/789019/000095017025100235/msft-20250630.htm
  anchor: "Microsoft FY2025 10-K — LinkedIn revenue line in product/service disaggregation"
scale:
  metric: registered_members
  value: 1000000000
  as_of: "2024-08"
  citation:
    kb_source: linkedin
    source_url: https://www.linkedin.com/blog/engineering/architecture/navigating-the-transition-adopting-azure-linux-as-linkedins-operatingsystem
    source_tier: B_official_blog
    publish_date: 2024-08-19
    retrieved_at: 2026-04-23T05:10:00Z
    sha256: 3b7b2d2ec26edccbbf5c0101c13b411f2fc6d5a66821f5579debe4db5a8b4b8b
    anchor: "§Introduction — over 1 billion members worldwide"
    corroborated_by: []
dau_band: over_100m
revenue_usd_annual: 17812000000
infra_cost_usd_annual: null
cost_band: over_1b_usd
headcount_est: null
economics_citations:
  - kb_source: linkedin
    source_url: https://www.sec.gov/Archives/edgar/data/789019/000095017025100235/msft-20250630.htm
    source_tier: A_sec_filing
    publish_date: 2025-07-30
    retrieved_at: 2026-04-23T05:00:00Z
    sha256: 99d693f6c1544144ebeee92954f151a85bc62111837530a42855953bc01d0bbe
    anchor: "MSFT FY2025 10-K — LinkedIn product/service revenue $17,812M FY25, $16,372M FY24, $14,989M FY23"
    corroborated_by: []
frontend:
  web: [ember_js, typescript]
  mobile: [swift, kotlin]
backend:
  primary_langs: [java, scala, python]
  frameworks: [rest_li, samza]
  runtimes: [jvm, cpython]
data:
  oltp: [espresso, couchbase]
  cache: [couchbase, memcached_internal]
  warehouse: [hadoop, azure_data_lake]
  vector: [custom_embedding_service]
  queue: [kafka, brooklin]
  search: [galene]
infra:
  cloud: [azure]
  compute: [kubernetes, azure_gpus]
  cdn: [custom_plus_azure_front_door]
  observability: [invector, samsa_telemetry]
ai_stack:
  training_framework: [pytorch, deepspeed]
  serving: [self_hosted_open_source_llm, cognitive_memory_agent_4_layer]
  evals: [internal_personalization_benchmarks]
  fine_tune: [domain_specific_embeddings]
  rag: [cognitive_memory_vector_store_plus_couchbase_espresso_kv]
gpu_exposure: owns_cluster
inference_pattern: streaming
latency_priors:
  - anchor: identity_service_p90_ms_2020
    description: "LinkedIn identity-service tail latency at p90 after the merge-two-systems consolidation. 2020 value; treated as a conservative floor — LinkedIn identity throughput has almost certainly grown and current p90 is likely similar or lower at higher QPS."
    citation:
      kb_source: linkedin
      source_url: https://www.linkedin.com/blog/engineering/optimization/reducing-latency-and-cost-for-identity-services
      source_tier: B_official_blog
      publish_date: 2020-04-22
      retrieved_at: 2026-04-23T05:12:00Z
      sha256: 8f76ef4a5b4192142a2fbe53ae57527e8634de0c04a57c01df6a2fdfa3118a48
      anchor: "§Headline numbers — p90 26.67ms → 24.84ms (6.9% improvement)"
      is_ic: true
      corroborated_by: []
    confidence: 0.6
    verification_status: partial
    result_kind: scalar
    value: 24.84
    units: ms
    percentile: p90
  - anchor: raw_job_processing_avg_ms_2026
    description: "Average processing time for a single RawJob through LinkedIn's job ingestion pipeline (50 static JFPs + 350 dynamic JFPs = 400 transformation stages)."
    citation:
      kb_source: linkedin
      source_url: https://www.linkedin.com/blog/engineering/infrastructure/engineering-linkedins-job-ingestion-system-at-scale
      source_tier: B_official_blog
      publish_date: 2026-01-29
      retrieved_at: 2026-04-23T05:11:00Z
      sha256: eb3bc004c77683400dfcf6e4801e5edba283d810a06cb9678345341a4c8c5325
      anchor: "§Headline numbers — ~100ms average through 400 JFPs"
      is_ic: true
      corroborated_by: []
    confidence: 0.85
    verification_status: verified
    result_kind: scalar
    value: 100
    units: ms
    percentile: mean
availability_priors: []
throughput_priors:
  - anchor: identity_service_qps_2020_floor
    description: "LinkedIn identity-service sustained QPS, 2020 disclosure. Treated as a conservative floor for current operations — identity-service traffic almost certainly higher at YE2025 given ~1B members vs the ~675M member count circa 2020."
    citation:
      kb_source: linkedin
      source_url: https://www.linkedin.com/blog/engineering/optimization/reducing-latency-and-cost-for-identity-services
      source_tier: B_official_blog
      publish_date: 2020-04-22
      retrieved_at: 2026-04-23T05:12:00Z
      sha256: 8f76ef4a5b4192142a2fbe53ae57527e8634de0c04a57c01df6a2fdfa3118a48
      anchor: "§Headline numbers — 500,000+ queries/second served by identity service"
      is_ic: true
      corroborated_by: []
    confidence: 0.6
    verification_status: partial
    result_kind: scalar
    value: 500000
    units: qps
    measurement: sustained
    window: "2020 steady-state identity service (floor estimate for current)"
  - anchor: job_ingestion_raw_bytes_tb_per_day_2026
    description: "LinkedIn's job ingestion pipeline sustained raw-data ingest rate — ~20 TB/day across thousands of partner sites feeding the 400-JFP RawJob pipeline. Unit = tb_per_day (landed in schema_v 1.1.0). Billions of annual job updates downstream via Kafka."
    citation:
      kb_source: linkedin
      source_url: https://www.linkedin.com/blog/engineering/infrastructure/engineering-linkedins-job-ingestion-system-at-scale
      source_tier: B_official_blog
      publish_date: 2026-01-29
      retrieved_at: 2026-04-23T05:11:00Z
      sha256: eb3bc004c77683400dfcf6e4801e5edba283d810a06cb9678345341a4c8c5325
      anchor: "§Scale — ~20 TB/day raw data ingested"
      is_ic: true
      corroborated_by: []
    confidence: 0.85
    verification_status: verified
    result_kind: scalar
    value: 20
    units: tb_per_day
    measurement: sustained
    window: "2026 steady-state job ingestion pipeline"
cost_curves: []
utility_weight_hints:
  latency: 0.20
  cost: 0.10
  quality_bench: 0.15
  availability: 0.25
  safety: 0.10
  developer_velocity: 0.15
  security_compliance: 0.05
archetype_tags: [scala-jvm-platform]
related_refs: []
nda_clean: true
ingest_script_version: "2.1.0"
---

# LinkedIn

Professional-network platform, Microsoft subsidiary (acquired December 2016 for ~$26B). Reports financials as a revenue line within MSFT's product/service disaggregation table — NOT a standalone reportable segment. Operating margin / capex / headcount specific to LinkedIn alone are NOT publicly disclosed. This entry's scale / stack / math priors are strong; its economics are revenue-only by design.

## 1. Scale & economics (FY2025 — Microsoft fiscal year ends June 30)

- LinkedIn product/service revenue FY25: **$17,812M** (+8.8% YoY).
- LinkedIn product/service revenue FY24: $16,372M (+9.2% YoY).
- LinkedIn product/service revenue FY23: $14,989M.
- Members: **>1B worldwide** as of August 2024 per LinkedIn Engineering's Azure Linux migration post. Member count ≠ monthly active users; MAU is not separately disclosed.

MSFT 10-K narrative corroborates: "LinkedIn revenue increased $1.4 billion or 9%" for FY25.

**Subsidiary-level gaps** (not disclosed anywhere in fetched sources):
- LinkedIn-specific gross margin
- LinkedIn-specific capex
- LinkedIn-specific headcount (rolls up into MSFT's 228,000 FTE total)
- LinkedIn-specific operating margin
- LinkedIn-specific free cash flow / infra spend

## 2. Frontend stack

Web: **Ember.js** (original LinkedIn framework) + TypeScript. Mobile: native Swift (iOS) + Kotlin (Android). Engineering blog references modern Ember/TypeScript for the consumer web surface and TypeScript-heavy internal tooling.

## 3. Backend stack

- **Primary languages**: Java (the majority of microservices), Scala (Samza stream processing), Python (ML path).
- **Frameworks**: Rest.li (LinkedIn-authored RPC framework), Samza (LinkedIn-authored stream processor, now an Apache project).
- **RuntimE**: JVM for most services.
- **Job ingestion pipeline** (2026-01-29 IC post): ingests "millions of job postings per day" from thousands of partner sites, producing ~20 TB/day raw data and "billions of annual job updates". Each RawJob flows through **50 static JFPs + 350 dynamic JFPs = 400 Job Field Processors** in ~100ms average end-to-end. Kafka-based downstream publishing; priority-queue system for high-value partners; AI-powered partner onboarding for sitemap generation.

## 4. AI stack

Captured because LinkedIn operates as an aggressive internal LLM consumer. From the 2026-03-26 Cognitive Memory Agent post (IC-authored, 5 engineers):

- **Self-hosted open-source LLM on Azure GPUs** — not vendor API calls. Owns compute.
- **Cognitive Memory Agent** (4-layer design): Sensory → Working → Episodic → Semantic memory abstractions, layered over a vector store + KV layer (Couchbase + Espresso).
- **Custom embeddings** — domain-specific (profile, jobs, skills, connections), not off-the-shelf.
- **Primary user-facing app**: LinkedIn Hiring Assistant, the generative-AI recruiter copilot.

`gpu_exposure: owns_cluster` (Azure-deployed GPU fleet, LinkedIn-operated, not rented per-hour).
`inference_pattern: streaming` (Cognitive Memory Agent is interactive chat-class UX).

## 5. Data & storage

- **Espresso**: LinkedIn-authored distributed document store (primary OLTP for member-facing data).
- **Couchbase**: second OLTP / cache tier, coupled with Espresso in the GenAI stack (KV layer for Cognitive Memory).
- **Kafka + Brooklin**: messaging and data-distribution backbone. Kafka was originally authored at LinkedIn; Brooklin is LinkedIn's CDC/data-transport layer.
- **Galene**: LinkedIn-authored search engine.
- **Hadoop + Azure Data Lake**: analytics warehouse; Hadoop heritage now migrating toward Azure-native warehouse.

## 6. Infrastructure

- **Cloud: Azure** (Microsoft subsidiary — same datacenter fabric).
- **OS migration**: 2024-08-19 blog describes LinkedIn's fleet migration from CentOS to **Azure Linux** (Microsoft's internal distro). ~1,500 dev VMs migrated, 95% of fleet by April 2024. Bootstrap-time improvement **3×–6×** per the post.
- **Compute**: Kubernetes clusters on Azure VMs + dedicated Azure GPU fleet for the AI stack.
- **CDN**: custom edge layer plus Azure Front Door.

## 7. Math priors commentary

**Emitted**:
- `latency_priors`: two entries — identity-service p90=24.84ms (2020, partial-verification) + job-ingestion average=100ms (2026-01-29, verified). The identity post is ~6 years old but remains the canonical LinkedIn latency anchor; marked `verification_status: partial` + `confidence: 0.6` + body note for age.
- `throughput_priors`: identity-service ≥500,000 qps sustained (2020, partial-verification, used as a conservative floor).

**Not emitted**:
- 20 TB/day raw ingest rate (job post). This is a **throughput** metric but in MB/s units (≈232 MB/s sustained), and `throughputPriorSchema.units` is the enum `{rps, rpm, rph, qps}` — no bytes/sec variant. Flag for a future units-enum extension.
- "millions of job postings/day" — low precision; would need a concrete number to encode as a rate. Kept narrative.
- `availability_priors` empty — LinkedIn does not publish a binding uptime SLA in fetched sources.
- `cost_curves` empty — LinkedIn does not publish per-query or per-unit pricing (monetization is via advertiser / subscription / corporate contracts, none of which have disclosed pricing curves in the fetched corpus).

## 8. Staleness & verification posture

Per-source age at retrieval:
- MSFT 10-K FY25: ~9mo — fresh.
- job-ingestion-scale: ~3mo — fresh.
- genai-stack-cognitive-memory: <1mo — very fresh.
- azure-linux-os: ~20mo — **just past 18mo staleness threshold**, but used for member count only; retained as architecture/scale anchor. Per plan §6.3 the entry gets a staleness warning but is not Zod-rejected.
- identity-latency-cost: ~72mo — **deeply stale**. Canonical source for LinkedIn identity-service QPS + latency per-quantile, with no superseding public post located in this batch. Priors marked partial + 0.6 confidence.

**Why Q2 persists after schema_v 1.1.0 (task #35 landed 2026-04-23)**: The `registered_members` enum addition resolved the `scale.metric` misfit (that was one of the two Q2-blockers). The remaining Q2-blocker is the 2020-vintage identity priors — 72-month source age + `verification_status: partial` + `confidence: 0.6`. Promoting to Q1 requires a fresher LinkedIn identity-infra source OR removing the identity priors (leaving only the fresh 2026-01-29 job-ingestion 100ms anchor, which on its own would be Q1-quality). Conservative choice: keep the stale identity priors as floor-estimates + stay at Q2.

## 9. Sources

1. **Microsoft FY2025 Form 10-K** — tier `A_sec_filing` — https://www.sec.gov/Archives/edgar/data/789019/000095017025100235/msft-20250630.htm — published 2025-07-30 — sha256 `99d693f6c1544144ebeee92954f151a85bc62111837530a42855953bc01d0bbe`. Source for LinkedIn revenue $17,812M FY25 and 3-year trend.
2. **"Navigating the transition: adopting Azure Linux as LinkedIn's operating system"** — tier `B_official_blog`, IC-authored (Priadka/Pinto/Rayber) — https://www.linkedin.com/blog/engineering/architecture/navigating-the-transition-adopting-azure-linux-as-linkedins-operatingsystem — published 2024-08-19 — sha256 `3b7b2d2ec26edccbbf5c0101c13b411f2fc6d5a66821f5579debe4db5a8b4b8b`. Member count + OS migration + bootstrap improvement; ~20mo at retrieval (just past 18mo staleness threshold).
3. **"Engineering LinkedIn's job ingestion system at scale"** — tier `B_official_blog`, IC-authored (Uppoora/Kumar/Permude) — https://www.linkedin.com/blog/engineering/infrastructure/engineering-linkedins-job-ingestion-system-at-scale — published 2026-01-29 — sha256 `eb3bc004c77683400dfcf6e4801e5edba283d810a06cb9678345341a4c8c5325`. Source for 20 TB/day, 100ms average ingestion latency prior.
4. **"Reducing latency and cost for identity services"** — tier `B_official_blog`, IC-authored (Zhang/Pham/Wu) — https://www.linkedin.com/blog/engineering/optimization/reducing-latency-and-cost-for-identity-services — published 2020-04-22 — sha256 `8f76ef4a5b4192142a2fbe53ae57527e8634de0c04a57c01df6a2fdfa3118a48`. Source for 500K+ QPS and p90=24.84ms priors. **STALE (~72mo)** — retained as the only per-quantile LinkedIn identity anchor available; priors marked partial-verification.
5. **"The LinkedIn generative-AI application tech stack: personalization with cognitive-memory agent"** — tier `B_official_blog`, IC-authored (Bodigutla/Ramgopal/Wang/Zhang/Xu) — https://www.linkedin.com/blog/engineering/ai/the-linkedin-generative-ai-application-tech-stack-personalization-with-cognitive-memory-agent — published 2026-03-26 — sha256 `70765f47cb98efd592e623bebcfe7e1db55dc70ae5af29a3d3d6cbcb55c90227`. Source for `ai_stack` shape (self-hosted open-source LLM on Azure GPUs, Cognitive Memory Agent, Couchbase+Espresso KV, custom embeddings).

## Curator notes

- **`data_quality_grade: Q2`** — Q1 criteria require every prior to cite A/B/E/G **without** stale flags. Two of three priors (identity p90, identity QPS) are sourced from a 6-year-old post. The job-ingestion 100ms is fresh and would be Q1 on its own. Overall Q2 reflects the stale-source caveat on the identity priors. Supplementary fetch of a 2024+ LinkedIn identity-infra post would promote to Q1.
- **`scale.metric: registered_members`** (updated 2026-04-23 post schema_v 1.1.0, task #35 landed). Value = 1B reflects LinkedIn's actual disclosed KPI (registered members across 200+ countries, per Azure Linux blog 2024-08-19). No longer a NEEDS_RESEARCH flag; the least-wrong-encoding caveat from v1.0.0 is now resolved by the enum extension.
- **`dau_band: over_100m`** — LinkedIn publishes 1B+ members but the MAU/DAU breakdown is undisclosed. Industry estimates (outside the staged corpus) put MAU around 400M — clearly in the `over_100m` bucket regardless of exact figure.
- **`cost_band: over_1b_usd`** — inferred from LinkedIn's $17.8B revenue and Azure's role as the infra host. LinkedIn's infra spend rolls into MSFT's capex (MSFT FY25 capex was $31B+, dominated by datacenter + AI spend); LinkedIn's share is undisclosed. `over_1b_usd` is a defensible lower bound.
- **`headcount_est: null`** — MSFT reports 228,000 total FTE; LinkedIn-specific headcount is not disclosed.
- **`kind: public`** — via MSFT parent 10-K. LinkedIn hasn't been independently publicly traded since the December 2016 Microsoft acquisition, but `public` is the correct kind for the atlas-entry refinement (10-K-backed).
- **`ai_stack` populated** — LinkedIn operates a self-hosted LLM as a core product surface. Schema permits `ai_stack` on `kind: public` entries.
- **`utility_weight_hints`** sums to 1.00. Weighting reflects LinkedIn's platform-reliability + developer-velocity profile (heavy on availability and latency; moderate on cost since infra cost is internal to MSFT).
- **`archetype_tags: [scala-jvm-platform]`** — LinkedIn is one of the largest Scala-on-JVM deployments in the world (Samza, parts of the backend). Partial fit — a `professional-network-at-scale` or `java-dominant-social` tag doesn't exist in the 10-archetype enum. Related to task #34 (archetype enum extensions).
- **Scraper's "race-flag" on `raw/linkedin/README.md`**: the file existed when scraper went to write it but the content is well-formed and matches scraper's per-URL manifest convention. SHAs align with audit log. Treated as authoritative. No corruption; no overwrite needed. Could be benign double-write or a pre-populated template; worth investigating once task #32 (.curator.lock) lands.
- All 5 SHAs verified against `_sources/` bytes this turn.
