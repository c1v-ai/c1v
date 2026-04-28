---
schema: phase-file.v1
phase_slug: phase-1-failure-modes
module: 8
artifact_key: module_8/phase-1-failure-modes
engine_story: m8-fmea-residual
engine_path: apps/product-helper/.planning/engines/m8-fmea-residual.json
fail_closed_audit: plans/v22-outputs/te1/fail-closed-audit.md#module-8-risk
fail_closed_registry: apps/product-helper/lib/langchain/engines/fail-closed-runner.ts
kb_chunk_refs: []
legacy_snapshot: apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_legacy_2026-04-26/8-risk/01-phase-docs/03-Phase-1-Failure-Modes.md
rewritten_at: 2026-04-27
rewritten_by: kb-rewrite (Wave-E γ-shape, EC-V21-E.9)
---
# Phase 1: Failure Mode Identification

## §1 Decision context

This phase contributes to **m8-fmea-residual** decisions. Runtime resolution flows through:

1. ContextResolver loads upstream artifacts + intake state.
2. NFREngineInterpreter evaluates predicates from `apps/product-helper/.planning/engines/m8-fmea-residual.json` against EvalContext.
3. On match → auto-fill (clamped to `auto_fill_threshold`); on no match → fallback (§3); on still-no-match → STOP-GAP gate (§4) blocks proceed.

The legacy educational body (preserved in this file under the "Educational content" footer) explains *why* this phase exists. The runtime *what* lives in the engine.json + fail-closed registry referenced below.

## §2 Predicates (engine.json reference)

- **Engine story:** `m8-fmea-residual` (`apps/product-helper/.planning/engines/m8-fmea-residual.json`)
- **Predicate DSL evaluator:** `apps/product-helper/lib/langchain/engines/predicate-dsl.ts`
- **Story-tree schema:** `apps/product-helper/lib/langchain/schemas/engines/story-tree.ts`
- **Decisions consumed by this phase:** see `decisions[]` in the engine.json keyed on `target_field` containing `phase-1-failure-modes` or by manual mapping in the story tree.

> Predicates are NOT inlined here. The engine.json is the source of truth; this markdown points at it.

## §3 Fallback rules

When no predicate in §2 matches:

1. `searchKB` retrieves top-3 chunks scoped to `{module: 8, phase: phase-1-failure-modes}` (post-G8/G9 ingest).
2. If `searchKB` confidence < 0.90 OR returns zero chunks → `surfaceGap` emits `needs_user_input` to `system-question-bridge.ts` with computed_options + math_trace.
3. User answer re-enters the loop at ContextResolver.

> Fallback contract is shared across all phase files. Per-phase override (if any) is documented in the educational body below.

## §4 STOP-GAP rules (machine-readable)

