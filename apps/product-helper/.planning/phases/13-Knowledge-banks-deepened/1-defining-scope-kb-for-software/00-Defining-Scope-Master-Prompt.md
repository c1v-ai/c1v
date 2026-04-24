# Defining Scope — LLM Master Instruction Set (Module 1)

## Purpose

This instruction set guides any LLM, agent, or PM through producing the **three target Module 1 deliverables** for any software system using the eCornell CESYS521 method:

1. A **Context Diagram** (Mermaid) — the system boundary + 8-20 external entities + interactions
2. A **Use Case Diagram** (Mermaid) — actors + use cases + association/extension/inclusion relationships
3. A **Scope Tree** (Mermaid) — deliverable hierarchy from top-level need down to atomic tasks / known-data sets / open questions

Plus a single handoff payload — `system_scope_summary.json` — that Module 2 (Developing System Requirements) ingests as `system_context_summary.v1`.

All deliverables are authored as **JSON instances** wrapped in the shared `phase_artifact.v1` envelope (see `02-JSON-Instance-Write-Protocol.md`). Mermaid diagrams are emitted as `.mmd` files alongside their JSON. **No PowerPoint emitter ships in v1** — product-helper renders Mermaid client-side.

## Authoritative source

This KB is **methodology-authoritative** for the Defining Scope method. Downstream consumers (e.g., the `product-helper` SaaS) layer their own inference rules and domain examples *on top of* this methodology — they do not duplicate it. When this KB and a downstream KB disagree about the methodology, this KB wins.

## How to Use

1. **Run phases in order: P0 → P1 → P2 → P3 → P4.** Each phase consumes the prior phase's `phase_artifact.v1` JSON.
2. **Stop at every STOP GAP.** Present the artifact to the PM and wait for explicit confirmation. The downstream phase MUST refuse to start until the upstream artifact has `stop_gap_cleared: true`.
3. **Always produce JSON, never PowerPoint.** The two `.schema.json` files in this folder define the contract. Mermaid `.mmd` files are emitted alongside JSON for the three diagram artifacts.
4. **Reference the source materials.** Located at `../course-lectures-master-md/`. Specific files are listed in `01-Reference-Samples-and-Templates.md`. Inline-quoted excerpts in this KB are verbatim from those sources.
5. **Accumulate artifacts.** P4 ingests the outputs of P0-P3. Never drop earlier artifacts.

---

## 🚨 FAIL-CLOSED RULES (refuse to violate)

These five rules are **named anti-patterns** lifted directly from the eCornell course material. Any LLM/agent operating under this KB MUST refuse to generate output that violates them, and MUST refuse to mark `stop_gap_cleared: true` if the relevant `fail_closed_check` field is `false`. Rules are stated once here, not repeated per-phase. Per-phase files reference them by ID (R1-R5).

### R1 — Do not name 'The System' before P4 Step 8
> *"It's important just to start at the beginning with The System, and don't name your system until you absolutely need to. … if you say it's a car, anything that isn't a car is an invalid solution."*
> — eCornell, *Defining a Nameless System* (`FULL-INSTRUCTIONS.md:255, :247`)

**Refusal trigger:** any user prompt asking the LLM to "design X" where X is a product/solution noun (car, refrigerator, mobile app, CRM platform). Reply: `"I can't name 'The System' yet — naming locks the solution space. Per Rule R1, the system stays 'The System' until Phase 4 Step 8. What needs does it have to meet?"`

### R2 — Do not split 'The System' into subsystems in the context diagram
> *"It can be really, really tempting to split up your system box… For example, you might want to add something that says gas tank interacts with gas station… This is a big violation. Do not do this. I repeat, do not do this."*
> — eCornell, *Making Connections between the System and its Context* (`FULL-INSTRUCTIONS.md:414`)

**Refusal trigger:** the context diagram artifact body contains more than one node inside the `boundary` subgraph. Reply: `"Rule R2: 'The System' is a single box in the context diagram. Subsystems come later (Module 6 Interfaces). Collapse [N] into one box."`

### R3 — Do not list properties/attributes as context-diagram boxes (only interactions)
> *"They start to list properties and characteristics… in our vehicle example someone might write comfort or safety or good fuel economy… we do not include those kinds of things in a context diagram. Again, we're trying to focus on nouns of things that it has to interact with, not properties that we want it to possess."*
> — eCornell, *Identifying Elements that Interact with the System* (`FULL-INSTRUCTIONS.md:307`)

**Refusal trigger:** any external-entity name that is an adjective, adverb, or NFR (e.g., "Reliability", "Fast Response", "Secure"). Reply: `"Rule R3: '[name]' is a performance criterion, not an interaction. Performance criteria are captured in Module 4 (Decision Matrix), not here. Suggest a noun-thing that triggers system behavior instead."`

### R4 — Do not skip the iteration break (Step 6)
> *"Take a break. You've put a lot of information into your context diagram and as a result it may have become cluttered. Now's a great time to take a break before you try to review it as a whole or reorganize it."*
> — eCornell, *Defining-Scope-Steps-Checklist*, Step 6

**Refusal trigger:** an attempt to advance from P1 to P2 with the P1 artifact having `iteration_count: 0` AND `external_actors.length < 12`. Reply: `"Rule R4: Step 6 iteration break required. First-pass had [N] external entities — eCornell targets 12-20 after iteration. Pause, review, then break up / combine / remove boxes before proceeding to Use Cases."`

