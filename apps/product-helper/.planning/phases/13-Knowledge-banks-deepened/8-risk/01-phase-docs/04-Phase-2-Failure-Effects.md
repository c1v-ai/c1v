---
schema: phase-file.v1
phase_slug: phase-2-failure-effects
module: 8
artifact_key: module_8/phase-2-failure-effects
engine_story: m8-fmea-residual
engine_path: apps/product-helper/.planning/engines/m8-fmea-residual.json
fail_closed_audit: plans/v22-outputs/te1/fail-closed-audit.md#module-8-risk
fail_closed_registry: apps/product-helper/lib/langchain/engines/fail-closed-runner.ts
kb_chunk_refs: []
legacy_snapshot: apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_legacy_2026-04-26/8-risk/01-phase-docs/04-Phase-2-Failure-Effects.md
rewritten_at: 2026-04-27
rewritten_by: kb-rewrite (Wave-E γ-shape, EC-V21-E.9)
---
# Phase 2: Failure Effects Documentation

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
- **Decisions consumed by this phase:** see `decisions[]` in the engine.json keyed on `target_field` containing `phase-2-failure-effects` or by manual mapping in the story tree.

> Predicates are NOT inlined here. The engine.json is the source of truth; this markdown points at it.

## §3 Fallback rules

When no predicate in §2 matches:

1. `searchKB` retrieves top-3 chunks scoped to `{module: 8, phase: phase-2-failure-effects}` (post-G8/G9 ingest).
2. If `searchKB` confidence < 0.90 OR returns zero chunks → `surfaceGap` emits `needs_user_input` to `system-question-bridge.ts` with computed_options + math_trace.
3. User answer re-enters the loop at ContextResolver.

> Fallback contract is shared across all phase files. Per-phase override (if any) is documented in the educational body below.

## §4 STOP-GAP rules (machine-readable)

- **artifact_key:** `module_8/phase-2-failure-effects`
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
- **Runtime retrieval:** `searchKB(query, top_k, { module: 8, phase: 'phase-2-failure-effects' })` over the `kb_chunks` table (`0011a_kb_chunks.sql`, ivfflat lists=100; HNSW upgrade gated on `>10k` rows).
- **Provenance:** every retrieved chunk carries `{kb_source, chunk_hash, content, embedding_distance}`; rendered by `why-this-value-panel.tsx` (`provenance-ui` agent).

> The `kb_chunk_refs` array in frontmatter is left empty until the embedder backfills it. The runtime path does not depend on the static array — it queries the live table.

---

## Educational content (legacy, preserved)

> The body below is the pre-Wave-E text verbatim. It documents *why* this phase exists, the systems-engineering theory behind the prescribed steps, and the example-driven walkthroughs the LLM (and human readers) consume. The 6 sections above are the schema-first overlay locked by Wave-E γ-shape.

## Knowledge

For each failure mode, determine the **effects** -- the consequences that would result if this failure actually occurred. Effects answer the question:

> "Because of this failure, what goals, use cases, requirements, or performance metrics are affected, and in what way?"

### Types of effects to consider:
- **Performance loss** -- degraded system output, reduced accuracy, slower response
- **Budget / cost impact** -- additional costs incurred due to the failure
- **Schedule delays** -- time lost, missed deadlines
- **Equipment / parts damage** -- physical damage to the system or related hardware
- **Human harm** -- injury risk to operators, users, or bystanders
- **Cascading consequences** -- ripple effects through the system (especially for component-level FMEAs)
- **Requirement violations** -- "project/mission failure" if a hard requirement can no longer be met

### Cascading effects pattern (service-level):
Trace the failure through the system to its end-user and business impact. Example from the Payment Service:
1. Stripe API call times out after 500ms →
2. Payment Service returns error to Order Service →
3. Order Service leaves order in "pending" state →
4. Customer sees "processing" spinner indefinitely →
5. Customer refreshes and retries checkout → potential double charge →
6. **Customer is charged twice, receives no confirmation, calls support** (end-user impact) →
7. **Refund required, chargeback fees incurred, trust permanently damaged** (business impact)

See [Resiliency Patterns KB](resilliency-patterns-kb.md) for how circuit breakers and retry policies interrupt this cascade, and [API Design KB](api-design-sys-design-kb.md) for how idempotency keys prevent double-charging.

### Key rules:
- Each failure mode can have **multiple effects** -- list them all
- Effects can optionally be broken into separate rows, but this is not required at this stage
- Include effects at all levels: local (component), system, and mission/project level
- The more complete the effects list, the better you can assess severity later

### Example (E-Commerce Platform — effects spanning multiple system layers):

| Failure Mode | Failure Effects |
|---|---|
| Failed to process payment | Order stuck in pending state, customer uncertain if charged, potential duplicate checkout attempt, manual refund required, support escalation, chargeback fees if unresolved |
| Platform unresponsive during traffic spike | Complete revenue loss during outage (~$X/minute depending on traffic), SLA violation triggering contractual penalties, negative social media coverage, customer loss to competitors. See [Load Balancing KB](load-balancing-kb.md) |
| CDN serves stale content | Incorrect prices displayed → customer anger at checkout when real price is higher, out-of-stock items appear purchasable → orders that cannot be fulfilled, inventory mismatch across channels. See [Caching KB](caching-system-design-kb.md) |
| Deployment introduces regression | Previously working feature breaks in production, rollback required (downtime during rollback), developer time spent debugging instead of building features, customer-facing impact if regression hits checkout or search. See [Deployment & CI/CD KB](deployment-release-cicd-kb.md) |

## Input Required

- Confirmed failure modes table from Phase 1

## Instructions for the LLM

1. For each failure mode, ask: "If this failure occurred, what would happen next?"
2. Trace the chain of consequences to the end-user or project-level impact.
3. Consider all effect types listed in the knowledge section above.
4. Write effects as concise but complete descriptions. Multiple effects for one failure mode should be separated by commas or listed explicitly.
5. Add the Failure Effects column to the existing table.

## Output Format

Extend the table from Phase 1:

```markdown
| Subsystem | Failure Mode | Failure Effects |
|-----------|-------------|----------------|
| [Subsystem 1] | [Failure mode 1a] | [Effect 1, Effect 2, ...] |
| [Subsystem 1] | [Failure mode 1b] | [Effect 1, Effect 2, ...] |
| ... | ... | ... |
```

---

## STOP GAP -- Checkpoint 2

**Present the updated table to the user and ask:**

> "Here are the failure effects for each failure mode. Please review:
> 1. Do the effects capture the full downstream impact on the system and end users?
> 2. Are there any cascading consequences I have missed?
> 3. Are there any effects listed that seem inaccurate or unlikely?
>
> Confirm this is complete before I proceed to Phase 3 (Possible Causes)."

**Do NOT proceed until the user confirms.**

