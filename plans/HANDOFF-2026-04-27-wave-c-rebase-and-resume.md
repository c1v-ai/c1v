# HANDOFF — Wave-C TC1 rebase + resume

> **Date:** 2026-04-27 17:35 EDT
> **Author:** Bond
> **Status:** READY — peer Claude (or fresh session) executes the sequence below
> **Trigger:** TC1 dispatched before v2.1.1 hotfix shipped; `wave-c/tc1-m345-schemas` is rooted from a pre-v2.1.1 base. v2.1.1 is now shipped (`v2.1.1-hotfix-complete` @ `102fce3`, today 2026-04-27). Rebase + resume.

---

## TL;DR

**8 of 11 Crawley schemas are already on `wave-c/tc1-m345-schemas`** (`git ls-tree` audit, 2026-04-27 17:46 EDT — corrected from earlier `git log ^main` audit which missed three commits). The matrix keystone `_matrix.ts` is already shipped — EC-V21-C.2 is materially de-risked. Branch HEAD does NOT have `v2.1.1-hotfix-complete` in ancestry. Rebase **onto `wave-b/v2.1.1-hotfix` branch HEAD** (zero-conflict, disjoint surface), re-anchor TC1 tags, then resume `crawley-schemas` for the **3 remaining schemas + 11-schema round-trip test backfill + registry + matrix-site refactor**. Re-dispatch the other 3 deliverable agents (`crawley-migrations`, `eval-harness`, `methodology-page`) in parallel — none have HARD-DEP on the schemas commit graph.

**Rebase target rationale:** Local `main` is stale (`a3bc645`, pre-v2.1.1). `origin/main @ db7b12e` does NOT contain `v2.1.1-hotfix-complete @ 102fce3`. The hotfix lives only on `wave-b/v2.1.1-hotfix` and has 4 commits past the tag (rosetta + closeout + dead-link fix + this handoff). Rebasing onto the **branch HEAD** brings those forward commits into Wave-C ancestry too, and when `wave-b/v2.1.1-hotfix` later merges to main, Wave-C will fast-forward cleanly. **DO NOT** bundle a `wave-b/v2.1.1-hotfix → main` merge into this rebase — that's a separate destructive op needing explicit sign-off.

**Diagnostic flag:** No round-trip test commits found for any of the 8 shipped schemas. REQUIREMENTS-crawley §7 makes them non-negotiable. Backfill (8) + new (3) = 11 round-trip + x-ui-surface test files needed in the `crawley-schemas` resume.

---

## Current state (verified 2026-04-27 17:35 EDT)

| Fact | Value |
|---|---|
| `wave-c/tc1-m345-schemas` HEAD | `080329e feat(crawley-tc1): m4 decision-network-foundations schema (Crawley Ch 14)` |
| Merge-base with main | `a3bc645 chore(td1): preflight harness + fixture replay log` (pre-v2.1.1) |
| `v2.1.1-hotfix-complete` SHA | `102fce3` (NOT in Wave-C ancestry) |
| `tc1-preflight-complete` reachable from main | NO |
| `tc1-c0-complete` SHA | `3e2abdf refactor(schemas): rewrite module-5-form-function -> module-5 importers + jsdoc + fixture (EC-V21-C.0)` |

**8 schema commits reachable from `wave-c/tc1-m345-schemas` HEAD** (per `git ls-tree`, file-presence audit):

Direct-ancestor 5 commits ahead of `main`:
1. `080329e` m4 decision-network-foundations (Crawley Ch 14)
2. `e2180c2` m3 decomposition-plane supplement (Crawley Ch 13)
3. `e7511ce` m5 phase-5-concept-expansion (Crawley Ch 8)
4. `aa4e6f2` m5 phase-4-solution-neutral-concept (Crawley Ch 7)
5. `44fd62d` m5 phase-3-form-function-concept (Crawley Ch 6)

Cross-path 3 commits via `wave-b/v2.1.1-hotfix` ancestry (initially missed by `^main` filter):
6. `a868930` module-5 _matrix.ts — `mathDerivationMatrixSchema` (Option Y) — **EC-V21-C.2 keystone**
7. `2906454` m5 phase-1-form-taxonomy
8. `56d0322` m5 phase-2-function-taxonomy

