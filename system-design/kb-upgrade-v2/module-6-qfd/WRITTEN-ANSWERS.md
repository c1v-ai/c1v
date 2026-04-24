# c1v — Module 5 (QFD House of Quality) Written Answers

> Per CESYS525 QFD assignment (3 Part-1 + 4 Part-2). Authored for the c1v Dual-Mode Platform (winning concept from Module 4, score 0.662).

---

## System Description (≤ 250 words)

**c1v is an AI-native workbench that turns one-sentence product ideas — or existing code — into enterprise-grade engineering specs and CLI commands.** The Module 5 House of Quality evaluates the **Dual-Mode** winning concept from Module 4: customers choose at onboarding between **SOTA Cloud** (default, Claude on c1v infrastructure) and **Privacy Local** (opt-in, local LLM on customer infrastructure). Both modes honor the four architectural non-negotiables: 100% metric traceback coverage, ≤2% default-mode overhead on customer production systems, 60-min feedback-loop latency from metric deviation to recommendation, and cross-provider LLM portability. The HoQ's six Performance Criteria were carried forward from Module 4 without modification (weights `0.20/0.20/0.20/0.16/0.12/0.12` sum to 1.00). The 18 Engineering Characteristics span five subsystems: customer-system probing (EC1-4), LLM architecture (EC5-8), metric traceback (EC9-11), spec generation + delivery (EC12-14), and UX + operational hygiene (EC15-18). The QFD's job is to (a) expose the PC↔EC design tensions, especially the probe-frequency vs aggregation-window tradeoff and the context-size vs traceback-coverage tradeoff, and (b) lock 13 still-Estimate constants from M4 into Final design targets. Competitors Devin (Cognition) and Cursor (Anysphere) were chosen as the closest category-adjacent products; neither implements the customer-system-observation side of c1v's architecture, so their back-porch scores collapse to 1 on PCs 2 and 5 but expose a real UX gap on PC.6 (intake responsiveness) where Cursor's IDE-embedded model beats c1v's web-streaming architecture.

*(Word count: 238)*

---

## Part 1 — Core QFD Answers

### Q1. How did you determine the relative importance weights?

The six PC weights were inherited directly from Module 4's decision matrix handoff and were **not re-rated in Module 5** — a deliberate choice to preserve continuity with the module that scored the alternatives. The weights were originally established via the KB anti-bias rule: **rate each PC 1–5 for importance before seeing any competitive or relationship data, then normalize**. Raw ratings: `PC.1=5, PC.2=5, PC.3=5, PC.4=4, PC.5=3, PC.6=3` (sum 25). Dividing gives `0.20 / 0.20 / 0.20 / 0.16 / 0.12 / 0.12`, which sums to 1.00 exactly (no drift adjustment required).

The triple tie at 0.20 among non-invasiveness, feedback latency, and traceback coverage reflects the M1 hard constraints: all three are either expressed as hard rejection thresholds (`MAX_CUSTOMER_SYSTEM_OVERHEAD_PCT = 2%`, `TRACEBACK_COVERAGE_PCT = 100%`) or anchor constants (`AGGREGATION_WINDOW_MIN = 60`). Violating any of them kills the product value. Spec-generation time (PC.4) is one tier down because a slow but correct spec is still usable, whereas a fast spec without traceback is worthless. CLI emission and intake responsiveness (PC.5, PC.6) sit at 0.12 because they are user-experience polish on top of the correctness guarantees — important for adoption, not existential. This ordering was also validated in M4's sensitivity analysis: perturbing any weight by ±20% preserved the winning concept in 8 of 9 perturbations, so the weights are stable inputs for QFD.

---

### Q2. Pick one EC-to-EC interaction in the roof and explain it.

**EC9 Traceback cache TTL ↔ EC11 Vendor-doc refresh cadence (roof cell M13 = −2).**

This is the strongest negative interaction in the entire roof and the QFD's single most important tradeoff to surface. Both ECs live in the traceback subsystem, which is what makes PC.3 (Traceback Coverage, weight 0.20) achievable at 100%. They pull in opposite directions:

- **EC9 (TTL ↑ helps)**: a longer cache TTL means a recommendation emitted today can cite a vendor doc that c1v fetched a week ago without re-hitting the vendor's docs endpoint. This improves PC.4 (spec-generation time) and reduces third-party API cost.
- **EC11 (refresh cadence ↓ helps)**: a shorter refresh cadence means citations are always current. Vendor SLAs, pricing, and feature matrices change frequently; stale citations silently erode PC.3's value (the traceback resolves, but to outdated material).

