# Module Data-Flow Map

_Derived from handoff contracts, `WRITTEN-ANSWERS.md`, final reports, and v3 agent-swarm plan. Last generated: 2026-04-20._

## The hard serial chain

```
M1 boundary → M2 ffbd-handoff.json → M3 decision_matrix_handoff.json
→ M4 qfd_handoff.json → M5 interfaces_handoff.json → M6 risk_handoff.json → M7
```

Each arrow is a stop-gap-gated contract. Downstream refuses to start until the contract exists.

---

## M2 Requirements

### Hard inputs (must have before starting)
- **From M1:** `system_scope_summary.json` (schema `system_context_summary.v1`) — boundary with The System + 16 external actors. Without this, no UCBD can fix its actors and no requirements can scope "shall" statements. _(HANDOFF §4.3, §4.4)_
- **From M1:** `use_case_inventory.json` — 15 UCs (UC01–UC15). Needed to prioritize the 6 UCBDs (UC01/03/04/06/08/11 per `open_questions` D1). _(HANDOFF §3.2)_
- **From M1:** 5 hard constraints in `module_1_constraints_carried_forward` (non-invasive, auditable, metric traceback, multi-LLM, native integration). Without them the constants table can't anchor `MAX_CUSTOMER_SYSTEM_OVERHEAD_PCT`, `TRACEBACK_COVERAGE_PCT`. _(HANDOFF §4.4)_

### Soft inputs (partial, forward-passable)
- **From M1:** `scope_tree.json` — performance-criteria annotations can be taken while M1 still iterates boundary. Enough if top-level branches are stable, even if leaves are still moving. **Risk:** leaf splits can introduce new UCBD candidates late.
- **From M1:** `open_questions` arrays — M2 can start UCBD drafting while M1 open questions (latency budget, compliance scope, feedback loop write-back) still resolve. **Risk:** D3 compliance answer can invalidate `AUDIT_RETENTION_DAYS` / `EVIDENCE_EXPORT_FORMATS` constants (did happen — compliance deferred to v2 per M4).

### Outputs required to end
- **→ M3:** `ffbd-handoff.json` (schema `ffbd_handoff.v1`) containing `functions[]`, `use_case_flows[]` with `branching[].guard`, `constants[]`, `cross_cutting_concerns[]`. Landing path `system-design/module-2-requirements/ffbd-handoff.json`. _(HANDOFF §4.3)_
- **→ M3:** UCBDs (`UC<xx>.ucbd.json`), `requirements_table.json`, `constants_table.json`, SysML activity diagrams. _(HANDOFF §4.1, §4.2)_
- **→ M4 [inferred via M3]:** prioritized-UC list + 25 open constants (23 Estimate + 3 non-constant decisions D1/D2/D3) — M4 closes D1, D2, D3 per `final_report.md §7`.

### Can run in parallel with
- M1 visual-fidelity work (PPTX generation) once `system_scope_summary.json` is locked.
- **Not** with M3 — FFBD is strictly downstream.

---

## M3 FFBD

### Hard inputs (must have before starting)
- **From M2:** `ffbd-handoff.json` with all fields populated — `functions[]`, `use_case_flows[]`, `branching[]`, `constants[]`. Explicitly gated: Module 3 refuses to start until `stop_gap_cleared: true`. _(HANDOFF §Glossary, §8 checklist)_
- **From M2:** Named constants (`INTAKE_COMPLETENESS_THRESHOLD`, `MAX_CUSTOMER_SYSTEM_OVERHEAD_PCT`, `RECOMMENDATION_CADENCE_MIN`, `FOUNDER_INTAKE_RESPONSE_BUDGET_MS`) — used as arrow labels and IT-gate termination conditions. _(M3 WRITTEN-ANSWERS Q7)_
- **From M2:** Branching guards (`approved`, `revisions_requested`, `missing_functionality`) — lifted verbatim onto OR-gate outgoing arrows. _(WRITTEN-ANSWERS Q7)_
- **From M1 [via M2]:** boundary + external actors — FFBD must validate every actor at boundary edges.

