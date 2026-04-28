---
schema: phase-file.v1
phase_slug: llm-fill-instructions
module: 6
artifact_key: module_6/llm-fill-instructions
engine_story: m6-qfd
engine_path: apps/product-helper/.planning/engines/m6-qfd.json
fail_closed_audit: plans/v22-outputs/te1/fail-closed-audit.md#module-6-hoq
fail_closed_registry: apps/product-helper/lib/langchain/engines/fail-closed-runner.ts
kb_chunk_refs: []
legacy_snapshot: apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_legacy_2026-04-26/6-hoq/01-phase-docs/LLM-FILL-INSTRUCTIONS.md
rewritten_at: 2026-04-27
rewritten_by: kb-rewrite (Wave-E γ-shape, EC-V21-E.9)
---
# LLM Instructions — Filling `QFD-Template.schema.json`

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
- **Decisions consumed by this phase:** see `decisions[]` in the engine.json keyed on `target_field` containing `llm-fill-instructions` or by manual mapping in the story tree.

> Predicates are NOT inlined here. The engine.json is the source of truth; this markdown points at it.

## §3 Fallback rules

When no predicate in §2 matches:

1. `searchKB` retrieves top-3 chunks scoped to `{module: 6, phase: llm-fill-instructions}` (post-G8/G9 ingest).
2. If `searchKB` confidence < 0.90 OR returns zero chunks → `surfaceGap` emits `needs_user_input` to `system-question-bridge.ts` with computed_options + math_trace.
3. User answer re-enters the loop at ContextResolver.

> Fallback contract is shared across all phase files. Per-phase override (if any) is documented in the educational body below.

## §4 STOP-GAP rules (machine-readable)

- **artifact_key:** `module_6/llm-fill-instructions`
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
- **Runtime retrieval:** `searchKB(query, top_k, { module: 6, phase: 'llm-fill-instructions' })` over the `kb_chunks` table (`0011a_kb_chunks.sql`, ivfflat lists=100; HNSW upgrade gated on `>10k` rows).
- **Provenance:** every retrieved chunk carries `{kb_source, chunk_hash, content, embedding_distance}`; rendered by `why-this-value-panel.tsx` (`provenance-ui` agent).

> The `kb_chunk_refs` array in frontmatter is left empty until the embedder backfills it. The runtime path does not depend on the static array — it queries the live table.

---

## Educational content (legacy, preserved)

> The body below is the pre-Wave-E text verbatim. It documents *why* this phase exists, the systems-engineering theory behind the prescribed steps, and the example-driven walkthroughs the LLM (and human readers) consume. The 6 sections above are the schema-first overlay locked by Wave-E γ-shape.

Instructions for an LLM to populate the House of Quality (QFD) JSON for a specific project. Grounded in the Cornell CESYS525 course canon — see `00_QFD-OVERVIEW-AND-TERMINOLOGY.md` through `10_FINAL-REVIEW-AND-WRITTEN-ANSWERS.md` and `TEMPLATE_CELL-MAP.md`.

You fill **one House of Quality** for a system under design. Output: the populated JSON. Writing values into the Excel template is a **separate step** (AppleScript) — never use openpyxl to save.

---

## Inputs you need from the user

Before producing any JSON, confirm you have:

1. **System under design** — what "The System" is (1 sentence).
2. **Target customer / stakeholders** — whose voice the PCs represent.
3. **Performance Criteria source** — usually taken from the Requirements Table (OR.*, FR.*, NFR.*). The LLM should not invent PCs.
4. **Competitors** — names for Competitor B and Competitor C, and the source of their measured values.
5. **Engineering Characteristics candidates** — from the Requirement Constants Definition Table and/or engineering team brainstorm.

If any of the above is missing, ask before producing output.

---

## Output contract

