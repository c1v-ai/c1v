# Two-Stage Extraction Pattern

A reusable pattern for cutting LLM output-token explosion in structured-output
agents whose response shape grows with both *cardinality* (how many items) and
*depth* (how nested each item is).

This document is for someone who hasn't seen the iter-3 incident. If you
find yourself writing `z.array(z.object({ ... deep nested object ... }))`
as the top-level schema for an LLM tool call and watching `stop_reason`
come back as `max_tokens`, read on.

Worked example: `apps/product-helper/lib/langchain/agents/api-spec-agent.ts`
(TD1, v2.1 Wave D, tag `td1-wave-d-complete` @ `bb1f443`).

---

## When to apply two-stage extraction

The signal is concrete and easy to spot:

- An LLM call with structured output (Zod tool, JSON-mode, structured-output
  binding) is returning `stop_reason='max_tokens'` — or worse, an empty
  output object — on real inputs that worked fine on small synthetic ones.
- The structured-output schema embeds large, repeating sub-schemas. A
  request/response JSON Schema inside an endpoint, an attribute list inside
  an entity, a flow-step list inside a use case — anything that re-emits a
  full sub-tree per parent item.
- The output token count grows roughly as
  `O(n_items × avg_subtree_size)` and the curve crosses the model's
  output-token cap on the long tail of real projects.

If those three are present, single-call structured output is the wrong
architecture. The model is being asked to do two jobs at once: enumerate the
items, AND emit the deterministic shape of each item. Split them.

### Counter-signal — when NOT to apply

Don't reach for two-stage if:

- The sub-schemas are content-bearing (the LLM has to **reason** about each
  item's body, not just shape it). Example: per-endpoint security analysis,
  per-FMEA-row qualitative narrative. There's no determinism to extract.
- Item count is low and stable (< 10) and the model isn't hitting the cap.
  The added complexity isn't worth it.
- The cost driver is *input* tokens, not output. Two-stage adds a second
  call's worth of input — it only saves you on output explosion.

---

## How to identify the regression in a structured-output agent

Run the math before you split. For an api-spec-style agent:

```
output_tokens
  ≈ n_endpoints × (
        endpoint_metadata        // ~80 tokens (path, method, op-id, etc.)
      + request_schema           // ~120 tokens (per-property × n_attrs)
      + response_schema          // ~120 tokens
      + error_codes              // ~60  tokens
      + parameters               // ~40  tokens
    )
  + global_envelope              // ~200 tokens (auth, errorHandling, etc.)
```

For project=33 (Team Heat Guard, ~25 endpoints over 6 entities) this hits
~10–12k output tokens — comfortably past the 8k effective cap on Sonnet's
structured-output path at the time.

After splitting:

```
stage_1_output ≈ n_endpoints × endpoint_metadata          ≈ 2k tokens
stage_2_output = 0                                         (deterministic)
```

The stage-1 output stays well clear of any cap regardless of project size.

### Schema-cardinality audit checklist

When you suspect bloat, walk the Zod schema and ask, per nested array:

1. Is each item's body **derivable** from a smaller index (an entity name +
   the parent item's metadata)?
2. If yes, can a deterministic mapper produce it? (Pure function, no LLM.)
3. If no, is there a separate per-item LLM call that could produce just that
   one item's body, paged?

A "yes" to (1) + (2) is the two-stage shape. A "no" to (1) but "yes" to (3)
is the per-item-LLM-call shape — different pattern, same root cause.

---

## How to split: the two-stage shape

### Stage 1 — LLM emits a flat index

- Schema: a flat array of small scalar records (~80 chars each, no nested
  sub-schemas). For api-spec: `Stage1ApiSpec[]` = `{ path, method,
  description, auth, tags, operationId, sourceUseCases? }` — 8 keys, all
  scalars or string arrays.
- Token cap: drop the cap aggressively (api-spec cut from 12000 → 4000) so
  the model knows it can't ramble.
- Prompt: tell it to just **list** the API surface; don't ask for shapes.

### Stage 2 — Deterministic mapper expands the index

- Pure function: `(stage1_output, project_context) → full_output_shape`.
- No LLM calls. No `Math.random`. No `Date.now()`. Same input must always
  produce the same output (this is testable as a snapshot regression).
- Mapping rules belong in a single dispatcher function (api-spec uses
  `expandOperation()` switching on `(method, hasPathParam, hasOwningEntity)`).
- Validate the assembled output against the **preserved** original schema
  — the schema's role flips from "structured-output prompt to LLM" to
  "post-assembly output validator".

### Output validation — preserve the legacy schema

DO NOT delete the legacy structured-output schema. Keep it in-file (api-spec
keeps `apiSpecificationSchema` at line 135) and parse stage-2's output
through it before returning. This catches drift between your mapper and the
type contract — and it lets you fall back to the legacy single-call path on
any error without rewiring downstream consumers.

---

## How to ship behind a feature flag

The default-on-new / default-off-existing rollout is the canonical shape:

```
env API_SPEC_TWO_STAGE unset       → two-stage (default ON for new projects)
env API_SPEC_TWO_STAGE=off         → legacy single-call path (kill switch)
options.twoStage = false           → per-call override (existing projects)
options.twoStage = true            → per-call override (force new path)
```

Per-call override beats env. Existing projects pass `twoStage: false` until
they re-generate; that way no project ever sees a silent shape diff between
two adjacent regen cycles.

Wrap the new path in `try`; on any thrown error, fall back to the legacy
path. The flag is a forward-only migration tool — it never *replaces* the
legacy code, it *bypasses* it. Removal of the legacy path is a separate
later commit, gated on telemetry showing zero fallbacks for N consecutive
days.

### Legacy-path test pinning

Tests that exercise the legacy retry/fallback chain MUST be pinned to
`twoStage: false` so they keep exercising the legacy contract once the env
default flips to ON. Otherwise they'll silently start running the new path
and stop catching legacy regressions. (See TD1 commit `bb1f443` for the
worked example.)

---

## TD1 as a worked example

| Commit    | What landed                                                  |
|-----------|--------------------------------------------------------------|
| `310838d` | Stage-1 fixture-replay regression test (Step D-1)            |
| `beaf8cf` | Stage-2 deterministic CRUD-shape expansion engine (Step D-2) |
| `2310674` | Stage-2 unit tests                                           |
| `a5d8bb9` | Wired stage-1 + stage-2 into agent + env flag (Step D-3)     |
| `fba7dcb` | Full two-stage fixture-replay regression                     |
| `bb1f443` | Legacy-path tests pinned with `twoStage:false`               |
| `e2d58b2` | Token-cost delta — 83% output-token + 75% cost reduction     |
| `a0f36ca` | Wave D verification report — 5/5 ECs PASS                    |

Tag of record: `td1-wave-d-complete` @ `bb1f443`. Verifier:
`apps/product-helper/scripts/verify-td1.ts`. Verification report:
`plans/v21-outputs/td1/verification-report.md`. Token-cost delta:
`plans/v21-outputs/td1/token-cost-delta.md`.

### Reuse checklist

If you're applying this pattern to a new agent, in order:

1. Run the schema-cardinality audit (above). Confirm the regression is
   shape-bloat, not content-bloat.
2. Define the stage-1 schema next to the existing schema; put it under
   `lib/langchain/schemas/<agent>/stage1-*.ts`.
3. Build the stage-2 mapper as a pure function under
   `lib/langchain/agents/<agent>/stage2-expansion.ts` with the mapping
   table at the top of file in JSDoc.
4. Add a regression fixture under `__tests__/fixtures/<agent>/` capturing
   the input that broke the legacy path (rendered prompt + minimum item
   count). See `apps/product-helper/__tests__/fixtures/api-spec/README.md`
   for the contract.
5. Wire the agent's existing entrypoint with `try { stage1+stage2 } catch
   { legacy }` behind an env flag; default-on-new / default-off-existing.
6. Pin existing legacy-path tests with the per-call override.
7. Write the verification harness that asserts (a) both paths produce a
   valid output shape on a known fixture, (b) stage-2 is deterministic,
   (c) zero LLM calls in stage-2, (d) the env flag honoured.
8. Land everything as one tag and link it from this doc's table.

The pattern is generic. Anywhere c1v has a structured-output agent whose
output shape is `flat-index × deterministic-expansion`, this split applies.
