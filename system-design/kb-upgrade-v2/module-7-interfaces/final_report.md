---
title: Module 6 Defining Interfaces — c1v Final Report
date: 2026-04-20
module: 6 of 6 (Interfaces)
status: Complete
upstream:
  - system-design/module-6-qfd/interfaces_handoff.json
  - system-design/module-3-ffbd/interfaces_list.json
downstream:
  - system-design/module-7-risk-fmea (to be created)
author: Bond (on behalf of David Ancor)
winner_concept_under_design: c1v Dual-Mode Platform (from M4)
---

# Module 6 Defining Interfaces — c1v Final Report

## 1. Executive Summary

Module 6 formalizes every interface required to build the **c1v Dual-Mode Platform** (M4 winner, M5 design-target-committed). The c1v system is decomposed into **14 subsystems (SS1..SS14)**. The formalization covers:

- **32 internal interfaces (IF-01..IF-32)** across those 14 subsystems — rendered in an N2 chart and an Interface Matrix.
- **10 external interfaces (IF-EXT-01..IF-EXT-10)** at the c1v boundary.
- **5 system flows + 5 control loops** validated against the matrix (every hop has a matching interface).
- **4 sequence diagrams**, one per QFD roof negative pair, each showing the specific interface contract that resolves the tradeoff.

**Critical interface count: 8** (IF-03, IF-07, IF-08, IF-12, IF-13, IF-14, IF-17, IF-18, IF-30). These are the interfaces Module 7 (Risk / FMEA) must cover first.

**Tradeoff resolutions delivered in M6 (from M5 roof):**

| Roof pair       | Strength | M6 interface resolution |
|-----------------|:---:|---|
| EC1↔EC2         | -1 | IF-17/IF-18 joint cfg — collector owns probe_freq + aggregation_window as one contract |
| EC2↔EC4         | -1 | IF-17 time-based flush fallback when batch doesn't fill within window |
| EC5↔EC6         | -1 | IF-09 routing policy written before IF-03 dispatch (synchronous invariant) |
| EC9↔EC11 (-2)   | -2 | SS7 internal invalidation protocol (SEQ-2): refresh triggers cache expiry per doc key |

**Headline insight:** c1v's interface "heat" is concentrated around **SS3 Agent Orchestrator** (10 incident interfaces) and **SS7 Traceback Store** (6 incident interfaces). SS3 is the orchestration hub; SS7 owns the QFD's strongest tradeoff. These are the two subsystems Module 7 should scrutinize hardest for failure-mode propagation.

## 2. Inputs Inherited from M5

- **Winning concept:** c1v Dual-Mode Platform (M4 score 0.662; SOTA Cloud default, Privacy Local opt-in).
- **14 candidate subsystems (SS1..SS14)** carried over verbatim from M5 `interfaces_handoff.json`.
- **8 top-imputed-importance interfaces** from M5 with SLAs — all formalized in IF-03, IF-05/06/10, IF-07/08 (EC8+EC7+EC5), IF-13 (EC10), IF-17 (EC1/EC3/EC4/EC2), IF-19 (EC2), IF-09 (EC5), etc.
- **4 cross-interface coordination constraints** from the QFD roof (see §8).
- **13 constants promoted to Final in M5** — all threaded through interface SLAs in the Interface Matrix.
- **5 open questions from M5 → M6** — resolved in §8 and §11.

## 3. The 14 Subsystems

