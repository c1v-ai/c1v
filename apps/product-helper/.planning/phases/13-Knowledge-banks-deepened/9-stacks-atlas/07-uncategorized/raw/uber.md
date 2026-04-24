# Uber 2021–2026: scale, cloud, headcount, capex, and stack

## Executive summary

- **Uber's consumer base grew from 118M MAPCs at Q4 2021 to 202M at Q4 2025**, with annual Trips rising from 6.37B to 13.57B and Gross Bookings from $90.4B to $193.5B — a roughly 2.1× expansion over four years.
- **Uber One membership scaled from ~12M (Q4 2022) to 30M (Dec 31, 2024)**; a FY2025 subscriber count was not quantified in the Q4 2025 press release.
- **The February 13, 2023 multi-cloud announcement is the defining infrastructure event of the period**: two separate 7-year deals with Oracle Cloud Infrastructure and Google Cloud, with an aggregate **$2.7B non-cancelable minimum commitment through November 2029** disclosed in the FY2023 10-K (contracts dated November 2022).
- **Uber does not separately disclose cloud, hosting, or infrastructure spend** in its income statement; those costs sit inside "Cost of revenue, exclusive of depreciation and amortization." There is no "Technology and development" line — the R&D-equivalent label is "Research and development."
- **CapEx ("Purchases of property and equipment") is modest and declined then rebounded**: $298M (2021) → $252M (2022) → $223M (2023) → $242M (2024) → $336M (2025). Cloud is opex, not capex.
- **Total headcount moved non-monotonically**: 29,300 (2021) → 32,800 (2022) → 30,400 (2023) → 31,100 (2024) → 34,000 (2025). Uber never discloses engineering headcount as a separate function.
- **Major workforce actions were targeted rather than company-wide**: May 2022 hiring slowdown memo, Uber Freight cuts (Jan 2023 ~150, Jul 2023 ~40–50, Jan 2024 ~40–50), recruiting team (~200 in June 2023), and Drizly shutdown (~168 in early 2024). No Uber-wide mass layoff comparable to Meta/Google/Microsoft occurred.
- **Stack direction is clear**: Go + Java dominate the backend; Docstore (MySQL/MyRocks) displaces Schemaless and portions of DynamoDB; Apache Pinot scales real-time OLAP; Michelangelo absorbed a GenAI layer (Triton, Ray-on-Kubernetes, a GenAI Gateway fronting OpenAI and Google Vertex AI); Mesos is deprecated, Kubernetes now runs stateless, batch, and increasingly stateful workloads across on-prem + OCI + GCP.

---

## 1. Scale — users and activity (2021–2026)

All figures below are pulled from Uber's 8-K earnings press releases (Exhibit 99.1) and 10-K filings. Exact metric labels are as Uber defines them in its filings.

