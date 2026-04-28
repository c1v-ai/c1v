# Phase 0A: Ingest the Module 2 Handoff

> **This is the entry point for Module 3 when Module 2 has been completed in its structured form.** Module 2 emits a formal JSON bundle (`ffbd-handoff.json`, schema `ffbd_handoff.v1`) that seeds Module 3's FFBD. If you are starting from a plain system description or whiteboard sketch, skip to [Phase 1](01_FFBD-FOUNDATIONS.md). If you have the Module 2 bundle, read this file first.

## Prerequisites
- [ ] Module 2 (Developing System Requirements) has completed Phase 12 with `ready_for_module_3: true`
- [ ] `ffbd-handoff.json` exists at `<project>/module-2-requirements/ffbd-handoff.json`
- [ ] You can read the bundle's JSON (or your LLM agent orchestrator can)

## Context (Why This Matters)

Module 2 does substantial front-loaded work for Module 3:

- It deduplicates the **function list** across all use cases (the `abstract_function_name` column)
- It captures **ordering hints** from each use case's step flow
- It captures **branching hints** (guards and alternative paths)
- It carries forward **performance-budget constants** (e.g., `RESPONSE_BUDGET_MS`)
- It carries forward **Module 1 constraints** (deployment regions, compliance, etc.)

Without this handoff, Module 3 would need to re-derive all of this from scratch by interviewing stakeholders or reading source documents. With the handoff, Module 3 starts with a validated seed graph — the FFBD is no longer a blank page.

**The job in this phase** is to *ingest* the bundle and use it to accelerate Phases 1-10, not replace them. The bundle provides candidates; the FFBD process still validates every decision.

## The `ffbd_handoff.v1` Schema

Module 2 emits this exact shape:

```json
{
  "_schema": "ffbd_handoff.v1",
  "_output_path": "<project>/module-2-requirements/ffbd-handoff.json",
  "_produced_by": "Module 2 — Developing System Requirements",
  "_for_consumption_by": "Module 3 — Functional Flow Block Diagram",
  "_produced_date": "YYYY-MM-DD",

  "system_name": "<System Name>",
  "system_description": "<One-sentence description>",

  "boundary": {
    "the_system": "<System Name>",
    "external_actors": [
      { "name": "<Actor>", "type": "human | external system" }
    ]
  },

  "functions": [
    {
      "name": "<snake_case_verb_object>",
      "description_hint": "<one-line intent>",
      "source_requirements": ["UC01.R00", "CC.R02"],
      "appears_in_use_cases": ["UC01", "UC02"]
    }
  ],

  "use_case_flows": [
    {
      "use_case_id": "UC01",
      "use_case_name": "<Use case name>",
      "function_sequence": ["<fn1>", "<fn2>", "<fn3>"],
      "branching": [
        {
          "after_function": "<fn2>",
          "branches": [
            { "guard": "<condition>", "next_function": "<fnA>" },
            { "guard": "<condition>", "next_function": "<fnB>" }
          ]
        }
      ]
    }
  ],

  "constants": [
    {
      "name": "<CONSTANT_NAME>",
      "value": <number>,
      "units": "<units>",
      "estimate_final": "Estimate | Final",
      "owned_by": "<role>"
    }
  ],

  "cross_cutting_concerns": [
    {
      "index": "CC.R01",
      "name": "<snake_case_name>",
      "description": "<one-line>"
    }
  ],

  "module_1_constraints_carried_forward": [
    "<constraint-1>", "<constraint-2>"
  ],

  "summary": {
    "total_functions": <int>,
    "total_use_cases": <int>,
    "total_constants": <int>,
    "total_cross_cutting": <int>
  }
}
```

## Field-by-Field Ingestion Rules

### `system_name` + `system_description` + `boundary.the_system`

**Maps to:** Module 3 title block and every FFBD's subtitle.

**Action:**
- Set `SYSTEM_NAME` variable in your FFBD generator script.
- The top-level FFBD title becomes: `Function 1 : <System Name> — Top-Level Flow` (or similar).
- Every sub-diagram carries `<System Name>` in its subtitle for context.

### `boundary.external_actors[]`

