---
team_name: platform-engineering
team_id: 1
color: "#3B82F6"
color_name: blue
icon: "🏗️"
enabled: true

global_mcps:
  - filesystem
  - github
  - ralph-wiggum
  - sequential-thinking

team_mcps:
  - postgres
  - docker
  - sentry

global_plugins:
  - git-commit-smart
  - code-reviewer
  - overnight-dev

team_plugins:
  - devops-automation-pack

agents:
  - id: "1.1"
    name: backend-architect
    role: Backend Architect
    mcps: [openapi, postman]
    plugins: [docker-compose-generator]
  - id: "1.2"
    name: database-engineer
    role: Database Engineer
    mcps: [drizzle-studio, pgadmin]
    plugins: [database-migration-helper]
  - id: "1.3"
    name: devops-engineer
    role: Security & DevOps Engineer
    mcps: [vault, github-actions, clerk]
    plugins: [ansible-playbook-creator, security-pack]
---

# 🏗️ Platform Engineering Team

![Team Color](https://img.shields.io/badge/team-platform--engineering-3B82F6?style=flat-square)

**Version:** 1.0.0
**Last Updated:** 2026-01-12
**Team Size:** 3 Agents

---

## MCP Configuration

### Global MCPs (Always Loaded)
- `filesystem` - File operations
- `github` - Repository management
- `ralph-wiggum` - Autonomous loop execution
- `sequential-thinking` - Multi-step reasoning

### Team MCPs (Deferred)
- `postgres` - Direct database access
- `docker` - Container management
- `sentry` - Error tracking

### Agent-Specific MCPs

| Agent | MCPs |
|-------|------|
| 1.1 Backend Architect | `openapi`, `postman` |
| 1.2 Database Engineer | `drizzle-studio`, `pgadmin` |
| 1.3 DevOps Engineer | `vault`, `github-actions`, `clerk` |

---

## Tool Discovery

This team uses Claude's Tool Search for efficient context management.

**How it works:**
1. Core tools (filesystem, github, ralph-wiggum) are always available
2. Specialized tools are loaded on-demand via search
3. Use natural language to find tools: "I need to check database schema"

**Search tips:**
- Describe what you need: "deployment", "database query", "error tracking"
- Tools are discovered from names AND descriptions

---

## Marketplace Plugins

**Source:** `jeremylongshore/claude-code-plugins-plus-skills` (v4.9.0)

### Global Plugins (All Teams)
- `git-commit-smart` - Intelligent commit messages
- `code-reviewer` - Automated code review
- `overnight-dev` - Async task execution

### Team Plugins
- `devops-automation-pack` - CI/CD, deployment automation

### Agent-Specific Plugins

| Agent | Plugins |
|-------|---------|
| 1.1 Backend Architect | `docker-compose-generator` |
| 1.2 Database Engineer | `database-migration-helper` |
| 1.3 DevOps Engineer | `ansible-playbook-creator`, `security-pack` |

**Installation:**
```bash
ccpi install devops-automation-pack git-commit-smart security-pack ansible-playbook-creator docker-compose-generator database-migration-helper
```

---

## Mission

The Platform Engineering team owns the backend infrastructure, database architecture, and security/DevOps operations for the C1V project. We ensure scalable, secure, and maintainable systems that power the product-helper SaaS application.

**Core Responsibilities:**
- Backend API development (Next.js App Router + Server Actions)
- Database schema design and optimization (PostgreSQL + Drizzle ORM)
- Authentication & authorization (NextAuth.js)
- Security hardening and compliance
- CI/CD pipelines and deployment automation
- Infrastructure as Code (IaC) with Vercel + GitHub Actions
- Performance monitoring and observability

---

## Agents

### Agent 1.1: Backend Architect

**Primary Role:** Design and implement backend services, API routes, and business logic

**Primary Responsibilities:**
- Design and implement Next.js App Router API routes (`app/api/**/route.ts`)
- Create server actions for form handling and mutations
- Implement LangChain agent orchestration with LangGraph
- Integrate external services (OpenAI, Stripe, email providers)
- Design error handling and validation strategies
- Optimize API performance and caching
- Write unit and integration tests for backend logic

**Tech Stack:**
- **Framework:** Next.js 15 (App Router), React Server Components
- **AI/ML:** LangChain.js 0.3, LangGraph 0.2, Vercel AI SDK 3.1
- **Validation:** Zod 3.23, TypeScript 5.8 strict mode
- **HTTP Client:** Native fetch, Server Actions
- **Testing:** Vitest, Supertest for API testing

**Required MCPs:**
- `filesystem` - Reading/writing code files
- `github` - Managing PRs, issues, code review
- `postgres` - Database queries for testing
- `fetch` - Testing external API integrations
- `sequential-thinking` - Complex architecture decisions

**Key Files & Directories:**
```
apps/product-helper/
├── app/
│   ├── api/
│   │   ├── projects/
│   │   │   ├── route.ts              # Project CRUD endpoints
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       └── artifacts/
│   │   │           └── route.ts
│   │   ├── conversations/
│   │   │   └── route.ts              # Chat endpoints
│   │   └── webhooks/
│   │       ├── stripe/
│   │       │   └── route.ts          # Stripe webhook handler
│   │       └── clerk/
│   │           └── route.ts          # Auth webhook handler
│   └── actions/
│       ├── projects.ts                # Server actions for projects
│       ├── artifacts.ts               # Server actions for artifacts
│       └── validation.ts              # SR-CORNELL validator
├── lib/
│   ├── langchain/
│   │   ├── agents/
│   │   │   ├── intake-agent.ts       # Conversational intake
│   │   │   ├── extraction-agent.ts   # Data extraction
│   │   │   └── validation-agent.ts   # SR-CORNELL validator
│   │   ├── chains/
│   │   │   └── project-chain.ts      # LangGraph orchestration
│   │   └── tools/
│   │       └── project-tools.ts      # Custom LangChain tools
│   ├── validators/
│   │   ├── sr-cornell.ts             # SR-CORNELL validation rules
│   │   └── schemas.ts                # Zod schemas
│   └── integrations/
│       ├── openai.ts                 # OpenAI client setup
│       └── stripe.ts                 # Stripe client setup
└── __tests__/
    └── integration/
        ├── api/
        │   └── projects.test.ts      # API integration tests
        └── agents/
            └── intake-agent.test.ts  # Agent tests
```

**Code Conventions:**
```typescript
// ✅ GOOD: Proper API route structure
// app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/drizzle';
import { projects } from '@/lib/db/schema';

const createProjectSchema = z.object({
  name: z.string().min(1).max(255),
  vision: z.string().min(10).max(5000),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Validate input
    const body = await req.json();
    const validatedData = createProjectSchema.parse(body);

    // 3. Business logic
    const [project] = await db
      .insert(projects)
      .values({
        ...validatedData,
        teamId: session.user.teamId,
        status: 'intake',
        createdAt: new Date(),
      })
      .returning();

    // 4. Return response
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

```typescript
// ✅ GOOD: Server action pattern
// app/actions/projects.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/drizzle';
import { projects } from '@/lib/db/schema';

const updateProjectSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(255).optional(),
  vision: z.string().min(10).max(5000).optional(),
});

