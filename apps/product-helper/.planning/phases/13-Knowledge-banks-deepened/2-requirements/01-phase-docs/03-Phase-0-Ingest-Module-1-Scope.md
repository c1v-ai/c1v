# Phase 0: Ingest Module 1 Scope

> Corresponds to the "Before You Begin" row of the Defining Your System Requirements Checklist: *"Define your stakeholders and your system's context and interfaces, and prepare a list of use cases to explore."*

## Knowledge

Module 2 does not invent the system — it inherits it from Module 1. Before any UCBD work, you must consume Module 1's outputs and produce a single `system_context_summary.json` that every downstream phase will reference.

If Module 1 artifacts are missing, you **cannot** proceed. Module 2 fails closed. Do not invent actors, use cases, or stakeholders.

### What Module 1 produces (typical file names)

Look in the project's Module 1 folder (commonly `1 - Defining Scope/` or `1-defining-scope-<owner>/`) for:

| Artifact | Typical file names | What to extract |
|----------|--------------------|-----------------|
| Context Diagram | `*Context*Diagram*.pptx`, `*.pdf`, `*.jpeg` | System boundary (the central box = "The System"); external entities (users, external systems, environment) |
| Scope Tree | `*scope-tree*.pptx` | Top-level functions the system is responsible for (hints for `abstract_function_name`) |
| Use Case Diagram | `UseCaseDiagram*.pptx`, `*.jpeg` | List of use cases + which actor invokes which |
| Use Case List | `CESYS521-course-project*.docx`, or a list embedded in the Defining Scope docx | Prioritizable list of use cases |
| Stakeholder List | `*Defining*Scope*.docx`, "Stakeholders" section | Approvers + observers for the metadata header |
| Course Project Doc | `*course-project*.docx` | Project-level constraints (target release, regulatory refs, confidentiality) |
| Existing UCBD | `UCBD_*.xlsx` | If Module 1 started a UCBD, read it as a sanity check — do not overwrite |

### What to do if something is missing

| Missing artifact | Action |
|------------------|--------|
| Context diagram | STOP. Ask user to confirm the system boundary + list of external actors. Do not proceed without written confirmation. |
| Use case list | STOP. Ask user to enumerate use cases. Do not invent. |
| Stakeholders | Proceed with `approvers: ""` and `stakeholders: ""`; flag as TODO in final review. |
| Scope tree | Proceed, but note that `abstract_function_name` suggestions will be weaker. |

## Input Required

- Path to the Module 1 deliverables folder
- Any project-level metadata not captured in Module 1 (target release, document-id prefix, confidentiality default)

## Instructions for the LLM

1. **List the Module 1 folder.** Use `ls` / `Glob` to enumerate files. Present the inventory to the user.
2. **Read the context diagram.** Extract:
   - The system name (the label in the central box)
   - The list of **external actors** (humans, other systems, environment elements)
   - Any interface arrows (these become hints for Module 6 later, but capture them now)
3. **Read the use case diagram and any use case list document.** Extract:
   - Every use case name
   - The primary actor that invokes each
4. **Read the defining-scope docx / course-project docx.** Extract:
   - Stakeholders (split into approvers vs observers if the doc distinguishes)
   - Any hard constraints (must-run-on-X, regulatory, compliance)
   - Target release / timeline
5. **Read the scope tree.** Extract top-level functions; carry them as **candidate abstract function names** — Module 2 will refine them.
6. **Assemble `system_context_summary.json`.**

## Output Format

