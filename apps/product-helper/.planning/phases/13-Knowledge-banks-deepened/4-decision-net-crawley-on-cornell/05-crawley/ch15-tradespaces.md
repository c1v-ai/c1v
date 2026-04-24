---
source: "Crawley 2015, System Architecture"
chapter: 15
section: "Ch 15 §§15.5–15.6"
relevance_to_kb: "Decision-space view (sensitivity × connectivity 2D plot), coupling/organization principle, and fuzzy Pareto — the core visualization and sequencing logic of the KB-4 decision network."
word_count: 360
---

# Crawley Ch 15 — Reasoning about Architectural Tradespaces

## Decision space view (§15.6, line 7288)

2D plot:
- **y-axis** = sensitivity of metrics to decision
- **x-axis** = degree of connectivity (counted from logical constraints in a DSM)

Four quadrants:
- **(I) High sensitivity + high connectivity** — make **first** (LOR in Apollo).
- **(II) High sensitivity + low connectivity** — make **second**, analyzable independently.
- **(III) Low sensitivity + high connectivity** — detailed-design decisions, make later in sync with coupled peers.
- **(IV) Low sensitivity + low connectivity** — parallelize or defer.

This quadrant assignment IS the KB-4 decision-network sequencing policy.

## Sensitivity formula for >2-option decisions (line 7278)

```
sensitivity(i, M) = Σ_{k ∈ K} |mean(M | decision_i=k) − mean(M | decision_i≠k)|
```

Sum of absolute-value "main effects" across all k alternatives. Binary-case reduces to |mean_true − mean_false|.

## Principle of Coupling and Organization of Architectural Decisions (Box 15.2, line 7318)

- Decisions are coupled; sequence matters.
- Quadrant-I decisions **first**.
- Weakly-coupled decisions in **parallel**.
- Highly-coupled decisions **combined in a single trade study** (not independently).

## Principle of Robustness of Architectures (Box 15.1, line 7226)

Pareto-optimal architectures are often the **least robust**. The **fuzzy Pareto frontier** (ε-dominance) captures robustness better than strict Pareto — an architecture is "fuzzy Pareto" if it lies within ε of the strict frontier on all metrics.

KB-4 decision-network scoring should surface both strict Pareto AND fuzzy Pareto sets, and prefer fuzzy-robust candidates when the ε-band is narrow.

## KB-4 operational consequence

Every pair of coupled decisions in the network carries:
- A **DSM entry** (connectivity count).
- A **sensitivity value** (Ch 14 metric).
- A **quadrant tag** (I–IV) driving sequencing.
- A **fuzzy-Pareto flag** (robustness indicator).

## Citations
- Ch 15 §15.6 (line 7288) — decision-space view, four quadrants.
- Ch 15 (line 7278) — sensitivity formula.
- Ch 15 Box 15.2 (line 7318) — Principle of Coupling and Organization.
- Ch 15 Box 15.1 (line 7226) — Principle of Robustness / fuzzy Pareto.

> See full text in plans/research/crawley-book-findings.md §Ch 15.
