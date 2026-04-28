# 09 — Adding Values and Units

## Prerequisites

- [ ] Completed [Step 08 — Creating the Interface Matrix](08%20-%20Creating%20the%20Interface%20Matrix.md).
- [ ] You have a multi-tab matrix with interface specifications and "Provided To" markings.

## Context (Why This Matters)

An interface matrix without values is a table of intentions. Adding concrete values, units, and tracking information transforms it into a living specification that subsystem teams can actually design against. This step also establishes the metadata (who determined the value, when it was last updated, when the final value is due) that prevents the silent drift of assumptions over time.

## Instructions

1. **Add a Value column** between the subsystem columns and the Interface Specifications column. This is where you record the actual number, setting, or reference for each specification.

2. **Add a Units column** immediately next to the Value column. Always separate value and units into distinct columns — this prevents conversion errors (recall the Mars Climate Orbiter).

   > **Units in software systems.** In software systems, "units" include: **ms** (latency), **req/s** (throughput), **KB/MB** (payload size), **%** (availability), **—** (not applicable, for string/enum values like endpoint paths or auth methods). The principle is the same as hardware: **always separate the value from the unit** to prevent misinterpretation. A response time of "500" without "ms" could be mistaken for seconds.

3. **Populate values where known.** Have the subsystem team that owns each specification provide their best current value. For some specifications, the value will be a reference to another document rather than a number:
   - Endpoint request/response schema → "See OpenAPI spec v1.2"
   - Message queue event payload → "See AsyncAPI spec v1.0"
   - Error response catalog → "See Error Catalog, Section 3"
   - Complex authentication flow → "See Auth Spec, OAuth2 + JWT"

   > **References for complex specifications.** For complex specifications, the Value column should contain a pointer to an external document: an OpenAPI/Swagger spec, a Protobuf definition, an AsyncAPI spec for message queues, or an error catalog. The Interface Matrix tracks the reference and its metadata; the external document contains the detail. See [API Design KB](api-design-sys-design-kb.md).

4. **Add tracking columns** to establish accountability and timeline:

   | Column | Purpose |
   |--------|---------|
   | **Determined By** | Name of the person who set this value |
   | **Status** | Whether the value is "Final" or "Working Estimate" |
   | **Last Updated** | Date the value was last changed |
   | **Next Estimate Expected** | Date a better estimate will be available (if currently uncertain) |
   | **Final Value Due** | Date by which this value must be finalized |

5. **Fill in tracking data for every specification.** Even if a value is not yet known, fill in the "Final Value Due" date so that all teams understand the timeline for resolving uncertainties.

## Worked Example

**Scenario (e-commerce platform) — Order Service tab, Checkout API section:**

| Interface Spec | Value | Units | Determined By | Status | Last Updated | Next Est. | Final Due |
|---|---|---|---|---|---|---|---|
| Endpoint path | /api/v1/checkout | — | A. Park | Final | 2026-01-15 | — | — |
| Request body schema | See OpenAPI spec v1.2 | — | A. Park | Final | 2026-02-01 | — | — |
| Response time SLA | 500 | ms | A. Park + J. Lee | Estimate | 2026-02-15 | 2026-03-15 | 2026-04-01 |
| Auth method | Bearer JWT (RS256) | — | Security Team | Final | 2026-01-20 | — | — |
| Rate limit | 100 | req/min/user | A. Park | Estimate | 2026-02-01 | 2026-03-01 | 2026-04-01 |
| Max request body size | 64 | KB | A. Park | Final | 2026-01-15 | — | — |
| Error response format | RFC 7807 Problem Details | — | A. Park | Final | 2026-02-01 | — | — |
| Retry policy | 2 retries, exponential backoff, max 3s | — | A. Park + Infra | Estimate | 2026-02-15 | 2026-03-15 | 2026-04-01 |

**What this reveals:** The endpoint path, auth method, request schema, body size limit, and error format are all finalized — teams can design against these with confidence. The response time SLA is still an estimate at 500ms, with a better number expected by March 15 and a hard deadline of April 1. The rate limit and retry policy are similarly in-progress, indicating that infrastructure and performance testing are still underway. The retry policy value is a compact description rather than a number — complex enough that the full specification lives in an external document, but summarized here for quick reference.

**Checklist reference:** This corresponds to Steps 5–6 of the "Building Your Interface Matrix" checklist.

## Validation Checklist (STOP-GAP)

- [ ] I have added separate Value and Units columns.
- [ ] Values are populated where known; references to external documents are used where appropriate.
- [ ] Every specification has tracking metadata: who, status (final/estimate), dates.
- [ ] "Final Value Due" dates are set even for unknown values, so timelines are clear to all teams.
- [ ] Value and units are always in separate columns (never combined like "12V").

**STOP: Do not proceed to Step 10 until every box above is checked.**

## Output Artifact

An Interface Matrix with values, units, and tracking metadata for each interface specification.

## Handoff to Next Step

Values are in place, but are they *agreed upon*? Step 10 introduces the Interface Champion — the person responsible for mediating trade-offs and signing off on changes to interface values.

---

**← Previous** [08 — Creating the Interface Matrix](08%20-%20Creating%20the%20Interface%20Matrix.md) | **Next →** [10 — Building Consensus with an Interface Champion](10%20-%20Building%20Consensus%20with%20an%20Interface%20Champion.md)
