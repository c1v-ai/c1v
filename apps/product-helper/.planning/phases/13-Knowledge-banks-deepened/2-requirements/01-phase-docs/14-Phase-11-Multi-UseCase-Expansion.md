# Phase 11: Multi-UseCase Expansion

> Corresponds to Step 10 of the UCBD Checklist: *"Repeat Steps 2–9 for your remaining high priority use cases and some of your medium, or even low, priority use cases."*

## Knowledge

Phase 1 selected a first-pass subset (typically 5 use cases). Phase 11 is the **second wave** — processing the deferred use cases to expand coverage.

The course's explicit guidance on selecting second-wave use cases:

> "When trying to choose which lower priority use cases to explore, try to select the ones that you think will involve different kinds of functionality and set different kinds of requirements for your system than those you have already declared."

Translation: **maximize functional coverage**, not business importance. You've already captured the obvious requirements. Second wave finds what's missing.

### When to skip Phase 11

Not every project needs Phase 11:

- If you have ≤5 use cases total → Phase 1 already selected all. Skip to Phase 12.
- If time is constrained and the first-wave coverage is acceptable → skip. Deferred use cases can be picked up in later milestones.
- If the deferred use cases duplicate functionality of first-wave UCBDs → skip. New UCBDs won't add new requirements.

**Do** Phase 11 if:

- Deferred use cases exercise actors or interactions not covered in first wave (new swimlane).
- Deferred use cases exercise software categories not yet represented (e.g., admin surface, batch flow, real-time streaming).
- Time permits and completeness matters (e.g., deliverable for regulated industry).

### The expansion procedure

For each selected second-wave use case:

1. Run **Phase 3** (UCBD Setup) — metadata, columns, notes.
2. Run **Phase 4** (Start/End Conditions).
3. Run **Phase 5** (Step Flow).
4. Run **Phase 6** (Extract Requirements Table) — **but in append mode.** Do NOT re-extract already-processed UCBDs. Add new rows with indexes starting where the previous use case left off.
5. Run **Phase 7** (Rules Audit) on the new requirements only. Existing requirements don't need re-audit unless a new one exposes an inconsistency.
6. Run **Phase 8** (Constants) on new constants introduced. Existing constants stay.
7. Run **Phase 9** (Delve and Fix) on the new use case.
8. Run **Phase 10** (SysML Activity Diagram) for the new UCBD.

**Between each use case, STOP.** Do not batch five use cases into one silent expansion — the user needs to review each one as it's added.

### Cross-UCBD deduplication pass

After all second-wave UCBDs are processed, run a **dedup sweep** across the master `requirements_table.json`:

1. Group requirements by `abstract_function_name`. Different indexes, same function name → likely duplicates.
2. For each group, compare requirement text. If semantically identical, merge: keep the lowest index, add later UCs to `also_appears_in`, retire the later indexes.
3. If function names differ but requirements are semantically identical (unlikely but possible), flag to user — probably a function-naming inconsistency to reconcile.

### Second-wave-specific failure modes (watch for)

- **Requirement creep.** New use cases introduce orthogonal requirements that don't belong to any specific use case (e.g., "audit every action"). Move these to a separate `cross_cutting_requirements` section if needed, with indexes like `CC.R01`, `CC.R02`.
- **Index collisions.** Two UCBDs added in parallel accidentally reusing indexes. Serialize Phase 11 — one use case at a time.
- **Constant renaming.** Second-wave use case introduces `RESPONSE_TIMEOUT_MS` when first wave used `RESPONSE_BUDGET_MS` for the same concept. Consolidate.
- **Actor drift.** Second-wave use case introduces `Admin` as a new actor — confirm it was in Module 1's context diagram; if not, send user back to Module 1.

## Input Required

- `use_case_priority.json` from Phase 1 (the `deferred_use_cases` array)
- Final artifacts from Phases 3–10 (for first-wave UCBDs)

## Instructions for the LLM

1. **Review the deferred list.** Present to the user: "Here are the use cases deferred in Phase 1. Which should we process in Phase 11, and in what order?"
2. **For each selected use case, run Phases 3→10 sequentially.** Stop after each phase's STOP GAP. Honor user input before proceeding.
3. **After all second-wave use cases are built, run the dedup sweep.** Present the merge proposals to the user.
4. **Emit an expansion report.**

## Output Format

**Per-use-case outputs:** Same as Phases 3–10 — one UCBD JSON, requirements rows appended to `requirements_table.json`, new constants appended to `constants_table.json`, one Mermaid activity diagram.

