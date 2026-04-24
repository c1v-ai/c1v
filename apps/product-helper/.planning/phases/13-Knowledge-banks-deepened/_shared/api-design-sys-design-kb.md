# API Design — Protocols, Patterns, and Best Practices

## Context (Why This Matters)

An API (Application Programming Interface) defines how software components communicate using a set of rules and protocols. In any system, the client talks to the server, the server talks to the database, and internal services talk to each other — all through APIs. The API is the **contract** between components. A well-designed API is intuitive, consistent, and scalable. A poorly designed one creates confusion, security vulnerabilities, and technical debt that compounds with every consumer.

## API Protocols — When to Use What

| Protocol | Use Case | Default? |
|----------|----------|----------|
| **REST** | Client-to-server (external APIs) | Yes — default choice for ~95% of cases |
| **GraphQL** | Client-to-server when clients need flexible, nested data queries | No — use when REST creates overfetching/underfetching problems |
| **RPC (gRPC)** | Service-to-service (internal microservice communication) | Default for internal APIs |
| **WebSocket / SSE** | Real-time bidirectional or server-push communication | When you need live updates (chat, notifications, live feeds) |

---

## REST (Representational State Transfer)

REST is built around **resources** (nouns) and **HTTP methods** (verbs). Resources are the data entities your system manages; HTTP methods define what action to take on them.

### Resources

Resources are represented in the URL path and map directly to your system's core entities.

```
GET    /events          → all events
GET    /events/123      → event with ID 123
GET    /events/123/tickets  → all tickets for event 123
GET    /venues           → all venues
```

**Rules:**
- Resources are always **plural nouns** — `/events`, `/venues`, `/tickets`
- Never put verbs in the URL — `POST /events/create` is wrong; `POST /events` is correct
- The HTTP method expresses the action, not the URL

### HTTP Methods

| Method | Purpose | Idempotent? | Example |
|--------|---------|------------|---------|
| **GET** | Retrieve data | Yes | `GET /events/123` → returns event 123 |
| **POST** | Create new data | No — calling it twice creates two resources | `POST /events` with body `{title, date, ...}` |
| **PUT** | Replace/update entire resource | Yes — calling it multiple times yields same result | `PUT /events/123` with full event object |
| **PATCH** | Partial update | Yes | `PATCH /events/123` with `{date: "2026-06-01"}` |
| **DELETE** | Remove a resource | Yes | `DELETE /events/123` |

**In practice:** GET and POST cover the vast majority of use cases. Don't overthink PUT vs. PATCH vs. POST — what matters is clarity of intent.

### Input Parameters

Inputs come in three forms, each with a clear use case:

| Form | When to Use | Example |
|------|------------|---------|
| **Path parameters** | Required to identify the resource | `GET /events/123` — can't fetch the event without the ID |
| **Query parameters** | Optional filters, sorting, pagination | `GET /events?city=LA&date=2026-01-01` |
| **Request body** | Sending data for creation or update (POST, PUT, PATCH) | `POST /events` with JSON body `{title: "...", date: "..."}` |

**Rule of thumb:**
- Required to identify? → Path parameter
- Optional filter? → Query parameter
- Sending data? → Request body

### Response Format

Responses have two parts:

1. **Status code** — indicates success or failure
2. **Response body** — the requested data, typically JSON

**Status code groups:**

| Code | Meaning | Examples |
|------|---------|---------|
| **2xx** | Success | 200 OK, 201 Created |
| **4xx** | Client error (bad request) | 400 Bad Request, 401 Unauthorized, 404 Not Found |
| **5xx** | Server error | 500 Internal Server Error, 503 Service Unavailable |

---

## GraphQL

GraphQL was created by Facebook in 2012 to solve two REST inefficiencies during the mobile revolution:

| REST Problem | GraphQL Solution |
|-------------|-----------------|
| **Overfetching** — endpoint returns more data than the client needs | Client specifies exactly which fields to return |
| **Underfetching** — getting related data requires multiple round trips | Client nests related data in a single query |

### How It Works

All requests go to a **single endpoint** via POST. The query body specifies exactly what data is needed:

```graphql
POST /graphql

{
  event(id: "123") {
    name
    date
    venue {
      name
      address
    }
    tickets {
      section
      price
      available
    }
  }
}
```

With REST, this would require three separate requests: `GET /events/123`, `GET /venues/{venueId}`, `GET /events/123/tickets`. GraphQL collapses them into one.

