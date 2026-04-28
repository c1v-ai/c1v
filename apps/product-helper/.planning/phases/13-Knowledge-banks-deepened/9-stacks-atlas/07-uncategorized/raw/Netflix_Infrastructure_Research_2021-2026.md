# Netflix: Comprehensive Infrastructure & Scale Research (2021–2026)

*Compiled April 22, 2026*

---

## Executive Summary

- **Subscribers grew from 222M (Q4 2021) to 325M+ (Q4 2025)**; Netflix stopped reporting quarterly subscriber counts starting Q1 2025, shifting focus to revenue and engagement metrics.
- **Ad-supported tier launched Nov 2022**, reaching 94M subscribers / 190M "Monthly Active Viewers" by late 2025 — Netflix switched to this new MAV metric in Nov 2025.
- **Technology & Development spend** rose from $2.27B (2021) to ~$2.90B (2024), holding at 7–9% of revenue. AWS/cloud costs are **not separately disclosed** but estimated at $500–700M/year by analysts.
- **CapEx is modest** at $500–850M/year (property & equipment only; content spending of ~$13–17B/year is classified separately).
- **Headcount** grew from ~11,300 (2021) to ~14,000 (2024) with ~450 FTE layoffs in mid-2022. Netflix does **not** break out engineering headcount by function.
- **Stack is Java/Spring Boot on AWS**, with Open Connect (custom CDN on FreeBSD) delivering 95%+ of video bytes. Major 2021–2026 shifts include GraphQL Federation (DGS Framework), the Cosmos media platform, Maestro orchestrator, and expanded GPU-based ML training via Titus.
- **AI/ML is self-hosted** via Metaflow + PyTorch on AWS GPUs; no confirmed use of external LLM APIs for production features. Microsoft Xandr handles ad-serving for the ad tier.

---

## 1. Scale — Users / Activity (2021–2026)

Netflix's primary reported metric is **global paid memberships** (subscriber accounts). The company has never disclosed platform-wide DAU or MAU.

### Global Paid Subscribers (Q4 of Each Year)

| Year-End | Paid Subscribers | Notes |
|----------|-----------------|-------|
| Q4 2021 | **221.8M** | Officially reported |
| Q4 2022 | **230.8M** | Officially reported; lost subs in Q1–Q2, recovered in Q3–Q4 |
| Q4 2023 | **260.3M** | Officially reported; password-sharing crackdown boosted growth |
| Q4 2024 | **301.7M** | Last quarter with officially reported subscriber counts; record 18.9M net adds in Q4 |
| Q4 2025 | **325M+** | Milestone disclosed in Jan 2026 shareholder letter; exact figure not given |
| Q1 2026 | ~325M (no update) | Netflix no longer reports quarterly subscriber counts |

**Reporting change:** In April 2024 (Q1 2024 earnings), Netflix announced it would stop reporting subscriber counts and Average Revenue Per Member starting Q1 2025. Rationale: engagement (time spent) is a better proxy, and memberships are only one revenue component alongside advertising and extra-member fees.

### Regional Breakdown (Q4, millions)

| Region | 2021 | 2022 | 2023 | 2024 | 2025 |
|--------|------|------|------|------|------|
| UCAN | 74.6 | ~74.3 | ~80.1 | 89.6 | Not reported |
| EMEA | 73.7 | ~76.7 | ~88.8 | 101.1 | Not reported |
| LATAM | 39.6 | ~41.7 | ~46.0 | 53.3 | Not reported |
| APAC | 33.7 | ~38.0 | ~45.3 | 57.5 | Not reported |

EMEA surpassed UCAN in 2022 and crossed 100M in Q4 2024. APAC surpassed LATAM in Q4 2024.

### Ad-Supported Tier

Launched November 2022 ("Standard with Ads") in 12 countries.

| Date | Metric | Figure |
|------|--------|--------|
| May 2023 | MAU (ad tier) | ~5M |
| Nov 2023 | MAU (ad tier) | 15M |
| May 2024 | MAU (ad tier) | 40M |
| Nov 2024 | MAU (ad tier) | 70M |
| May 2025 | Subscribers (ad tier) | 94M |
| Nov 2025 | Monthly Active Viewers (new metric) | 190M |

