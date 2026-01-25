# Educational Content Integration Plan

**Objective:** Surface educational content subtly throughout the PRD creation experience, teaching users requirements engineering methodology while they work.

---

## Core Principle: Education While Thinking

**The Opportunity:** When the AI is processing (generating diagrams, extracting requirements, validating), users see a loading/thinking state. This is PRIME TIME for education.

Instead of: `Generating... ⏳`

Show:
```
🔍 Analyzing your system's interactions...

💡 Pro tip: We don't name the system yet because naming
   narrows your solution space. "The System" keeps all
   possibilities open until you know what it needs to DO.
```

---

## Implementation Architecture

### 1. Knowledge Bank Structure

```typescript
// lib/education/knowledge-bank.ts

interface EducationalContent {
  step: StepId;
  box1_educational: {
    what_is: string;
    why_do: string;
    key_concepts: string[];
    common_mistakes: string[];
  };
  box2_questions: {
    category: string;
    questions: string[];
  }[];
  box3_specs: {
    rules: string[];
    format: string;
    validation_criteria: string[];
  };
}

interface ThinkingMessage {
  stepId: StepId;
  processingState: ProcessingState;
  headline: string;        // "Analyzing your system's interactions..."
  education: string;       // Pro tip or insight
  duration_hint?: string;  // For longer operations
}

type ProcessingState =
  | 'analyzing_context'
  | 'generating_use_cases'
  | 'creating_ucbd'
  | 'extracting_requirements'
  | 'validating'
  | 'refining';
```

### 2. Content Delivery Points

| Touchpoint | Content Type | Trigger | Duration |
|------------|--------------|---------|----------|
| **Thinking States** | Educational snippets | AI processing | 3-15 sec |
| **Tooltips** | 15-word definitions | Hover on term | On hover |
| **Chat Intros** | 40-word context setters | New step begins | One-time |
| **Empty States** | Why + CTA | Section is empty | Until filled |
| **Validation Errors** | Why + how to fix | Validation fails | Until fixed |
| **Progress Celebrations** | Value created message | Step completes | 3 sec |
| **Section Headers** | Context sentence | Always visible | Persistent |

---

## Step-by-Step Integration

### Phase 1: Define Scope

#### Step 1.1: Context Diagram

**On Entry (Chat Intro):**
```
Let's map your system's world. We'll place "The System" in the
center and surround it with everything it interacts with — users,
external systems, and even unwanted interactions like security threats.

Quick insight: We won't name your solution yet. Professional
designers call it "The System" to stay open to creative solutions.
```

**Thinking States:**
| Processing | Message |
|------------|---------|
| Analyzing intake | "Identifying who interacts with your system..." |
| Generating actors | "💡 Actors are anyone/anything that directly interacts with your system" |
| Adding interactions | "💡 Each line shows data/requests flowing between your system and the outside world" |
| Validating diagram | "Checking for completeness... Every external element needs at least one interaction" |

**Tooltips (on hover):**
- **The System:** "We don't name it yet because naming narrows your solution space"
- **Actor:** "Anyone or anything that directly interacts with your system"
- **Boundary (dashed line):** "Inside = what you control. Outside = what you don't"
- **Interaction lines:** "What flows TO and FROM your system"

**Validation Errors:**
```
⚠️ "Weather" has no interactions defined

Why this matters: Every external element affects your system somehow.
Ask: What does Weather do TO your system? What does your system
do about Weather?
```

**On Complete:**
```
✅ Context Diagram Complete

You've mapped your system's world. Most projects skip this and
pay for it later with scope creep and integration surprises.

Value created: Clear boundary of what you're building vs integrating.
```

---

#### Step 1.2: Use Case Diagram

**On Entry:**
```
Now let's think in scenarios, not features.

"Shopping cart" is a feature. "Customer adds item while comparing
prices" is a use case. Use cases capture the real-world situations
where your system is needed.
```

**Thinking States:**
| Processing | Message |
|------------|---------|
| Analyzing context | "Looking at your actors to find use case scenarios..." |
| Generating use cases | "💡 Each use case answers: What goal does this actor achieve?" |
| Adding relationships | "💡 <<includes>> = required. <<extends>> = optional variation" |
| Prioritizing | "Ranking use cases by: stakeholder need, risk, frequency, complexity" |

**Tooltips:**
- **<<includes>>:** "This use case REQUIRES the sub-action to complete"
- **<<extends>>:** "This is an OPTIONAL variation that MAY happen"
- **<<trigger>>:** "Completing this use case automatically starts another"
- **Priority (H/M/L):** "High = core need, high risk, or very frequent"

**On Complete:**
```
✅ Use Case Model Complete

You've captured all the scenarios your system must handle. This
prevents expensive "if only we'd known earlier" surprises.

Next: We'll walk through each high-priority use case step by step.
```

---

#### Step 1.3: Scope Tree

**On Entry:**
```
Time to define exactly what needs to be delivered.

We'll break down your end deliverable into smaller pieces, then
smaller pieces again, until we reach atomic tasks. If it's not
on this tree, it's not in scope.
```

