# Phase 1: Prioritize Use Cases

> Corresponds to Step 1 of the UCBD Checklist: *"Rate your use cases to the best of your current knowledge as to which ones are the most important."*

## Knowledge

You cannot build UCBDs for every use case in a first pass — the checklist explicitly says Step 10 is "Repeat Steps 2–9 for your remaining high priority use cases and some of your medium, or even low, priority use cases." Pick the subset that maximizes **coverage of distinct functionality**, not just business importance.

### The course's guidance (quoted)

> "You most likely do not have the time to create UCBDs for all of your use cases, so when trying to choose which lower priority use cases to explore, try to select the ones that you think will involve different kinds of functionality and set different kinds of requirements for your system than those you have already declared."

Translation: diversify. Don't build UCBDs for 5 use cases that all exercise the same subset of system functions — you'll miss entire requirement classes.

### Recommended scoring rubric (RICE-like, adapted for requirements coverage)

Score each use case on three dimensions (1–5 scale):

| Dimension | What it measures |
|-----------|------------------|
| **Business Importance** | How critical is this to launch / revenue / contract obligation? (5 = can't launch without it) |
| **User Frequency** | How often will this use case run in production? (5 = every session) |
| **Functional Uniqueness** | How many functions does this exercise that no other use case touches? (5 = unique architecture needed) |

**Priority Score = Business + Frequency + Uniqueness** (max 15).

Select the **top 5** by score for first-pass UCBDs, with a bias toward **Functional Uniqueness** when scores tie.

## Input Required

- `system_context_summary.json` from Phase 0 (the `use_cases` array)
- User confirmation of the business context (optional — if the user says "all are P0", ask them to rank anyway)

## Instructions for the LLM

1. Load the `use_cases` array from Phase 0's output.
2. For each use case, propose a score on each dimension with a one-sentence justification. **Do not invent importance** — if you don't know, ask.
3. Compute Priority Score.
4. Rank descending. Break ties by Functional Uniqueness.
5. Select top 5 (or all if <5) for the first pass. Flag the rest as **deferred** with a note that Phase 11 will revisit.
6. Emit `use_case_priority.json`.

## Output Format

```json
{
  "_schema": "use_case_priority.v1",
  "_output_path": "<project>/module-2-requirements/use_case_priority.json",

  "scoring_rubric": {
    "business_importance": "1-5: launch criticality",
    "user_frequency":      "1-5: how often it runs",
    "functional_uniqueness": "1-5: distinct functions exercised",
    "priority_score": "sum of three; max 15"
  },

  "ranked_use_cases": [
    {
      "id": "UC01",
      "name": "Customer completes checkout",
      "primary_actor": "Customer",
      "business_importance": 5,
      "business_importance_rationale": "Revenue-critical; no launch without this.",
      "user_frequency": 5,
      "user_frequency_rationale": "Every paying session.",
      "functional_uniqueness": 4,
      "functional_uniqueness_rationale": "Only use case touching payment gateway + order persistence.",
      "priority_score": 14,
      "selected_for_first_pass": true
    },
    {
      "id": "UC04",
      "name": "Support agent resolves dispute",
      "primary_actor": "Support Agent",
      "business_importance": 3,
      "business_importance_rationale": "Required for v1.1, not launch.",
      "user_frequency": 2,
      "user_frequency_rationale": "Rare — estimate 1% of orders.",
      "functional_uniqueness": 5,
      "functional_uniqueness_rationale": "Only use case with admin-side write + audit-trail requirements.",
      "priority_score": 10,
      "selected_for_first_pass": true
    }
  ],

  "deferred_use_cases": [
    {
      "id": "UC07",
      "name": "Customer updates profile",
      "priority_score": 7,
      "reason_deferred": "Overlaps functionally with UC01 (auth) and UC03 (data persistence); low added coverage."
    }
  ],

  "coverage_summary": {
    "first_pass_count": 5,
    "total_use_cases": 8,
    "distinct_external_actors_covered": ["Customer", "Support Agent", "Payment Gateway", "Email Service"],
    "distinct_external_actors_deferred": []
  }
}
```

## Software-system translation notes

When scoring **Functional Uniqueness**, explicitly ask: does this use case exercise any of these software concerns that others don't?

- Write path to a database (vs read-only)
- External API call with money-moving semantics (payment)
- Async / event-driven behavior (vs synchronous request/response)
- Batch or scheduled operation (vs user-triggered)
- Admin or audit surface (vs end-user surface)
- Real-time / streaming (vs polling)

If a use case is the only one covering one of these concerns, bump its Uniqueness score — its UCBD will produce requirement categories no other use case generates.

## STOP GAP — Checkpoint 1

Present `use_case_priority.json` to the user and ask:

1. "Does this ranking match your understanding of business priority?"
2. "I selected **[N]** use cases for the first pass: **[list]**. Confirm or adjust."
3. "The deferred list covers **[list]** — confirm these can wait for Phase 11 expansion."
4. "Any use case I'm missing? Any I should add that isn't in Module 1 yet?"

> **STOP:** Do not proceed to Phase 2 until the user confirms the selected set.
> If the user says "add a use case not in Module 1" — STOP HARDER and send them back to Module 1 first. Do not let Module 2 create new use cases.

## Output Artifact

`use_case_priority.json` — drives the loop in Phases 3–10.

## Handoff to Next Phase

Phase 2 is a knowledge phase (no artifact) — it locks in the functional-vs-structural discipline before you start writing system statements.

---

**Next →** [Phase 2: Thinking Functionally](05-Phase-2-Thinking-Functionally.md) | **Back:** [Phase 0](03-Phase-0-Ingest-Module-1-Scope.md)
