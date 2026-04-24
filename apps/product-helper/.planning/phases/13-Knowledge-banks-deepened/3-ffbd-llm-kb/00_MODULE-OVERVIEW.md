# Module 3: Exploring Your System's Architecture (FFBD)

## Purpose

Before you can measure, compare, or specify a system, you have to **know what it does**. The Functional Flow Block Diagram (FFBD) is the oldest and most flexible tool in professional systems architecture for mapping the operational flow of a system — the functions it must perform, the order they occur in, and the conditions under which they branch, repeat, or run in parallel.

The FFBD forces one discipline above all: **describe functions, not components**. "Process Payment" — not "Stripe." "Store Persistent Data" — not "PostgreSQL." This single rule preserves your design freedom through every downstream decision in Modules 4-7.

## Worked Example Throughout This Module

We thread a single example across every phase file: an **open-source e-commerce platform** — the same system that is selected as Option C in the Module 4 Decision Matrix and then carried forward into Modules 5 (QFD), 6 (Interfaces), and 7 (FMEA).

**System snapshot:**
- 6 microservices: Storefront, Search, Cart, Order, Payment, Notification
- External integrations: Stripe (payments), SendGrid (email)
- Shared infrastructure: PostgreSQL, RabbitMQ/SQS, CloudFront CDN, Datadog
- Multi-tenant — merchants onboard, configure, list catalog, sell to shoppers
- Runtime: continuous shopper sessions with periodic order processing and asynchronous fulfillment

By the end of this module you will have produced a hierarchical set of FFBDs describing this platform — a top-level operational flow and detailed sub-diagrams for the most complex functions.

## Learning Objectives

In this module, you will:

1. Understand **what an FFBD is** and why functional thinking beats structural thinking at this stage.
2. Create **functional blocks** with proper naming, IDs, and formatting.
3. Connect blocks with **trigger and precedes arrows**, labeling information flow.
4. Use **logic gates (AND, OR, IT)** to capture parallelism, alternatives, and loops.
5. Keep diagrams clean with **arrow shortcuts** and **reference blocks**.
6. Decompose complex functions using **hierarchical FFBDs**.
7. Show external inputs and dependencies with **EFFBD data blocks**.
8. Iterate a draft FFBD through team review to a validated final.
9. Catch the **six most common FFBD mistakes** before they ship.
10. Hand off a completed FFBD to Module 4 as the basis for performance criteria.

## The Build-Up Arc

Each technique builds on the previous. The hierarchical set of FFBDs is the final artifact; everything else is a notation layer that makes it readable:

```
Functional Blocks (WHAT must happen)
    ↓
Arrows (ORDER — trigger vs. precedes)
    ↓
Logic Gates (CONTROL FLOW — AND, OR, IT)
    ↓
Shortcuts + Reference Blocks (READABILITY — avoid arrow chaos)
    ↓
Hierarchical Decomposition (MANAGE COMPLEXITY — drill into detail)
    ↓
EFFBD Data Blocks (EXTERNAL INPUTS — what the system consumes)
    ↓
Iteration with Team (VALIDATION — expose assumptions, discover gaps)
    ↓
Hierarchical FFBD Set (THE ARTIFACT — traceable from top-level to leaf)
```

Every phase adds one concept. By Phase 11 you have a fully validated, team-reviewed FFBD ready to feed Module 4.

## Module Roadmap

### Part 1: Foundations

| Step | Topic | What You'll Do |
|------|-------|----------------|
| 0 | [Module Overview](00_MODULE-OVERVIEW.md) | Read this file |
| 0A | [Ingest the Module 2 Handoff](00A_INGEST-MODULE-2-HANDOFF.md) | **(Optional)** If Module 2 emitted `ffbd-handoff.json`, ingest it to seed the FFBD with validated functions, flows, branches, constants, and cross-cutting concerns |
| 1 | [FFBD Foundations](01_FFBD-FOUNDATIONS.md) | Understand what an FFBD is, why it exists, the iteration mindset |
| 2 | [Functional vs. Structural](02_FUNCTIONAL-VS-STRUCTURAL.md) | Learn the single most important rule in FFBD creation |

### Part 2: Notation

