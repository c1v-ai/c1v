---
schema: phase-file.v1
phase_slug: phase-5-corrective-actions
module: 8
artifact_key: module_8/phase-5-corrective-actions
engine_story: m8-fmea-residual
engine_path: apps/product-helper/.planning/engines/m8-fmea-residual.json
fail_closed_audit: plans/v22-outputs/te1/fail-closed-audit.md#module-8-risk
fail_closed_registry: apps/product-helper/lib/langchain/engines/fail-closed-runner.ts
kb_chunk_refs: []
legacy_snapshot: apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_legacy_2026-04-26/8-risk/01-phase-docs/07-Phase-5-Corrective-Actions.md
rewritten_at: 2026-04-27
rewritten_by: kb-rewrite (Wave-E γ-shape, EC-V21-E.9)
---
# Phase 5: Corrective Actions and Failure Mode Identifiers

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
- **Decisions consumed by this phase:** see `decisions[]` in the engine.json keyed on `target_field` containing `phase-5-corrective-actions` or by manual mapping in the story tree.

> Predicates are NOT inlined here. The engine.json is the source of truth; this markdown points at it.

## §3 Fallback rules

When no predicate in §2 matches:

1. `searchKB` retrieves top-3 chunks scoped to `{module: 8, phase: phase-5-corrective-actions}` (post-G8/G9 ingest).
2. If `searchKB` confidence < 0.90 OR returns zero chunks → `surfaceGap` emits `needs_user_input` to `system-question-bridge.ts` with computed_options + math_trace.
3. User answer re-enters the loop at ContextResolver.

> Fallback contract is shared across all phase files. Per-phase override (if any) is documented in the educational body below.

## §4 STOP-GAP rules (machine-readable)

- **artifact_key:** `module_8/phase-5-corrective-actions`
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
- **Runtime retrieval:** `searchKB(query, top_k, { module: 8, phase: 'phase-5-corrective-actions' })` over the `kb_chunks` table (`0011a_kb_chunks.sql`, ivfflat lists=100; HNSW upgrade gated on `>10k` rows).
- **Provenance:** every retrieved chunk carries `{kb_source, chunk_hash, content, embedding_distance}`; rendered by `why-this-value-panel.tsx` (`provenance-ui` agent).

> The `kb_chunk_refs` array in frontmatter is left empty until the embedder backfills it. The runtime path does not depend on the static array — it queries the live table.

---

## Educational content (legacy, preserved)

> The body below is the pre-Wave-E text verbatim. It documents *why* this phase exists, the systems-engineering theory behind the prescribed steps, and the example-driven walkthroughs the LLM (and human readers) consume. The 6 sections above are the schema-first overlay locked by Wave-E γ-shape.

## Knowledge

Corrective actions are steps taken to mitigate risk by reducing the severity, the likelihood, or both. This is where the FMEA transitions from analysis to action planning.

### Types of corrective actions:
1. **Architecture/design changes** -- modify the system to prevent the failure (e.g., add circuit breakers, implement retry with backoff, add redundant instances, introduce idempotency keys). See [Resiliency Patterns KB](resilliency-patterns-kb.md) and [API Design KB](api-design-sys-design-kb.md)
2. **Operational/process changes** -- change how the system is deployed and maintained (e.g., add canary deployments, enforce code review, implement runbooks, add load testing to release process). See [Deployment & CI/CD KB](deployment-release-cicd-kb.md)
3. **Project plan changes** -- adjust timelines, budgets, or resources (e.g., allocate sprint for performance hardening, budget for managed search service, hire SRE)
4. **Fallback/alternative plans** -- backup plans if the failure occurs despite prevention (e.g., "failover to secondary payment provider", "switch to read-only mode during outage", "queue emails for retry"). See [Message Queues KB](message-queues-kb.md)
5. **Severity reducers** -- actions that don't prevent the failure but limit its impact (e.g., graceful degradation — show cached search results when search service is down, display "order received" page even if email confirmation is delayed). See [Caching KB](caching-system-design-kb.md) and [Observability KB](observability-kb.md) for how monitoring enables fast detection and containment

### Prioritization rules:
- Address **HIGH risk** items first -- these MUST have corrective actions
- Address **MEDIUM HIGH risk** items next -- almost all should have corrective actions
- MEDIUM and lower risk items should be addressed if feasible, but are lower priority

### Writing style:
- Short phrases are acceptable in a spreadsheet format
- Can reference external documents: "Please see the timeline alternative Plan B"
- Multiple corrective actions per cause row are acceptable (list them together)

### Post-corrective-action severity review:
After writing corrective actions, revisit severity scores. Formalizing corrective actions sometimes reveals that the true cost/time/impact is different than initially estimated. Adjust severity if warranted.