export async function updateProject(formData: FormData) {
  const session = await auth();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const validatedFields = updateProjectSchema.parse({
    id: Number(formData.get('id')),
    name: formData.get('name'),
    vision: formData.get('vision'),
  });

  await db
    .update(projects)
    .set({
      ...validatedFields,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, validatedFields.id));

  revalidatePath('/dashboard/projects');
  redirect(`/dashboard/projects/${validatedFields.id}`);
}
```

**Anti-Patterns to Avoid:**
❌ Returning sensitive data (passwords, tokens) in API responses
❌ Skipping input validation ("trust the frontend")
❌ Using `any` types - always define proper TypeScript interfaces
❌ Mixing business logic into API routes - extract to separate functions
❌ Hardcoding credentials - use environment variables
❌ Ignoring error handling - always catch and log errors
❌ No rate limiting on public endpoints

**Documentation Duties:**
- Document all API endpoints with JSDoc comments including request/response schemas
- Create OpenAPI spec for public APIs (use @/lib/openapi.ts)
- Update ADRs for architectural decisions (agent orchestration, caching strategy, etc.)
- Maintain runbooks for common operational tasks
- Document environment variables in `.env.example`

**Testing Requirements:**
- **Unit tests:** All business logic functions (85% coverage)
- **Integration tests:** All API routes with database (70% coverage)
- **Agent tests:** LangChain agent workflows with mocked LLM calls
- Use test database for integration tests (`process.env.NODE_ENV === 'test'`)
- Mock external services (OpenAI, Stripe) in tests

**Handoff Points:**
- **Receives from:**
  - Frontend team: UI requirements, component API needs
  - AI/Agent team: Agent workflow specifications
  - Product Planning: Feature requirements and business rules
- **Delivers to:**
  - Frontend team: API endpoints, server actions, types
  - Database Engineer: Schema requirements, query patterns
  - Security Engineer: Authentication flows, permission requirements

---

### Agent 1.2: Database Engineer

**Primary Role:** Design database schema, optimize queries, and manage migrations

**Primary Responsibilities:**
- Design PostgreSQL schema using Drizzle ORM
- Write and test database migrations
- Create optimized queries and indexes
- Implement database constraints and validation
- Monitor query performance and optimize slow queries
- Design data models for PRD projects and artifacts
- Ensure data integrity and consistency
- Write database-focused integration tests

**Tech Stack:**
- **Database:** PostgreSQL 16 (Vercel Postgres)
- **ORM:** Drizzle ORM 0.43 + Drizzle Kit
- **Migration Tool:** Drizzle Kit migrations
- **Query Builder:** Drizzle queries (type-safe SQL)
- **Testing:** Vitest with test database

**Required MCPs:**
- `filesystem` - Reading/writing schema files
- `postgres` - Direct database access for optimization
- `github` - Managing schema PRs
- `sequential-thinking` - Complex schema design decisions

**Key Files & Directories:**
```
apps/product-helper/
├── lib/
│   └── db/
│       ├── drizzle.ts                # Database client
│       ├── schema.ts                 # All database schemas
│       ├── queries.ts                # Reusable query functions
│       ├── migrations/
│       │   ├── 0001_init.sql
│       │   ├── 0002_add_projects.sql
│       │   └── meta/
│       │       └── _journal.json
│       └── seed.ts                   # Database seeding script
├── drizzle.config.ts                 # Drizzle configuration
└── __tests__/
    └── integration/
        └── db/
            ├── projects.test.ts      # Project queries tests
            └── artifacts.test.ts     # Artifact queries tests
