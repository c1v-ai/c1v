---
source_url: "https://blog.cloudflare.com/workers-for-platforms/"
retrieved_at: "2026-04-23T04:05:10Z"
publish_date: "2022-05-10"
source_tier: "B_official_blog"
sha256: "4e611d0cc02fe94efab57a7647ed06e772feb024c5581fa529b25d7c18e4f73a"
bytes: 390876
filing_type: "blog"
author: "Rita Kozlov"
is_ic: false
---

# Workers for Platforms (Cloudflare)

Raw bytes at `_sources/workers-for-platforms.html`. Content extracted via WebFetch 2026-04-23.

## Architectural claims

- **Runtime**: V8 isolates (Chrome's V8 engine) running directly on servers, not containers.
- **Reason for V8-on-server choice**: Avoid cold-start latency that containers/VMs introduce.
- **Scale target**: Platform designed to manage "hundreds of thousands to millions of Cloudflare Workers" per tenant.
- **Security requirement**: System must securely execute untrusted code in a multi-tenant environment (V8 sandbox model).
- **Historical anchor**: The product emerged from Cloudflare's own experience solving this problem internally circa 2017, which led to the original Cloudflare Workers launch.

## Interpretation for priors

- **Backend runtime archetype**: V8 isolate is the canonical anchor for any decision node comparing "container-per-request (e.g. Lambda, Cloud Run)" vs "isolate-per-request (Workers, Deno Deploy)."
- **Cold-start narrative**: This post is the architectural justification. The 10× improvement cited in `birthday-week-2025-wrap-up.md` is the empirical anchor — pair them for decision-matrix priors.
- **Is_ic assessment**: Rita Kozlov is VP of Product for Workers — management, not IC engineer. is_ic=false.

## Staleness

Published 2022-05-10 — outside the 18-month staleness window as of retrieval (2026-04-23). Retained because the V8-isolate architecture is the architectural invariant still in production (confirmed by the 2025 birthday-week references to Workers). Treat as architecture-narrative anchor, not a quant prior source.