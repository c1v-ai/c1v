# Observability — Metrics, Logs, Traces, and Alerting

## Context (Why This Matters)

When a distributed system has dozens of microservices, containers, and cloud infrastructure, there are countless ways things can go wrong — many of which you never anticipated. **Monitoring** tells you *that* something is wrong. **Observability** tells you *why*. You need both.

| | Monitoring | Observability |
|---|-----------|--------------|
| **Analogy** | Car dashboard — speed, fuel, temperature, check engine light | Diagnostic tool — tells you exactly what's wrong under the hood |
| **Answers** | What is wrong? When did it happen? | Why did it happen? How did it happen? Where in the system? |
| **Capability** | Alerts on problems you anticipated in advance (predefined thresholds) | Helps you understand any state the system gets into, even unanticipated ones |
| **Limitation** | Cannot alert on the unexpected. Cannot explain root cause. | Expensive to collect everything. Requires balancing data volume vs. cost. |

**The relationship:** Monitoring is your early warning system. Observability is your detective. Monitoring catches known issues before they impact users. Observability traces unknown issues through your complex system to find root cause quickly.

---

## The Three Pillars of Observability

### 1. Metrics

Numerical measurements of system behavior over time. Metrics are aggregated, lightweight, and ideal for dashboards and alerting.

**Types of metrics:**

| Category | Examples | What They Tell You |
|----------|---------|-------------------|
| **Infrastructure** | CPU usage, memory usage, disk I/O, network throughput | Is the hardware healthy? |
| **Application** | Request rate (QPS), error rate, response latency (P50, P95, P99) | Is the application performing well? |
| **Business** | Orders per minute, sign-ups per hour, revenue per day | Is the system delivering business value? |

**Key latency percentiles:**

| Percentile | Meaning | Why It Matters |
|-----------|---------|---------------|
| **P50 (median)** | 50% of requests are faster than this | The "typical" user experience |
| **P95** | 95% of requests are faster than this | Catches the tail — 1 in 20 users sees this or worse |
| **P99** | 99% of requests are faster than this | The worst common experience — often 5–10x the median |

**Rule:** Never use averages alone for latency. A P50 of 100ms and a P99 of 5000ms means most users are fine, but 1% are waiting 50x longer. Averages hide this.

**The RED Method (for services):**
- **R**ate — requests per second
- **E**rrors — error rate (% of failed requests)
- **D**uration — latency distribution (P50, P95, P99)

**The USE Method (for resources):**
- **U**tilization — how much of the resource is in use (e.g., 75% CPU)
- **S**aturation — how much work is queued/waiting (e.g., thread pool queue depth)
- **E**rrors — error count for this resource

### 2. Logs

Detailed, timestamped records of discrete events. Logs provide the context that metrics lack.

**Structured vs unstructured:**

| Type | Example | Queryable? |
|------|---------|-----------|
| **Unstructured** | `2026-04-13 ERROR: Failed to process order 12345` | Hard to filter and aggregate |
| **Structured (JSON)** | `{"timestamp": "2026-04-13T20:00:00Z", "level": "error", "service": "order-service", "orderId": "12345", "userId": "u-789", "error": "payment timeout", "latencyMs": 5200}` | Easy to filter, aggregate, and correlate |

**Always use structured logging.** Every log entry should include:
- Timestamp
- Log level (debug, info, warn, error)
- Service name
- Request/trace ID (for correlation with traces)
- Relevant context (user ID, order ID, etc.)

**Log levels:**

| Level | When to Use | Example |
|-------|------------|---------|
| **DEBUG** | Development/troubleshooting only. Never in production at full volume. | Function entry/exit, variable values |
| **INFO** | Normal operations worth recording | "Order 12345 created successfully" |
| **WARN** | Something unexpected but not yet a failure | "Retry attempt 2 of 3 for payment service" |
| **ERROR** | A failure that needs investigation | "Payment service timeout after 5s for order 12345" |

**Cost warning:** Logging everything is expensive. Coinbase once spent $65 million on observability data. Balance data collection against real debugging needs. Use sampling for high-volume debug logs.

### 3. Distributed Traces

A trace follows a single request as it travels through multiple services end-to-end. Each service adds a **span** — a named, timed operation within the trace.

```
Trace ID: abc-123
├── [API Gateway] 0–250ms
│   └── [Auth Service] 10–30ms
├── [Order Service] 30–200ms
│   ├── [Database Query] 35–50ms
│   ├── [Inventory Check] 50–180ms  ← SLOW (130ms)
│   └── [Payment Service] 180–195ms
└── [Notification Service] 200–230ms (async)
```

**What traces reveal:**
- Which service is the bottleneck (Inventory Check took 130ms of the 250ms total)
- The dependency chain — which services call which
- Where errors originate vs. where they surface
- Whether latency is in your code or in a downstream dependency

**Key concepts:**

