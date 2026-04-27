---
name: TC1 — Crawley Schemas Shipped
status: COMPLETE
shipped_at: 2026-04-27
branch: wave-c/tc1-m345-schemas
ec_pins: [EC-V21-C.1, EC-V21-C.2]
canonical_index: apps/product-helper/lib/langchain/schemas/index.ts
canonical_registry: CRAWLEY_SCHEMAS (10 phase artifacts) + CRAWLEY_MATRIX_KEYSTONE (1 primitive) = 11 deliverables
---

# Crawley Schemas Shipped — TC1

10 phase-artifact schemas + 1 matrix keystone primitive per
`plans/crawley-sys-arch-strat-prod-dev/REQUIREMENTS-crawley.md` §1 + §5.

## Schemas

| # | Schema ID | Source File | Crawley Ref | Test Coverage | Matrix Consumer |
|---|---|---|---|---|---|
| 1 | `module-5.phase-1-form-taxonomy.v1` | `apps/product-helper/lib/langchain/schemas/module-5/phase-1-form-taxonomy.ts` | Ch 4 | `module-5/__tests__/phase-1-form-taxonomy.test.ts` (7 tests) | — |
| 2 | `module-5.phase-2-function-taxonomy.v1` | `apps/product-helper/lib/langchain/schemas/module-5/phase-2-function-taxonomy.ts` | Ch 5 | `module-5/__tests__/phase-2-function-taxonomy.test.ts` (6 tests) | `po_array_derivation` (1 × matrix) |
| 3 | `module-5.phase-3-form-function-concept.v1` | `apps/product-helper/lib/langchain/schemas/module-5/phase-3-form-function-concept.ts` | Ch 6 | `module-5/__tests__/phase-3-form-function-concept.test.ts` (8 tests) | `full_dsm_block_derivations[9]` (9 × matrix) + `dsm_projection_chain_derivation` (1 × scalar) |
| 4 | `module-5.phase-4-solution-neutral-concept.v1` | `apps/product-helper/lib/langchain/schemas/module-5/phase-4-solution-neutral-concept.ts` | Ch 7 | `module-5/__tests__/phase-4-solution-neutral-concept.test.ts` (6 tests) | — |
| 5 | `module-5.phase-5-concept-expansion.v1` | `apps/product-helper/lib/langchain/schemas/module-5/phase-5-concept-expansion.ts` | Ch 8 | `module-5/__tests__/phase-5-concept-expansion.test.ts` (7 tests) | — |
| 6 | `module-3.decomposition-plane.v1` | `apps/product-helper/lib/langchain/schemas/module-3/decomposition-plane.ts` | Ch 13 | `module-3/__tests__/decomposition-plane.test.ts` (7 tests) | — (scalar `mathDerivationSchema` only) |
| 7 | `module-4.decision-network-foundations.v1` | `apps/product-helper/lib/langchain/schemas/module-4/decision-network-foundations.ts` | Ch 14 | `module-4/__tests__/decision-network-foundations.test.ts` (peer-authored) | — |
| 8 | `module-4.tradespace-pareto-sensitivity.v1` | `apps/product-helper/lib/langchain/schemas/module-4/tradespace-pareto-sensitivity.ts` | Ch 15 | `module-4/__tests__/tradespace-pareto-sensitivity.test.ts` (8 tests) | — (scalar `mathDerivationSchema`) |
| 9 | `module-4.optimization-patterns.v1` | `apps/product-helper/lib/langchain/schemas/module-4/optimization-patterns.ts` | Ch 16 | `module-4/__tests__/optimization-patterns.test.ts` (8 tests) | — |
| 10 | `module-2.requirements-crawley-extension.v1` | `apps/product-helper/lib/langchain/schemas/module-2/requirements-crawley-extension.ts` | Ch 11 | `module-2/__tests__/requirements-crawley-extension.test.ts` (7 tests) | — |
| keystone | `mathDerivationMatrixSchema` (M5-local, Option Y) | `apps/product-helper/lib/langchain/schemas/module-5/_matrix.ts` | REQUIREMENTS-crawley §5 | `module-5/__tests__/_matrix.test.ts` (5 tests) | itself — sibling type to `mathDerivationSchema` |

