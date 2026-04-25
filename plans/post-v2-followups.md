# Post-v2 Follow-ups (Backlog)

Captured during T6 Wave 4 close. None of these block T6 or v2 release notes.

## RLS hardening — `projects` table

**Surfaced by:** `drizzle-runstate` agent (T6 Wave 4, commit `3691617`) while shipping `0013_project_run_state.sql`.

**Issue:** The `projects` table has `ENABLE ROW LEVEL SECURITY` set but ships zero tenant policies. Any new RLS policy on a downstream table (like `project_run_state`) that uses `EXISTS (SELECT 1 FROM projects WHERE ...)` as its tenant gate cannot fire from non-owner Postgres roles in production — the EXISTS subquery returns 0 rows because `projects` itself has no policy granting visibility.

**Current production posture:** Not actively bleeding. prd.c1v.ai gates routes via Clerk auth middleware (first line). RLS is defense-in-depth, not the only barrier. Pre-dates T6 by months — not a T6 regression.

**Why deferred from T6:** Scope discipline. Folding security hardening into the synthesizer commit (the portfolio keystone artifact) would conflate concerns. Belongs in a dedicated security pass.

**Recommended phase:** P3 (smoke/validation on prd.c1v.ai) in the post-v2 roadmap, alongside the corrected UI-audit pass.

**Scope when it lands:**
- Add tenant SELECT policy on `projects` itself (team_id match against `app.current_team_id` setting).
- Audit every other table with RLS-enabled-but-no-policies (run `SELECT tablename FROM pg_tables t WHERE rowsecurity AND NOT EXISTS (SELECT 1 FROM pg_policies p WHERE p.tablename = t.tablename)`).
- Decide on `FORCE ROW LEVEL SECURITY` posture project-wide (currently mixed; `project_run_state` followed prevailing non-FORCE convention).
