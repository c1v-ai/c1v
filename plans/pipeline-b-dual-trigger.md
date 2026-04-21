# Pipeline B — Dual-Trigger (Second-Fire)

_Status: **SKELETON**. Phase N+1 component. Implementation details deliberately deferred until Phase N (pipeline-b-steps36-integration rewire) ships — the projections + tests that land there will reveal the actual exit-detection contract and state shape this plan ties to._

_Plan-before-action contract: this skeleton is for review of **intent + blast radius**, not implementation. Do not execute._

---

## Goal

Fire Pipeline B a second time, against Steps 3-6 context, without clobbering user edits and without firing redundantly. First fire runs today at end-of-intake against Steps 1-2 only; second fire runs after Pipeline A's Steps 3-6 blobs (`ffbd`, `decisionMatrix`, `qfd`, `interfaces`) have materialized and stabilized, so the six downstream generators (Tech Stack / Infrastructure / API Spec / User Stories / Schema / Guidelines) produce output grounded in the real system-design context.

Paired with Phase N (additive generator rewire). Phase N makes the generators *capable* of reading Steps 3-6 data; Phase N+1 makes them actually *fire again* when that data exists.

## Scope

**In-scope**
- Exit-detection mechanism: when is Pipeline A considered "done" for second-fire purposes.
- State contract: derived check vs persisted flag vs content hash. Decision deferred — see §Open Questions.
- Overwrite-vs-merge policy for the six regenerated artifacts.
- User-edit protection: second fire must not silently clobber edits the user made between fires.
- Second-fire idempotency: re-running Pipeline A (rare but possible) must not cause an infinite regen loop.
- Feature-flag gate for staged rollout (off in prod until the behavior is validated on canary projects).

**Out-of-scope**
- Changes to Pipeline A itself (Steps 3-6 generation ordering, fan-out topology, or schemas).
- Conversational prompting that drives users toward Steps 3-6 completion — that's the sibling plan (`pipeline-b-conversational-drive.md`).
- Any rewire of generator context shape — that's Phase N.
- Migrations; this phase adds no DB columns (if state is derived or hashed). If a persisted flag is chosen, one column added, additive only.

## Deliverables

1. Exit-detection logic in the chat handler (or graph terminal node, TBD) — gates the second fire on Pipeline A completeness.
2. Single code path through `triggerPostIntakeGeneration` for both fires (same call site, differentiated by a `secondFire: boolean` or derived equivalent).
3. User-edit protection: either (a) skip regen on any agent whose output the user has touched, (b) merge at a field level, or (c) confirmation modal. Decision deferred to sibling UI plan when it lands.
4. Feature flag + rollout doc.
5. Unit test on the exit-detection predicate (stable / flapping / re-run scenarios).
6. Integration test hitting the real handler twice — first fire writes, second fire regenerates, no duplicate rows, edit-protection honors policy.

## Dependencies

- **Blocks on Phase N** (`plans/pipeline-b-steps36-integration.md` WS1). Phase N's `projections.ts` defines the exact shape of the Steps 3-6 context second-fire is regenerating against. Ship Phase N, observe its snapshot tests, *then* finalize this plan's Open Questions.
- **Depends on** the `updateProjectDataFromState` persistence block in `app/api/chat/projects/[projectId]/langgraph-handler.ts` being the authoritative write path. Fix `15e15e5` confirmed that contract for `nonFunctionalRequirements`; if any new field from Steps 3-6 needs DB persistence for second-fire to see it, that lands here.
- **Coordinates with** Peer-A's graph-state work (Phase A commits `518da0e`, `e7fdd02`, `e718ae3`, `ebab1fe`, `b369743`). Do not design exit-detection against a pre-Phase-A extractedData shape.
- **Supersedes** no existing plan. Net-new behavior.

## Open Questions (deferred to post-Phase-N review)

1. **Exit-detection: derived vs persisted vs hash** — critique issue 9 (`pipeline-b-steps36-integration.critique.md:185-205`) and the three options at `:156-165`. Needs Phase N's observed extractedData shape to pick cleanly.
2. **User-edit clobber policy** — critique issue 7 (`:168-181`). Three options (document + modal / merge / delta-only regen). Needs Phase N's snapshot tests to reveal which agents have meaningfully user-editable outputs.
3. **Guidelines second-fire asymmetry** — critique issue 5 (`:138-149`). Regen-always vs regen-conditional. Needs Phase N's output samples to judge whether guidelines materially changes on Steps 3-6 data.
4. **Flag lifecycle** — rollout strategy (env var / per-team / per-project). Cheaper to decide after the first two questions settle.

## Non-Goals

- No changes to Pipeline A exit semantics.
- No generator prompt edits (those are Phase N's territory).
- No UI work — the user-edit modal, if that policy wins, gets its own skeleton when the decision lands.
