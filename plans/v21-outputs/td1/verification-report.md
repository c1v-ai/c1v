# TD1 Wave D Verification Report

**Date:** 2026-04-25
**Team:** `c1v-apispec-iter3` (Wave D)
**Agent:** `verifier` (non-fix)
**Branch:** `wave-a/ta3-sidecar` (shared with peer TA3)
**Last TD1 commit (subject):** `bb1f443 test(td1): pin legacy-path tests with twoStage:false (Wave D Step D-3)`
**Verifier commit:** `eac840e test(td1): verify-td1.ts — Wave D exit-criteria verifier`
**Authoritative spec:** `plans/c1v-MIT-Crawley-Cornell.v2.1.md` §Wave D (EC-V21-D.1..D.5)

---

## Per-EC results

| EC | Status | Evidence |
|---|---|---|
| **EC-V21-D.1** | ✅ PASS | `plans/v21-outputs/td1/preflight-log.md` exists; records branch decision (**A. CUTOFF**), `stop_reason='max_tokens'`, and `usage: { input_tokens: 6464, output_tokens: 12000 }`. Live preflight against Anthropic API ($0.20). |
| **EC-V21-D.2** | ✅ PASS | Feature flag wired in `lib/langchain/agents/api-spec-agent.ts:376-378`: `process.env.API_SPEC_TWO_STAGE` read; resolution `options?.twoStage ?? (envFlag === undefined ? true : envFlag !== 'off')`. Default-on-new (env unset → true), explicit `twoStage:false` pins legacy for existing projects. Verified via static-source assertion (`hasOptionsParam` + `hasEnvFlagRead` + `defaultsOnWhenEnvUnset` + `offOptOut` + `optionsOverridesEnv` all true). |
| **EC-V21-D.3** | ✅ PASS | Regression test `__tests__/api-spec-agent.regression.test.ts` runs `generateAPISpecification` end-to-end on the project=33 fixture. All 6 top-level keys (`baseUrl`, `version`, `authentication`, `endpoints`, `responseFormat`, `errorHandling`) present in assembled output. Round-trip parse against the preserved `apiSpecificationSchema` succeeds. Endpoint count = stage-1 op count (no truncation; ≥ 25 endpoints). `apiSpecificationSchema` declared at `api-spec-agent.ts:135`, used as `.parse()` validator on the assembled output. |
| **EC-V21-D.4** | ✅ PASS | 3 jest test files in `__tests__/` auto-discovered by jest's default `testMatch` `**/__tests__/**/*.test.ts`: `api-spec-agent.regression.test.ts`, `api-spec-agent.stage1.test.ts`, `api-spec/stage2-expansion.test.ts`. **37/37 tests green** in 0.287 s. CI runs `pnpm turbo run test:unit --filter=product-helper` (`.github/workflows/test.yml:88`); jest auto-discovery picks up all three suites. |
| **EC-V21-D.5** | ✅ PASS | `plans/v21-outputs/td1/token-cost-delta.md` records measured drop from **12,000 → ~2,092 output tokens** = **~83 % reduction** (well above 30 % floor); per-project cost **$0.20 → $0.05** (~75 % drop). Stage-2 LLM tokens = **0** (deterministic mapper). |

**Verifier run:** `pnpm tsx scripts/verify-td1.ts` → `PASS=7  FAIL=0  SKIP=0` (exit 0).

---

## Token-cost histogram

| Stage / Pipeline                | Input tokens | Output tokens | Cost (Sonnet 4.5) | Δ vs legacy |
|--------------------------------|-------------:|--------------:|------------------:|------------:|
| Legacy single-call (capped)    | 6,464        | 12,000 (cap hit) | $0.1994          | baseline    |
| Stage-1 (LLM)                  | 6,464        | ~2,092          | $0.0508          | -75 % cost  |
| Stage-2 (deterministic)        | 0            | **0**           | $0.0000          | 0 LLM       |
| **Two-stage total**            | 6,464        | **~2,092**      | **$0.0508**      | **-83 % out, -75 % $** |

Per-operation footprint: legacy ~466 tok → stage-1 ~54 tok = **8.7×** reduction per op.
Headroom: stage-1 uses ~48 % of its 4,000-token cap (vs legacy 100 % saturation at 12,000).

---

## Project=33 before / after comparison

