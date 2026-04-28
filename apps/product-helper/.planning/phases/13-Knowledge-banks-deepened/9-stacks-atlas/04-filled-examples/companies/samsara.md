---
slug: samsara
name: Samsara
kind: public
hq: San Francisco, California
website: https://www.samsara.com
last_verified: 2026-04-26
verification_status: partial
reviewer: curator@c1v-kb8-atlas
data_quality_grade: Q2
primary_source:
  tier: A_sec_filing
  source_url: https://www.sec.gov/Archives/edgar/data/0001642896/000162828026015170/samsaraepr-q42026.htm
  anchor: "Samsara Q4 FY26 8-K — FY26 revenue $1,618.6M, cost of revenue $376.5M, R&D $344.6M, 25T data points/yr, 4,100+ employees"
scale:
  metric: paying_organizations
  value: 3194
  as_of: "2026"
  citation:
    kb_source: samsara
    source_url: https://www.sec.gov/Archives/edgar/data/0001642896/000162828026015170/samsaraepr-q42026.htm
    source_tier: A_sec_filing
    publish_date: 2026-03-15
    retrieved_at: 2026-04-26T19:52:36Z
    sha256: d563e316db7fd568a515cc04c76d88359d80df02d491eb72910aafe24581a8eb
    bytes_integrity: webfetch_only_no_raw_html
    content_sha256: d563e316db7fd568a515cc04c76d88359d80df02d491eb72910aafe24581a8eb
    anchor: "FY26 10-K — 3,194 customers >$100K ARR (canonical scale series since IPO); 23,000+ ≥$10K ARR under old Core def; 12,000+ ≥$25K ARR under FY26 raised def; raw-research.md compiled-source anchor"
    corroborated_by: []
dau_band: unknown
revenue_usd_annual: 1618600000
infra_cost_usd_annual: 376500000
cost_band: 100m_1b_usd
headcount_est: 4100
economics_citations:
  - kb_source: samsara
    source_url: https://www.sec.gov/Archives/edgar/data/0001642896/000162828026015170/samsaraepr-q42026.htm
    source_tier: A_sec_filing
    publish_date: 2026-03-15
    retrieved_at: 2026-04-26T19:52:36Z
    sha256: d563e316db7fd568a515cc04c76d88359d80df02d491eb72910aafe24581a8eb
    bytes_integrity: webfetch_only_no_raw_html
    content_sha256: d563e316db7fd568a515cc04c76d88359d80df02d491eb72910aafe24581a8eb
    anchor: "Q4 FY26 8-K + FY26 10-K — revenue $1,618.6M, cost of revenue $376.5M (~76.7% gross margin), R&D $344.6M, ARR ~$1.9B, 4,100+ FTEs, 25T data points/yr, PP&E net $81.6M"
    corroborated_by: []
  - kb_source: samsara
    source_url: https://www.sec.gov/Archives/edgar/data/0001642896/000164289625000007/samsaraepr-q42025.htm
    source_tier: A_sec_filing
    publish_date: 2025-03-06
    retrieved_at: 2026-04-26T19:52:36Z
    sha256: d563e316db7fd568a515cc04c76d88359d80df02d491eb72910aafe24581a8eb
    bytes_integrity: webfetch_only_no_raw_html
    content_sha256: d563e316db7fd568a515cc04c76d88359d80df02d491eb72910aafe24581a8eb
    anchor: "Q4 FY25 8-K — revenue $1,249.2M, ARR $1,458M, cost of revenue $298.3M, R&D $299.7M, 2,506 customers >$100K ARR, 14T data points, 3,500+ FTEs, 20.2M FY25 CapEx"
    corroborated_by: []
  - kb_source: samsara
    source_url: https://www.sec.gov/Archives/edgar/data/1642896/000164289625000048/iot2025ars.pdf
    source_tier: A_sec_filing
    publish_date: 2025-04-01
    retrieved_at: 2026-04-26T19:52:36Z
    sha256: d563e316db7fd568a515cc04c76d88359d80df02d491eb72910aafe24581a8eb
    bytes_integrity: webfetch_only_no_raw_html
    content_sha256: d563e316db7fd568a515cc04c76d88359d80df02d491eb72910aafe24581a8eb
    anchor: "FY25 10-K (annual report PDF) — cost-of-revenue prose verbatim ('amortization of IoT device costs...third-party cloud infrastructure expenses...cellular-related costs...customer support...warranty...operational costs'); AWS sole-provider risk language; 20,000+ customers ≥$10K ARR (FY25 Core def)"
    corroborated_by: []
