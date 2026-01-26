# Knowledge Bank: Use Case Behavioral Diagram (UCBD)

**Step:** 2.1 - Use Case Behavioral Diagram
**Purpose:** Walk through each use case step-by-step to extract hidden requirements
**Core Question:** "If the system has to do THIS, what else must it do?"

---

## WHY THIS STEP MATTERS

**What truly defines your system is the functions it must perform** in order to successfully accomplish its use cases. If you're able to formalize these functional requirements, you have created a **technical definition of what any valid solution to your problem must do.**

The UCBD reveals the requirements hiding inside each use case:

- Transforms high-level scenarios into specific system functions
- Discovers requirements that would otherwise surface as expensive surprises
- Creates testable "shall" statements
- Makes requirements traceable back to scenarios

**Key Insight:** A single use case like "User checks out" can hide 20+ requirements. The UCBD extracts them all. Taken together, anything that meets the collection of requirements across your use cases is a valid solution. It is only through creating more functional requirements that what the system should be begins to take shape.

**The UCBD is a discovery process.** No great explorer ever maps out the perfect course before setting sail. Don't waste energy trying to get it perfect on the first pass — that anxiety costs more time than just taking a good stab at it, then going back over it. Your first UCBD will be short and high-level. That's normal. Allow yourself to iterate.

**Prerequisites:** Before starting UCBDs, you must have:
- Defined your stakeholders and your system's context and interfaces (Steps 1.1-1.2)
- Prepared a list of use cases to explore with priorities assigned (Step 1.2)
- If working with a client, defined the client's deliverables (Step 1.3)

---

## WHAT IS A UCBD?

A **Use Case Behavioral Diagram** is a step-by-step breakdown of what happens during a use case:
- WHO does WHAT in chronological order
- Separates actor actions from system functions
- System functions become formal "shall" statements

**Structure:**
```
+---------------------+--------------------+---------------------+
| Operator            | The System         | Other Exterior      |
| (Primary Actor)     |                    | Elements            |
+---------------------+--------------------+---------------------+
| [informal action]   | [SHALL statement]  | [informal action]   |
| User clicks...      | System SHALL...    | API returns...      |
+---------------------+--------------------+---------------------+
```

- The **operator** (primary actor) drives the main action — the stimuli causing the use case to occur
- **The System** always gets exactly one column — never split into subsystems
- **Other exterior elements** are anything external your system interacts with during the use case
- If the system drives all action (no exterior operator), the leftmost column is "The System"

---

## THE KEY MINDSET SHIFT

**Functional thinking is about WHAT needs are met, not HOW:**

| Functional Thinking (WHAT) | Structural Thinking (HOW) |
|---------------------------|--------------------------|
| What need must be met | How you're going to meet that need |
| What something must be able to do | How you're going to do it |
| How systems interact (what each must do) | The implementation that handles the interaction |
| How you measure performance | The actual solution's performance |
| Anything meeting this description is a valid solution | A very specific solution |

**Functional thinking examples:**
- A car doesn't "drive" — it **provides a transportation function**
- A refrigerator doesn't "cool food" — it **maintains an environment that prevents food spoilage**
- A medical treatment doesn't "produce a chemical reaction" — it **reduces symptoms, betters health, or reduces infections**

It's the **functionality** we need to get at the heart of — understand what functions must be accomplished before thinking about how to meet them.

**Why this matters for teams:** No one person, regardless of talent, can make the best design decisions at every aspect of a project. By defining functional needs first, you allow the entire team to contribute their talents toward solutions. If you don't understand all the needs first, you might design something that's inefficient, or even solves the wrong problem.

**The delving shift:**

Before (feature thinking):
> "The system fires the projectile"

After (functional requirement):
> "The System SHALL BE ABLE TO fire the projectile"

Then ask: **"If it has to do this, what else must it do?"**

This reveals:
- It SHALL hold the projectile until launch
- It SHALL be triggered by the user
- It SHALL eject the projectile safely
- It SHALL aim at the target

---

## SELECTING USE CASES FOR UCBD

