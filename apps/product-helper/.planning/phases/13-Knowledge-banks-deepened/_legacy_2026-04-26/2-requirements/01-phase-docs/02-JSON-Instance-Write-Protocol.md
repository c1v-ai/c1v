# JSON Instance Write Protocol

You produce **JSON instances** that match the schemas in this folder. A downstream marshaller converts JSON → `.xlsx` using `openpyxl`, preserving the original template. This file defines the authoring contract.

## Why JSON, not xlsx

1. You (the LLM) cannot author binary `.xlsx` reliably.
2. JSON is diff-able in git; xlsx is not.
3. A schema-validated JSON instance is machine-checkable before the marshaller runs.
4. The marshaller loads the untouched template, writes values into the exact cells the schema names, and saves to a new path. This guarantees formatting, data validation, and styling survive.

## The Three Output Files

All three follow the same pattern: **metadata header** (fields) + **dynamic table** (rows). Two of them (UCBD, Constants) also have **lists** and **static text**.

### 1. UCBD Instance (`UCxx-<slug>.ucbd.json`)

Schema: `UCBD_Template_and_Sample.schema.json`

```json
{
  "_schema": "UCBD_Template_and_Sample.schema.json",
  "_output_path": "<project>/module-2-requirements/ucbd/UC01-customer-checkout.ucbd.json",

  "metadata": {
    "project_name": "C1V",
    "document_id": "C1V-UCBD-UC01",
    "document_type": "UCBD",
    "status": "Draft",
    "last_update": "2026-04-19",
    "target_release": "v1.0",
    "confidentiality": "Internal",
    "created_date": "2026-04-19",
    "target_release_2": "v1.0",
    "author": "David Ancor",
    "approvers": "Product Lead; Engineering Lead",
    "stakeholders": "Engineering; Product; Support",
    "supersedes": "",
    "linked_ticket": "C1V-123",
    "parent_okr": "FY26-Q2 Launch",
    "regulatory_refs": "SOC2 Type II"
  },

  "use_case_name": "Customer completes checkout",

  "initial_conditions": [
    "1. Customer has items in cart",
    "2. Customer is authenticated"
  ],

  "actor_steps_table": [
    { "primary_actor": "Customer initiates checkout",    "the_system": "",                                                    "other_actors": "",                       "extra_actor_col": "" },
    { "primary_actor": "",                               "the_system": "The system shall display the checkout summary.",      "other_actors": "",                       "extra_actor_col": "" },
    { "primary_actor": "Customer submits payment info",  "the_system": "",                                                    "other_actors": "",                       "extra_actor_col": "" },
    { "primary_actor": "",                               "the_system": "The system shall validate payment credentials.",      "other_actors": "Payment gateway receives request.", "extra_actor_col": "" }
  ],

  "ending_conditions": [
    "1. Order is confirmed and persisted",
    "2. Customer receives confirmation email"
  ],

  "notes": [
    "1. Out of scope: gift-card checkout (separate UCBD).",
    "2. Assumes single-currency; multi-currency deferred."
  ]
}
```

**Mapping rules (from the schema):**

| JSON field | Where it lands in xlsx |
|------------|------------------------|
| `metadata.<field>` | `B<row>` — row comes from schema `fields.<field>.cell` (e.g., `metadata.project_name` → `B2`) |
| `use_case_name` | `A20` (merged with B20:C20) |
| `initial_conditions[i]` | `A23`, `A24`; if more, insert rows above row 25 |
| `actor_steps_table[i]` | `A26:D41` — each JSON object = one row; columns map by schema `cell_col` |
| `ending_conditions[i]` | `A43`; if more, insert rows above row 44 |
| `notes[i]` | `A45`, `A46`, … (append downward, no bound) |

### 2. Requirements Table Instance (`requirements_table.json`)

Schema: `Requirements-table.schema.json`

```json
{
  "_schema": "Requirements-table.schema.json",
  "_output_path": "<project>/module-2-requirements/requirements_table.json",

  "metadata": { /* same 16 fields as UCBD */ },

  "requirements_table": [
    {
      "index": "UC01.R01",
      "requirement": "The system shall display the checkout summary within RESPONSE_BUDGET_MS of cart submission.",
      "abstract_function_name": "display_checkout_summary"
    },
    {
      "index": "UC01.R02",
      "requirement": "The system shall validate payment credentials against the payment gateway.",
      "abstract_function_name": "validate_payment_credentials"
    },
    {
      "index": "UC01.R03",
      "requirement": "The system shall persist the order record upon successful payment authorization.",
      "abstract_function_name": "persist_order"
    }
  ]
}
```

**Mapping rules:**

