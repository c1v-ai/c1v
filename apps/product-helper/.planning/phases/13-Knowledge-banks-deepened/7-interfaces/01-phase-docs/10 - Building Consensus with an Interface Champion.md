---
schema: phase-file.v1
phase_slug: building-consensus-with-an-interface-champion
module: 7
artifact_key: module_7/building-consensus-with-an-interface-champion
engine_story: m7-n2
engine_path: apps/product-helper/.planning/engines/m7-n2.json
fail_closed_audit: plans/v22-outputs/te1/fail-closed-audit.md#module-7-interfaces
fail_closed_registry: apps/product-helper/lib/langchain/engines/fail-closed-runner.ts
kb_chunk_refs: []
legacy_snapshot: apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_legacy_2026-04-26/7-interfaces/01-phase-docs/10 - Building Consensus with an Interface Champion.md
rewritten_at: 2026-04-27
rewritten_by: kb-rewrite (Wave-E γ-shape, EC-V21-E.9)
---
# 10 — Building Consensus with an Interface Champion

## §1 Decision context

This phase contributes to **m7-n2** decisions. Runtime resolution flows through:

1. ContextResolver loads upstream artifacts + intake state.
2. NFREngineInterpreter evaluates predicates from `apps/product-helper/.planning/engines/m7-n2.json` against EvalContext.
3. On match → auto-fill (clamped to `auto_fill_threshold`); on no match → fallback (§3); on still-no-match → STOP-GAP gate (§4) blocks proceed.

The legacy educational body (preserved in this file under the "Educational content" footer) explains *why* this phase exists. The runtime *what* lives in the engine.json + fail-closed registry referenced below.

## §2 Predicates (engine.json reference)

- **Engine story:** `m7-n2` (`apps/product-helper/.planning/engines/m7-n2.json`)
- **Predicate DSL evaluator:** `apps/product-helper/lib/langchain/engines/predicate-dsl.ts`
- **Story-tree schema:** `apps/product-helper/lib/langchain/schemas/engines/story-tree.ts`
- **Decisions consumed by this phase:** see `decisions[]` in the engine.json keyed on `target_field` containing `building-consensus-with-an-interface-champion` or by manual mapping in the story tree.

> Predicates are NOT inlined here. The engine.json is the source of truth; this markdown points at it.

## §3 Fallback rules

When no predicate in §2 matches:

1. `searchKB` retrieves top-3 chunks scoped to `{module: 7, phase: building-consensus-with-an-interface-champion}` (post-G8/G9 ingest).
2. If `searchKB` confidence < 0.90 OR returns zero chunks → `surfaceGap` emits `needs_user_input` to `system-question-bridge.ts` with computed_options + math_trace.
3. User answer re-enters the loop at ContextResolver.

> Fallback contract is shared across all phase files. Per-phase override (if any) is documented in the educational body below.

## §4 STOP-GAP rules (machine-readable)

