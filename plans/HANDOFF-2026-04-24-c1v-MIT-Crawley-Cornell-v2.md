# HANDOFF — c1v-MIT-Crawley-Cornell v2 brainstorm

> **Date:** 2026-04-24 (session 23:23 EDT 2026-04-23 through 02:55 EDT 2026-04-24)
> **Participant:** David (user) + Bond (assistant)
> **Deliverable produced this session:** [`plans/c1v-MIT-Crawley-Cornell.v2.md`](c1v-MIT-Crawley-Cornell.v2.md)
> **Purpose of this doc:** Full transcript + verbatim quotes + decisions locked + open rulings, so a fresh Claude Code session can pick up the thread after `/clear` with zero context loss.
> **Related files:** [`plans/c1v-MIT-Crawley-Cornell.md`](c1v-MIT-Crawley-Cornell.md) (v1), [`system-design/METHODOLOGY-CORRECTION.md`](../system-design/METHODOLOGY-CORRECTION.md), [`plans/v3_revised/`](v3_revised/), [`system-design/kb-upgrade-v2/`](../system-design/kb-upgrade-v2/)

---

## 1. Session shape (TL;DR for a fresh Claude)

Session started with a stale question ("find the settings.json for team c1v-reorg") that revealed T8 c1v-reorg team was never fully spawned. That led to an escalating context-expansion where David walked through the **evolution of the c1v methodology** from thin KBs → deepened KBs → v2 artifact set (self-application) → v3 foundation re-set → MIT-Crawley pivot (current v1 plan). He explicitly asked me to digest 9 plan files + the deepened KB corpus + v2 artifact set + METHODOLOGY-CORRECTION.md before asking questions.

The brainstorming then converged on **4 upgrade deliverables** beyond what v1 MIT-Crawley-Cornell.md addresses:

1. **T9 KB corpus hygiene** — fix uneven depth, 4× duplication, Atlas location, folder numbering across `.planning/phases/13-Knowledge-banks-deepened/`
2. **Flow restructure WITHOUT Pass-1/2/3 labels** — split M8 into M8.a (FMEA v1) + M8.b (FMEA v2); split M7 into M7.a (N2) + M7.b (formal specs); add M1 phase 2.5 data flows; new Wave 2-mid NFR resynth team
3. **Atomic cross-tree renumber** (schema dir + KB dir in single commit with consistency verifier)
4. **T10 artifact generator centralization** (14 scattered Python scripts → 13 uniform generators + 4 NEW Crawley generators + TS runtime invoker + manifest)

All four are specced in `plans/c1v-MIT-Crawley-Cornell.v2.md` with **full agent spawn prompts** (subagent_type, deliverables, guardrails, dependencies per agent). Team count goes from v1's 8 teams to v2's 11 teams; wave count from 2 → 4 (strict gates).

**Nothing has been dispatched.** The v2 doc is draft pending David's review + 5 open rulings (§"Open Rulings" below).

---

## 2. Absolute quotes — every user message this session

Reproduced verbatim, newest last. Where a hook-injected system reminder was attached, it's included as `[ide-context]`.

### [23:23 EDT Apr 23] Initial ask (with line-selection hint)

```
can you find the following team agent .claude/settings.json for this team c1v-reorg
```
[ide-context: user highlighted line 449 in `plans/team-spawn-prompts.md` = `c1v-reorg`]

### [later same turn]

```
I was expecing it to exist
```

### [23:34]

```
no I mean the higher level strategy
```

### [23:36]

```
no I didn't see gible). You build the pipeline, then run the pipeline against c1v itself
```

### [00:30 EDT Apr 24]

```
so c1v-reorg - needs a LOT more context...
```

### [01:09] — long recap of project history (VERBATIM)

