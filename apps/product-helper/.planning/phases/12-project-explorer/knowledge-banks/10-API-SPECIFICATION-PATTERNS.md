# Knowledge Bank: API Specification Patterns (Endpoint Design & Documentation)

**Step:** 2.4 - API Specification
**Purpose:** Guide REST/GraphQL API design, endpoint naming, error handling, and documentation
**Core Question:** "What endpoints does this system expose, and how should they behave?"
**Feeds Into:** API spec agent (`api-spec-agent.ts`)
**Last Updated:** February 2026

---

## WHY THIS STEP MATTERS

The API is the contract between your frontend and backend, between your system and external consumers. A well-designed API is self-documenting, predictable, and hard to misuse.

**OpenAPI 3.2** (released September 2025) is the current specification standard — adding hierarchical tags, streaming support, and the QUERY HTTP method.

---

## API STYLE SELECTION

| Style | Best For | Trade-off |
|-------|----------|-----------|
| **REST** | Public APIs, CRUD-heavy, wide adoption, caching | Over/under-fetching for complex queries |
| **tRPC** | TypeScript monorepos, internal APIs, type safety | Tied to TypeScript; not for public APIs |
| **GraphQL** | Complex queries, mobile (bandwidth), flexible frontends | Complexity, caching difficulty, N+1 risks |
| **gRPC** | Microservices internal, high performance, streaming | Not browser-native, requires code generation |
| **Server Actions** | Next.js forms, simple mutations | Tightly coupled to Next.js |

**2026 consensus:** REST for public APIs + tRPC for internal TypeScript APIs. GraphQL adoption has plateaued — most teams find REST + tRPC covers their needs without GraphQL's complexity.

---

## REST ENDPOINT NAMING CONVENTIONS

### Resources
```
GET    /users                    # List users
POST   /users                    # Create user
GET    /users/{userId}           # Get user
PATCH  /users/{userId}           # Update user
DELETE /users/{userId}           # Delete user
```

### Rules
- **Plural nouns** for resources: `/users`, `/projects`, `/orders`
- **Lowercase, hyphen-separated**: `/api-keys`, `/user-stories` (not camelCase or snake_case)
- **Nested resources** for parent-child: `/users/{userId}/projects`
- **Max 2 levels** of nesting: `/organizations/{orgId}/projects/{projectId}` (not deeper)
- **Actions as sub-resources**: `POST /orders/{id}/cancel`, `POST /users/{id}/verify`
- **No verbs in URLs**: `/users` not `/getUsers`

### Query Parameters
```
# Filtering
GET /users?role=admin&status=active

# Pagination (cursor-based preferred for large datasets)
GET /users?cursor=eyJ0...&limit=20

# Pagination (offset-based for simple cases)
GET /users?page=1&limit=20

# Sorting
GET /users?sort=created_at&order=desc

# Field selection (sparse fieldsets)
GET /users?fields=id,name,email

# Search
GET /users?search=john

# Date range
GET /orders?created_after=2026-01-01&created_before=2026-02-01
```

---

## HTTP METHOD SEMANTICS

| Method | Purpose | Idempotent | Body | Success Code |
|--------|---------|-----------|------|-------------|
| `GET` | Retrieve resource(s) | Yes | No | 200 |
| `POST` | Create new resource | No | Yes | 201 |
| `PUT` | Replace entire resource | Yes | Yes | 200 |
| `PATCH` | Partial update | Yes | Yes | 200 |
| `DELETE` | Remove resource | Yes | No | 204 |

**When to use PUT vs PATCH:**
- `PUT`: Replace the entire resource (client sends all fields)
- `PATCH`: Update specific fields only (client sends only changed fields)
- **Prefer PATCH** for most update operations — it's what users expect

---

## REQUEST/RESPONSE PATTERNS

### Single Resource Response
```json
{
  "data": {
    "id": "01956a2e-...",
    "name": "Acme Corp",
    "createdAt": "2026-02-07T12:00:00Z"
  }
}
```

### List Response (with Pagination)
```json
{
  "data": [
    { "id": "...", "name": "..." },
    { "id": "...", "name": "..." }
  ],
  "pagination": {
    "total": 142,
    "page": 1,
    "limit": 20,
    "hasMore": true,
    "nextCursor": "eyJ0..."
  }
}
```

### Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address",
        "code": "invalid_format"
      }
    ],
    "requestId": "req_abc123"
  }
}
```

### Empty/No Content
```
HTTP 204 No Content
(empty body — for successful DELETE)
```

---

## ERROR CODE STANDARDS

| Code | Meaning | When to Use | Response Body |
|------|---------|-------------|---------------|
| 400 | Bad Request | Malformed JSON, missing required fields | Validation details |
| 401 | Unauthorized | Not authenticated (no token, expired token) | "Authentication required" |
| 403 | Forbidden | Authenticated but lacks permission | "Insufficient permissions" |
| 404 | Not Found | Resource doesn't exist | "Resource not found" |
| 409 | Conflict | Duplicate resource, version conflict | Conflict details |
| 422 | Unprocessable Entity | Valid JSON but semantic errors | Validation details |
| 429 | Too Many Requests | Rate limited | Rate limit headers |
| 500 | Internal Server Error | Unexpected failure | Generic error (never expose internals) |

**400 vs 422:** Use 400 for syntax errors (malformed JSON), 422 for semantic errors (valid JSON but invalid values).

---

## AUTHENTICATION PATTERNS

| Context | Pattern | Header |
|---------|---------|--------|
| **API-to-API** | API key | `X-API-Key: sk_live_...` or `Authorization: Bearer sk_live_...` |
| **User sessions (SPA)** | JWT Bearer token | `Authorization: Bearer eyJ...` |
| **Web apps (SSR)** | HTTP-only cookies | `Cookie: session=...` (auto-sent by browser) |
| **Webhooks** | HMAC signature | `X-Webhook-Signature: sha256=...` |
| **OAuth 2.0** | Access token | `Authorization: Bearer ya29...` |

### API Key Design
```
Format:    sk_live_a1b2c3d4e5f6...  (prefix + random)
Storage:   Hash only (bcrypt or SHA-256) — never store plaintext
Display:   Show first 8 chars only: sk_live_a1b2****
Rotation:  Support multiple active keys per user
Scoping:   Optional: read, write, admin scopes
```

---

## RATE LIMITING

### Headers (Standard)
```
X-RateLimit-Limit: 100        # Max requests per window
X-RateLimit-Remaining: 95     # Remaining in current window
X-RateLimit-Reset: 1707350400 # Unix timestamp when window resets
Retry-After: 30               # Seconds to wait (on 429)
```

### Tiers by Plan
| Plan | Rate Limit | Burst |
|------|-----------|-------|
| Free | 100 req/min | 10 req/sec |
| Pro | 1,000 req/min | 50 req/sec |
| Enterprise | 10,000 req/min | 200 req/sec |

### Implementation
- **Algorithm:** Sliding window (Redis-backed) for accuracy
- **Key:** API key or user ID + endpoint
- **Response on limit:** 429 with Retry-After header

---

## VERSIONING STRATEGIES

| Strategy | Format | Best For |
|----------|--------|----------|
| **URL path** (recommended) | `/v1/users`, `/v2/users` | Public APIs, clear separation |
| **Header** | `Accept: application/vnd.api+json;version=2` | Internal APIs |
| **No versioning** | `/users` + additive changes only | Small teams, internal APIs |

**2026 approach:** Most teams use URL-path versioning for public APIs. For internal APIs (tRPC, Server Actions), versioning is unnecessary — ship breaking changes alongside frontend updates.

---

## API DOCUMENTATION (February 2026)

| Tool | Type | Best For |
|------|------|----------|
| **Scalar** | OpenAPI 3.2 viewer | Modern, beautiful API docs (replacing Swagger UI) |
| **Swagger UI** | OpenAPI viewer | Legacy, widely known |
| **Redocly** | OpenAPI docs generator | Enterprise, multi-API portals |
| **Hono OpenAPI** | Code-first OpenAPI | Hono framework auto-generated docs |
| **tRPC Panel** | tRPC playground | Testing tRPC endpoints |

**OpenAPI 3.2 new features:**
- Hierarchical tags (parent/child grouping of endpoints)
- Streaming support (first-class SSE/event streams)
- QUERY HTTP method support
- OAuth 2.0 Device Authorization Flow

---

## WEBHOOK DESIGN

### Event Format
```json
{
  "id": "evt_01956a2e...",
  "type": "order.completed",
  "created": "2026-02-07T12:00:00Z",
  "data": {
    "id": "ord_...",
    "status": "completed",
    "total": 9999
  }
}
```

### Best Practices
- **Signature verification:** HMAC-SHA256 with shared secret
- **Idempotency:** Include event ID; consumers should deduplicate
- **Retry policy:** Exponential backoff (1s, 5s, 30s, 5min, 1hr)
- **Timeout:** 30 seconds max; if consumer doesn't respond, retry later
- **Event types:** Use `resource.action` format: `order.created`, `user.updated`, `payment.failed`

---

## API PATTERNS BY PROJECT TYPE

### B2B SaaS
```
Auth:       API keys (per org) + OAuth 2.0 (for integrations)
Endpoints:  /v1/organizations/{orgId}/[resources]
Multi-tenant: Organization ID in URL path
Pagination: Cursor-based (for large datasets)
Webhooks:   Yes (integration events)
Rate limit: Per API key, tiered by plan
```

### Marketplace
```
Auth:       JWT (users) + OAuth 2.0 (sellers)
Endpoints:  /v1/products, /v1/orders, /v1/sellers/{id}/products
Search:     /v1/products/search?q=...&category=...&price_min=...
Payments:   Stripe Connect webhooks
Real-time:  WebSocket for order status updates
```

### Mobile App
```
Auth:       JWT with refresh token rotation
Endpoints:  /v1/[resources] (flat, no deep nesting)
Sync:       /v1/sync?since=2026-02-07T12:00:00Z (delta sync)
Push:       /v1/devices/{id}/push-token
Offline:    Optimistic updates with conflict resolution
```

### API Platform
```
Auth:       API keys with scopes
Docs:       OpenAPI 3.2 with Scalar viewer
Versioning: URL path (/v1/, /v2/)
SDKs:       Auto-generated from OpenAPI spec
Rate limit: Tiered, with burst allowance
Monitoring: Request logging with latency tracking
```

---

## ENDPOINT GENERATION RULES

Given entities and use cases, generate endpoints following these rules:

1. **Every entity gets CRUD endpoints** (unless read-only or write-only by nature)
2. **Nested resources** for strong parent-child relationships
3. **Search endpoints** for list resources with complex filtering
4. **Action endpoints** for state transitions: `POST /orders/{id}/cancel`
5. **Bulk operations** where needed: `POST /users/bulk-invite`
6. **Health check:** `GET /health` (returns 200 with service status)

### Example: From Entities to Endpoints
```
Entities: User, Project, Document, Comment

