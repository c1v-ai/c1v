# Phase 5: Logic Gates (IT, OR, AND)

## Prerequisites
- [ ] You have completed [Phase 4 — Arrows and Operational Flow](04_ARROWS-AND-FLOW.md)
- [ ] You have a connected top-level FFBD with trigger/precedes arrows
- [ ] You know where your system **loops**, **branches**, or **runs in parallel**

## Context (Why This Matters)

Straight-line sequential flow is rare in real systems. The moment you describe "*runs until the shift ends*" or "*either the cache hits or we query the database*" or "*send the notification and update inventory at the same time*" — you need logic gates.

Gates are what make the FFBD competitive with — and often superior to — other architecture diagrams for expressing control flow. They are compact, visual, and unambiguous when used correctly.

## Instructions

### Step 5.1: Understand the Three Gate Types

| Gate | Symbol | Meaning | Think of it as... |
|------|--------|---------|-------------------|
| **IT** | `(IT)` | **Iteration** — the flow repeats (a loop) | A `while` loop |
| **OR** | `(OR)` | **Alternative paths** — the flow takes one of several possible routes | A conditional `if/else` branch |
| **AND** | `(AND)` | **Parallel operations** — multiple functions run concurrently | Threads / async forks |

Gates are sometimes called **summary gates**, **control triggers**, **control gates**, or simply **gates** — different sources use different terms. This KB uses **gates**.

### Step 5.2: Gates Come in Pairs — Like Curly Brackets

**Every gate is a pair: an opening gate and a closing gate.** Think of them exactly like `{` and `}` in code:

```
(IT) ... (IT)    ← opens the loop, closes the loop
(OR) ... (OR)    ← splits alternative paths, merges them back
(AND) ... (AND)  ← forks parallel paths, joins them back
```

An unpaired gate is as broken as an unmatched curly brace — the reader cannot determine where the loop ends, where the paths merge, or whether parallel operations need to synchronize.

### Step 5.3: Use IT Gates for Loops

```
(IT) ──► F.3.1 ──► F.3.2 ──► F.3.3 ──► (IT)
  ▲                                      │
  └──────── Until {end condition} ───────┘
```

**Rules:**
- Opening IT gate goes **just before** the first block in the loop.
- Closing IT gate goes **just after** the last block in the loop.
- An arrow loops from the closing IT **back to** the opening IT.
- That arrow is labeled with the **end condition** of the loop.

**Why the end condition is non-negotiable:** without it, the loop reads as infinite. Every IT gate must carry an explicit termination label.

**Example end conditions:**
- *Until session ends*
- *Until cart is checked out or abandoned*
- *Until all items processed*
- *Until kill switch fires*
- *Until error threshold exceeded*

### Step 5.4: Use OR Gates for Alternative Paths

```
                ┌──► F.X.2a (if condition A)
(OR) ──► F.X.1 ─┤
                └──► F.X.2b (default)
                          │
                          ▼
                         (OR) ──► F.X.3
```

**Rules:**
- Opening OR gate goes where the operational flow **splits**.
- Closing OR gate goes where the alternative paths **merge**.
- Arrows leaving the opening OR are **labeled with the condition** that selects that path.
- If all-but-one path has a condition label, the unlabeled arrow is the **default path**.
- If all paths carry conditions, no default exists — if no condition matches, the flow is undefined (almost always a bug).

**OR vs. decision diamond:** A decision diamond (`◇`) is common in flowcharts and represents a **runtime evaluation** — "if condition, then path A, else path B." An OR gate represents **architectural alternatives** — "the system could operate via path A *or* path B." Both are used in FFBDs; choose based on whether the branching is architectural or runtime.

### Step 5.5: Use AND Gates for Parallel Operations

```
         ┌──► F.X.2a ───┐
(AND) ──►                ──► (AND) ──► F.X.3
         └──► F.X.2b ───┘
```

**Rules:**
- Opening AND gate goes where the flow **forks into parallel branches**.
- Closing AND gate goes where the parallel branches **synchronize** (all must complete before proceeding).
- Arrows leaving the opening AND are **usually unlabeled**.
- The one exception: **resource allocation** (e.g., "50% CPU to branch A, 30% to branch B, 20% to branch C"). When labeling, label **all** arrows — never mix labeled and unlabeled in an AND fork.

**Why AND synchronizes:** an AND gate means "all parallel paths must complete before continuing." If the next function only needs **one** branch to finish, that is an OR, not an AND.

### Step 5.6: Nest Gates Freely

Gates can be nested as deeply as needed — exactly like nested control flow in code:

```
(IT) ──► F.X.1 ──► (AND) ──► F.X.2a ──► (AND) ──► F.X.3 ──► (IT)
                    └──► F.X.2b ──►┘
  ▲                                                             │
  └──────────── Until session ends ────────────────────────────┘
```

This diagram says: **while** session is active, **run** F.X.1, **then in parallel** F.X.2a and F.X.2b, **then** F.X.3, **then repeat**.

### Step 5.7: Apply Formatting Rules

| Rule | Why |
|------|-----|
| **All gates same size** throughout the FFBD | Visual consistency |
| Text inside gate circle: **all caps, bold** | Standard convention |
| Font size within **one size** of the block body text | Subordinate but readable |
| **Same font size for all gates** in the diagram | Consistency |
| Gates always come in **matching pairs** | Brackets must match |

