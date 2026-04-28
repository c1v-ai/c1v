# 16 — How to Fill Out the Decision Matrix Template

This guide walks you through every cell of the Decision Matrix spreadsheet, step by step. A **laptop selection** example is used throughout to show exactly what goes where.

---

## The Template at a Glance

The spreadsheet grows across **three column groups** as you progress:

| Column Group | Contains |
|---|---|
| **Values** (left) | Criteria names, raw scores for each option, Min/Max thresholds |
| **Normalized Values** (middle) | Every raw score converted to a 0–1 scale |
| **Weighted Scores** (right) | Each normalized score × its weight |

The bottom row, **Score Totals**, accumulates sums in each group.

---

## Steps 0–2: Set Up the Matrix Shell

**Goal:** Create the empty grid with criteria rows and option columns.

### What to fill in

| Cell | What to enter | Example |
|---|---|---|
| **Criteria column** (rows) | One performance criterion per row — these are qualities you will measure, not features | Battery Life, Cost, Weight, CPU, Memory, Warranty Coverage, Graphics, Future Availability |
| **Option column headers** | The name of each candidate solution you are comparing | Option A, Option B, Option C |

### Rules

- List **at least 6 criteria** (more is fine).
- Criteria must be **solution-independent** — they should apply to *any* candidate, not just the ones you've already found.
- Do **not** fill in any values yet — leave the body of the matrix blank.

### Scaled-measure definitions

For any criterion that uses a **scaled measure** (not a direct number), create a conditions table below or beside the matrix.

**Example — Graphics Performance Measurement Scale:**

| Score | Scale Condition |
|---|---|
| 5 | Maximum resolution at highest frame rate for **all** 5 sample programs |
| 4 | Max resolution/frame rate for **3 of 5** programs; remaining 2 at 2nd-largest resolution, highest frame rate |
| 3 | Max resolution/frame rate for **1 of 5** programs; remaining 4 at 2nd-largest resolution, 2nd-highest frame rate |
| 2 | 2nd-highest resolution, 2nd-highest frame rate for **3 of 5** programs; remaining 2 at 2nd-largest resolution, 3rd-highest frame rate |
| 1 | All programs at 2nd-largest resolution/3rd-highest frame rate, or 3rd-largest resolution/2nd-largest resolution |

> **Tip:** A solution must meet **all** conditions within a level to earn that score. Conditions must not overlap — only one score should be possible for any solution.

---

## Steps 3–4: Enter Raw Values and Min/Max Thresholds

**Goal:** Populate the "Values" section of the matrix.

### What to fill in

| Cell | What to enter |
|---|---|
| **Each criterion × option cell** | The raw measured or estimated value for that option |
| **Min Value column** | The lowest acceptable value (any option below this is rejected) |
| **Max Value column** | The highest acceptable value (any option above this is rejected) |

### Example (laptop)

| Criteria | Option A | Option B | Option C | Min Value | Max Value |
|---|---|---|---|---|---|
| Battery Runtime | 15 hrs | 600 min. | 12 hrs | 8 hrs | |
| Cost (dollars) | 850 | 500 | $50/month | | $1,000 |
| Weight (pounds) | 5 | 3.5 | 2 | | 7 |
| CPU | 2.0 GHz | 1.0 GHz | 1.7 GHz | 1.0 GHz | |
| Memory | 2 GB | 1.75 GB | 1280 MB | 1 GB | |
| Warranty Coverage | 100% | 80% | 99% | | |
| Graphics | 5 | 3 | 4 | | |
| Future Availability | 5 yrs | yes | N/A | yes | |

### Important notes

- **Convert nothing yet** — enter values in their original units, even if inconsistent (hours vs. minutes, GB vs. MB). You will standardize units during normalization.
- Not every criterion needs a Min or Max. Only add them where a threshold truly exists.
- Min/Max values are rare for custom rating systems (like the Graphics scale) unless the scale was borrowed from an external standard.
- If you cannot find an exact value, enter your **best estimate** — lean toward a poorer score to be conservative.
- For scaled measures (like Graphics), enter the integer score the option earns from your conditions table.

---

## Step 5: Normalize All Values

**Goal:** Convert every raw value to a **0–1 scale** so they can be compared and summed.

