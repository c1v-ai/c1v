# Reference: Sample FMEA and Rating Templates

This file contains a worked example and reusable templates. The LLM should reference this when generating FMEA content to ensure format and quality consistency.

## Canonical Sample (Course-Provided)

**`FMEA-sample.json`** is the authoritative CESYS527 IR Sensor Encoder sample with full rating scales, 7 cause rows across 3 failure modes, two rounds of corrective actions, and three stoplight charts. Load it first for format/rating calibration.

The E-Commerce Platform example below is a **software-domain companion** to the course canonical sample — same pattern, different system, to demonstrate how the same framework applies to services, caches, message queues, and deploy pipelines rather than sensors and cables.

---

## Worked Example: E-Commerce Platform (Open-Source Hybrid)

**System context:** An open-source e-commerce platform (selected as Option C from the Module 4 Decision Matrix) composed of 6 services — Storefront, Search, Cart, Order, Payment, and Notification — with external integrations to Stripe, SendGrid, and shared infrastructure (PostgreSQL, RabbitMQ/SQS, CloudFront, Datadog). The Module 5 QFD set design targets including 200ms server response time, 92% CDN cache hit rate, 99.5%+ uptime, and 2 deploys/week. The Module 6 Interface Matrix specifies ~40 API endpoints across these services.

This sample shows failure modes across multiple subsystems to demonstrate the breadth of risks in a software system. Failures can originate from any layer — caching, load balancing, APIs, databases, message queues, deployment processes, third-party dependencies, and the interfaces between them.

### FMEA Table (Before Corrective Actions)

| F.# | Subsystem | Failure Mode | Failure Effects | Possible Cause | Sev | Lik | RPN | Risk Criticality |
|---|---|---|---|---|---|---|---|---|
| F.1 | Payment Service | Failed to process payment | Customer charged but order not confirmed, manual refund required, customer support escalation, trust loss, potential chargeback fees | Stripe API timeout exceeds 500ms threshold with no retry logic — see [Resiliency Patterns KB](resilliency-patterns-kb.md) | 4 | 4 | 16 | HIGH |
| F.1 | Payment Service | Failed to process payment | (same as above) | Network partition between Payment Service and Stripe during cloud provider incident | 4 | 2 | 8 | MEDIUM |
| F.1 | Payment Service | Failed to process payment | (same as above) | Developer deploys Payment Service update that breaks Stripe SDK integration (missing API key rotation) | 4 | 3 | 12 | MEDIUM HIGH |
| F.2 | Payment Service | Customer charged twice for same order | Double revenue collection, mandatory refund, chargeback risk, regulatory scrutiny, severe trust damage | Order Service retries checkout request after timeout, Payment Service lacks idempotency key — see [API Design KB](api-design-sys-design-kb.md) | 4 | 3 | 12 | MEDIUM HIGH |
| F.3 | Search Service | Search results not returned within 500ms | Customers see spinner or timeout, abandon search, reduced conversion rate, revenue loss proportional to traffic volume | Database query latency spike due to missing index on product catalog table — see [Data Model KB](data-model-kb.md) | 3 | 4 | 12 | MEDIUM HIGH |
| F.3 | Search Service | Search results not returned within 500ms | (same as above) | Search index not rebuilt after bulk product catalog update (stale index) | 3 | 3 | 9 | MEDIUM |
| F.4 | Storefront Service | CDN serves stale or incorrect content | Customers see wrong prices, out-of-stock items appear available, cart totals mismatch at checkout | CDN cache invalidation fails after price update — cache TTL too long, no purge mechanism configured — see [Caching KB](caching-system-design-kb.md) | 3 | 3 | 9 | MEDIUM |
| F.5 | Order Service | Incorrect order total calculated | Customer overcharged or undercharged, accounting discrepancy, potential legal liability | Tax calculation API returns outdated rates; no validation against expected ranges — see [API Design KB](api-design-sys-design-kb.md) | 3 | 2 | 6 | MEDIUM |
| F.6 | All Services | Platform unresponsive during traffic spike | All customers unable to browse, search, or purchase; complete revenue loss during outage; SLA violation | Auto-scaling threshold set too high — services cannot spin up fast enough to absorb Black Friday traffic — see [Load Balancing KB](load-balancing-kb.md) | 4 | 3 | 12 | MEDIUM HIGH |
| F.6 | All Services | Platform unresponsive during traffic spike | (same as above) | Database connection pool exhausted under load — see [Data Model KB](data-model-kb.md) | 4 | 3 | 12 | MEDIUM HIGH |
| F.7 | Notification Service | Order confirmation email not sent | Customer uncertain if order was placed, calls support, duplicate orders placed, support cost increase | RabbitMQ/SQS queue backlog exceeds processing capacity — see [Message Queues KB](message-queues-kb.md) | 2 | 3 | 6 | MEDIUM |
| F.7 | Notification Service | Order confirmation email not sent | (same as above) | SendGrid API rate limit exceeded during peak traffic | 2 | 2 | 4 | MEDIUM LOW |
| F.8 | All Services | Deployment introduces regression | Previously working feature breaks, rollback required, developer time lost, potential customer-facing impact | Insufficient test coverage (below 85% target) — untested code path deployed to production — see [Deployment & CI/CD KB](deployment-release-cicd-kb.md) | 3 | 3 | 9 | MEDIUM |
| F.9 | Cart Service | Cart state lost mid-session | Customer must re-add all items, frustration, potential abandonment | Session storage (Redis) evicts cart data due to memory pressure under high traffic — see [Caching KB](caching-system-design-kb.md) | 2 | 3 | 6 | MEDIUM |
| F.10 | All Services | Undetected performance degradation | Gradual latency increase goes unnoticed until customers complain, delayed response costs more to fix | Monitoring alerts misconfigured — threshold too generous or alert fatigue causes team to ignore — see [Observability KB](observability-kb.md) | 3 | 3 | 9 | MEDIUM |

