# Knowledge Bank: SysML Activity Diagram

**Step:** 2.3 - SysML Activity Diagram
**Purpose:** Create a visual workflow diagram using standard notation that links to requirements
**Core Question:** "Does this diagram accurately represent the UCBD flow?"

---

## WHY THIS STEP MATTERS

The SysML Activity Diagram:

- Provides a **standard notation** engineers worldwide understand
- Creates a **visual companion** to the requirements table
- Shows **flow control** (decisions, parallel actions, loops)
- **Links every system action** to a formal requirement ID
- Can be **imported into SysML modeling tools**

---

## WHAT IS A SYSML ACTIVITY DIAGRAM?

A visual representation of the UCBD flow using standard SysML (Systems Modeling Language) notation. The ideas between a UCBD and a SysML Activity Diagram are very similar — most of the changes are largely superficial. But understanding the differences lets you either create one in SysML or interpret someone else's diagram.

**UCBD → SysML Terminology Mapping:**

| UCBD Term | SysML Term |
|-----------|------------|
| Columns | **Activity Partitions** (aka swimlanes) |
| Beginning conditions | **Precondition constraints** |
| Ending conditions | **Postcondition constraints** |
| Statements (rows) | **Opaque Actions** (rounded-corner boxes) |
| Row-to-row flow | **Control Flow Arrows** |
| Start/end of body | **Terminal Nodes** (● start, ◉ end) |

**The critical difference:** In the UCBD spreadsheet form, system statements are written formally as SHALL statements. In a SysML Activity Diagram, **ALL statements are written informally** — including those in the System swimlane. The formality is achieved by pairing each system opaque action with a formal requirement in a **separate accompanying Requirements Table** (a SysML Requirements Diagram). This is mandatory — a SysML Activity Diagram used as a UCBD equivalent **must** have an accompanying Requirements Diagram.

In SysML software tools, each opaque action in the system's activity partition can be officially **linked** to its corresponding entry in the Requirements Diagram, confirming the connection.

---

## KEY DIAGRAM ELEMENTS

| Element | SysML Term | Shape | Purpose | Example |
|---------|------------|-------|---------|---------|
| **Action** | Opaque Action | Rounded rectangle | A step in the process — text is **informal** | "Validate input" |
| **Start** | Initial Node (Terminal) | Filled black circle | Beginning of flow | ● |
| **End** | Final Node (Terminal) | Circle with inner dot | End of flow | ◉ |
| **Decision** | Decision Node | Diamond | Branch point (if/else) | ◇ |
| **Fork** | Fork Node | Horizontal bar | Start parallel actions | ═══ |
| **Join** | Join Node | Horizontal bar | End parallel actions | ═══ |
| **Swimlane** | Activity Partition | Vertical partition | Element responsibility | "child : Child" / "Toy… : System" |
| **Flow Arrow** | Control Flow | Solid arrow | Sequence direction | → |

---

## IDEAL INTERACTION FLOW

### Opening (Set Context)

```
PH: Final step: Creating a visual workflow using standard SysML notation.

This diagram pairs with your requirements table — every system action
links to a formal requirement ID.

Engineers worldwide will understand this diagram instantly because
it follows SysML standards.
```

### Round 1: Setup Structure

**Goal:** Establish the diagram frame and swimlanes

```
PH: Let's set up the diagram structure.

Based on your UCBD for "[Use Case Name]":

Title: act.[UseCaseNameInCamelCase]
Example: act.CustomerCompletesCheckout

Swimlanes (from your UCBD columns):
- [Primary Actor] (left)
- The System (center)
- [Other actors] (right)

Precondition: [from UCBD]
Postcondition: [from UCBD]
```

### Round 2: Convert Actions

**Goal:** Transform UCBD rows into activity diagram opaque actions

**Key rule:** In SysML, ALL opaque actions are written **informally** — including system actions. The formal SHALL statements go in the separate Requirements Table.

```
PH: Now let's convert each UCBD row into an opaque action.

UCBD Row: "User clicks checkout button"
→ Opaque Action: "Click checkout button"
→ Activity Partition: User

UCBD Row: "The System SHALL validate cart contents"
→ Opaque Action: "Validate cart contents"  (informal!)
→ Activity Partition: The System
→ Paired with formal requirement OR.5 in the Requirements Table

In the UCBD spreadsheet, system statements are formal SHALL statements.
In SysML, they become informal opaque actions — the formality lives
in the accompanying Requirements Table instead.
```

