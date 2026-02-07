# Architecture

**Analysis Date:** 2026-02-06

## Pattern Overview

**Overall:** Server-Side Rendered SPA with LangGraph AI Pipeline

**Key Characteristics:**
- Next.js 15 App Router with route groups for auth boundaries (`(login)` vs `(dashboard)`)
- LangGraph state machine drives the core conversational intake flow; separate specialist agents generate backend artifacts
- Server Actions (`app/actions/`) and API Route Handlers (`app/api/`) coexist; Server Actions handle mutations, API routes handle streaming/async AI operations
- React Context + SWR for client-side state; PostgreSQL + Drizzle ORM as the single source of truth
- Custom JWT auth (jose + bcryptjs) with middleware-based session refresh on every GET

## Layers

**Presentation Layer:**
- Purpose: Renders UI, manages client-side state, handles user interactions
- Location: `app/(dashboard)/`, `app/(login)/`, `components/`
- Contains: Next.js pages (RSC + client components), React Context providers, shadcn/ui primitives
- Depends on: Server Actions, API routes (via fetch/SWR), ProjectChatProvider context
- Used by: End users via browser

**API Layer:**
- Purpose: Handles HTTP requests, authentication, request validation, response formatting
- Location: `app/api/`
- Contains: Route handlers (26 endpoints), the `withProjectAuth` HOC for auth/authz
- Depends on: Database layer, LangChain agents, auth utilities
- Used by: Presentation layer (via fetch), MCP clients, external integrations

**Server Action Layer:**
- Purpose: Form-driven mutations with built-in validation and auth
- Location: `app/actions/projects.ts`, `app/actions/conversations.ts`, `app/(login)/actions.ts`
- Contains: Zod-validated actions wrapped with `validatedActionWithUser`
- Depends on: Database layer, auth middleware
- Used by: React Server Components and client forms

**AI/Agent Layer:**
- Purpose: LLM-powered data extraction, artifact generation, conversational intake
- Location: `lib/langchain/`
- Contains: LangGraph intake graph, 8 specialist agents, LLM configuration, Zod schemas
- Depends on: Anthropic Claude API, database layer for persistence
- Used by: API layer (chat route, generator routes, quick-start route)

**MCP Layer:**
- Purpose: Exposes project data to IDE integrations via JSON-RPC 2.0
- Location: `lib/mcp/`
- Contains: MCP server, tool registry (17 tools: 7 core + 4 generator + 6 unique), API key auth, rate limiting
- Depends on: Database layer, AI/Agent layer
- Used by: External IDE clients (Cursor, VS Code) via `app/api/mcp/[projectId]/route.ts`

**Database Layer:**
- Purpose: Data persistence, schema definition, query logic
- Location: `lib/db/`
- Contains: Drizzle ORM schema (`schema.ts`), connection pool (`drizzle.ts`), queries (`queries.ts`, `queries/explorer.ts`), migrations, type guards
- Depends on: PostgreSQL (Supabase-hosted)
- Used by: All server-side layers

**Auth Layer:**
- Purpose: User authentication, session management, route protection
- Location: `lib/auth/`, `middleware.ts`
- Contains: JWT sign/verify, password hashing, validated action wrappers, `withProjectAuth` HOC
- Depends on: Database layer (user lookup)
- Used by: API layer, Server Action layer, Next.js middleware

**Shared Utilities:**
- Purpose: Constants, validation, diagrams, education content, type definitions
- Location: `lib/constants/`, `lib/validation/`, `lib/diagrams/`, `lib/education/`, `lib/types/`, `lib/utils/`, `lib/config/`
- Contains: Centralized constants, PRD-SPEC validator, Mermaid diagram generators, Knowledge Bank definitions, env validation
- Depends on: Nothing (leaf dependencies)
- Used by: All layers

## Data Flow

**Conversational Intake (Primary Flow):**

1. User submits message via `ChatPanel` component -> `useChat` hook (Vercel AI SDK)
2. POST to `app/api/chat/projects/[projectId]/route.ts` with auth check
3. `langgraph-handler.ts` loads or creates `IntakeState` from checkpoint
4. LangGraph state machine processes through nodes: `analyze_response` -> `extract_data` -> `check_prd_spec` -> `generate_artifact` / `compute_next_question` -> `generate_response`
5. State checkpoint saved to `graph_checkpoints` table; conversation messages saved to `conversations` table
6. Extracted data written to `project_data` JSONB columns; artifacts to `artifacts` table
7. Response streamed back to client

**Generator Agent Flow (Post-Intake):**

1. User triggers generation via section page or Quick Start
2. POST to specialized API route (e.g., `app/api/projects/[id]/tech-stack/route.ts`)
3. Route loads project data from DB, constructs agent context
4. Specialist agent (e.g., `lib/langchain/agents/tech-stack-agent.ts`) invokes Claude with structured output
5. Result saved to `project_data` JSONB field (e.g., `techStack`)
6. Response returned to client

**Quick Start Pipeline:**

1. User provides single-sentence project description
2. POST to `app/api/projects/[id]/quick-start/route.ts` -> SSE streaming
3. `lib/langchain/quick-start/orchestrator.ts` runs pipeline:
   - Sequential: Synthesis agent expands description
   - Parallel: `Promise.allSettled()` runs extraction, tech-stack, user-stories, db-schema, api-spec agents
   - Sequential: Validation, artifact generation, database persistence
4. Progress updates streamed to client via SSE

