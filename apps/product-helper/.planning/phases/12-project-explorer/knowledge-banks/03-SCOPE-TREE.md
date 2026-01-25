# Knowledge Bank: Scope Tree (Deliverable Breakdown)

**Step:** 1.3 - Scope Tree
**Purpose:** Define exactly what needs to be delivered, preventing scope creep
**Core Question:** "What do I need to deliver THIS?"

---

## WHY THIS STEP MATTERS

The Scope Tree prevents the classic stakeholder surprise:

> "We said 'report' — we assumed you'd also do X, Y, and Z..."

**The Rule:** If it's not on this tree, it's not in scope.

Benefits:
- Clear definition of what WILL be delivered
- Clear definition of what WON'T be delivered (yet)
- Foundation for timelines and resource planning
- Protection against scope creep
- Starting point for Phase 2 (cut items saved, not deleted)

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
| **Deliverable** | White box | Work product to deliver | "Login screen" |
| **Data Needed** | Light Green | Information to gather | "User research results" |
| **Performance Criteria** | Light Yellow | How to measure success | "Response time < 200ms" |
| **Question** | White with "?" | Unknown needing answer | "Which auth provider?" |
| **Out of Scope** | Dashed border | Deferred to later phase | "Mobile app (Phase 2)" |

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

*Knowledge Bank: Scope Tree*
*Step 1.3 of PRD Creation Process*
