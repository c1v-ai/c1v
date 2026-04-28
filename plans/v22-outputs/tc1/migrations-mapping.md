# Wave C — Crawley Drizzle migrations mapping

**Branch:** `wave-c/tc1-m345-schemas`
**EC:** EC-V21-C.3
**Author:** crawley-migrations agent
**Date:** 2026-04-27
**Spec:** `plans/crawley-sys-arch-strat-prod-dev/REQUIREMENTS-crawley.md` §6
**Hard-dep tag:** `tc1-preflight-complete` @ `3e2abdf`

## Numbering

Pre-Wave-C max migration on disk: `0015_conversations_pending_answer.sql`. Wave-C
adds 10 sequential migrations `0016`–`0025`. One Crawley schema landing per
migration file — chosen over collapsing logically related tables to keep the
1:1 mapping reviewer-traceable and to make per-tenant RLS audit per file clean.

## Curator-call decisions

REQUIREMENTS-crawley §6 leaves two destinations to the schema-owner team:

1. **M3 decomposition-plane:** "new col on existing m3 table OR new table —
   Curator's call." → **NEW TABLE** (`m3_decomposition_plane`). No existing
   `m3_*` table on disk, and the supplement carries its own `_phase_status`
   lifecycle independent of M3's main FFBD/decomposition phases. Adding a
   column to a non-existent table would conflate provenance.

2. **M2 requirements-crawley-extension:** "extension columns on existing
   `m2_phase_6_requirements_table` OR new table — Curator's call." → **NEW
   TABLE** (`m2_requirements_crawley_extension`). No `m2_phase_6_*` table
   exists on disk (M2 phases live in `project_data.problemStatement` /
   `extractedData` blobs today). Creating a sibling extension table avoids
   coupling Wave-C delivery to a future M2-table-extraction effort.

## Table-by-table mapping

| # | File | Table | Source schema | RLS | Indexes |
|---|------|-------|---------------|-----|---------|
| 0016 | `0016_m5_phase_1_form_taxonomy.sql` | `m5_phase_1_form_taxonomy` | `module-5.phase-1-form-taxonomy.v1` | ✅ day-one | `(project_id)` UNIQUE, `(phase_status)` |
| 0017 | `0017_m5_phase_2_function_taxonomy.sql` | `m5_phase_2_function_taxonomy` | `module-5.phase-2-function-taxonomy.v1` | ✅ day-one | `(project_id)` UNIQUE, `(phase_status)` |
| 0018 | `0018_m5_phase_3_form_function_concept.sql` | `m5_phase_3_form_function_concept` | `module-5.phase-3-form-function-concept.v1` | ✅ day-one | `(project_id)` UNIQUE, `(phase_status)` |
| 0019 | `0019_m5_phase_4_solution_neutral_concept.sql` | `m5_phase_4_solution_neutral_concept` | `module-5.phase-4-solution-neutral-concept.v1` | ✅ day-one | `(project_id)` UNIQUE, `(phase_status)` |
| 0020 | `0020_m5_phase_5_concept_expansion.sql` | `m5_phase_5_concept_expansion` | `module-5.phase-5-concept-expansion.v1` | ✅ day-one | `(project_id)` UNIQUE, `(phase_status)` |
| 0021 | `0021_m3_decomposition_plane.sql` | `m3_decomposition_plane` | `module-3.decomposition-plane.v1` | ✅ day-one | `(project_id)` UNIQUE, `(decomposition_plane)` |
| 0022 | `0022_m4_decision_network_foundations.sql` | `m4_decision_network_foundations` | `module-4.decision-network-foundations.v1` | ✅ day-one | `(project_id)` UNIQUE, `(phase_status)` |
| 0023 | `0023_m4_tradespace_pareto_sensitivity.sql` | `m4_tradespace_pareto_sensitivity` | `module-4.tradespace-pareto-sensitivity.v1` | ✅ day-one | `(project_id)` UNIQUE, `(phase_status)` |
| 0024 | `0024_m4_optimization_patterns.sql` | `m4_optimization_patterns` | `module-4.optimization-patterns.v1` | ✅ day-one | `(project_id)` UNIQUE, `(phase_status)` |
| 0025 | `0025_m2_requirements_crawley_extension.sql` | `m2_requirements_crawley_extension` | `module-2.requirements-crawley-extension.v1` | ✅ day-one | `(project_id)` UNIQUE, `(phase_status)` |

