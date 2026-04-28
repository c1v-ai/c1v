---
schema: phase-file.v1
phase_slug: phase-4-rating-systems-and-rpn
module: 8
artifact_key: module_8/phase-4-rating-systems-and-rpn
engine_story: m8-fmea-residual
engine_path: apps/product-helper/.planning/engines/m8-fmea-residual.json
fail_closed_audit: plans/v22-outputs/te1/fail-closed-audit.md#module-8-risk
fail_closed_registry: apps/product-helper/lib/langchain/engines/fail-closed-runner.ts
kb_chunk_refs: []
legacy_snapshot: apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_legacy_2026-04-26/8-risk/01-phase-docs/06-Phase-4-Rating-Systems-and-RPN.md
rewritten_at: 2026-04-27
rewritten_by: kb-rewrite (Wave-E γ-shape, EC-V21-E.9)
---
# Phase 4: Rating Systems and RPN Calculation

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
- **Decisions consumed by this phase:** see `decisions[]` in the engine.json keyed on `target_field` containing `phase-4-rating-systems-and-rpn` or by manual mapping in the story tree.

> Predicates are NOT inlined here. The engine.json is the source of truth; this markdown points at it.

## §3 Fallback rules

When no predicate in §2 matches:

1. `searchKB` retrieves top-3 chunks scoped to `{module: 8, phase: phase-4-rating-systems-and-rpn}` (post-G8/G9 ingest).
2. If `searchKB` confidence < 0.90 OR returns zero chunks → `surfaceGap` emits `needs_user_input` to `system-question-bridge.ts` with computed_options + math_trace.
3. User answer re-enters the loop at ContextResolver.

> Fallback contract is shared across all phase files. Per-phase override (if any) is documented in the educational body below.

## §4 STOP-GAP rules (machine-readable)

- **artifact_key:** `module_8/phase-4-rating-systems-and-rpn`
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
- **Runtime retrieval:** `searchKB(query, top_k, { module: 8, phase: 'phase-4-rating-systems-and-rpn' })` over the `kb_chunks` table (`0011a_kb_chunks.sql`, ivfflat lists=100; HNSW upgrade gated on `>10k` rows).
- **Provenance:** every retrieved chunk carries `{kb_source, chunk_hash, content, embedding_distance}`; rendered by `why-this-value-panel.tsx` (`provenance-ui` agent).

> The `kb_chunk_refs` array in frontmatter is left empty until the embedder backfills it. The runtime path does not depend on the static array — it queries the live table.

---

## Educational content (legacy, preserved)

> The body below is the pre-Wave-E text verbatim. It documents *why* this phase exists, the systems-engineering theory behind the prescribed steps, and the example-driven walkthroughs the LLM (and human readers) consume. The 6 sections above are the schema-first overlay locked by Wave-E γ-shape.

This phase has four sub-steps, each with its own STOP GAP. This is the most complex phase because it establishes the quantitative foundation for all risk assessment.

---

## Sub-Step 4A: Define the Severity Rating Scale

### Knowledge

A severity rating quantifies how bad the impact is if a failure cause is realized. The scale typically ranges from 1-3 to 1-10. Higher scores = more severe.

**Conditions should cover these effect types:**
- Cost incurred (as % of budget)
- Time to address / fix (days, weeks)
- Performance loss (as % of target metrics)
- Harm to equipment or environment
- Harm to people (this typically earns the highest possible rating)

**Rules for building the scale:**
- Conditions must be **non-overlapping** -- no ambiguity about which score applies
- Conditions must be **all-inclusive** -- every possible effect maps to exactly one level
- The same condition (e.g., "no harm to any person") CAN appear at multiple levels
- The **assignment rule**: Assign the WORST (highest) severity rating that has at least ONE of its conditions met by the effect/cause

### Instructions for the LLM

1. Review the effects and causes from the Phase 3 table.
2. Determine an appropriate scale range (1-3 for simple systems, 1-5 for moderate, 1-10 for complex).
3. Propose a severity rating table with specific, measurable conditions per level that are relevant to the user's system.
4. Reference the template in `01-Reference-Sample-and-Templates.md` for format.

### Output Format

```markdown
## Proposed Severity Rating Scale (1 to [N])

| Rating | Label | Conditions |
|--------|-------|-----------|
| 1 | [label] | [condition 1]. [condition 2]. [condition 3]. |
| 2 | [label] | [condition 1]. [condition 2]. [condition 3]. |
| ... | ... | ... |
| N | [label] | [condition 1]. [condition 2]. [condition 3]. |

**Assignment rule:** Assign the worst (highest) severity rating that has at least one condition met.
```

### STOP GAP -- Checkpoint 4A

> "Here is the proposed severity rating scale. Please review:
> 1. Is the scale range appropriate for your system's complexity?
> 2. Are the conditions realistic and relevant to your project?
> 3. Are the thresholds (budget %, time, performance %) calibrated correctly for your situation?
> 4. Should any conditions be added, removed, or adjusted?
>
> Confirm or adjust before I proceed to define the likelihood scale."

**Do NOT proceed until the user confirms.**

---

## Sub-Step 4B: Define the Likelihood Rating Scale

### Knowledge

A likelihood rating quantifies how probable it is that a specific cause will occur. The scale typically ranges from 1-3 to 1-10. Higher scores = more likely.

