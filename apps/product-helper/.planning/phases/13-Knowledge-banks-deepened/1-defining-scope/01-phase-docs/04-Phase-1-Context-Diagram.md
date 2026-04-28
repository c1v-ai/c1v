---
schema: phase-file.v1
phase_slug: phase-1-context-diagram
module: 1
artifact_key: module_1/phase-1-context-diagram
engine_story: m1-defining-scope
engine_path: apps/product-helper/.planning/engines/m1-defining-scope.json
fail_closed_audit: plans/v22-outputs/te1/fail-closed-audit.md#module-1-defining-scope
fail_closed_registry: apps/product-helper/lib/langchain/engines/fail-closed-runner.ts
kb_chunk_refs: []
legacy_snapshot: apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_legacy_2026-04-26/1-defining-scope/01-phase-docs/04-Phase-1-Context-Diagram.md
rewritten_at: 2026-04-27
rewritten_by: kb-rewrite (Wave-E γ-shape, EC-V21-E.9)
---
# Phase 1: Context Diagram

## §1 Decision context

This phase contributes to **m1-defining-scope** decisions. Runtime resolution flows through:

1. ContextResolver loads upstream artifacts + intake state.
2. NFREngineInterpreter evaluates predicates from `apps/product-helper/.planning/engines/m1-defining-scope.json` against EvalContext.
3. On match → auto-fill (clamped to `auto_fill_threshold`); on no match → fallback (§3); on still-no-match → STOP-GAP gate (§4) blocks proceed.

The legacy educational body (preserved in this file under the "Educational content" footer) explains *why* this phase exists. The runtime *what* lives in the engine.json + fail-closed registry referenced below.

## §2 Predicates (engine.json reference)

- **Engine story:** `m1-defining-scope` (`apps/product-helper/.planning/engines/m1-defining-scope.json`)
- **Predicate DSL evaluator:** `apps/product-helper/lib/langchain/engines/predicate-dsl.ts`
- **Story-tree schema:** `apps/product-helper/lib/langchain/schemas/engines/story-tree.ts`
- **Decisions consumed by this phase:** see `decisions[]` in the engine.json keyed on `target_field` containing `phase-1-context-diagram` or by manual mapping in the story tree.

> Predicates are NOT inlined here. The engine.json is the source of truth; this markdown points at it.

## §3 Fallback rules

When no predicate in §2 matches:

1. `searchKB` retrieves top-3 chunks scoped to `{module: 1, phase: phase-1-context-diagram}` (post-G8/G9 ingest).
2. If `searchKB` confidence < 0.90 OR returns zero chunks → `surfaceGap` emits `needs_user_input` to `system-question-bridge.ts` with computed_options + math_trace.
3. User answer re-enters the loop at ContextResolver.

> Fallback contract is shared across all phase files. Per-phase override (if any) is documented in the educational body below.

## §4 STOP-GAP rules (machine-readable)

