---
schema: phase-file.v1
phase_slug: ffbd-foundations
module: 3
artifact_key: module_3/ffbd-foundations
engine_story: m3-ffbd
engine_path: apps/product-helper/.planning/engines/m3-ffbd.json
fail_closed_audit: plans/v22-outputs/te1/fail-closed-audit.md#module-3-ffbd
fail_closed_registry: apps/product-helper/lib/langchain/engines/fail-closed-runner.ts
kb_chunk_refs: []
legacy_snapshot: apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_legacy_2026-04-26/3-ffbd/01-phase-docs/01_FFBD-FOUNDATIONS.md
rewritten_at: 2026-04-27
rewritten_by: kb-rewrite (Wave-E γ-shape, EC-V21-E.9)
---
# Phase 1: FFBD Foundations

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
- **Decisions consumed by this phase:** see `decisions[]` in the engine.json keyed on `target_field` containing `ffbd-foundations` or by manual mapping in the story tree.

> Predicates are NOT inlined here. The engine.json is the source of truth; this markdown points at it.

## §3 Fallback rules

When no predicate in §2 matches:

1. `searchKB` retrieves top-3 chunks scoped to `{module: 3, phase: ffbd-foundations}` (post-G8/G9 ingest).
2. If `searchKB` confidence < 0.90 OR returns zero chunks → `surfaceGap` emits `needs_user_input` to `system-question-bridge.ts` with computed_options + math_trace.
3. User answer re-enters the loop at ContextResolver.

> Fallback contract is shared across all phase files. Per-phase override (if any) is documented in the educational body below.

## §4 STOP-GAP rules (machine-readable)

- **artifact_key:** `module_3/ffbd-foundations`
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
- **Runtime retrieval:** `searchKB(query, top_k, { module: 3, phase: 'ffbd-foundations' })` over the `kb_chunks` table (`0011a_kb_chunks.sql`, ivfflat lists=100; HNSW upgrade gated on `>10k` rows).
- **Provenance:** every retrieved chunk carries `{kb_source, chunk_hash, content, embedding_distance}`; rendered by `why-this-value-panel.tsx` (`provenance-ui` agent).

> The `kb_chunk_refs` array in frontmatter is left empty until the embedder backfills it. The runtime path does not depend on the static array — it queries the live table.

---

## Educational content (legacy, preserved)

> The body below is the pre-Wave-E text verbatim. It documents *why* this phase exists, the systems-engineering theory behind the prescribed steps, and the example-driven walkthroughs the LLM (and human readers) consume. The 6 sections above are the schema-first overlay locked by Wave-E γ-shape.

## Prerequisites
- [ ] You have read the [Module Overview](00_MODULE-OVERVIEW.md)
- [ ] **Optional but recommended:** you have completed [00A — Ingest Module 2 Handoff](00A_INGEST-MODULE-2-HANDOFF.md) if `ffbd-handoff.json` exists
- [ ] You have a system concept to analyze (for us: the open-source e-commerce platform)
- [ ] You have completed scope and requirements work (Modules 1 and 2) — you know the system's use cases

## Context (Why This Matters)

Defining a system's architecture is a **discovery process**, not a recording process. Unless your system is "alarm clock" simple, your first idea about how it operates will be incomplete. As you attempt to describe the system, you learn more about its intricacies — which inspires you to change the system for the better. Rarely are our first ideas the best. By exploring them, we discover new aspects and needs that must be addressed, leading to better solutions.

The FFBD exists precisely to **force that discovery**. It is deliberately simple so the team can start drawing quickly. It is deliberately visual so different stakeholders can read the same diagram and surface their different assumptions. And it is deliberately functional — not structural — so no one prematurely commits to a specific implementation before trade-offs have been evaluated.

The FFBD has been used in some variation for **over a century**, and still remains a professional standard today. That longevity is not accidental: it is the tool's flexibility and ease of use that make it the first architecture artifact most teams produce.

## What Is an FFBD?

A **Functional Flow Block Diagram (FFBD)** is a diagram that shows the operational flow of a system using **functional blocks** connected by **arrows**, with **logic gates** to represent iteration, parallelism, and alternative paths.

**Core structure:**

```
┌────────┐      ┌────────┐      ┌────────┐      ┌────────┐
│ F.1.1  │      │ F.1.2  │      │ F.1.3  │      │ F.1.4  │
├────────┤─────>├────────┤─────>├────────┤─────>├────────┤
│Onboard │      │List    │      │Serve   │      │Process │
│Merchant│      │Catalog │      │Session │      │ Order  │
└────────┘      └────────┘      └────────┘      └────────┘
```

It reads **left to right**, showing the order in which functions must be performed during system operation. Each block represents a **function** (what must happen), not a **component** (what will do it). Blocks are connected by arrows showing flow sequence, and logic gates (AND, OR, IT) capture parallelism, alternatives, and loops.