### Key Considerations

**N+1 Problem:** If you query the top 100 events and each needs its venue, a naive implementation makes 1 query for events + 100 queries for venues = 101 queries. **Solution:** Use a DataLoader to batch venue IDs into a single query.

**Field-Level Authorization:** Unlike REST (which secures entire endpoints), GraphQL can enforce permissions per field. Example: all users see an event's name and date, but only admins see revenue data. This is handled by schema resolvers.

**When to use GraphQL over REST:**
- Multiple client types (web, mobile, third-party) need different data shapes from the same entities
- Deeply nested or related data that would require many REST round trips
- Rapid frontend iteration where the backend API should not need to change for every new UI view

---

## RPC / gRPC (Remote Procedure Call)

RPC is designed for **service-to-service** communication within your backend. Instead of resources and URLs, RPC models the API as **function calls on a remote service**.

```
// RPC style — looks like calling a local function
getEvent(eventId: "123") → Event
createBooking(eventId: "123", userId: "456") → Booking
getAvailableTickets(eventId: "123") → [Ticket]
```

### Why RPC Is Faster Than REST

| REST | gRPC |
|------|------|
| HTTP headers, status codes, URL parsing | Direct function calls |
| JSON (human-readable text) | Protocol Buffers (compact binary) — 5–10x smaller payloads |
| Every client must understand HTTP conventions | Both sides agree on a shared `.proto` schema |

### Why Not Use RPC for External APIs?

REST uses standard HTTP that every browser, mobile app, and third-party developer already understands. RPC requires both sides to share the protocol definition (`.proto` files) and use compatible tooling. This is easy when you control both services (internal microservices) but impractical for external consumers.

**Rule:** REST for external APIs, gRPC for internal service-to-service communication.

### Protocol Buffers (Protobuf)

gRPC uses Protobuf to define the service contract:

```protobuf
service TicketService {
  rpc GetEvent(GetEventRequest) returns (Event);
  rpc CreateBooking(CreateBookingRequest) returns (Booking);
  rpc GetAvailableTickets(GetTicketsRequest) returns (TicketList);
}

message GetEventRequest {
  string event_id = 1;
}

message Event {
  string event_id = 1;
  string name = 2;
  string date = 3;
}
```

gRPC auto-generates client and server code in multiple languages from this definition, enabling a Python service to call a Java service as if it were a local function.

---

## Pagination

Any endpoint that returns a list of resources needs pagination to avoid returning massive payloads.

### Offset-Based (Page-Based)

```
GET /events?page=1&limit=25    → items 1-25
GET /events?page=2&limit=25    → items 26-50
```

| Pros | Cons |
|------|------|
| Simple to implement | Unstable under writes — new items shift pages, causing duplicates or skips |
| Easy to jump to any page | Performance degrades on deep pages (large OFFSET in SQL) |

**Use when:** Write frequency is low and users don't need perfectly stable pagination.

### Cursor-Based

```
GET /events?limit=25                        → first 25 items + last item ID
GET /events?limit=25&cursor=evt_abc123      → next 25 items after evt_abc123
```

| Pros | Cons |
|------|------|
| Stable under concurrent writes — cursor anchors to a specific item | Cannot jump to arbitrary pages |
| Efficient at any depth (no OFFSET) | Slightly more complex to implement |

**Use when:** Data changes frequently (feeds, timelines, real-time lists) or lists are very large.

---

## API Security

### Authentication

Every API call that modifies data or accesses private data should require authentication. Authentication tokens are passed in the **HTTP header**, never in the request body or URL.

| Method | How It Works | Trade-Off |
|--------|-------------|-----------|
| **JWT (JSON Web Token)** | Self-contained signed token with user info (role, name, expiry). Server verifies the signature without a database lookup. | Stateless and fast, but cannot be revoked until expiry |
| **Session Token** | Opaque ID sent in the header. Server looks up session data in a database or cache. | Revocable immediately, but requires a lookup on every request |

### Authorization and Identity

**Critical mistake to avoid:** Never use a `userId` from the request body to determine who is performing an action. A malicious user could submit someone else's ID.

```
// BAD — userId in body can be spoofed
POST /tweets
{ "text": "Hello world", "userId": "456" }

// GOOD — identity comes from the authenticated session/JWT in the header
POST /tweets
{ "text": "Hello world" }
// Server extracts userId from the JWT/session token in the Authorization header
```

