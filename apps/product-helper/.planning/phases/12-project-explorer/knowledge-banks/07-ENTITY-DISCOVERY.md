# Knowledge Bank: Entity Discovery (Data Modeling Foundation)

**Step:** 2.1 - Entity Discovery
**Purpose:** Guide extraction of data entities from requirements, use cases, and domain context
**Core Question:** "What data does this system need to persist, and how does it relate?"
**Feeds Into:** Schema extraction agent (`schema-extraction-agent.ts`)

---

## WHY THIS STEP MATTERS

> "Show me your data structures, and I won't need to see your code." — Fred Brooks (paraphrased)

Entities are the backbone of every system. Get them wrong and you'll spend months fighting your own database. Get them right and the API, the UI, and the business logic fall into place naturally.

The extraction agent must identify entities from whatever context it has — a single sentence, a full requirements document, or a conversation transcript. The less context available, the more the agent must rely on domain patterns and inference.

---

## ENTITY RECOGNITION TECHNIQUES

### 1. Noun Analysis (Primary Method)

Extract entities from requirements and use case descriptions:

**From SHALL statements:**
```
"The system SHALL allow a Driver to accept a Ride Request"
→ Entities: Driver, RideRequest

"The system SHALL generate an Invoice for each completed Order"
→ Entities: Invoice, Order

"The Admin SHALL be able to assign Roles to Team Members"
→ Entities: Admin (actor), Role, TeamMember
```

**Rules:**
- Subjects and objects of action verbs are entity candidates
- Ignore verbs, adjectives, and system references ("the system")
- Actors from the context diagram are often entities too
- If it needs to be stored and retrieved later → it's an entity

### 2. The Persistence Test

Ask: "Does this need to be stored in the database?"

| Candidate | Persistent? | Entity? | Why |
|-----------|------------|---------|-----|
| User | Yes | Yes | Core identity, referenced everywhere |
| Password | Yes | No — attribute of User | Stored but not standalone |
| Login attempt | Maybe | Yes if audit needed | Depends on requirements |
| Error message | No | No | Transient, computed |
| Search query | Maybe | Yes if analytics needed | Depends on product goals |

### 3. Entity vs Attribute Distinction

| If it has... | It's probably... |
|-------------|-----------------|
| Its own lifecycle (created, updated, deleted independently) | An entity |
| Multiple attributes of its own | An entity |
| A relationship to other things | An entity |
| Only a single value | An attribute of another entity |
| No meaning without its parent | An attribute |

**Example:**
```
"A product has a name, price, and category"
→ Product: entity
→ name, price: attributes of Product
→ Category: entity (has its own name, description, can exist independently)
```

### 4. Relationship Inference from Use Cases

| Pattern in requirements | Relationship type |
|------------------------|-------------------|
| "User creates multiple Projects" | One-to-many (User → Project) |
| "A Project can have many Tags, a Tag can be on many Projects" | Many-to-many (needs junction table) |
| "Each Order has exactly one Invoice" | One-to-one |
| "A Comment belongs to a Post" | One-to-many (Post → Comment) |
| "Users can follow other Users" | Self-referential many-to-many |
| "A Category can contain sub-Categories" | Self-referential one-to-many (tree) |

---

## DOMAIN ENTITY PATTERNS (February 2026)

### SaaS / B2B Application
```
Core:        User, Organization (or Team), Membership, Role, Invitation
Auth:        Session, ApiKey, PasswordResetToken, OAuthAccount
Billing:     Subscription, Plan, Invoice, PaymentMethod, Usage
Content:     Project, Document, Template, Version
Audit:       AuditLog, ActivityEvent
Config:      Setting, FeatureFlag, Webhook
```

**Multi-tenancy pattern (2026 consensus):** Every table gets a `tenant_id` (or `organization_id`) column. Use PostgreSQL Row-Level Security (RLS) to enforce isolation. This is the default for B2B SaaS — Supabase, Neon, and Crunchy Data all recommend it.

