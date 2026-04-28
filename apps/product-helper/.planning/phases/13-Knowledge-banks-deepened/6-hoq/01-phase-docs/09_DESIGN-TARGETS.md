---
schema: phase-file.v1
phase_slug: design-targets
module: 6
artifact_key: module_6/design-targets
engine_story: m6-qfd
engine_path: apps/product-helper/.planning/engines/m6-qfd.json
fail_closed_audit: plans/v22-outputs/te1/fail-closed-audit.md#module-6-hoq
fail_closed_registry: apps/product-helper/lib/langchain/engines/fail-closed-runner.ts
kb_chunk_refs: []
legacy_snapshot: apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_legacy_2026-04-26/6-hoq/01-phase-docs/09_DESIGN-TARGETS.md
rewritten_at: 2026-04-27
rewritten_by: kb-rewrite (Wave-E γ-shape, EC-V21-E.9)
---
# Phase 9: Design Targets

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
- **Decisions consumed by this phase:** see `decisions[]` in the engine.json keyed on `target_field` containing `design-targets` or by manual mapping in the story tree.

> Predicates are NOT inlined here. The engine.json is the source of truth; this markdown points at it.

## §3 Fallback rules

When no predicate in §2 matches:

1. `searchKB` retrieves top-3 chunks scoped to `{module: 6, phase: design-targets}` (post-G8/G9 ingest).
2. If `searchKB` confidence < 0.90 OR returns zero chunks → `surfaceGap` emits `needs_user_input` to `system-question-bridge.ts` with computed_options + math_trace.
3. User answer re-enters the loop at ContextResolver.

> Fallback contract is shared across all phase files. Per-phase override (if any) is documented in the educational body below.

## §4 STOP-GAP rules (machine-readable)

- **artifact_key:** `module_6/design-targets`
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
- **Runtime retrieval:** `searchKB(query, top_k, { module: 6, phase: 'design-targets' })` over the `kb_chunks` table (`0011a_kb_chunks.sql`, ivfflat lists=100; HNSW upgrade gated on `>10k` rows).
- **Provenance:** every retrieved chunk carries `{kb_source, chunk_hash, content, embedding_distance}`; rendered by `why-this-value-panel.tsx` (`provenance-ui` agent).

> The `kb_chunk_refs` array in frontmatter is left empty until the embedder backfills it. The runtime path does not depend on the static array — it queries the live table.

---

## Educational content (legacy, preserved)

> The body below is the pre-Wave-E text verbatim. It documents *why* this phase exists, the systems-engineering theory behind the prescribed steps, and the example-driven walkthroughs the LLM (and human readers) consume. The 6 sections above are the schema-first overlay locked by Wave-E γ-shape.

> Corresponds to QFD Guide Steps 20, 21, 22

## Prerequisites
- [ ] Phase 8 is complete (difficulty, cost, re-evaluation done)
- [ ] Required inputs: Imputed importance (Phase 6, possibly updated in Phase 8), competitor EC values (Phase 7), thresholds (Phase 7), difficulty/cost (Phase 8), roof interrelationships (Phase 5)

## Context (Why This Matters)

This is the culmination of all previous work. Every earlier phase built the analytical foundation; now you make actual decisions. Design targets are the specific values you choose for each engineering characteristic. These are the numbers your team will design to, the values you will defend to stakeholders, and the benchmarks you will test against. Setting them well requires balancing imputed importance, technical difficulty, cost, competitor positioning, requirement thresholds, and the ripple effects visible in the roof.

## Instructions

### Step 9.1: Establish Starting Values

For each EC, choose an initial design target estimate using one of these approaches (in order of preference):

1. **Current concept estimates**: If you already have values from your existing design, start there
2. **Minimum requirement thresholds**: Use the constraint/requirement values from Phase 7 as a floor
3. **Competitor-inspired values**: Use a realistic number based on what competitors have achieved

If you have none of the above, use the median of your competitors' values as a starting point.

### Step 9.2: Adjust the Top 5 ECs First

Take no more than your **top 5 engineering characteristics by imputed importance**. For each one:

1. **Check the positive/negative split**: If positive II > negative II and the direction arrow points up, you generally want to increase the target. If negative II > positive II, consider *decreasing* or holding at minimum.

