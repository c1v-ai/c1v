# Etsy 2021–2026: Scale, Infrastructure, and Stack

## Executive overview

Etsy’s primary user scale metrics from 2021–2025 are “active buyers” and “active sellers” on a trailing‑twelve‑month basis; the company does not disclose DAU or MAU counts, so active buyers/sellers plus gross merchandise sales (GMS) are the best available activity indicators. Consolidated active buyers peaked around 96–97 million in 2021–2024 before declining to about 93.5 million in 2025, while Etsy‑marketplace‑only active buyers declined from roughly 90 million in 2021 to 86.5 million by year‑end 2025. Across 2021–2025, annual GMS has been broadly flat to slightly down (about 13.5–11.9 billion dollars), implying that Etsy has shifted from hyper‑growth to a mature, high‑cash‑flow marketplace with modest top‑line growth pressure.[^1][^2][^3][^4][^5][^6]

On infrastructure costs, Etsy classifies most cloud and platform spend inside “cost of revenue,” bundled with payments, customer support, and other direct operating costs; filings explicitly state that cloud computing is a major component of cost of revenue but do not break out cloud or hosting as a standalone line item. Cost of revenue grew from the mid‑hundreds of millions in the early 2020s to roughly 818 million dollars in 2025, while separate “product development” expenses (which include engineering/R&D labor) were about 450 million dollars in 2025. Headcount disclosures provide only total employees (roughly 2.4–2.8 thousand over 2021–2024) and high‑level diversity metrics; engineering/R&D headcount is not broken out numerically.[^7][^8][^9][^10][^11][^1]

Capital expenditures are modest relative to revenue (low‑teens of millions of dollars per year) and consist primarily of purchases of property and equipment and capitalized software. On the technical side, Etsy completed its migration from self‑hosted data centers to Google Cloud Platform (GCP) by 2020 and has since standardized on GCP services such as Google Kubernetes Engine (GKE), BigQuery, Vertex AI, and Gemini models, while continuing to use a large sharded MySQL cluster that is now being migrated to Vitess. Kafka‑based streaming on GKE underpins search indexing and other critical pipelines, and has been re‑architected for multi‑zone resiliency with explicit production chaos tests. For AI/ML, Etsy runs classical ML for search, ads, and personalization on Google Cloud, and from 2024 onward has layered generative‑AI features such as “Gift Mode” using OpenAI’s GPT‑4 and Google’s Gemini models.[^12][^13][^14][^15][^16][^17][^18][^19][^20][^21][^1]

Code as Craft posts and Google Cloud case studies portray Etsy as an SRE‑driven organization that treats latency and availability as first‑class concerns, with public quarterly performance reporting (historically), Core Web Vitals optimization work such as Priority Hints, and zone‑failure drills for Kafka and other systems. However, Etsy does not publish formal numeric SLAs or uptime targets for the marketplace, nor does it disclose detailed cloud‑provider cost breakdowns, service‑level objectives (SLOs) per service, or engineering headcount by function.[^22][^23][^24][^12]

## 1. Scale — users and activity (2021–2026)

### 1.1 What Etsy actually reports

Etsy’s key user scale metrics are:

- **Active buyers:** Unique buyer accounts that made at least one purchase in the preceding twelve months, measured across a given marketplace or the consolidated “House of Brands.”[^2][^25]
- **Active sellers:** Unique seller accounts with at least one fee‑generating transaction or listed item over a trailing twelve‑month period, similarly defined at marketplace or consolidated level.[^26][^2]

The company does **not** disclose DAU or MAU for buyers or sellers and instead focuses on active buyers/sellers, GMS per active buyer, buyer cohort breakdowns (new, reactivated, repeat, habitual), and marketplace‑level GMS.[^27][^28][^2]

### 1.2 Consolidated active buyers and sellers (all marketplaces)

The table below aggregates the best available consolidated metrics for Etsy’s “House of Brands,” where each year’s counts cover all marketplaces that remained in the group for that period (Etsy marketplace, Reverb, Depop, and Elo7 until its 2023 divestiture; Reverb is sold in mid‑2025 and Depop is classified as held for sale).[^5][^1][^2]

| Year | Scope / composition | Active buyers (M) | Active sellers (M) | Notes |
|------|---------------------|-------------------|--------------------|-------|
| 2021 | Etsy marketplace, Reverb, Depop, Elo7 | 96.3 | 7.5 | SASB table in 2021 10‑K shows 96,336 thousand active buyers and 7,522 thousand active sellers across all marketplaces.[^2][^1] |
| 2022 | Etsy marketplace, Reverb, Depop, Elo7 | 95.1 | 7.5 | 2022 SASB metrics disclose 95,076 thousand active buyers and 7,470 thousand active sellers; text confirms this is consolidated.[^2][^29] |
| 2023 | Etsy marketplace, Reverb, Depop (Elo7 sold Aug 10, 2023) | 96.5 | 9.0 | SASB table lists 96,483 thousand buyers and 9,035 thousand sellers; narrative summary rounds to “more than 96 million buyers” and “9.0 million active sellers.”[^27][^2][^5] |
| 2024 | Etsy marketplace, Reverb, Depop | 95.5 | 8.1 | 2024 SASB metrics show 95,459 thousand buyers and 8,134 thousand sellers.[^2] |
| 2025 | Etsy marketplace, Depop (Reverb sold Jun 2, 2025) | 93.5 | 8.8 | 2025 10‑K describes 93,539 thousand consolidated active buyers and 8,762 thousand active sellers across Etsy and Depop; Reverb is included until its sale.[^1] |
| 2026 | Not yet reported | Not found | Not found | As of April 2026, only 2025 year‑end metrics are available; no 2026 “as of” active buyer/seller counts have been filed. |

### 1.3 Etsy marketplace only

Where filings separate the Etsy marketplace from Depop and Reverb, Etsy discloses Etsy‑only active buyers and sellers and detailed buyer cohort metrics:

- **2021:** 2021 Integrated Annual Report states that the Etsy marketplace alone served roughly 90 million active buyers and 5.3 million active sellers as of December 31, 2021, out of 96.3 million consolidated buyers and 7.5 million consolidated sellers.[^3][^1]
- **2024:** 2024 Integrated Annual Report reports that as of December 31, 2024, the Etsy marketplace had 89.6 million active buyers and 5.6 million active sellers.[^4][^6]
- **2025:** 2025 10‑K gives Etsy‑marketplace counts of 86.5 million active buyers and 5.6 million active sellers as of December 31, 2025.[^1]

