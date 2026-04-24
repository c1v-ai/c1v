# CAP Theorem — Consistency, Availability, and Partition Tolerance

## Context (Why This Matters)

In any distributed system — one where data lives on more than one node — you face a fundamental trade-off. The CAP Theorem states that you can only guarantee **two out of three** properties simultaneously: Consistency, Availability, and Partition Tolerance. Since network partitions are unavoidable in real distributed systems, the practical decision reduces to: **do you prioritize Consistency or Availability?** This choice shapes your entire architecture — database selection, replication strategy, transaction model, and user experience.

## The Three Properties

| Property | Definition | Plain English |
|----------|-----------|---------------|
| **Consistency (C)** | All nodes return the same data at the same time. Every read reflects the most recent write. | All users see the same thing, always. |
| **Availability (A)** | Every request receives a response (success or failure), even if some nodes are down. | The system always responds — no errors, no timeouts. |
| **Partition Tolerance (P)** | The system continues to operate despite network failures between nodes. | If the cable between Server A and Server B is cut, the system still works. |

## Why You Must Choose

In a distributed system, **Partition Tolerance is non-negotiable** — networks fail, and your system must handle it. That leaves one real decision:

> **During a network partition, do you stop serving data (choose Consistency) or risk serving stale data (choose Availability)?**

### The Scenario That Forces the Choice

Two servers: one in the US, one in Europe. User A updates their profile on the US server. Before the update replicates to Europe, the network link between servers goes down. User B in Europe requests User A's profile.

- **If you choose Consistency:** User B gets an error. The system refuses to show potentially stale data. No one sees wrong information, but some users are temporarily blocked.
- **If you choose Availability:** User B sees the old profile. The system always responds, but some users temporarily see outdated information.

## When to Prioritize Consistency (CP)

Choose consistency when **stale data would be catastrophic** — when showing incorrect information causes real harm, financial loss, or broken invariants:

| Domain | Why Consistency Is Critical |
|--------|---------------------------|
| **Ticket booking** (airlines, events, hotels) | Two users cannot book the same seat. Showing an already-booked seat as available causes double-booking. |
| **Inventory systems** (e-commerce) | If one item remains and two users both see it as available, both "buy" it — but only one can receive it. |
| **Financial systems** (trading, banking) | Order books and account balances must reflect the true state. A stale view can cause incorrect trades or overdrafts. |

### Design Implications of Choosing Consistency

- **Distributed transactions** — ensure writes propagate atomically across caches, databases, and replicas.
- **Single-node databases** — avoid replication lag entirely by routing all reads/writes to one instance (e.g., a single PostgreSQL primary).
- **Accept higher latency** — users may see loading spinners while the system waits for propagation to complete.
- **Typical technologies:** PostgreSQL, MySQL, Google Spanner, DynamoDB (strong consistency mode).

## When to Prioritize Availability (AP)

Choose availability when **stale data is tolerable** — when temporarily showing outdated information causes no real harm:

| Domain | Why Availability Is Preferred |
|--------|------------------------------|
| **Social media** (posts, feeds, comments) | If a user's post takes a few seconds to appear for other users, no one is harmed. |
| **Business listings** (Yelp, Google Maps) | A menu item being slightly outdated for a few seconds is far less harmful than the business page being unavailable. |
| **Content platforms** (Netflix, YouTube) | An updated movie description arriving a few seconds late is invisible to users. |
| **Profile data** | Showing an old profile picture for a brief period is harmless. |

### Design Implications of Choosing Availability

- **Multiple read replicas** — scale horizontally; replication lag is acceptable.
- **Eventual consistency** — data converges to a consistent state over time, but not instantly.
- **Change Data Capture (CDC)** — propagate changes asynchronously between systems.
- **Typical technologies:** Cassandra, DynamoDB (multi-AZ mode), MongoDB (replica sets), Redis Cluster.

## Advanced: Mixed Consistency Within One System

A real system often has **different consistency requirements for different features.** You do not have to make one global choice.

| System | Consistent Part | Available Part |
|--------|----------------|----------------|
| **Ticketmaster** | Booking tickets (no double-booking) | Browsing and searching events (stale descriptions are fine) |
| **Tinder** | Match data (both users must see the match instantly) | Profile viewing (old photos are harmless for a few seconds) |
| **Amazon** | Checkout and inventory (last-item accuracy) | Product catalog and reviews (eventual consistency is fine) |

In a system design context, specify consistency requirements **per feature**, not for the system as a whole.

## Levels of Consistency

"Consistency" is not binary — there is a spectrum from strongest to weakest:

| Level | Definition | Example |
|-------|-----------|---------|
| **Strong consistency** | All reads reflect the most recent write. Every user sees the same state. | Bank account balance after a transfer |
| **Causal consistency** | Related events appear in the correct order, but unrelated events may arrive out of order. | A reply to a comment always appears after the comment it replies to |
| **Read-your-own-writes** | A user always sees their own recent changes, but other users may see stale data. | After updating your profile, you immediately see the update — but your friend may not yet |
| **Eventual consistency** | All replicas converge to the same state given enough time, but reads may be stale in the interim. | A new Netflix movie description propagating across global CDN nodes |

When you choose "availability over consistency," you are choosing eventual consistency — not *no* consistency. The data will converge; it just takes time.

## Decision Framework

When evaluating a system's non-functional requirements, ask one question:

> **"If two users see different states of this data at the same time, is the consequence catastrophic?"**

- **Yes → Prioritize Consistency.** Accept higher latency, fewer replicas, and potential unavailability during partitions.
- **No → Prioritize Availability.** Use replicas, eventual consistency, and asynchronous propagation for better performance and uptime.

## Validation Checklist

