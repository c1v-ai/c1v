# c1v System Design — Module 1 Handoff + Module 3 Readiness

> **Purpose of this doc:** Survive context clear. Everything a fresh session needs to (a) trust Module 1 is done, (b) ingest the Module 2 bundle that's about to arrive, and (c) execute Module 3 without re-deriving anything.
>
> **Produced:** 2026-04-20
> **Session author:** Bond (Claude Code)
> **Working dir:** `/Users/davidancor/Projects/c1v/`

---

## 0. TL;DR — What The Next Session Does First

1. **Read this doc.** Stop before doing anything else.
2. **Confirm Module 2 output arrived** at `/Users/davidancor/Projects/c1v/system-design/module-2-requirements/ffbd-handoff.json` (schema `ffbd_handoff.v1`). If not there, ask David where it is.
3. **Read the Module 3 KB** at `apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/New-knowledge-banks/3-ffbd-llm-kb/`, starting with `00_MODULE-OVERVIEW.md` then `00A_INGEST-MODULE-2-HANDOFF.md`.
4. **Mirror THG visual fidelity again** — David wants Module 3 artifacts (FFBDs) to match the same black-and-white Cornell aesthetic as the Module 1 PPTX set. An existing reference generator is at `apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/New-knowledge-banks/3-ffbd-llm-kb/create_ffbd_thg_v3.py`.
5. **Produce Module 3 artifacts** under `/Users/davidancor/Projects/c1v/system-design/module-3-ffbd/` and PPTX at `/Users/davidancor/Projects/c1v/system-design/diagrams/`.

---

## 1. Vision (verbatim from David, 2026-04-20)

> c1v is an AI-native workbench that turns one-sentence product ideas — or existing code — into enterprise-grade engineering specs and CLI commands. Built for founders who don't want to waste time, PMs coordinating development teams, and engineering teams who need auditable specs they can ship against.
>
> Every tech-stack recommendation traces to system performance metrics — availability, throughput, latency. Completely native, works alongside your existing systems, and runs a real-time feedback loop that recommends design improvements based on live performance and proactively surfaces additional features.

## 2. Methodology Pipeline (eCornell CESYS521/522)

| # | Module | Produces | State |
|---|--------|----------|-------|
| 1 | Defining Scope | Context Diagram · Use Case Diagram · Scope Tree · `system_scope_summary.json` | ✅ DONE (this session) |
| 2 | Developing System Requirements | Prioritized UCs · UCBDs · Requirements Table · Constants Table · SysML Activity Diagrams · `ffbd-handoff.json` | 🔄 Arriving next |
| 3 | Exploring System's Architecture | Hierarchical FFBDs (Functional Flow Block Diagrams) | ⏭️ My next target |
| 4 | Assessing Performance & Value | Decision Matrix | — |
| 5 | Quality Function Deployment | House of Quality | — |
| 6 | Defining Interfaces | Subsystem interface contracts | — |
| 7 | Identifying & Evaluating Risk | Risk register | — |

---

## 3. Module 1 — What I Produced

### 3.1 Directory Layout

```
/Users/davidancor/Projects/c1v/system-design/
├── module-1-defining-scope/
│   ├── intake_summary.json                    # P0
│   ├── context_diagram.json                   # P1 envelope
│   ├── context_diagram.mmd                    # P1 Mermaid
│   ├── stakeholder_list.json                  # P1
│   ├── use_case_inventory.json                # P2
│   ├── use_case_diagram.json                  # P2 envelope
│   ├── use_case_diagram.mmd                   # P2 Mermaid
│   ├── scope_tree.json                        # P3
│   ├── scope_tree.mmd                         # P3 Mermaid
│   └── system_scope_summary.json              # Module 2 handoff contract
└── diagrams/
    ├── generate_context_diagram_pptx.py       # THG-style generator
    ├── generate_use_case_diagram_pptx.py
    ├── generate_scope_tree_pptx.py
    ├── c1v_Context_Diagram.pptx               # 2 slides (basic + detailed)
    ├── c1v_Use_Case_Diagram.pptx              # 2 slides
    └── c1v_Scope_Tree.pptx                    # 1 slide (B&W, matches David's Ancor reference)
```

### 3.2 Key Numbers

- **Context Diagram:** 16 external actors (4 human · 4 data source · 4 system/regulatory · 4 downstream consumer) — `iteration_count: 2`
- **Use Case Inventory:** 15 UCs (UC01–UC15) across 4 source types
- **Use Case Diagram:** Actor-Column view, 8 actors, 15 UCs, 10 include/extend relationships
- **Scope Tree:** 8 in-scope top-level branches + 5 cut-from-scope items, 33 children, 6 perf-criteria annotations, 5 open questions
- **Final handoff:** `system_name: "c1v"` (P4 Step 8 decision); `_compatible_with: "system_context_summary.v1"` ✅

