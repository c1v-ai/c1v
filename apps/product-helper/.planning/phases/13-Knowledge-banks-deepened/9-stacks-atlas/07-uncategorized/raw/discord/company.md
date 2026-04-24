---
source_url: "https://discord.com/company"
retrieved_at: "2026-04-23T23:40:00Z"
publish_date: null
source_tier: "B_official_blog"
sha256: "32ad3dc1ece0c6a926d289867ac3b022cd202eaaad1959ce8a6f0dc117e80513"
bytes: 106075
filing_type: "corporate_page"
author: "Discord Inc. (official company page)"
is_ic: false
---

# Discord — Company page

Raw bytes at `_sources/company.html`. Content extracted via WebFetch 2026-04-23. Corporate "About" page; no byline. `publish_date: null` because the page carries no publication date (it's a living corporate doc, not a dated post).

## User scale metrics (for scale_bands only — private company, no 10-K)

| Metric | Value | Source context |
|---|---|---|
| **Daily Active Users (DAU)** | **"90M+"** | As of Q4 2025 |
| Gaming usage share | "90%+" of users play video games | 2025 user survey |
| Gaming engagement | "~40%" of PC players start a game within an hour | 2025 average |

## Company facts

- **Founded**: May 2015
- **Founders**: Jason Citron, Stanislav Vishnevskiy
- **CEO transition (Spring 2025)**: Jason Citron → Board / Advisor; **Humam Sakhnini** became CEO
- **Origin**: Emerged from Hammer & Chisel (MOBA studio Fates Forever) — built to solve "how to talk with friends while gaming"

## NOT disclosed on this page

- Total registered users (historically ~600M+ per external sources, not confirmed here)
- Server count (guild count), messages/day, countries
- Revenue, funding, employee count
- Headquarters address (office imagery only)

## Interpretation for priors

- **Kind = frontier_ai_private**? NO — Discord is a consumer platform (chat/voice/community), not AI-first. Correct kind = **`frontier_ai_private` is wrong; recommend `public`-analog but company is PRIVATE**. Nearest enum: this is a gap in `entryKindSchema` — no "private_consumer" or "private_saas" value. Closest fit: treat as `frontier_ai_private` *only* if we're being loose with the semantics, or flag as NEEDS_SCHEMA_EXTEND.
  - Ruling guidance from team-lead briefing: "private (no 10-K)" — kind_hint TBD but economics are not tier-A sourceable.
- **scale.metric enum**: DAU "90M+" fits `monthly_active_users` proxy poorly (DAU is daily, not monthly). Correct scaleMetricSchema value: `daily_active_users` (which IS in the enum). Use that with value=90_000_000 and a scale_band mapping.
- **dau_band**: 90M+ → `over_100m` band (if we interpret 90M+ as approaching/over 100M) OR `10m_100m` band (conservative). Recommend `over_100m` per Discord's own framing.

## is_ic

False — corporate page, no IC byline.