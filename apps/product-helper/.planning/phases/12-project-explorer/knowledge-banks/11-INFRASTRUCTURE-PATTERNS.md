# Knowledge Bank: Infrastructure Patterns (Deployment & Operations)

**Step:** 2.5 - Infrastructure Planning
**Purpose:** Guide infrastructure, deployment, monitoring, and security recommendations
**Core Question:** "Where does this run, how does it scale, and how do we keep it healthy?"
**Feeds Into:** Infrastructure agent (`infrastructure-agent.ts`)
**Last Updated:** February 2026

---

## WHY THIS STEP MATTERS

Infrastructure is where your code meets reality. The best code in the world fails if it's deployed wrong, unmonitored, or insecure. This KB provides current-state recommendations so the infrastructure agent generates actionable, modern deployment plans — not generic "consider using cloud" advice.

---

## HOSTING BY PROJECT STAGE (February 2026)

| Stage | Recommended Stack | Monthly Cost | Notes |
|-------|------------------|-------------|-------|
| **Prototype** | Vercel Free + Supabase Free | $0 | Generous free tiers, zero config |
| **MVP** | Vercel Pro + Supabase Pro | $45-100 | Production-ready, custom domains |
| **Growth (cost-conscious)** | Coolify on Hetzner VPS + Supabase | $20-100 | Vercel DX at 10-20% the cost |
| **Growth (scale)** | Railway or AWS (ECS + RDS) | $200-500 | Container-based, predictable |
| **Edge-first** | Cloudflare Workers + D1 + R2 | $5-50 | Global, unlimited bandwidth |
| **Enterprise** | Kubernetes (EKS/GKE) | $1,000+ | Multi-region, compliance |

### Platform Comparison

| Platform | Best For | Key Strength | Limitation |
|----------|----------|-------------|------------|
| **Vercel** | Next.js apps, DX-first | Best Next.js deployment, CDN, v0 AI | Cost escalates at scale |
| **Coolify** | Self-hosted, cost control | Git-push deploys, preview URLs, auto-SSL on your own server | You manage the server |
| **Cloudflare** | Edge computing, global | Workers, unlimited bandwidth, R2 storage | Limited runtime (no Node.js APIs) |
| **Railway** | Full-stack, containers | 3-4x faster server rendering than Vercel, predictable pricing | Less edge caching |
| **SST** | AWS infrastructure | OpenNext (self-host Next.js on AWS), IaC | AWS complexity |
| **Fly.io** | Global containers | Deploy close to users, Firecracker VMs | Smaller community |

**Key 2026 shift:** Self-hosting is back. Coolify + Hetzner VPS gives Vercel-like DX at 10-20% of the cost. Documented cases of teams saving $2,000+/month migrating off Vercel.

---

## CI/CD PIPELINE PATTERNS

### Standard Pipeline (GitHub Actions)
```
1. Lint + Type check     (Biome v2.3 + tsc --noEmit)
2. Unit tests            (Vitest)
3. Build                 (next build / vite build)
4. Integration tests     (Vitest + test DB)
5. Deploy to preview     (automatic on PR)
6. E2E tests on preview  (Playwright)
7. Deploy to production  (merge to main / manual gate)
```

### GitHub Actions Example
```yaml
name: CI
on: [push, pull_request]
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm biome check .
      - run: pnpm tsc --noEmit
      - run: pnpm test
      - run: pnpm build
```

### Branch Strategy
```
main           → production (auto-deploy)
staging        → staging environment (auto-deploy)
feature/*      → preview URLs (auto-deploy per PR)
hotfix/*       → fast-track to production
```

---

## ENVIRONMENT STRATEGY

| Environment | Purpose | Data | Deploy Trigger |
|-------------|---------|------|---------------|
| **Local** | Development | Seed data (Supabase local at localhost:54322) | `pnpm dev` |
| **Preview** | PR review | Branched DB (Neon) or cloned staging | Push to PR branch |
| **Staging** | Pre-production | Anonymized production data | Merge to `staging` |
| **Production** | Live users | Real data | Merge to `main` |