### 3.3 Fail-Closed Rule Compliance (R1–R5)

| Rule | Status | Evidence |
|------|--------|----------|
| R1 Don't name The System before P4 Step 8 | ✅ | P0–P3 artifacts use `"The System"` throughout. Name `c1v` appears only in `system_scope_summary.json` and PPTX diagrams (Module 2 audience). |
| R2 Don't split into subsystems | ✅ | Context diagram has exactly one node inside `boundary` subgraph. |
| R3 Don't list properties/NFRs as entities | ✅ | Availability / throughput / latency / auditability / non-invasiveness captured in `deferred_to_module_4_decision_matrix` (intake) and `performance_criteria_check` (scope tree). |
| R4 Don't skip iteration break | ✅ | `iteration_count: 2` on context diagram; iteration notes document combine/remove decisions. |
| R5 Don't merge externals into The System | ✅ | All 16 external actors outside boundary in both diagrams. |

Every artifact has `stop_gap_cleared: true` and all five `fail_closed_check` fields `true` or `null` where N/A.

### 3.4 Authoritative Schemas Used

- Phase artifacts: `phase_artifact.v1` — defined at `apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/New-knowledge-banks/1-defining-scope-kb-for-software/phase_artifact.schema.json`
- Handoff: `system_scope_summary.v1` ≡ `system_context_summary.v1` (Module 2 ingest name)

### 3.5 Visual Fidelity Conventions (apply again for Module 3)