### Round 3: Identify Decision Points

**Goal:** Find branches in the flow

```
PH: Are there any decision points in this flow?

A decision point is where the flow branches based on a condition.

Example:
- "Is payment valid?" → Yes (continue) / No (show error)
- "Is user logged in?" → Yes (proceed) / No (redirect to login)

These become DIAMONDS in the diagram with labeled exit paths.

[User identifies decision points]
```

### Round 4: Identify Parallel Actions

**Goal:** Find actions that can happen simultaneously

```
PH: Are there any actions that happen IN PARALLEL?

Things that can occur at the same time, not sequentially.

Example:
- "Send confirmation email" AND "Update inventory"
  (These can happen simultaneously after order is placed)

These use FORK (split into parallel) and JOIN (merge back) bars.

[User identifies parallel actions]
```

### Round 5: Create Accompanying Requirements Table (Required)

**Goal:** Pair every system opaque action with a formal requirement

A SysML Activity Diagram used as a UCBD equivalent **must** have an accompanying Requirements Table. One formal requirement for each statement in the System activity partition.

```
PH: Now let's create the Requirements Table that accompanies
your Activity Diagram.

For each system opaque action, create a requirement box:

  ┌──────────────────────────────────────┐
  │ <<requirement>>                       │
  │ Abstract Function Name                │
  │                                       │
  │ Text: "The System SHALL..."           │
  │ Id: "OR.X"                            │
  └──────────────────────────────────────┘

Rules:
  - One box per requirement
  - All boxes should be the same width
  - The table can be titled "Requirements Table"
    or "Requirements Table: Originating Requirements"

In SysML software, each opaque action in the Activity Diagram
can be officially linked to its corresponding requirement box,
confirming the connection.

This creates TRACEABILITY — you can trace from diagram
to requirement to use case to stakeholder need.
```

### Round 6: Review Linkage

**Goal:** Verify every system action has a paired requirement

```
PH: Let's verify the pairing is complete.

For each opaque action in the System partition:
  ✓ Is there a matching requirement box in the Requirements Table?
  ✓ Does the requirement use formal SHALL language?
  ✓ Does the requirement have a unique ID?
  ✓ Does the requirement have an abstract function name?

Every system opaque action should have exactly one
corresponding requirement. No orphaned actions, no orphaned requirements.
```

---

## DIAGRAM STRUCTURE TEMPLATE

```
┌─────────────────────────────────────────────────────────────────┐
│ act.UseCaseName                                                  │
├─────────────────────────────────────────────────────────────────┤
│ Precondition: [Starting state]                                  │
├─────────────────┬─────────────────────┬─────────────────────────┤
│     Actor       │     The System      │     Other Actor         │
├─────────────────┼─────────────────────┼─────────────────────────┤
│       ●         │                     │                         │
│       ↓         │                     │                         │
│ ┌───────────┐   │                     │                         │
│ │  Action   │   │                     │                         │
│ └─────┬─────┘   │                     │                         │
│       ↓         │                     │                         │
│       ──────────┼→ ┌───────────────┐  │                         │
│                 │  │ Action [OR.1] │  │                         │
│                 │  └───────┬───────┘  │                         │
│                 │          ↓          │                         │
│                 │        ◇            │                         │
│                 │       ╱ ╲           │                         │
│                 │   Yes╱   ╲No        │                         │
│                 │     ↓     ↓         │                         │
│                 │  [...]  [...]       │                         │
│       ◉         │                     │                         │
├─────────────────┴─────────────────────┴─────────────────────────┤
│ Postcondition: [Ending state]                                   │
│ Notes: [Numbered notes from UCBD]                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## FORMATTING RULES

### Frame
- Rectangular border around entire diagram
- Title: `act.[UseCaseNameInCamelCase]`
- Precondition at top
- Postcondition at bottom
- Notes section if needed

### Activity Partitions (Swimlanes)
- Vertical partitions — the SysML term is **activity partitions**
- Primary actor/operator on LEFT
- The System in CENTER — only one partition for your system
- Other elements on RIGHT — add as many as needed
- Labels at top of each partition, optionally in `instanceName : TypeName` format (e.g., `child : Child`, `Toy… : Toy Catapult System`)
- Expand partition length as needed

### Opaque Action Boxes
- **Rounded corners** (not square — this distinguishes from other diagram types)
- All boxes should be the **same width** but may be taller or shorter to fit text
- **All text is informal** — including system actions (formal requirements go in the separate Requirements Table)
- One opaque action per line — similar to one statement per row in the UCBD spreadsheet

### Requirement Links
- System opaque actions are paired with formal requirements in the accompanying Requirements Table
- In SysML software, opaque actions can be officially linked to their requirement entries
- The Activity Diagram + Requirements Table together represent the same information as a spreadsheet UCBD

### Control Flow

| Element | When to Use |
|---------|-------------|
| **Arrow** | Sequence (A then B) |
| **Diamond** | Decision/branch (if/else) |
| **Fork bar** | Start parallel actions |
| **Join bar** | End parallel actions (all must complete) |
| **Start circle** | Entry point |
| **End circle** | Exit point(s) |

### Decision Diamond Labels
- Condition inside or near diamond
- Exit paths labeled (Yes/No, Valid/Invalid, etc.)
- All paths must lead somewhere (no dead ends)

---

## DECISION POINTS

**When the flow branches:**

```
        ↓
      ◇ Payment
     ╱ valid? ╲
    ↓         ↓
   Yes        No
    ↓         ↓