| Step | Topic | What You'll Do |
|------|-------|----------------|
| 3 | [Creating Functional Blocks](03_CREATING-FUNCTIONAL-BLOCKS.md) | Build blocks with proper structure, IDs, and naming |
| 4 | [Arrows and Operational Flow](04_ARROWS-AND-FLOW.md) | Connect blocks with trigger/precedes arrows; label information |
| 5 | [Logic Gates (AND, OR, IT)](05_LOGIC-GATES.md) | Capture parallelism, alternatives, and iteration |
| 6 | [Shortcuts and Reference Blocks](06_SHORTCUTS-AND-REFERENCE-BLOCKS.md) | Keep diagrams readable; connect across diagrams |

### Part 3: Scaling Complexity

| Step | Topic | What You'll Do |
|------|-------|----------------|
| 7 | [Hierarchical FFBDs](07_HIERARCHICAL-FFBDS.md) | Decompose complex blocks into their own sub-diagrams |
| 8 | [EFFBD — Data Blocks](08_EFFBD-DATA-BLOCKS.md) | Show external inputs, constraints, non-functional dependencies |

### Part 4: Iteration and Quality

| Step | Topic | What You'll Do |
|------|-------|----------------|
| 9 | [Building and Iterating](09_BUILDING-AND-ITERATING.md) | Draft → team review → refine, following a 7-round workflow |
| 10 | [Validation and Common Mistakes](10_VALIDATION-AND-COMMON-MISTAKES.md) | Catch the six mistakes professionals flag for revision |

### Part 5: Handoff

| Step | Topic | What You'll Do |
|------|-------|----------------|
| 11 | [From FFBD to Decision Matrix](11_FROM-FFBD-TO-DECISION-MATRIX.md) | Feed functional flow into Module 4's performance criteria |

## Course Deliverables

**Before you start drafting, read the submission contract.** Module 3 has specific hard minimums (≥6 functional blocks, ≥2 logic gate pairs, both arrow types, hierarchical decomposition, EFFBD, informal interface list, color-coded uncertainties, and 9 written answers).

| File | Purpose |
|------|---------|
| [DELIVERABLES-AND-GUARDRAILS.md](DELIVERABLES-AND-GUARDRAILS.md) | The submission contract — what must be produced, hard minimums, final checklist |
| [WRITTEN-ANSWERS-TEMPLATE.md](WRITTEN-ANSWERS-TEMPLATE.md) | Guided prompts and example answers for all 9 required written answers |
| `INSTRUCTIONS-GUARDRAILS.docx` | Original course deliverable document — fill in and submit |

## Reference Files

| File | Type | Purpose |
|------|------|---------|
| `FFBD_Template - MASTER.pptx` | PPTX | Blank FFBD template (editable) |
| `Module2-Activity-FFBD-sample.png` | PNG | Sample diagram from course |
| `create-a-hierarchical-set-of-FFBDs.pdf` | PDF | Step-by-step checklist for hierarchical FFBDs |
| `format-guidelines.pdf` | PDF | Formatting rules at a glance |
| `create_ffbd_thg_v3.py` | Python | Project-specific FFBD generator (reference implementation — THG) |
| `generate_ffbd_fixes.py` | Python | Surgical-fix script pattern for replacing individual slides |
| [PYTHON-SCRIPT-GUIDE.md](PYTHON-SCRIPT-GUIDE.md) | MD | CESYS523 engineering-excellence spec, helper-function API, and adaptation workflow for generating pixel-perfect PowerPoint slides |
| `Part_Two_Answers.txt` | TXT | Worked written answers (C1V project example) |
| `reference-blocks.md` | MD | Deep reference on reference blocks, hierarchy, and EFFBD |
| [FORMATTING-RULES.md](FORMATTING-RULES.md) | MD | Quick-reference formatting card |
| [GLOSSARY.md](GLOSSARY.md) | MD | All key terms |

## Software System Design Knowledge Banks

When FFBD work surfaces engineering questions about *how* a function will be implemented, consult the system-design KBs (shared with Modules 5, 6, 7):