```json
{
  "_schema": "system_context_summary.v1",
  "_output_path": "<project>/module-2-requirements/system_context_summary.json",

  "system_name": "C1V Platform",
  "system_description": "One-sentence description sourced from Module 1.",

  "project_metadata": {
    "project_name": "C1V",
    "target_release": "v1.0",
    "confidentiality": "Internal",
    "document_id_prefix": "C1V",
    "author": "David Ancor",
    "approvers": "Product Lead; Engineering Lead",
    "stakeholders": "Engineering; Product; Support; Legal",
    "parent_okr": "FY26-Q2 Launch",
    "regulatory_refs": "SOC2 Type II"
  },

  "boundary": {
    "the_system": "C1V Platform",
    "external_actors": [
      { "name": "Customer", "type": "human", "role": "primary actor for most use cases" },
      { "name": "Support Agent", "type": "human", "role": "primary actor for support use cases" },
      { "name": "Payment Gateway", "type": "external system", "role": "receives payment requests" },
      { "name": "Email Service", "type": "external system", "role": "delivers notifications" }
    ]
  },

  "use_cases": [
    {
      "id": "UC01",
      "name": "Customer completes checkout",
      "primary_actor": "Customer",
      "source": "Module 1 Use Case Diagram",
      "initial_priority_hint": "high"
    },
    {
      "id": "UC02",
      "name": "Customer tracks order status",
      "primary_actor": "Customer",
      "source": "Module 1 Use Case Diagram",
      "initial_priority_hint": "medium"
    }
  ],

  "scope_tree_functions": [
    "authenticate_customer",
    "manage_cart",
    "process_checkout",
    "deliver_notifications"
  ],

  "hard_constraints": [
    "Must be deployable on AWS",
    "Must comply with SOC2 Type II",
    "Must support English and Spanish at launch"
  ],

  "module_1_artifacts_referenced": [
    "1 - Defining Scope/1 - defining-scope-david-ancor/David Ancor - Context Diagram.pdf",
    "1 - Defining Scope/1 - defining-scope-david-ancor/david-ancor-scope-tree.pptx",
    "1 - Defining Scope/1 - defining-scope-david-ancor/UseCaseDiagram - Ancor.pptx",
    "1 - Defining Scope/1 - defining-scope-david-ancor/David Ancor - Defining Scope.docx"
  ],

  "open_questions": [
    "Is the Payment Gateway in scope as a subsystem or external?",
    "Confirm whether Support Agent is in scope for launch or v1.1."
  ]
}
```

## Software-system translation notes

While ingesting Module 1, scan for language that maps to specific software KBs. Record in `open_questions` if the scope is ambiguous:

- If the context diagram shows a **browser or mobile client**, note it — you'll need `cdn-networking-kb.md` and `api-design-sys-design-kb.md` when writing requirements.
- If the scope mentions **real-time**, **live**, or **streaming**, consult `message-queues-kb.md` and `resilliency-patterns-kb.md` for vocabulary.
- If the scope lists **compliance** (SOC2, HIPAA, GDPR), consult `observability-kb.md` for audit-trail requirements and `software_architecture_system.md` for SLO language.
- If the scope expects **high availability**, consult `load-balancing-kb.md`, `cap_theorem.md`, and `software_architecture_system.md`.

## STOP GAP — Checkpoint 1

Present `system_context_summary.json` to the user and ask:

1. "Is the system boundary correct? I have **[system_name]** at the center, with **[N]** external actors."
2. "Is the use case list complete? I have **[N]** use cases from Module 1."
3. "Are the stakeholders and approvers correct? I have **[approvers list]**."
4. "Are there hard constraints I missed?"
5. "Should I proceed to Phase 1 (prioritize use cases)?"

> **STOP:** Do not proceed to Phase 1 until the user confirms all five.
> If the user flags a gap, revise `system_context_summary.json` and re-present.

## Output Artifact

`system_context_summary.json` — the single source of truth for every downstream phase. It is NOT converted to xlsx; it stays JSON and is imported into every other JSON instance's `metadata` field.

## Handoff to Next Phase

Phase 1 will rank the `use_cases` list by priority and select the top candidates for UCBD work.

---

**Next →** [Phase 1: Prioritize Use Cases](04-Phase-1-Prioritize-Use-Cases.md) | **Back:** [Master Prompt](00-Requirements-Builder-Master-Prompt.md)
