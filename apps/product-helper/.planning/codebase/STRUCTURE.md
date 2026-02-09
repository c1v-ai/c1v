# Codebase Structure

**Analysis Date:** 2026-02-08

## Directory Layout

```
product-helper/
├── app/                        # Next.js App Router (pages + API routes)
│   ├── (dashboard)/            # Authenticated route group
│   │   ├── layout.tsx          # Header, nav, bottom nav (client component)
│   │   ├── page.tsx            # Root dashboard redirect
│   │   ├── account/            # Account settings page
│   │   ├── chat/               # Standalone chat page
│   │   ├── dashboard/          # User dashboard (general, security, activity)
│   │   │   ├── layout.tsx      # Dashboard sub-layout
│   │   │   ├── general/        # General settings
│   │   │   ├── security/       # Security settings
│   │   │   └── activity/       # Activity logs
│   │   ├── home/               # Welcome/onboarding page (projects sidebar)
│   │   ├── pricing/            # Pricing page with Stripe checkout
│   │   ├── projects/           # Projects list + individual project pages
│   │   │   ├── page.tsx        # Projects list
│   │   │   ├── new/            # Create new project form
│   │   │   └── [id]/           # Project detail (layout + 14 sub-pages)
│   │   │       ├── layout.tsx              # RSC: loads project + conversations
│   │   │       ├── project-layout-client.tsx  # 3-column layout (explorer, content, chat)
│   │   │       ├── page.tsx                # Project overview (QuickInstructions + ArtifactPipeline)
│   │   │       ├── chat/                   # Dedicated chat page
│   │   │       ├── diagrams/               # Mermaid diagram viewer
│   │   │       ├── generate/               # Quick Start generation page
│   │   │       ├── connections/            # MCP/IDE connection management
│   │   │       ├── settings/               # Project settings (name, vision, delete)
│   │   │       ├── edit/                   # Edit project metadata
│   │   │       ├── data/                   # Raw extracted data viewer
│   │   │       ├── requirements/           # Product requirements section
│   │   │       │   ├── page.tsx            # Requirements index
│   │   │       │   ├── architecture/       # Architecture diagram view
│   │   │       │   ├── tech-stack/         # Tech stack recommendations
│   │   │       │   ├── user-stories/       # User story list/kanban
│   │   │       │   ├── system-overview/    # System overview
│   │   │       │   ├── problem-statement/  # Problem statement
│   │   │       │   ├── goals-metrics/      # Goals & success metrics
│   │   │       │   └── nfr/               # Non-functional requirements
│   │   │       └── backend/               # Backend specification section
│   │   │           ├── schema/            # Database schema
│   │   │           ├── api-spec/          # API specification (OpenAPI)
│   │   │           ├── infrastructure/    # Infrastructure recommendations
│   │   │           └── guidelines/        # Coding guidelines
│   │   └── test-chat/          # Dev-only chat test page
│   ├── (login)/                # Public auth route group
│   │   ├── actions.ts          # signIn, signUp, signOut Server Actions
│   │   ├── login.tsx           # Shared login form component
│   │   ├── sign-in/            # Sign in page
│   │   ├── sign-up/            # Sign up page
│   │   ├── forgot-password/    # Password reset request
│   │   └── reset-password/     # Password reset form
│   ├── actions/                # Server Actions (non-auth)
│   │   ├── projects.ts         # createProject, updateProject, deleteProject, getProjectById
│   │   └── conversations.ts    # saveAssistantMessage, triggerExtraction
│   ├── api/                    # API Route Handlers
│   │   ├── chat/projects/[projectId]/  # Chat endpoint + LangGraph handler
│   │   │   ├── route.ts                # POST - streaming chat (dual mode)
│   │   │   ├── langgraph-handler.ts    # LangGraph state machine + post-intake generation
│   │   │   └── save/route.ts           # POST - save/extract conversation
│   │   ├── projects/[id]/              # Project CRUD + generators
│   │   │   ├── route.ts               # GET/DELETE project
│   │   │   ├── tech-stack/route.ts    # GET/POST tech stack recommendation
│   │   │   ├── stories/               # User stories
│   │   │   │   ├── route.ts           # GET/POST user stories
│   │   │   │   └── [storyId]/route.ts # GET/PUT/DELETE individual story
│   │   │   ├── api-spec/route.ts      # GET/POST API specification
│   │   │   ├── infrastructure/route.ts # GET/POST infrastructure spec
│   │   │   ├── guidelines/route.ts    # GET/POST coding guidelines
│   │   │   ├── validate/route.ts      # POST PRD validation
│   │   │   ├── quick-start/route.ts   # POST quick-start pipeline (SSE, maxDuration=120)
│   │   │   ├── keys/                  # API key management
│   │   │   │   ├── route.ts           # GET/POST API keys
│   │   │   │   └── [keyId]/route.ts   # DELETE individual key
│   │   │   ├── export/route.ts        # GET project export (markdown)
│   │   │   ├── exports/skill/route.ts # GET SKILL.md export
│   │   │   ├── exports/claude-md/route.ts # GET CLAUDE.md export
│   │   │   ├── explorer/route.ts      # GET explorer sidebar data
│   │   │   ├── sections/status/route.ts # GET/PUT section review status
│   │   │   └── review-status/route.ts  # GET review status
│   │   ├── mcp/[projectId]/route.ts   # POST MCP JSON-RPC 2.0 server
│   │   ├── projects/route.ts          # GET all projects for team
│   │   ├── user/route.ts              # GET current user
│   │   ├── team/route.ts              # GET/PUT team
│   │   ├── stripe/checkout/route.ts   # POST create Stripe checkout session
│   │   ├── stripe/webhook/route.ts    # POST Stripe webhook handler
│   │   └── test-llm/route.ts          # GET LLM connectivity test
│   ├── layout.tsx              # Root layout (SWR, ThemeProvider, Toaster, PWA)
│   ├── globals.css             # Global styles
│   ├── theme.css               # CSS custom properties (design tokens)
│   ├── manifest.ts             # PWA web app manifest
│   ├── not-found.tsx           # 404 page
│   └── offline/page.tsx        # PWA offline fallback page
├── components/                 # React components (domain-grouped)
│   ├── ui/                     # shadcn/ui primitives (14 components)
│   │   ├── accordion.tsx       # Radix accordion
│   │   ├── avatar.tsx          # Radix avatar
│   │   ├── badge.tsx           # Status badges
│   │   ├── button.tsx          # Button variants (CVA)
│   │   ├── card.tsx            # Card layout
│   │   ├── collapsible.tsx     # Radix collapsible
│   │   ├── dialog.tsx          # Radix dialog/modal
│   │   ├── dropdown-menu.tsx   # Radix dropdown menu
│   │   ├── input.tsx           # Form input
│   │   ├── label.tsx           # Form label
│   │   ├── radio-group.tsx     # Radix radio group
│   │   ├── select.tsx          # Radix select
│   │   ├── sheet.tsx           # Radix sheet (slide-over)
│   │   └── tabs.tsx            # Radix tabs
│   ├── project/                # Project-scoped layout components
│   │   ├── project-chat-provider.tsx   # React Context: chat + project state
│   │   ├── explorer-sidebar.tsx        # Left sidebar (section navigation tree)
│   │   ├── chat-panel.tsx              # Right sidebar (chat panel)
│   │   ├── mobile-explorer-sheet.tsx   # Mobile explorer (bottom sheet)
│   │   ├── mobile-chat-sheet.tsx       # Mobile chat (bottom sheet)
│   │   ├── project-header-compact.tsx  # Compact header within project
│   │   ├── generation-progress-card.tsx # Quick Start progress UI
│   │   ├── nav-config.ts              # Navigation item definitions (getProjectNavItems)
│   │   └── overview/                  # Project overview components
│   │       ├── quick-instructions.tsx  # Getting started instructions
│   │       ├── artifact-pipeline.tsx   # Artifact generation pipeline display
│   │       └── project-context-card.tsx # Project context summary card
│   ├── projects/               # Project list + section content components
│   │   ├── project-card.tsx            # Project card for list view
│   │   ├── project-form.tsx            # Create/edit project form
│   │   ├── prd-overview.tsx            # PRD overview display
│   │   ├── section-status-badge.tsx    # Review status badge
│   │   ├── section-status-actions.tsx  # Review status action buttons
│   │   ├── explorer/                   # Explorer tree components
│   │   │   ├── index.ts               # Barrel exports
│   │   │   ├── explorer-sidebar.tsx   # Explorer sidebar (alternate)
│   │   │   ├── explorer-tree.tsx      # Tree view component
│   │   │   ├── explorer-node.tsx      # Individual tree node
│   │   │   ├── explorer-header.tsx    # Explorer header
│   │   │   ├── explorer-progress.tsx  # Completeness progress bar
│   │   │   ├── explorer-search.tsx    # Section search
│   │   │   └── mobile-explorer.tsx    # Mobile-optimized explorer
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
│   │   ├── index.ts            # Barrel exports
│   │   ├── chat-window.tsx     # Main chat window
│   │   ├── chat-input.tsx      # Message input with submit
│   │   ├── chat-message-bubble.tsx # Individual message bubble
│   │   ├── markdown-renderer.tsx   # Markdown rendering in chat
│   │   ├── collapsible-section.tsx # Collapsible sections in chat
│   │   ├── diagram-link-card.tsx   # Diagram link in chat
│   │   └── diagram-popup.tsx       # Full-screen diagram viewer
│   ├── connections/            # MCP connection management
│   │   ├── index.ts            # Barrel exports
│   │   ├── api-key-management.tsx  # API key CRUD
│   │   ├── connection-status.tsx   # Connection status indicator
│   │   ├── export-section.tsx      # Export options
│   │   └── integration-cards.tsx   # IDE integration cards
│   ├── diagrams/               # Mermaid diagram display
│   │   └── diagram-viewer.tsx      # Mermaid diagram renderer
│   ├── education/              # Educational UI components
│   │   ├── thinking-state.tsx      # AI thinking state indicator
│   │   └── tooltip-term.tsx        # Educational tooltip for terms
│   ├── export/                 # Export UI
│   │   └── export-button.tsx       # Export trigger button
│   ├── extracted-data/         # Raw data viewer
│   │   └── data-display.tsx        # Extracted data display
│   ├── generate/               # Quick Start UI
│   │   ├── pipeline-page.tsx       # Full pipeline page
│   │   ├── pipeline-card.tsx       # Individual pipeline step card
│   │   └── review-status-badge.tsx # Review status in pipeline
│   ├── navigation/             # App-level navigation
│   │   ├── bottom-nav.tsx          # Mobile bottom navigation bar
│   │   └── mobile-menu.tsx         # Mobile hamburger menu
│   ├── onboarding/             # Onboarding/welcome flow
│   │   ├── welcome-onboarding.tsx      # Welcome page layout
│   │   ├── projects-sidebar.tsx        # Projects list sidebar
│   │   ├── projects-sidebar-wrapper.tsx # Server component wrapper
│   │   ├── building-input.tsx          # Project creation input
│   │   ├── quick-start-chips.tsx       # Quick start suggestion chips
│   │   ├── scope-mode-toggle.tsx       # Scope mode toggle
│   │   ├── value-props-grid.tsx        # Value proposition grid
│   │   └── project-metadata-selectors.tsx # Project type/stage selectors
│   ├── quick-start/            # Quick Start cards
│   │   ├── quick-start-button.tsx  # Start generation button
│   │   └── progress-cards.tsx      # Progress step cards
│   ├── theme/                  # Theme management
│   │   ├── mode-toggle.tsx         # Dark/light mode toggle
│   │   └── theme-provider.tsx      # next-themes provider
│   ├── validation/             # Validation report
│   │   └── validation-report.tsx   # PRD validation results display
│   └── sw-register.tsx         # Service worker registration component
├── lib/                        # Shared server-side + universal code
│   ├── langchain/              # AI/Agent core
│   │   ├── config.ts           # LLM instances (llm, streamingLLM, extractionLLM, cheapLLM, createClaudeAgent)
│   │   ├── schemas.ts          # Zod schemas for structured extraction
│   │   ├── prompts.ts          # System prompts for intake conversation
│   │   ├── message-utils.ts    # Message parsing, filtering, diagnostics (Turbopack-safe)
│   │   ├── utils.ts            # General LangChain utilities
│   │   ├── agents/             # Specialist AI agents
│   │   │   ├── intake/         # Intake flow sub-agents
│   │   │   │   ├── index.ts                # Barrel exports
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
│   │   │   ├── index.ts        # Barrel exports (types, channels, utils, edges, checkpointer, graph)
│   │   │   ├── intake-graph.ts # Graph assembly (StateGraph + IntakeStateAnnotation)
│   │   │   ├── types.ts        # IntakeState, ArtifactPhase, UserIntent, thresholds, constants
│   │   │   ├── channels.ts     # State channel definitions and custom reducers
│   │   │   ├── edges.ts        # Conditional routing functions (4 route functions)
│   │   │   ├── checkpointer.ts # State serialization/persistence to graph_checkpoints table
│   │   │   ├── utils.ts        # Message formatting, token estimation, truncation helpers
│   │   │   └── nodes/          # Graph node implementations (6 nodes)
│   │   │       ├── index.ts               # Barrel exports
│   │   │       ├── analyze-response.ts    # Intent detection (PROVIDE_INFO, STOP_TRIGGER, etc.)
│   │   │       ├── extract-data.ts        # Data extraction from user message
│   │   │       ├── check-prd-spec.ts      # PRD-SPEC validation check
│   │   │       ├── compute-next-question.ts # Next question selection (KB-aware)
│   │   │       ├── generate-artifact.ts   # Mermaid diagram/table generation
│   │   │       └── generate-response.ts   # AI conversational response
│   │   └── quick-start/        # Quick Start pipeline
│   │       └── orchestrator.ts # Pipeline orchestrator (SSE streaming, parallel agents)
│   ├── db/                     # Database layer
│   │   ├── drizzle.ts          # Connection pool (postgres.js, max 10) + Drizzle client
│   │   ├── schema.ts           # All 11 table definitions, relations, type exports (526 lines)
│   │   ├── queries.ts          # User/team auth queries (getUser, getTeamForUser, etc.)
│   │   ├── queries/            # Domain-specific queries
│   │   │   └── explorer.ts     # Explorer sidebar data loader
│   │   ├── schema/             # Extended schema types (v2 data model)
│   │   │   ├── index.ts        # Barrel exports
│   │   │   ├── v2-types.ts     # TypeScript interfaces for JSONB data models
│   │   │   └── v2-validators.ts # Zod validators for JSONB data models
│   │   ├── type-guards.ts      # Runtime type guards for JSONB parsing
│   │   ├── migrations/         # SQL migration files (8 migrations)
│   │   ├── seed.ts             # Database seeding script
│   │   └── setup.ts            # Database setup/init script
│   ├── auth/                   # Authentication
│   │   ├── session.ts          # JWT sign/verify (jose), password hash (bcryptjs), getSession, setSession
│   │   └── middleware.ts       # validatedAction, validatedActionWithUser, withTeam HOFs
│   ├── api/                    # API utilities
│   │   └── with-project-auth.ts # withProjectAuth HOF for route handlers (TypeScript overloads)
│   ├── mcp/                    # MCP Server
│   │   ├── server.ts           # JSON-RPC 2.0 request handler (initialize, ping, tools/list, tools/call)
│   │   ├── types.ts            # MCP protocol types + Zod schemas
│   │   ├── tool-registry.ts    # Tool registration and lookup
│   │   ├── auth.ts             # API key validation (bcrypt hash comparison)
│   │   ├── rate-limit.ts       # In-memory rate limiter (shared chat + MCP)
│   │   ├── skill-generator.ts  # SKILL.md export generator
│   │   ├── claude-md-generator.ts # CLAUDE.md export generator
│   │   └── tools/              # 17 MCP tool implementations
│   │       ├── index.ts        # Tool registration entry point
│   │       ├── core/           # 7 core read-only tools
│   │       │   ├── index.ts
│   │       │   ├── get-prd.ts
│   │       │   ├── get-tech-stack.ts
│   │       │   ├── get-user-stories.ts
│   │       │   ├── get-database-schema.ts
│   │       │   ├── get-project-architecture.ts
│   │       │   ├── get-coding-context.ts
│   │       │   └── get-diagrams.ts
│   │       ├── generators/     # 4 generator tools (invoke agents)
│   │       │   ├── index.ts
│   │       │   ├── get-api-specs.ts
│   │       │   ├── get-coding-guidelines.ts
│   │       │   ├── get-infrastructure.ts
│   │       │   └── update-story-status.ts
│   │       └── unique/         # 6 unique tools
│   │           ├── index.ts
│   │           ├── ask-question.ts
│   │           ├── get-cleo-tasks.ts
│   │           ├── get-gsd-phases.ts
│   │           ├── get-validation-status.ts
│   │           ├── invoke-agent.ts
│   │           └── search-context.ts
│   ├── config/                 # Configuration
│   │   └── env.ts              # Zod-validated environment variables (validates at import time)
│   ├── constants/              # Centralized constants
│   │   └── index.ts            # TIME, LLM, SCORING, RATE_LIMIT, VALIDATION, INFRASTRUCTURE_COSTS
│   ├── validation/             # PRD validation
│   │   ├── validator.ts        # PRD-SPEC validator (10 hard gates, 95% threshold)
│   │   ├── types.ts            # Validation types, enums, result interfaces
│   │   └── specs/              # Validation spec definitions
│   ├── diagrams/               # Mermaid diagram generation
│   │   ├── generators.ts       # All diagram generators (context, use case, class, sequence, activity)
│   │   └── beautiful-mermaid.ts # Mermaid rendering helper (beautiful-mermaid package)
│   ├── education/              # Educational content system
│   │   ├── knowledge-bank.ts   # 6 intake KB step definitions (thinking msgs, tooltips, validation)
│   │   ├── phase-mapping.ts    # ArtifactPhase -> KnowledgeBankStep mapping + education context retrieval
│   │   └── generator-kb.ts     # 6 generator KB prompt blocks (KB 07-12) for agent system prompts
│   ├── email/                  # Email templates (Resend)
│   │   ├── resend.ts           # Resend client configuration
│   │   ├── send-password-reset.ts # Password reset email
│   │   └── send-invitation.ts    # Team invitation email
│   ├── export/                 # Export utilities
│   │   └── markdown.ts         # Markdown export formatter
│   ├── hooks/                  # React hooks
│   │   ├── use-keyboard-shortcuts.ts # App-level keyboard shortcuts (Cmd+Shift+H, etc.)
│   │   └── use-media-query.ts       # Responsive media query hook
│   ├── payments/               # Stripe integration
│   │   ├── stripe.ts           # Stripe client configuration
│   │   └── actions.ts          # Payment-related actions
│   ├── types/                  # Shared TypeScript types
│   │   ├── api-specification.ts # API specification types
│   │   └── mcp.ts              # MCP-related types
│   ├── utils/                  # Utility functions
│   │   └── vision.ts           # stripVisionMetadata helper
│   └── utils.ts                # cn() classname utility (tailwind-merge + clsx)
├── tests/                      # E2E tests
│   └── e2e/                    # Playwright test specs
│       ├── fixtures/           # Test fixtures (auth state, custom test extension)
│       ├── helpers/            # Test helpers
│       ├── pages/              # Page object models
│       └── .auth/              # Saved auth state (generated)
├── supabase/                   # Supabase local dev config
│   ├── config.toml             # Supabase project configuration
│   ├── .branches/              # Local branch tracking
│   └── .temp/                  # Temporary files
├── scripts/                    # Utility scripts
│   └── check-lighthouse.js     # Lighthouse CI score checker
├── public/                     # Static assets
│   └── icons/                  # App icons (PWA)
├── middleware.ts                # Next.js middleware (auth + security headers)
├── next.config.ts              # Next.js config (serverExternalPackages for LangChain, turbopack root)
├── drizzle.config.ts           # Drizzle Kit config (schema, migrations, PostgreSQL)
├── tsconfig.json               # TypeScript config (strict, ESNext, @/* path alias)
├── jest.config.ts              # Jest config (ts-jest, moduleNameMapper for @/*)
├── playwright.config.ts        # Playwright config (chromium, webkit, mobile viewports)
├── package.json                # Dependencies (77 deps) and scripts (27 scripts)
├── components.json             # shadcn/ui component config
├── postcss.config.mjs          # PostCSS config (Tailwind CSS 4)
├── .nvmrc                      # Node.js version pin
├── .env.local                  # Environment variables (not committed)
├── .env.example                # Env var template
└── .gitignore                  # Git ignore rules
```

