# Codebase Structure

**Analysis Date:** 2025-01-25

## Directory Layout

```
product-helper/
├── app/                        # Next.js App Router pages and API
│   ├── (dashboard)/            # Authenticated route group
│   │   ├── layout.tsx          # Dashboard shell with nav
│   │   ├── page.tsx            # Redirects to /projects
│   │   ├── account/            # Account settings
│   │   ├── chat/               # Global chat page
│   │   ├── dashboard/          # Settings dashboard
│   │   │   ├── general/
│   │   │   ├── security/
│   │   │   └── activity/
│   │   ├── pricing/            # Pricing page
│   │   ├── projects/           # Projects CRUD
│   │   │   ├── new/
│   │   │   └── [id]/           # Project detail
│   │   │       ├── chat/       # Project chat
│   │   │       ├── data/       # Extracted data view
│   │   │       ├── diagrams/   # Generated diagrams
│   │   │       ├── edit/       # Edit project
│   │   │       └── settings/   # Project settings
│   │   └── test-chat/          # Dev chat testing
│   ├── (login)/                # Auth route group (unauthenticated)
│   │   ├── sign-in/
│   │   ├── sign-up/
│   │   ├── forgot-password/
│   │   ├── reset-password/
│   │   ├── login.tsx           # Shared login form
│   │   └── actions.ts          # Auth actions
│   ├── api/                    # API route handlers
│   │   ├── chat/               # Chat endpoints
│   │   │   ├── route.ts        # Generic chat
│   │   │   ├── test/           # Test endpoint
│   │   │   └── projects/[projectId]/
│   │   │       ├── route.ts    # Project chat streaming
│   │   │       ├── langgraph-handler.ts
│   │   │       └── save/       # Save conversation
│   │   ├── projects/           # Projects CRUD API
│   │   │   ├── route.ts        # List/create
│   │   │   └── [id]/
│   │   │       ├── route.ts    # Get/update/delete
│   │   │       ├── validate/   # PRD-SPEC validation
│   │   │       └── export/     # Export to markdown
│   │   ├── stripe/             # Payment webhooks
│   │   │   ├── checkout/
│   │   │   └── webhook/
│   │   ├── user/               # Current user endpoint
│   │   └── team/               # Team data endpoint
│   ├── actions/                # Server Actions
│   │   ├── projects.ts         # Project CRUD actions
│   │   └── conversations.ts    # Conversation actions
│   ├── offline/                # PWA offline page
│   ├── layout.tsx              # Root layout
│   └── not-found.tsx           # 404 page
├── components/                 # React components
│   ├── ui/                     # Radix-based primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── sheet.tsx
│   │   ├── tabs.tsx
│   │   └── ...
│   ├── chat/                   # Chat interface components
│   │   ├── chat-window.tsx
│   │   ├── chat-input.tsx
│   │   ├── chat-message-bubble.tsx
│   │   ├── artifacts-sidebar.tsx
│   │   ├── diagram-popup.tsx
│   │   ├── markdown-renderer.tsx
│   │   └── index.ts
│   ├── diagrams/               # Mermaid diagram rendering
│   │   └── diagram-viewer.tsx
│   ├── export/                 # Export functionality
│   │   └── export-button.tsx
│   ├── extracted-data/         # Data display components
│   │   └── data-display.tsx
│   ├── navigation/             # Nav components
│   │   ├── bottom-nav.tsx
│   │   └── mobile-menu.tsx
│   ├── projects/               # Project-related components
│   │   ├── project-card.tsx
│   │   └── project-form.tsx
│   ├── theme/                  # Theme switching
│   │   ├── theme-provider.tsx
│   │   └── mode-toggle.tsx
│   ├── validation/             # Validation UI
│   │   └── validation-report.tsx
│   └── sw-register.tsx         # Service worker registration
├── lib/                        # Core library code
│   ├── auth/                   # Authentication
│   │   ├── session.ts          # JWT sign/verify, cookies
│   │   └── middleware.ts       # validatedAction helpers
│   ├── config/                 # Configuration
│   │   └── env.ts              # Environment variables
│   ├── db/                     # Database layer
│   │   ├── drizzle.ts          # DB client instance
│   │   ├── schema.ts           # Full Drizzle schema
│   │   ├── queries.ts          # Query helpers
│   │   ├── type-guards.ts      # Type guards for JSON
│   │   ├── seed.ts             # Seed data script
│   │   └── setup.ts            # DB setup script
│   ├── diagrams/               # Diagram generation
│   │   ├── generators.ts       # Mermaid generators
│   │   └── __tests__/
│   ├── email/                  # Email sending
│   │   ├── resend.ts           # Resend client
│   │   ├── send-password-reset.ts
│   │   └── templates/
│   │       └── password-reset.tsx
│   ├── export/                 # Export utilities
│   │   └── markdown.ts         # PRD to markdown
│   ├── hooks/                  # React hooks
│   │   ├── use-media-query.ts
│   │   └── use-keyboard-shortcuts.ts
│   ├── langchain/              # LangGraph AI system
│   │   ├── config.ts           # LLM configuration
│   │   ├── prompts.ts          # Prompt templates
│   │   ├── schemas.ts          # Extraction schemas
│   │   ├── utils.ts            # Utility functions
│   │   ├── agents/             # Agent implementations
│   │   │   ├── extraction-agent.ts
│   │   │   └── intake/         # Intake subsystem
│   │   │       ├── index.ts
│   │   │       ├── state.ts
│   │   │       ├── state-manager.ts
│   │   │       ├── questions.ts
│   │   │       ├── question-bank.ts
│   │   │       ├── priority-scorer.ts
│   │   │       ├── clarification-detector.ts
│   │   │       └── completion-detector.ts
│   │   ├── graphs/             # LangGraph state machine
│   │   │   ├── index.ts        # Graph exports
│   │   │   ├── intake-graph.ts # Main graph builder
│   │   │   ├── types.ts        # IntakeState, etc.
│   │   │   ├── channels.ts     # State channel configs
│   │   │   ├── edges.ts        # Routing logic
│   │   │   ├── checkpointer.ts # State persistence
│   │   │   ├── utils.ts        # Graph utilities
│   │   │   ├── nodes/          # Individual graph nodes
│   │   │   │   ├── index.ts
│   │   │   │   ├── analyze-response.ts
│   │   │   │   ├── extract-data.ts
│   │   │   │   ├── compute-next-question.ts
│   │   │   │   ├── check-prd-spec.ts
│   │   │   │   ├── generate-artifact.ts
│   │   │   │   └── generate-response.ts
│   │   │   └── __tests__/
│   │   └── __tests__/
│   ├── payments/               # Stripe integration
│   │   ├── stripe.ts           # Stripe client
│   │   └── actions.ts          # Payment actions
│   ├── validation/             # PRD-SPEC validation
│   │   ├── types.ts            # HardGate enums, types
│   │   └── validator.ts        # 10 hard-gate checks
│   └── utils.ts                # General utilities (cn)
├── hooks/                      # Shared hooks (duplicate)
│   └── use-media-query.ts
├── tests/                      # E2E tests
│   └── e2e/
├── public/                     # Static assets
├── docs/                       # Documentation
├── .planning/                  # GSD planning files
│   └── codebase/               # Codebase analysis docs
├── middleware.ts               # Next.js middleware
├── drizzle.config.ts           # Drizzle CLI config
├── jest.config.ts              # Jest config
├── tailwind.config.ts          # Tailwind config (v4)
├── next.config.ts              # Next.js config
├── tsconfig.json               # TypeScript config
└── package.json                # Dependencies
```