- **artifact_key:** `module_1/phase-1-context-diagram`
- **registry:** `apps/product-helper/lib/langchain/engines/fail-closed-runner.ts` (`buildFailClosedRegistry`)
- **schema:** `apps/product-helper/lib/langchain/schemas/engines/fail-closed.ts` (`failClosedRuleSetSchema`)
- **audit doc (rule sources + severity):** [plans/v22-outputs/te1/fail-closed-audit.md](../../../../../../plans/v22-outputs/te1/fail-closed-audit.md#module-1-defining-scope)

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
- **Runtime retrieval:** `searchKB(query, top_k, { module: 1, phase: 'phase-1-context-diagram' })` over the `kb_chunks` table (`0011a_kb_chunks.sql`, ivfflat lists=100; HNSW upgrade gated on `>10k` rows).
- **Provenance:** every retrieved chunk carries `{kb_source, chunk_hash, content, embedding_distance}`; rendered by `why-this-value-panel.tsx` (`provenance-ui` agent).

> The `kb_chunk_refs` array in frontmatter is left empty until the embedder backfills it. The runtime path does not depend on the static array — it queries the live table.

---

## Educational content (legacy, preserved)

> The body below is the pre-Wave-E text verbatim. It documents *why* this phase exists, the systems-engineering theory behind the prescribed steps, and the example-driven walkthroughs the LLM (and human readers) consume. The 6 sections above are the schema-first overlay locked by Wave-E γ-shape.

> Corresponds to Steps 1–7 of the Defining Scope Steps Checklist.

## Knowledge

A context diagram is **the** primary scope-defining artifact. It shows The System (one box) inside a dashed boundary, with 8-20 external entities outside it, each connected by a labeled line indicating the interaction.

> *"A context diagram… could really help to flesh out what are all the things that your system needs to interact with, and what are the ways that all those things interact with your system, and force those interactions to occur."*
> — eCornell, *Defining a Nameless System* (`FULL-INSTRUCTIONS.md:235`)

> *"Anything inside that dash box is what you have control over. Anything outside is what you don't have control over."*
> — eCornell (`FULL-INSTRUCTIONS.md:239`)

### Formatting rules (eCornell, verbatim)

> *"Each box should be roughly the same size. Boxes should have square, never rounded, corners. Color is strictly prohibited; it's just black and white. Names inside of the boxes should be capitalized and all names should use the same font and the same font size."*
> — eCornell, *Identifying Elements that Interact with the System* (`FULL-INSTRUCTIONS.md:293`)

> *"All connecting lines must be drawn as rectilinear lines. … Interactions should also be written in lowercase only. Only one line is allowed to connect between any two boxes. So if you have multiple interactions, they should be placed on the same line separated by commas."*
> — eCornell, *Making Connections* (`FULL-INSTRUCTIONS.md:404, :408`)

### The five fail-closed rules apply HERE

This is the phase where all five rules are most actively enforced. See `00-Defining-Scope-Master-Prompt.md` for full text. Summary:

- **R1** Don't name The System
- **R2** Don't split into subsystems
- **R3** Don't list properties — only interactions
- **R4** Don't skip the iteration break (Step 6)
- **R5** Don't merge external entities into The System box

## Input Required

- `intake_summary.json` from P0 (with `stop_gap_cleared: true`)
- PM availability for two checkpoints: mid-phase iteration break (Step 6) and end-of-phase exit

## Instructions for the LLM

### Sub-phase A: First Pass (Steps 1-5)

1. **Step 1 — Place "The System".** Emit a Mermaid `subgraph boundary` containing exactly ONE node labeled `The System`. Refuse to add more nodes inside the boundary (Rules R2, R5).
2. **Step 2-3 — List provisional stakeholders.** Pull from `intake_summary.body.stakeholders_provisional`. Place each as an external entity OUTSIDE the boundary. Ask the PM if any stakeholder is missing.
3. **Step 4 — Brainstorm 8+ external entities.** Beyond stakeholders, identify other things The System must interact with: external systems, environment, downstream consumers, regulatory bodies, data sources, undesired interactors. Aim for **at least 8** boxes per eCornell minimum.
   > *"We want to try to focus on having at least eight major ones that we're going to focus on, but we don't have probably more than 20 for the purposes of starting this out."* (`FULL-INSTRUCTIONS.md:289`)
4. **Step 5 — Label interactions.** For each external entity, write at least one interaction label. Use lowercase verb-phrases. If multiple, separate with commas (NOT semicolons or slashes).
5. **Set `status: "first_pass"`. Increment `iteration_count: 0` (this is the first pass — break is next).**

### STOP GAP — Mid-Phase Iteration Break (Step 6)

Present the first-pass artifact to the PM:

> *"You've put a lot of information into your context diagram and as a result it may have become cluttered. Now's a great time to take a break before you try to review it as a whole or reorganize it."*
> — eCornell, Step 6

Ask the PM:

1. "First-pass context diagram has **[N]** external entities. Take an iteration break before refining? (Rule R4 requires it.)"
2. "Are there entities to **break up** further? (e.g., 'PASSENGERS' → 'ADULT PASSENGERS', 'CHILD PASSENGERS', 'BABY PASSENGERS', 'DISABLED PASSENGERS' if those trigger different system behavior.)"
3. "Are there entities to **combine** via dominance argument? (e.g., 'BABY VOMIT' covers organic + biohazard + smelly + liquid+solid mess — picks one to represent the worst case.)"
4. "Are there entities to **remove** because they don't actually trigger different system behavior?"
5. "Does any entity name look like a property (an adjective, NFR, or performance criterion)? If so, Rule R3 requires moving it to `open_questions` for Module 4."

> **STOP:** Do not proceed to Sub-phase B until the PM has answered. Setting `iteration_break_done: true` requires explicit PM acknowledgment.

### Sub-phase B: Iteration (Step 7)

6. **Apply break-up / combine / remove decisions** from the PM. Re-emit the diagram. Increment `iteration_count` per round.
7. **Re-validate all five fail-closed rules.** Especially R3 (no properties masquerading as entities).
8. **Targets after iteration:** 12-20 external entities. Fewer than 12 means the PM probably under-iterated — re-prompt.
9. **Set `status: "iterated"`.**

### Sub-phase C: Stakeholder List

10. Extract the human external entities into a separate `stakeholder_list.json`. Distinguish primary (in `intake_summary.stakeholders_provisional`) from secondary (discovered during context diagramming). Mark `is_client: true` on the one whose approval is required.

## Output Format — `context_diagram.json`

```json
{
  "_schema": "phase_artifact.v1",
  "phase_id": "P1",
  "artifact_type": "context_diagram",
  "status": "iterated",
  "stop_gap_cleared": true,
  "iteration_count": 2,
  "body": {
    "the_system": "The System",
    "external_actors": [
      {
        "name": "DRIVER",
        "type": "human",
        "role": "primary operator",
        "interactions": [
          { "direction": "actor_to_system", "label": "operates, fuels, parks" },
          { "direction": "system_to_actor", "label": "transports, displays status to" }
        ]
      }
      /* … 8-20 total … */
    ],
    "mermaid_path": "context_diagram.mmd"
  },
  "open_questions": [],
  "fail_closed_check": {
    "unnamed_system_ok": true,
    "no_subsystems_ok": true,
    "interactions_only_ok": true,
    "iteration_break_done": true,
    "no_externals_inside_system_box": true
  }
}
```

## Output Format — `context_diagram.mmd`

Clone-and-edit from `../course-lectures-master-md/01-context-diagram-1.mmd`. Required structure:

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'lineColor': '#333333', 'primaryColor': '#ffffff', 'primaryTextColor': '#000000', 'fontSize': '14px' }, 'flowchart': { 'rankSpacing': 70, 'nodeSpacing': 25, 'curve': 'basis' }}}%%
graph TD
    %% === CENTER: The System (single node only — Rule R2) ===
    subgraph boundary ["SYSTEM BOUNDARY"]
        System["<b>THE SYSTEM</b>"]
    end

    %% === EXTERNAL ENTITIES (8-20 — outside boundary, Rule R5) ===
    Driver["DRIVER"]
    Passengers["PASSENGERS"]
    Weather["WEATHER"]
    Roads["ROADS"]
    /* … */

    %% === INTERACTIONS (lowercase verb-phrases, comma-separated) ===
    Driver -->|"operates, fuels, parks"| System
    System -->|"transports, displays status to"| Driver
    /* … */

    classDef system fill:#1a1a2e,stroke:#16213e,stroke-width:3px,color:#ffffff
    classDef boundary fill:#f0f4f8,stroke:#1a1a2e,stroke-width:3px,stroke-dasharray:10 5
    class System system
    class boundary boundary