[Process]  [Show error]
```

**Rules:**
- Label the condition clearly
- Label each exit path
- All paths must eventually reach an end or merge

---

## PARALLEL ACTIONS (Fork/Join)

**When actions can happen simultaneously:**

```
              ↓
         ═════════  ← Fork (split)
        ╱         ╲
       ↓           ↓
  [Send email]  [Update inventory]
       ↓           ↓
        ╲         ╱
         ═════════  ← Join (merge)
              ↓
```

**Rules:**
- Fork splits one flow into multiple
- Join waits for ALL parallel flows to complete
- Number of fork exits = number of join entries

---

## SYSML REQUIREMENTS TABLE (Requirements Diagram)

The Requirements Table is a separate diagram that accompanies the Activity Diagram. It contains one box per formal requirement — each paired with a system opaque action from the Activity Diagram.

### Requirement Box Format

```
┌─────────────────────────────────────────┐
│ <<requirement>>                          │
│ Abstract Function Name                   │
│                                          │
│ Text: "The System SHALL..."              │
│ Id: "OR.X"                               │
└─────────────────────────────────────────┘
```

### Formatting Rules
- One box per requirement
- All boxes should be the same width
- The `<<requirement>>` stereotype goes at the top
- The abstract function name is the box title
- `Text:` contains the formal SHALL statement (in quotes)
- `Id:` contains the requirement ID (in quotes, e.g., `"OR.1"`)
- The table title can include a subtitle like "Requirements Table: Originating Requirements"

### Catapult Sample Requirements Table

```
Requirements Table

┌──────────────────────────────────────────────────────────┐
│ <<requirement>>                                           │
│ Detect                                                    │
│ Text: "The system shall detect receptacle is in proper    │
│        position."                                         │
│ Id: "OR.1"                                                │
├──────────────────────────────────────────────────────────┤
│ <<requirement>>                                           │
│ Arm                                                       │
│ Text: "The system shall secure its receptacle in          │
│        position."                                         │
│ Id: "OR.2"                                                │
├──────────────────────────────────────────────────────────┤
│ <<requirement>>                                           │
│ Load                                                      │
│ Text: "The system shall hold the projectile in its        │
│        receptacle."                                       │
│ Id: "OR.3"                                                │
├──────────────────────────────────────────────────────────┤
│ <<requirement>>                                           │
│ Trigger                                                   │
│ Text: "The system shall detect the command to release     │
│        from child."                                       │
│ Id: "OR.4"                                                │
├──────────────────────────────────────────────────────────┤
│ <<requirement>>                                           │
│ Eject                                                     │
│ Text: "The system shall eject the contents of its         │
│        receptacle."                                       │
│ Id: "OR.5"                                                │
└──────────────────────────────────────────────────────────┘
```

This creates a self-documenting pair where:
- The Activity Diagram shows the visual flow (informal actions)
- The Requirements Table shows the formal requirements (SHALL statements)
- Every system opaque action traces to a formal requirement

---

## REAL EXAMPLE: TOY CATAPULT (from course)

### Activity Diagram

```
Use Case: Child Uses Toy Catapult

Precondition: The toy catapult is unloaded and unarmed.

