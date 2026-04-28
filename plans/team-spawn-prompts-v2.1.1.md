# Team Spawn Prompts — v2.1.1 Hotfix (c1v MIT-Crawley-Cornell)

> **Purpose:** Copy-paste-ready `TeamCreate` + `Agent` invocations for the v2.1.1 hotfix track. Closes P7 + P8 (production bugs) + P9 mitigation (verifier process gap) before v2.2 day-0 starts.
> **Master plan (closeout-flavored):** [`c1v-MIT-Crawley-Cornell.v2.1.1.md`](c1v-MIT-Crawley-Cornell.v2.1.1.md) — written post-verification 2026-04-27 with shipped commit SHAs + actual EC checkmarks. Predecessor: [`c1v-MIT-Crawley-Cornell.v2.1.md`](c1v-MIT-Crawley-Cornell.v2.1.md) (v2.1 SHIPPED 2026-04-26 but discovered functionally unshipped via P7).
> **Followups source:** [`plans/post-v2.1-followups.md`](post-v2.1-followups.md) — P7 (UI synthesize-trigger missing), P8 (`@dbml/core` default-import broken), P9 (verifier process gap), P10 (Wave-A LangGraph completeness gap), P11 (schema-agent retry-flake).
> **Created:** 2026-04-26
> **Author:** Bond
> **Status:** ✅ SHIPPED 2026-04-27 — `v2.1.1-hotfix-complete` @ `102fce3`. v2.2 day-0 unblocked.
> **Branch:** `wave-b/v2.1.1-hotfix` (new feature branch off `wave-b/tb1-docs` head; do NOT branch from main — the v2.1.1 docs are committed on the docs branch).

---

## Why a hotfix

v2.1 cleared its ship gate (`v2.1-shipped` tag) but project=33 inspection 2026-04-26 surfaced two production bugs:

- **P7 (CRITICAL):** Backend route `/api/projects/[id]/synthesize` ✅ exists; LangGraph nodes ✅ exist; viewers ✅ read from `project_artifacts`. **No UI button anywhere POSTs to the route.** `[Run Deep Synthesis →]` CTAs on every empty state are `<Link>` navigations that loop the user back to another empty state. Backend has never been called from a real user flow.
- **P8 (LATENT):** `@dbml/core@7.1.1` ships named exports only; `lib/dbml/sql-to-dbml.ts:24` does default-import. Today: webpack warning. The moment any project reaches schema-approval (which P7 currently prevents), the page crashes.
- **P9 (PROCESS):** TA2 (UI) verifier and TA3 (API) verifier each tested their half in isolation; neither owned the click-through bridge. Same shape as v2's `projects` table RLS gap.

**Without v2.1.1 landing, v2.2 is unmeasurable** — Wave E's EC-V21-E.13 ("≥60% LLM call rate drop on M2") is meaningless if zero calls fire because no user can trigger synthesis.

---

## Team inventory — v2.1.1 1-team roster

| # | Team slug | Wave | Agents | Lead subagent_type | Spawn prompt |
|---|---|---|---|---|---|
| TH1 | `c1v-v2.1.1-hotfix` | hotfix | 5 | langchain-engineer | **This doc §TH1** |

**Total: 1 team, 5 agents, 3 dispatch waves.**

Per-team subagent_type composition:
| Team | LangChain | QA | Docs | **Total** |
|---|---|---|---|---|
| TH1 | 2 | 2 | 1 | **5** |

---

## Sequencing

**Dispatch waves:**
- **Wave 1:** TC1's `synthesize-trigger` + `dbml-import-fix` in parallel (independent fix paths). ~1-1.5h.
- **Wave 2:** `e2e-clickthrough` after both Wave-1 agents green. ~30-60 min.
- **Wave 3:** `qa-th1-verifier` after Wave 2 green. ~15-30 min.
- **Wave 4 (FAIL-CLOSED on green tag):** `docs-th1` after `qa-th1-verifier` tags `v2.1.1-hotfix-complete`. ~30 min.

**Aggregate v2.1.1 timeline:** ~2-4 hours total wall time (depending on Playwright wiring + RLS smoke-test setup).

---

## Dispatch rules (inherited from v2.1/v2.2 verbatim)

