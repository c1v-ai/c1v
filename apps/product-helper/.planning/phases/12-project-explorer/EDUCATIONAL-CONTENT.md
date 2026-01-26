# Educational Content Framework

**Purpose:** Short snippets to teach users requirements engineering methodology while they build their PRD.
**Usage:** Tooltips, chat intros, empty states, validation feedback, progress celebrations.

---

## 1. DISCOVERY PHASE

### Concept: The System (No Name Yet)

**Tooltip (15 words):**
> Don't name your solution yet. Call it "The System" to stay open to possibilities.

**Chat Intro (40 words):**
> Here's a pro tip: We won't name your solution yet. Professional designers call it "The System" early on. Why? Naming it "mobile app" or "website" too early limits your thinking. Let's focus on what it needs to DO first.

**Why It Matters (25 words):**
> Premature naming leads to premature decisions. By staying abstract, you discover requirements you'd miss if you jumped to a solution.

---

### Concept: Stakeholders

**Tooltip:**
> Stakeholders = anyone affected by or who can affect your system. Think beyond users.

**Chat Intro:**
> Let's identify your stakeholders. These aren't just users—they're anyone who affects or is affected by your system. Think: regulators, support staff, competitors, even the environment.

**Examples:**
> For a food delivery app: Customers, restaurants, drivers, payment processors, city regulators, support agents, and even weather services.

**Prompt Question:**
> "Who would complain if your system didn't exist? Who would complain if it worked poorly?"

---

### Concept: Actors vs Stakeholders

**Tooltip:**
> Actors directly interact with your system. Stakeholders may just be affected by it.

**Chat Intro:**
> Quick distinction: An **actor** physically interacts with your system (clicks, sends data, receives output). A **stakeholder** cares about the outcome but may never touch it. Your CEO is a stakeholder. Your user is an actor.

---

### Concept: Context Diagram

**Tooltip:**
> A context diagram shows your system as a box with everything it interacts with around it.

**Chat Intro:**
> We're building what's called a context diagram. Imagine your system as a box in the center. Around it, we place everything it talks to: users, external systems, data sources. Lines between them show what flows back and forth.

**Why It Matters:**
> This simple diagram prevents scope creep. If it's not on your context diagram, it's not in scope.

---

### Concept: System Boundaries

**Tooltip:**
> Boundaries define what you're building vs. what already exists. Be explicit.

**Chat Intro:**
> Let's draw a line around what you're actually building. That payment processor? You're not building that—you're integrating with it. Being clear about boundaries saves months of confusion.

**Prompt Question:**
> "What will you BUILD vs. what will you INTEGRATE with?"

---

## 2. REQUIREMENTS PHASE

### Concept: Use Cases

**Tooltip:**
> A use case is a situation where your system is used. Think scenarios, not features.

**Chat Intro:**
> Forget features for a moment. Let's think in **use cases**—specific situations where someone uses your system to accomplish something. "User logs in" is a use case. "Authentication system" is a feature. Use cases tell the real story.

**Examples:**
> - "Shopping cart" (feature)
> - "Customer adds item to cart while comparing prices" (use case)

---

### Concept: Prioritizing Use Cases

**Tooltip:**
> High priority = addresses core needs, high risk, or happens frequently.

**Chat Intro:**
> Not all use cases are equal. We'll rate them High/Medium/Low based on:
> - Does it address a primary stakeholder need?
> - Is it high-risk if it fails?
> - Does it happen frequently?
> - Is it complex?

**Why It Matters:**
> You can't design for everything at once. Prioritization focuses your energy where it matters most.

---

### Concept: Starting & Ending Conditions

**Tooltip:**
> Every use case starts somewhere and ends somewhere. Define both clearly.

**Chat Intro:**
> For each use case, we need to know: What's true when it starts? What's true when it ends? This sounds simple but prevents huge misunderstandings. "User is logged in" vs "User may or may not be logged in" changes everything.

**Prompt Question:**
> "What must be true BEFORE this use case begins? What's true AFTER it succeeds?"

---

### Concept: The Delving Technique

**Tooltip:**
> Ask "If it does this, what else must it do?" to discover hidden requirements.

**Chat Intro:**
> Here's the most powerful question in requirements engineering: **"If the system has to do this, what else must it do?"**

> If it sends emails, it must store email addresses. If it stores email addresses, it must handle unsubscribes. Keep pulling the thread.

**Example:**
> "The system fires the projectile" → Must hold it first → Must be triggered → Must aim → Must handle misfires...

---

### Concept: UCBD (Step-by-Step Breakdown)

**Tooltip:**
> Walk through your use case step-by-step. What does each actor do? What does the system do?

**Chat Intro:**
> Let's walk through this use case like a movie script. Frame by frame:
> 1. What does the user do?
> 2. What does the system do in response?
> 3. What happens next?
>
> This reveals the requirements hiding in the gaps.

---

## 3. TECHNICAL PHASE

### Concept: Functional vs Structural

**Tooltip:**
> Functional = WHAT it does. Structural = HOW it's built. Focus on functional first.

**Chat Intro:**
> There's a crucial difference:
> - **Structural:** "Use a PostgreSQL database" (HOW)
> - **Functional:** "The system shall store user data persistently" (WHAT)
>
> Functional requirements keep your options open. You can decide PostgreSQL vs MongoDB later.

