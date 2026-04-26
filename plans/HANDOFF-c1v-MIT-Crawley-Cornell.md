# Handoff — Reviewing `plans/c1v-MIT-Crawley-Cornell.md`

> **Purpose:** Give a fresh reviewer (human or agent) everything they need to review the plan without drifting. Read this top-to-bottom before opening the plan file.
> **Target reviewer:** could be a new Claude session, a peer agent, a human on David's team, or David himself after a break. Must produce a useful review in <60 min without asking orientation questions.
> **Created:** 2026-04-21 22:55 EDT
> **Author:** Jessica (M3 FFBD PM role in named-peer swarm)

---

## 0. TL;DR

You are reviewing **`plans/c1v-MIT-Crawley-Cornell.md`**, a pivot plan to convert the c1v.ai system-design pipeline from pure Cornell methodology to a **hybrid**: Cornell front end (intake/scope/requirements/FFBD) + MIT/Crawley decision layer (decision network + form-function mapping) + KB-8 empirical priors + new Module 0 onboarding.

**"Done" for this review =** a severity-tiered findings report (BLOCKER / HIGH / MEDIUM / NIT) against a clear set of criteria (§5 below). Every finding cites plan line numbers. You do not rewrite the plan. You do not spawn agents. You produce review.md findings only.

**The plan has already had 4 prior reviews** (plan-checker, superpowers-code-reviewer, review-skill, security-review). Your job is NOT to duplicate those. See §6 for what's already covered vs what's still open.

---

## 1. Required reading (strict order, no shortcuts)

### 1.1 The plan itself
- [`plans/c1v-MIT-Crawley-Cornell.md`](plans/c1v-MIT-Crawley-Cornell.md) — the target under review. ~590 lines as of 2026-04-21 22:55 EDT.

### 1.2 Pivot plans it directly depends on
- [`plans/kb-runtime-architecture.md`](plans/kb-runtime-architecture.md) — **authoritative backend architecture**. The pivot plan's Crawley math MUST slot into `NFREngineInterpreter` per this doc. G1-G11 gap list absorbed as prerequisite work (per David's approval 2026-04-21 ~19:00 EDT).
- [`plans/public-company-stacks-atlas.md`](plans/public-company-stacks-atlas.md) — KB-8 plan. In-flight. Supplies empirical priors for M4 decision scoring via `mathDerivationSchema.v2.empirical_priors.citations`.

### 1.3 Research ground truth (use these to challenge plan claims)
- [`plans/research/crawley-book-findings.md`](plans/research/crawley-book-findings.md) — Crawley 2015 ToC reconstructed. Ch 14 free PDF + ESD.34 lectures. The plan should NOT treat Crawley as unverified. Full book MD already at `apps/product-helper/.planning/phases/13-.../crawley-sys-arch-strat-prod-dev/System architecture strategy and product development for complex systems.md` (10,051 lines, 604 headings).
- [`plans/research/math-sources.md`](plans/research/math-sources.md) — 15 math formulas with peer-reviewed citations. F11 concept quality flagged as **derived metric** (NOT Crawley). Citations: Stevens/Myers/Constantine 1974 + Bass/Clements/Kazman 2021.
- [`plans/research/zod-frontend-survey.md`](plans/research/zod-frontend-survey.md) — Frontend stack is decided: Zod + react-hook-form + @autoform/react + React Flow + pptxgenjs/exceljs. Mermaid kept for static diagrams. Rejected: tRPC, rjsf, Conform, Zodios, ArkType migration.
- [`plans/research/peer-sync-tools.md`](plans/research/peer-sync-tools.md) — Claude Code v2.1.50+ `--worktree` adopted. claude-peers-mcp kept as messenger. Peer-worktree migration DEFERRED per David's 2026-04-21 ruling.
- [`plans/research/ai-sysdesign-kb-sources.md`](plans/research/ai-sysdesign-kb-sources.md) — KB-9 AI sysdesign pipeline. DSI = docling-serve (IBM). 15 canonical sources. `<$10` one-time ingest cost.

