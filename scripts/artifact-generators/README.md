# Artifact Generators

Uniform Python generator suite for c1v pipeline artifacts. Authoritative
spec: [`plans/c1v-MIT-Crawley-Cornell.v2.md §15`](../../plans/c1v-MIT-Crawley-Cornell.v2.md).

## Contract

Every generator accepts an `ArtifactGeneratorInput` JSON file as `argv[1]`
(see [`types.ts`](./types.ts)), validates `instanceJson` against
`schemaRef`, renders outputs into `outputDir`, appends a line to
`<outputDir>/artifacts.manifest.jsonl`, and emits an
`ArtifactGeneratorOutput` JSON on stdout.

```bash
python3 scripts/artifact-generators/gen-ffbd.py /tmp/ffbd-input.json
```

## Layout

```
scripts/artifact-generators/
├── types.ts                 # TypeScript I/O contracts (canonical)
├── requirements.txt         # pinned Python deps
├── common/
│   ├── schema_loader.py     # jsonschema resolver + validator
│   ├── manifest_writer.py   # atomic JSONL append (flock + O_APPEND)
│   └── runner.py            # shared harness — validate → render → hash → emit
├── gen-ffbd.py              # migrator (T10) — this PR
├── gen-ucbd.py              # migrator
├── gen-n2.py                # migrator (3→1 dedup)
├── gen-sequence.py          # migrator (2→1 dedup)
├── gen-dfd.py               # migrator
├── gen-interfaces.py        # migrator (2→1 dedup; options.variant)
├── gen-qfd.py               # migrator (openpyxl; no AppleScript)
├── gen-fmea.py              # migrator (2→1 merge: stoplights as sheet)
├── gen-decision-net.py      # extender (T10 — separate PR)
├── gen-form-function.py     # extender
├── gen-cost-curves.py       # extender
├── gen-latency-chain.py     # extender
└── gen-arch-recommendation.py # extender
```

## Authoring a new generator

```python
from pathlib import Path
from common.runner import run_generator

def render(instance, output_dir: Path, targets, options, warnings):
    outputs = []
    if 'xlsx' in targets:
        p = output_dir / 'foo.xlsx'
        # ... write the file ...
        outputs.append({'target': 'xlsx', 'path': str(p)})
    return outputs

if __name__ == '__main__':
    raise SystemExit(run_generator(generator_name='gen-foo', render_fn=render))
```

The runner handles: schema validation, manifest emission, sha256 + byte
counting, structured error reporting by phase (`validate` / `render` /
`write`), and stdout protocol.

## Mermaid rasterization

The self-application deck assembler (`assemble-master-pptx.py`) needs
Mermaid diagrams as PNGs. Use [`rasterize-mermaid.py`](./rasterize-mermaid.py)
to convert `.mmd` files or Markdown files with embedded ` ```mermaid `
fences into PNG/SVG.

**Prerequisite:** the Mermaid CLI (`mmdc`) must be on `PATH`. Install
globally:

```bash
npm install -g @mermaid-js/mermaid-cli
mmdc --version  # verify; tested with 11.12.0
```

Not pinned in this repo's `package.json` because `@mermaid-js/mermaid-cli`
ships ~200 MB of Puppeteer + Chromium and is only needed at deck-build
time, not for app runtime. The CI workflow installs it on demand
(see `.github/workflows/build-self-application-deck.yml`).

Usage:

```bash
# Single .mmd file
pnpm tsx scripts/artifact-generators/rasterize-mermaid.ts \
  --input system-design/kb-upgrade-v2/module-7-interfaces/data_flow_diagram.mmd \
  --output-dir build/mermaid-png \
  --prefix m7-data-flow

# Markdown file with embedded mermaid blocks (each block emits one PNG)
pnpm tsx scripts/artifact-generators/rasterize-mermaid.ts \
  --input system-design/kb-upgrade-v2/module-2-requirements/M2-sysml-diagrams.md \
  --output-dir build/mermaid-png \
  --prefix m2-sysml
```

Output theme is neutral (white background, black/grey palette) — exports
do not carry brand styling per project convention.

## Self-application deck assembly

The `assemblers/` subdirectory holds scripts that combine per-module
generator outputs into the consolidated portfolio deliverables:

- `assemble-master-pptx.py` — ~85-slide PPT walking M1→M8 + synthesis
- `assemble-master-xlsx.py` — 17-sheet workbook of all matrix artifacts
- `build-self-application-deck.ts` — TS orchestrator that drives
  rasterize → per-module gen → assemble in dependency order

See [`plans/dogfooding-artifact-deck.md`](../../plans/dogfooding-artifact-deck.md)
for the design contract.
