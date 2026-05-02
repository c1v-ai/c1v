---
title: Module 3 FFBD — Resume Doc (Post-Context-Clear)
date: 2026-04-20
status: READY — waiting for David's signal to start
author: Bond (Claude Opus 4.7 1M, instance 7e6ap5nn)
hand_off_from: Module 2 execution, completed 2026-04-20 ~02:45 EDT
---

# Module 3 FFBD — Resume Doc

> Future-Bond (or any Claude picking this up): this is your cold-start brief. Read §1–§3, skim §4–§6, then write a plan. Do NOT start execution until David approves it.

## 1. What just shipped (Module 2)

Complete bundle at `system-design/module-2-requirements/`:

- `use_case_priority.json` — 15 UCs scored, 6 selected for first pass (UC01/03/04/06/08/11), 9 deferred
- `ucbd/UC{01,03,04,06,08,11}-*.ucbd.json` — 6 UCBDs (17–21 steps each, single "The System" column, full metadata, initial/ending conditions, notes)
- `requirements_table.json` — **99 requirements** (89 from UCBDs + 10 cross-cutting CC.R01–CC.R10), post-audit + post-delve
- `constants_table.json` — **28 named constants** (1 Final: `TRACEBACK_COVERAGE_PCT=100`; 27 Estimates)
- `decision_audit.jsonl` — 28 audit rows (auto-fill math visible per constant)
- `open_questions.json` — 25 below-threshold constants + 3 non-constant decisions awaiting David's review
- `sysml/UC*.activity.mmd` + `activity_diagram_manifest.json` — 6 Mermaid activity diagrams with `<<requirement>>` links
- `ffbd-handoff.json` — **THIS IS YOUR INPUT. 82 seed functions, 6 flows with branching + parallel, 28 constants, 10 CCs, 5 M1 constraints**
- `module_2_final_review.json` — 37/37 checklist items pass; `ready_for_module_3: true`
- `diagrams/c1v_UCBDs.pptx` — 14-slide stakeholder deck

## 2. What Module 3 produces (the FFBD deliverable)

Functional Flow Block Diagram — a graph of functions with AND / OR / IN-ORDER logical relationships derived from the handoff. Does NOT decide tech stack, data flow, or architecture.

### Expected output location
Mirror the pattern:
```
system-design/
├── module-1-defining-scope/        (exists)
├── module-2-requirements/          (exists — this session's output)
└── module-3-ffbd/                  (← Module 3 produces)
```

### Expected deliverables (per `3-ffbd-llm-kb/DELIVERABLES-AND-GUARDRAILS.md` — READ THIS FIRST)

The KB at `apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/New-knowledge-banks/3-ffbd-llm-kb/` has 20+ phase files. Open `00_MODULE-OVERVIEW.md` and `00A_INGEST-MODULE-2-HANDOFF.md` first. Typical Module 3 outputs (confirm from KB):

