# Resiliency Patterns — Designing Systems That Survive Failure

## Context (Why This Matters)

Resiliency is the capability of a system to return to its operational state after a failure. In distributed systems, failures are not exceptional — they are inevitable. Services crash, networks partition, dependencies slow down, and traffic spikes overwhelm capacity. A resilient system minimizes the **blast radius** of each failure and recovers quickly, while a fragile system cascades one failure into a total outage.

The core question is not "will my system fail?" but **"when it fails, what happens to the user?"**

| Approach | User Experience | Business Impact |
|----------|----------------|-----------------|
| **False promises** | System charges for items that are out of stock, then refunds later | Users lose trust — they leave |
| **Hard failure** | System returns an error and refuses to serve until the dependency recovers | Users are blocked — lost revenue during downtime |
| **Graceful degradation** | System continues operating with reduced functionality (e.g., skips non-critical checks, serves cached data) | Users get a slightly degraded but working experience |

Resilient systems choose graceful degradation wherever possible.

## Measuring Resiliency

| Metric | Definition | Example |
|--------|-----------|---------|
| **MTTR** (Mean Time To Recover) | Average time a service is unavailable after a failure | Service goes down at 1:00 PM, recovers at 1:05 PM → MTTR = 5 minutes |
| **RTO** (Recovery Time Objective) | Maximum acceptable time to restore a **critical** service after disruption | "Payment service must be restored within 3 minutes" |
| **RPO** (Recovery Point Objective) | Maximum acceptable amount of **data loss** measured in time | "We can lose at most 1 minute of transaction data" (i.e., backups are at most 1 minute old) |
| **Resilience Ratio** | Ratio of actual impact to potential impact of a disruption | Service down 1 minute at 100 QPS = 6,000 potential lost requests. Actual lost = 3,600. Ratio = 0.6 (40% of impact was mitigated) |

**Critical vs non-critical services:** Not all services are equal. A payment service being down stops all revenue. An animation service being down is barely noticeable. RTO and resilience investment should be proportional to business criticality.

---

## Resilience Patterns

### 1. Timeouts

**Problem:** A request to a downstream service hangs indefinitely, tying up resources (threads, connections) in the calling service.

**Solution:** Set a maximum time to wait for a response. If the deadline passes, fail the request and free the resources.

```
Call service B with timeout = 2 seconds
  → Response received in 1.5s → success
  → No response after 2s → timeout error, move on
```

**Guidelines:**
- Every external call should have a timeout — no exceptions
- Set timeouts based on the downstream service's P99 latency (e.g., if P99 = 500ms, timeout at ~1–2 seconds)
- Propagate deadlines: if you have 5 seconds to respond to the user and call 3 services sequentially, each gets a fraction of the total budget

### 2. Retries with Exponential Backoff and Jitter

**Problem:** A transient failure (network blip, temporary overload) causes a request to fail. Simply retrying immediately may hit the same problem — and if many clients retry simultaneously, they create a **retry storm** that makes the problem worse.

**Solution:** Retry failed requests with increasing delays between attempts, plus random jitter to prevent synchronized retry waves.

```
Attempt 1: immediate
Attempt 2: wait 1s + random(0-500ms)
Attempt 3: wait 2s + random(0-500ms)
Attempt 4: wait 4s + random(0-500ms)
Give up after max retries
```

