# Complete Educational Knowledge Bank

**Purpose:** Structured educational content for each step of the PRD creation process.
**Format:** 3-box pattern (Educational, Clarification Questions, Internal Specs) per step.
**Usage:** Surface during AI "thinking" states, tooltips, chat intros, empty states, and validation feedback.

---

# PHASE 1: DEFINE SCOPE

---

## Step 1.1: Context Diagram

### BOX 1: Educational / Explanatory
**"What is this and why are we doing it?"**

**What is a Context Diagram?**
A visual tool that shows your system as a box in the center, surrounded by everything it must interact with. It helps you discover what your system is responsible for and what's outside your control.

**Why do we do this?**
- "All mistakes are made on the very first day" — usually because we didn't brainstorm thoroughly
- It prevents you from designing the wrong system by forcing you to think about ALL interactions upfront
- It separates what you control (inside the boundary) from what you don't (outside)

**Why don't we name the system yet?**
Naming narrows your solution space too early. If someone asks for a "car," they're really asking for a transportation solution. By keeping it as "The System," you stay open to creative solutions (a boat-car, a flying vehicle) instead of locking into "mid-sized sedan."

**What goes OUTSIDE the boundary?**
- People who use or are affected by the system (actors)
- External systems, APIs, third-party services
- Things that force your system to behave differently
- Undesired interactions (hackers, system failures, bad weather)

**What does NOT belong?**
- Internal components (don't add "database" or "login module" — that's inside)
- Properties you want (comfort, speed, reliability) — those are performance criteria, not interactions

