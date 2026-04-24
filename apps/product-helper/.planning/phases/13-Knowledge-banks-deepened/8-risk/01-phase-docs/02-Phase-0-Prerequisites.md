# Phase 0: Prerequisites and System Context Gathering

## Knowledge

Before building an FMEA, the system design must be advanced enough that you can describe how all subsystems work together to achieve the desired main functionality and handle all main use cases. Failures most commonly occur at the interfaces between subsystems, so understanding these boundaries is essential.

An FMEA can be performed at the subsystem level (e.g., "Projectile Launch System") or at the component level (e.g., "IR Sensor Encoder"). The user should decide the level of granularity before starting.

## Upstream Module Inputs (Optional but Valuable)

If the user has completed earlier modules in the CESYS sequence, their outputs significantly accelerate and improve Phase 0. **None of these are required** -- the FMEA can be built from scratch -- but any available artifacts should be used.

| Source | What It Provides | How It Helps the FMEA |
|--------|-----------------|----------------------|
| **Module 4 — Decision Matrix** | Performance criteria, measurement scales, weights | Performance criteria become the benchmarks against which you evaluate failure severity. The scale-building discipline (non-overlapping, all-inclusive conditions) directly applies to building severity and likelihood scales in Phase 4. |
| **Module 5 — QFD** | Engineering Characteristics, trade-off relationships (roof), design targets | ECs define the technical parameters your system must achieve -- deviations from these are natural failure modes. The QFD roof highlights where improving one parameter degrades another, pointing to trade-off-driven failure risks. Design targets set the "correct" values against which you measure failure effects. |
| **Module 6 — Defining Interfaces** | Subsystem list, DFDs, N² Charts, Sequence Diagrams, Interface Matrix | The subsystem list populates item 2 below. DFDs and N² Charts map all known connections -- Phase 1 uses these as primary brainstorming sources for failure modes. Sequence Diagrams provide the operational scenarios for item 4. Interface Matrix specifications (values, units, tolerances) define what "correct" looks like -- any deviation is a candidate failure mode. |

**If upstream artifacts are available:** Ask the user to point you to them. Extract the relevant information rather than asking the user to re-state it.

**If upstream artifacts are not available:** Proceed with the input list below. The user provides the information directly.

## Input Required from User

Ask the user to provide (or point to upstream artifacts containing):

1. **System name and brief description** -- What is the system? What does it do?
2. **Subsystem or component list** -- Name each subsystem/component that will be analyzed. If the user has a system architecture, block diagram, or Module 6 subsystem list, request it.
3. **Key functional requirements** -- What must the system do? What performance targets exist? (Module 4 Decision Matrix criteria and Module 5 QFD design targets are ideal sources.)
4. **Main use cases or operational scenarios** -- How is the system used end-to-end? (Module 6 Sequence Diagrams are ideal sources.)
5. **Key interfaces** -- Where do subsystems connect or exchange information/energy/material? (Module 6 DFDs, N² Charts, and Interface Matrix are ideal sources.)
6. **Stakeholders and context** -- Who are the users? What environment does it operate in? Are there safety concerns?

## Instructions for the LLM

1. Ask the user for each input listed above. Accept partial information -- prompt for what is missing.
2. Synthesize the answers into a structured **System Context Summary** using the output format below.
3. Present the summary to the user at the STOP GAP.

## Output Format

```markdown
## System Context Summary

**System Name:** [name]
**Description:** [1-2 sentence description]

### Subsystems / Components to Analyze
| # | Subsystem / Component | Function | Key Interfaces |
|---|----------------------|----------|----------------|
| 1 | [name] | [what it does] | [connects to...] |
| 2 | [name] | [what it does] | [connects to...] |

### Functional Requirements
- FR1: [requirement]
- FR2: [requirement]
- ...

### Key Use Cases
- UC1: [scenario]
- UC2: [scenario]
- ...

### Stakeholders and Operating Environment
- Primary users: [who]
- Operating environment: [where/conditions]
- Safety considerations: [any human harm risks]
```

---

## STOP GAP -- Checkpoint 0

**Present the System Context Summary to the user and ask:**

> "Here is the system context I will use as the basis for the FMEA. Please review:
> 1. Is the subsystem/component list complete? Should any be added or removed?
> 2. Are the functional requirements accurate?
> 3. Are there any interfaces or use cases I am missing?
>
> Confirm this is correct before I proceed to Phase 1 (Failure Mode Identification)."

**Do NOT proceed until the user confirms.**
