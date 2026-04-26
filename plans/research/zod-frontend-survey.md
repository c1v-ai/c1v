# Zod → Frontend Rendering Survey (c1v, Apr 21 2026)

**Brief:** fastest path from Zod schemas (single source of truth) → agents → KB → frontend → PPT/Excel export, inside Next.js 15 + shadcn + Tailwind 4.

**Current state (grounded in code):**
- ~40 phase schemas in `apps/product-helper/lib/langchain/schemas/` (module-2, module-3, module-4).
- `lib/langchain/schemas/zod-to-json.ts` round-trips Zod → strict draft-07 JSON Schema (`additionalProperties:false`, `$refStrategy:'none'`, `strictUnions:true`).
- `.describe("x-ui-surface=page:/... | section:... | internal:...")` drives frontend routing from schema metadata.
- Already using shadcn + Radix; Mermaid for diagrams; jest tests; LangChain/LangGraph for agents.
- Auth = custom JWT (not NextAuth), middleware.ts gates routes.

---

## TL;DR — Recommended Stack (4 libraries)

| Role | Pick | Why |
|------|------|-----|
| **Form rendering** | `react-hook-form` + `zodResolver` + **@autoform/react (vantezzen)** | shadcn-native, bundle-cheap, you keep control for bespoke surfaces (matrix, Pareto) and let AutoForm carry the boring 80% driven by `x-ui-surface`. |
| **Graph / matrix viz** | `@xyflow/react` (React Flow) + keep **Mermaid** for static AI-generated diagrams | React Flow = interactive decision networks / Pareto / Form-Function matrices. Mermaid stays for agent-emitted architecture diagrams. Cytoscape is overkill. |
| **PPT + Excel export** | `pptxgenjs` + `exceljs` on Vercel Node runtime | Both are serverless-friendly, pptxgenjs has zero runtime deps and dual ESM/CJS; exceljs streams large sheets. Trigger off artifact-save webhook. |
| **Agent ↔ frontend contract** | **Stay on Zod**, keep `zod-to-strict-json-schema`, adopt **Vercel `json-render` pattern** (component catalog registered by Zod) for future AI-assembled UIs | Don't migrate to ArkType now — too many agents, schemas, and tests coupled to Zod. Adopt json-render semantics without the dep: `x-ui-surface` already is your catalog pointer. |

**Do NOT adopt:** tRPC, Zodios, rjsf, Conform, ArkType, Formik — reasons below.

**Diagram-design repo:** it's a **Claude Code skill for editorial HTML+SVG diagrams** (13 templates, WCAG-checked, palette-aware). Not a Zod/UI library. Value: use it for **marketing / PRD export diagrams** (crisp, editorial) as an alternative to Mermaid-slop in exported decks. Install via Claude Code plugin marketplace. Zero integration into runtime — it's a dev-time skill.

---

## Evaluation Matrix

Cols: **Bundle** / **NextJS15-fit** / **shadcn-fit** / **Renders matrix/heatmap/graph?** / **Preserves `x-ui-surface`?** / **Export-pipeline fit** / **Verdict**