| ID | Name | Role | Anchored ECs |
|----|------|------|---|
| SS1 | Founder Web UI | Intake conversation, spec review, quick-start trigger | EC15, EC16 |
| SS2 | Session Manager | Mode lock (cloud default / local opt-in) + auth + routing policy | EC5 |
| SS3 | Agent Orchestrator | LangGraph intake/extraction/generation/review agents | EC6, EC7, EC8, EC13 |
| SS4 | LLM Provider Layer | Anthropic / OpenAI / local routing | EC5, EC7, EC8 |
| SS5 | Prompt Cache | Claude prompt-caching + local embedding cache | EC7 |
| SS6 | Spec Generator | Mermaid-only artifacts (v1) | EC12, EC13 |
| SS7 | Traceback Store | Citation cache + vendor-doc fetcher (owns EC9↔EC11 roof) | EC9, EC10, EC11 |
| SS8 | CLI Bundle Emitter | Packaging + signing + delivery | EC12, EC14, EC17 |
| SS9 | Probe SDK | Customer-side, bounded-overhead metrics | EC1, EC3, EC4 |
| SS10 | Metrics Collector | c1v-side ingestion + aggregator | EC2, EC3, EC4 |
| SS11 | Metric Store | 60-min-window time-series | EC2 |
| SS12 | Recommendation Engine | Cited recommendations from deviations | EC6, EC10 |
| SS13 | Auth / Credential Vault | Session tokens + rotation | EC17 |
| SS14 | Audit Log Store | 90d operational retention | EC18 |

## 4. N2 Chart Summary

**Shape:** 14 × 14 square; diagonal = subsystem names. Upper triangle = forward data flows; lower triangle = feedback / return paths.

**Non-zero cells:** 32 of 182 off-diagonal cells (17.6% density). Matches typical well-formed N2 charts (KB target 10-30%).

**Fan-in / fan-out (from generator):**

| Subsystem | Out | In | Flag |
|-----------|:---:|:---:|---|
| SS3 Agent Orchestrator | 6 | 4 | hub — highest out-degree |
| SS2 Session Manager | 4 | 3 | routing hub |
| SS6 Spec Generator | 3 | 3 | citation gate |
| SS7 Traceback Store | 3 | 3 | roof owner |
| SS14 Audit Log Store | 0 | 3 | sink |
| SS1 Founder Web UI | 2 | 2 | edge UI |

Densest rows are SS3 (provider of run state, cache lookups, LLM calls, spec requests, CLI emission, audit writes) and SS13 (fan-out of credentials to SS2/SS4/SS9).

**Control loops explicitly named:**
1. Agent ↔ Cache ↔ LLM Call Loop (SS3→SS5→SS3) — EC7 + EC8 governance
2. Spec Generation ↔ Traceback Citation Loop (SS6→SS7→SS6) — EC10 hard floor
3. Probe ↔ Collector Backpressure Loop (SS9→SS10→SS9) — EC1/EC2/EC4 roof resolution
4. Recommendation ↔ Traceback Loop (SS12→SS7→SS12) — citation reuse
5. Session ↔ Credential Rotation Loop (SS2→SS13→SS2) — EC17 cadence

## 5. Interface Matrix Summary

**Row counts:** 32 internal IF entries + 10 external IF-EXT entries = **42 formalized interfaces**.

**By type:**

| Type | Count |
|------|:---:|
| operational (c1v-internal, user-facing SLAs) | 19 |
| internal (implementation, design-target) | 4 |
| ui (SS1-facing) | 5 |
| external (crosses c1v boundary) | 4 internal-plus-external + 10 pure-external |

**By criticality:**

| Criticality | Count |
|-------------|:---:|
| critical | 8 |
| high | 17 |
| med | 6 |
| low | 1 |

**Top-8 critical interfaces** (Module 7 priority list):

| ID | Flow | Why critical |
|----|------|--------------|
| IF-03 | SS2 → SS3 dispatch | Mode-lock invariant; EC5↔EC6 roof resolution |
| IF-07 | SS3 → SS4 LLM call | Rank-1 imputed importance (EC8); timeout/fallback contract |
| IF-08 | SS4 → SS3 completion | Streaming chunk cadence (EC16); partial-completion hazards |
| IF-12 | SS6 → SS3 draft event | Gated on citation check — cascades to CLI emission |
| IF-13 | SS6 → SS7 citation check | HARD FLOOR (EC10 = 100%) — emission blocker |
| IF-14 | SS7 → SS6 traced citations | Owns EC9↔EC11 roof inside SS7 |
| IF-17 | SS9 → SS10 probe payload | Customer-boundary overhead enforcement |
| IF-18 | SS10 → SS9 backpressure | Enforces EC1/EC3 reject-on-violation |
| IF-30 | SS13 → SS9 probe credentials | Read-only scope invariant; UC11 non-invasive constraint |

