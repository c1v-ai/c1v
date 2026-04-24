# T9 Structurer Diff

**Agent:** `structurer` (c1v-kb-hygiene / T9)
**Spec:** `plans/c1v-MIT-Crawley-Cornell.v2.md` §0.2.5 Agent 2, §0.2.2 EC-0.2.1, §0.4.3
**Snapshot baseline:** commit `02b48cb`, tag `t9-pre-hygiene-snapshot`
**Completion range:** `7075fdf` .. `7c1ed9b` (9 atomic commits)
**Date:** 2026-04-24

---

## Summary

| Metric | Count |
|---|---|
| Files moved (git mv) | ~280 |
| Duplicate files removed (git rm) | 52 |
| Symlinks created (relative, POSIX) | 117 (13 per folder × 9 folders) |
| Canonical `_shared/` files | 13 |
| Folders renamed / created | 9 (KB-1..KB-9) |
| Commits | 9 |
| Spelling fixes | 1 (`resilliency` → `resiliency`) |

All symlinks verified resolving to `_shared/` canonical content via `cat` (spot-checked `cap_theorem.md`, `resiliency-patterns-kb.md`, `observability-kb.md`).

---

## Commits (atomic, one per KB)

| # | SHA | Subject |
|---|---|---|
| 1 | `7075fdf` | `chore(t9): extract 13 cross-cutting KBs to _shared/ pool` |
| 2 | `55719ca` | `chore(t9): normalize KB-1 to 6-layer structure` |
| 3 | `d6b5dc0` | `chore(t9): normalize KB-2 to 6-layer structure` |
| 4 | `0f9719d` | `chore(t9): normalize KB-3 to 6-layer structure` |
| 5 | `3282e86` | `chore(t9): normalize KB-4 (merge Cornell + Crawley decision-matrix/net)` |
| 6 | `dd95fd1` | `chore(t9): normalize KB-5 to 6-layer structure` |
| 7 | `d6f97b1` | `chore(t9): normalize KB-6 (HoQ/QFD) to 6-layer structure` |
| 8 | `66d8283` | `chore(t9): normalize KB-7 (interfaces) to 6-layer structure` |
| 9 | `886dc42` | `chore(t9): normalize KB-8 (risk/FMEA) to 6-layer structure` |
| 10 | `7c1ed9b` | `chore(t9): consolidate atlas content to KB-9` |

(Commit 1 is the `_shared/` extraction baseline. Commits 2..10 are per-KB per spec.)

---

## `_shared/` Pool Extraction

**Canonical source:** M2 (`2-dev-sys-reqs-for-kb-llm-software/`) per auditor-confirmed mtime tiebreak. All 65 files (13 cross-cutting KBs × 5 folders) re-verified byte-identical via `md5 -q` pre-deletion — hashes matched every entry in `duplicate-content-map.md`.

**Moves into `_shared/` (via `git mv` to preserve history):**

```
2-dev-sys-reqs-for-kb-llm-software/api-design-sys-design-kb.md           -> _shared/api-design-sys-design-kb.md
2-dev-sys-reqs-for-kb-llm-software/caching-system-design-kb.md           -> _shared/caching-system-design-kb.md
2-dev-sys-reqs-for-kb-llm-software/cap_theorem.md                        -> _shared/cap_theorem.md
2-dev-sys-reqs-for-kb-llm-software/cdn-networking-kb.md                  -> _shared/cdn-networking-kb.md
2-dev-sys-reqs-for-kb-llm-software/data-model-kb.md                      -> _shared/data-model-kb.md
2-dev-sys-reqs-for-kb-llm-software/deployment-release-cicd-kb.md         -> _shared/deployment-release-cicd-kb.md
2-dev-sys-reqs-for-kb-llm-software/load-balancing-kb.md                  -> _shared/load-balancing-kb.md
2-dev-sys-reqs-for-kb-llm-software/maintainability-kb.md                 -> _shared/maintainability-kb.md
2-dev-sys-reqs-for-kb-llm-software/message-queues-kb.md                  -> _shared/message-queues-kb.md
2-dev-sys-reqs-for-kb-llm-software/Multithreading-vs-Multiprocessing.md  -> _shared/Multithreading-vs-Multiprocessing.md
2-dev-sys-reqs-for-kb-llm-software/observability-kb.md                   -> _shared/observability-kb.md
2-dev-sys-reqs-for-kb-llm-software/resilliency-patterns-kb.md            -> _shared/resiliency-patterns-kb.md   (*** SPELLING FIX ***)
2-dev-sys-reqs-for-kb-llm-software/software_architecture_system.md       -> _shared/software_architecture_system.md
```

