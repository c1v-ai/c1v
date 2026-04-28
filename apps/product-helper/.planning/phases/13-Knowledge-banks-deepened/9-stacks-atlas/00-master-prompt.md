# Stacks & Priors Atlas (KB-8)

> **Authoritative (architect, 2026-04-21)**. The curator placeholder header was promoted to this authoritative version on schema + Drizzle + migration landing. Future edits should be made in-place; no separate placeholder.

Evidence KB + hybrid-math prior store. Feeds M2 Phase-8 constants, M4 Decision Matrix / Pareto / sensitivity, M5 QFD, and every cost-curve consumer.

- **Plan**: `/plans/public-company-stacks-atlas.md` — governs.
- **Zod schema**: `apps/product-helper/lib/langchain/schemas/atlas/entry.ts` (`companyAtlasEntrySchema`). Generated JSON Schemas: `apps/product-helper/lib/langchain/schemas/generated/atlas/`.
- **Drizzle table**: `apps/product-helper/lib/db/schema/atlas-entries.ts` (migration `0010_atlas_entries.sql` — manual SQL per CLAUDE.md drizzle-kit note).
- **Security ref**: `/plans/reviews/c1v-MIT-Crawley-Cornell/security-review.md` F1-F5 mitigations are enumerated in §7 below.

## Source tier — A–H at every granularity (plan §6.3)

One source-tier scale. Same enum at every level:

- **Per-citation**: `citations[i].tier` ∈ {A, B, C, D, E, F, G, H}
- **Per-prior**: `cost_curves[i].source_tier`, `latency_priors[i].source_tier`, `availability_priors[i].source_tier` — same A–H enum, Zod refinement rejects C/D
- **Per-entry**: `primary_source.tier` = the **strongest tier** among the entry's citations (same A–H enum, just a summary)

| Tier | Source | Use |
|---|---|---|
| `A_sec_filing` | 10-K, 10-Q, S-1, proxy, IR deck | Quant only, highest trust |
| `B_official_blog` | Company eng blog or official research post | Top-tier for AI-private |
| `C_press_analyst` | FT, The Information, Bloomberg, Pragmatic Engineer, Gartner, SemiAnalysis | Quant when A/B silent; AI-private quant requires dual-C |
| `D_stackshare` | Community-reported stack | Never sole; corroborate with B/E/F |
| `E_conference` | QCon / Strange Loop / KubeCon / NeurIPS | B-equivalent **only** when `is_ic=true` |
| `F_github` | Public repo configs | Proves stack usage; silent on scale |
| `G_model_card` | Model card / system card / safety report | B-equivalent for AI-private quant |
| `H_social_flagged` | Verified-employee X post or ≥50-corroboration Reddit thread | Never sole; always flagged |

**Math-prior restriction (plan §6.3)**: `cost_curves[*]`, `latency_priors[*]`, `availability_priors[*]` must cite **B, E(IC), or G**. Tier C or D on a math prior is a Zod refinement rejection. Dual-C is allowed for **AI-private quant** but **NOT for priors**.

**AI-private ceiling**: OpenAI, Anthropic, Mistral, Cursor, Perplexity, etc. have no 10-K, so their `primary_source.tier` cannot be `A`. Best-case is `B` (official blog) or `G` (model card). They still count toward `corpus_ready` as long as they carry a §6.3-compliant prior (B/G for AI-private).

## Data-quality grade — Q1/Q2/Q3 (numeric-prefixed, orthogonal to tier)

Per-entry completeness + corroboration assessment. Not in Zod; layered on by curator.

| Grade | Criteria |
|---|---|
| `Q1` | Zod-clean + zero `NEEDS_RESEARCH` on mandatory + every prior cites A/B/E/G (no C/D) + `last_verified` within 18 months |
| `Q2` | Zod-clean + zero `NEEDS_RESEARCH` on mandatory + priors comply with §6.3 (includes dual-C for AI-private quant only, priors still B/E/G) |
| `Q3` | Zod-clean but ≥1 `NEEDS_RESEARCH` on mandatory — routes to `rejected/` unless team-lead overrides |

## `corpus_ready` gate

