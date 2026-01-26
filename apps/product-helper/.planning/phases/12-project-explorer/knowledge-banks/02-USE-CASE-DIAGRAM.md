# Knowledge Bank: Use Case Diagram (Stakeholder Management)

**Step:** 1.2 - Use Case Diagram
**Purpose:** Identify all the ways your system will be used, capturing the set of functionalities it must have to meet the challenge you are addressing
**Core Questions:**
- "In what situations will your system be used?" (scenario perspective)
- "What functions must your system perform?" (functional perspective)

---

## WHY THIS STEP MATTERS

Use cases define the **scope of your system** by capturing every scenario it must handle. They prevent the expensive "if only we'd known earlier" problem:
- Captures ALL scenarios, not just the happy path
- Reveals edge cases before they become bugs
- Enables accurate prioritization
- Creates shared understanding across the team
- Connects your system back to the challenge it was built to solve

**Key Mindset Shift:**
```
❌ Feature thinking: "Shopping cart"
✅ Scenario thinking: "Customer adds item while comparing prices"

Features are structural (HOW). Use cases are functional (WHAT).
```

---

## WHAT IS A USE CASE?

A **use case** is a situation or scenario in which your system will be used.

**Format:** `[Actor] [verb]s the system`

**Examples:**
- "Driver drives the system"
- "Customer completes checkout"
- "Admin reviews flagged content"
- "System monitors for anomalies" (no external actor)

**What makes a good use case:**
- Short name with a single action/verb
- Captures a complete scenario from start to end
- Has clear starting and ending conditions
- Would reveal unique requirements if explored

---

## THE COLLABORATIVE FLOW (5 Passes + Supplementary Sources + Refinement)

**Approach:** Build use cases iteratively — actions first, then actors, then variants — then refine for depth.

**Prerequisites:**
- Context diagram must be **drawn** (Step 1.1) — the interaction labels on your diagram become the starting use cases

**Targets:**
- 20-30 use cases total (minimum: one per context diagram box = 8)
- At least half from the same actor — this ensures depth, not just breadth. 30 use cases across 15 actors (2 each) means you haven't gone deep enough on any single actor.

**Feedback loop:** As you develop use cases, you will discover new interactions and external elements that belong on the context diagram. This is expected — update the context diagram as you go. The iterative process makes both deliverables better.

---

### PASS 1: BRAINSTORM ACTIONS (No Actors Yet)

PH generates scenarios from two sources — the **context diagram** (especially its interaction labels) and the **problem statement** — just the WHAT, not WHO. The interaction labels on your context diagram connections (e.g., "drives the system," "fuels the system") are your first use case candidates:

```
PH: Based on your context diagram and the challenge you're solving,
here are scenarios where your system will be used.
Let's focus on WHAT happens first — we'll add WHO later.

Tell me what I got wrong or missed:

From your problem statement:
✓ [action that directly addresses the core challenge]
✓ [action that addresses a secondary need]
? [action implied by the problem but not explicit]

From your integrations:
✓ Processing a payment
✓ Handling failed payment
✓ Processing a refund
✓ Sending notification email
✓ Authenticating via OAuth
? Receiving webhook events

From general usage:
✓ Signing up
✓ Logging in
✓ Resetting password
✓ Updating profile
✓ Inviting team member
? Exporting data
? Deleting account

What did I miss? What did I get wrong?
```

**Legend:**
- ✓ = PH is confident this applies
- ? = PH is uncertain, asking user to confirm

User validates → just the actions, not who does them yet.

At this point you have **use case ideas** — actions without actors. Pass 2 turns them into **official use cases** by adding the actor (the main stimulus driving the action).

---

### PASS 2: ADD ACTORS (Make Use Cases Official)

Adding an actor to an action makes it an official use case. PH also builds a **standalone actor list** — a separate inventory of all actors, including undesired ones that will be explored in later passes.

```
PH: Now let's add WHO does each action.
Adding an actor makes these official use cases.

Looking at your stakeholders from the context diagram:
- End User
- Team Admin
- API Consumer
- System (internal/automated)

Here's my guess at who does what:

ACTION                      → ACTOR
Processing a payment        → End User
Handling failed payment     → System (webhook)
Signing up                  → End User
Logging in                  → End User, API Consumer
Inviting team member        → Team Admin
Viewing analytics           → Team Admin
Exporting data              → End User? Admin? Both?
Sending notifications       → System (automated)

Who does what? Any corrections?

Also — here's my draft ACTOR LIST for your system:

DESIRED ACTORS:
- End User (general)
- Team Admin
- API Consumer
- System (automated/internal)

UNDESIRED ACTORS:
? Hacker / malicious user
? Spammer / bot
? Fraudster

ACTOR VARIANTS (to explore in Pass 3):
? New user vs experienced user
? Free vs paid user
? User with accessibility needs

Who's missing? Who shouldn't be here?
```

User validates/corrects both the actor assignments and the actor list.

**Key insight: Actors aren't just people**
- Other equipment or subsystems ("Automated assembly line constructs the system")
- Software programs ("Stripe sends webhook")
- Automated processes ("System monitors for anomalies")
- Actor = the **main stimulus** causing the system to have to do something

**Two deliverables from this pass:**
1. Official use cases (actions with actors assigned)
2. A complete actor list (including undesired actors and variants to explore)

---

### PASS 3: ACTOR VARIANTS (Expand Use Cases)

Each actor variant doesn't just "exist" — it forces different **design decisions**. A student driver means the system needs training mode. An elderly driver means the system needs to compensate for reaction time. Each variant changes HOW you design the system.

PH probes whether different actor types need different behavior:

```
PH: Does "User logs in" behave DIFFERENTLY for different user types?

If the system must be DESIGNED DIFFERENTLY to handle this actor, it's a separate use case:

"Logging in" variants:
? Free user logs in → standard flow
? Paid user logs in → same as free? or different?
? Admin logs in → maybe 2FA required?
? API consumer authenticates → token-based, no UI

"Inviting team member" variants:
? Admin invites → full permissions to invite
? Member invites → maybe limited, needs approval?

Only split if the system behavior is DIFFERENT.
Don't split "left-handed user logs in" — system behaves the same.

Which use cases need variants based on WHO is doing them?
```

User identifies which need splitting → new use cases created.

---

### PASS 4: UNDESIRED USE CASES

**Undesired actors and scenarios create the MOST demanding requirements.** We naturally focus on the actors we want — but more often than not, it's the actors we *don't* want that force the hardest design decisions. A "drunk driver drives the system" completely changes the design — the system must now reduce the likelihood and severity of potential negative effects.

```
PH: Now let's think about what you DON'T want to happen —
but must plan for anyway.

⚡ BAD ACTORS:
? Hacker attempts brute force login
? Spammer creates fake accounts
? User tries to access another user's data
? Fraudster disputes legitimate charge

💥 FAILURES:
? Stripe API goes down during checkout
? OAuth provider is unavailable
? Database connection fails
? Email delivery fails

🔄 EDGE CASES:
? Two users edit same item simultaneously
? User's session expires mid-action
? User has slow/unreliable connection

These undesired use cases often create your most demanding requirements.
A system built only for "when everything works" fails when reality shows up.

Which of these apply? What else could go wrong?
```

---

### PASS 5: STAKEHOLDER REQUESTS, INTERNAL & AUTOMATED USE CASES

Context diagrams help determine the majority of your use cases, but there are three additional sources that brainstorming from the diagram alone won't surface:

**Source A: Direct stakeholder requests**

Specific functionality that stakeholders explicitly asked for. These may not emerge from actor analysis — they come from the original problem statement, RFP, or conversations with whoever commissioned the work.

```
PH: Let's check — did anyone explicitly request specific functionality?

Go back to your original problem statement or brief.
Are there specific capabilities someone asked for that we haven't captured?

Format these as:
  "System performs [task]"
  or better: "System performs [task] to meet [criteria]"

Examples from a vehicle:
  "System alerts driver to potential drowsiness"
  "System automatically parallel parks"
  "System completes test course to meet safety certification"

Be careful with vague criteria like "successfully" — define what
success actually means. We'll nail down specific criteria later.

What was explicitly requested?
```

**Source B: Internal system use cases**

Things the system does internally, with no external actor triggering it:

```
PH: What does your system do INTERNALLY — not triggered by
any external actor?

? System converts input data into output format
? System monitors its own health
? System protects against data corruption
? System performs scheduled maintenance tasks
? System caches frequently accessed data

And automated/scheduled tasks:
? System sends reminder emails (scheduled)
? System expires inactive sessions (cleanup)
? System monitors for anomalies (background)
? System syncs data with external service (periodic)
? System generates reports (scheduled)

Note: Early on, you may not know all internal use cases —
your system is still generic. That's OK. These will emerge
as design progresses. Keep adding them as you discover them.

What does YOUR system do internally or automatically?
```

**Source C: Research validation (recommended)**

```
PH: Would you like me to research similar systems to check
for use cases we might have missed?

I can look at:
- How similar products handle these scenarios
- Industry standards for systems like yours
- Common use cases in your domain that teams often overlook
- Edge cases documented in post-mortems or case studies

This can reveal blind spots that neither brainstorming
nor stakeholder conversations will surface.
```

---

### CHECKPOINT

```
PH: 📊 Here's your use case inventory: {TOTAL} scenarios

Pass 1 - Actions from diagram & problem statement: {N1}
Pass 2 - With Actors (official use cases): {N2}
Pass 3 - Variants Added: {N3}
Pass 4 - Undesired Cases: {N4}
Pass 5 - Stakeholder requests: {N5a}
         Internal/automated: {N5b}
         From research: {N5c}

{IF < 20}
We're at {TOTAL} — professional use case models typically have 20-30.
Let me probe a few more areas...

{IF >= 20}
Great coverage! Now let's refine — some of these may be
too high-level or have special conditions we haven't captured.
```

---

### PASS 6: REFINEMENT (Review for Depth)

After brainstorming, go back through the list and refine. Two things to look for:

1. **Use cases that are too high-level** — They actually contain several different tasks. These need <<includes>> sub-use cases pulled out.
2. **Use cases with special conditions** — Realistic variants where the system must behave differently. These become <<extends>>.

```
PH: Let's refine your list. I'm going to walk through your use cases
and flag ones that might need breaking down or expanding.

🔍 TOO HIGH-LEVEL? (needs <<includes>>)
These use cases seem to contain multiple distinct tasks:

? "{use_case_A}" — can you describe this as step-by-step actions
  without it feeling too long? If not, what sub-tasks does it include?

? "{use_case_B}" — this might actually be several use cases.
  What distinct actions are inside it?

🔍 SPECIAL CONDITIONS? (needs <<extends>>)
Are there realistic situations where these behave differently?

? "{use_case_C}" — any environmental or user conditions
  that would change how this works?

? "{use_case_D}" — does this play out differently for
  different types of users or contexts?
```

**Worked example — the natural refinement flow:**

```
START WITH:
  "Driving the system"

REALIZE it's too high-level (includes several distinct tasks):
  "Driving the system"
    <<includes>> "Parking the system"
    <<includes>> "Stopping at an intersection"
    <<includes>> "Changing lanes"

IDENTIFY SPECIAL VERSIONS (<<generalizes>>):
  "Merging onto the highway" <<generalizes>> "Changing lanes"
  "Exiting the highway" <<generalizes>> "Changing lanes"
  (These inherit all lane-change requirements, plus add their own)

IDENTIFY SPECIAL CONDITIONS (<<extends>>):
  "Driving through snow" <<extends>> "Driving the system"
  (Driving works normally — snow changes the requirements)
```