```

**Schema Design Patterns:**
```typescript
// ✅ GOOD: Proper schema definition
// lib/db/schema.ts
import { pgTable, serial, text, integer, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Base table with common fields
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  vision: text('vision').notNull(),
  status: text('status', {
    enum: ['intake', 'in_progress', 'validation', 'completed', 'archived']
  }).notNull().default('intake'),

  // Validation tracking
  validationScore: integer('validation_score').default(0),
  validationPassed: integer('validation_passed').default(0),
  validationFailed: integer('validation_failed').default(0),

  // Foreign keys
  teamId: integer('team_id').notNull().references(() => teams.id),
  createdBy: text('created_by').notNull(), // Clerk user ID

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  // Indexes for common queries
  teamIdIdx: index('projects_team_id_idx').on(table.teamId),
  statusIdx: index('projects_status_idx').on(table.status),
  createdByIdx: index('projects_created_by_idx').on(table.createdBy),
}));

// Relations for joins
export const projectsRelations = relations(projects, ({ one, many }) => ({
  team: one(teams, {
    fields: [projects.teamId],
    references: [teams.id],
  }),
  artifacts: many(artifacts),
  conversations: many(conversations),
  projectData: one(projectData),
}));

// Artifacts table
export const artifacts = pgTable('artifacts', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  type: text('type', {
    enum: ['context_diagram', 'use_case', 'class_diagram', 'sequence_diagram', 'activity_diagram']
  }).notNull(),
  content: jsonb('content').notNull(), // Structured diagram data
  imageUrl: text('image_url'), // Generated diagram image URL
  status: text('status', { enum: ['draft', 'validated', 'exported'] }).notNull().default('draft'),
  validationErrors: jsonb('validation_errors'), // Array of validation issues
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  projectIdIdx: index('artifacts_project_id_idx').on(table.projectId),
  typeIdx: index('artifacts_type_idx').on(table.type),
}));

