# c1v Module 5 — QFD Summary (Obsidian view)

> Readable summary of `c1v_QFD.json`. Full matrix is in `c1v_QFD.xlsx`.

**Winning concept:** `c1v Dual-Mode Platform (Option C, M4 score 0.662)`
**Produced:** 2026-04-20

## Metadata
- **project_title:** `c1v Dual-Mode Platform — House of Quality`
- **developed_by:** `David Ancor (Bond)`
- **last_updated:** `2026-04-20`

## Front porch (customer requirements)
Count: **6**

- `pc_id`: PC.1, `full_attribute`: The system shall impose minimal overhead on customer production systems it observes., `short_name`: Non-invasiveness, `relative_importance`: 0.2, `direction_of_change`: ↓
- `pc_id`: PC.2, `full_attribute`: The system shall deliver recommendations quickly after a metric deviation is detected., `short_name`: Feedback Latency, `relative_importance`: 0.2, `direction_of_change`: ↓
- `pc_id`: PC.3, `full_attribute`: The system shall back every tech-stack recommendation with a verifiable metric citation., `short_name`: Traceback Coverage, `relative_importance`: 0.2, `direction_of_change`: ↑
- `pc_id`: PC.4, `full_attribute`: The system shall generate a reviewable spec shortly after idea submission., `short_name`: Spec Gen Time, `relative_importance`: 0.16, `direction_of_change`: ↓
- `pc_id`: PC.5, `full_attribute`: The system shall emit the CLI bundle quickly after spec approval., `short_name`: CLI Emission, `relative_importance`: 0.12, `direction_of_change`: ↓
- `pc_id`: PC.6, `full_attribute`: The system shall feel responsive during founder intake conversation., `short_name`: Intake Response, `relative_importance`: 0.12, `direction_of_change`: ↓

## Second floor (engineering characteristics)
Count: **18**

- `ec_id`: 1, `name`: Probe frequency, `unit`: probes/min, `direction_of_change`: ↓
- `ec_id`: 2, `name`: Aggregation window, `unit`: min, `direction_of_change`: ↓
- `ec_id`: 3, `name`: Metric payload size, `unit`: KB, `direction_of_change`: ↓
- `ec_id`: 4, `name`: Probe batch size, `unit`: events/batch, `direction_of_change`: ↑
- `ec_id`: 5, `name`: LLM routing granularity, `unit`: scale 1-3, `direction_of_change`: target
- `ec_id`: 6, `name`: Parallel agent dispatch count, `unit`: agents, `direction_of_change`: ↑
- `ec_id`: 7, `name`: Prompt-cache hit rate, `unit`: %, `direction_of_change`: ↑
- `ec_id`: 8, `name`: Context tokens per agent call, `unit`: tokens, `direction_of_change`: ↓
- `ec_id`: 9, `name`: Traceback cache TTL, `unit`: hours, `direction_of_change`: target
- `ec_id`: 10, `name`: Citation completeness floor, `unit`: %, `direction_of_change`: ↑
- `ec_id`: 11, `name`: Vendor-doc refresh cadence, `unit`: days, `direction_of_change`: ↓
- `ec_id`: 12, `name`: Spec artifact format count, `unit`: formats, `direction_of_change`: ↓
- `ec_id`: 13, `name`: Quick Start step count, `unit`: steps, `direction_of_change`: ↓
- `ec_id`: 14, `name`: CLI bundle size, `unit`: MB, `direction_of_change`: ↓
- `ec_id`: 15, `name`: Founder intake turn budget, `unit`: ms, `direction_of_change`: ↓
- `ec_id`: 16, `name`: Streaming UI chunk cadence, `unit`: ms, `direction_of_change`: ↓
- `ec_id`: 17, `name`: Credential rotation cadence, `unit`: days, `direction_of_change`: ↓
- `ec_id`: 18, `name`: Audit log retention, `unit`: days, `direction_of_change`: target

## Main floor stats
- **total_cells:** `108`
- **nonzero_cells:** `35`
- **sparsity_pct:** `67.6`
- **meets_sparsity_threshold:** `True`
- **rows_without_nonzero:** `[]`
- **cols_without_nonzero:** `[]`

## Roof stats (EC↔EC correlations)
- **total_lower_triangle_pairs:** `153`
- **nonzero_pairs:** `14`
- **nonzero_pct:** `9.2`
- **tradeoffs_flagged_for_design_targets:**
  - EC1_EC2
  - EC2_EC4
  - EC5_EC6
  - EC9_EC11