- Slide size 13.333 × 7.5 for context + use case diagrams; **11 × 8 for scope tree** (matching David Ancor's reference).
- Font: **Arial**, black-and-white only.
- Context diagram: square-cornered boxes, all same size, dashed boundary, rectilinear (L-shaped) connectors, 4 per side layout.
- Use case diagram: square-cornered actors outside boundary, rounded use-case bubbles inside, dashed include/extend arrows with `<<include>>` / `<<extend>>` labels.
- Scope tree: **text-only nodes, no box borders**, small italic grey annotations for perf criteria / open questions / cut-from-scope, dashed lines for cut items. (This matches David's personal style — he skipped the canonical Step 8 color coding.)
- Reference examples: `/Users/davidancor/Documents/MBA/System Design - eCornell/thg-system-design-example/` (context + UC) and `.../1 - Defining Scope/david-ancor-scope-tree.pptx` (scope tree).

---

## 4. Module 2 — What's Arriving Next

### 4.1 Expected Deliverables (per KB)

David's Module 2 work will produce:

- Prioritized use case list (ordered subset of the 15 UCs)
- One `.ucbd.json` per selected use case (Use Case Behavioral Diagram)
- Requirements table (rows indexed `UC01.R00`, `CC.R02`, etc. — each starts with "The system shall")
- Constants table (named values, units, `Estimate`/`Final`, owner)
- SysML Activity Diagrams (`.activity.mmd` per UC) with `<<requirement>>` links
- **Final handoff:** `ffbd-handoff.json` (schema `ffbd_handoff.v1`)

### 4.2 Expected Landing Path

```
/Users/davidancor/Projects/c1v/system-design/module-2-requirements/
├── ucbds/
│   └── UC<xx>.ucbd.json
├── requirements_table.json
├── constants_table.json
├── activity_diagrams/
│   └── UC<xx>.activity.mmd
└── ffbd-handoff.json                    # ← Module 3 entry point
```

### 4.3 Contract From Module 2 → Module 3 (`ffbd_handoff.v1`)

```json
{
  "_schema": "ffbd_handoff.v1",
  "_produced_by": "Module 2 — Developing System Requirements",
  "_for_consumption_by": "Module 3 — Functional Flow Block Diagram",

  "system_name": "c1v",
  "system_description": "…",
  "boundary": { "the_system": "c1v", "external_actors": [...] },

  "functions": [
    {
      "name": "<snake_case_verb_object>",
      "description_hint": "<one-line>",
      "source_requirements": ["UC01.R00", "CC.R02"],
      "appears_in_use_cases": ["UC01", "UC02"]
    }
  ],

  "use_case_flows": [
    {
      "use_case_id": "UC01",
      "use_case_name": "…",
      "function_sequence": ["<fn1>", "<fn2>"],
      "branching": [
        {
          "after_function": "<fn>",
          "branches": [
            { "guard": "<cond>", "next_function": "<fnA>" }
          ]
        }
      ]
    }
  ],

  "constants": [
    { "name": "…", "value": …, "units": "…", "estimate_final": "Estimate|Final", "owned_by": "…" }
  ],

  "cross_cutting_concerns": [ { "index": "CC.R01", "name": "…", "description": "…" } ],

  "module_1_constraints_carried_forward": [ "…" ],

  "summary": {
    "total_functions": N, "total_use_cases": N, "total_constants": N, "total_cross_cutting": N
  }
}
```

### 4.4 Sanity Checks When Module 2 Lands

Before starting Module 3, verify:

- [ ] `ffbd-handoff.json` exists and parses as valid JSON.
- [ ] `_schema: "ffbd_handoff.v1"`.
- [ ] `system_name == "c1v"`.
- [ ] `boundary.external_actors` matches (or is a strict subset of) the 16 actors in `system_scope_summary.json`. **No new actors should appear without flagging** — that would be a Module 1 round-trip signal.
- [ ] Every `functions[].appears_in_use_cases` value is a UC ID from Module 1 (UC01–UC15 or a newly-split ID).
- [ ] `module_1_constraints_carried_forward` includes the 5 hard constraints from intake (non-invasive, auditable, metric traceback, multi-LLM, native integration).
- [ ] At least one constant references performance-budget concepts (real-time latency, overhead budget) since those were open questions in Module 1.

If any check fails → **flag before proceeding**, don't paper over.

---

## 5. Module 3 — What I'll Do Next

### 5.1 KB Location

Primary: `/Users/davidancor/Projects/c1v/apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/New-knowledge-banks/3-ffbd-llm-kb/`

Read in this order:
1. `00_MODULE-OVERVIEW.md` — method-at-a-glance
2. `00A_INGEST-MODULE-2-HANDOFF.md` — how to consume `ffbd-handoff.json`
3. `01_FFBD-FOUNDATIONS.md` → `10_VALIDATION-AND-COMMON-MISTAKES.md` — per-phase instructions
4. `11_FROM-FFBD-TO-DECISION-MATRIX.md` — Module 4 handoff shape
5. `create_ffbd_thg_v3.py` — reference PPTX generator for visual fidelity

Cornell course material: `/Users/davidancor/Documents/MBA/System Design - eCornell/3 - Exploring Your System's Architecture/`
- `create-a-hierarchical-set-of-FFBDs.pdf` — canonical method
- `FFBD.docx` — walkthrough example
- `Module2-Activity-FFBD-sample.png` — visual reference

### 5.2 Expected Output Layout

```
/Users/davidancor/Projects/c1v/system-design/module-3-ffbd/
├── ffbd_ingest_receipt.json           # Evidence I ingested the M2 bundle cleanly
├── ffbd_top_level.json                # Top-level FFBD envelope
├── ffbd_top_level.mmd                 # Mermaid render
├── ffbd_<use_case>.json               # Per-UC FFBD hierarchy
├── ffbd_<use_case>.mmd
├── ffbd_validation_report.json        # Common-mistakes audit
└── decision_matrix_handoff.json       # Module 4 contract
```

```
/Users/davidancor/Projects/c1v/system-design/diagrams/
├── generate_ffbd_pptx.py               # New THG-style generator (model on create_ffbd_thg_v3.py)
└── c1v_FFBD_<use_case>.pptx            # One per hierarchy level
```

### 5.3 FFBD Method Skeleton (for quick orientation before reading the KB)

- **Functional blocks:** numbered boxes with verb-object names (snake_case internal, display human-readable). One block per `abstract_function_name`.
- **Arrows:** directed edges showing operational flow. Each block has exactly one entry and one exit unless gated.
- **Logic gates:** `AND` (convergent), `OR` (selective), in-order sequence (default).
- **Hierarchical decomposition:** any block can zoom into a child FFBD (`3.2.1`, `3.2.2`).
- **eFFBD (extended):** adds data blocks showing what flows between functions.
- **Validation:** every function from `ffbd_handoff.json` must appear at least once; every use case flow must be representable end-to-end.

### 5.4 Visual Fidelity Plan

- Match David's B&W Cornell aesthetic (same as Module 1 PPTX work).
- Numbered rectangular functional blocks, square corners, Arial.
- Logic gates rendered as small labeled diamonds/triangles per canonical convention.
- Hierarchical reference blocks shown with breadcrumb IDs (e.g., `REF 3.2`).
- Two-slide pattern per FFBD: basic (blocks + flow) + detailed (with data blocks / guards).
- Reference: `create_ffbd_thg_v3.py` already exists in the KB — adapt, don't reinvent.

---

## 6. Open Questions Carried Forward From Module 1

These surface again in Module 3 as things the FFBD or its constants need to resolve:

1. **Latency budget for "real-time feedback loop"** — must be a named constant by end of Module 2; FFBD uses the number for timing annotations.
2. **Which performance metric wins on conflict** — availability vs. throughput vs. latency. Module 4 decision matrix decides; Module 3 should not pre-resolve.
3. **Feedback loop: suggest-and-apply vs. suggest-only in v1** — shapes whether the FFBD has a write-back branch or read-only branch on the feedback loop.
4. **Compliance frameworks in v1 scope** — SOC 2, HIPAA, GDPR, PCI-DSS? Determines which audit functions appear in the FFBD.
5. **Max acceptable overhead on observed customer systems** — named constant required for non-invasive integration functions.
6. **Baseline sourcing for TechStack.Catalog** — vendor SLAs vs. status-page aggregates vs. internal benchmarks. Affects which ingest functions exist.
7. **CLI emit latency target** — named constant, drives CLI-generation function timing.
8. **Should PACKAGE REGISTRIES be its own actor?** — minor; probably roll under Documentation Sources unless Module 2 surfaces reasons to split.
9. **Enterprise Procurement as separate actor?** — depends on whether Module 2 introduces large-org sales-engineering use cases.

All of these are already captured in `open_questions` arrays of the Module 1 artifacts. Module 2 may resolve several; whatever remains, Module 3 carries forward without re-surfacing them as new.

---

## 7. Session / Environment State

### 7.1 Tools Confirmed Working

- `python3` with `python-pptx` installed (used for all Module 1 PPTX generators).
- All Module 1 JSON schema-validates (ran inline validator in-session).
- Output files are git-untracked; no commits made this session. David will decide what to commit.

### 7.2 User-Interaction Rules Observed This Session

- **Never question scope.** David specs to the millimeter. No MVP cuts, no "which thread matters most" questions on multi-item dumps.
- **Skip the review-first plan** when David says so. He said "I don't want a plan, I want the actual artifacts" — execute directly.
- **No `Co-Authored-By` lines** if any commit happens.
- **No liberties on CSS/design** — David designs in Relume/Figma/Webflow; agents copy exactly.
- **Auto mode active** — execute autonomously, minimize interruptions, prefer action over planning.

### 7.3 Conventions Already Established (keep using)

- ISO-8601 with offset on `produced_at` (e.g., `2026-04-20T01:45:00-04:00`).
- `produced_by: "bond@claude-code"`.
- `iteration_count` starts at 1 for an artifact that went through one pass; 2+ if iterated.
- Open questions ALWAYS land in the artifact's `open_questions` array, never dropped.
- Perf criteria / NFRs always deferred to Module 4 per Rule R3.
- Mermaid files reference their JSON envelope path; JSON envelopes reference their `.mmd` path.

---

## 8. Explicit First-Action Checklist (for fresh session)

```
[ ] 1. Read this doc top to bottom.
[ ] 2. Confirm Module 2 bundle exists at system-design/module-2-requirements/ffbd-handoff.json
       (if not, ask David "where did Module 2 output land?" — do not guess).
[ ] 3. Open the bundle, validate _schema == "ffbd_handoff.v1", run §4.4 sanity checks.
[ ] 4. Read Module 3 KB files in the order listed in §5.1.
[ ] 5. Skim create_ffbd_thg_v3.py to refresh THG-style patterns.
[ ] 6. Execute the method. Produce artifacts at §5.2 locations.
[ ] 7. Ship PPTX with THG parity — reuse Module 1 Python scaffolding in diagrams/.
[ ] 8. Before declaring Module 3 done, write a MODULE-3-HANDOFF-and-MODULE-4-READINESS.md
       mirroring this doc's structure.
```

---

## 9. Glossary (for a context-fresh reader)

- **UCBD** — Use Case Behavioral Diagram. Swimlane diagram with one column per actor + one column for "The System", step-by-step flow. Module 2 primary artifact.
- **FFBD** — Functional Flow Block Diagram. Directed graph of functional blocks connected by flow arrows and logic gates. Module 3 primary artifact.
- **eFFBD** — Extended FFBD. Adds data-flow blocks alongside functional blocks.
- **Rule R1–R5** — The five fail-closed rules from the Defining Scope KB (see §3.3).
- **Cross-cutting concern (CC)** — A requirement that applies across all use cases (e.g., auth, logging). Indexed `CC.R<yy>` not `UC<xx>.R<yy>`.
- **Atomic function / task** — Leaf deliverable that cannot be decomposed further. Scope Tree Step 5.
- **Stop gap** — A mandatory pause/approval checkpoint in the eCornell method. Every phase has one; downstream phase refuses to start until `stop_gap_cleared: true`.

---

## 10. One-Line Sign-Off

Module 1 = shipped, schema-valid, rule-compliant, visually faithful to David's Cornell reference set. Module 2 handoff contract understood. Module 3 KB located. Ready to ingest and execute the moment `ffbd-handoff.json` lands.
