---
schema: phase-file.v1
phase_slug: json-instance-write-protocol
module: 1
artifact_key: module_1/json-instance-write-protocol
engine_story: m1-defining-scope
engine_path: apps/product-helper/.planning/engines/m1-defining-scope.json
fail_closed_audit: plans/v22-outputs/te1/fail-closed-audit.md#module-1-defining-scope
fail_closed_registry: apps/product-helper/lib/langchain/engines/fail-closed-runner.ts
kb_chunk_refs: []
legacy_snapshot: apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_legacy_2026-04-26/1-defining-scope/01-phase-docs/02-JSON-Instance-Write-Protocol.md
rewritten_at: 2026-04-27
rewritten_by: kb-rewrite (Wave-E γ-shape, EC-V21-E.9)
---
# JSON Instance Write Protocol

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
- **Decisions consumed by this phase:** see `decisions[]` in the engine.json keyed on `target_field` containing `json-instance-write-protocol` or by manual mapping in the story tree.

> Predicates are NOT inlined here. The engine.json is the source of truth; this markdown points at it.

## §3 Fallback rules

When no predicate in §2 matches:

1. `searchKB` retrieves top-3 chunks scoped to `{module: 1, phase: json-instance-write-protocol}` (post-G8/G9 ingest).
2. If `searchKB` confidence < 0.90 OR returns zero chunks → `surfaceGap` emits `needs_user_input` to `system-question-bridge.ts` with computed_options + math_trace.
3. User answer re-enters the loop at ContextResolver.

> Fallback contract is shared across all phase files. Per-phase override (if any) is documented in the educational body below.

## §4 STOP-GAP rules (machine-readable)

- **artifact_key:** `module_1/json-instance-write-protocol`
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
- **Runtime retrieval:** `searchKB(query, top_k, { module: 1, phase: 'json-instance-write-protocol' })` over the `kb_chunks` table (`0011a_kb_chunks.sql`, ivfflat lists=100; HNSW upgrade gated on `>10k` rows).
- **Provenance:** every retrieved chunk carries `{kb_source, chunk_hash, content, embedding_distance}`; rendered by `why-this-value-panel.tsx` (`provenance-ui` agent).

> The `kb_chunk_refs` array in frontmatter is left empty until the embedder backfills it. The runtime path does not depend on the static array — it queries the live table.

---

## Educational content (legacy, preserved)

> The body below is the pre-Wave-E text verbatim. It documents *why* this phase exists, the systems-engineering theory behind the prescribed steps, and the example-driven walkthroughs the LLM (and human readers) consume. The 6 sections above are the schema-first overlay locked by Wave-E γ-shape.

Every phase produces a JSON file conforming to `phase_artifact.schema.json`. This file defines the authoring contract: how the LLM/agent constructs each artifact and what it must check before writing.

## The Envelope

Every phase output uses the same outer shape:

```json
{
  "_schema": "phase_artifact.v1",
  "_output_path": "<project>/module-1-defining-scope/<artifact_type>.json",
  "phase_id": "P0|P1|P2|P3|P4",
  "artifact_type": "<one of the 7 enum values>",
  "status": "draft|first_pass|iterated|ready_for_review|approved",
  "stop_gap_cleared": false,
  "produced_at": "<ISO-8601 datetime>",
  "produced_by": "<agent or PM identifier>",
  "iteration_count": 0,
  "body": { ... },          // phase-specific
  "open_questions": [],
  "fail_closed_check": {
    "unnamed_system_ok": true|false|null,
    "no_subsystems_ok": true|false|null,
    "interactions_only_ok": true|false|null,
    "iteration_break_done": true|false|null,
    "no_externals_inside_system_box": true|false|null
  },
  "source_references": []
}
```

## Status Lifecycle

```
draft → first_pass → iterated → ready_for_review → approved
```

- `draft` — being assembled mid-phase, not yet shown to PM
- `first_pass` — shown to PM but pre-iteration (P1 only — Step 5 complete, before Step 6 break)
- `iterated` — post Step 6 iteration break (P1 only)
- `ready_for_review` — assembled and ready for STOP GAP presentation
- `approved` — PM cleared the STOP GAP; `stop_gap_cleared` flips to true

## Fail-Closed Check Discipline

