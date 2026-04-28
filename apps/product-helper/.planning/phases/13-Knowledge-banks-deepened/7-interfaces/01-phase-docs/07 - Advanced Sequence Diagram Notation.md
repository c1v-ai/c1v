---
schema: phase-file.v1
phase_slug: advanced-sequence-diagram-notation
module: 7
artifact_key: module_7/advanced-sequence-diagram-notation
engine_story: m7-n2
engine_path: apps/product-helper/.planning/engines/m7-n2.json
fail_closed_audit: plans/v22-outputs/te1/fail-closed-audit.md#module-7-interfaces
fail_closed_registry: apps/product-helper/lib/langchain/engines/fail-closed-runner.ts
kb_chunk_refs: []
legacy_snapshot: apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_legacy_2026-04-26/7-interfaces/01-phase-docs/07 - Advanced Sequence Diagram Notation.md
rewritten_at: 2026-04-27
rewritten_by: kb-rewrite (Wave-E γ-shape, EC-V21-E.9)
---
# 07 — Advanced Sequence Diagram Notation

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
- **Decisions consumed by this phase:** see `decisions[]` in the engine.json keyed on `target_field` containing `advanced-sequence-diagram-notation` or by manual mapping in the story tree.

> Predicates are NOT inlined here. The engine.json is the source of truth; this markdown points at it.

## §3 Fallback rules

When no predicate in §2 matches:

1. `searchKB` retrieves top-3 chunks scoped to `{module: 7, phase: advanced-sequence-diagram-notation}` (post-G8/G9 ingest).
2. If `searchKB` confidence < 0.90 OR returns zero chunks → `surfaceGap` emits `needs_user_input` to `system-question-bridge.ts` with computed_options + math_trace.
3. User answer re-enters the loop at ContextResolver.

> Fallback contract is shared across all phase files. Per-phase override (if any) is documented in the educational body below.

## §4 STOP-GAP rules (machine-readable)

- **artifact_key:** `module_7/advanced-sequence-diagram-notation`
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
- **Runtime retrieval:** `searchKB(query, top_k, { module: 7, phase: 'advanced-sequence-diagram-notation' })` over the `kb_chunks` table (`0011a_kb_chunks.sql`, ivfflat lists=100; HNSW upgrade gated on `>10k` rows).
- **Provenance:** every retrieved chunk carries `{kb_source, chunk_hash, content, embedding_distance}`; rendered by `why-this-value-panel.tsx` (`provenance-ui` agent).

> The `kb_chunk_refs` array in frontmatter is left empty until the embedder backfills it. The runtime path does not depend on the static array — it queries the live table.

---

## Educational content (legacy, preserved)

> The body below is the pre-Wave-E text verbatim. It documents *why* this phase exists, the systems-engineering theory behind the prescribed steps, and the example-driven walkthroughs the LLM (and human readers) consume. The 6 sections above are the schema-first overlay locked by Wave-E γ-shape.

## Prerequisites

- [ ] Completed [Step 06 — Sequence Diagrams — Describing Interactions](06%20-%20Sequence%20Diagrams%20-%20Describing%20Interactions.md).
- [ ] You have at least one basic Sequence Diagram.

## Context (Why This Matters)

Basic Sequence Diagrams show the happy path — a linear flow of messages. But real systems have conditional behavior, loops, and internal processing. Advanced notation lets you capture these realities so that your Sequence Diagrams reflect how the system actually operates, not just the simplest case. This richer representation also helps identify additional interfaces that only appear under specific conditions.

> **Software-specific insight:** In distributed systems, the most critical interfaces are often the ones that only activate during **failure paths** — retries, fallbacks, circuit-breaker trips, and compensating transactions. Advanced notation makes these conditional flows explicit and traceable. See [Resiliency Patterns KB](resilliency-patterns-kb.md) and [Observability KB](observability-kb.md).

## Instructions

### Frames and Operators

1. **Use frames to show logic.** A frame is a labeled box drawn *behind* the activation rectangles, enclosing the affected part of the sequence. The label in the upper-left corner is called the **operator** and indicates what kind of logic the frame represents:

   | Operator | Meaning | When to Use |
   |----------|---------|-------------|
   | `loop` | Repeat the enclosed sequence | Continuous monitoring, polling, iterative processing |
   | `alt` | If/else — choose one path | Branching based on a condition |
   | `opt` | Optional — execute only if condition is true | Single conditional without an else |
   | `par` | Parallel — enclosed sequences happen simultaneously | Concurrent operations |
   | `ref` | Reference — points to another Sequence Diagram | Breaking a complex sequence into smaller diagrams |

2. **Add guards to frames.** Next to the operator, write a condition in square brackets that determines when the frame executes. For `alt` frames, a dashed line separates the if-true path from the else path, with `[else]` written below the dashed line.

3. **Add guards directly to message arrows** for single-message conditions. A guard on an arrow means "this message is only sent if the condition in brackets is true." This is equivalent to a one-message `opt` frame.

### Self-Calls

4. **Draw self-calls** as a message arrow that loops back to the same participant, with an overlapping activation rectangle. A self-call indicates that a specific sub-part of the participant is being activated — for example, a subsystem running an internal calculation or invoking a sub-module.

### Interface Specifications (Data Tadpoles)

5. **Annotate interface specifications** using a small circle and arrow (a "data tadpole") placed just above or below a message arrow. This is an older practice but still commonly used to show brief specification details (e.g., data format, frequency) directly on the diagram. **Even if you add tadpoles, the full specification must still appear in the Interface Matrix.**

