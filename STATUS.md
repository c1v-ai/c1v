# C1V Platform Status & Plan

> **Last Updated:** 2026-01-31
> **Author:** David Ancor
> **Purpose:** Single source of truth for c1v platform architecture, status, and execution plan

---

## Platform Overview

C1V is a two-product platform for AI-native development:

```
┌─────────────────────────────────────────────────────────────┐
│  prd.c1v.ai                                                 │
│  "Product & Process Requirements"                           │
│                                                             │
│  • PRDs for products (SaaS, E-commerce, B2C apps)          │
│  • Process requirements for agent systems                   │
│  • Auth: Custom JWT (jose + bcryptjs), NOT Clerk           │
│  • Status: V2 COMPLETE, needs commit + deploy              │
└─────────────────────────────────────────────────────────────┘
                           │ Uses (ASPIRATIONAL)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  id.c1v.ai                                                  │
│  "Machine-to-Machine Consent Protocol"                      │
│                                                             │
│  • Identity resolution (c1v-id PyPI - ALREADY PUBLISHED)   │
│  • Bilateral consent (THE DIFFERENTIATOR)                  │
│  • Agent authorization (scoped API keys → Agent PIN)       │
│  • Dual audit logging (compliance-ready)                   │
│  • Status: Core logic exists, API wrapper needed           │
└─────────────────────────────────────────────────────────────┘
```

**Integration Note:** The "Uses" arrow is **ASPIRATIONAL**. prd.c1v.ai does NOT currently call id.c1v.ai. They share infrastructure (Supabase, auth patterns) but are independent products for Weekend 1. Future integration: prd.c1v.ai could use id.c1v.ai for user identity resolution across projects.

---

## Current State (Validated)

### prd.c1v.ai (Product Helper)

| Aspect | Status | Evidence |
|--------|--------|----------|
| **Codebase** | 95% complete | 36/36 CLEO tasks done |
| **Git status** | ⚠️ UNCOMMITTED CHANGES | Deleted chat files, modified routes |
| **Branch** | `feature/T022-quick-start-mode` | Needs merge to main |
| **Auth** | Custom JWT | jose + bcryptjs (NOT Clerk) |
| **Deployment** | Not deployed | Vercel ready, needs env vars |
| **Blockers** | P0 security fixes needed | CORS, rate limiting, LLM timeout |

**Uncommitted changes:**
```
D app/(dashboard)/projects/[id]/chat/chat-client.tsx
D app/(dashboard)/projects/[id]/chat/layout.tsx
D components/chat/artifacts-sidebar.tsx
M app/api/chat/projects/[projectId]/route.ts
M app/api/chat/projects/[projectId]/langgraph-handler.ts
```

**Chat Refactor Decision: [REQUIRED BEFORE COMMIT]**

The deleted files suggest a chat system refactor in progress:

| Option | Action | Risk |
|--------|--------|------|
| A. Complete refactor | Review intent, finish work | Medium - may take 2-4h |
| B. Revert to working | `git checkout -- .` | Low - known working state |
| C. Ship as-is | If chat works without files | Unknown - needs testing |

**Decision: Test chat functionality first. If working → commit. If broken → revert.**

**P0 Security Fixes Required:**
1. CORS: Change `*` → `process.env.BASE_URL` in MCP route
2. Rate limit: Add to chat endpoint (20 req/min)
3. LLM timeout: Add 30s timeout to langchain config

### id.c1v.ai (Identity + Consent)

| Aspect | Status | Evidence |
|--------|--------|----------|
| **PyPI package** | ✅ PUBLISHED | `c1v-id 0.1.0` on PyPI (2026-01-24) |
| **Core logic** | ✅ Working | IdentityResolver, blocking, clustering |
| **API wrapper** | ❌ Not built | Need FastAPI + MCP endpoint |
| **Consent protocol** | ❌ Not built | Design exists, no code |
| **Database** | ❌ Not set up | Need Supabase schema |

