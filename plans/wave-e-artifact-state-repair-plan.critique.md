# Wave E Artifact State Repair Plan
> Keywords: artifact-state, supabase-storage, fmea, decision-network, form-function-map, download-dropdown, synthesis, sidecar
Iteration: 1

## Summary

- The plan correctly diagnoses the core class of bug: `status='ready'` without `storagePath` creates misleading UI.
- Phase 3 and Phase 4 (Decision Network, Form-Function Map) are already partially implemented — pages already load from storage. The only missing piece is distinguishing "row ready but no file" from "row doesn't exist."
- Phase 5 (FMEA) has two distinct bugs the plan merges: (a) the page never reads `fmea_early_v1`/`fmea_residual_v1` for display and (b) `FMEAViewer.extractRows()` doesn't handle `failure_modes`. Both need to be fixed.
- Phase 2 (shared resolver) is presented as a prerequisite but is an optional refactor — all pages can be fixed with smaller inline changes.
- Phase 1 (API enrichment) is heavier than necessary. `DownloadDropdown` already silently misroutes `ready + null signed_url` rows to the `failed` retry branch; fixing that branch in the component is sufficient and doesn't require an API contract change.
- Phase 8's `turbo.json` env vars are already in the committed file — this phase is complete.
- Phase 6 (Recommendation) is a different contract problem and should be a separate plan.

---

## Problem — DownloadDropdown `ready + null signed_url` Fallthrough

Description:
The plan (line ~95–102) says `ready + no signed_url` should show a disabled "file unavailable" item. That is correct, but the fix is simpler than described.

`components/synthesis/download-dropdown.tsx` renders items in this order:
```
if (ready && signed_url)  → download link
if (pending)              → "generating" disabled item
else                      → RETRY branch (onSelect → handleRetry)
```

When `status === 'ready' && signed_url === null`, the component falls through to the retry branch. Clicking it fires `POST /artifacts/[kind]/retry`, which expects a `failed` row. The retry route will silently error or return an incorrect state.

Phase 1 proposes fixing this via new API fields (`has_storage_path`, `is_downloadable`). That works, but it requires an API contract change and a version bump. A simpler and sufficient fix is adding an explicit guard in the component itself:

```tsx
// Add before the pending branch in download-dropdown.tsx
if (artifact.status === 'ready' && !artifact.signed_url) {
  return (
    <DropdownMenuItem key={artifact.kind} disabled>
      {label} — file unavailable
    </DropdownMenuItem>
  );
}
```

Suggested Solution:
Fix `DownloadDropdown` first (one branch addition). API enrichment with `has_storage_path` / `is_downloadable` can follow as an additive improvement in a later iteration — it is not needed to ship the visible fix. If the plan intends to ship both simultaneously, that should be stated explicitly rather than presenting API changes as the primary fix.

---

## Phase 2 — Shared Resolver is Not a Prerequisite

Description:
The plan (lines under "Phase 2") creates `lib/synthesis/load-artifact-payload.ts` and positions it as a dependency for Phases 3–5. In practice, `decision-network/page.tsx` and `form-function-map/page.tsx` already implement the same pattern inline: find row → check storagePath → sign URL → fetch JSON → normalize. These pages work today for projects that have storage-backed V1 rows. They fail only in the `ready + null storagePath` edge case, which is a two-line fix per page (distinguish `!row` from `row && !row.storagePath`).

Suggested Solution:
Demote Phase 2 from prerequisite to optional refactor. Execute in this order instead:

1. Fix `DownloadDropdown` ready-without-storage branch (smallest scope, most visible).
2. Fix DN and FFM page empty-state copy for `row && !row.storagePath`.
3. Fix FMEA to use V1 JSON artifacts for display.
4. Fix `FMEAViewer.extractRows()` for `failure_modes`.
5. Then optionally extract the shared resolver to DRY up the pattern.

This order ships the visible bugs without waiting on the abstraction.

---

## Phase 3 — Decision Network Already Loads From Storage

Description:
The plan describes Decision Network as if it needs to be "fixed" to use storage. But `decision-network/page.tsx` already does this correctly:

```ts
const row = artifacts.find(
  (a) => a.artifactKind === 'decision_network_v1' && a.synthesisStatus === 'ready',
);
if (!row?.storagePath) return <EmptyState />;
// then signs URL and fetches JSON
```

The bug is narrower than the plan implies: the single condition `!row?.storagePath` conflates two states — "no row at all" and "row exists but storage is missing." When the synthesis panel shows "Decision Network V1 — ready" but the page shows "hasn't been generated yet," that is a copy/messaging problem, not a structural loading problem.

Suggested Solution:
Replace the conflated guard with two separate branches per page (lines ~100–103 of `decision-network/page.tsx`):

