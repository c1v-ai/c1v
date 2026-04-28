---
schema: phase-file.v1
phase_slug: phase-5-ucbd-step-flow
module: 2
artifact_key: module_2/phase-5-ucbd-step-flow
engine_story: m2-requirements
engine_path: apps/product-helper/.planning/engines/m2-requirements.json
fail_closed_audit: plans/v22-outputs/te1/fail-closed-audit.md#module-2-requirements
fail_closed_registry: apps/product-helper/lib/langchain/engines/fail-closed-runner.ts
kb_chunk_refs: []
legacy_snapshot: apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_legacy_2026-04-26/2-requirements/01-phase-docs/08-Phase-5-UCBD-Step-Flow.md
rewritten_at: 2026-04-27
rewritten_by: kb-rewrite (Wave-E γ-shape, EC-V21-E.9)
---
# Phase 5: UCBD Step Flow

## §1 Decision context

This phase contributes to **m2-requirements** decisions. Runtime resolution flows through:

1. ContextResolver loads upstream artifacts + intake state.
2. NFREngineInterpreter evaluates predicates from `apps/product-helper/.planning/engines/m2-requirements.json` against EvalContext.
3. On match → auto-fill (clamped to `auto_fill_threshold`); on no match → fallback (§3); on still-no-match → STOP-GAP gate (§4) blocks proceed.

The legacy educational body (preserved in this file under the "Educational content" footer) explains *why* this phase exists. The runtime *what* lives in the engine.json + fail-closed registry referenced below.

## §2 Predicates (engine.json reference)

- **Engine story:** `m2-requirements` (`apps/product-helper/.planning/engines/m2-requirements.json`)
- **Predicate DSL evaluator:** `apps/product-helper/lib/langchain/engines/predicate-dsl.ts`
- **Story-tree schema:** `apps/product-helper/lib/langchain/schemas/engines/story-tree.ts`
- **Decisions consumed by this phase:** see `decisions[]` in the engine.json keyed on `target_field` containing `phase-5-ucbd-step-flow` or by manual mapping in the story tree.

> Predicates are NOT inlined here. The engine.json is the source of truth; this markdown points at it.

## §3 Fallback rules

When no predicate in §2 matches:

1. `searchKB` retrieves top-3 chunks scoped to `{module: 2, phase: phase-5-ucbd-step-flow}` (post-G8/G9 ingest).
2. If `searchKB` confidence < 0.90 OR returns zero chunks → `surfaceGap` emits `needs_user_input` to `system-question-bridge.ts` with computed_options + math_trace.
3. User answer re-enters the loop at ContextResolver.

> Fallback contract is shared across all phase files. Per-phase override (if any) is documented in the educational body below.

## §4 STOP-GAP rules (machine-readable)

