# Phase 12: Final Review and FFBD Handoff

> Corresponds to the full Defining-Your-System Requirements Checklist (`Defining_Your_System_Checklist.md`) and produces the handoff package for Module 3 (FFBD).

## Knowledge

This is the terminal phase. Two objectives:

1. **Verify every artifact passes every rule.** Run the complete Defining-Your-System checklist against the accumulated Module 2 outputs.
2. **Package the handoff for Module 3.** Module 3 (Functional Flow Block Diagram) takes the `abstract_function_name` column plus the UCBD step order as its seed graph. Emit a clean handoff bundle that Module 3 can ingest without going back to Module 1 or 2 for clarifications.

### Final review checklist (runs against accumulated outputs)

Organize the review in six blocks. Every block has pass/fail items. Anything failing must be fixed before handoff.

#### Block 1 — Module 1 Scope Ingestion

- [ ] `system_context_summary.json` exists and has been approved by the user.
- [ ] Every UCBD's `metadata` section is consistent with `system_context_summary.project_metadata`.
- [ ] Every UCBD's swimlane actors appear in `system_context_summary.boundary.external_actors`.
- [ ] No new actors were introduced in Module 2 without a round-trip to Module 1.

#### Block 2 — UCBD Quality

- [ ] Every selected use case has a `.ucbd.json`.
- [ ] Every UCBD has exactly one "The System" column.
- [ ] Every UCBD has initial_conditions, ending_conditions, actor_steps_table, notes populated.
- [ ] Every UCBD step row has exactly one populated cell (one actor per step).
- [ ] Every system step starts with "The system shall".
- [ ] Every UCBD has at least one note (usually scope boundary).

#### Block 3 — Requirements Table Quality

- [ ] Every row has `index`, `requirement`, `abstract_function_name`.
- [ ] Every index is unique and follows the `UC<xx>.R<yy>` or `CC.R<yy>` format.
- [ ] No retired indexes reused.
- [ ] Every requirement starts with "The system shall".
- [ ] Every requirement is atomic (no `and`/`or` joining behaviors).
- [ ] Every requirement is unambiguous (no vague qualifiers: fast, easy, intuitive, appropriate, etc.).
- [ ] Every requirement is objective (no opinions: user-friendly, seamless, elegant).
- [ ] Every requirement is verifiable (pass/fail test possible).
- [ ] Every requirement is functional (no structural language except Module 1 hard constraints).
- [ ] Every abstract function name is `snake_case`, verb-object, no tech names.
- [ ] Every inline numeric threshold in a requirement is either a named constant or explicitly justified as a literal.

#### Block 4 — Constants Table Quality

- [ ] Every constant referenced in the requirements table exists in the constants table.
- [ ] Every constant has name, value, units, estimate/final, source, owner.
- [ ] Every unit is specified (no blank units).
- [ ] Every `estimate_final` is either `"Estimate"` or `"Final"` (no other values).
- [ ] Every `Final` entry has a `final_date`.
- [ ] No orphan constants (defined but not referenced).
- [ ] No conflicting constants (two names for the same concept).

#### Block 5 — SysML Activity Diagrams

- [ ] Every UCBD has a corresponding `.activity.mmd` file.
- [ ] Every system action in every activity diagram has a `<<requirement>>` link to a Requirements Table index.
- [ ] Every activity diagram renders (valid Mermaid).
- [ ] Every requirement in the table appears in at least one activity diagram, OR is tagged as cross-cutting (`CC.R<yy>`).

#### Block 6 — Internal Consistency

- [ ] No `needs_user_input: true` flags remaining on any artifact.
- [ ] No `TODO` or `TBD` placeholders in any requirement or constant.
- [ ] `delving_report.json` and `expansion_report.json` (if it exists) are both present and their `new_requirements_added` counts reconcile with the Requirements Table size.
- [ ] Cross-references are bidirectional: every requirement has a source UCBD; every UCBD step maps to a requirement (for system rows).

### Module 3 (FFBD) Handoff Bundle

Module 3 will take your outputs and produce a Functional Flow Block Diagram — a graph of functions with AND / OR / IN-ORDER logical relationships. It needs three things from Module 2:

1. **The function list** — `abstract_function_name` column, deduplicated.
2. **The ordering hints** — for each use case, the sequence of functions as they appear in the UCBD step flow.
3. **The context** — system name, boundary, constants, so Module 3 doesn't need to re-derive them.

The handoff bundle is a single JSON file that Module 3 can ingest.

### Handoff file format

