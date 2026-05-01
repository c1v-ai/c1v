# c1v Self-Application — Portfolio Artifacts

This directory holds the portfolio-grade renderings of the c1v dogfooding
run: every M1→M8 + synthesis JSON artifact in
[`system-design/kb-upgrade-v2/`](../../../system-design/kb-upgrade-v2/) and
[`.planning/runs/self-application/`](../../../.planning/runs/self-application/),
flattened into PPT slides + Excel sheets that a human can scroll through.

The methodology argument backing these is at
[`/about/methodology`](../../../system-design/kb-upgrade-v2/METHODOLOGY-CORRECTION.md)
(also served on the live site).

---

## What's here

| File | Slides / Sheets | Contents |
|---|---|---|
| **`c1v-self-application.pptx`** | **63 slides** | Master deck — cover + 9 section headers + per-module slides. |
| **`c1v-self-application.xlsx`** | **58 sheets** | Master workbook — README index + every per-module matrix. |
| `synthesis.pptx` | 14 slides | Synthesis-only deck (cover + recommendation + Pareto + 5 Mermaid diagrams + risks + next steps). |
| `synthesis.xlsx` | 7 sheets | Synthesis-only workbook (Summary / Decisions / Pareto / Risks / LatencyBudget / ResidualRisk / NextSteps). |
| `M1-data-flows.pptx` / `.xlsx` | 2 slides / 1 sheet | M1 boundary + 15 data flows. |
| `M2-UCBDs.pptx` | 14 slides | M2 — 6 Use Case Behavioral Diagrams + 6 requirement lists + summary. |
| `M2-requirements.xlsx` | 3 sheets | M2 — 99 requirements / 28 constants / 26 NFRs as flat tables. |
| `M3-ffbd.pptx` / `.xlsx` | 4 slides / 5 sheets | M3 — 7 functions / 14 arrows / 3 logic gates / 5 data blocks / 3 cross-cutting. |
| `M4-decision-network.pptx` / `.xlsx` | 4 slides / 4 sheets | M4 — 4 decision nodes + 48 alternative-criterion scores + 48-entry decision audit. |
| `M5-form-function.pptx` / `.xlsx` | 4 slides / 6 sheets | M5 — Crawley form/function inventories + concept-mapping matrix + scoring + operand-process catalog. |
| `mermaid/synth-*.mmd` | 5 sources | Mermaid blocks extracted from the synthesis JSON. |
| `mermaid-png/synth-*.png` | 5 PNGs | Rasterized via `mmdc` (neutral B&W theme). |

> Output theme is **neutral B&W** per project convention — exports do not
> carry brand styling.

---

## Re-rendering

Everything here is regenerable from the source JSON. From repo root:

```bash
# 1. Mermaid CLI prereq (one-time, global)
npm install -g @mermaid-js/mermaid-cli

# 2. Activate the artifact-generator venv
source scripts/artifact-generators/.venv/bin/activate

# 3. Per-module renders (independent, can run in parallel)
python scripts/artifact-generators/gen-self-app-flat-tables.py \
  --output-dir plans/dogfooding-artifact-deck/portfolio
python scripts/artifact-generators/gen-self-app-data-slides.py \
  --output-dir plans/dogfooding-artifact-deck/portfolio
python scripts/artifact-generators/gen-self-app-synthesis.py \
  --input .planning/runs/self-application/synthesis/architecture_recommendation.v1.json \
  --output-dir plans/dogfooding-artifact-deck/portfolio
python apps/product-helper/.planning/phases/14-artifact-publishing-json-excel-ppt-pdf/2-dev-sys-reqs-for-kb-llm-software/generate_ucbd_pptx.py \
  --project system-design/kb-upgrade-v2/module-2-requirements \
  --output plans/dogfooding-artifact-deck/portfolio/M2-UCBDs.pptx

# 4. Master concat
python scripts/artifact-generators/assemblers/assemble-master-pptx.py \
  --manifest scripts/artifact-generators/assemblers/master-deck.manifest.json \
  --output plans/dogfooding-artifact-deck/portfolio/c1v-self-application.pptx
python scripts/artifact-generators/assemblers/assemble-master-xlsx.py \
  --manifest scripts/artifact-generators/assemblers/master-workbook.manifest.json \
  --output plans/dogfooding-artifact-deck/portfolio/c1v-self-application.xlsx
```

Or, after Step 8 of the plan ships, a single command:

```bash
pnpm tsx scripts/artifact-generators/build-self-application-deck.ts
```

---

## Provenance

The master deck and workbook are the *terminal* product of a chain that
starts at the methodology paper:

```
METHODOLOGY-CORRECTION.md           ← argument (Apr 20, 2026)
        ↓
system-design/kb-upgrade-v2/M1..M8/  ← per-module dogfooding artifacts
.planning/runs/self-application/     ← synthesis run (M6 HoQ + capstone)
        ↓
gen-self-app-* + assemblers          ← these scripts
        ↓
plans/dogfooding-artifact-deck/portfolio/    ← you are here
```

Every slide footer / sheet cell traces back to a JSON path in the chain.
Re-running the pipeline from scratch produces byte-stable outputs as
long as the source JSONs do not change (deterministic by construction —
no LLM calls in the rendering stage).

---

## Open gaps

These don't block review but are tracked:

- **Cover-slide doubling** in the master deck: the master assembler
  inserts a section header per module, then each per-module deck has
  its own cover slide as the first slide, so M1 / M3 / M4 / M5 / M8
  show two cover-style slides in a row. Fix is a 1-line skip in
  `_copy_slide` for slides that match the per-module cover pattern.
- **M6 PPT slides** missing — the QFD data lives in the workbook
  (`M6_QFD_v2_*` + `M6_HoQ_run_*` sheets) but the master deck only has
  a section header for M6. Adding HoQ-from-JSON slides is a follow-up.
- **M3 visual FFBD diagrams** — the JSON references 7 `.mmd` files that
  do not yet exist on disk
  ([`module-3-ffbd/ffbd_*.mmd`](../../../system-design/kb-upgrade-v2/module-3-ffbd/)).
  Once those land, `rasterize-mermaid.py` + `gen-self-app-data-slides.py`
  pick them up automatically.
- **CI workflow** to rebuild on push: deferred (Step 9 of the plan).
- **`/about/methodology/evidence` page** linking the rendered artifacts
  from the live site: deferred (Step 10 of the plan).
