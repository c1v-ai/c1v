# CLAUDE.md Draft Diff — TA2 Wave A

**Status:** `pending-david-review`
**Authored:** 2026-04-25 by `docs` (TA2)
**File:** `apps/product-helper/CLAUDE.md`
**Authority:** Per spec line 444 — file-safety rule requires explicit David
authorization before applying. This file surfaces the proposed diff; do NOT
apply directly.

---

## Proposed Edits

### 1. `Deployed Features` section — add Synthesis Viewer entry

**Insert** between line 141 (`Synthesis Pipeline kickoff` entry) and line
142 (the blank before `## UI Freeze`):

```diff
 - **Synthesis Pipeline kickoff** (Wave A — Apr 25, 2026) — `POST /api/projects/[id]/synthesize` + `GET /synthesize/status` + extended `GET /artifacts/manifest`. Boundary D-V21.24: Vercel orchestrates, Cloud Run renders. Helpers in `lib/billing/synthesis-tier.ts`, `lib/storage/supabase-storage.ts`, `lib/synthesis/{artifacts-bridge,kickoff}.ts`. Sidecar at `services/python-sidecar/` (separate README). Manifest contract v1 frozen at `plans/v21-outputs/ta3/manifest-contract.md`.
+- **Synthesis Viewer** (TA2 Wave A — Apr 25, 2026, tag `ta2-wave-a-complete` @ `1da5ac0`) — `/projects/[id]/synthesis` route. 5-section `RecommendationViewer` (callout / rationale / references / risks / tradeoffs / figures) + `ProvenanceAccordion` + `DownloadDropdown`. Data source: `getLatestSynthesis(projectId)` reading `project_artifacts` rows of `kind='recommendation_*'`. Pre-synthesis empty-state per **D-V21.17** + **EC-V21-A.16** composes 5× `EmptySectionState` (NO canned exemplar values). Components in `components/synthesis/` — see family README. Empty-state primitive at `components/projects/sections/empty-section-state.tsx`.
+- **Architecture & Database section** (TA2 Wave A) — merged surface at `components/projects/sections/architecture-and-database-section.tsx` replacing legacy `architecture-section.tsx` + `schema-section.tsx` (EC-V21-A.6). Two sub-panes: alternative-picker (Pareto frontier from `decisionNetwork.alternatives`) + schema-approval-gate (DBML export via `lib/dbml/sql-to-dbml.ts`, `@dbml/core` programmatic API). Approval persists to `extractedData.schema.{approvedAt, approvedBy, approvedSha}`; re-extraction drops approval automatically.
+- **Open Questions archive** (TA2 Wave A) — `/projects/[id]/requirements/open-questions` read-only collapsible-accordion view. 3-source rollup: `extractedData.openQuestions.{requirements, qfdResolved, riskResolved}`. Status pill (`open` / `resolved` / `deferred`) + 'Resolved by' link + 'Jump to chat thread' deep link (`?messageId=<uuid>`). Component at `components/requirements/open-questions-viewer.tsx`.
+- **Data Flows viewer** (TA2 Wave A) — `/projects/[id]/requirements/data-flows`. Renders M1 phase-2.5 `data_flows.v1.json` (DE.NN entries). Component at `components/requirements/data-flows-viewer.tsx`.
+- **N2 Matrix tab** (TA2 Wave A — EC-V21-A.5) — promoted to first tab on `/projects/[id]/system-design/interfaces`. Tab order: N2 Matrix → Sequence Diagrams → Interface Specs. Component at `components/system-design/n2-matrix-tab.tsx` (sibling to FROZEN `interfaces-viewer.tsx`).
+- **FMEA route** (TA2 Wave A — EC-V21-A.3, D-V21.15) — promoted to nav. `/projects/[id]/system-design/fmea` reads from `project_artifacts` (`fmea_early` + `fmea_residual` kinds) via `getProjectArtifacts(projectId)`. Empty-state pre-synthesis (NO exemplar fall-back per D-V21.17).
+- **Bundle ZIP export** (TA2 Wave A — EC-V21-A.9, D-V21.11) — `POST /api/projects/[id]/export/bundle` streams a project archive (JSON + HTML + PDF + PPTX + xlsx + Mermaid sources, mirroring `kb-upgrade-v2/module-N/` layout). Connections-page entry at `components/connections/bundle-zip-entry.tsx`. Hard cap 50MB; Mermaid PNGs downscaled to 1200×800 per R-V21.07.
```