Each refinement step reveals requirements the high-level use case hid. "Merging onto the highway" inherits everything from "Changing lanes" but adds requirements for matching highway speed, judging gaps in fast traffic, and handling on-ramp geometry.

**PH refinement strategy:**
- Walk through each use case and ask: "Is this actually several things?"
- For each one, ask: "Are there realistic special conditions?"
- Stop refining when the use case passes the four quality tests (boundaries, scope, uniqueness, impact)

---

### PH INFERENCE RULES

**Pass 1 — How PH generates actions from two sources:**

*From the problem statement:*
| Problem Statement Element | PH Infers These Actions |
|--------------------------|-------------------------|
| Core challenge/need | Actions that directly solve the stated problem |
| Secondary needs | Supporting actions implied by the challenge |
| Stakeholder goals | Actions that deliver value to each stakeholder |
| Success criteria | Actions required to meet stated outcomes |

*From the context diagram:*
| Context Diagram Element | PH Infers These Actions |
|------------------------|-------------------------|
| Stripe/Payments | Process payment, handle failure, refund, subscription change |
| OAuth Provider | Authenticate, token refresh, handle unavailable |
| Email Service | Send notification, handle bounce, unsubscribe |
| File Storage | Upload, download, delete, handle quota |
| Webhook Source | Receive webhook, validate, handle duplicate |
| General Users | Sign up, log in, reset password, update profile, delete account |
| Admin Users | Invite, remove, change permissions, view analytics |

**Pass 2 — Actor assignment hints:**

| Action Pattern | Likely Actor |
|---------------|--------------|
| "Processing...", "Handling..." | Could be User OR System — ask |
| "Sending...", "Monitoring..." | Usually System (automated) |
| "Inviting...", "Removing...", "Configuring..." | Usually Admin |
| "Signing up", "Logging in", "Updating profile" | Usually End User |

