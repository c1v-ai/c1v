# Reference Samples and Templates

This file is the map of every non-markdown asset in this folder. Consult it any time you need to write a JSON instance or check your output against a calibration target.

## The Three JSON Schemas

These files describe the structure of the corresponding `.xlsx` templates. You author JSON instances against them; a marshalling script converts to `.xlsx`.

| Schema File | Describes | You Produce |
|-------------|-----------|-------------|
| `UCBD_Template_and_Sample.schema.json` | Use Case Behavioral Diagram (one per use case) | `UCxx-<slug>.ucbd.json` |
| `Requirements-table.schema.json` | Master requirements table (all use cases) | `requirements_table.json` |
| `Requirement_Constants_Definition_Template.schema.json` | Named-constants table | `constants_table.json` |

**See `02-JSON-Instance-Write-Protocol.md` for the exact authoring contract and worked examples.**

## The Three xlsx Templates (blank)

These are the originals. Never modify them directly — load them in openpyxl, write JSON values into the cells specified by the schema, and save to a new path.

| Template File | Purpose |
|---------------|---------|
| `UCBD_Template_and_Sample.xlsx` | Blank UCBD — one sheet, sheet name `UCBD Template` |
| `Requirements-table.xlsx` | Blank Requirements Table — sheet `Sheet1` |
| `Requirement_Constants_Definition_Template.xlsx` | Blank Constants Table — sheet `Req Constant Def Template` |

## The Three `_FILLED_TEST` Samples (calibration)

These are **worked examples** filled with test data. Use them to calibrate your JSON output — if you ran your JSON through the marshaller, the result should look like the FILLED_TEST samples (structurally, not with the same data).

| Sample File | Use For |
|-------------|---------|
| `UCBD_FILLED_TEST.xlsx` | Shape check: where does metadata live, where does the step table start/end, how many initial/ending conditions, note format |
| `Requirements-table_FILLED_TEST.xlsx` | Shape check: index format, requirement phrasing, abstract_function_name naming |
| `Requirement_Constants_Definition_FILLED_TEST.xlsx` | Shape check: constant naming, Estimate/Final values, Date/Source/Owner columns |

**When in doubt:** ask the user to open the FILLED_TEST and describe the row/column that puzzles you, or read the schema's `static_text` and `fields` sections.

## The Course Material (Markdown)

These are the source-of-truth for the **method** (not the templates). When the user asks "why are we doing this step?" or "what does the course say about X?", cite these.

| File | Contains | Use When |
|------|----------|----------|
| `How to build project requirements.md` | Full course transcript (1,242 lines) — every lesson, video transcript, and activity | Deep reference on any methodological question; quote from this to justify decisions |
| `Defining_Your_System_Checklist.md` | The official Cornell CESYS522 defining-your-system checklist (271 lines) | Phase 12 final review; per-step validation during UCBD build |
| `Steps_to_Complete_UCBD.md` | The 10-step UCBD build checklist (45 lines) — concise version of the lecture | Quick reference during Phase 3–6; cite step numbers to the user |
| `SysML_Activity_Diagram_Template_and_Sample.md` | SysML Activity Diagram notation + `<<requirement>>` stereotype examples | Phase 10 — converting UCBD to Mermaid activity diagram |

Each markdown has an accompanying `_artifacts/` folder with extracted images from the original PDF — you can reference these in your explanations to the user (`![alt](./X_artifacts/image_000N_<hash>.png)`).

## Known Template Quirks (do NOT "fix")

All three schemas inherit the same known issues from the original course templates. Your JSON must preserve them exactly:

1. **Duplicate `Target Release` label** — row 7 (`target_release`) and row 10 (`target_release_2`) both say "Target Release". Output both cells. Do not try to merge or rename.
2. **Typo "Aprovers"** — row 12 label is misspelled. Keep it. The JSON field is `approvers` but the cell label written to `A12` is literally `"Aprovers"`.
3. **Truncated "Parent OKR / strategic initiativ"** — row 16 label is truncated in the template. Keep as-is.

If you "correct" these labels the cell map breaks and downstream consumers (grading rubrics, future marshallers) reject the file.

## Metadata Header (rows 2–17) — Same in All 3 Templates

All three templates share the same 16-field metadata header. You will populate it with the **same values** across UCBD, Requirements Table, and Constants Table for a given project. Don't re-type — compute once in Phase 0 and re-use:

| Row | Field Name (JSON) | Label on Sheet | Source |
|-----|-------------------|----------------|--------|
| 2 | `project_name` | Project Name | Module 1 scope |
| 3 | `document_id` | Document ID | Assigned per doc (e.g., `C1V-UCBD-UC01`) |
| 4 | `document_type` | Document Type | `UCBD` / `Requirements Table` / `Constants Table` |
| 5 | `status` | Status | `Draft` / `In Review` / `Approved` |
| 6 | `last_update` | Last Update | ISO date |
| 7 | `target_release` | Target Release | Module 1 or user |
| 8 | `confidentiality` | Confidentiality | `Internal` / `Confidential` / `Public` |
| 9 | `created_date` | Created date | ISO date |
| 10 | `target_release_2` | Target Release (dup) | Same as row 7 |
| 11 | `author` | Author | User |
| 12 | `approvers` | Aprovers (sic) | Module 1 stakeholders |
| 13 | `stakeholders` | Stakeholders | Module 1 stakeholders |
| 14 | `supersedes` | Supersedes / replaces | Optional |
| 15 | `linked_ticket` | Linked epic/ticket | User-provided |
| 16 | `parent_okr` | Parent OKR / strategic initiativ (sic) | Module 1 or user |
| 17 | `regulatory_refs` | Regulatory refs | Module 1 constraints |

---

**Next →** [02 — JSON Instance Write Protocol](02-JSON-Instance-Write-Protocol.md)
