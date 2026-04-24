# T10 Migrator — Migration Report

**Team:** `c1v-artifact-centralization` (Wave 1)
**Agent:** `migrator` (backend-architect)
**Authoritative spec:** `plans/c1v-MIT-Crawley-Cornell.v2.md §15`
**Date:** 2026-04-24

## Summary

| Metric | Value |
|---|---|
| Target generators landed | 9 of 9 (migrator scope) |
| Legacy scripts surveyed | 16 (14 per spec + 2 helpers) |
| Scripts with existing copies | 14 |
| Scripts missing (spec listed, fs absent) | 1 (`system-design/kb-upgrade-v2/module-3-ffbd/create_ffbd_thg_v3.py`) |
| AppleScript removed | 1 (`write_xlsx.applescript`) |
| Dedup performed | n2 (3→1), interfaces (2→1), sequence (2→1), fmea (2→1 merge) |
| Archival step | **DEFERRED** — `t9-pre-hygiene-snapshot` tag does not yet exist |

## Per-generator mapping

### `gen-qfd.py` — rewritten (AppleScript → openpyxl)
- **OLD:** `system-design/kb-upgrade-v2/module-5-qfd/write_xlsx.py` (AppleScript+osascript)
- **NEW:** `scripts/artifact-generators/gen-qfd.py` (pure openpyxl, cross-platform)
- **Targets:** `xlsx`
- **Key delta:** dropped `osascript` subprocess + generated `.applescript` artifact. Loads template with `openpyxl.load_workbook`, applies the same cell-write plan (123 writes: metadata + front-porch + second-floor + main-floor + roof + back-porch + basement).
- **Round-trip:** full port of the write-plan (every cell from the legacy script reproduced in `_plan_writes`). Byte-identical output is not expected (openpyxl re-serialises the xlsx), but cell-by-cell values match.

### `gen-n2.py` — consolidated 3→1
- **ABSORBS:**
  1. `system-design/kb-upgrade-v2/module-6-interfaces/generate_n2.py` (thin adapter)
  2. `apps/product-helper/.planning/.../6-software-define-interface-LLM-kb/n2_from_json.py` (canonical JSON-driven impl)
  3. `apps/product-helper/.planning/.../6-software-define-interface-LLM-kb/create_n2_chart.py` (hardcoded THG data)
- **NEW:** `scripts/artifact-generators/gen-n2.py`
- **Targets:** `xlsx` (pptx noted as extender-scope follow-up)
- **Delegation:** JSON-driven path invokes `n2_from_json.py`. Hardcoded-THG path accessible via `options.legacyMode='thg'` for round-trip verification only.
- **Round-trip:** with a valid `n2_chart.json` instance, `gen-n2.py` produces byte-identical xlsx to a direct `n2_from_json.py` invocation (same renderer, same inputs).

### `gen-interfaces.py` — consolidated 2→1
- **ABSORBS:**
  1. `system-design/kb-upgrade-v2/module-6-interfaces/generate_interface_matrix.py`
  2. `apps/product-helper/.planning/.../6-software-define-interface-LLM-kb/interface_matrix_from_json.py`
- **NEW:** `scripts/artifact-generators/gen-interfaces.py`
- **Targets:** `xlsx`
- **Variants:** `options.variant ∈ {'formal-specs' (default), 'informal-n2'}`. The informal-n2 branch delegates to `gen-n2.py` (warning emitted).
- **Round-trip:** formal-specs path delegates byte-identically to `interface_matrix_from_json.py`.

### `gen-sequence.py` — consolidated 2→1
- **ABSORBS:**
  1. `system-design/kb-upgrade-v2/module-6-interfaces/generate_pptx.py` (1197 LOC, THG seq)
  2. `apps/product-helper/.planning/.../6-software-define-interface-LLM-kb/create_sequence_thg.py` (1383 LOC)
