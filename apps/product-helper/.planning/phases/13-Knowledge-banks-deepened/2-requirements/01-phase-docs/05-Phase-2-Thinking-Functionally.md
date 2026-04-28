---
schema: phase-file.v1
phase_slug: phase-2-thinking-functionally
module: 2
artifact_key: module_2/phase-2-thinking-functionally
engine_story: m2-requirements
engine_path: apps/product-helper/.planning/engines/m2-requirements.json
fail_closed_audit: plans/v22-outputs/te1/fail-closed-audit.md#module-2-requirements
fail_closed_registry: apps/product-helper/lib/langchain/engines/fail-closed-runner.ts
kb_chunk_refs: []
legacy_snapshot: apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_legacy_2026-04-26/2-requirements/01-phase-docs/05-Phase-2-Thinking-Functionally.md
rewritten_at: 2026-04-27
rewritten_by: kb-rewrite (Wave-E γ-shape, EC-V21-E.9)
---
# Phase 2: Thinking Functionally

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
- **Decisions consumed by this phase:** see `decisions[]` in the engine.json keyed on `target_field` containing `phase-2-thinking-functionally` or by manual mapping in the story tree.

> Predicates are NOT inlined here. The engine.json is the source of truth; this markdown points at it.

## §3 Fallback rules

When no predicate in §2 matches:

1. `searchKB` retrieves top-3 chunks scoped to `{module: 2, phase: phase-2-thinking-functionally}` (post-G8/G9 ingest).
2. If `searchKB` confidence < 0.90 OR returns zero chunks → `surfaceGap` emits `needs_user_input` to `system-question-bridge.ts` with computed_options + math_trace.
3. User answer re-enters the loop at ContextResolver.

> Fallback contract is shared across all phase files. Per-phase override (if any) is documented in the educational body below.

## §4 STOP-GAP rules (machine-readable)

- **artifact_key:** `module_2/phase-2-thinking-functionally`
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
- **Runtime retrieval:** `searchKB(query, top_k, { module: 2, phase: 'phase-2-thinking-functionally' })` over the `kb_chunks` table (`0011a_kb_chunks.sql`, ivfflat lists=100; HNSW upgrade gated on `>10k` rows).
- **Provenance:** every retrieved chunk carries `{kb_source, chunk_hash, content, embedding_distance}`; rendered by `why-this-value-panel.tsx` (`provenance-ui` agent).

> The `kb_chunk_refs` array in frontmatter is left empty until the embedder backfills it. The runtime path does not depend on the static array — it queries the live table.

---

## Educational content (legacy, preserved)

> The body below is the pre-Wave-E text verbatim. It documents *why* this phase exists, the systems-engineering theory behind the prescribed steps, and the example-driven walkthroughs the LLM (and human readers) consume. The 6 sections above are the schema-first overlay locked by Wave-E γ-shape.

> Corresponds to the "Describing Your System Functionally" and "Writing Good Requirements" lessons of CESYS522.

## Knowledge

This phase produces **no file**. It is a **calibration phase** — you internalize the functional-description discipline before writing a single system statement. Skipping this phase guarantees structural requirements leak into your UCBDs and Phase 7's audit will bounce your work back.

### The core discipline (Professor Schneider, quoted)

> "When we say a car is going to drive, you could say that's something a car does. Well, it's actually meaning the function of providing transportation. So you don't say 'a car drives,' you say 'a car performs a transportation function.' Similarly, a refrigerator doesn't cool food, it maintains an environment that prevents food spoilage. That's the function it provides."

### Why this matters

Functional description **opens the solution space**. Structural description **closes it prematurely**.

- "The system shall use a PostgreSQL database" → forbids Dynamo, SQLite, S3-as-DB, etc. — even if one of them better fits the problem.
- "The system shall persist order records durably for 7 years" → any solution meeting the behavior is valid.

The second form lets your team's talent find the best solution. The first form makes you the bottleneck — you've pre-decided for everyone.

### The Test

For every system statement, ask:

1. **Is a specific component / technology / method named?** If yes → structural.
2. **Would swapping the implementation change the truth of the statement?** If yes → structural.
3. **Does the statement describe observable behavior with a pass/fail test?** If yes → functional.

### Translation Examples (memorize the pattern)