### FMEA Table (After Corrective Actions)

| F.# | Possible Cause | Corrective Action | Adj. Sev | Adj. Lik | Adj. RPN | Adj. Crit | Effort |
|---|---|---|---|---|---|---|---|
| F.1 | Stripe API timeout with no retry logic | Implement retry with exponential backoff and circuit breaker pattern. Add Stripe webhook listener as fallback confirmation. Set 3-second timeout with 2 retries. See [Resiliency Patterns KB](resilliency-patterns-kb.md) | 4 | 1 | 4 | MEDIUM LOW | 16 hrs (backend + testing) |
| F.1 | Network partition during cloud incident | Deploy Payment Service across 2 availability zones. Implement health-check-based failover. Add fallback payment queue for retry when connectivity restores | 4 | 1 | 4 | MEDIUM LOW | 24 hrs (infra + testing) |
| F.1 | Developer breaks Stripe SDK integration | Add integration test suite that runs against Stripe test mode in CI pipeline. Block deployment if payment integration tests fail. Add API key rotation to deployment checklist. See [Deployment & CI/CD KB](deployment-release-cicd-kb.md) | 4 | 1 | 4 | MEDIUM LOW | 12 hrs (CI setup + tests) |
| F.2 | Missing idempotency key on checkout | Add idempotency key (UUID) to every checkout request. Payment Service checks for duplicate keys before processing. Store processed keys in Redis with 24hr TTL. See [API Design KB](api-design-sys-design-kb.md) | 4 | 1 | 4 | MEDIUM LOW | 8 hrs (backend) |
| F.3 | Missing database index | Add composite index on product catalog (category, price, availability). Set up slow-query monitoring with Datadog alert at >200ms. See [Data Model KB](data-model-kb.md) | 3 | 1 | 3 | MEDIUM LOW | 4 hrs (DBA + monitoring) |
| F.3 | Stale search index after bulk update | Trigger automatic index rebuild on bulk product import. Add index-freshness health check endpoint. Alert if index age >15min | 3 | 1 | 3 | MEDIUM LOW | 8 hrs (backend + ops) |
| F.4 | CDN cache invalidation failure | Implement event-driven cache purge — price update event triggers CloudFront invalidation via SNS. Reduce TTL on price-sensitive pages to 5min. See [Caching KB](caching-system-design-kb.md) and [CDN & Networking KB](cdn-networking-kb.md) | 3 | 1 | 3 | MEDIUM LOW | 12 hrs (infra + testing) |
| F.5 | Outdated tax rates from API | Cache tax rates with 24hr TTL. Add validation: if calculated tax deviates >20% from historical average, flag for manual review before charging. Add tax API health check | 3 | 1 | 3 | MEDIUM LOW | 10 hrs (backend + validation) |
| F.6 | Auto-scaling threshold too high | Lower auto-scaling threshold from 80% CPU to 60%. Add predictive scaling based on traffic patterns (pre-scale before known peaks). Load test quarterly simulating 5x traffic. See [Load Balancing KB](load-balancing-kb.md) | 4 | 1 | 4 | MEDIUM LOW | 20 hrs (infra + load testing) |
| F.6 | Database connection pool exhausted | Increase pool size from 20 to 50. Add connection pooler (PgBouncer). Implement read replicas for search queries. Alert when pool utilization >75%. See [Data Model KB](data-model-kb.md) | 4 | 1 | 4 | MEDIUM LOW | 16 hrs (DBA + infra) |
| F.7 | Queue backlog exceeds capacity | Add auto-scaling to queue consumers. Implement dead-letter queue for failed messages. Alert when queue depth >1000. See [Message Queues KB](message-queues-kb.md) | 2 | 1 | 2 | LOW | 8 hrs (backend + ops) |
| F.7 | SendGrid rate limit exceeded | Implement email sending rate limiter. Add secondary email provider (Mailgun) as failover. Queue emails during rate-limit windows | 2 | 1 | 2 | LOW | 6 hrs (backend) |
| F.8 | Insufficient test coverage | Enforce 85% coverage gate in CI pipeline. Add canary deployment strategy — deploy to 5% of traffic first, auto-rollback on error rate spike. See [Deployment & CI/CD KB](deployment-release-cicd-kb.md) | 3 | 1 | 3 | MEDIUM LOW | 20 hrs (CI + deployment pipeline) |
| F.9 | Redis evicts cart data | Configure Redis with LRU eviction disabled for cart keys. Set cart TTL to 72hrs. Persist cart to PostgreSQL as backup. See [Caching KB](caching-system-design-kb.md) | 2 | 1 | 2 | LOW | 6 hrs (backend) |
| F.10 | Monitoring alerts misconfigured | Implement SLO-based alerting (error budget burn rate). Add synthetic monitoring — automated checkout every 5min. Weekly alert review meeting. See [Observability KB](observability-kb.md) | 3 | 1 | 3 | MEDIUM LOW | 12 hrs (ops + monitoring) |

