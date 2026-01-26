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

## THE 8 BOXES CHALLENGE

**Goal:** Identify at least 8 (ideally 12-20) external elements before moving on.

**The Key Question:** What is affected by your system, or affects your system?

**Approach:** Collaborative — PH makes educated guesses, user validates and fills gaps.

---

### THE COLLABORATIVE FLOW

**Step 1: PH makes educated guesses based on project description**

```
PH: Based on what you've described, here's what I think your system
interacts with. Tell me what I got wrong or missed:

EXTERNAL SYSTEMS:
✓ OAuth providers (Google, GitHub?) — for login
✓ Email service — for notifications
✓ Browsers (Chrome, Safari, Firefox)
? Payment processor — do you have paid plans?
? File storage — can users upload attachments?

STAKEHOLDERS:
✓ Team members (viewers)
✓ Team admins (managers)
? Account owner / billing admin?
? Support staff?

What did I miss? What did I get wrong?
```

**Legend:**
- ✓ = PH is confident this applies
- ? = PH is uncertain, asking user to confirm

**Step 2: User validates and corrects**

User might say:
- "Yes to payments, we use Stripe"
- "No file uploads for now"
- "Add: we also integrate with Slack for notifications"
- "Remove: no support staff, it's self-serve"

**Step 3: PH probes specific gaps**

After user responds, PH checks for common gaps:

```
PH: A few things I want to make sure we haven't missed:

🔒 COMPLIANCE — Do you handle any sensitive data?
   (If EU users → GDPR, health data → HIPAA, payments → PCI-DSS)

⚡ BAD ACTORS — What happens if someone tries to abuse your system?
   (Spammers, fake accounts, payment fraud, scrapers)

📱 PLATFORMS — Any mobile app plans? Or web-only for now?

🌍 INTERNATIONAL — Will you have users in different countries/timezones?
```

User answers only the relevant ones. PH doesn't force all questions.

---

### PH INFERENCE RULES

**How PH makes initial guesses based on keywords:**

| User mentions | PH infers |
|---------------|-----------|
| "SaaS", "subscription", "plans" | Stripe/payments, billing admin role |
| "teams", "collaboration" | Admin vs member roles, invitations |
| "login", "accounts" | OAuth providers, password reset flows |
| "notifications", "alerts" | Email service (SendGrid, etc.) |
| "upload", "files", "attachments" | Cloud storage (S3, etc.) |
| "API", "developers", "integrations" | API consumers as stakeholder |
| "mobile app" | iOS, Android, App Store policies |
| "enterprise", "B2B" | SSO/SAML, SOC 2, admin controls |
| "health", "medical" | HIPAA compliance |
| "payments", "checkout" | PCI-DSS, payment fraud |
| "EU", "Europe", "international" | GDPR, timezone handling |

---

### GAP-PROBING QUESTIONS

**Only ask if not already covered:**

| Gap | Probe |
|-----|-------|
| No auth mentioned | "How do users log in? Email/password? Google? Magic links?" |
| No compliance | "Do you handle sensitive data that might have regulations?" |
| No bad actors | "What if someone tries to spam signups or abuse the system?" |
| Only one user type | "Are there different permission levels? Admins vs regular users?" |
| No failure modes | "What happens if Stripe goes down? Or email delivery fails?" |
| No mobile | "Web-only for now, or mobile apps planned?" |

---

### CHECKPOINT

```
PH: 📊 Here's your context diagram so far: {TOTAL} external elements.

External Systems: {list}
Stakeholders: {list}

{IF < 8}
We're at {TOTAL} — professional diagrams typically have 8-20.
Let me ask a few more questions to make sure we haven't missed anything...

{IF >= 8}
Looking good! This gives us a solid foundation.
Ready to move on, or want to add anything else?
```

---

### MISTAKE CATCHERS

**If user adds a property instead of an actor:**

```
// User adds: "security", "performance", "reliability"

PH: "{input}" is a quality you WANT, not something that interacts
with your system.

What external thing CAUSES you to need {input}?
• "Security" → Hackers, bots, fraudsters
• "Performance" → High traffic, large uploads
• "Reliability" → API outages, network failures
```

**If user adds an internal component:**

```
// User adds: "database", "API server", "cache"

PH: That's INSIDE your system — something you'll build.

The context diagram shows what you DON'T control.
Your database is yours to design. But a managed database
service like Supabase or RDS? That goes outside.
```

---

## INTERACTION DETAILS FLOW

