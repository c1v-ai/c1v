<!-- CLEO:START -->
@.cleo/templates/AGENT-INJECTION.md
<!-- CLEO:END -->

# c1v Monorepo

## Quick Start

```bash
pnpm install                                    # from repo root
pnpm dev --filter=product-helper                # main app, port 3000
# tests (per-app, not monorepo-wide):
cd apps/product-helper && POSTGRES_URL=stub AUTH_SECRET=stub ANTHROPIC_API_KEY=stub \
  STRIPE_SECRET_KEY=stub STRIPE_WEBHOOK_SECRET=stub BASE_URL=http://localhost:3000 \
  npx jest
```

## Current Reality (2026-04-24)

**Apps that actually exist:**
- `apps/product-helper/` — Next.js 15 AI-native PRD + system-design tool (main, deployed at prd.c1v.ai)
- `apps/c1v-identity/` — Python/FastAPI identity CDP (scaffold; see app-level CLAUDE.md)

**Fresh Claude after `/clear`, read in order:**
1. `plans/HANDOFF-2026-04-24-c1v-MIT-Crawley-Cornell-v2.md` — session transcript + locked decisions
2. `plans/c1v-MIT-Crawley-Cornell.v2.md` — authoritative plan
3. This file (below) for methodology stack + gotchas
4. `apps/product-helper/CLAUDE.md` for app-specific conventions

The "Recommended Monorepo Structure" section below is **aspirational** (from an earlier Claude session) — treat as roadmap, not reality. `apps/web/`, `apps/admin/`, `packages/*`, `python-packages/`, `services/`, `infra/` do NOT exist yet.

---

# c1v Monorepo Recommendation (Claude + inline comments)

**How to read this doc**
- **Claude’s content** is preserved *in full* below.
- My **suggestions are embedded as “Comment:” callouts** right next to the relevant sections.

---

## Claude’s Recommendation (verbatim)

⏺ Perfect! I've reviewed both projects. Here's my recommended monorepo structure to support both c1v-identity (AI-native CDP) and product-helper (PRD generation tool) with shared infrastructure:

### Recommended Monorepo Structure

