# Knowledge Bank: Scope Tree (Deliverable Breakdown)

**Step:** 1.3 - Scope Tree
**Purpose:** Define exactly what needs to be delivered, preventing scope creep
**Core Question:** "What do I need to deliver THIS?"

---

## WHY THIS STEP MATTERS

The Scope Tree prevents the classic stakeholder surprise:

> "We said 'report' — we assumed you'd also do X, Y, and Z..."

**The Rule:** If it's not on this tree, it's not in scope.

**The stakeholder conversation it enables:**
> "You asked for a report. This is what we believe a report entails. This is what we believe an analysis entails. These are the kinds of tests we're going to run. Is that what you're expecting, or were you expecting something else?"

Having this conversation early prevents the far worse conversation at delivery:
> "This is very nice, but where is X? Where is Y? We said we wanted a report. We naturally assumed you'd do all these other things, which you didn't actually assume yourself."

Benefits:
- Clear definition of what WILL be delivered
- Clear definition of what WON'T be delivered (yet)
- Foundation for timelines, resource planning, and charts (e.g., PERT)
- Protection against scope creep
- Starting point for Phase 2 (cut items saved, not deleted)

**Additional layers you can add:**
- **Resources needed** — What resources (people, equipment, data) are required for each task?
- **Performance criteria** — How will you assess whether a deliverable is good, bad, or better? Discussing these with the stakeholder helps define quality expectations.

**Realistic expectations:** Building a scope tree takes considerable time and iteration. Experienced practitioners often spend a week or more, going through multiple iterations and team conversations before producing a version ready to share externally. Your first attempt won't be your last — and that's the point.

**Prerequisites:** You should have completed:
- Context diagram (Step 1.1) — shows what your system interacts with
- Use case diagram (Step 1.2) — shows all scenarios your system must handle
- These feed directly into the scope tree — your use cases reveal what needs to be delivered

---

## WHAT IS A SCOPE TREE?

A **hierarchical breakdown** of everything needed to deliver your end result.

Also called:
- Deliverable Tree
- Work Breakdown Structure (WBS)
- Question Tree (when many branches end with unknowns)

**How it works:**
1. Start with the END DELIVERABLE (root)
2. Ask: "What do I need to deliver THIS?"
3. Break into sub-deliverables
4. Keep drilling until you reach **atomic tasks**
5. Follow the tree back up = your complete scope

---

## BUILDING THE TREE: PRACTICAL PROCESS

Building a scope tree is messy — and that's expected. Here's how it actually works in practice:

### 1. First Pass Is Rough

Start by getting ideas down. Don't worry about perfect structure, precise placement, or whether every branch is complete. Some branches will be broken down further, some won't even be connected yet. Structure emerges as you work.

```
PH: This is a first pass. Some branches are broken down further,
some aren't connected yet. We'll organize and expand as we go.
The goal right now is to capture everything we can think of.
```

### 2. Reorganize As You Go

As you work, you'll realize nodes belong in different places. Move them. For example, you might initially list "Cost Estimates" as a top-level deliverable, then realize it belongs under "Panel Options" because cost is a property of each panel type. This reorganization is a natural part of the process.

### 3. Explore Branches Individually

When a branch gets complex, zoom in on just that branch. Work it out in detail before returning to the broader tree. You don't need to develop every branch to the same depth at the same time.

```
PH: "[Branch]" has a lot of important tasks going into it.
Let's explore just this branch for now before returning
to the rest of the tree.
```

### 4. Branch Labeling Convention

Label each branch for easy referencing, especially when splitting across pages or documents. The label grows to show provenance — where this branch came from:

```
Root:       Analysis
Level 1:    Analysis.3Panels
Level 2:    Analysis.3Panels.CostEst
Level 3:    Analysis.3Panels.CostEst.GovtIncent

Give labels any name you want — just make sure
each has a clear and unique meaning.
```

### 5. When a Branch Outgrows the Page

It's common for a branch to run off the page while you're working on it. When that happens:
- **Cut it off** on the current page/slide
- **Reference the branch label** where the full expansion can be found
- **Start the new page** with a reference back to the parent, so the reader knows where they are

```
[On main tree]
  Cost Estimates → (See Analysis.3Panels.CostEst)

[On separate page]
  Analysis.3Panels.CostEst
  ├── Installation Cost Estimates
  ├── Anticipated Maintenance Schedule & Costs
  └── Government Incentive Options → (See Analysis.3Panels.CostEst.GovtIncent)
```

### 6. Repeating vs. Sharing Nodes

When the same deliverable or data is needed by multiple parent branches, you have two options:

