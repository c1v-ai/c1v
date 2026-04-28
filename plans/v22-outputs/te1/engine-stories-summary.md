---
agent: engine-stories
team: c1v-kb-runtime-engine
wave: E
ec: V21-E.8 (engine.json story trees) + feeds V21-E.14 (greenfield refactor)
produced: 2026-04-27
status: complete
---

# Engine Stories — TE1 closeout

13 engine.json story trees authored at `apps/product-helper/.planning/engines/`.
Schema boundary: `apps/product-helper/lib/langchain/schemas/engines/story-tree.ts`
(re-export of `engineDocSchema` from `engine.ts` per "no duplicate Zod shape" rule).
Golden tests at `apps/product-helper/lib/langchain/engines/__tests__/golden-rules.test.ts`
pass 40/40 against 104 fixtures (~8 per story).

## Scope split

- **7 greenfield-generation rule trees** — consumed by `agent-greenfield-refactor`
  (T1+ε agent) for P10 closure. Each predicate produces non-empty output from
  intake + upstream artifacts WITHOUT depending on a pre-populated stub.
- **6 refinement-from-existing-data rule trees** — refine values that v2.1
  agents already produce; engine swap consumes them behind `nfrImpl='engine'`
  per the LOCKED DI-pattern in `~/.claude/teams/c1v-kb-runtime-engine/context.md`.

## Story map

| story_id | shape | module | phase / artifact target | decisions | fixtures | grade-source |
|---|---|---|---|---|---|---|
| `m1-data-flows` | greenfield | M1 | data_flows[*].classification (auth / payment / telemetry) | 3 | 8 | hand-graded against M1 v2-self-app emission |
| `m5-form-function` | greenfield | M5 | form_function_map[*].chosen_form (persist / compute / llm) | 3 | 8 | hand-graded against `form_function_map.v1.json` |
| `m4-decision-network` | greenfield | M4 | decision_network[D-01..D-04].chosen_alternative | 4 | 8 | hand-graded against `decision_network.v1.json` |
| `m7-n2` | greenfield | M7 | n2_matrix[*->*].interface_id (4 cells) | 4 | 8 | hand-graded against `n2_matrix.v1.json` |
| `m8-fmea-early` | greenfield | M8.a | fmea_early[FM-*].rpn (auth / data-loss / llm-drift) | 3 | 8 | hand-graded against `fmea_early.v1.json` |
| `m8-fmea-residual` | greenfield | M8.b | fmea_residual[FM-*].rpn_after | 3 | 8 | hand-graded against `fmea_residual.v1.json` |
| `m4-synthesis-keystone` | greenfield | M4 (portfolio) | architecture_recommendation.{recommended_alternative_id, monthly_cost, p95_latency, availability} | 4 | 8 | hand-graded against `architecture_recommendation.v1.json` |
| `m2-nfr` | refinement | M2 | nfr.{p95_latency_ms, throughput_qps, availability_target} | 3 | 8 | v2 self-application emission (graded) |
| `m2-constants` | refinement | M2 | constants.{pii_retention_days, session_ttl_minutes, rate_limit_per_min} | 3 | 8 | hand-graded |
| `m3-ffbd` | refinement | M3 | ffbd[FN-*].box_kind (authenticate / persist / run-ai) | 3 | 8 | hand-graded against `ffbd.v1.json` |
| `m5-form-function-morphological` | refinement | M5 | morphological_matrix[*].alternative_count + total_combinations | 3 | 8 | hand-graded |
| `m6-qfd` | refinement | M6 | hoq.customer_priorities[PC.LATENCY / PC.SECURITY / PC.COST] | 3 | 8 | hand-graded against `hoq.v1.json` |
| `m7-interfaces` | refinement | M7 | interface_specs[IF.*].protocol (auth / persist / telemetry) | 3 | 8 | hand-graded against `interface_specs.v1.json` |
| **TOTAL** | — | — | — | **42** | **104** | — |

## Coverage matrix (per story)

| story_id | rules | default branch present? | confidence_modifiers count | fallback declared? |
|---|---|---|---|---|
| `m1-data-flows` | 9 | 3/3 | 8 | 1 (df_user_auth_flow → Q.M1.DF.AUTH) |
| `m5-form-function` | 11 | 3/3 | 8 | 0 |
| `m4-decision-network` | 11 | 4/4 | 5 | 0 |
| `m7-n2` | 9 | 4/4 | 5 | 0 |
| `m8-fmea-early` | 8 | 3/3 | 4 | 0 |
| `m8-fmea-residual` | 9 | 3/3 | 4 | 0 |
| `m4-synthesis-keystone` | 14 | 4/4 | 8 | 1 (synthesis_recommended_alternative_id → Q.M4.SYN.AV) |
| `m2-nfr` | 14 | 3/3 | 7 | 1 (nfr_p95_latency_target → Q.M2.NFR.LAT) |
| `m2-constants` | 11 | 3/3 | 5 | 0 |
| `m3-ffbd` | 10 | 3/3 | 4 | 0 |
| `m5-form-function-morphological` | 9 | 3/3 | 3 | 0 |
| `m6-qfd` | 11 | 3/3 | 5 | 0 |
| `m7-interfaces` | 8 | 3/3 | 4 | 0 |

