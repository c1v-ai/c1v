# Bug Fix Plan — Context Diagram Question Re-asked After User Answer

## Issue Summary

Observed behavior from production screenshots:
- Assistant asks a Context Diagram question.
- User replies with usable signal (e.g., “The main users are entrepreneurs and team leads”).
- Assistant asks a near-duplicate Context Diagram question again instead of ingesting the answer and progressing.

This suggests a breakdown in one or more of:
1. answer ingestion/extraction,
2. state update persistence,
3. de-duplication/anti-repeat controls in question generation,
4. branch selection in the intake graph after extraction.

---

## Codebase Review Scope

Primary runtime path reviewed:
- `app/api/chat/projects/[projectId]/langgraph-handler.ts` (stream orchestration + state persistence)
- `lib/langchain/graphs/nodes/extract-data.ts` (conversation-to-structured extraction)
- `lib/langchain/graphs/nodes/compute-next-question.ts` (next-question synthesis)
- `lib/langchain/agents/intake/kb-question-generator.ts` (KB question strategy)
- `lib/langchain/graphs/edges.ts` and `lib/langchain/graphs/intake-graph.ts` (routing between ask/extract/generate)
- `lib/langchain/agents/intake/state-manager.ts` + `state.ts` (state evolution)
- `lib/chat/system-question-bridge.ts` (open-question transport and potential re-emission loop)

Test coverage reviewed:
- `__tests__/langchain/graphs/intake-graph.ta1-integration.test.ts`
- `lib/langchain/graphs/__tests__/intake-graph.test.ts`
- `lib/langchain/graphs/__tests__/analyze-response.test.ts`
- `__tests__/chat/system-question-bridge.test.ts`

---

## Probable Root Causes

### RC1) Open question re-emission is not idempotent in extract path
`extract-data.ts` calls `surfaceOpenQuestion(...)` when NFR/constants stubs are absent, and this can occur on each extraction pass. There is no visible dedupe key or active-pending check before inserting another `pending_answer` conversation row.

Impact:
- Repeated “I need more context” style prompts can appear even if user already gave related responses.
- User sees “same question again” behavior, especially around Context Diagram / upstream-context language.

### RC2) Question generator tracks broad topics but not semantic duplicates
`compute-next-question.ts` adds `askedQuestions` from `kbResult.gaps.map(g => g.target)`, but there is no strict “question fingerprint” guard to prevent semantically equivalent re-asks in adjacent turns.

Impact:
- Different wording of same intent (“main users?” vs “who interacts with product?”) can bypass simple topic tracking.

### RC3) Ingestion confidence and progression criteria likely too strict
If extraction returns low-confidence/partial data for actors/external systems, flow remains in Context Diagram phase and retries a similar prompt rather than explicitly acknowledging captured fields and asking only for missing delta.

Impact:
- Correct user answers not reflected in assistant response, leading to trust loss.

### RC4) Missing regression tests for “answer acknowledged then advance/no-repeat”
Current tests emphasize happy-path readiness and routing, but there is no explicit anti-repeat scenario asserting that after an actor answer, the next turn must not ask an equivalent actor question.

---

## Implementation Plan

## Phase 1 — Observability + Repro Harness (small, first)
1. Add structured logs/telemetry fields per turn:
   - extracted actors/useCases/systemBoundaries counts before/after merge,
   - reason code for asking next question (gap id + confidence),
   - duplicate check result (blocked/allowed).
2. Build deterministic fixture conversation mirroring screenshot sequence and run through intake graph unit/integration harness.
3. Confirm whether repeated question comes from:
   - `surfaceOpenQuestion` (system pending_answer path), or
   - regular intake `compute-next-question` path.

Exit criteria:
- One failing regression test that reproduces re-ask.
- Single identified origin path with evidence.

## Phase 2 — Idempotency for system open questions
1. In `surfaceOpenQuestion`, add dedupe guard by `(project_id, source, normalized-question, status=pending)` within a bounded time window (e.g., active pending only, optionally last 30 min).
2. If duplicate exists, return existing `conversation_id` instead of inserting a new row.
3. Add unit tests to verify:
   - duplicate call does not create second row,
   - resolved/answered entry can allow future new question.

Exit criteria:
- No duplicate pending system prompts for same unresolved question.

## Phase 3 — Anti-repeat policy for intake next-question generation
1. Add semantic fingerprinting utility for asked assistant questions:
   - normalize tokens, remove filler, map synonyms (users/actors, integrate/external systems),
   - store fingerprints in state (e.g., `askedQuestionFingerprints`).
2. Before returning a new `pendingQuestion`, run duplicate threshold check against last N assistant prompts.
3. On duplicate detection, enforce one of:
   - ask delta-only question (“Got it: entrepreneurs/team leads. Any external systems?”), or
   - advance phase if minimum data threshold reached.
4. Update KB generator prompt contract to include “acknowledge captured facts before next ask”.

Exit criteria:
- After user provides actors, next prompt cannot ask same actors question unless explicit clarification mode.

## Phase 4 — Ingestion acknowledgment and phase-progress guarantees
1. Tighten extraction-to-response handshake:
   - if new actor extracted this turn, assistant must include short acknowledgment snippet in response template.
2. In edge routing, prefer advancing to next missing field in phase over re-asking same field.
3. Add guardrail in completion/readiness logic:
   - when actor threshold met, disallow actor-targeted re-ask unless contradiction detected.

Exit criteria:
- Context Diagram step progresses deterministically with incremental data.

## Phase 5 — Regression test suite additions
Add tests covering:
1. `answer -> acknowledged -> different next question` flow.
2. `system open question` dedupe under repeated extraction calls.
3. “yes keep going” acknowledgment message after prior substantive answer does not reset back to previous question.
4. Mobile-like short replies and paraphrase variants.

Exit criteria:
- New tests fail before fix and pass after fix.

---

## Risk & Mitigations

- Risk: Over-aggressive dedupe suppresses legitimate clarification.
  - Mitigation: Allow repeat only with explicit clarification reason code.

- Risk: Semantic fingerprint false positives.
  - Mitigation: thresholded similarity + phase/target-aware matching, not global blocking.

- Risk: State schema change affects checkpoint compatibility.
  - Mitigation: optional field with safe defaults and migration handling in checkpointer.

---

## Rollout Strategy

1. Ship behind feature flags:
   - `INTAKE_QUESTION_DEDUPE_V1`
   - `SYSTEM_OPENQUESTION_IDEMPOTENCY_V1`
2. Enable in staging with replay fixtures + sampled production transcripts.
3. Track metrics for 48 hours:
   - repeat-question rate within 3 turns,
   - phase dwell time in `context_diagram`,
   - user correction messages (“already answered”, “you asked this”).
4. Ramp to 100% after no regression in completion rate.

---

## Acceptance Criteria

- Assistant does not ask semantically equivalent Context Diagram question after receiving a valid answer in prior turn.
- Pending system open questions are idempotent and not duplicated while unresolved.
- Conversation explicitly acknowledges newly ingested user facts before moving to next gap.
- New regression tests cover the incident pattern and pass in CI.
