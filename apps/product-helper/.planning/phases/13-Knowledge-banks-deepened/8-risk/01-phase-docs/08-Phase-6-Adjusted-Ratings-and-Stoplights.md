---
schema: phase-file.v1
phase_slug: phase-6-adjusted-ratings-and-stoplights
module: 8
artifact_key: module_8/phase-6-adjusted-ratings-and-stoplights
engine_story: m8-fmea-residual
engine_path: apps/product-helper/.planning/engines/m8-fmea-residual.json
fail_closed_audit: plans/v22-outputs/te1/fail-closed-audit.md#module-8-risk
fail_closed_registry: apps/product-helper/lib/langchain/engines/fail-closed-runner.ts
kb_chunk_refs: []
legacy_snapshot: apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_legacy_2026-04-26/8-risk/01-phase-docs/08-Phase-6-Adjusted-Ratings-and-Stoplights.md
rewritten_at: 2026-04-27
rewritten_by: kb-rewrite (Wave-E γ-shape, EC-V21-E.9)
---
# Phase 6: Adjusted Ratings, Effort Estimates, and Stoplight Charts

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
- **Decisions consumed by this phase:** see `decisions[]` in the engine.json keyed on `target_field` containing `phase-6-adjusted-ratings-and-stoplights` or by manual mapping in the story tree.

> Predicates are NOT inlined here. The engine.json is the source of truth; this markdown points at it.

## §3 Fallback rules

When no predicate in §2 matches:

1. `searchKB` retrieves top-3 chunks scoped to `{module: 8, phase: phase-6-adjusted-ratings-and-stoplights}` (post-G8/G9 ingest).
2. If `searchKB` confidence < 0.90 OR returns zero chunks → `surfaceGap` emits `needs_user_input` to `system-question-bridge.ts` with computed_options + math_trace.
3. User answer re-enters the loop at ContextResolver.

> Fallback contract is shared across all phase files. Per-phase override (if any) is documented in the educational body below.

## §4 STOP-GAP rules (machine-readable)

- **artifact_key:** `module_8/phase-6-adjusted-ratings-and-stoplights`
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
- **Runtime retrieval:** `searchKB(query, top_k, { module: 8, phase: 'phase-6-adjusted-ratings-and-stoplights' })` over the `kb_chunks` table (`0011a_kb_chunks.sql`, ivfflat lists=100; HNSW upgrade gated on `>10k` rows).
- **Provenance:** every retrieved chunk carries `{kb_source, chunk_hash, content, embedding_distance}`; rendered by `why-this-value-panel.tsx` (`provenance-ui` agent).

> The `kb_chunk_refs` array in frontmatter is left empty until the embedder backfills it. The runtime path does not depend on the static array — it queries the live table.

---

## Educational content (legacy, preserved)

> The body below is the pre-Wave-E text verbatim. It documents *why* this phase exists, the systems-engineering theory behind the prescribed steps, and the example-driven walkthroughs the LLM (and human readers) consume. The 6 sections above are the schema-first overlay locked by Wave-E γ-shape.

## Knowledge

After defining corrective actions, the next step is to estimate what the risk would look like IF those actions were implemented. This creates a "before vs. after" comparison that demonstrates the value of each corrective action and helps prioritize which to implement.

### Adjusted columns:
For each cause row that has a corrective action, add:
- **Adj. Severity** -- What would the severity be after the corrective action is applied? (Use the same severity scale from Phase 4A)
- **Adj. Likelihood** -- What would the likelihood be after the corrective action is applied? (Use the same likelihood scale from Phase 4B)
- **Adj. RPN** -- = Adj. Severity x Adj. Likelihood
- **Adj. Criticality** -- Look up the Adj. RPN in the same criticality ranges from Phase 4C

### Corrective Action Effort:
For each corrective action, estimate the effort required to implement it:
- **Time** (hours, days, weeks)
- **Budget** (cost or % of budget)
- **Resources** (special expertise, equipment, personnel)
- **References** to external plans (e.g., "15 hrs. See Timeline's IR Sensor Risk Plan B")

This creates a benefit-cost summary: the "benefit" is the risk reduction (original RPN minus adjusted RPN), and the "cost" is the effort.

### Stoplight charts:
A stoplight chart is a visual snapshot of your system's risk. It uses the same dimensions as your RPN matrix (Likelihood on Y-axis, Severity on X-axis), but instead of RPNs in the cells, it shows the **count of cause-rows** at that intersection.

