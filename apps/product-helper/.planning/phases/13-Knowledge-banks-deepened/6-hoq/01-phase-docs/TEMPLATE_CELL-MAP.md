---
schema: phase-file.v1
phase_slug: template-cell-map
module: 6
artifact_key: module_6/template-cell-map
engine_story: m6-qfd
engine_path: apps/product-helper/.planning/engines/m6-qfd.json
fail_closed_audit: plans/v22-outputs/te1/fail-closed-audit.md#module-6-hoq
fail_closed_registry: apps/product-helper/lib/langchain/engines/fail-closed-runner.ts
kb_chunk_refs: []
legacy_snapshot: apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_legacy_2026-04-26/6-hoq/01-phase-docs/TEMPLATE_CELL-MAP.md
rewritten_at: 2026-04-27
rewritten_by: kb-rewrite (Wave-E γ-shape, EC-V21-E.9)
---
# QFD Template Cell Map Reference

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
- **Decisions consumed by this phase:** see `decisions[]` in the engine.json keyed on `target_field` containing `template-cell-map` or by manual mapping in the story tree.

> Predicates are NOT inlined here. The engine.json is the source of truth; this markdown points at it.

## §3 Fallback rules

When no predicate in §2 matches:

1. `searchKB` retrieves top-3 chunks scoped to `{module: 6, phase: template-cell-map}` (post-G8/G9 ingest).
2. If `searchKB` confidence < 0.90 OR returns zero chunks → `surfaceGap` emits `needs_user_input` to `system-question-bridge.ts` with computed_options + math_trace.
3. User answer re-enters the loop at ContextResolver.

> Fallback contract is shared across all phase files. Per-phase override (if any) is documented in the educational body below.

## §4 STOP-GAP rules (machine-readable)

- **artifact_key:** `module_6/template-cell-map`
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
- **Runtime retrieval:** `searchKB(query, top_k, { module: 6, phase: 'template-cell-map' })` over the `kb_chunks` table (`0011a_kb_chunks.sql`, ivfflat lists=100; HNSW upgrade gated on `>10k` rows).
- **Provenance:** every retrieved chunk carries `{kb_source, chunk_hash, content, embedding_distance}`; rendered by `why-this-value-panel.tsx` (`provenance-ui` agent).

> The `kb_chunk_refs` array in frontmatter is left empty until the embedder backfills it. The runtime path does not depend on the static array — it queries the live table.

---

## Educational content (legacy, preserved)

> The body below is the pre-Wave-E text verbatim. It documents *why* this phase exists, the systems-engineering theory behind the prescribed steps, and the example-driven walkthroughs the LLM (and human readers) consume. The 6 sections above are the schema-first overlay locked by Wave-E γ-shape.

> Reference file -- not an execution step. Consult during any phase as needed.

## Template Overview

The QFD template (`QFD-Template.xlsx`) contains 4 sheets:

| Sheet | Purpose |
|-------|---------|
| Instructions | How to use the template |
| QFD Template | Blank template to fill in (this is where you work) |
| QFD Sample | Completed rover example for reference |
| Sample References | Engineering characteristic explanations for the rover |

The "QFD Template" sheet dimension is approximately A1:AN62. The "QFD Sample" sheet is approximately A1:AP71.

## Cell Position Formulas

For a QFD with **N** engineering characteristics:

### Second Floor (EC Headers)

| Element | Location |
|---------|----------|
| EC IDs | Column D, rows 3 through N+2 |
| EC names (diagonal) | EC_n at row `n+2`, column `n+5` |
| Direction-of-change arrows | Row below the last EC header |

### Main Floor (Relationship Matrix)

| Element | Location |
|---------|----------|
| EC columns | EC_n at column `n+4` (E=EC1, F=EC2, G=EC3, ...) |
| PC rows | Start below the direction-of-change row |
| Cell for EC_j × PC_i | Column `j+4`, row of PC_i |

### Roof (Lower Triangle)

For the interrelationship between EC_i and EC_j where `i < j`:

```
Row = j + 2
Column = i + 4
```

**Example with 26 ECs:**
- EC1 ↔ EC2: row 4, column E (cell E4)
- EC7 ↔ EC26: row 28, column K (cell K28)

**Critical**: Values go in the **lower triangle** (below-left of the diagonal), NOT the upper triangle.

### Front Porch (Performance Criteria)

| Element | Location |
|---------|----------|
| PC names | Column A or B (leftmost columns) |
| Optional descriptions | Column to the left of PC names |
| Relative importance weights | Column C or D (immediately right of PC names) |

### Back Porch (Competitive Scoring)

