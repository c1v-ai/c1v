# Reorg Mapping — 3×8 Submodule Consolidation

> **Status:** AUTHORITATIVE. Blocks refactorer + agent-rewirer + verifier.
> **Author:** mapper (c1v-reorg team, TPM role)
> **Created:** 2026-04-22
> **Source of truth:** `plans/c1v-MIT-Crawley-Cornell.md` §5 + `plans/HANDOFF-c1v-MIT-Crawley-Cornell.md` §3 ruling (2026-04-21 ~13:00)
> **Scope:** Phase → submodule mapping for M2/M3/M4 only. M1/M5/M6/M7/M8 are greenfield and out of scope for this mapping pass (their submodules are CREATE actions owned by other teams).

---

## 0. Rules of this mapping

- **One target per old file.** No orphans. No duplicates.
- **UI/frontend frozen.** Any table row that would require component edits is flagged `OUT-OF-SCOPE-UI` and marked TODO for a future cycle.
- **Shipped JSON Schema emission must survive.** The filename slugs published into `schemas/generated/module-*/` MUST continue to exist post-rewire. See §5 dual-emit strategy.
- **`refine().extend()` footgun:** all merge actions that touch M2 `_shared.ts` primitives must use `.innerType().extend().superRefine()` (see `apps/product-helper/lib/langchain/schemas/module-2/requirements-table-base.ts` for the pattern).
- **Refactorer does the moves.** Mapper is read-only; this doc is the spec.

---

## 1. Target submodule surface (24 total, 8 KBs × 3)

For reference only — mapper owns rows for M2/M3/M4. Other KBs listed so refactorer can see the namespace:

| KB | M1 Scope | M2 Requirements | M3 FFBD | M4 Decision Net | M5 Form-Fn | M6 HoQ | M7 Interfaces | M8 Risk |
|---|---|---|---|---|---|---|---|---|
| .1 | Context | Intake→UCBDs | Hierarchy | Nodes+Deps | Form+Fn Inventory | Engineering Chars | Inventory | FMEA |
| .2 | Use Cases | Functional Reqs | Flows+Branching | Utility+Pareto | Mapping Matrix | Relationship Matrix | Contracts | Mitigations |
| .3 | Scope Tree | NFRs+Constants | Handoff Package | Sensitivity+Handoff | Concept Quality+Alts | Roof+Targets | Integration Specs | Acceptance Criteria |

**Target dir convention (aligns with current `module-N/` style):**
```
apps/product-helper/lib/langchain/schemas/
├── module-2/
│   ├── submodule-2-1-intake.ts         # consolidates phases 0,1,2,3,4,5,10,11
│   ├── submodule-2-2-functional-reqs.ts # consolidates phase 6 + requirements-table-base
│   ├── submodule-2-3-nfrs-constants.ts  # consolidates phases 7,8,9
│   ├── submodule-2-handoff.ts           # phase 12 handoff + final review (cross-cutting)
│   ├── _shared.ts                       # UNCHANGED
│   └── index.ts                         # re-registers 3 submodule entries
├── module-3/
│   ├── submodule-3-1-hierarchy.ts       # phase 0a (ingest → hierarchy)
│   ├── submodule-3-2-flows-branching.ts # phase 6 shortcuts (flows)
│   ├── submodule-3-3-handoff.ts         # phase 11 FFBD→DM bridge
│   └── index.ts
└── module-4/
    ├── submodule-4-1-nodes-dependencies.ts    # phases 1,3,4,5,18
    ├── submodule-4-2-utility-pareto.ts        # phases 6,7,8,9,10,11,12
    ├── submodule-4-3-sensitivity-handoff.ts   # phases 13,17
    ├── _shared.ts                             # UNCHANGED (M4-widened envelope)
    └── index.ts
```

---

## 2. Module 2 — old → new (14 files → 3 submodules + 1 handoff)

Source dir: `apps/product-helper/lib/langchain/schemas/module-2/`
Target dir: same (files are rewritten in place, phase files are shimmed for back-compat)

