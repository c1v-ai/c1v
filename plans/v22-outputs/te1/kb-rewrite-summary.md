---
title: TE1 kb-rewrite — Wave-E γ-shape phase-file overlay
team: c1v-kb-runtime-engine
agent: kb-rewrite
ec: EC-V21-E.9, EC-V21-E.10, EC-V21-E.11 (LangGraph data side)
ship_branch: wave-e/te1-kb-rewrite
upstream_tags: te1-engine-core-complete (cddf1bf), tc1-wave-c-complete (f5992639)
created: 2026-04-27
---

# TE1 kb-rewrite — Wave-E γ-shape phase-file overlay

> Closes **EC-V21-E.9** (γ phase per master plan v2.1 line 474), **EC-V21-E.10**
> (δ phase: T9 dedup ✅ done before this work; schema-extension reconciliation
> finding documented below), and **EC-V21-E.11** (ε phase, LangGraph data
> side — `explain_decision` node consumed by `provenance-ui`).

## §0 Pre-flight

- Hard-dep tag `te1-engine-core-complete` present at `cddf1bf`. ✓
- Hard-dep tag `tc1-wave-c-complete` present at `f5992639`. ✓
- T9 dedup ✅ done per `plans/wave-e-day-0-inventory.md` line 25 (52 KBs in
  `_shared/`, 117 symlinks; 0 file-duplicates). kb-rewrite did NOT redo T9.
- Branch base: `wave-e/te1-kb-rewrite` from `te1-engine-core-complete`.
- Snapshot anchor: `_legacy_2026-04-26/` directory mirrors all 80 phase files
  at file-content level before rewrite (commit `e633b80`).

## §1 Per-module γ-shape overlay (EC-V21-E.9)

Every phase-doc file under
`apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/<module>/01-phase-docs/`
got the schema-first 6-section overlay locked by master plan v2.1 line 474:

```
sec1 Decision context           — short prose; what's being decided + why
sec2 Predicates (engine.json)   — POINTS AT engine.json story tree (no inline DSL)
sec3 Fallback rules             — searchKB → surfaceGap loop contract
sec4 STOP-GAP rules             — POINTS AT fail-closed-audit.md + runner registry
sec5 Math derivation            — mathDerivationSchema contract; per-decision audit
sec6 References (KB chunk IDs)  — POINTS AT kb_chunks table + runtime searchKB
```

Plus YAML frontmatter for the engine consumer:

```yaml
schema: phase-file.v1
phase_slug: <slug>
module: <1..9>
artifact_key: module_N/<slug>
engine_story: <m1-defining-scope|m2-requirements|m3-ffbd|...>
engine_path: apps/product-helper/.planning/engines/<engine_story>.json
fail_closed_audit: plans/v22-outputs/te1/fail-closed-audit.md#module-N-<slug>
fail_closed_registry: apps/product-helper/lib/langchain/engines/fail-closed-runner.ts
kb_chunk_refs: []                  # populated by engine-pgvector embedder backfill
legacy_snapshot: <_legacy_2026-04-26/...>
rewritten_at: 2026-04-27
rewritten_by: kb-rewrite (Wave-E γ-shape, EC-V21-E.9)
```

The legacy educational body (Knowledge / Instructions / Output Format /
STOP-GAP) is preserved verbatim under a "Educational content (legacy,
preserved)" footer — the 6 sections are a structural overlay so each file is
machine-parseable while the teaching layer stays readable for both the LLM
and human reviewers.

### Per-module table

| Module | Slug | Phase docs | Commit | Lines added |
|---|---|---:|---|---:|
| M1 | `1-defining-scope` | 7 | `f3c35f0` | +553 |
| M2 | `2-requirements` | 16 | `720dc5e` | +1264 |
| M3 | `3-ffbd` | 16 | `6e583c4` | +1264 |
| M4 | `4-decision-net-crawley-on-cornell` | **0** | n/a | n/a |
| M5 | `5-form-function` | 5 | `9f7e3af` | +405 |
| M6 | `6-hoq` | 12 | `3bc95b9` | +959 |
| M7 | `7-interfaces` | 11 | `ef37066` | +869 |
| M8 | `8-risk` | 10 | `4b7c8c3` | +790 |
| M9 | `9-stacks-atlas` | 3 | `f1d67e3` | +237 |
| **Total** | — | **80** | 8 commits | **+6341** |

