---
schema: phase-file.v1
phase_slug: back-porch-scoring-and-competitors
module: 6
artifact_key: module_6/back-porch-scoring-and-competitors
engine_story: m6-qfd
engine_path: apps/product-helper/.planning/engines/m6-qfd.json
fail_closed_audit: plans/v22-outputs/te1/fail-closed-audit.md#module-6-hoq
fail_closed_registry: apps/product-helper/lib/langchain/engines/fail-closed-runner.ts
kb_chunk_refs: []
legacy_snapshot: apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_legacy_2026-04-26/6-hoq/01-phase-docs/02_BACK-PORCH--SCORING-AND-COMPETITORS.md
rewritten_at: 2026-04-27
rewritten_by: kb-rewrite (Wave-E γ-shape, EC-V21-E.9)
---
# Phase 2: Back Porch -- Performance Scoring and Competitive Analysis

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
- **Decisions consumed by this phase:** see `decisions[]` in the engine.json keyed on `target_field` containing `back-porch-scoring-and-competitors` or by manual mapping in the story tree.

> Predicates are NOT inlined here. The engine.json is the source of truth; this markdown points at it.

## §3 Fallback rules

When no predicate in §2 matches:

1. `searchKB` retrieves top-3 chunks scoped to `{module: 6, phase: back-porch-scoring-and-competitors}` (post-G8/G9 ingest).
2. If `searchKB` confidence < 0.90 OR returns zero chunks → `surfaceGap` emits `needs_user_input` to `system-question-bridge.ts` with computed_options + math_trace.
3. User answer re-enters the loop at ContextResolver.

> Fallback contract is shared across all phase files. Per-phase override (if any) is documented in the educational body below.

## §4 STOP-GAP rules (machine-readable)

- **artifact_key:** `module_6/back-porch-scoring-and-competitors`
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
- **Runtime retrieval:** `searchKB(query, top_k, { module: 6, phase: 'back-porch-scoring-and-competitors' })` over the `kb_chunks` table (`0011a_kb_chunks.sql`, ivfflat lists=100; HNSW upgrade gated on `>10k` rows).
- **Provenance:** every retrieved chunk carries `{kb_source, chunk_hash, content, embedding_distance}`; rendered by `why-this-value-panel.tsx` (`provenance-ui` agent).

> The `kb_chunk_refs` array in frontmatter is left empty until the embedder backfills it. The runtime path does not depend on the static array — it queries the live table.

---

## Educational content (legacy, preserved)

> The body below is the pre-Wave-E text verbatim. It documents *why* this phase exists, the systems-engineering theory behind the prescribed steps, and the example-driven walkthroughs the LLM (and human readers) consume. The 6 sections above are the schema-first overlay locked by Wave-E γ-shape.

> Corresponds to QFD Guide Steps 3, 3a, 4, 5

## Prerequisites
- [ ] Phase 1 is complete (performance criteria listed with weights summing to 100%)
- [ ] Required inputs: Your current system concept, knowledge of at least 2 competitors

## Context (Why This Matters)

The back porch answers the question: "How does your system stack up against the competition?" You rate your system and competitors on every performance criterion using a normalized scale, then weight those scores by importance. This reveals where your concept is strong, where it is weak, and where your greatest uncertainties lie. The gaps between your low and high estimates point directly to where you should focus your design effort first.

## Instructions

### Step 2.1: Select a Normalization Scale

Choose a unitless scale for all scores. A **1 to 5 scale** is the standard in QFD.

Why normalize? You cannot compare $1,000 (cost) + 5 m/s (speed) + 0.3% (failure rate). By converting all criteria to the same unitless scale, you create fair, addable comparisons. Invest time in developing clear, defensible scoring rules for your normalization -- this directly determines the quality of your QFD output.

### Step 2.2: Rate Your System (Low and High Estimates)

For each performance criterion, assign your current concept two scores on the 1-5 scale:

- **A(low)**: The minimum level you can currently guarantee. If you have no test data, this may be very low -- even 0. That is perfectly fine and actually valuable.
- **A(high)**: Your score if everything works as planned in your current concept.

Enter A(low) in one column and A(high) in an adjacent column of the back porch.

**Critical insight**: The gap between low and high estimates reveals uncertainty. The *largest gaps* are where you should focus your efforts first. It may feel natural to work on areas you are most confident in, but that risks discovering late that the uncertain areas invalidate your earlier work.

If you feel confident enough that low and high are the same, use the same value in both columns.

### Step 2.3: Calculate Weighted Scores

For each criterion, multiply the normalized score by the criterion's importance weight:

```
Weighted Score = Normalized Score × Importance Weight
```

Do this for both A(low) and A(high). Sum all weighted scores in each column to get your **total weighted performance score**.

**Example from the e-commerce platform:**