### 2. Update legacy `System-Design Viewers` line — note FMEA promotion

**Edit** line 138:

```diff
-- **System-Design Viewers** — 5 routes at `/projects/[id]/system-design/{decision-matrix,ffbd,qfd,interfaces}/page.tsx` + `/diagrams` (Mermaid). Data source: `project.projectData.intakeState.extractedData.{decisionMatrix,ffbd,qfd,interfaces}`. Viewer components in `components/system-design/` + `components/diagrams/diagram-viewer.tsx`.
+- **System-Design Viewers** — 6 routes at `/projects/[id]/system-design/{decision-matrix,ffbd,qfd,interfaces,fmea}/page.tsx` + `/diagrams` (Mermaid). FMEA promoted to nav in v2.1 Wave A (D-V21.15). Decision Network coexists as sibling to Decision Matrix — Decision Matrix NOT renamed (locked critique iter-1). Data source: `project.projectData.intakeState.extractedData.{decisionMatrix,ffbd,qfd,interfaces}` for legacy four; FMEA reads from `project_artifacts`. Viewer components in `components/system-design/` + `components/diagrams/diagram-viewer.tsx`.
```

### 3. Update legacy `Requirements & Backend Section Viewers` line — add new routes

**Edit** line 139:

```diff
-- **Requirements & Backend Section Viewers** — 7 routes at `/projects/[id]/requirements/{problem-statement,system-overview,goals-metrics,user-stories,architecture,tech-stack,nfr}/` + 4 backend routes at `/projects/[id]/backend/{schema,api-spec,guidelines,infrastructure}/`. 13 section components in `components/projects/sections/`.
+- **Requirements & Backend Section Viewers** — 9 routes at `/projects/[id]/requirements/{problem-statement,system-overview,goals-metrics,user-stories,architecture,tech-stack,nfr,data-flows,open-questions}/` (+ `data-flows` and `open-questions` added in v2.1 Wave A) + 4 backend routes at `/projects/[id]/backend/{schema,api-spec,guidelines,infrastructure}/`. Architecture + Schema merged into single `architecture-and-database-section.tsx` host (EC-V21-A.6). Section components in `components/projects/sections/`.
```

### 4. `UI Freeze` table — note `fmea-viewer.tsx` is MODIFIABLE-IN-V21

**Insert** after line 153 (the existing 5-row frozen table):

```diff
 | 🔒 Frozen | `components/diagrams/diagram-viewer.tsx` | " |
+| 🟡 Modifiable in v2.1 | `components/system-design/fmea-viewer.tsx` | Handoff Issue 8 — TA2.nav-and-pages edits its data wire to read from `project_artifacts`. Stays MODIFIABLE through v2.1; re-frozen at v2.2 cut. |
```

---

## Notes for Reviewer

- All new entries cite the exact EC / D-V21 / R-V21 anchors so the audit trail
  is intact.
- `Synthesis Viewer` entry includes the tag + commit SHA for the verifier
  artifact so anyone resuming after `/clear` can `git checkout 1da5ac0` to
  inspect the baseline.
- The `fmea-viewer.tsx` row is **additive** — it does not change the auto-FAIL
  list in `verify-ta2.ts` (5 files: decision-matrix, ffbd, qfd, interfaces,
  diagram-viewer). It documents the intentional carve-out.
- No content removed; all edits are additive or clarifying. Safe to apply
  after David's review.

## Apply Procedure (after David's review)

```bash
# After authorization:
cd /Users/davidancor/Projects/c1v
# Apply edits manually via Edit tool — do not script blind sed.
# Verify diff:
git diff apps/product-helper/CLAUDE.md
# Commit:
git add apps/product-helper/CLAUDE.md
git commit -m "docs(ta2): document Wave A synthesis routes + nav entries in CLAUDE.md"
```