**Thinking States:**
| Processing | Message |
|------------|---------|
| Analyzing scope | "Identifying major deliverables from your use cases..." |
| Breaking down | "💡 Keep asking: 'What do I need to deliver THIS?'" |
| Identifying gaps | "Looking for questions that need answers, data that needs gathering..." |
| Adding criteria | "💡 How will you measure success for each deliverable?" |

**Tooltips:**
- **Deliverable (white):** "A work product that will be delivered"
- **Data needed (green):** "Information that must be gathered"
- **Performance criteria (yellow):** "How you'll measure success"
- **Question (?):** "An unknown that needs answering before proceeding"
- **Out of scope (dashed):** "Cut from current phase — but saved for later"

**On Complete:**
```
✅ Scope Tree Complete

You've defined the full scope of work. Stakeholders can't say
"we assumed you'd also do X" — it's either on the tree or it's not.

Value created: Foundation for timelines, resource planning, and clear expectations.
```

---

### Phase 2: Build Requirements

#### Step 2.0: Pre-UCBD Setup

**On Entry:**
```
Now we shift from WHAT the system interacts with to WHAT it must DO.

Key mindset: We'll write "The System SHALL..." statements.
This formal language ensures every requirement is clear, testable,
and non-negotiable.
```

**Thinking States:**
| Processing | Message |
|------------|---------|
| Selecting use cases | "Identifying your highest-priority use cases for detailed analysis..." |
| Preparing UCBD | "💡 We'll walk through each scenario step by step, like a movie script" |

---

#### Step 2.1: UCBD (Use Case Behavioral Diagram)

**On Entry:**
```
Let's walk through "[Use Case Name]" frame by frame.

We'll document exactly what happens: what the user does, what
the system does in response. This reveals the requirements
hiding in the gaps.
```

**Thinking States:**
| Processing | Message |
|------------|---------|
| Analyzing flow | "Breaking down the use case into sequential steps..." |
| Extracting requirements | "💡 The Delving Technique: 'If it has to do this, what else must it do?'" |
| Adding conditions | "💡 Every UCBD needs a precondition (what's true before) and postcondition (what's true after)" |
| Validating | "Checking: Could a contractor build exactly this and you'd be happy?" |

**Interactive Prompt (during generation):**
```
🤔 Delving deeper...

The system needs to "validate user input".
If it has to do this, what else must it do?

• Store validation rules?
• Display error messages?
• Log validation attempts?

[Let AI expand] [Provide specifics]
```

**Tooltips:**
- **Precondition:** "What must be true BEFORE this use case begins"
- **Postcondition:** "What is true AFTER this use case completes successfully"
- **Shall statement:** "'Shall' means non-negotiable. 'Should' = nice-to-have. 'Will' = ambiguous."
- **Swimlane:** "Each column represents who is responsible for that action"

**Validation Errors:**
```
⚠️ System action is missing "shall" language

Why this matters: "Shall" is the professional standard that makes
requirements clear and testable.

"The system validates input" → ambiguous
"The system SHALL validate input" → requirement ✓
```

**On Complete:**
```
✅ UCBD Complete for "[Use Case Name]"

You've discovered requirements that would have been expensive
surprises during development. The delving technique revealed
[X] functions hiding in this single use case.
```

---

#### Step 2.2: Requirements Table & Constants

**On Entry:**
```
Time to formalize everything into a professional requirements
specification.

Each requirement will have a unique ID, clear "shall" language,
and be testable. This is what enterprise teams build from.
```

**Thinking States:**
| Processing | Message |
|------------|---------|
| Extracting | "Pulling 'shall' statements from all UCBDs..." |
| Deduplicating | "Combining similar requirements, ensuring no conflicts..." |
| Adding constants | "💡 Constants like MAX_RESPONSE_TIME let you decide specifics later" |
| Quality check | "Applying the 10 properties of good requirements..." |

**Educational Insert (during long processing):**
```
💡 The 10 Properties of Good Requirements:

1. Written as SHALL statements
2. Correct (accurate)
3. Clear (one idea only)
4. Unambiguous (one interpretation)
5. Objective (non-opinionated)
6. Verifiable (can be tested)
7. Consistent (no contradictions)
8. Implementation independent
9. Achievable (feasible)
10. Conforming (meets regulations)
```

**Validation Errors:**
```
⚠️ Requirement OR.7 contains "and" — consider splitting

Why this matters: "The system shall validate input AND store it"
is actually TWO requirements. If either fails testing, which failed?

Split into:
• "The System shall validate input"
• "The System shall store validated input"
```

**Constants Education:**
```
💡 Requirement Constant Detected

"The system shall respond within MAX_RESPONSE_TIME"

We use constants when you don't know the exact value yet.
Later, you'll define: MAX_RESPONSE_TIME = 200ms

This lets you write requirements now and decide specifics
based on testing, benchmarks, or stakeholder input.
```

**On Complete:**
```
✅ Requirements Specification Complete

You've created [X] formal requirements that define what ANY valid
solution must do. This is what enterprise projects pay consultants
$50K+ to create.

Studies show 50% of project defects trace back to requirements.
You've eliminated that risk.
```

---

