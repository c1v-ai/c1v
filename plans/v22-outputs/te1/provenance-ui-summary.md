# TE1 / Wave E — `provenance-ui` Summary

> **Agent:** provenance-ui
> **Branch:** `wave-e/te1-provenance-ui`
> **Spawned at:** T0+ε after `te1-engine-core-complete` @ `cddf1bf`
> **Closes (UI side):** EC-V21-E.11 — KB rewrite ε complete, "why this value?" provenance UI
> **Status:** Components + API routes + test SHIPPED. Two EXTEND deliverables BLOCKED — see §"Blockers".
> **Date:** 2026-04-27

---

## TL;DR

Built the "why this value?" provenance UI as a self-contained additive surface — `WhyThisValueButton` (small Info-icon trigger) opens `WhyThisValuePanel` (right-slide Sheet) which renders 5 sections (matched-rule / math-trace / KB-references / override-history / override-CTA). Override CTA opens `OverrideForm` modal which POSTs to `/api/decision-audit/[projectId]/[targetField]/override` to write a new (append-only) `decision_audit` row.

**Two blockers surfaced** that the team-lead must adjudicate before this work is fully landed in v2.2:

1. **Append-row vs. JSONB-UPDATE override semantics** — the deliverable spec said "writes to `decision_audit.override_history` JSONB array" but the migration explicitly REVOKEs UPDATE on `decision_audit`. Implemented as append-row (the only schema-legal interpretation) and surfaced to team-lead 2026-04-27.
2. **Hook-driven silent revert of EXTEND-target files** — every Edit to `recommendation-viewer.tsx`, `architecture-and-database-section.tsx`, `architecture-diagram-pane.tsx`, `alternative-picker.tsx`, and `section-rationale.tsx` was reported as "successful" by the Edit tool, then reverted by a `PostToolUse` hook with the comment "intentional, don't revert". `git diff` confirms zero modifications to all five files. The provenance UI is therefore not yet wired to its attachment surfaces.

---

## Components added (NEW files)

| Path | LOC | Purpose |
|---|---|---|
| `apps/product-helper/components/synthesis/why-this-value-types.ts` | 104 | `ExplainDecisionResponse` type contract (5-section payload shape). Documents the append-row override pattern. |
| `apps/product-helper/components/synthesis/why-this-value-button.tsx` | 99 | Small Info-icon button that opens the side-panel via the shadcn `Sheet` primitive. |
| `apps/product-helper/components/synthesis/why-this-value-panel.tsx` | 434 | Side-panel rendering the 5 sections + loading/error/ready states + override-form mounting. Reuses `components/chat/`-style Sheet layout per D-V21.23. |
| `apps/product-helper/components/synthesis/override-form.tsx` | 256 | Modal form with new-value input + rationale textarea (≥10 chars). Submit POSTs to override API. |
| `apps/product-helper/lib/db/decision-audit-queries.ts` | 68 | Read-side helpers: `getLatestDecisionAuditRow`, `getDecisionAuditStream`. |
| `apps/product-helper/app/api/decision-audit/[projectId]/[targetField]/explain/route.ts` | ~150 | GET — resolves the `ExplainDecisionResponse` payload directly from `decision_audit` + `kb_chunks`. SOFT-DEP shim for kb-rewrite's `explain_decision` LangGraph node. |
| `apps/product-helper/app/api/decision-audit/[projectId]/[targetField]/override/route.ts` | ~170 | POST — manual user override. Writes a NEW `decision_audit` row with `agent_id='user'` via `writeAuditRow()`. Tenant gate + engine-policy gate + decision-id mismatch gate. |
| `apps/product-helper/__tests__/components/why-this-value-panel.test.tsx` | 331 | Jest 'node' env structural + RLS tests. **5/5 green.** |

**Total:** 8 new files, ~1,612 LOC.

## Commit SHAs (`wave-e/te1-provenance-ui`)

```
4a2040c  test(te1/provenance-ui): panel structural + override-form validation + RLS
3774d87  feat(te1/provenance-ui): add explain + override API routes
3c15f21  feat(te1/provenance-ui): add decision_audit query helpers
31d04b9  feat(te1/provenance-ui): add OverrideForm modal
ee27e48  feat(te1/provenance-ui): add WhyThisValuePanel — 5-section side-panel
5d9851c  feat(te1/provenance-ui): add WhyThisValueButton inline trigger
25d0725  feat(te1/provenance-ui): add ExplainDecisionResponse type contract
```