## Directory Purposes

**`app/`:**
- Purpose: Next.js App Router entry points. Pages, layouts, API routes, Server Actions.
- Contains: `.tsx` page files, `route.ts` API handlers, `actions.ts` server actions
- Key files: `layout.tsx` (root), `(dashboard)/layout.tsx` (auth shell), `(dashboard)/projects/[id]/layout.tsx` (project shell)

**`components/`:**
- Purpose: Reusable React components grouped by domain
- Contains: Client components (`.tsx`), barrel exports (`index.ts`), one config file (`nav-config.ts`)
- Key files: `project/project-chat-provider.tsx` (central state), `project/explorer-sidebar.tsx`, `project/chat-panel.tsx`

**`lib/`:**
- Purpose: All server-side and shared logic. Not a component directory.
- Contains: AI agents, database, auth, MCP server, validation, education content, utilities
- Key files: `langchain/config.ts` (LLM setup), `db/schema.ts` (all tables), `db/drizzle.ts` (connection), `config/env.ts` (env validation)

**`lib/langchain/agents/`:**
- Purpose: Individual AI agents, each responsible for generating one PRD section
- Contains: 9 agent files (one per output type) + intake sub-agents directory
- Key files: `extraction-agent.ts` (core data extraction), `intake/kb-question-generator.ts` (KB-aware questions)

