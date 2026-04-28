---
schema: phase-file.v1
phase_slug: adding-values-and-units
module: 7
artifact_key: module_7/adding-values-and-units
engine_story: m7-n2
engine_path: apps/product-helper/.planning/engines/m7-n2.json
fail_closed_audit: plans/v22-outputs/te1/fail-closed-audit.md#module-7-interfaces
fail_closed_registry: apps/product-helper/lib/langchain/engines/fail-closed-runner.ts
kb_chunk_refs: []
legacy_snapshot: apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_legacy_2026-04-26/7-interfaces/01-phase-docs/09 - Adding Values and Units.md
rewritten_at: 2026-04-27
rewritten_by: kb-rewrite (Wave-E γ-shape, EC-V21-E.9)
---
# 09 — Adding Values and Units

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
- **Decisions consumed by this phase:** see `decisions[]` in the engine.json keyed on `target_field` containing `adding-values-and-units` or by manual mapping in the story tree.

> Predicates are NOT inlined here. The engine.json is the source of truth; this markdown points at it.

## §3 Fallback rules

When no predicate in §2 matches:

1. `searchKB` retrieves top-3 chunks scoped to `{module: 7, phase: adding-values-and-units}` (post-G8/G9 ingest).
2. If `searchKB` confidence < 0.90 OR returns zero chunks → `surfaceGap` emits `needs_user_input` to `system-question-bridge.ts` with computed_options + math_trace.
3. User answer re-enters the loop at ContextResolver.

> Fallback contract is shared across all phase files. Per-phase override (if any) is documented in the educational body below.

## §4 STOP-GAP rules (machine-readable)

- **artifact_key:** `module_7/adding-values-and-units`
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
- **Runtime retrieval:** `searchKB(query, top_k, { module: 7, phase: 'adding-values-and-units' })` over the `kb_chunks` table (`0011a_kb_chunks.sql`, ivfflat lists=100; HNSW upgrade gated on `>10k` rows).
- **Provenance:** every retrieved chunk carries `{kb_source, chunk_hash, content, embedding_distance}`; rendered by `why-this-value-panel.tsx` (`provenance-ui` agent).

> The `kb_chunk_refs` array in frontmatter is left empty until the embedder backfills it. The runtime path does not depend on the static array — it queries the live table.

---

## Educational content (legacy, preserved)

> The body below is the pre-Wave-E text verbatim. It documents *why* this phase exists, the systems-engineering theory behind the prescribed steps, and the example-driven walkthroughs the LLM (and human readers) consume. The 6 sections above are the schema-first overlay locked by Wave-E γ-shape.

## Prerequisites

- [ ] Completed [Step 08 — Creating the Interface Matrix](08%20-%20Creating%20the%20Interface%20Matrix.md).
- [ ] You have a multi-tab matrix with interface specifications and "Provided To" markings.

## Context (Why This Matters)

An interface matrix without values is a table of intentions. Adding concrete values, units, and tracking information transforms it into a living specification that subsystem teams can actually design against. This step also establishes the metadata (who determined the value, when it was last updated, when the final value is due) that prevents the silent drift of assumptions over time.

## Instructions

1. **Add a Value column** between the subsystem columns and the Interface Specifications column. This is where you record the actual number, setting, or reference for each specification.

2. **Add a Units column** immediately next to the Value column. Always separate value and units into distinct columns — this prevents conversion errors (recall the Mars Climate Orbiter).

   > **Units in software systems.** In software systems, "units" include: **ms** (latency), **req/s** (throughput), **KB/MB** (payload size), **%** (availability), **—** (not applicable, for string/enum values like endpoint paths or auth methods). The principle is the same as hardware: **always separate the value from the unit** to prevent misinterpretation. A response time of "500" without "ms" could be mistaken for seconds.