You need **two** stoplight charts:
1. **Before corrective actions** -- count using original Severity and Likelihood values
2. **After corrective actions** -- count using Adj. Severity and Adj. Likelihood values

The visual comparison shows how risk shifts from the upper-right (high risk, red) toward the lower-left (low risk, green).

### Construction method:
1. Copy the structure of the RPN matrix
2. For each cell (Severity = S, Likelihood = L), count how many cause-rows in the FMEA have that exact combination
3. Place that count in the cell

### Example -- risk migration:
Before: 1 risk at (Sev 4, Lik 5) = RPN 20 = HIGH
After:  that same risk moves to (Sev 4, Lik 2) = RPN 8 = MEDIUM
This means the corrective action eliminated the HIGH risk.

## Input Required

- Confirmed FMEA table with corrective actions from Phase 5
- Confirmed severity scale, likelihood scale, and criticality ranges from Phase 4

## Instructions for the LLM

### Step 1: Assign adjusted ratings

For each cause row that has a corrective action:
1. Estimate the Adj. Severity -- would the corrective action change the severity? Often severity stays the same (the impact of failure doesn't change), but likelihood drops. Sometimes severity also drops if the action limits damage.
2. Estimate the Adj. Likelihood -- how much does the corrective action reduce the probability of occurrence?
3. Calculate Adj. RPN = Adj. Severity x Adj. Likelihood
4. Look up Adj. Criticality from the confirmed criticality ranges

### Step 2: Estimate effort

For each corrective action, provide an effort estimate. If information is insufficient, state assumptions and ask the user.

### Step 3: Build stoplight charts

1. **Before-actions stoplight chart**: Using the original Severity and Likelihood columns, count occurrences at each (Severity, Likelihood) intersection.
2. **After-actions stoplight chart**: Using the Adj. Severity and Adj. Likelihood columns, count occurrences at each intersection. For cause rows with no corrective action, use the original values.

## Output Format

### Extended FMEA Table:

```markdown
| F.# | Subsystem | Failure Mode | Failure Effects | Possible Cause | Sev | Lik | RPN | Criticality | Corrective Action | Adj. Sev | Adj. Lik | Adj. RPN | Adj. Criticality | Effort |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| F.1 | ... | ... | ... | ... | 4 | 5 | 20 | HIGH | [action] | 4 | 2 | 8 | MEDIUM | 15 hrs |
```

### Before-Actions Stoplight Chart:

```markdown
## Stoplight Chart: BEFORE Corrective Actions

|  | Sev 1 | Sev 2 | ... | Sev N |
|---|---|---|---|---|
| **Lik M** | [count] | [count] | ... | [count] |
| ... | ... | ... | ... | ... |
| **Lik 1** | [count] | [count] | ... | [count] |

Total risks: [sum]
```

### After-Actions Stoplight Chart:

```markdown
## Stoplight Chart: AFTER Corrective Actions

|  | Sev 1 | Sev 2 | ... | Sev N |
|---|---|---|---|---|
| **Lik M** | [count] | [count] | ... | [count] |
| ... | ... | ... | ... | ... |
| **Lik 1** | [count] | [count] | ... | [count] |

Total risks: [sum] (should equal the before chart)
```

### Risk Migration Summary:

```markdown
## Risk Migration Summary

| Criticality | Before | After | Change |
|-------------|--------|-------|--------|
| HIGH | [n] | [n] | [delta] |
| MEDIUM HIGH | [n] | [n] | [delta] |
| MEDIUM | [n] | [n] | [delta] |
| MEDIUM LOW | [n] | [n] | [delta] |
| LOW | [n] | [n] | [delta] |
```

---

## STOP GAP -- Checkpoint 6

**Present the full extended FMEA table, both stoplight charts, and the risk migration summary to the user. Ask:**

> "Here is the complete FMEA with adjusted ratings and the before/after stoplight charts. Please review:
> 1. Is the risk reduction from corrective actions sufficient? Are you satisfied with the 'after' stoplight chart?
> 2. Are the effort estimates reasonable?
> 3. Should we iterate with additional corrective actions to reduce risk further?
> 4. Do the total counts in both stoplight charts match? (They should -- same cause rows, just shifted.)
>
> If you want to iterate, I will add a second round of corrective actions and produce a new pair of stoplight charts. Otherwise, confirm to proceed to Phase 7 (Optional: Detectability and Troubleshooting) or declare the FMEA complete."

**Do NOT proceed until the user confirms.**

