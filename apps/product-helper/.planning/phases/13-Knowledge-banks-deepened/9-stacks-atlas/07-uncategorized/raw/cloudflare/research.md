---
company: cloudflare
kind_hint: public
has_10k: true
source_url: "https://www.sec.gov/Archives/edgar/data/1477333/000147733326000016/cloud-20251231.htm"
retrieved_at: "2026-04-23T04:00:00Z"
publish_date: "2026-02-26"
source_tier: "A_sec_filing"
sha256: "b2e19963a1e3df97eb84d21d1c65b49a660a9e7ebab3f3a052e101a46fae18a0"
filing_type: "10-K"
author: "Cloudflare, Inc. / SEC filing + synthesis across 5 tier-B engineering posts"
is_ic: false
scraper_version: "v2"
---

# Cloudflare 2021–2026: connectivity-cloud scale, AI-edge pivot, and the Rust core rewrite

## Executive summary

- **Revenue hit $2.17B in FY2025 at 29.8% YoY growth**, with gross margin holding at 74.5% and operating margin crossing into meaningful positive territory (9.6%, up from 9.3%) — Cloudflare is now a profitable growth company rather than a burn-and-scale one.
- **Paying customer count reached 254,961 at YE2025** (up from ~211,000 YE2024, +21% YoY); the >$100K ARR "large customer" cohort is the real growth vector but is not extracted here (requires deeper 10-K read).
- **Capex jumped 70.6% YoY to $315.6M** — this is the tell on infrastructure buildout, markedly faster than revenue growth. Network expansion + GPU rollout for Workers AI is the likely driver; FY2024 capex was only $185M.
- **Employee base grew from 4,263 → 5,156 in a year** (+20.9%), with 2,452 of those (~47.6%) located outside the United States — true globally-distributed workforce supporting a ~300-PoP edge network.
- **Network edge is roughly 200+ cities globally** (narrative, not exact YE2025 count disclosed in fetched sources) with the FL-2 / oxy Rust rewrite now the default proxy path — Cloudflare's September 2025 Birthday Week wrap cited ~10ms median latency improvement and **10× cold-start reduction** on Workers.
- **R2 object storage (S3 alternative) is priced with zero egress fees** — $0.015/GB storage, $4.50/M Class A writes, $0.36/M Class B reads, no egress. This is the canonical competitive-pricing disclosure for the cost_curve prior on object-storage decision nodes.
- **Workers AI went GA September 2023 with serverless GPU inference**, launched with 7 cities at GA, targeted ~100 by end of 2023, "nearly everywhere" by end of 2024. Neurons pricing ($0.01 / $0.125 per 1K regular/fast neurons) is the cleanest tier-B ai_stack cost anchor for inference-as-a-service. Models hosted include Llama-2-7b-chat-int8, Whisper, m2m100-1.2, distilbert-sst-2-int8, resnet-50, bge-base-en-v1.5.
- **V8 isolate architecture (not containers) is the architectural invariant** — Workers runs Chrome's V8 engine on servers directly; this is why cold-start latency drops ~10× vs container-per-request models. Workers for Platforms is designed to manage "hundreds of thousands to millions" of isolates per tenant.
- **Connection-encryption pivot**: Cloudflare auto-upgraded 6 million domains during FY2025, citing a jump from 10% to 95% of Internet traffic being encrypted — this is policy-driven infra leverage, not a revenue driver but a material security posture claim.

---

## 1. Scale — customers, traffic, and network footprint (2021–2026)

Cloudflare's primary financial reported metric is **"paying customers"** (contracts, not seats). Traffic metrics (requests/sec, queries/sec, PoP counts) are disclosed narratively in engineering blog posts and investor presentations, rarely in 10-K proper.