### E-Commerce / Marketplace
```
Users:       User, Address, PaymentMethod
Catalog:     Product, Category, ProductVariant, ProductImage, Tag
Orders:      Order, OrderItem, Cart, CartItem
Payments:    Transaction, Refund, Invoice
Marketplace: Seller, SellerProfile, Review, Rating
Shipping:    Shipment, ShippingMethod, TrackingEvent
Promotions:  Coupon, Discount, PromotionRule
```

**Key pattern:** Product attributes vary wildly (a shirt has size/color, a laptop has RAM/storage). Use JSONB for variable product attributes alongside normalized core fields. This is the 2026 PostgreSQL best practice — avoid EAV (Entity-Attribute-Value) tables.

### Social / Content Platform
```
Users:       User, Profile, Follow (junction), Block
Content:     Post, Comment, Reply, Media, Tag
Engagement:  Like, Bookmark, Share, View
Social:      Notification, Message, Conversation, ConversationMember
Moderation:  Report, Flag, ModerationAction
Discovery:   Feed, FeedItem, Hashtag, Trending
```

### Mobile App (Offline-First)
```
Core:        User, Device, SyncState
Data:        [domain-specific entities]
Sync:        ChangeLog, ConflictResolution, SyncCheckpoint
Push:        PushToken, NotificationPreference
```

**2026 trend:** Turso (libSQL) embedded replicas enable zero-latency local reads with automatic sync to cloud. CRDTs for conflict resolution are becoming the standard for offline-first apps.

### API Platform / Developer Tools
```
Auth:        User, Organization, ApiKey, OAuthClient, OAuthToken
API:         Endpoint, Version, RateLimit, UsageRecord
Webhooks:    WebhookEndpoint, WebhookEvent, WebhookDelivery, DeliveryAttempt
Docs:        Documentation, Changelog, Example
Monitoring:  RequestLog, ErrorLog, HealthCheck
```

### AI / LLM Product
```
Core:        User, Project, Conversation, Message
AI:          Prompt, PromptVersion, Model, ModelConfig
RAG:         Document, DocumentChunk, Embedding (pgvector)
Usage:       TokenUsage, CostRecord, RateLimitBucket
Feedback:    Rating, Annotation, HumanEvaluation
```

**2026 trend:** pgvector (PostgreSQL extension) is the default for embedding storage. "Just use Postgres" — one database for relational + vector data. Only graduate to Pinecone/Qdrant/Weaviate at 50-100M+ vectors.

---

## ENTITY NAMING CONVENTIONS

| Convention | Example | When to use |
|-----------|---------|-------------|
| Singular PascalCase | `User`, `OrderItem` | Entity/model names in code |
| Plural snake_case | `users`, `order_items` | Database table names |
| Singular snake_case | `user_id`, `order_item_id` | Foreign key columns |

**Avoid:**
- Generic names: `Item`, `Data`, `Record`, `Info` (too vague)
- Abbreviations: `usr`, `org`, `proj` (clarity > brevity)
- Domain-specific jargon unless the domain demands it

---

## MINIMUM ENTITY COUNTS BY PROJECT COMPLEXITY

| Complexity | Entity Count | Example |
|-----------|-------------|---------|
| Simple (landing page with auth) | 3-5 | User, Session, ContactForm |
| Standard (SaaS MVP) | 8-15 | User, Org, Project, Document, Subscription, etc. |
| Complex (marketplace) | 15-25 | Full e-commerce entity set |
| Enterprise | 25-50+ | Multi-domain with audit, compliance |

**If the extraction produces fewer than 5 entities for a non-trivial project, the agent should infer missing entities from domain patterns above.**

---

## QUALITY CHECKS

**Done right:**
- Every actor from the context diagram maps to at least one entity
- Every use case implies at least one entity being created/read/updated/deleted
- Relationships are explicit (not just "related to")
- No orphan entities (every entity connects to at least one other)
- Common infrastructure entities included (User, AuditLog, etc.)

**Done wrong:**
- Only 2-3 entities for a complex domain
- Missing junction tables for many-to-many relationships
- No audit/logging entities for systems with compliance needs
- Entities named after UI components instead of domain concepts
- Missing the "boring" entities: Session, Notification, Setting