- **artifact_key:** `module_8/phase-1-failure-modes`
- **registry:** `apps/product-helper/lib/langchain/engines/fail-closed-runner.ts` (`buildFailClosedRegistry`)
- **schema:** `apps/product-helper/lib/langchain/schemas/engines/fail-closed.ts` (`failClosedRuleSetSchema`)
- **audit doc (rule sources + severity):** [plans/v22-outputs/te1/fail-closed-audit.md](../../../../../../plans/v22-outputs/te1/fail-closed-audit.md#module-8-risk)

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
- **Runtime retrieval:** `searchKB(query, top_k, { module: 8, phase: 'phase-1-failure-modes' })` over the `kb_chunks` table (`0011a_kb_chunks.sql`, ivfflat lists=100; HNSW upgrade gated on `>10k` rows).
- **Provenance:** every retrieved chunk carries `{kb_source, chunk_hash, content, embedding_distance}`; rendered by `why-this-value-panel.tsx` (`provenance-ui` agent).

> The `kb_chunk_refs` array in frontmatter is left empty until the embedder backfills it. The runtime path does not depend on the static array — it queries the live table.

---

## Educational content (legacy, preserved)

> The body below is the pre-Wave-E text verbatim. It documents *why* this phase exists, the systems-engineering theory behind the prescribed steps, and the example-driven walkthroughs the LLM (and human readers) consume. The 6 sections above are the schema-first overlay locked by Wave-E γ-shape.

## Knowledge

A **failure mode** is a loss or degradation of functionality -- NOT a description of what broke or what component failed. It describes what the system can no longer do or cannot do well.

### How to think about failure modes:
- "Unable to [function]"
- "Failure to [verb]" (e.g., failure to stop, failure to lock, failure to release)
- "Degraded [function]" (e.g., delayed release, reduced output)
- "Excessive [output]" (e.g., excessive energy transfer)
- "No [output] provided" (e.g., no signal provided)
- "Incorrect [output]" (e.g., reported value too high / too low)

### Where to brainstorm failure modes:
- **Functional requirements** -- each requirement is a function that could be lost
- **Use cases / operational flow diagrams** -- each step is a potential failure point
- **Interface definitions** -- failures commonly happen where subsystems exchange information, energy, or material
- **Performance targets** -- any target that could be missed is a potential failure mode

### What a failure mode is NOT:
- NOT a root cause ("the bolt sheared" is a cause, not a failure mode)
- NOT a specific broken component ("broken motor" is a cause, not a failure mode)
- NOT an effect ("bicycle goes too fast" is an effect, not a failure mode)

### Example (E-Commerce Platform — across multiple subsystems):

| Subsystem | Failure Mode | Why it qualifies | Related KB |
|---|---|---|---|
| Payment Service | Failed to process payment | Loss of function — the service cannot complete its primary task | [Resiliency Patterns KB](resilliency-patterns-kb.md) |
| Payment Service | Customer charged twice for same order | Excessive output — the function executes more than intended | [API Design KB](api-design-sys-design-kb.md) |
| Search Service | Search results not returned within 500ms | Degraded function — the service works but too slowly | [Data Model KB](data-model-kb.md) |
| Storefront Service | CDN serves stale or incorrect content | Incorrect output — content does not reflect current state | [Caching KB](caching-system-design-kb.md) |
| Order Service | Incorrect order total calculated | Incorrect output — the calculation is wrong | [API Design KB](api-design-sys-design-kb.md) |
| All Services | Platform unresponsive during traffic spike | Total loss of function — nothing works | [Load Balancing KB](load-balancing-kb.md) |
| Notification Service | Order confirmation email not sent | Loss of function — event not delivered | [Message Queues KB](message-queues-kb.md) |
| All Services | Deployment introduces regression | Degraded function — previously working feature breaks | [Deployment & CI/CD KB](deployment-release-cicd-kb.md) |
| Cart Service | Cart state lost mid-session | Loss of data — user's work is destroyed | [Caching KB](caching-system-design-kb.md) |
| All Services | Undetected performance degradation | Degraded function over time — no one notices until it is severe | [Observability KB](observability-kb.md) |

Notice: failures come from every layer of the system — payment processing, search performance, caching, load handling, message delivery, deployment processes, session management, and monitoring. A thorough FMEA covers all of them, not just the most obvious.

## Input Required

- Confirmed System Context Summary from Phase 0
- User should select which subsystem/component to start with (or LLM can suggest starting with the most critical one)

## Instructions for the LLM

1. Take the first subsystem/component from the confirmed list.
2. Review its function, interfaces, and the functional requirements it serves.
3. Brainstorm failure modes by systematically asking:
   - What if this subsystem cannot perform its primary function at all?
   - What if it performs the function but with degraded quality/accuracy?
   - What if it performs the function excessively or beyond acceptable bounds?
   - What if it performs the function at the wrong time (too early, too late, intermittent)?
   - What if it cannot properly interface with connected subsystems?
4. List each failure mode in the output table.
5. Repeat for each subsystem/component.

## Output Format

Build the first two columns of the FMEA table:

```markdown
| Subsystem | Failure Mode |
|-----------|-------------|
| [Subsystem 1] | [Failure mode 1a] |
| [Subsystem 1] | [Failure mode 1b] |
| [Subsystem 1] | [Failure mode 1c] |
| [Subsystem 2] | [Failure mode 2a] |
| ... | ... |
```

---

## STOP GAP -- Checkpoint 1

**Present the failure modes table to the user and ask:**

> "Here are the failure modes I have identified for each subsystem. Please review:
> 1. Are there failure modes missing for any subsystem?
> 2. Are any of these not actually failure modes (i.e., they describe a cause or an effect rather than a loss of functionality)?
> 3. Are there any additional subsystems that should be analyzed?
>
> Confirm this list is complete before I proceed to Phase 2 (Failure Effects)."

**Do NOT proceed until the user confirms.**

