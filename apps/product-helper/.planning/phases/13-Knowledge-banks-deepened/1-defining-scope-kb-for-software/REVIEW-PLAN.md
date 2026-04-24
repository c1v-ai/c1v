# KB Self-Review Plan

A lightweight checklist for validating the Module 1 Defining Scope KB itself (not the artifacts it produces). Run this whenever the KB is revised — before asking an LLM to execute against it.

## Structural Checks

- [ ] `00-Defining-Scope-Master-Prompt.md` exists and references every other file by exact filename.
- [ ] Every phase file (`03`–`07`) has: `## Knowledge`, `## Input Required`, `## Instructions for the LLM`, `## Output Format`, `## STOP GAP` (or explicit "no gap" note for P3), `## Output Artifact`, `## Handoff to Next Phase`.
- [ ] Every phase file has a `**Next →**` link and a `**Back:**` link at the bottom.
- [ ] `GLOSSARY.md` defines every term that appears in a phase file without inline definition.
- [ ] `01-Reference-Samples-and-Templates.md` lists every non-markdown asset in `../course-lectures-master-md/`.
- [ ] `02-JSON-Instance-Write-Protocol.md` has a worked JSON example for at least P1 and P4.
- [ ] `phase_artifact.schema.json` validates against JSON Schema draft-07.
- [ ] `system_scope_summary.schema.json` validates against JSON Schema draft-07 AND has `_compatible_with: "system_context_summary.v1"` const declared.

## Content Checks

- [ ] The Master Prompt's Phase Sequence table matches the actual files in the folder (no missing, no extra).
- [ ] Master Prompt's 5 fail-closed rules are stated ONCE (in Master Prompt only) and referenced by ID (R1-R5) elsewhere.
- [ ] Every phase's Input Required references artifacts produced by earlier phases that actually exist.
- [ ] Every phase's Output Artifact is referenced by a later phase's Input Required (except P4 which feeds Module 2).
- [ ] The 11-step Defining Scope Steps Checklist is mapped to phases (see table below).
- [ ] Verbatim quotes from `FULL-INSTRUCTIONS.md` and visual-guide files include line numbers in citations.
- [ ] Mermaid templates in P1, P2, P3 phase files are syntactically valid Mermaid.

## Mapping: Course Checklist Steps → KB Phases

| Course Step | KB Phase |
|-------------|----------|
| Before You Begin (unname) | P0 |
| Step 1: Place "The System" + add elements | P1 Sub-phase A |
| Step 2: Define stakeholders | P0 (provisional) + P1 Sub-phase C |
| Step 3: Add stakeholders to context diagram | P1 Sub-phase A |
| Step 4: Add other interacting elements | P1 Sub-phase A |
| Step 5: Connect lines + label interactions | P1 Sub-phase A |
| Step 6: Iteration break | P1 mid-phase STOP GAP |
| Step 7: Iterate (break up / combine / remove) | P1 Sub-phase B |
| Step 8: Develop use case list | P2 Sub-phase A |
| Step 9: Add stakeholder + internal use cases | P2 Sub-phase A |
| Step 10: Refine via include/extend | P2 Sub-phase B |
| Step 11: Quality check | P2 Sub-phase C / STOP GAP |
| (Source: scope-tree-visual-guide) Scope tree | P3 |
| (KB-only) Final review + handoff | P4 |

## Consistency Checks

- [ ] Fail-closed rule IDs (R1-R5) used consistently across all files.
- [ ] Phase IDs (P0-P4) used consistently.
- [ ] Use case ID format (`UC<NN>`) consistent across P2, P4, schemas.
- [ ] Scope tree dotted-path notation consistent in P3 examples and schema.
- [ ] All `system_name` references default to literal string `"The System"` until P4.
- [ ] All Mermaid `boundary` subgraphs in P1 examples contain exactly ONE node (Rule R2).
- [ ] All Mermaid use case diagrams in P2 examples place actors OUTSIDE `boundary` (Rule R5).

## Stance Checks (per design decision)

- [ ] No product-helper-specific inference rules appear in any KB file (stance A — methodology authoritative).
- [ ] No SaaS-specific worked examples (vehicle is the canonical example, mirroring eCornell source material).
- [ ] No thinking-state messages or end-user UI copy.
- [ ] No mistake-catcher heuristics tied to specific domains.
- [ ] All worked examples are domain-neutral or use the eCornell vehicle / solar-panel examples.

## LLM Dry-Run

After structural and content checks pass, simulate a walk-through:

1. Start with `00-Defining-Scope-Master-Prompt.md`. Does it give a fresh LLM everything it needs to find Phase 0?
2. Walk P0 → P4. At each phase, can an LLM with only: (a) the phase file, (b) earlier phases' output artifacts, (c) the schema files, (d) the source materials in `../course-lectures-master-md/`, produce the expected output without consulting external material?
3. Every STOP GAP must have a clear question set the LLM asks the PM — no guessing what to ask.
4. Refusal triggers in fail-closed rules must be unambiguous: an LLM should be able to detect violations from artifact JSON alone.

If a dry-run hits a gap where the LLM would need "common sense" to fill a missing instruction, add it to the phase file.

## Module 2 Compatibility Check

- [ ] `system_scope_summary.schema.json.body` shape matches the worked example in `../../2 - Developing System Requirements/2-dev-sys-reqs-for-kb-llm-software/03-Phase-0-Ingest-Module-1-Scope.md` (lines 58-130).
- [ ] Field names match exactly: `system_name`, `system_description`, `project_metadata`, `boundary.the_system`, `boundary.external_actors`, `use_cases`, `scope_tree_functions`, `hard_constraints`, `module_1_artifacts_referenced`, `open_questions`.
- [ ] No required Module 2 field is missing from `system_scope_summary.schema.json`.

## Revision Discipline

When revising this KB:

- **Add** phase files at decimal indexes if needed (e.g., `04.1-Phase-1a-X.md`) rather than renumbering.
- **Never** reuse a retired phase number.
- Keep this `REVIEW-PLAN.md` in sync with the actual file list.
- Update `00-Defining-Scope-Master-Prompt.md`'s Phase Sequence table whenever phases are added or removed.
- Fail-closed rules R1-R5 are versioned: if a new rule is needed, add R6 (don't repurpose old IDs).

## Future Work Tracking (deferred from v1)

- [ ] PPTX emitters (`generate_context_diagram_pptx.py`, `generate_use_case_diagram_pptx.py`, `generate_scope_tree_pptx.py`) — deferred to v2 per design decision; product-helper renders Mermaid client-side.
- [ ] Additional schemas per diagram (currently only 2 envelope+handoff) — add only when an emitter needs them.
- [ ] Consumer-layer enforcement — the `apps/product-helper` extraction-agent currently logs but doesn't refuse non-compliant output. Wiring fail-closed enforcement into the runtime is OUT OF SCOPE for this KB but tracked in the parent project.

---

**Back:** [Master Prompt](00-Defining-Scope-Master-Prompt.md)