The −2 encodes the fact that these two knobs cannot both be pushed to their ideal settings simultaneously — stretching the TTL to 720 h (30 days) while refreshing vendor docs every 24 h is wasteful; refreshing daily while caching for a week means 85% of cached citations are stale by definition.

**Resolution in design targets**: the HoQ target for EC9 is **24 hours** and EC11 is **7 days**. This encodes the rule "cache any given citation for at most one day, and refresh the vendor-doc corpus once per week" — the two cadences rhyme rather than conflict. Module 6 (Interfaces) will carry this as a coordination constraint between the traceback cache and the vendor-doc fetcher — both must be invalidated together when a refresh completes.

---

### Q3. Name a competitor that outperforms c1v on at least one PC and explain why.

**Cursor (Anysphere) outperforms c1v on PC.6 — Founder Intake Responsiveness (Cursor 5 vs. c1v A(target) 3).**

c1v's intake is a web-streaming conversation: each founder turn is posted from the browser to a Next.js route handler, which invokes LangGraph's intake agent, which calls Anthropic's API, which streams chunks back through the route handler to the browser. End-to-end, that's five network hops for every token. Even with prompt caching (EC7 target 70%) and trimmed context windows (EC8 target 8000 tokens), 2000 ms per turn is the honest target.

Cursor's architecture is radically shorter. The AI runs inside the IDE process; context is the open file(s) you're already editing (zero network fetch); the LLM call is a single hop to Anthropic/OpenAI and responses stream directly into the editor. A measured turn is typically 500–1500 ms. That's a 2–4× responsiveness advantage that is **structural**, not a code-quality gap c1v can close — it's the difference between web-hosted and IDE-embedded.

**What c1v gives up and gains**: Cursor's win on PC.6 is bought with trade-offs on PC.3 (Cursor's "cite sources" is best-effort, ~20–30% coverage) and PC.5 (Cursor has no concept of a signed, standalone CLI bundle — it edits files in place). Cursor also scores zero on PC.2 (no customer-system probing) and PC.1 is trivially 5 (nothing to probe, nothing to overload). The honest QFD reading: **c1v's structural choice is intake-responsiveness↔traceback-depth**. Cursor chose responsiveness; c1v chose traceback. The product surfaces are different enough that this is not a like-for-like comparison — but on the narrow PC.6 measurement, Cursor wins, and the MCP server road-map (see §M6 handoff) is the credible path to closing the gap by letting c1v run inside the IDE via the same protocol Cursor uses.

---

## Part 2 — Design-Targets Answers

### Q4. How did competitor EC values influence your design targets?

Competitor values fall into two camps, and they shaped targets differently:

**Camp 1: ECs where competitors have no value (N/A).** Probing (EC1–EC4), traceback (EC9, EC11), spec-generation pipeline (EC12–EC14), and operational hygiene (EC17, EC18) are all features Devin and Cursor do not implement. For these 11 ECs, the design target was driven by c1v's own requirements (M1 constraints, M2 constants, M4 sensitivity analysis) and competitor values gave **zero pull**. The QFD's back-porch score difference on PC.1 (c1v A(target) = 4; competitors = 5) is a deliberate acknowledgement that c1v *chose* to take an invasiveness hit in exchange for the feedback loop PC.2 and PC.3 enable — and that no target-tightening exercise changes that tradeoff.

**Camp 2: ECs where competitors have meaningful values.** Context-window size (EC8), prompt-cache hit rate (EC7), and intake turn budget (EC15) are industry-measurable. Devin's estimated 16,000-token typical context was read as "room to reduce"; c1v's 8,000-token target takes a deliberate context-trimming position that improves PC.6 and PC.4 without compromising PC.3 (citations are stored separately via EC9). On EC15, **Cursor's 800 ms measurement pulled c1v's target downward** — c1v's published PC.6 budget was 2000 ms, but after seeing 800 ms is achievable with an IDE-embedded architecture, M5 preserved the 2000 ms target for the web flow and added a 1500 ms stretch goal (reflected in A(high) = 4). This is the QFD's most direct target-change driven by competitor data.