**c1v-id PyPI Package (Already Published):**
```python
from c1v_id import IdentityResolver

resolver = IdentityResolver()
result = resolver.resolve([
    {"email": "john@gmail.com", "name": "John Doe"},
    {"email": "johnd@gmail.com", "name": "Johnny Doe"},
])
# Returns merged golden records
```

**PyPI Reconciliation (Important):**

| Location | What It Is | Use? |
|----------|------------|------|
| `c1v-id` on PyPI | Clean, extracted library (0.1.0) | ✅ **USE THIS** |
| `apps/c1v-identity/` | Legacy batch processor with hardcoded paths | ❌ REFERENCE ONLY |

When building `id-api`, install from PyPI:
```bash
pip install c1v-id  # From PyPI, not local
```

Verify before using:
```bash
pip install c1v-id && python -c "from c1v_id import IdentityResolver; print('OK')"
```

---

## Strategic Positioning

### The Market Reality

| Segment | Size | C1V Position |
|---------|------|--------------|
| Identity resolution (Dedupe.io, Amperity) | $2B+ | Late, undifferentiated |
| Agent tooling (LangChain ecosystem) | $500M, 10x growth | Early, differentiated |
| Machine-to-machine consent | ~$0 (new category) | **First mover** |

### The Strategic Error to Avoid

```
❌ WRONG: "We're a deduplication API (v1), later we'll add consent (v2)"
   → You're a worse Dedupe.io

✅ RIGHT: "We're a consent protocol for machine-to-machine identity"
   → Unique positioning, dedup is just a feature
```

### The Real Moat

The moat is NOT identity resolution (everyone can do fuzzy matching).

The moat IS:
1. **Bilateral consent** - Both parties must agree before data flows
2. **Audit trail** - Prove agent A was authorized to access record X at time T
3. **Compliance-ready logs** - GDPR Article 30, HIPAA audit requirements

### Competitive Gap

| Solution | What It Does | What's Missing |
|----------|--------------|----------------|
| OAuth 2.0 | User authorizes app | Not agent-to-agent |
| SPIFFE/SPIRE | Workload identity | No consent semantics |
| API Keys | Unilateral access | No bilateral agreement |
| Verifiable Credentials | Identity claims | No runtime consent |
| **C1V Protocol** | Bilateral consent + audit | **First to market** |

---

## Architecture

### Repository Structure

```
c1v/
├── apps/
│   ├── product-helper/      # Next.js → prd.c1v.ai (Vercel)
│   │   └── [NEEDS: commit P0 fixes + deploy]
│   │
│   ├── c1v-identity/        # LEGACY batch processor
│   │   └── [KEEP for reference, superseded by PyPI]
│   │
│   └── id-api/              # NEW: FastAPI → id.c1v.ai (Railway)
│       ├── src/
│       │   ├── main.py      # FastAPI app
│       │   ├── routes/
│       │   │   ├── resolve.py   # Uses c1v-id from PyPI
│       │   │   ├── consent.py   # Bilateral consent
│       │   │   └── mcp.py       # MCP endpoint (distribution!)
│       │   ├── middleware/
│       │   │   └── auth.py      # API key + scope checking
│       │   └── models/
│       │       ├── consent.py   # Contract, PIN models
│       │       └── audit.py     # Audit log models
│       ├── requirements.txt
│       │   └── c1v-id>=0.1.0    # Install from PyPI
│       └── Dockerfile
│
├── packages/
│   └── c1v-id/              # https://github.com/davidancor/c1v-id
│       └── [ALREADY ON PYPI - external repo]
│
├── STATUS.md                # THIS FILE
└── ARCHITECTURE.md          # Technical deep-dive (future)
```

### Shared Infrastructure

| Resource | Used By | Notes |
|----------|---------|-------|
| Supabase (Postgres) | Both apps | Same instance, different schemas |
| JWT secret | Both apps | Shared via env vars |
| Domain | prd.c1v.ai, id.c1v.ai | Vercel + Railway DNS |

---

## Database Schema (id-api)

Minimum viable schema for id.c1v.ai:

```sql
-- Organizations (tenants)
CREATE TABLE orgs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Keys (scoped)
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES orgs(id),
    key_hash TEXT NOT NULL,  -- bcrypt hash, not plaintext
    prefix TEXT NOT NULL,    -- "c1v_sk_abc" for display
    scopes TEXT[] NOT NULL,  -- ["resolve:read", "match:read"]
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Log
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES orgs(id),
    api_key_id UUID REFERENCES api_keys(id),
    action TEXT NOT NULL,    -- "resolve", "match", "batch"
    payload JSONB,           -- request metadata (not PII)
    response_code INT,
    latency_ms INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for audit queries
CREATE INDEX idx_audit_logs_org_created
    ON audit_logs(org_id, created_at DESC);

-- Index for key lookup
CREATE INDEX idx_api_keys_prefix
    ON api_keys(prefix);
```

---

## API Specification (id-api)

### Endpoints

```yaml
# Health Check
GET /v1/health
  Description: Health check
  Auth: None
  Response:
    status: "ok"
    version: "0.1.0"

# Identity Resolution
POST /v1/resolve
  Description: Resolve identity from records
  Auth: API Key (scope: resolve:read)
  Request:
    records: [{email, name, phone, ...}]
    options: {threshold: 0.9}
  Response:
    golden_records: [...]
    clusters: [...]
    metrics: {input_count, output_count, dup_rate}

# Pairwise Matching
POST /v1/match
  Description: Match two records
  Auth: API Key (scope: match:read)
  Request:
    record_a: {email, name, ...}
    record_b: {email, name, ...}
  Response:
    score: 0.97
    decision: "auto_merge" | "needs_review" | "no_match"
    matched_on: ["email", "name"]

# Find Matches
POST /v1/find-matches
  Description: Find matches for a record in existing data
  Auth: API Key (scope: match:read)
  Request:
    incoming: {email, name, ...}
    existing: [{...}, {...}]
  Response:
    matches: [{record, score, decision}, ...]

# MCP Endpoint
POST /mcp
  Description: MCP-compatible endpoint for LangChain
  Auth: API Key
  Request: MCP JSON-RPC format
  Response: MCP JSON-RPC format
```

### Error Responses

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing API key"
  }
}
```

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid API key |
| `FORBIDDEN` | 403 | Key lacks required scope |
| `RATE_LIMITED` | 429 | Too many requests |
| `VALIDATION_ERROR` | 422 | Invalid request body |
| `INTERNAL_ERROR` | 500 | Server error |

---

## MCP Tool Definitions

Tools exposed by id.c1v.ai for LangChain integration:

```python
tools = [
    {
        "name": "resolve_identity",
        "description": "Resolve duplicates in a list of records and return golden records",
        "inputSchema": {
            "type": "object",
            "properties": {
                "records": {
                    "type": "array",
                    "items": {"type": "object"},
                    "description": "Records to deduplicate (each with email, name, phone, etc.)"
                },
                "threshold": {
                    "type": "number",
                    "description": "Match threshold (0.0-1.0, default 0.9)",
                    "default": 0.9
                }
            },
            "required": ["records"]
        }
    },
    {
        "name": "match_records",
        "description": "Check if two records refer to the same entity",
        "inputSchema": {
            "type": "object",
            "properties": {
                "record_a": {"type": "object", "description": "First record"},
                "record_b": {"type": "object", "description": "Second record"}
            },
            "required": ["record_a", "record_b"]
        }
    },
    {
        "name": "find_matches",
        "description": "Find potential matches for a record in existing data",
        "inputSchema": {
            "type": "object",
            "properties": {
                "incoming": {"type": "object", "description": "Record to match"},
                "existing": {"type": "array", "description": "Records to search"}
            },
            "required": ["incoming", "existing"]
        }
    }
]
```

**Usage with LangChain:**
```python
from langchain_mcp_adapters.client import MultiServerMCPClient