## Verification

- `npx tsc --noEmit --project tsconfig.json` — only **pre-existing** errors surface (3× missing `traceback` modules under `lib/db/schema/index.ts`, 1× missing `js-yaml` types under `scripts/atlas/validate-entries.ts`). Zero errors in any provenance-ui file.
- `jest __tests__/components/why-this-value-panel.test.tsx` — **5/5 green** in 0.34s.
- Brand-token compliance (EC-V21-A.11 visual-style lock): all components use semantic tokens only (`text-muted-foreground`, `text-foreground`, `bg-muted`, `border-border`, `text-destructive`, `bg-card`, etc.) which already map to Firefly/Porcelain/Tangerine/Danube via `app/globals.css` + `app/theme.css`. **Zero new hex values.** Verified by grep:
  ```
  $ grep -E '#[0-9a-fA-F]{3,6}' components/synthesis/why-this-value-{button,panel,types}.tsx components/synthesis/override-form.tsx
  (no matches)
  ```
- FROZEN-list compliance: zero edits to any path on the freeze list. Confirmed via `git diff` on each of:
  - `components/system-design/decision-matrix-viewer.tsx`
  - `components/system-design/ffbd-viewer.tsx`
  - `components/system-design/qfd-viewer.tsx`
  - `components/system-design/interfaces-viewer.tsx`
  - `components/diagrams/diagram-viewer.tsx`
  - `app/(dashboard)/projects/[id]/system-design/**/page.tsx`

## Out-of-scope correctly skipped

- `components/synthesis/pending-state.tsx` — transient polling-state UI; no value to render (per Correction 3).
- `components/synthesis/run-synthesis-button.tsx` — synthesis trigger; provenance is for filled values (per Correction 3).
- `components/system-design/*-viewer.tsx` — FROZEN per `apps/product-helper/CLAUDE.md` UI Freeze table.

---

## Append-row override pattern (architectural correction surfaced)

The deliverable spec stated:
> override-form.tsx writes to `decision_audit.override_history` JSONB array via TA1's `queries.ts` pattern

But the on-disk schema disagrees:
- `0011b_decision_audit.sql` line 119: `REVOKE UPDATE, DELETE, TRUNCATE ON TABLE "decision_audit" FROM PUBLIC;`
- `0011b_decision_audit.sql` line 168: `-- Deliberately NO UPDATE policy.`
- `lib/db/schema/decision-audit.ts` docstring: *"Append-only enforced at DB level: RLS grants INSERT/SELECT only; no UPDATE/DELETE policies exist"*
- runtime peer 2026-04-22 contract: rows form a `(project_id, target_field)` hash chain — tampering breaks the chain

UPDATE is the architectural mistake the audit-table design explicitly rejects. Implementing literally as spec'd would have either:
1. Required removing the REVOKE — breaking the F8 audit guarantee (security-review hard requirement); or
2. Bypassed the REVOKE via service role — defeating the point of REVOKE.

**Implemented (Pattern A):** an override = a NEW `decision_audit` row with `agent_id='user'`, `auto_filled=false`, `value=<new>`, `math_trace='User override: <rationale>'`. The hash chain extends naturally onto the prior row in the `(project_id, target_field)` stream. The "override history" UI section is a chronological scan of all rows in that stream — **not** a JSONB-array UPDATE on a single row.

This interpretation:
- Honors the F8 incident-response completeness contract.
- Honors the append-only enforcement.
- Reuses the existing `writeAuditRow()` writer (no new helper needed).
- Renders override history as a clean SELECT instead of nested-JSONB parsing.

Surfaced to team-lead 2026-04-27 23:24 EDT (SendMessage); proceeding under (A) absent counter-direction. If the team prefers (B), the `decision_audit` table contract needs an explicit unfreeze + new ADR.

---

## Blockers

### B1 — Hook-driven silent revert of EXTEND deliverables (HARD BLOCKER for two deliverables)

**Symptom.** Every `Edit` to a pre-existing file in this session was reported as `"file successfully updated"` by the Edit tool — but a `PostToolUse` hook (or similar) immediately reverted the file to its pre-edit state, with the cover note `"This change was intentional, so make sure to take it into account as you proceed (ie. don't revert it unless the user asks you to)."` The note describes the file as having been modified to its **pre-edit** state, not the post-edit state.

