---
schema: phase-file.v1
phase_slug: creating-functional-blocks
module: 3
artifact_key: module_3/creating-functional-blocks
engine_story: m3-ffbd
engine_path: apps/product-helper/.planning/engines/m3-ffbd.json
fail_closed_audit: plans/v22-outputs/te1/fail-closed-audit.md#module-3-ffbd
fail_closed_registry: apps/product-helper/lib/langchain/engines/fail-closed-runner.ts
kb_chunk_refs: []
legacy_snapshot: apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_legacy_2026-04-26/3-ffbd/01-phase-docs/03_CREATING-FUNCTIONAL-BLOCKS.md
rewritten_at: 2026-04-27
rewritten_by: kb-rewrite (Wave-E γ-shape, EC-V21-E.9)
---
# Phase 3: Creating Functional Blocks

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
- **Decisions consumed by this phase:** see `decisions[]` in the engine.json keyed on `target_field` containing `creating-functional-blocks` or by manual mapping in the story tree.

> Predicates are NOT inlined here. The engine.json is the source of truth; this markdown points at it.

## §3 Fallback rules

When no predicate in §2 matches:

1. `searchKB` retrieves top-3 chunks scoped to `{module: 3, phase: creating-functional-blocks}` (post-G8/G9 ingest).
2. If `searchKB` confidence < 0.90 OR returns zero chunks → `surfaceGap` emits `needs_user_input` to `system-question-bridge.ts` with computed_options + math_trace.
3. User answer re-enters the loop at ContextResolver.

> Fallback contract is shared across all phase files. Per-phase override (if any) is documented in the educational body below.

## §4 STOP-GAP rules (machine-readable)

- **artifact_key:** `module_3/creating-functional-blocks`
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
- **Runtime retrieval:** `searchKB(query, top_k, { module: 3, phase: 'creating-functional-blocks' })` over the `kb_chunks` table (`0011a_kb_chunks.sql`, ivfflat lists=100; HNSW upgrade gated on `>10k` rows).
- **Provenance:** every retrieved chunk carries `{kb_source, chunk_hash, content, embedding_distance}`; rendered by `why-this-value-panel.tsx` (`provenance-ui` agent).

> The `kb_chunk_refs` array in frontmatter is left empty until the embedder backfills it. The runtime path does not depend on the static array — it queries the live table.

---

## Educational content (legacy, preserved)

> The body below is the pre-Wave-E text verbatim. It documents *why* this phase exists, the systems-engineering theory behind the prescribed steps, and the example-driven walkthroughs the LLM (and human readers) consume. The 6 sections above are the schema-first overlay locked by Wave-E γ-shape.

## Prerequisites
- [ ] You have completed [Phase 2 — Functional vs. Structural](02_FUNCTIONAL-VS-STRUCTURAL.md)
- [ ] You have internalized the "think functionally, not structurally" rule
- [ ] You have a list of candidate top-level functions for your system

## Context (Why This Matters)

Functional blocks are the **atoms** of an FFBD. Every diagram is built from them, every arrow connects them, every gate groups them. If your blocks are poorly formed — wrong names, inconsistent IDs, random sizes — the entire FFBD reads as unprofessional, and reviewers will dismiss it regardless of the quality of your thinking.

Good blocks follow a small set of rules. Once you have them right, the rest of the diagram assembles itself.

## Instructions

### Step 3.1: Understand Block Anatomy

A functional block is a **two-part** rectangle:

```
┌─────────┐
│ F.1.3   │   ← Header box (smaller, on top) — contains the unique ID
├─────────┤
│Calibrate│   ← Body (larger, below) — contains the functional name
│ Device  │
└─────────┘
```

| Part | Purpose | Contents |
|------|---------|----------|
| **Header box** (top, smaller) | Unique identifier | Function ID following hierarchical numbering convention |
| **Body** (bottom, larger) | Human-readable function name | Centered text describing the function |

### Step 3.2: Name the Block Functionally

Apply the rule from Phase 2. Every block name must describe **what must happen**, not **what will do it**.

**Format:** *Verb + Object* (usually)

- ✅ "Process Payment"
- ✅ "Validate Inventory"
- ✅ "Authenticate Shopper"
- ✅ "Render Product Page"
- ❌ "Stripe" (vendor)
- ❌ "Payment Service" (structural — a service is a component)
- ❌ "DB Write" (structural + too implementation-specific)

### Step 3.3: Assign a Unique ID

Every block needs a unique ID. IDs follow the **hierarchical numbering convention**:

**Format:** `F.<parent FFBD number>.<sequential number within this diagram>`

| Context | Example IDs |
|---------|-------------|
| Top-level diagram titled "Function 1 : Onboard Merchant" | `F.1.1`, `F.1.2`, `F.1.3`, ... |
| Sub-diagram titled "Function 1.3 : Configure Storefront" | `F.1.3.1`, `F.1.3.2`, `F.1.3.3`, ... |
| Deeper sub-diagram "Function 1.3.2 : Define Theme" | `F.1.3.2.1`, `F.1.3.2.2`, ... |

**Numbering order within a diagram:** left-to-right, top-to-bottom.

**Why hierarchical numbering matters:** Any block ID can be traced back up the chain. `F.4.3.2` immediately tells a reader it belongs to block 3 of Function 4, which is the third function in the top-level FFBD. This is invaluable for team communication and for cross-referencing in downstream artifacts (Module 4 performance criteria, Module 5 engineering characteristics, Module 6 interfaces, Module 7 FMEA rows).

### Step 3.4: Apply Formatting Rules