### Environment Variables
```
# Required for every environment
DATABASE_URL=postgresql://...
AUTH_SECRET=<32+ chars>

# API keys (different per environment)
ANTHROPIC_API_KEY=sk-ant-...
STRIPE_SECRET_KEY=sk_test_...  (dev/staging)
STRIPE_SECRET_KEY=sk_live_...  (production)

# Environment-specific
BASE_URL=http://localhost:3000      (local)
BASE_URL=https://preview-xyz.vercel.app  (preview)
BASE_URL=https://app.example.com    (production)
```

**Rules:**
- Never commit `.env` files to git
- Use `.env.example` with placeholder values
- Rotate secrets quarterly (or after any leak)
- Use different API keys per environment
- Store production secrets in platform's secret manager (Vercel, Railway, AWS SSM)

---

## MONITORING & OBSERVABILITY STACK (February 2026)

| Layer | Tool | Purpose | Cost |
|-------|------|---------|------|
| **Error tracking** | Sentry | Exception tracking with source maps and replay | Free tier available |
| **Logging** | BetterStack (Logtail) | Structured logging, search, alerts | From $25/mo |
| **Uptime** | BetterStack | Availability monitoring, status pages | From $25/mo |
| **APM** | Sentry Performance or Datadog | Request tracing, slow query detection | Varies |
| **Analytics** | PostHog | Product analytics + feature flags + session replay | Self-host free |
| **LLM monitoring** | LangSmith or Helicone | Token usage, cost tracking, prompt debugging | Free tiers |
| **Database** | Supabase Dashboard or pganalyze | Query performance, connection pooling stats | Built-in / $150/mo |

### Structured Logging Pattern
```typescript
// Use structured JSON logging (not console.log)
logger.info('Order completed', {
  orderId: order.id,
  userId: user.id,
  total: order.total,
  processingTimeMs: elapsed,
});

// Levels: error > warn > info > debug
// Production: info and above
// Development: debug and above
```

### Key Metrics to Track
```
Application:  Response time (p50, p95, p99), error rate, throughput
Database:     Query time, connection pool usage, slow queries (>100ms)
LLM:          Token usage per request, cost per user, latency, failure rate
Business:     Active users, conversion rate, feature adoption
Infrastructure: CPU, memory, disk, network
```

---

## SECURITY CHECKLIST

### Must Have (Day 1)
- [ ] HTTPS everywhere (TLS 1.3) — enforced by platform (Vercel, Cloudflare)
- [ ] Environment secrets not in code — `.env` in `.gitignore`
- [ ] Rate limiting on all public endpoints — sliding window, Redis-backed
- [ ] Input validation at boundaries — Zod schemas on all API inputs
- [ ] SQL injection prevention — parameterized queries (Drizzle/Prisma handle this)
- [ ] XSS prevention — React auto-escapes by default; sanitize any user HTML with DOMPurify
- [ ] Auth on every API route — middleware pattern (`withAuth` HOF)
- [ ] CORS configuration — explicit origin allowlist, not `*`

### Should Have (Before Launch)
- [ ] CSP headers — Content Security Policy to prevent XSS
- [ ] CSRF protection — Same-site cookies or CSRF tokens
- [ ] Security headers — HSTS, X-Frame-Options, X-Content-Type-Options
- [ ] Dependency scanning — Snyk, Dependabot, or `pnpm audit`
- [ ] Session management — Rotate tokens after auth changes
- [ ] Error handling — Never expose stack traces or internal details to users

### Nice to Have (Growth Stage)
- [ ] SOC2 compliance preparation
- [ ] Penetration testing
- [ ] Bug bounty program
- [ ] Audit logging (who did what, when)
- [ ] Data encryption at rest
- [ ] Multi-factor authentication

---

## BACKUP & DISASTER RECOVERY