1. `TeamCreate` fires first; `Agent` calls in the immediately-following message. Both `TeamCreate` and all `Agent` calls for a single dispatch wave fire in **one coordinator message** to maximize parallelism.
2. One `Agent` call per teammate → parallel spawn unless an explicit `blocks` field forces sequencing.
3. Teammates reference each other by `name`, never by agentId.
4. Permissions for every `subagent_type` already exist in `.claude/settings.json` allow-list.
5. **Skill attachment:** `inline_skills: [...]` are documentation. Translated at dispatch time via `scripts/dispatch-helper.ts`.
6. **HARD-DEP tags:** TH1 has no external HARD-DEPs (parallel with anything that doesn't touch `app/api/projects/[id]/synthesize/` or `lib/dbml/`).
7. **Reference-from-master-plan:** TH1's `context.authoritative_spec` points at v2.1 master plan §EC-V21-A.1 + §EC-V21-A.6 + the followups doc P7/P8/P9 entries.
8. **Code-walk-required:** every TH1 agent prompt MUST include the followups doc path (`plans/post-v2.1-followups.md`) in `context.required_reading[]`. `qa-th1-verifier` asserts every TH1 Agent prompt body contains the literal substring `post-v2.1-followups.md` — FAIL on missing.

---

## TH1 — c1v-v2.1.1-hotfix

**Scope:** Close P7 (UI synthesize-trigger) + P8 (`@dbml/core` import) + P9 mitigation (Playwright click-through). Single feature branch `wave-b/v2.1.1-hotfix` off `wave-b/tb1-docs` head. Tag `v2.1.1-hotfix-complete` on green.

**Dependencies:** No external HARD-DEP. Internal sequencing per Wave 1 → Wave 2 → Wave 3 → Wave 4.

**Honors:** v2.1 EC-V21-A.1, EC-V21-A.6, EC-V21-A.16. v2.2 spawn-prompts cross-team-bridges process change (P9 v2.2 mitigation, lands separately on `wave-b/tb1-docs`).

### Step 1: Create the team

```
TeamCreate({
  team_name: "c1v-v2.1.1-hotfix",
  agent_type: "tech-lead",
  description: "Close P7 (UI synthesize-trigger missing) + P8 (@dbml/core default-import broken) + P9 mitigation (Playwright click-through that asserts POST fires + project_artifacts transitions pending → ready). Single feature branch off wave-b/tb1-docs head; tag v2.1.1-hotfix-complete on green. Unblocks v2.2 day-0.",
  context: {
    authoritative_spec: "plans/post-v2.1-followups.md §P7 + §P8 + §P9 (NEW 2026-04-26) + plans/c1v-MIT-Crawley-Cornell.v2.1.md §EC-V21-A.1 + §EC-V21-A.6 + §EC-V21-A.16",
    upstream_artifacts_already_shipped: [
      "apps/product-helper/app/api/projects/[id]/synthesize/route.ts (TA3 4e64ddb — POST handler with credits + idempotency + kickoffSynthesisGraph via after())",
      "apps/product-helper/lib/synthesis/kickoff.ts (TA3 — orchestrates 7 GENERATE_* nodes + cache + lazy-gen)",
      "apps/product-helper/lib/langchain/graphs/intake-graph.ts (TA1 — generate_synthesis, generate_decision_network, generate_fmea_*, etc.)",
      "apps/product-helper/components/projects/sections/empty-section-state.tsx (TA2 7e1e8b9 — line 51 is the smoking gun: <Link> not <form>)",
      "apps/product-helper/components/synthesis/empty-state.tsx (TA2 c953954 — composes 5 EmptySectionState instances on the synthesis page)",
      "apps/product-helper/lib/dbml/sql-to-dbml.ts (TA2 — line 24 default-import broken; named exports required)",
      "apps/product-helper/playwright.config.ts (Playwright already wired; test:e2e + test:e2e:ui scripts in package.json)",
      "apps/product-helper/lib/db/queries.ts (TA1 — getProjectArtifacts, upsertArtifactStatus already shipped)"
    ],
    branch: "wave-b/v2.1.1-hotfix (off wave-b/tb1-docs head; the v2.1.1 docs commits live on the docs branch — feature-branch from there to inherit them)",
    out_of_scope: [
      "P5 (stranded kb-upgrade-v2/ partial trees) — defer to v2.2 cleanup",
      "P6 (prompt-caching ↔ bindTools()) — orthogonal cost-lever investigation, separate track",
      "Any v2.2 Wave C / Wave E content (TC1 / TE1 own those)",
      "The synthesis FAILURE-path UX (per-artifact retry button) — TB1 owned this in v2.1; v2.1.1 adds the trigger, NOT the failure-recovery flow",
      "Multi-tenant trigger gating beyond the existing free-tier hard-cap (TB1 shipped checkSynthesisAllowance — v2.1.1 consumes that, doesn't extend)"
    ]
  }
})
```

### Step 2: Spawn 5 teammates

**Dispatch sequence:**
- **T0:** `TeamCreate` + spawn `synthesize-trigger` + `dbml-import-fix` in parallel.
- **T1** (after both green): spawn `e2e-clickthrough`.
- **T2** (after `e2e-clickthrough` green): spawn `qa-th1-verifier`.
- **T3** (FAIL-CLOSED — only if `qa-th1-verifier` tags `v2.1.1-hotfix-complete`): spawn `docs-th1`.

```
Agent({
  name: "synthesize-trigger",
  subagent_type: "langchain-engineer",
  team: "c1v-v2.1.1-hotfix",
  goal: "Close P7. Add a Next.js server action that POSTs to /api/projects/[id]/synthesize, wire it into the synthesis-page empty state's primary CTA via <form action={runSynthesisAction}>. Sub-page CTAs (FMEA / Data Flows / Decision Network / etc. via empty-section-state.tsx) STAY <Link> — they navigate to /projects/[id]/synthesis where the actual trigger button lives. Single canonical trigger; no duplicate POST surfaces. Show a pending-state UI on the synthesis page after the POST fires (poll status_url every 3s; flip to ready/failed when artifacts land).",
  inline_skills: ["nextjs-best-practices", "react-best-practices", "code-quality", "testing-strategies"],
  required_reading: ["plans/post-v2.1-followups.md"],
  deliverables: [
    "apps/product-helper/app/(dashboard)/projects/[id]/synthesis/actions.ts — `'use server'` server action `runSynthesisAction(formData: FormData)`. Reads `projectId` from form data, calls the existing POST `/api/projects/[id]/synthesize` route via internal fetch (or directly invokes the route handler via Next.js internal API if available — verify on disk what's idiomatic), returns `{ synthesis_id, status_url, expected_artifacts }` to the form caller. On 402 (quota exhausted) returns `{ error: 'quota', upgrade_url, plan_name }`.",
    "apps/product-helper/components/synthesis/run-synthesis-button.tsx — `'use client'` form-with-button component: `<form action={runSynthesisAction}><input type=\"hidden\" name=\"projectId\" value={projectId} /><Button type=\"submit\">Run Deep Synthesis</Button></form>`. Pending state via `useFormStatus()` (button disabled + spinner during submit). On result: if synthesis_id returned, redirect (or refresh) to /projects/[id]/synthesis with a query param ?just_started=1 so the page renders in pending mode; if 402, show the upgrade CTA inline.",
    "apps/product-helper/components/synthesis/empty-state.tsx — extend to render the new <RunSynthesisButton projectId={projectId} /> ONCE, prominently, above or below the 5 EmptySectionState cards. The 5 EmptySectionState ctaHref defaults stay <Link> to /projects/[id]/synthesis (so they navigate IN to the synthesis page where the new button lives). Update copy on the synthesis-page hero so the button-vs-link relationship is obvious.",
    "apps/product-helper/components/projects/sections/empty-section-state.tsx — NO functional change required (sub-page CTAs continue to be <Link>). Add a JSDoc clarification at the top: 'Sub-page CTAs are NAVIGATIONAL only. The actual POST trigger lives on the synthesis page (components/synthesis/empty-state.tsx + run-synthesis-button.tsx).' This prevents a future contributor from re-introducing duplicate triggers.",
    "apps/product-helper/app/(dashboard)/projects/[id]/synthesis/page.tsx — extend to (a) detect ?just_started=1 query param, (b) show a pending-state UI (e.g. 'Synthesis in progress — checking every 3s...') instead of the empty state when just_started OR when any project_artifacts row has synthesis_status === 'pending', (c) client-side poll /api/projects/[id]/synthesize/status every 3s until all rows are 'ready' or 'failed' (use a small client component for the polling; server component reads initial state).",
    "apps/product-helper/__tests__/components/run-synthesis-button.test.tsx — render the button; click it; assert form submit fires; mock the server action; assert the action POSTs to /api/projects/[id]/synthesize with the right projectId; assert pending state renders during submit.",
    "apps/product-helper/__tests__/app/synthesis-page-pending.test.tsx — render synthesis page with project_artifacts rows in pending state; assert pending-mode UI renders; mock the status route; assert the polling client fires GET to /api/projects/[id]/synthesize/status; assert the page flips to ready-mode when all rows transition to ready.",
    "git commits: one per logical layer — server-action + button-component + empty-state-integration + page-pending-mode + tests."
  ],
  guardrails: [
    "Branch: wave-b/v2.1.1-hotfix (off wave-b/tb1-docs head). Do NOT branch from main.",
    "DO NOT add a duplicate trigger button on every sub-page (FMEA / Data Flows / etc.) — the EmptySectionState ctaHref is already a <Link> to the synthesis page; a single canonical trigger lives once on the synthesis page. Multiple buttons = duplicate POST surfaces = idempotency burden + confused users.",
    "Server action MUST use the existing /api/projects/[id]/synthesize route — DO NOT bypass to call kickoffSynthesisGraph directly. The route owns credit deduction (D-V21.10), idempotency (5-min window), allowance gating (TB1 free-tier cap). Bypass = lost credit accounting.",
    "Pending-mode UI must NOT spinner forever on a stuck graph — TB1 shipped 30s circuit-breaker per artifact (EC-V21-B.4). If polling sees synthesis_status === 'failed' on any row, render the per-artifact retry CTA (already shipped in download-dropdown.tsx — verify wiring).",
    "402 quota response: surface inline (don't redirect) — show 'Plus tier required for unlimited syntheses; you've used your free monthly slot' + upgrade-url link. The current response shape is { error, reason, upgrade_url, plan_name, remaining_this_month } — render all of these.",
    "DO NOT modify FROZEN viewers (decision-matrix-viewer, ffbd-viewer, qfd-viewer, interfaces-viewer, diagram-viewer). The trigger lives at the synthesis-page level; viewers stay byte-identical.",
    "tsc green + jest green + dev-mode click-through visually verified before tagging green. The point of P7 is that v2.1's verifiers missed the click-through — your verification MUST include actually clicking the button in dev mode.",
    "Idempotent on double-click: the route already has a 5-min idempotency window — verify the form-component handles a double-click gracefully (disable button during submit; useFormStatus() pending state)."
  ]
})

