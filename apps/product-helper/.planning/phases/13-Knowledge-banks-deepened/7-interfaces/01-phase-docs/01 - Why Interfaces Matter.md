---
schema: phase-file.v1
phase_slug: why-interfaces-matter
module: 7
artifact_key: module_7/why-interfaces-matter
engine_story: m7-n2
engine_path: apps/product-helper/.planning/engines/m7-n2.json
fail_closed_audit: plans/v22-outputs/te1/fail-closed-audit.md#module-7-interfaces
fail_closed_registry: apps/product-helper/lib/langchain/engines/fail-closed-runner.ts
kb_chunk_refs: []
legacy_snapshot: apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_legacy_2026-04-26/7-interfaces/01-phase-docs/01 - Why Interfaces Matter.md
rewritten_at: 2026-04-27
rewritten_by: kb-rewrite (Wave-E γ-shape, EC-V21-E.9)
---
# 01 -- Why Interfaces Matter

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
- **Decisions consumed by this phase:** see `decisions[]` in the engine.json keyed on `target_field` containing `why-interfaces-matter` or by manual mapping in the story tree.

> Predicates are NOT inlined here. The engine.json is the source of truth; this markdown points at it.

## §3 Fallback rules

When no predicate in §2 matches:

1. `searchKB` retrieves top-3 chunks scoped to `{module: 7, phase: why-interfaces-matter}` (post-G8/G9 ingest).
2. If `searchKB` confidence < 0.90 OR returns zero chunks → `surfaceGap` emits `needs_user_input` to `system-question-bridge.ts` with computed_options + math_trace.
3. User answer re-enters the loop at ContextResolver.

> Fallback contract is shared across all phase files. Per-phase override (if any) is documented in the educational body below.

## §4 STOP-GAP rules (machine-readable)

- **artifact_key:** `module_7/why-interfaces-matter`
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
- **Runtime retrieval:** `searchKB(query, top_k, { module: 7, phase: 'why-interfaces-matter' })` over the `kb_chunks` table (`0011a_kb_chunks.sql`, ivfflat lists=100; HNSW upgrade gated on `>10k` rows).
- **Provenance:** every retrieved chunk carries `{kb_source, chunk_hash, content, embedding_distance}`; rendered by `why-this-value-panel.tsx` (`provenance-ui` agent).

> The `kb_chunk_refs` array in frontmatter is left empty until the embedder backfills it. The runtime path does not depend on the static array — it queries the live table.

---

## Educational content (legacy, preserved)

> The body below is the pre-Wave-E text verbatim. It documents *why* this phase exists, the systems-engineering theory behind the prescribed steps, and the example-driven walkthroughs the LLM (and human readers) consume. The 6 sections above are the schema-first overlay locked by Wave-E γ-shape.

## Prerequisites

- [ ] You have a system with defined subsystems (or are ready to define them).
- [ ] You understand your system's high-level requirements and performance criteria (Modules 4-5).
- [ ] Optional: If you completed Module 5 (QFD), your engineering characteristics and design targets will accelerate subsystem identification.

## Context (Why This Matters)

Before you can define interfaces, you need to understand what subsystems are and why the connections between them deserve dedicated attention. A subsystem that works perfectly in isolation can fail catastrophically when connected to the rest of the system — and it is almost always at the interface where things break. Interface definition is where you prevent that.

In software systems, this is the difference between a service that passes all its unit tests and a production deployment where services cannot communicate. The Cart Service works in isolation. The Order Service works in isolation. But when the Cart Service sends a checkout payload the Order Service does not expect, the entire purchase flow fails.

## Instructions

