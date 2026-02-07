# Codebase Structure

**Analysis Date:** 2026-02-06

## Directory Layout

```
product-helper/
├── app/                        # Next.js App Router (pages + API routes)
│   ├── (dashboard)/            # Authenticated route group
│   │   ├── layout.tsx          # Header, nav, bottom nav
│   │   ├── page.tsx            # Root dashboard redirect
│   │   ├── account/            # Account settings page
│   │   ├── chat/               # Standalone chat page
│   │   ├── dashboard/          # User dashboard (general, security, activity)
│   │   ├── pricing/            # Pricing page
│   │   ├── projects/           # Projects list + individual project pages
│   │   │   ├── page.tsx        # Projects list
│   │   │   ├── new/            # Create new project
│   │   │   └── [id]/           # Project detail (layout + 12 sub-pages)
│   │   │       ├── layout.tsx              # Loads project, wraps in ChatProvider
│   │   │       ├── project-layout-client.tsx  # 3-column layout (explorer, content, chat)
│   │   │       ├── page.tsx                # Project overview
│   │   │       ├── chat/                   # Dedicated chat page
│   │   │       ├── diagrams/               # Mermaid diagram viewer
│   │   │       ├── generate/               # Quick Start generation
│   │   │       ├── connections/            # MCP/IDE connections
│   │   │       ├── settings/               # Project settings
│   │   │       ├── edit/                   # Edit project metadata
│   │   │       ├── data/                   # Raw extracted data viewer
│   │   │       ├── requirements/           # Product requirements section
│   │   │       │   ├── architecture/
│   │   │       │   ├── tech-stack/
│   │   │       │   ├── user-stories/
│   │   │       │   ├── system-overview/
│   │   │       │   ├── problem-statement/
│   │   │       │   ├── goals-metrics/
│   │   │       │   └── nfr/
│   │   │       └── backend/               # Backend spec section
│   │   │           ├── schema/
│   │   │           ├── api-spec/
│   │   │           ├── infrastructure/
│   │   │           └── guidelines/
│   │   ├── test-chat/          # Dev-only chat test page
│   │   └── welcome-test/       # Dev-only welcome flow test
│   ├── (login)/                # Public auth route group
│   │   ├── actions.ts          # signIn, signUp, signOut Server Actions
│   │   ├── sign-in/            # Sign in page
│   │   ├── sign-up/            # Sign up page
│   │   ├── forgot-password/    # Password reset request
│   │   └── reset-password/     # Password reset form
│   ├── actions/                # Server Actions (non-auth)
│   │   ├── projects.ts         # createProject, updateProject, deleteProject, getProjectById
│   │   └── conversations.ts    # saveAssistantMessage, triggerExtraction
│   ├── api/                    # API Route Handlers
│   │   ├── chat/projects/[projectId]/  # Chat endpoint + LangGraph handler
│   │   │   ├── route.ts                # POST - streaming chat
│   │   │   ├── langgraph-handler.ts    # LangGraph state machine orchestration
│   │   │   └── save/route.ts           # POST - save/extract conversation
│   │   ├── projects/[id]/              # Project CRUD + generators
│   │   │   ├── route.ts               # GET/DELETE project
│   │   │   ├── tech-stack/route.ts    # GET/POST tech stack recommendation
│   │   │   ├── stories/route.ts       # GET/POST user stories
│   │   │   ├── api-spec/route.ts      # GET/POST API specification
│   │   │   ├── infrastructure/route.ts # GET/POST infrastructure spec
│   │   │   ├── guidelines/route.ts    # GET/POST coding guidelines
│   │   │   ├── validate/route.ts      # POST PRD validation
│   │   │   ├── quick-start/route.ts   # POST quick-start pipeline (SSE)
│   │   │   ├── keys/route.ts          # GET/POST API keys
│   │   │   ├── export/route.ts        # GET project export
│   │   │   ├── exports/skill/route.ts # GET SKILL.md export
│   │   │   ├── exports/claude-md/route.ts # GET CLAUDE.md export
│   │   │   ├── explorer/route.ts      # GET explorer sidebar data
│   │   │   ├── sections/status/route.ts # GET/PUT section review status
│   │   │   └── review-status/route.ts  # GET review status
│   │   ├── mcp/[projectId]/route.ts   # POST MCP JSON-RPC server
│   │   ├── projects/route.ts          # GET all projects
│   │   ├── user/route.ts              # GET current user
│   │   ├── team/route.ts              # GET/PUT team
│   │   ├── stripe/checkout/route.ts   # POST Stripe checkout
│   │   ├── stripe/webhook/route.ts    # POST Stripe webhook
│   │   └── test-llm/route.ts          # GET LLM connectivity test
│   ├── layout.tsx              # Root layout (SWR, ThemeProvider, Toaster)
│   ├── globals.css             # Global styles
│   ├── theme.css               # CSS custom properties (design tokens)
│   ├── manifest.ts             # PWA manifest
│   └── not-found.tsx           # 404 page
├── components/                 # React components (domain-grouped)
│   ├── ui/                     # shadcn/ui primitives (14 components)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── sheet.tsx
│   │   ├── tabs.tsx
│   │   ├── accordion.tsx
│   │   ├── collapsible.tsx
│   │   ├── select.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── badge.tsx
│   │   ├── avatar.tsx
│   │   ├── dropdown-menu.tsx
│   │   └── radio-group.tsx
│   ├── project/                # Project-scoped layout components
│   │   ├── project-chat-provider.tsx   # React Context for chat + project state
│   │   ├── explorer-sidebar.tsx        # Left sidebar (section nav)
│   │   ├── chat-panel.tsx              # Right sidebar (chat)
│   │   ├── mobile-explorer-sheet.tsx   # Mobile explorer (bottom sheet)
│   │   ├── mobile-chat-sheet.tsx       # Mobile chat (bottom sheet)
│   │   ├── project-header-compact.tsx  # Compact header within project
│   │   ├── generation-progress-card.tsx # Quick Start progress UI
│   │   └── nav-config.ts              # Navigation item definitions
│   ├── projects/               # Project list + section content components
│   │   ├── project-card.tsx            # Project card for list view
│   │   ├── project-form.tsx            # Create/edit project form
│   │   ├── prd-overview.tsx            # PRD overview component
│   │   ├── section-status-badge.tsx    # Review status badge
│   │   ├── section-status-actions.tsx  # Review status actions
│   │   └── sections/                   # 13 section display components
│   │       ├── tech-stack-section.tsx
│   │       ├── user-stories-section.tsx
│   │       ├── schema-section.tsx
│   │       ├── api-spec-section.tsx
│   │       ├── infrastructure-section.tsx
│   │       ├── guidelines-section.tsx
│   │       ├── architecture-section.tsx
│   │       ├── system-overview-section.tsx
│   │       ├── actors-section.tsx
│   │       ├── scope-section.tsx
│   │       ├── problem-statement-section.tsx
│   │       ├── goals-metrics-section.tsx
│   │       └── nfr-section.tsx
│   ├── chat/                   # Chat UI components
│   ├── connections/            # MCP connection management
│   ├── diagrams/               # Mermaid diagram display
│   ├── education/              # Educational UI (thinking state, tooltips)
│   ├── export/                 # Export UI
│   ├── extracted-data/         # Raw data viewer
│   ├── generate/               # Quick Start UI
│   ├── navigation/             # App-level nav (bottom nav, mobile menu)
│   ├── onboarding/             # Onboarding flow components
│   ├── quick-start/            # Quick Start cards
│   ├── theme/                  # Theme toggle, provider
│   ├── validation/             # Validation report display
│   └── sw-register.tsx         # Service worker registration
├── lib/                        # Shared server-side + universal code
│   ├── langchain/              # AI/Agent core
│   │   ├── config.ts           # LLM instances (llm, streamingLLM, extractionLLM, cheapLLM)
│   │   ├── schemas.ts          # Zod schemas for structured extraction (37KB)
│   │   ├── prompts.ts          # System prompts for intake conversation
│   │   ├── message-utils.ts    # Message parsing, filtering, diagnostics
│   │   ├── utils.ts            # General LangChain utilities
│   │   ├── agents/             # Specialist AI agents
│   │   │   ├── intake/         # Intake flow sub-agents
│   │   │   │   ├── kb-question-generator.ts  # Knowledge-bank-aware question generation
│   │   │   │   ├── state-manager.ts          # Intake state management
│   │   │   │   ├── state.ts                  # State types
│   │   │   │   ├── completion-detector.ts    # Detects intake completion
│   │   │   │   ├── priority-scorer.ts        # Question priority scoring
│   │   │   │   ├── question-bank.ts          # Static question bank
│   │   │   │   └── questions.ts              # Question definitions
│   │   │   ├── extraction-agent.ts           # Extracts structured PRD data from conversation
│   │   │   ├── tech-stack-agent.ts           # Tech stack recommendations
│   │   │   ├── user-stories-agent.ts         # User story generation
│   │   │   ├── schema-extraction-agent.ts    # Database schema generation
│   │   │   ├── api-spec-agent.ts             # OpenAPI spec generation
│   │   │   ├── api-spec-openapi-export.ts    # OpenAPI export formatting
│   │   │   ├── infrastructure-agent.ts       # Infrastructure recommendations
│   │   │   ├── guidelines-agent.ts           # Coding guidelines generation
│   │   │   └── quick-start-synthesis-agent.ts # Quick Start vision expansion
│   │   ├── graphs/             # LangGraph state machine
│   │   │   ├── index.ts        # Barrel exports
│   │   │   ├── intake-graph.ts # Graph assembly (StateGraph + Annotation)
│   │   │   ├── types.ts        # IntakeState type, ArtifactPhase enum, constants
│   │   │   ├── channels.ts     # State channel definitions and reducers
│   │   │   ├── edges.ts        # Conditional routing functions
│   │   │   ├── checkpointer.ts # State serialization/persistence
│   │   │   ├── utils.ts        # Message formatting, token estimation, truncation
│   │   │   └── nodes/          # Graph node implementations
│   │   │       ├── analyze-response.ts       # Intent detection
│   │   │       ├── extract-data.ts           # Data extraction from message
│   │   │       ├── check-prd-spec.ts         # PRD-SPEC validation check
│   │   │       ├── compute-next-question.ts  # Next question selection
│   │   │       ├── generate-artifact.ts      # Diagram/table generation
│   │   │       └── generate-response.ts      # AI response generation
│   │   └── quick-start/        # Quick Start pipeline
│   │       └── orchestrator.ts # Pipeline orchestrator (synthesis -> extraction -> validation -> persistence)
│   ├── db/                     # Database layer
│   │   ├── drizzle.ts          # Connection pool + Drizzle client
│   │   ├── schema.ts           # All table definitions, relations, type exports (526 lines)
│   │   ├── queries.ts          # User/team queries (getUser, getTeamForUser, etc.)
│   │   ├── queries/            # Domain-specific queries
│   │   │   └── explorer.ts     # Explorer sidebar data loader
│   │   ├── schema/             # Extended schema types
│   │   │   ├── v2-types.ts     # TypeScript types for JSONB data models
│   │   │   ├── v2-validators.ts # Zod validators for JSONB data
│   │   │   └── index.ts        # Barrel exports
│   │   ├── type-guards.ts      # Runtime type guards for JSONB parsing
│   │   ├── migrations/         # SQL migration files
│   │   ├── seed.ts             # Database seeding script
│   │   └── setup.ts            # Database setup/init script
│   ├── auth/                   # Authentication
│   │   ├── session.ts          # JWT sign/verify, password hash, getSession, setSession
│   │   └── middleware.ts       # validatedAction, validatedActionWithUser, withTeam
│   ├── api/                    # API utilities
│   │   └── with-project-auth.ts # withProjectAuth HOC for route handlers
│   ├── mcp/                    # MCP Server
│   │   ├── server.ts           # JSON-RPC 2.0 request handler
│   │   ├── types.ts            # MCP protocol types + Zod schemas
│   │   ├── tool-registry.ts    # Tool registration/lookup
│   │   ├── auth.ts             # API key validation
│   │   ├── rate-limit.ts       # In-memory rate limiter
│   │   ├── skill-generator.ts  # SKILL.md export generator
│   │   ├── claude-md-generator.ts # CLAUDE.md export generator
│   │   └── tools/              # 17 MCP tool implementations
│   │       ├── index.ts        # Tool registration entry point
│   │       ├── core/           # 7 core read-only tools
│   │       ├── generators/     # 4 generator tools (invoke agents)
│   │       └── unique/         # 6 unique tools (validation, search, Q&A)
│   ├── config/                 # Configuration
│   │   └── env.ts              # Zod-validated environment variables
│   ├── constants/              # Centralized constants
│   │   └── index.ts            # TIME, LLM, SCORING, RATE_LIMIT, VALIDATION constants
│   ├── validation/             # PRD validation
│   │   ├── validator.ts        # PRD-SPEC validator (19KB)
│   │   ├── types.ts            # Validation types
│   │   └── specs/              # Validation spec definitions
│   ├── diagrams/               # Mermaid diagram generation
│   │   ├── generators.ts       # All diagram generators (65KB)
│   │   └── beautiful-mermaid.ts # Mermaid rendering helper
│   ├── education/              # Educational content system
│   │   ├── knowledge-bank.ts   # Knowledge bank definitions (6 steps, 25KB)
│   │   └── phase-mapping.ts    # KB step -> artifact phase mapping
│   ├── email/                  # Email templates (Resend)
│   ├── export/                 # Export utilities
│   ├── hooks/                  # React hooks
│   │   ├── use-keyboard-shortcuts.ts
│   │   └── use-media-query.ts
│   ├── payments/               # Stripe integration
│   ├── types/                  # Shared TypeScript types
│   │   └── api-specification.ts
│   ├── utils/                  # Utility functions
│   └── utils.ts                # cn() classname utility (tailwind-merge + clsx)
├── tests/                      # E2E tests
│   └── e2e/                    # Playwright tests
│       ├── fixtures/           # Test fixtures (auth state)
│       ├── helpers/            # Test helpers
│       ├── pages/              # Page object models
│       └── .auth/              # Saved auth state
├── supabase/                   # Supabase local dev config
├── scripts/                    # Utility scripts
├── public/                     # Static assets
│   └── icons/                  # App icons (PWA)
├── middleware.ts                # Next.js edge middleware (auth + security headers)
├── next.config.ts              # Next.js config (serverExternalPackages for LangChain)
├── drizzle.config.ts           # Drizzle Kit config
├── tsconfig.json               # TypeScript config (strict, ESNext, @/* alias)
├── jest.config.ts              # Jest config
├── playwright.config.ts        # Playwright config
├── package.json                # Dependencies and scripts
├── components.json             # shadcn/ui component config
├── postcss.config.mjs          # PostCSS config
└── .env.local                  # Environment variables (not committed)
```

