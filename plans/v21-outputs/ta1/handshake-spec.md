# Wave A ↔ Wave E Handshake — Authoritative Spec

**Status:** v2.1 LOCKED. v2.2 Wave E spawn-prompts MUST reference this doc verbatim.
**Owner:** TA1 (Wave A producer surface). Wave E (v2.2) consumes.
**Source:** `plans/c1v-MIT-Crawley-Cornell.v2.1.md` §"Contract pin (Wave A ↔ Wave E handshake — locked 2026-04-25 16:28 EDT)" — expanded here with executable file paths, import names, version-flag bump rules, and failure-path test fixtures.

---

## 1. Why this handshake exists

Wave A (v2.1) wires the LangGraph node names. Wave E (v2.2) swaps the implementations behind those names. The contract pin guarantees Wave E can change M2 NFR/constants engine internals **without forcing a Wave A re-edit** — provided the emitted Zod-validated shape stays stable.

Concretely:
- `GENERATE_nfr` and `GENERATE_constants` ship in v2.1 calling the existing LLM-only M2 NFR agent.
- `GENERATE_nfr` and `GENERATE_constants` switch in v2.2 to call `nfrEngineInterpreter.evaluate(...)` (Wave E's heuristic-first engine).
- Both implementations emit the SAME Zod shape, gated by `nfr_engine_contract_version: 'v1'`.

If Wave E needs to change the shape, it bumps the version flag to `'v2'` AND opens a Wave-A re-edit. That is the explicit failure mode of the contract.

---

## 2. Affected nodes

Two LangGraph nodes in `apps/product-helper/lib/langchain/graphs/intake-graph.ts`:

| Node | Wave A producer (v2.1) | Wave E producer (v2.2) | Output Zod shape |
|---|---|---|---|
| `GENERATE_nfr` | Existing M2 NFR agent (LLM-only) | `nfrEngineInterpreter.evaluate(...)` | NFR slice of `submodule-2-3-nfrs-constants.ts` |
| `GENERATE_constants` | Bundled inside NFR agent (Wave A extracts) | Reads `constants.engine.json` rule trees | Constants slice of `submodule-2-3-nfrs-constants.ts` |

The other 7 GENERATE_* nodes (data_flows, form_function, decision_network, n2, fmea_early, fmea_residual, synthesis) are NOT under contract pin — they ship in v2.1 with their final v2.1 shape and Wave E does not touch them.

---

## 3. Zod schemas — file paths and import names

### 3.1 Output envelope contract (NEW — Wave A ships)

**File:** `apps/product-helper/lib/langchain/graphs/contracts/nfr-engine-contract-v1.ts`
**Owner:** Wave A `langgraph-wirer` agent (v2.1).
**Required exports:**

```typescript
import { z } from 'zod';
import { nfrSchema } from '@/lib/langchain/schemas/module-2/submodule-2-3-nfrs-constants';
import { constantSchema } from '@/lib/langchain/schemas/module-2/submodule-2-3-nfrs-constants';

/** Stable interface version — bump to 'v2' only on shape break. */
export const NFR_ENGINE_CONTRACT_VERSION = 'v1' as const;

/** Success envelope for GENERATE_nfr. */
export const generateNfrSuccessEnvelope = z.object({
  nfr_engine_contract_version: z.literal('v1'),
  status: z.literal('ok'),
  nfrs: z.array(nfrSchema),
});

/** Success envelope for GENERATE_constants. */
export const generateConstantsSuccessEnvelope = z.object({
  nfr_engine_contract_version: z.literal('v1'),
  status: z.literal('ok'),
  constants: z.array(constantSchema),
});

/** Failure envelope shared by both nodes. Routes to system-question-bridge.ts (NOT thrown). */
export const needsUserInputEnvelope = z.object({
  nfr_engine_contract_version: z.literal('v1'),
  status: z.literal('needs_user_input'),
  computed_options: z.array(
    z.object({
      label: z.string(),
      value: z.unknown(),
      confidence: z.number().min(0).max(1),
      rationale: z.string(),
    }),
  ),
  math_trace: z.string(),
});

export const generateNfrEnvelope = z.discriminatedUnion('status', [
  generateNfrSuccessEnvelope,
  needsUserInputEnvelope,
]);

export const generateConstantsEnvelope = z.discriminatedUnion('status', [
  generateConstantsSuccessEnvelope,
  needsUserInputEnvelope,
]);

export type GenerateNfrEnvelope = z.infer<typeof generateNfrEnvelope>;
export type GenerateConstantsEnvelope = z.infer<typeof generateConstantsEnvelope>;
```

### 3.2 Upstream Zod sources (FROZEN — Wave E reads, does NOT redefine)

- NFR row shape: `apps/product-helper/lib/langchain/schemas/module-2/phase-6-requirements-table.ts` → composed into `submodule-2-3-nfrs-constants.ts` `nfrs[]` field.
- Constant row shape: `apps/product-helper/lib/langchain/schemas/module-2/phase-8-constants-table.ts` → composed into `submodule-2-3-nfrs-constants.ts` `constants[]` field.

Wave E imports these directly. Wave E MUST NOT redefine. If a field changes, increment `NFR_ENGINE_CONTRACT_VERSION` and coordinate a Wave A re-edit.

---

## 4. Failure-path → chat-bridge contract

When an evaluation returns `final_confidence < 0.90` AND `decision.llm_assist === false` AND no fallback rule matched, the node emits a `needsUserInputEnvelope` and routes to the chat bridge. **It does NOT throw.**

**Bridge entry point:** `apps/product-helper/lib/chat/system-question-bridge.ts` exports `emitOpenQuestion(input: OpenQuestionInput): Promise<void>`.

**Routing flow:**
```
GENERATE_nfr / GENERATE_constants
  └─> emit needsUserInputEnvelope
      └─> emitOpenQuestion({ source: 'nfr-engine' | 'constants-engine', envelope, projectId, ... })
          └─> persists to extractedData.openQuestions.requirements
          └─> appends to chat thread (assistant message, structured)
          └─> sets project_artifacts.synthesis_status='needs_user_input' for the affected slice
```

The graph state for that node is then `{ status: 'needs_user_input', ... }` — downstream conditional edges branch to `END` (await user). When the user responds, the chat handler routes the answer back into `extract_data` → re-runs `GENERATE_nfr`/`GENERATE_constants` with the new context.

---

## 5. Version-flag bump rules

`nfr_engine_contract_version` lives on the envelope. Bumping rules:

| Change | Bump? | Why |
|---|---|---|
| Wave E swaps LLM agent → engine interpreter, same nfr/constant row shape | NO | Implementation-only change; envelope identical. |
| Wave E adds a new field to `nfrs[].i` row that Wave A doesn't read | NO | Backwards-compatible additive. Wave A ignores. |
| Wave E renames a field on `nfrs[].i` row | YES → 'v2' | Breaking shape change. Wave A re-edit required. |
| Wave E changes `failure-path` envelope shape (e.g. drops `math_trace`) | YES → 'v2' | Breaking shape change. |
| Wave E adds a third success status (e.g. `'partial'`) | YES → 'v2' | Discriminated-union widens. Wave A handlers must learn new branch. |

**Rule of thumb:** If Wave A's code (consumers of these envelopes) compiles and tests pass with Wave E's new emission, no bump. If Wave A's TypeScript breaks or tests fail, bump.

---

## 6. Test fixtures (failure-path)

Wave A's test suite MUST include three fixtures that Wave E re-runs verbatim. All live under `apps/product-helper/__tests__/langchain/graphs/fixtures/contract-pin/`:

| Fixture | Path | Asserts |
|---|---|---|
| `generate-nfr-success.json` | `__tests__/langchain/graphs/fixtures/contract-pin/generate-nfr-success.json` | Happy-path success envelope parses against `generateNfrEnvelope`. |
| `generate-constants-success.json` | `__tests__/langchain/graphs/fixtures/contract-pin/generate-constants-success.json` | Happy-path success envelope parses against `generateConstantsEnvelope`. |
| `generate-nfr-needs-user-input.json` | `__tests__/langchain/graphs/fixtures/contract-pin/generate-nfr-needs-user-input.json` | Failure envelope routes to `emitOpenQuestion` (not thrown). |

**Implementation independence proof:** Wave A's `__tests__/langchain/graphs/intake-graph.test.ts` runs these fixtures with the LLM-only producer behind `GENERATE_nfr`. Wave E re-runs the same test file with `nfrEngineInterpreter.evaluate(...)` behind `GENERATE_nfr`. Both pass without modifying the fixture files. **Test fixtures are pinned to the Zod shape, NOT the implementation path.**

---

## 7. v2.2 Wave E spawn-prompt requirements

When v2.2 authors `team-spawn-prompts-v2.2.md` Wave E, the `nfr-engine` and `constants-engine` agents MUST:

1. **Import** `NFR_ENGINE_CONTRACT_VERSION`, `generateNfrEnvelope`, `generateConstantsEnvelope`, `needsUserInputEnvelope` from `lib/langchain/graphs/contracts/nfr-engine-contract-v1.ts`.
2. **Re-run** Wave A's `__tests__/langchain/graphs/intake-graph.test.ts` with their engine implementation. Test must pass without fixture edits.
3. **NOT redefine** `nfrSchema` / `constantSchema`. Import from `submodule-2-3-nfrs-constants.ts`.
4. **NOT introduce** a new failure shape. Use `needsUserInputEnvelope` verbatim. If a new failure shape is genuinely needed, bump to `'v2'` per §5.
5. **Route** failure-path through `emitOpenQuestion` from `lib/chat/system-question-bridge.ts`. Do NOT throw on `needs_user_input`.

If any of these constraints are violated, the spawn-prompt is non-compliant with the v2.1 ↔ v2.2 contract.

---

## 8. Cross-references

- Master plan section: `plans/c1v-MIT-Crawley-Cornell.v2.1.md` §"Contract pin (Wave A ↔ Wave E handshake)"
- Wave E deferral note: same file §"Wave E — Engine-first generation pipeline + KB rewrite to schema-first" (status: deferred to v2.2).
- TA1 spawn-prompt: `.claude/plans/team-spawn-prompts-v2.1.md` §TA1 → `langgraph-wirer` agent.
- v2.2 stub: `plans/c1v-MIT-Crawley-Cornell.v2.2.md` (Wave E carryover).
