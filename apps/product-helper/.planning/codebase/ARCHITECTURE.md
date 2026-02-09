# Architecture

**Analysis Date:** 2026-02-08

## Pattern Overview

**Overall:** Server-rendered Next.js 15 monolith with LangGraph-powered AI agent pipeline

**Key Characteristics:**
- Next.js 15 App Router with RSC (React Server Components) for data loading and route groups for auth boundaries
- LangGraph state machine drives the core conversational intake flow; 8 separate specialist agents generate backend artifacts
- Server Actions (`app/actions/`) and API Route Handlers (`app/api/`) coexist; Server Actions handle mutations, API routes handle streaming/async AI operations
- Feature-flagged dual mode: LangGraph (primary, `USE_LANGGRAPH=true`) vs legacy prompt chain
- React Context + SWR for client state; PostgreSQL + Drizzle ORM as single source of truth
- Custom JWT auth (jose + bcryptjs) with middleware-based session refresh on every GET
- MCP JSON-RPC 2.0 server exposes project data to external IDE tools
- Educational Knowledge Bank system enriches both intake questions and generator agent prompts

## Layers

**Presentation Layer:**
- Purpose: Renders UI, manages client-side state, handles user interactions
- Location: `app/(dashboard)/`, `app/(login)/`, `components/`
- Contains: Next.js pages (RSC + client components), React Context providers, shadcn/ui primitives
- Depends on: Server Actions, API routes (via fetch/SWR), `ProjectChatProvider` context
- Used by: End users via browser

**API Layer:**
- Purpose: Handles HTTP requests, authentication, request validation, response formatting
- Location: `app/api/`
- Contains: Route handlers (26+ endpoints), the `withProjectAuth` HOF for auth/authz
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
- Contains: LangGraph intake graph, 8 specialist agents, Quick Start orchestrator, LLM configuration, Zod schemas
- Depends on: Anthropic Claude API (Sonnet 4 primary, Haiku 3.5 for cheap tasks), database for persistence
- Used by: API layer (chat route, generator routes, quick-start route)

**MCP Layer:**
- Purpose: Exposes project data to IDE integrations via JSON-RPC 2.0
- Location: `lib/mcp/`
- Contains: MCP server, tool registry (17 tools: 7 core + 4 generator + 6 unique), API key auth, rate limiting, SKILL.md/CLAUDE.md export generators
- Depends on: Database layer, AI/Agent layer
- Used by: External IDE clients (Cursor, Claude Code) via `app/api/mcp/[projectId]/route.ts`

**Database Layer:**
- Purpose: Data persistence, schema definition, query logic
- Location: `lib/db/`
- Contains: Drizzle ORM schema (11 tables), connection pool (`drizzle.ts`), queries (`queries.ts`, `queries/explorer.ts`), migrations, type guards
- Depends on: PostgreSQL (Supabase-hosted, postgres.js driver, max 10 connections)
- Used by: All server-side layers

**Auth Layer:**
- Purpose: User authentication, session management, route protection
- Location: `lib/auth/`, `middleware.ts`
- Contains: JWT sign/verify (HS256), password hashing (bcryptjs, 10 rounds), validated action wrappers, `withProjectAuth` HOF
- Depends on: Database layer (user lookup), jose library
- Used by: API layer, Server Action layer, Next.js middleware

**Education Layer:**
- Purpose: Knowledge Bank content for intake questions and generator agent prompt enrichment
- Location: `lib/education/`
- Contains: 6 intake KB steps (context-diagram through sysml-activity-diagram), 6 generator KBs (KB 07-12)
- Depends on: Nothing (static content)
- Used by: Intake graph nodes (question generation), generator agents (prompt blocks)

**Shared Utilities:**
- Purpose: Constants, validation, diagrams, type definitions
- Location: `lib/constants/`, `lib/validation/`, `lib/diagrams/`, `lib/types/`, `lib/utils/`, `lib/config/`
- Contains: Centralized constants, PRD-SPEC validator (10 hard gates), Mermaid diagram generators, env validation
- Depends on: Nothing (leaf dependencies)
- Used by: All layers

## Data Flow

**Conversational Intake Flow (Primary):**

