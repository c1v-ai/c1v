---
title: Module 2 Delta — human-readable narrative
date: 2026-04-20
supplements: m2_delta.json (authoritative)
---

# M2 Delta — narrative

## What the audit found

M2 shipped 99 requirements and 28 constants. The audit against M4v2 / M5v2 / M7 findings surfaces **12 requirement gaps** and **14 constant gaps**, plus **2 constant renames** for vocabulary consistency.

### Keyword-audit heat map on existing 99 requirements

| Keyword | Hits | Verdict |
|---:|---:|---|
| observability | 5 | Weak — cross-cutting only (CC.R09); no first-class PC.7 requirement |
| detect (detectability / detection) | **0** | **Gap** — no MTTD requirement |
| monitor | **0** | **Gap** — no monitoring SLO |
| audit | 9 | OK baseline; missing split-policy (compliance vs telemetry) |
| credential | 5 | Present but scope+rotation mashed together |
| rotation | **0** | **Gap** — EC17b not covered |
| scope | 6 | Generic use; no binary scope-enforcement requirement |
| provider | 9 | OK baseline; missing redundancy-depth requirement |
| fallback | 1 | **Gap** — no EC19 requirement |
| redundancy | **0** | **Gap** — EC19 not covered |
| citation | 3 | Weak; no fail-closed gate requirement |
| traceback | 8 | OK baseline |

## The 12 new requirements (R.100 – R.111)

Grouped by driver:

### PC.7 Observability/Detectability (2)

- **R.100** MTTD correctness ≤ 120s — for F.13 / F.15 / F.18 citation-silence modes
- **R.101** MTTD telemetry ≤ 300s — for F.25 / F.27 / F.28 collector modes

### M4 v2 EC17 split (2)

- **R.102** Probe SDK enforces read-only at syscall layer (EC17a) — covers M7 F.23
- **R.103** Credential rotation with grace window (EC17b) — covers M7 F.32

### M4 v2 EC19 new (1)

- **R.104** Provider redundancy depth with (depth-1) failure tolerance — covers M7 F.7 / F.8

### M7 corrective-action implications (7)

- **R.105** Audit split-policy writes — covers M7 F.19 / F.34
- **R.106** Collector checkpointing — covers M7 F.25
- **R.107** Tiered flush-fallback batch — covers M7 F.26
- **R.108** Tiered traceback TTL — covers M7 F.15
- **R.109** Citation gate fail-closed — covers M7 F.13-c1
- **R.110** Mode-lock two-phase commit — covers M7 F.3
- **R.111** Probe SDK self-governor — covers M7 F.22

## The 14 constant promotions

| Constant | Value | Owner Req |
|---|---|---|
| `SS4_PROVIDER_FALLBACK_DEPTH` | 3 | R.104 |
| `METRIC_CHECKPOINT_INTERVAL_MIN` | 10 min | R.106 |
| `FLUSH_FALLBACK_BATCH_MIN_LOW_TRAFFIC` | 3 | R.107 |
| `FLUSH_FALLBACK_BATCH_MIN_DEFAULT` | 10 | R.107 |
| `TRACEBACK_CACHE_TTL_HOURS_HOT` | 6 hr | R.108 |
| `TRACEBACK_CACHE_TTL_HOURS_DEFAULT` | 24 hr | R.108 |
| `CITATION_CHECK_LATENCY_MAX_S` | 5 sec | R.109 |
| `AUDIT_WRITE_POLICY` | split | R.105 |
| `MTTD_CORRECTNESS_MAX_S` | 120 sec | R.100 |
| `MTTD_TELEMETRY_MAX_S` | 300 sec | R.101 |
| `PROBE_SDK_CAPABILITY_MODE` | readonly | R.102 |
| `CREDENTIAL_ROTATION_DAYS` | 90 days | R.103 |
| `CREDENTIAL_GRACE_WINDOW_MIN` | 15 min | R.103 |
| `MODE_LOCK_ACK_TIMEOUT_S` | 2 sec | R.110 |

## 2 renames for vocabulary consistency

- `ENCRYPTED_CREDENTIAL_EXPIRY_DAYS` → `CREDENTIAL_ROTATION_DAYS` (same value 90; aligns with M4v2 EC17b naming)
- `TRACEBACK_LATENCY_SEC` → `CITATION_CHECK_LATENCY_MAX_S` (same value 5; aligns with M7 vocabulary; adds "hard-reject on exceed" semantics)

## Owner-requirement backfill (bookkeeping)

M2's existing 28 constants currently have no `owner_requirement` links. The delta fills 14; the remaining 28 should be backfilled for audit-cleanness. 3-4 hrs of work, non-blocking.

## Blocking status for v1

**5 of the 14 constants are load-bearing for v1 acceptance tests** per the agent-swarm execution plan:

1. `SS4_PROVIDER_FALLBACK_DEPTH=3` — W1A chaos test
2. `METRIC_CHECKPOINT_INTERVAL_MIN=10` — W2B chaos test
3. `CITATION_CHECK_LATENCY_MAX_S=5` with hard-reject — W1C gate test
4. `AUDIT_WRITE_POLICY=split` — W1D compliance-write latency test
5. `MTTD_CORRECTNESS_MAX_S=120` — W3A FMEA-derived regression test

Without these in M2 constants, the agent briefs reference unowned thresholds and the traceability chain breaks. Merging the delta before or during Wave 1 is a 2-3 hr task (documentation-engineer).

## Files to edit

| File | Operation | Lines changed |
|---|---|---:|
| `requirements_table.json` | Append 12 entries to `requirements_table[]`, update `metadata.last_update` | ~250 |
| `constants_table.json` | Append 14 entries, rename 2, fill `owner_requirement` for 14 new + backfill 28 existing | ~170 |
| `ffbd-handoff.json` | Re-export: `constants` grows from 28 to 40; `functions` unchanged (M3 handles) | ~40 |

Total footprint ≈ 460 lines.
