# Post-v2.1 follow-ups

> **Created:** 2026-04-25 — during v2.1 spawn-prompts fix-up sweep per `plans/HANDOFF-2026-04-25-v2.1-fixup.md`.
> **Purpose:** Items intentionally deferred from v2.1 (Waves A + B + D) and carried forward to v2.2 (Waves C + E) or later. Distinct from `plans/post-v2-followups.md` (Wave-4 v2 closeout backlog).
> **Owner:** Bond seeds; v2.2 day-0 inventory pass picks up.

---



## P2 — ~~Deferred fs-side-effects refactors >200 LOC~~ — ✅ RESOLVED 2026-04-26

- **Source:** R-v2.1.A Option C ruling 2026-04-25 19:50 EDT. Any agent with >200 LOC fs-side-effects refactor ships as a graph-node-adapter wrapper in v2.1; underlying refactor defers here.
- **Resolution:** Audited 2026-04-26 in [`plans/wave-e-day-0-inventory.md`](wave-e-day-0-inventory.md) Task 3. 12/12 system-design agents audited; only 1 fs call site found (`synthesis-agent.ts:loadUpstream` L224-243) and that path is **script-only** (invoked by `scripts/build-synthesis*.ts`, not the LangGraph node). Classification: 1 script-only / 0 shared-utility / 0 requires-refactor. **No agent requires the >200 LOC refactor escalation.** R-v2.1.A Option C wrapper sufficient for all 12 agents.

## P3 — ~~TD1 fixture-vs-live preflight drift~~ — ✅ RESOLVED 2026-04-26

- **Source:** Handoff Issue 18 — TD1.preflight-and-stage1-schema captures both `preflight-log-fixture.md` and `preflight-log-live.md`. If divergent, production = reality on branch decision.
- **Resolution:** Verified 2026-04-26 in [`plans/wave-e-day-0-inventory.md`](wave-e-day-0-inventory.md) Task 4. Live preflight log line 75 explicitly states "None. Fixture replay (offline sizing) was consistent with the cutoff hypothesis; live replay confirms it definitively. No drift carried into v2.2 followups." Fixture's "cannot determine stop_reason" caveat was an honest scope-of-method note (offline replay can't measure live API metadata), not a divergence. The CUTOFF (max_tokens) branch decision holds.

## P7 — UI trigger missing: `[Run Deep Synthesis →]` CTAs don't actually POST (CRITICAL — v2.1 production bug, NEW 2026-04-26)

- **Source:** Surfaced 2026-04-26 via project=33 inspection at localhost:3000. User reports empty states everywhere (Synthesis / Decision Network / Data Flows / FMEA / etc.) on a project that should have synthesis content.
- **Symptom:** Every empty state ships a `[Run Deep Synthesis →]` CTA. Clicking it from any system-design page navigates to `/projects/<id>/synthesis` — which renders ANOTHER empty state (5 instances of the same CTA). User loops; synthesis never triggers.
- **Diagnosis:**
  - **Backend route exists ✅** — [`apps/product-helper/app/api/projects/[id]/synthesize/route.ts`](../apps/product-helper/app/api/projects/%5Bid%5D/synthesize/route.ts) (TA3 commit `4e64ddb`): credits + idempotency + `kickoffSynthesisGraph()` via Next.js `after()`.
  - **LangGraph nodes exist ✅** — [`intake-graph.ts`](../apps/product-helper/lib/langchain/graphs/intake-graph.ts): `generate_synthesis`, `generate_data_flows`, `generate_fmea_early`, `generate_fmea_residual`, `generate_decision_network`, `generate_form_function`, `generate_qfd`, `generate_n2`, `generate_interfaces`, `generate_ffbd`.
  - **Viewers exist ✅** — synthesis/FMEA/Decision Network/Data Flows pages all `getProjectArtifacts()` from the table (TA2 commit `c953954`).
  - **UI POST trigger MISSING ❌** — grep across `apps/product-helper/components/{synthesis,projects/sections}/` returns ZERO `fetch('/api/projects/.../synthesize'`, ZERO `<form action>`, ZERO `onClick` synthesis triggers, ZERO server actions. The `[Run Deep Synthesis →]` button in [`empty-section-state.tsx`](../apps/product-helper/components/projects/sections/empty-section-state.tsx) is a `<Link>` that just navigates to the synthesis page (line 51: `const href = ctaHref ?? \`/projects/${projectId}/synthesis\``).
