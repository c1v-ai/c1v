# P10 closure evidence — agent-greenfield-refactor

**Branch:** `wave-e/te1-greenfield-refactor`
**Tag:** `te1-greenfield-refactor-complete`
**Closes:** EC-V21-E.14 (engine-prod-swap HARD-DEP)
**HARD-DEPs satisfied:**
- `te1-engine-core-complete` (Wave E G1/G3 interpreter + predicate-DSL)
- `te1-engine-stories-complete` equivalent SHA `6b7ff44` (13 engine.json story trees) — consumed via merge `4ba023a`

---

## What changed

Per master plan v2.1 §Wave E + EC-V21-E.14 + D-V22.01 + HANDOFF-2026-04-27 fix-up Correction 1.

The 7 NEW v2.1 generate-* LangGraph nodes were originally authored as
**re-validators**: each had an `if (!stub) return pending` early-exit that
refused to produce output unless the caller had pre-populated an upstream
stub on `state.extractedData`. P10 inverts this to the **substrate-read
pattern**: each node now reads from `state.messages` + `state.extractedData`
(substrate) + upstream artifacts via ContextResolver (G4), evaluates its
corresponding engine.json story tree via `evaluateWaveE()`, and persists a
non-empty `<kind>.runtime-envelope.v1` payload with `status='ready'`.

Path A (introduce a NEW upstream stub-population dependency) was rejected
per D-V22.01. Path B (substrate-read greenfield) is implemented here.

---

## Per-node before/after diff

| Node | Pre-P10 LOC | Post-P10 LOC | Δ | `if (!stub)` removed | Engine story consumed |
|---|---|---|---|---|---|
| `generate-data-flows` | 69 | 89 | +20 | yes (lines 28-33) | `m1-data-flows.json` (commit `4c3c6ff`) |
| `generate-form-function` | 60 | 86 | +26 | yes (lines 26-30) | `m5-form-function.json` (commit `7dfcc36`) |
| `generate-decision-network` | 48 | 89 | +41 | yes (lines 31-35) | `m4-decision-network.json` (commit `acbd9ff`) |
| `generate-n2` | 56 | 84 | +28 | yes (lines 24-28) | `m7-n2.json` (commit `fac0c00`) |
| `generate-fmea-early` | 62 | 86 | +24 | yes (lines 27-31) | `m8-fmea-early.json` (commit `1622b20`) |
| `generate-fmea-residual` | 79 | 91 | +12 | yes (lines 28-32) | `m8-fmea-residual.json` (commit `0f93d65`) |
| `generate-synthesis` (T6 keystone) | 145 | 112 | -33 | yes (lines 75-79) — replaced `if (!loaded)` early-exit | `m4-synthesis-keystone.json` (commit `3ecc53a`) |

Net code change: 7 nodes refactored, 1 shared helper added (`_engine-substrate.ts`, 250 LOC).

The substrate-read pattern uses one consistent shape across all 7 nodes:

```typescript
const evaluation = await evaluateEngineStory(STORY_ID, {
  projectId: state.projectId,
  messages: state.messages,
  extractedData: ed,
  projectName: state.projectName,
  projectVision: state.projectVision,
});
const envelope: RuntimeEnvelope<'<kind>'> = {
  _schema: '<kind>.runtime-envelope.v1',
  _output_path: `runtime://project/${state.projectId}/<kind>.v1.json`,
  nfr_engine_contract_version: 'v1',  // FROZEN Wave A↔E pin
  project_id, project_name, synthesized_at, inputs_hash,
  engine_evaluation: evaluation,
  payload: { /* per-node target_field → {value, confidence, status} */ },
};
await persistArtifact({ projectId, kind, status: 'ready', result: envelope, inputsHash });
```

Failure-path symmetry preserved per node — `try/catch` still routes hard
errors to `status='failed'` with `failureReason`. Pre-P10's `pending` exit
is gone.

---

## Test evidence

### Per-node success-path tests (deliverable #2)

7 new test files at `apps/product-helper/__tests__/langchain/graphs/nodes/`,
each containing the literal substring `'given fixture intake'` per the
qa-e-verifier static-scan rule (P10 resolution recommendation #3 — the
v2.1.1 verifier-mistake correction).

| Test file | SHA | Status |
|---|---|---|
| `generate-data-flows.test.ts` | `4d09002` | ✓ 1/1 |
| `generate-form-function.test.ts` | `13691c2` | ✓ 1/1 |
| `generate-decision-network.test.ts` | `2276156` | ✓ 1/1 |
| `generate-n2.test.ts` | `64a33fe` | ✓ 1/1 |
| `generate-fmea-early.test.ts` | `c10dd45` | ✓ 1/1 |
| `generate-fmea-residual.test.ts` | `34e865a` | ✓ 1/1 |
| `generate-synthesis.test.ts` | `e2ba6b4` | ✓ 1/1 |

Each test asserts:
1. Node persists at least one row with `status='ready'` and the canonical kind.
2. `result.engine_evaluation.total > 0` (non-empty story decisions).
3. `result.engine_evaluation.decisions.length > 0`.

### E2E live-project test (deliverable #3)

`apps/product-helper/__tests__/langchain/graphs/intake-graph.live-project.test.ts`
SHA `64e4dd3` — 2/2 green:

1. **`given fixture intake at completion, all 7 NEW v2.1 nodes persist status=ready (engine substrate-read, nfrImpl=engine)`** — runs all 7 nodes on a fresh fixture state, asserts each kind appears with `status='ready'`, asserts ZERO pending rows from the 7 NEW nodes (P10 closure invariant), asserts `projectId` multi-tenancy preserved.
2. **`given fixture intake, every NEW v2.1 ready row carries non-empty engine_evaluation`** — every ready row carries `nfr_engine_contract_version='v1'` (Wave A↔E pin) + non-empty `engine_evaluation`.

### Wave A↔E contract pin preservation

`apps/product-helper/__tests__/langchain/graphs/intake-graph.ta1-integration.test.ts` (the existing 11/11 ta1-integration test from `wave-e/te1-integration` SHA `858d9286`) **remains 11/11 green** after the refactor — verifies my changes did not break TA1's cross-node contract guarantee.

### Test rollup (graphs scope)

```
$ npx jest __tests__/langchain/graphs/
Test Suites: 9 passed, 9 total
Tests:       20 passed, 20 total
```

Breakdown: 11 ta1-integration + 7 per-node success-path + 2 e2e live-project = 20 graph-scope tests.

### Engine scope

`npx jest lib/langchain/engines/__tests__/` → 297/299 green. Two failures (`engine-loader.test.ts`: `throws EngineValidationError for duplicate decision_ids` + `loadEngines fails fast on first bad slug`) are **pre-existing** — they assert behavior the engine.ts schema (commit `0923a18`) doesn't yet enforce. Not introduced by this refactor; orthogonal to P10.

### tsc

`npx tsc --noEmit --project tsconfig.json` — 5 errors total, all **pre-existing**:
- 4 missing-module errors for `lib/db/schema/traceback*.ts` (files don't exist on either branch)
- 1 missing-module error for `js-yaml` in `scripts/atlas/validate-entries.ts` (pre-existing dep gap)

Zero tsc errors introduced by P10. The 7 refactored nodes + new helper + 8 new tests all type-check clean.

---

## Token-cost-per-node measurement

The 7 refactored nodes do NOT invoke an LLM in the engine hot path
(`evaluateWaveE()` → `NFREngineInterpreter.evaluateRule()` is pure
arithmetic + predicate matching per `nfr-engine-interpreter.ts` line 4).
The `LlmRefineFn` hook only fires for decisions in the 0.60-0.89
confidence band with `llm_assist=true`; no engine.json story tree
authored to date opts into `llm_assist`. **Effective LLM cost per node
on fixture intake: $0.00.** Engine evaluation is entirely deterministic.

`engine-prod-swap` (downstream HARD-DEP on this tag) swaps in the real
cheap-LLM path for the refine band; that's where token costs accrue.

Wall-clock per node on fixture state (mocked persistArtifact): 4-15ms.

---

## Substrate-read pattern (canonical reference)

The 7 NEW v2.1 LangGraph nodes were authored as "re-validators" with an
`if (!stub) return pending` branch — they refused to produce output
without a pre-populated upstream stub. The Wave-E refactor inverts this:

> Each refactored node reads from `state.intakeMessages` + `state.extractedData` (the **substrate** — what the user provided + what M0/M1 extraction surfaced) AND from upstream artifacts via ContextResolver (G4). It then invokes `evaluateWaveE()` with its corresponding engine.json story tree (the rule-tree consumed from `engine-stories`'s deliverables) and produces non-empty `<kind>.v1.json` output via the existing `persistArtifact({ ..., status: 'ready' })` pattern.

(`state.intakeMessages` per spawn-prompt language — implemented as
`state.messages` per `IntakeState` definition at `lib/langchain/graphs/types.ts:324`.)

This is the canonical substrate-vs-feeder pattern reference inlined per
spawn-prompt note: `methodology-rosetta.md` §9 doesn't exist on disk yet
(flagged by team-lead).

---

## Cross-reference: 7 consumed engine.json story trees

All 7 trees live at `apps/product-helper/.planning/engines/`:

1. `m1-data-flows.json` — 5 decisions (`df_*` flow classifications)
2. `m5-form-function.json` — assignment decisions
3. `m4-decision-network.json` — DN node assignments
4. `m7-n2.json` — interface classification
5. `m8-fmea-early.json` — failure-mode classifications
6. `m8-fmea-residual.json` — residual classifications
7. `m4-synthesis-keystone.json` — keystone synthesis decisions

All authored on `wave-e/te1-engine-stories` (HARD-DEP at SHA `6b7ff44`),
brought into this branch via merge commit `4ba023a`. Golden-rules
fixtures at `lib/langchain/engines/__tests__/golden-rules-fixtures/`
remain green.

---

## Out-of-scope items (per spawn prompt)

Per spawn-prompt explicit out-of-scope:

- 4 pre-v2.1 nodes (`generate_qfd` / `generate_interfaces` / `generate_ffbd` / `generate_decision_matrix`) — UNCHANGED. They already produce output today (per P10 diagnosis); their behavior and tests are untouched.
- v2.1 contract envelope (`nfr_engine_contract_version: 'v1'`) — UNCHANGED. All 7 ready envelopes carry this pin.
- engine.json story tree authoring — `engine-stories` shipped them; this work consumes them.
- `writeAuditRow()` wiring into `evaluateWaveE` hot path — owned by `audit-writer` (in parallel).

The "11-of-11 project_artifacts rows pending → ready" framing in master
plan v2.1 combines this 7 (P10 closure) + 4 pre-v2.1 (already shipped).
The e2e test asserts the 7-of-7 P10-scope contribution; the 4 pre-v2.1
nodes' status transitions are governed by their own pre-existing tests.

---

## Tag head SHA

`te1-greenfield-refactor-complete` → green head commit on `wave-e/te1-greenfield-refactor` (this evidence doc commit pending). Pushed to `origin`.