## Imputed importance (actual)
> Superseded the original preview block. Values below are Excel-computed via SUMPRODUCT(ABS(col33:col44), $D33:$D44) and saved back to `c1v_QFD.json` → `_basement_imputed_importance_actual`. Ranked high → low.

| Rank | EC | Name | Imputed | Positive | Negative |
|---:|---|---|---:|---:|---:|
| 1  | EC8  | Context tokens per agent call    | 1.00 | 0.60 | -0.40 |
| 2  | EC7  | Prompt-cache hit rate            | 0.96 | 0.76 | -0.20 |
| 3  | EC1  | Probe frequency                  | 0.80 | 0.40 | -0.40 |
| 4  | EC10 | Citation completeness floor      | 0.76 | 0.40 | -0.36 |
| 5  | EC6  | Parallel agent dispatch count    | 0.64 | 0.64 |  0.00 |
| 6  | EC2  | Aggregation window               | 0.60 | 0.40 | -0.20 |
| 6  | EC3  | Metric payload size              | 0.60 | 0.60 |  0.00 |
| 8  | EC5  | LLM routing granularity          | 0.48 | 0.16 | -0.32 |
| 9  | EC12 | Spec artifact format count       | 0.44 | 0.44 |  0.00 |
| 10 | EC4  | Probe batch size                 | 0.40 | 0.20 | -0.20 |
| 10 | EC9  | Traceback cache TTL              | 0.40 | 0.40 |  0.00 |
| 10 | EC11 | Vendor-doc refresh cadence       | 0.40 | 0.20 | -0.20 |
| 13 | EC14 | CLI bundle size                  | 0.24 | 0.24 |  0.00 |
| 13 | EC15 | Founder intake turn budget       | 0.24 | 0.24 |  0.00 |
| 13 | EC16 | Streaming UI chunk cadence       | 0.24 | 0.24 |  0.00 |
| 16 | EC13 | Quick Start step count           | 0.16 | 0.16 |  0.00 |
| 17 | EC17 | Credential rotation cadence      | 0.12 | 0.00 | -0.12 |
| 18 | EC18 | Audit log retention              | 0.00 | 0.00 |  0.00 |

**Ranking change from preview to actual:** preview had a three-way tie at 0.80 ({EC1, EC2, EC8}); actuals show **EC8 alone at rank 1 (1.00)** and **EC7 promoted to rank 2 (0.96)**. The Orchestrator ↔ LLM-Provider interface (anchors EC7 + EC8, combined imputed 1.96) is now the dominant Module 6 interface.

## Weights check
- **sum:** `1.0`
- **note:** `Locked from M4 handoff. Raw 1-5 ratings: {PC.1:5, PC.2:5, PC.3:5, PC.4:4, PC.5:3, PC.6:3}; sum 25; normalized weights above.`

## Validation
- **weights_sum_to_1:** `True`
- **every_pc_has_nonzero_ec:** `True`
- **every_ec_has_nonzero_pc_or_flagged:**
  - **all_ecs_have_nonzero:** `False`
  - **zero_imputed_ecs:**
    - EC18
  - **ec18_rationale:** `Audit log retention (90d, operational-only in v1 per M4 D3) has no direct PC lever — retained in second floor as a compliance hygiene signal and M6 interfaces anchor, not a QFD optimization knob.`
- **roof_lower_triangle_only:** `True`
- **relationship_matrix_values_in_range:** `True`
- **competitor_names_filled:** `True`
- **no_writes_to_formula_cells:** `True`

## Open questions resolved in M5
- **Q1_probe_freq_vs_aggregation_tradeoff:** `EC1/EC2 roof pair scored -1. Targets: 6 probes/min + 60 min window. Both inside M1's 2% overhead ceiling while honoring PC.2 60 min target.`
- **Q2_routing_policy_granularity:** `EC5 target = 2 (per-session). Balances PC.4/PC.6 speed (per-request overhead) with PC.1 per-org simplicity. Per-session = 'once per founder session pick a mode, stick with it'.`
- **Q3_competitor_scoring:** `Devin + Cursor chosen. Per back_porch rationales.`
- **Q4_spec_gen_tighten_to_120s:** `Declined. EC12=1 (Mermaid only) + EC6=5 (parallel dispatch) + EC7=70% cache hit rate yields ~150-300s budget. 300s kept as PC.4 target; 150s becomes A(high) stretch.`
- **Q5_credential_rotation_tighten:** `EC17 target = 90d (unchanged). Compliance deferred to v2 per M4 D3. 30d would be premature without compliance driver.`

