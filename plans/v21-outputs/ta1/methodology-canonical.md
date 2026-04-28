# METHODOLOGY-CORRECTION canonical resolution (EC-V21-A.0)

**Original lock:** 2026-04-25 by Bond / TA1.migrations-and-agent-audit
**Lock revoked:** 2026-04-26 — original audit was based on hallucinated disk facts
**Canonical home (current):** `system-design/kb-upgrade-v2/METHODOLOGY-CORRECTION.md`

## Why the original lock was revoked

The 2026-04-25 audit asserted three facts about disk state that turned out to be false:

| Original claim | Disk reality (2026-04-26) |
|---|---|
| `.claude/plans/kb-upgrade-v2/METHODOLOGY-CORRECTION.md` exists at 34126 bytes | File does not exist |
| `plans/kb-upgrade-v2/METHODOLOGY-CORRECTION.md` exists at 34126 bytes | File does not exist |
| Both copies were byte-identical and one was converted to a redirect stub | Neither file exists; no stub conversion happened |
| `system-design/METHODOLOGY-CORRECTION.md` does NOT exist | Correct in spirit, but the actual file lives at `system-design/kb-upgrade-v2/METHODOLOGY-CORRECTION.md` (a path the audit didn't consider) |
| Both `plans/` trees carry the FULL module 1-8 set | Both `plans/kb-upgrade-v2/` and `.claude/plans/kb-upgrade-v2/` carry only modules 1, 2, 3, 4, 6 (5 of 8). `system-design/kb-upgrade-v2/` is the only tree with all 8 modules + DIAGRAMS-INDEX + MODULE-DATA-FLOW |

A lock built on hallucinated facts is not a real decision. The 2026-04-26 reconciliation walks it back.

## Disk verification (2026-04-26)

| Path | Status |
|------|--------|
| `system-design/kb-upgrade-v2/METHODOLOGY-CORRECTION.md` | ✅ exists (full content, 34KB), only copy on disk |
| `system-design/kb-upgrade-v2/` | ✅ all 8 module subdirs + DIAGRAMS-INDEX + MODULE-DATA-FLOW |
| `plans/kb-upgrade-v2/METHODOLOGY-CORRECTION.md` | ❌ does not exist |
| `plans/kb-upgrade-v2/` | ⚠️ partial (5 of 8 modules: 1, 2, 3, 4, 6) |
| `.claude/plans/kb-upgrade-v2/METHODOLOGY-CORRECTION.md` | ❌ does not exist |
| `.claude/plans/kb-upgrade-v2/` | ⚠️ partial (5 of 8 modules: 1, 2, 3, 4, 6) |

## New canonical decision

`system-design/kb-upgrade-v2/METHODOLOGY-CORRECTION.md` is the canonical methodology document.

Rationale (replacing the original lock's rationale):
1. **Only intact copy on disk.** No file movement required, no risk of stale duplicates.
2. **Co-located with the only complete module-1-8 tree.** Methodology and the artifacts it describes live together.
3. **Semantic fit.** Methodology belongs under `system-design/`, not under `plans/` (which is for tactical roadmaps and ops docs).

## Follow-ups

- The partial `plans/kb-upgrade-v2/` and `.claude/plans/kb-upgrade-v2/` trees (5 of 8 modules each) are stranded duplicates. Cleanup deferred to v2.2 — see `plans/post-v2.1-followups.md`.
- All forward-looking refs in plan docs rewritten from `plans/kb-upgrade-v2/METHODOLOGY-CORRECTION.md` → `system-design/kb-upgrade-v2/METHODOLOGY-CORRECTION.md` in the same commit that revoked this lock.
- Historical/critique/handoff docs left untouched — they document past mistakes and should remain as-written.
