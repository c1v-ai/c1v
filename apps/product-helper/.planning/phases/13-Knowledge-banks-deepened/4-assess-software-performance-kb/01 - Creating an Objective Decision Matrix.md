# 01 — Creating an Objective Decision Matrix

## Prerequisites

- [ ] None — this is the first step in Module 4.

## Context (Why This Matters)

Performance metrics are the objective way you measure how any solution meets a need. Without a structured evaluation framework, decisions default to opinion, seniority, or gut feeling — none of which protect you when a stakeholder asks "why did you choose this?" A decision matrix built on rigorous metrics produces a **defendable decision** that the entire team and customer can stand behind.

An objective decision matrix also prevents the common failure mode where sub-teams each advocate for their preferred solution with no shared basis for comparison. It replaces debate with data.

## Instructions

1. **Understand the four structural elements** of a decision matrix:

   | Element | Location | Purpose |
   |---|---|---|
   | **Options** | Column headers | The different solutions you are evaluating |
   | **Performance Criteria** | Row labels | All the ways your customer might evaluate performance (cost, reliability, size, weight, runtime, etc.) |
   | **Scores** | Matrix cells | How well each option achieves each criterion |
   | **Weights** | Dedicated column | The relative importance of each criterion |

2. **Learn how scoring works:**
   - Assign each option a **score** per criterion.
   - Multiply each score by the criterion's **weight** to get a weighted score.
   - Sum the weighted scores per option to get a **final score**.
   - Use final scores to determine which option best meets the need.

3. **Recognize why simple qualitative scoring is not enough.** Scales like +1/0/-1 checkmarks or loosely defined 1-3 ranges are useful for collecting general thoughts and building intuition, but they are **not sufficient for a defendable decision** because:
   - Different people interpret "three checks" differently, introducing **bias** from whoever fills out the matrix.
   - Even expert opinion alone is risky — experts may disagree, and relying on one person's judgment does not protect you if something goes wrong.

4. **Commit to objectivity.** For every score you assign, define a **clearly stated, objective measure** behind it. Ask: *"What exactly is required to earn a 3 versus only a 2?"* If every team member and the customer would answer that question the same way, your metric is objective. If answers vary, you have a bias problem.

## Worked Example

**Scenario:** Your team needs to select a laptop for a distributed engineering team. You have three candidates:

| | Option A | Option B | Option C |
|---|---|---|---|
| **Description** | High-end laptop | Budget laptop | Cloud/subscription laptop |
| **Approx. Cost** | ~$850 | ~$500 | ~$50/month |

Without a decision matrix, the discussion devolves into preferences: "I like Option A because it's fast," "Option B saves money," "Option C is the future." A decision matrix forces the team to define *what matters*, *how much it matters*, and *how each option performs* — producing a result everyone can trace back to evidence.

## Validation Checklist (STOP-GAP)

- [ ] I can name the four structural elements of a decision matrix (options, criteria, scores, weights).
- [ ] I understand why qualitative +1/0/-1 scoring is insufficient for a defendable decision.
- [ ] I can explain what makes a score "objective" — identical interpretation by any evaluator.
- [ ] I understand the broader value: proving contracted value, uniting teams, resolving trade-offs, defending work.

**STOP: Do not proceed to Step 02 until every box above is checked.**

## Output Artifact

A clear understanding of what a decision matrix is, why objectivity matters, and what problem it solves.

## Handoff to Next Step

Step 02 introduces the precise terminology (criterion, metric, rubric, weight) you will use when building and discussing your matrix.

---

**Next →** [02 — Talking the Talk: Key Terminology](02%20-%20Talking%20the%20Talk%20-%20Key%20Terminology.md)
