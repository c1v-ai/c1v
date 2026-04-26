# `components/synthesis/` — RecommendationViewer Family

The keystone synthesis surface for `/projects/[id]/synthesis`. Renders the same
5-section structure as the self-application capstone
(`.planning/runs/self-application/synthesis/architecture_recommendation.html`)
per-tenant from each project's own `architecture_recommendation.v1.json`.

Shipped: TA2 v2.1 Wave A (commit `1da5ac0`, tag `ta2-wave-a-complete`).

## Composition Rules

```
RecommendationViewer (orchestrator)
├── SectionCallout          — winning Pareto alternative + decision chips
├── SectionRationale        — 4-paragraph derivation chain (D-01..D-04)
├── SectionReferencesTable  — module-output links + sibling-viewer chips
├── SectionRisks            — fmea_residual flagged subset
├── SectionTradeoffs        — Pareto frontier table (winner row highlighted)
├── SectionFigures          — Mermaid blocks via FROZEN diagram-viewer
├── ProvenanceAccordion     — JSON / Mermaid source / derivation_chain
└── DownloadDropdown        — JSON / HTML / PDF / PPTX / Bundle ZIP
```

**Hard rule — orchestrator owns nothing but layout.** The parent server
component (`app/(dashboard)/projects/[id]/synthesis/page.tsx`) does all data
fetching via `getLatestSynthesis(projectId)` + `getProjectArtifacts(projectId)`
and resolves signed URLs. `RecommendationViewer` and every `section-*.tsx`
component are pure layout — no `fetch`, no `await`, no DB clients. This keeps
section components trivially testable and SSR-cheap.

## Prop Contracts

### `RecommendationViewer`
```ts
{
  payload: ArchitectureRecommendation;       // see ./types.ts
  projectId: number;
  artifacts: DownloadDropdownArtifact[];     // manifest entries
  manifestContractVersion?: string | null;   // e.g. "v1"
}
```

### Section components
Each section receives only the slice of `payload` it renders. Examples:
- `SectionCallout({ pareto, decisions, topLevelSummary })`
- `SectionRationale({ derivationChain })`
- `SectionRisks({ residualFlags })`
- `SectionTradeoffs({ pareto })`
- `SectionFigures({ embeddedArtifacts })`

See `./types.ts` for canonical payload shape.

### `SynthesisEmptyState`
```ts
{ projectId: number }
```
Per **EC-V21-A.16** the empty state is 5 instances of the shared
`<EmptySectionState>` (recommendation / decision-network / fmea / qfd /
architecture-and-database) — **NOT** a blurred-tile grid. Per **D-V21.17**, no
canned exemplar values may leak (verifier sweeps for `AV.01` / `Sonnet 4.5` /
`pgvector` / `Vercel` / `Anthropic`).

## Brand Tokens Used

All colors come from CSS variables in `app/theme.css` — never inline hex. The
verifier (`scripts/verify-ta2.ts`) fails on any `#[0-9A-Fa-f]{6}` literal in
component source.

| Token (Tailwind class)   | Source variable             | Where used                                  |
|--------------------------|-----------------------------|---------------------------------------------|
| `border-tangerine`       | `--color-tangerine`         | `SectionCallout` winning-alternative border |
| `text-tangerine`         | `--color-tangerine`         | `SectionCallout` Sparkles icon              |
| `bg-tangerine/10`        | `--color-tangerine`         | `SectionTradeoffs` winner-row highlight     |
| `text-foreground`        | shadcn semantic             | All headings                                |
| `text-muted-foreground`  | shadcn semantic             | Subheadings, metadata                       |
| `bg-card` / `border`     | shadcn semantic             | Card chrome (all sections)                  |

`--color-firefly` (dark bg) and `--color-porcelain` (light bg) are applied via
`<html data-theme>` — section components stay theme-neutral.

## Dark-Mode Considerations

- All sections render against `bg-card` (semantic) — automatically flips with
  `data-theme`.
- Tangerine accent has a sibling `--color-tangerine-light` (`#FDF3E5`) for
  pale fills; use it via `bg-tangerine/10` (Tailwind opacity modifier) rather
  than the explicit light variant — keeps single-source-of-truth on the base
  hue.
- `Sparkles` / icon colors use `text-tangerine` directly — the hue reads
  correctly on both Firefly and Porcelain backgrounds (verified by
  `dark-mode-parity` test in `scripts/verify-ta2.ts`).

## Fixture Pattern (Tests)

Tests live at `apps/product-helper/__tests__/synthesis/`. The test runs under
`testEnvironment: 'node'` (no jsdom) — components are invoked as pure
functions and the returned React tree is walked.

Fixture conventions (see `recommendation-viewer.test.tsx`):

```ts
const FIXTURE_ALTERNATIVE: ParetoAlternative = {
  id: 'fixture-alt-1',
  summary: 'A fixture alternative used by the structural test.',
  is_recommended: true,
  // ...
};
```

- Fixtures inline in the test file — no separate `*.fixture.ts` files for
  v2.1.
- All fixture strings use the literal token `fixture` so the empty-state
  canned-string sweep cannot collide.
- Manifest entries (`DownloadDropdownArtifact[]`) are mocked locally; live
  integration is covered by TA1 + TA3 tests.

## Frozen Dependencies

These imports are **read-only** from this directory — modifying them violates
the v2 UI freeze (auto-FAIL in `verify-ta2.ts`):

- `@/components/diagrams/diagram-viewer` — Mermaid render
- `@/components/system-design/decision-matrix-viewer`
- `@/components/system-design/ffbd-viewer`
- `@/components/system-design/qfd-viewer`
- `@/components/system-design/interfaces-viewer`

`fmea-viewer.tsx` is **MODIFIABLE** in v2.1 (handoff Issue 8 — its data wire
moved to `project_artifacts`).

## Related Surfaces

- Empty-state primitive: `@/components/projects/sections/empty-section-state`
- Server host: `app/(dashboard)/projects/[id]/synthesis/page.tsx`
- Manifest contract: `plans/v21-outputs/ta3/manifest-contract.md`
- Component-reuse cheatsheet:
  `apps/product-helper/.planning/dev-runbooks/component-reuse-cheatsheet.md`