```

## Output Format — `stakeholder_list.json`

```json
{
  "_schema": "phase_artifact.v1",
  "phase_id": "P1",
  "artifact_type": "stakeholder_list",
  "status": "approved",
  "stop_gap_cleared": true,
  "body": {
    "stakeholders": [
      { "name": "Driver", "role": "primary operator", "primary_or_secondary": "primary", "is_client": false },
      { "name": "Owner", "role": "purchaser", "primary_or_secondary": "primary", "is_client": true },
      { "name": "Passenger", "role": "transported", "primary_or_secondary": "secondary", "is_client": false }
    ]
  },
  "fail_closed_check": {
    "unnamed_system_ok": true,
    "no_subsystems_ok": null,
    "interactions_only_ok": null,
    "iteration_break_done": null,
    "no_externals_inside_system_box": null
  }
}
```

## Output Artifacts

- `context_diagram.json` (envelope)
- `context_diagram.mmd` (Mermaid render)
- `stakeholder_list.json` (envelope)

## Handoff to Next Phase

P2 reads `context_diagram.body.external_actors` to derive the actor set for the use case diagram. Each external entity becomes a candidate primary or secondary actor.

---

**Next →** [Phase 2: Use Case Diagram](05-Phase-2-Use-Case-Diagram.md) | **Back:** [Master Prompt](00-Defining-Scope-Master-Prompt.md) · [Phase 0](03-Phase-0-Project-Intake-Unname.md)