client = MultiServerMCPClient({
    "identity": {"transport": "http", "url": "https://id.c1v.ai/mcp"}
})
tools = await client.get_tools()
# Now any LangChain agent can resolve identities
```

---

## Environment Variables

### product-helper (prd.c1v.ai)

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `POSTGRES_URL` | Yes | `postgres://...` | Supabase connection |
| `AUTH_SECRET` | Yes | `32+ character secret` | JWT signing |
| `ANTHROPIC_API_KEY` | Yes | `sk-ant-...` | Claude API |
| `BASE_URL` | Yes | `https://prd.c1v.ai` | For CORS |
| `STRIPE_SECRET_KEY` | No | `sk_test_...` | Payments (use test key!) |
| `STRIPE_WEBHOOK_SECRET` | No | `whsec_...` | Webhook validation |

### id-api (id.c1v.ai)

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `DATABASE_URL` | Yes | `postgres://...` | Supabase connection |
| `JWT_SECRET` | Yes | `same as product-helper` | Shared auth |
| `ALLOWED_ORIGINS` | Yes | `https://prd.c1v.ai` | CORS whitelist |
| `SENTRY_DSN` | No | `https://...@sentry.io/...` | Error tracking |

---

## Rollback Plan

If deployment goes wrong:

### product-helper (Vercel)
```bash
# Option 1: Vercel Dashboard
# Deployments → Find previous working deployment → "..." → Redeploy

# Option 2: Git revert (triggers auto-deploy)
git revert HEAD
git push origin main
```

### id-api (Railway)
```bash
# Option 1: Railway CLI
railway rollback

# Option 2: Railway Dashboard
# Deployments → Previous → Redeploy
```

### Nuclear Option (LAST RESORT)
```bash
# Revert all changes and force push
git reset --hard HEAD~1
git push --force origin main
```

---

## Consent Protocol Design (v1 → v2)

### V1: Scoped API Keys (Ship This Weekend)

Simple, shippable, immediately useful:

```
Agent A requests → id.c1v.ai checks API key scope → Allow/Deny → Log
```

**Implementation:**
- `POST /api-keys` - Create key with scopes
- Middleware checks scope on each request
- Every call logged to `audit_logs` table

**Scopes example:**
```json
{
  "key": "c1v_sk_...",
  "org_id": "org_123",
  "scopes": ["resolve:read", "match:read"],
  "created_at": "2026-01-31T00:00:00Z"
}
```

### V2: Bilateral Consent (Week 2+)

Full protocol when enterprise demand validates it:

```
SETUP (once per relationship):
Party A proposes contract → Party B signs → Contract active

RUNTIME (every request):
Agent requests PIN → C1V validates contract → Issues PIN (60s TTL)
Agent presents PIN to target system → Target validates → Returns data
Both sides log independently
```

**State machine:**
```
DRAFT → PROPOSED → SIGNED_BY_A → SIGNED_BY_B → ACTIVE → REVOKED
                                      ↓
                                   EXPIRED
```

**Data models:**
```python
@dataclass
class ConsentContract:
    contract_id: str
    party_a: str              # Org A identifier
    party_b: str              # Org B identifier
    data_types: list[str]     # ["patient_record", "appointment"]
    actions: list[str]        # ["read", "update"]
    purpose: str              # "appointment_scheduling"
    expires_at: datetime
    party_a_signature: str    # Cryptographic proof
    party_b_signature: str

@dataclass
class AgentPIN:
    pin_id: str
    contract_id: str
    agent_id: str
    scope: list[str]
    expires_at: datetime      # 60 seconds TTL
    signature: str            # C1V cryptographic proof
```

---

## Pre-Flight Checklist (Weekend 1)

### Before Committing product-helper
- [ ] Test chat functionality (does it work with deleted files?)
- [ ] Make decision: Complete refactor / Revert / Ship as-is
- [ ] Apply P0 security fixes (CORS, rate limit, timeout)
- [ ] Switch Stripe keys from live to test (`sk_test_...`)
- [ ] Verify `BASE_URL` is set correctly in `.env.local`

### Before Deploying id-api
- [ ] Verify c1v-id PyPI works:
  ```bash
  pip install c1v-id && python -c "from c1v_id import IdentityResolver; print('OK')"
  ```
- [ ] Run Supabase schema SQL (orgs, api_keys, audit_logs tables)
- [ ] Set environment variables in Railway dashboard
- [ ] Test locally first:
  ```bash
  cd apps/id-api
  uvicorn src.main:app --reload --port 8000
  curl http://localhost:8000/v1/health
  ```

