# METHODOLOGY-CORRECTION canonical resolution (EC-V21-A.0)

**Date:** 2026-04-25
**Locked by:** Bond / TA1.migrations-and-agent-audit

## Disk verification (2026-04-25)

| Path | Size | mtime | Status |
|------|------|-------|--------|
| `.claude/plans/kb-upgrade-v2/METHODOLOGY-CORRECTION.md` | 34126 | 2026-04-24 13:35 | DUPLICATE (now redirect stub) |
| `plans/kb-upgrade-v2/METHODOLOGY-CORRECTION.md`         | 34126 | 2026-04-24 13:35 | **CANONICAL** |
| `system-design/METHODOLOGY-CORRECTION.md`               | —     | —                | DOES NOT EXIST |

`diff` of the two on-disk files returns zero output → byte-identical.

Both `.claude/plans/kb-upgrade-v2/` and `plans/kb-upgrade-v2/` carry the FULL module 1-8 set per disk verification — they are byte-identical, NOT a missing-modules issue.

## Decision

Canonical home: **`plans/kb-upgrade-v2/METHODOLOGY-CORRECTION.md`**

Rationale:
1. `plans/` is the non-`.claude` working tree, intended for cross-Claude visibility (Obsidian-rendered, multi-peer-shared).
2. CLAUDE.md path-claim rows reference this tree for downstream consumers.
3. The `.claude/plans/` mirror is treated as a sandboxed artifact tree for spawn-prompt drafts; it should not be the source of truth.

## Action taken

- `.claude/plans/kb-upgrade-v2/METHODOLOGY-CORRECTION.md` overwritten with a one-line redirect stub pointing to the canonical path.
- Original file content fully preserved at `plans/kb-upgrade-v2/METHODOLOGY-CORRECTION.md`.

## Stale-cite guard

`system-design/METHODOLOGY-CORRECTION.md` does NOT exist on disk. Any CLAUDE.md or plan rows citing that path are stale and must be rewritten to `plans/kb-upgrade-v2/`. Surfaced to TA1 docs agent (P10).