- **artifact_key:** `module_2/phase-5-ucbd-step-flow`
- **registry:** `apps/product-helper/lib/langchain/engines/fail-closed-runner.ts` (`buildFailClosedRegistry`)
- **schema:** `apps/product-helper/lib/langchain/schemas/engines/fail-closed.ts` (`failClosedRuleSetSchema`)
- **audit doc (rule sources + severity):** [plans/v22-outputs/te1/fail-closed-audit.md](../../../../../../plans/v22-outputs/te1/fail-closed-audit.md#module-2-requirements)

The STOP-GAP / Validation-Checklist text in the legacy educational body below has been audited by `engine-fail-closed` and converted into machine-readable rules registered under the `artifact_key` above. The runner default-FAILs if the artifact_key is queried with no rule set registered (conservative).

> Default severity is `error` (proceed-blocking). Only items phrased "advisory" / "soft check" / "warning" / "will NOT fail" are downgraded to `warn`.

## §5 Math derivation

This phase's quantitative outputs (if any) carry `mathDerivationSchema` (or `mathDerivationMatrixSchema` for M5 sites per TC1 `tc1-wave-c-complete`). Each derivation:

- references inputs by `source` (upstream artifact + field path);
- carries `formula` (LaTeX-safe ASCII) + `units` + `computed_value`;
- attaches `base_confidence` + `confidence_modifiers` consumed by NFREngineInterpreter step 6.

> Per-decision math traces are emitted into `decision_audit` (`0011b_decision_audit.sql`) on every Scoring pass per EC-V21-E.3 (audit-writer agent).

## §6 References (KB chunk IDs)

- **Frontmatter `kb_chunk_refs`:** populated by the embedding pipeline (`engine-pgvector` agent, G8/G9 — `apps/product-helper/lib/langchain/engines/kb-embedder.ts`).
- **Runtime retrieval:** `searchKB(query, top_k, { module: 2, phase: 'phase-5-ucbd-step-flow' })` over the `kb_chunks` table (`0011a_kb_chunks.sql`, ivfflat lists=100; HNSW upgrade gated on `>10k` rows).
- **Provenance:** every retrieved chunk carries `{kb_source, chunk_hash, content, embedding_distance}`; rendered by `why-this-value-panel.tsx` (`provenance-ui` agent).

> The `kb_chunk_refs` array in frontmatter is left empty until the embedder backfills it. The runtime path does not depend on the static array — it queries the live table.

---

## Educational content (legacy, preserved)

> The body below is the pre-Wave-E text verbatim. It documents *why* this phase exists, the systems-engineering theory behind the prescribed steps, and the example-driven walkthroughs the LLM (and human readers) consume. The 6 sections above are the schema-first overlay locked by Wave-E γ-shape.

> Corresponds to Steps 6 and 7 of the UCBD Checklist.

This is the highest-leverage phase in Module 2. The quality of your functional requirements depends directly on the quality of the step flow you produce here.

## Knowledge

You are now filling the `actor_steps_table` — the body of the UCBD. Each row is one step. Each row has exactly one populated cell (the acting actor's column); the others are blank.

### The flow discipline

You are tracing a path from the initial conditions to the ending conditions. Each step is a single action. Informal for non-system actors; **formal** for the system.

| Actor type | Phrasing style | Example |
|------------|----------------|---------|
| Primary actor (column A) | Informal present tense | "Customer submits payment information." |
| The System (column B) | Formal `shall` statement | "The system shall validate payment credentials against the payment gateway." |
| Other actors (columns C, D) | Informal present tense | "Payment gateway returns authorization code." |

**Why informal for actors and formal for the system:** The *system* is what you control and what you're specifying. Other actors are external — you observe what they do, you don't mandate it. Mandating an external actor's behavior is meaningless (you can't enforce it).

### The "one column per row" rule

Every step row has exactly one non-empty cell. Two populated cells = two steps. Split them.

Bad (two populated cells in one row):
```
A: Customer submits payment    |  B: The system shall validate.  |  C:  |  D:
```

Good (two rows):
```
A: Customer submits payment.  |  B:                                  |  C:  |  D:
A:                              |  B: The system shall validate.    |  C:  |  D:
```

### The step naturalization discipline

When writing system steps, run the functional-test from Phase 2 on *every* cell:

1. Does this describe *what* must happen, or *how* it's implemented?
2. Could a reviewer verify this without knowing the implementation?
3. Is there a specific component/library/technology named? If yes, rewrite.

### Trigger actions

Most use cases start with a trigger from the primary actor:

> "Often, but not always, the use case begins with some kind of a trigger action that will cause your system to do something." — course

The first non-empty row is usually column A (primary actor) firing the trigger. Then column B responds. Alternate as the use case unfolds.

### Decisions and branches

A UCBD is linear — it does not natively express decisions. Two techniques:

1. **Happy path only.** Document the main success flow in this UCBD. Alternate flows (errors, branches) get their own UCBDs. This is the course's default.
2. **Inline branches with notes.** If a minor branch fits, write the branch step + a note: "Note N: if [condition], system performs [alt step]; otherwise continues."

Complex branching (many decision points) → split into multiple UCBDs, one per variant. A UCBD for 50 steps because of nested branching is unreadable.

### When the system talks to another actor

System-to-other-actor interactions produce **two rows**, not one:

```
A:  |  B: The system shall submit an authorization request to the payment gateway.  |  C:  |  D:
A:  |  B:                                                                            |  C: Payment gateway returns authorization response.  |  D:
```

The first row is a system `shall` (what you control). The second row is the other actor's informal response (what you observe).

### Template bounds (from schema)

- `actor_steps_table`: **16 rows** (26–41).
- If you need more, emit `_insertions.actor_steps_table.insert_above_row = 42, rows_to_add = N`.
- Typical use case: 8–14 steps. Going over 16 often means:
  - You're too granular — merge micro-steps.
  - Or the use case should be split.
  - Or there's a branch you should extract into a second UCBD.

## Input Required

- The Phase-4 output UCBD JSON (columns + conditions populated, steps empty)
- The use case flow in the user's head (or in Module 1 docs)

## Instructions for the LLM

1. **State the path.** Start: `initial_conditions`. End: `ending_conditions`. You are drawing the shortest valid happy-path through them.
2. **Start with the trigger.** Row 1 is usually the primary actor firing the trigger.
3. **For each step, ask: which column?** Only one. If two actors do something "simultaneously", make two rows — computer time is not human time; the rows can be back-to-back.
4. **Write system steps formally.** Start every column-B cell with `"The system shall "`. Draft informally first if needed, then rewrite.
5. **Do NOT yet name every constant.** Write the measurable quantity inline for now (e.g., "within 500 ms"). Phase 8 will extract constants. Capturing the literal first lets Phase 8 see every literal in one pass.
6. **Do NOT yet assign requirement IDs.** Phase 6 extracts and IDs the requirements. Keep cells as plain sentences.
7. **Add notes as you go** for anything non-obvious: assumptions, out-of-scope branches, alternate flows deferred to other UCBDs.
8. **Stop when you reach the ending conditions.** Verify you've transitioned every initial condition into its corresponding ending condition.

## Output Format

```json
{
  "_schema": "UCBD_Template_and_Sample.schema.json",
  "_output_path": "<project>/module-2-requirements/ucbd/UC01-customer-checkout.ucbd.json",
  "_phase_status": "phase-5-complete",

  "metadata": { /* unchanged */ },
  "use_case_name": "Customer completes checkout",
  "_columns_plan": { /* unchanged */ },

  "initial_conditions": [ /* unchanged */ ],

  "actor_steps_table": [
    { "primary_actor": "Customer initiates checkout from cart.",  "the_system": "",                                                                                                "other_actors": "",                                                "extra_actor_col": "" },
    { "primary_actor": "",                                         "the_system": "The system shall display the checkout summary showing all cart items, subtotal, and estimated total within 500 ms of initiation.", "other_actors": "", "extra_actor_col": "" },
    { "primary_actor": "Customer confirms shipping address.",     "the_system": "",                                                                                                "other_actors": "",                                                "extra_actor_col": "" },
    { "primary_actor": "",                                         "the_system": "The system shall calculate shipping cost based on the confirmed address.",                        "other_actors": "",                                                "extra_actor_col": "" },
    { "primary_actor": "Customer submits payment information.",   "the_system": "",                                                                                                "other_actors": "",                                                "extra_actor_col": "" },
    { "primary_actor": "",                                         "the_system": "The system shall submit a payment authorization request to the Payment Gateway.",                 "other_actors": "",                                                "extra_actor_col": "" },
    { "primary_actor": "",                                         "the_system": "",                                                                                                "other_actors": "Payment Gateway returns an authorization response.", "extra_actor_col": "" },
    { "primary_actor": "",                                         "the_system": "The system shall persist the order record with a unique Order ID upon successful authorization.",  "other_actors": "",                                                "extra_actor_col": "" },
    { "primary_actor": "",                                         "the_system": "The system shall emit an order-fulfillment event to the fulfillment pipeline.",                    "other_actors": "",                                                "extra_actor_col": "" },
    { "primary_actor": "",                                         "the_system": "The system shall display an on-screen confirmation with the Order ID.",                           "other_actors": "",                                                "extra_actor_col": "" },
    { "primary_actor": "",                                         "the_system": "The system shall dispatch an order-confirmation message to the customer's registered contact.",    "other_actors": "Email Service accepts the message for delivery.", "extra_actor_col": "" }
  ],

  "ending_conditions": [ /* unchanged */ ],

  "notes": [
    "1. This UCBD covers only credit-card checkout...",
    "2. ...",
    "3. ...",
    "4. Ending condition #3 is transitional — it produces initial conditions for UC08.",
    "5. Failure path (payment declined) covered in UC01a-CheckoutPaymentDeclined.",
    "6. Step 7 (Payment Gateway response) and step 11 (Email Service accept) are observations, not system requirements — they document the external actor's behavior we rely on."
  ]
}
```

## Software-system translation notes

For software-system step flows, watch for these recurring patterns and use the indicated KBs for vocabulary:

| Pattern in the flow | Suggested phrasing | KB |
|---------------------|---------------------|-----|
| System sends to an external API | "The system shall submit a [purpose] request to [actor]." | `api-design-sys-design-kb.md` |
| System receives async completion | "The system shall process the acknowledgement from [actor] within [budget]." | `message-queues-kb.md`, `resilliency-patterns-kb.md` |
| System persists state | "The system shall persist [record] with [identifier scheme]." | `data-model-kb.md` |
| System reads state | "The system shall retrieve [record] by [identifier] within [latency budget]." | `data-model-kb.md`, `caching-system-design-kb.md` |
| System retries on transient failure | "The system shall re-attempt [action] up to MAX_RETRIES times with [backoff policy]." | `resilliency-patterns-kb.md` |
| System emits an event | "The system shall emit a [topic] event upon [trigger]." | `message-queues-kb.md` |
| System records an audit entry | "The system shall record an audit log entry capturing [actor], [action], [timestamp]." | `observability-kb.md` |
| System degrades gracefully | "The system shall continue to serve [reduced capability] when [dependency] is unavailable." | `resilliency-patterns-kb.md`, `cap_theorem.md` |

### Common software anti-patterns to catch now

- **"The system shall call API X"** → rewrite as what the call achieves. "call X" is a how; the *what* is what comes back.
- **"The system shall cache the response"** → rewrite as the latency budget / staleness tolerance. Caching is a how.
- **"The system shall log the error"** → rewrite as the audit/observability outcome. "log" is a how.
- **"The system shall return a 200 OK"** → status codes are implementation. Describe the semantic outcome instead.
- **"The system shall validate the input"** → too vague. Validate *what*, against *what criteria*, with *what failure behavior*?

## STOP GAP — Checkpoint 1

Present the populated UCBD JSON and ask:

1. "I've traced the flow in **[N]** steps from initial to ending conditions. Does the sequence make sense?"
2. "Every system step starts with 'The system shall'. Review the system statements for structural language I should rewrite functionally."
3. "Are there any missed steps? Especially: did I forget to emit an event, persist a state, or update an audit trail?"
4. "Does any step look too granular (merge) or too coarse (split)?"
5. "Are the alternate flows I deferred to other UCBDs captured in the notes?"
6. "Proceed to Phase 6 (Extract Requirements Table)?"

> **STOP:** Do not proceed until the user signs off on the flow. Once Phase 6 IDs the requirements, changing a step forces a renumber.

## Output Artifact

Fully populated `UCxx-<slug>.ucbd.json` for this use case. Ready for Phase 6 extraction.

## Handoff to Next Phase

Phase 6 pulls every column-B `shall` statement from this UCBD (and all others built in earlier iterations of Phase 3–5) into the master `requirements_table.json`.

> **Loop reminder:** If you have more selected use cases to build UCBDs for (from Phase 1), you may either:
> (a) Repeat Phases 3–5 for the next use case before running Phase 6 — recommended, so Phase 6 processes all UCBDs at once.
> (b) Run Phase 6 now on the single UCBD, then return to Phase 3 for the next. Requires re-running Phase 6 each iteration.
>
> Option (a) is the course's implicit model and is strongly preferred.

---

**Next →** [Phase 6: Extract Requirements Table](09-Phase-6-Extract-Requirements-Table.md) | **Back:** [Phase 4](07-Phase-4-Start-End-Conditions.md)

