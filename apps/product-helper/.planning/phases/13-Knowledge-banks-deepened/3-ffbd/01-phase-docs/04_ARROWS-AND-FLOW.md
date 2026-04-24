# Phase 4: Arrows and Operational Flow

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