- **artifact_key:** `module_7/building-consensus-with-an-interface-champion`
- **registry:** `apps/product-helper/lib/langchain/engines/fail-closed-runner.ts` (`buildFailClosedRegistry`)
- **schema:** `apps/product-helper/lib/langchain/schemas/engines/fail-closed.ts` (`failClosedRuleSetSchema`)
- **audit doc (rule sources + severity):** [plans/v22-outputs/te1/fail-closed-audit.md](../../../../../../plans/v22-outputs/te1/fail-closed-audit.md#module-7-interfaces)

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
- **Runtime retrieval:** `searchKB(query, top_k, { module: 7, phase: 'building-consensus-with-an-interface-champion' })` over the `kb_chunks` table (`0011a_kb_chunks.sql`, ivfflat lists=100; HNSW upgrade gated on `>10k` rows).
- **Provenance:** every retrieved chunk carries `{kb_source, chunk_hash, content, embedding_distance}`; rendered by `why-this-value-panel.tsx` (`provenance-ui` agent).

> The `kb_chunk_refs` array in frontmatter is left empty until the embedder backfills it. The runtime path does not depend on the static array — it queries the live table.

---

## Educational content (legacy, preserved)

> The body below is the pre-Wave-E text verbatim. It documents *why* this phase exists, the systems-engineering theory behind the prescribed steps, and the example-driven walkthroughs the LLM (and human readers) consume. The 6 sections above are the schema-first overlay locked by Wave-E γ-shape.

## Prerequisites

- [ ] Completed [Step 09 — Adding Values and Units](09%20-%20Adding%20Values%20and%20Units.md).
- [ ] You have an Interface Matrix with values, units, and tracking metadata.

## Context (Why This Matters)

Values in the Interface Matrix are useless if the teams that depend on them don't agree. The Storefront team wants the checkout endpoint to respond in under 200ms; the Order Service team says 500ms is the best they can do. One team needs a final value by March; another can't commit until June. These conflicts are natural and inevitable — what matters is that they are surfaced, discussed, and resolved early. The **Interface Champion** is the designated person who ensures this happens.

## Instructions

### Cross-Team Review

1. **Have each sub-team review the interface specifications with every other sub-team** that depends on them. In each review, draw out the following:
   - Is this all the information you need from us?
   - Are there additional constraints or ranges that are acceptable?
   - How would a change in this value impact your work?
   - How would a change impact overall system performance?

2. **Add new specifications discovered during review.** Cross-team discussions frequently reveal additional interface specifications that no single team anticipated. Add them to the matrix.

3. **Use QFD as a conflict-resolution tool.** When sub-teams disagree on a value (e.g., how to allocate latency or cost budget), the QFD's engineering characteristic trade-off analysis (Module 5) can help reason through the impacts on performance criteria. In this case, the QFD roof showed that Server Response Time and Queue Processing Rate have a positive relationship — investing in async processing improves both.

### The Interface Champion Role

4. **Assign an Interface Champion for each interface specification.** Add an "Interface Champion" column to the matrix. The champion is:
   - **Not always the project lead** — it is often a member of one of the involved subsystem teams
   - **Selected based on the most important criterion:** they must be able to understand the impact the interface has on *all* involved subsystems

5. **Define the champion's responsibilities:**
   - **Mediate disagreements** between subsystem teams about values, ranges, and timelines
   - **Sign off on changes** — no interface value may be changed without the champion's approval
   - **Approve test conditions** — the champion reviews and approves what constitutes a successful test of the interface to ensure it meets all dependent subsystems' needs, not just the providing subsystem's definition of "working"
   - **Track the interface** throughout the project lifecycle

6. **Make champion assignments visible.** Every team should be able to look at any interface specification and immediately see who the champion is.

### Duplicating the Matrix

7. **Once champions are assigned, duplicate the spreadsheet** to create one complete copy per subsystem. Each subsystem now has its own tab showing:
   - What it provides to others ("Provided To")
   - What it needs from others (added in Step 11)
   - Who the champion is for each specification
   - All values, units, and tracking metadata

## Worked Example

**Scenario (e-commerce platform) — Resolving a response time SLA disagreement:**

The Storefront team wants the Order Service checkout endpoint to respond in under 200ms (to meet the QFD's page load speed target). The Order Service team says 200ms is impossible because they must call Cart Service (~100ms) and then Payment Service (300–500ms for Stripe) sequentially. The Interface Champion — a senior engineer from the platform/infrastructure team who understands both latency budgets and payment processing constraints — facilitates the discussion:

- **Storefront team:** "At 500ms, the total page load with rendering exceeds 1 second. Users bounce."
- **Order Service team:** "We can't make Stripe faster. Their API takes 300–500ms."
- **Champion reviews architecture:** "Can we decouple the payment confirmation from the checkout response?"
- **Resolution:** Order Service returns a **202 Accepted** with an `order_id` immediately (~150ms), then processes payment asynchronously. Storefront shows a "Processing payment..." state. Notification Service sends confirmation when payment completes. See [API Design KB](api-design-sys-design-kb.md) for async API patterns and [Message Queues KB](message-queues-kb.md) for event-driven decoupling.

The champion logs this architectural decision, updates the Interface Matrix (checkout endpoint SLA changes from 500ms to 150ms, adds a new async `payment.completed` event interface), and will not approve any change to the checkout flow without reconvening the Storefront, Order, and Payment teams.

## Validation Checklist (STOP-GAP)

- [ ] Each sub-team has reviewed its interface specifications with every dependent sub-team.
- [ ] New specifications discovered during review have been added to the matrix.
- [ ] An Interface Champion is assigned for every interface specification.
- [ ] Champions are selected based on their ability to understand cross-subsystem impact.
- [ ] The champion's responsibilities are clear: mediate, sign off on changes, approve test conditions.
- [ ] The Interface Champion column is visible in the matrix.
- [ ] The matrix has been duplicated — one tab per subsystem.

**STOP: Do not proceed to Step 11 until every box above is checked.**

## Output Artifact

A complete Interface Matrix with Interface Champion assignments for every specification, backed by cross-team consensus on current values.

## Handoff to Next Step

Step 11 introduces two powerful enhancements: **received-from views** (so each subsystem can see what it needs from others in one place) and **budget tracking** (to manage shared resource allocations like latency, cost, API rate limits, and error budgets).

---

**← Previous** [09 — Adding Values and Units](09%20-%20Adding%20Values%20and%20Units.md) | **Next →** [11 — Interface Matrix Enhancements](11%20-%20Interface%20Matrix%20Enhancements.md)

