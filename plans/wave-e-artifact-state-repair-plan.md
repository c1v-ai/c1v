# Wave E Artifact State Repair Plan

Date: 2026-04-30  
Branch: `ui/completions-wave-e-handoff`

## Problem

The Wave E UI now exposes download/export controls, and Vercel preview is building. The remaining bug is not primarily a missing button or a failed deploy. It is an artifact-state mismatch.

The app currently treats `project_artifacts.synthesis_status = 'ready'` as if the artifact is fully usable. Several page bodies and download menus need more than that:

- A display page usually needs a JSON payload it can load and normalize.
- A download menu needs a signed Supabase Storage URL.
- A server-rendered XLSX/SVG/MMD/PPTX derivative needs the Python sidecar to have produced and uploaded a file.

Today those states are collapsed into one word: `READY`.

That creates the visible failure mode:

- The synthesis/status panel shows `Decision Network V1`, `Form Function Map V1`, `Fmea Early V1`, and `Fmea Residual V1` as ready.
- Decision Network and Form-Function Map pages still render empty states.
- FMEA can still render empty even when its V1 JSON artifacts are ready.
- Downloads can appear even when a ready row has no usable signed URL.

## Root Cause

### 1. Ready Rows Can Have No Storage File

`apps/product-helper/lib/langchain/graphs/nodes/_persist-artifact.ts` uploads JSON to Supabase Storage and then upserts the artifact row.

If upload fails, `uploadJsonArtifact()` catches the error and returns `null`. The code still writes:

```ts
status: 'ready',
storagePath: null
```

So the database can honestly contain a row that says the synthesis step completed, but there is no persisted JSON file for the UI to fetch.

### 2. DownloadDropdown Silently Misroutes `ready + null signed_url`

`apps/product-helper/components/synthesis/download-dropdown.tsx` renders items in this order:

```
if (ready && signed_url)  → download link
if (pending)              → "generating" disabled
else                      → retry branch (onSelect → handleRetry)
```

When `status === 'ready' && signed_url === null`, the component falls through to the retry branch and fires `POST /artifacts/[kind]/retry`. That endpoint only handles `failed` rows; it will error or produce an incorrect state on a ready row.

### 3. Decision Network And Form-Function Map Use Incorrect Empty State

These pages:

- `apps/product-helper/app/(dashboard)/projects/[id]/system-design/decision-network/page.tsx`
- `apps/product-helper/app/(dashboard)/projects/[id]/system-design/form-function-map/page.tsx`

already load from storage correctly. Both pages guard:

```ts
if (!row?.storagePath) return <EmptyState />;
```

This conflates two distinct states:
- `row` does not exist → artifact has not been synthesized yet → correct empty state.
- `row` exists, `status = 'ready'`, but `storagePath = null` → synthesis ran but storage upload failed → wrong message: "hasn't been generated yet."

### 4. FMEA Page Never Reads V1 JSON Artifacts For Display (Bug A)

`apps/product-helper/app/(dashboard)/projects/[id]/system-design/fmea/page.tsx` checks `fmea_early_xlsx` / `fmea_residual_xlsx` to decide if anything is "ready," then feeds `extractedData.fmeaEarly` / `extractedData.fmeaResidual` to the viewer. If a project has `fmea_early_v1` ready in `project_artifacts` but no legacy extracted data and no `fmea_early_xlsx` yet, the page returns `<EmptyState />` despite a ready V1 artifact existing. The `fmea_early_v1` JSON path is never taken for display.

### 5. FMEA Viewer Does Not Handle Canonical `failure_modes` Field (Bug B)

`apps/product-helper/components/system-design/fmea-viewer.tsx` `extractRows()`:

```ts
function extractRows(instance) {
  const t = instance.fmea_table;
  if (!t) return [];
  if (Array.isArray(t)) return t;
  if (Array.isArray(t.rows)) return t.rows;
  return [];   // ← failure_modes never checked
}
```

The page-level `rowsFromInstance()` helper (used only for CSV/PPTX export) handles `failure_modes`, but the viewer itself does not. So even after loading V1 JSON, the table renders empty if the canonical schema uses `failure_modes`.

### 6. Recommendation Is A Separate Payload Contract Problem

`generate-synthesis.ts` writes a runtime envelope (`_schema: 'synthesis.architecture-recommendation.runtime-envelope.v1'`) but `RecommendationViewer` expects the full `ArchitectureRecommendation` shape (`metadata`, `decisions`, `pareto_frontier`, etc.). This is a distinct contract mismatch — tracked in a separate plan.

## Proposed Solution

Fix in order of visible impact: DownloadDropdown branch → DN/FFM empty-state copy → FMEAViewer `extractRows()` → FMEA page V1 load → env compat → repair path.

The shared artifact payload resolver is an optional future refactor, not a prerequisite. All pages can be fixed with targeted inline changes.

## Phase 1: Fix DownloadDropdown `ready + null signed_url` Branch

File:

```text
apps/product-helper/components/synthesis/download-dropdown.tsx
```

