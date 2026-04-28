---
schema: phase-file.v1
phase_slug: brainstorming-with-data-flow-diagrams
module: 7
artifact_key: module_7/brainstorming-with-data-flow-diagrams
engine_story: m7-n2
engine_path: apps/product-helper/.planning/engines/m7-n2.json
fail_closed_audit: plans/v22-outputs/te1/fail-closed-audit.md#module-7-interfaces
fail_closed_registry: apps/product-helper/lib/langchain/engines/fail-closed-runner.ts
kb_chunk_refs: []
legacy_snapshot: apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_legacy_2026-04-26/7-interfaces/01-phase-docs/03 - Brainstorming with Data Flow Diagrams.md
rewritten_at: 2026-04-27
rewritten_by: kb-rewrite (Wave-E γ-shape, EC-V21-E.9)
---
# 03 — Brainstorming with Data Flow Diagrams

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
- **Decisions consumed by this phase:** see `decisions[]` in the engine.json keyed on `target_field` containing `brainstorming-with-data-flow-diagrams` or by manual mapping in the story tree.

> Predicates are NOT inlined here. The engine.json is the source of truth; this markdown points at it.

## §3 Fallback rules

When no predicate in §2 matches:

1. `searchKB` retrieves top-3 chunks scoped to `{module: 7, phase: brainstorming-with-data-flow-diagrams}` (post-G8/G9 ingest).
2. If `searchKB` confidence < 0.90 OR returns zero chunks → `surfaceGap` emits `needs_user_input` to `system-question-bridge.ts` with computed_options + math_trace.
3. User answer re-enters the loop at ContextResolver.

> Fallback contract is shared across all phase files. Per-phase override (if any) is documented in the educational body below.

## §4 STOP-GAP rules (machine-readable)

- **artifact_key:** `module_7/brainstorming-with-data-flow-diagrams`
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
- **Runtime retrieval:** `searchKB(query, top_k, { module: 7, phase: 'brainstorming-with-data-flow-diagrams' })` over the `kb_chunks` table (`0011a_kb_chunks.sql`, ivfflat lists=100; HNSW upgrade gated on `>10k` rows).
- **Provenance:** every retrieved chunk carries `{kb_source, chunk_hash, content, embedding_distance}`; rendered by `why-this-value-panel.tsx` (`provenance-ui` agent).

> The `kb_chunk_refs` array in frontmatter is left empty until the embedder backfills it. The runtime path does not depend on the static array — it queries the live table.

---

## Educational content (legacy, preserved)

> The body below is the pre-Wave-E text verbatim. It documents *why* this phase exists, the systems-engineering theory behind the prescribed steps, and the example-driven walkthroughs the LLM (and human readers) consume. The 6 sections above are the schema-first overlay locked by Wave-E γ-shape.

## Prerequisites

- [ ] Completed [Step 02 — Interfaces Are Failure Points](02%20-%20Interfaces%20Are%20Failure%20Points.md).
- [ ] You have a list of subsystems with clear responsibilities.

## Context (Why This Matters)

Data Flow Diagrams (DFDs) are a fast, visual way to brainstorm interfaces. They have existed for as long as there have been napkins and envelopes to sketch ideas on. A DFD shows each subsystem as a bubble (or box) with labeled arrows between them representing what flows from one subsystem to another. DFDs are typically the **first** interface identification tool you reach for because they are simple to construct and easy for everyone to understand.

## Instructions

1. **Draw one bubble (or box) for each subsystem.** Keep all bubbles the same size and use a legible, consistent style.

2. **Draw arrows between subsystems** to show the interfaces. Each arrow represents information, data, energy, material, or commands flowing from one subsystem to another. Label every arrow with what is being exchanged.

3. **Draw the arrow from the source to the recipient.** The arrowhead points to the subsystem that *receives* the information.

4. **Distinguish between two types of interfaces:**

   | Type | Definition | Arrow Convention | Examples |
   |------|-----------|-----------------|----------|
   | **Operational** | How subsystems work together during operation | Source → Recipient | Search queries, cart contents, payment requests, order events, inventory checks |
   | **Design** | Information one subsystem needs from another to be designed properly | Responsible subsystem → Needing subsystem | Expected query latency, supported currency codes, message queue payload schemas, rate limits |

5. **Focus a single DFD on one type** (operational or design). The distinction is not strict — many interfaces are relevant to both — but keeping them separate makes each diagram cleaner. It is fine to have multiple DFDs for a single system.

6. **Keep labels at a high level.** A DFD arrow might say "search queries" while the detailed specification (request/response schemas, HTTP methods, timeout values) lives in the Interface Matrix. The DFD is for discovery and documentation, not specification.

7. **Maintain your DFDs throughout the design process.** Although often created during initial brainstorming, DFDs serve as useful visual overviews throughout the project lifecycle.