**Maps to:** EFFBD **data blocks** or **reference points** showing external inputs crossing the system boundary.

**Action:**
- For each actor with `type: "human"` → typically one or more data blocks representing their inputs (e.g., "Customer Credentials," "Customer Request").
- For each actor with `type: "external system"` → one data block per input type, plus one per major output (e.g., "Payment Response," "Email Delivery Receipt").
- These are the Phase 8 EFFBD inputs. Record them now; render them during Phase 8.

### `functions[]` → Functional Blocks

**Maps to:** The candidate set for functional blocks in the FFBD.

**Action:**
- Every `name` becomes a **candidate functional block**. The `name` is already in `snake_case_verb_object` form — convert to human-readable Title Case for the FFBD body (e.g., `authenticate_session` → "Authenticate Session").
- Every `description_hint` can serve as an arrow-label payload or as a tooltip for the block.
- Deduplicated `appears_in_use_cases` count tells you whether a function is **cross-cutting** (appears in many) vs. **specific** (appears in one).
- Cross-cutting functions often belong in the top-level FFBD or in a common sub-diagram; specific functions usually belong in the sub-diagram for their use case.

**Validation:**
- [ ] Every `functions[].name` is `snake_case_verb_object` (no structural names — Module 2 enforced this)
- [ ] `functions[].source_requirements[]` are non-empty (every function traces back to a requirement)

### `use_case_flows[].function_sequence` → Trigger Arrows

**Maps to:** The default **trigger-arrow** sequence between functional blocks.

**Action:**
- For each use case flow, the sequence of functions gives the default operational order.
- In your FFBD, draw **trigger arrows** between consecutive functions in the sequence — unless a constant (see below) or stakeholder input indicates a meaningful time gap, in which case use a **precedes arrow**.
- The first function in the sequence is the use case's **entry point**; the last is its **exit point**.

**Example:**
Module 2 gives:
```json
"function_sequence": [
  "authenticate_session",
  "display_checkout_summary",
  "calculate_shipping_cost",
  "authorize_payment",
  "persist_order",
  "emit_fulfillment_event",
  "display_order_confirmation",
  "dispatch_confirmation_message"
]
```

Module 3 draws:
```
F.1 Authenticate Session ──► F.2 Display Checkout Summary ──► F.3 Calculate Shipping Cost
──► F.4 Authorize Payment ──► F.5 Persist Order ──► F.6 Emit Fulfillment Event
──► F.7 Display Order Confirmation ──► F.8 Dispatch Confirmation Message
```

### `use_case_flows[].branching[]` → OR Gates or Decision Diamonds

**Maps to:** OR gates (architectural alternatives) or decision diamonds (runtime evaluations).

**Action:**
- For each branching entry, look at `after_function` and the `branches[]` array.
- If the branches represent **architectural alternatives** (the system could operate via either path) → **OR gate pair**.
- If the branches represent **runtime evaluation** (if-then-else on a condition) → **decision diamond**.
- Use the `guard` text as the condition label on each outgoing arrow.

**Example:**
Module 2 gives:
```json
"branching": [
  {
    "after_function": "authorize_payment",
    "branches": [
      { "guard": "authorized", "next_function": "persist_order" },
      { "guard": "declined",   "next_function": "surface_payment_decline" }
    ]
  }
]
```

Module 3 renders:
```
F.4 Authorize Payment ──► ◇ Payment authorized? ──Yes──► F.5 Persist Order
                                                 └─No ──► F.4b Surface Payment Decline
```

Use a decision diamond here because the branching is a runtime evaluation of the payment result.

### `constants[]` → Arrow Labels and Performance Budgets

**Maps to:** Arrow labels (showing timing budgets) and uncertainty triggers for IT loops.

**Action:**
- For each constant with units relating to time (`ms`, `s`, `min`) → it is a **latency/duration budget**. Attach it as a label on the arrow representing the relevant handoff, or on the whole flow segment it bounds.
- For each constant with units relating to counts → likely a **throughput or capacity target**. Label accordingly.
- For each constant with `estimate_final: "Estimate"` → this is a source of uncertainty. Consider marking functions affected by this constant as **Yellow** in Phase 9.
- For each constant with `estimate_final: "Final"` → safe to use as a hard label.

