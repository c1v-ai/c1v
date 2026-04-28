# Phase 1: Front Porch -- Performance Criteria and Importance Weights
> Corresponds to QFD Guide Steps 1a, 1b, 2

## Prerequisites
- [ ] Phase 0 is complete (terminology understood)
- [ ] Required inputs: A list of customer needs or requirements for your system

## Context (Why This Matters)

Before building any part of the QFD, you must establish *what your customer cares about* and *how much they care about each thing*. Performance criteria are measurable attributes that express how well any solution meets customer needs. They form the left wall of the House of Quality -- the **front porch** -- and everything else in the QFD is built relative to them. If the criteria or weights are wrong, every downstream analysis will be wrong. This is a "garbage in / garbage out" situation.

## Instructions

### Step 1.1: List Your Performance Criteria

Create one row per performance criterion. These should be measurable attributes that your customer uses to evaluate any solution -- not just yours. Good performance criteria are general enough to apply to competing solutions too.

Ask yourself: "How will any solution be measured for meeting the needs of the challenge?"

Place each criterion in its own row in the leftmost column of the QFD template.

### Step 1.2 (Optional): Add Short Descriptions

For each criterion, add a brief clarifying description in a column to the left of the criteria names. This is especially valuable for larger teams where "Robustness" could mean different things to different people.

In the template, this is the leftmost description column.

### Step 1.3 (Optional): Add Internal Criteria

Beyond customer-facing criteria, you may have internal criteria important to your organization but not directly to the customer. Common examples:
- Manufacturing & assembly time
- Commonality in parts with other company products
- Profit margin

List these *below* the customer criteria and format them in *italics* to distinguish them. If this is your first QFD, consider completing it without internal criteria first, then adding them later.

### Step 1.4: Assign Relative Importance Weights

Not all needs are equally important. Assign each performance criterion a relative importance weight, expressed as a percentage. All weights must sum to exactly 100%.

**Method (scratch-work approach):**
1. Rate each criterion on a 1-5 scale of importance (5 = most critical)
2. Sum all the raw scores (e.g., if you have 12 criteria, the sum might be 37)
3. Divide each criterion's raw score by the total to get its percentage weight
4. Verify the percentages sum to 100%

**Example from the e-commerce platform** (carried forward from the Module 4 Decision Matrix):

| Criterion | Raw Score (1-5) | Weight | Learn More |
|-----------|----------------|--------|------------|
| Reliability (Uptime) | 5 | 16.7% | [Resiliency Patterns KB](resilliency-patterns-kb.md) |
| Customer Page Load Speed | 5 | 16.7% | [Caching KB](caching-system-design-kb.md), [CDN & Networking KB](cdn-networking-kb.md) |
| Total Cost over 3 Years | 4 | 13.3% | [System Architecture KB](software_architecture_system.md) |
| Peak Traffic Capacity | 4 | 13.3% | [Load Balancing KB](load-balancing-kb.md) |
| Launch Speed (Time-to-Market) | 3 | 10.0% | [Deployment & CI/CD KB](deployment-release-cicd-kb.md) |
| Growth Ceiling (Scalability) | 3 | 10.0% | [Data Model KB](data-model-kb.md), [CAP Theorem KB](cap_theorem.md) |
| Ongoing Maintenance Effort | 3 | 10.0% | [Maintainability KB](maintainability-kb.md) |
| Risk Exposure (Security) | 3 | 10.0% | [System Architecture KB](software_architecture_system.md) |
| **Total** | **30** | **100.0%** | |

The justification for *why* one criterion gets a 5 and another a 3 should come from analyzing customer data, the original challenge definition, or stakeholder interviews. Here, Reliability and Page Load Speed received 5s because lost revenue during downtime and slow page loads directly impact the bottom line — every second of delay costs conversions. Launch Speed received only a 3 because while urgency exists, the business agreed that launching a reliable platform in 14 weeks is preferable to launching a fragile one in 4.

## Worked Example

The e-commerce platform example starts with 8 performance criteria carried directly from the Module 4 Decision Matrix. This is the natural bridge between the two tools: the Decision Matrix selected the winning option; the QFD now designs it. The same criteria and weights apply — you do not need to re-derive them.

If the QFD process reveals that additional criteria matter (e.g., "Integration Capability" with other internal systems), add them and re-normalize the weights so they still sum to 100%. The QFD often surfaces needs the Decision Matrix missed, and that is a feature, not a problem.

> **Interface design preview:** Notice that several criteria — Peak Traffic Capacity, Growth Ceiling, Integration Capability — will eventually require defining clear interfaces between system components. How the search service communicates with the product database, how the payment gateway integrates with the order service — these interface decisions will be explored in Module 6.

## Validation Checklist (STOP-GAP)
- [ ] At least 5 performance criteria are listed
- [ ] Each criterion has a clear, measurable definition (could someone else evaluate a system against it?)
- [ ] Each criterion has a relative importance weight expressed as a percentage
- [ ] All weights sum to exactly 100.00% (verify the arithmetic)
- [ ] Weights are justified -- you can explain why each criterion received its importance score
- [ ] Internal criteria (if any) are clearly distinguished from customer criteria (italicized)
- [ ] No criterion is so vague that two people would interpret it differently

> **STOP: Do not proceed to Phase 2 until ALL validation items pass.**
> If weights do not sum to 100%, recalculate. If criteria are vague, add descriptions. If you have fewer than 5 criteria, brainstorm additional customer needs.

## Output Artifact
The front porch of the QFD is populated: a table of performance criteria with importance weights summing to 100%.

## Handoff to Next Phase
You now have weighted performance criteria. Phase 2 will use these to score your system and competitors on the **back porch**, creating a competitive performance comparison.

---

**← Previous:** [Phase 0: Overview and Terminology](00_QFD-OVERVIEW-AND-TERMINOLOGY.md) | **Next →** [Phase 2: Back Porch -- Scoring and Competitors](02_BACK-PORCH--SCORING-AND-COMPETITORS.md)
