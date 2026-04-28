---
schema: phase-file.v1
phase_slug: phase-0-prerequisites
module: 8
artifact_key: module_8/phase-0-prerequisites
engine_story: m8-fmea-residual
engine_path: apps/product-helper/.planning/engines/m8-fmea-residual.json
fail_closed_audit: plans/v22-outputs/te1/fail-closed-audit.md#module-8-risk
fail_closed_registry: apps/product-helper/lib/langchain/engines/fail-closed-runner.ts
kb_chunk_refs: []
legacy_snapshot: apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_legacy_2026-04-26/8-risk/01-phase-docs/02-Phase-0-Prerequisites.md
rewritten_at: 2026-04-27
rewritten_by: kb-rewrite (Wave-E γ-shape, EC-V21-E.9)
---
# Phase 0: Prerequisites and System Context Gathering

## §1 Decision context

This phase contributes to **m8-fmea-residual** decisions. Runtime resolution flows through:

1. ContextResolver loads upstream artifacts + intake state.
2. NFREngineInterpreter evaluates predicates from `apps/product-helper/.planning/engines/m8-fmea-residual.json` against EvalContext.
3. On match → auto-fill (clamped to `auto_fill_threshold`); on no match → fallback (§3); on still-no-match → STOP-GAP gate (§4) blocks proceed.

The legacy educational body (preserved in this file under the "Educational content" footer) explains *why* this phase exists. The runtime *what* lives in the engine.json + fail-closed registry referenced below.

## §2 Predicates (engine.json reference)

- **Engine story:** `m8-fmea-residual` (`apps/product-helper/.planning/engines/m8-fmea-residual.json`)
- **Predicate DSL evaluator:** `apps/product-helper/lib/langchain/engines/predicate-dsl.ts`
- **Story-tree schema:** `apps/product-helper/lib/langchain/schemas/engines/story-tree.ts`
- **Decisions consumed by this phase:** see `decisions[]` in the engine.json keyed on `target_field` containing `phase-0-prerequisites` or by manual mapping in the story tree.

> Predicates are NOT inlined here. The engine.json is the source of truth; this markdown points at it.

## §3 Fallback rules

When no predicate in §2 matches:

1. `searchKB` retrieves top-3 chunks scoped to `{module: 8, phase: phase-0-prerequisites}` (post-G8/G9 ingest).
2. If `searchKB` confidence < 0.90 OR returns zero chunks → `surfaceGap` emits `needs_user_input` to `system-question-bridge.ts` with computed_options + math_trace.
3. User answer re-enters the loop at ContextResolver.

> Fallback contract is shared across all phase files. Per-phase override (if any) is documented in the educational body below.

## §4 STOP-GAP rules (machine-readable)