frontend:
  web: [vue_js, javascript]
  mobile: [swift, kotlin]
backend:
  primary_langs: [go, python, c]
  frameworks: [flask]
  runtimes: [go_native, cpython, c_firmware]
data:
  oltp: []
  cache: []
  warehouse: [databricks, delta_lake, spark]
  search: []
  queue: [aws_kinesis, aws_step_functions]
infra:
  cloud: [aws]
  compute: [aws_ec2, kubernetes, kuberay, terraform_iac]
  cdn: []
  observability: []
ai_stack:
  training_framework: [tensorflow, pytorch, ray, kuberay]
  serving: [tflite_edge, tensorrt_edge, snpe_edge, in_house_safety_agent]
  evals: [internal_qa_dashcam_detections]
  fine_tune: [in_house_safety_classifiers, foundation_model_bootstrap_labeling]
  rag: []
gpu_exposure: rents_spot
inference_pattern: edge
latency_priors: []
availability_priors: []
throughput_priors:
  - anchor: data_points_per_year_fy26
    description: "Samsara's Connected Operations Platform processed ~25T data points across the FY26 year (Feb 1, 2025 – Jan 31, 2026), up from 14T (FY25) and ~2T (~2021 era engineering blog). Computed as sustained events/sec: 25e12 / (365.25 * 86400) ≈ 792k events/sec sustained. Source is the FY26 10-K headline scale claim; underlying ingestion pipeline = AWS Kinesis + Spark + Delta Lake."
    citation:
      kb_source: samsara
      source_url: https://www.sec.gov/Archives/edgar/data/0001642896/000162828026015170/samsaraepr-q42026.htm
      source_tier: A_sec_filing
      publish_date: 2026-03-15
      retrieved_at: 2026-04-26T19:52:36Z
      sha256: d563e316db7fd568a515cc04c76d88359d80df02d491eb72910aafe24581a8eb
      bytes_integrity: webfetch_only_no_raw_html
      content_sha256: d563e316db7fd568a515cc04c76d88359d80df02d491eb72910aafe24581a8eb
      anchor: "Q4 FY26 8-K + FY26 10-K — 25 trillion data points processed per year"
      corroborated_by: []
    confidence: 0.80
    verification_status: partial
    result_kind: scalar
    value: 792107
    units: events_per_second
    measurement: sustained
    window: "FY26 (Feb 2025 – Jan 2026) annual-sustained average"
  - anchor: video_minutes_per_year_2024
    description: "Per Samsara's 'How Samsara Engineers Work' (engineering culture blog, 2024): platform ingests ~38B minutes of dashcam video per year. Computed as sustained minutes-of-video-ingested/sec: 38e9 minutes/yr × 60 = 2.28e12 video-seconds/yr → 72,247 video-seconds-of-content-ingested per real-time second. Reported as a request-rate proxy in `messages_per_second` to keep the value in human-reasonable range."
    citation:
      kb_source: samsara
      source_url: https://www.samsara.com/blog/samsara-engineering-culture
      source_tier: B_official_blog
      publish_date: 2024-04-01
      retrieved_at: 2026-04-26T19:52:36Z
      sha256: d563e316db7fd568a515cc04c76d88359d80df02d491eb72910aafe24581a8eb
      bytes_integrity: webfetch_only_no_raw_html
      content_sha256: d563e316db7fd568a515cc04c76d88359d80df02d491eb72910aafe24581a8eb
      anchor: "How Samsara Engineers Work — ~38B minutes of dashcam video ingested annually + AWS Kinesis ingestion fabric + Spark/Databricks/Delta Lake warehouse"
      is_ic: true
      corroborated_by: []
    confidence: 0.65
    verification_status: partial
    result_kind: scalar
    value: 72247
    units: messages_per_second
    measurement: sustained
    window: "2024 era engineering culture post; pre-FY26 25T data-point scale-up"
cost_curves: []
utility_weight_hints:
  latency: 0.15
  cost: 0.10
  quality_bench: 0.10
  availability: 0.25
  safety: 0.20
  developer_velocity: 0.10
  security_compliance: 0.10
archetype_tags: [go-microservices-at-scale, ai-native-inference-edge]
related_refs: []
nda_clean: true
ingest_script_version: "2.1.0"
---

