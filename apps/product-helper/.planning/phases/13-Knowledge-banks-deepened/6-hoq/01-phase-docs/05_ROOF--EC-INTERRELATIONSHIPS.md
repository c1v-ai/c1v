---
schema: phase-file.v1
phase_slug: roof-ec-interrelationships
module: 6
artifact_key: module_6/roof-ec-interrelationships
engine_story: m6-qfd
engine_path: apps/product-helper/.planning/engines/m6-qfd.json
fail_closed_audit: plans/v22-outputs/te1/fail-closed-audit.md#module-6-hoq
fail_closed_registry: apps/product-helper/lib/langchain/engines/fail-closed-runner.ts
kb_chunk_refs: []
legacy_snapshot: apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_legacy_2026-04-26/6-hoq/01-phase-docs/05_ROOF--EC-INTERRELATIONSHIPS.md
rewritten_at: 2026-04-27
rewritten_by: kb-rewrite (Wave-E γ-shape, EC-V21-E.9)
---
# Phase 5: Roof -- Engineering Characteristic Interrelationships

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
- **Decisions consumed by this phase:** see `decisions[]` in the engine.json keyed on `target_field` containing `roof-ec-interrelationships` or by manual mapping in the story tree.

> Predicates are NOT inlined here. The engine.json is the source of truth; this markdown points at it.

## §3 Fallback rules

When no predicate in §2 matches:

1. `searchKB` retrieves top-3 chunks scoped to `{module: 6, phase: roof-ec-interrelationships}` (post-G8/G9 ingest).
2. If `searchKB` confidence < 0.90 OR returns zero chunks → `surfaceGap` emits `needs_user_input` to `system-question-bridge.ts` with computed_options + math_trace.
3. User answer re-enters the loop at ContextResolver.

> Fallback contract is shared across all phase files. Per-phase override (if any) is documented in the educational body below.

## §4 STOP-GAP rules (machine-readable)

- **artifact_key:** `module_6/roof-ec-interrelationships`
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
- **Runtime retrieval:** `searchKB(query, top_k, { module: 6, phase: 'roof-ec-interrelationships' })` over the `kb_chunks` table (`0011a_kb_chunks.sql`, ivfflat lists=100; HNSW upgrade gated on `>10k` rows).
- **Provenance:** every retrieved chunk carries `{kb_source, chunk_hash, content, embedding_distance}`; rendered by `why-this-value-panel.tsx` (`provenance-ui` agent).

> The `kb_chunk_refs` array in frontmatter is left empty until the embedder backfills it. The runtime path does not depend on the static array — it queries the live table.

---

## Educational content (legacy, preserved)

> The body below is the pre-Wave-E text verbatim. It documents *why* this phase exists, the systems-engineering theory behind the prescribed steps, and the example-driven walkthroughs the LLM (and human readers) consume. The 6 sections above are the schema-first overlay locked by Wave-E γ-shape.

> Corresponds to QFD Guide Steps 9, 10, 11

## Prerequisites
- [ ] Phase 4 is complete (main floor relationship matrix filled)
- [ ] Required inputs: The EC list from Phase 3

## Context (Why This Matters)

The main floor showed how each EC affects performance. The roof shows how engineering characteristics affect *each other*. This reveals the internal trade-offs of your design: increasing speed might require better controls, improving sensor quality might demand a better CPU, reducing weight might compromise frame strength. These EC-to-EC dependencies are critical for setting realistic design targets. Without the roof, you might set targets that are mutually contradictory.

The roof is the triangular section above the main matrix -- hence the name, since it completes the "house" shape.

## Instructions

### Step 5.1: Understand the Roof Structure

The roof is a **triangular matrix** where both rows and columns are your engineering characteristics. Since comparing EC_A's effect on EC_B is usually the same as EC_B's effect on EC_A, only one half of the matrix is needed (the lower triangle in the template).

Use the same -2 to +2 scale as the main floor:

| Value | Meaning |
|-------|---------|
| +2 | Strong positive: increasing EC_column makes it easier to achieve EC_row |
| +1 | Moderate positive |
| 0 | No significant relationship |
| -1 | Moderate negative: increasing EC_column makes EC_row harder to achieve |
| -2 | Strong negative |

### Step 5.2: Fill the Lower Triangle

For each pair of ECs, ask:

> "If we adjust [EC_column] in the direction of its arrow, what effect does that have on [EC_row]?"

**Examples from the e-commerce platform:**
- Increasing Deployment Frequency → effect on Test Coverage demand: **-1** (faster deploys strain the testing pipeline — see [CI/CD KB](deployment-release-cicd-kb.md))
- Increasing CDN Cache Hit Rate → effect on Server Response Time demand: **+2** (more cache hits = fewer requests hitting the server — see [Caching KB](caching-system-design-kb.md))
- Increasing Number of Services/Modules → effect on Number of Exposed API Endpoints: **-2** (more services = more inter-service APIs to define and maintain — a direct interface design consequence for Module 6)

