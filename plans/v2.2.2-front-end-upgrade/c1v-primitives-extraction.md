# c1v Primitives — Extraction from `~/Downloads/c1v-primitives.png`

**Source:** Webflow Variables panel, screenshot at `/Users/davidancor/Downloads/c1v-primitives.png`
**Extracted:** 2026-05-01

---

## ⚠️ Honest limitation

The image as rendered to me is ~333×800px. Each row's hex value occupies ~5–6 pixels of text height. **I can read the variable NAMES with high confidence; I cannot read the HEX values reliably without making them up.**

What I can do:
- ✅ Extract the full ordered list of variable names + their family/step
- ✅ Extract the structure (which families exist, how many steps each has)
- ✅ Confirm the swatches' rough hue/lightness against what I can see
- ❌ Read precise hex digits

To finish this, please do one of:
1. **Re-share at 2× zoom** — open `~/Downloads/c1v-primitives.png` in Preview, ⌘-+ until hex column fills ~30% of viewport, take 2 screenshots (top half + bottom half), share both. ~30 seconds.
2. **Copy-paste from Webflow** — in the Variables panel, select all rows, copy. Paste into a `.txt` or `.md` file in `~/Downloads/`. Webflow exports `name: hex` per line. ~15 seconds.
3. **Webflow CSV export** — Webflow → Variables panel → menu (•••) → Export → CSV.

---

## Names extracted (high confidence)

### Section 1 — `Primitives / Colors`

```
White

# Neutral
Neutral Lightest
Neutral Light
Neutral Lighter
Neutral
Neutral Dark
Neutral Darker
Neutral Darkest

# Firefly
Firefly Light
Firefly
Firefly Lighter
Firefly Dark
Firefly Darker
Firefly Darkest

# Porcelain
Porcelain
Porcelain Lighter
Porcelain Light
Porcelain Dark
Porcelain Darker
Porcelain Darkest

# Tangerine
Tangerine
Tangerine Light
Tangerine Lighter
Tangerine Lightest
Tangerine Dark
Tangerine Darker
Tangerine Darkest
```

### Section 2 — additional rows below the section break

```
Danube Lighter
Danube
Danube Dark
Danube Light
Firefly Darker          (duplicate / cross-ref?)
Porcelain Lighter       (duplicate / cross-ref?)
Tangerine Darker        (duplicate / cross-ref?)
Danube Lightest
Danube Darker
Danube Light            (duplicate?)
Firefly Lightest
Tangerine Darkest       (duplicate / cross-ref?)
```

> Some names in Section 2 appear to repeat names from Section 1. This is consistent with Webflow's "Variables 2" pattern where re-aliased tokens for a second mode (e.g. dark theme overrides) live in the same panel. **Cannot confirm without legible hex column.**

### Section 3 — `Opacity`

```
Transparent
White 5
White 10
White 15
White 20
White 30
White 40
White 50
White 60
Neutral Darkest 5
Neutral Darkest 10
Neutral Darkest 15
Neutral Darkest 20
Neutral Darkest 30
Neutral Darkest 40
…
```

(Pattern confirmed: opacity tokens are `<color> <opacity-percent>` e.g. `White 20` = `rgba(255,255,255,0.20)`.)

---

## Implied ramp structure

Each family has the same step naming (where applicable):

```
{Family} Lightest      — extreme tint   (e.g. ~95% lightness)
{Family} Light         — strong tint
{Family} Lighter       — moderate tint
{Family}               — base color (Figma-confirmed for Firefly/Porcelain/Tangerine/Danube)
{Family} Dark          — moderate shade
{Family} Darker        — strong shade
{Family} Darkest       — extreme shade  (e.g. ~5% lightness)
```

---

## Hex column (placeholder — REPLACE)

| Token name | Hex | Confidence |
|---|---|---|
| White | `#FFFFFF` | High (white is white) |
| Neutral Lightest | `???` | Cannot read |
| Neutral Light | `???` | Cannot read |
| Neutral Lighter | `???` | Cannot read |
| Neutral | `???` | Cannot read |
| Neutral Dark | `???` | Cannot read |
| Neutral Darker | `???` | Cannot read |
| Neutral Darkest | `???` (likely `#0D0D0D` per Figma) | Inferred from `figma-css/01-typography.css` |
| Firefly Light | `???` | Cannot read |
| Firefly | `#0B2C29` | High (confirmed in `theme.css:18`) |
| Firefly Lighter | `???` | Cannot read |
| Firefly Dark | `???` | Cannot read |
| Firefly Darker | `???` | Cannot read |
| Firefly Darkest | `???` | Cannot read |
| Porcelain | `#FBFCFC` | High (confirmed in `theme.css:19`) |
| Porcelain Lighter | `???` | Cannot read |
| Porcelain Light | `???` | Cannot read |
| Porcelain Dark | `???` | Cannot read |
| Porcelain Darker | `???` | Cannot read |
| Porcelain Darkest | `???` | Cannot read |
| Tangerine | `#F18F01` | High (confirmed in `theme.css:20` + Figma override note) |
| Tangerine Light | `#FDF3E5` | Medium (current `theme.css:21` value — verify it matches Webflow) |
| Tangerine Lighter | `???` | Cannot read |
| Tangerine Lightest | `???` | Cannot read |
| Tangerine Dark | `???` | Cannot read |
| Tangerine Darker | `???` | Cannot read |
| Tangerine Darkest | `???` | Cannot read |
| Danube | `#5998C5` | High (confirmed in `theme.css:22`) |
| Danube Light | `???` | Cannot read |
| Danube Lighter | `???` | Cannot read |
| Danube Lightest | `???` | Cannot read |
| Danube Dark | `???` | Cannot read |
| Danube Darker | `???` | Cannot read |
| Danube Darkest | `???` | Cannot read |

---

## Action required

Re-share the source per one of the three methods above. I'll fill in the `???` cells and update `apps/product-helper/app/theme.css` to use the canonical hexes (replacing the HSL-derived defaults I shipped earlier).