1. User submits message via `ChatPanel` component -> `useChat` hook (Vercel AI SDK)
2. POST to `app/api/chat/projects/[projectId]/route.ts` with auth + rate limit check
3. Feature flag `USE_LANGGRAPH=true` routes to `langgraph-handler.ts`
4. Handler loads checkpoint from `graph_checkpoints` table (or creates initial state)
5. Early exit check: if all 6 core KB artifacts already generated, returns completion message
6. User message added to state as `HumanMessage`, saved to `conversations` table
7. LangGraph state machine invoked with state (recursion limit: 20):
   - `analyze_response` -> detects user intent (PROVIDE_INFO, STOP_TRIGGER, CONFIRM, DENY, etc.)
   - Routes to `extract_data` (info provided) or `compute_next_question` (need more data)
   - `extract_data` -> extracts structured PRD data via Claude structured output
   - `check_prd_spec` -> validates against PRD-SPEC readiness thresholds
   - `generate_artifact` -> generates Mermaid diagram if threshold met
   - `compute_next_question` -> selects next KB-aware question
   - `generate_response` -> produces conversational AI reply
8. Response streamed to client via `ReadableStream` with `<!--status:{"node":"...","phase":"..."}-->` markers
9. Post-stream: saves AI message to `conversations`, checkpoint to `graph_checkpoints`
10. Updates `project_data` JSONB columns with extracted information
11. If 4+ artifacts generated -> triggers `triggerPostIntakeGeneration()`

**Post-Intake Generation Flow:**

1. Triggered automatically from `langgraph-handler.ts` when intake has 4+ core artifacts
2. Checks if tech stack already exists (idempotency guard)
3. Builds enriched context from ALL extracted data (actors, use cases, boundaries, NFRs, goals, problem statement)
4. Derives data entities from actors, use cases, and boundaries if none extracted
5. Phase 1 (parallel via `Promise.allSettled`): runs 5 generators simultaneously:
   - `recommendTechStack()` from `lib/langchain/agents/tech-stack-agent.ts`
   - `generateUserStories()` from `lib/langchain/agents/user-stories-agent.ts`
   - `extractDatabaseSchema()` from `lib/langchain/agents/schema-extraction-agent.ts`
   - `generateAPISpecification()` from `lib/langchain/agents/api-spec-agent.ts`
   - `generateInfrastructureSpec()` from `lib/langchain/agents/infrastructure-agent.ts`
6. Phase 2 (sequential): `generateCodingGuidelines()` (depends on tech stack result)
7. Results persisted: JSONB columns in `project_data`, user stories in `user_stories` table
8. Project status updated to `in_progress`
9. Generation summary appended as chat message

**Quick Start Pipeline Flow:**

1. User submits single-sentence description via `POST /api/projects/[id]/quick-start`
2. Route uses `withProjectAuth` wrapper, sets `maxDuration = 120` for Vercel
3. `lib/langchain/quick-start/orchestrator.ts` runs pipeline with SSE progress callbacks:
   - Sequential: `synthesizeProjectContext()` expands user input via synthesis agent
   - Parallel: extraction, tech stack, user stories, DB schema, API spec agents
   - Validation: PRD-SPEC validation
   - Artifacts: Mermaid diagram generation for ready phases
   - Persistence: saves everything to database
4. Progress events streamed to client as SSE: `data: {"step":"synthesis","status":"running","message":"..."}`

**Generator Agent Invocation (Manual):**

1. User visits section page or triggers generation from Generate page
2. POST to specialized API route (e.g., `app/api/projects/[id]/tech-stack/route.ts`)
3. Route loads project data from DB, constructs typed agent context
4. Agent invokes Claude with structured output (Zod schema validation)
5. Generator KB prompt block injected via `lib/education/generator-kb.ts` functions
6. Result saved to `project_data` JSONB field
7. Response returned to client

**State Management:**
- **Server state:** PostgreSQL via Drizzle ORM (source of truth for all data)
- **Client state:** SWR for data fetching/caching (`/api/user`, `/api/team` prefetched in root layout), React Context for project-scoped state
- **AI state:** LangGraph checkpoints serialized as JSONB in `graph_checkpoints` table, deserialized on each chat message
- **UI state:** React `useState` in layout components (sidebar collapse, panel collapse, diagram popups)
- **Chat state:** `ProjectChatProvider` wraps `useChat` (Vercel AI SDK) + SWR project data polling + local notification messages

