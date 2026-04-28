# Phase 10: Validation and Common Mistakes

## Prerequisites
- [ ] You have completed [Phase 9 — Building and Iterating](09_BUILDING-AND-ITERATING.md)
- [ ] Your FFBD has been through at least 2 team review passes
- [ ] You believe the FFBD is "done" — this phase tests that claim

## Context (Why This Matters)

After 2-3 iteration passes, a team usually *feels* the FFBD is complete. This feeling is often wrong. Six specific mistakes slip past iteration again and again, and each one undermines either the correctness or the communication value of the diagram.

This phase is the **last-line-of-defense checklist**. Run it as a final pass before the FFBD leaves the team. Any one of these mistakes, uncaught, will resurface downstream in Modules 4-7 as rework.

## The Six Common Mistakes

### Mistake 1: Structural Names Slipped In

**Symptom:** A block is labeled with a vendor, library, or component name.

**Examples:**
- `F.3.1 Stripe Checkout` → should be `F.3.1 Process Payment`
- `F.4.2 PostgreSQL Insert Order` → should be `F.4.2 Persist Order Record`
- `F.5.3 SendGrid Send Email` → should be `F.5.3 Deliver Order Confirmation`

**Why it breaks:** Locks the team into a specific implementation before Module 4's Decision Matrix has been built. Forecloses better options.

**Correction pattern:**
```
Hold on — "{structural_name}" is a STRUCTURAL element, not a function.

What FUNCTION does that component serve?
  - Option 1: "{functional_option_1}"
  - Option 2: "{functional_option_2}"

The FFBD describes what must HAPPEN, not what will DO it.
Let's rename this to the function it achieves.
```

---

### Mistake 2: Unpaired Logic Gates

**Symptom:** An AND, OR, or IT gate opens but has no matching close (or vice versa).

**Example:**
```
(AND) ──► F.4.2a ──► ???
     └──► F.4.2b ──► F.4.3
```

The AND opens parallel paths but there's no closing AND to synchronize them before F.4.3.

**Why it breaks:**
- AND: where do the parallel paths synchronize? Does F.4.3 need both branches finished, either one, or only the one that arrives first?
- OR: where do the alternative paths merge? Readers cannot determine when the flow rejoins.
- IT: where does the loop close? The flow has no defined end-of-loop.

**Correction:**
- Add the matching closing gate at the point where paths should merge or synchronize.
- If AND doesn't fit (because only one path needs to finish), change to OR.

---

### Mistake 3: Missing Termination Condition on IT Gates

**Symptom:** An IT gate creates a loop with no label on the return arrow.

**Example:**
```
(IT) ──► F.3.1 ──► F.3.2 ──► (IT)
  ▲                              │
  └──────────── (no label) ──────┘
```

**Why it breaks:** Implies an infinite loop. Real loops always have a termination condition — the FFBD must state it explicitly.

**Correction:**
```
(IT) ──► F.3.1 ──► F.3.2 ──► (IT)
  ▲                              │
  └─── Until shopper checks out or abandons ───┘
```

**Common termination conditions:**
- *Until session ends*
- *Until all items processed*
- *Until error threshold exceeded*
- *Until shift ends*
- *Until kill switch fires*
- *Until merchant deactivates*

---

### Mistake 4: Confusing OR with Decision Diamond

**Symptom:** An OR gate is used where a runtime decision evaluates a condition at runtime.

**Example:**
```
F.5.2 ──► (OR) ──► F.5.3a (if risk level changed)
              └──► F.5.3b (default)
```

If this is **evaluating a condition at runtime**, it should be a decision diamond, not an OR gate.

**Distinction:**

| Gate Type | Meaning |
|-----------|---------|
| **OR gate** | Architectural alternative — "the system could operate via path A *or* path B" |
| **Decision diamond** (◇) | Runtime evaluation — "if condition X then path A else path B" |

Both are valid in FFBDs. Choose based on whether the branching is an **architectural alternative** or a **runtime decision**.

**Example of correct OR usage:**
```
(OR) ──► F.3.3a Serve from CDN Cache (if cache hit)
      └──► F.3.3b Query Origin Server (default)
```
Both paths exist architecturally; the system "could do either." This is OR.

**Example of correct decision diamond:**
```
F.5.2 ──► ◇ Risk level changed? ──Yes──► F.5.3 Send Alert
                                  └─No──► F.5.4 Log Only
```
A condition is evaluated at runtime. This is a decision diamond.

---

### Mistake 5: Too Much Detail at One Level

**Symptom:** A single diagram has 20+ blocks crammed in.

**Why it breaks:** Unreadable. Loses the purpose of a top-level view. Professional FFBDs typically have **7-15 blocks per diagram**.

**Correction:** **Hierarchical decomposition** (Phase 7).

1. Identify the 3-5 most complex blocks.
2. Decompose each into its own sub-diagram titled `Function <N> : <Name>`.
3. Sub-block IDs prefix with parent function number: `F.N.1`, `F.N.2`, ...
4. Replace the complex blocks in the top-level diagram with single blocks that point to their sub-diagrams.

