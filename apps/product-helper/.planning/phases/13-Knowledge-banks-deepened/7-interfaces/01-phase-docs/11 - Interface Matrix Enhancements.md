# 11 — Interface Matrix Enhancements

## Prerequisites

- [ ] Completed [Step 10 — Building Consensus with an Interface Champion](10%20-%20Building%20Consensus%20with%20an%20Interface%20Champion.md).
- [ ] You have a complete Interface Matrix with values, units, tracking metadata, and champion assignments.

## Context (Why This Matters)

A basic Interface Matrix shows what each subsystem provides to others. But subsystem teams also need to see what they *receive from* others — and the project leadership needs a system-level view of how shared resources (latency, cost, API rate limits, storage) are allocated. These two enhancements transform the Interface Matrix from a reference document into an active management tool.

## Instructions

### Enhancement 1: Received-From View

1. **Add "Received From" rows to each subsystem tab.** For every piece of interface information that a subsystem needs from another subsystem, add a row to that subsystem's tab.

2. **Mark the providing subsystem's column with "Received From."** This is the mirror of the "Provided To" marking. For example, if the Cart Service tab has a "Provided To" row for cart contents under the Order Service column, then the Order Service tab gets a "Received From" row for cart contents under the Cart Service column.

3. **Benefit:** Each subsystem team now has a one-stop-shop view — one tab shows everything they provide AND everything they receive. No need to flip between multiple tabs.

4. **Implementation note:** In Excel, you can use cell references across tabs so that "Received From" values automatically update when the providing subsystem changes its values. This requires more setup effort but prevents data from getting out of sync. Dedicated interface management software handles this automatically.

### Enhancement 2: Budget Tracking

5. **Identify shared resources** that must be allocated across subsystems. In software systems, common shared resources include:
   - Latency budget (end-to-end response time)
   - Monthly infrastructure cost
   - API rate limits (external provider quotas shared across services)
   - Storage capacity (database, object storage, cache)
   - Message queue throughput
   - Error budget (SLO-based — see [software_architecture_system.md](software_architecture_system.md))

6. **Create a system-level tab** (or assign budget ownership to a specific subsystem). This tab, often managed by the project lead or platform team, shows the allocation of each shared resource to every subsystem.

7. **Add two columns for each budget item:**

   | Column | Purpose |
   |--------|---------|
   | **Target Budget** | The goal or constraint value — set by stakeholders, project leadership, or the owning subsystem. This is the allocation each subsystem is working toward. |
   | **True Budget** | The current actual value — updated as the design evolves. Typically calculated using `=SUM()` or cell references to aggregate values from individual subsystem tabs. |

8. **Track the gap between Target and True.** When True Budget exceeds Target Budget for any resource, you have a budget overrun that must be addressed — either by reducing one subsystem's allocation or by negotiating a higher overall budget.

9. **Use the Target/True approach for performance metrics too.** The same two-column pattern can track system-level performance criteria (e.g., total end-to-end latency vs. target latency, total monthly cost vs. budget cap).

## Worked Example

### Latency Budget (system-level)

**Scenario (e-commerce platform) — Checkout critical path latency budget:**

| Subsystem | Target Latency (ms) | True Latency (ms) |
|---|---|---|
| CDN / Storefront (cached page) | 50 | 45 |
| Search Service (query) | 150 | 180 |
| Cart Service (add item) | 100 | 85 |
| Order Service (checkout) | 150 | 150 |
| Payment Service (Stripe call) | 400 | 450 |
| Notification (email send) | N/A (async) | N/A |
| **Checkout Critical Path** | **700** | **730** |

**What this reveals:** The critical path is 30ms over budget. Search Service and Payment Service exceed their targets. The Interface Champion for latency convenes these teams — or escalates to investigate caching (see [Caching KB](caching-system-design-kb.md)) and async payment patterns (see [Message Queues KB](message-queues-kb.md)).

### Monthly Cost Budget

**Scenario (e-commerce platform) — Infrastructure cost budget tracking:**

| Subsystem | Target Cost ($/mo) | True Cost ($/mo) |
|---|---|---|
| CDN (CloudFront) | 800 | 750 |
| Compute (3 instances) | 2,400 | 2,400 |
| Database (PostgreSQL RDS) | 600 | 700 |
| Message Queue (SQS) | 100 | 80 |
| Monitoring (Datadog) | 400 | 450 |
| Third-party APIs (Stripe, SendGrid) | 700 | 650 |
| **Total** | **5,000** | **5,030** |

**What this reveals:** The system is slightly over the $5K/mo QFD target. Database and Monitoring exceed their allocations. The Interface Champion for cost convenes these teams — the database team may need to optimize query patterns or right-size the RDS instance, while the monitoring team may need to reduce Datadog's custom metric count or adjust log retention.

### Received-From Example

**Cart Service tab — showing both Provided To and Received From views:**

| Interface Specification | Storefront | Order | Product DB | Value | Units |
|---|---|---|---|---|---|
| *(Provided To section)* | | | | | |
| Cart state | Provided To | | | JSON | — |
| Cart contents for checkout | | Provided To | | JSON | — |
| *(Received From section)* | | | | | |
| Add/remove item requests | Received From | | | REST POST | — |
| Cart retrieval request | | Received From | | REST GET | — |
| Stock availability | | | Received From | Boolean + qty | — |

Now the Cart Service team can see everything — what they provide and what they receive — on a single tab.

## Validation Checklist (STOP-GAP)

- [ ] Each subsystem tab includes "Received From" rows for information it needs from other subsystems.
- [ ] "Received From" values reference the providing subsystem's tab (or are manually kept in sync).
- [ ] Shared resources (latency, cost, rate limits, etc.) have been identified.
- [ ] A system-level tab (or designated subsystem tab) tracks Target Budget vs. True Budget for each shared resource.
- [ ] Budget overruns (True > Target) are flagged and have action plans.
- [ ] Each subsystem team can see all their provides and receives on a single tab.

**STOP: Review your complete Interface Matrix against this checklist before considering it done.**

## Output Artifact

An enhanced Interface Matrix with:
- Received-From views on each subsystem tab
- System-level budget tracking (Target vs. True) for latency, cost, and other shared resources
- Full traceability from DFD → N² Chart → Sequence Diagrams → Interface Matrix

## What Comes Next

Your Interface Matrix is now a complete, living specification of every interface in your system. As the design evolves:
- Update values and have the Interface Champion approve changes.
- Re-run budget checks when any subsystem's True Budget values change.
- Revisit your DFDs and Sequence Diagrams if new interfaces are discovered.
- Use the Interface Matrix as the definitive reference during integration testing.

---

**← Previous** [10 — Building Consensus with an Interface Champion](10%20-%20Building%20Consensus%20with%20an%20Interface%20Champion.md) | **Next →** [GLOSSARY](GLOSSARY.md)
