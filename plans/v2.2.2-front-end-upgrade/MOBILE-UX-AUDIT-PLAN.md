# Mobile UX Audit + Plan — prd.c1v.ai (production)

**Date:** 2026-05-01
**Source:** 15 screenshots captured via Playwright (Mobile Safari / iPhone 12) against `https://prd.c1v.ai`. Stored in [`./screenshots/`](./screenshots/).
**Companion docs:** [`AUDIT.md`](./AUDIT.md), [`DESIGN-BIBLE.md`](./DESIGN-BIBLE.md)

> **CRITICAL CONTEXT:** these screenshots show **production** (commit `f4faa58` — `main`-equivalent). The Q1–Q3 mobile-nav fixes I shipped earlier (commit `3ae94e8`) are on the branch `ui/completions-wave-e-handoff` and **not yet merged to main / deployed**. The audit below reflects what users see *today*. Many findings will be partially resolved when that branch ships.

---

## TL;DR — three findings dominate every screen

1. **🔴 Consolas body font everywhere** turns the whole product into a CLI tool. Every screen — sign-in, home, projects list, project overview, viewers, account — reads as terminal output. This single change fixes more "feels broken" energy than any other intervention. *(Drift D1 in AUDIT.md)*

2. **🔴 "Primary" renders as two completely different colors.** Pale cream `#FCE8CC` on auth pages (Sign-in button → 15-sign-in.png). Saturated Danube blue `#5998C5` on dashboard pages (New Project / Help me scope / Intake badge → 02-projects-list.png, 03-home-help-me-scope.png). Same intent, schizophrenic palette. *(Drifts D2 + D3)*

3. **🔴 Tangerine is essentially absent from production.** The Figma override notes "Primary button color = #F18F01 Tangerine" but production never paints that color on a CTA. Tangerine only appears as a tiny circle accent on "How It Works" step numerals (05-project-overview.png). The brand color isn't being used as the brand color.

Fix all three and the app starts feeling like one product.

---

## 1 · Customer journey audit

For each phase: what the user is trying to do, what they see, what's wrong.

### Phase 1 — Sign-in (`/sign-in`)
**Goal:** authenticate to start working.
**Screen:** [15-sign-in.png](./screenshots/15-sign-in.png)

| Finding | Severity |
|---|---|
| "Sign in" button is pale cream `#FCE8CC` → reads as **disabled** | 🔴 |
| "Forgot your password?" link in pale tangerine → very low contrast (likely fails WCAG AA) | 🔴 |
| Body text in Consolas | 🟡 |
| H1 "Sign in to your account" extends edge-to-edge ("account" almost touches right edge) | 🟡 |
| Logo: 1 small circle, no wordmark, no tagline → users may not be sure they're on c1v | 🟢 |

**Fix:** apply Tangerine to the primary CTA. Re-color the "Forgot password" link to `--fg-primary`. Add a small "Product Helper" wordmark next to the circle.

### Phase 2 — Home / project creation (`/home`)
**Goal:** start a new project.
**Screens:** [01-home-start.png](./screenshots/01-home-start.png), [03-home-help-me-scope.png](./screenshots/03-home-help-me-scope.png), [04-home-project-types.png](./screenshots/04-home-project-types.png)

| Finding | Severity |
|---|---|
| "I have a defined scope" / "Help me scope" tabs are **Danube blue** when active → looks like nav, not state toggle | 🟡 |
| Hamburger menu (≡) AND bottom-nav both visible → duplicated navigation (the Q1 fix removes hamburger) | 🟡 (fix shipped, not deployed) |
| Body in Consolas — "Define the structure, decisions, and tradeoffs before you write code" reads as terminal output | 🔴 |
| "Project details (optional)" accordion → fine pattern, but the badge `optional` could be clearer (`pill` style + grey) | 🟢 |
| Textarea placeholder "Describe your product vision. What problem does it solve? Who are the users?" — multi-question, could intimidate. Consider single question + chips | 🟡 |
| No primary CTA visible in the viewport — user has to scroll to find "Start" or "Generate" | 🟡 |

**Fix:** sticky primary CTA at bottom (above bottom-nav) once any text is entered. Re-color toggle tabs to Tangerine for active state. Single placeholder question. Body font → Roboto.

### Phase 3 — Projects list (`/projects`)
**Goal:** open an existing project.
**Screen:** [02-projects-list.png](./screenshots/02-projects-list.png)