Agent({
  name: "dbml-import-fix",
  subagent_type: "langchain-engineer",
  team: "c1v-v2.1.1-hotfix",
  goal: "Close P8. Flip the broken default-import in apps/product-helper/lib/dbml/sql-to-dbml.ts:24 to a named import. @dbml/core@7.1.1 ships named exports only ({ importer, exporter, Parser, ModelExporter, ... }) — no default. Today's symptom is a webpack warning; the latent crash fires the moment any project reaches schema-approval (which P7 currently prevents). Add a smoke test that round-trips a 2-table fixture through transpileSchemaToDbml so future contributors can't reintroduce the bug.",
  inline_skills: ["code-quality", "testing-strategies"],
  required_reading: ["plans/post-v2.1-followups.md"],
  deliverables: [
    "apps/product-helper/lib/dbml/sql-to-dbml.ts — flip the import from `import dbmlCore from '@dbml/core'` (with `// @ts-ignore` + cast to `(dbmlCore as { importer: ... }).importer`) to `import { importer as dbmlImporter } from '@dbml/core'`. Remove the `// @ts-ignore` and the cast — they were the warning signs that the original was broken. Update the call site from `(dbmlCore as ...).importer.import(ddl, 'postgres')` to `dbmlImporter.import(ddl, 'postgres')`. Drop dead variable references.",
    "apps/product-helper/lib/dbml/__tests__/sql-to-dbml.test.ts (new or extend existing) — round-trip smoke test. Fixture: a 2-table SQL DDL string (one table with a foreign-key relation). Assertions: (a) transpileSchemaToDbml(fixture) does NOT throw, (b) returned DBML string contains both table names, (c) returned DBML contains a `Ref:` line for the foreign-key relation, (d) DBML round-trips: feed the output back through @dbml/core's `importer.import(...)` and assert the parsed model matches the input shape.",
    "Verify in dev mode: `pnpm dev --filter=product-helper`; navigate to the architecture-and-database section of any project (the page that surfaces DBML when a schema is approved); confirm NO 'Attempted import error: '@dbml/core' does not contain a default export' warning in the browser console. Capture the before/after console screenshots in `plans/v211-outputs/th1/dbml-fix-evidence.md`.",
    "git commit: 'fix(dbml): @dbml/core named-import (P8 closure)' — one atomic commit (1-line code change + test file)."
  ],
  guardrails: [
    "Branch: wave-b/v2.1.1-hotfix (same branch as synthesize-trigger).",
    "The fix is LITERALLY one line of import + one line of call-site update. DO NOT scope-creep. DO NOT refactor the surrounding sql-to-dbml.ts file. DO NOT add new DBML features.",
    "Smoke test fixture should match what a real project's approved schema would look like (Drizzle-style entity + relation table) — DO NOT use a contrived SQL string that exercises only the default importer code path.",
    "If the @ts-ignore comment was hiding ANOTHER type error (not just the bogus default-import), surface that type error in the commit body — DO NOT silently absorb it.",
    "Verify the @dbml/core version on disk matches the one I diagnosed (7.1.1); if a different version is locked, named exports MAY have changed — re-verify via `node -e \"const m = require('@dbml/core'); console.log(Object.keys(m))\"`.",
    "tsc green + jest green + dev-mode console verified."
  ]
})

