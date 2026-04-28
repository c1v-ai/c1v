---
schema: phase-file.v1
phase_slug: phase-3-possible-causes
module: 8
artifact_key: module_8/phase-3-possible-causes
engine_story: m8-fmea-residual
engine_path: apps/product-helper/.planning/engines/m8-fmea-residual.json
fail_closed_audit: plans/v22-outputs/te1/fail-closed-audit.md#module-8-risk
fail_closed_registry: apps/product-helper/lib/langchain/engines/fail-closed-runner.ts
kb_chunk_refs: []
legacy_snapshot: apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_legacy_2026-04-26/8-risk/01-phase-docs/05-Phase-3-Possible-Causes.md
rewritten_at: 2026-04-27
rewritten_by: kb-rewrite (Wave-E γ-shape, EC-V21-E.9)
---
# Phase 3: Possible Causes Enumeration

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
- **Decisions consumed by this phase:** see `decisions[]` in the engine.json keyed on `target_field` containing `phase-3-possible-causes` or by manual mapping in the story tree.

> Predicates are NOT inlined here. The engine.json is the source of truth; this markdown points at it.

## §3 Fallback rules

When no predicate in §2 matches:

1. `searchKB` retrieves top-3 chunks scoped to `{module: 8, phase: phase-3-possible-causes}` (post-G8/G9 ingest).
2. If `searchKB` confidence < 0.90 OR returns zero chunks → `surfaceGap` emits `needs_user_input` to `system-question-bridge.ts` with computed_options + math_trace.
3. User answer re-enters the loop at ContextResolver.

> Fallback contract is shared across all phase files. Per-phase override (if any) is documented in the educational body below.

## §4 STOP-GAP rules (machine-readable)

- **artifact_key:** `module_8/phase-3-possible-causes`
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
- **Runtime retrieval:** `searchKB(query, top_k, { module: 8, phase: 'phase-3-possible-causes' })` over the `kb_chunks` table (`0011a_kb_chunks.sql`, ivfflat lists=100; HNSW upgrade gated on `>10k` rows).
- **Provenance:** every retrieved chunk carries `{kb_source, chunk_hash, content, embedding_distance}`; rendered by `why-this-value-panel.tsx` (`provenance-ui` agent).

> The `kb_chunk_refs` array in frontmatter is left empty until the embedder backfills it. The runtime path does not depend on the static array — it queries the live table.

---

## Educational content (legacy, preserved)

> The body below is the pre-Wave-E text verbatim. It documents *why* this phase exists, the systems-engineering theory behind the prescribed steps, and the example-driven walkthroughs the LLM (and human readers) consume. The 6 sections above are the schema-first overlay locked by Wave-E γ-shape.

## Knowledge

For each failure mode (and its effects), brainstorm all possible causes. A cause is the specific reason WHY the failure mode would occur. This is where we shift from functional thinking to detail/component-oriented thinking.

### MMMME Brainstorming Framework

Use this acronym to systematically cover cause categories:

| Category | Traditional | Software Equivalent | Example Questions |
|----------|------------|---------------------|-------------------|
| **Man** (Human) | Operator mistakes, assembly errors | Developer error, misconfiguration, incorrect deployment, missing code review | Could a developer introduce a bug? Could someone misconfigure an environment variable? Could a DBA run a migration incorrectly? See [Deployment & CI/CD KB](deployment-release-cicd-kb.md) |
| **Machine** (Infrastructure) | Component or equipment failure | Server crash, cloud provider outage, database hardware failure, network switch failure, disk full | Could an AWS region go down? Could a server run out of memory? Could a disk fill up? See [Resiliency Patterns KB](resilliency-patterns-kb.md) |
| **Method** (Process) | Procedure is incorrect or not followed | Missing tests, no rollback plan, inadequate code review, skipped load testing, no runbook for incident response | Could the deployment procedure miss a step? Could testing be insufficient? See [Deployment & CI/CD KB](deployment-release-cicd-kb.md) |
| **Material** (Dependencies) | Materials inadequate for task | Third-party API breaks (Stripe, SendGrid), library vulnerability (CVE), outdated SDK version, stale cached data, corrupted database migration | Could a vendor change their API without notice? Could a library have a security hole? See [API Design KB](api-design-sys-design-kb.md) and [Caching KB](caching-system-design-kb.md) |
| **Environment** (Operating conditions) | Temperature, vibration, moisture | Traffic spike (Black Friday), network partition, DNS failure, concurrent deployments by multiple teams, clock skew across services, cloud region capacity limits | Could a traffic surge overwhelm the system? Could a network partition split services? See [Load Balancing KB](load-balancing-kb.md) and [CDN & Networking KB](cdn-networking-kb.md) |

