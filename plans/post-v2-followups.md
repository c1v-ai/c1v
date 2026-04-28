# Post-v2 Follow-ups (Backlog)

Originally captured during T6 Wave 4 close. Updated 2026-04-26 at v2.1 SHIP.

---

## Closed by v2.1 (2026-04-26)

The following follow-ups from the v2.1 master plan §Problem section (P1-P10) shipped as part of Waves A + B + D. See [`v21-outputs/release/v2.1-shipped.md`](v21-outputs/release/v2.1-shipped.md) for per-EC commit SHAs.

- ✅ **P1** Synthesis output is invisible — closed by TA2 `RecommendationViewer` + nav entry (`ta2-wave-a-complete` `1da5ac0`).
- ✅ **P2** FMEA route orphaned — closed by TA2 nav entry + `project_artifacts` read (`30def2f` rolled into `ta2-wave-a-complete`).
- ✅ **P3** Interfaces page sub-sections degraded — closed by TA2 N2 sub-tab + sequence disclosure (`e0a2d62`) + Architecture+Database section merge (`efcd425` / `e500a88` / `a8ba785`).
- ✅ **P4** Diagrams page disconnected — closed by TA2 inline-Tech-Stack relocation (rolled into `1da5ac0`).
- ✅ **P5** Open Questions never surface — closed by TA1 `system-question-bridge` + M2/M6/M8 emitter hooks (`86712ad`) + TA2 archive viewer (`1f82ea4`).
- ✅ **P6** PPTX + XLSX downloads missing — closed by TA3 sidecar `/run-render` + TA2 download dropdown (`ta3-wave-a-complete` `e2d58b2` + rolled into `1da5ac0`).
- ✅ **P8** iter-3 API-spec regression unfixed — closed by TD1 two-stage refactor (`td1-wave-d-complete` `bb1f443`); 83% output-token / 75% cost reduction.
- ✅ **P10** Stale CLAUDE.md path claim — closed by TA1 P10 stale-path corrections (`590cd5b` / `cd21be1` / `15ee155`).

---

## Deferred to v2.2

- 📦 **P7** Crawley typed schemas (10) + matrix not delivered — preserved in [`c1v-MIT-Crawley-Cornell.v2.1.md`](c1v-MIT-Crawley-Cornell.v2.1.md) as `📦 DEFERRED TO v2.2` Wave C content. Forward-pointer: [`c1v-MIT-Crawley-Cornell.v2.2.md`](c1v-MIT-Crawley-Cornell.v2.2.md).
- 📦 **P9** Methodology drift between docs and on-disk module numbering — preserved as Wave C deliverable for v2.2. Source: [`system-design/kb-upgrade-v2/METHODOLOGY-CORRECTION.md`](../system-design/kb-upgrade-v2/METHODOLOGY-CORRECTION.md). (Path corrected 2026-04-26 — original `.claude/plans/kb-upgrade-v2/` ref was stale; that copy was never on disk. See `plans/v21-outputs/ta1/methodology-canonical.md`.)

---

## New follow-ups discovered during v2.1

### `synthesis-agent` narrative-payload caveat

**Surfaced by:** TA1 GENERATE_* node wiring + TB1 cache integration.

**Issue:** The synthesizer's narrative payload is the only artifact that does not survive a cache hit byte-for-byte across tenants — a cache hit copies the storage_path but the requesting tenant's `project_id` is stamped into the row metadata. This is correct (RLS surfacing stays tenant-scoped) but means narrative diff'ing across re-runs needs to ignore the project_id field.

**Recommended phase:** Documented in `lib/cache/synthesis-cache.ts` JSDoc; no code change needed. Carry to v2.2 if a "narrative diff" feature is requested.

### GENERATE_* nodes read upstream from `project_artifacts`

**Surfaced by:** TA1 wiring (`a7f0bc7` / `4d5aced`).