Key buyer productivity metrics for the Etsy marketplace:

- **GMS per active buyer (TTM):**
  - 2021: about 136 dollars per active buyer.[^27][^12]
  - 2022: about 132 dollars per active buyer.[^28][^30]
  - 2023: about 128 dollars per active buyer (TTM, mid‑2023 disclosures).[^31][^28]
  - 2024: about 121 dollars per active buyer (full‑year metric discussed in 2024 earnings materials).[^32][^4]
  - 2025: 121 dollars per active buyer on a trailing‑twelve‑month basis, down 0.5 percent year‑over‑year.[^1]

- **Buyer cohorts (Etsy marketplace, 2025):** 86.5 million active buyers, including 21.2 million new buyers, 30.0 million reactivated buyers, 5.9 million habitual buyers (≥200 dollars and ≥6 purchase days), and 34.6 million non‑habitual repeat buyers.[^1]

### 1.4 Gross Merchandise Sales (GMS)

Consolidated and Etsy‑only GMS provide activity context for the user metrics:

| Year | Consolidated GMS (B USD) | Etsy marketplace GMS (B USD) | Notes |
|------|--------------------------|------------------------------|-------|
| 2021 | 13.5 | 12.2 | 2021 Integrated Annual Report: “Our sellers generated 13.5 billion dollars of GMS in 2021; Etsy marketplace represented 90.6 percent, Reverb 7.0 percent, Depop 2.2 percent, Elo7 0.2 percent.”[^3] |
| 2022 | 13.3 | 11.8 | 2022 Annual Report: consolidated GMS 13.3 billion dollars, of which Etsy marketplace 11.8 billion (88.3 percent).[^33][^34] |
| 2023 | 13.2 | 11.6 | 2023 Integrated Report: 13.2 billion dollars consolidated GMS, Etsy marketplace 11.6 billion, remaining GMS from Reverb and Depop.[^5][^27] |
| 2024 | 12.6 | 10.9 | 2024 Integrated Report: 12.6 billion dollars consolidated GMS; Etsy marketplace 10.9 billion (86.4 percent), Reverb 0.918 billion, Depop 0.789 billion.[^4] |
| 2025 | 11.9 | 10.5 | 2025 10‑K: consolidated GMS 11,916.9 million dollars; Etsy marketplace GMS 10,460.7 million (87.8 percent); Depop 1,074.9 million.[^1] |
| 2026 | Not yet reported | Not yet reported | No 2026 GMS disclosed as of April 2026. |

Overall, consolidated GMS peaked in 2021–2022 and declined modestly through 2025, while Etsy maintains a high take rate and strong free‑cash‑flow margins.[^34][^4][^1]

### 1.5 Gaps and non‑disclosures (scale)

- **No DAU/MAU:** Filings and investor materials do not report daily or monthly active users, either for buyers or sellers. Instead, Etsy’s standard disclosures are trailing‑twelve‑month active buyers/sellers plus GMS per active buyer.
- **No per‑day or per‑month activity counts:** There are no public metrics on orders per day, unique daily buyers, or concurrent session counts.
- **2026 metrics:** As of April 2026, there are no standalone 2026 “as of” buyer/seller metrics; only year‑end 2025 figures are available.

## 2. Cloud / infrastructure costs (2021–2026)

### 2.1 Where infrastructure spend appears in the P&L

Etsy’s filings consistently state that infrastructure costs, including cloud computing, are embedded in **cost of revenue** and to a lesser degree in product development and general and administrative expenses:[^9][^7]

- 2023 Integrated Annual Report describes cost of revenue as consisting primarily of “interchange and other fees for payments processing services, and expenses associated with cloud computing, customer support, and other direct costs of running the marketplaces.”[^9]
- Earlier ESG disclosures note that Etsy updated its greenhouse‑gas accounting methodology in 2021 to incorporate “Cloud Computing activities,” reflecting the move of compute workloads to Google Cloud.[^35][^1]

Etsy does **not** provide a separate line item labeled “hosting,” “cloud infrastructure,” or similar; therefore any cloud/IaaS/PaaS spend must be inferred from cost of revenue and accompanying qualitative descriptions.

### 2.2 Cost of revenue and related line items

From the latest consolidated income statements on Etsy’s investor site and 10‑K filings:[^8][^10]

| Year | Revenue (M USD) | Cost of revenue (M USD) | Gross margin | Product development (M USD) | Notes |
|------|------------------|--------------------------|-------------|-----------------------------|-------|
| 2021 | ~2,329 | ~655 | ~72 percent | ~383 | 2021 10‑K shows cost of revenue in the mid‑600‑million range; composition includes payments, cloud computing, and support costs.[^36][^7] |
| 2022 | ~2,565 | ~745 | ~71 percent | ~422 | 2022 10‑K (and secondary aggregators) show cost of revenue in the mid‑700‑million range.[^34][^37] |
| 2023 | 2,748 | 828.7 | 69 percent | 450.7 | Q4 2024 earnings presentation discloses 2023 cost of revenue of 828.675 thousand dollars and revenue of 2,748.377 thousand, implying 69 percent gross margin.[^10][^9] |
| 2024 | 2,808 | 774.6 | 73 percent | 438.9 | Same presentation: 2024 revenue 2,808.332 million and cost of revenue 774.554 million; product development 438.934 million.[^10] |
| 2025 | 2,883 | 817.8 | 72 percent | 450.2 | 2025 income statement shows cost of revenue 817.800 million, product development 450.192 million, general and administrative 332.766 million.[^8] |
| 2026 | N/A | N/A | N/A | N/A | No 2026 full‑year data yet. |

Key observations:

- Cost of revenue is roughly **27–31 percent of revenue**, and explicitly includes cloud computing as a significant component.
- Product development expense is roughly **15–16 percent of revenue**, largely consisting of engineering, product, and design compensation and related overheads.[^10][^8]
- Marketing remains Etsy’s single largest operating expense line, at about 915 million dollars in 2025.[^8]