### Soft inputs (partial, forward-passable)
- **From M2:** partial UCBD set — FFBD top-level (F.0) can start once the 6 prioritized UCs are named (D1 resolved) even before every UCBD is complete. **Risk:** late UCBD branching edits force F.2/F.5/F.6 sub-diagram rework.
- **From M2:** Estimate-marked constants — can be labelled on arrows with `(est.)` marker; forward-pass acceptable because Estimate-vs-Final is a Yellow-uncertainty signal, not a structural break. _(WRITTEN-ANSWERS Q9)_

### Outputs required to end
- **→ M4:** `decision_matrix_handoff.json` — alternatives, candidate PCs (11 originally, 6 survived), uncertainties classified Red/Yellow/Green, `interfaces_list.json` with 22 entries, 88 functions. _(M3 WRITTEN-ANSWERS Q8, Q9; M4 §3)_
- **→ M6 [direct]:** `interfaces_list.json` (22 interfaces: 8 internal / 10 external / 4 UI) — M6 traces every M3 informal interface to formal IF entries. _(M6 §12 validation)_
- **→ M7 [via M6]:** uncertainties feed failure-mode priorities.
- Files: `system-design/module-3-ffbd/` + PPTX at `system-design/diagrams/`. _(HANDOFF §5.2)_

### Can run in parallel with
- M2 Phase 11 expansion planning (deferred UCs) — blocked on D1 answer but not on M3 FFBD.
- **Not** with M4 (M4 needs M3 alternatives + PCs); **not** with M6 (needs `interfaces_list.json`).

---

## M4 Decision Matrix

### Hard inputs (must have before starting)
- **From M3:** `decision_matrix_handoff.json` — 11 candidate PCs, 4 alternatives (single-LLM, multi-LLM, agent swarm, hybrid), `uncertainties.json`. _(M4 §3)_
- **From M2:** open_questions D1/D2/D3 resolved (UC priority, writeback semantics, compliance scope). M4 §7 finalizes them.
- **From M2:** Constants with Estimate/Final status — M4 promotes 8 to Final (`TRACEBACK_COVERAGE_PCT`, `MAX_CUSTOMER_SYSTEM_OVERHEAD_PCT`, `FOUNDER_INTAKE_RESPONSE_BUDGET_MS`, etc.). _(M4 §8)_
- **From M1:** 5 hard constraints — PC.1 rejection threshold at 2% overhead is M1-anchored; "must operate across multiple LLM providers" rejects M3's ALT.A. _(M4 §3)_

### Soft inputs (partial, forward-passable)
- **From M3:** partial FFBD — M4 can prep PC weights (1–5 anti-bias ratings) before every sub-FFBD is rendered. **Risk:** FFBD branching discoveries reshape alternatives (happened — M4 reshaped alternatives to customer-chosen deployment mode, see M4 §2).
- **From M3:** uncertainties classification — Red/Yellow/Green ordering can be taken before all 88 functions enumerate. Enough if top-level 7 functions are stable.

### Outputs required to end
- **→ M5:** `qfd_handoff.json` — winning concept (Dual-Mode Platform, score 0.662), 6 PCs with locked weights `0.20/0.20/0.20/0.16/0.12/0.12`, 8 candidate ECs previewed, 5 open QFD questions. _(M4 §9, M5 WRITTEN-ANSWERS Q1)_
- **→ M6 [via M5]:** winning concept under design. _(M6 header `winner_concept_under_design`)_
- **→ M7 [via M5/M6]:** winning concept + Final constants for FMEA context. _(M7 §2)_
- **v2 revision** (`v2_revised/final_report_v2.md`) adds PC.7 Observability/Detectability, EC17 split, EC19 Provider redundancy depth, + 14 tier-2 + 8 tier-3 matrices — cascades into M5 v2 HoQ patch.

### Can run in parallel with
- M3 validation-report pass (common-mistakes audit) once M3 §5.2 artifacts produced.
- **Not** with M5 (M5 needs final PC weights + winning concept).

---

## M5 QFD

### Hard inputs (must have before starting)
- **From M4:** `qfd_handoff.json` — winning concept + 6 PC weights (locked, not re-rated in M5). Without this, the HoQ front porch cannot be populated. _(M5 WRITTEN-ANSWERS Q1)_
- **From M4:** 8 candidate ECs preview (probe freq, aggregation window, routing policy, traceback TTL, parallel dispatch, spec format set, onboarding default, credential rotation). M5 expands to 18 ECs total.
- **From M4:** 5 open QFD questions carried in `qfd_handoff.json`.
- **From M2/M4:** 13+ still-Estimate constants — M5 locks them to Final as design targets. _(M5 WRITTEN-ANSWERS Q5)_

