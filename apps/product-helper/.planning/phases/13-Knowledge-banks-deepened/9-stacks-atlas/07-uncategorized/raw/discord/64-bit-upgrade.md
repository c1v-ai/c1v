---
source_url: "https://discord.com/blog/how-discord-seamlessly-upgraded-millions-of-users-to-64-bit-architecture"
retrieved_at: "2026-04-23T23:41:30Z"
publish_date: "2024-12-13"
source_tier: "B_official_blog"
sha256: "686b3364cbc0f64105375912e7b7d34598ddd9f619bd48078b86ad58c01d18b1"
bytes: 228752
filing_type: "blog"
author: "Christopher Harris (Senior Software Engineer on Desktop Arch)"
is_ic: true
---

# How Discord Seamlessly Upgraded Millions of Users to 64-Bit Architecture

Raw bytes at `_sources/64-bit-upgrade.html`. Content extracted via WebFetch 2026-04-23. Single-author Senior SWE post — **is_ic=true**.

## Scale and migration metrics

| Metric | Value |
|---|---|
| Coverage achieved | **100% of 64-bit Windows machines** |
| User scale | "Millions" (narrative, no exact number) |
| Memory impact | Slight increase (expected per arch shift) |
| Crash rate | Declined (OOM crashes reduced) |
| CPU usage | Decreased (freed resources for games) |

## Migration architecture

- Leveraged existing updater infrastructure: "It already delivers millions of updates successfully"
- 32-bit client detects system architecture to scope eligibility
- Fallback: errors during transition revert to 32-bit build
- Version-bumping strategy: 64-bit version bumped by **100 numbers** to ensure proper update sequencing
- Disabled delta/partial updates; required full deployment packages
- Internal 64-bit build automation ran alongside 32-bit production

## Key technical challenge

C++/Rust ABI mismatch required datatype alignment between 32-bit and 64-bit environments.

## Interpretation for priors

- **Not a scale prior source**: "Millions of users" is vague, doesn't tie to a scaleMetricSchema value.
- **Not a latency or cost prior source**: no concrete numbers suitable for prior anchors.
- **Stack narrative (weak)**: Confirms Discord desktop client uses C++ and Rust in the binary. Doesn't touch backend.
- **Value for entry**: good supporting narrative for "how Discord thinks about deployment and large migrations." Not priority for priors; keep for body commentary.

## Staleness

Published 2024-12-13 — 16 months at retrieval, just inside 18mo window. Note.