**Spelling fix:** `resilliency-patterns-kb.md` → `resiliency-patterns-kb.md` (auditor-flagged misspelling preserved in snapshot tag; corrected on extraction per structurer spec).

**Deletions (52 files across M4-perf, M5-HoQ, M6-iface, M7-risk):** All 13 cross-cutting KBs deleted from each of the four non-canonical folders (4-assess-software-performance-kb, 5-HoQ_for_software_sys_design, 6-software-define-interface-LLM-kb, 7-identify-evaluate-risk-software) via `git rm`. Auditor-confirmed defect-2 scope of 5 folders (not 4) was upheld — M4-perf was included.

---

## Folder Renames (per v2 §0.4.3)

| Old | New | Strategy |
|---|---|---|
| `1-defining-scope-kb-for-software/` | `1-defining-scope/` | `git mv` rename |
| `2-dev-sys-reqs-for-kb-llm-software/` | `2-requirements/` | `git mv` rename |
| `3-ffbd-llm-kb/` | `3-ffbd/` | `git mv` rename |
| `4-assess-software-performance-kb/` + `4-decision-network-mit-crawley/` | `4-decision-net-crawley-on-cornell/` | **merge** (Cornell under `01-phase-docs/cornell/`, Crawley under `01-phase-docs/crawley/`) |
| `5-form-function-mapping/` | `5-form-function/` | `git mv` rename |
| `5-HoQ_for_software_sys_design/` | `6-hoq/` | **renumber** (5 → 6) + rename |
| `6-software-define-interface-LLM-kb/` | `7-interfaces/` | **renumber** (6 → 7) + rename |
| `7-identify-evaluate-risk-software/` | `8-risk/` | **renumber** (7 → 8) + rename |
| `plans/8-stacks-and-priors-atlas/` (untracked) | `9-stacks-atlas/` (consolidated into KB tree) | **cross-tree mv** + `git add` |

---

## 6-Sub-Folder Structure Applied (per EC-0.2.1)

Every `N-<slug>/` now carries:
```
N-<slug>/
├── 00-master-prompt.md        (file; empty placeholder in 5-form-function per note below)
├── 01-phase-docs/
├── 02-schemas/
├── 03-templates/
├── 04-filled-examples/
├── 05-crawley/                (empty; for patcher-agent to fill)
├── 06-cross-cutting/          (13 relative symlinks to ../../_shared/<file>)
└── 07-uncategorized/          (files not fitting taxonomy; see per-folder notes)
```

---

## Symlinks (06-cross-cutting/)

9 folders × 13 symlinks = **117 symlinks**, all created via `ln -s "../../_shared/<file>"` (relative POSIX). In KB-4 (which has one extra directory layer inside `01-phase-docs/cornell|crawley/`), the top-level `06-cross-cutting/` still uses `../../_shared/` because `06-cross-cutting/` is at depth 2 from `13-Knowledge-banks-deepened/`, identical to the other 8 folders.

**Spot-verification:** `cat <symlink>` on `1-defining-scope/06-cross-cutting/cap_theorem.md`, `1-defining-scope/06-cross-cutting/resiliency-patterns-kb.md`, `8-risk/06-cross-cutting/observability-kb.md`, `9-stacks-atlas/06-cross-cutting/resiliency-patterns-kb.md` all returned canonical content from `_shared/` pool.

---

## Per-Folder Moves & `07-uncategorized/` Justifications

### KB-1 `1-defining-scope/`
- `00-Defining-Scope-Master-Prompt.md` → `00-master-prompt.md`
- 7 phase docs (`01..07-*.md`) → `01-phase-docs/`
- `phase_artifact.schema.json`, `system_scope_summary.schema.json` → `02-schemas/`
- 13 cross-cutting symlinks → `06-cross-cutting/`
- **07-uncategorized:** `GLOSSARY.md`, `REVIEW-PLAN.md` — glossary and review plan are KB infra, not phase/schema/template/example per EC-0.2.1 taxonomy.

### KB-2 `2-requirements/`
- `00-Requirements-Builder-Master-Prompt.md` → `00-master-prompt.md`
- 16 phase docs (`01..16-*.md`) → `01-phase-docs/`
- 3 `.schema.json` (UCBD, Requirements-table, Requirement_Constants_Definition) → `02-schemas/`
- 3 template `.xlsx` → `03-templates/`
- 3 filled-test `.xlsx` → `04-filled-examples/`
- 2 Crawley chapter notes (ch11 needs-to-goals, ch13 decomposition heuristics) → `05-crawley/`
- 13 cross-cutting symlinks → `06-cross-cutting/`
- **07-uncategorized:** `GLOSSARY.md`, `REVIEW-PLAN.md`, `generate_ucbd_pptx.py`, `_ucbd_helpers.py`, `__pycache__/` — Python helpers + build-time pycache + non-taxonomy KB infra.