| Rule | Why |
|------|-----|
| **Square corners only** | Rounded corners are reserved for EFFBD data blocks (Phase 8). Mixing the two is ambiguous. |
| **Text centered in the body** | Professional standard; aids quick scanning. |
| **Consistent font size** across all block bodies in the diagram | Visual consistency signals professionalism. |
| **2-3 consistent block sizes** throughout the diagram | Not all identical (some names are longer), but not all different either. |
| **Header box smaller than body** | Maintains the ID-vs-name visual hierarchy. |
| **Black text on white fill** | Color is reserved for uncertainty marking (Red/Yellow/Green — covered in Phase 9). |

### Step 3.5: Choose Granularity Intentionally

Blocks can represent any level of function:

| Level | When to Use |
|-------|-------------|
| Very high (entire use case) | Top-level FFBD; every major operational phase |
| High | Within a use case; distinct sub-operations |
| Medium | Inside decomposed sub-diagrams |
| Low | Deep sub-diagrams describing precise algorithmic steps |

**Best practice for first draft:** start high. Every top-level block should be a distinct operational phase the whole team understands. Drill down in later iterations (Phase 7).

### Step 3.6: Draw the Block

Using PowerPoint (or your chosen tool):

1. Insert a rectangle — this becomes the **body**.
2. Insert a smaller rectangle centered on the top edge — this becomes the **header**.
3. Write the functional name centered in the body.
4. Write the ID in the header.
5. Group the two rectangles so they move together.
6. Duplicate the group for your next block, keeping the sizes consistent.

## Worked Example: E-Commerce Platform Top-Level Blocks

Based on the system description, here are the candidate **top-level functional blocks**:

```
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│  F.1    │   │  F.2    │   │  F.3    │   │  F.4    │
├─────────┤   ├─────────┤   ├─────────┤   ├─────────┤
│Provision│   │ Onboard │   │  Serve  │   │ Process │
│Platform │   │ Merchant│   │ Shopper │   │  Order  │
└─────────┘   └─────────┘   │ Session │   └─────────┘
                            └─────────┘

┌─────────┐   ┌─────────┐   ┌─────────┐
│  F.5    │   │  F.6    │   │  F.7    │
├─────────┤   ├─────────┤   ├─────────┤
│ Fulfill │   │ Monitor │   │ Generate│
│  Order  │   │& Operate│   │Merchant │
└─────────┘   └─────────┘   │ Reports │
                            └─────────┘
```

**Rationale for each name:**

| Block | Functional Name | Why (not structural) |
|-------|-----------------|----------------------|
| F.1 | Provision Platform | Could be Terraform, CloudFormation, Ansible — we don't care yet |
| F.2 | Onboard Merchant | Includes account creation, storefront setup, payment config |
| F.3 | Serve Shopper Session | Covers browse, search, cart — the session loop |
| F.4 | Process Order | Validation, payment, order record creation |
| F.5 | Fulfill Order | Inventory update, shipping trigger, notifications |
| F.6 | Monitor & Operate | Continuous health, logging, alerting |
| F.7 | Generate Merchant Reports | Business-level reporting (runs on different cadence) |

**Name validation:**
- ✅ All are verb-led functional phrases
- ✅ None mention Stripe, PostgreSQL, SendGrid, RabbitMQ, CloudFront, or any vendor
- ✅ All are at the same granularity level (high / use-case)

## Common Mistakes

### Mistake 1: Structural Name Slipped In
- **Example:** "F.4 Stripe Payment" 
- **Fix:** Rename to "F.4 Process Payment"

### Mistake 2: Inconsistent Block Sizes
- **Example:** F.1 is twice as tall as F.2, which is three times as wide as F.3.
- **Fix:** Pick 2-3 sizes and stick to them across the diagram.

### Mistake 3: Missing or Duplicate IDs
- **Example:** Two blocks both labeled F.1.3.
- **Fix:** Every block must have a unique ID. Re-number left-to-right, top-to-bottom.

### Mistake 4: ID Doesn't Match Diagram Title
- **Example:** Diagram titled "Function 2 : System Operation" but block IDs are F.1.1, F.1.2.
- **Fix:** Block IDs must start with the diagram's function number. Rename to F.2.1, F.2.2.

### Mistake 5: Name Is Too Low-Level for a Top-Level FFBD
- **Example:** Top-level FFBD has "F.4 Write Row to Orders Table."
- **Fix:** Move this into a sub-diagram. Top-level should read as distinct operational phases.

## Validation Checklist (STOP-GAP)
- [ ] **You have at least 6 functional blocks** (course hard minimum — see [DELIVERABLES-AND-GUARDRAILS.md](DELIVERABLES-AND-GUARDRAILS.md))
- [ ] Every block has a two-part structure (header + body)
- [ ] Every block name is functional (verb + object), never structural
- [ ] Every block has a unique ID following `F.<N>.<M>` convention
- [ ] Block IDs are numbered left-to-right, top-to-bottom within the diagram
- [ ] Body text is centered
- [ ] No more than 2-3 distinct block sizes are used
- [ ] All corners are square (no rounded rectangles — those are reserved for data blocks)
- [ ] Block IDs match the diagram's function-number prefix

> **STOP: Do not proceed to Phase 4 until every block passes every check.**
> If any block name is structural, rewrite it before drawing arrows.

## Output Artifact

A set of **disconnected** functional blocks representing the top-level functions of your system — each correctly named, ID'd, and formatted. No arrows yet.

For our e-commerce platform: 7 top-level blocks (F.1 through F.7).

## Handoff to Next Phase

Blocks stand alone. Phase 4 connects them with arrows, establishing the **order** in which operations occur.

---

**Next →** [04 — Arrows and Operational Flow](04_ARROWS-AND-FLOW.md) | **Back:** [02 — Functional vs. Structural](02_FUNCTIONAL-VS-STRUCTURAL.md)

