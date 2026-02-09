# Coding Conventions

**Analysis Date:** 2026-02-08

## Naming Patterns

**Files:**
- Components: kebab-case (`chat-window.tsx`, `chat-message-bubble.tsx`, `thinking-state.tsx`)
- Library modules: kebab-case (`with-project-auth.ts`, `rate-limit.ts`, `knowledge-bank.ts`, `generator-kb.ts`)
- Schema files: kebab-case with prefix (`v2-validators.ts`, `v2-types.ts`)
- Utility modules: kebab-case (`vision.ts`, `use-media-query.ts`)
- Test files: `*.test.ts` inside co-located `__tests__/` directories
- E2E page objects: `*.page.ts` (`sign-in.page.ts`, `projects.page.ts`)
- E2E specs: `*.spec.ts` (`smoke.spec.ts`, `auth.spec.ts`)

**Functions:**
- camelCase for all functions: `getUser()`, `recommendTechStack()`, `validateProject()`
- Async functions use descriptive verbs: `generateUserStories()`, `calculateCompleteness()`, `mergeExtractionData()`
- Boolean functions use `is`/`has`/`should` prefix: `isValidKeyFormat()`, `hasRequiredCategories()`, `shouldForceEnd()`
- Handler functions: `handler` for MCP tools, named exports `GET`/`POST`/`PUT`/`DELETE` for API routes
- String processing utilities: `stripVisionMetadata()` in `lib/utils/vision.ts`

**Variables:**
- camelCase for local variables and parameters
- UPPER_SNAKE_CASE for module-level constants: `STOP_TRIGGER_KEYWORDS`, `ARTIFACT_PHASE_SEQUENCE`, `VALIDATION_THRESHOLD`
- Constants objects use UPPER_SNAKE_CASE names with nested UPPER_SNAKE_CASE keys: `LLM_DEFAULTS.TIMEOUT_MS`, `TIME_CONSTANTS.ONE_DAY_MS`

**Types:**
- PascalCase for types and interfaces: `IntakeState`, `TechStackContext`, `AuthContext`
- Prefix `New` for Drizzle insert types: `NewUser`, `NewProject`, `NewArtifact`
- Suffix `Props` for component props: `ChatMessagesProps`, `ThinkingStateProps`, `ChatLayoutProps`
- Suffix `Result` for return types: `ExtractionResult`, `CompletionResult`, `ValidationResult`
- Suffix `Entry` for knowledge bank types: `KnowledgeBankEntry`
- Enums use PascalCase with UPPER_SNAKE_CASE members: `ActivityType.SIGN_UP`, `ProjectStatus.INTAKE`

**Database:**
- Table names: snake_case plural (`users`, `team_members`, `project_data`)
- Column names: snake_case (`created_at`, `team_id`, `password_hash`)
- Drizzle variable names: camelCase matching table name (`teamMembers`, `projectData`, `graphCheckpoints`)

## Code Style

**Formatting:**
- No ESLint or Prettier config -- relies on editor defaults and TypeScript strict mode
- 2-space indentation throughout
- Single quotes for strings in TypeScript files
- Double quotes in JSX attributes (standard React convention)
- Trailing commas in multi-line structures
- Semicolons at end of statements

**TypeScript:**
- `strict: true` in `tsconfig.json`
- `@ts-expect-error` used sparingly with comments explaining why (see `lib/langchain/config.ts`)
- Prefer `type` imports: `import type { Config } from 'jest'`
- `as const` assertions on constant arrays and objects for literal types
- Zod schemas for runtime validation; infer TypeScript types from them: `z.infer<typeof envSchema>`

**Linting:**
- No dedicated linter config file
- TypeScript strict mode serves as the primary quality gate
- `noEmit: true` -- type checking only, no compilation output

## Import Organization

**Order:**
1. React/Next.js framework imports (`import React from 'react'`, `import { NextResponse } from 'next/server'`)
2. Third-party libraries (`import { z } from 'zod'`, `import { ChatAnthropic } from '@langchain/anthropic'`)
3. Internal `@/` path alias imports (`import { db } from '@/lib/db/drizzle'`)
4. Relative imports (`import { handler } from '../get-prd'`)

**Path Aliases:**
- `@/*` maps to project root: `@/lib/utils`, `@/components/ui/button`, `@/lib/db/schema`
- Always use `@/` alias for cross-directory imports; use relative paths only within the same module subtree

**Patterns:**
- Group type-only imports with `import type`: `import type { TechStackModel } from '../../db/schema/v2-types'`
- Barrel exports via `index.ts` files in tool directories: `lib/mcp/tools/core/index.ts`, `lib/mcp/tools/generators/index.ts`