You won't create UCBDs for all your use cases — there isn't enough time. Select strategically:

**Step 1: Prioritize your use cases** — Rate them by importance (HIGH/MEDIUM/LOW) if you haven't already. Higher-priority use cases may:
- Directly address stakeholders' primary needs
- Have significant influence on system performance
- Address high-risk situations, including undesired occurrences
- Anticipate the system will need to perform complex and important tasks
- Occur very frequently

**Step 2: Select which to explore:**
1. **All HIGH priority use cases** — These get UCBDs first
2. **Some MEDIUM priority** — Select ones that involve different kinds of functionality than the high-priority ones already covered
3. **A few LOW priority** — Only those that would set different kinds of requirements for your system than those you've already declared

**Selection principle:** When choosing lower-priority use cases, pick the ones that will involve **different kinds of functionality** — not more of the same. A use case that reveals new types of requirements is more valuable to UCBD than one that duplicates requirements you've already captured.

```
PH: Let's select which use cases to explore with UCBDs.

You have {X} use cases total:
  {H} HIGH priority
  {M} MEDIUM priority
  {L} LOW priority

We'll UCBD all {H} high-priority use cases.
For medium and low, which ones involve DIFFERENT functionality
from what we'll already cover?

Pick the ones most likely to reveal NEW kinds of requirements.
```

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

### Round 1: Setup Columns (Swimlanes)

**Goal:** Identify all elements involved and create a column for each

```
PH: Who or what is involved in "[Use Case Name]"?

Each element gets its own column (swimlane):

  LEFT column:   The operator (primary actor) — who drives the action?
  CENTER column:  "The System" — always ONE column, never split
  RIGHT columns:  Any other exterior elements your system interacts with
                  (external equipment, objects being acted upon, info sources)

For "[Use Case]", who's the main actor driving the action?
And are there other external elements involved?

[User identifies actors/elements]

PH: 🔑 Important: Keep "The System" as ONE column.
Don't split it into subsystems — that locks in architecture too early.

Note: If no external operator drives this use case (e.g., "System performs
scheduled backup"), the leftmost column is simply "The System."
You don't need an operator column if the system drives all the action.
```

### Round 2: Preconditions (Starting Conditions)

**Goal:** Define what must be true before the use case begins

You may have starting conditions for **each actor** and **the system** — not just the primary actor. These establish the parameters in place before operation begins in a given use case.

**Starting conditions can reference other use cases:** Sometimes a starting condition is described as another use case being successfully (or unsuccessfully) completed. This establishes at what stage your system is embarking into this specific use case.

**Deciding what to state:** Some conditions are obvious (e.g., "the child and projectile need to be near the system"). You have to decide whether that information needs to be specifically stated. Focus on conditions that are non-obvious or critical for understanding when the use case can begin.

**Minimum:** At least one starting condition must be established for the UCBD.

```
PH: What must be TRUE before "[Use Case Name]" can begin?

Think about starting conditions for each element:
  - The system: What state must it be in?
  - The operator/primary actor: What must they have done?
  - Other elements: Any conditions on their state?

A starting condition can also be: "Use case X was completed successfully."

Examples:
- "System is in the unloaded state"
- "User is authenticated" (i.e., "Login" use case completed)
- "Cart is not empty"
- "Payment method is on file"

These become your PRECONDITIONS — the starting gate.
You need at least one.

[User defines preconditions]
```

### Round 3: Postconditions (Ending Conditions)

**Goal:** Define what's true when the use case completes

You may have ending conditions for **each actor** and **the system** — not just one element. These establish the parameters in place at the completion of your use case.

The ending condition typically takes one of two forms:
- **Stable state:** The use case ends with the system in a fairly stable resting condition
- **Transition:** The ending condition IS the starting condition for another use case (a handoff)

**Ending conditions do not always need to match starting conditions.** Sometimes they do (e.g., the catapult returns to its unloaded state), but often the system ends in a different state than where it began.

**Minimum:** At least one ending condition must be established for the UCBD.