---

## TOOLS & REFERENCES (2026)

| Tool | Purpose | Status |
|------|---------|--------|
| ChartDB | AI-powered ER diagram generation from prompts | Open-source, free |
| dbdiagram.io | DSL-driven database diagram tool | Developer favorite |
| postgres.new (Supabase) | AI-assisted schema generation in browser | Built into Supabase |
| Context Mapper | DDD bounded context modeling from Event Storming | Open-source |

**Key educators:**
- **Vaughn Vernon** — "Implementing DDD" (practical aggregate/entity design)
- **Amichai Mantinband** (Microsoft) — DDD courses on Dometrain
- **Alberto Brandolini** — Event Storming for domain discovery
- **Martin Fowler** — Patterns of Enterprise Application Architecture

---

## INDUSTRY VERTICAL ENTITY CATALOGS

### Healthcare (HL7 FHIR-Inspired)
```
Core Clinical:   Patient, Practitioner, Encounter, Appointment, Schedule
Records:         Observation, DiagnosticReport, Condition, AllergyIntolerance
Medications:     Medication, MedicationRequest, MedicationDispense, Immunization
Billing:         Claim, ExplanationOfBenefit, Coverage, InsurancePlan
Infrastructure:  Organization, Location, HealthcareService, Device
Compliance:      AuditEvent, Consent, Provenance
```

**Key relationships:**
- Patient ← Encounter (1:N) — every clinical event is tied to an encounter
- Encounter ← Observation (1:N) — vitals, lab results, assessments per visit
- Practitioner ↔ Patient (M:N via Encounter) — many doctors treat many patients
- Medication ← MedicationRequest (1:N) — prescriptions reference the drug catalog

**Compliance entities (HIPAA):**
- `AuditEvent` — MANDATORY for all PHI access; who accessed what, when, from where
- `Consent` — patient authorization for data sharing; tracks consent type, period, purpose
- `Provenance` — data lineage; who created/modified a record and when

### Fintech (Modern Treasury / Stripe Inspired)
```
Accounts:        Account, ExternalAccount, VirtualAccount, AccountBalance
Transactions:    Transaction, LedgerEntry, LedgerAccount, Transfer
Instruments:     PaymentMethod, BankConnection, Card, Wallet
Compliance:      KYCVerification, SARReport, TransactionMonitor, RiskScore
Users:           Customer, Organization, BeneficialOwner, AuthorizedUser
```

**Double-entry bookkeeping pattern:**
Every financial movement produces two `LedgerEntry` records (debit + credit). `LedgerAccount` tracks running balances. This is non-negotiable for fintech — single-entry systems fail audits.

**Key relationships:**
- Account ← Transaction (1:N) — immutable append-only transaction log
- Transaction ← LedgerEntry (1:2 minimum) — always debit + credit entries
- Customer ← Account (1:N) — one customer, multiple accounts (checking, savings, etc.)
- Customer ← KYCVerification (1:N) — identity checks must be tracked with expiry

### Automotive (DMS-Inspired)
```
Inventory:       Vehicle, VehicleImage, VehicleHistory, PriceHistory
Sales:           Lead, Opportunity, Deal, TradeIn, FinancingApplication
Service:         ServiceAppointment, ServiceOrder, ServiceLineItem, PartUsage
People:          Customer, Salesperson, Technician, FinanceManager
Reference:       Make, Model, ModelYear, TrimLevel, VINDecoder
Compliance:      Warranty, WarrantyClaim, RecallNotice, ComplianceAudit
```

**VIN as entity anchor:** The 17-character VIN is the universal identifier for vehicles. All vehicle-related entities should reference VIN. Decode services (NHTSA API) provide make/model/year/trim from VIN.

### Education (Canvas / Open edX Inspired)
```
Core:            Course, Section, Module, Lesson, Assignment
Users:           Student, Instructor, TeachingAssistant, Administrator
Assessment:      Quiz, Question, Submission, Grade, Rubric
Enrollment:      Enrollment, CourseRoster, Waitlist
Content:         Resource, Video, Document, ExternalLink
Communication:   Announcement, Discussion, DiscussionPost, DirectMessage
Completion:      Progress, CompletionRecord, Certificate, Transcript
```

