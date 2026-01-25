# Knowledge Bank: Context Diagram (Defining Scope)

**Step:** 1.1 - Context Diagram
**Purpose:** Map what the system interacts with to define the boundary of control
**Core Question:** "What does your system interact with that you DON'T control?"

---

## WHY THIS STEP MATTERS

> "All mistakes are made on the very first day" — usually because we didn't brainstorm thoroughly.

The Context Diagram prevents:
- Mapping out the scope
- Designing the wrong system
- Scope creep ("We assumed you'd also integrate with X")
- Integration surprises
- Security vulnerabilities from unconsidered actors

---

## THE "NO NAME" PRINCIPLE

**Why we call it "The System" — not your product name:**

When someone asks for "a car," they're really asking for a transportation solution.

If you name it "car" on day 1:
- Mid-sized sedan? SUV? Flying car? Boat-car?
- All those creative solutions are now "invalid"

By keeping it as "The System":
- ANY solution that meets the requirements is valid
- You stay open to innovation
- You don't lock yourself into assumptions

**PH should say:**
```
We're going to call your system "The System" — not give it a name yet.

Why? Because naming narrows your solution space.

Example: If someone asks for "a car," they might really need a boat-car, a flying vehicle, or something no one's thought of yet.
"The System" keeps all possibilities open.
```

---

## IDEAL INTERACTION FLOW

### Opening (Set Context)

```
PH: Let's start by mapping your system's world.

We'll place "The System" in the center and surround it with everything
it must interact with — users, external systems, and even unwanted
interactions like security threats.

The boundary we draw separates:
- INSIDE: What you control (your system)
- OUTSIDE: What you don't control (everything else)

Ready to discover what your system interacts with?
```

### Round 1: Primary Users

**Goal:** Identify who directly uses the system

```
PH: Who are the main people who will use your system directly?

Think about the person whose hands will be on this system most often.

[User answers]

PH: Got it. Now think about other user types:
- Are there administrators?
- Support staff?
- Auditors or compliance reviewers?
- Different permission levels?

[User expands list]
```

### Round 2: External Systems

**Goal:** Identify systems/APIs the system must integrate with

```
PH: What external systems, services, or APIs does this need to work with?

Think about:
- Browsers (Chrome/Safari)
- Mobile phones (iOS/Android)
- Payment processors (Stripe, PayPal)
- Authentication services (OAuth providers, SSO)
- Third-party APIs (maps, email, SMS)
- Legacy systems you can't change
- Cloud services (storage, compute)

[User lists systems]

PH: For each of those, I'll ask two questions:
1. What does IT do TO your system? (data/requests it sends)
2. What does your system do FOR it? (responses/outputs)

Let's start with [first system]...
```

### Round 3: Undesired Interactions (The Gold Mine)

**Goal:** Surface edge cases and threats — often the most demanding requirements

```
PH: Here's where requirements engineering gets interesting.

What UNWANTED things might interact with your system?

Think about:
- Malicious actors (hackers, spammers, fraudsters)
- Bad data (corrupted inputs, edge cases)
- System failures (API down, network timeout, database crash)
- Environmental factors (high load, peak traffic)
- Compliance/legal constraints

[User identifies threats]

PH: 💡 These undesired interactions often create more demanding
requirements than the happy path!

A system built only for "when everything works" fails when
reality shows up.
```

### Round 4: Secondary Stakeholders

**Goal:** Identify those who don't use the system but influence/are affected by it

```
PH: Now let's think one step removed.

Who doesn't USE your system directly, but:
- Is affected by it?
- Influences how it must be built?
- Creates constraints you must follow?

Common examples:
- Regulators (GDPR, HIPAA, SOX, PCI-DSS)
- Your company's policies (security standards, branding)
- The environment (sustainability, accessibility)
- Legal department
- Finance/billing systems

[User identifies stakeholders]

PH: These often create constraints that aren't obvious at first
but can make or break your design later.
```

### Round 5: Interaction Details

