---
source: "Crawley 2015, System Architecture"
chapter: 8
section: "Ch 8 §§8.1–8.5 + Table 8.1 question set, Box 8.1 clustering procedure"
relevance_to_kb: "Level-1 → Level-2 expansion, function-goal reasoning, 2-Down-1-Up clustering algorithm — how KB-5 turns a concept into a full architecture."
word_count: 490
---

# Crawley Ch 8 — From Concept to Architecture

Ch 8 is where the concept from Ch 7 gets converted into a real architecture through hierarchic expansion.

## Table 8.1 — full architecture question set (lines 3508–3529)

Collects every question from Chs 4–7 into a single numbered list — this IS the canonical architecture documentation schema, and KB-5 should mirror it directly:

- **7a** — beneficiary + needs + SNF
- **5a** — specific function + concept
- **5b** — internal functions + concept fragments
- **5c** — functional architecture + value pathway
- **5d** — secondary functions
- **4a–4f** — form: system, elements, structure, accompanying systems, boundaries+interfaces, use context
- **6a–6g** — form-to-function mapping, non-idealities, supporting functions, interfaces, sequence, parallel threads, timing
- **8a** — Level-1 → Level-2 extension
- **8b** — modularization of Level-2 objects

## Function-goal reasoning (§8.2, line 3589)

"The solution at one level becomes the problem statement at the next level." The specific function at Level N becomes the SN intent at Level N+1. Recursion engine.

Example: if Level-0 concept = "flying a traveler with an airplane," then at Level 1 the function "purchasing tickets" becomes an intent that must be specialized (online? agent? kiosk?) into its own internal processes and forms.

## Level-sizing rule (line 3676)

- **Level 1** ≈ 7±2 primary value processes + non-idealities + supporting ≈ 20–30 entities.
- **Level 2** ≈ 50–100 entities.
- **Level 3** ≈ hundreds — don't go there. Humans can't process that.

But the architect MUST go to Level 2 to evaluate the Level-1 decomposition: "the real information about how the entities at Level 1 should be clustered or modularized is hidden at Level 2" (line 3601). This is the **2-Down-1-Up** principle (formalized in Ch 13 Box 13.6, executed here).

## Clustering procedure (Box 8.1, line 3722)

Three choices:
1. **Basis** — processes clustered via shared operands (functional coupling), OR form clustered via structure and shared processes (physical coupling).
2. **Representation** — strip interaction-type markers (`c'/d/a/I`) and replace with 1s; zero out diagonal blocks (PP, OO, FF); leaves a pure adjacency count.
3. **Compute** via clustering algorithm (Thebeau's 2001 MIT thesis algorithm, or the DSMweb.org library) that maximizes intra-cluster coupling and minimizes inter-cluster coupling.

## Worked example: air-transport service (lines 3538ff)

Starts from flying-a-traveler concept, derives Level 1 value pathway (purchase ticket → check in → load → transport → unload → check out), expands Level 2 (28 processes, 16 operand states, 22 form instruments), clusters via Thebeau algorithm to reveal six natural Level-1 groups: reservation, ticket, passenger path, checked-baggage path, carry-on path, secondary services.

Neither the time-sequence decomposition nor the clustered decomposition is "right" — they emphasize different planes (sequence vs. functional interaction).

## KB-5 operational consequence

Ch 8's output is both the **Table-8.1 question list** (KB-5's operational schema) and the **2-Down-1-Up clustering procedure** (the algorithm KB-5 runs when evaluating a candidate decomposition).

## Citations
- Ch 8 Table 8.1 (lines 3508–3529) — full architecture question set.
- Ch 8 §8.2 (line 3589) — function-goal reasoning.
- Ch 8 Box 8.1 (line 3722) — clustering procedure.
- Ch 8 (line 3601) — "real info about Level-1 clustering is hidden at Level 2."
- Ch 8 (line 3676) — level-sizing rule.
- Ch 8 §8.5 (line 3714ff) — modularization worked example.

> See full text in plans/research/crawley-book-findings.md §Ch 8.
