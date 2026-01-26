# Knowledge Bank: Functional Requirements List

**Step:** 2.2 - Requirements Table & Constants
**Purpose:** Formalize all requirements into a professional specification
**Core Question:** "Is this requirement clear, testable, and unambiguous?"

---

## WHY THIS STEP MATTERS

The Requirements Table is the professional-grade deliverable:

- Creates a single source of truth for what the system must do
- Enables traceability (requirement → use case → stakeholder need)
- Allows testing against specific requirements
- This is what enterprise teams build from

> Studies show 50% of project defects trace back to requirements.
> Cost to fix: $1 in requirements → $10 in design → $100 in code → $1000+ in production.

**The discovery effect:** As you focus on writing functional requirements, you discover more needs, which lead to more defined requirements and further clarity about how your system solves the challenge. You're not defining your system as a thing — you're defining it as something that must achieve a **collection of functions**. The more you discover, the more clearly you can target your design, and the better you'll solve the challenge.

---

## WHAT IS A REQUIREMENTS TABLE?

A requirements table copies all SHALL statements from your UCBDs into a single, trackable table. It typically has three columns:

| Index | Requirement | Abstract Function Name |
|-------|-------------|------------------------|
| OR.1 | The System SHALL be able to store the energy input from the operator | store_energy_input |
| OR.2 | The System SHALL detect the receptacle in proper position | detect_receptacle |
| OR.3 | The System SHALL secure the receptacle in position | secure_receptacle |
| OR.4 | The receptacle SHALL be able to hold a loaded projectile indefinitely | hold_loaded_projectile |
| OR.5 | The System SHALL detect the command to release from the child | detect_command |
| OR.6 | The System SHALL eject the contents of the receptacle | eject_contents |

**Key Elements:**
- **Index:** A unique ID for tracking. The prefix designates the requirement's origin (see ID Conventions below).
- **Requirement:** The formal SHALL statement, copied from the system swimlane of your UCBD.
- **Abstract Function Name:** A short, unique name for this requirement. Used to reference the requirement in other diagrams and documents. Kept short; typically snake_case. No widely accepted rules for naming — just be consistent and unique.

**How to populate:** Go to each completed UCBD, look at the system swimlane, and for each SHALL statement, create a separate row in the requirements table.

---

## THE 10 PROPERTIES OF GOOD REQUIREMENTS

Every requirement should be:

| # | Property | What It Means | Bad Example | Good Example |
|---|----------|---------------|-------------|--------------|
| 1 | **SHALL Statement** | Uses "shall" language | "The system validates" | "The System SHALL validate" |
| 2 | **Correct** | Accurately states the need — checked against what your team AND customer are saying | Misstated business rule | Verified with team + stakeholder |
| 3 | **Clear** | One idea only | "validate AND store" | Two separate requirements |
| 4 | **Unambiguous** | Only one interpretation | "fast response" | "respond within 200ms" |
| 5 | **Objective** | Non-opinionated — make sure the words themselves are non-opinionated | "nice interface" | "complies with WCAG 2.1" |
| 6 | **Verifiable** | Can be tested | "easy to use" | "complete task in <3 clicks" |
| 7 | **Consistent** | No contradictions (critical at scale — large teams can have 10,000+ requirements) | Conflicts with OR.5 | Reviewed against all others |
| 8 | **Impl. Independent** | WHAT not HOW | "use PostgreSQL" | "store data persistently" |
| 9 | **Achievable** | Actually possible | "100% uptime" | "99.9% uptime" |
| 10 | **Conforming** | Meets regulations | Violates GDPR | GDPR compliant |

**On "SHALL":** Many agencies will not accept requirements written any other way, regardless of how good the ideas are. The course presents "11 rules" — where rules 1, 3, 5, 7, and 9 are all "write shall statements." That's how central it is. But it's the other properties that are truly important for making requirements serve your design process. SHALL is the professional entry ticket.

**The "and" rule:** If a requirement contains "and" or similar conjunctions, split it into two or more requirements. This is important for both **assigning requirements to teams** and for **testing** later on — if testing fails, you need to know which part failed.

**Verification vs Validation:**
- **Verification** — testing your system against the design parameters (did you build it right?)
- **Validation** — how well the system meets the needs of stakeholders (did you build the right thing?)
Both are important, but verification is essential for proving you have met contractual obligations. Well-written requirements enable both.

---

## IDEAL INTERACTION FLOW

### Opening (Set Context)

```
PH: Time to formalize everything into a professional requirements spec.

Each requirement will have:
- A unique ID for tracking
- Clear "SHALL" language
- Be independently testable

This is what developers build from and testers verify against.
```

