# Engineering Handoff — Cascade Event Instrumentation

**Audience:** Senior software engineer or systems AI engineer (Staff+)
**Estimated effort:** 2 weeks for Phases 1–3; ongoing for Phase 4
**Owner on handoff:** TBD
**Author:** David Ancor
**Date:** 2026-05-01
**Related artifacts:**
- Methodology paper (live): `/about/methodology` route in this app
- Position paper outline: `../../c1v-project-admin-main/position-paper-outline.md`
- Strategic context: `../../c1v-project-admin-main/beyond-the-harness.md`
- Field vocabulary: `../../c1v-project-admin-main/harness-engineering.md`

---

## 1. Context (read this first — 3 minutes)

c1v is a multi-agent system that produces complete systems-engineering artifact sets (actors, FFBD, N², QFD, FMEA, decision networks, architecture recommendation) from a one-line product brief. It is built on LangGraph with a 19-node DAG (`lib/langchain/graphs/intake-graph.ts`).

**The thesis driving this work:** beyond model weights (RLHF) and prompts (DSPy), the orchestration topology itself can be optimized. *Cascade events* — moments where a downstream stage forces an upstream stage to redo work — are dense, cheap, interpretable labels for which hand-offs in the graph need correction. We want to instrument them automatically so we can build a dataset, then a meta-agent that proposes topology edits.

**The current pipeline already records most of what we need.** It tracks per-module revision counters, an append-only revision log with `changed_fields` and `reason`, content-addressed `inputs_hash` on every artifact, and a tamper-detection chain on decision audits. It does **not** record:

1. **Causal back-link** — which downstream node forced an upstream revision
2. **Structured content diff** — only field names, not values, are captured
3. **Append-only `cascade_events` table** — nothing aggregates the above into the position-paper schema
4. **A consumer** — nothing reads the log to surface patterns or propose edits

This handoff is the work to close gaps 1–3 and stand up gap 4 as a reporting-only node (no auto-edits in scope).

---

## 2. The Goal (definition of done)

After this work ships, every production run of the c1v pipeline will:

1. Emit one `cascade_events` row per detected upstream-redo, conforming to the schema in §6
2. Populate the causal back-link (`triggered_by_node`) so cascade chains are reconstructible
3. Compute a structural content diff between the prior and new artifact revisions
4. Surface cascade patterns in a basic dashboard (top cascade-prone hand-offs across last N runs)

We are **not** in scope for: meta-agent that proposes topology edits, automatic graph mutation, A/B testing infrastructure for topology experiments. Those are Phase 5+ and require this work to land first.

---

## 3. Current State (file map)

| Concern | File | Lines | Notes |
|---|---|---|---|
| LangGraph DAG definition | `lib/langchain/graphs/intake-graph.ts` | 38–76, 452–551 | 19 nodes, edges, conditional routing |
| Validation gate (only evaluator) | `lib/langchain/graphs/nodes/check-prd-spec.ts` | 120–177, 268–288 | **Wall comment at lines 161–163: "validates and reports — does NOT advance"** — preserve this discipline; meta-analyzer is a NEW node, not a modification |
| Revision counters per module | `lib/db/schema/project-run-state.ts` | `module_revisions` JSONB field | `{M1: 3, M2: 1, ...}` |
| Revision log (the seed of the cascade log) | `lib/db/schema/project-run-state.ts` | `revision_log` JSONB field, `RevisionDelta` type | Already captures `module, from_revision, to_revision, changed_fields, changed_by, reason, timestamp` |
| Content-addressed artifact storage | `lib/db/schema/project-artifacts.ts` | Whole file | Append-only, multiple rows per (project_id, kind), each with `inputs_hash` |
| Per-decision audit chain | `lib/db/schema/decision-audit.ts` + `lib/langchain/engines/audit-writer.ts` | Whole files | Hash-chain with `hash_chain_prev` for tamper detection |
| Synthesis observability | `lib/observability/synthesis-metrics.ts` | 1–250 | Per-node latency, tokens, cost — useful for `outcome_after_edit` later |
| Wave-E evaluator (sensor-class taxonomy) | `lib/langchain/engines/wave-e-evaluator.ts` | 1–168 | Tri-state `ready / needs_user_input / failed` — maps directly to `failure_signal.kind` |