## Error Handling

**API Routes:**
- Wrap handler body in `try/catch`
- Return `NextResponse.json({ error: 'message' }, { status: code })` for all errors
- Use HTTP status codes consistently: 400 (validation), 401 (auth), 404 (not found), 500 (server)
- Log errors with `console.error('Context description:', error)`
- Use the `withProjectAuth` HOF from `lib/api/with-project-auth.ts` for project-scoped routes -- handles auth, team lookup, project ID parsing, and error responses automatically

```typescript
// Pattern: API route with withProjectAuth (base context)
export const GET = withProjectAuth(
  async (req, { team, projectId }) => {
    // Handler logic -- auth/team/projectId already validated
    return NextResponse.json({ data });
  }
);

// Pattern: API route with project fetching (extended context)
export const PUT = withProjectAuth(
  async (req, { user, team, projectId, project }) => {
    return NextResponse.json(project);
  },
  { withProject: true }
);
```

**Agent Functions:**
- LLM agent functions use `try/catch` with fallback values
- Return a sensible default on failure rather than throwing (e.g., `getDefaultTechStack()` in `lib/langchain/agents/tech-stack-agent.ts`)
- Log errors with `console.error('Agent name error:', error)`

**Validation:**
- Use Zod `.safeParse()` for request body validation -- never throw on invalid input
- Return structured error details: `{ error: 'Validation failed', details: parsed.error.errors }`

```typescript
// Pattern: Zod validation in routes
const parsed = createProjectSchema.safeParse(body);
if (!parsed.success) {
  return NextResponse.json(
    { error: 'Validation failed', details: parsed.error.errors },
    { status: 400 }
  );
}
```

**Middleware:**
- `middleware.ts` catches all errors and deletes invalid session cookies
- Redirects to `/sign-in` for protected routes when auth fails
- Sets OWASP security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, etc.)

## Logging

**Framework:** `console` (no structured logging library)

**Patterns:**
- `console.error('Context:', error)` for error conditions
- No `console.log` for production paths (debug only)
- Error messages include context prefix: `'Tech stack recommendation error:'`, `'API route error:'`, `'Error creating project:'`

## Comments

**When to Comment:**
- Module-level JSDoc block at top of agent files explaining purpose, pattern, and team ownership
- Section separators using `// ============================================================` lines with section titles
- Inline comments for non-obvious logic or "why" explanations
- `@ts-expect-error` always accompanied by a comment explaining the reason

**JSDoc/TSDoc:**
- Use `@module` tag for test files: `@module graphs/__tests__/analyze-response.test.ts`
- Use `@param` and `@returns` for public API functions
- Use `@example` blocks in utility and HOF documentation (see `lib/api/with-project-auth.ts`, `lib/utils/vision.ts`)
- Module-level doc comments: Purpose, Pattern, Team assignment (see `lib/langchain/agents/tech-stack-agent.ts`)

```typescript
/**
 * Tech Stack Recommendation Agent (Phase 9.3)
 *
 * Purpose: Recommend technology choices based on project context
 * Pattern: Structured output with Zod schema validation
 * Team: AI/Agent Engineering (Agent 3.1: LangChain Integration Engineer)
 */
```

**Section Separators:**
```typescript
// ============================================================
// Context Interface
// ============================================================
```

## Function Design

**Size:** Functions are generally short (10-40 lines). Agent functions with prompts are longer but the prompt template is separated from logic.

**Parameters:**
- Use named context objects for functions with 3+ params: `TechStackContext`, `UserStoriesContext`
- Destructure parameters in function signature: `async (req, { team, projectId }) =>`
- Optional params with defaults: `options: { temperature?: number; maxTokens?: number } = {}`

**Return Values:**
- API routes always return `NextResponse.json()` -- never throw
- Database queries return `null` for "not found" (not undefined, not throw)
- Validation functions return `T | null` (parsed data or null): `validateTechStack(data): TechStackModel | null`
- Boolean helpers return `boolean` directly
- String utilities handle null/undefined gracefully: `stripVisionMetadata(null)` returns `''`

## Module Design

**Exports:**
- Named exports for all modules (no default exports except Next.js pages/layouts)
- Next.js pages use `export default function PageName()`
- API route files export named `GET`, `POST`, `PUT`, `DELETE` functions
- Test helper functions are not exported -- defined locally within test files

**Barrel Files:**
- Used in tool directories: `lib/mcp/tools/core/index.ts`, `lib/mcp/tools/generators/index.ts`
- Used for E2E pages: `tests/e2e/pages/index.ts`
- Schema exports from `lib/db/schema.ts` include both tables and type definitions
- Not used for components -- import directly from component files

