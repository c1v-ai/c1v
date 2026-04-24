# 18 — Applying the Decision Matrix to Software System Decisions

## Purpose

You now know how to build and use a decision matrix. This file bridges that framework to the world of software system design — translating engineering concepts into business-legible criteria so that non-technical stakeholders can evaluate, challenge, and approve architecture decisions with the same rigor used for any other business investment.

## The Core Insight

Software architecture decisions are business decisions with technical implications. When an engineering team recommends "we should use microservices" or "we need to migrate to a new database," what they are really saying is: "we believe this approach scores highest on the criteria that matter to the business." The decision matrix gives you — the stakeholder, PM, or business leader — the tool to verify that claim objectively.

## How to Read Engineering Proposals Through the Decision Matrix Lens

When engineers present architecture options, translate their language into decision matrix components:

| What the engineer says | What it maps to in your matrix |
|---|---|
| "This architecture is more scalable" | A **criterion** (Growth Ceiling) — but what is the *measure*? Ask: "At what user count or transaction volume does each option hit its ceiling?" |
| "We should use Kubernetes" | A **feature**, not a criterion. Ask: "Why? What business outcome does it improve?" The answer becomes your real criterion (e.g., Release Agility, Reliability) |
| "Option B has better latency" | A **score** on one criterion — but what about the other 7 criteria? One strong score does not win the matrix |
| "We need 99.99% uptime" | Possibly a **requirement** (binary — must have it or the option is eliminated) or a **criterion** (scored on a scale of uptime levels). Clarify which |
| "This will cost more but it's worth it" | A **weight** argument — the engineer is implicitly saying other criteria should outweigh Cost. Make them prove it with the matrix |

## Business Questions and Where to Find the Technical Answers

Each row below maps a business question to the system design knowledge base file that explains the engineering concepts behind it. You do not need to become an expert — but reading the linked KB gives you enough context to ask informed questions and set meaningful measurement scales.

| Business Question | Decision Matrix Criterion | What the KB Explains | KB Reference |
|---|---|---|---|
| "How fast will the site load for customers?" | Customer Page Load Speed | How caching, CDNs, and edge computing reduce load times; what causes slowness | [Caching KB](caching-system-design-kb.md), [CDN & Networking KB](cdn-networking-kb.md) |
| "How often will the system go down?" | Reliability (Uptime) | Circuit breakers, retries, failover — the patterns that keep systems running when parts fail | [Resiliency Patterns KB](resilliency-patterns-kb.md) |
| "How will we know when something breaks?" | Observability | Metrics, logs, alerts — how teams detect and diagnose problems before customers notice | [Observability KB](observability-kb.md) |
| "Can it handle a traffic spike (Black Friday, viral moment)?" | Peak Traffic Capacity | Load balancing, horizontal scaling, auto-scaling — how systems absorb sudden demand | [Load Balancing KB](load-balancing-kb.md) |
| "Will we lose orders if the system is overloaded?" | Data Integrity Under Load | Message queues, delivery guarantees — how systems ensure no transaction is dropped | [Message Queues KB](message-queues-kb.md) |
| "What happens if one part of the system fails?" | Fault Isolation | Bulkheads, graceful degradation — how well-designed systems contain failures | [Resiliency Patterns KB](resilliency-patterns-kb.md) |
| "How hard will it be to update and maintain?" | Ongoing Maintenance Effort | Coupling, tech debt, API versioning — what makes systems easy or painful to change | [Maintainability KB](maintainability-kb.md) |
| "How fast can we ship new features after launch?" | Release Agility | CI/CD pipelines, deployment strategies, feature flags — how teams release safely and frequently | [Deployment & CI/CD KB](deployment-release-cicd-kb.md) |
| "At what point do we outgrow this?" | Growth Ceiling (Scalability) | Database sharding, partitioning, consistency trade-offs — what determines a system's upper limit | [Data Model KB](data-model-kb.md), [CAP Theorem KB](cap_theorem.md) |
| "What is our security risk?" | Risk Exposure | Authentication, authorization, encryption — how systems protect data and prevent breaches | [System Architecture KB](software_architecture_system.md) |
| "Can it talk to our other systems?" | Integration Capability | REST, GraphQL, gRPC, API gateways — how systems communicate with each other | [API Design KB](api-design-sys-design-kb.md) |
| "Can we run background jobs without slowing the site?" | Background Processing | Multithreading, async processing, job queues — how systems handle work without blocking users | [Multithreading vs Multiprocessing KB](Multithreading-vs-Multiprocessing.md) |