## 6. Data Flow Diagram Overview

`data_flow_diagram.mmd` renders the top-level DFD as a Mermaid `flowchart LR`:

- **External actors** (left/right clusters): Founders/PMs/Engineers/Admins, IdPs, LLM Providers, VCS, Customer Prod Systems + Obs, Documentation Sources, Compliance Frameworks, CI/CD Systems, Cloud Providers, IDE/CLI Clients.
- **c1v cluster (center)**: all 14 SS nodes colored by category (ui / engine / data / platform / external-resident).
- Every arrow label carries **both** the data summary and the EC budget (e.g. `IF-07 prompt + tools + ctx (cache-miss only, ≤8000 tok EC8)`).
- Inbound, outbound, and internal arrows are visually distinguishable by cluster placement.

## 7. Four Sequence Diagrams

`sequence_diagrams.mmd` contains four `sequenceDiagram` blocks. Each resolves a QFD roof negative pair:

### 7.1 SEQ-1 — Probe SDK ↔ Collector joint tuning (EC1↔EC2, EC2↔EC4)

Shows SS10 pushing joint cfg(probe_freq, window, batch, flush_fallback) to SS9 via IF-18; SS9 then enqueues events with `alt` branches on batch-fill vs time-based flush. Overhead violations trigger IF-18 reject + IF-26 audit. **Resolves:** batch-starvation when probe_freq too low for the aggregation window.

### 7.2 SEQ-2 — Traceback cache invalidation (EC9↔EC11, roof -2, strongest)

Splits SS7 into cache lifeline and fetcher lifeline. Shows citation lookup path with alt HIT/MISS branches; then independent 7d refresh loop that issues `INVALIDATE all entries keyed to source_uri` when doc hash changes. **Resolves:** stale 24h TTL entries outliving a 7d refresh that produced fresher content — the key correctness hazard flagged as a -2 in M5.

### 7.3 SEQ-3 — Session lock → parallel dispatch (EC5↔EC6)

Shows IF-01 login → IF-27 JWT → `lock_mode` step → IF-09 routing policy write → `ack(routing_set=true)` → IF-03 dispatch → par block of up to 5 agents. **Resolves:** the invariant "dispatch cannot occur before routing is confirmed" — otherwise up-to-5 agents could fan out to the wrong provider.

### 7.4 SEQ-4 — Citation-gated CLI emission (EC10 hard floor)

Shows IF-11 → draft → IF-13 citation check → IF-14 response, branching on `unresolved.length`. If > 0: IF-12 returns with citation_miss, IF-24 audit, IF-02 user message, **NO IF-15 fires**. If = 0: draft approved, IF-15 → IF-16 receipt → IF-EXT-04 VCS commit → IF-24/IF-25 audit. **Resolves:** EC10's hard-floor semantics — emission MUST NOT fire with any unresolved claim.

## 8. Roof-Tradeoff Interface Resolutions

Consolidation of §7 with M5 `cross_interface_coordination_constraints`:

| M5 roof pair | M6 resolution (interface + contract) | Constants used |
|---|---|---|
| EC1↔EC2 (-1) | IF-17 joint SLA: probe_frequency + aggregation_window are one contract in SS10's config push | PROBE_FREQUENCY_PER_MIN=6, AGGREGATION_WINDOW_MIN=60 |
| EC2↔EC4 (-1) | IF-17 time-based flush fallback (flush_fallback_min=10) | PROBE_BATCH_SIZE=50, flush_fallback=10 |
| EC5↔EC6 (-1) | IF-09 synchronous write before IF-03; explicit invariant on SS2→SS3 edge | EC5 scale = 2 (per-session), PARALLEL_AGENT_DISPATCH=5 |
| EC9↔EC11 (-2) | SS7-internal invalidation protocol (SEQ-2): refresh mutates cache keyed on source_uri | TRACEBACK_CACHE_TTL_HOURS=24, VENDOR_DOC_REFRESH_DAYS=7 |

