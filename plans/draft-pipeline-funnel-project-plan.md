---
name: Draft Pipeline Funnel — Visual Project Plan
date: 2026-05-04
source: plans/HANDOFF-2026-05-04-draft-pipeline-funnel.md
branch_base: 41acf9f (fix/intake-extraction-nfr-outofscope)
new_branch: feat/draft-pipeline-funnel
status: PLAN ONLY — awaiting kickoff
total_effort: ~5 days end-to-end
---

# Draft Pipeline Funnel — Visual Project Plan

> Distilled from [HANDOFF-2026-05-04-draft-pipeline-funnel.md](file:///Users/davidancor/Projects/c1v/plans/HANDOFF-2026-05-04-draft-pipeline-funnel.md). Read that for full rationale; this doc is the actionable task list.

---

## TL;DR

Repurpose the V2-fixed intake-side agents (FFBD/QFD/DM/Interfaces) as the **free-tier draft pipeline**. Same URLs, same components, in-place state discriminator (`kind: 'draft' | 'refined'`). Free tier shows architecture in **<60s**. Paid tier is the existing `/synthesize` endpoint (1000 credits) — atlas-grounded, derivation chain, signed export.

**No new paywall surface.** **No URL forks.** **No code deletion** — repurpose what already ships.

---

## Pipeline picture

```mermaid
flowchart TD
    Start([User signs up]) --> M0["M0 signup signals (Haiku, 3s)"]
    M0 --> Vision[/User types vision/]
    Vision --> M21["M2.1 context-diagram (Sonnet, 6s)"]
    M21 --> Fanout{Parallel fan-out @ t=9s}

    Fanout --> M22["M2.2 use-cases + scope (~12s)"]
    Fanout --> M23["M2.3 NFR + goals"]
    Fanout --> FFBDd["FFBD-draft"]
    Fanout --> QFDd["QFD-draft"]
    Fanout --> DMd["DM-draft"]
    Fanout --> IFd["Interfaces-draft"]
    Fanout --> M4d["M4-draft (Opus, 28s)<br/>3 archetypes + provisional priors"]

    M22 & M23 & FFBDd & QFDd & DMd & IFd & M4d --> DraftView["/system-design/* + /requirements/architecture<br/>BADGE: AI Generated · Draft · provisional priors<br/>(t≈37s — &lt;60s sign-up to WOW)"]

    DraftView --> CTA["CTA: Refine to atlas-grounded blueprint<br/>(1000 credits)"]
    CTA -->|POST /api/projects/[id]/synthesize| PipelineB

    subgraph PipelineB["PAID TIER — Pipeline B serial chain (~100-175s)"]
        direction LR
        M3 --> M1 --> M5 --> M4 --> M7 --> M8a --> M8b --> M6 --> SYN["SYN keystone<br/>architecture_recommendation.v1.json"]
    end

    PipelineB --> RefinedView["SAME URLs, badge upgrades in-place<br/>BADGE: AI Generated · Refined · Atlas-grounded<br/>+ derivation chain + signed bundle"]
```

---

## Time math

| Path | Total | Win |
|---|---|---|
| **Today** (serial Pipeline B) | ~100s | baseline |
| **Funnel** (parallel fan-out at t=9s) | **~37s** | 2.7× speedup, <1 min from sign-up to WOW |

---

## Task list — checkbox view

```
Phase 0 — Standalone P0 fixes (~45 min, same branch)
  [ ] T0    Phase-gate emitNfrContractEnvelope            ~30 min
  [ ] T0.5  Decide on runLlmOnly (drop recommended)       ~10 min
  [ ] Push to preview, verify no first-turn NFR question

Phase 1 — Validation gate (~30-60 min)
  [ ] §5 L4 trace replay through draft M4
       PASS → proceed to Phase 2
       FAIL → scope precondition-gate alternative

Phase 2 — Funnel build (new branch feat/draft-pipeline-funnel, ~2-3 days)
  [ ] T1    Add `kind` discriminator to artifact schemas  ~3 hr
  [ ] T1.5  Extend extractionSchema with draftArchitecture ~1 hr  [PRE-T2 GATE]
  [ ] T2    Repurpose intake agents as draft producers    ~4 hr
  [ ] T3    New graph node generate-m4-draft.ts            ~6 hr  [funnel value prop]
  [ ] T5    kbAnalysisLLM migration                        ~2-3 hr
  [ ] Get UI Freeze unfreeze from David (8 files)
  [ ] T4    Viewer badge + page.tsx data-fetch migration  ~6 hr  [BLOCKED until unfreeze]
  [ ] Run §6.1 Option A SQL migration (clear legacy keys)

Phase 3 — Verify + ship
  [ ] Push to preview, smoke trace from "AI Meal Planner"
  [ ] Verify <60s draft, no [EXTRACT_GUARD] warnings, refine CTA visible
  [ ] Production flag flip: INTAKE_PROMPT_V2=true
  [ ] 24h soak

Phase 4 — Cleanup (~half day)
  [ ] P1 cleanup: source-scanner test, eval baseline, phase-skip diag, obs metric
  [ ] P2 cleanup: drop legacy prompt, collapse V2-suffix, fix escapeBraces, drop flag
```

---

## Phase 0 — Standalone P0 fixes

### `[T0]` Phase-gate `emitNfrContractEnvelope`

**Closes:** P0-2 (NFR open-question fires too early on first context-diagram turn)
**Effort:** ~30 min · **Token cost:** 0 · **Risk:** very low

**Files:**
- [`extract-data.ts`](file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/graphs/nodes/extract-data.ts) — add phase-gate at top of `emitNfrContractEnvelope` body (line ~192)
- [`extract-data-guards.test.ts`](file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/graphs/nodes/__tests__/extract-data-guards.test.ts) — add 2 tests covering both callsites

**Steps:**
1. Locate two callsites: `extract-data.ts:98` (short-circuit) + `extract-data.ts:156` (normal extraction).
2. Insert phase-gate at TOP of `emitNfrContractEnvelope` body — single guard covers both.
3. Skip if `state.currentKBStep` ∉ {`functional-requirements`, `sysml-activity-diagram`, `ffbd`, `decision-matrix`, `qfd-house-of-quality`, `interfaces`}.
4. Test A: `currentKBStep='context-diagram'` + `hasCompleteData=false` → no surfaceOpenQuestion / persistArtifact.
5. Test B: `currentKBStep='context-diagram'` + `hasCompleteData=true` → same assertions.

```ts
async function emitNfrContractEnvelope(state, mergedData) {
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

**Verify:** `pnpm tsc --noEmit` clean · `npx jest .../extract-data-guards.test.ts` 7 pass · preview replay shows no first-turn NFR question.

---

### `[T0.5]` Decide on `runLlmOnly` — drop recommended

**Closes:** P0-3 (`createGenerateNfrNode` factory has zero callers; step 5d shipped dead code)
**Effort:** ~10 min · **Risk:** zero (revert)

**Files (drop path):**
- [`generate-nfr.ts`](file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/graphs/nodes/generate-nfr.ts) — revert commit `7b7a453`
- [`prompts.ts`](file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/prompts.ts) — drop `NFR_RULES` export

**Steps:**
1. Verify zero callers: `grep -rn "createGenerateNfrNode\|GenerateNfrLlmAgent" apps/product-helper/ --include="*.ts" | grep -v ".test.ts"` → expect 0 outside `generate-nfr.ts`.
2. `git revert --no-edit 7b7a453` (do NOT amend prior commits).
3. Drop `NFR_RULES` export from `prompts.ts`.
4. Update plan §3.1 to "5 active LLM call paths + 1 dormant factory (deferred)".

**Verify:** `pnpm tsc --noEmit` clean · prompts.test.ts pass · `git log --oneline` shows revert.

---

## Phase 1 — Validation gate (BEFORE Phase 2)

### Replay L4 trace through draft M4

**Goal:** prove draft M4 looks like "credible draft a designer would refine," not "garbage that scares the user away." Gates the entire funnel.

**Source trace:** [`dataset_33ec71d2-b6cb-4d5e-8779-47a70c4c617f.jsonl`](file:///Users/davidancor/Projects/c1v/apps/product-helper/__tests__/v2.2.2-post/dataset_33ec71d2-b6cb-4d5e-8779-47a70c4c617f.jsonl)

**Quick path (~30 min):** call existing [`decision-net-agent.ts`](file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/agents/system-design/decision-net-agent.ts) with thin input + mocked atlas-loader returning `{provisional: true, entryCount: 0}`. Inspect raw output.

**Thorough path (2-3 hr, ~$0.20-0.40):** prototype `decision-net-draft-agent.ts` with Phase-14 + Phase-16 subset prompt. Run live against OpenRouter.

**PASS** ✅ — ship the funnel:
- 3 recognizable archetypes (Monolith / Modular / Event-driven)
- ≥3 scored criteria each with designer-actionable rationale
- 1 recommended with non-random reason
- Provisional banner reads "early estimate" not "garbage"
- Stable: identical input → identical recommendation

**FAIL** ❌ — scope precondition-gate alternative:
- Incoherent fabricated subsystem IDs (SS1-SS6, REQ-030)
- Recommendation flips on rerun
- Output looks like L4 trace with a "Draft" sticker on top

→ Alternative: draft M4 fires only when bridge has surfaced ≥1 actor + ≥1 use case + scale band identified. Slower (5-10 chat turns) but methodology-correct.

---

## Phase 2 — Funnel build

### `[T1]` Add `kind` discriminator to artifact schemas

**Closes:** P0-4 partial (foundation)
**Effort:** ~3 hr · **Risk:** low (default `'refined'` preserves legacy rows)

**Files:**
- [`module-3/ffbd-v1.ts`](file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/schemas/module-3/ffbd-v1.ts) — add `kind` to root
- [`module-4/index.ts`](file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/schemas/module-4/index.ts) — NEW root wrapper `decisionNetworkRootSchema`
- [`module-6-hoq/index.ts`](file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/schemas/module-6-hoq/index.ts) — add `kind`
- [`module-7-interfaces/index.ts`](file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/schemas/module-7-interfaces/index.ts) — add `kind`
- [`synthesis/architecture-recommendation.ts`](file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/schemas/synthesis/architecture-recommendation.ts) — `kind: z.literal('refined')`
- [`registry-no-dupes.test.ts`](file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/schemas/__tests__/registry-no-dupes.test.ts) — assert `kind` present on all 5

**Steps:**
1. Verify `module-4/` has 23 files, no `decision-network-v1.ts`.
2. `module-4/index.ts`: export `decisionNetworkRootSchema = z.object({ kind: z.enum(['draft','refined']).default('refined'), phases: z.object({...}) })` wrapping existing phases.
3. Patch other 3 module roots — same `kind` field.
4. `synthesis`: `kind: z.literal('refined').default('refined')` (hardcoded).
5. Regenerate JSON: `pnpm tsx lib/langchain/schemas/generate-all.ts`.
6. Test schema-parse round-trip on existing `project_artifacts` row → parses with `kind: 'refined'` injected.

**Verify:** `pnpm tsc --noEmit` clean · jest schemas pass · legacy row deserialize → `kind === 'refined'`.

---

### `[T1.5]` Extend `extractionSchema` with `draftArchitecture` — **PRE-T2 GATE**

**Closes:** Critique C3 (T2 cannot land without this)
**Effort:** ~1 hr · **Risk:** medium (touches IntakeState reducer)

**Files:**
- [`schemas.ts:792-811`](file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/schemas.ts) — extend `extractionSchema`
- [`intake-graph.ts:307-422`](file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/graphs/intake-graph.ts) — verify reducer
- [`channels.ts:160`](file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/graphs/channels.ts) — `createDefaultExtractionResult()`
- [`schemas.test.ts`](file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/__tests__/schemas.test.ts) — round-trip test

**Steps:**
1. Open `schemas.ts:792`, locate `extractionSchema`.
2. Add optional field:
   ```ts
   draftArchitecture: z.object({
     ffbd: ffbdSchema.optional(),
     qfd: qfdSchema.optional(),
     decisionMatrix: decisionMatrixSchema.optional(),
     interfaces: interfacesSchema.optional(),
     m4: z.unknown().optional(),  // typed in T3 (DraftM4Output)
   }).optional(),
   ```
3. Confirm `ExtractionResult` auto-updates via `z.infer`.
4. Run `pnpm tsc --noEmit` to surface callsites.
5. `channels.ts`: `.optional()` means no change needed — confirm via parse.
6. Tests: legacy row parses; new row with `draftArchitecture.ffbd` parses.
7. Audit `Record<.*ExtractionResult` — none exhaustive.

**Verify:** tsc clean across app · schemas.test.ts pass · prod legacy row → parse OK.

---

### `[T2]` Repurpose intake agents as draft producers

**Closes:** P0-1 (orphan callers) + P0-4 (fabrication labeled, not hidden)
**Effort:** ~4 hr · **Blocked by:** T1 + T1.5

**Files (4 agents + 4 tests):**
- [`ffbd-agent.ts`](file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/agents/ffbd-agent.ts)
- [`qfd-agent.ts`](file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/agents/qfd-agent.ts)
- [`decision-matrix-agent.ts`](file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/agents/decision-matrix-agent.ts)
- [`interfaces-agent.ts`](file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/agents/interfaces-agent.ts)
- [`__tests__/ffbd-agent.test.ts`](file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/agents/__tests__/ffbd-agent.test.ts)
- [`__tests__/qfd-agent.test.ts`](file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/agents/__tests__/qfd-agent.test.ts)
- [`__tests__/decision-matrix-agent.test.ts`](file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/agents/__tests__/decision-matrix-agent.test.ts)
- [`__tests__/interfaces-agent.test.ts`](file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/agents/__tests__/interfaces-agent.test.ts)

**Steps (apply identically to all 4):**
1. **Pre-flight grep** for legacy readers: `grep -rn "extractedData\.ffbd\|extractedData\.qfd\|extractedData\.decisionMatrix\|extractedData\.interfaces" apps/product-helper/ --include="*.ts" --include="*.tsx"`. Expect 4 page.tsx + maybe Quick Start orchestrator. Document in execution log.
2. Drop legacy V1 LLM (`maxTokens: 20000`). Keep V2 instance, rename `structuredFfbdLLMV2` → `structuredFfbdLLM`.
3. Drop `INTAKE_PROMPT_V2` ternary. V2 IS the draft path now. Single LLM per agent.
4. Hardcode `kind: 'draft'` post-Zod-parse, before return.
5. **Re-namespace writes:** `state.extractedData.ffbd = result` → `state.extractedData.draftArchitecture = { ...state.extractedData.draftArchitecture, ffbd: result }`.
6. Update `__tests__/<agent>.test.ts` — assertions move from `extractedData.ffbd` to `extractedData.draftArchitecture.ffbd`.
7. Drop local `escapeBraces` const + per-file `}` no-op bug (qfd:139, interfaces:124). Use shared correct version from `prompts.ts`.
8. Audit eval baselines [`ffbd-intake.jsonl`](file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/eval/datasets/ffbd-intake.jsonl) etc. — `expected_output` may need namespace update.

**Gotcha:** T2 namespace move BREAKS page.tsx readers until T4 ships. Bundle T2 + T4 in single PR OR keep temp viewer fallback.

**Verify:** tsc clean · 24/24 agent tests pass · trace shows writes to `draftArchitecture.*` with `kind: 'draft'`.

---

### `[T3]` Generate-m4-draft node — **THE FUNNEL VALUE PROP**

**Closes:** funnel value prop (free-tier draft architecture in <60s)
**Effort:** ~6 hr · **Token cost:** ~28s @ Opus 4.7 · **Risk:** medium

> **CRITICAL:** `generate-m4-draft.ts` is a **SUBSET** of M4 (Phase 14 + Phase 16 only), NOT a full 19-phase run. Calling full agent at t=9s with thin signal will hang or produce noise. `provisional: true` (Rosetta §9.3) is a **first-class execution path**, not a fallback.

**Thin-input contract (LOCKED):**
```ts
type DraftM4Input = {
  vision: string;
  actors: Actor[];
  projectType?: string | null;
  projectId: number;  // tenant isolation in cache key
};
type DraftM4Output = {
  kind: 'draft';
  provisional: true;
  alternatives: Array<{
    id: string; name: string; rationale: string;
    scores: Array<{ criterion: string; value: number|string; bound_to: 'kb-8-atlas'|'kb-shared'|'inferred' }>;
  }>;
  pareto_frontier: string[];
  recommended: string;
  priors: Array<{ archetype_tag: string; sample_size: number; provisional: true }>;
};
```

**Files (NEW):**
- [`generate-m4-draft.ts`](file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/graphs/nodes/generate-m4-draft.ts) — node
- [`decision-net-draft-agent.ts`](file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/agents/system-design/decision-net-draft-agent.ts) — thin-input agent
- [`__tests__/generate-m4-draft.test.ts`](file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/graphs/nodes/__tests__/generate-m4-draft.test.ts)
- [`__tests__/decision-net-draft-agent.test.ts`](file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/agents/system-design/__tests__/decision-net-draft-agent.test.ts)

**Files (MODIFY):**
- [`edges.ts:159`](file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/graphs/edges.ts) — add `routeAfterExtractionWithDraft(state)`
- [`intake-graph.ts:512`](file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/graphs/intake-graph.ts) — register node + wire conditional edge

**Steps:**
1. **Spike** LangGraph multi-target fan-out: `addConditionalEdges` with array-returning router (5 min smoke test).
2. Author thin-input contract (LOCKED — see above).
3. Implement `decision-net-draft-agent.ts`:
   - `createClaudeAgent(decisionNetDraftSchema, 'generate_m4_draft', { maxTokens: 6000 })` (Opus 4.7)
   - Prompt: ONLY phase-14 (decision nodes) + phase-16 (Pareto) — skip 1-13.
   - Atlas binding: `renderAtlasPriors(projectType ?? 'unknown', ['cost','latency','availability'])` — provisional initially.
4. Implement `generate-m4-draft.ts` node:
   - Read `state.{projectVision, extractedData.actors, projectType, projectId}`
   - `inputs_hash = SHA-256(JSON.stringify({ projectId, vision, actors: actors.map(a=>a.name), projectType }))`
   - Write to `state.extractedData.draftArchitecture.m4`
   - Hardcode `kind: 'draft'` + `provisional: true`
5. Add to `edges.ts`:
   ```ts
   export function routeAfterExtractionWithDraft(state: IntakeState): string[] {
     const targets: string[] = ['check_prd_spec'];
     if ((state.extractedData?.actors?.length ?? 0) >= 1
         && !state.extractedData?.draftArchitecture?.m4) {
       targets.push('generate_m4_draft');  // parallel fan-out at t=9s
     }
     return targets;
   }
   ```
6. Wire in `intake-graph.ts:512`:
   `addConditionalEdges('extract_data', routeAfterExtractionWithDraft, ['check_prd_spec', 'generate_m4_draft'])`
7. Tests: stable input → stable output; thin input → 3 alternatives with provisional priors; identical input twice → cache hit; cross-tenant test (2 projects same vision → different cache keys).
8. Heartbeat covers 28s window — already wired per `ee70f4e` (15s heartbeat).

**Model:** Opus 4.7 stays. Sonnet 4.6 saves ~8-12s but the WOW moment is the goal.
**Stability:** identical input MUST produce identical recommendation.

**Verify:** tsc clean · jest pass · live preview M4 visible at t≈37s · cache hit on identical input · cross-tenant isolation.

---

### `[T5]` kbAnalysisLLM migration — orthogonal but SAME WINDOW

**Closes:** P0-5 ("I've inferred 12 potential elements" boilerplate kills the funnel premise)
**Effort:** ~2-3 hr · **Risk:** low

**Files:**
- [`kb-question-generator.ts`](file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/agents/intake/kb-question-generator.ts) — strip `INFERENCE_RULES.signals`, drop `minElements`, replace "INFER aggressively" → "ASK, don't infer"
- [`system-question-bridge.types.ts`](file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/chat/system-question-bridge.types.ts) — extend `OpenQuestionSource` enum with `m1_intake_gap`
- [`open-questions-viewer.tsx`](file:///Users/davidancor/Projects/c1v/apps/product-helper/components/projects/sections/open-questions-viewer.tsx) — extend `SOURCE_LABEL` exhaustive map (cascade gotcha — tsc fails otherwise)
- [`no-mandate-cascade.test.ts`](file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/__tests__/no-mandate-cascade.test.ts) — NEW source-scanner regression

**Steps:**
1. Strip `INFERENCE_RULES.signals` from `kb-question-generator.ts` (kill the USDA/Spoonacular/Stripe/Auth0 hardcoded suggestions).
2. Drop `minElements` floors.
3. Replace "INFER aggressively" → "ASK, don't infer. If signal is thin, generate a question, not a guess."
4. Add `m1_intake_gap` to `OpenQuestionSource` enum.
5. Update `SOURCE_TO_BUCKET` → `m1_intake_gap` lands in `requirements` bucket.
6. Update `SOURCE_LABEL` exhaustive map (tsc enforces).
7. Author `no-mandate-cascade.test.ts`: read `prompts.ts` source as text, regex-assert no `/MUST.*infer|Do NOT return empty|REQUIRED.*minimum|CRITICAL: Do NOT return/i` outside `extractionPromptLegacy` carve-out.

**Why same window:** if kbAnalysisLLM still emits "I've inferred 12 elements" while funnel shows draft architecture, "draft is honest preview" premise breaks.

**Verify:** tsc clean (cascade map updated) · regression test pass · live preview shows questions, not boilerplate.

---

### `[T4]` Viewer badge + page.tsx data-fetch — 🔒 **BLOCKED ON UI FREEZE**

**Closes:** funnel UX (in-place state discriminator)
**Effort:** ~6 hr · **Risk:** medium (frozen surface — needs explicit unfreeze from David)

**Files (8 frozen — REQUIRES UNFREEZE):**

*Viewer components (4) 🔒:*
- [`decision-matrix-viewer.tsx`](file:///Users/davidancor/Projects/c1v/apps/product-helper/components/system-design/decision-matrix-viewer.tsx)
- [`ffbd-viewer.tsx`](file:///Users/davidancor/Projects/c1v/apps/product-helper/components/system-design/ffbd-viewer.tsx)
- [`qfd-viewer.tsx`](file:///Users/davidancor/Projects/c1v/apps/product-helper/components/system-design/qfd-viewer.tsx)
- [`interfaces-viewer.tsx`](file:///Users/davidancor/Projects/c1v/apps/product-helper/components/system-design/interfaces-viewer.tsx)

*Page.tsx data-fetch (4) 🔒:*
- [`/system-design/decision-matrix/page.tsx`](file:///Users/davidancor/Projects/c1v/apps/product-helper/app/(dashboard)/projects/[id]/system-design/decision-matrix/page.tsx) (reads `extractedData.decisionMatrix` lines 53, 81)
- [`/system-design/ffbd/page.tsx`](file:///Users/davidancor/Projects/c1v/apps/product-helper/app/(dashboard)/projects/[id]/system-design/ffbd/page.tsx) (line 19)
- [`/system-design/qfd/page.tsx`](file:///Users/davidancor/Projects/c1v/apps/product-helper/app/(dashboard)/projects/[id]/system-design/qfd/page.tsx) (lines 53, 82)
- [`/system-design/interfaces/page.tsx`](file:///Users/davidancor/Projects/c1v/apps/product-helper/app/(dashboard)/projects/[id]/system-design/interfaces/page.tsx)

*Doc fix:*
- [`apps/product-helper/CLAUDE.md`](file:///Users/davidancor/Projects/c1v/apps/product-helper/CLAUDE.md) — "System-Design Data Path" section claims viewers read via `getLatestSynthesis`. False. Update post-T4.

**Per-route artifact kind:**

| Route | `getArtifactByKind` arg | Draft fallback |
|---|---|---|
| `/system-design/decision-matrix` | `'decision_network_v1'` | `extractedData.draftArchitecture.m4` |
| `/system-design/ffbd` | `'ffbd_v1'` | `extractedData.draftArchitecture.ffbd` |
| `/system-design/qfd` | `'hoq_v1'` | `extractedData.draftArchitecture.qfd` |
| `/system-design/interfaces` | `'n2_matrix_v1'` (verify canonical) | `extractedData.draftArchitecture.interfaces` |

**Steps:**
1. **Get UI Freeze unfreeze** from David covering all 8 files.
2. Per page.tsx, replace `(project as any).projectData?.intakeState?.extractedData?.<X>` with kind-based fallback:
   ```ts
   import { getArtifactByKind } from '@/lib/db/queries';

   async function loadM4Artifact(projectId: number) {
     const refined = await getArtifactByKind(projectId, 'decision_network_v1');
     if (refined?.content) return { kind: 'refined' as const, data: refined.content };
     const project = await db.query.projectData.findFirst({ where: eq(projectData.projectId, projectId) });
     const draft = (project?.intakeState as any)?.extractedData?.draftArchitecture?.m4;
     if (draft) return { kind: 'draft' as const, data: draft };
     return null;
   }
   ```
3. Pass `{ kind, data }` as props to viewer (was just `data`).
4. Per viewer, switch badge:
   - `kind === 'draft'` → "AI Generated · Draft · provisional priors" + amber/muted styling
   - `kind === 'refined'` → "AI Generated · Refined · Atlas-grounded" + green styling
5. Add CTA banner on draft: "Refine into an atlas-grounded blueprint — uses 1000 credits" → links to `POST /api/projects/[id]/synthesize` (or button on [`artifact-pipeline.tsx`](file:///Users/davidancor/Projects/c1v/apps/product-helper/components/project/overview/artifact-pipeline.tsx) 🟡 semi-frozen).
6. Render provisional binding rows dotted/muted on draft (style only).
7. Verify FMEA viewer consistent.
8. Update CLAUDE.md "System-Design Data Path" to actual post-T4 state.

**Verify:** tsc clean · viewer tests pass · playwright E2E: draft = amber badge + CTA · refined = green badge · CLAUDE.md drift resolved.

---

## Phase 2 finisher — Legacy data sweep

Run §6.1 Option A SQL migration to clear stale `extractedData.{ffbd,qfd,decisionMatrix,interfaces}` keys (rare — only L4-trace-style projects have them):

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

Run via Supabase SQL Editor (drizzle-kit migrate broken — duplicate 0004).

---

## Definition of Done

The funnel ships when:

1. ✅ New user signs up → vision → draft architecture in **<60s** with badge "AI Generated · Draft · provisional priors"
2. ✅ User keeps chatting → bridge surfaces gap questions → draft tightens in place
3. ✅ User clicks "Refine to atlas-grounded blueprint" → 1000-credit deduct → Pipeline B → ~100-175s later same URLs upgrade to "AI Generated · Refined · Atlas-grounded" + derivation chain + signed bundle
4. ✅ LangSmith: zero `[EXTRACT_GUARD]` warnings on either tier
5. ✅ kbAnalysisLLM no longer emits "I've inferred N potential elements" boilerplate
6. ✅ `no-mandate-cascade.test.ts` passes in CI
7. ✅ Marketing landing → Quick Start → existing UI flow unchanged for visitors

---

## Open questions for David

1. **UI Freeze unfreeze for T4?** Need approval before viewer + page.tsx edits (8 files).
2. **Legacy `extractedData.{ffbd,qfd,...}` migration?** Option A locked (clear via SQL) but confirm.
3. **Refined gate location?** SYN at `/synthesize` already gates. Confirm CTA goes there, not per-artifact refine button.
4. **Draft M4 latency target?** 28s (Opus) front-loads the wow. Acceptable for free tier?
5. **Draft expiration?** N-day TTL on draft data, or persist indefinitely?

---

## Gotchas — fast reference

| Gotcha | Source | Mitigation |
|---|---|---|
| `extractedData` shape change breaks legacy rows | code-review-2026-05-03 §A.1 | Option A SQL migration (clear keys) |
| Viewer fallback uses `getArtifactByKind`, NOT `getLatestSynthesis` | critique C1 | per-route kind table above |
| UI Freeze on 4 viewers + 4 page.tsx | CLAUDE.md | unfreeze before T4 |
| Multi-peer git tree | CLAUDE.md | always `git add <explicit-path>` — never `-A` |
| `OpenQuestionSource` enum cascade | `m2_constants` incident | grep `Record<OpenQuestionSource, ...>` |
| Turborepo silent env-filter | CLAUDE.md | declare in `turbo.json` `env[]` AND Vercel |
| Test env vars enforced strict | CLAUDE.md | use real-shape prefixes (AUTH_SECRET ≥32, sk-or-, sk_, whsec_) |

**Test recipe:**
```bash
cd apps/product-helper && \
  POSTGRES_URL=stub AUTH_SECRET=stubstubstubstubstubstubstubstubstub \
  STRIPE_SECRET_KEY=sk_test_stub STRIPE_WEBHOOK_SECRET=whsec_stub \
  OPENROUTER_API_KEY=sk-or-stub BASE_URL=http://localhost:3000 \
  npx jest <path>