**Plus namespace-resolver commits (already in branch ancestry):**
- `3e2abdf` refactor(schemas): rewrite module-5-form-function -> module-5 importers + jsdoc + fixture (EC-V21-C.0)
- `6be88b5` refactor(schemas): git mv module-5-form-function/ -> module-5/ (EC-V21-C.0)

**Remaining 3 schemas to author:** `module-4/tradespace-pareto-sensitivity.ts`, `module-4/optimization-patterns.ts`, `module-2/requirements-crawley-extension.ts`.

**Round-trip test gap (verified):** zero `*.test.ts` siblings for any of the 8 shipped schemas. Backfill (8) + new (3) = **11 test files** owed by `crawley-schemas` resume per REQUIREMENTS-crawley §7.

---

## Step 0 — Pre-rebase safety

```bash
# Verify your working tree is clean for TC1 surfaces (unrelated dirty files OK to leave):
git status --short
# Expected unrelated-but-OK: plans/methodology-rosetta.md (M) + .obsidian/ + marketing-icp-review-* + plans/_recovered/
# NOT OK if any apps/product-helper/lib/langchain/schemas/** files are dirty — those are TC1 territory.

# Confirm the peer's "4 uncommitted files" are visible to your worktree:
git status --short -- 'apps/product-helper/lib/langchain/schemas/**'

# If they're NOT visible (peer's worktree was different), proceed without them — crawley-schemas resume will re-author from canonical prompt.
# If they ARE visible, snapshot them BEFORE rebase so they survive:
mkdir -p plans/v22-outputs/tc1/_pre-rebase-snapshot
git diff -- 'apps/product-helper/lib/langchain/schemas/**' > plans/v22-outputs/tc1/_pre-rebase-snapshot/uncommitted.diff
git ls-files --others --exclude-standard -- 'apps/product-helper/lib/langchain/schemas/**' \
  | xargs -I {} sh -c 'mkdir -p plans/v22-outputs/tc1/_pre-rebase-snapshot/$(dirname {}) && cp {} plans/v22-outputs/tc1/_pre-rebase-snapshot/{}'
```

**Backup tier-1 (off-machine remote, per `project_c1v_backup_safety.md`):**
```bash
git push backup --all && git push backup --tags
```

Hard-link snapshots in `~/c1v-backups/` cover tier-2 automatically. Both are insurance against rebase mishaps.

---

## Step 1 — Rebase Wave-C onto `wave-b/v2.1.1-hotfix` branch HEAD

**Checkout + rebase:**
```bash
git checkout wave-c/tc1-m345-schemas
git rebase wave-b/v2.1.1-hotfix
```

**NOT** `git rebase main` — local `main` is stale (`a3bc645`) and `origin/main @ db7b12e` does not yet contain `v2.1.1-hotfix-complete`. The hotfix lives only on `wave-b/v2.1.1-hotfix` (4 commits past the tag: rosetta + closeout + dead-link fix + this handoff). Rebasing onto the branch HEAD pulls those forward commits into Wave-C ancestry too.

**Expected outcome:** zero conflicts. v2.1.1 touched `app/(dashboard)/projects/[id]/synthesis/`, `components/synthesis/`, `lib/dbml/`, `playwright/`, `.github/workflows/`. TC1 touches `lib/langchain/schemas/module-{2,3,4,5}/`. Disjoint surface.

**If conflicts surface (low probability):**
- Conflict file in `lib/langchain/schemas/index.ts` registry: keep BOTH sides (Wave-C registry entries + any v2.1.1-era registry entries). `register schemas` must return zero duplicate keys post-rebase — verify via existing schema-registry test or `pnpm tsx -e "import('./apps/product-helper/lib/langchain/schemas/index')"`.
- Anything else: stop, investigate, do NOT force-resolve. Memory: `feedback_reconciliation_first_pattern.md`.