# Samsara

Publicly traded (NYSE: IOT, IPO Dec 2021). B2B Connected Operations Platform — IoT gateways + dashcams + sensors → cellular link → AWS-hosted multi-tenant SaaS → Applications layer → Agents layer (FY26+). Customers are commercial fleets, industrial operators, public-sector logistics, and asset-heavy SMBs/enterprises.

**Fiscal year ends the Saturday closest to Feb 1.** "FY26" = Feb 2025 – Jan 31, 2026. Headline metrics: **paid customer counts segmented by ARR threshold** (>$100K ARR — canonical series since IPO; >$1M ARR added 2024; ≥$10K and ≥$25K Core thresholds disclosed but the Core definition was *raised* in FY26 from ≥$10K to ≥$25K), **ending ARR**, **revenue**, and **data points processed per year** (sensor + telemetry + video metadata). Samsara does NOT publish DAU/MAU — the platform is B2B and the "user" abstraction is a connected asset/seat subscription, not a daily-active human.

## 1. Scale & economics (FY2026, ending Jan 31, 2026)

### Customer counts (multi-year)

| FY end | $100K+ ARR | $1M+ ARR | "Core" customers (def) | Ending ARR | Revenue | Data points/yr |
|---|---|---|---|---|---|---|
| FY22 (Jan 29 2022) | 806 | n/d | 13,000+ ≥$5K ARR (S-1) | $558.1M | $428.3M | ~2T (eng blog) |
| FY23 (Jan 28 2023) | 1,237 | n/d | n/d | $795.1M | $652.5M | n/d |
| FY24 (Feb 3 2024) | 1,848 | crossed milestone in Q4 | n/d | $1,102.0M | $937.4M | n/d |
| FY25 (Feb 1 2025) | 2,506 | run-rate 140s | 20,000+ ≥$10K ARR | $1,458M | $1,249.2M | **14T** |
| **FY26** (Jan 31 2026) | **3,194** | **164** (Q3) | **12,000+ ≥$25K (raised def); 23,000+ ≥$10K (old def)** | **$1,900M** | **$1,618.6M** | **25T** |

ARR concentration FY26: ~85% from new Core (≥$25K), ~61% from $100K+, >20% from $1M+ (since Q2 FY26).

### Income statement (FY21–FY26, USD millions)

| Year | Revenue | Cost of revenue | Gross margin | R&D | Total FTEs |
|------|---------|-----------------|--------------|-----|-----------|
| FY21 | $249.9 | $75.4 | 69.8% | $99.7 | 1,249 |
| FY22 | $428.3 | $124.5 | 70.9% | $205.1 | 1,616 |
| FY23 | $652.5 | $182.7 | 72.0% | $187.4 | 2,200+ |
| FY24 | $937.4 | $247.0 | 73.7% | $258.6 | 2,895 |
| FY25 | $1,249.2 | $298.3 | 76.1% | $299.7 | 3,500+ |
| **FY26** | **$1,618.6** | **$376.5** | **76.7%** | **$344.6** | **4,100+** |

Per FY25 10-K verbatim, cost of revenue "consists primarily of the amortization of IoT device costs associated with subscription agreements, cellular-related costs, **third-party cloud infrastructure expenses**, customer support costs, warranty charges, and operational costs..." **No discrete cloud/hosting line is disclosed.** Cellular connectivity (dual-SIM 4G LTE on every gateway with multi-network roaming) is bundled inside the same line.

### CapEx (asset-light)

| Year | CapEx | % of revenue |
|------|-------|--------------|
| FY22 | ~$11M | ~2.6% |
| FY23 | ~mid-single-digit M | <1% |
| FY24 | ~$11M | ~1.2% |
| FY25 | $20.2M (+84% YoY) | 1.6% |
| FY26 | not separately tabulated; PP&E net rose $58.2M → $81.6M | implied gross >$20M |