### Before Announcing
- [ ] Run all smoke tests (see Smoke Tests section)
- [ ] Verify DNS propagation for prd.c1v.ai and id.c1v.ai
- [ ] Test one real API call end-to-end

---

## Execution Plan

### Task Dependencies

```
┌─────────────────────────────────┐
│ A. Test chat functionality      │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ B. Decision: commit or revert   │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ C. Apply P0 security fixes      │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ D. Deploy product-helper        │
└────────────┬────────────────────┘
             │                          ┌─────────────────────────────────┐
             │                          │ E. Create id-api scaffold       │
             │                          └────────────┬────────────────────┘
             │                                       │
             │                                       ▼
             │                          ┌─────────────────────────────────┐
             │                          │ F. Add MCP endpoint             │
             │                          └────────────┬────────────────────┘
             │                                       │
             │                                       ▼
             │                          ┌─────────────────────────────────┐
             │                          │ G. Deploy id-api                │
             │                          └────────────┬────────────────────┘
             │                                       │
             ▼                                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        H. BOTH APPS LIVE                                │
└─────────────────────────────────────────────────────────────────────────┘

Critical path: A → B → C → D (product-helper must be clean first)
Parallelizable: E, F, G (id-api work) can happen in parallel with product-helper
```

### Weekend 1: Get Live (10-12 hours realistic)

**Goal:** Two products deployed, basic functionality working

| Task | Optimistic | Realistic | Buffer | Deliverable |
|------|------------|-----------|--------|-------------|
| A. Test chat functionality | - | 1h | - | Know if chat works |
| B. Decide: commit/revert | 0.5h | 1h | 0.5h | Clean decision |
| C. Apply P0 security fixes | 1h | 1.5h | 0.5h | CORS, rate limit, timeout |
| D. Deploy product-helper | 1h | 2h | 1h | prd.c1v.ai live |
| E. Create id-api scaffold | 2h | 3h | 1h | FastAPI + c1v-id |
| F. Add MCP endpoint | 1h | 1.5h | 0.5h | LangChain integration |
| G. Deploy id-api | 1h | 2h | 1h | id.c1v.ai live |
| **TOTAL** | 7.5h | **12h** | 4.5h | |

**Realistic estimate: 10-12 hours (a full weekend day, not half)**

**Result:**
- prd.c1v.ai → Live PRD generation tool
- id.c1v.ai → Live identity API with MCP support

### Git Strategy

1. Test chat on `feature/T022-quick-start-mode`
2. If working: `git add -A && git commit -m "feat: complete V2"`
3. If broken: `git checkout -- .` to revert
4. Merge to `main`: `git checkout main && git merge feature/T022-quick-start-mode`
5. Deploy `main` to production

### Weekend 2: Consent v1 (8 hours)

| Task | Time | Deliverable |
|------|------|-------------|
| Supabase schema (orgs, api_keys, audit_logs) | 2h | Database ready |
| POST /api-keys endpoint | 2h | Key creation with scopes |
| Auth middleware (scope checking) | 2h | Request validation |
| Audit logging middleware | 1h | Every call logged |
| Dashboard: view audit trail | 1h | Basic visibility |

**Result:** Scoped API keys with full audit trail

### Week 2+: Consent v2 (If Enterprise Demand)

| Task | Time | Deliverable |
|------|------|-------------|
| Contract state machine | 8h | DRAFT → ACTIVE → REVOKED |
| Bilateral signing flow | 8h | Both parties cryptographically sign |
| Agent PIN issuance | 4h | Short-lived tokens |
| PIN validation endpoint | 4h | Target system verification |
| Dual logging | 4h | Independent audit on both sides |
| Compliance exports | 4h | GDPR Article 30 format |

**Total:** ~32 hours (not a weekend)

---

## Cost Estimates

### Monthly Infrastructure

