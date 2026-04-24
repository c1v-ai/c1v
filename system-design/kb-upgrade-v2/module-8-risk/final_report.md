---
title: Module 7 FMEA — c1v Final Report
date: 2026-04-20
module: 7 of 7 (Identify & Evaluate Risk — CESYS527)
status: Complete (CONDITIONAL PASS)
author: Bond (on behalf of David Ancor)
winning_concept_under_design: c1v Dual-Mode Platform (carried from M4 through M6)
upstream_refs:
  - system-design/module-6-interfaces/risk_handoff.json
  - system-design/module-6-interfaces/interface_matrix.json
  - system-design/module-5-qfd/c1v_QFD.json
  - system-design/module-4-decision-matrix/decision_matrix.json
  - system-design/module-1-defining-scope/use_cases.json
---

# Module 7 FMEA — c1v Final Report

## 1. Executive Summary

Module 7 ran a Failure Mode and Effects Analysis on **c1v** itself, following the CESYS527 14-step checklist. The FMEA covers all **14 subsystems** (SS1–SS14), all **32 internal interfaces** (IF-01 → IF-32), and the **9 critical interfaces** + **4 roof tradeoffs** that M6 handed forward.

- **42 cause rows** grouped under **35 failure modes** (F.1 → F.35)
- **Rating scales:** Severity 1–4, Likelihood 1–5, RPN = S × L (5-tier criticality)
- **Before corrective actions:** 1 HIGH, 10 MEDIUM HIGH, 16 MEDIUM, 14 MEDIUM LOW, 1 LOW
- **After corrective actions:** 0 HIGH, 0 MEDIUM HIGH, **2 residual MEDIUM**, 32 MEDIUM LOW, 8 LOW
- **Overall risk reduction: 65.7%** by weighted RPN mass
- **All 7 M6 open questions resolved** with 6 constants promoted to Final

**Residual risks requiring v1.1 follow-up:**

1. **F.15-c2** (stale citation, adj RPN 8 MEDIUM) — EC9↔EC11 is the QFD roof's strongest negative pair (-2); cannot be eliminated without event-driven vendor-doc webhooks.
2. **F.6** (agent context token drift, adj RPN 6 MEDIUM) — provider tokenizer ABI stability is not guaranteed; mitigated by quarterly CI-diff in v1.1.

**Verdict:** CONDITIONAL PASS. v1 ships with explicit acceptance of 2 residual MEDIUM rows, both documented with v1.1 remediation plans.

## 2. Inputs Inherited

| Source | What it provided |
|---|---|
| M1 `use_cases.json` | 6 UCs in scope (UC01, UC03, UC04, UC06, UC08, UC11) |
| M4 `decision_matrix.json` | Winning concept = c1v Dual-Mode Platform (Option C, 0.662) |
| M5 `c1v_QFD.json` | EC roof (14 non-zero pairs, top pair EC9↔EC11 = -2); EC8 rank-1 imputed importance |
| M6 `risk_handoff.json` | 9 priority interfaces, 4 roof tradeoffs with residual risk, 7 open questions, 8 error-contract clusters |
| M6 `interface_matrix.json` | 32 internal + 10 external interfaces with criticality tags |

No M1-M6 content was copied; all artifacts cite upstream by path per the schema-first convention.

## 3. Rating Scales (calibrated to c1v context)

**Severity (1-4):** tier 4 = hard-constraint violation (EC10, UC11, MAX_OVERHEAD, EC18) OR compliance breach; tier 3 = founder blocked on core flow; tier 2 = transient UX degradation; tier 1 = internal telemetry only. See `rating_scales.json` §severity for the full condition table.

**Likelihood (1-5):** tier 5 = >10% of sessions; tier 4 = >1/week; tier 3 = ~1/week; tier 2 = 1/fortnight to 1/quarter; tier 1 = <1/quarter. Thresholds set for post-v1 production, NOT prototype.

**RPN matrix (5×4 = 20 cells, max RPN = 20):**

