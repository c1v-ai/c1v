# Phase 2: Thinking Functionally

> Corresponds to the "Describing Your System Functionally" and "Writing Good Requirements" lessons of CESYS522.

## Knowledge

This phase produces **no file**. It is a **calibration phase** — you internalize the functional-description discipline before writing a single system statement. Skipping this phase guarantees structural requirements leak into your UCBDs and Phase 7's audit will bounce your work back.

### The core discipline (Professor Schneider, quoted)

> "When we say a car is going to drive, you could say that's something a car does. Well, it's actually meaning the function of providing transportation. So you don't say 'a car drives,' you say 'a car performs a transportation function.' Similarly, a refrigerator doesn't cool food, it maintains an environment that prevents food spoilage. That's the function it provides."

### Why this matters

Functional description **opens the solution space**. Structural description **closes it prematurely**.

- "The system shall use a PostgreSQL database" → forbids Dynamo, SQLite, S3-as-DB, etc. — even if one of them better fits the problem.
- "The system shall persist order records durably for 7 years" → any solution meeting the behavior is valid.

The second form lets your team's talent find the best solution. The first form makes you the bottleneck — you've pre-decided for everyone.

### The Test

For every system statement, ask:

1. **Is a specific component / technology / method named?** If yes → structural.
2. **Would swapping the implementation change the truth of the statement?** If yes → structural.
3. **Does the statement describe observable behavior with a pass/fail test?** If yes → functional.

### Translation Examples (memorize the pattern)

| Structural (wrong) | Functional (right) |
|--------------------|---------------------|
| The system shall use OAuth 2.0 for login. | The system shall verify the customer's identity using a cryptographically-signed token before granting session access. |
| The system shall send confirmation via SendGrid. | The system shall deliver an order-confirmation message to the customer's registered contact within `CONFIRMATION_DELIVERY_SLA`. |
| The system shall use a PostgreSQL database. | The system shall persist order records and retrieve any order by its identifier within `LOOKUP_BUDGET_MS`. |
| The system shall cache product images in a CDN. | The system shall serve product images such that 95% of requests complete within `IMAGE_LATENCY_P95_MS`. |
| The system shall run on AWS. | *(Keep as structural ONLY if it flowed down from Module 1 as a hard constraint — otherwise rewrite.)* |
| The system shall have a React frontend. | The system shall present the checkout flow on a browser-rendered interface without page reload between steps. |
| The system shall use Redis for sessions. | The system shall preserve customer session state for `SESSION_TTL_MIN` across browser tab changes. |
| The system shall retry failed API calls 3 times. | The system shall re-attempt a failed payment authorization up to `MAX_PAYMENT_RETRIES` times before surfacing the failure to the customer. |

### When structural language is OK

Only when it flowed down from Module 1 as a **hard constraint** in `system_context_summary.hard_constraints`. Example: if Module 1 says "must deploy on AWS" (business reason: existing contract), then "The system shall deploy on AWS" is a valid requirement. It's not *you* making the implementation choice — you're transcribing one.

### The "What function does it provide?" drill

When tempted to write a structural requirement, run this drill:

1. Write the structural version (e.g., "The system shall use OAuth").
2. Ask: "What does OAuth *provide*?" → identity verification.
3. Ask: "Under what conditions?" → before granting access to protected resources.
4. Ask: "How is it verifiable?" → a test can attempt unauthenticated access and confirm refusal.
5. Rewrite: "The system shall verify the customer's identity before granting access to [resources]."

## Software-system translation notes

For software systems, the drill is especially tricky because **libraries, frameworks, and protocols are often baked into the engineering conversation**. Watch for these common structural slips and know the functional rewrite pattern:

| Structural trap | Functional pattern | Consult |
|-----------------|---------------------|---------|
| Names a specific protocol (REST, gRPC, WebSocket) | Describe the *interaction semantics*: sync/async, request/response, streaming | `api-design-sys-design-kb.md` |
| Names a specific DB (Postgres, Dynamo) | Describe durability, query latency, consistency needs | `data-model-kb.md`, `cap_theorem.md` |
| Names a specific queue (SQS, Kafka, RabbitMQ) | Describe delivery guarantees, ordering, retry behavior | `message-queues-kb.md` |
| Names a specific cache (Redis, Memcached) | Describe latency budget, staleness tolerance, eviction behavior | `caching-system-design-kb.md` |
| Names a specific auth provider (Auth0, Cognito) | Describe identity-verification behavior | `api-design-sys-design-kb.md` |
| Names a specific CDN (CloudFront, Cloudflare) | Describe geographic latency, static-asset serving | `cdn-networking-kb.md` |
| Names a specific monitoring stack (Datadog, NewRelic) | Describe what must be observable and alertable | `observability-kb.md` |
| Names a specific retry library | Describe retry semantics, backoff shape, circuit-break conditions | `resilliency-patterns-kb.md` |

## Instructions for the LLM

No JSON output. You must:

1. Read the translation examples above twice.
2. Mentally rehearse: for any system action, your default phrasing is `The system shall [verb] [object] [condition/quantifier]`.
3. Confirm to the user: "I have internalized the functional-vs-structural discipline. I will not write implementation choices into requirements unless they flow down from Module 1 hard constraints, in which case I will cite the specific Module 1 line."

## STOP GAP — Checkpoint 1

Ask the user:

1. "Here are the hard constraints from Module 1 that I will treat as structural-but-allowed: **[list from `hard_constraints`]**. Confirm this list is complete."
2. "Everything not on this list will be written functionally. Confirm."
3. "Proceed to Phase 3 (UCBD Setup)?"

> **STOP:** Do not proceed until user confirms. This phase's value is *the user's acknowledgement* — you're preventing them from being surprised later when you rewrite their structural phrasings.

## Output Artifact

None. This is a knowledge-phase checkpoint.

## Handoff to Next Phase

Phase 3 starts the per-UCBD loop. You will build one UCBD at a time for each use case selected in Phase 1.

---

**Next →** [Phase 3: UCBD Setup](06-Phase-3-UCBD-Setup.md) | **Back:** [Phase 1](04-Phase-1-Prioritize-Use-Cases.md)