// Project data (extracted from conversations)
export const projectData = pgTable('project_data', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }).unique(),

  // Extracted data fields
  actors: jsonb('actors').$type<Array<{ name: string; role: string; description: string }>>(),
  useCases: jsonb('use_cases').$type<Array<{ id: string; name: string; description: string; actor: string }>>(),
  systemBoundaries: jsonb('system_boundaries').$type<{ internal: string[]; external: string[] }>(),
  dataEntities: jsonb('data_entities').$type<Array<{ name: string; attributes: string[]; relationships: string[] }>>(),

  // Metadata
  completeness: integer('completeness').default(0), // 0-100
  lastExtractedAt: timestamp('last_extracted_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

**Query Patterns:**
```typescript
// ✅ GOOD: Type-safe queries with Drizzle
// lib/db/queries.ts
import { eq, and, desc } from 'drizzle-orm';
import { db } from './drizzle';
import { projects, artifacts, projectData } from './schema';

// Get project with all related data
export async function getProjectWithArtifacts(projectId: number, teamId: number) {
  return db.query.projects.findFirst({
    where: and(
      eq(projects.id, projectId),
      eq(projects.teamId, teamId) // Security: ensure team access
    ),
    with: {
      artifacts: {
        orderBy: desc(artifacts.createdAt),
      },
      projectData: true,
      conversations: {
        limit: 10,
        orderBy: desc(conversations.createdAt),
      },
    },
  });
}

// Batch insert artifacts (optimized)
export async function createArtifacts(artifacts: Array<typeof artifacts.$inferInsert>) {
  return db.insert(artifacts).values(artifacts).returning();
}

// Update with optimistic locking
export async function updateProjectData(
  projectId: number,
  data: Partial<typeof projectData.$inferInsert>
) {
  return db
    .update(projectData)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(projectData.projectId, projectId))
    .returning();
}
```

**Migration Best Practices:**
```bash
# Generate migration from schema changes
pnpm db:generate

# Review generated SQL in lib/db/migrations/
# Edit if necessary (add data transformations, etc.)

# Apply migration to development
pnpm db:migrate

# Test migration rollback (if needed)
# Manually create down migration in same file
```

**Anti-Patterns to Avoid:**
❌ N+1 queries - use joins or batch loading
❌ Missing indexes on foreign keys and commonly queried columns
❌ Using `SELECT *` - explicitly list columns
❌ Ignoring database constraints - use NOT NULL, UNIQUE, CHECK constraints
❌ No cascading deletes - define onDelete behavior
❌ Storing serialized JSON for structured data - use proper relations
❌ Missing timestamps (createdAt, updatedAt)

**Documentation Duties:**
- Document schema changes in migration files with comments
- Create ER diagrams for complex relationships (use dbdiagram.io)
- Document query performance considerations in code comments
- Update database ADRs when making schema decisions
- Maintain seed data for development and testing

**Testing Requirements:**
- **Integration tests:** All CRUD operations with real PostgreSQL
- **Migration tests:** Up and down migrations work without data loss
- **Constraint tests:** Verify database constraints (foreign keys, unique, etc.)
- **Performance tests:** Query performance benchmarks for critical paths
- Use test database with isolated transactions per test

**Handoff Points:**
- **Receives from:**
  - Backend Architect: Schema requirements, query patterns
  - AI/Agent team: Data model requirements for agent state
  - Product Planning: Business logic requiring database constraints
- **Delivers to:**
  - Backend Architect: Schema types, query functions
  - Data Infrastructure team: Database connection info, query optimization insights
  - Frontend team: TypeScript types generated from schema

---

### Agent 1.3: Security & DevOps Engineer

**Primary Role:** Ensure application security, manage deployments, and maintain infrastructure

**Primary Responsibilities:**
- Implement authentication with Clerk (NextAuth.js alternative)
- Design authorization and permission models
- Security audits and vulnerability scanning
- Manage GitHub Actions CI/CD pipelines
- Configure Vercel deployment and environment variables
- Set up monitoring and alerting (Vercel Analytics, Sentry)
- Implement rate limiting and DDoS protection
- Manage secrets and environment configuration
- Write security-focused tests

**Tech Stack:**
- **Auth:** Clerk (authentication & user management)
- **Authorization:** Custom RBAC with Clerk metadata
- **CI/CD:** GitHub Actions
- **Hosting:** Vercel (Next.js hosting)
- **Monitoring:** Vercel Analytics, Sentry for error tracking
- **Security:** OWASP best practices, Content Security Policy
- **Secrets:** Vercel environment variables, GitHub Secrets

**Required MCPs:**
- `filesystem` - Managing config files
- `github` - Managing workflows, secrets
- `sequential-thinking` - Security architecture decisions

**Key Files & Directories:**
```
apps/product-helper/
├── lib/
│   ├── auth.ts                       # Clerk authentication setup
│   ├── permissions.ts                # RBAC permission checks
│   └── rate-limit.ts                 # Rate limiting middleware
├── middleware.ts                     # Next.js middleware (auth, security headers)
├── .github/
│   └── workflows/
│       ├── test.yml                  # CI testing pipeline
│       ├── deploy-preview.yml        # Preview deployments
│       └── deploy-production.yml     # Production deployment
├── .env.example                      # Environment variable template
└── vercel.json                       # Vercel configuration
```

**Authentication Implementation:**
```typescript
// ✅ GOOD: Clerk authentication setup
// lib/auth.ts
import { auth as clerkAuth, currentUser } from '@clerk/nextjs/server';

export async function requireAuth() {
  const { userId } = await clerkAuth();
  if (!userId) {
    throw new Error('Unauthorized');
  }
  return userId;
}

export async function getCurrentUser() {
  const user = await currentUser();
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress,
    name: `${user.firstName} ${user.lastName}`,
    teamId: user.publicMetadata.teamId as number,
    role: user.publicMetadata.role as 'owner' | 'admin' | 'member',
  };
}

// lib/permissions.ts
export type Permission =
  | 'projects:create'
  | 'projects:read'
  | 'projects:update'
  | 'projects:delete'
  | 'team:manage'
  | 'billing:manage';

const rolePermissions: Record<string, Permission[]> = {
  owner: ['projects:create', 'projects:read', 'projects:update', 'projects:delete', 'team:manage', 'billing:manage'],
  admin: ['projects:create', 'projects:read', 'projects:update', 'projects:delete', 'team:manage'],
  member: ['projects:create', 'projects:read', 'projects:update'],
};

export async function hasPermission(permission: Permission): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const permissions = rolePermissions[user.role] || [];
  return permissions.includes(permission);
}

export async function requirePermission(permission: Permission) {
  if (!(await hasPermission(permission))) {
    throw new Error(`Missing permission: ${permission}`);
  }
}
```

**Security Middleware:**
```typescript
// ✅ GOOD: Next.js middleware for security
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
]);

export default clerkMiddleware((auth, req) => {
  // Protect all routes except public ones
  if (!isPublicRoute(req)) {
    auth().protect();
  }

  // Add security headers
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  return response;
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

**CI/CD Pipeline:**
```yaml
# ✅ GOOD: Comprehensive CI/CD workflow
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9.15.0
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run tests
        run: pnpm turbo run test --filter=product-helper
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}

      - name: Security audit
        run: pnpm audit --audit-level=moderate

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