| Finding | Severity |
|---|---|
| "New Project" button is **Danube blue** with icon — same primary-color confusion as auth | 🔴 |
| Project card has three pieces of info competing: title + Intake badge + body summary + "0%" + "Today" + "Created by …@email" — too dense for mobile | 🟡 |
| **No clipping** ✅ — single column responsive | 🟢 |
| Hamburger STILL there + bottom nav | 🟡 |

**Fix:** "New Project" → Tangerine fill. Reduce card density on mobile (drop "Created by", reduce body summary to 2 lines). Use a FAB instead of the inline header button on mobile (your Q2 fix already does this, just unmerged).

### Phase 4 — First time inside a project (`/projects/[id]`)
**Goal:** start the chat to define the product.
**Screen:** [05-project-overview.png](./screenshots/05-project-overview.png)

| Finding | Severity |
|---|---|
| **MAJOR UX FAIL:** "How It Works" tutorial card shown as primary content *after* user already clicked Start. They know how it works — they just used it. | 🔴 |
| **Two competing FABs** — left "panel toggle" (sidebar) + right "chat bubble with `7` unread badge". Both feel primary, neither is clearly THE thing. | 🔴 |
| Chat has 7 unread messages from the AI. **That should be the page**, not a tucked-away FAB. | 🔴 |
| "Artifact Pipeline" card peeking at the bottom shows empty pipeline → showing absence of work as primary content | 🟡 |
| Project title "AI meal planner" + "intake" status badge fine, but the back-arrow is small and lonely above it | 🟢 |

**Fix:** when status = `intake` and the user lands fresh, **default the chat panel to maximized**. Hide "How It Works" entirely, or behind a `?` icon. Hide "Artifact Pipeline" until first round-trip completes. Kill the duplicate left FAB.

### Phase 5 — Generic chat (`/chat`)
**Goal:** open a help conversation outside any project.
**Screen:** [06b-chat-page.png](./screenshots/06b-chat-page.png)

| Finding | Severity |
|---|---|
| Empty state OK — robot emoji, "AI-Powered PRD Assistant" h2, 5 bullet list of capabilities | 🟢 |
| Send button is pale cream → reads disabled | 🔴 |
| Header takes 2 lines of vertical space ("AI Assistant" + 1-line description); on a small phone the empty state pushes well below the fold | 🟡 |
| "Ask me anything about creating PRDs..." placeholder is fine | 🟢 |

**Fix:** Send button → Tangerine. Compress header to 1 line on mobile.

### Phase 6 — Synthesis viewers (Decision Matrix, FFBD, QFD, Interfaces, Requirements)
**Goal:** review what the AI generated.
**Screens:** [07-architecture.png](./screenshots/07-architecture.png), [08-ffbd.png](./screenshots/08-ffbd.png), [09-qfd.png](./screenshots/09-qfd.png), [10-interfaces.png](./screenshots/10-interfaces.png), [11-requirements-problem-statement.png](./screenshots/11-requirements-problem-statement.png)

| Finding | Severity |
|---|---|
| **QFD matrix is unusable on mobile** — column headers rotated vertically, only first engineering characteristic visible, customer needs squeezed | 🔴 |
| Decision Matrix table also clips on right edge — "Unit" column is 50% off-screen | 🔴 |
| All viewers retain the persistent chat FAB with `7` unread → it follows users everywhere, including pages where chat is irrelevant | 🟡 |
| Page header in Space Grotesk (correct), section title "Performance Criteria vs. Design Alternatives" wraps cleanly | 🟢 |
| Body content (table data, descriptions) all in Consolas | 🔴 |
| Problem Statement / Requirements pages have a clean card-based layout that **works** on mobile | 🟢 |

**Fix:** every viewer needs a **mobile alternative layout** for tabular data. Two options:
   a. **Stacked card view** — each row becomes a card with key:value pairs (best for QFD, Decision Matrix)
   b. **Horizontal scroll with sticky first column** — keeps the table format but lets users swipe (acceptable for FFBD)

Currently they use the desktop table responsively-shrunk → unreadable.

### Phase 7 — Account (`/account`)
**Goal:** manage profile, theme, billing, sign out.
**Screen:** [13-account.png](./screenshots/13-account.png)