- **Why v2.1 verifier missed it:** TA2 verifier asserted "synthesis page renders empty state pre-synthesis" (✅). TA3 verifier asserted "POST /api/projects/[id]/synthesize works" via integration test fixture (✅). EC-V21-A.1 ("New project N → synthesis page renders the user's own 5-section synthesis") was tested by writing fixture rows directly to `project_artifacts`, never by user-flow click-through. **Integration gap between TA2 (UI ownership) and TA3 (API ownership) — neither team's verifier covered the bridge.**
- **Impact:** v2.1 ship-gate cleared, but no user can actually synthesize a project from the UI. Production projects are stuck in pre-synthesis empty states forever. Cost telemetry shows zero per-tenant LLM spend (matches the symptom — no synthesis is firing). Critical user-facing bug; v2.1 is functionally unshipped from a user-flow perspective despite tag-state.
- **Fix scope:** Small. Add a server action OR `<form action="/api/projects/[id]/synthesize" method="POST">` button to:
  - The synthesis page empty-state ([`components/synthesis/empty-state.tsx`](../apps/product-helper/components/synthesis/empty-state.tsx)) — primary trigger.
  - Optionally each section's empty state CTA (`empty-section-state.tsx`) — but secondary; primary entry through synthesis page is enough.
  - Update the CTA label semantics: when on the synthesis page, the button POSTs; when on a sub-page (FMEA / Data Flows / etc.), the link navigates to the synthesis page where the user clicks the actual trigger.