**Quarterly snapshot at Q4 of each year (Uber's primary disclosure cadence for MAPCs):**

| Metric | Q4 2021 | Q4 2022 | Q4 2023 | Q4 2024 | Q4 2025 |
|---|---|---|---|---|---|
| Monthly Active Platform Consumers ("MAPCs"), millions | 118 | 131 | 150 | 171 | **202** |
| Trips, millions | 1,769 | 2,104 | 2,601 | 3,068 | 3,751 |
| Gross Bookings total, $M | 25,866 | 30,749 | 37,575 | 44,197 | **54,140** |
| — Mobility Gross Bookings, $M | 11,340 | 14,894 | 19,285 | 22,798 | 27,442 |
| — Delivery Gross Bookings, $M | 13,444 | 14,315 | 17,011 | 20,126 | 25,431 |
| — Freight Gross Bookings, $M | 1,082 | 1,540 | 1,279 | 1,273 | 1,267 |

**Full-year totals:**

| Metric | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 |
|---|---|---|---|---|---|
| Trips, millions | 6,368 | 7,642 | 9,448 | 11,273 | **13,567** |
| Gross Bookings, $M | 90,415 | 115,395 | 137,865 | 162,773 | **193,454** |
| Revenue, $M | 17,455 | 31,877 | 37,281 | 43,978 | 52,017 |

**Uber One membership (when quantified):** "nearly 12 million members" at end of Q4 2022; "surpassed 25 million" in Q3 2024; **30 million as of December 31, 2024** (per FY2024 10-K). FY2025 not quantified in the Q4 2025 press release dated Feb 4, 2026.

**DAU/MAU equivalents:** Uber does not report a DAU or MAU in the standard sense. MAPCs is its sole audience metric, defined as unique consumers completing a Mobility ride or Delivery order at least once in a given month, averaged over each month in the quarter. Q4 2025 CEO commentary restated this as "more than 200 million monthly users completing more than 40 million trips every day" — a rhetorical restatement, not a new metric.

**2026 status:** Q1 2026 earnings have not yet been released as of April 23, 2026. Uber announced on April 14, 2026 that its Q1 2026 conference call is scheduled for **May 6, 2026**. Management guidance for Q1 2026: Gross Bookings of **$52.0B–$53.5B** (17–21% YoY constant-currency), Adjusted EBITDA $2.37B–$2.47B.

**Quoted metric definitions (Q4 2025 8-K):** MAPCs counts a unique consumer only once even when using multiple products. Trips counts each completed Mobility ride or Delivery order ("an UberX Share ride with three paying consumers represents three unique Trips"). Gross Bookings is total dollar value of Mobility rides, Delivery orders, and Freight revenue, **excluding driver tips**.

**Not found:** Full-year Mobility/Delivery/Freight Gross Bookings splits (only quarterly segment splits appear in press releases; full-year splits are in the 10-K Segment Information footnote, not retrieved this session). Monthly Trips-per-MAPC only consistently disclosed from 2023 onward.

---

## 2. Cloud and infrastructure costs (2021–2026)

**The February 13, 2023 cloud deals.** Uber publicly announced two separate seven-year partnerships on the same day:

- **Oracle Cloud Infrastructure (OCI):** "seven-year strategic cloud partnership" to move "some of the company's most critical workloads" to OCI. No dollar value disclosed by Oracle or Uber.
- **Google Cloud Platform (GCP):** "expanded multi-year partnership" (reported as seven years by trade press) covering data infrastructure modernization, plus Google Maps Platform for routing and Google Ads. No dollar value disclosed.

Trade coverage (Data Center Dynamics, CIO Dive, Tech Monitor, SiliconANGLE) confirms that at announcement **~95% of Uber's IT was in its own data centers** and the objective was eventual retirement of on-prem data centers, with Uber's Kamran Zargahi stating Uber expected to spend "less than its current outlay on data centres."

**The 10-K disclosure (Commitments and Contingencies, Note 14, FY2023 10-K):**

> "In November 2022, we entered into commercial technology agreements with vendors for cloud computing services ('2022 Cloud Computing Service Agreements'). We are committed to spend an aggregate of at least **$2.7 billion through November 2029**, of which $291 million is short-term… As of December 31, 2023, we had $3.0 billion in non-cancelable commitments, this includes the $2.7 billion in 2022 Cloud Computing Service Agreements."

The contracts pre-date the February 2023 public announcement. Uber does not name Oracle or Google in the 10-K itself; trade press confirms counterparties. The Oracle and Google commitments are aggregated — not split individually.

**Operating-expense line items (exact labels from 10-K consolidated statements of operations):**

| Line item ($M) | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 |
|---|---|---|---|---|---|
| Cost of revenue, exclusive of depreciation and amortization shown separately below | 9,351 | 19,659 | 22,457 | 26,651 | 31,338 |
| Operations and support | 1,877 | 2,413 | 2,689 | disclosed in 10-K | disclosed in 10-K |
| Research and development | 2,054 | 2,798 | 3,164 | 3,109 | disclosed in 10-K |
| Depreciation and amortization | 902 | 947 | 823 | 711 | disclosed in 10-K |

There is **no "Technology and development" line** in Uber's filings — the correct label is "Research and development." There is no standalone "cloud," "hosting," or "infrastructure" line; those costs are embedded in "Cost of revenue, exclusive of depreciation and amortization" (which also contains insurance, driver-related, and payment-processing costs).

**Risk factor language (FY2024 10-K):** "We rely on co-located data centers for the operation of our platform"; "We rely on third-party service providers to host or otherwise process some of our data." The 10-K does not name Oracle, Google, or AWS in risk-factor text.

**What cannot be isolated from filings:** the Oracle-specific dollar commitment, the Google-specific dollar commitment, annual cloud run-rate spend, any split between compute/storage/networking, or data-center exit costs.

---

## 3. Engineering, R&D, and tech headcount (2021–2026)

**Total employees per 10-K Human Capital section:**

| As of Dec 31 | Employees (10-K exact phrasing) |
|---|---|
| 2021 | "approximately **29,300** employees globally" |
| 2022 | "approximately **32,800** employees globally" |
| 2023 | "approximately **30,400** employees globally" |
| 2024 | "approximately **31,100** employees globally"; "approximately 18,000 were located outside the United States" |
| 2025 | "approximately **34,000** employees globally" |

**Uber does not disclose a functional breakout** (engineering vs. operations vs. support) in its 10-K Human Capital section. The only disaggregation published is U.S. vs. non-U.S. (FY2024: ~13,100 U.S. / ~18,000 non-U.S.). Diversity/EEO-1 reports show demographic splits but not engineering-specific totals.

**Workforce actions during 2022–2025.** Uber's approach was markedly more targeted than the Meta/Google/Microsoft pattern of 10%+ company-wide cuts.

- **May 8, 2022 — CEO "hiring as a privilege" memo.** Dara Khosrowshahi email cited a "seismic shift" in markets and committed to treat hiring as a privilege and be "hardcore on costs." This was a hiring slowdown, not a layoff.
- **January 24, 2023 — Uber Freight Round 1.** ~150 cuts, ~3% of Freight's workforce, concentrated in digital brokerage.
- **June 21–22, 2023 — recruiting team.** ~200 recruiting/talent-acquisition cuts; WSJ estimated this was ~35% of Uber's recruiting function.
- **July 2023 — Uber Freight Round 2.** ~40–50 additional brokerage positions.
- **January 2024 — Drizly shutdown.** ~168 Boston-area layoffs tied to closing the $1.1B 2021 Drizly acquisition.
- **January 2024 — Uber Freight Round 3.** ~40–50 more brokerage/legacy-Transplace roles.
- **Late 2025 — Uber Freight commercial reorg** under new CCO D'Andrae Larry; layoff numbers not disclosed.

Net hiring outweighed cuts in most years: headcount fell only once (2022 → 2023) before rebounding. No company-wide mass layoff was announced in 2021–2025.

**Not found / not disclosed:** Engineering-specific headcount, product-line allocation (Mobility/Delivery/Freight/Platform), attrition rates, or explicit restructuring charges large enough to break out.

---

## 4. CapEx (2021–2026)

From the investing-activities section of each 10-K cash flow statement, exact line-item label **"Purchases of property and equipment"**:

| Fiscal year | Purchases of property and equipment |
|---|---|
| FY2021 | $(298)M |
| FY2022 | $(252)M |
| FY2023 | $(223)M |
| FY2024 | $(242)M |
| FY2025 | $(336)M |

**Interpretation.** Uber's capex is modest relative to scale because it is a platform business with minimal owned fleet and, increasingly, third-party cloud rather than owned data centers. The 2025 uptick is the largest annual figure in the period but remains well under 1% of Gross Bookings.

**Capitalized software.** The FY2023 10-K Property & Equipment footnote states: "Amortization of capitalized software development costs was not material for the years ended December 31, 2021, 2022 and 2023." This confirms Uber capitalizes minimal internal software.

**Data center / cloud capex.** **Not separately broken out.** Uber's cloud spend flows through operating expenses (primarily Cost of revenue), not capex. Leased-computer-equipment depreciation was $217M (2021), $186M (2022), and $187M (2023); principal payments on finance leases were $(226)M (2021), $(184)M (2022), $(171)M (2023), $(172)M (2024), and $(157)M (2025), reflecting legacy server financing that is winding down as on-prem capacity retires.

---

## 5. Stack and platform changes, 2021 → 2026

**Programming languages.** Go and Java are now explicitly Uber's "primary programming languages used in Uber's backend infrastructure" per the July 2024 GenAI Gateway blog. The Fx dependency-injection framework (github.com/uber-go/fx) is described as **"the backbone of nearly all Go services at Uber."** Python remains the lingua franca for ML/data science. Node.js persists on some web/edge paths but has faded from backend dominance; no Uber blog post explicitly announces a Node.js deprecation.

**Cloud providers.** The Feb 13, 2023 announcement is the central inflection point. Five years of detail has now emerged:

- **OCI handles trip-serving.** Per Oracle's CloudWorld 2024 release (Sept 11, 2024): OCI runs Uber's "application trip-serving requests" on AMD Compute, stateless workloads on Ampere Arm, "dozens of AI models" on OCI AI Infrastructure, and "a portion of its big data HDFS environment" with OCI Object Storage. Oracle cited "14 million predictions per second" and "more than one million trips every hour" powered on OCI.
- **GCP handles data + ML + Spanner + Maps/Ads.** Uber's 2023 blog "Modernizing Uber's Data Infrastructure with GCP" describes migrating batch data (Hadoop, >1 EB) and ML training stacks to Google Cloud. Cloud Spanner underpins the Fulfillment Platform (billions of transactions/day). Maps Platform and Google Ads integrations extend the deal.
- **AWS status is unclear.** Uber deprecated DynamoDB for major workloads (LedgerStore, Gulfstream) but no primary Uber source confirms full AWS exit. Quasi-official commentary references "hybrid" usage.
- **On-prem still present as of 2024.** The Kubernetes migration blog notes "more than 50 compute clusters across multiple regions/zones on both on-prem data centers and cloud providers like Oracle Cloud and Google Cloud."

**Compute platform.** Mesos was deprecated in 2021. The "Up" platform (2022–2023) gave microservices cloud-portable packaging; 2M+ cores migrated from µDeploy to Up. Migration to Kubernetes completed for stateless workloads in 2024 (peak 300,000 cores/week; clusters of 5,000–7,500 nodes, 200K pods, 150 pods/sec scheduling). Peloton → Kubernetes for batch/deep-learning. Odin (stateful) is now migrating too; it manages 3.45 EB of disk across 100,000 hosts, 300,000 workloads, 3.8M containers.

**Data stores.** Docstore (Uber's distributed SQL on MySQL/MyRocks with Raft, strict serializability, CDC, materialized views) has displaced Schemaless for most new use. A 2023 blog reports CacheFront (integrated Redis cache on Docstore) serves **>40M reads/sec**. Trillion-record + petabyte migrations from DynamoDB to LedgerStore reportedly save ~$6M/year. Apache Pinot scaled to >1M writes/sec and hundreds of millions of daily queries; 2025 posts document replacing the Neutrino/Presto-based query layer with Pinot's Multi-Stage Engine "Lite Mode." Uber remains on PrestoDB (not Trino); a 2025 PrestoDB blog describes Uber's Alluxio distributed cache fronting Presto, which reads **>300 PB per week**, contributing over 70% of data-lake read traffic. Cassandra, Elasticsearch, etcd, ClickHouse, M3, and Kafka all remain in production per the Odin and multi-cloud secrets posts.

**AI/ML.** Uber's 2024 blog "From Predictive to Generative AI" articulates three phases of Michelangelo — predictive (2016–2019), deep learning (2019–2023), and GenAI (2023+). Key current numbers: **~400 active ML projects, 20K training jobs/month, 5K+ production models, 10M real-time predictions/sec at peak.** Neuropod is being deprecated as the serving engine in favor of Triton (supports TF, PyTorch, Python, XGBoost, GPU-optimized). Training moved to **Ray on Kubernetes** during 2024. The GPU fleet exceeds **5,000 GPUs** across on-prem + OCI + GCP.

The **GenAI Gateway** (July 2024) is a Go service that fronts OpenAI, Google Vertex AI, and in-house LLMs behind a single OpenAI-compatible API, with PII redaction and safety guardrails, serving **60+ LLM use cases**. Genie (the on-call copilot) uses OpenAI embeddings + a vector store + RAG. QueryGPT translates natural language to SQL. **Anthropic is not mentioned** in any Uber Engineering post identified.

---

## 6. Architecture insights from Uber Engineering and company materials

**Overall shape.** Uber operates a Domain-Oriented Microservice Architecture (DOMA), introduced in a 2020 post by Adam Gluck, which grouped ~2,200 microservices into ~70 domains. By 2023, Uber's "Up" blog describes "4,500 stateless microservices… deployed more than 100,000 times [per week] by 4,000 engineers." The 2025 multi-cloud secrets post cites "over 5,000 microservices." Service half-life is quoted as **~1.5 years**, meaning ~50% of services churn every 18 months.

**Backend: RPC, DI, gateway, tracing.** YARPC remains Uber's multi-protocol RPC framework (Go + Java; packages still published at go.uber.org/yarpc). Fx is pervasive in Go services. The Edge Gateway — Uber's third-generation API gateway — generates Go code from YAML + Thrift/Protobuf IDLs and centralizes L7 concerns (rate-limiting, authentication, DC affinity, protocol translation); InfoQ covered it in 2021 and Uber has published multiple follow-ups on its build pipeline and JSON-Iter replacement of EasyJSON. Uber does not publicly name a service mesh like Istio or Linkerd; Jaeger sidecar agents on every host plus Edge Gateway deliver many service-mesh-like capabilities. Jaeger (CNCF-graduated, Uber-originated) remains the tracing backbone. Workflow orchestration uses Cadence (Uber-originated).

**Frontend and edge.** Historical mobile stack: Android (Java/Kotlin) and iOS (Swift/Objective-C) with monorepos, weekly train releases, and server-side feature flags. Historical web: Node.js (Bedrock/Express) with React and Flux. No 2021–2026 Uber Engineering post authoritatively updates the web framework direction. **No Uber post identifies the CDN vendor** for uber.com or mobile API edge delivery.

**Published reliability and scale numbers.** Core storage platform runs at **"99.99% or more" availability** (CacheFront blog, 2023). Docstore handles tens of millions of requests/sec; Pinot exceeds 1M writes/sec with <500 ms latency; Michelangelo peaks at 10M real-time predictions/sec; Oracle's CloudWorld 2024 release cites 14M predictions/sec and >1M trips/hour on OCI; Kubernetes clusters sustain "1.5 million pod launches a day at the rate of 120–130 pods/second in a single cluster." These numbers are published in Uber Engineering blogs and official vendor releases, not in SEC filings.

---

## Conclusion

Uber's 2021–2026 story is **platform leverage without capital intensity**: 2.1× growth in Trips and Gross Bookings accompanied by capex under $340M annually and total headcount rising only ~16%. The strategic reshape is infrastructural — an on-prem fleet that ran ~95% of workloads in early 2023 is being drained into a two-horse cloud tenancy (OCI for transactional + AI inference, GCP for data + ML training + Spanner + Maps) under a $2.7B seven-year minimum commitment. The engineering platform followed suit: Mesos out, Kubernetes in; Schemaless and DynamoDB shrinking; Docstore, Pinot, and Michelangelo-with-GenAI-Gateway scaling. The filings obscure more than they reveal on infrastructure economics — investors see one Cost-of-Revenue line where operators see a cloud migration of historic scope — but the engineering blog, Oracle's CloudWorld releases, and the 10-K's purchase-commitments footnote together make the direction unambiguous.

---

## Sources

**SEC filings (primary)**
- https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001543151&type=10-K — SEC EDGAR Uber 10-K index
- https://www.sec.gov/Archives/edgar/data/0001543151/000154315122000008/uber-20211231.htm — Uber FY2021 10-K
- https://www.sec.gov/Archives/edgar/data/0001543151/000154315123000010/uber-20221231.htm — Uber FY2022 10-K
- https://www.sec.gov/Archives/edgar/data/1543151/000154315124000012/uber-20231231.htm — Uber FY2023 10-K (cloud commitments note)
- https://www.sec.gov/Archives/edgar/data/1543151/000154315125000008/uber-20241231.htm — Uber FY2024 10-K (30M Uber One disclosure)
- https://www.sec.gov/Archives/edgar/data/0001543151/000154315126000015/uber-20251231.htm — Uber FY2025 10-K
- https://www.sec.gov/Archives/edgar/data/0001543151/000154315122000004/uberq421earningspressrelea.htm — Q4/FY2021 earnings release
- https://www.sec.gov/Archives/edgar/data/1543151/000154315123000004/uberq422earningspressrelea.htm — Q4/FY2022 earnings release
- https://www.sec.gov/Archives/edgar/data/1543151/000154315124000008/uberq423earningspressrelea.htm — Q4/FY2023 earnings release
- https://www.sec.gov/Archives/edgar/data/1543151/000154315125000004/uberq424earningspressrelea.htm — Q4/FY2024 earnings release
- https://www.sec.gov/Archives/edgar/data/1543151/000154315126000011/uberq425earningspressrelea.htm — Q4/FY2025 earnings release
- https://www.sec.gov/Archives/edgar/data/0001543151/000154315124000033/uberq324earningspressrelea.htm — Q3 2024 earnings (Uber One 25M+)
- https://investor.uber.com/news-events/news/press-release-details/2026/Uber-Announces-Date-of-First-Quarter-2026-Results-Conference-Call/default.aspx — Q1 2026 earnings call date

**Cloud deal press releases (Feb 13, 2023)**
- https://www.oracle.com/apac/news/announcement/uber-selects-oracle-cloud-infrastructure-2023-02-13/ — Oracle OCI deal press release
- https://www.prnewswire.com/news-releases/uber-selects-oracle-cloud-infrastructure-301744754.html — Oracle deal, PR Newswire mirror
- https://www.googlecloudpresscorner.com/2023-02-13-Google-and-Uber-Deepen-Partnership-to-Reimagine-the-Customer-Experience — Google Cloud deal release
- https://www.oracle.com/news/announcement/ocw24-uber-runs-on-oracle-cloud-infrastructure-2024-09-11/ — Oracle CloudWorld 2024 Uber workload detail
- https://cloud.google.com/blog/products/databases/announcing-cloud-spanner-price-performance-updates — Uber DE quote on Cloud Spanner

**Trade press on cloud deal and migration**
- https://www.datacenterdynamics.com/en/news/uber-picks-oracle-and-google-for-7-year-cloud-contracts-closing-its-own-data-centers/ — DCD on 7-year contracts + DC closure
- https://www.ciodive.com/news/Uber-cloud-partnership-google-oracle/642651/ — CIO Dive on multi-cloud strategy
- https://www.techmonitor.ai/hardware/cloud/uber-google-oracle-cloud — Tech Monitor on spend expectations
- https://siliconangle.com/2023/02/13/uber-goes-multicloud-announcing-big-deals-oracle-google/ — SiliconANGLE on deal scope
- https://www.thestack.technology/uber-cloud-migration-oracle-cloud-google-cloud/ — The Stack with Oracle EVP quote
- https://newsletter.pragmaticengineer.com/p/inside-ubers-move-to-the-cloud-part — Pragmatic Engineer deep dive

**Workforce actions**
- https://www.cnbc.com/2022/05/09/uber-to-cut-down-on-costs-treat-hiring-as-a-privilege-ceo-email.html — May 2022 CEO hiring memo
- https://fortune.com/2022/05/09/uber-ceo-dara-khosrowshahi-tells-staff-memo-hiring-privilege-hardcore-on-costs/ — Fortune on hiring memo
- https://investorplace.com/2023/01/uber-layoffs-2023-what-to-know-about-the-latest-uber-freight-job-cuts/ — Jan 2023 Uber Freight ~150 cuts
- https://www.business-standard.com/world-news/uber-layoffs-2023-uber-technologies-to-lay-off-200-employees-in-its-recruitment-division-123062200378_1.html — June 2023 recruiting cuts ~200
- https://finance.yahoo.com/news/uber-freight-lays-off-many-154657687.html — July 2023 Freight Round 2
- https://www.boston.com/news/business/2024/02/05/uber-drizly-to-lay-off-168-boston-workers/ — Drizly shutdown WARN notice
- https://www.freightcaviar.com/uber-freight-cuts-jobs/ — Jan 2024 Freight Round 3
- https://www.freightwaves.com/news/uber-freight-cuts-jobs-amid-commercial-reorganization — Late 2025 Freight reorg

**Uber Engineering blog — platform and data**
- https://www.uber.com/blog/microservice-architecture/ — DOMA microservice architecture (2020)
- https://www.uber.com/blog/gatewayuberapi/ — 3 generations of Uber API gateway
- https://www.uber.com/blog/architecture-api-gateway/ — Edge Gateway architecture
- https://www.uber.com/blog/scaling-api-gateway/ — Scaling Edge Gateway
- https://www.uber.com/blog/up-portable-microservices-ready-for-the-cloud/ — Up multi-cloud platform (2023)
- https://www.uber.com/blog/migrating-ubers-compute-platform-to-kubernetes-a-technical-journey/ — Mesos → Kubernetes (2024)
- https://www.uber.com/blog/migrating-large-scale-compute-workloads-to-kubernetes/ — Peloton → Kubernetes (2024)
- https://www.uber.com/blog/odin-stateful-platform/ — Odin stateful platform
- https://www.uber.com/blog/the-accounter/ — Odin operation coordinator
- https://www.uber.com/blog/building-ubers-multi-cloud-secrets-management-platform/ — Multi-cloud secrets (2025)
- https://www.uber.com/blog/modernizing-ubers-data-infrastructure-with-gcp/ — GCP data infrastructure (2023)

**Uber Engineering blog — data stores**
- https://www.uber.com/blog/schemaless-sql-database/ — Schemaless/Docstore architecture
- https://www.uber.com/blog/how-uber-serves-over-40-million-reads-per-second-using-an-integrated-cache/ — CacheFront on Docstore (2023)
- https://www.uber.com/blog/mysql-to-myrocks-migration-in-uber-distributed-datastores/ — MyRocks migration (2023)
- https://www.uber.com/blog/differential-backups-on-myrocks/ — MyRocks backups (2024)
- https://www.uber.com/blog/dynamodb-to-docstore-migration/ — DDB → LedgerStore (2022)
- https://www.uber.com/blog/migrating-from-dynamodb-to-ledgerstore/ — Trillion-record DDB → LedgerStore (2024)
- https://www.uber.com/blog/building-ubers-fulfillment-platform/ — Fulfillment on Cloud Spanner
- https://www.uber.com/blog/pinot-for-low-latency/ — Pinot offline tables
- https://www.uber.com/blog/rebuilding-ubers-apache-pinot-query-architecture/ — Pinot MSE Lite Mode (2025)
- https://www.uber.com/blog/building-zone-failure-resilience-in-apache-pinot-at-uber/ — Pinot zone failure resilience (2025)
- https://prestodb.io/blog/2025/08/08/unlocking-petabyte-scale-performance-ubers-journey-with-alluxio-distributed-cache/ — Alluxio + Presto at Uber (2025)

**Uber Engineering blog — AI/ML**
- https://www.uber.com/blog/from-predictive-to-generative-ai/ — Michelangelo three phases + GenAI (2024)
- https://www.uber.com/blog/scaling-ai-ml-infrastructure-at-uber/ — AI/ML infra on OCI + GCP (2024)
- https://www.uber.com/blog/genai-gateway/ — GenAI Gateway (Jul 2024)
- https://www.uber.com/blog/genie-ubers-gen-ai-on-call-copilot/ — Genie on-call copilot
- https://www.uber.com/blog/open-source-and-in-house-how-uber-optimizes-llm-training/ — LLM fine-tuning on Ray
- https://www.uber.com/blog/ubers-journey-to-ray-on-kubernetes-ray-setup/ — Ray on Kubernetes (2025)

**Other tech press and references**
- https://www.infoq.com/news/2021/06/uber-api-gateway/ — InfoQ on API gateway
- https://www.infoq.com/news/2024/05/uber-dynamodb-ledgerstore/ — InfoQ on LedgerStore
- https://www.infoq.com/news/2024/09/uber-genai-gateway-llm-openai/ — InfoQ on GenAI Gateway
- https://www.infoq.com/news/2025/05/uber-journey-ray-kubernetes/ — InfoQ on Ray on Kubernetes
- https://github.com/uber-go/fx — Fx DI framework README
- https://pkg.go.dev/go.uber.org/yarpc — YARPC Go packages

---

## Unknowns — what could not be verified for 2021–2026

1. **Dollar value of the Oracle deal specifically and the Google Cloud deal specifically.** The 10-K discloses only the combined $2.7B minimum commitment through November 2029.
2. **Annual cloud run-rate spend.** Embedded in "Cost of revenue, exclusive of D&A"; no line-item split.
3. **Full-year Mobility / Delivery / Freight Gross Bookings splits** for each year — available in 10-K Segment Information footnotes but not extracted in this research; only quarterly splits are in press releases.
4. **Uber One member count for FY2025** — not quantified in the Q4 2025 press release.
5. **Engineering-specific headcount** — never disclosed in any 10-K Human Capital section. Only total and U.S./non-U.S. splits.
6. **2025 aggregate layoff count** — a late-2025 Uber Freight commercial reorg occurred but the number was not disclosed; no Uber-wide mass layoff appears to have been announced.
7. **Capitalized software or data-center-specific capex** — not separately broken out; 10-K footnote says capitalized-software amortization is "not material."
8. **Specific FY2024 and FY2025 purchase-commitments totals** — the $2.7B / through-November-2029 structure is confirmed in the FY2023 10-K; updated totals were not captured from search snippets for FY2024/FY2025 10-K Note 14 (likely similar or slightly reduced as the short-term portion is drawn down).
9. **CDN vendor** for uber.com and mobile API edge delivery — no primary Uber source names Akamai, Cloudflare, Fastly, or any specific CDN.
10. **Full AWS deprecation status.** DynamoDB is largely exited; broader AWS usage status is publicly ambiguous — no Uber Engineering blog confirms a complete AWS wind-down.
11. **Anthropic/Claude usage at Uber.** The GenAI Gateway blog names only OpenAI and Google Vertex AI; Anthropic is not mentioned in any Uber post identified.
12. **Formal Node.js backend deprecation.** Widely discussed in secondary blogs but no Uber Engineering post explicitly announces deprecation.
13. **Service mesh product choice.** Uber does not publicly name Istio, Envoy, or Linkerd; Jaeger + Edge Gateway fill many service-mesh-like roles.
14. **Exact OCI-vs-GCP workload split percentages.** Qualitative picture is clear (OCI = trip-serving + AI inference + some HDFS; GCP = batch + ML training + Spanner + Maps/Ads) but no quantitative split disclosed.
15. **PrestoDB vs. Trino at Uber.** Uber remains on PrestoDB per 2023–2025 PrestoCon materials; no indication of a Trino switch was found.
16. **Web frontend framework evolution 2021–2026.** Historical React + Flux + Node.js baseline is documented; no authoritative 2021+ post updates this.
17. **Exact on-prem data center closure timeline.** CEO statements reference a "seven-year journey" through ~2030; no specific DC closure dates published.
18. **Q1 2026 financial results.** Not yet released as of April 23, 2026; earnings call scheduled for May 6, 2026.