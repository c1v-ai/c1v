# c1v v2.2.1+ QA

## What This Is

c1v (`prd.c1v.ai`) is an AI-native product requirements and systems-engineering tool. It guides users through a 6-step conversational intake methodology (Context Diagram → Use Case Diagram → Scope Tree → UCBD → Functional Requirements → SysML Activity Diagram), then automatically generates 14 structured artifacts across two phases: Phase 1 produces the 6 core KB artifacts from conversation; Phase 2 auto-triggers generation of an FFBD, Decision Network, Form Function Map, House of Quality (QFD), FMEA (Early + Residual), N2 Matrix, and Interfaces Diagram. Finally, a synthesis step runs system-design math against an Atlas of public company data (Anthropic, Supabase, LangChain, Vercel empirical priors) to produce a ranked architecture recommendation with Pareto alternatives and cost/latency/availability projections. v2.2.1 is live with no users/traffic. This project is the QA pass to make it ready for real users.

## Core Value

The intake conversation must surface actors and constraints well enough that downstream synthesis agents can generate non-trivial NFRs, engineering constants, and system-design artifacts — otherwise the product fails its core promise.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Intake chat correctly surfaces actors and constraints from user input
- [ ] Downstream synthesis agents (NFR, engineering constants) have sufficient upstream context to generate artifacts
- [ ] CI pipeline passes cleanly (lint, type-check, test)
- [ ] pgvector Phase B ingest dedup bug resolved — new KB content lands in the table
- [ ] Wave E eval E.1 failure resolved (clarification-detector revert commit traced)
- [ ] Wave E eval E.8 failure resolved (engine JSON count gate corrected to 14)
- [ ] Observability instrumentation wired: `setSentryTransport` called at boot, counter emitting on LLM-only path

### Out of Scope

- New features or product capability changes — pure QA/bug-fix cycle
- HNSW upgrade — deferred (ivfflat is functional, no p95 baseline yet)
- E.13 observability window — waiting on 48h prod traffic post-wiring
- Marketing, landing page, billing changes

## Context

**Main Issue (MAIN ISSUE):** The LangGraph intake chat doesn't predict actors/constraints well enough. Evidence from LangSmith logs: downstream synthesis messages say "I don't have enough upstream context to derive non-functional requirements" and "I don't have enough upstream context to derive engineering constants." Root cause direction from architecture trace:

1. **Soft gate no-ops:** HG7 (success criteria) and HG8 (constraints) are regex-on-vision-string gates that always return `passed: true` — they never block generation despite insufficient constraint data.
2. **Extraction gap:** `outOfScope` is typed in `ProjectValidationData` but the extraction pipeline never populates it; HG1 can never verify the out-of-scope boundary.
3. **kbStepConfidence floor is 0 for Steps 3-6:** `calculateStepConfidence` returns `0` for `ffbd`, `decision-matrix`, `qfd-house-of-quality`, and `interfaces` — LLM-only signal, no deterministic floor. KB confidence override gate is unreliable for Phase 2.
4. **Premature advance:** a project can reach synthesis (score ≥ 95%) with only 2 actors, 5 use cases, 1 external entity, 1 data entity — the bar is low enough that the system advances before the intake collects constraint/NFR-relevant context.

**Architecture reference:** `apps/product-helper/docs/architecture-trace-intake-to-artifact.md` — full data path trace via graphify (3,306 nodes, 4,789 edges).

**CI state (as of commit 40fb453, 2026-05-02):**
- `type-check` now wired in turbo.json — tsc clean
- `lint` broken: no lint script in package.json, no ESLint config
- `markdown-link-check-config.json` missing
- `test:unit` / `test:integration` scripts don't exist (only `test`)
- Two workflow files use `OPENROUTER_API_KEY: stub` which fails env validator (must start with `sk-or-`)

**pgvector state:** 4,990 rows with real embeddings in local Supabase only. Production is likely empty. Phase B ingest on 2026-04-24 returned 0/3289 inserts due to `kb_source + chunk_hash` unique constraint collision. Do not re-run ingest without diagnosing the dedup key collision in `ingest-kbs.ts` first.

**Wave E eval state:** 12/15 ECs pass. E.1 fails (clarification-detector revert commit not found in git log). E.8 fails (14 engine JSONs in `.planning/engines/` but gate expects 13). E.13 deferred (observability instrumentation was never shipped — `setSentryTransport` never called at boot, `synthesis_metrics_total` counter has zero code occurrences).

## Constraints

- **Tech:** Next.js 15, LangChain.js + LangGraph, Anthropic Claude (via OpenRouter), PostgreSQL + Drizzle ORM, Supabase — no stack changes
- **UI Freeze:** System-design viewers, diagram viewer, artifact pipeline are frozen — no edits to those components
- **No migration of agent emitters yet:** Crawley Zod schemas gated at schema-author level; agent emitters still emit pre-Crawley shapes (deferred to future wave)
- **Deployment:** Vercel (orchestration) + Cloud Run (sidecar rendering) — boundary locked per D-V21.24

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Fix actors/constraints issue via intake prompt + extraction tuning | Architecture trace identifies soft gates + extraction gap as root cause; no architectural change needed | — Pending |
| Fix lint by adding `next lint` + ESLint config | Minimal change; Next.js ESLint preset covers the codebase | — Pending |
| Resolve E.8 by updating the count gate to 14 (not deleting the engine JSON) | File was added intentionally; gate is stale | — Pending |

---

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-02 after initialization*