**Conditions are often based on:**
- Probability of occurrence (e.g., < 1%, 1-5%, etc.)
- Frequency (e.g., mean time between failure)
- Percentage of operational cycles where the event occurs

**Guidance on assigning likelihood:**
- Use component datasheets, past version data, or prototype testing results when available
- If probability data is unknown, assign a **conservative (higher) estimate** -- assume worst realistic case
- Some organizations mandate a minimum likelihood value for unknowns
- Prototype-stage systems may use different thresholds than production systems

### Instructions for the LLM

1. Propose a likelihood rating scale with measurable conditions.
2. Match the granularity to the severity scale (they do not have to be the same range, but should be compatible).
3. Reference the template in `01-Reference-Sample-and-Templates.md`.

### Output Format

```markdown
## Proposed Likelihood Rating Scale (1 to [N])

| Rating | Label | Conditions |
|--------|-------|-----------|
| 1 | [label] | [condition] |
| 2 | [label] | [condition] |
| ... | ... | ... |
| N | [label] | [condition] |
```

### STOP GAP -- Checkpoint 4B

> "Here is the proposed likelihood rating scale. Please review:
> 1. Is the scale range appropriate?
> 2. Are the probability/frequency thresholds realistic for your system's maturity (prototype vs. production)?
> 3. Should any conditions be adjusted?
>
> Confirm or adjust before I proceed to create the RPN matrix."

**Do NOT proceed until the user confirms.**

---

## Sub-Step 4C: Create the RPN Matrix and Criticality Categories

### Knowledge

The **Risk Priority Number (RPN)** is calculated as:

> **RPN = Severity x Likelihood**

A **criticality table** (also called an RPN Definition Matrix) places likelihood on one axis and severity on the other. Each cell contains the product (the RPN).

After populating the matrix, define **criticality ranges** -- groupings of RPN values into risk categories. Common categories:

| Category | Typical Color |
|----------|--------------|
| HIGH | Red |
| MEDIUM HIGH | Orange |
| MEDIUM | Yellow |
| MEDIUM LOW | Light Green |
| LOW | Green |

The number of categories is flexible (3-5 is typical). The RPN range boundaries depend on your scale ranges.

### Instructions for the LLM

1. Build the RPN matrix using the confirmed severity and likelihood scales.
2. Propose criticality range boundaries and category names.
3. Color-code the matrix (describe colors in text for markdown; use actual colors in spreadsheet).

### Output Format

```markdown
## RPN Definition Matrix

|  | Sev 1 | Sev 2 | ... | Sev N |
|---|---|---|---|---|
| **Likelihood M** | [MxN] | ... | ... | [MxN] |
| ... | ... | ... | ... | ... |
| **Likelihood 1** | [1x1] | ... | ... | [1xN] |

## Criticality Categories

| RPN Range | Category | Color |
|-----------|----------|-------|
| [range] | HIGH | Red |
| [range] | MEDIUM HIGH | Orange |
| [range] | MEDIUM | Yellow |
| [range] | MEDIUM LOW | Light Green |
| [range] | LOW | Green |
```

### STOP GAP -- Checkpoint 4C

> "Here is the RPN matrix and proposed criticality categories. Please review:
> 1. Do the criticality thresholds make sense? (Is 'HIGH' the right cutoff?)
> 2. Are there enough categories to differentiate risk levels?
> 3. Should any boundaries be shifted?
>
> Confirm before I apply ratings to every cause in the FMEA."

**Do NOT proceed until the user confirms.**

---

## Sub-Step 4D: Assign Ratings to All Cause Rows

### Knowledge

Now apply the confirmed severity and likelihood scales to every row in the FMEA table. For each cause row:
1. Look at the failure effects associated with this cause
2. Assign a **severity** score using the confirmed severity scale (apply the "worst condition met" rule)
3. Assign a **likelihood** score using the confirmed likelihood scale
4. Calculate **RPN** = Severity x Likelihood
5. Look up the **Risk Criticality** category from the confirmed criticality ranges

**Important:** Different causes for the same failure mode may have DIFFERENT severity and likelihood scores. Assign independently for each cause row.

### Instructions for the LLM

1. For every cause row in the table, assign Severity, Likelihood, RPN, and Risk Criticality.
2. Flag any rows where you are uncertain about the rating -- explicitly state your reasoning and ask the user to verify.
3. Present the complete table.

### Output Format

Extend the full table:

```markdown
| Subsystem | Failure Mode | Failure Effects | Possible Cause | Severity | Likelihood | RPN | Risk Criticality |
|---|---|---|---|---|---|---|---|
| ... | ... | ... | ... | [1-N] | [1-M] | [SxL] | [category] |
```

### STOP GAP -- Checkpoint 4D

> "Here is the complete FMEA table with severity, likelihood, RPN, and risk criticality assigned to every cause. I have flagged [N] rows where I was uncertain.
>
> Please review:
> 1. Do the severity ratings accurately reflect the impact conditions?
> 2. Do the likelihood ratings reflect realistic probabilities for your system?
> 3. Do the resulting criticality categories feel right? Any surprising results?
> 4. Review the flagged uncertain rows -- what should the correct values be?
>
> Confirm before I proceed to Phase 5 (Corrective Actions)."

**Do NOT proceed until the user confirms.**

