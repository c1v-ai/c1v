# Knowledge Bank: Use Case Behavioral Diagram (UCBD)

**Step:** 2.1 - Use Case Behavioral Diagram
**Purpose:** Walk through each use case step-by-step to extract hidden requirements
**Core Question:** "If the system has to do THIS, what else must it do?"

---

## WHY THIS STEP MATTERS

The UCBD reveals the requirements hiding inside each use case:

- Transforms high-level scenarios into specific system functions
- Discovers requirements that would otherwise surface as expensive surprises
- Creates testable "shall" statements
- Makes requirements traceable back to scenarios

**Key Insight:** A single use case like "User checks out" can hide 20+ requirements. The UCBD extracts them all.

---

## WHAT IS A UCBD?

A **Use Case Behavioral Diagram** is a step-by-step breakdown of what happens during a use case:
- WHO does WHAT in chronological order
- Separates actor actions from system functions
- System functions become formal "shall" statements

**Structure:**
```
+------------------+--------------------+------------------+
| Primary Actor    | The System         | Other Elements   |
+------------------+--------------------+------------------+
| [informal action]| [SHALL statement]  | [informal action]|
| User clicks...   | System SHALL...    | API returns...   |
+------------------+--------------------+------------------+
```

---

## THE KEY MINDSET SHIFT

**Before (feature thinking):**
> "The system fires the projectile"

**After (functional requirement):**
> "The System SHALL BE ABLE TO fire the projectile"

Then ask: **"If it has to do this, what else must it do?"**

This reveals:
- It SHALL hold the projectile until launch
- It SHALL be triggered by the user
- It SHALL eject the projectile safely
- It SHALL aim at the target

---

## IDEAL INTERACTION FLOW

### Opening (Set Context)

```
PH: Let's walk through "[Use Case Name]" like a movie, frame by frame.

We'll document exactly what happens:
- What the actor does
- What the system MUST do in response

The magic question we'll keep asking:
"If the system has to do THIS, what else must it do?"

This reveals the requirements hiding in the gaps.
```

### Round 1: Setup Columns

**Goal:** Identify all actors involved

```
PH: Who or what is involved in this use case?

The main actor goes in the LEFT column.
"The System" always gets the CENTER column.
Other actors (external systems, secondary users) go on the RIGHT.

For "[Use Case]", who's the main actor?
And are there other actors involved?

[User identifies actors]

PH: 🔑 Important: Keep "The System" as ONE column.
Don't split it into subsystems yet — that locks in architecture too early.
```

### Round 2: Preconditions

**Goal:** Define what must be true before the use case begins

```
PH: What must be TRUE before this use case can begin?

Examples:
- "User is logged in"
- "Cart is not empty"
- "System is in idle state"
- "Payment method is on file"

These become your PRECONDITIONS — the starting gate.

[User defines preconditions]
```

### Round 3: Postconditions

**Goal:** Define what's true when the use case completes

```
PH: What is TRUE when this use case completes successfully?

Examples:
- "Order is placed"
- "Confirmation email sent"
- "Inventory updated"
- "System returns to idle state"

These become your POSTCONDITIONS — the finish line.

[User defines postconditions]
```

### Round 4: Step-by-Step Flow

**Goal:** Document the chronological sequence of actions

```
PH: Let's walk through what happens from start to finish.

What triggers this use case to START?
Usually the main actor does something.

[User describes trigger]

PH: What must the system do in response?
Use "The System SHALL..." language.

[User describes system response]

PH: What happens next?

[Continue alternating between actor actions and system responses]
```

### Round 5: THE DELVING TECHNIQUE (Core Method)

**Goal:** Extract hidden requirements from each system action

```
PH: Let's delve into "The System SHALL [action]".

Key question: "If the system has to do THIS, what else must it do?"

[For each system action, ask this recursively]

Example — "The System SHALL fire the projectile":

PH: If it fires, what must be true first?
→ It SHALL hold the projectile until launch

PH: How does it know when to fire?
→ It SHALL be triggered by the user

PH: What happens during firing?
→ It SHALL eject the projectile from itself

PH: What about safety?
→ It SHALL limit projectile velocity

Each answer reveals another requirement!
```

### Round 6: The Contractor Test

**Goal:** Verify completeness

