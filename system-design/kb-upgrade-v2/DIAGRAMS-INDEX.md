# c1v System Design — Diagram + Artifact Index

> One-stop entry point for all module deliverables rendered in Obsidian.

## Module 1 — Defining Scope ✅
- [[module-1-defining-scope/M1-diagrams|M1-diagrams]] — Context, Use Case, Scope Tree (3 Mermaid)
- `module-1-defining-scope/system_scope_summary.json`
- `module-1-defining-scope/use_case_inventory.json`

## Module 2 — Requirements ✅
- [[module-2-requirements/M2-sysml-diagrams|M2-sysml-diagrams]] — 6 UCBD SysML activity diagrams
- [[module-2-requirements/open_questions|open_questions]] — 3 non-constant + 23 below-threshold constants awaiting review
- `module-2-requirements/requirements_table.json` — 99 requirements
- `module-2-requirements/constants_table.json` — 28 constants
- `module-2-requirements/ucbd/` — 6 UCBDs (UC01/03/04/06/08/11)
- `module-2-requirements/diagrams/c1v_UCBDs.pptx` — 14-slide stakeholder deck

## Module 3 — FFBD ✅
- [[module-3-ffbd/FFBD-diagrams|FFBD-diagrams]] — Top-level + F.2–F.7 (7 Mermaid)
- `module-3-ffbd/c1v_FFBD.pdf` — 7-page PDF (renders natively in Obsidian)
- `module-3-ffbd/c1v_FFBD.pptx` — Slide deck
- [[module-3-ffbd/WRITTEN-ANSWERS|WRITTEN-ANSWERS]] — Part 1 + Part 2 eCornell deliverables
- `module-3-ffbd/validation_report.json` — overall_pass: true, 2 open items
- `module-3-ffbd/decision_matrix_handoff.json` — M4 input

## Module 4 — Decision Matrix ✅
- [[module-4-decision-matrix/final_report|final_report]] — **Winner: Option C Dual-Mode Platform** (score 0.662)
- `module-4-decision-matrix/renders/decision_matrix_c1v.xlsx` — Full matrix (Excel)
- `module-4-decision-matrix/diagrams/decision_matrix.pptx` — Slide deck
- `module-4-decision-matrix/sensitivity_analysis.json`
- `module-4-decision-matrix/qfd_handoff.json` — M5 input

## Module 5 — QFD (House of Quality) ✅
- [[module-6-qfd/M5-summary|M5-summary]] — Readable summary of QFD output
- `module-6-qfd/c1v_QFD.xlsx` — Full House of Quality (Excel)
- `module-6-qfd/c1v_QFD.json` — Machine-readable source

## Module 6 — Interface Definition 🟡 Starting
- _not yet shipped_

---

## Architecture planning (parallel track — not part of the 6-module run)
- [[../plans/kb-runtime-architecture|kb-runtime-architecture]] — Huyen-diagram component map for the NFR engine runtime (hybrid static + RAG)
- [[../plans/schema-first-kb-rewrite-and-nfr-engine|schema-first-kb-rewrite-and-nfr-engine]] — Parent plan for the KB rewrite + NFR math engine
- [[../plans/schema-first-kb-rewrite-and-nfr-engine.critique|critique]] — 10 ranked findings on the above