```json
{
  "_schema": "ffbd_handoff.v1",
  "_output_path": "<project>/module-2-requirements/ffbd-handoff.json",
  "_produced_by": "Module 2 — Developing System Requirements",
  "_for_consumption_by": "Module 3 — Functional Flow Block Diagram",
  "_produced_date": "2026-04-19",

  "system_name": "C1V Platform",
  "system_description": "One-sentence description.",

  "boundary": {
    "the_system": "C1V Platform",
    "external_actors": [
      { "name": "Customer", "type": "human" },
      { "name": "Payment Gateway", "type": "external system" },
      { "name": "Email Service", "type": "external system" }
    ]
  },

  "functions": [
    {
      "name": "authenticate_session",
      "description_hint": "Verify session token before granting access.",
      "source_requirements": ["UC01.R00", "CC.R02"],
      "appears_in_use_cases": ["UC01", "UC02", "UC03", "UC05"]
    },
    {
      "name": "display_checkout_summary",
      "description_hint": "Present cart contents, subtotal, and total within RESPONSE_BUDGET_MS.",
      "source_requirements": ["UC01.R01"],
      "appears_in_use_cases": ["UC01"]
    },
    {
      "name": "authorize_payment",
      "description_hint": "Submit authorization request to Payment Gateway.",
      "source_requirements": ["UC01.R03"],
      "appears_in_use_cases": ["UC01"]
    },
    {
      "name": "persist_order",
      "description_hint": "Record an order with a unique Order ID.",
      "source_requirements": ["UC01.R04"],
      "appears_in_use_cases": ["UC01"]
    }
  ],

  "use_case_flows": [
    {
      "use_case_id": "UC01",
      "use_case_name": "Customer completes checkout",
      "function_sequence": [
        "authenticate_session",
        "display_checkout_summary",
        "calculate_shipping_cost",
        "authorize_payment",
        "persist_order",
        "emit_fulfillment_event",
        "display_order_confirmation",
        "dispatch_confirmation_message"
      ],
      "branching": [
        {
          "after_function": "authorize_payment",
          "branches": [
            { "guard": "authorized", "next_function": "persist_order" },
            { "guard": "declined",   "next_function": "surface_payment_decline" }
          ]
        }
      ]
    }
  ],

  "constants": [
    {
      "name": "RESPONSE_BUDGET_MS",
      "value": 500,
      "units": "ms",
      "estimate_final": "Estimate",
      "owned_by": "Engineering Lead"
    }
  ],

  "cross_cutting_concerns": [
    {
      "index": "CC.R01",
      "name": "audit_protected_action",
      "description": "Record audit log for every protected action."
    }
  ],

  "module_1_constraints_carried_forward": [
    "Must deploy on AWS",
    "SOC2 Type II compliance",
    "English and Spanish at launch"
  ],

  "summary": {
    "total_functions": 41,
    "total_use_cases": 8,
    "total_constants": 18,
    "total_cross_cutting": 4,
    "module_2_artifacts_folder": "<project>/module-2-requirements/"
  }
}
```

### Marshalling to xlsx (final step before review)

At this point, run the openpyxl marshaller across the three JSON instances to produce:

- `UCxx-<slug>.ucbd.xlsx` (one per UCBD)
- `requirements_table.xlsx`
- `constants_table.xlsx`

The Mermaid `.mmd` files do not get marshalled — they stay as Mermaid text.

The marshaller is not part of this KB — the user/tooling is responsible for running it. Your job is to ensure the JSON is correct so the marshaller produces valid xlsx.

## Input Required

- Every artifact from Phases 0 through 11
- User availability for the final sign-off

## Instructions for the LLM

1. **Run the 6-block checklist** above against the accumulated artifacts. Record pass/fail for every item.
2. **For any fail, propose the fix** (usually a loop back to an earlier phase with a targeted change).
3. **Build the FFBD handoff bundle** by walking the Requirements Table and each UCBD.
4. **Emit the handoff bundle** as `ffbd-handoff.json`.
5. **Produce a closing summary** for the user.

## Output Format

**File 1:** `ffbd-handoff.json` (see above).

**File 2:** `module_2_final_review.json`