| Old path | New target | Action | Consumers of old path | Risk |
|---|---|---|---|---|
| `phase-0-ingest.ts` | `submodule-2-1-intake.ts` | merge | generate-all (via registry), artifact-reader (via MODULE_2_PHASE_SCHEMAS) | LOW — reachable via registry |
| `phase-1-use-case-priority.ts` | `submodule-2-1-intake.ts` | merge | same | LOW |
| `phase-2-thinking-functionally.ts` | `submodule-2-1-intake.ts` | merge | same | LOW |
| `phase-3-ucbd-setup.ts` | `submodule-2-1-intake.ts` | merge | same | LOW |
| `phase-4-start-end-conditions.ts` | `submodule-2-1-intake.ts` | merge | same | LOW |
| `phase-5-ucbd-step-flow.ts` | `submodule-2-1-intake.ts` | merge | same | LOW |
| `phase-10-sysml-activity.ts` | `submodule-2-1-intake.ts` | merge | same — SysML activity is an intake-diagram output, not a separate reqs step | LOW |
| `phase-11-multi-uc-expansion.ts` | `submodule-2-1-intake.ts` | merge | same — multi-UC expansion is an intake-tree operation | LOW |
| `phase-6-requirements-table.ts` | `submodule-2-2-functional-reqs.ts` | merge | same | LOW |
| `requirements-table-base.ts` | `submodule-2-2-functional-reqs.ts` | merge-inline | **6 in-dir imports** (all M2 phase files that extend the base) + 1 external cleanup | **MEDIUM** — the `.innerType().extend().superRefine()` pattern must be preserved |
| `phase-7-rules-audit.ts` | `submodule-2-3-nfrs-constants.ts` | merge | same | LOW |
| `phase-8-constants-table.ts` | `submodule-2-3-nfrs-constants.ts` | merge | same | LOW |
| `phase-9-delve-and-fix.ts` | `submodule-2-3-nfrs-constants.ts` | merge | same | LOW |
| `phase-12-ffbd-handoff.ts` | `submodule-2-handoff.ts` | keep-as-own-file | MODULE_2_PHASE_SCHEMAS | LOW |
| `phase-12-final-review.ts` | `submodule-2-handoff.ts` | merge (sibling section in same handoff file) | MODULE_2_PHASE_SCHEMAS | LOW |
| `_shared.ts` | **KEEP UNCHANGED** | keep | 100% of module-2 files, also imported by module-3 and module-4 `_shared.ts` | **HIGH IF TOUCHED** — DO NOT EDIT |
| `__tests__/` | **KEEP; update imports only** | update-imports | ~14 jest test files | MEDIUM — mechanical import rewrite; see §6 |

**Why phase-10 + phase-11 fold into submodule-2-1-intake.ts, not functional-reqs:** Per plan §5 the M2.1 "Intake→UCBDs" submodule owns the full intake arc including multi-UC expansion and SysML activity diagrams. M2.2 is reserved for the requirements-table output; M2.3 for NFRs + constants + rules-audit + delve.

**Why phase-12 is its own file:** Gate handoff artifacts are cross-submodule (they synthesize M2.1 + M2.2 + M2.3 into `ffbd_handoff.v1`). Promoting handoff to a top-level submodule file keeps the 3×8 accounting clean (3 submodules per KB) while retaining an emittable JSON Schema for the handoff artifact.

---

## 3. Module 3 — old → new (3 files → 3 submodules, 1:1)

Source dir: `apps/product-helper/lib/langchain/schemas/module-3/`

| Old path | New target | Action | Consumers | Risk |
|---|---|---|---|---|
| `phase-0a-ingest-m2-handoff.ts` | `submodule-3-1-hierarchy.ts` | rename | MODULE_3_PHASE_SCHEMAS, artifact-reader landing path `m3StepData.phase-0a-ingest-m2-handoff` | **MEDIUM** — landing path is hard-coded; must keep slug OR add migration |
| `phase-6-shortcuts-reference-blocks.ts` | `submodule-3-2-flows-branching.ts` | rename | MODULE_3_PHASE_SCHEMAS, artifact-reader landing path `m3StepData.phase-6-shortcuts-reference-blocks` | **MEDIUM** — same landing-path concern |
| `phase-11-ffbd-to-decision-matrix.ts` | `submodule-3-3-handoff.ts` | rename | MODULE_3_PHASE_SCHEMAS, artifact-reader landing path `m3StepData.phase-11-ffbd-to-decision-matrix` | **MEDIUM** — same |