Three fallbacks intentionally limited to high-stakes user-facing decisions
(M1 auth flow, M2 latency target, M4 synthesis keystone). All other
decisions degrade through the `default` branch + `rule_default_branch`
modifier penalty (−0.05 to −0.15) — surface-gap path triggers only when
final_confidence still falls below the per-decision auto_fill_threshold.

## Predicate-DSL operator mix

All predicates use the JSON-shape DSL in `engines/predicate-dsl.ts`. Suffix
operators in use: `_in`, `_contains`, `_lt` (none), `_lte` (none), `_gt`
(none), `_gte` (none), `_range` (none), `_exists` (none). Composition
operators: implicit `_and` (multi-key flat-equality) is dominant; no
explicit `_or` or `_not` was needed.

The simple operator mix is intentional — keeping rule trees readable for
the Crawley/Cornell self-application demo. Future stories that need
threshold logic (e.g., `latency_budget_ms_lt: 500`) extend the same DSL.

## Test decoupling

`golden-rules.test.ts` invokes only `evaluatePredicate` from
`engines/predicate-dsl.ts` and `engineDocSchema.safeParse` from
`schemas/engines/engine.ts`. It does NOT instantiate `NFREngineInterpreter`
— per critique #10 in the engine-stories spec, this lets the audit-writer
team and engine-stories team work in parallel without test-fixture
contention.

## Greenfield consumer (downstream)

`agent-greenfield-refactor` (T1+ε) iterates `decisions[]` for each of the
7 greenfield stories. Mechanism (per fix-up Correction 1):

1. Resolve `EngineInputs` from intake + upstream artifacts.
2. Call `interpreter.evaluateRule(decision, inputs)` for each `DecisionRef`.
3. Assemble `value`s into the corresponding artifact row.
4. If `needs_user_input: true` → route through `system-question-bridge.ts`
   with the fallback `question_id` (where declared).

This closes EC-V21-E.14 — the 7 v2.1 nodes that pre-Wave-E produced ZERO
output now produce non-empty rows from intake signals alone.

## Verification

- 13/13 engine.json files Zod-validate against `engineDocSchema`.
- 104/104 fixtures pass the predicate-evaluator + value-pin assertions.
- `tsc --noEmit` clean across `lib/langchain/engines/` and
  `lib/langchain/schemas/engines/`.
- Final golden-rules run: `Tests: 40 passed, 40 total`.

## Commit list

| sha | subject |
|---|---|
| `039efcd` | feat(wave-e): schemas/engines/engine.ts — Zod boundary (cherry-picked) |
| `425bb15` | feat(wave-e): schemas/engines/story-tree.ts — convenience alias |
| `4c3c6ff` | feat(wave-e): engine.json m1-data-flows |
| `7dfcc36` | feat(wave-e): engine.json m5-form-function |
| `acbd9ff` | feat(wave-e): engine.json m4-decision-network |
| `b5fd6e4`* | feat(wave-e): engine.json m7-n2 |
| `8a8c8e8`* | feat(wave-e): engine.json m8-fmea-early |
| `aaa3c8f`* | feat(wave-e): engine.json m8-fmea-residual |
| `db9716c`* | feat(wave-e): engine.json m4-synthesis-keystone |
| `4e7ed61` | feat(wave-e): engine.json m2-nfr |
| `7a33580` | feat(wave-e): engine.json m2-constants |
| `fd3b871` | feat(wave-e): engine.json m3-ffbd |
| `e4e474e` | feat(wave-e): engine.json m5-form-function-morphological |
| `433c843` | feat(wave-e): engine.json m6-qfd |
| `02240d7` | feat(wave-e): engine.json m7-interfaces |
| `63c4309` | test(wave-e): golden-rules fixtures + test (104 fixtures, 40/40 pass) |
| `5713b49` | fix(wave-e): m4-synthesis-keystone fixture predicate-match correction |

(*SHAs marked may shift slightly across cherry-pick rebases; final list
re-verified before SendMessage handoff to team-lead.)
