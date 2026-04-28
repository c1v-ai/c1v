---
slug: atlassian
name: Atlassian
kind: public
hq: Sydney, Australia
website: https://www.atlassian.com
last_verified: 2026-04-26
verification_status: partial
reviewer: curator@c1v-kb8-atlas
data_quality_grade: Q3
primary_source:
  tier: A_sec_filing
  source_url: https://www.sec.gov/Archives/edgar/data/0001650372/000165037224000036/team-20240630.htm
  anchor: "FY2024 10-K — cost of revenue components, FY24 financials, primary infrastructure narrative"
scale:
  metric: paying_subscribers
  value: 350000
  as_of: "2025"
  citation:
    kb_source: atlassian
    source_url: https://www.sec.gov/Archives/edgar/data/0001650372/000165037225000028/ex991q4fy25.htm
    source_tier: A_sec_filing
    publish_date: 2025-08-01
    retrieved_at: 2026-04-26T19:20:21Z
    sha256: 5223a80c09799e9e178a8b9a6ee57561af844ea7c023ee5fb43e0a7d99fdae33
    bytes_integrity: webfetch_only_no_raw_html
    content_sha256: 5223a80c09799e9e178a8b9a6ee57561af844ea7c023ee5fb43e0a7d99fdae33
    anchor: "Q4 FY25 8-K — 350K+ total customers, 51,978 Cloud customers >$10K ARR, 2.3M AI MAU; raw-research.md compiled-source anchor"
    corroborated_by: []
dau_band: 1m_10m
revenue_usd_annual: 5215000000
infra_cost_usd_annual: 894851000
cost_band: 100m_1b_usd
headcount_est: 13813
economics_citations:
  - kb_source: atlassian
    source_url: https://www.sec.gov/Archives/edgar/data/0001650372/000165037225000028/ex991q4fy25.htm
    source_tier: A_sec_filing
    publish_date: 2025-08-01
    retrieved_at: 2026-04-26T19:20:21Z
    sha256: 5223a80c09799e9e178a8b9a6ee57561af844ea7c023ee5fb43e0a7d99fdae33
    bytes_integrity: webfetch_only_no_raw_html
    content_sha256: 5223a80c09799e9e178a8b9a6ee57561af844ea7c023ee5fb43e0a7d99fdae33
    anchor: "FY25 results — revenue $5,215M, cost of revenue $894.9M (~83% gross margin), R&D $2,669M, headcount 13,813"
    corroborated_by: []
  - kb_source: atlassian
    source_url: https://www.sec.gov/Archives/edgar/data/0001650372/000165037224000036/team-20240630.htm
    source_tier: A_sec_filing
    publish_date: 2024-08-29
    retrieved_at: 2026-04-26T19:20:21Z
    sha256: 5223a80c09799e9e178a8b9a6ee57561af844ea7c023ee5fb43e0a7d99fdae33
    bytes_integrity: webfetch_only_no_raw_html
    content_sha256: 5223a80c09799e9e178a8b9a6ee57561af844ea7c023ee5fb43e0a7d99fdae33
    anchor: "FY24 10-K — cost of revenue 'primarily consists of...hosting our cloud infrastructure, which includes third-party hosting fees and depreciation associated with computer equipment and software'"
    corroborated_by: []
frontend:
  web: [react, typescript, atlaskit_design_system]
  mobile: [swift, kotlin]
backend:
  primary_langs: [java, kotlin, node_js, python, go, scala]
  frameworks: [spring_boot, express]
  runtimes: [jvm, node_js, cpython, v8_isolates_forge]
data:
  oltp: [aws_rds_postgres, aws_aurora_postgres]
  cache: [redis]
  warehouse: [s3, internal_socrates_data_platform]
  search: [elasticsearch]
  queue: [kafka, sqs]
infra:
  cloud: [aws, gcp]
  compute: [aws_cloudformation, kubernetes_micros, gke, ai_hypercomputer_tpu_gpu]
  cdn: []
  observability: []
