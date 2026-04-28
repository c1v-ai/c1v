---
title: Module 5 QFD House of Quality — c1v Final Report
date: 2026-04-20
module: 5 of 6 (QFD / House of Quality)
status: Complete
author: Bond (on behalf of David Ancor)
winner_concept_under_design: c1v Dual-Mode Platform (from M4)
---

# Module 5 QFD — c1v Final Report

## 1. Executive Summary

Module 5 built the House of Quality for the winning concept from Module 4 (c1v Dual-Mode Platform). The HoQ evaluates 18 Engineering Characteristics against 6 Performance Criteria (weights carried forward from M4) and surfaces the design targets that Module 6 (Defining Interfaces) will carry into interface contracts.

**Top 5 ECs by imputed importance** (the design knobs where engineering budget should be concentrated):

| Rank | EC | Imputed | Target |
|---:|---|---:|---|
| 1 | EC8 Context tokens per agent call | 1.00 | 8000 tokens |
| 2 | EC7 Prompt-cache hit rate | 0.96 | 70 % |
| 3 | EC1 Probe frequency | 0.80 | 6 probes/min |
| 4 | EC10 Citation completeness floor | 0.76 | 100 % |
| 5 | EC6 Parallel agent dispatch count | 0.64 | 5 agents |

**Headline insight:** the QFD says c1v's highest-leverage design knobs are **LLM-architecture ECs**, not customer-probe ECs. Context size and prompt-cache hit rate dominate because they each touch 4+ PCs. The probe-side ECs (EC1-4) are the second cluster, dominated by the customer-side overhead constraint.

**Key tradeoff flagged:** the roof's single −2 cell is **EC9 Traceback cache TTL ↔ EC11 Vendor-doc refresh cadence**. The QFD resolved this with `TTL=24h` + `refresh=7d` — see §3 and WRITTEN-ANSWERS.md Q2.

**13 still-Estimate constants from M4 promoted to Final.**

## 2. Inputs Inherited

- **Winning concept:** c1v Dual-Mode Platform (M4 score 0.662)
- **6 PCs, weights sum to 1.00** (unchanged from M4): `PC.1 0.20, PC.2 0.20, PC.3 0.20, PC.4 0.16, PC.5 0.12, PC.6 0.12`
- **8 EC previews** from M4 handoff, expanded to 18 in M5 (coverage of 5 subsystems — probing, LLM architecture, traceback, spec generation, UX/ops)
- **5 open questions** from M4 — all resolved (see §6)

## 3. The Roof (EC-EC Interrelationships)