## Directory Purposes

**`app/`:**
- Purpose: Next.js App Router entry points. Pages, layouts, API routes, Server Actions.
- Contains: `.tsx` page files, `route.ts` API handlers, `actions.ts` server actions
- Key files: `layout.tsx` (root), `(dashboard)/layout.tsx` (auth shell), `(dashboard)/projects/[id]/layout.tsx` (project shell)

**`components/`:**
- Purpose: Reusable React components grouped by domain
- Contains: Client components (`.tsx`), one config file (`nav-config.ts`)
- Key files: `project/project-chat-provider.tsx` (central state), `project/explorer-sidebar.tsx`, `project/chat-panel.tsx`

**`lib/`:**
- Purpose: All server-side and shared logic. Not a component directory.
- Contains: AI agents, database, auth, MCP server, validation, utilities
- Key files: `langchain/config.ts` (LLM setup), `db/schema.ts` (all tables), `db/drizzle.ts` (connection), `config/env.ts` (env validation)

**`lib/langchain/agents/`:**
- Purpose: Individual AI agents, each responsible for generating one PRD section
- Contains: Agent files (one per output type), intake sub-agents
- Key files: `extraction-agent.ts` (core data extraction), `intake/kb-question-generator.ts` (question selection)

**`lib/langchain/graphs/`:**
- Purpose: LangGraph state machine that orchestrates the intake conversation
- Contains: Graph definition, state types, node implementations, edge routing, checkpointer
- Key files: `intake-graph.ts` (graph assembly), `edges.ts` (routing logic), `nodes/` (6 node implementations)

