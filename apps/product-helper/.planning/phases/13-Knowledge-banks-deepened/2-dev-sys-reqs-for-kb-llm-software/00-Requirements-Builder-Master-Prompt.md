# Requirements Builder — LLM Master Instruction Set

## Purpose

This instruction set guides an LLM through building a complete set of **functional requirements** for any software system. The output matches the quality and structure of a Cornell CESYS522 deliverable:

- One **Use Case Behavioral Diagram (UCBD)** per high-priority use case
- One master **Requirements Table** (rows of `shall`-statement functional requirements)
- One master **Requirement Constants Definition Table** (named values referenced by requirements)
- One **SysML Activity Diagram** per UCBD (Mermaid notation + `<<requirement>>` links)

All deliverables are authored as **JSON instances** that match the three schemas in this folder. A separate marshalling step converts JSON → `.xlsx` using the provided templates.

## How to Use

1. **Run each phase in order.** Each phase depends on the output of the previous one.
2. **Stop at every STOP GAP.** Present your output to the user and wait for explicit confirmation before proceeding. Do NOT continue to the next phase until the user says to proceed.
3. **Always produce JSON, never xlsx.** The three `.schema.json` files in this folder define the exact field names, cell locations, and write strategies. See `02-JSON-Instance-Write-Protocol.md` for the authoring contract.
4. **Reference the samples.** The `*_FILLED_TEST.xlsx` files are calibration targets — open them (or ask the user to describe them) to confirm your output matches the expected shape.
5. **Accumulate artifacts.** Each phase adds to an in-memory master bundle. Never drop artifacts from earlier phases.
6. **Check for upstream Module 1 outputs first.** Phase 0 ingests the scope, context diagram, use case list, and stakeholders from Module 1. Phase 0 fails closed if these are not available — do not invent them.

## Phase Sequence

| Phase | File | What It Produces | Stop Gaps |
|-------|------|------------------|-----------|
| 0 | `03-Phase-0-Ingest-Module-1-Scope.md` | `system_context_summary.json` (boundary, actors, use-case list, stakeholders, constraints) | 1 |
| 1 | `04-Phase-1-Prioritize-Use-Cases.md` | Ranked use case list; top 5 selected for UCBDs | 1 |
| 2 | `05-Phase-2-Thinking-Functionally.md` | Functional-vs-structural discipline internalized (knowledge phase, no artifact) | 1 |
| 3 | `06-Phase-3-UCBD-Setup.md` | Per use case: UCBD JSON with metadata header + swimlane columns populated | 1 per UCBD |
| 4 | `07-Phase-4-Start-End-Conditions.md` | Per UCBD: `initial_conditions` and `ending_conditions` lists filled | 1 per UCBD |
| 5 | `08-Phase-5-UCBD-Step-Flow.md` | Per UCBD: `actor_steps_table` rows filled (steps from start to end) | 1 per UCBD |
| 6 | `09-Phase-6-Extract-Requirements-Table.md` | `requirements_table.json` (all `The system shall…` statements with stable IDs + abstract function names) | 1 |
| 7 | `10-Phase-7-Requirements-Rules-Audit.md` | Rewritten requirements passing all rules (shall / atomic / clear / unambiguous / objective / verifiable) | 1 |
| 8 | `11-Phase-8-Constants-Table.md` | `constants_table.json` (named values extracted from requirement literals) | 1 |
| 9 | `12-Phase-9-Delve-and-Fix.md` | Additional missed requirements added; delving-question answers logged in notes | 1 |
| 10 | `13-Phase-10-SysML-Activity-Diagram.md` | Per UCBD: Mermaid activity diagram with `<<requirement>>` stereotype references | 1 per diagram |
| 11 | `14-Phase-11-Multi-UseCase-Expansion.md` | Phases 3–10 repeated for remaining high-priority use cases; shared vs use-case-specific requirements flagged | 1 |
| 12 | `15-Phase-12-Final-Review-and-FFBD-Handoff.md` | Final Defining-Your-System checklist completed; Module 3 (FFBD) handoff bundle emitted | 1 |
| 13 | `16-Phase-13-Generate-UCBD-Pptx.md` | **Optional** — `<system>_UCBD.pptx` deck generated from the JSONs (for stakeholder/submission use) | 1 |

## Final Output Bundle

When complete, the Module 2 deliverable contains:

```
<project>/module-2-requirements/
├── system_context_summary.json
├── ucbd/
│   ├── UC01-<name>.ucbd.json
│   ├── UC02-<name>.ucbd.json
│   └── ...
├── requirements_table.json
├── constants_table.json
├── sysml/
│   ├── UC01-<name>.activity.mmd        # Mermaid
│   └── ...
└── ffbd-handoff.json                   # to Module 3
```

Each `.ucbd.json`, `requirements_table.json`, and `constants_table.json` is marshallable to its corresponding `.xlsx` via openpyxl using the schema files in this folder.

## Final Output Checklist

Before declaring Module 2 complete, verify ALL of the following:

- [ ] Module 1 scope artifacts ingested (context diagram, scope tree, use case list, stakeholders)
- [ ] At least 5 high-priority use cases diagrammed as UCBDs (or all of them if <5)
- [ ] Every UCBD has: metadata header, single system column, initial_conditions, ending_conditions, actor_steps_table, notes
- [ ] Every UCBD has been reviewed for the "one system column, never split into subsystems" rule
- [ ] Every system statement in every UCBD starts with **"The system shall"**
- [ ] Every requirement is **atomic** (no `and`/`or` joining two behaviors)
- [ ] Every requirement is **functional**, not structural (no implementation choices baked in — except those inherited as constraints from Module 1)
- [ ] Every requirement is **verifiable** (has a pass/fail test implied)
- [ ] Every numeric threshold in a requirement references a named constant, not an inline literal
- [ ] Every constant has: name, value, units, Estimate/Final status, source, owner
- [ ] Every requirement has a stable index (e.g., `UC01.R03`) and an `abstract_function_name`
- [ ] Delving questions have been asked and answered for each use case (Phase 9)
- [ ] SysML Activity Diagram (Mermaid) exists for each UCBD and links to Requirements Table IDs
- [ ] Shared requirements (appearing in multiple use cases) have been identified and de-duplicated
- [ ] Module 3 (FFBD) handoff bundle emitted with function list seeded from `abstract_function_name` column

## Using the Software System Design Knowledge Banks

Raw course material treats requirements generically. For a **software** system, consult the shared KBs in this folder when the requirements touch specific architectural concerns:

| Knowledge Bank | Consult when a requirement mentions or implies... |
|----------------|---------------------------------------------------|
| `api-design-sys-design-kb.md` | HTTP endpoints, request/response shape, idempotency, versioning, REST/gRPC/GraphQL |
| `caching-system-design-kb.md` | Response time budgets, stale-while-revalidate, TTL, cache invalidation |
| `cap_theorem.md` | Consistency vs availability trade-offs, partition tolerance, eventual consistency |
| `cdn-networking-kb.md` | Edge delivery, geographic latency, static asset serving |
| `data-model-kb.md` | Persistence, uniqueness, retention, queries, relationships |
| `deployment-release-cicd-kb.md` | Deploy cadence, backward compatibility, feature flags, rollback |
| `load-balancing-kb.md` | Traffic distribution, health checks, session affinity |
| `maintainability-kb.md` | Code organization, service boundaries, evolvability |
| `message-queues-kb.md` | Async behavior, eventual delivery, retries, at-least-once vs exactly-once |
| `Multithreading-vs-Multiprocessing.md` | Concurrent behavior, shared state, race conditions |
| `observability-kb.md` | Monitoring, tracing, metrics, audit trails, alerting |
| `resilliency-patterns-kb.md` | Retries, circuit breakers, timeouts, graceful degradation, fallback |
| `software_architecture_system.md` | SLOs/SLAs/SLIs, availability targets, latency percentiles |

These KBs do NOT change the requirement format (still `The system shall…`). They inform the **vocabulary and measurability** of the requirement. Example: instead of "The system shall be reliable," consult `software_architecture_system.md` and write "The system shall maintain availability ≥ `AVAILABILITY_TARGET` measured over `SLO_WINDOW`."

## Cross-Module Bridges

| Upstream/Downstream | What flows |
|---------------------|-----------|
| **← Module 1 (Scope)** | Context diagram → UCBD column set; scope tree → candidate abstract function names; use case list → UCBD queue; stakeholders → Approvers/Stakeholders metadata fields |
| **→ Module 3 (FFBD)** | `requirements_table.json` `abstract_function_name` column → FFBD initial function list; UCBD step flow → FFBD sequential order hint |
| **→ Module 4 (Decision Matrix)** | Functional requirements → candidate performance criteria |
| **→ Module 5 (QFD)** | Functional requirements → Performance Criteria (Front Porch); Constants Table → seed Engineering Characteristic targets |
| **→ Module 6 (Interfaces)** | Actors in UCBDs → subsystem boundaries; system statements involving external actors → interface candidates |
| **→ Module 7 (FMEA)** | Each `shall` becomes a candidate "failure to [verb]" failure mode |

## STOP GAP — Before You Begin

Present the following to the user and wait for confirmation:

1. "I am going to build functional requirements for **[system name]** starting from Module 1 scope outputs. Is that correct?"
2. "I will produce the following JSON artifacts: `system_context_summary.json`, one `.ucbd.json` per high-priority use case, `requirements_table.json`, `constants_table.json`, one `.activity.mmd` per UCBD, and `ffbd-handoff.json`. Confirm you want this bundle."
3. "I will stop at every phase's STOP GAP and wait for your approval before proceeding. Confirm."

> **Do not proceed to Phase 0 until the user confirms all three.**

---

**Next →** [Phase 0: Ingest Module 1 Scope](03-Phase-0-Ingest-Module-1-Scope.md) | **Reference:** [JSON Write Protocol](02-JSON-Instance-Write-Protocol.md) · [Samples and Templates](01-Reference-Samples-and-Templates.md) · [Glossary](GLOSSARY.md)