**Goal:** Define what flows between each external element and the system

```
PH: Let's detail the interactions for [element].

Near the external box, write what IT does TO your system:
- What data does it send?
- What requests does it make?
- What events does it trigger?

Near the system box, write what your system does FOR it:
- What responses does it return?
- What services does it provide?
- What data does it produce?

[User defines interactions]
```

---

## COMMON MISTAKES TO CATCH

### Mistake 1: Adding Internal Components

**User tries to add:** "Database", "Login Module", "API Server"

```
PH: ⚠️ Pause — those are INSIDE your system, not outside it.

The context diagram shows what you DON'T control.

Ask yourself: "Can I change the design of this?"
- Yes → It's INSIDE (don't add it)
- No → It's OUTSIDE (add it)

Your database, login module, API server — those are things
you'll build or configure. They go inside the dashed boundary.
```

### Mistake 2: Adding Properties Instead of Interactions

**User tries to add:** "Security", "Speed", "Reliability", "Scalability"

```
PH: ⚠️ Good instinct, but those are properties you WANT,
not things that interact with your system.

"Security" isn't an actor — but "Hackers" are.
"Speed" isn't an actor — but "Time-sensitive operations" are.
"Reliability" isn't an actor — but "System failures" are.

We'll capture those properties as performance criteria later.

What external thing CAUSES you to need security?
```

### Mistake 3: Splitting the System

**User tries to add:** "Gas Tank interacts with Gas Station"

```
PH: 🚫 This is a big violation in professional requirements engineering!

You cannot split "The System" into subsystems yet.

Here's why: If you put "gas tank" there, you've locked yourself
into a design that NEEDS a gas tank.

What if an electric vehicle would be better?
What if hydrogen fuel cells become viable?

Keep it as: "The System interacts with Gas Station"
(The fueling interaction, not the specific mechanism)
```

### Mistake 4: Too Few External Elements

**User lists only 3-4 elements**

```
PH: Let's brainstorm more thoroughly.

Professional context diagrams typically have 8-20 external elements.

Have you considered:
- Different user types (not just "user")?
- What happens when things go WRONG?
- Regulatory bodies?
- Third-party services?
- Physical environment factors?

Remember: Missing an interaction now means discovering it
as an expensive surprise later.
```

---

## REAL EXAMPLES

### Vehicle Example

**External Elements Identified:**
```
Primary Users:
- Driver (and variants: student, elderly, disabled, drunk)
- Passengers (adult, child, disabled)
- Maintenance worker

External Systems:
- Roads (can't control road conditions)
- Gas stations (fueling interaction)
- Parking spaces (parking interaction)
- Other vehicles (traffic interaction)

Undesired Interactions:
- Weather (rain, snow, fog, ice)
- Wildlife (collision avoidance)
- Potholes (damage handling)
- Accidents (survival requirements)
- Thieves (security requirements)

Secondary Stakeholders:
- Department of Motor Vehicles (regulations)
- Insurance companies (liability requirements)
- Environmental agencies (emissions)
- Manufacturing facilities (production constraints)
```

**Key Insight — Actor Variants:**
```
The user initially said "passengers."

Delving revealed:
- Driver vs passenger (different interactions)
- Student driver (needs training mode)
- Elderly driver (accessibility needs)
- Drunk driver (safety intervention)
- Child passenger (safety seats)
- Disabled passenger (accessibility)

Each variant creates different requirements!
```

### The "Baby Vomit" Principle

**Covering edge cases efficiently:**

When thinking about interior messes a vehicle must handle:
water, dirt, soda, juice, oil, animal waste...

**Key insight:** Pick REPRESENTATIVE worst cases:
- **Oil:** Greasy, flammable, liquid
- **Baby vomit:** Organic, biohazard, smelly, liquid + solid

If the system handles these two, it handles all the others.

This is called an **"argument of dominance"** — covering edge cases efficiently without listing every possibility.

---

## FORMATTING RULES (Professional Standards)

