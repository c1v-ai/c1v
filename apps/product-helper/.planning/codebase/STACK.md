# Technology Stack

**Analysis Date:** 2026-02-06

## Languages

**Primary:**
- TypeScript 5.9.3 - All application code (frontend, backend, agents, tests)
  - Strict mode enabled in `tsconfig.json`
  - Target: ESNext, module resolution: bundler
  - Path alias: `@/*` maps to project root

**Secondary:**
- SQL - Database migrations in `lib/db/migrations/`
- TOML - Supabase local config in `supabase/config.toml`

## Runtime

**Environment:**
- Node.js 20.9.0 (specified in `.nvmrc`)
- Actual runtime on dev machine: v20.19.6

**Package Manager:**
- pnpm 9.15.0 (monorepo-level lockfile at `/Users/davidancor/Desktop/coding/c1v/pnpm-lock.yaml`)
- Workspace config: `/Users/davidancor/Desktop/coding/c1v/pnpm-workspace.yaml`
- Lockfile: present (monorepo root)

## Frameworks

**Core:**
- Next.js 15.5.9 - Full-stack React framework (App Router, RSC, Turbopack)
  - Config: `next.config.ts`
  - Turbopack root set to `../../` for monorepo support
  - `serverExternalPackages` configured to externalize all LangChain packages

**AI/Agent:**
- LangChain.js 0.3.26 - Agent orchestration framework
- LangGraph 0.2.60 (`@langchain/langgraph`) - Stateful workflow graphs
- `@langchain/anthropic` 0.3.14 - Anthropic Claude provider
- `@langchain/core` 0.3.40 - Core abstractions (messages, prompts, schemas)
- `@langchain/community` 0.3.26 - Community integrations
- Vercel AI SDK 3.4.33 (`ai`) - Chat UI hooks (`useChat`), streaming, `Message` types

**UI:**
- React 19.1.0 + React DOM 19.1.0
- Tailwind CSS 4.1.7 - Utility-first styling (via `@tailwindcss/postcss`)
- Radix UI - Headless accessible components (accordion, collapsible, dialog, select, tabs)
- shadcn/ui pattern - Component library built on Radix + CVA + Tailwind
- Lucide React 0.511.0 - Icon library

**Database:**
- Drizzle ORM 0.43.1 - TypeScript-first ORM
- Drizzle Kit 0.31.8 - Schema generation and migration tooling
  - Config: `drizzle.config.ts`
  - Schema: `lib/db/schema.ts`
  - Migrations: `lib/db/migrations/`

**Testing:**
- Jest 30.2.0 - Unit testing (456 tests)
  - Config: `jest.config.ts`
  - Preset: `ts-jest` (ts-jest 29.4.6)
  - Coverage threshold: 70% across all metrics
- Playwright 1.57.0 - E2E testing
  - Config: `playwright.config.ts`
  - 8 projects: desktop (Chrome, Firefox, Safari), mobile (Chrome, Safari, Safari landscape), tablet (iPad)
  - Auth setup project with storage state persistence
- axe-core/playwright 4.11.0 - Accessibility testing

**Build/Dev:**
- PostCSS 8.5.6 - CSS processing via `postcss.config.mjs`
- tsx 4.21.0 - TypeScript execution for scripts (seeds, setup)
- ts-node 10.9.2 - TypeScript Node.js execution
- autoprefixer 10.4.23 - CSS vendor prefixing

## Key Dependencies

