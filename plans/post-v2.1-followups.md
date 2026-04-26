# Post-v2.1 follow-ups

> **Created:** 2026-04-25 — during v2.1 spawn-prompts fix-up sweep per `plans/HANDOFF-2026-04-25-v2.1-fixup.md`.
> **Purpose:** Items intentionally deferred from v2.1 (Waves A + B + D) and carried forward to v2.2 (Waves C + E) or later. Distinct from `plans/post-v2-followups.md` (Wave-4 v2 closeout backlog).
> **Owner:** Bond seeds; v2.2 day-0 inventory pass picks up.

---

## P1 — AV.01 portfolio-keystone alignment ($320/mo target)

- **Source:** R-v2.1.D ruling locked 2026-04-25 19:50 EDT — `≤ $500/mo at 100 DAU` is the v2.1 ship gate.
- **Gap:** AV.01 portfolio-keystone artifact (`architecture_recommendation.v1.json`) targets $320/mo as the recommended-alternative cost. v2.1 Wave-B shipping bar is $500/mo.
- **Resolution path:** v2.2 Wave E (KB runtime architecture rewrite + heuristic engine) is the cost lever. Engine-first NFR/constants emission shifts most token spend out of LLM calls into deterministic computation.
- **Acceptance criterion:** post-v2.2 cost projection ≤ $320/mo at 100 DAU on the same synthetic-load script (`scripts/load-test-tb1.ts`).

## P2 — Deferred fs-side-effects refactors >200 LOC (R-v2.1.A Option C carryover)

- **Source:** R-v2.1.A Option C ruling 2026-04-25 19:50 EDT. Any agent with >200 LOC fs-side-effects refactor ships as a graph-node-adapter wrapper in v2.1; underlying refactor defers here.
- **Inventory:** TBD — populated by `migrations-and-agent-audit` agent (TA1) when the audit lands. Each entry should list: agent file path, LOC delta estimate, adapter pattern shipped (commit SHA), refactor ticket scope.
- **Resolution path:** v2.2 day-0 — pick up the inventory; refactor each agent in turn; remove the adapter wrappers.

## P3 — TD1 fixture-vs-live preflight drift (placeholder)

- **Source:** Handoff Issue 18 — TD1.preflight-and-stage1-schema captures both `preflight-log-fixture.md` and `preflight-log-live.md`. If divergent, production = reality on branch decision.
- **Status:** PLACEHOLDER until TD1 ships. If no drift observed, this row collapses to ✅ resolved with a one-line note. If drift observed, capture the divergence shape here for future regression-fixture maintenance.

## P4 — `.claude/plans/kb-upgrade-v2/METHODOLOGY-CORRECTION.md` redirect stub

- **Source:** Handoff Issue 1+2+20 lock — canonical home is `plans/kb-upgrade-v2/METHODOLOGY-CORRECTION.md`.
- **Owner:** TA1.migrations-and-agent-audit converts the .claude duplicate to a one-line redirect stub.
- **Status:** Pending TA1 dispatch. This row exists so a future contributor doing repo-wide content-search across `.claude/plans/` doesn't accidentally edit the stub thinking it's the canonical doc.

## P5 — Spawn-prompts spec defect: parallel-teams pattern incompatible with TeamCreate runtime

- **Source:** Discovered 2026-04-25 22:08 EDT during live Wave-1 dispatch. The spawn-prompts file `.claude/plans/team-spawn-prompts-v2.1.md` §"Dispatch order (canonical, copy-paste sequence)" instructs Bond to fire 4× `TeamCreate` + 21× `Agent` in ONE coordinator message ("Dispatch Wave 1 (4 teams, 21 agents — single message)"). Live dispatch hit the actual TeamCreate runtime constraint: **"A leader can only manage one team at a time. Use TeamDelete to end the current team before creating a new one."** Result: TA3 (`c1v-cloudrun-sidecar`) created and 4 agents spawned successfully; TA1 + TA2 + TD1 TeamCreate calls returned `Already leading team`; the 17 downstream Agent calls failed with `Team does not exist`.
- **Workaround applied (v2.1):** Sequential team dispatch via TeamCreate / TeamDelete cycle. Wave-A teams fire one-at-a-time: TA3 ships first (already in flight 2026-04-25 22:05 EDT), tag → TeamDelete → TA1 fires → tag → TeamDelete → TA2 fires → tag → TeamDelete → TD1 fires. Wave-B (TB1) gates on all four Wave-A tags as designed. Calendar slip: ~13-20 days vs the planned 8-12 (5-8 day delta). Within `David's "moving forward regardless of cost"` framing.
- **v2.2 resolution path — pick during v2.2 scope discussion:**
  - **(a) Sequential team dispatch via TeamCreate/TeamDelete cycle** (current v2.1 workaround formalized as the official pattern). Simplest. Loses parallelism budget.
  - **(b) Sub-coordinator pattern** — Bond spawns 4 child coordinator agents, each owning one team. Restores parallelism. Adds a coordination layer; needs verification that nested team-leadership works under the runtime.
  - **(c) Single-team-per-wave with all agents flat under one team_name** — e.g. one team `c1v-wave-a` with 21 agents directly. Loses the per-team verifier-tag granularity; tag matrix collapses to one wave-level tag. Simplest within the constraint but throws away the team-as-coordination-unit pattern.