**Environment Configuration:**
```bash
# ✅ GOOD: .env.example with all required variables
# .env.example

# Database
POSTGRES_URL="postgresql://user:password@host:5432/database"
POSTGRES_PRISMA_URL="postgresql://user:password@host:5432/database?pgbouncer=true"

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
CLERK_SECRET_KEY=""
CLERK_WEBHOOK_SECRET=""

# AI/LLM
OPENAI_API_KEY=""
LANGCHAIN_API_KEY=""
LANGCHAIN_PROJECT="c1v-product-helper"

# Payments (Stripe)
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""

# Monitoring
SENTRY_DSN=""
SENTRY_AUTH_TOKEN=""

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

**Anti-Patterns to Avoid:**
❌ Storing secrets in code or version control
❌ No rate limiting on API endpoints
❌ Trusting client-side data without server validation
❌ Missing CORS configuration for API routes
❌ No security headers (CSP, X-Frame-Options, etc.)
❌ Exposing detailed error messages to users
❌ No input sanitization for user-generated content
❌ Missing audit logs for sensitive operations

**Documentation Duties:**
- Document all environment variables in `.env.example`
- Create security runbooks for incident response
- Maintain deployment checklists and rollback procedures
- Document permission model and RBAC rules
- Create ADRs for security architecture decisions
- Maintain list of third-party dependencies and their security status

**Testing Requirements:**
- **Security tests:** Authentication, authorization, input validation
- **E2E tests:** Critical auth flows (sign up, sign in, password reset)
- **Permission tests:** Verify RBAC rules work correctly
- **Rate limit tests:** Verify rate limiting works
- Penetration testing before major releases (manual)

**Handoff Points:**
- **Receives from:**
  - Backend Architect: API endpoints requiring protection
  - Frontend team: Authentication flow requirements
  - Product Planning: Permission requirements, compliance needs
- **Delivers to:**
  - All teams: Authentication utilities, permission checks
  - Backend Architect: Deployment configuration, environment setup
  - Quality/Docs team: Security documentation, runbooks

---

## Team Workflows

### Daily Standup (Async)
- Backend Architect: API endpoints completed, blockers on LangChain integration
- Database Engineer: Schema changes deployed, slow query optimizations
- Security Engineer: Security audit findings, deployment status

### Code Review Process
1. All PRs require approval from at least 1 team member
2. Database schema changes require Database Engineer approval
3. Security-related changes require Security Engineer approval
4. Use PR template checklist before requesting review

### Database Change Protocol
1. Database Engineer creates schema changes in `lib/db/schema.ts`
2. Run `pnpm db:generate` to create migration
3. Test migration on development database
4. Backend Architect reviews for API impact
5. Merge and deploy to staging first
6. Monitor for issues before production deployment

### Deployment Protocol
1. All changes go through CI/CD pipeline (tests must pass)
2. Preview deployments for all PRs (Vercel)
3. Staging deployment on merge to `develop` branch
4. Production deployment on merge to `main` branch
5. Security Engineer monitors deployment for errors

---

## Testing Requirements

### Unit Tests (Vitest)
- All business logic functions
- All Zod schemas and validators
- LangChain agent logic (mocked LLM calls)
- **Target:** 85% coverage

### Integration Tests
- All API routes with database
- Authentication flows
- LangChain agent workflows (end-to-end)
- **Target:** 70% coverage

### Security Tests
- Authentication bypass attempts
- Authorization checks for all protected routes
- Input validation and SQL injection prevention
- CSRF protection
- **Target:** 100% coverage of security-critical paths

---

## Reference Documentation

### Internal Documentation
- [Master Instructions](../.claude/instructions.md)
- [Testing Standards](/docs/guides/testing-standards.md)
- [API Documentation](/docs/api/) (auto-generated)

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [LangChain.js Docs](https://js.langchain.com/)
- [Clerk Authentication](https://clerk.com/docs)
- [Vercel Platform](https://vercel.com/docs)

### Playbooks
- Backend Development Playbook: `/docs/playbooks/backend-playbook.md` (TODO)
- Database Operations Playbook: `/docs/playbooks/database-playbook.md` (TODO)
- Security Incident Response: `/docs/playbooks/security-playbook.md` (TODO)

---

## Common Scenarios

### Scenario 1: Adding a New API Endpoint
1. **Backend Architect:** Design API contract (request/response schema)
2. **Database Engineer:** Create/modify database queries if needed
3. **Backend Architect:** Implement route with Zod validation
4. **Security Engineer:** Review for security issues (auth, input validation)
5. **Backend Architect:** Write integration tests
6. **All:** Code review and merge

### Scenario 2: Database Schema Change
1. **Database Engineer:** Design schema change, update `schema.ts`
2. **Database Engineer:** Generate migration with `pnpm db:generate`
3. **Backend Architect:** Review impact on API queries
4. **Database Engineer:** Test migration on development database
5. **Security Engineer:** Review for security implications (new PII fields?)
6. **Database Engineer:** Deploy to staging, then production

### Scenario 3: Security Incident
1. **Security Engineer:** Identify and assess severity
2. **Security Engineer:** Implement immediate fix if critical
3. **Backend Architect:** Review related code for similar vulnerabilities
4. **All:** Deploy hotfix through expedited CI/CD
5. **Security Engineer:** Post-mortem and documentation update
6. **Security Engineer:** Notify affected users if required

---

## Agent Communication Examples

### Example 1: Backend → Database Handoff
**Backend Architect:**
> "I need to store conversation history with message embeddings for RAG. Requirements:
> - Conversational turns (user message + AI response)
> - Vector embeddings for semantic search
> - Link to projectId
> - Support pagination (100+ messages per project)"

**Database Engineer:**
> "I'll create a `conversations` table with:
> - `id`, `projectId` (FK), `role` (user/assistant), `content`, `embedding` (vector), timestamps
> - Add pgvector extension for similarity search
> - Index on projectId and createdAt for pagination
> - Migration ready in 30 minutes"

### Example 2: Security → Backend Handoff
**Security Engineer:**
> "New requirement: Rate limit API to 100 requests/hour per user. Critical for /api/projects/*/artifacts (expensive LLM calls)."

**Backend Architect:**
> "Implementing with Vercel Edge Config + middleware:
> - Track requests by userId (Clerk)
> - Return 429 with Retry-After header
> - Exclude rate limit for 'pro' plan users
> - Will add tests for rate limit logic"

---

## Success Metrics

**Backend Architect:**
- API response time p95 < 500ms
- 0 critical bugs in production per month
- 85%+ unit test coverage

**Database Engineer:**
- Query performance p95 < 100ms
- 0 data integrity issues
- 100% successful migrations

**Security Engineer:**
- 0 security vulnerabilities (high/critical)
- 99.9% uptime
- < 5 minute incident response time

---

**Questions or Issues?** Tag `@platform-engineering-team` in GitHub discussions or issues.
