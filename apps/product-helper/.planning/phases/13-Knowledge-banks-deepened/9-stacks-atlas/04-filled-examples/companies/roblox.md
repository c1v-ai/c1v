---
slug: roblox
name: Roblox
kind: public
hq: San Mateo, California
website: https://www.roblox.com
last_verified: 2026-04-26
verification_status: partial
reviewer: curator@c1v-kb8-atlas
data_quality_grade: Q3
primary_source:
  tier: A_sec_filing
  source_url: https://www.sec.gov/Archives/edgar/data/0001315098/000131509825000033/rblx-20241231.htm
  anchor: "FY2024 10-K — revenue, costs, employee composition (FY2025 10-K to be substituted on next curator pass)"
scale:
  metric: daily_active_users
  value: 127000000
  as_of: "2025"
  citation:
    kb_source: roblox
    source_url: https://last10k.com/sec-filings/rblx
    source_tier: A_sec_filing
    publish_date: 2026-02-15
    retrieved_at: 2026-04-26T19:13:06Z
    sha256: 1a3ec9e38da45b53e3c69372b9e478e3760631185f9e4a70468a201b227e9075
    bytes_integrity: webfetch_only_no_raw_html
    content_sha256: 1a3ec9e38da45b53e3c69372b9e478e3760631185f9e4a70468a201b227e9075
    anchor: "FY2025 10-K — average DAU 127M, Hours Engaged 123.9B; raw-research.md compiled-source anchor"
    corroborated_by: []
dau_band: over_100m
revenue_usd_annual: 4891000000
infra_cost_usd_annual: 1153000000
cost_band: 1b_10b_usd
headcount_est: 3065
economics_citations:
  - kb_source: roblox
    source_url: https://last10k.com/sec-filings/rblx
    source_tier: A_sec_filing
    publish_date: 2026-02-15
    retrieved_at: 2026-04-26T19:13:06Z
    sha256: 1a3ec9e38da45b53e3c69372b9e478e3760631185f9e4a70468a201b227e9075
    bytes_integrity: webfetch_only_no_raw_html
    content_sha256: 1a3ec9e38da45b53e3c69372b9e478e3760631185f9e4a70468a201b227e9075
    anchor: "FY2025 10-K — revenue $4,891M, cost of revenue $1,072M, infrastructure & trust & safety $1,153M, R&D $1,568M, total full-time employees 3,065 (~75% product+eng)"
    corroborated_by: []
  - kb_source: roblox
    source_url: https://www.sec.gov/Archives/edgar/data/0001315098/000131509825000326/ex991-q32025shareholderl.htm
    source_tier: A_sec_filing
    publish_date: 2025-11-05
    retrieved_at: 2026-04-26T19:13:06Z
    sha256: 1a3ec9e38da45b53e3c69372b9e478e3760631185f9e4a70468a201b227e9075
    bytes_integrity: webfetch_only_no_raw_html
    content_sha256: 1a3ec9e38da45b53e3c69372b9e478e3760631185f9e4a70468a201b227e9075
    anchor: "Q3 2025 shareholder letter — $468M FY2025 CapEx guidance; cloud-bursting enabled >47M peak concurrent users (Aug 23, 2025); Q4 2025 plan to start deploying GPUs at scale in own DCs for training and inference"
    corroborated_by: []
frontend:
  web: [react, typescript]
  mobile: [swift, kotlin]
backend:
  primary_langs: [cpp, luau, python, go]
  frameworks: []
  runtimes: [native_cpp_engine, luau_native_codegen, cpython]
data:
  oltp: [mongodb, cockroachdb]
  cache: [redis, memcached]
  warehouse: [s3, presto]
  search: [elasticsearch]
  vector: [in_house_vector_db]
  queue: [kafka]
infra:
  cloud: [on_prem_two_dc, aws, azure]
  compute: [hashicorp_nomad, docker, kubeflow, kserve, nvidia_triton]
  cdn: [in_house_pops]
  observability: [elk, tick, portworx]
ai_stack:
  training_framework: [pytorch, ray]
  serving: [kserve, nvidia_triton, in_house_ml_gateway, in_house_feature_store_on_feast, apache_flink_streaming]
  evals: [internal_a_b_tests, voice_safety_classifier, content_violation_detection]
  fine_tune: [cube_3d_foundation_model_1_8b]
  rag: [in_house_vector_db]
