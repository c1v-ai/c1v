# TC1 Wave-C Verification Report

**Branch:** `wave-c/tc1-m345-schemas`
**Head SHA verified against:** `e075dea` (deliverable head pre-verifier-commit)
**Tag target:** `wave-c/tc1-m345-schemas` HEAD at tag-time (this commit — includes verifier + report)
**Tag:** `tc1-wave-c-complete`
**Verified:** 2026-04-27
**Verifier agent:** qa-c-verifier (subagent_type: qa-engineer)
**Verifier script:** `apps/product-helper/scripts/verify-tc1.ts`

---

## Summary

| EC sub-point | Verdict | Evidence |
|---|---|---|
| EC-V21-C.0 — namespace resolution | PASS | tags resolve + alias; `module-5/` exists; legacy `module-5-form-function/` absent; tsc baseline = 9 errors at 5 expected paths; `CRAWLEY_SCHEMAS` length=10, no dup keys |
| EC-V21-C.1 — 10 schemas + sibling tests | PASS | 10 phase schemas + 1 matrix keystone + 11 sibling tests on disk; jest `lib/langchain/schemas/` → 30/30 suites, **258/258 tests** green in 0.992s |
| EC-V21-C.2 — `mathDerivationMatrixSchema` keystone + consumer count | PASS (with WARN note) | `module-5/_matrix.ts` exports keystone; phase-2 has 1 schema-layer site (`po_array_derivation`); phase-3 references matrix (used inside `fullDsmBlockDerivationEntrySchema` → 9 array entries) + 1 scalar `mathDerivationSchema` chain. Agent-emitter refactor DEFERRED to v2.2 per REQUIREMENTS-crawley §5 locality rule. |
| EC-V21-C.3 — 10 migrations + RLS | PASS | `0016`–`0025` all present + `ENABLE ROW LEVEL SECURITY` + `CREATE POLICY` per file; `migrations-apply-log.md` recorded clean apply against local pg `:54322`; jest `__tests__/db/crawley-rls.test.ts` → **102/102 tests** green in 0.493s |
| EC-V21-C.4 — LangSmith dataset | PASS | 10 `.jsonl` files at `lib/eval/datasets/`, each with exactly 30 lines; per-example shape validated (5 required keys + grade ∈ {correct, partial, wrong}); 10 reference-project fixtures at `__tests__/fixtures/reference-projects/ref-{001..010}.json`; jest `__tests__/eval/v2-eval-harness.test.ts` → **30/30 tests** green |
| EC-V21-C.5 — methodology page | PASS | `app/(dashboard)/about/methodology/page.tsx` pins canonical literal `system-design/kb-upgrade-v2/METHODOLOGY-CORRECTION.md`; `components/about/about-nav.ts` exposes `/about/methodology`; canonical doc present on disk; jest `__tests__/app/about/methodology.test.tsx` → **4/4 tests** green |
| EC-V21-C.6 — quarterly drift workflow | PASS | `.github/workflows/quarterly-drift-check.yml` present; cron pinned to `0 0 1 */3 *`; workflow invokes `scripts/quarterly-drift-check.ts` (line 50) |
| SMOKE-INTEGRATION | PASS | `lib/langchain/schemas/index.ts` barrel boots without duplicate-key warnings; `CRAWLEY_SCHEMAS.length === 10`; `mathDerivationMatrixSchema` parses canonical 2×2 identity fixture |

**Aggregate verdict:** 8/8 PASS, 0 FAIL → `tc1-wave-c-complete` tagged.

---

## Detailed evidence

### EC-V21-C.0 — namespace resolution

```
$ git rev-parse tc1-c0-complete
3e2abdf044bc63f1b19e365f30119e6841bf8722

$ git rev-parse tc1-preflight-complete
3e2abdf044bc63f1b19e365f30119e6841bf8722

$ git merge-base --is-ancestor tc1-c0-complete HEAD && echo OK
OK

$ git merge-base --is-ancestor tc1-preflight-complete HEAD && echo OK
OK

$ ls apps/product-helper/lib/langchain/schemas/module-5/  # exists
$ ls apps/product-helper/lib/langchain/schemas/module-5-form-function/ 2>&1
ls: ... No such file or directory

$ npx tsc --noEmit --project apps/product-helper/tsconfig.json 2>&1 | grep "error TS" | wc -l
9
```

The 9 baseline errors all match the expected paths from the namespace-resolver record (`db/schema/index.ts` ×4 traceback misses, `lib/langchain/engines/*` ×4, `scripts/atlas/validate-entries.ts` ×1). No NEW errors were introduced.

Registry no-dupes asserted inline:
- `CRAWLEY_SCHEMAS.length === 10`
- `new Set(CRAWLEY_SCHEMAS.map(s => s.schemaId)).size === 10`