**Pass 4 — Always probe for undesired cases:**
- Authentication attacks (brute force, credential stuffing)
- Authorization failures (accessing others' data)
- Payment fraud (disputes, chargebacks)
- Data integrity (concurrent edits, corruption)
- External failures (API down, timeouts)
- Resource exhaustion (rate limits, storage full)

---

## USE CASE RELATIONSHIPS

### <<includes>> — Required Sub-Actions

**When to use:** The parent use case CANNOT complete without the child.

```
"Checkout" <<includes>> "Validate Payment"
(Can't checkout without validating payment)

"Login" <<includes>> "Verify Credentials"
(Can't login without verification)
```

**Multi-level decomposition:** Includes can nest. A sub-use case can itself include further sub-use cases. Delve until each use case is specific enough to reveal unique requirements.

```
"Driver drives the system"
  <<includes>> "Change lanes"
  <<includes>> "Stop at intersection"
  <<includes>> "Accelerate"

"Change lanes" has special versions:
  "Merge onto highway" <<generalizes>> "Change lanes"
  "Exit highway" <<generalizes>> "Change lanes"
```

Notice the difference: "Stop at intersection" is **included** — driving always involves stopping. But "Merge onto highway" is a **special version** of "Change lanes" — it inherits all lane-change requirements plus adds its own (matching highway speed, judging gaps in fast traffic, handling on-ramp geometry). You can change lanes without ever merging onto a highway.

**Arrow direction:** Main → Sub (dashed arrow pointing to included use case)

**Label format:** `<<includes>>` — written in lowercase with double angle brackets on either side.

**Reading pattern:** The diagram reads as a sentence: "drives **includes** accelerates and brakes." This is the most common connection type in use case diagrams.

**Critical rule — no direct actor connection to sub-use cases:** Included use cases do NOT get their own line to the actor. The actor's connection is **implied through the hierarchy tree**. The actor connects to the high-level use case, and the high-level use case connects (via <<includes>> arrows) to its sub-use cases. This keeps the diagram clean and correctly represents that the sub-use case is part of the parent, not an independent interaction.

```
✅ CORRECT:
  [Driver] ——— (drives)
                  |
                  |--<<includes>>--→ (accelerates)
                  |--<<includes>>--→ (brakes)

❌ WRONG:
  [Driver] ——— (drives)
  [Driver] ——— (accelerates)    ← NO! Don't connect actor to sub-use cases
  [Driver] ——— (brakes)         ← NO! The connection is implied through "drives"
```

**PH Explanation:**
```
PH: Does "[Use Case]" REQUIRE other actions to complete?

If the main use case literally cannot finish without the sub-action,
that's an <<includes>> relationship.

Example: "Checkout" includes "Validate Payment"
You cannot complete checkout without payment validation.

And those sub-actions can decompose further —
"Validate Payment" might include "Check card expiry" and "Verify CVV."

Important: Sub-use cases do NOT connect directly to the actor.
The actor's relationship is implied through the tree —
"Driver" connects to "drives," and "drives" includes "accelerates."
That's how we know the driver accelerates.

What sub-actions are REQUIRED for [use case]?
Can any of those sub-actions be broken down further?
```

### <<extends>> — Special Condition Variations

**When to use:** The parent use case CAN complete without the child. The child only applies under special conditions.

Extends captures situations that happen only under specific conditions — not always, not as a required step, but when circumstances change. Two main triggers:

- **Different operating conditions:** The environment or context changes (weather, load, time of day)
- **Different user conditions:** The actor's state is unusual (first-time user, expired session, accessibility needs)

```
"Checkout" <<extends>> "Apply Coupon"
(Checkout works fine without a coupon — special condition: user has coupon)

"Login" <<extends>> "Reset Password"
(Login works fine without password reset — special condition: user forgot password)

"Drive the system" <<extends>> "Drive through snow"
(Driving works normally — special condition: winter weather)
```

**Arrow direction:** Sub → Main (dashed arrow pointing to the extended use case). This is the **opposite direction** from <<includes>>:

```
<<includes>>:  Main ──→ Sub     (main points TO its required sub-action)
<<extends>>:   Sub  ──→ Main    (special case points BACK to what it extends)
```

**Label format:** `<<extends>>` — written in lowercase with double angle brackets on either side.

**Reading pattern:** The diagram reads: "starts **is an extension of** drives." Compare with includes: "drives **includes** accelerates." The arrow directions reinforce the relationship — includes flows down from parent to child, extends flows up from special case back to parent.

**Implied actor connection:** Like <<includes>>, extended use cases do NOT connect directly to the actor. The connection is implied through the tree. "Driver" connects to "drives," and "starts" extends "drives" — that's how we know the driver starts the system.

**PH Explanation:**
```
PH: Are there SPECIAL CONDITIONS where "[Use Case]" behaves differently?

If the main use case works fine without the variation,
but under certain conditions something different happens, that's <<extends>>.

Think about:
- Different operating conditions (environment, load, timing)
- Different user conditions (first-time, error state, edge case)

Example: "Drive the system" extends to "Drive through snow"
Normal driving works fine — but snow changes the requirements.

Note: The arrow goes FROM the special case BACK TO the main use case.
This is the opposite direction from <<includes>>.
And like includes, the special case does NOT connect directly
to the actor — the relationship is implied through the tree.

What special conditions exist for [use case]?
```

### <<generalizes>> — Special Versions

**When to use:** A more specific use case inherits from a general one.

```
"Drive semi truck" generalizes "Drive vehicle"
(Semi truck has all vehicle requirements PLUS additional ones)

"Admin manages users" generalizes "User manages profile"
(Admin does everything a user does, plus more)
```

**Arrow direction:** Special → General (solid line with open triangle head pointing to the general use case). No label text is added — the open triangle arrowhead is the identifier.

**Reading patterns** (all equivalent):
- "Drives the Vehicle" is a **generalization** of "Drives the Semi-Truck" and "Drives the Super Spy Car"
- "Drives the Semi-Truck" **inherits from** "Drives the Vehicle"
- "Drives the Vehicle" is the **parent** of "Drives the Semi-Truck"
- "Drives the Semi-Truck" is the **child** of "Drives the Vehicle"

**PH Explanation:**
```
PH: Is "[Use Case]" a special version of a more general use case?

The special version does everything the general one does,
PLUS additional requirements unique to the special case.

Example: "Drive semi truck" generalizes "Drive vehicle"
Semi trucks have all normal driving requirements,
plus special licensing, different turning radius, etc.

This is drawn as a solid line with an open triangle head
pointing from the specific case TO the general case.
No label is added — the triangle arrowhead identifies it.

You can read it as:
  "Semi truck INHERITS FROM vehicle"
  "Vehicle is the PARENT of semi truck"
  "Semi truck is the CHILD of vehicle"

Is this a special version of something more general?
```

### <<trigger>> — Causes Another Use Case

**When to use:** Completing one use case automatically starts another.

**Note:** The trigger connector is **not considered an official UML arrow** by some standards. However, it is widely used in practice because it captures an important relationship — automatic chain reactions between use cases — that the other three connectors don't express.

```
"Detect fire" <<trigger>> "Extinguish fire"
(Detection automatically triggers extinguishing)

"Payment fails" <<trigger>> "Send retry notification"
(Failure automatically triggers notification)
```

**Arrow direction:** Initial → Triggered (dashed arrow with <<trigger>> label)

**PH Explanation:**
```
PH: Does completing "[Use Case]" automatically START another use case?

This isn't includes (required sub-action) or extends (optional).
This is a chain reaction — finishing one kicks off another.

Example: "Detect fire" triggers "Extinguish fire"
The moment fire is detected, extinguishing begins automatically.

What does completing [use case] automatically start?
```

---

## CHOOSING BETWEEN CONNECTION TYPES

Even with clear definitions, you will encounter cases where **multiple connection types seem equally valid**. This is normal — the same relationship can often be argued from different perspectives.

**The "exiting the highway" example:**

Consider the relationship between "exits the highway" and "changes roads":

| Perspective | Connection | Argument |
|-------------|------------|----------|
| "Exiting comprises everything changing roads does, plus more" | <<includes>> | Exiting includes changing roads as a sub-action |
| "Exiting is a special version of changing roads" | <<generalizes>> | Exiting inherits all lane-change requirements plus adds its own |
| "Exiting is a special sub-case of changing roads" | <<extends>> | Exiting happens only under the special condition of being near an exit |

You could make a legitimate argument for all three. **The important thing is that a connection exists** — when you design for one use case, you must consider how it affects the other.

### Guidance for First Pass

```
PH: Not sure which connection type to use? Here's a practical approach:

1. DON'T OVERTHINK IT on your first pass.
   Pick the connection that feels most natural to your team.
   The critical thing is recognizing the RELATIONSHIP exists,
   not perfecting the arrow type.

2. USE THESE AS A QUICK DECISION GUIDE:
   - "Can the parent complete WITHOUT this?" → Yes = <<extends>>, No = <<includes>>
   - "Does this do everything the other does, PLUS more?" → <<generalizes>>
   - "Does completing this automatically START the other?" → <<trigger>>

3. EXPECT TO REVISE.
   As you flesh out your system design and architecture,
   you'll gain clarity on which connection best represents
   the relationship. Come back and update.

4. FOR SOFTWARE PROJECTS specifically:
   Use case diagrams alone are NOT sufficient to determine
   your software architecture. Your connection choices may need
   to change as the architecture emerges. Enter with the mindset
   that these are your BEST CURRENT UNDERSTANDING, not final truth.
```

**Key mindset:** Use case diagrams are iterative. Treating early choices as permanent creates friction — you resist updating when new understanding emerges. Treat them as living documents that improve as your design matures.

**PH Explanation:**
```
PH: I notice you're debating between connection types for "{use_case}."

Multiple connections could work here. Let me lay out the options:

Option A: <<includes>> — "{parent}" requires "{child}" to complete
Option B: <<extends>> — "{child}" is a special condition of "{parent}"
Option C: <<generalizes>> — "{child}" is a special version of "{parent}"

Which feels most natural to you? We can always revisit this
as the design evolves. The important thing right now is
capturing that these use cases are RELATED.
```

---

## QUALITY CHECK: "How Deep Is Deep Enough?"

A common question: "How do I know when my use cases are detailed enough?"

The answer: **you're ready when you're prepared to take the next step** — walking through each use case action-by-action to extract requirements. These four tests tell you if you're there:

```
PH: Let's check if your use cases are ready for the next step.

For each use case, can you answer:

1. BOUNDARIES: Can you clearly state the START and END conditions?
   - What must be true before this begins?
   - What is true when it completes?
   (If you can't → the use case isn't well-defined enough yet)

2. SCOPE: Can you list the step-by-step actions from start to end
   without it feeling too long or running into other use cases?
   (If too long → delve deeper with <<includes>> or <<extends>>)

3. UNIQUENESS: Does this use case capture needs that would
   be MISSED if you didn't consider it?
   (If it doesn't reveal unique requirements → merge or eliminate)

4. IMPACT: Does this use case make a meaningful difference
   to what your system must do?
   (If the system behaves identically → merge with existing)

Don't delve for completeness alone — focus on the use cases
that reveal the biggest differences in what the system must do.
Time is your most valuable commodity.

Let's check "[use case]"...
```

---

## PRIORITIZE BY CRITICALITY

After generating and refining, rank every use case by how critical it is to the system's functionality or performance.

```
PH: Let's rank your use cases by criticality.

For each one, ask: If this use case fails or is missing,
how badly does the system break?

🔴 HIGH — System cannot function without this.
   Core functionality, safety-critical, or security-critical.
   These get built and tested first.

🟡 MEDIUM — System works but with significant gaps.
   Important features, common workflows, key integrations.
   These get built in the main development phase.

🟢 LOW — Nice to have, edge cases, rare scenarios.
   Convenience features, uncommon paths, polish items.
   These can be deferred if needed.

Here's my suggested ranking — tell me what to adjust:

🔴 HIGH:
  - {use_case_1}
  - {use_case_2}
  ...

🟡 MEDIUM:
  - {use_case_3}
  - {use_case_4}
  ...

🟢 LOW:
  - {use_case_5}
  - {use_case_6}
  ...

What should move up or down?
```

**PH ranking heuristics:**

| Pattern | Default Ranking |
|---------|----------------|
| Authentication, authorization | HIGH |
| Core CRUD for primary entity | HIGH |
| Payment processing | HIGH |
| Undesired: security attacks | HIGH |
| Undesired: external failures | MEDIUM-HIGH |
| Admin management features | MEDIUM |
| Automated background tasks | MEDIUM |
| Data export, reporting | MEDIUM-LOW |
| Rare edge cases | LOW |
| Convenience/polish features | LOW |

---

## EVALUATION (PH as Peer Reviewer)

PH evaluates the final list the way a peer engineer would — checking for gaps, depth, and balance.

**Before evaluating, check back with the problem source:**

Engineers naturally get excited about specific aspects of their system and can lose sight of the original problem. Use cases serve as a check — are you still addressing everything the problem statement intended?

```
PH: Before I evaluate, let's check your use cases against
your original problem statement.

Are you still addressing all the problems you originally
intended to solve? It's common to get excited about one area
and under-develop others.

Let's compare:
- Original problem/challenge: {problem_statement}
- Use cases covering this: {matching_use_cases}
- Gaps: {areas_not_covered}

If you could discuss this list with whoever gave you the
original problem (boss, client, RFP source) — that
conversation would be extremely valuable.
```

```
PH: Let me evaluate your use case list as a whole.

📊 COVERAGE:
  Total: {X} use cases
  From primary actor: {Y} ({Y/X}%)
  {IF Y/X < 50%} ⚠️ Less than half are from your primary actor.
  This usually means you haven't gone deep enough on the main
  user's experience. Let's add more for {primary_actor}.

📊 SOURCES:
  From context diagram: {CD}
  From stakeholder requests: {SR}
  Internal/automated: {IA}
  From research: {RES}
  {IF SR == 0} ⚠️ No use cases from direct stakeholder requests.
  Go back to your original problem statement — what was
  explicitly asked for?
  {IF IA == 0} ⚠️ No internal use cases. What does your system
  do behind the scenes without anyone triggering it?

📊 BALANCE:
  High priority: {H}
  Medium priority: {M}
  Low priority: {L}
  {IF H < 5} ⚠️ Few high-priority use cases — are you sure
  the core functionality is fully captured?
  {IF L == 0} ⚠️ No low-priority cases — you may be missing
  edge cases and polish items.

📊 DEPTH CHECK:
  Use cases with <<includes>>: {I}
  Use cases with <<extends>>: {E}
  Use cases with <<generalizes>>: {G}
  {IF I + E + G < 5} ⚠️ Few relationships defined.
  High-level use cases may be hiding sub-use cases.

📊 NEGATIVE SCENARIOS:
  Undesired use cases: {U}
  {IF U < 3} ⚠️ Few undesired cases. What can go wrong?
  Security, failures, and edge cases create your most
  demanding requirements.

📊 RESEARCH VALIDATION:
  {IF no research done}
  💡 Want me to research similar systems to validate your list?
  I can check for use cases that teams in your domain commonly
  miss — blind spots that brainstorming alone won't catch.

{OVERALL ASSESSMENT}
```

---

## REAL EXAMPLES

### Vehicle Use Cases

**High-Level Use Cases:**
```
- Driver drives the system
- Driver fuels the system
- Driver parks the system
- Passenger enters/exits the system
- Maintenance worker services the system
- System monitors weather
```

**Delving "Driver drives the system":**
```
<<includes>>:
- Driver accelerates
- Driver brakes
- Driver steers
- Driver changes lanes
- Driver stops at intersection

<<extends>>:
- Driver drives through snow (special condition)
- Driver drives at night (special condition)
- Driver uses cruise control (optional feature)

<<generalizes>>:
- Student driver drives (special actor)
- Elderly driver drives (special actor)
- Drunk driver drives (undesired actor)
```

**Undesired Use Cases:**
```
- Vehicle survives accident
- Vehicle handles pothole damage
- Thief attempts to steal vehicle
- Driver falls asleep while driving
- System experiences sensor failure
```

### The Copy-Replace Technique

**For actor variants:**

Once you have a use case like "Driver drives the system," you can efficiently create variants:

1. Copy the use case
2. Replace "Driver" with variant
3. BUT ONLY IF the system behaves differently

```
✅ Create variant if:
   "Student driver drives" → system needs training mode

❌ Don't create variant if:
   "Left-handed driver drives" → system behaves the same
```

---

## DRAW THE DIAGRAM

The use case diagram is a **required deliverable** — not just your notes, but a formal visual artifact based on UML/SysML standards. Its purpose is twofold:

1. **Organization** — Your use case list is long with complex relationships. The diagram organizes includes, extends, generalizes, and triggers visually.
2. **Communication** — Someone from your team (or someone five years from now) should be able to look at this diagram and interpret it the same way you do. Standards exist so that engineers worldwide share a common visual language.

The diagram serves as a **table of contents** for deeper work — you can't capture all detail in one diagram, but it records the relationships and hierarchy.

**Why list before diagram:** You may wonder why we build the use case list first rather than drawing the diagram from the start. Breaking the work into smaller pieces lets you focus on **discovery** first — identifying scenarios, finding scope — without worrying about bubble sizes, arrangement, connection arrows, multiple diagrams, or primary vs. secondary actors. As you gain experience, you may iterate directly on diagrams, but even experienced practitioners typically start with a list. The list is where the real design thinking happens; the diagram is the communication artifact.

### Selecting Use Cases for the Diagram

You won't draw all 20-30 use cases at once. Start with a **strategic subset of ~10** that gives the best overview of the system, then expand.

**Selection criteria (in order of priority):**

1. **Primary actor's use cases** — Focus on the actor you've already placed. Which use cases are most closely tied to them?
2. **HIGH-rated use cases** — The ones rated most important for functionality or performance in the prioritization step.
3. **A few <<includes>> sub-use cases** — Break one or two high-level use cases into their required sub-actions to show depth.
4. **One or two <<extends>> special cases** — Show realistic variations. Initialization and shutdown procedures are reliably good candidates (e.g., "starts the system," "shuts down the system").

**Worked example — selecting the first ~10:**
```
HIGH-LEVEL (connect to actor first):
  "drives the system"        ← primary actor's core use case
  "fuels the system"         ← another high-rated use case
  "parks the system"         ← another high-rated use case

INCLUDED (sub-actions of "drives"):
  "accelerates"              ← required sub-action
  "brakes"                   ← required sub-action
  "steers"                   ← required sub-action
  "changes lanes"            ← required sub-action

EXTENDED (special conditions):
  "starts the system"        ← initialization procedure
  "drives through snow"      ← environmental condition

This gives ~10 use cases that demonstrate the full range
of diagram elements: actor connections, includes, and extends.
```

**Key principle:** Connect only the highest-level use cases to the actor first. The <<includes>> and <<extends>> connections between use cases come next. Lower-level relationships are added in subsequent passes.

---

### Drawing Order

Build the diagram in this order to minimize rework:

```
PH: I'm going to draw your use case diagram now.
Building it step by step:

Step 1: SYSTEM BOUNDARY
  Draw the system boundary box, labeled "The System."

Step 2: PRIMARY ACTOR
  Start with ONE actor — your most common one
  (the one in at least half your use cases).
  Draw as a stick figure OUTSIDE the boundary, on the LEFT.

Step 3: PRIMARY USE CASES (start with ~10)
  Select use cases using the criteria above:
  primary actor's use cases first, then HIGH-rated,
  then a few includes/extends for depth.

  Add ALL ~10 use case bubbles (ovals) INSIDE the boundary.
  Connect actor → highest-level bubbles with solid lines.

  ⚠️ ONLY connect the actor to TOP-LEVEL use cases.
  Sub-use cases (includes) and special cases (extends)
  get their bubbles placed in the diagram NOW,
  but they do NOT connect to the actor — their actor
  relationship is implied through the hierarchy tree.
  The <<includes>> and <<extends>> arrows come in Step 4.

Step 3.5: ARRANGE BUBBLES
  Before connecting, arrange the bubbles based on
  where you expect to make connections.
  Goal: avoid having connector lines cross each other.
  Group related use cases near each other —
  a parent and its includes/extends should be close.

Step 4: RELATIONSHIPS
  Add <<includes>>, <<extends>>, <<generalizes>>,
  and <<trigger>> connections between use cases.

Step 5: ADDITIONAL ACTORS
  Add remaining actors (stick figures).
  Primary actors on LEFT, secondary actors on RIGHT
  or any side OTHER than left.
  Connect to their use cases.
  Secondary actors may use dashed connection lines.

Step 6: REVIEW CONNECTIONS
  Look over the entire diagram one more time.
  Have you missed any connections?
  Are any connector types wrong?
  Do any lines cross that could be avoided
  by rearranging bubbles?

Step 7: FRAME AND TITLE (last)
  Add the rectangular border around EVERYTHING —
  the system box AND all actors outside it.
  Add the title box LAST.
  Title format: uc.[TitleInCamelCase]
  Adding it last prevents rework if the diagram shifts.
  Longer, more descriptive titles are preferred —
  they help distinguish between multiple diagrams.

[PH generates diagram]

Review it carefully — does it accurately represent
the relationships you've defined?
```

**PH diagram generation rules:**
- Follow UML/SysML formatting strictly (see rules below)
- Generate from the validated use case list, actor list, and relationships
- Start with the primary actor and expand outward
- Present for user review before finalizing
- If the diagram is too large, split by actor group or by relationship type

---

## DIAGRAM FORMATTING RULES (UML/SysML Standards)

**Why formatting is strict:** The use case diagram follows UML/SysML standards — governing bodies for engineering diagrams. Strict formatting ensures universal interpretation and professional credibility. Work is routinely rejected for formatting violations alone.

### Frame
- Rectangular border around the **entire diagram** — this includes the system boundary box AND all actors placed outside it
- Title format: `uc.[TitleInCamelCase]` (e.g., `uc.MainOperationUseCases`). The `uc.` prefix stands for "use case." All words capitalized, no spaces between words.
- **Longer, more descriptive titles are preferred** — they help distinguish between multiple use case diagrams across a project
- "The System" label on the inner system boundary box
- **Add frame and title LAST** to prevent rework if the diagram layout shifts during construction

### Actors
- Represented as **stick figures** placed OUTSIDE the system boundary
- **Primary actors:** LEFT side of the boundary (we naturally read left to right)
- **Secondary actors:** Any side OTHER than the left side (typically right side)
- Secondary actors may use **dashed connection lines** instead of solid lines to visually distinguish them from primary actors
- Stick figure style may vary slightly by software tool — this is the one area where minor variation is accepted

**What is a secondary actor?** An actor who plays a significant role within a use case but is NOT the main stimulus driving the action. They participate but don't initiate.

```
Examples:
- Navigator reads the map while the Driver drives
  (Driver = primary, Navigator = secondary)
- Parent supervises while the Child plays with a toy
  (Child = primary, Parent = secondary)
```

Secondary actors are **not always required** — some standards and submissions don't include them. They offer a more complete picture of what's happening but are optional. Include them when they reveal additional requirements or clarify who is involved.

### Multiple Diagrams (Viewpoint Analysis)

As you add more actors, the diagram can grow **too large to be readable** — and potentially too large for formal submission (some agencies have size limits).

**Solution:** Create **multiple use case diagrams, one per main actor.** It is perfectly acceptable to repeat use cases across different diagrams.

```
Diagram 1: "Driver" (primary actor)
  → drives, fuels, parks, accelerates, brakes...

Diagram 2: "Elderly Driver" (actor variant)
  → same use cases as Driver + additional ones
  (copy diagram 1, change actor, add/modify use cases)

Diagram 3: "Maintenance Worker" (different actor)
  → services, inspects, repairs...
```

**Copy-and-change technique:** For actor variants (e.g., elderly driver vs. standard driver), copy the original diagram, change the actor name, then add or modify use cases specific to that variant. This is fast and ensures you don't miss shared use cases.

**Why this matters (viewpoint analysis):** Examining the system's needs per actor individually helps you:
- Recognize the **value and purpose** of the system for each user group
- Determine **scope and priorities** specific to each actor
- Identify **different evaluation criteria** for the final solution
- Discover use cases that only emerge when you focus on one actor's complete experience

### Use Case Bubbles
- **Ovals/ellipses** (commonly called "bubbles") inside the system boundary
- Text centered, same font size for all
- All bubbles roughly same size — prefer **larger bubbles with some whitespace** over cramming text into smaller ones
- **Actor name NOT included in bubble text** — the connection line between actor and bubble implies it. "Driver drives the system" becomes just "drives the system" in the bubble, because the line from the Driver stick figure already tells you who.
- **Can drop "the system" suffix** for even cleaner labels — "drives the system" becomes simply "drives." The result: a stick figure labeled "Driver" connected to a bubble labeled "drives" — clean and readable, representing "Driver drives the system."

### Connection Lines

| Type | Line Style | Direction | Label |
|------|------------|-----------|-------|
| Primary Actor to Use Case | Solid line | Actor → Bubble | (none) |
| Secondary Actor to Use Case | Dashed line (or solid) | Actor → Bubble | (none) |
| <<includes>> | Dashed arrow | Main → Sub | `<<includes>>` |
| <<extends>> | Dashed arrow | Sub → Main | `<<extends>>` |
| <<generalizes>> | Solid, open triangle | Special → General | (none — triangle head identifies it) |
| <<trigger>>* | Dashed arrow | Initial → Triggered | `<<trigger>>` |

*\*<<trigger>> is not considered an official UML arrow by some standards, but is widely used in practice.*

**Actor connection rule:** Only **top-level** use cases get a direct line to the actor. Sub-use cases (<<includes>>) and special cases (<<extends>>) connect to their parent use case, NOT to the actor. The actor relationship is implied through the hierarchy.

### Label Format
- Written in **lowercase**
- Double angle brackets: `<<includes>>`, `<<extends>>`, `<<trigger>>`

---

## THINKING STATE MESSAGES

```typescript
const useCaseDiagramThinking = [
  {
    headline: "Discovering use case scenarios...",
    tip: "Think scenarios, not features. 'Shopping cart' is a feature. 'Customer adds item while comparing prices' is a use case.",
    duration: 4000
  },
  {
    headline: "Analyzing actor variants...",
    tip: "A 'student driver' and 'drunk driver' create vastly different requirements. Your system must handle both.",
    duration: 4000
  },
  {
    headline: "Identifying undesired use cases...",
    tip: "What can go wrong? Malicious use? System failures? These often define your most critical requirements.",
    duration: 4000
  },
  {
    headline: "Mapping use case relationships...",
    tip: "<<includes>> = required sub-action. <<extends>> = optional variation. The distinction matters for testing and prioritization.",
    duration: 4000
  },
  {
    headline: "Validating use case completeness...",
    tip: "Can you state start/end conditions? Is it the right scope? Does it capture unique requirements?",
    duration: 4000
  }
];
```

---

## TOOLTIPS

| Term | Definition |
|------|------------|
| **Use Case** | A situation where your system is used — think scenarios, not features. |
| **Actor** | The main stimulus causing the system to act — person, system, or internal trigger. |
| **<<includes>>** | This use case REQUIRES the sub-action to complete. |
| **<<extends>>** | This is an OPTIONAL variation that MAY happen. |
| **<<generalizes>>** | A special version that inherits everything from the general case. |
| **<<trigger>>** | Completing this use case automatically starts another. |
| **Primary Actor** | The main user whose actions drive the use case. |
| **Secondary Actor** | Supporting actors involved but not driving the action. |

---

## VALIDATION ERRORS

```typescript
const validationErrors = {
  no_start_end: {
    error: "Use case '{name}' has no clear start/end conditions",
    why: "Without boundaries, you can't know when the use case begins or completes.",
    fix: "Define: What must be true BEFORE? What is true AFTER?"
  },

  too_broad: {
    error: "Use case '{name}' seems too broad",
    why: "If describing it takes many steps or covers multiple scenarios, break it down.",
    fix: "Use <<includes>> to break into sub-use cases."
  },

  feature_not_scenario: {
    error: "'{name}' looks like a feature, not a use case",
    why: "Features describe WHAT you build. Use cases describe SITUATIONS of use.",
    fix: "Reframe as: In what situation would someone need this?"
  },

  missing_undesired: {
    error: "No undesired use cases identified",
    why: "What can go wrong? Malicious use? These create critical requirements.",
    fix: "Consider: failures, attacks, edge cases, misuse."
  },

  wrong_relationship: {
    error: "'{sub}' should be <<extends>> not <<includes>>",
    why: "Can the parent complete WITHOUT this? If yes → extends. If no → includes.",
    fix: "Ask: Is this REQUIRED or OPTIONAL for the parent to complete?"
  }
};
```

---

## SCOPE REVIEW (Bridge to Requirements)

After finalizing the use case diagram, use it **together with the context diagram** to identify and address gaps in your system's scope definition. This is the final quality gate before moving to scope trees and requirements extraction.

```
PH: Your use case diagram is finalized. Before we move to the next step,
let's review your scope by cross-referencing both diagrams.

🔍 CONTEXT DIAGRAM ↔ USE CASE DIAGRAM CROSS-CHECK:

For each INTERACTION on the context diagram:
  ? Is there at least one use case covering this interaction?
  ? Are there use cases for when this interaction FAILS?
  ? Is the interaction well enough understood to design for it?

For each EXTERNAL ELEMENT on the context diagram:
  ? Do your actors account for this element?
  ? Are there use cases for all ways this element interacts
    with your system?

For each USE CASE on the use case diagram:
  ? Does it trace back to an interaction or stakeholder need?
  ? Do you understand it well enough to walk through it
    step-by-step? (You'll need to do this next.)

🔍 INFORMATION GAPS:

Flag anything where:
  ⚠️ A connection/interaction is poorly understood
     → You need more information from your stakeholder
  ⚠️ The details of a use case are poorly understood
     → You need to clarify before extracting requirements
  ⚠️ A context diagram element has no corresponding use cases
     → Scope gap — add use cases or justify the omission

Gaps identified now are FAR cheaper to resolve than gaps
discovered during implementation.
```

**PH actions at this stage:**
- Cross-reference every context diagram interaction against the use case list
- Flag any interactions with no corresponding use cases
- Flag any use cases that don't trace back to the context diagram or problem statement
- Identify where more stakeholder information is needed
- Prompt the user to resolve gaps before proceeding to scope trees

```
PH: Here's your scope cross-check summary:

Context interactions covered by use cases: {COVERED}/{TOTAL}
Use cases traceable to context diagram: {TRACED}/{UC_TOTAL}

{IF gaps exist}
⚠️ I found {N} gaps that should be resolved before we move on:
  {gap_1}
  {gap_2}
  ...

Would you like to address these now, or note them
and revisit after gathering more stakeholder input?

{IF no gaps}
✅ Your scope looks well-defined. Every interaction
is covered and every use case traces back to a need.
Ready to build scope trees and extract requirements.
```

---

## COMPLETION CELEBRATION

```
✅ Use Case Model Complete

You've captured {X} use cases covering all scenarios your system must handle:
- {Y} primary use cases from main actors
- {Z} actor variants with different requirements
- {W} undesired/negative use cases
- {V} automated/internal use cases

💡 You discovered {N} undesired use cases that would have been
   expensive surprises if found during development.

Your use cases reveal:
- What your system must DO (not just what it IS)
- Edge cases most projects miss
- Clear priorities for development

A note: requirements engineering is a skill that develops with practice —
like learning a sport or instrument. Your first pass won't be perfect,
and that's expected. Each time you do this, you'll develop stronger
intuition for spotting missing scenarios and knowing when you've gone
deep enough. This model is a strong foundation to build on.

Next: We'll walk through each high-priority use case step by step
to extract the detailed requirements hiding inside.
```

---

*Knowledge Bank: Use Case Diagram*
*Step 1.2 of PRD Creation Process*
