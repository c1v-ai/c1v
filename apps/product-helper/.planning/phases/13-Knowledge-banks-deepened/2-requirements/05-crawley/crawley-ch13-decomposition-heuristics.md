---
name: Crawley Ch 13 — Decomposition Heuristics & Complexity (M2 Dev-Sys-Reqs supplement)
module: M2 Dev System Requirements (Crawley supplement)
supplement_for_module: "M3 FFBD decomposition heuristics"
host_folder: "2-dev-sys-reqs-for-kb-llm-software/"
phase_number: null
phase_slug: "decomposition-planes"
schema_version: "1.0.0"
zod_schema_id: "m3.ffbd.decomposition-plane.v1"
zod_target_path: "apps/product-helper/lib/langchain/schemas/module-3/decomposition-plane.ts (supplement — extends existing M3 envelope)"
source_chapter: "Crawley, Cameron, Selva (2015), Ch 13 — Decomposition as a Tool for Managing Complexity"
source_sections:
  - "§13.1 Box 13.1 Definition: Complexity (N1–N4, C = N1+N2+N3+N4)"
  - "§13.2 Boxes 13.2–13.3 Apparent vs Essential Complexity"
  - "§13.3 Box 13.4 Principle of the 2nd Law (actual > essential)"
  - "§13.3 Box 13.5 Principle of Decomposition (choice of plane)"
  - "§13.3 Box 13.6 Principle of '2 Down, 1 Up'"
  - "§13.3 7±2 heuristic"
  - "§13.4 Modularity vs Commonality"
  - "§13.5 Box 13.8 Twelve Potential Planes + Conway's Law (13th)"
  - "§13.6 Box 13.7 Principle of Elegance"
  - "Case study Saturn V vs Space Station Freedom"
page_range: "book_md lines 6020–6555"
validation_needed: false
derivation_source: "Crawley Ch 13 (primary source). decompositionPlaneSchema (13 values) + complexityKindSchema are phase-local Zod enums introduced here. Complexity math C=N1+N2+N3+N4 fits scalar mathDerivationSchema cleanly — NOT a V2 candidate."
nfr_engine_slot: "NFREngineInterpreter consumes decomposition_plane + complexity_score + level_1_cluster coupling data when resolving modularity / maintainability / changeability NFRs. 2-Down-1-Up gate enforced at Zod schema layer, not engine."
author: "curator (c1v-crawley-kb)"
curated_at: "2026-04-21"
---

# Crawley Ch 13 — Decomposition Heuristics & Complexity

> **Host folder.** This file lives in the `2-dev-sys-reqs-for-kb-llm-software/` KB folder per team-lead ruling (handoff rule: M2/M3 Crawley content → supplement existing folders, do not create new sibling folders). Attribution is handled via the `crawley-*` filename prefix + `Citations` block at EOF.
>
> **Scope.** Supplements the shipped M3 FFBD module (`module-3/` schemas) with Crawley's decomposition heuristics: complexity measurement, 2-Down-1-Up rule, 7±2 heuristic, and the 13-plane taxonomy of decomposition choices. This is a **supplement** — it extends M3 via a new optional schema. Does not replace existing M3 FFBD phases, and does not modify M2 phases either; its home in the M2 folder is curatorial, not architectural.
>
> **Curation note.** Quotations are verbatim from the parsed book MD. Line numbers in parentheses correspond to that file. See `Citations` block at EOF.

---

## Knowledge

### Box 13.1 — Definition: Complexity (line 6020–6040)

Simple measures:
- **N1** = Number of things
- **N2** = Number of types of things
- **N3** = Number of interfaces
- **N4** = Number of types of interfaces

> "The simplest measure of complexity that captures all of these is C = N1 + N2 + N3 + N4."

Alternative (Boothroyd–Dewhurst, cited): `C = (N1 × N2 × N3)^(1/3)`.

> "Complexity is an absolute and quantifiable system property, once a definition is agreed upon. … Complexity should not be viewed as an outcome of the design process, but rather as a quantity to be managed."