8. **Check for company policies.** Software-oriented DFDs may follow more formal notation rules (e.g., UML or Yourdon-DeMarco). Check whether your organization has established standards.

## Worked Example

### Operational DFD

**Scenario (e-commerce platform):** The team draws a DFD for operational interfaces across the six subsystems:

```
Subsystem bubbles: Storefront, Search Service, Cart Service,
                   Order Service, Payment Service, Notification Service

External actors:   Customer, Stripe API, SendGrid API, Monitoring

Arrows (source → recipient : label):
  Customer → Storefront : HTTP Requests (browse, search, add-to-cart)
  Storefront → Search Service : Search Queries (REST API)
  Search Service → Storefront : Search Results (JSON)
  Storefront → Cart Service : Cart Operations (add/remove/update)
  Cart Service → Product DB : Inventory Checks (SQL queries)
  Product DB → Cart Service : Stock Availability
  Storefront → Order Service : Checkout Request
  Order Service → Cart Service : Retrieve Cart Contents (REST API)
  Cart Service → Order Service : Cart Data (JSON)
  Order Service → Payment Service : Payment Request (REST API)
  Payment Service → Stripe API : Charge Request (HTTPS)
  Stripe API → Payment Service : Payment Confirmation
  Payment Service → Order Service : Payment Result
  Order Service → Notification Service : Order Confirmed Event (Message Queue)
  Notification Service → SendGrid API : Send Email (API call)
  Monitoring → All Services : Health Checks, Metrics Collection
```

**What the DFD reveals:** The team can immediately see that the Order Service is a hub — it orchestrates the checkout pipeline by pulling cart data, triggering payment, and publishing events to the Notification Service. The Storefront acts as the entry point, routing customer actions to the appropriate downstream services. These observations guide where to focus deeper analysis (N² Charts, Sequence Diagrams).

> **Software-specific tip:** In software DFDs, distinguish between **synchronous interfaces** (REST API calls that block until a response returns — see [API Design KB](api-design-sys-design-kb.md)) and **asynchronous interfaces** (message queue events that are fire-and-forget — see [Message Queues KB](message-queues-kb.md)). Use solid arrows for synchronous and dashed arrows for asynchronous. This distinction is critical for understanding latency chains and failure propagation.

### Design DFD

**Scenario (same platform):** The team draws a separate DFD showing design-time information that subsystems need from each other:

```
Arrows (responsible subsystem → needing subsystem : label):
  Search Service → Storefront : Expected query latency, index size limits
  Payment Service → Order Service : Supported currency codes, transaction limits
  Cart Service → Order Service : Maximum cart size, reservation TTL
  Notification Service → Order Service : Required event payload schema
  Product DB → Cart Service : Schema version, maximum query concurrency
  CDN → Storefront : Cache key format, purge API specification
```

**What the design DFD reveals:** The Storefront needs to know the Search Service's expected query latency so it can set appropriate timeout values. The Order Service needs to know which currencies the Payment Service supports so it can validate orders before attempting payment. These design interfaces are just as important as operational ones — they prevent integration failures.

**Template guidance:** Use the provided `Data-flow-diagram.pptx` template. Replace placeholder bubble names with your subsystems and placeholder arrow labels with your interface names. Use extra bubbles if you have more than four subsystems. Keep all bubbles the same size.

> **QFD bridge note:** The QFD design target of ~40 API endpoints and a 200ms server response time should inform your DFD. Each arrow in the operational DFD will eventually map to one or more endpoints. The response time target makes the synchronous vs. asynchronous distinction especially important — long synchronous chains add latency (see [Load Balancing KB](load-balancing-kb.md) and [Caching KB](caching-system-design-kb.md)).

## Validation Checklist (STOP-GAP)

- [ ] I have drawn a DFD with one bubble per subsystem and labeled arrows for every known interface.
- [ ] Each arrow is drawn from the source (provider) to the recipient (consumer).
- [ ] I can distinguish operational interfaces from design interfaces.
- [ ] My labels are at a high level (the detail will go in the Interface Matrix later).
- [ ] I have checked whether my organization has DFD formatting standards.

**STOP: Do not proceed to Step 04 until every box above is checked.**

## Output Artifact

One or more Data Flow Diagrams showing all subsystems and their high-level interfaces (operational and/or design).

## Handoff to Next Step

The DFD brainstorms *what* connects. Step 04 introduces the N-Squared Chart, which organizes those interfaces into a structured matrix showing *who sends what to whom*.

---

**← Previous** [02 — Interfaces Are Failure Points](02%20-%20Interfaces%20Are%20Failure%20Points.md) | **Next →** [04 — Formalizing with N-Squared Charts](04%20-%20Formalizing%20with%20N-Squared%20Charts.md)

