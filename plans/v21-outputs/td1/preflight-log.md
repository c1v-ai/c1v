# Preflight Log — Reconciliation (Wave D Step D-0, EC-V21-D.1)

**Date:** 2026-04-25
**Agent:** `preflight-and-stage1-schema` (team `c1v-apispec-iter3`)
**Project under test:** project=33 (Team Heat Guard — Predictive Heat Safety Platform)
**Authoritative spec:** `plans/c1v-MIT-Crawley-Cornell.v2.1.md` §Wave D, D-V21.12, EC-V21-D.1.

This is the REVIEW.md cited in EC-V21-D.1. It reconciles the FIXTURE preflight
(`preflight-log-fixture.md`) and the LIVE preflight (`preflight-log-live.md`)
into a single binding branch decision for Steps D-1 through D-4.

## Hypothesis under test

> Sonnet 4.5 emits 3-of-6 top-level keys, satisfies tool-use early — root
> cause is per-endpoint nested response schema embedded via `jsonSchemaSchema`
> (api-spec-agent.ts:71) at three sites in `apiSpecificationSchema`:127.

Two failure modes were possible under that root cause:

| Branch | stop_reason | Diagnosis | Stage-1 floor |
|---|---|---|---|
| **A. CUTOFF** | `max_tokens` or `tool_use` | Output exhaustion or model judges tool-use complete prematurely under output pressure. Split is sufficient. | Default — `{ path, method, description, auth, tags, operationId }` (≤ 8 scalar keys) |
| **B. INSTRUCTION_BIAS** | `end_turn` | Model genuinely treats partial spec as a complete answer regardless of token room. Split alone insufficient — must also remove "auth-only" as a valid stage-1 completion. | Trim — `{ path, method, operationId }` only |

## Evidence

### Fixture preflight (offline)
- Prompt: 17 205 chars (~4 916 tokens)
- Serialized `apiSpecificationSchema` (zod-to-json, $refStrategy='none'): 9 334 chars (~2 667 tokens)
- 22 distinct `"properties"` blocks in the flattened schema confirms 3× `jsonSchemaSchema` embedding multiplied across endpoints/error/request bodies.
- Cannot determine `stop_reason` offline. Sizing consistent with Branch A but does not exclude Branch B.

### Live preflight (Anthropic API, ~$0.20)
- `stop_reason: "max_tokens"` (definitive)
- `usage: { input_tokens: 6464, output_tokens: 12000 }` — output cap hit exactly
- `topLevelKeysEmitted: ["baseUrl","version","authentication","endpoints","responseFormat"]` — 5 of 6 (missing tail: `errorHandling`)
- `endpointsEmitted: 22` (target ≥ 30 for project=33's 5 use-cases × 6 entities)
- `toolCallsCount: 1`
- elapsedMs: 118 620 (~2 min)

### Fixture-vs-live divergence

**None.** Both consistent with Branch A. Fixture sizing predicted token-bound failure; live confirmed it.

## Branch decision: **A. CUTOFF**

**Stage-1 schema floor:** Default — `{ path, method, description, auth, tags, operationId }`
plus optional `tags` array (≤ 8 scalar/scalar-array keys total). No `responseBody`,
no `requestBody`, no `errorCodes` at stage-1.

**Rationale:**
1. Live `stop_reason='max_tokens'` is unambiguous — model wanted to keep going
   and ran out of output budget. Removing per-endpoint nested schemas drops
   per-op output size by ~80% (from ~400 chars to ~80 chars), letting all
   ~30 endpoints fit comfortably in 12K maxTokens with 80%+ headroom.
2. Model emitted 5/6 top-level keys before truncation — instruction-following
   is *not* the bottleneck. A trim-to-`(path,method,operationId)` floor is
   over-correction for the wrong cause.
3. The captured-fixture symptom from earlier session notes ("3-of-6 keys,
   tool_use early stop") has shifted to "5-of-6 keys, max_tokens stop"
   under the already-applied mitigations (maxTokens=12000, flat items,
   prompt enumerations). Same root cause; advanced failure mode. Split
   addresses the underlying multiplier directly.

## Implications for Steps D-1 through D-4

- **D-1 (this team):** Ship `stage1OperationSchema` with the default floor.
  ≤ 8 scalar keys, no nested schemas. Stage-1 emission path bound on
  `createClaudeAgent(stage1OperationSchema, ...)` returning a flat list.
- **D-2 (BLOCKING dependent: `stage2-deterministic-expansion`):** Deterministic
  CRUD-shape mapper. Imports `stage1OperationSchema` from D-1.
- **D-3:** Wire stage-1 → stage-2 in `generateAPISpecification`.
- **D-4:** `apiSpecificationSchema` (line 127) **preserved** as the *output
  validation* schema only — never sent to the model.

## Anomaly note: skill registry

Spawn-prompt mandates `Skill('claude-api')` invocation. No `claude-api` skill
exists at `/Users/davidancor/.claude/skills/`. Substituted with
`langchain-patterns`, `code-quality`, and `api-design`. Recommend adding a
`claude-api` skill (or removing the mandate) in v2.2 followups.

## Surfaced followup (out-of-scope, v2.2)

`response_metadata.usage` shows `cache_creation=0, cache_read=0` despite
`cacheControl: true` in `lib/langchain/config.ts`. The cache flag is not
propagating through `bindTools()` (and likely not through
`withStructuredOutput()` either). Worth reproducing and fixing — cache hits
on the 4.9K-token system+KB block alone would save ~$0.014 per call.
