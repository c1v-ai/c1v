# 10 — Assigning Weights to Criteria

## Prerequisites

- [ ] Step 09 complete — all criteria scores normalized to a 0–1 range

## Context (Why This Matters)

It is rare that all performance criteria matter equally to the customer. Treating them as equal is a common mistake that flattens real priorities into noise. Weights capture **relative importance** so that highly valued criteria exert more influence on the final score, and low-priority criteria do not drown out what the customer actually cares about.

Weights also force the team to have an honest conversation about trade-offs. A criterion that "everyone agrees is important" might turn out to represent only 8% of the total once the math is done — and that surprise is exactly the kind of insight you need before committing to a design direction.

## Instructions

1. **Choose a rating scale.** Use a consistent scale (1–5, 1–10, etc.) to rate how important each criterion is. Keep the scale the same for all criteria.
2. **Rate each criterion's importance.** Gather ratings from your customer, survey data, user research, or stakeholder discussions. Multiple criteria can share the same rating.
3. **Convert raw weights to percentages.** Sum all raw weights, then divide each by the total:
   ```
   Weight % = Raw Weight / Sum of All Raw Weights
   ```
4. **Verify the total.** All percentage weights must sum to exactly **100%** (or 1.00). If they do not, recheck your arithmetic.
5. **Check for the "Percentage Surprise" effect.** Show the percentage weights to all decision-makers. If anyone objects ("Cost is only 8%? That can't be right!"), do not dismiss the reaction — investigate it. The surprise usually means either (a) too many criteria received high raw weights, diluting each one, or (b) the team's mental model of importance does not match their actual ratings.
6. **Assign weights without looking at normalized scores.** This prevents bias toward a preferred option. Decide importance based on customer needs, not on which option would win.
7. **Get agreement from all decision-makers** before proceeding.

## The "Percentage Surprise" Effect

A team may be comfortable with 1–5 raw weights but then **disagree** when they see the calculated percentages — even though the two representations are mathematically identical.

> *"We gave cost a 5 because it's the most important thing. But the percentage says it's only 8% of the total? Cost is way more important than 8%!"*

This happens when many criteria all receive high raw weights. The percentage reveals the true relative impact, which may not match the team's intuition. **Percentages are the better representation** because they expose hidden surprises and force honest conversations about priorities.

## Worked Example

**E-Commerce Platform — Assigning Weights to 8 Criteria (1–5 Scale)**

The business stakeholders rate each criterion's importance. Weights are assigned *before* looking at how the options score — this prevents bias toward a preferred vendor or approach.

| Criterion | Raw Weight (1–5) | Calculation | Weight % | Related KB |
|---|---|---|---|---|
| Reliability (Uptime) | 5 | 5 / 30 | 16.7% | [Resiliency KB](resilliency-patterns-kb.md) |
| Customer Page Load Speed | 5 | 5 / 30 | 16.7% | [Caching KB](caching-system-design-kb.md) |
| Total Cost over 3 Years | 4 | 4 / 30 | 13.3% | [Architecture KB](software_architecture_system.md) |
| Peak Traffic Capacity | 4 | 4 / 30 | 13.3% | [Load Balancing KB](load-balancing-kb.md) |
| Launch Speed (Time-to-Market) | 3 | 3 / 30 | 10.0% | [CI/CD KB](deployment-release-cicd-kb.md) |
| Growth Ceiling (Scalability) | 3 | 3 / 30 | 10.0% | [Data Model KB](data-model-kb.md) |
| Ongoing Maintenance Effort | 3 | 3 / 30 | 10.0% | [Maintainability KB](maintainability-kb.md) |
| Risk Exposure (Security) | 3 | 3 / 30 | 10.0% | [Architecture KB](software_architecture_system.md) |
| **Total** | **30** | | **100.0%** | |

Notice that Reliability and Page Load Speed together account for 33% of the total weight — a third of the decision. Launch Speed — despite feeling urgent — represents only 10%. If the CEO expected "how fast we launch" to dominate the decision, this is the moment to revisit: does the team truly value a 4-week launch more than a platform that stays up during Black Friday? The percentage forces that honest conversation.

## Validation Checklist (STOP-GAP)

- [ ] Every criterion has a raw weight assigned
- [ ] All percentage weights sum to exactly 100% (or 1.00)
- [ ] Weights were assigned without looking at normalized scores
- [ ] The team has reviewed percentages and resolved any "Percentage Surprise" objections
- [ ] All decision-makers agree on the final weights

**STOP — Do not calculate weighted scores until all stakeholders have agreed on the weights.**

## Output Artifact

Completed weight column in the decision matrix, with both raw weights and percentage weights recorded for each criterion.

## Handoff to Next Step

Proceed to Step 11 to build consensus around the assigned weights through team discussion.

---

**← Previous:** [09 — Normalizing Criteria Scores](09%20-%20Normalizing%20Criteria%20Scores.md) | **Next →** [11 — Building Consensus Using Criteria Weights](11%20-%20Building%20Consensus%20Using%20Criteria%20Weights.md)