Located to the right of the main floor matrix. Typical column structure:

| Section | Content |
|---------|---------|
| Normalized Unweighted | A(low), A(high), B, C columns |
| Normalized Weighted | A(low), A(high), B, C columns (weighted = unweighted × PC weight) |
| Totals | Sum row at bottom of each weighted column |

### Basement

Located below the main floor. Scan for label rows -- positions vary by template configuration. Common structure from top to bottom:

| Row Label | Content |
|-----------|---------|
| Measurement Units | Unit per EC (m/s, $, N/A, Table reference) |
| Competitor B values | Actual EC values for Competitor B |
| Competitor C values | Actual EC values for Competitor C |
| (External) Requirement Thresholds | Min/max constraints per EC |
| Targets | Your design target values |
| Imputed Importance | Total imputed importance (%) |
| Positive Imputed Importance | Positive-only calculation (%) |
| Negative Imputed Importance | Negative-only calculation (%) |
| Technical Difficulty | 1-5 score per EC |
| Estimated Cost | 1-5 score per EC |

## Key Formulas in the Template

### Imputed Importance (per EC column)

The template may contain built-in formulas. The manual calculation:

```
Imputed Importance(EC_j) = SUMPRODUCT(ABS(main_floor_column_j), weight_column)
```

In Excel terms, for EC in column E with marks in E33:E44 and weights in D33:D44:

```excel
=SUMPRODUCT(ABS(E33:E44), D33:D44)
```

Or if using the absolute-marks approach:
```excel
=SUMPRODUCT(marks_column, weight_column)
```

### Weighted Performance Scores (back porch)

```excel
=normalized_score * importance_weight
```

Total:
```excel
=SUM(weighted_score_column)
```

### Weight Verification

```excel
=SUM(weight_column)   -- must equal 1.00 or 100%
```

## Lookup Tables for "Quality" ECs

When an EC is qualitative (e.g., "Path Planning Quality"), create a reference table. The template's Sample References sheet includes examples. Format:

| Index | Option | Description |
|-------|--------|-------------|
| 1 | Basic algorithm | Simple, fast, limited capability |
| 2 | Standard algorithm | Moderate complexity, good results |
| 3 | Advanced algorithm | High complexity, best results |
| 4 | State-of-art | Cutting-edge, highest capability |

Reference these tables in the Units row as "Table U1", "Table U2", etc. Place the tables below the QFD, in a separate tab, or in a separate document.

## AppleScript Automation (macOS)

When writing values to the template programmatically, use AppleScript to preserve formatting. Never use openpyxl to modify and save the template -- it destroys merged cells, borders, and formatting.

### Safe Write Protocol

```bash
# 1. Backup first
cp "QFD-Template.xlsx" "QFD-Template-backup.xlsx"

# 2. Close Excel (prevents stale memory overwrite)
osascript -e 'tell application "Microsoft Excel" to quit saving no'
sleep 2

# 3. Open and write values
osascript << 'EOF'
tell application "Microsoft Excel"
    activate
    set wb to open workbook workbook file name "Macintosh HD:Users:USERNAME:path:to:file.xlsx"
    delay 2
    set ws to sheet "QFD Template" of wb
    
    -- Example: write a relationship value
    set value of cell "E33" of ws to 2
    
    -- Example: write an asymmetric roof value (string)
    set value of cell "E4" of ws to "-1/+1"
    
    save wb
    return "Done"
end tell
EOF
```

**Key rules:**
- Always quit Excel before restoring from backup (Excel keeps files in memory)
- Use `delay 2` after open to let Excel fully load
- Strings for asymmetric values and labels; numbers for symmetric numeric values
- Use `active workbook` if the file is already open

### Reading the Template (safe with openpyxl)

openpyxl is safe for **reading only** (never save back to the same file):

```python
import openpyxl
wb = openpyxl.load_workbook('QFD-Template.xlsx', data_only=True)
ws = wb['QFD Template']
for row in ws.iter_rows(min_row=1, max_row=5, values_only=False):
    for cell in row:
        if cell.value:
            print(f'{cell.coordinate}: {cell.value}')
```

## Before Writing Any Values

Always verify template structure first:
1. Confirm where EC IDs start
2. Confirm where diagonal labels are positioned
3. Confirm where the main body starts
4. Confirm where basement rows are
5. Check for any merged cells that might affect value placement

Template structures can vary. Never assume cell positions without verifying.

---

**Back to** [Phase 0: Overview](00_QFD-OVERVIEW-AND-TERMINOLOGY.md) | **See also:** [Glossary](GLOSSARY.md)

