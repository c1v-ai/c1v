# Phase 8: EFFBD — Data Blocks for External Inputs

## Prerequisites
- [ ] You have completed [Phase 7 — Hierarchical FFBDs](07_HIERARCHICAL-FFBDS.md)
- [ ] Your hierarchical FFBD set captures all the functional flow
- [ ] You can identify **external inputs** your system depends on but does not produce itself

## Context (Why This Matters)

Traditional FFBDs show only the operational flow **inside** the system. They do not directly represent:

- External inputs (user data, API payloads, environmental signals)
- Configuration parameters and specifications
- Regulatory or policy constraints
- System models and other non-operational dependencies

The **Extended FFBD (EFFBD)** adds one new element — the **data block** — to address this. A data block represents something the system **consumes** (or produces as a final output) that is not itself a function.

**Use data blocks sparingly.** They clutter diagrams fast. Favor arrow labels whenever possible, and reserve data blocks for dependencies significant enough to warrant their own visual element.

## Instructions

### Step 8.1: Recognize What Deserves a Data Block

A **data block** represents:

| Type | Example (E-Commerce Platform) |
|------|-------------------------------|
| **External inputs** entering the system | Shopper credentials, product catalog CSV upload, tax-rate feed |
| **Internal data flow** between functional blocks (replacing arrow labels) | Session token, cart state |
| **Non-functional dependencies** — information needed but not produced by any function | Pricing rules, tax tables, shipping-zone model |
| **Constraints or operational information** | Compliance policies (GDPR, PCI-DSS), SLA thresholds |
| **Specifications or configuration** | Feature flags, merchant-specific settings |

**The test:** is this thing a **function** (something that happens)? Then it's a functional block. Is it **information, material, or a constraint** that functions consume? Then it's a data block.

### Step 8.2: Draw Data Blocks

Data blocks are visually distinct from functional blocks:

| Element | Convention |
|---------|-----------|
| **Shape** | **Rounded-corner rectangle** (sometimes drawn as an oval) |
| **Fill** | Usually white or light gray (sometimes color-coded by category) |
| **Text** | The name of the data, not a function — a noun, not a verb+object |
| **Border** | Same thickness as functional block borders |

**Example:**

```
╭─────────────╮
│  Compliance │   ← rounded corners distinguish it from a functional block
│    Policy   │
╰─────────────╯
```

Compare to a functional block:

```
┌─────────┐
│  F.4.2  │   ← square corners — this is a function
├─────────┤
│Validate │
│Consent  │
└─────────┘
```

### Step 8.3: Connect Data Blocks with Distinctive Arrows

Arrows to/from data blocks are typically drawn **at an angle** to distinguish them from the rectilinear operational-flow arrows:

```
           ╭───────────╮
           │ Compliance│
           │  Policy   │
           ╰─────┬─────╯
                 ╲
                  ╲    ← angled (diagonal) arrow — not rectilinear
                   ▼
          ┌──────────┐
          │  F.4.2   │
          ├──────────┤
          │Validate  │
          │Consent   │
          └──────────┘
```

Straight horizontal or vertical arrows are also acceptable when clarity is not compromised, but **angled is preferred** to signal "this is a data dependency, not an operational flow."

### Step 8.4: Combine with Arrow Shortcuts (Optional)

Data blocks can feed into arrow shortcuts when the same data is used by multiple functional blocks. This avoids duplicating the data block across the diagram while still showing every consumer.

### Step 8.5: Follow the "Use Sparingly" Rule

**Guidelines:**

1. **Prefer arrow labels first.** "F.4.2 → F.4.3 (*validated payment token*)" often communicates the same thing with less clutter.
2. **Use data blocks for the most significant external dependencies.** Not every single input needs its own block.
3. **Group related data.** Instead of three data blocks for "Shopper Email," "Shopper Address," and "Shopper Phone," use one labeled "Shopper Profile."
4. **Limit to 3–5 data blocks per diagram.** More than that and you've probably forgotten to use arrow labels.

## Worked Example: E-Commerce Platform Data Blocks

The top-level FFBD has several external dependencies worth calling out:

```
  ╭─────────────╮     ╭───────────────╮     ╭─────────────╮
  │  Merchant   │     │   Pricing &   │     │ Compliance  │
  │  Account    │     │   Tax Rules   │     │   Policy    │
  │    Config   │     │               │     │ (PCI/GDPR)  │
  ╰──────┬──────╯     ╰───────┬───────╯     ╰──────┬──────╯
         ╲                    ╲                    ╱
          ▼                    ▼                  ▼
  F.2 Onboard Merchant    F.4 Process Order   F.4.2 Validate Consent

  ╭─────────────╮
  │  Shopper    │
  │ Credentials │
  ╰──────┬──────╯
          ╲
           ▼
    F.3.1 Authenticate Shopper
```

