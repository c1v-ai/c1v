# c1v MIT-Crawley-Cornell — v2.2 (stub)

> **Status:** 📝 DRAFT — created 2026-04-26 as a stub during v2.1 closeout. Not started; v2.1 ship gate clear (`v2.1 SHIPPED 2026-04-26`). This doc inherits content from [`c1v-MIT-Crawley-Cornell.v2.1.md`](c1v-MIT-Crawley-Cornell.v2.1.md) by reference — DO NOT duplicate sections; honor decisions/ECs as locked starting points.
> **Supersedes (in v2.1):** Marks Wave C + Wave E + Pre-Wave-E Inventory as **active** (was `📦 DEFERRED TO v2.2` in v2.1). Picks up post-v2.1 follow-ups (P2/P3/P5).
> **Owner:** Bond. v2.2 day-0 inventory pass kicks off when work begins.

---

## Scope

v2.2 ships **3 streams** carried forward from v2.1 plus the post-v2.1 backlog. v2.1's Wave A/B/D content is FROZEN; v2.2 extends behind the same envelopes (Wave A↔E handshake spec at v2.1 lines 498–504 governs).

| Stream | Source in v2.1 | Status entering v2.2 |
|---|---|---|
| **Wave C** — Crawley schema closeout + eval harness + methodology page | v2.1 §Wave C (lines 362–400) | Locked spec; not started |
| **Wave E** — KB runtime architecture rewrite (deterministic-rule-tree-first NFR engine + pgvector + decision_audit + multi-turn gap-fill + "why this value?" UI) | v2.1 §Wave E (lines 439–523) + [`plans/kb-runtime-architecture.md`](kb-runtime-architecture.md) | Locked spec; day-0 reconciliation partially done (path rewrite committed 2026-04-25 per EC-V21-E.0(i)) |
| **Pre-Wave-E Inventory** | v2.1 §Pre-Wave-E (lines 428–437) | Day-0 research blocker for Wave E |
| **Post-v2.1 backlog** | [`plans/post-v2.1-followups.md`](post-v2.1-followups.md) | P2 (>200 LOC fs-side-effects refactors), P3 (TD1 fixture-vs-live drift placeholder), P5 (stranded `kb-upgrade-v2/` partial trees) |

**Out of scope for v2.2:**
- v2.1 Waves A/B/D content (FROZEN — no edits without explicit re-plan)
- Wave-4 v2 closeout backlog at [`plans/post-v2-followups.md`](post-v2-followups.md) (separate track — `projects` table RLS hardening, fmea_residual prose-vs-data drift, kb_chunk_ids placeholders, weasyprint PDF)

---

## Locked decisions inherited from v2.1

These were locked in v2.1's decision table but deferred for execution. v2.2 honors them as starting decisions and does **not** re-debate.

| # | Decision | Locked choice | Source |
|---|---|---|---|
| **D-V21.13** | Module-5 schema delivery | 10 typed Crawley schemas + `mathDerivationMatrixSchema` (Option Y per [`REQUIREMENTS-crawley.md §5`](crawley-sys-arch-strat-prod-dev/REQUIREMENTS-crawley.md)) | v2.1 line 225 |
| **D-V21.18** | KB runtime architecture | Adopt [`plans/kb-runtime-architecture.md`](kb-runtime-architecture.md) — deterministic rule-tree-first NFR engine + pgvector RAG fallback + decision_audit table + multi-turn gap-fill + "why this value?" UI | v2.1 line 230 |
| **D-V21.19** | Audit-sink storage | Postgres `decision_audit` table (extends existing `0011_decision_audit.sql`) | v2.1 line 231 |
| **D-V21.20** | Vector DB host | Supabase pgvector (extend existing `0011_kb_chunks.sql`; pgvector already enabled at `0008_enable_pgvector.sql`) | v2.1 line 232 |
| **D-V21.21** | Embedding model | OpenAI `text-embedding-3-small` (1536 dim) via `EMBEDDINGS_API_KEY` | v2.1 line 233 |
| **D-V21.22** | RAG scope (Wave E v1) | KB chunks only; broaden to chat history + upstream artifacts in a future cycle | v2.1 line 234 |
| **D-V21.23** | Gap-surface UI | Reuse existing `components/chat/` — `surface-gap.ts` producer routes through Wave A's `lib/chat/system-question-bridge.ts` (shared bridge already shipped in v2.1) | v2.1 line 235 |