**Critical (App won't function without):**
- `@langchain/anthropic` 0.3.14 - All AI features (intake, extraction, agents)
- `drizzle-orm` 0.43.1 - All database operations
- `postgres` 3.4.8 - PostgreSQL driver (postgres.js)
- `jose` 6.1.3 - JWT signing/verification for custom auth
- `bcryptjs` 3.0.3 - Password hashing
- `stripe` 18.5.0 - Payment processing
- `zod` 3.25.76 - Schema validation everywhere (env, API, forms, LLM output)
- `ai` 3.4.33 - Chat streaming infrastructure

**UI/UX:**
- `mermaid` 11.12.2 - Diagram rendering (context, use-case, activity diagrams)
- `beautiful-mermaid` 0.1.3 - Mermaid diagram beautification
- `react-markdown` 10.1.0 - Markdown rendering in chat
- `remark-gfm` 4.0.1 - GitHub-flavored markdown support
- `class-variance-authority` 0.7.1 - Component variant management (shadcn pattern)
- `clsx` 2.1.1 + `tailwind-merge` 3.4.0 - Conditional class merging
- `sonner` 1.7.4 - Toast notifications
- `next-themes` 0.4.6 - Dark/light mode theming
- `swr` 2.3.8 - Client-side data fetching with caching
- `use-stick-to-bottom` 1.1.1 - Chat auto-scroll behavior
- `tw-animate-css` 1.4.0 - Tailwind animation utilities

**Infrastructure:**
- `resend` 6.7.0 - Transactional email (invitations, password resets)
- `@react-email/components` 1.0.4 - React email templates
- `dotenv` 16.6.1 - Environment variable loading
- `server-only` 0.0.1 - Server-side code boundary enforcement
- `yaml` 2.8.2 - YAML parsing (used in agents)
- `zod-to-json-schema` 3.25.1 - Schema conversion for LLM structured output

## Configuration

**Environment:**
- Validated at startup via Zod schema in `lib/config/env.ts`
- App will not start if validation fails
- Development: `.env.local` (gitignored)
- Examples: `.env.example`, `.env.local.example`, `.env.test.example`
- Required vars: `POSTGRES_URL`, `AUTH_SECRET` (32+ chars), `ANTHROPIC_API_KEY` (sk-ant-*), `STRIPE_SECRET_KEY` (sk_*), `STRIPE_WEBHOOK_SECRET` (whsec_*), `BASE_URL`
- Optional vars: `RESEND_API_KEY`, `LANGCHAIN_API_KEY`, `LANGCHAIN_TRACING_V2`, `LANGCHAIN_PROJECT`
- Feature flag: `USE_LANGGRAPH` (enables LangGraph-based chat workflow)

**Build:**
- `next.config.ts` - Next.js + Turbopack + server external packages
- `tsconfig.json` - TypeScript strict mode, ESNext target
- `drizzle.config.ts` - Drizzle Kit (schema/migrations location)
- `postcss.config.mjs` - PostCSS with Tailwind plugin
- `jest.config.ts` - Jest with ts-jest, path aliases, coverage
- `playwright.config.ts` - E2E with 8 browser/device projects

**Constants:**
- Centralized in `lib/constants/index.ts`
- LLM defaults: 30s timeout, 4000 max tokens extraction, 2000 max tokens chat
- Rate limits: 100 req/min MCP, 20 req/min chat
- Token estimation: ~4 chars/token, 128k context window
- Scoring thresholds for PRD completeness validation

## Platform Requirements

**Development:**
- Node.js 20.x (`.nvmrc` specifies 20.9.0)
- pnpm (monorepo workspace)
- Local PostgreSQL via Supabase CLI (`pnpm db:start`) on port 54322
- Supabase Studio on port 54323
- PostgreSQL 15 (specified in `supabase/config.toml`)
- Anthropic API key required for any AI features
- Stripe test keys required for payment features

**Production:**
- Vercel (Next.js deployment target, implied by `BASE_URL` patterns)
- Supabase-hosted PostgreSQL (SSL required in production via `lib/db/drizzle.ts`)
- Connection pooling: max 10 connections, 20s idle timeout, 10s connect timeout

**Database Scripts:**
```bash
pnpm db:start            # Start local Supabase (PostgreSQL)
pnpm db:stop             # Stop local Supabase
pnpm db:generate         # Generate Drizzle migrations
pnpm db:migrate          # Run migrations via drizzle-kit (known issues)
pnpm db:migrate:sql      # Run migrations via psql (workaround)
pnpm db:seed             # Seed database (requires env vars sourced)
pnpm db:studio           # Open Drizzle Studio
```

---

*Stack analysis: 2026-02-06*
