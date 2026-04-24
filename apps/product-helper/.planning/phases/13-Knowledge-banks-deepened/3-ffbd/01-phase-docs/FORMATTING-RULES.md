# FFBD Formatting Rules — Quick Reference

A one-page card summarizing every formatting rule across Module 3. Use this during the final polish pass.

---

## Functional Blocks

| Rule | Requirement |
|------|-------------|
| Structure | Two-part: **header box** (top, smaller, contains ID) + **body** (bottom, larger, contains functional name) |
| Corners | **Square only** — rounded corners are reserved for EFFBD data blocks |
| Text alignment | **Centered** in the body |
| Block sizes | Use **2–3 consistent sizes** throughout the diagram (not all identical, not all different) |
| Font | Consistent font and size for all block bodies in a diagram |
| Color | Black on white (color reserved for Red/Yellow/Green uncertainty marking) |
| Block IDs | Unique per diagram, in header box, following hierarchical numbering `F.<N>.<M>` |
| Block names | **Functional** (verb + object), never **structural** (vendor/library name) |
| Numbering order | **Left-to-right, top-to-bottom** within each diagram |

## Arrows

| Rule | Requirement |
|------|-------------|
| Trigger arrow | **Solid** line, filled arrowhead — immediately follows |
| Precedes arrow | **Dashed** line, filled arrowhead — occurs sometime later |
| Line style | **Rectilinear only** (90-degree angles; no curves or diagonals for operational flow) |
| Arrowhead | **Filled** (not open, not hollow) |
| Thickness | Same as block borders, or **one setting thicker** |
| Contact | Must be in **direct contact** with edges of connected blocks (no gaps) |
| Dash visibility | Precedes arrows must be long enough for dashes to be clearly visible |
| Overlaps | **Avoid**; use arrow shortcuts or rearrange blocks |
| Arrow jumps | Acceptable (half-circle bump at intersection) but inferior to clean layout |

## Arrow Labels

| Rule | Requirement |
|------|-------------|
| Position | Typically **above** the arrow (can be broken for readability) |
| Style | **Italicized** |
| Size | Same or **one size smaller** than block body text |
| Multiple labels | Separated by **commas** (or semicolons) |
| Association | Must be **unambiguously** associated with a single arrow |

## Logic Gates (IT, OR, AND)

| Rule | Requirement |
|------|-------------|
| Shape | Circle (with gate letters inside) |
| Pairing | Every gate has a **matching pair** (open + close), like curly brackets `{ }` |
| Size | **All gates same size** throughout the diagram |
| Text | **All caps, bold** inside the circle |
| Font | Same font size for all gates; within **one size** of block body text |
| IT termination | Return arrow must carry an **explicit end condition** (e.g., *Until session ends*) |
| OR labeling | Outgoing paths carry **condition labels**; at most one unlabeled default allowed |
| AND labeling | Usually **unlabeled**; if labeling any (e.g., resource allocation), label **all** |
| Nesting | Gates can be nested; inner pairs must close before outer pairs |

## Decision Diamonds

| Rule | Requirement |
|------|-------------|
| Shape | **Diamond** (◇) |
| Use case | **Runtime evaluation** (if-then-else); not architectural alternatives (use OR for those) |
| Paths | Labeled Yes/No or with explicit conditions |

## Arrow Shortcuts

| Rule | Requirement |
|------|-------------|
| Shape | **Circle** with a capital letter |
| Pairing | Matching letter pairs (one exit, one entry) |
| Labeling | First = A, second = B, third = C, ...; if >26, use AA, BB, etc. (but rethink layout) |
| Scope | **Within a single diagram only**; cross-diagram uses reference blocks |

## Reference Blocks

| Rule | Requirement |
|------|-------------|
| Structure | Same as functional block (header + body), square corners |
| ID | `F.<N> Ref` indicates this is a reference to a function defined in another diagram |
| Name | Matches the referenced block's functional name **exactly** (no drift) |
| Placement | Typically at sub-diagram entry/exit points to show parent context |
| Connection consistency | Connections into/out of a higher-level block should appear as reference blocks in its sub-diagram |

## Data Blocks (EFFBD)

| Rule | Requirement |
|------|-------------|
| Shape | **Rounded-corner rectangle** (or oval) |
| Text | **Noun** (data name), not a verb + object phrase |
| Arrows | Typically drawn **at an angle** to distinguish from operational arrows |
| Use | **Sparingly** — prefer arrow labels for trivial data |
| Quantity | ≤ 3–5 per diagram (or justification required) |

## Diagram-Level

| Rule | Requirement |
|------|-------------|
| Title format | `Function <N[.M.K...]> : <Descriptive Name>` |
| Flow direction | **Left to right** (top to bottom is acceptable for vertical layouts) |
| Color | Black and white only (color reserved for uncertainty marking) |
| Block count | **7–15 blocks** per diagram (decompose into sub-diagrams beyond that) |
| Spacing | Adequate whitespace; no cramped layouts |

## Uncertainty Marking (from Phase 9)

| Color | Meaning |
|-------|---------|
| 🟢 **Green** | Well-understood, standard patterns, low risk |
| 🟡 **Yellow** | Concept is solid but edge cases need resolution |
| 🔴 **Red** | Least defined, open questions remain, highest risk — address first |

---

## Final Pass Checklist

Before declaring an FFBD finished, verify:

- [ ] All blocks: square corners, functional names, unique IDs, consistent sizing
- [ ] All arrows: rectilinear, filled heads, correct type (trigger vs. precedes), touching block edges
- [ ] All gates: matched pairs, correct type (IT/OR/AND vs. decision), termination conditions on IT, condition labels on OR
- [ ] All data blocks: rounded corners, noun labels, angled arrows, used sparingly
- [ ] All sub-diagrams: titled with parent function ID, sub-blocks numbered with parent prefix
- [ ] All reference blocks: named correctly, at sub-diagram boundaries
- [ ] No overlapping arrows; shortcuts used where crossings unavoidable within a diagram
- [ ] Diagram-level: 7–15 blocks, left-to-right flow, black-and-white (plus uncertainty colors)
- [ ] Naming: no structural names anywhere in the FFBD

---

*Formatting rules for Module 3 (FFBD). For the full phase-by-phase workflow, see [00 — Module Overview](00_MODULE-OVERVIEW.md).*
