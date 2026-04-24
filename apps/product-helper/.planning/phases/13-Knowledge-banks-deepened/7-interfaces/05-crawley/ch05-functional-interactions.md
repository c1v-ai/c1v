---
source: "Crawley 2015, System Architecture"
chapter: 5
section: "Ch 5 §5.5 Analysis of Functional Interactions + Box 5.7 PO Array"
relevance_to_kb: "Every interface is a shared operand — §5.5 gives the canonical procedure for identifying and characterizing interfaces as operand exchanges between processes."
word_count: 400
---

# Crawley Ch 5 §5.5 — Functional Interactions (for Interfaces)

For KB-7, Ch 5's punch line is that **every interface is a shared operand** — a boundary crossing means an operand passes (the hose passes water to the pump, the call statement passes an array to the procedure).

## Functional architecture (line 2323)

"The exchanged or shared operands are the functional interactions. The functions plus the functional interactions are the functional architecture."

This is the operational definition KB-7 interface entries must satisfy. An interface without an identified shared operand is under-specified.

## Six-step identification procedure (lines 2346–2355)

1. Start with a diagram of internal functions that includes the value-related operand.
2. Identify obviously-missing processes (input/output).
3. Identify obviously-missing operands (external inputs — e.g., flour, water, yeast for bread-slice-making).
4. For each process, enumerate any other operands it needs for completeness.
5. For each operand, enumerate what other processes it interacts with.
6. Trace the path from value-related output backward and judge whether expected emergence is likely.

Steps 3 and 4 are specifically the **interface enumeration** steps — external operands crossing the system boundary are external interfaces; internal operand-sharing across processes are internal interfaces.

## PO Array as the interface matrix (Box 5.7, line 2333)

- Rows = processes, columns = operands.
- Cell markers:
  - `c'` = create (operand gets a prime) — operand is PRODUCED by the process.
  - `d` = destroy — operand is CONSUMED.
  - `a` = affect — operand's state is CHANGED.
  - `I` = instrument — operand is the INSTRUMENT executing the process.

For KB-7 interface identification: any column (operand) with entries in ≥2 rows (processes) defines a **shared-operand interface** between those processes. The pair `(c', d)` or `(c', a)` is a producer→consumer interface; `(a, a)` is a collaborative interface.

## OP transpose (Box 5.8, line 2430)

Symbolic-multiplying PO × OP yields a process-to-process matrix — the N² chart of processes, where off-diagonal entries are the operands shared. This is the direct formal derivation of the interface/N² matrix.

## Secondary functions produce secondary interfaces (§5.6)

Secondary value-related functions (reports, pressure sensing, noise filtering) carry their own operand exchanges. KB-7 must enumerate these — they are the source of most non-ideal interfaces in real systems.

## Citations
- Ch 5 §5.5 (line 2323) — functional architecture.
- Ch 5 (lines 2346–2355) — six-step procedure.
- Ch 5 Box 5.7 (line 2333) — PO Array.
- Ch 5 Box 5.8 (line 2430) — OP transpose / N² derivation.
- Ch 5 §5.6 (line 2481) — secondary functions.

> See full text in plans/research/crawley-book-findings.md §Ch 5.
