# 07 — Establishing Metric Conditions for Subjective Criteria

## Prerequisites

- [ ] Step 06 complete — ranges defined and anchored for all objective scaled criteria

## Context (Why This Matters)

Performance metrics must be objective: one evaluator should score a solution the same way a thousand evaluators would. But some criteria — "fun," "future-proofing," "user experience" — feel inherently subjective. If you leave them unmeasured, you lose important decision dimensions. If you measure them with gut feel, you introduce bias and create contractual risk. The solution is to find objective, early-measurable indicators that correlate with the subjective quality.

This step also protects both you and your client. Without agreed-upon metrics for subjective criteria, a client can reject deliverables with vague complaints ("it's not good enough") and you have no objective basis to respond. With agreed-upon metrics, both parties share a clear definition of success.

## Instructions

1. **Identify which remaining criteria are subjective.** These are criteria where reasonable people might disagree on the score without further definition.

2. **Brainstorm measurable indicators for each subjective criterion.** List every observable, countable, or testable proxy that correlates with the subjective quality.

3. **Evaluate each indicator for measurement cost and timing.** Flag indicators that require the finished product to measure — these are "late indicators." Prioritize "early indicators" you can assess during design, before the product is complete.

   | Indicator type | Characteristics | Preference |
   |---|---|---|
   | **Early indicator** | Measurable from the design or spec; low cost; available before build | Prefer these |
   | **Late indicator** | Requires finished product or extensive testing; high cost; available only at the end | Use as validation, not as sole measure |

4. **Select early indicators as your primary measures.** Early indicators let you guarantee a minimal level of performance with practically no additional measurement cost — you count them from the design itself.

5. **Define sub-deliverables as checkpoints.** Think of sub-deliverables as intermediate validation points (like homework assignments that build toward a final exam). These give you feedback loops throughout development rather than a single pass/fail at the end.

6. **Iterate as you learn.** As you discover more about the problem domain, new measurable proxies may emerge. Update your indicators when better ones become available.

7. **Validate indicators with your client.** Walk through your proposed measures with the client and get explicit agreement. This is critical for contractual protection and ensures your measures actually match the client's intent.

## Worked Example

You are evaluating **Ongoing Maintenance Effort** for your e-commerce platform comparison (Option A — commercial, Option B — custom build, Option C — open-source hybrid). This criterion captures the business's concern about how much engineering time and cost the platform will consume after launch. For the engineering concepts behind maintainability, see [Maintainability KB](maintainability-kb.md).

"Maintenance effort" feels subjective — it is hard to put a single number on "how much work is this to keep running?" The solution is to find objective, early-measurable indicators.

**Brainstorming measurable indicators:**

| Possible indicator | Early or late? |
|---|---|
| Actual engineering hours spent on maintenance per month | Late — requires operating the platform for months to observe |
| Developer satisfaction surveys about codebase quality | Late — requires a team working in the codebase |
| Number of external dependencies requiring regular updates | **Early** — countable from the platform's architecture documentation today |
| Vendor's documented SLA for patches and security updates | **Early** — available from vendor contracts and documentation |
| Size of the active open-source contributor community (for Option C) | **Early** — countable from GitHub/community metrics today |
| Availability of developers with relevant platform skills (job market data) | **Early** — searchable on job boards and industry surveys |

**Selected early indicators for "Ongoing Maintenance Effort" scaled measure (1–5):**

| Score | Conditions |
|---|---|
| 5 | Vendor handles all infrastructure maintenance **and** security patches delivered within 24 hours **and** ≥ 50 qualified developers available locally for hire |
| 4 | Vendor handles most infrastructure **and** security patches within 1 week **and** ≥ 30 qualified developers available |
| 3 | Team manages infrastructure with vendor support **and** < 20 external dependencies to update quarterly **and** ≥ 15 qualified developers available |
| 2 | Team manages all infrastructure **and** 20–50 external dependencies to update **and** < 10 qualified developers available |
| 1 | Team manages all infrastructure **and** > 50 external dependencies **or** < 5 qualified developers available in the market |

**Why stakeholder involvement matters — two scenarios:**

- *Without agreed metrics:* The CTO says "this platform is a maintenance nightmare" six months after launch and demands a rebuild. You have no objective basis to evaluate whether this is true or just frustration.
- *With agreed metrics:* You demonstrate that the platform meets all conditions for a score of 4 on the agreed Maintenance Effort scale. If the CTO wants lower maintenance, that becomes a new project with its own budget — not a complaint about the original decision.

## Validation Checklist (STOP-GAP)

- [ ] Every subjective criterion has at least two measurable indicators identified
- [ ] Each indicator is classified as early or late
- [ ] Primary measures use early indicators (late indicators are supplementary only)
- [ ] Sub-deliverables are defined as intermediate checkpoints for each subjective criterion
- [ ] The client has reviewed and agreed to the proposed measures for subjective criteria
- [ ] Conditions tables for subjective criteria follow the same ALL-conditions rule from Step 05

**STOP — Do not proceed to Step 08 until every item above is checked.**

## Output Artifact

A conditions table for each subjective criterion, built on early-measurable indicators, with documented client agreement.

## Handoff to Next Step

Carry these subjective-criteria scales forward to Step 08, where you will ensure all scales are solution-independent and refine them for differentiation.

---

**← Previous:** [06 — Defining Appropriate Ranges for Conditions](06%20-%20Defining%20Appropriate%20Ranges%20for%20Conditions.md) | **Next →** [08 — Crafting an Effective Measurement Scale](08%20-%20Crafting%20an%20Effective%20Measurement%20Scale.md)
