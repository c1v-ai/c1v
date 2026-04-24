# 07 — Advanced Sequence Diagram Notation

## Prerequisites

- [ ] Completed [Step 06 — Sequence Diagrams — Describing Interactions](06%20-%20Sequence%20Diagrams%20-%20Describing%20Interactions.md).
- [ ] You have at least one basic Sequence Diagram.

## Context (Why This Matters)

Basic Sequence Diagrams show the happy path — a linear flow of messages. But real systems have conditional behavior, loops, and internal processing. Advanced notation lets you capture these realities so that your Sequence Diagrams reflect how the system actually operates, not just the simplest case. This richer representation also helps identify additional interfaces that only appear under specific conditions.

> **Software-specific insight:** In distributed systems, the most critical interfaces are often the ones that only activate during **failure paths** — retries, fallbacks, circuit-breaker trips, and compensating transactions. Advanced notation makes these conditional flows explicit and traceable. See [Resiliency Patterns KB](resilliency-patterns-kb.md) and [Observability KB](observability-kb.md).

## Instructions

### Frames and Operators

1. **Use frames to show logic.** A frame is a labeled box drawn *behind* the activation rectangles, enclosing the affected part of the sequence. The label in the upper-left corner is called the **operator** and indicates what kind of logic the frame represents:

   | Operator | Meaning | When to Use |
   |----------|---------|-------------|
   | `loop` | Repeat the enclosed sequence | Continuous monitoring, polling, iterative processing |
   | `alt` | If/else — choose one path | Branching based on a condition |
   | `opt` | Optional — execute only if condition is true | Single conditional without an else |
   | `par` | Parallel — enclosed sequences happen simultaneously | Concurrent operations |
   | `ref` | Reference — points to another Sequence Diagram | Breaking a complex sequence into smaller diagrams |

2. **Add guards to frames.** Next to the operator, write a condition in square brackets that determines when the frame executes. For `alt` frames, a dashed line separates the if-true path from the else path, with `[else]` written below the dashed line.

3. **Add guards directly to message arrows** for single-message conditions. A guard on an arrow means "this message is only sent if the condition in brackets is true." This is equivalent to a one-message `opt` frame.

### Self-Calls

4. **Draw self-calls** as a message arrow that loops back to the same participant, with an overlapping activation rectangle. A self-call indicates that a specific sub-part of the participant is being activated — for example, a subsystem running an internal calculation or invoking a sub-module.

### Interface Specifications (Data Tadpoles)

5. **Annotate interface specifications** using a small circle and arrow (a "data tadpole") placed just above or below a message arrow. This is an older practice but still commonly used to show brief specification details (e.g., data format, frequency) directly on the diagram. **Even if you add tadpoles, the full specification must still appear in the Interface Matrix.**

> **Interface specification note:** Even though you can annotate interface details with data tadpoles in the sequence diagram, you MUST still include every specification in the Interface Matrix. The sequence diagram provides context; the Interface Matrix is the single source of truth.

### Best Practices

6. **Don't overload a single diagram.** If a scenario is too complex, use `ref` frames to break it into sub-diagrams. Each diagram should be readable at a glance.

7. **Check for UML compliance** if your organization follows UML standards. The notation described here largely follows UML Sequence Diagram conventions, but some organizations have specific variations.

## Worked Example

**Scenario (e-commerce platform) — "Checkout with payment handling and health monitoring":**