**Why each is a data block and not a function:**

| Data Block | Why Not a Function |
|------------|-------------------|
| Merchant Account Config | Configuration input — the system consumes it but does not produce it |
| Pricing & Tax Rules | Reference data maintained outside the core order flow |
| Compliance Policy (PCI/GDPR) | Non-functional constraint — a rule, not an operation |
| Shopper Credentials | External input — provided by the shopper, not generated by a function |

**Why arrows are angled:** these are **data dependencies**, not **operational hand-offs**. The angled arrows tell the reader "this is input flowing in," distinct from the left-to-right rectilinear operational arrows.

### Alternative: Using Arrow Labels Instead

For less critical dependencies, an arrow label is enough:

```
F.3.0 Open Session ──[session_token]──► F.3.1 Authenticate Shopper
```

No data block needed — the `session_token` label on the arrow communicates the handoff.

## When to Use Data Blocks vs. Arrow Labels — Decision Table

| Situation | Use |
|-----------|-----|
| Small piece of data passed between two adjacent functional blocks | **Arrow label** |
| External input that enters the system from outside | **Data block** |
| Constraint or policy that governs a function | **Data block** |
| Configuration / specification that multiple functions depend on | **Data block** with arrow shortcut to multiple consumers |
| A system model, mathematical description, or reference table | **Data block** |
| Output of one function consumed immediately by the next | **Arrow label** (no data block needed) |
| The same data consumed by 3+ functions across the diagram | **Data block** + arrow shortcut |

## Common Mistakes

### Mistake 1: Data Block Used for a Function
**Symptom:** A rounded block is labeled "Validate Payment" (a verb phrase — a function).
**Fix:** Change to a square-corner functional block with a proper ID.

### Mistake 2: Functional Block Used for Data
**Symptom:** A square-corner block is labeled "Shopper Credentials" (a noun — data).
**Fix:** Change to a rounded-corner data block with no function ID.

### Mistake 3: Cluttered with Too Many Data Blocks
**Symptom:** 15 data blocks surround every function on the diagram.
**Fix:** Promote most to arrow labels. Reserve data blocks for 3–5 most significant dependencies.

### Mistake 4: Rectilinear Arrows Between Data and Functional Blocks
**Symptom:** Data block connected by the same rectilinear arrow used for operational flow.
**Fix:** Use angled arrows (or clearly differentiate) so readers can tell data flow from operational flow at a glance.

### Mistake 5: Data Block with No Named Source
**Symptom:** A data block appears with an arrow into a function, but no label or external indicator tells the reader where this data originates.
**Fix:** Either label the data block with its source (e.g., "Shopper Credentials (from Login Form)") or add an external source node.

## Validation Checklist (STOP-GAP)
- [ ] All data blocks have **rounded corners** (or oval shape)
- [ ] All functional blocks have **square corners** — no shape confusion
- [ ] Data block contents are **nouns**, not verb+object phrases
- [ ] Arrows connecting data blocks are angled (or otherwise visually distinct from operational arrows)
- [ ] No more than **3–5 data blocks per diagram** (or justification exists for more)
- [ ] Significant external inputs are represented as data blocks; trivial ones are arrow labels
- [ ] Constraints and policies governing functions are represented as data blocks
- [ ] Every data block has a clear source (external input, config file, policy, etc.)

> **STOP: Do not proceed to Phase 9 until all checks pass.**

## Output Artifact

A hierarchical set of FFBDs enriched with EFFBD data blocks at the points where external inputs, constraints, and non-functional dependencies enter the system.

For our e-commerce platform: 4 data blocks on the top-level diagram (Merchant Account Config, Pricing & Tax Rules, Compliance Policy, Shopper Credentials), plus any additional ones added inside sub-diagrams.

## Handoff to Next Phase

Your notation is complete. But a notation-correct FFBD that skipped team review will be wrong in substance. Phase 9 covers **iteration and team discussion** — the 7-round workflow that turns a first draft into a validated artifact.

---

**Next →** [09 — Building and Iterating](09_BUILDING-AND-ITERATING.md) | **Back:** [07 — Hierarchical FFBDs](07_HIERARCHICAL-FFBDS.md)