**`lib/langchain/graphs/`:**
- Purpose: LangGraph state machine that orchestrates the intake conversation
- Contains: Graph definition, state types, node implementations, edge routing, checkpointer
- Key files: `intake-graph.ts` (graph assembly), `edges.ts` (routing logic), `nodes/` (6 node implementations)

**`lib/db/`:**
- Purpose: Database schema, connection, queries, migrations
- Contains: Drizzle ORM definitions, SQL migrations, query functions, type guards
- Key files: `schema.ts` (11 tables + relations + types), `drizzle.ts` (connection), `queries.ts` (auth queries)

**`lib/mcp/`:**
- Purpose: MCP server exposing project data to IDE integrations
- Contains: JSON-RPC server, tool registry, 17 tool implementations, auth, rate limiting, export generators
- Key files: `server.ts` (request handler), `tools/index.ts` (registration), `auth.ts` (API key validation)

**`lib/education/`:**
- Purpose: Educational content system for intake questions and generator prompts
- Contains: Knowledge bank definitions, phase mapping, generator KB prompt blocks
- Key files: `knowledge-bank.ts` (6 intake steps), `generator-kb.ts` (6 generator KBs), `phase-mapping.ts` (bridging)

## Key File Locations

**Entry Points:**
- `app/layout.tsx`: Root layout (providers, global config)
- `middleware.ts`: Request middleware (auth, security headers)
- `app/api/chat/projects/[projectId]/route.ts`: Chat API entry
- `app/api/mcp/[projectId]/route.ts`: MCP server entry