| Range | Category | Color |
|---|---|---|
| 15-20 | HIGH | Red |
| 9-14 | MEDIUM HIGH | Orange |
| 5-8 | MEDIUM | Yellow |
| 3-4 | MEDIUM LOW | Light Green |
| 1-2 | LOW | Green |

**Detectability (1-5, optional):** captured per row as a standalone column; NOT multiplied into RPN (per KB Phase 7 alternative).

## 4. Failure Mode Coverage

### By subsystem

| Subsystem | # Modes | # Causes | Highest Original RPN | Notes |
|---|---:|---:|---:|---|
| SS1 Founder Web UI | 2 | 3 | 6 | Streaming + client memory |
| SS2 Session Manager | 2 | 3 | **12** | **F.3-c2 mode-lock race** |
| SS3 Agent Orchestrator | 3 | 3 | **12** | F.5 partial fan-out, F.6 token drift |
| SS4 LLM Provider Layer | 3 | 3 | 6 | Tail-risk (L=1) but S=4 |
| SS5 Prompt Cache | 2 | 2 | 9 | Template staleness |
| SS6 Spec Generator | 2 | 3 | 8 | **Citation gate (EC10 floor)** |
| SS7 Traceback Store | 4 | 4 | **16 HIGH** | **F.15-c2 EC9↔EC11 roof** |
| SS8 CLI Bundle Emitter | 3 | 4 | 9 | Audit receipt loss (F.19) |
| SS9 Probe SDK | 3 | 4 | **12** | **F.22-c2 overhead breach** |
| SS10 Metrics Collector | 3 | 3 | 8 | Backpressure integrity |
| SS11 Metric Store | 2 | 2 | 4 | Retention + write loss |
| SS12 Recommendation Engine | 2 | 2 | 9 | Cites stale traceback |
| SS13 Credential Vault | 2 | 2 | 4 | Scope enforcement |
| SS14 Audit Log Store | 2 | 2 | 9 | **EC18 compliance** |

### By interface driver (from M6 priority list)

| Interface | Top-risk row | Blast radius |
|---|---|---|
| IF-14 (SS7→SS6) | F.15-c2 RPN 16 | Stale citations served — F.15 dominates the HIGH tier |
| IF-03 (SS2→SS3) | F.3-c2 RPN 12 | Mode-lock race → wrong provider for 5 parallel agents |
| IF-07 (SS3→SS4) | F.5 RPN 12 | Partial fan-out presents incomplete result as complete |
| IF-17 (SS9→SS10) | F.22-c2 RPN 12 | Overhead breaches 2% non-negotiable budget |
| IF-12 (SS6→SS3) | F.13 RPN 8 | Citation-gate fail-open = EC10 floor violation |
| IF-30 (SS13→SS9) | F.23, F.33 RPN 4 | Credential leak = UC11 non-invasiveness (tail risk, catastrophic) |

## 5. Corrective Actions (Phase 5)

All **10 MEDIUM HIGH** + the **1 HIGH** cause row received corrective actions. **14 MEDIUM LOW** + the 1 LOW row received precautionary actions where cheap (effort < 10 hrs). Total estimated effort: **~480 hrs** of engineering work spread across the v1 hardening sprint.

**Top 5 by effort:**

| Row | Action | Effort |
|---|---|---:|
| F.8 | Third LLM provider + multi-region routing | 40 hrs |
| F.22-c1 | SDK self-governor with auto-throttle kill-switch | 32 hrs |
| F.15-c1 | Transactional cache invalidation + outbox pattern | 24 hrs |
| F.22-c2 | Adaptive probe frequency | 24 hrs |
| F.34 | Split-policy audit writes (sync-durable + async telemetry) | 22 hrs |

## 6. Before/After Stoplights (Phase 6)

See `renders/stoplight_before.png` and `renders/stoplight_after.png` for the visual heatmaps.

| Criticality | Before | After | Δ |
|---|---:|---:|---:|
| HIGH | 1 | 0 | -1 |
| MEDIUM HIGH | 10 | 0 | -10 |
| MEDIUM | 16 | 2 | -14 |
| MEDIUM LOW | 14 | 32 | +18 |
| LOW | 1 | 8 | +7 |