---

## Wave A ↔ Wave E handshake (CONTRACT — already shipped in v2.1)

v2.1 shipped the Wave-A side of the handshake — `lib/chat/system-question-bridge.ts` and the `GENERATE_nfr` / `GENERATE_constants` graph nodes (currently wrapping LLM-only agents). v2.2 Wave E swaps the internals behind those node names. Honor verbatim:

- **Stable interface version:** `nfr_engine_contract_version: 'v1'` on each node's output envelope. Increment to `'v2'` only when the emitted shape genuinely changes (forces a Wave A re-edit).
- **Output shapes (Zod-pinned):** NFR slice of [`submodule-2-3-nfrs-constants.ts`](../apps/product-helper/lib/langchain/schemas/module-2/submodule-2-3-nfrs-constants.ts); constants slice of the same file.
- **Failure semantics:** `final_confidence < 0.90` AND `decision.llm_assist === false` AND no fallback rule matched → emit `{ status: 'needs_user_input', computed_options, math_trace }` and route to `system-question-bridge.ts` (NOT a thrown error).
- **Implementation independence proof:** Wave A's `__tests__/langchain/graphs/intake-graph.test.ts` passes with both the v2.1 LLM-only agent AND v2.2 `nfrEngineInterpreter.evaluate(...)` behind `GENERATE_nfr` — fixtures pinned to Zod shape, NOT implementation path.

Source: v2.1 lines 498–504. **Do not edit the v2.1 contract during Wave E execution** — if the contract genuinely needs a v2 shape, write a new ADR and re-thread Wave A.

---

## Day-0 inventory (BLOCKING for Wave E start)

Two ~30-60 min research tasks land first. Output: `plans/wave-e-day-0-inventory.md`.

- [ ] **T9 dedup inventory** — confirm what already shipped (52 KBs into `_shared/` per CLAUDE.md state) so Wave E doesn't redo it. Walk `apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_shared/` + symlink graph; ledger filename + source modules.
- [ ] **Migrations on-disk verification** — read `apps/product-helper/lib/db/migrations/0008_enable_pgvector.sql` + `0011_kb_chunks.sql` + `0011_decision_audit.sql`; confirm the delta-migration plan (column shapes, RLS policies, index choices) still holds against current disk state.
- [ ] **R-v2.1.A inventory pickup** — read TA1's `migrations-and-agent-audit` output; populate the [`plans/post-v2.1-followups.md`](post-v2.1-followups.md) P2 table with each adapter-wrapper'd agent (file path, LOC delta estimate, adapter commit SHA, refactor ticket scope).
- [ ] **TD1 drift check** — read `plans/v21-outputs/td1/preflight-log-fixture.md` vs `preflight-log-live.md` (P3 placeholder). If divergent, capture the divergence shape in `post-v2.1-followups.md`. If no drift, collapse P3 to ✅ resolved.

These are research, not deliverables — not bundled into any EC. The inventory file gets written when whoever picks up this pass does the actual code/db reads.

---

## Wave C — Crawley schema closeout + eval harness

**Goal:** typed-schema layer for Crawley discipline; portfolio determinism narrative.

**Source content:** v2.1 lines 362–400 (Files added / Files edited / Wave C exit criteria). v2.2 honors verbatim. Inherited ECs:

- **EC-V21-C.0** Namespace resolution (preflight, blocking) — `module-5-form-function/` → `module-5/`; existing `form-function-map.ts` absorbed; tsc green; no duplicate schema keys.
- **EC-V21-C.1** All 10 Crawley schemas present; tsc green; round-trip jest tests pass.
- **EC-V21-C.2** `mathDerivationMatrixSchema` in `module-5/_matrix.ts`; 10 matrix sites + 1 scalar chain consume it (per [`REQUIREMENTS-crawley.md §5`](crawley-sys-arch-strat-prod-dev/REQUIREMENTS-crawley.md)).
- **EC-V21-C.3** All 10 Drizzle migrations applied; RLS verified.
- **EC-V21-C.4** LangSmith dataset per agent; ≥ 30 graded examples each.
- **EC-V21-C.5** Methodology-correction page rendered at `/about/methodology` (closes v2.1 P9).
- **EC-V21-C.6** Quarterly `inputs_hash` drift check job scheduled.