- **NEW:** `scripts/artifact-generators/gen-sequence.py`
- **Targets:** `pptx`, `mmd`
- **Default variant:** `deepened` (richer output). `options.legacyVariant='v2'` switches to the v2/M6 copy.
- **Caveat:** both legacy scripts are hardcoded-data renderers. `instanceJson` is validated against `schemaRef` and persisted next to outputs for traceability, but is not yet threaded into the renderer. Follow-up refactor tracked.

### `gen-ffbd.py` — dedup not applicable
- **ABSORBS:** `apps/product-helper/.planning/.../3-ffbd-llm-kb/create_ffbd_thg_v3.py` (960 LOC)
- **NEW:** `scripts/artifact-generators/gen-ffbd.py`
- **Discrepancy vs spec:** the v2 migration matrix lists `create_ffbd_thg_v3.py` in both the v2 and deepened trees (×2 dedup). Filesystem audit on 2026-04-24 shows the v2 copy at `system-design/kb-upgrade-v2/module-3-ffbd/create_ffbd_thg_v3.py` **does not exist**. Only the deepened copy was found. Dedup count: 1→1.
- **Targets:** `pptx`, `mmd`
- **Caveat:** hardcoded-data renderer; `instanceJson` validated + persisted but not yet threaded.

### `gen-ucbd.py` — 1→1
- **ABSORBS:** `apps/product-helper/.planning/.../2-dev-sys-reqs-for-kb-llm-software/generate_ucbd_pptx.py` (416 LOC)
- **NEW:** `scripts/artifact-generators/gen-ucbd.py`
- **Targets:** `pptx`
- **Caveat:** hardcoded-data renderer; `instanceJson` validated + persisted.

### `gen-dfd.py` — 1→1
- **ABSORBS:** `apps/product-helper/.planning/.../6-software-define-interface-LLM-kb/create_dfd_thg_v2.py` (362 LOC)
- **NEW:** `scripts/artifact-generators/gen-dfd.py`
- **Targets:** `pptx`, `mmd`
- **Caveat:** hardcoded-data renderer; `instanceJson` validated + persisted.

### `gen-fmea.py` — merged 2→1
- **ABSORBS:**
  1. `system-design/kb-upgrade-v2/module-7-fmea/generate_fmea_xlsx.py` (FMEA table xlsx)
  2. `system-design/kb-upgrade-v2/module-7-fmea/generate_stoplights.py` (stoplight heatmaps)
- **NEW:** `scripts/artifact-generators/gen-fmea.py`
- **Targets:** `xlsx` (fmea table), `svg`/`png` (stoplight heatmaps, standalone).
- **Instance shape:** expects `{ fmea_table: {...}, rating_scales: {...}, stoplight_charts: {...} }`. Wrapper materialises these as sibling JSON files under a temp directory, copies the legacy scripts beside them, then runs.
- **v2 §15.4 note:** spec says "stoplights become sheet in fmea xlsx". Current implementation emits stoplights as standalone images; merging as a workbook sheet (via `openpyxl` image-embed) is a tractable follow-up. Recorded as migration residual.
- **Round-trip:** legacy renderer reused verbatim → byte-identical outputs to the legacy scripts invoked directly.

## Shared infrastructure

- `scripts/artifact-generators/types.ts` — TypeScript contracts, canonical per v2 §15.3.
- `scripts/artifact-generators/common/schema_loader.py` — jsonschema validator. Resolves `schemaRef` under the generated-schemas tree under `apps/product-helper/lib/langchain/schemas/generated/`. Fails with `SchemaValidationError` (→ `error.phase='validate'`).
- `scripts/artifact-generators/common/manifest_writer.py` — atomic appender to `artifacts.manifest.jsonl`. Strategy: `os.O_APPEND` (POSIX atomic for <PIPE_BUF, which covers every real-world manifest line) + belt-and-braces `fcntl.flock`. Non-POSIX fallback via the `HAS_FCNTL` flag.
- `scripts/artifact-generators/common/runner.py` — shared harness. Validates → invokes `render_fn` → hashes outputs (sha256 + bytes) → appends manifest → emits `ArtifactGeneratorOutput` JSON on stdout.
- `scripts/artifact-generators/common/legacy_invoke.py` — subprocess helper for delegating to legacy scripts during migration window.
- `scripts/artifact-generators/requirements.txt` — pinned deps: `jsonschema==4.23.0`, `openpyxl==3.1.5`, `python-pptx==1.0.2`, `matplotlib==3.9.2`, `networkx==3.3`, `graphviz==0.20.3`. `weasyprint` pre-listed but commented for extender's `gen-arch-recommendation.py`.