## Tests

- 11 per-schema test suites + 1 registry no-dupes test = **12 suites, ~80+ tests, all green**.
- Every schema-level `describe()` validated to start with `x-ui-surface=` prefix via `zodToStrictJsonSchema`.
- Round-trip: every schema asserts `parse(JSON.parse(JSON.stringify(parsed)))` deep-equal to `parsed`.
- Type narrowing: every schema asserts the inferred type carries through.

## Matrix-Site Refactor (EC-V21-C.2)

**Outcome: schema-layer refactor IS the matrix-site refactor — already complete.**

The 10 matrix sites + 1 scalar projection-chain are consumed at the **schema-author level** by the already-shipped Crawley phase schemas:

| Site | Consumer | Schema Symbol |
|---|---|---|
| `po_array_derivation` (1 × matrix) | `module-5/phase-2-function-taxonomy.ts:162` | `mathDerivationMatrixSchema` |
| `full_dsm_block_derivations[0..8]` (9 × matrix) | `module-5/phase-3-form-function-concept.ts:222` via `fullDsmBlockDerivationEntrySchema` | `mathDerivationMatrixSchema` |
| `dsm_projection_chain_derivation` (1 × scalar chain) | `module-5/phase-3-form-function-concept.ts:228` | `mathDerivationSchema` (scalar — references the 9 block ids via `inputs`) |

**Sites refactored at schema layer: 10 (PO array + 9 DSM blocks). Scalar chain: 1.**

**Agent-emitter sites: NONE refactored — deferred to v2.2.** The agent layer (`form-function-agent.ts`, `synthesis-agent.ts`, etc.) currently emits pre-Crawley shapes that do NOT yet populate `po_array_derivation` or `full_dsm_block_derivations`. Migrating agent emitters to populate these new matrix-derivation fields is a separate concern (Wave D agent-rewrite / v2.2). The schema gate is closed and rejects future agent emissions that omit or mis-type these fields.

**Decision rationale:** REQUIREMENTS-crawley §5 locality rule — "stays M5-local until a 3rd non-M5 site emerges". HoQ relationship matrix (M6) and N2 matrix (M7) are NOT consumers of `mathDerivationMatrixSchema` — they're pre-existing structural matrices with their own JSONB shapes. The keystone hoists to `_shared.ts` only when a 3rd non-M5 site needs it.

## Drift Surfaced

- `lib/langchain/schemas.ts` (legacy file) shadows the new `schemas/index.ts` for `'../schemas'` imports under bundler resolution. New barrel is reachable via explicit `'@/lib/langchain/schemas/index'` or subpath imports — documented in the new file's header comment.
- Pre-existing baseline `tsc` errors (9 errors in `db/schema/traceback*`, `lib/langchain/engines/*`, `scripts/atlas/validate-entries.ts`) are untouched by this work.
- Peer-team error `scripts/generate-eval-datasets.ts` (eval-harness team #4) is unrelated to TC1 and pre-existed when this task started.

## Guardrails honored

- ZERO modifications to `module-2/_shared.ts` (REQUIREMENTS-crawley curator decision).
- ZERO modifications to the 8 already-shipped Crawley schemas.
- HARD-DEP `tc1-preflight-complete` @ `3e2abdf` reachable from `wave-c/tc1-m345-schemas` HEAD.
- All commits are per-file atomic (no `git add -A` / `git add .`); no `Co-Authored-By` lines.
- `npx tsc --noEmit --project apps/product-helper/tsconfig.json` returns ONLY the 9 pre-existing baseline errors.
- All schemas use Zod (no new schema library introduced).