**Definition**: ≥7 entries (lowered 20 → 10 → 7 per David's ruling 2026-04-23) that (a) Zod-parse clean against `entry.ts` AND (b) carry ≥1 math prior satisfying plan §6.3 tier rules (B/E(IC)/G, or dual-C for AI-private quant). Priors emitted with `provisional: true` + `sample_size` metadata so downstream agents widen confidence bands.

Entries without any valid prior don't count. AI-private entries using B/G priors DO count.

**Enforcement layers** (belt-and-braces):

- **Zod** — `MIN_T1_CORPUS_SIZE = 7` exported from `lib/langchain/schemas/atlas/entry.ts`.
- **Drizzle** — `ATLAS_MIN_CORPUS_SIZE = 7` exported from `lib/db/schema/atlas-entries.ts`.
- **Runtime** — consumer agents run `SELECT COUNT(*) FROM atlas_entries WHERE reviewer_approved=true AND deleted_at IS NULL` and refuse to emit priors until the count passes.
- **NDA screen** — `nda_clean = true` is a HARD CHECK constraint on the Drizzle table; rows cannot be inserted otherwise.

## Corpus status

<!-- curator updates on every successful write; do not hand-edit -->

```
corpus_status:
  current: 11               # total entries in companies/ (+stripe)
  current_valid: 8          # +stripe (docdb 99.999% annual availability prior, tier B+is_ic, partial-verification due to CSR-wall body-not-recovered + 22mo stale)
  threshold: 7              # lowered 20 → 10 → 7 per David's ruling 2026-04-23
  corpus_ready: true        # 8 valid >= 7 threshold; priors emit with provisional: true + sample_size: 8
  last_updated: 2026-04-24
grade_distribution:
  Q1: 4                     # netflix, shopify, cloudflare, discord — all zero NEEDS_RESEARCH on mandatory + §6.3-compliant priors + within 18mo + (for discord) kind + archetype enum gaps resolved by schema_v 1.1.0
  Q2: 4                     # anthropic (run-rate revenue not audited), linkedin (identity priors 6yr stale — #35 fix landed but staleness is independent blocker), airbnb (4 of 5 citations captcha-walled per #38), stripe (5 of 6 citations CSR-walled — only title-level content recovered for 3 engineering posts; single availability prior is 22mo stale + title-level-only; task #39 filed for webfetch_only_no_raw_html enum refinement)
  Q3: 3                     # etsy, dropbox, uber — sha_bundle_not_url (content defensible, provenance-binding defect only; will be upgraded after per-URL re-fetch via tasks #28/#29/#30)
rejected: []

# schema_v 1.1.0 backfill status (2026-04-23)
# - cloudflare: archetype_tags → multi-tag [globally-distributed-edge-network, ai-native-inference-edge, developer-platform-saas] ✓
# - linkedin: scale.metric → registered_members ✓ (linter also added tb_per_day throughput prior for 20 TB/day job ingestion, 4 priors total now)
# - discord: kind → private_consumer ✓; archetype → elixir-beam-actor-platform ✓; Q2→Q1 promotion ✓
# - airbnb: bytes_integrity + content_sha256 on metrics-pipeline throughput prior ✓
```

**Threshold note (2026-04-23)**: Curator-level threshold is **7** per David's ruling (lowered 20 → 10 → 7 to match `current_valid`; corpus_ready now true).
Zod constants `MIN_CORPUS_READY_SIZE = 7` (lowered from 20) and Drizzle `ATLAS_MIN_CORPUS_SIZE` should be re-synced in this pass;
consumer agents should read from this README counter during the current ramp window.

## Directory layout

```
8-stacks-and-priors-atlas/
├── README.md              # architect (this file is placeholder)
├── GLOSSARY.md            # architect
├── SOURCES.md             # architect (citation ledger)
├── PIPELINE.md            # scraper drafts, architect + curator review
├── atlas.schema.json      # architect (generated from entry.ts)
├── raw/                   # scraper — per-company staged MD + provenance
├── companies/             # curator — Zod-validated entries
├── rejected/              # curator — entries failing extraction with reason
├── archetypes/            # DEFERRED v1.1 — post-corpus-ready synthesis pass
└── indexes/               # generated via scripts/atlas/build-indexes.ts (deferred)
```

## Curator scope (v1)

Per-company: read `raw/{company}/` → extract per plan §4.3 frontmatter → Zod-parse against `entry.ts` → write `companies/{slug}.md` (clean) OR `rejected/{slug}.md` (failed) → append citation rows to `SOURCES.md` → bump `corpus_status` above.

**Not in curator v1 scope**: archetypes, indexes, GLOSSARY/PIPELINE docs, schema.

## Security posture (security-review.md F1-F5)

- **F1** Source allowlist + SSRF + NDA screen: enforced by the ingest scripts (not Zod). Every outbound fetch validates resolved IP is not private / link-local / metadata. `nda_clean = true` is a HARD CHECK constraint at the Drizzle layer.
- **F2** Prior poisoning: write-once + reviewer approval (`reviewer_approved`, `approved_at`, `approved_by`). Tier-D/F/H-only citations on priors are Zod-rejected. SHA-256 content hashing (`frontmatter_sha256`, `body_sha256` columns; `sha256` field on every `citationSchema` instance) detects tamper.
- **F3** Prompt injection: retrieved chunks wrapped in `<retrieved_context>` tags at agent layer (not Atlas's concern, but prose body is the surface).
- **F4** Supply chain: Docling via pinned Python container (no MCP — Python CLI subprocess). No runtime fetches.
- **F5** Tenant isolation: RLS policies on `atlas_entries`; `team_id=NULL` is the SHARED baseline; per-tenant overrides write with their own `team_id`.

## Authoritative references

- Atlas plan: `/plans/public-company-stacks-atlas.md`
- Zod schema: `apps/product-helper/lib/langchain/schemas/atlas/entry.ts`
- Priors schema: `apps/product-helper/lib/langchain/schemas/atlas/priors.ts`
- Drizzle table: `apps/product-helper/lib/db/schema/atlas-entries.ts`
- Migration: `apps/product-helper/lib/db/migrations/0010_atlas_entries.sql`
- Math schema v2 (T3 c1v-runtime-prereqs, pending): `apps/product-helper/lib/langchain/schemas/math/derivation-v2.ts`
- Math primitive → atlas field map: plan §7
- Security review: `/plans/reviews/c1v-MIT-Crawley-Cornell/security-review.md`