Add an explicit guard before the `pending` branch:

```tsx
if (artifact.status === 'ready' && !artifact.signed_url) {
  return (
    <DropdownMenuItem key={artifact.kind} disabled>
      {label} — file unavailable
    </DropdownMenuItem>
  );
}
```

This stops the current silent misroute to the retry handler. A ready row without a signed URL is a degraded state, not a failed state.

**Optional follow-up (not a blocker):** Add `has_storage_path: boolean` and `is_downloadable: boolean` to the status and manifest API responses for richer client-side semantics. Do not block page fixes on this.

## Phase 2: Fix Decision Network And Form-Function Map Empty States

Files:

```text
apps/product-helper/app/(dashboard)/projects/[id]/system-design/decision-network/page.tsx
apps/product-helper/app/(dashboard)/projects/[id]/system-design/form-function-map/page.tsx
```

Both pages already load from storage correctly. The only fix needed is splitting the conflated guard into two branches:

```ts
// Replace: if (!row?.storagePath) return <EmptyState />;
if (!row) return <EmptyState />;
if (!row.storagePath) return <StorageUnavailableState />;
```

Add a shared `StorageUnavailableState` component (or inline per page):

```tsx
function StorageUnavailableState({ kind }: { kind: string }) {
  return (
    <div className="rounded-lg border bg-card p-12 text-center">
      <div className="mx-auto max-w-md space-y-3">
        <h2 className="text-lg font-semibold text-foreground">{kind}</h2>
        <p className="text-sm text-muted-foreground">
          Synthesis completed but the artifact file was not saved. Re-run
          synthesis to regenerate.
        </p>
      </div>
    </div>
  );
}
```

Fix both pages in one commit. No shared resolver required.

## Phase 3: Fix FMEA Viewer `extractRows()` For Canonical `failure_modes`

File:

```text
apps/product-helper/components/system-design/fmea-viewer.tsx
```

Update `extractRows()` to handle the canonical V1 field:

```ts
function extractRows(instance: FMEAInstance | null | undefined): FMEARow[] {
  if (!instance) return [];
  const t = instance.fmea_table;
  if (t) {
    if (Array.isArray(t)) return t;
    if (Array.isArray(t.rows)) return t.rows;
  }
  // Canonical module-8.fmea-early.v1 uses failure_modes
  const fm = (instance as { failure_modes?: FMEARow[] }).failure_modes;
  if (Array.isArray(fm)) return fm;
  return [];
}
```

Also update `FMEAInstance` type to include `failure_modes?: FMEARow[]`.

Fix RPN color thresholds: prefer `criticality_category` (`'high' | 'medium' | 'low'`) when present; only fall through to numeric RPN when the field is absent. Drop the open-ended "infer from max" heuristic.

```ts
function rpnClass(row: FMEARow): string {
  const cat = (row as { criticality_category?: string }).criticality_category;
  if (cat === 'high') return 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300';
  if (cat === 'medium') return 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
  if (cat === 'low') return 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
  // Numeric RPN fallback (1–1000 scale)
  const rpn = row.rpn;
  if (typeof rpn !== 'number' || Number.isNaN(rpn)) return '';
  if (rpn >= 200) return 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300';
  if (rpn >= 100) return 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
  return 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
}
```

## Phase 4: Fix FMEA Page To Load V1 JSON Artifacts For Display

File:

```text
apps/product-helper/app/(dashboard)/projects/[id]/system-design/fmea/page.tsx
```

Add a V1 JSON load path before the legacy fallback. Resolution order:

1. Find `fmea_early_v1` / `fmea_residual_v1` artifact rows with `storagePath` set.
2. Sign URL and fetch JSON.
3. Feed to `FMEAViewer` as the primary data source.
4. Fall back to `extractedData.fmeaEarly` / `fmeaResidual` only if V1 rows are absent or have no `storagePath`.

```ts
// In FMEAContent — new V1 load path
const earlyV1Row = artifacts.find(
  (a) => a.artifactKind === 'fmea_early_v1' && a.synthesisStatus === 'ready' && a.storagePath,
);
const residualV1Row = artifacts.find(
  (a) => a.artifactKind === 'fmea_residual_v1' && a.synthesisStatus === 'ready' && a.storagePath,
);

const cache = new Map<string, string>();
const earlyV1 = earlyV1Row
  ? await fetchArtifactJson<FMEAInstance>(earlyV1Row.storagePath!, cache)
  : null;
const residualV1 = residualV1Row
  ? await fetchArtifactJson<FMEAInstance>(residualV1Row.storagePath!, cache)
  : null;

// Fall back to legacy
const early = earlyV1 ?? legacyEarly;
const residual = residualV1 ?? legacyResidual;
```

Keep `fmea_early_xlsx` / `fmea_residual_xlsx` as the download source. Keep `extractedData` fallback for the `DataExportMenu`. These are independent of the display source.

## Phase 5: Sidecar Environment Compat Fallback

Files:

```text
apps/product-helper/lib/langchain/graphs/nodes/_persist-artifact.ts
apps/product-helper/app/api/projects/[id]/artifacts/[kind]/retry/route.ts
```