→ GET/POST           /v1/users
→ GET/PATCH/DELETE    /v1/users/{userId}
→ GET/POST           /v1/projects
→ GET/PATCH/DELETE    /v1/projects/{projectId}
→ GET/POST           /v1/projects/{projectId}/documents
→ GET/PATCH/DELETE    /v1/projects/{projectId}/documents/{documentId}
→ GET/POST           /v1/documents/{documentId}/comments
→ DELETE             /v1/comments/{commentId}
→ POST               /v1/projects/{projectId}/archive  (action)
```

---

## MULTI-PROTOCOL ARCHITECTURE (2026 Pattern)

Most production systems in 2026 use multiple API protocols, each for its strength:

```
┌─────────────────────────────────────────────────────────┐
│                    API Gateway / Edge                    │
├─────────────────┬──────────────┬────────────────────────┤
│  tRPC v11       │  REST        │  WebSocket / SSE       │
│  Internal APIs  │  Public APIs │  Real-time             │
│  Type-safe      │  Standard    │  Events                │
│  Frontend ↔ BFF │  3rd-party   │  Live updates          │
├─────────────────┴──────────────┴────────────────────────┤
│              Shared Business Logic Layer                 │
├─────────────────────────────────────────────────────────┤
│  PostgreSQL + Redis + Vector Store + Queue              │
└─────────────────────────────────────────────────────────┘
```

### When to Use What
| Protocol | Use For | Example |
|----------|---------|---------|
| **tRPC** | Internal frontend-to-backend calls in TypeScript monorepos | Dashboard CRUD, form submissions, data fetching |
| **REST** | Public APIs, webhooks, third-party integrations | `/v1/api/users`, webhook callbacks |
| **WebSocket** | Bidirectional real-time: chat, collaboration, presence | Chat messages, cursor positions, live editing |
| **SSE** | Server-to-client streaming: notifications, LLM responses | AI chat streaming, live activity feed |
| **gRPC** | Microservice-to-microservice, high throughput | Internal service mesh, data pipelines |
| **Server Actions** | Next.js form mutations (simple, co-located) | Contact form, settings update |

### Implementation Pattern
```typescript
// tRPC for internal (type-safe, no schema maintenance)
const appRouter = router({
  user: router({
    list: publicProcedure.query(() => db.query.users.findMany()),
    create: protectedProcedure.input(createUserSchema).mutation(({ input }) => ...),
  }),
});

