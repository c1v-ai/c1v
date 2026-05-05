---
name: Handoff — Draft Pipeline Funnel (turn the mess into a pricing tier)
date: 2026-05-04
branch: fix/intake-extraction-nfr-outofscope (13 fix commits already on origin via push 2026-05-03)
base: 41acf9f (V2 fix commits already shipped + preview-validated)
status: PLAN ONLY — no code yet. Decision locked with David 2026-05-04 ~01:00 EDT.
companions:
  - plans/HANDOFF-2026-05-03-intake-prompt-redesign.md (prior session, V2 fix shipped)
  - plans/intake-prompt-redesign-folder/code-review-2026-05-03.md (911-line review with 3 P0s + addendum 4 P0s)
  - plans/intake-prompt-redesign.md (the V2 plan that shipped)
  - plans/methodology-rosetta.md (Cornell ↔ three-pass ↔ Crawley ↔ Atlas translation)
  - apps/product-helper/docs/architecture/data-flow-diagram.html (the diagram that crystallized the picture)
  - apps/product-helper/lib/chat/system-question-bridge.ts (the engine seam between Pipeline A & B)
  - apps/product-helper/__tests__/v2.2.2-post/dataset_33ec71d2-b6cb-4d5e-8779-47a70c4c617f.jsonl (the preview trace)
author: Bond
---

# Handoff — Draft Pipeline Funnel

