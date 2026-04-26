# c1v × MIT-Crawley-Cornell — v2.1 Amendment (Runtime Wiring + UI Surfacing + iter-3 API-Spec Fix)
> Keywords: runtime-wiring, synthesis-ui, langgraph, fmea, kb-runtime, cost-math, scope-cut, sidecar-vs-vercel-boundary, methodology-correction-path, claude-md-rewrite-target
Iteration: 2

## Summary

- Iter 1 addressed most factual defects, and the scope-cut to A + B + D (Waves C + E → v2.2) was the right move.
- However, several Group-A factual defects from iter 1 PROPAGATED into the spawn-prompts doc unchanged because the master plan still carries the same wrong-path and wrong-line-number claims.
- One new internal contradiction was introduced by the late D-V21.24 addition (sidecar render-only locked at decision level, but Wave-A "Files added" still describes Cloud Run hosting the full pipeline).
- Cost-ceiling math is contradictory across four sites in the doc — four different numbers for "Wave-B end state" and "v2.1 cost ceiling".
- Wave A timeline (5-7 days) carries from iter 1 — the file-add manifest didn't shrink with the scope-cut; only Waves C + E were excised, not Wave-A surface area.
- The agent ↔ graph-node mapping is internally inconsistent across three sites in the Wave-A section (Goal vs Files-edited vs synthesizer paragraph).
- New finding: R-V21.13 mitigation claim "CLAUDE.md path claims audited — no dead-path references found" contradicts P10 directly.

---

## Table of Contents (current issues)

1. **EC-V21-A.0(d) — METHODOLOGY-CORRECTION duplicate path claim is factually wrong** (line 291)
2. **Files-edited CLAUDE.md fix target is wrong** (line 280)
3. **Step D-4 — `api-spec-agent.ts:71` references wrong line** (line 388)
4. **Files-edited M2 NFR agent path handwaved despite known location** (line 272)
5. **Wave A "Goal" vs "Files-edited" agent count internally inconsistent** (lines 244, 272, 273, 274)
6. **Existing system-design agents under-enumerated** (lines 244, 272 — missing n2/data-flows/nfr-resynth/synthesis-agent)
7. **Decision Matrix vs Decision Network coexistence not pinned at graph-node level** (lines 155-156, 271, 274)
8. **D-V21.24 (sidecar render-only) contradicts Wave-A `services/python-sidecar/orchestrator.py` description** (lines 236, 264)
9. **Cost-ceiling math contradicts itself across four sites** (lines 331, 502, 515, 779)
10. **R-V21.13 mitigation contradicts P10 about CLAUDE.md** (lines 51, 736)
11. **Wave A 5-7 day target carries from iter 1 — still unrealistic post-scope-cut** (lines 242, 774)
12. **"What I need from you" §7 pre-supposes a cost number that contradicts EC-V21-B.6** (line 779)
13. **Wave B section missing "Tests added" sub-section despite Wave A having one** (lines 314-323 vs 283-288)
14. **Iter-1's recommended EC-V21-A.16 (methodology pillar empty state) not adopted** (line 308 + iter 1 §Vision)

---

## Vision