```
PH: What is TRUE when "[Use Case Name]" completes successfully?

Think about ending conditions for each element:
  - The system: What state is it in now?
  - The operator/primary actor: What has changed for them?
  - Other elements: Any conditions on their final state?

This can be a stable state or a transition to another use case.

Stable state examples:
- "System is in the unloaded state"
- "Order is placed and confirmed"

Transition examples:
- "System is now in 'awaiting payment' state"
  (which is the starting condition for the "Process Payment" use case)
- "User is authenticated"
  (which is the starting condition for the "Browse Dashboard" use case)

These become your POSTCONDITIONS — the finish line,
or the handoff to the next use case.
You need at least one.

[User defines postconditions]
```

### Round 4: Step-by-Step Flow (The Body)

**Goal:** Determine the sequence of events and functions that must occur between the beginning and ending conditions. This is the body of the UCBD.

**Trigger action:** Use cases often begin with a trigger, typically initiated by the operator. However:
- The trigger is sometimes included as part of the beginning conditions instead
- The trigger can be the completion of another use case
- Sometimes there is no distinct trigger — that's fine
- The first statement doesn't have to be in the operator column — it can start in any column

**Body rules:**
- **Chronological order** from beginning to ending condition
- **One statement per row** — even if things happen simultaneously
- **Each statement in the swimlane of the element primarily responsible** for that action
- **Multi-element interactions → split into separate rows:** If an exchange involves two elements, place a statement in the providing element's column, then in the next row place a statement in the receiving element's column showing how the input is handled
- **More statements > unclear assignment** — it's better to have more rows than a single ambiguous statement that tries to capture too much
- **One logic flow per UCBD** — if you discover conditional branches ("if X happens, then A; otherwise, B"), create a separate UCBD for each logic flow. You should have as many UCBDs as necessary to handle different logic flows.

```
PH: Let's walk through what happens from start to finish.

What triggers this use case to START?
Usually the operator does something — but it could also be
the completion of another use case, or even an internal system event.
(Don't worry if there's no distinct trigger.)

[User describes trigger]

PH: What must the system do in response?
Use "The System SHALL..." language for system actions.
Use informal language for actor/element actions.

[User describes system response]

PH: What happens next? Keep going row by row.

Remember:
  - One statement per row
  - Put each statement in the column of the responsible element
  - If two elements interact, split: provider row → receiver row

[Continue until reaching the ending conditions]
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

### Round 7: Review and Iterate

**Goal:** Catch missed functionality through multiple passes

It's rare that even the most experienced professional designer will think of all key functions or delve far enough on their first try. Your first pass at a UCBD is often **short and rather high-level** — that's normal.

```
PH: Let's review your UCBD for completeness. Go over it again, asking:

1. "If the system has to be able to do this, what else must it do?"
   → Look for hidden sub-functions in every SHALL statement.

2. "Are there other functions that are occurring at the same time?"
   → Parallel actions are easy to miss on a first pass.

3. The Contractor Test:
   "If I asked a contractor to create something that ONLY performed
   the functions I wrote and nothing else, would I be confident that
   what I got back would meet ALL the needs of this use case?"

These are tough questions, but continue with them until you can
functionally define what any system has to be in order to meet
the needs of this use case.

[Iterate until UCBD feels thorough]
```

**Key insight:** Continue asking these questions until you feel you can functionally define what any system has to be in order to meet the needs of this use case. Each iteration typically reveals 3-5 more requirements.

### Round 8: Notes and Assumptions

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

### Between Rounds: Discovering New Use Cases During UCBDs

As you work through a UCBD, you may discover that you need **new use cases** you hadn't originally listed:

**When to create a separate use case:** If your system must perform **different functions** depending on different exterior conditions (who is present, what equipment is involved, what environment exists), those variations should be separate use cases with separate UCBDs.

Example: "Child loads system" and "Child loads system with parent" are separate use cases if the parent's presence means the system must do different things (e.g., special features meant to attract parents to buy the toy).

**Start with the most basic version first.** Complete the simplest variation of the use case, then review it with the variation in mind to see if the system would have to do something different. If yes, create a new use case.

**Use longer, descriptive names** to distinguish between variations: "Child loads system," "Child loads system with parent," "Child loads system with living creature." Longer use case names are encouraged when you have multiple variations to keep distinct.

```
PH: As we worked through this UCBD, did you discover any situations
where your system would need to do DIFFERENT things?

