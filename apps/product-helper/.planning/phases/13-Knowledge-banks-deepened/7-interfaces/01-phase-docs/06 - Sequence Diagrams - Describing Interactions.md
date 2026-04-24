# 06 — Sequence Diagrams — Describing Interactions

## Prerequisites

- [ ] Completed [Step 05 — CRC Cards for Team Discovery](05%20-%20CRC%20Cards%20for%20Team%20Discovery.md).
- [ ] You have a consolidated list of interfaces from your DFD, N² Chart, and CRC sessions.

## Context (Why This Matters)

DFDs, N² Charts, and CRC Cards all identify *what* interfaces exist, but they do not show *when* interactions happen relative to each other or *in what order*. A Sequence Diagram maps the operational flow of a specific use case over time, showing the exact sequence of messages exchanged between subsystems. This makes Sequence Diagrams excellent for:

- Recording and highlighting interfaces discovered during CRC sessions
- Providing operational flow detail that an N² Chart cannot convey
- Identifying timing dependencies and handshake patterns

> **Software-specific insight:** In distributed systems, sequence diagrams expose the **critical path** of synchronous calls — the chain of blocking requests that determines total user-visible latency. They also reveal where asynchronous decoupling (message queues, event buses) isolates failures and reduces perceived wait times. See [API Design KB](api-design-sys-design-kb.md) and [Message Queues KB](message-queues-kb.md).

## Instructions

1. **Choose a single use case or operational scenario** to diagram. Each Sequence Diagram focuses on one scenario — you will create multiple diagrams for multiple scenarios.

2. **Draw participant boxes along the top.** Create a square-cornered box for each subsystem and external element involved in this scenario. Use the same font and box size for all participants. Add extra space in boxes with short names rather than shrinking boxes with long names.

3. **Arrange participants left to right** in the order you expect them to become active. The first subsystem to do something goes leftmost. This is not required but makes the diagram much easier to read.

4. **Draw a dashed lifeline** extending downward from the center of each participant box to the bottom of the diagram.

5. **Begin the scenario with a found message.** This is the initial trigger — a command, event, or interaction that starts the sequence. Draw it as a solid arrow with a filled arrowhead. Traditionally it comes from an unknown source, but in systems engineering it often originates from one of the participants.

6. **Draw activation rectangles.** When a participant becomes active (involved in the scenario), draw a thin rectangle on its lifeline. The rectangle spans the duration of the participant's involvement.

7. **Draw message arrows between participants:**
   - **Solid arrow with filled arrowhead** = a message, trigger, or data sent from one participant to another
   - **Dashed arrow with open arrowhead** = a return (response, output, or acknowledgment) back to the sender
   - Label every arrow with the interface name or trigger

8. **Close activation rectangles** when a participant's current involvement ends. The participant can be reactivated later with a new rectangle.

9. **Read the diagram top-to-bottom as a timeline.** Higher messages happen first. The vertical position represents the passage of time (though not necessarily to scale).

## Worked Example

**Scenario (e-commerce platform) — "Customer places an order":**

```
Participants (left to right):
  [Customer] [Storefront] [Cart Service] [Order Service] [Payment Service] [Notification Service]

External systems shown at far right:
  [Product DB] [Stripe API] [Message Queue] [SendGrid API]

Sequence:
  Customer ──── Browse / Add to Cart ────→ Storefront
  Storefront ── Add Item (REST POST /api/cart/items) ──→ Cart Service
  Cart Service ── Inventory Check (SQL SELECT) ──→ Product DB
  Product DB ─ ─ Stock Confirmed ─ ─→ Cart Service
  Cart Service ─ ─ Item Added (201 Created) ─ ─→ Storefront
  Storefront ─ ─ Updated Cart View ─ ─→ Customer

  Customer ──── Checkout ────→ Storefront
  Storefront ── Initiate Checkout (REST POST /api/checkout) ──→ Order Service
  Order Service ── Get Cart (REST GET /api/cart/{id}) ──→ Cart Service
  Cart Service ─ ─ Cart Contents (JSON) ─ ─→ Order Service
  Order Service ── Process Payment (REST POST /api/payments) ──→ Payment Service
  Payment Service ── Charge (HTTPS POST /v1/charges) ──→ Stripe API
  Stripe API ─ ─ Payment Confirmed ─ ─→ Payment Service
  Payment Service ─ ─ Payment Result ─ ─→ Order Service
  Order Service ── Publish Event (async) ──→ Message Queue
  Message Queue ──→ Notification Service
  Notification Service ── Send Email (HTTPS POST) ──→ SendGrid API
  Order Service ─ ─ Order Confirmation ─ ─→ Storefront
  Storefront ─ ─ Confirmation Page ─ ─→ Customer
```

> **Software-specific insight:** Notice the difference between **synchronous** messages (solid arrows — the sender blocks and waits for a response) and **asynchronous** messages (Order Service publishes to the message queue and does NOT wait for Notification Service to finish). This distinction is critical for understanding latency budgets and failure isolation. See [Message Queues KB](message-queues-kb.md) and [API Design KB](api-design-sys-design-kb.md).

**What the diagram reveals:** The checkout flow has a **synchronous critical path** (Storefront --> Order Service --> Payment Service --> Stripe API) where latency adds up. If each synchronous hop takes ~200ms, the total customer-visible latency for the checkout portion is ~800ms. Notification is **asynchronous and decoupled** — if email delivery fails, the order still succeeds. The sequence makes this latency chain visible and helps teams identify where caching (see [Caching KB](caching-system-design-kb.md)) or circuit breakers (see [Resiliency Patterns KB](resilliency-patterns-kb.md)) might be needed.

The ordering of messages also clarifies **data dependencies**: Order Service cannot calculate totals until it retrieves cart contents, and Payment Service cannot charge until Order Service provides the amount. These dependencies constrain parallelism and define the minimum possible latency.

## Validation Checklist (STOP-GAP)

- [ ] I have chosen a specific use case and drawn participant boxes for all involved subsystems.
- [ ] Participants are arranged left-to-right in approximate activation order.
- [ ] Each participant has a dashed lifeline.
- [ ] The scenario begins with a found message (solid arrow, filled arrowhead).
- [ ] Activation rectangles show when each participant is involved.
- [ ] All message arrows are labeled with the interface or trigger name.
- [ ] Return messages use dashed arrows with open arrowheads.
- [ ] The diagram reads top-to-bottom as a chronological timeline.

**STOP: Do not proceed to Step 07 until every box above is checked.**

## Output Artifact

One or more Sequence Diagrams, each showing the message flow for a specific operational scenario, with participants, lifelines, activation rectangles, and labeled messages.

## Handoff to Next Step

Step 07 introduces advanced Sequence Diagram notation — logic frames (if/else, loops), self-calls, guards, and interface specification tadpoles — for more complex scenarios.

---

**← Previous** [05 — CRC Cards for Team Discovery](05%20-%20CRC%20Cards%20for%20Team%20Discovery.md) | **Next →** [07 — Advanced Sequence Diagram Notation](07%20-%20Advanced%20Sequence%20Diagram%20Notation.md)