| Finding | Severity |
|---|---|
| Card-based section layout — clean, scannable | 🟢 |
| Theme picker: text-only ("Choose light, dark, or system theme") + icon — **not actually interactive in this view** (no buttons or radios visible) | 🟡 |
| Destructive section (red) peeking at bottom — appropriate use of `--destructive` ✅ | 🟢 |
| Body font Consolas | 🔴 |
| Account tab in bottom-nav highlighted with reduced opacity (active state) ✅ | 🟢 |

**Fix:** make theme picker a real segmented control with three options (Light / Dark / System).

### Phase 8 — Marketing landing (`/`)
**Goal:** convert anonymous visitors.
**Screens:** [14-marketing-landing.png](./screenshots/14-marketing-landing.png), [14b-marketing-scrolled.png](./screenshots/14b-marketing-scrolled.png)

| Finding | Severity |
|---|---|
| **Responsive ✅** — no clipping, single-column flow, hero mockup at appropriate scale | 🟢 |
| Body in Consolas across the entire landing — "You already know the problem. Your AI coding agent doesn't." reads as monospace | 🔴 |
| Pricing section: 3 tiers stacked (Free, Base CA$19.99, Plus CA$49.99) — Base highlighted as featured. Looks good | 🟢 |
| FAQ section, footer with newsletter capture, three-col link list — all stack cleanly | 🟢 |
| Hero CTA "Let's get building" → checks out (right-pointing arrow, Tangerine?) but unclear without inspecting | 🟡 |

**Fix:** the Relume-derived marketing components are doing their job. Body font swap to Roboto resolves 80% of remaining polish.

---

## 2 · Cross-cutting findings (apply to multiple screens)

### CC1 — Consolas body font everywhere 🔴
**Where:** every authenticated and unauthenticated screen.
**Why bad:** the brand voice is "calm, architectural" — Consolas signals "developer terminal." Mismatch.
**Fix:** swap `--font-body` to Roboto in `theme.css:11`. Reserve Consolas for `<code>` and `<pre>` only.

### CC2 — Persistent chat FAB with unread count 🟡
**Where:** every dashboard page (Project Overview, Decision Matrix, FFBD, QFD, Interfaces, Requirements).
**Why bad:** the badge keeps growing as the user navigates away from chat, but the FAB is small and visually competes with the page's actual primary action.
**Fix:** show the FAB only on pages where chat is contextually relevant (project overview, viewers during synthesis). On pages like Account, Sign-in, plain Projects list — hide it.

### CC3 — Header chrome eats vertical space 🟡
**Where:** every authenticated dashboard page.
**Layout (top to bottom):** [browser top bar] → [App Header: hamburger + Logo + theme + avatar = 56px] → [back arrow + project title + status badge = 56px] → page content.
**Result:** ~12-14% of mobile viewport gone before content starts.
**Fix:** collapse App Header on scroll-down (reveal on scroll-up). Inline back-arrow with the project title in a single 44px row instead of two.

### CC4 — No mobile-optimized data viewers 🔴
**Where:** Decision Matrix, QFD, FFBD (less so), Interfaces.
**Fix:** detect viewport, render card-stack on `<sm`, table on `sm+`. Or universal: horizontal scroll with sticky first column.

### CC5 — Inconsistent CTA color 🔴
**Where:** Sign-in (pale cream), Home toggle tabs (Danube), Projects "New Project" (Danube), Chat "Send" (pale cream), Project FABs (Danube), step numerals (Tangerine).
**Why bad:** users can't form a mental model of "primary action looks like X."
**Fix:** lock primary CTA to Tangerine `#F18F01` per Design Bible. Apply consistently.

### CC6 — Active states are color-shift only, no tactile feedback 🟢
**Where:** all interactive elements.
**Fix:** add `active:scale-95 active:opacity-80 touch-manipulation` to every button, tab, card. This is the difference between "web feels like a website" and "web feels like an app."

---

## 3 · Prioritized improvement plan

### Now (next 1–2 days, ~4 hrs work, ~3x perceived quality lift)

| # | Task | Files | Effort | Lift |
|---|---|---|---|---|
| N1 | **Body font: Consolas → Roboto** | `theme.css:11`, `app/layout.tsx` (next/font/google) | 30 min | 🚀🚀🚀 |
| N2 | **Lock primary CTA to Tangerine `#F18F01`** | `globals.css:111` map `--primary` to tangerine HSL; remove pale-cream from primary role | 45 min | 🚀🚀🚀 |
| N3 | **Tangerine for active toggle/tab states** | `globals.css:126` swap `--accent` Danube → Tangerine; Danube becomes `--secondary` | 20 min | 🚀🚀 |
| N4 | **Fix "Forgot password" link contrast** | login form component | 5 min | 🚀 |
| N5 | **Hide chat FAB on contextually-irrelevant pages** | wrap FAB component in route-aware conditional | 20 min | 🚀 |
| N6 | **Merge `ui/completions-wave-e-handoff`** (gets Q1–Q3 mobile-nav fixes live) | git | 5 min + review time | 🚀🚀 |

