# Phase 7: Requirements Rules Audit

> Corresponds to Step 8 of the UCBD Checklist and the "Writing Good Requirements" / "Following the Requirements Rules" / "Bad vs Good Requirements" lessons.

## Knowledge

You now have a `requirements_table.json` from Phase 6. Phase 7 runs every row through six rules. Any row that fails gets rewritten. Anything that can't be rewritten gets flagged for the user.

### The Six Rules (course, verbatim)

> Your requirements should be:
> - Written as "shall" statements
> - Correct: what you're saying is accurate
> - Clear and precise: one idea per requirement. For the word "and" or similar conjunctions it's considered better to split the requirement into two.
> - Unambiguous: only one way to interpret
> - Objective: non-opinionated
> - Verifiable: there is some measurable way you could say this requirement is met

Plus Phase 2's hidden seventh rule: **Functional, not structural.** (Already enforced during extraction; re-check here.)

### Rule-by-rule checker

#### Rule 1: Shall Statement

**Test:** sentence starts with exactly `"The system shall "` (case-sensitive).

**Common failures:**
- "The system will..." → rewrite to `shall`
- "The system should..." → rewrite to `shall`
- "The system must..." → rewrite to `shall`
- "System shall..." (missing "The") → rewrite to "The system shall"
- "The application shall..." / "The service shall..." → rewrite to "The system"

Why so picky: `shall` signals a binding obligation in engineering/legal contexts. `will`, `should`, `must` each carry subtly different force. Standardizing on `shall` removes ambiguity.

#### Rule 2: Correct

**Test:** statement is factually true about what the system must do. No aspirational wording.

**Common failures:**
- Using the future tense of hope: "The system shall eventually support..."
- Conditional on future decisions: "The system shall, if approved by the board, ..."
- Over-reach: "The system shall support infinite concurrent users."

**Fix pattern:** strip conditionals; commit to a bounded claim.

#### Rule 3: Clear and Precise (atomicity)

**Test:** the sentence contains exactly one behavior. No `and` or `or` joining two behaviors (a single "and" joining two modifiers of the same behavior is fine, e.g., "securely and reliably" — but see Rule 5 below).

**Common failures:**
- "The system shall authenticate the user **and** authorize the session." → split
- "The system shall encrypt data **and** persist it durably." → split
- "The system shall retry up to 3 times **or** fail gracefully." → split (decompose into two reqs)

**Fix pattern:** for each `and`/`or` joining verbs, emit two requirements. Give each a fresh index.

**Exception:** `and` joining two noun-phrase targets is OK if the single behavior applies symmetrically.
- OK: "The system shall display the order ID and confirmation timestamp." (one display behavior, two fields)
- NOT OK: "The system shall display the order ID and emit a confirmation event." (two distinct behaviors)

#### Rule 4: Unambiguous

**Test:** exactly one interpretation. Two engineers reading the sentence independently should build the same behavior.

**Common failures (vague qualifiers):**
- "quickly", "fast", "efficiently" — what does "fast" mean? Use a number.
- "as needed", "when appropriate" — under what conditions?
- "users" (plural generic) — which users? All? Authenticated? Admins?
- "data" — which data?
- "the appropriate response" — what response?

**Fix pattern:** replace vague nouns with specific ones; replace vague modifiers with measurable ones (often backed by constants — Phase 8).

#### Rule 5: Objective

**Test:** no opinions, preferences, or aesthetic judgments.

**Common failures:**
- "user-friendly" / "intuitive" / "elegant" / "beautiful"
- "easy to use" — what's the metric?
- "seamless" — what's the observable?
- "robust" / "reliable" — what's the threshold?

**Fix pattern:** replace the opinion with the measurable behavior it implies.
- "The system shall be user-friendly" → "The system shall complete the checkout flow in no more than `MAX_CHECKOUT_STEPS` user-initiated interactions."
- "The system shall be reliable" → "The system shall maintain availability ≥ `AVAILABILITY_TARGET` measured over `SLO_WINDOW`."

#### Rule 6: Verifiable

**Test:** you can write a pass/fail test for this requirement. Given an instance of the system, a tester can confirm whether the requirement is met.

**Common failures:**
- "The system shall be secure." → no test exists for absolute "security"; rewrite as specific behaviors (authentication, authorization, encryption, rate-limiting).
- "The system shall scale." → to what, under what conditions, measured how?
- "The system shall handle errors gracefully." → what errors, what behaviors on each?