┌──────────────────┬──────────────────────┬──────────────────┐
│  child : Child   │ Toy… : Toy Catapult  │  other : Other   │
│                  │       System         │                  │
├──────────────────┼──────────────────────┼──────────────────┤
│       ●          │                      │                  │
│       ↓          │                      │                  │
│ ┌──────────────┐ │                      │                  │
│ │Child pushes  │ │                      │                  │
│ │receptacle    │ │                      │                  │
│ │into position │ │                      │                  │
│ └──────┬───────┘ │                      │                  │
│        └─────────┼→┌──────────────────┐ │                  │
│                  │ │Detect receptacle │ │                  │
│                  │ │in proper position│ │                  │
│                  │ └────────┬─────────┘ │                  │
│                  │          ↓           │                  │
│                  │ ┌──────────────────┐ │                  │
│                  │ │Secure the        │ │                  │
│                  │ │receptacle in     │ │                  │
│                  │ │position          │ │                  │
│                  │ └────────┬─────────┘ │                  │
│ ┌──────────────┐ │          │           │                  │
│ │Child loads   │←┼──────────┘           │                  │
│ │receptacle    │ │                      │                  │
│ │with          │ │                      │ ┌──────────────┐ │
│ │projectile   │ │                      │ │Projectile    │ │
│ └──────┬───────┘ │                      │ │sits in the   │ │
│        │         │                      │ │receptacle    │ │
│        └─────────┼→┌──────────────────┐ │ └──────────────┘ │
│                  │ │Hold the          │ │                  │
│                  │ │projectile        │ │                  │
│                  │ └────────┬─────────┘ │                  │
│ ┌──────────────┐ │          │           │                  │
│ │Child triggers│←┼──────────┘           │                  │
│ │release       │ │                      │                  │
│ └──────┬───────┘ │                      │                  │
│        └─────────┼→┌──────────────────┐ │                  │
│                  │ │Detect command to │ │                  │
│                  │ │release from the  │ │                  │
│                  │ │child             │ │                  │
│                  │ └────────┬─────────┘ │                  │
│                  │          ↓           │                  │
│                  │ ┌──────────────────┐ │                  │
│                  │ │Eject the contents│ │                  │
│                  │ │of the receptacle │ │ ┌──────────────┐ │
│                  │ └────────┬─────────┘ │ │Projectile    │ │
│                  │          │           │ │flies through │ │
│                  │          │           │ │the air       │ │
│                  │          ◉           │ └──────────────┘ │
└──────────────────┴──────────────────────┴──────────────────┘

Post-Condition: The toy catapult is unloaded and unarmed.

Notes:
1. Assume the projectile is another child-safe toy (not the family's
   pet gerbil!)
