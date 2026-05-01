# UI Completions — Wave E Handoff

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete 6 UI fix/addition groups from the Wave E handoff: wire existing viewers that are ready but un-wired, add download export formats, surface DownloadDropdown on synthesis-adjacent pages, implement stub viewers for artifact-backed pages, and fix sidebar status indicators for synthesis-gated content.

**Architecture:** All changes are in `apps/product-helper`. Tasks A–F are independent and can be executed in any order. Each task either (a) wires an existing component into a page, (b) adds a handler to an existing component, or (c) creates a new viewer component.

**Tech Stack:** Next.js 15 App Router, React Server Components, shadcn/ui, Tailwind CSS 4, Drizzle ORM (`getProjectArtifacts`), TypeScript, pptxgenjs (new dep for Task C).

---

## Freeze Contract Reference

Files frozen in CLAUDE.md (no edits without explicit unfreeze):

| File | Status |
|---|---|
| `components/system-design/decision-matrix-viewer.tsx` | 🔒 Frozen |
| `components/system-design/ffbd-viewer.tsx` | 🔒 Frozen |
| `components/system-design/qfd-viewer.tsx` | 🔒 Frozen |
| `components/system-design/interfaces-viewer.tsx` | 🔒 Frozen — **Task B requires line 337 exception** |
| `components/diagrams/diagram-viewer.tsx` | 🔒 Frozen — **Task C download buttons are the explicit exception** |
| `app/(dashboard)/projects/[id]/system-design/decision-matrix/page.tsx` | 🔒 Frozen |
| `app/(dashboard)/projects/[id]/system-design/ffbd/page.tsx` | 🔒 Frozen |
| `app/(dashboard)/projects/[id]/system-design/interfaces/page.tsx` | 🔒 Frozen |
| `app/(dashboard)/projects/[id]/system-design/qfd/page.tsx` | 🔒 Frozen — **Task D-QFD requires freeze exception** |

Tasks A, C (partial), D (FMEA only), E, and F touch **no frozen files**.
Tasks B and D-QFD require **freeze exceptions** — David must confirm before execution.

---

## Task A — Open Questions Page (Priority 1A)

**Files:**
- Modify: `app/(dashboard)/projects/[id]/requirements/open-questions/page.tsx`

**Problem:** The `OpenQuestionsViewer` component at `components/requirements/open-questions-viewer.tsx` is fully built but the page shows a stub even when ledger data exists. The page has a local `OpenQuestionEntry` interface that doesn't match `OpenQuestionLedgerEntry` from `lib/chat/system-question-bridge.types` (different `status` values: page has `'open'|'resolved'|'deferred'`, viewer expects `'pending'|'answered'`). The viewer must receive entries castable to `OpenQuestionLedgerEntry`.

**Note on type mismatch:** The ledger entries stored in `extractedData.openQuestions` were written by `system-question-bridge.ts` using `openQuestionLedgerEntrySchema`, so they conform to `{ status: 'pending'|'answered', ... }`. The page's local interface with `'open'|'resolved'|'deferred'` is stale dead code. We pass the raw ledger entries directly.

- [ ] **Step 1: Replace the page content**

In `app/(dashboard)/projects/[id]/requirements/open-questions/page.tsx`, replace the entire file with:

```tsx
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProjectById } from '@/app/actions/projects';
import { OpenQuestionsViewer } from '@/components/requirements/open-questions-viewer';
import type { OpenQuestionsLedger } from '@/components/requirements/open-questions-viewer';

function SectionSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 rounded animate-pulse bg-muted" />
      <div className="h-64 rounded animate-pulse bg-muted" />
    </div>
  );
}

async function OpenQuestionsContent({ projectId }: { projectId: number }) {
  const project = await getProjectById(projectId);
  if (!project) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ledger: OpenQuestionsLedger | undefined | null = (project as any)
    .projectData?.intakeState?.extractedData?.openQuestions;

  return <OpenQuestionsViewer projectId={projectId} ledger={ledger} />;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OpenQuestionsPage({ params }: PageProps) {
  const { id } = await params;
  const projectId = parseInt(id, 10);
  if (isNaN(projectId)) notFound();

  return (
    <section className="flex-1 p-4 pb-20 md:pb-8 lg:p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">
          Open Questions
        </h1>
        <Suspense fallback={<SectionSkeleton />}>
          <OpenQuestionsContent projectId={projectId} />
        </Suspense>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify tsc**

```bash
cd apps/product-helper && npx tsc --noEmit --project tsconfig.json 2>&1 | head -30
```
Expected: 0 errors (or only pre-existing unrelated errors).

- [ ] **Step 3: Commit**

```bash
git add apps/product-helper/app/\(dashboard\)/projects/\[id\]/requirements/open-questions/page.tsx
git commit -m "feat(ui): wire OpenQuestionsViewer into open-questions page"
```

---

## Task B — SEQ-002 Friendly Error Message (Priority 1B)

> **⚠️ FREEZE EXCEPTION REQUIRED** — `components/system-design/interfaces-viewer.tsx` line 337 is in a frozen file. Confirm with David before executing this task.

**Files:**
- Modify: `components/system-design/interfaces-viewer.tsx` (line 337 — one-line change)

**Problem:** When a use-case group has fewer than 3 interfaces, `generateSequenceDiagram` returns `validation.passed = false` with error string `"SEQ-002: Insufficient messages (found: 2, min: 3)"`. Line 337 of `interfaces-viewer.tsx` renders this raw string inside a destructive-styled `<p>` tag. Users see internal validation codes.

- [ ] **Step 1: Replace the error display at line 337**

In `components/system-design/interfaces-viewer.tsx`, find:

```tsx
                      ) : seqResult ? (
                        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                          <p className="text-sm text-destructive">
                            {seqResult.validation.errors.join('; ')}
                          </p>
                        </div>
```

Replace with:

```tsx
                      ) : seqResult ? (
                        <div className="rounded-lg border bg-card p-4">
                          <p className="text-sm text-muted-foreground">
                            More interface data needed to generate this sequence.
                          </p>
                        </div>
```

- [ ] **Step 2: Verify tsc**

```bash
cd apps/product-helper && npx tsc --noEmit --project tsconfig.json 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add apps/product-helper/components/system-design/interfaces-viewer.tsx
git commit -m "fix(ui): replace SEQ-002 code with friendly message in sequence diagrams"
```

---

## Task C — DiagramViewer PPTX + JSON Export Buttons (Priority 2C)

> Explicit exception to the diagram-viewer.tsx freeze: "only adding download buttons is allowed."

**Files:**
- Modify: `components/diagrams/diagram-viewer.tsx` (add 2 handlers + 2 buttons)

**Note on pptxgenjs:** pptxgenjs is not yet installed. The PPTX export embeds the diagram SVG as an image on a slide. Install it before coding.

**Note on JSON:** "JSON" in the handoff means the raw Mermaid source text, downloaded as a `.mmd` file. No JSON wrapper needed — just the syntax string.

- [ ] **Step 1: Install pptxgenjs**

```bash
cd apps/product-helper && pnpm add pptxgenjs
```
Expected: pptxgenjs added to package.json, pnpm-lock.yaml updated.

- [ ] **Step 2: Add PPTX + Mermaid export handlers**

In `components/diagrams/diagram-viewer.tsx`, find the `handleExport` function (starts around line 216). Add two new handlers AFTER the `handleExport` function definition (before the JSX return):

```tsx
  const handleExportPptx = async () => {
    try {
      const svg = containerRef.current?.querySelector('svg');
      if (!svg) { toast.error('No diagram to export'); return; }

      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = svgUrl;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width || 800;
      canvas.height = img.height || 600;
      const ctx = canvas.getContext('2d');
      if (!ctx) { URL.revokeObjectURL(svgUrl); return; }
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(svgUrl);

      const base64 = canvas.toDataURL('image/png').split(',')[1];
      const { default: PptxGenJS } = await import('pptxgenjs');
      const pptx = new PptxGenJS();
      const slide = pptx.addSlide();
      if (title) slide.addText(title, { x: 0.5, y: 0.2, fontSize: 18, bold: true });
      slide.addImage({ data: `image/png;base64,${base64}`, x: 0.5, y: title ? 0.8 : 0.5, w: 9, h: 6 });
      await pptx.writeFile({ fileName: `${type}-diagram.pptx` });
      toast.success('Diagram exported as PPTX');
    } catch {
      toast.error('PPTX export failed');
    }
  };

  const handleExportMermaid = () => {
    try {
      const blob = new Blob([syntax], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}-diagram.mmd`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Mermaid source exported');
    } catch {
      toast.error('Export failed');
    }
  };
```

- [ ] **Step 3: Add PPTX and MMD buttons in the toolbar**

In `components/diagrams/diagram-viewer.tsx`, find the export controls section (around lines 410–418):

```tsx
            {/* Export controls */}
            <Button variant="outline" size="sm" onClick={() => handleExport('svg')} title="Export SVG">
              <Download className="h-4 w-4 mr-1" />
              SVG
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('png')} title="Export PNG">
              <Download className="h-4 w-4 mr-1" />
              PNG
            </Button>
```

Replace with:

```tsx
            {/* Export controls */}
            <Button variant="outline" size="sm" onClick={() => handleExport('svg')} title="Export SVG">
              <Download className="h-4 w-4 mr-1" />
              SVG
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('png')} title="Export PNG">
              <Download className="h-4 w-4 mr-1" />
              PNG
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPptx} title="Export PPTX">
              <Download className="h-4 w-4 mr-1" />
              PPTX
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportMermaid} title="Export Mermaid source">
              <Download className="h-4 w-4 mr-1" />
              MMD
            </Button>
```

- [ ] **Step 4: Verify tsc**

```bash
cd apps/product-helper && npx tsc --noEmit --project tsconfig.json 2>&1 | head -30
```

- [ ] **Step 5: Commit**

```bash
git add apps/product-helper/components/diagrams/diagram-viewer.tsx apps/product-helper/package.json pnpm-lock.yaml
git commit -m "feat(ui): add PPTX and MMD export to DiagramViewer"
```

---

## Task D — DownloadDropdown on FMEA and QFD Pages (Priority 2D)

### D1 — FMEA Page (no freeze conflict)

**Files:**
- Modify: `app/(dashboard)/projects/[id]/system-design/fmea/page.tsx`

**Problem:** The FMEA page already calls `getProjectArtifacts` but doesn't surface the download dropdown. The synthesis page already has a `buildDownloadArtifacts` helper pattern to follow.

- [ ] **Step 1: Add imports + buildDownloadArtifacts helper to fmea/page.tsx**

In `app/(dashboard)/projects/[id]/system-design/fmea/page.tsx`, after the existing imports add:

```tsx
import { getSignedUrl } from '@/lib/storage/supabase-storage';
import { DownloadDropdown } from '@/components/synthesis/download-dropdown';
import type { DownloadDropdownArtifact } from '@/components/synthesis/download-dropdown';
```

Then add this helper function before `FMEAContent`:

```tsx
const FMEA_ARTIFACT_KINDS = ['fmea_early_xlsx', 'fmea_residual_xlsx'];

async function buildFmeaDownloadArtifacts(
  projectId: number,
): Promise<DownloadDropdownArtifact[]> {
  const rows = await getProjectArtifacts(projectId);
  const cache = new Map<string, string>();
  const entries: DownloadDropdownArtifact[] = [];
  for (const row of rows) {
    if (!FMEA_ARTIFACT_KINDS.includes(row.artifactKind)) continue;
    let signedUrl: string | null = null;
    if (row.synthesisStatus === 'ready' && row.storagePath) {
      try { signedUrl = await getSignedUrl(row.storagePath, undefined, cache); } catch { /* */ }
    }
    entries.push({
      kind: row.artifactKind,
      status: row.synthesisStatus,
      format: row.format,
      signed_url: signedUrl,
      sha256: row.sha256,
      synthesized_at: row.synthesizedAt instanceof Date
        ? row.synthesizedAt.toISOString()
        : (row.synthesizedAt as string | null),
    });
  }
  return entries;
}
```

- [ ] **Step 2: Render DownloadDropdown in FMEAPage**

In `FMEAPage`, change the return to add DownloadDropdown in the page header:

Find the `FMEAPage` function's return statement:

```tsx
  return (
    <section className="flex-1 p-4 pb-20 md:pb-8 lg:p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">
          Failure Mode &amp; Effects Analysis
        </h1>
        <Suspense fallback={<SectionSkeleton />}>
          <FMEAContent projectId={projectId} />
        </Suspense>
      </div>
    </section>
  );
```

Replace with:

```tsx
  const downloadArtifacts = await buildFmeaDownloadArtifacts(projectId);

  return (
    <section className="flex-1 p-4 pb-20 md:pb-8 lg:p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            Failure Mode &amp; Effects Analysis
          </h1>
          {downloadArtifacts.length > 0 && (
            <DownloadDropdown
              artifacts={downloadArtifacts}
              manifestContractVersion="v1"
              projectId={projectId}
            />
          )}
        </div>
        <Suspense fallback={<SectionSkeleton />}>
          <FMEAContent projectId={projectId} />
        </Suspense>
      </div>
    </section>
  );
```

- [ ] **Step 3: Verify tsc**

```bash
cd apps/product-helper && npx tsc --noEmit --project tsconfig.json 2>&1 | head -30
```

- [ ] **Step 4: Commit**

```bash
git add apps/product-helper/app/\(dashboard\)/projects/\[id\]/system-design/fmea/page.tsx
git commit -m "feat(ui): add DownloadDropdown to FMEA page"
```

### D2 — QFD Page (freeze exception required)

> **⚠️ FREEZE EXCEPTION REQUIRED** — `app/(dashboard)/projects/[id]/system-design/qfd/page.tsx` is in the frozen system-design routes. Confirm with David before executing D2.

**Files:**
- Modify: `app/(dashboard)/projects/[id]/system-design/qfd/page.tsx`

- [ ] **Step 1: Add imports + artifact fetching to qfd/page.tsx**

In `app/(dashboard)/projects/[id]/system-design/qfd/page.tsx`, add imports after the existing ones:

```tsx
import { getProjectArtifacts } from '@/lib/db/queries';
import { getSignedUrl } from '@/lib/storage/supabase-storage';
import { DownloadDropdown } from '@/components/synthesis/download-dropdown';
import type { DownloadDropdownArtifact } from '@/components/synthesis/download-dropdown';
```

Add helper before `QFDContent`:

```tsx
async function buildHoqDownloadArtifacts(
  projectId: number,
): Promise<DownloadDropdownArtifact[]> {
  const rows = await getProjectArtifacts(projectId);
  const cache = new Map<string, string>();
  const entries: DownloadDropdownArtifact[] = [];
  for (const row of rows) {
    if (row.artifactKind !== 'hoq_xlsx') continue;
    let signedUrl: string | null = null;
    if (row.synthesisStatus === 'ready' && row.storagePath) {
      try { signedUrl = await getSignedUrl(row.storagePath, undefined, cache); } catch { /* */ }
    }
    entries.push({
      kind: row.artifactKind,
      status: row.synthesisStatus,
      format: row.format,
      signed_url: signedUrl,
      sha256: row.sha256,
      synthesized_at: row.synthesizedAt instanceof Date
        ? row.synthesizedAt.toISOString()
        : (row.synthesizedAt as string | null),
    });
  }
  return entries;
}
```

- [ ] **Step 2: Update QFDPage to render DownloadDropdown**

Find the `QFDPage` return:

```tsx
  return (
    <section className="flex-1 p-4 pb-20 md:pb-8 lg:p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">
          House of Quality (QFD)
        </h1>
        <Suspense fallback={<SectionSkeleton />}>
          <QFDContent projectId={projectId} />
        </Suspense>
      </div>
    </section>
  );
```

Replace with:

```tsx
  const downloadArtifacts = await buildHoqDownloadArtifacts(projectId);

  return (
    <section className="flex-1 p-4 pb-20 md:pb-8 lg:p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            House of Quality (QFD)
          </h1>
          {downloadArtifacts.length > 0 && (
            <DownloadDropdown
              artifacts={downloadArtifacts}
              manifestContractVersion="v1"
              projectId={projectId}
            />
          )}
        </div>
        <Suspense fallback={<SectionSkeleton />}>
          <QFDContent projectId={projectId} />
        </Suspense>
      </div>
    </section>
  );
```

- [ ] **Step 3: Verify tsc + commit**

```bash
cd apps/product-helper && npx tsc --noEmit --project tsconfig.json 2>&1 | head -20
git add apps/product-helper/app/\(dashboard\)/projects/\[id\]/system-design/qfd/page.tsx
git commit -m "feat(ui): add DownloadDropdown to QFD/HoQ page"
```

---

## Task E — Stub Viewer Implementations (Priority 3)

### E1 — Data Flows (requirements/data-flows/page.tsx)

**Files:**
- Modify: `app/(dashboard)/projects/[id]/requirements/data-flows/page.tsx`

**Problem:** `DataFlowsViewer` at `components/requirements/data-flows-viewer.tsx` is already built but the page shows a stub. The page already loads `getProjectArtifacts` and the legacy `extractedData.dataFlows` but never passes either to a viewer.

**Data source:** Legacy path = `extractedData.dataFlows` (DataFlows shape). Artifact path = `project_artifacts` row with `artifactKind='data_flows_v1'` and a signed storage URL pointing to the JSON. For v2.1, the legacy path is sufficient; the artifact path is future-proofing.

The `DataFlows` type from `lib/langchain/schemas/module-1/phase-2-5-data-flows` has shape `{ system_name, entries: DataFlowEntry[], coverage_notes?: string[] }`.

- [ ] **Step 1: Replace data-flows/page.tsx with wired viewer**

Replace the entire file content:

```tsx
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProjectById } from '@/app/actions/projects';
import { getProjectArtifacts } from '@/lib/db/queries';
import { DataFlowsViewer } from '@/components/requirements/data-flows-viewer';
import type { DataFlows } from '@/lib/langchain/schemas/module-1/phase-2-5-data-flows';

function SectionSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 rounded animate-pulse bg-muted" />
      <div className="h-64 rounded animate-pulse bg-muted" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border bg-card p-12 text-center">
      <div className="mx-auto max-w-md space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Data Flows</h2>
        <p className="text-sm text-muted-foreground">
          Data flows haven&apos;t been generated yet. Run Deep Synthesis to
          populate the M1 phase-2.5 data flow inventory.
        </p>
      </div>
    </div>
  );
}

async function DataFlowsContent({ projectId }: { projectId: number }) {
  const project = await getProjectById(projectId);
  if (!project) notFound();

  const artifacts = await getProjectArtifacts(projectId);
  const artifactReady = artifacts.some(
    (a) => a.artifactKind === 'data_flows_v1' && a.synthesisStatus === 'ready',
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const legacy = (project as any).projectData?.intakeState?.extractedData
    ?.dataFlows as DataFlows | null | undefined;

  if (!artifactReady && !legacy) {
    return <EmptyState />;
  }

  const dataFlows: DataFlows = legacy ?? {
    system_name: 'System',
    entries: [],
    coverage_notes: ['Artifact ready — detailed view requires synthesis artifact reader.'],
  };

  return <DataFlowsViewer dataFlows={dataFlows} />;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DataFlowsPage({ params }: PageProps) {
  const { id } = await params;
  const projectId = parseInt(id, 10);
  if (isNaN(projectId)) notFound();

  return (
    <section className="flex-1 p-4 pb-20 md:pb-8 lg:p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">Data Flows</h1>
        <Suspense fallback={<SectionSkeleton />}>
          <DataFlowsContent projectId={projectId} />
        </Suspense>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify tsc + commit**

```bash
cd apps/product-helper && npx tsc --noEmit --project tsconfig.json 2>&1 | head -20
git add apps/product-helper/app/\(dashboard\)/projects/\[id\]/requirements/data-flows/page.tsx
git commit -m "feat(ui): wire DataFlowsViewer into data-flows page"
```

---

### E2 — Decision Network Viewer (new component)

**Files:**
- Create: `components/system-design/decision-network-viewer.tsx`
- Modify: `app/(dashboard)/projects/[id]/system-design/decision-network/page.tsx`

**Data source:** `project_artifacts` row with `artifactKind='decision_network_v1'`, `synthesisStatus='ready'`, and a Supabase Storage signed URL pointing to `decision_network.v1.json`. The JSON has top-level fields from the `decision_network.v1` schema produced by `decision-net-agent.ts`.

**Key shape** (from `system-design/kb-upgrade-v2/module-4/decision_network.v1.json` pattern):
```
{
  _schema: "module-4.decision-network.v1",
  system_name: string,
  decision_nodes: Array<{
    id: string,            // DN.NN
    label: string,
    alternatives: Array<{ id: string, label: string, rationale: string }>,
    winning_alternative: { id: string, label: string, rationale: string },
    performance_criteria: Array<{ id: string, name: string, weight: number, score: number }>
  }>,
  pareto_alternatives: Array<{
    id: string,            // AV.NN
    choices: Array<{ decision_node_id: string, alternative_id: string }>,
    utility_total: number,
    on_frontier: boolean
  }>
}
```

For v2.1, render a summary table: decision nodes with winning alternative + rationale. Show Pareto alternatives as a secondary table.

- [ ] **Step 1: Create the DecisionNetworkViewer component**

Create `apps/product-helper/components/system-design/decision-network-viewer.tsx`:

```tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';

interface Alternative {
  id: string;
  label: string;
  rationale?: string;
}

interface DecisionNode {
  id: string;
  label: string;
  alternatives?: Alternative[];
  winning_alternative?: Alternative;
}

interface ParetoAlternative {
  id: string;
  utility_total?: number;
  on_frontier?: boolean;
  choices?: Array<{ decision_node_id: string; alternative_id: string }>;
}

interface DecisionNetworkData {
  system_name?: string;
  decision_nodes?: DecisionNode[];
  pareto_alternatives?: ParetoAlternative[];
}

interface DecisionNetworkViewerProps {
  data: DecisionNetworkData;
}

export function DecisionNetworkViewer({ data }: DecisionNetworkViewerProps) {
  const nodes = data.decision_nodes ?? [];
  const pareto = (data.pareto_alternatives ?? []).filter((a) => a.on_frontier);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Decision Network</CardTitle>
          <CardDescription>
            {nodes.length} decision node{nodes.length !== 1 ? 's' : ''} for{' '}
            {data.system_name ?? 'the system'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {nodes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No decision nodes recorded.</p>
          ) : (
            <div className="divide-y">
              {nodes.map((node) => (
                <div key={node.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-xs font-semibold text-foreground rounded bg-muted px-2 py-0.5 shrink-0">
                      {node.id}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{node.label}</p>
                      {node.winning_alternative && (
                        <div className="mt-2 flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" aria-hidden />
                          <div>
                            <span className="text-sm font-medium text-foreground">
                              {node.winning_alternative.label}
                            </span>
                            {node.winning_alternative.rationale && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {node.winning_alternative.rationale}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      {node.alternatives && node.alternatives.length > 1 && (
                        <div className="mt-2">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                            All alternatives
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {node.alternatives.map((alt) => (
                              <Badge
                                key={alt.id}
                                variant="outline"
                                className="text-[10px]"
                              >
                                {alt.label}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {pareto.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pareto Frontier</CardTitle>
            <CardDescription>
              {pareto.length} non-dominated architecture vector{pareto.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr>
                    <th className="border px-3 py-2 bg-muted font-semibold text-foreground text-left">ID</th>
                    <th className="border px-3 py-2 bg-muted font-semibold text-foreground text-left">Utility</th>
                    <th className="border px-3 py-2 bg-muted font-semibold text-foreground text-left">Choices</th>
                  </tr>
                </thead>
                <tbody>
                  {pareto.map((alt) => (
                    <tr key={alt.id}>
                      <td className="border px-3 py-2 font-mono text-foreground">{alt.id}</td>
                      <td className="border px-3 py-2 text-foreground">
                        {alt.utility_total != null ? alt.utility_total.toFixed(3) : '—'}
                      </td>
                      <td className="border px-3 py-2 text-muted-foreground">
                        {alt.choices
                          ?.map((c) => `${c.decision_node_id}→${c.alternative_id}`)
                          .join(', ') ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Update decision-network/page.tsx to load and render**

Replace the `DecisionNetworkContent` function and its surrounding page:

```tsx
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProjectById } from '@/app/actions/projects';
import { getProjectArtifacts } from '@/lib/db/queries';
import { getSignedUrl } from '@/lib/storage/supabase-storage';
import { DecisionNetworkViewer } from '@/components/system-design/decision-network-viewer';

function SectionSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-56 rounded animate-pulse bg-muted" />
      <div className="h-96 rounded animate-pulse bg-muted" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border bg-card p-12 text-center">
      <div className="mx-auto max-w-md space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Decision Network</h2>
        <p className="text-sm text-muted-foreground">
          The decision network hasn&apos;t been generated yet. Run Deep Synthesis
          to populate the M4 decision graph and Pareto alternatives.
        </p>
      </div>
    </div>
  );
}

async function DecisionNetworkContent({ projectId }: { projectId: number }) {
  const project = await getProjectById(projectId);
  if (!project) notFound();

  const artifacts = await getProjectArtifacts(projectId);
  const row = artifacts.find(
    (a) => a.artifactKind === 'decision_network_v1' && a.synthesisStatus === 'ready',
  );

  if (!row?.storagePath) return <EmptyState />;

  let data: Record<string, unknown> | null = null;
  try {
    const cache = new Map<string, string>();
    const url = await getSignedUrl(row.storagePath, undefined, cache);
    const res = await fetch(url, { cache: 'no-store' });
    if (res.ok) data = await res.json() as Record<string, unknown>;
  } catch { /* fall through to empty */ }

  if (!data) return <EmptyState />;

  return <DecisionNetworkViewer data={data as never} />;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DecisionNetworkPage({ params }: PageProps) {
  const { id } = await params;
  const projectId = parseInt(id, 10);
  if (isNaN(projectId)) notFound();

  return (
    <section className="flex-1 p-4 pb-20 md:pb-8 lg:p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">Decision Network</h1>
        <Suspense fallback={<SectionSkeleton />}>
          <DecisionNetworkContent projectId={projectId} />
        </Suspense>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verify tsc + commit**

```bash
cd apps/product-helper && npx tsc --noEmit --project tsconfig.json 2>&1 | head -20
git add apps/product-helper/components/system-design/decision-network-viewer.tsx apps/product-helper/app/\(dashboard\)/projects/\[id\]/system-design/decision-network/page.tsx
git commit -m "feat(ui): implement DecisionNetworkViewer with Pareto table"
```

---

### E3 — Form-Function Map Viewer (new component)

**Files:**
- Create: `components/system-design/form-function-map-viewer.tsx`
- Modify: `app/(dashboard)/projects/[id]/system-design/form-function-map/page.tsx`

**Data source:** `project_artifacts` row with `artifactKind='form_function_map_v1'`, `synthesisStatus='ready'`. The JSON conforms to `formFunctionMapV1Schema` from `lib/langchain/schemas/module-5/phase-7-form-function-handoff.ts`.

**Key shape** (render: forms × functions matrix from `phase_3_concept_mapping_matrix`):
- Forms list: `phase_1_form_inventory.forms[]` → `{ id, name, realizes_functions[] }`
- Functions list: `phase_2_function_inventory.functions[]` → `{ id, name }`
- Matrix: `phase_3_concept_mapping_matrix.cells[]` → `{ form_id, function_id, score }`

Render a form-function matrix table: rows=functions, columns=forms, cells=score (or ✓/–).

- [ ] **Step 1: Create the FormFunctionMapViewer component**

Create `apps/product-helper/components/system-design/form-function-map-viewer.tsx`:

```tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FormEntry {
  id: string;
  name: string;
  realizes_functions?: string[];
}

interface FunctionEntry {
  id: string;
  name: string;
}

interface MatrixCell {
  form_id: string;
  function_id: string;
  score?: number;
  interaction_type?: string;
}

interface FormFunctionMapData {
  system_name?: string;
  phase_1_form_inventory?: { forms?: FormEntry[] };
  phase_2_function_inventory?: { functions?: FunctionEntry[] };
  phase_3_concept_mapping_matrix?: { cells?: MatrixCell[] };
}

interface FormFunctionMapViewerProps {
  data: FormFunctionMapData;
}

function scoreToDisplay(score: number | undefined): string {
  if (score == null) return '—';
  if (score >= 0.7) return '●●●';
  if (score >= 0.4) return '●●○';
  if (score > 0) return '●○○';
  return '—';
}

function scoreToStyle(score: number | undefined): string {
  if (score == null || score === 0) return 'text-muted-foreground/30';
  if (score >= 0.7) return 'text-green-600 dark:text-green-400';
  if (score >= 0.4) return 'text-amber-600 dark:text-amber-400';
  return 'text-muted-foreground';
}

export function FormFunctionMapViewer({ data }: FormFunctionMapViewerProps) {
  const forms = data.phase_1_form_inventory?.forms ?? [];
  const functions = data.phase_2_function_inventory?.functions ?? [];
  const cells = data.phase_3_concept_mapping_matrix?.cells ?? [];

  const cellMap = new Map<string, MatrixCell>();
  for (const cell of cells) {
    cellMap.set(`${cell.function_id}::${cell.form_id}`, cell);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Form-Function Map</CardTitle>
          <CardDescription>
            {functions.length} function{functions.length !== 1 ? 's' : ''} ×{' '}
            {forms.length} form{forms.length !== 1 ? 's' : ''} for{' '}
            {data.system_name ?? 'the system'}. Strength: ●●● high · ●●○ medium · ●○○ low
          </CardDescription>
        </CardHeader>
        <CardContent>
          {forms.length === 0 || functions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No mapping data available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr>
                    <th className="border px-2 py-2 bg-muted font-semibold text-foreground text-left min-w-[140px]">
                      Function
                    </th>
                    {forms.map((form) => (
                      <th
                        key={form.id}
                        className="border px-2 py-2 bg-muted font-semibold text-foreground text-center min-w-[80px]"
                      >
                        <div className="font-mono">{form.id}</div>
                        <div className="text-[10px] font-normal text-muted-foreground truncate max-w-[80px]">
                          {form.name}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {functions.map((fn) => (
                    <tr key={fn.id}>
                      <td className="border px-2 py-2 text-foreground">
                        <span className="font-mono text-[10px] text-muted-foreground mr-1">{fn.id}</span>
                        {fn.name}
                      </td>
                      {forms.map((form) => {
                        const cell = cellMap.get(`${fn.id}::${form.id}`);
                        return (
                          <td
                            key={form.id}
                            className={cn('border px-2 py-2 text-center font-mono', scoreToStyle(cell?.score))}
                            title={cell ? `Score: ${cell.score ?? 'n/a'}` : undefined}
                          >
                            {scoreToDisplay(cell?.score)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Update form-function-map/page.tsx**

Replace the entire file:

```tsx
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProjectById } from '@/app/actions/projects';
import { getProjectArtifacts } from '@/lib/db/queries';
import { getSignedUrl } from '@/lib/storage/supabase-storage';
import { FormFunctionMapViewer } from '@/components/system-design/form-function-map-viewer';

function SectionSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-56 rounded animate-pulse bg-muted" />
      <div className="h-96 rounded animate-pulse bg-muted" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border bg-card p-12 text-center">
      <div className="mx-auto max-w-md space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Form-Function Map</h2>
        <p className="text-sm text-muted-foreground">
          The form-function map hasn&apos;t been generated yet. Run Deep Synthesis
          to populate the M5 mapping between FFBD functions and architectural forms.
        </p>
      </div>
    </div>
  );
}

async function FormFunctionMapContent({ projectId }: { projectId: number }) {
  const project = await getProjectById(projectId);
  if (!project) notFound();

  const artifacts = await getProjectArtifacts(projectId);
  const row = artifacts.find(
    (a) => a.artifactKind === 'form_function_map_v1' && a.synthesisStatus === 'ready',
  );

  if (!row?.storagePath) return <EmptyState />;

  let data: Record<string, unknown> | null = null;
  try {
    const cache = new Map<string, string>();
    const url = await getSignedUrl(row.storagePath, undefined, cache);
    const res = await fetch(url, { cache: 'no-store' });
    if (res.ok) data = await res.json() as Record<string, unknown>;
  } catch { /* fall through */ }

  if (!data) return <EmptyState />;

  return <FormFunctionMapViewer data={data as never} />;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function FormFunctionMapPage({ params }: PageProps) {
  const { id } = await params;
  const projectId = parseInt(id, 10);
  if (isNaN(projectId)) notFound();

  return (
    <section className="flex-1 p-4 pb-20 md:pb-8 lg:p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">Form-Function Map</h1>
        <Suspense fallback={<SectionSkeleton />}>
          <FormFunctionMapContent projectId={projectId} />
        </Suspense>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verify tsc + commit**

```bash
cd apps/product-helper && npx tsc --noEmit --project tsconfig.json 2>&1 | head -20
git add apps/product-helper/components/system-design/form-function-map-viewer.tsx apps/product-helper/app/\(dashboard\)/projects/\[id\]/system-design/form-function-map/page.tsx
git commit -m "feat(ui): implement FormFunctionMapViewer with form×function matrix"
```

---

## Task F — Sidebar Status Indicators (Priority 4)

**Files:**
- Modify: `lib/db/queries/explorer.ts`
- Modify: `components/project/overview/artifact-pipeline.tsx`
- Modify: `components/projects/explorer/explorer-tree.tsx`

**Problem:** The sidebar and ArtifactPipeline show green/gray dots based on `extractedData` presence, which is true for intake-gated data. Pages that require synthesis artifacts (FMEA, QFD, Decision Network, Form-Function Map, Data Flows, Synthesis/Recommendation) always show gray — even when synthesis is done — because `hasData` never queries `project_artifacts`. The fix: add `synthesis_status` flags to `ExplorerData`.

**Note:** `getExplorerData` in `lib/db/queries/explorer.ts` currently does NOT import or query `project_artifacts`. We need to add that query and expose flags. The existing `ExplorerData.hasData` record grows with new boolean keys.

- [ ] **Step 1: Add synthesis flags to getExplorerData**

In `lib/db/queries/explorer.ts`, add the `projectArtifacts` table import and a new parallel query.

Find the imports block — it imports from `@/lib/db/schema`. Add `projectArtifacts` to that import:

```tsx
import {
  projects,
  projectData,
  artifacts,
  userStories,
  conversations,
  projectArtifacts,     // add this
} from '@/lib/db/schema';
```

Find the `getExplorerData` function's `Promise.all` block. Add a 6th parallel query for synthesis artifacts. **Use `db.select()` (not `db.query.*`) — `projectArtifacts` has no Drizzle relations registered:**

```tsx
  const [projectResult, dataResult, artifactCountResult, storyCountResult, conversationCountResult, synthesisRows] =
    await Promise.all([
      // ...existing 5 queries unchanged...
      db
        .select({
          artifactKind: projectArtifacts.artifactKind,
          synthesisStatus: projectArtifacts.synthesisStatus,
        })
        .from(projectArtifacts)
        .where(eq(projectArtifacts.projectId, projectId)),
    ]);
```

Then after the existing `hasData` computation block, add synthesis helpers:

```tsx
  const synthReady = (kind: string) =>
    synthesisRows.some(
      (r) => r.artifactKind === kind && r.synthesisStatus === 'ready',
    );
  const synthPending = (kind: string) =>
    synthesisRows.some(
      (r) => r.artifactKind === kind && r.synthesisStatus === 'pending',
    );
```

Extend the `hasData` return object:

```tsx
    hasData: {
      // ... existing keys unchanged ...
      hasFfbd: hasJsonbData(extractedData?.ffbd),
      hasDecisionMatrix: hasJsonbData(extractedData?.decisionMatrix),
      hasQfd: hasJsonbData(extractedData?.qfd),
      hasInterfaces: hasJsonbData(extractedData?.interfaces),
      // synthesis-gated items
      hasFmea: earlyReady || residualReady,         // existing local vars
      hasDataFlows: hasJsonbData(extractedData?.dataFlows) || synthReady('data_flows_v1'),
      hasDecisionNetwork: synthReady('decision_network_v1'),
      hasFormFunctionMap: synthReady('form_function_map_v1'),
      hasSynthesisRecommendation: synthReady('recommendation_json'),
      hasHoq: hasJsonbData(extractedData?.qfd) || synthReady('hoq_xlsx'),
    },
```

(Note: `synthPending` helper is defined but not used in this iteration — the sidebar shows green/gray only. A future iteration can wire pending state to a yellow/amber dot in `ExplorerNode`. Drop the helper if unused at lint time.)

Also add the `hasFmea` local vars before the return (since they existed in `fmea/page.tsx` but not in `explorer.ts`):

```tsx
  const earlyReady = synthesisRows.some(
    (r) => r.artifactKind === 'fmea_early_xlsx' && r.synthesisStatus === 'ready',
  );
  const residualReady = synthesisRows.some(
    (r) => r.artifactKind === 'fmea_residual_xlsx' && r.synthesisStatus === 'ready',
  );
```

Also update the `ExplorerData` type at the top of the file to add these new fields to `hasData`:

```tsx
  hasData: {
    // ... existing fields ...
    hasFfbd: boolean;
    hasDecisionMatrix: boolean;
    hasQfd: boolean;
    hasInterfaces: boolean;
    // synthesis-gated
    hasFmea: boolean;
    hasDataFlows: boolean;
    hasDecisionNetwork: boolean;
    hasFormFunctionMap: boolean;
    hasSynthesisRecommendation: boolean;
    hasHoq: boolean;
  };
```

- [ ] **Step 2: Verify tsc after explorer changes**

```bash
cd apps/product-helper && npx tsc --noEmit --project tsconfig.json 2>&1 | head -30
```

- [ ] **Step 3: Add system-design section to ExplorerTree**

In `components/projects/explorer/explorer-tree.tsx`, add new imports at the top (add `FlaskConical`, `Network`, `Layers` to the existing lucide-react import if not present, plus `Clock` for pending state):

```tsx
import {
  // ... existing imports ...
  FlaskConical,
  Network,
  Layers3,
  Clock,
  Sparkles as SynthesisIcon,
  HelpCircle,
  GitFork,
} from 'lucide-react';
```

In the `sections` array (inside `useMemo`), add a `system-design` section after the `backend` section:

```tsx
      {
        id: 'system-design',
        label: 'System Design',
        icon: Layers3,
        children: [
          {
            id: 'ffbd',
            label: 'FFBD',
            icon: GitFork,
            href: `${basePath}/system-design/ffbd`,
            hasData: data.hasData.hasFfbd,
          },
          {
            id: 'decision-matrix',
            label: 'Decision Matrix',
            icon: LayoutDashboard,
            href: `${basePath}/system-design/decision-matrix`,
            hasData: data.hasData.hasDecisionMatrix,
          },
          {
            id: 'interfaces',
            label: 'Interfaces',
            icon: Network,
            href: `${basePath}/system-design/interfaces`,
            hasData: data.hasData.hasInterfaces,
          },
          {
            id: 'qfd',
            label: 'House of Quality',
            icon: Target,
            href: `${basePath}/system-design/qfd`,
            hasData: data.hasData.hasHoq,
          },
          {
            id: 'fmea',
            label: 'FMEA',
            icon: FlaskConical,
            href: `${basePath}/system-design/fmea`,
            hasData: data.hasData.hasFmea,
          },
          {
            id: 'data-flows',
            label: 'Data Flows',
            icon: GitBranch,
            href: `${basePath}/requirements/data-flows`,
            hasData: data.hasData.hasDataFlows,
          },
          {
            id: 'decision-network',
            label: 'Decision Network',
            icon: Network,
            href: `${basePath}/system-design/decision-network`,
            hasData: data.hasData.hasDecisionNetwork,
          },
          {
            id: 'form-function-map',
            label: 'Form-Function Map',
            icon: Layers3,
            href: `${basePath}/system-design/form-function-map`,
            hasData: data.hasData.hasFormFunctionMap,
          },
          {
            id: 'synthesis',
            label: 'Architecture Rec.',
            icon: SynthesisIcon,
            href: `${basePath}/synthesis`,
            hasData: data.hasData.hasSynthesisRecommendation,
          },
          {
            id: 'open-questions',
            label: 'Open Questions',
            icon: HelpCircle,
            href: `${basePath}/requirements/open-questions`,
          },
        ],
      },
```

- [ ] **Step 4: Verify tsc + commit**

```bash
cd apps/product-helper && npx tsc --noEmit --project tsconfig.json 2>&1 | head -20
git add apps/product-helper/lib/db/queries/explorer.ts apps/product-helper/components/projects/explorer/explorer-tree.tsx
git commit -m "feat(ui): add synthesis-aware status indicators to sidebar for system-design pages"
```

---

## Spec Coverage Check

| Spec item | Task |
|---|---|
| P1A — Open Questions page renders data | Task A |
| P1B — SEQ-002 friendly message | Task B (freeze exception) |
| P2C — DiagramViewer PPTX + MMD buttons | Task C |
| P2D — DownloadDropdown on FMEA | Task D1 |
| P2D — DownloadDropdown on QFD | Task D2 (freeze exception) |
| P2D — Recommendation page already has DownloadDropdown | ✅ already done (via RecommendationViewer) |
| P3 — Data Flows real viewer | Task E1 |
| P3 — Decision Network real viewer | Task E2 |
| P3 — Form-Function Map real viewer | Task E3 |
| P4 — Sidebar ⏳ pending for synthesis pages | Task F |

## Freeze Exceptions Required

Before execution, confirm with David:
1. **Task B** — `components/system-design/interfaces-viewer.tsx` line 337: change raw error code to friendly message
2. **Task D2** — `app/(dashboard)/projects/[id]/system-design/qfd/page.tsx`: add DownloadDropdown to page header only
