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

---

## Cross-references

- v2.1 master plan: [`c1v-MIT-Crawley-Cornell.v2.1.md`](c1v-MIT-Crawley-Cornell.v2.1.md)
- v2.1 fix-up handoff: [`HANDOFF-2026-04-25-v2.1-fixup.md`](HANDOFF-2026-04-25-v2.1-fixup.md)
- v2.1 spawn prompts: [`.claude/plans/team-spawn-prompts-v2.1.md`](../.claude/plans/team-spawn-prompts-v2.1.md)
- v2.2 stub: [`c1v-MIT-Crawley-Cornell.v2.2.md`](c1v-MIT-Crawley-Cornell.v2.2.md)
- Wave-4 v2 backlog (separate): [`post-v2-followups.md`](post-v2-followups.md)