On EC7 (prompt-cache hit rate), c1v's 70% target is higher than Cursor's estimated 60% and Devin's 50%. Claude's prompt-caching primitive is more aggressive than OpenAI's, and c1v's conversation-threading model makes the same system prompt apply across many turns — so 70% is reachable without architectural change.

---

### Q5. How did cost and technical difficulty influence your design targets?

The highest-imputed-importance ECs (from basement row 50) sorted by imputed importance are:

| Rank | EC | Imputed | Difficulty | Cost | Target |
|---:|---|---:|:-:|:-:|---|
| 1 | EC8 Context tokens per agent call | 1.00 | 2 | 1 | 8000 |
| 2 | EC7 Prompt-cache hit rate | 0.96 | 3 | 2 | 70 % |
| 3 | EC1 Probe frequency | 0.80 | 2 | 2 | 6/min |
| 4 | EC10 Citation completeness floor | 0.76 | 4 | 3 | 100 % |
| 5 | EC6 Parallel agent dispatch | 0.64 | 3 | 4 | 5 agents |

The re-evaluation step after seeing difficulty and cost produced **three deliberate target moves**:

1. **EC10 softened from "always" to "100% as hard floor" semantics.** Citation completeness has the highest *positive* imputed importance among the high-difficulty ECs. Pushing it to 100% with zero tolerance was rated difficulty 4 / cost 3 — expensive but non-negotiable because PC.3 is a hard constraint. Target stays at 100%, but the implementation accepts that any spec that *cannot* achieve 100% citation is **rejected** rather than emitted with a gap, keeping the difficulty scoped to "refuse to emit" rather than "always succeed."
2. **EC6 capped at 5 parallel agents despite positive imputed.** Parallel dispatch is the cheapest numerical way to improve PC.4 and PC.6, but cost = 4 (LLM token burn scales linearly with agent count). The target of 5 is a product-economics choice: at 5 concurrent agents a Quick Start pipeline costs ~5× a single-thread pipeline, which is within the free-tier 1,250-credit budget. Pushing to 10 would exit the free tier and compromise adoption.
3. **EC17 held at 90 d despite security hygiene instinct.** Credential rotation at 90 d is below most SOC 2 baselines (60 d is common). The QFD roof shows no tradeoff; difficulty = 2; cost = 2. Nevertheless the target stays at 90 d because M4 D3 deferred compliance to v2, so tightening to 60 d prematurely would commit engineering effort with no v1 business value.

**ECs where low difficulty + low cost invited aggressive targets**: EC12 Spec artifact format count (difficulty 1 / cost 1) was set to **1** — Mermaid-only in v1 — which is actually the *loosest* setting but the most aggressive simplification choice. EC18 Audit retention (difficulty 1 / cost 2) is a hygiene target at 90 d.

**Key-risk flag**: the only EC with both high imputed importance (≥0.7) and high difficulty+cost (sum ≥7) is **EC10 Citation completeness floor** (0.76 / 4 / 3 = 7). This is the project's Module-5 call-out risk: achieving 100% citation coverage across every recommendation c1v emits, across every vendor doc source, is the single hardest and most expensive engineering commitment locked by the QFD.

---

### Q6. How did positive vs. negative imputed importance influence your design targets?

The basement reveals three distinct EC profiles that drove target decisions:

**Profile A — Purely positive imputed (positive = total, negative = 0).** ECs with no negative marks on the main floor can be pushed to their ideal without collateral damage: EC7 Prompt cache (0.96 / 0.76 pos / −0.20 neg), EC6 Parallel dispatch (0.64 pos / 0 neg), EC12 Format count (0.44 pos / 0 neg). For these, the target tracks the direction-of-change arrow as far as cost and difficulty allow. EC12 collapsed from "multi-format v1" to Mermaid-only specifically because the QFD showed zero negative blowback.

**Profile B — High positive AND high negative (contested ECs).** EC1 Probe frequency (0.80 total, 0.40 pos / 0.40 neg), EC8 Context tokens (1.00 total, 0.60 pos / 0.40 neg), and EC5 LLM routing granularity (0.48 total, 0.16 pos / 0.32 neg) all have meaningful negatives. These are the ECs whose targets are **compromises, not optima**. EC8's target of 8,000 tokens, for example, sits between the latency-optimal 4,000 tokens (hurts PC.3 traceback) and the coverage-optimal 16,000 tokens (hurts PC.4 and PC.6). The negative imputed importance column literally told me "you cannot push this to either extreme without hurting a 0.20-weighted PC." Target moved to the middle.

