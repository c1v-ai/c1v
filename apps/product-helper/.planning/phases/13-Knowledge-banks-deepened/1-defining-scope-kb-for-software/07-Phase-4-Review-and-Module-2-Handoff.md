# Phase 4: Review and Module 2 Handoff

> The final consolidation phase. Walks the full Module 1 output bundle, optionally lets the PM finally **name The System** (Step 8 of the lecture's "name your system" decision), and emits the single `system_scope_summary.json` that Module 2 ingests.

## Knowledge

P4 has three responsibilities:

1. **Final-review** all upstream artifacts (P0-P3) for cross-consistency.
2. **Optionally** name The System if the PM is now ready (Rule R1 lifts here — but only with explicit PM choice).
3. **Emit `system_scope_summary.json`** — the handoff bundle Module 2 reads as `system_context_summary.v1`.

### Module 2 input contract

Module 2 lives at `../../2 - Developing System Requirements/2-dev-sys-reqs-for-kb-llm-software/`. Its Phase 0 (`03-Phase-0-Ingest-Module-1-Scope.md`) reads `system_context_summary.v1` JSON. Field shape MUST match — see `system_scope_summary.schema.json` for the contract.

The handoff bundle does NOT bundle the underlying JSON files — Module 2 references them by path via `module_1_artifacts_referenced[]`.

### When to name The System

The PM may name The System at P4 if and only if:

- The need is well-understood (P0 intake approved)
- The interactions are stable (P1 iterated and approved)
- The use cases are exhaustive (P2 Step 11 cleared)
- The deliverable scope is bounded (P3 reviewed)

If any of those is shaky, **keep the system unnamed** and ship `system_name: "The System"` to Module 2. Module 2 can still proceed.

## Input Required

- `intake_summary.json` (P0)
- `context_diagram.json` + `.mmd` (P1)
- `stakeholder_list.json` (P1)
- `use_case_inventory.json` (P2)
- `use_case_diagram.json` + `.mmd` (P2)
- `scope_tree.json` + `.mmd` (P3)

All must have `stop_gap_cleared: true` for their own STOP GAPs (P0 exit, P1 iteration break, P2 exit). P3 has no exit gate; P4 reviews it as part of the bundle.

## Instructions for the LLM

### Sub-phase A: Cross-Artifact Consistency

1. **Stakeholder coverage.** Every primary stakeholder in `stakeholder_list` should appear as either an external actor in `context_diagram` OR a primary actor in `use_case_inventory`. Flag any orphans.
2. **Actor coverage.** Every primary_actor in `use_case_inventory` should appear in `context_diagram.external_actors` (as a human entity). Flag any drift.
3. **Use case coverage.** Every external actor that interacts with The System (per `context_diagram`) should be the primary or secondary actor of at least one use case. Flag any actor with zero use cases.
4. **Scope tree coverage.** Every high-priority use case should map to at least one top-level scope tree branch. Flag any unmapped use case.
5. **Open questions consolidation.** Merge `open_questions` from P0, P1, P2, P3 into one list. Carry forward.

### Sub-phase B: Optional Final Naming (Rule R1 lifts here, conditionally)

6. Ask the PM: "We have a complete scope. Are you ready to name The System now? Naming will lock the solution shape — Module 2 onward will treat the name as final. You can also keep it as 'The System' and let Module 6 (Interfaces) name it after subsystem decomposition."
7. If the PM names it, set `body.system_name = "<final name>"`. If not, keep `"The System"`. Either way, set `fail_closed_check.unnamed_system_ok` based on whether the naming was deliberate (PM-chosen) or accidental (LLM jumped the gun).

### Sub-phase C: Emit Handoff Bundle

8. **Construct the body** per `system_scope_summary.schema.json`. Required fields:
   - `_schema: "system_scope_summary.v1"`
   - `_compatible_with: "system_context_summary.v1"`
   - `system_name`, `system_description`
   - `project_metadata` (project_name, confidentiality minimum)
   - `boundary` (the_system + external_actors with interactions)
   - `use_cases` (full inventory)
   - `scope_tree_functions` (top-level branch labels from P3)
   - `module_1_artifacts_referenced` (paths to all P0-P3 outputs)
9. **Validate** the body against `system_scope_summary.schema.json`. Refuse to emit if validation fails.
10. **Set `status: "ready_for_review"`.** Surface STOP GAP.

## Output Format — `system_scope_summary.json`

```json
{
  "_schema": "phase_artifact.v1",
  "_output_path": "<project>/module-1-defining-scope/system_scope_summary.json",
  "phase_id": "P4",
  "artifact_type": "system_scope_summary",
  "status": "approved",
  "stop_gap_cleared": true,
  "produced_at": "<ISO-8601>",
  "iteration_count": 1,
  "body": {
    "_schema": "system_scope_summary.v1",
    "_compatible_with": "system_context_summary.v1",
    "system_name": "The System",
    "system_description": "A system meeting the need to safely transport people and cargo from point A to point B with reasonable cost and time.",
    "project_metadata": {
      "project_name": "TransportNeed",
      "target_release": "v1.0",
      "confidentiality": "Internal",
      "document_id_prefix": "TN",
      "author": "<PM name>",
      "approvers": "Owner",
      "stakeholders": "Driver; Owner; Passenger; Mechanic",
      "regulatory_refs": "DOT FMVSS"
    },
    "boundary": {
      "the_system": "The System",
      "external_actors": [
        {
          "name": "DRIVER",
          "type": "human",
          "role": "primary operator",
          "interactions": [
            { "direction": "actor_to_system", "label": "operates, fuels, parks" },
            { "direction": "system_to_actor", "label": "transports, displays status to" }
          ]
        }
        /* … 8-20 entries from P1 … */
      ]
    },
    "stakeholders": [
      { "name": "Owner", "role": "purchaser", "primary_or_secondary": "primary", "is_client": true }
      /* … from P1 stakeholder_list … */
    ],
    "use_cases": [
      {
        "id": "UC01",
        "name": "Driver Drives the System",
        "primary_actor": "Driver",
        "secondary_actors": ["Navigator"],
        "initial_conditions": "Driver authenticated; The System is parked.",
        "ending_conditions": "The System reaches destination OR Driver shuts down.",
        "source": "context_diagram_derived",
        "initial_priority_hint": "high"
      }
      /* … from P2 use_case_inventory … */
    ],
    "use_case_diagram_path": "use_case_diagram.mmd",
    "scope_tree_functions": [
      "Analysis",
      "DesignSelection",
      "ComplianceDocumentation"
    ],
    "scope_tree_path": "scope_tree.mmd",
    "context_diagram_path": "context_diagram.mmd",
    "hard_constraints": [
      "Must comply with DOT FMVSS",
      "Must operate in temperatures -20°F to 110°F"
    ],
    "module_1_artifacts_referenced": [
      "module-1-defining-scope/intake_summary.json",
      "module-1-defining-scope/context_diagram.json",
      "module-1-defining-scope/context_diagram.mmd",
      "module-1-defining-scope/stakeholder_list.json",
      "module-1-defining-scope/use_case_inventory.json",
      "module-1-defining-scope/use_case_diagram.json",
      "module-1-defining-scope/use_case_diagram.mmd",
      "module-1-defining-scope/scope_tree.json",
      "module-1-defining-scope/scope_tree.mmd"
    ],
    "open_questions": [
      "Is electric powertrain in scope? Deferred to Module 6 subsystem analysis.",
      "Confirm 'ability to monitor' criterion definition with stakeholder. (Module 4 candidate.)"
    ]
  },
  "fail_closed_check": {
    "unnamed_system_ok": true,
    "no_subsystems_ok": true,
    "interactions_only_ok": true,
    "iteration_break_done": true,
    "no_externals_inside_system_box": true
  }
}
```

## STOP GAP — Checkpoint 4 (P4 exit, ship to Module 2)

Present `system_scope_summary.json` to the PM and ask:

1. "All P0-P3 artifacts cross-checked. Stakeholder coverage **[OK / orphans listed]**, actor coverage **[OK / drift listed]**, use case coverage **[OK / unmapped listed]**, scope tree coverage **[OK / gaps listed]**."
2. "**[N]** open questions consolidated — should any be answered now or carried into Module 2?"
3. "Naming: do you want to name The System now, or carry forward as 'The System'? Recommendation: **[carry forward / name as X based on need clarity]**."
4. "Ready to ship `system_scope_summary.json` to Module 2 (Developing System Requirements)?"

> **STOP:** Do not flip `stop_gap_cleared: true` until the PM confirms all four. This is the final gate of Module 1.

## Output Artifact

`system_scope_summary.json` — the single file Module 2 ingests. Module 2's Phase 0 reads `body` directly as `system_context_summary.v1`.

## Handoff to Module 2

Module 2 expects to find `system_scope_summary.json` (or `system_context_summary.json` — Module 2 accepts both names since they share schema). Module 2's Phase 0 (`../../2 - Developing System Requirements/2-dev-sys-reqs-for-kb-llm-software/03-Phase-0-Ingest-Module-1-Scope.md`) describes exactly how it consumes this file.

---

**Back:** [Phase 3](06-Phase-3-Scope-Tree.md) · [Master Prompt](00-Defining-Scope-Master-Prompt.md) · [REVIEW-PLAN](REVIEW-PLAN.md)
