# Glossary — Module 2: Developing System Requirements

## Core Concepts

**Use Case** — A scenario describing a specific way the system will be used. Identified in Module 1. Inputs to Module 2. Each use case gets one UCBD.

**Use Case Diagram (UCD)** — A high-level picture of which actors invoke which use cases. Produced in Module 1. Not to be confused with UCBD. UCD shows *which* use cases exist; UCBD shows *what happens inside* one use case.

**Use Case Behavioral Diagram (UCBD)** — The primary Module 2 artifact. A swimlane grid (one column per actor + exactly one column for the system) showing, step by step, what the system and other actors do during one use case. Produced as `.ucbd.json`.

**Functional Requirement** — A "shall" statement describing what the system must *do* (a function it must perform). Functional requirements are solution-neutral: they describe behavior, not implementation. Example: "The system shall authenticate the customer before displaying payment details."

**Structural Requirement** — A statement describing *how* the system is built (a component, a technology, a physical layout). Structural requirements over-constrain the design space. Example (bad): "The system shall use OAuth 2.0 with JWT tokens." (OAuth and JWT are implementation choices.) Rewrite functionally: "The system shall verify the customer's identity using a cryptographically-signed token before displaying payment details."

**Abstract Function Name** — A concise snake_case label naming the function a requirement implements (e.g., `validate_payment_credentials`). This column in the Requirements Table becomes the Module 3 FFBD seed list.

**Constant** — A named value referenced by one or more requirements, defined once in the Constants Table. Replaces inline literals to keep requirements DRY and re-estimable. Example: `RESPONSE_BUDGET_MS = 500`.

## Roles / Actors in a UCBD

**Primary Actor** — The actor that initiates or drives the use case. Placed in the **leftmost** column of the UCBD. Often a human (customer, operator) but can be another system or a time-based trigger.

**The System** — The system under design. Exactly **one** column, always second from the left (column B). **Never** split into subsystems in a UCBD — that happens later, in Module 6 (Interfaces) and Module 3 (FFBD). Forcing a single system column keeps the solution space open.

**Other Actors / Interaction Elements** — Any external thing the system interacts with during the use case that isn't the primary actor. Examples: payment gateway, third-party API, database (if treated as external), environment sensor, another person. Placed in columns to the right of "The System".

**Operator** — Synonymous with Primary Actor in the course material. The UCBD uses both terms interchangeably.

## UCBD Structure

**Initial Conditions** — What must be true before the use case begins. Written as a numbered list at the top of the UCBD. Examples: "Customer is authenticated", "Cart contains at least one item", "System is online".

**Ending Conditions** — What is true once the use case completes successfully. Examples: "Order is persisted", "Confirmation email is queued", "Inventory is decremented". Can also describe a transitional state that triggers another use case.

**Step** — One row in the `actor_steps_table`. A single action performed by one actor in the swimlane grid. Only one column is filled per step (the acting actor); the other cells are blank.

**Notes** — Numbered commentary at the bottom of the UCBD explaining scope boundaries, assumptions, or out-of-scope items. Notes do NOT become requirements; they record context.

## Requirements Rules (Phase 7)

**Shall Statement** — The mandated form for every system requirement. "The system shall [verb] [object] [condition/quantifier]." No "should", "may", "could", "will". `shall` signals a binding obligation.

**Atomic** — One requirement = one behavior. If the sentence contains `and` or `or` connecting two behaviors, split it into two requirements.

**Correct** — What you're saying is true about the system. No aspirations, no drafts.

**Clear and Precise** — No vague qualifiers ("fast", "easy", "intuitive"). Use measurable terms, preferably tied to constants.

**Unambiguous** — Exactly one interpretation. If two engineers could implement the requirement differently because they read it differently, rewrite.

**Objective** — Non-opinionated. No "user-friendly", "seamless", "elegant". Everything measurable.

**Verifiable** — A pass/fail test exists. Given the system, a tester can demonstrate the requirement is met. If you can't write a test, the requirement isn't verifiable.

**Solution-Neutral** — Describes the *what*, not the *how*. No component names, no technology choices, no libraries — unless they are explicit Module 1 constraints (e.g., "must run on AWS" flowed down from the scope).

## SysML Artifacts (Phase 10)

**SysML** — Systems Modeling Language. A standardized visual notation for system descriptions. The UCBD is a loose spreadsheet form; SysML provides a formal equivalent accepted in regulated/government contexts.

**Activity Diagram** — The SysML diagram that corresponds to a UCBD. Shows actions, decisions, fork/join bars, and control/object flows across swimlane partitions.

**Partition (Swimlane)** — A vertical (or horizontal) column in an activity diagram representing one actor. Same concept as a UCBD column.

**Action Node** — A rounded rectangle representing one functional step. One UCBD cell maps to one action node.

**Decision Node** — A diamond. Branches control flow based on a guard condition.

**Fork / Join** — Horizontal bars. Fork splits one control flow into parallel flows; Join synchronizes them back together.

**`<<requirement>>` Stereotype** — A comment-like box attached to an action node, labelled `<<requirement>>`, carrying a `Text:` field (the `shall` sentence) and an `Id:` field (matching the Requirements Table index, e.g., `UC01.R03`).

**Mermaid** — A text-based diagram language. We author SysML Activity Diagrams in Mermaid (not pptx) because the LLM can write Mermaid directly and it renders in GitHub/VSCode.

## JSON / Template Terms

**Schema** — One of the three `.schema.json` files in this folder. Describes the shape of an xlsx template: metadata fields, static text, dynamic tables, cell locations.

**Instance** — A JSON document you author that conforms to a schema. E.g., `UC01-checkout.ucbd.json` is an instance of `UCBD_Template_and_Sample.schema.json`.

**Marshaller** — The script (Python + openpyxl) that loads the blank xlsx template, writes values from a JSON instance into the schema-specified cells, and saves to a new path. You never run the marshaller; you produce the JSON.

**FILLED_TEST** — A sample xlsx pre-filled with test data. Use these as calibration targets to confirm your JSON output will produce the expected shape.

## Cross-Module Terms

**Module 1 — Scope** — Defines *what* the system is and *who* uses it. Outputs consumed by Module 2: context diagram, scope tree, use case diagram, use case list, stakeholders.

**Module 3 — FFBD (Functional Flow Block Diagram)** — Takes the Module 2 `abstract_function_name` list and arranges functions into a flow graph with logical operators (AND, OR, IN-ORDER). Module 2's Requirements Table is the primary input.

**Module 4 — Decision Matrix** — Uses performance criteria derived from functional requirements to score design options.

**Module 5 — QFD / House of Quality** — Uses functional requirements as the Performance Criteria (Front Porch); constants often seed engineering-characteristic targets.

**Module 6 — Interfaces** — Picks up where Module 2 stops: UCBD "other actors" → subsystem boundaries → interface specifications.

**Module 7 — FMEA** — Each `shall` requirement becomes a candidate failure mode ("failure to [verb]") for risk analysis.

---

**Back to:** [Master Prompt](00-Requirements-Builder-Master-Prompt.md)