**Key architectural rule to preserve:** `check_prd_spec` validates and reports but does NOT modify upstream state or trigger upstream re-execution (lines 161–163). This wall is deliberate — it prevents accidental loops. The cascade-event work adds a *new* observation surface (the `meta-analyzer` node, read-only). It does **not** breach that wall.

---

## 4. The Four Gaps (and what closes each)

### Gap 1 — Causal back-link missing on `RevisionDelta`

**Today:** `RevisionDelta` records `changed_by` (agent name or user) but not which downstream node *forced* the upstream module to revise.

**Closing patch:** add two optional fields to `RevisionDelta` in `lib/db/schema/project-run-state.ts`:

```typescript
export type RevisionDelta = {
  module: string;
  from_revision: number;
  to_revision: number;
  changed_fields: string[];
  changed_by: string;
  reason: string;
  timestamp: string;
  // NEW
  triggered_by_node?: string;
  triggered_by_event?: 'validation_failure' | 'schema_violation' | 'llm_judge' | 'human_override' | 'cascade';
};
```

**Acceptance criteria:**
- Schema migration generated and applied (Drizzle: `pnpm db:generate && pnpm db:migrate` or your team's equivalent — confirm in `drizzle.config.ts`)
- Existing rows backfilled with `triggered_by_node = NULL` (acceptable; treat as unknown)
- TypeScript compiles cleanly across the codebase

### Gap 2 — Middleware to populate the back-link

**Today:** Nodes write back to `extractedData` for upstream module territory, but the system does not record which node did the writing.

**Closing patch:** middleware decorator on every node in `intake-graph.ts`. On node entry, snapshot the current `extractedData`. On exit, diff against the snapshot. For any module's territory that was modified by a node *other than* that module's primary owner, append a `RevisionDelta` to `revision_log` with:
- `module` = the modified module
- `triggered_by_node` = current node's name
- `triggered_by_event` = derived from how the modification happened (validation gate fail → `validation_failure`, schema reject → `schema_violation`, etc.)

**Implementation note:** the cleanest place is a wrapper at the LangGraph node-registration site in `intake-graph.ts:38-76`. Wrap each `addNode(name, fn)` call so `fn` becomes `withCascadeMiddleware(name, fn)`.

**Acceptance criteria:**
- Unit tests assert that when node X modifies module Y's territory, a `RevisionDelta` with `triggered_by_node = X` appears in `revision_log`
- Integration test: run a known cascade-producing input through the pipeline (the c1v methodology paper's three failure modes are reproducible — see §5 of that paper); assert at least one `RevisionDelta` per known cascade is recorded with the correct `triggered_by_node`
- No regressions in existing pipeline tests

### Gap 3 — `cascade_events` table

**Today:** Aggregating revision data into the position-paper schema requires client-side joins.

**Closing patch:** new append-only Postgres table:

```sql
CREATE TABLE cascade_events (
  event_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id            UUID NOT NULL REFERENCES projects(id),
  timestamp         TIMESTAMPTZ NOT NULL DEFAULT now(),
  upstream_node     TEXT NOT NULL,
  upstream_artifact_kind TEXT NOT NULL,
  upstream_state_hash    TEXT NOT NULL,    -- sha256, content-addressed
  downstream_node   TEXT NOT NULL,
  downstream_state_hash  TEXT NOT NULL,
  failure_signal_kind    TEXT NOT NULL CHECK (failure_signal_kind IN
    ('schema_violation','readiness_gate','llm_judge','human_override','exception','validation_failure','cascade')),
  failure_signal_detail  TEXT,
  corrective_edit_op     TEXT,             -- nullable Phase 1; populated by meta-analyzer in Phase 4
  corrective_edit_target TEXT,
  corrective_edit_spec   JSONB,
  outcome_cascade_rate_delta     DOUBLE PRECISION,
  outcome_wallclock_delta_seconds DOUBLE PRECISION,
  outcome_downstream_reruns_avoided INTEGER,
  labeler           TEXT NOT NULL CHECK (labeler IN ('human','meta_agent','deterministic_check')),
  vertical          TEXT NOT NULL DEFAULT 'system_design',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cascade_events_run_id ON cascade_events(run_id);
CREATE INDEX idx_cascade_events_upstream_downstream ON cascade_events(upstream_node, downstream_node);
CREATE INDEX idx_cascade_events_timestamp ON cascade_events(timestamp DESC);
```

**Acceptance criteria:**
- Drizzle schema definition in `lib/db/schema/cascade-events.ts` matches the SQL above
- Drizzle migration generated and applied
- Append-only enforced at the query layer (no UPDATE / DELETE helpers in `lib/db/queries/cascade-events.ts`)
- RLS policies match the pattern used by `project_artifacts` (project-scoped read; service role write)

### Gap 4 — `meta-analyzer` node (read-only Phase 4)

**Today:** Nothing consumes `revision_log` or `cascade_events`.

**Closing patch:** new node in the graph, downstream of `check_prd_spec` and outside any conditional path that affects the user-facing output. Its job in this phase:

1. Read all `RevisionDelta` entries written during this run that have `triggered_by_node` populated
2. For each, fetch `(artifact_v_n, artifact_v_n+1)` from `project_artifacts` and compute a structural diff (use `microdiff` or `jsondiffpatch` — pick one, document the choice)
3. Insert one `cascade_events` row per detected cascade, with `labeler = 'deterministic_check'` and `corrective_edit_*` fields NULL (those come in Phase 5)
4. Surface a summary in the synthesis observability log: `"Detected N cascades this run; top hand-off: M5→M3"`

**Acceptance criteria:**
- Node added to `intake-graph.ts` after `check_prd_spec`, before terminal nodes
- Node never modifies `extractedData` or any upstream state (preserves the wall from §3)
- Idempotent on re-runs (uses `(run_id, upstream_node, downstream_node, timestamp)` as natural key for dedup)
- Failure of meta-analyzer never aborts the run (try/catch + log; this is observability, not load-bearing)

---

## 5. Phasing & Estimates

| Phase | Gap | Estimate (senior eng) | Blocking? |
|---|---|---|---|
| 1 | Schema patch (Gap 1) | 0.5 day | Blocks 2 |
| 2 | Middleware (Gap 2) | 2 days | Blocks 4 |
| 3 | `cascade_events` table (Gap 3) | 1 day | Blocks 4 |
| 4 | `meta-analyzer` node (Gap 4) | 5–7 days | — |
| **Total Phase 1–4** | | **~2 weeks** | |
| 5 (out of scope here) | Topology-edit proposer | 4–6 weeks | Requires n=10+ dataset from Phase 4 |

Phases 1 and 3 can be done in parallel. Phase 2 must follow Phase 1. Phase 4 must follow Phases 2 and 3.

---

## 6. Reference: Cascade Event Schema (canonical)

This is the shape every `cascade_events` row must conform to. It mirrors §4 of the position-paper outline; keep them in sync if you modify either.

```typescript
type CascadeEvent = {
  event_id: string;                       // UUID
  run_id: string;                         // foreign key to projects.id
  timestamp: string;                      // ISO-8601
  upstream_node: string;                  // e.g. "M3"
  upstream_artifact_kind: string;         // e.g. "fmea_early_v1"
  upstream_state_hash: string;            // sha256 from project_artifacts.inputs_hash
  downstream_node: string;
  downstream_state_hash: string;
  failure_signal: {
    kind: 'schema_violation' | 'readiness_gate' | 'llm_judge'
        | 'human_override' | 'exception' | 'validation_failure' | 'cascade';
    detail?: string;
  };
  corrective_edit?: {                     // Phase 4: NULL; Phase 5: populated by meta-agent
    operation: 'add_feedback_edge' | 'insert_gate' | 'reorder' | 'split' | 'merge' | 'promote_state';
    target: string;
    spec: string | object;
  };
  outcome_after_edit?: {                  // Phase 5+
    cascade_rate_delta: number;
    wallclock_delta_seconds: number;
    downstream_reruns_avoided: number;
  };
  labeler: 'human' | 'meta_agent' | 'deterministic_check';
  vertical: string;                       // default 'system_design'
};
```

---

## 7. Open Decisions to Escalate to Owner

These are choices the engineer should *not* make alone. Surface them after reading the code, before writing it.

1. **Diff library.** `microdiff` (smaller, simpler) vs `jsondiffpatch` (richer output, larger). Recommend `microdiff` for Phase 4; revisit if Phase 5 needs richer signal. **Decision needed before Phase 4 starts.**
2. **Cascade dedup window.** If the same upstream-downstream pair cascades twice in one run, is that two events or one? Recommend two (preserves count); confirm with owner.
3. **Privacy / data governance.** `cascade_events` rows contain artifact state hashes and node names. They do **not** contain user PII directly, but `failure_signal_detail` could. Confirm with owner whether to restrict free-text in `failure_signal_detail` to controlled vocabulary, or to scrub before insert.
4. **Dashboard surface.** Phase 4 spec says "surface a summary in observability log." Owner may want a UI panel in the synthesis dashboard. Out of scope here unless explicitly added.
5. **Backfill of historical runs.** Existing `revision_log` data does not have `triggered_by_node`. Decision: leave historical as `NULL` (current plan) or attempt heuristic backfill? Recommend leave; the n=10 dataset starts from Phase 4 ship date.

---

## 8. Testing Strategy

| Layer | Coverage required |
|---|---|
| Unit | Middleware diff logic, schema validators, dedup key generation |
| Integration | Run a known cascade-producing intake through the pipeline; assert `cascade_events` table rows match expected count and structure |
| Regression | Existing pipeline tests must pass unchanged |
| Performance | Meta-analyzer node adds < 200ms p95 to total synthesis latency (it runs after `check_prd_spec`, off the critical path) |
| Observability | Sentry / Pino logs include cascade detection counts per run |

**Reproducible cascade fixture:** the c1v methodology paper documents three concrete cascade events from a real self-application run (M4 premature scoring, M5 EC underspecification, M7 terminal-FMEA). Use the same input that produced those (check `__tests__/` for fixtures or ask the owner) as the integration-test input; expected output is ≥3 `cascade_events` rows with the documented upstream/downstream pairs.

---

## 9. Out of Scope (do not gold-plate)

- Meta-agent that *proposes* topology edits (Phase 5)
- Automatic graph mutation or feature-flagged A/B of topologies
- Cross-vertical generalization (this is the system-design vertical only)
- UI changes beyond an optional log line
- LLM-as-judge sensor implementation (separate work; tracked elsewhere)
- Backfill of historical `revision_log` data into `cascade_events`

If any of these become tempting during implementation, stop and check with the owner.

---

## 10. First Day Checklist

1. Read this document end to end (~30 min)
2. Read `lib/langchain/graphs/intake-graph.ts` and `lib/langchain/graphs/nodes/check-prd-spec.ts` (~45 min)
3. Read `lib/db/schema/project-run-state.ts` and `lib/db/schema/project-artifacts.ts` (~30 min)
4. Run the existing test suite (`pnpm test` or your team's equivalent); confirm green baseline
5. Run a sample synthesis end-to-end locally; trace one node's invocation through `synthesis-metrics.ts` to understand the observability surface
6. Open a thread with the owner on the five decisions in §7 before writing any code
7. Start Phase 1 (schema patch) — smallest possible change, lowest risk, unblocks Phase 2

---

## 11. Why This Matters (one paragraph for context — read on day one)

This work converts an existing audit log into a research-grade dataset that demonstrates a novel claim: that multi-agent orchestration topologies can be optimized using inter-stage cascade events as a gradient signal — without a learned reward model and without retraining the underlying LLM. The c1v product already runs in production. The methodology paper at `/about/methodology` is the n=3 hand-labeled proof of concept. After this work ships, every production run becomes a labeled training example. After 10 runs, we have a dataset. After 100, we have a meta-agent. After 1,000, we have a paper at NeurIPS or ICLR. This handoff is the bridge from product to research without breaking the product.

The technical work is small. The strategic leverage is large. Treat it accordingly.
