# Pipeline B — Conversational Drive

_Status: **SKELETON**. Phase N+1 component, sibling to `plans/pipeline-b-dual-trigger.md`. Implementation details deferred until Phase N lands — the context-builder it defines affects what copy makes sense here._

_Plan-before-action contract: review of **intent + blast radius** only. Do not execute._

---

## Goal

Edit the intake agent's conversational prompt so it actively drives users toward completing Steps 3-6 (FFBD / Decision Matrix / QFD / Interfaces) before Pipeline B second-fires. Today the prompt stops at Steps 1-2 completeness and hands off to artifact generation; users who never engage Steps 3-6 never benefit from the regenerated Pipeline B outputs the dual-trigger plan enables.

Without this, Phase N+1's second-fire exists structurally but never has Steps 3-6 context to fire against for most users — the behavior change ships without the user behavior to trigger it.

## Scope

**In-scope**
- Exact conversational prompt edits in the intake agent — locating which file / function / line owns the "what's next?" copy at end-of-Pipeline-A-Steps-1-2.
- Before/after prompt strings: call out the remaining methodology phases and invite the user to continue, without pressure.
- Dynamic suffix computation: the copy needs to name what's left (e.g. "N more methodology phases"). Count must be derived from the artifact registry, not hardcoded (critique issue 12 at `pipeline-b-steps36-integration.critique.md:211-217` — the "2 more phases" example is a magic number).
- Fallback copy for users who opt out / say "that's enough" — still honor existing STOP triggers from `prompts.ts`.

**Out-of-scope**
- Extraction prompt (`prompts.ts` extractionPrompt — Phase H territory, a191bf0).
- UI changes (modals, progress bars, "continue methodology" buttons). Those belong in a UI-side skeleton if/when they're decided.
- Any change to Pipeline A's graph topology, node execution, or artifact ordering.
- Dual-trigger mechanics — sibling plan.

## Deliverables

1. Identify the authoritative prompt file/function/line for the "Steps 1-2 complete, next step" conversational moment. Candidates include the intake-agent prompts in `apps/product-helper/lib/langchain/agents/intake/` and the chat handler's legacy prompt builder (`langgraph-handler.ts` / `route.ts` legacy branch). First commit = audit, not edit.
2. Before/after diff of the prompt string(s), reviewed in isolation before any behavior wiring.
3. A registry-derived "phases remaining" computation — exposed via a helper, not inlined magic numbers.
4. STOP-trigger preservation check: existing "nope / done / move on" short-circuits must still fire.
5. Unit test on the phases-remaining helper (edge cases: all done, none done, partial).
6. Conversation snapshot test exercising the new prompt through a completed Steps 1-2 handoff.

## Dependencies

- **Blocks on Phase N** — Phase N's projections reveal which Steps 3-6 fields are user-relevant vs internal; that informs which fields the prompt should name when inviting continuation.
- **Blocks on (or ships with) the dual-trigger plan** — no point driving users toward Steps 3-6 if second-fire regen isn't wired to consume them.
- **Coordinates with Peer-H's NFR prompt work** (`a191bf0`) — the conversational prompt lives adjacent to the extractionPrompt in tone. Copy cadence should stay consistent; no collision on files.
- **Does not depend on** any schema or DB change. Prompt-string edits + one helper.

## Open Questions (deferred to post-Phase-N review)

1. **Which prompt file owns the handoff copy** — the audit (deliverable #1) answers this. The intake agent may have split prompts across several files or it may be a single `prompts.ts` section. Phase N's work may move or rename the relevant anchor.
2. **Registry shape for phases-remaining count** — does the artifact registry already expose a "pending vs complete" partition, or does this need a new helper? Check after Phase N, since Phase N may add/rename artifact IDs in the registry.
3. **Tone / intensity** — invitation ("Want to continue?") vs nudge ("Two more phases unlock X, Y, Z") vs neutral disclosure ("N phases remain; continue or stop"). Parking this until Phase N's output samples show whether the downstream value is concretely nameable.
4. **Interaction with the dual-trigger flag** — if second-fire is feature-flagged off, should this prompt also shut off, or should it still educate users even when regen is disabled? Resolve when the flag lifecycle is set in the sibling plan.

## Non-Goals

- Not a UI redesign. Pure prompt/copy change with one helper.
- Not a change to STOP-trigger detection.
- Not a lobby for Steps 3-6 — if the user declines, the system still ships Steps 1-2 artifacts exactly as today.