## FFBD vs. Other Architecture Tools

Other diagrams meet many of the same design needs as an FFBD:

| Tool | Origin | When Used |
|------|--------|-----------|
| **FFBD** | Defense/aerospace systems engineering (~100+ years) | First-pass operational flow, broad team communication |
| **Activity Diagram** | UML (software modeling) | Similar purpose; stronger on guards and object flow |
| **IDEF0 Diagram** | US Air Force (ICAM program) | Similar purpose; stricter on input/output/control/mechanism |
| **Flowchart** | General programming / business process | Weaker on hierarchy; less professional for architecture |

**Why FFBD specifically?** Its simplicity and flexibility make the *purpose and value of systems architecture tools* easier to recognize. Once you internalize the FFBD, you can transition fairly easily to Activity Diagrams or IDEF0 if your team prefers them. The skill is transferable.

## The Iteration Mindset

> **Iterate, iterate, iterate, and then iterate some more.**

This is not a slogan — it is the operational protocol. As you draft an FFBD, you will uncover:

- Functions you didn't know the system needed
- Interactions between parts you assumed were independent
- Error flows, timeouts, and retries you never mapped
- Alternative paths you didn't know existed
- Parallelism you hadn't recognized
- Hidden dependencies that cross team boundaries

**Heavy feedback on your first draft is a positive signal.** It means the FFBD is doing its job — exposing the architectural reality of the system. If everyone agreed with your first pass, either the system is trivial or your team hasn't engaged deeply with it.

## Variations and Your Team's Convention

Because FFBDs have been around so long, many variations exist. NASA uses one dialect; an entrepreneurial company uses another; defense contractors use a third. What we teach here is a variation that will be recognized as professional by any group and adjusts easily to other conventions.

**The most important rule:** whatever variation you use, **your team must be consistent**. An inconsistent FFBD cannot be properly interpreted by its readers — and an uninterpretable FFBD is worthless.

## Tool Choice

For this module, use **Microsoft PowerPoint** (or Visio, Lucidchart, or CORE). Why PowerPoint?

1. Nearly universal availability
2. Familiar to most users — low barrier
3. Good enough for up to ~30 blocks per diagram
4. Exports cleanly to PDF and PNG for distribution

Regardless of tool, **expect multiple iterations**. Do not invest in clean formatting until the content is stable.

## The FFBD Is a Catalyst

The single most underrated value of an FFBD: it **surfaces assumptions**.

Consider a team building an e-commerce platform. The FFBD has a block called "F.4.1 Securely Process Payment." To the payments engineer, this is the entire world. To the storefront engineer, it looks like one small block. When the payments engineer says "actually there are seven sub-functions inside that block, including fraud scoring, 3-D Secure, and refund handling," the storefront engineer learns that their apparently simple checkout flow depends on significant complexity elsewhere.

That conversation would not happen without the FFBD. **This is why you draw it.**

## Worked Example: Our Open-Source E-Commerce Platform

Throughout this module, we develop the FFBD for an open-source e-commerce platform serving multiple merchants. A preliminary written description might read:

> The platform is multi-tenant — merchants onboard, configure their storefront, list products, and sell to shoppers. Shoppers browse a CDN-served storefront, search for products, add them to a cart, check out, and pay via Stripe. On successful payment, an order record is created, notifications are sent via SendGrid, inventory is decremented, and fulfillment is triggered. The platform also exposes an admin dashboard for merchants to view orders, inventory, and analytics. Payment processing, inventory updates, and notifications must be reliable and auditable.

From this narrative, we will extract top-level functions and progressively build a hierarchical FFBD over the next 10 phases.

## Validation Checklist (STOP-GAP)
- [ ] Can you define an FFBD in one sentence? (A diagram showing the operational flow of a system using functional blocks, arrows, and logic gates)
- [ ] Can you state the iteration mindset? (Iterate, iterate, iterate — first drafts are always incomplete)
- [ ] Do you understand why FFBDs are functional, not structural?
- [ ] Do you have a non-trivial system concept ready to analyze?
- [ ] Have you chosen a drawing tool and will your team be consistent?

> **STOP: Do not proceed to Phase 2 until all items pass.**
> If the user has not provided a system concept, request one before continuing.

## Output Artifact

A shared understanding of what the FFBD is, why it exists, and how you will use it. No drawing yet — just commitment to the iteration mindset.

## Handoff to Next Phase

You understand the tool. Phase 2 covers the **single most important rule**: think functionally, not structurally. This is the rule most violated by first-time FFBD creators.

---

**Next →** [02 — Functional vs. Structural](02_FUNCTIONAL-VS-STRUCTURAL.md) | **Back:** [00 — Module Overview](00_MODULE-OVERVIEW.md)