### KB-3 `3-ffbd/`
- `00_MODULE-OVERVIEW.md` → `00-master-prompt.md`
- 16 phase/reference docs (`00A_INGEST`, `01_FFBD-FOUNDATIONS` .. `11_FROM-FFBD-TO-DECISION-MATRIX`, `DELIVERABLES-AND-GUARDRAILS`, `FORMATTING-RULES`, `PYTHON-SCRIPT-GUIDE`, `reference-blocks`) → `01-phase-docs/`
- `FFBD_Template - MASTER.pdf/pptx`, `WRITTEN-ANSWERS-TEMPLATE.md` → `03-templates/`
- 13 cross-cutting symlinks → `06-cross-cutting/`
- **07-uncategorized:** `GLOSSARY.md`, `create_ffbd_thg_v3.py`, `generate_ffbd_fixes.py`, 4 raw `.txt` source files (`03. Creating Functional Blocks.txt` etc.), 2 early-draft intro markdown (`1. INTRO-*`, `2.FFBD Overview-Plus instructions.md`) — Python generators + pre-normalization source material + glossary.

### KB-4 `4-decision-net-crawley-on-cornell/` (MERGE)
- From `4-assess-software-performance-kb/`: `00 - Module Overview.md` → `00-master-prompt.md`; 19 Cornell phase docs (`01..18` + `LLM-FILL-INSTRUCTIONS.md`) → `01-phase-docs/cornell/`
- From `4-decision-network-mit-crawley/`: 3 Crawley foundation docs (Decision-Network-Foundations, Tradespace-Pareto-Sensitivity, Optimization-Patterns) → `01-phase-docs/crawley/`
- `decision-matrix-template.schema.json` → `02-schemas/`
- `decision-matrix-template.xlsx`, `decision-matrix-template-sample.pdf` → `03-templates/`
- `EXAMPLE-decision-matrix.xlsx`, `decision-matrix_FILLED_TEST.xlsx` → `04-filled-examples/`
- 13 cross-cutting symlinks → `06-cross-cutting/`
- **07-uncategorized:** `GLOSSARY.md`

### KB-5 `5-form-function/`
- 5 phase docs (`01-Phase-1-Form-Taxonomy` .. `05-Phase-5-Concept-Expansion`) → `01-phase-docs/`
- 13 cross-cutting symlinks → `06-cross-cutting/`
- **07-uncategorized:** `GLOSSARY-crawley.md`
- ⚠️ **Empty 00-master-prompt.md stub created.** Source folder had no master-prompt file; EC-0.2.1 requires the file to exist at root. Downstream authoring (patcher agent) must populate this stub with an actual Form-Function master prompt. Flagged for follow-up.

### KB-6 `6-hoq/` (renumber 5 → 6)
- `00_QFD-OVERVIEW-AND-TERMINOLOGY.md` → `00-master-prompt.md`
- 12 phase docs (`01_FRONT-PORCH` .. `10_FINAL-REVIEW`, `LLM-FILL-INSTRUCTIONS`, `TEMPLATE_CELL-MAP`) → `01-phase-docs/`
- `QFD-Template.schema.json` → `02-schemas/`
- `QFD-Template.xlsx` → `03-templates/`
- `QFD_FILLED_TEST.xlsx` → `04-filled-examples/`
- 13 cross-cutting symlinks → `06-cross-cutting/`
- **07-uncategorized:** `GLOSSARY.md`, `full-instructions.md`, `full-instructions.pdf`, `full-instructions_artifacts/` (70 PNGs from PDF page extraction; auditor flagged ~59 as internal dedup candidates with sha256-keyed filenames — deferred per auditor note, out of §0.2.1 scope).

### KB-7 `7-interfaces/` (renumber 6 → 7)
- `00 - Module Overview.md` → `00-master-prompt.md`
- 11 phase docs (`01 - Why Interfaces Matter` .. `11 - Interface Matrix Enhancements`) → `01-phase-docs/`
- `interface-matrix-template.json`, `n2-chart-template.json` → `02-schemas/`
- 5 template files (`interface-Matrix-Template.xlsx`, `n-squared-chart.xlsx`, `Data-flow-diagram.pptx`, `sequence-diagram.pptx`, `sequence-diagram-sample-template.pptx`) → `03-templates/`
- 9 filled examples (basic variants, advanced sample, ecommerce n2) → `04-filled-examples/`
- 13 cross-cutting symlinks → `06-cross-cutting/`
- **07-uncategorized:** `GLOSSARY.md`, `REVIEW-PLAN.md`, 5 Python generators (`create_dfd_thg_v2.py`, `create_n2_chart.py`, `create_sequence_thg.py`, `interface_matrix_from_json.py`, `n2_from_json.py`), 3 `.docx` reference articles, `Module 1.txt` — Python generators + non-taxonomy reference material.

