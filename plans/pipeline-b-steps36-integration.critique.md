# Pipeline Coherence Phase — Critique

> Keywords: pipeline B, Steps 3-6, generator rewire, dual-trigger, conversational drive, FFBD, QFD, decision matrix, interfaces, Zod, context builder
> Iteration: 1

## Summary

- The sub-plan (`plans/pipeline-b-steps36-integration.md`) is solid and well-grounded: field references are accurate to `schemas.ts` lines 636-781, the ranking is principled, and the graceful-degradation story is real (all Steps 3-6 fields are `.optional()`).
- The bundle-level proposal is not yet safe to ship as one phase. Workstream 1 (rewire) is additive; workstreams 2 (dual-trigger) and 3 (conversational drive) are behavioral and change what every project sees going forward.
- Two recommendations dominate: (a) split into two phases (rewire-first, behavior-second), (b) derive the new Context-type fields from Zod inferred types instead of hand-duplicating shapes.
- Only workstream 1 has a detailed written plan. WS2 and WS3 are sketched in prose.
- Peer-A's in-flight graph fan-out commits touch the same handler territory the rewire needs. Coordinate the merge window before dispatching.

---

## Table of Contents — Issues Found

1. Executive Summary — Single-phase bundle has mixed risk profiles
2. Executive Summary — Missing plans for WS2 and WS3
3. Handler-Side Delta — Builder is the real risk surface, sketched in prose
4. Handler-Side Delta — Context types shadow Zod schemas (drift risk)
5. Tech Stack Agent / User Stories / Schema / API Spec / Infra — No snapshot test on the new code path
6. Coding Guidelines Agent — Second-fire regen asymmetry ("5 of 6" vs "6 of 6")
7. Implementation Note — Pipeline A exit detection mechanism unspecified
8. Implementation Note — User-edit clobber on second fire
9. [New] Dual-trigger state flag should be derived, not persisted
10. [New] "Conversational drive" under-specified — file, string, magic number 6
11. [New] Coordination hazard with Peer-A's in-flight graph commits

---

## Executive Summary — Single-phase bundle has mixed risk profiles

Description:
The bundle packages three workstreams with different risk profiles into one phase:
- **WS1 (rewire, ~288-318 LOC):** additive. New Context fields are optional; prompts degrade gracefully. Blast radius: bounded per-generator.
- **WS2 (dual-trigger):** behavioral. Changes *when* generators fire for every project. Blast radius: every Pipeline B run going forward.
- **WS3 (conversational drive):** cosmetic. One prompt edit. Blast radius: user-facing copy only.

A single-phase ship means a 5+ commit cross-file revert if anything regresses, and it couples WS1 quality verification to WS2 behavioral verification. They are easy to separate.

Suggested Solution:
Split into two phases:
1. **Phase N: Rewire** — WS1 + handler ctx builder + tests. Ships additive behavior behind no flag because everything gracefully no-ops when `extractedData.{ffbd,decisionMatrix,qfd,interfaces}` is undefined. Easy to review, easy to revert per-agent.
2. **Phase N+1: Trigger + Drive** — WS2 + WS3. Reviewed as a behavior change. Can be gated by a feature flag if desired.

Shipping WS1 alone also gives you telemetry: projects that have Steps 3-6 data will start seeing improved generator outputs even before WS2 lands, and you can compare before/after quality without the trigger change as a confound.

---

## Executive Summary — Missing plans for WS2 and WS3

Description:
The bundle message says "Full writeup at `plans/pipeline-b-steps36-integration.md`" but that file only covers WS1 (the rewire). WS2 (dual-trigger + state-flag + overwrite semantics) and WS3 (conversational drive — which prompt, which string) have no plan file. Lines 1-56 of the writeup describe only the rewire payoff table and verdict, not the triggering or drive mechanics.

Suggested Solution:
If you're keeping the bundle shape, write:
- `plans/pipeline-b-dual-trigger.md` — exit-detection mechanism, overwrite vs merge policy, state flag vs derived check (see issue 9 below), user-edit protection.
- `plans/pipeline-b-conversational-drive.md` — specific file/function/line, before/after string, how to compute the "N more phases" suffix.