> **Read order for fresh Claude:** this file → the prior 05-03 handoff (what V2 fix shipped) → the architecture HTML diagram (visual map of two pipelines) → code-review-2026-05-03.md §A.1-A.7 (where the addendum's P0 #4 fabrication evidence lives). Methodology-rosetta.md is reference; only read if the discussion turns to Pass 1 vs Pass 3 sequencing.

---

## 0. The pivot in one paragraph

The 13 V2 fix commits stopped extraction-layer fabrication on the LangGraph chat path. Preview trace then showed two new problems: (a) downstream fabrication migrated into intake-side `ffbd/qfd/decision-matrix/interfaces` agents; (b) Quick Start orphan callers were producing low-quality 1-actor PRDs from a single sentence. Both look like bugs through the "fix the fabrication" lens — but viewed through the architecture diagram, they are **the free tier of a 3-tier funnel that doesn't exist yet.** Repurpose, don't delete or gate. Preview the architecture in 37s on free tier; sell refinement + atlas-grounded derivation chain + signed export at the existing `/synthesize` paywall (1000 credits, already implemented per D-V21.10).

---

## 0.5 Status — what's done vs what's pending

### Already shipped (commits on `fix/intake-extraction-nfr-outofscope`, pushed to origin 2026-05-03)

| Step | Commit | Outcome | Evidence |
|---|---|---|---|
| ✅ 0 | `9f6026c` | `projectType` threaded through `IntakeState` + `langgraph-handler.ts` 4 callsites | tsc clean; 47/47 analyze-response tests pass |
| ✅ 0.5 | `31ab4be` | brace audit + initial eval baselines | `brace-audit.md` + `eval-baselines.json` |
| ✅ 0.5b | `07e9c76` | 6 intake eval datasets authored (10 graded samples each = 60 fixtures) | all 60 validate against agent Zod schemas |
| ✅ 1 | `94b216d` | `atlas-loader.ts` stub + `renderAtlasPriors()` (returns "No peer evidence available" — honest fallback) | 6/6 tests pass; `industry-standard` regression assertion clean |
| ✅ 2 | `cf72fe4` | `prompts.ts` v2 module — cascade removed, 4 phase-staged `EXTRACTION_PROMPTS` + 5 `*_RULES` blocks + `extractionPromptLegacy` back-compat | 27/27 prompts.test.ts pass; cascade-removal regression asserts no `MUST infer\|Do NOT return empty\|REQUIRED minimum` |
| ✅ 3 | `9b40e59` | `extract-data.ts` wired behind `INTAKE_PROMPT_V2` flag | 18/18 extraction-agent tests pass |
| ✅ 4 | `8bfc2e3` | `ffbd-agent.ts` migration | 6/6 ffbd-agent.test.ts pass |
| ✅ 5a | `bf5a13a` | `qfd-agent.ts` migration | 6/6 qfd-agent.test.ts pass |
| ✅ 5b | `8918885` | `interfaces-agent.ts` migration | 6/6 interfaces-agent.test.ts pass |
| ✅ 5c | `6375fb6` | `decision-matrix-agent.ts` migration | 6/6 decision-matrix-agent.test.ts pass |
| ⚠️ 5d | `7b7a453` | `nodes/generate-nfr.ts runLlmOnly` migration — **DEAD CODE** (factory has zero callers; see P0-3) | 6/6 generate-nfr.test.ts pass but production codepath is unwired |
| ✅ 5e | `0ac538a` | caller wiring for V2 agent opts in 4 graph nodes | type-check clean |
| ✅ 6 | `41acf9f` | extraction guard metadata (`detectExtractionGuards` for `phase_leak` + `fabrication`) | 5/5 extract-data-guards.test.ts pass |

### Validated in preview (2026-05-03)

| Validation | Status | Evidence |
|---|---|---|
| ✅ Extract-data V2 produces no fabrication | **PASS** | L6 trace: actors=1, NFRs=0, goalsMetrics=0, problemStatement='' on first turn from "an AI meal planner that creates meals..."; L8 trace: actors=0 from "AI Meal Planner" alone |
| ✅ No `industry-standard` / `MUST infer` / `Do NOT return empty` in any LLM input | **PASS** | grep across all 12 records of `dataset_33ec71d2-...jsonl` clean |
| ✅ No `[EXTRACT_GUARD]` warnings | **PASS** | trace scan clean |
| ✅ Token output dropped from ~13-18K → ~3-5K on first turn | **PASS** | record size comparison `dataset_204bda94` (legacy) vs `dataset_33ec71d2` (V2) |

### Still required — closed by funnel plan §4

| Issue | Severity | Fix path | Status |
|---|---|---|---|
| **P0-1 — Orphan `extractProjectData` callers** (Quick Start, conversations.ts:128, save/route.ts:182) | P0 | **Closed by Task 2** — orphans become draft producers, not bugs. Quick Start orchestrator IS the draft pipeline orchestrator post-funnel. | ❌ pending |
| **P0-4 — Downstream fabrication: `extractedData.{ffbd,qfd,decisionMatrix,interfaces}` populated with REQ-030 / SS1-SS6 / IF-23 invented IDs** | P0 | **Closed by Tasks 1+2+3** — `kind: 'draft'` discriminator + write to `project_artifacts` (not `extractedData`) + draft path explicitly labeled provisional. Fabrication acknowledged-and-contained instead of hidden. | ❌ pending |
| **P0-5 (originally my P0-4) — `kbAnalysisLLM` "I've inferred 12 potential external elements... USDA FoodData API" boilerplate** | P0 | **Closed by Task 5** — strip `INFERENCE_RULES.signals` + `minElements` floor + "INFER aggressively" prompt language. Optionally wire to `system-question-bridge` via new `m1_intake_gap` source. | ❌ pending |

### Still required — INDEPENDENT of funnel plan

| Issue | Severity | Fix | Why independent | Status |
|---|---|---|---|---|
| **P0-2 — `emitNfrContractEnvelope` fires NFR open-question on first context-diagram turn** | P0 | Phase-gate the function: skip body if `currentKBStep` ∉ {`functional-requirements`, `sysml-activity-diagram`, `ffbd`, `decision-matrix`, `qfd-house-of-quality`, `interfaces`}. ~8 LOC + 1 test. | Lives in extract-data flow, fires regardless of draft/refined tier. Must ship to prevent first-turn UX regression. | ❌ pending |
| **P0-3 — `nodes/generate-nfr.ts createGenerateNfrNode` factory is dead code** (zero callers in production) | P0 | **Drop step 5d commit** (`7b7a453`) OR wire `createGenerateNfrNode` into `intake-graph.ts`. Recommended: drop. | Step 5d shipped a code path nothing calls. Eval scores from `nfr-runllmonly.jsonl` reflect a phantom path. | ❌ pending |

### Still required — P1 cleanup (defer to v2 of funnel; not blockers)

| Issue | Effort | Status |
|---|---|---|
| Add `no-mandate-cascade.test.ts` source-scanner regression test (plan §9 #6) | ~10 min | ❌ pending |
| Capture legacy eval baseline against the 6 new datasets (plan §9 #4 — "within 5pp of pre-rewrite baseline" gate currently uncheckable) | ~30 min | ❌ pending |
| Phase-skip diagnostic — L4 trace showed 5 phases jumped in 1 turn (`context-diagram` → `sysml-activity-diagram`). Likely pre-existing; verify with `git log` on `getNextKBStep` callers. | ~30 min diag + variable fix | ❌ pending |
| `quick_start_agent_outcome{agent, status}` observability metric (~75K tokens wasted per Quick Start invocation surfaced in L4 trace) | ~30 min | ❌ pending |

### Still required — P2 (cleanup at flag-removal)

| Issue | When | Status |
|---|---|---|
| Drop `extractionPromptLegacy` export from `prompts.ts` | After 2-week production soak | ❌ deferred |
| Collapse V2-suffix LLM instance pairs back to 1 each (5 agents) | After 2-week soak | ❌ deferred |
| Fix legacy `escapeBraces` `}` no-op bug at `qfd-agent.ts:139` + `interfaces-agent.ts:124` (preserved verbatim on flag-off path) | After 2-week soak (legacy path deleted) | ❌ deferred |
| Drop `INTAKE_PROMPT_V2` from `feature-flags.ts` + `turbo.json` | After 2-week soak | ❌ deferred |
| Resolve `projectType: None` everywhere (atlas archetype dormant in production data — addendum P0 #6, recommended defer per §A.3 option 3) | When KB-9 atlas runtime loader lands | ❌ deferred |

### Blocked

| Item | Blocker |
|---|---|
| Production flag flip (`INTAKE_PROMPT_V2=true` in prod Vercel env) | Wait until P0-2 + P0-3 + funnel Tasks 1-3 + Task 5 ship; verify on preview |
| Funnel Task 4 (viewer component edits) | UI Freeze on 4 system-design viewers per CLAUDE.md — needs explicit unfreeze from David |

### Score

- **13 of 13 V2 redesign commits shipped + preview-validated** (one ships dead code per P0-3)
- **0 of 5 P0s remediated** (5 known: P0-1 through P0-5)
- **0 of 4 P1s remediated**
- **0 of 5 P2s deferred to flag-removal cleanup** (correctly deferred, not "missing")
- **Funnel plan: 0 of 5 tasks started**

The V2 fix WORKS for what it was scoped to (extraction-layer fabrication). The post-V2 work is bigger than the V2 work because the preview surfaced architectural seams the static review couldn't see. Funnel plan absorbs 3 of 5 P0s as repositioning, leaving only P0-2 + P0-3 to fix as standalone bugs.

---

## 1. The locked decisions

| # | Decision | Rationale |
|---|---|---|
| 1 | **Same URLs, in-place state discriminator** (NOT URL fork to `/draft-architecture`) | UX continuity, no broken bookmarks/deep-links/IDE refs. The existing `/projects/[id]/system-design/{ffbd,qfd,decision-matrix,interfaces}/page.tsx` and `/requirements/architecture/page.tsx` routes stay. State is communicated via the existing "AI Generated · 100% Complete" badge slot. |
| 2 | **Repurpose intake-side ffbd/qfd/dm/interfaces agents as the draft path** (do NOT delete) | They already produce structured output fast (~10-15s each). Steps 4+5a-d V2 migration commits become the basis of the draft path, not a removal commit. The fabrication is acknowledged-and-labeled, not hidden. |
| 3 | **Repurpose Quick Start orchestrator as draft pipeline orchestrator** (do NOT kill or flag-gate) | Same logic. It's the parallel fan-out engine for the draft path. The orphan-caller class disappears because callers become explicit draft producers. |
| 4 | **Add `kind: 'draft' \| 'refined'` discriminator to artifacts** | Lives in the artifact JSON shape (Zod schema extension). Read by viewer components → switches badge state ("AI Generated · Draft" / "AI Generated · Refined · Atlas-grounded"). Same URL, same component, different banner. |
| 5 | **Refine = SYN paywall (existing 1000-credit endpoint)** | `POST /api/projects/[id]/synthesize` already exists, already gates on credits per D-V21.10. Pivot is in copy/CTA: "synthesize your PRD" → "refine your draft into an atlas-grounded blueprint with derivation chain + signed export." No new paywall surface. |
| 6 | **Provisional priors are correct, not a bug** | Per Rosetta §9.3, `provisional: true` + `sample_size: <n>` is the methodology's escape hatch when atlas < 7 entries for an archetype. Draft M4 will set this on every binding. UI surfaces it as muted/dotted relationships. |
| 7 | **kbAnalysisLLM migration ships orthogonally** | Still required (per prior P0-4) — governs chat reply quality during BOTH draft and refined paths. Does not block the funnel work. |

---

## 2. Time math (M0 → M4 visible)

| Path | Steps | Total |
|---|---|---|
| **Today (current arch, serial Pipeline B)** | M0(3s) → M2.1(6s) → M2.2(7s) → M2.3(9s) → HG(0s) → backend agents parallel(12s) → user clicks Synthesize → M3(12s) → M1(10s) → M5(14s) → **M4(28s)** | **~100s** |
| **Funnel (intake-side seeds M4 + parallel fan-out)** | M0(3s) → M2.1(6s) → IN PARALLEL { M2.2/M2.3 chat extracts(~12s), intake-side ffbd/qfd/dm/iface(~12s), **M4-draft with thin seeds + provisional atlas(~28s)** } | **~37s** |

**~63s saved (2.7× speedup) to first visible architecture artifact.** Crucially: **<1 minute from sign-up to "WOW."**

---

## 3. Architecture map post-pivot

```
┌────────────────────────────────────────────────────────────────────────┐
│ FREE TIER (DRAFT)                                                      │
│                                                                        │
│   M0 signup signals (Haiku)                                            │
│      │                                                                 │
│      ▼  user types vision                                              │
│   M2.1 context-diagram extract (Sonnet)                                │
│      │                                                                 │
│      ├──► M2.2 use-cases + scope ───┐                                  │
│      ├──► M2.3 NFR + goals ─────────┤                                  │
│      ├──► intake-side FFBD-draft ───┤  (parallel fan-out, ~12-15s)     │
│      ├──► intake-side QFD-draft ────┤                                  │
│      ├──► intake-side DM-draft  ────┤                                  │
│      ├──► intake-side IF-draft  ────┤                                  │
│      └──► M4-draft (Opus, thin seeds + provisional atlas) ──► writes:  │
│                                                  extractedData.draftArchitecture │
│      │                                                                 │
│      ▼                                                                 │
│   /system-design/{ffbd,qfd,decision-matrix,interfaces}     SAME URLS   │
│   /requirements/architecture                                           │
│   Badge: "AI Generated · Draft · provisional priors"                   │
│                                                                        │
└────────────────────────┬───────────────────────────────────────────────┘
                         │  user keeps chatting → bridge surfaces gaps
                         │  draft becomes "less provisional" as user answers
                         │  CTA: "Refine to atlas-grounded blueprint"
                         ▼
┌────────────────────────────────────────────────────────────────────────┐
│ PAID TIER (REFINED) — POST /api/projects/[id]/synthesize · 1000 credits│
│                                                                        │
│   Pipeline B serial chain: M3 → M1 → M5 → M4 → M7 → M8a → M8b → M6     │
│                                                          │             │
│                                                          ▼             │
│                                                   SYN keystone (Opus)  │
│                                                   architecture_recommendation.v1.json │
│                                                                        │
│      │                                                                 │
│      ▼  writes to: project_artifacts (table + Supabase Storage)        │
│   SAME URLS: /system-design/* + /requirements/architecture              │
│   Badge UPGRADES IN-PLACE: "AI Generated · Refined · Atlas-grounded"   │
│   Plus: download signed bundle, derivation chain visible               │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

**Key invariant:** the same URL + same component renders both states. The component reads the artifact's `kind` field and switches badge + banner. No URL migration, no broken links.

---

## 4. The tasks (ordered, scoped) — AMENDED 2026-05-04 02:49 EDT per critique

> Critique fixes folded inline. Each task uses agent-card format per the data-flow diagram visual language: **badge** / **effort** / **files (full `file://` URLs)** / **numbered migration steps** / **tech chips** / **verification** / **output route**.
>
> **Critique amendments applied:** C1, C2, C3, C4, I1, I2, I3, M1, M2 — all 9 issues from `file:///Users/davidancor/Projects/c1v/plans/critique-HANDOFF-2026-05-04-draft-pipeline-funnel.md`. Each amendment is tagged inline `[critique: Cn]` at the step that closes it.

---

### `[T0]` Phase-gate `emitNfrContractEnvelope` ~30 min · **DO FIRST**

> **Closes:** P0-2 (NFR open-question fires too early) · **Critique fix:** I2 (gates body, covers BOTH callsites)
> **Token cost:** 0 (no LLM) · **Risk:** very low

**Files:**
- `file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/graphs/nodes/extract-data.ts` — modify `emitNfrContractEnvelope` body at line 192-208
- `file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/graphs/nodes/__tests__/extract-data-guards.test.ts` — add 2 new test cases (covers I2)

**Migration steps:**
1. **Locate** the two callsites: `extract-data.ts:98` (inside the `hasCompleteData` short-circuit) and `extract-data.ts:156` (normal extraction path after `mergeExtractionData`). Both verified via grep.
2. **Insert** the phase-gate at the TOP of the `emitNfrContractEnvelope` body (line ~192). Single guard — covers both callsites because the function body is the chokepoint. `[critique: I2 closed]`
3. **Gate condition:** skip if `state.currentKBStep` ∉ {`functional-requirements`, `sysml-activity-diagram`, `ffbd`, `decision-matrix`, `qfd-house-of-quality`, `interfaces`}.
4. **Author test A:** `currentKBStep='context-diagram'` + `hasCompleteData=false` → assert no `surfaceOpenQuestion` / no `persistArtifact`. (extraction path)
5. **Author test B:** `currentKBStep='context-diagram'` + `hasCompleteData=true` → same assertions. (skip path — line 98 callsite). `[critique: I2 — both paths covered]`

**Sketch:**
```ts
async function emitNfrContractEnvelope(state: IntakeState, mergedData: any): Promise<void> {
  const phaseAllowsNfrSurfacing =
    state.currentKBStep === 'functional-requirements' ||
    state.currentKBStep === 'sysml-activity-diagram' ||
    state.currentKBStep === 'ffbd' ||
    state.currentKBStep === 'decision-matrix' ||
    state.currentKBStep === 'qfd-house-of-quality' ||
    state.currentKBStep === 'interfaces';
  if (!phaseAllowsNfrSurfacing) return;
  // ... existing body
}
```

**Tech chips:** ⚙️ Pure TS · 🟡 LangGraph state read · ✅ Zod (no schema change)

**Verification:** `pnpm tsc --noEmit` clean · `npx jest .../extract-data-guards.test.ts` 5+2=7 pass · preview replay shows no first-turn NFR open-question

→ unblocks Phase 1 validation replay

### `[T0.5]` Decide on `runLlmOnly` (drop recommended) ~10 min · **DO FIRST**

> **Closes:** P0-3 (dead code migration — factory has zero callers in production) · No critique flag.
> **Token cost:** 0 · **Risk:** zero (revert)

**Files (drop path — RECOMMENDED):**
- `file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/graphs/nodes/generate-nfr.ts` — revert step 5d commit `7b7a453`
- `file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/prompts.ts` — drop `NFR_RULES` export (or retain as doc-only)

**Migration steps (drop path):**
1. **Verify** zero callers: `grep -rn "createGenerateNfrNode\|GenerateNfrLlmAgent" apps/product-helper/ --include="*.ts" | grep -v ".test.ts"` → expect zero matches outside `generate-nfr.ts` itself.
2. **Revert** commit `7b7a453` via `git revert --no-edit 7b7a453` on a fresh commit (do NOT amend prior commits per project policy).
3. **Drop** `NFR_RULES` export from `prompts.ts` (or annotate as `@deprecated factory dormant`).
4. **Update** plan §3.1 to read "5 active LLM call paths + 1 dormant factory (deferred)".

**Files (wire path — alternative ~30 min):**
- `file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/graphs/intake-graph.ts:512` — add `generate_nfr_llm` node to graph construction
- Concrete `GenerateNfrLlmAgent` adapter around `createClaudeAgent(nfrSchema, 'generate_nfr_llm', {maxTokens: 6000})` · route only on `currentKBStep === 'functional-requirements'`

**Tech chips:** ⚙️ Pure TS · 🔄 git revert · ✅ Zod (no schema change)

**Verification:** `pnpm tsc --noEmit` clean · `npx jest lib/langchain/__tests__/prompts.test.ts` pass · `git log --oneline` shows revert commit

**Recommendation:** **drop**. NFR LLM path can be a separate PR after the funnel ships.

→ removes ambiguous dead code; clears the 3.1 inventory drift

### `[T1]` Add `kind` discriminator to artifact schemas ~3 hr

> **Closes:** P0-4 partial (foundation for everything downstream) · **Critique fix:** C4 (correct file paths)
> **Token cost:** 0 (schema only) · **Risk:** low (default `'refined'` preserves legacy rows)

**Files (CORRECTED per critique C4 — `module-4/decision-network-v1.ts` does NOT exist; use the index barrel):**
- `file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/schemas/module-3/ffbd-v1.ts` — add `kind: z.enum(['draft','refined']).default('refined')` to root schema
- `file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/schemas/module-4/index.ts` — add NEW root wrapper `decisionNetworkRootSchema` exporting `kind` + `phases` (the 23 existing phase schemas already live here as a barrel) `[critique: C4 closed]`
- `file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/schemas/module-6-hoq/index.ts` — add `kind` to root schema
- `file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/schemas/module-7-interfaces/index.ts` — add `kind` to root schema
- `file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/schemas/synthesis/architecture-recommendation.ts` — add `kind` (hardcoded `'refined'`; SYN never produces draft)
- `file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/schemas/__tests__/registry-no-dupes.test.ts` — extend to assert `kind` present on all 5 schemas

**Migration steps:**
1. **Verify** the M4 file claim by listing `apps/product-helper/lib/langchain/schemas/module-4/` — confirm 23 files, no `decision-network-v1.ts`. (Already verified.)
2. **Open** `module-4/index.ts` and add a new export `decisionNetworkRootSchema = z.object({ kind: z.enum(['draft','refined']).default('refined'), phases: z.object({ ... }) })` wrapping the existing phases. `[critique: C4 — root wrapper, not nonexistent file]`
3. **Open** `module-3/ffbd-v1.ts` and patch the existing root export to add `kind`. Default `'refined'`.
4. **Open** `module-6-hoq/index.ts` and `module-7-interfaces/index.ts` — same `kind` field added to each root export.
5. **Open** `synthesis/architecture-recommendation.ts` — add `kind: z.literal('refined').default('refined')` (hardcoded; SYN draft is impossible by design).
6. **Regenerate** JSON schemas: `pnpm tsx lib/langchain/schemas/generate-all.ts` → emits `schemas/generated/{module-3,module-4,module-6-hoq,module-7-interfaces,synthesis}/*.schema.json`.
7. **Test** schema-parse round-trip: feed an existing `project_artifacts` row through Zod → should parse with `kind: 'refined'` injected by default. Cover legacy-row case explicitly.

**Tech chips:** ✅ Zod discriminated union · 🔄 generate-all.ts regen · 🗄️ project_artifacts (no migration — defaults handle it)

**Verification:** `pnpm tsc --noEmit` clean · `npx jest lib/langchain/schemas/__tests__/` all pass · sample existing row deserialize → `kind === 'refined'`

→ unblocks T2 (draft writes) and T4 (viewer badge switch)

---

### `[T1.5]` **NEW** Extend `extractionSchema` + `IntakeStateAnnotation` with `draftArchitecture` ~1 hr · **PRE-T2 GATE**

> **Closes:** C3 (the `draftArchitecture` namespace requires type-system changes — Task 2 cannot land without this) · **Critique fix:** C3
> **Token cost:** 0 · **Risk:** medium (touches IntakeState reducer surface)

**Files:**
- `file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/schemas.ts:792-811` — extend `extractionSchema` with optional `draftArchitecture` field; `ExtractionResult` type auto-updates via Zod inference
- `file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/graphs/intake-graph.ts:307-422` — `IntakeStateAnnotation.Root` reducer for `extractedData` already accepts the extension via Zod inference; verify no manual annotation override
- `file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/graphs/channels.ts:160` — `createDefaultExtractionResult()` returns the empty/seed shape; add `draftArchitecture: undefined` (or omit since field is `.optional()`)
- `file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/__tests__/schemas.test.ts` — add round-trip test for the extended schema

**Migration steps:**
1. **Open** `schemas.ts:792` and locate `extractionSchema = z.object({ ... })`.
2. **Add** new optional field:
   ```ts
   draftArchitecture: z.object({
     ffbd: ffbdSchema.optional(),
     qfd: qfdSchema.optional(),
     decisionMatrix: decisionMatrixSchema.optional(),
     interfaces: interfacesSchema.optional(),
     m4: z.unknown().optional(), // typed fully in T3 — DraftM4Output
   }).optional(),
   ```
   `[critique: C3 closed]`
3. **Confirm** `ExtractionResult` type at line 811 auto-updates (it's `z.infer<typeof extractionSchema>`).
4. **Run** `pnpm tsc --noEmit` to surface every callsite that needs updating. Expected hits: `channels.ts:createDefaultExtractionResult`, possibly `intake-graph.ts` initializers, possibly `quick-start/orchestrator.ts`. Each is `extractedData` consumer that may want to read the new field — wire them lazily.
5. **Update** `channels.ts:160` `createDefaultExtractionResult()` — since `draftArchitecture` is `.optional()`, no change needed (Zod accepts undefined). Confirm with a parse-round-trip test.
6. **Test** in `schemas.test.ts`: legacy row without `draftArchitecture` parses fine; row WITH `draftArchitecture.ffbd` populated parses fine.
7. **Audit** for stale `Record<keyof ExtractionResult, ...>` callsites (per CLAUDE.md `m2_constants` cascade gotcha): grep `Record<.*ExtractionResult` and `Record<.*draftArchitecture` — confirm none exhaustively enumerate fields.

**Tech chips:** ✅ Zod `.optional()` · 🟡 LangGraph `Annotation.Root` · 🟢 Backward-compat (legacy rows deserialize)

**Verification:** `pnpm tsc --noEmit` clean across entire app · `npx jest lib/langchain/__tests__/schemas.test.ts` pass · seed legacy row from prod → parse OK

→ unblocks T2 (now safe to write `state.extractedData.draftArchitecture.{ffbd,qfd,decisionMatrix,interfaces}`)

### `[T2]` Repurpose intake-side agents as draft producers ~4 hr · **DEPENDS ON T1.5**

> **Closes:** P0-1 (orphan callers become explicit draft producers) + P0-4 (fabrication acknowledged-and-labeled, not hidden)
> **Blocked by:** T1 (kind discriminator) + T1.5 (extractionSchema extension) — DO NOT START until both are merged

**Files (full paths, 4 agents + 4 test files):**
- `file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/agents/ffbd-agent.ts` — drop legacy 20K instance, hardcode `kind: 'draft'`, re-namespace writes
- `file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/agents/qfd-agent.ts` — same pattern
- `file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/agents/decision-matrix-agent.ts` — same pattern
- `file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/agents/interfaces-agent.ts` — same pattern
- `file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/agents/__tests__/ffbd-agent.test.ts` — update namespace assertions
- `file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/agents/__tests__/qfd-agent.test.ts` — same
- `file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/agents/__tests__/decision-matrix-agent.test.ts` — same
- `file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/agents/__tests__/interfaces-agent.test.ts` — same

**Migration steps (apply IDENTICALLY to all 4 agents):**
1. **Pre-flight grep:** `grep -rn "extractedData\.ffbd\|extractedData\.qfd\|extractedData\.decisionMatrix\|extractedData\.interfaces" apps/product-helper/ --include="*.ts" --include="*.tsx"` — capture every reader of the legacy path. Expected hits: 4 page.tsx files (T4 will migrate them) + possibly Quick Start orchestrator. Document in execution log.
2. **Drop** the legacy V1 LLM instance (the `maxTokens: 20000` one) at the top of each agent file. Keep only the V2-suffix instance and rename to drop the `V2` suffix (`structuredFfbdLLMV2` → `structuredFfbdLLM`).
3. **Drop** `INTAKE_PROMPT_V2` gating: remove the `intakePromptV2()` ternary; the V2 prompts ARE the draft path now. Single LLM instance per agent.
4. **Hardcode** `kind: 'draft'` into the agent's emitted artifact (post-Zod-parse, before return). The schema accepts `kind` per T1.
5. **Re-namespace writes:** change `state.extractedData.{ffbd|qfd|decisionMatrix|interfaces} = result` → `state.extractedData.draftArchitecture = { ...state.extractedData.draftArchitecture, {ffbd|qfd|decisionMatrix|interfaces}: result }`. Type-safe per T1.5. `[critique: C3 closed at write site]`
6. **Update** `__tests__/<agent>.test.ts` — every assertion that read `state.extractedData.ffbd` now reads `state.extractedData.draftArchitecture.ffbd`. Same for the other 3.
7. **Drop** local `escapeBraces` const + the per-file `}` no-op bug (qfd:139 + interfaces:124) — the shared correct `escapeBraces` from `prompts.ts` is now the only path.
8. **Audit** for stale legacy-eval baselines: `apps/product-helper/lib/eval/datasets/{ffbd-intake,qfd-intake,decision-matrix-intake,interfaces-intake}.jsonl` — `expected_output` may need namespace update if assertions read raw paths.

**Gotcha (per CLAUDE.md):** the doc says viewers read via `getLatestSynthesis` — the code says they read `extractedData` directly. T2's namespace move BREAKS the page.tsx readers until T4 ships. Recommend bundling T2 + T4 in a single PR OR keeping a temporary read-fallback in viewers (read `draftArchitecture.X` first, fall back to legacy `X` for in-flight rows).

**Tech chips:** 🤖 Claude Sonnet 4.6 (V2 prompts, maxTokens 6000) · ✅ Zod schemas (T1 `kind` field) · 🗄️ `extractedData.draftArchitecture.*` jsonb (NOT `project_artifacts`) · 🟢 Drops `INTAKE_PROMPT_V2` flag

**Verification:** `pnpm tsc --noEmit` clean · `npx jest lib/langchain/agents/__tests__/` 24/24 pass (6 per agent) · trace replay shows agent output written to `extractedData.draftArchitecture.*` namespace with `kind: 'draft'`

→ closes P0-1 + P0-4 in production; unblocks T4 (viewer fallback path now has data to read)

### `[T3]` Add new graph node `generate-m4-draft.ts` ~6 hr · **THE FUNNEL VALUE PROP**

**Closes:** the funnel value proposition (free-tier draft architecture in <60s)

**CRITICAL DESIGN POINT — `generate-m4-draft.ts` is a SUBSET of M4, NOT a full 19-phase run.**

The current `decision-net-agent.ts` (Pipeline B refined path) executes **19 phases** and expects NFRs + use cases + FFBD as stable inputs. At t=9 (parallel fan-out) we only have vision + 1 actor. Calling the full agent at t=9 will either hang waiting for inputs or produce complete noise.

The fix: `generate-m4-draft.ts` runs only **Phase 14 (decision nodes)** + **Phase 16 (Pareto)**, skipping phases 1-13 that require stable NFRs. The `provisional: true` path (Rosetta §9.3) must be a **first-class execution path**, not just a fallback inside `atlas-loader.ts` that pretends to be a normal lookup.

**Thin-input contract (locked):**
```ts
// Input shape — what generate-m4-draft.ts actually requires
type DraftM4Input = {
  vision: string;                 // raw user vision sentence
  actors: Actor[];                // ≥1 actor confirmed by M2.1
  projectType?: string | null;    // for atlas archetype lookup
};

// Output shape — provisional 3-option Pareto preview
type DraftM4Output = {
  kind: 'draft';
  provisional: true;
  alternatives: Array<{
    id: string;                   // e.g. 'ALT-1'
    name: string;                 // e.g. 'Monolith SaaS', 'Modular services', 'Event-driven'
    rationale: string;            // user-recognizable reason
    scores: Array<{
      criterion: string;          // e.g. 'cost', 'latency', 'availability'
      value: number | string;
      bound_to: 'kb-8-atlas' | 'kb-shared' | 'inferred';
    }>;
  }>;
  pareto_frontier: string[];      // alternative IDs on the frontier
  recommended: string;            // alternative ID
  priors: Array<{                 // atlas stubs, all provisional: true initially
    archetype_tag: string;
    sample_size: number;          // 0 until KB-9 lookup wired
    provisional: true;
  }>;
};
```

> **Closes:** the funnel value proposition (free-tier draft architecture in <60s) · **Critique fixes:** I1 (new conditional edge), M2 (projectId in inputs_hash)
> **Token cost:** ~28s @ Opus 4.7 (budget) · **Risk:** medium (new node, parallel fan-out wiring)

**Files (new):**
- `file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/graphs/nodes/generate-m4-draft.ts` — new node, calls thin-input agent variant
- `file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/agents/system-design/decision-net-draft-agent.ts` — NEW thin-input agent. Phase-14 + Phase-16 subset only. Prompt: "given thin signal, propose 3 broad architectural archetypes (monolith / modular / event-driven), score each on cost/latency/availability/scalability, recommend one with rationale. Mark all priors provisional."
- `file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/graphs/nodes/__tests__/generate-m4-draft.test.ts` — node tests
- `file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/agents/system-design/__tests__/decision-net-draft-agent.test.ts` — agent tests

**Files (modify):**
- `file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/graphs/edges.ts:159` — add NEW exported function `routeAfterExtractionWithDraft(state)` (per critique I1 — current routing has no actor-count gate). Returns array fan-out target including `generate_m4_draft` when `actors.length >= 1`. `[critique: I1 closed]`
- `file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/graphs/intake-graph.ts:512` — register `generate_m4_draft` node + wire `routeAfterExtractionWithDraft` as conditional edge from `extract_data` (replaces or supplements `routeAfterExtraction` per architecture map §3)

**Migration steps:**
1. **Verify** LangGraph multi-target fan-out: `addConditionalEdges` with array-returning router is supported in installed `@langchain/langgraph` version. Spike a 5-min test before committing.
2. **Author** thin-input contract (LOCKED per §0):
   ```ts
   type DraftM4Input = {
     vision: string;
     actors: Actor[];
     projectType?: string | null;
     projectId: number;          // [critique: M2 — required for tenant isolation in cache key]
   };
   type DraftM4Output = {
     kind: 'draft';
     provisional: true;
     alternatives: Array<{ id, name, rationale, scores: Array<{ criterion, value, bound_to }> }>;
     pareto_frontier: string[];
     recommended: string;
     priors: Array<{ archetype_tag, sample_size, provisional: true }>;
   };
   ```
3. **Implement** `decision-net-draft-agent.ts`:
   - Reuse `createClaudeAgent(decisionNetDraftSchema, 'generate_m4_draft', { maxTokens: 6000 })` (Opus 4.7)
   - Prompt: ONLY phase-14 (decision nodes) + phase-16 (Pareto frontier) — skip phases 1-13 (require stable NFRs which the draft path doesn't have)
   - Atlas binding via `renderAtlasPriors(projectType ?? 'unknown', ['cost','latency','availability'])` — provisional: true initially (KB-9 stub)
4. **Implement** `generate-m4-draft.ts` node:
   - Read `state.{projectVision, extractedData.actors, projectType, projectId}`
   - Compute `inputs_hash = SHA-256(JSON.stringify({ projectId, vision, actors: actors.map(a=>a.name), projectType }))` `[critique: M2 — projectId scopes the cache to tenant]`
   - Call agent → write to `state.extractedData.draftArchitecture.m4` (T1.5 namespace)
   - Hardcode `kind: 'draft'` + `provisional: true` per T1
5. **Add** `routeAfterExtractionWithDraft` to `edges.ts`:
   ```ts
   export function routeAfterExtractionWithDraft(state: IntakeState): string[] {
     const targets: string[] = ['check_prd_spec'];
     if ((state.extractedData?.actors?.length ?? 0) >= 1
         && !state.extractedData?.draftArchitecture?.m4) {
       targets.push('generate_m4_draft'); // parallel fan-out at t=9s per §2 timeline
     }
     return targets;
   }
   ```
   `[critique: I1 closed]`
6. **Wire** in `intake-graph.ts:512` — add `generate_m4_draft` to graph + `addConditionalEdges('extract_data', routeAfterExtractionWithDraft, ['check_prd_spec', 'generate_m4_draft'])`.
7. **Author** `__tests__/generate-m4-draft.test.ts`: stable inputs → stable output; thin input (vision + 1 actor + projectType=null) → 3 alternatives with provisional priors; identical input twice → byte-identical recommendation (cache hit).
8. **Wire heartbeat** — already active per `ee70f4e` 15s heartbeat in `langgraph-handler.ts`. Confirm it covers the M4-draft 28s window (it does).

**Tech chips:** 🤖 Claude Opus 4.7 · 🟣 Phase-14 + Phase-16 only (subset) · ⚙️ SHA-256 inputs_hash with projectId · ✅ Zod `decisionNetDraftSchema` · 🗄️ `extractedData.draftArchitecture.m4` jsonb · 🟡 LangGraph parallel fan-out via `addConditionalEdges`

**Verification:** `pnpm tsc --noEmit` clean · `npx jest .../generate-m4-draft.test.ts .../decision-net-draft-agent.test.ts` pass · live preview: M4 visible at t≈37s · cache hit on identical input · cross-tenant test: 2 projects with same vision → different cache keys (different projectId)

→ delivers <60s draft architecture; closes the funnel value prop

**Model selection — Opus stays.** Sonnet 4.6 would save ~8-12s but the WOW moment is the goal. Latency from Opus is noise vs the 63s structural win from t=9 fan-out.

**Latency budget:** 28s. Heartbeat already wired per `ee70f4e`.

**Stability requirement:** recommendation MUST be deterministic given identical input. M2 fix (projectId in inputs_hash) prevents cross-tenant leak.

### `[T4]` Viewer badge + banner state + page.tsx data-fetch migration ~6 hr · 🔒 **BLOCKED ON UI FREEZE**

> **Closes:** the funnel UX (in-place state discriminator) · **Critique fixes:** C1 (use `getArtifactByKind`, not `getLatestSynthesis`), C2 (page.tsx files migrate, not just viewers), I3 (Task 4 scope was understated)
> **Effort:** ~6 hr (was 4 hr — page.tsx migration adds work) · **Risk:** medium (frozen surface)

**Files (8 frozen — REQUIRES EXPLICIT UNFREEZE FROM DAVID — per CLAUDE.md UI Freeze table covers BOTH viewers AND page.tsx):**

*Viewer components (4):*
- `file:///Users/davidancor/Projects/c1v/apps/product-helper/components/system-design/decision-matrix-viewer.tsx` 🔒
- `file:///Users/davidancor/Projects/c1v/apps/product-helper/components/system-design/ffbd-viewer.tsx` 🔒
- `file:///Users/davidancor/Projects/c1v/apps/product-helper/components/system-design/qfd-viewer.tsx` 🔒
- `file:///Users/davidancor/Projects/c1v/apps/product-helper/components/system-design/interfaces-viewer.tsx` 🔒

*Page.tsx data-fetch (4) — ADDED PER CRITIQUE C2 + I3:*
- `file:///Users/davidancor/Projects/c1v/apps/product-helper/app/(dashboard)/projects/[id]/system-design/decision-matrix/page.tsx` 🔒 (currently reads `extractedData.decisionMatrix` at line 53, 81)
- `file:///Users/davidancor/Projects/c1v/apps/product-helper/app/(dashboard)/projects/[id]/system-design/ffbd/page.tsx` 🔒 (line 19)
- `file:///Users/davidancor/Projects/c1v/apps/product-helper/app/(dashboard)/projects/[id]/system-design/qfd/page.tsx` 🔒 (line 53, 82)
- `file:///Users/davidancor/Projects/c1v/apps/product-helper/app/(dashboard)/projects/[id]/system-design/interfaces/page.tsx` 🔒

*Doc fix (CLAUDE.md drift):*
- `file:///Users/davidancor/Projects/c1v/apps/product-helper/CLAUDE.md` — "System-Design Data Path" section claims viewers read via `getLatestSynthesis` — this is aspirational, not actual. Update to match real code state OR mark as "post-T4 target".

**Migration steps:**
1. **Get UI Freeze unfreeze** from David covering all 8 files (4 viewers + 4 page.tsx). The CLAUDE.md freeze table explicitly lists `app/(dashboard)/projects/[id]/system-design/**/page.tsx` as 🔒. `[critique: I3 closed]`
2. **Per page.tsx file**, replace `(project as any).projectData?.intakeState?.extractedData?.<X>` data-fetch with the kind-based fallback pattern:
   ```ts
   // [critique: C1 — use getArtifactByKind, NOT getLatestSynthesis]
   import { getArtifactByKind } from '@/lib/db/queries';

   async function loadM4Artifact(projectId: number) {
     const refined = await getArtifactByKind(projectId, 'decision_network_v1');
     if (refined?.content) {
       return { kind: 'refined' as const, data: refined.content };
     }
     const project = await db.query.projectData.findFirst({
       where: eq(projectData.projectId, projectId),
     });
     const draft = (project?.intakeState as any)?.extractedData?.draftArchitecture?.m4;
     if (draft) return { kind: 'draft' as const, data: draft };
     return null;
   }
   ```
   Per-route artifact kind:
   - `decision-matrix/page.tsx` → `getArtifactByKind(projectId, 'decision_network_v1')` (M4)
   - `ffbd/page.tsx` → `getArtifactByKind(projectId, 'ffbd_v1')` (M3)
   - `qfd/page.tsx` → `getArtifactByKind(projectId, 'hoq_v1')` (M6)
   - `interfaces/page.tsx` → `getArtifactByKind(projectId, 'n2_matrix_v1')` (M7) — or whichever M7 kind is canonical; verify
3. **Pass** `{ kind, data }` as props to the viewer component (was just `data` before). `[critique: C1 closed]`
4. **Per viewer**, read `kind` from artifact prop and switch badge:
   - `kind === 'draft'` → "AI Generated · Draft · provisional priors" + amber/muted styling
   - `kind === 'refined'` → "AI Generated · Refined · Atlas-grounded" + green styling
5. **Add CTA banner** on draft state: "Refine into an atlas-grounded blueprint — uses 1000 credits" → links to existing `POST /api/projects/[id]/synthesize` (or button on `components/project/overview/artifact-pipeline.tsx` 🟡 semi-frozen — manifest-read extension OK).
6. **Render provisional binding rows** dotted/muted on draft (style only — same data structure).
7. **Verify** the FMEA viewer (already has fallback shape per quick-check) is consistent with the 4 newly-migrated viewers.
8. **Update CLAUDE.md "System-Design Data Path" section** to reflect the actual state post-T4: "Routes read via `getArtifactByKind(projectId, '<kind>')` with fallback to `extractedData.draftArchitecture.<X>` for the draft tier." Also note Wave-A migration was actually completed in T4, not Wave A.

**Tech chips:** 🟡 React Server Components · 🟢 `getArtifactByKind` (existing query, already RLS-gated) · 🗄️ `project_artifacts` (refined) + `project_data.intakeState.extractedData.draftArchitecture` (draft) · 🎨 Tailwind amber/green badge variants · 🔒 UI Freeze unfreeze required

**Verification:** `pnpm tsc --noEmit` clean · `npx jest components/system-design/__tests__/` pass · `playwright` E2E: draft project shows amber badge + CTA banner; refined project shows green badge · CLAUDE.md doc-vs-code drift resolved

→ closes the funnel UX; same URL serves both tiers; in-place upgrade on refine

### `[T5]` kbAnalysisLLM migration ~2-3 hr · **ORTHOGONAL but ship in same window**

> **Closes:** P0-5 (chat reply quality — "I've inferred 12 potential elements" boilerplate kills the funnel premise)
> No critique flags · **Risk:** low (prompt change + enum extension)

**Files:**
- `file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/agents/intake/kb-question-generator.ts` — strip `INFERENCE_RULES.signals` hardcoded suggestions, drop `minElements` floors, replace "INFER aggressively" with "ask, don't infer". Keep `kbAnalysisSchema` + structured-output shape.
- `file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/chat/system-question-bridge.types.ts` — extend `OpenQuestionSource` enum with `m1_intake_gap`; update `SOURCE_TO_BUCKET` (→ `requirements` bucket)
- `file:///Users/davidancor/Projects/c1v/apps/product-helper/components/projects/sections/open-questions-viewer.tsx` — extend `SOURCE_LABEL` exhaustive map (CLAUDE.md `m2_constants` cascade gotcha — tsc fails without the new key)
- `file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/__tests__/no-mandate-cascade.test.ts` (NEW) — source-scanner regression test per V2 plan §9 #6 (was deferred)

**Migration steps:**
1. **Strip** `INFERENCE_RULES.signals` block from `kb-question-generator.ts` — remove the hardcoded "USDA FoodData / Spoonacular / Stripe / Auth0" suggestion list. The model should ASK, not invent.
2. **Drop** `minElements` floors from the prompt — no "must have at least N external systems" instructions.
3. **Replace** "INFER aggressively" prompt language with "ASK, don't infer. If signal is thin, generate a question, not a guess."
4. **Add** `m1_intake_gap` to `OpenQuestionSource` enum in `system-question-bridge.types.ts`.
5. **Update** `SOURCE_TO_BUCKET` map → `m1_intake_gap` lands in `requirements` bucket.
6. **Update** `SOURCE_LABEL` exhaustive map in `open-questions-viewer.tsx` — add the new key (tsc will fail otherwise per CLAUDE.md cascade gotcha).
7. **Author** `no-mandate-cascade.test.ts`: read `prompts.ts` source as text, regex-assert no `/MUST.*infer|Do NOT return empty|REQUIRED.*minimum|CRITICAL: Do NOT return/i` outside the `extractionPromptLegacy` carve-out region.

**Tech chips:** 🤖 Claude Sonnet 4.6 · ✅ `kbAnalysisSchema` (no shape change) · 🟡 `OpenQuestionSource` enum extension · 🟢 Source-scanner regression test (CI gate)

**Verification:** `pnpm tsc --noEmit` clean (cascade map updated) · `npx jest .../no-mandate-cascade.test.ts` pass · live preview chat shows questions instead of "I've inferred 12 elements" boilerplate

**Why it ships in the same window:** if kbAnalysisLLM still emits "I've inferred 12 potential external elements" while the funnel shows a draft architecture, the "draft is honest preview" premise breaks. Funnel + T5 ship together or not at all.

→ closes P0-5; chat reply quality matches the funnel positioning

---

## 5. Validation step BEFORE Tasks 1-4 ship

**Replay the L4 trace fabrication through draft M4** to see if the output looks "credible draft a designer would refine" or "garbage that scares the user away."

### 5.1 Replay procedure

1. Open `apps/product-helper/__tests__/v2.2.2-post/dataset_33ec71d2-b6cb-4d5e-8779-47a70c4c617f.jsonl`.
2. Extract record 4 (the L4 trace) — `outputs.extractedData.{ffbd,qfd,decisionMatrix,interfaces}`. These are the actual fabricated draft seeds the system produced.
3. Construct the thin-input contract from L4: `{vision: "AI Meal Planner", actors: [{name: "Home Cook / Weight-Loss User"}], projectType: null}`.
4. Stub the M4-draft agent. Two options:
   - **Quick:** call the existing `decision-net-agent.ts` directly with thin input + mocked atlas-loader returning `{provisional: true, entryCount: 0}`. Inspect raw output.
   - **Thorough:** prototype `decision-net-draft-agent.ts` (Phase-14 + Phase-16 subset prompt) and run live against OpenRouter. Cost: ~$0.20-0.40 in Opus tokens.
5. Capture the M4 output JSON.
6. Render against pass/fail criteria below.

### 5.2 PASS criteria — ship the funnel

✅ Draft M4 shows **3 recognizable architectural alternatives** (e.g. "Monolith SaaS", "Modular Services", "Event-Driven Microservices"). Names should be archetype-recognizable, not invented project-specific subsystems.

✅ Each alternative has **≥3 scored performance criteria** with rationale a designer can react to (e.g. "Monolith SaaS: cost=Low, latency=Med, availability=High — rationale: single-region single-tier, no inter-service network hops").

✅ **One alternative is recommended** with a reason that isn't obviously random (matches the project's apparent scale/complexity).

✅ The "provisional" banner reads as **"early estimate"** not "garbage" — i.e., the user understands the draft is a starting point, not a confident answer.

✅ **Stability:** running the agent twice with identical thin input produces identical recommendation. If the recommendation flips between runs, ship is blocked until input → output is deterministic (per stability requirement in Task 3).

### 5.3 FAIL criteria — methodology violation too visible, do not ship as-designed

❌ Alternatives are **incoherent** (e.g. fabricated "SS1-SS6" subsystems that don't map to real architectural choices, or `interfaces.n2Chart.SS1.SS2: "IF-08: dietary preferences..."` style invented IDs surfacing in the user-facing output).

❌ Performance criteria are **fake-sounding** (REQ-030-style invented IDs with no user-recognizable meaning, or "30s timeout, user-facing error at 15s" with no grounding).

❌ The recommendation **flips on rerun** with identical input (unstable because draft seeds are noise, not signal).

❌ The output looks like the L4 trace — full mermaid + invented requirements + invented constants — but with a "Draft" sticker on top.

### 5.4 If FAIL — alternative path

Scope the addendum's P0 #4 precondition-gate fix instead. Draft path uses `system-question-bridge` to surface gap questions ("Tell me about your scale: <10K users / 10K-1M / 1M+?") and only fires draft M4 when minimum signal is present (e.g., ≥1 actor + ≥1 use case + scale band identified). Slower draft (5-10 chat turns instead of t=9 fan-out) but methodology-correct.

### 5.5 Confidence going in

From the L4 fabrication patterns observed in the trace, the intake-side agents produce **semantically coherent outputs** — wrong but coherent. The fabricated decision-matrix had "PC-01 AI Meal Plan Generation Latency" + "AI_REQUEST_TIMEOUT=30s" — those ARE recognizable architectural concerns even if the specific REQ-030 anchor is invented. Bet leans **PASS**, but the replay confirms it in 30 minutes and saves 3 days of wasted effort if it fails.

**Scope: 30-60 min for the quick-path replay. Live-agent thorough path: 2-3 hours including prototype.** Results gate the whole plan.

**Action: do the replay BEFORE Phase 2 of §11 sequencing. Then ship the PR.**

---

## 6. Gotchas (from prior sessions)

### 6.1 `extractedData` shape change is breaking — **DECISION LOCKED: Option A** [critique: M1 closed]

Renaming `extractedData.{ffbd,qfd,decisionMatrix,interfaces}` → `extractedData.draftArchitecture.{ffbd,qfd,decisionMatrix,interfaces}` will break:
- Any existing project rows in `project_data.intake_state.extractedData` jsonb that have these populated (rare today, but L4 trace shows it CAN happen)
- Test fixtures that mock `extractedData`

**LOCKED DECISION (per critique M1, 2026-05-04 02:49 EDT):** **Option A — Accept ephemeral.** Old `extractedData.{ffbd,qfd,...}` data is write-only with no readers post-T2/T4 rename. Clear via one-time SQL migration:

```sql
-- file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/db/migrations/00XX_clear_legacy_draft_keys.sql
UPDATE project_data
SET intake_state = (
  intake_state #- '{extractedData,ffbd}'
              #- '{extractedData,qfd}'
              #- '{extractedData,decisionMatrix}'
              #- '{extractedData,interfaces}'
)
WHERE intake_state -> 'extractedData' ?| array['ffbd','qfd','decisionMatrix','interfaces'];
```

Run via Supabase SQL Editor (drizzle-kit migrate is broken — duplicate 0004 per CLAUDE.md). Low risk because the FFBD/DM/QFD/Interfaces viewers will read from `draftArchitecture.*` after T4. Only affects the handful of L4-trace-style projects with fabricated data.

**Why not Option B (copy old keys into new namespace):** more code, preserves continuity for in-flight projects — but the legacy data is itself fabricated noise (per code-review-2026-05-03.md §A.1). Preserving fabricated content under a new namespace launders it as legitimate draft. Option A is the principled choice.

### 6.2 Viewer fallback pattern (CORRECTED) [critique: C1 + C2 closed]

**Critique correction (2026-05-04 02:49 EDT):** the prior wording "the 4 viewers were migrated in Wave A to read from `getLatestSynthesis`" is **factually false** — the page.tsx files still read `extractedData` directly with `(project as any)` casts (verified earlier). Wave-A migration was never actually done. T4 does it.

**Locked decision (per David's feedback 2026-05-04):** draft data lives in `extractedData.draftArchitecture.*` (jsonb blob), refined data lives in `project_artifacts` (table). `project_artifacts` is reserved for refined synthesis output only — no pollution from draft tier.

**CORRECTED fallback pattern (use `getArtifactByKind`, NOT `getLatestSynthesis`):**

`getLatestSynthesis` at `file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/db/queries.ts:253-268` hardcodes `artifactKind === 'recommendation_json'` — it returns ONLY the synthesis keystone, NOT M3/M4/M6/M7 artifacts. The right helper is `getArtifactByKind(projectId, '<kind>')` defined right next to it at queries.ts:275.

```ts
// CORRECTED — page.tsx for /system-design/decision-matrix (M4)
import { getArtifactByKind } from '@/lib/db/queries';
import { db, projectData } from '@/lib/db';
import { eq } from 'drizzle-orm';

async function loadM4Artifact(projectId: number) {
  // [critique: C1] use getArtifactByKind with the M4 kind, NOT getLatestSynthesis
  const refined = await getArtifactByKind(projectId, 'decision_network_v1');
  if (refined?.content) {
    // [critique: C1] read .content (raw jsonb), NOT .decisionNetwork (nonexistent)
    return { kind: 'refined' as const, data: refined.content };
  }

  // Fall back to draft (T2 + T1.5 namespace)
  const project = await db.query.projectData.findFirst({
    where: eq(projectData.projectId, projectId),
  });
  const draft = (project?.intakeState as any)?.extractedData?.draftArchitecture?.m4;
  if (draft) {
    return { kind: 'draft' as const, data: draft };
  }

  return null; // not generated yet
}
```

Per-route artifact kind:
| Route | `getArtifactByKind` arg | Draft fallback path |
|---|---|---|
| `/system-design/decision-matrix` | `'decision_network_v1'` | `extractedData.draftArchitecture.m4` |
| `/system-design/ffbd` | `'ffbd_v1'` | `extractedData.draftArchitecture.ffbd` |
| `/system-design/qfd` | `'hoq_v1'` | `extractedData.draftArchitecture.qfd` |
| `/system-design/interfaces` | `'n2_matrix_v1'` (verify canonical M7 kind) | `extractedData.draftArchitecture.interfaces` |

The viewer component receives `{ kind, data }` and renders the appropriate badge state per T4.

**Why this beats writing draft to `project_artifacts`:**
- Refined query path stays clean (`getArtifactByKind` returns refined rows; draft never pollutes `project_artifacts`).
- Draft data is ephemeral and lives next to its source-of-truth (`extractedData` already holds intake state).
- No new RLS policies needed; `project_data` already has them.
- When refined supersedes draft, the fallback automatically picks the new row — no migration of stale draft rows.

**Action item from this correction:** the CLAUDE.md "System-Design Data Path" section (`file:///Users/davidancor/Projects/c1v/apps/product-helper/CLAUDE.md`) describes the post-Wave-A behavior as already shipped. It isn't. T4 step 8 updates the doc to match reality.

### 6.3 UI Freeze (CLAUDE.md)

The 4 `/system-design/*` viewers are 🔒 frozen per CLAUDE.md. Task 4 cannot ship without unfreeze approval. Get David to flip them to 🟡 Semi or unfreeze before scoping the follow-up PR.

### 6.4 Multi-peer git working tree

Per CLAUDE.md: never `git add -A`. Always `git add <explicit-path>`. The branch already has 13 fix commits; adding more is fine, just stage explicit files.

### 6.5 `OpenQuestionSource` enum extension is exhaustive-map-cascading

Per CLAUDE.md (the `m2_constants` incident): adding a value to `OpenQuestionSource` requires updating `SOURCE_TO_BUCKET` AND `SOURCE_LABEL` in `open-questions-viewer.tsx`. Grep `Record<OpenQuestionSource, ...>` to find all exhaustive maps and update each.

### 6.6 Turborepo silent env-filter (CLAUDE.md)

If any new env vars are needed (cache flags, draft-mode toggle, etc.), declare them in `turbo.json` task `env[]` arrays AND set them in Vercel. Both. Otherwise Vercel build silently strips them.

### 6.7 Test recipe (env vars enforced)

```bash
cd apps/product-helper && \
  POSTGRES_URL=stub AUTH_SECRET=stubstubstubstubstubstubstubstubstub \
  STRIPE_SECRET_KEY=sk_test_stub STRIPE_WEBHOOK_SECRET=whsec_stub \
  OPENROUTER_API_KEY=sk-or-stub BASE_URL=http://localhost:3000 \
  npx jest <path>
```

Old all-`stub` recipe fails at import time per env validator strictness (CLAUDE.md).

---

## 7. Open questions for David (revisit if blocked)

1. **UI Freeze unfreeze for Task 4?** Need approval before viewer edits.
2. **Migration strategy for existing `extractedData.{ffbd,qfd,...}` data?** Most projects don't have this populated (only L4-style traces do). Drop, or move to namespace?
3. **Which Pipeline B node should be the "refined M4" gate?** SYN already gates at /synthesize endpoint; M4 itself doesn't have a separate gate. Confirm the funnel CTA goes to /synthesize endpoint, not a per-artifact refine button.
4. **Draft M4 latency target?** 28s (Opus) is fine but front-loads the wow. If it's too long for free tier, consider draft M4 on Sonnet 4.6 (faster, cheaper) and reserve Opus for refined.
5. **Draft expiration?** Should draft `project_artifacts` rows expire after N days if not refined? Or persist indefinitely? Storage cost vs analytics.

---

## 8. What stays the same (do NOT touch)

| Component | Reason |
|---|---|
| Pipeline B serial chain (M3 → M1 → M5 → M4 → M7 → M8 → M6 → SYN) | Ships refined output; methodology-correct; atlas-grounded. Working as designed. |
| `system-question-bridge.ts` + `.types.ts` | Engine seam between Pipeline A & B. Wave-A-shipped. Locked contract. Only extend the source enum (Task 5). |
| `getLatestSynthesis(projectId)` query | Already feeds the 4 frozen viewers. Will return both draft and refined rows post-funnel; component-side `kind` switch handles rendering. |
| `POST /api/projects/[id]/synthesize` | Existing 1000-credit gate. Just reframe the marketing copy. |
| Tracing (LangSmith) | Captures everything. Use traces to validate post-deploy. |
| Eval datasets (300 v2 + 60 intake) | Augment with draft-mode datasets if needed (defer to Task 5 follow-up). |
| KB-9 Atlas + pgvector + OpenAI embeddings | Working in Pipeline B. Draft path uses provisional bindings; same atlas, just acknowledged-thin. |

---

## 9. Definition of done

The funnel is shipped when:

1. New user signs up → types vision → sees draft architecture in <60s, badge says "AI Generated · Draft · provisional priors" with explanation.
2. User keeps chatting → bridge surfaces gap questions → answers tighten the draft (re-render in place).
3. User clicks "Refine to atlas-grounded blueprint" CTA → 1000-credit deduction → Pipeline B runs → ~100-175s later same URLs show "AI Generated · Refined · Atlas-grounded" + derivation chain + signed bundle download.
4. LangSmith traces show NO `[EXTRACT_GUARD]` warnings on either tier (V2 fix invariants hold).
5. kbAnalysisLLM no longer emits "I've inferred N potential external elements" boilerplate.
6. `no-mandate-cascade.test.ts` regression test passes in CI.
7. Marketing landing → Quick Start → existing UI flow unchanged for visitors; the upgrade is in routing semantics, not visible URL changes.

---

## 10. Branch state at handoff time

- **Branch:** `fix/intake-extraction-nfr-outofscope` (origin synced as of 2026-05-03 push)
- **HEAD:** `41acf9f` (V2 fix complete, preview-validated)
- **Preview status:** `INTAKE_PROMPT_V2=true` set on Vercel preview env. Trace at `__tests__/v2.2.2-post/dataset_33ec71d2-...jsonl` is the canonical post-fix sample.
- **Production status:** `INTAKE_PROMPT_V2=false` (default off). Production traffic still on legacy prompts. Step 7 (production flag flip) deferred until funnel work is in.
- **Funnel work:** new commits on this branch OR new branch `feat/draft-pipeline-funnel` (David's call).

**Recommendation:** new branch `feat/draft-pipeline-funnel` off `41acf9f`. Keeps the V2 fix branch clean and the funnel work mergeable separately. After funnel work passes preview, merge V2 fix + funnel together with the production flag flip.

---

## 11. Recommended sequencing for the next session

**Phase 0 — Standalone P0 fixes (~45 min total, ship same branch as V2):**
1. Task 0 — phase-gate `emitNfrContractEnvelope` (closes P0-2)
2. Task 0.5 — drop step 5d commit (closes P0-3)
3. Push to preview, verify no first-turn NFR open-question fires.

**Phase 1 — Validation (~30-60 min):**
4. Run §5 L4 trace replay through draft M4. If output looks like "credible draft," proceed to Phase 2. If not, scope the addendum's precondition-gate fix instead (precondition gates surface bridge open-questions when upstream is empty).

**Phase 2 — Funnel build (new branch `feat/draft-pipeline-funnel` off 41acf9f, ~2-3 days):**
5. **T1** — schema `kind` discriminator (foundation; uses `module-4/index.ts` per critique C4 fix). ~3 hr.
6. **T1.5 (NEW pre-task)** — extend `extractionSchema` + `IntakeStateAnnotation` with `draftArchitecture` field per critique C3. ~1 hr. **MANDATORY before T2.**
7. **T2** — repurpose intake-side agents as draft producers + namespace migration. Closes P0-1 + P0-4. ~4 hr.
8. **T3** — `generate-m4-draft.ts` node + `routeAfterExtractionWithDraft` in `edges.ts` (per critique I1) + `projectId` in `inputs_hash` (per critique M2). Delivers <60s draft architecture. ~6 hr.
9. **T5** — kbAnalysisLLM migration. Closes P0-5. ~2-3 hr.
10. **Get UI Freeze approval from David** — covers BOTH viewer components AND page.tsx files (per CLAUDE.md freeze table + critique I3).
11. **T4** — viewer badge state + page.tsx data-fetch migration (uses `getArtifactByKind` per critique C1, covers all 8 frozen files per critique C2). ~6 hr.
12. Run §6.1 Option A SQL migration to clear legacy `extractedData.{ffbd,qfd,decisionMatrix,interfaces}` keys (per critique M1).

**Phase 3 — Verify + ship:**
11. Push to preview, run new smoke trace from "AI Meal Planner" 1-sentence vision.
12. Verify: <60s to draft visible, badge says "AI Generated · Draft · provisional priors", no `[EXTRACT_GUARD]` warnings, no "I've inferred N elements" boilerplate, refine CTA visible.
13. Authorize production flag flip (`INTAKE_PROMPT_V2=true` in prod Vercel env).
14. 24h soak in production. Then Phase 4.

**Phase 4 — Cleanup (post-soak, ~half day):**
15. P1 cleanup: source-scanner regression test, legacy eval baseline, phase-skip diagnostic, observability metric.
16. P2 cleanup: drop `extractionPromptLegacy`, collapse V2-suffix instances, fix legacy `escapeBraces` bug, drop `INTAKE_PROMPT_V2` from `feature-flags.ts` + `turbo.json`.

**Estimated total: ~45 min Phase 0 + ~1 hr Phase 1 + 2-3 days Phase 2 + 1 day Phase 3 + half day Phase 4 = ~5 days end-to-end.**

---

**End of handoff.**