Etsy’s 10‑K and integrated reports repeatedly emphasize that the company uses Google Cloud as its primary infrastructure provider, so most infrastructure costs can be assumed to be GCP compute, storage, and managed services, plus network egress and CDN traffic routed through GCP.[^38][^21][^35]

### 2.3 Qualitative guidance on infra cost drivers

Several official sources shed light on how Etsy manages infrastructure cost:

- **Google Cloud case study:** Google reports that Etsy’s migration to GCP produced a 42 percent reduction in compute costs versus the prior self‑hosted data centers, and more than 50 percent savings in compute energy usage, largely through use of committed use discounts and better utilization.[^21]
- **Kafka zonal resilience:** The Code as Craft post on Kafka’s multi‑zone architecture notes that moving from a single‑zone cluster with regional disks to a three‑zone cluster with zonal disks reduced storage cost but increased inter‑zone network spend, causing an overall roughly 20 percent cost increase for Kafka after the resiliency upgrade.[^12]
- **Cloud Jewels / sustainable computing:** Etsy’s sustainable computing task force developed “Cloud Jewels,” a methodology to convert GCP usage metrics into estimated energy and emissions, and this methodology has been adopted by third‑party tools and even cloud providers themselves, indicating a high degree of instrumentation on cloud usage and its energy/cost implications.[^39][^40][^35]

### 2.4 Gaps and non‑disclosures (infra costs)

- **No cloud‑vendor line items:** Etsy does not disclose annual spend specifically on Google Cloud (or other infrastructure providers), nor a breakdown by compute, storage, network, or managed services.
- **No detailed unit costs:** There is no published “cost per order,” “cost per query,” or “infra cost per GMS” metric.
- **No function‑level splits:** Within cost of revenue, payments versus infra versus support costs are not separately quantified.

## 3. Engineering / R&D / tech headcount (2021–2026)

### 3.1 Total employees

Etsy discloses total headcount in its ESG and 10‑K filings. Aggregated data (cross‑checked with SEC filings and secondary compilers) is:[^11][^1]

| Year | Total employees | Notes |
|------|-----------------|-------|
| 2021 | 2,402 | 2021 Annual Report: 2,402 employees worldwide, including Reverb (245), Depop (390), and Elo7 (184).[^1] |
| 2022 | 2,790 | Headcount table from secondary compilers (sourced from 2022 10‑K) indicates 2,790 employees.[^11] |
| 2023 | 2,420 | 2023 employee count reported as 2,420, implying a reduction of about 13 percent versus 2022, consistent with cost‑control initiatives.[^11][^9] |
| 2024 | 2,400 | 2024 filings note roughly 2,400 employees; stock‑analysis tables show 2,400 with a 0.83 percent year‑over‑year decrease.[^11][^41] |
| 2025 | Not found | 2025 10‑K (in available excerpts) does not explicitly state headcount; secondary data sources had not yet been updated as of April 2026. |
| 2026 | N/A | Too early in the year for headcount disclosures. |

### 3.2 Engineering / R&D composition

Filings and official materials provide only limited insight into engineering‑specific headcount:

- 2021 ESG reporting notes that “globally, the percentage of women and marginalized gender employees in Engineering at Etsy and Reverb stands at 33.1 percent,” but does not give an absolute count for engineering roles.[^1]
- Multiple diversity goals reference “Engineering teams in Mexico and Ireland” and aim to reach approximately twice the national gender‑representation benchmarks by 2027, implying a significant but undisclosed engineering population in those hubs.[^1]
- Google’s cloud case study states that Etsy’s GCP migration allowed the company to shift about **15 percent of engineering headcount** away from infrastructure management and into customer‑facing feature work. This suggests a sizeable infrastructure/SRE organization prior to the migration.[^21]
- A 2025 job posting for “Software Engineer II, Core Kubernetes” describes a Core Kubernetes team that manages 15+ GKE clusters with hundreds of nodes and supports “a few hundred engineers” who deploy workloads onto GKE, again illustrating organizational scale but not explicit headcount.[^42]

Because the SEC filings and official ESG documents do not publish engineering/R&D headcounts or percentages of the workforce by function, engineering headcount by year cannot be reliably reconstructed from public data.

### 3.3 Gaps and non‑disclosures (headcount)

- **No engineering‑only numbers:** Etsy does not disclose the number of engineers, SREs, or data scientists, nor the proportion of total employees that are technical staff.
- **No R&D capitalization disclosures by headcount:** While some software development costs are capitalized (reflected in CapEx), there is no mapping from capitalized costs to engineering FTEs.
- **No breakdown by brand:** Headcount at Depop and (formerly) Reverb is not reported separately from Etsy, except for one‑time 2021 breakdowns at acquisition.

## 4. Capital expenditures (2021–2026)

### 4.1 Reported CapEx

Etsy’s cash‑flow statements report “Purchases of property and equipment” as the main capital‑expenditure line, which includes office build‑outs, equipment, and capitalized software. Across 2021–2025 this line is:[^13][^14][^15][^16]

| Year | Purchases of property and equipment (M USD) | Notes |
|------|--------------------------------------------|-------|
| 2021 | 11.25 | 2022 10‑K cash‑flow statement shows 2021 purchases of property and equipment of 11.248 million dollars.[^14] |
| 2022 | 10.24 | Same filing shows 2022 purchases of property and equipment of 10.237 million dollars.[^14] |
| 2023 | 12.94 | 2023 10‑K / Exhibit 99.1 show 12.938 million dollars of purchases of property and equipment in 2023.[^16] |
| 2024 | 14.21 | 2024 10‑K cash‑flow statement lists 14.208 million dollars of purchases of property and equipment.[^15] |
| 2025 | 15.39 | 2025 10‑K cash‑flow statement shows 15.386 million dollars of purchases of property and equipment.[^13] |
| 2026 | Not yet disclosed | No 2026 cash‑flow statement as of April 2026. |

Given revenue in the 2.3–2.9‑billion‑dollar range, these CapEx levels correspond to roughly **0.4–0.6 percent of revenue**, consistent with Etsy’s asset‑light, cloud‑based model.[^4][^1]

### 4.2 Qualitative context

Filings indicate that Etsy:

- Relies on Google Cloud for most compute and storage, so CapEx is dominated by office‑related spend and capitalized software rather than data‑center build‑outs.[^35][^38][^21]
- Uses a mix of owned offices and leases; right‑of‑use assets for leases and capitalized internal‑use software are accounted for separately from purchases of physical property and equipment.[^36][^1]

There is no evidence of large, one‑off infrastructure CapEx projects (for example, building new data centers) in 2021–2025, aligning with Etsy’s “asset‑light” positioning in its narrative to investors.[^21][^1]

### 4.3 Gaps and non‑disclosures (CapEx)

- **No CapEx breakdown:** Etsy does not break purchases of property and equipment into sub‑categories such as office improvements, hardware, or capitalized software, nor does it publish CapEx by brand or geography.
- **No projected CapEx:** Management does not provide forward‑looking CapEx guidance in filings beyond qualitative statements about maintaining an asset‑light model.

## 5. Stack and platform changes (2021–2026)

### 5.1 High‑level architecture and languages

Public engineering content and case studies indicate that Etsy’s core stack over this period is:

- **Backend languages:** PHP (legacy monolith), plus substantial use of Python and Scala for backend services and data pipelines; job descriptions for backend engineers explicitly list Python, Scala, and PHP as core languages.[^43]
- **Data stores:** A very large sharded MySQL cluster (~1,000 shards, ~425 TB of data, ~1.7 million queries per second) for online transactional data; Etsy is migrating this cluster to Vitess as of a 2026 Code as Craft article.[^20]
- **Caching and edge:** Historical materials describe heavy use of Memcached and CDN caching for static assets and search results, along with HTTP‑level optimizations and TLS everywhere; there is no explicit disclosure of a particular CDN vendor in recent years.[^44][^45]
- **Frontend:** Web frontend built with modern HTML/CSS/JavaScript, with performance‑oriented features such as Priority Hints, prefetching via Speculation Rules API, and Core Web Vitals‑driven tuning; mobile apps use native stacks with adoption of Jetpack Compose on Android and SwiftUI for new features.[^46][^47][^22]

The architectural direction over the last decade has been from a PHP monolith toward microservices and an “API‑first” model, with services deployed onto Kubernetes on Google Cloud.[^48][^49][^42]

### 5.2 Cloud provider and Kubernetes platform

Etsy completed its migration from on‑premises data centers to Google Cloud in early 2020 and has run its production workloads on GCP since then:[^38][^21]

- **Migration scale:** The company moved 5.5 petabytes of data and approximately 2,000 on‑premise servers to Google Cloud, using Google’s infrastructure to run its ecommerce platform and data pipelines.[^38][^21]
- **Compute platform:** Etsy uses Google Kubernetes Engine (GKE) as its primary compute substrate. A Code as Craft post titled “Deploying to Google Kubernetes Engine” describes how services are deployed to GKE, and a Core Kubernetes team job posting notes 15+ GKE clusters with hundreds of nodes running low‑latency services and a Buildkite‑based CI/CD platform for “a few hundred engineers.”[^42][^48]
- **Cost and energy impact:** Google’s case study highlights more than 50 percent savings in compute energy and a 42 percent reduction in compute costs after migrating to GCP, alongside a shift of roughly 15 percent of engineering headcount from infrastructure maintenance to customer‑facing work.[^21]

There is no indication of a second public‑cloud provider being used for primary workloads; all public sources describe GCP as Etsy’s sole cloud platform during this period.[^35][^21]

### 5.3 Data infrastructure and streaming

Several Etsy and third‑party sources describe the evolution of data infrastructure:

- **MySQL and Vitess:** Etsy has long relied on a custom‑sharded MySQL cluster for most online data. By 2026, the company is migrating this cluster to Vitess, an open‑source middleware for scaling and managing large MySQL installations, to improve operational reliability and reduce incident rates.[^20]
- **Kafka on GKE:** A 2023 Code as Craft article “Adding Zonal Resiliency to Etsy’s Kafka Cluster: Part 1” explains how Kafka brokers and clients run on GKE in a regional cluster. Originally, Kafka was deployed in a single availability zone with regional persistent disks to save on inter‑zone network costs; as Kafka became critical for features like search indexing, Etsy re‑architected the cluster to span three zones, using Kubernetes Pod Topology Spread Constraints and Kafka’s rack‑aware replication (broker.rack and client.rack) to ensure that partition replicas are distributed across zones.[^12]
- **Resilience testing:** In 2021, Etsy conducted a company‑wide zonal‑resiliency exercise in production, intentionally “bringing down” an entire GCP zone hosting one third of the Kafka cluster; client applications automatically failed over to surviving brokers and observed minimal, temporary impact, validating the multi‑zone design.[^12]
- **Cost/latency trade‑offs:** The same article notes that eliminating regional disks cut storage costs roughly in half, but inter‑zone network costs drove a roughly 20 percent overall cost increase for Kafka, mitigated partly by enabling follower fetching to preferentially consume from same‑zone replicas at the cost of small replication latency within application SLOs.[^12]

Other sources indicate the use of Kafka for event streaming and analytics, though these are either older or secondary; the authoritative view is that Kafka on GKE is central to Etsy’s streaming and search index pipelines.[^50][^12]

### 5.4 AI / ML training and inference

Etsy’s AI/ML stack has evolved significantly between 2021 and 2026:

- **Classical ML on GCP:** Etsy uses Google Cloud’s Vertex AI, BigQuery, and Dataflow to build foundational datasets and run ML models for understanding inventory, customer intent, and buyer preferences. A 2024 Google Cloud AI case study describes how Etsy created “algotorial curation” workflows that use Gemini models and Vertex AI to expand human‑curated seed collections into large, personalized gift and style collections, achieving an 80x increase in listings per theme and measurable lifts in visits and conversions.[^17]
- **Search, ads, and recommendations:** Filings and engineering content repeatedly highlight machine‑learning‑based ranking and recommendation systems for search results, Etsy Ads, and recommendation surfaces; the GCP case study positions Vertex AI and BigQuery at the center of these systems.[^17][^9]
- **Content moderation:** A Code as Craft article “Machine Learning in Content Moderation at Etsy” (referenced in the Priority Hints article’s sidebar) describes using ML models to detect policy‑violating content, complementing human review.[^22]
- **Generative AI (Gift Mode):** In January 2024, Etsy launched “Gift Mode,” an AI‑driven gift‑recommendation experience that asks the buyer questions about the recipient and occasion and then assigns the recipient to one of about 200 personas, generating curated gift guides. External coverage notes that Gift Mode uses a mix of human curation, Etsy’s own ML, and OpenAI’s GPT‑4 large language model to generate and refine gift suggestions from Etsy’s catalog of over 100 million items.[^51][^18][^19]
- **Vendor mix:** The Google Cloud AI case study indicates that Etsy uses Gemini models via Vertex AI for curation and personalization, while Gift Mode coverage confirms use of OpenAI’s GPT‑4 via API, implying a hybrid vendor strategy where some generative models run on GCP and others via external APIs.[^18][^19][^17]