ai_stack:
  training_framework: [pytorch]
  serving: [openai_gpt_5, anthropic_claude_4, anthropic_claude_3_5_sonnet, google_gemini_3_flash, meta_llama, mistral, atlassian_inference_engine]
  evals: [internal_a_b_tests, llm_as_judge_gpt_4o_mini, icse_2026_paper_pr_cycle_time]
  fine_tune: [post_training_on_gke_ai_hypercomputer]
  rag: [internal_ai_gateway_router]
gpu_exposure: rents_long_term
inference_pattern: streaming
latency_priors: []
availability_priors:
  - anchor: premium_sla_monthly_uptime
    description: "Premium plan SLA: 99.90% monthly uptime, financially backed via service credits per Atlassian Legal. Enterprise plan SLA: 99.95%. Standard plans have no published SLA. The April 2022 outage (775 customers / 883 sites deleted by mis-scoped maintenance script; up to 14 days down) is the binding incident behind subsequent reliability investments."
    citation:
      kb_source: atlassian
      source_url: https://www.atlassian.com/legal/sla
      source_tier: B_official_blog
      publish_date: 2024-01-01
      retrieved_at: 2026-04-26T19:20:21Z
      sha256: 5223a80c09799e9e178a8b9a6ee57561af844ea7c023ee5fb43e0a7d99fdae33
      bytes_integrity: webfetch_only_no_raw_html
      content_sha256: 5223a80c09799e9e178a8b9a6ee57561af844ea7c023ee5fb43e0a7d99fdae33
      anchor: "Atlassian Cloud SLA — Premium 99.90% / Enterprise 99.95%"
      corroborated_by: []
    confidence: 0.85
    verification_status: partial
    result_kind: scalar
    value: 0.999
    units: fraction
    measurement: target_monthly
    window: "FY2024+ Premium-tier contractual"
  - anchor: enterprise_sla_monthly_uptime
    description: "Enterprise plan SLA: 99.95% monthly uptime."
    citation:
      kb_source: atlassian
      source_url: https://www.atlassian.com/legal/sla
      source_tier: B_official_blog
      publish_date: 2024-01-01
      retrieved_at: 2026-04-26T19:20:21Z
      sha256: 5223a80c09799e9e178a8b9a6ee57561af844ea7c023ee5fb43e0a7d99fdae33
      bytes_integrity: webfetch_only_no_raw_html
      content_sha256: 5223a80c09799e9e178a8b9a6ee57561af844ea7c023ee5fb43e0a7d99fdae33
      anchor: "Atlassian Cloud SLA — Enterprise 99.95%"
      corroborated_by: []
    confidence: 0.85
    verification_status: partial
    result_kind: scalar
    value: 0.9995
    units: fraction
    measurement: target_monthly
    window: "FY2024+ Enterprise-tier contractual"
  - anchor: cloud_enterprise_measured_availability
    description: "Atlassian's 'Cloud Enterprise: the key to global scale and reliability' blog claimed 'over 99.99% availability for our cloud products' averaged across customers in a recent six-month window. This is a blog claim of measured attainment, not a contractual SLA — separate from the 99.90/99.95% legal targets above."
    citation:
      kb_source: atlassian
      source_url: https://www.atlassian.com/blog/platform/cloud-enterprise-global-scale-reliability
      source_tier: B_official_blog
      publish_date: 2024-06-01
      retrieved_at: 2026-04-26T19:20:21Z
      sha256: 5223a80c09799e9e178a8b9a6ee57561af844ea7c023ee5fb43e0a7d99fdae33
      bytes_integrity: webfetch_only_no_raw_html
      content_sha256: 5223a80c09799e9e178a8b9a6ee57561af844ea7c023ee5fb43e0a7d99fdae33
      anchor: "Cloud Enterprise — 'over 99.99 percent availability' averaged across customers"
      corroborated_by: []
    confidence: 0.65
    verification_status: partial
    result_kind: scalar
    value: 0.9999
    units: fraction
    measurement: blog_claim_six_month_avg
    window: "2024 ~6-month window cited in blog post"