**Configuration:**
- `lib/config/env.ts`: Validated environment variables (POSTGRES_URL, AUTH_SECRET, ANTHROPIC_API_KEY, STRIPE_*, BASE_URL)
- `lib/langchain/config.ts`: LLM instance configuration (5 instances + factory)
- `lib/constants/index.ts`: Application constants (time, scoring, token, rate limit, validation)
- `next.config.ts`: Next.js config (serverExternalPackages for LangChain)
- `drizzle.config.ts`: Drizzle Kit migration config
- `tsconfig.json`: TypeScript config (`@/*` path alias resolving to `./*`)
- `components.json`: shadcn/ui component config

**Core Logic:**
- `lib/langchain/graphs/intake-graph.ts`: LangGraph state machine assembly
- `lib/langchain/graphs/edges.ts`: Graph routing decisions (4 conditional edge functions)
- `app/api/chat/projects/[projectId]/langgraph-handler.ts`: Chat -> LangGraph orchestration + post-intake generation
- `lib/langchain/quick-start/orchestrator.ts`: Quick Start pipeline (SSE)
- `lib/validation/validator.ts`: PRD-SPEC validation engine (10 hard gates)
- `lib/diagrams/generators.ts`: All Mermaid diagram generators

**Database:**
- `lib/db/schema.ts`: 11 tables (users, teams, teamMembers, activityLogs, invitations, passwordResetTokens, projects, projectData, artifacts, conversations, graphCheckpoints, userStories, apiKeys), relations, type exports
- `lib/db/drizzle.ts`: PostgreSQL connection pool (max 10, idle timeout 20s)
- `lib/db/queries.ts`: User/team auth queries
- `lib/db/queries/explorer.ts`: Explorer sidebar data loader
- `lib/db/schema/v2-types.ts`: JSONB data model interfaces (DatabaseSchemaModel, TechStackModel, etc.)
- `lib/db/schema/v2-validators.ts`: Zod validators for JSONB data
- `lib/db/migrations/`: 8 SQL migration files

