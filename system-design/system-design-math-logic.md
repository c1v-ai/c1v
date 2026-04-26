# System Design — Math & Logic Reference

*Captured 2026-04-20. Foundational framework for sizing, selecting, and stress-testing a system architecture with defensible math — not vibes.*

---

## 0. Executive Summary

- **The anchor question** for any system design is the **peak workload curve** (not a point estimate) — it's the single input that unlocks every downstream formula.
- **Three lenses** govern system design: **Workload** (inputs), **Quality-of-Service** (constraints), **Operating Envelope** (context).
- **PACELC** is a specific distributed-data theorem. The five-item "-ilities" list (throughput, latency, resiliency, availability, maintainability) is the broader **ISO/IEC 25010** quality-attributes taxonomy. They interlock; don't conflate them.
- **AI adds pressure, doesn't disrupt.** Fundamentals (Little's Law, CAP/PACELC, availability arithmetic) are physics. AI rewrites constants and stacks a new NFR class on top.
- **Greenfield method:** decompose vision → anchor with comparables → project reachable-market curve → derive peak workload → set QoS constraints → stress-test → output a 1-page Sized Requirements Document.
- **Senior failure mode:** listing NFRs without quantifying them. *"High availability"* is not a spec.

---

## 1. The Anchor Question

> **"What's the peak workload curve?"** — specifically concurrent users or peak RPS, read:write ratio, and data-growth trajectory over the next 12–24 months.