**Verify ancestry post-rebase:**
```bash
git merge-base --is-ancestor v2.1.1-hotfix-complete HEAD && echo "OK: v2.1.1 in ancestry" || echo "FAIL: rebase didn't land"
git log --oneline -10
# Expect: 5 schema commits + namespace-resolver, all on top of main's HEAD which contains 102fce3.
```

---

## Step 2 — Re-anchor TC1 tags

Tags were created on the pre-rebase SHAs; rebase moved the commits to new SHAs. Re-tag:

```bash
# Find the new SHA of namespace-resolver post-rebase:
NS_SHA=$(git log --oneline | grep "module-5-form-function -> module-5" | awk '{print $1}')
echo "Namespace-resolver new SHA: $NS_SHA"

# Re-tag (force-update both aliases):
git tag -f tc1-c0-complete "$NS_SHA"
git tag -f tc1-preflight-complete "$NS_SHA"

# Push (force on these two tags only — they're the post-rebase truth):
git push origin -f tc1-c0-complete tc1-preflight-complete
```

**Sanity check:**
```bash
git tag --contains v2.1.1-hotfix-complete | grep -E "tc1-c0-complete|tc1-preflight-complete"
# Both should print — confirms tags are now downstream of v2.1.1.
```

---

## Step 3 — Restore uncommitted WIP (if snapshotted in Step 0)

```bash
# Restore the snapshotted diff:
[ -f plans/v22-outputs/tc1/_pre-rebase-snapshot/uncommitted.diff ] && git apply plans/v22-outputs/tc1/_pre-rebase-snapshot/uncommitted.diff

# Restore untracked files:
[ -d plans/v22-outputs/tc1/_pre-rebase-snapshot/apps ] && cp -r plans/v22-outputs/tc1/_pre-rebase-snapshot/apps/* apps/

# Audit what's now uncommitted:
git status --short -- 'apps/product-helper/lib/langchain/schemas/**'
```

**Per-file commit immediately** (memory: `feedback_commit_per_file_immediately.md`):
- If a file is a complete schema → `feat(crawley-tc1): <module>/<phase> schema (Crawley Ch X)` per file
- If a file is a round-trip test → `test(crawley-tc1): <schema> round-trip + x-ui-surface coverage` per test file
- Do NOT bulk-commit; do NOT `git add -A`. Memory: parallel-Claude shared-tree risk.

**Snapshot cleanup once committed:**
```bash
rm -rf plans/v22-outputs/tc1/_pre-rebase-snapshot
```

---

## Step 4 — Audit what's left to author

**Canonical 10-schema list per `team-spawn-prompts-v2.2.md` §TC1 `crawley-schemas` deliverables + REQUIREMENTS-crawley §5:**

**Audit method:** `git ls-tree -r wave-c/tc1-m345-schemas -- 'apps/product-helper/lib/langchain/schemas/module-{2,3,4,5}/'` — file-presence at HEAD, NOT commit-graph diff via `git log ^main`. See §"Audit method correction" below.

| # | Schema path | Status | Owner |
|---|---|---|---|
| 1 | `module-5/_matrix.ts` (`mathDerivationMatrixSchema` Option Y, **EC-V21-C.2 keystone**) | ✅ shipped @ `a868930` | — |
| 2 | `module-5/phase-1-form-taxonomy.ts` | ✅ shipped @ `2906454` | — |
| 3 | `module-5/phase-2-function-taxonomy.ts` | ✅ shipped @ `56d0322` | — |
| 4 | `module-5/phase-3-form-function-concept.ts` | ✅ shipped @ `44fd62d` (Wave-C branch) | — |
| 5 | `module-5/phase-4-solution-neutral-concept.ts` | ✅ shipped @ `aa4e6f2` | — |
| 6 | `module-5/phase-5-concept-expansion.ts` | ✅ shipped @ `e7511ce` | — |
| 7 | `module-3/decomposition-plane.ts` | ✅ shipped @ `e2180c2` | — |
| 8 | `module-4/decision-network-foundations.ts` | ✅ shipped @ `080329e` | — |
| 9 | `module-4/tradespace-pareto-sensitivity.ts` | ❌ NOT SHIPPED | crawley-schemas resume |
| 10 | `module-4/optimization-patterns.ts` | ❌ NOT SHIPPED | crawley-schemas resume |
| 11 | `module-2/requirements-crawley-extension.ts` | ❌ NOT SHIPPED | crawley-schemas resume |

