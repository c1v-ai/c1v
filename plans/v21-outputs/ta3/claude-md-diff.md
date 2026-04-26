---
status: pending-david-review
target: apps/product-helper/CLAUDE.md
owner: TA3 docs (Wave A)
gate: David authorization required before applying — file-safety rule.
date: 2026-04-25
---

# Proposed `apps/product-helper/CLAUDE.md` additions

Wave-A TA3 added three new code surfaces inside `apps/product-helper/` that future Claudes will hit cold:

1. `lib/billing/synthesis-tier.ts` — free-tier allowance gate (D-V21.10 stub for TB1).
2. `lib/storage/supabase-storage.ts` — signed-URL helper for D-V21.08.
3. `lib/synthesis/{artifacts-bridge,kickoff}.ts` + `app/api/projects/[id]/{synthesize,synthesize/status,artifacts/manifest}/route.ts` — the synthesis kickoff + status surface.

None of these are mentioned in the current CLAUDE.md. The proposal below is **purely additive** — it adds two short subsections + a row to the "Deployed Features" list. It does NOT touch the UI Freeze, conventions, or env-var sections.

Two anchors are used:

- **Anchor A:** insert a new subsection after the "Credit System" subsection, before "## Conventions".
- **Anchor B:** add one row to the "Deployed Features" bulleted list.

---

## Anchor A — insert after the `### Credit System` block

Locate (existing, unchanged):

```markdown
- Credits display: User dropdown shows usage bar (free) or plan name (paid); Account settings page shows Usage & Plan card with progress bar and upgrade/manage CTA

## Conventions
```

Insert between the last `Credits display:` line and the `## Conventions` heading:

```markdown

### Synthesis Pipeline (v2.1 — Wave A shipped Apr 25, 2026)

Vercel-side kickoff + status surface for the Cloud Run sidecar (`services/python-sidecar/`). Boundary locked by **D-V21.24**: Vercel hosts LangGraph orchestration and all LLM calls; the sidecar is per-artifact rendering only.

- **Routes:**
  - `POST /api/projects/[id]/synthesize` — deducts 1000 credits (D-V21.10), idempotent within a 5-min window, pre-creates 7 `synthesis_status='pending'` rows, fires the LangGraph kickoff via Next.js `after()`. Returns 202 with `{synthesis_id, expected_artifacts, status_url}`.
  - `GET /api/projects/[id]/synthesize/status` — per-artifact poll with signed URLs for ready rows. Target < 100ms p95.
  - `GET /api/projects/[id]/artifacts/manifest` — merges legacy filesystem manifest with v2.1 `dbArtifacts`. Versioned via `manifest_contract_version: 'v1'` (canonical contract: `plans/v21-outputs/ta3/manifest-contract.md`).
- **Helpers:**
  - `lib/billing/synthesis-tier.ts` — `checkSynthesisAllowance(teamId)`; Wave-A pre-stub. Env var `SYNTHESIS_FREE_TIER_GATE` = `log_only` (default) | `enabled` | `disabled`. TB1 ships the real DB-backed implementation and flips the default to `enabled`.
  - `lib/storage/supabase-storage.ts` — `getSignedUrl(storagePath, ttl?, cache?)`. 30-day TTL per D-V21.08. Per-request cache is mandatory; module-scoped caches would leak signed URLs across tenants.
  - `lib/synthesis/artifacts-bridge.ts` — TA1 ↔ TA3 indirection over `project_artifacts`. Single-edit point: when TA1's Drizzle queries land, this file collapses to a re-export. `EXPECTED_ARTIFACT_KINDS` is the canonical list (7 kinds; sidecar may emit optional extras).
  - `lib/synthesis/kickoff.ts` — fire-and-forget LangGraph entry. TA1's `langgraph-wirer` owns per-node `POST /run-render` calls.

**Failure semantics:** the sidecar always returns HTTP 200 (per-artifact `ok: false` for failures). The 5xx surface is reserved for malformed requests. Status route degrades gracefully when TA1's queries module is missing — empty `dbArtifacts` rather than a 500.

**Manifest contract version:** if you change the `/artifacts/manifest` response shape, follow the bump rules in `plans/v21-outputs/ta3/manifest-contract.md` §2 — TA2's download dropdown pins to `v1` and breaks loudly on a `v2` shape change.
```

---

## Anchor B — add one bullet under `## Deployed Features`

Locate (existing, unchanged):

```markdown
- **Artifact Pipeline component** — `components/project/overview/artifact-pipeline.tsx`. v2 plan extends this to read `artifacts.manifest.jsonl` download links (manifest-read only).
```

Add the following bullet immediately below it (preserve list nesting + dash style):

```markdown
- **Synthesis Pipeline kickoff** (Wave A — Apr 25, 2026) — `POST /api/projects/[id]/synthesize` + `GET /synthesize/status` + extended `GET /artifacts/manifest`. Boundary D-V21.24: Vercel orchestrates, Cloud Run renders. Helpers in `lib/billing/synthesis-tier.ts`, `lib/storage/supabase-storage.ts`, `lib/synthesis/{artifacts-bridge,kickoff}.ts`. Sidecar at `services/python-sidecar/` (separate README). Manifest contract v1 frozen at `plans/v21-outputs/ta3/manifest-contract.md`.
```

---

## What this diff explicitly does NOT touch

- UI Freeze table — no UI surfaces shipped in TA3 Wave A.
- "System-Design Data Path" — the synthesis pipeline writes to `project_artifacts`, not `extractedData`. No change to the Crawley extension contract.
- Env-var stub recipe — no new required env vars at jest-runtime (the new vars are runtime-only and read with optional checks).
- Tech Stack list — additions are conventions on top of the existing stack, not new dependencies for product-helper.

---

## Approval workflow

1. David reviews this file in Obsidian.
2. If approved, TA3 docs (or any future agent) applies the two insertions verbatim to `apps/product-helper/CLAUDE.md` and bumps the `Deployed Features` snapshot date in any related plan reference.
3. If rejected, edit this file with the corrections and re-ping Bond. Do not modify `apps/product-helper/CLAUDE.md` until status above flips to `approved`.