#### Step 2.3: SysML Activity Diagram

**On Entry:**
```
Final step: Creating a visual workflow diagram using standard
SysML notation.

This pairs with your requirements table — every system action
in the diagram links to a formal requirement.
```

**Thinking States:**
| Processing | Message |
|------------|---------|
| Converting UCBD | "Transforming UCBD steps into SysML activity notation..." |
| Adding control flow | "Identifying decision points and parallel actions..." |
| Linking requirements | "Connecting each system action to its requirement ID..." |

**On Complete:**
```
✅ PRD Package Complete

Your deliverables:
• Context Diagram — System interactions
• Use Case Model — Scenarios covered
• UCBDs — Step-by-step behaviors
• Requirements Table — [X] formal requirements
• Constants Table — [Y] defined thresholds
• Activity Diagram — Visual workflow

This is a professional-grade PRD that any team can implement from.
```

---

## UI Component Specifications

### 1. ThinkingState Component

```tsx
interface ThinkingStateProps {
  step: StepId;
  processingState: ProcessingState;
  progress?: number; // 0-100 for longer operations
}

// Rotates through relevant educational snippets
// Shows progress bar for longer operations
// Displays context-appropriate tips
```

**Design:**
```
┌─────────────────────────────────────────────┐
│ 🔍 Extracting functional requirements...     │
│                                              │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━ 45%              │
│                                              │
│ 💡 The Delving Technique in action:         │
│    "If the system has to do THIS,           │
│     what else must it do?"                  │
│                                              │
│    This reveals requirements that would      │
│    otherwise surface as expensive surprises. │
└─────────────────────────────────────────────┘
```

### 2. Tooltip Component

```tsx
interface EducationalTooltipProps {
  term: string;
  definition: string;  // 15-20 words max
  learnMoreLink?: string;
}

// Triggers on hover over highlighted terms
// Brief, non-intrusive
// Optional "Learn more" link
```

### 3. StepIntro Component

```tsx
interface StepIntroProps {
  step: StepId;
  title: string;
  context: string;      // 40-60 words
  proTip?: string;      // Optional additional insight
  dismissable: boolean;
}

// Shows once when entering a new step
// Can be dismissed but accessible via "?" icon
```

### 4. ValidationFeedback Component

```tsx
interface ValidationFeedbackProps {
  errorType: ValidationErrorType;
  message: string;
  whyItMatters: string;
  howToFix: string;
  example?: {
    wrong: string;
    right: string;
  };
}

// Combines error message with education
// Shows WHY not just WHAT
```

### 5. CompletionCelebration Component

```tsx
interface CompletionCelebrationProps {
  step: StepId;
  valueCreated: string;
  stats?: {
    label: string;
    value: string | number;
  }[];
  nextStep?: string;
}

// Brief celebration with value reinforcement
// Shows what was accomplished
// Previews next step
```

---

## Content Rotation Strategy

For thinking states longer than 5 seconds, rotate through multiple snippets:

```typescript
const thinkingSnippets = {
  'context_diagram': [
    {
      headline: "Identifying actors...",
      tip: "Actors are anyone/anything that directly interacts with your system",
      duration: 4000
    },
    {
      headline: "Mapping interactions...",
      tip: "Each line shows what flows TO and FROM your system",
      duration: 4000
    },
    {
      headline: "Checking boundaries...",
      tip: "Inside the boundary = what you control. Outside = what you don't",
      duration: 4000
    }
  ],
  // ... more steps
};
```

---

## Tone & Style Guidelines

### DO:
- Use conversational language ("Let's", "We'll", "You've")
- Be encouraging, not intimidating
- Give practical examples over theory
- Keep sentences short and active
- Focus on "you" not "the user"

### DON'T:
- Use academic jargon without explanation
- Be condescending ("Obviously...", "Simply...")
- Overwhelm with too much at once
- Interrupt critical user flows
- Repeat the same tip twice in a session

---

## Metrics to Track

1. **Engagement:**
   - Tooltip hover rate
   - "Learn more" click rate
   - Time spent reading thinking messages

2. **Comprehension:**
   - Validation error repeat rate (should decrease)
   - Requirement quality scores over time
   - User questions in chat about concepts

3. **Satisfaction:**
   - "Was this helpful?" micro-feedback
   - NPS correlation with educational exposure

---

## Implementation Phases

### Phase A: Thinking States (Highest Impact)
1. Create ThinkingState component
2. Build knowledge bank JSON
3. Integrate with existing processing flows
4. A/B test educational vs. simple loading

### Phase B: Tooltips & Validation
1. Identify all terms requiring tooltips
2. Create Tooltip component with consistent styling
3. Enhance validation errors with "why" explanations
4. Add example corrections

### Phase C: Intros & Celebrations
1. Create StepIntro component
2. Create CompletionCelebration component
3. Add dismissal memory (don't re-show)
4. Track completion milestones

### Phase D: Content Refinement
1. Analyze engagement metrics
2. Iterate on copy based on user feedback
3. Add more examples and edge cases
4. Create glossary/reference section

---

*Created: 2025-01-25*
*For: Phase 12 - Project Explorer UI*
