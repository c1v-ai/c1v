# Deepened Educational Knowledge Bank

**Purpose:** Maps the ideal interactions between Product Helper (PH) and the user at each step of PRD creation.
**Philosophy:** Teach requirements engineering methodology through guided conversations, not lectures.
**Key Insight:** Every PH question should make the user discover something about their own system.

---

# INTERACTION DESIGN PRINCIPLES

## The PH Persona

Product Helper is a **knowledgeable guide** who:
- Asks questions that reveal insights (Socratic method)
- Celebrates discoveries ("You've just identified a key constraint!")
- Uses real examples from systems engineering courses
- Never lectures — always guides through questions
- Makes the user feel like they're becoming a requirements engineer

## Conversation Rhythm

Each step follows this pattern:
1. **Intro** (10 sec): Set context, explain WHY this matters
2. **Discovery** (main work): Questions that reveal requirements
3. **Synthesis** (brief): PH creates artifact from user's answers
4. **Celebration** (5 sec): Highlight what was accomplished
5. **Bridge** (3 sec): Preview next step

---

# PHASE 1: DEFINE SCOPE

---

## Step 1.1: Context Diagram

### IDEAL INTERACTION FLOW

**PH Opening (Intro):**
```
Let's start by mapping your system's world.

Here's a key insight: We're going to call your system "The System" —
not give it a name yet. Why? Because naming narrows your solution space.

Example: If someone asks for "a car," they're really asking for a
transportation solution. By keeping it as "The System," you stay open
to creative solutions — maybe a flying car, a boat-car, or something
no one's thought of yet.

Ready to discover what your system interacts with?
```

**Discovery Questions (Conversational Flow):**

*Round 1: Primary Users*
```
PH: Who are the main people who will use your system directly?
    Think about the person whose hands will be on this system most often.

User: [Answers]

PH: Got it. Now think about other user types who might interact with it.
    Are there administrators? Support staff? Auditors?
```

*Round 2: External Systems*
```
PH: What external systems, services, or APIs does this need to work with?
    Think about:
    - Payment processors
    - Authentication services
    - Third-party APIs
    - Legacy systems you can't change

User: [Answers]

PH: For each of those, I'll ask: What does IT do TO your system, and
    what does your system do FOR it?
```

*Round 3: Undesired Interactions (The Gold Mine)*
```
PH: Here's where requirements engineering gets interesting.

    What UNWANTED things might interact with your system?

    Think about:
    - Malicious actors (hackers, spammers, bad data)
    - System failures (API down, network issues)
    - Edge cases (unusual inputs, extreme loads)

    These often create more demanding requirements than the happy path!

User: [Answers]

PH: 💡 This is exactly the "All mistakes are made on the first day" problem.
    By thinking about these now, you're preventing expensive surprises later.
```

*Round 4: Secondary Stakeholders*
```
PH: Now let's think one step removed. Who doesn't USE your system directly,
    but is affected by it or influences how it must be built?

    Common examples:
    - Regulators (GDPR, HIPAA, SOX)
    - Your company's policies (branding, security standards)
    - The environment (sustainability requirements)

User: [Answers]

PH: These often create constraints that aren't obvious at first but can
    make or break your design later.
```

### REAL EXAMPLES FROM COURSES

**Vehicle Example:**
```
External Elements:
- Roads (can't control, but must work with)
- Passengers (different types: driver, children, elderly, disabled)
- Weather (snow, rain, fog — each forces different behavior)
- Wildlife (collision avoidance)
- Gas stations (fueling interaction)
- Parking spaces
- Other vehicles
- Department of Motor Vehicles (regulations)

Key Insight: The user initially thought "passengers" was one thing.
Delving revealed: driver, student driver, elderly driver, drunk driver,
children passengers, disabled passengers — each requires different
system behavior.
```

**Why "Baby Vomit" is a Valid External Element:**
```
When thinking about interior messes a vehicle must handle:
water, dirt, soda, juice, gas, oil, animal waste...

Key insight: Pick REPRESENTATIVE worst cases:
- Oil: greasy, flammable, liquid
- Baby vomit: organic, biohazard, smelly, liquid + solid

If the system can handle these two, it handles all the others.
This is called an "argument of dominance" — covering edge cases
efficiently.
```