CapEx is dominated by IoT inventory tooling, leasehold improvements at 1 De Haro Street SF HQ build-out, and capitalized internal-use software — **not data-center hardware**. Samsara is a pure AWS tenant. Adjusted Free Cash Flow (the company's own non-GAAP metric) explicitly excludes the SF office build-out as non-recurring.

### Headcount

- 4,100+ FY26 (+~17% YoY); 3.3× since FY21 (1,249).
- Engineering offices: San Francisco HQ + London + Mexico City + Atlanta + Taiwan + India + France + Germany + Poland + Benelux (per FY26 10-K).
- **Engineering / firmware / ML headcount is NOT disclosed at any year.** R&D expense ($344.6M FY26) is the only public "tech" proxy.

## 2. Frontend stack

- **Web dashboard / fleet manager UI**: Vue.js (per 2025 Sr. Growth Engineer job posting: "Our stack includes Python for back-end development, JavaScript (Vue) for the front end, and AWS for infrastructure.").
- **Mobile**: native iOS (Swift) + native Android (Kotlin) — Driver App, fleet manager apps.
- **Edge / dashcam UX**: real-time in-cab voice coaching driven by on-device ML inference under sub-second latency + power-budget constraints. Per the 2021/2022 edge-inference blog: *"the safety-critical aspect of this product demands low latency ML inference on-device. Round-trip network latency and spotty cellular coverage eliminate the possibility of implementing these features in the cloud entirely."*

## 3. Backend stack

- **Primary backend language**: **Go**. Per "Data Pipelines at Samsara" (eng blog): *"Go is one of the primary languages we use at Samsara. Therefore, we have a bunch of tooling for generating Terraform projects from Go."*
- **Firmware**: **C and Go** running on smartphone-class IoT SoCs. Per "How Samsara Engineers Work" (2024): *"Firmware engineers write C and Go that run on these devices."*
- **Growth-team / web stack**: Python (Flask) + Vue.js per 2025 careers postings.
- **Cross-stack interface format**: Protocol Buffers (firmware ↔ backend).
- **Architecture pattern**: Heavily Go microservices + AWS-native services. VPC-isolated compute, IP/port firewalls, RSA-key admin access (per security page). DDoS mitigation via AWS ELB + high-availability DNS.

## 4. Data & storage

- **Real-time ingestion**: **AWS Kinesis** (per engineering culture blog, 2024). Custom in-house infra "to ensure high uptime and latency guarantees."
- **Data warehouse**: **Spark** + **Databricks** + **Delta Lake** ("Our data warehouse is a Spark platform built on AWS. For data persistence, we utilize Delta Lake.").
- **Pipeline orchestration**: **AWS Step Functions** for serverless DAGs; pipelines defined via internal Go-based DSL.
- **IaC**: **Terraform** (generated from Go-based tooling).
- **OLTP / cache**: NOT publicly disclosed in fetched corpus. Samsara's security page describes "logically separated across distributed databases" without naming the engine. NEEDS_RESEARCH.
- **Search engine**: NOT publicly disclosed.
- **Vector DB**: NOT publicly disclosed.

## 5. Infrastructure topology

- **Sole cloud: AWS.** Samsara's security page: *"Samsara's underlying infrastructure leverages Amazon AWS."* The FY25 10-K explicitly flags this as a **single-vendor concentration risk**: *"we rely upon Amazon for AWS web hosting, and we do not currently have an alternative provider."*
- All encryption keys managed via **AWS KMS**.
- Multi-tenant SaaS with logical data separation; distributed-by-design compute spread across multiple physical servers (per security page).
- **Geographic AWS-region footprint**: NOT publicly disclosed (10-K mentions GDPR + SCCs but not specific regions). NEEDS_RESEARCH.
- **CDN**: NOT publicly named in fetched corpus.
- **Observability stack**: NOT publicly disclosed.

## 6. AI / ML stack

Three layers per the FY26 10-K product narrative: **Data → Applications → Agents**. ~40+ AI detections shipped on dashcams as of FY26.

### Edge inference (dashcams)

- Models trained in **TensorFlow** + **PyTorch**, converted to **TFLite**, **TensorRT**, or **SNPE** for on-device execution on smartphone-class SoCs in CM31/CM32-series and successor cameras.
- Latency-critical path: in-cab voice coaching + dynamic alert adjustment must respond sub-second to driver behavior. Cloud round-trip is explicitly ruled out by the platform's design.

### Cloud training & batch inference

- Built on **Ray + KubeRay** since ~2023 ("Building a Modern Machine Learning Platform with Ray," Aug 2023). Replaces earlier ad-hoc per-team setups. Samsara presented at Ray Summit 2023.
- *"While switching from Ray's cloud VM deployment for development to Kubernetes-KubeRay in production, the underlying compute backbone is abstracted away."* — applied scientists own end-to-end workflows.
- Foundation models used **for product ideation + bootstrap labeling**, not as user-facing endpoints. As of mid-2023 (Diginomica interview with then-AI lead Evan Welbourne), Samsara was *experimenting with LLMs* but framed them as "one ingredient" alongside in-house ML; **no third-party LLM vendor named** in any 10-K through FY26.

### Agents layer (FY26 launch)

- Per FY26 10-K: *"Our Safety Agent analyzes safety risks—synthesizing data from video, weather, and safety records—to execute real-time voice coaching and dynamically adjust safety alerts based on environmental conditions."*
- Marketed as the platform's third tier. **Underlying model providers (OpenAI / Anthropic / Bedrock) NOT named publicly.**
- The FY26 10-K also notes: *"increasingly integrating artificial intelligence and machine learning across our research and development organization to enhance productivity"* — internal-use LLM tooling for engineering productivity.

`gpu_exposure: rents_spot` — AWS managed-service GPU access for Ray/KubeRay training; no owned cluster signal; no multi-year reserved-GPU partnership disclosed.
`inference_pattern: edge` — the load-bearing inference pattern is on-device dashcam ML; cloud inference exists but is secondary to the safety-critical edge path.

## 7. Math priors commentary

**Emitted**:
- `throughput_priors`:
  - `data_points_per_year_fy26` — 25T data points/yr → ~792k events/sec sustained (confidence 0.80; 10-K disclosed; one of the strongest publicly-disclosed B2B IoT ingestion-rate anchors at this scale).
  - `video_minutes_per_year_2024` — ~38B minutes of dashcam video/yr → ~72k video-seconds-of-content-ingested per real-time second (confidence 0.65; engineering blog 2024 era; pre-FY26 scale-up).

**Not emitted**:
- **`latency_priors`** — Samsara explicitly states edge inference must be sub-second + cloud round-trip is ruled out, but **no numeric p50/p95/p99 anchor is disclosed**. No public latency budget for in-cab voice coaching, dashcam detection inference, ingestion pipeline, or web-dashboard p95. NEEDS_RESEARCH (likely never publicly disclosed at company-blog tier given the safety-critical / regulatory context).
- **`availability_priors`** — **No customer-facing public uptime SLA % is published** in any 10-K, marketing site, or blog. Samsara holds **SOC 2 Type 2** + four ISO 27001-family certifications (FY26 10-K) but the actual attained uptime number is not quoted. Cannot defensibly emit a numeric availability prior.
- **`cost_curves`** — Samsara doesn't publish per-seat or per-data-point pricing curves; subscription pricing is sales-led / undisclosed.
- **AWS-spend dollar split** — bundled inside cost-of-revenue ($376.5M FY26) alongside IoT-device amortization + cellular + support + warranty. No separate cloud/hosting line. Concentration: AWS is the *sole* hosting provider per FY25 10-K risk language, but no commitment value or EDP discount is shared.
- **Cellular spend** — material given dual-SIM 4G LTE on every gateway with multi-network roaming, but bundled in cost-of-revenue with no dollar split.
- **GPU spend / training compute hours / specific 3rd-party LLM vendor relationships** — none disclosed publicly through FY26.

## 8. Staleness & provenance

This entry was authored from a **single compiled raw-research.md document** (`07-uncategorized/raw/samsara/samsara.md`, sha256 `d563e316db7fd568a515cc04c76d88359d80df02d491eb72910aafe24581a8eb`) — a multi-year synthesis spanning Samsara S-1, 10-Ks (FY22 → FY26), Q4 8-Ks (FY22 → FY26), Samsara engineering blog (samsara.com/blog), Samsara R&D Medium index, security page, AWS Marketplace listing, AI marketing page, careers postings, and trade-press coverage. All citations carry `bytes_integrity: webfetch_only_no_raw_html` with `content_sha256` matching the compiled-research SHA. **`data_quality_grade: Q2`** — the raw research carries proper per-URL footnoted citations with publish_dates + URL anchors (not narrative-only); per-URL byte verification is the v2.2 enrichment to lift to Q1.

**Note on file location:** the raw research was relocated from `samsara_research.md` (atlas root) to the canonical `07-uncategorized/raw/samsara/samsara.md` path on 2026-04-26 with explicit user authorization, matching the layout used for prior curator passes (roblox, atlassian, etsy, dropbox, netflix, uber). SHA-256 `d563e316…` is the bytes-of-record for both pre-move and post-move (content untouched).

**Future enrichment** (recommended v2.2 curator pass):
1. Per-URL fetch of SEC EDGAR primary documents (FY26 8-K, FY25 10-K PDF, FY22 S-1, all Q4 8-Ks) — compute per-URL `sha256` (raw bytes) + `content_sha256` (extracted body).
2. Per-URL fetch of samsara.com/blog engineering posts — same hash discipline.
3. Replace the placeholder `d563e316…` SHA on each citation with its per-URL hash.
4. Bump `data_quality_grade: Q2 → Q1`.
5. Investigate undisclosed bands: OLTP engine, search engine, observability stack, AWS region footprint.

## 9. Sources

### Tier A — SEC filings & 8-Ks

1. **Samsara S-1** (Dec 2021 IPO prospectus) — https://www.sec.gov/Archives/edgar/data/1642896/000119312521334578/d261594ds1.htm — FY21/FY22 financials, IoT device shipments (>1.5M devices, >500K vehicles/equipment connected).
2. **Samsara FY22 10-K** — https://www.sec.gov/Archives/edgar/data/0001642896/000164289622000016/samsaraform10-kxq42022.htm — FY21/FY22 employee counts (1,249 → 1,616).
3. **Samsara FY24 10-K** (Financial Report XLSX) — https://www.sec.gov/Archives/edgar/data/0001642896/000164289624000016/Financial_Report.xlsx — FY22–FY24 cost of revenue + R&D series.
4. **Samsara FY25 10-K** (annual report PDF) — https://www.sec.gov/Archives/edgar/data/1642896/000164289625000048/iot2025ars.pdf — **Primary source** for cost-of-revenue prose verbatim, AWS sole-provider risk language, 3,500+ employees, 14T data points, R&D description.
5. **Samsara FY26 10-K** (Stocktitan mirror) — https://www.stocktitan.net/sec-filings/IOT/10-k-samsara-inc-files-annual-report-8c63bca30d34.html — **Primary FY26 source**: $1.62B revenue, 12,000+ Core (≥$25K), 3,194 $100K+, 4,100+ employees, 25T data points, Agents layer narrative.
6. **Samsara Q4 FY22 8-K** — https://www.sec.gov/Archives/edgar/data/0001642896/000164289622000008/samsaraepr-q42022.htm — FY22 ARR $558.1M, 806 $100K+.
7. **Samsara Q4 FY23 8-K** — https://www.sec.gov/Archives/edgar/data/1642896/000164289623000010/samsaraepr-q42023.htm — FY23 ARR $795M, 1,237 $100K+.
8. **Samsara Q4 FY24 8-K** — https://www.sec.gov/Archives/edgar/data/0001642896/000164289624000008/samsaraepr-q42024.htm — FY24 ARR $1.10B, 1,848 $100K+.
9. **Samsara Q4 FY25 8-K** — https://www.sec.gov/Archives/edgar/data/0001642896/000164289625000007/samsaraepr-q42025.htm — FY25 ARR $1.46B, 2,506 $100K+, FY25 cost of revenue $298.3M, R&D $299.7M.
10. **Samsara Q4 FY26 8-K** — https://www.sec.gov/Archives/edgar/data/0001642896/000162828026015170/samsaraepr-q42026.htm — **Headline FY26 source**: revenue $1,618.6M, cost of revenue $376.5M, R&D $344.6M, PP&E net $81.6M.

### Tier B — Samsara engineering blog & official pages

11. **"How Samsara Engineers Work"** — https://www.samsara.com/blog/samsara-engineering-culture — AWS Kinesis ingestion fabric, Spark, Databricks, ~2T → growing data points, ~38B minutes of video/yr, firmware engineers write C+Go.
12. **"Data Pipelines at Samsara"** — https://www.samsara.com/blog/data-pipelines-at-samsara — Go primary backend lang, AWS Step Functions DAG orchestration, Terraform IaC generated from Go, Spark + Delta Lake warehouse.
13. **"Building a Modern Machine Learning Platform with Ray"** (Aug 2023) — https://www.samsara.com/blog/building-a-modern-machine-learning-platform-with-ray — Ray + KubeRay adoption narrative, Ray Summit 2023 talk.
14. **"Hardware Accelerated Inference on Edge Devices"** — https://www.samsara.com/blog/hardware-accelerated-inference-on-edge-devices — TFLite / TensorRT / SNPE on dashcam SoCs; sub-second latency rationale.
15. **Samsara R&D on Medium** (ML team writeups index) — https://medium.com/samsara-engineering/tagged/machine-learning.
16. **Samsara Engineering category index** — https://www.samsara.com/blog/category/engineering-at-samsara.
17. **Samsara Security page** — https://www.samsara.com/legal/security — *"Samsara's underlying infrastructure leverages Amazon AWS"*; multi-tenant; AWS KMS; SOC 2 Type 2; distributed compute architecture statement.
18. **Samsara AI marketing page** — https://www.samsara.com/resources/ai-real-world-impact — petabyte-scale multimodal data; Privacy & Ethics Board.
19. **AWS Marketplace listing** — https://aws.amazon.com/marketplace/pp/prodview-cvbwvhml3j5ae — AWS-native delivery confirmation.
20. **Sr. Growth Engineer job posting** — https://www.samsara.com/company/careers/roles/7648713?gh_jid=7648713 — *"Our stack includes Python for back-end development, JavaScript (Vue) for the front end, and AWS for infrastructure."*

### Tier C — Press / analyst (corroboration only, never sole)

21. **Samsara Q3 FY26 8-K (BusinessWire press wire)** — https://www.businesswire.com/news/home/20251204222613/en/Samsara-Reports-Third-Quarter-Fiscal-Year-2026-Financial-Results — 2,990 $100K+, 164 $1M+ as of Q3 FY26 close.
22. **Tomasz Tunguz, "Samsara S-1: How 7 Key Benchmarks Stack Up"** — https://tomtunguz.com/samsara-s-1/ — IPO benchmarks.
23. **Wikipedia (Samsara company page)** — https://en.wikipedia.org/wiki/Samsara_(company) — IPO timing + ARR milestones.
24. **Diginomica — "Samsara's AI lead talks risks, use cases" (Welbourne, 2023)** — https://diginomica.com/samsaras-ai-lead-talks-risks-use-cases-and-explains-why-llms-arent-silver-bullet — LLM strategy as of mid-2023.
25. **Diginomica — Q3 FY25 results coverage** — https://diginomica.com/samsara-raises-full-year-guidance-large-customers-continue-buy-connected-operations.
26. **ERP Today — FY23 headcount (2,200+)** — https://erp.today/samsara-swings-highest-quarter-in-three-years-with-headcount-swell/.

### Tier D — Third-party financial aggregators (NOT sole; corroborate only)

27. **Stocktitan financials** — https://www.stocktitan.net/financials/IOT/ — FY25 R&D ($299.7M) + CapEx ($20.2M).
28. **Business Quant CapEx history** — https://businessquant.com/metrics/iot/capital-expenditures — quarterly CapEx FY21–FY25.
29. **DCFmodeling Samsara breakdown** — https://www.dcfmodeling.com/blogs/health/iot-financial-health — FY25 ARR/revenue summary.

## Curator notes

- **`data_quality_grade: Q2`** — raw research is properly footnoted with publish_dates + per-URL anchors across 29 sources spanning A/B/C/D tiers. Compiled-research SHA path is preserved as the bytes-of-record for this curator pass; per-URL re-fetch is the v2.2 enrichment to lift to Q1.
- **`scale.metric: paying_organizations` value 3194** — the canonical scale series across all six fiscal years is "customers >$100K ARR" (806 → 1,237 → 1,848 → 2,506 → 3,194). This is the only customer-band Samsara has disclosed every year; the >$1M ARR band started FY24, the ≥$10K Core band changed definition mid-FY26 to ≥$25K. Using >$100K as the canonical scale anchor preserves the time-series. **Migrated from `paying_subscribers` → `paying_organizations` per schema v1.2.0** (the new enum is an exact-fit for B2B paid-customer-org counts; was previously shoehorned into `paying_subscribers` which carries individual-subscriber semantics). The body table preserves all bands for reference.
- **`dau_band: unknown`** — Samsara is B2B; the platform's "user" abstraction is a connected asset/seat subscription. Samsara explicitly does not publish DAU/MAU. Honest assignment is `unknown` rather than back-computing from customer × seats-per-customer (no public seat count).
- **`revenue_usd_annual: 1,618,600,000`** — FY26 ($1,618.6M).
- **`infra_cost_usd_annual: 376,500,000`** — FY26 cost of revenue (the bundled line that contains "third-party cloud infrastructure expenses" alongside IoT device amortization, cellular, support, warranty, and operational costs). **NOT a pure cloud bill.** Pure AWS spend is undisclosed and likely meaningfully smaller; cellular alone is a real and growing line item.
- **`cost_band: 100m_1b_usd`** — defensible upper bound on FY26 cost-of-revenue ($376.5M). Pure AWS spend almost certainly fits inside `100m_1b_usd` as well given Samsara's asset-light SaaS economics + 76.7% gross margin.
- **`headcount_est: 4100`** — FY26 close (4,100+). Engineering-only is not disclosed at any fiscal year; multiple offices listed in FY26 10-K (SF HQ, London, Mexico City, Atlanta, Taiwan, India, France, Germany, Poland, Benelux). NEEDS_RESEARCH for engineering-only split if disclosed in future filings.
- **`archetype_tags: [go-microservices-at-scale, ai-native-inference-edge]`** — both strong fits.
  - `go-microservices-at-scale` — Samsara's primary backend language is Go (per their own blog) + Go-microservices on AWS is the dominant architecture pattern.
  - `ai-native-inference-edge` — the load-bearing inference pattern is on-device dashcam ML (sub-second voice coaching + 40+ AI detections), explicitly because cloud round-trip is ruled out for safety-critical paths. This is a stronger fit than `ai-training-gpu-fleet` (which would imply owned-cluster training).
  - **Schema-extension consideration:** a future tag like `iot-platform-edge-cloud` or `b2b-connected-operations` would more precisely characterize Samsara's hybrid cloud-native ingestion + on-device inference + AWS-only-tenancy architecture. NEEDS_RESEARCH (schema extension proposal for next pass).
- **`gpu_exposure: rents_spot`** — Samsara doesn't disclose GPU count or commitment; AWS is sole provider (10-K risk language); managed-service GPU access via Ray/KubeRay on EKS is consistent with `rents_spot`. Could defensibly be `rents_long_term` if a multi-year AWS EDP includes GPU reservation, but no disclosure exists.
- **`inference_pattern: edge`** — primary inference path (dashcam ML) is on-device. Cloud batch inference + the FY26 Agents layer exist but are secondary in load-bearing latency-critical sense. Could ALSO multi-tag to `streaming` for the Safety Agent's real-time voice coaching, but the enum is single-value; primary pattern is `edge`.
- **`utility_weight_hints` sum to 1.00** — B2B IoT/safety weighting: availability 0.25 dominant (fleet operations are 24/7 + downtime affects regulated commercial drivers + asset tracking), safety 0.20 (Safety Agent + commercial driver safety + DOT compliance is the company's value proposition), latency 0.15 (sub-second edge inference + real-time alerts), cost / quality / dev velocity / security 0.10 each.
- **NO `latency_priors`** — Samsara explicitly designs for sub-second edge inference but discloses no numeric p50/p95/p99 anchor. NEEDS_RESEARCH (likely never publicly disclosed at company-blog tier).
- **NO `availability_priors`** — Samsara holds SOC 2 Type 2 + four ISO 27001-family certifications but does not publish an attained uptime % or contractual SLA tier. Cannot defensibly emit a numeric availability prior.
- **TWO `throughput_priors` emitted** — both are tier-A or tier-B IC-authored, satisfying §6.3 prior-restriction rules. The 25T data points/yr figure is one of the stronger publicly-disclosed B2B IoT ingestion-rate anchors at this scale.
- **`infra.compute: [aws_ec2, kubernetes, kuberay, terraform_iac]`** — `aws_ec2`, `kubernetes`, `kuberay`, and `terraform_iac` are curator-shorthand stack tokens. NEEDS_RESEARCH: confirm these against `infraStackSchema.compute` token vocabulary on next curator pass; if any are problematic, swap for closest fits.
- **Fiscal-year handling**: Samsara's fiscal year ends the Saturday closest to Feb 1 (so FY26 ended Jan 31, 2026 — calendar-year-equivalent ≈ "mostly 2025"). All economics anchors use FY26. Care needed when comparing Samsara FY26 to e.g. Roblox FY25 (calendar-year).
- **AWS sole-provider risk** — FY25 10-K verbatim: *"we rely upon Amazon for AWS web hosting, and we do not currently have an alternative provider."* This is unique among the curated atlas — most public companies maintain multi-cloud or at minimum a multi-cloud roadmap. Worth flagging in M4 decision-utility comparisons.
