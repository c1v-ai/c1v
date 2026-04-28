# Audit-Writer Column Mapping — `WaveEEngineOutput` → `decision_audit`

**Date:** 2026-04-27
**Author:** audit-writer (TE1)
**Verdict:** **0 schema gaps.** No DELTA migration required.

---

## Sources verified

- `apps/product-helper/lib/db/migrations/0011b_decision_audit.sql` — SHIPPED 2026-04-22 (runtime peer).
- `apps/product-helper/lib/db/schema/decision-audit.ts` — Drizzle row.
- `apps/product-helper/lib/langchain/engines/audit-writer.ts` — canonical `writeAuditRow()` + `auditInputFromEngineOutput()` mapper.
- `apps/product-helper/lib/langchain/engines/nfr-engine-interpreter.ts` line 126 — `EngineOutput` interface.
- `apps/product-helper/lib/langchain/engines/wave-e-evaluator.ts` line 63 — `WaveEEngineOutput extends EngineOutput`.

`WaveEEngineOutput` adds **only two** fields on top of `EngineOutput`:

| Wave-E-only field             | Type                  | Audit relevance                                                                    |
|-------------------------------|-----------------------|------------------------------------------------------------------------------------|
| `nfr_engine_contract_version` | `'v1'` (FROZEN)       | Pinned global constant; not row-varying. Pin lives in code; no column needed.      |
| `status`                      | `'ready' \| 'needs_user_input' \| 'failed'` | Derivable from `auto_filled` + `needs_user_input` columns; no new column needed.   |

Status derivation:

- `status === 'ready'`              ⇔ `auto_filled === true  && needs_user_input === false`
- `status === 'needs_user_input'`   ⇔ `auto_filled === false && needs_user_input === true`
- `status === 'failed'`             ⇔ `auto_filled === false && needs_user_input === false` (engine raised; row written for incident-response)

The `decision_audit_disposition_chk` constraint (`NOT (auto_filled=true AND needs_user_input=true)`) is the existing DB-level guard.

---

## Field → column mapping

| `WaveEEngineOutput` field         | `decision_audit` column          | Status             | Notes                                                                                  |
|-----------------------------------|----------------------------------|--------------------|----------------------------------------------------------------------------------------|
| `decision_id`                     | `decision_id` (text)             | covered            | 1:1.                                                                                   |
| `target_field`                    | `target_field` (text)            | covered            | 1:1. Hash-chain stream key alongside `project_id`.                                     |
| `value`                           | `value` (jsonb)                  | covered            | 1:1. JSONB round-trips number \| string \| null.                                       |
| `units`                           | `units` (text)                   | covered            | 1:1, optional → nullable.                                                              |
| `base_confidence`                 | `base_confidence` (numeric 4,3)  | covered            | 1:1. Writer uses `.toFixed(3)` for postgres-js numeric binding.                        |
| `matched_rule_id`                 | `matched_rule_id` (text)         | covered            | 1:1, nullable.                                                                         |
| `inputs_used`                     | `inputs_used` (jsonb)            | covered            | 1:1. Default `{}`.                                                                     |
| `modifiers_applied`               | `modifiers_applied` (jsonb)      | covered            | 1:1. Array shape preserved.                                                            |
| `final_confidence`                | `final_confidence` (numeric 4,3) | covered            | 1:1. Same numeric encoding as base.                                                    |
| `auto_filled`                     | `auto_filled` (boolean)          | covered            | 1:1.                                                                                   |
| `needs_user_input`                | `needs_user_input` (boolean)     | covered            | 1:1.                                                                                   |
| `computed_options`                | `computed_options` (jsonb)       | covered            | 1:1. Invariant #3 enforced by `decision_audit_computed_options_chk`.                   |
| `math_trace`                      | `math_trace` (text NOT NULL)     | covered            | 1:1.                                                                                   |
| `missing_inputs`                  | `missing_inputs` (text[])        | covered            | 1:1.                                                                                   |
| `nfr_engine_contract_version`     | (none — derive from code pin)    | derived-in-code    | FROZEN at `'v1'`; pinned in `wave-e-evaluator.ts:50`. No column needed.                |
| `status`                          | (none — derive from disposition) | derived-in-code    | Reconstruct from `auto_filled` + `needs_user_input`. No column needed.                 |

### Caller-supplied (covered by `auditInputFromEngineOutput` args, not on EngineOutput)

| Caller-supplied input  | `decision_audit` column          | Status   |
|------------------------|----------------------------------|----------|
| `projectId`            | `project_id` (integer FK)        | covered  |
| `agentId`              | `agent_id` (text)                | covered  |
| `targetArtifact`       | `target_artifact` (text)         | covered  |
| `storyId`              | `story_id` (text)                | covered  |
| `engineVersion`        | `engine_version` (text)          | covered  |
| `modelVersion`         | `model_version` (text)           | covered  |
| `ragAttempted`         | `rag_attempted` (boolean)        | covered  |
| `kbChunkIds`           | `kb_chunk_ids` (uuid[])          | covered  |
| `userOverrideable`     | `user_overrideable` (boolean)    | covered  |

### Writer-computed (do not pass through)

| Field                  | Source                                            |
|------------------------|---------------------------------------------------|
| `id`                   | `gen_random_uuid()` DB default                    |
| `hash_chain_prev`      | `canonicalHash(prevRow)` per stream lookup        |
| `evaluated_at`         | `now()` DB default                                |
| `override_history`     | `[]` default (overrides append later rows; never edits this row) |

---

## Verdict

**0 columns to add.** **0 columns to extend.** **No DELTA migration shipped.**

The runtime peer's 2026-04-22 row shape already maps `EngineOutput` 1:1, and the only Wave-E additions (`nfr_engine_contract_version`, `status`) are derivable from existing columns + code pins. Per the task guardrail "*If existing `0011b_decision_audit.sql` already includes some of the columns you'd need: SKIP those in the DELTA migration*" — applied to the limit case (all columns covered), we ship no migration at all.

Wire-up plan: `evaluateWaveE()` calls `auditInputFromEngineOutput()` then `writeAuditRow()` synchronously (`skipAudit !== true`). No table change.