If you're splitting (recommended), WS1 can ship against the existing writeup; WS2 and WS3 each get their own plan.

---

## Handler-Side Delta — Builder is the real risk surface, sketched in prose

Description:
`plan.md` lines 493-516 allocate ~60-90 LOC for the handler ctx-builder but describe it as five bullet points, not code. This is the shared transform feeding all five rewired prompts. A bug in one projection (e.g., forgetting to concat `ffbd.decomposedBlocks` with `ffbd.topLevelBlocks` for `functionalBlocks`) cascades silently into the User Stories and Schema prompts with no single clear failure point.

Suggested Solution:
Treat the handler builder as the first deliverable under WS1. Commit it with unit tests before any generator rewire:
- One test per projection (FFBD→`functionalBlocks`, QFD→`engineeringTargets`, decisionMatrix→`decisionCriteria`+`decisionRecommendation`, interfaces→`interfaceMatrix`+`subsystems`+`interfaceProtocols`).
- One test for the undefined path (Steps 3-6 absent → all projections undefined).
- One test that exercises the full `extractionSchema.parse()` output (use extraction fixture data already in the test suite).

Once the builder is green, each generator rewire becomes a small, reviewable change.

---

## Handler-Side Delta — Context types shadow Zod schemas (drift risk)

Description:
The new Context type fields in §1.3, §2.3, §3.3, §4.3, §5.3 (lines 93-119, 168-184, 230-252, 310-331, 388-415) all hand-redeclare shapes that already exist in `schemas.ts`. Examples:
- Plan's `decisionCriteria` (line 103-109) duplicates `PerformanceCriterion` (`schemas.ts` 671-679).
- Plan's `engineeringTargets` (line 111-118, repeated at 398-405) duplicates `EngineeringChar` (`schemas.ts` 708-716).
- Plan's `functionalBlocks` (176-183) subsets `FfbdBlock` (`schemas.ts` 641-650).
- Plan's `interfaceMatrix` (319-328) duplicates fields from `InterfaceSpec` (`schemas.ts` 764-773).
- Plan's `subsystems` (329, 407) duplicates `Subsystem` minus `allocatedFunctions` (`schemas.ts` 754-759).

When `schemas.ts` evolves (field renamed, enum added), the agent Context types silently drift. This is the exact class of bug the just-landed Zod→JSON drift report (commit `3287586`) flags as #1 systemic risk.

Suggested Solution:
Derive Context projections from `z.infer<>` of the existing schemas. Add a small re-export layer:

```ts
// lib/langchain/schemas/projections.ts (new file)
import type { z } from 'zod';
import type {
  performanceCriterionSchema,
  engineeringCharSchema,
  ffbdBlockSchema,
  interfaceSpecSchema,
  subsystemSchema,
} from '../schemas';

export type DecisionCriterionProjection = Pick<
  z.infer<typeof performanceCriterionSchema>,
  'name' | 'unit' | 'weight' | 'minAcceptable' | 'targetValue'
>;
export type EngineeringTargetProjection = Pick<
  z.infer<typeof engineeringCharSchema>,
  'name' | 'unit' | 'directionOfImprovement' | 'designTarget' | 'technicalDifficulty' | 'estimatedCost'
>;
// ...etc
```

Then each agent Context imports from `projections.ts`. Zero runtime cost, compile-time drift protection. This also composes with the `zodToStrictJsonSchema` utility to keep the same authority-of-Zod principle across the code path.

---

## All Agent Chapters — No snapshot test on the new code path

Description:
Implementation Note §2 (line 717-719) requires each generator to pass existing tests with `undefined` for all new fields. This protects the old path. Nothing in the plan specifies a test for the new path — where Steps 3-6 fields are populated and should change the prompt.

Without this, a prompt bug that only activates when Steps 3-6 is present ships silently until a real project exercises it.