### Real Estate
```
Properties:      Property, Listing, PropertyImage, FloorPlan, VirtualTour
Transactions:    Offer, CounterOffer, Contract, Closing, Escrow
People:          Agent, Buyer, Seller, Inspector, Appraiser, LoanOfficer
Showings:        Showing, ShowingFeedback, OpenHouse
Compliance:      Disclosure, Inspection, Appraisal, TitleSearch
Reference:       Neighborhood, School, Amenity, PropertyType
```

### Logistics / Supply Chain (Flexport / ShipBob Inspired)
```
Shipments:       Shipment, ShipmentItem, ShipmentEvent, TrackingUpdate
Warehousing:     Warehouse, InventoryItem, StockLevel, BinLocation, PickList
Orders:          Order, OrderLine, FulfillmentRequest, PackingSlip, ReturnRequest
Carriers:        Carrier, CarrierService, ShippingRate, ServiceLevel
Documents:       BillOfLading, CustomsDeclaration, CommercialInvoice, Certificate
People:          Shipper, Consignee, FreightBroker, WarehouseOperator
Routes:          Route, Leg, Port, TransitPoint, ETAUpdate
Reference:       HarmonizedCode, Incoterm, PackageType, DangerousGoodsClass
```

**Key relationships:**
- Shipment ← ShipmentEvent (1:N) — every status change is an append-only event
- Order ← FulfillmentRequest (1:N) — one order may ship from multiple warehouses
- InventoryItem ← StockLevel (1:N per warehouse) — track qty per location
- Shipment ← Leg (1:N) — multi-modal: truck → port → vessel → port → truck

**Domain-specific patterns:**
- **ETA prediction:** `ETAUpdate` entity captures predicted vs actual arrival times for ML training
- **Lot tracking:** For perishables/pharma, `InventoryItem` needs `lot_number`, `expiry_date`, `manufacture_date`
- **Customs:** International shipments require `HarmonizedCode` (HS code) per item for tariff classification

### Insurance / Insurtech (Guidewire / Lemonade Inspired)
```
Policies:        Policy, PolicyVersion, Coverage, Endorsement, Exclusion
Claims:          Claim, ClaimEvent, ClaimDocument, ClaimPayment, Subrogation
Underwriting:    Application, Quote, RiskAssessment, UnderwritingDecision
People:          Policyholder, Beneficiary, Agent, Adjuster, Claimant
Billing:         Premium, PremiumSchedule, Invoice, Payment, Commission
Reference:       ProductLine, CoverageType, PerilType, LossType, Territory
```

**Key relationships:**
- Policy ← PolicyVersion (1:N) — policies are immutable; changes create new versions
- Policy ← Claim (1:N) — one policy can have many claims over its life
- Claim ← ClaimEvent (1:N) — FNOL → Investigation → Evaluation → Settlement → Closed
- Application → Quote (1:N) → Policy (0:1) — underwriting funnel

**Domain-specific patterns:**
- **Policy versioning:** NEVER update a policy row. Every change (endorsement, renewal, cancellation) creates a new `PolicyVersion` with `effective_date` and `expiration_date`
- **Claims state machine:** FNOL → Triage → Investigation → Evaluation → Negotiation → Settlement → Closed (each transition logged in `ClaimEvent`)
- **Actuarial data:** `RiskAssessment` stores risk factors as JSONB (varies wildly by line of business)

### Legal / LegalTech (Clio / ContractPodAi Inspired)
```
Cases:           Case, CaseEvent, CaseNote, CaseDocument, CourtFiling
Clients:         Client, Contact, ConflictCheck, RetainerAgreement
Documents:       Document, DocumentVersion, Template, Clause, Signature
Billing:         TimeEntry, ExpenseEntry, Invoice, Payment, TrustAccount
Calendar:        CalendarEvent, Deadline, Statute, CourtDate, Reminder
People:          Attorney, Paralegal, Client, Judge, OpposingCounsel
Reference:       PracticeArea, JurisdictionCourt, MatterType, BillingRate
```