| Metric                                 | FY2023 | FY2024   | FY2025   | Source tier |
|----------------------------------------|--------|----------|----------|-------------|
| Paying customers (year-end)            | ~182K  | ~211K    | **254,961** | A (10-K) |
| Revenue ($M)                           | 1,297  | 1,669    | **2,168**   | A (10-K) |
| YoY growth                             | 33%    | 29%      | **29.8%** | A (10-K) |
| Employees (total)                      | 3,682  | 4,263    | **5,156**   | A (10-K) |
| Employees (international)              | —      | —        | **2,452 (47.6%)** | A (10-K) |
| Network PoPs (cities, narrative)       | ~300   | ~330     | ~330+    | B (blog) |
| Workers AI sites (GPU-enabled)         | 7 (GA) | ~100     | "nearly everywhere" | B (blog) |

**What to read into the numbers**: Customer count grew faster than revenue (+21% vs +29.8%), meaning ARPU is going up — paying customers are spending more, which matches the "large customer (>$100K ARR)" cohort being the real revenue driver (common for connectivity-cloud category; the same pattern shows up in Datadog, Snowflake). Narrative claim of 6M auto-upgraded TLS domains during FY2025 Birthday Week signals the install base is >6M distinct web properties touched.

**What Cloudflare does NOT disclose**: requests/sec at the edge, queries/sec on DNS (1.1.1.1), R2 stored bytes, Workers invocations/day. These would be gold for Little's-Law priors but aren't in 10-K or the fetched birthday-week post.

---

## 2. Cloud and infrastructure costs (2021–2026)

Cloudflare operates **its own network** (not a cloud tenant), so "cloud spend" as a line item doesn't apply the way it does for SaaS. The relevant figure is **purchased colocation + hardware capex + bandwidth**.

| Line item ($M)                         | FY2023 | FY2024 | FY2025 |
|----------------------------------------|--------|--------|--------|
| Cost of revenue                        | 307.0  | 378.7  | **552.5** |
| Gross profit                           | 989.7  | 1,290.9| **1,615.4** |
| Gross margin (GAAP)                    | 76.3%  | 77.3%  | **74.5%** |
| Capex (PP&E payments)                  | 114.4  | 185.0  | **315.6** |
| R&D expense                            | 358.1  | 421.4  | **512.5** |

**Key discontinuities**: The step-up in cost of revenue (+46% YoY FY25) outpaces revenue (+30%) and gross margin compressed ~280bps to 74.5%. Capex grew +70.6% YoY. This is the infrastructure-expansion tell — Cloudflare is front-loading network buildout (likely GPU sites for Workers AI + expanded PoPs for customer footprint), expecting margin recovery once the new capacity is revenue-carrying.

Bandwidth pricing and colocation costs are not broken out. Cloudflare's differentiator historically is owning the network end-to-end (not an AWS / GCP tenant), so cloud spend ≈ 0. For priors: decision nodes comparing "build edge network" vs "rent AWS regions" have Cloudflare as the canonical owns-cluster anchor with Tier-1 peering.

---

## 3. Engineering, R&D, and tech headcount

Cloudflare reports only total FTE and US/international split — no functional engineering breakdown.

| Year-end | Total FTE | International (approx) |
|----------|-----------|-----------------------|
| FY2023   | 3,682     | ~1,600 |
| FY2024   | 4,263     | ~2,000 |
| FY2025   | **5,156** | **2,452 (47.6%)** |

R&D expense grew 21.6% YoY (slower than headcount growth of +20.9%), which roughly tracks to flat-to-declining R&D per engineer — typical for scaling companies that expand into GTM-heavy international markets. No layoff events in FY2023-2025 per the 10-K narrative.

---

## 4. Backend and runtime stack

Cloudflare's engineering-blog-documented stack (across fetched sources) is:

- **Edge runtime**: **V8 isolates** (not containers, not VMs). Rita Kozlov's 2022 "Workers for Platforms" post frames this explicitly — running Chrome's V8 engine directly on servers to avoid cold-start latency. Designed for "hundreds of thousands to millions of Workers per tenant."
- **Core proxy (FL-2 / oxy)**: **Rust-based, modular**. Birthday Week 2025 wrap cites 10ms median response improvement + 10× Workers cold-start reduction via "worker sharding" (routing requests to preloaded workers).
- **Object storage (R2)**: Custom, S3-compatible API, **zero egress fees**. Launched GA September 2022.
- **AI inference (Workers AI)**: **Serverless GPU platform**, GA September 2023. Billed in "Neurons" (proprietary output-scaled metric). Inference integration via Workers and Pages.
- **Network transport**: QUIC (~10% speed improvement per 2025 tuning), TCP (fastest in 40% of measured ISPs), TLS 1.3.

Archetype tag: **ai-native-inference-edge** (for AI decision nodes) or the core archetype would be a "globally-distributed-edge-network" archetype that's not in the 10-archetype list; closest canonical fit is unlisted — NEEDS_ARCHETYPE_ADD.

---

## 5. AI stack and priors

| Dimension             | Value |
|-----------------------|-------|
| GPU exposure (enum)   | `owns_cluster` (Cloudflare owns GPU nodes at edge PoPs, not rented) |
| Inference pattern     | `edge` (nearly-everywhere model serving) + `serverless` |
| Models hosted (representative) | Llama-2-7b-chat-int8, Whisper, m2m100-1.2, distilbert-sst-2-int8, resnet-50, bge-base-en-v1.5 |
| Pricing model         | Neurons: $0.01/1K regular, $0.125/1K fast. Zero-output = zero-charge. |
| Tokens/response anchor| "1,000 Neurons = 130 LLM responses / 830 image classifications / 1,250 embeddings" |
| Training?             | No frontier training — Cloudflare is serving-only. |
| AI Gateway            | Exists but canonical AI Gateway GA post URL returned 404 — NEEDS_RESEARCH for GA launch date and pricing |

Priors rule check (post architect rev-2): Neurons pricing is a tier-B citation (blog.cloudflare.com, publish_date 2023-09-27) and qualifies as a prior. Inference latency priors (p95 time per Neuron) would need a dedicated Workers AI performance blog post — not in this corpus, flag as supplementary.

---

## 6. Decision-node priors commentary

**Where Cloudflare priors shine**:
- **Cost_curve for object storage**: R2's public pricing is clean — $0.015/GB stored, $4.50/M writes, $0.36/M reads, zero egress. Dual-cite with AWS S3 list price to build a piecewise cost curve for the decision "what backs my user-uploaded asset storage."
- **Latency priors at the edge**: FL-2 Rust rewrite delivering 10ms median response improvement across Birthday Week 2025 sample = useful p50 anchor for "CDN + edge compute path hop-cost."
- **GPU inference as-a-service pricing**: Neurons pricing is the cleanest public apples-to-apples comparison with OpenAI API ($/M-token) and Together/Replicate (per-call). Useful for M4 decision-matrix "where do I host inference."

**Where Cloudflare priors are thin**:
- **Throughput (requests/sec / queries/sec)**: No disclosed edge RPS in the fetched corpus. Prior Cloudflare narrative cites >45M HTTP requests/sec global peak (~2023), but not in this source set. NEEDS_RESEARCH.
- **Availability**: 10-K has standard risk-factor language on outages but no uptime SLA anchor. Cloudflare's status page (status.cloudflare.com) would carry this but is not a tier-B+ source per §6.3.
- **Customer cohort math**: 254,961 total but >$100K cohort (large customers, the revenue driver) not extracted from 10-K in this pass.

---

## Sources

All sources fetched 2026-04-23. SHA256 values are on pre-synthesis raw HTML bytes in `_sources/`.

