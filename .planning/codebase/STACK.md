# Technology Stack

**Analysis Date:** 2026-04-28
**App:** `apps/product-helper` (Next.js PRD generator deployed at prd.c1v.ai)

> Scope: `apps/product-helper/` only. Monorepo root `c1v/` uses PNPM workspaces + Turborepo. This doc supersedes the 2026-04-19 scan.

## Languages

**Primary:**
- TypeScript 5.9.3 — all app, lib, components, tests (~60 jest test files, all TS)
- SQL — Drizzle migrations at `lib/db/migrations/*.sql` (12 files, 0000–0011, with duplicate numbering at 0004/0007/0011)

**Secondary:**
- JavaScript — `scripts/check-lighthouse.js` only

## Runtime

**Environment:**
- Node.js (Next.js 15.5.9 App Router; `middleware.ts` pins `runtime: 'nodejs'`)
- React 19.1.0 / React-DOM 19.1.0

**Package Manager:**
- pnpm via monorepo root (`pnpm-workspace.yaml`, `turbo.json`)
- `package.json` name `product-helper`, version `0.1.0`, private

## Frameworks

**Core:**
- Next.js 15.5.9 — App Router, route groups `(marketing)` `(dashboard)` `(login)`, Server Actions in `app/actions/`, SSE streaming (Quick Start)
- Turbopack — dev only (`next.config.ts: turbopack.root = '../../'`)
- Tailwind CSS 4.1.7 + `@tailwindcss/postcss` 4.1.7, `tw-animate-css` 1.4.0, `tailwind-merge` 3.4.0, `class-variance-authority` 0.7.1
- Radix UI primitives (accordion, collapsible, dialog, select, tabs) + shadcn/ui pattern in `components/ui/` (16 components)
- Framer Motion 12.34.3 — marketing-landing animations
- `next-themes` 0.4.6 — light/dark (Firefly/Porcelain brand system)

**AI / Agents:**
- `@langchain/core` 0.3.40
- `@langchain/anthropic` 0.3.14 — sole LLM provider (Claude Sonnet 4.5)
- `@langchain/langgraph` 0.2.60 — intake state machine (`lib/langchain/graphs/`)
- `@langchain/community` 0.3.26, `langchain` 0.3.26
- `ai` 3.4.33 — Vercel AI SDK (`StreamingTextResponse` in chat route, SSE in quick-start route)
- `zod` 3.25.76 + `zod-to-json-schema` 3.25.1 — structured outputs + module schema emission

**Database / ORM:**
- `drizzle-orm` 0.43.1, `drizzle-kit` 0.31.8
- `postgres` 3.4.8 driver
- pgvector extension enabled in migration `0008_enable_pgvector.sql`

**Auth:**
- `jose` 6.1.3 (JWT sign/verify in `lib/auth/session.ts`)
- `bcryptjs` 3.0.3 (password hashing)
- Custom session cookie in `middleware.ts` — no NextAuth, no Clerk

**Payments:**
- `stripe` 18.5.0 — `lib/payments/stripe.ts`, `lib/payments/actions.ts`

**Email:**
- `resend` 6.7.0 + `@react-email/components` 1.0.4 — `lib/email/resend.ts`, `lib/email/send-invitation.ts`, `lib/email/send-password-reset.ts`

**Diagrams:**
- `mermaid` 11.12.2, `beautiful-mermaid` 0.1.3 — `lib/diagrams/generators.ts`, `components/diagrams/`

**Testing:**
- `jest` 30.2.0 + `ts-jest` 29.4.6 — 60 `.test.ts` files across `lib/` and `app/(login)/__tests__/`
- `@playwright/test` 1.57.0 + `@axe-core/playwright` 4.11.0 — E2E at `tests/e2e/` (14 specs: auth, layout, chat, projects, accessibility, PWA, responsive, smoke, visual-regression, content-views)