**Guidelines:**
- Only retry on **transient** errors (timeouts, 503s, network errors) — never on 400/401/404 (those won't fix themselves)
- Set a maximum retry count (typically 3–5)
- Use exponential backoff: delay doubles each attempt (1s, 2s, 4s, 8s...)
- Add jitter (random delay) so that thousands of clients don't all retry at the exact same second
- Make the operation **idempotent** if retrying — retrying a non-idempotent operation can cause duplicates

### 3. Circuit Breaker

**Problem:** A downstream service is down. Every request to it fails after the timeout period, wasting resources and adding latency. Hundreds of requests pile up waiting for a service that won't respond.

**Solution:** Track failure rates. When failures exceed a threshold, **open the circuit** — immediately reject requests to that service without even trying. Periodically test if the service has recovered.

**Three states:**

| State | Behavior | Transitions To |
|-------|----------|----------------|
| **Closed** (normal) | Requests pass through normally. Track failure count. | → Open (when failure threshold is exceeded) |
| **Open** (tripped) | All requests immediately fail without calling the downstream service. Return a fallback or error. | → Half-Open (after a cooldown period) |
| **Half-Open** (testing) | Allow a small number of test requests through. If they succeed, recovery is likely. | → Closed (if test requests succeed) or → Open (if they fail again) |

**Example:** Service B has failed 15 of the last 20 requests (75% failure rate, threshold is 50%).
- Circuit opens → all calls to Service B return immediately with a cached response or graceful error
- After 30 seconds, circuit goes half-open → 1 test request is sent to Service B
- If it succeeds → circuit closes, normal traffic resumes
- If it fails → circuit stays open for another 30 seconds

**Why it matters:** Without a circuit breaker, a single failing dependency can consume all your threads/connections waiting on timeouts, eventually bringing down the calling service too — a **cascading failure**.

### 4. Bulkhead (Failure Isolation)

**Problem:** One slow dependency consumes all available resources (threads, connections), starving healthy parts of the system. A slow image service takes all 200 threads, so even the fast user profile endpoint can't serve requests.

**Solution:** Partition resources so that one component's failure cannot exhaust another component's resources. Named after ship bulkheads — flooding one compartment doesn't sink the whole ship.

**Implementation approaches:**

| Approach | How It Works | Example |
|----------|-------------|---------|
| **Thread pool isolation** | Each dependency gets its own limited thread pool | Image service: max 50 threads. Profile service: max 100 threads. If images are slow, only 50 threads are stuck — profiles still work. |
| **Connection pool isolation** | Separate connection pools per downstream service | Database A: 20 connections. Database B: 20 connections. One slow DB doesn't exhaust the other's connections. |
| **Service isolation** | Deploy critical and non-critical services separately | Payment service runs on dedicated instances, separate from the recommendation engine |

### 5. Graceful Degradation

**Problem:** A dependency is unavailable or slow, but the system should still provide value to the user rather than failing entirely.

**Solution:** Identify which parts of a response are critical vs. optional. When a dependency fails, skip the optional parts and serve what you can.

**Examples:**

| Scenario | Full Experience | Degraded Experience |
|----------|----------------|-------------------|
| Product page | Price + reviews + recommendations + personalization | Price + reviews (recommendations service is down — hide the section) |
| News feed | Personalized feed computed in real-time | Cached feed from 5 minutes ago (ranking service is slow) |
| Checkout | Real-time inventory check → confirm → charge | Accept order optimistically → verify inventory async → refund if needed (only if inventory service is non-critical) |
| Search | Full-text search with ML ranking | Basic keyword search (ML ranking service is down — fall back to simpler algorithm) |

**Key principle:** Decide *in advance* which features can be dropped. Don't make this decision during an outage.

### 6. Rate Limiting and Throttling

**Problem:** A sudden traffic spike (legitimate or malicious) overwhelms the system.

**Solution:** Limit the number of requests a client or service can make within a time window.

**Common algorithms:**

| Algorithm | How It Works | Best For |
|-----------|-------------|----------|
| **Token bucket** | Tokens are added at a fixed rate. Each request consumes a token. If empty, request is rejected. | Allowing short bursts while enforcing average rate |
| **Sliding window** | Count requests in a rolling time window. Reject when count exceeds limit. | Smooth, predictable rate limiting |
| **Fixed window** | Count requests in fixed intervals (e.g., per minute). Reset at interval boundaries. | Simple to implement, but allows bursts at window boundaries |

**Where to enforce:** API Gateway (for external clients), service-to-service (for internal protection), or per-user/per-tenant.

### 7. Health Checks and Readiness Probes

**Problem:** A service is running but not healthy (e.g., lost database connection, out of memory, in a bad state). Load balancers continue sending traffic to it.

**Solution:** Implement health check endpoints that report whether the service can actually handle requests.

| Type | Purpose | Example |
|------|---------|---------|
| **Liveness probe** | "Is the process alive?" | Returns 200 if the server is running (even if unhealthy) |
| **Readiness probe** | "Can this instance handle traffic?" | Returns 200 only if DB connection is active, dependencies are reachable, and warmup is complete |

Load balancers and orchestrators (Kubernetes) use these to route traffic away from unhealthy instances and restart stuck processes.

---

## Cascading Failure Prevention

Cascading failures happen when one service's failure causes its callers to fail, which causes *their* callers to fail, propagating through the entire system. The patterns above work together to prevent this:

```
Timeouts → prevent hanging on slow dependencies
Retries → recover from transient failures
Circuit Breaker → stop hammering a dead service
Bulkhead → isolate failures to one component
Graceful Degradation → serve partial results instead of failing
Rate Limiting → prevent overload from triggering the cascade
Health Checks → route traffic away from sick instances
```

## Decision Framework

When designing for resiliency:

1. **Classify services by criticality.** Which services must never be down (payment, auth) vs. which can degrade (recommendations, analytics)?
2. **Set RTO/RPO targets** for critical services based on business impact.
3. **Add timeouts to every external call.** No exceptions.
4. **Add retries with backoff and jitter** for transient failures. Make operations idempotent.
5. **Add circuit breakers** for dependencies that can fail for extended periods.
6. **Isolate resources with bulkheads** so one failing dependency can't starve the rest.
7. **Design degraded modes** for each feature — decide in advance what to skip when a dependency is down.
8. **Add rate limiting** at the API Gateway and between services.
9. **Implement health checks** so load balancers and orchestrators can route around unhealthy instances.

## Validation Checklist

- [ ] I can define resiliency and distinguish it from availability.
- [ ] I can explain MTTR, RTO, RPO, and resilience ratio.
- [ ] I can describe the three states of a circuit breaker (closed, open, half-open) and when each transitions.
- [ ] I can explain why retries need exponential backoff and jitter (preventing retry storms).
- [ ] I can explain the bulkhead pattern and how it isolates failures.
- [ ] I can give examples of graceful degradation for different system features.
- [ ] I can describe rate limiting algorithms (token bucket, sliding window, fixed window).
- [ ] I can explain how cascading failures happen and which patterns prevent them.
- [ ] I can classify services by criticality and assign appropriate resiliency targets.
- [ ] I understand that resiliency patterns work together — no single pattern is sufficient alone.