Every piece of math downstream (Little's Law sizing, queuing headroom, availability budgets, cost-per-request, CDN vs SSR vs edge) plugs into that one input. Without it, tech-stack picks are taste, not engineering.

**Tradeoff:** a point estimate over-builds for a hypothetical peak or under-builds for today's reality. Demand the *curve*, not a number.

---

## 2. RPS and the Little's Law Chain

**RPS = Requests Per Second** — the rate at which the system receives incoming requests. The arrival rate (λ) in queuing theory. The core input into capacity math.

### Core formulas

```
Little's Law:   L  =  λ × W
                │      │     │
                │      │     └─ average time in system (latency)
                │      └─ arrival rate (RPS)
                └─ concurrent requests in-flight

Example:   500 RPS  ×  200 ms  =  100 in-flight requests

Sizing:    server_count = peak_RPS ÷ per_server_capacity_RPS

Cost:      $/month = RPS × seconds_per_month × $/request
```

**Always quote peak RPS, not average.** A service averaging 100 RPS but peaking at 2,000 RPS must be built for 2,000. Use peak-to-average ratios from the typical-constants table (§10).

---

## 3. Critical System Design Factors — Three Lenses

### Lens A — Workload (inputs)
- **Peak RPS** — arrival rate (§2)
- **R/W ratio** — drives caching, DB indexes, replica topology
- **Data volume + growth curve** — partitioning, archival, storage tier
- **Burstiness (peak ÷ avg)** — reserved capacity vs autoscale vs serverless
- **Payload size** — bandwidth cost, serialization overhead

### Lens B — Quality-of-Service (constraints)
- **Latency SLA** (p50 / p95 / p99) — sync vs async, edge vs origin, runtime choice
- **Availability target** (number of nines) — 99.9% = 8.76 hr/yr down; 99.99% = 52 min; 99.999% = 5 min. Each nine ≈ 10× cost.
- **Consistency model** (CAP) — strong vs eventual → Postgres vs Dynamo vs Spanner
- **Durability / RPO / RTO** — replication factor, backup cadence, failover drill frequency

### Lens C — Operating Envelope (context)
- **Cost budget** — $/request ceiling silently drives every other tradeoff
- **Compliance** (SOC2 / HIPAA / GDPR / PCI) — tenancy model, encryption, data residency
- **Geographic footprint** — single-region vs multi-region vs edge; speed-of-light math (NY↔SF ≈ 40 ms RTT floor)
- **Team size + ops maturity** — managed services vs self-host (Conway's Law: system shape mirrors org shape)
- **Blast radius tolerance** — cell-based architecture, bulkheads, circuit breakers

**Classic senior failure mode:** obsess over workload numbers and hand-wave QoS constraints. Then discover at launch that *"p99 < 100 ms at 99.99% across 3 regions"* was never feasible with the stack chosen. **Constraints kill stacks; workload only sizes them.**

---

## 4. PACELC vs Quality Attributes (NFRs)

### PACELC (Abadi, 2010) — formal definition

> **If Partition** → choose **Availability** or **Consistency** (classic CAP)
> **Else** (normal ops) → choose **Latency** or **Consistency**

**Five letters:** P-A-C (partition branch) + E-L-C (normal-ops branch). Specifically a **distributed-data-store tradeoff theorem**.

**Common classifications:**
| Class | Examples | Tradeoff |
|-------|----------|----------|
| **PA / EL** | Dynamo, Cassandra, Riak | Sacrifice C for both A and L |
| **PC / EC** | Spanner, HBase, VoltDB | C wins always; pay in L + A |
| **PA / EC** | MongoDB (default) | A during partition, C otherwise |

### ISO/IEC 25010 Quality Attributes

| Attribute | Quantified as | Math tool |
|-----------|---------------|-----------|
| **Performance** | RPS, p50/p95/p99, bandwidth | Little's Law, queuing theory |
| **Availability** | # of nines, MTBF/MTTR | Serial/parallel reliability |
| **Durability** | RPO / RTO | Replication factor math |
| **Scalability** | Horizontal linearity coefficient | Amdahl's / Gustafson's Law |
| **Consistency** | Strong / eventual / bounded | ← PACELC lives here |
| **Resiliency** | Blast radius, recovery time | Cell / bulkhead / circuit-breaker |
| **Maintainability** | Deploy freq, MTTR, DORA metrics | Change-failure rate |
| **Security** | AuthN/Z, encryption, audit | Threat model + STRIDE |
| **Cost efficiency** | $/request, $/GB stored + egress | Unit-economics model |

### How they interlock

NFRs define *the targets*; PACELC tells you *which data-plane tradeoffs are physically unavoidable* in reaching them.

**Flow:** quantify NFRs → derive required consistency class → PACELC picks the storage tier.

**Failure mode to avoid:** listing NFRs without quantifying. *"High availability"* is not a spec. *"99.95% monthly availability, MTTR < 5 min, p99 < 150 ms at 2k peak RPS, RPO ≤ 15 min"* is a spec — and it's what unlocks Erlang-B, queuing models, redundancy arithmetic, and cost-per-nine math.

---

## 5. AI's Effect on System Design — Pressure, Not Disruption

Fundamentals are physics. Little's Law, CAP/PACELC, queuing theory, availability arithmetic don't care whether a CPU or GPU services the request. **AI rewrites the constants** in every formula and **stacks a new NFR class** on top.

### What changed (the pressure)

1. **Workload unit shifted** — RPS → tokens/sec. Latency SLA loosened 10–50× (50 ms → 2000 ms p99) but got long-tailed and highly variable. Cost/request jumped three orders of magnitude ($0.0001 → $0.01–$0.10).
2. **New bottleneck class** — GPU capacity, KV-cache memory, context-window $, vendor rate limits. **Your availability now inherits Anthropic/OpenAI uptime.** Multi-provider fallback is the new multi-AZ.
3. **New failure modes** — non-determinism, hallucination, prompt injection, context overflow. Traditional NFRs capture none of these. Add **accuracy, groundedness, token efficiency, eval coverage, cache-hit rate** as first-class metrics.
4. **New tiers in the stack** — vector DBs (their own PACELC profile), retrieval layer, mandatory streaming, long-running agent workflows that don't fit stateless-HTTP math. Durable execution (Temporal-class) replaces request/response for a whole category of work.
5. **Unit economics blown up** — pre-AI compute was a rounding error; post-AI it dominates. Many products can't cross the cost-per-active-user threshold without aggressive caching, routing (cheap → expensive model escalation), and prompt-caching discipline.

### What didn't change

You still need peak load, availability target, cost ceiling, consistency model, blast-radius plan. The *questions* don't change — the *answers* move.

### Net take

Senior system designers become **more valuable**, not less. The new stack has more tradeoffs and less mature pattern guidance. Vibe-architecture fails faster now because unit costs punish sloppy design in weeks, not quarters.

---

## 6. Tech-Stack Extraction from GitHub

### Deterministic (~80% — just grep the repo)

- Languages + versions (`package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`)
- Framework + ORM (Next.js, Django, Drizzle/Prisma) — imports + configs
- DB type + schema (migrations, `docker-compose.yml`, schema files)
- Infra-as-code (`terraform/`, `k8s/`, `vercel.json`, `fly.toml`)
- Auth / payments / vector DB / LLM provider — from imports
- CI/CD (`.github/workflows/`), observability (Sentry / Pino / Datadog)
- Feature flags, design system, testing stack, queue/cache layer

### Blind spots (~20% — need runtime/cloud access)

- Instance classes, autoscale floors/ceilings
- Actual regional deployment + replication topology
- Current DB size, row counts, index bloat
- Real RPS, p99 latency, cache hit rates
- Rate limits in effect, what's actually deployed vs on `main`

### Gap-closer

`.env.example` + hosting config (Vercel / Railway / Fly) + **one prod dashboard screenshot** → fills ~90% of the blind spots.

---

## 7. From DAU + Growth → Metrics + Failure Projection

### The formula chain

```
peak RPS   = DAU × sessions/DAU × actions/session × peak_factor / 86,400
concurrent = Little's Law: L = λW     (W ≈ session duration)
DB QPS     = RPS × queries/request
data/day   = DAU × writes/DAU × bytes/write
storage Δ  = data/day × 365 × (1 + growth)^t × replication_factor
bandwidth  = RPS × payload × peak_factor
$/month    = tokens/DAU × $/1M tokens × DAU × 30     ← AI cost layer
```

### Failure math

- **Serial availability** — A_sys = ∏ A_i. Four components at 99.9% → **99.6% = ~35 hr/yr down.**
- **Parallel redundancy** — two 99.9% nodes → **99.9999%** (one extra nine per redundant node, assuming independent failure).
- **Queue saturation** — at utilization ρ = λ/μ > 0.7, p99 latency diverges. Project the DAU where ρ hits 0.7 for each tier.
- **Error-budget burn** — current error rate × projected RPS → SLO violation date.
- **Cost cliff** — project when AI $/DAU > revenue/DAU. Often the earliest death.
- **Single-node ceiling** — Postgres ≈ 5–20k QPS per 8 vCPU; project DAU at saturation.

### Pattern-matched suggestions from code

| Code smell | Remediation |
|------------|-------------|
| N+1 queries | Indexes + DataLoader / batcher |
| No cache tier | Redis + stale-while-revalidate |
| No retries / timeouts | Circuit breaker + exponential backoff |
| No queue for slow work | BullMQ / SQS / Temporal |
| Single LLM provider | Dual-provider (Claude + GPT) routing — vendor availability is your availability |
| Missing rate limits | DoS surface + cost runaway |
| No structured logs / traces | Observability debt; can't debug at scale |
| Exposed secrets in `.env.example` history | Rotate + secret scanner in CI |
| Unbounded prompt input | Prompt-injection surface |

### Honest limit

Without real traffic telemetry (p99, cache hit rate, DB lock waits, GC pauses), projections are **order-of-magnitude accurate**, not tight. Good enough to rank-order remediation; not tight enough to pick between two close contenders. With 2–4 weeks of production metrics, math sharpens to ~±15%.

---

## 8. Greenfield Methodology — Vision → Sized Spec

**Method:** triangulate from three directions → produce a sized spec → stress-test it.

### Step 1 — Decompose the vision into operational primitives
Vision → **actors × use cases × actions per use case × session shape × data objects**. (eCornell UCBD / FFBD territory.)

For each use case, write:
- Trigger (what starts it)
- Actions (reads / writes / API calls)
- Bytes in/out (payload + storage delta)
- Frequency (per user per day)

Without this decomposition, every downstream number is a guess. With it, everything is arithmetic.

### Step 2 — Anchor with comparables (the step greenfield projects usually skip)

Mine 3 comparable products for:
- **Public filings** (S-1s, 10-Ks) — revenue/user, infra spend
- **Engineering postmortems** — Discord, Figma, Shopify, Stripe publish real numbers
- **SimilarWeb / App Annie** — sessions, visit duration, DAU/MAU
- **Benchmarks** — TPC (DB), YCSB (KV), lmarena (LLMs)
- **Pricing pages** — reverse-engineer per-user cost ceilings

Output: sessions/DAU, actions/session, storage/user, $/user for 3 comps. Your product lives inside that envelope.

### Step 3 — Project the reachable-market curve
**TAM → SAM → SOM → DAU scenarios** (pessimistic / base / optimistic) at Y1, Y3, Y5.

Growth-curve shape matters:
- **B2B SaaS:** log-linear, 3–5×/yr early
- **Consumer viral:** J-curve, breakpoints at 10k / 100k / 1M
- **Enterprise:** step-function on contract wins

### Step 4 — Derive the peak workload curve
Plug into the chain (§7). Run Y1 / Y3 / Y5 × pessimistic / base / optimistic = **9-cell matrix**.

Sensitivity-analyze: what breaks if peak_factor doubles? If actions/session is 3× higher because the product is stickier than expected?

### Step 5 — Set QoS constraints from business reality (not aspiration)

- **Cost ceiling/user** ← pricing × target gross margin
- **Availability SLA** ← customer segment (enterprise 99.95%, consumer 99.5%)
- **p99 latency** ← domain (finance < 50 ms, chat < 500 ms, batch < 10 s)
- **Durability / RPO / RTO** ← blast-radius tolerance
- **Compliance** ← SOC2 / HIPAA / GDPR / PCI envelope
- **Geography** ← single region → multi-region → edge

### Step 6 — Stress-test named failure scenarios

- 10× spike from launch / press / viral moment
- Single-tier outage (DB / auth / LLM provider)
- Vendor-availability cascade (your SLA inherits theirs)
- Cost runaway (user abuse or upstream pricing change)
- Data-growth overrun (3× forecast — where does it break?)

### Step 7 — Output: 1-page Sized Requirements Document

```
Peak load target (Y3 base):
  DAU:              50,000
  Peak RPS:         180
  DB QPS:           900
  Storage Δ/mo:     420 GB
  Bandwidth:        1.2 TB/mo
  LLM $/mo:         $9,400

QoS:
  Availability:     99.9% (43 min/mo error budget)
  p99 latency:      < 400 ms (excl. LLM tokens)
  Consistency:      Strong for billing, eventual for analytics
  Durability:       RPO ≤ 5 min, RTO ≤ 30 min
  Compliance:       SOC2 Type II by Y2

Budgeted failure modes:
  10× viral spike → autoscale to 1,800 RPS
  LLM outage      → dual-provider (Claude + GPT) routing
  Cost runaway    → per-tenant quota + circuit breaker at 150% of monthly AI budget
```

**That** is the input to tech-stack selection. Now PACELC has coordinates, queuing math has λ, availability math has target nines, cost math has a ceiling.

### Honest caveat

Greenfield numbers are wrong by ±50% minimum. Precision isn't the point. The point is:

1. Forcing stakeholder conversation about **priorities** (which QoS is sacred, which is negotiable?)
2. Producing a **defensible** design instead of a vibes design
3. Creating **invariants to test** as real telemetry arrives
4. **Re-sizing checkpoint** — every 5× user growth, re-run the chain

Most greenfield failure isn't bad math — it's **no math at all**, so nobody can tell when reality has diverged from assumption.

---

## 9. Formula Reference Card

```
Little's Law
  L = λ × W
  concurrent = RPS × avg_latency

Serial availability
  A_sys = A_1 × A_2 × ... × A_n

Parallel availability (N redundant components)
  A_sys = 1 - (1 - A)^N

Availability ↔ MTBF / MTTR
  A = MTBF / (MTBF + MTTR)

Queue utilization
  ρ = λ / μ           μ = service rate
  warn when ρ > 0.7   (p99 latency diverges as ρ → 1)

Peak workload chain
  peak RPS = DAU × sessions/DAU × actions/session × peak_factor / 86,400

Storage growth
  storage_Δ = data/day × 365 × (1 + growth)^t × replication_factor

LLM cost
  $/month = tokens_per_DAU × ($/1M_tokens / 1e6) × DAU × 30

Availability → downtime per year
  99%      = 3.65 days
  99.9%    = 8.76 hr
  99.95%   = 4.38 hr
  99.99%   = 52.6 min
  99.999%  = 5.26 min
  99.9999% = 31.5 sec
```

---

## 10. Typical Constants — Rules of Thumb

### Workload shape
| Metric | Typical range |
|--------|--------------|
| Sessions / DAU | 1–5 |
| Actions / session | 10–100 |
| Active request rate / user | 0.1–1 req/sec while active |
| Peak factor (B2B SaaS) | 5–10× avg (work hours) |
| Peak factor (B2C consumer) | 2–3× avg |
| Peak factor (viral / press) | 10–100× avg |
| Payload size (typical JSON API) | 500 B – 5 KB |
| Payload size (LLM prompt + response) | 10 KB – 200 KB |

### Infra ceilings (back-of-envelope)
| Component | Rough ceiling |
|-----------|--------------|
| Postgres (8 vCPU, 32 GB) | 5k – 20k QPS |
| Redis (single node) | 100k+ ops/sec |
| Node.js event loop (single process) | 5k – 15k RPS |
| Load balancer (managed) | 100k+ RPS |
| CDN edge | Effectively unbounded for static |

### Latency budgets by domain
| Domain | p99 latency |
|--------|-------------|
| HFT / finance | < 10 ms |
| Real-time gaming | < 50 ms |
| Web app (SaaS) | < 200 ms |
| Chat UI (non-AI) | < 500 ms |
| LLM chat (streaming) | < 2000 ms TTFT, 30–100 tokens/sec |
| Batch / analytics | < 10 s |

### Geographic latency floors (speed of light)
| Pair | RTT floor |
|------|-----------|
| NY ↔ SF | ~40 ms |
| NY ↔ London | ~70 ms |
| NY ↔ Sydney | ~160 ms |
| Within metro | < 5 ms |

### LLM cost anchors (2026)
| Model class | $/1M input | $/1M output |
|-------------|------------|-------------|
| Frontier (Opus-class) | $15–$20 | $75–$90 |
| Mid (Sonnet-class) | $3–$5 | $15–$20 |
| Cheap (Haiku-class) | $0.25–$1 | $1.25–$5 |

**Routing rule of thumb:** cheap model handles ~80% of traffic; escalate to frontier only on flagged hard cases. Target average cost 3–5× below frontier.

---

## 11. Failure-Mode Patterns → Remediations

| Anti-pattern | Symptom | Remediation |
|--------------|---------|-------------|
| N+1 queries | DB load scales super-linear with DAU | Indexes + batched loaders |
| No cache tier | DB is always the bottleneck | Redis + SWR + per-query TTLs |
| Synchronous slow work | p99 latency blows out | Queue + worker pool |
| No retries / timeouts | Partial-outage cascade | Timeout ≤ SLA; retry w/ backoff + jitter |
| No circuit breakers | Downstream failure → full outage | Half-open circuit; fast-fail |
| Single LLM provider | Inherit vendor uptime fully | Dual-provider routing; semantic equivalence tests |
| Unbounded user input | Prompt-injection / DoS | Input validation + max-tokens + rate limit |
| No per-tenant quotas | One user burns the budget | Token buckets per tenant + hard cap |
| No structured logs | Can't debug production | Pino / structlog + trace IDs + sampling |
| No eval harness for AI | Can't detect regression | Golden set + CI eval gate + drift alarms |
| Missing RPO/RTO drill | Recovery is untested | Quarterly failover exercise |
| Single-region | Regional outage = full outage | Multi-region active-active or active-passive |

---

## 12. Senior-Lens Failure Modes to Avoid

1. **Listing NFRs without quantifying them.** *"High availability"* is not a spec. Convert to *"99.95% monthly, MTTR < 5 min, RPO ≤ 15 min."*
2. **Optimizing workload numbers while hand-waving QoS constraints.** Constraints kill stacks; workload only sizes them.
3. **Point-estimate sizing.** Real load is a curve. Always Y1/Y3/Y5 × pessimistic/base/optimistic.
4. **Ignoring inherited availability** from vendors. Your SLA = product of all upstream SLAs. Do the serial math.
5. **Skipping comparables.** Greenfield without anchored numbers is faith-based sizing.
6. **Treating AI cost as "it'll get cheaper."** It might. Plan for today's price; take the upside as margin.
7. **No re-sizing checkpoint.** Math at T=0 is always wrong; the failure is not having a trigger to re-run it.
8. **Vibe architecture.** In the AI era, unit costs punish sloppy design in weeks, not quarters.

---

## Change log

- **2026-04-20** — Initial capture from conversation on system-design math foundations, PACELC vs NFRs, AI's pressure on the discipline, GitHub stack extraction, and greenfield methodology.