### Round 1: Extract from UCBDs

**Goal:** Pull all SHALL statements from completed UCBDs

```
PH: I'll extract all the "SHALL" statements from your UCBDs.

For each one, we'll verify it meets professional standards.

[System extracts requirements]

Found {X} requirements across {Y} use cases.
Let's review each one.
```

### Round 2: The "AND" Test

**Goal:** Split compound requirements

```
PH: This requirement contains "and":

"The System SHALL validate input AND store it"

⚠️ This is actually TWO requirements. Why split?

1. If testing fails, which part failed?
2. If one changes, does the other change?
3. Can they be implemented separately?

Split into:
- OR.1: "The System SHALL validate input"
- OR.2: "The System SHALL store validated input"

Now each can be tested, tracked, and changed independently.
```

### Round 3: Ambiguity Check

**Goal:** Make vague requirements specific

```
PH: This requirement is ambiguous:

"The System SHALL respond quickly"

What does "quickly" mean? 100ms? 1 second? 5 seconds?

Options:
1. Define a specific value: "within 200ms"
2. Use a constant: "within MAX_RESPONSE_TIME"

Let's make it measurable.

[User provides specific value or confirms constant]
```

### Round 4: Functional vs Structural

**Goal:** Ensure requirements describe WHAT, not HOW

**The key insight:** Good functional requirements are not about what your system **does** — they're about the **functionality** needed to be able to do it. The system isn't doing so much as it is being designed to have an **ability**. This shift opens the door to more solutions AND more questions.

**The progression from structural to functional:**
```
❌ Too structural: "The system's arm fires a projectile"
   (Forces you to have an arm. What if another mechanism is better?)

⚠️ Better:        "The system fires a projectile"
   (Removes the arm, but still describes an action)

✅ Functional:     "The system SHALL BE ABLE TO fire the projectile"
   (Describes an ability — opens doors to solutions AND questions:
    "If it can fire, what else must it be able to do?")
```

**Another example:**
```
❌ Structural: "The system SHALL have a steering wheel"
   (Prescribes a specific solution)

✅ Functional: "The system SHALL have a user interface that allows a driver
   to quickly and accurately control the direction of the vehicle"
   (Any engineer can now creatively solve this need)
```

```
PH: Let me check your requirements for structural language.

For each requirement, I'll ask:
  - Does this describe an ABILITY the system must have,
    or a specific IMPLEMENTATION?
  - Could an engineer design multiple different solutions
    that all meet this requirement?

If the requirement forces one specific solution, let's rewrite it
to describe the NEED instead.

Ask yourself:
  1. How could this be reworded to focus on what needs are to be met?
  2. What interactions with exterior elements need to be captured?
  3. Is this about what the system DOES or what it must BE ABLE TO do?

[User reframes structural requirements as functional]
```

### Round 5: Requirement Constants

**Goal:** Handle unknown values professionally while preserving reasoning

```
PH: You mentioned "respond within 200ms" — do you KNOW it's 200ms?

If the exact value isn't confirmed, use a CONSTANT.
A good constant carries both the SPIRIT (why) and the LETTER (testable):

"The System SHALL respond within MaxResponseTime"

Then in your Constants Definition Table:

| Constant | Value | Units | Est/Final | Source | Owned By |
|----------|-------|-------|-----------|--------|----------|
| MaxResponseTime | 200 | ms | Estimate | Performance benchmark | [name] |

Benefits:
- Write requirements now, confirm values later
- One place to update when value is finalized
- Clear audit trail of where values came from
- If a constant is used in multiple requirements, changing its value
  updates all of them — and the cross-reference matrix shows which
  requirements are affected

Use a DESCRIPTIVE name (not x1, x2):
  ✅ MaximumEnergyInput, CanBeCarriedByA5YearOld
  ❌ x1, const_a, threshold

[User confirms value or creates constant]
```

### Round 6: Verification Method

**Goal:** Ensure every requirement is testable

```
PH: How would you PROVE this requirement is met?

"The System SHALL validate user input"

What's the test?
- "Given invalid input, system rejects with error message"
- "Given valid input, system accepts and proceeds"

If you can't describe a test, the requirement may be too vague.

[User describes verification approach]
```

### Round 7: Outside Perspective Review

**Goal:** Catch blind spots by reviewing requirements as if you were handing them to a contractor