### Step 5.3: Handle Asymmetric Relationships

Most EC-to-EC relationships are symmetric (if A helps B, then B helps A). But some are not. For asymmetric cases, use **slash notation**:

```
column_EC_effect_on_row_EC / row_EC_effect_on_column_EC
```

**Example**: 
- Increasing Deployment Frequency makes maintaining Test Coverage harder (negative), BUT improving Test Coverage enables more confident frequent deployments (positive)
- Cell value: **-1/+1**

If one direction is neutral, represent the neutral side as **0** (or sometimes a dash):
- Increasing CDN Cache Hit Rate reduces Server Response Time pressure (+1), but improving Server Response Time has no significant effect on CDN Cache Hit Rate
- Cell value: **+1/0**

### Step 5.4: Expect Moderate Sparsity

The roof should be sparser than the main floor but not as sparse. Approximately **10-15% of cells** should be non-zero. If nearly every EC affects every other EC, you may be over-thinking small interactions. If almost no cells are filled, reconsider whether your ECs are truly independent (they rarely are for a complex system).

### Step 5.5: Team Review Checkpoint

This is an essential moment to review the QFD with your team. Discuss:

- Do you agree on the EC-to-PC impacts (main floor)?
- Do you recognize and understand all the EC-to-EC trade-offs (roof)?
- Are there any surprising interactions?
- Should any relationships be added, removed, or adjusted?

This should not be a superficial sign-off but an in-depth discussion. Team members should recognize how their design decisions affect other teams' work. The QFD helps the team see why interface specifications between subsystems are important.

## Worked Example

Selected roof entries from the e-commerce platform:

| Column EC | Row EC | Value | Reasoning |
|-----------|--------|-------|-----------|
| Deployment Frequency (↑) | Test Coverage (%) | -1/+1 | Faster deploys strain testing; but better tests enable confident fast deploys |
| Deployment Frequency (↑) | Automated Failover Coverage | -1 | More frequent changes increase the chance something breaks and triggers failover |
| CDN Cache Hit Rate (↑) | Server Response Time | +2 | More cache hits = far fewer requests hitting origin servers — see [Caching KB](caching-system-design-kb.md) |
| CDN Cache Hit Rate (↑) | Hosting Cost per Month | +1 | Higher cache rate reduces compute load and hosting spend |
| Number of Services (↑) | Number of Exposed API Endpoints | -2 | More services = more inter-service APIs to build, document, and version — this directly drives interface complexity (Module 6) |
| Number of Services (↑) | Deployment Frequency | +1/0 | More services enable independent deployment; but deploying more often does not create more services |
| Number of Redundant Instances (↑) | Hosting Cost per Month | -2 | Each redundant instance adds hosting cost |
| Number of Redundant Instances (↑) | Automated Failover Coverage | +2 | More instances = more failover options — see [Resiliency Patterns KB](resilliency-patterns-kb.md) |
| Auto-Scaling Threshold (↓) | Hosting Cost per Month | -1 | Scaling up sooner increases cost during traffic spikes |
| Test Coverage (↑) | Code Review Turnaround | -1 | Higher coverage standards slow down reviews |

Most of the triangular matrix remains zero because most EC pairs have no meaningful direct interaction. Notice that **Number of Services** appears in multiple relationships — it is a structurally important EC because it determines how many component boundaries (interfaces) exist in the system.

## Validation Checklist (STOP-GAP)
- [ ] Only the lower triangle of the EC × EC matrix is filled (no duplicate entries above the diagonal)
- [ ] All values are in the -2 to +2 range
- [ ] Asymmetric relationships use slash notation: "column_effect/row_effect"
- [ ] Neutral sides of asymmetric relationships are represented as 0 or dash
- [ ] Approximately 10-15% of cells are non-zero (adjust expectations for your system complexity)
- [ ] You can explain the reasoning for every non-zero cell
- [ ] Team review has been conducted (or noted as pending if working solo, with a note to revisit)

> **STOP: Do not proceed to Phase 6 until ALL validation items pass.**
> If the roof has too many non-zero entries, question whether small interactions are truly significant. If asymmetric notation is missing for known asymmetric pairs, add it now.

## Output Artifact
The roof is populated: a lower-triangle matrix of EC-to-EC interrelationships using the -2 to +2 scale with slash notation for asymmetric relationships.

## Handoff to Next Phase
You now have the complete relationship structure: EC-to-PC (main floor) and EC-to-EC (roof). Phase 6 moves to the **basement** to calculate imputed importance -- a single number summarizing how critical each EC is to overall performance.

---

**← Previous:** [Phase 4: Main Floor -- Relationship Matrix](04_MAIN-FLOOR--RELATIONSHIP-MATRIX.md) | **Next →** [Phase 6: Basement Part 1 -- Imputed Importance](06_BASEMENT-PART1--IMPUTED-IMPORTANCE.md)