| Component | Strategy | Retention |
|-----------|----------|-----------|
| **Database** | Automated daily backups (Supabase/Neon built-in) | 30 days |
| **Point-in-time recovery** | WAL archiving (PostgreSQL) | 7-30 days |
| **File storage** | Cross-region replication (S3/R2) | Indefinite |
| **Code** | Git (distributed by nature) | Indefinite |
| **Secrets** | Documented rotation procedure | N/A |

### RTO/RPO Targets

| Tier | RTO (Recovery Time) | RPO (Data Loss) | Strategy |
|------|-------------------|-----------------|----------|
| **Startup** | 4 hours | 24 hours | Daily backups + manual restore |
| **Growth** | 1 hour | 1 hour | Point-in-time recovery + read replicas |
| **Enterprise** | 15 minutes | 0 (zero data loss) | Multi-region active-active + streaming replication |

---

## SCALING PATTERNS

### Horizontal Scaling
```
                    ┌─────────────┐
                    │  Load       │
                    │  Balancer   │
                    └──────┬──────┘
                ┌──────────┼──────────┐
                │          │          │
           ┌────┴────┐ ┌──┴────┐ ┌──┴────┐
           │ App 1   │ │ App 2 │ │ App 3 │
           └────┬────┘ └──┬────┘ └──┬────┘
                │         │         │
           ┌────┴─────────┴─────────┴────┐
           │  PostgreSQL + Connection    │
           │  Pooler (PgBouncer)         │
           └─────────────────────────────┘
```

### When to Scale What

| Bottleneck | Signal | Solution |
|-----------|--------|----------|
| CPU | High CPU on app servers | Add more app instances (horizontal) |
| Database reads | Slow queries, high connection count | Read replicas, connection pooling |
| Database writes | Write contention, lock waits | Optimize queries, queue writes |
| Memory | OOM kills, high swap | Increase instance size (vertical) |
| Global latency | High TTFB from distant regions | CDN, edge caching, multi-region |

---

## INFRASTRUCTURE BY PROJECT TYPE

### B2B SaaS
```
Hosting:      Vercel (frontend) + Railway (background jobs)
Database:     Supabase Pro (PostgreSQL + Auth + RLS)
Cache:        Redis (Upstash serverless)
Email:        Resend (transactional) + Loops (marketing)
Payments:     Stripe
Monitoring:   Sentry + BetterStack
CI/CD:        GitHub Actions → Vercel auto-deploy
CDN:          Vercel Edge Network (built-in)
```

### Marketplace
```
Hosting:      Vercel or Railway
Database:     PostgreSQL on Neon (branching for staging)
Search:       Meilisearch Cloud
Cache:        Redis (Upstash)
Payments:     Stripe Connect
File storage: Cloudflare R2 or Supabase Storage
Monitoring:   Sentry + PostHog (analytics)
CI/CD:        GitHub Actions
```

### Mobile App Backend
```
Hosting:      Cloudflare Workers (edge API) or Railway
Database:     Turso (edge) or Supabase (real-time)
Push:         Firebase Cloud Messaging or Expo Notifications
File storage: Cloudflare R2
Auth:         Supabase Auth or Better Auth
Monitoring:   Sentry (mobile + backend)
CI/CD:        GitHub Actions + EAS Build (Expo)
```

### AI / LLM Product
```
Hosting:      Vercel (frontend) + Railway (agent workers)
Database:     Supabase (PostgreSQL + pgvector)
LLM:          Anthropic Claude (via LangChain)
Cache:        Redis (LLM response caching)
Monitoring:   Sentry + LangSmith (LLM ops) + Helicone (cost tracking)
Queue:        Inngest or Trigger.dev (long-running agent tasks)
CI/CD:        GitHub Actions → Vercel + Railway
```

---

## COST OPTIMIZATION