```
At first, the vision was to make the agents to go through these steps, from cornell system design, produce recommendation and diagrams, create MCP servers and allow agents to start building according to the spec designed. /Users/davidancor/Projects/c1v/apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/old-thin-knowledge-banks. Then I realized a couple of things - my steps 1-2 didn't connect to 3-6 and also another pipeline that recommended software, etc. here is the report on that.  /Users/davidancor/Projects/c1v/plans/pipeline-b-steps36-integration.md /Users/davidancor/Projects/c1v/plans/pipeline-b-steps36-schema-gap-audit.md /Users/davidancor/Projects/c1v/plans/pipeline-b-conversational-drive.md /Users/davidancor/Projects/c1v/plans/pipeline-b-dual-trigger.md ... The second thing that happened is that... I had a lot more knowledge from my cornell system design course + I had to add basis software arhictecture design knowledge like latency, availability, etc. - I created these deeply context heavy but really good KBs - /Users/davidancor/Projects/c1v/apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/New-knowledge-banks/Users/davidancor/Projects/c1v/apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/New-knowledge-banks/2-dev-sys-reqs-for-kb-llm-software/Multithreading-vs-Multiprocessing.md /Users/davidancor/Projects/c1v/apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/New-knowledge-banks/2-dev-sys-reqs-for-kb-llm-software/load-balancing-kb.md /Users/davidancor/Projects/c1v/apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/New-knowledge-banks/2-dev-sys-reqs-for-kb-llm-software/maintainability-kb.md -BUT THEY the system design knowledge wasn't integrated into the exisitng 10 step product requirements modules and the DEEPENED modules I worked hard on enhancing. THEN a bunch of additional Ideas came to me that inspired me... /Users/davidancor/Projects/c1v/plans/schema-first-kb-rewrite-and-nfr-engine.md /Users/davidancor/Projects/c1v/plans/retrofit-plans-with-codebase-math-and-diagrams.md - /Users/davidancor/Projects/c1v/plans/sys-design-ideation.md /Users/davidancor/Projects/c1v/system-design/METHODOLOGY-CORRECTION.md - that's when also there was a big /Users/davidancor/Projects/c1v/apps/product-helper/.handoff-504-timeout.md bug - there was a 300 second timeout - PLUS I WANTed USERS TO ALLOW users to upload their code - /Users/davidancor/Projects/c1v/apps/product-helper/docs/superpowers/specs/2026-03-27-codebase-to-system-design.md so I decided I'm going to have a huge KB and needed to change the achitecture to match what I learned in my Data science UofT /Users/davidancor/Projects/c1v/plans/kb-runtime-architecture.md SO We needed to change the KBs to do the following. So software system design recommendation grounded in Math + A Vector DB Pipeline with Agents and Schemas,etc... ALSO if we get an idea on what type of software they are looking to build we can use exisitng software schemas to make recommendations based on industry, etc.. /Users/davidancor/Projects/c1v/plans/public-company-stacks-atlas.md
```

### [01:31] — continuation

```
Continuing... in search for a way to figure out how to identify the cost curve for greenfield projects to help with the mathematical grounded recommendation of software systems... I stumbled on Crawley MIT's book and decided to integrate it's frameworks. /Users/davidancor/Projects/c1v/plans/crawley-sys-arch-strat-prod-dev PLUS I had some deep research on public company's system design and cost curves corelated to DAU, throughput, etc... NOW. In terms of getting the existing SMALL KBs updated... I need some serious help. I first had thin ones like this: /Users/davidancor/Projects/c1v/apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/old-thin-knowledge-banks then I had condensed ones like this: /Users/davidancor/Projects/c1v/apps/product-helper/.planning/phases/13-Knowledge-banks-deepened - this one I already enhanced kind off -/Users/davidancor/Projects/c1v/apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/2-dev-sys-reqs-for-kb-llm-software. But then I decided to do it SYSTEMATICALLY BUT I DID NOT HAVE Crawley's book or .... the Atlas. Nonetheless I did a sweep of the schemas to emsure output is standardized /Users/davidancor/Projects/c1v/plans/kb\ schema-sweep\ plans and then I built  out those modules V2 KBs: /Users/davidancor/Projects/c1v/system-design/kb-upgrade-v2 and then upgraded to v3/Users/davidancor/Projects/c1v/plans/v3_revised and here we are with the following plan to /Users/davidancor/Projects/c1v/plans/c1v-MIT-Crawley-Cornell.md /Users/davidancor/Projects/c1v/plans/team-spawn-prompts.md
```

### [01:37]

