# Module 6: Defining Interfaces

## Purpose

Once you know what your system must do and how its performance will be measured, you need to ensure the subsystems inside your system work well **together**. Interfaces — the points where services exchange data, commands, events, or shared state — are where systems most often fail. This module equips you with a progressive set of techniques to **discover**, **formalize**, and **specify** every interface, culminating in a master Interface Matrix that serves as the single source of truth for cross-service dependencies.

**Worked example throughout this module:** An open-source e-commerce platform (selected as Option C from the Module 4 Decision Matrix) composed of 6 microservices — Storefront, Search, Cart, Order, Payment, and Notification — with external integrations to Stripe, SendGrid, and shared infrastructure (PostgreSQL, RabbitMQ/SQS, CloudFront, Datadog).

## Optional: Bridge from Module 5 (QFD)

If you completed Module 5 (Quality Function Deployment / House of Quality), your QFD outputs directly accelerate interface work:

| QFD Output | How It Feeds Interface Definition |
|------------|-----------------------------------|
| **Engineering Characteristics (ECs)** | ECs like "Number of Services/Modules" (target: 6) and "Number of Exposed API Endpoints" (target: ~40) directly determine your subsystem count and hint at the volume of interfaces to specify |
| **Design Targets** | Targets like "Server Response Time: 200 ms" and "CDN Cache Hit Rate: 92%" become interface performance requirements — every API call and data flow must respect these budgets |
| **Roof Trade-offs** | Correlations identified in the HoQ roof (e.g., adding redundant instances improves reliability but increases deployment complexity) surface as interface constraints — see [Resiliency Patterns KB](resilliency-patterns-kb.md) and [Deployment/CI-CD KB](deployment-release-cicd-kb.md) |
| **Performance Criteria Weights** | Reliability (16.7%), Page Load Speed (16.7%), and Peak Traffic (13.3%) tell you which interfaces need the tightest specifications — payment and order interfaces carry reliability risk; storefront and CDN interfaces carry speed risk |
| **Competitive Benchmarks** | Shopify Plus (managed SaaS) and the rival custom-built platform set the bar your interfaces must meet or exceed |

> **Key insight:** The QFD target of "6 services" and "~40 API endpoints" means you are looking at roughly 15-20 unique service-to-service interfaces plus external integrations. Each service boundary is an interface boundary. The interface work in this module turns those abstract targets into concrete, testable specifications.

## Learning Objectives

In this module, you will:

1. Define your system's **subsystems** and understand their responsibilities.
2. **Brainstorm** interfaces using Data Flow Diagrams (DFDs).
3. **Formalize** interface relationships using N-Squared (N²) Charts.
4. **Discover** interfaces collaboratively using CRC Cards.
5. **Describe** interface interactions over time using Sequence Diagrams.
6. **Specify** every interface detail in an **Interface Matrix** — values, units, owners, dates, and champions.

## The Build-Up Arc

Each technique feeds the next. The Interface Matrix is the **final artifact** — everything else builds toward it:

```
Subsystem Definition (6 services + external actors + shared infrastructure)
    ↓
Data Flow Diagram (brainstorm interfaces — discover WHAT connects)
    ↓
N² Chart (formalize interfaces — WHO sends WHAT to WHOM)
    ↓
CRC Cards (team discovery — tease out interfaces collaboratively)
    ↓
Sequence Diagrams (detail interactions — WHEN and HOW)
    ↓
Interface Matrix (the master specification — VALUES, UNITS, OWNERS, CONSENSUS)
```

The QFD design targets ("6 services," "~40 API endpoints," "200 ms response time") set the scale and performance envelope for this entire arc. By the end, every one of those ~40 endpoints will have a row in the Interface Matrix with agreed-upon values, units, and owners.

## Module Roadmap

### Part 1: Discovering and Defining Interfaces

| Step | Topic | What You'll Do |
|------|-------|----------------|
| 1 | [Why Interfaces Matter](01%20-%20Why%20Interfaces%20Matter.md) | Understand what interfaces are and why they are critical |
| 2 | [Interfaces Are Failure Points](02%20-%20Interfaces%20Are%20Failure%20Points.md) | Learn why systems fail at interfaces and the two-phase approach |
| 3 | [Brainstorming with Data Flow Diagrams](03%20-%20Brainstorming%20with%20Data%20Flow%20Diagrams.md) | Use DFDs to discover operational and design interfaces |
| 4 | [Formalizing with N-Squared Charts](04%20-%20Formalizing%20with%20N-Squared%20Charts.md) | Record interfaces in an organized matrix; identify flows and loops |
| 5 | [CRC Cards for Team Discovery](05%20-%20CRC%20Cards%20for%20Team%20Discovery.md) | Run a collaborative team activity to tease out interfaces |
| 6 | [Sequence Diagrams — Describing Interactions](06%20-%20Sequence%20Diagrams%20-%20Describing%20Interactions.md) | Document the operational flow between subsystems over time |
| 7 | [Advanced Sequence Diagram Notation](07%20-%20Advanced%20Sequence%20Diagram%20Notation.md) | Add logic, self-calls, guards, and interface specifications |