| Service | Tier | Cost | Notes |
|---------|------|------|-------|
| Vercel (prd.c1v.ai) | Pro | $20/mo | Includes analytics |
| Railway (id-api) | Starter | $5-20/mo | Scales with usage |
| Supabase | Pro | $25/mo | Shared by both apps |
| Domain (c1v.ai) | - | $20/yr | ~$2/mo |
| Sentry | Free | $0 | Error tracking |
| BetterStack | Free | $0 | Uptime monitoring |
| **Total** | | **~$50-65/mo** | |

### Scaling Costs (Future)

| Usage Level | Estimated Cost |
|-------------|----------------|
| 1K API calls/mo | ~$50/mo |
| 10K API calls/mo | ~$75/mo |
| 100K API calls/mo | ~$150/mo |
| 1M API calls/mo | ~$500/mo |

---

## Launch Plan

### Soft Launch (Day 1)

- [ ] Deploy both apps
- [ ] Tweet from personal account
- [ ] Post in LangChain Discord #showcase
- [ ] DM 5 AI developers for feedback

### Public Launch (Week 2)

- [ ] Hacker News: "Show HN: Consent protocol for AI agents"
- [ ] Dev.to article: "Why your AI agent needs bilateral consent"
- [ ] r/LangChain, r/MachineLearning posts
- [ ] ProductHunt (if early traction)

### Launch Messaging

| Channel | Headline |
|---------|----------|
| Hacker News | "Show HN: Consent protocol for machine-to-machine identity" |
| Twitter/X | "Your AI agent can read data. But did the data consent? We built the protocol." |
| LangChain Discord | "New MCP tool: Identity resolution with audit trails" |
| LinkedIn | "The missing layer in agentic AI: bilateral consent" |

### Enterprise Outreach (Month 1)

- [ ] Cold outreach to 10 AI-first companies
- [ ] Target verticals: Healthcare (HIPAA), Finance (SOX), Legal (client confidentiality)
- [ ] Leverage Cornell AI Network connections

---

## Monitoring

| What | Tool | Setup Time | Cost |
|------|------|------------|------|
| Errors | Sentry | 30 min | Free |
| Uptime | BetterStack | 15 min | Free |
| Logs | Railway built-in | Free | Free |
| API metrics | Supabase pg_stat | Free | Free |
| LLM costs | Manual tracking | - | - |

### Alerts to Configure

- [ ] Sentry: Error rate > 1% → Slack
- [ ] BetterStack: Downtime > 1 min → SMS
- [ ] Supabase: DB connections > 80% → Email

---

## Success Metrics

### Week 1 (Ship)
- [ ] prd.c1v.ai deployed and accessible
- [ ] id.c1v.ai deployed with /resolve, /mcp endpoints
- [ ] At least 1 external developer uses MCP integration

### Month 1 (Validate)
- [ ] 100+ API calls to id.c1v.ai
- [ ] 10+ PyPI downloads of c1v-id
- [ ] 1 enterprise conversation about consent protocol

### Quarter 1 (Scale)
- [ ] Consent v1 (scoped keys) in production
- [ ] 3+ paying customers for prd.c1v.ai
- [ ] RFC published for bilateral consent protocol

---

## Smoke Tests (Before Announcing)

Run these after both deploys to verify everything works:

### product-helper (prd.c1v.ai)
```bash
# Health check - should return 200
curl -I https://prd.c1v.ai
# Expected: HTTP/2 200

# Auth page loads
curl -I https://prd.c1v.ai/sign-in
# Expected: HTTP/2 200

# API responds (proves backend is running)
curl https://prd.c1v.ai/api/user
# Expected: 401 Unauthorized (not authenticated, but API is alive)

# Projects page (if logged in via browser)
# Navigate to https://prd.c1v.ai/projects
# Expected: Page loads without errors
```

### id-api (id.c1v.ai)
```bash
# Health check
curl https://id.c1v.ai/v1/health
# Expected: {"status": "ok", "version": "0.1.0"}

# Resolve endpoint (with test data, needs API key)
curl -X POST https://id.c1v.ai/v1/resolve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"records": [
    {"email": "john@example.com", "name": "John Doe"},
    {"email": "johnd@example.com", "name": "Johnny Doe"}
  ]}'
# Expected: 200 with golden_records array

# MCP tool list (LangChain integration)
curl -X POST https://id.c1v.ai/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}'
# Expected: Returns 3 tools (resolve_identity, match_records, find_matches)
```

