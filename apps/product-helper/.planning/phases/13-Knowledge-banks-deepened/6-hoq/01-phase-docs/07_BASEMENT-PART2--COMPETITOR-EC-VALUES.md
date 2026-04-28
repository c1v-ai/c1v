---
schema: phase-file.v1
phase_slug: basement-part2-competitor-ec-values
module: 6
artifact_key: module_6/basement-part2-competitor-ec-values
engine_story: m6-qfd
engine_path: apps/product-helper/.planning/engines/m6-qfd.json
fail_closed_audit: plans/v22-outputs/te1/fail-closed-audit.md#module-6-hoq
fail_closed_registry: apps/product-helper/lib/langchain/engines/fail-closed-runner.ts
kb_chunk_refs: []
legacy_snapshot: apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_legacy_2026-04-26/6-hoq/01-phase-docs/07_BASEMENT-PART2--COMPETITOR-EC-VALUES.md
rewritten_at: 2026-04-27
rewritten_by: kb-rewrite (Wave-E γ-shape, EC-V21-E.9)
---
# Phase 7: Basement Part 2 -- Units, Competitor EC Values, and Requirement Thresholds

## §1 Decision context

This phase contributes to **m6-qfd** decisions. Runtime resolution flows through:

1. ContextResolver loads upstream artifacts + intake state.
2. NFREngineInterpreter evaluates predicates from `apps/product-helper/.planning/engines/m6-qfd.json` against EvalContext.
3. On match → auto-fill (clamped to `auto_fill_threshold`); on no match → fallback (§3); on still-no-match → STOP-GAP gate (§4) blocks proceed.

The legacy educational body (preserved in this file under the "Educational content" footer) explains *why* this phase exists. The runtime *what* lives in the engine.json + fail-closed registry referenced below.

## §2 Predicates (engine.json reference)

- **Engine story:** `m6-qfd` (`apps/product-helper/.planning/engines/m6-qfd.json`)
- **Predicate DSL evaluator:** `apps/product-helper/lib/langchain/engines/predicate-dsl.ts`
- **Story-tree schema:** `apps/product-helper/lib/langchain/schemas/engines/story-tree.ts`
- **Decisions consumed by this phase:** see `decisions[]` in the engine.json keyed on `target_field` containing `basement-part2-competitor-ec-values` or by manual mapping in the story tree.

> Predicates are NOT inlined here. The engine.json is the source of truth; this markdown points at it.

## §3 Fallback rules

When no predicate in §2 matches:

1. `searchKB` retrieves top-3 chunks scoped to `{module: 6, phase: basement-part2-competitor-ec-values}` (post-G8/G9 ingest).
2. If `searchKB` confidence < 0.90 OR returns zero chunks → `surfaceGap` emits `needs_user_input` to `system-question-bridge.ts` with computed_options + math_trace.
3. User answer re-enters the loop at ContextResolver.

> Fallback contract is shared across all phase files. Per-phase override (if any) is documented in the educational body below.

## §4 STOP-GAP rules (machine-readable)