gpu_exposure: owns_cluster
inference_pattern: streaming
latency_priors:
  - anchor: feature_store_p99_ms
    description: "In-house feature store (built on open-source Feast) serves ~70 billion records per day at P99 50ms — feeds real-time personalization and content-violation ML inference."
    citation:
      kb_source: roblox
      source_url: https://about.roblox.com/newsroom/2024/09/running-ai-inference-at-scale-in-the-hybrid-cloud
      source_tier: B_official_blog
      publish_date: 2024-09-01
      retrieved_at: 2026-04-26T19:13:06Z
      sha256: 1a3ec9e38da45b53e3c69372b9e478e3760631185f9e4a70468a201b227e9075
      bytes_integrity: webfetch_only_no_raw_html
      content_sha256: 1a3ec9e38da45b53e3c69372b9e478e3760631185f9e4a70468a201b227e9075
      anchor: "Running AI inference at scale in the hybrid cloud — Anupam Singh (VP Eng) + Karun Channa (Director of Product), is_ic=true"
      is_ic: true
      corroborated_by: []
    confidence: 0.70
    verification_status: partial
    result_kind: scalar
    value: 50
    units: ms
    measurement: p99
    window: "2024-Q3 hybrid cloud production"
  - anchor: cube_3d_inference_token_latency_ms
    description: "Cube 3D foundation model (1.8B parameters) inference time-per-output-token reduced from 60.5ms → 20.5ms (2.9x) via CUDA Graphs + KV caching. Production-served on owned-DC GPUs."
    citation:
      kb_source: roblox
      source_url: https://about.roblox.com/newsroom/2025/06/accelerating-ai-inference-roblox-3d-creation
      source_tier: B_official_blog
      publish_date: 2025-06-01
      retrieved_at: 2026-04-26T19:13:06Z
      sha256: 1a3ec9e38da45b53e3c69372b9e478e3760631185f9e4a70468a201b227e9075
      bytes_integrity: webfetch_only_no_raw_html
      content_sha256: 1a3ec9e38da45b53e3c69372b9e478e3760631185f9e4a70468a201b227e9075
      anchor: "Accelerating AI inference for Roblox 3D creation — Cube TPOT 60.5ms → 20.5ms via CUDA Graphs + KV caching"
      is_ic: true
      corroborated_by: []
    confidence: 0.85
    verification_status: partial
    result_kind: scalar
    value: 20.5
    units: ms
    measurement: tpot
    window: "2025-Q2 in-house GPU production"
availability_priors:
  - anchor: monthly_user_uptime_target
    description: "Stated platform-wide availability target: 99.99% monthly user uptime (no more than 0.01% of engagement hours disrupted). Target dates from the April 2022 SLI/SLO/SLA framework post; reaffirmed in Dec 2023 cellular-architecture post and Jul 2024 infrastructure post. Catalyst was the October 2021 73-hour outage that triggered multi-year secondary-DC + cellular re-architecture program."
    citation:
      kb_source: roblox
      source_url: https://about.roblox.com/newsroom/2023/12/making-robloxs-infrastructure-efficient-resilient
      source_tier: B_official_blog
      publish_date: 2023-12-01
      retrieved_at: 2026-04-26T19:13:06Z
      sha256: 1a3ec9e38da45b53e3c69372b9e478e3760631185f9e4a70468a201b227e9075
      bytes_integrity: webfetch_only_no_raw_html
      content_sha256: 1a3ec9e38da45b53e3c69372b9e478e3760631185f9e4a70468a201b227e9075
      anchor: "Making Roblox's infrastructure efficient + resilient — Daniel Sturman (CTO) + Max Ross (VP Eng) + Michael Wolf (Tech Director), is_ic=true; 99.99% monthly user uptime"
      is_ic: true
      corroborated_by: []
    confidence: 0.80
    verification_status: partial
    result_kind: scalar
    value: 0.9999
    units: fraction
    measurement: target_monthly
    window: "2022 onward — target, not measured attainment"