The matrix now expands to the right with a second set of option columns under **Normalized Values**. Before normalizing, standardize units within each row (e.g., convert 600 min → 10 hrs, 1280 MB → 1.28 GB, $50/month → $600/yr).

### Five normalization methods

Choose the method that best fits each criterion:

---

#### Method 1 — Larger is better (divide by largest)

**Use for:** Battery life, CPU speed, or anything where more = better.

| | Formula |
|---|---|
| 1 | Convert all values to the same unit |
| 2 | Find the **largest** value among all options |
| 3 | Divide each value by the largest → normalized score |

**Example — Battery Runtime:**

| | Option A | Option B | Option C |
|---|---|---|---|
| Raw | 15 hrs | 600 min. | 12 hrs |
| Converted | 15 | 10 | 12 |
| Largest = 15 | | | |
| **Normalized** | **1.00** | **0.67** | **0.80** |

---

#### Method 2 — Smaller is better (divide by largest, subtract from 1)

**Use for:** Cost, weight, or anything where less = better.

| | Formula |
|---|---|
| 1 | Convert all values to the same unit |
| 2 | Divide each value by the **largest** value |
| 3 | **Subtract** the result from **1** |

**Example — Cost:**

| | Option A | Option B | Option C |
|---|---|---|---|
| Raw | $850 | $500 | $50/month |
| Converted (1-yr) | 850 | 500 | 600 |
| Divide by largest (850) | 1.00 | 0.59 | 0.71 |
| **Normalized (1 − result)** | **0.00** | **0.41** | **0.29** |

---

#### Method 3 — Baseline comparison

**Use for:** Criteria where you have a target/ideal value and want to measure deviation from it.

| | Formula |
|---|---|
| 1 | Set a **baseline** value (the ideal target) |
| 2 | Calculate the **difference** from baseline for each option |
| 3 | Define a **range size** = 2 × maximum allowable absolute difference |
| 4 | Divide each difference by the range size |
| 5 | Add **0.5** to shift the scale from (−0.5 to 0.5) → (0 to 1) |
| 6 | If smaller is better, subtract the result from 1 |

**Example — Weight (baseline = 3 lbs, max absolute difference = 2):**

| | Option A | Option B | Option C |
|---|---|---|---|
| Raw (lbs) | 5 | 3.5 | 2 |
| Difference from baseline (3) | 2 | 0.5 | −1 |
| Range size = 4 | | | |
| Divide by range | 0.5 | 0.125 | −0.25 |
| Add 0.5 | 1.0 | 0.625 | 0.25 |
| **Normalized (1 − result, lighter is better)** | **0.00** | **0.375** | **0.75** |

---

#### Method 4 — Custom ranking system

**Use for:** Criteria where you create a scaled measure with defined conditions (like the Graphics scale, or turning a direct measure into score bands).

| | Formula |
|---|---|
| 1 | Define normalized score levels with conditions |
| 2 | Match each option to its score level |

**Example — CPU:**

| Normalized Score | Scale Condition |
|---|---|
| 1.00 | Processor speed ≥ 1.8 GHz |
| 0.75 | Processor speed ≥ 1.5 GHz |
| 0.50 | Processor speed ≥ 1.3 GHz |
| 0.25 | Processor speed ≥ 1.0 GHz |
| 0.00 | Processor speed ≥ 0.75 GHz |

| | Option A (2.0 GHz) | Option B (1.0 GHz) | Option C (1.7 GHz) |
|---|---|---|---|
| **Normalized** | **1.00** | **0.25** | **0.75** |

---

#### Method 5 — Proportion of total

**Use for:** When you care about each option's share of the total rather than comparison to a maximum.

| | Formula |
|---|---|
| 1 | Convert all values to the same unit |
| 2 | Sum **all** option values |
| 3 | Divide each value by the sum |

**Example — Memory:**

| | Option A | Option B | Option C |
|---|---|---|---|
| Raw | 2 GB | 1.75 GB | 1280 MB |
| Converted (GB) | 2.00 | 1.75 | 1.28 |
| Sum = 5.03 | | | |
| **Normalized** | **0.40** | **0.35** | **0.25** |

---

### Special cases

