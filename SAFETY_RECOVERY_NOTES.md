# Safety Recovery Notes

Generated from read-only Git inspection on 2026-04-30.

Timezone: America/Toronto / EDT (-0400).

## Current Safety Status

- `wave-b/v2.1.1-hotfix` was pushed to GitHub and is synced with `origin/wave-b/v2.1.1-hotfix`.
- `wave-e/te1-integration` was pushed to GitHub and is synced with `origin/wave-e/te1-integration`.
- The six local stashes still exist.
- The six stashes were also preserved on GitHub as remote tags named `stash-backup-*`.
- The stash backup tags preserve the exact stash commits, but they are not merged into `main`.

## Do Not Run

Do not run these until every stash has been converted, inspected, committed, and merged safely:

```bash
git stash pop
git stash drop
git stash clear
git reset --hard
```

## Stash Timeline

1. `stash@{5}` / `stash-backup-5-ta1-docs-wip`
   - Created: `2026-04-25 22:33:38 -0400`
   - Base branch in message: `wave-a/ta1-docs`
   - Message: `WIP on wave-a/ta1-docs: 5d7bf05 fix(ta1): EC-V21-A.0 preflight - audit + atlas-path doc + methodology canonical`
   - Warning: huge and risky. `133 files changed`, many deletions. Inspect carefully before merging.

2. `stash@{4}` / `stash-backup-4-hotfix-rosetta-rebase`
   - Created: `2026-04-27 17:53:02 -0400`
   - Base branch in message: `wave-b/v2.1.1-hotfix`
   - Message: `rosetta-during-wave-c-rebase`
   - Diff summary: `plans/methodology-rosetta.md`, `109 insertions`, `24 deletions`

3. `stash@{3}` / `stash-backup-3-te1-engine-pgvector-wip`
   - Created: `2026-04-27 23:17:17 -0400`
   - Base branch in message: `wave-e/te1-engine-context`
   - Message: `te1-engine-pgvector: prior agent WIP`
   - Diff summary: `apps/product-helper/lib/langchain/engines/__tests__/context-resolver.test.ts`, `173 insertions`

4. `stash@{2}` / `stash-backup-2-engine-stories-surface-gap`
   - Created: `2026-04-27 23:18:00 -0400`
   - Base branch in message: `wave-e/te1-engine-context`
   - Message: `engine-stories: peer surface-gap.ts WIP set aside`
   - Diff summary: `apps/product-helper/lib/langchain/engines/surface-gap.ts`, `69 insertions`

5. `stash@{1}` / `stash-backup-1-engine-stories-peer-file-mods`
   - Created: `2026-04-27 23:27:09 -0400`
   - Base branch in message: `wave-e/te1-engine-stories`
   - Message: `engine-stories: peer file mods stashed during branch switch`
   - Diff summary:
     - `apps/product-helper/components/synthesis/section-rationale.tsx`
     - `apps/product-helper/lib/langchain/engines/__tests__/context-resolver.test.ts`
     - `189 insertions`, `1 deletion`

6. `stash@{0}` / `stash-backup-0-engine-stories-peer-kb`
   - Created: `2026-04-27 23:30:36 -0400`
   - Base branch in message: `wave-e/te1-engine-context`
   - Message: `engine-stories: peer KB-deepened mods + extra engines`
   - Diff summary: `8 files changed`, `609 insertions`

## Related Branch Timeline

### `wave-a/ta1-docs`

- Branch created: `2026-04-25 22:29:59 -0400`
- Last branch commit: `2026-04-25 22:30:51 -0400`
- Related stash: `stash@{5}` created `2026-04-25 22:33:38 -0400`
- Interpretation: stash `5` came after the `ta1-docs` branch commit.

### `wave-b/v2.1.1-hotfix`

- Branch created: `2026-04-26 19:35:22 -0400`
- Last branch commit: `2026-04-27 17:52:04 -0400`
- Related stash: `stash@{4}` created `2026-04-27 17:53:02 -0400`
- Interpretation: stash `4` came 58 seconds after the last hotfix commit.

### `wave-e/te1-integration`

- Branch created: `2026-04-27 22:11:58 -0400`
- Key commits ran through: `2026-04-27 22:59:03 -0400`
- Later final branch commits:
  - `2026-04-28 08:52:46 -0400`
  - `2026-04-28 10:00:19 -0400`

### `wave-e/te1-engine-stories`

- Branch created: `2026-04-27 23:18:05 -0400`
- Last branch commit: `2026-04-27 23:34:26 -0400`

## Recommended Merge / Recovery Order

Chronological order:

1. `stash@{5}` / `stash-backup-5-ta1-docs-wip`
2. `stash@{4}` / `stash-backup-4-hotfix-rosetta-rebase`
3. `stash@{3}` / `stash-backup-3-te1-engine-pgvector-wip`
4. `stash@{2}` / `stash-backup-2-engine-stories-surface-gap`
5. `stash@{1}` / `stash-backup-1-engine-stories-peer-file-mods`
6. `stash@{0}` / `stash-backup-0-engine-stories-peer-kb`

Operationally safer order:

1. Preserve and inspect `stash@{5}` first because it is oldest and largest, but do not merge blindly.
2. Merge small, localized stashes only after confirming their target branch and conflict risk.
3. Convert each stash into its own branch, commit it there, push that branch, and review before merging.

## Recovery Anchors On GitHub

These exact refs were verified on `origin`:

```text
dc79df8e6713c7b3f1cb017167e9820784685fa7 refs/tags/stash-backup-0-engine-stories-peer-kb
15726dea5a6681a05b924d9c2e0dd388394c741f refs/tags/stash-backup-1-engine-stories-peer-file-mods
62fafe45e26b73f8a648f28ea17b0c4e86cb5f57 refs/tags/stash-backup-2-engine-stories-surface-gap
13dc2d4e4c67455ebba85d3d4a0a213bf68f0307 refs/tags/stash-backup-3-te1-engine-pgvector-wip
8a374b262a5532320ae234c377e4b1b75e19bd8d refs/tags/stash-backup-4-hotfix-rosetta-rebase
b422f6a1ccbe21ac41c8d3c13974e6729f0aff35 refs/tags/stash-backup-5-ta1-docs-wip
```