---

## Template: Severity Rating Scale

Use a scale from 1-3 up to 1-10. Below is a 1-4 example adapted for software systems. Adapt the conditions to match the user's system.

| Rating | Conditions |
|--------|-----------|
| 1 (Negligible) | Revenue impact < $500. Affects < 1% of users. Requires < 4 hours to fix. No SLA violation. No data loss. Internal-only visibility. |
| 2 (Marginal) | Revenue impact < $5,000. Affects 1-10% of users. Requires 1-3 days to fix. Minor SLA warning. No customer data exposed. Some users notice degraded experience. |
| 3 (Critical) | Revenue impact < $50,000. Affects 10-50% of users. Requires 1-2 weeks to fix. SLA violation triggers penalty. Potential for customer data exposure. Public-facing incident requiring status page update. See [Observability KB](observability-kb.md) for incident classification. |
| 4 (Catastrophic) | Revenue impact >= $50,000. Affects > 50% of users or involves financial transactions. Requires > 2 weeks to fix. Major SLA breach. Confirmed data breach or regulatory violation. Requires public disclosure and executive involvement. See [System Architecture KB](software_architecture_system.md) for SLA frameworks. |

**Assignment rule:** Assign the WORST (highest) severity rating that has at least one condition met by the effect/cause.

**Key principle:** Conditions must be non-overlapping and all-inclusive so there is no ambiguity about which score to assign.