**Rule:** The authenticated identity (who is making the request) always comes from the token in the header. The request body contains only the *content* of the action.

### Endpoint Security Annotations

When designing APIs, note which endpoints require authentication and what role:

```
GET  /events              → public (no auth)
GET  /events/123          → public
POST /events              → admin only (auth + role check)
POST /events/123/bookings → authenticated users
```

---

## API Gateway

An API Gateway is a thin layer that sits between clients and your backend microservices. It provides a **single entry point** for all client requests and handles cross-cutting concerns so that individual services can focus purely on business logic.

### Why API Gateways Exist

| Era | Architecture | Problem |
|-----|-------------|---------|
| **2000s** | Monolith | Simple — one URL, one server, one codebase. No routing problem. |
| **2010–2012** | Microservices (no gateway) | Clients must know the URL of every service, or one service must route for all others. Changing routing requires redeploying a service. |
| **2013–present** | Microservices + API Gateway | Clients hit one endpoint. Gateway routes to the correct service. Shared concerns (auth, rate limiting, logging) live in the gateway instead of being duplicated across every service. |

### What the Gateway Does (Request Lifecycle)

```
Client Request
    ↓
1. REQUEST VALIDATION — correct headers, body format, required fields
    ↓
2. MIDDLEWARE — auth token verification, rate limiting (e.g., Redis check),
                logging, metrics, TLS termination
    ↓
3. ROUTING — look up path in routing config, forward to correct service
    ↓
4. RESPONSE TRANSFORMATION — convert internal format (e.g., gRPC/protobuf)
                             to client format (e.g., REST/JSON)
    ↓
Client Response
```

### Routing Configuration

The gateway maintains a routing map — a simple config that maps URL paths to backend services:

```
/events/*     → event-service:8080
/tickets/*    → ticket-service:8081
/messages/*   → messaging-service:8082
/users/*      → user-service:8083
```

### Gateway Middleware Responsibilities

| Concern | What It Does |
|---------|-------------|
| **Authentication** | Verify JWT/session tokens before the request reaches any service |
| **Rate limiting** | Throttle abusive clients (often backed by Redis) |
| **TLS termination** | Handle HTTPS at the edge so internal traffic can be plain HTTP |
| **Logging & metrics** | Capture request/response metadata for observability |
| **Response caching** | Cache common responses to reduce backend load |
| **Protocol translation** | Convert between REST (client-facing) and gRPC (internal) |

### Common API Gateway Technologies

| Type | Examples |
|------|---------|
| **Managed (cloud)** | AWS API Gateway, Azure API Management, Google Cloud API Gateway |
| **Open source** | Kong, Tyk, Express Gateway, Envoy, NGINX |

---

## Decision Framework

When designing an API for a system:

1. **Identify your core entities** (resources/nouns) — events, users, tickets, venues, etc.
2. **Choose the protocol:**
   - External API? → REST (default) or GraphQL (if multiple clients need flexible queries)
   - Internal service-to-service? → gRPC
   - Real-time updates? → WebSocket or SSE
3. **Define endpoints** using HTTP methods and resource paths (for REST)
4. **Specify inputs:** path params (required identifiers), query params (optional filters), body (data payloads)
5. **Add pagination** to any list endpoint
6. **Annotate security:** which endpoints need auth, which need specific roles
7. **Place an API Gateway** in front of microservices for routing, auth, rate limiting, and protocol translation

## Validation Checklist

- [ ] I can explain the difference between REST, GraphQL, and RPC and when to use each.
- [ ] I can design REST endpoints using plural noun resources and appropriate HTTP methods.
- [ ] I can distinguish path parameters, query parameters, and request body and know when to use each.
- [ ] I can explain overfetching/underfetching and how GraphQL solves them.
- [ ] I can describe the N+1 problem in GraphQL and the DataLoader solution.
- [ ] I can explain why gRPC is faster than REST and why it is used for internal, not external, APIs.
- [ ] I can choose between offset-based and cursor-based pagination and justify the choice.
- [ ] I can explain JWT vs. session token authentication.
- [ ] I know never to use a userId from the request body for authorization — identity comes from the header token.
- [ ] I can explain what an API Gateway does and why it exists in a microservices architecture.
- [ ] I can describe the four stages of gateway request processing (validate, middleware, route, transform).