### Three kinds of complexity (line 6064–6110)

1. **Apparent complexity (complicatedness)** — "our ability to perceive and comprehend complexity." Apparent ≠ actual.
2. **Actual complexity** — the measured property per Box 13.1.
3. **Essential complexity** — "the minimum complexity that must be incorporated in the system to deliver the robust functionality within a concept." Gratuitous complexity is anything added above essential complexity and should be avoided.

### Box 13.4 — Principle of the 2nd Law (line 6175–6188)

> "The actual complexity of the system always exceeds the essential complexity. Try to keep the actual complexity close to the essential complexity, and the apparent complexity within the range of human understanding."

Apparent complexity can be reduced (by decomposition, abstraction, hierarchy) — but that reduction can INCREASE actual complexity by introducing new interfaces (Figure 13.8: 5 entities + 6 connections → 6 entities + 9 connections after decomposition).

### Box 13.5 — Principle of Decomposition (line 6206–6215)

> "Decomposition is an active choice made by the architect. The decomposition affects how performance is measured, how the organization should be set up, the potential for supplier value capture, and how the product can evolve, among many other things. Choose the plane of decomposition to align as many of these factors as possible, in order to minimize the apparent complexity of the system."

### Box 13.6 — Principle of '2 Down, 1 Up' (line 6231–6242)

> "The goodness of a decomposition at Level 1 cannot be evaluated until the next level down has been populated and the relationships identified (Level 2). Select the modularization at Level 1 that best reflects the clustering of relationships among the elements at Level 2."

> "The modularization should consider maximizing the internal couplings within a cluster and minimizing the couplings among clusters. This is often, but not always, advantageous."

### 7 ± 2 rule (line 6245)

> "Experience suggests that humans seem comfortable managing 7 +/- two elements at each level of decomposition. More than nine elements inhibit the ability of the designer to design, and make cross-element analysis combinatorially more difficult, shifting workload up to the architect. Fewer than five elements at each level create deep decompositions, because more levels are needed to represent all components."

### Modularity vs Commonality (line 6247–6272)

> "A system is modular if its interface(s) allow old modules to be removed, and new modules to be inserted at the interface."

- **Open variants** (Lego) — large/unforecasted number of possible combinations.
- **Common components / platforms** — a closed set of variants (e.g., alternator bracket that accepts 3 variants).
- Modularity often focuses on **operational and design flexibility**; commonality focuses on parts reuse.

### Box 13.8 — Thirteen Potential Planes for Decomposition (line 6312–6327)

Crawley's canonical non-exhaustive list of planes an architect may choose to decompose along. (12 listed in Box + Conway's Law as the 13th, added line 6306–6307.)

