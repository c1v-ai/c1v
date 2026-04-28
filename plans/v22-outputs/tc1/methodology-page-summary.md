# EC-V21-C.5 — /about/methodology page summary

**Closes:** EC-V21-C.5 (v2.1 P9 carry-over per D-V21.14 — document drift, do not relabel folders).

**Branch:** `wave-c/tc1-m345-schemas`
**Hard-dep:** `tc1-preflight-complete` @ `3e2abdf` (✅ green, reachable from HEAD).
**Blocks:** `qa-c-verifier`.

---

## Canonical source

The page renders the on-disk canonical methodology document verbatim:

- **Path:** `system-design/kb-upgrade-v2/METHODOLOGY-CORRECTION.md`
- **Lock:** 2026-04-26 reconciliation locked this as the canonical home (per `plans/v21-outputs/ta1/methodology-canonical.md`); the original 2026-04-25 lock at `plans/kb-upgrade-v2/` was revoked because that file never existed there on disk.
- **Strategy:** loaded at request time via `fs.readFileSync` from a server component, then piped through the existing `MarkdownRenderer` client component. No content forking, no synchronization burden — the page is a thin viewer over the canonical file.

## Route

| Aspect | Value |
|---|---|
| URL | `/about/methodology` |
| Route group | `(dashboard)` (authenticated) |
| Rendering | Static (`export const dynamic = 'force-static'`) |
| Page | `apps/product-helper/app/(dashboard)/about/methodology/page.tsx` |

## Components

| File | Purpose |
|---|---|
| `apps/product-helper/app/(dashboard)/about/methodology/page.tsx` | Server component. Reads canonical MD, renders header + canonical body + source path. |
| `apps/product-helper/components/about/methodology-renderer.tsx` | Client wrapper. Prepends a Mermaid three-pass overview block, then renders the canonical source. Reuses existing `@/components/chat/markdown-renderer` (no new MDX library). |
| `apps/product-helper/components/about/about-nav.ts` | Single-source nav config — `aboutNavEntries[]`. Adding entries here surfaces them in the dashboard `UserMenu` automatically. |

## Nav wiring

- `apps/product-helper/app/(dashboard)/layout.tsx` `UserMenu` dropdown now maps over `aboutNavEntries`. New entries get a `DropdownMenuItem` with the entry's icon + label, gated by a `DropdownMenuSeparator`.
- BottomNav (mobile) is intentionally untouched — only 4 slots, all reserved for primary product flows.

## Mermaid overview

The renderer prepends one Mermaid `flowchart LR` block summarizing the three passes:

- **Pass 1** (Functional Understanding): Actors → Use Cases / Data Flows → Scope Tree / FFBD / N2 → FMEA v1 (instrumental)
- **Pass 2** (Requirements Synthesis): FRs → NFRs ← FMEA v1 → Constants
- **Pass 3** (Decision): Alternatives → Decision Matrix / QFD → Interface Specs → FMEA v2 → Architecture Recommendation

Mermaid blocks render via the existing `DiagramLinkCard` (clickable preview) used throughout the chat surface — no edits to the FROZEN `components/diagrams/diagram-viewer.tsx`.

## Brand-token reuse

Page uses existing tokens only: `text-foreground`, `text-muted-foreground`, `bg-muted`, `border-border`. No new design tokens. No new typography scale. EC-V21-A.11 visual-style lock honored.

## Snapshot test

`apps/product-helper/__tests__/app/about/methodology.test.tsx` (4 tests, all green):

1. Canonical `METHODOLOGY-CORRECTION.md` is readable from disk and contains the three pass headers.
2. Renderer emits "Three-pass overview" + the canonical body + the word "instrumental".
3. `aboutNavEntries` exposes a `/about/methodology` entry labelled "Methodology".
4. `page.tsx` source contains the canonical relative path literal (guards against future path drift).

Pattern parity with `__tests__/app/synthesis-page-pending.test.tsx` (server-render via `renderToStaticMarkup`, jest `node` env). `react-markdown` is ESM-only and not transformable by `ts-jest`; the test stubs it to a passthrough so the structural assertions still hold.

## Run command

```bash
cd apps/product-helper
POSTGRES_URL=stub AUTH_SECRET=stubstubstubstubstubstubstubstubstub \
  ANTHROPIC_API_KEY=sk-ant-stub STRIPE_SECRET_KEY=sk_test_stub \
  STRIPE_WEBHOOK_SECRET=whsec_stub OPENROUTER_API_KEY=stub \
  BASE_URL=http://localhost:3000 \
  npx jest __tests__/app/about/methodology.test.tsx
```

## Dark-mode parity

Page uses CSS-variable-driven brand tokens (`--background`, `--foreground`, `--muted`, `--border`, `--primary`) that already flip between Firefly (dark) and Porcelain (light) via `app/globals.css`. The `MarkdownRenderer` does the same on every node it emits. No mode-specific overrides required — parity comes for free from token reuse.

Verified by inspection: all class names in `page.tsx` and `methodology-renderer.tsx` resolve through token names (none hardcode HSL values, hex codes, or `dark:` prefixes).

## Verdict

| Gate | Status |
|---|---|
| Route `/about/methodology` exists and is statically rendered | ✅ |
| Source consumed = canonical `system-design/kb-upgrade-v2/METHODOLOGY-CORRECTION.md` | ✅ |
| Three-pass Mermaid overview present | ✅ |
| Per-pass detail sections + references rendered | ✅ (verbatim from canonical body) |
| Nav entry exposed under About | ✅ (UserMenu dropdown) |
| Snapshot test green | ✅ (4/4) |
| Dark-mode parity (Firefly ↔ Porcelain) | ✅ (token-driven) |
| `tsc` clean on new files | ✅ |
| FROZEN files untouched | ✅ (`diagram-viewer.tsx` unmodified) |
| No new design tokens / typography | ✅ |
| Folder-numbering NOT relabeled (D-V21.14 honored) | ✅ |

EC-V21-C.5 ready for `qa-c-verifier`.
