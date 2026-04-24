# 13 — Appropriately Interpreting Matrix Scores

## Prerequisites

- [ ] Step 12 complete — min/max thresholds set and rejection rule applied

## Context (Why This Matters)

A decision matrix produces a number, and numbers feel authoritative. But the matrix is only as accurate as the metrics, estimates, and weights you fed into it. A 1–5 scale cannot distinguish between a 3.2 and a 3.4. Lousy metrics combined with lousy estimates produce lousy results — yet people routinely trust matrix outputs simply because the tool exists. If you skip rigorous interpretation, you risk selecting the wrong option with false confidence.

The 10% rule and sensitivity analysis exist to counteract this overconfidence. They force you to ask: *"Would small, plausible changes to my inputs change the outcome?"* If yes, the matrix has narrowed your options but has not made your decision — and that distinction matters.

## Instructions

1. **Sum the weighted scores for each option.** The option with the highest total is the leading candidate — but do not stop there.
2. **Apply the 10% investigation rule.** Calculate 90% of the top score. Any option scoring at or above that threshold deserves further examination rather than immediate elimination. Adjust the percentage based on your confidence in the inputs (lower confidence → wider band).
3. **Run a sensitivity analysis on uncertain inputs.** Use one or both approaches:

   **Approach 1 — Vary one score or weight at a time.** Pick a score or weight you are uncertain about. Change it to a plausible alternative value. Check whether the winning option changes.
   - If the winner holds → your result is robust for that variable.
   - If the winner changes → invest in getting more accurate data for that criterion before deciding.

   **Approach 2 — Best-case / worst-case bounds.** For each option:
   1. Set all uncertain values to their most **optimistic** plausible estimates → best-case score.
   2. Set all uncertain values to their most **pessimistic** estimates → worst-case score.
   3. Compare the ranges across options. If ranges overlap significantly, you need more data before choosing.

4. **Question the metrics themselves.** If results seem strange, challenge whether your metrics truly measure what matters for your specific situation. Ask:
   - Are these metrics based on outdated standards or regulations?
   - Do they actually apply at the scale and context of your project?

5. **Remember the Titanic cautionary tale.** When the Titanic was built, lifeboat regulations covered ships of at most 10,000 tons. The Titanic displaced 46,000 tons — 4.5x the regulation's scope. By the outdated metric, its 20 lifeboats rated as "excellent," satisfying program managers despite the chief designer requesting 64. The metric was technically met. The metric was also dangerously irrelevant. **Never blindly trust a metric just because it exists. Always verify that it actually applies to your situation.**

## Worked Example

**Scenario:** After applying weights and the min/max rejection rule from Step 12, the three e-commerce platform options produce these final weighted scores (on a 0–1 normalized scale):

| Option | Final Score |
|---|---|
| **Option A** (Commercial platform, ~$2K/mo) | 0.68 |
| **Option C** (Open-source hybrid, ~$200K) | 0.63 |
| **Option B** (Custom build, ~$500K) | 0.52 |

**Step 1 — Apply the 10% rule:**
- Top score = 0.68
- 10% threshold = 0.68 × 0.90 = **0.61**
- Option A (0.68) and Option C (0.63) are both above 0.61 → both deserve further investigation
- Option B (0.52) falls below 0.61 → it can be set aside (its high cost and long timeline dragged its weighted score down significantly)

**Step 2 — Sensitivity analysis on the Growth Ceiling weight:**
- Growth Ceiling (Scalability) currently carries a weight of 0.10. Vary it ±3% (to 0.07 and 0.13). See [Data Model KB](data-model-kb.md) and [CAP Theorem KB](cap_theorem.md) for why scalability ceilings matter.
- At weight = 0.13: Option C (customizable, no vendor ceiling) overtakes Option A → **the winner changes**.
- At weight = 0.07: Option A remains on top.
- Conclusion: The Growth Ceiling weight is a **sensitive variable**. If the business expects to grow beyond Shopify's built-in limits within 3 years, that criterion deserves a higher weight — and the decision flips. Before committing, get the leadership team to confirm their 3-year growth ambitions.

**Step 3 — Question the metrics:**
- The "Reliability (Uptime)" criterion uses the vendor's published SLA as its primary metric. Ask: does a vendor's *promised* uptime actually predict *experienced* uptime? Shopify's SLA may say 99.99%, but third-party monitoring sites track actual outages — and the real number may differ. See [Observability KB](observability-kb.md) for how to measure uptime independently rather than trusting vendor claims.

## Validation Checklist (STOP-GAP)

- [ ] Final weighted scores have been summed for every option
- [ ] The 10% investigation threshold has been calculated and applied
- [ ] At least one sensitivity analysis has been performed on an uncertain weight or score
- [ ] Metrics have been reviewed for relevance — no outdated or misapplied standards accepted uncritically
- [ ] The interpretation distinguishes between "highest score" and "confident best choice"

**STOP — Do not proceed to Step 14 until every box above is checked.**

## Output Artifact

Interpreted score table with 10% threshold applied, sensitivity analysis results documented, and any flagged metrics noted.

## Handoff to Next Step

Proceed to Step 14 to learn how to use the decision matrix as a living tool throughout the project lifecycle.

---

**← Previous:** [12 — Establishing Min and Max Criteria Scores](12%20-%20Establishing%20Min%20and%20Max%20Criteria%20Scores.md) | **Next →** [14 — Using Your Decision Matrix Throughout the Project](14%20-%20Using%20Your%20Decision%20Matrix%20Throughout%20the%20Project.md)
