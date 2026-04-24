---
source: "Crawley 2015, System Architecture"
chapter: 3
section: "Ch 3 §§3.1–3.6"
relevance_to_kb: "Cross-cutting toolkit — decomposition, hierarchy, special logical relationships (class/instance, specialization, recursion), reasoning directions, and OPM/SysML representation. Applies to every downstream KB."
word_count: 490
---

# Crawley Ch 3 — Thinking about Complex Systems (shared)

Ch 3 is the toolkit chapter that lifts the Ch 2 four-task method to apply to *complex* systems (many entities, highly interrelated).

## Definition (Box 3.1, line 1075)

"A complex system has many elements or entities that are highly interrelated, interconnected, or interwoven."

The architect's job: "build systems of the necessary level of complexity that are not complicated" (line 1089) — invest in complexity as needed but keep *apparent* complexity below the human comprehension ceiling.

## Simple / Medium / Complex taxonomy (lines 1164–1180)

- **Simple** — one-level decomposition with ≤7±2 atomic parts.
- **Medium** — two-level with ≤(7±2)² ≈ 81 entities.
- **Complex** — two-level with sub-abstractions (going deeper implies up to 729 entities, exceeds human capacity).

Level 0 / Level 1 / Level 2 is the standard depth convention used throughout the book (line 1180).

## Hierarchy causes (line 1141)

More scope, more importance/performance, more responsibility.

## Atomic-part tests (line 1184)

- **Mechanical** — "call it a part when you can't take it apart."
- **Informational** — "call it a part if it loses meaning when you take it apart."

## Special Logical Relationships (§3.4, lines 1190–1214)

- **Class / instance** — class = general features; instance = specific occurrence (Ford Explorer model vs. a specific VIN).
- **Specialization / generalization** — akin to OO inheritance (House → Colonial / Victorian / modern).
- **Recursion** — self-similar use (a Node class whose Neighbors attribute is an array of Nodes).

## Reasoning approaches (§3.5, lines 1216–1234)

- **Top-down** — goal-first (V-model left side).
- **Bottom-up** — capability-first, predict emergence upward.
- **Outer-in** — meet in the middle.
- **Middle-out** — standard for truly complex systems; reason 1–2 levels up/down from an arbitrary starting point.
- **Zigzagging** (Nam Suh's axiomatic-design term) — alternate between form and function domains.

## Representation choice (§3.6)

- **OPM (Object-Process Methodology)** — integrated model, single diagram (objects + processes + relationships). Crawley primary.
- **SysML** — 9 views (block-definition/internal-block for structure; activity/state-machine/use-case/sequence for behavior; parametric + requirements added). Crawley reference.

## Four levers for complexity

Ch 3 equips the architect with four levers for keeping a complex system comprehensible while preserving its essential complexity:

1. **Decomposition** — "one of the most powerful tools in our toolset" (line 1129), but integration (not decomposition) is the hard problem.
2. **Hierarchy** — ranks entities into layers based on scope, importance, or responsibility.
3. **Special logical relationships** — class/instance, specialization, recursion add expressive primitives beyond entity+relationship.
4. **Representation** — OPM (integrated) vs. SysML (multi-view).

## Citations
- Ch 3 Box 3.1 (line 1075) — definition.
- Ch 3 (line 1089) — necessary complexity, not complicated.
- Ch 3 (lines 1164–1180) — simple/medium/complex taxonomy.
- Ch 3 (line 1184) — atomic-part tests.
- Ch 3 §3.4 (lines 1190–1214) — class/instance, specialization, recursion.
- Ch 3 §3.5 (lines 1216–1234) — reasoning directions + zigzagging.
- Ch 3 §3.6 (lines 1236–1286) — OPM vs. SysML.

> See full text in plans/research/crawley-book-findings.md §Ch 3.
