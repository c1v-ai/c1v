# T10 Extender — New Generators Spec

Authored by: Agent 2 (extender) on team `c1v-artifact-centralization` (T10).
Spec source: `plans/c1v-MIT-Crawley-Cornell.v2.md` §15.7.
Commits: land one generator per commit via `git commit --only <path>`.

All generators use `scripts/artifact-generators/common/runner.py` harness.
I/O contract per `scripts/artifact-generators/types.ts` (v2 §15.3).

Pinned Python deps (from `requirements.txt`):
- `jsonschema==4.23.0`, `openpyxl==3.1.5`, `python-pptx==1.0.2`
- `matplotlib==3.9.2`, `seaborn==0.13.2`, `networkx==3.3`, `graphviz==0.20.3`
- `weasyprint==62.3` (pinned to 62.x — 63+ has breaking API changes)

---

## 1. `gen-decision-net.py`

Renders Crawley decision-network artifact.

| Aspect | Value |
|---|---|
| Input schemaRef | `decision-network.schema.json` (canonical, once T4b lands) / `decision-network.stub.schema.json` (permissive stub used Wave-1) |
| Schema version | v1 |
| Targets | `xlsx`, `svg` (one target producing 4 variants) |
| Libs | `openpyxl`, `matplotlib`, `networkx` (optional `graphviz` for DAG layout via `graphviz_layout`) |

Outputs (per invoke):
- `<base>.xlsx` — scoring matrix: rows = alternatives, cols = criteria + Utility + Cost. Winner prefixed with `★`.
- `<base>.dag.svg` — decision DAG (decisions as blue squares, alternatives as circles, winner orange-filled).
- `<base>.pareto.svg` — scatter: x=cost, y=utility. Winner highlighted.
- `<base>.sensitivity.svg` — heatmap: rows=alternatives, cols=criteria, cell=Δscore-per-unit-weight.
- `<base>.utility-bars.svg` — bar chart of utility per alternative.

Missing sections degrade gracefully with warnings; missing sections do not abort the run.

**Stubbed behavior:** All schema validation permissive until T4b lands. Missing `scores`, `utilities`, `sensitivity`, or `costs` emit warnings and skip that artifact variant.

---

## 2. `gen-form-function.py`

Renders Crawley form-function mapping artifact.

| Aspect | Value |
|---|---|
| Input schemaRef | `form-function-map.schema.json` (canonical, once T5 lands) / `form-function-map.stub.schema.json` (Wave-1 stub) |
| Schema version | v1 |
| Targets | `xlsx`, `svg`, `mmd` |
| Libs | `openpyxl`, `matplotlib`, `networkx` |

Outputs:
- `<base>.xlsx` — function × form Pugh-style quality matrix (1-5 Likert).
- `<base>.bipartite.svg` — bipartite graph function↔form; edge width encodes quality.
- `<base>.concept-tree.mmd` — Mermaid `graph LR` of Crawley concept expansion: Function_Branch and Form_Branch subgraphs.

**Stubbed behavior:** Permissive schema. Missing `conceptExpansion` skips mmd with warn.

---

## 3. `gen-cost-curves.py`

Renders KB-9 Atlas-sourced cost curves for winner's infra choices.

| Aspect | Value |
|---|---|
| Input schemaRef | Accepts an instance with `winnerInfra[]` (subset of decision-network output). Wave-1 uses `decision-network.stub.schema.json`. |
| Schema version | v1 |
| Targets | `svg` (one per infra component) |
| Libs | `matplotlib` |

Outputs:
- `<base>.<component>_<choice>.svg` — log-log plot, x=DAU, y=$/month.

**Atlas path resolution** (post-T9):
- `apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/9-stacks-atlas/`

**Atlas entry shape consumed:** entries with fields `component`, `choice`, `points[{dau, monthlyUsd}]`, searched recursively through `companies/**/*.json`. Match is case-insensitive by `component` + `choice`.

**Stubbed behavior:** When no atlas entry matches, a linear $0.05/DAU/month stub curve is plotted and a WARN emitted. Stub plots use gray `x` markers vs solid-fill tangerine for real curves.

---

## 4. `gen-latency-chain.py`

Renders M7.b interface latency budget allocation.

| Aspect | Value |
|---|---|
| Input schemaRef | `interfaces.schema.json` (existing) |
| Schema version | v1 |
| Targets | `svg` |
| Libs | `matplotlib`, `numpy` (ships with matplotlib) |

Outputs:
- `<base>.stacked.svg` — stacked bar per interface. Stack order: p50, p95, p99, p99.99. Values are rendered as DELTAS between tiers so the bar total height equals the p99.99 budget; each segment visualizes incremental budget allocated to that tier.

**Stubbed behavior:** Missing tier fields per interface treated as zero with WARN listing affected interfaces.

---

## 5. `gen-arch-recommendation.py`

Final architecture recommendation deliverable.

| Aspect | Value |
|---|---|
| Input schemaRef | `architecture-recommendation.schema.json` (existing under `generated/synthesis/`) |
| Schema version | v1 |
| Targets | `html`, `pdf`, `json-enriched` |
| Libs | stdlib (`base64`, `json`, `hashlib`); `weasyprint==62.3` for pdf |

Outputs:
- `<base>.html` — single-file viewer. **All CSS inline**, all sibling `.svg` inlined as raw XML, `.mmd` shown as source in `<pre>`. **Opens correctly via `file://`** with no external CDN dependencies.
- `<base>.pdf` — rendered from same HTML via weasyprint.
- `<base>.json-enriched.json` — denormalized bundle: recommendation instance + embedded svg/mmd/json contents + sha256 refs for binaries + parsed `artifacts.manifest.jsonl` lines. Intended for downstream CLI consumers.

**Branding inline:** CSS uses brand tokens Firefly #0B2C29, Porcelain #FBFCFC, Tangerine #F18F01, Danube #5998C5. Fonts: `'Space Grotesk'` for headings (falls back to Helvetica/Arial when not installed), `Consolas` for body. No font @import — uses system fallbacks.

**Stubbed behavior:** If `outputDir` has no sibling svg/mmd artifacts, html emits a warning and lacks embedded figures but still renders. If weasyprint import fails, pdf is skipped with warn (does not fail the run).

---

## Shared infrastructure added

- `scripts/artifact-generators/common/extender_init.py` — registers
  `scripts/artifact-generators/common/schemas/` as an additional schema root
  with `schema_loader.DEFAULT_SCHEMA_ROOTS`. Each extender generator imports it
  before `common.runner` so stubs resolve without touching T8 schema territory.
- `scripts/artifact-generators/common/schemas/decision-network.stub.schema.json`
  and `form-function-map.stub.schema.json` — permissive Wave-1 stubs
  (`{"type": "object", "additionalProperties": true}`).

When T4b/T5 land canonical schemas, callers should switch `schemaRef` and these
stubs can be deleted in a follow-up cleanup commit.

---

## Commit log (this subtask)

Each generator landed as its own commit using `git commit --only`:
- `feat(t10): add gen-decision-net.py for Crawley decision-network`
- `feat(t10): add gen-form-function.py for Crawley form-function-map`
- `feat(t10): add gen-cost-curves.py for Crawley cost-curves`
- `feat(t10): add gen-latency-chain.py for M7.b interface latency budgets`
- `feat(t10): add gen-arch-recommendation.py for final arch bundle`
- `docs(t10): new-generators-spec.md for extender deliverables`