After brainstorming the 8+ boxes, define the interactions:

```
PH: Now let's detail the interactions for {element}.

Near the external box, write what IT does TO your system:
- What data does it send?
- What requests does it make?
- What events does it trigger?

Near the system box, write what your system does FOR it:
- What responses does it return?
- What services does it provide?
- What data does it produce?
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

### SaaS Application Example

**External Elements Identified (16):**

```
Users (6):
• Free trial user
• Paid subscriber
• Team admin
• Team member (viewer role)
• API consumer (developer)
• Support agent (internal)

Integrations (5):
• OAuth providers (Google, GitHub)
• Stripe (payments)
• SendGrid (transactional email)
• Intercom (support chat widget)
• Mixpanel (analytics)

Platforms (2):
• Modern browsers (Chrome, Safari, Firefox)
• Mobile browsers (responsive web)

Threats & Failures (4):
• Bot signups (spam prevention)
• Payment fraud (chargebacks)
• API rate limits (Stripe, SendGrid quotas)
• Account takeover attempts

Constraints (2):
• GDPR (EU users → data deletion, consent)
• SOC 2 (enterprise customers require it)
```

**Key Insight — User Variants Matter:**
```
The user initially said "users."

Delving revealed 6 distinct types:
- Free trial vs paid (different feature access)
- Admin vs member (different permissions)
- API consumer (headless, needs docs)
- Support agent (needs internal tools)

Each variant = different requirements!
```

### API/Backend Service Example

**External Elements Identified (14):**

```
Users (3):
• API consumer (developer integrating)
• DevOps engineer (monitoring, deployment)
• On-call engineer (incident response)

Integrations (6):
• Client applications (web, mobile, CLI)
• Webhook receivers (customer systems)
• Upstream APIs (data providers)
• Managed database (Postgres)
• Cache layer (Redis)
• Message queue (RabbitMQ/SQS)

Platforms (2):
• Container orchestrator (K8s, ECS)
• Load balancer (ALB, nginx)

Threats & Failures (4):
• DDoS attacks
• Malformed/malicious requests
• Upstream API outages
• Database connection exhaustion

Constraints (2):
• Rate limiting (protect downstream)
• SLA commitments (99.9% uptime contract)
```

### Vehicle Example (Physical System)

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

**Software equivalent:** Instead of listing every invalid input, test with:
- **Empty string** (boundary case)
- **10MB of garbage** (size + invalid content)

If you handle those, you handle most input validation edge cases.

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
- **Pick 8 most critical boxes** for the diagram (can add more later)
- Consolidate variants if needed (just "PASSENGER" not all subtypes)

### Line Rules
- **Rectilinear lines ONLY** (90° angles, no curves, no diagonals)
- One line per connection
- Multiple interactions on same line, separated by **commas** (not semicolons, dashes, slashes)
- No crossing lines — rearrange boxes to avoid
- No "jump" symbols (those little arc symbols have no place here)

**Why rectilinear?**
```
Curved lines are considered unprofessional in systems engineering.
It's not aesthetic — it's about precision.

Rectilinear lines clearly show which elements connect
without ambiguity about crossings.
```

### Interaction Label Placement

**Critical: Labels indicate DIRECTION of interaction**

```
┌─────────────┐                          ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
│             │      affects visibility       ┌───────────┐
│   WEATHER   │──────────────────────────│    │    THE    │  │
│             │      drives through           │   SYSTEM  │
└─────────────┘◄─────────────────────────│    └───────────┘  │
                                          └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```

- **Near external box:** what IT does TO the system (lowercase)
- **Near system box:** what system does FOR it (lowercase, can be inside dashed boundary)
- This reads as: "Your system drives through weather" ✓
- NOT: "Weather drives through system" ✗

### Long Labels
- If text is too long, use capital letters in circles (A, B, C) as references
- Place reference definitions together at bottom of diagram
- Check with recipient if this format is acceptable

### Outside-to-Outside Connections
- Use **very sparingly**
- Only include if that interaction strongly affects YOUR system's design
- Example: "weather affects visibility of passengers" — relevant because system might need to overcome this
- Most connections should be between external boxes and THE SYSTEM

### System Boundary
- Dashed line around "The System" box
- EVERYTHING inside = what you control
- EVERYTHING outside = what you don't control
- **NEVER split the system into subsystems** — this is grounds for immediate rejection
- Splitting forces subsystems to exist, preventing better solutions later

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
