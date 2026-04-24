# Phase 9: Building and Iterating

## Prerequisites
- [ ] You have completed [Phase 8 — EFFBD Data Blocks](08_EFFBD-DATA-BLOCKS.md)
- [ ] You have a complete hierarchical FFBD set (top-level + sub-diagrams + data blocks)
- [ ] You are ready to show your FFBD to your team for review

## Context (Why This Matters)

A first-pass FFBD **is never correct**. That is the point. The tool's value is not in the final diagram — it is in the discussions, discoveries, and alignment that happen *while iterating*.

Teams that skip iteration end up with FFBDs that document one person's assumptions, not the system. Teams that iterate 2-3 rounds end up with FFBDs that genuinely represent the system and surface the gaps that would otherwise only appear mid-sprint.

This phase describes the **7-round interactive workflow** for building and iterating an FFBD, either with a team or with an AI agent acting as a facilitator.

## The 7-Round Workflow

Each round focuses on one aspect. You may need more than 7 total passes — some rounds may need multiple iterations — but these 7 cover the full arc from blank page to validated artifact.

### Round 1: Identify Top-Level Functions

**Goal:** Produce a list of 7–15 candidate top-level functions.

**Prompt the team (or yourself):**

```
Based on the system's use cases and requirements:
  - What are the MAJOR operational functions the system must perform?
  - What happens FIRST? LAST? WHAT repeats? WHAT runs in parallel?
  - Which functions are absolutely core, and which are supporting?

For each candidate function:
  - Is the name FUNCTIONAL (verb + object), not structural?
  - Is it at the right level — not too high (vague), not too low (impl detail)?
  - Does every use case from the requirements map to at least one function?
```

**Output:** A list of 7–15 top-level candidate functions, each with a functional name.

### Round 2: Define Flow Order and Relationships

**Goal:** Connect the functions with correctly-typed arrows.

**Prompt:**

```
Now let's establish the flow between these functions. For each connection:
  1. Does B happen IMMEDIATELY after A? → Trigger arrow (solid)
  2. Does B happen SOMETIME LATER after A? → Precedes arrow (dashed)

Also consider:
  - Do any functions run IN PARALLEL? → AND gate
  - Are any functions ALTERNATIVE paths? → OR gate
  - Do any functions REPEAT in a loop? → IT gate

Start with: After "[Function 1]" completes, what happens next?
Does the next function start immediately, or is there a meaningful delay?
```

**Output:** A draft FFBD with arrows connecting all functions, some gates identified.

### Round 3: Identify Logic Gates

**Goal:** Capture every loop, branch, and parallel operation.

**Prompt:**

```
I see these branching points in the flow. Let me confirm each one:

For each candidate gate:
  - OR: "What determines which path is taken?" (label each with conditions)
  - IT: "What ends the loop?" (add termination condition)
  - AND: "Do all parallel paths need to complete before continuing?"

Also: is the branching ARCHITECTURAL (OR gate — alternative paths exist)
or is it RUNTIME DECISION (decision diamond — evaluate a condition)?
```

**Output:** All gates paired, all IT gates with termination conditions, all OR gates with path labels.

### Round 4: Decompose Complex Functions

**Goal:** Identify blocks that need their own sub-diagrams.

**Prompt:**

```
Some top-level functions hide significant complexity. For each:
  - What sub-functions does it contain?
  - Are there decision points inside?
  - Are there parallel operations inside?
  - Which teams collaborate inside this block?

Pick the 3-5 most complex blocks. For each, draft a sub-diagram titled
"Function <N> : <Name>" with sub-blocks numbered F.N.1, F.N.2, ...
```

**Output:** Top-level FFBD + one or more sub-diagrams, all correctly titled and numbered.

### Round 5: Add Arrow Labels and Data Blocks

**Goal:** Make information flow explicit.

**Prompt:**

