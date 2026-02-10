# Knowledge Bank: User Stories

**Step:** 2.7 - User Stories
**Purpose:** Guide user story creation with proper format, acceptance criteria, industry catalogs, and epic grouping
**Core Question:** "What should each actor be able to do, and how do we verify it works?"
**Feeds Into:** User Stories agent (`user-stories-agent.ts`)
**Last Updated:** February 2026

---

## WHY THIS STEP MATTERS

User stories bridge the gap between abstract use cases and concrete development tasks. A good story is testable, traceable to a use case, and small enough to complete in one sprint. Bad stories are vague ("make it user-friendly"), too large ("implement authentication"), or missing acceptance criteria.

---

## STORY FORMAT

### The Standard Pattern
```
As a [specific role],
I want to [one clear action]
so that [business value/benefit].
```

### Rules
- **Role**: Use the specific actor name from the system (not "user" — use "Customer", "Admin", "Doctor")
- **Action**: One testable capability (if you need "and", split into two stories)
- **Benefit**: Why this matters to the business or user (not "so that the system can X")

### Good vs Bad

| Good | Bad | Why |
|------|-----|-----|
| "As a Customer, I want to filter products by price range so that I find affordable options quickly" | "As a user, I want search to work better" | Specific role, specific action, testable |
| "As an Admin, I want to export user data as CSV so that I can analyze usage in a spreadsheet" | "As an admin, I want data export" | Clear format, clear benefit |
| "As a Doctor, I want to view a patient's medication history so that I can avoid harmful drug interactions" | "As a doctor, I want to see patient info" | Specific scope, clinical justification |

---

## ACCEPTANCE CRITERIA

### Given/When/Then Format
```
Given [context/precondition]
When [action/trigger]
Then [expected outcome]
```

### Example: Complete Set
**Story:** "As a Customer, I want to add items to my cart so that I can purchase multiple products at once"

**Acceptance Criteria:**
1. Given a product page with available inventory, When I click "Add to Cart", Then the item appears in my cart with quantity 1
2. Given an item already in my cart, When I click "Add to Cart" again, Then the quantity increments by 1 (not a duplicate entry)
3. Given a product with zero inventory, When I view the product page, Then the "Add to Cart" button is disabled with "Out of Stock" text
4. Given items in my cart, When I navigate away and return, Then my cart contents persist (session-based or authenticated)

### Rules
- Each criterion is binary: pass or fail (no "should look nice")
- Include at least one negative/edge case per story
- Criteria reference data states and system responses, not UI details
- 3-6 criteria per story (fewer = too vague, more = too complex — split the story)

---

## STORY SIZING (FIBONACCI POINTS)

| Points | Scope | Team Context | Example |
|--------|-------|-------------|---------|
| 1 | Trivial — simple CRUD, UI tweak, config change | One dev, <1 day | "Display user avatar in navigation header" |
| 2 | Small — straightforward implementation, one API call | One dev, 1 day | "Show total item count on cart icon badge" |
| 3 | Medium — new feature with 1-2 API calls, basic validation | One dev, 2-3 days | "Filter projects by status dropdown" |
| 5 | Large — feature with external integration, complex state | One dev, 3-5 days | "Send email notification on order status change via Resend" |
| 8 | Very large — cross-cutting concern, consider splitting | One dev, 5-8 days | "Add role-based access control to admin routes" |
| 13+ | **Epic, not a story — MUST decompose** | Multiple devs | "Implement payment system" → 5-8 stories |

### Sizing Heuristics
- If it takes more than one sprint, it's an epic
- If you can't write 3-6 acceptance criteria, it's too vague (break down)
- If you need more than 8 criteria, it's too complex (split)
- When in doubt, estimate higher — you can always adjust after discussion

---

## EPIC GROUPING PATTERNS

### By Project Type

**SaaS:**
1. Auth & Onboarding — sign up, sign in, email verification, profile setup
2. Core Features — the primary value proposition (varies by product)
3. Team Management — invite members, roles, permissions
4. Billing & Subscription — plans, payment, invoices, upgrades
5. Integrations — API keys, webhooks, third-party connections
6. Analytics & Reporting — dashboards, exports, usage metrics

**Marketplace:**
1. Seller Onboarding — registration, verification, store setup
2. Listing Management — create, edit, publish, archive products
3. Search & Discovery — browse, filter, sort, recommendations
4. Cart & Checkout — add to cart, checkout, payment processing
5. Payment & Escrow — Stripe Connect, hold/release, seller payouts
6. Reviews & Trust — buyer/seller reviews, ratings, dispute resolution
7. Fulfillment — shipping, tracking, delivery confirmation

**Mobile App:**
1. Onboarding & Permissions — tutorial, grant permissions, initial setup
2. Core Loop — the primary action users repeat (varies by app)
3. Notifications — push notification setup, preferences, delivery
4. Offline Mode — local storage, sync on reconnect, conflict resolution
5. Social Features — profiles, following, sharing, messaging
6. Monetization — in-app purchase, subscription, ads