| Situation | What to do | Example |
|---|---|---|
| **Percentages** | Convert directly to 0–1 (divide by 100) | Warranty 100% → 1.00, 80% → 0.80, 99% → 0.99 |
| **Existing rating scales** | Convert directly to 0–1 (divide by max score) | Graphics score 5 on a 1–5 scale → 5/5 = 1.00, 3/5 = 0.60 |
| **Unknown / N/A values** | Assign the **worst** or **median** normalized score (0.50 is common for a 0–1 scale) | Future Availability "N/A" → 0.50 |

### Completed normalized values (laptop example)

| Criteria | Opt A | Opt B | Opt C | Method used |
|---|---|---|---|---|
| Battery Runtime (hours) | 1.00 | 0.67 | 0.80 | Method 1 — larger is better |
| Cost (dollars, 1-yr) | 0.00 | 0.41 | 0.29 | Method 2 — smaller is better |
| Weight (pounds) | 0.00 | 0.38 | 0.75 | Method 3 — baseline comparison |
| CPU (GHz) | 1.00 | 0.25 | 0.75 | Method 4 — custom ranking |
| Memory (GB) | 0.40 | 0.35 | 0.25 | Method 5 — proportion of total |
| Warranty Coverage (%) | 1.00 | 0.80 | 0.99 | Percentage → 0–1 |
| Graphics (5 is best) | 1.00 | 0.60 | 0.80 | Rating scale → 0–1 |
| Future Availability | 1.00 | 1.00 | 0.50 | N/A value → median (0.50) |
| **Score Totals** | **5.40** | **4.45** | **5.14** | |

> **Bias check:** If one option's normalized score seems unfairly extreme because of a single outlier value, consider switching that criterion to a scaled measure instead.

---

## Step 6: Assign Weights

**Goal:** Capture how important each criterion is relative to the others. The matrix adds a **Weight** column.

### How to do it

1. **Rate each criterion** on a consistent scale (e.g., 1–5):

| Criterion | Raw Weight (1–5) |
|---|---|
| Battery Life | 5 |
| Cost | 5 |
| Weight | 3 |
| CPU | 3 |
| Memory | 5 |
| Warranty Coverage | 3 |
| Graphics | 4 |
| Future Availability | 3 |

2. **Convert to percentages** — divide each raw weight by the sum of all raw weights:

| Criterion | Raw Weight | Calculation | Percentage Weight |
|---|---|---|---|
| Battery Life | 5 | 5 / 31 | 0.16 |
| Cost | 5 | 5 / 31 | 0.16 |
| Weight | 3 | 3 / 31 | 0.10 |
| CPU | 3 | 3 / 31 | 0.10 |
| Memory | 5 | 5 / 31 | 0.16 |
| Warranty Coverage | 3 | 3 / 31 | 0.10 |
| Graphics | 4 | 4 / 31 | 0.13 |
| Future Availability | 3 | 3 / 31 | 0.10 |
| **Total** | **31** | | **1.00** |

3. **Verify** the Weight column sums to **1.00** (100%).

### Rules

- Assign weights **without looking at** the normalized values — this prevents bias toward a preferred option.
- Multiple criteria may share the same weight.
- All decision-makers must **agree** on the weights before proceeding.

---

## Step 7: Calculate Weighted Scores

**Goal:** Produce a single final score for each option. The matrix adds a third set of option columns under **Weighted Scores**.

### Formula

For each cell:

```
Weighted Score = Normalized Value × Weight
```

Then sum the column for each option's **Final Score**.

### Example

| Criteria | Norm A | Norm B | Norm C | Weight | **Wtd A** | **Wtd B** | **Wtd C** |
|---|---|---|---|---|---|---|---|
| Battery Runtime | 1.00 | 0.67 | 0.80 | 0.16 | 0.16 | 0.11 | 0.13 |
| Cost | 0.00 | 0.41 | 0.29 | 0.16 | 0.00 | 0.07 | 0.05 |
| Weight | 0.00 | 0.38 | 0.75 | 0.10 | 0.00 | 0.04 | 0.07 |
| CPU | 1.00 | 0.25 | 0.75 | 0.10 | 0.10 | 0.02 | 0.07 |
| Memory | 0.40 | 0.35 | 0.25 | 0.16 | 0.06 | 0.06 | 0.04 |
| Warranty Coverage | 1.00 | 0.80 | 0.99 | 0.10 | 0.10 | 0.08 | 0.10 |
| Graphics | 1.00 | 0.60 | 0.80 | 0.13 | 0.13 | 0.08 | 0.10 |
| Future Availability | 1.00 | 1.00 | 0.50 | 0.10 | 0.10 | 0.10 | 0.05 |
| **Score Totals** | | | | | **0.64** | **0.54** | **0.61** |