**Testing:**
- `jest.config.ts`: Unit test config (ts-jest)
- `playwright.config.ts`: E2E test config (chromium, webkit, mobile)
- `tests/e2e/`: Playwright E2E test specs
- `lib/langchain/agents/__tests__/`: Agent unit tests
- `lib/langchain/graphs/__tests__/`: Graph unit tests (analyze-response, completion-detector, priority-scorer, state-manager, intake-graph)
- `lib/mcp/__tests__/`: MCP unit tests (auth, rate-limit, server)
- `lib/diagrams/__tests__/`: Diagram generator tests
- `app/api/projects/[id]/*/__tests__/`: API route unit tests (api-spec, guidelines, infrastructure, keys)

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
- `PascalCase` exports: React components (`ExplorerSidebar`, `ChatPanel`, `ProjectChatProvider`)
- `camelCase` exports: hooks (`useProjectChat`, `useMediaQuery`)
- File name matches primary export in kebab-case form

**Functions/Variables:**
- `camelCase`: Functions, variables, parameters
- `UPPER_SNAKE_CASE`: Constants (`CLAUDE_MODELS`, `LLM_DEFAULTS`, `TIME_CONSTANTS`)
- `PascalCase`: Types, interfaces, enums (`IntakeState`, `ProjectStatus`, `ArtifactPhase`)