Agent({
  name: "e2e-clickthrough",
  subagent_type: "qa-engineer",
  team: "c1v-v2.1.1-hotfix",
  goal: "Close P9 mitigation. Add a Playwright E2E test that exercises the full synthesis click-through: log in, navigate to a fixture project's synthesis page, click the new 'Run Deep Synthesis' button, assert POST /api/projects/[id]/synthesize fires (network event), assert project_artifacts rows transition pending → ready/failed within a 60-90s poll window. Without this test, v2.2 is one careless dispatch from the same shape of bug — the integration-bridge between TA-style teams will lack click-through coverage.",
  inline_skills: ["testing-strategies"],
  required_reading: ["plans/post-v2.1-followups.md", "apps/product-helper/playwright.config.ts"],
  deliverables: [
    "apps/product-helper/playwright/synthesis-clickthrough.spec.ts (or wherever playwright.config.ts has tests pointed — verify on disk; existing v2.1 e2e tests likely live somewhere). Test shape: (a) authenticate as a fixture user with credits, (b) navigate to /projects/[fixture-id]/synthesis (project pre-seeded to 'in progress' state with intake complete + zero project_artifacts rows), (c) assert the synthesis-page empty state renders with the 'Run Deep Synthesis' button visible, (d) click the button + capture the network request: assert POST to /api/projects/[fixture-id]/synthesize fires + returns 202 with synthesis_id, (e) assert the page flips to pending-mode UI, (f) poll the status route (or wait for UI to flip) up to 90s; (g) assert at least 1 row in project_artifacts has synthesis_status='ready' (i.e. SOMETHING completed; full success not required for the test, just that the wire fires end-to-end). **P10-aware split assertion (locked 2026-04-26):** the 4 pre-v2.1 nodes (`generate_ffbd`, `generate_decision_matrix`, `generate_interfaces`, `generate_qfd`) MUST flip to `ready` for a green test — these are the proof that the click-through fires end-to-end. The 7 NEW v2.1 nodes (`generate_data_flows`, `generate_form_function`, `generate_decision_network`, `generate_n2`, `generate_fmea_early`, `generate_fmea_residual`, `generate_synthesis`) are EXPECTED to stay `pending` per P10 (no upstream stub on live projects — Wave-A completion gap). Test MUST NOT assert these 7 transition; instead, capture their stuck-pending state as expected-but-deferred evidence. v2.1.2 / v2.2 closes P10; v2.1.1 only asserts the trigger wire is alive.",
    "apps/product-helper/playwright/fixtures/synthesis-fixture-project.ts — fixture project setup helper. Uses local Supabase :54322 (per memory) to create a fixture user + team + project with intake state populated. Reusable across e2e tests.",
    "apps/product-helper/playwright/fixtures/synthesis-mocks.ts (only if needed) — mocks the LLM API (Anthropic) to return deterministic completions so the test doesn't burn real tokens AND completes within the 90s window. If the existing TA1 testing pattern uses real API in e2e (verify on disk), match that — otherwise add a mock layer.",
    "Update apps/product-helper/playwright.config.ts if needed to point at the new playwright/ directory (verify current config).",
    "Add a CI workflow entry .github/workflows/v2.1.1-e2e.yml (or extend an existing e2e workflow) that runs the new spec against a fresh local Supabase + dev server. Cron-on-PR-to-main if v2.1.1 specs aren't already covered by an existing workflow.",
    "plans/v211-outputs/th1/e2e-evidence.md — capture: (a) test run video/screenshot link, (b) network HAR or excerpt showing the POST + status polls, (c) **P10-aware row-count timeline split out by node-class:** `0 pending → 11 pending → {4 ready (pre-v2.1: ffbd/decision_matrix/interfaces/qfd) + 7 stuck-pending (v2.1 NEW: data_flows/form_function/decision_network/n2/fmea_early/fmea_residual/synthesis)}`. The 4-vs-11 split MUST be explicit so qa-th1-verifier doesn't false-green on partial completion. (d) total wall-time for the click-through. (e) link to `plans/post-v2.1-followups.md` §P10 entry as the explanation for the 7 stuck-pending nodes — this proves the test author understood the gap, not missed it.",
    "git commit: 'test(e2e): synthesis click-through P9 mitigation'."
  ],
  guardrails: [
    "Branch: wave-b/v2.1.1-hotfix.",
    "BLOCKED until both `synthesize-trigger` and `dbml-import-fix` post green. The e2e test exercises both fixes (the trigger fires; if dbml import is broken the page might still crash on architecture-and-database render even with synthesis trigger working).",
    "Test MUST hit the REAL backend route (not a mock) — the whole point of P9 is that integration tests with route-handler mocks missed the UI bridge. Use the dev server + local Supabase + (mocked LLM is OK for determinism).",
    "Test MUST use a real fixture project pre-seeded with intake state. DO NOT skip intake setup; the kickoffSynthesisGraph won't fire if intake is empty.",
    "If LLM mocks are used, document the mock pattern in fixtures/synthesis-mocks.ts so v2.2 e2e specs can adopt the same pattern.",
    "Test MUST NOT depend on full synthesis completion — the gate is: POST fires + the 4 pre-v2.1 nodes (ffbd/decision_matrix/interfaces/qfd) flip to `ready` (proves the wire is alive end-to-end). The 7 NEW v2.1 nodes (data_flows/form_function/decision_network/n2/fmea_early/fmea_residual/synthesis) are EXPECTED to stay `pending` per P10 (no upstream stub on live projects). DO NOT assert them ready; DO capture their stuck-pending state explicitly in evidence so the verifier can distinguish 'P9-mitigation green' from 'P10-actually-fixed' (P10 is v2.1.2/v2.2 work). Failure scenarios (timeout, sidecar down) are TB1's coverage.",
    "Capture evidence in `e2e-evidence.md` — qa-th1-verifier reads this; without evidence the EC marks SKIP.",
    "playwright test must be hermetic (clean slate before each run): truncate project_artifacts for the fixture project ID before the test starts. Or use a unique fixture project per run."
  ]
})