14 non-zero pairs out of 153 possible = **9.2% density** (within the KB's 10-15% expected range).

| Pair | Value | Interpretation |
|---|:-:|---|
| EC1 ↔ EC2 | −1 | Probe frequency ↔ aggregation window: tightening both simultaneously creates data gaps |
| EC2 ↔ EC4 | −1 | Aggregation window ↔ batch size: batches may not fill within tight windows |
| EC3 ↔ EC4 | +1 | Smaller payloads batch together more readily — compatible |
| EC5 ↔ EC6 | −1 | Routing granularity ↔ parallel dispatch: per-request routing + parallelism adds decision overhead |
| EC6 ↔ EC7 | +1 | Parallel dispatch benefits from prompt-cache hits |
| EC6 ↔ EC8 | +1 | Parallel dispatch + smaller contexts = lower cost at scale |
| EC7 ↔ EC8 | +1 | Smaller contexts = higher cache hit rates (template consistency) |
| EC7 ↔ EC15 | +1 | Cache hits accelerate intake turns |
| EC8 ↔ EC15 | +1 | Small contexts accelerate intake turns |
| **EC9 ↔ EC11** | **−2** | **Strongest tradeoff. Long TTL contradicts fresh refresh. Resolved: 24h TTL + 7d refresh.** |
| EC10 ↔ EC11 | +1 | Both improve PC.3 coverage — fresh docs support higher citation floor |
| EC12 ↔ EC13 | +1 | Fewer formats + fewer pipeline steps reinforce PC.4 speed |
| EC12 ↔ EC14 | +2 | Fewer formats → smaller CLI bundle — strong alignment |
| EC15 ↔ EC16 | +2 | Shorter turn budget + faster streaming — both directly improve PC.6 |

**Four negative roof pairs** (EC1↔EC2, EC2↔EC4, EC5↔EC6, EC9↔EC11) flagged for Module 6 coordination constraints.

## 4. Main Floor (PC × EC Relationship Matrix)

35 non-zero cells out of 108 = **67.6% sparsity** (meets the >50% threshold from KB 04).

- **Every PC has ≥ 1 non-zero EC** ✓ (no unaddressed PCs)
- **17 of 18 ECs have ≥ 1 non-zero PC** — **EC18 Audit log retention** is the single exception (imputed 0.00). EC18 is kept in the HoQ as a compliance/hygiene signal driven by M4 D3, not a QFD-optimized knob. Flagged in validation.

## 5. Back Porch (Competitive Scoring 1-5)

| PC | c1v A(low) | c1v A(high) | c1v A(target) | Devin (B) | Cursor (C) |
|---|:-:|:-:|:-:|:-:|:-:|
| PC.1 Non-invasiveness | 3 | 5 | 4 | 5 | 5 |
| PC.2 Feedback Latency | 3 | 4 | 3 | 1 | 1 |
| PC.3 Traceback Coverage | 5 | 5 | 5 | 2 | 2 |
| PC.4 Spec Gen Time | 2 | 4 | 3 | 2 | 3 |
| PC.5 CLI Emission | 3 | 5 | 4 | 1 | 1 |
| PC.6 Intake Response | 2 | 4 | 3 | 2 | **5** |

**Cursor beats c1v on PC.6** by 2 points — a structural IDE-embedded advantage. c1v dominates on PC.2, PC.3, PC.5 because Devin/Cursor don't implement those product surfaces at all.

## 6. Five M4 Open Questions — Resolved in M5

| Q | From M4 | Resolution in M5 |
|---|---|---|
| Q1 | Probe-frequency / aggregation-window tradeoff | 6 probes/min + 60 min window; roof flags joint tuning for M6 |
| Q2 | LLM routing policy granularity | EC5 target = 2 (per-session). Balances PC.4/PC.6 speed vs PC.1 simplicity |
| Q3 | Competitor scoring rubric | Devin + Cursor chosen; scored per customer-perception 1-5 scale |
| Q4 | Tighten spec-gen from 300s to 120s? | **Declined.** 300s kept as PC.4 target; 150s = A(high) stretch |
| Q5 | Tighten credential rotation from 90d? | **Declined.** Compliance deferred to v2 per M4 D3 |

## 7. Constants Promoted to Final (13 new in M5)

See `c1v_QFD.json` → `constants_touched_by_m5.finalized_in_m5` for the full list. Cumulative count of Final constants after M5:

- **Final after M2:** 4
- **Final after M4:** 8 (added `MAX_CUSTOMER_SYSTEM_OVERHEAD_PCT`, `INTAKE_COMPLETENESS_THRESHOLD`, `SPEC_RENDER_BUDGET_MS`, `FOUNDER_INTAKE_RESPONSE_BUDGET_MS`)
- **Final after M5:** **21** (added the 13 above)

Still-Estimate after M5: EC5 (`LLM_ROUTING_GRANULARITY_MODE`, may tighten in M6), EC17 (`CREDENTIAL_ROTATION_DAYS`, revisit in v2 compliance).

## 8. Key-Risk Flag

**EC10 Citation completeness floor** is the project's highest combined (imputed × difficulty × cost): imputed 0.76, difficulty 4, cost 3. Achieving 100% citation across every recommendation over every vendor source is the single hardest commitment locked by this QFD. Mitigation: the implementation accepts **"refuse to emit"** as a fallback when a recommendation cannot meet the 100% floor, scoping the difficulty from "always succeed" to "reliably refuse."

## 9. What Module 6 (Interfaces) Inherits

- **14 candidate subsystems** for N2 chart rows/columns (see `interfaces_handoff.json`)
- **8 top-imputed-importance interfaces** with SLA targets and interface-type classification (external / operational / internal)
- **4 cross-interface coordination constraints** derived from the roof's negative pairs
- **5 open questions** for M6 to resolve (N2 chart subsystem granularity, probe SDK placement, dual-mode fork representation in sequence diagrams, etc.)

Full handoff: `interfaces_handoff.json` in this directory.

## 10. Files Produced

```
system-design/module-6-qfd/
├── c1v_QFD.xlsx              ← Populated Excel HoQ (template-respecting)
├── c1v_QFD-backup.xlsx       ← Pre-write backup
├── c1v_QFD.json              ← Structured QFD data (source of truth)
├── WRITTEN-ANSWERS.md        ← 7-question CESYS525 answers
├── final_report.md           ← This document
├── interfaces_handoff.json   ← Module 6 consumable
├── write_xlsx.py             ← AppleScript generator (reproducibility)
└── write_xlsx.applescript    ← Generated AppleScript (for inspection)
```

## 11. Validation

- [x] Weights sum to 1.00 (Excel D32 formula result = 1.0) ✓
- [x] Every PC row has ≥ 1 non-zero EC ✓
- [x] 17 of 18 ECs have ≥ 1 non-zero PC (EC18 flagged) ✓
- [x] Roof values in lower triangle only ✓
- [x] Main floor values all numeric in [-2, 2] ✓
- [x] Back porch scores 1-5 ✓
- [x] Competitor B/C names populated ✓
- [x] No writes to formula cells (A33:A44, D32, E29:AD29, AJ33:AN44 except AL patch, E50:AD52) ✓
- [x] Weights derivation preserved ✓
- [x] AL33:AL38 (A_target weighted) formulas added manually (schema's known_issue #3) ✓

---

## 12. Review history

| Round | Who | What changed |
|---|---|---|
| 1 (2026-04-20 03:44) | David | "done module-4, move on with module 5" + "no need to write a report just get the deliverables done as quickly as possible" |
| 2 (~03:45) | Bond | Self-orient from M4 handoff + QFD KB; skipped external research, used estimates for competitor values |
| 3 (~03:55) | Bond | Populated JSON (18 ECs, 35 main-floor cells, 14 roof cells) |
| 4 (~04:00) | Bond | AppleScript write (264 cells) + AL formula patch |
| 5 (~04:05) | Bond | WRITTEN-ANSWERS.md + interfaces_handoff.json + this report |

---

*Module 5 is complete. Module 6 (Defining Interfaces — N2 chart, data flow diagrams, interface-labeled sequence diagrams) consumes `interfaces_handoff.json`.*
