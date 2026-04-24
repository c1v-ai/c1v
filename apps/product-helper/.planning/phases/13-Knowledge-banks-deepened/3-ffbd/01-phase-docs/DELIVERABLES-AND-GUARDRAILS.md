# Module 3 Deliverables and Guardrails

> Transcribed and structured from `INSTRUCTIONS-GUARDRAILS.docx` (course deliverable spec). This file is the **submission contract** — it defines exactly what must be produced and which hard minimums must be met. Every phase file's STOP-GAP ties back to these requirements.

---

## Project Overview

You will build an FFBD for a specific use case in two parts:

| Part | Deliverable |
|------|-------------|
| **Part 1 — Basic FFBD** | A basic FFBD with **≥ 6 functional blocks**, **both types of arrows**, and **≥ 2 logic gate pairs**. |
| **Part 2 — Evolved FFBD** | An **evolved FFBD** that delves into at least one of your functional blocks, adds **EFFBD elements**, an **informal list of interfaces**, and a **list of uncertainties** (color-coded). |

Submit a PowerPoint file with your last name appended to the filename, plus written answers to the questions below.

---

## Part 1 — Basic FFBD

### Hard Minimums (STOP-GAP)

Your basic FFBD must include:

- [ ] **At least 6 functional blocks** (Phase 3)
- [ ] **Both types of arrows** — trigger (solid) **and** precedes (dashed) (Phase 4)
- [ ] **At least 2 logic gate pairs** (IT / OR / AND — any combination) (Phase 5)
- [ ] Each block correctly formatted: header + body, unique ID, functional name (Phase 3)
- [ ] Professional formatting per [FORMATTING-RULES.md](FORMATTING-RULES.md)

### Step-by-Step Project Guidance

**Step 1: Describe your system** (250 words or fewer).

Example system description (from the course instructions):

> *"My system is an AI Native Platform-as-a-Service for enterprise internal and external Agent deployment. Think lovable but for AI agent deployment for both internal process improvement and external customer-facing agentic workflows."*

Write your own concise description. This is the anchor for all downstream FFBD work.

**Step 2: Create the basic FFBD** using the provided PowerPoint template (`FFBD_Template - MASTER.pptx`). Save with your last name appended.

**Step 3: Elaborate on the basic FFBD.**
- Work in a different slide within the same deck.
- Since you are including logic gate pairs, start by copying the Complex template from the FFBD Template slides and deleting what you don't need.
- When your elaborated FFBD describes your system accurately and in greater detail, save a copy for submission.

### Guidelines to Follow (From Course)

- Create functional blocks with text that focuses on **functionality being performed**, not **structural implementation**. → [Phase 2](02_FUNCTIONAL-VS-STRUCTURAL.md)
- Use **trigger arrows** for items that immediately follow one another; use **precedes arrows** for items that will follow some point after. → [Phase 4](04_ARROWS-AND-FLOW.md)
- Only use **arrow shortcuts** when necessary to avoid arrow overlaps. → [Phase 6](06_SHORTCUTS-AND-REFERENCE-BLOCKS.md)
- Use **logic gates** (control pairs) to provide additional information about operational flow. → [Phase 5](05_LOGIC-GATES.md)

### Part 1 — Required Written Answers

See [WRITTEN-ANSWERS-TEMPLATE.md](WRITTEN-ANSWERS-TEMPLATE.md) for full guidance. Three questions:

1. Explain the **logical flow** within your FFBD.
2. Explain the flow defined by your **logic gates**.
3. Summarize the **use of arrows** (trigger vs. precedes, shortcuts, labels).

---

## Part 2 — Evolved FFBD

### Hard Minimums (STOP-GAP)

Your evolved FFBD must add:

- [ ] **Hierarchical decomposition** — delve into **at least one** functional block from Part 1 (Phase 7)
- [ ] **Reference blocks** showing parent-diagram connections at sub-diagram entry/exit (Phase 6/7)
- [ ] **EFFBD data blocks** for external inputs / constraints (Phase 8)
- [ ] **Informal list of interfaces** between functional blocks or subsystems (Phase 9 / 11)
- [ ] **Color-coded uncertainties** — Red / Yellow / Green marking on functions (Phase 9)
- [ ] **Unique title and ID** for each FFBD (Phase 3 / 7)

### Guidelines to Follow (From Course)

- Use **reference blocks** to create a hierarchy of FFBDs — sectioning off significant parts into another FFBD makes large amounts of information more manageable. → [Phase 6](06_SHORTCUTS-AND-REFERENCE-BLOCKS.md) / [Phase 7](07_HIERARCHICAL-FFBDS.md)
- Assign each FFBD a **unique title and ID** for reference purposes. → [Phase 7](07_HIERARCHICAL-FFBDS.md)
- Use **data blocks** to show elements your system has to handle outside of the system. → [Phase 8](08_EFFBD-DATA-BLOCKS.md)