**`lib/db/`:**
- Purpose: Database schema, connection, queries, migrations
- Contains: Drizzle ORM definitions, SQL migrations, query functions
- Key files: `schema.ts` (tables + relations + types), `drizzle.ts` (connection), `queries.ts` (auth queries)

**`lib/mcp/`:**
- Purpose: MCP server exposing project data to IDE integrations
- Contains: JSON-RPC server, tool registry, 17 tool implementations, auth, rate limiting
- Key files: `server.ts` (request handler), `tools/index.ts` (registration), `auth.ts` (API key validation)

## Key File Locations

**Entry Points:**
- `app/layout.tsx`: Root layout (providers, global config)
- `middleware.ts`: Request middleware (auth, headers)
- `app/api/chat/projects/[projectId]/route.ts`: Chat API entry
- `app/api/mcp/[projectId]/route.ts`: MCP server entry

**Configuration:**
- `lib/config/env.ts`: Validated environment variables
- `lib/langchain/config.ts`: LLM instance configuration
- `lib/constants/index.ts`: Application constants
- `next.config.ts`: Next.js config (server external packages)
- `drizzle.config.ts`: Drizzle Kit migration config
- `tsconfig.json`: TypeScript config (`@/*` path alias)
- `components.json`: shadcn/ui component config