| Strategy | Savings | When to Apply |
|----------|---------|---------------|
| Vercel → Coolify (self-hosted) | 80-90% | Monthly bill exceeds $200 |
| Supabase self-hosted | 70-80% | Need full control, dedicated resources |
| LLM response caching (Redis) | 40-60% of LLM costs | Repeated similar queries |
| Edge caching (CDN) | Reduced origin requests | Static/semi-static content |
| Auto-scaling / scale-to-zero | Pay only for usage | Variable traffic patterns |
| Reserved instances (AWS) | 30-40% | Predictable baseline load |

---

## QUALITY CHECKS

**Done right:**
- Specific platform recommendations (not "use cloud")
- Cost estimates per stage
- CI/CD pipeline defined
- Monitoring stack specified
- Security checklist included
- Backup/recovery strategy
- Scaling path from MVP to growth

**Done wrong:**
- Generic "deploy to AWS" without specifics
- No cost awareness
- No monitoring plan
- Security as an afterthought
- No backup strategy

---

## COMPLIANCE INFRASTRUCTURE BY INDUSTRY

### Healthcare (HIPAA)
```
Required:
  [ ] Encryption at rest (AES-256) for all PHI storage
  [ ] Encryption in transit (TLS 1.3) — no exceptions
  [ ] PHI access audit logging (who, what, when, where)
  [ ] Automatic session timeout (15 min for clinical workstations)
  [ ] BAA (Business Associate Agreement) with all cloud vendors
  [ ] Disaster recovery plan with 1-hour RPO, 4-hour RTO
  [ ] Annual risk assessment and penetration testing
  [ ] Employee HIPAA training records

Platform choices:
  - AWS GovCloud or Supabase (signs BAA) for database
  - Auth: Clerk Enterprise or custom (must support MFA)
  - Logging: Immutable audit logs (append-only table, no DELETE policy)
  - Backup: Daily automated + point-in-time recovery (30-day retention)
```

### Fintech (PCI-DSS + SOC2)
```
Required:
  [ ] PCI-DSS Level 1 if processing >6M transactions/year
  [ ] Tokenized card data (never store raw card numbers)
  [ ] Network segmentation (cardholder data environment isolated)
  [ ] Key rotation every 90 days
  [ ] SOC2 Type II audit (annually) for enterprise clients
  [ ] Transaction monitoring for fraud/AML patterns
  [ ] Multi-factor authentication for all admin access

Platform choices:
  - Payments: ALWAYS Stripe/Adyen (PCI-compliant — you never touch card data)
  - Database: Encrypted at rest, separate DB for financial records
  - Logging: Immutable, tamper-evident logs with checksums
  - DR: Multi-region with <15 minute RPO for financial data
```

### General (GDPR / SOC2)
```
GDPR (EU Users):
  [ ] Consent management (explicit opt-in, withdrawal mechanism)
  [ ] Data portability (export user data in machine-readable format)
  [ ] Right to erasure (delete all PII on request, cascade through backups)
  [ ] Data Processing Agreement (DPA) with all sub-processors
  [ ] Cookie consent banner with granular controls
  [ ] Privacy policy updated with processing activities

SOC2 Type II:
  [ ] Access control (RBAC, least privilege, audit trail)
  [ ] Change management (PR reviews, deployment approvals)
  [ ] Incident response plan (documented, tested annually)
  [ ] Vendor risk management (assess all third-party services)
  [ ] Encryption everywhere (rest + transit)
```

### Education (FERPA + COPPA)
```
FERPA (Student Records):
  [ ] Written consent before disclosing student education records
  [ ] Parents/students can inspect and request amendment of records
  [ ] "Directory information" opt-out mechanism (name, email, enrollment status)
  [ ] Audit trail for all access to student records
  [ ] Data sharing agreements with third-party ed-tech vendors
  [ ] Annual notification to students/parents of FERPA rights

COPPA (Under-13 Users):
  [ ] Verifiable parental consent before collecting data from children
  [ ] No behavioral advertising to children
  [ ] Data minimization (collect only what's necessary)
  [ ] Parental access to child's data + delete on request
  [ ] Clear privacy policy in plain language

Platform choices:
  - Auth: Age-gated registration + parental consent flow
  - Hosting: Standard (no BAA required, but FERPA DPA needed)
  - Logging: Student record access logs (who viewed what, when)
```