```
For each arrow, ask:
  - What INFORMATION passes between these functions?
  - Are there any CONSTRAINTS on the handoff?
  - What TRIGGERS the next function to start?

For each significant external input:
  - Does it deserve a data block (rounded-corner rectangle)?
  - Or is an arrow label sufficient?

Examples:
  F.3 ──[validated cart, shopper_id]──► F.4
  F.4 ──[order_id, amount, payment_token]──► F.5
```

**Output:** Arrows labeled with payload information where meaningful; data blocks added for significant external dependencies.

### Round 6: Review, Validate, and Flag Uncertainty

**Goal:** Systematically check for errors and mark what you don't yet know.

Run the **Completeness Check:**

```
COMPLETENESS
  [ ] Every use case from requirements has at least one function
  [ ] Every function has ≥1 incoming and ≥1 outgoing arrow (except entry/exit)
  [ ] All logic gates have matching pairs (open + close)
  [ ] IT gates have explicit termination conditions
  [ ] OR gates have conditions on paths (one unlabeled default allowed)
  [ ] AND gates synchronize all parallel paths
  [ ] Hierarchical sub-diagrams are numbered consistently (F.3.1, F.3.2, ...)
```

Run the **Quality Check:**

```
QUALITY
  [ ] All block names are FUNCTIONAL (no structural elements)
  [ ] Block IDs follow F.<N>.<M> convention
  [ ] Arrow types (trigger vs. precedes) are used correctly
  [ ] Formatting is consistent (block sizes, gate sizes, fonts)
  [ ] No overlapping arrows (shortcuts or rearrangement used)
  [ ] Data blocks are rounded; functional blocks are square
```

Mark every function with an **uncertainty level**:

| Color | Meaning |
|-------|---------|
| 🟢 **Green** | Well-understood, standard patterns, low risk |
| 🟡 **Yellow** | Concept is solid but edge cases need resolution |
| 🔴 **Red** | Least defined, open questions remain, highest risk |

**Output:** Validated FFBD with uncertainty coloring.

### Round 7: Identify Interfaces and Address Red Items First

**Goal:** Translate the FFBD into actionable next steps.

**Prompt:**

```
Where in the FFBD do different teams or services need to communicate?
Those are your KEY INTERFACES — they become rows in Module 6's
Interface Matrix.

For the RED (highest uncertainty) functions:
  - What open questions need to be resolved?
  - Which questions block the most downstream work?
  - What experiments, prototypes, or specs are needed to resolve them?

Red items should be addressed FIRST because:
  - They affect how downstream functions are designed
  - Resolving them late forces rework across the entire flow
  - Early resolution lets yellow/green work proceed with confidence
```

**Output:** A prioritized list of interfaces and open questions. The FFBD itself is now *done for this iteration*.

## Iteration Protocol

**Do not aim for perfection on the first pass.**

| Pass | Goal |
|------|------|
| **Pass 1** | Draft on whiteboard or rough tool. Don't worry about formatting. Focus on content — functions, flow, gates. |
| **Pass 2** | Team review. Expect heavy feedback. Missing functions, wrong order, misnamed blocks — all normal. |
| **Pass 3** | Incorporate feedback. Add missing functions. Rename structural blocks. Fix gate pairings. |
| **Pass 4** | Format properly in PowerPoint/Visio. Apply consistent sizing, square/rounded corners, rectilinear arrows. |
| **Pass 5** | Second team review focused on accuracy (does it match what the system actually does?). |
| **Pass 6+** | Polish, sub-diagram decomposition, data blocks, labels. |

**Heavy feedback is a positive signal.** If your first draft gets minor tweaks only, either the system is trivial or the team did not engage critically. Invite harder questions.

## Team Dynamics

### The "Implicit Function" Problem

Different roles have different blind spots. Use the FFBD to surface what each person assumes everyone else knows:

- **Sensors engineer:** assumes "attach device" is trivial. **Housing engineer** says: "actually this is non-obvious for our device."
- **Backend engineer:** assumes "serve storefront" is a single function. **Frontend engineer** says: "there are seven different render paths depending on shopper state."
- **Product manager:** assumes payment is simple. **Payments engineer** says: "Stripe handles 3-D Secure, but the fallback flow adds 3 more functions."