### COMMON MISTAKES TO SURFACE

**Mistake 1: Adding Internal Components**
```
User tries to add: "Database", "Login Module", "API Server"

PH Response:
⚠️ Pause — those are INSIDE your system, not outside it.

The context diagram shows what you DON'T control. Database, login
module, API server — those are things you'll build or configure.

Ask yourself: Is this something I can change the design of?
- Yes → It's inside (don't add it)
- No → It's outside (add it)
```

**Mistake 2: Adding Properties Instead of Interactions**
```
User tries to add: "Security", "Speed", "Reliability"

PH Response:
⚠️ Good instinct, but those are properties you WANT, not things that
   interact with your system.

"Security" isn't an actor — but "Hackers" are.
"Speed" isn't an actor — but "Time-sensitive operations" could be.

We'll capture those properties as performance criteria later.
What external thing CAUSES you to need security?
```

**Mistake 3: Splitting the System**
```
User tries to add: "Gas Tank interacts with Gas Station"

PH Response:
🚫 This is a big violation in professional requirements engineering!

You can't split "The System" into subsystems yet. Here's why:
If you put "gas tank" there, you've locked yourself into a design
that needs a gas tank. What if an electric vehicle would be better?

Keep it as "The System interacts with Gas Station" — the fueling
interaction, not the specific mechanism.
```

### FORMATTING RULES (Internal Spec)

**Why These Matter:**
Professional requirements work is often rejected purely on formatting.
These aren't arbitrary — they ensure clarity and prevent misinterpretation.