1. **Cloudflare FY2025 10-K** (tier A_sec_filing, HIGHEST TRUST)
   - URL: https://www.sec.gov/Archives/edgar/data/1477333/000147733326000016/cloud-20251231.htm
   - Filed: 2026-02-26; period ending 2025-12-31
   - SHA256: `b2e19963a1e3df97eb84d21d1c65b49a660a9e7ebab3f3a052e101a46fae18a0`
   - Bytes: 2,600,690
   - Supports: revenue, gross margin, capex, employee count, paying customers, cost of revenue, R&D

2. **Birthday Week 2025 Wrap-Up** (tier B_official_blog)
   - URL: https://blog.cloudflare.com/birthday-week-2025-wrap-up/
   - Publish date: 2025-09-29
   - Authors: Nikita Cano, Korinne Alpers (unclear IC status; corporate marketing sidebar — treating as is_ic=false)
   - SHA256: `f164fa55e51f3fd17815fbc3f610a3d6f1ebb0528a4a8aa80e7a6ae02c8a3ec5`
   - Bytes: 444,881
   - Supports: FL-2 Rust rewrite (10ms median improvement), Workers cold-start 10× reduction, TLS auto-upgrade 6M domains, encryption traffic 10% → 95%

3. **Workers for Platforms** (tier B_official_blog)
   - URL: https://blog.cloudflare.com/workers-for-platforms/
   - Publish date: 2022-05-10
   - Author: Rita Kozlov (VP Product, Workers — is_ic debatable; VP-level)
   - SHA256: `4e611d0cc02fe94efab57a7647ed06e772feb024c5581fa529b25d7c18e4f73a`
   - Bytes: 390,876
   - Supports: V8 isolate architecture, "hundreds of thousands to millions of Workers" scale design target

4. **R2 General Availability** (tier B_official_blog)
   - URL: https://blog.cloudflare.com/r2-ga/
   - Publish date: 2022-09-21
   - Author: Aly Cabral (PM, is_ic=false)
   - SHA256: `5c6ecf4a0ae3bbd2116bc0e2a0a0f828539216e35b9b96d90d52518541fda57d`
   - Bytes: 383,718
   - Supports: R2 pricing ($0.015/GB, $4.50/M Class A, $0.36/M Class B, zero egress), 12K dev beta enrollment, free tier sizing

5. **Workers AI: serverless GPU-powered inference** (tier B_official_blog)
   - URL: https://blog.cloudflare.com/workers-ai/
   - Publish date: 2023-09-27
   - Authors: Phil Wittig, Rita Kozlov, Rebecca Weekly, Celso Martinho, Meaghan Choi
   - SHA256: `8281b032cbd2e04462f535b956ad424dc14383752e5e02b540fb321c5cc8de93`
   - Bytes: 414,697
   - Supports: Workers AI GA, GPU deployment rollout (7 sites → 100 by YE2023 → "nearly everywhere" by YE2024), Neurons pricing, hosted model list

---

## Unknowns / NEEDS_RESEARCH

1. **Edge throughput** (requests/sec, queries/sec globally). Historical narrative says 45M+ HTTP req/s circa 2023 but not in this source set. Would need a dedicated "Q&A at Cloudflare scale" post or a Radar / trends page as supplementary source.
2. **Availability SLA anchor**. Cloudflare doesn't publish a binding uptime SLA in filings or fetched posts. Status page is tier-irregular.
3. **AI Gateway GA date and pricing**. The canonical AI Gateway blog post URL returned 404. Need to find the correct URL via search.
4. **Large customer (>$100K ARR) cohort count YE2025**. Likely in the 10-K body (probably ~3,500+) but not extracted in this pass — flag for deeper 10-K read if curator needs the cohort split for scale.metric.
5. **R2 total stored bytes / total objects**. Never disclosed publicly to my knowledge. Would need a quant workaround (back out from COGS + per-GB rate).
6. **Workers AI inference p95 latency anchor**. Not in the launch post. May exist in a follow-on performance blog.

All of these are candidates for a supplementary per-URL fetch batch if curator needs them to pass entry-schema requirements.
