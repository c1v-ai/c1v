# Maintainability — Designing Systems That Stay Healthy Over Time

## Context (Why This Matters)

Most of a system's lifetime cost is not building it — it's **maintaining** it. Reading code, understanding it, modifying it safely, onboarding new engineers, and evolving the architecture as requirements change. A system that is easy to build but hard to change becomes increasingly expensive over time until changes take weeks instead of hours and every deployment is a risk.

Maintainability is the property that determines **how cheaply and safely a system can be changed** after it's built. It is not a feature you ship — it is a quality you protect through every design decision.

Three dimensions of maintainability:

| Dimension | Question It Answers | Example |
|-----------|-------------------|---------|
| **Operability** | How easy is it to keep the system running? | Clear runbooks, good monitoring, automated recovery |
| **Simplicity** | How easy is it to understand the system? | Small modules, clear naming, minimal accidental complexity |
| **Evolvability** | How easy is it to change the system? | Loose coupling, clean interfaces, good test coverage |

---

## Code Organization

### Monorepo vs Polyrepo

| Approach | Structure | Pros | Cons |
|----------|----------|------|------|
| **Monorepo** | All services/packages in one repository | Atomic cross-service changes, shared tooling, unified CI | Requires sophisticated build tooling (Turborepo, Nx, Bazel), repo can grow very large |
| **Polyrepo** | Each service in its own repository | Clear ownership boundaries, independent deploy cycles | Cross-service changes require coordinating PRs across repos, dependency versioning headaches |

**Decision rule:** Start with a monorepo. Split into polyrepos only when team independence outweighs coordination cost (typically 50+ engineers or strongly independent product lines).

### Module Boundaries and Dependency Direction

Well-organized code has clear boundaries between modules, with dependencies flowing in one direction:

```
Presentation Layer (UI, API routes)
    ↓ depends on
Business Logic Layer (domain rules, use cases)
    ↓ depends on
Data Access Layer (database queries, external API clients)
    ↓ depends on
Infrastructure (database drivers, HTTP clients, message queues)
```

**Rules:**
- **Dependencies flow downward.** The business logic layer never imports from the presentation layer.
- **Each layer depends on abstractions, not implementations.** The business logic calls `saveOrder(order)`, not `postgres.query("INSERT INTO orders...")`.
- **Circular dependencies are a design smell.** If A depends on B and B depends on A, they should be the same module or a third module should be extracted.

---

## Coupling vs Cohesion

The two most important structural properties of maintainable code:

| Property | Definition | Goal |
|----------|-----------|------|
| **Coupling** | How much one module depends on the internal details of another | **Low coupling** — changing one module should not require changing others |
| **Cohesion** | How related the responsibilities within a single module are | **High cohesion** — each module does one thing well |

### Signs of High Coupling (Problems)

- Changing a database column requires modifying 15 files across 4 services
- A bug fix in the payment service requires redeploying the notification service
- Two teams can't work on their features without merge conflicts in shared code
- "Shotgun surgery" — every change requires small edits in many places

### Signs of Low Cohesion (Problems)

- A single service handles user authentication, email sending, and report generation
- A "utils" module with 50 unrelated functions
- A class with 2000 lines that mixes business rules, database queries, and HTTP handling

### How to Improve

| Problem | Solution |
|---------|---------|
| High coupling between services | Define clear API contracts. Services communicate only through their public API, never by sharing databases or internal data structures. |
| High coupling within a service | Use dependency injection. Depend on interfaces, not concrete implementations. |
| Low cohesion | Split large modules by responsibility. Each module should be describable in one sentence without the word "and." |

---

## Service Architecture: Monolith vs Microservices

### The Decision Spectrum

```
Monolith ← Modular Monolith ← Microservices
(simplest)                      (most complex)
```

| Architecture | What It Is | Best For |
|-------------|-----------|----------|
| **Monolith** | Single deployable unit, all code in one process | Small teams (< 10 engineers), early-stage products, simple domains |
| **Modular monolith** | Single deployable unit, but internally organized into well-defined modules with clear boundaries | Medium teams, growing products that need structure but not distributed complexity |
| **Microservices** | Each service is independently deployable, with its own database and API | Large organizations with many autonomous teams, high-scale systems requiring independent scaling |