For example:
  - Different user types (admin vs regular user)?
  - Different conditions (with/without network)?
  - Different objects or environments?

If so, those may need separate use cases.
Start with the simplest version and add variations as new use cases.
```

### Round 9: Repeat for Remaining Use Cases

After completing a UCBD for one use case, repeat the process (Rounds 1-8) for remaining use cases. See "SELECTING USE CASES FOR UCBD" above for which to prioritize.

```
PH: ✅ UCBD complete for "{useCaseName}".

You have {X} more use cases to explore:
  {H_remaining} HIGH priority remaining
  {M_selected} MEDIUM priority selected
  {L_selected} LOW priority selected

Let's move to the next one: "{nextUseCaseName}"

As you build more UCBDs, you'll notice requirements overlapping
across use cases — that's expected and confirms consistency.
New use cases should reveal NEW kinds of requirements.
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

### Delving Reveals Use Case Splitting

When delving reveals different kinds of functionality within a single requirement, this can signal that you should **split the original use case into several new use cases**:

```
"The System SHALL pick up the target object" reveals:
  * System identifies objects     → NEW USE CASE: "System identifies objects"
  ** System grabs target object   → NEW USE CASE: "System grabs target object"
  *** System changes position     → NEW USE CASE: "System changes position"

Splitting allows you to explore each use case further
for additional requirements. It also helps you recognize
the distinct subsystems or skills needed.
```

**Grouping insight:** Even though some requirements (*) were discovered by delving into later requirements (***), you may decide to group them together. This informs you to consider creating something more generic — e.g., a general "identify objects" capability rather than just "identify the target object." Had you not explored functionally first, you might have optimized for just the target object, only to discover later you also needed to handle obstacles.

---

## DISCOVERING PERFORMANCE CRITERIA

As you discover functional requirements, you'll also realize it's not just about **what** the system must do, but **how well** it must do it.

**Example — Toy catapult:** "The System SHALL eject the contents of the receptacle"
- How fast does the projectile fly? → **launch velocity** (criterion)
- How far does it fly? → **launch distance** (criterion)

**Example — Robotic arm:**
- Rate at which the arm moves
- Time from command to completion
- Time to recognize objects
- Accuracy of target identification
- How smoothly the arm moves

**The challenge:** Some criteria are straightforward to measure (velocity, distance). Others require **defining objective performance metrics:**
- "Accuracy" → how often the target is found correctly, missed, or reported incorrectly; establish test scenarios
- "Smoothly" → variation from expected motion path, max/average/standard deviation of acceleration, residual vibration dissipation

### The "Ask WHY" Technique

For any functional requirement, ask **why this function matters**. The answer reveals performance criteria and priorities:

```
PH: "The System SHALL minimize fuel consumption."

Why is this important?
  - Minimize cost of operation?
  - Minimize environmental impact?
  - Minimize fuel storage space?
  - Minimize weight?
  - Maximize travel distance?
  - Maintain competitive level?

The answer may be all of the above, but probably not
equally important. Knowing WHY helps you prioritize
and develop a better design.
```

**Safety as a performance criterion:** You may discover that as a function improves (e.g., launch velocity increases), safety becomes a concern. Safety is both a function and a performance criterion.

---

## REQUIREMENT CONSTANTS

When a requirement needs a threshold or limit but you don't yet know the exact value, use **requirement constants** — named placeholders that you define later.

```
❌ Vague: "The System SHALL store the energy input from the operator"
   (Does this mean ALL energy? Even if someone jumped on it?)

✅ With constant: "The System SHALL store the energy input from
   the operator up to MaximumEnergyInput"
```

