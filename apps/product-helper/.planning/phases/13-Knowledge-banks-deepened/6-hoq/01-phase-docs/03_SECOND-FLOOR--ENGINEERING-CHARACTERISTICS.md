---
schema: phase-file.v1
phase_slug: second-floor-engineering-characteristics
module: 6
artifact_key: module_6/second-floor-engineering-characteristics
engine_story: m6-qfd
engine_path: apps/product-helper/.planning/engines/m6-qfd.json
fail_closed_audit: plans/v22-outputs/te1/fail-closed-audit.md#module-6-hoq
fail_closed_registry: apps/product-helper/lib/langchain/engines/fail-closed-runner.ts
kb_chunk_refs: []
legacy_snapshot: apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_legacy_2026-04-26/6-hoq/01-phase-docs/03_SECOND-FLOOR--ENGINEERING-CHARACTERISTICS.md
rewritten_at: 2026-04-27
rewritten_by: kb-rewrite (Wave-E γ-shape, EC-V21-E.9)
---
# Phase 3: Second Floor -- Engineering Characteristics and Direction of Change

## §1 Decision context

This phase contributes to **m6-qfd** decisions. Runtime resolution flows through:

1. ContextResolver loads upstream artifacts + intake state.
2. NFREngineInterpreter evaluates predicates from `apps/product-helper/.planning/engines/m6-qfd.json` against EvalContext.
3. On match → auto-fill (clamped to `auto_fill_threshold`); on no match → fallback (§3); on still-no-match → STOP-GAP gate (§4) blocks proceed.

The legacy educational body (preserved in this file under the "Educational content" footer) explains *why* this phase exists. The runtime *what* lives in the engine.json + fail-closed registry referenced below.

## §2 Predicates (engine.json reference)

- **Engine story:** `m6-qfd` (`apps/product-helper/.planning/engines/m6-qfd.json`)
- **Predicate DSL evaluator:** `apps/product-helper/lib/langchain/engines/predicate-dsl.ts`
- **Story-tree schema:** `apps/product-helper/lib/langchain/schemas/engines/story-tree.ts`
- **Decisions consumed by this phase:** see `decisions[]` in the engine.json keyed on `target_field` containing `second-floor-engineering-characteristics` or by manual mapping in the story tree.

> Predicates are NOT inlined here. The engine.json is the source of truth; this markdown points at it.

## §3 Fallback rules

When no predicate in §2 matches:

1. `searchKB` retrieves top-3 chunks scoped to `{module: 6, phase: second-floor-engineering-characteristics}` (post-G8/G9 ingest).
2. If `searchKB` confidence < 0.90 OR returns zero chunks → `surfaceGap` emits `needs_user_input` to `system-question-bridge.ts` with computed_options + math_trace.
3. User answer re-enters the loop at ContextResolver.

> Fallback contract is shared across all phase files. Per-phase override (if any) is documented in the educational body below.

## §4 STOP-GAP rules (machine-readable)

