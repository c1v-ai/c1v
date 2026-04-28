---
title: TE1 fail-closed audit — STOP-GAP conversion plan
team: c1v-kb-runtime-engine
agent: engine-fail-closed
ec: EC-V21-E.4
ship_branch: wave-e/te1-engine-fail-closed
upstream_tag: te1-engine-core-complete (cddf1bf)
created: 2026-04-27
---

# TE1 fail-closed audit — STOP-GAP conversion plan

> Closes **EC-V21-E.4**. Read-only walk of phase markdown under
> `apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/`.
> Surfaces the STOP-GAP rule shapes that `engine-stories` will encode into the
> 13 per-phase `engine.json` rule trees consumed by the SHIPPED runner at
> `apps/product-helper/lib/langchain/engines/fail-closed-runner.ts` (8.4K, Apr 22).

## §0 Pre-flight & runner verification

- Hard-dep tag `te1-engine-core-complete` present at `cddf1bf`. ✓
- Plural `engines/fail-closed-runner.ts` exists (8.4K, Apr 22) — NOT re-authored. ✓
- Sibling schema `engines/fail-closed.ts` exists (3.2K, Apr 22). ✓
- Existing test suite ran green:

  ```
  PASS lib/langchain/engines/__tests__/fail-closed-runner.test.ts
  Test Suites: 1 passed, 1 total
  Tests:       17 passed, 17 total
  Time:        0.104 s
  ```

  Coverage groups:
  - `buildFailClosedRegistry` — 4 tests (registers rule set, rejects duplicate
    artifact_keys, rejects malformed rule id, rejects unknown check kind).
  - `checkFailClosedRules` default-FAIL on missing registration — 2 tests
    (throws on unregistered key, passes on explicit empty rule list).
  - `checkFailClosedRules` per check kind — 9 tests covering all 7 check kinds
    (`field_non_empty`, `field_matches`, `field_equals`, `field_in`,
    `field_range`, `array_min_length`, `fields_required_together`) plus dot-syntax
    nested paths.
  - severity — 2 tests (warn does not flip `passed`; mixed warn+error flips).

## §1 Audit summary

Walked all phase markdown under the 9-module Knowledge-Banks-deepened tree.
Day-0 inventory cited "80 phase files + 9 `_shared/` symlinks (117 symlinks
total)". The literal phase-doc count under `01-phase-docs/` plus
`00-master-prompt.md` plus crawley/cornell sibling docs that prescribe phase
exit gates is **89 files** with at least one STOP-GAP/Validation-Checklist
block. The Day-0 "80" is a coarse approximation — it appears to count only
canonical numbered phase docs, not crawley sibling chapters or master-prompt
gates. This audit treats every file with a `## STOP GAP`, `## STOP-GAP`,
`## Validation Checklist`, `### STOP GAP`, or `### Hard Minimums` block as
in-scope, since each is a fail-closed gate the runner will enforce.

| Metric | Value |
|---|---|
| Total phase files scanned | 124 (all `.md` under modules 1–9, excluding `_shared/`, `_dev-runbooks/`, glossaries, review-plans) |
| Files with STOP-GAP/Validation-Checklist blocks | **89** |
| Files with no stop-gaps (recorded as such) | 35 |
| Total STOP-GAP/Validation-Checklist blocks | **94** (some files have multiple blocks; M8 Phase-4 has 4, M3 DELIVERABLES has 2) |
| Approximate machine-readable rules to encode | **~310 stop-gap bullets + ~70 user-confirmation gates ≈ 380 rules** |
| Module 9 (stacks-atlas) stop-gaps | **0** (atlas pipeline; rule-tree NA — engine-stories should ship empty `rules: []` per `checkFailClosedRules` opt-out semantics) |
| `_shared/` files with stop-gaps | 0 (cross-cutting KBs are reference material, not phase gates — symlinks counted once per source per dispatch rule) |

### Severity distribution

The runner's schema supports only `error` | `warn` (no `info`/`silent`). Every
STOP-GAP block in source-of-truth phase markdown is a **proceed-blocker** —
the human-text formula is "STOP: Do not proceed to Phase N+1 until ALL items
pass" or "Do NOT proceed until the user confirms". All such items map to
`severity: 'error'`. The only `warn`-class material I found is the M5
form-function dualism check ("emit advisory" if more than 20% continuous
decisions in M4 crawley DN-foundations) — those are explicit `advisory`
phrasings inside otherwise-blocking blocks. Net distribution:

| severity | count | rationale |
|---|---|---|
| `error` (block) | ~370 | every numbered checklist bullet + every "do NOT proceed" gate |
| `warn` | ~10 | M4 crawley DN-foundations Box 14.1 advisory; M2 Phase-13 pptx "will NOT fail if optional files absent" softness |