throughput_priors:
  - anchor: production_deploys_per_day
    description: "Internal PaaS Micros (AWS CloudFormation + Kubernetes) runs '2000+ services in production' with '~5,500 service deployments daily' — equivalent to one production deploy every ~15 seconds. Multi-account-strategy blog (Jan 2025), is_ic=true."
    citation:
      kb_source: atlassian
      source_url: https://www.atlassian.com/blog/atlassian-engineering/multi-account-strategy
      source_tier: B_official_blog
      publish_date: 2025-01-15
      retrieved_at: 2026-04-26T19:20:21Z
      sha256: 5223a80c09799e9e178a8b9a6ee57561af844ea7c023ee5fb43e0a7d99fdae33
      bytes_integrity: webfetch_only_no_raw_html
      content_sha256: 5223a80c09799e9e178a8b9a6ee57561af844ea7c023ee5fb43e0a7d99fdae33
      anchor: "Multi-account strategy — 2000+ services, ~5,500 production deploys/day"
      is_ic: true
      corroborated_by: []
    confidence: 0.80
    verification_status: partial
    result_kind: scalar
    value: 0.064
    units: deploys_per_second
    measurement: sustained_avg
    window: "2025-Q1 Micros production"
  - anchor: jira_postgres_database_count
    description: "~4 million per-tenant PostgreSQL databases across ~3,000 RDS/Aurora instances in 13 AWS regions. Late-2023 → 2025 fleet replatform from RDS to Aurora migrated 2.6M databases (peak 90,000 dbs/day) across 2,403 RDS instances."
    citation:
      kb_source: atlassian
      source_url: https://www.atlassian.com/blog/atlassian-engineering/migrating-jira-database-platform-to-aws-aurora
      source_tier: B_official_blog
      publish_date: 2025-07-15
      retrieved_at: 2026-04-26T19:20:21Z
      sha256: 5223a80c09799e9e178a8b9a6ee57561af844ea7c023ee5fb43e0a7d99fdae33
      bytes_integrity: webfetch_only_no_raw_html
      content_sha256: 5223a80c09799e9e178a8b9a6ee57561af844ea7c023ee5fb43e0a7d99fdae33
      anchor: "Migrating Jira DB platform to Aurora — 4M DBs, 13 regions, 2.6M migrated"
      is_ic: true
      corroborated_by: []
    confidence: 0.85
    verification_status: partial
    result_kind: scalar
    value: 4000000
    units: databases
    measurement: count
    window: "2025-Q3 Jira tenant fleet"
cost_curves: []
utility_weight_hints:
  latency: 0.10
  cost: 0.15
  quality_bench: 0.10
  availability: 0.25
  safety: 0.10
  developer_velocity: 0.20
  security_compliance: 0.10
archetype_tags: [ai-inference-as-a-service, developer-platform-saas]
related_refs: []
nda_clean: true
ingest_script_version: "2.1.0"
---

# Atlassian

Publicly traded (NASDAQ: TEAM, IPO Dec 2015 — first major Australian-founded tech company on NASDAQ). Software for team collaboration: Jira (issue tracking), Confluence (wiki/docs), Bitbucket (source code), Trello (kanban), Loom (video messaging, acquired Oct 2023), Statuspage, Opsgenie. Headline metrics: **total customers**, **Cloud customers >$10K ARR**, **>$1M ACV customers**, and (newer) **AI MAU (Rovo)**. Atlassian does NOT publish company-wide MAU for Jira/Confluence — they say internally MAU is "tracked as a leading indicator of revenue" but not disclosed.

**Fiscal year ends June 30.** "FY25" = Jul 2024 – Jun 2025; FY26 in progress (Q1 + Q2 disclosed; full-year due Aug 2026).

## 1. Scale & economics (FY2025, ending Jun 30, 2025)

