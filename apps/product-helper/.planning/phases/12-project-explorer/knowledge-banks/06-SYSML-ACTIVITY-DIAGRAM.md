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

A visual representation of the UCBD flow using standard SysML (Systems Modeling Language) notation.

**Relationship to UCBD:**
- Each UCBD row → becomes an "action" (rounded rectangle)
- UCBD columns → become swimlanes
- System actions → link to Requirements Table entries
- Precondition → start state
- Postcondition → end state

---

## KEY DIAGRAM ELEMENTS

| Element | Shape | Purpose | Example |
|---------|-------|---------|---------|
| **Action** | Rounded rectangle | A step in the process | "Validate input" |
| **Start** | Filled black circle | Beginning of flow | ● |
| **End** | Circle with inner dot | End of flow | ◉ |
| **Decision** | Diamond | Branch point (if/else) | ◇ |
| **Fork** | Horizontal bar | Start parallel actions | ═══ |
| **Join** | Horizontal bar | End parallel actions | ═══ |
| **Swimlane** | Vertical partition | Actor responsibility | "User" / "System" |
| **Flow Arrow** | Solid arrow | Sequence direction | → |

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

**Goal:** Transform UCBD rows into activity diagram actions

```
PH: Now let's convert each UCBD row into an action.

UCBD Row: "User clicks checkout button"
→ Action: Rounded rectangle with "Click checkout button"
→ Swimlane: User

UCBD Row: "The System SHALL validate cart contents"
→ Action: Rounded rectangle with "Validate cart [OR.5]"
→ Swimlane: The System
→ Links to requirement OR.5

Notice: System actions include the requirement ID in brackets.
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

### Round 5: Link to Requirements

**Goal:** Ensure every system action links to a requirement

```
PH: Every system action should link to a requirement ID.

For each system action, which requirement does it fulfill?

Action: "Validate cart contents"
Requirement: OR.5 "The System SHALL validate cart before checkout"

Format in diagram: "Validate cart [OR.5]"

This creates TRACEABILITY — you can trace from diagram
to requirement to use case to stakeholder need.
```

### Round 6: Create Requirements Pairing Diagram

**Goal:** Show the requirement details alongside actions

```
PH: Optionally, create a paired Requirements Table diagram.

For each system action, show:
- <<requirement>>
- Abstract Function Name
- Text: [The full SHALL statement]
- Id: "[OR.X]"

This makes the diagram self-documenting.
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

### Swimlanes
- Vertical partitions
- Primary actor on LEFT
- The System in CENTER
- Other actors on RIGHT
- Clear labels at top of each lane

### Action Boxes
- **Rounded corners** (not square — this distinguishes from other diagram types)
- Same width for all boxes
- Height adjusts to fit text
- Centered text

### Requirement Links
- System actions include requirement ID: `"Action name [OR.X]"`
- Links provide traceability to Requirements Table

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

## REQUIREMENTS PAIRING

For each system action, create a detailed requirement box:

```
┌─────────────────────────────────────────┐
│ <<requirement>>                          │
│ uc02_validate_cart                       │
│                                          │
│ Text: The System SHALL validate cart     │
│       contents before processing         │
│       checkout                           │
│                                          │
│ Id: "OR.5"                               │
└─────────────────────────────────────────┘
```

This creates a self-documenting diagram where:
- Visual flow is clear
- Every system action traces to a formal requirement
- Requirements are visible without looking up the table

---

## REAL EXAMPLE

### Checkout Use Case Activity Diagram

```
act.CustomerCompletesCheckout

Precondition: User logged in, cart not empty

┌──────────────┬────────────────────────┬──────────────┐
│   Customer   │      The System        │  Payment API │
├──────────────┼────────────────────────┼──────────────┤
│      ●       │                        │              │
│      ↓       │                        │              │
│ ┌──────────┐ │                        │              │
│ │  Click   │ │                        │              │
│ │ checkout │ │                        │              │
│ └────┬─────┘ │                        │              │
│      └───────┼→┌──────────────────┐   │              │
│              │ │ Validate cart    │   │              │
│              │ │ [OR.5]           │   │              │
│              │ └────────┬─────────┘   │              │
│              │          ↓             │              │
│              │        ◇ Cart          │              │
│              │       valid?           │              │
│              │      ╱     ╲           │              │
│              │    Yes      No         │              │
│              │     ↓        ↓         │              │
│              │ ┌────────┐ ┌────────┐  │              │
│              │ │Process │ │Display │  │              │
│              │ │payment │ │error   │  │              │
│              │ │[OR.6]  │ │[OR.7]  │  │              │
│              │ └───┬────┘ └────────┘  │              │
│              │     └──────────────────┼→┌──────────┐ │
│              │                        │ │ Charge   │ │
│              │                        │ │ card     │ │
│              │                        │ └────┬─────┘ │
│              │     ┌──────────────────┼←────┘       │
│              │     ↓                  │              │
│              │ ═════════ Fork         │              │
│              │ ↓         ↓            │              │
│              │┌────────┐┌──────────┐  │              │
│              ││Send    ││Update    │  │              │
│              ││confirm ││inventory │  │              │
│              ││[OR.8]  ││[OR.9]    │  │              │
│              │└───┬────┘└────┬─────┘  │              │
│              │    ↓          ↓        │              │
│              │ ═════════ Join         │              │
│←─────────────┼─────┐                  │              │
│ ┌──────────┐ │     │                  │              │
│ │  View    │ │     │                  │              │
│ │ confirm  │ │     │                  │              │
│ └────┬─────┘ │     │                  │              │
│      ◉       │                        │              │
└──────────────┴────────────────────────┴──────────────┘

Postcondition: Order placed, confirmation sent
```

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
| **SysML** | Systems Modeling Language — an industry standard for system diagrams. |
| **Activity Diagram** | Shows the flow of actions in a process, with decisions and parallel paths. |
| **Swimlane** | A vertical partition showing which actor is responsible for each action. |
| **Fork** | Splits one flow into multiple parallel flows. |
| **Join** | Merges parallel flows back together (waits for all to complete). |
| **Decision Diamond** | A branch point where the flow takes different paths based on a condition. |
| **Requirement Link [OR.X]** | Connects an action to its formal requirement in the Requirements Table. |

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

*Knowledge Bank: SysML Activity Diagram*
*Step 2.3 of PRD Creation Process*