```
PH: Let's apply the Contractor Test:

"If I asked a contractor to build something that ONLY performs
the functions you've written — nothing more, nothing less —
would you be confident that what you got back would meet all
the needs of this use case?"

If your answer is "well, I'd also expect them to..." —
that's a missing requirement. Let's add it.

[User identifies gaps or confirms completeness]
```

### Round 7: Notes and Assumptions

**Goal:** Document context that isn't obvious

```
PH: Are there any assumptions or context a reader should know?

Examples:
- "Projectile is assumed to be a child-safe toy, not a pet gerbil"
- "User has already completed onboarding"
- "External API is assumed to be available"

Add these as numbered notes at the bottom of the UCBD.

[User adds notes]
```

---

## THE DELVING TECHNIQUE — DETAILED

This is the core methodology for extracting requirements:

### Basic Pattern

```
Starting requirement: "The System SHALL [X]"

Ask: "If the system has to do X, what else must it do?"

For each answer, ask again until you reach atomic functions.
```

### Robotic Arm Example (Advanced)

**Starting:** "The System SHALL pick up the target object"

```
Delving reveals:

"Pick up object" requires:
├── Identify the target object
│   ├── Detect objects in view
│   └── Determine location in 3D space
├── Move to the object
│   ├── Calculate arm angles (inverse kinematics)
│   ├── Plan motion path
│   └── Avoid obstacles
└── Grip the object
    ├── Conform end effector to object shape
    └── Apply appropriate pressure without damage
```

**Insight:** This single action reveals you need:
- Computer vision subsystem
- Inverse kinematics solver
- Path planning algorithm
- Pressure-sensitive gripper

Without delving, you'd discover these halfway through development.

### Delving Questions to Ask

1. **Before:** "What must be true before this can happen?"
2. **During:** "What's happening while this occurs?"
3. **After:** "What must happen after this completes?"
4. **Failure:** "What if this fails? What must the system do?"
5. **Safety:** "What could go wrong? How do we prevent it?"
6. **Data:** "What information does the system need?"
7. **Timing:** "Are there time constraints?"

---

## FUNCTIONAL VS STRUCTURAL

**Always write requirements FUNCTIONALLY (what), not STRUCTURALLY (how):**

| Functional ✅ | Structural ❌ |
|--------------|--------------|
| "Store user data persistently" | "Use PostgreSQL database" |
| "Authenticate user identity" | "Implement OAuth 2.0" |
| "Send notification to user" | "Use Firebase Push" |
| "Process payment securely" | "Integrate Stripe API" |

**Why?** Functional requirements allow ANY valid solution. Structural requirements lock you into specific technologies.

---

## UCBD FORMATTING RULES

### Column Layout
- Column 1: **Primary Actor** (left)
- Column 2: **The System** (center) — ONE column only!
- Columns 3+: **Other actors/elements** (right)

### Swimlane Rules
- One statement per row
- Chronological order from top to bottom
- Arrows show flow between swimlanes

### Statement Formatting
- **Actor actions:** Informal language ("User clicks button")
- **System actions:** Formal SHALL statements ("The System SHALL validate input")

### Notes Section
- Numbered list at bottom
- Document assumptions and clarifications
- Reference notes in main body as needed

---

## REAL EXAMPLE

### Toy Catapult: "Child Uses Toy Catapult"

**Precondition:** System is in unloaded state

**Postcondition:** System is in unloaded state (ready for next use)

| Child (Actor) | The System | Projectile |
|---------------|------------|------------|
| Places projectile in holder | | |
| | SHALL secure projectile in receptacle | |
| | SHALL accept energy input from child | |
| Pulls back / loads energy | | |
| | SHALL store energy up to MAX_ENERGY | |
| Releases trigger | | |
| | SHALL release stored energy | |
| | SHALL eject projectile | |
| | | Travels through air |
| | SHALL return to unloaded state | |

**Notes:**
1. Projectile is assumed to be a child-safe toy
2. MAX_ENERGY is defined in Constants Table
3. System should not require adult supervision for basic operation

---

## COMMON MISTAKES TO CATCH

### Mistake 1: Splitting The System

```
User creates columns: "Database", "API", "Frontend"

PH: ⚠️ Keep "The System" as ONE column.

Splitting into subsystems locks you into an architecture.
What if a better design emerges that doesn't have those divisions?

Write what The System must do. HOW it's divided comes later.
```

### Mistake 2: Skipping Delving

