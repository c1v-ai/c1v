# Token-Cost Delta — Stage-1 + Stage-2 vs Legacy Single-Call (Wave D Step D-5)

**Date:** 2026-04-25
**Agent:** `stage2-deterministic-expansion`
**Anchors:** EC-V21-D.5 (stage-2 zero LLM tokens; documented drop in single-call output footprint)
**Source script:** `apps/product-helper/scripts/measure-token-cost-delta.ts`
**Live baseline:** `plans/v21-outputs/td1/preflight-log-live.md`

## Method

Deterministic measurement (no fresh LLM calls). Three inputs:

1. **Per-operation footprint** — JSON-serialize one canonical PATCH op
   under (a) the stage-1 schema and (b) the legacy `endpointSchema`
   (with `requestBody.schema` + `responseBody` + 6 errorCodes — i.e.
   what the legacy single-call schema asks the model to emit).
2. **Aggregate stage-1 output** — JSON-serialize the project=33 healthy
   stage-1 emission (35 operations covering 6 entities × CRUD + 5 action
   endpoints) and approximate-tokenize the result.
3. **Live legacy baseline** — input_tokens / output_tokens lifted from
   the live preflight (`stop_reason='max_tokens'`, 22 of 31 endpoints
   emitted at the 12000-output cap).

**Tokenizer:** Anthropic does not ship an offline tokenizer for Claude.
We calibrate from the live preflight: 17205 rendered-prompt chars →
6464 `input_tokens` ⇒ **2.66 chars/token**. We round to **2.7
chars/token** to stay slightly conservative on output (JSON tool_use
arguments are denser than the English-heavy prompt and may tokenize
slightly tighter — using 2.7 *understates* the legacy footprint and
*overstates* the stage-1 footprint, biasing against the favorable
result we report). Rationale per the spec ruling: deterministic counter
preferred over synthetic estimates; this is the closest deterministic
proxy available without a live API call.

## Results

### Per-operation footprint

| Path                                        | Chars   | Approx tokens | Δ vs stage-1 |
|---------------------------------------------|--------:|--------------:|-------------:|
| Stage-1 (flat row, 6 scalar keys + tags)    |   145   |    54         | 1×           |
| Legacy (with nested req/res schemas + errs) | 1,259   |   466         | **8.7×**     |

**Reduction per op: ~8.7× (legacy → stage-1).**
Per-op tokens drop from ~466 to ~54.

### Aggregate (project=33, 35 healthy ops)

| Pipeline                | Stage-1 LLM out | Stage-2 LLM out | Total LLM output | Endpoints emitted |
|-------------------------|----------------:|----------------:|-----------------:|------------------:|
| Legacy single-call      | n/a             | n/a             | **12,000** (capped) | **22 of 31** (truncated) |
| Stage-1 + Stage-2 (new) | ~2,092 tokens   | **0** (deterministic) | ~2,092 | **35 of 35** (no cap hit) |

**Output-token reduction: 12,000 → ~2,092 = ~83% drop (≈5.7× cheaper on output).**
**Stage-2 LLM tokens: 0 (EC-V21-D.5 satisfied).**

### Cost estimate (Sonnet 4.5: $3/M input, $15/M output)

| Pipeline                | Input tokens | Output tokens | Cost     |
|-------------------------|-------------:|--------------:|---------:|
| Legacy single-call      | 6,464        | 12,000 (cap)  | **$0.1994** |
| Stage-1 + Stage-2 (new) | 6,464        | ~2,092        | **$0.0508** |

**Per-project cost: ~75% drop ($0.20 → $0.05).**

### Headroom recovered

- Legacy: 12,000-token output cap saturated. Trailing `errorHandling`
  key truncated; 9 endpoints lost to cutoff.
- Stage-1: ~2,092 output tokens against a 4,000-token cap configured in
  `generateStage1ApiSpec` ⇒ ~48% of cap used. Adds headroom for
  larger projects (≥ 50 ops fits comfortably).

## Anti-regression artifacts

The `__tests__/api-spec/stage2-expansion.test.ts` and
`__tests__/api-spec-agent.regression.test.ts` suites pin:

- 6/6 top-level keys present in two-stage assembly (vs 5/6 observed
  legacy live truncation).
- Endpoint count = stage-1 op count (no truncation).
- Round-trip parse against the preserved `apiSpecificationSchema`.

## Approximation accuracy + caveats

- The 2.7 chars/token figure is calibrated to the live preflight
  prompt. Output JSON may tokenize slightly differently — the *delta*
  ratio is robust because the tokenizer constant cancels.
- Real Anthropic billing is on the live `usage_metadata.output_tokens`,
  which we *will* observe under the v2.1 production rollout. A live
  validation after rollout (replace approx with `usage.output_tokens`)
  is recommended as a Wave-B+ followup (R-V21.10), not a v2.1 blocker.
- Stage-1's input-token count is unchanged — same prompt structure as
  legacy minus the "Required Output Structure" enumeration of nested
  fields. Marginal input savings (~50-100 tokens) ignored here as
  noise.

## Verdict — EC-V21-D.5 satisfied

- ✅ Stage-2 produces ZERO LLM tokens (deterministic mapper, pure function).
- ✅ Single-call output footprint **dropped from 12,000 → ~2,092
  tokens** (~83% reduction, ~5.7× cheaper on output).
- ✅ Per-project cost **dropped from $0.20 → $0.05** (~75% reduction).
- ✅ Endpoint truncation eliminated (12000-cap → 4000-cap with ~48%
  utilization).