> **Interface specification note:** Even though you can annotate interface details with data tadpoles in the sequence diagram, you MUST still include every specification in the Interface Matrix. The sequence diagram provides context; the Interface Matrix is the single source of truth.

### Best Practices

6. **Don't overload a single diagram.** If a scenario is too complex, use `ref` frames to break it into sub-diagrams. Each diagram should be readable at a glance.

7. **Check for UML compliance** if your organization follows UML standards. The notation described here largely follows UML Sequence Diagram conventions, but some organizations have specific variations.

## Worked Example

**Scenario (e-commerce platform) — "Checkout with payment handling and health monitoring":**

```
═══════════════════════════════════════════════════════════════════════════
FRAME 1: loop [every 30s] — Health Check Polling
═══════════════════════════════════════════════════════════════════════════

[loop] [every 30s]
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Monitoring (Datadog) ── GET /health ──→ Storefront              │
│  Monitoring (Datadog) ── GET /health ──→ Cart Service            │
│  Monitoring (Datadog) ── GET /health ──→ Order Service           │
│  Monitoring (Datadog) ── GET /health ──→ Payment Service         │
│  Monitoring (Datadog) ── GET /health ──→ Notification Service    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════
FRAME 2: alt — Payment Success vs. Failure
═══════════════════════════════════════════════════════════════════════════

  Order Service ── Get Cart (REST GET) ──→ Cart Service
  Cart Service ─ ─ Cart Contents ─ ─→ Order Service
                   ◯─── JSON: [{item_id: UUID, qty: int, price_cents: int}]
                         (data tadpole on return arrow)

  Order Service ──┐
                  └──→ Order Service (self-call: Calculate order total)
                       Computes subtotal, taxes, shipping internally
                       before sending payment request.

  [item.quantity > 0]
  Cart Service ── Reserve Inventory (SQL UPDATE) ──→ Product DB
                  (guard: only sent if item quantity is available)

  Order Service ── Process Payment (REST POST /api/payments) ──→ Payment Service
  Payment Service ── Charge (HTTPS POST) ──→ Stripe API
  Stripe API ─ ─ Payment Response ─ ─→ Payment Service

  [alt] [payment.status == "succeeded"]
  ┌──────────────────────────────────────────────────────────────┐
  │                                                              │
  │  Payment Service ─ ─ Payment Confirmed ─ ─→ Order Service   │
  │  Order Service ── Mark Order Confirmed (UPDATE) ──→ DB      │
  │  Order Service ── Publish OrderConfirmed Event ──→ MQ       │
  │  MQ ──→ Notification Service                                │
  │  Notification Service ── Send Confirmation Email ──→         │
  │                                              SendGrid API   │
  │                                                              │
  │ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - │
  │ [else]                                                       │
  │                                                              │
  │  Payment Service ─ ─ Payment Failed ─ ─→ Order Service      │
  │  Order Service ── Mark Order Failed (UPDATE) ──→ DB         │
  │  Order Service ── Release Reservation ──→ Cart Service      │
  │  Cart Service ── Release Inventory (SQL UPDATE) ──→         │
  │                                              Product DB     │
  │                                                              │
  └──────────────────────────────────────────────────────────────┘
```

**What the notation reveals:**

- The **`loop` frame** shows that health check polling is a continuous background process, not a one-shot interaction. Monitoring polls every 30 seconds across all services — this drives the observability infrastructure (see [Observability KB](observability-kb.md)).
- The **`alt` frame** makes the payment branching logic explicit — different interfaces activate depending on whether the payment succeeds or fails. On the failure path, a compensating transaction (releasing inventory) is triggered — an interface that would be invisible on the happy-path-only diagram.
- The **self-call** on Order Service shows internal processing (calculating totals, taxes, and shipping) that happens before the payment request is sent. This makes it clear that the latency of this computation is part of the critical path, even though no external message is exchanged.
- The **guard** `[item.quantity > 0]` on the inventory reservation message shows that this call is conditional — Cart Service only reserves inventory when stock is available.
- The **data tadpole** on the Cart Contents return arrow documents the JSON payload structure inline, providing quick reference without opening the Interface Matrix. However, the full schema (field types, validation rules, size limits) must still be recorded in the Interface Matrix.

## Validation Checklist (STOP-GAP)

- [ ] I have used frames (`loop`, `alt`, `opt`, etc.) where my scenario has conditional or repeated behavior.
- [ ] Each frame has an operator label and a guard condition in square brackets.
- [ ] `alt` frames have a dashed line separating the if-true and else paths.
- [ ] Self-calls use an overlapping activation rectangle on the same participant.
- [ ] If I used data tadpoles, the same specifications also appear in the Interface Matrix.
- [ ] No single diagram is so complex that it is hard to read at a glance.
- [ ] I have checked whether my organization follows specific UML or notation standards.

**STOP: Do not proceed to Step 08 until every box above is checked.**

## Output Artifact

Enhanced Sequence Diagrams incorporating logic frames, guards, self-calls, and optionally data tadpoles for key interface specifications.

## Handoff to Next Step

You have now completed Part 1 — discovering and defining interfaces using DFDs, N² Charts, CRC Cards, and Sequence Diagrams. Step 08 begins Part 2: building the **Interface Matrix**, the master specification document where every interface detail is formally recorded.

---

**← Previous** [06 — Sequence Diagrams — Describing Interactions](06%20-%20Sequence%20Diagrams%20-%20Describing%20Interactions.md) | **Next →** [08 — Creating the Interface Matrix](08%20-%20Creating%20the%20Interface%20Matrix.md)

