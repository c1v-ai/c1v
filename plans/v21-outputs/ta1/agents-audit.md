# TA1 Agent fs-side-effects audit (EC-V21-A.0)

**Scope:** `apps/product-helper/lib/langchain/agents/system-design/*-agent.ts` (11 system-design agents) + `apps/product-helper/lib/langchain/agents/architecture-recommendation-agent.ts`.

**Method:** grep for `fs.{write,read,append,mkdir,unlink}`, `writeFile`, `readFile`, `from 'fs'`/`from 'node:fs'`, `require('fs')`, and path helpers.

## Findings

| # | Agent | fs calls | Site | Classification |
|---|-------|----------|------|----------------|
| 1  | data-flows-agent.ts        | none | — | clean |
| 2  | decision-net-agent.ts      | none | — | clean |
| 3  | ffbd-agent.ts              | none | — | clean |
| 4  | fmea-early-agent.ts        | none | — | clean |
| 5  | fmea-residual-agent.ts     | none | — | clean |
| 6  | form-function-agent.ts     | none | — | clean |
| 7  | hoq-agent.ts               | none | — | clean |
| 8  | interface-specs-agent.ts   | none | — | clean |
| 9  | n2-agent.ts                | none | — | clean |
| 10 | nfr-resynth-agent.ts       | none | — | clean |
| 11 | synthesis-agent.ts         | 1 — `readFileSync` | L23 import + L232 in `loadUpstream()` | **script-only** |
| 12 | architecture-recommendation-agent.ts | none | — | clean |

## Detail — synthesis-agent.ts

`loadUpstream(repoRoot, overrides)` (lines 224-243) is a helper that:
- accepts `repoRoot: string` + path overrides,
- iterates `DEFAULT_UPSTREAM_PATHS`,
- reads each upstream artifact JSON via `readFileSync`,
- returns parsed `LoadedUpstream` for the pure builders (`winnerChoicesOf`, `nfrIndex`, `buildTailLatencyBudgets`, …).

**Classification: script-only.** The function is used by `scripts/build-synthesis*.ts` to wire artifact files on disk into the agent. The agent's pure builders (rest of the file) take an already-loaded `LoadedUpstream` object — they do NOT touch fs.

**Verdict for langgraph-wirer:** `loadUpstream()` should NOT be called from the LangGraph node. Instead, the GENERATE_synthesis node receives upstream artifacts via the graph state (already-persisted-to-`project_artifacts`-by-prior-nodes) and feeds the pure builders directly. No agent-internal refactor needed; `loadUpstream` stays in place for the offline `scripts/build-synthesis*.ts` path.

**LOC impact:** 0 — no refactor required. Per R-v2.1.A Option C, `langgraph-wirer` ships a graph-node-adapter wrapper that bypasses `loadUpstream` and constructs `LoadedUpstream` from graph state. The existing function is preserved.

## Summary

- 12/12 agents audited.
- 1 fs call site found (synthesis-agent.ts `loadUpstream`).
- Classification: 1 script-only / 0 shared-utility / 0 requires-refactor.
- **No agent requires the >200 LOC refactor escalation.** Wave A proceeds with R-v2.1.A Option C wrapper pattern.
