---
schema: phase-file.v1
phase_slug: phase-4-start-end-conditions
module: 2
artifact_key: module_2/phase-4-start-end-conditions
engine_story: m2-requirements
engine_path: apps/product-helper/.planning/engines/m2-requirements.json
fail_closed_audit: plans/v22-outputs/te1/fail-closed-audit.md#module-2-requirements
fail_closed_registry: apps/product-helper/lib/langchain/engines/fail-closed-runner.ts
kb_chunk_refs: []
legacy_snapshot: apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_legacy_2026-04-26/2-requirements/01-phase-docs/07-Phase-4-Start-End-Conditions.md
rewritten_at: 2026-04-27
rewritten_by: kb-rewrite (Wave-E γ-shape, EC-V21-E.9)
---
# Phase 4: Start and End Conditions

## §1 Decision context

This phase contributes to **m2-requirements** decisions. Runtime resolution flows through:

1. ContextResolver loads upstream artifacts + intake state.
2. NFREngineInterpreter evaluates predicates from `apps/product-helper/.planning/engines/m2-requirements.json` against EvalContext.
3. On match → auto-fill (clamped to `auto_fill_threshold`); on no match → fallback (§3); on still-no-match → STOP-GAP gate (§4) blocks proceed.

The legacy educational body (preserved in this file under the "Educational content" footer) explains *why* this phase exists. The runtime *what* lives in the engine.json + fail-closed registry referenced below.

## §2 Predicates (engine.json reference)

- **Engine story:** `m2-requirements` (`apps/product-helper/.planning/engines/m2-requirements.json`)
- **Predicate DSL evaluator:** `apps/product-helper/lib/langchain/engines/predicate-dsl.ts`
- **Story-tree schema:** `apps/product-helper/lib/langchain/schemas/engines/story-tree.ts`
- **Decisions consumed by this phase:** see `decisions[]` in the engine.json keyed on `target_field` containing `phase-4-start-end-conditions` or by manual mapping in the story tree.

> Predicates are NOT inlined here. The engine.json is the source of truth; this markdown points at it.

## §3 Fallback rules

When no predicate in §2 matches:

1. `searchKB` retrieves top-3 chunks scoped to `{module: 2, phase: phase-4-start-end-conditions}` (post-G8/G9 ingest).
2. If `searchKB` confidence < 0.90 OR returns zero chunks → `surfaceGap` emits `needs_user_input` to `system-question-bridge.ts` with computed_options + math_trace.
3. User answer re-enters the loop at ContextResolver.

> Fallback contract is shared across all phase files. Per-phase override (if any) is documented in the educational body below.

## §4 STOP-GAP rules (machine-readable)