**Example:**
```json
{ "name": "RESPONSE_BUDGET_MS", "value": 500, "units": "ms", "estimate_final": "Estimate" }
```

In your FFBD, annotate the end-to-end arrow from `authenticate_session` to `display_checkout_summary` with a label like `≤ RESPONSE_BUDGET_MS (500 ms, est.)`. In Phase 9, mark the upstream-of-user-facing-render functions as Yellow because the budget is an estimate.

### `cross_cutting_concerns[]` → Data Blocks or Reference Blocks

**Maps to:** EFFBD data blocks (for policy/constraint concerns) or reference blocks (for shared functional concerns like audit logging).

**Action:**
- For each `CC.R<yy>` item, classify:
  - **Policy/constraint** (e.g., "record audit log for every protected action," "encrypt at rest") → render as an EFFBD data block feeding into relevant functions.
  - **Shared functional** (e.g., "authenticate every request," "apply rate limit") → render as a reference block in each sub-diagram where it applies, or as an IT loop wrapping the relevant flow.

### `module_1_constraints_carried_forward[]` → Design-Space Constraints

**Maps to:** Context for the uncertainty marking in Phase 9 — these are things the FFBD must respect but does not itself implement.

**Action:**
- List these verbatim in an appendix slide or text box on the top-level FFBD so readers understand the design space.
- Do **not** encode them as functional blocks — they are constraints on the design, not operations the system performs.

## Ingestion Workflow

Follow this six-step workflow:

### Step 1: Load and Validate

1. Open `ffbd-handoff.json`.
2. Verify `_schema` is `"ffbd_handoff.v1"`.
3. Verify `summary.total_functions`, `summary.total_use_cases`, and `summary.total_constants` match the actual array lengths.
4. Verify `ready_for_module_3: true` in the companion `module_2_final_review.json`.

### Step 2: Build the System Boundary

1. Record `system_name`, `system_description`, and the list of external actors.
2. These become the **boundary** of your FFBD — nothing outside them appears as a functional block; instead, they are rendered as EFFBD data blocks in Phase 8.

### Step 3: Group Functions by Use Case

1. Build a map: `function_name → [use_cases that use it]`.
2. Functions appearing in **multiple use cases** (e.g., `authenticate_session` in every UC) → likely belong at the **top-level FFBD** or in a shared sub-diagram.
3. Functions appearing in **one use case** → belong in that use case's sub-diagram only.

### Step 4: Seed the Top-Level FFBD

1. Identify the **primary use case** (often the first, most critical, or highest-priority one).
2. Draw a **top-level FFBD** representing that use case's high-level flow: 5-8 blocks at the use-case level ("Onboard Merchant," "Process Order," etc.), not at the function level.
3. For each top-level block, note which `function_sequence` entries it decomposes into.
4. Add a reference block for every other use case that will get its own sub-diagram.

### Step 5: Decompose Sub-Diagrams

1. For each use case that needs a detailed FFBD, create a sub-diagram titled `Function <N> : <Use Case Name>`.
2. Populate it with the functions from `use_case_flows[].function_sequence` in order.
3. Add trigger arrows between consecutive functions.
4. Add OR gates / decision diamonds at every `branching` location, using the `guard` labels.
5. Add EFFBD data blocks for external actors feeding data into this use case.
6. Add arrow labels for any timing constants relevant to this use case.

### Step 6: Write the Ingestion Report

Emit an `ingestion_report.json` documenting what came from where:

```json
{
  "_schema": "ffbd_ingestion_report.v1",
  "_output_path": "<project>/module-3-ffbd/ingestion_report.json",
  "_produced_date": "YYYY-MM-DD",

  "source_handoff": "<project>/module-2-requirements/ffbd-handoff.json",
  "source_schema_version": "ffbd_handoff.v1",

  "functions_ingested": <count>,
  "functions_assigned_to_top_level": <count>,
  "functions_assigned_to_sub_diagrams": { "UC01": 8, "UC02": 6 },

  "use_case_flows_ingested": <count>,
  "branching_points_identified": <count>,
  "constants_attached_as_labels": <count>,

  "open_questions_from_module_2": [
    "<e.g., Constant RESPONSE_BUDGET_MS is still an Estimate — mark downstream functions as Yellow>"
  ],

  "ready_to_start_phase_1": true
}
```