| Block | Your responsibility |
|---|---|
| `metadata` | project_title, developed_by (author name), last_updated (today's date). |
| `front_porch` | Up to 12 Performance Criteria rows. |
| `second_floor` | Up to 26 Engineering Characteristics (names + direction of change). |
| `main_floor` | Relationship matrix (PC × EC), numeric values. |
| `roof` | EC-EC interrelationships in the **lower triangle only**. |
| `back_porch.unweighted` | Customer perception scores (1–5) for A(low/high/target), B, C per PC. |
| `basement` | Units, competitor values, thresholds, targets, technical difficulty, estimated cost. |
| `back_porch.weighted`, `formula_cells_dnd` | **Do not write.** Excel formulas handle these. |

---

## Step-by-step fill procedure

### Phase 1 — Front Porch (Performance Criteria)

**KB reference:** `01_FRONT-PORCH--PERFORMANCE-CRITERIA.md`

For each PC (target 8–12; max 12):

- `full_attribute` — customer-language goal. Convention: "The system shall …" or a measurable quality.
- `short_name` — 1–3 words for use in downstream diagrams.
- `relative_importance` — a weight in `[0, 1]`.

**Weight rules:**
- All PC weights together **must sum to 1.00** (±0.01).
- Method: rate each PC 1–5 for importance → divide by the sum → round to two decimals → adjust one entry if sum drifts.
- Do **not** peek at competitive scores or relationship marks while assigning weights.

**Direction of change** for each PC: `↑` (larger is better), `↓` (smaller is better), or `target` (a specific value is best).

**Do not populate:** `pc_id` (auto-formula in column A).

### Phase 2 — Second Floor (Engineering Characteristics)

**KB reference:** `03_SECOND-FLOOR--ENGINEERING-CHARACTERISTICS.md`

For each EC (target 10–20; max 26):

- `name` — the measurable design variable (e.g., "P95 API latency", "Cache hit rate", "Max concurrent users"). Not a feature name.
- `direction_of_change` — `↑`, `↓`, or `target`.
- **Unit** goes in the basement (row 45), not here.

**Quality check:** Every PC must be addressable by at least one EC. Any PC with no EC relationship ≠ 0 is a gap — flag it.

**Do not populate:** `ec_id` cells in column D (auto-formulas) or the EC ID row E29:AD29 (auto-formulas).

### Phase 3 — Main Floor (Relationship Matrix)

**KB reference:** `04_MAIN-FLOOR--RELATIONSHIP-MATRIX.md`

For each `(PC, EC)` intersection cell `E33:AD44`:

| Numeric value | Legend symbol | Meaning |
|---|---|---|
| **+2** | `+ +` | Strong positive: improving this EC strongly improves this PC |
| **+1** | `+`  | Positive |
| **0**  | (blank) | Neutral / not applicable |
| **−1** | `x`  | Negative: improving this EC hurts this PC |
| **−2** | `x x` | Strong negative |

**Critical — use numeric values, not strings.** The basement row-50 formula `=SUMPRODUCT(ABS(E33:E44), $D33:$D44)` depends on numeric cells.

**Asymmetric relationships** (rare): if an EC affects a PC differently depending on direction of change, use a string like `"-1/+1"`. Note in that cell's write-time comment that the formula-based imputed importance will need a manual replacement for that column.

**Sanity checks:**
- Row should have at least one nonzero cell (otherwise the PC has no ECs addressing it).
- Column should have at least one nonzero cell (otherwise the EC has no PC purpose — candidate for removal).
- Avoid more than ~30% of cells nonzero — dense matrices usually indicate poorly scoped ECs.

### Phase 4 — Roof (EC Interrelationships)

**KB reference:** `05_ROOF--EC-INTERRELATIONSHIPS.md`

For each pair `(EC_i, EC_j)` with `i < j`: write the interaction strength (same −2..+2 scale) at:

```
row = j + 2
column = i + 4   (E for i=1, F for i=2, …, AC for i=25)
```

**Critical:**
- Lower triangle only. **Never** write to the upper triangle (the mirror cell is intentionally blank).
- Example: EC1 ↔ EC2 → cell **E4**. EC7 ↔ EC26 → cell **K28**.

Interpretation:
- `+2 / +1`: improving one EC also improves the other → "free lunch" — acceptable to push both.
- `−2 / −1`: improving one EC hurts the other → tradeoff to flag for design targets (Phase 9).
- `0`: independent.

### Phase 5 — Back Porch (Competitive Scoring)

**KB reference:** `02_BACK-PORCH--SCORING-AND-COMPETITORS.md`

For each PC row, score each option on a **1–5 customer-perception scale**:

| Column | Meaning |
|---|---|
| `option_a_low`   | Your design at the low end of feasibility |
| `option_a_high`  | Your design at the high end of feasibility |
| `option_a_target`| Your intended target design |
| `option_b`       | Competitor B's current product |
| `option_c`       | Competitor C's current product |

Score source: for objective PCs, derive from competitor measured values (basement row 46/47). For subjective PCs (e.g., "Ease of use"), use user research or an internal rubric.

**Do not populate:** the weighted columns `AJ:AN` — formulas handle them.

### Phase 6 — Basement (per-EC operational data)

**KB references:** `06_*`, `07_*`, `08_*`, `09_*`

Per EC (one cell in column E..AD):

- `measurement_unit` (row 45): `ms`, `$`, `%`, `req/s`, `Table U1`, etc.
- `competitor_b_value` (row 46), `competitor_c_value` (row 47): actual measured values.
- `external_thresholds` (row 48): regulatory/contractual min/max. Any option violating this is rejected.
- `target` (row 49): your design target — the **single most important output** of the QFD.
- `technical_difficulty` (row 53): 1 (low) – 5 (high). Fill AFTER reading the auto-calculated `imputed_importance` (row 50) so the difficulty lens is informed.
- `estimated_cost` (row 54): 1 (low) – 5 (high).

Also:
- Rename `C46` from "Competitor Name B" to the actual competitor (e.g., "AWS Cognito").
- Rename `C47` from "Competitor Name C" similarly.

**Do not populate:** `imputed_importance` (row 50), `positive_imputed_importance` (row 51), `negative_imputed_importance` (row 52) — SUMPRODUCT formulas handle these.

### Phase 7 — Validation before returning

Run through:

- [ ] Sum of front_porch `relative_importance` = 1.00 ± 0.01.
- [ ] Every PC row in the main floor has ≥1 nonzero relationship cell.
- [ ] Every EC column in the main floor has ≥1 nonzero relationship cell.
- [ ] Roof values are in lower triangle only.
- [ ] Relationship values are numeric (or explicit asymmetric strings with a flag).
- [ ] Each basement column (E..AD) used by an EC has: unit, target, difficulty, cost.
- [ ] Competitor names in C46/C47 are real, not the generic placeholder.
- [ ] No writes to `formula_cells_dnd` cells/ranges.

---

## Interpretation guidance (post-fill)

After the JSON is filled and the Excel has been written + recalculated:

1. **Rank ECs by imputed importance (row 50)** — the highest-weighted ECs are where your engineering budget should go.
2. **Flag roof tradeoffs** — any negative roof cell between two high-imputed-importance ECs is a design conflict. Document how you intend to resolve it in `09_DESIGN-TARGETS.md`.
3. **Compare targets to competitor values** (basement rows 46/47 vs row 49) — if your target is not better than both competitors on a critical EC, revisit.
4. **Difficulty × Cost lens** — an EC with high imputed importance + high difficulty + high cost is the project's key risk. Call it out.

---

## Write protocol (after JSON is filled)

**Do NOT use openpyxl to save to the template.** It destroys merged cells, borders, and roof formatting.

**Preferred:** AppleScript (macOS). See `TEMPLATE_CELL-MAP.md` §"AppleScript Automation" for the safe-write template:

```bash
cp QFD-Template.xlsx QFD-Template-backup.xlsx         # 1. backup
osascript -e 'tell app "Microsoft Excel" to quit saving no' && sleep 2   # 2. close Excel
osascript <<'EOF'                                      # 3. open + write + save
tell application "Microsoft Excel"
  activate
  set wb to open workbook workbook file name "Macintosh HD:path:to:QFD-Template.xlsx"
  delay 2
  set ws to sheet "QFD Template" of wb
  set value of cell "B2" of ws to "Your Project Name"
  set value of cell "E33" of ws to 2
  -- … (one line per cell from the JSON)
  save wb
end tell
EOF
```

**Fallback:** openpyxl for **reading only** (validation, inspection). Never `wb.save()` on the template.

---

## Out-of-scope behaviors

- Do **not** invent PCs — they must come from the Requirements Table or user input.
- Do **not** invent competitor values — flag gaps and ask.
- Do **not** round weights to hide a drift away from 1.00; adjust one weight explicitly.
- Do **not** write the upper-triangle roof cells.
- Do **not** use openpyxl to save the template.
- Do **not** populate `ec_id`, `pc_id`, `imputed_importance`, weighted back-porch, or any cell in `formula_cells_dnd`.

---

**Source:** `TEMPLATE_CELL-MAP.md` + phases `00–10`. When in doubt about a rule, the course material wins — ask the user rather than guess.