**Critical:** Gate C (8 more FFBD phases) is IN FLIGHT with teammate T4 `c1v-m3m4`. Coordinate with `m3-gate-c` agent — new phases MUST register against the 3-submodule layout below, NOT the legacy `phase-*.ts` naming.

- Gate C functional-flow phases (flows + branching + decomposition) → `submodule-3-2-flows-branching.ts`
- Gate C hierarchy + parent-child phases → `submodule-3-1-hierarchy.ts`
- Gate C handoff/bridge phases → `submodule-3-3-handoff.ts`

**Landing-path strategy:** slugs stay as-is to preserve `intake_state.m3StepData.phase-*` JSONB keys already persisted in live `projectData` rows (if any). Submodule file renames change the TS source location but NOT the emitted schema slugs in the registry.

---

## 4. Module 4 — old → new (14 files → 3 submodules)

Source dir: `apps/product-helper/lib/langchain/schemas/module-4/`

| Old path | New target | Action | Consumers | Risk |
|---|---|---|---|---|
| `phase-1-dm-envelope.ts` | `submodule-4-1-nodes-dependencies.ts` | merge | MODULE_4_PHASE_SCHEMAS, preload route `/api/schemas/module-4`, generated JSON | **MEDIUM** — envelope is the root; B1 widen is pending (see §8 risk) |
| `phase-3-performance-criteria.ts` | `submodule-4-1-nodes-dependencies.ts` | merge | same | LOW |
| `phase-4-pc-pitfalls.ts` | `submodule-4-1-nodes-dependencies.ts` | merge | same | LOW |
| `phase-5-direct-scaled-measures.ts` | `submodule-4-1-nodes-dependencies.ts` | merge | same | LOW |
| `phase-18-software-specific-dm.ts` | `submodule-4-1-nodes-dependencies.ts` | merge | same | LOW |
| `phase-6-ranges.ts` | `submodule-4-2-utility-pareto.ts` | merge | same | LOW |
| `phase-7-subjective-rubric.ts` | `submodule-4-2-utility-pareto.ts` | merge | same | LOW |
| `phase-8-measurement-scale.ts` | `submodule-4-2-utility-pareto.ts` | merge | same | LOW |
| `phase-9-normalization.ts` | `submodule-4-2-utility-pareto.ts` | merge | same | LOW |
| `phase-10-criterion-weights.ts` | `submodule-4-2-utility-pareto.ts` | merge | same | LOW |
| `phase-11-consensus.ts` | `submodule-4-2-utility-pareto.ts` | merge | same | LOW |
| `phase-12-min-max-scores.ts` | `submodule-4-2-utility-pareto.ts` | merge | same | LOW |
| `phase-13-score-interpretation.ts` | `submodule-4-3-sensitivity-handoff.ts` | merge | same | LOW |
| `phase-17-dm-to-qfd-bridge.ts` | `submodule-4-3-sensitivity-handoff.ts` | merge | preload route + MODULE_4_PHASE_SCHEMAS | **HIGH** — shipped artifact `dm_to_qfd_bridge.v1`. Do NOT rename slug. See §5. |
| `_shared.ts` | **KEEP UNCHANGED** | keep | all module-4 phase files | **HIGH IF TOUCHED** — DO NOT EDIT |

**Rationale for 4.1 grouping (envelope + performance-criteria + pitfalls + measures + software-specific):**
Per plan §5.1, the M4 rework will add phase-14 (decision-nodes), phase-15 (dependencies), phase-16 (Pareto frontier), phase-17-renamed (sensitivity), phase-19 (empirical-prior-binding). M4.1 owns the **input side** of the decision network: node definition, criteria, measures, and software-specific criterion linkages. Phase 18 stays with 4.1 because it defines the nodes' evaluation axes.