## Where to Add New Code

**New Page (within project):**
- Create: `app/(dashboard)/projects/[id]/<section-name>/page.tsx`
- Add nav entry: `components/project/nav-config.ts` -> `getProjectNavItems()` array
- If it displays generated data, add a section component: `components/projects/sections/<section>-section.tsx`
- The page inherits the project layout automatically (3-column with chat panel)

**New API Route (project-scoped):**
- Create: `app/api/projects/[id]/<endpoint>/route.ts`
- Use `withProjectAuth` wrapper: `import { withProjectAuth } from '@/lib/api/with-project-auth'`
- Pattern: `export const GET = withProjectAuth(async (req, { user, team, projectId }) => { ... })`
- With project: `export const GET = withProjectAuth(async (req, { user, team, projectId, project }) => { ... }, { withProject: true })`

**New AI Agent:**
- Create: `lib/langchain/agents/<agent-name>.ts`
- Use `structuredLLM` or `createClaudeAgent(schema, name)` from `lib/langchain/config.ts`
- Define Zod schema for output in the agent file or `lib/langchain/schemas.ts`
- Add generator KB prompt block: `lib/education/generator-kb.ts` (export `get<Agent>Knowledge()`)
- Add API route trigger: `app/api/projects/[id]/<agent-name>/route.ts`
- If JSONB storage needed, add field to `project_data` table in `lib/db/schema.ts`

