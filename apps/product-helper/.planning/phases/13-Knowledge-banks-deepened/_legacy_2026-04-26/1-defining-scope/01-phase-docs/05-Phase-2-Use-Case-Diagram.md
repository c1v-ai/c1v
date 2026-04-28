# Phase 2: Use Case Diagram

> Corresponds to Steps 8–11 of the Defining Scope Steps Checklist.

## Knowledge

A use case diagram organizes the situations in which The System is used. Actors live OUTSIDE the system boundary; use case bubbles live INSIDE. Lines = associations; arrows (with labels) = include/extend relationships.

> *"An Actor (the Driver) and one of the main use cases he's associated with ('Driver Drives the System') are added and connected with an association line. Since the system is responsible for this use case, the bubble is included inside the system boundary box."*
> — eCornell, *UseCaseDiagram-visual-instructions* (line 9-12)

### Use case sources

> *"In a separate document, develop a list of use cases. This is done by looking over your context diagram and then creating a list of the situations your system will be used in. … Add in use cases from other sources (e.g. a use case internal to your system or a direct request from a stakeholder). … Refine your use cases list by considering cases that might be included in existing use cases or those that might extend existing use cases."*
> — eCornell, Steps 8-10

So `use_cases[].source` enum: `context_diagram_derived`, `stakeholder_request`, `internal`, `delving`.

### Naming + relationship rules

- Use case name = verb-object phrase (e.g., "Drives the System", "Acknowledge Alert", "Configure Thresholds")
- All bubbles same size, same font (eCornell visual rule)
- Primary actor on LEFT; secondary actors on other sides
- Association = plain line (actor ↔ use case)
- Include = arrow labeled `<<include>>` (the included use case ALWAYS happens)
- Extend = arrow labeled `<<extend>>` (the extending use case CAN happen)

> *"Although some representations are better than others, there is often no one 'right' way to represent the relationships between your use cases."*
> — eCornell, *UseCaseDiagram-visual-instructions* (line 65)

### Step 11 quality check (verbatim from checklist)

> *"1. Can you clearly state the initial and ending conditions of your use cases?
> 2. Could you describe what occurs during the use case as a series of step-by-step functions that your system must perform? Could you do so without it feeling too long or running across several use cases?
> 3. Does each use case capture various functions that might otherwise have been missed if this use case wasn't considered?"*
> — eCornell, Step 11

## Input Required

- `context_diagram.json` (P1, `stop_gap_cleared: true`)
- `stakeholder_list.json` (P1)
- `intake_summary.body.deferred_to_p3_scope_tree` (some items here may surface as use cases)

## Instructions for the LLM

### Sub-phase A: Use Case Inventory

1. **Derive use cases from context diagram.** For each external actor in `context_diagram.body.external_actors`, ask: "What does this actor do with The System? What does The System do for/to this actor?" Each answer = a candidate use case.
2. **Pull stakeholder-requested use cases.** Re-read `intake_summary` and ask the PM what use cases stakeholders explicitly requested. Mark `source: "stakeholder_request"`.
3. **Add internal use cases.** System-initiated behaviors (e.g., scheduled jobs, self-checks). Mark `source: "internal"`.
4. **Delve.** Ask: "What use cases would only surface by considering edge cases / failure modes / undesired interactions?" Mark `source: "delving"`.
5. **Assign IDs.** `UC01`, `UC02`, … (zero-padded to 2-3 digits).
6. **Set initial_conditions and ending_conditions for each use case** (Step 11 question 1).

### Sub-phase B: Use Case Diagram

7. **Place actors OUTSIDE the boundary** (Rule R5). Primary actors on the LEFT.
8. **Place use case bubbles INSIDE the boundary.** All same size.
9. **Draw associations** (plain lines from actors to bubbles).
10. **Identify include/extend relationships.** Arrows between bubbles, labeled `<<include>>` or `<<extend>>`.
11. **Allow multiple diagrams.** If one diagram becomes crowded, split per actor or per subsystem-area (similar to context-diagram splitting).

### Sub-phase C: Step 11 Quality Check

12. **Initial/ending conditions stated for every use case?** If any are unclear, ask the PM.
13. **Coverage check.** "Does each use case capture functions that would otherwise have been missed?" If a use case is redundant with another, merge or distinguish.
14. **Length check.** "Is any use case too long or spanning multiple distinct situations?" If so, split.

## Output Format — `use_case_inventory.json`

