---
source: "Crawley 2015, System Architecture"
chapter: 5
section: "Ch 5 §§5.1–5.6, esp. §5.5 Analysis of Functional Interactions"
relevance_to_kb: "Function = process + operand; §5.5 defines functional architecture as functions + shared-operand interactions — the canonical FFBD node/edge semantics for KB-3."
word_count: 470
---

# Crawley Ch 5 — Function (for FFBD)

Ch 5 grounds KB-3 (FFBD) as much as KB-5 (form-function) and KB-7 (interfaces). Its core machinery: function is a **process** acting on an **operand** to produce a change of state (Box 5.1). The value-related operand is the one whose state change delivers benefit (Box 5.5 Principle of Benefit Delivery). External function crosses the system boundary; internal functions run inside and emerge into the external function via the **value pathway**.

## Functional architecture = functions + shared-operand interactions

Ch 5 §5.5 gives the procedure every c1v functional-flow block diagram depends on: **functional interactions are the operands exchanged or shared between processes** — "the exchanged or shared operands are the functional interactions. The functions plus the functional interactions are the functional architecture" (line 2323).

## Six-step identification procedure (lines 2346–2355)

1. Start with a diagram of internal functions that includes the value-related operand.
2. Identify obviously-missing processes (input/output).
3. Identify obviously-missing operands (external inputs, e.g., flour, water, yeast for bread-slice-making).
4. For each process, enumerate any other operands it needs for completeness.
5. For each operand, enumerate what other processes it interacts with.
6. Trace the path from value-related output backward and judge whether the expected emergence is likely.

## PO Array (Box 5.7) — the FFBD edge-matrix

Rows = processes, columns = operands. Cell markers:
- `c'` = create (operand gets a prime)
- `d` = destroy
- `a` = affect
- `I` = instrument

The OP transpose (Box 5.8) + PO array symbolic-multiplies to a process-to-process matrix revealing coupling structure — the mathematical substrate of the FFBD coupling view.

## Internal-process identification methods (§5.4, line 2317)

- Reverse-engineer key elements of form
- Adopt standard blueprints in your domain
- Use metaphors from adjacent domains

## Secondary value-related functions (§5.6, line 2481)

Ch 5 §5.6 formalizes **secondary value-related functions**: customers expect the primary function plus an evolving set of secondary functions (carbon-dioxide return, noise filtering, report generation). Secondary functions are the differentiator and often the competitive advantage — KB-3 FFBD must enumerate them explicitly, not treat them as non-functional afterthoughts.

## Zooming and emergence (§5.5, line 2404)

Zooming = larger→smaller (go from external function down to internal processes); emergence = smaller→larger (let the interaction of internal processes produce the external function). FFBD expansion = zooming; FFBD validation = emergence check.

## Citations
- Ch 5 Box 5.1 — function definition.
- Ch 5 Box 5.5 (line 2162) — Principle of Benefit Delivery.
- Ch 5 §5.5 (line 2323) — functional architecture = functions + interactions.
- Ch 5 Box 5.7 (line 2333) — PO Array convention.
- Ch 5 Box 5.8 (line 2430) — OP projection procedure.
- Ch 5 §5.6 (line 2481) — secondary value-related functions.

> See full text in plans/research/crawley-book-findings.md §Ch 5.