```
I have Max +20x Claude Code - I want to figure out the best way to change the following /Users/davidancor/Projects/c1v/plans/reorg-mapping.md /Users/davidancor/Projects/c1v/plans/team-spawn-prompts.md /Users/davidancor/Projects/c1v/plans/c1v-MIT-Crawley-Cornell.md to enhance the KBs - 1) have the least - to minimum changes to schema, have proper JSON-ZON handshake that also triggers artifact creation in the background (i.e., ppt, excel, mermaid, etc) 2) has Crawley's book information 3) has the exsiting methodologies enhance with the system design specific documents, PLUS the atlas -specific math... From my understanding - we're storing this in vector form so inference is a lot faster...
```

### [01:44]

```
I need to Upgrade/update/enhance/fix the following v3 plans: /Users/davidancor/Projects/c1v/plans/v3_revised ask me questions 1 at a time, until you understand fully the request
```

### [01:46]

```
I don't know help me understand more
```

### [01:49]

```
Ok. maybe you need to review v2 /Users/davidancor/Projects/c1v/system-design/kb-upgrade-v2
```

### [01:58]

```
you need to review /Users/davidancor/Projects/c1v/apps/product-helper/.planning/phases/13-Knowledge-banks-deepened and
```
(sentence trailed off — I reported findings and asked for continuation)

### [02:01]

```
how do they come with /Users/davidancor/Projects/c1v/system-design/kb-upgrade-v2
```

### [02:04] — **α lock**

```
 Upgrade L1 (Deepened KBs) — fix the uneven depth, integrate Crawley + Atlas + cross-cutting KBs,  
  normalize schemas/templates across all 8 KBs, de-duplicate. Leave L2 to regenerate later.
```

### [02:08]

```
/Users/davidancor/Projects/c1v/system-design/kb-upgrade-v2/METHODOLOGY-CORRECTION.md Fix the flow as well
```

### [02:24] — **4 deliverables locked**

```
YES - A. Add a §0.2 "KB corpus hygiene" prerequisite (alongside §0 kb-runtime prereqs). Owned by a new T9  
  team. Scope: L1 L1 normalize per my α proposal. Runs in Wave 1 alongside T1/T2/T3/T8. Blocks Wave 2
  (so math primitives and Crawley content land in a normalized corpus).       I don't want to re-lable phases, causes confusion but the flow does need to be re-structured a bit... I'm not 10  EXPAND ON THIS: Concretely:   
  Wave 2's T4 (M3/M4) becomes Pass 1 (FMEA v1 lands here), T7 (Module 0) + T5 + T6 redistribute. The
  strict wave gate becomes the Pass 1 → Pass 2 boundary.    YES -  §5.3 renumbering ruling across both trees simultaneously — schema dirs AND KB dirs rename in 
  the same commit, enforced by a T8-equivalent verifier that checks name-pair consistency  
4th- What additional artifacts are required given the system is using Crawley for recommendations - audit what is currently proposed, what is currently displayed on prd.c1v.ai. - collect all the current py artifact creating scripts centralize them…
```

### [02:31] — course correction on UI audit

```
ARE YOUU SURE prd.c1v.ai DOESN"T DISPLAY ANY ARTIFACTS? WTF IS WRONG WIHT YOU?
```
(I had wrongly asserted prd.c1v.ai shipped no system-design artifacts, based on reading `apps/product-helper/CLAUDE.md` deployed-features list instead of the actual routes. Corrected by walking `app/(dashboard)/projects/[id]/system-design/`.)

### [02:34]

```
yes, great, add this here: plans/c1v-MIT-Crawley-Cornell.v2.md  WITH SPEC TIGHT DETAILS... WRITE OUT PROMPTS FOR AGENT TEAMS WITH THOROUGH DETAIL
```

### [02:55] — current turn

```
can you make a hand-off document .md COPY PASTE ALL MY REQUESTS, QUESTION AND ANSWERS. AND PROVIDE AND verbadem summary of what we discuss so claude code will understand EXACTLY THE CONTEXT WE WERE TALKING ABOUT AFTER I CLEAR CONTEXT
```

(Producing this doc.)

---

