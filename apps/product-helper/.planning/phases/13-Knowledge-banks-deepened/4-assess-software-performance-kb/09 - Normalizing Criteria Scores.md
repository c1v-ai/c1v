# 09 — Normalizing Criteria Scores

## Prerequisites

- [ ] Step 08 complete — all measures and scales defined for every criterion in your matrix

## Context (Why This Matters)

You cannot add $850 to 15 hours to a scale score of 4. When criteria use different units and ranges, raw values are incomparable. Normalization converts every score to a common **0–1** range so that criteria can be combined, weighted, and compared on equal footing.

Without normalization, criteria measured in large numbers (like cost in dollars) would dominate criteria measured in small numbers (like weight in kilograms), regardless of their actual importance.

## Instructions

1. **Create normalized-score columns.** Copy the option column headers to the right of the raw values section. These new columns will hold normalized scores; raw values stay intact in their original columns.
2. **Select a normalization method for each criterion.** Review the five methods below and choose the one that best fits each criterion's nature. These match the methods in [Step 16 — Template Instructions](16%20-%20Decision%20Matrix%20Template%20Instructions.md).
3. **Calculate normalized scores.** Apply the chosen method to every option's raw value for that criterion.
4. **Handle special cases.** Convert percentages, existing rating scales, and unknown values using the rules in the Special Cases table below.
5. **Check for normalization bias.** After normalizing, ask: *"Am I accidentally favoring one option?"* If a single outlier value distorts a criterion's normalized scores (e.g., one option is astronomically more expensive than the others), consider switching that criterion to a scaled measure instead.
6. **Record the results.** Keep raw values in the original columns and list normalized scores in the new columns. When presenting the matrix, you may show only normalized values and include raw values in an appendix.

## Normalization Methods

### Method 1 — Larger Is Better

```
Normalized = Value / Largest Value
```

The largest value across all options (or the largest expected value) becomes 1.0.

**Use for:** Battery life, CPU speed, range — anything where more is better.

### Method 2 — Smaller Is Better

```
Normalized = 1 − (Value / Largest Value)
```

This flips the scale: the lowest value becomes the highest score.

**Use for:** Cost, weight, defect rate — anything where less is better.

### Method 3 — Baseline Comparison

When there is an ideal target and deviations in either direction are bad:

```
Normalized = 1 − (|Value − Target| / Max Allowable Deviation)
```

The target scores 1.0; values at the maximum allowable deviation score 0.0.

**Use for:** Operating temperature, dimensions with tight tolerances — anything with a sweet spot.

### Method 4 — Custom Ranking System

For criteria using a scaled measure (e.g., 1–5 scale) with defined conditions:

```
Normalized = (Score − Min of Scale) / (Max of Scale − Min of Scale)
```

**Example:** A 1–5 scale: subtract 1 from all scores (now 0–4), then divide by 4.

| Raw Score | Calculation | Normalized |
|---|---|---|
| 1 | (1−1) / 4 | 0.00 |
| 3 | (3−1) / 4 | 0.50 |
| 5 | (5−1) / 4 | 1.00 |

**Use for:** Warranty coverage rated on a scale, aesthetics scores, subjective ratings.

### Method 5 — Proportion of Total

When you care about each option's share of the total rather than comparison to a maximum:

1. Convert all values to the same unit.
2. Sum **all** option values.
3. Divide each value by the sum.

**Use for:** Criteria where relative share matters more than absolute comparison.

## Handling Special Cases

| Situation | Approach |
|---|---|
| Percentages (e.g., 80% warranty) | Divide by 100 → 0.80 |
| Existing rating scales (e.g., 4 out of 5) | Divide by the max → 4/5 = 0.80 |
| Unknown / N/A values | Assign the worst plausible value or the median (0.50) |

## Worked Example

**E-Commerce Platform — Normalizing Launch Speed (Method 1 — Smaller Is Better)**

How soon can we start selling? Faster launch is better. See [Deployment & CI/CD KB](deployment-release-cicd-kb.md) for factors that influence time-to-market.

| Option | Launch Speed (weeks) | ÷ Largest (26) | 1 − Result | Normalized |
|---|---|---|---|---|
| Option A (Commercial, ~$2K/mo) | 4 | 0.15 | 0.85 | **0.85** |
| Option B (Custom Build, ~$500K) | 26 | 1.00 | 0.00 | **0.00** |
| Option C (Open-Source Hybrid, ~$200K) | 14 | 0.54 | 0.46 | **0.46** |

The slowest option (Option B at 26 weeks) scores 0.00. Option A scores highest because faster launch is better.

**E-Commerce Platform — Normalizing Total Cost over 3 Years (Method 2 — Smaller Is Better)**

Convert all options to a comparable 3-year total cost of ownership. See [System Architecture KB](software_architecture_system.md) for how to think about total cost of ownership in software systems.

| Option | 3-Year TCO | ÷ Largest ($680K) | 1 − Result | Normalized |
|---|---|---|---|---|
| Option A (Commercial) | $72K | 0.11 | 0.89 | **0.89** |
| Option B (Custom Build) | $680K | 1.00 | 0.00 | **0.00** |
| Option C (Open-Source Hybrid) | $290K | 0.43 | 0.57 | **0.57** |

The most expensive option (Option B at $680K) scores 0.00. Option A scores highest because lower total cost is better. Note how normalization reveals the true cost gap — Option B is not just "more expensive," it is 9.4× the cost of Option A over three years.

## Validation Checklist (STOP-GAP)

- [ ] Every criterion has a normalization method assigned
- [ ] All normalized scores fall within the 0–1 range
- [ ] The best-performing option for each criterion scores closest to 1.0
- [ ] The worst-performing option for each criterion scores closest to 0.0
- [ ] Raw values are preserved in their original columns
- [ ] No single outlier is distorting the normalized scores for a criterion
- [ ] Special cases (percentages, rating scales, N/A values) are handled consistently

**STOP — Do not assign weights until every criterion's scores are normalized and verified.**

## Output Artifact

Completed normalized-score columns in the decision matrix, with one normalization method identified per criterion.

## Handoff to Next Step

Proceed to Step 10 to assign importance weights to each criterion.

---

**← Previous:** [08 — Crafting an Effective Measurement Scale](08%20-%20Crafting%20an%20Effective%20Measurement%20Scale.md) | **Next →** [10 — Assigning Weights to Criteria](10%20-%20Assigning%20Weights%20to%20Criteria.md)