**Plus per-schema round-trip + x-ui-surface tests** (REQUIREMENTS-crawley §7) — verify each of the 8 shipped schemas has its `__tests__/*.test.ts` sibling:
```bash
for s in 5/_matrix 5/phase-1-form-taxonomy 5/phase-2-function-taxonomy 5/phase-3-form-function-concept 5/phase-4-solution-neutral-concept 5/phase-5-concept-expansion 3/decomposition-plane 4/decision-network-foundations; do
  test_file="apps/product-helper/lib/langchain/schemas/module-${s%/*}/__tests__/$(basename ${s}).test.ts"
  if [ -f "$test_file" ]; then echo "OK $s"; else echo "MISSING $s"; fi
done
```

If MISSING for any of the 8 shipped — that's the test gap; `crawley-schemas` resume MUST add them (8 backfill + 3 new = 11 test files) before tagging green.

---

## Step 5 — Resume crawley-schemas (canonical prompt + reconciled scope)

Canonical prompt source: `.claude/plans/team-spawn-prompts-v2.2.md` §TC1 → `Agent({ name: "crawley-schemas", ...})`.

**Scope adjustment for resume** (do NOT re-author the 8 shipped schemas):

```
Goal (resume): Ship the 3 REMAINING Crawley schemas + per-schema round-trip + x-ui-surface tests for ALL 11 schemas (D-V21.13). 8 schemas already shipped on this branch — see commit SHAs in §"Current state" of HANDOFF-2026-04-27. Matrix keystone (mathDerivationMatrixSchema, EC-V21-C.2) is already shipped @ a868930.

Required deliverables (NEW commits only):
  1. apps/product-helper/lib/langchain/schemas/module-4/tradespace-pareto-sensitivity.ts
  2. apps/product-helper/lib/langchain/schemas/module-4/optimization-patterns.ts
  3. apps/product-helper/lib/langchain/schemas/module-2/requirements-crawley-extension.ts
  4. Round-trip + x-ui-surface tests for ALL 11 schemas (8 backfill + 3 new) per REQUIREMENTS-crawley §7. Each test asserts: (a) parse a valid fixture, (b) reject an invalid fixture per critical refine, (c) round-trip identity (parse(stringify(parsed)) deep-equal parsed).
  5. apps/product-helper/lib/langchain/schemas/index.ts — register all 11 schemas + matrix; assert no duplicate keys via existing registry test (or new __tests__/schemas/registry-no-dupes.test.ts)
  6. Refactor 10 matrix sites + 1 scalar chain to consume mathDerivationMatrixSchema (EC-V21-C.2 — keystone is shipped, but consumers may not type-check against it yet; grep agent layer for matrix shapes that should now adopt the new schema)
  7. plans/v22-outputs/tc1/schemas-shipped.md — markdown table mapping each schema to REQUIREMENTS-crawley §X source + consumer files + test coverage count

Upstream context (already shipped — do NOT re-author):
  - module-5/_matrix.ts @ a868930 (matrix keystone)
  - module-5/phase-1-form-taxonomy.ts @ 2906454
  - module-5/phase-2-function-taxonomy.ts @ 56d0322
  - module-5/phase-3-form-function-concept.ts @ 44fd62d
  - module-5/phase-4-solution-neutral-concept.ts @ aa4e6f2
  - module-5/phase-5-concept-expansion.ts @ e7511ce
  - module-3/decomposition-plane.ts @ e2180c2
  - module-4/decision-network-foundations.ts @ 080329e

Guardrails (unchanged from canonical):
  - Do NOT modify v2.1 module-2 _shared.ts (REQUIREMENTS-crawley curator decision: 0 modifications)
  - All schemas Zod-shaped — match v2.1 submodule-2-3-nfrs-constants.ts pattern
  - Round-trip tests non-negotiable (REQUIREMENTS-crawley §7)
  - If 11-schema row breaks v2.1 shipped agent emissions → FAIL commit, surface to coordinator (Wave A contract pin must not break)
  - Per-file atomic commits (memory: feedback_commit_per_file_immediately.md)
  - Branch: wave-c/tc1-m345-schemas (already rebased onto wave-b/v2.1.1-hotfix; do NOT branch elsewhere)
```