| Structural (wrong) | Functional (right) |
|--------------------|---------------------|
| The system shall use OAuth 2.0 for login. | The system shall verify the customer's identity using a cryptographically-signed token before granting session access. |
| The system shall send confirmation via SendGrid. | The system shall deliver an order-confirmation message to the customer's registered contact within `CONFIRMATION_DELIVERY_SLA`. |
| The system shall use a PostgreSQL database. | The system shall persist order records and retrieve any order by its identifier within `LOOKUP_BUDGET_MS`. |
| The system shall cache product images in a CDN. | The system shall serve product images such that 95% of requests complete within `IMAGE_LATENCY_P95_MS`. |
| The system shall run on AWS. | *(Keep as structural ONLY if it flowed down from Module 1 as a hard constraint — otherwise rewrite.)* |
| The system shall have a React frontend. | The system shall present the checkout flow on a browser-rendered interface without page reload between steps. |
| The system shall use Redis for sessions. | The system shall preserve customer session state for `SESSION_TTL_MIN` across browser tab changes. |
| The system shall retry failed API calls 3 times. | The system shall re-attempt a failed payment authorization up to `MAX_PAYMENT_RETRIES` times before surfacing the failure to the customer. |

### When structural language is OK

Only when it flowed down from Module 1 as a **hard constraint** in `system_context_summary.hard_constraints`. Example: if Module 1 says "must deploy on AWS" (business reason: existing contract), then "The system shall deploy on AWS" is a valid requirement. It's not *you* making the implementation choice — you're transcribing one.

### The "What function does it provide?" drill

When tempted to write a structural requirement, run this drill:

1. Write the structural version (e.g., "The system shall use OAuth").
2. Ask: "What does OAuth *provide*?" → identity verification.
3. Ask: "Under what conditions?" → before granting access to protected resources.
4. Ask: "How is it verifiable?" → a test can attempt unauthenticated access and confirm refusal.
5. Rewrite: "The system shall verify the customer's identity before granting access to [resources]."

## Software-system translation notes

For software systems, the drill is especially tricky because **libraries, frameworks, and protocols are often baked into the engineering conversation**. Watch for these common structural slips and know the functional rewrite pattern:

| Structural trap | Functional pattern | Consult |
|-----------------|---------------------|---------|
| Names a specific protocol (REST, gRPC, WebSocket) | Describe the *interaction semantics*: sync/async, request/response, streaming | `api-design-sys-design-kb.md` |
| Names a specific DB (Postgres, Dynamo) | Describe durability, query latency, consistency needs | `data-model-kb.md`, `cap_theorem.md` |
| Names a specific queue (SQS, Kafka, RabbitMQ) | Describe delivery guarantees, ordering, retry behavior | `message-queues-kb.md` |
| Names a specific cache (Redis, Memcached) | Describe latency budget, staleness tolerance, eviction behavior | `caching-system-design-kb.md` |
| Names a specific auth provider (Auth0, Cognito) | Describe identity-verification behavior | `api-design-sys-design-kb.md` |
| Names a specific CDN (CloudFront, Cloudflare) | Describe geographic latency, static-asset serving | `cdn-networking-kb.md` |
| Names a specific monitoring stack (Datadog, NewRelic) | Describe what must be observable and alertable | `observability-kb.md` |
| Names a specific retry library | Describe retry semantics, backoff shape, circuit-break conditions | `resilliency-patterns-kb.md` |

## Instructions for the LLM

No JSON output. You must:

1. Read the translation examples above twice.
2. Mentally rehearse: for any system action, your default phrasing is `The system shall [verb] [object] [condition/quantifier]`.
3. Confirm to the user: "I have internalized the functional-vs-structural discipline. I will not write implementation choices into requirements unless they flow down from Module 1 hard constraints, in which case I will cite the specific Module 1 line."

## STOP GAP — Checkpoint 1

Ask the user:

1. "Here are the hard constraints from Module 1 that I will treat as structural-but-allowed: **[list from `hard_constraints`]**. Confirm this list is complete."
2. "Everything not on this list will be written functionally. Confirm."
3. "Proceed to Phase 3 (UCBD Setup)?"

> **STOP:** Do not proceed until user confirms. This phase's value is *the user's acknowledgement* — you're preventing them from being surprised later when you rewrite their structural phrasings.

## Output Artifact

None. This is a knowledge-phase checkpoint.

## Handoff to Next Phase

Phase 3 starts the per-UCBD loop. You will build one UCBD at a time for each use case selected in Phase 1.

---

**Next →** [Phase 3: UCBD Setup](06-Phase-3-UCBD-Setup.md) | **Back:** [Phase 1](04-Phase-1-Prioritize-Use-Cases.md)