### Part 2 — Required Written Answers

See [WRITTEN-ANSWERS-TEMPLATE.md](WRITTEN-ANSWERS-TEMPLATE.md) for full guidance. Six questions:

1. Explain the **logical flow** of your evolved FFBD with examples (blocks, gates, arrows, shortcuts).
2. How did you use **reference blocks and hierarchical techniques** to improve communication?
3. Explain the **title** of your evolved FFBD and how it relates to the previous FFBD.
4. Give examples of how **labels** further clarify the flow.
5. Describe **key interfaces** you identified and how they impact system design.
6. With respect to **uncertainties**, comment on which functions to address first and why.

---

## Submission Package

Turn in to your instructor:

| Item | Format | Status |
|------|--------|--------|
| Basic FFBD (Part 1) | PowerPoint slide, lastname-appended filename | Required |
| Elaborated basic FFBD | Same deck, separate slide | Required |
| Evolved FFBD with hierarchy + EFFBD + uncertainty colors | Same deck, additional slides | Required |
| Informal list of interfaces | Separate slide(s) in the deck | Required |
| Instructions-Guardrails document with all written answers filled in | DOCX | Required |
| System description (≤250 words) | In the doc | Required |

---

## How This KB Supports Each Requirement

| Deliverable Requirement | KB Phase / File |
|-------------------------|-----------------|
| ≥ 6 functional blocks, correctly named and formatted | [03_CREATING-FUNCTIONAL-BLOCKS.md](03_CREATING-FUNCTIONAL-BLOCKS.md) |
| Both trigger and precedes arrows used correctly | [04_ARROWS-AND-FLOW.md](04_ARROWS-AND-FLOW.md) |
| ≥ 2 logic gate pairs | [05_LOGIC-GATES.md](05_LOGIC-GATES.md) |
| Arrow shortcuts used only where needed | [06_SHORTCUTS-AND-REFERENCE-BLOCKS.md](06_SHORTCUTS-AND-REFERENCE-BLOCKS.md) |
| Hierarchical decomposition of ≥ 1 functional block | [07_HIERARCHICAL-FFBDS.md](07_HIERARCHICAL-FFBDS.md) |
| Reference blocks across diagrams | [06_SHORTCUTS-AND-REFERENCE-BLOCKS.md](06_SHORTCUTS-AND-REFERENCE-BLOCKS.md) / [07_HIERARCHICAL-FFBDS.md](07_HIERARCHICAL-FFBDS.md) |
| EFFBD data blocks | [08_EFFBD-DATA-BLOCKS.md](08_EFFBD-DATA-BLOCKS.md) |
| Informal list of interfaces | [09_BUILDING-AND-ITERATING.md](09_BUILDING-AND-ITERATING.md) Round 7 / [11_FROM-FFBD-TO-DECISION-MATRIX.md](11_FROM-FFBD-TO-DECISION-MATRIX.md) |
| Color-coded uncertainties (Red/Yellow/Green) | [09_BUILDING-AND-ITERATING.md](09_BUILDING-AND-ITERATING.md) Round 6 |
| Unique title and ID per FFBD | [07_HIERARCHICAL-FFBDS.md](07_HIERARCHICAL-FFBDS.md) |
| Functional (not structural) naming | [02_FUNCTIONAL-VS-STRUCTURAL.md](02_FUNCTIONAL-VS-STRUCTURAL.md) |
| Professional formatting | [FORMATTING-RULES.md](FORMATTING-RULES.md) |

---

## Final Submission Checklist

Before submitting, verify:

- [ ] Basic FFBD has **≥ 6 functional blocks** (count them)
- [ ] Basic FFBD uses **both trigger AND precedes arrows** (at least one of each)
- [ ] Basic FFBD has **≥ 2 logic gate pairs** (count opening-closing pairs)
- [ ] Elaborated basic FFBD is on a separate slide
- [ ] Evolved FFBD **delves into at least one functional block** (hierarchical sub-diagram exists)
- [ ] Evolved FFBD uses **reference blocks** to connect to parent diagram
- [ ] Evolved FFBD includes **EFFBD data blocks**
- [ ] **Informal interface list** is on a separate slide
- [ ] **Color-coded uncertainties** are applied (Red/Yellow/Green)
- [ ] Each FFBD has a **unique title and ID**
- [ ] All block names are **functional**, not structural (no vendors/libraries/components)
- [ ] Formatting follows [FORMATTING-RULES.md](FORMATTING-RULES.md)
- [ ] All **9 written answers** are completed in the Instructions-Guardrails doc (3 for Part 1, 6 for Part 2)
- [ ] File saved with **last name appended** to the filename
- [ ] System description is **≤ 250 words**

---

**See also:** [WRITTEN-ANSWERS-TEMPLATE.md](WRITTEN-ANSWERS-TEMPLATE.md) for guided prompts on every written answer.