| JSON field | Where it lands in xlsx |
|------------|------------------------|
| `metadata.<field>` | `B<row>` per schema |
| `requirements_table[i].index` | `A<22+i>` |
| `requirements_table[i].requirement` | `B<22+i>` |
| `requirements_table[i].abstract_function_name` | `C<22+i>` |

**Index convention:** `UC<two-digit use case>.R<two-digit req number>`. Stable across edits. Never renumber on re-orderings — treat indexes as primary keys.

**Abstract function name convention:** `snake_case_verb_object`. Concise (2–4 words). This column becomes the Module 3 FFBD function list, so pick names a systems engineer would recognize as a function block.

### 3. Constants Table Instance (`constants_table.json`)

Schema: `Requirement_Constants_Definition_Template.schema.json`

```json
{
  "_schema": "Requirement_Constants_Definition_Template.schema.json",
  "_output_path": "<project>/module-2-requirements/constants_table.json",

  "metadata": { /* same 16 fields */ },

  "constants_table": [
    {
      "constant": "RESPONSE_BUDGET_MS",
      "value": 500,
      "units": "ms",
      "estimate_final": "Estimate",
      "date_update": "2026-04-19",
      "final_date": "",
      "source": "Product SLA draft",
      "owned_by": "Engineering Lead",
      "notes": "Applies to all synchronous user-facing endpoints"
    },
    {
      "constant": "AVAILABILITY_TARGET",
      "value": 99.9,
      "units": "percent",
      "estimate_final": "Estimate",
      "date_update": "2026-04-19",
      "final_date": "",
      "source": "Customer contract template",
      "owned_by": "Engineering Lead",
      "notes": "Measured monthly, excludes scheduled maintenance"
    }
  ]
}
```

**Mapping rules:**

| JSON field | Cell column |
|------------|-------------|
| `constant` | A | `value` | B | `units` | C | `estimate_final` | D | `date_update` | E | `final_date` | F | `source` | G | `owned_by` | H | `notes` | I |

Starts at row 22; append downward.

## Non-Negotiable Rules

1. **Preserve template quirks.** Do not rename the duplicate `Target Release`, the typo `Aprovers`, or the truncated `parent OKR / strategic initiativ`. See `01-Reference-Samples-and-Templates.md` § "Known Template Quirks".
2. **Never write a cell not named in the schema.** If the schema doesn't expose it, leave it.
3. **Populate `_schema` and `_output_path` on every JSON instance.** The marshaller uses these.
4. **All metadata fields are required**, even if empty — emit `""` for unknowns, not `null` or omission.
5. **Numbering in lists is literal.** `initial_conditions[0]` is `"1. Customer has items in cart"` — the `"1. "` is part of the string. The course templates render numbered lists as plain cells.
6. **Never split your system into subsystems in a UCBD.** The schema has exactly one `the_system` column (B). Resist the temptation to add `the_system_backend` / `the_system_frontend`.
7. **Every "The System" cell starts with `"The system shall"`** in Phase 5 and beyond. Phase 3 informal placeholders are allowed temporarily.
8. **Bounds are real.** `actor_steps_table` has 16 row slots (rows 26–41). `initial_conditions` has 2 slots (rows 23–24). If you need more, emit a `_needs_row_insertion_above: <row>` hint at the object level — the marshaller will insert rows.

## Insertion Hint Format (for overflow)

If your use case has 20 steps but the template only has 16 slots:

```json
{
  "actor_steps_table": [ /* 20 objects */ ],
  "_insertions": {
    "actor_steps_table": {
      "insert_above_row": 42,
      "rows_to_add": 4
    }
  }
}
```

Same pattern for `initial_conditions` (insert above row 25) and `ending_conditions` (insert above row 44).

## Self-Check Before Returning a JSON Instance

- [ ] `_schema` is present and matches a file in this folder.
- [ ] `_output_path` is present.
- [ ] All 16 metadata fields present (empty strings allowed).
- [ ] No field invented that isn't in the schema.
- [ ] Duplicate `Target Release` preserved (both `target_release` and `target_release_2`).
- [ ] Typo fields preserved (`approvers` maps to "Aprovers" label, `parent_okr` maps to truncated label).
- [ ] For UCBD: exactly one "system" column used.
- [ ] For Requirements Table: every row has `index`, `requirement`, `abstract_function_name`.
- [ ] For Constants Table: `estimate_final` is exactly `"Estimate"` or `"Final"` (enum).
- [ ] Numeric literals in requirements replaced by `CONSTANT_NAME` references (where applicable — enforced in Phase 8).

---

**Next →** [Phase 0: Ingest Module 1 Scope](03-Phase-0-Ingest-Module-1-Scope.md) | **Back:** [Master Prompt](00-Requirements-Builder-Master-Prompt.md)