## 3. Questions Bond asked + David's answers

Compact form. Q = Bond's clarifying question, A = David's answer.

| # | Q | A |
|---|---|---|
| 1 | Scope-check. Which of (A) spawn-prompt structure / (B) execution strategy / (C) rollback safety / (D) other — is the T8 c1v-reorg brainstorm about? | [Skipped — David pivoted to "explain purpose grounded in project plan"] |
| 2 | Now higher-level strategy — confirm self-application framing? | "no I didn't see gible [legible]... you build the pipeline, then run pipeline against c1v itself" — implicitly confirmed, asked me to verify, which I did from source |
| 3 | Is v3 the authoritative plan that MIT-Crawley-Cornell folds into, vice versa, or are they orthogonal (X/Y/Z)? | "I don't know help me understand more" |
| 4 | Now with v2 reviewed — is upgrade producing artifacts (P) or delta spec docs (Q/R/S)? | [Answered via 02:04 α lock: Upgrade L1 deepened KBs, leave L2 to regenerate later] |
| 5 | Shape of the L1 upgrade — Normalize everything (A) / Patch gaps (B) / Hybrid normalize-what-scales + patch-what-varies (C)? | [Skipped — jumped ahead with 02:08 methodology-correction add + 02:24 4-deliverable lock] |
| 6 | 3 additions to MIT-Crawley-Cornell.md (A/B/C) — which? | "YES" to A (KB hygiene), partial on B (expand but NO Pass 1/2/3 relabel), "YES" to C (renumber + verifier), NEW 4th (artifact audit + centralize Python scripts) |

---

## 4. Decisions locked (as of 2026-04-24 02:55)