`engine-stories` should default every encoded rule to `severity: 'error'`
unless the source-of-truth phrasing uses "advisory", "soft check", "warning",
or "will NOT fail" — in which case downgrade to `warn`.

## §2 Per-module audit table

Columns: `phase-slug` / `source path (relative to .planning/phases/13-Knowledge-banks-deepened/)` / `blocks` (count of `## STOP GAP|STOP-GAP|Validation Checklist|### STOP GAP|### Hard Minimums` headers) / `bullet rules` (count of `- [ ]` items inside those blocks; 0 means the block uses numbered prose questions instead of checkboxes — see §3 for encoding pattern) / `consumer-note`.

### Module 1 — defining-scope (1-defining-scope/)

`artifact_key` prefix proposal: `module_1/<phase_slug>`.

| phase-slug | source | blocks | bullets | consumer-note |
|---|---|---|---|---|
| master-prompt | `1-defining-scope/00-master-prompt.md` | 1 | 0 | "STOP GAP — Before You Begin" pre-flight: 3 user-attestations (`fail_closed_rules_acknowledged: true`, `methodology_acknowledged: true`, `stop_gap_protocol_acknowledged: true`). Encode as 3 × `field_equals` rules on `boot_state.attestations.*`. Plus 5 fail-closed rules R1–R5 (see [§4 R1–R5 catalog](#§4-fail-closed-rules-r1r5-catalog-module-1-only)) referenced from every phase artifact. |
| phase-0-project-intake | `1-defining-scope/01-phase-docs/03-Phase-0-Project-Intake-Unname.md` | 1 | 0 | Phase-0 exit gate; PM-attestation pattern. |
| phase-1-context-diagram | `1-defining-scope/01-phase-docs/04-Phase-1-Context-Diagram.md` | 1 | 0 | Mid-phase iteration break (Step 6) — encode as `field_equals { iteration_break_done: true }` + `field_range { external_entities_count, min: 12, max: 20 }`. |
| phase-2-use-case-diagram | `1-defining-scope/01-phase-docs/05-Phase-2-Use-Case-Diagram.md` | 1 | 0 | Step-11 quality gate; 6 user attestations + `stop_gap_cleared: true` flip. |
| phase-3-scope-tree | `1-defining-scope/01-phase-docs/06-Phase-3-Scope-Tree.md` | 1 | 0 | P3 has no exit gate per master-prompt — block exists but is mid-phase; encode as advisory or SKIP per master-prompt rule. |
| phase-4-review-and-handoff | `1-defining-scope/01-phase-docs/07-Phase-4-Review-and-Module-2-Handoff.md` | 1 | 0 | Final P4 sign-off; gates Module-2 handoff. |

### Module 2 — requirements (2-requirements/)

| phase-slug | source | blocks | bullets | consumer-note |
|---|---|---|---|---|
| master-prompt | `2-requirements/00-master-prompt.md` | 1 | 0 | Pre-flight 3-attestation pattern (mirror M1 master). |
| phase-0-ingest-m1-scope | `2-requirements/01-phase-docs/03-Phase-0-Ingest-Module-1-Scope.md` | 1 | 0 | 5-question user-confirmation gate; encode each as `field_equals { confirmations.q1: 'yes', ... }`. |
| phase-1-prioritize-use-cases | `2-requirements/01-phase-docs/04-Phase-1-Prioritize-Use-Cases.md` | 1 | 0 | Single user-attestation gate. |
| phase-2-thinking-functionally | `2-requirements/01-phase-docs/05-Phase-2-Thinking-Functionally.md` | 1 | 0 | Single user-attestation gate. |
| phase-3-ucbd-setup | `2-requirements/01-phase-docs/06-Phase-3-UCBD-Setup.md` | 1 | 0 | Columns + metadata confirmation. |
| phase-4-start-end-conditions | `2-requirements/01-phase-docs/07-Phase-4-Start-End-Conditions.md` | 1 | 0 | Single user-attestation gate. |
| phase-5-ucbd-step-flow | `2-requirements/01-phase-docs/08-Phase-5-UCBD-Step-Flow.md` | 1 | 0 | Single user-attestation gate; warns about renumber consequences. |
| phase-6-extract-requirements-table | `2-requirements/01-phase-docs/09-Phase-6-Extract-Requirements-Table.md` | 1 | 0 | Index-stability gate; user must confirm. |
| phase-7-requirements-rules-audit | `2-requirements/01-phase-docs/10-Phase-7-Requirements-Rules-Audit.md` | 1 | 0 | Hard-block on `needs_user_input` count > 0; encode `field_equals { open_needs_user_input_count: 0 }`. |
| phase-8-constants-table | `2-requirements/01-phase-docs/11-Phase-8-Constants-Table.md` | 1 | 0 | Each constant must have user-action; encode `array_min_length { unspecified_constants, min: 0 }`. |
| phase-9-delve-and-fix | `2-requirements/01-phase-docs/12-Phase-9-Delve-and-Fix.md` | 1 | 0 | New-requirement confirmation + Phase-8 loopback. |
| phase-10-sysml-activity | `2-requirements/01-phase-docs/13-Phase-10-SysML-Activity-Diagram.md` | 1 | 0 | Diagram acceptance gate. |
| phase-11-multi-usecase-expansion | `2-requirements/01-phase-docs/14-Phase-11-Multi-UseCase-Expansion.md` | 1 | 0 | Per-use-case loop gate + final-table confirmation. |
| phase-12-final-review-ffbd-handoff | `2-requirements/01-phase-docs/15-Phase-12-Final-Review-and-FFBD-Handoff.md` | 1 | 0 | Final M2→M3 handoff sign-off. |
| phase-13-generate-ucbd-pptx | `2-requirements/01-phase-docs/16-Phase-13-Generate-UCBD-Pptx.md` | 1 | 0 | Optional-files note ("will NOT fail if absent") = `severity: 'warn'`. |
| crawley-ch11-needs-to-goals | `2-requirements/05-crawley/crawley-ch11-needs-to-goals.md` | 1 | 0 | "Goals completeness + tradability" gate; numbered-prose. |
| crawley-ch13-decomposition | `2-requirements/05-crawley/crawley-ch13-decomposition-heuristics.md` | 1 | 0 | "2-Down-1-Up + elegance" gate; numbered-prose. |

### Module 3 — ffbd (3-ffbd/)

Highest checklist density of any module. Every numbered file ships rich
checkbox bullets — direct one-to-one rule encoding.

| phase-slug | source | blocks | bullets | consumer-note |
|---|---|---|---|---|
| ingest-m2-handoff | `3-ffbd/01-phase-docs/00A_INGEST-MODULE-2-HANDOFF.md` | 1 | 10 | Ingestion-report gate; checkboxes verify every M2 function/flow/constant accounted for. |
| ffbd-foundations | `3-ffbd/01-phase-docs/01_FFBD-FOUNDATIONS.md` | 1 | 5 | Phase-2 entry-gate. |
| functional-vs-structural | `3-ffbd/01-phase-docs/02_FUNCTIONAL-VS-STRUCTURAL.md` | 1 | 4 | Phase-3 entry-gate. |
| creating-functional-blocks | `3-ffbd/01-phase-docs/03_CREATING-FUNCTIONAL-BLOCKS.md` | 1 | 9 | Per-block format + ID + functional-name checks. |
| arrows-and-flow | `3-ffbd/01-phase-docs/04_ARROWS-AND-FLOW.md` | 1 | 9 | Both arrow-types present; convention checks. |
| logic-gates | `3-ffbd/01-phase-docs/05_LOGIC-GATES.md` | 1 | 9 | ≥2 logic-gate pairs (Hard Minimum). |
| shortcuts-reference-blocks | `3-ffbd/01-phase-docs/06_SHORTCUTS-AND-REFERENCE-BLOCKS.md` | 1 | 8 | Shortcut-only-when-needed gate. |
| hierarchical-ffbds | `3-ffbd/01-phase-docs/07_HIERARCHICAL-FFBDS.md` | 1 | 8 | Hierarchy-depth + ref-block checks. |
| effbd-data-blocks | `3-ffbd/01-phase-docs/08_EFFBD-DATA-BLOCKS.md` | 1 | 8 | Top-level data-block count (per worked example: 4). |
| building-iterating | `3-ffbd/01-phase-docs/09_BUILDING-AND-ITERATING.md` | 1 | 9 | Team sign-off gate. |
| validation-common-mistakes | `3-ffbd/01-phase-docs/10_VALIDATION-AND-COMMON-MISTAKES.md` | 1 | 5 | Phase-11 entry-gate. |
| from-ffbd-to-decision-matrix | `3-ffbd/01-phase-docs/11_FROM-FFBD-TO-DECISION-MATRIX.md` | 1 | 8 | M3→M4 handoff gate. |
| deliverables-and-guardrails | `3-ffbd/01-phase-docs/DELIVERABLES-AND-GUARDRAILS.md` | 2 | 0 | Two `### Hard Minimums (STOP-GAP)` blocks (basic + elaborated FFBD); checkboxes rendered without `- [ ]` numbered bullets — encode as `array_min_length { functional_blocks, min: 6 }` + `array_min_length { logic_gate_pairs, min: 2 }` + `field_equals { both_arrow_types_present: true }`. |

### Module 4 — decision-net-crawley-on-cornell (4-decision-net-crawley-on-cornell/)

14 cornell sibling docs + 3 crawley sibling docs + 1 master-prompt. Cornell
docs all use `## Validation Checklist (STOP-GAP)` with checkbox bullets.
Crawley docs use `### STOP GAP` with numbered prose.

| phase-slug | source | blocks | bullets | consumer-note |
|---|---|---|---|---|
| cornell-01-creating-objective-matrix | `4-…/cornell/01 - Creating an Objective Decision Matrix.md` | 1 | 4 | Step-02 entry-gate. |
| cornell-02-key-terminology | `4-…/cornell/02 - Talking the Talk - Key Terminology.md` | 1 | 4 | |
| cornell-03-identifying-criteria | `4-…/cornell/03 - Identifying Performance Criteria.md` | 1 | 4 | |
| cornell-04-avoiding-pitfalls | `4-…/cornell/04 - Avoiding Performance Criteria Pitfalls.md` | 1 | 5 | |
| cornell-05-direct-and-scaled-measures | `4-…/cornell/05 - Using Direct and Scaled Measures.md` | 1 | 6 | |
| cornell-06-defining-ranges | `4-…/cornell/06 - Defining Appropriate Ranges for Conditions.md` | 1 | 6 | |
| cornell-07-metric-conditions-subjective | `4-…/cornell/07 - Establishing Metric Conditions for Subjective Criteria.md` | 1 | 6 | |
| cornell-08-measurement-scale | `4-…/cornell/08 - Crafting an Effective Measurement Scale.md` | 1 | 6 | |
| cornell-09-normalizing-scores | `4-…/cornell/09 - Normalizing Criteria Scores.md` | 1 | 7 | |
| cornell-10-assigning-weights | `4-…/cornell/10 - Assigning Weights to Criteria.md` | 1 | 5 | Weights-sum-to-100 invariant — encode `field_equals { weights_sum_pct: 100.0 }`. |
| cornell-11-consensus-criteria-weights | `4-…/cornell/11 - Building Consensus Using Criteria Weights.md` | 1 | 6 | |
| cornell-12-min-max-criteria | `4-…/cornell/12 - Establishing Min and Max Criteria Scores.md` | 1 | 5 | |
| cornell-13-interpreting-scores | `4-…/cornell/13 - Appropriately Interpreting Matrix Scores.md` | 1 | 5 | |
| cornell-14-using-throughout-project | `4-…/cornell/14 - Using Your Decision Matrix Throughout the Project.md` | 1 | 5 | |
| crawley-01-decision-network-foundations | `4-…/crawley/01-Decision-Network-Foundations.md` | 1 | 0 | Box 14.1 + DSS task invariants; numbered-prose 4-rule block (variable-type ≥80% categorical = `warn`-advisory; constraint-taxonomy `field_in`; DSS tasks 1-3 `field_equals { covered: true }`; tree-vs-network advisory). |
| crawley-02-tradespace-pareto-sensitivity | `4-…/crawley/02-Tradespace-Pareto-Sensitivity.md` | 1 | 0 | Robustness + 4-quadrant ordering invariants. |
| crawley-03-optimization-patterns | `4-…/crawley/03-Optimization-Patterns.md` | 1 | 0 | 7±2 cap + pattern-validity gate; encode `field_range { active_patterns_count, min: 5, max: 9 }`. |

### Module 5 — form-function (5-form-function/)

All 5 phase docs use the `### STOP GAP — <invariant name>` numbered-prose
pattern (no checkboxes). Each declares 3-5 invariants.

| phase-slug | source | blocks | bullets | consumer-note |
|---|---|---|---|---|
| phase-1-form-taxonomy | `5-form-function/01-phase-docs/01-Phase-1-Form-Taxonomy.md` | 1 | 0 | "Dualism check before exit": 4 invariants — `array_min_length { form_entities[is_physical=true], min: 1 }` (Box 4.7), `field_in { formal_relationship.kind, values: <enum> }`, two-levels-down rule, boundary-crossing→interface emit. |
| phase-2-function-taxonomy | `5-form-function/01-phase-docs/02-Phase-2-Function-Taxonomy.md` | 1 | 0 | "Value pathway closure + PO array causality" — every PO must trace to a closed value pathway. |
| phase-3-form-function-concept | `5-form-function/01-phase-docs/03-Phase-3-Form-Function-Concept.md` | 1 | 0 | "Value-architecture principle check". |
| phase-4-solution-neutral-concept | `5-form-function/01-phase-docs/04-Phase-4-Solution-Neutral-Concept.md` | 1 | 0 | "Conops-vs-concept distinction". |
| phase-5-concept-expansion | `5-form-function/01-phase-docs/05-Phase-5-Concept-Expansion.md` | 1 | 0 | "Level-cap + review-state invariants". |

### Module 6 — hoq (6-hoq/)

All 11 docs (master + 10 phase) use `## Validation Checklist (STOP-GAP)` with
checkbox bullets. Cleanest direct-encode in the corpus.

| phase-slug | source | blocks | bullets | consumer-note |
|---|---|---|---|---|
| master-prompt | `6-hoq/00-master-prompt.md` | 1 | 6 | Pre-flight gate. |
| 01-front-porch-performance-criteria | `6-hoq/01-phase-docs/01_FRONT-PORCH--PERFORMANCE-CRITERIA.md` | 1 | 7 | `array_min_length { performance_criteria, min: 5 }` + `field_equals { weights_sum_pct: 100.0 }` + 5 other field-presence checks. |
| 02-back-porch-scoring-competitors | `6-hoq/01-phase-docs/02_BACK-PORCH--SCORING-AND-COMPETITORS.md` | 1 | 8 | |
| 03-second-floor-engineering-characteristics | `6-hoq/01-phase-docs/03_SECOND-FLOOR--ENGINEERING-CHARACTERISTICS.md` | 1 | 7 | |
| 04-main-floor-relationship-matrix | `6-hoq/01-phase-docs/04_MAIN-FLOOR--RELATIONSHIP-MATRIX.md` | 1 | 7 | |
| 05-roof-ec-interrelationships | `6-hoq/01-phase-docs/05_ROOF--EC-INTERRELATIONSHIPS.md` | 1 | 7 | |
| 06-basement-part1-imputed-importance | `6-hoq/01-phase-docs/06_BASEMENT-PART1--IMPUTED-IMPORTANCE.md` | 1 | 7 | |
| 07-basement-part2-competitor-ec-values | `6-hoq/01-phase-docs/07_BASEMENT-PART2--COMPETITOR-EC-VALUES.md` | 1 | 8 | |
| 08-basement-part3-difficulty-cost-reeval | `6-hoq/01-phase-docs/08_BASEMENT-PART3--DIFFICULTY-COST-REEVALUATION.md` | 1 | 7 | |
| 09-design-targets | `6-hoq/01-phase-docs/09_DESIGN-TARGETS.md` | 1 | 7 | |
| 10-final-review-written-answers | `6-hoq/01-phase-docs/10_FINAL-REVIEW-AND-WRITTEN-ANSWERS.md` | 1 | 7 | M6→M7 handoff. |

### Module 7 — interfaces (7-interfaces/)

11 phase docs, all use `## Validation Checklist (STOP-GAP)` checkboxes.

| phase-slug | source | blocks | bullets | consumer-note |
|---|---|---|---|---|
| 01-why-interfaces-matter | `7-interfaces/01-phase-docs/01 - Why Interfaces Matter.md` | 1 | 4 | |
| 02-interfaces-are-failure-points | `7-interfaces/01-phase-docs/02 - Interfaces Are Failure Points.md` | 1 | 4 | |
| 03-brainstorming-data-flow-diagrams | `7-interfaces/01-phase-docs/03 - Brainstorming with Data Flow Diagrams.md` | 1 | 5 | |
| 04-formalizing-n-squared-charts | `7-interfaces/01-phase-docs/04 - Formalizing with N-Squared Charts.md` | 1 | 7 | |
| 05-crc-cards-team-discovery | `7-interfaces/01-phase-docs/05 - CRC Cards for Team Discovery.md` | 1 | 5 | |
| 06-sequence-diagrams-interactions | `7-interfaces/01-phase-docs/06 - Sequence Diagrams - Describing Interactions.md` | 1 | 8 | |
| 07-advanced-sequence-diagram-notation | `7-interfaces/01-phase-docs/07 - Advanced Sequence Diagram Notation.md` | 1 | 7 | |
| 08-creating-interface-matrix | `7-interfaces/01-phase-docs/08 - Creating the Interface Matrix.md` | 1 | 6 | |
| 09-adding-values-and-units | `7-interfaces/01-phase-docs/09 - Adding Values and Units.md` | 1 | 5 | `fields_required_together { fields: [value, units] }` is canonical here. |
| 10-building-consensus-interface-champion | `7-interfaces/01-phase-docs/10 - Building Consensus with an Interface Champion.md` | 1 | 7 | |
| 11-interface-matrix-enhancements | `7-interfaces/01-phase-docs/11 - Interface Matrix Enhancements.md` | 1 | 6 | |

### Module 8 — risk (8-risk/)

8 phase docs. All use `## STOP GAP -- Checkpoint N` with **numbered-prose
user-confirmation questions** (not checkboxes). Each question maps to a
`field_equals { user_confirmed: true }` rule on a per-question id.
Phase-4 has **4 sub-checkpoints (4A/4B/4C/4D)** — most complex in the corpus.

| phase-slug | source | blocks | bullets | consumer-note |
|---|---|---|---|---|
| master-prompt | `8-risk/00-master-prompt.md` | 0 | 0 | Master-prompt has no inline gate; refs every phase. |
| phase-0-prerequisites | `8-risk/01-phase-docs/02-Phase-0-Prerequisites.md` | 1 | 0 | Subsystem-list user-confirm. |
| phase-1-failure-modes | `8-risk/01-phase-docs/03-Phase-1-Failure-Modes.md` | 1 | 0 | 3-question user-confirm gate. |
| phase-2-failure-effects | `8-risk/01-phase-docs/04-Phase-2-Failure-Effects.md` | 1 | 0 | |
| phase-3-possible-causes | `8-risk/01-phase-docs/05-Phase-3-Possible-Causes.md` | 1 | 0 | |
| phase-4-rating-systems-rpn | `8-risk/01-phase-docs/06-Phase-4-Rating-Systems-and-RPN.md` | **4** | 0 | 4 sub-checkpoints (4A severity, 4B occurrence, 4C detection, 4D RPN-aggregation). Each is its own `engine.json` rule subtree. |
| phase-5-corrective-actions | `8-risk/01-phase-docs/07-Phase-5-Corrective-Actions.md` | 1 | 0 | |
| phase-6-adjusted-ratings-stoplights | `8-risk/01-phase-docs/08-Phase-6-Adjusted-Ratings-and-Stoplights.md` | 1 | 0 | |
| phase-7-detectability | `8-risk/01-phase-docs/09-Phase-7-Detectability-Optional.md` | 1 | 0 | "(Optional)" — encode as `severity: 'warn'` per phasing-doc title. |

### Module 9 — stacks-atlas (9-stacks-atlas/)

| phase-slug | source | blocks | bullets | consumer-note |
|---|---|---|---|---|
| master-prompt | `9-stacks-atlas/00-master-prompt.md` | 0 | 0 | **No stop-gaps found** — atlas is a data-pipeline/scrape phase, not a methodology gate. |
| changelog | `9-stacks-atlas/01-phase-docs/CHANGELOG.md` | 0 | 0 | No stop-gaps. |
| pipeline | `9-stacks-atlas/01-phase-docs/PIPELINE.md` | 0 | 0 | No stop-gaps. |
| sources | `9-stacks-atlas/01-phase-docs/SOURCES.md` | 0 | 0 | No stop-gaps. |

**Module-9 directive for `engine-stories`:** ship `engine.json` for any
M9-anchored artifact with `rules: []` (explicit empty list). The runner's
opt-out semantics require this — an unregistered `artifact_key` throws.

## §3 Encoding patterns — three rule shapes the corpus uses

The 89 STOP-GAP blocks fall into exactly three structural patterns. This is
the conversion key for `engine-stories`.

### Pattern A — Validation-checklist with `- [ ]` checkboxes (M3, M4-cornell, M6, M7)

Each checkbox is a single rule. Strong signal in the bullet text:
- "At least N …" → `array_min_length { field, min: N }`
- "All weights sum to 100%" → `field_equals { weights_sum_pct: 100 }` (or
  `field_range { weights_sum_pct, min: 99.99, max: 100.01 }` for float
  tolerance — author's choice; recommend `field_range` to avoid float-equality
  pitfalls).
- "Each criterion has a clear, measurable definition" → `field_non_empty`
  on the `description` (or per-row `array_min_length` against a refined set).
- "All weights sum to exactly 100.00%" → `field_range` with tight bounds.

**Example encoding (M6 phase-1 front-porch — 7-bullet checklist):**

```json
{
  "artifact_key": "module_6/01-front-porch-performance-criteria",
  "rules": [
    {
      "id": "PC_MIN_FIVE",
      "description": "At least 5 performance criteria are listed",
      "check": { "kind": "array_min_length", "field": "performance_criteria", "min": 5 },
      "severity": "error"
    },
    {
      "id": "PC_DEFINITION_NON_EMPTY",
      "description": "Each criterion has a clear, measurable definition",
      "check": { "kind": "field_non_empty", "field": "performance_criteria[].definition" },
      "severity": "error"
    },
    {
      "id": "PC_WEIGHT_PRESENT",
      "description": "Each criterion has a relative importance weight",
      "check": { "kind": "field_non_empty", "field": "performance_criteria[].weight_pct" },
      "severity": "error"
    },
    {
      "id": "PC_WEIGHTS_SUM_TO_100",
      "description": "All weights sum to exactly 100.00% (verify the arithmetic)",
      "check": { "kind": "field_range", "field": "weights_sum_pct", "min": 99.99, "max": 100.01 },
      "severity": "error"
    },
    {
      "id": "PC_WEIGHT_JUSTIFIED",
      "description": "Weights are justified — you can explain why each criterion received its importance score",
      "check": { "kind": "field_non_empty", "field": "performance_criteria[].weight_justification" },
      "severity": "error"
    },
    {
      "id": "PC_INTERNAL_DISTINGUISHED",
      "description": "Internal criteria (if any) are clearly distinguished from customer criteria",
      "check": { "kind": "field_non_empty", "field": "performance_criteria[].internal_or_customer" },
      "severity": "error"
    },
    {
      "id": "PC_NOT_VAGUE",
      "description": "No criterion is so vague that two people would interpret it differently",
      "check": { "kind": "field_equals", "field": "vagueness_review_passed", "value": true },
      "severity": "error"
    }
  ]
}
```

**Note on path syntax:** the runner's `getPath()` is dot-only — does NOT
support `[]` array-element traversal. `engine-stories` will need to either
(a) flatten the array into a per-element check via the
`kb-rewrite`-rewritten phase shape, or (b) extend `getPath()` to support
`array[].field` traversal in a follow-up runner change. Recommend (a) — the
γ-shape rewrite owned by `kb-rewrite` is the right place to expose
`weights_sum_pct` and `vagueness_review_passed` as top-level computed fields
on the artifact, so the runner stays pure dot-traversal.

### Pattern B — Numbered-prose invariants (M5, M4-crawley, M3-deliverables Hard Minimums, M1, M2)

Each numbered prose item is a rule. Encoding is mechanical once
`kb-rewrite` lifts the human-text invariant into a structured field name.
Example for **M5 phase-1 dualism check**:

```json
{
  "artifact_key": "module_5/phase-1-form-taxonomy",
  "rules": [
    {
      "id": "FORM_PHYSICAL_PRESENT",
      "description": "Box 4.7: at least one form_entity is_physical=true unless system is purely informational-abstraction",
      "check": { "kind": "array_min_length", "field": "physical_form_entities", "min": 1 },
      "severity": "error"
    },
    {
      "id": "FORMAL_RELATIONSHIP_KIND_ENUM",
      "description": "Every formal_relationship.kind drawn from the enum (not free-text)",
      "check": { "kind": "field_in", "field": "formal_relationships_kinds_violations_count", "values": [0] },
      "severity": "error"
    },
    {
      "id": "TWO_LEVELS_DOWN",
      "description": "Two-levels-down rule: Level-2 entities exist where warranted",
      "check": { "kind": "field_equals", "field": "two_levels_down_satisfied", "value": true },
      "severity": "error"
    },
    {
      "id": "BOUNDARY_INTERFACE_EMITTED",
      "description": "Every boundary-crossing relationship emits an interface record",
      "check": { "kind": "field_equals", "field": "boundary_interfaces_complete", "value": true },
      "severity": "error"
    }
  ]
}
```

### Pattern C — User-confirmation gates (M2 phases 0-12, M8 all phases, M1 phases 0+4)

These are not data-shape rules — they're attestation gates. Each numbered
question maps to a single `field_equals` rule on a per-question
attestation flag. Pattern recommended:

```json
{
  "artifact_key": "module_8/phase-1-failure-modes",
  "rules": [
    {
      "id": "FM_COMPLETENESS_CONFIRMED",
      "description": "User confirmed: failure modes complete for each subsystem (Q1)",
      "check": { "kind": "field_equals", "field": "checkpoint_1.q1_completeness_confirmed", "value": true },
      "severity": "error"
    },
    {
      "id": "FM_NOT_CAUSE_OR_EFFECT",
      "description": "User confirmed: no listed item is actually a cause/effect (Q2)",
      "check": { "kind": "field_equals", "field": "checkpoint_1.q2_not_cause_or_effect_confirmed", "value": true },
      "severity": "error"
    },
    {
      "id": "FM_SUBSYSTEM_COVERAGE_CONFIRMED",
      "description": "User confirmed: no missing subsystems (Q3)",
      "check": { "kind": "field_equals", "field": "checkpoint_1.q3_subsystem_coverage_confirmed", "value": true },
      "severity": "error"
    }
  ]
}
```

`engine-stories` should keep the per-question id stable
(`q1_completeness_confirmed`) so authors can cross-reference the markdown
quickly.

## §4 Fail-closed rules R1–R5 catalog (Module 1 only)

Module 1's master-prompt declares **5 named fail-closed rules R1–R5** that are
referenced from every M1 phase artifact (per
`1-defining-scope/00-master-prompt.md` line 29 + `01-phase-docs/04-Phase-1`
line 23). These are cross-cutting — same rule fires from multiple phase
artifacts. `engine-stories` should encode them ONCE in a shared M1 rule
fragment, then reference from each M1 phase's `engine.json` via rule-id.

| ID | Rule (paraphrased from master-prompt) | Encoding |
|---|---|---|
| R1 | Single system-node inside boundary | `field_equals { boundary.system_node_count: 1 }` |
| R2 | Refuse to add nodes inside the boundary subgraph | `field_equals { boundary.extra_nodes_count: 0 }` |
| R3 | No properties masquerading as entities | `array_min_length { property_violations, min: 0, max: 0 }` (or `field_equals { property_violation_count: 0 }`) |
| R4 | Iteration-break required after first pass | `field_equals { iteration_break_done: true }` (only after Sub-phase A) |
| R5 | Refuse to violate boundary subgraph identity | `field_equals { boundary_subgraph_violations: 0 }` |

Verbatim: `1-defining-scope/00-master-prompt.md` line 29 ("FAIL-CLOSED RULES
(refuse to violate)"), line 67 (table column "STOP GAPs"), line 75 ("Total: 4
STOP GAPs"). `engine-stories` should sanity-check by re-reading line 29-line
135 of that master-prompt before authoring R1-R5.

## §5 Open questions for `engine-stories`

These surfaced during the walk and should be resolved before authoring the
13 `engine.json` trees:

1. **Path syntax for arrays.** Runner's `getPath()` is dot-only. Do we extend
   to `array[].field` syntax (runner change → re-test with new
   `__tests__/fail-closed-runner.test.ts` cases) or expose computed
   top-level fields via `kb-rewrite`? Recommend the latter — runner stays
   pure, γ-rewrite owns flattening.

2. **`severity: 'warn'` policy.** A handful of source-of-truth phrasings
   ("emit advisory", "(Optional)", "will NOT fail if absent") are clearly
   warn-class. Most stop-gaps are block-class. `engine-stories` should
   default to `error` and downgrade only on explicit verbal markers in the
   source markdown.

3. **Cross-cutting R1–R5 in M1.** Five rules referenced from every M1 phase
   artifact. Author once in a shared file, reference by rule-id from each
   `engine.json` — or duplicate inline? Recommend shared file
   (`engines/m1-fail-closed-rules.shared.ts`?) but that's a
   `kb-runtime-architecture` design call.

4. **Phase-4 sub-checkpoint shape (M8).** Phase-4 has 4 sub-checkpoints
   (4A/4B/4C/4D). Each is its own STOP GAP block. Do we ship 4 separate
   `artifact_key`s (`module_8/phase-4-checkpoint-4a` …) or one merged
   `module_8/phase-4-rating-systems-rpn` with all 4 sub-rule-trees? The
   former matches runner contract (one `artifact_key` per gate); recommend
   that.

5. **M2 Phase-3 Scope-Tree no-exit-gate per master-prompt.** The phase file
   has a `## STOP GAP — Checkpoint 1` block but the M1 master-prompt line 75
   states "P3 has no exit gate". Likely a M1-vs-M2 confusion in this audit
   (M1 has a P3-Scope-Tree; M2 has its own different P3). Re-read both to
   confirm before encoding — the file at
   `1-defining-scope/01-phase-docs/06-Phase-3-Scope-Tree.md` is the M1 one,
   and per master-prompt should ship `rules: []` (no exit gate) or be
   covered by P4's review-gate.

## §6 Total stop-gaps surfaced

| metric | count |
|---|---|
| files with stop-gaps | **89** |
| files without stop-gaps | 35 |
| total `## STOP GAP|## STOP-GAP|## Validation Checklist|### STOP GAP|### Hard Minimums` blocks | **94** |
| total checkbox bullets (Pattern A) | ~245 |
| total numbered-prose invariants (Pattern B) | ~50 |
| total user-confirmation questions (Pattern C) | ~75 |
| **total machine-readable rules to author** | **~370** |
| severity `error` (block) | ~360 |
| severity `warn` | ~10 |

## §7 Audit run metadata

- Walk timestamp: 2026-04-27
- Walked tree: `apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/`
- Branch: `wave-e/te1-engine-fail-closed`
- Hard-dep tag: `te1-engine-core-complete` @ `cddf1bf`
- Runner verified at: `apps/product-helper/lib/langchain/engines/fail-closed-runner.ts`
- Test suite: `apps/product-helper/lib/langchain/engines/__tests__/fail-closed-runner.test.ts` — 17/17 green (0.104s)
- Read-only audit — phase files NOT edited (kb-rewrite owns γ-rewrite)
- `_shared/` symlink sources counted once per source per dispatch rule #8

## §8 Cross-references

- Day-0 inventory: `plans/wave-e-day-0-inventory.md`
- Team context: `~/.claude/teams/c1v-kb-runtime-engine/context.md`
- Master plan: `plans/c1v-MIT-Crawley-Cornell.v2.2.md` §Wave E + EC-V21-E.4
- Runtime architecture: `plans/kb-runtime-architecture.md` §2.3 (Output guardrails / safety)
- Runner: `apps/product-helper/lib/langchain/engines/fail-closed-runner.ts`
- Runner schema: `apps/product-helper/lib/langchain/schemas/engines/fail-closed.ts`
- Runner tests: `apps/product-helper/lib/langchain/engines/__tests__/fail-closed-runner.test.ts`