```
PH: Let's review your requirements from an outsider's perspective.

Imagine handing these requirements to a contractor who will build
something that performs JUST these functions and nothing else.

For each requirement, ask:
  1. "If the system has to be able to do this, what else must it do?"
     → Are there hidden sub-functions we missed?

  2. "Are there other functions that need to occur at the same time?"
     → Parallel actions are easy to miss.

  3. "Are the requirements focused on:
     - what NEEDS have to be met,
     - what the system must BE ABLE TO do, and
     - how the parts of the system INTERACT?"
     → Or did we slip into describing HOW?

If you read through your requirements and think "well, I'd also
expect them to..." — that's a missing requirement. Add it.

[Review and add missing requirements]
```

---

## REQUIREMENT ID CONVENTIONS

### Prefixes

The exact difference between designations can vary between organizations, but they typically indicate:
- **What is the source** of the requirement
- **Whether the requirement was shared** with an external group or used only internally
- **At what point in the design process** the requirement was developed

Common designations:
- **OR** — Originating Requirement (from stakeholder/use case — the primary type)
- **DR** — Derived Requirement (discovered through analysis of other requirements)
- **IR** — Implied Requirement (not explicitly stated but necessary)
- **PR** — Performance Requirement (defines how well a function must be performed)
- **CR** — Constraint Requirement (regulatory, technical, or environmental limitation)

For most projects, label all requirements as **OR** (originating requirements) and add more specific designations only if your organization requires them.

### Format
```
OR.1, OR.2, OR.3...
DR.1, DR.2, DR.3...
```

### Abstract Function Naming
```
[snake_case_description]

Examples:
- store_energy_input
- detect_receptacle
- secure_receptacle
- hold_loaded_projectile
```

Keep names **short and unique**. No widely accepted rules exist for abstract names — consistency is what matters.

---

## REQUIREMENT CONSTANTS DEFINITION TABLE

When exact values aren't known, use **requirement constants** — named placeholders similar to constants in code. They allow you to write a requirement now and define (or refine) the value later without rewriting the requirement.

### Why Constants Matter: Spirit + Letter

A good requirement constant carries both the **reasoning** (why this limit exists) and the **verifiability** (a testable value):

```
❌ Spirit only: "The system SHALL be light enough for a 5-year-old to carry"
   (How do you test this? Strength of 5-year-olds varies.)

❌ Letter only: "The system SHALL weigh less than 10 pounds"
   (Easy to test, but WHY 10 pounds? Would 5 be much better?)

✅ Both: "The system SHALL weigh less than CanBeCarriedByA5YearOld"
   (Reads as: "shall weigh less than can be carried by a 5-year-old"
    — carries spirit AND is testable once you define the value.)
```

### Required Columns (Minimum 3)

The constants definition table must have at least three columns:

| Constant Name | Value | Units |
|--------------|-------|-------|
| MaximumEnergyInput | 10 | J |
| CanBeCarriedByA5YearOld | TBD | lbs |

### Full Template (Recommended)

| Constant | Value | Units | Estimate/Final | Date Updated | Final Date | Source | Owned By | Notes |
|----------|-------|-------|----------------|--------------|------------|--------|----------|-------|
| MaximumEnergyInput | 10 | J | Estimate | 2024-10-20 | 2024-11-10 | Int'l Toy Catapult Standards Assoc. | Rebecca | Pending final safety testing |
| MaxLaunchVelocity | 5.0 | m/s | Final | 2024-01-20 | — | Safety standard | Alex | Confirmed |
| MinResponseTime | TBD | ms | Estimate | — | 2024-03-01 | Stakeholder req. | TBD | Need to determine source |

**Additional tracking columns** (for ongoing projects):
- **Estimate/Final** — Whether the current value is an estimate or final
- **Date Updated** — When the value was last updated
- **Final Date** — When the final value is due
- **Source** — Where the value came from (customer, government, testing, etc.)
- **Owned By** — Who is responsible for setting/updating this value
- **Notes** — Any additional context

### Cross-Reference Matrix (Sample 2 Pattern)

When constants are used in multiple requirements, add a column for each requirement ID and mark with "X" where that constant is used. This way, if a constant's value changes, you immediately know which requirements are affected — instead of searching through all requirements manually.

| Constant | Value | Units | OR.1 | OR.2 | OR.3 | OR.4 | OR.5 |
|----------|-------|-------|------|------|------|------|------|
| cons.1 | 23.5 | kg | X | | | | X |
| cons.2 | 1.7 | m | | X | X | X | |
| cons.3 | 0.0012 | s | X | | | | X |

### Constants with Document References

A constant's "value" can be a **location where a document can be found** rather than a simple number. For example: "The system SHALL meet ReliabilityStandards" where the constant points to a document defining those standards. This is not uncommon, though opinions vary on whether it's best practice.