```json
{
  "_schema": "phase_artifact.v1",
  "phase_id": "P2",
  "artifact_type": "use_case_inventory",
  "status": "approved",
  "stop_gap_cleared": true,
  "body": {
    "use_cases": [
      {
        "id": "UC01",
        "name": "Driver Drives the System",
        "primary_actor": "Driver",
        "secondary_actors": ["Navigator"],
        "initial_conditions": "Driver authenticated; The System is parked.",
        "ending_conditions": "The System reaches destination OR Driver shuts down.",
        "source": "context_diagram_derived",
        "initial_priority_hint": "high",
        "extends": [],
        "includes": ["UC02", "UC03"]
      },
      {
        "id": "UC02",
        "name": "Steers the System",
        "primary_actor": "Driver",
        "initial_conditions": "The System is in motion.",
        "ending_conditions": "Direction change complete.",
        "source": "context_diagram_derived",
        "initial_priority_hint": "high"
      }
      /* … */
    ]
  },
  "fail_closed_check": {
    "unnamed_system_ok": true,
    "no_subsystems_ok": null,
    "interactions_only_ok": null,
    "iteration_break_done": null,
    "no_externals_inside_system_box": null
  }
}
```

## Output Format — `use_case_diagram.json` + `.mmd`

JSON envelope wraps the Mermaid path. Mermaid template (clone-and-edit from `../course-lectures-master-md/03-use-cases-1.mmd`):

```mermaid
graph LR
    subgraph boundary ["THE SYSTEM"]
        UC1["UC01: Drives the<br/>System"]
        UC2["UC02: Steers the<br/>System"]
        UC3["UC03: Brakes the<br/>System"]
        UC4["UC04: Parks the<br/>System"]
        UC5["UC05: Shuts Down<br/>the System"]
        /* … */
    end

    %% Primary actors on LEFT
    Driver["DRIVER"] --> UC1
    Driver --> UC2
    Driver --> UC3
    Driver --> UC4

    %% Secondary actors elsewhere
    Navigator["NAVIGATOR"] --> UC1

    %% Include / Extend relationships between use cases
    UC4 -.->|"<<include>>"| UC5
    UC2 -.->|"<<extend>>"| UC6["UC06: Passes Other<br/>Vehicle"]

    classDef actor fill:#ffffff,stroke:#000000,stroke-width:2px
    classDef uc fill:#f5f5f5,stroke:#000000,stroke-width:1px
    class Driver,Navigator actor
    class UC1,UC2,UC3,UC4,UC5,UC6 uc
```

```json
{
  "_schema": "phase_artifact.v1",
  "phase_id": "P2",
  "artifact_type": "use_case_diagram",
  "status": "approved",
  "stop_gap_cleared": true,
  "body": {
    "the_system": "The System",
    "actors_outside_boundary": ["Driver", "Navigator"],
    "use_cases_inside_boundary": ["UC01", "UC02", "UC03", "UC04", "UC05", "UC06"],
    "mermaid_path": "use_case_diagram.mmd"
  },
  "fail_closed_check": {
    "unnamed_system_ok": true,
    "no_subsystems_ok": true,
    "interactions_only_ok": null,
    "iteration_break_done": null,
    "no_externals_inside_system_box": true
  }
}
```

## STOP GAP — Checkpoint 2 (P2 exit, Step 11 quality)

Present `use_case_inventory.json` AND `use_case_diagram.mmd` to the PM and ask:

1. "I have **[N]** use cases derived from **[M]** sources (context diagram, stakeholder request, internal, delving). Coverage looks complete?"
2. "**Step 11 Q1:** Are initial/ending conditions clearly stated for every use case?"
3. "**Step 11 Q2:** Is any use case too long or spanning multiple distinct situations?"
4. "**Step 11 Q3:** Does any use case feel redundant or trivially overlap with another?"
5. "Use case diagram: actors all OUTSIDE the boundary, use cases all INSIDE? (Rule R5.)"
6. "Should I proceed to Phase 3 (Scope Tree)?"

> **STOP:** Do not proceed to P3 until the PM confirms all six. Set `stop_gap_cleared: true` only after explicit "yes, proceed."

## Output Artifacts

- `use_case_inventory.json`
- `use_case_diagram.json`
- `use_case_diagram.mmd`

## Handoff to Next Phase

P3 (Scope Tree) reads the use case inventory to seed top-level deliverable nodes — every high-priority use case typically corresponds to a deliverable branch.

---

**Next →** [Phase 3: Scope Tree](06-Phase-3-Scope-Tree.md) | **Back:** [Phase 1](04-Phase-1-Context-Diagram.md) · [Master Prompt](00-Defining-Scope-Master-Prompt.md)