### Failure Mode identifiers:
After completing corrective actions, assign a unique ID to each distinct failure mode:
- Format: **F.1**, **F.2**, **F.3**, etc.
- All cause rows sharing the same failure mode share the same F.# identifier
- This numbering enables traceability between corrective actions and specific failure modes

### Example (E-Commerce Platform — corrective actions across system layers):

| F.# | Possible Cause | Corrective Action | Action Type |
|---|---|---|---|
| F.1 | Stripe API timeout with no retry | Implement retry with exponential backoff (3 attempts, 1s/2s/4s). Add circuit breaker that opens after 5 consecutive failures. Add Stripe webhook listener as async fallback. See [Resiliency Patterns KB](resilliency-patterns-kb.md) | Architecture change |
| F.1 | Developer breaks Stripe integration | Add integration tests against Stripe test mode in CI pipeline. Block deploy if payment tests fail. Add API key rotation to deploy checklist. See [Deployment & CI/CD KB](deployment-release-cicd-kb.md) | Process change |
| F.2 | Missing idempotency key on checkout | Add UUID idempotency key to every checkout request. Payment Service rejects duplicates. Store processed keys in Redis with 24hr TTL. See [API Design KB](api-design-sys-design-kb.md) | Architecture change |
| F.6 | Auto-scaling threshold too high | Lower threshold from 80% to 60% CPU. Add predictive scaling before known peaks. Quarterly load test at 5x traffic. See [Load Balancing KB](load-balancing-kb.md) | Process change + architecture |
| F.6 | Database connection pool exhausted | Add PgBouncer connection pooler. Create read replicas for search queries. Alert at 75% pool utilization. See [Data Model KB](data-model-kb.md) | Architecture change |
| F.4 | CDN cache invalidation failure | Event-driven purge: price update → SNS → CloudFront invalidation. Reduce TTL on price-sensitive pages to 5min. See [Caching KB](caching-system-design-kb.md) | Architecture change |
| F.10 | Monitoring alerts misconfigured | Implement SLO-based alerting (error budget burn rate). Add synthetic monitoring — automated checkout every 5min. Weekly alert review. See [Observability KB](observability-kb.md) | Process change |
| F.8 | Insufficient test coverage | Enforce 85% coverage gate in CI. Add canary deployment — 5% traffic first, auto-rollback on error spike. See [Deployment & CI/CD KB](deployment-release-cicd-kb.md) | Process change + severity reducer |

## Input Required

- Confirmed FMEA table with Severity, Likelihood, RPN, and Risk Criticality from Phase 4

## Instructions for the LLM

1. Sort or group the table by Risk Criticality (HIGH first, then MEDIUM HIGH, etc.).
2. For each cause row rated HIGH or MEDIUM HIGH:
   - Propose at least one corrective action addressing the cause
   - Consider all five corrective action types listed above
   - Prefer actions that reduce likelihood (prevent the cause) over those that only reduce severity (limit the damage)
3. For MEDIUM risk items, propose corrective actions where feasible.
4. After writing all corrective actions, review: should any severity scores change?
5. Add the `Failure Mode #` column (F.1, F.2, ...) to the leftmost position. All cause rows sharing the same failure mode text get the same F.# identifier.

## Output Format

Add two columns to the table:

```markdown
| F.# | Subsystem | Failure Mode | Failure Effects | Possible Cause | Severity | Likelihood | RPN | Risk Criticality | Corrective Action |
|---|---|---|---|---|---|---|---|---|---|
| F.1 | ... | ... | ... | ... | ... | ... | ... | HIGH | [action(s)] |
| F.1 | ... | ... | ... | ... | ... | ... | ... | MEDIUM HIGH | [action(s)] |
| F.2 | ... | ... | ... | ... | ... | ... | ... | MEDIUM | [action(s) or "N/A - acceptable risk"] |
```

---

## STOP GAP -- Checkpoint 5

**Present the updated table to the user and ask:**

> "Here are the corrective actions for all HIGH and MEDIUM HIGH risk items, plus [N] additional MEDIUM risk items. Please review:
> 1. Are the corrective actions feasible given your project constraints (time, budget, resources)?
> 2. Are there better alternatives for any of these actions?
> 3. Should any severity scores be adjusted now that corrective actions are formalized?
> 4. Are the failure mode identifiers (F.1, F.2, ...) correctly grouped?
> 5. Are there any HIGH or MEDIUM HIGH risk items missing corrective actions?
>
> Confirm before I proceed to Phase 6 (Adjusted Ratings and Stoplight Charts)."

**Do NOT proceed until the user confirms.**