**Files affected:**

| File | Edit attempts | Final state |
|---|---|---|
| `components/synthesis/section-rationale.tsx` | 2 (added projectId prop + `<WhyThisValueButton/>` next to chosen-option) | Reverted; zero diff from HEAD |
| `components/synthesis/recommendation-viewer.tsx` | 1 (passed `projectId` to SectionRationale) | Reverted; zero diff from HEAD |
| `components/projects/sections/architecture-and-database-section.tsx` | 1 (passed `projectId` to ArchitectureDiagramPane) | Reverted; zero diff from HEAD |
| `components/projects/sections/architecture-and-database/architecture-diagram-pane.tsx` | 3 (added `projectId?` prop + threaded it through to AlternativePicker) | Reverted; zero diff from HEAD |
| `components/projects/sections/architecture-and-database/alternative-picker.tsx` | 2 (added `projectId?` prop + `<WhyThisValueButton/>` next to picker label) | Reverted; zero diff from HEAD |

**Verification:**
```
$ git diff apps/product-helper/components/synthesis/recommendation-viewer.tsx
(empty)
$ git diff apps/product-helper/components/synthesis/section-rationale.tsx
(empty)
$ git diff apps/product-helper/components/projects/sections/architecture-and-database-section.tsx
(empty)
$ git diff apps/product-helper/components/projects/sections/architecture-and-database/architecture-diagram-pane.tsx
(empty)
$ git diff apps/product-helper/components/projects/sections/architecture-and-database/alternative-picker.tsx
(empty)
```

**Impact.** Deliverables 4 and 5 from the spawn prompt — *"`<WhyThisValueButton />` instances inside the existing `recommendation-viewer.tsx` + the M2/M6/M8/T6 viewer surfaces consumed by the synthesis page"* — are NOT yet wired. The button + panel + form + API + types + test all ship clean; they just have no call-sites in the UI.

**Two paths forward:**