c1v-monorepo/
├── apps/
│   ├── web/                          # Unified Platform (Next.js)
│   │   ├── app/
│   │   │   ├── (auth)/              # Auth pages
│   │   │   ├── (marketing)/         # Landing, pricing
│   │   │   ├── dashboard/           # Unified dashboard
│   │   │   │   ├── identity/        # Route to identity CDP
│   │   │   │   └── product-helper/  # Route to PRD tool
│   │   │   └── api/                 # BFF (Backend for Frontend)
│   │   ├── components/
│   │   └── package.json
│   │
│   ├── identity-api/                # Python/FastAPI (from identity-mvp)
│   │   ├── src/
│   │   │   ├── ask_data/           # Natural language queries
│   │   │   ├── identity/           # Identity resolution
│   │   │   ├── dq_gate/            # Data quality
│   │   │   ├── gen/                # Synthetic data
│   │   │   ├── serve/              # FastAPI app
│   │   │   └── demo/               # Streamlit UI
│   │   ├── tests/
│   │   ├── requirements.txt
│   │   └── pyproject.toml
│   │
│   ├── product-helper/              # Next.js app (PRD generation)
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   ├── projects/
│   │   │   │   ├── intake/         # Conversational intake
│   │   │   │   ├── artifacts/      # Generate diagrams
│   │   │   │   └── agents/         # LangGraph agents
│   │   │   ├── dashboard/
│   │   │   └── projects/
│   │   ├── lib/
│   │   │   ├── agents/             # Orchestrator, specialists
│   │   │   ├── validators/         # PRD-SPEC validator
│   │   │   ├── tools/              # LangChain tools
│   │   │   └── db/                 # Database layer
│   │   └── package.json
│   │
│   └── admin/                       # Internal admin dashboard
│       ├── app/
│       ├── components/
│       └── package.json
│
├── packages/                        # Shared TypeScript packages
│   ├── database/                    # Drizzle ORM schemas
│   │   ├── src/
│   │   │   ├── schema/
│   │   │   │   ├── users.ts
│   │   │   │   ├── organizations.ts
│   │   │   │   ├── projects.ts     # Product-helper
│   │   │   │   ├── identity.ts     # Identity CDP
│   │   │   │   └── billing.ts
│   │   │   ├── migrations/
│   │   │   └── client.ts
│   │   └── package.json
│   │
│   ├── ui/                          # Shared React components
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── button.tsx
│   │   │   │   ├── chart.tsx
│   │   │   │   ├── data-table.tsx
│   │   │   │   └── ...
│   │   │   └── hooks/
│   │   └── package.json
│   │
│   ├── auth/                        # Shared auth logic
│   │   ├── src/
│   │   │   ├── middleware.ts
│   │   │   ├── session.ts
│   │   │   ├── rbac.ts
│   │   │   └── providers/
│   │   └── package.json
│   │
│   ├── config/                      # Shared config (eslint, tsconfig)
│   │   ├── eslint/
│   │   ├── typescript/
│   │   └── tailwind/
│   │
│   └── types/                       # Shared TypeScript types
│       ├── src/
│       │   ├── api.ts
│       │   ├── user.ts
│       │   └── index.ts
│       └── package.json
│
├── python-packages/                 # Shared Python packages
│   ├── c1v-common/                  # Shared utilities
│   │   ├── c1v_common/
│   │   │   ├── auth.py             # Auth validation
│   │   │   ├── logging.py
│   │   │   └── config.py
│   │   └── setup.py
│   │
│   └── c1v-agents/                  # Python-based agents (optional)
│       ├── c1v_agents/
│       │   └── utils.py
│       └── setup.py
│
├── services/                        # Microservices (future)
│   ├── agents-service/             # LangGraph agent orchestration
│   │   ├── src/
│   │   └── Dockerfile
│   │
│   ├── vector-store/               # Vector DB service
│   │   └── docker-compose.yml
│   │
│   └── analytics/                  # Analytics ingestion
│       └── Dockerfile
│
├── infra/                           # Infrastructure as Code
│   ├── terraform/
│   │   ├── modules/
│   │   │   ├── database/
│   │   │   ├── storage/
│   │   │   ├── compute/
│   │   │   └── networking/
│   │   ├── environments/
│   │   │   ├── dev/
│   │   │   ├── staging/
│   │   │   └── prod/
│   │   └── main.tf
│   │
│   ├── docker/
│   │   ├── identity-api.Dockerfile
│   │   ├── product-helper.Dockerfile
│   │   └── web.Dockerfile
│   │
│   └── k8s/                        # Kubernetes manifests (if needed)
│       ├── identity-api/
│       ├── product-helper/
│       └── web/
│
├── docs/                            # Documentation
│   ├── architecture/
│   │   ├── overview.md
│   │   ├── identity-cdp.md
│   │   └── product-helper.md
│   ├── api/
│   │   ├── identity-api.md
│   │   └── product-helper-api.md
│   └── guides/
│       ├── deployment.md
│       └── development.md
│
├── scripts/                         # Build and utility scripts
│   ├── migrate-identity-mvp.sh     # Migration script
│   ├── seed-dev-data.ts
│   └── setup-dev.sh
│
├── .github/
│   └── workflows/
│       ├── ci-typescript.yml
│       ├── ci-python.yml
│       ├── deploy-identity.yml
│       └── deploy-product-helper.yml
│
├── package.json                     # Root workspace config
├── pnpm-workspace.yaml             # PNPM workspace config
├── turbo.json                      # Turborepo config
├── docker-compose.yml              # Local development
└── README.md

### Key Architecture Decisions

#### 1. Polyglot Monorepo Strategy

TypeScript Apps (Next.js)
- Unified platform (apps/web)
- Product Helper (apps/product-helper)
- Admin dashboard (apps/admin)

Python Apps
- Identity API (apps/identity-api - FastAPI)
- Embedded Streamlit UI for identity features

#### 2. Integration Patterns

Option A: Backend-for-Frontend (BFF) Pattern

