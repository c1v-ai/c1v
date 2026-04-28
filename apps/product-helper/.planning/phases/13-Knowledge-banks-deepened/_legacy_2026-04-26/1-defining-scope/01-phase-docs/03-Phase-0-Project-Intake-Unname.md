# Phase 0: Project Intake / Unname

> Corresponds to "Before You Begin" of the Defining Scope Steps Checklist: *"Remove any name around your system. Instead refer to it as 'The System.'"*

## Knowledge

P0 captures the **minimum** PM input required to start P1 — and explicitly **refuses** to capture solution-shaped input. The eCornell method is iterative-by-design; loading an upfront intake form (system purpose, target architecture, named features) violates Rule R1 by locking the solution space before context diagramming.

> *"You don't want to give it a name. … if you say it's a car, anything that isn't a car is an invalid solution and you couldn't possibly come up with any other kind of possible creative solution because you've already said it has to be a car."*
> — eCornell, *Defining a Nameless System* (`FULL-INSTRUCTIONS.md:247`)

So P0 captures: **the need being met**, **who is asking**, and **hard external constraints** (regulatory, compliance, deadline, environment). That is it.

## Input Required (from PM)

Ask the PM exactly these three questions. Do not ask more. Do not accept a system name yet.

1. **What need are you trying to meet?** (One paragraph. If the answer is a noun like "a CRM" or "a mobile app", restate as a need: "you need to manage customer relationships" / "you need users to access functionality on their phone".)
2. **Who is asking for this?** (Names + roles + which one is the client whose approval you must satisfy.)
3. **Are there any hard external constraints?** (Regulatory frameworks, deployment environment requirements, compliance deadlines, integration mandates. NOT performance targets — those are Module 4.)

## Instructions for the LLM

1. **Refuse a system name.** If the PM says "I want to build [product noun]", reply: `"Per Rule R1, I can't name 'The System' yet. What need does [product noun] meet for the user?"` Re-route to need.
2. **Refuse upfront feature lists.** If the PM lists features, capture them in `open_questions` for P3 (scope tree) — do not bake them into the intake.
3. **Refuse upfront NFRs / performance criteria.** Capture in `open_questions` for Module 4. Reply per Rule R3.
4. **Confirm the unnamed-system declaration.** PM must explicitly acknowledge "the system stays 'The System' through Phase 3."
5. **Assemble `intake_summary` body.** Then surface STOP GAP.

## Output Format

```json
{
  "_schema": "phase_artifact.v1",
  "_output_path": "<project>/module-1-defining-scope/intake_summary.json",
  "phase_id": "P0",
  "artifact_type": "intake_summary",
  "status": "ready_for_review",
  "stop_gap_cleared": false,
  "produced_at": "<ISO-8601>",
  "iteration_count": 0,
  "body": {
    "need_statement": "A system that lets [who] do [what] under [conditions], because [why].",
    "system_name": "The System",
    "stakeholders_provisional": [
      { "name": "<name>", "role": "<role>", "is_client": true }
    ],
    "hard_external_constraints": [
      "Must comply with <regulation>",
      "Must integrate with <named external system>"
    ],
    "deferred_to_p3_scope_tree": [
      "<any feature the PM mentioned — captured here, not in intake>"
    ],
    "deferred_to_module_4_decision_matrix": [
      "<any performance criterion the PM mentioned>"
    ]
  },
  "open_questions": [
    "Does '<provisional stakeholder>' have approval authority?"
  ],
  "fail_closed_check": {
    "unnamed_system_ok": true,
    "no_subsystems_ok": null,
    "interactions_only_ok": null,
    "iteration_break_done": null,
    "no_externals_inside_system_box": null
  },
  "source_references": [
    "../course-lectures-master-md/Defining-Scope-Steps-Checklist.md",
    "../course-lectures-master-md/FULL-INSTRUCTIONS.md"
  ]
}
```

## STOP GAP — Checkpoint 1 (P0 exit)

Present `intake_summary.json` to the PM and ask:

1. "Confirmed: The System has no name and stays 'The System' through Phase 3. ✅"
2. "I captured the need as: **[need_statement]**. Is that accurate?"
3. "I have **[N]** stakeholders, with **[client_name]** as the client whose approval is required. Correct?"
4. "I have **[K]** hard external constraints. Anything missing? (Performance targets like 'fast' or 'reliable' will be captured in Module 4 — not here.)"
5. "Should I proceed to Phase 1 (Context Diagram)?"

> **STOP:** Do not proceed to Phase 1 until the PM confirms all five. Set `stop_gap_cleared: true` only after explicit "yes, proceed."

## Output Artifact

`intake_summary.json` — Phase 1 reads `body.need_statement` and `body.stakeholders_provisional` as starting points. `body.deferred_to_p3_scope_tree` and `body.deferred_to_module_4_decision_matrix` are carried forward without being acted on yet.

## Handoff to Next Phase

P1 will build the Context Diagram, expanding the provisional stakeholders into the full external-actor set and deriving interactions.

---

**Next →** [Phase 1: Context Diagram](04-Phase-1-Context-Diagram.md) | **Back:** [Master Prompt](00-Defining-Scope-Master-Prompt.md)