Agent({
  name: "qa-th1-verifier",
  subagent_type: "qa-engineer",
  team: "c1v-v2.1.1-hotfix",
  goal: "Verify v2.1.1 hotfix exit criteria. Tags `v2.1.1-hotfix-complete` ONLY on full green. Non-fix verifier — log failures, capture evidence, surface to coordinator. Also enforces dispatch rule #8 (TH1 prompt-body inclusion of post-v2.1-followups.md path).",
  inline_skills: ["testing-strategies"],
  required_reading: ["plans/post-v2.1-followups.md"],
  deliverables: [
    "apps/product-helper/scripts/verify-th1.ts — TH1-specific verifier (CI-reusable). Asserts: (a) **EC-V21.1.1.P7** — `components/synthesis/run-synthesis-button.tsx` exists; `actions.ts` exports `runSynthesisAction`; synthesis-page empty-state renders the button; jest tests for button + page-pending green; grep proves NO duplicate trigger buttons elsewhere (only `components/synthesis/run-synthesis-button.tsx` should fetch/POST to `/api/projects/.../synthesize`); (b) **EC-V21.1.1.P8** — `lib/dbml/sql-to-dbml.ts` does NOT contain `import dbmlCore from '@dbml/core'` (default-import pattern); DOES contain `import { importer` (named-import pattern); smoke test green; dev-mode console screenshot in `dbml-fix-evidence.md` shows no '@dbml/core' webpack warning; (c) **EC-V21.1.1.P9** — Playwright spec `synthesis-clickthrough.spec.ts` exists + passes locally; e2e-evidence.md captured (network HAR + wall-time + **P10-aware 4-vs-11 row-count split** — verifier MUST grep e2e-evidence.md for both `4 ready` AND `7 stuck-pending` AND a reference to `P10` in `post-v2.1-followups.md`; FAIL if any of these three substrings missing — this is the explicit P10-vs-P9 distinction so the verifier doesn't false-green the test on full-pending or full-ready states); CI workflow updated.",
    "**Dispatch rule #8 enforcement:** every TH1 Agent prompt body in this spawn-prompts doc MUST contain the literal substring `post-v2.1-followups.md` in its `required_reading` list. Verifier scans this spawn-prompts doc + cross-checks against the `Agent({...})` blocks. FAIL on missing.",
    "plans/v211-outputs/th1/verification-report.md — per-EC PASS/FAIL with evidence (commit SHA, log excerpt, screenshot link, e2e wall-time). Mirror v2.1 per-team verification-report.md format.",
    "**Implementation-independence proof for v2.1.1:** project=33 (the original symptom-source) re-tested manually OR via a project=33-replay e2e: navigate to project=33's synthesis page → click Run Deep Synthesis → assert POST fires + at least 1 artifact transitions to ready within 90s. This is the user-visible proof that the v2.1.1 hotfix actually fixed what David saw.",
    "git tag `v2.1.1-hotfix-complete` ONLY if all 3 ECs green AND project=33 replay green. Push to origin (`docs-th1` HARD-DEPs on the remote tag)."
  ],
  guardrails: [
    "Depend on `synthesize-trigger` + `dbml-import-fix` + `e2e-clickthrough` (block on agent names).",
    "Non-fix verifier — log failures, capture evidence, surface to coordinator. Do NOT auto-fix any deliverable.",
    "All 3 EC sub-points must be green to tag. Partial green = NO TAG; surface failed EC(s) to coordinator with evidence.",
    "Tag MUST point to the head commit of the wave-b/v2.1.1-hotfix branch (after e2e-clickthrough's commit lands). Push with `git push origin v2.1.1-hotfix-complete`.",
    "Project=33 replay is the user-visible gate — David's bug report drove this hotfix; verification MUST close the loop on his original report.",
    "Dispatch rule #8 enforcement is a STATIC scan of the spawn-prompts doc — NOT runtime. If a TH1 Agent prompt was authored without the followups path string, FAIL the EC and surface to coordinator.",
    "Single commit: 'test(th1/verifier): verify-th1.ts + verification-report.md + v2.1.1-hotfix-complete tag'."
  ]
})

