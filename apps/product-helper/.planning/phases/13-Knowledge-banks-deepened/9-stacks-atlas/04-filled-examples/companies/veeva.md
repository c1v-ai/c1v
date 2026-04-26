---
slug: veeva
name: Veeva Systems
kind: public
hq: Pleasanton, California
website: https://www.veeva.com
last_verified: 2026-04-26
verification_status: partial
reviewer: curator@c1v-kb8-atlas
data_quality_grade: Q3
primary_source:
  tier: A_sec_filing
  source_url: https://www.sec.gov/Archives/edgar/data/0001393052/000139305226000014/veev-20260131.htm
  anchor: "FY2026 10-K (filed Mar 20 2026) — total revenue, paid-customer count, headcount, cost-of-subscription components, AWS+Salesforce cloud disclosure, qualitative infra-cost commentary"
scale:
  metric: paying_organizations
  value: 1552
  as_of: "2026"
  citation:
    kb_source: veeva
    source_url: https://www.sec.gov/Archives/edgar/data/0001393052/000139305226000014/veev-20260131.htm
    source_tier: A_sec_filing
    publish_date: 2026-03-20
    retrieved_at: 2026-04-26T19:57:22Z
    sha256: d0dd50c2c62eb27f486204012b6eee1616cc0d0c0d57a1d4e2acab4f80992054
    bytes_integrity: webfetch_only_no_raw_html
    content_sha256: d0dd50c2c62eb27f486204012b6eee1616cc0d0c0d57a1d4e2acab4f80992054
    anchor: "FY2026 10-K Item 1 ('Our Customers') — 1,552 paid customers (1,196 R&D & Quality + 767 Commercial; can overlap); raw-research.md compiled-source anchor"
    corroborated_by: []
dau_band: unknown
revenue_usd_annual: 3195300000
infra_cost_usd_annual: null
cost_band: undisclosed
headcount_est: 7928
economics_citations:
  - kb_source: veeva
    source_url: https://www.veeva.com/resources/veeva-announces-fourth-quarter-and-fiscal-year-2026-results/
    source_tier: B_official_blog
    publish_date: 2026-03-20
    retrieved_at: 2026-04-26T19:57:22Z
    sha256: d0dd50c2c62eb27f486204012b6eee1616cc0d0c0d57a1d4e2acab4f80992054
    bytes_integrity: webfetch_only_no_raw_html
    content_sha256: d0dd50c2c62eb27f486204012b6eee1616cc0d0c0d57a1d4e2acab4f80992054
    anchor: "FY2026 results press release — total revenue $3,195.3M, subscription revenue $2,684.2M, prior-year comparatives ($2,746.6M / $2,284.7M)"
    corroborated_by: []
  - kb_source: veeva
    source_url: https://www.sec.gov/Archives/edgar/data/0001393052/000139305226000007/veev-20260131q426xex991.htm
    source_tier: A_sec_filing
    publish_date: 2026-03-20
    retrieved_at: 2026-04-26T19:57:22Z
    sha256: d0dd50c2c62eb27f486204012b6eee1616cc0d0c0d57a1d4e2acab4f80992054
    bytes_integrity: webfetch_only_no_raw_html
    content_sha256: d0dd50c2c62eb27f486204012b6eee1616cc0d0c0d57a1d4e2acab4f80992054
    anchor: "FY2026 8-K Ex 99.1 — R&D expense $767.4M (vs $693.1M FY25), CapEx $29.1M (vs $20.5M FY25), employee total 7,928"
    corroborated_by: []
  - kb_source: veeva
    source_url: https://www.sec.gov/Archives/edgar/data/1393052/000139305225000022/veev-20250131.htm
    source_tier: A_sec_filing
    publish_date: 2025-03-26
    retrieved_at: 2026-04-26T19:57:22Z
    sha256: d0dd50c2c62eb27f486204012b6eee1616cc0d0c0d57a1d4e2acab4f80992054
    bytes_integrity: webfetch_only_no_raw_html
    content_sha256: d0dd50c2c62eb27f486204012b6eee1616cc0d0c0d57a1d4e2acab4f80992054
    anchor: "FY2025 10-K MD&A — qualitative infra commentary: '$21M increase related to computing infrastructure costs, driven by an increase in both the number of end users and the volume of activity' (the strongest publicly-disclosed YoY infra anchor in the corpus)"
    corroborated_by: []
