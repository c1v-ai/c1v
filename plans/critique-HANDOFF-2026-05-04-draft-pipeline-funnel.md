# Handoff — Draft Pipeline Funnel
> Keywords: draft-pipeline, funnel, m4-draft, intake-agents, quick-start, kind-discriminator, viewer-migration, nfr-gate, draftArchitecture, extractedData
Iteration: 1

## Summary

Strong strategic framing — "the chaos resolves into a pricing surface" is correct and the 3-tier funnel is the right product bet. The sequencing (Phase 0 standalone P0s → validation replay → funnel build) is sound. However, 4 critical implementation errors will block the plan mid-execution and require rework: (1) `getLatestSynthesis` returns the wrong artifact kind and wrong shape for what the §6.2 viewer fallback needs; (2) the viewers do NOT read `project_artifacts` today — they still read raw `extractedData`, making §6.2's premise false; (3) `draftArchitecture` namespace requires type-system changes the plan doesn't scope; (4) `decision-network-v1.ts` referenced in Task 1 doesn't exist. Fix these before Phase 2 kicks off or Task 2/3/4 will collide mid-implementation.

---

## Issues Found (Table of Contents)

| # | Severity | Location | Issue |
|---|---|---|---|
| C1 | 🔴 CRITICAL | §6.2 + Task 4 | `getLatestSynthesis` returns `recommendation_json` kind only, not M4 data. §6.2 sketch's `refined?.decisionNetwork` is wrong. |
| C2 | 🔴 CRITICAL | §6.2 + Task 4 | Viewers still read `extractedData` directly — NOT `project_artifacts`. Wave-A migration NOT complete. |
| C3 | 🔴 CRITICAL | Task 2 | `draftArchitecture` namespace requires `IntakeState` type + `extractionSchema` Zod + `IntakeStateAnnotation` updates — not scoped. |
| C4 | 🔴 CRITICAL | Task 1 | `module-4/decision-network-v1.ts` does not exist — file reference is wrong. |
| I1 | 🟡 IMPORTANT | Task 3 | No conditional edge exists to fire `generate-m4-draft` after "M2.1 confirms ≥1 actor" — new routing logic needed in `edges.ts`. |
| I2 | 🟡 IMPORTANT | Task 0 | `emitNfrContractEnvelope` is called from TWO sites (lines 98 + 156). Plan sketch only gates the body — needs guard at both callsites. |
| I3 | 🟡 IMPORTANT | Task 4 | Viewer DATA-FETCH (page.tsx) also reads `extractedData` — not just the viewer component. Task 4 scope is understated. |
| M1 | 🔵 MISSING | Task 2 | No decision on data migration for existing `extractedData.{ffbd,qfd,...}` rows (§6.1 deferred, blocks Task 2). |
| M2 | 🔵 MISSING | Task 3 | Draft M4 `inputs_hash` key scheme not locked — vision-only hash will produce cache collision if vision is reused across projects. |
| M3 | 🔵 MISSING | §7 Q5 | Draft `draftArchitecture` data expiration decision deferred — affects storage cost and analytics design. |

---

## §6.2 — Viewer Fallback Pattern (C1 + C2)

**C1 — `getLatestSynthesis` returns wrong artifact kind**

Description:
Plan §6.2 lines 429-444 sketches `getLatestSynthesis(projectId)` returning a row from which `refined?.decisionNetwork` is read. But `getLatestSynthesis` (lib/db/queries.ts:253-268) queries **only** `artifact_kind = 'recommendation_json'`. That kind doesn't contain `decisionNetwork` — it contains the synthesis keystone (architecture_recommendation.v1.json). The refined M4 data lives in a separate artifact kind (`decision_network_v1` per generate-decision-network.ts naming). The sketch's `refined?.decisionNetwork` will always be `undefined`.

Suggested Solution:
Replace `getLatestSynthesis` with `getArtifactByKind(projectId, 'decision_network_v1')` for the M4 viewer fallback. Then read `refined?.content?.decisionNetwork` (raw jsonb content column), not `refined?.decisionNetwork`. Same pattern for FFBD (`ffbd_v1` kind) and QFD (`hoq_v1`).