**Branch this work as:** `ui/v2.2.2-frontend-baseline`. One PR, six small commits, easy review.

### Next (next sprint, ~6 hrs)

| # | Task | Notes |
|---|---|---|
| X1 | **First-time-after-Start chat-primary view** | When project is freshly created (status=`intake`, no chat history visible to user), default to maximized chat panel; hide "How It Works" + "Artifact Pipeline" |
| X2 | **Mobile QFD viewer** | Stacked card layout — each row = card with `customer-need / weight / engineering-char-name / score / status` |
| X3 | **Mobile Decision Matrix viewer** | Same pattern as QFD; alternative: horizontal scroll with sticky first column |
| X4 | **Sticky primary CTA on `/home`** | Once textarea has any input, show "Generate" CTA fixed at bottom-above-nav |
| X5 | **Compress App Header to ≤44px** | Inline back arrow with project title; collapse on scroll |
| X6 | **Theme picker as segmented control** | Light / Dark / System with proper interactive primitives |
| X7 | **Tactile press states** | Add `active:scale-95 active:opacity-80 touch-manipulation` to all buttons, tabs, cards globally via shadcn `Button` primitive |

### Later (when c1v.ai migration happens, ~1–2 days)

| # | Task | Notes |
|---|---|---|
| L1 | **Port c1v.ai parent into monorepo** | Kill the Webflow clipping bug; one design system across both sites |
| L2 | **Visual regression suite vs. Design Bible** | Snapshot every screen × light/dark × mobile/desktop. Fail PR on visual deltas not approved |
| L3 | **Storybook for the design system** | Every primitive lives in `components/ui/` with all states documented; designers can see what exists |
| L4 | **Accessibility audit (WCAG 2.1 AA)** | Run `axe-core` against all 15 captured routes; fix contrast, focus, ARIA |

---

## 4 · Suggested next concrete action

**Open a PR on `ui/completions-wave-e-handoff` that adds the six "Now" items (N1–N6) on top of the existing Q1–Q3 fixes.** Single PR, six commits, ~4 hours of work, ships with the mobile-nav consolidation already there.

If you want, I can:
- (a) Branch off and do N1–N5 right now (~2 hours actual coding time), or
- (b) Stop here, you review the audit + design bible, then green-light the PR.

I recommend (b) — these decisions are color/typography/CTA logic that should be reviewed before code lands. The audit + bible give you everything you need to say yes/no/different on each one.

---

## Appendix — screenshots referenced

| File | Phase | What it shows |
|---|---|---|
| `01-home-start.png` | Home | Defined-scope variant, project type chips below fold |
| `02-projects-list.png` | Projects | List of 1 project, "New Project" CTA |
| `03-home-help-me-scope.png` | Home | Help-me-scope variant |
| `04-home-project-types.png` | Home | Project details accordion, type chips visible |
| `05-project-overview.png` | Project | "How It Works" tutorial as primary content (the bug) |
| `06b-chat-page.png` | Chat | `/chat` empty state |
| `07-architecture.png` | Project / Decision Matrix | Table clips on right |
| `08-ffbd.png` | Project / FFBD | Functional flow viewer |
| `09-qfd.png` | Project / QFD | House of Quality matrix — unusable on mobile |
| `10-interfaces.png` | Project / Interfaces | N² matrix viewer |
| `11-requirements-problem-statement.png` | Project / Requirements | Problem statement card view ✅ |
| `13-account.png` | Account | Profile, preferences, danger zone |
| `14-marketing-landing.png` | Marketing | Mobile landing page (no clipping) |
| `14b-marketing-scrolled.png` | Marketing | Scrolled view, pricing + FAQ |
| `15-sign-in.png` | Auth | Sign-in form (CTA reads disabled) |

*Missing: `06a-chat-floating` (FAB-open variant — flow didn't trigger on this run), `12-more-sheet` (the new More tab — not deployed to prod yet).*