**Why It Matters:**
> Structural requirements lock you into solutions before you understand the problem. Stay functional as long as possible.

---

### Concept: Shall Statements

**Tooltip:**
> Professional requirements use "shall" — it's clear, testable, and unambiguous.

**Chat Intro:**
> In professional requirements, we write "shall" statements:
> - "The app will be fast" (vague)
> - "The system shall respond to user queries within 200ms" (precise)
>
> "Shall" means non-negotiable. "Should" means nice-to-have. "Will" is ambiguous.

**Quick Reference:**
> **Template:** "The system shall [action] [object] [constraint]"
> **Example:** "The system shall display search results within 2 seconds"

---

### Concept: One Requirement, One Idea

**Tooltip:**
> If your requirement has "and" in it, split it into two requirements.

**Chat Intro:**
> Here's a common mistake:
> - "The system shall validate user input AND store it in the database"
>
> That's two requirements pretending to be one. Split them:
> - "The system shall validate user input"
> - "The system shall store validated input"

---

### Concept: Verifiable Requirements

**Tooltip:**
> If you can't test it, it's not a requirement—it's a wish.

**Chat Intro:**
> Every requirement needs a way to prove it's met:
> - "The system shall be user-friendly" (How do you test this?)
> - "Users shall complete checkout in under 3 clicks" (Testable!)

**Prompt Question:**
> "How would you prove to a skeptic that this requirement is met?"

---

### Concept: Requirement Constants

**Tooltip:**
> Use named constants (like MaxResponseTime) when you don't know the exact value yet.

**Chat Intro:**
> Don't know the exact threshold yet? Use a constant:
> - "The system shall respond within **MaxResponseTime**"
>
> Later, define MaxResponseTime = 200ms. This lets you write requirements now and decide specifics later.

---

### Concept: Performance Criteria

**Tooltip:**
> It's not just WHAT it does, but HOW WELL. Define measurable success criteria.

**Chat Intro:**
> Two systems might both "send notifications." But one sends them in 100ms, the other in 10 seconds. Performance criteria capture the difference:
> - Speed (how fast?)
> - Accuracy (how correct?)
> - Capacity (how much?)
> - Reliability (how often does it work?)

---

## 4. VALIDATION PHASE

### Concept: The Contractor Test

**Tooltip:**
> Would a contractor build exactly what you need from these requirements alone?

**Chat Intro:**
> Here's the ultimate test: If you handed these requirements to a contractor who'd never met you, and they built exactly what's written—would you be happy? If not, something's missing.

**Prompt Question:**
> "What could a contractor misunderstand or miss based on what we've written?"

---

### Concept: Requirement Quality Checklist

**Tooltip:**
> Good requirements are: correct, clear, unambiguous, verifiable, and consistent.

**Chat Intro:**
> Let's check each requirement against the quality criteria:
> - **Correct** — Is this actually true?
> - **Clear** — One idea only?
> - **Unambiguous** — Only one interpretation?
> - **Verifiable** — Can we test it?
> - **Consistent** — No contradictions?

---

### Concept: Iteration is Normal

**Tooltip:**
> Even experts don't get it right the first time. Expect to revise and that's okay.

**Chat Intro:**
> Here's a secret: Even the best requirements engineers revise their work 3-5 times. Your first pass will be high-level and incomplete—that's normal. Each iteration adds depth and catches gaps.

---

## 5. MOTIVATIONAL / VALUE SNIPPETS

### Why Requirements Matter

**Stat:**
> Studies show 50% of project defects trace back to poor requirements. Fix them here, not in code.

**Cost Comparison:**
> Fixing a requirement error costs $1. Fixing it in design costs $10. In code? $100. In production? $1000+.

---

### The Value You're Creating

**After Discovery:**
> You now have a clear picture of WHO uses your system and WHAT it connects to. Most projects skip this and pay for it later.

**After Requirements:**
> You've defined WHAT your system must do in concrete terms. Developers can now estimate accurately and build confidently.

**After Technical:**
> You have professional-grade requirements that any team could implement. This is what enterprise projects pay consultants $50K+ to create.

**After Validation:**
> Your requirements are tested for quality. You've eliminated ambiguity that causes 80% of project miscommunication.

---

## Usage Patterns

| Location | Snippet Type | Length |
|----------|--------------|--------|
| Tooltips | Concept definition | 15-20 words |
| Chat intro | Teaching moment | 40-60 words |
| Empty state | Why + CTA | 30-40 words |
| Progress celebration | Value created | 20-30 words |
| Validation feedback | What to fix + why | 25-35 words |
| Section header | Context setter | 15-25 words |

---

## Implementation Notes

### Where to Surface Education

1. **Chat Messages** - AI explains concepts as it asks questions
2. **Tooltips** - Hover on terms like "actor", "use case", "shall statement"
3. **Empty States** - Guide users to understand what goes in each section
4. **Progress Bar** - Show which methodology stage they're in
5. **Validation Errors** - Explain WHY something needs fixing, not just what
6. **Celebrations** - Reinforce value when completing stages

### Tone Guidelines

- Conversational, not academic
- Encouraging, not intimidating
- Practical examples over theory
- Short sentences, active voice
- "You" focused, not "the user"

---

*Created: 2025-01-25*
*For: Phase 12 - Project Explorer UI*