## Quick-Start: Building a Software Decision Matrix in 30 Minutes

If you need to evaluate a software architecture decision right now, here is the minimum viable process:

### 1. Define the decision (2 minutes)

State it as: **"We are choosing between [Option A], [Option B], and [Option C] for [business goal]."**

Example: "We are choosing between a commercial platform, a custom build, and an open-source hybrid for our new e-commerce storefront."

### 2. Pick 6-8 criteria from the table above (5 minutes)

Select the business questions that matter most for your situation. Not every question applies to every decision. For an e-commerce platform, you might pick:

- Customer Page Load Speed
- Reliability (Uptime)
- Total Cost over 3 Years
- Peak Traffic Capacity
- Launch Speed
- Growth Ceiling
- Ongoing Maintenance Effort
- Risk Exposure

### 3. Set one measurement scale per criterion (10 minutes)

For each criterion, define what a score of 1, 3, and 5 looks like. Use the linked KB files to inform your scale anchors. Example:

| Score | Peak Traffic Capacity |
|---|---|
| 5 | Handles 10x current peak with no degradation (auto-scales) |
| 3 | Handles 3x current peak with acceptable slowdown |
| 1 | Cannot handle more than current peak without crashing |

### 4. Score, normalize, weight, interpret (13 minutes)

Follow Steps 9-13 exactly as taught in this module. The math is the same regardless of domain.

## Common Pitfalls Specific to Software Decisions

| Pitfall | Why It Happens | How to Avoid |
|---|---|---|
| Letting the engineering team pick criteria AND score them | Same people defining the rules and grading the test | Stakeholders define criteria and weights; engineers provide scores with evidence |
| Treating vendor marketing as score evidence | "AWS guarantees 99.99% uptime" is a promise, not a measurement | Use third-party monitoring data or contractual SLA penalties as evidence instead — see [Observability KB](observability-kb.md) |
| Ignoring maintenance cost because it is hard to estimate | Maintenance is often 60-80% of total software cost but is invisible at decision time | Use the early indicators from Step 07 (dependency count, community size, developer availability) as proxies |
| Confusing "modern" with "better" | A newer technology is not automatically a higher score on any criterion | Score each option against each criterion independently. "Uses the latest framework" is a feature, not a criterion |
| Skipping the matrix for "obvious" decisions | "Everyone knows we should use [X]" bypasses the objectivity the matrix provides | If the decision is truly obvious, the matrix will confirm it in 30 minutes. If it does not, the decision was not obvious |

## When to Use the Decision Matrix vs. QFD for Software

| Situation | Use |
|---|---|
| Choosing between architecture approaches (monolith vs microservices vs serverless) | **Decision Matrix** |
| Selecting a vendor, platform, or managed service | **Decision Matrix** |
| Evaluating build vs buy vs hybrid | **Decision Matrix** |
| Setting specific engineering targets after selecting an approach (e.g., "what latency target should we aim for?") | **QFD** — see [From Decision Matrix to QFD](17%20-%20From%20Decision%20Matrix%20to%20QFD.md) |
| Understanding trade-offs between design parameters (e.g., "if we optimize for speed, what suffers?") | **QFD** |

---

**← Previous:** [17 — From Decision Matrix to QFD](17%20-%20From%20Decision%20Matrix%20to%20QFD.md) | **Back to** [00 — Module Overview](00%20-%20Module%20Overview.md)
