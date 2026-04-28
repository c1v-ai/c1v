---
schema: phase-file.v1
phase_slug: phase-0-project-intake-unname
module: 1
artifact_key: module_1/phase-0-project-intake-unname
engine_story: m1-defining-scope
engine_path: apps/product-helper/.planning/engines/m1-defining-scope.json
fail_closed_audit: plans/v22-outputs/te1/fail-closed-audit.md#module-1-defining-scope
fail_closed_registry: apps/product-helper/lib/langchain/engines/fail-closed-runner.ts
kb_chunk_refs: []
legacy_snapshot: apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_legacy_2026-04-26/1-defining-scope/01-phase-docs/03-Phase-0-Project-Intake-Unname.md
rewritten_at: 2026-04-27
rewritten_by: kb-rewrite (Wave-E γ-shape, EC-V21-E.9)
---
# Phase 0: Project Intake / Unname

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
- **Decisions consumed by this phase:** see `decisions[]` in the engine.json keyed on `target_field` containing `phase-0-project-intake-unname` or by manual mapping in the story tree.

> Predicates are NOT inlined here. The engine.json is the source of truth; this markdown points at it.

## §3 Fallback rules

When no predicate in §2 matches:

1. `searchKB` retrieves top-3 chunks scoped to `{module: 1, phase: phase-0-project-intake-unname}` (post-G8/G9 ingest).
2. If `searchKB` confidence < 0.90 OR returns zero chunks → `surfaceGap` emits `needs_user_input` to `system-question-bridge.ts` with computed_options + math_trace.
3. User answer re-enters the loop at ContextResolver.

> Fallback contract is shared across all phase files. Per-phase override (if any) is documented in the educational body below.

## §4 STOP-GAP rules (machine-readable)

- **artifact_key:** `module_1/phase-0-project-intake-unname`
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
- **Runtime retrieval:** `searchKB(query, top_k, { module: 1, phase: 'phase-0-project-intake-unname' })` over the `kb_chunks` table (`0011a_kb_chunks.sql`, ivfflat lists=100; HNSW upgrade gated on `>10k` rows).
- **Provenance:** every retrieved chunk carries `{kb_source, chunk_hash, content, embedding_distance}`; rendered by `why-this-value-panel.tsx` (`provenance-ui` agent).

> The `kb_chunk_refs` array in frontmatter is left empty until the embedder backfills it. The runtime path does not depend on the static array — it queries the live table.

---

## Educational content (legacy, preserved)

> The body below is the pre-Wave-E text verbatim. It documents *why* this phase exists, the systems-engineering theory behind the prescribed steps, and the example-driven walkthroughs the LLM (and human readers) consume. The 6 sections above are the schema-first overlay locked by Wave-E γ-shape.

> Corresponds to "Before You Begin" of the Defining Scope Steps Checklist: *"Remove any name around your system. Instead refer to it as 'The System.'"*

## Knowledge

P0 captures the **minimum** PM input required to start P1 — and explicitly **refuses** to capture solution-shaped input. The eCornell method is iterative-by-design; loading an upfront intake form (system purpose, target architecture, named features) violates Rule R1 by locking the solution space before context diagramming.

> *"You don't want to give it a name. … if you say it's a car, anything that isn't a car is an invalid solution and you couldn't possibly come up with any other kind of possible creative solution because you've already said it has to be a car."*
> — eCornell, *Defining a Nameless System* (`FULL-INSTRUCTIONS.md:247`)

So P0 captures: **the need being met**, **who is asking**, and **hard external constraints** (regulatory, compliance, deadline, environment). That is it.

## Input Required (from PM)

Ask the PM exactly these three questions. Do not ask more. Do not accept a system name yet.

1. **What need are you trying to meet?** (One paragraph. If the answer is a noun like "a CRM" or "a mobile app", restate as a need: "you need to manage customer relationships" / "you need users to access functionality on their phone".)
2. **Who is asking for this?** (Names + roles + which one is the client whose approval you must satisfy.)
3. **Are there any hard external constraints?** (Regulatory frameworks, deployment environment requirements, compliance deadlines, integration mandates. NOT performance targets — those are Module 4.)

## Instructions for the LLM

1. **Refuse a system name.** If the PM says "I want to build [product noun]", reply: `"Per Rule R1, I can't name 'The System' yet. What need does [product noun] meet for the user?"` Re-route to need.
2. **Refuse upfront feature lists.** If the PM lists features, capture them in `open_questions` for P3 (scope tree) — do not bake them into the intake.
3. **Refuse upfront NFRs / performance criteria.** Capture in `open_questions` for Module 4. Reply per Rule R3.
4. **Confirm the unnamed-system declaration.** PM must explicitly acknowledge "the system stays 'The System' through Phase 3."
5. **Assemble `intake_summary` body.** Then surface STOP GAP.

## Output Format

```json
{
  "_schema": "phase_artifact.v1",
  "_output_path": "<project>/module-1-defining-scope/intake_summary.json",
  "phase_id": "P0",
  "artifact_type": "intake_summary",
  "status": "ready_for_review",
  "stop_gap_cleared": false,
  "produced_at": "<ISO-8601>",
  "iteration_count": 0,
  "body": {
    "need_statement": "A system that lets [who] do [what] under [conditions], because [why].",
    "system_name": "The System",
    "stakeholders_provisional": [
      { "name": "<name>", "role": "<role>", "is_client": true }
    ],
    "hard_external_constraints": [
      "Must comply with <regulation>",
      "Must integrate with <named external system>"
    ],
    "deferred_to_p3_scope_tree": [
      "<any feature the PM mentioned — captured here, not in intake>"
    ],
    "deferred_to_module_4_decision_matrix": [
      "<any performance criterion the PM mentioned>"
    ]
  },
  "open_questions": [
    "Does '<provisional stakeholder>' have approval authority?"
  ],
  "fail_closed_check": {
    "unnamed_system_ok": true,
    "no_subsystems_ok": null,
    "interactions_only_ok": null,
    "iteration_break_done": null,
    "no_externals_inside_system_box": null
  },
  "source_references": [
    "../course-lectures-master-md/Defining-Scope-Steps-Checklist.md",
    "../course-lectures-master-md/FULL-INSTRUCTIONS.md"
  ]
}
```

## STOP GAP — Checkpoint 1 (P0 exit)

Present `intake_summary.json` to the PM and ask:

1. "Confirmed: The System has no name and stays 'The System' through Phase 3. ✅"
2. "I captured the need as: **[need_statement]**. Is that accurate?"
3. "I have **[N]** stakeholders, with **[client_name]** as the client whose approval is required. Correct?"
4. "I have **[K]** hard external constraints. Anything missing? (Performance targets like 'fast' or 'reliable' will be captured in Module 4 — not here.)"
5. "Should I proceed to Phase 1 (Context Diagram)?"

> **STOP:** Do not proceed to Phase 1 until the PM confirms all five. Set `stop_gap_cleared: true` only after explicit "yes, proceed."

## Output Artifact

`intake_summary.json` — Phase 1 reads `body.need_statement` and `body.stakeholders_provisional` as starting points. `body.deferred_to_p3_scope_tree` and `body.deferred_to_module_4_decision_matrix` are carried forward without being acted on yet.

## Handoff to Next Phase

P1 will build the Context Diagram, expanding the provisional stakeholders into the full external-actor set and deriving interactions.

---

**Next →** [Phase 1: Context Diagram](04-Phase-1-Context-Diagram.md) | **Back:** [Master Prompt](00-Defining-Scope-Master-Prompt.md)

