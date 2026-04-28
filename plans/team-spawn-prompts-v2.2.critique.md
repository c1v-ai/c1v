# Team Spawn Prompts v2.2 — Critique
> Keywords: spawn-prompts, wave-c, wave-e, agent-count, contract-pin, dispatch, snapshot-anchor
Iteration: 1

## Summary

- Plan is **structurally sound and faithful to v2.1's dispatch pattern.** Inheritance from v2.1 spawn-prompts (5 teams / 25 agents, shipped) + Day-0 inventory consumption are correctly framed.
- Several **agent-count tables are inconsistent with the actual `Step 2` rosters** (TC1: 5 vs 7 actual; TE1: 7 vs 12 actual; total 12 vs 19 actual). Pure bookkeeping, but breaks the "dispatch from this doc verbatim" promise.
- **One missing mechanism specification** — the "implementation independence proof" (v2.1 lines 498-504) requires the test framework to swap LLM-only vs nfrEngineInterpreter behind `GENERATE_nfr`. Today's `intake-graph.ta1-integration.test.ts` doesn't have a swap mechanism. Spawn prompts must specify HOW (DI / env var / fixture override) or Wave E will improvise.
- **One process-vs-artifact slip** — EC-V21-E.0(iii) "every TE1 agent reads Day-0 inventory before writing code" is dispatch policy, not a verifiable artifact. Move it to dispatch rules.
- **One missing baseline** — engine-prod-swap's "≥60% LLM call rate drop" needs a measurement methodology + baseline source pinned before the gate is verifiable.
- **Several relative-path links use `../../plans/...` from `plans/team-spawn-prompts-v2.2.md`** — same pattern as v2.1, may break in standard Markdown viewers (POSIX vs file-relative resolution).
- **Sequencing aggregate not surfaced** — serial dispatch implies 12-17 days total (5-7 + 7-10), not the 7-10 days Day-0 estimate which is Wave E alone.
- **Closeout flip lacks rollback semantics** — `docs-e-and-closeout` flips DRAFT→SHIPPED but no path defined if `qa-e-verifier` partially fails.
- Snapshot tag `wave-e-pre-rewrite-2026-04-26` ✅ exists locally AND on origin (`d3139886`).

---

## Table of Contents (issues)