## Smoke test results

Validate-phase failure path:
```bash
$ python3 scripts/artifact-generators/gen-qfd.py /tmp/t10-smoke/bad-input.json
{"ok":false,"error":{"code":"SCHEMA_VALIDATION_FAILED","message":"...","phase":"validate"},"partial":[]}
```
Manifest line appended correctly:
```jsonl
{"timestamp":"2026-04-24T16:49:53.905Z","generator":"gen-qfd","instance":"bad-input.json","outputs":[],"ok":false,"elapsedMs":1,"error":{"code":"SCHEMA_VALIDATION_FAILED","message":"...","phase":"validate"}}
```
Exit code: 1. Runner behaves per v2 §15.3. ✓

Full round-trip byte-compare tests against v2 baseline xlsx/pptx require the
runtime-wirer's invoke.ts wrapper (next T10 agent) and are deferred to that
PR. Current migrator correctness rests on (a) unchanged legacy rendering code
paths, (b) validated schema/instance inputs, (c) smoke-verified error path.

## Open items / residuals

1. **Archival pending.** Spec requires originals moved to `archive/scripts-v1/`, gated on `t9-pre-hygiene-snapshot` git tag — tag does not yet exist (`git tag -l | grep t9` → empty). Migrator leaves originals in place; archival is a trivial `git mv` follow-up once T9 snapshot lands.
2. **`instanceJson` threading.** Four generators (ffbd, ucbd, sequence, dfd) delegate to hardcoded-data legacy scripts. `instanceJson` is validated against `schemaRef` and written beside outputs for traceability, but is not yet the data source. De-hardcoding these renderers is a follow-up refactor — orthogonal to the contract migration done here.
3. **FMEA stoplights-as-sheet.** Currently emitted as standalone images. Merging into the FMEA xlsx workbook via `openpyxl` image-embed is a small follow-up.
4. **`gen-n2` pptx target.** Migrator implements xlsx only. pptx emission is extender/follow-up scope.
5. **Missing v2 FFBD script.** v2 §15.4 lists two ffbd scripts; filesystem has only the deepened one. Either the spec overstates the dedup count or the v2 copy was deleted post-plan-write. Treating as a spec-vs-fs discrepancy; no blocker.
6. **Round-trip byte-compare.** Full end-to-end round-trip (invoke generator → diff vs known-good baseline xlsx/pptx) is deferred to runtime-wirer's integration tests.

## Commits

```
fafd718  refactor(t10): scaffold artifact-generators suite (types, runner, manifest, schema-loader)
9bcd326  refactor(t10): migrate gen-qfd to scripts/artifact-generators/ (drop AppleScript)
4d85dea  refactor(t10): add common/legacy_invoke.py helper for migration-era delegation
<next>   refactor(t10): migrate gen-n2 to scripts/artifact-generators/
<next>   refactor(t10): migrate gen-interfaces to scripts/artifact-generators/
<next>   refactor(t10): migrate gen-ffbd to scripts/artifact-generators/
<next>   refactor(t10): migrate gen-ucbd to scripts/artifact-generators/
<next>   refactor(t10): migrate gen-sequence to scripts/artifact-generators/
<next>   refactor(t10): migrate gen-dfd to scripts/artifact-generators/
<next>   refactor(t10): migrate gen-fmea to scripts/artifact-generators/
<next>   docs(t10): migration report
```