### Constant Name Rules
- Use **descriptive names** that capture what the constant represents
- Long names are better than generic ones (`MaximumEnergyInput` not `x1`)
- When you have hundreds of requirements, `x1, x2, x3` are impossible to remember
- Both naming conventions are used:
  - **CamelCase:** `MaximumEnergyInput`, `CanBeCarriedByA5YearOld`
  - **Underscores:** `Maximum_Energy_Input`, `can_be_carried_by_a_5_year_old`
- CamelCase is traditional (throwback to software code constants)

---

## REQUIREMENT COMPLETENESS

You have achieved **requirement completeness** when you can take your list of requirements, hand it to another group of engineers (a separate contractor), and it wouldn't matter what solution they came back with — as long as it met the set of requirements, you would be satisfied that it was a valid solution.

This may take many iterations to achieve. It's the ultimate goal of the requirements process.

**The uses of requirements throughout the design process:**
1. **Design specifications** — defining what any valid solution must do
2. **Responsibility allocation** — assigning sets of requirements to different teams ("your team is responsible for achieving this functionality")
3. **Testing and verification** — using requirements for accountability tracking and determining whether tests are a success
4. **Validation** — proving your system meets each requirement you submitted to your team, customer, or government

**Think of requirements as a design contract:** Requirements shared with external groups are essentially official contracts. Your company may ride on whether those requirements are written in a way you can support appropriately.

### Adding Requirements Outside UCBDs

It's perfectly fine to add functional requirements that don't come directly from a UCBD. If it's an important function that would probably have shown up in one of the UCBDs you didn't have time to create, add it to the requirements table anyway.

**In these cases, record where the inspiration came from.** If the source changes (e.g., a stakeholder request is withdrawn), you'll know to either alter or eliminate that requirement.

---

## COMMON MISTAKES TO CATCH

### Mistake 1: Contains "AND"

```
"The System SHALL validate input AND display errors"

PH: ⚠️ Split this into two requirements:
- OR.1: "The System SHALL validate input"
- OR.2: "The System SHALL display validation errors"

Each requirement = one testable thing.
```

### Mistake 2: Contains "OR"

```
"The System SHALL authenticate via password OR biometrics"

PH: ⚠️ This could be two requirements:
- OR.1: "The System SHALL support password authentication"
- OR.2: "The System SHALL support biometric authentication"

Or if it's truly either/or, clarify the condition.
```

### Mistake 3: Vague/Unmeasurable

```
"The System SHALL be user-friendly"

PH: ⚠️ How would you test this?

Make it measurable:
- "Users SHALL complete core tasks in <3 clicks"
- "System SHALL comply with WCAG 2.1 AA"
- "New users SHALL complete onboarding in <2 minutes"
```

### Mistake 4: Uses "Should" or "Will"

```
"The System should validate input"
"The System will validate input"

PH: ⚠️ Professional requirements use "SHALL".

- "SHALL" = non-negotiable requirement
- "Should" = nice-to-have (not a requirement)
- "Will" = ambiguous (future tense? intention?)

Change to: "The System SHALL validate input"
```

### Mistake 5: Implementation-Specific

```
"The System SHALL use JWT tokens for authentication"

PH: ⚠️ That's HOW (structural), not WHAT (functional).

What's the NEED?
- "The System SHALL authenticate users securely"
- "The System SHALL maintain user sessions"
- "Authentication tokens SHALL expire after SESSION_TIMEOUT"

Implementation choice (JWT vs session cookies) comes later.
```

---

## THINKING STATE MESSAGES

```typescript
const requirementsThinking = [
  {
    headline: "Extracting requirements from UCBDs...",
    tip: "Every 'SHALL' statement becomes a formal requirement with a unique ID.",
    duration: 4000
  },
  {
    headline: "Applying the AND test...",
    tip: "If a requirement has 'and,' it's probably two requirements. Each should be independently testable.",
    duration: 4000
  },
  {
    headline: "Checking for ambiguity...",
    tip: "'Fast,' 'easy,' 'user-friendly' aren't measurable. Convert to specific, testable criteria.",
    duration: 4000
  },
  {
    headline: "Identifying requirement constants...",
    tip: "Don't know the exact value? Use a constant like MAX_RESPONSE_TIME. Decide the specific value later.",
    duration: 4000
  },
  {
    headline: "Validating against the 10 properties...",
    tip: "SHALL statement? Clear? Unambiguous? Verifiable? Consistent? Implementation-independent?",
    duration: 5000
  }
];
```

---

## TOOLTIPS