### Part 2: Building the Interface Matrix

| Step | Topic | What You'll Do |
|------|-------|----------------|
| 8 | [Creating the Interface Matrix](08%20-%20Creating%20the%20Interface%20Matrix.md) | Set up the spreadsheet structure and populate interface specifications |
| 9 | [Adding Values and Units](09%20-%20Adding%20Values%20and%20Units.md) | Assign values, units, dates, and status to each specification |
| 10 | [Building Consensus with an Interface Champion](10%20-%20Building%20Consensus%20with%20an%20Interface%20Champion.md) | Establish the Interface Champion role and cross-team sign-off |
| 11 | [Interface Matrix Enhancements](11%20-%20Interface%20Matrix%20Enhancements.md) | Add received-from views, budget tracking, and allocation totals |

## Reference Files

| File | Type | Purpose |
|------|------|---------|
| `Data-flow-diagram.pptx` | PPTX | DFD template (editable) |
| `n-squared-chart.xlsx` | XLSX | N² chart sample/template |
| `sequence-diagram-sample-template.pptx` | PPTX | Sequence diagram template |
| `sequence-diagram.pptx` | PPTX | Sequence diagram sample |
| `interface-Matrix-Template.xlsx` | XLSX | Blank Interface Matrix template |
| `Interface-matrix-sample-basic.xlsx` | XLSX | Basic filled sample |
| `Interface-Matrix-Sample_Advanced.xlsx` | XLSX | Advanced filled sample with budget tracking |
| `Steps-to-Build-Interface-Matrix.pdf` | PDF | Step-by-step matrix checklist (Steps 1-10) |
| `Defining Interfaces - Determine Your Subsystems.docx` | DOCX | Subsystem identification activity |
| `Share Information with Other Subsystem Teams.docx` | DOCX | Cross-team sharing activity |
| `Managing Interface Specifications.docx` | DOCX | Specification management guide |

## Software System Design Knowledge Banks

Consult these KBs when you need deeper engineering guidance on specific interface topics:

| Knowledge Bank | Consult When... |
|----------------|-----------------|
| [API Design KB](api-design-sys-design-kb.md) | Choosing REST vs. gRPC vs. GraphQL vs. WebSocket for an interface; designing request/response schemas |
| [Caching KB](caching-system-design-kb.md) | Specifying cache layers between services; defining TTL, eviction, and invalidation policies |
| [CDN & Networking KB](cdn-networking-kb.md) | Defining the Storefront-to-CDN interface; edge caching rules and origin failover |
| [Data Model KB](data-model-kb.md) | Designing shared database schemas that multiple services read/write; query interface patterns |
| [Load Balancing KB](load-balancing-kb.md) | Specifying how traffic is distributed across service instances; health check interfaces |
| [Message Queues KB](message-queues-kb.md) | Defining async interfaces between services (e.g., Order Service publishing events to Notification Service via RabbitMQ/SQS) |
| [Resiliency Patterns KB](resilliency-patterns-kb.md) | Adding circuit breakers, retries, timeouts, and graceful degradation to interface specs |
| [Deployment/CI-CD KB](deployment-release-cicd-kb.md) | Understanding how deployment strategies affect interface versioning and backward compatibility |
| [Maintainability KB](maintainability-kb.md) | Organizing service boundaries and code structure to keep interfaces clean and evolvable |
| [Observability KB](observability-kb.md) | Adding monitoring, distributed tracing, and alerting to interface specifications |
| [CAP Theorem KB](cap_theorem.md) | Making consistency vs. availability trade-offs at service boundaries |
| [Software Architecture KB](software_architecture_system.md) | Setting SLOs/SLAs/SLIs for interface performance; availability targets |

## Glossary

See the [GLOSSARY](GLOSSARY.md) for definitions of all key terms used across this module.

---

**Next -->** [01 -- Why Interfaces Matter](01%20-%20Why%20Interfaces%20Matter.md)
