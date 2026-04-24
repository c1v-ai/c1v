# Decision Matrix Glossary
> Alphabetical reference of all Decision Matrix terms. Cross-references indicate which instruction file introduces each term.

---

**10% Investigation Rule** -- If two options score within 10% of the top score, both deserve further examination before making a final decision. Prevents over-trusting small numerical differences. See Step 13.

**Bias Check** -- After normalizing, asking whether any single outlier value is distorting a criterion's scores across all options. If so, consider switching that criterion to a scaled measure. See Step 09.

**Conditions** -- The specific, measurable requirements that define each score level in a scaled measure. A solution must meet ALL conditions within a score level to earn that score. Conditions must not overlap. See Steps 05, 06.

**Criteria Score** (or Result / Value) -- The result of applying a metric to a criterion for a specific option. May be a direct measurement or a scaled-measure integer. See Step 02.

**Criterion** (or Attribute) -- A quality of a system that you care to measure. Must be solution-independent: applicable to any candidate option, not just one type. See Steps 02, 03.

**Custom Ranking System** -- Normalization Method 4. For criteria using a scaled measure with defined conditions. Formula: `(Score - Min of Scale) / (Max of Scale - Min of Scale)`. See Steps 09, 16.

**Decision Matrix** -- A specific kind of rubric -- combined scores from a group of metrics laid out in a matrix, used to help make a defensible decision. Contains four structural elements: options, performance criteria, scores, and weights. See Step 01.

**Defendable Decision** -- A decision backed by objective, measurable evidence that any evaluator would reach the same conclusion. The primary goal of building a decision matrix. See Step 01.

**Direct Measure** -- A criterion that can be expressed as a single, straightforward value with units (e.g., $1,000, 75 kg, 15 hours). Contrast with Scaled Measure. See Step 05.

**Feature** -- A structural solution or design element (e.g., "backup camera," "SSD storage"). Features are NOT performance criteria. To find the real criterion, ask: "Why does the customer value this feature?" See Step 04.

**Final Score** -- The sum of all weighted scores for a single option. Used to rank options, but should never be trusted as absolute without sensitivity analysis. See Steps 13, 16.

**Investigation Threshold** -- The score calculated as (Top Score - 10% of Top Score). Any option scoring at or above this threshold warrants further examination. See Step 13.

**Larger Is Better** -- Normalization Method 1. Divides each value by the largest value across all options. The best-performing option scores 1.0. Use for battery life, speed, range. See Steps 09, 16.

**Max Score** -- The highest acceptable score for a criterion. Rarely used, but applies when exceeding a threshold is undesirable. Options scoring above the maximum are invalid for that customer set. See Step 12.

**Metric** -- A formally defined way of measuring something. A single metric measures a single criterion. See Step 02.

**Min Score** -- The lowest score a solution can have for a criterion and still be considered valid. Options scoring below the minimum are assigned a total score of zero for that customer set. See Step 12.

**Normalization** -- The process of converting all raw scores to a common 0-1 scale so that criteria with different units and ranges can be compared and summed. Five methods are available. See Steps 09, 16.

**Normalized Score** -- A raw score converted to the 0-1 scale via one of the five normalization methods. Stored in a separate column set to the right of the raw values. See Steps 09, 16.

**Option** -- A candidate solution being evaluated in the decision matrix. Listed as column headers. See Step 01.

**Percentage Surprise Effect** -- The phenomenon where stakeholders are comfortable with raw weights (e.g., 1-5) but disagree when they see the mathematically equivalent percentages. Reveals hidden assumptions about relative importance. See Step 10.

**Performance Criteria** -- Measurable attributes that express how well any solution meets customer needs. Form the row labels of the decision matrix. Must be solution-independent and have at least 6 entries. See Steps 01, 03.

**Performance Delta** -- The potential gain from a criterion's current score to its expected score if additional work is done. Used to prioritize which tasks deliver the most value. See Step 14.

**Baseline Comparison** -- Normalization Method 3. For criteria with an ideal target value where deviations in either direction are bad. Formula: `1 - (|Value - Target| / Max Allowable Deviation)`. See Steps 09, 16.

**Proportion of Total** -- Normalization Method 5. Divides each value by the sum of all option values. Use when relative share matters more than comparison to a maximum. See Steps 09, 16.

**Proportionality Check** -- Asking whether a score of 3 truly represents three times the performance of a score of 1. If not, consider using an incomplete scale or nonlinear distribution. See Step 06.

**Raw Value** -- The original measured or estimated value for an option on a criterion, before normalization. Kept intact in the leftmost column set. See Step 16.

**Rejection Rule** -- Any option scoring below a minimum or above a maximum threshold for any criterion is assigned a total score of zero for that customer set, regardless of other scores. See Step 12.

**Requirement** -- A binary (pass/fail) condition that a solution must meet. Unlike performance criteria, requirements are not scored on a scale -- failure means the solution is invalid. Move requirements out of the decision matrix and into a separate requirements list. See Step 04.

**Rubric** -- A group of metrics used to measure a collective group of criteria. A decision matrix is a specific kind of rubric. See Step 02.

**Scaled Measure** -- A criterion measured on a numerical scale (1-3, 1-5, or 1-10) where each score level has defined conditions. Used when no single internationally recognized number exists for the criterion (e.g., aesthetics, environmental impact). See Steps 05, 06, 08.

**Sensitivity Analysis** -- Varying one uncertain score or weight between plausible bounds and checking whether the winning option changes. If the winner holds, the result is robust. If the winner flips, more data is needed. See Steps 08, 13.

**Smaller Is Better** -- Normalization Method 2. Divides each value by the largest, then subtracts from 1 to flip the scale. The lowest value scores highest. Use for cost, weight, defect rate. See Steps 09, 16.

**Solution-Independent** -- A quality of a good performance criterion or measurement scale: it can be applied to any valid solution type, not just one. See Steps 03, 08.

**Sub-Deliverable** -- A checkpoint that tests part of your final validation, similar to homework building toward a final exam. Provides feedback loops during development for subjective criteria. See Step 07.

**Weight** (or Priority) -- The relative importance of any single criterion compared to the others, expressed as a percentage. All weights must sum to 100%. Assigned without looking at scores to avoid bias. See Steps 02, 10, 11.

**Weighted Score** -- A normalized score multiplied by its criterion's weight. Summed per option to produce the final score. See Step 16.

---

**Back to** [00 -- Module Overview](00%20-%20Module%20Overview.md)
