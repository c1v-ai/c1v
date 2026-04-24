# KB-8 Atlas — Schema Changelog

## 1.1.0 — patch (non-breaking) — 2026-04-23 (architect: kb8-atlas team)

Patch on top of commit 1d885fe. No schema_v bump — same 1.1.0 tag.

- `citationSchema.bytes_integrity` already carries `.default('clean')` —
  verified optional on input; older citations without the field parse
  implicitly as `clean`. The `superRefine` gate still demands
  `content_sha256` when `bytes_integrity !== 'clean'`. No fixture or landed
  atlas entry backfill required (the 6 landed entries omit the field and
  parse green under the default).
- `lib/db/schema/atlas-entries.ts` migrated off Drizzle's deprecated
  2-arg `pgTable(name, columns, extraConfig)` callback-returning-object
  form onto the current array-returning form (index names retained as
  literal strings; column references unchanged). Types-only migration —
  no SQL migration required, `drizzle-kit` remains broken.

## 1.1.0 — 2026-04-23 (architect: kb8-atlas team)

Batched response to 5 schema gaps flagged by curator/scraper during the first
10-entry corpus pass (cloudflare, linkedin, discord, airbnb findings).

### #34 — archetype_tags: multi-archetype support + new tags

Added three `archetypeTagSchema` enum values:

- `globally-distributed-edge-network` — edge CDN core (cloudflare, fastly, akamai, vercel edge).
- `developer-platform-saas` — developer-facing SaaS (cloudflare Workers/Pages/R2/D1, vercel, netlify).
- `elixir-beam-actor-platform` — process-per-entity / actor-model concurrency (discord's Elixir/BEAM, akka, orleans, vert.x).

`archetype_tags` is and remains a `z.array`; multi-archetype is EXPECTED
for hybrid companies (cloudflare = edge + AI-inference-edge + developer-SaaS
simultaneously). JSDoc on `archetypeTagSchema` now states this explicitly so
curators stop treating multi-tag as an anomaly.

### #35 — scaleMetricSchema: `registered_members`

Already landed pre-1.1.0 (see `entry.ts` line ~68). `registered_members`
covers LinkedIn's reported figure (>1B registered, NOT 1B MAU) and other
social platforms reporting cumulative sign-ups. No code change in 1.1.0 —
documented here so the gap is accounted for.

### #36 — throughputPriorSchema.units: data-rate units

Added `gb_per_hour` to `throughputPriorSchema.units`. Pre-1.1.0 the enum
already carried `bytes_per_second`, `kb_per_second`, `mb_per_second`,
`gb_per_second`, `tb_per_second`, `gb_per_day`, `tb_per_day`, `pb_per_day`
(partial landing). 1.1.0 closes the missing `gb_per_hour` slot.

LinkedIn's "20 TB/day" Job Ingestion figure fits `tb_per_day`. Storage
egress figures commonly fit `gb_per_hour`.

### #37 — entryKindSchema: `private_consumer`

Added `private_consumer` as a fourth kind alongside `public`,
`ai_infra_public`, `frontier_ai_private`.

**Covers**: discord, reddit-pre-IPO, canva, notion, figma-pre-IPO, stripe,
miro, linear, and any private-but-not-frontier-AI company.

**Refinements** (narrower than `frontier_ai_private`'s dual-C press rule):

- `scale.citation.source_tier` MUST be `B_official_blog` (company's own page).
  No dual-C press rescue.
- `economics_citations[*].source_tier` MUST NOT be `A_sec_filing` (no 10-K exists).
- Priors remain strict B/E-IC/G per `PRIOR_ACCEPTABLE_TIERS` (unchanged).
- `ai_stack` and `utility_weight_hints` remain OPTIONAL (discord has none;
  stripe has none).

### #38 — citationSchema: `bytes_integrity` + `content_sha256`

Added two new citation fields to handle CAPTCHA-walled and paywall-stubbed
sources (airbnb Medium Engineering posts serve 5-6KB Cloudflare Turnstile
walls to non-browser clients; the per-URL `sha256` hashes the wall, not the
article).

- `bytes_integrity` enum (default `clean`): `clean` |
  `captcha_wall_content_via_webfetch` | `paywall_content_via_webfetch` |
  `cdn_geoblock_content_via_webfetch`. Tags what the bytes-level `sha256`
  actually covers.
- `content_sha256` (optional, required when `bytes_integrity` ≠ `clean`):
  SHA-256 of the extracted MD body. Stable across captcha-wall variants.

When `bytes_integrity` ≠ `clean`, consumers MUST verify integrity via
`content_sha256` rather than `sha256`. Enforced by `citationSchema.superRefine`.

Playwright browser-automation fallback (option c in task #38) is DEFERRED —
out of scope for this batch.

---

## Backfill targets

Existing entries need schema 1.1.0 backfill (curator action — not done in
this commit):

| Entry | Field(s) | Why |
|---|---|---|
| cloudflare | `archetype_tags` | Add `globally-distributed-edge-network` + `developer-platform-saas` alongside existing AI tag. |
| linkedin | `scale.metric` | Re-grade from `monthly_active_users` to `registered_members`; promote Q2→Q1 (primary blocker). |
| linkedin | `throughput_priors[*].units` | If ingest throughput claims were shelved for lack of unit, they now express as `tb_per_day`. |
| discord | `kind` | Change from (wrongly defaulted) `frontier_ai_private` to `private_consumer`. Verify scale citation tier is B. Add `elixir-beam-actor-platform` archetype. |
| airbnb | `scale.citation` + any medium-post citation | Add `bytes_integrity: captcha_wall_content_via_webfetch` + `content_sha256` for the 4-of-5 walled Medium posts. |

## 1.0.0 — 2026-04-21 (architect)

Initial schema, landed alongside the Drizzle migration `0010_atlas_entries.sql`.
