# 10 — Building Consensus with an Interface Champion

## Prerequisites

- [ ] Completed [Step 09 — Adding Values and Units](09%20-%20Adding%20Values%20and%20Units.md).
- [ ] You have an Interface Matrix with values, units, and tracking metadata.

## Context (Why This Matters)

Values in the Interface Matrix are useless if the teams that depend on them don't agree. The Storefront team wants the checkout endpoint to respond in under 200ms; the Order Service team says 500ms is the best they can do. One team needs a final value by March; another can't commit until June. These conflicts are natural and inevitable — what matters is that they are surfaced, discussed, and resolved early. The **Interface Champion** is the designated person who ensures this happens.

## Instructions

### Cross-Team Review

1. **Have each sub-team review the interface specifications with every other sub-team** that depends on them. In each review, draw out the following:
   - Is this all the information you need from us?
   - Are there additional constraints or ranges that are acceptable?
   - How would a change in this value impact your work?
   - How would a change impact overall system performance?

2. **Add new specifications discovered during review.** Cross-team discussions frequently reveal additional interface specifications that no single team anticipated. Add them to the matrix.

3. **Use QFD as a conflict-resolution tool.** When sub-teams disagree on a value (e.g., how to allocate latency or cost budget), the QFD's engineering characteristic trade-off analysis (Module 5) can help reason through the impacts on performance criteria. In this case, the QFD roof showed that Server Response Time and Queue Processing Rate have a positive relationship — investing in async processing improves both.

### The Interface Champion Role

4. **Assign an Interface Champion for each interface specification.** Add an "Interface Champion" column to the matrix. The champion is:
   - **Not always the project lead** — it is often a member of one of the involved subsystem teams
   - **Selected based on the most important criterion:** they must be able to understand the impact the interface has on *all* involved subsystems

5. **Define the champion's responsibilities:**
   - **Mediate disagreements** between subsystem teams about values, ranges, and timelines
   - **Sign off on changes** — no interface value may be changed without the champion's approval
   - **Approve test conditions** — the champion reviews and approves what constitutes a successful test of the interface to ensure it meets all dependent subsystems' needs, not just the providing subsystem's definition of "working"
   - **Track the interface** throughout the project lifecycle

6. **Make champion assignments visible.** Every team should be able to look at any interface specification and immediately see who the champion is.

### Duplicating the Matrix

7. **Once champions are assigned, duplicate the spreadsheet** to create one complete copy per subsystem. Each subsystem now has its own tab showing:
   - What it provides to others ("Provided To")
   - What it needs from others (added in Step 11)
   - Who the champion is for each specification
   - All values, units, and tracking metadata

## Worked Example

**Scenario (e-commerce platform) — Resolving a response time SLA disagreement:**

The Storefront team wants the Order Service checkout endpoint to respond in under 200ms (to meet the QFD's page load speed target). The Order Service team says 200ms is impossible because they must call Cart Service (~100ms) and then Payment Service (300–500ms for Stripe) sequentially. The Interface Champion — a senior engineer from the platform/infrastructure team who understands both latency budgets and payment processing constraints — facilitates the discussion:

- **Storefront team:** "At 500ms, the total page load with rendering exceeds 1 second. Users bounce."
- **Order Service team:** "We can't make Stripe faster. Their API takes 300–500ms."
- **Champion reviews architecture:** "Can we decouple the payment confirmation from the checkout response?"
- **Resolution:** Order Service returns a **202 Accepted** with an `order_id` immediately (~150ms), then processes payment asynchronously. Storefront shows a "Processing payment..." state. Notification Service sends confirmation when payment completes. See [API Design KB](api-design-sys-design-kb.md) for async API patterns and [Message Queues KB](message-queues-kb.md) for event-driven decoupling.

The champion logs this architectural decision, updates the Interface Matrix (checkout endpoint SLA changes from 500ms to 150ms, adds a new async `payment.completed` event interface), and will not approve any change to the checkout flow without reconvening the Storefront, Order, and Payment teams.

## Validation Checklist (STOP-GAP)

- [ ] Each sub-team has reviewed its interface specifications with every dependent sub-team.
- [ ] New specifications discovered during review have been added to the matrix.
- [ ] An Interface Champion is assigned for every interface specification.
- [ ] Champions are selected based on their ability to understand cross-subsystem impact.
- [ ] The champion's responsibilities are clear: mediate, sign off on changes, approve test conditions.
- [ ] The Interface Champion column is visible in the matrix.
- [ ] The matrix has been duplicated — one tab per subsystem.

**STOP: Do not proceed to Step 11 until every box above is checked.**

## Output Artifact

A complete Interface Matrix with Interface Champion assignments for every specification, backed by cross-team consensus on current values.

## Handoff to Next Step

Step 11 introduces two powerful enhancements: **received-from views** (so each subsystem can see what it needs from others in one place) and **budget tracking** (to manage shared resource allocations like latency, cost, API rate limits, and error budgets).

---

**← Previous** [09 — Adding Values and Units](09%20-%20Adding%20Values%20and%20Units.md) | **Next →** [11 — Interface Matrix Enhancements](11%20-%20Interface%20Matrix%20Enhancements.md)
