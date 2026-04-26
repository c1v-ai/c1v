# Preflight Log — LIVE replay (Wave D Step D-0)

**Date:** 2026-04-25
**Agent:** `preflight-and-stage1-schema`
**Project under test:** project=33 (Team Heat Guard — Predictive Heat Safety Platform)
**Schema under test:** `apiSpecificationSchema` (api-spec-agent.ts:127)

## Method

Live invocation against the Anthropic API. Used the captured rendered prompt
from `apps/product-helper/__tests__/fixtures/api-spec/project-33-input.json`.
Bound `apiSpecificationSchema` as a forced tool (mirroring `createClaudeAgent`)
but invoked the underlying `ChatAnthropic.bindTools()` directly so the raw
`AIMessage.response_metadata.stop_reason` and `usage_metadata` survive (the
`withStructuredOutput` wrapper drops them).

Harness: `apps/product-helper/scripts/preflight-api-spec.ts`
Mode: `PREFLIGHT_MODE=live`
API key: production (~108-char `sk-ant-api...` from `.env.local`)
Production parameters preserved: model `claude-sonnet-4-20250514`, temperature `0.2`,
maxTokens `12000`.

## Result

```json
{
  "mode": "live",
  "modelName": "claude-sonnet-4-20250514",
  "temperature": 0.2,
  "maxTokens": 12000,
  "promptChars": 17205,
  "elapsedMs": 118620,
  "stop_reason": "max_tokens",
  "usage": {
    "input_tokens": 6464,
    "output_tokens": 12000,
    "total_tokens": 18464,
    "input_token_details": { "cache_creation": 0, "cache_read": 0 }
  },
  "response_metadata": {
    "model": "claude-sonnet-4-20250514",
    "id": "msg_01WNL2os1zdTMEiie1CCESg7",
    "stop_reason": "max_tokens",
    "type": "message",
    "role": "assistant"
  },
  "toolCallsCount": 1,
  "topLevelKeysEmitted": ["baseUrl", "version", "authentication", "endpoints", "responseFormat"],
  "topLevelKeysEmittedCount": 5,
  "endpointsEmitted": 22,
  "branchDecision": "CUTOFF — split-only fix sufficient. Default stage-1 schema (path,method,description,auth,tags,operationId)."
}
```

## Interpretation

- **Definitive `stop_reason = "max_tokens"`**: the model hit the 12000-token output cap.
- **5/6 top-level keys emitted**, all but `errorHandling` (the last one in the schema). The missing key is the *truncation tail*, not a partial-completion artifact — confirms `tool_use` arguments are being streamed in declaration order and the cap arrives mid-`endpoints`.
- **22 endpoints emitted** (production target ≥30 for project=33's 5 use-cases × ~6 entities). The per-endpoint footprint inside the bound tool's `input_schema` (3× embedded `jsonSchemaSchema` per endpoint at requestBody.schema, responseBody, plus errorHandling.format) drives the cap.
- **Output ratio:** 12000 output tokens vs 6464 input = 1.86×; this is fully token-bound, not parser-bound. The "3-of-6 keys, satisfies tool-use early" symptom in earlier session notes was a different earlier prompt revision. The current state — after maxTokens=12000 + flat-items + prompt enumerations — has shifted the bottleneck from "tool_use early stop" to "max_tokens hard cap". Same root cause (per-endpoint nested schema) — the tail symptom changed.
- **Cost:** ~$0.20 per the spawn-prompt budget. Actual: `6464 × $3/M + 12000 × $15/M = $0.0194 + $0.18 = $0.20` ✓

## Branch decision

**CUTOFF (max_tokens)** — split-only fix is sufficient.

- Stage-1 schema floor: **default** = `{ path, method, description, auth, tags, operationId }` (≤ 8 scalar keys).
- Stage-2 (deferred to `stage2-deterministic-expansion` agent): deterministic CRUD-shape mapper expanding flat ops into full endpoints with requestBody/responseBody/errorCodes.
- `apiSpecificationSchema` (line 127) **preserved** for output validation per D-V21.12.
- No need for the trim-to-`(path,method,operationId)` fallback that would have been required if `stop_reason='end_turn'` (instruction-bias).

## Fixture-vs-live divergence

None. Fixture replay (offline sizing) was consistent with the cutoff hypothesis;
live replay confirms it definitively. No drift carried into v2.2 followups.

## Surprises / unexpected findings

1. **Symptom shift**: agent prompt cited "3-of-6 top-level keys + early tool-use stop". Live behavior is "5-of-6 keys + max_tokens stop" — the prior fixes (12000 maxTokens, flat items, enumerations) advanced the failure mode but did not eliminate it. Same diagnosis still holds: per-endpoint nested schema is the multiplier.
2. **Endpoint count**: 22 endpoints partially emitted before cap — gives a useful upper bound for stage-1 emission target (~30 expected, 22 fit in 12K output).
3. **No prompt caching**: `cache_creation=0`, `cache_read=0`. The configured `cacheControl: true` in `lib/langchain/config.ts` is not propagating to the bound-tool path. Out-of-scope for D-1 but worth a v2.2 followup.