### KB-8 `8-risk/` (renumber 7 → 8)
- `00-FMEA-Master-Prompt.md` → `00-master-prompt.md`
- 10 phase docs (`01-Reference-Sample-and-Templates` .. `09-Phase-7-Detectability-Optional`, `tool-steps-to-build-FMEA.md`) → `01-phase-docs/`
- `tool-steps-to-build-FMEA.json` → `02-schemas/`
- `FMEA-sample.xlsx`, `FMEA-sample copy.pdf` → `03-templates/`
- `FMEA-sample.json` → `04-filled-examples/`
- 13 cross-cutting symlinks → `06-cross-cutting/`
- **07-uncategorized:** none — cleanest folder; all source files cleanly classified.

### KB-9 `9-stacks-atlas/` (CROSS-TREE CONSOLIDATION)
- Source: `plans/8-stacks-and-priors-atlas/` (untracked → now tracked in KB tree)
- `README.md` → `00-master-prompt.md` (pipeline intro serves as master prompt)
- `PIPELINE.md`, `SOURCES.md`, `CHANGELOG.md`, `archetypes/` → `01-phase-docs/`
- `companies/` (11 company markdown entries: airbnb, anthropic, cloudflare, discord, dropbox, etsy, linkedin, netflix, shopify, stripe, uber), `indexes/` → `04-filled-examples/`
- 13 cross-cutting symlinks → `06-cross-cutting/`
- **07-uncategorized:** `GLOSSARY.md`, `scraper-audit.log`, `raw/`, `rejected/` — supporting-pipeline artifacts, not phase material.
- ⚠️ **Cross-tree move used `mv` + `git add`** (not `git mv`) because source was untracked (`??` in `git status`). No history to preserve. Target now fully tracked by git.
- Does NOT touch `apps/product-helper/lib/langchain/schemas/atlas/` (T4/T8 schema territory).

---

## Final Tree (depth 2)

```
apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/
├── _shared/                                   (13 canonical cross-cutting KBs)
├── 1-defining-scope/
├── 2-requirements/
├── 3-ffbd/
├── 4-decision-net-crawley-on-cornell/
├── 5-form-function/
├── 6-hoq/
├── 7-interfaces/
├── 8-risk/
└── 9-stacks-atlas/
```

`_shared/` contents:
```
_shared/
├── api-design-sys-design-kb.md
├── caching-system-design-kb.md
├── cap_theorem.md
├── cdn-networking-kb.md
├── data-model-kb.md
├── deployment-release-cicd-kb.md
├── load-balancing-kb.md
├── maintainability-kb.md
├── message-queues-kb.md
├── Multithreading-vs-Multiprocessing.md
├── observability-kb.md
├── resiliency-patterns-kb.md                  (*** renamed from resilliency-patterns-kb.md)
└── software_architecture_system.md
```

Each `N-<slug>/` conforms to the EC-0.2.1 layout shown earlier.

---

## Outstanding Items for Downstream Agents

1. **Patcher agent:** populate `05-crawley/` in every KB-1..8 and KB-9 with Crawley cross-reference material.
2. **5-form-function/00-master-prompt.md** is an empty stub — requires authoring.
3. **6-hoq/07-uncategorized/full-instructions_artifacts/** — ~59 internal PNG duplicates with sha256-keyed filenames (auditor-flagged, deferred; can be deduped without content loss since sha256 is in the filename).
4. **All ingesters / searchers** — update any code paths that hard-coded the pre-T9 KB folder names (e.g., `5-HoQ_for_software_sys_design`, `6-software-define-interface-LLM-kb`, `7-identify-evaluate-risk-software`, `plans/8-stacks-and-priors-atlas`) to use the new names. T8 `c1v-reorg` mapper artifacts may need a refresh.
5. **Search filter per `kbSource`** — per-folder embeddings may need to resolve `06-cross-cutting/` symlinks to a canonical `_shared/` source to avoid re-embedding the same content 9 times. Recommend embeddings pipeline treats `_shared/` as the authoritative source and ignores symlinked copies.

---

David Ancor
