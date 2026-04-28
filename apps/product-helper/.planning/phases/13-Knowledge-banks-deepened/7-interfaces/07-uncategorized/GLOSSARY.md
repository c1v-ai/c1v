# Module 6 Glossary — Defining Interfaces

> Alphabetical reference of all interface definition terms used in this module. Cross-references indicate which instruction file or knowledge bank introduces each term.

---

**API Contract** — The formal specification of how two services communicate, including endpoint path, HTTP method, request/response schemas, authentication, error codes, and SLAs. The software equivalent of a hardware interface specification document. See [API Design KB](api-design-sys-design-kb.md).

**AsyncAPI** — A standard format for documenting asynchronous message interfaces (queues, events, pub/sub topics). The async counterpart to OpenAPI/Swagger. See [Message Queues KB](message-queues-kb.md).

**Asynchronous Interface** — An interface where the sender publishes a message and continues without waiting for a response (e.g., message queue event, webhook callback). Decouples latency and failure between producer and consumer. See [Message Queues KB](message-queues-kb.md) and Step 10 (async checkout pattern).

**Circuit Breaker** — A resiliency pattern that stops calling a failing service after repeated failures, preventing cascade failures across interfaces. When open, the circuit breaker returns a fallback response immediately instead of waiting for a timeout. See [Resiliency Patterns KB](resilliency-patterns-kb.md).

**Control Loop** — A feedback mechanism where a subsystem monitors its output and adjusts its behavior. In software, this manifests as health checks, autoscaling triggers, and circuit breaker state transitions. See Step 02 and [Observability KB](observability-kb.md).

**CRC Cards** — Class-Responsibility-Collaboration cards. A lightweight technique where each card represents a subsystem (or class), listing its responsibilities and which other subsystems it collaborates with. Used to discover interfaces through team discussion. See Step 05.

**Critical Subsystem** — A subsystem whose failure causes disproportionate system-wide impact. Identified by the number and importance of its interfaces. In the e-commerce platform, the Order Service is critical because it orchestrates Cart, Payment, and Notification during checkout. See Step 04 (N² Chart density analysis).

**DFD (Data Flow Diagram)** — A diagram showing how data moves between subsystems, external actors, and data stores. Used as the first brainstorming technique for discovering interfaces. See Step 03.

**Design Interface** — An interface that exists because of how the system is designed (architectural choice), rather than being inherent to the problem. For example, the Cart Service → Order Service interface exists because cart and order are separate microservices; a monolith would not have this interface. See Step 01.

**Error Budget** — The acceptable amount of downtime or errors for a service, derived from its SLO (Service Level Objective). For example, a 99.9% availability SLO allows ~43 minutes of downtime per month. When the error budget is exhausted, teams prioritize reliability over new features. See [software_architecture_system.md](software_architecture_system.md).

**Idempotency Key** — A unique identifier sent with a request so that retries do not cause duplicate operations (e.g., double-charging a customer). Critical for payment interfaces where network failures may cause a request to be sent more than once. See [API Design KB](api-design-sys-design-kb.md) and [Resiliency Patterns KB](resilliency-patterns-kb.md).

**Interface** — A point where two subsystems exchange data, commands, events, or shared state. Every service boundary is an interface boundary. The central concept of this module. See Step 01.

**Interface Champion** — The designated person responsible for mediating disagreements, signing off on changes, and approving test conditions for a specific interface specification. Selected based on their ability to understand the impact on all involved subsystems. See Step 10.

**Interface Matrix** — A multi-tab spreadsheet (one tab per subsystem) that serves as the single source of truth for all interface specifications. Contains values, units, tracking metadata, champion assignments, Provided To/Received From markings, and budget tracking. The culminating artifact of this module. See Steps 08–11.

**Interface Specification** — A single measurable property of an interface (e.g., endpoint path, response time SLA, auth method, rate limit, payload size). Each specification has a value, units, owner, status, and timeline. See Steps 08–09.

**Latency Budget** — The maximum acceptable response time for an end-to-end user flow, allocated across the services in the critical path. The interface design equivalent of a weight budget in hardware systems. When the sum of subsystem latencies exceeds the budget, teams must optimize or restructure. See Step 11.

**N² Chart (N-Squared Chart)** — A matrix with subsystems on both axes. Each cell at the intersection of row i and column j describes the interface from subsystem i to subsystem j. Used to formalize all pairwise interfaces. See Step 04.

**OpenAPI/Swagger** — A standard format for documenting REST API interfaces, including endpoints, HTTP methods, request/response schemas, authentication, and error codes. The most widely adopted API specification standard. See [API Design KB](api-design-sys-design-kb.md).

**Operational Interface** — An interface that is inherent to the system's function (it would exist regardless of design choices). For example, the Customer → Storefront interface exists because any e-commerce system must accept user requests. See Step 01.

**Provided To** — A marking in the Interface Matrix indicating that a subsystem provides a particular interface specification to another subsystem. The complement of "Received From." See Step 08.

**Received From** — A marking in the Interface Matrix indicating that a subsystem receives a particular interface specification from another subsystem. Added in the Enhancement step to give each team a complete view. The complement of "Provided To." See Step 11.

**Sequence Diagram** — A UML diagram showing the order of messages exchanged between subsystems over time, read top-to-bottom. Used to describe interface interactions and discover timing dependencies. See Steps 06–07.

**Service Boundary** — The line where one service's responsibility ends and another's begins. Every service boundary is an interface boundary. In microservices, service boundaries are typically defined by business domain (e.g., Cart vs. Order) and enforced by network calls. See Step 01.

**Subsystem** — A distinct component of the system with defined responsibilities and interfaces to other subsystems. In the e-commerce platform: Storefront Service, Search Service, Cart Service, Order Service, Payment Service, and Notification Service. See Step 01 and [Module Overview](00%20-%20Module%20Overview.md).

**Synchronous Interface** — An interface where the sender blocks and waits for a response before continuing (e.g., REST API call, gRPC call). Latency is additive across synchronous chains — a checkout flow calling Cart (100ms) then Payment (400ms) synchronously takes at least 500ms. See Step 10 (SLA disagreement example) and [API Design KB](api-design-sys-design-kb.md).

**System Flow** — The end-to-end path that data or a request takes through the system, crossing multiple subsystem interfaces. The checkout flow (Storefront → Cart → Order → Payment → Notification) is an example. See Steps 03 and 06.

**Target Budget** — The goal or constraint value for a shared resource (latency, cost, rate limits), set by stakeholders or project leadership. Compared against True Budget to detect overruns. See Step 11.

**True Budget** — The current actual value of a shared resource allocation, updated as the design evolves. When True Budget exceeds Target Budget, the overrun must be addressed. See Step 11.

---

**Back to** [Module Overview](00%20-%20Module%20Overview.md) | **Previous** [11 — Interface Matrix Enhancements](11%20-%20Interface%20Matrix%20Enhancements.md)
