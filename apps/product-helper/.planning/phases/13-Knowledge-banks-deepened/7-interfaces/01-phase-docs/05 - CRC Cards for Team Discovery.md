# 05 — CRC Cards for Team Discovery

## Prerequisites

- [ ] Completed [Step 04 — Formalizing with N-Squared Charts](04%20-%20Formalizing%20with%20N-Squared%20Charts.md).
- [ ] You have an N² Chart showing known interfaces.
- [ ] You can gather at least one representative per subsystem team.

## Context (Why This Matters)

DFDs and N² Charts are valuable, but they are typically created by one or two people working from their own understanding. CRC (Class-Responsibility-Collaboration) Cards bring the entire team together to walk through real scenarios, which uncovers interfaces that no single person would have anticipated. The physical act of handing cards between team members makes interface dependencies visceral and keeps energy high during what could otherwise be a dry documentation exercise.

Originally developed by Ward Cunningham for object-oriented software design, the CRC Card technique has proven equally effective for systems engineering interface discovery.

## Instructions

1. **Gather at least one representative from each subsystem team.** Everyone should have a sheet of paper (or laptop with a spreadsheet) and a stack of index cards.

2. **Set up each person's tracking sheet** with two columns:

   | Responsibilities | Collaborators |
   |-----------------|---------------|
   | *(what my subsystem must do)* | *(which other subsystems are involved)* |

3. **Prepare index cards.** Each card has a header with the subsystem name and two columns matching the spreadsheet: Responsibilities and Collaborators.

4. **The leader walks the team through a use case or scenario.** The leader typically plays the role of any external actor (e.g., the customer, the payment provider). As the scenario unfolds:
   - When your subsystem must do something, write the responsibility on your tracking sheet.
   - If your responsibility involves another subsystem, also write it on an index card and **physically hand that card** to that subsystem's representative.

5. **Manage the level of discussion carefully.** When someone hands a card, the natural impulse is to dive into specification details (request/response schemas, retry policies, timeout values). Resist this during the session:
   - **Keep the focus on identifying interfaces**, not specifying them.
   - **If the conversation turns to specification details**, that is a signal to note the interface and schedule a follow-up meeting between the involved subsystems.
   - **Some discussion is valuable** — particularly when it reveals new interfaces. The key is to distinguish "we discovered a new connection" (good, continue) from "let's design the API contract right now" (defer to the Interface Matrix).

6. **Iterate through multiple scenarios.** Different use cases reveal different interfaces. Run through normal operation, edge cases, error conditions, startup/shutdown, and maintenance scenarios.

7. **After the session, consolidate.** Collect all cards and tracking sheets. Any interface that appeared on a card but not yet in your DFD or N² Chart should be added.

## Worked Example

**Scenario (e-commerce platform) — "Customer places an order during a flash sale":**

1. **Leader (playing the Customer):** "A customer finds a product during a flash sale and clicks Buy Now."

2. **Storefront rep:** "I route the request to Cart Service." *(writes responsibility on sheet, hands card to Cart)*

3. **Cart rep:** "I need to check inventory — it's a flash sale, stock is limited." *(writes responsibility, hands card to Product DB)*

4. **Cart rep:** "Wait — I need to RESERVE the inventory, not just check it. Otherwise another customer could grab the same item between our check and the payment." *(This reveals a critical interface: inventory reservation with a time-limited hold — see [Data Model KB](data-model-kb.md) for pessimistic vs. optimistic locking)*

5. **Order rep:** "I need the cart contents AND the reservation token from Cart to proceed to payment." *(writes responsibility, hands card to Cart requesting both cart data and reservation proof)*

6. **Payment rep:** "I process payment through Stripe. But what if Stripe is slow or down? How long should Order Service wait?" *(This reveals a timeout and retry interface between Order and Payment — see [Resiliency Patterns KB](resilliency-patterns-kb.md) for circuit breaker and retry patterns)*

7. **Notification rep:** "Once payment succeeds, I need an event on the message queue with order details, customer email, and items purchased. Who sends it?" *(This reveals the specific message queue event schema needed — see [Message Queues KB](message-queues-kb.md))*

8. **Order rep:** "I'll publish it." *(writes responsibility, hands card to Notification)*

**Discovery:** The CRC session revealed three interfaces not in the original DFD:

- **(a) Inventory reservation interface** — Cart Service must not just check stock but actively reserve it with a time-limited hold (TTL), requiring a new `POST /cart/reservations` endpoint and a background job to release expired reservations. This is fundamentally different from a simple `GET /inventory/:productId` check.

- **(b) Timeout and retry contract between Order and Payment** — The Order Service needs to know the Payment Service's maximum response time, retry policy, and idempotency key format so it can safely retry failed payment attempts without double-charging. This is a design interface that must be agreed upon before either service can be built.

- **(c) Message queue event schema for Notification** — The Notification Service requires a specific event payload (order ID, customer email, item list, order total) published to the message queue. The Order Service is responsible for publishing, but the schema must be co-designed with Notification.

None of these were visible in the original DFD. They are now added to the N² Chart and will be fully specified in the Interface Matrix.

> **QFD bridge note:** The flash sale scenario is especially valuable because it stress-tests the system under the QFD's performance targets (200ms response time, 3 redundant instances). Inventory reservation under high concurrency is exactly the kind of interface that breaks under load if not carefully specified. Consider running additional CRC scenarios for other high-stress cases: abandoned carts, payment failures, and concurrent checkout races.

## Validation Checklist (STOP-GAP)

- [ ] I have run at least one scenario-based CRC Cards session with subsystem representatives.
- [ ] Each participant tracked their responsibilities and collaborators.
- [ ] Cards were physically (or digitally) exchanged to formalize interface relationships.
- [ ] I kept discussion at the identification level, deferring specification details to later.
- [ ] Newly discovered interfaces have been added to my DFD and/or N² Chart.

**STOP: Do not proceed to Step 06 until every box above is checked.**

## Output Artifact

A set of CRC cards and tracking sheets documenting subsystem responsibilities and collaborations, plus an updated DFD/N² Chart incorporating newly discovered interfaces.

## Handoff to Next Step

CRC Cards discover *what* interfaces exist through team interaction. Step 06 introduces Sequence Diagrams, which document *when* and *how* subsystems interact over time during a specific operational scenario.

---

**← Previous** [04 — Formalizing with N-Squared Charts](04%20-%20Formalizing%20with%20N-Squared%20Charts.md) | **Next →** [06 — Sequence Diagrams — Describing Interactions](06%20-%20Sequence%20Diagrams%20-%20Describing%20Interactions.md)