// REST for public API (OpenAPI spec, versioned)
app.get('/v1/users', authMiddleware, async (c) => {
  const users = await db.query.users.findMany();
  return c.json({ data: users });
});

// SSE for streaming (LLM responses)
app.get('/v1/chat/stream', async (c) => {
  return streamSSE(c, async (stream) => {
    for await (const chunk of llmStream) {
      await stream.writeSSE({ data: chunk });
    }
  });
});
```

---

## SYSTEM DESIGN API EXAMPLES

### Ride-Sharing (Uber Pattern)
```
# Rider Flow
POST   /v1/rides/estimate           # Get fare estimate (origin, destination)
POST   /v1/rides                    # Request a ride
GET    /v1/rides/{rideId}           # Ride status (polling or WebSocket)
POST   /v1/rides/{rideId}/cancel    # Cancel ride
POST   /v1/rides/{rideId}/rate      # Rate driver after ride

# Driver Flow
PATCH  /v1/drivers/me/status        # Go online/offline
GET    /v1/drivers/me/requests      # Get ride requests (WebSocket preferred)
POST   /v1/rides/{rideId}/accept    # Accept ride request
PATCH  /v1/rides/{rideId}/arrive    # Mark arrived at pickup
PATCH  /v1/rides/{rideId}/start     # Start ride (pickup confirmed)
PATCH  /v1/rides/{rideId}/complete  # End ride (drop-off confirmed)

# Real-time: WebSocket for driver location + ride status
WS     /v1/ws/ride/{rideId}         # Live location stream (3-5 sec GPS updates)

# Key patterns:
# - Surge pricing: cached in Redis, recalculated every 30 seconds per zone
# - Driver matching: geospatial query (PostGIS) within radius, sorted by ETA
# - Idempotency: ride requests use client-generated idempotency key
```

### Streaming Service (Netflix Pattern)
```
# Content Discovery
GET    /v1/catalog                   # Browse catalog (filters, genres, search)
GET    /v1/catalog/{contentId}       # Content details + episodes
GET    /v1/recommendations           # Personalized recommendations (ML-based)
GET    /v1/continue-watching         # Resume list (sorted by last watched)

# Playback
POST   /v1/playback/sessions         # Start playback session (returns stream URL + DRM token)
PATCH  /v1/playback/sessions/{id}    # Update progress (heartbeat every 30s)
DELETE /v1/playback/sessions/{id}    # End session (release concurrent stream slot)