- `ffbd_top_level.json` (or similar) — top-level FFBD with ≤ ~12 blocks
- `ffbd_hierarchy/*.json` — exploded sub-FFBDs per complex block (per `07_HIERARCHICAL-FFBDS.md`)
- `effbd_data_blocks/*.json` — EFFBD data blocks where data flow is load-bearing (per `08_EFFBD-DATA-BLOCKS.md`)
- Mermaid / pptx renderings (there's a `create_ffbd_thg_v3.py` generator script in the KB — reuse the pattern)
- Validation report against `10_VALIDATION-AND-COMMON-MISTAKES.md`
- Decision-matrix-ready handoff per `11_FROM-FFBD-TO-DECISION-MATRIX.md` for Module 4

## 3. David's standing rules (these override everything else)

From `memory/MEMORY.md` — loaded automatically:
1. **Plan before action.** Write review-first plan to `.claude/plans/{slug}.md` and WAIT for approval. No code, no tasks, no artifacts until plan is reviewed.
2. **Never question scope.** David specs to the millimeter. Don't propose MVP cuts or ask "which thread matters most."
3. **No liberties with design/content.** If the KB says it, follow it. If M2 locked a decision, respect it.
4. **NEVER add `Co-Authored-By` to commits.**
5. David designs; agents execute. Ask only for genuine decision points, not for permission on work that's in-scope.
6. Your assistant name is **Bond**. Peer name is **Jessica** (different claude-peers instance).

## 4. Decisions already locked in (do not re-ask)

- **Auto-fill threshold: 0.90** (schema-first plan default).
- **v1 posture: read-only** (customer-system write-back deferred to v1.1+). UC06 + UC11 step flows already enforce this — FFBD must honor.
- **Compliance scope: SOC2 + HIPAA + GDPR + PCI-DSS** (full M1 regulatory_refs set). AUDIT_RETENTION_DAYS = 2555 flows from this.
- **6 UCBDs in scope: UC01 / UC03 / UC04 / UC06 / UC08 / UC11.** The 9 deferred UCs (UC02/05/07/09/10/12/13/14/15) are NOT M3's job — they re-enter in Module 2 Phase 11 expansion later.
- **Constants as Estimate with math audit:** 25 below-threshold items surface in `open_questions.json`. M3 inherits them as Estimates. Module 4 Decision Matrix tightens to Final; do NOT try to finalize them in M3.
- **Hard constraints (Final):** TRACEBACK_COVERAGE_PCT=100 is non-negotiable. UC08 is the enforcement point; FFBD must show it as a gating block before any spec-emission terminal.

## 5. Input shape — `ffbd-handoff.json` cheat sheet

```jsonc
{
  "system_name": "c1v",
  "system_description": "...",
  "boundary": { "external_actors": [16 entries] },
  "functions": [82 entries, each with { name, description_hint, source_requirements[], appears_in_use_cases[] }],
  "use_case_flows": [
    {
      "use_case_id": "UC01",
      "function_sequence": [16 functions in IN-ORDER],
      "branching": [{ after_function, branches: [{ guard, next_function }] }],
      "parallel": [{ at_function, parallel_functions, join_at }]  // UC04 has one; others empty
    },
    ... 5 more flows
  ],
  "constants": [28 entries with value+units+owner],
  "cross_cutting_concerns": [10 CCs: auth, audit, RBAC, encryption, retention, rate-limit, LLM fallback, structured error, observability, compliance export],
  "module_1_constraints_carried_forward": [5 M1 hard constraints verbatim]
}
```

**Branching logic to preserve in FFBD:**
- UC01: intake loop (not_complete → present_intake_question; complete → assemble_scope_outline); spec validation (invalid → emit_structured_error)
- UC03: review action fanout (approved | rejected | revisions_requested → different next functions)
- UC06: missing-functionality branch (→ surface_feature_candidate <<extends>> UC07)
- UC08: two gates (confidence ≥ TRACEBACK_MIN_CONFIDENCE, coverage ≥ TRACEBACK_COVERAGE_PCT)
- UC11: two fail-closed gates (write_scope_present → reject; overhead > budget → reject)

**Parallel flow to model explicitly:**
- UC04: after `enforce_cli_emission_timeout` → (write_bundle_to_vcs ∥ deliver_bundle_to_client) → join at `write_audit_entry`

**Cross-cutting concerns (CCs):** NOT separate FFBD branches. They appear as reference blocks or notes, per KB's `06_SHORTCUTS-AND-REFERENCE-BLOCKS.md`. Do not unroll them.

## 6. Likely first-plan shape

When David says "go" → your plan doc at `.claude/plans/module-3-ffbd-execution.md` should cover:

1. **Vision** — One top-level FFBD for c1v + 6 per-UC sub-FFBDs + EFFBD for UC08 (data-heavy) and UC06 (data-heavy).
2. **Problem** — M2 gave function list + flow ordering; M3 turns it into formal AND/OR/IN-ORDER logic graphs Module 4 can score against.
3. **Current state** — Reference §1 above.
4. **End state** — Directory layout + quality bar + what Module 4 inherits.
5. **Execution plan** — Follow KB phase order 00A → 01 → 02 → 03 → 04 → 05 → 06 → 07 → 08 → 09 → 10 → 11. Decision points where FFBD must pick logic-gate semantics (AND vs OR at branches).
6. **Open questions** — Only genuine decisions, not permission-asking.

## 7. Useful paths

| What | Path |
|---|---|
| M2 bundle | `system-design/module-2-requirements/` |
| M3 KB | `apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/New-knowledge-banks/3-ffbd-llm-kb/` |
| M3 KB overview | `3-ffbd-llm-kb/00_MODULE-OVERVIEW.md` |
| M3 KB ingestion guide | `3-ffbd-llm-kb/00A_INGEST-MODULE-2-HANDOFF.md` |
| M3 deliverables + guardrails | `3-ffbd-llm-kb/DELIVERABLES-AND-GUARDRAILS.md` |
| M3 python generator (reference) | `3-ffbd-llm-kb/create_ffbd_thg_v3.py` |
| Schema-first philosophy | `.claude/plans/schema-first-kb-rewrite-and-nfr-engine.md` |
| M2 execution plan (what we just did) | `.claude/plans/module-2-requirements-c1v-execution.md` |
| This resume doc | `.claude/plans/module-3-ffbd-resume.md` |

## 8. What not to do

- Don't re-ask David the 25+3 open items from M2's `open_questions.json`. They belong to M4, not M3.
- Don't expand to the 9 deferred UCs in M3. They re-enter only in Module 2 Phase 11 or later.
- Don't rewrite the schema-first KB plan — it's a separate ~27-day plan awaiting its own approval.
- Don't touch `apps/product-helper/` code — Module 3 is pure deliverable authoring under `system-design/module-3-ffbd/`.
- Don't introduce new functions beyond the 82 seeded in `ffbd-handoff.json` without a round-trip to Module 2.

---

*Ready for the signal. When David returns with "go on M3" (or similar), open §3 of this doc, open the KB, write the plan, WAIT for approval, then execute.*