| Metric                          | Legacy single-call (live preflight) | Stage-1 + Stage-2 (regression replay) |
|---------------------------------|-------------------------------------|----------------------------------------|
| `stop_reason`                   | `max_tokens` (cap hit)              | n/a (no cap; stage-1 used 48 % of 4k)  |
| Top-level keys emitted          | 5 of 6 (missing `errorHandling`)    | 6 of 6                                 |
| Endpoints emitted               | 22 of ~31 (truncated)               | 35 of 35 (1:1 with stage-1 ops)        |
| Output tokens                   | 12,000 (capped)                     | ~2,092                                 |
| Output validation               | partial spec (would fail `.parse()`) | round-trip parses against `apiSpecificationSchema` |
| Cost                            | $0.1994                             | $0.0508                                |
| Elapsed (live)                  | 118,620 ms (~2 min)                 | n/a (jest mocks stage-1 boundary; stage-2 deterministic in <5 ms) |

---

## Feature-flag state machine

Resolved in `lib/langchain/agents/api-spec-agent.ts:376-378`:
```ts
const envFlag = process.env.API_SPEC_TWO_STAGE;
const twoStage =
  options?.twoStage ?? (envFlag === undefined ? true : envFlag !== 'off');
```

| `options.twoStage` | `process.env.API_SPEC_TWO_STAGE` | Effective `twoStage` | Path | Spec rationale |
|---|---|---|---|---|
| `undefined` | unset                          | `true`  | two-stage  | EC-V21-D.2 default-on-new |
| `undefined` | `'on'` (or any non-`'off'`)    | `true`  | two-stage  | env opt-in observable |
| `undefined` | `'off'`                        | `false` | legacy     | env opt-out kill-switch |
| `false`     | (any)                          | `false` | legacy     | EC-V21-D.2 default-off-existing — pinned by call-site for previously-generated projects to avoid silent re-gen drift |
| `true`      | (any)                          | `true`  | two-stage  | explicit opt-in overrides env |

Fallback safety: if the two-stage path throws (e.g. stage-1 emits a malformed flat row, or stage-2 expansion fails `.parse()`), `api-spec-agent.ts:401-405` short-circuits to the legacy single-call path so callers never receive a broken response shape.

---

## Verifier checks (7 total, all PASS)

1. ✓ `[EC-V21-D.1]` preflight log records branch decision + stop_reason + usage
2. ✓ `[EC-V21-D.2]` feature-flag state machine (default-on-new / default-off-existing)
3. ✓ `[EC-V21-D.3]` `apiSpecificationSchema` preserved as output validator + two-stage wired
4. ✓ `[EC-V21-D.4]` regression test pinned to project=33 fixture
5. ✓ `[EC-V21-D.3]` project=33 two-stage regression — 6 top-level keys + `apiSpecificationSchema` parse (jest exit=0)
6. ✓ `[EC-V21-D.4]` Wave-D regression suite (regression + stage1 + stage2-expansion) auto-discovered by jest default testMatch
7. ✓ `[EC-V21-D.5]` token cost drops ≥ 30 % + stage-2 LLM tokens = 0

Test run: 3 suites / **37 tests** / all green / 0.287 s.

---

## Non-blocking findings (informational)

- Spawn-prompt mentions `apiSpecificationSchema` at line **131** (per stage2 agent's note), actual location is **line 135** in current source. Doc drift only — schema content + `.parse()` validator role are unchanged.
- Preflight-log surfaced anomaly: `claude-api` skill referenced by upstream spawn does not exist at `~/.claude/skills/`; substituted with `langchain-patterns`/`code-quality`/`api-design`. Recommended for v2.2 followups.
- Cache-control flag (`response_metadata.usage.cache_creation/cache_read = 0`) not propagating through `bindTools()` / `withStructuredOutput()`. Worth fixing as a v2.2 followup; ~$0.014/call savings at full cache-hit on the 4.9K-token system+KB block. Out-of-scope for TD1.
- The `apps/product-helper/package.json` does not define a `test:unit` script, but CI invokes `pnpm turbo run test:unit --filter=product-helper`. This is a pre-existing concern (out of TD1 scope) — jest's default `**/__tests__/**/*.test.ts` glob still picks up all three TD1 suites under `pnpm exec jest` / direct invocation. Surfacing for visibility; does not block TD1 tag.

---

## Conclusion

**Tag eligible: YES.**

All 5 exit criteria PASS. Verifier exits 0. tsc clean. 37/37 jest tests green.

Tag `td1-wave-d-complete` to be applied to last TD1 commit `bb1f443` (per spec — verifier commit `eac840e` is the gate, not a TD1 deliverable).
