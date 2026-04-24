# Glossary — Defining Scope Module 1

Terms below are eCornell methodology terms. Domain examples and consumer-specific vocabulary do NOT belong here — those live in the adapter layer.

| Term | Definition |
|------|-----------|
| **The System** | The unnamed central box of the context diagram. Stays literally "The System" until P4 Step 8 (Rule R1). |
| **System Boundary** | The dashed box around The System. Anything inside = under your control; anything outside = not under your control. |
| **Context Diagram** | A diagram showing The System (one box) plus all external entities it interacts with, with labeled lines indicating each interaction. Output of P1. |
| **External Entity / External Actor / Outer Box** | A noun-thing outside The System's control that influences or is influenced by it. 8-20 per Step 6 iteration target. |
| **Interaction** | A verb-phrase on the line between an external entity and The System. Lowercase, multiple actions separated by commas. |
| **Property / Attribute / Performance Criterion** | An adjective characterization of The System (e.g., "fast", "safe", "reliable"). FORBIDDEN as a context diagram entity per Rule R3. Belongs in Module 4 (Decision Matrix). |
| **Subsystem** | A component INSIDE The System. FORBIDDEN in the context diagram per Rule R2. Defined in Module 6 (Interfaces). |
| **Iteration Break** | Step 6 of the checklist — the mandatory pause after first-pass context diagramming to break up / combine / remove boxes. Skipping this violates Rule R4. |
| **Stakeholder** | A person, group, or entity affected by The System. Split into primary (must satisfy to ship) and secondary. |
| **Client** | A primary stakeholder whose approval is required for project completion or payment. |
| **Use Case** | A situation in which The System is used. Named verb-object (e.g., "Drive the System"). Each has a primary actor, initial conditions, and ending conditions. |
| **Use Case Diagram** | A diagram with actors outside the system boundary and use case bubbles inside, connected by association lines (and optionally include/extend arrows). Output of P2. |
| **Primary Actor** | An actor that initiates the use case — typically placed on the LEFT of the use case diagram. |
| **Secondary Actor** | An actor that participates in but does not initiate a use case — placed on other sides. |
| **Association Line** | A plain line between an actor and a use case bubble. |
| **Include Relationship** | An arrow indicating one use case includes another (the included use case ALWAYS happens). |
| **Extend Relationship** | An arrow indicating one use case extends another (the extending use case CAN happen). |
| **Delving** | Asking probing questions to surface use cases you would otherwise miss. Source = `delving` in `use_cases.source`. |
| **Scope Tree / Deliverable Tree** | A hierarchical tree from the top-level need down to atomic deliverables, known data sets, and open questions. Output of P3. |
| **Atomic Task** | A leaf node in the scope tree representing work small enough that you know how to do it. |
| **Cut-from-Scope** | A scope tree branch shown with dashed lines indicating the PM agreed to defer it from the current phase. |
| **Initial Condition** | What must be true BEFORE a use case begins. |
| **Ending Condition** | What must be true AFTER a use case completes. |
| **Unname Step** | The discipline of NOT giving The System a product name during P0-P3. The opposite of premature solution lock-in. |

---

**Back:** [Master Prompt](00-Defining-Scope-Master-Prompt.md)
