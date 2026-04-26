# API-Spec Regression Fixtures

Pinned input fixtures for the api-spec agent's regression suite. Each fixture
captures a real failure mode observed in production (or prod-like) so that the
two-stage pipeline (`api-spec-agent.ts` + `api-spec/stage2-expansion.ts`) stays
under regression as we evolve the agent.

Tag of record: `td1-wave-d-complete` @ `bb1f443` (v2.1 Wave D).

## Index

| Fixture                  | Source incident                     | Pinned in test                                                  | EC-V21    |
|--------------------------|-------------------------------------|------------------------------------------------------------------|-----------|
| `project-33-input.json`  | Sonnet 4.5 `stop_reason='max_tokens'` on legacy single-call path; observed empty `output={}` | `__tests__/api-spec/api-spec-two-stage.fixture.test.ts` (full two-stage replay) and `__tests__/api-spec/stage1-fixture-replay.test.ts` (stage-1-only replay) | D.1, D.3 |

## File contract: `project-33-input.json`

```jsonc
{
  "_provenance": {
    "source": "<repo-relative path or URL of source dataset>",
    "capturedAt": "YYYY-MM-DD",
    "projectId": <number>,
    "projectName": "<string>",
    "attemptNumber": <number>,
    "observedFailure": "<one-line description of what went wrong>"
  },
  "_notes": "<free-form context — what shape was captured and why>",
  "renderedPrompt": "<the post-template-substitution prompt string>",
  "renderedPromptLength": <number>,
  "expectedOperationCount_minimum": <number>,
  "observedOutputs": { /* may be empty when the failure was an empty output */ }
}
```

The `renderedPrompt` is the **post-template-substitution** string that was
sent to `invoke()` — NOT the structured `APISpecGenerationContext`. Replaying
the rendered string lets the regression bypass any drift in the prompt-build
template and exercise only the model + parser path.

`expectedOperationCount_minimum` is the lower-bound assertion the regression
test enforces against stage-1's flat operation list. Project=33 is pinned at
**≥ 25 ops** — the legacy single-call path returned 0 (empty output) on the
same input.

## When to add a new fixture

Add a new fixture whenever you observe (or fabricate) a failure mode the
existing fixtures don't cover. Concretely:

1. **New schema-bloat regression.** Real-world project hits
   `stop_reason='max_tokens'`, malformed structured output, or ≥30 endpoints
   the single-call path can't fit. Capture the rendered prompt + minimum-op
   count, write a regression test that replays it.

2. **New non-CRUD verb pattern.** Stage-2's mapping table only knows
   GET/POST/PATCH/PUT/DELETE on entity resources. If a project leans heavily
   on action endpoints (`POST /orders/{id}/cancel`), bulk operations
   (`POST /users/bulk-invite`), or non-entity verbs (`/auth/*`, `/health`),
   add a fixture so we don't silently regress the generic-envelope handoff.

3. **New entity-name heuristic edge case.** If `entityToResourceSegment()` /
   `findOwningEntity()` get confused on plurals, compound nouns, or
   non-English names, capture the offending project and add a fixture +
   round-trip assertion.

## When to BUMP an existing fixture

The fixture is the **input contract** for the agent — bump only when that
contract itself changes. Specifically:

- The `APISpecGenerationContext` shape changes (new required fields, dropped
  fields, renamed keys). The rendered prompt template will start producing a
  different string; capture the new rendered prompt as a NEW fixture (e.g.
  `project-33-input.v2.json`) and pin a new test against it. **Do not
  overwrite the old fixture in-place** — keep the old contract under
  regression as long as legacy projects still ride it.

- The Knowledge Bank section in the prompt (`getAPISpecKnowledge`) changes
  meaningfully (new patterns, dropped patterns, structural reorganization).
  Same rule: capture as a new fixture, keep the old one for the rollout
  window.

- The agent's contract version bumps (manifest_contract_version, structured-
  output schema version). Annotate the new fixture's `_provenance` with the
  contract version it targets.

## How to capture a fixture

1. Reproduce the failure in dev (or pull the failing input from the
   `__tests__/<projectId>/` capture directory if telemetry sidecar landed it).
2. Record the **rendered prompt** — what `invoke()` received, after template
   substitution. The `_notes` block in `project-33-input.json` is the
   canonical example.
3. Fill `_provenance` faithfully: source path, capture date, project IDs, the
   one-line `observedFailure` string, and the attempt number (1-indexed).
4. Pick a meaningful `expectedOperationCount_minimum` — usually the count the
   stage-1 path actually produced when the test was authored, with a small
   safety margin downward. Don't pin to a tight upper bound; mapping rule
   improvements may legitimately raise the count.
5. Write the regression test alongside in `__tests__/api-spec/`.

## References

- Pattern doc: `plans/v21-outputs/td1/two-stage-pattern.md`
- Stage-2 module: `apps/product-helper/lib/langchain/agents/api-spec/stage2-expansion.ts`
- Stage-1 schema: `apps/product-helper/lib/langchain/schemas/api-spec/stage1-operation.ts`
- Plan: `plans/c1v-MIT-Crawley-Cornell.v2.1.md` §Wave D, EC-V21-D.1..5
