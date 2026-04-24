# 05 — Using Direct and Scaled Measures

## Prerequisites

- [ ] Step 04 complete — criteria refined (features converted to real criteria, binary items moved to requirements)

## Context (Why This Matters)

Once you have a clean list of performance criteria, you need a way to *measure* each one. Not every criterion can be captured with a single number like dollars or kilograms. Some criteria — environmental impact, aesthetics, safety — have no universally recognized unit. Choosing the wrong measurement type leads to scores that are either meaninglessly precise or too vague to differentiate solutions.

Understanding the distinction between direct and scaled measures, and knowing how to set up scaled-measure conditions correctly, prevents you from building a decision matrix on a shaky foundation.

## Instructions

1. **Classify each criterion as direct or scaled.**

   | Type | When to use | Examples |
   |---|---|---|
   | **Direct measure** | The criterion can be expressed as a single, straightforward value with recognized units | Cost ($), Weight (kg), Battery Life (hours) |
   | **Scaled measure** | There is no single internationally recognized number for the criterion | Environmental impact, Aesthetics, Graphics Performance |

2. **For direct measures, record the value and its units.** No further setup is needed — these are the most straightforward metrics.

3. **For scaled measures, define a numerical scale (1–3, 1–5, or 1–10).** Prefer 1–3 or 1–5 scales. Use 1–10 only when finer distinctions are truly needed.

4. **Write explicit conditions for every score level.** Each score level can have multiple conditions. State exactly what must be true for a solution to earn that score.

5. **Ensure conditions do not overlap.** Only one score should be possible for any given solution.

6. **Apply the critical rule: ALL conditions must be met.** A solution must satisfy every condition within a score level to earn that score. If it meets only some conditions for a higher score but all conditions for a lower one, assign the lower score.

7. **Consider using scaled measures for traditionally direct criteria** when a nonlinear score better reflects how the customer evaluates value. For example, the jump from $10,000 to $5,000 may matter more to a customer than the jump from $5,000 to $3,000 — a scaled measure captures that reality.

## Worked Example

You are comparing three architecture approaches for your e-commerce platform:
- **Option A** — Commercial platform (Shopify Plus, ~$2K/month)
- **Option B** — Custom build in-house (~$500K over 6 months)
- **Option C** — Open-source platform with contractor customization (~$200K)

**Direct measures — Total Cost over 3 Years and Launch Speed:**

| Criterion | Option A | Option B | Option C | Learn More |
|---|---|---|---|---|
| Total Cost over 3 Years | $72K (licensing + hosting) | $500K (build) + $180K (3 yrs maintenance) = $680K | $200K (build) + $90K (3 yrs maintenance) = $290K | [System Architecture KB](software_architecture_system.md) |
| Launch Speed | 4 weeks | 26 weeks | 14 weeks | [Deployment & CI/CD KB](deployment-release-cicd-kb.md) |

No scale setup is needed; record the value with its unit.

**Scaled measure — Reliability / Uptime (1–5 scale):**

How often is the store down and losing revenue? See [Resiliency Patterns KB](resilliency-patterns-kb.md) and [Observability KB](observability-kb.md) for the engineering concepts behind these levels.

| Score | Conditions |
|---|---|
| 5 | Uptime ≥ 99.99% (< 1 hour downtime/year) **and** automatic failover with no customer-visible errors |
| 4 | Uptime ≥ 99.9% (< 9 hours downtime/year) **and** recovery from outages within 15 minutes |
| 3 | Uptime ≥ 99.5% (< 2 days downtime/year) **and** recovery from outages within 1 hour |
| 2 | Uptime ≥ 99% (< 4 days downtime/year) **and** recovery requires manual intervention |
| 1 | Uptime < 99% (> 4 days downtime/year) **or** recovery takes more than 4 hours |

**Applying the ALL-conditions rule:** Suppose Option C achieves 99.95% uptime (meets the first condition for a 4) but recovery from outages takes 45 minutes because it depends on a contractor's availability (fails the second condition for a 4, but meets both conditions for a 3). Option C earns a **3**, not a 4.

## Validation Checklist (STOP-GAP)

- [ ] Every criterion is classified as either direct or scaled
- [ ] Every direct measure has a unit of measurement recorded
- [ ] Every scaled measure has explicit, written conditions for each score level
- [ ] No score level's conditions overlap with another level's conditions
- [ ] The ALL-conditions rule is documented and understood by the team
- [ ] Any traditionally direct criterion converted to a scaled measure has a clear rationale for the nonlinear scoring

**STOP — Do not proceed to Step 06 until every item above is checked.**

## Output Artifact

A complete list of criteria with their measurement type (direct or scaled) and, for each scaled criterion, a fully defined conditions table.

## Handoff to Next Step

Carry your conditions tables forward to Step 06, where you will set appropriate range anchors for each scaled measure.

---

**← Previous:** [04 — Avoiding Performance Criteria Pitfalls](04%20-%20Avoiding%20Performance%20Criteria%20Pitfalls.md) | **Next →** [06 — Defining Appropriate Ranges for Conditions](06%20-%20Defining%20Appropriate%20Ranges%20for%20Conditions.md)
