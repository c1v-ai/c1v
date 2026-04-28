# Phase 3: UCBD Setup (Metadata + Swimlane Columns)

> Corresponds to Steps 2, 3, 3a, 3b of the UCBD Checklist.

**This phase (and Phases 4–5 and 9–10) runs once per selected use case.** Work one UCBD at a time; complete Phases 3–5 for UC01 before starting UC02.

## Knowledge

A UCBD is a single-use-case swimlane grid. The leftmost column is the **Primary Actor**, the second is **The System**, and every column to the right is another actor or interaction element.

### The iron rule: exactly one system column

From the course (emphatic):

> "Do not, do not split up the system column into multiple columns. This is very important for several reasons. First of all, it's the same reason why we've referred to our catapult system as simply the system and not the catapult. Splitting up your system column into multiple different columns, or parts, or subsystems, forces any final solution to also be considered only as being split up in that way."

And:

> "Many government documents will actually only be accepted if you have only one system column."

If the user asks you to split the system column, refuse and explain. Subsystem decomposition happens in **Module 6 (Interfaces)**, not here.

### Exception: you control one subsystem of a larger system

If the scope from Module 1 says "we own Service X inside a larger platform", then:
- Column A: Primary Actor (who invokes X)
- Column B: **The System** = Service X
- Columns C, D, ...: *other subsystems of the larger platform* (treated as external actors because you don't control them)

### Column selection rules

1. **Column A (Primary Actor):** One actor that drives the use case. From `system_context_summary.boundary.external_actors` match to `use_cases[i].primary_actor`.
2. **Column B (The System):** Always. Always labelled exactly "The System".
3. **Column C and beyond:** Add one column per *external entity the system interacts with during this specific use case*. Do not add a column for actors that don't participate in this use case.
4. **Maximum columns:** The template has slots for A–D (4 columns). If you need more, emit an insertion hint (`_needs_row_insertion` or column expansion) and flag it for the user — usually a sign the use case is too broad and should be split.

### Notes section (Step 3a)

The course is emphatic about notes:

> "Add more notes, add more notes, add more notes. Add as many notes as you think could be useful to somebody else or, again, yourself later down the line."

Notes are numbered bullets at the bottom of the UCBD. Use them for:
- Scope boundaries ("Out of scope: multi-currency; see UC05")
- Assumptions ("Assumes customer is authenticated — enforced by UC00")
- Ambiguities captured during the build ("TBD: should empty carts be allowed to reach checkout?")

Notes are **not** requirements. They're context for future readers.

## Input Required

- `system_context_summary.json` (Phase 0)
- `use_case_priority.json` (Phase 1)
- The **current use case** being built (the loop variable)

## Instructions for the LLM

For the current use case `UCxx`:

1. **Pick primary actor.** Read `use_cases[UCxx].primary_actor` from Phase 0. This is column A.
2. **The System column is always B.** No choice.
3. **Enumerate other actors involved in THIS use case.** Do NOT dump every external actor from the context diagram — only those that appear in this use case's flow. Common sources:
   - External systems the system talks to (payment gateway, email service)
   - Environment or sensor inputs
   - Secondary humans (e.g., "Support Agent" in a customer use case)
4. **Populate the metadata header.** Re-use values from `system_context_summary.project_metadata`. The `document_id` for this UCBD is `<prefix>-UCBD-UCxx` (e.g., `C1V-UCBD-UC01`).
5. **Set `use_case_name`** from `use_cases[UCxx].name`.
6. **Draft initial notes.** At minimum, seed notes with:
   - Scope note ("This UCBD covers only [variant X]; variant Y is UC_yy.")
   - Any assumption inherited from Module 1 that applies to this use case.
7. **Leave initial_conditions, ending_conditions, actor_steps_table empty.** Those are Phases 4 and 5.

## Output Format

Emit a partial UCBD JSON. Phases 4 and 5 will fill the gaps.

```json
{
  "_schema": "UCBD_Template_and_Sample.schema.json",
  "_output_path": "<project>/module-2-requirements/ucbd/UC01-customer-checkout.ucbd.json",
  "_phase_status": "phase-3-complete",

  "metadata": {
    "project_name": "C1V",
    "document_id": "C1V-UCBD-UC01",
    "document_type": "UCBD",
    "status": "Draft",
    "last_update": "2026-04-19",
    "target_release": "v1.0",
    "confidentiality": "Internal",
    "created_date": "2026-04-19",
    "target_release_2": "v1.0",
    "author": "David Ancor",
    "approvers": "Product Lead; Engineering Lead",
    "stakeholders": "Engineering; Product; Support",
    "supersedes": "",
    "linked_ticket": "",
    "parent_okr": "FY26-Q2 Launch",
    "regulatory_refs": "SOC2 Type II"
  },

  "use_case_name": "Customer completes checkout",

  "_columns_plan": {
    "A_primary_actor": "Customer",
    "B_the_system": "The System",
    "C_other_actor_1": "Payment Gateway",
    "D_other_actor_2": "Email Service"
  },

  "initial_conditions": [],
  "actor_steps_table": [],
  "ending_conditions": [],

  "notes": [
    "1. This UCBD covers only credit-card checkout; gift-card and BNPL are UC02 and UC06 respectively.",
    "2. Assumes customer is authenticated — enforced by UC00 (Authenticate Customer).",
    "3. Out of scope: abandoned-cart recovery (UC09)."
  ]
}
```

> The `_columns_plan` key is an internal annotation — the marshaller ignores it. Its purpose is to lock the column decisions before you start filling rows in Phase 5.

## Software-system translation notes

When selecting "other actors" (columns C, D, ...), software systems often have recurring candidates. Include them **only if they appear in this specific use case's flow**:

- **Payment Gateway** — if money moves (consult `api-design-sys-design-kb.md`, `resilliency-patterns-kb.md`)
- **Email / SMS Service** — if notifications are triggered (consult `message-queues-kb.md`)
- **Third-Party Auth Provider** — if federated login (consult `api-design-sys-design-kb.md`)
- **CDN** — rarely a first-class actor; usually implicit. Include only if the use case explicitly routes through CDN logic (e.g., "Serve product image").
- **Observability Pipeline** — rarely a UCBD actor; requirements involving metrics/audit usually appear as system behaviors, not actor interactions. Exception: if the use case *is* an audit or alerting flow, then it's an actor.
- **Message Queue / Event Bus** — include if async handoff between two services is *user-visible* (customer sees "order processing" status). Otherwise treat as implementation detail.

Rule of thumb: if the actor would appear in a sequence diagram as its own lifeline, it belongs in the UCBD. If it's infrastructure that disappears into "The System" box at the use-case level, omit.

## STOP GAP — Checkpoint 1

Present the partial UCBD JSON to the user and ask:

1. "For use case **[name]**, I've set up these columns: Primary Actor = **[A]**, The System, plus **[C, D]**. Confirm."
2. "Metadata header populated from Phase 0. Anything to override?"
3. "Seed notes: **[list]**. Add or remove?"
4. "Proceed to Phase 4 (Start/End Conditions)?"

> **STOP:** Do not proceed until columns and metadata are confirmed. Columns are the hardest thing to change later — get them right now.

## Output Artifact

A partial `UCxx-<slug>.ucbd.json` with metadata + use_case_name + notes populated. Empty conditions/steps arrays.

## Handoff to Next Phase

Phase 4 will fill `initial_conditions` and `ending_conditions`.

---

**Next →** [Phase 4: Start/End Conditions](07-Phase-4-Start-End-Conditions.md) | **Back:** [Phase 2](05-Phase-2-Thinking-Functionally.md)
