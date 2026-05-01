# v2.2.2 Front-End Audit

**Date:** 2026-05-01
**Scope:** prd.c1v.ai (Next.js app) + c1v.ai (Webflow parent) — color/typography/component drift, mobile UI/UX
**Author:** generated for review

---

## TL;DR

The product has **three competing token sources** in active use, and they disagree on what "primary" and "accent" mean. That's why your UI looks inconsistent. The fix isn't more tokens — it's collapsing to **one** source and deleting the others.

| Token | `theme.css` (hex) | `globals.css` (HSL → hex) | Figma override | Verdict |
|---|---|---|---|---|
| Primary brand | `#F18F01` Tangerine | `#FCE8CC` pale-cream | `#F18F01` (per David's note) | **Use saturated Tangerine** |
| Accent | `#F18F01` (`--c1v-accent`) | `#5998C5` Danube | Tangerine | **Tangerine = accent**; Danube = secondary |
| Body font | Consolas mono | Consolas mono | **Roboto** | **Switch to Roboto** |
| Foreground | `#0B2C29` Firefly | `#0B2C29` Firefly | `#0D0D0D` | Keep Firefly (more brand-distinctive) |

The marketing landing on `prd.c1v.ai` (Next.js, in-repo) is responsive-correct. The mobile clipping bug seen in `mobile-home.png` is **c1v.ai-on-Webflow only** — that site is not in this repo.

---

## 1 · Source-of-truth hierarchy

| Rank | Source | Path | What it owns | Status |
|---|---|---|---|---|
| 1 | **Webflow Variables** (designer-edited tonight) | `davids-marvelous-site-6e4eea` (Webflow) | Full color ramps (5 families × 5–6 steps), 5 named color schemes | Authoritative for **palette structure** |
| 2 | **Figma file** `g5lP1TizFUIvqb86hsAjaL` | `prd-c1v-front-end/figma-css/{01-typography,02-ui-elements}.css` | Type scale (Space Grotesk + Roboto), component states, radii, shadows, button colors | Authoritative for **type + components** |
| 3 | **`theme.css`** | `apps/product-helper/app/theme.css` | Brand hex tokens (`--color-tangerine` etc), `--c1v-*` semantic tokens | Production reality #1 — partially correct |
| 4 | **`globals.css`** | `apps/product-helper/app/globals.css` | shadcn HSL tokens (`--primary`, `--accent`, etc), dark mode, type sizes | Production reality #2 — drifted |
| 5 | **`DESIGN.md`** | `apps/product-helper/DESIGN.md` | Design contract (frontmatter + prose) | **Stale — claims Geist font, accent #E8954A** |
| n/a | **`BRAND-BIBLE.md`** | `prd-c1v-front-end/BRAND-BIBLE.md` | Pricing, CTAs, messaging hierarchy, ICP language | Marketing-only — not visual design |

### How they're loaded
```ts
// app/layout.tsx
import './theme.css'    // declares --color-* + --c1v-*
import './globals.css'  // declares --primary, --accent, dark theme
```
Both fire. They use **different namespaces** (`--c1v-accent` vs `--accent`), so neither overrides the other. Components reference whichever namespace their author knew about → **why pages look different from each other**.

---

## 2 · The five confirmed drifts

### D1 — Body font: Consolas (production) vs Roboto (Figma) 🔴

| Where | Value |
|---|---|
| `theme.css:11` | `--font-body: Consolas, monospace;` |
| `globals.css:81` | `font-family: var(--font-body, Consolas, monospace);` |
| Figma `01-typography.css:14` | `Body Typeface: Roboto` |

**Why it matters:** every paragraph, label, button label, input placeholder, and table cell across the entire app is rendered in Consolas monospace. That's a *terminal* aesthetic, which fights the brand positioning ("calm, architectural"). It's the single biggest reason the dashboard looks like a developer tool instead of a polished SaaS.

**Fix:** swap `--font-body` to `Roboto`. Self-host or use `next/font/google`. Keep Consolas as an explicit `font-mono` utility for code blocks only.

---

### D2 — Primary button color: pale cream vs saturated Tangerine 🔴

| Where | Value | Visual |
|---|---|---|
| `globals.css:111` | `--primary: 33 93% 89.4%` → `#FCE8CC` | very pale cream |
| `theme.css:20` | `--color-tangerine: #F18F01` | saturated orange |
| Figma `02-ui-elements.css:84` | "Primary button color overridden to #F18F01 Tangerine per David" | saturated orange |

**Why it matters:** components built against shadcn's `bg-primary` get pale-cream buttons that read as **disabled or inactive**. Components built against `bg-[var(--color-tangerine)]` get the right color. Side-by-side these look like two different products.

**Fix:** map shadcn `--primary` → Tangerine (`33 96% 47%`), and rename the pale `#FCE8CC` to `--color-tangerine-lightest` (a tint, not the brand color).

---

### D3 — Accent role: Danube (production) vs Tangerine (canonical) 🟡

| Where | Value |
|---|---|
| `globals.css:126` | `--accent: 205 48.2% 56.1%` → `#5998C5` Danube |
| `theme.css:28` | `--c1v-accent: var(--color-tangerine)` |

**Why it matters:** `--accent` is what shadcn components like `Badge`, `Calendar`, `Tabs` reach for. They're rendering Danube. But `theme.css` and Figma both say Tangerine = accent. So accent badges and accent dots are blue in some places and orange in others.

**Fix:** Tangerine = accent. Danube = `--color-secondary` (a complementary brand color for charts and non-primary surfaces, not for accenting actions).

---

### D4 — Foreground text: #0B2C29 (production) vs #0D0D0D (Figma) 🟢

| Where | Value |
|---|---|
| `theme.css:18,27` | `--color-firefly: #0B2C29` (text on light bg) |
| `globals.css:102` | `--foreground: 174.5 60% 10.8%` ≈ `#0B2C29` |
| Figma `01-typography.css` | `color: #0D0D0D` everywhere |

**Why it matters:** marginal — Firefly is a 1.5% darker, slightly-greener black-ish. Keep Firefly: it's distinctive and ties text-on-light to bg-on-dark. The Figma file used a generic `#0D0D0D` only because it's a Figma default.

**Fix:** none. Document Firefly as the canonical text color, mark `#0D0D0D` in Figma export as superseded.

---

### D5 — Color ramps: 1 step vs 5 steps 🟡

The Webflow Variables panel (screenshot tonight 23:38) shows full ramps:

```
Firefly       Lightest · Light · Lighter · Dark · Darker · Darkest
Tangerine     Lightest · Light · Lighter · Dark · Darker · Darkest
Porcelain     Lightest · Light · Lighter · Dark · Darker · Darkest
Neutral       Lightest · Light · Lighter · Dark · Darker · Darkest
Danube        Lightest · Light · Lighter · Dark · Darker · Darkest
```

Production has **only the base step** of each. Result: every hover state, disabled state, dark-surface variant, badge background, etc. is hardcoded as a one-off `rgba(0,0,0,0.05)` or similar. The whole codebase has no concept of "Tangerine Light" — components fake it with opacity.

**Fix:** export the full Webflow ramp into `theme.css`, then re-map shadcn HSLs to point at named ramp steps. Components stop hand-rolling tints.

---

## 3 · Type-scale drift (low priority)

`globals.css:217-231` has a hand-coded mobile-first type scale that **disagrees** with Figma `01-typography.css` by ~10–15% on every size:

| Heading | globals.css mobile | Figma mobile | globals.css desktop | Figma desktop |
|---|---|---|---|---|
| H1 | 40px | 40px ✅ | 72px | 72px ✅ |
| H2 | 36px | 36px ✅ | 52px | 52px ✅ |
| H3 | 32px | 32px ✅ | 44px | 44px ✅ |
| H4 | 24px | 24px ✅ | 36px | 36px ✅ |
| H5 | 20px | 20px ✅ | 28px | 28px ✅ |
| H6 | 18px | 18px ✅ | 22px | 22px ✅ |

Actually the type scale matches. **No drift here.** Letter-spacing is `-0.01em` in both. ✅

---

## 4 · The c1v.ai (Webflow) mobile clipping bug

`prd-c1v-front-end/mobile-home.png` shows **horizontal text clipping on every section** of the c1v.ai parent site. Examples: "Your AI Sideki…", "Phase A: Determine Match" → "Phase A", "Forward-Driven Engineering ▪ Value Adding from the first call" → cut at right edge.

**Root cause:** the Webflow Designer ingested the Figma file's absolute widths (`width: 1313px`, `624.5px`, `1024px` per `figma-css/01-typography.css`) without converting them to viewport-relative units.

**Same Figma → React conversion** (Relume → in-repo `apps/product-helper/components/marketing/`) does NOT have the bug. Verified via grep: `0 matches` for `w-\[…px|width:\s*\d+px` across the 9 marketing components. Tailwind classes are `px-4 sm:px-[5%]`, `max-w-7xl mx-auto`, etc.

**Implication:** if you want one canonical responsive site, port c1v.ai (parent) into the monorepo as a sibling of `(marketing)`. Same components, same tokens, no Webflow drift. Ballpark: 1 day.

---

## 5 · Decisions needed

1. **Body font:** Roboto (Figma canonical) **vs** Consolas (current production)?
   *Recommendation: Roboto. Reserve Consolas for code blocks only.*

2. **Primary button color:** #F18F01 saturated Tangerine **vs** #FCE8CC pale cream?
   *Recommendation: #F18F01. The pale cream becomes `tangerine-lightest`, used for hover backgrounds only.*

3. **Accent role:** Tangerine **vs** Danube?
   *Recommendation: Tangerine = accent. Danube = secondary (charts, complementary surfaces, never on a primary CTA).*

4. **Token consolidation strategy:**
   a. Merge — keep `theme.css` as source of truth, derive shadcn HSL from it via @apply or CSS-vars
   b. Replace shadcn HSLs with brand hex directly in `globals.css`, delete `theme.css`
   c. New file `tokens.css`, delete both
   *Recommendation: (a) — least risk, theme.css is already the more correct file.*

5. **c1v.ai parent site fate:**
   a. Fix in Webflow Designer (no code change, manual)
   b. Port to Next.js monorepo
   c. Ignore until traffic justifies
   *Recommendation: depends on whether c1v.ai or prd.c1v.ai is the primary signup path. If c1v.ai → port. If prd.c1v.ai → ignore.*

---

## 6 · Files for you to inspect

- [`apps/product-helper/app/theme.css`](../../apps/product-helper/app/theme.css) — brand hex tokens
- [`apps/product-helper/app/globals.css`](../../apps/product-helper/app/globals.css) — shadcn HSL tokens
- [`apps/product-helper/DESIGN.md`](../../apps/product-helper/DESIGN.md) — stale design doc
- [`prd-c1v-front-end/figma-css/01-typography.css`](../../prd-c1v-front-end/figma-css/01-typography.css) — Figma type spec
- [`prd-c1v-front-end/figma-css/02-ui-elements.css`](../../prd-c1v-front-end/figma-css/02-ui-elements.css) — Figma component spec
- [`prd-c1v-front-end/BRAND-BIBLE.md`](../../prd-c1v-front-end/BRAND-BIBLE.md) — marketing brand bible

---

*Next: `DESIGN-BIBLE.md` consolidates this into a canonical reference. `MOBILE-UX-AUDIT-PLAN.md` (after Playwright shots land) translates findings into a per-page improvement plan.*