## Constants touched
- **finalized_in_m5:**
  - `constant`: PROBE_FREQUENCY_PER_MIN, `value`: 6, `driver`: EC1 target
  - `constant`: AGGREGATION_WINDOW_MIN, `value`: 60, `driver`: EC2 target (confirms M2)
  - `constant`: METRIC_PAYLOAD_KB_MAX, `value`: 4, `driver`: EC3 target
  - `constant`: PROBE_BATCH_SIZE, `value`: 50, `driver`: EC4 target
  - `constant`: PARALLEL_AGENT_DISPATCH, `value`: 5, `driver`: EC6 target
  - `constant`: PROMPT_CACHE_HIT_TARGET_PCT, `value`: 70, `driver`: EC7 target
  - `constant`: AGENT_CONTEXT_TOKENS_MAX, `value`: 8000, `driver`: EC8 target
  - `constant`: TRACEBACK_CACHE_TTL_HOURS, `value`: 24, `driver`: EC9 target
  - `constant`: VENDOR_DOC_REFRESH_DAYS, `value`: 7, `driver`: EC11 target
  - `constant`: SPEC_FORMAT_COUNT_V1, `value`: 1, `driver`: EC12 target (Mermaid only; confirms M4)
  - `constant`: QUICK_START_STEP_COUNT, `value`: 5, `driver`: EC13 target
  - `constant`: CLI_BUNDLE_SIZE_MB_MAX, `value`: 5, `driver`: EC14 target
  - `constant`: STREAMING_CHUNK_CADENCE_MS, `value`: 50, `driver`: EC16 target
- **still_estimate_after_m5_deferred_to_m6_or_v2:**
  - LLM_ROUTING_GRANULARITY_MODE (EC5 = per-session; confirm in Module 6 interfaces)
  - CITATION_COMPLETENESS_FLOOR_PCT (EC10 = 100%; already Final via PC.3 anchor — no change)
  - CREDENTIAL_ROTATION_DAYS (EC17 = 90d; compliance-driven, revisit in v2)
  - AUDIT_RETENTION_DAYS (EC18 = 90d; already Final via M4 D3)

## Module 6 interfaces preview
- **_note:** `Handoff preview — full interfaces_handoff.json lives in this directory. Ranking reflects actuals (Excel-computed), not preview.`
- **top_imputed_importance_ecs (ranked by actual imputed):**
  - rank 1 — `ec`: EC8 Context tokens, `imputed`: 1.00, `drives_interface`: Agent Orchestrator → LLM Provider Layer
  - rank 2 — `ec`: EC7 Prompt cache hit rate, `imputed`: 0.96, `drives_interface`: Agent Orchestrator → Prompt Cache → LLM Provider
  - rank 3 — `ec`: EC1 Probe frequency, `imputed`: 0.80, `drives_interface`: Probe SDK → Metrics Collector
  - rank 4 — `ec`: EC10 Citation floor, `imputed`: 0.76, `drives_interface`: Spec Generator → Traceback Store
  - rank 5 — `ec`: EC6 Parallel dispatch, `imputed`: 0.64, `drives_interface`: Agent Orchestrator internal (pool → agents)
  - rank 6 — `ec`: EC2 Aggregation window, `imputed`: 0.60, `drives_interface`: Collector → Metric Store
  - rank 7 — `ec`: EC3 Payload size, `imputed`: 0.60, `drives_interface`: Probe SDK → Collector (serialization contract)
  - rank 8 — `ec`: EC5 LLM routing, `imputed`: 0.48, `drives_interface`: Session Manager → LLM Provider Layer
- **_ranking_change_from_preview_to_actual:** Preview had 3-way tie ({EC1, EC2, EC8} at 0.80); actuals: EC8 alone at rank 1 (1.00), EC7 at rank 2 (0.96). Orchestrator ↔ LLM Provider (anchors EC7+EC8, combined 1.96) dominates M6.
- **interface_tradeoffs_flagged:**
  - EC1↔EC2 (-1): probe SDK ↔ aggregator contract must handle joint tuning
  - EC9↔EC11 (-2): traceback cache ↔ vendor-doc fetcher must coordinate invalidation
  - EC5↔EC6 (-1): routing policy ↔ parallel dispatch share a session token
  - EC2↔EC4 (-1): aggregation window ↔ batch size needs time-based flush fallback