**Naming rules:**
- Use descriptive names that capture what the constant represents
- Long names are better than generic ones (`MaximumEnergyInput` not `x1`)
- When you have hundreds of requirements, `x1, x2, x3` are impossible to remember
- Use CamelCase to distinguish words: `MaxLaunchVelocity`, `MinResponseTime`

### Requirement Constants Table

Track all constants in a table:

| Name | Value | Units | Source | Estimate? | Last Updated |
|------|-------|-------|--------|-----------|-------------|
| MaximumEnergyInput | TBD | Joules | Safety testing | Yes | 2024-01-15 |
| MaxLaunchVelocity | 5.0 | m/s | Safety standard | No | 2024-01-20 |
| MinResponseTime | TBD | ms | Stakeholder req. | Yes | — |

**Additional tracking fields** (for ongoing projects):
- Whether the current value is an estimate or final
- Date when the value was last updated
- Which team member made the update
- When the estimate is expected to be finalized
- When the final value is due

**PH guidance:**
```
PH: I notice "{requirement}" has a threshold that isn't defined yet.

Let's create a requirement constant for it:
  Name: [descriptive CamelCase name]
  Value: TBD (we'll define this later)
  Units: [appropriate units]
  Source: [where will this value come from?]

This makes the requirement testably verifiable while
acknowledging we don't have the exact value yet.
```

---

## ADDING REQUIREMENTS OUTSIDE UCBDs

It's perfectly fine to add functional requirements that don't come directly from a UCBD, if you know the requirement is an important function that would have shown up in one of your UCBDs had you had time to create UCBDs for all use cases.

**In these cases, record where the inspiration came from.** This is important because if the source changes (e.g., a stakeholder request is withdrawn), you'll know to either alter or eliminate that requirement from your list.

---

## FUNCTIONAL VS STRUCTURAL

**Always write requirements FUNCTIONALLY (what), not STRUCTURALLY (how):**

| Functional ✅ | Structural ❌ |
|--------------|--------------|
| "Store user data persistently" | "Use PostgreSQL database" |
| "Authenticate user identity" | "Implement OAuth 2.0" |
| "Send notification to user" | "Use Firebase Push" |
| "Process payment securely" | "Integrate Stripe API" |

**Why?** Functional requirements allow ANY valid solution. Structural requirements lock you into specific technologies. Functionally written requirements ensure you are not artificially constrained as to what your system must structurally be — instead, you're open to creatively think about possible solutions that could meet your challenge's functional needs.

---

## REQUIREMENTS QUALITY CHECKLIST

A cornerstone of professional design is well-written requirements. Every requirement in your UCBD should pass all seven criteria:

| # | Criterion | What It Means | Test |
|---|-----------|---------------|------|
| 1 | **Written as "shall" statements** | "The System SHALL..." is non-negotiable language | Does it use SHALL? |
| 2 | **Correct** | What you're saying is accurate | Is this actually true? |
| 3 | **Clear and precise** | One idea per requirement | Does it contain "and"? If so, split into two requirements |
| 4 | **Unambiguous** | Only one way to interpret it | Could two engineers read this differently? |
| 5 | **Objective** | Non-opinionated; if any part is subjective, qualify it with a quantifiable measure | Does it say "good," "fast," or "easy"? Quantify instead |
| 6 | **Verifiable** | There is some measurable way to confirm it's met | How would you test this? |
| 7 | **Consistent** | Does not contradict another requirement | Does it conflict with anything already written? |

**Additional guidelines** (some organizations also require):

| # | Criterion | What It Means |
|---|-----------|---------------|
| 8 | **Implementation Independent** | Functional, not structural — does not prescribe HOW |
| 9 | **Achievable** | Feasible — it can actually be accomplished |
| 10 | **Conforming** | Consistent with regulations imposed by stakeholders and governing entities |

**Note on "shall":** Many agencies will not accept requirements written any other way, regardless of how good the ideas behind them are. It's the other criteria that are truly important for developing your system's requirements, but SHALL is the professional entry ticket.