**Key relationships:**
- Case ← CaseDocument (1:N) — every document tied to a matter/case
- Case ← TimeEntry (1:N) — billable hours tracked per case
- Attorney ← TimeEntry (1:N) — each attorney logs time to cases
- Document ← DocumentVersion (1:N) — legal docs require full version history
- Client ← ConflictCheck (1:N) — MANDATORY ethical check before engagement

**Domain-specific patterns:**
- **Trust accounting (IOLTA):** `TrustAccount` must be completely separate from operating accounts. Commingling is an ethics violation. Track every deposit/withdrawal with `TrustTransaction`
- **Conflict checking:** Before taking a new client, search all past/current clients and opposing parties. `ConflictCheck` logs the search and result
- **Statute of limitations:** `Deadline` entity with hard due dates — missed deadlines = malpractice

### Hospitality / Travel (Booking.com / Airbnb Inspired)
```
Properties:      Property, Room, RoomType, Amenity, PropertyImage, PropertyRule
Bookings:        Booking, BookingItem, BookingModification, CancellationPolicy
Availability:    AvailabilityCalendar, PriceRule, SeasonalRate, BlockedDate
Guests:          Guest, GuestPreference, LoyaltyMember, Review
Payments:        Reservation, Payment, Refund, SecurityDeposit, PayoutToHost
Operations:      Housekeeping, MaintenanceRequest, CheckIn, CheckOut
Reference:       Destination, PointOfInterest, PropertyType, StarRating
```

**Key relationships:**
- Property ← Room (1:N) ← AvailabilityCalendar (1:N per date) — calendar-based inventory
- Guest ← Booking (1:N) ← BookingItem (1:N) — one booking can cover multiple rooms/dates
- Property ← Review (1:N) — reviews tied to completed stays (verified reviews only)
- Booking ← BookingModification (1:N) — date changes, guest count changes, all logged

**Domain-specific patterns:**
- **Calendar-based inventory:** Unlike e-commerce (quantity-based), hospitality tracks per-date availability. `AvailabilityCalendar` has one row per room per date
- **Dynamic pricing:** `PriceRule` + `SeasonalRate` + demand multiplier. Revenue management systems adjust nightly rates automatically
- **Double-booking prevention:** Use `SELECT ... FOR UPDATE` or advisory locks on the availability row when confirming a booking

---

## CUSTOMER 360 PIPELINE

A **Customer 360** (or unified customer profile) aggregates data from multiple sources into a single entity graph. This pattern is critical for any system that touches customers across multiple channels (marketing, sales, support, product usage).

### Entity Architecture
```
Source Systems        →  Resolution Layer     →  Unified Profile
─────────────────       ──────────────────      ─────────────────
CRM (contacts)     →   Identity Resolution  →  Customer360
Support (tickets)  →   Match + Merge        →  ├── ContactInfo[]
Product (events)   →   Conflict Resolution  →  ├── Interaction[]
Marketing (leads)  →   Golden Record        →  ├── Preference[]
Billing (invoices) →                         →  └── Segment[]
```

### Core Entities
```
Customer360       (id, golden_record_id, confidence_score, source_count, merged_at)
ContactInfo       (id, customer_id, type, value, is_primary, verified_at, source)
SourceRecord      (id, customer_id, source_system, external_id, raw_data JSONB, ingested_at)
IdentityLink      (id, customer_id, identifier_type, identifier_value, confidence)
InteractionEvent  (id, customer_id, channel, event_type, occurred_at, metadata JSONB)
Segment           (id, name, rules JSONB, is_dynamic)
CustomerSegment   (customer_id, segment_id, entered_at, exited_at)
```

### Identity Resolution Pattern
```sql
-- Match candidates by email, phone, or external ID
SELECT DISTINCT c.id, c.golden_record_id
FROM contact_info ci
JOIN customer360 c ON c.id = ci.customer_id
WHERE ci.value = :incoming_email
  AND ci.type = 'email'
  AND ci.verified_at IS NOT NULL;

-- Confidence scoring: email match = 0.95, phone = 0.85, name+address = 0.70
```