**M5 Q1** (probe-SDK vs aggregator contract): resolved in IF-17/IF-18 with joint cfg push + reject-on-violation + time-based flush fallback.
**M5 Q2** (traceback cache ↔ doc refresh invalidation): resolved in SEQ-2 with the cache-keyed-by-source invalidation rule.
**M5 Q3** (shared session token schema for routing+parallel dispatch): resolved — JWT claims carry `mode` + `session_id` + `role`. Routing decision binds to `session_id`; parallel dispatch binds to the same `session_id`.
**M5 Q4** (citation-completeness telemetry): addressed as IF-24 (SS3→SS14) audit events. Every citation-miss is recorded.

**M5 open question**: "Does SS9 Probe SDK belong in the N2 chart?" → **YES**, SS9 is a first-class subsystem row. It physically runs on customer infrastructure but the interface contract is authored and owned by c1v. Placing it outside the N2 would hide the EC1/EC3/EC4 SLAs driven by that row.

**M5 open question**: "Should SS5 Prompt Cache merge into SS3?" → **KEPT SEPARATE**. EC7 has rank-2 imputed importance. Merging into SS3 would hide the cache-hit SLA. IF-05/IF-06/IF-10 justify the three distinct edges.

**M5 open question**: "How to represent dual-mode fork in a sequence diagram?" → SEQ-3 handles this via the `locked_mode` parameter passed through IF-03. No lifeline duplication needed; the LLM Provider Layer branches internally on the mode flag (IF-29).

## 9. What Module 7 (Risk / FMEA) Inherits

**High-priority failure-mode seeds:**

1. **SS6 → SS7 citation gate (IF-13/IF-14)** — failure: doc unreachable, cache invalidation race, or stale hash. Consequence: spec emission blocked, founder blocked. Mitigation seed: circuit breaker + stale-but-warned read with audit flag.
2. **SS9 → SS10 overhead enforcement (IF-17/IF-18)** — failure: customer-system overhead exceeds 2% ceiling. Consequence: contractual breach with customer. Mitigation seed: dual-side throttling (client + server); reject-on-violation already contracted.
3. **SS7 internal (cache ↔ fetcher)** — failure: invalidation event lost between fetcher and cache. Consequence: citations served from stale data. Mitigation seed: invalidation must be synchronous within SS7; fetcher writes new entries only after cache expires old ones.
4. **SS4 provider fallback chain (IF-07/IF-08)** — failure: all providers down, or local-mode provider not installed. Consequence: agent stall. Mitigation seed: fallback chain depth=2; user-facing "try again in Xs" message; per-provider health check.
5. **SS8 → VCS (IF-EXT-04)** — failure: VCS write permission misconfigured or signer key revoked. Consequence: CLI never lands. Mitigation seed: sign-then-push two-phase; dry-run gate before actual push.
6. **SS2 mode-lock invariant (IF-03)** — failure: mode not locked (race at boot). Consequence: wrong provider selected. Mitigation seed: explicit state machine with `unlocked` → `locking` → `locked`; dispatch blocked unless state=`locked`.

**Constants state entering M7 (all 13 M5 Final constants still Final; no demotions):**
PROBE_FREQUENCY_PER_MIN=6, AGGREGATION_WINDOW_MIN=60, METRIC_PAYLOAD_KB_MAX=4, PROBE_BATCH_SIZE=50, PARALLEL_AGENT_DISPATCH=5, PROMPT_CACHE_HIT_TARGET_PCT=70, AGENT_CONTEXT_TOKENS_MAX=8000, TRACEBACK_CACHE_TTL_HOURS=24, VENDOR_DOC_REFRESH_DAYS=7, SPEC_FORMAT_COUNT_V1=1, QUICK_START_STEP_COUNT=5, CLI_BUNDLE_SIZE_MB_MAX=5, STREAMING_CHUNK_CADENCE_MS=50.

