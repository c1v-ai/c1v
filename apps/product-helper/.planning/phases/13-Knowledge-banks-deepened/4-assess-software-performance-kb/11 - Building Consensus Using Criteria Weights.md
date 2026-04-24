# 11 — Building Consensus Using Criteria Weights

## Prerequisites

- [ ] Step 10 complete — initial weights assigned and converted to percentages for all criteria

## Context (Why This Matters)

Getting your team to agree on weights is not a formality — it is the mechanism that forces everyone to understand the **trade-offs** that drive the design. Early in the process, criteria and metrics may have been approved with polite head-nodding. Weight discussions demand a deeper, more honest conversation about what the team is actually willing to sacrifice.

These conversations also serve as a diagnostic tool. When a team member objects to a weight, the real problem is often not the weight itself but the metric behind it. Catching that now — before scores are calculated and decisions are locked — saves significant rework later.

## Instructions

1. **Present the percentage weights to the full team.** Display the weights from Step 10 alongside the criteria and their metrics. Give every stakeholder time to review.
2. **Invite objections.** Ask each team member: *"Are there any weights that do not reflect your understanding of our priorities?"* Document every objection.
3. **Diagnose each disagreement.** For every objection, determine whether the issue is:
   - **(a) A true priority disagreement** — the team member genuinely values the criterion differently. Resolve through discussion and re-rating.
   - **(b) A metric problem** — the team member agrees the criterion is important but disagrees with the weight because the metric is too narrow, too broad, or measuring the wrong thing. Fix the metric (see below).
4. **Fix metric problems when found.** If a weight argument is actually a signal that the metric is poorly defined, choose one of two approaches:
   - **Broaden the metric** — include additional factors so the metric captures the full intent of the criterion.
   - **Split the criterion** — break the criterion into multiple sub-criteria with their own metrics and redistribute the weights accordingly.
5. **Re-run the weight calculation** if any criteria were added, removed, or redefined. Ensure the total still sums to 100%.
6. **Secure customer buy-in.** Present the final weights and metrics to your customer. Emphasize that **what gets measured gets done** — these weights and metrics will guide every decision going forward. If the customer is not satisfied, it is far better to learn that now than after significant work has been invested.
7. **Acknowledge that weights may evolve.** Customers are rarely technical experts. They may provide feedback later that changes weights or metric definitions. Making them part of the process increases their ownership of the results and their invested interest in your success.

## When Disagreements Point to Metric Problems

Sometimes a weight argument is a signal that the metric does not capture what the criterion is supposed to represent. Watch for statements like:

- *"That criterion is not worth 15% of the total — but the concept behind it is."*
- *"I would weight it higher if we were measuring the right thing."*
- *"The metric only captures part of what matters."*

When you hear these signals, the fix is not to adjust the weight — it is to fix the metric.

## Worked Example

**Laptop Selection — A Weight Disagreement Reveals a Metric Problem**

During the weight review, a team member objects:

> *"Graphics Performance should be weighted higher than 14.3%. Graphics matter a lot for our use case."*

The facilitator investigates. The current metric for Graphics Performance measures only **gaming benchmark scores (FPS in AAA titles)**. But the team's actual use case involves professional rendering (CAD, 3D modeling, video editing) — which depends on different GPU capabilities than gaming.

**Diagnosis:** This is a metric problem, not a priority disagreement. The team agrees Graphics matters — they disagree with the weight because the metric is too narrow.

**Two possible solutions:**

| Approach | What Changes |
|---|---|
| **Broaden the metric** | Redefine "Graphics Performance" to include both gaming benchmarks AND professional rendering benchmarks (e.g., SPECviewperf, Blender render times). Recollect data for all three options. |
| **Split the criterion** | Break "Graphics Performance" into two sub-criteria: "Gaming Graphics" and "Professional Rendering." Assign separate weights to each. The combined weight may exceed the original 14.3%. |

After splitting, the revised weights might look like:

| Criterion | Old Weight % | New Weight % |
|---|---|---|
| Gaming Graphics | (part of 14.3%) | 7.1% |
| Professional Rendering | (part of 14.3%) | 10.7% |
| All other criteria | 85.7% | 82.2% |
| **Total** | **100.0%** | **100.0%** |

The team re-rates all criteria with the new sub-criteria included, and the total is recalculated to 100%.

## Validation Checklist (STOP-GAP)

- [ ] All stakeholders have reviewed the percentage weights
- [ ] Every objection has been documented and resolved (priority disagreement or metric problem)
- [ ] Any metric problems led to metric fixes (broadened or split), not just weight adjustments
- [ ] Revised weights still sum to exactly 100%
- [ ] The customer has reviewed and accepted the final weights and metrics
- [ ] The team understands that weights may be revisited if the customer provides new feedback

**STOP — Do not calculate weighted scores until full consensus is achieved and documented.**

## Output Artifact

Consensus-approved weight column with documented resolutions for any disagreements, plus any revised or split criteria.

## Handoff to Next Step

Proceed to Step 12 to establish minimum and maximum acceptable scores for each criterion.

---

**← Previous:** [10 — Assigning Weights to Criteria](10%20-%20Assigning%20Weights%20to%20Criteria.md) | **Next →** [12 — Establishing Min and Max Criteria Scores](12%20-%20Establishing%20Min%20and%20Max%20Criteria%20Scores.md)