```ts
async function loadM4Artifact(projectId: number) {
  // Try refined first — use per-kind query, not recommendation_json
  const refined = await getArtifactByKind(projectId, 'decision_network_v1');
  if (refined?.content) {
    return { kind: 'refined' as const, data: refined.content };
  }
  // Fall back to draft in extractedData.draftArchitecture
  const project = await db.query.projectData.findFirst({ where: eq(projectData.projectId, projectId) });
  const draft = (project?.intakeState as any)?.extractedData?.draftArchitecture?.m4;
  if (draft) return { kind: 'draft' as const, data: draft };
  return null;
}
```

---

**C2 — Viewers still read `extractedData` directly (Wave-A migration NOT complete)**

Description:
Plan §6.2 states "The 4 frozen `/system-design/*` viewers were migrated in Wave A to read from `getLatestSynthesis(projectId)`." This is **false** — verified against live code:

- `app/(dashboard)/projects/[id]/system-design/ffbd/page.tsx:19` — `const ffbd = (project as any).projectData?.intakeState?.extractedData?.ffbd`
- `app/(dashboard)/projects/[id]/system-design/decision-matrix/page.tsx:52-53` — `const decisionMatrix = ... extractedData?.decisionMatrix`

Both pages read raw `extractedData` with `any` casts. Neither calls `getLatestSynthesis`. The viewer migration is **not done** — it's the work Task 4 needs to do, not a precondition already met.

Consequence: the draft fallback pattern in §6.2 cannot work until Task 4 also migrates the page.tsx data-fetching logic (not just the viewer component badge state). Task 4 scope is larger than described.

Suggested Solution:
Update the plan — Task 4 must migrate BOTH the page.tsx data-fetch (replace `extractedData.*` with the kind-based fallback) AND the viewer component (badge + banner state). Explicitly list the page.tsx files as Task 4 targets:
- `app/(dashboard)/projects/[id]/system-design/ffbd/page.tsx`
- `app/(dashboard)/projects/[id]/system-design/decision-matrix/page.tsx`
- `app/(dashboard)/projects/[id]/system-design/qfd/page.tsx`
- `app/(dashboard)/projects/[id]/system-design/interfaces/page.tsx`

These are ALSO frozen per CLAUDE.md — confirm unfreeze covers page.tsx files, not just the viewer tsx components.

---

## Task 1 — Add `kind` Discriminator (C4)

**C4 — `module-4/decision-network-v1.ts` does not exist**

Description:
Task 1 (plan line 234) directs adding `kind` to `apps/product-helper/lib/langchain/schemas/module-4/decision-network-v1.ts`. This file does not exist. Module-4 schemas are split across 19 phase files (phase-1-dm-envelope.ts through phase-19-empirical-prior-binding.ts) plus submodule files, with an index.ts barrel. There is no `decision-network-v1.ts` root schema.

Suggested Solution:
Add `kind` to `module-4/index.ts` top-level schema export (or create a new `module-4/decision-network-root.ts` that wraps the phases object). The existing `decision-net-agent.ts` validates phases individually (lines 211-216 show phase-14, phase-15, phase-16, phase-17b, phase-19, phases-11-13 parsed separately). Add a root wrapper schema:

```ts
// module-4/index.ts (new export)
export const decisionNetworkRootSchema = z.object({
  kind: z.enum(['draft', 'refined']).default('refined'),
  phases: z.object({
    phase_14_decision_nodes: phase14Schema,
    phase_16_pareto_frontier: phase16Schema,
    // ... rest of phases
  }),
});
```

Same pattern for module-3 (ffbd), module-6-hoq (hoq), module-7-interfaces.

---

## Task 2 — Repurpose Intake-Side Agents as Draft Producers (C3)

**C3 — `draftArchitecture` namespace requires type-system changes not scoped**