```ts
// apps/web/app/api/identity/[...path]/route.ts
export async function POST(req: Request) {
  // Proxy to Python FastAPI
  const response = await fetch(`${IDENTITY_API_URL}/api/${path}`, {
    method: 'POST',
    headers: {
      'Authorization': req.headers.get('authorization'),
      'Content-Type': 'application/json',
    },
    body: await req.text(),
  });

  return Response.json(await response.json());
}
Option B: Direct API Calls from Frontend

ts
Copy code
// packages/api-client/src/identity.ts
export const identityClient = {
  async matchRecords(record1, record2) {
    return fetch(`${IDENTITY_API_URL}/match`, {
      method: 'POST',
      body: JSON.stringify({ record1, record2 }),
    });
  }
};
3. Shared Database Schema
ts
Copy code
// packages/database/src/schema/index.ts
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  plan: text('plan').default('free'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  organizationId: uuid('organization_id').references(() => organizations.id),
});

// Product Helper tables
export const prdProjects = pgTable('prd_projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  name: text('name').notNull(),
  // ... from product-helper schema
});

// Identity CDP tables
export const identitySources = pgTable('identity_sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  sourceType: text('source_type').notNull(),
  // ... from identity-mvp schema
});
4. Shared Authentication
ts
Copy code
// packages/auth/src/middleware.ts
export async function validateSession(request: Request) {
  const session = await getSession(request);

  if (!session) {
    throw new Error('Unauthorized');
  }

  return {
    user: session.user,
    organization: session.organization,
  };
}

// Used in both apps
// apps/product-helper/app/api/projects/route.ts
import { validateSession } from '@c1v/auth';

export async function GET(req: Request) {
  const { organization } = await validateSession(req);
  // ...
}
5. Workspace Configuration
pnpm-workspace.yaml

yaml
Copy code
packages:
  - 'apps/*'
  - 'packages/*'
package.json (root)

json
Copy code
{
  "name": "c1v-monorepo",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "dev:web": "turbo run dev --filter=web",
    "dev:identity": "cd apps/identity-api && python -m uvicorn src.serve.api:app --reload",
    "dev:product-helper": "turbo run dev --filter=product-helper",
    "build": "turbo run build",
    "test": "turbo run test",
    "test:python": "cd apps/identity-api && pytest",
    "lint": "turbo run lint",
    "db:generate": "turbo run db:generate --filter=@c1v/database",
    "db:migrate": "turbo run db:migrate --filter=@c1v/database"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.0.0"
  }
}
turbo.json

json
Copy code
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "test": {
      "dependsOn": ["^build"]
    }
  }
}
6. Docker Compose for Local Development
yaml
Copy code
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: c1v_dev
      POSTGRES_USER: c1v
      POSTGRES_PASSWORD: dev_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  identity-api:
    build:
      context: .
      dockerfile: infra/docker/identity-api.Dockerfile
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://c1v:dev_password@postgres:5432/c1v_dev
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis
    volumes:
      - ./apps/identity-api:/app

  web:
    build:
      context: .
      dockerfile: infra/docker/web.Dockerfile
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://c1v:dev_password@postgres:5432/c1v_dev
      IDENTITY_API_URL: http://identity-api:8000
    depends_on:
      - postgres

  product-helper:
    build:
      context: .
      dockerfile: infra/docker/product-helper.Dockerfile
    ports:
      - "3001:3000"
    environment:
      DATABASE_URL: postgresql://c1v:dev_password@postgres:5432/c1v_dev
    depends_on:
      - postgres

volumes:
  postgres_data:
Migration Strategy
Phase 1: Foundation (Week 1)
Create monorepo structure

Move identity-mvp → apps/identity-api

Set up shared packages (database, auth, ui)

Configure workspace tools (Turbo, PNPM)

Phase 2: Product Helper Integration (Week 2)
Build product-helper in apps/product-helper

Share auth between apps

Unified database migrations

Phase 3: Platform UI (Week 3)
Build unified web app (apps/web)

Dashboard with routing to both products

Shared navigation and billing

Phase 4: Production Ready (Week 4)
CI/CD pipelines

Infrastructure as code

Deployment automation

Development Workflow
Start everything:

bash
Copy code
# Terminal 1: Start databases
docker-compose up postgres redis

# Terminal 2: Start TypeScript apps
pnpm dev

# Terminal 3: Start Python API
cd apps/identity-api
python -m uvicorn src.serve.api:app --reload --port 8000
Work on specific app:

bash
Copy code
# Only product-helper
pnpm dev --filter=product-helper

# Only web platform
pnpm dev --filter=web

# Only identity API
cd apps/identity-api && uvicorn src.serve.api:app --reload
Benefits of This Structure
Independent Development: Each product can be developed/deployed independently

Shared Infrastructure: Auth, billing, database schemas shared

Polyglot Support: TypeScript and Python coexist naturally

Future-Proof: Easy to add new products or extract microservices

Developer Experience: Turborepo caching, workspace benefits

Unified Platform: Single entry point for users via apps/web

Recommended Tech Stack Summary
Layer: Monorepo
Technology: Turborepo + PNPM
Notes: Fast builds, efficient caching
────────────────────────────────────────
Layer: Web Platform
Technology: Next.js 15
Notes: Unified dashboard
────────────────────────────────────────
Layer: Product Helper
Technology: Next.js 15 + LangChain
Notes: PRD generation
────────────────────────────────────────
Layer: Identity API
Technology: FastAPI
Notes: Python ML/data pipeline
────────────────────────────────────────
Layer: Database
Technology: PostgreSQL + Drizzle ORM
Notes: Shared schema
────────────────────────────────────────
Layer: Auth
Technology: NextAuth.js or Clerk
Notes: Shared across apps
────────────────────────────────────────
Layer: Vector Store
Technology: Pinecone or Supabase pgvector
Notes: Both products need it
────────────────────────────────────────
Layer: Agent Orchestration
Technology: LangGraph (TS & Python)
Notes: Works in both ecosystems
────────────────────────────────────────
Layer: Deployment
Technology: Vercel (Next.js) + Cloud Run (Python)
Notes: Optimized for each stack

---

## Methodology Stack (L1/L2/L3)

- **L1 Deepened KBs** — `apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/` — LLM instructions + schemas + xlsx templates. What agents retrieve from.
- **L2 v2 artifacts** — `system-design/kb-upgrade-v2/module-{1..7}/` — JSON + xlsx + pptx + mmd OUTPUT of running L1 on c1v-itself (self-application).
- **L3 v3 deltas** — `plans/v3_revised/` — Apr 20 foundation re-set; delta files only, never expanded to artifacts.
- **Handoff contract:** every v2 JSON has `_schema` + `_upstream_refs` + `_output_path` fields — follow these to navigate module dependencies, don't re-derive.

## Active Plans (c1v MIT-Crawley-Cornell)

- **v1:** `plans/c1v-MIT-Crawley-Cornell.md` — hybrid Cornell+Crawley+Atlas pivot.
- **v2 amendment:** `plans/c1v-MIT-Crawley-Cornell.v2.md` — supersedes v1 §0, §5.3, §14; adds §0.2 (T9 KB hygiene), §0.3 (flow restructure), §0.4 (cross-tree renumber), §15 (T10 artifact-gen). 12 teams / 4 waves / ~50 agents. **Wave 3 SHIPPED 2026-04-24** — T4b + T5 closed (see In-Flight Team Status). Wave 1 (T9, T10) and Wave 2-mid (T11) still pending.
- **v2 handoff:** `plans/HANDOFF-2026-04-24-c1v-MIT-Crawley-Cornell-v2.md` — transcript + verbatim quotes + locked decisions.
- **Methodology correction:** `system-design/METHODOLOGY-CORRECTION.md` — three-pass argument (FMEA instrumental, not terminal). v2 absorbs without relabeling phases.
- **Crawley source-of-truth:** `plans/research/crawley-book-findings.md` — agents read this; do NOT rescan the book.

## In-Flight Team Status

- **Wave 3 — COMPLETE 2026-04-24:**
  - **T4b `c1v-m4-decision-net`** — tag `t4b-wave-3-complete` @ commit `4ecfe3f`. Ships `decision-net-agent.ts` + `interface-specs-agent.ts` + `decision_network.v1.json` + `interface_specs.v1.json` + `verify-t4b.ts`. 5/5 V4b gates green.
  - **T5 `c1v-m5-formfunction`** — tag `t5-wave-3-complete` @ commit `a30d9c6`. Ships `form-function-agent.ts` + 8-case test + `verify-t5.ts`; re-validates `form_function_map.v1.json`. 4/4 V5 gates green. Plan: `plans/t4b-t5-completion.md`.
- **T8 `c1v-reorg`** ~40% done (mapper shipped `plans/reorg-mapping.md` + 3 az-sweeps + pre-reorg snapshot; refactorer/rewirer/verifier pending).
- **T2 `c1v-kb8-atlas`** in-flight (37-task multi-agent build).
- **Pending v2 teams:** T9 (KB hygiene), T10 (artifact-gen), T11 (NFR resynth), T6 (Wave 4 synthesis — unblocked by Wave 3 close).

## KB Corpus Gotchas (pre-T9-hygiene)

- **4× duplication:** 13 cross-cutting sw-design KBs (caching, CAP, CDN, LB, queues, MT/MP, observability, resiliency, maintainability, sw-arch, data-model, deployment, api-design) are copy-pasted into M2, M5-HoQ, M6, M7 folders. Any edit drifts silently until T9 extracts to `_shared/` pool with symlinks.
- **Atlas location:** KB-8 lives OUTSIDE the deepened-KB tree at `New-knowledge-banks/8-public-company-stacks-atlas/`. T9 consolidates to `13-Knowledge-banks-deepened/9-stacks-atlas/`.
- **Folder numbering lag:** disk is still Cornell-era (5-HoQ, 6-interfaces, 7-risk). Hybrid renumber blocks on T8+T9 atomic commit.

## Verification-Before-Assertion

Never claim a feature "doesn't ship" or "doesn't exist" without walking the actual code. Deployed-features lists can be stale. Verify via `ls app/(dashboard)/**/page.tsx` + `ls components/**/*.tsx` before asserting absence.