There is no public evidence that Etsy is training large foundation models from scratch; instead, the company appears to fine‑tune or adapt vendor‑provided models (Gemini, GPT‑4) on its datasets and to continue investing in in‑house classical ML models for ranking and targeting.

### 5.5 Notable 2021–2026 platform changes

Key stack/platform changes or milestones over this period include:

- Full production migration to Google Cloud (completed 2020) and subsequent optimization of compute energy and cost.[^38][^21]
- Adoption and scaling of Google Kubernetes Engine for most services, supported by a dedicated Core Kubernetes team and a Buildkite‑based CI/CD platform.[^48][^42]
- Re‑architecture of Kafka on GKE for multi‑zone resilience, including production zone‑outage testing and follower‑fetch optimization.[^12]
- Development of Cloud Jewels and broader sustainable computing practices to measure and reduce cloud‑energy footprint.[^39][^35]
- Ongoing migration of the large MySQL shard cluster to Vitess to improve availability and manageability at hundreds of terabytes of scale.[^20]
- Introduction of generative‑AI features (Gift Mode and related experiences) backed by OpenAI’s GPT‑4 and Google’s Gemini models via Vertex AI.[^19][^18][^17]

## 6. Authoritative non‑filing sources: architecture, performance, and reliability

### 6.1 Overall system shape and backend architecture

Code as Craft, Google Cloud case studies, and engineering job postings portray Etsy as a large‑scale, service‑oriented system built around a combination of legacy monolith and microservices:

- **Core platform:** A PHP‑based monolithic application remains at the heart of the marketplace, gradually decomposed into services written in Python and Scala that run on GKE, communicating via internal APIs; this is documented in older “API‑first transformation” content and reinforced by modern job descriptions listing these languages as the primary backend stack.[^49][^43]
- **Data layer:** A massive sharded MySQL cluster stores most transactional data, accessed via an internal ORM, with Vitess being introduced as a sharding and management layer to improve reliability.[^20]
- **Streaming and indexing:** Kafka clusters on GKE feed search indexing and other streaming applications; these clusters are configured with rack‑aware replication across zones and follower‑fetching to minimize cross‑zone latency.[^12]
- **Data and AI platform:** BigQuery, Vertex AI, and Dataflow form the core of Etsy’s analytical and ML platform, powering search relevance, recommendations, and gen‑AI‑driven curation.[^17]

This architecture reflects a mature marketplace platform that has steadily layered SRE and ML capabilities on top of a robust transactional core.

### 6.2 Frontend and edge delivery

Several Code as Craft posts and related write‑ups emphasize ongoing work on frontend performance and edge‑delivery strategies:

- **Priority Hints:** A 2022 Code as Craft article details Etsy’s use of the browser’s `fetchpriority` attribute to prioritize hero images on listing pages, leading to a 4 percent improvement (−83 ms at the 75th percentile) in Largest Contentful Paint without hurting business metrics, and helping Etsy maintain Core Web Vitals thresholds important for search rankings.[^22]
- **Speculation Rules & prefetching:** A 2025 LinkedIn post by an Etsy engineer links to a Code as Craft article describing the use of the Speculation Rules API to prefetch listing pages from search results, reducing time to first byte by 23.6 percent at the 75th percentile and effectively driving it to near zero for about 40 percent of browsers that support the feature.[^46]
- **Historical performance reporting:** External commentary notes that Etsy used to publish quarterly “Site Performance Reports” on Code as Craft, tracking median and 95th‑percentile response times for core pages and explaining how specific code changes affected latency, underscoring a culture of transparency and performance focus that continues in more recent posts.[^23][^24]

These sources suggest that Etsy treats frontend performance as a continuous optimization problem, experimenting with new browser features and A/B testing improvements within its in‑house experimentation platform.[^22]

### 6.3 Latency, SLAs, and availability practices

While Etsy does not publish formal SLA numbers, several practices are evident from engineering content:

- **SLO‑driven resilience:** The Kafka resiliency article explicitly mentions that follower fetching is enabled “within our application SLOs,” implying that teams define internal SLOs around acceptable replication latency and service behavior during zone failures.[^12]
- **Production chaos testing:** The zonal‑resiliency initiative included deliberate zone‑failure tests in production for Kafka, demonstrating a willingness to validate availability strategies under realistic conditions rather than relying solely on staging environments.[^12]
- **Public performance metrics (historical):** The older Site Performance Reports tracked latency distributions and correlated them with changes in TLS, caching, and other architectural choices, reflecting an SRE mindset that uses measurement and public reporting to drive performance work.[^45][^24][^23]

No official sources specify a numeric uptime target (for example, “four nines”), nor is there a customer‑facing SLA document for marketplace availability in the filings or main product documentation.

### 6.4 Company engineering culture and practices

Code as Craft and related materials also highlight broader engineering‑culture themes:

- **“Code as Craft” ethos:** Etsy describes coding as a craft, with emphasis on learning, experimentation, and continuous improvement; new engineers historically deploy to production on their first day, and postmortems are oriented toward learning rather than blame.[^52][^53]
- **Experimentation:** Etsy operates its own experimentation platform for A/B tests; both the Priority Hints and Gift Mode roll‑outs are framed as experiments with measured impacts on Core Web Vitals and conversion respectively.[^19][^22]
- **Sustainability:** The Cloud Jewels work and related ESG disclosures show that the engineering organization incorporates energy and carbon considerations into architectural choices (such as the move from self‑hosted data centers to efficient hyperscale cloud infrastructure).[^39][^35][^21]

