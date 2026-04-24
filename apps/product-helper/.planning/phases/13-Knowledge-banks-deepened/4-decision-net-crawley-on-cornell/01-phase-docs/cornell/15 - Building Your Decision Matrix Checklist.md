# 15 — Building Your Decision Matrix: Step-by-Step Checklist

This is the **master workflow** that ties together every concept from the module into an actionable, step-by-step process. Use this checklist alongside your **Performance Criteria Worksheet** and **Decision Matrix Template** (Excel workbook).

---

## Before You Begin: Brainstorm Options

**What to do:**
Find some examples of potential candidates or options for your desired component/system.

**Guidelines:**
- This does not have to be an exhaustive list, but a variety of options can be helpful.
- Not all options need to completely meet all your project's needs — partial solutions are fine.
- The goal is to develop intuition about what makes a component great and what is potentially lacking.

**You are ready to move on when:**
- [ ] You have a list of potential options for your desired component.
- [ ] You and your teammates do **not** yet have to agree on which options are better than others.

> **Tool:** Record at least 3 options in your Performance Criteria Worksheet.

---

## Step 1: Decide on Performance Criteria

**What to do:**
Decide upon the criteria that you would judge a good choice on. This is one of the most important steps and should be given in-depth thought.

**Where to draw criteria from:**
- Constraints inherent in the problem definition
- The broader environment, situation, or context
- System components whose performance needs to be measured
- Subsystem requirements
- The highest level of functionality the project is helping to achieve
- What makes your brainstormed options desirable or lacking

**You are ready to move on when:**
- [ ] You have a list of **at least 6 criteria**.
- [ ] All major players involved with the decision have agreed to this list.
- [ ] You do **not** yet have to agree on which criteria are more important than others.

> **Tool:** Record criteria in your Performance Criteria Worksheet.
> **Pitfall check:** Make sure you haven't listed features/structural solutions as criteria (see [Step 04](04%20-%20Avoiding%20Performance%20Criteria%20Pitfalls.md)). Ask "Why does the customer value this?" to get to the real criterion.

---

## Step 2: Determine How to Measure Each Criterion

**What to do:**
For each criterion, define an objective way to measure it.

**For each criterion, specify:**
1. **Type of measure:** Direct or Scaled
2. **Units** (if direct measure)
3. **Value guidance:** High, low, and target values

**For scaled measures, create a conditions table:**

| Score | Conditions to Earn This Score |
|---|---|
| 1 | (worst valid solution conditions) |
| 2 | (improvement over 1) |
| 3 | (improvement over 2) |

**Critical rules for scale conditions:**
- A solution must meet **ALL** conditions within a scoring level to earn that score.
- Scoring conditions must **not overlap** — only one score level should be possible.
- Conditions should be **discerning** — if everything scores the same, you can't decide.
- Prefer 1–3 or 1–5 scales. Use 1–10 only when finer distinctions are truly needed.
- Scales should be **solution-independent** where possible.

**You are ready to move on when:**
- [ ] You have established a means for measuring each criterion.
- [ ] For scaled measures, you have defined scoring conditions.
- [ ] All major players involved with the decision have agreed to the measuring methods.

> **Tool:** Complete the Performance Measures table in your Performance Criteria Worksheet. For each scaled measure, create a scale conditions table.

---

## Step 3: Establish Min and Max Values

**What to do:**
For criteria where relevant, establish minimum and maximum acceptable values. Any component that falls outside these thresholds will never meet your needs.

**Note:** Not all criteria require min or max values.

**You are ready to move on when:**
- [ ] You have created min and max criteria measurement values for criteria that would benefit from these parameters.

---

## Step 4: Populate the Decision Matrix

**What to do:**
Insert your potential options and the criteria values into a matrix.

**Part One — Row and Column Headers:**
1. Open the **Decision Matrix Template**.
2. Add your criteria under the criteria column (copy from your Performance Criteria Worksheet).
3. Add the names of your options in the column headers.
4. Below your matrix, insert scale measure definitions for any scaled measures.

**Part Two — Determine Criteria Values:**
5. Add any known criteria values for each option.
6. Where you can't identify exact values, either:
   - Generate estimates based on the best information available (lean toward poorer performance scores for safety).
   - Perform additional research to obtain a confident value.

