# Technology Stack

**Analysis Date:** 2025-01-25

## Languages

**Primary:**
- TypeScript 5.8.3 - All application code (frontend, API routes, database, AI agents)

**Secondary:**
- CSS/Tailwind 4.1.7 - Styling via `app/globals.css` and `app/theme.css`
- Mermaid - Diagram DSL for generated PRD artifacts

## Runtime

**Environment:**
- Node.js (version managed by project, inferred ESNext target)
- Next.js 15.6.0-canary.59 (App Router with experimental features)

**Package Manager:**
- pnpm (workspace configuration at monorepo root)
- Lockfile: `pnpm-lock.yaml` present (154KB)

## Frameworks

**Core:**
- Next.js 15.6.0-canary.59 - Full-stack React framework with App Router
  - Experimental PPR (Partial Pre-rendering) enabled
  - Experimental clientSegmentCache enabled
  - Turbopack for development (`next dev --turbopack`)

**AI/Agent:**
- LangChain 0.3.19 - Core LLM orchestration
- LangGraph 0.2.57 - State machine graphs for intake workflow
- @langchain/openai 0.4.9 - OpenAI model integration
- @langchain/core 0.3.43 - Base abstractions
- Vercel AI SDK 3.1.12 - Streaming response handling

**Testing:**
- Jest 30.2.0 - Unit testing with ts-jest
- Playwright 1.57.0 - E2E testing (desktop + mobile)
- Coverage threshold: 70% (branches, functions, lines, statements)

**Build/Dev:**
- Drizzle Kit 0.31.1 - Database migrations and studio
- tsx 4.21.0 - TypeScript execution for scripts
- PostCSS 8.5.3 - CSS processing

## Key Dependencies

**Critical:**
- drizzle-orm 0.43.1 - Type-safe PostgreSQL ORM
- postgres 3.4.5 - PostgreSQL client (postgres.js)
- zod 3.24.4 - Runtime schema validation
- jose 6.0.11 - JWT token handling
- bcryptjs 3.0.2 - Password hashing

**UI Framework:**
- React 19.1.0 / React DOM 19.1.0
- Radix UI primitives (dialog, tabs, collapsible, dropdown)
- Lucide React 0.511.0 - Icons
- next-themes 0.4.4 - Dark mode
- sonner 1.7.2 - Toast notifications
- class-variance-authority 0.7.1 + tailwind-merge 3.3.0 - Component variants

**Visualization:**
- mermaid 11.12.2 - Diagram rendering (context, use case, class diagrams)
- react-markdown 10.1.0 + remark-gfm 4.0.1 - Markdown rendering

**Infrastructure:**
- stripe 18.1.0 - Payment processing
- resend 6.7.0 - Transactional email

## Configuration

**Environment:**
- Validated at build time via `lib/config/env.ts` (Zod schema)
- Required: `POSTGRES_URL`, `AUTH_SECRET` (32+ chars), `OPENAI_API_KEY` (sk-*)
- Optional: `STRIPE_*`, `RESEND_API_KEY`, `LANGCHAIN_*` for tracing
- Feature flag: `USE_LANGGRAPH` toggles new vs legacy chat workflow

**Configuration Files:**
- `next.config.ts` - Next.js configuration with experimental features
- `drizzle.config.ts` - Database connection and migration paths
- `tsconfig.json` - TypeScript configuration (ESNext, bundler resolution)
- `jest.config.ts` - Unit test configuration
- `playwright.config.ts` - E2E test configuration (7 browser/device targets)
- `postcss.config.mjs` - PostCSS with Tailwind

**Path Aliases:**
- `@/*` maps to project root (e.g., `@/lib/db/schema`)

## Build Configuration

**TypeScript:**
```json
{
  "target": "ESNext",
  "module": "esnext",
  "moduleResolution": "bundler",
  "strict": true,
  "jsx": "react-jsx"
}
```

**Jest:**
- Preset: ts-jest
- Test environment: node
- Test patterns: `**/__tests__/**/*.test.ts(x)`
- Coverage collection: `lib/**/*.ts(x)`

**Playwright:**
- Test directory: `./tests/e2e`
- 7 projects: chromium, firefox, webkit, Mobile Chrome, Mobile Safari, Mobile Safari (landscape), iPad
- Dev server auto-start with 2min timeout

## Platform Requirements

**Development:**
- Node.js (ESNext compatible)
- PostgreSQL database (local or Supabase)
- OpenAI API key for AI features

**Production:**
- Vercel deployment target (Next.js optimized)
- PostgreSQL with SSL required
- Connection pooling: max 10 connections, 20s idle timeout

---

*Stack analysis: 2025-01-25*
