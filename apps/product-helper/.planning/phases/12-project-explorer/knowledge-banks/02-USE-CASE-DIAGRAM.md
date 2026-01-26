# Knowledge Bank: Use Case Diagram (Stakeholder Management)

**Step:** 1.2 - Use Case Diagram
**Purpose:** Capture all scenarios where the system is used, organized by actor relationships
**Core Question:** "In what situations will your system be used?"

---

## WHY THIS STEP MATTERS

Use cases prevent the expensive "if only we'd known earlier" problem:
- Captures ALL scenarios, not just the happy path
- Reveals edge cases before they become bugs
- Enables accurate prioritization
- Creates shared understanding across the team

**Key Mindset Shift:**
```
❌ Feature thinking: "Shopping cart"
✅ Scenario thinking: "Customer adds item while comparing prices"

Features are structural (HOW). Use cases are functional (WHAT).
```

---

## WHAT IS A USE CASE?

A **use case** is a situation or scenario in which your system will be used.

**Format:** `[Actor] [verb]s the system`

**Examples:**
- "Driver drives the system"
- "Customer completes checkout"
- "Admin reviews flagged content"
- "System monitors for anomalies" (no external actor)

**What makes a good use case:**
- Short name with a single action/verb
- Captures a complete scenario from start to end
- Has clear starting and ending conditions
- Would reveal unique requirements if explored

---

## IDEAL INTERACTION FLOW

### Opening (Set Context)

```
PH: Now let's think in scenarios, not features.

A "shopping cart" is a feature — it describes WHAT you'll build.
"Customer adds item while comparing prices" is a use case —
it describes a SITUATION where your system is used.

Use cases help us discover:
- What your system must DO in each situation
- What can go wrong
- What makes each scenario unique

We'll aim for 20-30 use cases that cover all the ways
your system will be used.

Let's start with your context diagram actors.
```

### Round 1: From Context Diagram

**Goal:** Generate initial use cases from each actor

```
PH: Looking at your context diagram, [User Actor] interacts with your system.

What are the main goals they need to accomplish?

Format: "[Actor] [verb]s the system"
Or just the verb — we'll connect it to the actor in the diagram.

Examples from a vehicle:
- "Driver drives the system"
- "Driver fuels the system"
- "Driver parks the system"
- "Passenger enters the system"

[User lists 3-5 main goals per actor]
```

### Round 2: Actor Variants (Critical!)

**Goal:** Discover that different user types create different requirements

```
PH: Let's delve deeper into "[Use Case]".

Does your system behave DIFFERENTLY for different types of this user?

Vehicle example for "Driver drives the system":
- "Student driver drives" → needs training mode, extra feedback
- "Elderly driver drives" → needs accessibility features, larger displays
- "Drunk driver drives" → needs safety intervention, can't start
- "Disabled driver drives" → needs adaptive controls

Each variant is a separate use case because each requires
the system to do something DIFFERENT.

What variants exist for your users?

[User identifies variants]

PH: 💡 You've just discovered hidden use cases.

A system built only for "typical users" fails when reality shows up.
```

### Round 3: Undesired Use Cases

**Goal:** Surface negative scenarios that create critical requirements

```
PH: What use cases do you NOT want, but must plan for?

These are often your most important requirements.

Vehicle examples:
- "Vehicle survives an accident" → safety requirements
- "Thief attempts to steal" → security requirements
- "Driver falls asleep" → intervention requirements
- "System experiences failure" → graceful degradation

For your system, what could go wrong?
What malicious uses might occur?

[User identifies negative scenarios]

PH: 💡 These undesired cases often define your most critical requirements.
They're easy to forget but expensive to miss.
```

### Round 4: Internal/Automated Use Cases

**Goal:** Capture scenarios without external human actors

```
PH: Are there things the system does WITHOUT a human triggering it?

Examples:
- "System monitors weather" (continuous monitoring)
- "System performs scheduled backup" (automated maintenance)
- "System detects anomalies" (proactive detection)
- "System sends notifications" (event-driven)

These use cases have no external actor — the system itself
drives the action.

[User identifies automated scenarios]
```

### Round 5: Stakeholder-Requested Functions

**Goal:** Capture specific functionality stakeholders have requested

```
PH: Have stakeholders explicitly requested specific functions?

Examples:
- "System shall alert driver to drowsiness"
- "System shall automatically parallel park"
- "System shall generate monthly reports"

These might not emerge from actor analysis but are
explicit requirements from stakeholders.

[User lists requested functions]
```

---

## USE CASE RELATIONSHIPS

### <<includes>> — Required Sub-Actions

**When to use:** The parent use case CANNOT complete without the child.

```
"Checkout" <<includes>> "Validate Payment"
(Can't checkout without validating payment)

"Login" <<includes>> "Verify Credentials"
(Can't login without verification)
```

