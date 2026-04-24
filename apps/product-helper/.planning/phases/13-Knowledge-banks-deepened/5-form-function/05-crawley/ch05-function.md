---
source: "Crawley 2015, System Architecture"
chapter: 5
section: "Ch 5 §§5.1–5.6"
relevance_to_kb: "Function = process + operand; value pathway, PO Array, secondary functions — the canonical KB-5 definition of the function side of the form-function mapping."
word_count: 430
---

# Crawley Ch 5 — Function

Function is what a system DOES (Box 5.1). Function = **process** (pure action/transformation) + **operand** (the object whose state is changed). External function delivers value across the system boundary; internal functions create the internal value pathway from which external function emerges.

## Value delivery rule (Box 5.5, line 2162)

**Principle of Benefit Delivery.** Value is benefit at cost; the **value-related operand** is the one whose beneficial attribute changes state to deliver benefit.

## External vs. internal function (§5.3–5.4)

External function crosses the system boundary and delivers value; internal functions happen inside and connect via the **value pathway**.

## Functional architecture (§5.5, line 2323)

"Exchanged or shared operands are the functional interactions. The functions plus the functional interactions are the functional architecture."

This is c1v's operational definition for FFBD nodes and edges AND the schema contract for KB-5 form-function outputs.

## Six-step procedure for identifying functional interactions (line 2346–2355)

1. Start with diagram of internal functions including value-related operand.
2. Identify missing processes (inputting, outputting).
3. Identify missing operands (inputs).
4. For each process, ask what other operands are needed for completeness.
5. For each operand, ask what other processes it interacts with.
6. Trace the value-output pathway and check emergence.

## PO Array / Process-Operand matrix (Box 5.7, line 2333)

- Rows = processes, columns = operands.
- Entries: `c'` create (operand gets prime), `d` destroy, `a` affect, `I` instrument.

## OP projection (Box 5.8, line 2430)

Form transpose of PO, remove primes from create, add primes to destroy, leave affect/instrument unchanged; symbolic-multiply to project operands onto processes; zero terms with primes if causality matters.

## Internal process-identification methods (line 2317)

- Reverse-engineering key elements of form.
- Standard blueprints in the domain.
- Metaphors from adjacent domains.

## Secondary value-related functions (§5.6, line 2481)

Systems typically deliver secondary external functions (reports, noise filtering, pressure sensing) on top of the primary — expected by customers, source of competitive advantage. KB-5 must enumerate them explicitly, not treat them as non-functional afterthoughts.

## Zooming vs. emergence (§5.5, line 2404)

- **Zooming** = larger→smaller (external function → internal processes).
- **Emergence** = smaller→larger (internal-process interactions → external function).

## Citations
- Ch 5 Box 5.1 — function definition.
- Ch 5 Box 5.5 (line 2162) — Principle of Benefit Delivery.
- Ch 5 §5.5 (line 2323) — functional architecture = functions + interactions.
- Ch 5 Box 5.7 (line 2333) — PO Array.
- Ch 5 Box 5.8 (line 2430) — OP projection.
- Ch 5 §5.6 (line 2481) — secondary value-related functions.

> See full text in plans/research/crawley-book-findings.md §Ch 5.