Agent({
  name: "docs-th1",
  subagent_type: "documentation-engineer",
  team: "c1v-v2.1.1-hotfix",
  goal: "Document the v2.1.1 hotfix + execute closeout. Updates `plans/post-v2.1-followups.md` (P7/P8/P9 → ✅ resolved with evidence). Appends v2.1.1 entry to `plans/v2-release-notes.md`. Adds the v2.2 spawn-prompts §'Cross-team bridges' subsection (P9 v2.2 mitigation — process change pre-dispatch). **HARD-DEP on `v2.1.1-hotfix-complete` tag from `qa-th1-verifier` (FAIL-CLOSED — does NOT run if any EC red).**",
  inline_skills: ["code-quality"],
  required_reading: ["plans/post-v2.1-followups.md"],
  deliverables: [
    "plans/post-v2.1-followups.md — flip P7 + P8 + P9 to ✅ RESOLVED 2026-04-26 with one-line evidence each (cite verification-report.md commit SHA + tag). Use the same `## P<N> — ~~original-title~~ — ✅ RESOLVED <date>` pattern as P2/P3 already use.",
    "plans/v2-release-notes.md — append `## v2.1.1 — Hotfix (2026-04-26)` section. Include: tag SHA, what shipped (P7 trigger button, P8 dbml import, P9 e2e), test evidence cross-reference (`plans/v211-outputs/th1/`), 1-line note on why v2.1 verifier missed it (TA2/TA3 integration-bridge gap; same shape as v2's projects-table RLS gap). Mirror v2.1 closeout-section pattern.",
    "**plans/team-spawn-prompts-v2.2.md — add §'Cross-team bridges' subsection** under §Sequencing (or as a new top-level section before §Dispatch rules). Content: 'Every team in v2.2 spawn-prompts must explicitly own AT LEAST ONE bridge to ANOTHER team's deliverables. Bridges in v2.2: TC1's typed schemas → TE1's engine.json validators (owned by `crawley-schemas` producer + `engine-stories` consumer); TC1's LangSmith dataset → TE1's per-rule confidence-drift gate (owned by `eval-harness` producer + `engine-prod-swap` consumer). Add a Playwright-style click-through test for each bridge during qa-c-verifier and qa-e-verifier execution.' This is the v2.2 mitigation half of P9.",
    "apps/product-helper/CLAUDE.md (only if scope warrants) — add a single line under `Architecture` § cross-referencing the v2.1.1 hotfix scope: 'Synthesis trigger lives at `components/synthesis/run-synthesis-button.tsx` (post-v2.1.1).' Coordinate with David on CLAUDE.md edits per file-safety rule (write the proposed diff to `plans/v211-outputs/th1/claude-md-diff.md` first).",
    "git commit (or two if CLAUDE.md gates on authorization): 'docs(th1): v2.1.1 hotfix closeout + v2.2 cross-team-bridges'."
  ],
  guardrails: [
    "**HARD-DEP on green `v2.1.1-hotfix-complete` tag — FAIL-CLOSED.** If any TH1 EC is red, docs-th1 MUST NOT run. Failed ECs file as v2.1.2 carry-over. Master plan v2.1 stays SHIPPED (since v2.1 already cleared its own tag); the v2.1.1 ship-state is what's gated.",
    "CLAUDE.md edits require explicit David authorization per file-safety rule (memory: `feedback_no_scope_doubt.md`) — surface the proposed CLAUDE.md diff in `plans/v211-outputs/th1/claude-md-diff.md` FIRST and wait for David's go-ahead. Other doc surfaces (post-v2.1-followups, v2-release-notes, v2.2 spawn-prompts) ship without gating.",
    "DO NOT introduce new section headers in CLAUDE.md beyond the single one-liner — keep the addition minimal.",
    "v2-release-notes.md append goes to the v2 cumulative log — DO NOT write a separate v2.1.1-release-notes.md (the hotfix is small enough to fold into v2 notes).",
    "v2.2 spawn-prompts §'Cross-team bridges' subsection lands on `wave-b/tb1-docs` branch (NOT the v2.1.1 hotfix branch) — because that's where v2.2 spawn-prompts lives. Two branches; coordinator merges sequentially: hotfix branch → main, then docs branch → main.",
    "P7/P8/P9 resolution lines must cite the actual evidence (verification-report.md commit SHA + tag SHA + e2e wall-time) — DO NOT mark resolved with a hand-wave.",
    "Single commit (or two if CLAUDE.md goes in a separate commit pending authorization): 'docs(th1): v2.1.1 hotfix closeout'."
  ]
})
```

---

## Closeout

When `v2.1.1-hotfix-complete` tag green AND `docs-th1` lands:

1. Coordinator merges `wave-b/v2.1.1-hotfix` → `main` (or PRs depending on workflow).
2. Coordinator merges `wave-b/tb1-docs` → `main` (carries v2.1.1 doc commits + v2.2 spawn-prompts cross-team-bridges subsection).
3. Roll-up tag `v2.1.1` @ the merge commit. Push to origin.
4. **v2.2 day-0 unblocked.** TC1 + TE1 dispatch can proceed against the new spawn-prompts.

**Rollback semantics (if `qa-th1-verifier` reports any EC red):**
- v2.1.1 stays unshipped — no merge to main.
- Failed EC(s) file as v2.1.2 carry-over in `plans/post-v2.1-followups.md`.
- Branch `wave-b/v2.1.1-hotfix` preserved for next pass.
- v2.2 day-0 STAYS BLOCKED.

---

## Cross-references

- v2.1 master plan: [`c1v-MIT-Crawley-Cornell.v2.1.md`](c1v-MIT-Crawley-Cornell.v2.1.md)
- Post-v2.1 followups (P7/P8/P9 source): [`post-v2.1-followups.md`](post-v2.1-followups.md)
- v2.2 master plan (BLOCKED until v2.1.1 ships): [`c1v-MIT-Crawley-Cornell.v2.2.md`](c1v-MIT-Crawley-Cornell.v2.2.md)
- v2.2 spawn-prompts (will receive cross-team-bridges subsection): [`team-spawn-prompts-v2.2.md`](team-spawn-prompts-v2.2.md)
- v2.1 spawn-prompts (inheritance source): [`team-spawn-prompts-v2.1.md`](team-spawn-prompts-v2.1.md)
- Dispatch helper: `scripts/dispatch-helper.ts` (v2.1 fix-up sweep)