**Core Logic:**
- `lib/langchain/graphs/intake-graph.ts`: LangGraph state machine assembly
- `lib/langchain/graphs/edges.ts`: Graph routing decisions
- `app/api/chat/projects/[projectId]/langgraph-handler.ts`: Chat -> LangGraph orchestration
- `lib/langchain/quick-start/orchestrator.ts`: Quick Start pipeline
- `lib/validation/validator.ts`: PRD-SPEC validation engine
- `lib/diagrams/generators.ts`: All Mermaid diagram generators

**Database:**
- `lib/db/schema.ts`: All 11 tables, relations, type exports
- `lib/db/drizzle.ts`: PostgreSQL connection pool
- `lib/db/queries.ts`: User/team auth queries
- `lib/db/queries/explorer.ts`: Explorer sidebar data loader
- `lib/db/schema/v2-types.ts`: JSONB data model types
- `lib/db/migrations/`: SQL migration files

**Testing:**
- `jest.config.ts`: Unit test config
- `playwright.config.ts`: E2E test config
- `tests/e2e/`: Playwright E2E test specs
- `lib/langchain/agents/__tests__/`: Agent unit tests
- `lib/langchain/graphs/__tests__/`: Graph unit tests
- `app/api/projects/[id]/*/__tests__/`: API route unit tests

