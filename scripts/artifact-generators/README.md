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