```ts
if (!row) return <EmptyState />;
if (!row.storagePath) return <StorageUnavailableState />;
```

Where `StorageUnavailableState` renders:
```text
Decision network synthesis completed but the file was not saved. Re-run synthesis to regenerate.
```

This is a 10-line change. It does not require the shared resolver.

---

## Phase 4 — Form-Function Map Same as Phase 3

Description:
`form-function-map/page.tsx` has the identical pattern as the DN page — the same single-condition guard `if (!row?.storagePath) return <EmptyState />`. The same two-branch fix applies.

The plan lists this as a separate phase, but the implementation is identical to Phase 3. These two pages can and should be fixed in the same commit.

Suggested Solution:
Merge Phases 3 and 4 into one PR step. Apply the same `StorageUnavailableState` pattern. The description in the plan is accurate; the scope is overstated.

---

## Phase 5 — FMEA Has Two Distinct Bugs Not One

Description:
The plan correctly identifies that the FMEA page ignores `fmea_early_v1`/`fmea_residual_v1` for display. But reading the implementation reveals two separate bugs that require separate fixes:

**Bug A — Page display logic never reads V1 JSON artifacts:**
`fmea/page.tsx`'s `FMEAContent` checks:
```ts
const earlyReady = artifacts.some(
  (a) => a.artifactKind === 'fmea_early_xlsx' && a.synthesisStatus === 'ready',
);
```
It checks `fmea_early_xlsx` to decide if anything is "ready," then feeds `extractedData.fmeaEarly` (legacy) to the viewer. If a project has `fmea_early_v1` ready in `project_artifacts` but has no legacy extracted data and no `fmea_early_xlsx` yet, the page returns `<EmptyState />` despite a ready V1 artifact existing. The V1 JSON path is never taken for the viewer.

The fix requires:
1. Look for `fmea_early_v1`/`fmea_residual_v1` rows in `project_artifacts`.
2. If found with `storagePath`, sign URL and fetch JSON.
3. Feed that JSON to `FMEAViewer` as the primary data source.
4. Fall back to `extractedData.fmeaEarly`/`fmeaResidual` only if V1 rows are absent.

**Bug B — `FMEAViewer.extractRows()` does not handle `failure_modes`:**
`fmea-viewer.tsx` `extractRows()`:
```ts
function extractRows(instance: FMEAInstance | null | undefined): FMEARow[] {
  const t = instance.fmea_table;
  if (!t) return [];
  if (Array.isArray(t)) return t;
  if (Array.isArray(t.rows)) return t.rows;
  return [];                    // ← `failure_modes` is never checked here
}
```

The page-level `rowsFromInstance()` helper (used only for export) does handle `failure_modes`, but the viewer itself does not. So even if Bug A is fixed and V1 JSON is loaded, if the V1 schema uses `failure_modes` instead of `fmea_table.rows`, the viewer renders an empty table.

Suggested Solution:
Fix Bug B in `fmea-viewer.tsx` `extractRows()`:
```ts
function extractRows(instance: FMEAInstance | null | undefined): FMEARow[] {
  if (!instance) return [];
  const t = instance.fmea_table;
  if (t) {
    if (Array.isArray(t)) return t;
    if (Array.isArray(t.rows)) return t.rows;
  }
  // Canonical V1 FMEA uses failure_modes
  const fm = (instance as { failure_modes?: FMEARow[] }).failure_modes;
  if (Array.isArray(fm)) return fm;
  return [];
}
```

Fix Bug A by adding `fmea_early_v1`/`fmea_residual_v1` to the artifact loading path in `fmea/page.tsx`. The plan's field mapping (line ~196–207) is correct; it just needs to be in `extractRows()` (viewer), not only in `rowsFromInstance()` (export helper).

---

## Phase 5 — RPN Threshold Inference Needs a Concrete Algorithm

Description:
The plan (line ~211) says: "Prefer `criticality_category` when present, otherwise infer thresholds from observed max RPN." The `infer from max RPN` approach is ambiguous. V1 FMEA `fmea_early.v1.json` uses RPN in range 1–1000 (severity × occurrence × detection). The current thresholds (≥80 red, ≥40 amber) are not obviously wrong for that range. The plan doesn't specify what the "smaller scales" are or when they apply.

Suggested Solution:
Either:
- Specify the exact scale (e.g., "canonical V1 FMEA uses 1–1000; thresholds ≥200 red, ≥100 amber") and hardcode it.
- Or use `criticality_category` ('high' | 'medium' | 'low') exclusively when present, and only fall through to numeric RPN when the field is absent.

The open-ended "infer from max" algorithm is a fragile heuristic. Drop it.

