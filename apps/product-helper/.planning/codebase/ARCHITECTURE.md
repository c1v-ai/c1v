# Architecture

**Analysis Date:** 2025-01-25

## Pattern Overview

**Overall:** Next.js App Router with LangGraph State Machine

**Key Characteristics:**
- Server-first React with Next.js 15 App Router
- LangGraph-based multi-node AI workflow for conversational PRD intake
- Drizzle ORM with PostgreSQL for persistence
- Custom JWT-based session authentication
- SR-CORNELL validation methodology for PRD quality

## Layers

**Presentation Layer (app/):**
- Purpose: React components, page routing, layouts
- Location: `app/`
- Contains: Pages, layouts, route groups, API routes
- Depends on: Components, lib/, actions
- Used by: Users via browser

**API Layer (app/api/):**
- Purpose: REST endpoints, streaming chat, webhooks
- Location: `app/api/`
- Contains: Route handlers for chat, projects, stripe, user, team
- Depends on: lib/db, lib/langchain, lib/auth
- Used by: Frontend via fetch/SWR

**Actions Layer (app/actions/):**
- Purpose: Server Actions for form submissions and mutations
- Location: `app/actions/`
- Contains: `projects.ts`, `conversations.ts`
- Depends on: lib/db, lib/auth/middleware
- Used by: Forms, client components

**LangGraph AI Layer (lib/langchain/):**
- Purpose: Multi-node AI state machine for PRD intake
- Location: `lib/langchain/`
- Contains: Graphs, nodes, agents, prompts, schemas
- Depends on: @langchain/langgraph, @langchain/openai
- Used by: Chat API routes

**Data Layer (lib/db/):**
- Purpose: Database schema, queries, connections
- Location: `lib/db/`
- Contains: Drizzle schema, query functions, seed data
- Depends on: drizzle-orm, postgres
- Used by: All server-side code

**Validation Layer (lib/validation/):**
- Purpose: SR-CORNELL 10 hard-gate validation engine
- Location: `lib/validation/`
- Contains: Validator, types, hard gate checks
- Depends on: lib/db (for project data)
- Used by: API routes, UI components

**Auth Layer (lib/auth/):**
- Purpose: JWT session management, password hashing
- Location: `lib/auth/`
- Contains: session.ts, middleware.ts
- Depends on: jose, bcryptjs
- Used by: Middleware, API routes, actions

**Component Layer (components/):**
- Purpose: Reusable React components
- Location: `components/`
- Contains: UI primitives, chat, navigation, diagrams
- Depends on: Radix UI, lucide-react
- Used by: Pages, layouts

## Data Flow

**Chat Message Flow (LangGraph Mode):**

1. User sends message via `ChatInput` component
2. POST to `/api/chat/projects/[projectId]`
3. Auth check via `getUser()` and team verification
4. LangGraph `streamWithLangGraph()` or `processWithLangGraph()`
5. Intake graph nodes execute: analyze_response -> extract_data/compute_next_question -> generate_response
6. Streaming response returned to client
7. Project data updated in database

**Project CRUD Flow:**

1. User submits form (ProjectForm component)
2. Server Action invoked (`createProject`, `updateProject`, `deleteProject`)
3. Zod validation on input
4. `validatedActionWithUser` middleware checks auth
5. Drizzle ORM executes database operation
6. Activity logged to `activity_logs` table
7. Response returned, client updates

**Validation Flow:**

1. Trigger via `/api/projects/[id]/validate`
2. Load project with `projectData`, `artifacts`
3. Execute 10 hard gates (HG1-HG10) from SR-CORNELL spec
4. Aggregate scores, errors, warnings
5. Return `ValidationResult` with 95% threshold check
6. UI displays via `ValidationReport` component

**State Management:**
- Server state: SWR with fallback data prefetched in root layout
- LangGraph state: Checkpointed per-project via `graphCheckpoints` table
- Form state: React useState + Server Actions
- Theme state: next-themes with localStorage

## Key Abstractions

**IntakeState (LangGraph):**
- Purpose: Complete conversation state for PRD intake workflow
- Examples: `lib/langchain/graphs/types.ts`
- Pattern: Accumulated messages + project context + extraction results + control flags

**ExtractionResult:**
- Purpose: Structured PRD data extracted from conversation
- Examples: `lib/langchain/schemas.ts`
- Pattern: actors[], useCases[], systemBoundaries, dataEntities[]

**ValidationResult:**
- Purpose: SR-CORNELL validation output with scores and checks
- Examples: `lib/validation/types.ts`
- Pattern: hardGates[], artifacts[], consistencyChecks[], errors[], warnings[]

**Project/ProjectData:**
- Purpose: Database models for PRD projects
- Examples: `lib/db/schema.ts`
- Pattern: Project metadata + JSON blob for extracted/intake state

## Entry Points

**Root Layout (`app/layout.tsx`):**
- Location: `app/layout.tsx`
- Triggers: Every page load
- Responsibilities: Theme provider, SWR config with auth prefetch, toast notifications

**Dashboard Layout (`app/(dashboard)/layout.tsx`):**
- Location: `app/(dashboard)/layout.tsx`
- Triggers: Authenticated pages under /dashboard, /projects, /chat
- Responsibilities: Header, navigation, auth-aware UI, keyboard shortcuts

**Middleware (`middleware.ts`):**
- Location: `middleware.ts`
- Triggers: Every request (excluding api, _next, static)
- Responsibilities: Session validation, token refresh, redirect to /sign-in

**Project Chat API (`app/api/chat/projects/[projectId]/route.ts`):**
- Location: `app/api/chat/projects/[projectId]/route.ts`
- Triggers: POST from chat UI
- Responsibilities: Authenticate, load project, invoke LangGraph or legacy chain, stream response

**LangGraph Handler (`app/api/chat/projects/[projectId]/langgraph-handler.ts`):**
- Location: `app/api/chat/projects/[projectId]/langgraph-handler.ts`
- Triggers: When USE_LANGGRAPH=true
- Responsibilities: Initialize state, invoke intake graph, stream tokens, persist checkpoint

## Error Handling

**Strategy:** Try-catch with error responses, console logging, graceful fallbacks

**Patterns:**
- API routes return structured JSON errors with status codes
- Server Actions return `{ error: string }` or `{ success: string }`
- LangGraph nodes catch errors and return `{ error: string }` in state
- Middleware redirects on auth failures
- UI uses Sonner toasts for user-facing errors

## Cross-Cutting Concerns

**Logging:** Console.log/error with prefixes like `[IntakeGraph]`, `[API]`

**Validation:**
- Input: Zod schemas in actions and API routes
- PRD: SR-CORNELL 10 hard-gate validation engine
- LangGraph: Intent analysis with structured output schemas

**Authentication:**
- JWT in httpOnly cookie named `session`
- Middleware validates and refreshes on GET requests
- `getUser()` reads session, verifies token, checks user exists
- `getTeamForUser()` loads team membership for authorization

---

*Architecture analysis: 2025-01-25*
