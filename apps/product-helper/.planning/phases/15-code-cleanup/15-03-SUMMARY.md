---
phase: 15-code-cleanup
plan: 03
subsystem: backend
tags: [api, middleware, hof, auth, typescript, code-reduction]

# Dependency graph
requires:
  - phase: 15-02
    provides: Security and type safety foundations
provides:
  - Reusable withProjectAuth middleware for API routes
  - Pattern for eliminating duplicated auth/validation logic
  - Type-safe AuthContext and AuthContextWithProject interfaces
affects: [api-routes, backend-refactoring, future-route-migrations]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - withProjectAuth HOF pattern for API route auth
    - Type-safe context injection via generics

key-files:
  created:
    - lib/api/with-project-auth.ts
  modified:
    - app/api/projects/[id]/route.ts
    - app/api/projects/[id]/validate/route.ts
    - app/api/projects/[id]/stories/route.ts
    - app/api/projects/[id]/tech-stack/route.ts
    - app/api/projects/[id]/api-spec/route.ts

key-decisions:
  - "Created HOF with function overloads for type-safe context"
  - "Support both 'id' and 'projectId' param names for flexibility"
  - "withProject option fetches and validates ownership in one step"

patterns-established:
  - "export const METHOD = withProjectAuth(handler, options) pattern"
  - "Destructure only needed context fields: { team, projectId, project }"

# Metrics
duration: 12min
completed: 2026-02-01
---

# Phase 15 Plan 03: API Auth Middleware Refactoring Summary

**Reusable withProjectAuth HOF that eliminates ~35% of auth boilerplate from 5 proof-of-concept routes, providing pattern for remaining 17 routes**

## Performance

- **Duration:** 12 min
- **Started:** 2026-02-01T06:30:00Z
- **Completed:** 2026-02-01T06:42:00Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Created `withProjectAuth` middleware with type-safe overloads
- Refactored 5 routes as proof of concept (11 handlers total)
- Eliminated 439 lines of duplicated auth/validation code (35% reduction)
- Established pattern for remaining 17 routes (future work)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create withProjectAuth Middleware** - `22f5671` (feat)
2. **Task 2: Refactor 5 Routes** - `a151ff1` (refactor)

## Files Created/Modified

- `lib/api/with-project-auth.ts` - New middleware with AuthContext types, function overloads, and error handling (194 lines)
- `app/api/projects/[id]/route.ts` - Refactored GET/PUT/DELETE handlers (261 -> 127 lines, -51%)
- `app/api/projects/[id]/validate/route.ts` - Refactored GET/POST handlers (196 -> 116 lines, -41%)
- `app/api/projects/[id]/stories/route.ts` - Refactored GET/POST handlers (291 -> 207 lines, -29%)
- `app/api/projects/[id]/tech-stack/route.ts` - Refactored GET/POST handlers (211 -> 140 lines, -34%)
- `app/api/projects/[id]/api-spec/route.ts` - Refactored GET/POST handlers (307 -> 237 lines, -23%)

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Function overloads for type safety | `{ withProject: true }` returns `AuthContextWithProject`, without returns `AuthContext` |
| Support both `id` and `projectId` params | Different routes use different param names |
| Handlers receive context object, not params | Cleaner API, avoids re-parsing params |
| Error handling in middleware | Consistent 401/404/400/500 responses across all routes |

## Deviations from Plan

None - plan executed exactly as written.

## Line Count Analysis

| Route | Before | After | Reduction |
|-------|--------|-------|-----------|
| `[id]/route.ts` | 261 | 127 | -134 (51%) |
| `validate/route.ts` | 196 | 116 | -80 (41%) |
| `stories/route.ts` | 291 | 207 | -84 (29%) |
| `tech-stack/route.ts` | 211 | 140 | -71 (34%) |
| `api-spec/route.ts` | 307 | 237 | -70 (23%) |
| **Total** | **1,266** | **827** | **-439 (35%)** |

## Issues Encountered

None - TypeScript compilation and tests passed (pre-existing test failures unrelated to this work).

## User Setup Required

None - no external service configuration required.

## Pattern for Future Route Migrations

```typescript
// Before (80+ lines per handler)
export async function GET(req, { params }) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const team = await getTeamForUser();
    if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 });

    const { id } = await params;
    const projectId = parseInt(id, 10);
    if (isNaN(projectId)) return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });

    // Business logic...
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// After (~30 lines per handler)
export const GET = withProjectAuth(
  async (req, { team, projectId }) => {
    // Business logic only
  }
);

// With project fetch
export const PUT = withProjectAuth(
  async (req, { team, projectId, project }) => {
    // Business logic with project already validated
  },
  { withProject: true }
);
```

## Next Phase Readiness

- Middleware pattern proven on 5 routes
- 17 remaining routes can be migrated in future cleanup work
- Pattern documented for easy adoption

---
*Phase: 15-code-cleanup*
*Completed: 2026-02-01*
