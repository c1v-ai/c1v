# 04 — Formalizing with N-Squared Charts

## Prerequisites

- [ ] Completed [Step 03 — Brainstorming with Data Flow Diagrams](03%20-%20Brainstorming%20with%20Data%20Flow%20Diagrams.md).
- [ ] You have at least one DFD showing your subsystems and their high-level interfaces.

## Context (Why This Matters)

While DFDs are excellent for brainstorming, they can become cluttered as the number of interfaces grows. The N-Squared (N²) Chart provides a structured, matrix-based format that organizes every interface relationship in one view. Named for its N×N grid (where N is the number of subsystems), the N² Chart makes it easy to spot patterns like system flows, control loops, and critical subsystems — patterns that are hard to see in a free-form diagram.

## Instructions

1. **Create a square matrix** with N rows and N columns, where N is the number of subsystems.

2. **Place subsystem names on the diagonal.** Subsystem 1 goes in cell (1,1), Subsystem 2 in cell (2,2), and so on. Format the diagonal cells distinctly (bold or ALL CAPS) so they read as labels, not interfaces.

3. **Fill in the off-diagonal cells** with the interfaces provided by the row's subsystem *to* the column's subsystem:
   - **Row = sender**, **Column = receiver**
   - Cell (i,j) answers: "What does Subsystem i provide to Subsystem j?"
   - If there is no interface, leave the cell blank.

4. **Read the chart in two directions:**
   - **Across a row** → everything that subsystem *provides to others*
   - **Down a column** → everything that subsystem *receives from others*

5. **Focus a single N² Chart on one interface type** — operational (runtime data flows) or design (build-time artifacts like libraries, schemas, contracts) — just as with DFDs. Build a separate chart for each type.

6. **Identify system flows.** A system flow is an operational progression you can trace through the chart — e.g., Customer → Storefront → Cart → Order → Payment → Notification. Following data through the matrix reveals the natural processing pipeline.

7. **Identify control loops.** When a path through the matrix returns to an earlier subsystem, you have a control loop. The simplest form is a request/response pair occupying mirrored cells — e.g. (Order → Payment) request and (Payment → Order) result. Multi-hop loops are equally valid: Order → Notification → Order (publish event, then receive delivery webhook). Loops indicate continuous feedback and are candidates for deeper analysis with Sequence Diagrams. For platform-wide loops involving a Monitoring or observability subsystem, add that subsystem explicitly to your matrix before marking the loop (see [Observability KB](observability-kb.md) and [Resiliency Patterns KB](resilliency-patterns-kb.md)).

8. **Identify critical subsystems.** Count non-empty cells in each row (fan-out) and each column (fan-in). Flag any subsystem whose fan-in *or* fan-out covers ≥50% of the other N-1 subsystems — these are integration hubs whose interface failures will cascade widely and warrant the most careful specification.

9. **Keep labels at a high level.** Like DFDs, the N² Chart records interface names (e.g., "Payment Request"), not detailed specifications. Full specifications go in the Interface Matrix.

## Worked Example

**Scenario (e-commerce platform):** Six subsystems arranged in an N² Chart:

| | Storefront | Search | Cart | Order | Payment | Notification |
|---|---|---|---|---|---|---|
| **Storefront** | **STOREFRONT** | Search Queries | Cart Ops | Checkout Req | | |
| **Search** | Search Results | **SEARCH** | | | | |
| **Cart** | Cart State | | **CART** | Cart Data | | |
| **Order** | Order Status | | Cart Retrieval | **ORDER** | Payment Req | Order Events |
| **Payment** | | | | Payment Result | **PAYMENT** | |
| **Notification** | | | | Delivery Status | | **NOTIFICATION** |

**What the chart reveals:**

- **System flow:** Customer → Storefront → Cart → Order → Payment → Notification (the checkout pipeline, visible as a staircase pattern through the matrix). The Storefront sends Search Queries right and receives Search Results back; it sends Cart Ops to Cart and Checkout Req to Order; Order sends Payment Req to Payment and Order Events to Notification.