## Directory Purposes

**app/(dashboard)/:**
- Purpose: All authenticated user-facing pages
- Contains: Projects, chat, settings, pricing
- Key files: `layout.tsx` (dashboard shell with header/nav)

**app/(login)/:**
- Purpose: Authentication flows (unauthenticated)
- Contains: Sign-in, sign-up, password reset
- Key files: `actions.ts` (signIn, signUp, signOut)

**app/api/:**
- Purpose: REST API endpoints
- Contains: Chat streaming, CRUD, webhooks
- Key files: `chat/projects/[projectId]/route.ts`, `projects/route.ts`

**lib/langchain/:**
- Purpose: LangGraph-based AI orchestration
- Contains: State machine, nodes, prompts, agents
- Key files: `graphs/intake-graph.ts`, `graphs/types.ts`, `config.ts`

**lib/langchain/graphs/nodes/:**
- Purpose: Individual LangGraph node implementations
- Contains: analyze-response, extract-data, generate-response, etc.
- Key files: `analyze-response.ts`, `extract-data.ts`

**lib/db/:**
- Purpose: Database access layer
- Contains: Schema definitions, query helpers, migrations
- Key files: `schema.ts`, `queries.ts`, `drizzle.ts`

**lib/validation/:**
- Purpose: PRD-SPEC PRD validation engine
- Contains: 10 hard-gate validators
- Key files: `validator.ts`, `types.ts`