### Automotive (Connected Vehicle / UNECE)
```
Connected Vehicle Data:
  [ ] UNECE WP.29 cybersecurity management system (mandatory for connected cars)
  [ ] Over-the-Air (OTA) update integrity verification
  [ ] Vehicle data anonymization for analytics
  [ ] Driver consent for telematics data collection
  [ ] ISO 21434 automotive cybersecurity standard

Dealer Operations:
  [ ] Red Flags Rule compliance (identity theft prevention)
  [ ] FTC Safeguards Rule (customer financial data protection)
  [ ] State-specific dealer licensing and advertising regulations
  [ ] OFAC sanctions screening for high-value transactions

Platform choices:
  - Telematics: MQTT for vehicle-to-cloud (lightweight, low bandwidth)
  - Data processing: Kafka/Redpanda for high-volume vehicle event streams
  - Hosting: AWS (automotive-grade IoT services) or Azure (connected vehicle platform)
```

### Logistics / Supply Chain (C-TPAT + IATA)
```
Supply Chain Security:
  [ ] C-TPAT (Customs-Trade Partnership Against Terrorism) certification
  [ ] AEO (Authorized Economic Operator) status for EU operations
  [ ] Chain-of-custody documentation for regulated goods (pharma, chemicals)
  [ ] Dangerous goods handling (IATA DG regs for air, IMDG for sea)
  [ ] Temperature monitoring for cold chain (perishables, biotech)
  [ ] Country-of-origin tracking for tariff classification

Data Requirements:
  [ ] EDI capability (204, 210, 214, 856 transaction sets)
  [ ] Customs data retention (5 years for CBP, 7 years for EU)
  [ ] Real-time shipment visibility for regulatory holds
  [ ] Sanctions screening (OFAC, EU restricted parties)

Platform choices:
  - Event streaming: Kafka/Redpanda for high-volume tracking events
  - Database: PostgreSQL + TimescaleDB for time-series tracking data
  - EDI: AS2/SFTP gateway (Cleo, Babelway, or custom)
  - Hosting: AWS or GCP (global presence for multi-region logistics)
```

### Insurance (State DOI + NAIC)
```
Regulatory:
  [ ] State Department of Insurance (DOI) filing requirements
  [ ] NAIC Market Conduct standards compliance
  [ ] Rate filing and approval (prior approval or file-and-use, varies by state)
  [ ] Claims handling timeframe requirements (varies by state, typically 30-day acknowledgment)
  [ ] Policy form approval by state DOI before sale
  [ ] Producer (agent) licensing verification

Data Protection:
  [ ] NAIC Insurance Data Security Model Law (IDSML)
  [ ] Encryption of PII and PHI (health insurance includes HIPAA)
  [ ] 72-hour breach notification to DOI
  [ ] Annual cybersecurity risk assessment
  [ ] Third-party vendor security assessments

Platform choices:
  - Hosting: AWS or Azure (SOC2 certified, regulatory data retention)
  - Database: PostgreSQL on RDS (encrypted, multi-AZ, 7-year retention for claims)
  - Rating engine: Custom microservice or Guidewire (enterprise)
  - Document generation: PDFKit or Puppeteer (policy documents, Dec pages)
```

### Legal / LegalTech (ABA Model Rules + IOLTA)
```
Ethics / Bar Compliance:
  [ ] Client confidentiality (ABA Model Rule 1.6) — all data encrypted
  [ ] Conflict of interest checking before engagement (Rule 1.7)
  [ ] Trust account (IOLTA) separation from operating accounts
  [ ] Trust account reconciliation (monthly, three-way reconciliation)
  [ ] Client file retention (varies by jurisdiction, typically 5-7 years after matter close)
  [ ] Data disposal after retention period

E-Discovery:
  [ ] Litigation hold capability (prevent deletion of relevant documents)
  [ ] Chain of custody for evidence
  [ ] Document review and privilege logging
  [ ] Export in standard formats (EDRM, Concordance, Relativity)

Platform choices:
  - Hosting: AWS or Azure (law firm data residency requirements)
  - Auth: MFA mandatory, session timeout, audit logging
  - Trust accounting: Separate database or schema for trust transactions
  - Document storage: S3 with versioning + MFA delete protection
```