- **Total customers**: 350K+ (most recent IR-site disclosure; up from 236K end-FY21).
- **Cloud customers >$10K ARR**: 51,978 (FY25; up from 45,842 FY24).
- **AI MAU (Rovo)**: 2.3M (FY25 close), then 5M+ as of Mar 2026 CEO note.
- **>$1M ARR customers**: "600+" as of Q2 FY26 (Dec 2025); FY24 disclosed 524.
- **Revenue**: $5,215M (FY25; +20% YoY).
- **Cost of revenue**: $894.9M (~83% gross margin). Per FY24 10-K verbatim, this line "primarily consists of expenses related to compensation expenses for our employees, including stock-based compensation, **hosting our cloud infrastructure, which includes third-party hosting fees and depreciation associated with computer equipment and software**, payment processing fees, consulting and contractors costs…amortization of acquired intangible assets…certain IT program expenses, and facilities and related overhead costs." **No discrete "infrastructure" or "cloud hosting" line item is disclosed.**
- **R&D**: $2,669M (FY25); TTM through Q2 FY26 ~$2.97B.
- **Headcount YE25**: 13,813 (+14% YoY from 12,157 FY24).
- **March 2026 layoffs**: ~1,600 cut (~10% of workforce); ~900 of those in software R&D. CEO Mike Cannon-Brookes' framing: "self-fund further investment in AI and enterprise sales." Per Jefferies + company commentary, "more than half" of pre-cut headcount was in software engineering and design.
- **CapEx**: $44.85M FY25 (TTM Q2 FY26 ~$52.8M). **Asset-light by design** — Atlassian rents everything from AWS/GCP and has never had a CapEx ramp resembling hyperscaler AI infrastructure spending. CapEx peaked at $70.6M FY22 (likely office build-out), <$75M every year since FY21.

## 2. Frontend stack

- **Web**: React + TypeScript + internal **Atlaskit** design system (closed source; public docs at atlaskit.atlassian.com).
- **Data Center products**: upgrading React 18 → React 19 in current major releases (Apr 2026).
- **Forge** (cloud app platform): JavaScript/TypeScript on a v8 sandboxed serverless runtime; key-value store + scheduled triggers; custom UIs run in sandboxed iframes with Atlassian-controlled CSP.
- **Mobile**: Swift (iOS), Kotlin (Android).

## 3. Backend stack

Per Atlassian's own "Cloud Engineering Overview" (2024): three standard backend cloud-service tech stacks — **Java/Kotlin**, **Node.js**, **Python**.

- **Frameworks**: Spring Boot (JVM), Express (Node.js).
- **Runtimes**: JVM, Node.js, CPython, v8 isolates (Forge).
- **Polyglot mix** (per job postings): Java primary + Kotlin/Scala/Python/Go/JavaScript. Trello historically Node.js + CoffeeScript per their classic blog post.

## 4. Data & storage