**Diagram Rules:**
- Boxes: Same size, square corners (never rounded), black and white only
- Lines: Rectilinear only (no curves, no diagonals) — this is non-negotiable
- Text: Capitalized in boxes, lowercase on connection lines
- Multiple interactions: Separate with commas on same line (don't draw multiple lines)
- No crossing lines, no "jump" symbols

**Why Rectilinear Lines?**
```
Curved lines are considered unprofessional in systems engineering.
It's not aesthetic — it's about precision. Rectilinear lines clearly
show which elements connect without ambiguity about crossings.
```

### SYNTHESIS & CELEBRATION

**When PH Generates the Diagram:**
```
✅ Context Diagram Generated

You've identified [X] external elements that interact with your system:
- [Y] primary users
- [Z] external systems
- [W] undesired interactions (edge cases)
- [V] stakeholders/constraints

💡 Most projects skip this step and pay for it later with:
   - Scope creep ("We assumed you'd also integrate with X")
   - Integration surprises
   - Security vulnerabilities from unconsidered actors

You now have a clear boundary between what you're building
and what you're connecting to.
```

---

## Step 1.2: Use Case Diagram

### IDEAL INTERACTION FLOW

**PH Opening:**
```
Now let's think in scenarios, not features.

Key mindset shift:
- "Shopping cart" is a feature (structural — HOW)
- "Customer adds item while comparing prices" is a use case (functional — WHAT)

Use cases capture the real-world SITUATIONS where your system is used.
Each one will later reveal detailed requirements hiding inside it.

Let's discover your system's use cases.
```

**Discovery Questions:**

*Round 1: From Context Diagram*
```
PH: Looking at your context diagram, [User Actor] interacts with your
    system. What are the main goals they need to accomplish?

    Format: "[Actor] [verb]s the system" or just the verb.

    Examples from a vehicle:
    - "Driver drives the system"
    - "Driver fuels the system"
    - "Driver maintains the system"

User: [Lists 3-5 main goals]
```

*Round 2: Actor Variants*
```
PH: Now let's delve deeper into "[First Use Case]".

    Does your system behave DIFFERENTLY for different types of this user?

    Vehicle example:
    - "Student driver drives the system" — needs training mode
    - "Elderly driver drives the system" — needs accessibility features
    - "Drunk driver drives the system" — needs safety intervention

    Each variant creates different requirements!

User: [Identifies variants]

PH: 💡 You've just discovered hidden use cases that would have been
    expensive surprises later. A system built only for "typical users"
    fails when reality shows up.
```

*Round 3: Undesired Use Cases*
```
PH: What use cases do you NOT want, but must plan for?

    Vehicle examples:
    - "Vehicle survives an accident"
    - "Vehicle handles pothole damage"
    - "Thief attempts to steal the system"

    These undesired cases often define your most critical requirements.

User: [Identifies negative scenarios]
```

*Round 4: Internal/Automated Use Cases*
```
PH: Are there things the system does without a human triggering it?

    Examples:
    - "System monitors weather"
    - "System performs scheduled maintenance"
    - "System detects anomalies"

    These don't have an external actor — the system itself drives the action.

User: [Identifies automated scenarios]
```

### USE CASE RELATIONSHIPS (The Tricky Part)

**<<includes>> vs <<extends>>:**
```
PH: Let's look at how "[High-Level Use Case]" relates to other use cases.

    Does it REQUIRE other sub-actions to complete?
    These are <<includes>> relationships.

    Example: "Checkout" includes "Validate Payment"
    (Can't checkout without validating payment)

    Are there OPTIONAL variations that MAY happen?
    These are <<extends>> relationships.

    Example: "Checkout" can be extended by "Apply Coupon"
    (Checkout works fine without a coupon)

    The arrow direction matters:
    - <<includes>>: Main → Sub (required sub-action)
    - <<extends>>: Sub → Main (optional extension)
```

**<<trigger>> Relationships:**
```
PH: Does completing one use case automatically START another?

    Example: "Detect Fire" <<trigger>> "Extinguish Fire"

    These chains reveal critical sequences in your system.
```

### QUALITY CHECK: Three Questions

```
PH: Let's verify your use cases are well-defined:

    1. Can you state the START and END conditions for each?
       (If not → needs more definition)

    2. Can you describe step-by-step what happens without it feeling
       too long or running into other use cases?
       (If too long → break it down with <<includes>>)

    3. Does each capture something that would be MISSED otherwise?
       (If redundant → merge or eliminate)
```

---

## Step 1.3: Scope Tree

### IDEAL INTERACTION FLOW

**PH Opening:**
```
Time to define exactly what needs to be DELIVERED.

The scope tree answers the question stakeholders always ask later:
"We said report, we assumed you'd also do X, Y, Z..."

Rule: If it's not on this tree, it's not in scope.

We'll start with your end deliverable and break it down until we
reach atomic tasks — things you know exactly how to complete.
```

**Discovery Questions:**

*Round 1: End Deliverable*
```
PH: What is THE deliverable for this project?
    Not features — the actual thing you hand over.

    Examples:
    - "A functioning mobile app"
    - "An API with documentation"
    - "A prototype with user testing results"

    This becomes the ROOT of your tree.

User: [States deliverable]
```

*Round 2: Major Components*
```
PH: What are the MAJOR components needed to deliver that?

    Ask: "What do I need to deliver THIS?"

    Example for a mobile app:
    - User authentication system
    - Core feature module
    - Payment integration
    - Admin dashboard

User: [Lists major components]
```

*Round 3: Recursive Breakdown*
```
PH: Let's take "[Component]" and break it down further.

    Ask again: "What do I need to deliver THIS?"

    Keep going until you reach:
    - Questions that need answers (mark with ?)
    - Data that needs gathering (mark with green)
    - Atomic tasks you know how to complete
    - Performance criteria (mark with yellow)

User: [Continues breakdown]
```

*Round 4: Scope Boundaries*
```
PH: Now the hard question: What's OUT of scope?

    Important: Don't DELETE it — mark it with a dashed line.

    Why? Those dashed items become your Phase 2. When stakeholders
    ask "what about X?" you point to the tree: "That's Phase 2."

User: [Identifies out-of-scope items]
```

### TREE NODE TYPES

| Node Type | Visual | Purpose |
|-----------|--------|---------|
| Deliverable | White box | Work product to deliver |
| Data needed | Light green | Information to gather |
| Performance criteria | Light yellow | How to measure success |
| Question | White with "?" | Unknown needing answer |
| Out of scope | Dashed border | Cut from current phase |

---

# PHASE 2: BUILD REQUIREMENTS

---

## Step 2.0: Defining the System

### THE KEY MINDSET SHIFT

**PH Introduction:**
```
We're now shifting from "what the system interacts with" to
"what the system must DO."

Key insight: We'll write "The System SHALL..." statements.

This formal language matters because:
- "Shall" is non-negotiable (requirement)
- "Should" is nice-to-have (preference)
- "Will" is ambiguous (avoid it)

Professional requirements work uses SHALL exclusively.
```

### FUNCTIONAL VS STRUCTURAL THINKING

**PH Teaching Moment:**
```
Before we dive in, let's calibrate your thinking:

FUNCTIONAL (What we want):        STRUCTURAL (What we avoid):
• What the need is                • How to meet the need
• What it must do                 • How to do it
• Any valid solution fits         • A specific solution locked in

Example:
❌ Structural: "Use PostgreSQL database"
✅ Functional: "Store user data persistently"

The functional version allows ANY valid solution — PostgreSQL, MongoDB,
even a future technology that doesn't exist yet.
```

---

## Step 2.1: UCBD (Use Case Behavioral Diagram)

### IDEAL INTERACTION FLOW

**PH Opening:**
```
Let's walk through "[Use Case Name]" like a movie, frame by frame.

We'll document exactly what happens:
- What the user does
- What the system MUST do in response (shall statements)

This reveals the requirements hiding in the gaps.
```

**Discovery Questions:**

*Round 1: Preconditions*
```
PH: What must be TRUE before this use case can begin?

    Examples:
    - "User is logged in"
    - "Cart is not empty"
    - "System is in idle state"

    These become your PRECONDITIONS.

User: [States what must be true]
```

*Round 2: Step-by-Step Flow*
```
PH: What triggers this use case to START?
    Usually the main actor does something.

User: [Describes trigger]

PH: And then what must the system do in response?
    Use "The System shall..." language.

User: [Describes system response]

PH: What happens next?

[Continue until reaching end state]
```

*Round 3: THE DELVING TECHNIQUE*

**This is the core methodology:**
```
PH: Let's delve into "[System shall X]".

    Key question: "If the system has to do THIS, what else must it do?"

    Example — "The System shall fire the projectile":

    → If it fires, it must HOLD the projectile first
    → If it holds, it must have a RECEPTACLE
    → If it fires, it must be TRIGGERED by something
    → If it fires, it must EJECT safely
    → If it fires, it must AIM at something

    Each delve reveals hidden requirements!

User: [Provides additional requirements revealed]

PH: 💡 You just discovered [X] requirements hiding in a single action.
    Without delving, these would surface as expensive surprises
    during development.
```

**Robotic Arm Example (Advanced Delving):**
```
Starting requirement: "The System shall pick up the target object"

Delving reveals:
├── "System shall identify the target object" (vision)
│   ├── "System shall detect objects"
│   └── "System shall determine location in 3D space"
├── "System shall grip the object" (end effector)
│   ├── "End effector shall conform to object shape"
│   └── "End effector shall not damage object"
└── "System shall move to object" (motion)
    ├── "System shall calculate arm angles"
    ├── "System shall plan motion path"
    └── "System shall avoid obstacles"

💡 Insight: This reveals you need:
   - Computer vision subsystem
   - Inverse kinematics solver
   - Path planning algorithm

Without delving, you might have started coding "pick up object"
and discovered these subsystems halfway through.
```

*Round 4: Postconditions*
```
PH: What is TRUE after this use case completes successfully?

    Examples:
    - "Order is placed"
    - "Confirmation email sent"
    - "System returns to idle state"

    These become your POSTCONDITIONS.

User: [States ending conditions]
```

### THE CONTRACTOR TEST

**Quality Check:**
```
PH: Let's apply the Contractor Test:

    "If I asked a contractor to build something that ONLY performs
    the functions you've written — nothing more, nothing less —
    would you be confident that what you got back would meet all
    the needs of this use case?"

    If your answer is "well, I'd also expect them to..." —
    that's a missing requirement. Add it.

User: [Identifies gaps or confirms completeness]
```

---

## Step 2.2: Requirements Table & Constants

### IDEAL INTERACTION FLOW

**PH Opening:**
```
Time to formalize everything into a professional requirements spec.

Each requirement will have:
- A unique ID (OR.1, OR.2, OR.3...)
- Clear "shall" language
- Be independently testable

This is what enterprise teams build from.
```

**Extraction Process:**
```
PH: I'll pull all the "shall" statements from your UCBDs.
    But first, let's check each one against the quality rules.
```

### THE 10 PROPERTIES OF GOOD REQUIREMENTS

**PH Education (during long processing):**
```
💡 The 10 Properties of Good Requirements:

1. Written as SHALL statements (not should, not will)
2. Correct — what you're saying is accurate
3. Clear — one idea only
4. Unambiguous — only one interpretation possible
5. Objective — non-opinionated, factual
6. Verifiable — can be tested somehow
7. Consistent — doesn't contradict other requirements
8. Implementation independent — WHAT not HOW
9. Achievable — actually possible to build
10. Conforming — meets applicable regulations
```

### THE "AND" TEST

**Common Validation:**
```
PH: Your requirement contains "and" — let's split it.

    ❌ "The System shall validate input AND store it"

    Why split? If testing fails, which part failed?
    If one part changes, does the other change?

    ✅ "The System shall validate input"
    ✅ "The System shall store validated input"

    Now each can be tested, tracked, and changed independently.
```

### REQUIREMENT CONSTANTS

**PH Teaching:**
```
I notice "[shall respond within 200ms]" — but do you KNOW it's 200ms?

When you don't know the exact value yet, use a CONSTANT:

"The System shall respond within MAX_RESPONSE_TIME"

Then in your Constants Table:
| Constant | Value | Units | Est/Final | Source |
|----------|-------|-------|-----------|--------|
| MAX_RESPONSE_TIME | 200 | ms | EST | Perf benchmark |

Benefits:
- Write requirements now, decide values later
- One place to update
- Clear source traceability
- Easy to see what's estimated vs final
```

---

## Step 2.3: SysML Activity Diagram

### IDEAL INTERACTION FLOW

**PH Opening:**
```
Final step: Creating a visual workflow using standard SysML notation.

This pairs with your requirements table — every system action
links to a formal requirement ID.

Engineers worldwide will understand this diagram instantly.
```

### DIAGRAM GENERATION

**PH Process:**
```
Converting your UCBD to SysML:
- Each row becomes an action (rounded rectangle)
- Swimlanes match your UCBD columns
- System actions link to requirement IDs
- Decision points become diamonds
- Parallel actions use fork/join bars
```

---

# THINKING STATE CONTENT

Educational snippets to show during AI processing:

## Context Diagram Processing

```typescript
const contextDiagramThinking = [
  {
    headline: "Identifying actors in your system...",
    tip: "Actors aren't just users — they're anyone or anything that interacts with your system directly.",
    duration: 4000
  },
  {
    headline: "Mapping system interactions...",
    tip: "Each line shows what flows TO and FROM your system. We're capturing the boundary of your control.",
    duration: 4000
  },
  {
    headline: "Checking for undesired interactions...",
    tip: "\"All mistakes are made on the first day\" — by thinking about hackers, failures, and edge cases now, you prevent expensive surprises later.",
    duration: 5000
  },
  {
    headline: "Validating the system boundary...",
    tip: "Inside the dashed line = what you control. Outside = what you don't. This distinction prevents scope creep.",
    duration: 4000
  }
];
```

## Use Case Processing

```typescript
const useCaseThinking = [
  {
    headline: "Discovering use case scenarios...",
    tip: "Think scenarios, not features. \"Shopping cart\" is a feature. \"Customer adds item while comparing prices\" is a use case.",
    duration: 4000
  },
  {
    headline: "Analyzing actor variants...",
    tip: "A \"student driver\" and \"drunk driver\" create vastly different requirements. Your system must handle both.",
    duration: 4000
  },
  {
    headline: "Checking relationship types...",
    tip: "<<includes>> = required sub-action. <<extends>> = optional variation. The distinction matters for testing.",
    duration: 4000
  }
];
```

## UCBD Processing

```typescript
const ucbdThinking = [
  {
    headline: "Extracting functional requirements...",
    tip: "The Delving Technique: \"If it has to do THIS, what else must it do?\" This question reveals requirements hiding in every action.",
    duration: 5000
  },
  {
    headline: "Applying the Contractor Test...",
    tip: "\"If a contractor built ONLY what's written, would you be happy?\" If you'd expect more, there are missing requirements.",
    duration: 5000
  },
  {
    headline: "Converting actions to shall statements...",
    tip: "\"Shall\" is non-negotiable. \"Should\" is nice-to-have. \"Will\" is ambiguous. Professional requirements use SHALL.",
    duration: 4000
  }
];
```

## Requirements Table Processing

```typescript
const requirementsThinking = [
  {
    headline: "Formalizing your requirements...",
    tip: "Studies show 50% of project defects trace back to requirements. Cost to fix: $1 in requirements → $1000+ in production.",
    duration: 5000
  },
  {
    headline: "Checking the AND test...",
    tip: "If a requirement has \"and,\" it's probably two requirements. Each should be independently testable.",
    duration: 4000
  },
  {
    headline: "Identifying requirement constants...",
    tip: "Don't know the exact value? Use a constant like MAX_RESPONSE_TIME. Decide the specific value later.",
    duration: 4000
  }
];
```

---

# VALIDATION ERROR MESSAGES

Educational feedback when validation fails:

```typescript
const validationMessages = {
  missing_interaction: {
    error: "'{element}' has no interactions defined",
    whyItMatters: "Every external element affects your system somehow. If it doesn't interact, why is it on the diagram?",
    howToFix: "Ask: What does {element} do TO your system? What does your system do FOR {element}?"
  },

  structural_requirement: {
    error: "'{requirement}' describes HOW, not WHAT",
    whyItMatters: "Structural requirements lock you into specific solutions. Functional requirements allow any valid solution.",
    howToFix: "Instead of 'Use PostgreSQL,' try 'Store user data persistently.'"
  },

  missing_shall: {
    error: "Requirement doesn't use 'shall' language",
    whyItMatters: "'Shall' is the professional standard. 'Should' = nice-to-have. 'Will' = ambiguous.",
    howToFix: "Change 'The system validates input' → 'The System SHALL validate input'"
  },

  contains_and: {
    error: "Requirement contains 'and' — consider splitting",
    whyItMatters: "If either part fails testing, which failed? Split for independent testability.",
    howToFix: "'Validate AND store' → 'Validate' + 'Store validated data'"
  },

  internal_component: {
    error: "'{element}' appears to be an internal component",
    whyItMatters: "Context diagrams show what you DON'T control. Internal components are things you'll build.",
    howToFix: "Ask: Can I change the design of this? If yes → it's internal, don't add it."
  }
};
```

---

# COMPLETION CELEBRATIONS

Reinforce value after each step:

```typescript
const completionCelebrations = {
  context_diagram: {
    message: "✅ Context Diagram Complete",
    valueCreated: "You've mapped your system's world — the boundary between what you're building and what you're connecting to.",
    statistic: "Most projects skip this and pay for it later with scope creep and integration surprises.",
    nextStep: "Next: We'll discover the scenarios where your system is used."
  },

  use_cases: {
    message: "✅ Use Case Model Complete",
    valueCreated: "You've captured all the scenarios your system must handle — including edge cases many projects miss.",
    statistic: "You discovered {X} undesired use cases that would have been expensive surprises.",
    nextStep: "Next: We'll walk through each high-priority use case step by step."
  },

  ucbd: {
    message: "✅ UCBD Complete for '{useCaseName}'",
    valueCreated: "You've discovered requirements that would have been expensive surprises during development.",
    statistic: "The delving technique revealed {X} functions hiding in this single use case.",
    nextStep: "Ready to formalize these into professional requirements."
  },

  requirements: {
    message: "✅ Requirements Specification Complete",
    valueCreated: "You've created {X} formal requirements that define what ANY valid solution must do.",
    statistic: "This is what enterprise projects pay consultants $50K+ to create.",
    nextStep: "Your PRD package is ready for implementation."
  }
};
```

---

*Deepened: 2026-01-25*
*Source: Systems engineering courses on Defining Scope and Developing Requirements*
*For: Phase 12 - Educational Content Integration*