| Option | Bundle | N15 | shadcn | Viz | x-ui-surface | Export | Verdict |
|---|---|---|---|---|---|---|---|
| **react-hook-form + zodResolver** (current) | ~9KB gz | A+ | A+ (shadcn docs are literally this) | no (forms only) | yes (read `describe()` yourself) | indirect | **KEEP** as form core |
| **@autoform/react (vantezzen)** | ~25KB gz | A | A+ (shadcn integration official) | no | yes (schema-driven, reads metadata) | indirect | **ADOPT** for generic CRUD phases |
| **Conform + @conform-to/zod** | ~15KB gz | A+ (Server Actions first-class, progressive enhancement) | B (manual wire-up) | no | partial | indirect | skip — RHF already covers Next 15 SA + your JWT flow |
| **react-jsonschema-form (rjsf)** | **~175KB** | B | C (theme wrappers needed) | partial (via uiSchema) | NO (JSON Schema loses Zod metadata unless you custom-map) | indirect | **REJECT** — too heavy, generic UX, kills the shadcn look |
| **tRPC** | ~12KB client | A | N/A | no | no | no | **REJECT** — your API is LangChain-streamed + MCP; tRPC adds a layer, doesn't remove one. You already have type-safety via Zod-inferred types. |
| **Zodios** | ~20KB | B | N/A | no | no | no | **REJECT** — REST-client flavored, misaligned with streaming LLM + Server Actions |
| **Formik + Zod** | ~13KB | C (controlled inputs = re-renders) | B | no | no | no | **REJECT** — legacy, slower than RHF |
| **ArkType** | ~12KB | A | A | no | **breaks** (no `.describe()` equivalent semantics; would require rewrite of 40+ schemas + `zod-to-json.ts` + all LangChain structured-output wiring) | no | **REJECT for now** — 3-4x faster than Zod but migration cost >> perf win. Revisit if validation becomes a hot path. |
| **zod-to-json-schema / zod-to-ts** | ~5KB | A+ | N/A | no | yes | yes (codegen) | **KEEP** — already core. |
| **React Flow (@xyflow/react)** | ~45KB gz | A+ | A (Tailwind-friendly) | **YES** native | yes (via node `data`) | yes (export to PNG/SVG; feed into pptxgenjs) | **ADOPT** for decision networks, Pareto, matrices |
| **Cytoscape.js** | ~400KB | B | C | yes (heavy graph theory) | indirect | partial | **REJECT** — overkill; React Flow wins for UX in a SaaS |
| **Mermaid** | ~1MB initial, code-split | A | A (already wired) | text-only | n/a | yes (SVG→image→PPT) | **KEEP** for agent-emitted architecture diagrams |
| **pptxgenjs** | ~350KB server | A+ (explicit Vercel support, zero deps, ESM+CJS) | n/a | embeds images/charts | reads JSON | **YES** | **ADOPT** |
| **exceljs** | ~800KB server | A (streams large sheets) | n/a | native charts | reads JSON | **YES** | **ADOPT** |
| **officegen** | — | C (abandoned-ish) | n/a | — | — | — | **REJECT** |
| **SheetJS (xlsx)** | ~300KB | A | n/a | limited formatting | — | yes | skip — exceljs has richer formatting for PRD exports |
| **docx** | ~250KB | A | n/a | — | — | yes | **OPTIONAL** — add when Word export requested |
| **Vercel `json-render`** (trending, Jan 2026, 13k★) | ~30KB | A+ | ships 36 shadcn components OOTB | partial (what you register) | **YES (Zod-native catalog)** | partial | **PATTERN ONLY** — adopt the semantics (schema-registered component catalog, AI emits JSON tree), don't add the dep until c1v has AI-assembled surfaces beyond artifacts |
| **cathrynlavery/diagram-design** | dev-time skill (0KB runtime) | n/a | n/a | 13 editorial HTML+SVG diagram templates | n/a | **YES** for exported decks | **ADOPT** as dev-time skill for PRD export diagrams & marketing |

---

## Top-3 Per Category

### (A) Form Rendering
1. **react-hook-form + zodResolver** — keep as core. Shadcn is built around it.
2. **@autoform/react (vantezzen)** — drop-in for 80% of phase-driven CRUD forms; reads schema, emits shadcn inputs. Your `x-ui-surface` annotation survives.
3. **Conform** — runner-up only if you lean hard into Server Actions + progressive enhancement. For c1v's chat-panel-driven intake, RHF wins.

### (B) Graph / Matrix Visualization
1. **React Flow (`@xyflow/react`)** — decision networks, FFBD, Form-Function matrix, Pareto frontier. Fully custom nodes = you can render a heatmap cell as a node.
2. **Mermaid** — keep for agent-emitted context/use-case diagrams (already wired in `lib/diagrams/` and `components/diagrams/`).
3. **Cathryn Lavery diagram-design skill** — editorial HTML+SVG for PRD export deck (crisp, WCAG-checked, palette-aware). Dev-time, not runtime.

### (C) PPT + Excel Export Pipeline
1. **pptxgenjs** (Vercel Node runtime, explicit serverless support, ESM+CJS, 0 deps).
2. **exceljs** (streaming, rich cell formatting, charts — better for Form-Function matrix export than SheetJS).
3. **docx** (add later if Word export requested).

### (D) Agent ↔ Frontend Zod-Locked Contract
1. **Keep Zod + `zod-to-strict-json-schema`** — locked, tested, 40+ phase schemas depend on it.
2. **Adopt Vercel json-render pattern** (semantics, not lib) — your `x-ui-surface` already is a primitive form of this. Formalize: every frontend component registers a Zod schema; agents emit JSON that matches; renderer dispatches.
3. **LangChain structured-output via Zod** (already in use) — no change.

---

## Integration Plan (sequence — 2 short phases)