1. [Agent count inconsistency — TC1, TE1, totals](#1-agent-count-inconsistency)
2. [TC1 §Step 2 header says "5 parallel" but lists 7](#2-tc1-step-2-header-says-5-parallel-but-lists-7)
3. [Implementation-independence-proof mechanism unspecified](#3-implementation-independence-proof-mechanism-unspecified)
4. [EC-V21-E.0(iii) is process, not artifact](#4-ec-v21-e0iii-is-process-not-artifact)
5. [engine-prod-swap missing baseline + measurement methodology](#5-engine-prod-swap-missing-baseline)
6. [Relative-path links may break in standard viewers](#6-relative-path-links-may-break-in-standard-viewers)
7. [Sequencing aggregate days not surfaced](#7-sequencing-aggregate-days-not-surfaced)
8. [Closeout flip lacks rollback semantics](#8-closeout-flip-lacks-rollback-semantics)
9. [D-V21.13 wording vs scope drift](#9-d-v2113-wording-vs-scope-drift)
10. [`audit-writer` blocks `engine-stories` but ordering rationale unclear](#10-audit-writer-blocks-engine-stories-but-ordering-rationale-unclear)

---

## 1. Agent count inconsistency

Description:
The composition table at lines 47-51 claims:
- TC1 = 5 total
- TE1 = 7 total
- Sum = 12

The actual `Step 2` rosters show:
- TC1 (lines 124-131) = **7 agents** (`namespace-resolver`, `crawley-schemas`, `crawley-migrations`, `eval-harness`, `methodology-page`, `qa-c-verifier`, `docs-c`)
- TE1 (lines 197-209) = **12 agents** (`engine-core`, `engine-context`, `audit-writer`, `engine-fail-closed`, `engine-gap-fill`, `engine-pgvector`, `engine-stories`, `kb-rewrite`, `provenance-ui`, `engine-prod-swap`, `qa-e-verifier`, `docs-e-and-closeout`)
- Sum = **19 agents**

By subagent_type, actual counts:
- TC1: 3 langchain (table says 2), 1 db, 2 qa (table says 1 — `methodology-page` is qa-engineer per the role table line 129), 1 docs
- TE1: 6 langchain (table says 3), 2 db (table says 1), 1 backend, 1 ui-ux, 1 qa, 1 docs

Same drift appears at line 40: "Total: 2 teams, 12 agents, 2 dispatch waves" — should be **19 agents**.

This breaks the doc's "copy-paste-ready" promise — a coordinator dispatching from the comp table will under-allocate roles.

Suggested Solution:
Rewrite the composition table at lines 47-51 to match the actual Step 2 rosters:

```markdown
| Team | LangChain | DB | Backend | UI/UX | QA | Docs | **Total** |
|---|---|---|---|---|---|---|---|
| TC1 | 3 | 1 | — | — | 2 | 1 | **7** |
| TE1 | 6 | 2 | 1 | 1 | 1 | 1 | **12** |
| **Total** | **9** | **3** | **1** | **1** | **3** | **2** | **19** |
```

Update line 40 to: "Total: 2 teams, 19 agents, 2 dispatch waves."

Drop the empty Cache + Obs columns or note them as "0 (Wave B already shipped)."

---

## 2. TC1 §Step 2 header says "5 parallel" but lists 7

Description:
Line 121 header: "Step 2: Spawn agents (5 parallel, with namespace-resolver blocking the other 4)". The Step 2 table beneath has 7 rows. The narrative gloss at line 133 ("Agent count: 7 listed but only 5 are net-new TC1 surface") is half-honest — but the section header still misleads.

Also: namespace-resolver blocks 4 agents (crawley-schemas, crawley-migrations, eval-harness, methodology-page); qa-c-verifier and docs-c run AFTER all 5. So "parallel" is staged, not single-shot.

Suggested Solution:
Line 121 → "Step 2: Spawn agents (7 total — 5 deliverable + QA + Docs; staged parallel behind `namespace-resolver`)".

Add a one-line dispatch sequence note:
- T0: TeamCreate + spawn `namespace-resolver`.
- T0+ε (after namespace-resolver green): spawn 4 deliverable agents in parallel (`crawley-schemas`, `crawley-migrations`, `eval-harness`, `methodology-page`).
- T1 (after all 4 green): spawn `qa-c-verifier` + `docs-c` in parallel.

Same fix for TE1 §Step 2 line 194: "9 total — 7 deliverable + QA + Docs" should read "12 total — 10 deliverable + QA + Docs" (the actual Step 2 table has 10 deliverable agents through `engine-prod-swap`, not 7).

---

## 3. Implementation-independence-proof mechanism unspecified

Description:
Lines 182-183 of the spawn prompts (mirroring v2.1 line 504) require:
> "Implementation independence: `__tests__/langchain/graphs/intake-graph.test.ts` must pass with both v2.1 LLM-only agent AND v2.2 `nfrEngineInterpreter.evaluate(...)` behind `GENERATE_nfr`"

The actual test file at `apps/product-helper/__tests__/langchain/graphs/intake-graph.ta1-integration.test.ts` has the envelope-shape assertion (line 141) but NO mechanism today to swap which implementation is bound to `GENERATE_nfr`.

Spawn prompts must pin the swap mechanism, or the `engine-prod-swap` agent will improvise (and likely re-pattern half the test suite).

Suggested Solution:
Add to TE1 `context` block (after line 183) a `nfr_node_swap_mechanism` field that locks one of:

```markdown
- **DI pattern:** `intake-graph.ts` accepts `nfrImpl?: 'llm' | 'engine'` arg with default 'llm' (v2.1) → 'engine' (v2.2 post-swap). Test runs both implementations explicitly via the param.
- **Env var:** `INTAKE_GRAPH_NFR_IMPL=llm|engine` switches at module-load time. Test sets the env var per case.
- **Fixture override:** test imports both implementations and `bind`s them at test setup; intake-graph exports a `_setNfrImpl(impl)` test-only hook.
```

Bond should pick one and lock it before TE1 dispatch. `engine-prod-swap` consumes the locked choice as a hard constraint.

Also: the test filename in the contract pin (`intake-graph.test.ts`) doesn't match the actual on-disk filename (`intake-graph.ta1-integration.test.ts`). Same drift in v2.1 line 504 — fix both for accuracy.

---

## 4. EC-V21-E.0(iii) is process, not artifact

Description:
Lines 146-147 add a new EC sub-criterion:
> "EC-V21-E.0(iii) Day-0 inventory consumption — every TE1 agent reads `plans/wave-e-day-0-inventory.md` BEFORE writing any code"

This is a dispatch policy (a behavior verifier can't measure post-hoc). Other ECs reference checkable artifacts (tag exists, file written, test passes). Adding policy as an EC weakens the EC contract.

Suggested Solution:
Move E.0(iii) out of the EC list and into the dispatch-rules section (line 73-83). Add as rule #8:

```markdown
8. **Day-0 inventory required-reading:** Every TE1 agent prompt MUST include the Day-0 inventory path (`plans/wave-e-day-0-inventory.md`) in `context.required_reading[]`. Per-team verifier asserts every TE1 Agent prompt body contains the literal substring `wave-e-day-0-inventory.md` — FAIL on missing.
```

That makes it dispatch-time-checkable AND post-hoc-checkable (verifier scans prompt bodies), which is what an EC-equivalent gate needs.

---

## 5. engine-prod-swap missing baseline + measurement methodology

Description:
Line 207 (engine-prod-swap row) requires "verify ≥60% LLM call rate drop on M2". This needs:
- **Baseline:** what's the current LLM-call-rate per M2 emission? Where is it measured? (Sentry telemetry? `lib/observability/synthesis-metrics.ts`?)
- **Post-swap metric:** measured over what window? Per request? Per day? Aggregate over N M2 emissions?
- **Source of truth:** which counter/gauge tracks "LLM calls per M2 emission"?

Without these pinned, qa-e-verifier can't gate EC-V21-E.13 deterministically.

Suggested Solution:
Add to `engine-prod-swap` row (or `qa-e-verifier` row) a measurement-methodology spec:

```markdown
- **Baseline:** scrape `synthesis_metrics_total{module="m2",impl="llm-only"}` from the v2.1 7-day rolling window (Sentry export at plans/v21-outputs/observability/sentry-baseline-2026-04-25.json — write this file in TE1 Day-0 if not yet captured).
- **Post-swap measurement:** same counter, label `impl="engine-first"`, measured over a 7-day rolling window after `engine-prod-swap` deploys.
- **Pass criterion:** `(baseline_calls - postswap_calls) / baseline_calls >= 0.60` with non-overlapping confidence intervals.
- **Verifier:** `qa-e-verifier` runs `scripts/verify-llm-call-rate-drop.ts --baseline=... --postswap=... --threshold=0.60`.
```

This also surfaces a likely missing artifact: a baseline-capture sub-task in `engine-core` or as a TE1 Day-0 prereq.

---

## 6. Relative-path links may break in standard viewers

Description:
The doc uses `../../plans/X.md` from `plans/team-spawn-prompts-v2.2.md` (lines 4-7, 79, 105, 164-174, 235-242). Since the file lives at `<repo>/plans/team-spawn-prompts-v2.2.md`, `../../` from its directory (`<repo>/plans/`) goes to `<repo>/..` (above the repo) and then `plans/X.md` doesn't resolve.

POSIX path normalization (and `realpath`) will treat `plans/team-spawn-prompts-v2.2.md/../../plans/X.md` as resolving to `<repo>/plans/X.md` because it strips the filename component. But standard Markdown link resolution (GitHub, most VS Code viewers) is directory-relative and would break.

This is the same pattern v2.1 spawn-prompts used and shipped. Likely Obsidian-specific resolution (vault-root) makes it work for David day-to-day. But anyone clicking through on GitHub would hit 404s.

Suggested Solution:
Two options:

(a) **Fix the paths** — strip one `../` so they resolve from the file's directory:
```markdown
[`c1v-MIT-Crawley-Cornell.v2.2.md`](c1v-MIT-Crawley-Cornell.v2.2.md)  ← same dir
[`scripts/dispatch-helper.ts`](../scripts/dispatch-helper.ts)  ← from plans/ up to repo, into scripts/
```

(b) **Document the convention** — add a one-line note that paths resolve from repo root (Obsidian vault-root style), not file-relative; explicitly call this an Obsidian-only convention.

I lean (a) — file-relative is the universal default and works in Obsidian + GitHub + VS Code. But (a) is also a v2.1 fix-up sweep, so it's a bigger change than this critique scope.

---

## 7. Sequencing aggregate days not surfaced

Description:
Lines 67-68 specify:
- Wave 1 (TC1) ~5-7 days
- Wave 2 (TE1) ~7-10 days, HARD-DEP on `tc1-wave-c-complete`

Day-0 inventory's "~7-10 days" estimate is for Wave E alone. With serial sequencing, total v2.2 = 12-17 days. The doc should surface this aggregate explicitly.

Suggested Solution:
Add to the §Sequencing block (after line 68):

```markdown
**Aggregate v2.2 timeline (serial):** ~12-17 days (TC1 5-7 + TE1 7-10).
**Aggregate v2.2 timeline (parallel, if 2 streams available):** ~7-10 days (TE1 alone is critical path; TC1 finishes before TE1 since Wave E HARD-DEPs on TC1's typed schemas).
**Wave A↔E contract pin (v2.1 lines 498-504, FROZEN) prevents drift between parallel streams.**
```

---

## 8. Closeout flip lacks rollback semantics

Description:
Line 209 (`docs-e-and-closeout`) and §Closeout (lines 217-228) describe the v2.2 master plan flip from DRAFT → SHIPPED. But there's no rollback path defined if `qa-e-verifier` flags issues partway through closeout (e.g., one EC fails post-tag).

Risk: a partial green (say 12 of 13 ECs) could see docs-e-and-closeout flip the master plan and write release notes asserting completeness — then the failed EC surfaces and the doc-state lies.

Suggested Solution:
Add an explicit dependency to `docs-e-and-closeout` (line 209): change "runs after `qa-e-verifier` green" to "**HARD-DEP on `te1-wave-e-complete` tag from `qa-e-verifier` (FAIL-CLOSED — no flip if any EC red)**".

Add to §Closeout:
```markdown
**Rollback semantics (if qa-e-verifier reports any EC red):**
- Master plan stays DRAFT.
- `docs-e-and-closeout` does NOT run.
- Failed EC(s) get filed in `plans/post-v2.1-followups.md` as v2.3 carry-over.
- Branch state preserved; no rollback to `wave-e-pre-rewrite-2026-04-26` unless explicit decision.
```

---

## 9. D-V21.13 wording vs scope drift

Description:
v2.2 stub line 32 calls D-V21.13 "Module-5 schema delivery". The TC1 spawn prompt (line 126) lists 10 schemas spanning **module-2/3/4/5** (`_matrix.ts` + 5 module-5 phases + 3 module-4 + 1 module-3 + 1 module-2 extension).

The decision name implies module-5-only scope; the actual deliverable spans 4 modules. Locked decision IDs are inviolable, so the wording can't change — but the scope drift should be called out so dispatching coordinators know what's covered.

Suggested Solution:
Add a one-line clarification in the TC1 §Scope (line 89) or just under the EC-V21-C.1 row in the agent table:

```markdown
> Note: D-V21.13 is named "Module-5 schema delivery" but the 10-schema deliverable spans M2/3/4/5 per REQUIREMENTS-crawley §5 — the matrix schema lives in `module-5/` but is consumed cross-module; `module-2/3/4` extensions are the consumers.
```

---

## 10. `audit-writer` blocks `engine-stories` but ordering rationale unclear

Description:
Line 200 (`audit-writer`) blocks `engine-stories` (line 204). But `engine-stories` is "13 engine.json rule trees + golden tests" — these are static rule files, not engine evaluations that would need to write audit rows.

Why does audit-writer block engine-stories? If the rationale is "engine-stories' golden tests run the engine which writes audit rows," that should be stated. If audit-writer is blocking unnecessarily, the dependency is over-constraining the parallel surface.

Suggested Solution:
Either:
- Justify the dependency in the row (e.g., "blocks engine-stories because golden tests invoke `nfrEngineInterpreter.evaluate()` which writes audit rows; audit table extension migration must land first").
- Or remove the dependency and let `engine-stories` author rule trees + golden test files in parallel; tests gate at execution time, not authorship time.

I lean removing the dependency — golden test fixtures can be authored without a live engine call (snapshot the expected EngineOutput shape directly). This unblocks ~2 days of parallel work in TE1.

---

## Cross-references for this critique

- Plan under review: [`team-spawn-prompts-v2.2.md`](team-spawn-prompts-v2.2.md)
- v2.2 master plan: [`c1v-MIT-Crawley-Cornell.v2.2.md`](c1v-MIT-Crawley-Cornell.v2.2.md)
- Day-0 inventory: [`wave-e-day-0-inventory.md`](wave-e-day-0-inventory.md)
- v2.1 spawn-prompts (inheritance source): [`team-spawn-prompts-v2.1.md`](team-spawn-prompts-v2.1.md)
- v2.1 contract pin (handshake): `c1v-MIT-Crawley-Cornell.v2.1.md` lines 498-504
- Verified files: `scripts/dispatch-helper.ts` (exists ✅), `apps/product-helper/lib/chat/system-question-bridge.ts` (✅), `apps/product-helper/lib/langchain/agents/intake/clarification-detector.ts` (✅), `apps/product-helper/lib/langchain/schemas/module-2/submodule-2-3-nfrs-constants.ts` (✅), `apps/product-helper/lib/langchain/schemas/module-5-form-function/` (✅; `module-5/` does not exist — confirms namespace-resolver task is real).
- Snapshot tag: `wave-e-pre-rewrite-2026-04-26` ✅ exists locally + on origin (`d3139886`).

**Net: 10 findings. None are blockers; all are pre-dispatch fix-ups. Plan is dispatchable after items 1, 3, 5, 8 land — those four are the substantive ones (count consistency, swap mechanism, baseline methodology, rollback path). Items 2, 4, 6, 7, 9, 10 are clarity/hygiene improvements.**