Description:
Task 2 (plan lines 256-258) says "write to `state.extractedData.draftArchitecture.{ffbd,qfd,decisionMatrix,interfaces}`." But `extractedData` is typed as `ExtractionResult` (lib/langchain/schemas.ts:792-811), which has no `draftArchitecture` field. Writing to it requires:
1. Adding `draftArchitecture` to `extractionSchema` Zod in `lib/langchain/schemas.ts`
2. Updating the `ExtractionResult` TypeScript type (auto-inferred from Zod — changes with schema)
3. Updating `IntakeStateAnnotation` in `intake-graph.ts` (the reducer for `extractedData`)
4. Updating `createDefaultExtractionResult()` in `lib/langchain/graphs/channels.ts`
5. Updating test fixtures that mock `extractedData`

None of these are mentioned in Task 2. Without them, `tsc --noEmit` will fail when agents try to assign to `state.extractedData.draftArchitecture.*`.

Suggested Solution:
Add a pre-task before Task 2: "Extend `extractionSchema` with `draftArchitecture` optional field."

```ts
// lib/langchain/schemas.ts — add to extractionSchema
draftArchitecture: z.object({
  ffbd: ffbdSchema.optional(),
  qfd: qfdSchema.optional(),
  decisionMatrix: decisionMatrixSchema.optional(),
  interfaces: interfacesSchema.optional(),
  m4: z.unknown().optional(), // DraftM4Output — typed fully in Task 3
}).optional(),
```

This is a new optional field, so existing data deserializes without migration. Run `pnpm type-check` after adding to catch all downstream breakage before Task 2 agent changes.

---

## Task 3 — `generate-m4-draft.ts` Node (I1 + M2)

**I1 — No conditional edge for "fire after M2.1 confirms ≥1 actor"**

Description:
Task 3 (plan line 312) says "Wire into `intake-graph.ts` to fire in parallel with M2.2/M2.3 after M2.1 confirms ≥1 actor." But `intake-graph.ts` has no existing edge or conditional route that checks actor count. Current routing after `analyze_response` goes to `['extract_data', 'check_prd_spec', 'compute_next_question']` (conditional edges on `routeAfterAnalysis`). There is no mechanism to fire a node only when `state.extractedData.actors.length >= 1`. This requires new routing logic in `edges.ts`.

Suggested Solution:
Add a new routing function `routeAfterExtraction_withDraftFanout` (or extend `routeAfterExtraction`) in `lib/langchain/graphs/edges.ts` that checks actor count and includes `'generate_m4_draft'` as a possible target when `actors.length >= 1`:

```ts
// edges.ts — new route target
export function routeAfterExtractionWithDraft(state: IntakeState): string[] {
  const targets: string[] = ['check_prd_spec'];
  if ((state.extractedData?.actors?.length ?? 0) >= 1 && !state.extractedData?.draftArchitecture?.m4) {
    targets.push('generate_m4_draft'); // fan-out in parallel
  }
  return targets;
}
```

Note: LangGraph's `addConditionalEdges` supports multi-target fan-out when the routing function returns an array. Verify this with the installed LangGraph version before committing to the pattern.

---

**M2 — Draft M4 `inputs_hash` collision risk**

Description:
Task 3 (plan line 321) says draft M4 should use `inputs_hash(vision + actors + projectType)` as cache key. If two projects have identical vision strings (e.g., "AI meal planner for weight loss"), they'll produce the same hash and the second project will serve the first project's cached draft M4. This is a cross-tenant data leak for the draft tier.

Suggested Solution:
Always include `projectId` in the inputs_hash for draft M4:
```ts
const draftHash = computeInputsHash({
  projectId: state.projectId, // tenant isolation
  vision: state.projectVision,
  actors: state.extractedData.actors.map(a => a.name),
  projectType: state.projectType ?? null,
});
```

---

## Task 0 — Phase-gate `emitNfrContractEnvelope` (I2)

**I2 — Function called from two sites; plan sketch only gates the body**

Description:
`emitNfrContractEnvelope` is called at two locations in `extract-data.ts`:
- Line 98: inside the `hasCompleteData` short-circuit branch
- Line 156: on the normal extraction path after `mergeExtractionData`