## Key Abstractions

**IntakeState (LangGraph State Machine):**
- Purpose: Represents the complete state of the conversational intake process
- Definition: `lib/langchain/graphs/types.ts` (types), `lib/langchain/graphs/intake-graph.ts` (Annotation)
- Contains: messages, extractedData, currentPhase, artifactReadiness, generatedArtifacts, currentKBStep, kbStepConfidence, stepCompletionStatus, guessHistory, completeness, turnCount
- Pattern: LangGraph `Annotation.Root` with custom reducers (messages accumulate via `messagesStateReducer`, generatedArtifacts deduplicate, kbStepData merges, scalars replace)

**withProjectAuth (API Middleware):**
- Purpose: DRY auth/authz wrapper for all project-scoped API routes
- Definition: `lib/api/with-project-auth.ts`
- Pattern: Higher-order function with TypeScript overloads returning Next.js route handler
- Provides: `AuthContext { user, team, projectId }` or `AuthContextWithProject { user, team, projectId, project }` with `withProject: true`
- Handles: 401 Unauthorized, 404 Team/Project not found, 400 Invalid ID, 500 Internal error

**ExtractionResult (Structured Data Schema):**
- Purpose: Zod schema defining all structured PRD data extracted from conversations
- Definition: `lib/langchain/schemas.ts`
- Contains: actors, useCases, systemBoundaries, dataEntities, problemStatement, goalsMetrics, nonFunctionalRequirements
- Pattern: Zod schema used with `llm.withStructuredOutput()` for type-safe LLM extraction

**ProjectChatProvider (Client State):**
- Purpose: Provides chat and project state to all components within a project layout
- Definition: `components/project/project-chat-provider.tsx`
- Pattern: React Context wrapping `useChat` (Vercel AI SDK) + SWR + local state
- Contains: messages, input, isLoading, parsedProjectData, parsedArtifacts, selectedDiagram, explorerCollapsed, chatPanelCollapsed, currentNode (LangGraph stream marker), generationStartedAt

**ArtifactPhase (Pipeline Progression):**
- Purpose: Defines the 7 sequential phases of PRD artifact generation
- Definition: `lib/langchain/graphs/types.ts`
- Values: `context_diagram`, `use_case_diagram`, `scope_tree`, `ucbd`, `requirements_table`, `constants_table`, `sysml_activity_diagram`
- Pattern: Phase-gated generation with readiness thresholds per phase; `ARTIFACT_PHASE_SEQUENCE` array for iteration

**Knowledge Bank System:**
- Purpose: Educational content enriching both intake and generation
- Intake KBs: `lib/education/knowledge-bank.ts` - 6 KnowledgeBankStep entries with thinking messages, tooltip terms, validation errors
- Generator KBs: `lib/education/generator-kb.ts` - 6 prompt blocks (KB 07-12) injected into generator agent system prompts
- Phase mapping: `lib/education/phase-mapping.ts` - bridges `ArtifactPhase` to `KnowledgeBankStep`

**LLM Configuration Hierarchy:**
- Definition: `lib/langchain/config.ts`
- `llm`: Claude Sonnet 4, temp 0.7, 2000 tokens - conversational intake
- `streamingLLM`: Same as `llm` with streaming enabled
- `extractionLLM`: Claude Sonnet 4, temp 0.2, 4000 tokens - deterministic extraction
- `structuredLLM`: Claude Sonnet 4, temp 0.2, 4000 tokens - structured agent output
- `cheapLLM`: Claude Haiku 3.5, temp 0.7, 1000 tokens - classification, validation
- `createClaudeAgent(schema, name)`: Factory for structured output agents

## Entry Points

**Root Layout:**
- Location: `app/layout.tsx`
- Triggers: Every page load
- Responsibilities: SWR provider with server-side user/team prefetch (`getUser()`, `getTeamForUser()` as fallbacks), ThemeProvider (next-themes), Toaster (sonner), PWA service worker registration

**Dashboard Layout:**
- Location: `app/(dashboard)/layout.tsx`
- Triggers: Any authenticated route
- Responsibilities: Header with desktop nav + mobile menu, user avatar dropdown, ModeToggle, BottomNav (mobile), keyboard shortcuts listener