**Arrow direction:** Main → Sub (dashed arrow pointing to included use case)

**PH Explanation:**
```
PH: Does "[Use Case]" REQUIRE other actions to complete?

If the main use case literally cannot finish without the sub-action,
that's an <<includes>> relationship.

Example: "Checkout" includes "Validate Payment"
You cannot complete checkout without payment validation.

What sub-actions are REQUIRED for [use case]?
```

### <<extends>> — Optional Variations

**When to use:** The parent use case CAN complete without the child.

```
"Checkout" <<extends>> "Apply Coupon"
(Checkout works fine without a coupon)

"Login" <<extends>> "Reset Password"
(Login works fine without password reset)
```

**Arrow direction:** Sub → Main (dashed arrow pointing to extended use case)

**PH Explanation:**
```
PH: Are there OPTIONAL variations of "[Use Case]"?

If the main use case works fine without the variation,
but the variation is a special case, that's <<extends>>.

Example: "Checkout" can be extended by "Apply Coupon"
Checkout works without a coupon — it's optional.

What optional variations exist for [use case]?
```

### <<generalizes>> — Special Versions

**When to use:** A more specific use case inherits from a general one.

```
"Drive semi truck" generalizes "Drive vehicle"
(Semi truck has all vehicle requirements PLUS additional ones)

"Admin manages users" generalizes "User manages profile"
(Admin does everything a user does, plus more)
```

**Arrow direction:** Special → General (solid line with open triangle head)

**PH Explanation:**
```
PH: Is "[Use Case]" a special version of a more general use case?

The special version does everything the general one does,
PLUS additional requirements unique to the special case.

Example: "Drive semi truck" generalizes "Drive vehicle"
Semi trucks have all normal driving requirements,
plus special licensing, different turning radius, etc.

Is this a special version of something more general?
```

### <<trigger>> — Causes Another Use Case

**When to use:** Completing one use case automatically starts another.

```
"Detect fire" <<trigger>> "Extinguish fire"
(Detection automatically triggers extinguishing)

"Payment fails" <<trigger>> "Send retry notification"
(Failure automatically triggers notification)
```

**Arrow direction:** Initial → Triggered (dashed arrow with <<trigger>> label)

**PH Explanation:**
```
PH: Does completing "[Use Case]" automatically START another use case?

This isn't includes (required sub-action) or extends (optional).
This is a chain reaction — finishing one kicks off another.

Example: "Detect fire" triggers "Extinguish fire"
The moment fire is detected, extinguishing begins automatically.

What does completing [use case] automatically start?
```

---

## QUALITY CHECK: Three Questions

Before finalizing use cases, verify each one:

```
PH: Let's verify your use cases are well-defined.

For each use case, can you answer:

1. BOUNDARIES: Can you state the START and END conditions?
   - What must be true before this begins?
   - What is true when it completes?
   (If unclear → needs more definition)

2. SCOPE: Can you describe what happens step-by-step
   without it feeling too long or running into other use cases?
   (If too long → break it down with <<includes>>)

3. UNIQUENESS: Does this capture requirements that would
   be MISSED if we didn't consider this use case?
   (If redundant → merge or eliminate)

Let's check "[use case]"...
```

---

## REAL EXAMPLES

### Vehicle Use Cases

**High-Level Use Cases:**
```
- Driver drives the system
- Driver fuels the system
- Driver parks the system
- Passenger enters/exits the system
- Maintenance worker services the system
- System monitors weather
```

**Delving "Driver drives the system":**
```
<<includes>>:
- Driver accelerates
- Driver brakes
- Driver steers
- Driver changes lanes
- Driver stops at intersection

<<extends>>:
- Driver drives through snow (special condition)
- Driver drives at night (special condition)
- Driver uses cruise control (optional feature)

<<generalizes>>:
- Student driver drives (special actor)
- Elderly driver drives (special actor)
- Drunk driver drives (undesired actor)
```

**Undesired Use Cases:**
```
- Vehicle survives accident
- Vehicle handles pothole damage
- Thief attempts to steal vehicle
- Driver falls asleep while driving
- System experiences sensor failure
```

### The Copy-Replace Technique

**For actor variants:**

Once you have a use case like "Driver drives the system," you can efficiently create variants:

1. Copy the use case
2. Replace "Driver" with variant
3. BUT ONLY IF the system behaves differently

```
✅ Create variant if:
   "Student driver drives" → system needs training mode

❌ Don't create variant if:
   "Left-handed driver drives" → system behaves the same
```

---

## DIAGRAM FORMATTING RULES

### Frame
- Rectangular border around entire diagram
- Title format: `uc.[TitleInCamelCase]` (e.g., `uc.MainOperationUseCases`)
- "The System" label on system boundary box