Every one of these discoveries is a **win**. The FFBD's job is to extract them.

### The "Mode Change" Problem

Some functions look identical at the top level but behave differently in context. The "Confirm Sensor Node Contact" block might mean different things for wrist vs. chest sensors. Use suffixes (A, B) or separate blocks to distinguish — this prevents assuming identical implementations.

## Worked Example: Iterating the E-Commerce FFBD

### Pass 1 (initial draft)
The engineer drafts a 5-block flow:
```
Onboard Merchant → Serve Storefront → Process Order → Fulfill Order → Report
```

### Pass 2 (team review feedback)
- **Infra lead:** "You're missing 'Provision Platform' — the platform itself has to be set up first."
- **Payments engineer:** "Process Order isn't one function. It has authorization, fraud scoring, inventory reservation, and order persistence."
- **SRE:** "Where's continuous monitoring? That runs the whole time."
- **Compliance:** "GDPR and PCI constraints govern multiple functions but aren't shown."

### Pass 3 (incorporate feedback)
- Added F.1 Provision Platform
- Added F.6 Monitor & Operate
- Marked F.4 Process Order for decomposition
- Added a "Compliance Policy" data block
- Reordered flow with IT gate for continuous operation

### Pass 4 (format properly)
- Clean PowerPoint version
- Consistent block sizes, proper IDs
- Arrow types assigned (trigger vs. precedes)

### Pass 5 (second review — accuracy check)
- **Frontend engineer:** "Shopper Session is one block? It's actually a whole loop — browse, search, cart, checkout."
- **Response:** Marked F.3 for hierarchical decomposition.

### Pass 6+ (decomposition and polish)
- Sub-diagrams for F.3, F.4, F.5
- Data blocks added, arrow labels, shortcuts for readability
- Uncertainty colors applied

### Final state
- Top-level FFBD: 7 blocks, 6 arrows, IT gate, AND fork
- Function 3 sub-diagram: 7 sub-blocks, OR gate, IT gate
- Function 4 sub-diagram: 5 sub-blocks (sequential)
- Function 5 sub-diagram: 3 sub-blocks (AND-forked)
- 4 data blocks on top-level
- All IDs trace cleanly through hierarchy
- 2 Red items flagged (fraud scoring confidence thresholds; escalation handoff protocol)

## Validation Checklist (STOP-GAP)
- [ ] **Color-coded uncertainties applied** (Red / Yellow / Green) on your evolved FFBD (course hard minimum — see [DELIVERABLES-AND-GUARDRAILS.md](DELIVERABLES-AND-GUARDRAILS.md))
- [ ] **Informal list of interfaces** drafted (numbered I-1, I-2, ... — will be submitted on a separate slide)
- [ ] At least **2 full team review passes** have been completed
- [ ] Every team member involved in building any function has reviewed the diagram
- [ ] All feedback from review has been incorporated (or explicitly deferred with rationale)
- [ ] Uncertainty colors (Green/Yellow/Red) have been applied
- [ ] At least one Red item has been identified with specific open questions
- [ ] Every function has been revisited to confirm it is still at the right level of abstraction
- [ ] Your team explicitly signs off on the current version as "accurate enough to proceed"

> **STOP: Do not proceed to Phase 10 until team sign-off has been reached.**

## Output Artifact

A team-validated hierarchical FFBD set with uncertainty markers and a prioritized list of open questions. Ready for final validation.

## Handoff to Next Phase

Iteration is complete. Phase 10 covers the **six common mistakes** that still slip through — the last-line-of-defense checklist before you hand the FFBD off to Module 4.

---

**Next →** [10 — Validation and Common Mistakes](10_VALIDATION-AND-COMMON-MISTAKES.md) | **Back:** [08 — EFFBD Data Blocks](08_EFFBD-DATA-BLOCKS.md)
