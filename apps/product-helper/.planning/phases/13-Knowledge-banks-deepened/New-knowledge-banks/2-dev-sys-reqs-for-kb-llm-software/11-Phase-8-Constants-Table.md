# Phase 8: Constants Table

> Corresponds to the "Recording Your Constants' Definitions" and "Use a Constant to Resolve a Requirements Issue" lessons.

## Knowledge

A **constant** is a named value referenced by one or more requirements. The Constants Table is your single source of truth for every threshold, budget, limit, or SLA your requirements depend on.

### Why constants matter

1. **DRY.** One number changes in one place. If `RESPONSE_BUDGET_MS` shifts from 500 to 300, you update one cell — not 27 requirements.
2. **Re-estimable.** Requirements written "within `RESPONSE_BUDGET_MS`" read the same whether the value is 500 or 300. The meaning is stable; the target is parametric.
3. **Auditable.** Every threshold has an owner, a source (why this number?), and a status (Estimate vs Final). This is what makes a requirement set defensible in a review.
4. **Traceable.** Module 5 (QFD Engineering Characteristics) and Module 7 (FMEA rating thresholds) both import constants from here.

### Tight scope (what goes in)

**In scope:** constants referenced by `requirements_table.json` rows. If no requirement uses it, it's not here.

Examples:
- `RESPONSE_BUDGET_MS` (appears in latency requirements)
- `AVAILABILITY_TARGET` (appears in availability requirements)
- `MAX_PAYMENT_RETRIES` (appears in retry requirements)
- `SESSION_TTL_MIN` (appears in session requirements)

**Out of scope:** broad project context constants that don't appear in `shall` statements. Those belong in Module 1's scope outputs.

- Don't include: `EXPECTED_DAU`, `LAUNCH_MARKET`, `TEAM_SIZE`
- Do include (only if a requirement references them): `PEAK_CONCURRENT_USERS` if there's a req like "The system shall support `PEAK_CONCURRENT_USERS` simultaneous sessions."

### Column meanings (from schema)

From `Requirement_Constants_Definition_Template.schema.json`:

| Column | Purpose |
|--------|---------|
| `constant` | The name used in requirements. UPPER_SNAKE_CASE. |
| `value` | The current numeric (or string) value. |
| `units` | Required. Unit of measurement. |
| `estimate_final` | **Enum: `Estimate` or `Final`.** Estimate = subject to change; Final = locked. |
| `date_update` | Date of most recent value change (ISO). |
| `final_date` | Date this moved to `Final` status. Blank while `Estimate`. |
| `source` | Where this number came from. Document link, person, SLA, contract, benchmark, intuition-flagged-as-estimate. |
| `owned_by` | The person or role responsible for keeping this accurate. |
| `notes` | Context, caveats, dependencies. |

**LLM-internal fields** (populated in the JSON emission; the xlsx marshaller drops them — see footer at end of `## Output Format`):

| Field | Purpose |
|-------|---------|
| `math_derivation` | Object `{ formula, source, inputs }`. How the `value` was derived. `formula` is a human-readable identity or heuristic; `source` is a KB citation (e.g., `cap_theorem.md`, `resilliency-patterns-kb.md §availability`, `inline §Inline decision plays`, `user_provided`); `inputs` is an object of named inputs (`{}` for string-valued constants). Required on **every** row. |
| `software_arch_decision` | Object `{ ref, choice }`. Ties the constant to a software-arch trade-off. `ref ∈ { cap_theorem, resiliency, caching, load_balancing, api_design, none }`; `choice` is the selected option (e.g., `"CP"`, `"AP"`, `"cache-aside"`, `"exponential-backoff"`, `"n/a"`). Use `ref: "none"`, `choice: "n/a"` for pure UX/business constants. |

### Estimate vs Final discipline

Most constants start as `Estimate`. They move to `Final` when:
- A contract commits to the value
- A benchmark or measurement locks it
- Leadership explicitly signs off

**Never leave unspecified.** If you don't know, it's `Estimate` with `source: "LLM proposed initial value; needs user confirmation"` — never blank.

