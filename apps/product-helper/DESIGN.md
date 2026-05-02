---
name: Product Helper
colors:
  background: "#fbfcfc"
  text: "#061818"
  cta: "#5998C5"
  cta-hover: "#8ab6d6"
  shading: "#fce8cc"
  error: "#E5484D"
  success: "#16A34A"
typography:
  h1:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "3.5rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  h2:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  body-md:
    fontFamily: "Consolas, monospace"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label-caps:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
rounded:
  sm: 8
  md: 12
  lg: 16
spacing:
  sm: 8
  md: 16
  lg: 32
---

## Overview

Product Helper (prd.c1v.ai) is a serious engineering tool with a calm, architectural aesthetic. The design uses a Porcelain background with Firefly Darker text for maximum legibility, Danube blue for all primary CTAs, and Tangerine Lighter as a warm accent shading — precise and developer-friendly rather than playful.

## Colors

Canonical source: `app/theme.css`. Use CSS tokens, never hardcoded hex.

### Light Theme
| Role | Token | Hex |
|---|---|---|
| Background | `--bg-primary` → `--color-porcelain` | `#fbfcfc` |
| Body text | `--text-primary` → `--color-firefly-darker` | `#061818` |
| Heading text | `--text-heading` → `--color-firefly-darker` | `#061818` |
| Primary CTA | `--cta-primary` → `--color-danube` | `#5998C5` |
| CTA hover | `--cta-primary-hover` → `--color-danube-light` | `#8ab6d6` |
| Shading / badges | `--bg-shading` → `--color-tangerine-lighter` | `#fce8cc` |
| Muted text | `--text-muted` | `rgba(13,13,13,0.6)` |
| Border | `--c1v-border` | `rgba(13,13,13,0.15)` |

### Dark Theme
| Role | Token | Hex |
|---|---|---|
| Background | `--bg-primary` → `--color-firefly-darkest` | `#041110` |
| Body text | `--text-primary` → `--color-porcelain` | `#fbfcfc` |
| Heading text | `--text-heading` → `--color-porcelain` | `#fbfcfc` |
| Primary CTA | `--cta-primary` → `--color-danube-light` | `#8ab6d6` |
| CTA hover | `--cta-primary-hover` → `--color-danube` | `#5998C5` |
| Shading / badges | `--bg-shading` → `--color-tangerine-lighter` | `#fce8cc` |
| Muted text | `--text-muted` | `rgba(255,255,255,0.6)` |
| Border | `--c1v-border` | `rgba(255,255,255,0.2)` |

### Brand Palette (primitives)
| Name | Hex | Usage |
|---|---|---|
| Porcelain | `#fbfcfc` | Light bg, dark body/heading text |
| Firefly Darker | `#061818` | Light body/heading text |
| Firefly Darkest | `#041110` | Dark bg |
| Danube | `#5998C5` | Light CTA, dark hover |
| Danube Light | `#8ab6d6` | Light hover, dark CTA |
| Tangerine Lighter | `#fce8cc` | Shading (both themes) |
| Tangerine | `#F18F01` | Accent — eyebrows, icons, badges |
| Firefly | `#0B2C29` | Deep teal-black for high-contrast surfaces |

## Typography

Space Grotesk (headings) + Consolas (body). Headlines are large, tight, and bold with negative letter-spacing. Body text is monospace at 1rem / 1.5 line-height. Eyebrow labels use Space Grotesk semibold in Tangerine accent color.

## Layout

- **Container**: max-width ~1280px (`max-w-7xl`), centered with generous horizontal padding (`px-4 sm:px-[5%]`).
- **Vertical rhythm**: Sections use `py-16 md:py-24 lg:py-28` for breathing room.
- **Grid**: Three-column grids for problem cards, steps, and pricing tiers; collapses to single column on mobile.
- **Border radius**: Consistent `rounded-xl` (12px) on buttons, cards, badges, and the hero product mockup — no sharp corners, no pills.
- **Borders & dividers**: Hairline `border-border` on cards; subtle `bg-border` horizontal rules separate pricing CTAs from feature lists.
- **Shadows**: Soft elevation only on the hero mockup (`shadow-2xl`) and CTA buttons (custom `--shadow-button-primary/secondary` tokens).

## Components

- **Top Navigation**: Slim, sticky-feeling bar with brand mark (circle icon + "Product Helper" wordmark), centered text links (How it works, Features, Blog, Pricing), a theme toggle, a ghost "Sign in" link, and a Danube-filled "Start free" CTA pill.
- **Primary Button**: `bg-[var(--cta-primary)]` with white text, `rounded-xl`, 48px tall (`h-12`), `px-8 py-3`, hover shifts to `var(--cta-primary-hover)`. Used for main conversion actions.
- **Secondary Button**: `bg-black/5` with foreground text, same shape and size as primary, hover deepens to `bg-black/10`. Used for "See how it works".
- **Hero Product Mockup**: Browser-chrome card set on the dark Firefly Darkest background. Inside: a centered headline, a segmented toggle, a textarea-style prompt zone, and a row of category chips (rounded-xl, white/20 border, subtle text).
- **Problem/Step Cards**: Plain bordered rectangles, `rounded-xl`, ~32px padding, with a Tangerine-tinted icon, bold short H3, and muted body copy.
- **Pricing Cards**: Three columns. Featured tier is outlined in Tangerine with a 1px ring; non-featured tiers use neutral border. Each contains a title, subtitle metadata, large price, full-width CTA, divider, and a checklist of features with Tangerine check icons.
- **Testimonial Cards**: Quote-led blocks with author initials in a circular avatar, name, and role/company on subsequent lines.
- **Footer**: Dark block (Firefly Darkest bg) with newsletter capture, three-column link list (Product, Developers, Community), and small legal line.