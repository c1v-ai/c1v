# Module 3 Glossary — FFBD Terminology

All terms used in Module 3 (Exploring Your System's Architecture / FFBD), in alphabetical order.

---

**AND gate** — A pair of logic gates showing that operations run in **parallel**. All parallel paths must complete before the flow proceeds past the closing AND gate. Contrast with OR gate (alternative paths) and IT gate (loop).

**Arrow (operational flow)** — A line connecting two functional blocks, showing the direction of operational flow. Two types: **trigger** (solid) and **precedes** (dashed).

**Arrow jump** — A half-circle bump drawn where two arrows cross, indicating they do not intersect. Acceptable in some formats but generally considered inferior to clean layout or arrow shortcuts.

**Arrow label** — Text written above (or alongside) an arrow that communicates information about the handoff — data payload, time gap, specification, or constraint. Typically italicized, same or one size smaller than block body text.

**Arrow shortcut** — A pair of matching capital letters in circles that replace a long or crossing arrow within a single diagram. The first shortcut is labeled A, the second B, and so on. Used for within-diagram connections only; cross-diagram uses reference blocks.

**Block ID** — The unique identifier of a functional block, following the hierarchical convention `F.<parent FFBD number>.<sequential number>` (e.g., `F.3.4.2`).

**Body** (of a functional block) — The larger bottom part of a functional block, containing the functional name (centered text).

**Data block** — A rounded-corner rectangle (or oval) representing an input, output, or non-functional dependency that the system consumes or produces. Used in the Extended FFBD (EFFBD). Arrows to/from data blocks are typically drawn at an angle.

**Decision diamond** — A diamond-shaped element representing a runtime evaluation (if-then-else). Different from an OR gate: decision diamonds evaluate a condition at runtime; OR gates represent architectural alternatives.

**EFFBD (Extended FFBD)** — An FFBD variation that adds **data blocks** to represent external inputs, constraints, and non-functional dependencies. Used sparingly to avoid diagram clutter.

**FFBD (Functional Flow Block Diagram)** — A diagram showing the operational flow of a system using functional blocks connected by arrows, with logic gates to represent iteration, parallelism, and alternative paths. Reads left-to-right. Used for over a century in professional systems engineering.

**Functional block** — A rectangular block with two parts (header + body) representing a single function the system must perform. Named with a verb + object phrase describing **what happens**, not **what does it**.

**Functional naming** — The principle that block names describe what must happen ("Process Payment") rather than what will do it ("Stripe"). The single most important rule in FFBD creation.

**Header box** (of a functional block) — The smaller top part of a functional block, containing the block's unique ID.

**Hierarchical FFBD** — The technique of decomposing a single functional block into its own lower-level FFBD titled with the parent block's ID and name (e.g., decomposing `F.3 Serve Shopper Session` into a separate diagram titled "Function 3 : Serve Shopper Session" with sub-blocks F.3.1, F.3.2, ...). Analogous to extracting a function in code.

**Hierarchical numbering convention** — The rule that sub-block IDs take their parent function's number as a prefix. A block ID like `F.2.5.3` traces back through the hierarchy: Function 2, block 5, which was decomposed into Function 2.5, block 3 of that sub-diagram.

**IDEF0** — A diagramming standard from the US Air Force ICAM program with similar purpose to FFBD. Stricter on input/output/control/mechanism distinctions. Related standards often require connection consistency between higher- and lower-level diagrams.

**IT gate** — A pair of logic gates representing **iteration** (a loop). An arrow from the closing IT to the opening IT indicates the loop; the arrow is labeled with the end condition (termination condition).

**Logic gate** — A control-flow element in an FFBD. Three types: IT (iteration), OR (alternative paths), AND (parallel). Also known as summary gate, control trigger, or control gate. Always come in matching pairs (open + close).

**OR gate** — A pair of logic gates showing **alternative paths**. Outgoing arrows from the opening OR carry condition labels (at most one may be unlabeled as the default). The closing OR gate merges the alternative paths back together.

**Precedes arrow** — A dashed arrow indicating that the function at the end will occur **at some point later** after the function at the beginning. Used when there is a meaningful time gap between two functions.

**Reference block** — A block that connects to a function defined in a **separate** FFBD diagram. Identified by "Ref" in its ID (e.g., `F.4 Ref`). Used to connect across diagrams, especially at sub-diagram entry/exit points. Distinct from arrow shortcuts, which connect within a single diagram.

**Structural naming** — The antipattern of labeling a functional block with the name of a component, library, or vendor (e.g., "Stripe," "PostgreSQL") rather than the function it serves. Violates the single most important rule of FFBD creation.

**Termination condition** — The explicit label on an IT gate's return arrow specifying when the loop ends. Examples: *Until session ends*, *Until all items processed*, *Until error threshold exceeded*. Every IT gate must have one.

**Trigger arrow** — A solid arrow indicating that the function at the end of the arrow is triggered by or **immediately follows** the function at the beginning. The most commonly used arrow type.

**Uncertainty color** — The marking (Red / Yellow / Green) applied to a functional block to indicate confidence level. Red = least defined, highest risk, address first. Yellow = concept solid but edge cases open. Green = well-understood, standard patterns.

---

*Glossary for Module 3 (Exploring Your System's Architecture — FFBD) / Part of the System Design Process KB set for Modules 3-7.*