### Naming rules

- `UPPER_SNAKE_CASE`.
- Name the *meaning*, not the value: `RESPONSE_BUDGET_MS` not `FIVE_HUNDRED_MS`.
- Units suffix is optional but recommended for numerics: `_MS`, `_SEC`, `_MIN`, `_HR`, `_DAYS`, `_PCT`, `_BYTES`, `_COUNT`.
- No Hungarian notation beyond unit suffixes.
- Prefer positive framing: `AVAILABILITY_TARGET` (not `DOWNTIME_BUDGET`).

### When the same concept appears in multiple requirements

Use the same constant name. That's the point. If two latency requirements both say "within 500 ms" they're referencing the same `RESPONSE_BUDGET_MS`. If one means something different (say, "within 2 seconds for batch operations"), it's a *different* constant: `BATCH_RESPONSE_BUDGET_MS`.

Separate constants, separate rationales, separate ownership.

### Inline decision plays (Track 2)

When you propose a constant whose *value* depends on a software-architecture trade-off, consult one of the decision plays below and record the choice in `software_arch_decision`.

#### CAP decision play (for consistency-class constants)

Use for any constant that gates user-visible data freshness or correctness — e.g., `READ_CONSISTENCY_MODE`, `LAST_WRITE_WINS_WINDOW_MS`, `REPLICATION_LAG_BUDGET_MS`. During a network partition you must choose one of two directions — you cannot have both. Source: `cap_theorem.md`.

| Choice | Use when | Design implication | Typical tech |
|--------|----------|-------------------|--------------|
| **CP** (Consistency) | Stale data causes real harm — ticket booking, inventory, financial transactions, order books. | Route writes (and often reads) to a single primary; accept higher latency; accept brief unavailability during partitions. | PostgreSQL primary, Google Spanner, DynamoDB (strong mode). |
| **AP** (Availability) | Stale data is tolerable for seconds — social feeds, profile data, content catalogs. | Multiple read replicas; eventual consistency via CDC or async replication; self-healing. | Cassandra, DynamoDB (multi-AZ), MongoDB replica sets, Redis Cluster. |

Set `software_arch_decision.ref: "cap_theorem"`, `choice: "CP"` or `"AP"`. Write the rationale into the constant's `notes`.

#### Availability-nines formula (for availability-class constants)

Use for any constant expressing a reliability/availability target — e.g., `AVAILABILITY_TARGET`, `COMPONENT_AVAILABILITY_TARGET`, `MAX_PLANNED_DOWNTIME_MIN`. Source: `resilliency-patterns-kb.md` (+ `system-design-math-logic.md §9` once that canonical file is written; inline formulas here seed it).

```
A = MTBF / (MTBF + MTTR)                                  # single component
Serial chain (dependent services):
    A_total = A_1 × A_2 × ... × A_n                        # nines compound DOWN
Parallel redundancy (independent replicas):
    A_total = 1 − ∏(1 − A_i)  for i = 1..n                 # nines compound UP

Monthly downtime budget (30-day month, rounded):
    99.9%   = 43.2 min       99.95%  = 21.6 min
    99.99%  = 4.32 min       99.999% = 25.9 sec
(31-day month: 44.6 min / 22.3 min / 4.46 min / 26.7 sec.)
```

When the target is system-wide but the system has N dependent upstream services, back-solve per-component availability: if `AVAILABILITY_TARGET = 99.9%` and the request path crosses 3 serial services, each must hit ≈`99.967%` to compose.

Set `software_arch_decision.ref: "resiliency"`, `choice: "<nines target>, <serial|parallel|mixed>"`. Populate `math_derivation.formula` with the specific identity used and `math_derivation.inputs` with the numbers (e.g., `{ "n_serial": 3, "A_component": 0.99967 }`).

## Input Required

- `requirements_table.json` from Phase 7 (the revised version)
- Phase 7's `audit_report.constants_introduced` list

## Instructions for the LLM