**New LangGraph Node:**
- Create: `lib/langchain/graphs/nodes/<node-name>.ts`
- Export function signature: `async function <nodeName>(state: IntakeState): Promise<Partial<IntakeState>>`
- Export from: `lib/langchain/graphs/nodes/index.ts`
- Add dynamic import placeholder in: `lib/langchain/graphs/intake-graph.ts`
- Add edge routing in: `lib/langchain/graphs/edges.ts`

**New React Component:**
- Domain component: `components/<domain>/<component-name>.tsx`
- UI primitive: `components/ui/<component-name>.tsx` (use shadcn CLI: `npx shadcn@latest add <name>`)
- Hook: `lib/hooks/use-<hook-name>.ts`
- Always add `'use client'` directive if the component uses useState, useEffect, or event handlers

**New Database Table:**
- Add table definition: `lib/db/schema.ts` (use `pgTable`, add indexes)
- Add relations: same file, below table
- Add types: same file, at bottom (`typeof table.$inferSelect`, `typeof table.$inferInsert`)
- Generate migration: `pnpm db:generate`
- Run migration: `pnpm db:migrate:sql` (preferred over `db:migrate` due to known api_keys conflict)

**New MCP Tool:**
- Determine category (core = read-only, generator = invokes agent, unique = special)
- Create: `lib/mcp/tools/<category>/<tool-name>.ts`
- Register in: `lib/mcp/tools/<category>/index.ts`
- Follow existing tool pattern: export `ToolDefinition` (name, description, inputSchema) + handler function

**New Server Action:**
- Add to: `app/actions/<domain>.ts` (if project-related) or `app/(login)/actions.ts` (if auth-related)
- Wrap with `validatedActionWithUser(zodSchema, handler)` from `lib/auth/middleware.ts`
- Mark file with `'use server'` directive at top

**New Constant:**
- Add to: `lib/constants/index.ts` in the appropriate section
- Use `as const` for object constants
- Export with descriptive JSDoc comment

**New Knowledge Bank:**
- Intake KB: Add entry to `lib/education/knowledge-bank.ts` (thinking messages, tooltips, validation errors)
- Generator KB: Add function to `lib/education/generator-kb.ts` returning prompt block string
- Update mapping: `lib/education/phase-mapping.ts` if new artifact phase added

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
- Purpose: Legacy migration planning docs and screenshots from v1 to v2
- Generated: No
- Committed: Reference material only

**`claudedocs/research-outputs/`:**
- Purpose: CLEO research subagent output files
- Generated: Yes (by CLEO agents)
- Committed: No

---

*Structure analysis: 2026-02-08*
