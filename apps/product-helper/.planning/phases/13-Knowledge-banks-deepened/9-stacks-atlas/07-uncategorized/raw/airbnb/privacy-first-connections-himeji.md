---
source_url: "https://medium.com/airbnb-engineering/privacy-first-connections-empowering-social-experiences-at-airbnb-d7dec59ef960"
retrieved_at: "2026-04-23T23:53:30Z"
publish_date: "2026-04-14"
source_tier: "B_official_blog"
sha256: "73fba4e2af41a3c681a9fde1c991a9f60c6817ec707fe761b7d8a2a8ff79f2a8"
bytes: 5777
filing_type: "blog"
author: "Joy Jing"
is_ic: true
bytes_integrity: "CAPTCHA_WALL — curl returns Cloudflare Turnstile wall (5,777 bytes). SHA256 is of the wall bytes. Content via WebFetch extraction."
---

# Privacy-first connections: Empowering social experiences at Airbnb

## Architecture (tier B + is_ic, FRESH 2026-04-14)

- **Identity model**: User (internal complete record) separated from Profile (public-facing subset)
- **IDs**: Distinct `User ID` vs `Profile ID` to decouple identity across contexts
- **Context-aware**: Profiles scoped per Experience (guests control visibility per-instance)
- **Authorization**: **Himeji** in-house system, "least-privileged access" enforced at data layer
- **Himeji internals**: "Configurable relation denormalization at write time"

## Tooling

- Python scripts for automated codebase auditing
- AI-powered refactoring suggestions
- Strong typing + automated tests for safety enforcement

## Priors

- No quantitative anchors (no scale, latency, cost).
- Stack narrative value: **Himeji** is a named in-house authorization system — canonical Airbnb auth architecture anchor for decision-node priors about "how does a marketplace do policy-driven access control."
