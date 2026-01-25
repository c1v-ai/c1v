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

---

## WHAT IS A REQUIREMENTS TABLE?

A formal list of every "SHALL" statement extracted from your UCBDs:

| Index | Requirement | Abstract Function Name |
|-------|-------------|------------------------|
| OR.1 | The System SHALL validate user input | uc02_validate_input |
| OR.2 | The System SHALL store validated data | uc02_store_data |
| OR.3 | The System SHALL respond within MAX_RESPONSE_TIME | uc02_respond |

**Key Elements:**
- **Index:** Unique ID (OR = Originating Requirement)
- **Requirement:** The formal SHALL statement
- **Abstract Function Name:** Links to source use case

---

## THE 10 PROPERTIES OF GOOD REQUIREMENTS

Every requirement should be:

| # | Property | What It Means | Bad Example | Good Example |
|---|----------|---------------|-------------|--------------|
| 1 | **SHALL Statement** | Uses "shall" language | "The system validates" | "The System SHALL validate" |
| 2 | **Correct** | Accurately states the need | Misstated business rule | Verified with stakeholder |
| 3 | **Clear** | One idea only | "validate AND store" | Two separate requirements |
| 4 | **Unambiguous** | Only one interpretation | "fast response" | "respond within 200ms" |
| 5 | **Objective** | Non-opinionated | "nice interface" | "complies with WCAG 2.1" |
| 6 | **Verifiable** | Can be tested | "easy to use" | "complete task in <3 clicks" |
| 7 | **Consistent** | No contradictions | Conflicts with OR.5 | Reviewed against all others |
| 8 | **Impl. Independent** | WHAT not HOW | "use PostgreSQL" | "store data persistently" |
| 9 | **Achievable** | Actually possible | "100% uptime" | "99.9% uptime" |
| 10 | **Conforming** | Meets regulations | Violates GDPR | GDPR compliant |

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

```
PH: This requirement is structural:

"The System SHALL use Redis for caching"

That's an implementation choice (HOW), not a need (WHAT).

What's the NEED that caching addresses?
- "SHALL respond within 200ms"?
- "SHALL minimize database load"?
- "SHALL handle 1000 concurrent users"?

Let's capture the need, not the solution.

[User reframes as functional requirement]
```

### Round 5: Requirement Constants

**Goal:** Handle unknown values professionally

```
PH: You mentioned "respond within 200ms" — do you KNOW it's 200ms?

If the exact value isn't confirmed, use a CONSTANT:

"The System SHALL respond within MAX_RESPONSE_TIME"

Then in your Constants Table:

| Constant | Value | Units | Est/Final | Source |
|----------|-------|-------|-----------|--------|
| MAX_RESPONSE_TIME | 200 | ms | EST | Performance benchmark |

Benefits:
- Write requirements now, confirm values later
- One place to update when value is finalized
- Clear audit trail of where values came from

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

---

## REQUIREMENT ID CONVENTIONS

### Prefixes
- **OR** — Originating Requirement (from stakeholder/use case)
- **DR** — Derived Requirement (discovered through analysis)
- **CR** — Constraint Requirement (regulatory, technical)

### Format
```
OR.1, OR.2, OR.3...
DR.1, DR.2, DR.3...
```

### Abstract Function Naming
```
uc[number]_[snake_case_description]

Examples:
- uc01_authenticate_user
- uc02_process_payment
- uc03_send_notification
```

---

## CONSTANTS TABLE

When exact values aren't known, use constants:

| Constant Name | Value | Units | Est/Final | Source | Used In | Notes |
|--------------|-------|-------|-----------|--------|---------|-------|
| MAX_RESPONSE_TIME | 200 | ms | EST | Perf benchmark | OR.1, OR.5 | May adjust after load testing |
| MAX_FILE_SIZE | 10 | MB | FINAL | Product decision | OR.12 | Per user storage limits |
| SESSION_TIMEOUT | 30 | min | EST | Security review | OR.8, OR.9 | Pending security audit |

**Constant Name Rules:**
- ALL_CAPS_WITH_UNDERSCORES
- Descriptive (not x1, x2)
- Indicates what it represents

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
| **Requirement Constant** | A placeholder for a value not yet finalized (e.g., MAX_RESPONSE_TIME). |
| **Verification Method** | How you prove a requirement is met — the test. |
| **Functional Requirement** | Describes WHAT the system must do, not HOW. |
| **Traceability** | Linking requirements back to their source (use case, stakeholder). |

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

*Knowledge Bank: Functional Requirements List*
*Step 2.2 of PRD Creation Process*
