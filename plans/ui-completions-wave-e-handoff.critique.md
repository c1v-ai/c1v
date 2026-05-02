# UI Completions — Wave E Handoff
> Keywords: open-questions, diagram-viewer, pptxgenjs, download-dropdown, decision-network, form-function-map, sidebar, explorer, drizzle, synthesis  
Iteration: 1

## Summary

- Solid scope — the plan correctly maps each spec requirement to a concrete file change and provides executable code for all 6 task groups.
- Four actionable bugs: wrong pnpm-lock path in commit (Task C), wrong Drizzle query API for projectArtifacts (Task F), missing ArtifactPipeline steps (Task F), pending indicators computed but never rendered (Task F).
- One redundancy: `getProjectArtifacts` called twice for the same projectId in the FMEA page (Task D1).
- Minor: `as never` casts in Task E2/E3 could be typed more precisely; Task F's import block is presented as a snippet that risks duplicate imports.
- Split recommendation: Tasks A/B/E1 are 15-min wiring jobs; Task F is a multi-file feature. Executing them as one plan inflates context and review surface unnecessarily.

---

## Task C — DiagramViewer PPTX + JSON Export Buttons

### Wrong pnpm-lock path in commit step

Description: (line ~Step 5 in Task C) The commit step stages `apps/product-helper/pnpm-lock.yaml`, but this monorepo uses a single root-level lock file at `/Users/davidancor/Projects/c1v/pnpm-lock.yaml`. The app-level path doesn't exist.

Suggested Solution: Fix the commit step to stage the root lock file:

```bash
git add apps/product-helper/components/diagrams/diagram-viewer.tsx \
        apps/product-helper/package.json \
        pnpm-lock.yaml
git commit -m "feat(ui): add PPTX and MMD export to DiagramViewer"
```

---

### pptxgenjs install directory

Description: (Step 1) `cd apps/product-helper && pnpm add pptxgenjs` is correct for a pnpm workspace — it adds to that workspace's `package.json`. Just note that `pnpm install` must also run at the monorepo root afterward (or use `pnpm add --filter product-helper pptxgenjs` from root) to ensure the lock file is updated in the workspace context.

Suggested Solution: Either approach works, but standardize on the from-root form used elsewhere:

```bash
# From monorepo root:
pnpm add pptxgenjs --filter product-helper
```

---

## Task D — DownloadDropdown on FMEA and QFD Pages

### Double getProjectArtifacts query in FMEA page

Description: (Task D1 Steps 1–2) `FMEAPage` will call `buildFmeaDownloadArtifacts(projectId)` which calls `getProjectArtifacts(projectId)`, and then the `<FMEAContent />` inner component also calls `getProjectArtifacts(projectId)`. This is two identical DB queries per page load. Not a correctness bug, but wasteful.

Suggested Solution: Pass the already-fetched artifact rows from `FMEAPage` into `FMEAContent` as a prop, rather than re-fetching:

```tsx
async function FMEAContent({
  projectId,
  artifacts,
}: {
  projectId: number;
  artifacts: Awaited<ReturnType<typeof getProjectArtifacts>>;
}) {
  // Use passed-in artifacts instead of calling getProjectArtifacts again
  const earlyReady = artifacts.some(a => a.artifactKind === 'fmea_early_xlsx' && a.synthesisStatus === 'ready');
  // ...
}
```

And in `FMEAPage`:
```tsx
const artifacts = await getProjectArtifacts(projectId);
const downloadArtifacts = buildFmeaDownloadArtifactsFromRows(artifacts);
// pass artifacts to FMEAContent
```

---

## Task E — Stub Viewer Implementations

### E2/E3 — `as never` type cast is non-standard

Description: (Task E2 Step 2, Task E3 Step 2) Pages cast the fetched JSON object as `data as never` before passing to the viewer. This compiles but suppresses all type checking. The viewer props accept `Record<string, unknown>` compatible types anyway.

Suggested Solution: Use `as Record<string, unknown>` (already the declared type of `data`) and let the viewer's prop type handle the cast:

```tsx
// Instead of:
return <DecisionNetworkViewer data={data as never} />;

// Use:
return <DecisionNetworkViewer data={data} />;
// (data is already Record<string, unknown> which is assignable to DecisionNetworkData via structural typing)
```

Or, if tsc objects, add a cast at the prop boundary: `data={data as DecisionNetworkData}`.

---

## Task F — Sidebar Status Indicators

### Bug: Wrong Drizzle query API — `db.query.projectArtifacts` doesn't exist

Description: (Task F Step 1) The plan adds a 6th query to `getExplorerData`'s `Promise.all`:

```tsx
db.query.projectArtifacts.findMany({
  where: eq(projectArtifacts.projectId, projectId),
  columns: { artifactKind: true, synthesisStatus: true },
})
```

`db.query.*` is Drizzle's relational query builder — it requires `relations()` to be defined for the table. No `projectArtifactsRelations` is registered anywhere in `lib/db/schema/`. This will throw `"Table 'projectArtifacts' not found in schema"` at runtime.

