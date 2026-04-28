---
schema: phase-file.v1
phase_slug: arrows-and-flow
module: 3
artifact_key: module_3/arrows-and-flow
engine_story: m3-ffbd
engine_path: apps/product-helper/.planning/engines/m3-ffbd.json
fail_closed_audit: plans/v22-outputs/te1/fail-closed-audit.md#module-3-ffbd
fail_closed_registry: apps/product-helper/lib/langchain/engines/fail-closed-runner.ts
kb_chunk_refs: []
legacy_snapshot: apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_legacy_2026-04-26/3-ffbd/01-phase-docs/04_ARROWS-AND-FLOW.md
rewritten_at: 2026-04-27
rewritten_by: kb-rewrite (Wave-E γ-shape, EC-V21-E.9)
---
# Phase 4: Arrows and Operational Flow

## §1 Decision context

This phase contributes to **m3-ffbd** decisions. Runtime resolution flows through:

1. ContextResolver loads upstream artifacts + intake state.
2. NFREngineInterpreter evaluates predicates from `apps/product-helper/.planning/engines/m3-ffbd.json` against EvalContext.
3. On match → auto-fill (clamped to `auto_fill_threshold`); on no match → fallback (§3); on still-no-match → STOP-GAP gate (§4) blocks proceed.

The legacy educational body (preserved in this file under the "Educational content" footer) explains *why* this phase exists. The runtime *what* lives in the engine.json + fail-closed registry referenced below.

## §2 Predicates (engine.json reference)

- **Engine story:** `m3-ffbd` (`apps/product-helper/.planning/engines/m3-ffbd.json`)
- **Predicate DSL evaluator:** `apps/product-helper/lib/langchain/engines/predicate-dsl.ts`
- **Story-tree schema:** `apps/product-helper/lib/langchain/schemas/engines/story-tree.ts`
- **Decisions consumed by this phase:** see `decisions[]` in the engine.json keyed on `target_field` containing `arrows-and-flow` or by manual mapping in the story tree.

> Predicates are NOT inlined here. The engine.json is the source of truth; this markdown points at it.

## §3 Fallback rules

When no predicate in §2 matches:

1. `searchKB` retrieves top-3 chunks scoped to `{module: 3, phase: arrows-and-flow}` (post-G8/G9 ingest).
2. If `searchKB` confidence < 0.90 OR returns zero chunks → `surfaceGap` emits `needs_user_input` to `system-question-bridge.ts` with computed_options + math_trace.
3. User answer re-enters the loop at ContextResolver.

> Fallback contract is shared across all phase files. Per-phase override (if any) is documented in the educational body below.

## §4 STOP-GAP rules (machine-readable)