These cultural factors help explain why Etsy has been able to sustain a relatively complex stack while maintaining strong reliability and performance at marketplace scale.

## Sources

- 2021 Integrated Annual Report and 2021 Form 10‑K (active buyers/sellers, GMS, headcount, energy reporting, cost‑of‑revenue composition).[^36][^7][^3][^1]
- 2022 Annual Report and 10‑K (consolidated GMS, active buyers/sellers SASB metrics, cost‑of‑revenue description).[^29][^33][^2][^34]
- 2023 Form 10‑K and 2023 Integrated Annual Report (consolidated and Etsy‑only GMS, active buyers/sellers, cost‑of‑revenue description).[^2][^5][^27][^9]
- 2024 Form 10‑K and 2024 Integrated Annual Report (consolidated and Etsy‑marketplace active buyers/sellers and GMS, income‑statement figures).[^6][^10][^2][^4]
- 2025 Form 10‑K (consolidated and Etsy‑marketplace active buyers/sellers, GMS, income statement and cash‑flow statement).[^13][^8][^1]
- Etsy investor‑relations income‑statement and cash‑flow tables (cost of revenue, product development expense, capital expenditures).[^14][^15][^16][^10][^8]
- Google Cloud case studies on Etsy’s migration to and use of GCP (GKE, Vertex AI, Gemini, energy and cost reductions).[^17][^38][^21]
- Etsy Code as Craft engineering blog (Kafka zonal resiliency, Priority Hints, performance‑optimization and cultural practices, MySQL‑to‑Vitess migration).
  - “Adding Zonal Resiliency to Etsy’s Kafka Cluster: Part 1.”[^12]
  - “Priority Hints – What Your Browser Doesn’t Know (Yet).”[^22]
  - “Deploying to Google Kubernetes Engine.”[^48]
  - “Migrating Etsy’s database sharding to Vitess.”[^20]
- External coverage of Etsy’s generative‑AI features (Gift Mode) and ML use.[^51][^18][^19]
- Third‑party but well‑sourced metrics aggregators for employee counts and headcount trends.[^41][^11]

## Unknowns and unverifiable items (2021–2026)

- **DAU/MAU:** No public numbers for daily or monthly active users (buyers or sellers); only trailing‑twelve‑month active buyers/sellers are disclosed.
- **Per‑year Etsy‑only active buyers for 2022–2023:** Filings give consolidated figures; Etsy‑marketplace‑only counts are explicitly stated only for 2021, 2024, and 2025.
- **2026 scale metrics:** As of April 2026 there are no year‑end 2026 active‑buyer/seller or GMS disclosures.
- **Detailed cloud/infra cost breakdown:** No published figures for annual spend on Google Cloud or other providers, nor breakdowns by compute, storage, network, or managed services.
- **Engineering/R&D headcount:** No numeric disclosure of engineering, SRE, or data‑science headcount, either in absolute terms or as a percentage of total employees.
- **Per‑category CapEx:** CapEx is not broken down into office, hardware, and capitalized software components.
- **CDN/edge provider specifics:** Recent official sources do not identify which CDN or edge‑network providers Etsy uses.
- **Formal SLAs/SLOs:** There are no public, numeric SLAs (for example, “99.9 percent uptime”) or detailed SLOs per service; only qualitative descriptions of resiliency practices and internal SLO‑driven decisions are shared.

---

## References

