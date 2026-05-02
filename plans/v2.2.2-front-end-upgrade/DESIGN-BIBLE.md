# c1v Design Bible — Canonical v1

**Date:** 2026-05-01
**Supersedes:** `apps/product-helper/DESIGN.md` (frontmatter is stale — claims Geist + accent #E8954A, neither correct)
**Authoritative for:** prd.c1v.ai (and c1v.ai parent if/when ported in)
**Source priority:** Webflow Variables (palette structure) → Figma `g5lP1TizFUIvqb86hsAjaL` (type + components) → this doc

> **One rule above all:** if you find a hardcoded hex, font, or pixel size in a `.tsx` file that isn't in this doc, **it's a bug**, not a "design choice." Replace it with a token from §1–§5 or open an issue to extend the system.

---

## 1 · Color foundation

### 1.1 Brand families

Five families. Each has a 6-step ramp: **Lightest → Light → Lighter → Dark → Darker → Darkest**. Step names come from the Webflow Variables panel (verified 2026-04-30 23:38). Base step is the unmodified brand color.

| Family | Role | Base | Hex |
|---|---|---|---|
| **Firefly** | Brand text + dark surfaces | `firefly` | `#0B2C29` |
| **Tangerine** | Primary actions, accents, focus | `tangerine` | `#F18F01` |
| **Porcelain** | Light surfaces, app background | `porcelain` | `#FBFCFC` |
| **Neutral** | Borders, dividers, supporting text | `neutral` | `#0D0D0D` (darkest) |
| **Danube** | Secondary brand color, charts | `danube` | `#5998C5` |

> ⚠️ **Hex values for the non-base ramp steps need to be exported from Webflow.** Until then, treat the table below as the **structure**; populate hexes in a follow-up commit. Don't hand-roll new tints with `rgba(0,0,0,0.05)` — wait for the canonical values.

```
Firefly      Lightest  ───  Light  ───  Lighter  ───  base #0B2C29  ───  Dark  ───  Darker  ───  Darkest
Tangerine    Lightest  ───  Light  ───  Lighter  ───  base #F18F01  ───  Dark  ───  Darker  ───  Darkest
Porcelain    Lightest  ───  Light  ───  Lighter  ───  base #FBFCFC  ───  Dark  ───  Darker  ───  Darkest
Neutral      Lightest  ───  Light  ───  Lighter  ───  Dark  ───  Darker  ───  base #0D0D0D
Danube       Lightest  ───  Light  ───  Lighter  ───  base #5998C5  ───  Dark  ───  Darker  ───  Darkest
```

### 1.2 Semantic mapping

These tokens are what components actually use. They resolve to a brand-family step.

| Semantic token | Light theme | Dark theme | Use for |
|---|---|---|---|
| `--bg-page` | `porcelain` | `firefly` | App background |
| `--bg-surface` | `white` | `firefly-darker` | Cards, popovers, sheets |
| `--bg-surface-alt` | `porcelain-light` | `firefly-dark` | Inputs, hover states, secondary surfaces |
| `--fg-primary` | `firefly` | `porcelain` | Headings + body text |
| `--fg-muted` | `firefly @ 60%` | `porcelain @ 60%` | Secondary text, metadata |
| `--fg-disabled` | `firefly @ 30%` | `porcelain @ 30%` | Disabled labels |
| `--border-subtle` | `firefly @ 15%` | `porcelain @ 20%` | Hairlines, dividers |
| `--border-strong` | `firefly @ 30%` | `porcelain @ 35%` | Input borders, card outlines |
| `--accent` | `tangerine` | `tangerine` | Primary CTA fill, eyebrow labels, focus ring, "Most Popular", check icons |
| `--accent-fg` | `white` | `firefly` | Text on accent fill |
| `--accent-soft` | `tangerine-lightest` | `tangerine-darkest` | Accent badges, subtle accent backgrounds |
| `--secondary` | `danube` | `danube` | Charts, complementary callouts (never on a primary action) |
| `--destructive` | `#E5484D` | `#E5484D` | Errors, delete |
| `--success` | `#16A34A` | `#16A34A` | Success states |
| `--warning` | `#F59E0B` | `#F59E0B` | Warnings |

**Rule:** components **never** reference brand hex directly (`bg-[#F18F01]`). They reference a semantic token (`bg-[var(--accent)]` or Tailwind `bg-accent`). The semantic token resolves to the brand step. This makes theming + ramp swaps a one-line change.

### 1.3 Drift correction (vs. current production)

| Token | Current (production) | Canonical (this doc) |
|---|---|---|
| `--primary` (shadcn) | `#FCE8CC` pale cream | **`#F18F01` Tangerine** |
| `--accent` (shadcn) | `#5998C5` Danube | **`#F18F01` Tangerine** |
| `--secondary` (shadcn) | `#F2F2F2` near-white | **`#5998C5` Danube** |
| `--c1v-accent` | `#F18F01` ✅ already correct | (consolidate into `--accent`) |

---

## 2 · Typography

### 2.1 Type families

| Role | Family | Source | Fallback chain |
|---|---|---|---|
| **Heading** | Space Grotesk (400, 500, 700) | Google Fonts via `next/font/google` | `Space Grotesk, ui-sans-serif, system-ui, sans-serif` |
| **Body** | Roboto (300, 400, 500, 600, 700, 800) | Google Fonts via `next/font/google` | `Roboto, ui-sans-serif, system-ui, sans-serif` |
| **Code** | Consolas / JetBrains Mono | system / self-hosted | `Consolas, 'JetBrains Mono', ui-monospace, monospace` |

> **Drift correction:** body is **Roboto**, not Consolas. The current Consolas-everywhere setup makes the whole product feel like a terminal. Reserve Consolas for `<code>`, `<pre>`, and the small mono labels in diagram tooling.

### 2.2 Type scale

Mobile-first. Desktop kicks in at `md:` (≥768px). Letter-spacing `-0.01em` on all headings. Line-heights are absolute % of font-size.

| Token | Mobile | Desktop | Line-height | Weight |
|---|---|---|---|---|
| `text-display` | 56px | 96px | 110% | 700 |
| `h1` | 40px | 72px | 120% | 700 |
| `h2` | 36px | 52px | 120% | 700 |
| `h3` | 32px | 44px | 120% | 600 |
| `h4` | 24px | 36px | 130% | 600 |
| `h5` | 20px | 28px | 140% | 600 |
| `h6` | 18px | 22px | 140% | 600 |
| `text-large` | 18px | 22px | 150% | 400 |
| `text-base` | 16px | 18px | 150% | 400 |
| `text-small` | 14px | 14px | 150% | 400 |
| `text-tiny` | 12px | 12px | 150% | 500 |
| `eyebrow` | 14px | 14px | 150% | 600 (uppercase, accent color) |

### 2.3 Application rules

- **iOS prevents zoom on focus** for `<input>` only when font-size ≥ 16px. All inputs must use `text-base` minimum.
- **Eyebrow label** uses `--accent` color, uppercase, letter-spacing `0.05em`, and sits **above** an h1/h2.
- **No mixing** of weight + size + family in arbitrary combos — every typography use must map to a token above.

---

## 3 · Spacing + Layout

### 3.1 Spacing scale (4px base)

Use Tailwind's default scale. Aliased mobile-first variants live in `globals.css :: .space-mobile`.

```
1   2   3   4   6   8   10   12   16   20   24   32
4   8   12  16  24  32  40   48   64   80   96   128  (px)
```

### 3.2 Containers

| Token | Width | Use |
|---|---|---|
| `container-sm` | `max-w-2xl` (672px) | Forms, single-column reading |
| `container-md` | `max-w-4xl` (896px) | Settings pages, single-pane content |
| `container-lg` | `max-w-7xl` (1280px) | Marketing, dashboards |
| `container-bleed` | full | Hero backgrounds, dark sections |

**Horizontal padding:** `px-4 sm:px-6 lg:px-8` (mobile 16px → tablet 24px → desktop 32px). **Never** use raw `px-[5%]` style — fixed-percentage padding clips on tiny phones.

### 3.3 Vertical rhythm

Section pattern: `py-16 md:py-24 lg:py-28`. Cards: `p-4 sm:p-6 lg:p-8`. Don't invent new section-padding pairs.

### 3.4 Mobile bottom-nav clearance

Pages inside `(dashboard)/` MUST account for the 64px bottom-nav + safe-area:

```css
padding-bottom: calc(16px + 64px + env(safe-area-inset-bottom));
```

Helper utility: `chat-footer-safe` already exists in `globals.css:368` — use it.

### 3.5 Touch targets

Minimum 44×44px (Apple HIG). Tailwind: `min-h-11 min-w-11`. Helper: `.touch-target` already in `globals.css:303`.

---

## 4 · Radius + Shadow

### 4.1 Radius

**One radius for the whole system: 12px.** Per Figma. Per `theme.css:34`. Per the calm/architectural brand voice.

| Token | Value | Use |
|---|---|---|
| `--radius` | `12px` | Buttons, cards, inputs, sheets, modals, dropdowns |
| `--radius-tag` | `6px` | Tags, chips, small pills |
| `--radius-tab-container` | `10px` | Tab strip wrapper |
| `--radius-tab-active` | `8px` | Active tab pill |
| `--radius-checkbox` | `4px` | Checkboxes |
| `--radius-radio` | `9999px` | Radios, FABs, avatars |

Tailwind: `rounded-xl` = 12px, `rounded-md` = 6px (tag), `rounded-full` = radio/FAB. Stop using `rounded-lg`, `rounded-2xl`, `rounded-3xl` ad-hoc.

### 4.2 Shadow

Three tokens. Defined in Figma. Already in `theme.css:14`.

| Token | Value | Use |
|---|---|---|
| `--shadow-button-primary` | `0px 1px 2px rgba(13,13,13,0.05), inset 0px 32px 24px rgba(255,255,255,0.05), inset 0px 2px 1px rgba(255,255,255,0.25), inset 0px 0px 0px 1px rgba(13,13,13,0.15), inset 0px -2px 1px rgba(0,0,0,0.2)` | Primary buttons (gives them the satisfying "raised" look) |
| `--shadow-button-secondary` | `0px 1px 2px rgba(13,13,13,0.05), inset 0px 0px 0px 1px rgba(13,13,13,0.05), inset 0px -2px 1px rgba(13,13,13,0.05)` | Secondary buttons |
| `shadow-2xl` | Tailwind default | Hero product mockup, modals |

No other shadows. No `shadow-md`, `shadow-lg` outside primitives.

---

## 5 · Motion

| Token | Duration | Easing | Use |
|---|---|---|---|
| `--motion-fast` | `150ms` | `cubic-bezier(0.4, 0, 0.2, 1)` | Hover, tap, micro-feedback |
| `--motion-base` | `200ms` | `cubic-bezier(0.4, 0, 0.2, 1)` | Sheets, drawers, accordions, color transitions |
| `--motion-slow` | `300ms` | `cubic-bezier(0.4, 0, 0.2, 1)` | Page enter, full-card reveals |

Active-state press: `active:scale-95 active:opacity-80` on every interactive primitive.

---

## 6 · Components

> Each component below has: **anatomy → states → tokens used → don'ts**. Every component lives in `components/ui/` (shadcn primitives) or wraps one. **No bespoke per-page styling.**

### 6.1 Button

**Anatomy:** label, optional leading/trailing icon (24×24, gap 8/12px), background, border-radius 12px, height 44 (default) or 40 (sm).

**Variants:**
| Variant | Background | Foreground | Shadow | Use |
|---|---|---|---|---|
| `primary` | `--accent` (Tangerine) | `--accent-fg` (white) | `--shadow-button-primary` | THE main CTA — "Let's get building", "Start free", "Continue", "Save" |
| `secondary` | `firefly @ 5%` | `--fg-primary` | `--shadow-button-secondary` | Equal-weight alternative to primary — "See how it works" |
| `ghost` | transparent | `--fg-primary` | none | Tertiary — "Cancel", icon-only header buttons |
| `link` | transparent | `--fg-primary`, underline on hover | none | Inline-style links inside body text |
| `destructive` | `--destructive` | white | none | "Delete", "Remove" |

**Sizes:** `h-11 px-6` (default), `h-10 px-5` (sm). Icon-only: square (`size-11` or `size-10`), padding 10px.

**Don'ts:** no `bg-[#F18F01]` direct hex. No `rounded-lg`. No custom shadow strings. No `hover:opacity-80` (use color shifts).

### 6.2 Input

**Anatomy:** padding `8px 12px`, height 40 (default) or 48 (with leading/trailing icons), bg `firefly @ 5%`, border `1px solid border-strong`, radius 12px, font-size **16px** (iOS zoom prevention).

**States:** rest, hover (border-strong → 50% opacity), focus (`ring-2 ring-accent ring-offset-2`), error (`border-destructive`), disabled (`opacity-50 pointer-events-none`).

**Don'ts:** no `<input>` smaller than 16px font. No fixed widths. No bg `white` in light mode (looks naked next to other surfaces).

### 6.3 Card

**Anatomy:** bg `--bg-surface` (white in light, firefly-darker in dark), border `1px solid border-subtle`, radius 12px, padding `p-4 sm:p-6 lg:p-8`, optional `shadow-2xl` for hero-elevated.

**Variants:** `default`, `interactive` (adds `hover:border-strong cursor-pointer`), `featured` (border `2px solid accent`).

### 6.4 Badge / Tag

**Anatomy:** padding `4px 10px`, radius 6px, font `text-tiny font-semibold`.

**Variants:** `default` (firefly @ 5%), `accent` (tangerine-lightest bg, tangerine fg), `success`, `destructive`, `warning`.

### 6.5 Bottom Tab Bar (mobile only)

**Anatomy:** fixed bottom, full-width, height 64px, `pb-[env(safe-area-inset-bottom)]`, hidden on `md+`, 4 tabs.

**Tabs:** Home, Projects, Chat, More. The "More" tab opens a bottom Sheet with Account, Settings, theme toggle, Sign Out.

**Active state:** `--accent` color, icon stroke `2.5px`, optional 3px-tall pill indicator above icon.

**Tap behavior:** `active:scale-95 active:opacity-80`, `touch-manipulation`, `select-none`.

(Already shipped at [`components/navigation/bottom-nav.tsx`](../../apps/product-helper/components/navigation/bottom-nav.tsx) — commit 3ae94e8.)

### 6.6 Sheet (bottom drawer)

**Anatomy:** rounded-top 16px, `pb-[env(safe-area-inset-bottom)]`, max-height 85vh, drag handle bar 4×40 at top.

**Use:** mobile More tab, mobile filters, mobile detail panels. **Not** for desktop — desktop uses Dialog or right-side Sheet.

### 6.7 FAB (floating action button)

**Anatomy:** 56×56 (default) or 48×48 (sm), `rounded-full`, `bg-accent text-accent-fg`, `shadow-2xl`, position `fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-40` for above-bottom-nav placement.

**Use:** primary action on a list page when the page-header CTA isn't visible (e.g. Projects list on mobile).

### 6.8 Empty state

**Anatomy:** centered, py-16, w-16/h-16 icon container with `bg-accent-soft` and accent-color icon, h2 (text-2xl bold), 1-line description (text-muted), single primary CTA.

**One sentence per concern.** No multi-paragraph empty states. The primary CTA must move the user to the next step.

---

## 7 · Patterns

### 7.1 Customer journey hierarchy

The user moves through phases. Every screen belongs to one phase. Each phase has one job.

| Phase | Screen pattern | Primary action | Should NOT show |
|---|---|---|---|
| **Discover** | Marketing landing | "Free to start" CTA | Authenticated chrome |
| **Onboard** | Sign-up → home | "Start your product" | Tutorials, "How It Works" cards (already converted) |
| **Define** | Project intake (chat) | Send message | Empty pipeline previews, "How It Works" |
| **Synthesize** | Synthesis loading | Wait gracefully | False progress bars |
| **Review** | Artifact viewers (FFBD, QFD, Decision Matrix) | Approve / iterate | Marketing copy |
| **Export** | Export sheet | Pick format | Pricing |

**Anti-pattern:** showing meta-information ("How It Works") *after* the user has already converted past that gate. If they clicked Start, they don't need to be told what Start does.

### 7.2 Mobile navigation hierarchy

```
Top-level (BottomNav, 4 tabs):
├── Home          → /home
├── Projects      → /projects
├── Chat          → /chat
└── More (sheet)
    ├── Account
    ├── Settings
    ├── Theme
    └── Sign Out

Inside a project (project layout):
├── Back arrow → /projects
├── Project title (full, not truncated)
├── Status badge (intake / in-progress / ready)
└── Drawer toggle → side drawer with Overview / Recommendation / Scope & Reqs / System Architecture
```

**One nav, not two.** No hamburger AND tab bar.

### 7.3 First-time-after-conversion screen

When a user lands on a project for the first time after creating it, the **chat IS the page**. Default view: chat panel maximized, AI's first message rendered, input auto-focused. Meta-cards (Artifact Pipeline, How It Works) are progressively disclosed *after* the first round-trip.

### 7.4 Empty data on a complex screen

When a viewer has no data yet (e.g., FFBD before synthesis runs), show:
- The page title
- One-line "Run synthesis to populate" with a primary CTA
- Nothing else (no skeleton tables, no fake data, no meta-explanations)

Currently `Architecture Diagram → "No architecture alternatives have been generated yet. Run synthesis to populate."` is correct. Don't add complexity.

---

## 8 · Tailwind utility map

When a designer says X, write Y in code:

| Designer says | Tailwind class |
|---|---|
| "primary CTA" | `bg-accent text-accent-foreground rounded-xl h-11 px-6 shadow-[var(--shadow-button-primary)]` |
| "secondary CTA" | `bg-firefly/5 text-foreground rounded-xl h-11 px-6 shadow-[var(--shadow-button-secondary)]` |
| "card" | `bg-card border border-border rounded-xl p-4 sm:p-6 lg:p-8` |
| "section" | `px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-28` |
| "container" | `max-w-7xl mx-auto` |
| "text-muted" | `text-muted-foreground` |
| "eyebrow" | `text-sm font-semibold uppercase tracking-wider text-accent` |
| "input" | `h-10 px-3 bg-firefly/5 border border-border rounded-xl text-base focus-visible:ring-2 focus-visible:ring-accent` |
| "FAB" | `fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-40 size-14 rounded-full bg-accent text-accent-foreground shadow-2xl active:scale-95` |

---

## 9 · Migration plan

To bring the codebase into compliance with this doc, in order:

1. **Phase 1 — Token consolidation** (1–2 hours, mechanical):
   - Export Webflow Variables → fill ramp hexes in §1.1
   - Update `theme.css` with full ramps + semantic tokens
   - Update `globals.css` to map shadcn HSLs at brand-step references (e.g. `--accent: <hsl-of-tangerine>`)
   - Remove duplicate `--c1v-accent` (now redundant with `--accent`)
   - Update `DESIGN.md` frontmatter to reference this doc, archive prose to `DESIGN.v1.md`

2. **Phase 2 — Font swap** (30 min):
   - Add Roboto via `next/font/google` in `app/layout.tsx`
   - Update `theme.css:11` `--font-body` to Roboto stack
   - Audit `<code>`/`<pre>` to ensure they keep mono font

3. **Phase 3 — Visual regression** (1 hour):
   - Run Playwright visual-regression suite
   - Update snapshots
   - Manually QA on iPhone + Android via real devices

4. **Phase 4 — Component cleanup** (~3-5 hours, can be incremental):
   - Search for hardcoded hexes (`grep -rE "bg-\[#[0-9a-fA-F]{3,6}\]" components/`)
   - Replace each with semantic token
   - Search for ad-hoc shadows / radii (`grep -rE "rounded-(2xl|3xl|sm)" components/`)
   - Normalize to `rounded-xl` or component-specific token

Each phase is independently mergeable. Don't bundle.

---

## 10 · Open questions for review

1. **Body font:** confirm Roboto. (Recommendation: yes.)
2. **Accent role:** confirm Tangerine. (Recommendation: yes.)
3. **Webflow ramp export:** when do we get the actual hex values for each step? (Blocks Phase 1.)
4. **`DESIGN.md`:** delete or archive?
5. **c1v.ai parent site:** in-scope for this design system, or out?

---

*Companion docs: [`AUDIT.md`](AUDIT.md) (drift findings), [`MOBILE-UX-AUDIT-PLAN.md`](MOBILE-UX-AUDIT-PLAN.md) (per-page improvement plan, after Playwright shots land).*