The existing pattern in `lib/db/queries.ts` uses the standard `db.select()` API for this table.

Suggested Solution: Replace with the `db.select()` pattern already used for projectArtifacts:

```tsx
import { desc } from 'drizzle-orm';  // add to existing import

// 6th query in Promise.all:
db
  .select({
    artifactKind: projectArtifacts.artifactKind,
    synthesisStatus: projectArtifacts.synthesisStatus,
  })
  .from(projectArtifacts)
  .where(eq(projectArtifacts.projectId, projectId)),
```

Destructure as `synthesisRows` (same name the plan uses). No other changes needed.

---

### Bug: ArtifactPipeline steps are missing despite being listed in Files

Description: (Task F preamble) The `Files` section declares `components/project/overview/artifact-pipeline.tsx` as a file to modify, but no step in Task F actually touches it. The handoff explicitly says "Logic in: /api/projects/[id]/explorer response → ArtifactPipeline component." Without updating ArtifactPipeline, the synthesis items won't appear on the project overview page — only in the sidebar tree.

Suggested Solution: Add a step to extend `ArtifactPipeline` with a "System Design" pipeline group. Following the existing `requirementsItems` / `backendItems` pattern:

```tsx
const systemDesignItems: PipelineItem[] = [
  { name: 'FMEA', dataKey: 'hasFmea', href: '/system-design/fmea', icon: FlaskConical },
  { name: 'House of Quality', dataKey: 'hasHoq', href: '/system-design/qfd', icon: Target },
  { name: 'Data Flows', dataKey: 'hasDataFlows', href: '/requirements/data-flows', icon: GitBranch },
  { name: 'Decision Network', dataKey: 'hasDecisionNetwork', href: '/system-design/decision-network', icon: Network },
  { name: 'Form-Function Map', dataKey: 'hasFormFunctionMap', href: '/system-design/form-function-map', icon: Layers },
  { name: 'Architecture Rec.', dataKey: 'hasSynthesisRecommendation', href: '/synthesis', icon: Sparkles },
];
```

Then add a `<PipelineGroup>` call for it in `ArtifactPipeline`'s render. The `HasDataMap = Record<string, boolean>` type is already string-keyed, so new flags flow through automatically once `getExplorerData` returns them.

---

### Missing: Pending indicator (⏳) never rendered

Description: (Task F Steps 1–4) The plan computes `isFmeaPending`, `isDataFlowsPending`, etc. and adds them to `ExplorerData.hasData`. However, `ExplorerNode` only supports a `hasData: boolean` prop that renders a green/gray dot. The `isFmea*Pending` flags are passed nowhere — they're stranded in the API response. The handoff explicitly requires "⏳ pending until `project_artifacts` row is ready."

Suggested Solution (two options):

**Option A (minimal)** — Add a `isPending?: boolean` prop to `ExplorerNode` and render a yellow/amber dot when true:

```tsx
// In ExplorerNode, replace the data status dot section:
{typeof hasData === 'boolean' && (
  <span
    className={cn(
      'w-1.5 h-1.5 rounded-full shrink-0',
      isPending ? 'bg-amber-400 animate-pulse' :
      hasData ? 'bg-green-500' : 'bg-muted-foreground/40'
    )}
    aria-label={isPending ? 'Generating' : hasData ? 'Has data' : 'No data'}
  />
)}
```

**Option B (skip pending flags)** — Simply remove the `isFmea*Pending` fields from `ExplorerData` and the `ExplorerData` type extension since they're unused. This reduces scope to what the plan actually delivers.

Pick one — as written the plan computes data that goes nowhere.

---

### Explorer tree import block is a snippet (risk of duplicate imports)

Description: (Task F Step 3) The plan shows a new import block addition but says "add new imports at the top" without showing the merged result. The executor could accidentally add duplicate entries for icons already imported (e.g., `Target`, `GitBranch` are used elsewhere in the file).

Suggested Solution: The plan should specify that this is an additive change to the existing `lucide-react` import — not a replacement. Add only the net-new names to the single `from 'lucide-react'` import:

```tsx
// ADD only these to the existing lucide-react import block:
FlaskConical,
Network,
Layers3,
HelpCircle,
GitFork,
// Clock is imported but never used — omit it
```

Note: `Sparkles` is already in scope as `Sparkles` (used for "Generate" node) — the plan aliases it as `SynthesisIcon` which is fine but should be noted to avoid a second import.

---

## Split Recommendation

The plan is one document covering 9 independent sub-tasks across 3 different risk tiers. Recommend splitting into **3 plans** before execution:

| New Plan | Tasks | Risk |
|---|---|---|
| `ui-wire-viewers.md` | A, E1, E2, E3 | Zero frozen files, all wiring |
| `ui-export-downloads.md` | B (if unfrozen), C, D1, D2 (if unfrozen) | Semi-frozen exceptions |
| `ui-sidebar-synthesis.md` | F | Multi-file feature, needs ArtifactPipeline fix first |

The sidebar plan (F) should NOT be started until the `buildFmeaDownloadArtifacts` refactor in D1 is settled, since both touch `getProjectArtifacts` call patterns.
