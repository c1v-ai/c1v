# Preflight Log — FIXTURE replay (Wave D Step D-0)

**Date:** 2026-04-25
**Agent:** `preflight-and-stage1-schema` (team `c1v-apispec-iter3`)
**Project under test:** project=33 (Team Heat Guard — Predictive Heat Safety Platform)
**Schema under test:** `apiSpecificationSchema` (api-spec-agent.ts:127), embeds `jsonSchemaSchema` (line 71) at 3 sites (line 84 requestBody.schema, line 103 endpoint.responseBody, line 123 errorHandling.format).

## Method

Offline replay with no Anthropic API call. Loaded the captured rendered prompt from
`apps/product-helper/__tests__/fixtures/api-spec/project-33-input.json` (sourced from
`apps/product-helper/__tests__/33/dataset_a5302566-c512-4b84-a7fe-4510f28868a2.jsonl#L1`,
attempt 1 — observed empty output `{}`). Serialized the live `apiSpecificationSchema`
to JSON Schema (`zod-to-json-schema`, `$refStrategy: 'none'` to mimic Anthropic
tool-use input_schema flattening) and measured byte/token sizes.

Harness: `apps/product-helper/scripts/preflight-api-spec.ts`
Mode: `PREFLIGHT_MODE=fixture`

## Result

```json
{
  "mode": "fixture",
  "modelName": "claude-sonnet-4-20250514",
  "temperature": 0.2,
  "maxTokens": 12000,
  "promptChars": 17205,
  "schemaJsonChars": 9334,
  "promptApproxTokens": 4916,
  "schemaApproxTokens": 2667,
  "jsonSchemaSchemaEmbedSites": 22
}
```

## Interpretation

- **Prompt budget:** ~4.9K input tokens; with 9.3KB serialized schema (~2.7K tokens
  embedded as tool input_schema) total context overhead ≈ 7.6K tokens before any
  endpoint emission begins.
- **Embed sites:** 22 distinct `"properties"` blocks in the flattened JSON schema.
  This is the structural footprint of `jsonSchemaSchema` recurring at requestBody,
  responseBody (per endpoint), and errorHandling.format. Per-endpoint
  responseBody is the multiplier — at 30 endpoints production scale, the
  emitted-output schema-shape footprint dominates.
- **Output cap:** 12000 maxTokens. A complete spec with 30 endpoints × ~5 nested
  fields each (path/method/description/operationId/responseBody-properties)
  routinely fills 8-10K output tokens; the residual margin for tool-use closure
  is thin.

## Branch decision (provisional, fixture-only)

**Cannot determine `stop_reason` from offline replay.** Sizing is consistent
with the cutoff hypothesis (max_tokens or tool_use) but does not exclude the
end_turn (instruction-bias) hypothesis. Live preflight required to resolve.

See `preflight-log-live.md` for the production-API replay and `preflight-log.md`
for the reconciled branch decision per EC-V21-D.1.

## Anomaly note: skill registry

The agent prompt mandates `Skill('claude-api')` invocation, but no
`claude-api` skill exists in `/Users/davidancor/.claude/skills/`. Substituted
with `langchain-patterns`, `code-quality`, and `api-design`. Recommend adding
`claude-api` skill (or removing the mandate) in v2.2 followups.