### Soft inputs (partial, forward-passable)
- **From M4:** preliminary sensitivity analysis — M5 can start EC target-setting once winner is identified even before P9 flip-condition analysis completes. **Risk:** sensitivity flip (C→A at P9) would invalidate EC17 target setting.
- **From M3:** `interfaces_list.json` — M5 can map ECs to subsystems while M3's validation report finalizes. **Risk:** late-breaking interfaces add EC rows.

### Outputs required to end
- **→ M6:** `interfaces_handoff.json` — 14 candidate subsystems (SS1–SS14), 8 top-imputed ECs with SLAs, 4 cross-interface coordination constraints (roof pairs EC1↔EC2, EC2↔EC4, EC5↔EC6, EC9↔EC11), 13 Final constants, 5 open questions. _(M6 §2)_
- **→ M7 [via M6]:** roof tradeoffs as FMEA seeds. _(M7 §2)_
- Files: `c1v_QFD.json`, `c1v_QFD.xlsx`, `M5-summary.md`.
- **v2 revision** (`module-6-qfd/v2_revised/c1v_QFD_v2.json`) patches PC.7 row + EC17a/EC17b/EC19 columns + 4 new roof cells.

### Can run in parallel with
- M4 sensitivity write-up (perturbations P1–P9) once winner is declared.
- **Not** with M6 (M6 needs subsystem list + EC targets).

---

## M6 Interfaces

### Hard inputs (must have before starting)
- **From M5:** `interfaces_handoff.json` — 14 subsystems, 8 top-imputed-importance ECs, 4 roof coordination constraints, 13 Final constants. _(M6 §2)_
- **From M3:** `interfaces_list.json` — 22 informal interfaces (8 internal / 10 external / 4 UI) that M6 traces to formal IF entries. _(M6 §12 validation: "every M3 informal interface … is traced to at least one formal IF entry")_
- **From M4:** winning concept (Dual-Mode Platform) — IF-03 mode-lock invariant depends on C's default-mode semantics.
- **From M2:** Final constants threaded through Interface Matrix SLAs.

### Soft inputs (partial, forward-passable)
- **From M5:** imputed-importance ranking — M6 can start N2 chart scaffolding (14 SS diagonal) using preview ranks before Excel-computed actuals land. **Risk:** preview had 3-way tie at 0.80 for {EC1, EC2, EC8}; actuals put EC8 alone at rank 1 → changed "top Module 6 interface" designation. _(M5 summary "_ranking_change_from_preview_to_actual")_
- **From M4 v2:** tier-2 subsystem winners (Portkey SS4, pgvector SS7, Upstash SS5) — `cascade_impact.md` notes M6 has "no structural change" from v2; tier-3 protocol decisions refine but don't restructure IF-01..IF-32. M6 can build tier-3 `protocol_choice` column as optional v1.1 enhancement.

### Outputs required to end
- **→ M7:** `risk_handoff.json` — 9 critical interfaces (IF-03, IF-07, IF-08, IF-12, IF-13, IF-14, IF-17, IF-18, IF-30), 4 roof tradeoffs with residual risk, 7 open questions, 8 error-contract clusters. _(M7 §2)_
- **→ M7:** `interface_matrix.json` — 32 internal + 10 external interfaces with criticality tags, used in M7 "By interface driver" table. _(M7 §4)_
- **→ M7:** 6 failure-mode seeds that M7 expands into F.# rows. _(M6 §9)_
- Files at `system-design/module-7-interfaces/`.

### Can run in parallel with
- M5 xlsx regeneration / imputed-importance re-computation — M6 can start N2 chart scaffolding.
- **Not** with M7 (M7 needs risk_handoff + critical-interface list).

---

## M7 FMEA

### Hard inputs (must have before starting)
- **From M6:** `risk_handoff.json` + `interface_matrix.json` — all 32 internal IFs + 10 externals with criticality tags; 9 priority interfaces; 4 roof tradeoffs; 7 open questions; 8 error-contract clusters. _(M7 §2)_
- **From M5:** `c1v_QFD.json` — EC roof (14 non-zero pairs, top EC9↔EC11 = −2), EC8 rank-1 imputed importance. _(M7 §2)_
- **From M4:** `decision_matrix.json` — winning concept. _(M7 §2)_
- **From M1:** `use_cases.json` — 6 UCs in scope.

