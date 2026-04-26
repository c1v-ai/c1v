# CLAUDE.md path-claim fix (P10) — proposed diff

**EC-V21-A.0 item #5.** Spec says edit `apps/product-helper/CLAUDE.md` row `system-design/kb-upgrade-v2/module-{1..7}/` → `plans/kb-upgrade-v2/module-{1..8}/`.

## Disk verification

| File | Has stale row? |
|------|----------------|
| `apps/product-helper/CLAUDE.md`   | NO — file does not contain `kb-upgrade-v2` at all. |
| **`/Users/davidancor/Projects/c1v/CLAUDE.md` (root)** | **YES — L550.** |

The stale row lives in **root CLAUDE.md**, not `apps/product-helper/CLAUDE.md`. Surfacing for David authorization before applying.

## Proposed diff (root CLAUDE.md L550)

```diff
- - **L2 v2 artifacts** — `system-design/kb-upgrade-v2/module-{1..7}/` — JSON + xlsx + pptx + mmd OUTPUT of running L1 on c1v-itself (self-application).
+ - **L2 v2 artifacts** — `plans/kb-upgrade-v2/module-{1..8}/` — JSON + xlsx + pptx + mmd OUTPUT of running L1 on c1v-itself (self-application).
```

Two changes:
1. `system-design/kb-upgrade-v2/` → `plans/kb-upgrade-v2/` (per methodology-canonical.md decision; `system-design/` path does not exist).
2. `module-{1..7}` → `module-{1..8}` (per disk: M8 ships in both `.claude/plans/kb-upgrade-v2/` and `plans/kb-upgrade-v2/`).

## Authorization status

- **Pending David authorization.** Per spec: "Requires David authorization — surface diff first, SendMessage Bond before applying."
- **Action:** SendMessage Bond with this diff path. Bond escalates to David. On approve, TA1 applies the edit in a follow-up commit before tagging `ta1-preflight-complete`. On hold, TA1 documents the unauthorized state and proceeds with tag (path-claim row remains stale; downstream surfaces in EC-V21-A.7 verifier).