**Scoring rule:** All conditions for a given score must be met to earn that score. Do not average half-met conditions (e.g., don't give a 3.5). If you need finer distinctions, split the conditions across 2+ criteria.

**You are ready to move on when:**
- [ ] Your Decision Matrix has row headers for all criteria.
- [ ] At least one option is identified in a column header.
- [ ] You have added values for all criteria and options.

---

## Step 5: Normalize the Criteria Values

**What to do:**
Convert all raw values to a common scale (typically 0–1) so they can be compared and summed.

**Normalization methods:**

| Method | When to Use | Formula |
|---|---|---|
| **1 — Larger is better** | e.g., range, speed | `Value / Max Value` |
| **2 — Smaller is better** | e.g., cost, weight | `1 − (Value / Max Value)` |
| **3 — Baseline comparison** | When a specific target value is ideal | `1 − |Value − Target| / Max Deviation` |
| **4 — Custom ranking system** | Any scaled measure (e.g., 1–5) | `(Score − Min) / (Max − Min)` |
| **5 — Proportion of total** | When relative share matters | `Value / Sum of All Values` |

**Watch for bias:** Ask yourself if you are accidentally favoring one option. If one value is a huge outlier, a scaled measure may be more appropriate.

**You are ready to move on when:**
- [ ] All raw criteria values have been converted to your chosen normalization range (e.g., 0–1).
- [ ] Both raw values and normalized values are present in your matrix.

> **Tool:** See the "Normalization Methods" section in the Sample tab of the Decision Matrix Template.

---

## Step 6: Assign Weights to Each Criterion

**What to do:**
Assign a weight (relative importance) to each criterion, then normalize weights to percentages summing to 100%.

**Guidelines:**
- Start with a 1–5 or 1–10 scale, then convert to percentages.
- Multiple criteria may receive the same weight.
- Weights must be agreed upon by **all decision-makers**.
- Decide weights **without** looking at criteria values or normalized values (to avoid bias).

**To normalize weights:**
1. Sum all weights.
2. Divide each weight by the sum.
3. Verify all percentage weights total **100%** (or 1.0).

**You are ready to move on when:**
- [ ] You have assigned weights to all criteria.
- [ ] All assigned weights are expressed as percentages.
- [ ] The sum of assigned weights = 1 (100%).
- [ ] Everyone with decision-making authority agrees on the weights.

---

## Step 7: Calculate the Weighted Scores

**What to do:**

For each option:
1. Multiply each **normalized criteria value** by its respective **weight**.
2. Sum all resulting values → that option's **final weighted score**.
3. Repeat for every option.

**You are ready to move on when:**
- [ ] You have calculated final weighted scores for all options.

---

## Step 8: Interpret the Weighted Scores

**What to do:**
Analyze results to determine the best option or justify further investigation.

### Interpretation Process

1. **Review estimates** — Could any questionable estimates have influenced the final scores? Vary them between higher and lower plausible values.
2. **Examine close results** — Any options within ~10% of the top score should be investigated further.
3. **Plot options** — Order from highest to lowest score. Look for a natural "cutoff" point where scores drop suddenly.
4. **Sensitivity analysis:**
   - Change one uncertain score or weight → does the winner change?
   - Calculate best-case and worst-case bounds → do option ranges overlap?
5. **Question the metrics** — Are they truly measuring what matters for your situation?
6. **Iterate** — Return to earlier steps as needed.

### Refinement Options
- If a weight seems too high for what the metric actually measures, either broaden the metric's conditions or split it into sub-criteria.
- Composite criteria (e.g., *size* = 20% max dimension + 80% volume) are mathematically equivalent to separate criteria with redistributed weights.

**You are ready to move on when:**
- [ ] You have selected a final option, **or**
- [ ] You can show results that support a plan for further investigation.

---

## Quick Reference Summary

| Step | Action | Key Output |
|---|---|---|
| **Before** | Brainstorm options | ≥ 3 options in Worksheet |
| **1** | Select criteria | ≥ 6 agreed criteria |
| **2** | Define measures | Direct/Scaled + conditions tables |
| **3** | Set min/max values | Validity thresholds |
| **4** | Populate matrix | Raw scores for all options × criteria |
| **5** | Normalize scores | All values on 0–1 scale |
| **6** | Assign weights | Percentages summing to 100% |
| **7** | Calculate weighted scores | Final score per option |
| **8** | Interpret results | Decision or investigation plan |

---

**← Back to** [00 — Module Overview](00%20-%20Module%20Overview.md)