| Knowledge Bank | Consult When Designing FFBDs That Involve... |
|----------------|-----------------------------------------------|
| [API Design KB](../5%20-%20Implementing%20the%20Quality%20Function%20Deployment%20Method/5-HoQ_for_software_sys_design/api-design-sys-design-kb.md) | Request/response interfaces between subsystems |
| [Caching KB](../5%20-%20Implementing%20the%20Quality%20Function%20Deployment%20Method/5-HoQ_for_software_sys_design/caching-system-design-kb.md) | Functions like "Serve Cached Product Listing" |
| [CDN & Networking KB](../5%20-%20Implementing%20the%20Quality%20Function%20Deployment%20Method/5-HoQ_for_software_sys_design/cdn-networking-kb.md) | Edge-served functions and regional routing |
| [Data Model KB](../5%20-%20Implementing%20the%20Quality%20Function%20Deployment%20Method/5-HoQ_for_software_sys_design/data-model-kb.md) | Functions that read/write shared persistent state |
| [Load Balancing KB](../5%20-%20Implementing%20the%20Quality%20Function%20Deployment%20Method/5-HoQ_for_software_sys_design/load-balancing-kb.md) | Traffic-distribution and health-check functions |
| [Message Queues KB](../5%20-%20Implementing%20the%20Quality%20Function%20Deployment%20Method/5-HoQ_for_software_sys_design/message-queues-kb.md) | Async functions (events, fulfillment triggers) |
| [Resiliency Patterns KB](../5%20-%20Implementing%20the%20Quality%20Function%20Deployment%20Method/5-HoQ_for_software_sys_design/resilliency-patterns-kb.md) | Retry, fallback, and error-handling flows |
| [Deployment/CI-CD KB](../5%20-%20Implementing%20the%20Quality%20Function%20Deployment%20Method/5-HoQ_for_software_sys_design/deployment-release-cicd-kb.md) | Provision / deploy / release functions |
| [Maintainability KB](../5%20-%20Implementing%20the%20Quality%20Function%20Deployment%20Method/5-HoQ_for_software_sys_design/maintainability-kb.md) | Keeping FFBD boundaries clean and evolvable |
| [Observability KB](../5%20-%20Implementing%20the%20Quality%20Function%20Deployment%20Method/5-HoQ_for_software_sys_design/observability-kb.md) | "Monitor" and "Report" functions |
| [CAP Theorem KB](../5%20-%20Implementing%20the%20Quality%20Function%20Deployment%20Method/5-HoQ_for_software_sys_design/cap_theorem.md) | Consistency vs. availability at service boundaries |
| [Software Architecture KB](../5%20-%20Implementing%20the%20Quality%20Function%20Deployment%20Method/5-HoQ_for_software_sys_design/software_architecture_system.md) | Service decomposition, SLO framing |

## Prerequisites for Starting Module 3

- [ ] You have completed **Module 1 (Defining Scope)** — you have a context diagram and use-case diagram.
- [ ] You have completed **Module 2 (Developing System Requirements)** — you have UCBDs, a Requirements Table, a Constants Table, and SysML activity diagrams.
- [ ] You have a system or product concept that is non-trivial (more than a single function).
- [ ] You have PowerPoint (or Visio, CORE, Lucidchart) available for drawing.

### Upstream & Downstream Bridges

Module 3 sits between Module 2 and Module 4 in the System Design course sequence:

| Direction | Module | Input/Output Artifact |
|-----------|--------|-----------------------|
| **Upstream (ingests)** | [Module 2 — Developing System Requirements](../../2%20-%20Developing%20System%20Requirements/2-dev-sys-reqs-for-kb-llm-software/) | `ffbd-handoff.json` (schema `ffbd_handoff.v1`) — deduplicated function list, use-case flows, branching hints, named constants, cross-cutting concerns, Module 1 constraints |
| **Downstream (emits)** | [Module 4 — Assessing Your System's Performance and Value](../../4%20-%20Assessing%20Your%20System's%20Performance%20and%20Value/4-assess-software-performance-kb/) | `decision-matrix-handoff.json` (schema `decision_matrix_handoff.v1`) — flat function list, candidate performance criteria with driving functions, alternatives, uncertainty flags, key-interfaces preview, performance budgets |

If the Module 2 bundle exists, start with [00A — Ingest the Module 2 Handoff](00A_INGEST-MODULE-2-HANDOFF.md) to seed the FFBD with validated inputs.

If you are starting from a plain system description (no structured Module 2 output), skip straight to Phase 1.

## Glossary

See [GLOSSARY.md](GLOSSARY.md) for definitions of all key terms: functional block, trigger/precedes arrow, IT/OR/AND gate, reference block, arrow shortcut, hierarchical FFBD, EFFBD, data block, functional naming, termination condition.

---

**Next →** [01 — FFBD Foundations](01_FFBD-FOUNDATIONS.md)
