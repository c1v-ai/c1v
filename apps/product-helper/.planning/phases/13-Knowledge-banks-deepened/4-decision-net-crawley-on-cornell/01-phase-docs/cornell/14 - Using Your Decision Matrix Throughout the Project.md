# 14 — Using Your Decision Matrix Throughout the Project

## Prerequisites

- [ ] Step 13 complete — initial score interpretation done, sensitivity analysis performed

## Context (Why This Matters)

A common misconception is that you build a decision matrix once, pick a winner, and file it away. In practice, the matrix should be a **living tool** that guides resource allocation, resolves priority disputes, and absorbs new information as it emerges. Without ongoing use, teams drift toward gut-feel decisions mid-project — exactly the bias the matrix was built to prevent.

By re-scoring at regular intervals, you maintain an objective answer to the question: *"If development stopped right now, what would our score be?"* This turns the matrix from a selection artifact into a **project management instrument**.

## Instructions

1. **Re-score your matrix at regular checkpoints.** At each milestone or sprint boundary, test current performance against every criterion and update the scores. Ask: *"If development stopped right now, what would our score be?"*
2. **Use scores to guide resource allocation.** Identify which criteria are lagging. Cross-reference with criterion weights. If a highly weighted criterion is scoring low, **prioritize** work on that area over lower-weighted criteria that are already performing well.
3. **Evaluate proposed work by expected performance gain.** Before approving any task, estimate the **performance delta** — the gain from current score to expected score on the affected criterion. Compare that delta (weighted) against the cost, time, and effort required.
4. **Apply the matrix to the "two more weeks" scenario.** When a team member requests more time:
   - Check whether the work in question still represents the **largest potential performance delta** available.
   - If yes, the extension may be justified.
   - If other tasks could deliver a comparable or greater weighted gain with higher confidence and less time, **switch priorities**.
5. **Incorporate new options as they appear.** When a new alternative emerges mid-project, add it to the matrix as a new row, score it against all criteria, and compare it to existing options using the same weights and thresholds.
6. **Use performance deltas to justify priority decisions.** Document the delta for each candidate task. This gives stakeholders a transparent, data-driven rationale for why certain work gets funded and other work gets deferred.

## Worked Example

**Scenario:** Midway through your e-commerce platform evaluation, a VP discovers a managed headless commerce service (e.g., commercetools) that was not in the original comparison. You add it to the matrix.

| Option | Description | Cost Model |
|---|---|---|
| **Option A** | Commercial platform (Shopify Plus) | ~$2K/month |
| **Option B** | Custom build in-house | ~$500K over 6 months |
| **Option C** | Open-source + contractor customization | ~$200K |
| **Option D** *(new)* | Managed headless commerce API | ~$3K/month + $80K integration |

**Scoring Option D against all 8 criteria:**

| Criterion | Option A | Option C | Option D |
|---|---|---|---|
| Reliability (Uptime) | 5 | 3 | 5 |
| Customer Page Load Speed | 4 | 3 | 5 |
| Total Cost over 3 Years | 5 | 3 | 3 |
| Peak Traffic Capacity | 4 | 3 | 5 |
| Launch Speed | 5 | 3 | 3 |
| Growth Ceiling (Scalability) | 2 | 4 | 5 |
| Ongoing Maintenance Effort | 5 | 2 | 4 |
| Risk Exposure (Security) | 4 | 3 | 4 |

Option D scores highest or ties on 5 of 8 criteria — especially strong on Scalability (no vendor ceiling on the API layer) and Page Load Speed (CDN-native architecture; see [CDN & Networking KB](cdn-networking-kb.md)). However, it scores **3** on Total Cost ($188K over 3 years vs. Option A's $72K) and **3** on Launch Speed (12 weeks for API integration vs. Option A's 4 weeks).

**Applying the performance delta analysis:**
- Option D's weighted total = 0.72, vs. Option A's current 0.68 — a delta of +0.04.
- But Growth Ceiling carries a weight of 0.10. If the business confirmed aggressive growth plans and increased that weight to 0.15, the delta would grow to +0.08.
- **Decision:** The potential gain justifies spending one week building a proof-of-concept integration with Option D's API before committing. If the integration confirms the speed and reliability scores, and leadership confirms the growth trajectory, switch to Option D. If not, stay with Option A.

**The "two more weeks" test:** An engineer asks for two more weeks to optimize Option D's launch timeline (reducing it from 12 weeks to 10 weeks). Check the matrix: the Launch Speed criterion has a weight of only 0.10. Improving from a score of 3 to 3.5 on a normalized scale adds only 0.005 to the total. That gain does not justify two weeks of engineering effort. Deny the extension and redirect effort to the proof-of-concept that validates the higher-weighted Reliability and Scalability scores instead.

## Validation Checklist (STOP-GAP)

- [ ] The matrix has been re-scored at least once since the initial selection
- [ ] Resource allocation decisions reference criterion weights and current scores
- [ ] Any new options discovered mid-project have been added and scored
- [ ] Performance deltas are documented for proposed tasks
- [ ] The "two more weeks" scenario has a matrix-based answer, not a gut-feel answer

**STOP — Do not close out the decision matrix until every box above is checked and the team agrees the matrix reflects the final state of the project.**

## Output Artifact

Updated decision matrix with mid-project re-scoring, new options integrated, and performance delta documentation for priority decisions.

## Handoff to Next Step

Return to the Module Overview to review the complete assessment workflow and confirm all steps are complete.

---

**← Previous:** [13 — Appropriately Interpreting Matrix Scores](13%20-%20Appropriately%20Interpreting%20Matrix%20Scores.md) | **Back to** [00 — Module Overview](00%20-%20Module%20Overview.md)