frontend:
  web: [react, javascript, vault_custom_pages]
  mobile: [swift, kotlin]
backend:
  primary_langs: [java, apex_lightning_legacy_crm]
  frameworks: [spring_boot, spring_mvc]
  runtimes: [jvm_java_17, salesforce_platform_legacy]
data:
  oltp: [postgres, mysql, dynamodb]
  cache: []
  warehouse: [amazon_redshift]
  search: []
  queue: []
infra:
  cloud: [aws, salesforce_platform, private_cloud_china]
  compute: []
  cdn: []
  observability: []
ai_stack:
  training_framework: []
  serving: [anthropic_claude_on_bedrock, amazon_foundation_models_on_bedrock, customer_byo_bedrock, customer_byo_azure_ai_foundry, mcp_orchestration]
  evals: []
  fine_tune: []
  rag: [veeva_direct_data_api_rag, vault_data_grounding]
gpu_exposure: serverless
inference_pattern: streaming
latency_priors: []
availability_priors: []
throughput_priors: []
cost_curves: []
utility_weight_hints:
  latency: 0.10
  cost: 0.10
  quality_bench: 0.10
  availability: 0.25
  safety: 0.10
  developer_velocity: 0.10
  security_compliance: 0.25
archetype_tags: [vertical-saas-regulated-industry, scala-jvm-platform]
related_refs: []
nda_clean: true
ingest_script_version: "2.1.0"
---

# Veeva Systems

Publicly traded (NYSE: VEEV, IPO Oct 2013). Vertical-SaaS for life sciences (pharma + biotech + medical devices). Headline products: **Vault platform** (Quality, Clinical, RIM, Safety, PromoMats, MedComms, QualityDocs, and — since April 2024 — **Vault CRM**, replacing the legacy Salesforce-hosted Veeva CRM). Headline scale metric: **paid customers** (B2B; Veeva does NOT disclose DAU/MAU/seats).

**Fiscal year ends January 31.** "FY2026" = Feb 2025 – Jan 2026. All dollar figures USD.

## 1. Scale & economics (FY2026, ending Jan 31 2026)

- **Paid customers**: **1,552** (1,196 R&D & Quality + 767 Commercial; customers can be in both segments). Up from 993 at FY21 close (~56% over five fiscal years).
  - Sub-segment: **Vault CRM**: 115 customers live as of Q3 FY26 (Nov 2025); 125+ by Mar 2026 per industry analysis. **10 of the top 20 biopharmas** committed to Vault CRM globally as of FY26.
- **Total revenue**: **$3,195.3M** (FY26; +16.3% YoY from $2,746.6M FY25).
- **Subscription revenue**: **$2,684.2M** (FY26; +17.5% YoY from $2,284.7M FY25). Subscription revenue scaled ~127% from $1,179.5M FY21.
- **Cost of subscription services** (per FY26 10-K verbatim): "consists primarily of employee-related costs… **costs for hosted infrastructure providers**, allocated overhead, software license fees, professional/data-center fees." **No discrete "infrastructure" or "cloud hosting" line item is disclosed.**
- **R&D expense**: **$767.4M** (FY26) — also bundles "**hosted infrastructure costs**" per 10-K verbatim. Up from $294.2M FY21 (~161% over five years).
- **Total worldwide employees YE26**: **7,928** (+8.7% YoY from 7,291 FY25). Up ~76% from 4,506 FY21.
- **Engineering-only headcount**: **NOT disclosed** in any 10-K. Veeva's careers site lists Java + JS/React + iOS/Android + DevOps + Performance + Data engineering teams without absolute counts.
- **CapEx FY26**: **$29.1M** (peak; ~0.9% of revenue). Five-year FY21–FY25 average ~$16.6M/yr (range $8.7M FY21 → $26.2M FY24). **Asset-light by design** — Veeva owns no data centers; all infrastructure is leased from AWS (and Salesforce for legacy CRM, sunsetting Dec 31 2029).

**FY25 (ending Jan 31 2025) infra-cost anchor — the only quantitative infra anchor in the corpus**: 10-K MD&A discloses an **"increase of $21M related to computing infrastructure costs, driven by an increase in both the number of end users and the volume of activity."** This is a YoY *change* commentary, not an absolute infra cost. Absolute annual cloud/AWS spend is **never disclosed in any year** FY21–FY26.

