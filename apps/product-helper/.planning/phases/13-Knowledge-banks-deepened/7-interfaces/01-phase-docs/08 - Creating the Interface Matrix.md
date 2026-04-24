# 08 — Creating the Interface Matrix

## Prerequisites

- [ ] Completed Part 1 (Steps 01–07): you have DFDs, an N² Chart, CRC outputs, and Sequence Diagrams identifying your interfaces.
- [ ] You know which subsystems exist and what interfaces connect them.

## Context (Why This Matters)

Every technique so far has been about **identifying** interfaces — discovering *what* connects to *what*. The Interface Matrix is where you **specify** every detail: the exact data, values, units, formats, and ownership of each interface. It is the single source of truth that all subsystem teams reference during design, testing, and integration. Without it, teams work from assumptions — and assumptions are where interface failures are born.

The Interface Matrix is typically implemented as a multi-tab spreadsheet, with one tab per subsystem, and can be maintained with dedicated interface management software for larger programs.

> **Software-specific structure:** In software systems, organize interface specifications hierarchically by **API endpoint** or **event/message type** rather than by physical component. Each endpoint group includes: URL path, HTTP method, request/response schemas, authentication method, timeout, retry policy, rate limits, and error codes. For async interfaces (message queues), include: queue/topic name, message schema, delivery guarantee (at-least-once, exactly-once), retry policy. See [API Design KB](api-design-sys-design-kb.md) and [Message Queues KB](message-queues-kb.md).

## Instructions

1. **Set up the spreadsheet structure.** For each subsystem, create a separate sheet (tab) named after that subsystem.

2. **Add subsystem columns.** On each sheet, create one column for every subsystem in your system. These columns will be used to indicate which other subsystems need each piece of interface information.

3. **Add an Interface Specifications column.** This is the heart of the matrix — it lists every piece of information that this subsystem provides to or shares with others.

4. **Populate the Interface Specifications column** by listing all aspects of the subsystem that may influence other subsystems. Use your DFDs, N² Charts, CRC Cards, and Sequence Diagrams as input. Organize the list hierarchically:
   - Use the interface name as a header (e.g., "Checkout API")
   - List the detailed specifications underneath (e.g., endpoint path, request body schema, response time SLA, authentication method, error codes)

5. **Mark which subsystems need each specification.** For each interface specification row, write **"Provided To"** in the column of every subsystem that needs this information.

6. **Gray out the subsystem's own column.** A subsystem typically does not provide interface specifications to itself. (However, some teams include internal design specifications in the matrix for convenience — if so, italicize or otherwise mark these as internal-only.)

7. **Link your matrix to your other interface documents.** The hierarchical interface names in the specifications column should match the labels used in your DFDs, N² Charts, and Sequence Diagrams. This creates traceability across all your interface documentation.

> **Traceability note:** Interface names in the Matrix should match DFD labels, N² chart entries, and sequence diagram messages. If an interface appears in the sequence diagram as "Process Payment (REST POST /api/payments)", the Interface Matrix should use the same name as its hierarchical header. Consistent naming across all four tools (DFD, N², Sequence Diagram, Interface Matrix) prevents ambiguity and makes audits straightforward.

## Worked Example

**Scenario (e-commerce platform) — Order Service tab:**

| Interface Specification | Storefront | Search | Cart | Payment | Notification | Value | Units |
|---|---|---|---|---|---|---|---|
| **Checkout API** | | | | | | | |
| Endpoint | Provided To | | | | | POST /api/checkout | — |
| Request body schema | Provided To | | | | | See API spec v1.2 | — |
| Response body schema | Provided To | | | | | See API spec v1.2 | — |
| Response time SLA | Provided To | | | | | — | ms |
| Auth method | Provided To | | | | | Bearer JWT | — |
| Rate limit | Provided To | | | | | — | req/min |
| Error response codes | Provided To | | | | | See Error Catalog | — |
| **Get Cart Request** | | | | | | | |
| Endpoint | | | Provided To | | | GET /api/cart/{id} | — |
| Response body schema | | | Provided To | | | See API spec v1.2 | — |
| Timeout | | | Provided To | | | — | ms |
| **Order Event (to queue)** | | | | | | | |
| Event schema | | | | | Provided To | See Event Catalog | — |
| Queue name | | | | | Provided To | — | — |
| Message format | | | | | Provided To | JSON | — |
| Delivery guarantee | | | | | Provided To | at-least-once | — |
| Retry policy | | | | | Provided To | — | — |
| **Payment Request** | | | | | | | |
| Endpoint | | | | Provided To | | POST /api/payments | — |
| Request body schema | | | | Provided To | | See API spec v1.2 | — |
| Timeout | | | | Provided To | | — | ms |
| Idempotency key format | | | | Provided To | | UUID v4 | — |
| Error response codes | | | | Provided To | | See Error Catalog | — |
| Circuit breaker threshold | | | | Provided To | | — | failures/min |

