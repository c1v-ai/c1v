# Gate B Verification Step (flag C)

**Generated at:** 2026-04-21T10:11:55.479Z

**Purpose:** Surface the structural gap between Zod-generated Module 2 JSON Schemas (data shape) 
and F14/2 hand-written schemas (xlsx layout) BEFORE Gate C path-swap. These files serve different 
roles and are expected to diverge; this report makes the divergence explicit so Gate C can decide 
how to wire Python marshallers to the new canonical location.

**Not a CI gate.** This script is a one-shot review tool. Run via:

```bash
cd apps/product-helper && pnpm tsx scripts/verify-module-2-diff.ts
```

---

## `phase-6-requirements-table`

**Envelope fields new-to-F14/2 (expected — per plan §5 bullet 2):**
- `_schema`
- `_output_path`
- `_phase_status`
- `_columns_plan`
- `_insertions`
- `metadata`

**F14/2 metadata fields (17) vs metadataHeaderSchema coverage (10 fields):**
- Overlap: project_name, author
- F14/2 unique (15): `document_id`, `document_type`, `status`, `last_update`, `target_release`, `confidentiality`, `created_date`, `target_release_2`, `approvers`, `stakeholders`, `supersedes`, `linked_ticket`, `parent_okr`, `regulatory_refs`, `requirements_table`

**Path-swap implication:** Gate C must decide whether the above F14/2 fields should (a) be added to `metadataHeaderSchema` so generated emissions carry them, or (b) remain xlsx-layout-only and get injected by the Python marshaller at write time.

**Column layout overlap:**
- F14/2 dynamic tables: 0, total columns: 0
- Generated schema promotes `_columns_plan` to first-class (C5). Each F14/2 column maps 1:1 onto a `ColumnPlan` row:
  - `cell_col` → `column_letter`, `name` → `field_name`, `header` → `header_text`, `type` → `type_hint`.

**Generated data-shape top-level properties (1):**
- `rows`

## `phase-8-constants-table`

**Envelope fields new-to-F14/2 (expected — per plan §5 bullet 2):**
- `_schema`
- `_output_path`
- `_phase_status`
- `_columns_plan`
- `_insertions`
- `metadata`

**F14/2 metadata fields (17) vs metadataHeaderSchema coverage (10 fields):**
- Overlap: project_name, author
- F14/2 unique (15): `document_id`, `document_type`, `status`, `last_update`, `target_release`, `confidentiality`, `created_date`, `target_release_2`, `approvers`, `stakeholders`, `supersedes`, `linked_ticket`, `parent_okr`, `regulatory_refs`, `constants_table`

**Path-swap implication:** Gate C must decide whether the above F14/2 fields should (a) be added to `metadataHeaderSchema` so generated emissions carry them, or (b) remain xlsx-layout-only and get injected by the Python marshaller at write time.

**Column layout overlap:**
- F14/2 dynamic tables: 0, total columns: 0
- Generated schema promotes `_columns_plan` to first-class (C5). Each F14/2 column maps 1:1 onto a `ColumnPlan` row:
  - `cell_col` → `column_letter`, `name` → `field_name`, `header` → `header_text`, `type` → `type_hint`.

**Generated data-shape top-level properties (2):**
- `constants_namespace`
- `rows`