```json
{
  "_schema": "module_2_final_review.v1",
  "_output_path": "<project>/module-2-requirements/module_2_final_review.json",
  "_phase_status": "phase-12-complete",

  "checklist_results": {
    "block_1_scope_ingestion": { "passed": 4, "failed": 0 },
    "block_2_ucbd_quality":    { "passed": 6, "failed": 0 },
    "block_3_requirements":    { "passed": 12, "failed": 0 },
    "block_4_constants":       { "passed": 7, "failed": 0 },
    "block_5_sysml":           { "passed": 4, "failed": 0 },
    "block_6_consistency":     { "passed": 4, "failed": 0 },
    "total_passed": 37,
    "total_failed": 0
  },

  "failures": [],

  "deliverable_inventory": {
    "system_context_summary": "system_context_summary.json",
    "use_case_priority": "use_case_priority.json",
    "ucbds": [
      "ucbd/UC01-customer-checkout.ucbd.json",
      "ucbd/UC02-customer-track-order.ucbd.json",
      "..."
    ],
    "requirements_table": "requirements_table.json",
    "constants_table": "constants_table.json",
    "activity_diagrams": [
      "sysml/UC01-customer-checkout.activity.mmd",
      "..."
    ],
    "reports": [
      "delving_report.json",
      "expansion_report.json"
    ],
    "handoff": "ffbd-handoff.json"
  },

  "metrics": {
    "total_use_cases_diagrammed": 8,
    "total_requirements": 64,
    "total_constants": 18,
    "total_functions_seeded_for_ffbd": 41,
    "cross_cutting_requirements": 4
  },

  "ready_for_module_3": true
}
```

## Closing summary to the user

After emitting both JSON files, present this to the user:

> **Module 2 complete.**
>
> You now have:
> - **N UCBDs** — one per high-priority use case, showing step-by-step what the system must functionally do.
> - **Requirements Table** with **M functional requirements**, every one passing the 7 writing-good-requirements rules, indexed stably.
> - **Constants Table** with **K named values**, each with owner, source, and Estimate/Final status.
> - **N SysML Activity Diagrams** in Mermaid, each traceable to requirements.
> - **FFBD Handoff Bundle** — Module 3 can start here without consulting Module 1 or 2.
>
> **Module 3 (FFBD)** will now take the **function list** from the abstract function name column and build a flow graph with AND/OR/IN-ORDER logical operators.
>
> Run the marshaller to produce the xlsx deliverables from the JSON. Confirm xlsx outputs render correctly against the `_FILLED_TEST.xlsx` samples before archiving.

## Software-system translation notes

At the boundary between Module 2 and Module 3, remember that the FFBD models **function flow**, not **data flow** or **architecture**:

- FFBD inputs: function names + sequential/parallel/branching relationships between them.
- FFBD does NOT need: API choice, database choice, deployment topology.
- Constants carried into FFBD provide timing/performance budgets that constrain the flow shape (e.g., if total end-to-end must fit in `TOTAL_LATENCY_BUDGET_MS`, the FFBD will need to identify which functions can parallelize).

Downstream modules pick up where Module 3 leaves off:
- **Module 4** — score design options using performance criteria derived from the requirements.
- **Module 5** — use requirements as Performance Criteria in the QFD; use constants to seed Engineering Characteristic targets.
- **Module 6** — use UCBD actors to identify subsystem boundaries; define the interfaces between them.
- **Module 7** — each requirement becomes a candidate failure mode for FMEA.

## STOP GAP — Final Sign-Off

Present `module_2_final_review.json` and `ffbd-handoff.json` and ask:

1. "All **[N]** checklist items pass. Confirm you see no gaps."
2. "Deliverable inventory: **[list]** — confirm every file is present and accounted for."
3. "Metrics: **[summary]** — sanity check."
4. "Module 2 is ready to close out and hand off to Module 3. Confirm?"

> **STOP:** Do not declare Module 2 complete until the user signs off. After sign-off, archive the deliverables folder and open Module 3.

## Output Artifact

- `ffbd-handoff.json` — Module 3's input
- `module_2_final_review.json` — closing scorecard
- All prior-phase artifacts retained in `<project>/module-2-requirements/`

## Handoff to Module 3

The handoff is literal: point Module 3's orchestrator at `ffbd-handoff.json`. Module 3 reads:
- `functions[]` → initial node set for the FFBD graph
- `use_case_flows[].function_sequence` → ordering hints (IN-ORDER edges)
- `use_case_flows[].branching` → OR-branch hints
- `constants[]` → budgets that constrain the flow
- `module_1_constraints_carried_forward` → design-space constraints

---

**End of Module 2 pipeline.** | **Back:** [Phase 11](14-Phase-11-Multi-UseCase-Expansion.md) | **Master:** [Requirements Builder Master Prompt](00-Requirements-Builder-Master-Prompt.md)