The plan's Task 0 sketch adds the phase gate inside the function body. This is correct but the `hasCompleteData` short-circuit at line 98 calls `emitNfrContractEnvelope(state, state.extractedData)` which would ALSO fire before the gate on projects where data is already complete. Both callsites will be gated by the function body fix — this is actually fine. But the test assertion specified in the plan (asserting neither `surfaceOpenQuestion` nor `persistArtifact` is called on `context-diagram` step) needs to cover BOTH code paths (hasCompleteData=true AND hasCompleteData=false) to be complete.

Suggested Solution:
Add two test cases to `extract-data-guards.test.ts`:
1. `currentKBStep='context-diagram'` + `hasCompleteData=false` (the extraction path) → no NFR question fires
2. `currentKBStep='context-diagram'` + `hasCompleteData=true` (the skip path) → no NFR question fires

The plan only mentions case 1 implicitly.

---

## Task 2 — Data Migration Decision (M1)

**M1 — §6.1 defers migration decision, but it blocks Task 2**

Description:
§6.1 (plan lines 414-418) identifies that renaming `extractedData.{ffbd,qfd,decisionMatrix,interfaces}` breaks existing rows but says "Accept that draft data is ephemeral and just clear the keys in old rows." This is a policy decision that BLOCKS Task 2's namespace migration — you can't rename the keys without deciding what happens to existing data first.

The risk: existing project rows with populated `extractedData.ffbd` (from L4-style traces) will be silently orphaned after the rename. If the FFBD viewer is mid-migration (Task 4 in progress), those projects will show an empty state instead of their existing data.

Suggested Solution:
Make the decision explicit in the plan before Task 2 ships:

**Option A (recommended):** Accept ephemeral — old `extractedData.{ffbd,qfd,...}` data is write-only with no readers post-rename. Clear via one-time migration: `UPDATE project_data SET intake_state = jsonb_strip_nulls(jsonb_set(intake_state, '{extractedData,ffbd}', 'null')) WHERE ...`. Low risk because the FFBD/DM viewers will be reading from `draftArchitecture.*` after Task 4.

**Option B:** Copy old keys into new namespace during rename. More work, preserves continuity for in-flight projects.

Lock this in the plan now. It only matters for the handful of projects with L4-trace-style fabricated data.

---

## No Issues Found in These Sections

- **§0 pivot paragraph** — framing is correct
- **§0.5 status table** — accurate against codebase
- **§1 locked decisions** — all 7 decisions are sound
- **§2 time math** — 37s calculation is correct given parallel fan-out at t=9
- **§3 architecture map** — diagram accurately reflects the design intent
- **§5 validation gate** — PASS/FAIL criteria are well-specified; do the replay first
- **§7 open questions** — Q1 (UI freeze), Q3 (gate at /synthesize), Q4 (Opus vs Sonnet) all correctly identified
- **§8 what stays the same** — accurate
- **§9 definition of done** — 7-point checklist is complete and verifiable
- **§11 sequencing** — Phase 0 → Phase 1 (validation) → Phase 2 is the right order

---

## Recommended Plan Amendments Before Phase 2

1. **§6.2**: Replace `getLatestSynthesis` with `getArtifactByKind(projectId, '<kind>')`. Fix `refined?.decisionNetwork` → `refined?.content`. (C1)
2. **Task 4**: Add page.tsx files to scope (not just viewer tsx). Confirm unfreeze covers them. (C2)
3. **Task 1**: Replace `module-4/decision-network-v1.ts` with correct file (`module-4/index.ts` root wrapper). (C4)
4. **Pre-Task 2**: Add "Extend `extractionSchema` + `IntakeState` + `IntakeStateAnnotation` with `draftArchitecture` field" as a mandatory pre-step. (C3)
5. **Task 3**: Add `routeAfterExtractionWithDraft` to `edges.ts` spec. Add `projectId` to draft `inputs_hash`. (I1, M2)
6. **Task 0**: Expand test coverage to cover both callsites (hasCompleteData=true AND false). (I2)
7. **§6.1**: Lock data migration decision (Option A recommended). (M1)
