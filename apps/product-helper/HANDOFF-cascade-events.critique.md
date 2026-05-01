# Engineering Handoff — Cascade Event Instrumentation
> Keywords: cascade-events, langgraph, observability, drizzle, meta-analyzer, project-artifacts, revision-log, instrumentation
Iteration: 1

## Summary

- Plan is well-structured, codebase claims verify (all 8 referenced files exist; wall comment at line 160-163 confirmed; `RevisionDelta` exists in `project-run-state.ts:44`).
- The technical approach is sound: instrument what's already nearly there, don't breach the "report-only" wall on `check_prd_spec`, defer auto-edit to Phase 5.
- Several drifts between §3 (SQL), §4 (TypeScript patches), and §6 (canonical schema) need reconciling before the engineer writes a line of code.
- Acceptance criteria are mostly good but several are unverifiable as written (idempotency claim contradicts append-only; perf budget not testable in the listed criteria).
- Critical environmental gap: CLAUDE.md notes `drizzle-kit migrate` is broken in this repo. Plan's Gap 1 acceptance assumes it works. Engineer will trip immediately.
- Recommend NOT splitting — this is one coherent feature delivered in 4 phases. Splitting loses the narrative.

---

## Issues Table of Contents

1. §3 / §4 — `RevisionDelta` is `interface`, not `type` (mechanical mismatch)
2. §4 Gap 1 vs §3 vs §6 — `triggered_by_event` enum has 5 values; canonical has 7 (drift)
3. §3 vs §6 — `corrective_edit` shape drift (flat SQL vs nested TS, no CHECK on `operation`)
4. §3 vs §6 — `outcome_after_edit` partial-fill semantics undefined
5. §4 Gap 2 — module-owner mapping unspecified
6. §4 Gap 2 — in-memory before/after diff has unbounded memory cost
7. §4 Gap 2 — `changed_by` (agent) vs `triggered_by_node` (graph node) conflation
8. §4 Gap 4 — append-only + idempotent are contradictory without content-addressed dedup
9. §4 Gap 4 — dedup key includes timestamp, which makes it not a dedup
10. §4 Gap 4 — placement "after `check_prd_spec`" misses late cascades
11. §4 Gap 4 — no-cascade case unspecified
12. §4 Gap 4 — meta-analyzer self-failure observability gap
13. §3 / §10 — Drizzle migrate command pinning + CLAUDE.md tooling reality
14. §5 — Phase 2 estimate is light (2 days → realistically 3–4)
15. §5 — "2-week, 1 engineer" + "Phase 1 || Phase 3 parallel" contradicts itself
16. §6 / §8 — Cascade fixture references a UI route, not extractable test data
17. §8 — No load/perf test for the <200ms budget claim
18. §8 — No LangSmith trace_id correlation captured
19. §3 (SQL) — RLS spec under-specified (cascade_events.run_id vs project_artifacts.organization_id chain)
20. New — No backpressure / write-rate plan for `cascade_events` inserts

---

## §2 — The Goal (definition of done)

No issues. The four definitions-of-done are crisp, falsifiable, and bounded.

---

## §3 — Current State (file map)

### Issue 1 — `RevisionDelta` is `interface`, not `type` (line 53 references)

Description:
The plan's Gap 1 patch (lines 71–84) declares `export type RevisionDelta = {…}`. The actual code at `lib/db/schema/project-run-state.ts:44` uses `export interface RevisionDelta {…}`. Applying the patch literally would refactor `interface → type`, which is unrelated noise. Reviewers may also reject the patch as out-of-scope.

Suggested Solution:
Match the existing form. The patch should extend the interface, not replace its declaration kind.

```typescript
// in lib/db/schema/project-run-state.ts (around line 44)
export interface RevisionDelta {
  module: string;
  from_revision: number;
  to_revision: number;
  changed_fields: string[];
  changed_by: string;
  reason: string;
  timestamp: string;
  // NEW (optional → no migration of existing rows)
  triggered_by_node?: string;
  triggered_by_event?: TriggerEventKind;
}

export type TriggerEventKind =
  | 'schema_violation'
  | 'readiness_gate'
  | 'llm_judge'
  | 'human_override'
  | 'exception'
  | 'validation_failure'
  | 'cascade';
```

---

## §4 — The Four Gaps

### Issue 2 — `triggered_by_event` enum drift (Gap 1, lines 81–82 vs §3 SQL line 124 vs §6 line 197)

Description:
The plan declares **three different enums** for the same concept:
- §4 Gap 1 (lines 81–82): 5 values (`validation_failure | schema_violation | llm_judge | human_override | cascade`)
- §3 SQL CHECK (line 124): 7 values (adds `readiness_gate`, `exception`)
- §6 canonical schema (line 197): 7 values (matches SQL)

