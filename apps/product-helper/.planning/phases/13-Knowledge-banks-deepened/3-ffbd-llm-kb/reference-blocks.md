# FFBD: Reference Blocks & Hierarchical Diagrams

## Reference Blocks

### Definition

Reference blocks connect blocks across **different** FFBD diagrams. They are distinct from arrow shortcuts, which connect blocks within the **same** diagram.

### Purpose

1. **Section off significant portions** of a larger FFBD into separate, self-contained diagrams
2. **Improve legibility** — smaller diagrams are easier to read and manage
3. **Create meaningful functional groupings** — sections are chosen to represent coherent groups of functionality

### When to Use Reference Blocks

| Use Case | Why It Works |
|----------|-------------|
| Initialization / Shutdown | Clear start and end points, distinct from main operation |
| Maintenance operations | Separate functional group with its own flow |
| Error / emergency handling | Special-case flows that branch from normal operation |
| Post-OR gate branching | When an OR gate leads to a substantially different operational direction |

**Rule of thumb:** Use reference blocks wherever the operational flow branches off in a significantly different direction.

### Reference Blocks vs. Hierarchical FFBDs

If a reference block starts looking like a **sub-function** (similar to extracting a function/method in code), a hierarchical FFBD may be more appropriate. Hierarchical FFBDs are specifically designed for decomposing functions into sub-functions.

---

## Hierarchical FFBDs

### The Problem

When first creating FFBDs, it's difficult to decide how much detail to include. Too much detail in a single diagram makes it unreadable. Too little leaves gaps.

### The Solution: Hierarchical Decomposition

Start with a **high-level FFBD** (e.g., whole system operation). For any block that contains significant internal complexity, create a **separate lower-level FFBD** that represents what's happening inside that block.

**Example from course:**
- **Function 2: System Operation FFBD** contains a broad block called "Measure Health Conditions"
- **Function 2.5: Measure Health Conditions FFBD** breaks that single block into its full internal flow
- Trying to represent all of Function 2.5's detail inside the Function 2 diagram would have been unreadable

### Benefits of Hierarchical FFBDs

| Benefit | Explanation |
|---------|-------------|
| **Incremental detail** | You can create a high-level block even when you don't yet understand its internals, then drill into the details later with a separate diagram |
| **Team communication** | Not every team member needs every detail. Higher-level diagrams let the full team focus on key operations and interfaces |
| **Complexity justification** | When someone asks "why is this one block taking so long?", the lower-level FFBD demonstrates the actual complexity |
| **Cross-function influence** | Lower-level FFBDs can show how other high-level functions (e.g., "Turn On Device", "Change Modes") influence the internals of a given block — making dependencies visible across teams |
| **Reusable functional groups** | Wrap sets of functionality into a single block and repeat it in multiple places (analogous to functions/methods in code) |

### Best Practice: Connection Consistency

Any reference blocks in a lower-level diagram should relate to a connection made at the higher-level functional block, and vice versa. If there are connections into a higher-level block, those connections should appear somewhere in that block's lower-level FFBD.

This is not a hard rule in FFBD conventions, but it **is** a requirement in related standards like IDEF0, and is considered good practice.

---

## Key Principles for FFBD Creation

### Multiple Correct Representations

> There is more than one way to correctly represent a system.

The quality of an FFBD is measured by how effective it is as a **communication tool**, not by whether it matches some single "correct" form.

### Iterative Creation Process

1. **Draft your first version** — don't worry about clean formatting or spacing
2. **Discuss with your team immediately** — expect to discover:
   - Questions you didn't ask
   - Details the team wants included
   - Oversimplified areas
   - Missing connections
3. **Iterate at least 1-2 rounds** before worrying about formatting
4. **Continue adding** as you discover gaps
5. **Communicate every adjustment** to the team and get consensus

Heavy feedback on your first draft is a **positive signal** — you're uncovering more about the system and getting the team aligned. If the system were trivial enough to get right on the first pass, you wouldn't need an FFBD.

---

## FFBD Naming & Numbering Conventions

Every FFBD requires a **function title** and a **unique function number**. Every functional block within an FFBD must have a **unique ID**. These conventions become critical when FFBDs are split via reference blocks or organized hierarchically.

### Rule 1: Titling FFBDs Split by Reference Blocks

When a single FFBD is split into multiple diagrams along the **top-level hierarchy**, each FFBD is numbered sequentially in operational flow order:

| Diagram | Title |
|---------|-------|
| First FFBD in flow | **Function 1 : System Initialization** |
| Second FFBD in flow | **Function 2 : System Operation** |
| Third FFBD in flow | **Function 3 : ...** |

Format: `Function <N> : <Descriptive Name>`

### Rule 2: Numbering Blocks Within an FFBD

