# TA3 docs — deferred + status

**Date:** 2026-04-25
**Owner:** TA3 docs (Wave A)

## Shipped this wave

| Deliverable | Path | Status |
|---|---|---|
| Manifest contract v1 | `plans/v21-outputs/ta3/manifest-contract.md` | DONE |
| Sidecar README | `services/python-sidecar/README.md` | DONE |
| CLAUDE.md update — DRAFT | `plans/v21-outputs/ta3/claude-md-diff.md` | PENDING DAVID REVIEW |

## JSDoc on routes + helpers — assessed, no patch needed

Walked all five target files; existing JSDoc is comprehensive and aligned with the contracts shipped this wave. No additive patch needed in Wave A:

- `app/api/projects/[id]/synthesize/route.ts` — full module + route docstring covering D-V21.24 boundary, idempotency window, credit semantics.
- `app/api/projects/[id]/synthesize/status/route.ts` — full docstring with response shape + latency target + RLS note.
- `app/api/projects/[id]/artifacts/manifest/route.ts` — docstring includes contract version + bump rule + back-link to `manifest-contract.md`.
- `lib/billing/synthesis-tier.ts` — module + function docstrings cover Wave-A stub semantics + env-var modes + TB1 handoff.
- `lib/storage/supabase-storage.ts` — module + `getSignedUrl` JSDoc cover D-V21.08 TTL + tenant-scoping rule + cache contract.
- `lib/synthesis/artifacts-bridge.ts` — module docstring locks the single-edit point for TA1 collapse + per-symbol JSDoc on the public surface.
- `lib/synthesis/kickoff.ts` — module docstring covers the fire-and-forget contract + v2.2 swap path.

If a v2.1 reviewer disagrees, the additive surface is just `@example` blocks above each exported function — no risk to behavior.

## Carry-forward to v2.1 / v2.2

- **CLAUDE.md application** — once David approves the diff, apply the two insertions verbatim. Single bash session; no sequencing risk.
- **README screenshots** — operator runbook is text-only by design (no UI to screenshot for a Cloud Run service). If `gcloud run services logs` UX changes meaningfully, refresh the runbook examples.
- **Manifest contract examples** — if TA2's download-dropdown surfaces a real consumer bug against `v1`, capture the failure pattern in a `manifest-contract.examples.md` companion file rather than mutating the contract.