**The "and" rule:** If a requirement contains "and" or similar conjunctions, it's considered better to split it into two separate requirements. Each requirement should express ONE idea.

```
❌ "The System SHALL validate the input AND display an error message"
✅ "The System SHALL validate the input"
✅ "The System SHALL display an error message when validation fails"
```

**PH quality check:**
```
PH: Let me check your requirements against the seven quality criteria.

For each requirement, I'll flag:
  ⚠️ Contains "and" → consider splitting
  ⚠️ Uses vague language → needs quantification
  ⚠️ Structural, not functional → rewrite as WHAT, not HOW
  ⚠️ Not verifiable → how would you test this?
  ⚠️ Ambiguous → could be interpreted multiple ways

[PH reviews each requirement]
```

---

## UCBD FORMATTING RULES

### Column Layout

Columns are also called **swimlanes**. Each element involved in the use case gets its own column.

- **Column 1 (leftmost): Primary Actor / Operator** — The main outside source of action that drives the stimuli for the use case to occur. "Operator" and "Primary Actor" are interchangeable terms. Example: in "Child loads system," the child is the operator because they drive the loading action.
- **Column 2: The System** — Always immediately to the right of the operator. ONE column only — never split into subsystems (see below).
- **Columns 3+: Other exterior elements** — Anything external to your system that is involved in the use case. These are things your system interacts with but that are **not part of your system** (e.g., objects being acted upon, external equipment, other information sources). Add as many columns as needed — or none, if no other elements are involved.

**Use cases without an exterior operator:** Not all use cases have an outside operator. If a use case is "System Does X" (the system drives all the action itself), the leftmost column is simply "The System" — there is no operator column.

**Columns are iterative:** You can always add or remove columns later. UCBDs are a very iterative process — your first pass rarely has the final set of columns.

**When does an element need its own column?** An element is part of "The System" column (no separate column needed) only if ALL three are true:
1. It comes as part of your system
2. It is special/unique to your system
3. You have full control over its design