**API Platform:**
1. Developer Registration — sign up, API key generation
2. API Documentation — interactive docs, examples, SDKs
3. Core Endpoints — the primary API functionality
4. Rate Limiting & Quotas — tiers, usage tracking, overage handling
5. Webhooks — registration, delivery, retry, event types
6. Dashboard — usage analytics, billing, key management

---

## INDUSTRY-SPECIFIC STORY CATALOGS

### Healthcare
**Clinical Workflow Epic:**
- "As a Doctor, I want to view a patient's complete medication history so that I can check for drug interactions before prescribing"
- "As a Nurse, I want to record vital signs during an encounter so that the Doctor has current data for diagnosis"
- "As a Lab Technician, I want to attach test results to an encounter so that the ordering physician is notified"

**Patient Access Epic:**
- "As a Patient, I want to view my upcoming appointments so that I can manage my schedule and prepare"
- "As a Patient, I want to request prescription refills online so that I don't need to call the pharmacy"
- "As a Patient, I want to message my care team through a secure portal so that I can ask non-urgent questions"

**Compliance Epic:**
- "As a Compliance Officer, I want to audit all PHI access logs so that I can detect and report unauthorized access"
- "As a System Admin, I want to enforce automatic session timeout after 15 minutes so that unattended workstations don't expose patient data"

### Fintech
**Account Management Epic:**
- "As an Account Holder, I want to link external bank accounts via Plaid so that I can view all balances in one dashboard"
- "As a Customer, I want to set up recurring transfers so that my bill payments happen automatically"
- "As a Customer, I want to see my transactions categorized automatically so that I can track spending habits"

**Compliance Epic:**
- "As a Compliance Officer, I want to flag transactions above reporting thresholds so that BSA/AML requirements are met"
- "As a Customer, I want to complete identity verification (KYC) with a photo ID so that my account is activated"

### E-Commerce
**Catalog Epic:**
- "As a Seller, I want to create product listings with multiple variants (size, color) so that buyers can choose options"
- "As a Seller, I want to set quantity-based pricing tiers so that bulk buyers get automatic discounts"

**Checkout Epic:**
- "As a Buyer, I want to apply a promo code at checkout so that I receive the advertised discount"
- "As a Buyer, I want to save my shipping address so that I don't re-enter it on every order"
- "As a Buyer, I want to choose between multiple shipping speeds so that I can balance cost and delivery time"

**Post-Purchase Epic:**
- "As a Buyer, I want to track my order status with carrier integration so that I know exactly when to expect delivery"
- "As a Buyer, I want to initiate a return within 30 days so that I can get a refund for unwanted items"

---

## UNDESIRED STORIES (SECURITY & ABUSE CASES)

Every project should include negative stories that define what the system must PREVENT:

### Universal Security Stories
- "As an Attacker, I want to brute-force login credentials — the system SHALL lock accounts after 5 failed attempts and notify the user"
- "As a Malicious User, I want to access other users' data — the system SHALL enforce tenant/user isolation on all data queries"
- "As a Spammer, I want to create fake accounts — the system SHALL require email verification before account activation"
- "As a Script Kiddie, I want to inject SQL through form inputs — the system SHALL use parameterized queries and input validation"

### Marketplace-Specific
- "As a Fake Reviewer, I want to post reviews for products I didn't buy — the system SHALL require verified purchase for reviews"
- "As a Fraudulent Seller, I want to collect payment and never ship — the system SHALL hold funds in escrow until delivery confirmed"
- "As a Colluding Pair, I want to inflate product ratings — the system SHALL detect and flag suspicious review patterns"

### Fintech-Specific
- "As a Money Launderer, I want to make many small transfers to avoid detection — the system SHALL monitor for structuring patterns"
- "As an Identity Thief, I want to open accounts with stolen documents — the system SHALL verify identity through multi-factor KYC"

---

## TRACEABILITY

### Story → Use Case Mapping
Every story must trace to at least one use case (UC):

| Story | Use Case | Epic |
|-------|----------|------|
| "As a Customer, I want to add items to cart" | UC-04: Browse & Purchase | Cart & Checkout |
| "As an Admin, I want to view user analytics" | UC-12: Monitor Usage | Analytics |

### Orphan Detection
- Stories without a use case reference are orphans — either create the missing use case or remove the story
- Use cases without any stories are un-implemented — either create stories or mark the use case as deferred

---

## QUALITY CHECKS

**Done right:**
- Every story follows "As a [role], I want to [action] so that [benefit]"
- Every story has 3-6 acceptance criteria in Given/When/Then format
- Stories are sized with Fibonacci points (1, 2, 3, 5, 8 — never 13+)
- Stories are grouped into 5-7 epics with clear boundaries
- At least 1 security/abuse story per epic
- Every story traces to a use case

**Done wrong:**
- "As a user, I want the system to be fast" (not testable)
- No acceptance criteria (not verifiable)
- Stories sized as "small/medium/large" (not precise enough)
- 50 stories in one flat list (no epic structure)
- No security stories (naive happy-path only)
- Stories describe implementation ("use Redis for caching") instead of behavior
