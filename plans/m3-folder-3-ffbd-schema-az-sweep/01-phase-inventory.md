# M3 Folder-3 FFBD Schema Sweep — Gate A Phase-Emission Inventory

**Plan:** `plans/m3-folder-3-ffbd-schema-az-sweep.md` (committed `a22abfd`)
**Artifact:** Gate A — phase-by-phase JSON-emission inventory (plan §8 Step 1)
**Author:** Jessica (single-session execution)
**Date:** 2026-04-21
**Status:** DRAFT — pending David's Gate A close

---

## 1. Scope & Method

Research inputs consumed:
- **13 M2 Zod files** at `apps/product-helper/lib/langchain/schemas/module-2/` (Peer-3's Gate B, 16 commits `ef99078..db7b12e`)
- **14 F13/3 methodology KBs** at `apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/New-knowledge-banks/3-ffbd-llm-kb/`
- **6 cross-referenced system-design KBs** at `apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/New-knowledge-banks/5-HoQ_for_software_sys_design/` + `c1v/system-design/system-design-math-logic.md` (project root)
- **Existing UI routes** under `apps/product-helper/app/(dashboard)/projects/[id]/`
- **Existing monolith Zod:** `apps/product-helper/lib/langchain/schemas.ts:662` (the sparse `ffbdSchema` Jordan's M3 output will eventually replace)

This inventory produces the 12-row table required by plan §8 Step 1 plus four supporting registers (composition, KB, UI surface, decision points). **No Zod code written.** No schemas generated. No file moves. Gate B remains un-entered.

Per plan §4 phase numbering: Phase 0A (M2 handoff ingest) + Phases 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 = **12 rows**.

---

## 2. Phase-Emission Inventory (12 rows)

| # | Phase | JSON shape summary (Zod emission) | UI surface | New-in-sweep fields (incl §6.0 math) | KB sources | Ambiguities / commentary |
|---|---|---|---|---|---|---|
| 0A | Ingest M2 Handoff | Mirror of composite `ffbd_handoff.v1`: `{system_name, system_description?, boundary{the_system, external_actors[{name, type}]}, functions[{name, description_hint, source_requirements[], appears_in_use_cases[]}], use_case_flows[{use_case_id, use_case_name, function_sequence[], branching[]}], constants[{name, value, units, estimate_final, owned_by}], cross_cutting_concerns[{index, name, description}], module_1_constraints_carried_forward[], summary{total_functions, total_use_cases, total_constants, total_cross_cutting}}` | `internal:m2-handoff-ingester` · `section:Project Overview > Handoff Summary` | No new math (validate presence only per plan §6.0). Cross-check: every `uc_id` in Phase 12 `operational_primitives` must appear in ingested `use_case_flows[].use_case_id` | methodology `00A_INGEST-MODULE-2-HANDOFF.md` | **COMPOSITION AMBIGUITY — §5 decision point #1.** Composite `ffbd_handoff.v1` is sourced from 6+ M2 phase outputs, not a single file. 4 GAPS: `system_description`, `constants.estimate_final`, `constants.owned_by`, `cross_cutting_concerns.index`, `external_actors.type` (see §3 composition map). |
| 1 | FFBD Foundations | `{ffbd_definition, core_principles[], iteration_mindset, tool_choice (enum: FFBD\|activity\|idef0\|flowchart), validation_summary{definition_clear, mindset_captured, functional_reasoning_applied, system_concept_articulated, tool_justified}}` — low-shape envelope emission per plan §10 decision #1 spirit (not full envelope-only) | `internal:onboarding-state` · `section:Foundations Panel` (tooltip/hover over FFBD page header) | `function_count.math_derivation` — dedup ratio = `unique_functions / raw_statement_count` (inline heuristic) per plan §6.0 | methodology `01_FFBD-FOUNDATIONS.md` | Largely conceptual; emission mostly validates the learner/agent absorbed framing. **Shape is minimal by intent.** |
| 2 | Functional vs Structural | **Plan §4 says envelope-only ack** (mirror Peer-3's M2 C2). **Methodology says enforcement rule with 4-item validation + correction template.** If envelope-only: `{ack: true, acknowledged_at}`. If methodology-full: `{rule_statement, naming_audit[{block_id, candidate_name, is_functional (bool), correction_applied}], granularity_level_selected (enum: very_high\|high\|medium\|low\|very_low)}` | If envelope-only: `page-header` only · If methodology-full: `section:Naming Validator` + `internal:ai-agent-correction-prompt` | None (no math) | methodology `02_FUNCTIONAL-VS-STRUCTURAL.md` | **§5 decision point #2 (NEW — not in plan).** Envelope-only drops a genuine enforcement artifact. Recommend David overrides plan §10 default #1 to emit the methodology-full shape — block-name audit is high-value for Pipeline B generators. |
| 3 | Creating Functional Blocks | `{functional_blocks[{block_id (regex: ^F\\.\\d+(\\.\\d+)*$), functional_name (verb+object, snake_case→Title Case), parent_block_id?, hierarchy_number, formatting{square_corners, centered_text, font_size_header, font_size_body}, source_requirement_refs[] (via sourceRefSchema)}]}` — array-heavy, one row per block | `page:/projects/[id]/system-design/ffbd` (EXISTING) · `section:Block Library` · `internal:block-validation-renderer` | `block_granularity.decomposition_depth_max` cognitive-load heuristic per plan §6.0 (inline) | methodology `03_CREATING-FUNCTIONAL-BLOCKS.md` | Course hard minimum ≥6 blocks. **Open: enforce via Zod `.min(6)` at `functional_blocks` or leave to Phase 10 validation layer?** Methodology introduces hierarchy-number format without specifying regex — propose `^F\\.\\d+(\\.\\d+)*$`. |
| 4 | Arrows and Flow | `{arrows[{arrow_id, from_block_id, to_block_id, arrow_type (enum: trigger\|precedes), line_style (enum: solid\|dashed), label?{text, position (start\|middle\|end), italicized}, time_bound?{value, unit (ms\|s\|min), math_derivation}}]}` | `page:/projects/[id]/system-design/ffbd` (EXISTING) · `section:Arrow Editor` · `internal:overlap-detector` | `edge_count.math_derivation` + `fan_in.math_derivation` + `fan_out.math_derivation` — complexity budget per plan §6.0 | methodology `04_ARROWS-AND-FLOW.md`; `software_architecture_system.md` §1 SLO/SLA, §7 practical engineering (5-HoQ dir) | Course hard minimum: both trigger AND precedes types present. `time_bound` is optional today — promoting to first-class optional Zod field unlocks §6.0 fan-in math binding. |
| 5 | Logic Gates | `{gates[{gate_id, gate_type (enum: IT\|OR\|AND), gate_symbol, paired_with_gate_id, parent_scope_block_id, termination_condition? (required when gate_type=IT), condition_labels[]? (required when gate_type=OR — array[{outgoing_arrow_id, guard_text, is_default_branch (bool)}]), resource_allocation[]? (optional when gate_type=AND, array[{path_id, percent}])}]}` | `page:/projects/[id]/system-design/ffbd` (EXISTING) · `section:Control Flow Designer` · `internal:gate-parity-checker` | `gate_count_by_type` — no math per plan §6.0, just shape | methodology `05_LOGIC-GATES.md` | Course hard minimum ≥2 gate pairs. **OR gate vs decision diamond (◇) notation mix** — methodology Phase 10 Mistake 4 treats them as distinct but Phase 5 doesn't formally define decision diamond. Recommend Zod: `gate_type` stays 3-enum; decision diamond handled as separate `decisions[]` array if David wants it first-class. |
| 6 | Shortcuts and Reference Blocks | **Methodology content (readability):** `{arrow_shortcuts[{label (A-Z), source_block_id, dest_block_id, scope: within_diagram_only}], reference_blocks[{ref_block_id (regex ^F\\.\\d+ Ref$), referenced_diagram_title, boundary_side (entry\|exit)}]}`. **Schema-inserted (caching):** `{cache_strategy: softwareArchDecisionSchema (ref: 'caching' per enum), cache_ttl_sec{value, unit: 'seconds', math_derivation (kb_source: 'caching-system-design-kb.md')}}` | `page:/projects/[id]/system-design/ffbd` (EXISTING) · `section:Shortcut Manager` · `section:Cache Strategy` | **Master §4.5.4 hotspot #1.** `cache_strategy` via `softwareArchDecisionSchema.ref = 'caching'`; `cache_ttl_sec.math_derivation` required (numeric) | methodology `06_SHORTCUTS-AND-REFERENCE-BLOCKS.md` for shortcut/ref-block shape; `caching-system-design-kb.md` (5-HoQ dir, 12KB, 227 lines) §1 external cache, §5 invalidation, §6 write patterns for inserted fields | **Reviewer confusion risk:** diagrammatic content (shortcuts, refs) and architectural decision (caching) share one envelope. Use Peer-3's `insertionSchema` first-class (per `_shared.ts` C5) to tag cache fields as injections, not methodology content. |
| 7 | Hierarchical FFBDs | `{hierarchical_ffbds[{parent_block_id, sub_diagram_title (format: 'Function <N[.M...]> : <Name>'), sub_block_ids[], hierarchy_depth (int), child_count (int), reference_block_entries[{ref_block_id, boundary_side}]}], repeated_block_handling[{block_pattern, resolution (enum: arrow_shortcut\|repeat\|rename_with_suffix)}]}` | `page:/projects/[id]/system-design/ffbd` (EXISTING) · `section:Hierarchy Browser` · `internal:decomposition-planner` | `hierarchy_depth.max` + `child_count_per_parent.median` per plan §6.0 (inline — no KB) | methodology `07_HIERARCHICAL-FFBDS.md` | No hard depth limit; methodology has soft "~15 blocks per diagram" readability heuristic. Recommend Zod: soft `.describe()` bound, not `.max()` hard bound. |
| 8 | EFFBD Data Blocks | `{data_blocks[{data_block_id, data_block_name (noun, not verb+object), block_type (enum: external_input\|internal_data_flow\|constraint\|specification\|reference_data\|configuration), shape: 'rounded', fill_color? (hex), arrow_style: 'angled', source_indication, consumers[] (functional_block_ids), est_size_bytes?{value, math_derivation}}]}` | `page:/projects/[id]/system-design/ffbd` (EXISTING) · `section:Data Flow Editor` · `internal:data-mapping-panel` | `data_block.est_size_bytes.math_derivation` per plan §6.0 = `per_object_bytes × cardinality`; KB source `data-model-kb.md` | methodology `08_EFFBD-DATA-BLOCKS.md`; `data-model-kb.md` (5-HoQ dir, 12KB, 260 lines) §1 relational, §5 scaling for sizing math | Methodology heuristic "3–5 data blocks per diagram" — soft, no Zod enforcement proposed. `fill_color` optional. `block_type` 6-enum matches methodology exactly. |
| 9 | Building and Iterating | `{iteration_rounds[{round_number (1..7), goal, output_artifact_refs[]}], uncertainty_markings[{block_id, color (enum: green\|yellow\|red), rationale, follow_up_questions[]}], team_reviews[{review_id, reviewer, reviewed_at, feedback_items[], incorporation_status (enum: incorporated\|deferred\|rejected)}], iteration_count}` | `internal:iteration-tracker` · `section:Review Panel` · `section:Uncertainty Map` | `iteration_count` — no math per plan §6.0 | methodology `09_BUILDING-AND-ITERATING.md` | Process-heavy not shape-heavy. Team dynamics encoded minimally — `incorporation_status` captures the essential signal without trying to model team interaction. Scope creep risk flagged in plan §9. |
| 10 | Validation | `{validation_results[{mistake_type (enum: 6-member — structural_names\|unpaired_gates\|missing_it_termination\|or_vs_decision_confusion\|too_much_detail_one_level\|floating_overlapping_arrows), status (pass\|fail), finding?, correction_applied?}], extra_checks{completeness[6 items], correctness[5 items], formatting[8 items], quality[4 items]}, final_walkthrough{random_block_id_picked, trace_pass (bool)}, validation_pass_rate{value, math_derivation (formula: 'passed / total')}}` | `page:/projects/[id]/system-design/ffbd` (EXISTING) · `section:Validation Checklist` · `internal:automated-linter` | `validation_pass_rate = passed / total` per plan §6.0 (inline) | methodology `10_VALIDATION-AND-COMMON-MISTAKES.md` | Full-expansion checklist = 27 items (6 mistakes + 23 extra). Proposed Zod shape collapses extra checks into 4 named arrays with primitive pass/fail + optional finding — avoids exploding to 27 discrete fields. |
| 11 | FFBD → Decision Matrix Bridge | Mirrors F13/3 `decision_matrix_handoff.v1`: `{system_name, system_description, upstream_artifacts{module_2_handoff, ffbd_pptx, ingestion_report}, functions_flat_list[{block_id, name, abstract_name, level (enum: top\|sub\|leaf), parent_diagram, uncertainty (green\|yellow\|red), driving_requirements[], notes?}], candidate_performance_criteria[{criterion, dimension (enum: speed\|reliability\|accuracy\|cost\|capacity\|security\|observability), driving_functions[], solution_independent (bool), suggested_kb_reference, why_this_matters, math_derivation (REQUIRED per plan §4.5.4)}], alternatives_to_compare[{option_id, name, summary}], uncertainty_flagged_functions[], key_interfaces_preview[{id, from_block, to_block, nature, payload_hint}], performance_budgets_inherited_from_module_2[], peak_RPS{value, unit: 'req/s', math_derivation}, summary, ready_for_module_4 (bool)}` | `page:/projects/[id]/system-design/decision-matrix` (EXISTING — confirms Module 4 consumer route) · `section:DM Handoff Dashboard` · `internal:module-4-orchestrator` | **Master §4.5.4 hotspot #2.** `peak_RPS.math_derivation` via Little's Law `DAU × sessions × actions × peak_factor / 86,400`. **Every `candidate_performance_criteria[i].math_derivation` REQUIRED** (not optional). Availability math serial/parallel for resilience criteria. | methodology `11_FROM-FFBD-TO-DECISION-MATRIX.md` for shape; **`system-design-math-logic.md §2 (Little's Law), §9 (formula reference card)` at `/Users/davidancor/Projects/c1v/system-design/system-design-math-logic.md` — PROJECT ROOT, not under phases/13**; criterion KBs: `api-design-sys-design-kb.md`, `resilliency-patterns-kb.md`, `caching-system-design-kb.md` (all 5-HoQ dir) | M4 DM consumer contract not yet written. M3 emits blind against methodology §11 `decision_matrix_handoff.v1` shape. If M4 sweep (next phase) discovers a mismatch, Phase 11 iterates. |

**All 12 phases extend `phaseEnvelopeSchema`** from `module-2/_shared.ts` per plan §4 DoD bullet 2.

---

## 3. Phase 0A Composition Map — Composite `ffbd_handoff.v1`

Resolves the ambiguity surfaced in §2 row 0A. Field-level sourcing from M2 phase Zods:

| `ffbd_handoff.v1` field | Sourced from M2 phase(s) | Notes |
|---|---|---|
| `system_name` | **Phase 0** — `intake_summary` prose | `phase-0-ingest.ts` lines 15–46 |
| `system_description` | **GAP** | No M2 field; must fall back to Module 1 metadata or agent prompt at ingest time |
| `boundary.the_system` | **Phase 3** — implicit from UC context | Derive from `uc_name` pattern |
| `boundary.external_actors[].name` | **Phase 3** — `ucbdHeaderSchema.actor` | `phase-3-ucbd-setup.ts` lines 34–38; dedup across UCs |
| `boundary.external_actors[].type` | **GAP** | `actor` field is freeform string; "human" vs "external system" classification needed at ingest |
| `functions[].name` | **Phase 5** — `steps[].action` (snake_case from verb phrase) | `phase-5-ucbd-step-flow.ts` lines 34–38 |
| `functions[].description_hint` | **Phase 5** — `steps[].notes` or generated from action | Loose binding |
| `functions[].source_requirements[]` | **Phase 6** — `rows[].req_id` where `source_ucbd` matches | `phase-6-requirements-table.ts` lines 16–22 |
| `functions[].appears_in_use_cases[]` | **Phase 11** — `merged_from[]` dedup trace | `phase-11-multi-uc-expansion.ts` lines 62–78 |
| `use_case_flows[].use_case_id` | **Phase 3** — `uc_id` | `phase-3-ucbd-setup.ts` lines 28–33 |
| `use_case_flows[].use_case_name` | **Phase 3** — `uc_name` | Same |
| `use_case_flows[].function_sequence[]` | **Phase 5** — ordered `steps[].action` snake_case | Preserves order |
| `use_case_flows[].branching[]` | **Phase 5** — `steps[].alternate_branch` + `system_response` synthesis | Convert `alternate_branch` + guard to `{after_function, branches[{guard, next_function}]}` |
| `constants[].name`, `.value`, `.units` | **Phase 8** — `phase8RowSchema.{constant_name, value, unit}` | `phase-8-constants-table.ts` lines 51–62 |
| `constants[].estimate_final` | **GAP** | Not tracked in Phase 8; infer from `_phase_status` or agent at ingest |
| `constants[].owned_by` | **GAP** | Not tracked in Phase 8 |
| `cross_cutting_concerns[].index` | **GAP** | Phase 3 CC rows use `uc_id: "CC"` but don't assign indices |
| `cross_cutting_concerns[].name`, `.description` | **Phase 3** — UCBD rows with `uc_id: "CC"` | Map `uc_name` → `name`, derive description |
| `module_1_constraints_carried_forward[]` | **Phase 0** — `intake_summary` extraction | `phase-0-ingest.ts` lines 15–46 |
| `summary{}` | **Composite (aggregate counts)** | Computed at ingest from the above |

**Plus Phase 12 per-UC checkpoint** (`phase-12-ffbd-handoff.ts` lines 129–138): `{uc_id, operational_primitives{actions_per_uc, bytes_in/out_per_action, freq_per_dau (each with math_derivation), session_shape, data_objects[]}}`. Used by Phase 0A as per-UC cross-check — every `uc_id` in Phase 12 must appear in the composite `use_case_flows[]`.

**Recommendation:** **Option Hybrid** per Agent 2 research — Phase 0A Zod mirrors the composite shape and ingests from 6 M2 phase outputs; Phase 12 is a gating checkpoint (per-UC operational primitives must cross-reference the composite).

---

## 4. KB Source Registry

All 6 cross-referenced KBs confirmed live. Canonical paths:

| KB (cited in plan) | Canonical path | Size | Primary use |
|---|---|---|---|
| `caching-system-design-kb.md` | `apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/New-knowledge-banks/5-HoQ_for_software_sys_design/caching-system-design-kb.md` | 12 KB / 227 lines | Phase 6 cache-layer `software_arch_decision.ref = 'caching'` + TTL math |
| `system-design-math-logic.md` | `/Users/davidancor/Projects/c1v/system-design/system-design-math-logic.md` **(project root, NOT under phases/13)** | 20 KB / 337 lines | Phase 11 `peak_RPS` (Little's Law §2), availability math (§9). Also used by Phase 4 fan-in (indirectly). |
| `data-model-kb.md` | `…/5-HoQ_for_software_sys_design/data-model-kb.md` | 12 KB / 260 lines | Phase 8 `data_block.est_size_bytes.math_derivation` |
| `software_architecture_system.md` | `…/5-HoQ_for_software_sys_design/software_architecture_system.md` | 12 KB / 311 lines | Phase 4 edge count / fan-in complexity |
| `api-design-sys-design-kb.md` | `…/5-HoQ_for_software_sys_design/api-design-sys-design-kb.md` | 14 KB / 343 lines | Phase 11 candidate criteria (API-facing performance) |
| `resilliency-patterns-kb.md` | `…/5-HoQ_for_software_sys_design/resilliency-patterns-kb.md` | 12 KB / 193 lines | Phase 11 candidate criteria (reliability); filename matches plan's double-L typo |

**`softwareArchRefSchema` coverage:** all 12 enum values (`cap_theorem`, `resiliency`, `caching`, `load_balancing`, `api_design`, `none`, `observability`, `maintainability`, `cdn_networking`, `message_queues`, `data_model`, `deployment_cicd`) have corresponding KB files in the 5-HoQ dir. No orphans.

**Plan §6.0 drift note:** plan refers to `software_architecture_system.md` (snake_case, singular) — exact filename matches.

---

## 5. UI Surface Confirmation

All plan §5 route claims verified against `apps/product-helper/app/(dashboard)/projects/[id]/`:

| Plan §5 claim | Actual route | Status |
|---|---|---|
| `…/system-design/ffbd` exists | `app/(dashboard)/projects/[id]/system-design/ffbd/page.tsx` + `<FFBDViewer>` component | ✅ EXISTS |
| `…/diagrams` exists | `app/(dashboard)/projects/[id]/diagrams/page.tsx` | ✅ EXISTS |
| Bonus: `…/system-design/qfd` | exists | ✅ Module 5 consumer route present |
| Bonus: `…/system-design/decision-matrix` | exists + `<DecisionMatrixViewer>` | ✅ **Confirms Phase 11 handoff target** |
| Bonus: `…/system-design/interfaces` | exists + `<InterfacesViewer>` | ✅ Module 6 consumer route present |

**All M3 `x-ui-surface=page:…` candidates in the §2 inventory point to EXISTING routes.** No `(proposed)` markings needed for M3 primary routes.

**Critical finding for Gate C §8 S3.f:** `<FFBDViewer>` currently imports `type Ffbd = z.infer<typeof ffbdSchema>` from `lib/langchain/schemas.ts:662` (the sparse monolith). **The agent-import rewire at Gate C S3.f is load-bearing** — without it, M3's comprehensive Zod doesn't reach the UI. This strengthens my §7 recommendation of Option (a) narrow carve-out from Peer-A for Gate C.

---

## 6. New-in-Sweep Math Field Summary (§6.0 table reconciliation)

Cross-check of plan §6.0 per-phase math table against methodology-actual + composition findings:

| Plan §6.0 phase | Plan-specified math | Inventory finding | Status |
|---|---|---|---|
| 0A ingest | Validate `operational_primitives` from M2 — no new math | Cross-check gate (every Phase 12 `uc_id` in composite) | ✅ confirmed |
| 1 FFBD foundations | `function_count.math_derivation` (dedup ratio) | Inline heuristic, no KB | ✅ confirmed |
| 3 functional blocks | `block_granularity.decomposition_depth_max` heuristic | Inline, no KB | ✅ confirmed |
| 4 arrows and flow | `edge_count` + `fan_in/fan_out.math_derivation` | Maps to `software_architecture_system.md` §7 | ✅ confirmed |
| 5 logic gates | `gate_count_by_type` (no math) | Shape only | ✅ confirmed |
| 6 shortcuts + cache | `cache_strategy` decision + `cache_ttl_sec.math_derivation` | `caching-system-design-kb.md` (5-HoQ dir) | ✅ confirmed |
| 7 hierarchical | `hierarchy_depth.max` + `child_count_per_parent.median` | Inline | ✅ confirmed |
| 8 EFFBD data blocks | `data_block.est_size_bytes.math_derivation` | `data-model-kb.md` (5-HoQ dir) | ✅ confirmed |
| 9 iteration | `iteration_count` (no math) | Shape only | ✅ confirmed |
| 10 validation | `validation_pass_rate = passed / total` | Inline | ✅ confirmed |
| 11 FFBD→DM | `peak_RPS.math_derivation` (Little's Law) + every criterion `math_derivation` required | `system-design-math-logic.md §2, §9` (PROJECT ROOT) + criterion KBs (5-HoQ) | ✅ confirmed |

**No §6.0 drift.** All math hotspots map to confirmed-live KBs.

---

## 7. Decision Points for David's Gate A Close

Six decisions need your call before Gate B kickoff:

### 7.1 Phase 0A composition — recommend **Hybrid**
- **(A)** Phase 0A mirrors composite `ffbd_handoff.v1` (6-phase ingest, one authoritative Zod shape)
- **(B)** Phase 0A mirrors only per-UC Phase 12 slice; other fields ingested piecemeal in M3 phases 1–5
- **(Hybrid, recommended)** Phase 0A = composite shape, ingests from 6 M2 phases, uses Phase 12 per-UC as readiness checkpoint. Preserves methodology doc's "validated seed graph" promise. Catches drift early.

### 7.2 Phase 2 treatment — recommend **override plan §10 default #1 → methodology-full shape**
- Plan §10 decision default: envelope-only ack (mirror Peer-3's M2 C2)
- Methodology actual: principle-heavy enforcement (4-item validation, block-name audit, correction template)
- **Recommendation:** emit block-name audit Zod (`naming_audit[{block_id, candidate_name, is_functional, correction_applied}]`). Pipeline B generators benefit from the audit trail. Envelope-only drops genuine signal.

### 7.3 Phase 0A composite GAPS — recommend **fill via agent prompt at ingest time, not block**
Four fields have no M2 source: `system_description`, `constants.estimate_final`, `constants.owned_by`, `cross_cutting_concerns.index`, `external_actors.type` (count = 5).
- **Recommendation:** mark these as `.optional()` in Phase 0A Zod; at ingest time, LLM agent infers/prompts fill-in. Don't block Gate B on adding them upstream to M2 — that's Peer-3 territory.

### 7.4 Hard-minimum enforcement — recommend **Zod soft-describe, Phase 10 hard-validate**
Course hard minimums (Phase 3 ≥6 blocks, Phase 4 both arrow types, Phase 5 ≥2 gate pairs) could enforce via Zod `.min()` or defer to Phase 10 validation.
- **Recommendation:** Zod carries these as `.describe("min=6 per F13/3 course rubric")` documentation only. Phase 10 `validation_results[].mistake_type` enforces at validation time. Keeps intermediate artifacts parse-clean during iteration.

### 7.5 S3.d premise is invalid — recommend **contract S3.d to no-op**
Grep confirmed: `create_ffbd_thg_v3.py` and `generate_ffbd_fixes.py` don't read any `.schema.json` file today (no matches for `json.load`, `.load(`, `.loads(` in either). Plan §8 S3.d ("Python path update to `generated/module-3/`") assumes a consumption path that doesn't exist.
- **Recommendation:** drop S3.d from Gate C scope. File a follow-up phase if/when Python marshallers need schema-driven generation. Keeps M3 focused on Bug 2 unblock (Pipeline B generators).

### 7.6 Plan §8 S3.f ↔ dispatch brief conflict — recommend **(a) narrow carve-out**
Plan S3.f requires rewiring `lib/langchain/agents/*.ts` imports from the monolith `schemas.ts` to `module-3/index.ts`. Dispatch brief says don't touch agents/. UI finding (§5) confirms this is load-bearing: `<FFBDViewer>` currently imports `type Ffbd` from the monolith; without rewire, M3's comprehensive Zod doesn't reach the FFBD page.
- **Recommendation (a):** narrow carve-out — you negotiate with Peer-A so Jessica can rewire M3-only imports at Gate C. Scope limited to `lib/langchain/agents/*.ts` + `lib/langchain/schemas.ts` lines importing/exporting M3 types.

---

## 8. Ready-for-Gate-B Checklist

When David approves this Gate A inventory, Gate B unblocks with:

- [ ] Phase 0A composition decision (§7.1)
- [ ] Phase 2 shape decision (§7.2)
- [ ] GAP policy for composite ingest (§7.3)
- [ ] Hard-minimum enforcement layer decision (§7.4)
- [ ] S3.d scope adjustment (§7.5)
- [ ] S3.f carve-out with Peer-A (§7.6) — can defer until Gate C if Peer-A negotiation runs long
- [ ] Peer-3 Gate B already COMPLETE — `ffbd_handoff.v1` contract locked, 13 M2 Zods + 14 generated JSONs in place
- [ ] M2 `_shared.ts` primitives (envelope, math, softwareArchDecision, sourceRef, sourceLens, metadata, columnPlan, insertion) ready for M3 import/reuse

Gate B scope per plan §8 Step 2 will then execute: S2.a (shared reuse barrel) → S2.b (Phase 0A Zod) → S2.c (Phase 6 cache-layer) → S2.d (Phase 11 DM bridge) → S2.e (`module-3/index.ts` barrel) → S2.f (`pnpm tsx lib/langchain/schemas/generate-all.ts` → emit `generated/module-3/phase-{0a,6,11}.schema.json`) → S2.g (round-trip unit tests).

---

## 9. Non-Goals at Gate A

- No Zod code authored.
- No `pnpm tsx lib/langchain/schemas/generate-all.ts` run.
- No `git mv` of F13/3 → F14/3.
- No modifications to `lib/langchain/schemas/module-2/` (Peer-3 territory, read-only confirmed).
- No modifications to `lib/langchain/agents/*.ts` or `lib/langchain/schemas.ts` monolith.
- No commit of this artifact yet — commits at Gate A close.

---

**Gate A artifact complete. Surfacing to David for review via this session; iterate on findings; commit at Gate A close.**
