# LLM Instructions — Filling `decision-matrix-template.schema.json`

Instructions for an LLM to populate the decision-matrix JSON for a specific project. Grounded in the Cornell CESYS521 course rules (see `16 - Decision Matrix Template Instructions.md` for human-facing canon).

You are filling **one decision matrix comparing up to 3 candidate options across up to 8 weighted criteria**, then returning the populated JSON.

---

## Inputs you need from the user

Before filling, confirm you have:

1. **Decision being made** (e.g., "Which caching strategy for the read API?").
2. **Candidate options** — exactly 2 or 3, named clearly. If > 3, ask the user to pre-narrow.
3. **Context for weighting** — stakeholder priorities, constraints, non-negotiables.
4. **Source of truth for raw values** — benchmarks, vendor docs, engineering estimates, or user-provided numbers.

If any of the above is missing, ask before producing output. Do not fabricate.

---

## Output contract

Return the full schema JSON with these blocks populated. Leave structural/schema-description fields untouched.

| Block | Your responsibility |
|---|---|
| `fields.project_name` … `fields.regulatory_refs` | Metadata — populate from user context; leave blank if unknown (never invent IDs). |
| `fields.decision_matrix` | The matrix itself — one row per criterion. |
| `fields.scale_measure_block` | One scale (1–5 rubric) per subjective criterion that uses a custom rating. |
| `static_text`, `merged_ranges`, `write_guidance`, `known_issues` | **Do not modify.** |

---

## Step-by-step fill procedure

### Step 1 — Choose criteria (5–8 rows)

Fill `fields.decision_matrix.columns[name="criterion"]` (column A) for rows 22 onward. Rules:

- **Minimum 6 criteria** unless the user explicitly waives this.
- Criteria must be **solution-independent** — they apply to *any* candidate, not only the ones shortlisted.
- State each as a measurable quality (e.g., "P95 latency (ms)"), not a feature ("has caching layer").
- Mix **direct measures** (numeric units) and **scaled measures** (1–5 rubrics) as appropriate.

### Step 2 — Enter raw values

Fill `value_option_a` / `value_option_b` / `value_option_c` (columns C/D/E). Rules:

- Use the **native unit** — do not convert yet ("600 ms" and "1.2 s" is OK; they get standardized at normalization).
- For unknown values, use your best estimate and lean **conservative** (worse score). Record the assumption in the `notes` column (O).
- For `N/A` or "does not apply," enter `"N/A"` as a string; it will be assigned the median score (0.5) at normalization.

### Step 3 — Enter Min/Max thresholds (columns F, G)

Only when a hard threshold truly exists. Rules:

- A value **below Min** or **above Max** disqualifies the option regardless of final score.
- Custom rating scales (1–5 rubrics) rarely have Min/Max — leave blank.
- Percentages and small ranges usually don't need Min/Max.

### Step 4 — Normalize (columns H, I, J → 0–1)

Fill `normalized_option_a/b/c` (columns H/I/J) as numbers in **[0, 1]**. Pick exactly one method per row and record it in the `notes` column (O).

**Decision tree:**

| Criterion shape | Method | Formula |
|---|---|---|
| More = better; clear maximum | **M1** Larger-is-better | `value / max(all values)` |
| Less = better; clear maximum | **M2** Smaller-is-better | `1 − (value / max(all values))` |
| Ideal target value with acceptable ± range | **M3** Baseline | `0.5 + (value − baseline) / (2 × max_abs_diff)`; subtract from 1 if smaller is better |
| Qualitative; needs custom rubric | **M4** Ranking tiers | Look up option against the 5-level rubric you define in `scale_measure_block` |
| Share-of-total matters more than max | **M5** Proportion | `value / sum(all values)` |
| Percentage (0–100%) | Direct | `value / 100` |
| Existing 1–5 or 1–10 rating | Direct | `value / max_of_scale` |
| Unknown / N/A | Assign median | `0.5` (or worst plausible) |

Constraint: every normalized cell must be in `[0.0, 1.0]`. Clamp if needed and note the clamp in column O.

### Step 5 — Assign weights (column K)

Fill `weight` for each criterion. Rules:

- **All weights together MUST sum to exactly 1.0** (allow ±0.01 rounding tolerance).
- Assign weights **without consulting** the normalized values — do Step 5 before looking at Step 4 numbers, or at least declare upfront you are not optimizing for a preferred option.
- Typical derivation: rate each criterion 1–5 for importance, divide by the sum, then round to two decimals.
- Multiple criteria may share the same weight.

### Step 6 — Do NOT fill columns L, M, N

`final_option_a/b/c` (columns L/M/N) are **pre-populated Excel formulas** (`=H22*$K22` etc.). The JSON schema marks them `user_fill: false`. If you emit these rows into JSON output, leave these three fields empty strings or null — the Excel write layer preserves the formula.

### Step 7 — Totals row (row 30)

Also pre-populated formulas. Leave alone.

### Step 8 — Unused rows (critical)

If you use fewer than 8 criteria, **every cell on rows after the last criterion through row 29 must be explicitly null** — including columns L, M, N. The template ships with space characters in H/I/J/K, which causes the L formula (`=H26*$K$26`) to evaluate to `#VALUE!` and poison the row-30 SUM. The JSON schema has `unused_rows_rule` documenting this; your output JSON should set those rows to `null` values.

### Step 9 — Scale measure block

For **each criterion that used Method 4** (custom ranking), provide a 1–5 rubric. In the JSON:

- `scale_criterion_name`: matches the criterion name exactly (column A value).
- `score_5_condition` … `score_1_condition`: text description for each tier.

Rules:

- **Conditions must not overlap.** An option must match exactly one tier.
- Higher tier = stricter / better outcome.
- Be specific ("P95 latency < 100 ms across all 5 endpoints"), not vague ("fast").
- The Excel template has room for only one scale block (rows 35–41). If multiple criteria need rubrics, list the extras in a separate `additional_scales` array under `scale_measure_block` and note that they need to be rendered below row 41 when writing to Excel.

---

## Validation checklist (run before returning)

- [ ] 6–8 criteria populated (or user waived the 6-minimum).
- [ ] Every option has a raw value or `"N/A"` — no silent blanks.
- [ ] All normalized values are in `[0, 1]`.
- [ ] Weights sum to `1.0 ± 0.01`.
- [ ] Every Method-4 criterion has a matching scale block.
- [ ] Unused rows (after last criterion through row 29) are fully null.
- [ ] Columns L, M, N are not populated (formulas will handle).
- [ ] Any clamps, estimates, or N/A substitutions are noted in column O.
- [ ] Metadata fields are either populated from user input or left blank — never invented.

---

## Interpretation guidance (for when the user asks for a recommendation after filling)

After the matrix is filled:

1. **Reject** any option whose raw value violates a Min or Max — before interpreting scores.
2. **Apply the 10% rule** — any option within 10% of the top final score is "in contention."
3. **Run sensitivity analysis** on any uncertain weight or normalized score — vary ±20%; if the winner flips, flag the weakness.
4. Present **the top score, the runner-up (if within 10%), and the sensitivity-weak criteria** — do not blindly declare "Option A wins."

---

## Out-of-scope behaviors

- Do **not** evaluate or rank options before the user provides context.
- Do **not** silently drop a criterion because data is missing — flag the gap.
- Do **not** round weights to avoid a non-1.0 sum; adjust one criterion explicitly.
- Do **not** write example values from the laptop selection tutorial into the user's real matrix.

---

**Source:** This is the LLM-oriented companion to `16 - Decision Matrix Template Instructions.md`. When in doubt about a rule, the course material wins — ask the user rather than guess.