| # | Decision | Source quote | Artifact |
|---|---|---|---|
| D1 | v2 plan is an **amendment** to v1 (supersedes specific sections, doesn't replace whole) | Implicit from "add this here: plans/c1v-MIT-Crawley-Cornell.v2.md" (02:34) | v2 doc front-matter |
| D2 | **L1 deepened-KB corpus is the upgrade target.** L2 (v2 artifacts) regenerates later. | "Upgrade L1 (Deepened KBs) — fix the uneven depth..." (02:04) | v2 §0.2 |
| D3 | **New T9 team** for KB hygiene. Wave 1. Blocks Wave 2. | "YES - A. Add a §0.2 KB corpus hygiene prerequisite... Owned by a new T9 team..." (02:24) | v2 §0.2.5 |
| D4 | **NO Pass-1/2/3 relabeling.** Keep module names M1-M8. Restructure flow by splitting modules + redistributing teams + adding wave gates. | "I don't want to re-lable phases, causes confusion but the flow does need to be re-structured a bit..." (02:24) | v2 §0.3.1 |
| D5 | **M8 splits into M8.a (FMEA v1, fires early) + M8.b (FMEA v2, terminal).** M2 NFRs derive from M8.a. | Derived from B expand ask (02:24) + METHODOLOGY-CORRECTION.md §1.3 | v2 §0.3.2 Insertion 1 |
| D6 | **M7 splits into M7.a (N2 matrix, fires early) + M7.b (formal specs, late).** | Derived from flow-restructure ask | v2 §0.3.2 Insertion 2 |
| D7 | **M1 gets new phase 2.5 "Data Flows"** before Scope Tree. | Derived from METHODOLOGY-CORRECTION refinement A | v2 §0.3.2 Insertion 3 |
| D8 | **T4 splits** into T4a (Wave 2-early: M3+M7.a+M8.a) and T4b (Wave 3: M4 decision-net). | Flow-restructure redistribution | v2 §0.3.4 |
| D9 | **Wave count 2 → 4**: Wave 1 foundations / Wave 2-early understanding / Wave 2-mid NFR resynth / Wave 3 decision / Wave 4 synthesis. Strict gates. | Flow-restructure + B expand | v2 §0.3.3, §14.2 |
| D10 | **New T-new team `c1v-m2-nfr-resynth`** at Wave 2-mid. Re-derives NFRs + Constants from FMEA v1. | "Wave 2's T4 becomes [what used to be called] Pass 1 (FMEA v1 lands here), T7 + T5 + T6 redistribute" (02:24) | v2 §0.3.6 |
| D11 | **T7 (Module 0) moves to Wave 2-early.** Intake = understanding, not spec. | Flow-restructure | v2 §0.3.4 |
| D12 | **T5 moves to Wave 3. T6 moves to Wave 4 (terminal).** | Flow-restructure | v2 §0.3.4 |
| D13 | **§5.3 renumber ruling: option (a) renumber** across BOTH schema dir + KB dir in a single atomic commit. | "§5.3 renumbering ruling across both trees simultaneously — schema dirs AND KB dirs rename in the same commit" (02:24) | v2 §0.4 |
| D14 | **Consistency verifier script** (`scripts/verify-tree-pair-consistency.ts`) runs in CI. Blocks PR merge on any inconsistency. | "enforced by a T8-equivalent verifier that checks name-pair consistency" (02:24) | v2 §0.4.4 |
| D15 | **14 scattered Python scripts → 9 migrated + 4 NEW = 13 total generators** at `scripts/artifact-generators/`. | 02:24 4th bullet + 02:34 "spec tight details" | v2 §15 |
| D16 | **New T10 team `c1v-artifact-centralization`** at Wave 1. | 02:24 4th bullet | v2 §15.7 |
| D17 | **UI stays frozen for v2.** `artifact-pipeline.tsx` gets manifest-read extension only. No new viewers. | Confirmed indirectly via "UI freeze 2026-04-21 17:30" (carried from v1) + "do not touch" list in T10 prompt | v2 §15.5 |
| D18 | **Corrected UI audit:** prd.c1v.ai DOES ship 5 system-design routes (decision-matrix, ffbd, qfd, interfaces, diagrams) + 13 section components. My earlier claim of "nothing shipped" was wrong and got corrected. | "ARE YOUU SURE prd.c1v.ai DOESN'T DISPLAY ANY ARTIFACTS?" (02:31) | v2 §15.2 |

---

## 5. Open rulings (block dispatch)

Per v2 §"Open Rulings Needed Before Dispatch." David has not answered these yet.

| # | Question | Default if no ruling | What it blocks |
|---|---|---|---|
| ~~**R-v2.1**~~ | Is `plans/research/crawley-book-findings.md` complete enough for T9 patcher? | **Run research gap pass FIRST.** T9 patcher does not start until the research pass closes holes in `crawley-book-findings.md`. | T9 patcher — gated on research pass |
| ~~**R-v2.2**~~ | 4-wave vs 3-wave? | **4-wave strict.** No collapse. | — |
| ~~**R-v2.3**~~ | UI freeze — allow FMEA viewer? | **FMEA viewer IN SCOPE** (~300 LOC, T10 runtime-wirer). Resolved 03:40 EDT. | — |
| ~~**R-v2.4**~~ | Spawn all 6 Wave-1 teams in one message? | **Stagger by 2 min** to avoid Claude API rate-limit. | — |
| ~~**R-v2.5**~~ | Cross-tree verifier location? | `scripts/verify-tree-pair-consistency.ts`, T8 verifier owns. | — |

---

## 6. Repo state relevant to the next session

### 6.1 Files that exist (read these first after /clear)

| File | What it is | Read priority |
|---|---|---|
| `plans/c1v-MIT-Crawley-Cornell.v2.md` | **THE v2 PLAN.** Full spec + agent prompts. | 🔴 critical |
| `plans/HANDOFF-2026-04-24-c1v-MIT-Crawley-Cornell-v2.md` | THIS doc. Context + quotes. | 🔴 critical |
| `plans/c1v-MIT-Crawley-Cornell.md` | v1 plan. v2 amends it. | 🟠 high |
| `plans/HANDOFF-c1v-MIT-Crawley-Cornell.md` | v1 handoff (Apr 21). Rulings archive. | 🟠 high |
| `plans/team-spawn-prompts.md` | v1 team spawn bodies (T1/T2 full, T3-T8 roster-only) | 🟠 high |
| `plans/reorg-mapping.md` | T8 c1v-reorg authoritative mapping (274 lines) | 🟠 high |
| `system-design/METHODOLOGY-CORRECTION.md` | Three-pass argument + 17-step schema compendium + DBML | 🟠 high |
| `plans/v3_revised/` | v3 delta foundation (Apr 20) | 🟡 medium — v2 doesn't touch this directly |
| `system-design/kb-upgrade-v2/module-{1..7}/` | v2 artifact set for c1v self-application | 🟡 medium |
| `apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/` | L1 corpus that T9 normalizes | 🔴 critical for T9 dispatch |
| `apps/product-helper/components/system-design/{decision-matrix,ffbd,qfd,interfaces}-viewer.tsx` | Existing frozen UI | 🟠 high — T10 must not touch |
| `apps/product-helper/components/project/overview/artifact-pipeline.tsx` | UI component T10 extends (manifest read) | 🟠 high |

### 6.2 What's in-flight (not done, not dispatched)

- ~~**T8 c1v-reorg:** ~40% done.~~ **UPDATE 2026-04-24 20:51 EDT:** T8 is COMPLETE — tag `t8-wave-1-complete` @ commit `e173d3b`, verification report at `plans/reorg-verification-report.md` (5/5 GREEN). Cross-tree consistency verifier shipped @ commit `2be3ef4` (`scripts/verify-tree-pair-consistency.ts` + CI). Stale "40% peer-owned" claim in commit `2d4e416` (Apr 24 20:41) was authored 16 hours AFTER T8 actually completed (Apr 24 04:32) — superseded.
- **T2 c1v-kb8-atlas:** separately in-flight per memory — KB-ingest approved 2026-04-21 23:29; scraper on airbnb as of Apr 23 19:51 EDT; 37-task multi-agent build, 3 architect schema-gap tasks open (#34/35/36, #37 pending).
- **Every other v1 team (T1, T3, T4, T5, T6, T7):** unstarted. v2 replaces their spawn plan.

### 6.3 Nothing has been dispatched for v2

No agents spawned for T9, T10, T-new, T4a, T4b. No code written for v2. Only the plan doc + this handoff exist.

---

## 7. Verbatim summary of what we discussed

For Claude Code after `/clear` to absorb the exact shape of the problem as we understood it.

### 7.1 The project frame (unchanged from my earlier explain-higher-level-strategy message)

c1v is a **portfolio project** positioning David as an ML engineer who builds deterministic LLM systems for architecture design. The moat: *"deterministic LLM system for architecture design, grounded in math, with provenance per decision."* Build a pipeline that runs the hybrid **Cornell CESYS525 (front-end: intake → requirements → FFBD) + MIT/Crawley (decision network + form-function)** methodology on any project description, grounded in a **public-company stacks atlas (KB-8)** for real empirical math (cost curves, latency, throughput). Ship in a 10-15hr 8-team agent-swarm build window. Then **run the pipeline against c1v itself** (self-application) — the output `architecture-recommendation.v1.json` becomes the LinkedIn-hero portfolio artifact.

### 7.2 The three layers (discovered during this session)

- **L1 Deepened KBs** (`apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/`): LLM instructions + schemas + xlsx templates + cross-cutting system-design KBs + Crawley overlays. **This is what agents retrieve from.**
- **L2 v2 artifact set** (`system-design/kb-upgrade-v2/module-{1..7}/`): the OUTPUT of running the L1 methodology on c1v-itself. Each module has concrete JSON + xlsx + pptx + mmd files. v2's JSON has `_schema`, `_upstream_refs`, `_output_path` fields pointing back into L1 schemas.
- **L3 v3 deltas** (`plans/v3_revised/`): Apr 20 foundation re-set that corrected v2's PCs/ECs. Has delta files but NEVER got expanded into artifacts. Effectively stalled.

**Corrected earlier misreading:** v2 and v3 and MIT-Crawley-Cornell are NOT three parallel plans. v2 is output, v3 is a foundation-shift delta on top of v2, MIT-Crawley-Cornell is ANOTHER foundation shift + methodology pivot on top of v3. The deepened KBs (L1) underlie all three.

### 7.3 Four defects in L1 discovered this session

1. **Uneven depth.** M2, old-M5-HoQ, M6-interfaces, M7-FMEA have full 4-layer triplet. M1, M3, both M4s (Cornell + Crawley overlay), and M5-form-function are thin.
2. **4× duplication** of 13 cross-cutting sw-design KBs (api-design, caching, CAP, CDN, data-model, deployment, LB, maintainability, queues, MT/MP, observability, resiliency, sw-arch) copy-pasted into M2, M5-HoQ, M6, M7. Any edit drifts.
3. **Atlas lives outside the tree** at `New-knowledge-banks/8-public-company-stacks-atlas/`. Non-uniform retrieval path.
4. **Folder numbering is Cornell-era**, lags the MIT-Crawley renumber ruling (5=form-function, 6=HoQ, 7=interfaces, 8=risk, 9=atlas).

### 7.4 Flow problem (from METHODOLOGY-CORRECTION.md)

Linear M1 → M7 ordering (eCornell pedagogy) has **3 structural bugs**:
1. M4 Decision Matrix fires too early — before FFBD's branching guards/IT-gates stabilize the alternative set.
2. M5 QFD assumes ECs are knowable pre-FMEA — but detectability/recoverability/graceful-degradation-depth are failure-mode-driven.
3. M7 FMEA is terminal when it should be instrumental — its findings should reshape NFRs upstream, not arrive after.

**Rework math:** ~60% reduction from three-pass order vs linear (per METHODOLOGY-CORRECTION §4). Empirically in v2 cascade: 4 modules (M4, M5, M6, M7) each got revised post-hoc — would have been absorbed into single Pass-1 FMEA-v1 step under corrected order.

### 7.5 David's key constraint (flow)

**"No Pass-1/2/3 relabel — causes confusion."** (02:24) Keep module names M1-M8. Keep team slugs. Capture the flow-correction benefit by:
- Splitting M8 → M8.a + M8.b (FMEA becomes instrumental without renaming FMEA)
- Splitting M7 → M7.a + M7.b (N2 fires early without making "interfaces" ambiguous)
- Adding M1 phase 2.5 (data flows before decomposition)
- Adding new T-new team for NFR resynth
- Strict wave gates enforce ordering — Wave 2-mid is the de-facto Pass-1-to-Pass-2 boundary without saying "Pass 1"

### 7.6 UI state (corrected after David's 02:31 pushback)

prd.c1v.ai already ships:
- `/projects/[id]/system-design/{decision-matrix,ffbd,qfd,interfaces}/page.tsx` — 4 routes with dedicated viewers
- `/projects/[id]/diagrams/page.tsx` — Mermaid viewer (651 LOC component)
- `/projects/[id]/requirements/{7 sub-routes}/` + `/backend/{4 sub-routes}/` — 13 section components
- `components/project/overview/artifact-pipeline.tsx` — 142 LOC component (already named artifact-pipeline!)

Missing from prd.c1v.ai (Crawley-specific):
- FMEA viewer (no route, no component)
- Decision-network DAG / Pareto / sensitivity / utility-vector views (current decision-matrix-viewer is flat scoring)
- Form-function bipartite graph / quality matrix
- Cost curves, tail-latency chain, arch-recommendation synthesizer

**UI stays frozen for v2.** Missing viewers ship post-v2. v2 only touches `artifact-pipeline.tsx` to read the new manifest.

### 7.7 The 4 deliverables v2 adds to MIT-Crawley-Cornell.md

See v2 doc for specs. Summary:

**§0.2 T9 KB corpus hygiene** (Wave 1, 4 agents: auditor, structurer, patcher, verifier). Exit criteria: uniform 4-sub-folder structure per KB, `_shared/` pool with symlinks, Atlas consolidated to `9-stacks-atlas/`, folder numbering matches §0.4, Crawley patched per §0.2.4 matrix, all v2 `_upstream_refs` still resolve, generate-all.ts still valid.

**§0.3 Flow restructure** (no relabeling). Three structural insertions: M8.a/b split, M7.a/b split, M1 phase 2.5 data flows. Team delta: T4 → T4a+T4b; T5 moves to Wave 3; T6 moves to Wave 4; T7 moves to Wave 2-early; new T-new at Wave 2-mid. Wave count 2 → 4 with strict gates.

**§0.4 Cross-tree renumber + verifier.** Atomic single-commit rename of schema dirs (`module-4-decision-net/`, `module-5-form-function/`, `module-6-hoq/`, `module-7-interfaces/`, `module-8-risk/`, `module-9-stacks-atlas/`) AND KB dirs (trim suffixes + merge dual-M4 folders + move Atlas). `scripts/verify-tree-pair-consistency.ts` with 5 exit codes runs in CI.

**§15 T10 artifact generator centralization** (Wave 1, 4 agents: migrator, extender, runtime-wirer, verifier). 14 Python scripts → 9 migrated + 4 NEW Crawley generators + 1 arch-recommendation renderer = 13 total under `scripts/artifact-generators/` with uniform TS contract + manifest + BullMQ queue for long jobs + artifact-pipeline.tsx extension.

### 7.8 What David cares about (inferred from session)

- **Tight specs.** "WITH SPEC TIGHT DETAILS... WRITE OUT PROMPTS FOR AGENT TEAMS WITH THOROUGH DETAIL" (02:34)
- **Verbatim accuracy.** "ARE YOUU SURE prd.c1v.ai DOESN'T DISPLAY ANY ARTIFACTS? WTF IS WRONG WIHT YOU?" (02:31) — I had asserted without verifying. Course-correction was sharp.
- **No liberties with UI/CSS.** Per auto-memory: *"NO LIBERTIES with CSS/design. David designs in Relume/Figma/Webflow. Claude copies exactly."* UI freeze is strict.
- **No scope-doubt or mini-MVPs.** Per auto-memory: *"David specs to the millimeter, agent swarms fill in code. Do not propose MVP cuts."*
- **Plans before action.** Per auto-memory: no TaskCreate/code/commits until plan is reviewed.
- **Math-grounded recommendations.** Cost curves, tail-latency, Pareto, sensitivity, availability — all have to be concrete numbers traceable to KB-8 Atlas, not LLM hallucinations.

---

## 8. Recommended first actions for a fresh Claude

1. **Read `plans/c1v-MIT-Crawley-Cornell.v2.md` in full** — it's the authoritative spec.
2. **Read this handoff doc in full** — for David's quotes + decision rationale.
3. **Do NOT spawn any agent.** Five rulings (R-v2.1 through R-v2.5) block dispatch.
4. **Ask David which open ruling to resolve first**, or what next step he wants (e.g., draft one of the 5 rulings, refine a specific team's prompt, audit whether `plans/research/crawley-book-findings.md` has gaps for §0.2.4 Crawley patch matrix, etc.).
5. **If David says `/dispatch-v2`** — STOP and re-verify all 5 rulings have answers. Do not infer defaults silently.
6. **If David wants to tweak the v2 doc** — edit `plans/c1v-MIT-Crawley-Cornell.v2.md` in place; this handoff stays as-is (historical record).

---

## 9. Anti-patterns to avoid (based on this session's mistakes)

- **Don't claim features "don't exist" without reading the actual code.** I said prd.c1v.ai shipped no system-design artifacts based on the CLAUDE.md deployed-features list. It ships 5 routes and 13 section components. Always walk `app/` and `components/` before asserting absence.
- **Don't silently resolve open decisions.** When David said "I don't know help me understand more" — I helped explain, then re-asked. Don't invent a choice he didn't make.
- **Don't skip verifying that documents cited by the user exist and contain what's claimed.** Read METHODOLOGY-CORRECTION.md, `v3_revised/README.md`, `kb-upgrade-v2/module-2-requirements/requirements_table.json`, etc. before synthesizing.
- **Don't propose Pass-1/2/3 relabeling** — David explicitly rejected this. Use wave gates + module-splits to achieve the same flow benefit.
- **Don't create new tasks in cleo during brainstorming.** Per David's memory rule: plan before action. Only cleo after plan is approved.
- **Don't commit anything without explicit request.** This session produced 2 files (`v2.md` + this handoff) — both by explicit request.

---

**END OF HANDOFF.** Fresh Claude session: start by reading §1 (TL;DR), then §4 (decisions), then §5 (open rulings). Wait for David's direction.