- **artifact_key:** `module_6/basement-part2-competitor-ec-values`
- **registry:** `apps/product-helper/lib/langchain/engines/fail-closed-runner.ts` (`buildFailClosedRegistry`)
- **schema:** `apps/product-helper/lib/langchain/schemas/engines/fail-closed.ts` (`failClosedRuleSetSchema`)
- **audit doc (rule sources + severity):** [plans/v22-outputs/te1/fail-closed-audit.md](../../../../../../plans/v22-outputs/te1/fail-closed-audit.md#module-6-hoq)

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
- **Runtime retrieval:** `searchKB(query, top_k, { module: 6, phase: 'basement-part2-competitor-ec-values' })` over the `kb_chunks` table (`0011a_kb_chunks.sql`, ivfflat lists=100; HNSW upgrade gated on `>10k` rows).
- **Provenance:** every retrieved chunk carries `{kb_source, chunk_hash, content, embedding_distance}`; rendered by `why-this-value-panel.tsx` (`provenance-ui` agent).

> The `kb_chunk_refs` array in frontmatter is left empty until the embedder backfills it. The runtime path does not depend on the static array — it queries the live table.

---

## Educational content (legacy, preserved)

> The body below is the pre-Wave-E text verbatim. It documents *why* this phase exists, the systems-engineering theory behind the prescribed steps, and the example-driven walkthroughs the LLM (and human readers) consume. The 6 sections above are the schema-first overlay locked by Wave-E γ-shape.

> Corresponds to QFD Guide Steps 13, 14, 15

## Prerequisites
- [ ] Phase 6 is complete (imputed importance calculated for all ECs)
- [ ] Required inputs: Competitor list from Phase 2, EC list from Phase 3

## Context (Why This Matters)

Knowing *how important* each EC is (imputed importance) is not enough to set design targets. You also need to know what your competitors have actually achieved for these same characteristics, what units you are measuring in, and what external constraints exist. This grounds your design targets in reality rather than wishful thinking. A competitor's actual maximum speed, sensor accuracy, or manufacturing cost tells you what is achievable and what you need to beat.

## Instructions

### Step 7.1: Establish Units for Every EC

Before recording any values, define the unit of measurement for each engineering characteristic. Consistency is critical -- if you use meters, always use meters (not sometimes inches).

For ECs that are naturally unitless or categorical, use one of these approaches:
- Write **"N/A"** (non-applicable) to indicate the EC is unitless
- Reference a **lookup table** of options. For example, "Automated Failover Coverage" might reference "Table U1" which lists failover maturity levels — see [Resiliency Patterns KB](resilliency-patterns-kb.md) for the engineering details:

| Index | Failover Level | Description |
|-------|---------------|-------------|
| 1 | Manual | Operator must intervene to restart or switch over |
| 2 | Scripted | Automated scripts detect failure and restart, but require human trigger |
| 3 | Semi-automatic | Health checks detect failure and auto-restart, human monitors |
| 4 | Fully automatic | Auto-failover with health checks, traffic rerouting, and self-healing |

Such tables can be placed below the QFD, in a separate tab, or in a separate document.

For software ECs, common units include: milliseconds (latency), percentage (cache hit rate, test coverage, uptime), deployments/week, requests/second, $/month, and number-of (services, endpoints, instances).

**Record the units in a basement row** just below the imputed importance rows.

### Step 7.2: Obtain Competitor EC Values

For each competitor identified in Phase 2, determine their actual engineering characteristic values.

**Methods to obtain competitor data (in order of reliability):**
1. **Buy and test the competitor** (most reliable)
2. **Competitor data sheets or manuals** (official specs)
3. **Third-party reviews** (professional evaluations)
4. **Online forums and community reports** (less reliable, but better than nothing)
5. **Informed estimates** (when no data is available)

**Key rules:**
- Record values in the units established in Step 7.1
- If a value is an estimate rather than a confirmed measurement, write it in *italics* to distinguish it
- If an EC does not apply to a competitor (e.g., a non-moving competitor has no "maximum speed"), write **"N/A"** (non-applicable)
- N/A means the characteristic is not applicable; 0 means the competitor has the capability but it scores zero. These are different.

Even an estimate is far more informative than leaving a cell blank. Record your best guess.

Think broadly about competitors -- as discussed in Phase 2, not all ECs will apply to all competitors, and that is expected.

### Step 7.3: Record External Requirement Thresholds

Many ECs have externally imposed constraints: government regulations, customer requirements, contractual obligations, or management mandates. These set minimum or maximum allowable values.

Record these in a separate basement row below the competitor values:
- **Minimum thresholds**: underlined text (e.g., the minimum speed required by the customer)
- **Maximum thresholds**: bold text or plain text (e.g., the maximum allowable cost)

If an EC has no external constraint, write **"N/A"**.

**Example from the e-commerce platform:**

| EC | Units | B (Shopify Plus) | C (Rival Custom Build) | Threshold |
|----|-------|-----------------|----------------------|-----------|
| Server Response Time | ms | 180 | *~350* | max: 500 ms |
| CDN Cache Hit Rate | % | 95% | *~70%* | min: 80% |
| Deployment Frequency | deploys/week | 14 (continuous) | *~2* | min: 1/week |
| Test Coverage | % | N/A (vendor-managed) | *~60%* | min: 80% |
| Number of Redundant Instances | count | N/A (vendor-managed) | 2 | min: 2 |
| Hosting Cost per Month | $/month | $2,000 (licensing) | *~$8,000* | max: $5,000 |
| Number of Exposed API Endpoints | count | *~50* | *~120* | N/A |

Note: Values in *italics* are estimates. Shopify's internal infrastructure ECs are marked "N/A" because as a managed platform, you cannot observe or control those knobs — this is precisely why the Decision Matrix flagged Shopify's Growth Ceiling as a weakness. The rival's values are estimated from job postings, tech blog posts, and industry benchmarks. See [Observability KB](observability-kb.md) for how to independently verify competitor performance claims.

> **Interface design preview:** Notice "Number of Exposed API Endpoints" — this EC directly quantifies interface complexity. The rival's 120 endpoints versus Shopify's ~50 reflects the cost of a custom architecture: more flexibility, but far more interfaces to define, document, and maintain. Module 6 addresses how to manage this complexity.

### Step 7.4: Confidence Ratings (Optional)

If you want to formalize the reliability of your data, you can add a confidence rating after each value, separated by a comma: "3.2, high" or "~600, low". This is less common but can be helpful for large teams or high-stakes decisions.

## Worked Example

For the e-commerce platform, the team:
1. Establishes units: ms for response times, % for cache hit rate/test coverage/uptime, deploys/week for deployment frequency, $/month for costs, count for instances/services/endpoints, and "Table U1" for failover maturity level
2. Researches Competitor B (Shopify Plus): obtains response time from third-party monitoring (180ms), cache hit rate from CDN documentation (95%), deployment frequency from Shopify's engineering blog (continuous deployment). Many infrastructure ECs are "N/A" because Shopify manages them internally.
3. Researches Competitor C (rival custom build): estimates response time from user-facing page load tests (~350ms, italicized), estimates test coverage from job postings mentioning "80% coverage target" (current ~60%, italicized), estimates hosting cost from similar-scale AWS deployments (~$8,000/month)
4. Records the business requirements: server response time must not exceed 500ms, CDN cache hit rate must be at least 80%, hosting cost must stay under $5,000/month, and at least 2 redundant instances are required for uptime guarantees

## Validation Checklist (STOP-GAP)
- [ ] Every EC has a defined unit or "N/A" for unitless characteristics
- [ ] Units are consistent (not mixing meters and inches, etc.)
- [ ] Competitor EC values are filled for all applicable ECs
- [ ] Non-applicable competitor ECs are marked "N/A" (not left blank or given 0)
- [ ] Estimated values are distinguished from confirmed values (italics or other notation)
- [ ] External requirement thresholds are documented where they exist
- [ ] Minimum thresholds are underlined; maximum thresholds are bold or plain
- [ ] ECs with no threshold are marked "N/A"

> **STOP: Do not proceed to Phase 8 until ALL validation items pass.**
> If units are missing, define them now. If competitor data has gaps, record your best estimate in italics. If you cannot distinguish between estimates and confirmed values, review your data sources.

## Output Artifact
Three new basement rows: (1) Units per EC, (2) Competitor EC values per competitor, (3) External requirement thresholds. All in the units established in Step 7.1.

## Handoff to Next Phase
You now have the competitive landscape for engineering characteristics. Phase 8 adds technical difficulty and cost ratings, then triggers a critical re-evaluation of relationships before moving to design targets.

---

**← Previous:** [Phase 6: Basement Part 1 -- Imputed Importance](06_BASEMENT-PART1--IMPUTED-IMPORTANCE.md) | **Next →** [Phase 8: Basement Part 3 -- Difficulty, Cost, and Re-Evaluation](08_BASEMENT-PART3--DIFFICULTY-COST-REEVALUATION.md)