# Key patterns:
# - CDN: Content served from edge (CloudFront/Fastly), API only handles metadata
# - Concurrent streams: Redis counter per subscription plan (basic=1, premium=4)
# - Adaptive bitrate: Client requests manifest, selects quality based on bandwidth
# - Progress tracking: Debounced writes to Redis, flushed to PostgreSQL every 5 min
```

---

## QUALITY CHECKS

**Done right:**
- Every entity has appropriate CRUD endpoints
- Consistent URL naming (plural nouns, lowercase, hyphens)
- Error responses follow standard format with codes
- Authentication pattern specified for each endpoint group
- Pagination on all list endpoints
- Rate limiting strategy defined

**Done wrong:**
- Verbs in URLs (`/getUsers`, `/createProject`)
- Inconsistent casing (`/userStories` mixed with `/api-keys`)
- No error format specification
- Missing authentication requirements
- No pagination on list endpoints
- 200 status code for everything

---

## INDUSTRY-SPECIFIC ENDPOINT PATTERNS

### Healthcare (FHIR-Inspired REST)
```
# Patient Management
GET    /v1/patients                      # Search patients (name, MRN, DOB)
POST   /v1/patients                      # Register new patient
GET    /v1/patients/{patientId}          # Get patient demographics
PATCH  /v1/patients/{patientId}          # Update patient info

# Clinical Encounters
POST   /v1/patients/{patientId}/encounters         # Start encounter
GET    /v1/patients/{patientId}/encounters          # List encounters (date range)
GET    /v1/encounters/{encounterId}                 # Get encounter details
PATCH  /v1/encounters/{encounterId}                 # Update/close encounter

# Observations (Vitals, Lab Results)
POST   /v1/encounters/{encounterId}/observations    # Record observation
GET    /v1/patients/{patientId}/observations         # Patient history (by code, date)
GET    /v1/patients/{patientId}/observations?code=85354-9  # Blood pressure history

# Medications
GET    /v1/patients/{patientId}/medications          # Active medication list
POST   /v1/patients/{patientId}/medication-requests   # New prescription
POST   /v1/medication-requests/{id}/dispense          # Mark as dispensed

# Auth: OAuth 2.0 + SMART on FHIR scopes
# Every endpoint: X-Audit-Reason header (mandatory for HIPAA)
```

### Fintech
```
# Accounts
GET    /v1/accounts                      # List user accounts
POST   /v1/accounts                      # Open new account
GET    /v1/accounts/{accountId}/balance   # Real-time balance

# Transactions
GET    /v1/accounts/{accountId}/transactions   # Transaction history (paginated)
POST   /v1/transfers                           # Initiate transfer
GET    /v1/transfers/{transferId}              # Transfer status

# Payments (Stripe Connect / multi-party)
POST   /v1/payment-intents                     # Create payment
POST   /v1/payment-intents/{id}/capture        # Capture authorized payment
POST   /v1/payment-intents/{id}/refund         # Issue refund

# KYC/Compliance
POST   /v1/customers/{id}/kyc-verification     # Submit identity docs
GET    /v1/customers/{id}/kyc-status            # Check verification status

# Idempotency: ALL POST endpoints require Idempotency-Key header
# Rate limit: Stricter on /transfers (10/min) vs /accounts (100/min)
```

### Marketplace Payment Flows (Stripe Connect)
```
# Seller Onboarding (OAuth)
POST   /v1/sellers/connect                  # Create Stripe connected account
GET    /v1/sellers/{sellerId}/onboarding-url # Get Stripe onboarding link
GET    /v1/sellers/{sellerId}/payout-status  # Check if payouts enabled

# Checkout with Escrow
POST   /v1/checkout/sessions                # Create checkout (funds held)
POST   /v1/orders/{orderId}/confirm-delivery # Release funds to seller
POST   /v1/orders/{orderId}/dispute          # Buyer opens dispute (funds frozen)
POST   /v1/disputes/{disputeId}/resolve      # Admin resolves dispute

# Payouts
GET    /v1/sellers/{sellerId}/payouts        # Payout history
POST   /v1/sellers/{sellerId}/payouts/manual # Trigger manual payout
```

### E-Commerce
```
# Catalog
GET    /v1/products                     # List (filter: category, price, search)
GET    /v1/products/{slug}              # Product detail
GET    /v1/products/{id}/variants       # Size/color variants

# Cart
GET    /v1/cart                          # Get current cart
POST   /v1/cart/items                    # Add item
PATCH  /v1/cart/items/{itemId}           # Update quantity
DELETE /v1/cart/items/{itemId}           # Remove item
POST   /v1/cart/apply-promo              # Apply promo code