- **Repeat the node** under each parent (usually preferred — clearer for the reader)
- **Share the node** and connect it to both parents (when both parents' needs can easily be met at the same time by one person/task)

Most of the time, repeat. Share only when the work is genuinely the same task serving both parents simultaneously.

### 7. Handling Unknowns and Circular Dependencies

You'll encounter situations where you need the output of one task to proceed with another, but that task depends on the first. When you discover circular dependencies:
- **Add an estimation stage** — create an "estimate" version of the deliverable to use initially
- **Add an "adjust" step** later to refine once the real data is available
- **Flag the uncertainty** — leave it in the tree with a note, and plan to get the question answered soon

```
Example: Need panel layout to check building code,
but need code approval to finalize layout.

Solution:
  ├── Calculate ESTIMATE of panels & their location
  │   └── (uses building size, roof size, panel sizes)
  ├── Create documentation showing code compliance
  └── ADJUST calculation to meet code requirements
```

### 8. Color Coding (Optional)

A useful convention for visual clarity — though normally you add color last since it's easier to track categories by written text during construction:

| Color | Category | Examples |
|-------|----------|----------|
| **White** | Deliverables and tasks | "Install panels," "Create report" |
| **Light Green** | Data needed | "Building size," "Panel efficiency data sheets" |
| **Light Yellow** | Performance criteria | "Time to complete," "Estimated complexity" |
| **Dashed border** | Out of scope | Deferred items for Phase 2 |

---

## IDEAL INTERACTION FLOW

### Opening (Set Context)

```
PH: Time to define exactly what needs to be DELIVERED.

The scope tree answers the question stakeholders always ask later:
"We said X, we assumed you'd also do Y and Z..."

Here's the rule: If it's not on this tree, it's not in scope.

We'll start with your end deliverable and break it down until
we reach atomic tasks — things you know exactly how to complete.

What is THE deliverable for this project?
```

### Round 1: End Deliverable (Root)

**Goal:** Identify the single thing being delivered

```
PH: What is THE deliverable for this project?

Not features. Not capabilities. The actual thing you hand over.

Examples:
- "A functioning mobile app on App Store and Play Store"
- "An API with documentation and test suite"
- "A prototype with user testing results"
- "A report with recommendations"

This becomes the ROOT of your tree — everything else supports it.

[User states deliverable]
```

### Round 2: Major Components (First Level)

**Goal:** Break root into major sub-deliverables

```
PH: What are the MAJOR components needed to deliver that?

Ask: "What do I need to deliver [root]?"

Example for a mobile app:
- User authentication system
- Core feature module
- Payment integration
- Admin dashboard
- App store submissions

Don't go too deep yet — just the major pieces.

[User lists major components]
```

### Round 3: Recursive Breakdown

**Goal:** Continue breaking down until reaching atomic items

```
PH: Let's take "[Component]" and break it down further.

Ask again: "What do I need to deliver THIS?"

Keep going until you reach one of these leaf types:
- Questions that need answers (mark with ?)
- Data that needs gathering
- Atomic tasks you know how to complete
- Performance criteria (how to measure success)

[User continues breakdown]

PH: For "[Sub-component]", can you break that down further,
or is it atomic — something you know exactly how to do?

[Continue until all branches reach leaves]
```

### Round 4: Questions and Unknowns

**Goal:** Surface unknowns that need resolution before proceeding

```
PH: As we've broken this down, what QUESTIONS have emerged?

Things you don't know yet but need to answer:
- Technical feasibility questions
- Business decision questions
- Data you need to gather
- Research that needs doing

Mark these with "?" — they're real deliverables too.
Someone has to answer them before work can proceed.

[User identifies unknowns]
```

### Round 5: Performance Criteria

**Goal:** Define how success will be measured

```
PH: For "[Deliverable]", how will you measure success?

What makes a "good" version vs a "bad" version?

Examples:
- "Page loads in under 2 seconds"
- "95% uptime"
- "Passes all automated tests"
- "Approved by legal review"

These criteria become deliverables themselves —
you need to define them, measure them, prove them.

[User defines success criteria]
```

### Round 6: Scope Boundaries

**Goal:** Explicitly define what's OUT of scope

```
PH: Now the hard question: What's OUT of scope for this release?

Don't DELETE these items — mark them with a dashed line.

Why? Those dashed items become your Phase 2.

When stakeholders ask "what about X?" you point to the tree:
"That's Phase 2 — we captured it, but it's not in this release."

What should we explicitly defer?

[User identifies out-of-scope items]

PH: 💡 By marking it as "out of scope" rather than deleting it,
you've created the starting point for your next phase.
Nothing is lost — it's just prioritized for later.
```

---

## LEAF NODE TYPES

The branches of your tree end with different types of leaves:

| Type | Visual | Description | Example |
|------|--------|-------------|---------|
| **Atomic Task** | White box | Task you know how to complete | "Contact panel vendors for information" |
| **Data Needed** | Light Green | Information to gather | "Building size, roof weight constraints" |
| **Performance Criteria** | Light Yellow | How to measure success | "Time to complete, estimated complexity" |
| **Question / Unknown** | White with "?" | Unknown needing answer | "How do you measure complexity?" |
| **Resource Request** | White | Request for people/tools to proceed | "Who can we contact as a resource?" |
| **Out of Scope** | Dashed border | Deferred to later phase | "Battery storage options (Phase 2)" |

**Branches commonly end with one of these patterns:**
- **Questions** about sources of data or how to do things — these are the most common leaf type. "Where can we find out the code?" "Who can we get this info from?" "What does this document look like?"
- **Requests for additional resources** — people, expertise, or access needed to proceed
- **Sets of data** that are already known or need gathering (green)
- **Atomic tasks** that you know how to complete
- **Performance criteria** describing how to assess quality (yellow)

---

## LABELING SYSTEM

For complex trees, use hierarchical labels for easy reference:

```
Project
├── Analysis
│   ├── Analysis.Research
│   │   ├── Analysis.Research.UserInterviews
│   │   └── Analysis.Research.CompetitorAnalysis
│   └── Analysis.Requirements
├── Design
│   ├── Design.UX
│   └── Design.Technical
└── Implementation
    ├── Implementation.Frontend
    └── Implementation.Backend
```

**Benefits:**
- Easy to reference in discussions ("See Analysis.Research.UserInterviews")
- Clear hierarchy
- Can split into multiple documents while maintaining references

---

## SPLITTING LARGE TREES

When trees get too large:

**Option 1: By Component**
- Main tree shows major components
- Separate detailed trees for each component
- Reference: "See Implementation.Frontend tree"

**Option 2: By Phase**
- Phase 1 tree (current scope)
- Phase 2 tree (deferred scope)
- Clear handoff between phases

**Option 3: By Focus**
- Core problem tree
- Secondary stakeholder tree
- Special cases tree

**PH Guidance:**
```
PH: Your tree is getting large. Let's split it for clarity.

Would you prefer to split by:
1. Component (separate trees per major component)
2. Phase (current vs deferred)
3. Focus (core vs secondary)

The main tree can reference sub-trees:
"See detailed breakdown in [Component] tree"
```

---

## REAL EXAMPLE

### Toy Catapult Project

```
Toy Catapult System
├── Launching Mechanism
│   ├── Energy Storage Component
│   │   ├── ? What material for tension?
│   │   └── ? Max energy to store safely?
│   ├── Trigger Mechanism
│   │   └── Child-safe trigger design
│   └── Projectile Holder
│       └── Compatible with standard toys
├── Safety Features
│   ├── Velocity Limiting
│   │   └── [Yellow] Max velocity < X m/s
│   ├── Edge Protection
│   │   └── No sharp edges
│   └── Material Safety
│       └── Non-toxic, child-safe materials
├── Usability
│   ├── Size Constraints
│   │   └── [Yellow] Fits in child's hands
│   ├── Assembly
│   │   └── No tools required
│   └── Instructions
│       └── Visual instructions for ages 6+
├── Testing & Validation
│   ├── Safety Testing
│   │   └── [Green] Safety certification data
│   └── User Testing
│       └── [Green] Child usability feedback
└── [Dashed] Phase 2: Advanced Features
    ├── Adjustable power levels
    └── Score tracking
```

### Solar Panel Analysis (Multi-Page Tree — Key Patterns)

This example demonstrates how a real tree grows across multiple pages with branch references, reorganization, and iterative refinement:

```
Analysis (Root)
├── Solar Panel Analysis for Community Hall
│   ├── Determine Top 3 Panel Choices
│   │   ├── List of All Panel Options Investigated on Power
│   │   ├── [Green] Cost Estimates → (See Analysis.3Panels.CostEst)
│   │   ├── [Green] Payback Periods
│   │   ├── [Green] Power Consumption / Generation Chart
│   │   └── Calculate Solar Power Generation
│   │       ├── Determine Panel Efficiency from Data Sheets
│   │       └── Determine Incoming Solar Radiation
│   │           └── → (See Analysis.3Panels.PanelList.PanelEff&SolarRad)
│   │
│   ├── [Dashed — CUT FROM SCOPE]
│   │   ├── Battery Storage Options
│   │   └── Building Renderings with Solar Panels Installed
│   │
│   └── Documentation on Related Building Code Compliance
│
├── Analysis.3Panels.CostEst (branch page)
│   ├── Installation Cost Estimates
│   │   ├── [Green] Parts Costs
│   │   ├── [Green] Labor Costs
│   │   ├── [Green] Shipping Costs
│   │   ├── [Green] Parts Availability
│   │   └── [Yellow] Time to Complete, Expertise, Complexity
│   ├── Anticipated Maintenance Schedule & Costs
│   │   └── [Yellow] Frequency, Cost, Time, Expertise, Complexity
│   ├── Government Incentive Options → (See Analysis.3Panels.CostEst.GovtIncent)
│   ├── Contact Panel Vendors for Information
│   ├── Select "Baseline" Panel for comparison
│   └── Contact Contractors for Estimates
│       └── ? What info do they need? (Building size, roof size, etc.)
│
└── Analysis.3Panels.CostEst.GovtIncent (branch page)
    ├── Determine Time Periods
    ├── Qualification Requirements
    ├── Discuss w/ Stakeholder Contact who handles this
    ├── Application Procedure
    │   └── ? Which Stakeholder Contact handles this?
    ├── Research Government Websites  ←(serves both Determine + Qualification)
    └── Contact Government Representatives
```

**Key patterns demonstrated in this example:**
- Branch labels grow to show provenance: `Analysis.3Panels.CostEst.GovtIncent`
- Branches are cut off and referenced when they outgrow the page
- New pages start with parent reference for context
- Nodes can be shared when one task serves multiple parents
- [Dashed] items are cut from scope but preserved for the next phase
- Leaf nodes are mostly questions ("?"), data needs ([Green]), and criteria ([Yellow])
- Adding performance criteria (Yellow) revealed that more deliverables were needed
- Uncertain items are left in with notes ("we'll have to find out")

---

## COMPLETENESS CHECK

When you think your tree is done, use performance criteria as a validation tool:

```
PH: Let's check completeness by reviewing your performance criteria
against your deliverables.

For each performance criterion you've defined:
  ? Is there a deliverable in the tree that addresses it?
  ? Can you trace a path from the criterion to a leaf node
    that will produce measurable evidence?

For each major deliverable:
  ? Does it have at least one performance criterion?
  ? Will the leaf nodes under it actually produce what's needed?
```

**Common discovery at this stage:** Adding performance criteria often reveals that more deliverables are needed. A criterion like "must comply with building code" immediately spawns deliverables: "research building code," "create compliance documentation," "meet with code committee representative."

**It's also common to need estimation stages mid-work.** As you build the tree, you may realize you need a way to estimate performance before you have final data. Creating intermediate estimation deliverables is expected and shows design maturity.

---

## WHEN THE TREE IS DONE

Once your scope tree is complete enough to begin work:

```
PH: Your scope tree is ready. Here's what you can do with it:

1. TRANSLATE TO A TIMELINE
   Map your atomic tasks and dependencies to a schedule.
   You may discover a few more tasks/deliverables in doing so.

2. CREATE A PERT CHART
   Identify critical path and parallel work streams.

3. COMBINE INTO ONE LARGE TREE
   Merge all branch pages into a single comprehensive view.
   Consider color coding for categories.

4. ASSIGN TASKS
   Use leaf nodes to assign work among team members.

5. REVIEW WITH STAKEHOLDERS
   Walk them through the tree: "This is what we believe
   [deliverable] entails. Is this what you're expecting?"
```

---

## COMMON MISTAKES TO CATCH

### Mistake 1: Starting with Features, Not Deliverables

```
User starts with: "Login, Dashboard, Settings..."

PH: ⚠️ Those are features, not the deliverable.

What's the THING you're handing over?
"A mobile app" is a deliverable.
"Login" is a feature OF that deliverable.

Let's start with: What do you hand to the stakeholder?
```

### Mistake 2: Not Deep Enough

```
User stops at: "Authentication System"

PH: Can you do "Authentication System" tomorrow?
Or does it need to be broken down further?

Keep asking "What do I need to deliver THIS?" until
you reach atomic tasks you know how to complete.
```

### Mistake 3: Deleting Out-of-Scope Items

```
User: "We're not doing mobile, so I'll remove it."

PH: ⚠️ Don't delete — mark with a dashed line (out of scope).

Why? When stakeholders ask "what about mobile?"
you can point to the tree: "It's captured for Phase 2."

Deleting it means you'll have to rediscover it later.
```

### Mistake 4: Missing Questions

```
User's tree has no "?" items

PH: 🤔 No unknowns in your tree?

Usually there are decisions not yet made:
- Technology choices
- Design decisions
- Business rules
- Data you need to gather

These are real deliverables — someone has to answer them.
What questions need answering before work can proceed?
```

---

## THINKING STATE MESSAGES

```typescript
const scopeTreeThinking = [
  {
    headline: "Building your deliverable breakdown...",
    tip: "Ask: 'What do I need to deliver THIS?' Keep drilling until you reach atomic tasks.",
    duration: 4000
  },
  {
    headline: "Identifying unknowns...",
    tip: "Questions (?) are real deliverables. Someone has to answer them before work proceeds.",
    duration: 4000
  },
  {
    headline: "Checking scope boundaries...",
    tip: "If it's not on the tree, it's not in scope. Mark deferred items with dashed lines for Phase 2.",
    duration: 4000
  },
  {
    headline: "Validating completeness...",
    tip: "The contractor test: If you handed this tree to someone, would they know EXACTLY what to deliver?",
    duration: 4000
  }
];
```

---

## TOOLTIPS

| Term | Definition |
|------|------------|
| **Scope Tree** | Hierarchical breakdown of everything needed to deliver the end result. |
| **End Deliverable** | The actual thing you hand over — the root of your tree. |
| **Atomic Task** | A task small enough that you know exactly how to complete it. |
| **Performance Criteria** | How you'll measure success for a deliverable. |
| **Out of Scope** | Explicitly deferred to a future phase — captured but not delivered now. |
| **Question Mark (?)** | An unknown that needs answering before proceeding. |

---

## VALIDATION ERRORS

```typescript
const validationErrors = {
  feature_not_deliverable: {
    error: "Root appears to be a feature, not a deliverable",
    why: "The root should be what you hand to the stakeholder, not a capability.",
    fix: "What's the actual thing delivered? 'An app' not 'Login capability'."
  },

  not_atomic: {
    error: "'{item}' doesn't appear to be atomic",
    why: "If you can't do it tomorrow, it needs further breakdown.",
    fix: "Ask: 'What do I need to deliver THIS?' and keep breaking down."
  },

  no_criteria: {
    error: "'{deliverable}' has no success criteria",
    why: "How will you know if it's done well vs poorly?",
    fix: "Define measurable criteria (speed, accuracy, approval, etc.)."
  },

  no_questions: {
    error: "No unknowns (?) in tree",
    why: "Most projects have decisions and research needs.",
    fix: "What technology choices, business rules, or data gaps exist?"
  },

  deleted_not_deferred: {
    error: "Items removed instead of marked out-of-scope",
    why: "Deleted items are rediscovered later. Deferred items become Phase 2.",
    fix: "Use dashed lines for 'not now' instead of deleting."
  }
};
```

---

## COMPLETION CELEBRATION

```
✅ Scope Tree Complete

You've defined everything that will (and won't) be delivered:

📦 {X} deliverables across {Y} levels of breakdown
❓ {Z} questions that need answering
📊 {W} performance criteria defined
⏸️ {V} items deferred to Phase 2

💡 The scope tree prevents:
   • "We assumed you'd also do X" surprises
   • Scope creep during development
   • Undefined success criteria
   • Lost ideas (deferred items are captured, not forgotten)

When stakeholders ask "Is X included?" you can point to the tree.
If it's not there, it's not in scope.

Next: We'll dive into your high-priority use cases to extract
the detailed requirements hiding inside them.
```

---

## PROCESS CONTEXT: WHERE SCOPE TREES FIT

The scope tree is Step 1.3 in the defining-scope process. Here's the full sequence:

| Step | Activity | Deliverable |
|------|----------|-------------|
| 0 | Remove system name — call it "The System" | Unbiased starting point |
| 1-7 | Build and refine context diagram | Context diagram showing all interactions |
| 8 | Develop use case list from context diagram | First pass at use cases |
| 9 | Add use cases from other sources (internal, stakeholder) | Complete use case list |
| 10 | Refine with includes/extends relationships | Refined use cases |
| 11 | Quality check (boundaries, scope, uniqueness) | Validated use case list |
| **1.3** | **Build scope tree from deliverables** | **Scope tree (this step)** |

The scope tree takes the **scenarios** defined in steps 8-11 and translates them into **deliverables** — the actual things you'll build, the data you'll gather, the questions you'll answer, and the criteria you'll meet.

---

*Knowledge Bank: Scope Tree*
*Step 1.3 of PRD Creation Process*
