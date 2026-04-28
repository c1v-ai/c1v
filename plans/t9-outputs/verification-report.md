# T9 c1v-kb-hygiene Verification Report

- **Generated:** 2026-04-24T17:22:49.690Z
- **Tree tag depended on:** t9-pre-hygiene-snapshot
- **Verifier script:** `scripts/verify-kb-hygiene.ts`
- **Companion script:** `scripts/verify-atlas-schema-refs.ts`

## Summary

| Status | Count |
|---|---|
| PASS | 9 |
| FAIL | 0 |
| DEFERRED | 0 |
| **TOTAL** | 9 |

**Overall verdict:** READY FOR t9-wave-1-complete tag

## Gate-flip Addendum (2026-04-24, t9-fixups agent)

Wave-1 KB-hygiene gate flipped RED -> GREEN.

- **Pre-fixup state:** PASS=6 FAIL=2 DEFERRED=1 (per task brief)
- **On-entry state (discovered):** PASS=8 FAIL=0 DEFERRED=1 — Fixes 1 and 2 (EC-0.2.3 legacy atlas paths, EC-0.2.10 atlas schema->content) had already landed in commits `d6e39b4` (fix(t9): remove legacy atlas path refs per EC-0.2.3 + EC-0.2.10). Nothing to do for those.
- **Fix 3 applied — EC-0.2.6 DEFERRED -> PASS:** Rewrote `_upstream_refs` across 15 v2 JSON artifacts (modules 2/4/5/7) to include the `kb-upgrade-v2/` prefix. Option A chosen per task brief (paths genuinely wrong, target files all exist under `kb-upgrade-v2/`).
  - Commit: `776d80d` — `fix(v2): correct _upstream_refs paths to include kb-upgrade-v2/ prefix in module-2 artifacts`
  - Scope expanded beyond brief's 5 files: initial sweep revealed 10 more files with the same legacy-prefix bug (verifier had capped output at 10 failures). Applied the same Option A rewrite uniformly; all target paths validated to exist on disk.
- **Final state:** PASS=9 FAIL=0 DEFERRED=0 (verifier exit 0)
- **Tag:** `t9-wave-1-complete` at `776d80d`

## Exit Criteria

| EC | Label | Status |
|---|---|---|
| EC-0.2.1 | Uniform 6-sub-folder structure (structural only per EC-0.2.1b) | PASS |
| EC-0.2.2 | Scoped dedup via _shared/ pool + symlinks | PASS |
| EC-0.2.3 | Atlas consolidated to 9-stacks-atlas/; no legacy refs | PASS |
| EC-0.2.4 | Folder numbering matches v2 section 0.4.3 | PASS |
| EC-0.2.6 | v2 _upstream_refs resolve (inline fallback) | PASS |
| EC-0.2.7 | generate-all.ts emits semantically equivalent schemas | PASS |
| EC-0.2.8 | No broken symlinks under .planning/ | PASS |
| EC-0.2.9 | RAG ingest smoke test (ingest-kbs --dry-run) | PASS |
| EC-0.2.10 | Atlas schema->content cross-ref check | PASS |

## Evidence + Failures

### EC-0.2.1 - Uniform 6-sub-folder structure (structural only per EC-0.2.1b)

**Status:** PASS

**Evidence:**
```
1-defining-scope/: master=ok, sub-folders=6/6
2-requirements/: master=ok, sub-folders=6/6
3-ffbd/: master=ok, sub-folders=6/6
4-decision-net-crawley-on-cornell/: master=ok, sub-folders=6/6
5-form-function/: master=ok, sub-folders=6/6
6-hoq/: master=ok, sub-folders=6/6
7-interfaces/: master=ok, sub-folders=6/6
8-risk/: master=ok, sub-folders=6/6
9-stacks-atlas/: master=ok, sub-folders=6/6
```

### EC-0.2.2 - Scoped dedup via _shared/ pool + symlinks

**Status:** PASS

**Evidence:**
```
Canonical count in _shared/: 13/13
Expected symlink count: 117 (9 KBs x 13 canonicals)
```

### EC-0.2.3 - Atlas consolidated to 9-stacks-atlas/; no legacy refs

**Status:** PASS

**Evidence:**
```
Atlas company entries under new path: 11 .md files
Legacy plans/8-stacks-and-priors-atlas exists? false
git grep hits for "plans/8-stacks-and-priors-atlas": 17 total, 0 outside exclusion list
```

### EC-0.2.4 - Folder numbering matches v2 section 0.4.3

**Status:** PASS

**Evidence:**
```
Disk KB slugs: 1-defining-scope, 2-requirements, 3-ffbd, 4-decision-net-crawley-on-cornell, 5-form-function, 6-hoq, 7-interfaces, 8-risk, 9-stacks-atlas
Expected slugs: 1-defining-scope, 2-requirements, 3-ffbd, 4-decision-net-crawley-on-cornell, 5-form-function, 6-hoq, 7-interfaces, 8-risk, 9-stacks-atlas
```

### EC-0.2.6 - v2 _upstream_refs resolve (inline fallback)

**Status:** PASS

**Evidence:**
```
No external verify-v2-upstream-refs.ts found; using inline fallback.
Scanned 57 v2 JSONs
Unresolved module-path refs: 0
```

### EC-0.2.7 - generate-all.ts emits semantically equivalent schemas

**Status:** PASS

**Evidence:**
```
Pre-snapshot schema count: 49
Ran generate-all.ts from apps/product-helper: exit=0
Missing after re-gen: 0, semantic drift: 0
```

### EC-0.2.8 - No broken symlinks under .planning/

**Status:** PASS

**Evidence:**
```
find -L .planning -xtype l count: 0
```

### EC-0.2.9 - RAG ingest smoke test (ingest-kbs --dry-run)

**Status:** PASS

**Evidence:**
```
ingest-kbs --dry-run exit=0
output tail:
[ingest-kbs] root=/Users/davidancor/Projects/c1v/apps/product-helper/.planning/phases/13-Knowledge-banks-deepened
[ingest-kbs] walked 175 markdown files
[ingest-kbs] prepared 2680 chunks across 10 sources

[stats] file dedup:
  walked files:          175
  unique realpaths:      175
  unique content SHA-256:175
  realpath duplicates:   0 groups
  content-hash duplicates:0 groups (0 redundant files)

[stats] chunk-size distribution (chars):
  n:     2680
  min:   17
  p50:   679
  p95:   2034
  p99:   2231
  max:   2789
  mean:  814
  target: 2000 (overlap=200)  — ~500 tokens cl100k

[ingest-kbs] per-source chunk counts:
  1-defining-scope: 118 chunks
  2-requirements: 340 chunks
  3-ffbd: 439 chunks
  4-decision-net-crawley-on-cornell: 375 chunks
  5-form-function: 263 chunks
  6-hoq: 332 chunks
  7-interfaces: 166 chunks
  8-risk: 163 chunks
  9-stacks-atlas: 212 chunks
  _shared: 272 chunks

[ingest-kbs] --dry-run set; skipping embed + write.

Detected total count: 2680 chunks
```

### EC-0.2.10 - Atlas schema->content cross-ref check

**Status:** PASS

**Evidence:**
```
Ran verify-atlas-schema-refs: exit=0
output tail:
[verify-atlas-schema-refs] scanned 11 files under:
  /Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/schemas/atlas
  /Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/schemas/generated/atlas
[verify-atlas-schema-refs] PASS - no legacy atlas path references found.

```