**Rationale for 4.2 grouping (ranges + rubric + scale + normalization + weights + consensus + min-max):**
These 7 phases together compose the **scoring pipeline** — how a criterion gets turned into a utility value. Perfect fit for M4.2 "Utility + Pareto."

**Rationale for 4.3 (score-interpretation + dm-to-qfd-bridge):**
Sensitivity-analysis (plan §5.1 new phase-17-sensitivity) and the downstream handoff both belong here. Score-interpretation is the decision-making surface (where thresholds/recommendations happen); bridge is the handoff to M6 HoQ.

---

## 5. Dual-emit — preserving shipped JSON Schema slugs

**Problem:** Consumers (the preload endpoint at `app/api/schemas/module-4/route.ts`, any persisted `intake_state.m*StepData.phase-*` JSONB keys, generated files in `schemas/generated/module-4/*.schema.json`) reference the old `phase-N-*` slugs. If we change slugs we break them.

**Resolution:** Keep **slugs** unchanged in the registry entries. Only the TypeScript **file location** moves. Registry is the only public contract:

```ts
// module-4/index.ts post-rewire (abbreviated)
import * as s41 from './submodule-4-1-nodes-dependencies';
import * as s42 from './submodule-4-2-utility-pareto';
import * as s43 from './submodule-4-3-sensitivity-handoff';

export const MODULE_4_PHASE_SCHEMAS = [
  { slug: 'phase-1-dm-envelope',        name: 'Phase1DmEnvelope',        phaseNumber: 1,  zodSchema: s41.phase1Schema },
  { slug: 'phase-3-performance-criteria', name: 'Phase3PerformanceCriteria', phaseNumber: 3, zodSchema: s41.phase3Schema },
  // ...same 14 entries, same slugs, different source TS
] as const;
```

**Net effect:**
- `schemas/generated/module-4/phase-1-dm-envelope.schema.json` keeps emitting.
- Preload route keeps compiling (its `import phase1 from '...generated/module-4/phase-1-dm-envelope.schema.json'` path is unchanged).
- Artifact-reader landing paths keep resolving (`m4StepData.phase-1-dm-envelope`).
- Named TS re-exports (e.g. `phase1Schema`, `Phase1Artifact`) continue to work via the barrel.

**refactorer mandate:** Preserve every `export { phaseNSchema, type PhaseNArtifact, ...sub-types }` statement currently in `module-*/index.ts` after the move. This is the only thing standing between a clean refactor and a broken external consumer.

---

## 6. Import-update plan — every file outside module-2/3/4 that imports a phase schema