### Min/Max rejection check

Before interpreting scores, **reject any option** whose raw value violates a Min or Max threshold. An option that fails even one threshold is invalid — its final score is irrelevant.

---

## Step 8: Interpret the Results

**Goal:** Turn the numbers into a defensible decision.

### 8a — Apply the 10% rule

1. Identify the **top score**: 0.64 (Option A)
2. Calculate **10% of the top score**: 0.064
3. Set the **investigation threshold**: 0.64 − 0.064 = **0.58**
4. Any option scoring **≥ 0.58** deserves closer examination

| Option | Final Score | Within 10%? |
|---|---|---|
| Option A | 0.64 | Yes (top) |
| Option C | 0.61 | Yes |
| Option B | 0.54 | No |

**Result:** Options A and C are close enough to warrant further investigation. Option B can be set aside.

### 8b — Graph the results

Plot options from highest to lowest score. Look for a **kink or drop-off** — a natural gap that separates strong candidates from weaker ones.

```
Score
0.66 |
0.64 | ■ Option A
0.62 |
0.60 | ■ Option C
0.58 |-------- investigation threshold
0.56 |
0.54 | ■ Option B
0.52 |
     +-------------------
       A       C       B
```

The gap between C (0.61) and B (0.54) is larger than the gap between A (0.64) and C (0.61), reinforcing that A and C are the real contenders.

### 8c — Sensitivity analysis

For any score or weight you are uncertain about:
1. **Vary the uncertain value** between its plausible high and low bounds.
2. Recalculate final scores.
3. Ask: **Does the winning option change?**

If the winner stays the same across all reasonable variations, you have a confident decision. If the winner flips, you need more data on that criterion before deciding.

---

## Quick-Reference: Column Layout of a Completed Matrix

```
┌─────────────────────────── VALUES ───────────────────────────┐ ┌── NORMALIZED ──┐ ┌─────┐ ┌── WEIGHTED ──┐
│ Criteria │ Opt A │ Opt B │ Opt C │ Min │ Max │ │ A │ B │ C  │ │ Wt  │ │ A │ B │ C  │
├──────────┼───────┼───────┼───────┼─────┼─────┤ ├───┼───┼────┤ ├─────┤ ├───┼───┼────┤
│ (rows)   │ raw   │ raw   │ raw   │     │     │ │0-1│0-1│0-1 │ │ %   │ │N×W│N×W│N×W │
├──────────┼───────┼───────┼───────┼─────┼─────┤ ├───┼───┼────┤ ├─────┤ ├───┼───┼────┤
│ Totals   │       │       │       │     │     │ │ΣN │ΣN │ΣN  │ │1.00 │ │ΣW │ΣW │ΣW  │
└──────────┴───────┴───────┴───────┴─────┴─────┘ └───┴───┴────┘ └─────┘ └───┴───┴────┘
                                                                          ↑ final scores
```

---

## Common Mistakes to Avoid

| Mistake | Why it's a problem | Fix |
|---|---|---|
| Mixing units within a row without converting | Normalization will be wrong | Standardize units before normalizing |
| Forgetting to flip the scale for "smaller is better" | A high cost would score high | Use Method 2 (subtract from 1) |
| Looking at scores while assigning weights | Biases weights toward a preferred option | Cover or hide the Normalized Values column first |
| Giving a "3.5" on a 1–5 scale | Means your conditions overlap | Refine conditions so each level is distinct |
| Treating N/A as zero | Unfairly penalizes that option | Use the median (0.50) or worst plausible value |
| Skipping the 10% / sensitivity check | Over-trusting small numerical differences | Always run Step 8 analysis |

---

**← Back to** [00 — Module Overview](00%20-%20Module%20Overview.md) | [15 — Checklist](15%20-%20Building%20Your%20Decision%20Matrix%20Checklist.md) | **Next →** [17 — From Decision Matrix to QFD](17%20-%20From%20Decision%20Matrix%20to%20QFD.md)