Each functional block's unique ID starts with the **function number from its parent FFBD title**, followed by a period and a sequential number unique within that diagram.

Numbering order: **left-to-right, top-to-bottom**.

| Parent FFBD | Block IDs |
|-------------|-----------|
| Function 1 : System Initialization | `F.1.1`, `F.1.2`, `F.1.3`, ... |
| Function 2 : System Operation | `F.2.1`, `F.2.2`, `F.2.3`, ... |

Format: `F.<FFBD number>.<block number>`

### Rule 3: Titling Hierarchical (Lower-Level) FFBDs

When diving into a block to create a lower-level FFBD, the title is the **function ID and name of the block being decomposed**.

**Example:**
- Block `F.2.5 Measure Health Conditions` exists in the Function 2 FFBD
- The lower-level FFBD title becomes: **Function 2.5 : Measure Health Conditions**
- All blocks within this lower-level FFBD are numbered: `F.2.5.1`, `F.2.5.2`, `F.2.5.3`, ...

### Rule 4: Unlimited Hierarchy Depth

This numbering scheme repeats for every level of decomposition. There is no depth limit.

**Example of deep nesting:** `F.2.5.3.9.7.12`

Each segment traces back up through the hierarchy:
- `F.2` — Function 2 FFBD
- `F.2.5` — Block 5 within Function 2
- `F.2.5.3` — Block 3 within the Function 2.5 FFBD
- ... and so on

**Key benefit:** Any block ID can be traced back up the chain to see exactly where it fits in the bigger picture.

---

## Repeating Functional Blocks

It is valid to repeat functional blocks in the same FFBD, but the approach depends on the situation.

### When to Use Arrow Shortcuts Instead

If a block needs to be reused and the **inputs and outputs are exactly the same**, use an **arrow shortcut** rather than duplicating the block.

**Example:** In the Measure Health Conditions FFBD, "Measure Heart Rate", "Measure Dissolved Oxygen", and "Set Microcontroller Settings" all require the same output from "Estimate Sweating". Rather than repeating "Estimate Sweating" three times, an AND shortcut connects the single block to all three consumers.

### When Repeating a Block Is Correct

If the **function is exactly the same** but the **inputs and/or outputs differ**, repeat the block.

**Example:** In the Function 2 : System Operation FFBD, "Create Health Report" appears multiple times. Regardless of what data is input, the function of creating a report is the same — even though the outputs may differ. Repeating the block is appropriate here.

### Common Mistake: Same Name, Different Behavior

If two blocks share a name but the **internal behavior is actually different**, they should not share the same label. This misrepresents them as identical.

**Example:** The Measure Health Conditions FFBD has two places that "Confirm Sensor Node Contact". On closer inspection, these are handled by different sensors, so the confirmation process may be very different.

**Solution:** Differentiate with suffixes — e.g., "Confirm Sensor Node Contact A" and "Confirm Sensor Node Contact B". This communicates both the similarity and the difference. Other naming conventions work too, as long as the distinction is clear.

### Summary

| Situation | Approach |
|-----------|----------|
| Same function, same I/O | Use an **arrow shortcut** (don't duplicate) |
| Same function, different I/O | **Repeat** the block |
| Similar name, different internal behavior | **Rename** with suffixes (A/B) to distinguish |

---

## Extended FFBD (EFFBD): Data Blocks

Traditional FFBDs do not show how outside inputs enter the system. The **Extended FFBD (EFFBD)** adds a new element — the **data block** — to address this.

### What Are Data Blocks?

Data blocks represent inputs, outputs, or other informational dependencies that functional blocks rely on. They are not functional blocks themselves — they represent **data, materials, resources, or constraints**.

### Visual Conventions

| Element | Convention |
|---------|-----------|
| Shape | **Rounded-corner rectangle** (sometimes drawn as an oval) |
| Arrows | Drawn **at an angle** to distinguish them from standard rectilinear arrows (straight horizontal/vertical is acceptable but angled is preferred for clarity) |

### Use Cases for Data Blocks

| Use Case | Example |
|----------|---------|
| **External inputs** entering the system | Sweat, Water, and Vomit entering into the Measure Health Conditions FFBD |
| **Internal data flow** between functional blocks (replacing arrow labels) | Change Mode data block connecting functional blocks in the System Operation FFBD; can also be combined with arrow shortcuts |
| **Non-functional dependencies** — information needed by a block that isn't produced by any operational function | System Model as input to Motor Feedback Controls — it's part of the system design (a mathematical description of how the system operates), not a product of any function, but the Controls block depends on it |
| **Constraints or operational information** critical to the system | Specifications, thresholds, configuration parameters |

### Best Practice: Use Sparingly

Data blocks can quickly **clutter** an FFBD. Favor **arrow labels** whenever possible, and reserve data blocks for cases where the dependency or input is significant enough to warrant its own visual element.