**Confirmed by agent-rewirer's independent import audit (2026-04-22):**
- External importers of `MODULE_*_PHASE_SCHEMAS` arrays: **1 file** (`artifact-reader.ts`)
- Direct phase-file importers (`from 'schemas/module-N/phase-X'`) outside `schemas/` tree: **0**
- Generated-JSON importers: **1 route** (`app/api/schemas/module-4/route.ts`, 14 slug-keyed imports)
- Zero phase imports in: `lib/langchain/agents/*`, `lib/mcp/tools/*`, `scripts/*`, `app/api/preload/*` (route doesn't exist)

### Non-test consumers (full table)

| File | Current import | Action required |
|---|---|---|
| `apps/product-helper/lib/langchain/schemas/generate-all.ts` | `MODULE_2/3/4_PHASE_SCHEMAS` + `MODULE_8_ATLAS_SCHEMAS` | **NO CHANGE** (registry symbol unchanged) |
| `apps/product-helper/lib/langchain/engines/artifact-reader.ts` | `MODULE_2/3/4_PHASE_SCHEMAS` via `@/lib/langchain/schemas/module-N` barrels (lines 28-30, 79-81, 207) | **NO CHANGE** (registry symbol unchanged); verifier must round-trip landing-path slugs |
| `apps/product-helper/app/api/schemas/module-4/route.ts` | 14 hardcoded `import phaseN from '@/lib/langchain/schemas/generated/module-4/phase-*.schema.json'` | **NO CHANGE IFF slugs preserved per §5**. If any M4 slug changes, this route breaks at build time — see §8 risk "preload route slug-binding" |

**Conclusion — shim scope minimized:**
- Per agent-rewirer's finding, **no per-phase shims required**. Shims (if any) are barrel-level only: `module-2/index.ts`, `module-3/index.ts`, `module-4/index.ts`, `atlas/index.ts` keep the registry exports + named phase re-exports at stable symbol names.
- Task #4 ("Add legacy phase file shims") in the task list is DELETABLE if jest tests are rewritten to barrel imports per Option A (task #11). Flag to verifier: confirm Option A is executed cleanly, then mark #4 deleted.

### Test-file imports

All ~14 jest tests in `module-2/__tests__/` import specific phase files directly (e.g. `import { phase6Schema } from '../phase-6-requirements-table';`). These will break on file rename.

**Two options for refactorer:**
- **Option A (preferred):** Rewrite test imports to pull from the barrel: `import { phase6Schema } from '..';`. Mechanical sed-like operation, ~14 file touches. Task #11 in task list covers this.
- **Option B (fallback):** Add thin re-export shim files at legacy paths (`module-2/phase-6-requirements-table.ts` → `export * from './submodule-2-2-functional-reqs';`). Zero test edits, but clutters the tree. Flag for David if test rewrite is risky.

**Recommendation:** Option A. Cleaner. Task #4 (legacy phase file shims) becomes unnecessary if Option A is executed cleanly.

### Agent imports (confirmed clean)

- `lib/langchain/agents/decision-matrix-agent.ts` — uses domain types from `lib/langchain/schemas.ts` (legacy root `decisionMatrixSchema`), NOT module-4 phase schemas. Untouched by reorg.
- Other agents (intake, ffbd, qfd, interfaces, tech-stack, etc.) similarly use legacy root schemas.
- **Finding:** no agent currently imports a `phase-*` schema from module-2/3/4. The reorg does not touch agent code.

### MCP tools (confirmed clean)

Grep over `lib/mcp/` finds no imports from `schemas/module-[234]/` or any `MODULE_*_PHASE_SCHEMAS` usage. MCP tools consume via LangGraph state + DB queries, not phase-schema imports. **MCP surface is untouched by this reorg.**

---

## 7. `generate-all.ts` diff sketch

**Current (lines 18-20):**
```ts
import { MODULE_2_PHASE_SCHEMAS } from './module-2';
import { MODULE_3_PHASE_SCHEMAS } from './module-3';
import { MODULE_4_PHASE_SCHEMAS } from './module-4';
```

**Post-rewire:** unchanged. The registry arrays remain the public contract; they are rebuilt from 3 submodule files per module but export the same 14 / 3 / 14 entries respectively.

The `for (const { zodSchema, name, slug } of MODULE_X_PHASE_SCHEMAS)` loops continue emitting 31 JSON Schemas (14 M2 + 3 M3 + 14 M4) into `generated/module-*`. Filenames preserved.

**Verifier check:** `pnpm tsx lib/langchain/schemas/generate-all.ts` must produce byte-identical output to pre-reorg baseline (modulo `generatedAt` timestamps, if any). Baseline snapshot should be captured **before** refactorer begins.

---

## 8. Risk register

| Risk | Severity | Mitigation |
|---|---|---|
| **Preload route slug-binding** — `app/api/schemas/module-4/route.ts` has 14 hardcoded `import phaseN from '@/lib/langchain/schemas/generated/module-4/phase-*.schema.json'` statements. If the 3×8 consolidation changes any M4 slug, the route fails at `next build` | **HIGH** | Refactorer MUST preserve all 14 M4 slugs verbatim in `MODULE_4_PHASE_SCHEMAS` registry entries (see §5). If David later decides to collapse emitted slugs (e.g. single `submodule-4-1.schema.json`), the route must be rewritten in the same PR — not a later cleanup. Verifier gates this: post-reorg `tsc --noEmit` + `next build` must pass |
| Slug collision (e.g. M2 and M3 both have `phase-6`, M2 and M3 both have `phase-11`) | LOW | Registries are already module-scoped; `schemas/generated/module-2/phase-6-*.schema.json` and `generated/module-3/phase-6-*.schema.json` are in separate directories |
| B1 envelope cap `.max(18)` vs pending phase-19 (plan §5.1) | OUT-OF-SCOPE | T4 team owns the `.max(25)` widen; reorg does NOT touch `_shared.ts` |
| B2 phase-17 collision between `dm_to_qfd_bridge.v1` (shipped) and new sensitivity phase | OUT-OF-SCOPE | T4 team owns the rename (old → `phase-17-dm-to-qfd-bridge` stays; new sensitivity gets new phase number). Reorg preserves the current `phase-17-dm-to-qfd-bridge` slug verbatim |
| Artifact-reader landing paths `m3StepData.phase-0a-ingest-m2-handoff` etc are hard-coded | MEDIUM | Slugs preserved → paths unchanged. Verifier must run a round-trip projection test on at least one live project row |
| Gate C M3 phases currently in flight by teammate T4 | MEDIUM | refactorer MUST coordinate with `m3-gate-c` agent via SendMessage before renaming `module-3/` files. Stop-the-world protocol: Gate C lands first, then reorg |
| Test imports break | LOW | Task #11 (update jest test imports) handles it via Option A barrel-import rewrite |
| Generated JSON output drift | LOW | Capture baseline with `pnpm tsx lib/langchain/schemas/generate-all.ts > /tmp/pre.txt && git diff --no-index` after; drift-gate is in CI |
| RLS / Drizzle tables for project_run_state / user_signals | OUT-OF-SCOPE | T6 synthesis + T7 module-0 teams own these; reorg does not touch `lib/db/schema/` |
| UI regressions | OUT-OF-SCOPE | UI frozen. No `components/**` edits by this team |
| `refine().extend()` footgun when merging `requirements-table-base.ts` into submodule-2-2 | MEDIUM | Refactorer MUST preserve `applyNumericMathGate` pattern (`.innerType().extend().superRefine()`). Jest test `requirements-table-base.test.ts` must stay green |

---

## 9. Handoff protocol

- **refactorer** (langchain-engineer): executes §2, §3, §4 file merges. Starts with M2 (safest), then M4, then M3 (M3 coordinates with T4 `m3-gate-c`). Preserves all slugs in registries. Updates `module-N/index.ts` barrels per §5.
- **agent-rewirer** (langchain-engineer): no-op for external consumers per §6 finding (registries are the public contract; no import edits needed outside `module-*`). Owns task #11 test-import rewrite (Option A barrel imports). Owns task #8 verifying generate-all unchanged.
- **verifier** (qa-engineer): owns task #10. Executes:
  1. `pnpm tsx lib/langchain/schemas/generate-all.ts` — diff against pre-baseline
  2. `npx jest lib/langchain/schemas/module-2 lib/langchain/schemas/module-3 lib/langchain/schemas/module-4` with stub env
  3. `curl localhost:3000/api/schemas/module-4 | jq '.schemaCount'` — must return 14
  4. Round-trip `artifact-reader.ts` against a test projectData row for each module slug

---

## 10. Notification message templates

**To refactorer (sent by mapper on completion):**
```
{mapping_ready: true, doc_path: "plans/reorg-mapping.md",
 start_with: "module-2 (safest; no downstream in-flight work)",
 critical_rule: "PRESERVE REGISTRY SLUGS VERBATIM"}
```

**To verifier (sent by mapper on completion):**
```
{import_audit_ready: true, doc_path: "plans/reorg-mapping.md",
 external_consumer_count: 3,
 zero_external_edits_required: true,
 test_file_rewrite_path: "Option A barrel imports",
 baseline_capture_required: "pnpm tsx lib/langchain/schemas/generate-all.ts BEFORE refactorer starts"}
```