**Final expansion report:**

```json
{
  "_schema": "phase_11_expansion_report.v1",
  "_output_path": "<project>/module-2-requirements/expansion_report.json",
  "_phase_status": "phase-11-complete",

  "first_wave_ucbds": ["UC01", "UC02", "UC03", "UC04", "UC05"],
  "second_wave_ucbds": ["UC06", "UC07", "UC08"],
  "skipped_ucbds": [
    {
      "use_case_id": "UC09",
      "reason": "User decision: low priority and overlaps functionally with UC03."
    }
  ],

  "new_requirements_added_in_expansion": 23,
  "new_constants_added_in_expansion": 4,
  "new_swimlanes_introduced": ["Admin", "Fulfillment Service"],
  "cross_cutting_requirements_lifted": [
    {
      "index": "CC.R01",
      "requirement": "The system shall record an audit log entry for every protected action, capturing actor, action, timestamp, and outcome.",
      "abstract_function_name": "audit_protected_action",
      "reason_lifted": "Appeared in UC01, UC04, UC06, UC07, UC08 — treated as cross-cutting."
    }
  ],

  "dedup_merges": [
    {
      "kept": "UC01.R01 (display_checkout_summary)",
      "retired": ["UC06.R03"],
      "reason": "Identical text and function name."
    }
  ],

  "constant_consolidations": [
    {
      "kept": "RESPONSE_BUDGET_MS",
      "retired": ["RESPONSE_TIMEOUT_MS"],
      "reason": "Same concept, different name."
    }
  ],

  "module_1_drift_detected": [
    {
      "use_case_id": "UC08",
      "issue": "Introduced actor 'Admin' not in Module 1 context diagram.",
      "resolution": "User confirmed Admin is in scope; updated system_context_summary.json."
    }
  ],

  "summary": {
    "total_ucbds_final": 8,
    "total_requirements_final": 64,
    "total_constants_final": 18,
    "cross_cutting_requirements": 4
  }
}
```

## Software-system translation notes

Common second-wave use cases for software systems and the new requirements they typically surface:

| Second-wave use case category | Typical new requirements |
|-------------------------------|---------------------------|
| **Admin / operations UCBDs** | Authorization (role-based), audit logs, bulk operations, privileged-action confirmations |
| **Batch / scheduled UCBDs** | Idempotency, retry on transient failure, dead-letter queue, progress reporting |
| **Error recovery UCBDs** | Rollback, compensating transactions, user-facing error states, support-agent tools |
| **Onboarding UCBDs** | Email verification, progressive profile completion, first-run tutorials, default preferences |
| **Data export / import UCBDs** | File format support, size limits, validation, progress/resumability |
| **Integration UCBDs** (webhooks, third-party) | Authentication, rate limiting, retry, idempotency, signature verification |
| **Real-time / streaming UCBDs** | Connection management, reconnect, backpressure, ordering guarantees |
| **Search / discovery UCBDs** | Indexing latency, ranking, pagination, relevance metrics |
| **Multi-tenant UCBDs** | Tenant isolation, per-tenant quotas, data residency |
| **Compliance-specific UCBDs** | Consent capture, data-subject access request, right-to-delete, audit export |

If a second-wave use case category doesn't produce requirements in the expected columns above, double-check — you may be under-specifying.

## STOP GAP — Checkpoint 1 (after all second-wave use cases processed)

Present the expansion report and ask:

1. "Second wave added **[N]** use cases, **[M]** new requirements, **[K]** new constants."
2. "Dedup sweep merged **[P]** requirements. Review merges."
3. "Constant consolidations: **[list]**. Confirm."
4. "**[Q]** requirements lifted to cross-cutting. Confirm this reclassification."
5. "Any Module 1 drift detected and resolved? Review."
6. "Proceed to Phase 12 (Final Review and FFBD Handoff)?"

> **STOP:** Do not proceed until the user confirms the final expanded table.

## Output Artifact

- Additional UCBD, requirements, constants, and activity diagram updates
- `expansion_report.json` summarizing the wave

## Handoff to Next Phase

Phase 12 is the final review — run the Defining-Your-System checklist, verify all artifacts are consistent, and emit the Module 3 (FFBD) handoff bundle.

---

**Next →** [Phase 12: Final Review and FFBD Handoff](15-Phase-12-Final-Review-and-FFBD-Handoff.md) | **Back:** [Phase 10](13-Phase-10-SysML-Activity-Diagram.md)