## Naming Conventions

**Files:**
- `kebab-case.ts` / `kebab-case.tsx`: All source files
- `route.ts`: Next.js API route handlers
- `page.tsx`: Next.js page components
- `layout.tsx`: Next.js layout components
- `actions.ts`: Server Actions
- `*.test.ts`: Unit test files (co-located in `__tests__/`)

**Directories:**
- `kebab-case/`: All directories
- `[param]/`: Next.js dynamic route segments
- `(group)/`: Next.js route groups (no URL segment)
- `__tests__/`: Co-located test directories

**Components:**
- `PascalCase` exports: React components (`ExplorerSidebar`, `ChatPanel`)
- `camelCase` exports: hooks (`useProjectChat`, `useMediaQuery`)
- File name matches primary export in kebab-case form

**Functions/Variables:**
- `camelCase`: Functions, variables, parameters
- `UPPER_SNAKE_CASE`: Constants (`CLAUDE_MODELS`, `LLM_DEFAULTS`, `TIME_CONSTANTS`)
- `PascalCase`: Types, interfaces, enums (`IntakeState`, `ProjectStatus`, `ArtifactPhase`)

## Where to Add New Code

**New Page (within project):**
- Create: `app/(dashboard)/projects/[id]/<section-name>/page.tsx`
- Add nav entry: `components/project/nav-config.ts` -> `getProjectNavItems()`
- If it displays generated data, add a section component: `components/projects/sections/<section>-section.tsx`