| Concept | Definition |
|---------|-----------|
| **Trace** | The full journey of one request through the system |
| **Span** | One operation within the trace (one service's work) |
| **Trace ID** | Unique identifier propagated across all services for one request |
| **Parent-child spans** | Spans can be nested to show call hierarchy |
| **Sampling** | Only trace a percentage of requests (e.g., 1%) to manage cost |

**Technologies:** OpenTelemetry (open standard), Jaeger, Zipkin, Datadog APM, AWS X-Ray

---

## Alerting

Alerts notify humans (or trigger automation) when metrics cross predefined thresholds or match anomalous patterns.

### Symptom-Based vs Cause-Based Alerting

| Type | Alerts On | Example | Quality |
|------|----------|---------|---------|
| **Symptom-based** | User-visible impact | "Error rate > 1% for 5 minutes" | **Preferred** — fewer alerts, higher signal |
| **Cause-based** | Internal state | "CPU > 80%" | Noisy — high CPU doesn't always mean users are affected |

**Rule:** Alert on symptoms (error rate, latency, availability), investigate causes (CPU, memory, queue depth) via dashboards and traces.

### Error Budgets and Burn Rate

From Google SRE practice:

| Concept | Definition | Example |
|---------|-----------|---------|
| **SLO** (Service Level Objective) | Target reliability level | "99.9% of requests succeed within 500ms" |
| **Error budget** | The amount of unreliability allowed by the SLO | 99.9% SLO = 0.1% error budget = ~43 minutes of downtime/month |
| **Burn rate** | How fast you're consuming your error budget | If you normally use 0.1%/day but today you've used 0.5%, your burn rate is 5x normal |

**Burn rate alerting:** Instead of alerting on raw error counts, alert when the error budget is being consumed faster than sustainable. This reduces false alarms while catching real degradation.

---

## Observability Architecture

```
Services emit:
├── Metrics → Prometheus / CloudWatch / Datadog → Dashboards (Grafana)
├── Logs → Structured JSON → Log aggregator (ELK, Loki, CloudWatch Logs) → Search/Filter
└── Traces → OpenTelemetry SDK → Trace collector (Jaeger, Zipkin, Datadog) → Trace viewer

All three share:
└── Correlation via Trace ID / Request ID
    → Metric spike → find related logs by time window → find traces for failing requests → identify root cause
```

### Correlation is the Superpower

The three pillars become powerful when **connected:**

1. **Metric alert fires:** Error rate > 1% on order-service
2. **Filter logs:** `service=order-service AND level=error AND timestamp=last 5 minutes` → "payment timeout" errors
3. **Find traces:** Pick a failing request's trace ID → trace shows Inventory Check service responding in 4s instead of 50ms
4. **Root cause:** Inventory service deployed a bad query 5 minutes ago → revert

Without correlation, each pillar is useful but incomplete. Together, they create a complete debugging story.

---

## Observability Technologies

| Category | Tools |
|----------|-------|
| **Metrics** | Prometheus, Grafana, CloudWatch, Datadog, New Relic |
| **Logs** | ELK Stack (Elasticsearch + Logstash + Kibana), Grafana Loki, CloudWatch Logs, Splunk |
| **Traces** | OpenTelemetry (collection standard), Jaeger, Zipkin, Datadog APM, AWS X-Ray |
| **All-in-one** | Datadog, New Relic, Grafana Cloud, Honeycomb |

**OpenTelemetry** is the industry-standard open-source framework for instrumenting applications. It provides a single API/SDK for emitting metrics, logs, and traces, and exports to any backend.

---

## Decision Framework

When designing the observability layer:

1. **Instrument with OpenTelemetry** as the collection standard — vendor-neutral, future-proof.
2. **Emit RED metrics** for every service (rate, errors, duration).
3. **Use structured logging** with JSON format. Include trace IDs in every log entry.
4. **Add distributed tracing** with sampling. Start with 1–5% sampling and increase for debugging.
5. **Alert on symptoms** (error rate, latency SLO breaches), not causes (CPU, memory).
6. **Set SLOs and error budgets** for critical services. Alert on burn rate.
7. **Correlate all three pillars** via trace/request IDs — this is what turns data into answers.
8. **Balance cost vs. coverage** — don't log everything. Sample traces. Retain metrics longer than logs.

## Validation Checklist

- [ ] I can explain the difference between monitoring (what/when) and observability (why/how).
- [ ] I can name and describe the three pillars: metrics, logs, and traces.
- [ ] I can explain why latency percentiles (P50, P95, P99) are better than averages.
- [ ] I can describe the RED method (rate, errors, duration) and USE method (utilization, saturation, errors).
- [ ] I can explain structured vs unstructured logging and why structured is essential.
- [ ] I can describe how distributed tracing works (traces, spans, trace ID propagation, sampling).
- [ ] I can explain symptom-based vs cause-based alerting and why symptom-based is preferred.
- [ ] I can define SLO, error budget, and burn rate alerting.
- [ ] I can describe how metrics, logs, and traces correlate via trace IDs to form a complete debugging story.
- [ ] I can name key observability technologies (OpenTelemetry, Prometheus, Grafana, Jaeger, ELK).