- **Acceptance criterion:** v2.2 spawn-prompts file MUST replace the parallel-teams §"Dispatch order" section with the chosen pattern, AND include a smoke test: a single `TeamCreate` call followed by an immediate second `TeamCreate` call in the same message that DOES NOT fail (or, for option (a), an explicit comment that the second `TeamCreate` is expected to fail and is sequenced via `TeamDelete` polling).

## P6 — TA3 `synthesize-credits.test.ts` jest types regression

- **Source:** Live diagnostic surfaced 2026-04-25 22:11 EDT during TA3 dispatch. `synthesize-credits.test.ts` has 10 TypeScript errors `Cannot find name 'jest'` (lines 7-34) — `synthesis-api-routes` agent shipped a test file using `jest` global without the types installed/configured.
- **Resolution path:** TA3.verifier should catch this when it runs (jest test must compile + run). If not caught at verification, TA3.docs flags as a TODO. Likely fix: add `import { jest } from '@jest/globals'` OR ensure `@types/jest` is in tsconfig types array.
- **Status:** RESOLVED 2026-04-25 22:18 EDT. Root cause was IDE language-server lag, not real tsc failures. synthesis-api-routes' commit `6f73976` (jest-globals destructured imports + indirect-string route imports for `[id]` dynamic segments) made tests robust to single-file `tsc` invocations. Verifier confirmed `npx tsc --noEmit -p tsconfig.json` exits 0; my false-positive escalation was withdrawn. Captured as reinforcement in `feedback_tsc_over_ide_diagnostics.md` (T3 Wave-1 → TA3 Wave-A). The pattern (`@jest/globals` + indirect-route-import) should be the canonical convention for new test files; consider codifying in `apps/product-helper/__tests__/README.md` if not already there.

## P7 — Secondary migration-number collisions (non-blocking, surfaced by TA1.migrations-and-agent-audit)

- **Source:** TA1 EC-V21-A.0 audit 2026-04-25 22:31 EDT. While reconciling the 0011 collision, the audit agent identified two additional pre-existing same-number pairs:
  - `apps/product-helper/lib/db/migrations/0004_elite_naoko.sql` + `0004_v2_data_model_depth.sql`
  - `apps/product-helper/lib/db/migrations/0007_lively_selene.sql` + `0007_add_project_metadata.sql`
- **Why non-blocking now:** drizzle journal only tracks through 0007; 0008+ apply order is filesystem-driven. The 0004/0007 collisions are cosmetic at this point — both members of each pair already applied in production; rename would require coordinated production migration. Renaming retroactively would diverge journal state from disk state.
- **Resolution path (v2.2 day-0):** decide whether to (a) leave as-is (tolerated cosmetic; document in CLAUDE.md migration policy section), (b) rename both pairs in a single migration-housekeeping commit alongside a journal-update SQL, or (c) merge each pair logically (low risk but requires per-pair review).
- **Acceptance criterion:** v2.2 either picks (a) and adds an ADR, or picks (b)/(c) and ships the rename+journal commit before Wave E day-0. Either way, verifier can grep for duplicate migration numbers as a CI check going forward.

## P8 — `apps/product-helper/CLAUDE.md` lacks `kb-upgrade-v2` row

- **Source:** TA1 EC-V21-A.0 audit 2026-04-25 22:31 EDT. The TA1 spec at line 119 said the path-claim row to fix lives in `apps/product-helper/CLAUDE.md`. Disk verification showed the row actually lives in **root** `/Users/davidancor/Projects/c1v/CLAUDE.md` line 550 — `apps/product-helper/CLAUDE.md` has no `kb-upgrade-v2` reference at all.
- **Resolution path:** spawn-prompts spec correction for v2.2 — when documenting "edit CLAUDE.md" deliverables, specify which CLAUDE.md (root vs app-level). The repo has at least 3 CLAUDE.md files: root, `apps/product-helper/`, and `apps/c1v-identity/`.
- **Acceptance criterion:** v2.2 spawn-prompts file references the specific CLAUDE.md path on every "edit CLAUDE.md" deliverable.

---

## Cross-references

- v2.1 master plan: [`c1v-MIT-Crawley-Cornell.v2.1.md`](c1v-MIT-Crawley-Cornell.v2.1.md)
- v2.1 fix-up handoff: [`HANDOFF-2026-04-25-v2.1-fixup.md`](HANDOFF-2026-04-25-v2.1-fixup.md)
- v2.1 spawn prompts: [`.claude/plans/team-spawn-prompts-v2.1.md`](../.claude/plans/team-spawn-prompts-v2.1.md)
- v2.2 stub: [`c1v-MIT-Crawley-Cornell.v2.2.md`](c1v-MIT-Crawley-Cornell.v2.2.md)
- Wave-4 v2 backlog (separate): [`post-v2-followups.md`](post-v2-followups.md)