throughput_priors:
  - anchor: feature_store_records_per_day
    description: "In-house feature store serves ~70B records per day across all real-time ML pipelines (personalization + content moderation + voice safety + recommendations). Treated as `qps` daily-volume converted: 70B/day ≈ 810k qps sustained."
    citation:
      kb_source: roblox
      source_url: https://about.roblox.com/newsroom/2024/09/running-ai-inference-at-scale-in-the-hybrid-cloud
      source_tier: B_official_blog
      publish_date: 2024-09-01
      retrieved_at: 2026-04-26T19:13:06Z
      sha256: 1a3ec9e38da45b53e3c69372b9e478e3760631185f9e4a70468a201b227e9075
      bytes_integrity: webfetch_only_no_raw_html
      content_sha256: 1a3ec9e38da45b53e3c69372b9e478e3760631185f9e4a70468a201b227e9075
      anchor: "Running AI inference at scale — feature store at ~70B records/day"
      is_ic: true
      corroborated_by: []
    confidence: 0.70
    verification_status: partial
    result_kind: scalar
    value: 810000
    units: qps
    measurement: sustained
    window: "2024-Q3 hybrid cloud feature store"
  - anchor: ml_inference_pipelines_count
    description: "Production ML inference pipelines grew from <50 (early 2023) to ~250 (Sep 2024). Tens of thousands of CPUs and >1,000 GPUs across two DCs + hybrid cloud serving these pipelines. Real-time personalization at ~1B requests/day on 79.5M DAU (mid-2024 figure)."
    citation:
      kb_source: roblox
      source_url: https://about.roblox.com/newsroom/2024/09/running-ai-inference-at-scale-in-the-hybrid-cloud
      source_tier: B_official_blog
      publish_date: 2024-09-01
      retrieved_at: 2026-04-26T19:13:06Z
      sha256: 1a3ec9e38da45b53e3c69372b9e478e3760631185f9e4a70468a201b227e9075
      bytes_integrity: webfetch_only_no_raw_html
      content_sha256: 1a3ec9e38da45b53e3c69372b9e478e3760631185f9e4a70468a201b227e9075
      anchor: "Personalization at ~1B requests/day on 79.5M DAU mid-2024"
      is_ic: true
      corroborated_by: []
    confidence: 0.65
    verification_status: partial
    result_kind: scalar
    value: 11574
    units: qps
    measurement: sustained
    window: "2024 mid-year personalization service"
cost_curves: []
utility_weight_hints:
  latency: 0.15
  cost: 0.10
  quality_bench: 0.10
  availability: 0.30
  safety: 0.20
  developer_velocity: 0.10
  security_compliance: 0.05
archetype_tags: [ai-training-gpu-fleet, python-data-heavy]
related_refs: []
nda_clean: true
ingest_script_version: "2.1.0"
---

# Roblox

Publicly traded (NYSE: RBLX, IPO Mar 2021 via direct listing). Online platform where users build, share, and play 3D experiences (UGC). Headline metrics: **average DAU** + **Hours Engaged** + **average monthly unique payers (MUPs)**. Roblox does NOT report MAU.

## 1. Scale & economics (FY2025)

