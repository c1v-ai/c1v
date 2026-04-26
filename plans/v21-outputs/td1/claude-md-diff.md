# Proposed Diff: `apps/product-helper/CLAUDE.md`

Per the project file-safety rule and v2.1 handoff §Group A, this is a
**proposed** diff for David's authorization. The agent did NOT modify
`apps/product-helper/CLAUDE.md` directly. Apply with `git apply` after
review, or paste the new entry by hand.

## Context

TD1 (v2.1 Wave D, tag `td1-wave-d-complete` @ `bb1f443`) shipped the
two-stage api-spec extraction pattern. The "Deployed Features" section of
`apps/product-helper/CLAUDE.md` should record this so future Claude
instances see it on `/clear`.

## Diff

```diff
--- a/apps/product-helper/CLAUDE.md
+++ b/apps/product-helper/CLAUDE.md
@@ -<line> +<line> @@ ## Deployed Features

 - **Artifact Pipeline component** — `components/project/overview/artifact-pipeline.tsx`. v2 plan extends this to read `artifacts.manifest.jsonl` download links (manifest-read only).
+- **iter-3 API-Spec Two-Stage** (v2.1 Wave D) — Stage-1 flat operation emit + Stage-2 deterministic CRUD expansion; feature flag `API_SPEC_TWO_STAGE`; regression-pinned to project=33 fixture. See `plans/v21-outputs/td1/`.
```

## Human-readable

Append to the `## Deployed Features` section, immediately after the
`Artifact Pipeline component` bullet:

> - **iter-3 API-Spec Two-Stage** (v2.1 Wave D) — Stage-1 flat operation
>   emit + Stage-2 deterministic CRUD expansion; feature flag
>   `API_SPEC_TWO_STAGE`; regression-pinned to project=33 fixture. See
>   `plans/v21-outputs/td1/`.

## Authorization tracking

- [ ] David authorizes the diff
- [ ] Diff applied to `apps/product-helper/CLAUDE.md`
- [ ] Commit recorded with message: `docs(td1): record two-stage api-spec in CLAUDE.md deployed-features`

## Why a diff surface, not a direct edit

- Global file-safety rule (`~/.claude/CLAUDE.md`): NEVER move/rename/delete
  without explicit user permission; CLAUDE.md is project-canonical.
- v2.1 handoff §Group A: documentation surfaces that touch CLAUDE.md
  require David's explicit authorization to avoid stomping on parallel
  peer edits.