```
═══════════════════════════════════════════════════════════════════════════
FRAME 1: loop [every 30s] — Health Check Polling
═══════════════════════════════════════════════════════════════════════════

[loop] [every 30s]
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Monitoring (Datadog) ── GET /health ──→ Storefront              │
│  Monitoring (Datadog) ── GET /health ──→ Cart Service            │
│  Monitoring (Datadog) ── GET /health ──→ Order Service           │
│  Monitoring (Datadog) ── GET /health ──→ Payment Service         │
│  Monitoring (Datadog) ── GET /health ──→ Notification Service    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════
FRAME 2: alt — Payment Success vs. Failure
═══════════════════════════════════════════════════════════════════════════

  Order Service ── Get Cart (REST GET) ──→ Cart Service
  Cart Service ─ ─ Cart Contents ─ ─→ Order Service
                   ◯─── JSON: [{item_id: UUID, qty: int, price_cents: int}]
                         (data tadpole on return arrow)

  Order Service ──┐
                  └──→ Order Service (self-call: Calculate order total)
                       Computes subtotal, taxes, shipping internally
                       before sending payment request.

  [item.quantity > 0]
  Cart Service ── Reserve Inventory (SQL UPDATE) ──→ Product DB
                  (guard: only sent if item quantity is available)

  Order Service ── Process Payment (REST POST /api/payments) ──→ Payment Service
  Payment Service ── Charge (HTTPS POST) ──→ Stripe API
  Stripe API ─ ─ Payment Response ─ ─→ Payment Service

  [alt] [payment.status == "succeeded"]
  ┌──────────────────────────────────────────────────────────────┐
  │                                                              │
  │  Payment Service ─ ─ Payment Confirmed ─ ─→ Order Service   │
  │  Order Service ── Mark Order Confirmed (UPDATE) ──→ DB      │
  │  Order Service ── Publish OrderConfirmed Event ──→ MQ       │
  │  MQ ──→ Notification Service                                │
  │  Notification Service ── Send Confirmation Email ──→         │
  │                                              SendGrid API   │
  │                                                              │
  │ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - │
  │ [else]                                                       │
  │                                                              │
  │  Payment Service ─ ─ Payment Failed ─ ─→ Order Service      │
  │  Order Service ── Mark Order Failed (UPDATE) ──→ DB         │
  │  Order Service ── Release Reservation ──→ Cart Service      │
  │  Cart Service ── Release Inventory (SQL UPDATE) ──→         │
  │                                              Product DB     │
  │                                                              │
  └──────────────────────────────────────────────────────────────┘
```

**What the notation reveals:**

- The **`loop` frame** shows that health check polling is a continuous background process, not a one-shot interaction. Monitoring polls every 30 seconds across all services — this drives the observability infrastructure (see [Observability KB](observability-kb.md)).
- The **`alt` frame** makes the payment branching logic explicit — different interfaces activate depending on whether the payment succeeds or fails. On the failure path, a compensating transaction (releasing inventory) is triggered — an interface that would be invisible on the happy-path-only diagram.
- The **self-call** on Order Service shows internal processing (calculating totals, taxes, and shipping) that happens before the payment request is sent. This makes it clear that the latency of this computation is part of the critical path, even though no external message is exchanged.
- The **guard** `[item.quantity > 0]` on the inventory reservation message shows that this call is conditional — Cart Service only reserves inventory when stock is available.
- The **data tadpole** on the Cart Contents return arrow documents the JSON payload structure inline, providing quick reference without opening the Interface Matrix. However, the full schema (field types, validation rules, size limits) must still be recorded in the Interface Matrix.

## Validation Checklist (STOP-GAP)

- [ ] I have used frames (`loop`, `alt`, `opt`, etc.) where my scenario has conditional or repeated behavior.
- [ ] Each frame has an operator label and a guard condition in square brackets.
- [ ] `alt` frames have a dashed line separating the if-true and else paths.
- [ ] Self-calls use an overlapping activation rectangle on the same participant.
- [ ] If I used data tadpoles, the same specifications also appear in the Interface Matrix.
- [ ] No single diagram is so complex that it is hard to read at a glance.
- [ ] I have checked whether my organization follows specific UML or notation standards.

**STOP: Do not proceed to Step 08 until every box above is checked.**

## Output Artifact

Enhanced Sequence Diagrams incorporating logic frames, guards, self-calls, and optionally data tadpoles for key interface specifications.

## Handoff to Next Step

You have now completed Part 1 — discovering and defining interfaces using DFDs, N² Charts, CRC Cards, and Sequence Diagrams. Step 08 begins Part 2: building the **Interface Matrix**, the master specification document where every interface detail is formally recorded.

---

**← Previous** [06 — Sequence Diagrams — Describing Interactions](06%20-%20Sequence%20Diagrams%20-%20Describing%20Interactions.md) | **Next →** [08 — Creating the Interface Matrix](08%20-%20Creating%20the%20Interface%20Matrix.md)
