# Post-v2.1 follow-ups

> **Created:** 2026-04-25 — during v2.1 spawn-prompts fix-up sweep per `plans/HANDOFF-2026-04-25-v2.1-fixup.md`.
> **Purpose:** Items intentionally deferred from v2.1 (Waves A + B + D) and carried forward to v2.2 (Waves C + E) or later. Distinct from `plans/post-v2-followups.md` (Wave-4 v2 closeout backlog).
> **Owner:** Bond seeds; v2.2 day-0 inventory pass picks up.

---



## P2 — Deferred fs-side-effects refactors >200 LOC (R-v2.1.A Option C carryover)

- **Source:** R-v2.1.A Option C ruling 2026-04-25 19:50 EDT. Any agent with >200 LOC fs-side-effects refactor ships as a graph-node-adapter wrapper in v2.1; underlying refactor defers here.
- **Inventory:** TBD — populated by `migrations-and-agent-audit` agent (TA1) when the audit lands. Each entry should list: agent file path, LOC delta estimate, adapter pattern shipped (commit SHA), refactor ticket scope.
- **Resolution path:** v2.2 day-0 — pick up the inventory; refactor each agent in turn; remove the adapter wrappers.

## P3 — TD1 fixture-vs-live preflight drift (placeholder)

- **Source:** Handoff Issue 18 — TD1.preflight-and-stage1-schema captures both `preflight-log-fixture.md` and `preflight-log-live.md`. If divergent, production = reality on branch decision.
- **Status:** PLACEHOLDER until TD1 ships. If no drift observed, this row collapses to ✅ resolved with a one-line note. If drift observed, capture the divergence shape here for future regression-fixture maintenance.

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