# Orders
POST   /v1/orders                        # Place order (from cart)
GET    /v1/orders/{orderId}              # Order status
GET    /v1/orders/{orderId}/tracking     # Shipping tracking
POST   /v1/orders/{orderId}/returns      # Initiate return
```

### Education / LMS
```
# Courses
GET    /v1/courses                           # List courses (filter: category, level, instructor)
POST   /v1/courses                           # Create course (instructor)
GET    /v1/courses/{courseId}                 # Course detail + modules
PATCH  /v1/courses/{courseId}                 # Update course
POST   /v1/courses/{courseId}/publish         # Publish course

# Enrollment
POST   /v1/courses/{courseId}/enroll         # Student enrolls
GET    /v1/enrollments                       # My enrollments (student)
GET    /v1/courses/{courseId}/roster          # Course roster (instructor)
DELETE /v1/enrollments/{enrollmentId}        # Drop course

# Content & Progress
GET    /v1/courses/{courseId}/modules/{moduleId}/lessons  # List lessons
GET    /v1/lessons/{lessonId}                             # Get lesson content
POST   /v1/lessons/{lessonId}/progress                    # Mark progress (started/completed)
GET    /v1/courses/{courseId}/progress                     # My course progress

# Assignments & Grading
POST   /v1/lessons/{lessonId}/submissions    # Submit assignment
GET    /v1/submissions/{submissionId}        # Get submission + grade
PATCH  /v1/submissions/{submissionId}/grade  # Grade submission (instructor)

# LTI Integration (external tools)
POST   /v1/lti/launch                        # LTI 1.3 launch endpoint
POST   /v1/lti/deep-link                     # LTI deep linking callback
GET    /v1/lti/jwks                          # Public key for LTI validation
```

### Automotive / Dealer Management
```
# Vehicle Inventory
GET    /v1/vehicles                          # Search inventory (make, model, year, price, status)
POST   /v1/vehicles                          # Add vehicle to inventory
GET    /v1/vehicles/{vehicleId}              # Vehicle detail (decoded VIN)
PATCH  /v1/vehicles/{vehicleId}              # Update vehicle
POST   /v1/vehicles/{vehicleId}/photos       # Upload vehicle photos

# VIN Services
GET    /v1/vin/{vin}/decode                  # Decode VIN (make, model, year, trim, specs)
GET    /v1/vin/{vin}/history                 # Vehicle history (Carfax/AutoCheck integration)
GET    /v1/vin/{vin}/market-value            # Market value estimate

# Sales / Deals
POST   /v1/leads                             # Create lead (web form, phone, walk-in)
GET    /v1/leads                             # List leads (filter: status, salesperson, source)
PATCH  /v1/leads/{leadId}                    # Update lead status
POST   /v1/deals                             # Start deal (vehicle + buyer)
PATCH  /v1/deals/{dealId}                    # Update deal (pricing, trade-in, financing)
POST   /v1/deals/{dealId}/desking            # Generate deal worksheet (payment scenarios)

# Service Department
POST   /v1/service/appointments              # Schedule service
GET    /v1/service/appointments              # List appointments (date, status, advisor)
PATCH  /v1/service/appointments/{id}         # Update appointment
POST   /v1/service/orders                    # Create service order (RO - repair order)
POST   /v1/service/orders/{id}/line-items    # Add parts/labor to RO
POST   /v1/service/orders/{id}/complete      # Close repair order
```

### Logistics / Supply Chain
```
# Shipments
POST   /v1/shipments                         # Create shipment (origin, dest, items)
GET    /v1/shipments                         # List shipments (filter: status, carrier, date)
GET    /v1/shipments/{shipmentId}            # Shipment detail + current status
GET    /v1/shipments/{shipmentId}/tracking   # Full tracking event history
POST   /v1/shipments/{shipmentId}/cancel     # Cancel shipment

# Shipping Rates
POST   /v1/rates/quote                       # Get shipping rate quotes (multi-carrier)
GET    /v1/rates/carriers                    # Available carriers + services

# Labels & Documents
POST   /v1/shipments/{shipmentId}/labels     # Generate shipping label (returns PDF/ZPL)
GET    /v1/shipments/{shipmentId}/documents   # List documents (BOL, customs, invoice)