1. **Define "subsystem" for your project.** A subsystem is any part of your overall system that, together with the other parts, is responsible for all aspects of the system's operation. Subsystems can be defined by:
   - **Functional groupings** — e.g., search, cart management, order processing, payment handling
   - **Expertise groupings** — e.g., frontend, backend, data engineering, infrastructure/DevOps
   - **Organizational structure** — e.g., checkout team, catalog team, platform team
   - **Any combination** of the above

   > In software systems, subsystems are typically defined by **service boundaries** — each service owns a distinct domain (search, cart, orders, payments). This maps to the "functional groupings" category. Teams may also organize by **expertise** (frontend, backend, data, infrastructure) or **organizational structure** (checkout team, catalog team, platform team). The choice of grouping affects how interfaces are discovered: functional groupings surface API contracts between services; expertise groupings surface cross-cutting concerns like authentication and logging; organizational groupings surface team communication boundaries (Conway's Law). See [Maintainability KB](maintainability-kb.md) for service boundary design principles.

2. **Avoid a common mistake:** Do not define subsystems by attributes or performance criteria (e.g., "speed" or "safety"). These are concerns that subsystems address, not subsystems themselves. In software terms, "scalability" is not a service — it is a quality attribute that every service must satisfy. "Reliability" is not a microservice — it is a design target from your QFD.

3. **Verify each subsystem's responsibility is clear.** For each subsystem, you should be able to articulate in one or two sentences what it is responsible for delivering.

4. **Test your subsystem breakdown** by attempting to allocate your requirements to subsystems. Every requirement should map to at least one subsystem responsible for meeting it. If requirements are orphaned or awkwardly split, your subsystem definitions may need revision.

5. **Accept that subsystem definitions may change.** Throughout the interface analysis process, you may decide to reorganize subsystems to make the design more efficient, less error-prone, or simply easier. This is normal and reflects healthy iteration. In software, you might discover during interface analysis that the Cart Service and Order Service share so much state that they should be merged — or that the Storefront Service is doing too much and should be split into a Storefront Service and a Session Service.

## Worked Example

**Scenario:** An open-source e-commerce platform (selected as Option C from the Module 4 Decision Matrix). The team identifies the following subsystems:

| Subsystem | Responsibility |
|-----------|---------------|
| Storefront Service | Serve pages via CDN, manage client sessions, route user actions to backend services |
| Search Service | Index products, execute search queries, return ranked results |
| Cart Service | Manage shopping cart state, validate item availability against real-time inventory |
| Order Service | Orchestrate checkout: calculate totals, taxes, and shipping; manage order lifecycle |
| Payment Service | Process payments securely via external gateway (Stripe API) |
| Notification Service | Send email/SMS order confirmations and shipping updates via message queue |

**External actors** (not subsystems, but they participate in interfaces):
- Customer (browser)
- Payment Provider (Stripe API)
- Email Provider (SendGrid API)

**Shared infrastructure** (cross-cutting, used by multiple services):
- Product Database (PostgreSQL) — see [Data Model KB](data-model-kb.md)
- Message Queue (RabbitMQ/SQS) — see [Message Queues KB](message-queues-kb.md)
- CDN (CloudFront) — see [CDN & Networking KB](cdn-networking-kb.md)
- Monitoring/Alerting (Datadog) — see [Observability KB](observability-kb.md)

**Requirement allocation test:**

| Requirement | Allocated To |
|-------------|-------------|
| "The system shall process payments securely" | Payment Service (processing), Order Service (orchestration) |
| "The system shall return search results within 500 ms" | Search Service (query execution), Storefront Service (CDN caching of results) — see [Caching KB](caching-system-design-kb.md) |
| "The system shall send order confirmation within 30 seconds" | Notification Service (delivery), Order Service (event publishing) — see [Message Queues KB](message-queues-kb.md) |
| "The system shall handle 1,000 concurrent users during peak traffic" | Storefront Service (CDN/load balancing), all backend services (horizontal scaling) — see [Load Balancing KB](load-balancing-kb.md) |

Every requirement has a home. Notice that most requirements touch at least two services — this is exactly why interfaces matter. The requirement lives at the boundary.

> **Bridge from QFD (if available):** If your Module 5 QFD identified engineering characteristics like "Number of Services/Modules" (target: 6) and "Number of Exposed API Endpoints" (target: ~40), these directly define your subsystem count and hint at the interface volume. Each service boundary is an interface boundary. The QFD design target of "Server Response Time: 200 ms" becomes a performance budget that every interface in the chain must respect — if the Storefront calls the Search Service which queries PostgreSQL, the total latency across those interfaces must stay under 200 ms. See [API Design KB](api-design-sys-design-kb.md) for how protocol choice (REST, gRPC, GraphQL) affects latency budgets.

## Validation Checklist (STOP-GAP)

- [ ] I can define what a subsystem is and give examples of how they are organized.
- [ ] I have not confused subsystems with performance criteria or attributes.
- [ ] Each of my subsystems has a clear, one-sentence responsibility statement.
- [ ] I have attempted to allocate requirements to subsystems and resolved any orphans.

**STOP: Do not proceed to Step 02 until every box above is checked.**

## Output Artifact

A list of your system's subsystems with clear responsibility statements, confirmed by successful requirement allocation.

## Handoff to Next Step

Now that you know what your subsystems are, Step 02 explains *why* the connections between them are the most critical — and most failure-prone — aspect of your system.

---

**<-- Previous** [00 -- Module Overview](00%20-%20Module%20Overview.md) | **Next -->** [02 -- Interfaces Are Failure Points](02%20-%20Interfaces%20Are%20Failure%20Points.md)