Risk migrated aggressively toward the lower-left (low-severity, low-likelihood) quadrant. The two residual MEDIUM rows are documented in §1 and in `stoplight_charts.json` §residual_risks_requiring_v1_1_followup.

## 7. Troubleshooting (Phase 7 Optional — Included)

Every cause row carries a `troubleshooting` field describing the diagnostic/resolution/escalation path. Detectability ratings (1–5) are attached per row but NOT multiplied into RPN. **Detectability hotspots:**

- **Detectability 5 (near-invisible):** F.13 (both causes), F.15 (both), F.18 — ALL citation-related. These are the places where a silent bug would persist longest without external discovery. All received corrective actions that add explicit surfacing (`source_version` stamping, gold-set replay, schema validation).

## 8. Open Questions Resolved

All **7 open questions from M6** are resolved in `open_questions_resolved.json`. Six constants promoted to Final:

1. `AUDIT_WRITE_POLICY` → split-policy
2. `SS4_PROVIDER_FALLBACK_DEPTH` → 3 (was 2)
3. `METRIC_CHECKPOINT_INTERVAL_MIN` → 10 (new)
4. `FLUSH_FALLBACK_BATCH_MIN` → tiered (low-traffic=3, default=10)
5. `TRACEBACK_CACHE_TTL_HOURS` → tiered (top-50=6, default=24)
6. `CITATION_CHECK_LATENCY_MAX_S` → 5 (was 3; hard-reject on exceed)

These are load-bearing on v1 implementation. They should be reflected in the constants table during v1 engineering sprint planning.

## 9. Deferred / Out of Scope

- **Privacy Local mode deep FMEA**: current run covers Cloud mode as primary. Local mode inherits F.1–F.6 and F.11–F.35; F.7–F.10 do not apply. Two new candidate modes (local model corruption, local OOM) are tracked for the v1.1 FMEA iteration.
- **Local-mode + Cloud-mode interaction risks**: mode-switch itself is covered by F.3, but drift between modes over multiple sessions is deferred.
- **Third-party dependency supply-chain risk**: Anthropic model deprecation, OpenAI API version drift, vendor doc source takedown — partially covered by F.8 and F.16 but deserves a dedicated iteration.
- **Provider cost-runaway risks** (beyond F.31 bounded iteration): full credit-system FMEA should be run when billing is generalized beyond current Stripe integration.

## 10. Artifacts Produced

| File | Purpose |
|---|---|
| `phase_0_context.json` | System context + subsystem list + inherited priorities |
| `rating_scales.json` | Severity + Likelihood + RPN matrix + Criticality ranges + Detectability scale |
| `fmea_table.json` | Master table — 42 rows × 19 columns |
| `fmea_table.xlsx` | xlsx rendering of master table + rating scales + before/after stoplights (4 sheets) |
| `stoplight_charts.json` | Before/after matrices + criticality totals + residual-risk call-outs |
| `open_questions_resolved.json` | 7 M6 questions resolved + 6 constants promoted |
| `generate_fmea_xlsx.py` | xlsx generator (reproducibility) |
| `generate_stoplights.py` | PNG heatmap generator |
| `renders/stoplight_before.png` | Visual heatmap (before) |
| `renders/stoplight_after.png` | Visual heatmap (after) |
| `diagrams/stoplight_diagrams.mmd` | Mermaid Sankey fallback for text-only viewing |
| `validation_report.json` | CESYS527 final-output checklist verification |

## 11. Handoff

Module 7 is the terminal module in the CESYS525/527 sequence. There is no downstream M8. The engineering team consumes this FMEA plus the 6 promoted constants to build the v1 hardening sprint. The 2 residual MEDIUM rows are the v1.1 backlog seed.

---

**Next step for David:** Review the residual risks and the 6 promoted constants. If accepted, the v1 hardening sprint plan can be assembled from the 42 cause rows' corrective actions. If you want Privacy Local mode deep FMEA before v1 ships, that's a bounded second pass (estimate: ~12 new rows).