Before flipping `stop_gap_cleared: true`, the LLM MUST evaluate every applicable check. A `null` value means the rule does not apply to this artifact (e.g., `iteration_break_done` is N/A for P0). The full rule definitions live in `00-Defining-Scope-Master-Prompt.md`.

| Phase / artifact | R1 | R2 | R3 | R4 | R5 |
|------------------|----|----|----|----|----|
| P0 `intake_summary` | required true | null | null | null | null |
| P1 `context_diagram` | required true | required true | required true | required true | required true |
| P1 `stakeholder_list` | required true | null | null | null | null |
| P2 `use_case_inventory` | required true | null | null | null | null |
| P2 `use_case_diagram` | required true | required true | null | null | required true |
| P3 `scope_tree` | required true | null | null | null | null |
| P4 `system_scope_summary` | true (or final-name approved) | true | true | true | true |

If any required-true check is false, **refuse to write the artifact**. Surface the violation to the PM with a refusal message keyed to the rule ID.

## Worked Example — P1 Context Diagram body

```json
{
  "_schema": "phase_artifact.v1",
  "_output_path": "<project>/module-1-defining-scope/context_diagram.json",
  "phase_id": "P1",
  "artifact_type": "context_diagram",
  "status": "iterated",
  "stop_gap_cleared": true,
  "produced_at": "2026-04-19T14:00:00Z",
  "produced_by": "kb-agent",
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
      },
      {
        "name": "PASSENGERS",
        "type": "human",
        "role": "transported humans (subdivided in iteration: adult/child/baby/disabled)",
        "interactions": [
          { "direction": "system_to_actor", "label": "safely transports, protects in a crash" }
        ]
      }
      /* … 8-20 total entries … */
    ],
    "mermaid_path": "context_diagram.mmd"
  },
  "open_questions": [
    "Are toll booths in scope or out? Iterated to 'OUT' after PM input."
  ],
  "fail_closed_check": {
    "unnamed_system_ok": true,
    "no_subsystems_ok": true,
    "interactions_only_ok": true,
    "iteration_break_done": true,
    "no_externals_inside_system_box": true
  },
  "source_references": [
    "../course-lectures-master-md/Context-Diagram-Visual-Guide.md",
    "../course-lectures-master-md/01-context-diagram-1.mmd"
  ]
}
```

## Worked Example — P4 system_scope_summary body

The `body` for `artifact_type: "system_scope_summary"` MUST validate against `system_scope_summary.schema.json` (NOT `phase_artifact.schema.json`'s generic body shape). Module 2 reads this body directly as `system_context_summary.v1`.

```json
{
  "_schema": "phase_artifact.v1",
  "phase_id": "P4",
  "artifact_type": "system_scope_summary",
  "status": "approved",
  "stop_gap_cleared": true,
  "body": {
    "_schema": "system_scope_summary.v1",
    "_compatible_with": "system_context_summary.v1",
    "system_name": "The System",
    "system_description": "A system that meets the need to safely transport people and cargo from point A to point B with reasonable cost and time.",
    "project_metadata": { "project_name": "TransportNeed", "confidentiality": "Internal", "target_release": "v1.0" },
    "boundary": { /* … */ },
    "use_cases": [ /* … */ ],
    "scope_tree_functions": [ /* … */ ],
    "module_1_artifacts_referenced": [ /* … */ ]
  }
}
```

## Mermaid File Discipline

For `context_diagram`, `use_case_diagram`, and `scope_tree`, write a **paired** `.mmd` file alongside the `.json`. The JSON references the `.mmd` via `body.mermaid_path` (relative to the JSON file). Mermaid templates are seeded from `../course-lectures-master-md/01-context-diagram-1.mmd` and `03-use-cases-1.mmd`. Each phase file documents the exact Mermaid contract.

## Refusal Pattern

When a fail-closed check would be `false`:

```
Phase: P1
Artifact: context_diagram
Refused write because: Rule R3 violated — "RELIABILITY" listed as external entity.
Suggested fix: "RELIABILITY" is a performance criterion (Module 4 candidate). Replace with a noun-thing that triggers system behavior (e.g., HARSH WEATHER, MAINTENANCE TECHNICIAN). Capturing in open_questions for Module 4.
```

The artifact is NOT written until the violation is fixed (or the offending element is moved to `open_questions`).

---

**Back:** [Master Prompt](00-Defining-Scope-Master-Prompt.md)