In Nov 2025, Netflix switched from "monthly active users" (accounts) to "Monthly Active Viewers" (individuals who watched ≥1 min of ads/month), roughly doubling the reported figure. Ad revenue reached ~$1.5B in FY 2025, with ~$3B projected for 2026.

### DAU / MAU (Overall Platform)

**Not disclosed.** Netflix has never reported DAU or MAU across all tiers.

---

## 2. Cloud / Infrastructure Costs (2021–2026)

### Cost of Revenue (Income Statement)

This is Netflix's broadest cost line and is dominated by content amortization. Cloud/infrastructure costs are **bundled within it and not separately disclosed**.

| Year | Cost of Revenue | Content Amortization (approx.) |
|------|----------------|-------------------------------|
| 2021 | $17.3B | ~$12.2B |
| 2022 | $19.2B | ~$12.6B |
| 2023 | $21.5B | ~$14.2B |
| 2024 | $23.9B | Not yet parsed from 10-K |
| 2025 | Not yet filed | — |

### Technology & Development Expense (Income Statement)

A separately reported operating expense covering engineering personnel, product development, and IT — but **not** the AWS compute/storage bills (those sit in Cost of Revenue).

| Year | Tech & Development | % of Revenue |
|------|-------------------|-------------|
| 2021 | $2.27B | 7.6% |
| 2022 | $2.71B | 8.6% |
| 2023 | $2.68B | 7.9% |
| 2024 | $2.90B | 7.3% |
| 2025 | Not yet filed | — |

### AWS / Cloud Spend

**Not disclosed by Netflix.** Netflix is one of AWS's largest customers (migrated fully to AWS by ~2016). Analyst estimates cluster around **$500–700M/year** (2021–2024 range), sourced from Bernstein, Wells Fargo, and trade publications. No official figure exists in any filing.

### Open Connect CDN

Netflix's custom CDN deploys hardware appliances directly inside ISP networks. As of 2024: ~18,000+ appliances, 1,000+ ISP partners across 100+ countries, latest-generation appliances hold ~280 TB each. Open Connect serves ~95%+ of Netflix video traffic. Costs are **not separately disclosed** — analyst estimates suggest ~$100–300M/year, kept low because ISPs host appliances at no cost to Netflix (it reduces their upstream bandwidth).

---

## 3. Engineering / R&D / Tech Headcount (2021–2026)

### Total Employee Count

| Year-End | Full-Time Employees | Notes |
|----------|-------------------|-------|
| 2021 | ~11,300 | 10-K |
| 2022 | ~12,800 | 10-K (post-layoffs, with subsequent rehiring) |
| 2023 | ~13,000 | 10-K |
| 2024 | ~14,000 | 10-K |
| 2025 | Not yet filed | — |

### Functional Breakdown

**Not disclosed.** Netflix reports a single aggregate headcount in its 10-K filings with no engineering/content/corporate split. Third-party estimates (LinkedIn data) suggest ~25–30% of employees are in engineering/technology roles (~3,500–4,200 as of 2024), but this is not an official figure.

### 2022 Layoffs

Two rounds driven by subscriber losses in Q1–Q2 2022:

- **May 2022:** ~150 employees (primarily content/editorial/marketing; Netflix's "Tudum" fan site was heavily affected)
- **June 2022:** ~300 employees (broader across functions including recruiting, content, and some engineering/product)
- **Total:** ~450+ FTEs plus 150+ contractors
- Hiring resumed by late 2022 as subscriber growth recovered

---

## 4. CapEx (2021–2026)

Reported as "Acquisitions/Purchases of property and equipment" on the cash flow statement. **Infrastructure CapEx is not broken out separately** from studio/office/equipment CapEx.

| Year | CapEx (Property & Equipment) |
|------|------------------------------|
| 2021 | ~$524M |
| 2022 | ~$408M |
| 2023 | ~$600M |
| 2024 | ~$847M |
| 2025 | Not yet filed |

**Critical distinction:** Netflix's massive content spending (~$13–17B/year) is classified as "Additions to content assets," **not** as CapEx. The CapEx line covers physical infrastructure: offices, production facilities (Albuquerque, UK, Spain studios), Open Connect hardware, and IT equipment. The increase from 2022→2024 reflects studio expansion and OCA hardware refreshes.

---

## 5. Stack and Platform Changes (2021 → 2026)

### Primary Languages

**Java** remains dominant for backend microservices (Spring Boot). Supporting languages: **Python** (ML, data pipelines, Metaflow), **Node.js** (server-side rendering for web UI), **Kotlin** (Android, some backend), **Go** (infrastructure tooling). No major language shifts in this period.

### Major Data Stores

Core stores unchanged: **Cassandra** (primary distributed DB), **MySQL/RDS** (relational), **DynamoDB** (low-latency key-value), **EVCache/Memcached** (caching), **Elasticsearch/OpenSearch** (search, logging). Notable addition: **CockroachDB** adopted for globally-distributed SQL workloads (~2022–2023). Analytics layer: **Apache Iceberg** (Netflix-created table format, now industry standard), **Spark**, **Presto/Trino**, **Druid**. **Kafka** remains central to event-driven architecture.

### Cloud Provider

**AWS only** — no credible evidence of multi-cloud moves. Netflix builds cloud-agnostic abstractions internally (Titus for containers, Spinnaker for deployment) but runs everything on AWS. Open Connect (on-premise in ISP networks) is the sole exception.

### AI / ML Serving

- **Training:** PyTorch (primary, replacing TensorFlow), run on AWS GPU instances (P3/P4d) via Titus container platform. Orchestrated by **Metaflow** (Netflix-created, open-sourced) and **Maestro** (workflow orchestrator, open-sourced ~2024).
- **Inference:** Self-hosted internal model-serving platforms. Models serve recommendations, personalized artwork, search ranking, content understanding, and per-shot video encoding optimization.
- **External APIs:** No official confirmation of OpenAI or other external LLM APIs for production features. Microsoft Xandr handles ad-serving technology (not ML inference).
- **Key ML areas:** Personalized thumbnails, adaptive bitrate streaming, AV1 codec optimization, content understanding (NLP + computer vision).

### Major Architectural Changes (2021–2026)

1. **GraphQL Federation** (~2020–2023): Migrated from REST/Falcor to federated GraphQL API layer. Open-sourced the **DGS (Domain Graph Service) Framework** for Java/Spring Boot.
2. **Cosmos Platform** (~2022): Major re-architecture of media processing pipeline (encoding, quality analysis).
3. **Maestro Orchestrator** (~2024): Replaced/evolved Meson workflow orchestrator; open-sourced.
4. **Data Mesh** (~2022): Adopted data mesh principles for organizing the data platform.
5. **Ad-Tech Stack** (2022): Built ad-tier infrastructure with Microsoft/Xandr for ad serving.
6. **AV1 Codec Adoption**: Expanded AV1 encoding for supported devices, improving quality-per-bit.

---

## 6. Authoritative Non-Filing Sources

### Official Engineering Blog (netflixtechblog.com)

Key publications relevant to system shape and architecture:

- **"Open-Sourcing the Netflix Domain Graph Service Framework (DGS)"** (2021) — Announced the Java/Spring Boot GraphQL framework that underpins their API federation layer.
- **"How Netflix Scales its API with GraphQL Federation"** (~2022–2023) — Details the migration from REST/Falcor to federated GraphQL across hundreds of microservices.
- **"The Netflix Cosmos Platform"** (~2022) — Describes the re-architected media processing platform for encoding and quality analysis at scale.
- **"Maestro: Netflix's Workflow Orchestrator"** (~2024) — Covers the next-generation orchestrator replacing their earlier Meson system.
- **"Keeping Netflix Reliable Using Prioritized Load Shedding"** (~2022–2023) — Details how Netflix handles cascading failures and maintains availability targets.
- **"CockroachDB at Netflix"** (~2022–2023) — Documents adoption of globally-distributed SQL for specific workloads.
- **"Serving 400 Gb/s of video from a single FreeBSD server"** (conference talk, multiple venues) — Describes Open Connect appliance software optimization achieving extreme per-server throughput.

### Architecture & Reliability

- Netflix runs **active-active across multiple AWS regions** (primarily us-east-1, us-west-2, eu-west-1) with region evacuation capability.
- Availability target is publicly discussed as **99.99%+** ("four nines").
- **Chaos Engineering** remains central: Chaos Monkey, Chaos Kong, and the **ChAP (Chaos Automation Platform)** for safely running chaos experiments in production.
- Open Connect handles **video delivery** (95%+ of bytes); AWS handles **control plane** (API, recommendations, account management, billing).

### Frontend / Edge Delivery

- **Web:** React + Node.js SSR. Performance optimization is a frequent blog topic.
- **TV/Device:** Custom native UI frameworks (not web-based) for TV platforms.
- **Open Connect:** FreeBSD-based appliances running custom NGINX-based serving stack. ~18,000 appliances in 1,000+ ISP networks, capable of hundreds of terabits per second globally. Netflix accounts for ~15% of global downstream internet traffic (per Sandvine reports).

### Financial Context (2025–2026)

- FY 2025 revenue: $45.2B (+16% YoY), operating margin 29.5%, net income $11.0B
- Q1 2026 revenue: $12.25B (+16% YoY)
- FY 2026 guidance: $50.7–$51.7B revenue, 31.5% operating margin target
- Pursuing acquisition of Warner Bros. Discovery film/studio assets (pending as of Q1 2026)

---

## Sources

### SEC Filings
- Netflix 10-K Annual Reports (2021–2024) — SEC EDGAR / ir.netflix.net
- Netflix Quarterly Earnings Letters — ir.netflix.net/financials/quarterly-earnings

### Earnings & Subscriber Reporting
- Netflix Q4 2021 Earnings — Variety (Jan 2022)
- Netflix Q4 2022 Earnings — Variety (Jan 2023)
- Netflix Q4 2023 Earnings — Variety/Deadline (Jan 2024)
- Netflix Q4 2024 Earnings — Financhle / CNBC (Jan 2025)
- Netflix Stops Reporting Subscriber Numbers — Variety / Axios (Apr 2024)
- Netflix Q4 2025 Earnings, 325M+ Subs — Hollywood Reporter / CNBC (Jan 2026)
- Netflix Q1 2026 Earnings — CNBC / Hollywood Reporter (Apr 2026)

### Ad-Tier Data
- Netflix Ad Tier 15M MAU — Deadline (Nov 2023)
- Netflix Ad Tier 70M MAU — CNBC (Nov 2024)
- Netflix Ad Tier 94M Subscribers — CNBC (May 2025)
- Netflix 190M Ad-Tier Viewers (MAV metric) — Deadline / Hollywood Reporter (Nov 2025)

### Engineering & Architecture
- Netflix Tech Blog — netflixtechblog.com (Medium-hosted)
- Netflix Open Connect — openconnect.netflix.com
- Netflix GitHub — github.com/Netflix
- Netflix Research — research.netflix.com
- NANOG / Peering Forum presentations by Netflix engineering

---

## Explicit Unknowns (2021–2026)

| Data Point | Status |
|-----------|--------|
| **DAU / MAU (all tiers, overall platform)** | Never disclosed by Netflix |
| **AWS / cloud spend (specific dollar figure)** | Never disclosed; analyst estimates only ($500–700M/yr) |
| **Open Connect CDN costs** | Never disclosed; analyst estimates only (~$100–300M/yr) |
| **Engineering headcount (separate from total)** | Never broken out in filings; third-party estimates only |
| **Infrastructure CapEx vs. studio/office CapEx** | Not separately reported in cash flow statement |
| **Streaming delivery costs within Cost of Revenue** | Bundled with content amortization; not itemized |
| **FY 2025 10-K financials** | Should be filed by early 2026 but not verified in this research |
| **Q4 2025 exact subscriber count** | Netflix disclosed "325M+" but no precise figure |
| **2026 subscriber count** | No longer reported quarterly |
| **Regional subscriber breakdown after Q4 2024** | No longer reported |
| **Production use of external LLM APIs** | No official confirmation or denial |
| **2025–2026 tech stack changes** | Limited visibility; blog posts from late 2025 / early 2026 not fully surveyed |