**Understanding the Lines:**
- Each line represents an interaction between an external element and your system
- Write what IT does TO your system near the external box
- Write what your system does FOR it near the system box
- Use lowercase for interaction labels
- Multiple interactions = separate with commas (don't draw multiple lines)

---

### BOX 2: Clarification Questions
**"What to ask the user"**

**Actors & Stakeholders:**
- Who are the primary users of this system?
- Are there secondary users (support staff, admins, auditors)?
- Are there stakeholders who don't use it directly but are affected by it? (regulators, environment, company policies)

**External Systems:**
- What external systems, services, or APIs does this need to integrate with?
- Are there legacy systems or infrastructure constraints?

**Interactions:**
- For each external element:
  - What does IT do TO your system? (data/requests it sends)
  - What does your system do FOR it? (responses/outputs)

**Negative/Undesired Cases:**
- What unwanted interactions might occur? (bad actors, system failures, edge cases)
- What happens if [external system] goes down?
- Are there malicious users or security threats to consider?

**Variants:**
- Are there different types of [user/system] that need different handling?
- Do any external elements have special constraints or requirements?

---

### BOX 3: Internal Diagram Specifications
**"Rules for generating the diagram"**

**System Box:**
- Label: "The System" (NO product name)
- Surrounded by dashed line = system boundary
- Everything inside = what you control
- Everything outside = what you don't control

**External Element Boxes:**
- 8-20 elements initially
- All boxes same size
- Square corners only (never rounded)
- Black and white only (NO color)
- Names capitalized inside boxes
- Same font and font size for all

**Connecting Lines:**
- Rectilinear lines only (never curved, no diagonal)
- One line per connection (use commas for multiple interactions)
- No crossing lines
- No "jump" symbols where lines cross

**Interaction Labels:**
- Written in lowercase
- Near the external box: what IT does TO the system
- Near the system box: what system does FOR it
- Can expand system boundary box to contain outbound labels
- If text too long, use letter references (A, B) with legend at bottom

**Connections Between External Boxes:**
- Use VERY sparingly
- Only if the interaction between them affects YOUR system's design

---

## Step 1.2: Use Case Diagram

### BOX 1: Educational / Explanatory
**"What is this and why are we doing it?"**

**What is a Use Case?**
A scenario or situation in which your system will be used. It captures WHAT the system must do, not HOW it does it.

**Why do we do this?**
- Creates a complete view of all system needs
- Prevents "if only we'd known earlier" moments that cause expensive rework
- Helps prioritize which capabilities matter most
- Forces you to think about edge cases and undesired situations

**What makes a good use case?**
- Short name with a single action/verb
- Format: "[Actor] [verb]s the system" (e.g., "Driver starts the system")
- If no external actor, system can be the actor: "System monitors weather"

**What are actors?**
The main stimulus causing the system to act. Can be:
- People (user, admin, support staff)
- Other systems or equipment
- Software programs
- Internal triggers (scheduled jobs, system events)

**What are the relationship types?**

| Relationship | Meaning | Example |
|--------------|---------|---------|
| `<<includes>>` | Required sub-action that MUST happen | "Checkout" includes "Validate Payment" |
| `<<extends>>` | Optional variation that MAY happen | "Checkout" extends with "Apply Coupon" |
| `<<generalizes>>` | Special version with extra requirements | "Drive Semi Truck" generalizes "Drive Vehicle" |
| `<<trigger>>` | One use case causes another | "Detect Fire" triggers "Extinguish Fire" |

**When to use includes vs extends:**
- **Includes:** The parent use case cannot complete without the child
- **Extends:** The parent use case can complete without the child (it's optional/conditional)

---

### BOX 2: Clarification Questions
**"What to ask the user"**

**Core Use Cases:**
- What are the 3-5 most important things a user can do with this system?
- What are the main goals each actor type needs to accomplish?

**Actor Variants:**
- For [use case], does the system behave differently for different user types?
  - (e.g., "Student driver" vs "Experienced driver" vs "Elderly driver")
- Are there automated actors? (scheduled jobs, external system triggers)

**Undesired/Negative Use Cases:**
- What happens if something goes wrong during [use case]?
- Are there malicious use cases to consider? (unauthorized access, abuse)
- What edge cases or error scenarios exist?

**Relationships:**
- Does [use case] require other actions to happen first? (<<includes>>)
- Are there optional variations or special cases? (<<extends>>)
- Does completing [use case] automatically trigger another action? (<<trigger>>)

**Direct Stakeholder Requests:**
- Are there specific functions stakeholders explicitly requested?
  - (e.g., "System should alert user to X" or "System should automatically do Y")

**Completeness Check (ask after gathering):**
- Can you state the starting and ending conditions for each use case?
- Does each capture unique functionality that would be missed otherwise?

---

### BOX 3: Internal Diagram Specifications
**"Rules for generating the diagram"**

**Diagram Frame:**
- Rectangular border around entire diagram
- Title format: uc.[TitleInCamelCase] (e.g., uc.MainOperationUseCases)
- "The System" label on system boundary box

**Actors:**
- Represented as stick figures
- Primary actors: LEFT side of boundary
- Secondary actors: RIGHT side or elsewhere
- Secondary actors may use dashed connection lines

**Use Case Bubbles:**
- Ovals/ellipses inside the system boundary
- Text centered, same font size for all
- Bubbles roughly same size (larger with whitespace > cramped text)
- Actor name NOT included in bubble (connection implies it)
- Can drop "the system" suffix for cleaner labels

**Connection Lines:**

| Type | Line Style | Direction | Label |
|------|------------|-----------|-------|
| Actor to Use Case | Solid line | Actor → Bubble | (none) |
| `<<includes>>` | Dashed arrow | Main → Sub | <<includes>> |
| `<<extends>>` | Dashed arrow | Sub → Main | <<extends>> |
| `<<generalizes>>` | Solid, open triangle head | Special → General | (none) |
| `<<trigger>>` | Dashed arrow | Initial → Triggered | <<trigger>> |

**Labels:**
- Written in lowercase
- Double angle brackets: <<includes>>, <<extends>>, <<trigger>>

---

## Step 1.3: Scope Tree (Deliverable Tree)

### BOX 1: Educational / Explanatory
**"What is this and why are we doing it?"**

**What is a Scope Tree?**
A hierarchical breakdown of everything needed to deliver your end result. Also called a "deliverable tree" or "question tree."

**Why do we do this?**
- Defines the full scope of work required
- Prevents stakeholder surprises ("We said report, we assumed you'd also do X, Y, Z")
- Creates a path from atomic tasks → sub-deliverables → end deliverable
- Foundation for timelines, resource planning, and PERT charts

**How does it work?**
1. Start with end deliverable (the root)
2. Ask: "What do I need to deliver THIS?"
3. Break into sub-deliverables
4. Keep drilling until you reach atomic tasks (can't break down further)
5. Follow the tree back up = your complete scope

**What are the leaf nodes?**
Branches typically end with:
- Questions that need answers
- Data that needs to be gathered
- Atomic tasks you know how to complete
- Performance criteria for measuring success

**Managing scope:**
- If something gets cut, mark with dashed line (don't delete — it's your next phase)
- Can split into multiple trees if too large
- Label branches for easy reference (e.g., "Analysis.CostEst.GovtIncentives")

---

### BOX 2: Clarification Questions
**"What to ask the user"**

**End Deliverables:**
- What is the final deliverable for this project/phase?
- Are there multiple end deliverables?

**Breakdown:**
- What are the major components needed to deliver [end deliverable]?
- For each component: what sub-tasks or sub-deliverables are required?

**Scope Boundaries:**
- What is definitely IN scope for this release?
- What is explicitly OUT of scope or deferred?
- Are there stakeholder assumptions about what's included that we should verify?

**Resources & Constraints:**
- Are there known data sources or resources needed?
- Are there questions that need answers before proceeding?
- What expertise or external help is required?

**Performance Criteria:**
- How will you measure success for [deliverable]?
- What makes a "good" version vs "bad" version of this deliverable?

---

### BOX 3: Internal Diagram Specifications
**"Rules for generating the diagram"**

**Structure:**
- Root node = end deliverable (top)
- Child nodes = sub-deliverables and tasks
- Leaf nodes = atomic tasks, questions, or data needs

**Node Types & Colors:**

| Type | Color | Description |
|------|-------|-------------|
| Deliverable | White | Work product to be delivered |
| Data | Light Green | Information needed |
| Performance Criteria | Light Yellow | How to measure success |
| Question | White with "?" | Unknown that needs answering |
| Out of Scope | Dashed border | Cut from current phase |

**Labeling:**
- Branch labels for reference: Analysis.3Panels.CostEst
- Labels grow as you go deeper: Analysis.3Panels.CostEst.GovtIncent

**Layout:**
- Hierarchical, top-down or left-right
- Can split across multiple slides/pages
- Reference other branches: "See Analysis.3Panels.CostEst"

**Scope Cuts:**
- Dashed line/border = removed from current scope
- Keep in diagram (don't delete) = starting point for next phase

---

# PHASE 2: BUILD REQUIREMENTS

---

## Step 2.0: Defining the System (Pre-UCBD)

### BOX 1: Educational / Explanatory
**"What is this and why are we doing it?"**

**What are we doing now?**
Moving from "what the system interacts with" to "what the system must DO." This is the bridge between scope definition and formal requirements.

**Why is this important?**
- Context diagrams show interactions, but not behavior
- Use cases show scenarios, but not step-by-step functions
- We need to formalize WHAT the system must do in each scenario
- This creates a technical definition that any valid solution must meet

**The key mindset shift:**
Before: "The system fires the projectile"
After: "The system SHALL BE ABLE TO fire the projectile"

Asking "If it has to do this, what else must it do?" reveals hidden requirements:
- It shall hold the projectile until launch
- It shall be triggered by the user
- It shall eject the projectile safely

**What makes a requirement different from a feature?**
- Feature: "Shopping cart" (structural — HOW)
- Requirement: "The system shall store selected items for later purchase" (functional — WHAT)

**Functional vs Structural thinking:**

| Functional (DO THIS) | Structural (DON'T DO THIS) |
|---------------------|---------------------------|
| What the need is | How to meet the need |
| What it must do | How to do it |
| Any valid solution fits | Specific solution locked in |
| "Store user data persistently" | "Use PostgreSQL database" |

---

### BOX 2: Clarification Questions
**"What to ask the user"**

**Preparation Check:**
- Have you identified your stakeholders?
- Do you have a context diagram showing system interactions?
- Do you have a list of use cases to explore?

**Priority Assessment:**
- Which use cases are highest priority?
  - Addresses primary stakeholder needs?
  - High risk if it fails?
  - Occurs frequently?
  - Complex and important?

**Scope Confirmation:**
- What are the deliverables your client expects?
- Are there constraints or regulations you must conform to?

---

### BOX 3: Internal Specifications
**"Rules for the system"**

**Readiness Criteria (Step 0):**
- [ ] Stakeholders defined
- [ ] Context diagram complete
- [ ] Use case list prepared
- [ ] Client deliverables defined (if applicable)

**Priority Rating Scale:**
- **High:** Primary stakeholder need, high risk, complex, frequent
- **Medium:** Secondary need, moderate complexity
- **Low:** Nice-to-have, edge case, infrequent

---

## Step 2.1: Use Case Behavioral Diagram (UCBD)

### BOX 1: Educational / Explanatory
**"What is this and why are we doing it?"**

**What is a UCBD?**
A step-by-step breakdown of what happens during a use case. It shows WHO does WHAT in chronological order, separating actor actions from system functions.

**Why do we do this?**
- Reveals the detailed functions hiding in each use case
- Creates testable requirements ("shall" statements)
- Prevents "I thought it would do X" surprises
- Makes requirements traceable back to scenarios

**The UCBD structure:**
```
+------------------+--------------------+------------------+
| Primary Actor    | The System         | Other Elements   |
+------------------+--------------------+------------------+
| [informal action]| [shall statement]  | [informal action]|
| User clicks...   | System shall...    | API returns...   |
+------------------+--------------------+------------------+
```

**Key rules:**
- One column per actor + one for "The System"
- Primary actor on LEFT, others on RIGHT
- Only ONE column for The System (no subsystems yet!)
- Actor actions = informal language
- System actions = formal "shall" statements

**Starting and Ending Conditions:**
Every UCBD needs:
- **Precondition:** What must be true before this use case begins?
- **Postcondition:** What is true when this use case completes?

Example:
- Precondition: "User is logged in, cart is not empty"
- Postcondition: "Order is placed, confirmation email sent"

**The Delving Technique:**
Keep asking: "If the System has to do this, what else must it do?"

Example chain:
1. "System fires projectile"
2. → Must hold projectile first
3. → Must be triggered by user
4. → Must aim at target
5. → Must handle misfires

---

### BOX 2: Clarification Questions
**"What to ask the user"**

**UCBD Setup:**
- What is the name of this use case?
- Who/what is the main actor (primary stimulus)?
- Are there other actors involved?

**Conditions:**
- What must be true BEFORE this use case begins? (precondition)
- What is true AFTER it succeeds? (postcondition)
- Are there alternate ending conditions (failure cases)?

**Step-by-Step Flow:**
- What triggers this use case to start?
- What does [actor] do first?
- What must the system do in response?
- What happens next?
- How does this use case end?

**Delving Questions:**
- "If the system has to [do X], what else must it do?"
- "Are there other functions occurring at the same time?"
- "If a contractor built only these functions, would you be happy?"

**Notes & Assumptions:**
- Are there any assumptions we should document?
- Are there edge cases or special conditions?

---

### BOX 3: Internal Diagram Specifications
**"Rules for generating the UCBD"**

**Column Layout:**
- Column 1: Primary Actor (left)
- Column 2: The System (center)
- Columns 3+: Other actors/elements (right)

**Swimlane Rules:**
- One statement per row
- Chronological order from top to bottom
- Arrows show flow between swimlanes

**Statement Formatting:**
- Actor actions: Informal verb phrases ("User clicks button")
- System actions: Formal shall statements ("The System shall validate input")

**Notes Section:**
- Numbered list at bottom
- Document assumptions and clarifications
- Reference notes in the main body as needed

**UCBD Quality Checklist:**
- [ ] One column for The System (not split into subsystems)
- [ ] Precondition and postcondition defined
- [ ] Chronological flow from start to end
- [ ] System statements use "shall" language
- [ ] Notes document assumptions

---

## Step 2.2: Requirements Table & Constants

### BOX 1: Educational / Explanatory
**"What is this and why are we doing it?"**

**What is a Requirements Table?**
A formal list of every "shall" statement extracted from your UCBDs, with unique IDs for tracking.

**Why do we do this?**
- Creates a single source of truth for what the system must do
- Enables traceability (requirement → use case → stakeholder need)
- Allows testing against specific requirements
- Professional-grade deliverable that teams can implement from

**Requirements Table Structure:**

| Index | Requirement | Abstract Function Name |
|-------|-------------|----------------------|
| OR.1 | The System shall validate user input | uc02_validate_input |
| OR.2 | The System shall store validated data | uc02_store_data |

**What are Requirement Constants?**
Placeholders for values you don't know yet.

Instead of: "The System shall respond within 200ms"
Write: "The System shall respond within MAX_RESPONSE_TIME"

Later, define: MAX_RESPONSE_TIME = 200ms

**Why use constants?**
- Write requirements now, decide specifics later
- Easy to update one place instead of many
- Makes thresholds explicit and testable
- Tracks where values came from (source)

**Constants Table Structure:**

| Constant Name | Value | Units | Est/Final | Source | Used In |
|--------------|-------|-------|-----------|--------|---------|
| MAX_RESPONSE_TIME | 200 | ms | EST | Performance benchmark | OR.1, OR.5 |

**The 10 Properties of Good Requirements:**
1. Written as SHALL statements
2. Correct (accurate)
3. Clear and precise (one idea only)
4. Unambiguous (one interpretation)
5. Objective (non-opinionated)
6. Verifiable (can be tested)
7. Consistent (no contradictions)
8. Implementation independent (functional, not structural)
9. Achievable (feasible)
10. Conforming (meets regulations)

**The "And" Test:**
If your requirement has "and" in it, split it into two requirements.

Bad: "The System shall validate input AND store it"
Good:
- "The System shall validate input"
- "The System shall store validated input"

---

### BOX 2: Clarification Questions
**"What to ask the user"**

**Requirements Extraction:**
- Looking at the UCBD, what are all the system "shall" statements?
- Are there implicit requirements not written yet?
- Are any requirements redundant or conflicting?

**Constants Identification:**
- Which requirements have numeric thresholds?
- What values are still unknown or estimated?
- Where did this threshold value come from?

**Verification Planning:**
- How would you prove this requirement is met?
- What test would demonstrate compliance?
- Is there a measurable way to verify this?

**Quality Check:**
- Does this requirement have only one idea?
- Is there only one way to interpret this?
- Is this functional (what) not structural (how)?

---

### BOX 3: Internal Specifications
**"Rules for generating Requirements Tables"**

**Requirements Table Format:**

```json
{
  "Index": "OR.1",
  "Requirements": "The System shall [action] [object] [constraint]",
  "Abstract Function Name": "uc[XX]_[descriptive_name]"
}
```

**ID Naming Convention:**
- OR.1, OR.2, OR.3... (Originating Requirements)
- Prefix indicates source: OR = Originating, DR = Derived

**Abstract Function Naming:**
- Format: uc[number]_[snake_case_description]
- Example: uc02_validate_user_input

**Constants Table Format:**

```json
{
  "Constant Name": "MAX_RESPONSE_TIME",
  "Value": "200",
  "Units": "ms",
  "Est/Final": "EST",
  "Source": "Performance benchmark study",
  "Used in Requirements": "OR.1, OR.5",
  "Notes": "May be refined after load testing"
}
```

**Requirement Quality Validation:**
- [ ] Uses "shall" language
- [ ] Single idea (no "and" conjunctions)
- [ ] Verifiable (can be tested)
- [ ] No implementation details
- [ ] Consistent with other requirements

---

## Step 2.3: SysML Activity Diagram

### BOX 1: Educational / Explanatory
**"What is this and why are we doing it?"**

**What is a SysML Activity Diagram?**
A visual representation of the UCBD flow using standard SysML notation. It shows the sequence of actions and decisions in a use case.

**Why do we do this?**
- Standard notation that engineers understand
- Visual companion to the requirements table
- Shows flow control (decisions, parallel actions)
- Can be imported into SysML modeling tools

**How does it relate to the UCBD?**
- Each UCBD row becomes an "action" (rounded rectangle)
- Swimlanes match UCBD columns
- System actions link to requirements table entries
- Precondition and postcondition become start/end states

**Key Elements:**

| Element | Shape | Purpose |
|---------|-------|---------|
| Action | Rounded rectangle | A step in the process |
| Start | Filled circle | Beginning of flow |
| End | Circle with dot | End of flow |
| Decision | Diamond | Branch point |
| Fork/Join | Bar | Parallel actions |
| Swimlane | Vertical partition | Actor responsibility |

**Pairing with Requirements:**
Each system action in the activity diagram has a corresponding:
- Requirement in the Requirements Table (formal "shall" statement)
- Unique requirement ID (e.g., OR.1)

---

### BOX 2: Clarification Questions
**"What to ask the user"**

**Flow Verification:**
- Does this diagram accurately represent the UCBD flow?
- Are there any missing steps or decisions?
- Are the swimlane assignments correct?

**Decision Points:**
- Where are the branching points in this flow?
- What conditions determine each branch?
- Are there parallel actions that can happen simultaneously?

**Edge Cases:**
- What happens if [condition] fails?
- Are there alternate flows to show?
- Should exception flows be separate diagrams?

---

### BOX 3: Internal Diagram Specifications
**"Rules for generating Activity Diagrams"**

**Diagram Structure:**
```
Use Case: [Use Case Name]
Precondition: [Starting state]

+-----------+-----------+-----------+
|  Actor    |  System   |  Other    |
+-----------+-----------+-----------+
|     ●     |           |           |  ← Start node
|     ↓     |           |           |
|  [action] |           |           |
|     ↓     |           |           |
|           | [action]  |           |
|           |     ↓     |           |
|           | [action]  |           |
|     ↓     |           |           |
|     ◉     |           |           |  ← End node
+-----------+-----------+-----------+

Postcondition: [Ending state]
Notes: [Numbered notes]
```

**Action Box Rules:**
- Rounded corners (not square)
- Same width for all boxes
- Height adjusts to fit text
- Informal text for actors
- Links to requirement IDs for system

**Control Flow Arrows:**
- Solid arrows between actions
- One arrow in, one arrow out per action
- Decision diamonds for branches
- Fork/join bars for parallel actions

**Requirements Pairing:**
- Create separate Requirements Table diagram
- One box per system action
- Format: <<requirement>> / [Abstract Name] / Text: [Shall statement] / Id: "[OR.X]"

---

# EDUCATIONAL INTEGRATION STRATEGY

---

## Where to Surface Education

### 1. AI "Thinking" States (Primary Opportunity)
When the model is processing/generating, show contextual education:

| Processing State | Educational Content |
|-----------------|---------------------|
| Analyzing context diagram | "Why we identify actors first..." |
| Generating use cases | "What makes a good use case..." |
| Creating UCBD | "The delving technique reveals..." |
| Extracting requirements | "Shall statements ensure..." |
| Validating requirements | "The contractor test asks..." |

### 2. Tooltips (Hover Education)
Key terms that trigger brief explanations:
- Actor, Stakeholder, Use Case, Shall Statement
- Precondition, Postcondition, Boundary
- Includes, Extends, Trigger, Generalizes
- Requirement Constant, Performance Criteria

### 3. Empty States (What Goes Here)
Before content is added:
- Context diagram empty: "Start by adding who uses your system..."
- Use cases empty: "Think about scenarios, not features..."
- Requirements empty: "Each shall statement captures one function..."

### 4. Progress Celebrations (Value Created)
After completing each stage:
- Context diagram: "You've mapped your system's world"
- Use cases: "You've captured all the scenarios"
- UCBD: "You've discovered the hidden requirements"
- Requirements: "You've created a professional spec"

### 5. Validation Feedback (Why It Matters)
When validation fails:
- Missing actor: "Every interaction needs a source..."
- Ambiguous requirement: "The contractor test: would they know exactly what to build?"
- Structural requirement: "Focus on WHAT, not HOW..."

---

## Thinking State Messages by Step

### Step 1.1: Context Diagram
```
🔍 Analyzing your system's interactions...

💡 Did you know? Professional designers call it "The System"
   early on because naming it too soon narrows your solutions.

   A "car" could be a sedan, SUV, or even a flying vehicle.
   "The System" keeps all possibilities open.
```

### Step 1.2: Use Case Diagram
```
🔍 Discovering use case scenarios...

💡 Pro tip: Use cases capture situations, not features.

   "Shopping cart" is a feature.
   "Customer adds item while comparing prices" is a use case.

   Scenarios tell the real story of how your system is used.
```

### Step 1.3: Scope Tree
```
🔍 Building your deliverable breakdown...

💡 The scope tree prevents surprise scope creep.

   Ask: "What do I need to deliver THIS?"
   Keep drilling until you reach atomic tasks.

   If it's not on the tree, it's not in scope.
```

### Step 2.1: UCBD
```
🔍 Extracting functional requirements...

💡 The Delving Technique in action:

   "If the system has to do THIS, what else must it do?"

   This question reveals requirements that would otherwise
   surface as expensive surprises during development.
```

### Step 2.2: Requirements Table
```
🔍 Formalizing your requirements...

💡 Studies show 50% of project defects trace back to
   poor requirements.

   Cost to fix a requirement error:
   • In requirements: $1
   • In design: $10
   • In code: $100
   • In production: $1000+
```

---

## Snippet Library by Length

### 15-word Tooltips
- **Context Diagram:** "Your system as a box, surrounded by everything it must interact with."
- **Actor:** "Anyone or anything that directly interacts with your system."
- **Stakeholder:** "Anyone affected by or who can affect your system. Think beyond users."
- **Use Case:** "A situation where your system is used. Think scenarios, not features."
- **Shall Statement:** "Professional requirements use 'shall' — it's clear, testable, and unambiguous."
- **Boundary:** "The line between what you control and what you don't."

### 40-word Chat Intros
- **Starting Context Diagram:** "Let's map your system's world. We'll place 'The System' in the center and surround it with everything it interacts with — users, external systems, and even unwanted interactions like security threats."

- **Starting Use Cases:** "Now let's think in scenarios. Forget features for a moment — what are the situations where someone uses your system to accomplish something? These are your use cases."

- **Starting UCBD:** "Time to walk through this use case like a movie script. Frame by frame: What does the user do? What does the system do in response? This reveals requirements hiding in the gaps."

- **Starting Requirements:** "We're creating professional-grade requirements now. Each one will use 'shall' language and be testable. If a contractor built exactly what's written — would you be happy?"

### 60-word Value Statements
- **After Context Diagram:** "You now have a clear picture of WHO uses your system and WHAT it connects to. Most projects skip this and pay for it later with scope creep and missed integrations. Your context diagram is the foundation that prevents designing the wrong system."

- **After Requirements:** "You've defined WHAT your system must do in concrete, testable terms. Developers can now estimate accurately and build confidently. This is what enterprise projects pay consultants $50K+ to create."

---

*Created: 2025-01-25*
*For: Phase 12 - Project Explorer UI - Educational Content Integration*