1. **Enumerate every CAPS_CONSTANT token** referenced in the `requirement` field of every row in `requirements_table.json`. Use regex `[A-Z][A-Z0-9_]{2,}` but filter out common non-constants (e.g., `ID`, `HTTP`, `URL`).
2. **For each constant, propose:**
   - `value` — your best initial estimate, based on project context and the KB heuristics below.
   - `units` — infer from context.
   - `estimate_final` — always `Estimate` on first emission.
   - `source` — cite if you pulled from a software-system KB; otherwise `"LLM proposed initial value"`.
   - `owned_by` — default to engineering lead, or a role from Module 1 stakeholders.
   - `notes` — capture why this value, and which requirements reference it.
3. **Populate `math_derivation` on every row.** Object shape `{ formula, source, inputs }`. Even for string-valued constants (e.g., `SLO_WINDOW`), supply a citation-only `formula` and `inputs: {}`. For numeric constants derived from the inline formulas, populate `inputs` with the named values you used.
4. **Populate `software_arch_decision` where the constant is tied to an architecture trade-off.** Consult the inline decision plays in `### Inline decision plays (Track 2)`:
   - Consistency-class constants (data-freshness / correctness gates) → use the **CAP decision play**. Set `ref: "cap_theorem"`, `choice: "CP"` or `"AP"`.
   - Availability-class constants (reliability targets, nines budgets) → use the **Availability-nines formula**. Set `ref: "resiliency"`, `choice: "<nines target>, <serial|parallel|mixed>"`.
   - Caching, rate-limit, load-balancing, API-budget constants → use `ref: "caching" | "load_balancing" | "api_design"` with a choice drawn from the relevant KB.
   - Pure UX or business constants (e.g., `SESSION_TTL_MIN` driven by UX policy) → `ref: "none"`, `choice: "n/a"`.
5. **Flag every constant as `needs_user_input: true`** — the user must approve every value before it becomes Final.
6. **Check for conflicts.** If two requirements reference different constants for the same concept, flag to user (might be same value; might be intentionally different).
7. **Emit `constants_table.json`.**

## Output Format