- **Status:** OPEN; **NOT covered by v2.2 scope** (Wave C/E both assume synthesis runs end-to-end). v2.2 day-0 should NOT start until P7 lands. Recommend a v2.1.1 hotfix track.
- **Repro steps:** (a) `pnpm dev --filter=product-helper`; (b) navigate to any in-progress project (e.g. project=33); (c) visit any system-design page; (d) click `[Run Deep Synthesis →]`; (e) observe loop into synthesis page; (f) note no POST fires (DevTools Network tab confirms — only GET on the synthesis page itself).
- **Code-walk evidence (David's investigation 2026-04-26):** `grep -rn "fetch.*synthesize\|method.*POST.*synthesize" components/ app/` returns ZERO hits anywhere in app/components — only `/settings`, `/sign-out`, `/delete` carry form actions. [`empty-section-state.tsx:51`](../apps/product-helper/components/projects/sections/empty-section-state.tsx#L51) is the smoking gun: `const href = ctaHref ?? \`/projects/${projectId}/synthesis\`` — a `<Link>`, not a form.
- **Why all System Architecture viewers show empty (project=33 specific):** the `[POST_INTAKE] Generation complete: 6/6 succeeded` line in the dev console is the LEGACY intake-graph generators writing to `extractedData` blob (user_stories, problem-statement, etc. — pre-v2.1 surface). The v2.1 M3-M8 synthesis-stage artifacts (`decision_network`, `ffbd`, `qfd`, `fmea_*`, `form_function`, `interfaces`) live in `project_artifacts` and only populate after `/synthesize` is POSTed — which never happens.

## P8 — `@dbml/core` default-import is broken (NEW 2026-04-26)

- **Source:** Surfaced 2026-04-26 in David's project=33 console review. Browser webpack squawk: `Attempted import error: '@dbml/core' does not contain a default export`.
- **Diagnosis:** [`apps/product-helper/lib/dbml/sql-to-dbml.ts:24`](../apps/product-helper/lib/dbml/sql-to-dbml.ts#L24) does `// @ts-ignore` + `import dbmlCore from '@dbml/core'` then casts to `(dbmlCore as { importer: ... }).importer`. **`@dbml/core@7.1.1` ships named exports only** (`{ importer, exporter, Parser, ModelExporter, ... }`). No default export. Verified via `node -e "const m = require('@dbml/core'); console.log(typeof m.default, typeof m.importer)"` → `undefined object`.
- **Symptom today:** webpack warning only — the surrounding `architecture-and-database-section.tsx` falls through to the empty-state branch (no schema to transpile yet because P7 blocks synthesis). The moment a project actually has an approved schema and tries to render DBML, the page crashes on `Cannot read properties of undefined (reading 'import')`.
- **Why v2.1 verifier missed it:** EC-V21-A.6 verifier never exercised this path because no project ever reached schema-approval (because P7 blocks synthesis). Latent crash hidden behind the trigger gap.
- **Fix:** one-line import flip:
  ```ts
  // BEFORE (broken):
  // @ts-ignore
  import dbmlCore from '@dbml/core';
  const importer = (dbmlCore as { importer: ... }).importer;

  // AFTER (cleaner):
  import { importer as dbmlImporter } from '@dbml/core';
  // or:
  import * as dbmlCore from '@dbml/core';
  ```
- **Test:** add a smoke test that exercises `transpileSchemaToDbml({ tables: [...] })` against a 2-table fixture and asserts the DBML output parses round-trip.
- **Status:** OPEN; CO-BLOCKER with P7 (both ship in same v2.1.1 hotfix branch). Independent fix paths — Bug 2 doesn't need Bug 1 to land first.

## P9 — Verifier process gap: integration-bridges had no owner (NEW 2026-04-26)

- **Source:** Surfaced 2026-04-26 as the root-cause analysis behind P7. TA2 (UI ownership) verifier and TA3 (API ownership) verifier each tested their half in isolation; neither owned the click-through bridge between them.
- **Pattern (v2.1):**
  | Verifier | Tested | Did NOT test |
  |---|---|---|
  | TA2 (UI) | "synthesis page renders empty state pre-synthesis" ✅ | the click-through that goes from empty state → POST → ready state |
  | TA3 (API) | "POST `/api/projects/[id]/synthesize` works" via integration test fixture ✅ | whether any UI element actually fires that POST |
  | EC-V21-A.1 | "New project N → 5-section synthesis renders" — satisfied by writing fixture rows directly to `project_artifacts` | the user-flow click-through |
- **Same shape as v2 RLS gap:** P3 (in [`post-v2-followups.md`](post-v2-followups.md)) was the `projects` table RLS — TA1's verifier tested its tables in isolation, no team owned cross-table RLS verification.
- **v2.2 protection:** v2.2 spawn-prompts already include `qa-e-verifier`'s "Wave A↔E implementation-independence proof" which exercises the DI-swap end-to-end via `intake-graph.ta1-integration.test.ts`. But that's only one bridge. Other v2.2 bridges (TC1's eval-harness ↔ TE1's engine; TC1's typed schemas ↔ TE1's engine.json validators) need explicit click-through coverage.
- **Mitigation (v2.1.1 hotfix scope):** add an EC-V21-A.1+ Playwright test that clicks the synthesis CTA and asserts (a) network POST to `/api/projects/[id]/synthesize` fires, (b) `project_artifacts` rows transition `pending → ready/failed` within poll window. Without this, v2.2 is one careless dispatch from the same shape of bug.
- **v2.2 process change:** every team in v2.2 spawn-prompts must explicitly own AT LEAST ONE bridge to ANOTHER team. TC1↔TE1 bridges: typed schemas + LangSmith dataset → both owned by `eval-harness` (TC1) on the producer side and `engine-stories` / `engine-prod-swap` (TE1) on the consumer side. Add a §"Cross-team bridges" subsection to v2.2 spawn-prompts before dispatch.
- **Status:** OPEN process learning; mitigation lands in v2.1.1 hotfix branch (Playwright EC-V21-A.1+) AND in v2.2 spawn-prompts pre-dispatch (cross-team bridges subsection).

## P6 — Prompt-caching not propagating through `ChatAnthropic.bindTools()` (NEW 2026-04-26)

- **Source:** Surfaced 2026-04-26 in [`plans/wave-e-day-0-inventory.md`](wave-e-day-0-inventory.md) Task 4 bonus finding; live preflight log [`v21-outputs/td1/preflight-log-live.md`](v21-outputs/td1/preflight-log-live.md) line 81.
- **Symptom:** Despite `cacheControl: true` set in `apps/product-helper/lib/langchain/config.ts`, the live preflight call against project=33's api-spec agent measured `cache_creation=0` + `cache_read=0` — the cache breakpoints never fired.
- **Hypothesis:** The `ChatAnthropic.bindTools()` path used by api-spec-agent (and every agent that uses bound-tool `input_schema`) is not propagating `cacheControl` settings to the underlying Anthropic SDK call. The non-tool agents may or may not be affected; needs verification.
- **Impact:** Direct hit on the AV.01 $320/mo cost target — bound-tool agents (api-spec, decision-net, form-function, hoq, fmea-{early,residual}, interface-specs, n2, data-flows) miss 50–90% input-token reduction on cache hits. Wave B's −$300/mo cache lever is partially unrealized.
- **Resolution path:** (a) verify hypothesis — instrument every agent's first call with cache-counter logging, classify by tool/no-tool path; (b) if confirmed, patch via direct Anthropic SDK call OR upgrade `@langchain/anthropic` to a version that propagates cache settings through `bindTools()`; (c) re-run cost-telemetry load test. Out of scope for Wave E itself but worth investigating in parallel — pure cost lever.
- **Status:** OPEN; not blocking Wave E.

## P4 — ~~`.claude/plans/kb-upgrade-v2/METHODOLOGY-CORRECTION.md` redirect stub~~ — OBSOLETE 2026-04-26

- **Status:** ❌ OBSOLETE. The premise of this follow-up (that `plans/kb-upgrade-v2/METHODOLOGY-CORRECTION.md` and `.claude/plans/kb-upgrade-v2/METHODOLOGY-CORRECTION.md` exist and need a redirect-stub conversion) was built on hallucinated disk facts. **Neither file exists on disk.** The only `METHODOLOGY-CORRECTION.md` is at `system-design/kb-upgrade-v2/METHODOLOGY-CORRECTION.md`, declared canonical 2026-04-26.
- **Resolution:** Lock revoked at `plans/v21-outputs/ta1/methodology-canonical.md` (commit `77a72b7`). No redirect stub needed; no TA1 dispatch needed.
- **Residual cleanup (separate):** `plans/kb-upgrade-v2/` and `.claude/plans/kb-upgrade-v2/` are partial (5 of 8 modules each) stranded duplicates of the complete `system-design/kb-upgrade-v2/` tree. Deferred to v2.2 — see new `## P5` below.

## P5 — Stranded partial `kb-upgrade-v2/` trees (v2.2 cleanup)

- **Source:** Surfaced 2026-04-26 during P4 reconciliation. `plans/kb-upgrade-v2/` and `.claude/plans/kb-upgrade-v2/` each carry only modules 1, 2, 3, 4, 6 — no `METHODOLOGY-CORRECTION.md`, no module-5/7/8, no `DIAGRAMS-INDEX.md`, no `MODULE-DATA-FLOW.md`. The complete tree is at `system-design/kb-upgrade-v2/` (all 8 modules + index files).
- **Risk:** A future contributor doing repo-wide content-search may edit the partial copies thinking they're canonical, when content has drifted from `system-design/`. Already happened once (the 2026-04-25 lock).
- **Options for v2.2:** (a) `rm -rf plans/kb-upgrade-v2/ .claude/plans/kb-upgrade-v2/` (simplest; the symlink `.claude/plans → ../plans` collapses both with one delete), or (b) replace each partial tree with a single-line README pointing at `system-design/kb-upgrade-v2/`.
- **Status:** Pending v2.2 dispatch. Non-blocking for v2.1 ship.

---

## Cross-references

- v2.1 master plan: [`c1v-MIT-Crawley-Cornell.v2.1.md`](c1v-MIT-Crawley-Cornell.v2.1.md)
- v2.1 fix-up handoff: [`HANDOFF-2026-04-25-v2.1-fixup.md`](HANDOFF-2026-04-25-v2.1-fixup.md)
- v2.1 spawn prompts: [`.claude/plans/team-spawn-prompts-v2.1.md`](../.claude/plans/team-spawn-prompts-v2.1.md)
- v2.2 stub: [`c1v-MIT-Crawley-Cornell.v2.2.md`](c1v-MIT-Crawley-Cornell.v2.2.md)
- Wave-4 v2 backlog (separate): [`post-v2-followups.md`](post-v2-followups.md)