## Worked Example: Ingesting the E-Commerce Platform Handoff

Suppose Module 2 produces:

- 41 functions across 8 use cases
- Primary use case: **UC01 Customer Completes Checkout** (8 functions)
- 3 branching points (payment authorization, shipping availability, loyalty program)
- 18 constants including `RESPONSE_BUDGET_MS = 500` and `CHECKOUT_COMPLETION_RATE_TARGET = 0.95`
- 4 cross-cutting concerns including `record_audit_log` and `validate_session`

Module 3 ingestion produces:

- **Top-level FFBD:** 7 use-case-level blocks (F.1 Provision Platform, F.2 Onboard Merchant, F.3 Serve Shopper Session, F.4 Process Order, F.5 Fulfill Order, F.6 Monitor & Operate, F.7 Generate Reports)
- **Function 4 sub-diagram (Process Order):** 8 blocks from `UC01.function_sequence`, 1 decision diamond (payment authorization result), 1 OR gate (shipping availability), with `RESPONSE_BUDGET_MS` labeled on the user-facing arrows
- **Data blocks on the top-level FFBD:** Customer Credentials, Merchant Account Config, Pricing & Tax Rules, Compliance Policy (from `cross_cutting_concerns[]` + `external_actors[]`)
- **IT gate** wrapping F.3 through F.5 with termination condition *Until merchant deactivates* (inferred from the continuous service nature of `serve_shopper_session`)
- **Yellow-flag candidates:** functions downstream of `RESPONSE_BUDGET_MS` (still an Estimate)

By the end of Phase 0A, you have a **seeded FFBD** — not a finished one. Phases 1-11 still apply; they now have a head start.

## Validation Checklist (STOP-GAP)
- [ ] `ffbd-handoff.json` exists and validates against `ffbd_handoff.v1`
- [ ] `module_2_final_review.json` has `ready_for_module_3: true`
- [ ] All functions from `functions[]` have been classified as top-level or sub-diagram
- [ ] All `use_case_flows[].function_sequence` entries have been mapped to trigger-arrow chains
- [ ] All `branching[]` entries have been marked as OR gate or decision diamond
- [ ] All `constants[]` with time or count units have been staged as potential arrow labels
- [ ] All `external_actors[]` have been staged as potential data blocks
- [ ] All `cross_cutting_concerns[]` have been classified as data block or reference block
- [ ] `module_1_constraints_carried_forward[]` is recorded as context
- [ ] `ingestion_report.json` is emitted with `ready_to_start_phase_1: true`

> **STOP: Do not proceed to Phase 1 until the ingestion report shows every function, flow, and constant has been accounted for.**
> If Module 2's bundle is incomplete (missing requirements tags, missing guards, or `needs_user_input` flags), loop back to Module 2 Phase 12 for cleanup before starting Module 3.

## Output Artifact

- A **seeded draft FFBD** (top-level + one or more sub-diagrams) derived from the Module 2 handoff
- An **ingestion report** (`ingestion_report.json`) documenting the mapping
- A staging list of **EFFBD data blocks**, **constants-as-labels**, and **uncertainty-candidate functions** for later phases

## Handoff to Next Phase

You now have an FFBD seeded from validated requirements. Phase 1 establishes the framing and iteration mindset so you can treat the seed as a draft, not a final, and refine it with the team.

**Starting from scratch instead?** Skip this phase and go directly to [Phase 1](01_FFBD-FOUNDATIONS.md) — the full 11-phase workflow derives everything from a plain system description.

---

**Next →** [01 — FFBD Foundations](01_FFBD-FOUNDATIONS.md) | **Back:** [00 — Module Overview](00_MODULE-OVERVIEW.md) | **Upstream:** [Module 2 Phase 12 — FFBD Handoff](../../2%20-%20Developing%20System%20Requirements/2-dev-sys-reqs-for-kb-llm-software/15-Phase-12-Final-Review-and-FFBD-Handoff.md)