**Issue:** Downstream GENERATE_* nodes now read upstream module outputs from the `project_artifacts` ledger rather than the project-row JSONB blob. The JSONB-blob path is still wired for some sections (FMEA viewer reads `extractedData.fmeaEarly` per the original v2 contract). v2.2 cleanup item: pick one storage path or formally document the dual-source rule.

**Recommended phase:** v2.2 Wave-E pre-work (KB runtime architecture rewrite touches the same surface).

### Atlas re-ingest — duplication cleanup

**Surfaced by:** TA1 EC-V21-A.0 atlas re-ingest unblock (`4c8504d` / `5d7bf05`). Final count: `kb_chunks = 424` (PASS not SKIP).

**Issue:** Some atlas chunks may carry per-source duplication that was masked by the prior dedup-on-insert behavior. Now that re-ingest runs cleanly, a sweep to identify and remove duplicate chunks (keyed on canonical text + source) is worth a small follow-up.

**Recommended phase:** v2.2 Wave-E (pgvector consolidation makes this trivial).

### `ingest-kbs` counter bug

**Surfaced by:** TA1 atlas re-ingest run.

**Issue:** The `scripts/ingest-kbs.ts` counter logged a per-batch sum that didn't match the row delta from `SELECT COUNT(*)` post-run. Off-by-one or per-shard-not-aggregated. Cosmetic — the actual ingest is correct — but the operator log is misleading.

**Recommended phase:** v2.2 Wave-E (touched anyway during pgvector migration).

### Secondary 0004 / 0007 migration collisions

**Surfaced by:** TA1 EC-V21-A.0 preflight while reconciling 0011 collision (`b1ac561`).

**Issue:** Two more migration-number collisions exist at 0004 and 0007 (similar pattern to 0011). They have not yet caused observable production drift because drizzle-kit happens to apply them in the order that satisfies their actual dependencies — but the same nondeterminism that bit 0011 could bite these.

**Recommended phase:** v2.2 day 0 — reconcile by renaming to `0004a/b` + `0007a/b` per the 0011 pattern. Cheap, defensive.

---

## Carried-over from v2

### RLS hardening — `projects` table

**Surfaced by:** `drizzle-runstate` agent (T6 Wave 4, commit `3691617`) while shipping `0013_project_run_state.sql`.

**Issue:** The `projects` table has `ENABLE ROW LEVEL SECURITY` set but ships zero tenant policies. Any new RLS policy on a downstream table (like `project_run_state` or v2.1's `project_artifacts`) that uses `EXISTS (SELECT 1 FROM projects WHERE ...)` as its tenant gate cannot fire from non-owner Postgres roles in production — the EXISTS subquery returns 0 rows because `projects` itself has no policy granting visibility.

**Current production posture:** Not actively bleeding. prd.c1v.ai gates routes via Clerk auth middleware (first line). RLS is defense-in-depth, not the only barrier. Pre-dates T6 by months — not a T6 regression. v2.1 TA1's `project_artifacts` policies ride the same EXISTS-gate pattern and inherit the same posture.

**Why deferred from T6 + v2.1:** Scope discipline. Folding security hardening into the synthesizer commit (the portfolio keystone artifact) would conflate concerns. Belongs in a dedicated security pass.

**Recommended phase:** P3 (smoke/validation on prd.c1v.ai) in the post-v2 roadmap, alongside the corrected UI-audit pass. Strong candidate for v2.2 day 0.

**Scope when it lands:**
- Add tenant SELECT policy on `projects` itself (team_id match against `app.current_team_id` setting).
- Audit every other table with RLS-enabled-but-no-policies (run `SELECT tablename FROM pg_tables t WHERE rowsecurity AND NOT EXISTS (SELECT 1 FROM pg_policies p WHERE p.tablename = t.tablename)`).
- Decide on `FORCE ROW LEVEL SECURITY` posture project-wide (currently mixed; `project_run_state` and `project_artifacts` followed prevailing non-FORCE convention).