**New API Route (project-scoped):**
- Create: `app/api/projects/[id]/<endpoint>/route.ts`
- Use `withProjectAuth` wrapper: `import { withProjectAuth } from '@/lib/api/with-project-auth'`
- Pattern: `export const GET = withProjectAuth(async (req, { user, team, projectId }) => { ... })`

**New AI Agent:**
- Create: `lib/langchain/agents/<agent-name>.ts`
- Use `structuredLLM` or `extractionLLM` from `lib/langchain/config.ts`
- Define Zod schema for output in the agent file or `lib/langchain/schemas.ts`
- Add API route trigger: `app/api/projects/[id]/<agent-name>/route.ts`
- If JSONB storage needed, add field to `project_data` table in `lib/db/schema.ts`

**New LangGraph Node:**
- Create: `lib/langchain/graphs/nodes/<node-name>.ts`
- Export from: `lib/langchain/graphs/nodes/index.ts`
- Add to graph assembly: `lib/langchain/graphs/intake-graph.ts`
- Add edge routing: `lib/langchain/graphs/edges.ts`

**New React Component:**
- Domain component: `components/<domain>/<component-name>.tsx`
- UI primitive: `components/ui/<component-name>.tsx` (use shadcn CLI: `npx shadcn@latest add <name>`)
- Hook: `lib/hooks/use-<hook-name>.ts`

**New Database Table:**
- Add table definition: `lib/db/schema.ts`
- Add relations: same file, below table
- Add types: same file, at bottom
- Generate migration: `pnpm db:generate`
- Run migration: `pnpm db:migrate:sql` (preferred over `db:migrate` due to known api_keys conflict)

**New MCP Tool:**
- Determine category (core/generator/unique)
- Create: `lib/mcp/tools/<category>/<tool-name>.ts`
- Register in: `lib/mcp/tools/<category>/index.ts`
- Follow existing tool pattern (define `ToolDefinition` + `ToolHandler`)

**New Server Action:**
- Add to: `app/actions/<domain>.ts` (if project-related) or `app/(login)/actions.ts` (if auth-related)
- Wrap with `validatedActionWithUser(zodSchema, handler)` from `lib/auth/middleware.ts`

**New Constant:**
- Add to: `lib/constants/index.ts` in the appropriate section
- Use `as const` for object constants

## Special Directories

**`app/(dashboard)/`:**
- Purpose: All authenticated pages. Route group (no URL segment).
- Generated: No
- Committed: Yes

**`app/(login)/`:**
- Purpose: Public auth pages (sign-in, sign-up, password reset). Route group.
- Generated: No
- Committed: Yes

**`lib/db/migrations/`:**
- Purpose: SQL migration files generated by Drizzle Kit
- Generated: Yes (via `pnpm db:generate`)
- Committed: Yes

**`.next/`:**
- Purpose: Next.js build output and cache
- Generated: Yes
- Committed: No (in .gitignore)

**`supabase/`:**
- Purpose: Supabase local development configuration
- Generated: Partially (`.branches/`, `.temp/`)
- Committed: Config files yes, cache no

**`tests/e2e/.auth/`:**
- Purpose: Saved Playwright authentication state for test reuse
- Generated: Yes (during test setup)
- Committed: No

**`upgrade v2/`:**
- Purpose: Legacy migration planning docs and screenshots
- Generated: No
- Committed: Unclear (appears to be reference material)

---

*Structure analysis: 2026-02-06*