**Phase A (1-2 days):**
- Install `@autoform/react` + `@autoform/zod` + `@autoform/shadcn`.
- Wire a `SchemaSurface` component that reads `x-ui-surface=page:/...` from Zod `.describe()`, looks up the correct phase schema, and either (a) routes to a hand-built surface (matrix, Pareto, FFBD) or (b) falls back to AutoForm for plain CRUD phases.
- Regenerate schemas: `pnpm tsx lib/langchain/schemas/generate-all.ts`.

**Phase B (2-3 days):**
- Install `@xyflow/react`.
- Build `<DecisionNetworkCanvas>`, `<FormFunctionMatrix>`, `<ParetoFrontier>` — each a React Flow custom-nodes layout, fed by module-4 Decision Matrix schemas.
- Add `/api/export/{projectId}/pptx` and `/api/export/{projectId}/xlsx` route handlers using pptxgenjs / exceljs. Trigger on artifact-save via existing webhook hook in `lib/langchain/`.
- Optional: install `diagram-design` Claude Code skill globally for dev-time PRD export diagrams.

**Do NOT touch:** Zod itself, `zod-to-json.ts`, the schema inventory, existing RHF forms. This is additive.

---

## 300-Word Summary

c1v's best path to a Zod-locked source-of-truth frontend is to **stop shopping** for a new validator or form framework — Zod, `zod-to-json-schema`, and react-hook-form + zodResolver are already the 2026 consensus stack for Next.js 15 + shadcn. The three high-value additions are (1) **@autoform/react (vantezzen)** to drop in schema-driven CRUD forms for the long tail of phase surfaces, letting your `x-ui-surface=` `.describe()` convention survive intact; (2) **React Flow (@xyflow/react)** for the interactive decision-network, Form-Function matrix, and Pareto-frontier visuals that the c1v methodology demands and that Mermaid cannot render; and (3) a **pptxgenjs + exceljs** export pipeline on Vercel's Node runtime, triggered on artifact-save, fed by the same JSON-Schema intermediate that already powers LangChain structured output. Keep Mermaid for agent-emitted architecture diagrams. The flagged `cathrynlavery/diagram-design` repo is **not** a Zod/UI library — it's a Claude Code skill for editorial HTML+SVG diagrams, useful for dev-time PRD export polish but irrelevant to runtime. Reject tRPC (your transport is LangChain streaming + MCP, not REST), Zodios (same), Conform (RHF already handles Next 15 Server Actions fine given your JWT middleware), rjsf (too heavy, breaks shadcn look, loses Zod metadata), Formik (legacy), and ArkType (3-4x faster but migrating 40+ schemas + `zod-to-json.ts` + all LangChain wiring is a months-long refactor for no user-visible win). The one 2026 trend worth internalizing is **Vercel json-render** (13k★, Jan 2026): adopt its pattern — register shadcn components by Zod schema, let agents emit typed JSON trees — without adding the dependency. Your `x-ui-surface` annotation is already a primitive form of it; formalize it.

---

**Sources:**
- [cathrynlavery/diagram-design](https://github.com/cathrynlavery/diagram-design) — 13 editorial HTML+SVG diagram types, Claude Code skill
- [Vercel json-render](https://github.com/vercel-labs/json-render) — generative UI framework, Jan 2026, 13k★
- [AutoForm (vantezzen)](https://github.com/vantezzen/autoform) — shadcn + Zod auto-form generator
- [Conform](https://conform.guide/) — progressive-enhancement Zod forms for Server Actions
- [react-hook-form](https://react-hook-form.com/) — form state, 9KB gz
- [tRPC Next 15 guide](https://www.wisp.blog/blog/how-to-use-trpc-with-nextjs-15-app-router)
- [ArkType vs Zod 2026](https://pockit.tools/blog/zod-valibot-arktype-comparison-2026/) — 3-4x faster, migration cost
- [React Flow xyflow](https://reactflow.dev/)
- [pptxgenjs on Vercel](https://gitbrent.github.io/PptxGenJS/docs/quick-start/) — serverless support, ESM+CJS, 0 deps
- [SheetJS vs ExcelJS vs node-xlsx 2026](https://www.pkgpulse.com/blog/sheetjs-vs-exceljs-vs-node-xlsx-excel-files-node-2026)
- [rjsf vs FormEngine bundle size](https://formengine.io/comparison/react-jsonschema-form-alternative/) — rjsf is 175KB
- [Zodios](https://www.zodios.org/)
- [shadcn form builders 2026](https://shadcnstudio.com/blog/shadcn-form-builders)
- [Generative UI frameworks 2026](https://medium.com/@akshaychame2/the-complete-guide-to-generative-ui-frameworks-in-2026-fde71c4fa8cc)