No new issues. (Iter 1's empty-state-as-teaching-surface recommendation tracked as Issue 14 below.)

---

## Problem (concrete pain points, evidence-backed)

### Issue 10 — P10 directly contradicts R-V21.13 mitigation column

Description:
Line 51 (P10): "Stale CLAUDE.md path claim. Project CLAUDE.md says L2 v2 artifacts live at `system-design/kb-upgrade-v2/module-{1..7}/`. That path **does not exist** on disk."

Line 736 (R-V21.13 mitigation): "CLAUDE.md path claims audited — no dead-path references found, no edits needed there."

Both claims live in the same plan. Verified at `apps/product-helper/CLAUDE.md:550`: the dead path is still cited verbatim. Either the audit only checked Wave-E (folder-15) paths and the wording is misleading, or the audit was wrong.

Suggested Solution:
Restate R-V21.13 mitigation precisely:

```
CLAUDE.md path claims audited for Wave-E source-plan paths
(folder-15 dead references) — no Wave-E dead-path edits needed.
P10 (separate Wave-A finding) addresses the
`system-design/kb-upgrade-v2/module-{1..7}/` dead path; closed by
EC-V21-A.7 + Wave A `Files edited` line 280.
```

---

## Decisions (locked in this plan)

### Issue 8 — D-V21.24 contradicts Wave-A `python-sidecar/orchestrator.py` description

Description:
Line 236 (D-V21.24, locked 2026-04-25 19:50 EDT post-critique-iter-1):
"Vercel hosts the LangGraph orchestration; Cloud Run sidecar = per-artifact rendering only ... LLM cost stays on Vercel-side Anthropic SDK metering."

Line 264 (Wave A `Files added`):
"`services/python-sidecar/orchestrator.py` — Cloud Run task entrypoint that **hosts the full long-running synthesis pipeline (LangGraph orchestration + LLM calls + Python rendering** for the 7 artifact families). Vercel only triggers + polls; no Vercel function ceiling problem."

The two descriptions are mutually exclusive. D-V21.24 was added as the iter-1 Issue 11 fix; the orchestrator paragraph at line 264 predates it and was not reconciled.

Suggested Solution:
Rewrite line 264 to honor D-V21.24:

```
- `services/python-sidecar/orchestrator.py` — Cloud Run task entrypoint
  for **per-artifact rendering only** per D-V21.24. Receives
  `POST /run-render` with `{project_id, artifact_kind, agent_output_payload}`
  from Vercel-side LangGraph; invokes the canonical Python generator
  for that artifact (`gen-arch-recommendation` / `gen-qfd` / `gen-fmea` / etc.);
  writes binary blob to Supabase Storage + updates `project_artifacts` row
  via service-role client. Sidecar does NOT host LangGraph or run LLM calls —
  those stay Vercel-side for unified Anthropic SDK metering + Sentry
  instrumentation. Cold-start budget applies only to render path.
```

Also: line 244 ("PDF + PPTX gen via Python sidecar") and line 552 ("depends on ... Cloud Run sidecar (which hosts the full long-running pipeline...)") need parallel rewrites to drop "full long-running pipeline" framing.

---

## Wave Plan

### Issue 1 — EC-V21-A.0(d) METHODOLOGY-CORRECTION duplicate claim is wrong

Description:
Line 291: "METHODOLOGY-CORRECTION.md canonical path resolved (currently exists at both `.claude/plans/kb-upgrade-v2/` AND `system-design/` — pick one)."

Verified on disk: `system-design/METHODOLOGY-CORRECTION.md` does NOT exist. Two copies actually exist:
- `.claude/plans/kb-upgrade-v2/METHODOLOGY-CORRECTION.md` (this folder also has modules 1-6)
- `plans/kb-upgrade-v2/METHODOLOGY-CORRECTION.md` (this folder has modules 1-8)

The "pick one" question has a different answer than the plan implies — only `plans/kb-upgrade-v2/` carries the full module 1-8 set. Picking `.claude/plans/kb-upgrade-v2/` orphans modules 7 + 8.

Suggested Solution:
Replace line 291's (d) bullet with:

```
(d) METHODOLOGY-CORRECTION.md canonical path resolved.
  Currently exists at BOTH `.claude/plans/kb-upgrade-v2/` AND
  `plans/kb-upgrade-v2/`. Default: keep `plans/kb-upgrade-v2/` as
  canonical (only path with full module-1..8 set on disk); convert
  `.claude/plans/kb-upgrade-v2/METHODOLOGY-CORRECTION.md` to a
  one-line redirect stub. CLAUDE.md path-claim row (P10) updated in
  the same commit.
```

This also collapses spawn-prompts R-v2.1.E and master plan's "What I need from you" #1 ambiguity.

---

### Issue 2 — Files-edited CLAUDE.md rewrite target is wrong

Description:
Line 280: "[`CLAUDE.md`](../CLAUDE.md) — fix stale path claim (P10): `system-design/kb-upgrade-v2/` → `.claude/plans/kb-upgrade-v2/`, M{1..7} → M{1..8}"

`.claude/plans/kb-upgrade-v2/` only contains modules 1-6 on disk (verified). Modules 7 + 8 live only in `plans/kb-upgrade-v2/`. The proposed rewrite would still leave CLAUDE.md citing a path that doesn't carry M7-M8.

Suggested Solution:

```
- [`CLAUDE.md`](../CLAUDE.md) — fix stale path claim (P10):
  `system-design/kb-upgrade-v2/module-{1..7}/`
  → `plans/kb-upgrade-v2/module-{1..8}/`
  (full self-app module set lives at `plans/kb-upgrade-v2/`; the
  `.claude/plans/kb-upgrade-v2/` copy carries only modules 1-6 and is
  converted to a redirect stub by EC-V21-A.0(d)).
```

Resolves Issue 1 + Issue 2 in one commit.

---

### Issue 3 — Step D-4: `api-spec-agent.ts:71` references wrong line

Description:
Line 388 (Wave D Step D-4): "Keep [`api-spec-agent.ts:71`](../apps/product-helper/lib/langchain/agents/api-spec-agent.ts#L71) `apiSpecificationSchema` for output validation only".

Verified at `apps/product-helper/lib/langchain/agents/api-spec-agent.ts`:
- Line 71 is the START of `jsonSchemaSchema` (the embedded JSON-schema type that bloats the input_schema, NOT the apiSpecificationSchema).
- `const apiSpecificationSchema = z.object({` is at **line 127**.
- Line 47 (P8 diagnosis) cites the embedded `jsonSchemaSchema` range as `:71-127` — that's the correct read.

Step D-4's deep link points reviewers at the wrong symbol.

Suggested Solution:
Replace `:71` with `:127` on line 388:

```
**Step D-4:** Keep [`api-spec-agent.ts:127`](../apps/product-helper/lib/langchain/agents/api-spec-agent.ts#L127)
`apiSpecificationSchema` for output validation only (final assembled
spec must still parse against it).
```

Same correction is needed in spawn-prompts-v2.1 §TD1 (already filed under Group-A fix-up).

---

### Issue 4 — Files-edited M2 NFR agent path handwaved

Description:
Line 272 (Wave A `Files edited`):
"`lib/langchain/agents/system-design/{decision-net,form-function,hoq,fmea-early,fmea-residual,interface-specs}-agent.ts` — already shipped per v2 release notes ... **Open-question emission ... the M2 NFR agent (existing)**, `hoq-agent.ts`, and `fmea-residual-agent.ts` ... are extended to emit `open_question` events".

Verified on disk: the M2 NFR agent is `apps/product-helper/lib/langchain/agents/system-design/nfr-resynth-agent.ts` (sibling to the 6 agents already named explicitly in the same paragraph). No reason to leave it unnamed.

Suggested Solution:
Rewrite line 272's open-question paragraph naming the file explicitly:

```
Open-question emission (NEW, locked 2026-04-25 16:28 EDT): the M2 NFR
re-synthesis agent at `lib/langchain/agents/system-design/nfr-resynth-agent.ts`,
`hoq-agent.ts` (M6 QFD), and `fmea-residual-agent.ts` (M8.b) are extended
to emit `open_question` events via `lib/chat/system-question-bridge.ts`
whenever a decision needs user input...
```

Same correction needed in spawn-prompts-v2.1 §TA1.open-questions-emitter (already filed under Group-A fix-up).

---

### Issue 5 — Wave A agent count internally inconsistent across three sites

Description:
Three different counts:
- **Line 244** (Wave A Goal): "The 6 already-built agents (decision-net / form-function / hoq / fmea-residual / synthesizer / interface-specs)" → 6 agents listed, INCLUDES synthesizer.
- **Line 272** (Files edited): `{decision-net, form-function, hoq, fmea-early, fmea-residual, interface-specs}-agent.ts` → 6 agents listed, INCLUDES fmea-early but EXCLUDES synthesizer.
- **Line 273**: "[`architecture-recommendation-agent.ts`](../apps/product-helper/lib/langchain/agents/architecture-recommendation-agent.ts) (644 lines) — same audit; this is the synthesizer ('T6 keystone')" → synthesizer named separately, a 7th agent.
- **Line 274**: "add 6 GENERATE_* nodes downstream of existing extractData → FFBD → DecisionMatrix → Interfaces → QFD chain. The 6 nodes invoke already-shipped T4b/T5/T6 agents."

Net actual: 7 agents wired (6 system-design + 1 architecture-recommendation), but graph-node count waffles between 6 (line 274) and 7 (spawn-prompts derives 7 with GENERATE_synthesis as the 7th).

Suggested Solution:
Pin a single count + agent table. Replace lines 244 + 272-274 enumeration with:

```
Wave A wires 7 agents into 7 GENERATE_* graph nodes:

| agent file | graph node | T-source | invocation |
|---|---|---|---|
| system-design/form-function-agent.ts | generate_form_function | T5 | NEW node |
| system-design/decision-net-agent.ts | generate_decision_network | T4b | NEW (sibling to existing generate_decision_matrix per Issue 7) |
| system-design/interface-specs-agent.ts | generate_interfaces | T4b | RE-WIRE existing generate_interfaces internals |
| system-design/hoq-agent.ts | generate_qfd | T6 | RE-WIRE existing generate_qfd internals |
| system-design/fmea-early-agent.ts | generate_fmea_early | T4a | NEW node |
| system-design/fmea-residual-agent.ts | generate_fmea_residual | T6 | NEW node |
| architecture-recommendation-agent.ts | generate_synthesis | T6 keystone | NEW node — composes outputs of the 6 above into architecture_recommendation.v1 |
```

This collapses Issues 5, 6, and 7 into one table.

---

### Issue 6 — Existing system-design agents under-enumerated

Description:
On disk under `apps/product-helper/lib/langchain/agents/system-design/`:
```
data-flows-agent.ts          ← M1 phase-2.5 — emits data_flows.v1.json (referenced at End State line 149 but no producer node in plan)
discriminator-intake-agent.ts ← M0 — out of v2.1 scope, not flagged
ffbd-agent.ts                 ← already wired
fmea-early-agent.ts           ← in plan files-edited list
fmea-residual-agent.ts        ← in plan
form-function-agent.ts        ← in plan
hoq-agent.ts                  ← in plan
interface-specs-agent.ts      ← in plan
n2-agent.ts                   ← M7.a — emits n2_matrix.v1.json (referenced at End State line 159, P3 line 35 but no producer node)
nfr-resynth-agent.ts          ← M2 — referenced as "M2 NFR agent (existing)" line 272
signup-signals-agent.ts       ← M0 — out of v2.1 scope
synthesis-agent.ts            ← sibling of architecture-recommendation-agent.ts; canonical?
```

Master plan does not address: (a) which producer wires `data_flows.v1.json` for the new Data Flows nav route at line 149, (b) which producer wires `n2_matrix.v1.json` for the promoted N2 sub-tab at line 159 + EC-V21-A.5, (c) whether `synthesis-agent.ts` or `architecture-recommendation-agent.ts` is the canonical synthesizer.

Suggested Solution:
Extend the table from Issue 5 with an "additional disposition" column for v2.1:

```
Additional disposition decisions:
| agent file | v2.1 disposition |
|---|---|
| system-design/data-flows-agent.ts | WIRE (NEW node generate_data_flows) — required for End State line 149 + nav route at apps/product-helper/app/(dashboard)/projects/[id]/requirements/data-flows/page.tsx |
| system-design/n2-agent.ts | WIRE (NEW node generate_n2_matrix) — required for EC-V21-A.5 N2 promotion + End State line 159 |
| system-design/synthesis-agent.ts | OUT-OF-SCOPE — architecture-recommendation-agent.ts is canonical synthesizer; document in Wave A files-edited that synthesis-agent.ts is non-runtime |
| system-design/{discriminator-intake,signup-signals}-agent.ts | OUT-OF-SCOPE for v2.1 (M0 sign-up flow; T7 Wave 2-early scope) |
```

Without this, two new nav routes (Data Flows, N2 promotion) ship pointing at empty data sources.

---

### Issue 7 — Decision Matrix vs Decision Network graph-node coexistence unspecified

Description:
- End State line 155-156 names two siblings: `Decision Matrix` (Cornell weighted-scoring view, preserved) AND `Decision Network` (Crawley network/Pareto shape, NEW).
- Files-edited line 271: "add Recommendation, Open Questions, Data Flows, FMEA, Form-Function, **Decision Network** entries (Decision Matrix preserved as sibling — do NOT rename)".
- Wave A files-edited line 274: "add 6 GENERATE_* nodes" — but the existing graph already has `generate_decision_matrix` (verified at intake-graph.ts:389). If `generate_decision_network` is added as a new node, then Decision Matrix's underlying agent stays unchanged AND a new sibling node ships. If the new node REPLACES Decision Matrix's agent, the existing Decision Matrix viewer breaks.

Plan does not pick between sibling-coexistence and replacement-with-back-compat.

Suggested Solution:
Pin in Decisions table as a new D-V21.NN:

```
**D-V21.25** | Decision Matrix vs Decision Network coexistence | **Two graph nodes coexist; neither replaces the other.** `generate_decision_matrix` (existing, unchanged) keeps invoking the existing Cornell weighted-scoring agent and writing to the existing FROZEN decision-matrix-viewer. `generate_decision_network` (NEW) invokes decision-net-agent.ts and writes to a new decision-network viewer that Wave A ships. Both feed `project_artifacts` with separate `artifact_kind` keys ('decision_matrix_v1' / 'decision_network_v1'). | Honors EC-V21-A.10 FROZEN convention; matches "show your work" pillar — user sees BOTH the Cornell scorecard AND the Crawley Pareto network |
```

Resolves spawn-prompts critique Issue 4 at the master plan level.

---

### Issue 13 — Wave B section missing "Tests added"

Description:
Wave A (line 283-288) and Wave D (line 390 Step D-5) both list "Tests added". Wave B (lines 314-323) lists only "Files added" + "Files edited" + "Wave B exit criteria"; no enumeration of test files. EC-V21-B.1 (cache hit-rate), EC-V21-B.2 (lazy-gen latency drop), EC-V21-B.3 (Free hard-cap), EC-V21-B.5 (Sentry dashboards) all imply tests, but no test files are named.

Suggested Solution:
Add a `**Tests added:**` block under line 323 enumerating:

```
**Tests added:**
- `__tests__/cache/synthesis-cache.test.ts` — cache hit/miss + 30%+ hit-rate on 10×5 synthetic load
- `__tests__/jobs/lazy-gen.test.ts` — eager vs on_view classification; 50%+ post-intake p95 drop on deferred subset
- `__tests__/billing/synthesis-tier.test.ts` — Free hard-cap, Plus unlimited, start-of-month boundary
- `__tests__/jobs/circuit-breaker.test.ts` — 30s timeout fires; per-artifact failure isolated
- `__tests__/observability/synthesis-metrics.test.ts` — instrumentation fires; counters increment correctly
- `scripts/load-test-tb1.ts` — synthetic 100 DAU × 30 days load; cost projection ≤ EC-V21-B.6 target
```

Pure consistency with Wave A + Wave D structure.

---

## Risks

(R-V21.13 mitigation rewrite covered in Issue 10 above.)

---

## Systems-Engineering Math

### Issue 9 — Cost-ceiling math contradicts itself across four sites

Description:
Four different "Wave-B end-state cost" or "v2.1 cost ceiling" numbers:

| Source | Number |
|---|---|
| Line 331 (EC-V21-B.6) | "≤ $500/mo at 100 DAU baseline (down from Wave-A unoptimized $924/mo)" |
| Line 502 (cost section header) | "v2.1 net at end of Wave B ≈ $647/mo (no Wave-E heuristic engine savings until v2.2)" |
| Line 515 (cost table summation) | "+$924/mo (Wave A) − $277/mo (Wave B) = +$647/mo" |
| Line 779 (What I need from you §7) | "Wave A lands at ~$921/mo; Wave B brings it to ~$644/mo" |

Three of the four sites say ~$647/mo; EC-V21-B.6 says ≤$500/mo. EC at $500 cannot be satisfied if cost-table arithmetic says $647. The spawn-prompts doc TB1.verifier (Group-B fix-up) ships `scripts/load-test-tb1.ts` and gates on "≤$500/mo" — that gate will FAIL on tag using the master plan's own cost arithmetic.

Suggested Solution:
Either:

```
A. Tighten Wave B optimization scope to actually hit $500/mo.
   Cost-table line 506 ("Per-tenant LLM" −$300/mo "to ~$600") needs
   to drop further (e.g. via more aggressive lazy-gen or tier
   restriction). Rewrite EC-V21-B.6 to ≤$500/mo and prove it via
   load-test-tb1.ts.

B. Accept $647/mo as the Wave-B end state. Rewrite EC-V21-B.6 to
   ≤$650/mo. Document gap to AV.01 ($320/mo) as "addressed in v2.2
   via Wave-E heuristic engine savings (−$234/mo)".

C. Split into two ECs:
   EC-V21-B.6.a: Wave-B brings cost to ≤$650/mo at 100 DAU
                 (cost-table arithmetic gate)
   EC-V21-B.6.b: Free-tier hard-cap (1/mo) + Plus rate-limit keep
                 effective burn ≤$500/mo at projected real Plus
                 adoption (e.g. 30% of DAU on Plus, 5 syntheses/mo)

Bond default: B (accept $647 + document v2.2 path to $320). David rules.
```

Until reconciled, R-v2.1.D in spawn-prompts ($921 / $644 / $320) cannot be answered correctly because the input numbers are unstable.

---

## Exit Criteria (consolidated)

### Issue 14 — Iter-1's recommended EC-V21-A.16 not adopted

Description:
Iter-1 recommended adding EC-V21-A.16: "Empty-state renders methodology pillar tiles with blur + CTA, no real artifact data leaks" — to honor D-V21.17 (no canned data) while preserving the empty-state-as-teaching-surface for reviewer-recruiters.

Line 308 still ends at EC-V21-A.15. Either intentional rejection or oversight.

Suggested Solution:
If intentional, add a note at line 308 ("EC-V21-A.16 considered + rejected — empty-state CTA only is sufficient"). If oversight, add the EC:

```
- [ ] **EC-V21-A.16** Empty-state renders methodology pillar tiles
  (5 tiles, blurred/grayed) with copy "Your project hasn't been
  synthesized yet. Run Deep Synthesis to populate." Regex sweep on
  rendered HTML asserts zero canned-c1v strings ('AV.01', 'Sonnet 4.5',
  'pgvector', 'Vercel') leaked into the empty state. Honors D-V21.17
  AND the "show your work" portfolio pillar.
```

---

## What I need from you to proceed

### Issue 12 — §7 cost-ceiling question pre-supposes a number that contradicts EC-V21-B.6

Description:
Line 779 asks David to confirm "$921/mo Wave A → $644/mo Wave B" against AV.01's $320/mo budget. But EC-V21-B.6 says ≤$500/mo. David is being asked to accept a budget overshoot that the EC won't permit.

Suggested Solution:
Resolve Issue 9 first; rewrite §7 with the reconciled number. E.g. (post-Issue-9 Option B):

```
7. **Cost ceiling acceptance (v2.1 only).** Wave A lands at ~$924/mo;
   Wave B brings it to ~$647/mo (per cost table line 515; EC-V21-B.6
   updated to ≤$650/mo). AV.01 portfolio budget is $320/mo — gap to
   v2.1 closes in v2.2 via Wave-E heuristic engine savings (−$234/mo).
   Free-tier hard-cap (1 synthesis/mo) is the structural backstop
   during the $647/mo window. OK to ship at $647/mo with v2.2 path
   to $413/mo, or do you want stricter throttles before Wave-B
   optimizations land?
```

---

## Plan-level scope concerns

### Issue 11 — Wave A 5-7 day target carries from iter 1 — still unrealistic

Description:
Iter 1 (§Plan-level scope concerns) flagged the 5-7 day Wave-A target as unrealistic given the 18-component + Cloud Run sidecar + RLS + atlas re-ingest + chat-bridge file manifest. The scope-cut to A + B + D removed Waves C + E from the plan but did NOT shrink Wave-A's surface area — Wave-A still ships everything iter-1 enumerated.

Lines 242 + 774 still say 5-7 days. Spawn-prompts doc ships the same target with `8-12 day conservative ceiling` per spawn-prompts critique iter-1 Issue 7.

Suggested Solution:
Reconcile master plan and spawn-prompts on a single timeline. Recommended:

```
Line 242: "Wave A — Per-tenant runtime wiring (target: 8-12 days)"
Line 774: "Approve the wave ordering for v2.1 — A → (B ∥ D).
  Wave A target 8-12 days (5-7 day stretch goal if EC-V21-A.0
  preflight finds zero non-trivial fs-side-effects refactors AND
  atlas re-ingest dedup is benign). Wave D parallel with Wave A
  (~3-5 days). Wave B post-Wave-A (3-5 days). Total v2.1 calendar
  ≈ 14-20 days."
```

Honors realistic execution while preserving the stretch-goal narrative.

---

## Summary of recommended action

```
Quick factual fixes (≤30 min):
  - Issue 1: line 291(d) — METHODOLOGY-CORRECTION canonical path
  - Issue 2: line 280 — CLAUDE.md fix target → plans/kb-upgrade-v2/
  - Issue 3: line 388 — api-spec-agent.ts:71 → :127
  - Issue 4: line 272 — name nfr-resynth-agent.ts explicitly
  - Issue 10: line 736 — clarify R-V21.13 mitigation scope

Architectural reconciliation (1-2 hours):
  - Issue 5+6+7: replace lines 244+272-274 with explicit agent ↔ node
    table (closes spawn-prompts Issue 21 upstream)
  - Issue 8: rewrite line 264 to honor D-V21.24 sidecar render-only
  - Issue 9+12: pick one Wave-B cost number; reconcile EC-V21-B.6
    with cost table; rewrite §7
  - Issue 11: timeline to 8-12 days

Optional tightening:
  - Issue 13: Wave B "Tests added" block
  - Issue 14: EC-V21-A.16 (or explicit reject note)

Total edit time: ~3-4 hours. Net effect: master plan and
spawn-prompts ship a consistent contract; Wave 1 dispatch is unblocked
on real terms (not on contradicted EC math).
```
