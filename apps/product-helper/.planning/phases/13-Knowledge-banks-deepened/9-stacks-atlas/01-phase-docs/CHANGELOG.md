---
schema: phase-file.v1
phase_slug: changelog
module: 9
artifact_key: module_9/changelog
engine_story: m9-stacks-atlas
engine_path: apps/product-helper/.planning/engines/m9-stacks-atlas.json
fail_closed_audit: plans/v22-outputs/te1/fail-closed-audit.md#module-9-stacks-atlas
fail_closed_registry: apps/product-helper/lib/langchain/engines/fail-closed-runner.ts
kb_chunk_refs: []
legacy_snapshot: apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_legacy_2026-04-26/9-stacks-atlas/01-phase-docs/CHANGELOG.md
rewritten_at: 2026-04-27
rewritten_by: kb-rewrite (Wave-E γ-shape, EC-V21-E.9)
---
# KB-8 Atlas — Schema Changelog

## §1 Decision context

This phase contributes to **m9-stacks-atlas** decisions. Runtime resolution flows through:

1. ContextResolver loads upstream artifacts + intake state.
2. NFREngineInterpreter evaluates predicates from `apps/product-helper/.planning/engines/m9-stacks-atlas.json` against EvalContext.
3. On match → auto-fill (clamped to `auto_fill_threshold`); on no match → fallback (§3); on still-no-match → STOP-GAP gate (§4) blocks proceed.

The legacy educational body (preserved in this file under the "Educational content" footer) explains *why* this phase exists. The runtime *what* lives in the engine.json + fail-closed registry referenced below.

## §2 Predicates (engine.json reference)

- **Engine story:** `m9-stacks-atlas` (`apps/product-helper/.planning/engines/m9-stacks-atlas.json`)
- **Predicate DSL evaluator:** `apps/product-helper/lib/langchain/engines/predicate-dsl.ts`
- **Story-tree schema:** `apps/product-helper/lib/langchain/schemas/engines/story-tree.ts`
- **Decisions consumed by this phase:** see `decisions[]` in the engine.json keyed on `target_field` containing `changelog` or by manual mapping in the story tree.

> Predicates are NOT inlined here. The engine.json is the source of truth; this markdown points at it.

## §3 Fallback rules

When no predicate in §2 matches:

1. `searchKB` retrieves top-3 chunks scoped to `{module: 9, phase: changelog}` (post-G8/G9 ingest).
2. If `searchKB` confidence < 0.90 OR returns zero chunks → `surfaceGap` emits `needs_user_input` to `system-question-bridge.ts` with computed_options + math_trace.
3. User answer re-enters the loop at ContextResolver.

> Fallback contract is shared across all phase files. Per-phase override (if any) is documented in the educational body below.

## §4 STOP-GAP rules (machine-readable)

- **artifact_key:** `module_9/changelog`
- **registry:** `apps/product-helper/lib/langchain/engines/fail-closed-runner.ts` (`buildFailClosedRegistry`)
- **schema:** `apps/product-helper/lib/langchain/schemas/engines/fail-closed.ts` (`failClosedRuleSetSchema`)
- **audit doc (rule sources + severity):** [plans/v22-outputs/te1/fail-closed-audit.md](../../../../../../plans/v22-outputs/te1/fail-closed-audit.md#module-9-stacks-atlas)

The STOP-GAP / Validation-Checklist text in the legacy educational body below has been audited by `engine-fail-closed` and converted into machine-readable rules registered under the `artifact_key` above. The runner default-FAILs if the artifact_key is queried with no rule set registered (conservative).

> Default severity is `error` (proceed-blocking). Only items phrased "advisory" / "soft check" / "warning" / "will NOT fail" are downgraded to `warn`.

## §5 Math derivation

This phase's quantitative outputs (if any) carry `mathDerivationSchema` (or `mathDerivationMatrixSchema` for M5 sites per TC1 `tc1-wave-c-complete`). Each derivation:

- references inputs by `source` (upstream artifact + field path);
- carries `formula` (LaTeX-safe ASCII) + `units` + `computed_value`;
- attaches `base_confidence` + `confidence_modifiers` consumed by NFREngineInterpreter step 6.

> Per-decision math traces are emitted into `decision_audit` (`0011b_decision_audit.sql`) on every Scoring pass per EC-V21-E.3 (audit-writer agent).

## §6 References (KB chunk IDs)

- **Frontmatter `kb_chunk_refs`:** populated by the embedding pipeline (`engine-pgvector` agent, G8/G9 — `apps/product-helper/lib/langchain/engines/kb-embedder.ts`).
- **Runtime retrieval:** `searchKB(query, top_k, { module: 9, phase: 'changelog' })` over the `kb_chunks` table (`0011a_kb_chunks.sql`, ivfflat lists=100; HNSW upgrade gated on `>10k` rows).
- **Provenance:** every retrieved chunk carries `{kb_source, chunk_hash, content, embedding_distance}`; rendered by `why-this-value-panel.tsx` (`provenance-ui` agent).

> The `kb_chunk_refs` array in frontmatter is left empty until the embedder backfills it. The runtime path does not depend on the static array — it queries the live table.

---

## Educational content (legacy, preserved)

> The body below is the pre-Wave-E text verbatim. It documents *why* this phase exists, the systems-engineering theory behind the prescribed steps, and the example-driven walkthroughs the LLM (and human readers) consume. The 6 sections above are the schema-first overlay locked by Wave-E γ-shape.

## 1.1.1 — patch (additive) — 2026-04-23 (team-lead: Bond)

Task #39 — `bytes_integrity` enum gains `webfetch_only_no_raw_html` variant
for SPA / JS-rendered pages (stripe.com/blog finding). Distinct integrity
state from `captcha_wall_content_via_webfetch` — marks pages where raw HTML
carries no article body (shell-only SPA) but content was extractable via
WebFetch. Same `superRefine` gate: when non-`clean`, `content_sha256` is
REQUIRED. Two tests added (reject-without / accept-with content_sha256).

Tooling follow-through: `js-yaml` + `@types/js-yaml` installed as devDeps
for curator's new `scripts/atlas/validate-entries.ts` CLI (commit 8148026).
Test fixtures got explicit `bytes_integrity: 'clean'` on inline citations
— TypeScript's `z.infer` (output type) requires the field post-`.default()`
even though Zod input treats it optional. 37/37 atlas tests pass; tsc clean.
8 regenerated JSON schemas reflect the enum addition.

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