- **artifact_key:** `module_3/arrows-and-flow`
- **registry:** `apps/product-helper/lib/langchain/engines/fail-closed-runner.ts` (`buildFailClosedRegistry`)
- **schema:** `apps/product-helper/lib/langchain/schemas/engines/fail-closed.ts` (`failClosedRuleSetSchema`)
- **audit doc (rule sources + severity):** [plans/v22-outputs/te1/fail-closed-audit.md](../../../../../../plans/v22-outputs/te1/fail-closed-audit.md#module-3-ffbd)

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
- **Runtime retrieval:** `searchKB(query, top_k, { module: 3, phase: 'arrows-and-flow' })` over the `kb_chunks` table (`0011a_kb_chunks.sql`, ivfflat lists=100; HNSW upgrade gated on `>10k` rows).
- **Provenance:** every retrieved chunk carries `{kb_source, chunk_hash, content, embedding_distance}`; rendered by `why-this-value-panel.tsx` (`provenance-ui` agent).

> The `kb_chunk_refs` array in frontmatter is left empty until the embedder backfills it. The runtime path does not depend on the static array — it queries the live table.

---

## Educational content (legacy, preserved)

> The body below is the pre-Wave-E text verbatim. It documents *why* this phase exists, the systems-engineering theory behind the prescribed steps, and the example-driven walkthroughs the LLM (and human readers) consume. The 6 sections above are the schema-first overlay locked by Wave-E γ-shape.

## Prerequisites
- [ ] You have completed [Phase 3 — Creating Functional Blocks](03_CREATING-FUNCTIONAL-BLOCKS.md)
- [ ] You have a set of correctly named, ID'd, and formatted functional blocks
- [ ] You have an intuition for the order in which the system's functions must occur

## Context (Why This Matters)

Functional blocks on their own tell you *what* the system does. Arrows tell you *when* and *under what triggering conditions*. Without arrows, an FFBD is just a vocabulary list.

The FFBD uses **two** kinds of arrows — and the distinction between them carries real information about system behavior. Using the wrong one misleads your readers.

## Instructions

### Step 4.1: Understand the Two Arrow Types

| Arrow Type | Line Style | Meaning |
|------------|-----------|---------|
| **Trigger arrow** | Solid line (`────►`) | The next function is triggered by or **immediately follows** the previous function. |
| **Precedes arrow** | Dashed line (`- - - ►`) | The next function occurs at some point **later** after the previous. The time between may be considerable and is not specified by the arrow alone. |

**Trigger arrows are the most commonly used.** Most of your FFBD will use them.

**Precedes arrows are used when there is a meaningful time gap** between two functions — enough that it changes how the team should think about the system.

#### Examples

**Trigger (solid):**
```
F.4.1 Validate Inventory ──► F.4.2 Reserve Stock
```
Reserving stock happens immediately after validating inventory. No meaningful gap.

**Precedes (dashed):**
```
F.6 Monitor & Operate - - -► F.7 Generate Merchant Reports
```
Monitoring runs continuously. Report generation happens on a schedule (daily, weekly). There is a significant time gap between them.

**Rule of thumb:** If the gap is large enough that a reader would assume things happen in between, use a **precedes** arrow.

### Step 4.2: Draw Arrows Between Blocks

For each ordered pair of functions, decide:

1. Does B happen **immediately** after A? → Trigger (solid)
2. Does B happen **sometime later** after A? → Precedes (dashed)

Start with the clear cases. Mark ambiguous ones for team discussion.

### Step 4.3: Apply Formatting Rules

| Rule | Why |
|------|-----|
| **Rectilinear** (90-degree angles only, no curves, no diagonals) | Professional standard; aids readability |
| **Filled arrowheads** (not open, not hollow) | Standard convention |
| Same thickness as block borders, or **one setting thicker** | Consistent visual weight |
| **Direct contact** with block edges (no floating gaps) | Floating arrows are ambiguous |
| Precedes arrows **long enough to clearly show dashes** | Otherwise they look like solid arrows |
| **No overlapping** other arrows or FFBD components | Rearrange blocks or use shortcuts (Phase 6) |

### Step 4.4: Label Arrows (Optional but Powerful)

Arrows can carry labels that communicate information across functional boundaries. Common labels:

| Label Type | Example | When to Use |
|-----------|---------|-------------|
| **Information passed** | *payment token, order ID* | When the handoff includes specific data |
| **Expected time** | *< 5 min* / *daily* | Often on precedes arrows |
| **Specifications** | *encrypted, HIPAA-compliant* | Non-functional constraints on the handoff |
| **Constraints** | *only if amount > $0* | Conditional handoffs |
| **Influence** | *sets threshold* | One function configuring another |

**Formatting rules for arrow labels:**

| Rule | Why |
|------|-----|
| Labels typically **above** the arrow | Standard convention (can break for readability) |
| **Italicized** | Visual distinction from block names |
| Same font size as block body or **one size smaller** | Subordinate to block names |
| Multiple labels **separated by commas** (or semicolons) | Keeps the arrow readable |
| Label associated **unambiguously** with a single arrow | If a label could belong to two arrows, rearrange |

### Step 4.5: Avoid Arrow Overlaps

**No overlapping arrows.** Overlaps look sloppy and are flagged in professional review.

Some formats allow **arrow jumps** — a half-circle bump where two arrows cross. This is acceptable but still considered inferior to clean layout.

**The preferred fix:** rearrange blocks so arrows don't cross. If that becomes impossible, use **arrow shortcuts** (Phase 6).

## Worked Example: E-Commerce Platform Top-Level Flow

Starting from the 7 blocks from Phase 3:

```
F.1 Provision Platform ─────► F.2 Onboard Merchant ─────► F.3 Serve Shopper Session
                                                                  │
                                                                  ▼
                               F.5 Fulfill Order ◄───── F.4 Process Order
                                      │
                                      ▼
                               F.6 Monitor & Operate - - -► F.7 Generate Merchant Reports
```

### Arrow-by-arrow rationale

| Arrow | Type | Label | Why |
|-------|------|-------|-----|
| F.1 → F.2 | Trigger | *platform ready* | Merchant onboarding cannot begin until infrastructure is provisioned |
| F.2 → F.3 | Trigger | *merchant live* | Shopper sessions can serve as soon as the merchant is live |
| F.3 → F.4 | Trigger | *checkout initiated* | Order processing is triggered by checkout inside the shopper session |
| F.4 → F.5 | Trigger | *payment captured* | Fulfillment is triggered by successful payment |
| F.5 → F.6 | Trigger | *order event logged* | Monitoring consumes events from fulfillment (and all other functions) |
| F.6 ⇢ F.7 | **Precedes** | *daily / weekly* | Reports generate on a schedule, not immediately after monitoring — a clear time gap |

### Why F.6 → F.7 uses a precedes arrow

Merchant reports are not produced the moment a single monitoring event occurs. They aggregate over hours, days, or weeks of monitoring output. Using a **trigger** arrow would imply "every monitoring event immediately triggers a report" — which is false. The **precedes** arrow correctly communicates: reporting happens at some point later.

### Information-flow labels

Beyond order-sequence labels, you can enrich arrows with payload labels:

```
F.3 ──[cart_id, shopper_id]──► F.4
F.4 ──[order_id, amount, payment_token]──► F.5
F.5 ──[shipment_event]──► F.6
```

This makes data handoffs explicit and feeds directly into Module 6's Interface Matrix.

## Common Mistakes

### Mistake 1: Trigger Where Precedes Is Correct
- **Example:** `F.6 ──► F.7` (trigger)  implies reports are generated immediately on every monitoring event.
- **Fix:** Change to dashed `F.6 ⇢ F.7` to reflect the scheduled cadence.

### Mistake 2: Precedes Where Trigger Is Correct
- **Example:** `F.4.1 Validate Inventory ⇢ F.4.2 Reserve Stock` (precedes) implies a meaningful delay between the two, misleading the team into over-engineering for that gap.
- **Fix:** Change to solid trigger arrow.

### Mistake 3: Floating Arrow
- **Example:** Arrow starts 2mm short of F.4's edge.
- **Fix:** Ambiguous — reader can't tell which block it connects to. Snap endpoints to block edges.

### Mistake 4: Arrow Label Ambiguity
- **Example:** A label sits between two nearby arrows, unclear which it belongs to.
- **Fix:** Move the label so it sits clearly above one specific arrow, or rearrange to increase separation.

### Mistake 5: Precedes Arrow Too Short to See Dashes
- **Example:** A "dashed" arrow is so short that only one dash is visible — looks like a short solid arrow.
- **Fix:** Lengthen the arrow or rearrange blocks so the dashes are unambiguous.

### Mistake 6: Too Many Overlapping Arrows
- **Example:** Five arrows crisscross between two clusters of blocks.
- **Fix:** Rearrange the layout. If impossible, use arrow shortcuts (Phase 6).

## Validation Checklist (STOP-GAP)
- [ ] **Your diagram uses both arrow types** — at least one trigger (solid) AND at least one precedes (dashed) (course hard minimum — see [DELIVERABLES-AND-GUARDRAILS.md](DELIVERABLES-AND-GUARDRAILS.md))
- [ ] Every arrow is either clearly **trigger** (solid) or **precedes** (dashed) — no ambiguous hybrids
- [ ] Every arrow is in **direct contact** with the edges of the blocks it connects
- [ ] No overlapping arrows (or, if unavoidable, arrow shortcuts are planned for Phase 6)
- [ ] Precedes arrows are **long enough** for dashes to be clearly visible
- [ ] Arrow labels (if present) are italicized, above the arrow, and unambiguously associated
- [ ] The flow reads **left to right** (or top to bottom if vertically oriented)
- [ ] No function has zero incoming arrows unless it is the system entry point
- [ ] No function has zero outgoing arrows unless it is a system exit point

> **STOP: Do not proceed to Phase 5 until all checks pass.**
> If any arrow type choice feels uncertain, discuss with the team before moving on — the distinction between trigger and precedes is semantic, and the wrong choice misleads readers.

## Output Artifact

A connected top-level FFBD: blocks linked by correctly-typed arrows, labeled where information flow is meaningful, with no overlaps or ambiguity.

For our e-commerce platform: a 7-block flow with 6 arrows (5 trigger, 1 precedes).

## Handoff to Next Phase

Straight sequential flow is enough for simple systems. Most real systems have **branching, parallelism, and loops** — and those require logic gates. Phase 5 introduces AND, OR, and IT gates.

---

**Next →** [05 — Logic Gates](05_LOGIC-GATES.md) | **Back:** [03 — Creating Functional Blocks](03_CREATING-FUNCTIONAL-BLOCKS.md)