```

---

## Branch state

- **Base:** [`41acf9f`](file:///Users/davidancor/Projects/c1v/) on `fix/intake-extraction-nfr-outofscope` (V2 fix preview-validated)
- **New branch:** `feat/draft-pipeline-funnel` off `41acf9f`
- **Preview env:** `INTAKE_PROMPT_V2=true` (Vercel preview)
- **Production env:** `INTAKE_PROMPT_V2=false` (deferred until funnel ships)

---

## Companion docs

- [Source handoff](file:///Users/davidancor/Projects/c1v/plans/HANDOFF-2026-05-04-draft-pipeline-funnel.md) — full rationale (810 lines)
- [Prior session handoff (V2 fix)](file:///Users/davidancor/Projects/c1v/plans/HANDOFF-2026-05-03-intake-prompt-redesign.md)
- [Code review](file:///Users/davidancor/Projects/c1v/plans/intake-prompt-redesign-folder/code-review-2026-05-03.md) — 911 lines, 3 P0s + addendum 4 P0s
- [V2 plan that shipped](file:///Users/davidancor/Projects/c1v/plans/intake-prompt-redesign.md)
- [Methodology Rosetta](file:///Users/davidancor/Projects/c1v/plans/methodology-rosetta.md) — Cornell ↔ three-pass ↔ Crawley ↔ Atlas
- [Architecture HTML diagram](file:///Users/davidancor/Projects/c1v/apps/product-helper/docs/architecture/data-flow-diagram.html)
- [System question bridge (engine seam)](file:///Users/davidancor/Projects/c1v/apps/product-helper/lib/chat/system-question-bridge.ts)
- [Preview trace dataset](file:///Users/davidancor/Projects/c1v/apps/product-helper/__tests__/v2.2.2-post/dataset_33ec71d2-b6cb-4d5e-8779-47a70c4c617f.jsonl)
