---
source_url: "https://www.sec.gov/Archives/edgar/data/789019/000095017025100235/msft-20250630.htm"
retrieved_at: "2026-04-23T05:00:00Z"
publish_date: "2025-07-30"
source_tier: "A_sec_filing"
sha256: "99d693f6c1544144ebeee92954f151a85bc62111837530a42855953bc01d0bbe"
bytes: 8158067
filing_type: "10-K"
author: "Microsoft Corporation / SEC filing (LinkedIn as reported line item)"
is_ic: false
---

# Microsoft Corporation — FY2025 10-K (filed 2025-07-30, fiscal year ended 2025-06-30): LinkedIn segment extraction

Raw bytes at `_sources/msft-10k-FY2025.htm` (SHA256 above). LinkedIn is reported as a distinct revenue line within MSFT's product/service revenue table, NOT as a standalone reportable segment — MSFT's three segments (Productivity & Business Processes, Intelligent Cloud, More Personal Computing) all touch LinkedIn in different proportions, but the revenue-by-product table is the canonical disclosure for LinkedIn-only revenue.

## LinkedIn revenue (from product/service revenue table, in $ millions)

| Product line    | FY2023  | FY2024  | FY2025  | FY25 YoY |
|-----------------|---------|---------|---------|----------|
| **LinkedIn**    | 14,989  | 16,372  | **17,812** | **+8.8%** |

(Context rows for comparison, same table)

| Product line                                   | FY2023  | FY2024  | FY2025  |
|------------------------------------------------|---------|---------|---------|
| Server products and cloud services             | 65,007  | 79,828  | 98,435  |
| Microsoft 365 Commercial products and cloud services | 66,949 | 76,969 | 87,767 |
| Gaming                                         | 15,466  | 21,503  | 23,455  |
| LinkedIn                                       | 14,989  | 16,372  | **17,812** |
| Windows and Devices                            | 17,147  | 17,026  | 17,314  |
| Search and news advertising                    | 12,125  | 12,306  | 13,878  |
| Dynamics products and cloud services           | 5,796   | 6,831   | 7,827   |

## MD&A narrative on LinkedIn

Direct quote from 10-K MD&A: **"LinkedIn revenue increased $1.4 billion or 9% with growth across all lines of business."** (The 9% vs 8.8% slight variance is rounding in the MD&A narrative vs the exact table row.)

Revenue drivers narrative: *"LinkedIn revenue is mainly affected by demand from enterprises and professionals for subscriptions to Talent Solutions, Sales Solutions, and Premium Subscriptions offerings, as well as member engagement and the quality of the sponsored content delivered to those members to drive Marketing Solutions."*

Business-unit breakout language: "LinkedIn, including Talent Solutions, Marketing Solutions, Premium Subscriptions, and Sales Solutions" (product family structure referenced 3× in filing).

## Member count

From the Azure Linux migration post (staged separately as `azure-linux-os.md`): **"over 1 billion LinkedIn members worldwide"** as of August 2024. This is MSFT / LinkedIn's own phrasing in the IC post; the 10-K does not disclose member count.

## NOT disclosed in MSFT 10-K

- LinkedIn-specific gross margin, operating income, or capex (rolled up into MSFT segment margins, not LinkedIn-only)
- LinkedIn employee count (rolled up into MSFT total 228,000 FTE at YE2025; internal estimates of LinkedIn alone ~20,000 per press narratives but NOT in filing)
- LinkedIn DAU/MAU (only "over 1 billion members" narrative from IC posts)
- LinkedIn revenue split by product line (Talent vs Sales vs Marketing vs Premium)
- LinkedIn infrastructure cost, cloud spend (LinkedIn runs on Azure; rolled up into MSFT)

## Interpretation for priors

- **scale.metric enum fit**: LinkedIn reports "members" narratively (>1B) but the scaleMetricSchema enum has no `members` value. Closest fit: `monthly_active_users` if curator wants to treat members ~ MAU proxy (weak), or NEEDS_RESEARCH / synthetic via 2x-extrapolation from session counts (not in this source set). Flag as scale-metric-gap.
- **Economics_citation**: revenue_fy25 = $17,812M (tier A, 10-K table). Operating margin and capex NOT breakoutable for LinkedIn alone. Flag these as NEEDS_RESEARCH for the entry.
- **Stack / AI / latency priors**: all come from engineering.linkedin.com posts (tier B, is_ic depends on individual byline). 10-K is economics-only.

## Filing URL anchor

Per team-lead's instruction, the LinkedIn revenue line lives in MSFT's 10-K financial statements section — specifically the product/service revenue disaggregation table. Since inline XBRL doesn't carry bookmark-style section anchors, the canonical citation is the full primary document URL above; the specific fact is findable by searching "LinkedIn" in the rendered HTML. The EDGAR landing page is NOT the source cite.