### The Distributed Monolith Anti-Pattern

The worst outcome: you have the operational complexity of microservices (network calls, distributed tracing, deployment coordination) but the coupling of a monolith (services can't be deployed independently, shared databases, synchronized releases).

**How to avoid it:**
- Each service owns its own data — no shared databases
- Services communicate only through well-defined APIs or events
- Each service can be deployed independently without coordinating with others
- If two services must always be deployed together, they should be one service

### When to Split a Monolith

Split when you have a **clear reason**, not as a default:
- Different parts of the system need to **scale independently** (image processing needs GPUs, API server does not)
- Different teams need to **deploy independently** (team A ships daily, team B ships weekly)
- A module has **fundamentally different reliability requirements** (payment must be 99.99%, recommendations can be 99%)
- The monolith's **build/test time** is so slow it blocks development

**The Strangler Fig Pattern:** Incrementally extract services from a monolith by routing new traffic to the new service while keeping the old code for existing traffic. Over time, the old code is "strangled" and removed.

---

## Technical Debt

Technical debt is the gap between how the code *is* and how it *should be* — shortcuts taken for speed that make future changes more expensive.

### Types of Technical Debt

| Type | Example | Intentional? |
|------|---------|-------------|
| **Deliberate, prudent** | "We'll ship with a simple algorithm now and optimize later — we know the trade-off" | Yes — a conscious, documented decision |
| **Deliberate, reckless** | "We don't have time for tests" | Yes — but irresponsible |
| **Accidental, prudent** | "Now that we've built it, we realize a better approach" | No — learned through experience |
| **Accidental, reckless** | "What's a design pattern?" | No — lack of knowledge |

### Managing Technical Debt

- **Make it visible.** Track tech debt items alongside feature work. If it's not tracked, it doesn't get fixed.
- **Pay it down incrementally.** Dedicate ~20% of engineering capacity to debt reduction — don't batch it into a "refactoring sprint" that never happens.
- **Pay interest before principal.** Fix the debt that causes the most pain first — the module everyone is afraid to touch, the test suite that takes 45 minutes, the deploy that fails 30% of the time.
- **Document deliberate debt.** When you take a shortcut, leave a comment or ADR explaining the trade-off and the conditions under which it should be revisited.

---

## API Evolution and Backward Compatibility

As systems evolve, APIs must change without breaking existing consumers.

### Versioning Strategies

| Strategy | Example | Trade-Off |
|----------|---------|-----------|
| **URL versioning** | `/api/v1/events`, `/api/v2/events` | Simple and explicit. Multiple versions to maintain. |
| **Header versioning** | `Accept: application/vnd.api.v2+json` | Cleaner URLs. Less discoverable. |
| **Query param versioning** | `/api/events?version=2` | Easy to implement. Feels hacky. |

### Backward Compatibility Rules

- **Adding** a new field to an API response is backward-compatible (old clients ignore it)
- **Removing** a field is a breaking change (old clients may depend on it)
- **Changing** a field's type or meaning is a breaking change
- **Adding** an optional parameter is backward-compatible
- **Making** an optional parameter required is a breaking change

### Deprecation Process

1. Mark the old endpoint/field as deprecated (documentation + response headers)
2. Publish the new version alongside the old
3. Give consumers a migration timeline (e.g., 6 months)
4. Monitor usage of the deprecated endpoint
5. Remove only when usage drops to zero (or the deadline passes)

---

## Architecture Decision Records (ADRs)

An ADR is a short document that captures **why** a significant technical decision was made. Code tells you *what* the system does. ADRs tell you *why* it does it that way.

### ADR Format

```markdown
# ADR-001: Use PostgreSQL as primary database

## Status: Accepted

## Context
We need to choose a primary database for the order management system.
We have 3 services that need transactional consistency and complex joins.

## Decision
Use PostgreSQL for all three services.

## Consequences
- Strong consistency and referential integrity out of the box
- Team has deep PostgreSQL expertise
- Must handle sharding ourselves if we exceed single-node capacity
- Rules out document-level schema flexibility

## Alternatives Considered
- MongoDB: More flexible schema, but we need joins and transactions
- DynamoDB: Auto-scaling, but vendor lock-in and limited query patterns
```

**When to write an ADR:**
- Choosing a database, framework, or major library
- Deciding between monolith and microservices
- Changing the deployment strategy
- Any decision that a new team member would ask "why did we do it this way?"

---

## Refactoring Discipline

### Refactor vs Rewrite

| Approach | When to Use |
|----------|------------|
| **Refactor** (incremental improvement) | The existing code works and has value. The structure needs improvement. Most of the time, this is the right call. |
| **Rewrite** (start from scratch) | The existing code is fundamentally broken — wrong language, wrong architecture, no tests, no one understands it. This is almost always more expensive than expected. |

**Joel Spolsky's rule:** "The single worst strategic mistake that any software company can make is to rewrite the code from scratch." Rewrites lose all the accumulated bug fixes, edge case handling, and institutional knowledge embedded in the old code.

### The Boy Scout Rule

"Leave the code better than you found it." Every time you touch a file, make one small improvement — rename a confusing variable, extract a helper, add a missing test. Over time, the codebase improves without dedicated refactoring sprints.

### When NOT to Refactor

- Right before a critical deadline or release
- Code that is stable, rarely changed, and well-tested (working code you don't touch doesn't need refactoring)
- Without tests — refactoring untested code is gambling

---

## Operability

Maintainability isn't just about code — it's about how easy the system is to **operate** in production.

| Practice | What It Does |
|----------|-------------|
| **Runbooks** | Step-by-step instructions for common operational tasks (restart service, investigate alert, roll back deploy) |
| **On-call rotation** | Clear ownership of who responds to production issues |
| **Automated recovery** | Self-healing: auto-restart crashed processes, auto-scale under load, auto-rollback failed deploys |
| **Chaos engineering** | Deliberately inject failures (Netflix Chaos Monkey) to verify resilience before real outages |
| **Post-mortems** | Blameless analysis after incidents — what happened, why, and what systemic changes prevent recurrence |

---

## Decision Framework

When evaluating maintainability:

1. **Organize code with clear module boundaries.** Dependencies flow in one direction. No circular dependencies.
2. **Aim for low coupling, high cohesion.** Each module does one thing and communicates through a clean interface.
3. **Start with a monolith** (or modular monolith). Split only when you have a concrete reason.
4. **Track and pay down tech debt incrementally.** ~20% of capacity, targeting the highest-pain areas first.
5. **Design APIs for evolution.** Adding is safe, removing is breaking. Version and deprecate gracefully.
6. **Write ADRs for significant decisions.** Future engineers (including yourself in 6 months) will thank you.
7. **Refactor incrementally.** Boy Scout Rule. Never rewrite unless the old code is truly unsalvageable.
8. **Invest in operability.** Runbooks, automated recovery, post-mortems. The best code is worthless if you can't keep it running.

## Validation Checklist

- [ ] I can define the three dimensions of maintainability (operability, simplicity, evolvability).
- [ ] I can explain coupling vs cohesion and identify signs of each being wrong.
- [ ] I can describe the monolith → modular monolith → microservices spectrum and know when to move along it.
- [ ] I can explain the distributed monolith anti-pattern and how to avoid it.
- [ ] I can describe the strangler fig pattern for incremental service extraction.
- [ ] I can classify technical debt (deliberate/accidental, prudent/reckless) and describe a strategy for managing it.
- [ ] I can explain API versioning strategies and backward compatibility rules.
- [ ] I can write an Architecture Decision Record and know when one is warranted.
- [ ] I can distinguish refactoring from rewriting and know when each is appropriate.
- [ ] I can describe operability practices (runbooks, post-mortems, chaos engineering, automated recovery).
