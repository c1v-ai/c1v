---
source: "Crawley 2015, System Architecture"
chapter: 14
section: "Ch 14 §§14.1–14.3"
relevance_to_kb: "Defines architecture as a set of coupled decisions with metrics, sensitivity, and Simon's four design-activity layers — the conceptual backbone of the KB-4 decision network."
word_count: 390
---

# Crawley Ch 14 — System Architecture as a Decision-Making Process

## Three heuristics for formulating decisions (line 6612)

1. **Set boundaries of the architectural space** under consideration (Ch 11 System Problem Statement).
2. **Decisions must significantly influence metrics** — low-sensitivity decisions should be dropped.
3. **Include only architectural decisions** (not design decisions like launch-site location).

Apollo example: 9 decisions retained from a much longer initial list.

## Properties of architectural decisions and metrics (Box 14.1, line 6891)

- **Modeling breadth vs. depth** — broad shallow vs. narrow deep sweeps.
- **Ambiguity** — decision-tree branches may be ill-defined early.
- **Categorical-variable dominance** — most architectural decisions are discrete, not continuous.
- **Subjectivity** — stakeholder preferences feed into metric weights.
- **If-then objective functions** — nonlinear, conditional metric shape.
- **Coupling and emergence** — decisions are non-independent; metric comes from system, not parts.

## Simon's Design-Activity 4 layers (line 6759)

1. **Representing** — encode the problem.
2. **Structuring** — reason about structure (decision order, coupling).
3. **Simulating** — evaluate satisfaction of needs.
4. **Viewing** — present results in a form humans can reason about.

These are the "Four Tasks of Decision Support" that KB-4 implementations map to: schema encoding, coupling/DSM view, utility scoring, explainable-network UI.

## Decision math (supplementing findings.md §3.2)

Existing canonical formulation in findings.md §3.2 (decision utility, Pareto dominance, sensitivity, concept quality) is the authoritative c1v math and is NOT restated here. This file adds only the Ch-14 framing that licenses it.

The **decision utility** formulation:
- `U_i(a) = Σ_{c ∈ C_i} w_c · score(a, c)`

The **sensitivity** formulation for >2-option decisions (per Ch 15 minor patch):
- `sensitivity(i, M) = Σ_{k ∈ K} |mean(M | decision_i=k) − mean(M | decision_i≠k)|`

## KB-4 operational consequence

Every decision node in the c1v decision network MUST carry: (a) a metrics-sensitivity justification (Ch 14 heuristic 2); (b) a boundary-scoping tag linking back to KB-1 System Problem Statement; (c) a coupling signature consumed by Ch 15's decision-space view.

## Citations
- Ch 14 (line 6612) — three heuristics for formulating decisions.
- Ch 14 Box 14.1 (line 6891) — properties of decisions and metrics.
- Ch 14 (line 6759) — Simon's four design-activity layers.

> See full text in plans/research/crawley-book-findings.md §Ch 14.
