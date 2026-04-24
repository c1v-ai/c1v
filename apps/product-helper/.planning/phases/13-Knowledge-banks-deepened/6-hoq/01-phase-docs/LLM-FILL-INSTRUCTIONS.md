# LLM Instructions — Filling `QFD-Template.schema.json`

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
