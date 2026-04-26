# Component Reuse Cheatsheet — "Extend, Don't Invent"

Authority: **EC-V21-A.11** (locked 2026-04-25 16:06 EDT, master plan v2.1).

> Use the current style + reuse existing components. Where a new surface
> needs novel composition, follow the closest existing analog. NO new design
> tokens. NO new typography scale. NO Figma blocker.

This document catalogs the canonical analogs so a contributor can find the
existing pattern before considering a new one. **Read this before adding any
component.**

---

## Brand Tokens (CSS Variables)

All colors live in `app/theme.css`. Type-checked Tailwind utilities map to
them. **Never write `#[0-9A-Fa-f]{6}` in a `.ts` / `.tsx` file** — the
verifier (`scripts/verify-ta2.ts`) fails the build.

| CSS variable             | Tailwind class                | Use                       |
|--------------------------|-------------------------------|---------------------------|
| `--color-firefly`        | `bg-firefly` / `text-firefly` | Dark theme background     |
| `--color-porcelain`      | `bg-porcelain`                | Light theme background    |
| `--color-tangerine`      | `border-tangerine` etc.       | Brand accent              |
| `--color-tangerine-light`| `bg-tangerine-light`          | Pale accent fill          |
| `--color-danube`         | `text-danube`                 | Secondary blue accent     |
| `--bg-primary` / shadcn  | `bg-background`               | Theme-neutral surfaces    |
| shadcn semantic tokens   | `text-foreground`, `bg-card`  | Default for everything    |

**Default rule:** reach for shadcn semantic tokens (`bg-card`,
`text-foreground`, `border`, `text-muted-foreground`) before brand tokens.
Brand tokens are reserved for intentional accent moments (e.g. winning-
alternative callout).

---

## Closest Existing Analog — Lookup Table

| If you need…                         | Closest analog                                                              |
|--------------------------------------|-----------------------------------------------------------------------------|
| **Card-style surface**               | `components/projects/sections/*.tsx` (e.g. `tech-stack-section.tsx`)        |
| **Hero / callout with brand accent** | `components/synthesis/section-callout.tsx` (Tangerine border + Sparkles)    |
| **Two-pane tabbed surface**          | `components/projects/sections/architecture-and-database-section.tsx`        |
| **Read-only collapsible accordion**  | `components/synthesis/provenance-accordion.tsx`                             |
| **Tab strip with sub-views**         | `components/system-design/interfaces-viewer.tsx` (FROZEN — pattern only)    |
| **Mermaid diagram rendering**        | `components/diagrams/diagram-viewer.tsx` (FROZEN — import, never copy)      |
| **Empty-state per-section**          | `components/projects/sections/empty-section-state.tsx` (shared primitive)   |
| **Multi-section empty page**         | `components/synthesis/empty-state.tsx` (composes 5× EmptySectionState)      |
| **Download / export entry-point**    | `components/synthesis/download-dropdown.tsx`                                |
| **Approval gate with persistence**   | `components/projects/sections/architecture-and-database/schema-approval-gate.tsx` |
| **Picker driving a render**          | `components/projects/sections/architecture-and-database/alternative-picker.tsx`   |
| **Chat-thread message surface**      | `components/chat/*.tsx`                                                     |
| **Marketing / landing block**        | `components/marketing/*.tsx`                                                |
| **IDE-style accordion**              | `components/connections/ide-accordion.tsx`                                  |
| **Pareto / comparison table**        | `components/synthesis/section-tradeoffs.tsx`                                |
| **Stoplight / severity table**       | `components/synthesis/section-risks.tsx`                                    |

---

## Concrete Examples

### "I need a new card-style surface"
Don't roll your own. Look at `components/projects/sections/tech-stack-section.tsx`:

```tsx
<Card>
  <CardHeader>
    <CardTitle>...</CardTitle>
  </CardHeader>
  <CardContent>...</CardContent>
</Card>
```

The shadcn `Card` primitive at `@/components/ui/card` carries the brand-
correct background, border, and dark-mode parity. Don't add custom borders or
shadows.

### "I need a tab-strip with sub-views"
Use the same pattern as
`components/projects/sections/architecture-and-database-section.tsx`:

```tsx
<Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)}>
  <TabsList>
    <TabsTrigger value="a"><Icon className="h-4 w-4" /> Label</TabsTrigger>
    <TabsTrigger value="b">…</TabsTrigger>
  </TabsList>
  <TabsContent value="a" className="mt-6">…</TabsContent>
</Tabs>
```

Default tab order matters (e.g. **N2 first** in interfaces per EC-V21-A.5).

### "I need an accent border to mark a 'winning' option"
Use the Tangerine token via Tailwind class:

```tsx
<Card className="border-2 border-tangerine">…</Card>
```

Reference: `components/synthesis/section-callout.tsx`. Never `border-[#F18F01]`.

### "I need an empty-state for a single section"
Use the shared primitive directly:

```tsx
import { EmptySectionState } from '@/components/projects/sections/empty-section-state';

<EmptySectionState
  icon={Sparkles}
  title="..."
  body="..."
  ctaHref={`/projects/${projectId}/generate`}
  ctaLabel="..."
/>
```

For a multi-section empty page (e.g. `/synthesis` pre-synthesis), compose 5
of them — see `components/synthesis/empty-state.tsx`.

### "I need to render a Mermaid block"
Import the FROZEN viewer — never copy:

```tsx
import { DiagramViewer } from '@/components/diagrams/diagram-viewer';

<DiagramViewer mermaid={source} />
```

Modifying `diagram-viewer.tsx` is an auto-FAIL on `verify-ta2.ts`.

---

## Anti-Patterns

- ❌ Inline hex colors anywhere in `.ts` / `.tsx` source — fails verifier.
- ❌ New typography scale (custom `text-[20px]` etc.) — use shadcn typographic
  utilities or the existing scale in `globals.css`.
- ❌ Copying a FROZEN component to "tweak" it — wrap or extend instead.
- ❌ Inventing a new card / accordion / tab variant when an analog exists in
  the table above.
- ❌ Data fetching inside a layout / section component — server pages own
  fetch; sections receive typed props.

---

## When None of the Above Fits

If you genuinely cannot find an analog:

1. Re-read this file and the lookup table.
2. Search `components/` for the closest semantic match (e.g. `rg -l "Tabs" components/`).
3. If still nothing fits, surface the gap in a PR comment + `@docs` — adding
   a new component is allowed but it must be reviewed against the brand
   tokens + UI freeze before merge.

The bar is intentionally high: every novel composition is reviewed
per-pixel by David before merge.

---

## Related References

- `apps/product-helper/CLAUDE.md` — `UI Freeze` table + `Deployed Features`
- `apps/product-helper/components/synthesis/README.md` — synthesis family overview
- `app/theme.css` — brand-token source-of-truth
- `app/globals.css` — typography scale + base utilities
- `plans/c1v-MIT-Crawley-Cornell.v2.1.md` — EC-V21-A.10 / EC-V21-A.11