- **artifact_key:** `module_2/phase-4-start-end-conditions`
- **registry:** `apps/product-helper/lib/langchain/engines/fail-closed-runner.ts` (`buildFailClosedRegistry`)
- **schema:** `apps/product-helper/lib/langchain/schemas/engines/fail-closed.ts` (`failClosedRuleSetSchema`)
- **audit doc (rule sources + severity):** [plans/v22-outputs/te1/fail-closed-audit.md](../../../../../../plans/v22-outputs/te1/fail-closed-audit.md#module-2-requirements)

The STOP-GAP / Validation-Checklist text in the legacy educational body below has been audited by `engine-fail-closed` and converted into machine-readable rules registered under the `artifact_key` above. The runner default-FAILs if the artifact_key is queried with no rule set registered (conservative).

> Default severity is `error` (proceed-blocking). Only items phrased "advisory" / "soft check" / "warning" / "will NOT fail" are downgraded to `warn`.

## §5 Math derivation

This phase's quantitative outputs (if any) carry `mathDerivationSchema` (or `mathDerivationMatrixSchema` for M5 sites per TC1 `tc1-wave-c-complete`). Each derivation:

- references inputs by `source` (upstream artifact + field path);
- carries `formula` (LaTeX-safe ASCII) + `units` + `computed_value`;
- attaches `base_confidence` + `confidence_modifiers` consumed by NFREngineInterpreter step 6.

> Per-decision math traces are emitted into `decision_audit` (`0011b_decision_audit.sql`) on every Scoring pass per EC-V21-E.3 (audit-writer agent).

## §6 References (KB chunk IDs)

- **Frontmatter `kb_chunk_refs`:** populated by the embedding pipeline (`engine-pgvector` agent, G8/G9 — `apps/product-helper/lib/langchain/engines/kb-embedder.ts`).
- **Runtime retrieval:** `searchKB(query, top_k, { module: 2, phase: 'phase-4-start-end-conditions' })` over the `kb_chunks` table (`0011a_kb_chunks.sql`, ivfflat lists=100; HNSW upgrade gated on `>10k` rows).
- **Provenance:** every retrieved chunk carries `{kb_source, chunk_hash, content, embedding_distance}`; rendered by `why-this-value-panel.tsx` (`provenance-ui` agent).

> The `kb_chunk_refs` array in frontmatter is left empty until the embedder backfills it. The runtime path does not depend on the static array — it queries the live table.

---

## Educational content (legacy, preserved)

> The body below is the pre-Wave-E text verbatim. It documents *why* this phase exists, the systems-engineering theory behind the prescribed steps, and the example-driven walkthroughs the LLM (and human readers) consume. The 6 sections above are the schema-first overlay locked by Wave-E γ-shape.

> Corresponds to Steps 4 and 5 of the UCBD Checklist.

## Knowledge

Every UCBD has a clear **entry state** and **exit state**. These are the boundary of the use case — what must be true before it begins, and what is true once it completes. Getting these right is the difference between a UCBD that's 20 steps (right) and one that's 100 steps (because it silently absorbed setup and teardown).

### Initial Conditions

Things that must be true *before* step 1 happens. Each condition is a verifiable state — not an action.

| Good (state) | Bad (action) |
|--------------|--------------|
| Customer is authenticated | Customer logs in |
| Cart contains at least one item | Customer adds items to cart |
| System is online and healthy | System starts up |
| Customer has a valid payment method on file | Customer enters payment info |

**Test:** can you write a boolean function `isInitialConditionMet()` that returns true/false without performing any action? If yes, it's a state. If it requires work, it's an action — and that action belongs *inside* the step flow (or, more commonly, in an earlier use case).

### Why "state not action" matters

If initial conditions include actions, you're doubling the scope of the use case. Example:

- Wrong: "Customer logs in" as initial condition for **checkout** → now your UCBD must cover login, payment entry, etc. — which are their own use cases.
- Right: "Customer is authenticated" as initial condition → login happens in UC_auth; checkout depends on it; clean separation.

### Ending Conditions

Things that are true *after* the use case completes. Can be either:

1. **Stable ending** — the system and actors settle into a persistent state. Example: "Order is persisted; customer has confirmation."
2. **Transitional ending** — the use case hands off to another use case by producing its initial conditions. Example (from a "place order" use case): "Order is queued for fulfillment" → initial condition for "fulfill order" use case.

Both are valid. Transitional endings are common in pipelines; mark them with a note explaining the handoff.

### Conditions for multiple actors

Initial and ending conditions can apply to any actor, not just the system. Valid examples:

- "Customer has email client accessible" (actor state)
- "Payment Gateway is reachable" (other-actor state)
- "System has current product catalog loaded in memory" (system state)

Write them as flat numbered lists — the UCBD template doesn't separate by actor.

### Template constraints (schema-level)

From `UCBD_Template_and_Sample.schema.json`:

- `initial_conditions`: **2 slots** (rows 23–24). If you need >2, emit an insertion hint.
- `ending_conditions`: **1 slot** visible (row 43). If you need >1, emit an insertion hint.

If you find yourself needing many conditions (>4), it's usually a sign the use case is too broad. Consider splitting or pushing conditions into prerequisite use cases.

## Input Required

- The Phase-3 output UCBD JSON (metadata + columns + notes)
- The specific use case semantics (user-supplied or derivable from `system_context_summary`)

## Instructions for the LLM

1. **Brainstorm initial conditions.** For each column (primary actor, system, other actors), ask: "What must be true about this actor before step 1 fires?"
2. **Filter to states, not actions.** Apply the `isInitialConditionMet()` test.
3. **Deduplicate and minimize.** A UCBD typically has 2–4 initial conditions. More than 4 → split the use case or push conditions into a prerequisite use case.
4. **Brainstorm ending conditions.** Ask: "When this use case completes successfully, what is true?"
5. **Distinguish stable vs transitional endings.** Add a note if transitional.
6. **Emit the updated UCBD JSON** with `initial_conditions` and `ending_conditions` populated.

## Output Format

```json
{
  "_schema": "UCBD_Template_and_Sample.schema.json",
  "_output_path": "<project>/module-2-requirements/ucbd/UC01-customer-checkout.ucbd.json",
  "_phase_status": "phase-4-complete",

  "metadata": { /* from Phase 3 */ },
  "use_case_name": "Customer completes checkout",
  "_columns_plan": { /* from Phase 3 */ },

  "initial_conditions": [
    "1. Customer is authenticated (established by UC00-Authenticate).",
    "2. Cart contains at least one item and inventory is confirmed available.",
    "3. System is online and Payment Gateway is reachable."
  ],

  "actor_steps_table": [],

  "ending_conditions": [
    "1. Order record is persisted and has a unique Order ID.",
    "2. Customer has received an on-screen confirmation with the Order ID.",
    "3. An order-fulfillment event has been emitted (transitional → triggers UC08-FulfillOrder)."
  ],

  "notes": [
    "1. This UCBD covers only credit-card checkout; gift-card and BNPL are UC02 and UC06 respectively.",
    "2. Assumes customer is authenticated — enforced by UC00 (Authenticate Customer).",
    "3. Out of scope: abandoned-cart recovery (UC09).",
    "4. Ending condition #3 is transitional — it produces initial conditions for UC08."
  ]
}
```

If you need more than 2 initial conditions or more than 1 ending condition, add an `_insertions` hint:

```json
{
  "_insertions": {
    "initial_conditions": { "insert_above_row": 25, "rows_to_add": 1 },
    "ending_conditions":  { "insert_above_row": 44, "rows_to_add": 2 }
  }
}
```

## Software-system translation notes

For software systems, certain initial/ending conditions recur. Keep vocabulary consistent using these patterns:

| Category | Initial condition pattern | Ending condition pattern |
|----------|---------------------------|--------------------------|
| Authentication | "Actor is authenticated with a valid session." | "Session remains valid." / "Session is terminated." |
| Data state | "Record X exists and is in state Y." | "Record X transitions to state Z." |
| External system health | "External system E is reachable and responsive." | "External system E has acknowledged the request." |
| Concurrency | "No other instance of this use case is in flight for this actor." | "Lock released." |
| Resource availability | "Actor has remaining quota Q > 0." | "Actor's quota has been decremented." |
| Event emission | (rarely an initial condition) | "Event E has been published to topic T." (transitional) |
| Audit | (rarely an initial condition) | "Audit log entry has been persisted for this action." |

Consult `resilliency-patterns-kb.md` when writing "external system is reachable" conditions — they often imply a circuit-breaker or timeout requirement later.

## STOP GAP — Checkpoint 1

Present the updated UCBD JSON and ask:

1. "Initial conditions (**[N]**): are these the right preconditions, and are they all states (not actions)?"
2. "Ending conditions (**[N]**): do these describe the success state, and did I correctly flag transitional endings?"
3. "Am I missing any condition that a reviewer would expect to see written down?"
4. "Proceed to Phase 5 (Step Flow)?"

> **STOP:** Do not proceed to Phase 5 until conditions are confirmed. Conditions bound the use case — changing them mid-flow forces you to redo steps.

## Output Artifact

UCBD JSON with initial_conditions and ending_conditions populated. `actor_steps_table` still empty.

## Handoff to Next Phase

Phase 5 fills the step-by-step flow between the initial and ending conditions.

---

**Next →** [Phase 5: UCBD Step Flow](08-Phase-5-UCBD-Step-Flow.md) | **Back:** [Phase 3](06-Phase-3-UCBD-Setup.md)