---

## INDUSTRY-SPECIFIC INFRASTRUCTURE PATTERNS

### Healthcare Infrastructure Stack
```
Hosting:      AWS ECS/Fargate (BAA available) or Azure (HITRUST)
Database:     AWS RDS PostgreSQL (encrypted, multi-AZ) — BAA covers RDS
Cache:        ElastiCache Redis (BAA available)
Auth:         Clerk Enterprise or custom with MFA + session timeout (15 min)
File storage: S3 with encryption (medical images, documents)
FHIR:         Medplum (self-hosted) or AWS HealthLake (managed FHIR)
Monitoring:   CloudWatch (BAA) + custom PHI access dashboard
Backup:       Daily automated + 30-day PITR + cross-region replication
```

### Fintech Infrastructure Stack
```
Hosting:      AWS ECS (multi-AZ, auto-scaling) — never single-AZ for financial
Database:     AWS RDS PostgreSQL (encrypted, multi-AZ, automated failover)
Cache:        ElastiCache Redis (session + rate limiting + idempotency keys)
Payments:     Stripe (PCI scope reduction — they handle card data)
Queue:        SQS + Lambda for async transaction processing
Monitoring:   Datadog APM + custom fraud/AML alerting
Security:     WAF, DDoS protection (AWS Shield), IP allowlisting for admin
Backup:       Continuous PITR, 7-year retention for financial records
DR:           Multi-region active-passive, <15 min RPO, <1 hour RTO
```

### Logistics Infrastructure Stack
```
Hosting:      AWS ECS or GKE (multi-region for global logistics)
Database:     PostgreSQL 18 + TimescaleDB (tracking events)
Event stream: Kafka/Redpanda (carrier webhooks, IoT telemetry, GPS events)
Cache:        Redis (rate quoting cache, tracking cache)
Mapping:      Mapbox (route optimization, geocoding) — $0 up to 100K loads/mo
EDI:          AS2 gateway (Cleo, custom) + SFTP for legacy carriers
IoT:          MQTT broker (AWS IoT Core) for vehicle/container sensors
Monitoring:   Grafana + Prometheus (operational dashboards)
```

### Hospitality Infrastructure Stack
```
Hosting:      Vercel (edge caching for listing pages) + Railway (booking engine)
Database:     PostgreSQL 18 + PostGIS on Supabase (geospatial queries)
Search:       Meilisearch (faceted search: location, dates, price, amenities)
Cache:        Redis (availability cache, pricing cache, session)
CDN:          Cloudflare (property images, aggressive caching for listing pages)
Payments:     Stripe Connect (guest charges, host payouts, security deposits)
Mapping:      Mapbox GL JS (interactive property maps)
Email:        Resend (booking confirmations, host notifications)
Monitoring:   Sentry + PostHog (booking funnel analytics)
```

---

## AI-READY INFRASTRUCTURE

### LLM Deployment Patterns
```
Pattern 1: Managed API (most common)
  App → Vercel AI SDK → Claude/GPT API → Response
  Cost: Per-token pricing
  Latency: 200-2000ms (depends on output length)
  Scale: Unlimited (provider handles scaling)

Pattern 2: Self-Hosted (cost optimization at scale)
  App → vLLM/TGI on GPU instance → Open-source model → Response
  Cost: GPU instance hourly ($2-8/hr for A100)
  When: >$5K/month in API costs, or data privacy requirements

Pattern 3: Edge Inference (real-time, small models)
  Browser/Device → ONNX/TFLite model → Local inference
  Cost: Zero marginal
  When: Classification, embeddings, autocomplete
```