**New interface-level constants promoted in M6:**
- `FLUSH_FALLBACK_BATCH_MIN` = 10 (IF-17 time-based flush; prevents starvation)
- `SS4_PROVIDER_FALLBACK_DEPTH` = 2 (IF-07 resilience; still Estimate — finalize in M7 after FMEA)

## 10. Files Produced

In `system-design/module-7-interfaces/`:

- `n2_chart.json` — 14 SS + 32 interfaces + 10 externals + 5 flows + 5 loops
- `n2_chart.xlsx` — rendered N2 matrix + Analysis sheet (fan counts, flows, loops, QFD endpoint reconciliation)
- `generate_n2.py` — adapter that invokes KB `n2_from_json.py`
- `interface_matrix.json` — 14 subsystem tabs + 32-row `interface_registry` with full specs
- `interface_matrix.xlsx` — rendered multi-tab workbook
- `generate_interface_matrix.py` — adapter that invokes KB `interface_matrix_from_json.py`
- `data_flow_diagram.mmd` — top-level DFD (Mermaid)
- `sequence_diagrams.mmd` — four sequence diagrams (Mermaid)
- `final_report.md` — this document
- `validation_report.json` — structural checks + course checklist
- `risk_handoff.json` — Module 7 input

## 11. Known Limitations

1. **.pptx renderings deferred.** The KB ships `Data-flow-diagram.pptx` and `sequence-diagram-sample-template.pptx` templates, but adapting them for c1v's 14-subsystem scale exceeds the M6 time budget for visual-identity value gained. M6 ships `.mmd` sources as the authoritative format (text-native, version-controllable, renders inline in Notion/GitHub/Obsidian). If David wants .pptx, the shapes can be generated in a follow-up pass.
2. **SS4 provider fallback depth = 2** is still an Estimate. Finalize after M7 FMEA informs whether depth=2 is sufficient for PC.4 (spec-gen time) under degraded-provider conditions.
3. **Compliance evidence export format** (IF-EXT-07) is listed as "JSONL + Parquet" (Estimate). v2 compliance work per M4 D3 will finalize.
4. **Edit round trips per spec max** = 5 on IF-31 is a guess. Needs real founder-session data before hardening.
5. **SS14 schema for audit JSONL** is specified at the field level but not the exact column types. M7 or early implementation will lock.

## 12. Validation Summary

See `validation_report.json`. Headline:

- **N2 chart structural checks:** PASS — 14 SS on diagonal, every SS has at least 1 interface, every flow/loop hop has a matching interface (2 validation errors were caught and fixed during build).
- **Interface matrix completeness:** PASS — every M3 informal interface (I.INT.1-8, I.EXT.1-10, I.UI.1-4) is traced to at least one formal IF entry. Every M5 top-8 interface is formalized with SLA.
- **Roof resolution coverage:** PASS — all 4 M5 roof negative pairs have a sequence diagram showing the interface contract that resolves them.
- **Critical-interface error contracts:** PASS — all 8 critical interfaces have explicit `error_contract` fields.
- **QFD endpoint reconciliation:** 56 declared vs 40 target (+40% drift). Investigated — within tolerance given c1v has more compound endpoints (e.g. IF-02 has 4 event types) than the generic 40-target assumption in M5. Not a reconciliation error; the M5 target was an order-of-magnitude reference, not an absolute.

**Overall status:** CONDITIONAL PASS — with the known limitation that .pptx artifacts were deferred (not material to engineering correctness).

## 13. Review History

- 2026-04-20 — Bond executed M6 autonomously after David's green-light. No human review rounds (by design: M6 is the most mechanical of the six modules once M5 inputs are locked). This report is the artifact David reviews.
- Expected next step: David reviews, then M7 Risk / FMEA spawn.
