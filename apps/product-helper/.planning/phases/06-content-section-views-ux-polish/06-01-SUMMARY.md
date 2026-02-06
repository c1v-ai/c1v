# 06-01 Summary: Quick UX Fixes

**Phase:** 06-content-section-views-ux-polish
**Plan:** 01
**Status:** Complete
**Date:** 2026-02-06

---

## What Was Built

Four targeted UX improvements addressing user-facing jargon, navigation, and visual noise:

### UX-01: Post-Login Redirect
Changed returning user redirect from `/projects` to `/welcome-test`, matching the new user flow (line 237 already redirected to `/welcome-test`). Both sign-in and sign-up now land on the same welcome page.

### UX-02: Vision Metadata Stripping Utility
Created `stripVisionMetadata()` in `lib/utils/vision.ts` that removes:
- `[Mode: Defined Scope]` / `[Mode: Guided Discovery]` prefix line
- `---` separator and all system context text after it
- Handles null/undefined input gracefully (returns empty string)

This utility is created here but NOT applied to `page.tsx` yet -- plan 06-04 rewrites the overview page and will integrate it there to avoid file conflicts.

**Chat auto-send verification:** Confirmed that `project-chat-provider.tsx` (lines 186-212) already strips metadata from the auto-send message using `modeLineIndex` and `separatorIndex` logic. No changes needed.

### UX-08: Validation Report Hidden in Production
Wrapped `<ValidationReport>` in `process.env.NODE_ENV === 'development'` conditional on the overview page. Since this is a server component, the check happens at render time and the component is tree-shaken in production builds.

### UX-09: Green Hover Highlighting Removed
Removed `hover:bg-muted/50 transition-colors` from actor table rows and `hover:bg-muted/50` from data entity cards in `system-overview-section.tsx`. Cleaned up unused `cn` import.

---

## Files Changed

| File | Change |
|------|--------|
| `app/(login)/actions.ts` | Line 105: `redirect('/projects')` -> `redirect('/welcome-test')` |
| `lib/utils/vision.ts` | **NEW** -- `stripVisionMetadata()` export |
| `app/(dashboard)/projects/[id]/page.tsx` | Lines 164-170: ValidationReport wrapped in NODE_ENV check |
| `components/projects/sections/system-overview-section.tsx` | Removed hover classes from actor rows (line 118) and entity cards (line 327); removed unused `cn` import |

---

## Commits

| Hash | Message |
|------|---------|
| `3c5aa1b` | feat(06-01): post-login redirect to /welcome-test + stripVisionMetadata utility |
| `fda4aa2` | feat(06-01): hide validation in prod + remove hover highlighting |

---

## Verification

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | Pass (no new errors) |
| `pnpm build` | Pass (production build succeeds) |
| `redirect('/welcome-test')` in actions.ts line 105 | Confirmed |
| `stripVisionMetadata` exported from lib/utils/vision.ts | Confirmed |
| Chat auto-send strips metadata (modeLineIndex logic) | Confirmed (no changes needed) |
| NODE_ENV gate on ValidationReport | Confirmed |
| No `stripVisionMetadata` in page.tsx | Confirmed (deferred to 06-04) |
| No `hover:bg-muted` in system-overview-section.tsx | Confirmed |

---

## Deviations

None. All four UX fixes applied as planned.