**Example:**
```
BEFORE: Top-level FFBD with 28 blocks, unreadable

AFTER:  Top-level FFBD with 7 blocks
      + Function 3 sub-diagram (F.3.1 - F.3.8)
      + Function 4 sub-diagram (F.4.1 - F.4.5)
      + Function 5 sub-diagram (F.5.1 - F.5.3)
```

---

### Mistake 6: Floating Arrows and Overlapping Arrows

**Symptom 1 (floating):** An arrow ends 2-3mm short of a block edge — not touching.

**Symptom 2 (overlapping):** Two arrows cross each other with no resolution.

**Why it breaks:**
- Floating arrows are **ambiguous** — readers can't tell which block the arrow connects to.
- Overlapping arrows look **sloppy** and are flagged in professional review.

**Corrections:**

For floating arrows:
- Snap endpoints to block edges. Most tools have a "snap to shape" option.

For overlapping arrows:
1. **Rearrange blocks** so arrows don't need to cross — this is the preferred fix.
2. If unavoidable, use **arrow shortcuts** (Phase 6): matching letter-in-circle pairs that replace the long crossing arrow.
3. **Arrow jumps** (half-circle bumps where arrows cross) are acceptable in some formats but still considered inferior to clean layout.

---

## Extra Validation Checks (Beyond the Six)

Run these additional checks before signing off:

### Completeness Checks
- [ ] Every use case from requirements has at least one function representing it
- [ ] Every function has ≥1 incoming and ≥1 outgoing arrow (except system entry and exit)
- [ ] Every block has a unique ID following the `F.<N>.<M>` convention
- [ ] Sub-block IDs use the parent function number as prefix
- [ ] Every sub-diagram is titled `Function <N[.M...]> : <Name>`
- [ ] Reference blocks at sub-diagram entry/exit show the parent context

### Correctness Checks
- [ ] Trigger (solid) vs. precedes (dashed) arrows are used correctly
- [ ] OR gate paths carry condition labels (one unlabeled default allowed)
- [ ] IT gates have explicit termination conditions
- [ ] AND gates represent genuine parallelism (not "either-or")
- [ ] Decision diamonds are used for runtime branches, not OR gates

### Formatting Checks
- [ ] Functional blocks have **square** corners; data blocks have **rounded** corners
- [ ] Block sizes use 2-3 consistent sizes throughout the diagram
- [ ] Gate sizes are uniform within each diagram
- [ ] Arrow labels are italicized, above the arrow, and unambiguously associated
- [ ] Text is centered in block bodies
- [ ] No color except for uncertainty marking (Red/Yellow/Green)
- [ ] Arrows are rectilinear with filled arrowheads; data-block arrows may be angled

### Quality Checks
- [ ] All block names are functional, not structural
- [ ] Naming is consistent across hierarchy levels (no drift)
- [ ] Repeated blocks either use arrow shortcuts (same I/O) or are renamed with suffixes (different behavior)
- [ ] Data blocks represent genuinely significant dependencies (not trivial arrow-label substitutes)
- [ ] Uncertainty colors have been applied; Red items are listed separately for follow-up

## Final Validation Walkthrough

Perform this 15-minute exercise before declaring done:

1. **Pick a random block ID** (e.g., `F.3.4.2`).
2. **Trace it up** the hierarchy — does the parent diagram exist? Does the grand-parent? Does the ID chain make sense?
3. **Follow the arrows forward** from that block — does every downstream path eventually reach a terminal function or loop back to a labeled IT gate?
4. **Follow the arrows backward** from that block — is there a clear path back to a system entry point?
5. **Check each gate** on the path — is it paired? Does IT have a termination? Do OR paths have conditions?
6. **Confirm the block name is functional.** Could you swap the implementation without renaming? If yes, it's functional.

Repeat for 3-5 random block IDs. If all pass, the FFBD is ready to hand off.

## Validation Checklist (STOP-GAP)
- [ ] All six common mistakes have been checked and corrected
- [ ] Extra validation checks (completeness, correctness, formatting, quality) all pass
- [ ] Random-walk validation (3-5 random block IDs) all pass
- [ ] Team has signed off on the final version
- [ ] Uncertainty colors applied and Red items listed separately

> **STOP: Do not proceed to Phase 11 until every check passes.**
> This is the final gate before handoff. An error caught here is 10x cheaper than an error caught in Module 4 or later.

## Output Artifact

A **validated**, team-approved, professionally formatted hierarchical FFBD set — ready to serve as the foundation for Module 4 (Decision Matrix), Module 5 (QFD), Module 6 (Interfaces), and Module 7 (FMEA).

## Handoff to Next Phase

Your FFBD is complete. Phase 11 shows how the FFBD feeds directly into Module 4's **Performance Criteria and Decision Matrix** — the first downstream artifact that depends on this work.

---

**Next →** [11 — From FFBD to Decision Matrix](11_FROM-FFBD-TO-DECISION-MATRIX.md) | **Back:** [09 — Building and Iterating](09_BUILDING-AND-ITERATING.md)
