# T10 Legacy-Script Archival Log

## Status: BLOCKED (partial)

The runtime-wirer task (deliverable 8) asked to `git mv` legacy per-module
generator scripts from `system-design/kb-upgrade-v2/module-*/` into
`archive/scripts-v1/<preserved-path>/`.

Audit of 13 generators (`scripts/artifact-generators/gen-*.py`) shows the
following still shell out to legacy scripts via
`common/legacy_invoke.py::run_legacy(...)`:

| Generator | Legacy dependency | Path |
|-----------|-------------------|------|
| gen-ffbd | create_ffbd_thg_v3.py + generate_c1v_ffbd_pptx.py | `system-design/kb-upgrade-v2/module-3-ffbd/` |
| gen-fmea | generate_fmea_xlsx.py + generate_stoplights.py | `system-design/kb-upgrade-v2/module-7-fmea/` |
| gen-interfaces | generate_interface_matrix.py + generate_pptx.py | `system-design/kb-upgrade-v2/module-6-interfaces/` |
| gen-n2 | generate_n2.py | `system-design/kb-upgrade-v2/module-6-interfaces/` |
| gen-sequence | (module-6 diagrams) | `system-design/kb-upgrade-v2/module-6-interfaces/` |
| gen-dfd | (module-6 diagrams) | `system-design/kb-upgrade-v2/module-6-interfaces/` |
| gen-ucbd | (module-1 diagrams) | `system-design/kb-upgrade-v2/module-1-defining-scope/diagrams/` |

Moving these files would break generator execution at runtime. The migrator
deferred archival on the assumption the generators had absorbed the legacy
code; audit confirms they have NOT.

## Action Taken

**Archived (safe — no runtime references):** NONE.

All 14 candidate scripts found under `system-design/kb-upgrade-v2/` are still
referenced by at least one generator via `run_legacy()`. Archiving them now
would turn every inline generator invocation into `E_NONZERO_EXIT` on the
first call.

Scripts scanned:
```
system-design/kb-upgrade-v2/module-1-defining-scope/diagrams/generate_context_diagram_pptx.py
system-design/kb-upgrade-v2/module-1-defining-scope/diagrams/generate_scope_tree_pptx.py
system-design/kb-upgrade-v2/module-1-defining-scope/diagrams/generate_use_case_diagram_pptx.py
system-design/kb-upgrade-v2/module-3-ffbd/generate_c1v_ffbd_pptx.py
system-design/kb-upgrade-v2/module-4-decision-matrix/fill_artifacts.py
system-design/kb-upgrade-v2/module-4-decision-matrix/renders/generate_readable_xlsx.py
system-design/kb-upgrade-v2/module-4-decision-matrix/v2_revised/generate_readable_xlsx.py
system-design/kb-upgrade-v2/module-4-decision-matrix/v2_revised/json_to_xlsx.py
system-design/kb-upgrade-v2/module-5-qfd/write_xlsx.py
system-design/kb-upgrade-v2/module-6-interfaces/generate_interface_matrix.py
system-design/kb-upgrade-v2/module-6-interfaces/generate_n2.py
system-design/kb-upgrade-v2/module-6-interfaces/generate_pptx.py
system-design/kb-upgrade-v2/module-7-fmea/generate_fmea_xlsx.py
system-design/kb-upgrade-v2/module-7-fmea/generate_stoplights.py
```

Grep validation:
```
$ grep -l "legacy_invoke\|run_legacy\|LEGACY_" scripts/artifact-generators/gen-*.py
scripts/artifact-generators/gen-dfd.py
scripts/artifact-generators/gen-ffbd.py
scripts/artifact-generators/gen-fmea.py
scripts/artifact-generators/gen-interfaces.py
scripts/artifact-generators/gen-n2.py
scripts/artifact-generators/gen-sequence.py
scripts/artifact-generators/gen-ucbd.py
```

## Unblock Plan (follow-up ticket)

Before archival can complete:
1. Fold the remaining legacy Python (openpyxl / python-pptx rendering) into
   each `gen-*.py` renderer so generators become self-contained.
2. Remove `common/legacy_invoke.py`.
3. Re-run generator smoke tests (`scripts/verify-t3.ts` or equivalent).
4. Then `git mv system-design/kb-upgrade-v2/ archive/scripts-v1/kb-upgrade-v2/`
   in a single atomic commit.

Owner: T10 migrator (follow-up) or T11 runtime-wirer v2.
Estimated effort: ~1 day (inlining + test pass).

## Note re: T9 paths

The spec instructed verifying NEW T9 paths before archiving. T9 structurer has
renamed the `apps/product-helper/.planning/phases/13-Knowledge-banks-deepened`
subtree, but the `system-design/kb-upgrade-v2/` tree (which holds the legacy
Python) has NOT been touched. Paths above are current as of this commit.