3. **Populate values where known.** Have the subsystem team that owns each specification provide their best current value. For some specifications, the value will be a reference to another document rather than a number:
   - Endpoint request/response schema → "See OpenAPI spec v1.2"
   - Message queue event payload → "See AsyncAPI spec v1.0"
   - Error response catalog → "See Error Catalog, Section 3"
   - Complex authentication flow → "See Auth Spec, OAuth2 + JWT"

   > **References for complex specifications.** For complex specifications, the Value column should contain a pointer to an external document: an OpenAPI/Swagger spec, a Protobuf definition, an AsyncAPI spec for message queues, or an error catalog. The Interface Matrix tracks the reference and its metadata; the external document contains the detail. See [API Design KB](api-design-sys-design-kb.md).

4. **Add tracking columns** to establish accountability and timeline:

   | Column | Purpose |
   |--------|---------|
   | **Determined By** | Name of the person who set this value |
   | **Status** | Whether the value is "Final" or "Working Estimate" |
   | **Last Updated** | Date the value was last changed |
   | **Next Estimate Expected** | Date a better estimate will be available (if currently uncertain) |
   | **Final Value Due** | Date by which this value must be finalized |

5. **Fill in tracking data for every specification.** Even if a value is not yet known, fill in the "Final Value Due" date so that all teams understand the timeline for resolving uncertainties.

## Worked Example

**Scenario (e-commerce platform) — Order Service tab, Checkout API section:**

| Interface Spec | Value | Units | Determined By | Status | Last Updated | Next Est. | Final Due |
|---|---|---|---|---|---|---|---|
| Endpoint path | /api/v1/checkout | — | A. Park | Final | 2026-01-15 | — | — |
| Request body schema | See OpenAPI spec v1.2 | — | A. Park | Final | 2026-02-01 | — | — |
| Response time SLA | 500 | ms | A. Park + J. Lee | Estimate | 2026-02-15 | 2026-03-15 | 2026-04-01 |
| Auth method | Bearer JWT (RS256) | — | Security Team | Final | 2026-01-20 | — | — |
| Rate limit | 100 | req/min/user | A. Park | Estimate | 2026-02-01 | 2026-03-01 | 2026-04-01 |
| Max request body size | 64 | KB | A. Park | Final | 2026-01-15 | — | — |
| Error response format | RFC 7807 Problem Details | — | A. Park | Final | 2026-02-01 | — | — |
| Retry policy | 2 retries, exponential backoff, max 3s | — | A. Park + Infra | Estimate | 2026-02-15 | 2026-03-15 | 2026-04-01 |

**What this reveals:** The endpoint path, auth method, request schema, body size limit, and error format are all finalized — teams can design against these with confidence. The response time SLA is still an estimate at 500ms, with a better number expected by March 15 and a hard deadline of April 1. The rate limit and retry policy are similarly in-progress, indicating that infrastructure and performance testing are still underway. The retry policy value is a compact description rather than a number — complex enough that the full specification lives in an external document, but summarized here for quick reference.

**Checklist reference:** This corresponds to Steps 5–6 of the "Building Your Interface Matrix" checklist.

## Validation Checklist (STOP-GAP)

- [ ] I have added separate Value and Units columns.
- [ ] Values are populated where known; references to external documents are used where appropriate.
- [ ] Every specification has tracking metadata: who, status (final/estimate), dates.
- [ ] "Final Value Due" dates are set even for unknown values, so timelines are clear to all teams.
- [ ] Value and units are always in separate columns (never combined like "12V").

**STOP: Do not proceed to Step 10 until every box above is checked.**

## Output Artifact

An Interface Matrix with values, units, and tracking metadata for each interface specification.

## Handoff to Next Step

Values are in place, but are they *agreed upon*? Step 10 introduces the Interface Champion — the person responsible for mediating trade-offs and signing off on changes to interface values.

---

**← Previous** [08 — Creating the Interface Matrix](08%20-%20Creating%20the%20Interface%20Matrix.md) | **Next →** [10 — Building Consensus with an Interface Champion](10%20-%20Building%20Consensus%20with%20an%20Interface%20Champion.md)