1. **Delivered function and emergence** — avoid spreading externally delivered functions across many elements.
2. **Form and structure** — cluster elements of form with high connectivity/spatial relationships; don't interface through high-connectivity regions.
3. **Design latitude and change propagation** — cluster tightly coupled designs.
4. **Changeability and evolution** — place interfaces so modules form platforms supporting product evolution.
5. **Integration transparency** — create interfaces allowing easy testing and visibility.
6. **Suppliers** — interfaces let suppliers work independently and drive technology.
7. **Openness** — balance innovation/network effects vs. information-sharing drawbacks for third parties.
8. **Legacy components** — reuse constrains decomposition; design around.
9. **Clockspeed of technology change** — isolate differently-evolving technologies for async swap.
10. **Marketing and sales** — differentiators / cosmetic refreshes without architectural change.
11. **Operations and interoperability** — operator touch points, wear parts, training/maintenance access.
12. **Timing of investment** — phase development spending; first modules deliver partial value.
13. **Organization (Conway's Law)** — match modularization to the organization building it.

### Conway's Law (line 6306–6307, citing Conway 1968 *Datamation*)

> "Organizations which design systems are constrained to produce designs which are copies of the communication structures of these organizations."

Recent research (MacCormack / Baldwin / Rusnak 2012, *Research Policy*): "strong evidence in support of a causal link between organization and product in software product modularity."

### Box 13.7 — Principle of Elegance (line 6280–6290)

> "Elegance is appreciated internally by the architect when a system has a concept with low essential complexity and a decomposition that aligns many of the planes of decomposition simultaneously. Elegance is appreciated externally by a user when the system embodies a sense of aesthetics, quality, and low apparent complexity."

### Form vs Function decomposition (line 6292–6296)

- **Form decomposition** — allocate one+ elements of form to each Level-1 entity. Concrete; mass sums linearly without emergence.
- **Function decomposition** — list system functions at Level 1. Highlights emergence.

### Saturn V vs Space Station Freedom (line 6338–6555)

- **Saturn V** — solution-neutral function cleanly decomposed by stage; alignment across form/supplier/operation/function planes → clean integration. "Replicates internal function across stages" → simple structural-only interface.
- **Space Station Freedom** — function distributed across every element; mixed suppliers across elements/systems/launch-packages; no alignment. Result: 10 years, ~$10B, modest progress. 1993 restructure aligned launch packages with elements and functions with elements.

> "Elegant architectures have decompositional alignment that allows modularization of all of the factors in the same way, providing simple interfaces."

---

## Input Required

- An M3 FFBD Level-1 cluster set (candidate decomposition).
- An M3 FFBD Level-2 expansion (populated or in-progress — 2-Down-1-Up gate cannot finalize without it).
- Optional: user-declared organizational structure for Conway's Law alignment check.

---

## Instructions for the LLM

### Sub-phase A: Complexity measurement

Compute and emit:
```
complexity_measures: {
  N1: int,                              // Number of things (entities)
  N2: int,                              // Number of types of things
  N3: int,                              // Number of interfaces
  N4: int,                              // Number of types of interfaces
  C_crawley: N1 + N2 + N3 + N4,
  C_boothroyd_dewhurst: (N1 * N2 * N3) ** (1/3),
  complexity_source: 'crawley' | 'boothroyd_dewhurst',
}
```

Emit scalar `mathDerivation` records for each formula:
- Formula: `"C = N1 + N2 + N3 + N4"` (Crawley Box 13.1).
- Formula: `"C = (N1 * N2 * N3)^(1/3)"` (Boothroyd-Dewhurst, cited line 6040).
- `kb_source: "inline"`, `kb_section: "Crawley Ch 13 Box 13.1 book_md line 6020"`.

### Sub-phase B: Essential vs actual complexity delta (Box 13.4)

Emit:
```
essential_complexity: int,              // user estimate
actual_complexity: int,                 // derived from sub-phase A C_crawley
delta_above_essential: actual - essential,
gratuitous_complexity_flag: delta > 0,
```

### Sub-phase C: Plane of decomposition (Box 13.5 + Box 13.8)

Emit:
```
decomposition_plane: decompositionPlaneSchema,    // 13 values
plane_alignment_score: number (0.0–1.0),          // how many other planes align with the chosen one
plane_rationale: string,
```

### Sub-phase D: Level-1 clusters (Box 13.6 "2 Down, 1 Up")

Emit `level_1_clusters[]` with **mandatory Level-2 evidence**:
```
level_1_clusters: Array<{
  cluster_id: string,
  name: string,
  entities: string[],
  internal_coupling_score: number,       // Σ(internal connections) / possible internal connections
  external_coupling_score: number,       // Σ(external connections to other clusters) / total external
  level_2_detail_populated: boolean,     // REQUIRED true for _phase_status: 'complete'
  level_2_relationship_evidence: string, // short description
}>
```

### Sub-phase E: 7±2 caps

For every `level_1_cluster.entities`:
- `entities.length > 9` → emit `needs_subdivision: true` flag.
- `entities.length < 5` → emit `consider_merging_level: true` warning.

### Sub-phase F: Conway's Law alignment

Emit (optional):
```
conway_law_alignment: {
  target_organizational_structure: string | null,
  aligned: boolean | null,
  misalignment_notes: string | null,
}
```

If `target_organizational_structure` provided but `aligned === false` → emit a `high_severity_advisory` note (Crawley: misalignment surfaces post-launch as defects, 2012 MacCormack study).

### STOP GAP — 2-Down-1-Up + elegance

Before marking `_phase_status: "complete"`:

1. **2-Down-1-Up gate:** every `level_1_cluster.level_2_detail_populated` must be `true`.
2. **7±2 cap:** no cluster has `entities.length > 9`.
3. **Plane declared:** `decomposition_plane` is not null.
4. **Elegance score (Box 13.7):** `plane_alignment_score >= 0.5` — fewer than half the planes aligning is the Space Station Freedom anti-pattern.

---

## Zod Schema

```ts
// apps/product-helper/lib/langchain/schemas/module-3/decomposition-plane.ts

import { z } from 'zod';
import {
  sourceRefSchema,
  mathDerivationSchema,
} from '@/lib/langchain/schemas/module-2/_shared';

// Phase-local — Crawley Box 13.8 thirteen decomposition planes (12 + Conway).
export const decompositionPlaneSchema = z
  .enum([
    'delivered_function_emergence',
    'form_structure',
    'design_latitude',
    'changeability_evolution',
    'integration_transparency',
    'suppliers',
    'openness',
    'legacy_components',
    'clockspeed_technology',
    'marketing_sales',
    'operations_interoperability',
    'timing_of_investment',
    'organization_conway',
  ])
  .describe(
    'x-ui-surface=section:Decomposition > Plane — Crawley Box 13.8 thirteen decomposition planes.',
  );
export type DecompositionPlane = z.infer<typeof decompositionPlaneSchema>;

// Phase-local — Crawley §13.2 three kinds of complexity.
export const complexityKindSchema = z
  .enum(['apparent', 'actual', 'essential'])
  .describe(
    'x-ui-surface=section:Decomposition > Complexity — Crawley §13.2 three kinds.',
  );

export const complexityMeasuresSchema = z
  .object({
    N1: z.number().int().nonneg().describe('x-ui-surface=section:Decomposition > Complexity — number of things.'),
    N2: z.number().int().nonneg().describe('x-ui-surface=section:Decomposition > Complexity — types of things.'),
    N3: z.number().int().nonneg().describe('x-ui-surface=section:Decomposition > Complexity — number of interfaces.'),
    N4: z.number().int().nonneg().describe('x-ui-surface=section:Decomposition > Complexity — types of interfaces.'),
    C_crawley: z.number().nonneg().describe(
      'x-ui-surface=section:Decomposition > Complexity — C = N1+N2+N3+N4.',
    ),
    C_boothroyd_dewhurst: z.number().nonneg().describe(
      'x-ui-surface=section:Decomposition > Complexity — (N1*N2*N3)^(1/3).',
    ),
    complexity_source: z.enum(['crawley', 'boothroyd_dewhurst']),
  })
  .describe(
    'x-ui-surface=section:Decomposition > Complexity — Crawley Box 13.1 complexity measures.',
  );

export const complexityDerivationCrawleySchema = mathDerivationSchema.extend({
  formula: z.literal('C = N1 + N2 + N3 + N4'),
  kb_source: z.literal('inline'),
  kb_section: z.literal('Crawley Ch 13 Box 13.1 book_md line 6020'),
});

export const complexityDerivationBoothroydSchema = mathDerivationSchema.extend({
  formula: z.literal('C = (N1 * N2 * N3)^(1/3)'),
  kb_source: z.literal('inline'),
  kb_section: z.literal('Boothroyd-Dewhurst, cited in Crawley Ch 13 book_md line 6040'),
});

export const level1ClusterSchema = z
  .object({
    cluster_id: z.string(),
    name: z.string(),
    entities: z.array(z.string()).min(1),
    internal_coupling_score: z.number().min(0).max(1),
    external_coupling_score: z.number().min(0).max(1),
    level_2_detail_populated: z.boolean(),
    level_2_relationship_evidence: z.string(),
    needs_subdivision: z.boolean().default(false),
    consider_merging_level: z.boolean().default(false),
  })
  .describe(
    'x-ui-surface=section:Decomposition > Level 1 — one Level-1 cluster with required 2-Down-1-Up evidence.',
  );

export const conwayLawAlignmentSchema = z
  .object({
    target_organizational_structure: z.string().nullable(),
    aligned: z.boolean().nullable(),
    misalignment_notes: z.string().nullable(),
  })
  .describe(
    'x-ui-surface=section:Decomposition > Conway\'s Law — Box 13.8 plane 13, Crawley line 6306.',
  );

// Standalone schema (M3 supplement — does NOT extend phaseEnvelopeSchema since
// this is an optional add-on to an existing M3 phase, not a new top-level phase).
export const decompositionPlaneArtifactSchema = z
  .object({
    _schema: z.literal('module-3.decomposition-plane.v1'),
    _phase_status: z.enum(['planned', 'in_progress', 'complete', 'needs_revision']),
    decomposition_plane: decompositionPlaneSchema,
    plane_alignment_score: z.number().min(0).max(1),
    plane_rationale: z.string(),
    complexity_measures: complexityMeasuresSchema,
    complexity_derivations: z
      .object({
        crawley: complexityDerivationCrawleySchema,
        boothroyd_dewhurst: complexityDerivationBoothroydSchema.optional(),
      })
      .describe(
        'x-ui-surface=section:Decomposition > Complexity — scalar mathDerivation records (NOT V2 candidates).',
      ),
    essential_complexity: z.number().int().nonneg(),
    delta_above_essential: z.number().int(),
    gratuitous_complexity_flag: z.boolean(),
    level_1_clusters: z.array(level1ClusterSchema).min(1),
    conway_law_alignment: conwayLawAlignmentSchema.optional(),
    crawley_refs: z.array(sourceRefSchema).default([]),
  })
  .describe(
    'x-ui-surface=page-header — M3 Decomposition Plane supplement per Crawley Ch 13.',
  );

export type DecompositionPlaneArtifact = z.infer<typeof decompositionPlaneArtifactSchema>;
```

### Refinement — 2-Down-1-Up + 7±2 + elegance

```ts
export const decompositionPlaneArtifactWithInvariants =
  decompositionPlaneArtifactSchema.superRefine((val, ctx) => {
    // 1. 2-Down-1-Up gate (Box 13.6).
    if (val._phase_status === 'complete') {
      const missingL2 = val.level_1_clusters.filter(
        (c) => !c.level_2_detail_populated,
      );
      if (missingL2.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['level_1_clusters'],
          message: `Crawley Box 13.6 "2 Down, 1 Up": ${missingL2.length} cluster(s) lack Level-2 detail. Cannot finalize Level 1 decomposition without Level-2 evidence.`,
        });
      }
    }
    // 2. 7±2 hard cap.
    for (const cluster of val.level_1_clusters) {
      if (cluster.entities.length > 9) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['level_1_clusters'],
          message: `Crawley line 6245 "more than 9 elements inhibit design ability": cluster "${cluster.name}" has ${cluster.entities.length} entities. Subdivide.`,
        });
      }
    }
    // 3. Elegance advisory (Box 13.7).
    if (val._phase_status === 'complete' && val.plane_alignment_score < 0.5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['plane_alignment_score'],
        message: `Crawley Box 13.7 Principle of Elegance: plane_alignment_score=${val.plane_alignment_score} < 0.5. Space Station Freedom anti-pattern risk (misalignment across planes).`,
      });
    }
  });
```

---

## NFREngineInterpreter boundary note

Consumes `decomposition_plane`, `complexity_measures`, and `level_1_clusters[].internal_coupling_score` when resolving modularity / maintainability / changeability NFRs. The complexity formulas and 7±2 / 2-Down-1-Up gates run **at Zod-parse time** via `.superRefine()` — not inside NFREngineInterpreter. The interpreter reads the validated output; it does not perform the decomposition. No `DecompositionEngine` class introduced.

---

## mathDerivationV2 impact

**None.** Complexity formulas are scalar (`C` is a number). Fits existing `mathDerivationSchema.result: z.union([z.number(), z.string()])` without extension. Running V2 tally unchanged at 2.

---

## c1v applicability summary

| Methodology rule | Enforced by |
|---|---|
| Complexity = N1+N2+N3+N4 (Box 13.1) | Scalar `mathDerivation` record |
| Actual > Essential principle | `delta_above_essential` + `gratuitous_complexity_flag` |
| 2-Down-1-Up (Box 13.6) | `.superRefine()` — Level-2 detail required for complete |
| 7±2 cap | `.superRefine()` — max 9 entities per cluster |
| 13 decomposition planes (Box 13.8) | `decompositionPlaneSchema` enum |
| Conway's Law alignment (13th plane) | `conway_law_alignment` optional record |
| Elegance (Box 13.7) | `plane_alignment_score >= 0.5` on complete |
| Form vs Function decomposition | Implicit in plane choice (form_structure vs delivered_function_emergence) |

---

## Citations

- **Crawley, Cameron, Selva (2015).** Ch 13.
  - Box 13.1 — Complexity definition (book_md line 6020–6040)
  - Box 13.2 — Apparent Complexity (book_md line 6066)
  - Box 13.3 — Essential Complexity (book_md line 6115)
  - Box 13.4 — Principle of the 2nd Law (book_md line 6175–6188)
  - Box 13.5 — Principle of Decomposition (book_md line 6206–6215)
  - Box 13.6 — Principle of '2 Down, 1 Up' (book_md line 6231–6242)
  - 7±2 rule (book_md line 6245)
  - Modularity (book_md line 6247–6272)
  - Box 13.7 — Principle of Elegance (book_md line 6280–6290)
  - Box 13.8 — Twelve Potential Planes (book_md line 6312–6327)
  - Conway's Law citation (book_md line 6306–6307)
  - Form vs Function decomposition (book_md line 6292–6296)
  - Saturn V vs Space Station Freedom (book_md line 6338–6555)

- **Boothroyd, G. & Dewhurst, P.** *(cited Box 13.1 alternative complexity measure)*

- **Conway, M. E. (1968).** *How Do Committees Invent?* Datamation. *(cited line 6306)*

- **MacCormack, A., Baldwin, C., & Rusnak, J. (2012).** Exploring the Duality between Product and Organizational Architectures. *Research Policy.* *(cited line 6307, empirical support for Conway's Law in software modularity)*

- **Cross-references:**
  - `../5-form-function-mapping/GLOSSARY-crawley.md` — complexity, decomposition, modularity glossary terms.
  - `apps/product-helper/lib/langchain/schemas/module-3/` — existing M3 FFBD envelope this supplement extends.
  - `apps/product-helper/lib/langchain/schemas/module-2/_shared.ts` — sourceRefSchema, mathDerivationSchema (consumed; NOT modified).
  - `../5-form-function-mapping/05-Phase-5-Concept-Expansion.md` — Ch 8 Thebeau clustering feeds this supplement's Level-1 cluster scores.

**Ruling anchors:**
- Handoff §3 — Crawley Ch 13 is IN SCOPE for M3 hybrid methodology.
- Team-lead 2026-04-21 — phase-local enum pattern green-lit; `decompositionPlaneSchema`, `complexityKindSchema` stay module-local.
- Team-lead 2026-04-22 — M3 Ch 13 content housed in `2-dev-sys-reqs-for-kb-llm-software/` with `crawley-*` filename prefix, NOT in a new sibling folder. Attribution at file level, not folder level.
- `_shared.ts` untouched; `phaseStatusSchema` unchanged (Option A discipline applied).