**Wave C cost:** +$50/mo (Sentry dashboards + LangSmith eval) per v2.1 cost table (line 542).

---

## Wave E — KB runtime architecture rewrite

**Goal:** replace the LLM-only NFR + constants synthesis path with a Chip-Huyen-style deterministic-rule-tree-first runtime — heuristic match → confidence-clamped auto-fill → LLM-refine fallback only when confidence < 0.90 → multi-turn user gap-fill loop only when fallback also fails. Plus pgvector + embeddings layer for KB retrieval. Plus immutable per-decision audit trail. Plus PII redaction + dynamic model routing. The KB itself is rewritten to a schema-first 6-section shape so every phase file is parseable as `engine.json` rules, not free-prose.

**Source content:**
- v2.1 lines 439–523 (Files added / Files edited / Tests / Wave A integration / Contract pin / Wave E exit criteria)
- [`plans/kb-runtime-architecture.md`](kb-runtime-architecture.md) (v1, 2026-04-20) — full G1–G11 detail; header + §6 already retargeted to `13-Knowledge-banks-deepened/` per EC-V21-E.0(i)

Inherited ECs:

- **EC-V21-E.0** Day-0 reconciliation: (i) source plan path rewrite ✅ committed 2026-04-25; (ii) snapshot tag `wave-e-pre-rewrite-2026-04-26` (or current date) created on v2.2 feature branch before any phase-file edit.
- **EC-V21-E.1** G1 + G3 (Interpreter + Predicate DSL) shipped; clarification-detector refactored to consume engine.
- **EC-V21-E.2** G4 (ArtifactReader + ContextResolver) shipped; tested against 5 representative phase decisions.
- **EC-V21-E.3** G5 (`decision_audit` extensions + writer) shipped; RLS verified; every engine evaluation writes an audit row.
- **EC-V21-E.4** G6 (fail-closed rules) loader + runner shipped; all phase files' STOP GAP checklists machine-readable.
- **EC-V21-E.5** G7 (gap-fill loop) wired through v2.1's `system-question-bridge.ts`; multi-turn flow lands an answer back into context construction.
- **EC-V21-E.6** G8 + G9 (pgvector + embeddings) shipped; 313 KB files embedded into `kb_chunks`; `searchKB(...)` p95 < 200ms.
- **EC-V21-E.7** G10 + G11 (PII redaction + model routing) shipped.
- **EC-V21-E.8** All 13 `engine.json` rule trees authored + golden-tested; ≥ 5 fixtures each.
- **EC-V21-E.9** KB rewrite γ complete: 80 phase files in schema-first 6-section shape across M1–M7.
- **EC-V21-E.10** KB rewrite δ complete: duplicate cross-cutting KBs deleted (delegated to T9 if not already done) + 5 schema extensions landed.
- **EC-V21-E.11** KB rewrite ε complete: LangGraph nodes for "why this value?" provenance UI shipped — every auto-filled NFR/constant exposes the matched rule + math trace + override-history button.
- **EC-V21-E.12** M2 NFR + constants generation switches from LLM-only to engine-first in production; `GENERATE_nfr` and `GENERATE_constants` route through `nfrEngineInterpreter.evaluate(...)`.
- **EC-V21-E.13** Per-decision LLM call rate drops ≥ 60% on M2 (heuristic auto-fill carries most decisions; LLM-refine fires only on `final_confidence < 0.90`).

**Wave E cost lever:** −$240/mo on M2 LLM (engine heuristic auto-fill drops LLM call rate ≥ 60% on the M2 slice) + $1/mo pgvector storage + $5/mo OpenAI embeddings = net −$234/mo per v2.1 cost table (line 546). Combined with Wave B's −$277/mo, this is the path to the AV.01 $320/mo portfolio target.