**Dispatch:** resume the existing `crawley-schemas` agent with this scoped prompt (preserves token budget vs fresh start).

---

## Step 6 — Parallel dispatch the other 3 deliverable agents

All 3 are independent of `crawley-schemas` completion order — they consume schemas as they land via tsc graph + LangSmith dataset replay.

**Dispatch in a single coordinator message** (parallel):

1. **`crawley-migrations`** — canonical prompt at `.claude/plans/team-spawn-prompts-v2.2.md` §TC1 `Agent({ name: "crawley-migrations", ...})`. Branch: `wave-c/tc1-m345-schemas` (same as schemas — migrations land on the same feature branch). HARD-DEP: `tc1-preflight-complete` tag (✅ now reachable post-rebase).

2. **`eval-harness`** — canonical prompt at §TC1 `Agent({ name: "eval-harness", ...})`. Independent of schema authoring (reads v2 self-application emissions for graded examples). Branch: same.

3. **`methodology-page`** — canonical prompt at §TC1 `Agent({ name: "methodology-page", ...})`. Reads `system-design/kb-upgrade-v2/METHODOLOGY-CORRECTION.md`. Branch: same.

All three honor: skill-injection canonical header via `scripts/dispatch-helper.ts`; per-file atomic commits; tsc-green gate.

---

## Step 7 — qa-c-verifier + docs-c (T1 wave)

After all 4 deliverable agents (`crawley-schemas` resume + the 3 parallel) post green:

- **`qa-c-verifier`** — canonical prompt at §TC1 `Agent({ name: "qa-c-verifier", ...})`. Tags `tc1-wave-c-complete` ONLY on full green for EC-V21-C.0 through .6.
- **`docs-c`** — gated on `tc1-wave-c-complete` tag. Canonical prompt at §TC1 `Agent({ name: "docs-c", ...})`.

**One mod for `qa-c-verifier` post-rebase:** the verifier reads tags via `git tag --list`. Since `tc1-c0-complete` and `tc1-preflight-complete` were force-pushed to new SHAs in Step 2, no verifier change needed — they still resolve to the namespace-resolver commit.

---

## Step 8 — Closeout (when `tc1-wave-c-complete` posts green)

Standard TC1 closeout per spawn-prompts §Closeout:
1. Coordinator merges `wave-c/tc1-m345-schemas` → `main`.
2. Roll-up tag `tc1-wave-c-complete` stays on the merge commit (or rebase commit; mirror v2.1 pattern).
3. **TE1 dispatch unblocks** — Wave E HARD-DEPs `tc1-wave-c-complete`.

---

## Sanity-check sequence (run after Step 1 + Step 2)

```bash
# 1. Wave-C now contains v2.1.1:
git merge-base --is-ancestor v2.1.1-hotfix-complete wave-c/tc1-m345-schemas && echo "✅ v2.1.1 in ancestry"

# 2. TC1 tags are downstream of v2.1.1:
git tag --contains v2.1.1-hotfix-complete | grep -E "tc1-c0-complete|tc1-preflight-complete" && echo "✅ tags re-anchored"

# 3. tsc green on Wave-C:
cd apps/product-helper && npx tsc --noEmit --project tsconfig.json
# Memory: feedback_tsc_over_ide_diagnostics.md — trust tsc, not IDE.

# 4. 5 schema files visible:
ls apps/product-helper/lib/langchain/schemas/module-{3,4,5}/*.ts | wc -l
# Expect ≥5 (more if tests + the existing form-function-map.ts absorbed by namespace-resolver are counted).

# 5. Round-trip test gap audit (run the loop from Step 4 above).
```

