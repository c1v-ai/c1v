# Phase 0: QFD Overview and Terminology
> Corresponds to QFD Guide Steps 0-1

## Prerequisites
- [ ] You have a system or product concept to analyze
- [ ] You have an understanding of your customer's needs (even if informal)
- [ ] Recommended: You are familiar with Decision Matrix concepts (performance criteria, weights, normalization, scoring) from [Module 4](../../4%20-%20Assessing%20Your%20System's%20Performance%20and%20Value/MD%20files/00%20-%20Module%20Overview.md). The QFD builds on these foundations. See [From Decision Matrix to QFD](../../4%20-%20Assessing%20Your%20System's%20Performance%20and%20Value/MD%20files/17%20-%20From%20Decision%20Matrix%20to%20QFD.md) for how the concepts connect.

## Context (Why This Matters)

Quality Function Deployment (QFD) is one of the most effective tools for relating performance metrics your customer cares about to the technical criteria and engineering parameters your team controls. It produces a single master document -- the **House of Quality** -- that ties together customer needs, competitive analysis, engineering trade-offs, and design targets. The QFD helps you defend *why* your design targets will lead to a winning solution.

Every design involves trade-offs: increase maximum speed but use more fuel, make the system more expensive to improve one subsystem at the cost of another, require a low error rate or allow a higher rate with better error handling. The QFD provides a systematic framework for documenting and justifying these decisions.

## Instructions

### Step 0.1: Understand the Four Key Terms

Before touching the template, internalize these definitions:

**Design Target** -- The intended or desired value for an engineering characteristic in your final design. Examples: target speed, target weight, target cost, target response time.

**Engineering Characteristic (EC)** -- Any property of your system that you have control over. Think of these as the "knobs" you can tweak: speed, weight, size, mean time between failure, response time, material cost, manufacturing cost, algorithm complexity, etc. Adjusting one knob often influences others (e.g., making your system bigger might also make it heavier).

**Performance Criteria (PC)** -- Measurable attributes that express how well your system scores on dimensions your *customer* cares about: reliability, accuracy, portability, safety, cost-effectiveness, etc. Each criterion has an importance weight.

**Imputed Importance** -- A calculated summary of how much influence each engineering characteristic has (both positive and negative) on your system's overall performance. Calculated from the relationship matrix and PC weights.

The critical distinction: **engineering characteristics are what you control; performance criteria are what your customer cares about.** Your goal is to know how adjusting your EC knobs will achieve the highest performance score. The values you choose for those knobs are your design targets.

### Step 0.2: Understand the House of Quality Structure

The QFD matrix is called the "House of Quality" because its shape resembles a house. It has six named sections:

```
                    ┌─────────────────────┐
                    │       ROOF          │  EC-to-EC interrelationships
                    │  (triangular matrix) │  (trade-offs within your design)
                    └─────────────────────┘
┌───────────┐  ┌──────────────────────┐  ┌──────────────┐
│  FRONT    │  │     SECOND FLOOR     │  │              │
│  PORCH    │  │  (EC column headers  │  │              │
│           │  │   + direction arrows) │  │              │
│ Perf.     │  ├──────────────────────┤  │  BACK PORCH  │
│ Criteria  │  │                      │  │              │
│ + Weights │  │     MAIN FLOOR       │  │  Competitive │
│           │  │  (Relationship matrix │  │  Analysis    │
│           │  │   EC impact on PC)   │  │  (scores)    │
└───────────┘  └──────────────────────┘  └──────────────┘
               ┌──────────────────────┐
               │      BASEMENT        │
               │  Design targets,     │
               │  imputed importance, │
               │  difficulty, cost,   │
               │  competitor EC values│
               └──────────────────────┘
```