### EC-V21-C.1 — schemas + tests

All 10 schema files at the expected paths (`module-5/phase-{1..5}-*.ts`, `module-3/decomposition-plane.ts`, `module-4/{decision-network-foundations, tradespace-pareto-sensitivity, optimization-patterns}.ts`, `module-2/requirements-crawley-extension.ts`). All 10 have a sibling `__tests__/<slug>.test.ts`. Matrix keystone has its own `_matrix.test.ts` sibling.

```
$ npx jest lib/langchain/schemas/
Test Suites: 30 passed, 30 total
Tests:       258 passed, 258 total
```

### EC-V21-C.2 — matrix keystone + schema-layer consumers

Keystone at `apps/product-helper/lib/langchain/schemas/module-5/_matrix.ts` exports `mathDerivationMatrixSchema` (sibling type to scalar `mathDerivationSchema`).

Schema-layer consumers verified by grep:

```
$ grep -n "mathDerivationMatrixSchema" apps/product-helper/lib/langchain/schemas/module-5/phase-2-function-taxonomy.ts
11: * mathDerivationMatrixSchema), value pathway.
16:import { mathDerivationMatrixSchema } from './_matrix';
162:    po_array_derivation: mathDerivationMatrixSchema.describe(

$ grep -n "mathDerivationMatrixSchema" apps/product-helper/lib/langchain/schemas/module-5/phase-3-form-function-concept.ts
10: * full DSM with 9 mathDerivationMatrixSchema records + 1 scalar projection
20:import { mathDerivationMatrixSchema } from './_matrix';
209:  derivation: mathDerivationMatrixSchema,    # used inside fullDsmBlockDerivationEntrySchema (9-array consumer)

$ grep -n "dsm_projection_chain_derivation" apps/product-helper/lib/langchain/schemas/module-5/phase-3-form-function-concept.ts
228:    dsm_projection_chain_derivation: mathDerivationSchema.describe(
```

**Counts (per crawley-schemas ship report):** 10 matrix sites = 1 (phase-2 PO array) + 9 (phase-3 full_dsm block derivations via array of `fullDsmBlockDerivationEntrySchema`) + 1 scalar projection chain.

**Notable WARN:** Agent-emitter sites (e.g. `form-function-agent.ts`, `synthesis-agent.ts`) currently emit pre-Crawley shapes that do NOT yet populate the new matrix-derivation fields. Per REQUIREMENTS-crawley §5 locality rule + the crawley-schemas ship report, the **schema-layer count is the EC-C.2 gate**, not the emitter count. Agent-emitter refactor is explicitly DEFERRED to v2.2. The schema gate is now closed and will reject future emissions that omit/mistype these fields.

### EC-V21-C.3 — migrations + RLS

10 SQL migration files (`0016`–`0025`) on disk; each contains `ENABLE ROW LEVEL SECURITY` and `CREATE POLICY` directives. Apply log captured at `plans/v22-outputs/tc1/migrations-apply-log.md` shows clean apply against local Supabase (`postgresql://postgres:postgres@localhost:54322/postgres`) with no errors (only expected `trigger does not exist, skipping` notices on first apply).

```
$ npx jest __tests__/db/crawley-rls.test.ts
Test Suites: 1 passed, 1 total
Tests:       102 passed, 102 total
```

EXPLAIN plans verified per migration via the test's `EXPLAIN uses project_id UNIQUE index` and `EXPLAIN uses decomposition_plane index` (M3 hoisted column) cases.

### EC-V21-C.4 — LangSmith dataset

```
$ for f in decision-net form-function hoq fmea-early fmea-residual interface-specs n2 data-flows nfr-resynth architecture-recommendation; do
    wc -l apps/product-helper/lib/eval/datasets/${f}.jsonl
  done
30 lines × 10 files = 300 examples total
```

Per-example shape: every line parses as JSON; required keys (`input`, `expected_output`, `grade`, `graded_at`, `grader`) all present; `grade ∈ {correct, partial, wrong}` for all 300 examples.

10 anonymized reference-project fixtures present at `apps/product-helper/__tests__/fixtures/reference-projects/ref-001.json`–`ref-010.json`.

```
$ npx jest __tests__/eval/v2-eval-harness.test.ts
Test Suites: 1 passed, 1 total
Tests:       30 passed, 30 total
```

### EC-V21-C.5 — methodology page

```
$ grep -n "system-design/kb-upgrade-v2/METHODOLOGY-CORRECTION.md" apps/product-helper/app/\(dashboard\)/about/methodology/page.tsx
13:const CANONICAL_REL = 'system-design/kb-upgrade-v2/METHODOLOGY-CORRECTION.md';

$ grep -n "/about/methodology" apps/product-helper/components/about/about-nav.ts
13:    href: '/about/methodology',

$ npx jest __tests__/app/about/methodology.test.tsx
Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
```