| Term | Definition |
|------|------------|
| **SHALL** | Non-negotiable requirement — the professional standard word. |
| **Originating Requirement (OR)** | A requirement that comes directly from stakeholders or use cases. |
| **Derived Requirement (DR)** | A requirement discovered through analysis of other requirements. |
| **Requirement Constant** | A named placeholder for a value not yet finalized (e.g., MaximumEnergyInput). Carries both reasoning and testability. |
| **Constants Definition Table** | Tracks all constants with their values, units, sources, ownership, and which requirements use them. |
| **Cross-Reference Matrix** | Extension of the constants table that marks which requirements use each constant (X marks). |
| **Verification** | Testing your system against the design parameters — did you build it right? |
| **Validation** | How well the system meets stakeholder needs — did you build the right thing? |
| **Functional Requirement** | Describes WHAT the system must do, not HOW. |
| **Requirement Completeness** | Achieved when any contractor could build a valid solution from your requirements alone. |
| **Traceability** | Linking requirements back to their source (use case, stakeholder). |
| **Abstract Function Name** | A short, unique name for a requirement used in other diagrams and documents. |

---

## VALIDATION ERRORS

```typescript
const validationErrors = {
  contains_and: {
    error: "Requirement contains 'and' — consider splitting",
    why: "If either part fails testing, which failed? Split for independent testability.",
    fix: "Create separate requirements for each part."
  },

  no_shall: {
    error: "Requirement doesn't use 'SHALL' language",
    why: "'SHALL' is the professional standard. 'Should' = nice-to-have. 'Will' = ambiguous.",
    fix: "Change 'The system validates' → 'The System SHALL validate'"
  },

  unmeasurable: {
    error: "'{requirement}' cannot be objectively measured",
    why: "If you can't test it, you can't prove it's met.",
    fix: "Define specific, measurable criteria."
  },

  structural: {
    error: "'{requirement}' describes HOW, not WHAT",
    why: "Implementation details lock you into specific solutions.",
    fix: "What NEED does this address? Write that instead."
  },

  undefined_constant: {
    error: "Constant '{name}' has no entry in Constants Table",
    why: "Every constant needs a defined value (even if estimated).",
    fix: "Add to Constants Table with value, units, source."
  },

  contradicts: {
    error: "'{req1}' may contradict '{req2}'",
    why: "Conflicting requirements cause implementation confusion.",
    fix: "Review both requirements and resolve the conflict."
  }
};
```

---

## COMPLETION CELEBRATION

```
✅ Requirements Specification Complete

You've created {X} formal requirements that define what ANY valid solution must do:
- {Y} originating requirements from use cases
- {Z} derived requirements from analysis
- {W} requirement constants defined

💡 This is what enterprise projects pay consultants $50K+ to create.

Studies show 50% of project defects trace back to requirements.
You've eliminated that risk by:
- Making every requirement clear and unambiguous
- Ensuring every requirement is testable
- Keeping requirements functional (WHAT) not structural (HOW)

Developers can now estimate accurately and build confidently.
Testers know exactly what to verify.

Next: We'll create a visual SysML Activity Diagram that pairs
with this requirements table.
```

---

## PROCESS CHECKLIST

| Step | Action | Complete When |
|------|--------|---------------|
| 1 | Extract all SHALL statements from completed UCBDs into a Requirements Table | Every system swimlane statement has a row |
| 2 | Assign unique IDs (OR.1, OR.2, ...) and abstract function names | Every requirement has an index and name |
| 3 | Run the "AND" test — split compound requirements | No requirement contains "and" or similar conjunctions |
| 4 | Ambiguity check — make vague terms specific or use constants | No requirement uses "fast," "easy," "good," etc. without quantification |
| 5 | Functional vs structural check — rewrite HOW as WHAT | All requirements describe needs, not implementations |
| 6 | Create requirement constants for unknown values | Constants Definition Table exists with Name, Value, Units (minimum) |
| 7 | Build cross-reference matrix if constants are shared across requirements | Constants table shows which requirements are affected by each constant |
| 8 | Verification method for each requirement — how would you test it? | Every requirement has a describable test |
| 9 | Consistency check — no contradictions between requirements | No requirement conflicts with another |
| 10 | Add requirements discovered outside UCBDs (with source recorded) | All known functional needs are captured |
| 11 | Outside perspective review — hidden sub-functions? parallel actions? focused on needs/abilities/interactions? | No "I'd also expect them to..." gaps |
| 12 | Contractor test — could a separate team build a valid solution from these requirements alone? | Requirement completeness achieved |

---

*Knowledge Bank: Functional Requirements List*
*Step 2.2 of PRD Creation Process*