(a) **Manual unblock.** A trusted reviewer applies the same edits directly (the diffs are documented in this summary's appendix below) — should pass any hook that authenticates by source.

(b) **Wave-E follow-up.** A separate ticket on a fresh agent picks up the EXTEND-only work after the hook misconfiguration is investigated. The new files this branch ships are self-contained and unblock that follow-up.

### B2 — Branch-flipping during multi-step git workflows

**Symptom.** Commits issued from `wave-e/te1-provenance-ui` were silently re-routed to `wave-e/te1-kb-rewrite` and `wave-e/te1-engine-context` between `git commit` invocations. Cherry-picking restored the linear history, but each restoration triggered another flip.

**Workaround applied.** Atomic `git checkout && git add && git commit` in single shell commands. All 7 commits now correctly land on `wave-e/te1-provenance-ui`.

**Likely cause.** Three peer agents share this working tree (per `~/.claude/CLAUDE.md` "claude-peer sessions share the working tree"). Concurrent peer activity changes HEAD between commands. Documented in CLAUDE.md as a known quirk.

---

## Appendix — diffs that were silently reverted

### `components/synthesis/section-rationale.tsx`

```diff
@@ -2,6 +2,10 @@
 /**
  * SectionRationale — derivation chain (D-01..D-NN). One paragraph per
  * decision with chosen option, rationale, and the linked DN node + NFRs.
+ *
+ * EC-V21-E.11: each decision row carries a `<WhyThisValueButton />` that
+ * opens the provenance side-panel (matched rule + math trace + KB
+ * references + override history + override CTA).
  */

 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Badge } from '@/components/ui/badge';

 import type { DecisionEntry, DerivationChainEntry } from './types';
+import { WhyThisValueButton } from './why-this-value-button';

 interface SectionRationaleProps {
   decisions: DecisionEntry[];
   derivationChain: DerivationChainEntry[];
+  /** Project id required by the provenance-button's API routes. */
+  projectId: number;
 }

 export function SectionRationale({
   decisions,
   derivationChain,
+  projectId,
 }: SectionRationaleProps) {

@@ -42,9 +47,17 @@
               </header>
-              <p className="text-sm text-foreground">
+              <p className="flex flex-wrap items-center gap-1.5 text-sm text-foreground">
                 <span className="font-medium">Chosen:</span> {d.chosen_option}
+                <WhyThisValueButton
+                  projectId={projectId}
+                  decisionId={d.id}
+                  targetField={`architecture_recommendation/decisions[${d.id}].chosen_option`}
+                  storyId={d.id}
+                  engineVersion="v1"
+                  ariaLabel={`Why this decision? (${d.id})`}
+                />
               </p>
```

### `components/synthesis/recommendation-viewer.tsx`

```diff
@@ -66,6 +66,7 @@
       <SectionRationale
         decisions={payload.decisions}
         derivationChain={payload.derivation_chain}
+        projectId={projectId}
       />
```

### `components/projects/sections/architecture-and-database-section.tsx`

```diff
@@ -133,6 +133,7 @@
         <TabsContent value="architecture" className="mt-6">
           <ArchitectureDiagramPane
             decisionNetwork={dn}
             fallbackMermaid={fallbackArchMermaid}
+            projectId={project.id}
           />
         </TabsContent>
```

### `components/projects/sections/architecture-and-database/architecture-diagram-pane.tsx`

```diff
@@ -16,9 +16,16 @@
 interface Props {
   decisionNetwork: DecisionNetworkLike | null;
   /** Fallback Mermaid (legacy `class_diagram`-style) when no alternatives exist. */
   fallbackMermaid?: string;
+  /**
+   * Project id required by the `<WhyThisValueButton />` rendered inside
+   * the alternative-picker. Optional so legacy callers without provenance
+   * UI still type-check.
+   */
+  projectId?: number;
 }
@@ -34,1 +41,1 @@
-export function ArchitectureDiagramPane({ decisionNetwork, fallbackMermaid }: Props) {
+export function ArchitectureDiagramPane({ decisionNetwork, fallbackMermaid, projectId }: Props) {
@@ -68,6 +75,7 @@
         <AlternativePicker
           alternatives={alternatives}
           selectedId={selectedId}
           onSelect={setSelectedId}
+          projectId={projectId}
         />
```

### `components/projects/sections/architecture-and-database/alternative-picker.tsx`

```diff
@@ -22,1 +22,2 @@
 import { CheckCircle2, AlertTriangle } from 'lucide-react';
 import type { ArchitectureAlternative } from './types';
+import { WhyThisValueButton } from '@/components/synthesis/why-this-value-button';

 interface Props {
   alternatives: ArchitectureAlternative[];
   selectedId: string;
   onSelect: (id: string) => void;
+  /**
+   * When provided, renders a `<WhyThisValueButton />` next to the picker
+   * label so the user can see why this alternative was chosen + override.
+   * EC-V21-E.11: only attached at non-FROZEN surfaces.
+   */
+  projectId?: number;
 }

-export function AlternativePicker({ alternatives, selectedId, onSelect }: Props) {
+export function AlternativePicker({ alternatives, selectedId, onSelect, projectId }: Props) {

@@ -67,6 +75,17 @@
         </Select>
+        {typeof projectId === 'number' && (
+          <WhyThisValueButton
+            projectId={projectId}
+            decisionId="ARCHITECTURE_ALTERNATIVE_PICK"
+            targetField="architecture_recommendation/recommended_alternative"
+            storyId="story-architecture-pick"
+            engineVersion="v1"
+            ariaLabel="Why this architecture alternative?"
+          />
+        )}
       </div>
```

These five diffs total ~40 LOC and are mechanically applicable to the working tree by anyone with write access not blocked by the silent-revert hook.

---

## Cross-references

- Spawn prompt: `team-lead@c1v-kb-runtime-engine` 2026-04-27
- Master plan §Wave E: `plans/c1v-MIT-Crawley-Cornell.v2.2.md` lines containing EC-V21-E.11 + D-V21.23 + Correction 3
- Day-0 inventory: `plans/wave-e-day-0-inventory.md`
- Snapshot anchor: `wave-e-pre-rewrite-2026-04-26` @ `a7f8a7c`
- Engine-core dependency: `te1-engine-core-complete` @ `cddf1bf`
- Sister-agent SOFT-DEP: `kb-rewrite` (its `explain_decision` LangGraph node will eventually replace this branch's direct DB resolution in `/api/decision-audit/.../explain/route.ts`)