### Actors
- Represented as **stick figures**
- Primary actors: LEFT side of boundary
- Secondary actors: RIGHT side (may use dashed connection lines)

### Use Case Bubbles
- **Ovals/ellipses** inside the system boundary
- Text centered, same font size for all
- All bubbles roughly same size (larger with whitespace > cramped text)
- Actor name NOT included in bubble (connection implies it)
- Can drop "the system" suffix for cleaner labels

### Connection Lines

| Type | Line Style | Direction | Label |
|------|------------|-----------|-------|
| Actor to Use Case | Solid line | Actor → Bubble | (none) |
| <<includes>> | Dashed arrow | Main → Sub | `<<includes>>` |
| <<extends>> | Dashed arrow | Sub → Main | `<<extends>>` |
| <<generalizes>> | Solid, open triangle | Special → General | (none) |
| <<trigger>> | Dashed arrow | Initial → Triggered | `<<trigger>>` |

### Label Format
- Written in **lowercase**
- Double angle brackets: `<<includes>>`, `<<extends>>`, `<<trigger>>`

---

## THINKING STATE MESSAGES

```typescript
const useCaseDiagramThinking = [
  {
    headline: "Discovering use case scenarios...",
    tip: "Think scenarios, not features. 'Shopping cart' is a feature. 'Customer adds item while comparing prices' is a use case.",
    duration: 4000
  },
  {
    headline: "Analyzing actor variants...",
    tip: "A 'student driver' and 'drunk driver' create vastly different requirements. Your system must handle both.",
    duration: 4000
  },
  {
    headline: "Identifying undesired use cases...",
    tip: "What can go wrong? Malicious use? System failures? These often define your most critical requirements.",
    duration: 4000
  },
  {
    headline: "Mapping use case relationships...",
    tip: "<<includes>> = required sub-action. <<extends>> = optional variation. The distinction matters for testing and prioritization.",
    duration: 4000
  },
  {
    headline: "Validating use case completeness...",
    tip: "Can you state start/end conditions? Is it the right scope? Does it capture unique requirements?",
    duration: 4000
  }
];
```

---

## TOOLTIPS

| Term | Definition |
|------|------------|
| **Use Case** | A situation where your system is used — think scenarios, not features. |
| **Actor** | The main stimulus causing the system to act — person, system, or internal trigger. |
| **<<includes>>** | This use case REQUIRES the sub-action to complete. |
| **<<extends>>** | This is an OPTIONAL variation that MAY happen. |
| **<<generalizes>>** | A special version that inherits everything from the general case. |
| **<<trigger>>** | Completing this use case automatically starts another. |
| **Primary Actor** | The main user whose actions drive the use case. |
| **Secondary Actor** | Supporting actors involved but not driving the action. |

---

## VALIDATION ERRORS

```typescript
const validationErrors = {
  no_start_end: {
    error: "Use case '{name}' has no clear start/end conditions",
    why: "Without boundaries, you can't know when the use case begins or completes.",
    fix: "Define: What must be true BEFORE? What is true AFTER?"
  },

  too_broad: {
    error: "Use case '{name}' seems too broad",
    why: "If describing it takes many steps or covers multiple scenarios, break it down.",
    fix: "Use <<includes>> to break into sub-use cases."
  },

  feature_not_scenario: {
    error: "'{name}' looks like a feature, not a use case",
    why: "Features describe WHAT you build. Use cases describe SITUATIONS of use.",
    fix: "Reframe as: In what situation would someone need this?"
  },

  missing_undesired: {
    error: "No undesired use cases identified",
    why: "What can go wrong? Malicious use? These create critical requirements.",
    fix: "Consider: failures, attacks, edge cases, misuse."
  },

  wrong_relationship: {
    error: "'{sub}' should be <<extends>> not <<includes>>",
    why: "Can the parent complete WITHOUT this? If yes → extends. If no → includes.",
    fix: "Ask: Is this REQUIRED or OPTIONAL for the parent to complete?"
  }
};
```

---

## COMPLETION CELEBRATION

```
✅ Use Case Model Complete

You've captured {X} use cases covering all scenarios your system must handle:
- {Y} primary use cases from main actors
- {Z} actor variants with different requirements
- {W} undesired/negative use cases
- {V} automated/internal use cases

💡 You discovered {N} undesired use cases that would have been
   expensive surprises if found during development.

Your use cases reveal:
- What your system must DO (not just what it IS)
- Edge cases most projects miss
- Clear priorities for development

Next: We'll walk through each high-priority use case step by step
to extract the detailed requirements hiding inside.
```

---

*Knowledge Bank: Use Case Diagram*
*Step 1.2 of PRD Creation Process*