## 2. Frontend stack

- **Web**: React.js (per Veeva careers site, 2021–2026); Vault Custom Pages (for tenant-side extensions on the Vault platform).
- **Mobile**: native iOS (Swift) and Android (Kotlin). The mobile field-rep app provides continuity for ~80% of pharma sales reps across the Veeva CRM → Vault CRM migration.
- **CDN/edge**: not publicly disclosed; standard AWS edge services per 10-K Item 1 cybersecurity prose.

## 3. Backend stack

- **Vault platform** (proprietary): **Java** + **Spring Boot / Spring MVC** on AWS, multi-tenant pod-based architecture. Each tenant ("Vault") is isolated; data is securely partitioned. Powers Quality, Clinical, RIM, Safety, PromoMats, MedComms, QualityDocs, and Vault CRM (since April 2024).
- **Java SDK** (customer extensions): upgraded **Java 8 → Java 17** in release **25R2** (July 2025).
- **VQL (Vault Query Language)**: proprietary query interface, similar in spirit to Salesforce SOQL.
- **Legacy CRM**: Apex / Lightning on the Salesforce Force.com platform. **Sunsets Dec 31 2029** (Veeva–Salesforce contract not renewed; September 2025 announcement).
- **APIs**: REST + SOAP + GraphQL (transactional); plus **Direct Data API** (bulk extract; launched 2024; free for all Vault customers Feb 27 2025) — claims **up to 100× faster** than traditional APIs for large extracts. Generates full snapshots every 24h + incrementals every 15 minutes.

## 4. Data & storage