```
User writes: "The System SHALL process the order"

PH: Let's delve deeper.

"If the system has to process the order, what else must it do?"

- Validate order contents?
- Check inventory?
- Calculate totals?
- Apply discounts?
- Reserve items?

Each of these is a separate requirement.
```

### Mistake 3: Missing Preconditions/Postconditions

```
User starts listing steps without boundaries

PH: Wait — what must be true BEFORE this use case begins?
And what's true when it ENDS?

Without these boundaries, you don't know when the use case
starts or finishes. They're essential for testing.
```

### Mistake 4: Structural Requirements

```
User writes: "The System SHALL use Redis for caching"

PH: ⚠️ That's HOW, not WHAT.

What's the NEED that caching addresses?
- "The System SHALL respond within 200ms"
- "The System SHALL minimize database load"

Those are functional. The implementation choice comes later.
```

---

## THINKING STATE MESSAGES

```typescript
const ucbdThinking = [
  {
    headline: "Extracting functional requirements...",
    tip: "The Delving Technique: 'If it has to do THIS, what else must it do?' This question reveals requirements hiding in every action.",
    duration: 5000
  },
  {
    headline: "Applying the Contractor Test...",
    tip: "If a contractor built ONLY what's written, would you be happy? If you'd expect more, there are missing requirements.",
    duration: 5000
  },
  {
    headline: "Converting actions to SHALL statements...",
    tip: "'SHALL' is non-negotiable. 'Should' is nice-to-have. 'Will' is ambiguous. Professional requirements use SHALL.",
    duration: 4000
  },
  {
    headline: "Checking functional vs structural...",
    tip: "WHAT the system must do (functional) not HOW to build it (structural). Keep solutions open.",
    duration: 4000
  },
  {
    headline: "Validating preconditions and postconditions...",
    tip: "Every UCBD needs clear start and end states. These become your test boundaries.",
    duration: 4000
  }
];
```

---

## TOOLTIPS

| Term | Definition |
|------|------------|
| **UCBD** | Use Case Behavioral Diagram — step-by-step breakdown of a use case. |
| **Precondition** | What must be true BEFORE this use case begins. |
| **Postcondition** | What is true AFTER this use case completes successfully. |
| **SHALL Statement** | "SHALL" means non-negotiable requirement. The professional standard. |
| **Delving** | Asking "If it has to do this, what else must it do?" recursively. |
| **Swimlane** | A column representing who is responsible for each action. |
| **Contractor Test** | Would a contractor know exactly what to build from these requirements? |

---

## VALIDATION ERRORS

```typescript
const validationErrors = {
  system_split: {
    error: "The System has been split into multiple columns",
    why: "Splitting locks in architecture too early. Keep all possibilities open.",
    fix: "Merge into single 'The System' column. Subsystems come later."
  },

  missing_shall: {
    error: "System action doesn't use 'SHALL' language",
    why: "'SHALL' is the professional standard for requirements.",
    fix: "Change 'The system validates' → 'The System SHALL validate'"
  },

  structural_requirement: {
    error: "'{requirement}' describes HOW, not WHAT",
    why: "Structural requirements lock you into specific solutions.",
    fix: "What NEED does this address? Write that instead."
  },

  no_precondition: {
    error: "UCBD has no preconditions defined",
    why: "Without a starting state, you can't test when the use case begins.",
    fix: "Define: What must be true BEFORE this use case can start?"
  },

  no_postcondition: {
    error: "UCBD has no postconditions defined",
    why: "Without an ending state, you can't test when the use case completes.",
    fix: "Define: What is true AFTER this use case succeeds?"
  },

  shallow_delving: {
    error: "'{action}' may have hidden requirements",
    why: "High-level actions often hide 5-10 specific functions.",
    fix: "Ask: 'If the system has to do this, what else must it do?'"
  }
};
```

---

## COMPLETION CELEBRATION

```
✅ UCBD Complete for "{useCaseName}"

You've extracted {X} functional requirements from this single use case:
- {Y} core system functions
- {Z} requirements discovered through delving
- {W} edge cases and failure handling

💡 The delving technique revealed requirements that would have been
   expensive surprises during development.

Without this analysis, you might have said "the system processes orders"
and discovered halfway through that you needed 15 specific functions.

Next: We'll formalize all requirements into a professional
Requirements Table with unique IDs and constants.
```

---

*Knowledge Bank: UCBD (Use Case Behavioral Diagram)*
*Step 2.1 of PRD Creation Process*
