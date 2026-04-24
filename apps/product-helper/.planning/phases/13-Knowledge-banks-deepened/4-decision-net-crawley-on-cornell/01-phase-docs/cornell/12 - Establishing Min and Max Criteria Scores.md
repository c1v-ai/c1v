# 12 — Establishing Min and Max Criteria Scores

## Prerequisites

- [ ] Step 11 complete — criteria weights agreed upon by the full team

## Context (Why This Matters)

When you develop a product for **multiple customer sets**, each set brings its own hard requirements. A solution that scores adequately on average may be **completely invalid** for one customer group because it fails a non-negotiable threshold. Without min/max boundaries, your matrix will recommend solutions that look good on paper but cannot actually ship to every intended audience.

Min and max scores act as pass/fail gates layered on top of the weighted scoring. They transform the matrix from a pure ranking tool into a **feasibility filter** — ensuring that no invalid solution survives simply because it excels elsewhere.

## Instructions

1. **Identify your distinct customer sets.** List each group that will use or purchase the solution. Label them (e.g., Customer Set A, Customer Set B).
2. **For each customer set, determine hard thresholds.** Walk through every criterion and ask: *"Is there a score below which this solution is unacceptable for this customer?"* Record that as the **minimum score**. Ask the same for upper bounds and record any **maximum score**.
3. **Add Min and Max columns to your matrix.** Place them adjacent to each criterion row so reviewers can see thresholds at a glance.

   | Column | Purpose |
   |---|---|
   | **Min Score** | The lowest score a solution can have for this criterion and still be valid |
   | **Max Score** | The highest acceptable score (used when exceeding a threshold is undesirable) |

4. **Apply the rejection rule.** Score each option against every criterion. If any option scores **below the minimum** or **above the maximum** for any criterion, assign that option a **total score of zero** for that customer set — regardless of performance on every other criterion.
5. **Keep invalid options visible.** Do not delete zeroed-out options from the matrix. They serve as a reminder of what would need to improve to make that solution viable for the customer set that rejected it.
6. **Apply thresholds selectively.** Not every criterion needs a min or max value. Set them only where a real threshold exists — where falling below (or above) a level makes the solution genuinely unacceptable, not merely less competitive.

## Worked Example

**Scenario:** You are selecting a laptop for two customer sets using 8 criteria (Battery Life, Cost, Weight, CPU, Memory, Warranty Coverage, Graphics Performance, Future Availability). Three options are under consideration:

| Option | Description | Price Point |
|---|---|---|
| **Option A** | High-end traditional laptop | ~$850 |
| **Option B** | Budget traditional laptop | ~$500 |
| **Option C** | Cloud/subscription thin client | ~$50/month |

**Customer Set A (Office Workers)** sets one hard threshold:
- Min CPU = 1.5 GHz (they run resource-intensive office suites)

**Customer Set B (Field Engineers)** sets two hard thresholds:
- Min Battery Life = 10 hrs (full-day field use without charging)
- Max Weight = 4 lbs (carried on-site all day)

**Evaluating Option B** (Budget laptop: CPU = 1.0 GHz, Battery = 8 hrs, Weight = 5 lbs):
- Customer Set A: CPU = 1.0 GHz < Min 1.5 GHz → **FAIL** → Total score for Set A = **0**
- Customer Set B: Battery = 8 hrs < Min 10 hrs → **FAIL** → Total score for Set B = **0**

**Evaluating Option C** (Subscription thin client: CPU = 1.7 GHz, Battery = 12 hrs, Weight = 2 lbs):
- Customer Set A: CPU = 1.7 GHz ≥ 1.5 GHz → **PASS**
- Customer Set B: Battery = 12 hrs ≥ 10 hrs → **PASS**; Weight = 2 lbs ≤ 4 lbs → **PASS**
- Option C passes both customer sets and proceeds to full weighted scoring.

Option B remains in the matrix (score = 0) as a visible record: it would need a CPU upgrade and weight/battery improvements before it could serve either customer set.

## Validation Checklist (STOP-GAP)

- [ ] Every customer set is explicitly listed with its own min/max thresholds
- [ ] Thresholds reflect genuine pass/fail requirements, not preferences
- [ ] The rejection rule has been applied: any option violating a threshold shows a total score of zero for that customer set
- [ ] Invalid options remain visible in the matrix (not deleted)
- [ ] Not every criterion has been given a min/max — only those with real hard limits

**STOP — Do not proceed to Step 13 until every box above is checked.**

## Output Artifact

Decision matrix with Min/Max columns populated and rejection rule applied for each customer set.

## Handoff to Next Step

Proceed to Step 13 to interpret the resulting scores, applying the 10% investigation rule and sensitivity analysis.

---

**← Previous:** [11 — Building Consensus Using Criteria Weights](11%20-%20Building%20Consensus%20Using%20Criteria%20Weights.md) | **Next →** [13 — Appropriately Interpreting Matrix Scores](13%20-%20Appropriately%20Interpreting%20Matrix%20Scores.md)