**components/ui/:**
- Purpose: Radix-based UI primitives
- Contains: Button, Card, Dialog, etc.
- Key files: `button.tsx`, `card.tsx`, `dialog.tsx`

**components/chat/:**
- Purpose: Chat interface components
- Contains: Message bubbles, input, sidebar
- Key files: `chat-window.tsx`, `chat-input.tsx`

## Key File Locations

**Entry Points:**
- `app/layout.tsx`: Root layout with theme, SWR, toasts
- `app/(dashboard)/layout.tsx`: Dashboard shell with auth-aware nav
- `middleware.ts`: Session validation on protected routes

**Configuration:**
- `drizzle.config.ts`: Database migration config
- `next.config.ts`: Next.js configuration
- `tailwind.config.ts`: Tailwind v4 configuration
- `jest.config.ts`: Jest test runner config

**Core Logic:**
- `lib/langchain/graphs/intake-graph.ts`: Main LangGraph builder
- `lib/langchain/graphs/types.ts`: IntakeState definition
- `lib/db/schema.ts`: All Drizzle table definitions
- `lib/validation/validator.ts`: PRD-SPEC validation

**Testing:**
- `tests/e2e/`: Playwright E2E tests
- `lib/langchain/**/__tests__/`: Unit tests for LangGraph
- `lib/diagrams/__tests__/`: Diagram generator tests

## Naming Conventions

**Files:**
- React components: `kebab-case.tsx` (e.g., `chat-input.tsx`)
- Utility modules: `kebab-case.ts` (e.g., `use-media-query.ts`)
- Route files: `route.ts`, `page.tsx`, `layout.tsx`
- Test files: `*.test.ts` in `__tests__/` directories

**Directories:**
- Route groups: `(groupname)` (e.g., `(dashboard)`, `(login)`)
- Dynamic routes: `[param]` (e.g., `[id]`, `[projectId]`)
- Feature folders: `lowercase-kebab` (e.g., `extracted-data`)

## Where to Add New Code

**New Feature:**
- Primary code: `lib/{feature-name}/`
- UI components: `components/{feature-name}/`
- API routes: `app/api/{feature-name}/route.ts`
- Tests: `lib/{feature-name}/__tests__/`

**New Page:**
- Route: `app/(dashboard)/{page-name}/page.tsx`
- Layout: `app/(dashboard)/{page-name}/layout.tsx` (if needed)

**New LangGraph Node:**
- Implementation: `lib/langchain/graphs/nodes/{node-name}.ts`
- Export: Add to `lib/langchain/graphs/nodes/index.ts`
- Wire in graph: Update `lib/langchain/graphs/intake-graph.ts`
- Tests: `lib/langchain/graphs/__tests__/{node-name}.test.ts`

**New Component:**
- UI primitive: `components/ui/{component}.tsx`
- Feature component: `components/{feature}/{component}.tsx`

**New API Route:**
- Handler: `app/api/{resource}/route.ts`
- With dynamic param: `app/api/{resource}/[id]/route.ts`

**Utilities:**
- Shared helpers: `lib/utils.ts` or `lib/{domain}/utils.ts`
- React hooks: `lib/hooks/use-{name}.ts`

## Special Directories

**.planning/:**
- Purpose: GSD workflow planning files
- Generated: Manually created
- Committed: Yes

**node_modules/:**
- Purpose: npm dependencies
- Generated: Yes (pnpm install)
- Committed: No

**.next/:**
- Purpose: Next.js build output
- Generated: Yes (next build)
- Committed: No

**.cleo/:**
- Purpose: CLEO task management state
- Generated: Yes (cleo commands)
- Committed: Varies by project

**tests/e2e/:**
- Purpose: Playwright end-to-end tests
- Generated: No
- Committed: Yes

---

*Structure analysis: 2025-01-25*
