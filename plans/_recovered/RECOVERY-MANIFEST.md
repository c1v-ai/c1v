# Recovery Manifest — Lost Untracked Files

Generated: 2026-04-26
Trigger: Investigation of missing `plans/kb-runtime-architecture.md` revealed
systemic loss of untracked files in working tree.

## Root Cause

All lost files were created via the `Write` tool but **never `git add`-ed**.
Working tree got nuked at some point (worktree removal, `git clean`, branch
churn, or peer-session cleanup) — anything untracked vanished silently.

The 27 references to `plans/kb-runtime-architecture.md` in code + docs all
broke at once, but nobody noticed because nobody ran `git log -- <path>` to
check the file was actually committed.

## Files Recovered (14)

All recovered from Claude Code session transcripts at
`~/.claude/projects/-Users-davidancor-Projects-c1v/*.jsonl`.

| Original Path | Bytes | Source | Recovered To |
|---|---:|---|---|
| `plans/kb-runtime-architecture.md` | 17,175 | Read | `kb-runtime-architecture/v2-stable-read.md` (already restored to canonical location) |
| `plans/reorg-mapping.md` | 20,822 | Read | `reorg-mapping/v-stable.md` |
| `.claude/plans/v2-runtime-wiring-ideation.md` | 26,754 | Write | `v2-runtime-wiring-ideation/v-stable.md` |
| `.claude/plans/crawley-sys-arch-strat-prod-dev/REQUIREMENTS-crawley.md` | 21,512 | Read | `REQUIREMENTS-crawley/v-stable.md` |
| `plans/product-helper-speed-and-kb-overhaul.md` | 51,112 | Read | `product-helper-speed-and-kb-overhaul/v-stable.md` |
| `plans/pipeline-b-steps36-integration.md` | 24,838 | Read | `pipeline-b-steps36-integration/v-stable.md` |
| `plans/pipeline-b-steps36-integration.critique.md` | 16,660 | Read | `pipeline-b-steps36-integration.critique/v-stable.md` |
| `plans/v21-outputs/td1/verification-report.md` | 4,732 | Write | `td1-verification-report/v-stable.md` |
| `plans/HANDOFF-c1v-MIT-Crawley-Cornell.md` | 24,371 | Read | `HANDOFF-c1v-MIT-Crawley-Cornell/v-stable.md` |
| `system-design/system-design-math-logic.md` | 20,056 | Read | `system-design-math-logic/v-stable.md` |
| `.claude/plans/schema-drift-visualization.md` | 37,185 | Read | `schema-drift-visualization/v-stable.md` |
| `.claude/plans/schema-drift-visualization.critique.md` | 23,047 | Write | `schema-drift-visualization.critique/v-stable.md` |
| `plans/m2-folder-2-schema-az-sweep/01-phase-inventory.md` | 27,902 | Read | `m2-phase-inventory/v-stable.md` |
| `plans/public-company-stacks-atlas.md` | 34,729 | Write | `public-company-stacks-atlas/v-stable.md` |
| `plans/team-spawn-prompts.md` | 33,953 | Read | `team-spawn-prompts/v-stable.md` |

## Second-Pass Recoveries (Subagent Transcripts)

The 5 files initially marked "NOT RECOVERABLE" were actually written by
**spawned subagents** (Task tool), whose transcripts live in `agent-*.jsonl`
files separate from main session files. Re-scan caught 4 of 5:

| Path | Bytes | Source | Subagent Session |
|---|---:|---|---|
| `plans/v21-outputs/ta3/manifest-contract.md` | 6,478 | Write | `agent-a32ea1ba9b3832` |
| `plans/v21-outputs/ta1/handshake-spec.md` | 9,197 | Write | `agent-a6e644260bd476` |
| `plans/research/zod-frontend-survey.md` | 11,992 | Write | `agent-aaffea4c4dabe5` |
| `plans/research/math-sources.md` | 19,001 | Read | `agent-a6110ee49615fe` |

## Aspirational (Never Written)

- `plans/wave-e-day-0-inventory.md` — referenced as the *output* of
  EC-V21-E.0 in `c1v-MIT-Crawley-Cornell.v2.1.md:432`. Phrase
  "Output: `plans/wave-e-day-0-inventory.md`" appears in 6 sessions, but
  no Read/Write trace anywhere — task hasn't run yet.

## Wrong-Path Issues (file exists, just at a different location)

Not lost — references just point at the wrong path:

- `plans/kb-upgrade-v2/METHODOLOGY-CORRECTION.md` (referenced 12×)
  → real file at `system-design/kb-upgrade-v2/METHODOLOGY-CORRECTION.md` (34KB ✅)
- `.claude/plans/kb-upgrade-v2/METHODOLOGY-CORRECTION.md` (referenced 16× via symlink)
  → same as above (this path resolves through `.claude/plans → ../plans`, but `plans/kb-upgrade-v2/` doesn't exist)
- `plans/system-design-math-logic.md` → was actually written to `system-design/system-design-math-logic.md` (also gone, but recovered)

## Future / Aspirational (not lost)

- `plans/c1v-MIT-Crawley-Cornell.v2.2.md` — referenced as "next plan version"; not yet written
- `plans/HANDOFF-*.md` and `plans/SNAPSHOT-*.md` — glob patterns, not specific files
- `plans/t<N>-outputs/verification-report.md` — placeholder pattern
- `plans/v21-outputs/<team>/claude-md-diff.md` — placeholder pattern

## Restore Instructions

Most files should be restored to their original path AND `git add`-ed
this time. For files referenced by code (not just plans), this is urgent.

```bash
# Example — restore one file and stage it
cp plans/_recovered/reorg-mapping/v-stable.md plans/reorg-mapping.md
git add plans/reorg-mapping.md
```

## Hardening Recommendation

The 27-references-to-uncommitted-file pattern will recur unless:

1. CI gate that lints all markdown links + code path-citations against
   the actual filesystem (catches "27 refs but file doesn't exist")
2. Convention: any plan referenced by ≥2 other artifacts must be tracked
3. Pre-commit hook checking `git status` for untracked files in `plans/`
   before any peer agent destructive op