Suggested Solution:
For each HIGH-payoff agent (API Spec, Infrastructure, Tech Stack), add a snapshot test:
- Feed a synthetic Steps 3-6 payload (one `InterfaceSpec`, one `EngineeringChar`, one `PerformanceCriterion`).
- Capture the built prompt string (or the agent's structured output on a cheap fixture).
- Commit the snapshot. Future prompt edits must justify the diff.

MEDIUM-payoff agents (User Stories, Schema) can share a single fixture across both tests since they consume overlapping fields.

---

## Coding Guidelines Agent — Second-fire regen asymmetry

Description:
WS2 says "re-runs 5 of 6 generators with Steps 3-6 context, overwrites". First fire generates 6 (incl. guidelines); second fire regenerates 5. The user sees:
- Tech Stack: v2 (Steps 3-6 aware)
- Infra: v2 (Steps 3-6 aware)
- Guidelines: v1 (Steps 3-6 unaware, from first fire)

Skipping the *rewire* of guidelines is fine (plan §6 makes that case cleanly). Skipping the *regen* on the second fire is a different call — it introduces an internal-consistency gap. If a later reader compares Tech Stack's rationale against Guidelines' strictness recommendation, they'll see references to different context.

Suggested Solution:
Regenerate all 6 on the second fire even though Guidelines sees no new input. Cost: one extra LLM call per second-fire project. Upside: internally consistent artifact set. If cost is a concern, make the Guidelines regen conditional on "Guidelines output mentions scalability/latency/etc." — i.e., regen only if the first-fire output referenced domain concerns the new data would update.

---

## Implementation Note — Pipeline A exit detection mechanism unspecified

Description:
WS2 says "second fire after Pipeline A exits". The exit event is not a primitive in LangGraph state today — the graph writes `extractedData.interfaces` at the last Steps 3-6 node, but there is no typed "Pipeline A complete" signal. Peer-A's recent commits (`518da0e`, `e7fdd02`) rewire FFBD fan-out; this complicates reading "has Pipeline A exited?" from state without a proper sentinel.

Suggested Solution:
Pick one and document it:
- **Option A (derived):** Check `extractedData.ffbd && extractedData.decisionMatrix && extractedData.qfd && extractedData.interfaces` in the request handler before each Pipeline B run. If all four are present and `backendRegeneratedWithSteps36` (or the derived equivalent — see issue 9) is false, trigger second fire.
- **Option B (event):** Add an explicit `pipelineAComplete: boolean` channel to the graph state. Set it in a terminal node. Pipeline B reads it.
- **Option C (hash):** Persist a hash of Steps 3-6 content. Pipeline B runs a second fire whenever the hash changes from what it last regenerated against. This naturally handles re-runs of Pipeline A.

A is simplest but loses information if Steps 3-6 is partial by design. C is cleanest but requires a hash column.

---

## Implementation Note — User-edit clobber on second fire

Description:
The "overwrites" semantics for second-fire regen has a silent failure mode: if a user edits their tech stack or guidelines in the UI between fires, the second fire wipes the edit.

There's no `isUserEdited` flag on project artifacts today (grep `generatedArtifacts` in `lib/langchain` shows only provenance tracking, not edit-source tracking).

Suggested Solution:
Pick a policy and make it visible:
1. **Clobber** (simplest): document it in the second-fire flow and the UI. Add a confirmation modal if the UI detects unsaved user edits in a generator output.
2. **Merge** (medium): regen into a draft, let the user compare and accept.
3. **Skip-if-touched** (conservative): needs an `isUserEdited` or `source: 'ai' | 'user'` flag per artifact. Track modifications.

Today's `runQuickStartPipeline.persistResults` (orchestrator.ts 612-790) does an unconditional upsert with no edit protection. The Pipeline B path likely has the same shape. Chose option 1 or 3 deliberately; don't leave it implicit.

---

## [New] Dual-trigger state flag should be derived, not persisted

Description:
WS2 proposes `backendRegeneratedWithSteps36` as a new persisted flag replacing the `!existing?.techStack` guard. Persisted one-shot flags are a classic source of stuck projects: if the flag is set while Steps 3-6 data is partial (e.g., Pipeline A crashed mid-run and only FFBD+decisionMatrix persisted), the regen never fires again and the artifacts are permanently stale.

Suggested Solution:
Make the gate a function of current data, not a flag:

```ts
function needsSteps36Regen(extractedData, currentArtifacts) {
  const haveSteps36 = !!(
    extractedData.ffbd && extractedData.decisionMatrix &&
    extractedData.qfd && extractedData.interfaces
  );
  if (!haveSteps36) return false;

  const steps36Hash = hashSteps36(extractedData);  // deterministic
  const lastRegenHash = currentArtifacts.metadata?.steps36Hash;
  return steps36Hash !== lastRegenHash;
}
```

Persist `steps36Hash` on the artifact bundle (cheap — it's already JSONB). When Pipeline A re-runs with new data, the hash changes and regen fires automatically. No stuck-project class of bug.

---

## [New] "Conversational drive" under-specified

Description:
WS3 says "one prompt edit in the KB step mapping" surfaces remaining phases as "2 more phases before we unlock system design". Problems:
- Which file/function? `kb-question-generator.ts`? `generate-response.ts`? `compute-next-question.ts`? The KB layer has multiple prompt surfaces.
- The literal "2 more phases" is a magic number. If Pipeline B's artifact list grows or shrinks, the copy goes stale.
- It's tied to `generatedArtifacts.length < 6` — another magic number derived from the current Pipeline B artifact count.

Suggested Solution:
Name the exact file and string before shipping. Compute the suffix from actual state:

```ts
const remaining = expectedArtifactTypes.length - generatedArtifacts.length;
const phaseSuffix = remaining > 0
  ? ` (${remaining} more ${remaining === 1 ? 'phase' : 'phases'} before system design unlocks)`
  : '';
```

Where `expectedArtifactTypes` is a named constant — not the inline literal `6`. This keeps the copy honest when the pipeline changes.

---

## [New] Coordination hazard with Peer-A's in-flight graph commits

Description:
Recent main: `518da0e fix(graph): rewire FFBD fan-out`, `e7fdd02 fix(edges): fan-out routeAfterFFBD`, `e718ae3 fix(nodes): early-return on state.error`, `b369743 fix(chat): shallow-merge extractedData`. These are Peer-A's Phase A 504 fixes. They touch `lib/langchain/graphs/edges.ts`, `nodes/generate-*.ts`, and the chat loop's `extractedData` merge semantics.

WS1's handler ctx-builder lives in `langgraph-handler.ts` (plan line 493) and reads `extractedData`. If Peer-A is still iterating on the fan-out or merge logic, the ctx-builder can be built against a moving target.

Suggested Solution:
Before dispatching to a peer:
1. Confirm with Peer-A (drcajo6f) that the Phase A fan-out is stable.
2. Pin the ctx-builder to a specific `extractedData` shape after Phase A settles.
3. Merge-window coordinate: ship Phase A → pause for a few hours → ship WS1.

This also informs decision point #3 (your Q): **socialize first**, at least with Peer-A, before sending to Bond as a formal proposal.

---

## Direct Answers to Your 3 Decision Points

1. **Ship bundle as one phase, or split?**
   Split. Phase N = WS1 (rewire + handler builder + tests). Phase N+1 = WS2 + WS3. WS1 is additive and independently verifiable; WS2+WS3 are behavioral and want their own review.

2. **Is "Guidelines skip" OK, or rewire all 6?**
   The skip is correct for the *rewire* (plan §6.2 makes the case — stylistic rules shouldn't fit numeric targets). On the *second fire*, regen all 6 anyway for internal consistency across the artifact set. Guidelines doesn't see new context but stays in sync with the rest of the pipeline's version.

3. **Send to Bond as proposal, or socialize first?**
   Socialize first. Peer-A's graph fan-out commits are adjacent to the handler territory WS1 touches. A short sync with Peer-A (and probably Peer-H, since Phase H touches `prompts.ts` which the rewire doesn't modify but shares a prompt-building convention) avoids merge conflicts and prevents WS1 from being built against a not-yet-settled `extractedData` shape.

---

## Non-Issues (confirmed)

- Field references in plan.md Appendix are accurate to `schemas.ts` lines 636-781.
- `.optional()` claim at plan line 541 is correct (verified at `extractionSchema` lines 805-808 in the plan's own appendix, which matches `schemas.ts`).
- The ranked-payoff table (plan 21-48) is principled and defensible — API Spec and Infrastructure are genuinely the biggest quality lifts.
- The persistence / restart-wipe hypothesis dismissals (bundle message §4) are evidence-grounded and correct to drop.