## Constants Pattern

**Location:** `lib/constants/index.ts`

**Pattern:** Group related constants into frozen objects with `as const`:

```typescript
export const LLM_DEFAULTS = {
  TIMEOUT_MS: 30000,
  MAX_TOKENS_EXTRACTION: 4000,
  TEMPERATURE_STRUCTURED: 0.2,
  TEMPERATURE_CHAT: 0.7,
} as const;
```

**When to extract:** All magic numbers should be named constants. Scoring weights, timeouts, limits, thresholds, rate limits, infrastructure costs -- all live in `lib/constants/index.ts`.

## Component Patterns

**UI Components (`components/ui/`):**
- shadcn/ui with New York style, Zinc base color, CSS variables enabled
- Use `cva` (class-variance-authority) for variant-based styling
- Use `cn()` utility from `lib/utils.ts` for conditional class merging
- Components use `React.ComponentProps<"element">` for prop types
- Support `asChild` pattern via Radix Slot

```typescript
// Pattern: shadcn/ui component with variants
const buttonVariants = cva("base-classes", {
  variants: { variant: {}, size: {} },
  defaultVariants: { variant: "default", size: "default" },
});

function Button({ className, variant, size, asChild, ...props }) {
  const Comp = asChild ? SlotPrimitive.Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
```

**Domain Components (`components/[domain]/`):**
- Mark client components with `'use client'` directive at top of file
- Props interfaces defined with `export interface` at top of file, named `ComponentNameProps`
- Use SWR for client-side data fetching: `useSWR<Type>('/api/endpoint', fetcher)`
- Responsive design with mobile-first Tailwind: `'gap-3 md:gap-4'`
- Use CSS variables for theme-aware colors: `style={{ color: 'var(--text-primary)' }}`
- Accessibility: Include `role`, `aria-live`, `aria-label` on dynamic status elements

```typescript
// Pattern: Education component with accessibility
<div
  role="status"
  aria-live="polite"
  aria-label="AI is processing"
>
  {/* content */}
</div>
```

**Server Components (default):**
- Pages and layouts are server components by default
- No `'use client'` directive needed
- Can directly call database queries and server-side functions

## Data Fetching Patterns

**Server Components:**
- Direct database queries in server components and server actions
- Use `getUser()` from `lib/db/queries.ts` for session-based user lookup
- SWR fallback data pre-loaded in root layout for `/api/user` and `/api/team`

```typescript
// Pattern: Root layout SWR prefetch (app/layout.tsx)
<SWRConfig value={{
  fallback: {
    '/api/user': getUser(),
    '/api/team': getTeamForUser()
  }
}}>
```

**Client Components:**
- SWR for data fetching: `const { data } = useSWR<User>('/api/user', fetcher)`
- Fetcher function: `const fetcher = (url: string) => fetch(url).then((res) => res.json())`
- Toast notifications via Sonner: `toast.error('message')`

**Server Actions:**
- Located in `app/(login)/actions.ts`
- Use `'use server'` directive
- Use `validatedAction()` and `validatedActionWithUser()` HOFs from `lib/auth/middleware.ts`
- Accept `(prevState: ActionState, formData: FormData)` signature for form integration
- Return `{ error: string }` or `{ success: string }` -- never throw on user errors

```typescript
// Pattern: Validated server action
export const signIn = validatedAction(signInSchema, async (data, formData) => {
  const { email, password } = data;
  // ... logic
  return { error: 'Invalid email or password.' };
});
```

## Database Patterns

**ORM:** Drizzle ORM with `postgres` driver (not `pg`)

**Schema Location:** `lib/db/schema.ts` (single file with all tables, relations, types, enums)

**Connection:** `lib/db/drizzle.ts` -- connection pooling (max 10, idle timeout 20s), SSL in production

**Query Patterns:**
```typescript
// Pattern: Relational query with joins
const project = await db.query.projects.findFirst({
  where: and(eq(projects.id, projectId), eq(projects.teamId, team.id)),
  with: {
    createdByUser: { columns: { id: true, name: true, email: true } },
    projectData: true,
    artifacts: true,
    conversations: { orderBy: (c, { asc }) => [asc(c.createdAt)], limit: 50 },
  },
});

// Pattern: Insert with returning
const [project] = await db.insert(projects).values(newProject).returning();

// Pattern: Update with returning
const [updatedProject] = await db.update(projects)
  .set(updates)
  .where(eq(projects.id, projectId))
  .returning();
```

**Validation Schemas:** `lib/db/schema/v2-validators.ts` -- Zod schemas for JSONB field validation (use cases, tech stack, database schema, API spec, etc.)

