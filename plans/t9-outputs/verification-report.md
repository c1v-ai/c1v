# T9 c1v-kb-hygiene Verification Report

- **Generated:** 2026-04-24T17:17:34.416Z
- **Tree tag depended on:** t9-pre-hygiene-snapshot
- **Verifier script:** `scripts/verify-kb-hygiene.ts`
- **Companion script:** `scripts/verify-atlas-schema-refs.ts`

## Summary

| Status | Count |
|---|---|
| PASS | 6 |
| FAIL | 2 |
| DEFERRED | 1 |
| **TOTAL** | 9 |

**Overall verdict:** BLOCKED - failures above

## Exit Criteria

| EC | Label | Status |
|---|---|---|
| EC-0.2.1 | Uniform 6-sub-folder structure (structural only per EC-0.2.1b) | PASS |
| EC-0.2.2 | Scoped dedup via _shared/ pool + symlinks | PASS |
| EC-0.2.3 | Atlas consolidated to 9-stacks-atlas/; no legacy refs | FAIL |
| EC-0.2.4 | Folder numbering matches v2 section 0.4.3 | PASS |
| EC-0.2.6 | v2 _upstream_refs resolve (inline fallback) | DEFERRED |
| EC-0.2.7 | generate-all.ts emits semantically equivalent schemas | PASS |
| EC-0.2.8 | No broken symlinks under .planning/ | PASS |
| EC-0.2.9 | RAG ingest smoke test (ingest-kbs --dry-run) | PASS |
| EC-0.2.10 | Atlas schema->content cross-ref check | FAIL |

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

**Status:** FAIL

**Evidence:**
```
Atlas company entries under new path: 11 .md files
Legacy plans/8-stacks-and-priors-atlas exists? false
git grep hits for "plans/8-stacks-and-priors-atlas": 12 total, 3 outside exclusion list
```

**Failures:**
```
Legacy path ref: plans/t10-outputs/new-generators-spec.md:77:2. Fallback: `plans/8-stacks-and-priors-atlas/` (emits DEPRECATION warn in manifest)
Legacy path ref: scripts/artifact-generators/gen-cost-curves.py:9:  2. plans/8-stacks-and-priors-atlas/   (pre-T9, deprecation WARN)
Legacy path ref: scripts/artifact-generators/gen-cost-curves.py:55:    REPO_ROOT / "plans/8-stacks-and-priors-atlas",
```

### EC-0.2.4 - Folder numbering matches v2 section 0.4.3

**Status:** PASS

**Evidence:**
```
Disk KB slugs: 1-defining-scope, 2-requirements, 3-ffbd, 4-decision-net-crawley-on-cornell, 5-form-function, 6-hoq, 7-interfaces, 8-risk, 9-stacks-atlas
Expected slugs: 1-defining-scope, 2-requirements, 3-ffbd, 4-decision-net-crawley-on-cornell, 5-form-function, 6-hoq, 7-interfaces, 8-risk, 9-stacks-atlas
```

### EC-0.2.6 - v2 _upstream_refs resolve (inline fallback)

**Status:** DEFERRED

**Evidence:**
```
No external verify-v2-upstream-refs.ts found; using inline fallback.
Scanned 57 v2 JSONs
Unresolved module-path refs: 39
DEFERRED: external verify-v2-upstream-refs.ts missing; inline fallback detected unresolved system-design/module-* refs but those are v2 OUTPUT artifacts and not in T9 scope.
```

**Failures:**
```
Unresolved _upstream_refs in system-design/kb-upgrade-v2/module-2-requirements/constants_table.json: system-design/module-1-defining-scope/system_scope_summary.json
Unresolved _upstream_refs in system-design/kb-upgrade-v2/module-2-requirements/constants_table.json: system-design/module-2-requirements/requirements_table.json
Unresolved _upstream_refs in system-design/kb-upgrade-v2/module-2-requirements/open_questions.json: system-design/module-2-requirements/decision_audit.jsonl
Unresolved _upstream_refs in system-design/kb-upgrade-v2/module-2-requirements/open_questions.json: system-design/module-2-requirements/constants_table.json
Unresolved _upstream_refs in system-design/kb-upgrade-v2/module-2-requirements/requirements_table.json: system-design/module-1-defining-scope/system_scope_summary.json
Unresolved _upstream_refs in system-design/kb-upgrade-v2/module-2-requirements/requirements_table.json: system-design/module-2-requirements/ucbd/
Unresolved _upstream_refs in system-design/kb-upgrade-v2/module-2-requirements/ucbd/UC01-generate-spec-from-idea.ucbd.json: system-design/module-1-defining-scope/system_scope_summary.json
Unresolved _upstream_refs in system-design/kb-upgrade-v2/module-2-requirements/ucbd/UC01-generate-spec-from-idea.ucbd.json: system-design/module-2-requirements/use_case_priority.json
Unresolved _upstream_refs in system-design/kb-upgrade-v2/module-2-requirements/ucbd/UC03-review-generated-spec.ucbd.json: system-design/module-1-defining-scope/system_scope_summary.json
Unresolved _upstream_refs in system-design/kb-upgrade-v2/module-2-requirements/ucbd/UC03-review-generated-spec.ucbd.json: system-design/module-2-requirements/use_case_priority.json
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

**Status:** FAIL

**Evidence:**
```
Ran verify-atlas-schema-refs: exit=1
output tail:
[verify-atlas-schema-refs] scanned 11 files under:
  /Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/schemas/atlas
  /Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/schemas/generated/atlas
[verify-atlas-schema-refs] FAIL - 1 finding(s):
  LEGACY  /Users/davidancor/Projects/c1v/apps/product-helper/lib/langchain/schemas/atlas/entry.ts:5  matched="New-knowledge-banks/8-stacks-and-priors-atlas"
    > *   `.planning/phases/13-.../New-knowledge-banks/8-stacks-and-priors-atlas/companies/*.md`

```

**Failures:**
```
verify-atlas-schema-refs exit=1
```