- Average DAU: **127M** (+~53% YoY from FY24's 82.9M).
- Hours Engaged: **123.9B**.
- Peak concurrent users: **>47M** (Aug 23, 2025) — enabled by formal "cloud bursting" capability launched 2025.
- Average monthly unique payers: **~20M+** (Q1 2025 figure: 20.2M); 1.8M daily unique payers FY25.
- Revenue: **$4,891M** (+36% YoY).
- Cost of revenue: **$1,072M**.
- Infrastructure & trust & safety: **$1,153M** (~13% of revenue, ~9% of bookings; bundles depreciation of owned servers + on-prem ops + 3rd-party hosting + T&S headcount; **NOT** a pure cloud bill).
- R&D: **$1,568M**.
- Total full-time employees YE25: **3,065** (~75% in product + engineering ≈ >2,300 IC engineers + PMs; ~33% YoY headcount growth).
- FY2025 CapEx: **$441M** (raised guidance to $468M mid-year). FY2026 guided "roughly flat." Drivers: GPU deployment in own DCs for AI training + inference + on-prem capacity for user-growth surge.

## 2. Frontend stack

- **Web**: React + TypeScript (player-facing site, creator hub).
- **Mobile**: Swift (iOS native client), Kotlin (Android native client).
- **Native client**: C++ engine across desktop + console + mobile + VR (PS5/PS4, Meta Quest, Xbox, iOS, Android, macOS, Windows).

## 3. Backend stack

- **Engine + scripting**: C++ engine (continuous across 2021–2026 window) + **Luau** (Roblox's gradually-typed Lua-derivative; open-sourced under MIT in Nov 2021, native machine-code compilation added Aug 2023).
- **Luau internal scale**: ~95% of Roblox's "Universal App" implemented in Luau by 2024–2025; internal Luau codebase reportedly >2M LOC. Studio "Explorer" rebuilt in Luau for performance (2025).
- **External Luau adoption** (post-open-source): Alan Wake 2 (Remedy 2023), Warframe (Digital Extremes), Farming Simulator 2025 (Giants), Second Life "SLua" (Linden Lab Dec 2025).
- **ML / data services**: Python (model dev + roblox-ml internal library), Go (some infra tooling).

## 4. Data & storage

- **OLTP / NoSQL**: MongoDB, CockroachDB (multi-region transactional), InfluxDB (time-series), Elasticsearch (search).
- **Cache**: Redis, Memcached.
- **Streaming**: Apache Flink (real-time feature computation).
- **Feature store**: in-house built on open-source Feast — serves ~70B records/day at P99 50ms.
- **Vector DB**: in-house (built 2023–2024) for embeddings powering search, recommendations, content-violation detection.
- **Warehouse**: S3 + Presto.

## 5. Infrastructure topology

- **Hybrid private cloud, primarily on-premises.** ~145,000 machines across two data centers (active in Elk Grove IL; secondary in Ashburn VA, completed Q3 2023 post-2021-outage) plus PoPs (points-of-presence handling ISP peering and game-server hosting).
- **Orchestration**: HashiCorp Nomad + Docker (centralized in DCs; PoP Nomad clients managed by regional servers per Rob Cameron's 2018 SRE talk).
- **Observability** (per 2018 SRE talk; baseline that subsequent posts incrementally extend): ELK (logs) + TICK (telemetry) + Portworx (stateful storage).
- **Cloud-burst**: AWS + Azure used for peak-load spillover; formalized as "cloud bursting" capability in 2025 — this is what enabled the >47M concurrent-user milestone.
- **Cellular re-architecture** (2023→ ongoing): clusters of ~1,400 machines per cell, infrastructure-as-code, containerized services. By peak 2024–2025, >70% of back-end traffic served from cells. Goal: active-active (currently active-passive after the 2021 outage).
- **Active-passive → active-active migration** in flight; service-mesh program (planned) is the connecting tissue.

## 6. AI / ML stack

Three-phase evolution per Sep 2024 VP Eng / Director Product post:

**Pre-2022**: fragmented — individual teams built their own ML pipelines on disparate stacks.

**2022–2023 (Phase 1)**: adopted **Kubeflow** (pipelines) + **Jupyter** (development) + internal **roblox-ml** Python library; chose **KServe + NVIDIA Triton Inference Server** for real-time multi-framework serving (CPU + GPU).

**2023 (Phase 2)**:
- Distributed training expanded to **billion-parameter models** across multiple worker nodes.
- Adopted **Ray** for batch inference.
- Built custom feature store on Feast (~70B records/day at P99 50ms).
- Built in-house vector DB.
- Moved all CPU inference to own data centers for latency + privacy (~1B personalization requests/day on 79.5M DAU mid-2024).
- Inference pipelines: **<50 (early 2023) → ~250 (Sep 2024)**.

**2024**: built unified **ML gateway** centralizing access to all large models (open-source + internal) across cloud + on-prem CPU/GPU — token-count throttling, latency-aware routing, centralized API key management. Also: real-time **Voice Safety classifier** deployed at "millions of minutes of voice activity per day"; open-sourced. AI-driven **text translation** across 16+ languages launched Feb 2024.

**2025 (Phase 3 — Cube)**: Released **Cube 3D**, an autoregressive transformer foundation model for 3D generation (1.8B parameters, trained on 1.5M assets initially → ~2.8M synthetic 3D assets in v0.5). Open-sourced on GitHub + HuggingFace; arXiv 2503.15475 with v3 in July 2025. Production inference uses **CUDA Graphs + KV caching**, dropped time-per-output-token from **60.5ms → 20.5ms (2.9x)**. 4D generation in early access (Wish Master + others).

**2025–2026**: cloud-bursting + in-house GPU build-out for both training and inference; "real-time dreaming" research demo (Baszucki on Roblox Today). **Tens of thousands of CPUs and >1,000 GPUs** across two DCs + hybrid cloud (Sep 2024 figure, growing).

`gpu_exposure: owns_cluster` (Q4 2025 began deploying GPUs at scale in own DCs for training + inference).
`inference_pattern: streaming` (Cube 3D streams tokens; voice safety streams classifications).

## 7. Math priors commentary

**Emitted**:
- `latency_priors`: feature store P99 50ms (`is_ic=true`, confidence 0.70); Cube TPOT 20.5ms post-CUDA-Graphs (confidence 0.85).
- `availability_priors`: 99.99% monthly user uptime target (confidence 0.80; target value not measured attainment — the Oct 2021 73-hour outage made attaining vs. claiming this a multi-year program).
- `throughput_priors`: feature store ~70B records/day → 810k qps (confidence 0.70); personalization ~1B/day on 79.5M DAU → ~11.6k qps (confidence 0.65).

**Not emitted**:
- Pure cloud / public-cloud spend — never broken out in filings; bundled inside "infrastructure & trust & safety" alongside on-prem depreciation + T&S headcount.
- Owned-DC operating cost vs AWS/Azure spend split — never disclosed.
- Per-region SLA attainment — only 99.99% target published; actual attained availability not regularly disclosed.
- Granular AI/ML training compute spend split — total GPU count published ("tens of thousands of CPUs + >1,000 GPUs" Sep 2024) but no $ split between training, inference, traditional infra.
- 3rd-party AI vendor APIs (OpenAI / Anthropic / etc.) — unified ML gateway "centralizes access to all large models, both open source and internally developed" but vendor names not disclosed.
- Cost curves — Roblox doesn't publish per-DAU or per-Hours-Engaged unit pricing; no surface for emitting tier-A/B-only `cost_curves`.

## 8. Staleness & provenance

This entry was authored from a **single compiled raw-research.md document** (`07-uncategorized/raw/roblox/raw-research.md`, sha256 `1a3ec9e38da45b53e3c69372b9e478e3760631185f9e4a70468a201b227e9075`) rather than per-URL fetches. Per v1.1.1 schema enum, all citations carry `bytes_integrity: webfetch_only_no_raw_html` with `content_sha256` matching the compiled-research SHA. This yields `data_quality_grade: Q3` — honest grade for "narrative is sound, per-citation byte verification deferred to future curator pass."

**Future enrichment** (recommended v2.2 curator pass):
1. Fetch each source URL listed in §9 directly; compute per-URL `sha256` (raw HTML) + `content_sha256` (extracted article body).
2. Replace the placeholder `1a3ec9e38…` SHA on each citation with its per-URL hash.
3. Bump `data_quality_grade: Q3 → Q2`.

## 9. Sources

### Tier A — SEC filings

1. **Roblox FY2024 Form 10-K** — https://www.sec.gov/Archives/edgar/data/0001315098/000131509825000033/rblx-20241231.htm — published 2025-02-15. Source for headcount + product+eng %.
2. **Roblox FY2025 Form 10-K aggregation** — https://last10k.com/sec-filings/rblx — published ~2026-02-15. Source for FY25 revenue, infra & trust & safety, R&D, employee count, DAU, Hours Engaged.
3. **Roblox Q3 2025 shareholder letter (8-K Ex 99.1)** — https://www.sec.gov/Archives/edgar/data/0001315098/000131509825000326/ex991-q32025shareholderl.htm — 2025-11-05. Source for $468M FY2025 CapEx, cloud-bursting, Q4 2025 GPU deployment plan.
4. **Roblox Q4 2024 / FY24 shareholder letter** — https://www.sec.gov/Archives/edgar/data/0001315098/000131509825000021/rblx-20250206xexhibit991.htm — 2025-02-06. Source for FY24 CapEx context, infrastructure commentary.
5. **Roblox Q3 2023 shareholder letter** — https://www.sec.gov/Archives/edgar/data/0001315098/000131509823000173/ex992-shletter11823final.htm. Source for Ashburn DC completion timing.
6. **Roblox Q1 2024 shareholder letter** — https://www.sec.gov/Archives/edgar/data/0001315098/000131509824000094/ex992-q12024shareholderl.htm. Source for AI moderation efficiency, IT&S YoY decrease commentary.

### Tier B — Roblox engineering blog (`about.roblox.com/newsroom/`)

7. **"Making Roblox's infrastructure efficient + resilient"** (Sturman/Ross/Wolf, is_ic=true) — https://about.roblox.com/newsroom/2023/12/making-robloxs-infrastructure-efficient-resilient — 2023-12-01. Source for ~145k machines, 99.99% target, cellular architecture, 73-hr 2021 outage.
8. **"Running AI inference at scale in the hybrid cloud"** (Singh/Channa, is_ic=true) — https://about.roblox.com/newsroom/2024/09/running-ai-inference-at-scale-in-the-hybrid-cloud — 2024-09-01. Source for the entire ML stack: Kubeflow/Ray/KServe/Triton/Feast/Flink + ~250 pipelines + 1B requests/day + feature store P99 50ms.
9. **"How the infrastructure group drives the future"** — https://about.roblox.com/newsroom/2024/07/how-the-infrastructure-group-drives-the-future-of-everything-we-do-at-roblox — 2024-07-01. Source for 99.99% uptime restatement.
10. **"Delivering Large-Scale Platform Reliability"** — https://about.roblox.com/newsroom/2022/04/delivering-large-scale-platform-reliability — 2022-04-01. SLI/SLO/SLA framework — "Success Ratio" definition.
11. **"Scaling safety + civility"** — https://about.roblox.com/newsroom/2024/04/scaling-safety-civility-roblox — 2024-04-01.
12. **"Deploying ML for voice safety"** — https://about.roblox.com/newsroom/2024/07/deploying-ml-for-voice-safety — 2024-07-01.
13. **"Updating ML voice safety + more languages"** — https://corp.roblox.com/newsroom/2025/04/updating-ml-voice-safety-more-languages — 2025-04-01. Source for 300B content uploads Q4 2024 + 0.01% policy-violating + voice safety classifier <15s.
14. **"AI moderation at massive scale"** — https://about.roblox.com/newsroom/2025/07/roblox-ai-moderation-massive-scale — 2025-07-01.
15. **"Introducing Roblox Cube"** — https://about.roblox.com/newsroom/2025/03/introducing-roblox-cube — 2025-03-01. Cube 3D launch.
16. **"Accelerating AI inference for Roblox 3D creation"** — https://about.roblox.com/newsroom/2025/06/accelerating-ai-inference-roblox-3d-creation — 2025-06-01. Source for Cube TPOT 60.5ms→20.5ms via CUDA Graphs + KV caching.
17. **"Accelerating creation powered by Cube foundation model"** — https://about.roblox.com/newsroom/2026/02/accelerating-creation-powered-roblox-cube-foundation-model — 2026-02-01.
18. **GDC 2025 keynote / future-creation post** — https://about.roblox.com/newsroom/2025/03/unveiling-future-creation-native-3d-generation-collaborative-studio-tools-economy-expansion. Source for Studio Explorer rebuilt in Luau.

### Tier E — Conference talks

19. **HashiCorp/Portworx Architects' Corner — Rob Cameron (Principal SRE)** — https://portworx.com/blog/architects-corner-roblox-runs-platform-70-million-gamers-hashicorp-nomad/. Source for Nomad/Docker/AWS+Azure+on-prem topology + ELK/TICK/Portworx observability stack.

### Tier F — GitHub

20. **Luau open-source repo** (MIT) — https://github.com/luau-lang/luau. C++ implementation, native codegen.

### Tier G — Research papers

21. **"Cube: A Roblox View of 3D Intelligence"** — arXiv 2503.15475 — published 2025-03 with v3 update July 2025. Source for Cube 3D 1.8B parameters + training corpus + autoregressive transformer architecture.

### Adjacency / Triangulation

22. Macrotrends employee count — https://www.macrotrends.net/stocks/charts/RBLX/roblox/number-of-employees.
23. Macrotrends CapEx series — https://www.macrotrends.net/stocks/charts/RBLX/roblox/net-change-in-property-plant-equipment.
24. backlinko quarterly DAU — https://backlinko.com/roblox-users.
25. InfoQ summary of cellular architecture — https://www.infoq.com/news/2024/01/roblox-cellular-infrastructure/.
26. zenml.io LLMops summary — https://www.zenml.io/llmops-database/building-a-hybrid-cloud-ai-infrastructure-for-large-scale-ml-inference.

## Curator notes

- **`data_quality_grade: Q3`** — single compiled-research source; per-URL bytes not yet fetched + verified. Future curator pass would re-stamp per-URL `sha256` + `content_sha256`, lifting to Q2.
- **`scale.metric: daily_active_users`** — Roblox's filings explicitly warn that DAUs are accounts, not unique humans (botting + multi-account inflation possible). Roblox does NOT report MAU; DAU is the only headline scale metric.
- **`dau_band: over_100m`** — 127M FY25 average DAU is squarely above 100M.
- **`cost_band: 1b_10b_usd`** — anchored on infrastructure & trust & safety line ($1,153M FY25). The line bundles depreciation of owned servers + on-prem ops + 3rd-party hosting + T&S headcount, so this is **not** a pure cloud spend; it's a defensible bound on the bundled "platform-running" cost.
- **`infra_cost_usd_annual`** — populated with FY25 IT&S figure ($1,153M) but the field name is misleading: this includes T&S personnel and on-prem depreciation, not just infra. NEEDS_RESEARCH for cleaner split when filings or commentary disclose it (filings have not done so 2021–2025).
- **`headcount_est: 3065`** — total full-time YE25 per FY25 10-K. Product + engineering ≈ >2,300 (~75%); pure engineering is not separately stated.
- **`archetype_tags: [ai-training-gpu-fleet, python-data-heavy]`** — both partial fits. The dominant Roblox archetype ("hybrid private cloud + cellular architecture + on-prem-primary game serving + multi-DC active-passive") is **not** in the current `archetypeTagSchema` enum. Closest existing tags applied:
  - `ai-training-gpu-fleet` — Roblox owns GPU clusters in own DCs (Q4 2025 onward) for training + inference of Cube 3D foundation model + 250+ ML pipelines.
  - `python-data-heavy` — internal `roblox-ml` Python library, Kubeflow + Ray + Jupyter ML stack.
  - **NEEDS_RESEARCH (schema extension proposal)**: a new tag like `gaming-multiplayer-realtime` or `hybrid-private-cloud-on-prem-primary` would more accurately characterize Roblox's architecture. Future kb8-atlas team task to add to the enum.
- **`gpu_exposure: owns_cluster`** — Q3 2025 management commentary: "in Q4 we plan to start deploying GPUs at scale in our own data centers." Pre-Q4 2025, this would have been closer to `rents_long_term`. Stamped as `owns_cluster` since FY25 closeout is the binding "as_of" anchor.
- **`utility_weight_hints` sum to 1.00** — gaming-platform weighting: availability 0.30 dominant (the 73-hour outage is a defining historical event), safety 0.20 (Trust & Safety is its own filing-line + ongoing voice + content moderation), latency 0.15, dev velocity 0.10 (Studio + Luau ecosystem), cost 0.10, quality 0.10, security 0.05.
- **NO `latency_priors`** for gameplay state-sync, matchmaking, or game-server tick rate — all are non-disclosed in fetched corpus. Roblox runs game servers in PoPs but doesn't publish per-game-tick latency anchors.
- **NO `cost_curves`** — Roblox doesn't publish per-DAU or per-hour-engaged unit pricing.
- **`infra.cloud: [on_prem_two_dc, aws, azure]`** — `on_prem_two_dc` is curator shorthand for Roblox's headline topology; this enum value would need confirmation against the existing `infraStackSchema.cloud` enum on next curator pass. If invalid, swap for closest fit (e.g. `private_cloud`) and flag for schema extension.
