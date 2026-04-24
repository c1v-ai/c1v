# 06 — Defining Appropriate Ranges for Conditions

## Prerequisites

- [ ] Step 05 complete — every criterion classified as direct or scaled, with conditions tables drafted for all scaled measures

## Context (Why This Matters)

A scaled measure is only useful if its range actually differentiates the solutions you are comparing. A scale that is too narrow lumps every option at the same score; a scale that is too wide wastes resolution on values no real solution will ever reach. Anchoring your scale to concrete benchmarks — worst acceptable, customer target, and realistic best — ensures every score level carries meaningful decision-making power.

Getting this wrong is subtle: your conditions table can look perfectly logical yet produce scores that fail to distinguish between genuinely different options, collapsing your decision matrix into noise.

## Instructions

1. **Establish three anchor points before filling in intermediate scores.**

   | Anchor | How to set it |
   |---|---|
   | **Lowest score** | The worst value any *valid* solution can have. Anything worse makes the solution unacceptable regardless of other criteria. |
   | **Mid-scale score** | The value your customer is specifically asking for, or an internal performance target. |
   | **Highest score** | The realistic best-case value — e.g., the performance of the best competitor, or a defined percentage better. |

2. **Spread the remaining scores between the anchors.** A linear distribution is most common, but use a bell-shaped or nonlinear distribution if it better reflects customer preferences.

3. **Check that the range covers what matters.** If your scale cannot distinguish between the solutions you are actually comparing, widen or shift it. A scale that maxes out too early (like measuring adult height with a 12-inch ruler) is useless — every option scores the same.

4. **Run a proportionality check.** Ask: "If something scores a 3, is it actually three times as valuable as when it scores a 1?" If the answer feels wrong, consider using an incomplete scale (e.g., an 8–9–10 subset of a 1–10 scale) to more honestly represent the true relationship between score levels.

5. **Document the rationale for each anchor.** Future reviewers (and your client) need to understand why the boundaries sit where they do.

## Worked Example

You are refining the **Customer Page Load Speed** scaled measure for your e-commerce platform comparison (Option A — commercial, Option B — custom build, Option C — open-source hybrid). For the engineering concepts behind page speed, see [Caching KB](caching-system-design-kb.md) and [CDN & Networking KB](cdn-networking-kb.md).

**Setting the three anchors:**

| Anchor | Score | Page Load Speed Condition | Rationale |
|---|---|---|---|
| Lowest (floor) | 1 | Average page load > 5 seconds | Industry data shows 40% of shoppers abandon sites that take more than 3 seconds — above 5 seconds, the store is effectively broken |
| Mid-scale (customer target) | 3 | Average page load ≤ 2 seconds — the business team's stated performance goal | This is what the business stakeholders explicitly requested based on competitor benchmarks |
| Highest (realistic best) | 5 | Average page load ≤ 500ms with content pre-loaded via CDN | This matches the fastest major e-commerce platforms today (Amazon-tier performance) |

**Filling in the intermediate scores (2 and 4):**

| Score | Condition |
|---|---|
| 5 | Average ≤ 500ms, CDN-accelerated, content pre-loaded |
| 4 | Average ≤ 1 second, cached product pages, fast search results |
| 3 | Average ≤ 2 seconds (business team's target) |
| 2 | Average ≤ 3.5 seconds, noticeable delays on product search |
| 1 | Average > 5 seconds, frequent timeouts under load |

**Proportionality check:** Is a score of 3 truly three times the value of a score of 1? In this case, the jump from "shoppers are leaving" (1) to "meets the business target" (3) does represent a large, meaningful leap — it is the difference between losing customers and retaining them. The spacing feels proportional. If it did not — for example, if the difference between 1 and 3 was only 200ms and shoppers would not notice — you would compress the scale (e.g., use only 7–8–9–10 on a 1–10 range) to reflect that reality.

## Validation Checklist (STOP-GAP)

- [ ] Every scaled measure has its three anchor points (lowest, mid, highest) explicitly defined
- [ ] The mid-scale anchor corresponds to the customer's stated target or an agreed internal benchmark
- [ ] Intermediate scores are spread between anchors with a documented distribution rationale
- [ ] The range is wide enough to differentiate between all candidate solutions
- [ ] A proportionality check has been performed — score ratios reflect real value differences
- [ ] Anchor rationale is documented for client review

**STOP — Do not proceed to Step 07 until every item above is checked.**

## Output Artifact

An updated conditions table for each scaled measure, with anchor rationale and proportionality check documented.

## Handoff to Next Step

Carry these anchored scales forward to Step 07, where you will address criteria that are inherently subjective and need early-measurable indicators.

---

**← Previous:** [05 — Using Direct and Scaled Measures](05%20-%20Using%20Direct%20and%20Scaled%20Measures.md) | **Next →** [07 — Establishing Metric Conditions for Subjective Criteria](07%20-%20Establishing%20Metric%20Conditions%20for%20Subjective%20Criteria.md)