### 1.4 Review reports already completed (do not duplicate)
- [`plans/reviews/c1v-MIT-Crawley-Cornell/gsd-plan-checker.md`](plans/reviews/c1v-MIT-Crawley-Cornell/gsd-plan-checker.md) — 5 BLOCKERS on phase-emission gaps + ruling drift
- [`plans/reviews/c1v-MIT-Crawley-Cornell/superpowers-code-reviewer.md`](plans/reviews/c1v-MIT-Crawley-Cornell/superpowers-code-reviewer.md) — 3 BLOCKERS: B1 envelope cap, B2 phase collision, B3 NFREngineInterpreter bypass
- [`plans/reviews/c1v-MIT-Crawley-Cornell/review-skill.md`](plans/reviews/c1v-MIT-Crawley-Cornell/review-skill.md) — 23 findings, 3 critical, 4 high
- [`plans/reviews/c1v-MIT-Crawley-Cornell/security-review.md`](plans/reviews/c1v-MIT-Crawley-Cornell/security-review.md) — 4 CRITICAL, 6 HIGH security findings

### 1.5 Project conventions (must respect)
- [`apps/product-helper/CLAUDE.md`](apps/product-helper/CLAUDE.md) — tech stack, conventions, dev quirks. Note: **jest not vitest**, test env stubs required, `refine().extend()` drops refinements (use `.innerType().extend().superRefine()`), Drizzle migrations broken (use manual SQL or Supabase SQL Editor), stale `.next` requires `rm -rf .next && pnpm dev`, `.describe("x-ui-surface=...")` convention drives frontend routing.
- [`apps/product-helper/lib/langchain/schemas/module-2/_shared.ts`](apps/product-helper/lib/langchain/schemas/module-2/_shared.ts) — `phaseEnvelopeSchema`, `mathDerivationSchema`, `metadataHeaderSchema` — the base primitives EVERY phase schema extends. Current `mathDerivationSchema.result` is `z.union([z.number(), z.string()])` — scalar-only. Envelope `metadata.phase_number: z.number().int().min(0).max(12)` — THIS IS THE B1 BUG (can't accept "0a" or phase-19).

### 1.6 Supporting artifacts
- [`plans/sys-design-ideation.md`](plans/sys-design-ideation.md) — 12-discriminator rationale + inference rules brainstorm
- [`plans/sys-design-ideation.xlsx`](plans/sys-design-ideation.xlsx) — same content as xlsx with 10 sheets

---

## 2. Product context (c1v.ai scope)

**c1v.ai = product, system, and agent builder** grounded in MIT-Cornell-Crawley methodology. Deterministic, math-based system-design recommendations (not LLM guesswork).

**Core value loop (one prompt, three outputs):**
1. Engineering-grade specs (PRD / architecture doc / decision record with math + KB citations)
2. Spec-perfect code execution (CLI / MCP server / specialized coding agents with Skills)
3. Proactive design improvement (sensitivity-analysis regressions, architectural debt flags)

**Moat sentence (David's own words, sacrosanct):**
> "deterministic LLM system for architecture design, grounded in math, with provenance per decision"

If a reviewer finding would compromise this moat, escalate it to BLOCKER severity regardless of other dimensions.

**Product positioning:** customer-facing, multi-tenant, billing-gated (Stripe). Already shipped. Portfolio piece for David as ML-engineer-architect.

---

## 3. Rulings ledger — what's LOCKED (do not re-litigate)

Chronological, with date + decision + implication.

| Date | Ruling | Source | Implication |
|---|---|---|---|
| 2026-04-21 ~13:00 | Hybrid direction approved (Cornell M1-M3 + M6-M8, MIT/Crawley M4+M5, KB-8 grounding) | David | Pivot plan has green light for hybrid approach. SEBoK full pivot REJECTED. |
| 2026-04-21 ~13:00 | 3×8 submodule reorg approved (3 submodules × 8 KBs = 24 total) | David | Current 14-phase M2/M4 MUST consolidate. Plan §5 phase lists are stale until reorganized. |
| 2026-04-21 ~13:00 | Rebrand Q(f,g) concept quality → **derived metric** | David | Cite Stevens/Myers/Constantine + Bass, NOT Crawley. Scan §5.2, §6.1, §6.4, §9 for stale Crawley attribution. |
| 2026-04-21 ~13:00 | Docling-parse Crawley Ch14/15/16 + 12 ESD.34 lectures | David | Book is ALREADY parsed as MD (10,051 lines). T1 team extracts, does not parse. |
| 2026-04-21 23:29 | KB-8 ingest bootstrap APPROVED — start pgvector ingestion now | David | T2 Stacks Atlas team ready to dispatch. Earlier "hold up" at ~13:00 was a conversational pause, not a ruling; formally reversed 23:29 EDT. Minimum-corpus data-quality gate still stands (M4/M5 wait for ≥20 T1 entries before consuming priors) but ingest itself proceeds. |
| 2026-04-21 ~13:00 | Peer-worktree migration DEFERRED | David | Don't propose worktree-migration tasks in §10 dispatch. Claude Code v2.1.50+ `--worktree` adoption is a V2 concern. |
| 2026-04-21 ~13:00 | PGroonga skipped; tsvector + pgvector hybrid | David | KB-9 ingest uses tsvector for English-biased fulltext. Don't propose PGroonga. |
| 2026-04-21 ~13:00 | TUS protocol deferred to V2 | David | Supabase Storage direct upload for V1. TUS is Migrate/Audit-entry concern. |
| 2026-04-21 ~14:30 | kb-runtime-architecture.md G1-G11 absorbed as §0 Prerequisites | David | Crawley math MUST slot into NFREngineInterpreter. Standalone `DecisionNetworkEngine` class is FORBIDDEN. Timeline extends from 6hr to 10-15hr. |
| 2026-04-21 ~17:30 | LEAVE UI/FRONT-END ALONE FOR NOW | David | **Any finding that proposes frontend work is OUT OF SCOPE for this review cycle.** Flag but don't block. |
| 2026-04-21 ~17:30 | Industry (categorized list) REPLACES Regulatory chips | David | D6 in plan §5.0.3 is Industry with 12 categories; compliance inferred from industry. |
| 2026-04-21 ~17:30 | Signup signal capture: individual vs company email paths | David | Individual = no pre-scrape, company email domain = background Clearbit/LinkedIn enrichment. |
| 2026-04-21 ~19:15 | Module 0 entry patterns: 3 cards (New / Existing / Exploring), NOT 6 | David | New+Exploring → full pipeline; Existing → abbreviated (GitHub repo scan + pain-point picker). Plan §5.0.2 reflects this. |
| 2026-04-21 ~19:15 | Tier 0 intent gates BEFORE Tier 1 discriminators | David | G1 "Need help with decisions?" G2 "Want spec-tight PRD docs?" → 4 route combinations. Plan §5.0.3 reflects this. |
| 2026-04-21 ~19:15 | Rip-and-replace legacy intake UI (NOT fold-and-remap) | David | Plan §5.0.4 "UI strategy" reflects this. Legacy `discriminator-form.tsx` is deprecated. But see UI-freeze ruling above — don't propose frontend BUILD work. |
| 2026-04-21 ~19:45 | Every Tier 1/Tier 2 discriminator is skippable | David | Intake target: <2 min total. Skip → inferred value with confidence badge. |
| 2026-04-21 ~22:30 | Crawley book already parsed; T1 extracts, doesn't parse | David | T1 Crawley KB team has 3 agents (architect/curator/prompt-writer), no parser. |
| 2026-04-21 ~22:30 | Docling MCP NOT wired in current session | Verified by Jessica | Atlas plan §3.6 claim is stale. Use Docling Python CLI subprocess OR WebFetch+html2md for SEC 10-Ks. |

---

## 4. Scope boundary — in vs out for THIS review

### ✅ IN SCOPE
- Math primitives (§6): correctness, completeness, citation quality, `mathDerivationV2` shape
- Module 0 schema layer (§5.0.1 + §5.0.2 + §5.0.3): backend artifact contracts (user_profile.v1, project_entry.v1, intake_discriminators.v1)
- M4 Decision Network rework (§5.1): NFREngineInterpreter integration, envelope collision, phase renumbering
- M5 Form-Function rework (§5.2): derived-metric rebrand, Crawley content mapping to phase files
- Flexibility Contract (§8): `project_run_state.v1` + envelope extensions
- §10 Execution dispatch gaps (synthesizer, Crawley docling, BUILD ALL, Drizzle migration, MEMORY.md closeout)
- §11 Risks stale vs live status
- §12 Exit Criteria testability
- Convention compliance (`refine().extend()` footgun, x-ui-surface, jest-not-vitest)
- Security findings already surfaced in security-review.md — check propagation into plan

### ❌ OUT OF SCOPE (DO NOT PROPOSE)
- Frontend component work (`components/onboarding/*`, decision-network-viewer, form-function-matrix, Pareto chart, etc.) — **David froze UI**
- Peer-worktree migration — deferred
- PGroonga adoption — rejected
- TUS protocol — deferred
- Module 0 UI components (new-product-form.tsx, existing-product-form.tsx, explore-form.tsx) — UI freeze
- Customer-data migration schemes — all customers are internal test per David
- SEBoK-style methodology expansion (FMEA v1/v2, N2 matrices, alternatives-as-first-class) — rejected
- "Self-application" framing (rephrased as "then run it on c1v") — cosmetic
- Team tooling alternatives (deer-flow, OpenHands, Hermes) — decided on `--worktree` + claude-peers-mcp, deferred

---

## 5. Review criteria — what "acceptable v3" looks like

Your review should surface gaps against these criteria. Severity guidelines below.

### 5.1 Correctness
- Every math claim traceable to `plans/research/math-sources.md` or has clear internal-derivation rationale
- Every Crawley attribution traceable to `plans/research/crawley-book-findings.md` with chapter/section reference
- Every schema change compatible with `apps/product-helper/lib/langchain/schemas/module-2/_shared.ts` conventions
- No standalone engines that bypass `NFREngineInterpreter` (per kb-runtime-architecture.md)

### 5.2 Completeness
- Every §4 end-state artifact has a §10 dispatch task
- Every §12 exit criterion has a verification command (`pnpm tsx <path>` / `curl <endpoint>` / jest path)
- Every ruling from §3 of this handoff is reflected in the plan text
- §11 risks are current (R1/R6 closed, R7+ added for post-review findings)

### 5.3 Consistency
- Module count same across §3, §4, §5, §10 tables (should be 8 modules + Module 0 = 9 module counts across plan)
- Artifact list in §4 matches schema files proposed in §5
- Timeline in §1 matches dispatch table in §10 matches Gantt in §7.5
- File path references correct (`apps/product-helper/lib/langchain/schemas/...` not `lib/langchain/...`)

### 5.4 Convention compliance
- Zod pattern matches existing M2 convention (extends phaseEnvelopeSchema, `.describe("x-ui-surface=...")` on every field, Zod field names snake_case, Type exports PascalCase)
- Drizzle tables include RLS policies for multi-tenant isolation
- New agents match existing pattern at `apps/product-helper/lib/langchain/agents/*.ts`
- Import paths use the monorepo layout

### 5.5 Security (already covered by security-review.md, cross-check propagation)
- KB-8 ingestion has domain allowlist + SSRF guard + NDA screen
- RAG prompt injection mitigations present
- Supply chain pinned (Docling container SHA, Python deps)
- Tenant isolation on new Drizzle tables
- Export pipeline (pptxgenjs/exceljs) sanitization — NOTE: out of scope if UI freeze covers exports
- decision_audit schema has model_version + kb_chunk_ids + hash_chain_prev

### 5.6 Severity guidelines

| Severity | Threshold | Example |
|---|---|---|
| BLOCKER | Would compromise the moat OR fail to compile OR break shipped consumer | Standalone DecisionNetworkEngine bypassing NFREngineInterpreter |
| HIGH | Material semantic/structural error that causes silent drift | Module count mismatch across sections; stale ruling not propagated |
| MEDIUM | Clarity/ambiguity that would slow execution | Untestable exit criterion; missing dispatch row |
| NIT | Stylistic or cosmetic | Typos, inconsistent formatting, dead prose |

---

## 6. What prior reviews already caught — don't duplicate

| Finding | Source review | Status |
|---|---|---|
| B1 envelope cap `.max(18)` blocks phase-19 | superpowers-code-reviewer | Pending v3 fix |
| B2 phase-17-sensitivity collides with shipped dm_to_qfd_bridge.v1 | superpowers-code-reviewer | Pending v3 fix |
| B3 Crawley math bypasses NFREngineInterpreter | superpowers-code-reviewer | Ruled: adopt kb-runtime G1-G11. Pending plan §0 Prerequisites addition |
| synthesizer (architecture_recommendation.v1) has no §10 task | plan-checker | Pending v3 fix |
| project_run_state.v1 has no §10 task | plan-checker | Pending v3 fix |
| "Derived metric" rebrand not propagated through §5.2/§6/§9 | plan-checker | Pending v3 sweep |
| 3×8 submodule reorg not applied to §5 | plan-checker | Pending v3 rewrite |
| KB-ingest status in §10 dispatch | plan-checker | Ingest APPROVED 23:29 EDT — v3 should reflect active-ingest status, not HELD. Minimum-corpus gate (≥20 T1 entries) still applies to M4/M5 prior consumption. |
| Crawley docling track approved but unallocated to §10 | plan-checker | Pending v3 fix |
| R1 (Crawley ToC) + R6 (React Flow ruling) stale | review-skill | Pending v3 close |
| §12 exit criteria untestable (no commands) | all reviewers | Pending v3 add verification commands |
| M5 missing Crawley Ch 6, 7, 8 content (Solution-Neutral Function, non-1:1 mapping, concept expansion) | review-skill | Pending v3 add phases |
| OPM should be cross-cutting not dedicated phase | review-skill | Pending v3 restructure |
| `refine().extend()` footgun not acknowledged | review-skill | Pending v3 convention note |
| Module count 8 vs 9 inconsistency | review-skill | Pending v3 reconcile |
| F1-F4 security CRITICAL (KB-8 ingestion, prior poisoning, RAG injection, supply chain) | security-review | Pending v3 §0 security gates |
| No RLS on project_run_state | security-review | Pending v3 Drizzle schema |
| decision_audit missing model_version / kb_chunk_ids / hash_chain_prev | security-review | Pending v3 schema update |

**Reviewer rule:** finding these again doesn't add value. Only flag if you see a NEW angle on them (e.g., "B1 envelope fix also needs to update M2 migration path — not covered above"). Otherwise skip.

---

## 7. Open questions David has NOT answered

1. **Dual-emit `decision_matrix.v1` during M4 transition** — acceptable, or clean cutover? M4 preload endpoint + agent are live today. No ruling yet.
2. **KB-8 readiness threshold for M4/M5 prior consumption** — ingest itself is unblocked (23:29 EDT). Remaining question: can M4/M5 consume placeholder priors while corpus grows to ≥20 T1 entries, or must they wait for the corpus gate?

Reviewers MAY surface additional decision-needed questions if your review reveals them, but DO NOT re-ask questions David has already ruled on (§3 above).

---

## 8. Current code state (grounded)

| Layer | Path | Status |
|---|---|---|
| M1 Defining Scope | KB only at `.planning/phases/13-.../1-defining-scope-kb-for-software/` | No Zod |
| M2 Dev Sys Reqs | `apps/product-helper/lib/langchain/schemas/module-2/` — 14 phase files, ~4K LOC | ✅ Shipped |
| M3 FFBD | `apps/product-helper/lib/langchain/schemas/module-3/` — 3 files (0a, 6, 11) | Gate B shipped, Gate C (8-9 remaining) pending |
| M4 Decision Matrix | `apps/product-helper/lib/langchain/schemas/module-4/` — 14 phase files, 1,767 LOC | ✅ Shipped (flat matrix; pivot needs rework) |
| M5 HoQ/QFD | — | Empty. Only M4 phase-17-dm-to-qfd-bridge exists. |
| M6 Interfaces | — | Empty |
| M7 Risk | — | Empty |
| KB-8 Public Stacks Atlas | Plan at `plans/public-company-stacks-atlas.md` | In flight, ingest APPROVED 2026-04-21 23:29 EDT. T2 team ready to dispatch. |
| Crawley book (T1 source) | `apps/product-helper/.planning/phases/13-.../crawley-sys-arch-strat-prod-dev/System architecture strategy and product development for complex systems.md` | Parsed (10,051 lines, 604 headings), artifacts folder w/ images |
| kb-runtime-architecture components | None in code — all greenfield per §5 of kb-runtime-architecture.md | 5-7 days of infra work pending |
| Module 0 components | None in code | Entirely new |
| Agents | `apps/product-helper/lib/langchain/agents/` — intake, extraction, ffbd, decision-matrix, qfd, interfaces, tech-stack, schema-extraction, api-spec, user-stories, infrastructure, guidelines | M4 agent needs rewrite; form-function, discriminator-intake, signup-signals, stacks-atlas-ingestion, synthesizer, build-all — NEW |
| Frontend | `app/(login)/sign-up/`, `app/(dashboard)/projects/new/`, `components/onboarding/*` | **UI FROZEN — out of scope for v3** |

---

## 9. Team dispatch (for reviewer context, not review target)

Reviewer doesn't review this, but knowing the execution plan helps calibrate "is this plan dispatchable?"

8 teams proposed across 2 waves (see plan §14 when it lands, or current §13 working draft):

**Wave 1 (parallel, no inter-team deps):**
- T1 `c1v-crawley-kb` — 3 agents — extract Crawley book content into KB destinations
- T2 `c1v-kb8-atlas` — 3 agents — build KB-8 Public Stacks Atlas (HELD pending David unhold)
- T3 `c1v-runtime-prereqs` — 5 agents — build NFREngineInterpreter + kb-runtime G1-G11
- T8 `c1v-reorg` — 4 agents — execute 3×8 submodule reorg

**Wave 2 (consumers of Wave 1 outputs):**
- T4 `c1v-m3m4` — 4 agents — fix B1/B2/B3 + finish M3 Gate C
- T5 `c1v-m5-formfunction` — 3 agents — build M5 + rebrand derived metric
- T6 `c1v-synthesis` — 4 agents — synthesizer + project_run_state + BUILD ALL + plan §10/§11/§12 updates
- T7 `c1v-module0-be` — 4 agents — Module 0 backend only (schemas + Drizzle + agents, NO frontend)

Total: **8 teams, ~30 agents**.

---

## 10. Anti-drift checklist — reviewer must NOT

- [ ] Propose SEBoK analogues (FMEA v1/v2, N2 matrices, alternatives-as-first-class)
- [ ] Revive "self-application" framing; David renamed to "run it on c1v"
- [ ] Re-litigate Cornell vs SEBoK vs MIT/Crawley — hybrid is DECIDED
- [ ] Add frontend component findings (UI frozen)
- [ ] Propose PGroonga or tRPC or rjsf or Conform
- [ ] Propose TUS upload protocol for V1
- [ ] Propose peer-worktree migration
- [ ] Add features beyond the 12 end-state artifacts in §4
- [ ] Propose docling-serve MCP (David's plan says MCP; reality = Python CLI subprocess — flag as correction)
- [ ] Propose 6-entry-pattern (New/Exploring/Migrate/Scale/Audit/Post-mortem) — David chose 3 (New/Existing/Exploring)
- [ ] Add >5 Tier-1 discriminators — David locked top-5 (D0, D4, D6, D7, D8)
- [ ] Assume Crawley book needs parsing (it's already parsed)
- [ ] Propose `DecisionNetworkEngine` as standalone class (must slot into NFREngineInterpreter)
- [ ] Flag "Q(f,g) is Crawley's formula" — it's a DERIVED metric citing Stevens/Myers/Constantine
- [ ] Add review findings that duplicate §6 of this handoff
- [ ] Ask David to rule on questions in §7 of this handoff as part of the review (surface them as "unresolved," don't gate on them)
- [ ] Spawn agents or apply edits — review output is findings.md only

---

## 11. How to write the review

**Output shape:** a new file at `plans/reviews/c1v-MIT-Crawley-Cornell/<reviewer-name>.md` with this structure:

```markdown
# Review — c1v-MIT-Crawley-Cornell.md
## Reviewer: <name/role>
## Date: <ISO>
## Verdict: [APPROVED | APPROVED WITH CHANGES | BLOCKED FOR REWORK]

## Summary (3-5 sentences)

## Findings

### BLOCKER (severity 1)
[finding] — [plan line ref] — [rationale]

### HIGH (severity 2)
...

### MEDIUM (severity 3)
...

### NIT (severity 4)
...

## Changes required for v3 revision
[Bulleted checklist]

## Questions not ruled on
[Anything needing David's ruling before v3 can close]
```

**Length target:** 300-800 words. Dense > verbose. Skip findings already in §6 of this handoff unless you have a new angle.

**One-pass rule:** read everything in §1 before starting review. Do not iterate back to the plan mid-review to "check one more thing" — produces drift. Take notes while reading, then write the review from notes.

**Neutrality rule:** you are not David's yes-person. If §3 rulings conflict with the moat, flag it. But don't re-litigate rulings that are internally consistent.

---

## 12. Escalation paths

| If you find... | Escalate to... |
|---|---|
| A contradiction between two §3 rulings | David (surface in review's "Questions not ruled on") |
| A moat-compromising issue | David (BLOCKER tier in findings) |
| A plan inconsistency you can't resolve without reading more code | Bond (coordinator) — request code inspection, don't guess |
| A new security finding not in security-review.md | David (CRITICAL severity, surface immediately) |
| Ambiguity that can be resolved by reading one of §1.2-§1.5 docs | Read it yourself — don't ask |

---

## 13. Reviewer metadata template

When your review file is done, put this at the top:

```yaml
---
reviewer: <name>
spawn_time: <ISO>
duration_min: <int>
docs_read: [plan, kb-runtime-architecture, crawley-book-findings, math-sources, zod-frontend-survey, peer-sync-tools, ai-sysdesign-kb-sources, 4-prior-reviews]
findings_count: {blocker: N, high: N, medium: N, nit: N}
verdict: <APPROVED | APPROVED-WITH-CHANGES | BLOCKED>
---
```

---

## 14. TL;DR for impatient reviewers

1. Read `plans/c1v-MIT-Crawley-Cornell.md` top to bottom
2. Cross-check against rulings in §3 of this handoff
3. Cross-check against research docs in §1.3 for math + Crawley + frontend-stack ground truth
4. Find gaps against §5 criteria
5. Skip anything already caught in §6 unless new angle
6. Write findings.md in §11 shape
7. Stop. Don't rewrite plan. Don't spawn agents. Don't apply edits.

**If you go sideways, stop and re-read this handoff.**

---

*Handoff doc v1. Jessica wrote it. David approved the scope. If you're reading this, you're in the hot seat.*