### R5 — Do not merge external entities into 'The System' box
> *"Anything inside that dash box is what you have control over. Anything outside is what you don't have control over."*
> — eCornell, *Defining a Nameless System* (`FULL-INSTRUCTIONS.md:239`)

**Refusal trigger:** any external entity placed inside the `boundary` subgraph in the Mermaid output, OR any non-actor node in the use-case-diagram boundary. Reply: `"Rule R5: '[name]' is outside your control — it must live OUTSIDE the dashed system boundary. Move it out."`

---

## Phase Sequence

| Phase | File | Produces | STOP GAPs |
|-------|------|----------|-----------|
| P0 | `03-Phase-0-Project-Intake-Unname.md` | `intake_summary` (PM minimal intake; system declared unnamed) | 1 (at exit) |
| P1 | `04-Phase-1-Context-Diagram.md` | `context_diagram` (`.json` + `.mmd`); `stakeholder_list` | 1 (mid-phase: Step 6 iteration break) |
| P2 | `05-Phase-2-Use-Case-Diagram.md` | `use_case_inventory` + `use_case_diagram` (`.json` + `.mmd`) | 1 (at exit: Step 11 quality check) |
| P3 | `06-Phase-3-Scope-Tree.md` | `scope_tree` (`.json` + `.mmd`) | 0 (handoff gate is at end of P4) |
| P4 | `07-Phase-4-Review-and-Module-2-Handoff.md` | `system_scope_summary` (handoff bundle) | 1 (at exit: ship to Module 2) |

**Total: 4 STOP GAPs.** P3 has no exit gate because P4 immediately re-reviews everything; consolidating to one final-review gate avoids redundancy.

## Final Output Bundle

```
<project>/module-1-defining-scope/
├── intake_summary.json
├── context_diagram.json
├── context_diagram.mmd
├── stakeholder_list.json
├── use_case_inventory.json
├── use_case_diagram.json
├── use_case_diagram.mmd
├── scope_tree.json
├── scope_tree.mmd
└── system_scope_summary.json     # ← Module 2 ingests this
```

## Final Output Checklist

Before declaring Module 1 complete, verify ALL of the following:

- [ ] `intake_summary.json` exists; `system_name` == `"The System"` (or final P4 Step 8 name)
- [ ] `context_diagram.json` has 8-20 `external_actors`, all OUTSIDE the boundary
- [ ] `context_diagram.json.fail_closed_check` has all five fields true (or null where N/A)
- [ ] `context_diagram.mmd` renders with one node inside `boundary` subgraph (Rule R2)
- [ ] `iteration_count >= 1` on the context diagram (Rule R4 — iteration break done)
- [ ] No external-entity name is an adjective or NFR (Rule R3)
- [ ] `stakeholder_list.json` distinguishes primary vs secondary; at least one is_client=true
- [ ] `use_case_inventory.json` has every use case named verb-object with primary_actor
- [ ] Step 11 questions answered: initial/end conditions clear; coverage check; no over-long use cases
- [ ] `use_case_diagram.mmd` shows actors OUTSIDE the boundary, use cases INSIDE
- [ ] `scope_tree.json` has top-level deliverables; leaves are atomic tasks, known data sets, OR open questions
- [ ] `scope_tree.mmd` renders cleanly; cut-from-scope branches use dashed lines
- [ ] `system_scope_summary.json` validates against `system_scope_summary.schema.json`
- [ ] `system_scope_summary._compatible_with` == `"system_context_summary.v1"` (Module 2 contract)
- [ ] All five fail-closed checks true on every phase artifact
- [ ] Every phase artifact has `stop_gap_cleared: true`

---

## Cross-Module Bridges

| Direction | What flows |
|-----------|-----------|
| **→ Module 2 (Developing System Requirements)** | `system_scope_summary.json` ingested as `system_context_summary.v1`; context diagram → UCBD column set; scope tree → candidate `abstract_function_name`; use case list → UCBD queue; stakeholders → Approvers/Stakeholders metadata |
| **→ Module 4 (Decision Matrix)** | Performance-criteria items rejected by Rule R3 are captured in `open_questions` for Module 4 to consume |
| **→ Module 6 (Interfaces)** | Subsystems rejected by Rule R2 are deferred — Module 6 splits The System into subsystems and defines their interfaces |

## STOP GAP — Before You Begin

Present the following to the PM and wait for confirmation:

1. "I am going to define scope for **a system that needs to [PM's stated need]**. I will NOT name the system yet (Rule R1). Confirm."
2. "I will produce the following JSON + Mermaid bundle: `intake_summary`, `context_diagram`, `stakeholder_list`, `use_case_inventory`, `use_case_diagram`, `scope_tree`, `system_scope_summary`. Confirm."
3. "I will stop at every STOP GAP — P0 exit, P1 mid-phase iteration break, P2 exit, P4 exit — and wait for your approval. Confirm."

> **Do not proceed to Phase 0 until the PM confirms all three.**

---

**Next →** [Phase 0: Project Intake / Unname](03-Phase-0-Project-Intake-Unname.md) | **Reference:** [JSON Write Protocol](02-JSON-Instance-Write-Protocol.md) · [Samples and Templates](01-Reference-Samples-and-Templates.md) · [Glossary](GLOSSARY.md) · [KB Self-Review](REVIEW-PLAN.md)
