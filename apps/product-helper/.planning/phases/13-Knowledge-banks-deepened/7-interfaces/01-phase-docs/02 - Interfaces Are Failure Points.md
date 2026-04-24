# 02 -- Interfaces Are Failure Points

## Prerequisites

- [ ] Completed [Step 01 -- Why Interfaces Matter](01%20-%20Why%20Interfaces%20Matter.md).
- [ ] You have a list of subsystems with clear responsibilities.

## Context (Why This Matters)

When systems fail, they almost always fail at the interfaces. One service works great on its own. Another seems to work great on its own. You put them together and the entire system fails — because the interface was not understood, defined, or communicated well enough. The cost of interface failures ranges from wasted rework to catastrophic production outages that affect real customers and revenue.

In software systems, an interface is any **API contract, message schema, shared database table, event format, or configuration dependency** between services. Every REST endpoint, every message queue topic, every shared database table, every environment variable that one service reads and another writes — these are all interfaces. See [API Design KB](api-design-sys-design-kb.md) for how protocol choices (REST, gRPC, GraphQL, WebSocket) shape how interfaces are expressed and documented.

## Instructions

1. **Understand the definition of an interface.** An interface can be broadly defined as:
   - Any information that Subsystem A **needs from** Subsystem B in order for Subsystem A to operate or be designed properly, OR
   - Any information that Subsystem A **must give to** Subsystem B in order for Subsystem B to operate or be designed properly, OR
   - Anything **exterior to** Subsystem A that Subsystem A must work with in its operation.

   In software terms: the Cart Service **needs** product pricing data from the Product Database. The Order Service **must give** order-created events to the Notification Service. The Payment Service **must work with** the external Stripe API.

2. **Recognize that interface failures come from incomplete or incorrect information.** The classic failure pattern is: Team A assumes Team B will provide certain details. Team B assumes Team A already knows. Neither confirms. The result is wasted time, rework, and blown budgets — or worse.

3. **Separate interface work into two phases:**

   | Phase | Goal | Example |
   |-------|------|---------|
   | **Phase 1 -- Identification** | Discover the interfaces: which subsystems interact and what information flows between them | "The Cart Service must send cart contents to the Order Service at checkout" |
   | **Phase 2 -- Specification** | Record the detailed information for each interface: data types, formats, protocols, authentication, timeouts, retry policies, and anything a consumer needs to know | "Cart contents: JSON array, REST POST `/api/orders/checkout`, fields: `item_id` (UUID), `quantity` (int), `unit_price_cents` (int), `currency` (ISO 4217). Auth: Bearer JWT. Timeout: 500 ms. Retry policy: 2 retries with exponential backoff. See [Resiliency Patterns KB](resilliency-patterns-kb.md)." |

4. **Recognize that each technique in this module helps with one or both phases.** DFDs and CRC Cards are primarily identification tools. N² Charts bridge identification and specification. Sequence Diagrams detail the operational flow. The Interface Matrix captures the full specification.

## Worked Example

**Scenario (e-commerce platform):** The Order Service team assumes the Cart Service returns prices in cents (integers). The Cart Service team returns prices in dollars (floats). Neither team confirms the format. Result: on the first production order, customers are charged 100x the correct amount. A $29.99 item rings up as $2,999.00. The bug is caught within minutes, but not before 47 orders are processed incorrectly — requiring manual refunds, customer support escalation, and a post-mortem.

This is a pure interface specification failure. The interface was identified (cart data must flow to the order service), but the specification was incomplete: the field name was agreed upon (`unit_price`), but the units (cents vs. dollars), data type (integer vs. float), and validation rules were never confirmed. A single row in the Interface Matrix — specifying `unit_price_cents: integer, denominated in smallest currency unit` — would have prevented the entire incident.

**Real-world failure (classic):** The Mars Climate Orbiter was lost because one team sent navigation commands in imperial units (pound-force seconds) while the receiving system expected metric (newton-seconds). The interface was identified (navigation data must flow between ground control and the orbiter), but the specification was incomplete (units were never confirmed). Total cost: $327 million.

**Real-world failure (software):** In 2017, a major AWS S3 outage cascaded across the internet because hundreds of services had undocumented dependencies on S3's availability — their interfaces assumed S3 would never fail. Services that used S3 for configuration storage, health check endpoints, and static asset delivery all went down simultaneously, even though their core functionality had nothing to do with S3. The root cause was not S3 itself but the **unspecified interface dependency**: no service had documented that it required S3 with a specific availability SLA, and no service had implemented fallback behavior. See [Resiliency Patterns KB](resilliency-patterns-kb.md) for how circuit breakers and graceful degradation prevent cascade failures, and [Software Architecture KB](software_architecture_system.md) for defining SLOs/SLAs at interface boundaries.

> **Bridge from QFD (if available):** Your QFD design target of "Server Response Time: 200 ms" is an interface-level constraint. If the checkout flow crosses 4 service boundaries (Storefront -> Cart -> Order -> Payment), each interface gets roughly a 50 ms budget. If any single interface is unspecified and a team builds it with a 500 ms timeout, the entire chain blows the target. Similarly, the QFD reliability weight (16.7%) means payment and order interfaces must include retry policies, circuit breakers, and idempotency keys — these are specification details, not just identification.

## Validation Checklist (STOP-GAP)

- [ ] I can define "interface" in my own words.
- [ ] I can distinguish between Phase 1 (identification) and Phase 2 (specification).
- [ ] I can explain why interface failures are so common and costly.
- [ ] I understand that each technique in this module addresses one or both phases.

**STOP: Do not proceed to Step 03 until every box above is checked.**

## Output Artifact

A clear mental model of why interfaces matter, the two-phase approach (identify then specify), and the consequences of getting interfaces wrong.

## Handoff to Next Step

Step 03 introduces the first interface *identification* technique: Data Flow Diagrams — a fast, visual way to brainstorm which subsystems connect and what flows between them.

---

**<-- Previous** [01 -- Why Interfaces Matter](01%20-%20Why%20Interfaces%20Matter.md) | **Next -->** [03 -- Brainstorming with Data Flow Diagrams](03%20-%20Brainstorming%20with%20Data%20Flow%20Diagrams.md)