**Type Pattern:** Export both `$inferSelect` and `$inferInsert` types for every table:
```typescript
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
```

**Enum Constants:** Export as `const` arrays with derived types for DB columns:
```typescript
export const PROJECT_TYPES = ['saas', 'mobile-app', ...] as const;
export type ProjectType = typeof PROJECT_TYPES[number];
```

## Agent Patterns

**Location:** `lib/langchain/agents/` (one file per agent)

**LLM Configuration:** Centralized in `lib/langchain/config.ts`:
- Pre-configured instances: `llm`, `streamingLLM`, `extractionLLM`, `structuredLLM`, `cheapLLM`
- `createClaudeAgent()` factory for structured output agents with Zod schema validation
- Temperature: 0.2 for structured/deterministic, 0.7 for conversational
- Model tiers: Sonnet 4 (default), Haiku 3.5 (cheap tasks), Opus 4 (most capable)

**Agent Function Pattern:**
```typescript
// 1. Define context interface
export interface TechStackContext {
  projectName: string;
  projectVision: string;
  useCases: Array<{ name: string; description: string }>;
}

// 2. Create structured LLM with Zod validation
const structuredLLM = createClaudeAgent(techStackModelSchema, 'recommend_tech_stack', {
  temperature: 0.3,
});

// 3. Define prompt template
const prompt = PromptTemplate.fromTemplate(`...`);

// 4. Main function with try/catch and fallback
export async function recommendTechStack(context: TechStackContext): Promise<TechStackModel> {
  try {
    const promptText = await prompt.format({ ... });
    const result = await structuredLLM.invoke(promptText);
    return { ...result, generatedAt: new Date().toISOString() };
  } catch (error) {
    console.error('Tech stack recommendation error:', error);
    return getDefaultTechStack(context.projectName);
  }
}

// 5. Helper functions: validators, mergers, getters
export function validateTechStack(data: unknown): TechStackModel | null { ... }
```

**Knowledge Bank Integration:** Agents import educational content from `lib/education/generator-kb.ts` and inject it into prompt templates via `${getTechStackKnowledge()}`.

**Graph Pattern (LangGraph):**
- Graph definitions in `lib/langchain/graphs/`
- State type in `lib/langchain/graphs/types.ts`
- Node functions in `lib/langchain/graphs/nodes/`
- Edge/routing functions in `lib/langchain/graphs/edges.ts`
- Artifact phase sequence: `context_diagram` -> `use_case_diagram` -> `scope_tree` -> `ucbd` -> `requirements_table` -> `constants_table` -> `sysml_activity_diagram`

## State Management

**Client-Side State:**
- `useState` for component-local state
- SWR for server state (`useSWR`)
- Vercel AI SDK `useChat` for chat state in `components/chat/chat-window.tsx`
- Custom hooks in `lib/hooks/` for responsive detection (`useIsMobile()`, `useIsDesktop()`)

**Server State:**
- Next.js cookies for session management (JWT in `session` cookie)
- Database as single source of truth for project/user state
- LangGraph checkpoints stored in `graph_checkpoints` table for intake state persistence

**Form State:**
- Server actions with `useActionState` for auth forms
- `ActionState` type: `{ error?: string; success?: string; [key: string]: any }`

## Environment Validation

**Pattern:** Zod schema validates all env vars at import time in `lib/config/env.ts`:
- App will not start if any required env var is missing or invalid
- Custom `.refine()` validators for API key format checks (`sk-ant-`, `sk_`, `whsec_`)
- Export typed `env` object for use throughout codebase
- Required: `POSTGRES_URL`, `AUTH_SECRET` (32+ chars), `ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `BASE_URL`
- Optional: `RESEND_API_KEY`, `NODE_ENV` (defaults to `development`)

## Education Content Pattern

**Knowledge Banks:** `lib/education/knowledge-bank.ts` (types and hardcoded content for 6 KB steps)
- Types: `ThinkingMessage`, `TooltipTerm`, `ValidationError`, `KnowledgeBankEntry`
- Steps: `context-diagram`, `use-case-diagram`, `scope-tree`, `ucbd`, `functional-requirements`, `sysml-activity-diagram`

**Generator Knowledge Banks:** `lib/education/generator-kb.ts` (content for generator agents: tech-stack, schema, api-spec, infrastructure, guidelines)

**Phase Mapping:** `lib/education/phase-mapping.ts` (maps between KB steps and LangGraph artifact phases)

**UI Components:**
- `components/education/thinking-state.tsx` -- animated cycling messages during AI processing
- `components/education/tooltip-term.tsx` -- inline term definitions

---

*Convention analysis: 2026-02-08*