2. **Consider technical difficulty and cost**: What does it take to push this knob? If difficulty is 4-5, be conservative. If difficulty is 1-2, be more aggressive.

3. **Consider competitors**: Where do competitors stand? Common initial guidelines:
   - Push at least as high as your top competitor
   - Or use the median of competitors
   - Or push to the maximum you can technically accomplish and afford

4. **Consider thresholds**: Never violate a documented requirement minimum or maximum.

5. **Estimate the performance impact**: If you set this target, how would your system's performance scores (back porch) change? Update your A(low) and A(high) estimates.

**Guidelines for initial adjustments** (when positive II > negative II and arrow points up):
- Option A: Increase target until maximum performance from this single EC is reached
- Option B: Increase to the highest you can technically accomplish and afford
- Option C: Match or exceed your top competitor
- Option D: Use the median of competitors' values

### Step 9.3: The "Feature Velocity Paradox" -- When Negative II Dominates

Some ECs will have very high total imputed importance but with negative outweighing positive. The intuitive reaction ("this is important, push it higher!") is wrong.

**Example -- Deployment Frequency in the e-commerce platform:**
- Positive II: 30.00% (strong boost to Launch Speed and Ongoing Maintenance)
- Negative II: 26.70% (hurts Reliability and Security)
- Total II: 56.70%

Never deploying is obviously impractical — the platform would never ship features. The resolution:
1. Set the target at a **moderate deployment frequency** — perhaps weekly releases rather than continuous deployment — to balance speed with stability
2. Then, through the roof, observe: if you improve other ECs (Test Coverage, Automated Failover Coverage), those improvements may *enable* more frequent deployments later. See [Deployment & CI/CD KB](deployment-release-cicd-kb.md) for how mature CI/CD pipelines progressively unlock faster deployment cadences.
3. The QFD body provides an overview; the roof adds the nuance. As you set other EC targets, you may find justification to increase deployment frequency above the initial conservative target

This is not counterintuitive once understood: you are optimizing the *system*, not any single characteristic. Many successful software companies start with weekly releases, invest heavily in testing and monitoring infrastructure, and only move to continuous deployment once those safety nets are proven. Rushing to "deploy 50 times a day" without the supporting infrastructure is the software equivalent of building a fast vehicle with no brakes.

> **Non-technical translation:** The business instinct is always "ship faster." The QFD reveals that shipping faster only helps if the safety nets (testing, monitoring, failover) can keep pace. Investing in those safety nets first — even though they are invisible to customers — is what ultimately enables the speed the business wants.

### Step 9.4: Address Remaining ECs in Batches of 5

After the top 5, work through the remaining ECs in groups of approximately 5, ordered by imputed importance. For each batch:

1. Apply the same analysis (positive/negative II, difficulty, cost, competitors, thresholds)
2. Check the roof: does changing this EC's target affect previously set targets?
3. Update performance scores as you go
4. It is normal to revisit and re-adjust earlier targets

**Why batches of 5?** Human beings are typically only good at weighing about 5 options at a time. Even experienced designers benefit from this constraint.

### Step 9.5: Update Performance Scores

As you set targets, re-compute your system's performance in the back porch:
- Add a new column (e.g., "A(target)") representing performance at your design targets
- Some people keep their original A(low)/A(high) and add new columns for each iteration

Compare A(target) to competitors. Is your system now competitive where it needs to be?

### Step 9.6: Iterate on Design Targets

Consider "what if" scenarios:
- What if you cannot achieve the technical difficulty you intend? What if the more complex algorithm fails?
- What if a part doesn't perform as anticipated?
- What if your budget gets cut or a critical component arrives late?
- Would you need to change other targets as a result?

These questions help you recognize how critical each EC target truly is, even if it has modest imputed importance. Plan for contingencies rather than making "knee jerk reactions" when problems arise.

**Optimization principle**: Optimal solutions commonly occur when you have pushed your design to the maximum that your constraints allow. The QFD helps you identify which constraints are truly the most limiting.

### Step 9.7: Document Trade-Off Justifications

For at least your top 5 EC design targets, document:

1. **Why this value?** What customer need does it address?
2. **What trade-offs were accepted?** What did you give up?
3. **Why is it worth it?** How does the performance gain justify the cost?
4. **Competitive positioning?** How does this compare to competitors?

