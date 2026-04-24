# Phase 6: Shortcuts and Reference Blocks

## Prerequisites
- [ ] You have completed [Phase 5 — Logic Gates](05_LOGIC-GATES.md)
- [ ] Your top-level FFBD has correctly paired gates
- [ ] You have run into (or anticipate) readability problems — arrows that want to cross, or a diagram that is getting too dense

## Context (Why This Matters)

A technically correct FFBD that is **unreadable** is worthless. The whole point of the tool is to communicate with the team. Two components — **arrow shortcuts** and **reference blocks** — exist specifically to keep diagrams clean as complexity grows:

- **Arrow shortcuts** keep a **single diagram** readable when two distant blocks need to connect.
- **Reference blocks** connect **across multiple diagrams** so you can split a monster FFBD into smaller, focused ones.

These are the readability tools. Without them, real systems produce FFBDs nobody can read.

## Instructions

### Step 6.1: Recognize When to Use Arrow Shortcuts

Use an arrow shortcut when connecting two blocks **within the same diagram** would require an arrow that:

- Crosses other arrows
- Snakes across the entire page
- Would require an overlap or arrow jump

**The "wormhole" mental model:** an arrow enters a circle on one side of the diagram and pops out of a matching circle on the other side.

```
F.2.3 ──► (A)              (A) ──► F.2.7
```

These two circles labeled `A` are the **same** connection — one is the exit, one is the entry.

### Step 6.2: Draw Arrow Shortcuts

1. Draw a small **circle** (the shortcut marker) where the "source" arrow would otherwise need to go far across the diagram.
2. Draw a matching circle with the **same letter** at the destination.
3. Label the first shortcut `A`, the second `B`, the third `C`, and so on.
4. If you somehow exceed 26 shortcuts in one diagram, you should **rethink the layout** — but formally, the 27th is `AA`, then `BB`, and so on.

### Step 6.3: Arrow Shortcut Rules

| Rule | Why |
|------|-----|
| Shortcuts come in **matching pairs** of capital letters | One exits, one enters — always two |
| **Within a single FFBD diagram only** | For cross-diagram connections, use reference blocks |
| Letters assigned in **order of appearance** (A, B, C, ...) | Consistency for readers |
| Same formatting (size, font) throughout | Visual consistency |

### Step 6.4: Recognize When to Use Reference Blocks

Reference blocks connect blocks **across different FFBD diagrams**. Use them when:

| Use Case | Why |
|----------|-----|
| **Initialization / shutdown** flows | Clear start and end points, distinct from main operation |
| **Maintenance operations** | Separate functional group with its own flow |
| **Error / emergency handling** | Special-case flows that branch from normal operation |
| **Post-OR gate branching** to substantially different flows | When one branch goes in an entirely different operational direction |
| **Sectioning off** significant portions of a larger FFBD | To keep each diagram focused and readable |

**Rule of thumb:** Use reference blocks wherever the operational flow branches off in a significantly different direction, or where you want to split a giant FFBD into focused chunks.

### Step 6.5: Draw Reference Blocks

A reference block **looks like a functional block** (header + body) but with a distinctive naming pattern:

```
┌──────────┐
│ F.4 Ref  │   ← "Ref" indicates this is a reference, not a local function
├──────────┤
│ Process  │
│  Order   │
└──────────┘
```

- The **ID** carries the function number of the referenced diagram, followed by "Ref" (e.g., `F.4 Ref`, `F.7 Ref`).
- The **body** carries the **same name** as the referenced FFBD or block.
- A reference block typically appears at the **start** or **end** of a sub-diagram to show where the flow connects back to the parent diagram.

### Step 6.6: Reference Blocks vs. Hierarchical FFBDs

These are **related but distinct**:

| Technique | Use Case |
|-----------|----------|
| **Reference block** | Connecting two *separate but related* diagrams that are at the same level of abstraction (or where the reference is just a pointer) |
| **Hierarchical FFBD** (Phase 7) | Decomposing a single block into its own *lower-level* sub-diagram — like extracting a function in code |

**If a reference block starts looking like a sub-function** (same name, but decomposed into its own internal flow), you probably want a **hierarchical FFBD** instead (Phase 7). Hierarchical FFBDs are specifically designed for decomposing functions.

### Step 6.7: Connection Consistency (Best Practice)

When using reference blocks:

> **Any reference blocks in a lower-level diagram should relate to a connection made at the higher-level functional block, and vice versa.**

If connections flow *into* a higher-level block, those same connections should appear in its lower-level FFBD as reference blocks to whatever feeds that higher-level block.

This is not a hard FFBD rule, but it **is** required in related standards (like IDEF0) and is considered good practice.

## Worked Example: E-Commerce Platform Shortcuts and References

### Arrow Shortcut Example — Inside F.3 (Serve Shopper Session)

When F.3 is decomposed, the following situation arises:

```
F.3.1 Authenticate Shopper ──► F.3.2 Render Storefront
                                        │
                                        ▼
F.3.3 Search Products ──► F.3.4 Filter/Sort ──► F.3.5 Render Results
                                                        │
                                                        ▼
F.3.6 Add to Cart ──► F.3.7 Update Cart State ──► F.3.8 Checkout Initiated
                              ▲
                              │
                              (if shopper edits cart from any page)
```

The "edit cart" return path needs to go from F.3.5 back to F.3.7, crossing several other arrows. Instead:

```
F.3.5 Render Results ──► (A)      (A) ──► F.3.7 Update Cart State
```

Two matching circles labeled `A` replace the long crossing arrow. The diagram stays readable.

### Reference Block Example — Splitting F.4 Process Order into Its Own Diagram

F.4 Process Order is complex (payment authorization, fraud scoring, inventory reservation, order persistence). Instead of cramming all that into the top-level FFBD, we split it out.

**Top-level FFBD (Function 1 : System Operation):**
```
... F.3 Serve Shopper Session ──► F.4 Process Order ──► F.5 Fulfill Order ...
```

**Separate FFBD (Function 4 : Process Order) — starts and ends with reference blocks:**
```
┌────────┐
│F.3 Ref │───► F.4.1 Validate Cart ──► F.4.2 Authorize Payment
│Serve   │                                       │
│Shopper │                                       ▼
│Session │                             F.4.3 Score Fraud Risk
└────────┘                                       │
                                                 ▼
                                       F.4.4 Reserve Inventory
                                                 │
                                                 ▼
                                       F.4.5 Persist Order ──► ┌────────┐
                                                                │F.5 Ref │
                                                                │Fulfill │
                                                                │ Order  │
                                                                └────────┘
```

The reference block `F.3 Ref : Serve Shopper Session` shows where this sub-flow starts (coming from the top-level diagram). The reference block `F.5 Ref : Fulfill Order` shows where it exits back to the top-level flow.

**Reader benefit:** Anyone reading the "Function 4 : Process Order" diagram immediately sees what comes before and what comes after, without needing to open the top-level diagram.

## Common Mistakes

### Mistake 1: Shortcuts Used Across Diagrams
**Symptom:** An arrow shortcut circle `A` appears in one diagram and another `A` appears in a different diagram.
**Why it breaks:** Shortcuts are within-diagram only. Cross-diagram connections use reference blocks.
**Fix:** Replace the cross-diagram shortcut with matching reference blocks.

### Mistake 2: Shortcut Letters Out of Order
**Symptom:** Shortcuts labeled `A`, `C`, `B` (in drawing order).
**Fix:** Relabel in order of left-to-right, top-to-bottom appearance.

### Mistake 3: Reference Block Named Inconsistently
**Symptom:** Top-level FFBD says `F.4 Process Order` but the reference block in a sub-diagram reads `F.4 Ref : Payment Processing`.
**Why it breaks:** Name drift breaks traceability between diagrams.
**Fix:** Reference block body text must match the referenced block's functional name exactly.

### Mistake 4: Reference Block Used Where Hierarchical Decomposition Fits Better
**Symptom:** A reference block "Function 5 : Process Payment" has its own detailed sub-diagram that is clearly *inside* F.5 conceptually.
**Fix:** Treat it as a hierarchical FFBD (Phase 7) — title `Function 5 : Process Payment` with sub-blocks `F.5.1`, `F.5.2`, etc.

### Mistake 5: Too Many Shortcuts in One Diagram
**Symptom:** You find yourself at `Z` and still need more.
**Fix:** The diagram is probably too dense. Either split it using reference blocks, or decompose complex blocks into sub-diagrams (Phase 7).

## Validation Checklist (STOP-GAP)
- [ ] All arrow shortcuts come in **matching letter pairs** (e.g., two `A` circles, two `B` circles)
- [ ] Shortcut letters are assigned in **alphabetical order of appearance**
- [ ] No shortcut connects across *different* diagrams (those use reference blocks instead)
- [ ] Reference blocks are named with `F.<N> Ref` and match the referenced function's name exactly
- [ ] Reference blocks appear only where a flow crosses diagram boundaries
- [ ] Connection consistency: entries/exits on a higher-level block appear as reference blocks in its sub-diagram
- [ ] No diagram has excessive shortcuts (more than ~6 pairs) — if it does, decompose or split
- [ ] All shortcut circles and reference blocks are formatted consistently

> **STOP: Do not proceed to Phase 7 until all checks pass.**

## Output Artifact

A cleaner top-level FFBD with shortcuts replacing long crossing arrows, and reference blocks staged for any diagrams you plan to split out.

For our e-commerce platform: top-level FFBD with reference block hooks ready for F.3 and F.4 sub-diagrams.

## Handoff to Next Phase

You can now keep a single diagram readable. But complexity grows beyond what any single diagram can hold. Phase 7 covers **hierarchical decomposition** — how to drill down from high-level FFBDs into lower-level detail without losing traceability.

---

**Next →** [07 — Hierarchical FFBDs](07_HIERARCHICAL-FFBDS.md) | **Back:** [05 — Logic Gates](05_LOGIC-GATES.md)
