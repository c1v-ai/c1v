---
source: "Crawley 2015, System Architecture"
chapter: 16
section: "Ch 16 §16.4 + Table 16.2 (six Selva operator patterns)"
relevance_to_kb: "The six Selva patterns (DECISION-OPTION, DOWN-SELECTING, ASSIGNING, PARTITIONING, PERMUTING, CONNECTING) are the formal tradespace shapes a KB-4 decision problem casts into."
word_count: 440
---

# Crawley Ch 16 — Formulating and Solving System Architecture Optimization Problems

## The Six Patterns (Table 16.2, line 7523)

1. **DECISION-OPTION** (line 7538)
   A group of decisions where each decision has its own discrete set of options. Tradespace size = product of options per decision. Most general Pattern; use when decisions are heterogeneous (Apollo 9 decisions).

2. **DOWN-SELECTING** (line 7584)
   A group of binary decisions representing a subset chosen from a set of candidate entities. Tradespace size = 2^m. Captures synergies/interferences/redundancies between elements (NEOSS instrument selection). Extends the 0/1 knapsack problem by modeling element-to-element interactions.

3. **ASSIGNING** (line 7636)
   Given two sets (left and right), assign each left element to any subset of right elements. Tradespace size = 2^(mn). Two extreme styles:
   - **Channelized** — each left → exactly one right (Saturn V stages).
   - **Fully cross-strapped** — every left → every right (Space Shuttle avionics, "Total Football").

   Trade-off: cost vs. reliability/throughput (Box 16.2).

4. **PARTITIONING** (line 7722)
   Partition a single set of N elements into non-empty disjoint subsets (mutually exclusive and exhaustive). Tradespace size via Bell numbers (52 partitions for N=5, 115K for N=10). Extreme styles:
   - **Monolithic** — all in one subset (Envisat with 10 instruments).
   - **Fully distributed** — each in its own subset (dedicated single-instrument satellites).

   Trade-off: synergies/interferences + redundancy + evolvability (Box 16.3).

5. **PERMUTING** (line 7796)
   Bijection between N elements and integers 1..N (a total ordering or sequencing). Tradespace size = N!. Extreme styles:
   - **Greedy deployment** — highest-value elements first, long lead time, high programmatic risk.
   - **Incremental deployment** — deliver some value ASAP, then build up.

   Trade-off: delivery risk vs. total cost (Box 16.4).

6. **CONNECTING** (line 7841)
   Given a set of nodes, choose a graph (set of edges). Tradespace size = 2^(m(m-1)/2) for undirected/no-self, 2^(m²) for directed/self-connected. Styles = network topologies (bus, star, ring, mesh, tree, hybrid). Relevant properties: latency, throughput, reliability, scalability (Box 16.5).

## Pattern selection rule

The six Patterns support Tasks 1–6 of Table 16.1 (decomposing, mapping, specializing, characterizing, connecting, selecting-goals) but not one-to-one — most problems are formulatable in multiple Patterns; **pick the one that exposes the most structure for the optimizer**.

## KB-4 operational use

Every decision node (or decision cluster) in the c1v decision network is tagged with a Pattern, which determines:
- Tradespace enumeration algorithm.
- Extreme-style baseline pair (for Pugh-style anchor).
- Expected metric trade-off axis.

## Citations
- Ch 16 Table 16.2 (line 7523) — six-Pattern list.
- Ch 16 §16.4 (lines 7499–7888) — detailed Pattern definitions + architecture styles.
- Selva 2016, "Patterns in System Architecture Decisions," *Systems Engineering*.

> See full text in plans/research/crawley-book-findings.md §Ch 16.
