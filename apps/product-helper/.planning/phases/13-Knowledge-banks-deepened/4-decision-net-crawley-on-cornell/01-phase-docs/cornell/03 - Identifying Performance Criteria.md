# 03 — Identifying Performance Criteria

## Prerequisites

- [ ] Step 01 complete — you understand what a decision matrix is and why objectivity matters.
- [ ] Step 02 complete — you can define criterion, metric, rubric, weight, and related terms.

## Context (Why This Matters)

The criteria you select become the rows of your decision matrix — they define *what you are measuring*. Choose the wrong criteria and your entire evaluation is compromised: you may optimize for things the customer does not care about, or miss dimensions that matter deeply. Getting criteria right is foundational; everything downstream (metrics, scores, weights) builds on this list.

Criteria must also be **solution-independent** so they can evaluate any potential option fairly. If your criteria only make sense for one candidate, you have already biased the outcome before scoring begins.

## Instructions

1. **Start with the customer.** Identify whoever has the need you are trying to solve — a buyer, another team, a piece of equipment with a defined requirement. Review Requests for Proposals, surveys, user research, or other data that captures what the customer values.

2. **Brainstorm criteria from the customer's perspective.** Ask: *"What qualities would make a solution excellent versus merely acceptable?"* Write down every criterion that comes to mind.

3. **Ensure every criterion is solution-independent.** For each criterion, ask: *"Could I use this to evaluate a completely different type of solution?"* If the answer is no, rephrase it until it applies to any candidate. Your customer is likely considering other solutions too — your criteria must let you compare honestly across all possibilities.

4. **Mine additional sources for criteria:**
   - **Use cases** — What would make a solution meet a use case *well* versus *really well*?
   - **Brainstorming around your current solution idea** — This can surface criteria like "user effort" or "portability," but always phrase them generally enough to apply to any solution.

5. **Compile your initial criteria list.** Do not filter or prioritize yet — that comes later. Capture everything.

## Worked Example

Your company needs a new e-commerce platform. You are evaluating three architecture approaches:
- **Option A** — Commercial platform (Shopify Plus, ~$2K/month)
- **Option B** — Custom build in-house (~$500K over 6 months)
- **Option C** — Open-source platform with contractor customization (~$200K)

Brainstorm criteria from the business stakeholders' perspective (the "customer"):

| Criterion | Why It Works (Solution-Independent) | Learn More |
|---|---|---|
| Customer Page Load Speed | Applies to any platform — how fast do shoppers see products? | [Caching KB](caching-system-design-kb.md), [CDN & Networking KB](cdn-networking-kb.md) |
| Reliability (Uptime) | Applies to any platform — how often is the store down and losing revenue? | [Resiliency Patterns KB](resilliency-patterns-kb.md), [Observability KB](observability-kb.md) |
| Peak Traffic Capacity | Applies to any platform — can it handle Black Friday? | [Load Balancing KB](load-balancing-kb.md), [Message Queues KB](message-queues-kb.md) |
| Total Cost over 3 Years | Applies to any option — dev, hosting, licensing, maintenance combined | [System Architecture KB](software_architecture_system.md) |
| Launch Speed (Time-to-Market) | Applies to any approach — how soon can we start selling? | [Deployment & CI/CD KB](deployment-release-cicd-kb.md) |
| Ongoing Maintenance Effort | Applies to any platform — how much engineering time does it consume after launch? | [Maintainability KB](maintainability-kb.md) |
| Growth Ceiling (Scalability) | Applies to any platform — at what revenue point do we outgrow this and need to rebuild? | [Data Model KB](data-model-kb.md), [CAP Theorem KB](cap_theorem.md) |
| Risk Exposure (Security) | Applies to any platform — what is our liability if there is a breach? | [System Architecture KB](software_architecture_system.md) |

Notice these criteria work whether evaluating a fully managed commercial platform (Option A), a custom codebase (Option B), or an open-source hybrid (Option C). "Has a REST API" would be too solution-specific — that is a feature of one approach, not a criterion that measures how well any approach serves customers.

## Validation Checklist (STOP-GAP)

- [ ] I have a brainstormed list of at least 5-8 criteria derived from the customer's needs.
- [ ] Every criterion on my list is solution-independent — it can evaluate any candidate, not just one.
- [ ] I have drawn criteria from multiple sources (customer needs, use cases, brainstorming around solutions).
- [ ] I have not yet filtered or prioritized — the full list is captured for later refinement.

**STOP: Do not proceed to Step 04 until every box above is checked.**

## Output Artifact

An initial, unfiltered list of solution-independent performance criteria for the decision matrix.

## Handoff to Next Step

Step 04 covers common pitfalls — specifically, confusing features with criteria and confusing binary requirements with performance criteria.

---

**← Previous:** [02 — Talking the Talk](02%20-%20Talking%20the%20Talk%20-%20Key%20Terminology.md) | **Next →** [04 — Avoiding Performance Criteria Pitfalls](04%20-%20Avoiding%20Performance%20Criteria%20Pitfalls.md)