### Critical formatting rule:
**Each cause MUST be placed on its own row in the FMEA.** This is essential because later phases assign individual severity, likelihood, and RPN scores to each cause. Multiple causes for the same failure mode/effect result in multiple rows sharing the same Subsystem, Failure Mode, and Failure Effects values.

### Key guidance:
- Multiple causes can map to the same failure mode/effect
- Several effects may share the same cause
- Not all MMMME categories will apply to every failure mode -- that is normal
- Brainstorming causes may reveal additional failure modes or effects you missed. If so, go back and add them.
- Be as specific as possible. "Component failure" is too vague; "sensor detector or emitter is partially blocked or damaged" is specific and actionable.

### Example (E-Commerce Platform — causes from all MMMME categories):

| Failure Mode | Failure Effects | Possible Cause | MMMME |
|---|---|---|---|
| Failed to process payment | Order stuck, customer uncertain, refund required | Stripe API timeout — no retry logic implemented. See [Resiliency Patterns KB](resilliency-patterns-kb.md) | Material (dependency) |
| Failed to process payment | (same) | Developer deploys breaking change to Payment Service (missing API key rotation) | Man (human error) |
| Failed to process payment | (same) | Network partition between Payment Service and Stripe during cloud incident | Environment |
| Platform unresponsive during traffic spike | Complete revenue loss, SLA violation | Auto-scaling threshold too high — cannot absorb surge. See [Load Balancing KB](load-balancing-kb.md) | Method (process) |
| Platform unresponsive during traffic spike | (same) | Database connection pool exhausted under load. See [Data Model KB](data-model-kb.md) | Machine (infra) |
| Platform unresponsive during traffic spike | (same) | No load testing performed before peak season | Method (process) |
| CDN serves stale content | Wrong prices, out-of-stock items shown | Cache invalidation not triggered after price update. See [Caching KB](caching-system-design-kb.md) | Method (process) |
| CDN serves stale content | (same) | CDN provider (CloudFront) propagation delay during regional rollout | Material (dependency) |
| Deployment introduces regression | Feature breaks, rollback required | Test coverage below 85% — untested code path deployed. See [Deployment & CI/CD KB](deployment-release-cicd-kb.md) | Method (process) |
| Deployment introduces regression | (same) | Two teams deploy conflicting changes simultaneously | Man (human error) |

Notice: Each cause is its own row. The Failure Mode and Effects repeat. Causes span all five MMMME categories — a thorough FMEA for a software system will find that **Method** (process gaps) and **Material** (dependency failures) are often the largest categories, unlike hardware systems where **Machine** and **Environment** dominate.

## Input Required

- Confirmed failure modes and effects table from Phase 2

## Instructions for the LLM

1. For each failure mode, systematically walk through all five MMMME categories.
2. For each applicable category, list specific, actionable causes.
3. Place each cause on its own row, repeating the Subsystem, Failure Mode, and Failure Effects columns.
4. After completing all failure modes, review: did any new failure modes or effects become apparent? If yes, add them.

## Output Format

Extend the table -- now with one row per cause:

```markdown
| Subsystem | Failure Mode | Failure Effects | Possible Cause |
|-----------|-------------|----------------|---------------|
| [Sub 1] | [FM 1a] | [Effects] | [Cause 1] |
| [Sub 1] | [FM 1a] | [Effects] | [Cause 2] |
| [Sub 1] | [FM 1a] | [Effects] | [Cause 3] |
| [Sub 1] | [FM 1b] | [Effects] | [Cause 1] |
| ... | ... | ... | ... |
```

---

## STOP GAP -- Checkpoint 3

**Present the updated table to the user and ask:**

> "Here are the possible causes for each failure mode. Please review:
> 1. Have I covered all MMMME categories (Man, Machine, Method, Material, Environment) where applicable?
> 2. Are any causes too vague or should they be made more specific?
> 3. Did this brainstorming reveal any new failure modes or effects that should be added?
> 4. Is each cause on its own row?
>
> Confirm this is complete before I proceed to Phase 4 (Rating Systems and RPN Calculation)."

**Do NOT proceed until the user confirms.**