---

## Phase 6 — Should Be a Separate Plan

Description:
Phase 6 (Recommendation contract mismatch) does not share code with Phases 1–5. It involves:
- `generate-synthesis.ts` runtime envelope output shape
- `RecommendationViewer` expected input shape
- The synthesis page rendering logic

This is a payload contract problem, not an artifact-state problem. Including it in this plan inflates scope and adds risk to a plan that is otherwise surgical.

Suggested Solution:
Extract Phase 6 into `recommendation-contract-repair-plan.md`. The current plan ends cleanly at Phase 5 (display + download fixed for all affected pages) + Phase 7 (repair path) + Phase 8 (env). Recommendation is a separate V2-ticket.

---

## Phase 7 — Repair Path Is Underspecified for Non-FMEA Kinds

Description:
The plan says (line ~260): "Reconstruct the payload from available runtime/extracted data when possible." This assumes the payload is recoverable after synthesis completes. For FMEA, `extractedData.fmeaEarly`/`fmeaResidual` exist and could be re-uploaded. But for Decision Network and Form-Function Map, the V1 JSON payload is only available in memory during synthesis; there is no `extractedData.decisionNetwork` for most projects, and `extractedData.formFunction` similarly may not exist.

The plan also says "Do not rely on the existing retry route yet" but doesn't provide an alternative endpoint shape. A repair script that is never wired into any endpoint is incomplete.

Suggested Solution:
Narrow the repair path to only kinds where `extractedData` provides a recoverable payload:
- `fmea_early_v1` ← recoverable from `extractedData.fmeaEarly`
- `fmea_residual_v1` ← recoverable from `extractedData.fmeaResidual`
- `n2_matrix_v1` ← recoverable from `extractedData.interfaces`

For DN/FFM: accept that `ready + null storagePath` rows require a synthesis re-run. Provide a UI path to trigger re-run (extend the retry route to accept `ready` status with missing storage, not just `failed`). State this explicitly rather than implying a generic reconstruction is possible.

---

## Phase 8 — turbo.json Already Complete

Description:
The plan lists adding `RENDER_SIDECAR_URL` / `PYTHON_SIDECAR_URL` to `turbo.json` as work to do. Checking the committed `turbo.json` at HEAD:

```json
"PYTHON_SIDECAR_URL",
"RENDER_SIDECAR_URL"
```

Both are already present (added alongside `SENTRY_*` and `GOOGLE_APPLICATION_CREDENTIALS`). This phase is already done.

Suggested Solution:
Remove Phase 8's `turbo.json` task from the plan or mark it `DONE`. The env-var compatibility fallback (`RENDER_SIDECAR_URL ?? PYTHON_SIDECAR_URL`) in `_persist-artifact.ts` is still worth doing — that part of Phase 8 is not yet implemented.

---

## Verification Plan — Missing Synthesis-Less Smoke Test

Description:
The verification plan (line ~285) tests all pages against a project that has synthesis artifacts. But the primary user-visible failure happens on intake-stage projects that do NOT have synthesis. The smoke test should explicitly include:

- A project with NO synthesis run: confirm DN/FFM/FMEA show correct empty states (not "ready but blank table").
- A project with synthesis run but `storagePath = null` on V1 rows: confirm pages show "file unavailable" banner, not generic empty state.
- A project with synthesis run and storage-backed V1 rows: confirm pages render data correctly.

Suggested Solution:
Add to the verification plan:
```
Smoke test matrix:
  A) No synthesis row → empty state (expected)
  B) Ready row, null storagePath → "file unavailable" message (NOT generic empty state)
  C) Ready row, storagePath present → page renders data
```

---

## Recommended Implementation Order — Revised

Description:
The plan's order (shared resolver → DN → FFM → FMEA → dropdown → API → recommendation → repair) front-loads the hardest abstraction. A more surgical order that ships visible fixes first:

Suggested Solution:
```
1. Fix DownloadDropdown: add `ready + null signed_url` → disabled "unavailable" branch.
2. Fix DN page: split `!row?.storagePath` into !row vs. !storagePath branches.
3. Fix FFM page: same as DN (one commit with DN).
4. Fix FMEAViewer.extractRows(): add failure_modes branch.
5. Fix FMEA page: load fmea_early_v1 / fmea_residual_v1 for display, fall back to extractedData.
6. Add RENDER_SIDECAR_URL ?? PYTHON_SIDECAR_URL compat fallback in _persist-artifact.ts and retry route.
7. Narrow repair path to recoverable kinds; extend retry route to accept ready-with-null-storage.
8. (Optional) Extract shared resolver once all pages are fixed.
9. (Separate plan) Recommendation contract.
```
