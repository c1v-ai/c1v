---
name: Product Helper
colors:
  primary: "#FCE8CC"
  secondary: "#0B2C29"
  tertiary: "#F5D9B0"
  neutral: "#FFFFFF"
  accent: "#E8954A"
  error: "#E5484D"
  success: "#16A34A"
typography:
  h1:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "3.5rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  h2:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  body-md:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label-caps:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
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

Product Helper (prd.c1v.ai) presents itself as a serious engineering tool with a calm, architectural aesthetic. The design pairs a warm, peachy "tangerine/porcelain" CTA palette with a deep, near-black "firefly" green, creating a sophisticated, developer-friendly mood that feels precise rather than playful — fitting a product that promises structure over vibes.

## Colors

- **Primary (`#FCE8CC` Porcelain)** — Warm cream used for primary CTAs ("Start free", "Let's get building"). Signals action without aggression.
- **Secondary (`#0B2C29` Firefly)** — Deep teal-black used for primary CTA text, the dark product mockup background, and high-contrast surfaces. The brand's anchor color.
- **Tertiary (`#F5D9B0`)** — Hover state for primary buttons, a slightly deeper porcelain.
- **Accent (Tangerine)** — A warm orange used for section eyebrows ("How it works", "Plans"), step numerals at 20% opacity, icon highlights, and the "Most Popular" badge. Drives the eye to structural cues.
- **Neutral** — White/near-white page background with subtle borders for cards and dividers.
- **Muted-foreground** — Soft gray for supporting copy and metadata.

## Typography

A single sans-serif family (Geist-style) carries the entire system. Headlines are large, tight, and bold (with negative letter-spacing) to convey confidence and clarity; body text is moderate-weight at ~1rem with relaxed 1.5 line-height for scannable paragraphs. Eyebrow labels use a smaller semibold size in the tangerine accent. The hierarchy is dramatic — H1 dwarfs body — so each section reads as its own decisive statement.

## Layout

- **Container**: max-width ~1280px (`max-w-7xl`), centered with generous horizontal padding (`px-4 sm:px-[5%]`).
- **Vertical rhythm**: Sections use `py-16 md:py-24 lg:py-28` for breathing room.
- **Grid**: Three-column grids for problem cards, steps, and pricing tiers; collapses to single column on mobile.
- **Border radius**: Consistent `rounded-xl` (12px) on buttons, cards, badges, and the hero product mockup — no sharp corners, no pills. The uniform radius reinforces a calm, system-built feel.
- **Borders & dividers**: Hairline `border-border` on cards; subtle `bg-border` horizontal rules separate pricing CTAs from feature lists.
- **Shadows**: Soft elevation only on the hero mockup (`shadow-2xl`) and CTA buttons (custom `--shadow-button-primary/secondary` tokens).

## Components

- **Top Navigation**: Slim, sticky-feeling bar with brand mark (circle icon + "Product Helper" wordmark), centered text links (How it works, Features, Blog, Pricing), a theme toggle, a ghost "Sign in" link, and a porcelain-filled "Start free" CTA pill.
- **Primary Button**: `bg-[#FCE8CC]` with `text-[#0B2C29]`, `rounded-xl`, 48px tall (`h-12`), `px-8 py-3`, hover darkens to `#F5D9B0`. Used for the main conversion actions.
- **Secondary Button**: `bg-black/5` with foreground text, same shape and size as primary, hover deepens to `bg-black/10`. Used for "See how it works".
- **Hero Product Mockup**: Browser-chrome card with three muted dots and a centered URL pill (`prd.c1v.ai`), set on the dark firefly background. Inside: a centered headline, a segmented toggle ("I have a defined scope" / "Help me scope"), a textarea-style prompt zone, and a row of category chips (rounded-xl, white/20 border, subtle text).
- **Problem/Step Cards**: Plain bordered rectangles, `rounded-xl`, ~32px padding, with a tangerine-tinted icon, bold short H3, and muted body copy.
- **Pricing Cards**: Three columns. Featured tier is outlined in tangerine with a 1px ring; non-featured tiers use neutral border. Each contains a title, subtitle metadata, large price, full-width CTA, divider, and a checklist of features with tangerine check icons.
- **Testimonial Cards**: Quote-led blocks with author initials in a circular avatar, name, and role/company on subsequent lines.
- **Footer**: Dark or muted block with newsletter capture, three-column link list (Product, Developers, Community), and small legal line.