### Soft inputs (partial, forward-passable)
- **From M6:** critical-interface list and sequence diagrams (SEQ-1..SEQ-4) — M7 can begin Phase 0 context + rating-scale calibration once top-8 criticals named, before `validation_report.json` closes. **Risk:** late changes to critical designations (e.g., IF-30 added) force FMEA row renumbering.
- **From M5 v2 / M4 v2:** PC.7 Detectability — per M4 v2 §7 "M7 FMEA: no structural change. Every M7 corrective action aligns with a tier-2 or tier-3 winner." M7 can pre-stage detectability column while v2 HoQ is still being patched.

### Outputs required to end
- **Terminal module** — no downstream M8. _(M7 §11)_
- **Consumers:** engineering team (v1 hardening sprint) + v3 re-run planning.
- **6 constants promoted to Final:** `AUDIT_WRITE_POLICY`, `SS4_PROVIDER_FALLBACK_DEPTH=3`, `METRIC_CHECKPOINT_INTERVAL_MIN`, `FLUSH_FALLBACK_BATCH_MIN`, `TRACEBACK_CACHE_TTL_HOURS` tiered, `CITATION_CHECK_LATENCY_MAX_S=5`. _(M7 §8)_
- **2 residual MEDIUM rows** (F.15-c2 stale citation, F.6 token drift) → v1.1 backlog. _(M7 §1)_
- Files: `fmea_table.json`, `fmea_table.xlsx`, `stoplight_charts.json`, `open_questions_resolved.json`, `renders/stoplight_*.png`.
- **→ v3 FOUNDATION [retroactive]:** M7 methodology + constants preserved as invariants. _(V3_FOUNDATION §7)_

### Can run in parallel with
- M6 optional `.pptx` renderings (deferred per M6 §11).
- M4 v2 tier-3 protocol decisions write-up (self-consistent with M7 per M4 v2 §7).

---

## Parallel-Execution Summary

| Module | Can start when | Upstream trigger % |
|---|---|---|
| **M2** | M1 boundary + 15 UCs locked (`system_scope_summary.json` + `use_case_inventory.json`) | ~70% of M1 (open_questions can forward-pass) |
| **M3** | M2 `ffbd-handoff.json` delivered with `stop_gap_cleared: true` | **100% of M2 (hard gate)** |
| **M4** | M3 `decision_matrix_handoff.json` delivered; M2 D1/D2/D3 resolved | **100% of M3 + M2 open_question closeout** |
| **M5** | M4 winner + 6 PC weights locked; partial ECs OK | ~80% of M4 (sensitivity P1–P9 can forward-pass) |
| **M6** | M5 `interfaces_handoff.json` + M3 `interfaces_list.json` | **100% of M3** + ~80% of M5 (actual imputed-importance can forward-pass) |
| **M7** | M6 `risk_handoff.json` + `interface_matrix.json` critical tags | ~90% of M6 (`validation_report.json` can trail) |

### Concrete parallelism opportunities

- **M1 ↔ M2:** M2 UCBD drafting parallel with M1 PPTX-fidelity work on scope tree.
- **M4 ↔ M3:** M4 PC anti-bias rating parallel with M3 FFBD sub-diagram validation.
- **M5 ↔ M4:** M5 EC enumeration parallel with M4 sensitivity narrative.
- **M6 ↔ M5:** M6 N2 chart scaffolding parallel with M5 xlsx imputed-importance recompute.
- **M7 ↔ M6:** M7 rating scales + Phase 0 context parallel with M6 deferred .pptx rendering.

### Compression math

From `v3_agent_swarm_plan.md`:
- Sequential ≈ **570 hrs**
- 5-wave agent swarm ≈ **175 hrs wall-clock**
- Compression ≈ **3.3× speedup**
- Schema-first **W0 gates all downstream agent work**

### Hard serial chain (no parallelism possible)

```
M1 boundary → M2 ffbd-handoff → M3 decision_matrix_handoff → M4 winner
→ M5 interfaces_handoff → M6 risk_handoff → M7
```

Each arrow is a stop-gap-gated handoff contract.
