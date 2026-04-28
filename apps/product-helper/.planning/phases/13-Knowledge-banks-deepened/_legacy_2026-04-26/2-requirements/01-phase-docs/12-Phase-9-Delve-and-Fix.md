# Phase 9: Delve and Fix

> Corresponds to Step 9 of the UCBD Checklist and the "Delving Into Your Requirements" / "Tips For Delving Into Requirements" / "Identify Missed Functionality" lessons.

## Knowledge

Your first pass through a use case catches the obvious. Delving catches the rest. The course is explicit:

> "It's rare that even the most experienced professional designer will think of all of the key functions or delve far enough on their first try, so it's quite common that your first pass at a UCBD might be pretty short and rather high level."

Phase 9 is a **structured interrogation** of every requirement you have so far, looking for hidden dependencies, edge cases, and implicit expectations.

### The course's delving questions (verbatim)

> - "If the system has to be able to do this, what else must it do?"
> - "Are there other functions that are occurring at the same time?"
> - "If I asked a contractor to create something that just performed the functions I wrote and nothing else, would I be confident that what I got back would be able to meet all of needs associated with this use case?"

These three questions are the core loop. Run every requirement through them and capture new requirements that emerge.

### The contractor test (operational)

Imagine you hand your current `requirements_table.json` to a contractor with no other context. They build exactly what's written, nothing more. Do you get a working system?

- If they'd build something that charges a customer's card but never records the order → you missed "persist order".
- If they'd record the order but never send confirmation → you missed "dispatch confirmation".
- If they'd send confirmation but never handle a send failure → you missed "retry on delivery failure".

**Every negative answer to the contractor test becomes one or more new requirements.**

### Systematic delving lenses

Beyond the three course questions, apply these lenses to every requirement:

1. **Input validation.** What happens if the input to this function is malformed, missing, oversized, or malicious?
2. **Preconditions.** What must be true before this function fires? Is it asserted?
3. **Postconditions.** What must be true after? Is it verified?
4. **Error paths.** What are the ways this can fail? Is each failure handled?
5. **Timing.** Is there a latency bound? A timeout? A retry?
6. **Concurrency.** What if two instances of this fire simultaneously? Race condition? Idempotency?
7. **Ordering.** Does this function depend on another finishing first? Is the ordering enforced?
8. **State.** Where is state stored? For how long? Who can read/write it?
9. **Audit.** Is the action recorded? By whom, when, why?
10. **Observability.** Can an operator tell this function ran / failed? Is there a metric, log, alert?
11. **Authorization.** Who is allowed to invoke this? How is that checked?
12. **Privacy.** Does this touch personal data? Is access logged? Is data minimized?
13. **Cleanup.** If this is a multi-step flow that partially completes, is rollback defined?
14. **Capacity.** What is the upper bound on the input/output size?
15. **Recovery.** After a crash, restart, or network partition, can this resume cleanly?

### "Functions occurring at the same time"

The second course question. Look for *parallel* functions you didn't write:

- While the system is authorizing payment, what else is happening? (Session keep-alive? Cart lock? Timeout timer?)
- While the system is emitting an event, what else? (Local state transition? Compensating action on failure?)
- While the customer is at step 3, what's the system doing in the background? (Pre-fetching next step? Logging the funnel?)

### Software-system delving heuristics

For a software system, the most frequently missed requirements fall into these categories. **For every use case, audit each category.**

| Category | Common missed requirement |
|----------|---------------------------|
| **Authentication** | Session expiry, token refresh, re-auth on sensitive actions |
| **Authorization** | Role/permission check on every protected action, not just login |
| **Input validation** | Type, size, format, encoding, injection protection |
| **Rate limiting** | Per-user, per-IP, per-endpoint |
| **Idempotency** | Retry-safe writes; duplicate-request handling |
| **Concurrency** | Optimistic locking, row-level locking, distributed locks |
| **Pagination** | Unbounded lists returned vs paginated |
| **Search / sort / filter** | Default ordering, max page size |
| **Timezone / localization** | Dates, currency, number format, locale |
| **Accessibility** | Keyboard navigation, screen reader, contrast |
| **Error messages** | Actionable, non-leaking, logged |
| **Empty states** | First-time user, no data, deleted entity |
| **Retry / backoff** | Exponential, circuit breaker, max attempts |
| **Graceful degradation** | Fallback when dependency unavailable |
| **Timeouts** | Request, session, connection, acquisition |
| **Cache invalidation** | TTL, event-driven, manual |
| **Audit logs** | Who, what, when, outcome |
| **Metrics / observability** | Counter, gauge, histogram, trace |
| **Alerting** | Threshold, ownership, severity, escalation |
| **Backups / restore** | Frequency, retention, recovery time objective |
| **Data retention / deletion** | TTL, legal hold, right-to-be-forgotten |
| **Compliance / privacy** | PII tagging, data residency, consent |
| **Deployment** | Zero-downtime, rollback, feature flag |
| **Backward compatibility** | API versioning, migration path |

Run every category against every use case. Most will produce at least one missed requirement.

## Input Required

- Final `requirements_table.json` from Phase 8
- All UCBDs (from Phase 5)
- `constants_table.json` from Phase 8

## Instructions for the LLM

