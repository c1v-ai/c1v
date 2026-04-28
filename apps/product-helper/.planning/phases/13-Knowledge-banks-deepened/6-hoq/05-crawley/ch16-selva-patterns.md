---
source: "Crawley 2015, System Architecture"
chapter: 16
section: "Ch 16 §16.4 \"Patterns in System Architecting Decisions\" + Table 16.2"
relevance_to_kb: "The six Selva operator patterns define the structural shapes a HoQ tradespace can take; pattern choice drives tradespace enumeration and extreme-style baseline pairs."
word_count: 450
---

# Crawley Ch 16 — Six Patterns in System Architecting Decisions (for HoQ)

The House-of-Quality tradespace is structurally one of six Selva patterns. Pattern choice determines how the HoQ rows/columns enumerate and which "extreme style" baselines anchor the Pugh-style rating.

## Table 16.2 — Six Patterns (line 7523)

### 1. DECISION-OPTION (line 7538)
A group of decisions where each decision has its own discrete set of options.
- **Tradespace size:** product of options per decision.
- **Use when:** decisions are heterogeneous (Apollo 9 decisions).
- **HoQ shape:** columns = options, rows = heterogeneous decisions.

### 2. DOWN-SELECTING (line 7584)
A group of binary decisions representing a subset chosen from a set of candidate entities.
- **Tradespace size:** 2^m.
- **Captures:** synergies, interferences, redundancies between elements (NEOSS instrument selection).
- **Relation:** extends 0/1 knapsack with element-to-element interactions.
- **HoQ shape:** columns = binary choices, roof correlation captures element interactions.

### 3. ASSIGNING (line 7636)
Given two sets (left and right), assign each left element to any subset of right elements.
- **Tradespace size:** 2^(mn).
- **Extreme styles:** channelized (each left → one right, e.g., Saturn V stages) vs. fully cross-strapped (every left → every right, e.g., Space Shuttle avionics, "Total Football").
- **Trade-off:** cost vs. reliability/throughput (Box 16.2).

### 4. PARTITIONING (line 7722)
Partition N elements into non-empty disjoint subsets (mutually exclusive and exhaustive).
- **Tradespace size:** Bell numbers (52 for N=5, 115K for N=10).
- **Extreme styles:** monolithic (all-in-one, Envisat 10 instruments) vs. fully distributed (each alone, dedicated single-instrument satellites).
- **Trade-off:** synergies + redundancy + evolvability (Box 16.3).

### 5. PERMUTING (line 7796)
Bijection between N elements and integers 1..N (total ordering / sequencing).
- **Tradespace size:** N!.
- **Extreme styles:** greedy deployment (highest-value first, long lead time) vs. incremental deployment (value ASAP, build up).
- **Trade-off:** delivery risk vs. total cost (Box 16.4).

### 6. CONNECTING (line 7841)
Given a set of nodes, choose a graph (set of edges).
- **Tradespace size:** 2^(m(m-1)/2) for undirected/no-self, 2^(m²) for directed/self-connected.
- **Styles:** bus, star, ring, mesh, tree, hybrid.
- **Properties:** latency, throughput, reliability, scalability (Box 16.5).

## Pattern selection rule

The six Patterns support Tasks 1–6 of Table 16.1 (decomposing, mapping, specializing, characterizing, connecting, selecting-goals) but **not one-to-one** — most problems are formulatable in multiple Patterns; pick the one that exposes the most structure for the optimizer.

## KB-6 HoQ operational consequence

HoQ tables in c1v carry a **Pattern tag** that determines:
- Row/column enumeration algorithm.
- Extreme-style baseline pair (Pugh anchors).
- Relevant metric families (cost, reliability, latency, etc.).
- Roof-correlation semantics (synergy vs. interference, compatibility constraints).

## Citations
- Ch 16 Table 16.2 (line 7523) — six-Pattern list.
- Ch 16 §16.4 (lines 7499–7888) — detailed Pattern definitions + architecture styles.
- Selva 2016, "Patterns in System Architecture Decisions," *Systems Engineering*.

> See full text in plans/research/crawley-book-findings.md §Ch 16.