### Quick Validation Checklist
- [ ] prd.c1v.ai returns 200 on homepage
- [ ] prd.c1v.ai/sign-in page renders
- [ ] id.c1v.ai/v1/health returns OK
- [ ] id.c1v.ai/mcp returns tool list
- [ ] No 500 errors in Railway/Vercel logs

---

## Known Issues & Risks

### Product Helper (prd.c1v.ai)

| Issue | Severity | Mitigation |
|-------|----------|------------|
| Uncommitted chat refactor | Medium | Test first, then decide |
| P0 security gaps | High | Fix before deploy |
| drizzle-kit migrate broken | Medium | Use Supabase MCP directly |
| Live Stripe keys in dev | High | Switch to test keys |
| Shared prod DB for dev | High | Create separate Supabase project |

### Identity API (id.c1v.ai)

| Issue | Severity | Mitigation |
|-------|----------|------------|
| No API wrapper yet | High | Weekend 1 priority |
| Consent protocol complexity | Medium | Ship v1 (simple scopes) first |
| Market timing | High | Ship MCP integration ASAP |

### Strategic Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Positioned as "deduplication tool" | High | Lead with consent, not resolution |
| Window closes (6-12 months) | High | Ship MCP this weekend |
| Over-engineering consent v1 | Medium | Keep it to scoped API keys |

---

## Key Decisions Made

| Decision | Rationale |
|----------|-----------|
| Two products (prd + id), not three | PRD covers both product and process requirements |
| Monorepo, not separate repos | Shared Supabase, shared auth, solo developer |
| c1v-id stays on PyPI | Already extracted and published, don't duplicate |
| Consent v1 = scoped API keys | Ship fast, validate demand, add complexity later |
| MCP endpoint is priority | LangChain distribution channel, 10x reach |
| Railway for id-api (not Vercel) | Python/FastAPI better suited to Railway |

---

## References

| Document | Location | Purpose |
|----------|----------|---------|
| Product Helper State | `apps/product-helper/.planning/STATE.md` | Detailed V2 status |
| Identity Vision | `apps/c1v-identity/CURRENT-STATUS.md` | Full protocol design |
| Monorepo README | `/README.md` | Developer onboarding |
| c1v-id Package | https://pypi.org/project/c1v-id/ | Published library |

---

## Next Action

**This weekend: Execute Weekend 1 plan**

### Step 1: Test Chat (1h)
```bash
cd apps/product-helper
pnpm dev
# Navigate to a project → chat
# Test: Can you send messages? Do responses stream?
# Test: Are there console errors?
```

### Step 2: Make Decision
- Chat works → Proceed to commit
- Chat broken → `git checkout -- .` to revert

### Step 3: Apply P0 Fixes + Commit
```bash
# Fix CORS in app/api/mcp/[projectId]/route.ts
# Fix rate limit in app/api/chat/projects/[projectId]/route.ts
# Fix timeout in lib/langchain/config.ts

git add -A
git commit -m "feat: complete V2 with security hardening

- Fix CORS to use BASE_URL instead of wildcard
- Add rate limiting to chat endpoint (20 req/min)
- Add 30s timeout to LLM calls
- Remove unused chat components (refactor complete)

Co-Authored-By: Claude <noreply@anthropic.com>"

git checkout main
git merge feature/T022-quick-start-mode
git push origin main
```

### Step 4: Deploy product-helper
```bash
cd apps/product-helper
vercel --prod
# Set env vars in Vercel dashboard
# Point prd.c1v.ai DNS
```

### Step 5: Create id-api (can parallelize)
```bash
mkdir -p apps/id-api/src/routes
cd apps/id-api
# Create FastAPI scaffold (see Architecture section)
```

### Step 6: Deploy id-api
```bash
cd apps/id-api
railway up
# Set env vars in Railway dashboard
# Point id.c1v.ai DNS
```

---

*Status updated: 2026-01-31*
