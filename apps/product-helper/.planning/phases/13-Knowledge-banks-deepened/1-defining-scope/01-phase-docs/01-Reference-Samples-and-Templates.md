# Reference Samples and Templates

All source materials live in `../course-lectures-master-md/` (sibling to this KB folder). The KB itself is methodology-authoritative; this file is the asset inventory.

## Course Material — Read in Order

| File | Purpose | Used by phase |
|------|---------|---------------|
| `Defining-Scope-Steps-Checklist.md` | The 11-step master checklist verbatim from eCornell | All phases (canonical step IDs) |
| `Defining-Your-System-Part-I-guide.md` | Long-form narrative guide | P0, P1 |
| `FULL-INSTRUCTIONS.md` | Full course transcript with all five fail-closed-rule sources | All phases (citations) |

## Context Diagram Assets

| File | Purpose | Used by phase |
|------|---------|---------------|
| `Context-Diagram-Visual-Guide.md` | Step-by-step visual walkthrough (vehicle example) | P1 |
| `Context_Diagram_Sample.md` | One-image worked sample | P1 (calibration) |
| `Context_Diagram_Template.md` | Blank template description | P1 |
| `Context_Diagram_Template (2).pptx` | Editable PPTX template (legacy reference; v1 emits Mermaid) | reference only |
| `Context_Diagram_Sample.pptx` | Filled sample PPTX (legacy reference) | reference only |
| `01-context-diagram-1.mmd` | **Mermaid template** for v1 emitter | P1 (clone-and-edit) |
| `01-context-diagram-1.png` / `.svg` | Rendered version of the .mmd | P1 (visual reference) |
| `context-diagram-example-1.png` … `-3.png`, `context-diagram-sample-1.png`, `-2.png` | Multiple worked PNG examples | P1 (visual reference) |
| `source_ContextDiagramExample.pptx` | Original eCornell example | reference only |
| `generate_context_diagram_pptx.py` | Legacy Python PPTX emitter (not used in v1) | deferred to v2 |

## Use Case Diagram Assets

| File | Purpose | Used by phase |
|------|---------|---------------|
| `UseCaseDiagram-visual-instructions.md` | Step-by-step build of the vehicle use-case diagram | P2 |
| `UseCaseDiagram-visual-instructions.pptx` | Slide version of above | reference only |
| `Use-Case-Diagram-Template (1).pptx` | Editable template (legacy) | reference only |
| `Use-Case-Diagram-Sample.pptx` | Worked sample (legacy) | reference only |
| `UseCaseDiagramExample.pptx` | Original eCornell example | reference only |
| `03-use-cases-1.mmd` | **Mermaid template** for v1 emitter | P2 (clone-and-edit) |
| `03-use-cases-1.png` | Rendered .mmd | P2 (visual reference) |
| `generate_use_case_diagram_pptx.py` | Legacy Python PPTX emitter (not used in v1) | deferred to v2 |

## Scope Tree Assets

| File | Purpose | Used by phase |
|------|---------|---------------|
| `scope-tree-visual-guide.md` | Long visual walkthrough (community-hall solar example) | P3 |
| `scope-tree-visual-guide.pptx` | Slide version of above | reference only |
| `ScopeTree_Defining_Deliverables.md` | Full text on growing the deliverable tree | P3 |
| `ScopeTree_Defining_Deliverables.docx` | Word version | reference only |
| `Scope-Tree-Template (1).pptx` | Editable template (legacy) | reference only |
| `source_ScopeTree_BuildingTheDeliverableTree.pptx`, `source_ScopeTree_DeliverableTreeGeneralFormExample.pptx` | Original eCornell examples | reference only |

> **Note:** No Mermaid template ships for the scope tree in source material. P3 includes a Mermaid template inline.

## KB-Internal Assets (this folder)

| File | Purpose |
|------|---------|
| `00-Defining-Scope-Master-Prompt.md` | Top-level orchestrator + 5 fail-closed rules |
| `02-JSON-Instance-Write-Protocol.md` | How to author phase artifacts |
| `03-Phase-0-Project-Intake-Unname.md` | P0 |
| `04-Phase-1-Context-Diagram.md` | P1 |
| `05-Phase-2-Use-Case-Diagram.md` | P2 |
| `06-Phase-3-Scope-Tree.md` | P3 |
| `07-Phase-4-Review-and-Module-2-Handoff.md` | P4 |
| `phase_artifact.schema.json` | Shared envelope schema |
| `system_scope_summary.schema.json` | Handoff payload schema (Module 2 compatible) |
| `GLOSSARY.md` | ~20 eCornell terms |
| `REVIEW-PLAN.md` | KB self-review checklist |

## What is NOT in this KB

The following live in the consumer adapter layer (e.g., product-helper), NOT in this methodology KB:

- Domain-specific inference rules (e.g., "If user mentions 'SaaS', infer these 7 actors")
- SaaS-specific examples and worked walkthroughs
- Thinking-state messages and progress UI copy
- Mistake-catcher heuristics tuned to particular domains
- Tooltip definitions for end-users

If a consumer needs those, it adds them as adapter modules around this KB. This KB stays portable across domains.

---

**Back:** [Master Prompt](00-Defining-Scope-Master-Prompt.md)