**Example:**
> **Design Target: Deployment Frequency = 2 deploys/week**
> - Why: Meets minimum business requirement (1/week) with margin for hotfixes
> - Trade-off: Sacrifice continuous deployment velocity to reduce risk to Reliability and Security
> - Worth it: Frees engineering effort for Test Coverage (difficulty=3) and Automated Failover (difficulty=4), which improve the two highest-weighted PCs (Reliability 16.7%, Security 10%)
> - vs. competitors: Below Shopify (continuous deployment, ~14/week) but above the rival custom build (~2/week). Competitive advantage comes from reliability and customizability, not deployment speed. See [CI/CD KB](deployment-release-cicd-kb.md).

## Worked Example

The e-commerce platform team's design target process:
1. **CDN Cache Hit Rate**: Set to 92% (aggressive target, just below Shopify's 95%) — highest positive-dominant imputed importance, very low difficulty (1) and cost (1). This is the "free lunch" EC. See [Caching KB](caching-system-design-kb.md).
2. **Server Response Time**: Set to 200ms (matching Shopify) — high positive II, moderate difficulty (3). Achieved partly through the aggressive cache hit rate target, which reduces origin server load.
3. **Number of Redundant Instances**: Set to 3 — high positive II for Reliability, moderate negative for Cost. Three instances enable automatic failover while keeping hosting costs under the $5K/month threshold. See [Resiliency Patterns KB](resilliency-patterns-kb.md).
4. **Test Coverage**: Set to 85% (above the 80% minimum threshold) — critical enabler for Deployment Frequency, moderate difficulty (3). The team prioritized integration tests over unit tests because integration failures are more likely to cause outages.
5. **Deployment Frequency**: Set to 2/week (well below Shopify's continuous deployment) — the "Feature Velocity Paradox" EC. Conservative initial target that can be increased later as Test Coverage and Failover infrastructure mature. See [CI/CD KB](deployment-release-cicd-kb.md).

After setting all 20 targets, A(target) weighted performance score = 3.72, compared to A(low)=2.40, A(high)=3.90, Shopify Plus=3.45, Rival Custom Build=2.15. The platform is projected to outperform Shopify on Growth Ceiling and Cost, match it on Reliability (through redundancy investment), and trail slightly on Page Load Speed (92% vs 95% cache hit rate).

> **Bridge to Module 6:** Several design targets — Number of Services (set to 6), Number of Exposed API Endpoints (set to ~40), Queue Processing Rate — directly determine how many interfaces the system has. Each interface needs a formal definition: what data crosses the boundary, what format it uses, what happens when one side fails. This is the work of Module 6 (Defining Interfaces).

## Validation Checklist (STOP-GAP)
- [ ] Every EC has a specific design target value (no blanks)
- [ ] No target violates a documented requirement threshold from Phase 7
- [ ] Performance scores are updated with a new A(target) column in the back porch
- [ ] The top 5 ECs by imputed importance have documented trade-off justifications
- [ ] ECs where negative II > positive II have been handled thoughtfully (not just pushed higher)
- [ ] "What if" scenarios have been considered for at least the 3 highest-difficulty ECs
- [ ] Targets are recorded in the QFD basement design targets row

> **STOP: Do not proceed to Phase 10 until ALL validation items pass.**
> If any EC lacks a target, set one now (even if approximate). If a target violates a threshold, adjust it. If trade-off justifications are missing for top 5 ECs, write them.

## Output Artifact
A complete design targets row in the QFD basement with a specific value for every EC. Updated back-porch performance scores with an A(target) column. Documented trade-off justifications for top 5+ ECs.

## Handoff to Next Phase
You now have a complete, defensible set of design targets. Phase 10 conducts a final review, explores iteration strategies, and drafts the written answers required for course submission.

---

**← Previous:** [Phase 8: Basement Part 3 -- Difficulty, Cost, and Re-Evaluation](08_BASEMENT-PART3--DIFFICULTY-COST-REEVALUATION.md) | **Next →** [Phase 10: Final Review and Written Answers](10_FINAL-REVIEW-AND-WRITTEN-ANSWERS.md)