**Profile C — Negative-dominant or zero.** EC17 Credential rotation (0.00 pos / −0.12 neg) and EC18 Audit retention (0.00 total) are ECs where the QFD says **"this knob has no meaningful leverage on the scored PCs."** Target decisions here are driven by external constraints, not QFD math — EC17 by security hygiene (90 d), EC18 by M4 D3 (90 d operational-only in v1). Keeping them in the second floor is an honesty choice: the HoQ documents that these are design decisions the QFD did **not** drive, so they can be revisited in Module 6 or in v2 compliance work without breaking the M5 argument.

The net effect on targets: **Profile A ECs got aggressive targets, Profile B ECs got middle-of-range compromise targets, and Profile C ECs are explicitly flagged as "not optimized by this QFD."** This is what the KB means by "let imputed importance be the lens."

---

### Q7. What additional research would you want to do?

Five gaps, ranked by their risk to the QFD's conclusions:

1. **Measured competitor prompt-cache hit rates and context-window distributions.** The 50% (Devin) and 60% (Cursor) numbers are industry-estimate, not measured. A 20-point error in either direction flips EC7's and EC8's competitive score and could change whether c1v's 70% target is aggressive or conservative. Proposed method: observe both products over 50-turn sessions with matched prompts, log TTFB + token counts, compute cache-hit estimates from latency deltas.
2. **Live probe-overhead measurements on representative customer infrastructure.** The 2% overhead ceiling (PC.1 hard constraint) is derived from architecture assumptions, not measured. We need to deploy the probe SDK on a beta customer's production stack — ideally three shapes (serverless, containerized, traditional VM) — and measure actual CPU/memory deltas at the EC1/EC2/EC3 target values. If the real overhead is ≥3%, EC1 and EC3 targets must tighten further.
3. **Feedback-loop latency under realistic metric dispersion.** The 60-min PC.2 target assumes metric deviations arrive cleanly. Production observability systems have bursty, noisy, out-of-order metric streams. Simulating c1v's aggregation window + recommendation cadence against a replayed production metric tape (SRE-style) would either confirm 60 min is comfortable or reveal we need a tighter EC2 target.
4. **Founder-user-testing on intake responsiveness perception.** The ms numbers (EC15, EC16) are engineering targets; the PC.6 score is *perception*. We should run a 20-founder usability study that measures perceived responsiveness against actual turn-time — humans often rate 3000 ms streaming as faster than 2000 ms non-streaming, which would change EC16's target.
5. **Traceback-citation durability over vendor-doc churn.** EC9/EC11 was set by reasoning, not by measurement of how often real vendor docs change. A six-month log of doc revisions across our top-20 vendor sources (AWS, Stripe, Twilio, Anthropic, etc.) would tell us whether 7-day refresh is correct, too aggressive (wasteful), or too loose (stale citations).

Items 1, 3, and 4 are the only ones whose results could materially alter Module 5 targets; items 2 and 5 would refine but not invalidate the current design.

---

## Summary of constants locked by M5

| Constant | Value | Driver |
|---|---:|---|
| `PROBE_FREQUENCY_PER_MIN` | 6 | EC1 target |
| `AGGREGATION_WINDOW_MIN` | 60 | EC2 target (confirms M2 value) |
| `METRIC_PAYLOAD_KB_MAX` | 4 | EC3 target |
| `PROBE_BATCH_SIZE` | 50 | EC4 target |
| `PARALLEL_AGENT_DISPATCH` | 5 | EC6 target |
| `PROMPT_CACHE_HIT_TARGET_PCT` | 70 | EC7 target |
| `AGENT_CONTEXT_TOKENS_MAX` | 8000 | EC8 target |
| `TRACEBACK_CACHE_TTL_HOURS` | 24 | EC9 target |
| `VENDOR_DOC_REFRESH_DAYS` | 7 | EC11 target |
| `SPEC_FORMAT_COUNT_V1` | 1 | EC12 target (Mermaid only; confirms M4) |
| `QUICK_START_STEP_COUNT` | 5 | EC13 target |
| `CLI_BUNDLE_SIZE_MB_MAX` | 5 | EC14 target |
| `STREAMING_CHUNK_CADENCE_MS` | 50 | EC16 target |

13 constants promoted to Final in M5, on top of the 8 already Final from M2 + M4.