The Order Service column itself would be grayed out. The "Value" column is blank for now — that comes in Step 09.

**Checklist reference:** This corresponds to Steps 1–3 of the "Building Your Interface Matrix" checklist from the `Steps-to-Build-Interface-Matrix.pdf`.

**What the matrix reveals for this tab alone:**
- Order Service **provides to** Storefront (the Checkout API), **consumes from** Cart Service (Get Cart), **provides to** Notification Service (order events via queue), and **provides to** Payment Service (payment requests).
- Each interface group captures not just the data shape but the **operational contract**: timeouts, retry policies, idempotency requirements, and circuit breaker thresholds. These non-functional specifications are where most integration failures originate (see [Resiliency Patterns KB](resilliency-patterns-kb.md)).
- The matrix makes visible that Order Service is a **high-fan-out subsystem** — it has interface obligations to four other services, making it a key integration risk point.

## Validation Checklist (STOP-GAP)

- [ ] I have created one spreadsheet tab per subsystem.
- [ ] Each tab has columns for all subsystems plus an Interface Specifications column.
- [ ] Interface specifications are organized hierarchically (interface name --> detail specs).
- [ ] Each specification row is marked "Provided To" under every subsystem that needs it.
- [ ] The subsystem's own column is grayed out (or internal specs are clearly marked).
- [ ] Interface names match those in my DFDs, N² Charts, and Sequence Diagrams.

**STOP: Do not proceed to Step 09 until every box above is checked.**

## Tooling: Build the Matrix from a JSON Spec

For repeatability and version control, capture your matrix as a structured JSON file and generate the Excel workbook with a script:

1. **Copy the template:** `cp interface-matrix-template.json my-matrix.json`
2. **Fill in the `subsystems` list** (every subsystem in your system).
3. **Fill in ONE subsystem's tab at a time** in `tabs.<id>` and preview it:
   ```
   python3 interface_matrix_from_json.py my-matrix.json --only <subsystem_id>
   ```
   This writes `my-matrix__<subsystem_id>.xlsx` — a single-tab workbook for incremental review. Verify the layout against this Step 08 worked example before moving to the next subsystem.
4. **Generate the combined workbook** once every tab is filled:
   ```
   python3 interface_matrix_from_json.py my-matrix.json
   ```

The script:
- **Validates** the spec (subsystem ids unique; every `provided_to` reference exists; a subsystem cannot provide to itself; every row has either `group` or `name`).
- **Lays out the tab** with the canonical column order (subsystem columns → Value/Units/Estimate? → Last Updated/By/Champion → Est./Actual Due → Row #/Group/Detail), grays out the owner's own column, and chains Row # values via `=P_prev+1` formulas.
- **Renders dates** as proper Excel dates and accepts Excel formulas in `value` (e.g. `"value": "=E14*4/1000"`).

See `interface-matrix-basic-sample.json` for the worked sample (Chassis/Motor Drive/Power robot) expressed as JSON. Running the script on it reproduces `Interface-matrix-sample-basic.xlsx` cell-for-cell.

## Output Artifact

A multi-tab Interface Matrix spreadsheet with one tab per subsystem, populated with interface specifications and "Provided To" markings. If you used the JSON workflow, commit both the `.json` source and the generated `.xlsx`.

## Handoff to Next Step

The structure is in place. Step 09 adds the critical content: **values, units, dates, and status** for each interface specification.

---

**← Previous** [07 — Advanced Sequence Diagram Notation](07%20-%20Advanced%20Sequence%20Diagram%20Notation.md) | **Next →** [09 — Adding Values and Units](09%20-%20Adding%20Values%20and%20Units.md)