```

**Notice:** All actions in the System partition are written **informally** — no "shall" language. The formal requirements live in the paired Requirements Table above.

---

## THINKING STATE MESSAGES

```typescript
const sysmlThinking = [
  {
    headline: "Converting UCBD to SysML notation...",
    tip: "Each UCBD row becomes an action. Swimlanes match your UCBD columns.",
    duration: 4000
  },
  {
    headline: "Linking actions to requirements...",
    tip: "Every system action links to a requirement ID: 'Validate cart [OR.5]'",
    duration: 4000
  },
  {
    headline: "Identifying decision points...",
    tip: "Where does the flow branch? These become diamonds with labeled paths.",
    duration: 4000
  },
  {
    headline: "Checking for parallel actions...",
    tip: "Can any actions happen simultaneously? Use fork/join bars for parallel flows.",
    duration: 4000
  },
  {
    headline: "Validating flow completeness...",
    tip: "Every path must reach an end. No dead ends allowed.",
    duration: 4000
  }
];
```

---

## TOOLTIPS

| Term | Definition |
|------|------------|
| **SysML** | Systems Modeling Language — a common set of standards used by systems engineers worldwide. |
| **Activity Diagram** | The SysML analogue of a UCBD — shows the flow of actions with decisions and parallel paths. |
| **Activity Partition** | SysML term for swimlane — a vertical partition showing which element is responsible for each action. |
| **Opaque Action** | A step in the activity diagram, written as informal text in a rounded-corner box. |
| **Control Flow** | An arrow connecting opaque actions to show the sequence of the flow. |
| **Terminal Node** | Start (●) and end (◉) markers at the beginning and end of the diagram body. |
| **Fork** | Splits one flow into multiple parallel flows. |
| **Join** | Merges parallel flows back together (waits for all to complete). |
| **Decision Node** | A diamond — branch point where the flow takes different paths based on a condition. |
| **Requirements Diagram** | The accompanying Requirements Table — contains formal SHALL statements paired with system opaque actions. |
| **<<requirement>>** | SysML stereotype marking a box as a formal requirement entry (with Text and Id fields). |

---

## VALIDATION ERRORS

```typescript
const validationErrors = {
  dead_end: {
    error: "Path from decision '{condition}' leads to dead end",
    why: "Every path must reach an end node or merge with another path.",
    fix: "Add missing actions or connect to end node."
  },

  missing_link: {
    error: "System action '{action}' has no requirement link",
    why: "Every system action should trace to a formal requirement.",
    fix: "Add requirement ID in brackets: 'Action [OR.X]'"
  },

  fork_join_mismatch: {
    error: "Fork has {X} exits but Join has {Y} entries",
    why: "Fork and Join must balance — same number of parallel paths.",
    fix: "Ensure all forked paths reach the same join."
  },

  no_start: {
    error: "Diagram has no start node",
    why: "Every activity diagram needs a clear entry point.",
    fix: "Add filled circle (●) at the beginning of the flow."
  },

  no_end: {
    error: "Diagram has no end node",
    why: "Every path must terminate at an end node.",
    fix: "Add end circle (◉) where the flow completes."
  },

  unlabeled_decision: {
    error: "Decision diamond has unlabeled exit paths",
    why: "Without labels, it's unclear which path to take.",
    fix: "Label each exit path (Yes/No, Valid/Invalid, etc.)."
  },

  missing_requirements_table: {
    error: "Activity Diagram has no accompanying Requirements Table",
    why: "A SysML Activity Diagram used as a UCBD must have a separate Requirements Diagram with formal SHALL statements.",
    fix: "Create a Requirements Table with one <<requirement>> box per system opaque action."
  },

  formal_in_action: {
    error: "Opaque action '{action}' uses formal SHALL language",
    why: "In SysML, all opaque actions are written informally — formal requirements go in the separate Requirements Table.",
    fix: "Rewrite as informal statement and ensure formal version exists in Requirements Table."
  },

  unlinked_action: {
    error: "System opaque action '{action}' has no paired requirement in Requirements Table",
    why: "Every system action needs a corresponding formal requirement.",
    fix: "Add a <<requirement>> box with Text (SHALL statement) and Id (unique ID)."
  }
};
```

---

## COMPLETION CELEBRATION

```
✅ SysML Activity Diagram Complete

Your PRD package is now complete:

📊 Visual deliverables:
- Context Diagram — System interactions
- Use Case Diagram — Scenarios covered
- Scope Tree — Deliverables defined
- Activity Diagram — Visual workflow

📋 Specification deliverables:
- UCBDs — Step-by-step behaviors
- Requirements Table — {X} formal requirements
- Constants Table — {Y} defined thresholds

💡 This is a professional-grade PRD that any team can implement from.

Every requirement traces back through:
Activity Diagram → UCBD → Use Case → Context Diagram → Stakeholder Need

Developers know WHAT to build.
Testers know WHAT to verify.
Stakeholders can see HOW their needs are addressed.
```

---

## PROCESS CHECKLIST

| Step | Action | Complete When |
|------|--------|---------------|
| 1 | Set up diagram frame with use case name, precondition, postcondition | Frame with title and conditions exists |
| 2 | Create activity partitions (swimlanes) matching UCBD columns | One partition per element, system in center |
| 3 | Convert each UCBD row into an opaque action (informal text, rounded corners, same width) | One opaque action per UCBD statement |
| 4 | Add control flow arrows connecting actions in chronological order | Flow reads top to bottom, one action per line |
| 5 | Add terminal nodes (● start at top, ◉ end at bottom) | Start and end markers present |
| 6 | Identify decision points and add decision nodes (◇) with labeled exit paths | All branches labeled, no dead ends |
| 7 | Identify parallel actions and add fork/join bars | Fork exits = Join entries |
| 8 | Add notes section below postcondition | Numbered notes from UCBD included |
| 9 | Create accompanying Requirements Table — one <<requirement>> box per system opaque action | Every system action has a paired formal requirement |
| 10 | Verify linkage — no orphaned actions, no orphaned requirements | 1:1 match between system actions and requirement boxes |

---

*Knowledge Bank: SysML Activity Diagram*
*Step 2.3 of PRD Creation Process*
