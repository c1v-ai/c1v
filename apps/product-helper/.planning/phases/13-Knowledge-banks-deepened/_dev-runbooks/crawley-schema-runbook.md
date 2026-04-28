# Crawley Schema Operator Runbook

**Audience:** future contributors adding/extending Crawley typed schemas in `apps/product-helper/lib/langchain/schemas/`.
**Authoritative source:** `plans/crawley-sys-arch-strat-prod-dev/REQUIREMENTS-crawley.md`. This runbook is an operational distillation; if it disagrees with REQUIREMENTS-crawley, REQUIREMENTS-crawley wins.
**Wave C tag:** `tc1-wave-c-complete` @ `f5992639` (11 schemas: 10 phase artifacts + 1 matrix keystone).

---

## §1 — When to extend an existing schema vs add a new one

REQUIREMENTS-crawley §1 + §3 give the curator's locality rule. Three scenarios:

| Scenario | What to do | Example |
|---|---|---|
| New REQUIREMENTS-crawley §X.Y phase artifact appears | Add a NEW `phase-N-<slug>.ts` file under the matching `module-<n>/` folder. Register in `module-<n>/index.ts` AND in `lib/langchain/schemas/index.ts` `CRAWLEY_SCHEMAS`. | M5 phase 6 hypothetical addition. |
| Crawley-discipline supplement to an existing module that already has a non-Crawley `phase-N-<slug>.ts` | Add a NEW supplement file (e.g. `requirements-crawley-extension.ts`, `decomposition-plane.ts`). DO NOT modify the existing v2.1 file. | M2 v2.1 NFR table + M2 Crawley needs-to-goals → two coexisting schemas. |
| New optional field on an already-shipped Crawley schema | Extend in-place via `.extend({...})` AND bump `_schema` literal (`v1` → `v2`). DO NOT silently widen a `v1` shape. | Adding `crawley_section` field to `tradespaceParetoSensitivity` → mint `module-4.tradespace-pareto-sensitivity.v2`. |

**Curator decision precedent (Wave C):** M3 + M2 supplements ship as NEW tables/schemas, not column-extensions of v2.1 shapes. Rationale recorded in `plans/v22-outputs/tc1/schemas-shipped.md`. This couples cleanly with future M2/M3 table-extraction work; column-extension would have prematurely entangled Crawley fields with c1v-scoped Concept-stage shapes.

**ZERO modifications to `module-2/_shared.ts`** — Crawley enums live phase-local on the supplement file (REQUIREMENTS-crawley §1).

---

## §2 — Locality rule for shared primitives

REQUIREMENTS-crawley §5 governs matrix-valued / cross-module primitives:

- **Stays module-local until ≥ 3 non-origin sites consume it.** Today: `mathDerivationMatrixSchema` lives at `module-5/_matrix.ts` because consumers are M5-phase-2 (1 × `po_array_derivation`) + M5-phase-3 (9 × `full_dsm_block_derivations`). HoQ (M6) and N2 (M7) are PRE-EXISTING structural matrices with their own JSONB shapes — they're NOT consumers.
- **Promotion to `module-2/_shared.ts`** only triggers on a 3rd non-M5 site. When that happens: move the primitive, update `CRAWLEY_MATRIX_KEYSTONE`'s `sourcePath`, leave a re-export shim at `module-5/_matrix.ts` for one cycle, then remove.

**Sentinel separation:** the matrix keystone is exported as `CRAWLEY_MATRIX_KEYSTONE` (singular) and is INTENTIONALLY NOT in the `CRAWLEY_SCHEMAS` array — it's a primitive, not a phase artifact. The `__tests__/schemas/registry-no-dupes.test.ts` test enforces this separation.

---

## §3 — Schema registry gate

`lib/langchain/schemas/index.ts` exports two registries:

```ts
export const CRAWLEY_SCHEMAS: readonly CrawleySchemaEntry[] = [...]; // 10 phase artifacts
export const CRAWLEY_MATRIX_KEYSTONE = {...};                        // 1 primitive sentinel
```

Each `CrawleySchemaEntry` carries: `schemaId`, `schema` (the Zod), `sourcePath`, and Crawley reference. Adding a new schema requires:

1. Append a new `{schemaId, schema, sourcePath, crawleyRef}` row to `CRAWLEY_SCHEMAS`.
2. Confirm `__tests__/schemas/registry-no-dupes.test.ts` still passes:
   - No duplicate `schemaId` strings.
   - No duplicate `sourcePath` strings.
   - Keystone `schemaId` does NOT appear in the `CRAWLEY_SCHEMAS` array.
   - Per-row count assertion (currently `toHaveLength(10)`) — bump when you add.
3. Confirm the schema file has file-level JSDoc with: `@source`, `@kbSource`, `@since`, `@evidenceTier`, `@consumers`, `@driftPolicy`. (Convention from Wave C — see any of the 11 shipped schemas as templates.)

---

## §4 — Eval dataset format + grading rubric

Each v2 agent owns one JSONL dataset at `apps/product-helper/lib/eval/datasets/<agent>.jsonl`. One example per line:

```jsonl
{"id":"<sha256-of-stableStringify(input).slice(0,16)>","agent":"<AgentName>","input":{"projectIntake":...,"upstreamArtifacts":...},"expected_output":{"_schema":"<schemaId>",...},"grade":"correct"|"partial"|"wrong","graded_at":"<ISO-8601>","grader":"human"|"fixture-replay"|"self-application","metadata":{"judge_model":"...","judge_prompt":"...","source":"..."}}
```