**Build / Dev:**
- `tsx` 4.21.0 — script runner (`pnpm tsx scripts/<name>.ts`)
- `dotenv` 16.6.1, `ts-node` 10.9.2
- `js-yaml` 4.1.1, `yaml` 2.8.2

## Key Dependencies

**Critical:**
- `next` — framework
- `@langchain/anthropic` — sole LLM provider
- `drizzle-orm` + `postgres` — all persistence
- `stripe` — billing
- `zod` — schema layer shared across LangGraph nodes, API validation, and JSON-schema emission for Modules 2/3/4/8

**UI secondary:**
- `sonner` 1.7.4 (toasts, global `<Toaster>` in `app/layout.tsx`)
- `swr` 2.3.8 (client data fetching, SWRConfig with `/api/user` + `/api/team` fallbacks in `app/layout.tsx`)
- `lucide-react` 0.511.0
- `react-markdown` 10.1.0 + `remark-gfm` 4.0.1
- `use-stick-to-bottom` 1.1.1 (chat autoscroll)

**Fonts:** `Space_Grotesk` via `next/font/google` (weight 400, `--font-space-grotesk`). Consolas body font via CSS (system).

## Configuration

**Env validation (`lib/config/env.ts`):**
- Imported at top of `next.config.ts` — app fails to start if invalid.
- Required: `POSTGRES_URL`, `AUTH_SECRET` (≥32 chars), `ANTHROPIC_API_KEY` (must start `sk-ant-`), `STRIPE_SECRET_KEY` (`sk_`), `STRIPE_WEBHOOK_SECRET` (`whsec_`), `BASE_URL` (valid URL).
- Optional: `RESEND_API_KEY`.
- Env files present (contents not read): `.env`, `.env.local`, `.env.example`, `.env.local.example`, `.env.test.example`.

**Build config:**
- `next.config.ts` — `serverExternalPackages` list for all `@langchain/*`, `langchain`, `zod-to-json-schema`, `@anthropic-ai/sdk`, `@langchain/textsplitters`, `@langchain/openai` (externalised to prevent duplicate-module `isInstance` breakage).
- `drizzle.config.ts` — reads `POSTGRES_URL`, dialect `postgresql`, emits to `lib/db/migrations`.
- `playwright.config.ts` — `baseURL` from `BASE_URL`, auth state saved to `tests/e2e/.auth/user.json`.
- `jest.config.ts` — co-located `__tests__/` convention.

## Platform Requirements

**Development:**
- Local Supabase via Docker — `supabase/config.toml` pins project_id `product-helper-local`, DB port 54322, API 54321.
- `pnpm db:start` / `pnpm db:stop` wrap `supabase start`.
- **Known broken:** `drizzle-kit migrate` due to duplicate migration numbers. Use `pnpm db:migrate:sql` (psql loop) or Supabase SQL editor (user memory confirms).
- Tests require env stubs: `POSTGRES_URL=stub AUTH_SECRET=<32+chars> ANTHROPIC_API_KEY=sk-ant-stub STRIPE_SECRET_KEY=sk_test_stub STRIPE_WEBHOOK_SECRET=whsec_stub BASE_URL=http://localhost:3000`.

**Production:**
- Vercel — root directory `apps/product-helper`, deploying from `main` (per `CURRENT-STATUS.md` 2026-01-25).
- Supabase production project `yxginqyxtysjdkeymnon`.
- Env vars required in Vercel: `POSTGRES_URL`, `AUTH_SECRET`, `ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `LANGCHAIN_API_KEY`, `LANGCHAIN_PROJECT`, `LANGCHAIN_TRACING_V2`, `BASE_URL`, `RESEND_API_KEY`.
- Long-running routes: `app/api/projects/[id]/quick-start/route.ts` sets `export const maxDuration = 120` (Vercel 2-minute limit for SSE pipeline).

---

*Stack analysis: 2026-04-28*