**Acceptance criterion (cost):** post-v2.2 cost projection ≤ $320/mo at 100 DAU on `scripts/load-test-tb1.ts`. (Per [`post-v2.1-followups.md`](post-v2.1-followups.md) P1.)

---

## Post-v2.1 backlog (housekeeping inside v2.2)

Pulled from [`plans/post-v2.1-followups.md`](post-v2.1-followups.md):

- **P2 — Deferred fs-side-effects refactors >200 LOC.** Each adapter-wrapper'd agent (R-v2.1.A Option C) gets refactored in turn; underlying refactor lands; adapter wrappers removed. Inventory populated by Day-0 task above.
- **P3 — TD1 fixture-vs-live preflight drift.** Resolves to ✅ or captures divergence shape. One-line outcome.
- **P5 — Stranded partial `kb-upgrade-v2/` trees.** `plans/kb-upgrade-v2/` and `.claude/plans/kb-upgrade-v2/` each carry only modules 1, 2, 3, 4, 6 — partial duplicates of complete `system-design/kb-upgrade-v2/` (8 modules). Resolve via either (a) `rm -rf` both partial trees (the symlink `.claude/plans → ../plans` collapses both with one delete), or (b) replace each partial tree with a single-line README pointing at `system-design/kb-upgrade-v2/`. Decision left to v2.2 owner; non-blocking.

---

## Sequencing

Wave C and Wave E are **independent** (no shared files; Wave C touches schemas + eval, Wave E touches engine + KB content + DB extensions). They can ship in parallel or serial. Recommended sequencing if owner is single-threaded:

1. **Day 0** — Inventory pass (above). ~2 hours.
2. **Wave C first** (smaller surface, ~5-7 days) — locks the typed-schema discipline; clears v2.1 P9 (methodology page); LangSmith dataset fixtures become a Wave-E quality gate.
3. **Wave E second** (~10-15 days) — consumes Wave C's typed schemas where applicable; LangSmith eval harness from Wave C measures Wave E's per-rule confidence drift.
4. **Post-v2.1 housekeeping** — P2/P3/P5 fold in opportunistically as touched files surface.

Parallel sequencing is fine if owner has 2 streams; the contract pin (v2.1 lines 498–504) prevents drift between them.

---

## Ship gate

v2.2 ships when:

- [ ] All Wave C ECs (EC-V21-C.0 through .6) green
- [ ] All Wave E ECs (EC-V21-E.0 through .13) green
- [ ] Day-0 inventory file written + committed
- [ ] Post-v2.1 P2/P3/P5 resolved or explicitly carried to v2.3
- [ ] AV.01 cost target met: `scripts/load-test-tb1.ts` projection ≤ $320/mo at 100 DAU
- [ ] CLOSEOUT section appended to this doc with tag SHAs (mirror v2.1 closeout pattern)
- [ ] Release notes entry appended to [`plans/v2-release-notes.md`](v2-release-notes.md)

---

## Cross-references

- v2.1 master plan (source content): [`c1v-MIT-Crawley-Cornell.v2.1.md`](c1v-MIT-Crawley-Cornell.v2.1.md)
- Post-v2.1 follow-ups: [`post-v2.1-followups.md`](post-v2.1-followups.md)
- KB runtime architecture source: [`kb-runtime-architecture.md`](kb-runtime-architecture.md)
- Crawley requirements: [`crawley-sys-arch-strat-prod-dev/REQUIREMENTS-crawley.md`](crawley-sys-arch-strat-prod-dev/REQUIREMENTS-crawley.md)
- **Methodology Rosetta (Cornell ↔ Three-Pass ↔ Crawley ↔ disk modules):** [`methodology-rosetta.md`](methodology-rosetta.md)
- Methodology canonical (three-pass argument): [`../system-design/kb-upgrade-v2/METHODOLOGY-CORRECTION.md`](../system-design/kb-upgrade-v2/METHODOLOGY-CORRECTION.md)
- v2 shipped: [`v21-outputs/release/v2.1-shipped.md`](v21-outputs/release/v2.1-shipped.md)
- Wave-4 v2 backlog (separate track): [`post-v2-followups.md`](post-v2-followups.md)
- Release notes: [`v2-release-notes.md`](v2-release-notes.md)
