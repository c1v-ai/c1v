---
source_url: "https://blog.cloudflare.com/birthday-week-2025-wrap-up/"
retrieved_at: "2026-04-23T04:05:00Z"
publish_date: "2025-09-29"
source_tier: "B_official_blog"
sha256: "f164fa55e51f3fd17815fbc3f610a3d6f1ebb0528a4a8aa80e7a6ae02c8a3ec5"
bytes: 444881
filing_type: "blog"
author: "Nikita Cano, Korinne Alpers"
is_ic: false
---

# Birthday Week 2025 wrap-up (Cloudflare)

Raw bytes at `_sources/birthday-week-2025-wrap-up.html`. Content extracted via WebFetch 2026-04-23.

## Key claims

| Claim | Value |
|---|---|
| Domains auto-upgraded to TLS | 6 million during birthday week 2025 |
| Encryption traffic share trajectory | from ~10% to 95% of Internet traffic |
| Core proxy rewrite | Modular Rust-based architecture (FL-2 / oxy) replacing legacy |
| Median response time improvement (proxy rewrite) | −10 ms |
| Workers cold start improvement | **10× reduction** via "worker sharding" (preloaded workers) |
| TCP connection speed | Cloudflare fastest in 40% of measured ISPs |
| QUIC speed improvement (after 2025 tuning) | +10% average |
| Internship target 2026 | 1,111 interns |

## Interpretation for priors

- **Latency priors**: The 10ms median proxy improvement and 10× cold-start reduction are tier-B anchors for Workers path-hop cost. Note these are relative improvements, not absolute ms — absolute p50/p95 Workers startup latency isn't disclosed in this post.
- **Stack narrative**: FL-2 Rust rewrite is the architectural turning point. Pairs with the `workers-for-platforms.md` V8 isolate narrative for the full runtime story.
- **Is_ic assessment**: Authors Nikita Cano (Content) and Korinne Alpers (corporate comms sidebar) → is_ic=false. This post is corporate marketing even though it aggregates IC-written content.

## Source note

Byline is corporate/content team, not engineering IC. For priors with stricter tier-E / is_ic gating, may need to re-cite the underlying IC-authored birthday-week posts individually (e.g. the FL-2 Rust rewrite post, the Workers cold-start post) rather than this wrap-up.