1. [Etsy, Inc. Reports Fourth Quarter and Full Year 2022 Results](https://www.prnewswire.com/news-releases/etsy-inc-reports-fourth-quarter-and-full-year-2022-results-301753557.html) - /PRNewswire/ -- Etsy, Inc. (NASDAQ: ETSY), which operates two-sided online marketplaces that connect...

2. [Etsy Inc | 10-K: FY2023 Annual Report - Moomoo](https://www.moomoo.com/hant/news/notice/151554884/etsy-inc-10-k-fy2023-annual-report) - EtsyInc | 10-K: FY2023 Annual Report

3. [[PDF] 2021 Integrated Annual Report - Etsy Investor Relations](https://investors.etsy.com/_assets/_26c2d80389ac544a22b5b6df2ca78050/etsy/db/1016/9709/pdf/Q1_EtsyInc_Etsy_AnnualReport_2021.pdf) - Our sellers generated $13.5 billion of Gross Merchandise sales ... 2021 includes Etsy.com GMS of $12...

4. [[PDF] 2024 Integrated Annual Report - ETSY Investor Relations](https://investors.etsy.com/_assets/_6bbdcca32dae0009d81abf198bd829d6/etsy/db/1016/9829/pdf/2024-Etsy-AR.pdf) - Our sellers generated $12.6 billion of Gross Merchandise Sales (“GMS”) in 2024. Of this, Etsy market...

5. [2023 Integrated](https://www.lobbyregister.bundestag.de/media/a0/f0/380854/etsy-inc-_ar_2024.pdf)

6. [[PDF] 2024 Integrated Annual Report - Etsy, Inc.](https://investors.etsy.com/_assets/_75cbeceedc22525144c188b949f8209c/etsy/db/1016/9712/pdf/2024-Etsy-AR.pdf)

7. [[PDF] Integrated Annual Report - Etsy investor relations](https://investors.etsy.com/_assets/_26c2d80389ac544a22b5b6df2ca78050/etsy/db/1016/9708/pdf/2020-Integrated-Annual-Report_final.pdf) - Cost of revenue primarily consists of the cost of interchange and other fees for credit card process...

8. [Latest Income Statement - ETSY Investor Relations](https://investors.etsy.com/financial-information/income-statement) - Dec. 31, 2024. Dec. 31, 2023. Income Statement [Abstract]. Revenue, $ 2,883,501, $ 2,808,332, $ 2,74...

9. [2023 Integrated Annual Report - Etsy Investor Relations website](https://investors.etsy.com/_assets/_d7ee8700714b0f6cfcd5c437caf5f524/etsy/db/1016/9828/pdf/etsy-inc-_ar_2024.pdf) - Cost of Revenue. Cost of revenue primarily consists of the cost of interchange and other fees for pa...

10. [[PDF] [For website] Q4 2024 Earnings Presentation - Etsy Investor Relations](https://investors.etsy.com/_assets/_f1a0697e02243f0d5855d6f8480d83a3/etsy/db/938/9482/presentation/For-website-Q4-2024-Earnings-Presentation.pdf) - ended 12/31/24. Three months ended 12/31/23. (in thousands). Revenue. $ 852,162. $ 842,322. Cost of ...

11. [Etsy, Inc. (ETR:3E2) Number of Employees](https://stockanalysis.com/quote/etr/3E2/employees/) - Current and historical number of employees for Etsy, Inc. (ETR:3E2) with related statistics, a chart...

12. [Etsy, Inc. Reports Fourth Quarter and Full Year 2021 Results](https://www.prnewswire.com/news-releases/etsy-inc-reports-fourth-quarter-and-full-year-2021-results-301490123.html) - Consolidated GMS for the year ended December 31, 2021 includes Etsy.com GMS of $12.2 billion, Reverb...

13. [[PDF] Etsy, Inc. Reports Fourth Quarter and Full Year 2025 Results](https://investors.etsy.com/_assets/_6bbdcca32dae0009d81abf198bd829d6/etsy/db/938/10062/earnings_release/Exhibit+99.1+12.31.2025.pdf)

14. [[PDF] Etsy, Inc. Reports Fourth Quarter and Full Year 2022 Results](https://investors.etsy.com/_assets/_f1a0697e02243f0d5855d6f8480d83a3/etsy/db/938/9474/earnings_release/Exhibit+99.1+Q4+2022.pdf)

15. [[PDF] Untitled - ETSY Investor Relations](https://investors.etsy.com/_assets/_2f7ef5c6024399316f00a936d422cb05/etsy/db/938/9482/earnings_release/Exhibit+99.1+12.31.2024.pdf) - ... Etsy, driving association that Etsy ... Etsy News Blog (etsy.com/news) to disclose material non-...

16. [99.1 - SEC.gov](https://www.sec.gov/Archives/edgar/data/1370637/000137063724000011/exhibit99112312023.htm) - Under Etsy's stock repurchase program, during the fourth quarter of 2023, Etsy ... Purchases of prop...

17. [Etsy case study - Google Cloud](https://cloud.google.com/customers/etsy-ai) - Etsy uses Google Cloud to understand inventory, customer intent, individual buyers, and create perso...

18. [Etsy Launches Generative AI 'Gift Mode' to Suggest Personalized ...](https://voicebot.ai/2024/01/29/etsy-launches-generative-ai-gift-mode-to-suggest-personalized-presents/) - Etsy has introduced a “Gift Mode” feature, leveraging generative AI to create a personalized gift re...

19. [Etsy Aims For More Gifting...](https://www.digitalcommerce360.com/2024/01/26/etsy-tries-new-gift-mode-recommendations-with-ai/) - Etsy Gift Mode uses machine learning to assign the gift recipient one of 200 personas and recommend ...

20. [Migrating Etsy's database sharding to Vitess](https://www.etsy.com/codeascraft/migrating-etsyas-database-sharding-to-vitess) - Etsy engineers access our MySQL data through a proprietary object-relational mapping (ORM). ... Copy...

21. [Etsy Case Study | Google Cloud](https://cloud.google.com/customers/etsy) - Google Kubernetes Engine · Vertex AI · Looker · Apigee API Management · Cloud ... The bidirectional ...

22. [Etsy, Inc. Reports Fourth Quarter and Full Year 2022 Results | ETSY Stock News](https://www.stocktitan.net/news/ETSY/etsy-inc-reports-fourth-quarter-and-full-year-2022-fc4lmfrtdr9w.html) - Etsy, Inc. reported its Q4 and full year 2022 financial results, highlighting a consolidated revenue...

23. [The Etsy site performance report is amazing - Julia Evans](https://jvns.ca/blog/2016/05/01/the-etsy-site-performance-report/) - The Etsy developer blog (code as craft) publishes a site performance report every quarter. I love th...

24. [Q1 2016 Site Performance Report - Etsy](https://www.etsy.com/uk/codeascraft/q1-2016-site-performance-report) - Q1 2016 Site Performance Report. image. By Natalya Hoota, Allison ... Copyright 2026 Etsy Code as Cr...

25. [Etsy statistics for 2026: Sellers, buyers, sales, and trends | Printful](https://www.printful.com/ca/blog/etsy-statistics) - Etsy has over 86 million active buyers. Etsy's buyer base remains substantial. As of late 2025/early...

26. [ETSY INC (Form: 10-Q, Received: 05/04/2023 06:03:19)](https://content.edgar-online.com/ExternalLink/EDGAR/0001370637-23-000049.html?hash=d7335e3d2e84ef47ddb80f783c765a8afdc98199fe5295cae4e5bcf9caa76b9c&dest=ex105q12023_htm) - ... seller accounts and can count as a distinct active seller in each of our marketplaces. We succee...

27. [[PDF] Q4/FY 2021 Financial Results - Etsy investor relations](https://investors.etsy.com/_assets/_7305615aee1870995ec41526328887fe/etsy/db/938/9470/presentation/Etsy-4Q-Earnings-Feb-28.pdf) - We've seen excellent stability in active buyers - adding 9M in. 2021… and buyers are spending more w...

28. [Etsy, Inc. - As of June 30, 2023 As of December 31, 2022 ASSETS Current assets: Cash and cash equivalents $ 841,512 $ 921,278 Short-term investments 235,263 250,413 Accounts receivable, net 22,594 27,888 Prepaid and other current assets 93,240 80,203 Funds receiv - EX-99.1 - August 02, 2023](https://fintel.io/doc/sec-etsy-inc-1370637-ex991-2023-august-02-19571-2854) - Etsy, Inc. - As of June 30, 2023 As of December 31, 2022 ASSETS Current assets: Cash and cash equiva...

29. [[PDF] Exhibit 99.1 12.31.2022 - Etsy Investor Relations website](https://investors.etsy.com/_assets/_f7cdb279d1e645792fbe571896ba5dd8/etsy/db/938/9474/earnings_release/Exhibit+99.1+Q4+2022.pdf) - The Etsy marketplace's GMS accelerated on a year ... (3) Consolidated active sellers and active buye...

30. [Document - SEC.gov](https://www.sec.gov/Archives/edgar/data/1370637/000137063723000010/exhibit99112312022.htm)

31. [Etsy, Inc. Reports Third Quarter 2023 Results](https://www.stocktitan.net/news/ETSY/etsy-inc-reports-third-quarter-2023-tuhneduvj1r9.html) - BROOKLYN, N.Y., Nov. 1, 2023/ PRNewswire/-- Etsy, Inc., which operates two-sided online marketplaces...

32. [Etsy Inc (ETSY) Q4 2024 Earnings Call Highlights: Record Revenue Amidst GMS Decline](https://finance.yahoo.com/news/etsy-inc-etsy-q4-2024-070538127.html) - Etsy Inc (ETSY) reports a 2% revenue increase to $2.8 billion, despite challenges in GMS and interna...

33. [[PDF] Keep Commerce Human - Etsy investor relations](https://investors.etsy.com/sec-filings/all-sec-filings/content/0001140361-23-020251/0001140361-23-020251.pdf) - Our sellers generated $13.3 billion of Gross Merchandise sales ("GMS”) in 2022. Of this, Etsy market...

34. [13 Top Etsy Statistics For 2026 (Revenue, Market Share, And More)](https://bloggingwizard.com/etsy-statistics/) - What is the state of Etsy? Is it a good platform for creators? Click here to get all the latest Etsy...

35. [Etsy Unveils Innovative Tool to Track Energy Usage in the Cloud](https://www.etsy.com/ca/news/etsy-unveils-innovative-tool-to-track-energy-usage-in-the-cloud) - ... Google Cloud CPU specifications, we derived energy coefficients ... energy footprint in the clou...

36. [etsy-20211231 - SEC.gov](https://www.sec.gov/Archives/edgar/data/1370637/000137063722000024/etsy-20211231.htm) - Our sellers generated $13.5 billion of Gross Merchandise sales (“GMS”) in 2021. Of this, the Etsy ma...

37. [ETSY Stock Analysis — ETSY INC Price Target & Forecast 2027 ...](https://blankcapitalresearch.com/stocks/ETSY) - ETSY / LMT AUDIT ETSY / STNG AUDIT ETSY / NAT ... 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016. Gr...

38. [Etsy Completes Its Migration to Google Cloud in Record Time](https://www.googlecloudpresscorner.com/2020-02-19-Etsy-Completes-Its-Migration-to-Google-Cloud-in-Record-Time) - Now, with its migration complete, Etsy is using Google Cloud's compute power and machine-learning ca...

39. [Using the cloud to scale Etsy - Martin Fowler](https://martinfowler.com/articles/bottlenecks-of-scaleups/etsy-cloud-scale.html) - A team at Etsy researched and created Cloud Jewels, an energy estimation tool, which they open-sourc...

40. [Methodology - Cloud Carbon Footprint](https://www.cloudcarbonfootprint.org/docs/methodology/) - In order to estimate energy used by cloud providers we are leveraging the methodology that Etsy crea...

41. [Etsy, Inc. (BMV:ETSY) Number of Employees](https://stockanalysis.com/quote/bmv/ETSY/employees/) - Current and historical number of employees for Etsy, Inc. (BMV:ETSY) with related statistics, a char...

42. [Software Engineer II, Core Kubernetes at Etsy](https://peerlist.io/company/etsy907/careers/software-engineer-ii-core-kubernetes/jobh6aj7n9b8opjgbio6neg7pmmgnq) - Etsy is hiring with Peerlist for a Full-time Software Engineer II, Core Kubernetes. Required skills:...

43. [Etsy Backend Engineer Interview Preparation Guide - CleverPrep](https://www.cleverprep.com/companies/etsy/backend-engineer) - Etsy's Code as Craft ... •Work with Python, Scala, and PHP across Etsy's service architecture ... Ho...

44. [What does Etsy's architecture look like today? - High Scalability -](https://highscalability.com/what-does-etsys-architecture-look-like-today/) - Here's their general architecture: Etsy's production infrastructure is all bare metal. When it comes...

45. [Etsy has shifted to TLS security sitewide - Technical.ly](https://technical.ly/uncategorized/etsy-shifted-tls-security-sitewide/) - Based on a post on Etsy's Code As Craft blog, it sounds as if this is a ... We know all this because...

46. [David Weinzimmer's Post - Etsy Engineering - LinkedIn](https://www.linkedin.com/posts/dweinzimmer_etsy-engineering-improving-performance-activity-7389356209499291650-2n45) - I don't post much on here, but I'm excited to be able to share a very impactful project I worked on ...

47. [Priority Hints - What Your Browser Doesn't Know (Yet) - Etsy](https://www.etsy.com/codeascraft/priority-hints-what-your-browser-doesnt-know-yet) - Core Web Vitals, which promised to make site performance a component ... Copyright 2026 Etsy Code as...

48. [Deploying to Google Kubernetes Engine - Etsy](https://www.etsy.com/codeascraft/deploying-to-google-kubernetes-engine) - Migrating a service from on-premises Kubernetes to GKE is now (in ... Copyright 2026 Etsy Code as Cr...

49. [API First Transformation at Etsy - Concurrency](https://www.etsy.com/codeascraft/api-first-transformation-at-etsy-concurrency) - If performance, manifesting for the user as latency from request to response, was a problem, what wa...

50. [Adding Zonal Resiliency to Etsy's Kafka Cluster: Part 1](https://www.etsy.com/codeascraft/adding-zonal-resiliency-to-etsys-kafka-cluster-part-1) - ... Kubernetes (GKE). Fast forward a few years: we now have many more ... For such an important prod...

51. [Etsy Launches AI-Powered 'Gift Mode' For Personalized Gift Ideas](https://tech.co/news/etsy-ai-gift-mode) - The new feature will generate over 200 gift guides based on your chosen preferences.

52. [Etsy Engineering | Code as Craft](https://www.etsy.com/codeascraft) - The engineers who make Etsy make our living with a craft we love: software. This is where we'll writ...

53. [Recommended Reading: Etsy, Code as Craft – Joseph Scott](https://blog.josephscott.org/2012/07/16/recommended-reading-etsy-code-as-craft/) - Recommended Reading: Etsy, Code as Craft. Post ... Deploy should be fast and light, just like your d...

