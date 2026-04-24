# KB Self-Review Plan

A lightweight checklist for validating the Module 2 KB itself (not the artifacts it produces). Run this whenever the KB is revised — before asking an LLM to execute against it.

## Structural Checks

- [ ] `00-Requirements-Builder-Master-Prompt.md` exists and references every other file by exact filename.
- [ ] Every phase file (`03`–`15`) has: `## Knowledge`, `## Input Required`, `## Instructions for the LLM`, `## Output Format`, `## STOP GAP`, `## Output Artifact`, `## Handoff to Next Phase`.
- [ ] Every phase file has a `**Next →**` link and a `**Back:**` link at the bottom.
- [ ] `GLOSSARY.md` defines every term that appears in a phase file without definition.
- [ ] `01-Reference-Samples-and-Templates.md` lists every non-markdown asset in the folder.
- [ ] `02-JSON-Instance-Write-Protocol.md` has a worked JSON example for each of the three output files.

## Content Checks

- [ ] The Master Prompt's Phase Sequence table matches the actual files in the folder (no missing, no extra).
- [ ] The Master Prompt's "Using the Software KBs" table references only files that exist in the folder (after Wave 4).
- [ ] Every phase's Input Required references artifacts produced by earlier phases that actually exist.
- [ ] Every phase's Output Artifact is referenced by a later phase's Input Required (except Phase 12).
- [ ] The Defining-Your-System Checklist's 10 steps are mapped to Phase files (see table below).
- [ ] Template quirks (duplicate `Target Release`, `Aprovers` typo, truncated `parent_okr`) are preserved in the JSON write protocol.

## Mapping: Course Checklist Steps → KB Phases

| Course Step | KB Phase |
|-------------|----------|
| Before You Begin | Phase 0 |
| Step 1: Rate/prioritize use cases | Phase 1 |
| Step 2: Select high-priority use case + template | Phase 3 (per UCBD) |
| Step 3: Actors/columns | Phase 3 |
| Step 3a: Notes | Phase 3 |
| Step 3b: One system column | Phase 3 (rule documented) |
| Step 4: Starting conditions | Phase 4 |
| Step 5: Ending conditions | Phase 4 |
| Step 6: Step flow | Phase 5 |
| Step 7: Functional, not structural | Phase 2 (discipline) + Phase 5 (applied) |
| Step 8: Requirements rules | Phase 7 |
| Step 9: Delving | Phase 9 |
| Step 10: Repeat for other use cases | Phase 11 |

Plus KB-specific phases without direct course-step mapping:

| KB Phase | Purpose |
|----------|---------|
| Phase 6 (Extract Requirements Table) | Move from UCBD cells to a formal table with stable IDs |
| Phase 8 (Constants Table) | Extract named values from requirements |
| Phase 10 (SysML Activity Diagram) | Course Project Part Two deliverable |
| Phase 12 (Final Review and FFBD Handoff) | Quality gate + Module 3 handoff |

## Consistency Checks

- [ ] Stable index format (`UC<xx>.R<yy>` and `CC.R<yy>`) used consistently across all phase files.
- [ ] "The system shall" (exact capitalization and spacing) specified consistently.
- [ ] Function naming convention (snake_case, verb-object) consistent.
- [ ] Constant naming convention (UPPER_SNAKE_CASE with unit suffix) consistent.
- [ ] Cross-module bridge tables (to M3, M4, M5, M6, M7) consistent across files.
- [ ] Software KB references use the same filenames across phase files.

## LLM Dry-Run

After structural and content checks pass, simulate a walk-through:

1. Start with `00-Requirements-Builder-Master-Prompt.md`. Does it give a fresh LLM everything it needs to find Phase 0?
2. Walk Phase 0 → Phase 12. At each phase, can an LLM with only: (a) the phase file, (b) earlier phases' output artifacts, (c) the schema files, (d) the shared KBs, produce the expected output without consulting external material?
3. Every STOP GAP must have a clear question set the LLM asks the user — no guessing what to ask.

If a dry-run hits a gap where the LLM would need "common sense" to fill a missing instruction, add it to the phase file.

## Revision Discipline

When revising this KB:

- **Add** phase files at decimal indexes if needed (e.g., `06.1-Phase-3a-X.md`) rather than renumbering.
- **Never** reuse a retired phase number.
- Keep this `REVIEW-PLAN.md` in sync with the actual file list.
- Update `00-Requirements-Builder-Master-Prompt.md`'s Phase Sequence table whenever phases are added or removed.

---

**Back:** [Master Prompt](00-Requirements-Builder-Master-Prompt.md)