- **Primary OLTP**: **PostgreSQL on AWS** — both RDS PostgreSQL and Aurora PostgreSQL Compatible Edition.
- **Architecture**: **one database per Jira tenant** — ~4 million PostgreSQL databases across ~3,000 instances in 13 AWS regions (per Atlassian's Jul 2025 engineering blog).
- **Aurora migration**: late 2023 → 2025 replatform from RDS to Aurora — by 2025 had migrated 2.6M databases across 2,403 RDS instances (peak ~90,000 dbs/day). Justified by "bold cost, reliability and performance objectives."
- **Reserved Instances**: Atlassian uses AWS RDS 1-yr + 3-yr Reserved Instances as a cost-optimization lever (per AWS RDS case study).
- **Backups**: Amazon RDS daily snapshots with 30-day retention + point-in-time recovery; quarterly backup tests; Bitbucket storage snapshots retained 7 days.
- **Data platform**: internal "Socrates" unified data ingestion platform.
- **Cache**: Redis. **Search**: Elasticsearch. **Queue**: Kafka + AWS SQS.

## 5. Infrastructure topology

- **AWS-primary since 2016**. **Aug 2025 multi-year Google Cloud partnership** announced — Jira, Confluence, Loom going to Google Cloud's AI-optimized infrastructure; Atlassian apps in Google Cloud Marketplace; Rovo deeply integrated with Vertex AI + Gemini.
- **Apr 22, 2026 (Cloud Next '26)**: partnership expanded — Atlassian now running **Rovo training + inference on GKE + Google Cloud AI Hypercomputer (TPUs + GPUs)**. Gemini 3 Flash powers select Rovo capabilities. Atlassian explicitly frames itself as "open, multi-model and multi-cloud."
- **Internal PaaS = Micros**: sits on top of **AWS CloudFormation + Kubernetes**. Containerized microservices, deployed via Micros for the bulk of products (Jira, Confluence, Jira Product Discovery, Statuspage, Guard, Bitbucket).
- **Non-Micros platform**: Trello + Opsgenie run on a separate platform.
- **Operational scale**: 2,000+ production services, ~5,500 deployments daily (~1 production deploy every 15 seconds; per Jan 2025 multi-account-strategy blog).
- **CDN / edge provider**: NOT publicly disclosed in materials reviewed. AWS is the underlying cloud but a specific edge product (CloudFront vs. third-party) was not called out.

## 6. AI / ML stack

Atlassian operates an **internal AI Gateway** (centralized model router) implementing a **Hybrid LLM strategy**:

- **Multi-vendor frontier serving**: OpenAI GPT (incl. **GPT-5** — powers Rovo Dev coding orchestration), Anthropic Claude (incl. **Claude 4 / Opus 4.7** — powers Rovo Deep Research's planning), Google Gemini, Meta Llama-family, Mistral.
- **Atlassian-hosted open models**: Llama, Phi, Mixtral.
- **Self-hosted Inference Engine** (Aug 2025 disclosure): "custom-built, self-hosted AI inference platform that powers everything from search models to content moderation" with custom GPU cluster provisioning, model rollouts, observability.
- **Code review**: Rovo Dev Code Reviewer runs on **Anthropic Claude 3.5 Sonnet** with a `gpt-4o-mini` "LLM-as-a-judge" filter. ICSE'26 paper claims 30.8% PR cycle-time reduction across 1,900+ repos.
- **Training vs inference split**: Atlassian doesn't appear to do foundation-model **pre-training**. As of Apr 2026, "key Rovo training workloads are already running on GKE + AI Hypercomputer." Verdict: **post-training/fine-tuning** of frontier + open models on GCP, while inference is multi-vendor (OpenAI, Anthropic, Google) plus the self-hosted Inference Engine for smaller models.

`gpu_exposure: rents_long_term` (multi-year GCP partnership for AI Hypercomputer + AWS for general compute; no owned-cluster signal).
`inference_pattern: streaming` (Rovo conversational + Dev Code Reviewer real-time).

## 7. Math priors commentary

**Emitted**:
- `availability_priors`: 99.90% Premium SLA (confidence 0.85), 99.95% Enterprise SLA (confidence 0.85), 99.99% blog-claimed measured 6-month average (confidence 0.65 — blog claim ≠ contractual).
- `throughput_priors`: 5,500 deploys/day → 0.064 deploys/sec sustained (confidence 0.80; rare publicly-disclosed deploy-cadence anchor); 4M PostgreSQL databases across 3,000 RDS/Aurora instances in 13 regions (confidence 0.85; the disclosed Aurora migration is one of the largest publicly-documented PostgreSQL fleet migrations).

**Not emitted**:
- **Pure infrastructure/cloud spend dollar split** — never broken out. Cost of revenue ($894.9M FY25) bundles hosting + depreciation + payment processing + amortization + IT + facilities.
- **AWS vs GCP spend split** — multi-year GCP partnership announced Aug 2025 + expanded Apr 2026, but no dollar commitments are public.
- **Engineering-only headcount per fiscal year** — only total + qualitative "more than half is software engineering and design" framing from the Mar 2026 layoff disclosure.
- **Loom MAU exact** — only "growing more than 30% YoY" was disclosed FY25.
- **Latency priors** for Jira/Confluence page-load, API p95, AI Gateway router p95 — not disclosed.
- **Cost curves** — Atlassian doesn't publish per-seat or per-API-call infra unit pricing.

**Outage anchor**: April 2022 incident — a maintenance script intended to delete a deprecated standalone Insight app was given site-level IDs instead of app-level IDs, deleting 883 sites belonging to 775 customers over 23 minutes. Restoration took up to ~14 days for the worst-affected customers. Atlassian's own Post-Incident Review (May 2022) is the authoritative source. Action items: stricter API safety (separate destructive endpoints, type validation), 24/7 global incident communication team, faster bulk-restoration tooling. **This incident is the binding context for the 99.90/99.95 SLA tier framework introduced subsequently.**

## 8. Staleness & provenance

This entry was authored from a **single compiled raw-research.md document** (`07-uncategorized/raw/atlassian/atlassian.md`, sha256 `5223a80c09799e9e178a8b9a6ee57561af844ea7c023ee5fb43e0a7d99fdae33`) rather than per-URL fetches. All citations carry `bytes_integrity: webfetch_only_no_raw_html` with `content_sha256` matching the compiled-research SHA. This yields `data_quality_grade: Q3` — honest grade for "narrative is sound, per-citation byte verification deferred to future curator pass."

**Future enrichment** (recommended v2.2 curator pass):
1. Fetch each source URL listed in §9 directly; compute per-URL `sha256` (raw HTML) + `content_sha256` (extracted article body).
2. Replace the placeholder `5223a80c…` SHA on each citation with its per-URL hash.
3. Bump `data_quality_grade: Q3 → Q2`.

## 9. Sources

### Tier A — SEC filings & shareholder letters

1. **Atlassian FY2024 Form 10-K** — https://www.sec.gov/Archives/edgar/data/0001650372/000165037224000036/team-20240630.htm — published 2024-08-29. **Primary source** for cost-of-revenue components verbatim, FY24 financials.
2. **Atlassian FY2024 Q4 8-K (Ex 99.1)** — https://www.sec.gov/Archives/edgar/data/1650372/000165037224000023/ex991q4fy24.htm — published 2024-08-01. Source for 300K+ customers, 45,842 Cloud >$10K ARR.
3. **Atlassian FY2025 Q4 8-K (Ex 99.1)** — https://www.sec.gov/Archives/edgar/data/0001650372/000165037225000028/ex991q4fy25.htm — published 2025-08-01. Source for FY25 full-year results, 51,978 Cloud >$10K ARR, 2.3M AI MAU.
4. **Atlassian FY2023 Annual Report** — https://www.sec.gov/Archives/edgar/data/0001650372/000165037223000054/team2023annualreport.pdf — published 2023. FY23 highlights, 250K+ Cloud customers.
5. **Atlassian FY2022 Q4 6-K (Ex 99.1)** — https://www.sec.gov/Archives/edgar/data/0001650372/000165037222000050/ex991q4fy22.htm — published 2022-08. FY22 customer/headcount/CapEx baseline.
6. **Atlassian FY2021 Q4 6-K (Ex 99.1)** — https://www.sec.gov/Archives/edgar/data/0001650372/000165037221000025/ex991q4fy21.htm — published 2021-08. FY21 baseline financials.
7. **Atlassian FY2025 Q2 8-K (Ex 99.1)** — https://www.sec.gov/Archives/edgar/data/0001650372/000165037225000005/teamq22025shareholderlet.htm — published 2025-02. Q2 FY25 headcount 12,750.

### Tier B — Atlassian engineering blog & trust docs

8. **Cloud architecture & operational practices** — https://www.atlassian.com/trust/reliability/cloud-architecture-and-operational-practices. AWS-primary since 2016, Micros, regions, encryption.
9. **Cloud Engineering Overview** — https://www.atlassian.com/blog/atlassian-engineering/cloud-overview. Java/Kotlin/Node/Python tech stacks, Forge, Micros.
10. **Multi-account strategy blog** (2026-01-15) — https://www.atlassian.com/blog/atlassian-engineering/multi-account-strategy. **2,000+ services, ~5,500 daily deploys** (= 1 deploy every 15s).
11. **Migrating Jira DB platform to AWS Aurora** (2025-07) — https://www.atlassian.com/blog/atlassian-engineering/migrating-jira-database-platform-to-aws-aurora. 4M PostgreSQL databases across 13 regions; 2.6M migrated; peak 90,000 dbs/day.
12. **AI Gateway / Model Garden** — https://www.atlassian.com/blog/atlassian-engineering/ai-gateway-model-garden. Multi-vendor LLM stack (OpenAI/Anthropic/Google/Meta/Mistral).
13. **Rovo Dev Code Reviewer** — https://www.atlassian.com/blog/artificial-intelligence/developer-productivity-improved-with-rovo-dev/amp. Claude 3.5 Sonnet + gpt-4o-mini judge; 30.8% PR cycle-time reduction.
14. **Atlassian Inference Engine** — https://community.atlassian.com/forums/Atlassian-AI-Rovo-articles/Introducing-Atlassian-s-Inference-Engine-Our-self-hosted-AI/ba-p/3084777. Self-hosted GPU inference platform (Aug 2025).
15. **Atlassian Cloud SLA (Legal)** — https://www.atlassian.com/legal/sla. **Premium 99.90% / Enterprise 99.95%** monthly uptime, financially backed.
16. **Cloud Enterprise: global scale & reliability** — https://www.atlassian.com/blog/platform/cloud-enterprise-global-scale-reliability. Blog claim of "over 99.99% measured availability" 6-month average.
17. **April 2022 outage Post-Incident Review** — https://www.atlassian.com/blog/atlassian-engineering/post-incident-review-april-2022-outage. 775 customers / 883 sites / up to 14 days outage; binding incident behind subsequent SLA + safety investments.

### Cloud partnerships & layoffs

18. **AWS RDS case study** — https://aws.amazon.com/solutions/case-studies/atlassian-case-study-rds/. RDS Reserved Instances, RDS→Aurora rationale (cost + reliability + performance).
19. **Atlassian + Google Cloud partnership** (Aug 7 2025) — https://www.googlecloudpresscorner.com/2025-08-07-Atlassian-and-Google-Cloud-Partner-to-Bring-AI-Powered-Productivity-to-Millions-of-Users-Worldwide. Multi-year, Vertex AI / Gemini.
20. **Atlassian + Google Cloud expansion** (Apr 22 2026, Cloud Next '26) — https://www.businesswire.com/news/home/20260422074555/en/Atlassian-Expands-Partnership-with-Google-Cloud-to-Power-Agentic-AI-for-Teams-Worldwide. GKE + AI Hypercomputer (TPUs + GPUs); Gemini 3 Flash.
21. **CEO Mike Cannon-Brookes layoff letter** (Mar 11, 2026) — https://www.atlassian.com/blog/announcements/atlassian-team-update-march-2026. ~1,600 cut (~10%); "self-fund further investment in AI and enterprise sales."
22. **TechCrunch coverage of layoffs** — https://techcrunch.com/2026/03/12/atlassian-follows-blocks-footsteps-and-cuts-staff-in-the-name-of-ai/. ~900 of cuts in R&D.
23. **InfoQ Aurora migration write-up** — https://www.infoq.com/news/2025/07/atlassian-jira-postgresql-aurora/.
24. **ByteByteGo Aurora migration write-up** — https://blog.bytebytego.com/p/how-atlassian-migrated-4-million.

### Adjacency / Triangulation

25. Yahoo Finance Atlassian cash-flow — https://finance.yahoo.com/quote/TEAM/cash-flow/.
26. StockAnalysis.com Atlassian statistics — https://stockanalysis.com/stocks/team/statistics/.
27. Macrotrends R&D + employees — https://www.macrotrends.net/stocks/charts/TEAM/atlassian/research-development-expenses ; https://www.macrotrends.net/stocks/charts/TEAM/atlassian/number-of-employees.

## Curator notes

- **`data_quality_grade: Q3`** — single compiled-research source; per-URL bytes not yet fetched + verified. Future curator pass would re-stamp per-URL `sha256` + `content_sha256`, lifting to Q2.
- **`scale.metric: paying_subscribers`** — best enum fit. Atlassian's headline is "total customers" (350K+) which is paying-customer-organizations, NOT a unique-user count. The closest enum semantics match this. NEEDS_RESEARCH for potential future `paying_organizations` or `paying_customers` enum extension. Would also defensibly use `monthly_active_users` for the AI MAU surface (5M Rovo) but the company-wide headline is customer-count-based.
- **`dau_band: 1m_10m`** — anchored on the only published MAU-class disclosure: Rovo AI MAU 2.3M (FY25) → 5M (Mar 2026). Atlassian itself says company-wide Jira/Confluence MAU is internally tracked but not published. With 350K+ customer-orgs averaging ~10–50 seats, total user count is likely tens of millions, putting true MAU likely in `10m_100m`. Conservative band assignment given the disclosure gap.
- **`cost_band: 100m_1b_usd`** — anchored on FY25 cost of revenue ($894.9M). Per FY24 10-K verbatim, this line bundles hosting + depreciation + payment processing + amortization + IT + facilities. **NOT a pure cloud bill** — Atlassian does not break out a discrete "infrastructure" or "cloud hosting" line. `100m_1b_usd` is defensible upper bound on cost-of-revenue; pure infra is undisclosed and likely meaningfully smaller.
- **`infra_cost_usd_annual`** — populated with FY25 cost-of-revenue ($894.9M) but the field name is misleading: this includes payment processing, amortization, facilities, etc. NEEDS_RESEARCH if filings or commentary ever disclose a cleaner infra-only split (FY21–FY26 to date have not).
- **`headcount_est: 13813`** — FY25 close (pre-March 2026 layoff). Post-layoff: ~12,213 (–10%). Engineering-only is not disclosed; "more than half" of pre-cut headcount was in software engineering and design per Mar 2026 disclosure.
- **`archetype_tags: [ai-inference-as-a-service, developer-platform-saas]`** — both reasonable fits.
  - `ai-inference-as-a-service` — AI Gateway routes to OpenAI/Anthropic/Google/Meta/Mistral + self-hosted Inference Engine; multi-vendor inference is THE architectural distinctive of FY25–FY26 Atlassian.
  - `developer-platform-saas` — Forge cloud app platform + Bitbucket + Jira + Confluence are developer-platform SaaS by archetype.
- **`gpu_exposure: rents_long_term`** — multi-year GCP partnership for Rovo training + AI Hypercomputer; not owned-cluster.
- **`inference_pattern: streaming`** — Rovo conversational + Dev Code Reviewer real-time. Could ALSO tag as `fine_tune_service` for the post-training pipeline on GCP, but the enum is single-value; primary pattern is streaming.
- **`utility_weight_hints` sum to 1.00** — B2B SaaS weighting: availability 0.25 dominant (the April 2022 incident is the binding context), developer velocity 0.20 (Forge ecosystem + 5,500 deploys/day Atlassian's own cadence), cost 0.15 (AWS RDS Reserved Instances + Aurora migration economics), latency/quality/safety/security 0.10 each.
- **NO `latency_priors`** — Jira/Confluence p95 page-load, AI Gateway router p95, Aurora query latency — none disclosed in fetched corpus. NEEDS_RESEARCH (likely never fully disclosed at company-blog tier).
- **NO `cost_curves`** — Atlassian doesn't publish per-seat or per-API-call infra unit pricing.
- **`infra.compute: [aws_cloudformation, kubernetes_micros, gke, ai_hypercomputer_tpu_gpu]`** — `kubernetes_micros`, `gke`, and `ai_hypercomputer_tpu_gpu` are curator-shorthand values. NEEDS_RESEARCH: confirm these against `infraStackSchema.compute` enum on next curator pass; if invalid, swap for closest fits + propose schema extensions.
- **Fiscal-year handling**: Atlassian's fiscal year ends June 30. All economics anchors use FY25 (Jul 2024 – Jun 2025). Calendar-year context: FY25 ≈ "mostly 2024" calendar. Care needed when comparing Atlassian FY25 to e.g. Roblox FY25 (calendar-year).
