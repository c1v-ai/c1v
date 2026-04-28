---
source: "Crawley 2015, System Architecture"
chapter: 13
section: "Ch 13 (whole), esp. Box 13.8 Twelve Planes of Decomposition"
relevance_to_kb: "FFBD block clustering requires an explicit plane-of-decomposition choice (Box 13.5) and 2-Down-1-Up evaluation (Box 13.6); Box 13.8 enumerates the 12 candidate planes."
word_count: 500
---

# Crawley Ch 13 — Decomposition (for FFBD)

Ch 13 gives KB-3 (FFBD) its critical heuristic pool. Complexity is measurable as **C = N1 (things) + N2 (types of things) + N3 (interfaces) + N4 (types of interfaces)** — Box 13.1.

## Three flavors of complexity (Boxes 13.3, 13.4)

- **Essential complexity** — minimum to deliver functionality within a concept.
- **Actual complexity** — what you actually measure (always ≥ essential because decomposition + abstraction + hierarchy add overhead).
- **Gratuitous complexity** — actual − essential. The architect minimizes this.

Complicated ≠ complex: complicated is about the observer's inability to perceive. The architect's job is to "build systems of the necessary level of complexity that are not complicated."

## Principle of Decomposition (Box 13.5)

Decomposition involves three choices:
1. How many internal boundaries
2. Where to place them
3. **In what plane** (highest-leverage)

## Principle of 2-Down-1-Up (Box 13.6)

"The goodness of a decomposition at Level 1 cannot be evaluated until the next level down has been populated and the relationships identified (Level 2). Select the modularization at Level 1 that best reflects the clustering of relationships among the elements at Level 2."

Operational instantiation: Ch 8 Box 8.1 (clustering via Thebeau/DSMweb algorithms on PO-array DSMs, maximizing intra-cluster coupling, minimizing inter-cluster coupling).

## Box 13.8 — The 12 Planes of Decomposition

KB-3 FFBD must pick a plane explicitly and name it:

1. **Delivered function and emergence** — don't spread externally-delivered functions across many elements (hard to integrate).
2. **Form and structure** — cluster high-connectivity form, don't interface across high-connection regions.
3. **Design latitude and change propagation** — group tightly-coupled designs.
4. **Changeability and evolution** — place interfaces so modules combine into platforms.
5. **Integration transparency** — interfaces should support testing and visibility.
6. **Suppliers** — interface where suppliers can work independently.
7. **Openness** — interfaces open to third parties balance innovation vs. IP leakage.
8. **Legacy components** — reuse constrains decomposition.
9. **Clockspeed of technology change** — interfaces should allow different-rate technology swap-out.
10. **Marketing and sales** — enable differentiating features without architectural change.
11. **Operations and interoperability** — expose wear parts and operator touch points.
12. **Timing of investment** — phase development spending.

Plus **organization** (Conway's Law, line 6306): "organizations which design systems are constrained to produce designs which are copies of the communication structures of these organizations."

## Principle of Elegance (Box 13.7)

"Elegance is appreciated internally by the architect when a system has a concept with low essential complexity and a decomposition that aligns many of the planes of decomposition simultaneously."

## Citations
- Ch 13 Box 13.1 (line 6020) — complexity measures.
- Ch 13 Boxes 13.3–13.4 — essential / gratuitous / actual complexity.
- Ch 13 Box 13.5 (line 6206) — Principle of Decomposition.
- Ch 13 Box 13.6 (line 6231) — 2-Down-1-Up.
- Ch 13 Box 13.8 (line 6312) — 12 Planes.
- Ch 13 Box 13.7 (line 6280) — Elegance.
- Ch 13 (line 6306) — Conway's Law.

> See full text in plans/research/crawley-book-findings.md §Ch 13.