# Inventory / Warehouse
GET    /v1/inventory                         # List inventory (filter: warehouse, SKU, status)
GET    /v1/inventory/{sku}/stock             # Stock levels across warehouses
POST   /v1/inventory/adjustments             # Stock adjustment (receive, count, damage)
POST   /v1/fulfillment/orders               # Create fulfillment order (pick-pack-ship)
GET    /v1/fulfillment/orders/{id}           # Fulfillment status

# Webhooks (carrier callbacks)
POST   /v1/webhooks/tracking-update          # Carrier pushes tracking events
POST   /v1/webhooks/delivery-confirmation    # Proof of delivery callback

# Key patterns:
# - Rate shopping: POST to /rates/quote returns sorted array from multiple carriers
# - Label format: Accept header determines format (application/pdf vs application/zpl)
# - Tracking: Polling via GET or webhook-push from carrier (preferred)
```

### Insurance
```
# Quoting
POST   /v1/quotes                            # Request insurance quote (risk data)
GET    /v1/quotes/{quoteId}                  # Get quote detail + premium breakdown
POST   /v1/quotes/{quoteId}/bind             # Bind quote → create policy
GET    /v1/products                          # Available insurance products (auto, home, etc.)

# Policies
GET    /v1/policies                          # List policyholder's policies
GET    /v1/policies/{policyId}               # Policy detail (coverages, premium, docs)
POST   /v1/policies/{policyId}/endorsements  # Request policy change (add driver, update address)
POST   /v1/policies/{policyId}/renew         # Initiate renewal
POST   /v1/policies/{policyId}/cancel        # Request cancellation

# Claims (FNOL = First Notice of Loss)
POST   /v1/claims                            # File a claim (FNOL)
GET    /v1/claims/{claimId}                  # Claim status + history
POST   /v1/claims/{claimId}/documents        # Upload supporting documents (photos, police report)
GET    /v1/claims/{claimId}/events           # Claim event timeline
POST   /v1/claims/{claimId}/payment          # Process claim payment

# Billing
GET    /v1/policies/{policyId}/billing       # Billing schedule + payment history
POST   /v1/policies/{policyId}/payments      # Make premium payment

# Key patterns:
# - Quote → Bind flow: two-step (evaluate risk, then commit)
# - Claims state machine: FNOL → Investigation → Evaluation → Settlement → Closed
# - Policy versioning: every endorsement creates a new version (never mutate)
# - Idempotency: required on all POST endpoints (duplicate claim prevention)
```

### Hospitality / Travel
```
# Properties / Listings
GET    /v1/properties                        # Search (location, dates, guests, price, amenities)
GET    /v1/properties/{propertyId}           # Property detail + rooms + reviews
GET    /v1/properties/{propertyId}/availability  # Availability calendar (date range)
GET    /v1/properties/{propertyId}/pricing   # Dynamic pricing for date range

# Bookings
POST   /v1/bookings                          # Create reservation (dates, guests, room)
GET    /v1/bookings/{bookingId}              # Booking detail
PATCH  /v1/bookings/{bookingId}              # Modify booking (dates, guests)
POST   /v1/bookings/{bookingId}/cancel       # Cancel booking (refund per cancellation policy)
POST   /v1/bookings/{bookingId}/check-in     # Guest check-in
POST   /v1/bookings/{bookingId}/check-out    # Guest check-out

# Reviews
POST   /v1/bookings/{bookingId}/review       # Leave review (only after checkout)
GET    /v1/properties/{propertyId}/reviews   # Property reviews (paginated, sorted)

# Host Management
GET    /v1/host/properties                   # My listed properties
PATCH  /v1/host/properties/{id}/availability # Bulk update availability/pricing
GET    /v1/host/bookings                     # Incoming bookings
GET    /v1/host/earnings                     # Payout summary

# Key patterns:
# - Search: geo-bounding box + date range filter (available rooms for dates)
# - Availability: calendar-based (per room per date), not quantity-based
# - Pricing: dynamic per-night rate (weekday/weekend, seasonal, demand-based)
# - Double-booking prevention: optimistic lock on availability during checkout
```