---

## Template: Likelihood Rating Scale

Use a scale from 1-3 up to 1-10. Below is a 1-5 example adapted for software systems. "Operational cycle" in software terms means a deployment cycle, a traffic peak period, or a defined time window.

| Rating | Conditions |
|--------|-----------|
| 1 (Remote) | Occurs < 1x per year. Requires multiple simultaneous failures (e.g., cloud region outage + failover failure). No historical precedent in similar systems. |
| 2 (Unlikely) | Occurs 1-4x per year. Requires unusual conditions (e.g., 10x normal traffic + missing index). Has occurred in similar systems but is rare. |
| 3 (Possible) | Occurs monthly or during known stress events (Black Friday, product launches). Has occurred in this system or direct competitors. See [Load Balancing KB](load-balancing-kb.md) for traffic spike patterns. |
| 4 (Likely) | Occurs weekly or with every deployment. Common in systems at this maturity level. Requires active mitigation to prevent. See [Deployment & CI/CD KB](deployment-release-cicd-kb.md). |
| 5 (Frequent) | Occurs daily or near-continuously. Expected behavior without corrective action. The default state for systems lacking basic safeguards. |

---

## Template: RPN Definition Matrix (4 Severity x 5 Likelihood)

|  | Sev 1 | Sev 2 | Sev 3 | Sev 4 |
|---|---|---|---|---|
| **Likelihood 5** | 5 | 10 | 15 | 20 |
| **Likelihood 4** | 4 | 8 | 12 | 16 |
| **Likelihood 3** | 3 | 6 | 9 | 12 |
| **Likelihood 2** | 2 | 4 | 6 | 8 |
| **Likelihood 1** | 1 | 2 | 3 | 4 |

### Criticality Ranges (Example)

| RPN Range | Criticality Category | Color |
|-----------|---------------------|-------|
| 15-20 | HIGH | Red |
| 9-14 | MEDIUM HIGH | Orange |
| 5-8 | MEDIUM | Yellow |
| 3-4 | MEDIUM LOW | Light Green |
| 1-2 | LOW | Green |

---

## Template: Stoplight Chart

A stoplight chart is the RPN matrix above, but each cell contains the COUNT of cause-rows that fall at that Severity/Likelihood intersection. Create one for "before corrective actions" and one for "after corrective actions."

### Example -- Before Corrective Actions (E-Commerce Platform)

|  | Sev 1 | Sev 2 | Sev 3 | Sev 4 |
|---|---|---|---|---|
| **Likelihood 5** | 0 | 0 | 0 | 0 |
| **Likelihood 4** | 0 | 0 | 1 | 1 |
| **Likelihood 3** | 0 | 1 | 4 | 3 |
| **Likelihood 2** | 0 | 1 | 1 | 1 |
| **Likelihood 1** | 0 | 0 | 0 | 0 |

The cluster in the Severity 3-4, Likelihood 3-4 zone reflects a platform that works but lacks resilience — common for open-source systems before hardening.

### Example -- After Corrective Actions (E-Commerce Platform)

|  | Sev 1 | Sev 2 | Sev 3 | Sev 4 |
|---|---|---|---|---|
| **Likelihood 5** | 0 | 0 | 0 | 0 |
| **Likelihood 4** | 0 | 0 | 0 | 0 |
| **Likelihood 3** | 0 | 0 | 0 | 0 |
| **Likelihood 2** | 0 | 0 | 0 | 0 |
| **Likelihood 1** | 0 | 3 | 8 | 5 |

All risks migrate to Likelihood 1. Severity stays the same (the *impact* of double-charging a customer doesn't change — you can only reduce how *often* it happens). This is typical in software: corrective actions primarily reduce likelihood through redundancy, retries, validation, and monitoring. See [Resiliency Patterns KB](resilliency-patterns-kb.md).

Notice how risks shift from upper-right (high risk) to lower-left (low risk) after corrective actions are applied.