**Project Layout:**
- Location: `app/(dashboard)/projects/[id]/layout.tsx`
- Triggers: Any project-scoped route
- Responsibilities: Loads project + conversations from DB (RSC with Suspense), validates project exists, wraps in `ProjectLayoutClient` -> `ProjectChatProvider`

**Project Layout Client:**
- Location: `app/(dashboard)/projects/[id]/project-layout-client.tsx`
- Triggers: Client-side rendering within project
- Responsibilities: 3-column layout (ExplorerSidebar | main content | ChatPanel), mobile bottom sheets for explorer and chat, DiagramPopup overlay

**Chat API Route:**
- Location: `app/api/chat/projects/[projectId]/route.ts`
- Triggers: User sends chat message
- Responsibilities: Auth check, team validation, rate limiting (100 req/min), delegates to `langgraph-handler.ts` or legacy chain based on `USE_LANGGRAPH` flag

**MCP Server Entry:**
- Location: `app/api/mcp/[projectId]/route.ts`
- Triggers: External IDE MCP client sends JSON-RPC request
- Responsibilities: API key auth, rate limiting, delegates to `lib/mcp/server.ts`

**Next.js Middleware:**
- Location: `middleware.ts`
- Triggers: Every non-API/non-static request (matcher: `/((?!api|_next/static|_next/image|favicon.ico).*)`)
- Responsibilities: Protected route redirect (`/dashboard`, `/projects`, `/home`, `/account`), session cookie refresh on GET, security headers (X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy, Permissions-Policy, X-XSS-Protection)

## Error Handling

**Strategy:** Try-catch with graceful degradation; errors logged to console, user-facing errors via toast or JSON responses

**Patterns:**
- **API routes:** Try-catch wrapping entire handler; `withProjectAuth` catches and returns JSON 500
- **LangGraph handler:** Catches all errors, returns error as chat message (never crashes the chat); creates fresh initial state on unrecoverable errors
- **LangGraph nodes:** Each node catches errors and sets `state.error`; `needsErrorRecovery()` and `getErrorRecoveryRoute()` handle routing on error
- **Post-intake generation:** `Promise.allSettled` ensures partial failures don't block other generators; errors logged, successful results still persisted
- **Server Actions:** Zod validation errors returned as `{ error: string }`; unhandled errors throw
- **Client:** `toast.error()` via Sonner for user-facing errors; SWR handles retry/error states
- **LLM failures:** 30s timeout via `clientOptions.timeout`; LangGraph `shouldForceEnd()` prevents loops after excessive turns
- **Environment:** Zod validation at import time (`lib/config/env.ts`) prevents app startup with missing/invalid config

## Cross-Cutting Concerns

**Logging:** `console.log`/`console.error` with tagged prefixes: `[STATE_DEBUG]`, `[POST_INTAKE]`, `[LangGraph Handler]`, `[LangGraph Diagrams]`, `[MCP]`, `[STREAM]`. No structured logging framework.

**Validation:**
- Environment: Zod schema validation at startup (`lib/config/env.ts`)
- API input: Zod schemas in `withProjectAuth`, Server Actions (`validatedActionWithUser`), route handlers
- LLM output: Zod schemas via `llm.withStructuredOutput()` for all agent responses
- PRD quality: `lib/validation/validator.ts` - 10 hard gates from PRD-SPEC-PRD-95-V1, 95% threshold
- Phase gating: `lib/langchain/graphs/edges.ts` - readiness thresholds per artifact phase
- Database: Drizzle ORM schema constraints + v2 Zod validators (`lib/db/schema/v2-validators.ts`)

**Authentication:** Custom JWT via jose (HS256). Session cookie (`session`) set httpOnly, secure in prod, sameSite=lax, 24h expiry. Middleware refreshes session on every GET request. `getUser()` in `lib/db/queries.ts` is the canonical auth check for all server-side code.

**Authorization:** Team-based ownership model. All project queries include `eq(projects.teamId, team.id)` filter. `withProjectAuth` HOF enforces this consistently across all project API routes.

**Rate Limiting:** In-memory rate limiter at `lib/mcp/rate-limit.ts`. Shared between MCP (100 req/min) and Chat (keyed per user). Cleanup interval: 5 minutes.

---

*Architecture analysis: 2026-02-08*