| Criterion | Weight | A(low) | A(high) | Weighted Low | Weighted High |
|-----------|--------|--------|---------|-------------|---------------|
| Reliability (Uptime) | 16.7% | 2 | 4 | 0.334 | 0.668 |
| Customer Page Load Speed | 16.7% | 3 | 4 | 0.501 | 0.668 |
| Total Cost over 3 Years | 13.3% | 3 | 4 | 0.399 | 0.532 |
| Peak Traffic Capacity | 13.3% | 2 | 4 | 0.266 | 0.532 |
| Launch Speed | 10.0% | 2 | 3 | 0.200 | 0.300 |
| Growth Ceiling | 10.0% | 3 | 5 | 0.300 | 0.500 |
| Ongoing Maintenance | 10.0% | 2 | 3 | 0.200 | 0.300 |
| Risk Exposure (Security) | 10.0% | 2 | 4 | 0.200 | 0.400 |
| **Total** | **100%** | | | **2.40** | **3.90** |

The total gives your current estimate of how well your platform meets the business needs. The gap between 2.40 and 3.90 reveals significant uncertainty — particularly in Reliability and Peak Traffic Capacity, where the team is unsure whether the open-source platform can handle production load without substantial customization.

### Step 2.4: Identify and Rate Competitors

**Always assume competitors exist.** Even if you believe your solution is completely novel, people are currently meeting the needs your system addresses -- just differently.

To find competitors, ask:
- What direct competitors offer a similar approach?
- What indirect competitors solve the same customer need differently?
- How are people addressing the need today, even poorly?

**Example -- E-Commerce Platform**: Your open-source hybrid platform (Option C from Module 4) competes against:
- **Competitor B: Shopify Plus** — the commercial platform option you considered. It scores high on Reliability (vendor-managed infrastructure) and Launch Speed (turnkey setup) but lower on Growth Ceiling (vendor limits on customization) and Ongoing Maintenance (vendor lock-in makes migration costly). See [Resiliency Patterns KB](resilliency-patterns-kb.md) for why managed platforms often achieve higher uptime.
- **Competitor C: A custom-built platform by a rival company** — similar to Option B from Module 4. It scores high on Growth Ceiling (no limits) but lower on Cost (expensive to build and maintain) and Launch Speed (took 18 months to ship).

For each competitor, add columns B, C, etc. to the back porch. Rate each competitor on every criterion using the same 1-5 scale. It is fine for a competitor to score 0 on criteria it does not address at all.

Be honest if your system scores poorly -- identifying weaknesses early is the entire point.

### Step 2.5: Weight Competitor Scores

Multiply each competitor's normalized score by the criterion's importance weight, exactly as you did for your system. Sum to get each competitor's total weighted performance score.

### Step 2.6: Compare and Reflect

Review all total weighted scores side-by-side. Ask:
- Where does your system outperform competitors?
- Where do competitors outperform you?
- Which criteria show the largest uncertainty gaps (A(low) vs A(high))?
- Are there competitors you missed? In general, the more the better.
- Do you and your team agree on the criteria, weights, and scores?

This is a natural team discussion point before moving deeper into the QFD.

## Worked Example

The e-commerce team rates their open-source hybrid platform against Shopify Plus (B) and a rival's custom-built platform (C). The team's platform scores high on Growth Ceiling (3-5) and Cost (3-4) but shows a large gap on Reliability (2-4), indicating significant uncertainty about whether the open-source stack can match Shopify's managed uptime. Shopify scores well on Reliability (5) and Launch Speed (5) due to its fully managed infrastructure. The rival's custom platform excels at Growth Ceiling (5) but scores poorly on Cost (1) and Launch Speed (1).

Total weighted scores:
- A(low): 2.40 | A(high): 3.90
- B (Shopify Plus): 3.45
- C (Rival custom build): 2.15

The wide gap in A tells the team their concept has strong potential but significant execution risk — particularly in Reliability and Peak Traffic Capacity. Notice that Shopify (3.45) currently outscores even A(high) on certain criteria. The QFD's job is to close that gap by setting the right engineering targets. See [Observability KB](observability-kb.md) for how monitoring and alerting can help close the reliability gap.

## Validation Checklist (STOP-GAP)
- [ ] All scores use a consistent unitless scale (1-5 recommended)
- [ ] Your system has both A(low) and A(high) scores for every performance criterion
- [ ] Weighted scores are computed correctly: score × weight for each cell
- [ ] Total weighted performance score is calculated for each column (sum of all weighted scores)
- [ ] At least 2 competitors are rated on all performance criteria
- [ ] Competitors' weighted scores and totals are also computed
- [ ] You can identify the 3 largest uncertainty gaps (A(low) vs A(high)) in your system
- [ ] You can identify at least 1 area where a competitor outperforms your system

> **STOP: Do not proceed to Phase 3 until ALL validation items pass.**
> If totals seem off, recheck that weights sum to 100% (Phase 1). If you cannot find competitors, re-read Step 2.4 -- consider indirect and alternative solutions.

## Output Artifact
The back porch is populated: a decision matrix with normalized and weighted scores for your system (low/high) and at least 2 competitors, plus total weighted performance scores for all columns.

## Handoff to Next Phase
You now have a competitive performance baseline. Phase 3 moves to the **second floor** to list all engineering characteristics -- the design "knobs" you can tweak -- and set their direction-of-change arrows.

---

**← Previous:** [Phase 1: Front Porch -- Performance Criteria](01_FRONT-PORCH--PERFORMANCE-CRITERIA.md) | **Next →** [Phase 3: Second Floor -- Engineering Characteristics](03_SECOND-FLOOR--ENGINEERING-CHARACTERISTICS.md)