1. **Run the contractor test.** Mentally simulate building exactly what's in `requirements_table.json` and ask: "Would this produce a working system?" Record every "no" with a proposed new requirement.
2. **Walk the lenses.** For each row, apply the 15 systematic lenses above. Record every missed requirement.
3. **Walk the software-system categories.** For each of the 24 common categories, check if the relevant requirements exist. Record gaps.
4. **Emit new requirements** with fresh indexes. Add them to the table.
5. **Update UCBDs.** If a missed requirement implies a new UCBD step, update the relevant UCBD(s) and note the back-fill.
6. **Emit `delving_report.json`** summarizing what you added and why.

## Output Format

Updated `requirements_table.json` plus a companion:

```json
{
  "_schema": "delving_report.v1",
  "_output_path": "<project>/module-2-requirements/delving_report.json",
  "_phase_status": "phase-9-complete",

  "contractor_test_gaps": [
    {
      "original_scenario": "Contractor builds UC01 as written.",
      "gap": "No requirement for handling a payment authorization decline.",
      "new_requirements": ["UC01.R12", "UC01.R13"]
    },
    {
      "original_scenario": "Contractor builds UC01 as written.",
      "gap": "No requirement for session timeout during checkout.",
      "new_requirements": ["UC01.R14"]
    }
  ],

  "lens_gaps": [
    {
      "lens": "input_validation",
      "requirement_audited": "UC01.R02",
      "gap": "No requirement for rejecting invalid shipping addresses.",
      "new_requirement": "UC01.R15"
    },
    {
      "lens": "concurrency",
      "requirement_audited": "UC01.R04 (persist_order)",
      "gap": "No requirement for idempotent order creation — duplicate submit could create two orders.",
      "new_requirement": "UC01.R16"
    }
  ],

  "category_gaps": [
    {
      "category": "audit_logs",
      "gap": "No audit-log requirement for any successful checkout.",
      "new_requirement": "UC01.R17"
    },
    {
      "category": "rate_limiting",
      "gap": "No rate-limit requirement on payment authorization endpoint.",
      "new_requirement": "UC01.R18"
    }
  ],

  "new_requirements_added": [
    {
      "index": "UC01.R12",
      "requirement": "The system shall surface a user-visible failure message within ERROR_VISIBILITY_BUDGET_MS when payment authorization is declined.",
      "abstract_function_name": "surface_payment_decline",
      "source_lens": "contractor_test"
    },
    {
      "index": "UC01.R13",
      "requirement": "The system shall preserve the cart state after a declined authorization so the customer can retry.",
      "abstract_function_name": "preserve_cart_on_failure",
      "source_lens": "contractor_test"
    },
    {
      "index": "UC01.R14",
      "requirement": "The system shall terminate the checkout session after SESSION_TTL_MIN of inactivity and require re-authentication to resume.",
      "abstract_function_name": "enforce_session_timeout",
      "source_lens": "contractor_test"
    },
    {
      "index": "UC01.R16",
      "requirement": "The system shall treat order creation as idempotent such that duplicate submissions within IDEMPOTENCY_WINDOW_SEC do not create duplicate orders.",
      "abstract_function_name": "enforce_order_idempotency",
      "source_lens": "concurrency"
    },
    {
      "index": "UC01.R17",
      "requirement": "The system shall record an audit log entry for every completed checkout capturing customer ID, order ID, timestamp, and total amount.",
      "abstract_function_name": "audit_checkout_completion",
      "source_lens": "audit_logs"
    },
    {
      "index": "UC01.R18",
      "requirement": "The system shall rate-limit payment authorization attempts per customer to RATE_LIMIT_PER_MIN.",
      "abstract_function_name": "rate_limit_payment_attempts",
      "source_lens": "rate_limiting"
    }
  ],

  "new_constants_needed": [
    "ERROR_VISIBILITY_BUDGET_MS",
    "SESSION_TTL_MIN",
    "IDEMPOTENCY_WINDOW_SEC",
    "RATE_LIMIT_PER_MIN"
  ],

  "ucbd_updates_needed": [
    {
      "ucbd": "UC01",
      "new_step_required": "Add a step after UC01.R03 covering declined authorization path (or spin off UC01a-CheckoutPaymentDeclined)."
    }
  ],

  "summary": {
    "gaps_found": 22,
    "new_requirements_added": 22,
    "new_constants_needed": 4,
    "ucbds_requiring_update": 1
  }
}
```

## STOP GAP — Checkpoint 1

Present `delving_report.json` and the revised `requirements_table.json`. Ask:

1. "I found **[N]** gaps and added **[M]** new requirements. Walk through them with me?"
2. "**[K]** new constants are needed — same flow as Phase 8: I'll propose values, you approve."
3. "**[L]** UCBDs need step additions. Should I make those updates now, or defer to a second pass?"
4. "Any category I audited where the gap is intentional / out of scope? I'll remove the new requirement if so."
5. "Proceed to Phase 10 (SysML Activity Diagram)?"

> **STOP:** Do not proceed until the user has confirmed each new requirement. Also loop back to Phase 8 to add the new constants if any were introduced.

## Output Artifact

- Revised `requirements_table.json` with new requirements
- `delving_report.json` with the audit trail
- Optionally revised UCBD JSONs for any use case that needs step updates
- Optionally revised `constants_table.json` with new constants

## Handoff to Next Phase

Phase 10 converts each UCBD into a SysML Activity Diagram (Mermaid notation) with `<<requirement>>` stereotype links back to Requirements Table indexes.

---

**Next →** [Phase 10: SysML Activity Diagram](13-Phase-10-SysML-Activity-Diagram.md) | **Back:** [Phase 8](11-Phase-8-Constants-Table.md)
