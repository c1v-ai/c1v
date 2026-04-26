# Gate A — Module 2 Phase-by-Phase JSON-Emission Inventory

> **Gate:** A (Step 1 deliverable for `plans/m2-folder-2-schema-az-sweep.md`)
> **Status:** DRAFT — pending David's review + approval. No Zod code written.
> **Produced by:** Peer-3 (Peer-4 executor workstream)
> **Date:** 2026-04-21
> **Methodology source:** `apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/New-knowledge-banks/2-dev-sys-reqs-for-kb-llm-software/{03..15}-Phase-*.md` (13 files read end-to-end)

---

## Executive Summary

- **13 phases, but only 12 JSON emissions.** Phase 2 (Thinking Functionally) is a calibration-only checkpoint with no artifact — its "schema" is a user-confirmation handshake, not data. Worth modeling as a minimal `phaseEnvelopeSchema`-only schema so the barrel export is uniform, but it has zero payload fields.
- **Phase 12 emits two artifacts**, not one — `ffbd-handoff.json` AND `module_2_final_review.json`. The plan §4 directory shows one file (`phase-12-ffbd-handoff.ts`). Recommend a design call in Step 2: either one file with a discriminated union, or split into two sibling files (`phase-12-ffbd-handoff.ts` + `phase-12-final-review.ts`). I lean toward the split — they have different consumers (Module 3 vs closeout review).
- **UCBD JSON is progressively populated across Phases 3 → 4 → 5.** One shape, three `_phase_status` values (`phase-3-complete`, `phase-4-complete`, `phase-5-complete`). Either one Zod schema with progressive optional-ness via `_phase_status` discriminator, or three Zods layered via `.extend()`. Recommend the latter for clean compile-time guarantees.
- **Phase 11 is an orchestrator loop, not a new artifact shape.** It re-runs Phases 3-10 for deferred UCs and emits `expansion_report.json`. The per-UC artifacts it produces reuse the Phases 3-10 schemas. Only `expansion_report.v1` needs a new Zod.
- **Two shared envelope types required** (flagged in plan §4): `phaseEnvelopeSchema` (`_schema`, `_output_path`, `_phase_status`, `metadata`) on every emission; `metadataHeaderSchema` (the 17-field header: project_name, document_id, target_release, confidentiality, author, approvers, stakeholders, ...) reused across every artifact that marshals to xlsx.
- **Phase 8 already introduces `math_derivation` + `software_arch_decision`.** These are LLM-internal per the methodology footer ("marshaller drops them"). Classification: `internal:downstream-modules(M3, M4, M5, M7)`. **Per plan §5 bullet 4**, `software_arch_decision.ref` is a Zod enum derived from the F13/2 KB filename set (not a hand-typed literal).
- **Phase 12 `ffbd-handoff.v1` already has a `constants` + `cross_cutting_concerns` block**, but the plan master §4.5.4 calls out a new `operational_primitives` field (Little's Law inputs: actions/UC, bytes_in/out, freq_per_dau, session_shape, data_objects). This is **net-new in the sweep**; not in the methodology doc today.

---

## The 13-Row Inventory Table

Legend for the UI-surface column:
- `page:/…` — a dedicated route renders this field
- `section:<page> > <section>` — one section of an existing page renders this field
- `internal:<consumer>` — consumed by another agent/module, not user-visible
- `(proposed)` appended where the route/section doesn't exist today and would be added by the broader sweep's frontend work

Route topology verified against `apps/product-helper/app/(dashboard)/projects/[id]/` — existing routes: `backend`, `chat`, `connections`, `data`, `diagrams`, `edit`, `generate`, `requirements` (with `architecture`, `goals-metrics`, `nfr`, `problem-statement`, `system-overview`, `tech-stack`, `user-stories` subroutes), `settings`, `system-design` (with `decision-matrix`, `ffbd`, `interfaces`, `qfd` subroutes).

| # | Phase | Emitted JSON (`_schema` id) | Shape summary (top-level keys) | Primary UI surface (dominant) | New-in-sweep fields | KB source(s) |
|---|---|---|---|---|---|---|
| 1 | Phase 0 — Ingest Module 1 Scope | `system_context_summary.v1` | `system_name`, `system_description`, `project_metadata`, `boundary{the_system, external_actors[]}`, `use_cases[]`, `scope_tree_functions[]`, `hard_constraints[]`, `module_1_artifacts_referenced[]`, `open_questions[]` | `page:/projects/[id] (proposed: System Scope panel replaces placeholder)` | `open_questions[]`, `module_1_artifacts_referenced[]` | **upstream** (Module 1 artifacts); inline §Software-system translation notes cites `cdn-networking-kb.md`, `api-design-sys-design-kb.md`, `message-queues-kb.md`, `observability-kb.md`, `software_architecture_system.md`, `load-balancing-kb.md`, `cap_theorem.md`, `resilliency-patterns-kb.md` as vocabulary references — none are schema drivers here |
| 2 | Phase 1 — Prioritize Use Cases | `use_case_priority.v1` | `scoring_rubric{}`, `ranked_use_cases[]{id, name, primary_actor, business_importance, business_importance_rationale, user_frequency, user_frequency_rationale, functional_uniqueness, functional_uniqueness_rationale, priority_score, selected_for_first_pass}`, `deferred_use_cases[]`, `coverage_summary{}` | `section:/projects/[id]/requirements > Use-Case Priority (proposed)` | `priority_score.math_derivation` (per plan §6.0: effort × impact formula with KB citation) | `software_architecture_system.md` (per plan §6.0 table) |
| 3 | Phase 2 — Thinking Functionally | *(no JSON)* | N/A — calibration-only STOP GAP confirming user understands functional-vs-structural discipline | `internal:phase-dispatcher (checkpoint ack)` | `_phase_status: "phase-2-acked"` envelope-only | **inline** (per plan §6.0 table — cognitive-load heuristic, no KB) |
| 4 | Phase 3 — UCBD Setup | `UCBD_Template_and_Sample.schema.json` (partial, `_phase_status: phase-3-complete`) | `metadata{}`, `use_case_name`, `_columns_plan{A_primary_actor, B_the_system, C_other_actor_1?, D_other_actor_2?}`, `initial_conditions[]=[]`, `actor_steps_table[]=[]`, `ending_conditions[]=[]`, `notes[]` | `page:/projects/[id]/requirements/ucbds/[ucId] (proposed)` | `_columns_plan` as first-class Zod discriminator (today it's a comment-annotated hint — xlsx-dropped) | `api-design-sys-design-kb.md` §P95 (per plan §6.0 table); inline notes cite `resilliency-patterns-kb.md`, `message-queues-kb.md` as optional column-actor vocab |
| 5 | Phase 4 — Start/End Conditions | UCBD schema (`_phase_status: phase-4-complete`) | Adds `initial_conditions[]` + `ending_conditions[]`; optionally `_insertions{initial_conditions?, ending_conditions?}` for xlsx row-expansion hints | `page:/projects/[id]/requirements/ucbds/[ucId] (proposed)` | `_insertions` envelope (xlsx-row-expansion hints — today inline; needs Zod declaration) | `resilliency-patterns-kb.md` (for "external system is reachable" → circuit-breaker / timeout implications); plan §6.0: `api-design-sys-design-kb.md` §P95 (step-budget) |
| 6 | Phase 5 — UCBD Step Flow | UCBD schema (`_phase_status: phase-5-complete`) | Adds `actor_steps_table[]{primary_actor, the_system, other_actors, extra_actor_col}` (16-row bound per template; `_insertions` hint if more) | `page:/projects/[id]/requirements/ucbds/[ucId] (proposed)` | None (actor_steps_table already in F14/2 hand-written JSON) — but per-row literal-thresholds like "within 500 ms" are flagged for Phase 8 extraction | `api-design-sys-design-kb.md`, `message-queues-kb.md`, `data-model-kb.md`, `caching-system-design-kb.md`, `resilliency-patterns-kb.md`, `observability-kb.md`, `cap_theorem.md` (all step-flow pattern KBs, per methodology Software-system translation table) |
| 7 | Phase 6 — Extract Requirements Table | `Requirements-table.schema.json` (`_phase_status: phase-6-complete`) | `metadata{}`, `requirements_table[]{index, requirement, abstract_function_name, source_ucbd, also_appears_in[]}`, `extraction_summary{ucbds_processed[], total_raw_statements_found, total_unique_requirements, duplicates_merged}` | `page:/projects/[id]/requirements (extend page.tsx — today shows overview; add table view)` | `abstract_function_name` as Zod-enforced snake_case regex (today free-text); `also_appears_in[]` and `source_ucbd` (LLM-internal today, sweep promotes to first-class xlsx-dropped fields for Module 3 FFBD consumption) | **multiple** (per plan §6.0) — each row's `math_derivation` (new per plan §4.5.4) cites the KB appropriate to its requirement: `api-design-sys-design-kb.md`, `data-model-kb.md`, `message-queues-kb.md`, `observability-kb.md`, etc. |
| 8 | Phase 7 — Requirements Rules Audit | `Requirements-table.schema.json` (`_phase_status: phase-7-complete`) | Adds per-row: `rules_passed[]`, `rewrite_history[]{original, reason}`, `needs_user_input`, `user_input_needed`; adds sibling blocks: `retired_indexes[]{index, reason}`, `audit_report{total_requirements_audited, passed_unchanged, rewritten, split_into_multiple, failed_needs_user_input, constants_introduced[], failures_by_rule{}}` | `section:/projects/[id]/requirements > Audit Trail (proposed)`; `rules_passed` + `needs_user_input` drive a review-queue modal at `internal:review-gate-controller` | `rules_passed[]` as Zod enum (`"shall"|"correct"|"atomic"|"unambiguous"|"objective"|"verifiable"|"functional"`); `retired_indexes[]` — first-class immutability signal (promotes from prose convention to typed field); `audit_report.failures_by_rule{}` keyed by the same enum | `maintainability-kb.md` (per plan §6.0 table); methodology §Software-system translation cites `api-design-sys-design-kb.md`, `software_architecture_system.md`, `observability-kb.md`, `caching-system-design-kb.md` as rewrite-pattern vocab |
| 9 | Phase 8 — Constants Table | `Requirement_Constants_Definition_Template.schema.json` (`_phase_status: phase-8-complete`) | `metadata{}`, `constants_table[]{constant, value, units, estimate_final, date_update, final_date, source, owned_by, notes, math_derivation{formula, source, inputs}, software_arch_decision{ref, choice}, referenced_by[], needs_user_input}`, `conflicts_detected[]{concept, constants[], question}`, `summary{total_constants, needs_user_input_count, conflicts_count}` | `page:/projects/[id]/requirements/constants (proposed)`; `math_derivation` + `software_arch_decision` → `internal:downstream-modules(M3-FFBD, M4-DM, M5-QFD, M7-FMEA)` + optional `section:Constants > Design Rationale` panel | **`math_derivation`** (object — PILOT ALREADY LANDED in methodology, NO Zod home today); **`software_arch_decision`** (object — PILOT ALREADY LANDED, NO Zod home today); `software_arch_decision.ref` is the KB-derived enum (per plan §5 bullet 4) | Per plan §6.0 and methodology §Inline decision plays: `cap_theorem.md`, `resilliency-patterns-kb.md`, `api-design-sys-design-kb.md`, `caching-system-design-kb.md`, `load-balancing-kb.md`, `observability-kb.md`, plus inline §Availability-nines formula (seeds future `system-design-math-logic.md §9`) |
| 10 | Phase 9 — Delve and Fix | `delving_report.v1` (`_phase_status: phase-9-complete`) + re-emitted `Requirements-table.schema.json` | `contractor_test_gaps[]{original_scenario, gap, new_requirements[]}`, `lens_gaps[]{lens, requirement_audited, gap, new_requirement}`, `category_gaps[]{category, gap, new_requirement}`, `new_requirements_added[]{index, requirement, abstract_function_name, source_lens}`, `new_constants_needed[]`, `ucbd_updates_needed[]{ucbd, new_step_required}`, `summary{}` | `section:/projects/[id]/requirements > Delving Audit (proposed)` | `source_lens` as Zod enum (15 lenses × 24 software categories × `contractor_test` literal) — today free-text; `ucbd_updates_needed[]` formalized | **inline** (`coverage_score = covered_uc / total_uc` per plan §6.0); methodology §Software-system delving heuristics table cross-references `caching`, `resilliency`, `api-design`, `observability` KBs as category vocabularies |
| 11 | Phase 10 — SysML Activity Diagram | `activity_diagram_manifest.v1` (`_phase_status: phase-10-complete`) + N `.activity.mmd` text files | Manifest: `diagrams[]{use_case_id, ucbd_source, mermaid_file, requirements_linked[], decisions_modeled[], forks_modeled[], swimlanes[]}`, `summary{total_diagrams, total_requirements_traced, requirements_without_activity_link[]}`. Mermaid files are raw text (not JSON). | Manifest: `internal:diagram-renderer`. Mermaid: `page:/projects/[id]/diagrams (extend page.tsx — today only has page.tsx; add per-UC activity sub-routes)` or `section:/projects/[id]/requirements/ucbds/[ucId] > Activity Diagram (proposed)` | `requirements_without_activity_link[]` promoted to required (enforces round-trip traceability); `decisions_modeled[]` + `forks_modeled[]` as typed arrays (today free-text); fork/join concurrency math | `message-queues-kb.md` (per plan §6.0 — concurrency.fork_join_count + token-flow math); methodology §Software-system translation cites `api-design-sys-design-kb.md` (request/response), `resilliency-patterns-kb.md` (retry/circuit-breaker), `cap_theorem.md` (graceful degradation) |
| 12 | Phase 11 — Multi-UseCase Expansion | `phase_11_expansion_report.v1` (`_phase_status: phase-11-complete`) + re-emitted per-UC artifacts from Phases 3-10 | `first_wave_ucbds[]`, `second_wave_ucbds[]`, `skipped_ucbds[]{use_case_id, reason}`, `new_requirements_added_in_expansion`, `new_constants_added_in_expansion`, `new_swimlanes_introduced[]`, `cross_cutting_requirements_lifted[]{index, requirement, abstract_function_name, reason_lifted}`, `dedup_merges[]{kept, retired[], reason}`, `constant_consolidations[]{kept, retired[], reason}`, `module_1_drift_detected[]{use_case_id, issue, resolution}`, `summary{}` | `section:/projects/[id]/requirements > Expansion Audit (proposed)`; `module_1_drift_detected` → `internal:module-1-validator` | `cross_cutting_requirements_lifted[].index` with `CC.R<yy>` pattern (formally distinct from `UC<xx>.R<yy>` — need Zod regex); `uc_overlap_matrix` Jaccard similarity fields (per plan §6.0 — **new math field**, not yet in methodology JSON shape) | **inline** (Jaccard similarity per plan §6.0); methodology §Software-system translation cites same KB set as Phase 9 delving |
| 13 | Phase 12 — Final Review + FFBD Handoff | **TWO artifacts**: `ffbd_handoff.v1` + `module_2_final_review.v1` (`_phase_status: phase-12-complete`) | **ffbd_handoff.v1:** `system_name`, `system_description`, `boundary{}`, `functions[]{name, description_hint, source_requirements[], appears_in_use_cases[]}`, `use_case_flows[]{use_case_id, use_case_name, function_sequence[], branching[]{after_function, branches[]{guard, next_function}}}`, `constants[]`, `cross_cutting_concerns[]`, `module_1_constraints_carried_forward[]`, `summary{}`. **module_2_final_review.v1:** `checklist_results{block_1_scope_ingestion, ..., block_6_consistency, total_passed, total_failed}`, `failures[]`, `deliverable_inventory{}`, `metrics{}`, `ready_for_module_3` | `ffbd_handoff.v1` → `internal:module-3-ffbd-generator` (primary consumer); downstream projections render at `/projects/[id]/system-design/ffbd` (existing). `module_2_final_review.v1` → `section:/projects/[id] > Module 2 Closeout (proposed)` | **`operational_primitives`** block on `ffbd_handoff.v1` per plan master §4.5.4 — NOT in methodology doc today; contains Little's Law inputs `{actions_per_uc, bytes_in_per_action, bytes_out_per_action, freq_per_dau, session_shape, data_objects[]}`. Each key has its own `math_derivation{}`. | Per plan §6.0: master §4.5.4 inline math (Little's Law: L = λW; throughput × budget math); operational_primitives sourced from `software_architecture_system.md` + `api-design-sys-design-kb.md` + `message-queues-kb.md` |

---

## Shared Envelope Structures (Cross-Cutting)

Two schemas appear on ~every emission. Proposing both as named types in `module-2/_shared.ts` (per plan §4 end-state):

### 1. `phaseEnvelopeSchema`

Present on every Phase 0-12 JSON emission. Discriminated by `_phase_status`.

| Field | Type | UI surface | Notes |
|---|---|---|---|
| `_schema` | literal string (e.g., `"system_context_summary.v1"`) | `internal:schema-validator` | Discriminant per-phase |
| `_output_path` | string (path template with `<project>` placeholder) | `internal:marshaller-router` | — |
| `_phase_status` | enum — one of `"phase-0-complete"..."phase-12-complete"` + `"phase-2-acked"` | `internal:phase-dispatcher` | Progresses through Phases 3→4→5 on UCBD shape |
| `metadata` | `metadataHeaderSchema` (below) | `section:<page> > Header` on every page | Reused across every xlsx-marshalled artifact |

### 2. `metadataHeaderSchema`

The 17-field project header repeated across `UCBD_Template_and_Sample.schema.json`, `Requirements-table.schema.json`, `Requirement_Constants_Definition_Template.schema.json`, and every future xlsx-marshalled artifact. Sourced from Phase 0's `system_context_summary.project_metadata`.

| Field | Type | Source |
|---|---|---|
| `project_name`, `document_id`, `document_type`, `status`, `last_update`, `target_release`, `confidentiality`, `created_date`, `target_release_2`, `author`, `approvers`, `stakeholders`, `supersedes`, `linked_ticket`, `parent_okr`, `regulatory_refs` | strings | Phase 0 `project_metadata` (inherited) |

**UI-surface:** `section:<any xlsx-marshalled page> > Metadata Header` — rendered once as a header strip on any page showing the underlying artifact. Also fed to xlsx marshaller (`internal:xlsx-marshaller`). Dual-surfaced.

### 3. `mathDerivationSchema` (new, per plan §6.0 + §4.5.4)

New in sweep. Appears on **every numeric field** that flows down to Module 3-7. Pilot landed in Phase 8; sweep expands to Phases 1, 3-5, 6 (per-requirement), 9, 10, 11, 12.

| Field | Type | UI surface |
|---|---|---|
| `formula` | string (human-readable identity or heuristic) | `section:<page> > Design Rationale` (optional) + `internal:downstream-modules` |
| `source` | enum (KB filename set — Zod enum derived per plan §5 bullet 4) | same |
| `inputs` | object `Record<string, number | string>`; `{}` for text-valued constants | same |

### 4. `softwareArchDecisionSchema` (new, per plan §5 bullet 4 + §6.0)

Pilot in Phase 8; sweep applies wherever a requirement/constant encodes an architecture trade-off.

| Field | Type | UI surface |
|---|---|---|
| `ref` | enum — derived from F13/2 KB filename set: `"cap_theorem" | "resiliency" | "caching" | "load_balancing" | "api_design" | "observability" | "maintainability" | "cdn_networking" | "message_queues" | "data_model" | "deployment_cicd" | "none"` | `internal:downstream-modules(M4-DM, M5-QFD, M7-FMEA)` |
| `choice` | string | same; optionally surfaced as `section:Constants > Design Rationale > Trade-off` |

---

## Commentary — Ambiguous / Contested Fields

Items below are classifications where I made a call that David should sanity-check before Gate B.

### C1. Metadata envelope — rendered or internal?

`_schema`, `_output_path`, `_phase_status` are pure control-plane. Classified `internal:` everywhere. But `metadata{}` (the 17-field project header) is dual-surfaced: xlsx-marshalled AND page-header-rendered. Proposing `section:<page> > Header` for the render path, `internal:xlsx-marshaller` for the marshall path. If David wants it single-surfaced (e.g., never render in UI, only pull from Phase 0 view), the section surface drops.

### C2. Phase 2 — modeled or skipped?

Phase 2 (Thinking Functionally) emits **no JSON**. It's a user-confirmation checkpoint. Three options for Gate B:

- **(a)** Skip it entirely from `module-2/` — no `phase-2-*.ts` file. Breaks plan §4's uniform 13-file layout.
- **(b)** Create `phase-2-thinking-functionally.ts` as a `phaseEnvelopeSchema`-only ack shape (`_phase_status: "phase-2-acked"`, no payload). Keeps layout uniform; makes "did the user ack Phase 2?" a typed first-class signal.
- **(c)** Don't create the file, but register the ack in a cross-cutting checkpoint registry.

Recommend **(b)** — cheapest and clean. Flag to David for confirmation.

### C3. UCBD progressive population (Phases 3→4→5)

Three phases, one xlsx output, shape progressively populated. Two modeling options:

- **(a)** One `ucbdSchema` with every field optional, discriminated by `_phase_status` literal. Runtime check that Phase-3 completes have at-minimum `metadata` + `_columns_plan`, Phase-4 additionally requires `initial_conditions`/`ending_conditions`, Phase-5 additionally requires `actor_steps_table`.
- **(b)** Three schemas stacked via `.extend()`: `ucbdPhase3Schema` → `ucbdPhase4Schema` → `ucbdPhase5Schema`.

Recommend **(b)** — compile-time-safe, reads well, and the marshaller can use the Phase-5 schema authoritatively for the xlsx.

### C4. Phase 6/7/8/9/11 all re-emit `requirements_table.json`

Phase 6 creates it; Phases 7, 8, 9, 11 mutate and re-emit. The schema must support all states (`_phase_status` distinguishes). Most fields progressively add (e.g., `rules_passed` arrives in Phase 7). Pattern: one `requirementsTableSchema` with per-row fields marked optional, plus a phase-gated validity checker (parallel to C3). No separate Zod per phase — one file, `phase-6-requirements-table.ts`, consumed by all five phases.

### C5. `_columns_plan` and `_insertions` — first-class or comment?

Today both are inline annotations the methodology calls "internal, marshaller ignores." Recommendation: promote both to first-class typed Zod fields. `_columns_plan` (Phase 3) is actually a critical Phase-4 input (Phase 4 writes conditions against the committed column set). `_insertions` (Phases 4/5) is a structural hint consumed by the openpyxl marshaller. Typing them prevents drift between methodology prose and runtime behavior.

### C6. `math_derivation` and `software_arch_decision` — rendered to user?

The Phase 8 methodology footer says "the marshaller drops them" (xlsx-internal). But they flow down to Modules 3/4/5/7 and are the provenance trail for every numeric constant. Three options for the UI surface:

- **(a)** `internal:` only — never shown to user.
- **(b)** `section:Constants > Design Rationale` — optional sidebar panel showing "why this value" (KB citation + formula).
- **(c)** `page:/projects/[id]/requirements/design-rationale (proposed)` — dedicated provenance page.

I've proposed **(b)** — transparency for reviewers without cluttering the primary constants view. David's call on whether to expose at all.

### C7. Phase 12 — one Zod file or two?

Plan §4 shows `phase-12-ffbd-handoff.ts`. But Phase 12 actually emits `ffbd-handoff.json` (for Module 3) AND `module_2_final_review.json` (closeout scorecard). They have different consumers, different retention, different UI treatment. Recommend splitting in Step 2:

- `phase-12-ffbd-handoff.ts` — `ffbd_handoff.v1`, `internal:module-3-ffbd-generator`
- `phase-12-final-review.ts` — `module_2_final_review.v1`, `section:/projects/[id] > Module 2 Closeout`

Flag to David for confirmation — if he'd rather one discriminated-union schema, that's fine too.

### C8. `operational_primitives` on FFBD handoff

Per plan master §4.5.4, this is **net-new**, not in the current methodology doc. Fields (Little's Law inputs):
- `actions_per_uc: number`
- `bytes_in_per_action: number`
- `bytes_out_per_action: number`
- `freq_per_dau: number`
- `session_shape: enum`
- `data_objects: Array<{name, attributes[], est_size_bytes}>`

Each of these gets its own `math_derivation{}`. This is the biggest net-new data block in the sweep; Step 2 should handle this in `phase-12-ffbd-handoff.ts` carefully. Need a confirmation from David on the exact shape — the plan §4.5.4 reference is prose-level, not typed.

### C9. `source_lens` enum in Phase 9 delving

Phase 9 methodology lists 15 systematic lenses × 24 software categories × a `"contractor_test"` literal. Today free-text. Proposing Zod union enum with 40 literal members. Verbose but airtight. Alternative: three separate enums (lenses / categories / contractor-test) with a discriminated union — cleaner types, same coverage. Flag as Step-2 design call.

### C10. SysML `.mmd` files — schema or not?

Phase 10 emits text files (Mermaid), not JSON. The `activity_diagram_manifest.v1` catalogs them. No Zod needed for `.mmd` content itself (it's a render artifact). The manifest gets a Zod schema. Flag: should the sweep add a Mermaid *validation* helper (round-trip check that every requirement ID in `.mmd` exists in `requirements_table.json`)? Not in plan scope — noting for a follow-up sweep.

### C11. `also_appears_in` and `source_ucbd` — xlsx-dropped but displayed?

Phase 6 methodology says these are JSON-only, xlsx-dropped. But they're valuable for the reviewer (shows requirement reuse). Classification: `internal:phase-11-dedup + internal:module-3-ffbd-mapper` AND `section:/projects/[id]/requirements > Requirement Detail > Reuse Map`. Dual-surface.

### C12. Phase 11 `cross_cutting_requirements_lifted[]` — unique index pattern

Phase 11 introduces `CC.R<yy>` indexes (separate from `UC<xx>.R<yy>`). The requirements table schema needs to accept both patterns. Recommend a Zod refinement on the `index` field: `/^(UC[0-9]{2}|CC)\.R[0-9]{2}$/`. Flag: if David wants to allow three-digit UC numbers (UC100+), the pattern needs `[0-9]{2,3}`.

---

## Dependency + Risk Notes

- **Peer-A territory respected.** No edits contemplated in `apps/product-helper/lib/langchain/agents/*` or `projections.ts`. This sweep reads `schemas.ts` for existing Module 2 types (`useCaseSchema`, `enhancedUseCaseSchema`, `requirementsTableRowSchema`, `constantsTableRowSchema`) and re-homes them into `module-2/` without modifying the monolith until agent-rewire at Gate C Step 3.
- **F14/2 `Requirement_Constants_Definition_Template.schema.json` currently lacks `math_derivation` and `software_arch_decision` columns.** The xlsx template has 9 columns A-I; the new fields are LLM-internal (marshaller drops them). No F14 schema edit needed for Gate B — just the Zod declaration. This matches plan §3.1's note that F13→F14 migration is scope-discipline, not cleanup.
- **Risk: Phase 6's `abstract_function_name` regex.** Methodology rules say `snake_case`, verb-object, no tech names. Easy to regex the first two; "no tech names" is semantic and can't be Zod-enforced. Proposing `.regex(/^[a-z]+(_[a-z]+)+$/)` + a runtime check against a "banned tech tokens" list (postgres, kafka, redis, dynamodb, …). Flag: banned list is prose today; Step 2 lifts it into `_shared.ts` as a const array.

---

## Gate A Checklist — What David Reviews

- [ ] Inventory table accurately reflects the 13 methodology `.md` files
- [ ] UI-surface classifications match intent (especially C1, C6, C7, C11 dual-surface calls)
- [ ] New-in-sweep fields are complete (esp. `operational_primitives`, `math_derivation` expansion beyond Phase 8, `_columns_plan` / `_insertions` promotion)
- [ ] KB-source bindings per §6.0 table are accurate
- [ ] Commentary items C1-C12 have acceptable defaults OR David flags alternates
- [ ] Shared envelope design (`phaseEnvelopeSchema`, `metadataHeaderSchema`, `mathDerivationSchema`, `softwareArchDecisionSchema`) is the right factoring for `_shared.ts`
- [ ] Phase 2 handling (option (b): envelope-only ack schema) confirmed
- [ ] UCBD progressive-population strategy (option (b): `.extend()` stacking) confirmed
- [ ] Phase 12 split (two files) confirmed
- [ ] Ready to unlock Gate B (Step 2: `_shared.ts` + Phases 6/8/12 priority Zods + round-trip tests)

---

## What happens on green

Once David approves this inventory, Gate B unlocks. Step 2 runs the parallel sub-tasks per plan §8:
- S2.a `_shared.ts` (with the 4 shared schemas above)
- S2.b `phase-6-requirements-table.ts` (migrated + annotated + re-emit support across phases)
- S2.c `phase-8-constants-table.ts` (binds `math_derivation` + `software_arch_decision`)
- S2.d `phase-12-ffbd-handoff.ts` (adds `operational_primitives`; possibly split per C7)
- S2.e `module-2/index.ts` barrel
- S2.f `pnpm generate:schemas` run
- S2.g round-trip unit tests

Peer-A remains on Phase N agent rewire in parallel; I coordinate via `set_summary` updates so `projections.ts` can pick up additive Zod fields after they land.