- **artifact_key:** `module_6/second-floor-engineering-characteristics`
- **registry:** `apps/product-helper/lib/langchain/engines/fail-closed-runner.ts` (`buildFailClosedRegistry`)
- **schema:** `apps/product-helper/lib/langchain/schemas/engines/fail-closed.ts` (`failClosedRuleSetSchema`)
- **audit doc (rule sources + severity):** [plans/v22-outputs/te1/fail-closed-audit.md](../../../../../../plans/v22-outputs/te1/fail-closed-audit.md#module-6-hoq)

The STOP-GAP / Validation-Checklist text in the legacy educational body below has been audited by `engine-fail-closed` and converted into machine-readable rules registered under the `artifact_key` above. The runner default-FAILs if the artifact_key is queried with no rule set registered (conservative).

> Default severity is `error` (proceed-blocking). Only items phrased "advisory" / "soft check" / "warning" / "will NOT fail" are downgraded to `warn`.

## §5 Math derivation

This phase's quantitative outputs (if any) carry `mathDerivationSchema` (or `mathDerivationMatrixSchema` for M5 sites per TC1 `tc1-wave-c-complete`). Each derivation:

- references inputs by `source` (upstream artifact + field path);
- carries `formula` (LaTeX-safe ASCII) + `units` + `computed_value`;
- attaches `base_confidence` + `confidence_modifiers` consumed by NFREngineInterpreter step 6.

> Per-decision math traces are emitted into `decision_audit` (`0011b_decision_audit.sql`) on every Scoring pass per EC-V21-E.3 (audit-writer agent).

## §6 References (KB chunk IDs)

- **Frontmatter `kb_chunk_refs`:** populated by the embedding pipeline (`engine-pgvector` agent, G8/G9 — `apps/product-helper/lib/langchain/engines/kb-embedder.ts`).
- **Runtime retrieval:** `searchKB(query, top_k, { module: 6, phase: 'second-floor-engineering-characteristics' })` over the `kb_chunks` table (`0011a_kb_chunks.sql`, ivfflat lists=100; HNSW upgrade gated on `>10k` rows).
- **Provenance:** every retrieved chunk carries `{kb_source, chunk_hash, content, embedding_distance}`; rendered by `why-this-value-panel.tsx` (`provenance-ui` agent).

> The `kb_chunk_refs` array in frontmatter is left empty until the embedder backfills it. The runtime path does not depend on the static array — it queries the live table.

---

## Educational content (legacy, preserved)

> The body below is the pre-Wave-E text verbatim. It documents *why* this phase exists, the systems-engineering theory behind the prescribed steps, and the example-driven walkthroughs the LLM (and human readers) consume. The 6 sections above are the schema-first overlay locked by Wave-E γ-shape.

> Corresponds to QFD Guide Steps 6, 7

## Prerequisites
- [ ] Phase 2 is complete (back porch populated with competitive scores)
- [ ] Required inputs: Your system concept with enough detail to identify controllable design parameters

## Context (Why This Matters)

Performance criteria measure any solution. Engineering characteristics are specific to *your* solution concept -- they are the functional and structural properties you can control. Listing them transforms the QFD from a competitor comparison into a design tool. The engineering characteristics become the columns of your matrix, and in the next phases you will assess how adjusting each one impacts performance and interacts with the others.

It is not uncommon to have 15 to 50 engineering characteristics. Come up with as many as you can without worrying about having too many, or whether they are too broad or specific. You can refine, combine, or split them later.

## Instructions

### Step 3.1: Describe Your System's Operation

Before brainstorming characteristics, write a brief operational description of your system. Walk through how it functions step by step. This description surfaces engineering characteristics you might otherwise miss.

**E-commerce platform example:**
1. Customer loads the storefront — CDN serves cached pages and product images (see [CDN & Networking KB](cdn-networking-kb.md))
2. Customer searches for products — the search service queries the product database and returns ranked results (see [Data Model KB](data-model-kb.md))
3. Customer adds items to cart — the cart service manages session state and validates real-time inventory
4. Customer proceeds to checkout — the order service calculates totals, taxes, and shipping via API calls to third-party services (see [API Design KB](api-design-sys-design-kb.md))
5. Customer submits payment — the payment gateway processes the transaction through an external payment API
6. System confirms the order — a message queue triggers fulfillment, inventory updates, and email notifications (see [Message Queues KB](message-queues-kb.md))
7. Operations team monitors system health — dashboards track response times, error rates, and queue depths (see [Observability KB](observability-kb.md))

### Step 3.2: Brainstorm Engineering Characteristics

From the operational description, derive characteristics by asking:
- "What functions must be achieved, and what aspects of our system affect how well we achieve them?"
- "What structural properties of our system could I change?"
- "What operational constraints exist (cost, time, calibration)?"

Think about both:
- **Functional aspects**: speed, accuracy, algorithm quality, sensor quality, frequency of updates
- **Structural aspects**: size, weight, material costs, number of ports/connections, battery capacity

Go deeper by asking: "What aspects of my system are *related to* or *directly affect* the engineering characteristics I've already listed?" For example, if you have "maximum speed," consider that path-planning frequency and sensor update rate may also matter.

**E-commerce platform example (20 ECs):**

| # | Engineering Characteristic | Category | Related KB |
|---|---------------------------|----------|-----------|
| 1 | Server Response Time | Performance | [Caching KB](caching-system-design-kb.md) |
| 2 | Database Query Latency | Performance | [Data Model KB](data-model-kb.md) |
| 3 | CDN Cache Hit Rate | Performance | [CDN & Networking KB](cdn-networking-kb.md) |
| 4 | Frontend Bundle Size | Performance | [CDN & Networking KB](cdn-networking-kb.md) |
| 5 | Database Connection Pool Size | Capacity | [Data Model KB](data-model-kb.md) |
| 6 | Auto-Scaling Threshold | Capacity | [Load Balancing KB](load-balancing-kb.md) |
| 7 | Queue Processing Rate | Capacity | [Message Queues KB](message-queues-kb.md) |
| 8 | Storage Capacity | Capacity | [Data Model KB](data-model-kb.md) |
| 9 | Number of Redundant Instances | Reliability | [Resiliency Patterns KB](resilliency-patterns-kb.md) |
| 10 | Alert Response Time | Reliability | [Observability KB](observability-kb.md) |
| 11 | Automated Failover Coverage | Reliability | [Resiliency Patterns KB](resilliency-patterns-kb.md) |
| 12 | Deployment Frequency | Development | [Deployment & CI/CD KB](deployment-release-cicd-kb.md) |
| 13 | Test Coverage (%) | Development | [Deployment & CI/CD KB](deployment-release-cicd-kb.md) |
| 14 | Code Review Turnaround | Development | [Maintainability KB](maintainability-kb.md) |
| 15 | Number of Services / Modules | Development | [Maintainability KB](maintainability-kb.md) |
| 16 | Encryption Level | Security | [System Architecture KB](software_architecture_system.md) |
| 17 | Auth Token Expiry Window | Security | [System Architecture KB](software_architecture_system.md) |
| 18 | Number of Exposed API Endpoints | Security / Interfaces | [API Design KB](api-design-sys-design-kb.md) |
| 19 | Hosting Cost per Month | Cost | [System Architecture KB](software_architecture_system.md) |
| 20 | Third-Party Service Costs | Cost | [System Architecture KB](software_architecture_system.md) |

Note how several ECs — Number of Services, Number of Exposed API Endpoints, Queue Processing Rate — directly shape the **interfaces** between system components. The values you choose for these knobs will determine how components communicate, what contracts they must honor, and where integration complexity lives. These interface decisions carry forward into Module 6.

> **Non-technical translation:** Think of engineering characteristics as the "settings dials" on your platform. Some dials control speed (response time, cache hit rate), some control capacity (connection pools, auto-scaling), some control safety nets (redundancy, failover), and some control how fast your team can ship changes (deployment frequency, test coverage). The QFD helps you decide where to set each dial.

### Step 3.3: Enter ECs into the Template

Place each engineering characteristic as a column header in the QFD template. In the template, text is typically rotated vertically to fit many columns. This row of column headers is the **second floor** of the House of Quality.

### Step 3.4: Assign Direction-of-Change Arrows

Below each engineering characteristic, place an arrow:
- **Up arrow (↑)**: When we discuss this EC, we are asking "What impact will *increasing* this characteristic have on performance?"
- **Down arrow (↓)**: We are asking "What impact will *decreasing* this characteristic have?"

**Rule of thumb**: The arrow is usually chosen to point in the direction believed to have an overall positive effect on system performance. It does not have to, but this is common practice.

There is no wrong way to choose the direction -- it simply sets the frame for the questions asked in the next phases. For example:
- CDN Cache Hit Rate → ↑ (we ask: "What if we increase the cache hit rate?")
- Hosting Cost per Month → ↓ (we ask: "What if we decrease hosting costs?")
- Deployment Frequency → ↑ (we ask: "What if we deploy more often?")
- Auth Token Expiry Window → ↓ (we ask: "What if we shorten the token expiry?")

## Worked Example

From the e-commerce platform's operational description, the team derives 20 engineering characteristics spanning performance (server response time, DB query latency, CDN cache hit rate, frontend bundle size), capacity (connection pool size, auto-scaling threshold, queue rate, storage), reliability (redundant instances, alert response time, failover coverage), development process (deployment frequency, test coverage, code review turnaround, number of services), security (encryption level, token expiry, exposed endpoints), and cost (hosting, third-party services).

Each receives a direction arrow. CDN Cache Hit Rate gets ↑ because serving more pages from cache is assumed positive. Hosting Cost per Month gets ↓ because lower cost is assumed positive. Deployment Frequency gets ↑ because shipping changes faster is initially assumed positive — though the main floor (Phase 4) may reveal that deploying too frequently has negative effects on reliability if testing cannot keep pace.

## Validation Checklist (STOP-GAP)
- [ ] At least 15 engineering characteristics are listed (fewer is acceptable only for very simple systems)
- [ ] Every EC has a direction-of-change arrow (↑ or ↓)
- [ ] ECs cover both functional aspects (how the system works) and structural aspects (what the system is made of)
- [ ] ECs include cost and manufacturing considerations where relevant
- [ ] Each EC is something you actually have control over (a "knob" you can tweak)
- [ ] No EC is a duplicate of a performance criterion -- ECs are what you control, PCs are what customers care about
- [ ] ECs are entered as column headers in the template

> **STOP: Do not proceed to Phase 4 until ALL validation items pass.**
> If you have fewer than 15 ECs, re-examine your system operation description for missed aspects. If an EC looks like a PC, move it or reframe it. If arrows are missing, add them now.

## Output Artifact
The second floor of the QFD is populated: engineering characteristics as column headers, each with a direction-of-change arrow. Combined with the front porch (rows), this creates the matrix grid that will be filled in Phase 4.

## Handoff to Next Phase
You now have the full grid structure: performance criteria as rows, engineering characteristics as columns. Phase 4 fills the **main floor** -- the relationship matrix showing how adjusting each EC impacts each PC.

---

**← Previous:** [Phase 2: Back Porch -- Scoring and Competitors](02_BACK-PORCH--SCORING-AND-COMPETITORS.md) | **Next →** [Phase 4: Main Floor -- Relationship Matrix](04_MAIN-FLOOR--RELATIONSHIP-MATRIX.md)