**When to use:** CRM, CDP (Customer Data Platform), marketing automation, loyalty programs, unified dashboards. If the system has customers interacting through 2+ channels, Customer 360 entities should be in the schema.

---

## ENTITY RELATIONSHIP PATTERNS BY TYPE

### Hierarchical (Tree / DAG)
```
Pattern: Parent → Child (self-referential FK)
Use for: Categories, org charts, file systems, comment threads

categories (id, parent_id FK → categories, name, depth, path ltree)
-- PostgreSQL ltree extension for efficient tree queries:
-- SELECT * FROM categories WHERE path <@ 'electronics.phones'
```

### Temporal (Time-Versioned)
```
Pattern: Entity + EntityVersion (append-only)
Use for: Contracts, documents, pricing, policies — anything with audit history

documents     (id, current_version_id, created_by, created_at)
doc_versions  (id, document_id FK, version_number, content, changed_by, created_at)
-- Never UPDATE content — always INSERT new version
```

### State Machine
```
Pattern: Entity with status + StatusTransition log
Use for: Orders, tickets, applications, workflows

orders (id, status CHECK('draft','pending','paid','shipped','delivered','cancelled'))
order_transitions (id, order_id FK, from_status, to_status, triggered_by, reason, created_at)
-- Valid transitions defined in application code, logged for audit
```

### Polymorphic
```
Pattern: Multiple entity types share a common relationship
Use for: Comments, attachments, likes that apply to multiple entity types

-- Approach 1: Separate FKs (type-safe, preferred)
comments (id, post_id FK NULL, article_id FK NULL, product_id FK NULL, ...)
CHECK (num_nonnulls(post_id, article_id, product_id) = 1)

-- Approach 2: Type + ID columns (flexible, less type-safe)
comments (id, commentable_type TEXT, commentable_id UUID, ...)
-- No FK constraint possible — enforce in application code
```

### Event Sourcing
```
Pattern: Events as source of truth, materialized views for reads
Use for: Financial ledgers, audit-critical systems, collaborative editing

events (id, stream_id, event_type, version INT, payload JSONB, created_at)
UNIQUE(stream_id, version)  -- optimistic concurrency control
-- Projections (materialized views) rebuild current state from event log
```

---

## SYSTEM DESIGN ENTITY CATALOGS

### Ride-Sharing (Uber Pattern)
```
Core:      User, Driver, Rider, Vehicle, DriverDocument
Rides:     RideRequest, Ride, Route, Waypoint, RideEstimate
Payments:  Payment, DriverEarning, PromoCode, Tip, Refund
Location:  DriverLocation (real-time), SurgeZone, GeoFence
Rating:    RiderRating, DriverRating, Report
```
**Key pattern:** `DriverLocation` is a high-frequency write entity (GPS updates every 3-5 seconds). Use a time-series approach (TimescaleDB or partitioned table) — NOT a single row per driver.

### Payments Platform (Stripe Pattern)
```
Core:          Customer, Account, PaymentMethod, BankAccount
Payments:      PaymentIntent, Charge, Refund, Dispute
Subscriptions: Subscription, Plan, Price, Invoice, InvoiceLine
Connect:       ConnectedAccount, Transfer, Payout, ApplicationFee
Infrastructure: Event, WebhookEndpoint, WebhookDelivery, IdempotencyKey
```
**Key pattern:** `IdempotencyKey` prevents duplicate charges. Every mutation endpoint accepts an idempotency key; if the same key is resubmitted, return the cached response.

### Messaging (Slack Pattern)
```
Core:       User, Workspace, Channel, DirectMessage
Messages:   Message, Thread, Reaction, Attachment, Mention
Search:     MessageIndex, FileIndex, SearchQuery
Presence:   UserPresence, UserStatus, DoNotDisturb
Admin:      WorkspaceSettings, ChannelSettings, Permission, Role
```
**Key pattern:** Messages are append-only with soft-delete (`deleted_at`). Edits create a `MessageEdit` record linked to the original. Full history is preserved for compliance.