**Why formatting matters:**
Professional requirements work is often rejected purely on formatting.
These ensure clarity and prevent misinterpretation.

### Box Rules
- All boxes same size (approximately)
- Square corners only (NEVER rounded)
- Black and white only (NO color)
- Names CAPITALIZED inside boxes
- Same font and font size throughout

### Line Rules
- **Rectilinear lines ONLY** (90° angles, no curves, no diagonals)
- One line per connection (use commas for multiple interactions)
- No crossing lines
- No "jump" symbols where lines would cross

**Why rectilinear?**
```
Curved lines are considered unprofessional in systems engineering.
It's not aesthetic — it's about precision.

Rectilinear lines clearly show which elements connect
without ambiguity about crossings.
```

### Interaction Label Rules
- Written in **lowercase**
- Near external box: what IT does TO the system
- Near system box: what system does FOR it
- Can expand system boundary to contain outbound labels
- If too long, use letter references (A, B, C) with legend at bottom

### System Boundary
- Dashed line around "The System" box
- EVERYTHING inside = what you control
- EVERYTHING outside = what you don't control
- NEVER split the system into subsystems at this stage

---

## THINKING STATE MESSAGES

Show during AI processing:

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
  },
  {
    headline: "Checking formatting standards...",
    tip: "Rectilinear lines, square corners, black and white only. Professional standards ensure your work is taken seriously.",
    duration: 4000
  }
];
```

---

## TOOLTIPS (15-word definitions)

| Term | Definition |
|------|------------|
| **The System** | We don't name it yet because naming narrows your solution space. |
| **Actor** | Anyone or anything that directly interacts with your system. |
| **System Boundary** | The dashed line separating what you control from what you don't. |
| **Interaction** | What flows between your system and an external element. |
| **Primary Stakeholder** | Someone who directly uses or is immediately affected by your system. |
| **Secondary Stakeholder** | Someone who doesn't use it directly but influences or is affected by it. |
| **Rectilinear Lines** | Lines with only 90° angles — the professional standard for diagrams. |

---

## VALIDATION ERRORS

```typescript
const validationErrors = {
  missing_interaction: {
    error: "'{element}' has no interactions defined",
    why: "Every external element affects your system somehow. If it doesn't interact, why is it on the diagram?",
    fix: "Ask: What does {element} do TO your system? What does your system do FOR {element}?"
  },

  internal_component: {
    error: "'{element}' appears to be an internal component",
    why: "Context diagrams show what you DON'T control. Internal components are things you'll build.",
    fix: "Ask: Can I change the design of this? If yes → it's internal, remove it."
  },

  property_not_actor: {
    error: "'{element}' is a property, not an actor",
    why: "Properties like 'security' or 'speed' aren't things that interact — they're qualities you want.",
    fix: "What external thing CAUSES you to need this property? Add that instead."
  },

  system_split: {
    error: "The System has been split into subsystems",
    why: "Splitting locks you into a specific architecture too early. Keep all possibilities open.",
    fix: "Merge back into 'The System' — define subsystems later during detailed design."
  },

  too_few_elements: {
    error: "Only {count} external elements — consider adding more",
    why: "Professional diagrams have 8-20 elements. Few elements often means missing interactions.",
    fix: "Consider: user variants, failure modes, regulators, third-party services."
  }
};
```

---

## COMPLETION CELEBRATION

```
✅ Context Diagram Complete

You've identified {X} external elements that interact with your system:
- {Y} primary users and their variants
- {Z} external systems and services
- {W} undesired interactions and edge cases
- {V} secondary stakeholders and constraints

💡 Most projects skip this step and pay for it later with:
   • Scope creep ("We assumed you'd also integrate with X")
   • Integration surprises during development
   • Security vulnerabilities from unconsidered actors

You now have a clear boundary between what you're BUILDING
and what you're CONNECTING TO.

Next: We'll discover the scenarios (use cases) where your system is used.
```

---

*Knowledge Bank: Context Diagram*
*Step 1.1 of PRD Creation Process*