**Rubric:** the harness's `scoreOutput()` (in `apps/product-helper/lib/eval/v2-eval-harness.ts`) grades by:
- `wrong` → runner threw, returned null, OR `_schema` literal mismatch.
- `correct` → exact JSON-stringify match.
- `partial` → ≥ 70 % top-level key overlap, content drifts.

**Adding examples:**
1. Run agent against a curated fixture; capture input + output.
2. Hand-grade against rubric (use `human` grader for new examples).
3. Append the JSONL line. ID via `hashInput()` from the harness — must be a stable hash of the input.
4. Re-run `pnpm tsx apps/product-helper/scripts/run-eval-harness.ts --agent=<name>` and confirm pass-rate doesn't regress beyond EC-V21-C.4 floor.

**Per-agent floor:** 30 examples (EC-V21-C.4). 18 correct / 8 partial / 4 wrong is the canonical distribution per agent.

---

## §5 — Quarterly drift-check job

`apps/product-helper/scripts/quarterly-drift-check.ts` snapshots agent emissions over 10 anonymized reference projects (`apps/product-helper/__tests__/fixtures/reference-projects/ref-{001..010}.json`) for each of the 10 v2 agents = 100 input-hash comparisons.

- **Cron schedule:** `0 0 1 */3 *` (Jan 1 / Apr 1 / Jul 1 / Oct 1 @ 00:00 UTC) via `.github/workflows/quarterly-drift-check.yml`.
- **Workflow dispatch:** allowed for ad-hoc runs (e.g., post-LLM-version bump).
- **Output:** report uploaded as workflow artifact. On non-zero exit, the workflow opens a GitHub issue tagged `@team-c1v`.
- **Snapshot path:** stored under `apps/product-helper/__tests__/eval/snapshots/` (per-agent, per-fixture).
- **Drift triage flow:** received drift report → diff against last-known-good snapshot → reproduce locally with the same fixture set → decide (a) accept the new shape and update snapshot + grading, or (b) revert the LLM/prompt change.

When a schema gets added or a `v1` → `v2` bump lands, refresh snapshots in the same PR — otherwise the next quarterly run will false-positive.

---

## §6 — postgres-js jsonb gotcha

When persisting a Zod-validated artifact to a `jsonb` column via `postgres-js` (the driver this app uses), bind the JS object directly:

```ts
// CORRECT — postgres-js serializes the JS object into jsonb-of-object
await sql`
  INSERT INTO project_artifacts (project_id, artifact_kind, payload)
  VALUES (${projectId}, ${kind}, ${payload})
`;
```

Do **NOT** do `JSON.stringify(payload)::jsonb` — that yields jsonb-of-string and breaks any constraint or query that asserts `jsonb_typeof(payload) = 'object'`. (Surfaced as a real pitfall during TC1 migrations — see `plans/v22-outputs/tc1/migrations-mapping.md`.)

The TC1 migrations defensively assert `jsonb_typeof(<col>) = 'object'` on all artifact columns. If you see that constraint fire on inserts that "look right," you're almost certainly stringifying somewhere upstream.

---

## §7 — Schema barrel shadowing

The legacy `apps/product-helper/lib/langchain/schemas.ts` (singular file) shadows the new `apps/product-helper/lib/langchain/schemas/index.ts` (directory barrel) under bundler resolution: an `import { foo } from '../schemas'` resolves to the legacy file, not the new barrel.

**Workaround:** import from the explicit subpath:

```ts
import { CRAWLEY_SCHEMAS } from '@/lib/langchain/schemas/index';
// or, equivalently (per-schema):
import { tradespaceParetoSensitivitySchema } from '@/lib/langchain/schemas/module-4/tradespace-pareto-sensitivity';
```

Cleanup is deferred (optional; tracked in v2-release-notes.md Wave C deferred-items section).

---

## §8 — Authoritative source-of-truth

When in doubt, read `plans/crawley-sys-arch-strat-prod-dev/REQUIREMENTS-crawley.md` first — every Wave C schema cites a §X.Y from that file in its `@source` JSDoc tag.

The Crawley book itself lives one level deeper: `plans/research/crawley-book-findings.md` is the authoritative pre-extracted source. Do NOT re-scan the book; if you need a citation that's not in the findings file, append to the findings file FIRST, then cite.

Knowledge bank under `apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/` contains per-chapter excerpts (referenced by `@kbSource` JSDoc tags). KB hygiene rules from T9 (`_shared/` pool + symlinks) still apply — see `plans/v2-release-notes.md` "What KB hygiene landed" section.

---

## §9 — Tag + branch hygiene reminders

- **Per-file atomic commits.** NEVER `git add -A` or `git add .` (multiple Claude peers share the working tree per project memory).
- **No `Co-Authored-By` lines** on commits.
- **Verify a tag is reachable from your branch** before claiming it: `git rev-parse <tag>` then `git merge-base --is-ancestor <tag> HEAD`.
- **Trust `tsc` over IDE diagnostics:** run `npx tsc --noEmit --project apps/product-helper/tsconfig.json` before applying a teammate's claimed type error. Language-server state lags.