### Embedding & Vector Infrastructure
```
Small scale (<10M vectors):
  PostgreSQL + pgvector on Supabase/Neon
  Cost: $0-50/month
  Latency: <50ms at 99th percentile

Medium scale (10M-100M vectors):
  pgvectorscale (Timescale) or dedicated Qdrant
  Cost: $100-500/month
  Latency: <100ms at 99th percentile

Large scale (>100M vectors):
  Pinecone, Weaviate, or Milvus cluster
  Cost: $500-5000/month
  Latency: <200ms at 99th percentile
```

---

## SELF-HOSTING CASE STUDY: VERCEL → COOLIFY

### Scenario
A SaaS startup with ~5K MAU, Next.js frontend, PostgreSQL backend, monthly Vercel bill hitting $500+.

### Migration Path
```
Before (Vercel Pro):              After (Coolify on Hetzner):
────────────────────              ─────────────────────────
Vercel Pro ($20 + usage)     →    Hetzner CX42 ($35/mo, 8 vCPU, 16GB RAM)
Edge Functions ($$$)         →    Node.js server (included)
Image optimization ($$$)     →    Sharp (self-hosted, free)
Analytics (extra)            →    PostHog self-hosted (free)
Preview deployments          →    Coolify preview URLs (included)
Custom domains + SSL         →    Coolify + Let's Encrypt (free)
────────────────────              ─────────────────────────
Total: $500+/mo              →    Total: $35-55/mo (93% savings)
```

### What You Get with Coolify
- Git-push deployments (connect GitHub/GitLab repo)
- Automatic HTTPS (Let's Encrypt)
- Preview environments per PR
- Docker-based (deploy anything: Next.js, Hono, Python, Go)
- Built-in PostgreSQL, Redis, MinIO (S3-compatible storage)
- Server monitoring dashboard
- One-click app marketplace (Supabase, Plausible, Umami, etc.)

### What You Lose (and Mitigations)
| Lost Feature | Mitigation |
|-------------|------------|
| Vercel Edge Network (CDN) | Add Cloudflare Free tier ($0) — 300+ PoPs globally |
| Automatic scaling | Coolify supports Docker Swarm; add nodes when needed |
| Vercel Analytics | PostHog self-hosted or Plausible ($0) |
| ISR (Incremental Static Regeneration) | Use `next start` with `revalidate` — works the same |
| Zero-config DX | Coolify has ~30 min initial setup, then identical DX |

### Who Should NOT Self-Host
- Prototype/MVP stage (focus on product, not infra)
- No Linux/Docker experience on team
- Compliance requirements mandating specific cloud providers (AWS GovCloud, etc.)
- Global edge computing is a core requirement (use Cloudflare Workers instead)

---

## STAGE MIGRATION PATHS

### MVP → Growth
```
Before (MVP):              After (Growth):
Vercel Free               → Vercel Pro or Coolify on Hetzner
Supabase Free (500MB)     → Supabase Pro (8GB) or Neon Pro
No caching                → Redis/Upstash for sessions + API cache
No monitoring              → Sentry + BetterStack (Logtail)
Manual deploys             → GitHub Actions CI/CD
Single region              → Multi-region CDN (Cloudflare)

Trigger: >1K monthly active users or >$200/month cloud spend
```

### Growth → Scale
```
Before (Growth):           After (Scale):
Vercel Pro                → Self-hosted on AWS ECS or Kubernetes
Supabase Pro              → Self-managed PostgreSQL (RDS or Neon Enterprise)
Redis (Upstash)           → Self-managed Redis cluster (ElastiCache)
Single DB                 → Read replicas + connection pooling (PgBouncer)
Basic monitoring          → Full observability (Datadog or Grafana Cloud)
Single region             → Multi-region deployment

Trigger: >100K MAU, latency SLAs, or compliance requirements
```
- Over-engineered for MVP (Kubernetes for 10 users)