## Common shape

Every Crawley table follows the same pattern:

```
id              serial PRIMARY KEY
project_id      integer NOT NULL REFERENCES projects(id) ON DELETE CASCADE
                  -- UNIQUE: one artifact row per project, mutated in place
phase_status    text NOT NULL  -- 'planned' | 'in_progress' | 'complete' | 'needs_revision'
schema_id       text NOT NULL  -- frozen literal e.g. 'module-5.phase-1-form-taxonomy.v1'
payload         jsonb NOT NULL -- typed JSONB matching the Zod schema's full shape
created_at      timestamptz NOT NULL DEFAULT now()
updated_at      timestamptz NOT NULL DEFAULT now()  -- trigger-maintained
```

Plus per-table CHECK constraints validating `jsonb_typeof(payload) = 'object'`
and `phase_status IN ('planned','in_progress','complete','needs_revision')`.
M3's decomposition-plane carries an additional `decomposition_plane` text
column hoisted out of payload for index access (Crawley's 13 planes drive
filterable cross-project comparisons).

## RLS pattern (mirror v2.1 T6 `project_run_state` 0013)

Five policies per table:

1. `<table>_service_all` — `app.current_role = 'service'` PERMISSIVE FOR ALL
   (sidecar / orchestrator writers).
2. `<table>_tenant_select` — EXISTS join to `projects.team_id =
   app.current_team_id`, `app.current_role IN ('tenant','service','user')`.
3. `<table>_tenant_insert` — same EXISTS WITH CHECK.
4. `<table>_tenant_update` — same EXISTS USING + WITH CHECK.
5. **NO DELETE policy** — audit retention; rows persist until project cascade.

`app.current_role` accepts `'service'` | `'user'` (per teammate-message spec)
plus `'tenant'` (legacy from `project_run_state` 0013 — kept for back-compat
with existing helpers). DELETE is policy-omitted, not explicitly denied — RLS
defaults DENY when no policy applies.

## Anti-pattern explicitly avoided

The legacy `projects` table has RLS enabled with **zero** tenant policies (the
documented gap in `plans/post-v2-followups.md` P3 security pass). The Wave-C
tenant SELECT EXISTS subqueries against `projects` will return 0 rows for any
non-superuser caller until that gap is closed — a known constraint inherited
from v2.1 closeout, NOT introduced by Wave-C. The Wave-C RLS smoke tests
install a temporary `rls_test_tmp_projects_select_all` policy for the
duration of cross-tenant test runs (same workaround as
`project-artifacts-rls.test.ts`) and tear it down in `finally`.

## Verification recipe

```bash
# 1. Apply each migration via psql (drizzle-kit broken per memory)
for f in apps/product-helper/lib/db/migrations/00{16,17,18,19,20,21,22,23,24,25}_*.sql; do
  echo "=== applying $f ==="
  psql postgresql://postgres:postgres@localhost:54322/postgres -f "$f"
done

# 2. RLS smoke test (cross-tenant + service-role)
cd apps/product-helper
POSTGRES_URL=stub AUTH_SECRET=stubstubstubstubstubstubstubstubstub \
  ANTHROPIC_API_KEY=sk-ant-stub STRIPE_SECRET_KEY=sk_test_stub \
  STRIPE_WEBHOOK_SECRET=whsec_stub OPENROUTER_API_KEY=stub \
  BASE_URL=http://localhost:3000 \
  npx jest __tests__/db/crawley-rls.test.ts
```

Apply log captured at `migrations-apply-log.md`.

## Schema-vs-curator drift findings

(Filled in after apply.)