---

## Rollback plan (if rebase goes sideways)

```bash
# Tier-1 backup remote has the pre-rebase wave-c/tc1-m345-schemas:
git fetch backup
git checkout -B wave-c/tc1-m345-schemas backup/wave-c/tc1-m345-schemas
# Or from origin (which still has the pre-rebase state until force-push):
git checkout -B wave-c/tc1-m345-schemas origin/wave-c/tc1-m345-schemas
```

Tier-2 hard-link snapshots in `~/c1v-backups/plans-<timestamp>/` cover plans/ but not source — origin + backup remotes cover source.

**Do NOT force-push `wave-c/tc1-m345-schemas` to origin until Step 1 sanity-check passes.** The remote is the rollback safety.

---

## What this handoff deliberately does NOT do

- Does NOT discard the 5 already-shipped schemas — they're Jessica's preserved work, canonical-aligned.
- Does NOT restart `namespace-resolver` — its work is good; only the tag SHA changes via re-anchor.
- Does NOT touch `crawley-schemas-2` (already shut down per peer's recap).
- Does NOT modify `qa-c-verifier` or `docs-c` canonical prompts — they're gated downstream and read tags by name, not SHA.
- Does NOT pre-resolve the round-trip test gap — that's a `crawley-schemas` resume deliverable, surfaced here so it doesn't get missed.

---

## Audit method correction (lesson — 2026-04-27 17:46 EDT)

**Wrong method (used in initial draft of this handoff):** `git log --oneline wave-c/tc1-m345-schemas ^main -- 'apps/product-helper/lib/langchain/schemas/**'` — infers shipped state from commit-graph diff against main.

**Why it failed:** the ^main filter excludes commits reachable via paths other than the direct main→branch ancestry. In this case, three commits (`a868930`, `2906454`, `56d0322`) reached `wave-c/tc1-m345-schemas` HEAD via the `wave-b/v2.1.1-hotfix` ancestry path, which the ^main filter dropped. The commits ARE in the branch's reachable history (verified via `git merge-base --is-ancestor`) but did not appear in the `^main` commit list. Result: 3 schemas wrongly marked "NOT SHIPPED" — including the EC-V21-C.2 matrix keystone.

**Right method:** `git ls-tree -r <branch> -- '<path>'` — file presence at HEAD, language-of-the-tree authoritative regardless of which ancestral path delivered the file. Use this for "what's currently shipped" audits. Use `git log ^main` only for "what new commits would land on a merge to main" questions, and even then know that branch-merge ancestry can carry commits past the ^main filter.

**Pin for future handoffs:** when asking "is X shipped?" the answer is `git ls-tree`, not `git log`. Memory entry: `feedback_audit_file_presence_not_commit_diff.md`.

---

## Cross-references

- v2.2 spawn prompts: [`team-spawn-prompts-v2.2.md`](.claude/plans/team-spawn-prompts-v2.2.md) §TC1
- v2.2 master plan: [`c1v-MIT-Crawley-Cornell.v2.2.md`](c1v-MIT-Crawley-Cornell.v2.2.md) §Wave C
- Crawley requirements: [`crawley-sys-arch-strat-prod-dev/REQUIREMENTS-crawley.md`](crawley-sys-arch-strat-prod-dev/REQUIREMENTS-crawley.md) §5 + §7
- Backup safety: [`memory: project_c1v_backup_safety.md`](~/.claude/projects/-Users-davidancor-Projects-c1v/memory/project_c1v_backup_safety.md)
- v2.1.1 closeout (preserves wave-c/tc1-m345-schemas mention): [`c1v-MIT-Crawley-Cornell.v2.1.1.md`](c1v-MIT-Crawley-Cornell.v2.1.1.md) §CLOSEOUT
- Methodology Rosetta (orientation): [`methodology-rosetta.md`](methodology-rosetta.md)

---

**END OF HANDOFF.** Peer Claude: start at §"Step 0 — Pre-rebase safety". Each step is checkpoint-able; do not advance past a step without its sanity check green.