```json
{
  "_schema": "Requirement_Constants_Definition_Template.schema.json",
  "_output_path": "<project>/module-2-requirements/constants_table.json",
  "_phase_status": "phase-8-complete",

  "metadata": { /* standard metadata */ },

  "constants_table": [
    {
      "constant": "RESPONSE_BUDGET_MS",
      "value": 500,
      "units": "ms",
      "estimate_final": "Estimate",
      "date_update": "2026-04-19",
      "final_date": "",
      "source": "LLM proposed initial value; consistent with common web-UX latency guidance and assess-software-performance KB.",
      "owned_by": "Engineering Lead",
      "notes": "Applies to synchronous user-facing endpoints at P95. Referenced by UC01.R01, UC02.R08, UC03.R02.",
      "math_derivation": {
        "formula": "P95 latency budget for synchronous user-facing request (heuristic: 200–500 ms range)",
        "source": "api-design-sys-design-kb.md",
        "inputs": { "percentile": "P95", "path": "sync user-facing" }
      },
      "software_arch_decision": {
        "ref": "api_design",
        "choice": "sync p95 budget (upper bound of recommended 200–500 ms band)"
      },
      "referenced_by": ["UC01.R01", "UC02.R08", "UC03.R02"],
      "needs_user_input": true
    },
    {
      "constant": "AVAILABILITY_TARGET",
      "value": 99.9,
      "units": "percent",
      "estimate_final": "Estimate",
      "date_update": "2026-04-19",
      "final_date": "",
      "source": "LLM proposed initial value; typical three-nines target for B2C software.",
      "owned_by": "Engineering Lead",
      "notes": "Measured over SLO_WINDOW. Excludes scheduled maintenance windows. Referenced by UC02.R09. System-level target composed across 3 serial services implies ≈99.967% per component.",
      "math_derivation": {
        "formula": "A_total = A_1 × A_2 × A_3  (serial chain); back-solved per-component A ≈ A_total^(1/n)",
        "source": "inline §Availability-nines formula; resilliency-patterns-kb.md",
        "inputs": { "A_total": 0.999, "n_serial": 3, "A_component_implied": 0.99967, "monthly_budget_min_30d": 43.2 }
      },
      "software_arch_decision": {
        "ref": "resiliency",
        "choice": "three-nines monthly SLO, serial"
      },
      "referenced_by": ["UC02.R09"],
      "needs_user_input": true
    },
    {
      "constant": "READ_CONSISTENCY_MODE",
      "value": "eventual",
      "units": "enum:strong|eventual",
      "estimate_final": "Estimate",
      "date_update": "2026-04-21",
      "final_date": "",
      "source": "LLM proposed; cap_theorem.md — AP favored for social-feed / profile / catalog reads where stale reads are tolerable for seconds.",
      "owned_by": "Engineering Lead",
      "notes": "Applies to profile and catalog reads (UC03.R04, UC05.R02). Write-side consistency (checkout/inventory) is governed by a separate constant, CHECKOUT_CONSISTENCY_MODE = strong.",
      "math_derivation": {
        "formula": "CAP decision — during a partition, choose C or A. Stale-read tolerance window Δt ≤ replication_lag_p99 decides whether AP is safe.",
        "source": "cap_theorem.md",
        "inputs": { "partition_choice": "AP", "stale_read_tolerance_sec": 5 }
      },
      "software_arch_decision": {
        "ref": "cap_theorem",
        "choice": "AP"
      },
      "referenced_by": ["UC03.R04", "UC05.R02"],
      "needs_user_input": true
    },
    {
      "constant": "SLO_WINDOW",
      "value": "calendar month",
      "units": "text",
      "estimate_final": "Estimate",
      "date_update": "2026-04-19",
      "final_date": "",
      "source": "LLM proposed; common SLO reporting cadence.",
      "owned_by": "Engineering Lead",
      "notes": "Window over which AVAILABILITY_TARGET is measured.",
      "math_derivation": {
        "formula": "text-valued convention; citation-only",
        "source": "resilliency-patterns-kb.md (common SLO reporting cadence)",
        "inputs": {}
      },
      "software_arch_decision": {
        "ref": "resiliency",
        "choice": "calendar-month SLO window"
      },
      "referenced_by": ["UC02.R09"],
      "needs_user_input": true
    },
    {
      "constant": "MAX_PAYMENT_RETRIES",
      "value": 3,
      "units": "count",
      "estimate_final": "Estimate",
      "date_update": "2026-04-19",
      "final_date": "",
      "source": "LLM proposed; resiliency-patterns-kb.md suggests 3 retries with exponential backoff as a common default for idempotent payment operations.",
      "owned_by": "Engineering Lead",
      "notes": "Applies only to transient (retryable) failures, not authorization declines.",
      "math_derivation": {
        "formula": "effective_failure_rate ≈ p_transient ^ (MAX_PAYMENT_RETRIES + 1) assuming independent retries with exponential backoff",
        "source": "resilliency-patterns-kb.md",
        "inputs": { "pattern": "exponential-backoff", "retryable_class": "transient" }
      },
      "software_arch_decision": {
        "ref": "resiliency",
        "choice": "exponential-backoff, 3 retries, idempotent only"
      },
      "referenced_by": ["UC01.R10"],
      "needs_user_input": true
    }
  ],

  "conflicts_detected": [
    {
      "concept": "response latency",
      "constants": ["RESPONSE_BUDGET_MS", "BATCH_RESPONSE_BUDGET_MS"],
      "question": "Confirm these are intentionally different: RESPONSE_BUDGET_MS = 500 (user-facing) vs BATCH_RESPONSE_BUDGET_MS = 2000 (batch ops)."
    }
  ],

  "summary": {
    "total_constants": 15,
    "needs_user_input_count": 15,
    "conflicts_count": 1
  }
}
```

> `referenced_by`, `needs_user_input`, `conflicts_detected`, `summary` are LLM-internal metadata; the marshaller drops them. Columns A–I of the xlsx get only the 9 schema fields (`constant`, `value`, `units`, `estimate_final`, `date_update`, `final_date`, `source`, `owned_by`, `notes`).