`turbo.json` already has both `RENDER_SIDECAR_URL` and `PYTHON_SIDECAR_URL`. No change needed there.

Both code files still use only `RENDER_SIDECAR_URL`. Add a compatibility fallback so either env var works:

```ts
const sidecarBase =
  process.env.RENDER_SIDECAR_URL ?? process.env.PYTHON_SIDECAR_URL;
```

Choose one canonical name in a follow-up once the Cloud Run deployment is stable.

Sidecar redeploy is still required for these optional derivative kinds (already registered in orchestrator.py but image not yet redeployed):

- `n2_matrix_xlsx`
- `decision_network_xlsx`
- `decision_network_svg`
- `form_function_map_xlsx`
- `form_function_map_svg`
- `form_function_map_mmd`

Page display must not depend on those derivatives.

## Phase 6: Repair Existing Ready-Without-Storage Rows

Existing projects may already have rows like:

```text
artifact_kind = fmea_early_v1
synthesis_status = ready
storage_path = null
```

Page display fallbacks (Phases 2–4) make pages usable, but canonical downloads still require storage-backed artifacts.

**Recoverable kinds** (payload reconstructable from `extractedData`):

- `fmea_early_v1` ← from `extractedData.fmeaEarly`
- `fmea_residual_v1` ← from `extractedData.fmeaResidual`
- `n2_matrix_v1` ← from `extractedData.interfaces`

**Non-recoverable kinds** (payload only exists in synthesis memory; no `extractedData` equivalent):

- `decision_network_v1`
- `form_function_map_v1`

For recoverable kinds: add an admin/repair script that reconstructs, uploads, and updates `storagePath`.

For non-recoverable kinds: extend the retry route to accept `ready` rows with `storagePath = null` (not only `failed` rows) and re-trigger synthesis. Do not rely on the existing retry flow which only posts `{ retry: true }` for `failed` rows; it will need a new dispatch path for ready-without-storage.

Do not ship the repair path before display is fixed and verified (Phases 1–4).

## Phase 7: Optional — Shared Artifact Payload Resolver

Once Phases 1–4 are done and the inline patterns are stable, optionally extract a shared helper:

```text
apps/product-helper/lib/synthesis/load-artifact-payload.ts
```

This DRYs up the repeated sign-URL → fetch → normalize pattern across DN, FFM, and FMEA pages. It is not required to ship the visible fixes.

## Phase 8: Recommendation Contract (Separate Plan)

The Recommendation page mismatch (`runtime-envelope.v1` vs. full `ArchitectureRecommendation` shape) is a distinct contract problem that does not share code with Phases 1–6. Track and fix separately in `recommendation-contract-repair-plan.md`.

## Verification Plan

Run local checks:

```bash
cd apps/product-helper
npx tsc --noEmit --project tsconfig.json
npx next build
```

Browser-smoke matrix — test all three artifact-state scenarios per affected page:

| Scenario | Expected result |
|---|---|
| A) No synthesis row exists | Generic empty state with "Run Deep Synthesis" call-to-action |
| B) Row `ready`, `storagePath = null` | "Synthesis completed but file was not saved. Re-run synthesis." |
| C) Row `ready`, `storagePath` present | Page renders data from V1 JSON |

Pages to smoke: Decision Network, Form-Function Map, FMEA, Synthesis status panel, DownloadDropdown.

Confirm for DownloadDropdown:
- Scenario A: item absent or shows "no artifacts"
- Scenario B: item present, disabled, labeled "file unavailable" — no retry triggered
- Scenario C: item present, enabled download link

## Recommended Implementation Order

1. Fix `DownloadDropdown`: add `ready + null signed_url` → disabled "unavailable" branch (Phase 1).
2. Fix DN and FFM pages: split `!row?.storagePath` into `!row` vs. `!storagePath` (Phase 2, one commit).
3. Fix `FMEAViewer.extractRows()`: add `failure_modes` branch; fix `rpnClass` to use `criticality_category` (Phase 3).
4. Fix FMEA page: load `fmea_early_v1` / `fmea_residual_v1` for display, fall back to `extractedData` (Phase 4).
5. Add `RENDER_SIDECAR_URL ?? PYTHON_SIDECAR_URL` compat fallback (Phase 5).
6. Narrow and ship repair path for recoverable kinds only (Phase 6).
7. Optionally extract shared resolver once all pages are stable (Phase 7).
8. Handle Recommendation contract in a separate plan (Phase 8).

## Success Criteria

The system is fixed when:

- A sidebar/status `READY` state no longer contradicts the page body.
- Ready JSON artifacts are used for page rendering (FMEA, DN, FFM).
- Ready rows without storage show a precise "file unavailable" message, not a generic empty state.
- `DownloadDropdown` never routes a `ready` row to the retry handler.
- XLSX/SVG/MMD/PPTX downloads remain sidecar-backed where generators exist.
- Frontend exports are clearly fallback/quick exports, not the primary source of truth.