**State Management:**
- **Server state:** PostgreSQL via Drizzle ORM (source of truth)
- **Client state:** SWR for data fetching/caching (`/api/user`, `/api/team`), React Context for project-scoped chat state (`ProjectChatProvider`)
- **AI state:** LangGraph checkpoints persisted in `graph_checkpoints` table, deserialized on each chat message
- **UI state:** React `useState` in layout components (sidebar collapse, diagram popups)

## Key Abstractions

**IntakeState (LangGraph State Machine):**
- Purpose: Represents the complete state of the conversational intake process
- Definition: `lib/langchain/graphs/types.ts`
- Graph: `lib/langchain/graphs/intake-graph.ts`
- Contains: messages, extractedData, currentPhase, artifactReadiness, generatedArtifacts, kbStepConfidence, completeness, turnCount
- Pattern: Annotation-based state with custom reducers (messages accumulate, generatedArtifacts deduplicate, scalars replace)

**withProjectAuth (API Middleware):**
- Purpose: DRY auth/authz wrapper for all project-scoped API routes
- Definition: `lib/api/with-project-auth.ts`
- Pattern: Higher-order function that returns a Next.js route handler
- Provides: `{ user, team, projectId }` (optionally `{ project }` with `withProject: true`)

**ExtractionResult (Structured Data Schema):**
- Purpose: Zod schema defining the structured PRD data extracted from conversations
- Definition: `lib/langchain/schemas.ts`
- Contains: actors, useCases, systemBoundaries, dataEntities, problemStatement, goalsMetrics
- Pattern: Zod schema used with `llm.withStructuredOutput()` for type-safe LLM extraction

**ProjectChatProvider (Client State):**
- Purpose: Provides chat and project state to all components within a project layout
- Definition: `components/project/project-chat-provider.tsx`
- Pattern: React Context wrapping `useChat` (Vercel AI SDK) + SWR + local state
- Contains: messages, input, projectData, artifacts, sidebar/panel collapse state

**ArtifactPhase (Pipeline Progression):**
- Purpose: Defines the 7 sequential phases of PRD artifact generation
- Definition: `lib/langchain/graphs/types.ts`
- Values: `context_diagram`, `use_case_diagram`, `scope_tree`, `ucbd`, `requirements_table`, `constants_table`, `sysml_activity_diagram`
- Pattern: Phase-gated generation with readiness thresholds per phase

## Entry Points

**Next.js App:**
- Location: `app/layout.tsx`
- Triggers: Browser navigation
- Responsibilities: Root layout, SWR provider, theme provider, service worker registration

**Dashboard Layout:**
- Location: `app/(dashboard)/layout.tsx`
- Triggers: Any authenticated route
- Responsibilities: Header, navigation, bottom nav, keyboard shortcuts

**Project Layout:**
- Location: `app/(dashboard)/projects/[id]/layout.tsx`
- Triggers: Any project-scoped route
- Responsibilities: Loads project + conversations from DB, wraps in `ProjectLayoutClient` -> `ProjectChatProvider`

**Chat API Route:**
- Location: `app/api/chat/projects/[projectId]/route.ts`
- Triggers: User sends chat message
- Responsibilities: Auth check, rate limiting, delegates to `langgraph-handler.ts`

**MCP Server Entry:**
- Location: `app/api/mcp/[projectId]/route.ts`
- Triggers: External IDE MCP client sends JSON-RPC request
- Responsibilities: API key auth, rate limiting, delegates to `lib/mcp/server.ts`

**Next.js Middleware:**
- Location: `middleware.ts`
- Triggers: Every non-API request (matcher excludes `/api`, `/_next/static`, etc.)
- Responsibilities: Protected route redirect, session refresh on GET, security headers (X-Frame-Options, CSP, etc.)

## Error Handling

**Strategy:** Try-catch with graceful degradation; errors logged to console, user-facing errors via toast notifications or JSON error responses

**Patterns:**
- **API routes:** Try-catch wrapping entire handler; `withProjectAuth` catches and returns 500 with generic error
- **LangGraph nodes:** Each node catches errors and sets `state.error`; `needsErrorRecovery()` and `getErrorRecoveryRoute()` handle routing on error
- **Server Actions:** Zod validation errors returned as `{ error: string }`; unhandled errors throw
- **Client:** `toast.error()` via Sonner for user-facing errors; SWR error states in components
- **LLM failures:** 30s timeout via `clientOptions.timeout`; LangGraph `shouldForceEnd()` kills after 50 turns

## Cross-Cutting Concerns

**Logging:** `console.log`/`console.error` with `[STATE_DEBUG]` and `[MCP]` prefixes for domain-specific tracing. No structured logging framework.

**Validation:**
- Input: Zod schemas in Server Actions (`lib/auth/middleware.ts`), API routes, and env config (`lib/config/env.ts`)
- PRD quality: `lib/validation/validator.ts` runs PRD-SPEC validation against extracted data
- LangGraph: Phase-specific thresholds in `lib/langchain/graphs/edges.ts` gate artifact generation

**Authentication:** Custom JWT via jose. Session cookie (`session`) set httpOnly, secure in prod, sameSite=lax. Middleware refreshes on every GET. `getUser()` in `lib/db/queries.ts` is the canonical auth check for server-side code.

**Rate Limiting:** In-memory rate limiter at `lib/mcp/rate-limit.ts`. MCP: 100 req/min. Chat: 20 req/min per user.

---

*Architecture analysis: 2026-02-06*