- **artifact_key:** `module_8/phase-0-prerequisites`
- **registry:** `apps/product-helper/lib/langchain/engines/fail-closed-runner.ts` (`buildFailClosedRegistry`)
- **schema:** `apps/product-helper/lib/langchain/schemas/engines/fail-closed.ts` (`failClosedRuleSetSchema`)
- **audit doc (rule sources + severity):** [plans/v22-outputs/te1/fail-closed-audit.md](../../../../../../plans/v22-outputs/te1/fail-closed-audit.md#module-8-risk)

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
- **Runtime retrieval:** `searchKB(query, top_k, { module: 8, phase: 'phase-0-prerequisites' })` over the `kb_chunks` table (`0011a_kb_chunks.sql`, ivfflat lists=100; HNSW upgrade gated on `>10k` rows).
- **Provenance:** every retrieved chunk carries `{kb_source, chunk_hash, content, embedding_distance}`; rendered by `why-this-value-panel.tsx` (`provenance-ui` agent).

> The `kb_chunk_refs` array in frontmatter is left empty until the embedder backfills it. The runtime path does not depend on the static array — it queries the live table.

---

## Educational content (legacy, preserved)

> The body below is the pre-Wave-E text verbatim. It documents *why* this phase exists, the systems-engineering theory behind the prescribed steps, and the example-driven walkthroughs the LLM (and human readers) consume. The 6 sections above are the schema-first overlay locked by Wave-E γ-shape.

## Knowledge

Before building an FMEA, the system design must be advanced enough that you can describe how all subsystems work together to achieve the desired main functionality and handle all main use cases. Failures most commonly occur at the interfaces between subsystems, so understanding these boundaries is essential.

An FMEA can be performed at the subsystem level (e.g., "Projectile Launch System") or at the component level (e.g., "IR Sensor Encoder"). The user should decide the level of granularity before starting.

## Upstream Module Inputs (Optional but Valuable)

If the user has completed earlier modules in the CESYS sequence, their outputs significantly accelerate and improve Phase 0. **None of these are required** -- the FMEA can be built from scratch -- but any available artifacts should be used.

| Source | What It Provides | How It Helps the FMEA |
|--------|-----------------|----------------------|
| **Module 4 — Decision Matrix** | Performance criteria, measurement scales, weights | Performance criteria become the benchmarks against which you evaluate failure severity. The scale-building discipline (non-overlapping, all-inclusive conditions) directly applies to building severity and likelihood scales in Phase 4. |
| **Module 5 — QFD** | Engineering Characteristics, trade-off relationships (roof), design targets | ECs define the technical parameters your system must achieve -- deviations from these are natural failure modes. The QFD roof highlights where improving one parameter degrades another, pointing to trade-off-driven failure risks. Design targets set the "correct" values against which you measure failure effects. |
| **Module 6 — Defining Interfaces** | Subsystem list, DFDs, N² Charts, Sequence Diagrams, Interface Matrix | The subsystem list populates item 2 below. DFDs and N² Charts map all known connections -- Phase 1 uses these as primary brainstorming sources for failure modes. Sequence Diagrams provide the operational scenarios for item 4. Interface Matrix specifications (values, units, tolerances) define what "correct" looks like -- any deviation is a candidate failure mode. |

**If upstream artifacts are available:** Ask the user to point you to them. Extract the relevant information rather than asking the user to re-state it.

**If upstream artifacts are not available:** Proceed with the input list below. The user provides the information directly.

## Input Required from User

Ask the user to provide (or point to upstream artifacts containing):

1. **System name and brief description** -- What is the system? What does it do?
2. **Subsystem or component list** -- Name each subsystem/component that will be analyzed. If the user has a system architecture, block diagram, or Module 6 subsystem list, request it.
3. **Key functional requirements** -- What must the system do? What performance targets exist? (Module 4 Decision Matrix criteria and Module 5 QFD design targets are ideal sources.)
4. **Main use cases or operational scenarios** -- How is the system used end-to-end? (Module 6 Sequence Diagrams are ideal sources.)
5. **Key interfaces** -- Where do subsystems connect or exchange information/energy/material? (Module 6 DFDs, N² Charts, and Interface Matrix are ideal sources.)
6. **Stakeholders and context** -- Who are the users? What environment does it operate in? Are there safety concerns?

## Instructions for the LLM

1. Ask the user for each input listed above. Accept partial information -- prompt for what is missing.
2. Synthesize the answers into a structured **System Context Summary** using the output format below.
3. Present the summary to the user at the STOP GAP.

## Output Format

```markdown
## System Context Summary

**System Name:** [name]
**Description:** [1-2 sentence description]

### Subsystems / Components to Analyze
| # | Subsystem / Component | Function | Key Interfaces |
|---|----------------------|----------|----------------|
| 1 | [name] | [what it does] | [connects to...] |
| 2 | [name] | [what it does] | [connects to...] |

### Functional Requirements
- FR1: [requirement]
- FR2: [requirement]
- ...

### Key Use Cases
- UC1: [scenario]
- UC2: [scenario]
- ...

### Stakeholders and Operating Environment
- Primary users: [who]
- Operating environment: [where/conditions]
- Safety considerations: [any human harm risks]
```

---

## STOP GAP -- Checkpoint 0

**Present the System Context Summary to the user and ask:**

> "Here is the system context I will use as the basis for the FMEA. Please review:
> 1. Is the subsystem/component list complete? Should any be added or removed?
> 2. Are the functional requirements accurate?
> 3. Are there any interfaces or use cases I am missing?
>
> Confirm this is correct before I proceed to Phase 1 (Failure Mode Identification)."

**Do NOT proceed until the user confirms.**