> M4 has **0** phase-docs on disk by construction — the
> `4-decision-net-crawley-on-cornell` folder ships its content as
> `00-master-prompt.md` + `07-atlas-references.md` at the module root rather
> than under `01-phase-docs/`. Both files were already authored under Wave-1
> T2/T9 and remain in legacy shape (out of γ-rewrite scope; γ-shape applies
> only to the canonical `01-phase-docs/` set per the spawn-prompt phrase
> "80 phase files").

### Tooling

- `apps/product-helper/scripts/rewrite-kb-phase-files.ts` (commit `117b308`)
  — deterministic rewriter run per-module. Idempotent (skips files already
  carrying `schema: phase-file.v1` frontmatter). Module-keyed lookup table
  resolves engine_story / artifact_key prefix / fail_closed_audit anchor.

### Snapshot for rollback

- `apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/_legacy_2026-04-26/`
  contains all 80 pre-Wave-E phase files at file-content level.
- Snapshot commit: `e633b80` (cherry-picked from `wave-e/te1-engine-pgvector`
  where it initially landed during a shared-worktree branch-stomp event;
  see §6 "Coordination notes" below).
- Snapshot total: 80 files, +15110 LOC.

## §2 Schema-extension reconciliation finding (EC-V21-E.10)

**Outcome: 0 schema extensions shipped.** Per `HANDOFF-2026-04-27-v2.2-fixup.md`
Correction 4 ("0 schema extensions is acceptable if TC1 covers everything
Wave-E needs — surface the finding; don't author defensively"), kb-rewrite
ships ZERO new Zod schemas in `apps/product-helper/lib/langchain/schemas/`.

### TC1 coverage walk

The `tc1-wave-c-complete` tag (commit `f5992639`) shipped 11 Crawley schemas
per `plans/v22-outputs/tc1/schemas-shipped.md`:

| # | Schema id | Module | Crawley ref |
|---|---|---|---|
| 1 | `module-2.requirements-crawley-extension.v1` | M2 | Ch 11 |
| 2 | `module-3.decomposition-plane.v1` | M3 | Ch 13 |
| 3 | `module-4.decision-network-foundations.v1` | M4 | Ch 14 |
| 4 | `module-4.tradespace-pareto-sensitivity.v1` | M4 | Ch 15 |
| 5 | `module-4.optimization-patterns.v1` | M4 | Ch 16 |
| 6 | `module-5.phase-1-form-taxonomy.v1` | M5 | Ch 4 |
| 7 | `module-5.phase-2-function-taxonomy.v1` | M5 | Ch 5 |
| 8 | `module-5.phase-3-form-function-concept.v1` | M5 | Ch 6 |
| 9 | `module-5.phase-4-solution-neutral-concept.v1` | M5 | Ch 7 |
| 10 | `module-5.phase-5-concept-expansion.v1` | M5 | Ch 8 |
| keystone | `mathDerivationMatrixSchema` (M5-local) | M5 | REQ §5 |

### Why 0 extensions ship

The γ-shape's six sections are NOT a Zod typed shape — they are a markdown
structural overlay. Section bodies POINT AT existing engine artifacts:

- **§2 Predicates** → `apps/product-helper/.planning/engines/<story>.json`
  (authored by `engine-stories`; gated by
  `apps/product-helper/lib/langchain/schemas/engines/story-tree.ts`).
- **§4 STOP-GAP rules** → fail-closed-audit doc + the
  `apps/product-helper/lib/langchain/engines/fail-closed-runner.ts` registry,
  Zod-pinned by `apps/product-helper/lib/langchain/schemas/engines/fail-closed.ts`.
- **§5 Math derivation** → `mathDerivationSchema` (scalar) and TC1's
  `mathDerivationMatrixSchema` (matrix, M5-local).
- **§6 References (KB chunk IDs)** → string array in frontmatter; runtime
  retrieval via `searchKB(...)` over the `kb_chunks` table.

Sections §1 and §3 are prose-only and do not require typed gates.

For M6 / M7 / M8 (HoQ / interfaces / FMEA — NOT covered by TC1's M2/M3/M4/M5
suite), Wave-E's runtime needs are met by:

- M6 HoQ: existing `apps/product-helper/lib/langchain/schemas/qfd-legacy.schema.json`
  + `apps/product-helper/.planning/engines/m6-qfd.json` (engine-stories).
- M7 interfaces: `interfaces.v1.json` schema (T4b) + N2 matrix in M7.a
  (T4a `n2_matrix.v1.json`).
- M8 FMEA: existing `fmea_early.v1.json` (T4a) + `fmea_residual.v1.json` (T6).

None of these need a γ-shape-specific extension. The freeze contract on
`tc1-wave-c-complete` is preserved.

### When to extend

If during operational use the runtime surfaces a typed shape gap (e.g. M8
FMEA needs a fail-closed rule schema not yet in
`apps/product-helper/lib/langchain/schemas/engines/fail-closed.ts`), the
extension MUST be additive (per fix-up Correction 4: "extend, never modify,
TC1's frozen schemas"). FAIL-the-commit and surface to coordinator if any
extension would change a TC1 schema (analog of v2's projects-table
double-authoring gap).

## §3 LangGraph "why this value?" provenance (EC-V21-E.11 — data side)

### Node

`apps/product-helper/lib/langchain/graphs/nodes/explain-decision.ts` (commit
`e04d0a5`):

```ts
explainDecision({ projectId, targetField })
  → Promise<ExplainDecisionResponse | null>
```

- Reads via `getAuditTrail(projectId, { targetField })` from
  `apps/product-helper/lib/db/queries/decision-audit.ts`.
- Resolves `kbChunkIds` via Drizzle scan of `kb_chunks`.
- Returns the 5-section payload `provenance-ui` consumes:
  `{decision_id, target_field, value, units, user_overrideable, matched_rule,
  math, kb_references, override_history}`.
- Returns `null` (NOT throws) when no audit row exists for the stream —
  caller surfaces 404.
- Tenancy is the caller's gate (route or sibling node), enforced via session
  team-id check; RLS on `decision_audit` is the defense-in-depth fallback.

### Type contract

`apps/product-helper/components/synthesis/why-this-value-types.ts` (owned
by `provenance-ui`) is the single source of truth for `ExplainDecisionResponse`
shape. The node imports the type, not redefines it — D-V22-style coexistence.

### Append-row override pattern

The node walks the `decision_audit` stream chronologically and exposes prior
rows as `override_history[]`. The audit table is APPEND-ONLY (REVOKE UPDATE
per `0011b_decision_audit.sql`); manual user overrides INSERT a new row with
`agent_id='user'` and `auto_filled=false`. The `<WhyThisValuePanel />`
override-history UI scans this stream — there is no JSONB array on a single
row.

### Node export

Registered in `apps/product-helper/lib/langchain/graphs/nodes/index.ts`:

```ts
export { explainDecision } from './explain-decision';
export type { ExplainDecisionInput } from './explain-decision';

export const NODE_NAMES = {
  ...,
  EXPLAIN_DECISION: 'explain_decision',
} as const;
```

The function is consumable both as a graph node (for synchronous in-flow
provenance lookup) and as a standalone function (for the route handler at
`app/api/decision-audit/[projectId]/[targetField]/explain/route.ts` to
delegate to).

## §4 Conformance test

`apps/product-helper/__tests__/kb/phase-file-shape.test.ts` (commit
`81277a8`) — Jest suite that walks every phase file under the 8 modules
with `01-phase-docs/` and asserts:

- file count = 80;
- valid YAML frontmatter present;
- all 12 required frontmatter keys present;
- frontmatter `schema` equals `'phase-file.v1'`;
- all 6 required section headers present (substring-matched on `## ` lines);
- §4 body references the fail-closed-runner registry path;
- §2 body references the `.planning/engines/` path;
- legacy educational body footer preserved.

**Test result: 1841 / 1841 green** (80 files × 23 assertions per file +
1 file-count assertion = 1841, run in 0.306s).

## §5 Coverage gaps and follow-ups

- `kb_chunk_refs: []` is empty in every frontmatter. Will be backfilled by
  `engine-pgvector` agent's embedder (G9 ingest) once the per-module chunk
  embeddings land. Not blocking γ-shape close.
- M4 phase docs (zero on disk) — γ-rewrite skipped per scope. Future work:
  if M4 grows phase docs, add the module entry in
  `scripts/rewrite-kb-phase-files.ts` `MODULES` array (the rewriter is
  data-driven; no rerun risk).
- The 80-file rewriter is idempotent and the test gate is in place — future
  hand-edits to phase files must preserve frontmatter + 6 section headers
  or `phase-file-shape.test.ts` fails.

## §6 Coordination notes (shared-worktree contention)

The single shared worktree at `/Users/davidancor/Projects/c1v` was mid-flight
with ~6-7 Wave-E peers running parallel `git checkout` operations. The
snapshot commit (`e633b80` on `wave-e/te1-kb-rewrite`) initially landed on
`wave-e/te1-engine-pgvector` due to a peer branch-stomp during context
reading. Resolved per team-lead's call (option 1) by cherry-picking the
content-only commit onto the correct branch; the pgvector copy is a no-op
since engine-pgvector tests don't touch `13-Knowledge-banks-deepened/`.

Subsequent commits used the discipline pattern recommended by team-lead:
the entire rewrite + stage + branch-check + commit cycle was executed in a
single bash invocation per module to minimize the peer-stomp window. All 9
content commits + 1 tooling commit + 1 LangGraph commit + 1 test commit (12
total commits including snapshot) successfully landed on
`wave-e/te1-kb-rewrite`.

## §7 Commit ledger

| SHA | Subject |
|---|---|
| `e633b80` | snapshot: pre-Wave-E phase files (rollback anchor) |
| `117b308` | feat(wave-e): rewriter script for KB phase-file γ-shape overlay |
| `f3c35f0` | feat(wave-e/kb-rewrite): module 1 defining-scope — γ-shape overlay (7 phase files) |
| `720dc5e` | feat(wave-e/kb-rewrite): module 2 requirements — γ-shape overlay (16 phase files) |
| `6e583c4` | feat(wave-e/kb-rewrite): module 3 ffbd — γ-shape overlay (16 phase files) |
| `9f7e3af` | feat(wave-e/kb-rewrite): module 5 form-function — γ-shape overlay (5 phase files) |
| `3bc95b9` | feat(wave-e/kb-rewrite): module 6 hoq — γ-shape overlay (12 phase files) |
| `ef37066` | feat(wave-e/kb-rewrite): module 7 interfaces — γ-shape overlay (11 phase files) |
| `4b7c8c3` | feat(wave-e/kb-rewrite): module 8 risk (FMEA) — γ-shape overlay (10 phase files) |
| `f1d67e3` | feat(wave-e/kb-rewrite): module 9 stacks-atlas — γ-shape overlay (3 phase files) |
| `e04d0a5` | feat(wave-e/kb-rewrite): explain_decision LangGraph node — provenance producer for why-this-value UI |
| `81277a8` | test(wave-e/kb-rewrite): phase-file-shape conformance test (80 files, 6-section shape) |

## §8 Cross-references

- Master plan: `plans/c1v-MIT-Crawley-Cornell.v2.2.md` §Wave E (EC-V21-E.9, .10, .11).
- Day-0 inventory: `plans/wave-e-day-0-inventory.md`.
- v2.2 fix-up handoff: `plans/HANDOFF-2026-04-27-v2.2-fixup.md` (Correction 4).
- Methodology Rosetta: `plans/methodology-rosetta.md`.
- TC1 schemas shipped: `plans/v22-outputs/tc1/schemas-shipped.md`.
- Fail-closed audit: `plans/v22-outputs/te1/fail-closed-audit.md`.
- Provenance-UI summary: `plans/v22-outputs/te1/provenance-ui-summary.md`.
- Engine-pgvector apply log: `plans/v22-outputs/te1/engine-pgvector-apply-log.md`.