## Software-system translation notes

Common software constants with heuristic starting values (use these when you must propose something):

| Constant pattern | Typical starting value | Source KB |
|------------------|------------------------|-----------|
| `RESPONSE_BUDGET_MS` (user-facing sync) | 200–500 ms at P95 | `software_architecture_system.md`, `api-design-sys-design-kb.md` |
| `RESPONSE_BUDGET_MS` (internal service-to-service) | 50–200 ms at P95 | `api-design-sys-design-kb.md` |
| `BATCH_RESPONSE_BUDGET_MS` | 1–5 seconds | `message-queues-kb.md` |
| `AVAILABILITY_TARGET` (consumer web) | 99.9% (three nines) | `software_architecture_system.md` |
| `AVAILABILITY_TARGET` (enterprise SaaS) | 99.95%–99.99% | `software_architecture_system.md` |
| `SLO_WINDOW` | 1 calendar month | `software_architecture_system.md` |
| `SESSION_TTL_MIN` | 30 min (interactive) to 8 hr (stay-logged-in) | `caching-system-design-kb.md`, `api-design-sys-design-kb.md` |
| `MAX_RETRIES` (idempotent) | 3 with exponential backoff | `resilliency-patterns-kb.md` |
| `MAX_RETRIES` (non-idempotent) | 1 (just alert) or 0 | `resilliency-patterns-kb.md` |
| `CIRCUIT_BREAKER_THRESHOLD` | 50% failure rate over 10 calls | `resilliency-patterns-kb.md` |
| `CACHE_TTL_SEC` (hot data) | 60–300 sec | `caching-system-design-kb.md` |
| `CACHE_TTL_SEC` (cold data) | 3600+ sec | `caching-system-design-kb.md` |
| `MAX_REQUEST_SIZE_BYTES` | 1 MB (API) to 100 MB (file upload) | `api-design-sys-design-kb.md` |
| `RATE_LIMIT_PER_MIN` | 60–600 per user | `api-design-sys-design-kb.md` |
| `RETENTION_DAYS` (operational logs) | 30–90 days | `observability-kb.md` |
| `RETENTION_DAYS` (audit logs, compliance) | 365–2555 days (1–7 years) | `observability-kb.md` |
| `PEAK_CONCURRENT_USERS` | (project-specific — ask user) | `load-balancing-kb.md` |
| `MAX_PAYLOAD_STALENESS_SEC` | 5–60 sec for dashboards | `caching-system-design-kb.md` |

**These are starting points, not answers.** Always mark `estimate_final: "Estimate"` and `needs_user_input: true`.

### Update requirements to reference constants

After Phase 8, go back and update `requirements_table.json`'s `requirement` text to use constant names consistently. If during extraction a requirement said "within 500 ms" and Phase 8 introduced `RESPONSE_BUDGET_MS`, the requirement should now read "within RESPONSE_BUDGET_MS". This creates the reference.

## STOP GAP — Checkpoint 1

Present `constants_table.json` and ask:

1. "I've defined **[N]** constants, all marked `Estimate`. Here they are with proposed values: **[compact table]**."
2. "For each one, please either (a) approve the proposed value, (b) give me the real value, or (c) tell me you want to defer and keep as-is."
3. "Any constant that should be marked `Final` today?"
4. "Conflict review: **[list any conflicts detected]**. Confirm resolutions."
5. "Proceed to Phase 9 (Delve and Fix)?"

> **STOP:** Do not proceed until the user has acted on every constant. A constant left unspecified produces a requirement no one can verify.

## Output Artifact

`constants_table.json` + a re-emitted `requirements_table.json` where inline literals have been replaced with constant references.

## Handoff to Next Phase

Phase 9 applies the "delving" discipline from Step 9 of the UCBD Checklist — asking "what else must the system do that I haven't written down?" and adding missed requirements.

---

**Next →** [Phase 9: Delve and Fix](12-Phase-9-Delve-and-Fix.md) | **Back:** [Phase 7](10-Phase-7-Requirements-Rules-Audit.md)