The page reads the canonical Markdown via `fs.readFileSync` at request-time (server component) and pipes through the existing `MarkdownRenderer`. Snapshot test asserts: canonical path readable from disk, three-pass overview rendered, nav entry exposed, page source pins the literal canonical relative path.

### EC-V21-C.6 — quarterly drift workflow

```
$ grep -n "schedule\|cron\|quarterly-drift-check\.ts" .github/workflows/quarterly-drift-check.yml
7:  schedule:
8:    - cron: '0 0 1 */3 *'
50:          pnpm tsx scripts/quarterly-drift-check.ts --out=drift-report.md
```

Cron `0 0 1 */3 *` fires Jan 1 / Apr 1 / Jul 1 / Oct 1 @ 00:00 UTC. Manual trigger via `gh workflow run quarterly-drift-check.yml`. On drift, the workflow opens a labelled issue tagging `@team-c1v`.

### SMOKE-INTEGRATION

The verifier dynamic-imports `apps/product-helper/lib/langchain/schemas/index.ts`, asserts `CRAWLEY_SCHEMAS.length === 10`, and round-trips a canonical 2×2 identity fixture through `mathDerivationMatrixSchema.safeParse(...)`. No duplicate-key warnings emitted during barrel boot.

---

## Notable findings

### 1. Schema barrel shadowing (WARN-level, not blocking C.1)

`apps/product-helper/lib/langchain/schemas.ts` (the legacy file) shadows the new `apps/product-helper/lib/langchain/schemas/index.ts` directory barrel under Node bundler resolution. The new barrel is reachable only via explicit subpath imports:

```ts
import {...} from '@/lib/langchain/schemas/index';
import {...} from '@/lib/langchain/schemas/module-5/_matrix';
```

Documented inline in the new file's header. Module-level registries (`MODULE_2_PHASE_SCHEMAS`, etc.) remain canonical for `generate-all.ts` / preload bundles. The root barrel is for cross-module discovery (verifier / docs / future Wave-D consumers) only.

### 2. Agent-emitter matrix-site refactor DEFERRED to v2.2

Per crawley-schemas ship report and REQUIREMENTS-crawley §5 locality rule: the schema-layer count is the EC-C.2 gate. Agent-layer emitters (`form-function-agent.ts`, `synthesis-agent.ts`, etc.) currently emit pre-Crawley shapes that do NOT populate `po_array_derivation` or `full_dsm_block_derivations`. Migration of agent emitters to populate these new matrix-derivation fields is a Wave-D / v2.2 concern. The schema gate is closed and will reject any future emissions that omit/mistype these fields.

### 3. Curator-call: M3 + M2 supplements as NEW tables (not column extensions)

REQUIREMENTS-crawley §6 left two destinations to the schema-owner team. Both resolved to NEW TABLES rather than column-extensions on existing tables, since neither `m3_*` nor `m2_phase_6_requirements_table` exists on disk today. Documented in `migrations-mapping.md`.

### 4. postgres-js jsonb binding gotcha (memory candidate)

`crawley-rls.test.ts` discovered that postgres-js binds JS objects to `jsonb` columns directly without an explicit `::jsonb` cast — adding the cast actually breaks the binding. Worth promoting to project memory: when writing tenant-scoped jsonb tests with postgres-js, bind the JS object as-is and let the driver handle the type adaptation.

### 5. `projects` table RLS gap (inherited from v2.1)

Wave-C tenant SELECT EXISTS subqueries against the legacy `projects` table return 0 rows for any non-superuser caller until `projects` gets tenant policies (`plans/post-v2-followups.md` P3). The crawley-rls test installs a temporary `rls_test_tmp_projects_select_all` policy in setUp + tears it down in finally — same workaround as `project-artifacts-rls.test.ts`. NOT introduced by Wave-C.

### 6. tc1 tags unchanged post-rebase (no-op)

Per `_step2-tags.md`: the namespace-resolver commit `3e2abdf` was an ancestor of `wave-b/v2.1.1-hotfix` BEFORE the Wave-C rebase, so the rebase did not move it. Both `tc1-c0-complete` and `tc1-preflight-complete` still resolve to the same SHA pre- and post-rebase. The verifier reads tags by name and gets the post-rebase truth without any tag mutation.

---

## Tag

```
$ git tag tc1-wave-c-complete <HEAD-of-wave-c/tc1-m345-schemas>
$ git push origin tc1-wave-c-complete
```

Branch HEAD =
> test(tc1/verifier): verify-tc1.ts + verification-report.md + tc1-wave-c-complete tag