- **OLTP**: per Veeva careers job descriptions, "**MySQL, Postgres, DynamoDB**" — proprietary Vault data model on top.
- **Warehouse**: **Amazon Redshift** (Veeva Nitro / commercial data warehouse) — confirmed in 10-Ks since FY21.
- **Object storage**: AWS S3 (per Veeva's open-source Direct Data API Accelerators on GitHub — targets S3 / Redshift / Snowflake / Databricks / Microsoft Fabric).
- **Search**: not publicly disclosed in fetched corpus.
- **Cache / queue**: not publicly disclosed.

## 5. Infrastructure topology

- **Multi-tenant, pod-based architecture on AWS.** Per 10-K Item 1: products are hosted in data centers in the **US, EU, Japan, South Korea, Singapore, Australia, and Brazil**, with a separate footprint inside **China for China-only products**. Veeva owns no data centers — all infrastructure is leased from AWS (and Salesforce for legacy CRM).
- **Cloud providers** (per 10-K Item 1, every year FY21–FY26):
  - **AWS** — primary for Vault apps (incl. Vault CRM since Apr 2024), Veeva Network, Vault commercial data warehouse (Redshift), and most Commercial Cloud apps.
  - **Salesforce** — legacy Veeva CRM + certain multichannel CRM applications. Supported until **Dec 31 2029**.
  - **Zoom** — underlies the digital engagement application.
  - **Amazon Bedrock** — hosts LLMs for Veeva AI Agents (since Dec 2025).
  - **Microsoft Azure AI Foundry** — customer-choice alternative for customer-supplied models on Veeva AI Agents.
- **CRM platform shift timeline**:
  - Dec 2022 — announcement: Veeva will migrate CRM off Salesforce platform onto Vault.
  - Apr 2024 — Vault CRM launches; new customers onboarded direct to Vault CRM.
  - Sep 2025 — Veeva–Salesforce contract not renewed; legacy CRM supported through Dec 31 2029.
- **Operational posture** (10-K Cybersecurity Item 1C + Risk Factors): continuous monitoring, redundant configurations, disaster recovery. No public uptime SLA percentage; contractual SLAs (with service-level credits) referenced in risk factors but values not published.

## 6. AI / ML stack

- **Pre-2024**: **Veeva Andi** (since 2019) — deterministic ML for "next-best-action" suggestions in CRM. Modest impact, not LLM-based.
- **Dec 2024 announcement**: Veeva AI Agents to launch in phases.
- **Dec 2025 launch**: **Veeva AI Agents** available — first for Vault CRM and PromoMats.
- **Models served** (per Veeva AI product page): "Veeva AI Agents use **large language models (LLMs) from Anthropic and Amazon, hosted on Amazon Bedrock**." Custom agents can use **customer-provided models on Amazon Bedrock or Microsoft Azure AI Foundry**.
- **Training vs. inference**: Veeva is purely an **inference consumer** — no public disclosure of foundation-model pre-training. Approach is **RAG + agent orchestration over Vault data via the Direct Data API**.
- **Agent architecture** (CEO Peter Gassner, Sept 2025 R&D Summit): vision of specialized agents (translation, medical coding, case intake) coordinated by a "super agent" using **MCP (Model Context Protocol)** for interoperability — confirms Veeva's adoption of Anthropic's MCP standard.
- **AI inference cost**: NOT broken out separately. AI Agents are usage-priced to customers, but Veeva's COGS impact is bundled into cost of subscription services.

`gpu_exposure: serverless` (Bedrock = serverless inference; no owned-cluster signal; no rent-long-term GPU commitment publicly disclosed).
`inference_pattern: streaming` (AI Agents are conversational; some queries asynchronous per IntuitionLabs note "many queries run asynchronously").

## 7. Math priors commentary

**Emitted**:
- *None.* Veeva discloses **no quantitative latency, availability, or throughput numbers** that meet the §6.3 tier-A/B/E/G prior-acceptable bar.

**Why nothing emitted (honest disclosure)**:
- **Latency**: the strongest publicly-disclosed latency claim — "Direct Data API can serve 1 million+ records in under 2 seconds" — comes from a third-party blog (Cloud Rank, **tier C**), which §6.3 rejects for math priors even with corroboration. The Veeva-product-page claim of "**up to 100× faster**" is a relative speedup, not an absolute latency value.
- **Availability**: Veeva references contractual SLAs in 10-K risk factors ("service-level credits") but does **NOT publish a numeric uptime percentage** in any official Veeva-domain URL fetched. No `target_monthly` / `target_annual` anchor available.
- **Throughput**: cadence statements (full snapshots every 24h, incrementals every 15min) are schedule, not throughput. The "1M+ records under 2s" implied throughput (~500k records/sec) is again tier C only.
- **Cost curve**: AI Agents are usage-priced to customers, but Veeva does not publish a per-token / per-request / per-seat cost curve.

**The one quantitative infra anchor that EXISTS but doesn't fit a math-prior shape**: FY25 10-K MD&A "$21M increase related to computing infrastructure costs" — a YoY-delta dollar figure. Could conceivably be a `cost_curves` breakpoint, but a single delta with no x-axis (workload metric) cannot satisfy `costCurveSchema`'s `≥2 breakpoints` requirement.

**Useful Veeva category data despite the math gap**:
- `utility_weight_hints` populated to seed M4's category prior for life-sciences regulated SaaS (heavy availability + security_compliance).
- `gpu_exposure: serverless` + `inference_pattern: streaming` + multi-vendor `ai_stack.serving` populated.
- `cloud_band: undisclosed` (instead of speculating an upper bound from cost-of-subscription bundle).

## 8. Staleness & provenance

This entry was authored from a **single compiled raw-research.md document** (`9-stacks-atlas/veeva_research.md`, sha256 `d0dd50c2c62eb27f486204012b6eee1616cc0d0c0d57a1d4e2acab4f80992054`) rather than per-URL fetches. All citations carry `bytes_integrity: webfetch_only_no_raw_html` with `content_sha256` matching the compiled-research SHA. This yields `data_quality_grade: Q3` — honest grade for "narrative is sound, per-citation byte verification deferred to future curator pass."

**Future enrichment** (recommended v2.2 curator pass):
1. Fetch each source URL listed in §9 directly; compute per-URL `sha256` (raw HTML) + `content_sha256` (extracted article body).
2. Replace the placeholder `d0dd50c2…` SHA on each citation with its per-URL hash.
3. Bump `data_quality_grade: Q3 → Q2`.
4. **Out-of-bounds for the data_quality_grade lift** but useful: ingest the Q3 FY26 prepared-remarks PDF transcript for any quantitative latency/availability anchor missed by the synthesis.

## 9. Sources

### Tier A — SEC filings & 8-K shareholder exhibits

1. **Veeva 10-K FY2026** (filed Mar 20 2026) — https://www.sec.gov/Archives/edgar/data/0001393052/000139305226000014/veev-20260131.htm — **Primary source** for FY26 paid customers (1,552), revenue, headcount (7,928), cost-of-subscription components, AWS+Salesforce cloud disclosure.
2. **Veeva 10-K FY2025** (filed Mar 26 2025) — https://www.sec.gov/Archives/edgar/data/1393052/000139305225000022/veev-20250131.htm — **Sole quantitative infra-cost anchor**: $21M YoY increase in computing-infrastructure costs (MD&A).
3. **Veeva 10-K FY2024** (filed Mar 2024) — https://www.sec.gov/Archives/edgar/data/0001393052/000139305224000013/veev-20240131.htm — FY24 baseline (1,432 customers; 7,172 employees per Macrotrends).
4. **Veeva 10-K FY2023** — https://www.sec.gov/Archives/edgar/data/0001393052/000139305223000025/veev-20230131.htm — Dec 2022 announcement: CRM migration off Salesforce.
5. **Veeva 10-K FY2022** — https://www.sec.gov/Archives/edgar/data/0001393052/000139305222000017/veev-20220131.htm — FY22 (1,205 customers; 5,482 employees).
6. **Veeva 10-K FY2021** — https://www.sec.gov/Archives/edgar/data/0001393052/000139305221000015/veev-20210131.htm — FY21 baseline (993 customers; 4,506 employees; $1,179.5M subscription revenue).
7. **Veeva 8-K Q4 FY2026 cash flow** — https://www.sec.gov/Archives/edgar/data/0001393052/000139305226000007/veev-20260131q426xex991.htm — FY26 R&D $767.4M; CapEx $29.1M; FY25 comparatives.
8. **Veeva 8-K Q4 FY2024 cash flow** — https://www.sec.gov/Archives/edgar/data/0001393052/000139305224000008/veev-2024131q424xex991.htm — FY24 CapEx $26.2M (peak); FY24 R&D $629.0M.
9. **Veeva 8-K Q4 FY2023 cash flow** — https://www.sec.gov/Archives/edgar/data/0001393052/000139305223000015/veev-2023131q423xex991.htm — FY23 CapEx $13.5M.
10. **Veeva 8-K Q4 FY2022 income statement** — https://www.sec.gov/Archives/edgar/data/0001393052/000139305222000011/veev-2022131q422xex991.htm — FY22 baseline.
11. **Veeva 8-K Q4 FY2021** — https://www.sec.gov/Archives/edgar/data/0001393052/000139305221000003/veev-20210131q421xex991.htm — FY21 R&D $294.2M.
12. **Q3 FY2026 prepared remarks PDF** — https://s206.q4cdn.com/200001835/files/doc_earnings/2026/q3/supplemental-info/Veeva-Q3-26-Earnings-Prepared-Remarks.pdf — Vault CRM 115 customers as of Q3 FY26.

### Tier B — Veeva official pages (press / product / careers)

13. **FY2026 results press release** — https://www.veeva.com/resources/veeva-announces-fourth-quarter-and-fiscal-year-2026-results/ — Total revenue $3,195.3M, subscription revenue $2,684.2M.
14. **Q3 FY2026 results** — https://ir.veeva.com/news/news-details/2025/Veeva-Announces-Fiscal-2026-Third-Quarter-Results/default.aspx — Vault CRM customer count, segment growth.
15. **Veeva AI product page** — https://www.veeva.com/products/veeva-ai/ — "**LLMs from Anthropic and Amazon, hosted on Amazon Bedrock**"; customer BYO models on Bedrock / Azure AI Foundry.
16. **Veeva AI Agents launch announcement** (Oct 14 2025) — https://www.veeva.com/resources/veeva-ai-agents-to-be-released-across-all-veeva-applications/ — Phased launch.
17. **Direct Data API product page** — https://www.veeva.com/products/direct-data-api/ — "Up to 100× faster than traditional APIs"; full-snapshot / 15-min-incremental cadence.
18. **Direct Data API press release** (Feb 27 2025) — https://www.veeva.com/resources/veeva-direct-data-api-now-included-with-vault-platform-to-enable-ai-innovation/ — Free with Vault from Feb 2025.
19. **Veeva engineering careers** — https://careers.veeva.com/teams/engineering/ — Stack overview (Java, JS/React, iOS/Android, DevOps, Performance, Data).
20. **Software Engineer Java job posting** — https://careers.veeva.com/job/4d5dd1de-44d2-41ff-a8f2-1113a8e310ff/software-engineer-java-boston-ma/ — Spring + MySQL/Postgres/DynamoDB stack.

### Tier F — GitHub

21. **Veeva Vault Direct Data API Accelerators** — https://github.com/veeva/Vault-Direct-Data-API-Accelerators — Targets S3 / Redshift / Snowflake / Databricks / Microsoft Fabric.

### Tier C — Third-party analyses (corroboration only; never sole; never math priors)

22. **IntuitionLabs — Vault Platform Architecture** — https://intuitionlabs.ai/articles/veeva-vault-cloud-content-management-platform-for-life-sciences — Multi-tenant pod-based architecture description.
23. **IntuitionLabs — CRM → Vault CRM Migration Playbook** — https://intuitionlabs.ai/articles/veeva-vault-crm-migration-guide — Field-rep mobile continuity (~80% pharma sales reps).
24. **IntuitionLabs — Veeva AI Agents** — https://intuitionlabs.ai/articles/veeva-ai-agents-life-sciences — "Real-time performance latency is usually acceptable…many queries run asynchronously" (latency tone, not a quant prior).
25. **IntuitionLabs — Vault LLM Integration via Direct Data API (RAG)** — https://intuitionlabs.ai/articles/veeva-vault-llm-rag-direct-data-api — RAG architecture description.
26. **Cloud Rank — Vault CRM migration guide** — https://cloud-rank.com/migration-from-veeva-crm-to-vault-crm-guide/ — "Direct Data API can serve 1 million+ records in under 2 seconds" (tier C; not eligible as math prior).
27. **InfoQ — Anthropic & OpenAI donate MCP/AGENTS.md to Agentic AI Foundation** (Dec 2025) — https://www.infoq.com/news/2025/12/agentic-ai-foundation/ — Ecosystem context for Veeva's MCP adoption.

### Tier D — Aggregators (corroboration only)

28. **Macrotrends — Veeva employees** — https://www.macrotrends.net/stocks/charts/VEEV/veeva-systems/number-of-employees — Headcount series FY13–FY26.
29. **StockAnalysis.com — Veeva cash flow** — https://stockanalysis.com/stocks/veev/financials/cash-flow-statement/ — CapEx series.
30. **Trefis — VEEV CapEx history** — https://www.trefis.com/data/companies/VEEV — 5-yr CapEx ~$16.6M/yr average.

## Curator notes

- **`data_quality_grade: Q3`** — single compiled-research source; per-URL bytes not yet fetched + verified. Future curator pass would re-stamp per-URL `sha256` + `content_sha256`, lifting to Q2.
- **`scale.metric: paying_organizations`** — exact fit (added to `scaleMetricSchema` in v1.2.0 of the Atlas entry schema as part of this curator pass). Veeva's only headline scale metric is "paid customers" (1,552 FY26), which represents paying customer organizations (life-sciences companies + biotechs + medical-device firms) — distinct from `paying_subscribers` semantics (which mixes seat-based + per-user SaaS). Veeva does NOT publish DAU / MAU / total seats / end-user counts in any year FY21–FY26. Atlassian (350K customers) should be re-curated to also use `paying_organizations` on its next pass.
- **`dau_band: unknown`** — Veeva explicitly does NOT publish DAU / MAU / seats. Honest assignment is `unknown` rather than guessing a band from 1,552 paid orgs × estimated seats-per-customer (which would put true MAU likely in `1m_10m` or `10m_100m` but the spread is too wide to commit).
- **`infra_cost_usd_annual: null`** — Veeva does NOT break out cloud / AWS / infrastructure as a line item in any 10-K. The only quantitative anchor is FY25 MD&A's "**$21M increase**" YoY — a delta, not an absolute. `null` is the honest assignment; speculating a bundled cost-of-subscription upper bound would be misleading.
- **`cost_band: undisclosed`** — same reason as above; the cost band enum has `undisclosed` as a first-class value and that's the right call here. Distinct from `100m_1b_usd` (which would be the cost-of-subscription bundle, but that bundle is mostly people + amortization + facilities, not infra).
- **`headcount_est: 7928`** — total worldwide FY26-end. **Engineering-only is NOT disclosed** at any year FY21–FY26. R&D *expense* ($767.4M FY26, ~24% of revenue) is the proxy; R&D *people* count is not.
- **`archetype_tags: [vertical-saas-regulated-industry, scala-jvm-platform]`** — `vertical-saas-regulated-industry` is the new primary archetype (added to `archetypeTagSchema` in v1.2.0 as part of this curator pass) and is exact-fit: multi-tenant pod-based SaaS on AWS, GxP / 21 CFR Part 11 / HIPAA validated, dual-dominant utility weighting on availability + security_compliance. The new tag also fits Workday-public-sector / ServiceNow / Procore-class regulated-vertical SaaS for future entries. Secondary tag `scala-jvm-platform` retained because Java + Spring Boot on JVM is the dominant runtime signal.
- **`ai_stack.serving`** — tokens normalized to standard form: `anthropic_claude_on_bedrock`, `amazon_foundation_models_on_bedrock`, `customer_byo_bedrock`, `customer_byo_azure_ai_foundry`, `mcp_orchestration`. Veeva's product page does NOT name specific Anthropic model versions (Claude 3.5 / 4 / Opus 4.7 not disclosed) nor specific Amazon foundation models (Titan vs. Nova not disclosed) — the page is at "**LLMs from Anthropic and Amazon, hosted on Amazon Bedrock**" granularity. Refining model versions requires either a Veeva blog naming them or an Anthropic/Amazon co-marketing case study; this is a content-side gap, not a schema gap.
- **`gpu_exposure: serverless`** — Bedrock is serverless inference; Veeva is purely a consumer. There is NO public disclosure of Veeva running self-hosted GPU inference. Distinct from `rents_long_term` (which would be a multi-year GPU commit) — Bedrock is per-token / per-request usage-priced, not a long-term reservation.
- **`inference_pattern: streaming`** — AI Agents are conversational (Vault CRM + PromoMats first), and the IntuitionLabs note flags "many queries run asynchronously." Streaming is the better single-value fit; could also tag `batch` for the asynchronous portion but the enum is single-value.
- **`utility_weight_hints` sum to 1.00** — life-sciences regulated SaaS weighting: **availability 0.25** dominant (mission-critical for clinical trials + RIM + safety reporting; Veeva's customer base operates under FDA / EMA / 21 CFR Part 11 / GxP regulatory regimes that require audited uptime), **security_compliance 0.25** dominant (validated systems for regulated workflows; Veeva carries multiple ISO + SOC 2 + HIPAA + GxP certifications referenced in 10-K Cybersecurity Item 1C), latency / cost / quality / safety / dev velocity 0.10 each. The weight on security_compliance + availability dual-dominance is the structural distinctive of life-sciences vertical SaaS vs. general B2B SaaS (cf. Atlassian's `developer_velocity: 0.20` profile).
- **NO `latency_priors`, NO `availability_priors`, NO `throughput_priors`, NO `cost_curves`** — see §7 for the full honest accounting of what Veeva doesn't disclose. Veeva is a useful "what to do when math is unavailable" case study for M4: utility_weight_hints + ai_stack composition give M4 enough category-prior signal even when quant priors are absent.
- **CapEx / asset-light note** — CapEx ranged $8.7M FY21 → $26.2M FY24 peak → $29.1M FY26 (~0.9% of revenue). Veeva owns no data centers; CapEx is dominated by office build-outs + capitalized internal-use software. This is the structural opposite of Roblox's owned-cluster GPU CapEx ramp ($441M FY25 vs Veeva's $29.1M same window — ~15× difference at similar scale-of-business).
- **Salesforce sunset (Dec 31 2029)** — legacy CRM migration is the binding multi-year platform shift. New customers go direct to Vault CRM (Apr 2024+); existing Salesforce-hosted customers have through 2029 to migrate. Worth re-curating after each fiscal year to track migration progress (115 → 125+ → ?).
- **`infra.cloud: [aws, salesforce_platform, private_cloud_china]`** — tokens normalized this pass. `infraStackSchema.cloud` is `stackSlotArraySchema` (free-form snake_case strings, NOT enum-locked per design — see `entry.ts` lines 155-157), so these tokens are valid. The legacy-CRM sunset (Dec 31 2029) is captured in §5 narrative and the `salesforce_platform` token; no schema changes needed.
- **Fiscal-year handling**: Veeva FY ends Jan 31. FY26 = Feb 2025 – Jan 2026 = "calendar 2025 mostly." Care needed comparing Veeva FY26 to e.g. Roblox FY25 (calendar-year). The infra-cost $21M anchor is FY25 (Feb 2024 – Jan 2025).
