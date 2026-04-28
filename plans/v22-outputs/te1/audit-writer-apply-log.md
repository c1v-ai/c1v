# Audit-Writer Apply Log — TE1 EC-V21-E.3

**Date:** 2026-04-27
**Branch:** `wave-e/te1-audit-writer`
**Worktree:** `/Users/davidancor/Projects/c1v-worktrees/te1-audit-writer/`
**DB target:** local Supabase `postgresql://postgres:postgres@localhost:54322/postgres`

---

## Schema migration

**No DELTA migration shipped.** Per the column-mapping verification at
`plans/v22-outputs/te1/audit-writer-column-mapping.md`, the existing
`0011b_decision_audit.sql` table covers every `WaveEEngineOutput` field
1:1; the two Wave-E-only fields (`nfr_engine_contract_version`, `status`)
are derivable from in-code constants + existing columns.

The append-only trigger / RLS policies / REVOKE grants from
`0011b_decision_audit.sql` are unchanged — re-shaping them would break
the v2.1 audit-trail tamper-detection contract.

---

## Local DB smoke

### `__tests__/engine/audit-trail.test.ts`

```
$ POSTGRES_URL=postgresql://postgres:postgres@localhost:54322/postgres ... npx jest __tests__/engine/audit-trail.test.ts

PASS __tests__/engine/audit-trail.test.ts
  evaluateWaveE → writeAuditRow E2E (EC-V21-E.3)
    ✓ 10 sequential evaluations write 10 chained rows (128 ms)
    ✓ tampering a prior row breaks the chain (verifyChain detects) (19 ms)
    ✓ canonicalHash is deterministic across reads (6 ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Time:        0.325 s
```

### `__tests__/.../wave-e-evaluator.test.ts`

```
$ POSTGRES_URL=postgresql://stub:stub@localhost:1/stub ... npx jest lib/langchain/engines/__tests__/wave-e-evaluator.test.ts

PASS lib/langchain/engines/__tests__/wave-e-evaluator.test.ts
  ... 13 existing boundary tests + 3 new audit-context guard tests ...

Test Suites: 1 passed, 1 total
Tests:       16 passed, 16 total
Time:        0.161 s
```

(The original 13 tests now pass `{ skipAudit: true }`. The 3 new tests verify
the production guard: missing `auditContext` throws when audit isn't skipped.)

### `scripts/verify-decision-audit-chain.ts`

Valid 10-row chain (project 694, the audit-trail.test 10-eval fixture):

```
$ npx tsx scripts/verify-decision-audit-chain.ts --projectId=694; echo "EXIT=$?"

[verify-chain] project 694 target_field=constants_table.AUDIT_SMOKE_FIELD: VALID (10 rows)
[verify-chain] project 694: 1 stream(s), 10 row(s), ALL VALID.
EXIT=0
```

Tampered 3-row chain (project 695, the audit-trail.test tamper-detect fixture):

```
$ npx tsx scripts/verify-decision-audit-chain.ts --projectId=695; echo "EXIT=$?"

[verify-chain] project 695 target_field=constants_table.AUDIT_SMOKE_FIELD: BROKEN
  at row ea47de57-e7ef-41ed-9de1-6e42dc063996
  (expected hash_chain_prev=6c3c7df67dc0b0d4ac99a39dd10419bb7ee49024766ddf78df53dfd4b1783255,
   actual=034d61b15e8e0bfce9903d185f0412f235f63fcc2449eda60fe7a0c3aa6723fa);
  3 rows checked.
[verify-chain] project 695: 1 stream(s), 3 row(s), 1 BROKEN.
EXIT=2
```

Exit codes confirmed: `0` valid, `2` broken (per spec).

---

## tsc

```
$ npx tsc --noEmit --project tsconfig.json   # filtered to changed files
(clean)
```

Pre-existing errors elsewhere in the tree (cherry-pick remnants, unrelated
files) are unchanged from baseline `wave-e/te1-integration` HEAD `6d37a7f`.

---

## Files shipped this branch

| File                                                                                      | Status     |
|-------------------------------------------------------------------------------------------|------------|
| `plans/v22-outputs/te1/audit-writer-column-mapping.md`                                    | new doc    |
| `plans/v22-outputs/te1/audit-writer-apply-log.md` (this file)                             | new doc    |
| `apps/product-helper/lib/langchain/engines/wave-e-evaluator.ts`                           | refactored |
| `apps/product-helper/lib/langchain/engines/__tests__/wave-e-evaluator.test.ts`            | additive   |
| `apps/product-helper/__tests__/engine/audit-trail.test.ts`                                | new test   |
| `apps/product-helper/scripts/verify-decision-audit-chain.ts`                              | new CLI    |

**Files NOT shipped (out of scope per task contract):**

- `apps/product-helper/lib/db/migrations/0011b_decision_audit.sql` — unchanged.
- `apps/product-helper/lib/langchain/engines/audit-writer.ts` — unchanged.
- `apps/product-helper/lib/db/queries/decision-audit.ts` — unchanged.

---

## Production rollout

Out of scope per task contract. Coordinator owns the production apply.
The local smoke confirms the wire-up + chain-verifier behaviour against
`0011b_decision_audit.sql` as deployed. Production already ships the same
table shape from the runtime peer's 2026-04-22 deploy.