## Worked Example: E-Commerce Platform with Gates

The top-level flow from Phase 4 is too simple — real behavior includes loops and parallelism. Here is the gated version:

```
F.1 Provision Platform ──► F.2 Onboard Merchant ──►
    (IT) ──► F.3 Serve Shopper Session ──► F.4 Process Order ──►
              (AND) ──► F.5a Update Inventory ──►
                    ──► F.5b Send Notifications ──►  (AND) ──► F.6 Monitor & Operate ──► (IT)
                    ──► F.5c Trigger Shipping ──►
    ▲                                                                                       │
    └─────────────────────── Until merchant deactivates ─────────────────────────────────────┘
    - - -► F.7 Generate Merchant Reports
```

### Gate-by-gate rationale

| Gate | Type | Why This Gate, Not Another |
|------|------|---------------------------|
| Wrapper around F.3–F.6 | **IT** | The platform runs continuously while the merchant is active; it is not a one-shot flow. End condition: *Until merchant deactivates*. |
| Fork at F.5 (fulfillment) | **AND** | Inventory update, notification delivery, and shipping trigger run **in parallel** on successful payment. All three must complete before monitoring logs the full fulfillment event. If any one was optional or mutually exclusive, this would be OR. |
| (Implicit) OR gates inside F.3 | **OR** | Covered when F.3 is decomposed in Phase 7 — search results from the cache OR from the database; checkout via saved card OR new card. |

### End condition for the IT gate

*Until merchant deactivates* is the termination label. Without it, the loop implies infinite operation — which is *nearly* true for a live platform, but formally we always name a terminal condition for correctness.

## Common Mistakes

### Mistake 1: Unpaired Gate
**Symptom:** An AND gate opens parallel paths but no closing AND gate merges them back.
**Why it breaks:** Where do the parallel paths synchronize? Does the next function need all of them, any of them, or just one?
**Fix:** Add the matching closing gate. If you meant "any one finishing proceeds," it's actually an OR, not an AND.

### Mistake 2: IT Gate Without End Condition
**Symptom:** Return arrow on an IT gate carries no label.
**Why it breaks:** Reads as an infinite loop.
**Fix:** Label the return arrow with the explicit termination condition (e.g., *Until session ends*).

### Mistake 3: OR When It's Actually a Decision
**Symptom:** An OR gate has no architectural alternative — one path is *always* taken under condition X, the other under condition Y, evaluated at runtime.
**Fix:** Use a decision diamond (◇) with branches labeled Yes/No or with conditions. OR is for architectural alternatives ("the system could operate via API *or* file upload"); decision is for runtime evaluation.

### Mistake 4: AND When It's Actually OR
**Symptom:** You used AND to show "either API call OR file upload provides the data."
**Why it breaks:** AND means **all** paths execute. OR means **one** path executes.
**Fix:** Change to OR; add condition labels to the outgoing paths.

### Mistake 5: Mixing Labeled and Unlabeled in AND Fork
**Symptom:** Two of three AND-outgoing arrows carry resource labels; one does not.
**Fix:** Either label all three or label none. Mixed labeling is ambiguous.

### Mistake 6: Inconsistent Gate Sizes
**Symptom:** Some (AND) gates are circles 2cm wide; others are 1cm wide.
**Fix:** Standardize on one size for all gates in the diagram.

## Validation Checklist (STOP-GAP)
- [ ] **Your diagram has at least 2 logic gate pairs** (course hard minimum — any combination of IT/OR/AND — see [DELIVERABLES-AND-GUARDRAILS.md](DELIVERABLES-AND-GUARDRAILS.md))
- [ ] Every gate has a matching pair (open + close)
- [ ] Every IT gate has an explicit termination condition on the return arrow
- [ ] Every OR gate has condition labels on its outgoing arrows (at most one unlabeled default)
- [ ] AND gates fork **parallel** operations that must **all** complete before the closing AND
- [ ] Gate-vs-decision: architectural alternatives use OR; runtime branching uses a decision diamond
- [ ] All gates are the same size in the diagram
- [ ] Gate text is all caps, bold, consistent font size
- [ ] Nested gates are structurally correct (inner pairs close before outer pairs)

> **STOP: Do not proceed to Phase 6 until all checks pass.**
> Unpaired gates and missing termination conditions are the two most common FFBD errors — catch them here.

## Output Artifact

A top-level FFBD with correct gate structure — every loop, branch, and parallel operation captured unambiguously.

For our e-commerce platform: IT gate wrapping the main service loop, AND gate on fulfillment parallelism, with F.3 marked for decomposition (where OR gates will live inside).

## Handoff to Next Phase

Gates add control flow. But dense diagrams with many gates and arrows quickly become unreadable. Phase 6 introduces **shortcuts and reference blocks** to keep even complex diagrams clean.

---

**Next →** [06 — Shortcuts and Reference Blocks](06_SHORTCUTS-AND-REFERENCE-BLOCKS.md) | **Back:** [04 — Arrows and Operational Flow](04_ARROWS-AND-FLOW.md)