A senior engineer reading the plan will get blocked deciding which is authoritative. The SQL/§6 form is correct; §4 is missing two values.

Suggested Solution:
Replace the inline literal in §4 Gap 1 with a reference to a single source of truth. Either:
- (a) Define the enum once in §6, reference it from §4 Gap 1 ("see §6 `failure_signal.kind`")
- (b) Define a shared TypeScript type (`TriggerEventKind`) and use it in both places

Apply the same enum to `cascade_events.failure_signal_kind` and `RevisionDelta.triggered_by_event` so they're literally the same set.

---

### Issue 3 — `corrective_edit` shape drift (Gap 3 lines 126–128 vs §6 lines 201–205)

Description:
Two different storage shapes for the same concept:
- §3 SQL: three flat columns `corrective_edit_op TEXT`, `corrective_edit_target TEXT`, `corrective_edit_spec JSONB`. **No CHECK constraint on `corrective_edit_op`.**
- §6 TypeScript: nested object `corrective_edit?: { operation, target, spec }` with `operation` constrained to a 6-value enum.

Risk: Phase 5 inserts an `operation` value not in the TS enum (e.g. typo `add_feedabck_edge`). DB happily stores it. TS layer crashes on read.

Suggested Solution:
Add a CHECK constraint to the SQL:
```sql
CHECK (corrective_edit_op IS NULL OR corrective_edit_op IN
  ('add_feedback_edge','insert_gate','reorder','split','merge','promote_state'))
```
Document the flat-vs-nested mapping explicitly: storage is flat (3 columns), domain model is nested (1 object). The Drizzle query helper should perform the assembly.

---

### Issue 4 — `outcome_after_edit` partial-fill semantics undefined (Gap 3 lines 129–131 vs §6 lines 206–210)

Description:
- §3 SQL: three nullable columns, independently fillable.
- §6 TypeScript: optional nested object; if present, all three keys are required.

What happens if Phase 5 inserts only `outcome_cascade_rate_delta` (knows the rate, not the wallclock)? SQL allows it. TS read fails (`wallclock_delta_seconds` is missing → object is malformed).

Suggested Solution:
Pick one semantic and document it:
- (a) **All-or-none**: enforce at write-time in the query helper (`if any of the 3 outcome cols are set, all 3 must be set`). Add a CHECK constraint mirroring this.
- (b) **Independent**: change §6 to make each sub-field individually optional (`outcome_after_edit?: { cascade_rate_delta?, wallclock_delta_seconds?, downstream_reruns_avoided? }`).

Recommend (a). Outcomes that arrive without all three components aren't comparable across runs.

---

### Issue 5 — Module-owner mapping unspecified (Gap 2 lines 95–98)

Description:
Gap 2's middleware decides whether a node modified "module Y's territory" by checking if the modifying node is "other than that module's primary owner." The plan never defines the node→module ownership map. Multiple nodes touch shared sub-objects (`extractedData.openQuestions.*` is written by M2 NFR emitter, M6 HoQ emitter, M8.b FMEA emitter, AND Wave-E `surface-gap` per CLAUDE.md). Without authoritative ownership, the middleware will either over-fire (every joint write logs a cascade) or under-fire (no node "owns" the field, no cascades recorded).

Suggested Solution:
Add a §4.5 "Node ↔ Module ownership" subsection. Inventory every node, declare its primary module(s) and read-only modules. Treat the ownership map as code (`lib/langchain/graphs/ownership.ts`) so it's enforceable, not prose.

```typescript
export const NODE_OWNERSHIP: Record<NodeName, { owns: ModuleId[]; reads: ModuleId[] }> = {
  intake_extract: { owns: ['M0','M1'], reads: [] },
  generate_artifact: { owns: ['M2','M3'], reads: ['M0','M1'] },
  // ...
};
```

The middleware reads this map. Tests assert that every node in `intake-graph.ts` appears in the ownership map (no missing entries).

---

### Issue 6 — In-memory before/after diff has unbounded memory cost (Gap 2 line 95)

Description:
The middleware "snapshot the current `extractedData`. On exit, diff against the snapshot." `extractedData` is a single JSONB blob containing M0–M2 intake state, NFR scratch, the open-questions ledger, and (in some flows) intermediate phase artifacts. For projects with deep intake, this is multi-MB. Cloning + diffing at every node entry/exit doubles memory pressure on the synthesizer worker.

Suggested Solution:
Three options, in order of preference:

1. **Hash-only**: snapshot SHA-256 of `JSON.stringify(extractedData)` per module key. On exit, hash again. Compare hashes. Only when a hash changes do you fetch the prior version from `project_artifacts` (where it's already content-addressed via `inputs_hash`) and diff.
2. **Path-only diff**: track which `extractedData.X.Y.Z` paths were written via a Proxy or accessor wrapper. No cloning of full state.
3. **Cloning** (current plan): use `structuredClone` and accept the cost. Quantify in Phase 2 acceptance: "memory delta per node call < 5MB p95."

Recommend (1). Aligns with the existing `inputs_hash` pattern and reuses `project_artifacts` as the diff substrate.

---

### Issue 7 — `changed_by` (agent) vs `triggered_by_node` (graph node) conflation (Gap 1 line 67)

Description:
Existing `RevisionDelta.changed_by` records the **agent** (e.g. `"extraction-agent"`, `"nfr-emitter"`). The new `triggered_by_node` records the **graph node** (e.g. `"generate_artifact"`, `"check_prd_spec"`). Multiple agents run inside one graph node. The plan does not state this clearly; engineers may assume the new field replaces the old, or treat them as the same.

Suggested Solution:
Add one sentence to Gap 1 explicitly:

> `triggered_by_node` ≠ `changed_by`. `changed_by` is the *agent name* that wrote the delta (preserved unchanged). `triggered_by_node` is the *LangGraph node* the agent was running inside, captured by the middleware. Both fields coexist; both have value.

---

### Issue 8 — Append-only + idempotent contradict each other (Gap 4 line 162)

Description:
§4 Gap 4 acceptance says "Idempotent on re-runs (uses `(run_id, upstream_node, downstream_node, timestamp)` as natural key for dedup)." But §4 Gap 3 says the table is **append-only**. You can't have both unless dedup happens before INSERT.

Two failure modes:
- (a) Idempotent at the application layer (SELECT first, INSERT only if not present): introduces a race condition; concurrent meta-analyzer runs against the same `run_id` insert duplicates.
- (b) Idempotent via UNIQUE constraint + ON CONFLICT DO NOTHING: works, but contradicts "append-only" framing.

Suggested Solution:
Resolve to (b) and rephrase: append-only means "no UPDATE / DELETE in the application layer." A UNIQUE constraint with ON CONFLICT DO NOTHING is compatible with that.

```sql
ALTER TABLE cascade_events
  ADD CONSTRAINT cascade_events_natural_key UNIQUE (run_id, upstream_state_hash, downstream_state_hash, failure_signal_kind);
```

(See Issue 9 for why the natural key should NOT include `timestamp`.)

---

### Issue 9 — Dedup key includes timestamp → no actual dedup (Gap 4 line 162)

Description:
`(run_id, upstream_node, downstream_node, timestamp)` is what the plan proposes. `timestamp` is `now()` at insert. Two re-runs of the meta-analyzer for the same run will produce different timestamps → both rows are inserted. The "natural key" prevents nothing.

Suggested Solution:
Use content-addressed identity:

```
(run_id, upstream_state_hash, downstream_state_hash, failure_signal_kind)
```

This is provably unique per logical cascade (same upstream artifact, same downstream artifact, same failure kind = same logical event) and is invariant across re-runs of the meta-analyzer.

---

### Issue 10 — Placement "after `check_prd_spec`" misses late cascades (Gap 4 line 152, line 160)

Description:
The plan says the meta-analyzer node is "downstream of `check_prd_spec` and outside any conditional path that affects the user-facing output." But cascade events can originate from terminal nodes (e.g. `synthesize_recommendation`) that run AFTER `check_prd_spec`. Placing the meta-analyzer immediately after `check_prd_spec` will miss those.

Suggested Solution:
Place meta-analyzer at the very end of the graph, as a final terminal node with no downstream consumers. Or run it as a post-graph hook (after `streamIntakeGraph` completes, before returning to the caller). Be explicit about which.

The doc should also assert: meta-analyzer must NEVER appear on the conditional-routing path. If the graph re-enters `check_prd_spec` for a re-validation loop, meta-analyzer must not fire on each iteration — only once at terminal.

---

### Issue 11 — No-cascade case unspecified (Gap 4 lines 154–157)

Description:
What does meta-analyzer do for a run that produced zero cascades? Insert nothing? Insert a sentinel row (`cascade_count = 0`)? Without a specification, the dashboard can't distinguish "no cascades" from "meta-analyzer never ran."

Suggested Solution:
Add a sibling table or a single sentinel row pattern:

- **Option A**: insert one row per run regardless, with a nullable cascade-detail. Cascade-free runs have `failure_signal_kind = 'none'` and no other fields populated. Pro: single-source dashboards. Con: pollutes the cascade table.
- **Option B**: a sibling `cascade_runs` table with one row per run, columns `(run_id, ran_at, cascades_detected_count)`. `cascade_events` only has rows for actual cascades. Pro: clean separation. Con: another table.

Recommend **B**. Keep `cascade_events` semantically pure.

---

### Issue 12 — Meta-analyzer self-failure observability gap (Gap 4 line 163)

Description:
"Failure of meta-analyzer never aborts the run (try/catch + log; this is observability, not load-bearing)." Correct stance, but: if meta-analyzer crashes silently for two weeks, no one notices because cascades aren't produced and the dashboard reads "0 cascades, you're great." This is the failure mode that loses the most data.

Suggested Solution:
Add to Phase 4 acceptance:
- Meta-analyzer wraps every step in try/catch and emits to **Sentry** with the synthesis run_id as a tag (so misses are visible)
- Alert on Sentry: "meta-analyzer error rate > 5% over 1h" pages oncall
- Dashboard surfaces "meta-analyzer healthy" indicator (last successful run < 1h ago)

---

## §5 — Phasing & Estimates

### Issue 14 — Phase 2 estimate is light (line 172)

Description:
Phase 2 (Middleware) is estimated at 2 days. The actual work: design the ownership map (Issue 5), write the Proxy or hash-based diff strategy (Issue 6), wrap every node in `intake-graph.ts` (currently ~19 nodes), thread the trigger-event derivation logic through validation gates, write unit tests for the diff logic, write integration tests against the cascade-fixture runs (Issue 16). Realistic: 3–4 days for a senior engineer who is new to this codebase.

Suggested Solution:
Update estimate to 3–4 days. Or — if the calendar pressure is real — split the integration-test work into a Phase 2.5 that can land after the unit-tested middleware merges.

---

### Issue 15 — "2 weeks, 1 engineer" + "Phase 1 || Phase 3 parallel" is contradictory (lines 4, 178)

Description:
Line 4 says "Estimated effort: 2 weeks for Phases 1–3; ongoing for Phase 4" and line 6 says "Owner on handoff: TBD" (singular). Line 178 says Phases 1 and 3 can be done in parallel. One engineer can't parallelize themselves.

Suggested Solution:
Pick one of:
- (a) Drop the parallel claim; serialize 1 → 2 → 3 → 4. New total: 8.5 days, fits in 2 weeks comfortably.
- (b) Allocate two engineers for Phases 1+3 (0.5 + 1 = 1.5 days). State that one engineer drops to Phase 2 after.

Recommend (a) for a single-owner handoff. Parallel work is an optimization the owner can choose; the plan shouldn't bake it in.

---

## §6 — Cascade Event Schema (canonical)

### Issue 18 — No LangSmith trace_id correlation captured

Description:
c1v uses LangSmith for synthesis tracing (per CLAUDE.md and `lib/observability/synthesis-metrics.ts`). Each cascade event has a corresponding LangSmith trace covering the upstream node's execution. Without a trace_id link, debugging a "why did this cascade fire?" question requires manual trace lookup by run_id + timestamp range.

Suggested Solution:
Add to the schema:
```
upstream_trace_id  TEXT  -- LangSmith run id of the upstream node execution
downstream_trace_id TEXT -- LangSmith run id of the downstream node that triggered the cascade
```
Captured by the middleware in Gap 2 (LangSmith provides `runId` in the callback context). Optional/nullable for backward compatibility.

---

## §7 — Open Decisions

No issues. The five decisions are exactly the right ones to escalate — privacy / dedup-window / dashboard surface / backfill / diff-library are non-engineering judgment calls.

---

## §8 — Testing Strategy

### Issue 16 — Cascade fixture references a UI route, not extractable test data (line 240)

Description:
"Use the same input that produced those (check `__tests__/` for fixtures or ask the owner) as the integration-test input." But §1 line 9 references the methodology paper at `/about/methodology` — a UI route at `app/(dashboard)/about/methodology/page.tsx`, not a markdown the engineer can grep. The engineer must either render the page in a browser, copy the input string, and paste, or ask the owner. That's friction the handoff is supposed to eliminate.

Suggested Solution:
Extract the three documented cascade inputs into a versioned fixture:
```
apps/product-helper/lib/__tests__/fixtures/cascade-fixtures.ts
```
Each fixture: `{ input: string, expected_cascades: CascadeEvent[] }`. Reference this file from §8, not the UI route. The methodology-page can `import` the same fixtures so docs and tests stay in sync.

---

### Issue 17 — No load/perf test for the <200ms budget claim (line 237)

Description:
§8 line 237: "Meta-analyzer node adds < 200ms p95 to total synthesis latency." This is asserted but not in any acceptance criterion. Phase 4 acceptance (§4 Gap 4 lines 159–163) lists 4 criteria; none reference the perf budget.

Suggested Solution:
Add to §4 Gap 4 acceptance:
- Performance test: 100 synthesis runs with meta-analyzer enabled vs disabled. p95 latency delta < 200ms. Check in `lib/observability/synthesis-metrics.ts` for the existing latency capture mechanism.

---

## §10 — First Day Checklist

### Issue 13 — Drizzle migrate command pinning + CLAUDE.md tooling reality (line 87)

Description:
Gap 1 acceptance line 87 says "Drizzle: `pnpm db:generate && pnpm db:migrate` or your team's equivalent — confirm in `drizzle.config.ts`." But CLAUDE.md `# Project Notes` line states: *"`drizzle-kit migrate` is broken (duplicate 0004 migrations). Use manual SQL or Supabase SQL Editor for migrations."* The new engineer will run `pnpm db:migrate`, hit the broken state, and lose hours.

Suggested Solution:
Update §10 First Day Checklist to read:
> 4. Apply migrations following the convention used by recent migrations (e.g. `0013_project_run_state.sql` shipped via Supabase SQL Editor — see `apps/product-helper/lib/db/migrations/`). `drizzle-kit migrate` is broken on this repo; do not use it.

Update §4 Gap 1 acceptance line 87 to match.

---

## §11 — Why This Matters

No issues. This paragraph is appropriately positioned and serves its purpose (motivation for engineer who'll be heads-down for 2 weeks).

---

## New issues (not aligned to a plan chapter)

### Issue 19 — RLS spec under-specified for `cascade_events`

Description:
§4 Gap 3 line 146 says "RLS policies match the pattern used by `project_artifacts` (project-scoped read; service role write)." But `project_artifacts` uses a chain: `project_id → projects.organization_id → session role`. The proposed `cascade_events` schema has `run_id REFERENCES projects(id)` directly. Without an explicit policy, an engineer copying the `project_artifacts` policy verbatim may end up with a policy that references a column that doesn't exist on `cascade_events`.

Memory note from past work (per CLAUDE.md): the `projects` table has RLS enabled but **zero tenant policies** — EXISTS gates from non-owner roles return 0 rows. This is documented as an open issue (P3 security pass in `plans/post-v2-followups.md`). The cascade_events RLS will inherit this brokenness.

Suggested Solution:
Two options:
- (a) Write the explicit policies in the plan (SELECT / INSERT) using the `project_id → organization_id` chain, mirroring `project_artifacts` but adapted for `run_id` semantics.
- (b) Acknowledge the projects-RLS gap as a known issue and gate Phase 3 on `projects` getting tenant policies first.

Recommend (a) for now, with a footnote pointing at the projects-RLS backlog item.

---

### Issue 20 — No backpressure / write-rate plan for `cascade_events` inserts

Description:
Every node in a synthesis run can produce cascades. Multi-tenant production with 50 concurrent synthesis runs × 19 nodes × multiple cascades per node × meta-analyzer batch insert = potentially hundreds of cascade rows per minute. The plan has no batching, buffering, or rate-cap discussion.

Suggested Solution:
Phase 4 acceptance addition:
- Meta-analyzer accumulates cascade rows in-memory during graph execution and inserts as a single `INSERT ... VALUES (...), (...), ...` at terminal time, rather than per-cascade INSERT.
- Document expected steady-state write rate in observability (e.g. "expected 5–20 cascade_events rows per synthesis run").
- Add an alert if any single run produces > 100 cascade rows (probably indicates an instrumentation bug, not real cascades).

---

## Recommendation: do NOT split this plan

This plan delivers a single coherent story (instrument cascade events, observe them, prepare for Phase 5 meta-agent). The four phases are sequential dependencies for one feature, not independent tasks. Splitting into separate plans would lose the narrative + force redundant context-loading per phase. Keep as one plan, fix the issues above before starting Phase 1.

---

*Configuration note: `.claude/plan-critique-config.json` does not exist in this repo. The skill expects a `plansFolder` to be configured. This critique was written directly to the plan's directory (`apps/product-helper/HANDOFF-cascade-events.critique.md`). For future iterations, run `/plan-create` once to set up the plansFolder convention, then move this file into `[plansFolder]/cascade-event-instrumentation/critique.md`.*