| Section | Location | Contains |
|---------|----------|----------|
| Front Porch | Left side | Performance criteria + importance weights |
| Back Porch | Right side | Competitive scoring (normalized, weighted) |
| Second Floor | Column headers | Engineering characteristics + direction-of-change arrows |
| Main Floor | Center matrix | How each EC affects each PC (-2 to +2) |
| Roof | Top triangle | How each EC affects other ECs (-2 to +2) |
| Basement | Below main floor | Design targets, imputed importance, competitor EC values, difficulty, cost |

### Step 0.3: Understand the Build Sequence

The House of Quality is built in this order across the remaining phases:

1. **Phase 1 -- Front Porch**: List performance criteria, assign importance weights
2. **Phase 2 -- Back Porch**: Score your system and competitors on each PC
3. **Phase 3 -- Second Floor**: List engineering characteristics with direction-of-change arrows
4. **Phase 4 -- Main Floor**: Fill the relationship matrix (EC impact on PC)
5. **Phase 5 -- Roof**: Fill the interrelationship matrix (EC impact on EC)
6. **Phase 6 -- Basement Part 1**: Calculate imputed importance
7. **Phase 7 -- Basement Part 2**: Document competitor EC values, units, thresholds
8. **Phase 8 -- Basement Part 3**: Assess technical difficulty and cost, re-evaluate relationships
9. **Phase 9 -- Design Targets**: Set targets using all accumulated data
10. **Phase 10 -- Final Review**: Iterate, verify, draft written answers

## Worked Example

Throughout these phases, we use an **open-source e-commerce platform** as the running example. This continues from the Module 4 Decision Matrix, where this option (Option C) was selected as the best balance of cost, flexibility, and time-to-market over a commercial platform (Shopify Plus) and a full custom build.

The platform operates as follows:
1. A customer browses the storefront — the CDN serves cached pages and product images
2. The customer searches for products — the search service queries the product database and returns ranked results
3. The customer adds items to a cart — the cart service manages session state and validates inventory
4. The customer proceeds to checkout — the order service calculates totals, taxes, and shipping
5. The customer submits payment — the payment gateway processes the transaction via a third-party API
6. The system confirms the order — a message queue triggers fulfillment notifications, inventory updates, and email confirmation

This system has 8 performance criteria (reliability, page load speed, cost, peak traffic capacity, launch speed, scalability, maintenance effort, security) and ~20 engineering characteristics (server response time, database query latency, CDN cache hit rate, deployment frequency, test coverage, number of redundant instances, etc.).

> **Bridge from Module 4:** The Decision Matrix told you *which* option to build. The QFD now tells you *how* to build it — what specific engineering targets will make this platform outperform the alternatives you rejected.

## Validation Checklist (STOP-GAP)
- [ ] Can you define **design target** in one sentence? (The intended value for an engineering characteristic)
- [ ] Can you define **engineering characteristic** in one sentence? (A property of your system you control -- a "knob")
- [ ] Can you define **performance criteria** in one sentence? (A measurable attribute your customer cares about)
- [ ] Can you define **imputed importance** in one sentence? (A weighted summary of how much an EC influences overall performance)
- [ ] Can you name all six sections of the House of Quality? (Front porch, back porch, second floor, main floor, roof, basement)
- [ ] Do you have a system/product concept ready to analyze?

> **STOP: Do not proceed to Phase 1 until ALL validation items pass.**
> If any item fails, re-read the relevant definition above. If the user has not provided a system to analyze, request one before continuing.

## Output Artifact
A confirmed understanding of QFD terminology and the House of Quality structure. No spreadsheet work yet.

## Handoff to Next Phase
You now understand the QFD framework and its six sections. Phase 1 will populate the **front porch** by listing your performance criteria and assigning importance weights.

---

**Next →** [Phase 1: Front Porch -- Performance Criteria](01_FRONT-PORCH--PERFORMANCE-CRITERIA.md) | **Reference:** [Glossary](GLOSSARY.md) · [Cell Map](TEMPLATE_CELL-MAP.md)