- **Control loops:** Three loops are visible in the matrix above without adding any subsystems:
  - **Order ↔ Payment** — Order sends Payment Req in (Order, Payment); Payment returns Payment Result in (Payment, Order). A short, high-stakes loop — failure here blocks every checkout.
  - **Order ↔ Notification** — Order publishes Order Events in (Order, Notification); Notification reports Delivery Status back in (Notification, Order), letting Order surface delivery failures.
  - **Order ↔ Cart** — Order issues Cart Retrieval in (Order, Cart); Cart returns Cart Data in (Cart, Order). Ensures checkout uses an immutable cart snapshot.

  Note how each request/response pair occupies *mirrored cells* — the response cell is the transpose of the request cell. This is the canonical way control loops appear in an N² Chart. (For platform-wide loops involving observability — Monitoring detecting anomalies and triggering auto-scaling — add a Monitoring subsystem to the matrix; see [Resiliency Patterns KB](resilliency-patterns-kb.md).)

- **Critical subsystem:** The Order Service appears in the most cells — it orchestrates checkout by retrieving data from Cart (Cart Retrieval), requesting charges from Payment (Payment Req), publishing events to Notification (Order Events), and reporting status back to Storefront (Order Status). It is the integration hub and warrants the most careful interface specification. A failure in the Order Service's interfaces will cascade across the entire checkout pipeline.

> **Interface count check:** The QFD set a design target of ~40 API endpoints. Count the non-empty cells in your N² chart and multiply by the average number of endpoints per interface. For example, the chart above has 10 non-empty off-diagonal cells. If each interface averages 4 endpoints (e.g., Cart Ops includes `POST /cart/items`, `DELETE /cart/items/:id`, `PUT /cart/items/:id`, `GET /cart`), that yields ~40 endpoints — aligned with the QFD target. If your count diverges significantly from the QFD target, investigate — either the QFD was wrong, or your N² chart is missing interfaces (see [API Design KB](api-design-sys-design-kb.md)).

**Reading the chart for a single subsystem — Order Service:**
- **Across the Order row** (what Order provides): Order Status to Storefront, Cart Retrieval request to Cart, Payment Req to Payment, Order Events to Notification.
- **Down the Order column** (what Order receives): Checkout Req from Storefront, Cart Data from Cart, Payment Result from Payment, Delivery Status from Notification.

This read-across/read-down pattern immediately surfaces how coupled a subsystem is and which teams need to coordinate most closely.

## Validation Checklist (STOP-GAP)

- [ ] I have built an N×N matrix with subsystem names on the diagonal.
- [ ] Each off-diagonal cell shows what the row subsystem provides to the column subsystem.
- [ ] I have identified at least one system flow in my chart.
- [ ] I have checked for control loops and noted them.
- [ ] I have flagged any critical subsystems (fan-in or fan-out ≥50% of the other N-1 subsystems).
- [ ] I have reconciled my interface count against the QFD endpoint target (or flagged the gap).
- [ ] My labels are high-level; detailed specs will go in the Interface Matrix.

**STOP: Do not proceed to Step 05 until every box above is checked.**

## Tooling: Build the Chart from a JSON Spec

For repeatability and version control, capture your N² chart as a structured JSON file and generate the Excel artifact with a script:

1. **Copy the template:** `cp n2-chart-template.json my-project-n2.json`
2. **Fill in** the `subsystems`, `interfaces`, `external_interfaces`, `system_flows`, and `control_loops` sections. The template has inline instructions for every field.
3. **Generate the Excel:** `python3 n2_from_json.py my-project-n2.json`

The script:
- **Validates** the spec (unique IDs, valid `from`/`to` references, loop closure).
- **Builds the N² matrix sheet** with category-colored subsystems on the diagonal, control-loop cells highlighted yellow, and critical-subsystem row headers highlighted red.
- **Writes an Analysis sheet** with fan-in/fan-out counts (auto-flagging critical subsystems at the ≥50% threshold from Step 8), the system flows and control loops you declared, and a QFD endpoint reconciliation that flags drift > 25% from your design target.

See `n2-chart-example-ecommerce.json` for the worked example above expressed as JSON, and `ecommerce-n2-chart.xlsx` for the generated output.

## Output Artifact

A completed N² Chart showing all subsystem-to-subsystem interfaces, with system flows, control loops, and critical subsystems annotated. If you used the JSON workflow, commit both the `.json` source and the generated `.xlsx`.

## Handoff to Next Step

The N² Chart shows the structure of interfaces. Step 05 introduces CRC Cards — a team-based activity that teases out interfaces you might have missed by walking through use cases together.

---

**← Previous** [03 — Brainstorming with Data Flow Diagrams](03%20-%20Brainstorming%20with%20Data%20Flow%20Diagrams.md) | **Next →** [05 — CRC Cards for Team Discovery](05%20-%20CRC%20Cards%20for%20Team%20Discovery.md)