**Fix pattern:** for each unverifiable requirement, enumerate the verifiable sub-behaviors that together constitute the original intent. Often this produces 3–6 requirements from one vague one.

#### Rule 7 (hidden): Functional, not Structural

Re-apply the Phase 2 test. If any requirement names a specific technology, library, protocol, or component that didn't flow down from Module 1 hard constraints → rewrite functionally.

### The fix workflow

For each requirement:

1. Run it through rules 1–7.
2. If it passes all: keep as-is.
3. If it fails one: attempt the fix pattern above.
4. If the fix yields 2+ requirements (Rule 3 or Rule 6 splits): emit them with fresh indexes (next available `UC<xx>.R<yy>` in that use case), retire the original index (don't reuse), and annotate.
5. If you can't fix without user input (e.g., "the user said 'fast' but didn't give a number"): flag it for the user with a proposed value and a `needs_user_input: true` marker.

### The Worked Rewrite Example (reference)

Starting requirement (bad, violates multiple rules):

> "The system shall be fast and reliable and handle errors gracefully."

Rules violated: Rule 3 (three behaviors joined by `and`), Rule 4 ("fast"), Rule 5 ("reliable"), Rule 6 ("handle errors gracefully").

Rewritten as four requirements:

1. "The system shall respond to synchronous user-facing requests within `RESPONSE_BUDGET_MS` measured at the 95th percentile."
2. "The system shall maintain availability ≥ `AVAILABILITY_TARGET` measured over `SLO_WINDOW`."
3. "The system shall surface a user-visible error message within `ERROR_VISIBILITY_BUDGET_MS` when a synchronous request fails."
4. "The system shall record an audit entry for every error surfaced to the user, capturing the error type, timestamp, and affected resource."

Notice how the rewrite:
- Introduces four named constants (Phase 8 will define them).
- Replaces every opinion with a measurable.
- Specifies scope (synchronous, user-facing) rather than "everything".
- Emerges as four atomic, verifiable, unambiguous requirements.

## Input Required

- `requirements_table.json` from Phase 6

## Instructions for the LLM

1. Iterate through every row of `requirements_table`.
2. For each row, run the 7 rules. Record which (if any) fail.
3. Rewrite as needed. For splits, emit new rows with fresh indexes and annotate the retired index in a `retired_indexes` array.
4. For items needing user input, set `needs_user_input: true` and propose a value.
5. Emit the revised `requirements_table.json` plus an `audit_report` section summarizing the fixes.

## Output Format

```json
{
  "_schema": "Requirements-table.schema.json",
  "_output_path": "<project>/module-2-requirements/requirements_table.json",
  "_phase_status": "phase-7-complete",

  "metadata": { /* unchanged */ },

  "requirements_table": [
    {
      "index": "UC01.R01",
      "requirement": "The system shall display the checkout summary within RESPONSE_BUDGET_MS of cart submission.",
      "abstract_function_name": "display_checkout_summary",
      "source_ucbd": "UC01",
      "also_appears_in": [],
      "rules_passed": ["shall", "correct", "atomic", "unambiguous", "objective", "verifiable", "functional"],
      "rewrite_history": [
        {
          "original": "The system shall display the checkout summary showing all cart items, subtotal, and estimated total within 500 ms of initiation.",
          "reason": "Inline literal (500 ms) replaced with constant RESPONSE_BUDGET_MS for reuse across requirements. Dropped cart-items enumeration since that is implied by 'checkout summary'."
        }
      ],
      "needs_user_input": false
    },
    {
      "index": "UC02.R08",
      "requirement": "The system shall respond to synchronous user-facing requests within RESPONSE_BUDGET_MS at the 95th percentile.",
      "abstract_function_name": "meet_response_budget",
      "source_ucbd": "UC02",
      "also_appears_in": ["UC01", "UC03"],
      "rules_passed": ["shall", "correct", "atomic", "unambiguous", "objective", "verifiable", "functional"],
      "rewrite_history": [
        {
          "original": "The system shall be fast and reliable.",
          "reason": "Split by Rule 3 (two behaviors); resolved Rule 4 ('fast') with named constant; resolved Rule 5 ('reliable') into separate requirement UC02.R09."
        }
      ],
      "needs_user_input": false
    },
    {
      "index": "UC02.R09",
      "requirement": "The system shall maintain availability greater than or equal to AVAILABILITY_TARGET measured over SLO_WINDOW.",
      "abstract_function_name": "meet_availability_target",
      "source_ucbd": "UC02",
      "also_appears_in": [],
      "rules_passed": ["shall", "correct", "atomic", "unambiguous", "objective", "verifiable", "functional"],
      "rewrite_history": [
        {
          "original": "The system shall be fast and reliable.",
          "reason": "Second half of a split. First half is UC02.R08."
        }
      ],
      "needs_user_input": true,
      "user_input_needed": "Proposed AVAILABILITY_TARGET = 99.9% and SLO_WINDOW = 1 calendar month. Confirm or override."
    }
  ],

  "retired_indexes": [
    {
      "index": "UC02.R03",
      "reason": "Split into UC02.R08 and UC02.R09 per Rule 3."
    }
  ],

  "audit_report": {
    "total_requirements_audited": 41,
    "passed_unchanged": 27,
    "rewritten": 11,
    "split_into_multiple": 3,
    "failed_needs_user_input": 5,
    "constants_introduced": [
      "RESPONSE_BUDGET_MS",
      "AVAILABILITY_TARGET",
      "SLO_WINDOW",
      "MAX_PAYMENT_RETRIES",
      "ERROR_VISIBILITY_BUDGET_MS"
    ],
    "failures_by_rule": {
      "shall": 2,
      "atomic": 4,
      "unambiguous": 6,
      "objective": 3,
      "verifiable": 2,
      "functional": 1
    }
  }
}
```

## Software-system translation notes

Software-specific rule-audit heuristics:

| Rule | Software-specific trap | Fix pattern | KB |
|------|-------------------------|-------------|-----|
| Shall | "The system shall return 200 OK" | Replace HTTP semantics with domain semantics: "The system shall confirm the resource was created." | `api-design-sys-design-kb.md` |
| Atomic | "The system shall authenticate and authorize" | Two behaviors → two requirements. Authentication ≠ authorization. | `api-design-sys-design-kb.md` |
| Unambiguous | "users" / "requests" (unqualified) | Qualify: "authenticated customers" / "synchronous user-facing requests" | — |
| Objective | "performant", "scalable" | Replace with SLO language: latency percentile, throughput, concurrency target | `software_architecture_system.md` |
| Verifiable | "The system shall be secure" | Decompose into auth, authz, encryption, rate-limiting, audit requirements | `observability-kb.md` |
| Functional | "The system shall use Redis for sessions" | "The system shall preserve session state for SESSION_TTL_MIN" | `caching-system-design-kb.md` |

### Common software failure patterns requiring decomposition

- **"Be secure"** → auth + authz + encryption + audit + rate-limit = 5 requirements
- **"Handle errors gracefully"** → for each error class: detect, log, surface, recover = 4 requirements per class
- **"Be scalable"** → concurrent user target + throughput target + horizontal scaling behavior = 3 requirements
- **"Be fast"** → P50 latency + P95 latency + P99 latency + throughput = 3–4 requirements
- **"Be reliable"** → availability target + MTTR + graceful degradation + retry/backoff = 4 requirements

## STOP GAP — Checkpoint 1

Present the revised `requirements_table.json` and `audit_report` and ask:

1. "I audited **[N]** requirements. **[M]** passed unchanged, **[K]** were rewritten, **[L]** were split into multiple."
2. "**[P]** requirements need your input to finalize (usually a threshold value). Here they are with proposed values: **[list]**. Approve each or override."
3. "I introduced **[Q]** new constants: **[list]**. Phase 8 will define them properly."
4. "Review any rewritten requirement where the intent may have drifted from your original phrasing."
5. "Proceed to Phase 8 (Constants Table)?"

> **STOP:** Do not proceed until user resolves all `needs_user_input` items. Phase 8's constants need values.

## Output Artifact

Revised `requirements_table.json` with audit trail and retired indexes. Every row now passes the 7 rules.

## Handoff to Next Phase

Phase 8 takes the constants introduced during the audit and builds the formal `constants_table.json`.

---

**Next →** [Phase 8: Constants Table](11-Phase-8-Constants-Table.md) | **Back:** [Phase 6](09-Phase-6-Extract-Requirements-Table.md)
