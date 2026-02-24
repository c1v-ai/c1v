<!-- CLEO:START -->
@.cleo/templates/AGENT-INJECTION.md
<!-- CLEO:END -->

# Product Helper

AI-native PRD generation tool that teaches systems engineering methodology while guiding users through professional requirements creation.

## Tech Stack

- **Framework:** Next.js 15 (App Router, RSC, Turbopack)
- **AI/Agents:** LangChain.js + LangGraph + `@langchain/anthropic` (Claude Sonnet 4.5)
- **Database:** PostgreSQL via Drizzle ORM, hosted on Supabase
- **Auth:** Custom JWT (jose) + bcryptjs, middleware in `middleware.ts`
- **UI:** Tailwind CSS 4 + Radix UI + shadcn/ui + Lucide icons
- **Diagrams:** Mermaid.js for context/use-case/architecture diagrams
- **Testing:** Jest (456 unit tests) + Playwright (E2E)
- **Payments:** Stripe integration + credit-based usage gating
- **MCP:** JSON-RPC 2.0 server with 17 tools for IDE integration

## Architecture

### Agent System (`lib/langchain/agents/`)
- `intake/` - Conversational intake flow (chat-based PRD creation)
- `extraction-agent.ts` - Extracts structured data from conversations
- `schema-extraction-agent.ts` - Database schema generation
- `tech-stack-agent.ts` - Technology recommendations
- `user-stories-agent.ts` - User story generation
- `api-spec-agent.ts` - OpenAPI spec generation
- `infrastructure-agent.ts` - Infrastructure recommendations
- `guidelines-agent.ts` - Coding guidelines generation

### MCP Server (`lib/mcp/`)
- 17 tools: 7 core + 4 generator + 6 unique
- API key auth with rate limiting (100 req/min)
- Endpoint: `app/api/mcp/[projectId]/route.ts`
- Export generators: SKILL.md and CLAUDE.md for IDE integration

### Educational Content System (Phase 12 - Active)
- **Knowledge Banks:** `.planning/phases/12-project-explorer/knowledge-banks/` (6 files)
- **Components:** `components/education/` (thinking-state, tooltips)
- **Data/Types:** `lib/education/knowledge-bank.ts`
- **Methodology:** 6-step PRD flow: Context Diagram -> Use Case Diagram -> Scope Tree -> UCBD -> Functional Requirements -> SysML Activity Diagram

### Key Directories
```
app/
  (marketing)/          # Public landing page (shipped Feb 22, 2026)
  (dashboard)/          # Authenticated pages (home, projects, connections, chat)
  (login)/              # Auth pages (sign-in, sign-up, forgot/reset password)
  api/                  # Route handlers (chat, mcp, projects, stripe, team, user)
components/
  marketing/            # Landing page (9 components: hero, pricing, etc.)
  chat/                 # Chat UI (window, input, bubble, markdown)
  project/              # Project detail (chat panel, explorer, header)
  projects/             # Project list (card, form, prd-overview)
  connections/          # IDE/GitHub integration setup
  onboarding/           # Welcome flow + quick start
  education/            # Tooltips, thinking state
  diagrams/             # Mermaid diagram viewer
  ui/                   # shadcn/ui base components
lib/
  auth/                 # JWT session management
  db/                   # Drizzle schema, migrations, queries
  langchain/            # Agents, graphs, quick-start orchestrator
  mcp/                  # MCP server, tools, auth, rate limiting
  education/            # Reference data (industry, budget, market patterns)
  diagrams/             # Mermaid diagram generators
  payments/             # Stripe client + server actions
  validation/           # PRD validation rules
  email/                # Resend email client + templates
```

### Credit System (`lib/db/queries.ts`)
- `checkAndDeductCredits(teamId, amount)` — atomic check-and-deduct with race-safe WHERE clause
- Free tier: 2,500 credits (Quick Start=1250, chat=5, regen=100)
- Paid tier: 999,999 credits (effectively unlimited)
- Credits reset on subscription change (active→0/999999, canceled→0/2500)
- 402 responses handled in Quick Start dialog (upgrade prompt) and chat (toast with upgrade link)
- Credits display: User dropdown shows usage bar (free) or plan name (paid); Account settings page shows Usage & Plan card with progress bar and upgrade/manage CTA

## Conventions

- **API routes:** `app/api/[domain]/[id]/route.ts` pattern
- **Components:** Domain-grouped in `components/[domain]/`
- **Database:** Drizzle ORM with `lib/db/schema/` for types, validators, migrations
- **Env validation:** `lib/config/env.ts` - requires `POSTGRES_URL`, `AUTH_SECRET`, `ANTHROPIC_API_KEY`
- **Tests:** Co-located `__tests__/` directories next to source files
- **LLM provider:** Anthropic Claude via `@langchain/anthropic` (not OpenAI)
- **Route groups:** `(marketing)` = public, `(dashboard)` = authenticated, `(login)` = auth flows

## Deployed Features

- **Marketing Landing Page** (Feb 22, 2026) — 9 components, framer-motion animations, public at `/`
- **Credit System** (Feb 19, 2026) — atomic check-and-deduct, 3 tiers (Free/Base/Plus), 10% grace
- **Connections Page** (Feb 18, 2026) — IDE setup wizard, API key management, project file downloads
- **MCP Server** — 17 tools for IDE integration (CLAUDE.md + SKILL.md export)
- **Quick Start Pipeline** — SSE-streamed 5-step PRD generation from one sentence
- **Stripe Billing** — checkout, webhooks, plan management (Free/Base/Plus tiers)