If **any one** of those is not true, give it a separate exterior column. Example: If your toy must work with standard Nerf darts (designed before your toy existed, with a design you don't control), the projectile gets its own column — even if the darts are included in the box with your toy.

### Swimlane Rules
- One statement per row — even if things happen simultaneously
- Chronological order from top to bottom
- Each statement placed in the column of the element primarily responsible
- Multi-element interactions: split into provider row → receiver row (don't combine)
- More rows is better than ambiguous or overloaded statements
- **One logic flow per UCBD** — conditional branches ("if X, then A; otherwise B") require separate UCBDs

### Statement Formatting
- **Actor/element actions:** Informal language ("User clicks button," "Operator pushes receptacle into position")
- **System actions:** Formal SHALL statements ("The System SHALL validate input") — these are the formal requirements. The quality of these statements is what makes a UCBD truly valuable.

### Notes Section
- Numbered list at bottom of the UCBD
- **Scope the use case:** Notes communicate limits on what this particular UCBD covers. Example: "We assume the projectile is not a living thing, like a pet gerbil." This tells a reader what is and isn't in scope for this diagram.
- **Reveal new use cases:** Notes often help you recognize that you need additional use cases. Example: A note about living creatures might spawn a new use case "Child loads system with living creature."
- **Add generously:** Without notes, someone else — or even you — weeks or years later may not realize what you actually meant. Add as many notes as could be useful to a future reader. More notes is always better.
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

**Why this rule exists (two reasons):**
1. **Narrows the solution space too early.** Splitting your system into parts/subsystems forces any final solution to also be split that way. Through the UCBD process, you may discover that the functionality you need can be achieved in a much different way than you initially thought. Adding subsystem columns prematurely eliminates those possibilities.
2. **Professional acceptance.** Many government and regulatory documents will only be accepted if the UCBD has a single system column.

**Exception — working on a subsystem:** If you are part of a larger system and have control over only one subsystem, you may treat that subsystem as your single "System" column. All other subsystems become exterior element columns — because they are elements you don't have direct control over. This is valid because you're still maintaining a single system column for the scope of work you control.

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

### Mistake 5: Conditional Branching in a Single UCBD

```
User writes a UCBD that includes:
  "IF the user is a premium member, The System SHALL...
   OTHERWISE, The System SHALL..."

PH: ⚠️ Each UCBD should follow ONE logic flow.

If you discover conditional branches — "if X happens, do A;
otherwise, do B" — create a separate UCBD for each path.

Split this into:
  UCBD: "Premium member checks out"
  UCBD: "Standard member checks out"

You should have as many UCBDs as necessary to handle
different logic flows through your use cases.
```

### Mistake 6: Combining Multiple Elements in One Row

```
User writes: "User enters data and system validates it"

PH: ⚠️ That's two actions by two different elements in one row.

Split into:
  Row 1 (User column): "User enters data"
  Row 2 (System column): "The System SHALL validate the input"

Each row should have ONE statement in ONE element's column.
If two elements interact, use provider row → receiver row.
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
| **Operator** | The primary actor — the main outside source of action driving the use case. Interchangeable with "Primary Actor." |
| **Swimlane** | A column in the UCBD representing an element involved in the use case. Also called a "column." |
| **Exterior Element** | Anything external to your system that is involved in the use case (objects, equipment, info sources). |
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
  },

  multiple_logic_flows: {
    error: "UCBD contains conditional branching (if/else logic)",
    why: "Each UCBD should follow one logic flow. Conditional branches need separate UCBDs.",
    fix: "Split into separate UCBDs — one per logic flow path."
  },

  multi_element_row: {
    error: "Row '{row}' involves actions from multiple elements",
    why: "Each statement should be in ONE element's swimlane. Multi-element interactions should be split.",
    fix: "Split into provider row (element sending) → receiver row (element handling input)."
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

## PROCESS CHECKLIST (12 Steps)

Summary of the complete UCBD process from the course checklist:

| Step | Action | Complete When |
|------|--------|---------------|
| 0 | Define stakeholders, context, interfaces, use case list, deliverables | Prerequisites from Steps 1.1-1.3 done |
| 1 | Rate/prioritize use cases (HIGH/MEDIUM/LOW) by stakeholder needs, performance impact, risk, complexity, frequency | Use cases are prioritized |
| 2 | Select a high-priority use case, set up UCBD template | Template created with use case name |
| 3 | Determine elements, create columns: operator/primary actor (left), system (center), exterior elements (right). If no operator, system is leftmost. | Separate column for each element + system |
| 3a | Add Notes section at bottom (numbered, informal, for assumptions/clarifications) | Notes section exists |
| 3b | Verify ONE column for system — no subsystem splits (narrows solution space + professional acceptance). If working on a subsystem of a larger system, treat it as "The System" and other subsystems as exterior columns | Single system column confirmed |
| 4 | Establish starting conditions (preconditions) for each actor and system | Starting conditions listed |
| 5 | Establish ending conditions (stable state or transition to another use case) | Ending conditions listed |
| 6 | Step-by-step flow: trigger → actor actions (informal) + system actions (SHALL); one statement per row, chronological; one logic flow per UCBD; multi-element interactions split into provider → receiver rows | Full flow from start to end, single logic path |
| 7 | Review for missed functionality (delving, contractor test, iterate multiple passes) | Refined UCBD after multiple passes |
| 8 | Review for performance criteria and ideas on how to measure them | Performance criteria identified |
| 9 | Repeat Steps 2-8 for remaining high + selected medium/low use cases | Full list of functional requirements |
| 10 | Verify requirements quality (shall, correct, clear, unambiguous, objective, verifiable, consistent + implementation independent, achievable, conforming) | All 10 criteria met |
| 10a | Add requirement constants for thresholds/limits; create Requirement Constants Table | Constants defined with names, values, units, sources |
| 11 | Check all requirements are functional, not structural | All requirements pass functional test |

---

*Knowledge Bank: UCBD (Use Case Behavioral Diagram)*
*Step 2.1 of PRD Creation Process*
